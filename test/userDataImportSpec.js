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
var supertest = require('supertest');
var util = require('util');
// console.log(util.inspect(app.testuser, false, null));

var expect = require('expect.js');
var server = supertest.agent("http://localhost:3000");

describe('<<< Data Import Selection page functionality >>>', function(){
    beforeEach(function() {
      passportStub.logout();
    });

    before(function () {
        test_name_hash = {}
        test_name_hash.name = []
        test_name_hash.ids  = []
        test_selection_obj  = {}

        connection = require('../config/database-test');
        passportStub.install(app);
        console.log('Logging in with username:', app.testuser.user, ' and password:', app.testuser.pass);
        passportStub.login({
          username: app.testuser.user, password: app.testuser.pass
        });
        //this.timeout(10000);
        // done();
    });

    it('responds with 200 when logged in', function(done) {
      passportStub.login({
        username: 'TEST', password: 'TEST'
      });
      req = request(app);
      
      req
        .get('/users/profile')
        .expect(200)
        .end(function (err, res) {
          res.text.should.containEql('Profile Page');
          res.status.should.eql(200);
          res.text.should.containEql('TEST');
          // console.log('EEE responds with 200 when logged in', res);
          
          done();
        });
    });
  
  it('should not allow to submit a project if not logged in', function(done){
    request(app)
    .get('/user_data/import_choices')
    .expect("Content-type", /json/)
    .end(function(err, res){
      res.status.should.eql(302);
      res.text.should.not.containEql('Data Administration');
      res.text.should.eql('Found. Redirecting to /users/login');
      done();
    });
  });
  
  // it("should have a correct title and buttons on your_data",function(done){
  //   server
  //   .get("/user_data/your_data")
  //   .expect("Content-type", /json/)
  //   .expect(200) // THis is HTTP response
  //   .end(function(err, res){
  //     // console.log("YYY res");
  //     // console.log(util.inspect(res, false, null));
  //     // console.log("222 res");
  //     // console.log(util.inspect(res, false, null));
  //     res.status.should.eql(200);
  //     res.text.should.containEql('Data Administration');
  //     res.text.should.containEql('Import Data');
  //     res.text.should.containEql('Your Projects');
  //     done();
  //   });
  // });
  
  it("should have a correct title and buttons on your_data 2",function(done){
    passportStub.login({
      username: 'TEST', password: 'TEST'
    });
    req = request(app);
    
    req
      .get("/user_data/your_data")
      .expect("Content-type", /json/)
      .end(function (err, res) {
        res.status.should.eql(200);
        // console.log("YYY res");
        // console.log(util.inspect(res, false, null));
        res.text.should.containEql('Data Administration');
        res.text.should.containEql('Import Data');
        res.text.should.containEql('Your Projects');
        done();
      });
  });
  
  
  it("should have a correct title and buttons on import_choices if logged in", function(done) {
    passportStub.login({
      username: 'TEST', password: 'TEST'
    });
    req = request(app);
    
    req
      .get('/user_data/import_choices')
      .expect("Content-type", /json/)
      .end(function (err, res) {
        res.status.should.eql(200);
        // console.log("YYY res");
        // console.log(util.inspect(res, false, null));
        res.text.should.containEql('Data Import Selection');      
        done();
      });
  });
  
  it("should raise an error if text is not on the page", function(done) {
    passportStub.login({
      username: 'TEST', password: 'TEST'
    });
    req = request(app);
    
    req
      .get('/user_data/import_choices')
      .expect("Content-type", /json/)
      .end(function (err, res) {
        res.status.should.eql(200);
        res.text.should.not.containEql('DDDRRRR');
        
        done();
      });
  });
  
  it('should show choices on GET /user_data/import_choices 304', function(done) {
    passportStub.login({
      username: 'TEST', password: 'TEST'
    });
    req = request(app);
    
    req
      .get('/user_data/import_choices')
      .expect("Content-type", /json/)
      .end(function (err, res) {
        res.status.should.eql(200);
        // res.text.should.containEql('DDDRRRR');
        res.text.should.containEql('Simple (single dataset) Fasta File');
        res.text.should.containEql('Multi-Dataset Fasta File');
        res.text.should.containEql('Add Metadata to a Project');
        res.text.should.containEql('Data Import Selection');        
        done();
      });
  });

  it('should not allow to submit a project if logged in as a gest');

  it('should show Import Simple (single dataset) Form on POST /user_data/upload_data 302', function(done) {
    passportStub.login({
      username: 'TEST', password: 'TEST'
    });
    req = request(app);
    
    req
      .get('/user_data/import_data?import_type=simple_fasta')
      .expect("Content-type", /json/)
      .end(function (err, res) {
        // console.log("YYY res");
        // console.log(util.inspect(res.text, false, null));
        
        res.status.should.eql(200);
        // res.text.should.containEql('DDDRRRR');
        res.text.should.containEql('<form class="form-horizontal" role="form" method="POST" action="upload_data" enctype="multipart/form-data">');
        res.text.should.containEql('<p class="title">Import Data</p>');
        res.text.should.containEql('Project Name:');
        res.text.should.containEql('Import Simple (single dataset) Form:');
        res.text.should.containEql('Fasta File');
        res.text.should.containEql('Metadata File');        
        done();
      });
  });

  it('should show Import Simple (single dataset) Form on POST /user_data/upload_data 302');
//   it('should show Import Simple (single dataset) Form on POST /user_data/upload_data 302', function(done) {
//     // Import Data
//     done();
//   });

  it('should show "That A project name is required." if upload failed in ProjectNameGiven');
//   it('should show "That A project name is required." if upload failed in ProjectNameGiven', function(done) {
//     // GET /user_data/your_data 304
//     // Import Data
//     //
//     done();
//   });

  it('should show "A fasta file is required." if upload failed in FastaExists');
//   it('should show "A fasta file is required." if upload failed in FastaExists', function(done) {
//     // Import Data
//     //  POST /user_data/upload_data 302
//     done();
//   });
//
  it('should show "A metadata csv file is required." if upload failed in MetadataFileExists');
//   it('should show "A metadata csv file is required." if upload failed in MetadataFileExists', function(done) {
//     // Import Data
//     //  POST /user_data/upload_data 302
//     done();
//   });
//
  it('should show "That project name is already taken." if upload failed in FilePathExists');
//   it('should show "That project name is already taken." if upload failed in FilePathExists', function(done) {
//     // Import Data
//     //  POST /user_data/upload_data 302
//     done();
//   });
//
  it('should show "Upload in Progress: \'test_gast_project\'" on POST /user_data/upload_data 200 if success');
//   it('should show "Upload in Progress: \'test_gast_project\'" on POST /user_data/upload_data 200 if success', function(done) {
//     // Data Import Selection
//     done();
//   });

  it('should insert into db status = "OK", message = "Upload Started"');
//   it('should insert into db status = "OK", message = "Upload Started"', function(done) {
//     // Data Import Selection
//     // GET /user_data/import_data?import_type=simple_fasta 200
//     done();
//   });
//
//
  it('should update db with status = "LOADED", message = "Project is loaded --without tax assignments"');
//   it('should update db with status = "LOADED", message = "Project is loaded --without tax assignments"', function(done) {
//     // Data Import Selection
//     // GET /user_data/import_data?import_type=simple_fasta 200
//     done();
//   });
//
  it('should say if the file is compressed or not');

});
