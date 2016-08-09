 process.env.NODE_ENV = 'testing'
 var async = require('async'),
    request = require('supertest'),
    should = require('should')

process.env.NODE_ENV = 'testing'
var app = require('../app')

    //connection = require('../config/database-test');



describe('<<< Home page functionality >>>', function(){


  it('Text of home page', function(done){
    request(app)
      .get('/')
      .expect(200)
      .end(function (err, res) {
        res.text.should.containEql('VAMPS');
        done();
      });
  });



  it('Link to Learn-more', function(done){
    request(app)
      .get('/')
      .expect(200)
      .end(function (err, res) {
        res.text.should.containEql('/help/overview');
        done();
      });
  });

});
