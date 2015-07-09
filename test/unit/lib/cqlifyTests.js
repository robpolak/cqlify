describe('Cqlify Tests', function() {
  var cqlify = require('../../../lib/cqlify');
  var sinon = require('sinon');
  var expect = require('chai').expect;
  var cassandra_driver = require('cassandra-driver');
  var client_stub, connect_stub;

  beforeEach(function () {
    //STUBS
    connect_stub = sinon.stub();
    client_stub = sinon.stub(cassandra_driver,"Client").returns({
      connect: connect_stub
    });
  });

  afterEach(function () {
    cassandra_driver.Client.restore();
  });

  describe('constructor', function() {

  });

  describe('createConnection', function() {
    it('Calls connect' , function() {
      cqlify.createConnection({});
      expect(connect_stub.called).to.eql(true);
    });

    it('Calls connect callback on success' , function(done) {
      connect_stub.yields(null)
      cqlify.createConnection({}, function(error){
        expect(error).to.not.exist;
        done()
      });
    });

    it('Calls connect callback on failure' , function(done) {
      connect_stub.yields('oh no')
      cqlify.createConnection({}, function(error){
        expect(error).to.exist;
        done()
      });
    });
  });
});
