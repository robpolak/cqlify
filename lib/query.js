var utility = require('./utility');
var _ = require('underscore');
var comparers = require('./comparer');
var types = require('./types');
var states = require('./states');

module.exports = function(instance, opts) {
  var m_opts = opts;

  function getInsertParmeters(obj, schema) {
    var keys = [];
    var values = [];
    for (var property in schema) {
      if (typeof obj[property] !== 'undefined') {
        var schemaItem = schema[property];
        if(schemaItem.type === types.LIST || schemaItem.type === types.MAP) {
          var container = obj._doc[property];
          if(container.itemCount && container.itemCount > 0) {
            keys.push(property);
            values.push(_writeCqlType(container, schemaItem, property));
          }
        }
        else if(schemaItem.type === types.COUNTER) {
          throw "Cannot insert counters, use update!";
        }
        else {
          keys.push(property);
          values.push(_writeCqlType(obj._doc[property], schemaItem, property));
        }
      }
    }
    return {
      keys: keys.join(','),
      values: values
    };
  }

  function getSelectParmeters(obj, schema, criteria) {
    var keys = [];
    var values = [];

    for (var i = 0, len = criteria.length; i < len; i++) {
      var property = criteria[i];
      writeSelectKey(property, schema, keys, values);

    }
    return {
      keys: keys.join(' '),
      values: values
    };
  }

  function checkValid(obj) {
    var val =obj._validate();
    if(!val)
      throw "Could not validate!";
    else {
      if(!val.isValid) {
        return false;
      }
      else {
        return true;
      }
    }
  }

  function getUpdateParmeters(obj, schema) {
    var keys = [];
    var values = [];

    for (var i = 0, len = obj._internalState.m_dirtyFields.length; i < len; i++) {
      var property = obj._internalState.m_dirtyFields[i];
      if(schema[property]) {
        writeUpdateKey(obj, property, schema, keys, values);
      }
    }
    return {
      keys: keys.join(' '),
      values: values
    };
  }

  function writeUpdateKey(obj, property, schema, keys, values) {
    var key = false;

    if (keys.length > 0)
      keys.push(' , ');

    var value = obj[property];
    var schemaValue = schema[property];
    if (!schemaValue)
      return;
    if(schemaValue.type === types.COUNTER) {
     var key = property + "=" + _writeCqlType(value,schemaValue,property);
      keys.push(key);
    }
    else {
      keys.push(property + "=?");
      values.push(_writeCqlType(value, schemaValue, property));
    }
  }

  function writeSelectKey(property, schema, keys, values) {
    var key = false;
    if (keys.length > 0)
      keys.push(' AND ');

    var comparer = property.comparer;
    var value = property.value;
    var prop = property.name;

    if (!schema[prop])
      return;
    if (!comparer)
      comparer = comparers.EQUALS;
    if (typeof property.value === 'undefined')
      throw "Value not specified";
    if (comparer === comparers.IN) {
      keys.push(prop + comparer.toCQLString(value.length));
      for (var i = 0, len = value.length; i < len; i++) {
        values.push(_writeCqlType(value[i], schema[prop], property));
      }
    }
    else {
      keys.push(prop + comparer.toCQLString() + "?");
      values.push(_writeCqlType(value, schema[prop], property));
    }

  }

  function _writeCqlType(val, schema, property) {
    return schema.type.toCQLString(val, schema, property);
  }

  function update(instance,query, cb) {
    instance._runPre();

    if(instance._internalState.m_dirtyFields.length === 0){
      if(utility.isFunction(cb)) {
        cb(null, instance);  //nothing to do.. just callback
      }
      return;
    }
    var errors = buildAndValidateQueryObj(query, instance);
    if(errors) {
      cb(errors);
      return;
    }


    if(!checkValid(instance)) {
      cb("Object is not valid!", null)
    }
    var sql = 'update [[table_name]] set [[keys]] where [[updateKeys]];';

    var params = getUpdateParmeters(instance, instance._schema);
    var allParams = params.values;
    sql = sql.replace('[[table_name]]', query.tableName);
    sql = sql.replace('[[keys]]', params.keys);
    var updateKeys = getSelectParmeters(instance, instance._schema, query.params);
    allParams = allParams.concat(updateKeys.values);

    sql = sql.replace('[[updateKeys]]', updateKeys.keys);
    instance._client.execute(sql, allParams, query.options, function(err) {
      if(err) {
        if(utility.isFunction(cb))
          cb(err);
      }
      else
      {
        //TODO: run post commands
        if(utility.isFunction(cb))
          cb(null, instance);
      }
    });
  }

  function insert(instance, query, cb) {
    var errors = buildAndValidateQueryObj(query, instance);
    if(errors) {
      cb(errors);
      return;
    }

    instance._runPre();

    if(!checkValid(instance)) {
      cb("Object is not valid!", null)
    }

    var sql = 'insert into [[table_name]] ([[keys]]) VALUES([[values]]);';
    var params = getInsertParmeters(instance, instance._schema);
    sql = sql.replace('[[table_name]]', query.tableName);
    sql = sql.replace('[[keys]]', params.keys);

    var emptyArray = new Array(params.values.length);
    sql = sql.replace('[[values]]', emptyArray.join("?,")+"?");

    instance._client.execute(sql, params.values, query.options, function(err) {
      if(err) {
        if(utility.isFunction(cb))
          cb(err);
      }
      else
      {
        instance._runPost();
        if(utility.isFunction(cb))
          cb(null, instance);
      }
    });
  }

  function buildAndValidateQueryObj(query, instance) {
    if(!query)
      throw "Query not provided.";
    query.params ||  (query.params = []); //should this throw?
    query.options || (query.options = {});
    query.options.pageState || (query.options.pageState = null);
    query.options.fetchSize || (query.options.fetchSize = getOption(instance, "fetchSize"));
    query.options.prepare = true;
    query.tableName || (query.tableName = instance._options.tableName)

    var errors = [];
    for(var i = 0, len = query.params.length;i < len; i++) {
      var param = query.params[i];
      if(!param.name)
        errors.push("Missing Parameter Name");
      if(!param.value)
        errors.push("Missing Parameter Value");

    }
    if(errors.length > 0)
      return errors;
    return null;
  }

  function findAndPage(instance, query, cb, done) {
    var errors = buildAndValidateQueryObj(query, instance);
    if(errors) {
      cb(errors);
      return;
    }

    instance._runPre();

    var sql = 'select * from [[table_name]] where [[keys]]';
    var params = getSelectParmeters(instance, instance._schema, query.params);
    sql = sql.replace('[[table_name]]', query.tableName);
    sql = sql.replace('[[keys]]', params.keys);

    instance._client.eachRow(sql, params.values, query.options, function (n, row) {
        if (utility.isFunction(cb)) {
          var model = createModel(instance, row, {}, states.UPDATE);
          model._markClean();
          model._runPost();
          cb(null, model, row);
        }
      }, function (err, result) {
        if (err) {
          if (utility.isFunction(cb))
            cb(err, null);
        }
       var pageState = result.pageState;
        if (utility.isFunction(done))
          done(err, result, pageState);
      });
  };

  function find(instance, query, cb) {
    var errors = buildAndValidateQueryObj(query, instance);
    if(errors) {
      cb(errors);
      return;
    }

    instance._runPre();

    if (!checkValid(instance)) {
      cb("Object is not valid!", null)
    }
    var sql = 'select * from [[table_name]] where [[keys]];';
    var params = getSelectParmeters(instance, instance._schema, query.params);
    sql = sql.replace('[[table_name]]', query.tableName);
    sql = sql.replace('[[keys]]', params.keys);

    instance._client.execute(sql, params.values, query.options, function (err, results) {
      if(err) {
        if(utility.isFunction(cb))
          cb(err, null);
      }
      else
      {
        if(utility.isFunction(cb)) {
          var objArray = [];
          _.each(results.rows, function(row) {
            var model = createModel(instance, row, {}, states.UPDATE);
            model._markClean();
            model._runPost();
            objArray.push(model);
          });
          cb(null, objArray, results);
        }
      }
    });
  };

  function getOption(instance, option) {
    return instance._internalState.m_cqlify._connectionOptions[option];
  }

  function createModel(instance, obj) {
    var modelObj = require('./model');
    var toRet = modelObj.hydrateModel(instance._schema, instance._internalState.m_cqlify, instance._options, obj);
    return toRet;

  }

  function rawQuery(sql,params,client, done) {
    if(sql.constructor === Array) {
      client.batch(sql, {prepare: true}, function (err) {
        done(err);
      });

    }
    else {
      client.execute(sql, params, {prepare: true}, function (err, result) {
        done(err, result);
      });
    }
  }


  return {
    insert: insert,
    find: find,
    update: update,
    rawQuery: rawQuery,
    findAndPage: findAndPage
  }
};