describe('Comparer Tests', function() {
  var comparer = require('../../../lib/comparer');
  var expect = require('chai').expect;
  beforeEach(function () {
  });

  afterEach(function () {

  });


  describe('Equals', function() {

    it('Is an OBJECT', function() {
       expect(comparer.EQUALS).to.be.a('object');
    });

    it('Returns correct string', function() {
      expect(comparer.EQUALS.toCQLString()).to.equal(' = ');
    });
  });

  describe('Greater Than', function() {

    it('Is an OBJECT', function() {
      expect(comparer.GREATER_THAN).to.be.a('object');
    });

    it('Returns correct string', function() {
      expect(comparer.GREATER_THAN.toCQLString()).to.equal(' > ');
    });
  });

  describe('Less Than', function() {

    it('Is an OBJECT', function() {
      expect(comparer.GREATER_THAN).to.be.a('object');
    });

    it('Returns correct string', function() {
      expect(comparer.LESS_THAN.toCQLString()).to.equal(' < ');
    });
  });
  describe('In Function', function() {

    it('Is an OBJECT', function() {
      expect(comparer.IN).to.be.a('object');
    });
    it('Returns correct string', function() {
      expect(comparer.IN.toCQLString(1)).to.equal(' IN (?) ');
    });
    it('Returns correct string, multiple parameters', function() {
      expect(comparer.IN.toCQLString(2)).to.equal(' IN (?,?) ');
    });
    it('Returns correct string, multiple parameters', function() {
      expect(comparer.IN.toCQLString(3)).to.equal(' IN (?,?,?) ');
    });
  });

});