describe('Utility Tests', function() {
  var util = require('../../lib/utility');

  var expect = require('chai').expect;

  beforeEach(function () {
  });

  afterEach(function () {

  });

  describe('isFunction', function() {
    it('Is a function', function() {
      expect(util.isFunction).to.be.a('function');
    });

    it('identifies a function', function() {
      expect(util.isFunction(function(){})).to.equal(true);
    });

    it('excludes an object', function() {
      expect(util.isFunction({})).to.equal(false);
    });

    it('excludes native type', function() {
      expect(util.isFunction(2)).to.equal(false);
    });

    it('excludes null type', function() {
      expect(util.isFunction(null)).to.equal(false);
    });
  })
});