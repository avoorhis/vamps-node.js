var async = require('async'),
  request = require('supertest'),
  should  = require('should'),
  app     = require('../app')

describe('User API',function(){

  before(function(done){
    
  });

  it('GET /users should return 200',function(done){
    request()
      .get('/users')
      .expect(200,done);
  });
});