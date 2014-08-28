var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');

describe('projects pages', function(){
    it('The index_projects page should show all projects', function(done){
      request(app)
      .get('/projects/index_projects')
      .end(function (err, res) {
        res.text.should.include('VAMPS Projects Listing');
       // res.text.should.include('-- Human Microbiome Pouchitis Project; HMP Pouchitis Project, Healthy Patient 308, V6V4 region')
        res.text.should.include('/projects/2');
        done();
      });      
    }
    );
    
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


});
