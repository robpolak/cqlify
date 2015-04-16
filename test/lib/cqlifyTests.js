describe('Cqlify Tests', function() {
  var cqlify = require('../../lib/cqlify');
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
    it('Calls cassandra-client' , function() {
      var cqlize = new cqlify({});
      expect(client_stub.called).to.eql(true);
    });

    it('Calls connect' , function() {
      var cqlize = new cqlify({});
      expect(connect_stub.called).to.eql(true);
    });
  });
});