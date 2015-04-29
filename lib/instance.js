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

    this._stubProperties = function(state) {
      for (var property in this._internalState.m_schema) {
        var schema = this._internalState.m_schema[property];

        if(schema.type === types.MAP || schema.type === types.LIST) {
          var childModel = this._internalState.m_model.createChildModel(schema.schema, state, schema);
          var prop = property.toString();
          this._createProperty(this, prop);
          this._doc[prop] = childModel;
        }
        else {
          var prop = property.toString();
          this._createProperty(this, prop);
        }
      }
    };

    this._createProperty = function(self, prop) {
      Object.defineProperty(self, prop, {
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
      });
    };

    this._stubProperties(state);
  };
  model.prototype.__proto__ = Instance;
  model.prototype = Instance.prototype;
  model.__proto__ = Instance;

  return model;//new model(_schema, cqlify, opts, state, _model);
}

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
Instance.prototype.fromObject = function(obj) {
  for (var property in this._internalState.m_schema) {
    if(obj[property]) {
      this[property] = obj[property];
    }
  }
  this._markClean();
};



Instance.prototype.insert = function(cb) {
  this._internalState.m_query.insert(this, cb);
};

Instance.prototype.update = function(updateKeys,cb) {
  this._internalState.m_query.update(this, updateKeys, cb);
};


Instance.prototype.find = function(queryParams, cb) {
  this._internalState.m_query.find(this, queryParams, cb);
};

Instance.prototype.toObject = function() {
  var toRet = {}
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
  return JSON.stringify(this.toObject());
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


module.exports = Instance;