var instance = require('./instance');
var _ = require('underscore');
var states = require('./states');

var model = function() {

  function createModel(schema, client, opts) {
    opts || (opts = {});
    var newInstance = new instance(schema, client, opts, states.NEW);

    return newInstance;
  }


  function hydrateModel(schema, client, opts, fromObject) {
    var model = createModel(schema, client, opts);
    model._setState(states.UPDATE);

    for (var property in schema) {
      if(fromObject[property]) {
        model[property] = _toObject(fromObject[property], schema[property]);
      }
    }
    return model;
  }


  function _toObject(prop, schema) {
    if(schema.type.toObject) {
      return schema.type.toObject(prop, schema.type, schema);
    }
    else
      return prop;
  }


  return {
    createModel: createModel,
    hydrateModel: hydrateModel
  };
};

module.exports = model;