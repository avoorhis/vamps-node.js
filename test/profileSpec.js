var app, passportStub, req, request;

passportStub = require('passport-stub');
request = require('supertest');
app = require('../app');

passportStub.install(app);

req = request(app);

describe('Profile page functionality', function(){
  
  it('redirect to / if not logged in', function(done){
    request(app)
      .get('/users/profile')
      .expect(302)
      .end(function (err, res) {
        res.header.location.should.include('/');
        //   
        // res.text.should.include('VAMPS Login');
        // res.text.should.include('Username');
        // res.text.should.include('Password');
        done();
      });
  });

//   it('Text on profile page if logged in');
//     
// });
// 
// describe('GET /admin', function() {
  it('responds with 302 if not logged in', function(done) {
    return req.get('/users/profile').expect(302).end(done);
  });
  
  it('responds with 200 when logged in', function(done) {
    passportStub.login({
      username: 'TEST'
    });
    // res.header.location.should.include('/users/profile');
    // res.text.should.include('Profile Page');
    // res.text.should.include('TEST');
    
    return req.get('/users/profile').expect(200).end(done);
  });
});
