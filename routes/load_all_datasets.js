// LOAD_ALL_DATASETS.js
var express = require('express');
var router = express.Router();
var queries = require('./queries');
var helpers = require('./helpers/helpers');
var config  = require('../config/config');
var async = require('async');
//
//
//

//console.log(queries.qSequenceCounts)
// This connection object is made global in app.js:  var routes = require('./routes/index');  and in routes/index: 
module.exports.get_datasets = function(callback){
  PROJECT_INFORMATION_BY_PID  = {};  // GLOBAL
  ALL_CLASSIFIERS_BY_CID      = {};
  ALL_DATASETS                = {};  // GLOBAL
  DATASET_NAME_BY_DID         = {};  // GLOBAL
  PROJECT_ID_BY_DID           = {};
  PROJECT_INFORMATION_BY_PNAME= {};  // 0 if public otherwise == user id
  DATASET_IDS_BY_PID          = {};
  ALL_CLASSIFIERS_BY_PID      = {};
  DatasetsWithLatLong         = {};
  AllMetadataNames            = [];
  ALL_DATASETS.projects       = [];
  ALL_USERS_BY_UID            = {};
  ALL_DCOUNTS_BY_DID          = {};    // GLOBAL
  ALL_PCOUNTS_BY_PID          = {};    // GLOBAL
  ALL_CLASSIFIERS_BY_PID      = {};
    USER_GROUPS          = {};
  // Metadata ids and values lookups
  MD_ENV_ENVO                 = {};
  MD_ENV_CNTRY                = {};
  MD_ENV_LZC                  = {};
  MD_ENV_PACKAGE              = {};
  MD_DOMAIN                   = {};
  MD_DNA_REGION               = {};
  MD_TARGET_GENE              = {};
  MD_SEQUENCING_PLATFORM      = {};
  MD_ADAPTER_SEQUENCE         = {};
  MD_ILLUMINA_INDEX           = {};
  MD_PRIMER_SUITE             = {};
  MD_RUN                      = {};
  MD_CUSTOM_UNITS             = {};


  connection.query(queries.get_select_datasets_query(), function(err, rows, fields){
      if (err)  {
		    console.log('Query error: ' + err);
		    console.log(err.stack);
		    process.exit(1);
      } else {

        console.log('Filling GLOBAL Variables (in routes/load_all_datasets.js and helpers.run_select_datasets_query):');
        //datasetsByProject.projects = []
        helpers.run_select_datasets_query(rows);

      }
      console.log(' INITIALIZING ALL_DATASETS');
      //console.log(JSON.stringify(ALL_DATASETS));
      console.log(' INITIALIZING PROJECT_ID_BY_DID');
      console.log(' INITIALIZING PROJECT_INFORMATION_BY_PID');
      console.log(' INITIALIZING PROJECT_INFORMATION_BY_PNAME');
      console.log(' INITIALIZING DATASET_IDS_BY_PID');
      console.log(' INITIALIZING DATASET_NAME_BY_DID');
      console.log(' INITIALIZING AllMetadataNames');
      console.log(' INITIALIZING DatasetsWithLatLong');

      callback(ALL_DATASETS);
  });

  connection.query(queries.get_all_user_query(), function(err, rows, fields){
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {

        for (var i=0; i < rows.length; i++) {
          var uid = rows[i].uid
          ALL_USERS_BY_UID[uid] = {}
          ALL_USERS_BY_UID[uid].email       = rows[i].email;
          ALL_USERS_BY_UID[uid].username    = rows[i].username;
          ALL_USERS_BY_UID[uid].last_name   = rows[i].last_name;
          ALL_USERS_BY_UID[uid].first_name  = rows[i].first_name;
          ALL_USERS_BY_UID[uid].institution = rows[i].institution;
          ALL_USERS_BY_UID[uid].status      = rows[i].security_level;
          ALL_USERS_BY_UID[uid].groups = [];
        }
        connection.query(queries.get_all_user_groups(), function(err, rows, fields){
          if (err)  {
            console.log('Query error: ' + err);
            console.log(err.stack);
            process.exit(1);
          } else {
            for (var i=0; i < rows.length; i++) {
                var uid = rows[i].uid
                var group = rows[i].group;

                if(typeof ALL_USERS_BY_UID[uid] !== 'undefined' && ALL_USERS_BY_UID[uid].groups.indexOf(group) === -1 ){
                    ALL_USERS_BY_UID[uid].groups.push(group);
                }
            }
          }
        })

      }
      console.log(' INITIALIZING ALL_USERS_BY_UID');
  });

  connection.query(queries.get_select_classifier_query(), function(err, rows, fields){

      //console.log(qSequenceCounts)
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {

        for (var i=0; i < rows.length; i++) {
      	  ALL_CLASSIFIERS_BY_CID[rows[i].cid] =  rows[i].classifier+'_'+rows[i].database;
        }
      }
      console.log(' INITIALIZING ALL_CLASSIFIERS_BY_CID');
  });

  connection.query(queries.get_select_env_term_query(), function(err, rows, fields){
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        helpers.get_select_env_term_query(rows);
      }
      console.log(' INITIALIZING MD_ENV_ENVO');
      console.log(' INITIALIZING MD_ENV_CNTRY');
      console.log(' INITIALIZING MD_ENV_LZC');
  });
 ///////////////////////////////////////////

  var ug_array = []
  for(var gp in config.user_groups){
    //console.log('gp',gp)
    USER_GROUPS[gp] = []
    //ug_array.push(config.user_groups[gp])
    console.log(config.user_groups[gp])
    if(Array.isArray(config.user_groups[gp])){
        console.log('UG is array')

    }else{
        console.log('UG is not Array')
    }
    var q = 'SELECT project_id FROM project '+ config.user_groups[gp]
    ug_array.push({'q':q,'gp':gp})
  }
  //console.log(ug_array)
  //ug_array = ['one','two']
  async.eachSeries(ug_array, fakeAsyncApi,
      function(err) {
        if (err) {
          console.log('An error occurred!');
          console.log(err);
          return;
        }
        console.log('INITIALIZING USER_GROUPS');

      }
  )


  ///////////////////////////////////////////////////
  connection.query(queries.get_select_env_package_query(), function(err, rows, fields){
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        helpers.get_select_env_package_query(rows);
      }
      console.log(' INITIALIZING MD_ENV_PACKAGE');
  });
  connection.query(queries.get_select_domain_query(), function(err, rows, fields){
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        helpers.get_select_domain_query(rows);
      }
      console.log(' INITIALIZING MD_DOMAIN');
  });
  connection.query(queries.get_select_dna_region_query(), function(err, rows, fields){
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        helpers.get_select_dna_region_query(rows);
      }
      console.log(' INITIALIZING MD_DNA_REGION');
  });

  connection.query(queries.get_select_target_gene_query(), function(err, rows, fields){
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        helpers.get_select_target_gene_query(rows);
      }
      console.log(' INITIALIZING MD_TARGET_GENE');
  });

  connection.query(queries.get_select_sequencing_platform_query(), function(err, rows, fields){
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        helpers.get_select_sequencing_platform_query(rows);
      }
      console.log(' INITIALIZING MD_SEQUENCING_PLATFORM');
  });
    connection.query(queries.get_select_adapter_sequence_query(), function(err, rows, fields){
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        helpers.get_select_adapter_sequence_query(rows);
      }
      console.log(' INITIALIZING MD_ADAPTER_SEQUENCE');
  });
  connection.query(queries.get_select_illumina_index_query(), function(err, rows, fields){
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        helpers.get_select_illumina_index_query(rows);
      }
      console.log(' INITIALIZING MD_ILLUMINA_INDEX');
  });

  connection.query(queries.get_select_primer_suite_query(), function(err, rows, fields){
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        helpers.get_select_primer_suite_query(rows);
      }
      console.log(' INITIALIZING MD_PRIMER_SUITE');


  });
  connection.query(queries.get_select_run_query(), function(err, rows, fields){
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        helpers.get_select_run_query(rows);
      }
      console.log(' INITIALIZING MD_RUN');
  });

  // slow query
  connection.query(queries.get_select_seq_count_query(), function(err, rows, fields){

      //console.log(qSequenceCounts)
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        helpers.get_select_seq_counts_query(rows);

      }

      console.log(' INITIALIZING ALL_DCOUNTS_BY_DID');
      console.log(' INITIALIZING ALL_PCOUNTS_BY_PID');
      console.log(' INITIALIZING ALL_CLASSIFIERS_BY_PID');
  });


  connection.query(queries.get_select_custom_units_query(), function(err, rows, fields){
    console.time("TIME: connection queries.get_select_custom_units_query");
    if (err)  {
      console.log('Query error: ' + err);
      console.log(err.stack);
      process.exit(1);
    } else {
      helpers.get_select_custom_units_query(rows);
    }
    console.log(' INITIALIZING MD_CUSTOM_UNITS');
    console.timeEnd("TIME: connection queries.get_select_custom_units_query");
  });



};
///// For USER_GROUPS ////////////////////////
var fakeAsyncApi = function(thing, callback) {
  var gp = thing.gp   // group from config file
  var q = thing.q     // query from config file
  setTimeout(function() {
        connection.query(q, function(err, rows, fields){
              if (err)  {
                console.log('Query error: ' + err);
                return
              }
//              console.log(rows)
              for(n in rows){
                USER_GROUPS[gp].push(rows[n].project_id)
              }
            });
      //console.log("'"+thing.gp + "' processed");
      callback(null);

  }, 2000);
};  







