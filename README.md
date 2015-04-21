# cqlify 
A ORM (Object-relational mapping) libraby for Cassandra ontop of the [data-stax cassandra driver](https://github.com/datastax/nodejs-driver).  

#### Status : *PRE-ALPHA* (use at your own risk!, higly unstable)

### Creating a Connection
Uses all of the same connection options as https://github.com/datastax/nodejs-driver
  
  var cassandra = require('cassandra-driver');
  var options = {
    connection: {
      contactPoints: ["2.2.2.2","3.3.3.3"],
      keyspace: "keyspace",
      policies: {},
      authProvider: new cassandra.auth.PlainTextAuthProvider("user", "password")
    }
  };
var cqlify = require('./cqlify')(options);


### Creating a model
Now that you have a connection you can create a model.  In your model you will specify the schema, which describes the format of your object.  Let's take an example table:

| Column        | Type           
| ------------- |:-------------:
| id            | timeuuid
| first_name    | text      
| address       | text      

*user_model.js*
```javascript
var userModel = function(cqlify) {
    var schema = {
      id: {
        type: cqlify.types.TIMEUUID,
        key_type: cqlify.types.PRIMARY_KEY,
        key_order: 1
      },
      first_name: {
        type: cqlify.types.TEXT,
      },
      address: {
        type: cqlify.types.TEXT
      }
    };

    var model = cqlify.model(schema, {
      tableName: 'user'
    });

    model._pre(function(obj) {
      if(obj.isNew) {
        obj.id = cqlify.types.getTimeUuid().now();
      }
    });

    return model;
  };
  module.exports = userModel;
```

### Interacting with Cassandra




**To-Do:**
   1. Unit Tests
   2. Support all native types
   3. Support Complex Types
      1. Set
      2. Map
      3. Counter
   4. Documentation
   5. D-trace integration
   6. Better eventing interface


#### Contributing - Totally welcome, just shoot me a message.
