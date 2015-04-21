var moment = require('moment');
var validator = require('./validator');
var util = require('./utility');
var cassandra = require('cassandra-driver');

function types(){


}

types.prototype.getTimeUuid = function() {
  return cassandra.types.TimeUuid;
}

types.prototype.TIMEUUID = function() {
  var validators = [
    validator.isTimeUuid
  ];

  function validate(obj, userValidators) {
    var vArr = validators.concat(userValidators);
    var result = util.validateAll(obj, vArr);
    return result;
  }
  function toCQLString(obj) {
    return obj;
  }
  return {
    toCQLString: toCQLString,
    validate: validate,
    type_name:'Time UUID'
  };
}();

types.prototype.COUNTER = function() {
  var validators = [

  ];
  function validate(obj, userValidators) {
    var vArr = validators.concat(userValidators);
    var result = util.validateAll(obj, vArr);
    return result;
  }
  function toCQLString(obj) {
    return obj;
  }
  return {
    toCQLString: toCQLString,
    validate: validate,
    type_name:'Counter'
  };
}();

types.prototype.TEXT = function() {
  var validators = [
    validator.isString
  ];
  function toCQLString(obj) {
    return obj;
  }
  function validate(obj, userValidators) {
    var vArr = validators.concat(userValidators);
    var result = util.validateAll(obj, vArr);
    return result;
  }
  return {
    toCQLString: toCQLString,
    validate: validate,
    type_name:'Text'
  };
}();

types.prototype.TIMESTAMP = function() {
  var validators = [
    validator.isDate
  ];

  function toCQLString(obj, insert) {
    return moment(obj).format();
  }
  function validate(obj, userValidators) {
    var vArr = validators.concat(userValidators);
    var result = util.validateAll(obj, vArr);
    return result;
  }
  return {
    toCQLString: toCQLString,
    validate: validate,
    type_name:'Time Stamp'
  };
}();

types.prototype.INT = function() {
  var validators = [
    validator.isInt32
  ];
  function toCQLString(obj) {
    return obj;
  }
  function validate(obj, userValidators) {
    var vArr = validators.concat(userValidators);
    var result = util.validateAll(obj, vArr);
    return result;
  }
  return {
    toCQLString: toCQLString,
    validate: validate,
    type_name:'Integer32'
  };
}();

types.prototype.BOOLEAN = function() {
  var validators = [
    validator.isBoolean
  ];

  function toCQLString(obj) {
    return obj;
  }
  function validate(obj, userValidators) {
    var vArr = validators.concat(userValidators);
    var result = util.validateAll(obj, vArr);
    return result;
  }
  return {
    toCQLString: toCQLString,
    validate: validate,
    type_name:'Boolean'
  };
}();

types.prototype.BIGINT = function() {
  var validators = [
    validator.isInt64
  ];

  function toCQLString(obj) {
    return obj;
  }
  function validate(obj, userValidators) {
    var vArr = validators.concat(userValidators);
    var result = util.validateAll(obj, vArr);
    return result;
  }
  return {
    toCQLString: toCQLString,
    validate: validate,
    type_name:'Big Int'
  };
}();

types.prototype.UUID = function() {
  var validators = [

  ];

  function toCQLString(obj) {
    return obj;
  }
  function validate(obj, userValidators) {
    var vArr = validators.concat(userValidators);
    var result = util.validateAll(obj, vArr);
    return result;
  }
  return {
    toCQLString: toCQLString,
    validate: validate,
    type_name:'UUID'
  };
}();

types.prototype.JSONTOTEXT = function() {
  var validators = [

  ];

  function toCQLString(obj) {
    return JSON.stringify(obj);
  }
  function validate(obj, userValidators) {
    var vArr = validators.concat(userValidators);
    var result = util.validateAll(obj, vArr);
    return result;
  }
  function toObject(obj) {
    try {
      return JSON.parse(obj);
    }
    catch(err){
      throw "Failed to convert to json: "+ err;
    }
  }
  return {
    toCQLString: toCQLString,
    toObject: toObject,
    validate: validate,
    type_name:'JSON to Text'
  };
}();

types.prototype.MAP = function() {
  var validators = [

  ];

  function toCQLString(obj) {
    return obj.toJSON();
  }
  function validate(obj, userValidators) {
    var vArr = validators.concat(userValidators);
    var result = util.validateAll(obj, vArr);
    return result;
  }
  function toObject(obj) {
    try {
      return obj.toObject();
    }
    catch(err){
      throw "Failed to convert to json: "+ err;
    }
  }
  return {
    toCQLString: toCQLString,
    toObject: toObject,
    validate: validate,
    type_name:'MAP'
  };
}();

types.prototype.LIST= function() {
  var validators = [

  ];

  function toCQLString(obj) {
    return obj.toObject();
  }
  function validate(obj, userValidators) {
    var vArr = validators.concat(userValidators);
    var result = util.validateAll(obj, vArr);
    return result;
  }
  function toObject(obj) {
    try {
      return obj.toObject();
    }
    catch(err){
      throw "Failed to convert to json: "+ err;
    }
  }
  return {
    toCQLString: toCQLString,
    toObject: toObject,
    validate: validate,
    type_name:'List'
  };
}();

types.prototype.ENUMTOTEXT = function() {
  var validators = [

  ];

  function toCQLString(obj) {
    return obj.value;
  }
  function validate(obj, userValidators) {
    var vArr = validators.concat(userValidators);
    var result = util.validateAll(obj, vArr);
    return result;
  }
  function toObject(obj,type, schema) {
    return schema.enumerator.FromValue(obj);
  }
  return {
    toCQLString: toCQLString,
    toObject: toObject,
    validate: validate
  };
}();

types.prototype.PRIMARY_KEY = function() {
  return {
    value: 1,
    type_name:'Primary Key'
  }
}();

types.prototype.CLUSTER_KEY = function() {
  return {
    value: 2,
    type_name:'Cluster Key'
  }
}();

types.prototype.INDEX = function() {
  return {
    value: 3,
    type_name:'Index'
  }
}();
module.exports = new types();
