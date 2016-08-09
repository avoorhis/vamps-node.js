process.env.NODE_ENV = 'testing'
var request = require('supertest'),
    should = require('should'),
		app = require('../app')
    

////////////////////////////////////////////////////////////////////////////
// LIST OF REQUIRED TESTS
// functional links (test each)
// VAMPS Home
// Overview
// Visualizations
// Your Data
// Search
// Contact Us
// Admin (only if admin)
// Links:
//	Account, PubProjectList,DistributionMap,Metadata,ExportData,Overview,FAQ,ContactUs
// IMPORTANT:: login/logout and register

describe('<<< MenuBar functionality >>>', function(){
	it('link to the VAMPS Home page', function(done){
    done();
	});
	it('link to the Overview page', function(done){
    done();		
	});
	it('link to the Visualizations page', function(done){
    done();
	});
	it('link to the Your Data page', function(done){
    done();		
	});
	it('link to the Search page', function(done){
    done();
	});

	it('link to the login page', function(done){
    request(app)
      .get('/')
      .expect(200)
      .end(function (err, res) {
        res.text.should.containEql('/users/login');
        done();
      });
  });


});