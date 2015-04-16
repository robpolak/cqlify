var validate = require("validate.js");
var util = require('./utility');
var validators = function() {
  this.aaa = "11";
};



validators.prototype.isString = function(obj) {
  var val = validate.isString(obj);
  if(!val) {
    return util.constructMessage(val, "Type is not a string");
  }
};

module.exports = new validators();