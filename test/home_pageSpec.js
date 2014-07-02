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

			console.log("result.insertId: " + result.insertId);
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
