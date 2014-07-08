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