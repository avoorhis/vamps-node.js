var express = require('express');
var router = express.Router();
var all_datasets = require('../../config/all_datasets')
var dataset_accumulator = require('../../public/classes/dataset_accumulator')
//var helpers = require('./helpers')
var app = express();


/* 
 * GET visualization page. 
 */
router.post('/view_selection',  function(req, res) {
    // here we need to list the links to the selected visualization out pages:
    // heatmap, tax_table
    console.log(req.body)
    var links = {}
    
    // Get matrix data here
    // What is the SQL?

    for(var k in req.body.visuals) {
      
      if(k === 'counttable'){
        var q0 = 'SELECT .... '

      }
      if(k === 'heatmap'){ links.heatmap = ''}
      if(k === 'barcharts'){links.barcharts = ''}
      if(k === 'dendrogram'){links.dendrogram = ''}
      if(k === 'alphadiversity'){links.alphadiversity = ''}

    }
    res.render('visuals/view_selection',{ title   : 'VAMPS: Visualization', 
                                  body: JSON.stringify(req.body), 
                                   user: req.user  
                                    })
});
// use the isLoggedIn function to limit exposure of each page to
// logged in users only
//router.post('/unit_selection', isLoggedIn, function(req, res) {
router.post('/unit_selection',  function(req, res) {
  var db = req.db;
  var dsets = {};
  var available_units = req.C.AVAILABLE_UNITS; // ['med_node_id','otu_id','taxonomy_gg_id']
  
  for(var i in available_units){
  	dataset_accumulator.unit_assoc[available_units[i]]=[];
  }
  

  // dataset selection +/- is checked in routes/visualization.js: check_for_no_datasets()
  //console.log(req.body);
  var chosen_id_name_hash    = {};
  chosen_id_name_hash.ids    = [];
  chosen_id_name_hash.names  = [];
  for(var n in req.body.dataset_ids){
  	items = req.body.dataset_ids[n].split('--');
    chosen_id_name_hash.ids.push(items[0]);
    chosen_id_name_hash.names.push(items[1]+'--'+items[2]);
  }
  //console.log(id_count_list);
    
  var qSelectSeqID = "SELECT dataset_id, seq_count, sequence_id, "+available_units+" from sequence_pdr_infos";
  qSelectSeqID +=    "  JOIN sequence_uniq_infos using(sequence_id)";
  qSelectSeqID +=    "  WHERE dataset_id in (" + chosen_id_name_hash.ids + ")";
  console.log(qSelectSeqID);
  //console.log(dataset_accumulator.getTotalSequenceCount());
  
  
  db.query(qSelectSeqID, function(err, rows, fields){
  	if(err)	{
  		throw err;
  	}else{
  		
      
      // here get tax_silva108_id, med_id, otu_id.... for each sequence_id from sequence_uniq_infos
  		// and keep them in the same order as the sequence_ids
  		for(var k in rows){

	      if(rows[k].dataset_id in dsets){
	        dsets[rows[k].dataset_id].seq_ids.push(rows[k].sequence_id);
	        dsets[rows[k].dataset_id].seq_counts.push(rows[k].seq_count);
	        for(var u in available_units) {
	          dsets[rows[k].dataset_id].unit_assoc[available_units[u]].push(rows[k][available_units[u]]);
	        }
	      }else{
	        dsets[rows[k].dataset_id] = {};
	        dsets[rows[k].dataset_id].seq_ids = [rows[k].sequence_id];
	        dsets[rows[k].dataset_id].seq_counts = [rows[k].seq_count];
	        dsets[rows[k].dataset_id].unit_assoc = {};
	        for(var u in available_units) {
	          dsets[rows[k].dataset_id].unit_assoc[available_units[u]] = [rows[k][available_units[u]]];
	        }

	      }

  		}

  		for(var id in dsets){
	      dataset_accumulator.dataset_ids.push(id);
	      //dataset_accumulator.ds_counts.push(id)
	      dataset_accumulator.seq_ids.push(dsets[id].seq_ids);
	      dataset_accumulator.seq_freqs.push(dsets[id].seq_counts);
	      for(var u in dsets[id].unit_assoc) {
	        dataset_accumulator.unit_assoc[u].push(dsets[id].unit_assoc[u]);
	      }
      
    	}
  		
  	}
    
    //console.log(dsets);
    
    //console.log(JSON.stringify(dataset_accumulator, undefined, 2)); // prints with indentation
    //console.log(dataset_accumulator.unit_assoc['taxonomy_id'][0]);
    //console.log(dataset_accumulator.unit_assoc['taxonomy_id'][1]);
    //console.log(dataset_accumulator.unit_assoc['taxonomy_id'][2]);
    //console.log(dataset_accumulator.unit_assoc['otu_id'][0]);
    //console.log(dataset_accumulator.unit_assoc['otu_id'][1]);
    //console.log(dataset_accumulator.unit_assoc['otu_id'][2]);

  	res.render('visuals/unit_selection', {   title: 'Unit Selection',
                   chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
                   selection_obj: JSON.stringify(dataset_accumulator),
                   constants    : JSON.stringify(req.C),
                   body         : JSON.stringify(req.body), 
                   user         : req.user
                 });
  });
  
  
});
/* 
 * GET visualization page. 
 */
router.get('/index_visuals',  function(req, res) {
  
  	projects_datasets = all_datasets.ALL
    //console.log(JSON.stringify(DATASETS,null,4));
    //console.log(JSON.stringify(projects_datasets,null,4));
  	// could this projects_datasets list be filtered/limited here
  	// depending on user selected input or user access permissions?
    // console.log(JSON.stringify(projects_datasets));  
    res.render('visuals/index_visuals',{ title   : 'Show Datasets!',  
                                   rows    : JSON.stringify(projects_datasets),
                                   constants    : JSON.stringify(req.C),
                                   user: req.user  
                                    });
    
});

/*
*   PARTIALS
*/
router.get('/partials/tax_silva108_simple',  function(req, res) {
    res.render('visuals/partials/tax_silva108_simple',{
        doms: req.C.DOMAINS
    });
});
router.get('/partials/tax_silva108_custom',  function(req, res) {
    res.render('visuals/partials/tax_silva108_custom',{
      doms: req.C.DOMAINS
    });
});
router.get('/partials/tax_gg_custom',  function(req, res) {
    res.render('visuals/partials/tax_gg_custom',{});
});
router.get('/partials/tax_gg_simple',  function(req, res) {
    res.render('visuals/partials/tax_gg_simple',{});
});
router.get('/partials/otus',  function(req, res) {
    res.render('visuals/partials/otus',{});
});
router.get('/partials/med_nodes',  function(req, res) {
    res.render('visuals/partials/med_nodes',{});
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


