
function state(){

}

state.prototype.UNKNOWN = function() {
  return -1;
};

state.prototype.NEW = function() {
  return 0;
};

state.prototype.UPDATE = function() {
  return 1;
};

state.prototype.DELETE = function() {
  return 2;
};

module.exports = new state();
