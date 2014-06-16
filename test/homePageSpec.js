var async = require('async'),
  request = require('supertest'),
  should = require('should'),
  app = require('../app')
  

// 1.1 Home Page Requirements:
// 1.2 Should contain certain text:  'Visualization'
// 1.3 Should have links: login,Community Visualization,....

describe('HomePage', function(){
  
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