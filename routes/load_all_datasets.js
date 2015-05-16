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
  
  connection.db.query(queries.get_select_datasets_query(), function(err, rows, fields){
      ALL_DATASETS                = {};  // GLOBAL
      DATASET_NAME_BY_DID         = {};  // GLOBAL
      PROJECT_ID_BY_DID           = {};
      PROJECT_INFORMATION_BY_PID  = {};  // GLOBAL
	  PROJECT_INFORMATION_BY_PNAME= {};  // 0 if public otherwise == user id
      DATASET_IDS_BY_PID          = {};
      DatasetsWithLatLong         = {} 
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
  
  connection.db.query(queries.get_select_sequences_query(), function(err, rows, fields){    
    ALL_DCOUNTS_BY_DID = {};    // GLOBAL  
    ALL_PCOUNTS_BY_PID = {};    // GLOBAL 
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
  });
};

// ALL_DATASETS
// { projects:
//    [ { name: 'SLM_NIH_Bv6', datasets: [Object] },
//      { name: 'SLM_NIH_v1', datasets: [Object] },
//      { name: 'SLM_NIH_v2', datasets: [Object] },
//      { name: 'KCK_MHB_Bv6', datasets: [Object] },
//      { name: 'SLM_NIH_Bv4v5', datasets: [Object] } ] }

// connection.query(qSelectDatasets, function(err, rows, fields){
//     if (err)  {
//       throw err;
//     } else {

//       for (i in rows){
//         project = rows[i].project
//         did = rows[i].did
//         dataset = rows[i].dataset
//         if (project===undefined){ continue }
//         if (project in DATASETS){
//             global.DATASETS[project].push({ 'did':did,'dname':dataset })
//         } else {
//             global.DATASETS[project] = [{ 'did':did,'dname':dataset }]
//         }
//       }


//     }
//     module.exports = global.DATASETS;
// });








