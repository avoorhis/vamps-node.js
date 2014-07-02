var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');


describe('Home page functionality', function(){
  before(function (done) {
	
    this.timeout(5000);

		connection.query("CREATE TABLE IF NOT EXISTS users (\
		  id int(11) NOT NULL AUTO_INCREMENT,\
		  username varchar(20) DEFAULT NULL,\
		  email varchar(64) NOT NULL DEFAULT '',\
		  institution varchar(128) DEFAULT NULL,\
		  first_name varchar(20) DEFAULT NULL,\
		  last_name varchar(20) DEFAULT NULL,\
		  active tinyint(3) unsigned NOT NULL DEFAULT '0',\
		  security_level tinyint(3) unsigned NOT NULL DEFAULT '50',\
		  encrypted_password varchar(255) NOT NULL DEFAULT '',\
		  reset_password_token varchar(255) DEFAULT NULL,\
		  reset_password_sent_at datetime DEFAULT NULL,\
		  remember_created_at datetime DEFAULT NULL,\
		  sign_in_count int(11) DEFAULT '0',\
		  current_sign_in_at datetime DEFAULT NULL,\
		  last_sign_in_at datetime DEFAULT NULL,\
		  current_sign_in_ip varchar(255) DEFAULT NULL,\
		  last_sign_in_ip varchar(255) DEFAULT NULL,\
		  confirmation_token varchar(255) DEFAULT NULL,\
		  confirmed_at datetime DEFAULT NULL,\
		  confirmation_sent_at datetime DEFAULT NULL,\
		  unconfirmed_email varchar(255) DEFAULT NULL,\
		  PRIMARY KEY (id),\
		  UNIQUE KEY contact_email_inst (first_name,last_name,email,institution),\
		  UNIQUE KEY username (username),\
		  UNIQUE KEY index_users_on_reset_password_token (reset_password_token),\
		  UNIQUE KEY index_users_on_confirmation_token (confirmation_token),\
		  KEY institution (institution(15))\
		) ENGINE=InnoDB;", function(err, rows, fields) {
		  if (err) throw err;
		});

		var query = connection.query('INSERT IGNORE INTO users (username, encrypted_password, first_name, last_name, email, institution) VALUES ("TEST","7kT94LYj7y5RnJVb34jrJw==","TEST","TEST","TEST","TEST")', function(err, result) {
		  if (err) throw err;

		  // console.log(query.sql); 

		  console.log("result.insertId: ");
		  console.log(result.insertId);
		  console.log("=========");
		});

		connection.query('SELECT * FROM users WHERE username="TEST"'+
        ' AND email="TEST"', function(err, rows, fields) {
		  if (err) throw err;
			// console.log("fields");
			// console.log(fields[0]);

		  rows[0].username.should.equal('TEST');
			rows[0].email.should.equal('TEST');
			rows[0].institution.should.equal('TEST');
			rows[0].first_name.should.equal('TEST');
			rows[0].last_name.should.equal('TEST');
			rows[0].active.should.equal(0);
			rows[0].security_level.should.equal(50);
			rows[0].encrypted_password.should.equal('7kT94LYj7y5RnJVb34jrJw==');

		  fields[0].table.should.equal('users');

			done();
		});
		
/*
    async.series([
      function (cb) {
        connection.query('INSERT IGNORE INTO users (username, encrypted_password, first_name, last_name, email, institution) VALUES ("TEST","7kT94LYj7y5RnJVb34jrJw==","TEST","TEST","TEST","TEST")';
,function(err){
            done();
          });
      },

      function (cb) {
        connection.query('SELECT * FROM users WHERE username="TEST"'+
          ' AND email="TEST"',function(err){
           results.length.should.not.equal(0);
	        console.log("results111");
	        console.log(results);
 
           done();
         });
      }
    ], done);
*/

  });

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
	
	/* What's this doing? */
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

