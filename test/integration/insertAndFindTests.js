describe('IF0 - Insert & Find Tests', function() {
  var cqlify = require('../../app');
  var async = require('async');
  var expect = require('chai').expect;
  var moment = require('moment');

  var table = 'user_copy3';
  before(function (done) {
    var connection = require('./connection');
    var connectionOptions = {
      contactPoints: connection.contactPoints,
      keyspace: connection.keyspace,
      policies: {},
      authProvider: connection.authProvider
    };

    cqlify.createConnection(connectionOptions);

    var sql = "CREATE TABLE IF NOT EXISTS " + table + " " +
      "(" +
      "id timeuuid," +
      "address text," +
      "group text," +
      "age int," +
      "first_name text," +
      "isactive boolean," +
      "nick_names LIST<text>," +
      "create_date timestamp," +
      "info text," +
      "status text," +
      "phone_numbers MAP<text, text>," +

      "PRIMARY KEY (id)); ";

    async.waterfall([function (callback) {
      cqlify.rawQuery(sql, {}, function (err, result) {
        if (err) {
          throw "Error Creating Table";
        }
        callback();
      });
    },
      function (callback) {
        sql = " CREATE INDEX IF NOT EXISTS ON " + table + " (group);";
        cqlify.rawQuery(sql, {}, function (err, result) {
          if (err) {
            throw "Error Creating Index";
          }
          done();
        });

      }
    ]);
  });

  describe('Insert & Find Tests', function () {

    it('IF1 - Insert and Find Test', function (done) {
      var user = getUser('some group1');
      async.waterfall([
        function (callback) {
          var query = {};
          user.insert(query, function (err, data) {
            if (err) {
              console.log('ERROR:' + err);
            }
            var id = user.id;
            callback(null, id);
          });
        },
        function (id, callback) {
          var foundUser = new userModel();
          var query = {
            params: [{
              name: 'id', value: id, comparer: cqlify.comparer.EQUALS
            }]
          };
          foundUser.find(query, function (err, data) {
            expect(data.length).to.eql(1);
            var obj = data[0];
            expect(obj.toObject()).to.eql(user.toObject());
            done();
          });
        }
      ]);
    });

    it('IF2 - Insert and Find and Update & Find Test', function (done) {
      var user = getUser('some group');
      var newGroup = "other group";

      async.waterfall([
        //Insert
        function (callback) {
          var query = {};
          user.insert(query, function (err, data) {
            if (err) {
              console.log('ERROR:' + err);
            }
            var id = user.id;
            callback(null, id);
          });
        },
        function (id, callback) {
          //Find
          var foundUser = new userModel();
          var query = {
            params: [{
              name: 'id', value: id, comparer: cqlify.comparer.EQUALS
            }]
          };
          foundUser.find(query, function (err, data) {
            expect(data.length).to.eql(1);
            var obj = data[0];
            expect(obj.toObject()).to.eql(user.toObject());
            callback(null, obj);
          });
        },
        function (user, callback) {
          //update
          user.group = newGroup;
          var query = {
            params: [{
              name: 'id', value: user.id, comparer: cqlify.comparer.EQUALS
            }]
          };

          user.update(query, function (err, result) {
            callback(null, user.id);
          });
        },
        function (id, callback) {
          var foundUser = new userModel();
          var query = {
            params: [{
              name: 'id', value: id, comparer: cqlify.comparer.EQUALS
            }]
          };
          foundUser.find(query, function (err, data) {
            expect(data.length).to.eql(1);
            var obj = data[0];
            expect(obj.toObject()).to.not.eql(user.toObject()); //should have been updated so they are not equal
            user.group = newGroup;
            expect(obj.toObject()).to.eql(user.toObject()); //should match now
            done();
          });
        }
      ]);
    });

    it('IF3 - Insert & Page Test', function (done) {
      var recordsToPage = 10;
      var ids = [];
      var pagedRecords = 0;
      var group = randomString(15);

      async.waterfall([
        function (callback) {
          for (i = 0; i < recordsToPage; i++) {
            var user = getUser(group);
            var query = {};
            user.insert(query, function (err, data) {
              if (err) {
                console.log('ERROR:' + err);
              }
              var id = user.id;
              ids.push(id);
              if (ids.length == recordsToPage) {
                callback(null, id);
              }
            });
          }
        },
        function (id, callback) {
          var foundUser = new userModel();
          var expectedUser = getUser(group).toObject();
          delete expectedUser.id;
          var query = {
            params: [{
              name: 'group', value: group, comparer: cqlify.comparer.EQUALS
            }]
          };
          foundUser.findAndPage(query, function (err, data) {
              var actual = data.toObject();
              delete actual.id; //ignore for comparison
              expect(actual).to.eql(expectedUser);
              pagedRecords = pagedRecords + 1;

            },
            function (err, result, pageState) {
              if (pagedRecords === recordsToPage) {
                done();
              }
              else {
                expect(false).to.eql(true);
              }
            });
        }
      ]);
    });

    it('IF4 - Insert & Page & Continue Page', function (done) {
      var recordsToPage = 10;
      var ids = [];
      var pagedRecords = 0;
      var group = randomString(15);

      async.waterfall([
        function (callback) {
          for (i = 0; i < recordsToPage; i++) {
            var newUser = getUser(group);
            var query = {};
            newUser.insert(query, function (err, data) {
              if (err) {
                console.log('ERROR:' + err);
              }
              var id = newUser.id;
              ids.push(id);
              if (ids.length == recordsToPage) {
                callback(null, id);
              }
            });
          }
        },
        function (id, callback) {
          var foundUser = new userModel();
          var expectedUser = getUser(group).toObject();

          function find(pageState) {
            delete expectedUser.id;
            var query = {
              params: [{
                name: 'group', value: group, comparer: cqlify.comparer.EQUALS
              }],
              options: {
                fetchSize: recordsToPage / 2,
                pageState: pageState
              }
            };
            foundUser.findAndPage(query, function (err, data) {
                var actual = data.toObject();
                delete actual.id; //ignore for comparison
                expect(actual).to.eql(expectedUser);
                pagedRecords = pagedRecords + 1;

              },
              function (err, result, pageState) {
                if (pagedRecords === recordsToPage) {
                  done();
                }
                else {
                  expect(pageState).to.be.a("string");
                  find(pageState);
                }
              });
          };
          find(null);
        }

      ]);
    });

  });


  function getUser(group) {
    var user = userModel();

    expect(user._doc.first_name).to.eql(undefined);
    expect(user.phone_numbers._internalArray.length).to.eql(0);
    expect(user.nick_names._internalArray.length).to.eql(0);

    user.first_name = "Robert";
    user.age = 31;
    user.group = group;
    user.address = "some address";
    user.isactive = true;
    user.phone_numbers.addNew({number_type: "Home" + group, phone_number: "234-234-3244"});
    user.phone_numbers.addNew({number_type: "Work" + group, phone_number: "222-234-3244"});
    user.nick_names.addNew("Rob");
    user.nick_names.addNew("Bob");
    user.nick_names.addNew("Bobby");
    user.status = userStatusEnum.EXISTING;
    user.create_date = moment().startOf('day').toString();
    user.info = {
      referring_page: 'cnn.com',
      demographics: [
        "games",
        "tv",
        "movies"
      ]
    };
    return user;
  }

  function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
  }

  var userStatusEnum = function () {
    function status() {

    }

    status.prototype.NEW = function () {
      var value = 'NEW';
      return {
        value: value
      };
    }();

    status.prototype.EXISTING = function () {
      var value = 'EXISTING';
      return {
        value: value
      };
    }();

    status.prototype.FromValue = function (str) {
      var arrObj = Object.getOwnPropertyNames(status.prototype);
      for (var funcRef in arrObj) {
        var func = this[arrObj[funcRef]];
        if (func.value === str) {
          return func;
        }
      }
    };

    status.prototype.toString = function (type) {
      return type.value;
    };
    status.prototype.toJSON = function () {
      return this.value;
    };

    return new status();
  }();

  var userModel = function () {
    var schema = {
      id: {
        type: cqlify.types.TIMEUUID,
        key_type: cqlify.types.PRIMARY_KEY,
        key_order: 1
      },
      first_name: {
        type: cqlify.types.TEXT,
        validators: [
          function (obj) {
            if (obj && obj.length != 6)
              return cqlify.util.constructValidationMessage(false, "Length is not 5!")

          }
        ]
      },
      group: {
        type: cqlify.types.TEXT,
        key_type: cqlify.types.INDEX
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
      create_date: {
        type: cqlify.types.TIMESTAMP
      },
      info: {
        type: cqlify.types.JSONTOTEXT
      },
      status: {
        type: cqlify.types.ENUMTOTEXT,
        enumerator: userStatusEnum
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
      tableName: table,
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