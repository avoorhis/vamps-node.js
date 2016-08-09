process.env.NODE_ENV = 'testing'
var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    init = require('./init')
var express = require('express');
var passport = require('passport');
var helpers = require('../routes/helpers/helpers');

describe('<<< Data Import Selection page functionality >>>', function(){
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

  it('should show button Your projects on GET /user_data/your_data', function(done) {
    // Data Administration
    done();
  });

  it('should show button Your projects on GET /user_data/your_data', function(done) {
    // Data Administration
    done();
  });

  it('should not show a submitted project if not logged in');
  it('should not show a submitted project if logged in as a gest');
  it('redirect to GET /user_data/your_projects 200 and show: "Project name: test_gast_project ( 1 datasets )"')
  it('should redirect to GET /user_data/assign_taxonomy/test_gast_project 304: "Assign Taxonomy: test_gast_project"');
  
  it('should redirect to GET /user_data/your_projects 200 w "GAST has been started for project: \'test_gast_project\'" after choosing "SILVA (v119)	GAST	Bv6 (Bacterial)"');
  
  
});
