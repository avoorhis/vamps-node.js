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
	  DATASET_ID_BY_DNAME         = {};
      PROJECT_ID_BY_DID           = {};
      PROJECT_INFORMATION_BY_PID  = {};  // GLOBAL
	  PROJECT_INFORMATION_BY_PNAME= {};  // 0 if public otherwise == user id
      DATASET_IDS_BY_PID          = {};
	  ALL_CLASSIFIERS_BY_PID ={};
	  ALL_CLASSIFIERS_BY_CID={};
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
	  console.log(' INITIALIZING DATASET_ID_BY_DNAME');
	  console.log(' INITIALIZING AllMetadataNames');
	  console.log(' INITIALIZING DatasetsWithLatLong');
	  

      callback(ALL_DATASETS);
  });
  
  connection.db.query(queries.get_select_classifier_query(), function(err, rows, fields){    
    ALL_CLASSIFIERS_BY_CID = {};    // GLOBAL  
    
    //console.log(qSequenceCounts)
      if (err)  {
		  console.log('Query error: ' + err);
		  console.log(err.stack);
		  process.exit(1);
      } else {
	      for (var i=0; i < rows.length; i++) {
		  	ALL_CLASSIFIERS_BY_CID[rows[i].cid] =  rows[i].classifier;	
	  	  }
      }
      console.log(' INITIALIZING ALL_CLASSIFIERS_BY_CID');
      
  });
  
  connection.db.query(queries.get_select_sequences_query(), function(err, rows, fields){    
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
	  //console.log(JSON.stringify(ALL_CLASSIFIERS_BY_CID))
      console.log(' INITIALIZING ALL_DCOUNTS_BY_DID');
      console.log(' INITIALIZING ALL_PCOUNTS_BY_PID');
	  console.log(' INITIALIZING ALL_CLASSIFIERS_BY_PID');
  });
  

  
  // connection.db.query(queries.get_ranks_query('domain'), function(err, rows, fields){
  //
  // 	  	RANK_ID_BY_NAME = {};   // RANK_ID_BY_NAME['phylum']['Chloroflexi'] = 158
  // 		RANK_ID_BY_NAME['domain'] = {};
  //     if (err)  {
  // 		  console.log('Query error: ' + err);
  // 		  console.log(err.stack);
  // 		  process.exit(1);
  //     } else {
  //       helpers.run_ranks_query('domain',rows);
  //     }
  //     console.log(" INITIALIZING RANK_ID_BY_NAME['domain']");
  // });
  // connection.db.query(queries.get_ranks_query('phylum'), function(err, rows, fields){
  // 		RANK_ID_BY_NAME['phylum'] = {};
  //     if (err)  {
  // 		  console.log('Query error: ' + err);
  // 		  console.log(err.stack);
  // 		  process.exit(1);
  //     } else {
  //       helpers.run_ranks_query('phylum',rows);
  //     }
  //     console.log(" INITIALIZING RANK_ID_BY_NAME['phylum']");
  //
  // });
  // connection.db.query(queries.get_ranks_query('klass'), function(err, rows, fields){
  // 		RANK_ID_BY_NAME['klass'] = {};
  //     if (err)  {
  // 		  console.log('Query error: ' + err);
  // 		  console.log(err.stack);
  // 		  process.exit(1);
  //     } else {
  //       helpers.run_ranks_query('klass',rows);
  //     }
  //     console.log(" INITIALIZING RANK_ID_BY_NAME['klass']");
  //
  // });
  // connection.db.query(queries.get_ranks_query('order'), function(err, rows, fields){
  // 		RANK_ID_BY_NAME['order'] = {};
  //     if (err)  {
  // 		  console.log('Query error: ' + err);
  // 		  console.log(err.stack);
  // 		  process.exit(1);
  //     } else {
  //       helpers.run_ranks_query('order',rows);
  //     }
  //     console.log(" INITIALIZING RANK_ID_BY_NAME['order']");
  //
  // });
  // connection.db.query(queries.get_ranks_query('family'), function(err, rows, fields){
  // 		RANK_ID_BY_NAME['family'] = {};
  //     if (err)  {
  // 		  console.log('Query error: ' + err);
  // 		  console.log(err.stack);
  // 		  process.exit(1);
  //     } else {
  //       helpers.run_ranks_query('family',rows);
  //     }
  //     console.log(" INITIALIZING RANK_ID_BY_NAME['family']");
  //
  // });
  // connection.db.query(queries.get_ranks_query('genus'), function(err, rows, fields){
  // 		RANK_ID_BY_NAME['genus'] = {};
  //     if (err)  {
  // 		  console.log('Query error: ' + err);
  // 		  console.log(err.stack);
  // 		  process.exit(1);
  //     } else {
  //       helpers.run_ranks_query('genus',rows);
  //     }
  //     console.log(" INITIALIZING RANK_ID_BY_NAME['genus']");
  //
  // });
  // connection.db.query(queries.get_ranks_query('species'), function(err, rows, fields){
  // 		RANK_ID_BY_NAME['species'] = {};
  //     if (err)  {
  // 		  console.log('Query error: ' + err);
  // 		  console.log(err.stack);
  // 		  process.exit(1);
  //     } else {
  //       helpers.run_ranks_query('species',rows);
  //     }
  //     console.log(" INITIALIZING RANK_ID_BY_NAME['species']");
  //
  // });
  // connection.db.query(queries.get_ranks_query('strain'), function(err, rows, fields){
  // 		RANK_ID_BY_NAME['strain'] = {};
  //     if (err)  {
  // 		  console.log('Query error: ' + err);
  // 		  console.log(err.stack);
  // 		  process.exit(1);
  //     } else {
  //       helpers.run_ranks_query('strain',rows);
  //     }
  //     console.log(" INITIALIZING RANK_ID_BY_NAME['strain']");
  // 	  //console.log(JSON.stringify(RANK_ID_BY_NAME))
  // });
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








