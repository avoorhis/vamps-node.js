process.env.NODE_ENV = 'testing'

var async = require('async'),
passportStub = require('passport-stub'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');

passportStub.install(app)

process.env.NODE_ENV = 'test';

describe('<<< projects pages: >>>', function(){
    it('the index_projects page should show all projects', function(done){
      request(app)
      .get('/projects/projects_index')
      .end(function (err, res) {
        res.text.should.containEql('Public Projects Listing');
       // res.text.should.containEql('-- Human Microbiome Pouchitis Project; HMP Pouchitis Project, Healthy Patient 308, V6V4 region')
        res.text.should.containEql('/projects/531');
        done();
      });      
    });
    
    it('Text on projects/531 page', function(done){
      request(app)
        .get('/projects/531')
        .expect(200)
        .end(function (err, res) {
          res.text.should.containEql('Project Profile');
          res.text.should.containEql('<li>2</li>');
          done();
        });
      });


});
