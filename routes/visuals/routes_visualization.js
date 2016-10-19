var express = require('express');
var router = express.Router();

var util = require('util');
var url  = require('url');
var http = require('http');
var path = require('path');
var fs   = require('fs-extra');
var open = require('open');
var async = require('async');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var zlib = require('zlib');
var Readable = require('readable-stream').Readable;

var helpers = require('../helpers/helpers');
var QUERY = require('../queries');

var COMMON  = require('./routes_common');
var META    = require('./routes_visuals_metadata');
//var PCOA    = require('./routes_pcoa');
var MTX     = require('./routes_counts_matrix');
//var HMAP    = require('./routes_distance_heatmap');
//var DEND    = require('./routes_dendrogram');
//var BCHARTS = require('./routes_bar_charts');
//var PCHARTS = require('./routes_pie_charts');
//var CTABLE  = require('./routes_counts_table');
//var PythonShell = require('python-shell');
var spawn = require('child_process').spawn;
var app = express();
// GLOBALS
PROJECT_TREE_PIDS = []
PROJECT_TREE_OBJ = []
DATA_TO_OPEN = {};
TAXCOUNTS = {};
METADATA  = {}; 
BIOM_MATRIX = {};
//var xmldom = require('xmldom');

// // init_node var node_class =
// var CustomTaxa  = require('./custom_taxa_class');

/*
 * GET visualization page from uploaded IMAGE or CONFIGURATION FILE
 */
router.get('/view_selection/:filename/:from_configuration_file', helpers.isLoggedIn, function(req, res) {
    console.log('req.body: view_selectionGET::prefix-->>');
    console.log(req.body);
    console.log(req.params);
    console.log('req.body: view_selectionGET>>prefix');
    req.flash('message', 'Using data from configuration file.');
    TAXCOUNTS = {};
    METADATA  = {}; 
    var image_to_open = {}
    var config_file_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, req.params.filename);
    var config_file_data = JSON.parse(fs.readFileSync(config_file_path, 'utf8'))
    if(config_file_data.hasOwnProperty('image')){
      console.log('FILE is IMAGE')
      image_to_open['image'] = config_file_data.image
    }else{
      console.log('FILE is CONFIG')
    }
    if(config_file_data.hasOwnProperty('phylum')){
      console.log('FILE is IMAGE (phyloseq bars or heatmap)')
      image_to_open['phylum'] = config_file_data.phylum
    }else{
      console.log('FILE is CONFIG or IMAGE w/o phyloseq bars or heatmap')
    }
    //console.log(file_data)
    visual_post_items = config_file_data.post_items;
    chosen_id_name_hash = config_file_data.id_name_hash;
    dataset_ids = chosen_id_name_hash.ids;
    for(var i in dataset_ids){
      var did = dataset_ids[i]
      try{
          if(HDF5_TAXDATA == ''){
            if(visual_post_items.unit_choice == 'tax_rdp2.6_simple'){
                var files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_rdp2.6");
            }else{
                var files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_silva119");
            }
            var path_to_file = path.join(files_prefix, did +'.json');
            var jsonfile = require(path_to_file);
            TAXCOUNTS[did] = jsonfile['taxcounts'];
            METADATA[did]  = jsonfile['metadata'];
            
          }else{
            TAXCOUNTS[did] = helpers.get_attributes_from_hdf5_group(did, 'taxcounts')
            METADATA[did] = helpers.get_attributes_from_hdf5_group(did, 'metadata')
          }
      }
      catch(err){
        console.log('1- no file '+err.toString()+' Exiting');
        req.flash('Message', "ERROR \
          Dataset file not found '"+dataset_ids[i] +".json' (configuration file may be out of date)");
          //res.redirect('visuals_index');
          //return;
      }
      
    }
    console.log('TS')
    console.log(visual_post_items)
    //var timestamp = +new Date();  // millisecs since the epoch!
    //timestamp = req.user.username + '_' + timestamp;
    //visual_post_items.ts = timestamp;
    distance_matrix = {};
    BIOM_MATRIX = MTX.get_biom_matrix(chosen_id_name_hash, visual_post_items);
    var metadata = META.write_mapping_file(chosen_id_name_hash, visual_post_items);
    
    res.render('visuals/view_selection', {
                                title           : 'VAMPS: Visuals Select',
                                referer         : 'unit_selection',
                                chosen_id_name_hash : JSON.stringify(chosen_id_name_hash),
                                matrix          : JSON.stringify(BIOM_MATRIX),
                                metadata        : JSON.stringify(metadata),
                                constants       : JSON.stringify(req.CONSTS),
                                post_items      : JSON.stringify(visual_post_items),
                                user            : req.user,
                                hostname        : req.CONFIG.hostname,
                                gekey           : req.CONFIG.GOOGLE_EARTH_KEY,
                                image_to_render : JSON.stringify(image_to_open),
	                          //locals: {flash: req.flash('infomessage')},
                                message         : req.flash('Message')
    });
    
});
//
//  V I E W  S E L E C T I O N
//
router.post('/view_selection', helpers.isLoggedIn, function(req, res) {

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
  if(req.body.unit_choice == 'tax_rdp2.6_simple'){
    delete req.body['silva119_domains']
  }else if(req.body.unit_choice == 'tax_silva119_simple'){
    delete req.body['rdp2.6_domains']
  }
  console.log('req.body: view_selection body-->>');
  console.log(req.body);
  console.log('<<--req.body: view_selection');
  
  helpers.start = process.hrtime();
  
//   req.body: view_selection-->>
// { unit_choice: 'tax_silva108_simple',
//   domains: [ 'Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown' ],
//   tax_depth: 'phylum',
//   select_type: 'clade',
//   meta_ckbx_toggle: 'all',
//   selected_metadata: [ 'sample_source', 'patient', 'gene_target' ] }
// req.body: view_selection
  if(req.body.restore_image === '1'){
    console.log('in view_selection RESTORE IMAGE')
  }else if(req.body.resorted === '1'){
    req.flash('message','The dataset order has been updated.');
    dataset_ids = req.body.ds_order;
    chosen_id_name_hash  = COMMON.create_chosen_id_name_hash(dataset_ids);	
  }else if(req.body.from_configuration_file === '1' || req.query.from_configuration_file === '1'){
    req.flash('message', 'Using data from configuration file.');
    TAXCOUNTS = {};
    METADATA  = {}; 
    //
    var config_file_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, req.body.filename);
    var config_file_data = JSON.parse(fs.readFileSync(config_file_path, 'utf8'))
    //console.log(file_data)
    visual_post_items = config_file_data.post_items;
    chosen_id_name_hash = config_file_data.id_name_hash;
    dataset_ids = chosen_id_name_hash.ids;
    for(var i in dataset_ids){
      var did = dataset_ids[i]
     
      try{
       
        if(HDF5_TAXDATA == ''){
            if(visual_post_items.unit_choice == 'tax_rdp2.6_simple'){
                var files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_rdp2.6");
            }else{
                var files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_silva119");
            }
            var path_to_file = path.join(files_prefix, dataset_ids[i] +'.json');
            var jsonfile = require(path_to_file);
            TAXCOUNTS[did] = jsonfile['taxcounts'];
            METADATA[did]  = jsonfile['metadata'];
        }else{
            
            TAXCOUNTS[did] = helpers.get_attributes_from_hdf5_group(did, 'taxcounts')
            METADATA[did] = helpers.get_attributes_from_hdf5_group(did, 'metadata')
        }
        
      }
      catch(err){
        console.log('2-no file '+err.toString()+' Exiting');
        req.flash('Message', "ERROR \
          Dataset file not found '"+dataset_ids[i] +".json' (configuration file may be out of date)");
          //res.redirect('visuals_index');
          //return;
      }
      
    }
  }else{
    // GLOBAL Variable
    visual_post_items = COMMON.save_post_items(req);

    dataset_ids = chosen_id_name_hash.ids;

    for(var i in dataset_ids){
      var did = dataset_ids[i]
     
      try{
       
        
        if(HDF5_TAXDATA == ''){
            if(visual_post_items.unit_choice == 'tax_rdp2.6_simple'){
                var files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_rdp2.6");
            }else{
                var files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_silva119");
            }
            var path_to_file = path.join(files_prefix, dataset_ids[i] +'.json');
            var jsonfile = require(path_to_file);
            TAXCOUNTS[did] = jsonfile['taxcounts'];
            METADATA[did]  = jsonfile['metadata'];
        }else{
            
            TAXCOUNTS[did] = helpers.get_attributes_from_hdf5_group(did, 'taxcounts')
            METADATA[did] = helpers.get_attributes_from_hdf5_group(did, 'metadata')
        }
        
      }
      catch(err){
        console.log('2-no file '+err.toString()+' Exiting');
        req.flash('Message', "ERROR \
          Dataset file not found '"+dataset_ids[i] +".json' (configuration file may be out of date)");
          //res.redirect('visuals_index');
          //return;
      }
      
    }

  }
  
  
  //console.log('chosen_id_name_hash:>>');
  //console.log(chosen_id_name_hash);
  //console.log('<<chosen_id_name_hash');
    
  //console.log('TAXCOUNTS:>>');
  //console.log(TAXCOUNTS);
  //console.log('<<TAXCOUNTS');
  // GLOBAL
  var timestamp = +new Date();  // millisecs since the epoch!
  timestamp = req.user.username + '_' + timestamp;
  visual_post_items.ts = timestamp;
  distance_matrix = {};
  BIOM_MATRIX = MTX.get_biom_matrix(chosen_id_name_hash, visual_post_items);
  visual_post_items.max_ds_count = BIOM_MATRIX.max_dataset_count;
  

  console.log('VS--visual_post_items:>>');
  console.log(visual_post_items);
  console.log('<<VS--visual_post_items:');
 

  // GLOBAL
  //console.log('metadata>>');
  //metadata = META.write_metadata_file(chosen_id_name_hash, visual_post_items);
  var metadata = META.write_mapping_file(chosen_id_name_hash, visual_post_items);
  //metadata = JSON.parse(metadata);
  //console.log(metadata);
  //console.log('<<metadata');
  //console.log('MAP:::');
  //console.log(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank)
  //console.log(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["724_class"]["taxon"])

  //
  //uid_matrix = MTX.fill_in_counts_matrix( selection_obj, unit_field );  // just ids, but filled in zeros
  // {unit_id:[cnt1,cnt2...] // counts are in ds order
  
  //console.log(BIOM_MATRIX);


  res.render('visuals/view_selection', {
                                title           : 'VAMPS: Visuals Select',
                                referer         : 'unit_selection',
                                chosen_id_name_hash : JSON.stringify(chosen_id_name_hash),
                                matrix          : JSON.stringify(BIOM_MATRIX),
                                metadata        : JSON.stringify(metadata),
                                constants       : JSON.stringify(req.CONSTS),
                                post_items      : JSON.stringify(visual_post_items),
                                user            : req.user,
                                hostname        : req.CONFIG.hostname,
                                gekey           : req.CONFIG.GOOGLE_EARTH_KEY,
                                image_to_render : JSON.stringify({}),
	                          //locals: {flash: req.flash('infomessage')},
                                message         : req.flash('Message')
                 });

});


//
// U N I T  S E L E C T I O N
//
// use the isLoggedIn function to limit exposure of each page to
// logged in users only
router.post('/unit_selection', helpers.isLoggedIn, function(req, res) {
//router.post('/unit_selection',  function(req, res) {

  // TESTING:
  //    There should be one or more datasets shown in list
  //    The Submit button should return with an alert error if no display checkboxes are checked
  //    There should be a 'default' Units Selection present (This point is debatable -- the other option
  //        would be leave blank and force the user to select). I chose Silva108--Simple Taxonomy as default.
  //    The 'Display Output' section should list the items from public/constants.js
  //    The 'Normailzation' section should list the items from public/constants.js with the NotNormalized option
  //        checked by default.
  
  console.log('req.body: unit_selection-->>');
  console.log(req.body);
  console.log('req.body: unit_selection');
  if(typeof  unit_choice === 'undefined'){
    unit_choice = 'tax_silva119_simple';
  }
  console.log(unit_choice);
  var dataset_ids = [];
  if(req.body.resorted === '1'){
  	dataset_ids = req.body.ds_order;	
  }else{
    dataset_ids = JSON.parse(req.body.dataset_ids);
  }

  // for reload page
  // else if(req.body.retain_data === '1'){
  //   dataset_ids = JSON.parse(req.body.dataset_ids);	
  // }else{
  //   dataset_ids = req.body.dataset_ids;
  // }

  console.log('dataset_ids '+dataset_ids);
  if (dataset_ids === undefined || dataset_ids.length === 0){
      console.log('redirecting back -- no data selected');
   	 req.flash('nodataMessage', 'Select Some Datasets');
   	 //res.redirect('visuals_index');
     return;
  }else{
	  // Global TAXCOUNTS, METADATA
	  TAXCOUNTS = {};
    
	  METADATA  = {}; 
	  // Gather just the tax data of selected datasets
	  //

    
    for(var i in dataset_ids){
      //console.log('ds',dataset_ids[i])
      var did = dataset_ids[i]
      
        
        if(HDF5_TAXDATA == ''){
            // use default taxonomy here (may choose other on this page)
            var files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_silva119");
            var path_to_file = path.join(files_prefix, dataset_ids[i] +'.json');
            var jsonfile = require(path_to_file);
            //TAXCOUNTS[dataset_ids[i]] = jsonfile['taxcounts'];
            METADATA[dataset_ids[i]]  = jsonfile['metadata'];
        }else{
            TAXCOUNTS[did] = helpers.get_attributes_from_hdf5_group(did, 'taxcounts')
            METADATA[did] = helpers.get_attributes_from_hdf5_group(did, 'metadata')
        }
        
        


     
		  
	  }
	  //console.log(JSON.stringify(METADATA))
	  //console.log('49x',JSON.stringify(TAXCOUNTS['49']))
    //console.log(JSON.stringify(TAXCOUNTS2[49]))
	  console.log('Pulling xTAXCOUNTS and METADATA -- ONLY for datasets selected (from files)');
	  //console.log('TAXCOUNTS= '+JSON.stringify(TAXCOUNTS));
    //console.log('METADATA= '+JSON.stringify(METADATA));
	  var available_units = req.CONSTS.AVAILABLE_UNITS; // ['med_node_id','otu_id','taxonomy_gg_id']

	  // GLOBAL Variable
	  chosen_id_name_hash           = COMMON.create_chosen_id_name_hash(dataset_ids);

	  var custom_metadata_headers   = COMMON.get_metadata_selection(chosen_id_name_hash.ids,METADATA,'custom');
	  var required_metadata_headers = COMMON.get_metadata_selection(chosen_id_name_hash.ids,METADATA,'required');
	  console.log(required_metadata_headers)
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
    //console.log(custom_metadata_headers)
	  // benchmarking
	  helpers.start = process.hrtime();
	  helpers.elapsed_time("START: select from sequence_pdr_info and sequence_uniq_info-->>>>>>");


	  console.log('chosen_id_name_hash-->');
	  console.log(chosen_id_name_hash);
	  console.log(chosen_id_name_hash.ids.length);
	  console.log('<--chosen_id_name_hash');
    console.log('units: ',unit_choice)

	  res.render('visuals/unit_selection', {
	                    title: 'VAMPS: Units Selection',
                      referer: 'visuals_index',
	                    chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
	                    constants    : JSON.stringify(req.CONSTS),
	                    md_cust      : JSON.stringify(custom_metadata_headers),  // should contain all the cust headers that selected datasets have
		  				        md_req       : JSON.stringify(required_metadata_headers),
                      unit_choice : unit_choice,
		  				        message      : req.flash('Message'),
	                    user         : req.user,hostname: req.CONFIG.hostname,
	  });  // end render
  }
    // benchmarking
  helpers.elapsed_time(">>>>>>>> 4 After Page Render <<<<<<");


}); // end fxn

/*
 * GET visualization page.
 */
router.get('/visuals_index', helpers.isLoggedIn, function(req, res) {
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
    //console.log(PROJECT_INFORMATION_BY_PID);
    console.log('req.body index')
    //console.log(req.body)

    //console.log(ALL_DATASETS);
    // GLOBAL
    SHOW_DATA = ALL_DATASETS;
    TAXCOUNTS = {}; // empty out this global variable: fill it in unit_selection
    METADATA  = {};
    unit_choice = 'tax_silva119_simple';
    // GLOBAL
    DATA_TO_OPEN = {};
    if(req.body.data_to_open){
      // open many projects
      obj = JSON.parse(req.body.data_to_open)
      for(pj in obj){
        pid = PROJECT_INFORMATION_BY_PNAME[pj].pid
        DATA_TO_OPEN[pid] = obj[pj]
      }
      //console.log('got data to open '+data_to_open)
    }else if(req.body.project){
      // open whole project
      DATA_TO_OPEN[req.body.project_id] = DATASET_IDS_BY_PID[req.body.project_id];
    }
    console.log('DATA_TO_OPEN');
    console.log(DATA_TO_OPEN);


    res.render('visuals/visuals_index', {
                                  title       : 'VAMPS: Select Datasets',
                                  subtitle    : 'Dataset Selection Page',
                                  proj_info   : JSON.stringify(PROJECT_INFORMATION_BY_PID),
                                  constants   : JSON.stringify(req.CONSTS),
                                  md_names    : AllMetadataNames,
                                  filtering   : 0,
                                  portal_to_show : '',
                                  data_to_open: JSON.stringify(DATA_TO_OPEN),	  							              
                                  user        : req.user,
                                  hostname    : req.CONFIG.hostname,
                                  message     : req.flash('nodataMessage'),
                              });
  });

router.post('/visuals_index', helpers.isLoggedIn, function(req, res) {
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
  //console.log(PROJECT_INFORMATION_BY_PID);
  console.log('req.body index')
  //console.log(req.body)

  //console.log(ALL_DATASETS);
  // GLOBAL
  SHOW_DATA = ALL_DATASETS;
  TAXCOUNTS = {}; // empty out this global variable: fill it in unit_selection
  METADATA  = {};
  unit_choice = 'tax_silva119_simple';
  // GLOBAL
  DATA_TO_OPEN = {};
  if(req.body.data_to_open){
    // open many projects
    obj = JSON.parse(req.body.data_to_open)
    for(pj in obj){
      pid = PROJECT_INFORMATION_BY_PNAME[pj].pid
      DATA_TO_OPEN[pid] = obj[pj]
    }
    //console.log('got data to open '+data_to_open)
  }else if(req.body.project){
    // open whole project
    DATA_TO_OPEN[req.body.project_id] = DATASET_IDS_BY_PID[req.body.project_id];
  }
  console.log('DATA_TO_OPEN');
  console.log(DATA_TO_OPEN);
  
  
  res.render('visuals/visuals_index', {
                                title       : 'VAMPS: Select Datasets',
                                subtitle    : 'Dataset Selection Page',
                                proj_info   : JSON.stringify(PROJECT_INFORMATION_BY_PID),
                                constants   : JSON.stringify(req.CONSTS),
                                md_names    : AllMetadataNames,
                                filtering   : 0,
                                portal_to_show : '',
                                data_to_open: JSON.stringify(DATA_TO_OPEN),	  							              
                                user        : req.user,
                                hostname    : req.CONFIG.hostname,
                                message     : req.flash('nodataMessage'),
                            });
});

//
//
//
router.post('/reorder_datasets', helpers.isLoggedIn, function(req, res) {
    
    var ts = visual_post_items.ts || null;
    res.render('visuals/reorder_datasets', {
                                title   : 'VAMPS: Reorder Datasets',
                                chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
                                constants    : JSON.stringify(req.CONSTS),
								                referer: req.body.referer,
                                ts : ts,
                                user: req.user, hostname: req.CONFIG.hostname,
                            });
  //console.log(chosen_id_name_hash)
});
//
//
//
router.post('/view_saved_datasets', helpers.isLoggedIn, function(req, res) {
  // this fxn is required for viewing list of saved datasets
  // when 'toggle open button is activated'
  fxn = req.body.fxn;
  //console.log('XX'+JSON.stringify(req.body));
  var file_path = path.join(req.CONFIG.USER_FILES_BASE, req.body.user, req.body.filename);
  console.log(file_path);
  var dataset_ids = [];
  fs.readFile(file_path, 'utf8',function readFile(err,data) {
    if (err) {
      msg = 'ERROR Message '+err;
        helpers.render_error_page(req,res,msg);
    }else{    
      console.log(data)
      res.send(data);
    }
  });
});
router.post('/get_saved_datasets', helpers.isLoggedIn, function(req, res) {
  // this fxn is required for viewing list of saved datasets
  // when 'toggle open button is activated'
  console.log(req.body.filename)
  //console.log('XX'+JSON.stringify(req.body));
  var file_path = path.join(req.CONFIG.USER_FILES_BASE, req.body.user, req.body.filename);
  console.log(file_path);
  var dataset_ids = [];
  fs.readFile(file_path, 'utf8',function readFile(err,data) {
    if (err) {
      msg = 'ERROR Message '+err;
        helpers.render_error_page(req,res,msg);
    }else{    
      res.redirect('unit_selection');
    }
  });
});
//
//
//
router.post('/heatmap', helpers.isLoggedIn, function(req, res) {
    //console.log('found routes_test_heatmap')
    console.log('req.body hm');
    console.log(req.body);
    console.log('req.body hm');
    
    var ts = req.body.ts;
    var metric = req.body.metric;
    var biom_file_name = ts+'_count_matrix.biom';
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    var biom_file = path.join(pwd,'tmp', biom_file_name);
    //console.log('mtx1')
   
    var html = '';
    var title = 'VAMPS';

    var distmtx_file_name = ts+'_distance.csv';
    var distmtx_file = path.join(pwd,'tmp',distmtx_file_name);
    
    var options = {
     scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
       args :       [ '-in', biom_file, '-metric', metric, '--function', 'dheatmap', '--outdir', path.join(pwd,'tmp'), '--prefix', ts],
     };
        
    var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
    
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
    var heatmap_process = spawn( options.scriptPath+'/distance.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true, 
            //stdio: [ 'ignore', null, log ] // stdin, stdout, stderr
            stdio: 'pipe' // stdin, stdout, stderr
        });  
    
    
    var stdout = '';
    heatmap_process.stdout.on('data', function heatmapProcessStdout(data) {
        //console.log('stdout: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stdout += data;
    });
    var stderr = '';
    heatmap_process.stderr.on('data', function heatmapProcessStderr(data) {
        console.log('stderr: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stderr += data;
    });
         
    heatmap_process.on('close', function heatmapProcessOnClose(code) {
        console.log('heatmap_process process exited with code ' + code);
               
        //var last_line = ary[ary.length - 1];
        if(code === 0){   // SUCCESS     
          try{
            console.log(stdout)
            distance_matrix = JSON.parse(stdout);
          }
          catch(err){
            distance_matrix = {'ERROR':err};
          }  
            res.render('visuals/partials/create_distance_heatmap',{
                  dm        : distance_matrix,
                  hash      : JSON.stringify(chosen_id_name_hash),                      
                  constants : JSON.stringify(req.CONSTS),
                  metric    : metric,
                  ts        : ts
              }); 

        }else{
          console.log('output: '+stderr);
          res.send(stderr);
        }      
    });   

});


//
//   F R E Q U E N C Y  H E A T M A P
//
router.post('/frequency_heatmap', helpers.isLoggedIn, function(req, res) {

  console.log('in Freq HM');
  var ts = req.body.ts;
  var metric = req.body.metric;
  var biom_file_name = ts+'_count_matrix.biom';
  var biom_file = path.join(process.env.PWD, 'tmp',biom_file_name);
  var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
  var html = '';
  var title = 'VAMPS';

  var distmtx_file_name = ts+'_distance.csv';
  var distmtx_file = path.join(pwd,'tmp',distmtx_file_name);
  var metric = visual_post_items.selected_distance
  var tmp_path = path.join(process.env.PWD,'tmp'); 
  var tax_depth = visual_post_items.tax_depth

  var options = {
        scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
        args :       [ tmp_path, ts, metric, tax_depth],
      };

  var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
  
  
  console.log(options.scriptPath+'/fheatmap.R '+options.args.join(' '));
  var fheatmap_process = spawn( options.scriptPath+'/fheatmap.R', options.args, {
          env:{'PATH':req.CONFIG.PATH},
          detached: true, 
          //stdio: [ 'ignore', null, log ]
          stdio: 'pipe'  // stdin, stdout, stderr
      }); 
  stdout = '';
  fheatmap_process.stdout.on('data', function fheatmapProcessStdout(data) {
      
      stdout += data;    
   
  });
  stderr = '';
  fheatmap_process.stderr.on('data', function fheatmapProcessStderr(data) {
      
      stderr += data;    
   
  }); 
  
  fheatmap_process.on('close', function fheatmapProcessOnClose(code) {
        console.log('fheatmap_process process exited with code ' + code);
        //distance_matrix = JSON.parse(output);
        //var last_line = ary[ary.length - 1];
        if(code === 0){   // SUCCESS       
              //image_file = ts+'_heatmap.pdf';
              //image_file = path.join(process.env.PWD,'tmp', ts+'_heatmap.pdf');
              //res.send("<img src='/"+image_file+"'>");
              
              //var viz_width = 1200;
              //var viz_height = (visual_post_items.no_of_datasets*12)+100;
              var image = '/'+ts+'_fheatmap.pdf';
              //console.log(image)
              html = "<div id='pdf'>";
              html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='100%' height='700' />";
              html += " <p>ERROR in loading pdf file</p>";
              html += "</object></div>";
              res.send(html);

              return;
              // fs.readFile(image_file, 'utf8', function (err,data) {
              //   if (err) {
              //      console.log(err);
              //      res.send('FreqHeatmap File Error');
              //    }
              //    console.log('Reading: '+image)
              //    //data_items = data.split('\n')
                 
              //    //X=data_items.slice(1,data_items.length)
              //    //d = X.join('\n')
              //    //console.log(d)
              //    res.send(data);
              // });
                                        
        }else{
          console.log('ERROR');
          res.send('Frequency Heatmap R Script Error:'+stderr);
        }      
  });   
  

});


//
//
//
router.post('/dendrogram', helpers.isLoggedIn, function(req, res) {
    console.log('found routes_dendrogram-x');
    ///// this vesion of dendrogram is or running d3 on CLIENT: Currently:WORKING
    ///// It passes the newick string back to view_selection.js
    ///// and tries to construct the svg there before showing it.
    console.log('req.body dnd');
    console.log(req.body);
    console.log('req.body dnd');
    var ts = req.body.ts;
    var metric = req.body.metric;
    var script = req.body.script; // python, phylogram or phylonator
    var image_type = req.body.image_type;  // png(python script) or svg
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    //console.log('image_type '+image_type);
    // see:  http://bl.ocks.org/timelyportfolio/59acc3853b02e47e0dfc
  
    var biom_file_name = ts+'_count_matrix.biom';
    var biom_file = path.join(pwd,'tmp',biom_file_name);

    var html = '';
    var title = 'VAMPS';

    var distmtx_file_name = ts+'_distance.csv';
    var distmtx_file = path.join(pwd,'tmp',distmtx_file_name);
    

    var options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'dendrogram-'+image_type, '--outdir', path.join(pwd,'tmp'), '--prefix', ts ],
    };
   
    var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
    var dendrogram_process = spawn( options.scriptPath+'/distance.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true, 
            //stdio: [ 'ignore', null, log ] // stdin, stdout, stderr
            stdio: 'pipe'  // stdin, stdout, stderr
    });  
    
    var stdout = '';
    dendrogram_process.stdout.on('data', function dendrogramProcessStdout(data) {
        //
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stdout += data;

    });
    var stderr = '';
    dendrogram_process.stderr.on('data', function dendrogramProcessStderr(data) {
        console.log('stderr: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stderr += data;
    });
    
    dendrogram_process.on('close', function dendrogramProcessOnClose(code) {
        console.log('dendrogram_process process exited with code ' + code);
      
        //var last_line = ary[ary.length - 1];
        if(code === 0){   // SUCCESS       
          if(image_type == 'svg'){
                    console.log('stdout: ' + stdout);
                    lines = stdout.split('\n')
                    for(n in lines){
                      if(lines[n].substring(0,6) == 'NEWICK' ){
                        tmp = lines[n].split('=')
                        continue
                      }
                    }

                    
                    try{
                      newick = JSON.parse(tmp[1]);
                      console.log(newick)
                    }
                    catch(err){
                      newick = {"ERROR":err};
                    }
                    res.send(newick);
                    return;

          }else{  // 'pdf'
                    var viz_width = 1200;
                    var viz_height = (visual_post_items.no_of_datasets*12)+100;
                    var image = '/'+ts+'_dendrogram.pdf';
                    //console.log(image)
                    html = "<div id='pdf'>";
                    html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='100%' height='"+viz_height+"' />";
                    html += " <p>ERROR in loading pdf file</p>";
                    html += "</object></div>";
                    res.send(html);
                    return;
          }                                     
        }else{
          console.log('stderr: '+stderr);
          res.send('Script Error');
        }      
    });   
    
    
    
 
});

//
// P C O A
//
router.post('/pcoa', helpers.isLoggedIn, function(req, res) {
    console.log('in PCoA');
    //console.log(metadata);
    var ts = req.body.ts;
    var rando = Math.floor((Math.random() * 100000) + 1);  // required to prevent image caching
    var metric = req.body.metric;
    var image_type = req.body.image_type;
    //var image_file = ts+'_'+metric+'_pcoaR'+rando.toString()+'.pdf';
    var image_file = ts+'_pcoa.pdf';
    var biom_file_name = ts+'_count_matrix.biom';
    var biom_file = path.join(process.env.PWD,'tmp', biom_file_name);
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    var tmp_path = path.join(process.env.PWD,'tmp');
    var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
    
    md1 = req.body.md1 || "Project";
    md2 = req.body.md2 || "Description";
        
      // var options = {
      //   scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      //   args :       [ '-in', biom_file, '-metric', metric, '--function', 'pcoa_2d', '--site_base', process.env.PWD, '--prefix', ts],
      // };
      var options2 = {
        scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
        args :       [ tmp_path, ts, metric, md1, md2, image_file],
      };
      console.log(options2.scriptPath+'/pcoa2.R '+options2.args.join(' '));
     
      var pcoa_process = spawn( options2.scriptPath+'/pcoa2.R', options2.args, {
          env:{'PATH':req.CONFIG.PATH},
          detached: true, 
          stdio: [ 'ignore', null, log ]
          //stdio: 'pipe' // stdin, stdout, stderr
      });  
  
      
      pcoa_process.on('close', function pcoaProcessOnClose(code) {
          //console.log('pcoa_process process exited with code ' + code+' -- '+output);
          //distance_matrix = JSON.parse(output);
          //var last_line = ary[ary.length - 1];
          if(code === 0){   // SUCCESS       
              
            //html = "<img src='/"+image_file+"'>";
            //var image = path.join('/tmp/',image_file);              
            var html = "<div id='pdf'>";
            html += "<object data='/"+image_file+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='1000' height='600' />";
            html += " <p>ERROR in loading pdf file</p>";
            html += "</object></div>";
            //console.log(html);                 
                                                      
          }else{
              console.log('ERROR');
              html='PCoA Script Failure -- Try a deeper rank, or more metadata or datasets';
          } 

          res.send(html);

      });   
      
        
    
    
});
//
//  EMPEROR....
// POST is for PC file link
router.post('/pcoa3d', helpers.isLoggedIn, function(req, res) {
        
        var ts = visual_post_items.ts; 
        var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
        var pc_file_name = ts+'.pc';
        //var pc_file = path.join(pwd,'tmp', pc_file_name);
        ///////////////////////////////////////////////////
  console.log('in 3D');
  console.log(visual_post_items);
  var ts = visual_post_items.ts;    
  var metric = visual_post_items.selected_distance;
  
  var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
  var biom_file_name = ts+'_count_matrix.biom';
  var biom_file = path.join(pwd,'tmp', biom_file_name);
  
  var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');

  var mapping_file_name = ts+'_metadata.txt';
  var mapping_file = path.join(pwd,'tmp', mapping_file_name);        
  var pc_file_name = ts+'.pc';
  var pc_file = path.join(pwd,'tmp', pc_file_name);
  //var tax_file_name = ts+'_taxonomy.txt';
  //var tax_file = path.join(pwd,'tmp', tax_file_name);
  var dist_file_name = ts+'_distance.csv';
  var dist_file = path.join(pwd,'tmp', dist_file_name);

  var dir_name = ts+'_pcoa3d';
  var dir_path = path.join(pwd,'views/tmp', dir_name);        
  var html_path = path.join(dir_path, 'index.html');  // file to be created by make_emperor.py script
  //var html_path2 = path.join('../','tmp', dir_name, 'index.html');  // file to be created by make_emperor.py script
  var options1 = {
    scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
    args :       [ '-in', biom_file, '-metric', metric, '--function', 'pcoa_3d', '--outdir', path.join(pwd,'tmp'), '--prefix', ts],
  };
  var options2 = {
      //scriptPath : req.CONFIG.PATH_TO_QIIME_BIN,
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-i', pc_file, '-m', mapping_file, '-o', dir_path],
  };
  console.log('outdir: '+dir_path);
  console.log(options1.scriptPath+'/distance.py '+options1.args.join(' '));
  

  var pcoa_process = spawn( options1.scriptPath+'/distance.py', options1.args, {
      env:{ 'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
      detached: true, 
      stdio:['pipe', 'pipe', 'pipe']
      //stdio: [ 'ignore', null, log ]
        });  // stdin, stdout, stderr    
       
        pcoa_process.stdout.on('data', function pcoaProcessStdout(data) { console.log('1stdout: ' + data);  });
        stderr1='';
        pcoa_process.stderr.on('data', function pcoaProcessStderr(data) {
                console.log('1stderr-POST: ' + data);
                stderr1 += data; 
                //res.send(stderr1); 
                //return;              
        });
        pcoa_process.on('close', function pcoaProcessOnClose(code1) {
                console.log('pcoa_process1 process exited with code ' + code1);
                
                if(code1 === 0){    // SUCCESS       
                    //console.log(options2.scriptPath+'/make_emperor.py '+options2.args.join(' '));
                    
                    //console.log(req.CONFIG.PATH)
                    //console.log(req.CONFIG.LD_LIBRARY_PATH)
                    //console.log(req.CONFIG.PYTHONPATH)
                    console.log(path.join(pwd,'logs','visualization.log'))
                    var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
                    //var emperor_process = spawn( options2.scriptPath+'/make_emperor.py', options2.args, {
                    var exec = require('child_process').exec;
                    cmd = options2.scriptPath+'/make_emperor_custom.py'
                    cmdline =  cmd+' '+options2.args.join(' ')
                    console.log(cmdline);
                    if(req.CONFIG.hostname.substring(0,6) == 'bpcweb'){
                      var env = {'PATH':req.CONFIG.PATH, 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH, 'LAPACK':req.CONFIG.LAPACK};
                    }else{
                      var env = process.env;
                    }
                    // var env = process.env, envDup = {};
                    // for (someVar in env) {
                    //     envDup[someVar] = env[someVar];
                    // }
                    child = exec(cmdline, {
                              //cwd: req.CONFIG.PATH_TO_VIZ_SCRIPTS,
                              env : env                            
                            }, function makeEmperorScriptExec(error, stdout, stderr) {

                      //console.log('stdout-POST: ' + stdout);

                      console.log('stderr-POST: ' + stderr);

                      if (error !== null) {

                        console.log('exec error-POST: ' + error);
                        var html = stderr
                        html += "<br>Principal Components File: <a href='/"+pc_file_name+"'>"+pc_file_name+"</a>";
                        html += "<br>Biom File: <a href='/"+biom_file_name+"'>"+biom_file_name+"</a>";
                        html += "<br>Mapping (metadata) File: <a href='/"+mapping_file_name+"'>"+mapping_file_name+"</a>";
                        html += "<br>Distance File: <a href='/"+dist_file_name+"'>"+dist_file_name+"</a>";
                        res.send(html); 
                        return; 

                      }else{
                       
                        var html = "** <a href='/tmp/"+dir_name+"/index' target='_blank'>Open Emperor</a> **"
                        html += "<br>Principal Components File: <a href='/"+pc_file_name+"'>"+pc_file_name+"</a>";
                        html += "<br>Biom File: <a href='/"+biom_file_name+"'>"+biom_file_name+"</a>";
                        html += "<br>Mapping (metadata) File: <a href='/"+mapping_file_name+"'>"+mapping_file_name+"</a>";
                        html += "<br>Distance File: <a href='/"+dist_file_name+"'>"+dist_file_name+"</a>";
                        //html += " <a href='../tmp/"+dir_name+"/index' target='_blank'>Emperor5</a>"

                        res.send(html); 
                        return;

                      }

                    });

                     
                }else{
                    //console.log('ERROR');
                    res.send('Python Script Error: '+stderr1);
                }      
        });   
        /////////////////////////////////////////////////



});
// GET is to create and open EMPEROR
router.get('/pcoa3d', helpers.isLoggedIn, function(req, res) {
        
  console.log('in 3D');
  console.log(visual_post_items);
  var ts = visual_post_items.ts;    
  var metric = visual_post_items.selected_distance;
  
  var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
  var biom_file_name = ts+'_count_matrix.biom';
  var biom_file = path.join(pwd,'tmp', biom_file_name);
  
  var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');

  var mapping_file_name = ts+'_metadata.txt';
  var mapping_file = path.join(pwd,'tmp', mapping_file_name);        
  var pc_file_name = ts+'.pc';
  var pc_file = path.join(pwd,'tmp', pc_file_name);
  
  var dir_name = ts+'_pcoa3d';
  var dir_path = path.join(pwd,'views/tmp', dir_name);        
  var html_path = path.join(dir_path, 'index.html');  // file to be created by make_emperor.py script
  //var html_path2 = path.join('../','tmp', dir_name, 'index.html');  // file to be created by make_emperor.py script
  var options1 = {
    scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
    args :       [ '-i', biom_file, '-metric', metric, '--function', 'pcoa_3d', '--outdir', path.join(pwd,'tmp'), '--prefix', ts],
  };
  var options2 = {
      //scriptPath : req.CONFIG.PATH_TO_QIIME_BIN,
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-i', pc_file, '-m', mapping_file, '-o', dir_path],
  };
  console.log('outdir: '+dir_path);
  console.log(options1.scriptPath+'/distance.py '+options1.args.join(' '));
  
  var pcoa_process = spawn( options1.scriptPath+'/distance.py', options1.args, {
      env:{ 'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
      detached: true, 
      stdio:['pipe', 'pipe', 'pipe']
      //stdio: [ 'ignore', null, log ]
        });  // stdin, stdout, stderr1    
       
        pcoa_process.stdout.on('data', function pcoaProcessStdout(data) { console.log('1stdout: ' + data);  });
        stderr1='';
        pcoa_process.stderr1.on('data', function pcoaProcessStderr(data) {
                console.log('1stderr-GET: ' + data);
                stderr1 += data;               
        });
        pcoa_process.on('close', function pcoaProcessOnClose(code1) {
                console.log('pcoa_process1 process exited with code ' + code1);
                
                if(code1 === 0){    // SUCCESS       
                    //console.log(options2.scriptPath+'/make_emperor.py '+options2.args.join(' '));
                    
                    //console.log(req.CONFIG.PATH)
                    //console.log(req.CONFIG.LD_LIBRARY_PATH)
                    //console.log(req.CONFIG.PYTHONPATH)
                    console.log(path.join(pwd,'logs','visualization.log'))
                    var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
                    //var emperor_process = spawn( options2.scriptPath+'/make_emperor.py', options2.args, {
                    var exec = require('child_process').exec;
                    cmd = options2.scriptPath+'/make_emperor_custom.py'
                    cmdline =  cmd+' '+options2.args.join(' ')
                    console.log(cmdline);
                    if(req.CONFIG.hostname.substring(0,6) == 'bpcweb'){
                      var env = {'PATH':req.CONFIG.PATH, 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH, 'LAPACK':req.CONFIG.LAPACK};
                    }else{
                      var env = process.env;
                    }
                    // var env = process.env, envDup = {};
                    // for (someVar in env) {
                    //     envDup[someVar] = env[someVar];
                    // }
                    child = exec(cmdline, {
                              //cwd: req.CONFIG.PATH_TO_VIZ_SCRIPTS,
                              env : env                            
                            }, function makeEmperorScriptExec(error, stdout, stderr) {

                      //console.log('stdout-GET: ' + stdout);

                      console.log('stderr-GET: ' + stderr);

                      if (error !== null) {

                        console.log('exec error-GET: ' + error);
                        

                      }else{
                        //res.sendFile('tmp/'+dir_name+'/index.html', {root:pwd});
                        //open('file://'+html_path);
                        //res.send("Done - <a href='https://github.com/biocore/emperor' target='_blank'>Emperor</a> will open a new window in your default browser."); 
                        //res.send("Done - <a href='/tmp/"+dir_name+"/index.html' target='_blank'>Emperor</a> will open a new window in your default browser."); 
                        //html = "<a href='../tmp/andy_1450362333240_pcoa3d/index' target='_blank'>Emperor1</a>"
                        html = " <a href='/tmp/"+dir_name+"/index' target='_blank'>Emperor</a>"
                        //html += " <a href='../tmp/"+dir_name+"/index' target='_blank'>Emperor5</a>"

                        res.send(html); 

                      }

                    });

                    // var emperor_process = exec( 'make_emperor.py', options2.args, {
                    //         env:{ 'PATH':req.CONFIG.PATH, 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH, 'PYTHONPATH':req.CONFIG.PYTHONPATH},
                    //         //detached: true, 
                    //         detached: false,
                    //         stdio:'pipe' // stdin, stdout, stderr
                    //         //stdio: [ 'ignore', log, log ]
                    // });  
                    
                    // emperor_process.stdout.on('data', function (data) { 
                    //   console.log('2stdout: ' + data);  
                    // });
                    // stderr2='';
                    // emperor_process.stderr.on('data', function (data) {
                    //         console.log('2stderr: ' + data);
                    //         stderr2 += data;                       
                    // });
                    // emperor_process.on('close', function (code2) {
                    //       console.log('emperor_process process exited with code ' + code2);
                          
                    //       if(code2 === 0){           
                              
                    //           console.log('opening file:///'+html_path);
                    //           //res.send();
                    //           res.sendFile('tmp/'+dir_name+'/index.html', {root:pwd});

                    //           //open('file://'+html_path);
                    //           //res.send(ok_form+"Done - <a href='https://github.com/biocore/emperor' target='_blank'>Emperor</a> will open a new window in your default browser."); 
                    //       }else{
                    //         // python script error
                    //         //console.log('make_emperor script error:' + errdata2);
                    //         res.send('make_emperor2 SCRIPT error '+stderr2);
                    //       }      
                    // });                      
                }else{
                    //console.log('ERROR');
                    res.send('Python Script Error: '+stderr1);
                }      
        });   
        

});

//
// DATA BROWSER 
//
router.get('/dbrowser', helpers.isLoggedIn, function(req, res) {
    var ts = visual_post_items.ts;
    console.log('in dbrowser');
    //console.log(JSON.stringify(BIOM_MATRIX,null,2));
    var html='';
    var max_total_count = Math.max.apply(null, BIOM_MATRIX.column_totals);
    //console.log('column_totals '+BIOM_MATRIX.column_totals);
    //console.log('max_total_count '+max_total_count.toString());

    // sum counts
    sumator = get_sumator(req);
 
    //console.log(JSON.stringify(sumator))
    
    for(var d in sumator['domain']){
        
      // #### DOMAIN ####
      //var dnode_name =  dname
      html += "<node name='"+d+"'>\n";
      html += " <seqcount>";
      for(var c_domain in sumator['domain'][d]['knt']){
          html += "<val>"+sumator['domain'][d]['knt'][c_domain].toString()+"</val>";
      }
        html += "</seqcount>\n";
        html += " <rank><val>domain</val></rank>\n";
        
        // #### PHYLUM ####
        for(p in sumator['domain'][d]['phylum']){              
          html += " <node name='"+p+"'>\n";
          html += "  <seqcount>";
          for(c_phylum in sumator['domain'][d]['phylum'][p]['knt']){
              html += "<val>"+sumator['domain'][d]['phylum'][p]['knt'][c_phylum].toString()+"</val>";
          }
            html += "</seqcount>\n";
            html += "  <rank><val>phylum</val></rank>\n";
///            
            // #### KLASS ####
            for(k in sumator['domain'][d]['phylum'][p]['klass']){                
                html += "  <node name='"+k+"'>\n";
                html += "   <seqcount>";
                for(c_klass in sumator['domain'][d]['phylum'][p]['klass'][k]['knt']){
                    html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][c_klass].toString()+"</val>";
                }
                html += "</seqcount>\n";
                html += "   <rank><val>klass</val></rank>\n";

                // #### ORDER ####
                for(o in sumator['domain'][d]['phylum'][p]['klass'][k]['order']){                    
                    html += "   <node name='"+o+"'>\n";
                    html += "    <seqcount>";
                    for(c_order in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt']){
                        html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][c_order].toString()+"</val>";
                    }
                    html += "</seqcount>\n";
                    html += "    <rank><val>order</val></rank>\n";

                    // #### FAMILY ####
                    for(f in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family']){                        
                        html += "    <node name='"+f+"'>\n";
                        html += "     <seqcount>";
                        for(c_family in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt']){
                            html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][c_family].toString()+"</val>";
                        }
                        html += "</seqcount>\n";
                        html += "     <rank><val>family</val></rank>\n";

                        // #### GENUS ####
                        for(g in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus']){                           
                            html += "     <node name='"+g+"'>\n";
                            html += "      <seqcount>";
                            for(c_genus in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt']){
                                html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][c_genus].toString()+"</val>";
                            }
                            html += "</seqcount>\n";
                            html += "      <rank><val>genus</val></rank>\n";

                            // #### SPECIES ####
                            for(s in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species']){                            
                                html += "     <node name='"+s+"'>\n";
                                html += "      <seqcount>";
                                for(c_species in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt']){
                                    html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][c_species].toString()+"</val>";
                                }
                                html += "</seqcount>\n";
                                html += "      <rank><val>species</val></rank>\n";
                                
                                // #### STRAIN ####
                                for(st in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']){                            
                                      html += "     <node name='"+st+"'>\n";
                                      html += "      <seqcount>";
                                      for(c_strain in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt']){
                                          html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][c_strain].toString()+"</val>";
                                      }
                                      html += "</seqcount>\n";
                                      html += "      <rank><val>strain</val></rank>\n";
 ///// DONE //////
                                      html += "     </node>\n";
                                }  // end strain

                                html += "     </node>\n";
                            }  // end species
       

                            html += "     </node>\n";
                        }  // end genus
                        html += "    </node>\n";
                    }  // end family
                    html += "   </node>\n";
                }  // end order
                html += "  </node>\n";
            }  // end klass
            html += " </node>\n";
        }  // end phylum
        html += "</node>\n";
    }    // end domain
    html += "  </node>\n";
    
    
    // write html to a file and open it 
    
    console.log("render visuals/dbrowser")
    //var file_name = ts+'_krona.html';
    //var html_path = path.join(process.env.PWD,'tmp', file_name);

    res.render('visuals/dbrowser', {        
      title: 'VAMPS:Taxonomy Browser (Krona)',
      message:             req.flash('message'),
      user:                req.user,
      html:                html,
      max_total_count:     max_total_count,
      matrix:              JSON.stringify(BIOM_MATRIX),
      chosen_id_name_hash: JSON.stringify(chosen_id_name_hash)            

    });

    
});
//
// OLIGOTYPING
//
router.post('/oligotyping', helpers.isLoggedIn, function(req, res) {
    var ts = visual_post_items.ts;
    console.log('in POST oligotyping');
    //console.log(JSON.stringify(BIOM_MATRIX,null,2));
    var html='';
    var max_total_count = Math.max.apply(null, BIOM_MATRIX.column_totals);
    //console.log('column_totals '+BIOM_MATRIX.column_totals);
    //console.log('max_total_count '+max_total_count.toString());

    
    // write html to a file and open it 
    
    console.log("render visuals/oligotyping")
    //var file_name = ts+'_krona.html';
    //var html_path = path.join(process.env.PWD,'tmp', file_name);

    res.render('visuals/oligotyping', {        
      title: 'VAMPS:Oligotyping',
      message:             req.flash('message'),
      html:                html,
      max_total_count:     max_total_count,
      matrix:              JSON.stringify(BIOM_MATRIX),
      chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
      user :  req.user, hostname : req.CONFIG.hostname,          

    });

    
});

//
//
//
router.post('/alpha_diversity', helpers.isLoggedIn, function(req, res) {
    console.log('in alpha div')
    var ts = req.body.ts;
    var metric = req.body.metric;
    var biom_file_name = ts+'_count_matrix.biom';
    var biom_file = path.join(process.env.PWD,'tmp', biom_file_name);
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    
    var html = '';
    var title = 'VAMPS';
    console.log(biom_file)
    //var distmtx_file_name = ts+'_distance.csv';
    //var distmtx_file = path.join(process.env.PWD,'tmp',distmtx_file_name);
   
    var options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-in', biom_file, '--site_base', process.env.PWD, '--prefix', ts],
    };

   
    var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
    // script will remove data from mysql and datset taxfile
    console.log(options.scriptPath+'alpha_diversity.py '+options.args.join(' '));
    var alphadiv_process = spawn( options.scriptPath+'/alpha_diversity.py', options.args, {
                env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
                detached: true, 
                //stdio:['pipe', 'pipe', log]
                //stdio:  log 
                stdio: 'pipe'  // stdin, stdout, stderr
            }); 
    
    stdout = '';
    alphadiv_process.stdout.on('data', function adiversityProcessStdout(data) {
        data = data.toString();
        console.log(data)
        stdout += data;    
     
    });
    stderr = '';
    alphadiv_process.stderr.on('data', function adiversityProcessStderr(data) {
        data = data.toString();
        console.log(data)
        stderr += data;    
     
    });
    alphadiv_process.on('close', function adiversityProcessOnClose(code) {
        console.log('alphadiv_process process exited with code ' + code);
        if(code == 0){           
            res.send(stdout);                                 
        }else{
          console.log('python script error: '+stderr);
          res.send(stderr); 
        }      
    });   


});
//
//
//
router.post('/phyloseq', helpers.isLoggedIn, function(req, res) {
    console.log('in phyloseq post')
    //console.log(req.body)

    var ts = req.body.ts;
    var rando = Math.floor((Math.random() * 100000) + 1);  // required to prevent image caching
    var dist_metric = req.body.metric;
    var plot_type = req.body.plot_type;
    var image_file = ts+'_phyloseq_'+plot_type+'_'+rando.toString()+'.svg';
    var phy,md1,md2,ordtype,maxdist,script
    
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    var fill = visual_post_items.tax_depth.charAt(0).toUpperCase() + visual_post_items.tax_depth.slice(1);
    if(fill === 'Klass'){
        fill = 'Class';
    }
    var tmp_path = path.join(process.env.PWD,'tmp');
    var html = '';
    //console.log(biom_file)
    var options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ tmp_path, ts ],
    };
    if(plot_type == 'bar'){
      script = 'phyloseq_bar.R';
      phy = req.body.phy;
      options.args = options.args.concat([image_file, phy, fill]);
    }else if(plot_type == 'heatmap'){
      script = 'phyloseq_heatmap.R';
      //image_file = ts+'_phyloseq_'+plot_type+'_'+rando.toString()+'.png';
      phy = req.body.phy;
      md1 = req.body.md1;
      ordtype = req.body.ordtype;
      options.args = options.args.concat([image_file, dist_metric, phy, md1, ordtype, fill]);
    }else if(plot_type == 'network'){
      script = 'phyloseq_network.R';
      md1 = req.body.md1 || "Project";
      md2 = req.body.md2 || "Description";
      maxdist = req.body.maxdist || "0.3";
      options.args = options.args.concat([image_file, dist_metric, md1, md2, maxdist]);
    }else if(plot_type == 'ord'){
      script = 'phyloseq_ord.R';
      md1 = req.body.md1 || "Project";
      md2 = req.body.md2 || "Description";
      ordtype = req.body.ordtype || "PCoA";
      options.args = options.args.concat([image_file, dist_metric, md1, md2, ordtype]);
    }else if(plot_type == 'tree'){
      script = 'phyloseq_tree.R';
      md1 = req.body.md1 || "Description";
      options.args = options.args.concat([image_file, dist_metric, md1]);
    }else{
      //ERROR
    }
    var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
    
    console.log(options.scriptPath+script+' '+options.args.join(' '));
    var phyloseq_process = spawn( options.scriptPath+script, options.args, {
            env:{'PATH':req.CONFIG.PATH},
            detached: true, 
            //stdio: [ 'ignore', null, log ]
            stdio: 'pipe'  // stdin, stdout, stderr
    }); 
    stdout = '';
    lastline='';
    phyloseq_process.stdout.on('data', function phyloseqProcessStdout(data) {
        lastline = data;
        stdout += data;      
    });
    stderr = '';
    phyloseq_process.stderr.on('data', function phyloseqProcessStderr(data) {
        stderr += data;      
    }); 
    phyloseq_process.on('close', function phyloseqProcessOnClose(code) {
          console.log('phyloseq_process process exited with code ' + code);
          //distance_matrix = JSON.parse(output);
          //var last_line = ary[ary.length - 1];
          if(code === 0){   // SUCCESS
            console.log('last: '+lastline);
            if(lastline.toString().substring(0,5) == 'ERROR'){
                    console.log('ERROR-1'); 
                    html = lastline;                   
            }else{                  
                
              //   var image = '/'+ts+'_heatmap.pdf';
              // //console.log(image)
              // html = "<div id='pdf'>";
              // html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='100%' height='700' />";
              // html += " <p>ERROR in loading pdf file</p>";
              // html += "</object></div>";
              // res.send(html);

              // return;

                 
                 if(plot_type == 'heatmap'){   // for some unknown reason heatmaps are different: use pdf not svg
                 //html = "<object  data='/"+image_file+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf'width='100%' height='700' >Your browser does not support SVG</object>";
                      html = "<div id='pdf'>";
                      html += "<object data='/"+image_file+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='100%' height='700' />";
                      html += " <p>ERROR in loading pdf file</p>";
                      html += "</object></div>"; 
                 }else{
                      html = "<img src='/"+image_file+"'  >";                    
                }              
            }

          }else{
            console.log('ERROR-2');            
            html = "Phyloseq Error: Try selecting more data, deeper taxonomy or excluding 'NA's"
          } 
          console.log(html);
          res.send(html);

    });   

});

//
//  for alpha diversity
//
function get_sumator(req){
    
    var sumator = {};
    sumator['domain']={};
    var did = chosen_id_name_hash.ids[i];
    var dname = chosen_id_name_hash.names[i];
    
    for(r in BIOM_MATRIX.rows){
        tax_string = BIOM_MATRIX.rows[r].id;
        tax_items = tax_string.split(';');
        key = tax_items[0];
        //console.log(tax_items);
        for(t in tax_items){
           var taxa = tax_items[t];
           var rank = req.CONSTS.RANKS[t];
           if(rank=='domain'){
               d = tax_items[t]
               for(i in chosen_id_name_hash.ids){
                   if(d in sumator['domain']){
                       if(i in sumator['domain'][d]['knt']){
                           sumator['domain'][d]['knt'][i] += parseInt(BIOM_MATRIX.data[r][i]); 
                       }else{
                           sumator['domain'][d]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]); 
                       } 
                   }else{
                       sumator['domain'][d]={};
                       sumator['domain'][d]['phylum']={}
                       sumator['domain'][d]['knt']=[] 
                       sumator['domain'][d]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]);  
                   }
               }
           }
           if(rank=='phylum'){
               p = tax_items[t]
               for(i in chosen_id_name_hash.ids){
                   if(p in sumator['domain'][d]['phylum']){
                       if(i in sumator['domain'][d]['phylum'][p]['knt']){
                           sumator['domain'][d]['phylum'][p]['knt'][i] += parseInt(BIOM_MATRIX.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]={};
                       sumator['domain'][d]['phylum'][p]['klass']={};
                       sumator['domain'][d]['phylum'][p]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]); 
                   }
               }
           }
           if(rank=='klass'){
               k = tax_items[t]
               for(i in chosen_id_name_hash.ids){
                   if(k in sumator['domain'][d]['phylum'][p]['klass']){
                       if(i in sumator['domain'][d]['phylum'][p]['klass'][k]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][i] += parseInt(BIOM_MATRIX.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]['klass'][k]={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]); 
                   }
               }
           }
           if(rank=='order'){
               o = tax_items[t]
               for(i in chosen_id_name_hash.ids){
                   if(o in sumator['domain'][d]['phylum'][p]['klass'][k]['order']){
                       if(i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][i] += parseInt(BIOM_MATRIX.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]); 
                   }
               }
           }
           if(rank=='family'){
               f = tax_items[t]
               for(i in chosen_id_name_hash.ids){
                   if(f in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family']){
                       if(i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][i] += parseInt(BIOM_MATRIX.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]); 
                   }
               }
           }
           if(rank=='genus'){
               g = tax_items[t]
               for(i in chosen_id_name_hash.ids){                   
                   if(g in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus']){
                       if(i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][i] += parseInt(BIOM_MATRIX.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]); 
                   }
               }
           }

           if(rank=='species'){
               s = tax_items[t]
               for(i in chosen_id_name_hash.ids){                   
                   if(s in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species']){
                       if(i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][i] += parseInt(BIOM_MATRIX.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]={};

                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]); 
                   }
               }
           }
           if(rank=='strain'){
               st = tax_items[t]
               for(i in chosen_id_name_hash.ids){                   
                   if(st in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']){
                       if(i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][i] += parseInt(BIOM_MATRIX.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]={};
                       //sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][i] = parseInt(BIOM_MATRIX.data[r][i]); 
                   }
               }
           }


        }
    }
    return sumator;
}



//
//  G E O S P A T I A L (see view_selection.js)
//


//
// B A R - C H A R T  -- S I N G L E
//
router.get('/bar_single', helpers.isLoggedIn, function(req, res) {
    console.log('in bar_single')
    var myurl = url.parse(req.url, true);
    //console.log('in piechart_single'+myurl)
    //var ts = myurl.query.ts;
    var pjds = myurl.query.id;
    var order = myurl.query.order; // min, max alphaUp, alphaDown
    var ds_items = pjds.split('--');

    //var html  = COMMON.start_visuals_html('piechart');
    //var html  = 'My HTML';
    var selected_did = chosen_id_name_hash.ids[chosen_id_name_hash.names.indexOf(pjds)]
    var new_matrix={}
    new_matrix.rows = BIOM_MATRIX.rows;
    new_matrix.columns =[];
    new_matrix.dataset = pjds;
    //new_matrix.dids = [chosen_id_name_hash.ids[chosen_id_name_hash.names.indexOf(pjds)]];
    new_matrix.data = []
    new_matrix.total = 0
    new_matrix.shape = [BIOM_MATRIX.shape[0],1]
    var idx = -1;

    for(d in BIOM_MATRIX.columns){
      if(BIOM_MATRIX.columns[d].id == pjds){
      	//console.log('found idx '+BIOM_MATRIX.columns[d].name)
      	idx = d;
      	new_matrix.columns.push(BIOM_MATRIX.columns[d]);
      	//new_matrix.columns.push({"name":ds_name,"did":did});
      	break;
      }
    }

    for(n in BIOM_MATRIX.data){
      new_matrix.data.push([BIOM_MATRIX.data[n][d]])
      new_matrix.total += BIOM_MATRIX.data[n][d]
    }
    //console.log(JSON.stringify(new_matrix))
    new_matrix = helpers.sort_json_matrix(new_matrix,order)
    
    
    //console.log(JSON.stringify(new_matrix))
    var timestamp = +new Date();  // millisecs since the epoch!  
    var filename = req.user.username+'_'+selected_did+'_'+timestamp+'_sequences.json'
    var file_path = path.join('tmp',filename);
    //console.log(file_path)
    new_rows = {}
    new_rows[selected_did] = []
    connection.query(QUERY.get_sequences_perDID([selected_did]), function mysqlSelectSeqsPerDID(err, rows, fields){
        if (err)  {
          console.log('Query error: ' + err);
          console.log(err.stack);
          res.send(err)
        } else {
          //console.log(rows)
          for(s in rows){
              //rows[s].seq = rows[s].seq.toString('utf8')
              did = rows[s].dataset_id
              
              var seq = rows[s].seq.toString('utf8');
              var seq_cnt = rows[s].seq_count;
              var gast = rows[s].gast_distance
              var classifier = rows[s].classifier
              var d_id = rows[s].domain_id
              var p_id = rows[s].phylum_id
              var k_id = rows[s].klass_id
              var o_id = rows[s].order_id
              var f_id = rows[s].family_id
              var g_id
              if(rows[s].hasOwnProperty("genus_id")){
                if(rows[s].genus_id == 'undefined'){
                    g_id = 'genus_NA'
                }else{
                    g_id = rows[s].genus_id
                }
                
              }else{
                g_id = ''
              }
              
              if(rows[s].hasOwnProperty("species_id")){
                var sp_id = rows[s].species_id
              }else{
                var sp_id = ''
              }
              var st_id = rows[s].strain_id
              new_rows[did].push({seq:seq,seq_count:seq_cnt,gast_distance:gast,classifier:classifier,domain_id:d_id,phylum_id:p_id,klass_id:k_id,order_id:o_id,family_id:f_id,genus_id:g_id,species_id:sp_id,strain_id:st_id})

          }
          // order by seq_count DESC
          new_rows[selected_did].sort(function sortByCount(a, b) {
            return b.seq_count - a.seq_count;
          });
          //fs.writeFile(file_path, JSON.stringify(new_rows[selected_did]), function (err) {
          //  if (err) return console.log(err);
          //  console.log('wrote to > '+file_path);
          //});
          fs.writeFileSync(file_path, JSON.stringify(new_rows[selected_did]))
          res.render('visuals/user_viz_data/bar_single', {
              title: 'Taxonomic Data',
              ts: timestamp,
              matrix    :           JSON.stringify(new_matrix),
              post_items:           JSON.stringify(visual_post_items),
              seqs_file : filename,
              bar_type  : 'single',
              //html: html,
              user: req.user, hostname: req.CONFIG.hostname,
          });

        }
    })
  	


});


//
// B A R - C H A R T  -- D O U B L E
//

router.get('/bar_double', helpers.isLoggedIn, function(req, res) {
  
    console.log('in bar_double-2')

    var myurl = url.parse(req.url, true);
    console.log(myurl.query)
    var did1 = myurl.query.did1;
    var did2 = myurl.query.did2;
    var dist = myurl.query.dist;
    //var ts   = myurl.query.ts;
    var order = myurl.query.order; // min, max alphaUp, alphaDown
    var ds1  = chosen_id_name_hash.names[chosen_id_name_hash.ids.indexOf(did1)]
    var ds2  = chosen_id_name_hash.names[chosen_id_name_hash.ids.indexOf(did2)]
    //var ds_items = pjds.split('--');
    
    
    //var html  = 'My HTML';
    
    var new_matrix={}
    new_matrix.rows = BIOM_MATRIX.rows;   // taxonomy
    new_matrix.columns =[];
    new_matrix.datasets = [ds1,ds2];
    //new_matrix.dids = [did1,did2];
    
    new_matrix.data = []
    for(n in BIOM_MATRIX.rows){
      new_matrix.data.push([])
    }
    new_matrix.column_totals = [0,0]
    //console.log('3')
    new_matrix.shape = [BIOM_MATRIX.shape[0],2]
    var idx1 = -1;
    var idx2 = -1;
    //console.log('4')
    // datasets
    for(d in BIOM_MATRIX.columns){
      if(BIOM_MATRIX.columns[d].id == ds1){
        idx1 = d;
        //new_matrix.columns.push(BIOM_MATRIX.columns[d]);        
      }
      if(BIOM_MATRIX.columns[d].id == ds2){
        idx2 = d;
        //new_matrix.columns.push(BIOM_MATRIX.columns[d]);        
      }
    }
    new_matrix.columns.push(BIOM_MATRIX.columns[idx1]);
    new_matrix.columns.push(BIOM_MATRIX.columns[idx2]);    
    //console.log('5')
    for(n in BIOM_MATRIX.rows){ // one item for each of two columns (datasets)
      new_matrix.data[n].push(BIOM_MATRIX.data[n][idx1])
      new_matrix.data[n].push(BIOM_MATRIX.data[n][idx2])
      
    }
    for(n in BIOM_MATRIX.data){ // one item for each column
      
      new_matrix.column_totals[0] += BIOM_MATRIX.data[n][idx1]
      //new_matrix.data[1].push(BIOM_MATRIX.data[n][idx2])
      new_matrix.column_totals[1] += BIOM_MATRIX.data[n][idx2]
    }




    //DOUBLE
    //console.log(JSON.stringify(new_matrix))
    new_matrix = helpers.sort_json_matrix(new_matrix,order)
   
    //console.log(JSON.stringify(new_matrix))

    //console.log(JSON.stringify(new_matrix))
    //console.log(chosen_id_name_hash)
    //open('views/visuals/user_viz_data/bar_double.html');
    var timestamp = +new Date();  // millisecs since the epoch!  
    console.log('TS HM File',timestamp)
    var filename1 = req.user.username+'_'+did1+'_'+timestamp+'_sequences.json'
    var file_path1 = path.join('tmp',filename1);
    var filename2 = req.user.username+'_'+did2+'_'+timestamp+'_sequences.json'
    var file_path2 = path.join('tmp',filename2);
    //console.log(file_path)
    new_rows = {}
    new_rows[did1] = []
    new_rows[did2] = []
    //console.log(new_rows)
    connection.query(QUERY.get_sequences_perDID(did1+"','"+did2), function mysqlSelectSeqsPerDID(err, rows, fields){
        if (err)  {
          console.log('Query error: ' + err);
          console.log(err.stack);
          res.send(err)
        } else {
          //console.log(rows)
          // should write to a file? Or res.render here?

          for(s in rows){
              did = rows[s].dataset_id
              
              //console.log(did)
              //rows[s].seq = rows[s].seq.toString('utf8')
              var seq = rows[s].seq.toString('utf8');
              var seq_cnt = rows[s].seq_count;
              var gast = rows[s].gast_distance
              var classifier = rows[s].classifier
              var d_id = rows[s].domain_id
              var p_id = rows[s].phylum_id
              var k_id = rows[s].klass_id
              var o_id = rows[s].order_id
              var f_id = rows[s].family_id
              var g_id = rows[s].genus_id
              var sp_id = rows[s].species_id
              var st_id = rows[s].strain_id
              new_rows[did].push({seq:seq,seq_count:seq_cnt,gast_distance:gast,classifier:classifier,domain_id:d_id,phylum_id:p_id,klass_id:k_id,order_id:o_id,family_id:f_id,genus_id:g_id,species_id:sp_id,strain_id:st_id})
              //new_rows[did].seq = rows[s].seq.toString('utf8')
          }
          // order by seq_count DESC
          //console.log(new_rows)
          new_rows[did1].sort(function sortByCount(a, b) {
                  return b.seq_count - a.seq_count;
          });
          new_rows[did2].sort(function sortByCount(a, b) {
                  return b.seq_count - a.seq_count;
          });

          fs.writeFile(file_path1, JSON.stringify(new_rows[did1]), function writeFile(err) {
            if (err) return console.log(err);
            console.log('wrote file > '+file_path1);

         
            fs.writeFile(file_path2, JSON.stringify(new_rows[did2]), function writeFile(err) {
              if (err) return console.log(err);
              console.log('wrote file > '+file_path2);
              
//open('/visuals/user_viz_data/bar_double?did1=<%= id_order[x] %>&did2=<%= id_order[y] %>&ts=<%= ts %>&dist=<%= dist %>', '_blank')"
//open('/visuals/user_viz_data/bar_double?did1=', '_blank')
              res.render('visuals/user_viz_data/bar_double', {
                  title: 'Taxonomic Data',
                  ts: timestamp,
                  matrix    :           JSON.stringify(new_matrix),
                  post_items:           JSON.stringify(visual_post_items),
                  bar_type  : 'double', 
                  dist     : dist,       
                  //html: html,
                  user: req.user, hostname: req.CONFIG.hostname,
              });
            });

          });

        }
    })
    //console.log(new_matrix)
    // res.render('visuals/user_viz_data/bar_double', {
    //     title: 'Taxonomic Data',
    //     ts: timestamp,
    //     matrix    :           JSON.stringify(new_matrix),
    //     post_items:           JSON.stringify(visual_post_items),
    //     bar_type  : 'double',        
    //     //html: html,
    //     user: req.user, hostname: req.CONFIG.hostname,
    // });

});
//
//  S E Q U E N C E S
//
router.get('/sequences/', helpers.isLoggedIn, function(req, res) {
	console.log('in sequences')
	var myurl = url.parse(req.url, true);
	var search_tax = myurl.query.taxa;
  var seqs_filename = myurl.query.filename;
    
	var pjds = myurl.query.id;
    var seq_list = [];
    var d,p,k,o,f,g,sp,st;
    var selected_did = chosen_id_name_hash.ids[chosen_id_name_hash.names.indexOf(pjds)];
	if(seqs_filename){
    //console.log('found filename',seqs_filename)
    
    fs.readFile(path.join('tmp',seqs_filename), 'utf8', function readFile(err,data) {
      if (err) {
        console.log(err);
        res.send('No file found: '+seqs_filename+"; Use the browsers 'Back' button and try again")
      }
      //console.log('parsing data')
      try{
        var clean_data = JSON.parse(data)
      }catch(e){
        console.log(e);
        res.render('visuals/user_viz_data/sequences', {
                    title: 'Sequences',
                    ds : pjds,
                    tax : search_tax,
                    fname : seqs_filename,
                    seq_list : 'Error Retrieving Sequences',
                    user: req.user, hostname: req.CONFIG.hostname,
        });
        return
      }
      
      for(i in clean_data){
        
          seq_tax = ''
          var data = clean_data[i]
          
          d  = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.domain_id+"_domain"].taxon;
          
          try{
                p  = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.phylum_id+"_phylum"].taxon;
          }catch(e){
                p = 'phylum_NA'
          }
          try{
                k  = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.klass_id+"_klass"].taxon;
          }catch(e){
                k = 'class_NA'
          }
          try{
                o  = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.order_id+"_order"].taxon;
          }catch(e){
                o = 'order_NA'
          }
          try{
                f  = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.family_id+"_family"].taxon;
          }catch(e){
                f = 'family_NA'
          }
          try{
                g  = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.genus_id+"_genus"].taxon;
          }catch(e){
                g = 'genus_NA'
          }
          try{
                sp = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.species_id+"_species"].taxon;
          }
          catch(e){
                sp = 'species_NA'
          }
          try{
                st = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.strain_id+"_strain"].taxon;
          }
          catch(e){
                st = 'strain_NA'
          }
          seq_tax = d+';'+p+';'+k+';'+o+';'+f+';'+g+';'+sp+';'+st;
          if(seq_tax.substring(0, search_tax.length) === search_tax){ 
            seq_list.push({prettyseq:helpers.make_color_seq(data.seq), seq:data.seq, seq_count:data.seq_count, gast_distance:data.gast_distance, classifier:data.classifier, tax:seq_tax});          
          }
      }
      
      res.render('visuals/user_viz_data/sequences', {
                    title: 'Sequences',
                    ds : pjds,
                    tax : search_tax,
                    fname : seqs_filename,
                    seq_list : JSON.stringify(seq_list),
                    user: req.user, hostname: req.CONFIG.hostname,
      });
    });
  }else{
      res.render('visuals/user_viz_data/sequences', {
                    title: 'Sequences',
                    ds : pjds,
                    tax : search_tax,
                    fname : '',
                    seq_list : 'Error Retrieving Sequences',
                    user: req.user, hostname: req.CONFIG.hostname,
        });
        return
  }
	
	//   });
	
});

/*
*   PARTIALS
*      These six partials all belong to the unit_selection page
*      and are shown via ajax depending on user selection in combo box
*       on that page.  AAV
*/
router.get('/partials/tax_silva119_simple', helpers.isLoggedIn,  function(req, res) {
    res.render('visuals/partials/tax_silva119_simple', {
        doms: req.CONSTS.DOMAINS
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
router.get('/partials/load_metadata', helpers.isLoggedIn,  function(req, res) {
  var myurl = url.parse(req.url, true);
  var load = myurl.query.load  || 'all';   // either 'all' or 'selected'
  res.render('visuals/partials/load_metadata',
    { title   : 'metadata_table',
      load    : load
    });
});
//
//
//
router.get('/partials/tax_silva119_custom', helpers.isLoggedIn,  function(req, res) {
  res.render('visuals/partials/tax_silva119_custom',  { title   : 'Silva(v119) Custom Taxonomy Selection'});
});
router.get('/partials/tax_rdp2.6_simple', helpers.isLoggedIn,  function(req, res) {
    res.render("visuals/partials/tax_rdp26_simple", {
        doms: req.CONSTS.DOMAINS
    });
});
router.get('/partials/tax_gg_custom', helpers.isLoggedIn,  function(req, res) {
    res.render('visuals/partials/tax_gg_custom',{});
});
router.get('/partials/tax_gg_simple', helpers.isLoggedIn,  function(req, res) {
    res.render('visuals/partials/tax_gg_simple',{});
});
router.get('/partials/otus', helpers.isLoggedIn,  function(req, res) {
    res.render('visuals/partials/otus',{});
});
router.get('/partials/med_nodes', helpers.isLoggedIn,  function(req, res) {
    res.render('visuals/partials/med_nodes',{});
});
//
// SAVE CONFIG
//
router.post('/save_config', helpers.isLoggedIn,  function(req, res) {

  console.log('req.body: save_config-->>');
  console.log(req.body);
  console.log('req.body: save_config');
  var timestamp = +new Date();  // millisecs since the epoch!  
  var filename = 'configuration-' + timestamp + '.json';
  // datasets/metadata...
  // metadata = META.write_mapping_file(chosen_id_name_hash, visual_post_items);
  //console.log(METADATA)
  //console.log(chosen_id_name_hash)
  var json_obj = {}
  json_obj.source = 'VAMPS';
  json_obj.post_items = visual_post_items
  json_obj.id_name_hash = chosen_id_name_hash

  console.log(json_obj)

  var filename_path = path.join(req.CONFIG.USER_FILES_BASE,req.user.username,filename);
  helpers.mkdirSync(path.join(req.CONFIG.USER_FILES_BASE));  // create dir if not present
  helpers.mkdirSync(path.join(req.CONFIG.USER_FILES_BASE,req.user.username)); // create dir if not present
  //console.log(filename);
  helpers.write_to_file(filename_path, JSON.stringify(json_obj));
    
  res.send("Saved as: <a href='saved_elements'>"+filename+"</a>");
  
  
});
//
//
//

// router.get('/saved_states', helpers.isLoggedIn,  function(req, res) {
//     console.log('in show_saved_configs');
//     if(req.user.username == 'guest'){
//       req.flash('message', "The 'guest' user has no saved configs");
//       res.redirect('/user_data/your_data');
//     }else{
//       //console.log('req.body: show_saved_datasets-->>');
//       //console.log(req.body);
//       //console.log('req.body: show_saved_datasets');
//       var saved_configs_dir = path.join(req.CONFIG.USER_FILES_BASE,req.user.username);

//       file_info = {};
//       modify_times = [];
//       helpers.mkdirSync(saved_configs_dir);
//       fs.readdir(saved_configs_dir, function(err, files){
//           if(err){
            
//             msg = 'ERROR Message '+err;
//             helpers.render_error_page(req,res,msg);
          
          
//           }else{
//             for (var f in files){
//                 var pts = files[f].split('-');
//                 if(pts[0] === 'configuration'){
//                   //file_info.files.push(files[f]);
//                   stat = fs.statSync(path.join(saved_configs_dir,files[f]));
//                    file_info[stat.mtime.getTime()] = { 'filename':files[f], 'size':stat.size, 'mtime':stat.mtime }
//                    modify_times.push(stat.mtime.getTime());
              
//                 }
//             }   
//             modify_times.sort().reverse();
//             //console.log(JSON.stringify(file_info));
//           } 
          
//           res.render('visuals/saved_states',
//               { title: 'saved_configs',
               
//                 finfo: JSON.stringify(file_info),
//                 times: modify_times,
//                 message: req.flash('message'),
//                 user: req.user, hostname: req.CONFIG.hostname,
//           });     
  
//       });
//     }
  
// });
router.post('/save_datasets', helpers.isLoggedIn,  function(req, res) {

  console.log('req.body: save_datasets-->>');
  console.log(req.body);
  console.log('req.body: save_datasets');
	
	var filename_path = path.join(req.CONFIG.USER_FILES_BASE,req.user.username,req.body.filename);
	helpers.mkdirSync(path.join(req.CONFIG.USER_FILES_BASE));  // create dir if not present
	helpers.mkdirSync(path.join(req.CONFIG.USER_FILES_BASE,req.user.username)); // create dir if not present
	//console.log(filename);
	helpers.write_to_file(filename_path,req.body.datasets);
		
	res.send('OK');
  
	
});
//
//
//
router.get('/saved_elements', helpers.isLoggedIn,  function(req, res) {
    console.log('in show_saved_datasets');
    if(req.user.username == 'guest'){
      req.flash('message', "The 'guest' user has no saved datasets");
      res.redirect('/user_data/your_data');
    }else{
      //console.log('req.body: show_saved_datasets-->>');
      //console.log(req.body);
      //console.log('req.body: show_saved_datasets');
      var acceptable_prefixes = ['datasets', 'configuration', 'image']
      var saved_elements_dir = path.join(req.CONFIG.USER_FILES_BASE,req.user.username);

      var file_info = {};
      var modify_times = [];
      helpers.mkdirSync(saved_elements_dir);
      fs.readdir(saved_elements_dir, function(err, files){
          if(err){
      			
    				var msg = 'ERROR Message '+err;
    				helpers.render_error_page(req,res,msg);
    			
    			
    		  }else{
      		  for (var f in files){
      	        var pts = files[f].split('-');
      	        if(acceptable_prefixes.indexOf(pts[0]) != -1 ){
      	          //file_info.files.push(files[f]);
      	          stat = fs.statSync(path.join(saved_elements_dir,files[f]));
      			       file_info[stat.mtime.getTime()] = { 'filename':files[f], 'size':stat.size, 'mtime':stat.mtime.toString() }
      			       modify_times.push(stat.mtime.getTime());
      			  
      	        }
      	    }	  
      		  modify_times.sort().reverse();
      		  //console.log(JSON.stringify(file_info));
      		} 
    		  
      		res.render('visuals/saved_elements',
      		    { title: 'saved_elements',
      		     
      		      finfo: JSON.stringify(file_info),
      		      times: modify_times,
      		  	  message: req.flash('message'),
      		      user: req.user, hostname: req.CONFIG.hostname,
      		}); 		
	
      });
    }
	
});
//
//  R E S E T
//
router.post('/reset_ds_order', helpers.isLoggedIn,  function(req, res) {
	console.log('in reset_ds_order')
  var html = '';
  html += "<table id='drag_table' class='table table-condensed' >"
  html += "<thead></thead>";
  html += "  <tbody>";
  for (var i in chosen_id_name_hash.names){
         html += "<tr class='tooltip_row'>";
         html += "<td class='dragHandle' id='"+chosen_id_name_hash.ids[i]+"--"+chosen_id_name_hash.names[i]+"'> ";
		     html += "<input type='hidden' name='ds_order[]' value='"+chosen_id_name_hash.ids[i]+"'>";
         html += (parseInt(i)+1).toString()+" (id:"+ chosen_id_name_hash.ids[i]+") - "+chosen_id_name_hash.names[i];
         html += "</td>";
         html += "   <td>";
         html += "       <a href='#' onclick='move_to_the_top("+(parseInt(i)+1).toString()+",\""+chosen_id_name_hash.ids[i]+"--"+chosen_id_name_hash.names[i]+"\")'>^</a>";
         html += "   </td>";
         html += "</tr>";
  } 
  html += "</tbody>";   
  html += "</table>";	
	res.send(html)
});
//
// A L P H A - B E T I Z E
//
router.post('/alphabetize_ds_order', helpers.isLoggedIn,  function(req, res) {
	console.log('in alphabetize_ds_order')
	var html = '';
  html += "<table id='drag_table' class='table table-condensed' >"
  html += "<thead></thead>";
  html += "  <tbody>";
  var names = chosen_id_name_hash.names.slice()  // slice make an independant copy of the array
	var ids = chosen_id_name_hash.ids.slice()      // rather than copy reference
	
  names.sort()
	for (var i in names){
		     id = ids[chosen_id_name_hash.names.indexOf(names[i])]
		     html += "<tr class='tooltip_row'>";
         html += "<td class='dragHandle' id='"+ id +"--"+names[i]+"'> ";
		     html += "<input type='hidden' name='ds_order[]' value='"+ id +"'>";
         html += (parseInt(i)+1).toString()+" (id:"+ id +") - "+names[i];
         html += "</td>";
         html += "   <td>";
         html += "       <a href='#' onclick='move_to_the_top("+(parseInt(i)+1).toString()+",\""+id +"--"+names[i]+"\")'>^</a>";
         html += "   </td>";
         html += "</tr>";
  }  
  html += "</tbody>";  
  html += "</table>";	
	res.send(html)
});
//
// R E V E R S E  O R D E R
//
router.post('/reverse_ds_order', helpers.isLoggedIn,  function(req, res) {
  console.log('in reverse_ds_order')
  var ids = JSON.parse(req.body.ids);
  var html = '';
  html += "<table id='drag_table' class='table table-condensed' >"
  html += "<thead></thead>";
  html += "  <tbody>";
  var names = chosen_id_name_hash.names.slice()  // slice make an independant copy of the array
  ids.reverse()
  //console.log(ids)
  for (var i in ids){
         name = names[chosen_id_name_hash.ids.indexOf(ids[i])]
         html += "<tr class='tooltip_row'>";
         html += "<td class='dragHandle' id='"+ ids[i] +"--"+name+"'> ";
         html += "<input type='hidden' name='ds_order[]' value='"+ ids[i] +"'>";
         html += (parseInt(i)+1).toString()+" (id:"+ ids[i] +") - "+name;
         html += "</td>";
         html += "   <td>";
         html += "       <a href='#' onclick='move_to_the_top("+(parseInt(i)+1).toString()+",\""+ids[i] +"--"+name+"\")'>^</a>";
         html += "   </td>";
         html += "</tr>";
  }  
  html += "</tbody>";  
  html += "</table>"; 
  res.send(html)
});
//
//  C L U S T E R  D A T A S E T  O R D E R
//
router.post('/cluster_ds_order', helpers.isLoggedIn,  function(req, res) {
    console.log('in cluster_ds_order')
    var html = '';
    var ts = req.body.ts;
    var metric = req.body.metric;
    var biom_file_name = ts+'_count_matrix.biom';
    var biom_file = path.join(process.env.PWD,'tmp',biom_file_name);
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    console.log(req.body)
    var options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'cluster_datasets', '--outdir', path.join(pwd,'tmp'), '--prefix', ts],
    };
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
    
    var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
    
    
    var cluster_process = spawn( options.scriptPath+'/distance.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true, 
            stdio: [ 'ignore', null, log ]
        });  // stdin, stdout, stderr
    
    
    //var heatmap_process = spawn( 'which' , ['python'], {env:{'PATH':envpath}});
    var output = '';
    cluster_process.stdout.on('data', function clusterProcessStdout(data) {
        //console.log('stdout: ' + data);
      // //data = data.toString().replace(/^\s+|\s+$/g, '');
      // data = data.toString();

       output = data.toString();
    });
       
    cluster_process.on('close', function clusterProcessOnClose(code) {
      console.log('ds cluster process exited with code ' + code);
      var lines = output.split(/\n/)
      
      for(i in lines){
        
        if(lines[i].substring(0,7) == 'DS_LIST'){
          tmp = lines[i].split('=')
          var ds_list = tmp[1]
          continue
        }
      }
      
      console.log('dsl',ds_list)
      //var last_line = ary[ary.length - 1];
      if(code === 0){   // SUCCESS        
        try{
            
            dataset_list = JSON.parse(ds_list);        
            
            potential_chosen_id_name_hash  = COMMON.create_new_chosen_id_name_hash(dataset_list);  
            ascii_file = ts+'_'+metric+'_tree.txt';
            ascii_file_path = path.join(pwd,'tmp',ascii_file);
            fs.readFile(ascii_file_path, 'utf8', function readAsciiTreeFile(err,ascii_tree_data) {
              if (err) {
                return console.log(err);
              }else{
                //console.log(data);
              
                html = '';
                //console.log('potential_chosen_id_name_hash');        
                //console.log(potential_chosen_id_name_hash)

                html += "<table id='drag_table' class='table table-condensed' >"
                html += "<thead></thead>";
                html += "  <tbody>";
                for (var i in potential_chosen_id_name_hash.names){
                    html += "<tr class='tooltip_row'>";
                    html += "<td class='dragHandle' id='"+potential_chosen_id_name_hash.ids[i]+"--"+potential_chosen_id_name_hash.names[i]+"'> ";
                    html += "<input type='hidden' name='ds_order[]' value='"+potential_chosen_id_name_hash.ids[i]+"'>";
                    html += (parseInt(i)+1).toString()+" (id:"+ potential_chosen_id_name_hash.ids[i]+") - "+potential_chosen_id_name_hash.names[i];
                    html += "</td>";
                    html += "   <td>";
                    html += "       <a href='#' onclick='move_to_the_top("+(parseInt(i)+1).toString()+",\""+potential_chosen_id_name_hash.ids[i]+"--"+potential_chosen_id_name_hash.names[i]+"\")'>^</a>";
                    html += "   </td>";
                    html += "</tr>";
                } 
                html += "</tbody>";
                html += "</table>"; 
                html += '/////<pre style="font-size:10px">'+metric+'<br><small>'+ascii_tree_data+'</small></pre>';

                res.send(html)
              }
            });
        }
        catch(err){
          res.send('Calculation Error: '+err.toString())
        }


      }else{
        //console.log('output')
        //console.log(output);
        //res.send(err);
      }      
    });   


    
});
//
//
//
router.post('/download_file', helpers.isLoggedIn,  function(req, res) {
    console.log('in routes_visualization download_file')
    var html = '';
    var ts = req.body.ts;
    var file_type = req.body.file_type;
    if(file_type == 'biom'){
      file_name = ts+'_count_matrix.biom';  
      file_path = path.join(process.env.PWD, 'tmp', file_name);  
      res.setHeader('Content-Type', 'text');  
    }else if(file_type == 'tax'){
      file_name = ts+'_taxonomy.txt';
      file_path = path.join(process.env.PWD, 'tmp', file_name); 
      res.setHeader('Content-Type', 'text');     
    }else if(file_type == 'meta'){
      file_name = ts+'_metadata.txt';
      file_path = path.join(process.env.PWD, 'tmp', file_name);
      res.setHeader('Content-Type', 'text');      
    }else if(file_type == 'configuration'){
      file_name = req.body.filename; 
      file_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username,  file_name);   
      res.setHeader('Content-Type', 'json'); 
    }else{
      // ERROR
    }
    
    console.log(file_path)
    res.download(file_path); // Set disposition and send it.
});

//
//
//
router.get('/clear_filters', helpers.isLoggedIn, function(req, res) {
    //SHOW_DATA = ALL_DATASETS;
    console.log('in clear filters')
    
    //FILTER_ON = false
    PROJECT_TREE_OBJ = []
    PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, SHOW_DATA.projects);
    PROJECT_FILTER = {"substring":"","env":[],"target":"","portal":"","public":"-1","metadata":"","pid_length":PROJECT_TREE_PIDS.length}
    res.json(PROJECT_FILTER);

});
//
//
//
function filter_project_tree_for_permissions(req, obj){
  var new_project_tree_pids = []
  for( i in obj ){
      //node = PROJECT_INFORMATION_BY_PID[pid];
      //console.log(obj[i])
      pid = obj[i].pid;
      node = PROJECT_INFORMATION_BY_PID[pid];
      //console.log(node)
      if(node.public || req.user.security_level === 1 || node.permissions.length === 0 || node.permissions.indexOf(req.user.user_id) !== -1 ) { 
        //console.log(node)
        new_project_tree_pids.push(pid)
      }
  }
  //console.log(obj)
  return new_project_tree_pids
}

//
// 
//
router.get('/load_portal/:portal', helpers.isLoggedIn, function(req, res) {
    var portal = req.params.portal;

    console.log('in load_portal: '+portal)
    SHOW_DATA = ALL_DATASETS;
    PROJECT_TREE_OBJ = [];
    
    PROJECT_TREE_OBJ = helpers.get_portal_projects(req, portal)
    PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, PROJECT_TREE_OBJ);
    PROJECT_FILTER = {"substring":"","env":[],"target":"","portal":"","public":"-1","metadata":"","pid_length":PROJECT_TREE_PIDS.length}
    res.json(PROJECT_FILTER);
});
//
//
//  FILTERS FILTERS  FILTERS FILTERS FILTERS FILTERS FILTERS FILTERS
//  FILTERS FILTERS  FILTERS FILTERS FILTERS FILTERS FILTERS FILTERS
//
//  FILTER #1 LIVESEARCH PROJECTS (substring) FILTER
//
router.get('/livesearch_projects/:substring', function(req, res) {
  console.log('in livesearch_projects/:substring')
  var substring = req.params.substring.toUpperCase();
  var myurl = url.parse(req.url, true);  
  var portal = myurl.query.portal;
  if(substring === '.....'){
    substring = ''
  }
  
  PROJECT_FILTER.substring = substring
  console.log('PORTAL',portal)
  var projects_to_filter = []
  if(portal){
    projects_to_filter = helpers.get_portal_projects(req, portal)
  }else{
    projects_to_filter = SHOW_DATA.projects
  }
  NewPROJECT_TREE_OBJ = helpers.filter_projects(req, projects_to_filter, PROJECT_FILTER)
  
  PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, NewPROJECT_TREE_OBJ);  
  PROJECT_FILTER.pid_length = PROJECT_TREE_PIDS.length
  console.log('PROJECT_FILTER')
  console.log(PROJECT_FILTER)
  res.json(PROJECT_FILTER);

});

//
//  FILTER #2 LIVESEARCH ENV PROJECTS FILTER
//
router.get('/livesearch_env/:envid', function(req, res) {
  var envid = req.params.envid;
  var myurl = url.parse(req.url, true);  
  var portal = myurl.query.portal;
  var info = PROJECT_INFORMATION_BY_PID;
  //console.log(portal)
  //console.log(envid)
  var envid_lst = []
  // if q == 40 (human) then pull all from 40-49:: are there others like this??
  if(envid === '40'){
    envid_lst = [40,41,42,43,44,45,46,47,48,49];
  }else if(envid === '.....'){
    envid_lst = []
  }else{
    envid_lst = [parseInt(envid)]
  }
  
  PROJECT_FILTER.env = envid_lst
  console.log('PORTAL',portal)
  if(portal){
    var projects_to_filter = helpers.get_portal_projects(req, portal)
  }else{
    var projects_to_filter = SHOW_DATA.projects
  }
  NewPROJECT_TREE_OBJ = helpers.filter_projects(req, projects_to_filter, PROJECT_FILTER)
  
  PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, NewPROJECT_TREE_OBJ);
  PROJECT_FILTER.pid_length = PROJECT_TREE_PIDS.length
  console.log(PROJECT_FILTER)
  res.json(PROJECT_FILTER);

});
//
//  FILTER #3 LIVESEARCH TARGET PROJECTS FILTER
//
router.get('/livesearch_target/:gene_target', function(req, res) {
  var gene_target = req.params.gene_target;
  var myurl = url.parse(req.url, true);  
  var portal = myurl.query.portal;
  if(gene_target === '.....'){
    gene_target = ''
  }
  
  PROJECT_FILTER.target = gene_target
  console.log('PORTAL',portal)
  if(portal){
    var projects_to_filter = helpers.get_portal_projects(req, portal)
  }else{
    var projects_to_filter = SHOW_DATA.projects
  }
  NewPROJECT_TREE_OBJ = helpers.filter_projects(req, SHOW_DATA.projects, PROJECT_FILTER)
  
  PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, NewPROJECT_TREE_OBJ);
  PROJECT_FILTER.pid_length = PROJECT_TREE_PIDS.length
  console.log(PROJECT_FILTER)
  res.json(PROJECT_FILTER);

});
//
//
// FILTER #4
//
router.get('/livesearch_portal/:portal', function(req, res) {
  console.log('in livesearch portal')
  var select_box_portal = req.params.portal;
  var myurl = url.parse(req.url, true);  
  var portal = myurl.query.portal;  // we have this turned off: portal selection on portal page
  
  if(select_box_portal === '.....'){
    select_box_portal = ''
  }
 
  PROJECT_FILTER.portal = select_box_portal
  console.log('PORTAL',portal)
  if(portal){
    var projects_to_filter = helpers.get_portal_projects(req, portal)
  }else{
    var projects_to_filter = SHOW_DATA.projects
  }
  NewPROJECT_TREE_OBJ = helpers.filter_projects(req, SHOW_DATA.projects, PROJECT_FILTER)
  PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, NewPROJECT_TREE_OBJ);
  PROJECT_FILTER.pid_length = PROJECT_TREE_PIDS.length
  console.log(PROJECT_FILTER)
  res.json(PROJECT_FILTER);

});
//
//
//
//  FILTER # 5 LIVESEARCH PUBLIC/PRIVATE PROJECTS FILTER
//
router.get('/livesearch_status/:q', function(req, res) {
  console.log('in livesearch status')
  var q = req.params.q;
  var myurl = url.parse(req.url, true);  
  var portal = myurl.query.portal;
  
  PROJECT_FILTER.public = q
  console.log('PORTAL',portal)
  if(portal){
    var projects_to_filter = helpers.get_portal_projects(req, portal)
  }else{
    var projects_to_filter = SHOW_DATA.projects
  }
  NewPROJECT_TREE_OBJ = helpers.filter_projects(req, projects_to_filter, PROJECT_FILTER)
  
  PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, NewPROJECT_TREE_OBJ);
  PROJECT_FILTER.pid_length = PROJECT_TREE_PIDS.length
  console.log(PROJECT_FILTER)
  res.json(PROJECT_FILTER);

});
//
//
//  FILTER #6  LIVESEARCH METADATA FILTER
//
router.get('/livesearch_metadata/:q', function(req, res) {
  console.log('in livesearch metadata')
  var q = req.params.q;
  var myurl = url.parse(req.url, true);  
  var portal = myurl.query.portal;
  if(q === '.....'){
    q = ''
  }
  
  PROJECT_FILTER.metadata = q
  console.log('PORTAL',portal)
  if(portal){
    var projects_to_filter = helpers.get_portal_projects(req, portal)
  }else{
    var projects_to_filter = SHOW_DATA.projects
  }
  NewPROJECT_TREE_OBJ = helpers.filter_projects(req, projects_to_filter, PROJECT_FILTER)
  
  PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, NewPROJECT_TREE_OBJ);
  PROJECT_FILTER.pid_length = PROJECT_TREE_PIDS.length
  console.log(PROJECT_FILTER)
  res.json(PROJECT_FILTER);

});
//
//
//
router.get('/set_units', function(req, res) {
  //console.log('IN SET_UNITS')

  if(req.query.hasOwnProperty('units')){
    unit_choice = req.query.units
  }else{
    unit_choice = 'tax_silva119_simple';
  }
  
});
//
//
//
router.get('/set_units', function(req, res) {
  //console.log('IN SET_UNITS')

  if(req.query.hasOwnProperty('units')){
    unit_choice = req.query.units
  }else{
    unit_choice = 'tax_silva119_simple';
  }
  
});
//
//
//
router.get('/tax_custom_dhtmlx', function(req, res) {
    //console.log('IN tax_custom_dhtmlx')
    var myurl = url.parse(req.url, true);
    var id = myurl.query.id
    //console.log('id='+id)
    var json = {}
    json.id = id;
    json.item = []
    if(id==0){
        // return json for collapsed tree: 'domain' only
//         json = {"id":"0","item":[
//             {"id":"1","text":"Bacteria","tooltip":"domain","checked":true,"child":"1","item":[]},
//             {"id":"214","text":"Archaea","tooltip":"domain","checked":true,"child":"1","item":[]},
//             {"id":"338","text":"Unknown","tooltip":"domain","checked":true,"child":"1","item":[]},
//             {"id":"353","text":"Organelle","tooltip":"domain","checked":true,"child":"1","item":[]}
//             ]
//         }
        
        //console.log(new_taxonomy.taxa_tree_dict_map_by_rank["domain"])
        for( n in new_taxonomy.taxa_tree_dict_map_by_rank["domain"]){
            node = new_taxonomy.taxa_tree_dict_map_by_rank["domain"][n];
            if(node.children_ids.length === 0){
                json.item.push({id:node.node_id,text:node.taxon,tooltip:node.rank,checked:true,child:0})
            }else{
                json.item.push({id:node.node_id,text:node.taxon,tooltip:node.rank,checked:true,child:1,item:[]})
            }
        }
    }else{
        
        for(n in new_taxonomy.taxa_tree_dict_map_by_id[id].children_ids){
            node_id = new_taxonomy.taxa_tree_dict_map_by_id[id].children_ids[n];
            node = new_taxonomy.taxa_tree_dict_map_by_id[node_id]
            //console.log(node)
            if(node.children_ids.length === 0){
                json.item.push({id:node.node_id,text:node.taxon,tooltip:node.rank,child:0})
            }else{
                json.item.push({id:node.node_id,text:node.taxon,tooltip:node.rank,child:1,item:[]})
            }
        }
    }
    res.json(json)
});
//
//  project_custom_dhtmlx 
//
router.get('/project_dataset_tree_dhtmlx', function(req, res) {
    console.log('IN project_dataset_tree_dhtmlx - routes_visualizations')
    var myurl = url.parse(req.url, true);
    var id = myurl.query.id
    //console.log('id='+id)
    var json = {}
    json.id = id;
    json.item = []
    //PROJECT_TREE_OBJ = []
    //console.log('PROJECT_TREE_PIDS2',PROJECT_TREE_PIDS)
    
    if(id==0){
        //console.log(PROJECT_INFORMATION_BY_PID)
        
        for( i=0;i<PROJECT_TREE_PIDS.length;i++ ){
            
            var pid = PROJECT_TREE_PIDS[i];
            var node = PROJECT_INFORMATION_BY_PID[pid];
            //console.log('node',node)
            var tt_pj_id = 'project-|-'+node.project+'-|-'+node.title;
            if(node.public) {
              tt_pj_id += '-|-public'; 
            }else{
              tt_pj_id += '-|-private'; 
            }
            var pid_str = pid.toString()
            var itemtext = "<span id='"+ tt_pj_id +"' class='tooltip_pjds_list'>"+node.project+"</span>";
            itemtext    += " <a href='/projects/"+pid_str+"'><span title='profile' class='glyphicon glyphicon-question-sign'></span></a>";
            if(node.public) {
              itemtext += "<small> <i>(public)</i></small>"  
            }else{
                itemtext += "<small> <i>(PI: "+node.username +")</i></small>"         
            }
            
            if(Object.keys(DATA_TO_OPEN).indexOf(pid_str) >= 0){
              json.item.push({id:'p'+pid_str, text:itemtext, checked:false, open:'1',child:1, item:[]});
            }else{
              json.item.push({id:'p'+pid_str, text:itemtext, checked:false,  child:1, item:[]});
            }
            
                
        }
        //console.log(JSON.stringify(json, null, 4))
        
    }else{
        //console.log(JSON.stringify(ALL_DATASETS))
        var this_project = {}
        id = id.substring(1);  // id = pxx
        ALL_DATASETS.projects.forEach(function(prj) {        
          if(prj.pid == id){
            this_project = prj  
          }
        })
        var all_checked_dids = []
        if(Object.keys(DATA_TO_OPEN).length > 0){
          console.log('dto');
          console.log(DATA_TO_OPEN);
          for(openpid in DATA_TO_OPEN){
            Array.prototype.push.apply(all_checked_dids, DATA_TO_OPEN[openpid])
          }
        }
        console.log('all_checked_dids')
        console.log(all_checked_dids)
        var pname = this_project.name 
        for(n in this_project.datasets){
            var did   = this_project.datasets[n].did
            //console.log('didXX',did)
            var dname = this_project.datasets[n].dname
            var ddesc = this_project.datasets[n].ddesc
            var tt_ds_id  = 'dataset-|-'+pname+'-|-'+dname+'-|-'+ddesc;
            var itemtext = "<span id='"+ tt_ds_id +"' class='tooltip_pjds_list'>"+dname+"</span>";
            if(all_checked_dids.indexOf(parseInt(did)) === -1){
              json.item.push({id:did, text:itemtext, child:0})
            }else{
              json.item.push({id:did, text:itemtext, checked:'1', child:0})
            }
        }
    }
    json.item.sort(function sortByAlpha(a, b){
          return helpers.compareStrings_alpha(a.text, b.text);
    });
    //console.log(json.item)
    res.send(json)
});

module.exports = router;

/**
* F U N C T I O N S
**/

// Generally put fucntion in global.js or helpers.js
//



