// force the test environment to 'test'
process.env.NODE_ENV = 'testing'
var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app')
    init = require('./init')
var express = require('express');
var passport = require('passport');
var helpers = require('../routes/helpers/helpers');
var util = require('util');

////////////////////////////////////////////////////////////////////////////
// LIST OF REQUIRED TESTS
// must have functioning buttons: next, saved_datasets, clear_filters
// Filters work: substring;ENV_source, domain;pub/priv; and metadata
// project list: visible; permissions??; functional
//var regular_user    = {user:'TEST',pass:'TEST',first:'TestTest',last:'TestTest',email:'test@mbl.edu',inst:'MBL'}

// for testing to work these datasets need to be in the vamps_testing database:
// AND the correct dataset files should be in /public/json/vamps_testing--datasets/ (hint: run INITIALIZE_ALL_FILES.py)
//======================================================================================
var test_project = 'ICM_LCY_Bv6'  // small project and few datasets
var test_datasets = ['LCY_0001_2003_05_11','LCY_0003_2003_05_04','LCY_0005_2003_05_16','LCY_0007_2003_05_04']
//======================================================================================

describe('>>> visualization functionality: visuals_index  >>>', function(){
  //      Should show the closed project list on initialize
  //      The javascript functions (load_project_select, set_check_project, open_datasets, toggle_selected_datasets)
  //        should work to open the project (show and check the datasets) when either the plus image is clicked or the
  //        checkbox is selected. Clicking the minus image should deselect the datasets and close the dataset list.
  //        While the project is open clicking on the project checkbox should toggle all the datasets under it.
  //      Clicking the submit button when no datasets have been selected should result in an alert box and a
  //      return to the page.

    before(function (done) {
        test_name_hash = {}
        test_name_hash.name = []
        test_name_hash.ids  = []
        test_selection_obj  = {}

        connection = require('../config/database-test');
        var q = "SELECT dataset, dataset_id from dataset where dataset in ('"+test_datasets.join("','")+"')"
        console.log(q)

        connection.query(q, function(err, result) {
            if (err) {throw err;}
            for(r in result){
              console.log(result[r].dataset_id)
              test_name_hash.name.push(test_project+'--'+result[r].dataset)
              test_name_hash.ids.push(result[r].dataset_id)
            }
            // reqbody_vindex = { chosen_id_name_hash:test_name_hash, selection_obj:test_selection_obj, title:'mytitle' };
            // reqbody_uselect = { dataset_ids:JSON.stringify(test_name_hash.ids),retain_data:'1',Next2:'Next: Unit Selection2' };
            // reqbody_vizselect = { tax_depth:'family',
            //                   unit_choice: 'tax_silva108_simple',
            //                   domains: [ 'Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown' ],
            //                   selected_metadata: [ 'latitude', 'longitude' ]
            //                 };

        });

        // login with passport-stub
        var passportStub = require('passport-stub');
        passportStub.install(app);
        console.log('Logging in with username:',app.testuser.user,' and password:',app.testuser.pass);
        passportStub.login({
          username: app.testuser.user, password: app.testuser.pass
        });
        //this.timeout(10000);
        done();
    });

    // VISUALS INDEX (Dataset Selection Page)
    it('should have certain text', function(done){
        //var body = { chosen_id_name_hash:test_name_hash, selection_obj:test_selection_obj, title:'mytitle' };
        var reqbody_vindex = { chosen_id_name_hash:test_name_hash, selection_obj:test_selection_obj, title:'mytitle' };
        //this.timeout(5000);
        request(app)
          .post('/visuals/visuals_index')
          .send(reqbody_vindex)
          .expect(200)
          .end(function (err, res) {
            res.text.should.containEql('Dataset Selection Page');
            done();
          });
    })


      // UNIT_SELECTION PAGE
    it('should show one or more datasets in selected datasets list as well as certain metadata', function(done){
      var reqbody_uselect = { dataset_ids:JSON.stringify(test_name_hash.ids),retain_data:'1',Next2:'Next: Unit Selection2' };
      request(app)
      .post('/visuals/unit_selection')
      .send(reqbody_uselect)
      .expect(200)
      .end(function (err, res) {
        if (err) { throw new Error(err); }
          res.text.should.containEql(test_name_hash.ids[0]);
          res.text.should.containEql(test_name_hash.name[0]);
          // req metadata
          res.text.should.containEql('longitude');
          res.text.should.containEql('latitude');
          // custom matadata
          res.text.should.containEql('envo_feature');
          res.text.should.containEql('envo_biome');
          res.text.should.containEql('envo_material');
          done();

        });
    });
    //
    // VIEW_SELECTION PAGE
    //
    it('should show a certain text: family', function(done){
        var reqbody_vizselect = { tax_depth: 'family',
                                  unit_choice: 'tax_silva108_simple',
                                  domains: [ 'Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown' ],
                                  selected_metadata: [ 'latitude', 'longitude' ]
                                };
        request(app)
          // .post('/visuals/view_selection')
          .post('/visuals/unit_selection')
          .send(reqbody_vizselect)
          .expect(200)
          .end(function (err, res) {
            this.timeout(5000);
            console.log("VVV visual. res:")
            console.log(util.inspect(res, false, null));
            res.text.should.containEql('Taxonomic Depth: family');

            //res.text.should.containEql('Taxonomic Depth: species');
            done();
          });
    });

    it('should show a heatmap', function(done){
        var body = {tax_depth:'phylum',
                    unit_choice: 'tax_silva108_simple',
                    domains: [ 'Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown' ],
                    selected_metadata: [ 'latitude', 'longitude' ]
                  };
        request(app)
          .post('/visuals/heatmap')
          .send(body)
          .expect(200)
          .end(function (err, res) {
            //this.timeout(5000);
            res.text.should.containEql('Taxonomic Depth: species');
            done();
          });
    });

});


//describe('visuals_index', function(){


//});

//       // it('should show project/datasets', function(done){
//       //   request(app)
//       //     .get('/visuals/visuals_index')
//       //     .expect(200)
//       //     .end(function (err, res) {
//       //       res.text.should.containEql('SLM_NIH_Bv6');
//       //       res.text.should.containEql('SS_WWTP_1_25_11_2step'); // SS_WWTP_1_25_11_2step
//       //       done();
//       //     });
//       // });

// });
  //
  //
// describe('>>> visualization functionality: unit_selection  >>>', function(){
//     before(function (done) {
//         test_name_hash = {}
//         test_name_hash.name = []
//         test_name_hash.ids  = []
//         test_selection_obj  = {}
//         connection = require('../config/database-test');
//         var q = "SELECT dataset, dataset_id from dataset where dataset in ('"+test_datasets.join("','")+"')"
//         console.log(q)
//         connection.query(q, function(err, result) {
//             if (err) {throw err;}
//             for(r in result){
//               console.log(result[r].dataset_id)
//               test_name_hash.name.push(test_project+'--'+result[r].dataset)
//               test_name_hash.ids.push(result[r].dataset_id)
//             }
//         });
//         var passportStub = require('passport-stub');
//           passportStub.install(app);
//           console.log('Logging in with',app.testuser.user,app.testuser.pass);
//           passportStub.login({
//             username: app.testuser.user, password: app.testuser.pass
//         });
//           this.timeout(5000);
//         done()



//     });

//     it('should show one or more datasets in selected datasets list', function(done){
//       var body = { chosen_id_name_hash:JSON.stringify(test_name_hash), selection_obj:test_selection_obj, title:'mytitle', constants:'', md_cust:'',md_req:'' };
//       request(app)
//       .post('/visuals/unit_selection')
//       .send(body)
//       .expect(200)
//       .end(function (err, res) {
//         if (err) { throw new Error(err); }

//           body.title.should.containEql('mytitle');
//           body.chosen_id_name_hash.ids.should.not.equal([]);
//           res.text.should.containEql(test_name_hash.ids[0]);
//           res.text.should.containEql(test_name_hash.name[0]);

//           done();

//       });
//     });
// });

  //   it('The Submit button should return with an alert error if no Display_Output checkboxes are checked', function(done){
  //     var body = { };
  //     request(app)
  //     .post('/visuals/unit_selection')
  //     .send(body)
  //     .expect('Content-Type', /html/)
  //     .end(function (err, res) {
  //       if (err) {
  //         throw new Error(err);
  //       }
  //       else {

  //         done();
  //       }
  //     });
  //   });

  // });
  // //
  // //
  // describe('view_selection', function(){
  //   it('should show one or more Display_Output choices', function(done){
  //     var body = { visuals: ['counts_table', 'barcharts', 'heatmap'] };
  //     request(app)
  //     .post('/visuals/unit_selection')
  //     .send(body)
  //     .expect('Content-Type', /html/)
  //     .end(function (err, res) {
  //       if (err) {
  //         throw new Error(err);
  //       }
  //       else {
  //         body.visuals.should.not.equal([])
  //         body.visuals.should.not.equal(null)
  //         body.visuals.should.containEql('barcharts')
  //         done();
  //       }
  //     });
  //   });
  // });
  // //
  // //
  // describe('tax_silva108_simple partial', function(){
  //   it('should contain certain text', function(done){
  //     request(app)
  //     .get('/visuals/partials/tax_silva108_simple')
  //     .expect(200)
  //     .end(function (err, res) {
  //       res.text.should.containEql('Domains to Include');
  //       res.text.should.containEql('Archaea');
  //       res.text.should.containEql('Bacteria');
  //       done();
  //     });
  //   });
  // });
  // //
  // //
  // describe('tax_silva108_custom partial', function(){
  //   it('should contain certain text', function(done){
  //     request(app)
  //     .get('/visuals/partials/tax_silva108_custom')
  //     .expect(200)
  //     .end(function (err, res) {
  //       res.text.should.containEql('Silva(v108) Custom Taxonomy Selection');
  //       res.text.should.containEql('Archaea');
  //       res.text.should.containEql('Bacteria');
  //       done();
  //     });
  //   });
  // });
  // //
  // //
  // describe('counts_table', function(){
  //   it('should contain certain text', function(done){
  //     request(app)
  //       .get('/visuals/user_data/counts_table')
  //       .expect(200)
  //       .end(function (err, res) {
  //         res.text.should.containEql('VAMPS Counts Table');
  //         done();
  //       });
  //   });
  // });
  // //
  // //
  // describe('heatmap', function(){
  //   it('should contain certain text', function(done){
  //     request(app)
  //     .get('/visuals/user_data/heatmap')
  //     .expect(200)
  //     .end(function (err, res) {
  //       res.text.should.containEql('VAMPS Heatmap');
  //       done();
  //     });
  // });
  // });
  // //
  // //
  // describe('barcharts', function(){
  //   it('should contain certain text', function(done){
  //         request(app)
  //           .get('/visuals/user_data/barcharts')
  //           .expect(200)
  //           .end(function (err, res) {
  //             res.text.should.containEql('VAMPS Bar Charts');
  //             done();
  //           });
  //   });
  // });
  // //
  // //
  // describe('functions tests', function(){
  //     it ('isLoggedIn should redirect to "/" if user not logged in');
  //     it ('isLoggedIn should show the page? if user logged in');
  //     it ('IsJsonString should parse str');

  // });

//});

// var myCode = require('../routes/visuals/visualization.js')








