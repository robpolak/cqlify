describe('Validator Tests', function() {
  var moment = require('moment');
  var validator = require('../../../lib/validator');
  var cassandra_driver = require('cassandra-driver');
  var expect = require('chai').expect;

  beforeEach(function () {
  });

  afterEach(function () {

  });

  describe('isString', function() {
    it('is Function', function() {
      expect(validator.isString).to.be.a('function');
    });

    it('Happy Path', function() {
      expect(validator.isString('Hello')).to.eql(true);
    });

    it('Happy Path - null', function() {
      expect(validator.isString(null)).to.eql(true);
    });

    it('Happy Path - Empty', function() {
      expect(validator.isString('')).to.eql(true);
    });

    it('Happy Path - space', function() {
      var res = expect(validator.isString(' ')).to.eql(true);
    });

    it('Negative - Object', function() {
      var res = validator.isString({});
      expect(res.isValid).to.eql(false)
    });

    it('Negative - Bool', function() {
      var res = validator.isString(true);
      expect(res.isValid).to.eql(false)
    });

  });

  describe('isInt32', function() {
    it('is Function', function() {
      expect(validator.isInt32).to.be.a('function');
    });

    it('Happy Path', function() {
      expect(validator.isInt32(12)).to.eql(true);
    });

    it('Happy Path - negative', function() {
      expect(validator.isInt32(-12)).to.eql(true);
    });

    it('Happy Path - null', function() {
      expect(validator.isInt32(null)).to.eql(true);
    });


    it('Negative - > 32 bit', function() {
      var res = validator.isInt32(2147483647 + 1);
      expect(res.isValid).to.eql(false)
    });

    it('Negative - > -32 bit', function() {
      var res = validator.isInt32(-2147483647 - 1);
      expect(res.isValid).to.eql(false)
    });

    it('Negative - > object', function() {
      var res = validator.isInt32({});
      expect(res.isValid).to.eql(false)
    });

    it('Negative - > bool', function() {
      var res = validator.isInt32(true);
      expect(res.isValid).to.eql(false)
    });
  });

  describe('isInt64', function() {
    it('is Function', function() {
      expect(validator.isInt64).to.be.a('function');
    });

    it('Happy Path', function() {
      expect(validator.isInt64(12)).to.eql(true);
    });

    it('Happy Path - negative', function() {
      expect(validator.isInt64(-12)).to.eql(true);
    });

    it('Happy Path - null', function() {
      expect(validator.isInt64(null)).to.eql(true);
    });


    it('Happy Path - >32 bit', function() {
      expect(validator.isInt64(2147483647 + 1)).to.eql(true);
    });

    it('Happy Path - >-32 bit', function() {
      expect(validator.isInt64(-2147483647 - 1)).to.eql(true);
    });

    it('Negative - > object', function() {
      var res = validator.isInt64({});
      expect(res.isValid).to.eql(false)
    });

    it('Negative - > bool', function() {
      var res = validator.isInt64(true);
      expect(res.isValid).to.eql(false)
    });
  });

  describe('isBoolean', function() {
    it('is Function', function() {
      expect(validator.isBoolean).to.be.a('function');
    });

    it('is Function - Happy Path - true', function() {
      expect(validator.isBoolean(true)).to.eql(true);
    });
    it('is Function - Happy Path - false', function() {
      expect(validator.isBoolean(false)).to.eql(true);
    });

    it('is Function - Happy Path - true', function() {
      expect(validator.isBoolean('true')).to.eql(true);
    });
    it('is Function - Happy Path - false', function() {
      expect(validator.isBoolean('false')).to.eql(true);
    });
    it('is Function - Happy Path - null', function() {
      expect(validator.isBoolean(null)).to.eql(true);
    });

    it('Negative - > object', function() {
      var res = validator.isBoolean({});
      expect(res.isValid).to.eql(false)
    });
    it('Negative - > Int', function() {
      var res = validator.isBoolean(12);
      expect(res.isValid).to.eql(false)
    });
  });

  describe('required', function() {
    it('is Function', function() {
      expect(validator.required).to.be.a('function');
    });


    it('is Function - Happy Path - Space String', function() {
      expect(validator.required(' ')).to.eql(true);
    });

    it('is Function - Happy Path - Object', function() {
      expect(validator.required({})).to.eql(true);
    });

    it('is Function - Happy Path - Bool false', function() {
      expect(validator.required(false)).to.eql(true);
    });

    it('Negative - > null', function() {
      var res = validator.required(null);
      expect(res.isValid).to.eql(false)
    });

    it('Negative - > undef', function() {
      var res = validator.required();
      expect(res.isValid).to.eql(false)
    });
  });

  describe('isTimeUuid', function() {
    it('is Function', function() {
      expect(validator.isTimeUuid).to.be.a('function');
    });

    it('Happy Path', function() {
      expect(validator.isTimeUuid('a86a7981-e51d-11e4-96d9-ab32107ddd49')).to.eql(true);
    });

    it('Happy Path', function() {
      expect(validator.isTimeUuid(cassandra_driver.types.TimeUuid.now())).to.eql(true);
    });

    it('Negative - > wrong length', function() {
      var res = validator.isTimeUuid('a86a7981-e51d-11e4-96d9-ab32107ddd49'+'x');
      expect(res.isValid).to.eql(false)
    });
  });

  describe('isDate', function() {
    it('is Function', function() {
      expect(validator.isDate).to.be.a('function');
    });

    it('Happy Path', function() {
      expect(validator.isDate(moment())).to.eql(true);
    });

    it('Happy Path - null', function() {
      expect(validator.isDate(null)).to.eql(true);
    });

    it('Happy Path - undefined', function() {
      expect(validator.isDate()).to.eql(true);
    });

    it('Happy Path - space', function() {
      expect(validator.isDate(' ')).to.eql(false);
    });

    it('Happy Path - new Date - expects Moment only', function() {
      expect(validator.isDate(new Date())).to.eql(false);
    });

  })

});