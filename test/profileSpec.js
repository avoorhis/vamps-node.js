var app, passportStub, req, request;

passportStub = require('passport-stub');
request = require('supertest');
app = require('../app');

passportStub.install(app);
process.env.NODE_ENV = 'test';

req = request(app);

// beforeEach
// before(function(done) {
//     console.log('Unlog before function');
//     passportStub.logout();    
// });

describe('Profile page functionality', function(){
  
  it('redirect to / if not logged in', function(done){

    req
      .get('/users/profile')
      .expect(302)
      .end(function (err, res) {
        res.header.location.should.containEql('/');
        done();
      });
  });
  
  it('responds with 200 when logged in', function(done) {
    passportStub.login({
      username: 'TEST', password: 'TEST'    
    });

    req
      .get('/users/profile')
      .expect(200)
      .end(function (err, res) {
        // console.log("===2===");
        // console.log(res);
        // console.log("===22===");
        res.text.should.containEql('Profile Page');
        res.text.should.containEql('TEST');
        done();
      });
    
    // passportStub.logout();
  });
  
  
});
