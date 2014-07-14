'use strict';

/*
* Modified from https://github.com/elliotf/mocha-mongoose
*/

var db = require('../config/database-test');
var mysql = require('mysql');

// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
process.env.NODE_ENV = 'test';

beforeEach(function (done) {
 function connectDB() {
     db.connect();
     done();
 }
 function remove_func() {}
 function clearDB() {
   for (var i=0; i < mongoose.connection.collections.length; i++) {
     mongoose.connection.collections[i].remove(remove_func());
   }
   return done();
 }


 if (mongoose.connection.readyState === 0) {
   mongoose.connect(config.db.test, function (err) {
     if (err) {
       throw err;
     }
     return clearDB();
   });
 } else {
   return clearDB();
 }
});
