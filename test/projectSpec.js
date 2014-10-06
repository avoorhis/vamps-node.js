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
        res.text.should.containEql('VAMPS Projects Listing');
       // res.text.should.containEql('-- Human Microbiome Pouchitis Project; HMP Pouchitis Project, Healthy Patient 308, V6V4 region')
        res.text.should.containEql('/projects/2');
        done();
      });      
    }
    );
    
    it('Text on projects/2 page', function(done){
      request(app)
        .get('/projects/2')
        .expect(200)
        .end(function (err, res) {
          res.text.should.containEql('Project Profile');
          res.text.should.containEql('<li>2</li>');
          done();
        });
      });


});
