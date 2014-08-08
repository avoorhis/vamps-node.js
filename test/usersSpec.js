var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');
var express = require('express');
var passport = require('passport');
var helpers = require('../routes/helpers');

describe('Users page functionality', function(){

  it('Text on login page', function(done){
    request(app)
      .get('/users/index_users')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        res.text.should.include('VAMPS User List');
        res.text.should.include('TEST');
        done();
      });
  });

});

describe('Login page functionality', function(){
  before(function (done) {

    this.timeout(5000);
    async.series([
      function (cb) {
        connection.query('SELECT * FROM user WHERE username="TEST"'+
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
    connection_dev = require('../config/database-dev');
    connection_dev.query('INSERT IGNORE INTO user (username, encrypted_password, first_name, last_name, email, institution) VALUES ("TEST","7kT94LYj7y5RnJVb34jrJw==","TEST","TEST","TEST","TEST")', function(err, result) {
      if (err) {throw err;}

      // console.log(query.sql);

      console.log("result.insertId: " + result.insertId);
      console.log("=========");
    });
    
    request(app)
      .post('/users/login')
      .expect(302)
      .send({ username: 'TEST', password: 'TEST'})
      .end(function (err, res) {
        should.not.exist(err);
        // confirm the redirect
        res.header.location.should.include('/');
        res.header.location.should.not.include('login');
        connection_dev.query('DELETE FROM user WHERE username = "TEST" AND first_name = "TEST" AND last_name = "TEST" AND email = "TEST" AND institution = "TEST"', function(err, result) {
          if (err) {throw err;}
        });
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

// /* How to make sure if I was checked in? */
//   it('should log the user out', function (done) {
//     request(app)
//       .get('/users/logout')
//       .expect(302)
//       .end(function (err, res) {
//         console.log("=== 55 ===");
//         console.log(res);
//         res.header.location.should.include('/');
//         res.header.location.should.not.include('login');
// 
//         if (err) return done(err);
//         // request(app)
//         //   .get('/')
//         //   .end(function (err, res) {
//         //     if (err) return done(err);
//         //     res.text.should.not.include('Logged in as:');
//         //     res.text.should.include('login');
//         //     res.text.should.include('register');
//             done();
//         //   });
//       });
//   });
/* How to make sure I was checked in? */
  it('should log the user out', function (done) {
    var passportStub = require('passport-stub');
    passportStub.install(app);
    
    passportStub.login({
      username: 'TEST', password: 'TEST'
    });

    request(app)
      .get('/')
      .end(function (err, res) {
      // console.log("===2===");
      // console.log(res);
      // console.log("===22===");
      res.text.should.include('Logged in as: TEST');
      
      request(app)
        .get('/users/logout')
        .expect(302)
        .end(function (err, res) {
          // console.log("=== 55 ===");
          // console.log(res);
          res.header.location.should.include('/');
          res.header.location.should.not.include('login');

          if (err) return done(err);
          
          request(app)
            .get('/')
            .end(function (err, res) {
            // console.log("===1===");
            // console.log(res);
            // console.log("===11===");
            res.text.should.not.include('Logged in as: TEST');
          
          // request(app)
          //   .get('/')
          //   .end(function (err, res) {
          //     if (err) return done(err);
          //     res.text.should.not.include('Logged in as:');
          //     res.text.should.include('login');
          //     res.text.should.include('register');
            });
        });
        done();
      
    });
    
  });

/**
* From https://github.com/jaredhanson/passport/issues/132
*/

  it('should return 403 when no user is logged in', function(done) {

    var app = express();
    app.use(passport.initialize());
    app.use(passport.session());
    app.get('/', function(req, res){
      if (!req.user || !req.isAuthenticated()){
        return res.send(403);
      }
      res.send(200);
    });

    request(app)
      .get('/')
      .expect(403)
      .end(done);
  });

  it('should return 200 when user is logged in', function(done) {

    var app = express();
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(function(req, res, next) {
      req.isAuthenticated = function() {
        return true;
      };
      req.user = {};
      next();
    });
    app.get('/', function(req, res){
      if (!req.user || !req.isAuthenticated()){
        return res.send(403);
      }
      res.send(200);
    });

    request(app)
      .get('/')
      .expect(200)
      .end(done);

  });

});
