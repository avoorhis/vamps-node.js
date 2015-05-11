// LOAD_ALL_DATASETS.js
var express = require('express');
var router = express.Router();
//
//
//
var qSelectDatasets = "SELECT project, title, dataset_id as did, project_id as pid, dataset, dataset_description, username, email, institution, first_name, last_name, env_source_name, owner_user_id,public";
qSelectDatasets += " FROM dataset";
qSelectDatasets += " JOIN project USING(project_id)";
qSelectDatasets += " JOIN user on(project.owner_user_id=user.user_id)";  // this will need to be changed when table user_project in incorporated
qSelectDatasets += " JOIN env_sample_source USING(env_sample_source_id)";
qSelectDatasets += " ORDER BY project, dataset";
console.log(qSelectDatasets)

var qSequenceCounts = "SELECT project_id, dataset_id, SUM(seq_count) as seq_count"; 
//var qSequenceCounts = "SELECT project_id, dataset_id, seq_count"; 
qSequenceCounts += " FROM sequence_pdr_info";
qSequenceCounts += " JOIN dataset using(dataset_id)";
qSequenceCounts += " GROUP BY project_id, dataset_id";
console.log(qSequenceCounts)
// This connection object is made global in app.js:  var routes = require('./routes/index');  and in routes/index: 
module.exports.get_datasets = function(callback){
  
  connection.db.query(qSelectDatasets, function(err, rows, fields){
      ALL_DATASETS                = {};  // GLOBAL
      DATASET_NAME_BY_DID         = {};  // GLOBAL
      PROJECT_ID_BY_DID           = {};
      PROJECT_INFORMATION_BY_PID  = {};  // GLOBAL
      DATASET_IDS_BY_PID          = {};
      PROJECT_PERMISSION_BY_PID   = {};  // 0 if public otherwise == user id
      var pids         = {};
      var titles       = {};
      if (err)  {
		  console.log('Query error: ' + err);
		  console.log(err.stack);
		  process.exit(1);
      } else {
        console.log('Filling GLOBAL Variables (in routes/load_all_datasets.js):');
        var datasetsByProject = {};
        ALL_DATASETS.projects = [];
        //datasetsByProject.projects = []
        

        for (var i=0; i < rows.length; i++) {
          var project = rows[i].project;
          var did = rows[i].did;
          var dataset = rows[i].dataset;
          var dataset_description = rows[i].dataset_description;
          var pid = rows[i].pid;
          var public = rows[i].public;
          var user_id = rows[i].owner_user_id;
          if(public){
            PROJECT_PERMISSION_BY_PID[pid] = 0;
          }else{
            PROJECT_PERMISSION_BY_PID[pid] = user_id;
          }
          PROJECT_ID_BY_DID[did]=pid;

          PROJECT_INFORMATION_BY_PID[pid] = {
            "last" :			rows[i].last_name,
            "first" :			rows[i].first_name,
            "username" :		rows[i].username,
            "email" :			rows[i].email,
            "env_source_name" :	rows[i].env_source_name,
            "institution" :		rows[i].institution,
            "project" :			project,
            "title" :			rows[i].title,
            "description" :		rows[i].description,
            "public" :          rows[i].public
          }
          if(pid in DATASET_IDS_BY_PID){
            DATASET_IDS_BY_PID[pid].push(did);
          }else{
            DATASET_IDS_BY_PID[pid]=[];
            DATASET_IDS_BY_PID[pid].push(did);
          }
          pids[project] = pid;
          titles[project] = rows[i].title;
          
          DATASET_NAME_BY_DID[did] = dataset
          
          if (project === undefined){ continue; }
          if (project in datasetsByProject){
              datasetsByProject[project].push({ did:did, dname:dataset, ddesc: dataset_description});
          } else {
              datasetsByProject[project] =   [{ did:did, dname:dataset, ddesc: dataset_description }];
          }
        }

        // todo: console.log(datasetsByProject.length); datasetsByProject - not an array
        for (var p in datasetsByProject){
          var tmp = {};
          tmp.name = p;
          tmp.pid = pids[p];
          tmp.title = titles[p];
          tmp.datasets = [];
          for (var d in datasetsByProject[p]){
            var ds = datasetsByProject[p][d].dname;
            var dp_did = datasetsByProject[p][d].did;  
            var ddesc = datasetsByProject[p][d].ddesc; 
            tmp.datasets.push({ did:dp_did, dname:ds, ddesc:ddesc });
          }
          ALL_DATASETS.projects.push(tmp);
        }

      }
      console.log('  ALL_DATASETS');
      console.log('  PROJECT_ID_BY_DID');
      console.log('  PROJECT_INFORMATION_BY_PID');
      console.log('  PROJECT_PERMISSION_BY_PID');
      console.log('  DATASET_IDS_BY_PID');
      console.log('  DATASET_NAME_BY_DID');
      
      callback(ALL_DATASETS);
  });
  
  connection.db.query(qSequenceCounts, function(err, rows, fields){    
    ALL_DCOUNTS_BY_DID = {};    // GLOBAL  
    ALL_PCOUNTS_BY_PID = {};    // GLOBAL 
    //console.log(qSequenceCounts)
      if (err)  {
		  console.log('Query error: ' + err);
		  console.log(err.stack);
		  process.exit(1);
      } else {
        
        for (var i=0; i < rows.length; i++) {
        //console.log(rows[i].project_id);
          var pid = rows[i].project_id;
          var did = rows[i].dataset_id;
          var count= rows[i].seq_count;
          ALL_DCOUNTS_BY_DID[did] = parseInt(count);
         //  if(did in ALL_DCOUNTS_BY_DID){
//              ALL_DCOUNTS_BY_DID[did] += parseInt(count);
//           }else{
//              ALL_DCOUNTS_BY_DID[did] = parseInt(count);
//           }

          if(pid in ALL_PCOUNTS_BY_PID){
             ALL_PCOUNTS_BY_PID[pid] += parseInt(count);
          }else{
             ALL_PCOUNTS_BY_PID[pid] = parseInt(count);
          }
        }
      }
      console.log('  ALL_DCOUNTS_BY_DID');
      console.log('  ALL_PCOUNTS_BY_PID');
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








