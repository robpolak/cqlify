var cassandra = require('cassandra-driver');
var types = require('./types');
var modelObj = require('./model');
var states = require('./states');
var comparer = require('./comparer');

var cqlize = function(options) {

  var client = new cassandra.Client(options);
  client.connect(function(err, result) {
    if(err) {
     throw err;
    }
    else {
      console.log('Connected.');
    }
  });


  function model(schema, opts) {
    if(!schema)
      throw "No Schema Provided";

    var toRet = modelObj().createModel(schema, client, opts);
    return toRet;
  }

  Object.defineProperty(this, "states", {
    get: function myProperty() {
      return states;
    }
  });

  Object.defineProperty(this, "types", {
    get: function myProperty() {
      return types;
    }
  });

  return {
    comparer: comparer,
    model: model
  }
};

module.exports = cqlize;