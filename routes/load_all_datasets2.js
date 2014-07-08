// LOAD_ALL_DATASETS.js
var express = require('express');
var router = express.Router();
//
//
//
var qSelectDatasets = "SELECT project, datasets.id as did, dataset"
qSelectDatasets += " FROM datasets"
qSelectDatasets += " JOIN projects ON (projects.id=project_id)"
qSelectDatasets += " ORDER BY project,dataset"

// This connection object is made global in app.js
module.exports.get_datasets = function(callback){
	connection.query(qSelectDatasets, function(err, rows, fields){
	  	if(err)	{
	  		throw err;
		  }else{
				var datasetsByProject = {}	
				var DATASETS = {}
	  		DATASETS.projects = []
				//datasetsByProject.projects = []
				console.log('GETTING DATASETS FROM DB-3')
	  		for(i in rows){
	  			project = rows[i].project
	  			did = rows[i].did
	  			dataset = rows[i].dataset
	  			if(project===undefined){ continue }
	        if(project in datasetsByProject){
	            datasetsByProject[project].push({ did:did,dname:dataset })
	        }else{
	            datasetsByProject[project] = [{ did:did, dname:dataset }]
	        }
	  		}
	  		
	  		for(p in datasetsByProject){
	  			tmp = {}
	  			tmp.name = p
	  			tmp.datasets = []
	  			for(d in datasetsByProject[p]){
	  				ds = datasetsByProject[p][d].dname
	  				did = datasetsByProject[p][d].did
	  				tmp.datasets.push({ did:did, dname:ds })
	  			}
	  			DATASETS.projects.push(tmp)
	  		}
	  		
	  	}
	  	callback(DATASETS);
	});
};

// { projects: 
//    [ { name: 'SLM_NIH_Bv6', datasets: [Object] },
//      { name: 'SLM_NIH_v1', datasets: [Object] },
//      { name: 'SLM_NIH_v2', datasets: [Object] },
//      { name: 'KCK_MHB_Bv6', datasets: [Object] },
//      { name: 'SLM_NIH_Bv4v5', datasets: [Object] } ] }

// connection.query(qSelectDatasets, function(err, rows, fields){
//   	if(err)	{
//   		throw err;
//   	}else{
  		
//   		for(i in rows){
//   			project = rows[i].project
//   			did = rows[i].did
//   			dataset = rows[i].dataset
//   			if(project===undefined){ continue }
//         if(project in DATASETS){
//             global.DATASETS[project].push({ 'did':did,'dname':dataset })
//         }else{
//             global.DATASETS[project] = [{ 'did':did,'dname':dataset }]
//         }
//   		}
  		
  		
//   	}
//   	module.exports = global.DATASETS;
// });








