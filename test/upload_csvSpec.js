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

    this.timeout(5000);
    async.series([
      function (cb) 
      {
        csv_metadata_db.get_dataset_ids(project, datasets, function work_with_dataset_id(err, results)
        {
          if (err)
            throw err; // or return an error message, or something
          else
          {
            console.log("RRR results")
            console.log(results[0].project)
            console.log(results.length)
            results.length.should.equal(29);
            results[0].project.should.equal("KCK_LSM_Bv6");
          }
          done();
        // connection.query('SELECT * FROM user WHERE username="TEST"'+
        //       ' AND email="TEST"', function(err,results){
        //     results.length.should.not.equal(0);
        //     done();
        //   });
        });
      }
    ], done);

    // csv_metadata_db.get_dataset_ids(project, datasets, function work_with_dataset_id(err, results)
    // {
    //   if (err)
    //     throw err; // or return an error message, or something
    //   else
    //   {
    //     console.log("RRR results")
    //     console.log(results)
    //   }

    // });
  });


  it('get_dataset_ids', function (done) {
    insert_into_custom_fields_txt = [ '18, \'habitat\', \'salt marsh\'',
      '18, \'temp\', \'25.2\'',
      '18, \'salinity\', \'29.4\'',
      '18, \'diss_oxygen\', \'137.8125\'',
      '18, \'collection_time\', \'10:10:00\'',
      '18, \'type_sample\', \'saltmarsh\'',
      '18, \'environmental_zone\', \'temperate\'',
      '18, \'specific_conductance\', \'45.4\'',
      '18, \'dissolved_oxygen2\', \'63.3\'',
      '18, \'absolute_depth_beta\', \'266\'',
      '18, \'lat_lon\', \'unknown\'',
      '18, \'conductivity\', \'45.61\'',
      '18, \'longhurst_long_name\', \'Coastal - NW Atlantic Shelves Province\'',
      '18, \'volume_filtered\', \'1000\'',
      '18, \'fecal_coliform\', \'514\'',
      '18, \'redox_state\', \'oxic\'',
      '18, \'depth_start\', \'0.2032\'',
      '18, \'depth_end\', \'0.2032\'',
      '18, \'iho_area\', \'North_Atlantic_Ocean\'',
      '18, \'notes\', \'Little bit of light breeze int\'',
      '18, \'precipitation\', \'0.000254\'',
      '18, \'longhurst_zone\', \'NWCS\'' ]
    
    this.timeout(5000);
    async.series([
      function (cb) 
      {
        csv_metadata_db.insert_custom_field_names(insert_into_custom_fields_txt, function insert_db(err, results)
        {
          if (err)
            throw err; // or return an error message, or something
          else
          {
            res_message = '(Records: 22  Duplicates: 22  Warnings: 0';
            results.message.should.equal(res_message);
          }
          done();
        });
      }
    ], done);

  });


  it('get_dataset_ids', function (done) {
    req_fields = [ 'altitude',
      'assigned_from_geo',
      'collection_date',
      'common_name',
      'country',
      'depth',
      'description',
      'elevation',
      'env_biome',
      'env_feature',
      'env_matter',
      'latitude',
      'longitude',
      'public',
      'taxon_id' ];
    insert_into_required_metadata_info_txt = [ '398, \'0\', \'y\', \'2007-07-10\', \'salt marsh metagenome\', \'GAZ:United States of America\', \'0.2032\', \'saltmarsh sample 071007st5b\', \'0\', \'ENVO:marine salt marsh biome\', \'ENVO:salt marsh\', \'ENVO:sea water\', \'41.57523333\', \'-70.63535\', \'y\', \'1504975\'',
        '406, \'0\', \'y\', \'2008-03-18\', \'salt marsh metagenome\', \'GAZ:United States of America\', \'0.0508\', \'saltmarsh sample LSM.0008.031808st6\', \'0\', \'ENVO:marine salt marsh biome\', \'ENVO:salt marsh\', \'ENVO:brackish water\', \'41.57518333\', \'-70.6399\', \'y\', \'1504975\'']

    this.timeout(5000);
    async.series([
      function (cb) 
      {
        csv_metadata_db.insert_required_field_names(req_fields, insert_into_required_metadata_info_txt, function insert_db(err, results)
        {
          if (err)
            throw err; // or return an error message, or something
          else
          {
            res_message = '&Records: 2  Duplicates: 2  Warnings: 0';
            results.message.should.equal(res_message);
          }
          done();
        });
      }
    ], done);

  });


});

