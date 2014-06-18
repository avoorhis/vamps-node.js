var async = require('async'),
  request = require('supertest'),
  should  = require('should'),
  app     = require('../app')

describe('Authentication', function() {
 
  it('errors if wrong basic auth', function(done) {
    api.get('/blog')
    .set('x-api-key', '123myapikey')
    .auth('incorrect', 'credentials')
    .expect(401, done)
  });
 
  it('errors if bad x-api-key header', function(done) {
    api.get('/blog')
    .auth('correct', 'credentials')
    .expect(401)
    .expect({error:"Bad or missing app identification header"}, done);
  });
 
});