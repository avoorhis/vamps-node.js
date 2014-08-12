var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');

describe('visualization functionality on index_visuals', function(){
  //      Should show the closed project list on initialize
  //      The javascript functions (load_project_select, set_check_project, open_datasets, toggle_selected_datasets)
  //        should work to open the project (show and check the datasets) when either the plus image is clicked or the
  //        checkbox is selected. Clicking the minus image should deselect the datasets and close the dataset list.
  //        While the project is open clicking on the project checkbox should toggle all the datasets under it.
  //      Clicking the submit button when no datasets have been selected should result in an alert box and a
  //      return to the page.

  it('Text on index_visuals page', function(done){
    request(app)
      .get('/visuals/index_visuals')
      .expect(200)
      .end(function (err, res) {
        res.text.should.include('Dataset Selection Page');
        done();
      });
  });

  it('The index_visuals page should show project/datasets', function(done){
    request(app)
      .get('/visuals/index_visuals')
      .expect(200)
      .end(function (err, res) {
        res.text.should.include('BPC_MC_Bv6');
        res.text.should.include('20121014_mock_CGCTC');
        done();
      });
  });

  // Logged in as
  it('should log the user out');// , function (done) {
  //     request(app)
  //     .post('/users/login')
  //     .expect(200)
  //     .expect(302)
  //     .send({ username: 'TEST', password: 'TEST'})
  //     .get('/visuals/index_visuals')
  //     .expect(200)
  //     .end(function (err, res) {
  //       should.not.exist(err);
  //       res.text.should.include('(Logged in as: TEST)');
  //       done();
  //         // request(app)
  //         //           .get('/visuals/index_visuals')
  //         //           .expect(200)
  //           // .end(function (err, res) {
  //           //   if (err) return done(err);
  //           //   // res.text.should.not.include('Logged in as:');
  //           //   res.text.should.include('(Logged in as: TEST)');
  //           //   done();
  //           // });
  //       });
  //     });

  it('Text on counts_table page', function(done){
      request(app)
        .get('/visuals/user_data/counts_table')
        .expect(200)
        .end(function (err, res) {
          res.text.should.include('VAMPS Counts Table');
          done();
        });
    });

    it('Text on counts_table page', function(done){
        request(app)
          .get('/visuals/user_data/heatmap')
          .expect(200)
          .end(function (err, res) {
            res.text.should.include('VAMPS Heatmap');
            done();
          });
      });

      it('Text on counts_table page', function(done){
          request(app)
            .get('/visuals/user_data/barcharts')
            .expect(200)
            .end(function (err, res) {
              res.text.should.include('VAMPS Bar Charts');
              done();
            });
        });



  it('Text on tax_silva108_simple page', function(done){
    request(app)
      .get('/visuals/partials/tax_silva108_simple')
      .expect(200)
      .end(function (err, res) {
        res.text.should.include('Domains to Include');
        res.text.should.include('Archaea');
        res.text.should.include('Bacteria');
        done();
      });
  });

  it('Text on tax_silva108_custom page', function(done){
    request(app)
      .get('/visuals/partials/tax_silva108_custom')
      .expect(200)
      .end(function (err, res) {
        res.text.should.include('Silva(v108) Custom Taxonomy Selection');
        res.text.should.include('Archaea');
        res.text.should.include('Bacteria');
        done();
      });
  });

});

// var myCode = require('../routes/visuals/visualization.js')

describe('functions tests', function(){
    it ('isLoggedIn should redirect to "/" if user not logged in');
    it ('isLoggedIn should show the page? if user logged in');
    it ('IsJsonString should parse str');

});




describe('unit_selection', function(){
  it('Should show one or more datasets in list');
  it('Should show one or more visual choices');
  it('The Submit button should return with an alert error if no display checkboxes are checked');
//    There should be a 'default' Units Selection present (This point is debatable -- the other option
//        would be leave blank and force the user to select). I chose Silva108--Simple Taxonomy as default.
//    The 'Display Output' section should list the items from public/constants.js
//    The 'Normailzation' section should list the items from public/constants.js with the NotNormalized option
//        checked by default.
});

describe('view_selection page', function(){
  it('Should show one or more datasets in list');
  it('Should show one or more visual choices');
});

