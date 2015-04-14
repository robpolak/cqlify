function types(){

}

types.prototype.EQUALS= function() {
  function toCQLString(obj) {
    return " = ";
  }
  return {
    toCQLString: toCQLString,
    value:0
  };
}();


types.prototype.GREATER_THAN = function() {
  function toCQLString() {
    return " > ";
  }
  return {
    toCQLString: toCQLString,
    value:1
  };
}();

types.prototype.LESS_THAN = function() {
  function toCQLString() {
    return " < ";
  }
  return {
    toCQLString: toCQLString,
    value:2
  };
}();

types.prototype.IN = function() {
  function toCQLString(count) {
    var valArry = new Array(count).join("?,")+"?";
    return " IN ("+valArry+") ";
  }
  return {
    toCQLString: toCQLString,
    value:3
  };
}();

module.exports = new types();