function Util() {

}

Util.prototype.isFunction = function(obj) {
  if(typeof obj === 'function')
    return true;
  return false;
}

Util.prototype.validateAll = function(obj, validators) {
  var toRet = {
    isValid: true,
    messages: []
  };
  for(var i = 0,len=validators.length; i < len; i++) {
    if (typeof validators[i] !== 'function')
      throw "Validator is not a function!";

    var result = validators[i](obj);
    if (result) {
      toRet.isValid = false;
      toRet.messages.push(result.messages || []);
    }
  }
  return toRet;
};

Util.prototype.constructMessage = function(isValid, message) {
  var toRet = {};
  toRet.isValid = isValid;
  toRet.messages = [];

  if(message.length) {
    toRet.messages = message;
  }
  else if(message)
    toRet.messages.push(message);
  return toRet;
};

module.exports = new Util();