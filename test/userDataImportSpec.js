process.env.NODE_ENV = 'testing'
var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    init = require('./init')
var express = require('express');
var passport = require('passport');
var helpers = require('../routes/helpers/helpers');
var passportStub = require('passport-stub');
var util = require('util');
// console.log(util.inspect(app.testuser, false, null));

describe('<<< Data Import Selection page functionality >>>', function(){
    beforeEach(function() {
      passportStub.logout();
    });

    before(function (done) {
        test_name_hash = {}
        test_name_hash.name = []
        test_name_hash.ids  = []
        test_selection_obj  = {}

        connection = require('../config/database-test');

        // login with passport-stub
        passportStub.install(app);
        console.log('Logging in with username:', app.testuser.user, ' and password:', app.testuser.pass);
        passportStub.login({
          username: app.testuser.user, password: app.testuser.pass
        });
        //this.timeout(10000);
        req = request(app);
        
        done();
    });
  
  
  it('should not allow to submitt a project if not logged in', function(done) {
    // Data Administration
    req
    .get('/user_data/your_data')
    .expect(304)
    .end(function (err, res) {
      res.header.location.should.containEql('your_data');
      // expect(signupButton.innerHTML).to.equal('Signup');
      done();
    });
    done();
  });
  
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

  it('should say if the file is compressed or not');
  

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
