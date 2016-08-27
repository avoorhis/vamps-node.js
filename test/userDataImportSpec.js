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

  it('should show Import Simple (single dataset) Form on GET user_data/import_data?import_type=simple_fasta', function(done) {
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
//   test here also:
// 1-req.body upload_data
// { project: 'test_gast_project',
//   dataset: 'test_gast_dataset',
//   type: 'simple_fasta' }
// [ { fieldname: 'upload_files',
//     originalname: 'fasta10.fa',
//     encoding: '7bit',
//     mimetype: 'application/octet-stream',
//     destination: '/Users/ashipunova/BPC/vamps-node.js/tmp',
//     filename: '01887c1234de7e532bf0b3c8d9fd5e7b',
//     path: '/Users/ashipunova/BPC/vamps-node.js/tmp/01887c1234de7e532bf0b3c8d9fd5e7b',
//     size: 620 },
//   { fieldname: 'upload_files',
//     originalname: 'ds1_meta.csv',
//     encoding: '7bit',
//     mimetype: 'text/csv',
//     destination: '/Users/ashipunova/BPC/vamps-node.js/tmp',
//     filename: 'ed6f2ee67ef687fd74a8734df20dd3d3',
//     path: '/Users/ashipunova/BPC/vamps-node.js/tmp/ed6f2ee67ef687fd74a8734df20dd3d3',
//     size: 338 } ]
//


  it('should show "Import Data", "The next step is to assign taxonomy via gast or rdp see: Your Projects" and "Upload in Progress: \'1test\'" if submitted fa and csv on POST /user_data/upload_data 200');

  it('should show "Project name: 1test ( 1 datasets )" and "Project name: 1test ( 1 datasets )" GET /user_data/your_projects 200');
  //see your_projects.png
  
  it('should show "Project name: 1test ( 1 datasets )" and "Project name: 1test ( 1 datasets )" GET /user_data/assign_taxonomy/1test 200');
  // see assign_taxonomy_for_test.html and png
  
  it('should redirect to  GET /user_data/start_assignment/1test/refssu 302 if hit start with refssu');
  // if hit start with refssu, but before redirect: check db 
  //in start_assignment--->
  // { project: '1test', classifier_id: 'refssu' }
  // <--- in start_assignment
  // start: 1test - GAST - refssu
  // project_config { GENERAL:
  //    { project: '1test',
  //      project_title: '',
  //      project_description: '',
  //      baseoutputdir: '/Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-1test',
  //      configPath: '/Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-1test/config.ini',
  //      fasta_file: '/Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-1test/1test-original.fna',
  //      platform: 'new_vamps',
  //      owner: 'admin',
  //      config_file_type: 'ini',
  //      public: 'False',
  //      fasta_type: 'single',
  //      dna_region: 'v6',
  //      project_sequence_count: '10',
  //      sequence_counts: 'NOT_UNIQUED',
  //      domain: 'bacteria',
  //      number_of_datasets: '1',
  //      env_source_id: '100',
  //      has_tax: '0' },
  //   DATASETS: { '1test': '10' } }
  // project_config2 single
  // in update_status
  // { type: 'update',
  //   user_id: 4,
  //   project: '1test',
  //   status: 'GAST-SUCCESS',
  //   msg: 'GAST -Tax assignments',
  //   statusOK: 'OK-GAST',
  //   statusSUCCESS: 'GAST-SUCCESS',
  //   msgOK: 'Finished GAST',
  //   msgSUCCESS: 'GAST -Tax assignments' }
  // statQuery2: UPDATE user_project_status JOIN project USING(project_id) SET status = 'GAST-SUCCESS', message = 'GAST -Tax assignments', updated_at = NOW() WHERE user_id = '4'

  // after refssu 302
  // status update2
 //  ResultSetHeader {
 //    fieldCount: 0,
 //    affectedRows: 1,
 //    insertId: 0,
 //    serverStatus: 2,
 //    warningStatus: 0 }
 //  Hurray! isLoggedIn.req.isAuthenticated
 //  1stdout:
 //  1stderr:
 //  RUNNING: /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-1test/gast_script.sh
 //  {"1test":{"validation":{"metadata_clean.csv":true,"1test.fa.unique":true},"pid":0,"tax_status":"No Taxonomic Assignments Yet","classified_by":"none","directory":"project-1test","mtime":"2016-08-26T23:53:24.000Z","project":"1test","number_of_datasets":"1","project_sequence_count":"10","public":"False","env_source_id":"100","DATASETS":{"1test":"10"}},"test_gast_project":{"validation":{"metadata_clean.csv":true,"test_gast_dataset.fa.unique":true},"pid":0,"tax_status":"No Taxonomic Assignments Yet","classified_by":"none","directory":"project-test_gast_project","mtime":"2016-08-10T18:39:52.000Z","project":"test_gast_project","number_of_datasets":"1","project_sequence_count":"10","public":"False","env_source_id":"100","DATASETS":{"test_gast_dataset":"10"}}}
 //  run_process process exited with code 127
 //  last_line: /Users/ashipunova/BPC/vamps-node.js
 //  ERROR last line: /Users/ashipunova/BPC/vamps-node.js
 //
  it('should show "Project name: 1test ( 1 datasets )" and "Project name: 1test ( 1 datasets )" on GET /user_data/your_projects');
  // see your_projects_after_assignment.htm and png

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
// http://www.hugeinc.com/ideas/perspective/test-based-coding-in-node-js-with-mocha
// https://github.com/skandamohan/Blog-Code-Node-JS-With-Mocha
  it('should show "A fasta file is required." if upload failed in FastaExists', function(done) {
    passportStub.login({
      username: 'TEST', password: 'TEST'
    });
    req = request(app);
  
    req
      .get('/user_data/import_data?import_type=simple_fasta')
      // .post('/user_data/upload_data')
      // .type('form')
      .send({project: "test222", dset: "test222", fasta: "/Users/ashipunova/BPC/vamps-node.js/test/selenium_tests/fasta10.fa", meta: "/Users/ashipunova/BPC/vamps-node.js/test/selenium_tests/ds1_meta.csv"})
      .end(function(err, res) {
          if (err) {
              throw err;
          }
          console.log("YYY res");
          console.log(util.inspect(res, false, null));
          res.status.should.eql(200);
          
          // assert.ok(res);
          // assert.ok(res.body);
          // assert.equal(res.status, 200);
          res.body.should.have.property('trial');
          done();
      });
    
      // .expect("Content-type", /json/)
      // .end(function (err, res) {
      //   // console.log("YYY res");
      //   // console.log(util.inspect(res.text, false, null));
      //
      //   res.status.should.eql(200);
      //   // res.text.should.containEql('DDDRRRR');
      //   res.text.should.containEql('<form class="form-horizontal" role="form" method="POST" action="upload_data" enctype="multipart/form-data">');
      //   res.text.should.containEql('<p class="title">Import Data</p>');
      //   res.text.should.containEql('Project Name:');
      //   res.text.should.containEql('Import Simple (single dataset) Form:');
      //   res.text.should.containEql('Fasta File');
      //   res.text.should.containEql('Metadata File');
      //   done();
      // });
  });
  // and see fill_import_form_log.txt for sucesfull upload



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
