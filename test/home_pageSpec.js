var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');


describe('Landing page functionality', function(){
  before(function (done) {
	
    this.timeout(5000);

    // var user = new User({
    //   email    : "TEST@user.com",
    //   firstName: "TEST",
    //   lastName : "TEST",
    //   password : "TEST"
    // });
    // user.save(done);

    async.series([
      function (cb) {
        connection.query('CREATE TABLE IF NOT EXISTS mocha_test_table(user_name varchar(10),'+
				  'email varchar(10),fname varchar(10),lname varchar(10));',function(err){
            done();
          });
      },

      function (cb) {
        connection.query('INSERT INTO mocha_test_table '+
          'VALUE("TEST","TEST","","");',function(err){
            done();
          });
      },

      function (cb) {
        connection.query('INSERT INTO users (username, encrypted_password, first_name, last_name, email, institution) VALUES ("TEST","7kT94LYj7y5RnJVb34jrJw==","TEST","TEST","TEST","TEST")',function(err){
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

  it('Text of landing page', function(done){
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
});

describe('Login page functionality', function(){
  before(function (done) {
	
    this.timeout(5000);
    async.series([
      function (cb) {
        connection.query(
          'SELECT * FROM mocha_test_table WHERE user_name="TEST'+
          '" AND email="TEST";',function(err,results){
            results.length.should.not.equal(0);
            done();
          });
      }
    ], done);
  });

  it('Text on login page', function(done){
    request(app)
      .get('/users/login')
      .expect(200)
      .end(function (err, res) {
        res.text.should.include('Username');
        done();
      });
  });

  it('Able to login with user "TEST"', function(done){
    request(app)
      .post('/users/login')
      .expect(302)
      .send({ username: 'TEST', password: 'TEST'})
      .end(function (err, res) {
        should.not.exist(err);
        // confirm the redirect
        res.header.location.should.include('/');
				res.header.location.should.not.include('login');
        done();
      });
  });

  it('should redirect to "/users/login" if authentication fails', function (done) {
    request(app)
      .post('/users/login')
      .expect(302)
      .send({ username: 'TEST1', password: 'TEST1'})
      .end(function (err, res) {
        res.header.location.should.not.include('/');
	      res.header.location.should.include('login');
        // console.log("res.header.location: ");
        // console.log(res.header.location);
        done();
      });
  });

/* How to check if I was checked in? */
	it('should log the user out', function (done) {
	  request(app)
	    .get('/users/logout')
	    .end(function (err, res) {
        res.header.location.should.include('/');
	      res.header.location.should.not.include('login');

	      if (err) return done(err);
	      request(app)
	        .get('/')
	        .end(function (err, res) {
	          if (err) return done(err);
	          res.text.should.not.include('Logged in as:');
	          res.text.should.include('login');
	          res.text.should.include('register');
	          done();
	        });
	    });
	});
});

describe('Form page functionality', function(){
  before(function (done) {
    this.timeout(5000);
    async.series([
      function (cb) {
        connection.query(
          'SELECT * FROM mocha_test_table WHERE fname="TEST'+
          '" AND lname="TEST";',function(err,results){
            done();
          });
      }
    ], done);
  });

  it('Text on form page', function(done){
    request(app)
      .post('/users/login')
      .expect(200)
      // .send({ username: 'TEST', email: 'TEST'})
      .send({ username: 'TEST', password: 'TEST'})
      .end(function (err, res) {
        res.text.should.include('Form');
        it('Need to be able to see the text for input box', function(done){
          res.text.should.include('<input type="text" name="fname">');
          done();
        });
        it('Need to be able to see all the previous inputs listed', function(done){
          res.text.should.include('<div> TEST TEST TEST TEST </div>');
          done();
        });
        done();
      });
  });
  
  it('Need to be able enter lname/fname values', function(done){
    request(app)
      .post('/form')
      .expect(200)
      .send({ username: 'TEST', email: 'TEST', fname: 'TEST1', lname: 'TEST1'})
      .end(function (err, res) {
        it('Need to be able to see entry in the database', function(done){
          connection.query(
            'SELECT * FROM mocha_test_table WHERE fname="TEST'+
            '" AND lname="TEST";',function(err,results){
              results.length.should.not.equal(0);
        console.log('here');
              done();
            });
        });
        it('Need to be able to see entry on the page', function(done){
          res.text.should.include('<div> TEST TEST TEST1 TEST1 </div>');
          done();
        });

        it('Need to see the link to the login page', function(done){
          res.text.should.include('<a href="/login">Exit</a>');
          done();
        });
        done();
      });
    });
});

