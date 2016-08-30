process.env.NODE_ENV = 'testing'
var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    init = require('./init')
var express = require('express');
var passport = require('passport');
var helpers = require('../routes/helpers/helpers');
var passportStub = require('passport-stub');
var supertest = require('supertest');
var util = require('util');
// console.log(util.inspect(app.testuser, false, null));

var expect = require('expect.js');
// var server = supertest.agent("http://localhost:3001");

// ===
var http = require('http');

this.server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, world!\n');
});

exports.listen = function () {
  this.server.listen.apply(this.server, arguments);
};

exports.close = function (callback) {
  this.server.close(callback);
};
// ===

// var server = require('../lib/server');

// describe('server', function () {
//   before(function () {
//     server.listen(3003);
//   });
// 
//   after(function () {
//     server.close();
//   });
// });

var assert = require('assert'),
    http = require('http');

describe('/', function () {
  it('should return 200', function (done) {
    http.get('http://localhost:3001', function (res) {
      assert.equal(200, res.statusCode);
      done();
    });
  });
});
