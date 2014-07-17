// call mocha test/userLog.js
var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    // app = require('../app'),
    connection = require('../config/database-test');
var express = require('express');
var router = express.Router();
var passport = require('passport');
// require('../config/passport')(passport, connection); // pass passport for configuration
var app = express();
var C = require('../public/constants');
var users = require('../routes/users');
var helpers = require('../routes/helpers');

describe('Profile page functionality', function(){
  
  it('Text on profile page if logged in', function(done){
    // app.on('configure', function () { app.mockPassportInitialize(); });
    // app.on('ready', function () { done(); });
    app.use(function(req, res, next){
        req.db = connection;
        req.C = C;
        next();
    });
    
    app.use(
      passport.initialize = function (req, res, next) {
          passport = this;
          passport._key = 'passport';
          passport._userProperty = 'user';
          passport.serializeUser = function(user, done) {
              return done(null, user.id);
          };
          passport.deserializeUser = function(user, done) {
              return done(null, user);
          };
          console.log("req1");
          console.log(req);
          req._passport = {
              instance: passport
          };
          req._passport.session = {
          //   user: new app.models.User({ id: 35,
          //     username: 'TEST',
          //     email: 'TEST',
          //     institution: 'TEST',
          //     first_name: 'TEST',
          //     last_name: 'TEST',
          //     active: 0,
          //     security_level: 50,
          //     encrypted_password: '7kT94LYj7y5RnJVb34jrJw==',
          //     reset_password_token: null,
          //     reset_password_sent_at: null,
          //     remember_created_at: null,
          //     sign_in_count: 0,
          //     current_sign_in_at: null,
          //     last_sign_in_at: null,
          //     current_sign_in_ip: null,
          //     last_sign_in_ip: null,
          //     confirmation_token: null,
          //     confirmed_at: null,
          //     confirmation_sent_at: null,
          //     unconfirmed_email: null })
          };

          return next();
        }
      );
      
      app.use(passport.session()); // persistent login sessions
      app.use('/users', users);
      
    // app.use(function(req, res){
    //   req.user = { id: 35,
    //     username: 'TEST',
    //     email: 'TEST',
    //     institution: 'TEST',
    //     first_name: 'TEST',
    //     last_name: 'TEST',
    //     active: 0,
    //     security_level: 50,
    //     encrypted_password: '7kT94LYj7y5RnJVb34jrJw==',
    //     reset_password_token: null,
    //     reset_password_sent_at: null,
    //     remember_created_at: null,
    //     sign_in_count: 0,
    //     current_sign_in_at: null,
    //     last_sign_in_at: null,
    //     current_sign_in_ip: null,
    //     last_sign_in_ip: null,
    //     confirmation_token: null,
    //     confirmed_at: null,
    //     confirmation_sent_at: null,
    //     unconfirmed_email: null };        
    // }); 

    // console.log("===1===");
    // console.log(app);
    // console.log("===11===");
    
    request(app)
      .get('/users/profile')
      .expect(200)
      .end(function (err, res) {
        console.log("===2===");
        console.log(res);
        console.log("===22===");
        // console.log("--- user1 ---");
        // console.log(res.user);
        // res.helpers.isLoggedIn();
        res.header.location.should.include('/users/profile');
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

});
