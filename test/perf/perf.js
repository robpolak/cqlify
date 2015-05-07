module.exports = function() {

  /*
  require('nodetime').profile({
    accountKey: '882c7c4ce15e10d3c74e135435a3c986a8591053',
    appName: 'CQLify'
  });*/

  var cqlify = require('../../lib/cqlify');
  var model = require('../../lib/model');
  var moment = require('moment');

  var notificationModel = function () {

    var notification = {
      date: {
        type: cqlify.types.TIMESTAMP,
        key_type: cqlify.types.PRIMARY_KEY,
        key_order: 1
      },
      notification_id: {
        type: cqlify.types.TIMEUUID,
        key_type: cqlify.types.PRIMARY_KEY,
        key_order: 2
      },
      shard_key: {
        type: cqlify.types.INT,
        key_type: cqlify.types.INDEX
      },
      priority: {
        type: cqlify.types.INT
      },
      start_date: {
        type: cqlify.types.TIMESTAMP
      },
      end_date: {
        type: cqlify.types.TIMESTAMP
      },
      source_system: {
        type: cqlify.types.TEXT
      },
      callback_url: {
        type: cqlify.types.TEXT
      },
      target: {
        type: cqlify.types.JSONTOTEXT
      },
      channels: {
        type: cqlify.types.JSONTOTEXT
      },
      server_name: {
        type: cqlify.types.TEXT
      },
      create_date: {
        type: cqlify.types.TIMESTAMP
      },
      effective_date: {
        type: cqlify.types.TIMESTAMP
      }
    };

    var options = {
      tableName: 'notification'
    };
    var model = cqlify.model(notification, options);

    return model;
  }();

  function run() {
    console.log('Running');
    hydrateModel();
    toObject();
    return;
  }

  function hydrateModel() {
    var iteration = 10000;
    var fromObj = {
      date: "2015-05-04 17:00:00-0700",
      notificationId: "123123123",
      shard_key: 100,
      priority: 101,
      start_date: "2015-05-04 17:00:00-0700"
    };

    var impl = new notificationModel();
    var st = moment();
    for (var i = 0; i < iteration; i++) {
      var obj = model.hydrateModel(impl._schema, impl._internalState.m_cqlify, {}, fromObj);
    }
    var end = moment();
    var diff = end.diff(st, 'milliseconds');
    console.log('Hydrate Model x 10000:' + diff);
    return;
  };

  function toObject() {
    var iteration = 10000;
    var fromObj = {
      date: "2015-05-04 17:00:00-0700",
      notificationId: "123123123",
      shard_key: 100,
      priority: 101,
      start_date: "2015-05-04 17:00:00-0700"
    };

    var impl = new notificationModel();
    var obj = model.hydrateModel(impl._schema, impl._internalState.m_cqlify, {}, fromObj);
    var st = moment();
    for (var i = 0; i < iteration; i++) {
      var x = obj.toObject();
    }
    var end = moment();
    var diff = end.diff(st, 'milliseconds');
    console.log('To Object x 10000:' + diff);
    return;
  };

  run();
}();