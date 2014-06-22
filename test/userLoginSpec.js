// userLoginSpec.js
// test authentication of users

var should = require("should");
var mysql = require('mysql');
//var Account = require("../models/account.js");
var async = require('async'),
  request = require('supertest'),
  should  = require('should'),
  app     = require('../app')
var User = {}
var db = require('../config/database-test');
// https://github.com/jedwood/api-testing-with-node

// describe('Authentication', function() {
 
//   it('errors if wrong basic auth', function(done) {
//     request(app).get('/')
//     .set('x-api-key', '123myapikey')
//     .auth('incorrect', 'credentials')
//     .expect(401, done)
//   });
 
//   it('errors if bad x-api-key header', function(done) {
//     request(app).get('/')
//     .auth('correct', 'credentials')
//     .expect(401)
//     .expect({error:"Bad or missing app identification header"}, done);
//   });

 
// });

describe('User Account', function() {

  before(function(done) {
     db.connect();
     done();
   });

   after(function(done) {
     db.end()
     done();
   });

   beforeEach(function(done) {
      // create user object
      User = {
        username: '12345',
        password: 'testy',
        firstname: 'test_firstname',
        lastname : 'test_lastname',
        email :'test@test.edu',
        institution:'test_institution'
      };
      done();

      
   });
   
   it('Saves to DB',function(done){
      user = User
      var insertQuery = "INSERT INTO users ( username, encrypted_password, first_name,last_name,email,institution )"
      insertQuery +=    " VALUES ('" + user.username +"','"+ user.password +"','"+ user.firstname +"','"+ user.lastname +"','"+ user.email +"','"+ user.institution +"')";
                
      console.log(insertQuery);
      db.query(insertQuery,function(err, rows, done){
          //should.not.exist(err);
          //should.exist(rows);
          //(rows.insertId).should.be.a.Number;

          //rows.insertId.should.eql(1234);
          //done();
      }); 
    
   })
   it('Saves to db2',function(done){

    
   })
   it('find a user by username', function(done) {
      Account.findOne({ username: '12345' }, function(err, account) {
        account.username.should.eql('12345');
        console.log("   username: ", account.username)
        done();
      });
   });

   afterEach(function(done) {
      User.remove({}, function() {
        done();
      });
   });

});
