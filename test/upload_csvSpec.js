// jshint multistr: true 
var async = require('async'),
    request = require('supertest'),
    should = require('should')
    // app = require('../app'),
var passportStub = require('passport-stub');
var helpers = require('../routes/helpers/helpers');
connection = require('../config/database-test');

var csvMetadataUpload = require('../models/csv_metadata_upload.js');
var csv_metadata_db = new csvMetadataUpload();
var util = require('util');


beforeEach(function() {
  passportStub.logout();    
});

before(function() {

  // passportStub.logout();    

  connection.query("DROP table if exists custom_metadata_18", function(err, rows, fields) {
    if (err) {throw err;}
  });

  connection.query("TRUNCATE table custom_metadata_fields", function(err, rows, fields) {
    if (err) {throw err;}
  });

  connection.query("TRUNCATE table required_metadata_info", function(err, rows, fields) {
    if (err) {throw err;}
  });
  
  connection.query('INSERT IGNORE INTO user (user_id, username, email, institution, first_name, last_name, active, security_level, encrypted_password, sign_in_count, current_sign_in_at, last_sign_in_at) VALUES (6, "jhuber", "jhuber@mbl.edu", "Marine Biological Laboratory", "Julie", "Huber", "0", "50", "", "0", NULL, NULL)', function(err, result) 
  {
    if (err) {throw err;}
    // console.log(query.sql);
    // console.log("user.insertId: " + result.insertId);
    // console.log("=========");
  });
  
  connection.query('INSERT IGNORE INTO project (project_id, project, title, project_description, rev_project_name, funding, owner_user_id) VALUES ("18", "KCK_LSM_Bv6", "Little Sippewissett Marsh", "Anthropogenic impacts and  fecal populations at Little Sippewissett Marsh", "6vB_MSL_KCK", "Keck", "6")', function(err, result) 
  {
    if (err) {throw err;}
    // console.log("project.insertId: " + result.insertId);
    // console.log("=========");  
  });

  connection.query('INSERT IGNORE INTO env_sample_source (env_sample_source_id, env_source_name) VALUES (130, "water-marine")', function(err, result) 
  {
    if (err) {throw err;}
    // console.log("env_sample_source INSERT: ");
    // console.log(result);
    // console.log("=========");  
  });
  
  connection.query('INSERT IGNORE INTO dataset (dataset_id, dataset, dataset_description, env_sample_source_id, project_id) VALUES (387,"082107st5","082107st5",130,18), (395,"082107st6c","082107st6c",130,18), (392,"082107st7b","082107st7b",130,18), (404,"LSM_0001_090407st4","LSM_0001_090407st4",130,18), (401,"LSM_0002_090407st6","LSM_0002_090407st6",130,18)', function(err, result) 
  {
    if (err) {throw err;}
    // console.log("dataset INSERT: " );
    // console.log(result);
    // console.log("=========");  
  });
  

  console.log('before every test');
});

describe('csv_metadata_model', function(){

  it('get_dataset_ids', function (done) {
    project = "KCK_LSM_Bv6";
    datasets = '"082107st5", "082107st6c", "082107st7b", "LSM_0001_090407st4", "LSM_0002_090407st6"';

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
            // console.log("RRR results")
            // console.log(results[0].project)
            // console.log(results.length)
            results.length.should.equal(5);
            results[0].project.should.equal("KCK_LSM_Bv6");
          }
          // done();
        // connection.query('SELECT * FROM user WHERE username="TEST"'+
        //       ' AND email="TEST"', function(err,results){
        //     results.length.should.not.equal(0);
        //     done();
        //   });
        });
      }
    ], done());

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


  it('insert_custom_field_names', function (done) {
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
            res_message = '\'Records: 22  Duplicates: 0  Warnings: 0';
            results.message.should.equal(res_message);

            res_message = 22;
            results.affectedRows.should.equal(res_message);
          }
          done();
        });
      }
    ], done());

  });

  it('insert_required_field_names', function (done) {
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
    insert_into_required_metadata_info_txt = ['392, \'0\', \'y\', \'2007-08-21\', \'salt marsh metagenome\', \'GAZ:United States of America\', \'0.762\', \'saltmarsh sample 082107st7b\', \'0\', \'ENVO:marine salt marsh biome\', \'ENVO:salt marsh\', \'ENVO:brackish water\', \'41.57415\', \'-70.64215\', \'y\', \'1504975\'',
    '404, \'0\', \'y\', \'2007-09-04\', \'salt marsh metagenome\', \'GAZ:United States of America\', \'0.1524\', \'saltmarsh sample LSM.0001.090407st4\', \'0\', \'ENVO:marine salt marsh biome\', \'ENVO:salt marsh\', \'ENVO:brackish water\', \'41.576233\', \'-70.6336\', \'y\', \'1504975\'']

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
            res_affectedRows = 2;
            results.affectedRows.should.equal(res_message);
            
            // res_message = '&Records: 2  Duplicates: 0  Warnings: 0';
            // console.log("results TTT: ");
            // console.log(util.inspect(results, false, null));
            // ResultSetHeader {
            //   fieldCount: 0,
            //   affectedRows: 2,
            //   insertId: 1,
            //   serverStatus: 2,
            //   warningStatus: 0 }
            //
            // results.message.should.equal(res_message);

            res_warningStatus = 0;
            results.warningStatus.should.equal(res_warningStatus);
            
          }
          done();
        });
      }
    ], done());

  });


  it('select_custom_fields_names', function (done) {
    project_id = 18;
    this.timeout(5000);
    async.series([
      function (cb) 
      {
          csv_metadata_db.select_custom_fields_names(project_id, function get_custom_fields_names(err, custom_fields_names)      
        {
          if (err)
            throw err; // or return an error message, or something
          else
          {
            custom_fields_names.length.should.equal(22);
            // results[0].project.should.equal("KCK_LSM_Bv6");
          }
          done();
        // connection.query('SELECT * FROM user WHERE username="TEST"'+
        //       ' AND email="TEST"', function(err,results){
        //     results.length.should.not.equal(0);
        //     done();
        //   });
        });
      }
    ], done());
  });


  it('make_custom_table_per_pr', function (done) {
    custom_fields_names = [ { field_name: 'habitat', field_type: 'varchar(128)' },
      { field_name: 'temp', field_type: 'varchar(128)' },
      { field_name: 'salinity', field_type: 'varchar(128)' },
      { field_name: 'diss_oxygen', field_type: 'varchar(128)' },
      { field_name: 'collection_time', field_type: 'varchar(128)' },
      { field_name: 'type_sample', field_type: 'varchar(128)' },
      { field_name: 'environmental_zone', field_type: 'varchar(128)' },
      { field_name: 'specific_conductance',
        field_type: 'varchar(128)' },
      { field_name: 'dissolved_oxygen2', field_type: 'varchar(128)' },
      { field_name: 'absolute_depth_beta',
        field_type: 'varchar(128)' },
      { field_name: 'lat_lon', field_type: 'varchar(128)' },
      { field_name: 'conductivity', field_type: 'varchar(128)' },
      { field_name: 'longhurst_long_name',
        field_type: 'varchar(128)' },
      { field_name: 'volume_filtered', field_type: 'varchar(128)' },
      { field_name: 'fecal_coliform', field_type: 'varchar(128)' },
      { field_name: 'redox_state', field_type: 'varchar(128)' },
      { field_name: 'depth_start', field_type: 'varchar(128)' },
      { field_name: 'depth_end', field_type: 'varchar(128)' },
      { field_name: 'iho_area', field_type: 'varchar(128)' },
      { field_name: 'notes', field_type: 'varchar(128)' },
      { field_name: 'precipitation', field_type: 'varchar(128)' },
      { field_name: 'longhurst_zone', field_type: 'varchar(128)' } ];
    table_name = "custom_metadata_18";
  
    csv_metadata_db.make_custom_table_per_pr(custom_fields_names, project_id, function create_custom_table(err, results)
    {
      if (err)
        throw err; // or return an error message, or something
      else
      {
        // console.log("NNN make_custom_table_per_pr results"); 
        // console.log(results); 
        /*
        { fieldCount: 0,
          affectedRows: 0,
          insertId: 0,
          serverStatus: 2,
          warningCount: 0,
          message: '',
          protocol41: true,
          changedRows: 0 }
        
        */
        
        res_message = 2;
        results.serverStatus.should.equal(res_message);

        res_message = 0;
        results.warningCount.should.equal(res_message);

        res_message = "";
        results.message.should.equal(res_message);
      }        
      
      done();
    });
    
    connection.query('SHOW TABLES LIKE "custom_metadata_18"', function(err, results1){
        // console.log("results SELECT");
        // console.log(results1);
        results1.length.should.equal(1);
        results1[0]['Tables_in_vamps_js_testing (custom_metadata_18)'].should.equal('custom_metadata_18');
        done();
    });      
    done();
  });


  it('insert_required_field_names', function (done) {
    project_metadata_dict_w_ids = [ { sample_name: '082107st5',
      anonymized_name: '082107st5',
      description: 'saltmarsh sample 082107st5',
      taxon_id: '1504975',
      common_name: 'salt marsh metagenome',
      title: 'KCK_LSM_Bv6',
      altitude: '0',
      assigned_from_geo: 'y',
      collection_date: '8/21/2007',
      depth: '0.1524',
      country: 'GAZ:United States of America',
      elevation: '0',
      env_biome: 'ENVO:marine salt marsh biome',
      env_feature: 'ENVO:salt marsh',
      env_matter: 'ENVO:brackish water',
      habitat: 'salt marsh',
      latitude: '41.57523333',
      longitude: '-70.63535',
      temp: '18.8',
      salinity: '29.7',
      diss_oxygen: '65.625',
      collection_time: '7:18:00',
      public: 'y',
      type_sample: 'saltmarsh',
      environmental_zone: 'temperate',
      specific_conductance: '45.69',
      dissolved_oxygen2: '26.9',
      absolute_depth_beta: '266',
      lat_lon: 'unknown',
      conductivity: '40.28',
      longhurst_long_name: 'Coastal - NW Atlantic Shelves Province',
      volume_filtered: 'unknown',
      fecal_coliform: '36',
      redox_state: 'oxic',
      depth_start: '0.1524',
      depth_end: '0.1524',
      iho_area: 'North_Atlantic_Ocean',
      notes: 'Not as mucky.  Slight flow ou',
      precipitation: '0',
      longhurst_zone: 'NWCS',
      project_id: 18,
      dataset_id: 387,
      correct_dataset_name: '082107st5' },
      { sample_name: 'LSM.0001.090407st4',
        anonymized_name: 'LSM.0001.090407st4',
        description: 'saltmarsh sample LSM.0001.090407st4',
        taxon_id: '1504975',
        common_name: 'salt marsh metagenome',
        title: 'KCK_LSM_Bv6',
        altitude: '0',
        assigned_from_geo: 'y',
        collection_date: '9/4/2007',
        depth: '0.1524',
        country: 'GAZ:United States of America',
        elevation: '0',
        env_biome: 'ENVO:marine salt marsh biome',
        env_feature: 'ENVO:salt marsh',
        env_matter: 'ENVO:brackish water',
        habitat: 'salt marsh',
        latitude: '41.576233',
        longitude: '-70.6336',
        temp: '18.9',
        salinity: '21.2',
        diss_oxygen: '2.5',
        collection_time: '7:50',
        public: 'y',
        type_sample: 'saltmarsh',
        environmental_zone: 'temperate',
        specific_conductance: '33.73',
        dissolved_oxygen2: '0.9',
        absolute_depth_beta: '266',
        lat_lon: 'unknown',
        conductivity: '29.83',
        longhurst_long_name: 'Coastal - NW Atlantic Shelves Province',
        volume_filtered: 'unknown',
        fecal_coliform: '80',
        redox_state: 'oxic',
        depth_start: '0.1524',
        depth_end: '0.1524',
        iho_area: 'North_Atlantic_Ocean',
        notes: 'Very stagnant - dark, cloudy.  No film.  No breeze, buggy.',
        precipitation: 'unknown',
        longhurst_zone: 'NWCS',
        project_id: 18,
        dataset_id: 404,
        correct_dataset_name: 'LSM_0001_090407st4' }    
    ];
    table_name = "custom_metadata_18";
    custom_fields_names_arr = [ 'project_id',
      'dataset_id',
      'habitat',
      'temp',
      'salinity',
      'diss_oxygen',
      'collection_time',
      'type_sample',
      'environmental_zone',
      'specific_conductance',
      'dissolved_oxygen2',
      'absolute_depth_beta',
      'lat_lon',
      'conductivity',
      'longhurst_long_name',
      'volume_filtered',
      'fecal_coliform',
      'redox_state',
      'depth_start',
      'depth_end',
      'iho_area',
      'notes',
      'precipitation',
      'longhurst_zone' ];
    
    

    this.timeout(5000);
    async.series([
      function (cb) 
      {
        csv_metadata_db.insert_into_custom_metadata_per_pr(project_metadata_dict_w_ids, table_name, custom_fields_names_arr, function insert_into_custom_metadata(err, results)
        {
          if (err)
            throw err; // or return an error message, or something
          else
          {
            res_message = 2;
            results.affectedRows.should.equal(res_message);
            
            res_message = '&Records: 2  Duplicates: 0  Warnings: 0';
            results.message.should.equal(res_message);
          }
          done();
        });
      }
    ], done());

  });

});

