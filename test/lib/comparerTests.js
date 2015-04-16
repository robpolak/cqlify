describe('Comparer Tests', function() {
  var comparer = require('../../lib/comparer');
  var expect = require('chai').expect;
  beforeEach(function () {
  });

  afterEach(function () {

  });


  describe('EQUALS', function() {

    it('Is an OBJECT', function() {
       expect(comparer.EQUALS).to.be.a('object');
    })
  })
})