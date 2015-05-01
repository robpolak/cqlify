module.exports = function() {

/*
 CREATE TABLE counts
 (counter_value counter,
 url_name varchar,
 page_name varchar,
 PRIMARY KEY (url_name, page_name)
 );
 */
  var connection = require('./connection');
  var connectionOptions = {
    contactPoints: connection.contactPoints,
    keyspace: connection.keyspace,
    policies: {},
    authProvider: connection.authProvider
  };

  var cqlify = require('../../app');
  cqlify.createConnection(connectionOptions);

  var pageCountModel = function() {
    var schema = {
      counter_value: {
        type: cqlify.types.COUNTER
      },
      url_name: {
        type: cqlify.types.TEXT
      },
      page_name: {
        type: cqlify.types.TEXT
      }
    };
    var opts = {
      tableName: 'counts'
    };
    var model = cqlify.model(schema, opts);
    return model;
  }();

  var page = new pageCountModel();
  page.page_name = 'cnn';
  page.url_name =  'www.cnn.com';
  page._markClean();  //this is kind of a hack for now.. basically you never want the primary keys being marked as dirty, which then puts it on the update set.
  page.counter_value = "+0";  //must always increment or decrement .. cannot set a value
  page.update([
    {name: "page_name", value: page.page_name, comparer: cqlify.comparer.EQUALS},
    {name: "url_name", value: page.url_name, comparer: cqlify.comparer.EQUALS},
  ],function(err, data) {
    if(err) {
      console.log('ERROR:' + err);
    }
  });


  var page = new pageCountModel();
  page.find([
    {name: "page_name", value: 'google', comparer: cqlify.comparer.EQUALS},
    {name: "url_name", value: 'http://google.com', comparer: cqlify.comparer.EQUALS},
  ], function(err, data) {
    console.log('Data Found: \n'+ JSON.stringify(data[0].toObject(), null,4));
    var foundPage = data[0];
    foundPage.counter_value = "+1";
    foundPage.update([
      {name: "page_name", value: foundPage.page_name, comparer: cqlify.comparer.EQUALS},
      {name: "url_name", value: foundPage.url_name, comparer: cqlify.comparer.EQUALS},
    ],function(err, data) {
      if(err) {
        console.log('ERROR:' + err);
      }
    });
  });

  /*  user.find([{
   name:'id', value: user.id, comparer: cqlify.comparer.EQUALS
   }], function(err, data) {
   console.log('Data Found: \n'+ JSON.stringify(data[0].toObject(), null,4));
   });
*/

   }();