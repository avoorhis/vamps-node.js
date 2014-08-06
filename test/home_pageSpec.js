var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');

describe('Home page functionality', function(){
  // before(function (done) {
  //   this.timeout(5000);


    //
    // var query = connection.query('INSERT IGNORE INTO users (username, encrypted_password, first_name, last_name, email, institution) VALUES ("TEST","7kT94LYj7y5RnJVb34jrJw==","TEST","TEST","TEST","TEST")', function(err, result) {
    //   if (err) throw err;
    //
    //   // console.log(query.sql);
    //
    //   console.log("result.insertId: " + result.insertId);
    //   console.log("=========");
    // });
    //
    // connection.query('SELECT * FROM users WHERE username="TEST"'+
    //         ' AND email="TEST"', function(err, rows, fields) {
    //   if (err) throw err;
    //   // console.log("fields");
    //   // console.log(fields[0]);
    //
    //   rows[0].username.should.equal('TEST');
    //   rows[0].email.should.equal('TEST');
    //   rows[0].institution.should.equal('TEST');
    //   rows[0].first_name.should.equal('TEST');
    //   rows[0].last_name.should.equal('TEST');
    //   rows[0].active.should.equal(0);
    //   rows[0].security_level.should.equal(50);
    //   rows[0].encrypted_password.should.equal('7kT94LYj7y5RnJVb34jrJw==');
    //
    //   fields[0].table.should.equal('users');
    //
    //   done();
    // });

/*
    async.series([
      function (cb) {
        connection.query('INSERT IGNORE INTO user (username, encrypted_password, first_name, last_name, email, institution) VALUES ("TEST","7kT94LYj7y5RnJVb34jrJw==","TEST","TEST","TEST","TEST")';
,function(err){
            done();
          });
      },

      function (cb) {
        connection.query('SELECT * FROM user WHERE username="TEST"'+
          ' AND email="TEST"',function(err){
           results.length.should.not.equal(0);
          console.log("results111");
          console.log(results);

           done();
         });
      }
    ], done);
*/

  // });

  it('Text of home page', function(done){
    request(app)
      .get('/')
      .expect(200)
      .end(function (err, res) {
        res.text.should.include('VAMPS');
        done();
      });
  });

  it('Link to the login page', function(done){
    request(app)
      .get('/')
      .expect(200)
      .end(function (err, res) {
        res.text.should.include('/users/login');
        done();
      });
  });

  it('Link to the login page', function(done){
    request(app)
      .get('/helloworld')
      .expect(200)
      .end(function (err, res) {
        res.text.should.include('Hello!');
        done();
      });
  });

});
