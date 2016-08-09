process.env.NODE_ENV = 'testing'
var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    init = require('./init')
var express = require('express');
var passport = require('passport');
var helpers = require('../routes/helpers/helpers');


// describe('Users page functionality', function(){

//   it('Text on login page', function(done){
//     request(app)
//       .get('/users/index_users')
//       .expect(200)
//       .end(function (err, res) {
//         should.not.exist(err);
//         res.text.should.containEql('VAMPS User List');
//         res.text.should.containEql('TEST');
//         done();
//       });
//   });

// });

describe('<<< Login page functionality >>>', function(){
  before(function (done) {
    connection = require('../config/database-test');

    connection.query("DELETE FROM user WHERE username = '"+app.testuser.user+"' AND first_name = '"+app.testuser.first+"' AND last_name = '"+app.testuser.last+"' AND email = '"+app.testuser.email+"' AND institution = '"+app.testuser.inst+"'", function(err, result) {
          if (err) {throw err;}
    });

    this.timeout(5000);

    var q = "INSERT IGNORE INTO user (username, encrypted_password, first_name, last_name, email, institution, active) \
      VALUES ('"+app.testuser.user+"','"+helpers.generateHash(app.testuser.pass)+"','"+app.testuser.first+"','"+app.testuser.last+"','"+app.testuser.email+"','"+app.testuser.inst+"','"+1+"')"
    connection.query(q, function(err, result) {
      if (err) {throw err;}
      console.log(q)
      console.log("result.insertId: " + result.insertId);
      console.log("=========");
    });
    
    this.timeout(5000);
    async.series([
      function (cb) {
        connection.query('SELECT * FROM user WHERE username="'+app.testuser.user+'" AND email="'+app.testuser.email+'"',function(err,results){
            results.length.should.not.equal(0);
            done();
          });
      }
    ], done());
  });

  it('Text on login page', function(done){
    request(app)
      .get('/users/login')
      .expect(200)
      .end(function (err, res) {
        res.text.should.containEql('Login');
        res.text.should.containEql('Username');
        res.text.should.containEql('Password');
        done();
      });
  });

  it('Able to login with user "TEST"', function(done){

    request(app)
      .post('/users/login')
      .send({ username: app.testuser.user, password: app.testuser.pass})
      .expect(302)
      .end(function (err, res) {
        should.not.exist(err);
        // confirm the redirect
        console.log(res.header.location)
        res.header.location.should.containEql('/users/profile');
        res.header.location.should.not.containEql('login');

        connection.query("DELETE FROM user WHERE username = '"+app.testuser.user+"' AND first_name = '"+app.testuser.first+"' AND last_name = '"+app.testuser.last+"' AND email = '"+app.testuser.email+"' AND institution = '"+app.testuser.inst+"'", function(err, result) {
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
        res.header.location.should.not.containEql('/');
        res.header.location.should.containEql('login');
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
//         res.header.location.should.containEql('/');
//         res.header.location.should.not.containEql('login');
//
//         if (err) return done(err);
//         // request(app)
//         //   .get('/')
//         //   .end(function (err, res) {
//         //     if (err) return done(err);
//         //     res.text.should.not.containEql('Logged in as:');
//         //     res.text.should.containEql('login');
//         //     res.text.should.containEql('register');
//             done();
//         //   });
//       });
//   });
/* How to make sure I was checked in? */
  it('should log the user out', function (done) {
    var passportStub = require('passport-stub');
    passportStub.install(app);

    passportStub.login({
      username: app.testuser.user, password: app.testuser.pass
    });

    request(app)
      .get('/')
      .end(function (err, res) {
      // console.log("===2===");
      // console.log(res);
      // console.log("===22===");
      res.text.should.containEql(app.testuser.user);

      request(app)
        .get('/users/logout')
        .expect(302)
        .end(function (err, res) {
          // console.log("=== 55 ===");
          // console.log(res);
          res.header.location.should.containEql('/');
          res.header.location.should.not.containEql('login');

          if (err) return done(err);

          request(app)
            .get('/')
            .end(function (err, res) {
            // console.log("===1===");
            // console.log(res);
            // console.log("===11===");
            res.text.should.not.containEql(app.testuser.user);

          // request(app)
          //   .get('/')
          //   .end(function (err, res) {
          //     if (err) return done(err);
          //     res.text.should.not.containEql('Logged in as:');
          //     res.text.should.containEql('login');
          //     res.text.should.containEql('register');
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
        // return res.send(403);
        return res.status(403).end()
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
      
      res.status(200).end()
      // res.send(200);
    });

    request(app)
      .get('/')
      .expect(200)
      .end(done);

  });

});
