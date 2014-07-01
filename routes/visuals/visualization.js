var express = require('express');
var router = express.Router();
var all_datasets = require('../../config/all_datasets')
var dataset_accumulator = require('../../public/classes/dataset_accumulator')
//var helpers = require('./helpers')
var app = express();

// use the isLoggeIn function to limit exposure of page to
// logged in users only
//router.post('/unit_selection', isLoggedIn, function(req, res) {
router.post('/unit_selection',  function(req, res) {
  var db = req.db;
  
  var available_units = req.C.AVAILABLE_UNITS; // ['med_node_id','otu_id','taxonomy_gg_id']
  
  for(var i in available_units){
  	dataset_accumulator.unit_assoc[available_units[i]]=[]
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
  var id_count_list    = {}
  id_count_list.ids    = []
  id_count_list.names  = []
  for(var n in req.body.dataset_ids){
  	items = req.body.dataset_ids[n].split('--')
    id_count_list.ids.push(items[0])
    id_count_list.names.push(items[1]+'--'+items[2])
  	//dataset_accumulator.dataset_ids.push(items[0])
  	//dataset_accumulator.dataset_names.push(items[1]+'--'+items[2])
  	//dataset_accumulator.ds_counts.push(items[3])

  }
  //console.log(id_count_list);
    
  var qSelectSeqID = "SELECT dataset_id, seq_count, sequence_id, "+available_units+" from sequence_pdr_infos";
  qSelectSeqID +=    "  JOIN sequence_uniq_infos using(sequence_id)";
  qSelectSeqID +=    "  WHERE dataset_id in (" + id_count_list.ids + ")";
  console.log(qSelectSeqID);
  //console.log(dataset_accumulator.getTotalSequenceCount());
  
  
  db.query(qSelectSeqID, function(err, rows, fields){
  	if(err)	{
  		throw err;
  	}else{
  		
      var dsets = {}
      // here get taxonomy_id, med_id, otu_id.... for each sequence_id from sequence_uniq_infos
  		// and keep them in the same order as the sequence_ids
  		for(var k in rows){

        if(rows[k].dataset_id in dsets){
          dsets[rows[k].dataset_id].seq_ids.push(rows[k].sequence_id)
          dsets[rows[k].dataset_id].seq_counts.push(rows[k].seq_count)
          for(u in available_units){
            dsets[rows[k].dataset_id].unit_assoc[available_units[u]].push(rows[k][available_units[u]])
          }
        }else{
          dsets[rows[k].dataset_id] = {}
          dsets[rows[k].dataset_id].seq_ids = [rows[k].sequence_id]
          dsets[rows[k].dataset_id].seq_counts = [rows[k].seq_count]
          dsets[rows[k].dataset_id].unit_assoc = {}
          for(u in available_units){
            dsets[rows[k].dataset_id].unit_assoc[available_units[u]] = [rows[k][available_units[u]]]
          }
          
        }

  		}
  		
  	}
    //dataset_accumulator.datasets=[]
    //console.log(dsets);

    for(id in dsets){
      dataset_accumulator.dataset_ids.push(id)
      //dataset_accumulator.ds_counts.push(id)
      dataset_accumulator.seq_ids.push(dsets[id].seq_ids)
      dataset_accumulator.seq_freqs.push(dsets[id].seq_counts)
      for(u in dsets[id].unit_assoc) {
        dataset_accumulator.unit_assoc[u].push(dsets[id].unit_assoc[u])
      }
      
    }

    console.log(dataset_accumulator);
    //console.log(dataset_accumulator.unit_assoc['taxonomy_id'][0]);
    //console.log(dataset_accumulator.unit_assoc['taxonomy_id'][1]);
    //console.log(dataset_accumulator.unit_assoc['taxonomy_id'][2]);
    //console.log(dataset_accumulator.unit_assoc['otu_id'][0]);
    //console.log(dataset_accumulator.unit_assoc['otu_id'][1]);
    //console.log(dataset_accumulator.unit_assoc['otu_id'][2]);

  	res.render('visuals/unit_selection', {   title: 'Unit Selection',
                   id_count_list: JSON.stringify(id_count_list),
                   selection_obj: JSON.stringify(dataset_accumulator),
                   constants    : JSON.stringify(req.C),
                   user         : req.user
                 });
  });
  
  
});
/* 
 * GET visualization page. 
 */
router.get('/index_visuals',  function(req, res) {
  
  	projects_datasets = all_datasets.ALL
  	// could this projects_datasets list be filtered/limited here
  	// depending on user selected input or user access permissions?
    // console.log(JSON.stringify(projects_datasets));  
    res.render('visuals/index_visuals',{ title   : 'Show Datasets!',  
                                   rows    : JSON.stringify(projects_datasets)  ,
                                   user: req.user  
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


