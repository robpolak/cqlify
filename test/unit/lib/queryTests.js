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
    it('insert is function', function () {
      expect(query.insert).to.be.a('function');
    });

    it('insert - Completes Callback', function (done) {
      var obj = model();
      var clientStub = sinon.stub(cqlify, "connection").returns(clientFake);
      var executeStub = sinon.stub(clientFake, 'execute').yields(null);
      var query = {};
      obj.insert(query, function (err, item) {
        //expect(item.id).to;
        clientFake.execute.restore();
        cqlify.connection.restore();
        done();

      });

    });

    it('insert - Invalid Param', function (done) {
      var obj = model();
      var clientStub = sinon.stub(cqlify, "connection").returns(clientFake);
      var executeStub = sinon.stub(clientFake, 'execute').yields(null);
      var query = {
        params: [
          {name1: 'name', value: 'value'}
        ]
      };
      obj.insert(query, function (err, item) {
        //expect(item.id).to;
        clientFake.execute.restore();
        cqlify.connection.restore();
        expect(err).to.be.a('array');
        done();

      });
    });

    it('insert - Invalid Param - no value', function (done) {
      var obj = model();
      var clientStub = sinon.stub(cqlify, "connection").returns(clientFake);
      var executeStub = sinon.stub(clientFake, 'execute').yields(null);
      var query = {
        params: [
          {name: 'name', value2: 'value'}
        ]
      };
      obj.insert(query, function (err, item) {
        //expect(item.id).to;
        clientFake.execute.restore();
        cqlify.connection.restore();
        expect(err).to.be.a('array');
        done();

      });
    });

    it('insert - passes options', function (done) {
      var obj = model();

      var c = obj._internalState.m_cqlify;
      var executeStub = sinon.stub(clientFake, 'execute').yields(null);
      var clientStub = sinon.stub(obj._internalState.m_cqlify, "connection").returns(clientFake);

      var query = {
        params: [
          {name: 'name', value: 'value'}
        ],
        options: {
          opt1: true,
          opt2: 'val'
        }
      };
      obj.insert(query, function (err, item) {


        var args = executeStub.getCall(0).args;

        //check options passed on
        expect(args[2]).to.eql(query.options);

        //check SQL
        expect(args[0]).to.eql('insert into modelTable (id) VALUES(?);');
        clientFake.execute.restore();
        cqlify.connection.restore();

        done();

      });
    });

    it('insert - passes correct parameters', function (done) {
      var obj = model();
      obj.name = 'Rob';

      var executeStub = sinon.stub(clientFake, 'execute').yields(null);
      var clientStub = sinon.stub(obj._internalState.m_cqlify, "connection").returns(clientFake);

      var query = {
        params: [
          {name: 'name', value: 'value'}
        ],
        options: {
          opt1: true,
          opt2: 'val'
        }
      };
      obj.insert(query, function (err, item) {
        var args = obj._client.execute.getCall(0).args;

        //check sql
        expect(args[0]).to.eql('insert into modelTable (id,name) VALUES(?,?);');

        //check parameters
        expect(args[1][0]).to.eql(item.id);
        expect(args[1][1]).to.eql(obj.name);

        clientFake.execute.restore();
        cqlify.connection.restore();

        done();

      });
    });

    it('insert - default fetch size', function (done) {
      var obj = model();
      obj.name = 'Rob';

      var executeStub = sinon.stub(clientFake, 'execute').yields(null);
      var clientStub = sinon.stub(obj._internalState.m_cqlify, "connection").returns(clientFake);

      var query = {
        params: [
          {name: 'name', value: 'value'}
        ],
        options: {
          opt1: true,
          opt2: 'val'
        }
      };
      obj.insert(query, function (err, item) {
        var args = obj._client.execute.getCall(0).args;

        //default to 5000
        expect(args[2]["fetchSize"]).to.eql(5000);

        clientFake.execute.restore();
        cqlify.connection.restore();

        done();

      });
    });

    it('insert - always sends prepare:true', function (done) {
      var obj = model();
      obj.name = 'Rob';

      var executeStub = sinon.stub(clientFake, 'execute').yields(null);
      var clientStub = sinon.stub(obj._internalState.m_cqlify, "connection").returns(clientFake);

      var query = {
        params: [
          {name: 'name', value: 'value'}
        ],
        options: {
          opt1: true,
          opt2: 'val',
          prepare: false
        }
      };
      obj.insert(query, function (err, item) {
        var args = obj._client.execute.getCall(0).args;

        //default to 5000
        expect(args[2]["prepare"]).to.eql(true);

        clientFake.execute.restore();
        cqlify.connection.restore();

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
        type: cqlify.types.TEXT
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