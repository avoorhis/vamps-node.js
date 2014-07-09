var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');

describe('visualization functionality', function(){
	it('Text on index_visuals page', function(done){
    request(app)
      .get('/visuals/index_visuals')
      .expect(200)
      .end(function (err, res) {
        res.text.should.include('Dataset Selection Page');
        done();
      });
  });

	it('The index_visuals page should show project/datasets');
	it('The index_visuals page should show logged in user');

	it('Text on counts_table page');// , function(done){
	//     request(app)
	//       .get('/visuals/counts_table')
	//       .expect(200)
	//       .end(function (err, res) {
	//         res.text.should.include('Dataset Selection Page');
	//         done();
	//       });
	//   });

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
  
	it('Text on tax_silva108_custom page');// , function(done){
	//     request(app)
	//       .get('/visuals/partials/tax_silva108_custom')
	//       .expect(200)
	//       .end(function (err, res) {
	//         res.text.should.include('Domains to Include');
	//         done();
	//       });
	//   });

})

describe('projects pages', function(){
	it('Text on index_projects page', function(done){
    request(app)
    	.get('/projects/index_projects')
      .expect(200)
      .end(function (err, res) {
        res.text.should.include('VAMPS Projects Listing');
        res.text.should.include('/projects/2');
        done();
      });
		});		
		
		it('The index_projects page should show all projects');
		it('The index_projects page should show logged in user');
		
		it('Text on projects/2 page', function(done){
	    request(app)
	    	.get('/projects/2')
	      .expect(200)
	      .end(function (err, res) {
	        res.text.should.include('Project Profile');
	        res.text.should.include('<li>2</li>');
	        done();
	      });
			});
		
		
})
// var myCode = require('../routes/visuals/visualization.js')

describe('functions tests', function(){
    it ('isLoggedIn should redirect to "/" if user not logged in');
    it ('isLoggedIn should show the page? if user logged in');
    it ('IsJsonString should parse str');

})
