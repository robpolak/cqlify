var queryObj = require('./query');
var _ = require('underscore');
var states = require('./states');
var types = require('./types');

var Instance = function() {

};

Instance.prototype._compile =  function(_schema, cqlify, opts, state, _model) {
  var model = function() {
    this._internalState = {
      m_cqlify: cqlify,
      m_state: state || state.UNKNOWN,
      m_oldState: state || state.UNKNOWN,
      m_schema: _schema,
      m_isDirty: false,
      m_opts: opts,
      m_tableName: state.UNKNOWN,
      m_dirtyFields: [],
      m_preActions: [],
      m_postActions: [],
      m_model : _model
    };

    this._internalState.m_query = queryObj(this, {
      tableName: this._internalState.m_tableName
    });
    this._doc = {};

    if (opts && opts.pre)
      this._pre(opts.pre);

    if (opts && opts.post)
      this._post(opts.post);

    if (!(this instanceof model))
      return new model();

    this._init();
    var x= 0;
  };
  model.prototype.__proto__ = Instance;
  model.prototype = Instance.prototype;
  model.__proto__ = Instance;

  return model;//new model(_schema, cqlify, opts, state, _model);
};

Instance.prototype._init = function() {
  var props = {};

  for (var property in this._internalState.m_schema) {
    props[property] = this._stubFunc(property);
    this._stubProperty(property);
  }
  this._createProperties(props);
};

Instance.prototype._stubFunc = function(prop){
  return {
    get: function () {
      return this._doc[prop];
    },
    set: function (value) {
      if (!_.isEqual(this._doc[prop],value)) {
        this._internalState.m_isDirty = true;
        this._internalState.m_dirtyFields.push(prop);
        this._doc[prop] = value;
      }
    }
  };
};

Instance.prototype._stubProperty = function(property) {
  var schemaItem = this._internalState.m_schema[property];
  if (schemaItem.type === types.MAP || schemaItem.type === types.LIST) {
    var childModel = this._internalState.m_model.createChildModel(schemaItem.schema, this._internalState.m_state, schemaItem);
    this._doc[property] = childModel;
  }

  if (this._internalState.m_opts && this._internalState.m_opts.fromObject && this._internalState.m_opts.fromObject[property]) {
    var val = this._internalState.m_opts.fromObject[property];
    this._loadProperty(schemaItem, property,val);
  }
};

Instance.prototype._loadProperty = function(schemaItem, property, value) {
  if (schemaItem.type === types.MAP) {
    for (var item in value) {
      var obj = value[item];
      if(obj && typeof obj === 'string') {
        this._doc[property].add(JSON.parse(obj));
      }
      else if(obj && typeof obj === 'object'){
        this._doc[property].add(obj);
      }
    }
  }
  else if (schemaItem.type === types.LIST) {
    var arr = value;
    for (var x = 0, len = arr.length; x < len; x++) {
      this._doc[property].add(arr[x], this._internalState.m_state);
    }
  }
  else {
    this._doc[property] = this._toObject(value, schemaItem);
  }
};

Instance.prototype._toObject = function(prop, schema) {
  if(schema.type.toObject) {
    return schema.type.toObject(prop, schema.type, schema);
  }
  else
    return prop;
};

Instance.prototype._createProperties = function(props) {
  Object.defineProperties(this, props);
};

Instance.prototype._createProperty = function(self, prop) {

  var func = {
    get: function () {
      return self._doc[prop];
    },
    set: function (value) {
      if(self._doc[prop] !== value) {
        self._internalState.m_isDirty = true;
        self._internalState.m_dirtyFields.push(prop);
        self._doc[prop] = value;
      }
    }
  };
  Object.defineProperty(this, {"a1":func},{"a2":func},{"a3": func});

  /*this[prop] = {};
  this[prop].get = func.get;
  this[prop].set = func.set;*/

};

Instance.prototype._markClean = function() {
  this._internalState.m_isDirty = false;
  this._internalState.m_dirtyFields = [];
}

Instance.prototype._pre = function(func) {
  this._internalState.m_preActions.push(func);
};

Instance.prototype._post = function(func) {
  this._internalState.m_postActions.push(func);
}

Instance.prototype._runPre = function() {
  for (var i = 0, len = this._internalState.m_preActions.length; i < len; i++) {
    var action = this._internalState.m_preActions[i];
    action(this);
  }
};

Instance.prototype._runPost = function() {
  for (var i = 0, len = this._internalState.m_postActions.length; i < len; i++) {
    var action = this._internalState.m_postActions[i];
    action(this);
  }
};

Instance.prototype._validate = function() {
  var toRet = {
    isValid:true,
    properties: []
  };
  for (var property in this._schema) {
    var s_prop = this._schema[property];
    var o_prop = this[property];
    if(s_prop.type.validate) {
      var valResult = s_prop.type.validate(o_prop,s_prop.validators || []);
      if(!valResult.isValid) {
        toRet.isValid = false;
        var prop = {
          name: property,
          messages: valResult.messages || []
        }
        toRet.properties.push(prop);

      }
    }
  }
  return toRet;
};

Instance.prototype._setState = function(newState) {
  this._internalState.m_oldState = this._internalState.m_state;
  this._internalState.m_state = newState;
};

Object.defineProperty(Instance.prototype, "_client", {
  get: function myProperty() {
    return this._internalState.m_cqlify.client;
  }
});

Object.defineProperty(Instance.prototype, "_schema", {
  get: function myProperty() {
    return this._internalState.m_schema;
  }
});

Object.defineProperty(Instance.prototype, "_options", {
  get: function myProperty() {
    return this._internalState.m_opts;
  }
});

/*
*
* Public methods
*
* */
Instance.prototype.insert = function(query, cb) {
  this._internalState.m_query.insert(this,query, cb);
};

Instance.prototype.update = function(query,cb) {
  this._internalState.m_query.update(this, query, cb);
};

Instance.prototype.find = function(query, cb) {
  this._internalState.m_query.find(this, query, cb);
};

Instance.prototype.findAndPage = function(query, cb, done) {
  this._internalState.m_query.findAndPage(this, query, cb, done);
};

Instance.prototype.toObject = function() {
  var toRet = {};
  for (var property in this._internalState.m_schema) {
    var prop = this[property];
    if(prop && prop.toObject) {
      prop = prop.toObject();
    }
    toRet[property] = prop;
  }
  return toRet;
};

Instance.prototype.toJSON = function() {
  return this.toObject();
};

Object.defineProperty(Instance.prototype, "isNew", {
  get: function myProperty() {
    return this._internalState.m_state == states.NEW;
  }
});

Object.defineProperty(Instance.prototype, "isDirty", {
  get: function myProperty() {
    return this._internalState.m_isDirty;
  }
});

Instance.prototype.fromObject = function(obj) {
  for (var property in this._internalState.m_schema) {
    var val = obj[property];
    if(val) {
      var schemaItem = this._internalState.m_schema[property];
      this._loadProperty(schemaItem, property,val);
    }

  }
};

module.exports = Instance;