var express = require('express');
var router = express.Router();
var datasets = require('../../config/all_datasets')
//var helpers = require('./helpers')
var app = express();


//router.post('/unit_selection', isLoggedIn, function(req, res) {
router.post('/unit_selection',  function(req, res) {
  var db = req.db;
  var selection_obj = {};
  selection_obj.seq_ids = [];
  selection_obj.unit_assoc = {};
  var available_units = req.C.AVAILABLE_UNITS; // ['med_node_id','otu_id','taxonomy_gg_id']
  for(var i in available_units){
  	selection_obj.unit_assoc[available_units[i]]=[]
  }
  //selection_obj.unit_assoc.med_nodes = [];
  //selection_obj.unit_assoc.otus = [];
  //selection_obj.unit_assoc.tax = [];
  // var selection_obj = { 
  // 		seq_ids: [],
  // 		unit_assoc: 
  // 			{
  // 			  med_nodes: [],
  // 			  tax1: 	 [],
  // 			  otus: 	 []
  // 			}
  // 		};

  //console.log("Got response: " + res.statusCode);
  //console.log(req.body);
  // dataset selection +/- is checked in routes/visualization.js: check_for_no_datasets()
  //console.log(req.body);
  var dataset_ids = req.body.dataset_ids;
  //console.log(dataset_ids);
  var sql_str = ''
  for( var i in dataset_ids){
  	sql_str += "'"+dataset_ids[i]+"',"
  }
  sql_str = sql_str.replace(/,$/,'');
  
  
  var qSelectSeqID = "SELECT sequence_id, "+available_units+" from sequence_pdr_infos";
  qSelectSeqID +=    "  JOIN sequence_uniq_infos using(sequence_id)";
  qSelectSeqID +=    "  WHERE dataset_id in ("+sql_str+")";
  console.log(qSelectSeqID);

  db.query(qSelectSeqID, function(err, rows, fields){
  	if(err)	{
  		throw err;
  	}else{
  		
  		for(var k in rows){
  			selection_obj.seq_ids.push(rows[k].sequence_id);
  			for(u in available_units){
  				selection_obj.unit_assoc[available_units[u]].push(rows[k][available_units[u]])
  			}
  		}
  		// here get taxonomy_id, med_id, otu_id.... for each sequence_id from sequence_uniq_infos
  		// and keep them in the same order as the sequence_ids
  	}
  	console.log(selection_obj);
  	res.render('visuals/unit_selection', {   title: 'Unit Selection',
                  body: JSON.stringify(req.body),
                  selection_obj:JSON.stringify(selection_obj),
                  constants: JSON.stringify(req.C),
                              "user": req.user
                });

  });
  
  
  

});
/* GET visualization page. */
router.get('/',  function(req, res) {
  
  	projects_datasets = datasets.ALL
  	// could this projects_datasets list be filtered/limited here
  	// depending on user selected input or user access permissions?
    // console.log(JSON.stringify(projects_datasets));  
    res.render('visuals/index',{ title   : 'Show Datasets!',  
                                   rows    : JSON.stringify(projects_datasets)  ,
                                   "user": req.user  
                                    })
    
});

module.exports = router;

//
//
// F U N C T I O N S
//
//
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
      return next();
    }
    // if they aren't redirect them to the home page
    res.redirect('/');
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


