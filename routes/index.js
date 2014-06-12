var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'VAMPS-Node.js' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' })
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "email" : userEmail
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.location("userlist");
            // And forward to success page
            res.redirect("userlist");
        }
    });
});

/* GET visualization page. */
router.get('/visualization', function(req, res) {
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
    var qDatasets = "SELECT project, projects.id as pid, dataset, datasets.id as did FROM datasets JOIN projects on (projects.id=project_id)"
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
			
			
			//console.log( JSON.stringify(datasets_by_project_all) );
			var simpleTaxonomy = {"domains":[ {'id':1,'name':"Archaea"},
			                                  {'id':2,'name':"Bacteria"},
			                                  {'id':5,'name':"Eukarya"},
			                                  {'id':3,'name':"Organelle"},
			                                  {'id':4,'name':"Unknown"}
			                                ]}
			                                
			var unitSelect = {"units":[ 
							{'id' : 'tax_silva116_simple',	'name' : "Taxonomy Silva116 Simple Selection"},
			                {'id' : 'tax_silva116_custom',	'name' : "Taxonomy Silva116 Custom Selection"},
			                {'id' : 'tax_gg_simple',			'name' : "Taxonomy Greengenes Simple Selection"},
			                {'id' : 'tax_gg_custom',			'name' : "Taxonomy Greengenes Custom Selection"},
			                {'id' : 'tax_rdp',				'name' : "Taxonomy RDP Selection"},
			                {'id' : 'otus',					'name' : "OTU Selection"},
			                {'id' : 'med_nodes',				'name' : "MED Nodes Selection"}
			                           ]}  
			console.log(JSON.stringify(unitSelect));                                                             
			res.render('visualization',{    title   : 'Show Datasets!', 
			                                rows    : JSON.stringify(datasetsByProjectAll),
			                                taxonomy: JSON.stringify(simpleTaxonomy),
			                                units	: JSON.stringify(unitSelect)
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