'use strict';

/*
* Modified from https://github.com/elliotf/mocha-mongoose
*/

var db = require('../config/database-test');
var mysql = require('mysql');

// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
//process.env.NODE_ENV = 'test';
console.log('in utils.js')
before( function connectDB(done) {
     //db.connect();
     console.dir(arguments);
     db.query("insert into mocha_test_table (user_name) VALUES('XXnameXX')",function(err, rows){
        if (err) {
           throw err;
         }else{
           console.log('tsec')
         }
  
    });
     done();
  
  
 // function clearDB() {
 //   for (var i in db.query('select * from users')) {
 //     console.log(i)
 //   }
 //   return done();
 // }

  
  
  
  
  
});
