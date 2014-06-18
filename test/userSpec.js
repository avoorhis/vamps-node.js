var async = require('async'),
  request = require('supertest'),
  should  = require('should'),
  app     = require('../app')
// https://github.com/jedwood/api-testing-with-node

describe('User API',function(){

//  before(function(done){
    
//  });

  it('GET /users should return 200',function(done){
    request(app)
      .get('/users')
      .expect(200,done);
  });

  it('GET /users/newuser should return 200',function(done){
    request(app)
      .get('/users/newuser')
      .expect(200,done);
  });

});