var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');

describe('Users page functionality', function(){

  it('Text on login page', function(done){
    request(app)
      .get('/users/index_users')
      .expect(200)
      .end(function (err, res) {
        res.text.should.include('VAMPS User List');
        res.text.should.include('TEST');
        done();
      });
  });

});

describe('Profile page functionality', function(){

  it('Text on login page', function(done){
    request(app)
      .get('/users/profile')
      .expect(302)
      .send({ username: 'TEST', password: 'TEST'})
      .end(function (err, res) {
				console.log("res111");
				console.log(res);
		    // location: '/',
    
        // res.text.should.include('Profile Page');
        // res.text.should.include('TEST');
        done();
      });
  });

//   it('Text on login page', function(done){
//     request(app)
//       .post('/user_admin/profile')
//       .expect(200)
//       .end(function (err, res) {
//         // res.text.should.include('Profile Page');
//         // res.text.should.include('TEST');
// 				console.log("res111");
// console.log(res);
//         res.header.location.should.not.include('login');
//         done();
//       });
//   });
});


describe('Login page functionality', function(){
  before(function (done) {

    this.timeout(5000);
    async.series([
      function (cb) {
        connection.query('SELECT * FROM users WHERE username="TEST"'+
              ' AND email="TEST"',function(err,results){
            results.length.should.not.equal(0);
            done();
          });
      }
    ], done);
  });

  it('Text on login page', function(done){
    request(app)
      .get('/users/login')
      .expect(200)
      .end(function (err, res) {
        res.text.should.include('VAMPS Login');
        res.text.should.include('Username');
        res.text.should.include('Password');
        done();
      });
  });

  it('Able to login with user "TEST"', function(done){
    request(app)
      .post('/users/login')
      .expect(302)
      .send({ username: 'TEST', password: 'TEST'})
      .end(function (err, res) {
        should.not.exist(err);
        // confirm the redirect
        res.header.location.should.include('/');
        res.header.location.should.not.include('login');
        done();
      });
  });

  it('should redirect to "/users/login" if authentication fails', function (done) {
    request(app)
      .post('/users/login')
      .expect(302)
      .send({ username: 'NO User', password: ''})
      .end(function (err, res) {
        res.header.location.should.not.include('/');
        res.header.location.should.include('login');
        // console.log("res.header.location: ");
        // console.log(res.header.location);
        done();
      });
  });

/* How to make sure if I was checked in? */
  it('should log the user out', function (done) {
    request(app)
      .get('/users/logout')
      .end(function (err, res) {
        res.header.location.should.include('/');
        res.header.location.should.not.include('login');

        if (err) return done(err);
        request(app)
          .get('/')
          .end(function (err, res) {
            if (err) return done(err);
            res.text.should.not.include('Logged in as:');
            res.text.should.include('login');
            res.text.should.include('register');
            done();
          });
      });
  });
});
