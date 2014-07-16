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


describe('Profile page functionality', function(){
  it('Text on profile page if unlogged', function(done){
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

  it('Text on profile page if logged in', function(done){
    app = require('test/test_helpers.js').prepApp(done);
    
    request(app)
      .get('/users/profile')
      .expect(200)
      .end(function (err, res) {
        console.log("===2===");
        console.log(res);
        console.log("===22===");
        console.log("--- user1 ---");
        console.log(res.user);
        // res.helpers.isLoggedIn();
        // res.header.location.should.include('/users/profile');
        res.text.should.include('Profile Page');
        res.text.should.include('TEST');
        done();
      });
    
  });
    
  //   var tmp_app = express();
  //   tmp_app.use(passport.initialize());
  //     
  //   tmp_app.use(function(req, res){
  //     req.user = { id: 35,
  //       username: 'TEST',
  //       email: 'TEST',
  //       institution: 'TEST',
  //       first_name: 'TEST',
  //       last_name: 'TEST',
  //       active: 0,
  //       security_level: 50,
  //       encrypted_password: '7kT94LYj7y5RnJVb34jrJw==',
  //       reset_password_token: null,
  //       reset_password_sent_at: null,
  //       remember_created_at: null,
  //       sign_in_count: 0,
  //       current_sign_in_at: null,
  //       last_sign_in_at: null,
  //       current_sign_in_ip: null,
  //       last_sign_in_ip: null,
  //       confirmation_token: null,
  //       confirmed_at: null,
  //       confirmation_sent_at: null,
  //       unconfirmed_email: null }
  //   });
  //   tmp_app.use(function(req, res){
  //     req.isAuthenticated = function() {
  //       return true;
  //     };
  //   });
  //   // console.log("===1===")
  //   // console.log(tmp_app);
  //   // console.log("===11===")
  //   tmp_app.stack.unshift({ // First middleware
  //       route: '',
  //       handle: function (req, res, next) {
  //           req.user = {};
  // 
  //           req.isAuthenticated = function () {
  //               return true;
  //           };
  // 
  //           next();
  //       }
  //   });    
  //   tmp_app.get('/users/profile', function(req, res){
  //       if (!req.user || !req.isAuthenticated()){
  //         return res.send(403);
  //       }
  //       res.send(200);
  //     });
  // 
  //     
  //   
  //     request(tmp_app)
  //       .get('/users/profile')
  //       .expect(200)
  // //       .end(function (err, res) {
  // // console.log("===2===")
  // // console.log(res);
  // // console.log("===22===")
  // // 
  // //       res.header.location.should.include('/users/profile');
  // //         res.text.should.include('Profile Page');
  // //         res.text.should.include('TEST');
  // //         done();
  // //       });
  //       .end();
  //     done();
  //   
  // });
  //   
  //   

        //       tmp_app.get('/users/profile', function(req, res){
        // console.log("===2===")
        // console.log(res);
        // console.log("===22===")
        //         // if (!req.user || !req.isAuthenticated()){
        //         //   return res.send(403);
        //         // }
        //         // res.send(200);
        //         done();
        //   
        //       });
      
      // tmp_app
      //       .get('/users/profile')
      //       .expect(200)
      //       .end(function (err, res) {
      //   console.log("===2===")
      //   console.log(res);
      //   console.log("===22===")
      // 
      //         res.header.location.should.include('/users/profile');
      //         res.text.should.include('Profile Page');
      //         res.text.should.include('TEST');
      //         done();
      //       });
      // done();
  // });
  
  
  // it('should return 200 when user is logged in', function(done) {
  // 
  //     var app = express();
  //     app.use(passport.initialize());
  //     app.use(passport.session());
  //     app.use(function(req, res, next) {
  //       req.isAuthenticated = function() {
  //         return true;
  //       };
  //     helpers.isLoggedIn = true;
  //       // req.user = {};
  //     req.user = { id: 35,
  //       username: 'TEST',
  //       email: 'TEST',
  //       institution: 'TEST',
  //       first_name: 'TEST',
  //       last_name: 'TEST',
  //       active: 0,
  //       security_level: 50,
  //       encrypted_password: '7kT94LYj7y5RnJVb34jrJw==',
  //       reset_password_token: null,
  //       reset_password_sent_at: null,
  //       remember_created_at: null,
  //       sign_in_count: 0,
  //       current_sign_in_at: null,
  //       last_sign_in_at: null,
  //       current_sign_in_ip: null,
  //       last_sign_in_ip: null,
  //       confirmation_token: null,
  //       confirmed_at: null,
  //       confirmation_sent_at: null,
  //       unconfirmed_email: null };
  //       next();
  //     });
  //     // app.get('/', function(req, res){
  //     //   if (!req.user || !req.isAuthenticated()){
  //     //     return res.send(403);
  //     //   }
  //     //   res.send(200);
  //     // });
  // 
  //         app.get('/users/profile', function(req, res){
  //           if (!req.user || !req.isAuthenticated()){
  //             return res.send(403);
  //           }
  //     // console.log("res111");
  //     // console.log(res);
  //           res.send(200);
  //         });
  // 
  //     // request(app)
  //     //   .get('/users/profile')
  //     //   .expect(200)
  //     //   .end(function (err, res) {
  //     //         // location: '/',
  //     //         console.log("res222");
  //     //             console.log(res);
  //     //     
  //     //     res.text.should.include('Profile Page');
  //     //     // res.text.should.include('TEST');
  //     //     done();
  //     //   });
  //       // .end(done);
  // 
  //     request(app)
  //       .get('/users/profile')
  //       .expect(200)
  //       .end(function (err, res) {
  //             // location: '/',
  //             console.log("res222");
  //             console.log(res);
  // 
  //         res.text.should.include('Profile Page');
  //         // res.text.should.include('TEST');
  //         done();
  //       });
  // 
  //   });
  // before(function (done) 
  // {
  //   var app = express();
  //   app.use(passport.initialize());
  //   app.use(passport.session());
  //   app.use(function(req, res, next) {
  //     req.isAuthenticated = function() {
  //       return true;
  //     };
  //     req.user = {};
  //     next();
  //   });
  // });

  // it('Text on profile page', function(done) {
  //     this.timeout(5000);
  //   
  //     var app = express();
  //     app.use(passport.initialize());
  //     app.use(passport.session());
  //     app.use(function(req, res, next) {
  //       req.isAuthenticated = function() {
  //         return true;
  //       };
  //       req.user = {};
  //       next();
  //       console.log("res112");
  //         console.log(res);
  //     
  //     });
  //   
  //     app.get('/user_admin/profile', function(req, res){
  //       if (!req.user || !req.isAuthenticated()){
  //         return res.send(403);
  //       }
  //       // console.log("res112");
  //       // console.log(res);
  //       res.send(200);
  //     });
  //     
  //   });


  // it('Text on profile page', function(done){
    // request(app)
    //       .post('/users/login')
    //       .expect(302)
    //       .send({ username: 'TEST', password: 'TEST'})
    //       .end(function (err, res) {
    //         should.not.exist(err);
    //         // confirm the redirect
    //         res.header.location.should.include('/');
    //         res.header.location.should.not.include('login');
    //         done();
    //       });
  
    // var app = express();
    //     app.use(passport.initialize());
    //     app.use(passport.session());
    //   
    // request(app)
    //   .get('/users/profile')
    //   .expect(302)
    //   .send({ username: 'TEST', password: 'TEST'})
    //   .end(function (err, res) {
    //         console.log("res111");
    //         console.log(res);
    //         // location: '/',
    // 
    //     // res.text.should.include('Profile Page');
    //     // res.text.should.include('TEST');
    //     done();
    //   });
  // });

//   it('Text on login page', function(done){
//     request(app)
//       .post('/user_admin/profile')
//       .expect(200)
//       .end(function (err, res) {
//         // res.text.should.include('Profile Page');
//         // res.text.should.include('TEST');
//         console.log("res111");
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
