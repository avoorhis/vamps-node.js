var express = require('express');
var router = express.Router();


var util = require('util');
var url  = require('url');
var http = require('http');
var path = require('path');
var fs   = require('fs');

var COMMON  = require('./routes_common');
var HELPERS = require('../helpers');
var MTX     = require('./routes_counts_matrix');
var HMAP    = require('./routes_distance_heatmap');
var BCHARTS = require('./routes_bar_charts');
var CTABLE  = require('./routes_counts_table');

var app = express();

// init_node var node_class = 
var CustomTaxa  = require('./custom_taxa_class');

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
  //console.log(req.body);
  //console.log('1');
  req.body.selection_obj       = JSON.parse(req.body.selection_obj);
  req.body.max_ds_count        = COMMON.get_max_dataset_count(req.body.selection_obj);
  req.body.chosen_id_name_hash = JSON.parse(req.body.chosen_id_name_hash);
  //console.log('2');
  // NORMALIZATION:
  var normalization  = req.body.normalization || 'none';
  if (normalization === 'max' || normalization === 'freq') {
    req.body.selection_obj = COMMON.normalize_counts(normalization, req.body);
  }
  
  
  var uitems = req.body.unit_choice.split('_');
  var unit_name_query = '';
  var unit_field;
  if (uitems[0] === 'tax'){  // covers both simple and custom
    unit_field = 'silva_taxonomy_info_per_seq_id';
    unit_name_query = COMMON.get_taxonomy_query( req.db, uitems, req.body );
  }else if(uitems[0] === 'otus') {
    unit_field = 'gg_otu_id';
    unit_name_query = COMMON.get_otus_query( req.db, uitems, req.body );
  }else if(uitems[0] === 'med_nodes') {
    unit_field = 'med_node_id';
    unit_name_query = COMMON.get_med_query( req.db, uitems, req.body );
  }else{
    console.log('ERROR--RORRE');
  }
  //console.log(unit_name_query);
  //console.log('4');
  console.log('3');
  req.body.selection_obj.counts_matrix = MTX.fill_in_counts_matrix( req.body.selection_obj, unit_field );  // just ids, but filled in zeros
  
  console.log(unit_name_query);

  
  //console.log('START BODY>> in route/visualization.js /view_selection');
  //console.log(JSON.stringify(req.body,null,2));
  //console.log('<<END BODY');
  //console.log(unit_name_query);
  //var old_sid = 'x';
  //var tids = [96,214,82,214,137];
  //var vals = [2,103,8,203,3];

  // for (i=0; i < tids.length; i++) {
  //   id = tids[i]
  //   if (id in tmp){
  //     tmp[id][0] += vals[i]
  //   } else {
  //     tmp[id] = [vals[i]]
  //   }
  // }

  // Get matrix data here
  // The visuals have been selected so now we need to create them
  // so they can be shown fast when selected
  req.db.query(unit_name_query, function(err, rows, fields){
    if (err) {
      throw err;
    } else {
      
      var timestamp = +new Date();  // millisecs since the epoch!
      var user = req.user || 'no-user';
      timestamp = user + '_' + timestamp;

      // this function: output_matrix writes various counts matrices to files for *possible* use later by R or D3
      // It also reurns a JSON count_matrix
      count_matrix = MTX.output_matrix( 'to_file_and_console', timestamp, req.body, rows );   // matrix to have names of datasets and units for display  -- not ids
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
      console.log('CM')
      console.log(JSON.stringify(count_matrix));
      //console.warn(util.inspect(matrix));
      //console.log(dataset_accumulator)
      
      if (req.body.visuals)
      {
        for (k=0; k < req.body.visuals.length; k++) 
        {
          if (req.body.visuals[k]  === 'counts_table'){ CTABLE.create_counts_table_html ( timestamp, count_matrix, req.body ); } // 
          if (req.body.visuals[k]  === 'heatmap')     { HMAP.create_heatmap_html (        timestamp, req.body ); }  // heatmap only needs timestamp; uses file not count_matrix OBJ
          if (req.body.visuals[k]  === 'barcharts')   { BCHARTS.create_barcharts_html (   timestamp, count_matrix, req.body ); }
          //if (req.body.visuals[k]  === 'dendrogram'){links.dendrogram = ''; create_dendrogram(req.body);}
          //if (req.body.visuals[k]  === 'alphadiversity'){links.alphadiversity = ''; create_alpha_diversity(req.body);}

        }        
      }
      res.render('visuals/view_selection', { title   : 'VAMPS: Visualization',
                                        body   : JSON.stringify(req.body),
                                        matrix : JSON.stringify(count_matrix),
                                        constants    : JSON.stringify(req.C),
                                        timestamp : timestamp,           // for creating unique files/pages                            
                                        user   : req.user
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
  console.log(JSON.stringify(req.body));
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

  for (var i=0; i < available_units.length; i++){
    accumulator.unit_assoc[available_units[i]]=[];
  }


  // dataset selection +/- is checked in routes/visualization.js: check_for_no_datasets()
  //console.log(req.body);
  var chosen_id_name_hash    = {};
  chosen_id_name_hash.ids    = [];
  chosen_id_name_hash.names  = [];
  console.log('req.body.dataset_ids')
  console.log(req.body.dataset_ids)
  for (var n=0; n < req.body.dataset_ids.length; n++){
    var items = req.body.dataset_ids[n].split('--');
    chosen_id_name_hash.ids.push(items[0]);
    chosen_id_name_hash.names.push(items[1]+'--'+items[2]);
  }
  //console.log('chosen_id_name_hash')
  //console.log(chosen_id_name_hash)
  // benchmarking
  var start = process.hrtime();

  // benchmarking
  var elapsed_time = function(note){
      var precision = 3; // 3 decimal places
      var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
      console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
      //start = process.hrtime(); // reset the timer
  };

  // benchmarking
  elapsed_time("START: select from sequence_pdr_info and sequence_uniq_info-->>>>>>");
  
  var qSelectSeqID = "SELECT dataset_id, seq_count, sequence_id, "+available_units+" FROM sequence_pdr_info";
  qSelectSeqID +=    "  JOIN sequence_uniq_info using(sequence_id)";
  qSelectSeqID +=    "  WHERE dataset_id in (" + chosen_id_name_hash.ids + ")";
  console.log(qSelectSeqID);


  db.query(qSelectSeqID, function(err, rows, fields){
    var u;

    if (err)  {
      throw err;
    } else {

      elapsed_time(">>>>>>>>> 2 Before Page Render and Calc <<<<<<");
      // here get tax_silva108_id, med_id, otu_id.... for each sequence_id from sequence_uniq_infos
      // and keep them in the same order as the sequence_ids
      

      for (var k=0; k < rows.length; k++){
        
        if (rows[k].dataset_id in dsets){
          dsets[rows[k].dataset_id].seq_ids.push(rows[k].sequence_id);
          dsets[rows[k].dataset_id].seq_counts.push(rows[k].seq_count);
          for (u=0; u < available_units.length; u++) {
            dsets[rows[k].dataset_id].unit_assoc[available_units[u]].push(rows[k][available_units[u]]);
          }
        } else {
          dsets[rows[k].dataset_id] = {};
          dsets[rows[k].dataset_id].seq_ids = [rows[k].sequence_id];
          dsets[rows[k].dataset_id].seq_counts = [rows[k].seq_count];
          dsets[rows[k].dataset_id].unit_assoc = {};
          for (u=0; u < available_units.length; u++) {
            dsets[rows[k].dataset_id].unit_assoc[available_units[u]] = [rows[k][available_units[u]]];
          }        
        }



      }
  // console.log('req.body.dataset_ids');
  // console.log(req.body.dataset_ids);
  // console.log('req.body.dataset_ids');
  // console.log('dsets');
  // console.log(dsets);
  // console.log('dsets');

      //console.log(dsets)
      for(i in chosen_id_name_hash.ids) {  // has correct ds order
        id = chosen_id_name_hash.ids[i]
        accumulator.dataset_ids.push(id);
        //dataset_accumulator.ds_counts.push(id)
        accumulator.seq_ids.push(dsets[id].seq_ids);
        accumulator.seq_freqs.push(dsets[id].seq_counts);
        for (u in dsets[id].unit_assoc) {
          accumulator.unit_assoc[u].push(dsets[id].unit_assoc[u]);
        }
      }
    }// end else

    // Adds dataset_ids that were selected but have no sequences
    // --not sure if this will be needed in production
    for (var n=0; n < req.body.dataset_ids.length; n++){
      var items = req.body.dataset_ids[n].split('--');
      var did = items[0];
      if(accumulator.dataset_ids.indexOf(did.toString()) === -1 || accumulator.dataset_ids.indexOf(did.toString()) === 'undefined'){
        //console.log('1 ' + did);
        accumulator.dataset_ids.push(did);
        accumulator.seq_ids.push([]);
        accumulator.seq_freqs.push([]);
        for (u=0; u < available_units.length; u++) {
          accumulator.unit_assoc[available_units[u]].push([]);
        }
      }
    }
    GLOBAL.dataset_accumulator = accumulator;
    //console.log(JSON.stringify(accumulator,null,4));
    //console.log(accumulator);
    //console.log('seq_ids length: '+accumulator.seq_ids[0].length.toString());
    elapsed_time(">>>>>>>>> 3 Before Page Render But after Query/Calc <<<<<<");
    res.render('visuals/unit_selection', {   title: 'Unit Selection',
                    chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
                    selection_obj: JSON.stringify(dataset_accumulator),
                    constants    : JSON.stringify(req.C),
                    body         : JSON.stringify(req.body),
                    //chosen_id_name_hash: chosen_id_name_hash,
                    //selection_obj: dataset_accumulator,
                    //constants    : req.C,
                    //body         : req.body,
                    user         : req.user
    });  // end render
    // benchmarking
    elapsed_time(">>>>>>>> 4 After Page Render <<<<<<");

  });  // end db query
   
   // benchmarking
   elapsed_time(">>>>>>>>> 1 Before Page Render and Query <<<<<<");


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
  res.render('visuals/index_visuals', { title   : 'Show Datasets!',
                                 rows    : JSON.stringify(ALL_DATASETS),
                                 constants    : JSON.stringify(req.C),
                                 user: req.user
                                  });
});

//
//
//
router.get('/user_data/counts_table', function(req, res) {
  
  var myurl = url.parse(req.url, true);
  //console.log(myurl)
  var ts = myurl.query.ts;
  var file = '../../tmp/'+ts+'_counts_table.html';
  fs.readFile(path.resolve(__dirname, file), 'UTF-8', function (err, html) {
    if (err) {
      console.log('Could not read file: ' + file + '\nHere is the error: '+ err);
    }
    res.render('visuals/user_data/counts_table', {
      title: req.params.title   || 'default_title',
      timestamp: myurl.query.ts || 'default_timestamp',
      html : html,
      user: req.user
    });
  });
});
//
//
//
router.get('/user_data/heatmap', function(req, res) {
  var myurl = url.parse(req.url, true);
  //console.log(myurl)
  var ts = myurl.query.ts;
  var file = '../../tmp/'+ts+'_heatmap.html';
  fs.readFile(path.resolve(__dirname, file), 'UTF-8', function (err, html) {
    if (err) { console.log('Could not read file: '+file + '\nHere is the error: '+ err ); }
    res.render('visuals/user_data/heatmap', {
      title: req.params.title   || 'default_title',
      timestamp: myurl.query.ts || 'default_timestamp',
      html : html,
      user: req.user
    });
  });
});
//
//
//
router.get('/user_data/barcharts', function(req, res) {
  var myurl = url.parse(req.url, true);
  //console.log(myurl)
  var ts = myurl.query.ts;
  var file = '../../tmp/'+ts+'_barcharts.html';
  fs.readFile(path.resolve(__dirname, file), 'UTF-8', function (err, html) {
    if (err) { console.log('Could not read file: ' + file + '\nHere is the error: '+ err ); }
    res.render('visuals/user_data/barcharts', {
      title: req.params.title   || 'default_title',
      timestamp: myurl.query.ts || 'default_timestamp',
      html : html,
      user: req.user
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
var start = process.hrtime();

var elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
    start = process.hrtime(); // reset the timer
};

router.get('/partials/tax_silva108_custom',  function(req, res) {
  function nodeVisitor(key, value) {
      console.log(
          JSON.stringify(this) // parent
          +"; key = "+JSON.stringify(key)
          +"; value = "+JSON.stringify(value));
      return value; // don't change
  }

/**
* TODO: return this or similar check to not create taxonomy list more then one time
*/
  // if (typeof tax_silva108_custom_short_rows === 'undefined')
  // {
    var tax_short_query = "SELECT DISTINCT domain, phylum, klass, `order`, family, genus, species, strain \
    FROM silva_taxonomy \
    JOIN domain AS dom USING(domain_id) \
    JOIN phylum AS phy USING(phylum_id) \
    JOIN klass AS kla USING(klass_id) \
    JOIN `order` AS ord USING(order_id) \
    JOIN family AS fam USING(family_id) \
    JOIN genus AS gen USING(genus_id) \
    JOIN species AS spe USING(species_id) \
    JOIN strain AS str USING(strain_id)";
    console.log('running custom tax query short');
    var db = req.db;
    resultMain = [];
    taxa_tree_dict = {};
    
    db.query(tax_short_query, function(err, rows, fields){
      if (err) 
      {
        throw err;
      } 
      else 
      {
        
        var node_class = new CustomTaxa(rows);
        var init_node = node_class.init_node()

        for (var i=0; i < rows.length; i++)
        {
          in_obj = rows[i];
          result = {}          
          // JSON.stringify("START 555");
          // JSON.stringify(in_obj, nodeVisitor);
          // JSON.stringify("end 111");
          
          
          // node_class.
          
          for (var taxa_rank in in_obj) 
          {
            
            if (in_obj.hasOwnProperty(taxa_rank)) 
            {
              result[taxa_rank] = in_obj[taxa_rank];              
              key = in_obj[taxa_rank];
              
            }
            // console.log("my_dict = " + JSON.stringify(my_dict, null, 4));
            // console.log("result = " + JSON.stringify(result, null, 4));
            
          }
          resultMain[i] = result;
        }
      }
      // console.log("resultMain = " + JSON.stringify(resultMain, null, 4));      
      res.render('visuals/partials/tax_silva108_custom', { title   : 'All Taxa',
        all_taxa: resultMain
      });
    });
    // console.log("resultMain = " + JSON.stringify(resultMain, null, 4));      
    // elapsed_time("tax_short_query");
    /*
    0 s, 0.502 ms - tax_short_query
    0 s, 0.424 ms - tax_short_query
    */
    // rows: JSON.stringify(rows),    
  // }

  
});


router.get('/partials/tax_silva108_custom_all',  function(req, res) {
  var db = req.db;
  // This query should be run only once and the results stored in memory
  // The GLOBAL keyword allows this
  // This taxonomy JSON object can be used for other taxonomies so eventually will be
  // move from here ...
  
  
  if (typeof tax_silva108_custom_rows === 'undefined'){
    var tax_query = "SELECT domain, phylum, klass, `order`, family, genus, species, strain FROM silva_taxonomy";
    tax_query +=    " JOIN domain as dom using(domain_id)";
    tax_query +=    " JOIN phylum as phy using(phylum_id)";
    tax_query +=    " JOIN klass as kla using(klass_id)";
    tax_query +=    " JOIN `order` as ord using(order_id)";
    tax_query +=    " JOIN family as fam using(family_id)";
    tax_query +=    " JOIN genus as gen using(genus_id)";
    tax_query +=    " JOIN species as spe using(species_id)";
    tax_query +=    " JOIN strain as str using(strain_id)";
    console.log('running custom tax query');
    console.log(tax_query);
    db.query(tax_query, function(err, rows, fields){
      if (err) {
        throw err;
      } else {
          var tax_silva108_custom_rows = {};

          for (var k=0; k < rows.length; k++){
            //console.log(rows[k])
            var domain = rows[k].domain;
            var phylum = rows[k].phylum  || 'phylum_NA';
            var klass  = rows[k].klass   || 'class_NA';
            var order  = rows[k].order   || 'order_NA';
            var family = rows[k].family  || 'family_NA';
            var genus  = rows[k].genus   || 'genus_NA';
            var species= rows[k].species || 'species_NA';
            var strain = rows[k].strain  || 'strain_NA';

//            TODO: How to rewrite it without nested ifs?
            if (domain in tax_silva108_custom_rows) {
              if (phylum in tax_silva108_custom_rows[domain]) {
                if (klass in tax_silva108_custom_rows[domain][phylum]) {
                  if (order in tax_silva108_custom_rows[domain][phylum][klass]) {
                    if (family in tax_silva108_custom_rows[domain][phylum][klass][order]) {
                      if (genus in tax_silva108_custom_rows[domain][phylum][klass][order][family]) {
                        if (species in tax_silva108_custom_rows[domain][phylum][klass][order][family][genus]) {
                          if (strain in tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species]) {
                            // must be dup
                          } else {
                            tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
                          }
                        } else {
                          tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
                          tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
                        }
                      } else {
                        tax_silva108_custom_rows[domain][phylum][klass][order][family][genus] = {};
                        tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
                        tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
                      }
                    } else {
                      tax_silva108_custom_rows[domain][phylum][klass][order][family] = {};
                      tax_silva108_custom_rows[domain][phylum][klass][order][family][genus] = {};
                      tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
                      tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
                    }
                  } else {
                    tax_silva108_custom_rows[domain][phylum][klass][order] = {};
                    tax_silva108_custom_rows[domain][phylum][klass][order][family] = {};
                    tax_silva108_custom_rows[domain][phylum][klass][order][family][genus] = {};
                    tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
                    tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
                  }
                } else {
                  tax_silva108_custom_rows[domain][phylum][klass] = {};
                  tax_silva108_custom_rows[domain][phylum][klass][order] = {};
                  tax_silva108_custom_rows[domain][phylum][klass][order][family] = {};
                  tax_silva108_custom_rows[domain][phylum][klass][order][family][genus] = {};
                  tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
                  tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
                }
              } else {
                tax_silva108_custom_rows[domain][phylum] = {};
                tax_silva108_custom_rows[domain][phylum][klass] = {};
                tax_silva108_custom_rows[domain][phylum][klass][order] = {};
                tax_silva108_custom_rows[domain][phylum][klass][order][family] = {};
                tax_silva108_custom_rows[domain][phylum][klass][order][family][genus] = {};
                tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
                tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
              }
            } else {
              tax_silva108_custom_rows[domain] = {};
              tax_silva108_custom_rows[domain][phylum] = {};
              tax_silva108_custom_rows[domain][phylum][klass] = {};
              tax_silva108_custom_rows[domain][phylum][klass][order] = {};
              tax_silva108_custom_rows[domain][phylum][klass][order][family] = {};
              tax_silva108_custom_rows[domain][phylum][klass][order][family][genus] = {};
              tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
              tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
            }
          }
          GLOBAL.tax_silva108_custom_rows = tax_silva108_custom_rows;
          console.log(util.inspect(tax_silva108_custom_rows, {showHidden: false, depth: null}));

          res.render('visuals/partials/tax_silva108_custom', {
            rows: tax_silva108_custom_rows
          });
      }
    });
  } else {
    console.log('already have custom tax query');
    res.render('visuals/partials/tax_silva108_custom', {
            rows: tax_silva108_custom_rows
    });
  }

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
