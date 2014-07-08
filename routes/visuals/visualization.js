var express = require('express');
var router = express.Router();
//var all_datasets = require('../../config/all_datasets')

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
    // The visuals have been selected so now we need to create them
    // so they can be shown fast when selected
    for(var k in req.body.visuals) {
      if(req.body.visuals[k] === 'counts_table'){ links.countstable = ''; create_countstable(req.body);}
      //if(req.body.visuals[k] === 'heatmap'){ links.heatmap = ''; create_heatmap(req.body);}
      //if(k === 'barcharts'){links.barcharts = ''; create_barcharts(req.body);}
      //if(k === 'dendrogram'){links.dendrogram = ''; create_dendrogram(req.body);}
      //if(k === 'alphadiversity'){links.alphadiversity = ''; create_alphadiversity(req.body);}

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
  // This page (unit_selection) comes after the datasets have been selected
  // it should only be reached by POST from the previous index_visuals page.
  // It should be protected by the isLoggedIn function (below). 
  // Currently I have removed the isLoggedIn function from the function call
  // because the program is easier to test without it (you don't have to be logged in)
  // This function call will look like this when in place:
  //            router.post('/unit_selection', isLoggedIn, function(req, res) {
  // The logic here is from the selected datasets to create an object that
  // holds the datasetIDs in a certain order. The object also holds the sequence_ids,sequence_counts
  // for each dataset in the same order. The associated unitIDs are also in the object in the same order>
  // {
  //  dataset_ids:["122","136","162"],
  //  seq_ids: [ [1002,1004,1005], [1002,1004,1005], [1002,1005,1007] ],
  //  seq_freqs: [ [94,4,178], [32,1,89], [625,1024,2] ],
  //  unit_assoc: {
  //          "tax_silva108_id": [ [214,82,214], [214,82,214], [214,214,137] ], 
  //          "tax_gg_id":[ [null,null,null], [null,null,null], [null,null,null] ],
  //          "med_node_id":[ [null,null,null], [null,null,null], [null,null,null] ], 
  //          "otu_id":[ [null,null,null], [null,null,null], [null,null,null] ]
  //          } 
  // }
  // I use the GLOBAL keyword below to make two objects global variables:
  // chosen_id_name_hash  <-- contains the ids and names of the chosen datasets
  // dataset_accumulator  <-- this is the main object containg the IDs
  // TESTING:
  

  var db = req.db;
  var dsets = {};
  var accumulator = {
    dataset_ids : [],
    seq_ids     : [],
    seq_freqs  : [],
    unit_assoc: {}
  };
  
  var available_units = req.C.AVAILABLE_UNITS; // ['med_node_id','otu_id','taxonomy_gg_id']
  
  for(var i in available_units){
  	accumulator.unit_assoc[available_units[i]]=[];
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
  
    
  var qSelectSeqID = "SELECT dataset_id, seq_count, sequence_id, "+available_units+" from sequence_pdr_infos";
  qSelectSeqID +=    "  JOIN sequence_uniq_infos using(sequence_id)";
  qSelectSeqID +=    "  WHERE dataset_id in (" + chosen_id_name_hash.ids + ")";
  console.log(qSelectSeqID);
    
  
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
	      accumulator.dataset_ids.push(id);
	      //dataset_accumulator.ds_counts.push(id)
	      accumulator.seq_ids.push(dsets[id].seq_ids);
	      accumulator.seq_freqs.push(dsets[id].seq_counts);
	      for(var u in dsets[id].unit_assoc) {
	        accumulator.unit_assoc[u].push(dsets[id].unit_assoc[u]);
	      }
      
    	}
  		
  	}
    GLOBAL.dataset_accumulator = accumulator;
    GLOBAL.chosen_id_name_hash=chosen_id_name_hash;
    //console.log(dataset_accumulator);
    

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
  // This page is arrived at using GET from the Main Menu
  // It will be protected usind the isLoggedIn function (below)
  // TESTING: 
  //      Should show the closed project list on initialize
  //      The javascript functions (load_project_select, set_check_project, open_datasets, toggle_selected_datasets)
  //        should work to open the project (show and check the datasets) when either the plus image is clicked or the
  //        checkbox is selected. Clicking the minus image should deselect the datasets and close the dataset list.
  //        While the project is open clicking on the project checkbox should toggle all the datasets under it.
  //      Clicking the submit button when no datasets have been selected should result in an alert box and a
  //      return to the page.
  res.render('visuals/index_visuals',{ title   : 'Show Datasets!',  
                                 rows    : JSON.stringify(DATASETS),
                                 constants    : JSON.stringify(req.C),
                                 user: req.user  
                                  });    
});

/*
 *  VISUALS PAGES
 */
// router.get('/counts_table',  function(req, res) {
//     res.render('visuals/counts_table', {
//       body         : JSON.stringify(req.body), 
//       user: req.user 
//     });
// });
// router.get('/heatmap',  function(req, res) {
//     res.render('visuals/heatmap', {
//       body         : JSON.stringify(req.body), 
//       user: req.user 
//     });
// });

/*
*   PARTIALS
*      These six partials all belong to the unit_selection page
*      and are shown via ajax depending on user selection in combo box
*       on that page.  AAV
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
//
//
//
function create_countstable(b) {
  // Intend to create (write) counts_table page here
  // That has a timestamp appeneded to the file name
  // so that it is unique to the user.
  // The page should be purged when? -- after a certain length of time
  // or when the user leaves the page.
  // Also I am having trouble understanding how this page (with a unique name)
  // will be seen by the router.   AAV

  console.log(b)
  var ms = +new Date  // millisecs since the epoch
  var page = 'user_pages/counts_table'+ms+'.html'
  // taxa_ckbx_toggle: 'all',
  // domain: [ 'Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown' ],
  // include_nas: 'yes',
  // tax_depth: 'phylum',
  // unit_choice: 'taxa_silva108_simple',
  // normalization: 'no',
  // visuals: [ 'counts_table' ],
  // selection_obj: '{
  //  "dataset_ids":["41","127"],
  //  "seq_ids":[[1001,1002,1004,1005],[1002,1003,1004,1005,1007]],
  //  "seq_freqs":[[2,53,4,101],[137,1,2,240,1]],
  //  "unit_assoc":{
  //    "tax_silva108_id":[[96,214,82,214],[214,84,82,214,137]],
  //    "tax_gg_id":[[null,null,null,null],[null,null,null,null,null]],
  //    "med_node_id":[[null,null,null,null],[null,null,null,null,null]],
  //    "otu_id":[[null,null,null,null],[null,null,null,null,null]]}}' }
  //console.log(chosen_id_name_hash)
  var obj         = JSON.parse(b.selection_obj);
  var dataset_ids = obj.dataset_ids;
  var units       = b.unit_choice
  var matrix      = '';
  var q0          = ""
  
    console.log(obj)
    console.log(units)
    console.log(dataset_ids)
    console.log(chosen_id_name_hash)
  for(n in dataset_ids) {
    console.log(dataset_ids[n])
    console.log(chosen_id_name_hash.names[dataset_ids[n]].index)
  }
  for(n in dataset_ids) {
  //   if(b[n] === 'selection_obj'){
  //    console.log(b[n])
  //  }
  //  q0 = ""
  }

}
//
//
//
function create_heatmap(b) {
  console.log('in create_hetamap')
  console.log(b)
}
//
//
//
function create_alphadiversity() {

}
//
//
//
function create_barcharts() {

}

