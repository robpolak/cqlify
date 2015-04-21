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
##### *Supported Types*
1. TimeUUID - C* type
2. TimeStamp - C* type
3. Int - C* type
4. BigInt - C* type
5. Boolean - C* type
6. UUID - C* type
7. JSONTOTEXT - Propietry type which will allow you to specify your field as a JSON object.  Cqlify will convert that object to JSON and store it as text in the DB.
8. ENUMTOTEXT - Like JSON to text you can specify a Javascript enum value, and in turn cqlify will handle the conversions to text and back.

##### *Mixed Support*
1. Map : Supported on Insert and Get.. will eventually support update with a future enhancement
2. List : Supported on Insert and Get.. will eventually support update with a future enhancement
3. Counter : No support.. to come.. you could an Int for now, however, need to build in logic for incremental updates.. i.e. "counter + 1"

# Select
In this section we will cover how to select data using cqlify.  It is a very easy process to select out data

```javascript
    var user_db = new userModel();  //create your model
    
    user_db.find([{
      name:'id', value: user.id, comparer: cqlify.comparer.EQUALS  //specify the query type and field name
    }], function(err, data) {
      if(err){
        //handle errors here
      }
      console.log(data[0].toObject()) //log the first object
    });
```
##### *Comparer Types*
1. EQUALS : cqlify.types.EQUALS :  Standard equals operator .. i.e.   field="value"
2. GREATER_THAN :cqlify.types.GREATER_THAN :  count > 10
3. LESS_THAN :cqlify.types.LESS_THAN :  count < 10
4. IN : cqlify.types.IN : value in ("value1","value2","value3)



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
