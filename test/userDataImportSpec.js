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

  it('should not allow to submitt a project if not logged in');
  it('should not allow to submitt a project if logged in as a gest');

  it('should show buttons on GET /user_data/your_data 304', function(done) {
    // Data Administration
    done();
  });

  it('should show choices on GET /user_data/import_choices 304', function(done) {
    // Data Import Selection
    done();
  });

  it('should show Import Simple (single dataset) Form on POST /user_data/upload_data 302', function(done) {
    // Import Data
    done();
  });

  it('should show "That A project name is required." if upload failed in ProjectNameGiven', function(done) {    
    // GET /user_data/your_data 304
    // Import Data
    //  
    done();
  });

  it('should show "A fasta file is required." if upload failed in FastaExists', function(done) {
    // Import Data
    //  POST /user_data/upload_data 302
    done();
  });

  it('should show "A metadata csv file is required." if upload failed in MetadataFileExists', function(done) {
    // Import Data
    //  POST /user_data/upload_data 302
    done();
  });
  
  it('should show "That project name is already taken." if upload failed in FilePathExists', function(done) {
    // Import Data
    //  POST /user_data/upload_data 302
    done();
  });

  it('should show "Upload in Progress: \'test_gast_project\'" on POST /user_data/upload_data 200 if success', function(done) {
    // Data Import Selection
    done();
  });
  
  it('should insert into db status = "OK", message = "Upload Started"', function(done) {
    // Data Import Selection
    // GET /user_data/import_data?import_type=simple_fasta 200
    done();
  });


  it('should update db with status = "LOADED", message = "Project is loaded --without tax assignments"', function(done) {
    // Data Import Selection
    // GET /user_data/import_data?import_type=simple_fasta 200
    done();
  });

  
  

  // it('should return 200 when user is logged in', function(done) {
  //
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
  //   app.get('/', function(req, res){
  //     if (!req.user || !req.isAuthenticated()){
  //       return res.send(403);
  //     }
  //
  //     res.status(200).end()
  //     // res.send(200);
  //   });
  //
  //   request(app)
  //     .get('/')
  //     .expect(200)
  //     .end(done);
  //
  // });

});
