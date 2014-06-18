var express = require('express');
var router = express.Router();
config = require('../config/config')
/* GET users listing. */
//router.get('/', function(req, res) {
 // res.send('respond with a visualization resource');
//});


/* GET visualization page. */
router.get('/', function(req, res) {
// {
//     2: {'pname': "BPC_MRB_C", 'datasets':[
//         {"id":244,"ds":"dataset244"}
//     ]},
//     6: {'pname':"SLM_NIH_Bv4v5", 'datasets':[
//         {"id":3,"dname":"1St_121_Stockton"},
//         {"id":4,"dname":"1St_120_Richmond"},
//         {"id":5,"dname":"1St_152_Metro_North"},
//         {"id":6,"dname":"1St_114_Hardinsburg"},
//         {"id":19,"dname":"1St_127_Pendleton"}
//     ]}
// }    
    var db = req.db;
    var qDatasets = "SELECT project, projects.id as pid, dataset, datasets.id as did"
    qDatasets    += " FROM datasets"
    qDatasets    += " JOIN projects ON (projects.id=project_id)"
    var collection = db.query(qDatasets, function (err, rows, fields){
    	if(err)	{
			throw err;
		}else{
			var datasetsByProjectAll = {};
			var projects = []
			var datasets_list = []
			var already_have_project
			datasetsByProjectAll.projects = projects
			for(n=0;n<rows.length;n++){
				//console.log(rows[n].dataset)
				//console.log(rows[n].project)
				pname   = rows[n].project
				pid     = rows[n].pid
				did     = rows[n].did
				dname   = rows[n].dataset
				dataset = {
				    "did"   : did,
				    "dname" : dname
				    }
				project = {
				    "pid"   : pid,
				    "pname" : pname
				    }
				 
				already_have_project = false
				for (var i=0; i<datasetsByProjectAll.projects.length; i++) {
				    if (datasetsByProjectAll.projects[i].pid == pid) {
				        // here we add our dataset to datasetsByProjectAll.projects[i].datasets.push(dataset)
				        datasetsByProjectAll.projects[i].datasets.push(dataset)
				        already_have_project = true
				    }
				}
				if(!already_have_project){
				    // add this dataset to it -- first one	
				    project.datasets = [dataset]
				    datasetsByProjectAll.projects.push(project)
				}	
			}
			
			
			
			                                

			console.log(JSON.stringify(config.unitSelect));                                                             
			res.render('visualization',{    title   : 'Show Datasets!', 
			                                rows    : JSON.stringify(datasetsByProjectAll),
			                                taxonomy: JSON.stringify(config.simpleTaxonomy),
			                                units	: JSON.stringify(config.unitSelect)
			                            })
		}
		
    });  
    
  
   
    
});


module.exports = router;

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}