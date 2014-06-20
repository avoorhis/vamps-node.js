var async = require('async'),
  request = require('supertest'),
  should  = require('should'),
  app     = require('../app')
// https://github.com/jedwood/api-testing-with-node


describe('User API',function(){

//  before(function(done){
    
//  });

  it('GET /user_admin should return 200',function(done){
    request(app)
      .get('/users')
      .expect(200,done);
  });

  it('GET /user_admin/login should return 200',function(done){
    request(app)
      .get('/users/login')
      .expect(200,done);
  });


});