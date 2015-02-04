// LOAD_ALL_DATASETS.js
var express = require('express');
var router = express.Router();
//
//
//
var qSelectDatasets = "SELECT project, title, dataset_id as did, project_id as pid, dataset, dataset_description";
qSelectDatasets += " FROM dataset";
qSelectDatasets += " JOIN project USING(project_id)";
qSelectDatasets += " ORDER BY project, dataset";

// This connection object is made global in app.js
module.exports.get_datasets = function(callback){
  connection.query(qSelectDatasets, function(err, rows, fields){
    var ALL_DATASETS = {};
    var pids         = {};
    var titles       = {};

      if (err)  {
        throw err;
      } else {
        var datasetsByProject = {};
        ALL_DATASETS.projects = [];
        //datasetsByProject.projects = []
        console.log('GETTING ALL DATASETS FROM DB-3');

        for (var i=0; i < rows.length; i++) {
          var project = rows[i].project;
          
          var did = rows[i].did;
          pids[project] = rows[i].pid;
          titles[project] = rows[i].title;
          var dataset = rows[i].dataset;
          var dataset_description = rows[i].dataset_description;
          if (project === undefined){ continue; }
          if (project in datasetsByProject){
              datasetsByProject[project].push({ did:did, dname:dataset, ddesc: dataset_description});
          } else {
              datasetsByProject[project] = [{ did:did, dname:dataset, ddesc: dataset_description }];
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
      callback(ALL_DATASETS);
  });
};

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








