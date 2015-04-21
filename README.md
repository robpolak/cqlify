# CQLify 
A ORM (Object-relational mapping) libraby for Cassandra ontop of the [data-stax cassandra driver](https://github.com/datastax/nodejs-driver).  This library will abstract the need to write raw insert/update/select statements.

#### Status : *PRE-ALPHA* (use at your own risk!, higly unstable)
##### Current Version : 0.0.2

### Installation
    $ npm install cqlify

### Creating a Connection
Uses all of the same connection options as the [data-stax cassandra driver](https://github.com/datastax/nodejs-driver).  Here is an exmple of a basic C*(Cassandra) database with basic authentication:
  ```
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
```

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

### Select
In this section we will cover how to select data using cqlify.  It is a very easy process to select out data

*Lookup with one field*
```javascript
    var user = new userModel(cqlify);  //create your model
    
    user.find([{
      name:'id', value: user.id, comparer: cqlify.comparer.EQUALS  //specify the query type and field name
    }], function(err, data) {
      if(err){
        //handle errors here
      }
      console.log(data[0].toObject()) //log the first object
    });
```
*Lookup with multi-field, c* always treats this as an AND*
```javascript
    var user = new userModel(cqlify);  //create your model
    
    user.find([
      {name:'id', value: 'idvalue', comparer: cqlify.comparer.EQUALS},
      {name:'first_name', value: 'first_name', comparer: cqlify.comparer.EQUALS},
    ], function(err, data) {
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

### Insert
```javascript
  var user = new userModel(cqlify);
  user.id = cqlify.types.getTimeUuid().now();
  user.first_name = "Robert";
  user.address = "some address";
  user.insert(function(err, data) {
      if(err){
        //handle errors here
      }
      console.log(data[0].toObject()) //log the first object
  });
```
### Update
Here is an example of pulling a record from the database and then updating one field (address in this case).
```javascript
    var user = new userModel(cqlify);
    user.find([{
      name:'id', value: user.id, comparer: cqlify.comparer.EQUALS
    }], function(err, data) {
      if (err) throw err;
      var user_from_db = data[0];
      user_from_db.address = "new address";
      user_from_db.update(
        [{name: 'id', value: user.id, comparer: cqlify.comparer.EQUALS}]  //specify the update criteria.. we could automate this in the future..
        , function (err, data) {
          if (err) throw err;
          console.log('saved user');
        });
    });
```

#### Validation
Out of the box we validate certain fields to ensure they meet the specification to insert into the database.  The fields we do contstraint validation on :

1. TimeUuid
2. Text
3. Int(Int32)
4. bigint(Int64)
5. Date
6. Boolean

###### Custom Vaidation
All schema types allow for custom validation, all you need to do is add a "validators" array to a schema element.

**Validate first name must be atleast 5 characters**
```javascipt
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
            if (obj && obj.length < 5){
              return cqlify.util.constructValidationMessage(false, "First name must be atleast 5 characters"); //construct the error message.
            }
            return true; //return back the object is valid
              
          }
        ]
      }
    }
  });
```
###### Ad-hoc validation
You can always validate manually by invoking the _validate method

```javascript
var isValid = user._validate();
```

#### Author : Robert Polak
#### Bugs
See <https://github.com/robpolak/cqlify/issues>.    
#### License 
The MIT License (MIT)
#### Contributing - Totally welcome, just shoot me a message.
