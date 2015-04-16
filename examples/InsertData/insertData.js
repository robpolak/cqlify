module.exports = function() {
  var cqlify = require('../../app');
  var cassandra = require('cassandra-driver');
  var options = {
    contactPoints: ["host"],
    keyspace: "kespace",
    policies: {

    },
    authProvider: new cassandra.auth.PlainTextAuthProvider("user","pass")
  };

  var connection = cqlify(options);
  var userModel = function(cqlify) {
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
            if(obj.length != 5)
              return cqlify.util.constructMessage(false, "Length is not 3!")

          }
        ]
      },
      address: {
        type: cqlify.types.TEXT
      },
      age: {
        type: cqlify.types.INT
      },
      isActive: {
        type: cqlify.types.BOOLEAN
      }
    };

    var model = cqlify.model(schema, {
      tableName: 'user'
    });

    model._pre(function(obj) {
      if(obj.isNew) {
        obj.id = cassandra.types.TimeUuid.now();
      }
    });

    return model;
  };

  var user = new userModel(connection);
  user.first_name = 1;
  user.age = 31;
  user.address = "some address";
  user.isActive = true;
  var isValue = user._validate();
  user.insert(function(err, data) {

  });
}();