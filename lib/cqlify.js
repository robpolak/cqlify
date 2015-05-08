var cassandra = require('cassandra-driver');
var types = require('./types');
var modelObj = require('./model');
var comparer = require('./comparer');
var util = require('./utility');
var instance = require('./instance');
var query = require('./query');

function cqlify() {
  this._connected = false;
  this._errorState = false;
  this._connectionOptions = null;
  this._connection = null;
};

cqlify.prototype.createConnection = function(options) {
  this._connectionOptions = options;//fetchSize:
  this._connectionOptions.cqlify || (this._connectionOptions.cqlify = {});
  this._connectionOptions.cqlify.fetchSize || (this._connectionOptions.cqlify.fetchSize = 5000);
  this.connect();
}
cqlify.prototype.model = function(schema, opts) {
  if(!schema)
    throw "No Schema Provided";

  var toRet = modelObj.createModel(schema, this, opts);
  return toRet;
};
cqlify.prototype.rawQuery = function(sql,params, done) {
  if(!this._connection)
    throw "Must call cqlify.createConnection(options)";
  var queryObj = new query({},{});
  queryObj.rawQuery(sql, params, this._connection, done);
};

cqlify.prototype.connect  = function() {
  var self = this;
  if(!this._connectionOptions)
    throw "Must specify cassandra connection options, please call cqlify.createConnection(options)";

  this._connection = new cassandra.Client(this._connectionOptions);
  this._connection.connect(function(err, result) {
    if(err) {
      self._errorState = true;
      throw err;
    }
    else {
      self._connected = true;
    }
  });
};

cqlify.prototype.connection  = function() {
  if(!this._connection) {
    this.connect();
  }
  return this._connection;
}

Object.defineProperty(cqlify.prototype, "instance", {
  get: function myProperty() {
    return instance;
  }
});


Object.defineProperty(cqlify.prototype, "types", {
  get: function myProperty() {
    return types;
  }
});

Object.defineProperty(cqlify.prototype, "comparer", {
  get: function myProperty() {
    return comparer;
  }
});

Object.defineProperty(cqlify.prototype, "util", {
  get: function myProperty() {
    return util;
  }
});


Object.defineProperty(cqlify.prototype, "client", {
  get: function myProperty() {
    return this.connection();
  }
});


module.exports = new cqlify;