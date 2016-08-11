var request = require('supertest'),
    should = require('chai').should();
    var util = require('util');
    // console.log(util.inspect(app.testuser, false, null));

describe('ImageController', function() {
  var agent = request.agent('http://localhost:3000/');

  before(function(done){
      agent
        .post('/users/login')
        .send({username: 'TEST', password: 'TEST'})
        .end(function(err, res) {
          if (err) return done(err);

          done();
        });
  })

  after(function(done){
      agent
        .get('/logout')
        .end(function(err, res) {
          if (err) return done(err);

          done();
        });
  })
  describe('POST /user_data/import_choices', function(){
    it('should return 201 for image creation after login', function (done) {
      agent
        .get('user_data/import_choices')
        // .send({name: 'test.png'})
        .end(function (err, res) {
          if (err) return done(err);
          console.log("TTT");
          console.log(util.inspect(res, false, null));

          res.status.should.be.equal(201);
          done();
        });
    });
  });
});