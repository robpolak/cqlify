describe('Counter Tests', function() {
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
    var table = 'insertTests1';
    cqlify.rawQuery(
      ' CREATE TABLE IF NOT EXISTS ' + table + ' ' +
      '(counter_value counter,' +
      'url_name varchar,' +
      'page_name varchar,' +
      'PRIMARY KEY (url_name, page_name));'
      ,{}, function(err, result) {
      if(err) {
        throw "Error Creating Table";
      }
      done();
    })
  });

  describe('Counter Tests' , function() {

    it('Increment Counter', function (done) {
      async.waterfall([
        function (callback) {
          var page = new pageCountModel();
          page.page_name = randomString(10);
          page.url_name = randomString(10);
          page._markClean();
          page.counter_value = "+50";
          var query = {
            params:[
              {name: "page_name", value: page.page_name, comparer: cqlify.comparer.EQUALS},
              {name: "url_name", value: page.url_name, comparer: cqlify.comparer.EQUALS}
            ]
          };
          page.update(query, function (err, data) {
            if (err) {
              console.log('ERROR:' + err);
            }
            callback(null, page);
          });
        },
        function (data, callback) {
          var page = new pageCountModel();
          var query = {
            params:[
              {name: "page_name", value: data.page_name, comparer: cqlify.comparer.EQUAL},
              {name: "url_name", value: data.url_name, comparer: cqlify.comparer.EQUALS},
            ]
          };
          page.find(query, function (err, data) {
            var foundPage = data[0];
            expect(foundPage.counter_value).to.eql(50);
            done();
          });
        }

      ]);
    });

    it('Decrement Counter', function (done) {
      async.waterfall([
        function (callback) {
          var page = new pageCountModel();
          page.page_name = randomString(10);
          page.url_name = randomString(10);
          page._markClean();
          page.counter_value = "-50";
          var query = {
            params:[
              {name: "page_name", value: page.page_name, comparer: cqlify.comparer.EQUALS},
              {name: "url_name", value: page.url_name, comparer: cqlify.comparer.EQUALS}
            ]
          };
          page.update(query, function (err, data) {
            if (err) {
              console.log('ERROR:' + err);
            }
            callback(null, page);
          });
        },
        function (data, callback) {
          var page = new pageCountModel();
          var query = {
            params:[
              {name: "page_name", value: data.page_name, comparer: cqlify.comparer.EQUAL},
              {name: "url_name", value: data.url_name, comparer: cqlify.comparer.EQUALS},
            ]
          };
          page.find(query, function (err, data) {
            var foundPage = data[0];
            expect(foundPage.counter_value).to.eql(-50);
            done();
          });
        }

      ]);
    });

  });

  function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
  }
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

});