
function state(){

}

state.prototype.UNKNOWN = function() {
  return {
    value: -1,
    state_name: "Unknown"
  };
};

state.prototype.NEW = function() {
  return {
    value: -1,
    state_name: "New"
  };
};

state.prototype.UPDATE = function() {
  return {
    value: -1,
    state_name: "Update"
  };
};

state.prototype.DELETE = function() {
  return {
    value: -1,
    state_name: "Delete"
  };
};

module.exports = new state();
