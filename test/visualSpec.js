// force the test environment to 'test'
process.env.NODE_ENV = 'testing'

var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app')
    init = require('./init')
////////////////////////////////////////////////////////////////////////////
// LIST OF REQUIRED TESTS
// must have functioning buttons: next, saved_datasets, clear_filters
// Filters work: substring;ENV_source, domain;pub/priv; and metadata
// project list: visible; permissions??; functional
//var regular_user    = {user:'TEST',pass:'TEST',first:'TestTest',last:'TestTest',email:'test@mbl.edu',inst:'MBL'}

describe('<<< visualization functionality: >>>', function(){
  //      Should show the closed project list on initialize
  //      The javascript functions (load_project_select, set_check_project, open_datasets, toggle_selected_datasets)
  //        should work to open the project (show and check the datasets) when either the plus image is clicked or the
  //        checkbox is selected. Clicking the minus image should deselect the datasets and close the dataset list.
  //        While the project is open clicking on the project checkbox should toggle all the datasets under it.
  //      Clicking the submit button when no datasets have been selected should result in an alert box and a
  //      return to the page.
  var passportStub = require('passport-stub');
  passportStub.install(app);
  console.log('Logging in with',app.test_user.user,app.test_user.pass);
  passportStub.login({
      username: app.test_user.user, password: app.test_user.pass

  });
  

  var test_name_hash = { ids: [ '135', '126', '122' ],
                          names: 
                           [ 'SLM_NIH_Bv4v5--01_Boonville',
                             'SLM_NIH_Bv4v5--02_Spencer',
                             'SLM_NIH_Bv4v5--03_Junction_City_East' ] 
                        }
  var test_selection_obj = { dataset_ids: [ '135', '126', '122' ],
                            seq_ids: 
                             [ [ 1002, 1003, 1004, 1005, 1007 ],
                               [ 1002, 1004, 1005 ],
                               [ 1002, 1004, 1005 ] ],
                            seq_freqs: [ [ 166, 1, 2, 264, 1 ], [ 149, 2, 252 ], [ 94, 4, 178 ] ],
                            unit_assoc: 
                               { silva_taxonomy_info_per_seq_id: [ [34,45,23], [10,11,21], [17,9,12] ]                             
                               } 
                           }
  
  describe('visuals_index', function(){
      it('should have certain text', function(done){
        var body = { chosen_id_name_hash:test_name_hash, selection_obj:test_selection_obj, title:'mytitle' };
        request(app)
          .post('/visuals/visuals_index')
          .send(body)
          .expect(200)
          .end(function (err, res) {
            res.text.should.containEql('Dataset Selection Page');
            done();
          });
      });

      it('should show project/datasets', function(done){
        request(app)
          .get('/visuals/visuals_index')
          .expect(200)
          .end(function (err, res) {
            res.text.should.containEql('SLM_NIH_Bv6');
            res.text.should.containEql('SS_WWTP_1_25_11_2step'); // SS_WWTP_1_25_11_2step
            done();
          });
      });

  });
  //
  //
  describe('unit_selection', function(){
    it('should show one or more datasets in list', function(done){
      var body = { chosen_id_name_hash:test_name_hash, selection_obj:test_selection_obj, title:'mytitle' };
      request(app)
      .post('/visuals/unit_selection')
      .send(body)
      .expect('Content-Type', /html/)
      .end(function (err, res) {
        if (err) {
          throw new Error(err);
        }
        else {
          body.title.should.containEql('mytitle');
          body.chosen_id_name_hash.ids.should.not.equal([]);
          body.chosen_id_name_hash.ids.should.containEql('135');
          body.chosen_id_name_hash.names.should.containEql('SLM_NIH_Bv4v5--01_Boonville');
          done();
        }
      });
    });
    
    it('The Submit button should return with an alert error if no Display_Output checkboxes are checked', function(done){
      var body = { };
      request(app)
      .post('/visuals/unit_selection')
      .send(body)
      .expect('Content-Type', /html/)
      .end(function (err, res) {
        if (err) {
          throw new Error(err);
        }
        else {
          
          done();
        }
      });
    });

  });
  //
  //
  describe('view_selection', function(){
    it('should show one or more Display_Output choices', function(done){
      var body = { visuals: ['counts_table', 'barcharts', 'heatmap'] };
      request(app)
      .post('/visuals/unit_selection')
      .send(body)
      .expect('Content-Type', /html/)
      .end(function (err, res) {
        if (err) {
          throw new Error(err);
        }
        else {
          body.visuals.should.not.equal([])
          body.visuals.should.not.equal(null)
          body.visuals.should.containEql('barcharts')
          done();
        }
      });
    });
  });
  //
  //
  describe('tax_silva108_simple partial', function(){
    it('should contain certain text', function(done){
      request(app)
      .get('/visuals/partials/tax_silva108_simple')
      .expect(200)
      .end(function (err, res) {
        res.text.should.containEql('Domains to Include');
        res.text.should.containEql('Archaea');
        res.text.should.containEql('Bacteria');
        done();
      });
    });
  });
  //
  //
  describe('tax_silva108_custom partial', function(){
    it('should contain certain text', function(done){
      request(app)
      .get('/visuals/partials/tax_silva108_custom')
      .expect(200)
      .end(function (err, res) {
        res.text.should.containEql('Silva(v108) Custom Taxonomy Selection');
        res.text.should.containEql('Archaea');
        res.text.should.containEql('Bacteria');
        done();
      });
    });
  });
  //
  //
  describe('counts_table', function(){
    it('should contain certain text', function(done){
      request(app)
        .get('/visuals/user_data/counts_table')
        .expect(200)
        .end(function (err, res) {
          res.text.should.containEql('VAMPS Counts Table');
          done();
        });
    });
  });
  //
  //
  describe('heatmap', function(){
    it('should contain certain text', function(done){
      request(app)
      .get('/visuals/user_data/heatmap')
      .expect(200)
      .end(function (err, res) {
        res.text.should.containEql('VAMPS Heatmap');
        done();
      });
  });
  });
  //
  //
  describe('barcharts', function(){
    it('should contain certain text', function(done){
          request(app)
            .get('/visuals/user_data/barcharts')
            .expect(200)
            .end(function (err, res) {
              res.text.should.containEql('VAMPS Bar Charts');
              done();
            });
    });
  });
  //
  //
  describe('functions tests', function(){
      it ('isLoggedIn should redirect to "/" if user not logged in');
      it ('isLoggedIn should show the page? if user logged in');
      it ('IsJsonString should parse str');

  });

});

// var myCode = require('../routes/visuals/visualization.js')








