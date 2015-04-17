var validate = require("validate.js");
var util = require('./utility');
var validators = function() {
  this.aaa = "11";
};

validators.prototype.notNull = function(obj) {
  if(!obj) {
      return util.constructValidationMessage(val, "Type cannot be null");
  }
};

validators.prototype.isTimeUUID = function(obj) {
  if(obj) {
    var val = obj.toString();
    var dashes = val.split("-");
    var totalChar = val.length;
    if(dashes.length != 5 || totalChar != 36) {
      return util.constructValidationMessage(val, "Type is not a TIMEUUID");
    }
  }
};

validators.prototype.isString = function(obj) {
  if(obj) {
    var val = validate.isString(obj);
    if (!val) {
      return util.constructValidationMessage(val, "Type is not a string");
    }
  }
};

validators.prototype.isDate = function(obj) {
  if(obj) {
    var val = validate.isDate(obj);
    if (!val) {
      return util.constructValidationMessage(val, "Type is not a date");
    }
  }
};

validators.prototype.isBoolean = function(obj) {
  if(obj) {
    if(typeof obj === 'boolean')
      return;
    if(obj.toString){
      var val = obj.toString();
      if(!(val === 'true' || val === 'false'))
        return util.constructValidationMessage(val, "Type is not a boolean");
    }
    else {
      return util.constructValidationMessage(val, "Type is not a boolean");
    }
  }
};

validators.prototype.isInt32 = function(obj) {
  if(obj) {
    var val = validate.isInteger(obj);
    if (!val) {
      return util.constructValidationMessage(val, "Type is not a date");
    if(obj > 2147483647) {
      return util.constructValidationMessage(val, "Int Exceeds 32-bits");
    }

    }
  }
};

validators.prototype.isInt64 = function(obj) {
  if(obj) {
    var val = validate.isInteger(obj);
    if (!val) {
      return util.constructValidationMessage(val, "Type is not a Int64");
    }
  }
};

module.exports = new validators();