var moment = require('moment');

function types(){

}

types.prototype.TIMEUUID = function() {
  function toCQLString(obj) {
    return obj;
  }
  return {
    toCQLString: toCQLString
  };
}();

types.prototype.COUNTER = function() {
  function toCQLString(obj) {
    return obj;
  }
  return {
    toCQLString: toCQLString
  };
}();

types.prototype.TEXT = function() {
  function toCQLString(obj) {
    return obj;
  }
  return {
    toCQLString: toCQLString
  };
}();

types.prototype.TIMESTAMP = function() {
  function toCQLString(obj, insert) {
    return moment(obj).format();
  }
  return {
    toCQLString: toCQLString
  };
}();

types.prototype.INT = function() {
  function toCQLString(obj) {
    return obj;
  }
  return {
    toCQLString: toCQLString
  };
}();

types.prototype.BOOLEAN = function() {
  function toCQLString(obj) {
    return obj;
  }
  return {
    toCQLString: toCQLString
  };
}();

types.prototype.BIGINT = function() {
  function toCQLString(obj) {
    return obj;
  }
  return {
    toCQLString: toCQLString
  };
}();

types.prototype.UUID = function() {
  function toCQLString(obj) {
    return obj;
  }
  return {
    toCQLString: toCQLString
  };
}();

types.prototype.JSONTOTEXT = function() {

  function toCQLString(obj) {
    return JSON.stringify(obj);
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
    toObject: toObject
  };
}();

types.prototype.ENUMTOTEXT = function() {
  function toCQLString(obj) {
    return obj.value;
  }
  function toObject(obj,type, schema) {
    return schema.enumerator.FromValue(obj);
  }
  return {
    toCQLString: toCQLString,
    toObject: toObject
  };
}();

types.prototype.PRIMARY_KEY = function() {

}();

types.prototype.CLUSTER_KEY = function() {

}();

types.prototype.INDEX = function() {

}();
module.exports = new types();
