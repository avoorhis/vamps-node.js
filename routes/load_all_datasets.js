// LOAD_ALL_DATASETS.js
var express = require('express');
var router = express.Router();
var queries = require('./queries');
var helpers = require('./helpers/helpers');
//
//
//

//console.log(queries.qSequenceCounts)
// This connection object is made global in app.js:  var routes = require('./routes/index');  and in routes/index: 
module.exports.get_datasets = function(callback){
  PROJECT_INFORMATION_BY_PID  = {};  // GLOBAL
  
  connection.query(queries.get_select_datasets_query(), function(err, rows, fields){
      ALL_DATASETS                = {};  // GLOBAL
      DATASET_NAME_BY_DID         = {};  // GLOBAL
      PROJECT_ID_BY_DID           = {};
      
      PROJECT_INFORMATION_BY_PNAME= {};  // 0 if public otherwise == user id
      DATASET_IDS_BY_PID          = {};
      ALL_CLASSIFIERS_BY_PID      = {};
      
      DatasetsWithLatLong         = {};
      AllMetadataNames            = [];
      
	  
	  

      if (err)  {
		    console.log('Query error: ' + err);
		    console.log(err.stack);
		    process.exit(1);
      } else {

        console.log('Filling GLOBAL Variables (in routes/load_all_datasets.js and helpers.run_select_datasets_query):');

        
        ALL_DATASETS.projects = [];
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
        ALL_USERS_BY_UID            = {};
        for (var i=0; i < rows.length; i++) {
          ALL_USERS_BY_UID[rows[i].uid] = {}
          ALL_USERS_BY_UID[rows[i].uid].email       = rows[i].email;
          ALL_USERS_BY_UID[rows[i].uid].username    = rows[i].username;
          ALL_USERS_BY_UID[rows[i].uid].last_name   = rows[i].last_name;
          ALL_USERS_BY_UID[rows[i].uid].first_name  = rows[i].first_name;
          ALL_USERS_BY_UID[rows[i].uid].institution = rows[i].institution;
        }
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
        ALL_CLASSIFIERS_BY_CID      = {};
        for (var i=0; i < rows.length; i++) {
      	  ALL_CLASSIFIERS_BY_CID[rows[i].cid] =  rows[i].classifier+'_'+rows[i].database;	
        }
      }
      console.log(' INITIALIZING ALL_CLASSIFIERS_BY_CID');      
  });

  
  connection.query(queries.get_select_sequences_query(), function(err, rows, fields){    
      ALL_DCOUNTS_BY_DID = {};    // GLOBAL  
      ALL_PCOUNTS_BY_PID = {};    // GLOBAL 
      ALL_CLASSIFIERS_BY_PID = {}; 
      //console.log(qSequenceCounts)
      if (err)  {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        helpers.run_select_sequences_query(rows);		
        
      }
      
      console.log(' INITIALIZING ALL_DCOUNTS_BY_DID');
      console.log(' INITIALIZING ALL_PCOUNTS_BY_PID');
      console.log(' INITIALIZING ALL_CLASSIFIERS_BY_PID');
  });
  
  
  
  
};









