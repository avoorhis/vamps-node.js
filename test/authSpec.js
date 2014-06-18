var async = require('async'),
  request = require('supertest'),
  should  = require('should'),
  app     = require('../app')
// https://github.com/jedwood/api-testing-with-node

describe('Authentication', function() {
 
  it('errors if wrong basic auth', function(done) {
    app.get('/')
    
  });
 
  it('errors if bad x-api-key header', function(done) {
    request()
      .get('/users')
      .expect(200,done);
  });
 //   app.get('/users')
 //   .auth('correct', 'credentials')
 //   .expect(401)
 //   .expect({error:"Bad or missing app identification header"}, done);
 // });
 
});