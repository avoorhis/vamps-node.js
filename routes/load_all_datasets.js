
// LOAD_ALL_DATASETS.js
const express = require('express');
let router = express.Router();
const queries = require('./queries');
const helpers = require('./helpers/helpers');
const config  = require('../config/config');
const async = require('async');
const global_vars_controller = require(app_root + '/controllers/globalVarsController');
const global_vars = new global_vars_controller.GlobalVars();
const C		  = require(app_root + '/public/constants');
//
//
//

//console.log(queries.qSequenceCounts)
// This connection object is made global in app.js:  var routes = require('./routes/index');  and in routes/index: 
module.exports.get_datasets = callback => {
    C.PROJECT_INFORMATION_BY_PID  = {};
    C.ALL_CLASSIFIERS_BY_CID      = {};
    C.ALL_DATASETS                = {};
    C.DATASET_NAME_BY_DID         = {};
    C.PROJECT_ID_BY_DID           = {};
    C.PROJECT_INFORMATION_BY_PNAME= {};  // 0 if public otherwise == user id
    C.DATASET_IDS_BY_PID          = {};
    C.ALL_CLASSIFIERS_BY_PID      = {};
    C.DatasetsWithLatLong         = {};
    C.AllMetadataNames            = [];
    C.ALL_DATASETS.projects       = [];
    C.ALL_USERS_BY_UID            = {};
    C.ALL_USERS_BY_UnK            = {};
    C.ALL_DCOUNTS_BY_DID          = {};
    C.ALL_PCOUNTS_BY_PID          = {};
    C.ALL_CLASSIFIERS_BY_PID      = {};
    C.USER_GROUPS                 = {};
  // Metadata ids and values lookups
    C.MD_ENV_ENVO                 = {};
    C.MD_ENV_CNTRY                = {};
    C.MD_ENV_LZC                  = {};
    C.MD_ENV_PACKAGE              = {};
    C.MD_DOMAIN                   = {};
    C.MD_DNA_REGION               = {};
    C.MD_TARGET_GENE              = {};
    C.MD_SEQUENCING_PLATFORM      = {};
    C.MD_3LETTER_ADAPTER          = {};
    C.MD_ADAPTER_SEQUENCE         = {};
    C.MD_ILLUMINA_INDEX           = {};
    C.MD_PRIMER_SUITE             = {};
    C.MD_RUN                      = {};
    C.MD_CUSTOM_UNITS             = {};
    C.MD_CUSTOM_FIELDS_UNITS      = {};


  connection.query(queries.get_select_datasets_query(), (err, rows, fields) => {
      if (err)  {
		    console.log('Query error: ' + err);
		    console.log(err.stack);
		    process.exit(1);
      }
      else {
        console.log('Filling GLOBAL Variables (in routes/load_all_datasets.js and global_vars.run_select_datasets_query):');
        //datasetsByProject.projects = []
        global_vars.run_select_datasets_query(rows);

      }
      console.log(' INITIALIZING C.ALL_DATASETS');
      //console.log(JSON.stringify(ALL_DATASETS));
      console.log(' INITIALIZING C.PROJECT_ID_BY_DID');
      console.log(' INITIALIZING C.PROJECT_INFORMATION_BY_PID');
      console.log(' INITIALIZING C.PROJECT_INFORMATION_BY_PNAME');
      console.log(' INITIALIZING C.DATASET_IDS_BY_PID');
      console.log(' INITIALIZING C.DATASET_NAME_BY_DID');
      console.log(' INITIALIZING C.AllMetadataNames');
      console.log(' INITIALIZING C.DatasetsWithLatLong');

      callback(C.ALL_DATASETS); // Filled in in helpers (ALL_DATASETS.projects.push(tmp);)
  });

  connection.query(queries.get_all_user_query(), (err, rows, fields) => {
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {

        for (var i=0; i < rows.length; i++) {
          var uid = rows[i].uid;
            C.ALL_USERS_BY_UID[uid] = {};
            C.ALL_USERS_BY_UID[uid].email       = rows[i].email;
            C.ALL_USERS_BY_UID[uid].username    = rows[i].username;
            C.ALL_USERS_BY_UID[uid].last_name   = rows[i].last_name;
            C.ALL_USERS_BY_UID[uid].first_name  = rows[i].first_name;
            C.ALL_USERS_BY_UID[uid].institution = rows[i].institution;
            C.ALL_USERS_BY_UID[uid].status      = rows[i].security_level;
            C.ALL_USERS_BY_UID[uid].groups = [];

          var uniq_key = rows[i].first_name + "#" + rows[i].last_name + "#" + rows[i].email + "#" + rows[i].institution;
            C.ALL_USERS_BY_UnK[uniq_key] = {};
            C.ALL_USERS_BY_UnK[uniq_key].user_id     = rows[i].uid;
            C.ALL_USERS_BY_UnK[uniq_key].email       = rows[i].email;
            C.ALL_USERS_BY_UnK[uniq_key].username    = rows[i].username;
            C.ALL_USERS_BY_UnK[uniq_key].last_name   = rows[i].last_name;
            C.ALL_USERS_BY_UnK[uniq_key].first_name  = rows[i].first_name;
            C.ALL_USERS_BY_UnK[uniq_key].institution = rows[i].institution;
            C.ALL_USERS_BY_UnK[uniq_key].status      = rows[i].security_level;
            C.ALL_USERS_BY_UnK[uniq_key].groups = [];
        }
        connection.query(queries.get_all_user_groups(), (err, rows, fields) => {
          if (err)  {
            console.log('Query error: ' + err);
            console.log(err.stack);
            process.exit(1);
          } else {
            for (var i=0; i < rows.length; i++) {
                var uid = rows[i].uid
                var group = rows[i].group;

                if(typeof C.ALL_USERS_BY_UID[uid] !== 'undefined' && C.ALL_USERS_BY_UID[uid].groups.indexOf(group) === -1 ){
                    C.ALL_USERS_BY_UID[uid].groups.push(group);
                }
            }
          }
        })

      }
      console.log(' INITIALIZING C.ALL_USERS_BY_UID and C.ALL_USERS_BY_UnK');
  });

  connection.query(queries.get_select_classifier_query(), (err, rows, fields) => {

      //console.log(qSequenceCounts)
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {

        for (var i=0; i < rows.length; i++) {
      	  C.ALL_CLASSIFIERS_BY_CID[rows[i].cid] =  rows[i].classifier+'_'+rows[i].database;
        }
      }
      console.log(' INITIALIZING C.ALL_CLASSIFIERS_BY_CID');
  });

  connection.query(queries.get_select_env_term_query(), (err, rows, fields) => {
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        global_vars.get_select_env_term_query(rows);
      }
      console.log(' INITIALIZING C.MD_ENV_ENVO');
      console.log(' INITIALIZING C.MD_ENV_CNTRY');
      console.log(' INITIALIZING C.MD_ENV_LZC');
  });
 ///////////////////////////////////////////

  var ug_array = []
  for(var gp in config.user_groups){
      //console.log('gp',gp)
      C.USER_GROUPS[gp] = []
    //ug_array.push(config.user_groups[gp])
    // console.log(config.user_groups[gp])
//     if(Array.isArray(config.user_groups[gp])){
//         console.log('UG is array')
// 
//     }else{
//         console.log('UG is not Array')
//     }
    var q = 'SELECT project_id FROM project '+ config.user_groups[gp]
    ug_array.push({'q':q,'gp':gp})
  }
  //console.log(ug_array)
  //ug_array = ['one','two']
  async.eachSeries(ug_array, fakeAsyncApi,
      err => {
        if (err) {
          console.log('An error occurred!');
          console.log(err);
          return;
        }
        console.log('INITIALIZING C.USER_GROUPS');

      }
  );


  ///////////////////////////////////////////////////
  connection.query(queries.get_select_env_package_query(), (err, rows, fields) => {
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      }
      else {
        global_vars.get_select_env_package_query(rows);
      }
      console.log(' INITIALIZING C.MD_ENV_PACKAGE');
  });
  connection.query(queries.get_select_domain_query(), (err, rows, fields) => {
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        global_vars.get_select_domain_query(rows);
      }
      console.log(' INITIALIZING C.MD_DOMAIN');
  });
  connection.query(queries.get_select_dna_region_query(), (err, rows, fields) => {
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        global_vars.get_select_dna_region_query(rows);
      }
      console.log(' INITIALIZING C.MD_DNA_REGION');
  });

  connection.query(queries.get_select_target_gene_query(),  (err, rows, fields) => {
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        global_vars.get_select_target_gene_query(rows);
      }
      console.log(' INITIALIZING C.MD_TARGET_GENE');
  });

  connection.query(queries.get_select_sequencing_platform_query(), (err, rows, fields) => {
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        global_vars.get_select_sequencing_platform_query(rows);
      }
      console.log(' INITIALIZING C.MD_SEQUENCING_PLATFORM');
  });

  connection.query(queries.get_select_Illumina_3letter_adapter_query(), (err, rows, fields) => {
    if (err)  {
      console.log('Query error: ' + err);
      console.log(err.stack);
      process.exit(1);
    } else {
      global_vars.get_select_Illumina_3letter_adapter_query(rows);
    }
    console.log(' INITIALIZING C.MD_3LETTER_ADAPTER');
  });

    connection.query(queries.get_select_adapter_sequence_query(), (err, rows, fields) => {
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        global_vars.get_select_adapter_sequence_query(rows);
      }
      console.log(' INITIALIZING C.MD_ADAPTER_SEQUENCE');
  });
  connection.query(queries.get_select_illumina_index_query(), (err, rows, fields) => {
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        global_vars.get_select_illumina_index_query(rows);
      }
      console.log(' INITIALIZING C.MD_ILLUMINA_INDEX');
  });

  connection.query(queries.get_select_primer_suite_query(), (err, rows, fields) => {
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        global_vars.get_select_primer_suite_query(rows);
      }
      console.log(' INITIALIZING C.MD_PRIMER_SUITE');


  });
  connection.query(queries.get_select_run_query(), (err, rows, fields) => {
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        global_vars.get_select_run_query(rows);
      }
      console.log(' INITIALIZING C.MD_RUN');
  });

  // slow query
  connection.query(queries.get_select_seq_count_query(), (err, rows, fields) => {

      //console.log(qSequenceCounts)
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      }
      else {
        global_vars.get_select_seq_counts_query(rows);

      }

      console.log(' INITIALIZING C.ALL_DCOUNTS_BY_DID');
      console.log(' INITIALIZING C.ALL_PCOUNTS_BY_PID');
      console.log(' INITIALIZING C.ALL_CLASSIFIERS_BY_PID');
  });

  connection.query(queries.get_select_custom_units_query(), (err, rows, fields) => {
    // console.time("TIME: connection queries.get_select_custom_units_query");
    if (err)  {
      console.log('Query error: ' + err);
      console.log(err.stack);
      process.exit(1);
    } else {
      global_vars.get_select_custom_units_query(rows);
    }
    console.log(' INITIALIZING C.MD_CUSTOM_UNITS');
    // console.timeEnd("TIME: connection queries.get_select_custom_units_query");
  });



};
///// For USER_GROUPS ////////////////////////
var fakeAsyncApi = (thing, callback) => {
  var gp = thing.gp   // group from config file
  var q = thing.q     // query from config file
  setTimeout( () => {
        connection.query(q, (err, rows, fields) => {
              if (err)  {
                console.log('Query error: ' + err);
                return
              }
//              console.log(rows)
              for(n in rows){
                  C.USER_GROUPS[gp].push(rows[n].project_id)
              }
            });
      //console.log("'"+thing.gp + "' processed");
      callback(null);

  }, 2000);
};  







