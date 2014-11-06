var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');
var passportStub = require('passport-stub');
var helpers = require('../routes/helpers/helpers');

var csvMetadataUpload = require('../models/csv_metadata_upload.js');
var csv_metadata_db = new csvMetadataUpload();

beforeEach(function() {
  passportStub.logout();    
});

before(function() {

  // passportStub.logout();    

  /*jshint multistr: true */
  connection.query("DROP table if exists custom_metadata_18", function(err, rows, fields) {
    if (err) {throw err;}
  });

  connection.query("TRUNCATE table custom_metadata_fields", function(err, rows, fields) {
    if (err) {throw err;}
  });

  connection.query("TRUNCATE table required_metadata_info", function(err, rows, fields) {
    if (err) {throw err;}
  });

  console.log('before every test');
});

// describe('csv_metadata_model', function(){
// 
//   it('get_dataset_ids', function (done) {
// 
//       this.timeout(5000);
//       async.series([
//         function (cb) {
//           connection.query('SELECT * FROM user WHERE username="TEST"'+
//                 ' AND email="TEST"',function(err,results){
//               results.length.should.not.equal(0);
//               done();
//             });
//         }
//       ], done);
//     });
// 
// });
