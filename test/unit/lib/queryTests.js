describe('Query Tests', function() {
  var cqlify = require('../../../lib/cqlify');
  var query = require('../../../lib/query');
  var sinon = require('sinon');
  query = query();

  var expect = require('chai').expect;


  beforeEach(function () {
  });

  afterEach(function () {

  });

  describe('insert', function() {
    it('insert is function' , function() {
      expect(query.insert).to.be.a('function');
    });

    it('insert - Completes Callback' , function(done) {
      var obj = model();
      var clientStub = sinon.stub(cqlify,"connection").returns(clientFake);
      var executeStub = sinon.stub(clientFake, 'execute').yields(null);
      var query = {};
      obj.insert(query,function(err, item) {
        //expect(item.id).to;
        clientFake.execute.restore();
        cqlify.connection.restore();
        done();

      });

    });

    it('insert - Invalid Param' , function(done) {
      var obj = model();
      var clientStub = sinon.stub(cqlify,"connection").returns(clientFake);
      var executeStub = sinon.stub(clientFake, 'execute').yields(null);
      var query = {
        params:[
          {name1:'name', value:'value'}
        ]
      };
      obj.insert(query,function(err, item) {
        //expect(item.id).to;
        clientFake.execute.restore();
        cqlify.connection.restore();
        expect(err).to.be.a('array');
        done();

      });
    });

    it('insert - Invalid Param - no value' , function(done) {
      var obj = model();
      var clientStub = sinon.stub(cqlify,"connection").returns(clientFake);
      var executeStub = sinon.stub(clientFake, 'execute').yields(null);
      var query = {
        params:[
          {name:'name', value2:'value'}
        ]
      };
      obj.insert(query,function(err, item) {
        //expect(item.id).to;
        clientFake.execute.restore();
        cqlify.connection.restore();
        expect(err).to.be.a('array');
        done();

      });
    });
  });

  var clientFake = {
    execute: function () {
    }
  };


  var model = function () {
    var schema = {
      id: {
        type: cqlify.types.TIMEUUID,
        key_type: cqlify.types.PRIMARY_KEY,
        key_order: 1
      },
      name: {
        type: cqlify.types.TEXT,
      }
    };
    var opts = {
      tableName: 'modelTable',
      pre: function (obj) {
        if (obj.isNew) {
          obj.id = cqlify.types.getTimeUuid().now();
        }
      },
      post: function (obj) {

      }
    };
    var model = cqlify.model(schema, opts);
    return new model();
  };
});