process.env.NODE_ENV = 'testing'

var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');
var passportStub = require('passport-stub');
// passportStub.install(app);

process.env.NODE_ENV = 'test';

beforeEach(function() {
  passportStub.logout();
});

before(function() {

  // passportStub.logout();

  /*jshint multistr: true */
  connection.query("CREATE TABLE IF NOT EXISTS user (\
    user_id int(11) unsigned NOT NULL AUTO_INCREMENT,\
    username varchar(20) DEFAULT NULL,\
    email varchar(64) NOT NULL DEFAULT '',\
    institution varchar(128) DEFAULT NULL,\
    first_name varchar(20) DEFAULT NULL,\
    last_name varchar(20) DEFAULT NULL,\
    active tinyint(3) unsigned NOT NULL DEFAULT '0',\
    security_level tinyint(3) unsigned NOT NULL DEFAULT '50',\
    encrypted_password varchar(255) NOT NULL DEFAULT '',\
    sign_in_count int(11) DEFAULT '0',\
    current_sign_in_at datetime DEFAULT NULL,\
    last_sign_in_at datetime DEFAULT NULL,\
    PRIMARY KEY (user_id),\
    UNIQUE KEY contact_email_inst (first_name,last_name,email,institution),\
    UNIQUE KEY username (username),\
    KEY institution (institution(15))\
  ) ENGINE=InnoDB;", function(err, rows, fields) {
    if (err) {throw err;}
  });

  var query = connection.query('INSERT IGNORE INTO user (username, encrypted_password, first_name, last_name, email, institution) VALUES ("TEST","7kT94LYj7y5RnJVb34jrJw==","TEST","TEST","TEST","TEST")', function(err, result) {
    if (err) {throw err;}

    // console.log(query.sql);

    console.log("result.insertId: " + result.insertId);
    console.log("=========");
  });

  connection.query('SELECT * FROM user WHERE username="TEST"'+
        ' AND email="TEST"', function(err, rows, fields) {
    if (err) {throw err;}
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

    fields[0].table.should.equal('user');

  });
  console.log('before every test');
});

after(function() {
  connection.query("DELETE from user where username='TEST'")
})
