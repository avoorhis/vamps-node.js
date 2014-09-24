var express = require('express');
var router = express.Router();

var util = require('util');
var url  = require('url');
var http = require('http');
var path = require('path');
var fs   = require('fs');
var async = require('async');


var helpers = require('../helpers/helpers');

var COMMON  = require('./routes_common');
var MTX     = require('./routes_counts_matrix');
var HMAP    = require('./routes_distance_heatmap');
var DEND    = require('./routes_dendrogram');
var BCHARTS = require('./routes_bar_charts');
var PCHARTS = require('./routes_pie_charts');
//var CTABLE  = require('./routes_counts_table');

var app = express();

// // init_node var node_class = 
// var CustomTaxa  = require('./custom_taxa_class');

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
  //var body = JSON.parse(req.body);
  console.log('req.body');
  console.log(req.body);
  console.log('req.body');
  //console.log('1');
  //req.body.selection_obj       = JSON.parse(req.body.selection_obj);
  
  //req.body.chosen_id_name_hash = JSON.parse(req.body.chosen_id_name_hash);
  //console.log('2');
  
  var visual_post_items = {};
  GLOBAL.visual_post_items = visual_post_items;
  visual_post_items.unit_choice                  = req.body.unit_choice;
  //visual_post_items.max_ds_count                 = COMMON.get_max_dataset_count(selection_obj);
  visual_post_items.no_of_datasets               = chosen_id_name_hash.ids.length;
  visual_post_items.normalization                = req.body.normalization || 'none';
  visual_post_items.visuals                      = req.body.visuals;
  visual_post_items.selected_heatmap_distance    = req.body.selected_heatmap_distance || 'morisita_horn';
  visual_post_items.selected_dendrogram_distance = req.body.selected_dendrogram_distance;
  visual_post_items.tax_depth                    = req.body.tax_depth    || 'custom';
  visual_post_items.domains                      = req.body.domains      || 'all';
  visual_post_items.include_nas                  = req.body.include_nas  || 'yes';
  visual_post_items.min_range                    = 0;
  visual_post_items.max_range                    = 100;

  
  var uitems = visual_post_items.unit_choice.split('_');
  var unit_name_query = '';
  var unit_field;
  if (uitems[0] === 'tax'){  // covers both simple and custom

    unit_field = 'silva_taxonomy_info_per_seq_id';
    unit_name_query = COMMON.get_taxonomy_query( req.db, uitems, chosen_id_name_hash, visual_post_items );

  }else if(uitems[0] === 'otus') {
    unit_field = 'gg_otu_id';
    //unit_name_query = COMMON.get_otus_query( req.db, uitems, selection_obj, visual_post_items );
  }else if(uitems[0] === 'med_nodes') {
    unit_field = 'med_node_id';
    //unit_name_query = COMMON.get_med_query( req.db, uitems, selection_obj, visual_post_items );
  }else{
    console.log('ERROR--RORRE');
  }
  console.log('MAP:::');
  console.log(map_dict_by_db_id )
  //
  //uid_matrix = MTX.fill_in_counts_matrix( selection_obj, unit_field );  // just ids, but filled in zeros
  // {unit_id:[cnt1,cnt2...] // counts are in ds order
   console.log(unit_name_query)
  
  // Get matrix data here
  // The visuals have been selected so now we need to create them
  // so they can be shown fast when selected
  //console.log(JSON.stringify(selection_obj));
  req.db.query(unit_name_query, function(err, rows, fields){
    if (err) {
      throw err;
    } else {   
      var timestamp = +new Date();  // millisecs since the epoch!
      var user = req.user || 'no-user';
      timestamp = user + '_' + timestamp;
      visual_post_items.ts = timestamp;

      // this function: output_matrix writes various counts matrices to files for *possible* use later by R or D3
      // It also reurns a JSON count_matrix
      //count_matrix = MTX.output_matrix( 'to_file_and_console', timestamp, selection_obj, chosen_id_name_hash, rows );   // matrix to have names of datasets and units for display  -- not ids
      
      biome_matrix = MTX.get_biome_matrix(chosen_id_name_hash, visual_post_items, rows);
      visual_post_items.max_ds_count = biome_matrix.max_dataset_count;
      console.log(biome_matrix);

      // This is what matrix looks like (a different matrix is written to file)
      // { 
      //  dataset_names: 
      //    [ 'SLM_NIH_Bv4v5--03_Junction_City_East',
      //      'SLM_NIH_Bv4v5--02_Spencer',
      //      'SLM_NIH_Bv4v5--01_Boonville' 
      //    ],
      //  unit_names: 
      //    { 'Bacteria;Proteobacteria': [ 4, 2, 4 ],
      //      'Bacteria;Bacteroidetes': [ 272, 401, 430 ] 
      //    } 
      //  }

      //req.body.matrix = JSON.stringify(matrix);
      //console.log('CM')
      //console.log(JSON.stringify(count_matrix));
      //console.warn(util.inspect(matrix));
      //console.log(dataset_accumulator)
      
     
     
      res.render('visuals/view_selection', { 
                                  title   : 'VAMPS: Visuals Select',
                                  post_items :          JSON.stringify(visual_post_items),
                                  chosen_id_name_hash : JSON.stringify(chosen_id_name_hash),
                                  matrix :              JSON.stringify(biome_matrix),
                                  constants :           JSON.stringify(req.C),
                                  timestamp :           timestamp,           // for creating unique files/pages                            
                                  user   :              req.user
                   });
    
    }
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
  //            router.post('/unit_selection', helpers.isLoggedIn, function(req, res) {
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
  // selection_obj  <-- this is the main object containg the IDs
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
  //console.log('START BODY>> in route/visualization.js /unit_selection');
  //console.log(JSON.stringify(req.body));
  //console.log('<<END BODY');
  var db = req.db;
  var dsets = {};
  var selection_obj = {
    dataset_ids : [],
    //seq_ids     : [],
    seq_freqs   : [],
    unit_assoc  : {}
  };
  var accumulator = {
    dataset_ids : [],
    //seq_ids     : [],
    seq_freqs   : [],
    unit_assoc  : {}
  };

  var available_units = req.C.AVAILABLE_UNITS; // ['med_node_id','otu_id','taxonomy_gg_id']

  //for (var i=0; i < available_units.length; i++){
  //  accumulator.unit_assoc[available_units[i]]=[];
  //}


  // dataset selection +/- is checked in routes/visualization.js: check_for_no_datasets()
  //console.log(req.body);
  var chosen_id_name_hash    = {};
  chosen_id_name_hash.ids    = [];
  chosen_id_name_hash.names  = [];
  //console.log('req.body.dataset_ids')
  //console.log(req.body.dataset_ids)
  for (var n=0; n < req.body.dataset_ids.length; n++){
    var items = req.body.dataset_ids[n].split('--');
    chosen_id_name_hash.ids.push(items[0]);
    chosen_id_name_hash.names.push(items[1]+'--'+items[2]);
  }
  //console.log('chosen_id_name_hash')
  //console.log(chosen_id_name_hash)
  // // benchmarking
  // var start = process.hrtime();
  // 
  // // benchmarking
  // var elapsed_time = function(note){
  //     var precision = 3; // 3 decimal places
  //     var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
  //     console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
  //     //start = process.hrtime(); // reset the timer
  // };

  // benchmarking
  helpers.start = process.hrtime();
  helpers.elapsed_time("START: select from sequence_pdr_info and sequence_uniq_info-->>>>>>");
  
  //var qSelectSeqID = "SELECT dataset_id, seq_count, "+available_units+" FROM sequence_pdr_info";
  //qSelectSeqID +=    "  JOIN sequence_uniq_info using(sequence_id)";
  //qSelectSeqID +=    "  WHERE dataset_id in (" + chosen_id_name_hash.ids + ")";

  
//  var qSelectSeqID = "SELECT dataset_id, seq_count FROM sequence_pdr_info";
//  qSelectSeqID +=    "  WHERE dataset_id in (" + chosen_id_name_hash.ids + ")";
//  console.log(qSelectSeqID);


  // db.query(qSelectSeqID, function(err, rows) {
  //   if (err)  {
  //     throw err;
  //   } else {

  //     helpers.elapsed_time(">>>>>>>>> 2 Before Page Render and Calc <<<<<<");
  //     // here get tax_silva108_id, med_id, otu_id.... for each sequence_id from sequence_uniq_infos
  //     // and keep them in the same order as the sequence_ids
      

  //     for (var k=0; k < rows.length; k++){
        
  //       if (rows[k].dataset_id in dsets){
  //         //dsets[rows[k].dataset_id].seq_ids.push(rows[k].sequence_id);
  //         dsets[rows[k].dataset_id].seq_counts.push(rows[k].seq_count);
  //         //for (u=0; u < available_units.length; u++) {
  //           //dsets[rows[k].dataset_id].unit_assoc[available_units[u]].push(rows[k][available_units[u]]);
  //         //}
  //       } else {
  //         dsets[rows[k].dataset_id] = {};
  //         //dsets[rows[k].dataset_id].seq_ids = [rows[k].sequence_id];
  //         dsets[rows[k].dataset_id].seq_counts = [rows[k].seq_count];
  //         //dsets[rows[k].dataset_id].unit_assoc = {};
  //         //for (u=0; u < available_units.length; u++) {
  //           //dsets[rows[k].dataset_id].unit_assoc[available_units[u]] = [rows[k][available_units[u]]];
  //         //}        
  //       }

  //     }
  
  //     for(var i in chosen_id_name_hash.ids) {  // has correct ds order
  //       id = chosen_id_name_hash.ids[i]
  //       accumulator.dataset_ids.push(id);
  //       //accumulator.seq_ids.push(dsets[id].seq_ids);
  //       accumulator.seq_freqs.push(dsets[id].seq_counts);
  //       //for (u in dsets[id].unit_assoc) {
  //         //accumulator.unit_assoc[u].push(dsets[id].unit_assoc[u]);

  //       //}
  //     }
  //   }// end else

   
//    GLOBAL.selection_obj = accumulator;

    GLOBAL.chosen_id_name_hash = chosen_id_name_hash;
    console.log('selection_obj-->');
    //console.log(JSON.stringify(accumulator));
    console.log('<--selection_obj');
    console.log('chosen_id_name_hash-->');
    //console.log(chosen_id_name_hash);
    console.log('<--chosen_id_name_hash');
    helpers.elapsed_time(">>>>>>>>> 3 Before Page Render But after Query/Calc <<<<<<");
 

    res.render('visuals/unit_selection', {   
                    title: 'VAMPS: Units Selection',
                    chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
                    constants    : JSON.stringify(req.C),
                    user         : req.user
    });  // end render
    // benchmarking
    helpers.elapsed_time(">>>>>>>> 4 After Page Render <<<<<<");

//  });  // end db query   
   
   

   // benchmarking
   helpers.elapsed_time(">>>>>>>>> 1 Before Page Render and Query <<<<<<");


}); // end fxn

/*
 * GET visualization page.
 */
router.get('/index_visuals',  function(req, res) {
  // This page is arrived at using GET from the Main Menu
  // It will be protected usind the helpers.isLoggedIn function
  // TESTING:
  //      Should show the closed project list on initialize
  //      The javascript functions (load_project_select, set_check_project, open_datasets, toggle_selected_datasets)
  //        should work to open the project (show and check the datasets) when either the plus image is clicked or the
  //        checkbox is selected. Clicking the minus image should deselect the datasets and close the dataset list.
  //        While the project is open clicking on the project checkbox should toggle all the datasets under it.
  //      Clicking the submit button when no datasets have been selected should result in an alert box and a
  //      return to the page.
  res.render('visuals/index_visuals', { 
                                title   : 'VAMPS: Select Datasets',
                                rows    : JSON.stringify(ALL_DATASETS),
                                constants    : JSON.stringify(req.C),
                                user: req.user
                            });
});
//
//
//
router.get('/reorder_datasets', function(req, res) {
  console.log('TODO::TODO reorder datasets')
  console.log(selection_obj)
  //console.log(chosen_id_name_hash)
});
//
//  C O U N T S  T A B L E
//
router.get('/user_data/counts_table', function(req, res) {
  
  var myurl = url.parse(req.url, true);
  var ts   = myurl.query.ts;
  var min   = myurl.query.min_range || visual_post_items.min_range || 0;
  var max   = myurl.query.max_range || visual_post_items.max_range || 100;
  var norm  = myurl.query.norm || visual_post_items.normalization || 'none';
  if(max <= min) {min=0;max=100;} 
  visual_post_items.min_range = Number(min)
  visual_post_items.max_range = Number(max)
  visual_post_items.normalization = norm


  var infile = '../../tmp/'+ts+'_count_matrix.biom';
  fs.readFile(path.resolve(__dirname, infile), 'UTF-8', function (err, file_contents) {
    if (err) {
      console.log('Could not read file: ' + infile + '\nHere is the error: '+ err);
    }
    var mtx = JSON.parse(file_contents);

    var mtx = COMMON.get_custom_biome_matrix(visual_post_items, mtx);
    console.log('after cust')
    

    var html = "<table border='1' class='single_border'><tr><td>";
    html += COMMON.get_selection_markup('counts_table', visual_post_items);     // block for listing prior selections: domains,include_NAs ...
    html += '</td><td>';
    html += COMMON.get_choices_markup('counts_table', visual_post_items);       // block for controls to normalize, change tax percentages or distance
    html += '</td></tr></table>';
    html += "<table border='1' class='single_border small_font counts_table'>";
    html += '<tr><td></td>';
    for(var n in mtx.columns){ 
      html += '<td>'+mtx.columns[n].id+'</td>';
    }
    html += '</tr>';
    for(n in mtx.rows){ 
      html += '<tr>';
      html += '<td>'+mtx.rows[n].id+'</td>';
      for(i in mtx.data[n]) {
        var cnt = mtx.data[n][i];
        var pct =  (cnt * 100 / mtx.column_totals[i]).toFixed(2)
        var id  = mtx.columns[i].id+'-|-'+cnt.toString()+'-|-'+pct.toString();
        html += "<td id='"+id+"' class='tooltip right_justify'>"+cnt+'</td>';
      }
      html += '</tr>';
    }
    html += '<tr>';
    html += "<td class='right_justify'><strong>Sums:</strong></td>";
    for(n in mtx.column_totals) {
      html += "<td class='right_justify'>"+mtx.column_totals[n]+'</td>';
    } 
    html += '</tr>';
    html += '</table>';
    res.render('visuals/user_data/counts_table', {
      title: req.params.title   || 'default_title',
      timestamp: ts || 'default_timestamp',
      html : html,
      user: req.user
    });
  });
});

//
// B A R C H A R T S
//
router.get('/user_data/barcharts', function(req, res) {
  var myurl = url.parse(req.url, true);
  //console.log(myurl)
  var ts = myurl.query.ts;
  var min   = myurl.query.min_range || visual_post_items.min_range || 0;
  var max   = myurl.query.max_range || visual_post_items.max_range || 100;
  var norm  = myurl.query.norm || visual_post_items.normalization || 'none';
  if(max <= min) {min=0;max=100;} 
  visual_post_items.min_range = Number(min)
  visual_post_items.max_range = Number(max)
  visual_post_items.normalization = norm
  
  var infile = '../../tmp/'+ts+'_count_matrix.biom';
  fs.readFile(path.resolve(__dirname, infile), 'UTF-8', function (err, file_contents) {
    if (err) {
      console.log('Could not read file: ' + infile + '\nHere is the error: '+ err);
    }
    var mtx = JSON.parse(file_contents);

    mtx = COMMON.get_custom_biome_matrix(visual_post_items, mtx);
     
    var html = '<table border="1" class="single_border"><tr><td>';
    html += COMMON.get_selection_markup('barcharts', visual_post_items); // block for listing prior selections: domains,include_NAs ...
    html += '</td><td>';
    html += COMMON.get_choices_markup('barcharts', visual_post_items);      // block for controls to normalize, change tax percentages or distance
    html += '</td></tr></table>';
   

    //var BCHARTS = require('./routes_bar_charts_states');
    html += BCHARTS.create_barcharts_html ( ts, res, mtx );

    res.render('visuals/user_data/barcharts', {
          //title: req.params.title   || 'default_title',
          timestamp: ts || 'default_timestamp',
          html : html,
          user: req.user
        });

  });
});

//
// P I E C H A R T S
//
router.get('/user_data/piecharts', function(req, res) {
  var myurl = url.parse(req.url, true);
  //console.log(myurl)
  var ts = myurl.query.ts;
  var min   = myurl.query.min_range || visual_post_items.min_range || 0;
  var max   = myurl.query.max_range || visual_post_items.max_range || 100;
  var norm  = myurl.query.norm || visual_post_items.normalization || 'none';
  if(max <= min) {min=0;max=100;} 
  visual_post_items.min_range = Number(min)
  visual_post_items.max_range = Number(max)
  visual_post_items.normalization = norm
 
  var infile = path.join(__dirname, '../../tmp/'+ts+'_count_matrix.biom');
  console.log('in create_piecharts_html: '+infile)

  fs.readFile(infile, 'utf8', function (err, json) {
    var mtx = JSON.parse(json);
    mtx = COMMON.get_custom_biome_matrix(visual_post_items, mtx);

    var html = '<table border="1" class="single_border"><tr><td>';
    html += COMMON.get_selection_markup('piecharts', visual_post_items); // block for listing prior selections: domains,include_NAs ...
    html += '</td><td>';
    html += COMMON.get_choices_markup('piecharts', visual_post_items);      // block for controls to normalize, change tax percentages or distance
    html += '</td></tr></table>';
   
    html += PCHARTS.create_piecharts_html ( ts, res, mtx );

    res.render('visuals/user_data/piecharts', {
          //title: req.params.title   || 'default_title',
          timestamp: ts || 'default_timestamp',
          html : html,
          user: req.user
        });

  });
});
//
// P I E C H A R T  -- S I N G L E
//
router.get('/user_data/piechart_single', function(req, res) {
  

    res.render('visuals/user_data/piechart_single', {
          //title: req.params.title   || 'default_title',
          timestamp: ts || 'default_timestamp',
          //html : html,
          user: req.user
        });

 
});
//
//   H E A T M A P
//
router.get('/user_data/heatmap', function(req, res) {
  var myurl = url.parse(req.url, true);
  var exec = require('child_process').exec;
  var ts    = myurl.query.ts;
  var min   = myurl.query.min_range || visual_post_items.min_range || 0;
  var max   = myurl.query.max_range || visual_post_items.max_range || 100;
  var norm  = myurl.query.norm || visual_post_items.normalization || 'none';
  var dist  = myurl.query.selected_distance || visual_post_items.selected_heatmap_distance || 'morisita_horn';  // default distance
  if(max <= min) {min=0;max=100;} 
  visual_post_items.min_range = Number(min)
  visual_post_items.max_range = Number(max)
  visual_post_items.normalization = norm
  visual_post_items.selected_heatmap_distance = dist

  var infile = path.join(__dirname, '../../tmp/'+ts+'_count_matrix.biom');
  fs.readFile(infile, 'utf8', function (err, json) {
    var mtx = JSON.parse(json);
    biome_matrix = COMMON.get_custom_biome_matrix(visual_post_items, mtx);
    var cust_file_name = ts+'_count_matrix_cust_heat.biom';
    // must write custom file for R script
    COMMON.write_file( '../../tmp/'+cust_file_name, JSON.stringify(biome_matrix,null,2) );
  
    console.log('Writing cust matrix file');
 
    var script_file = path.resolve(__dirname, '../../public/scripts/distance.R');

    var command = req.C.RSCRIPT_CMD + ' ' + script_file + ' ' + cust_file_name + ' ' + dist;
    console.log(command);
    exec(command, {maxBuffer:16000*1024}, function (error, stdout, stderr) {  // currently 16000*1024 handles 232 datasets
        if(stderr){console.log(stderr)}
        stdout = stdout.trim();
        console.log(stdout)
          
        var html = '<table border="1" class="single_border"><tr><td>';
        html += COMMON.get_selection_markup('heatmap', visual_post_items); // block for listing prior selections: domains,include_NAs ...
        html += '</td><td>';
        html += COMMON.get_choices_markup('heatmap', visual_post_items);      // block for controls to normalize, change tax percentages or distance
        html += '</td></tr></table>';
        if(stdout === 'dist(0)' || stdout === 'err') {
          html += '<div>Error -- No distances were calculated.</div>'
        }else{
          var dm = HMAP.create_distance_matrix(stdout);
          html  += HMAP.create_hm_html(dm);  
        }

        res.render('visuals/user_data/heatmap', {
              title: req.params.title   || 'default_title',
              timestamp: ts || 'default_timestamp',
              html : html,
              user: req.user
        });

    });
  });
 
});
//
//   D E N D R O G R A M
//
router.get('/user_data/dendrogram', function(req, res) {
  var myurl = url.parse(req.url, true);
  var exec = require('child_process').exec;
  var ts    = myurl.query.ts;
  var min   = myurl.query.min_range || visual_post_items.min_range || 0;
  var max   = myurl.query.max_range || visual_post_items.max_range || 100;
  var norm  = myurl.query.norm || visual_post_items.normalization || 'none';
  var dist  = myurl.query.selected_distance || visual_post_items.selected_heatmap_distance || 'morisita_horn';  // default distance
  if(max <= min) {min=0;max=100;} 
  visual_post_items.min_range = Number(min)
  visual_post_items.max_range = Number(max)
  visual_post_items.normalization = norm
  visual_post_items.selected_heatmap_distance = dist
  var ds_count = visual_post_items.no_of_datasets

  var infile = path.join(__dirname, '../../tmp/'+ts+'_count_matrix.biom');
  fs.readFile(infile, 'utf8', function (err, json) {
    var mtx = JSON.parse(json);
    biome_matrix = COMMON.get_custom_biome_matrix(visual_post_items, mtx);
    var cust_file_name = ts+'_count_matrix_cust_dend.biom';
    COMMON.write_file( '../../tmp/'+cust_file_name, JSON.stringify(biome_matrix,null,2) );

    var script_file = path.resolve(__dirname, '../../public/scripts/dendrogram.R');

    var command = req.C.RSCRIPT_CMD + ' ' + script_file + ' ' + cust_file_name + ' ' + dist;
    console.log(command);
    exec(command, {maxBuffer:16000*1024}, function (error, stdout, stderr) {  // currently 16000*1024 handles 232 datasets
        if(stderr){console.log(stderr)}
        stdout = stdout.trim();
        //console.log(stdout)
    
        var html = '<table border="1" class="single_border"><tr><td>';
        html += COMMON.get_selection_markup('heatmap', visual_post_items); // block for listing prior selections: domains,include_NAs ...
        html += '</td><td>';
        html += COMMON.get_choices_markup('heatmap', visual_post_items);      // block for controls to normalize, change tax percentages or distance
        html += '</td></tr></table>';
          
        html += DEND.create_dendrogram_html(stdout, ds_count);          

        res.render('visuals/user_data/dendrogram', {
              title: req.params.title   || 'default_title',
              timestamp: ts || 'default_timestamp',
              html : html,
              user: req.user
        });

    });
 
  });

});
/*
*   PARTIALS
*      These six partials all belong to the unit_selection page
*      and are shown via ajax depending on user selection in combo box
*       on that page.  AAV
*/
router.get('/partials/tax_silva108_simple',  function(req, res) {
    res.render('visuals/partials/tax_silva108_simple', {
        doms: req.C.DOMAINS
    });
});
//
//
//

// benchmarking
// var start = process.hrtime();
// 
// var elapsed_time = function(note){
//     var precision = 3; // 3 decimal places
//     var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
//     console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
//     start = process.hrtime(); // reset the timer
// };

router.get('/partials/tax_silva108_custom',  function(req, res) {
  res.render('visuals/partials/tax_silva108_custom', 
    { title   : 'Silva(v108) Custom Taxonomy Selection'});
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

/**
* F U N C T I O N S
*/

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
