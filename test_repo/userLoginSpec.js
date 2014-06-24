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

describe('Req 1: Landing page functionality', function(){
  before(function (done) {
    this.timeout(5000);
      async.series([
      function (cb) {
      connection.query('INSERT INTO mocha_test_table2 '+
      'VALUE("TEST","TEST","","");',function(err){
      done();
      });
    },
    function (cb) {
      connection.query('SELECT * FROM mocha_test_table WHERE user_name="TEST"'+
        ' AND email="TEST";',function(err,results){
        results.length.should.not.equal(0);
        done();
      });
    }
    ], done);
  });
  // it('1.1 Text of landing page', function(done){
  // request(app)
  // .get('/')
  // .expect(200)
  // .end(function (err, res) {
  // res.text.should.include('Home');
  // done();
  // });
  // });
  // it('1.2 Link to the login page', function(done){
  // request(app)
  // .get('/')
  // .expect(200)
  // .end(function (err, res) {
  // res.text.should.include('/login');
  // done();
  // });
  // });
});


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
      MySQLUser = {
        username: '12345',
        password: 'testy',
        firstname: 'test_firstname',
        lastname : 'test_lastname',
        email :'test@test.edu',
        institution:'test_institution'
      };
      done();

   });
   it('Creates Encrypted Password',function(done){
    done();
   });
   it('Decrypts Password',function(done){
    done();
   });
   it('Saves User to DB',function(done){
      user = MySQLUser
      var insertQuery = "INSERT INTO users ( username, encrypted_password, first_name, last_name, email, institution )"
      insertQuery +=    " VALUES ('" + user.username +"','"+ user.password +"','"+ user.firstname +"','"+ user.lastname +"','"+ user.email +"','"+ user.institution +"')";
                
      console.log(insertQuery);
      db.query(insertQuery,function(err, rows){
          should.not.exist(err);
          //should.exist(rows);
          //(rows.insertId).should.be.a.Number;

          //rows.insertId.should.eql(1234);
          
      }); 
      done();
    
   });
   
   it('Finds A User By Username', function(done) {
      Account.findOne({ username: '12345' }, function(err, account) {
        account.username.should.eql('12345');
        console.log("   username: ", account.username)
        
      });
      done();
   });

  

});
