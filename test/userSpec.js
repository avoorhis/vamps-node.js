// userSpec.js
// test pages: login,signup,profile,index

// import the mysql helper utilities
//var utils = require('./utils');
var db = require('../config/database-test');
var mysql = require('mysql');
var app = require('../app')
  , http = require('./http');
var async = require('async')
var request= require('supertest')
//var should = require('should')
//var app    = require('../app')
// https://github.com/jedwood/api-testing-with-node


//describe('User API',function(){

//  before(function(done){
  
//  });
  
  // it('GET /user_admin should return 200',function(done){
  //   request(app)
  //     .get('/users')
  //     .expect(200,done);
  // });

  // it('GET /user_admin/login should return 200',function(done){
  //   request(app)
  //     .get('/users/login')
  //     .expect(200,done);
  // });


//});
describe('User API',function(){

  before(function(done){
    http.createServer(app,done);
  });

  it('GET /users should return 200',function(done){
    request()
      .get('/users')
      .expect(200,done);
  });

  it('POST /users should return 200',function(done){
    request()
      .post('/users')
      .set('Content-Type','application/json')
      .write(JSON.stringify({ username: 'test', password: 'pass' }))
      .expect(200,done);
  });
});