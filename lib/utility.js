function Util() {

}

Util.prototype.isFunction = function(obj) {
  if(typeof obj === 'function')
    return true;
  return false;
}

module.exports = new Util();