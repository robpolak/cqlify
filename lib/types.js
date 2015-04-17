var moment = require('moment');
var validator = require('./validator');
var util = require('./utility');
var cassandra = require('cassandra-driver');

function types(){


}

types.prototype.getTimeUUID = function() {
  return cassandra.types.TimeUuid;
}

types.prototype.TIMEUUID = function() {
  var validators = [
    validator.isTimeUUID
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
    validate: validate
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
    validate: validate
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
    validate: validate
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
    validate: validate
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
    validate: validate
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
    validate: validate
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
    validate: validate
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
    validate: validate
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
    validate: validate
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

}();

types.prototype.CLUSTER_KEY = function() {

}();

types.prototype.INDEX = function() {

}();
module.exports = new types();
