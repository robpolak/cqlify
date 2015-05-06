describe('Insert & Find Tests', function() {
  var cqlify = require('../../app');
  var async = require('async');
  var expect = require('chai').expect;

  before(function(done) {
    var connection = require('./connection');
    var connectionOptions = {
      contactPoints: connection.contactPoints,
      keyspace: connection.keyspace,
      policies: {},
      authProvider: connection.authProvider
    };

    cqlify.createConnection(connectionOptions);
    var table = 'user_copy1';
    var sql = " CREATE TABLE IF NOT EXISTS " + table + " " +
      "(" +
      "id timeuuid,"+
      "address text,"+
      "age int,"+
      "first_name text,"+
      "isactive boolean," +
      "nick_names LIST<text>," +
      "phone_numbers MAP<text, text>,"+
      "PRIMARY KEY (id))";

    cqlify.rawQuery(sql

      ,{}, function(err, result) {
      if(err) {
        throw "Error Creating Table";
      }
      done();
    })
  });

  describe('Insert & Find Tests' , function() {

    it('Insert and Find Test', function (done) {
      var user = new userModel();
      user.first_name = "Robert";
      user.age = 31;
      user.address = "some address";
      user.isActive = true;
      user.phone_numbers.addNew({number_type:"Home", phone_number:"234-234-3244"});
      user.phone_numbers.addNew({number_type:"Work", phone_number:"222-234-3244"});
      user.nick_names.addNew("Rob");
      user.nick_names.addNew("Bob");
      user.nick_names.addNew("Bobby");

      async.waterfall([
        function (callback) {
          user.insert(function(err, data) {
            if(err) {
              console.log('ERROR:' + err);
            }
            var id = user.id;
            callback(null, id);
          });
        },
        function (id, callback) {
          var foundUser = new userModel();
          foundUser.find([{
            name:'id', value: id, comparer: cqlify.comparer.EQUALS
          }], function(err, data) {
            expect(data.length).to.eql(1);
            var obj = data[0];
            expect(obj.toObject()).to.eql(user.toObject());
            done();
          });
        }
      ]);
    });


    it('Find and page Test', function (done) {
      var recordsToPage = 10;
      var ids = [];
      var pagedRecords = 0;
      var user = new userModel();
      user.first_name = "Robert";
      user.age = 31;
      user.address = "some address";
      user.isActive = true;
      user.phone_numbers.addNew({number_type:"Home", phone_number:"234-234-3244"});
      user.phone_numbers.addNew({number_type:"Work", phone_number:"222-234-3244"});
      user.nick_names.addNew("Rob");
      user.nick_names.addNew("Bob");
      user.nick_names.addNew("Bobby");

      async.waterfall([
        function (callback) {
          user.insert(function(err, data) {
            if(err) {
              console.log('ERROR:' + err);
            }
            var id = user.id;
            callback(null, id);
          });
        },
        function (id, callback) {
          var foundUser = new userModel();
          foundUser.findAndPage([{
              name:'id', value: id, comparer: cqlify.comparer.EQUALS
          }], function(err, data) {
            expect(data.toObject()).to.eql(user.toObject());

          },
          function() {
            //done
            done();
          });
        }
      ]);
    });

  });

  var userModel = function() {
    var schema = {
      id: {
        type: cqlify.types.TIMEUUID,
        key_type: cqlify.types.PRIMARY_KEY,
        key_order: 1
      },
      first_name: {
        type: cqlify.types.TEXT,
        validators: [
          function(obj) {
            if(obj && obj.length != 6)
              return cqlify.util.constructValidationMessage(false, "Length is not 5!")

          }
        ]
      },
      address: {
        type: cqlify.types.TEXT
      },
      age: {
        type: cqlify.types.INT
      },
      isactive: {
        type: cqlify.types.BOOLEAN
      },
      nick_names: {
        type: cqlify.types.LIST,
        schema: {
          type: cqlify.types.TEXT
        }
      },
      phone_numbers: {
        type: cqlify.types.MAP,
        schema: {
          number_type: {
            type: cqlify.types.TEXT,
            key_type: cqlify.types.PRIMARY_KEY
          },
          phone_number: {
            type: cqlify.types.TEXT
          }
        }
      }
    };
    var opts = {
      tableName: 'user',
      pre: function(obj) {
        if(obj.isNew) {
          obj.id = cqlify.types.getTimeUuid().now();
        }
      },
      post:function(obj) {

      }
    };
    var model = cqlify.model(schema, opts);
    return model;
  }();

});