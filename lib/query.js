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
            values.push(_writeCqlType(container, schemaItem));
          }
        }
        else {
          keys.push(property);
          values.push(_writeCqlType(obj._doc[property], schemaItem));
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

    keys.push(property + "=?");
    values.push(_writeCqlType(value, schemaValue));
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
        values.push(_writeCqlType(value[i], schema[prop]));
      }
    }
    else {
      keys.push(prop + comparer.toCQLString() + "?");
      values.push(_writeCqlType(value, schema[prop]));
    }

  }



  function _writeCqlType(prop, schema) {
    return schema.type.toCQLString(prop);
  }

  function update(instance,updateKeys, cb) {
    if(instance._internalState.m_dirtyFields.length === 0){
      if(utility.isFunction(cb)) {
        cb(null, instance);  //nothing to do.. just callback
      }
      return;
    }
    instance._runPre();

    if(!checkValid(instance)) {
      cb("Object is not valid!", null)
    }
    var query = 'update [[table_name]] set [[keys]] where [[updateKeys]];';

    var params = getUpdateParmeters(instance, instance._schema);
    var allParams = params.values;
    query = query.replace('[[table_name]]', instance._options.tableName);
    query = query.replace('[[keys]]', params.keys);
    var updateKeys = getSelectParmeters(instance, instance._schema, updateKeys);
    allParams = allParams.concat(updateKeys.values);

    query = query.replace('[[updateKeys]]', updateKeys.keys);
    instance._connection.execute(query, allParams, {prepare: true}, function(err) {
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

  function insert(instance, cb) {
    instance._runPre();

    if(!checkValid(instance)) {
      cb("Object is not valid!", null)
    }

    var query = 'insert into [[table_name]] ([[keys]]) VALUES([[values]]);';
    var params = getInsertParmeters(instance, instance._schema);
    query = query.replace('[[table_name]]', instance._options.tableName);
    query = query.replace('[[keys]]', params.keys);

    var emptyArray = new Array(params.values.length);
    query = query.replace('[[values]]', emptyArray.join("?,")+"?");

    instance._client.execute(query, params.values, {prepare: true}, function(err) {
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

  function find(instance, queryParams, cb) {
    instance._runPre();

    if(!checkValid(instance)) {
      cb("Object is not valid!", null)
    }
    var query = 'select * from [[table_name]] where [[keys]];';
    var params = getSelectParmeters(instance, instance._schema, queryParams);
    query = query.replace('[[table_name]]', instance._options.tableName);
    query = query.replace('[[keys]]', params.keys);

    instance._client.execute(query, params.values, {prepare: true}, function(err, results) {
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
  }

  function createModel(instance, obj) {
    var modelObj = require('./model');
    var toRet = modelObj.hydrateModel(instance._schema, instance._options.client, instance._options, obj);
    return toRet;

  }

  return {
    insert: insert,
    find: find,
    update: update,
  }
};