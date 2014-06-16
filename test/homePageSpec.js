var async = require('async'),
  request = require('supertest'),
  should = require('should'),
  app = require('../app'),
  connection = require('../database');

// 1.1 Home Page Requirements:
// 1.2 Should contain certain text:  'Visualization'
// 1.3 Should have links: login,Community Visualization,....

describe('HomePage', function(){
  before(function (done) {
	this.timeout(5000);
	async.series([
		function (cb) {
			connection.query('INSERT INTO mocha_test_table '+
				'VALUE("TEST","TEST","","");',function(err){
					done();
				});
		},
		function (cb) {
		connection.query('SELECT * FROM mocha_test_table WHERE user_name="TEST"'+
			' AND email="TEST";',function(err,results){
				results.length.should.not.equal(0);
				done();
			});
		}
	], done);
  });
  it('1.1 Text of home page', function(done){
	request(app)
	.get('/')
	.expect(200)
	.end(function (err, res) {
	  res.text.should.include('Visualization');
	  done();
    });
  });
});