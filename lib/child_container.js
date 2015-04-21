var queryObj = require('./query');
var _ = require('underscore');
var states = require('./states');
var types = require('./types');

var child_container = function(_schema, state, _model,_parent, _parentSchema) {
  this._internalState = {
    m_state: state || state.UNKNOWN,
    m_oldState: state || state.UNKNOWN,
    m_schema: _schema,
    m_isDirty: false,
    m_tableName: state.UNKNOWN,
    m_dirtyFields: [],
    m_preActions: [],
    m_postActions: [],
    m_parentSchema: _parentSchema,
    m_parent: _parent,
    m_model: _model
  };
  this._doc = {};
  this._internalArray = [];

  for (var property in this._internalState.m_schema) {
    var schema = this._internalState.m_schema[property];
    if(schema.key_type && schema.key_type == types.PRIMARY_KEY) {
      this._internalState._primarykey = schema;
      this._internalState._primarykeyProp = property;
      break;
    }
  }

};

child_container.prototype.add = function(obj, state) {
  if(this._internalState.m_parentSchema.type === types.LIST) {
    this._internalArray.push(obj);
  }
  else {
    var instance = this._internalState.m_model.hydrateModel(this._internalState.m_schema, null, {}, obj, state);
    //var pkValue = instance[this._internalState._primarykeyProp];

    this._internalArray.push(instance);
  }
};

Object.defineProperty(child_container.prototype, "itemCount", {
  get: function myProperty() {
    return this._internalArray.length;
  }
});

child_container.prototype.addNew = function(obj) {
  return this.add(obj, states.NEW);
};

child_container.prototype.toJSON = function() {

  if(this._internalState.m_parentSchema.type === types.LIST) {
    var str = JSON.stringify(this._internalArray);
    return str;
  }
  else {
    var arr = [];
    for(var i = 0, len = this._internalArray.length; i<len; i++) {
      var item = this._internalArray[i];
      arr.push(item.toJSON());
    }
    return arr;
  }
};

child_container.prototype.toObject = function() {
  if(this._internalState.m_parentSchema.type === types.LIST) {
    return this._internalArray;
  }
  else {
    var arr = [];
    for(var i = 0, len = this._internalArray.length; i<len; i++) {
      var item = this._internalArray[i];
      arr.push(item.toObject());
    }
    return arr;
  }
};

module.exports = child_container;