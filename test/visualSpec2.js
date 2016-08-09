process.env.NODE_ENV = 'test';

var async = require('async'),
    request = require('supertest'),
    assert = require('assert'),
    should = require('should'),
    app = require('../app'),
    http = require('http'),
    Browser = require('zombie'),  //headless browser
    connection = require('../config/database-test');

describe('visualization functionality:', function(){

		before(function() {
	    // In our tests we use the test db
	    //mongoose.connect(config.db.mongodb);
	    this.server = http.createServer(app).listen(3001);
	    this.browser = new Browser({ debug: true, site: 'http://localhost:3001' });
	
	  });
	  // load the contact page
	  beforeEach(function(done) {
	    this.browser.visit('/visuals/index_visuals', done());
	  });
	  //
	  //
	  describe('index_visuals', function(){

			// it('should show project list', function() {
		 //    assert.ok(this.browser.success);
		 //    assert.equal(this.browser.text('label#SLM_NIH_Bv6'), 'SLM_NIH_Bv6');
		 //    //assert.equal(this.browser.text('input#unit_selection'), 'Next: Unit Selection');
	  // 	});

	  // 	it('should refuse empty submissions', function(done) {
		 //    this.browser.pressButton('#unit_selection').then(function() {
		 //      // http://redotheweb.com/2013/01/15/functional-testing-for-nodejs-using-mocha-and-zombie-js.html
		 //      // http://zombie.labnotes.org/
		 //      assert.equal(window.location.pathname, "/visuals/index_visuals");
		 //      //assert.equal(browser.text('div.alert'), 'Please choose some data');
		 //    }).then(donedone());
		 //  });
	  	//
	  	//
	 		it('should send form when button is pressed', function(done) {
		    var browser = this.browser;
		    browser.check('#SLM_NIH_Bv6--pj-id');
		    //console.log(this.browser.html());
		    browser.pressButton('#unit_selection').then(function() {
			      //if (error) return done(error);
			      // http://redotheweb.com/2013/01/15/functional-testing-for-nodejs-using-mocha-and-zombie-js.html
			      // http://zombie.labnotes.org/
			      assert.fail();
			      //assert.equal(browser.text('div.alert'), 'Please choose some data');
			      console.log('see me1');
			      assert.equal('xx', "yy");
			      console.log('see me2');
			      //done();
		    	}).then(done(), done());
		  });

	 	});  // END describe index_visuals

	  after(function(done) {
	    this.server.close(done());
	  });

});