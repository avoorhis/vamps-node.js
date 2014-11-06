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

describe('csv_metadata_model', function(){

  it('get_dataset_ids', function (done) {
    project = "KCK_LSM_Bv6";
    datasets = "'071007st5b', 'LSM_0008_031808st6', 'LSM_0002_090407st6', '061307st4a', 'LSM_0004_110707st6', 'LSM_0005_010808st4', 'LSM_0001_090407st4', '081407st4b', '082107st7b', '061907st2', 'LSM_0006_010808st6', '080707st5b', '061907st4', '071007st6b', 'LSM_0007_031808st4', 'LSM_0003_110707st4', '082107st4', '080707st6b', '071007st4', '071007st3', '071007st2', '080707st3', '080707st4b', '010808st1', '080707st2b', '080707st7', '082107st6c', '082107st5', '082107st2', '082107st3'"

    csv_metadata_db.get_dataset_ids(project, datasets, function work_with_dataset_id(err, results)
    {
      if (err)
        throw err; // or return an error message, or something
      else
      {
        console.log(results)
      }

      // this.timeout(5000);
      // async.series([
      //   function (cb) {
      //     connection.query('SELECT * FROM user WHERE username="TEST"'+
      //           ' AND email="TEST"',function(err,results){
      //         results.length.should.not.equal(0);
      //         done();
      //       });
      //   }
      // ], done);
    });

});
