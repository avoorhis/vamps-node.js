var express = require('express');
var router = express.Router();
//var all_datasets = require('../../config/all_datasets')

//var helpers = require('./helpers')
var app = express();


/* 
 * GET visualization page. 
 */
router.post('/view_selection',  function(req, res) {
  // This page (view_selection) comes after the datasets and units have been selected
  //    in the previous two pages.
  // It should be protected with isLoggedIn like /unit_selection below.
  // The function call will look like this when isLoggedIn is in place:
  //            router.post('/view_selection', isLoggedIn, function(req, res) {
  // This page is where the user will choose to view his/her selected visuals.
  // The left side will show a synopsis of what choices the user has made:
  //    datasets, normalization, units and any specifics such as tax rank, domain, NAs ....
  // The middle section will have a list of buttons allowing download of files
  // And the right side will have links to the previously selected visuals.
  // Before this page is rendered the visuals should have been created using the functions called below.
  // The visual pages will be created in a public directory and each page will have a random number or timestamp
  //    attached so the page is private and can be deleted later.
  // TESTING:
  //    There should be one or more datasets shown in list
  //    There should be one or more visual choices shown.
  //    
  
  // NORMALIZATION:
  if(req.body.normalization === 'max' || req.body.normalization === 'freq') {
    req.body.selection_obj = normalize_counts(req.body.normalization, req.body.selection_obj);
  }
  console.log('START BODY>> in route/visualization.js /view_selection');
  console.log(req.body);
  console.log('<<END BODY');
  var links = {};
  
  
  // Get matrix data here
  // What is the SQL?
  // The visuals have been selected so now we need to create them
  // so they can be shown fast when selected
  for(var k in req.body.visuals) {
    if(req.body.visuals[k] === 'counts_table'){ links.countstable = ''; create_counts_table(req.body);}
    //if(req.body.visuals[k]  === 'heatmap'){ links.heatmap = ''; create_heatmap(req.body);}
    //if(req.body.visuals[k]  === 'barcharts'){links.barcharts = ''; create_barcharts(req.body);}
    //if(req.body.visuals[k]  === 'dendrogram'){links.dendrogram = ''; create_dendrogram(req.body);}
    //if(req.body.visuals[k]  === 'alphadiversity'){links.alphadiversity = ''; create_alphadiversity(req.body);}

  }
  res.render('visuals/view_selection',{ title   : 'VAMPS: Visualization', 
                                  body: JSON.stringify(req.body), 
                                   user: req.user  
              });
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
  // I use the GLOBAL keyword below to make this object a global variable:
  // dataset_accumulator  <-- this is the main object containg the IDs
  // Question: can I attach this to the post variable (req.body) or do I need it as GLOBAL?
  //        Currently it is both
  // TESTING:
  //    There should be one or more datasets shown in list
  //    The Submit button should return with an alert error if no display checkboxes are checked
  //    There should be a 'default' Units Selection present (This point is debatable -- the other option
  //        would be leave blank and force the user to select). I chose Silva108--Simple Taxonomy as default.
  //    The 'Display Output' section should list the items from public/constants.js
  //    The 'Normailzation' section should list the items from public/constants.js with the NotNormalized option
  //        checked by default.
  console.log('START BODY>> in route/visualization.js /unit_selection');
  console.log(req.body);
  console.log('<<END BODY');
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
  res.render('visuals/index_visuals', { title   : 'Show Datasets!',  
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
function create_counts_table(b) {
  // Intend to create (write) counts_table page here
  // That has a timestamp appeneded to the file name
  // so that it is unique to the user.
  // The page should be purged when? -- after a certain length of time
  // or when the user leaves the page.
  // Also I am having trouble understanding how this page (with a unique name)
  // will be seen by the router.   AAV

  //console.log(b)
  var ms = +new Date  // millisecs since the epoch
  var page = 'user_pages/counts_table'+ms+'.html'
  // taxa_ckbx_toggle: 'all',
  // domain: [ 'Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown' ],
  // include_nas: 'yes',
  // tax_depth: 'phylum',
  // unit_choice: 'taxa_silva108_simple',
  // datasets: '{"ids":["135","126","122"],"names":["SLM_NIH_Bv4v5--01_Boonville","SLM_NIH_Bv4v5--02_Spencer","SLM_NIH_Bv4v5--03_Junction_City_East"]}',
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
  
   // console.log(obj)
   // console.log(units)
   // console.log(dataset_ids)
  for(n in dataset_ids) {
    //console.log(dataset_ids[n])
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
//
// NORMALIZATION
//
function normalize_counts(norm_type, obj) {
  console.log('in normalization: '+norm_type)
  // get max dataset count
  selection_obj = JSON.parse(obj);
  max_count = get_max_dataset_count(selection_obj);
  //selection_obj.max_ds_count = max_count;
  
  new_obj = [];
  for(n in selection_obj.seq_freqs) {
    var sum=0;
    for (var i = selection_obj.seq_freqs[n].length; i--;) {
      sum += selection_obj.seq_freqs[n][i];
    }
    temp = [];
    for (var i in selection_obj.seq_freqs[n]) {
      
      if(norm_type==='max') {
        temp.push( parseInt((selection_obj.seq_freqs[n][i] * max_count) / sum) )
      }else{
        temp.push( parseFloat((selection_obj.seq_freqs[n][i] / sum).toFixed(8)) )
      }

    }
    new_obj.push(temp);
  }
  
  selection_obj.seq_freqs = new_obj;
  return JSON.stringify(selection_obj);
}

function get_max_dataset_count(obj) {
  // Gets the maximum dataset count from the 'seq_freqs' in selection_obj
  var max_count = 0;
  for(n in selection_obj.seq_freqs) {
    var sum=0;
    for (var i = selection_obj.seq_freqs[n].length; i--;) {
      sum += selection_obj.seq_freqs[n][i];
    }
    if(sum > max_count) {
      max_count = sum;
    }
  }
  return max_count;
}

