var validate = require("validate.js");
var util = require('./utility');
var validators = function() {
  this.aaa = "11";
};

validators.prototype.required = function(obj) {
  if(typeof obj === 'undefined' || obj === null) {
      return util.constructValidationMessage(false, "Type is required");
  }
  return true;
};

validators.prototype.isTimeUuid = function(obj) {
  if(typeof obj !== 'undefined') {
    var val = obj.toString();
    var dashes = val.split("-");
    var totalChar = val.length;
    if(dashes.length != 5 || totalChar != 36) {
      return util.constructValidationMessage(false, "Type is not a TIMEUuid");
    }
  }
  return true;
};

validators.prototype.isString = function(obj) {
  if(typeof obj !== 'undefined') {
    var val = validate.isString(obj);
    if (!val) {
      return util.constructValidationMessage(val, "Type is not a string");
    }
  }
  return true;
};

validators.prototype.isDate = function(obj) {
  if(typeof obj !== 'undefined') {
    if(obj._isAMomentObject) {
      return true;
    }
    //TODO: fix validation
    /*var val = validate.isDate(obj);
    if (!val) {
      return util.constructValidationMessage(val, "Type is not a date");
    }*/
  }
  return true;
};

validators.prototype.isBoolean = function(obj) {
  if(typeof obj !== 'undefined') {
    if(typeof obj === 'boolean')
      return true;
    if(obj.toString){
      var val = obj.toString();
      if(!(val === 'true' || val === 'false'))
        return util.constructValidationMessage(false, "Type is not a boolean");
    }
    else {
      return util.constructValidationMessage(false, "Type is not a boolean");
    }
  }
  return true;
};

validators.prototype.isInt32 = function(obj) {
  if(typeof obj !== 'undefined') {
    var val = validate.isInteger(obj);
    if (!val) {
      return util.constructValidationMessage(val, "Type is not a date");
    }
    if(obj > 2147483647 || obj < -2147483647) {
      return util.constructValidationMessage(false, "Int Exceeds 32-bits");
    }

  }
  return true;
};

validators.prototype.isInt64 = function(obj) {
  if(typeof obj !== 'undefined') {
    var val = validate.isInteger(obj);
    if (!val) {
      return util.constructValidationMessage(val, "Type is not a Int64");
    }
  }
  return true;
};

module.exports = new validators();