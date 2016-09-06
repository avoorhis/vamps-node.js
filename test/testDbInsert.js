// See results in vamps_testing
var passportStub = require('passport-stub');
var util = require('util');

var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');

process.env.NODE_ENV = 'test';

beforeEach(function() {
  passportStub.logout();
});

 
describe('Req 1: Landing page functionality', function(){
  before(function (done) {
  // it('Insert into DB', function(done){
    
    this.timeout(5000);
    async.series([
      function (cb) {
        var q1 = "INSERT INTO project (`project`, `title`, `project_description`, `rev_project_name`, `funding`, `owner_user_id`, `public`) VALUES ('test_gast_project', 'new Title', 'new description', REVERSE('test_gast_project'), '000', 1, 1);";
        
        connection.query(q1, function(err){
            done();
          });
      },
      // function (cb) {
      //   connection.query('SELECT * FROM project;', function(err, results){
      //     console.log("results")
      //     console.log(util.inspect(results, false, null));
      //   
      //     results.length.should.equal(22);
      //     results[2].project.should.containEql("test_gast_project21");
      //     done();
      //     });
      // }
    ], done);
  });
  it('1.1 Text of landing page', function(done){
    request(app)
      .get('/')
      .expect(200)
      .end(function (err, res) {
        // console.log("EEE res");
        // console.log(util.inspect(res, false, null));
        
        res.text.should.containEql('Visualizations');
        done();
      });
  });
  
  it('1.2 Link to the login page', function(done){
      connection.query('SELECT * FROM project;', function(err, results){
        console.log("results111")
        console.log(util.inspect(results, false, null));
      
        results.length.should.equal(2);
        results[1].project.should.containEql("test_gast_project");
        done();
      });
  });
});
// Find the rest of the test code in the source link below 