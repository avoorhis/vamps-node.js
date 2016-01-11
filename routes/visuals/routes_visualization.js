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

//var xmldom = require('xmldom');

// // init_node var node_class =
// var CustomTaxa  = require('./custom_taxa_class');

/*
 * GET visualization page.
 */
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
  
  console.log('req.body: view_selection-->>');
  console.log(req.body);
  console.log('req.body: view_selection');
  
  helpers.start = process.hrtime();
  
  if(req.body.resorted === '1'){
    req.flash('message','The dataset order has been updated.');
    dataset_ids = req.body.ds_order;
    chosen_id_name_hash  = COMMON.create_chosen_id_name_hash(dataset_ids);	
  }else if(req.body.from_configuration_file === '1'){
    req.flash('message', 'Using data from configuration file.');
    TAXCOUNTS = {};
    METADATA  = {}; 
    var files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets");
    var file_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, req.body.filename);
    var file_data = JSON.parse(fs.readFileSync(file_path, 'utf8'))
    console.log(file_data)
    visual_post_items = file_data.post_items;
    chosen_id_name_hash = file_data.id_name_hash;
    dataset_ids = chosen_id_name_hash.ids;
    for(var i in dataset_ids){
      var path_to_file = path.join(files_prefix, dataset_ids[i] +'.json');
      try{
        var jsonfile = require(path_to_file);
      }
      catch(err){
        console.log('no file '+err.toString()+' Exiting');
        req.flash('nodataMessage', "ERROR \
          Dataset file not found '"+dataset_ids[i] +".json' (configuration file may be out of date)");
          //res.redirect('visuals_index');
          return;
      }
      TAXCOUNTS[dataset_ids[i]] = jsonfile['taxcounts'];
      METADATA[dataset_ids[i]]  = jsonfile['metadata'];
    }
  }else{
    // GLOBAL Variable
    visual_post_items = COMMON.save_post_items(req);

  }
  

  console.log('chosen_id_name_hash:>>');
  console.log(chosen_id_name_hash);
  console.log('<<chosen_id_name_hash');
    
  console.log('TAXCOUNTS:>>');
  console.log(TAXCOUNTS);
  console.log('<<TAXCOUNTS');
  // GLOBAL
  var timestamp = +new Date();  // millisecs since the epoch!
  timestamp = req.user.username + '_' + timestamp;
  visual_post_items.ts = timestamp;
  distance_matrix = {};
  BIOM_MATRIX = MTX.get_biom_matrix(chosen_id_name_hash, visual_post_items);
  visual_post_items.max_ds_count = BIOM_MATRIX.max_dataset_count;
  

  console.log('visual_post_items:>>');
  console.log(visual_post_items);
  console.log('<<visual_post_items:');
 

  // GLOBAL
  //console.log('metadata>>');
  //metadata = META.write_metadata_file(chosen_id_name_hash, visual_post_items);
  var metadata = META.write_mapping_file(chosen_id_name_hash, visual_post_items);
  //metadata = JSON.parse(metadata);
  console.log(metadata);
  //console.log('<<metadata');
  //console.log('MAP:::');
  //console.log(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank)
  //console.log(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["724_class"]["taxon"])

  //
  //uid_matrix = MTX.fill_in_counts_matrix( selection_obj, unit_field );  // just ids, but filled in zeros
  // {unit_id:[cnt1,cnt2...] // counts are in ds order
  
  //console.log(BIOM_MATRIX);


  res.render('visuals/view_selection', {
                                title     :           'VAMPS: Visuals Select',
                                referer   :           'unit_selection',
                                chosen_id_name_hash : JSON.stringify(chosen_id_name_hash),
                                matrix    :           JSON.stringify(BIOM_MATRIX),
                                metadata  :           JSON.stringify(metadata),
                                constants :           JSON.stringify(req.CONSTS),
                                post_items:           JSON.stringify(visual_post_items),
                                user      :           req.user,
                                hostname  :           req.CONFIG.hostname,
	                          //locals: {flash: req.flash('infomessage')},
                                message   :           req.flash('message')
                 });

});



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
  var dataset_ids = [];
  if(req.body.resorted === '1'){
  	dataset_ids = req.body.ds_order;	
  }else if(req.body.retain_data === '1'){
    dataset_ids = JSON.parse(req.body.dataset_ids);	
  }else{
    dataset_ids = req.body.dataset_ids;
  }

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
	  var file_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets");

    // if(req.CONFIG.hostname.substring(0,6) == 'bpcweb'){
    //   var file_prefix = path.join('/','groups','vampsweb','vampsdev_user_data',"VAMPS--datasets");
    // }else{
    //   var file_prefix = path.join(process.env.PWD,'public','json',NODE_DATABASE+"--datasets");
    // }
    for(var i in dataset_ids){
      var path_to_file = path.join(file_prefix, dataset_ids[i] +'.json');
      try{
        var jsonfile = require(path_to_file);
      }
      catch(err){
        console.log('no file '+err.toString()+' Exiting');
        req.flash('nodataMessage', "ERROR \
          Dataset file not found '"+dataset_ids[i] +".json' (run INITIALIZE_ALL_FILES.py in the public/scripts directory)");
          //res.redirect('visuals_index');
          return;
      }
		  TAXCOUNTS[dataset_ids[i]] = jsonfile['taxcounts'];
		  METADATA[dataset_ids[i]]  = jsonfile['metadata'];
	  }
	  //console.log(JSON.stringify(METADATA))
	  //console.log(JSON.stringify(TAXCOUNTS))
	  console.log('Pulling TAXCOUNTS and METADATA -- ONLY for datasets selected (from files)');
	  //console.log('TAXCOUNTS= '+JSON.stringify(TAXCOUNTS));
    //console.log('METADATA= '+JSON.stringify(METADATA));
	  var available_units = req.CONSTS.AVAILABLE_UNITS; // ['med_node_id','otu_id','taxonomy_gg_id']

	  // GLOBAL Variable
	  chosen_id_name_hash           = COMMON.create_chosen_id_name_hash(dataset_ids);

	  var custom_metadata_headers   = COMMON.get_metadata_selection(chosen_id_name_hash.ids,METADATA,'custom');
	  var required_metadata_headers = COMMON.get_metadata_selection(chosen_id_name_hash.ids,METADATA,'required');
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


	  console.log('chosen_id_name_hash-->');
	  console.log(chosen_id_name_hash);
	  console.log(chosen_id_name_hash.ids.length);
	  console.log('<--chosen_id_name_hash');


	  res.render('visuals/unit_selection', {
	                    title: 'VAMPS: Units Selection',
                      referer: 'visuals_index',
	                    chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
	                    constants    : JSON.stringify(req.CONSTS),
	                    md_cust      : JSON.stringify(custom_metadata_headers),  // should contain all the cust headers that selected datasets have
		  				        md_req       : JSON.stringify(required_metadata_headers),
		  				        message      : req.flash(),
	                    user         : req.user,hostname: req.CONFIG.hostname,
	  });  // end render
  }
    // benchmarking
  helpers.elapsed_time(">>>>>>>> 4 After Page Render <<<<<<");


}); // end fxn

/*
 * GET visualization page.
 */
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



  TAXCOUNTS = {}; // empty out this global variable: fill it in unit_selection
  METADATA  = {};
  //console.log(ALL_DATASETS);
  // GLOBAL
  SHOW_DATA = ALL_DATASETS;
  var data_to_open = {};
  if(req.body.data_to_open){
    // open many projects
    data_to_open = JSON.parse(req.body.data_to_open);
    //console.log('got data to open '+data_to_open)
  }else if(req.body.project){
    // open whole project
    // data_to_open = new Object();
     //data_to_open['HMP_PT_Bv1v3'] = ['2019','2020']
    // data_to_open.RARE = ['EFF_20090209']
    data_to_open[req.body.project] = DATASET_IDS_BY_PID[req.body.project_id];
  }
  console.log('data_to_open');
  console.log(data_to_open);
  
  
  res.render('visuals/visuals_index', {
                                title       : 'VAMPS: Select Datasets',
                                subtitle : 'Dataset Selection Page',
                                proj_info   : JSON.stringify(PROJECT_INFORMATION_BY_PID),
                                constants   : JSON.stringify(req.CONSTS),
                                filtering   : 0,
                                portal_to_show : '',
                                data_to_open: JSON.stringify(data_to_open),	  							              
                                user        : req.user,hostname: req.CONFIG.hostname,
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
  fs.readFile(file_path, 'utf8',function(err,data) {
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
  fs.readFile(file_path, 'utf8',function(err,data) {
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
    //console.log('req.body hm');
    //console.log(req.body);
    //console.log('req.body hm');
    
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
       args :       [ '-in', biom_file, '-metric', metric, '--function', 'dheatmap', '--site_base', process.env.PWD, '--prefix', ts],
     };
        
    
    var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
    
    //var heatmap_process = spawn( python_exe+' '+options.scriptPath+'/distance.py', options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
    var heatmap_process = spawn( options.scriptPath+'/distance.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true, 
            //stdio: [ 'ignore', null, log ] // stdin, stdout, stderr
            stdio: 'pipe' // stdin, stdout, stderr
        });  
    
    
    var stdout = '';
    heatmap_process.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stdout += data;
    });
    var stderr = '';
    heatmap_process.stderr.on('data', function (data) {
        console.log('stdout: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stderr += data;
    });
         
    heatmap_process.on('close', function (code) {
        console.log('heatmap_process process exited with code ' + code);
               
        //var last_line = ary[ary.length - 1];
        if(code === 0){   // SUCCESS     
          try{
            distance_matrix = JSON.parse(stdout);
          }
          catch(err){
            distance_matrix = {'ERROR':err};
          }  
            res.render('visuals/partials/load_distance',{
                  dm        : distance_matrix,
                  hash      : JSON.stringify(chosen_id_name_hash),                      
                  constants : JSON.stringify(req.CONSTS),
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
  

  var fheatmap_script_file = path.resolve(pwd, 'public','scripts','fheatmap.R');

  shell_command = [req.CONSTS.RSCRIPT_CMD, fheatmap_script_file, biom_file, visual_post_items.selected_distance, visual_post_items.tax_depth, ts ].join(' ');

  //COMMON.run_script_cmd(req, res, ts, shell_command, 'fheatmap');
  var options = {
     scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
       args :       [  biom_file, visual_post_items.selected_distance, visual_post_items.tax_depth, ts],
  };
  // RScript --no-restore --no-save /usr/local/www/vampsdev/projects/vamps-node.js/public/scripts/fheatmap.R 
  //    /usr/local/www/vampsdev/projects/vamps-node.js/tmp/avoorhis_1443031027846_count_matrix.biom morisita_horn phylum avoorhis_1443031027846    
  
  var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
  
  
  console.log(options.scriptPath+'/fheatmap.R '+options.args.join(' '));
  var fheatmap_process = spawn( options.scriptPath+'/fheatmap.R', options.args, {
          env:{'PATH':req.CONFIG.PATH},
          detached: true, 
          //stdio: [ 'ignore', null, log ]
          stdio: 'pipe'  // stdin, stdout, stderr
      }); 
  stdout = '';
  fheatmap_process.stdout.on('data', function (data) {
      
      stdout += data;    
   
  });
  stderr = '';
  fheatmap_process.stderr.on('data', function (data) {
      
      stderr += data;    
   
  }); 
  
  fheatmap_process.on('close', function (code) {
        console.log('fheatmap_process process exited with code ' + code);
        //distance_matrix = JSON.parse(output);
        //var last_line = ary[ary.length - 1];
        if(code === 0){   // SUCCESS       
              //image_file = ts+'_heatmap.pdf';
              //image_file = path.join(process.env.PWD,'tmp', ts+'_heatmap.pdf');
              //res.send("<img src='/"+image_file+"'>");
              
              //var viz_width = 1200;
              //var viz_height = (visual_post_items.no_of_datasets*12)+100;
              var image = '/'+ts+'_heatmap.pdf';
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
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'dendrogram-'+image_type, '--site_base', pwd, '--prefix', ts ],
    };
   
    var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
    var dendrogram_process = spawn( options.scriptPath+'/distance.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true, 
            //stdio: [ 'ignore', null, log ] // stdin, stdout, stderr
            stdio: 'pipe'  // stdin, stdout, stderr
    });  
    
    var stdout = '';
    dendrogram_process.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stdout += data;
    });
    var stderr = '';
    dendrogram_process.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stderr += data;
    });
    
    dendrogram_process.on('close', function (code) {
        console.log('dendrogram_process process exited with code ' + code);
      
        //var last_line = ary[ary.length - 1];
        if(code === 0){   // SUCCESS       
          if(image_type == 'svg'){
                    try{
                      newick = JSON.parse(stdout);
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
    var image_file = ts+'_'+metric+'_pcoaR'+rando.toString()+'.pdf';
    var biom_file_name = ts+'_count_matrix.biom';
    var biom_file = path.join(process.env.PWD,'tmp', biom_file_name);
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    var tmp_path = path.join(process.env.PWD,'tmp');
    var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
    
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
      //console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
      var pcoa_process = spawn( options2.scriptPath+'/pcoa2.R', options2.args, {
          env:{'PATH':req.CONFIG.PATH},
          detached: true, 
          stdio: [ 'ignore', null, log ]
          //stdio: 'pipe' // stdin, stdout, stderr
      });  
  
      
      pcoa_process.on('close', function (code) {
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
              html='PCoA Script Error';
          } 

          res.send(html);

      });   
      
        
    
    
});
//
//  EMPEROR....
// POST is for PC file link
router.post('/pcoa_3d', helpers.isLoggedIn, function(req, res) {
        
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
  
  var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');

  var mapping_file_name = ts+'_metadata.txt';
  var mapping_file = path.join(pwd,'tmp', mapping_file_name);        
  var pc_file_name = ts+'.pc';
  var pc_file = path.join(pwd,'tmp', pc_file_name);
  var tax_file_name = ts+'_taxonomy.txt';
  var tax_file = path.join(pwd,'tmp', tax_file_name);
  var dist_file_name = ts+'_distance.csv';
  var dist_file = path.join(pwd,'tmp', dist_file_name);

  var dir_name = ts+'_pcoa_3d';
  var dir_path = path.join(pwd,'views/tmp', dir_name);        
  var html_path = path.join(dir_path, 'index.html');  // file to be created by make_emperor.py script
  //var html_path2 = path.join('../','tmp', dir_name, 'index.html');  // file to be created by make_emperor.py script
  var options1 = {
    scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
    args :       [ '-i', biom_file, '-metric', metric, '--function', 'pcoa_3d', '--site_base', process.env.PWD, '--prefix', ts],
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
       
        pcoa_process.stdout.on('data', function (data) { console.log('1stdout: ' + data);  });
        stderr1='';
        pcoa_process.stderr.on('data', function (data) {
                console.log('1stderr-POST: ' + data);
                stderr1 += data; 
                //res.send(stderr1); 
                //return;              
        });
        pcoa_process.on('close', function (code1) {
                console.log('pcoa_process1 process exited with code ' + code1);
                
                if(code1 === 0){    // SUCCESS       
                    //console.log(options2.scriptPath+'/make_emperor.py '+options2.args.join(' '));
                    
                    //console.log(req.CONFIG.PATH)
                    //console.log(req.CONFIG.LD_LIBRARY_PATH)
                    //console.log(req.CONFIG.PYTHONPATH)
                    console.log(path.join(pwd,'logs','node.log'))
                    var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
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
                            }, function (error, stdout, stderr) {

                      console.log('stdout-POST: ' + stdout);

                      console.log('stderr-POST: ' + stderr);

                      if (error !== null) {

                        console.log('exec error-POST: ' + error);
                        var html = stderr

                        html += "<br>Principal Components File: <a href='/"+pc_file_name+"'>"+pc_file_name+"</a>";
                        html += "<br>Taxonomy File: <a href='/"+tax_file_name+"'>"+tax_file_name+"</a>";
                        html += "<br>Biom File: <a href='/"+biom_file_name+"'>"+biom_file_name+"</a>";
                        html += "<br>Metadata File: <a href='/"+mapping_file_name+"'>"+mapping_file_name+"</a>";
                        html += "<br>Distance File: <a href='/"+dist_file_name+"'>"+dist_file_name+"</a>";
                        res.send(html); 
                        return; 

                      }else{
                        //res.sendFile('tmp/'+dir_name+'/index.html', {root:pwd});
                        //open('file://'+html_path);
                        //res.send("Done - <a href='https://github.com/biocore/emperor' target='_blank'>Emperor</a> will open a new window in your default browser."); 
                        //res.send("Done - <a href='/tmp/"+dir_name+"/index.html' target='_blank'>Emperor</a> will open a new window in your default browser."); 
                        //html = "<a href='../tmp/andy_1450362333240_pcoa_3d/index' target='_blank'>Emperor1</a>"
                        var html = " <a href='/tmp/"+dir_name+"/index' target='_blank'>Open Emperor</a>"

                        html += "<br>Principal Components File: <a href='/"+pc_file_name+"'>"+pc_file_name+"</a>";
                        html += "<br>Taxonomy File: <a href='/"+tax_file_name+"'>"+tax_file_name+"</a>";
                        html += "<br>Biom File: <a href='/"+biom_file_name+"'>"+biom_file_name+"</a>";
                        html += "<br>Metadata File: <a href='/"+mapping_file_name+"'>"+mapping_file_name+"</a>";
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
router.get('/pcoa_3d', helpers.isLoggedIn, function(req, res) {
        
  console.log('in 3D');
  console.log(visual_post_items);
  var ts = visual_post_items.ts;    
  var metric = visual_post_items.selected_distance;
  
  var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
  var biom_file_name = ts+'_count_matrix.biom';
  var biom_file = path.join(pwd,'tmp', biom_file_name);
  
  var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');

  var mapping_file_name = ts+'_metadata.txt';
  var mapping_file = path.join(pwd,'tmp', mapping_file_name);        
  var pc_file_name = ts+'.pc';
  var pc_file = path.join(pwd,'tmp', pc_file_name);
  
  var dir_name = ts+'_pcoa_3d';
  var dir_path = path.join(pwd,'views/tmp', dir_name);        
  var html_path = path.join(dir_path, 'index.html');  // file to be created by make_emperor.py script
  //var html_path2 = path.join('../','tmp', dir_name, 'index.html');  // file to be created by make_emperor.py script
  var options1 = {
    scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
    args :       [ '-i', biom_file, '-metric', metric, '--function', 'pcoa_3d', '--site_base', process.env.PWD, '--prefix', ts],
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
       
        pcoa_process.stdout.on('data', function (data) { console.log('1stdout: ' + data);  });
        stderr1='';
        pcoa_process.stderr1.on('data', function (data) {
                console.log('1stderr-GET: ' + data);
                stderr1 += data;               
        });
        pcoa_process.on('close', function (code1) {
                console.log('pcoa_process1 process exited with code ' + code1);
                
                if(code1 === 0){    // SUCCESS       
                    //console.log(options2.scriptPath+'/make_emperor.py '+options2.args.join(' '));
                    
                    //console.log(req.CONFIG.PATH)
                    //console.log(req.CONFIG.LD_LIBRARY_PATH)
                    //console.log(req.CONFIG.PYTHONPATH)
                    console.log(path.join(pwd,'logs','node.log'))
                    var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
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
                            }, function (error, stdout, stderr) {

                      console.log('stdout-GET: ' + stdout);

                      console.log('stderr-GET: ' + stderr);

                      if (error !== null) {

                        console.log('exec error-GET: ' + error);
                        

                      }else{
                        //res.sendFile('tmp/'+dir_name+'/index.html', {root:pwd});
                        //open('file://'+html_path);
                        //res.send("Done - <a href='https://github.com/biocore/emperor' target='_blank'>Emperor</a> will open a new window in your default browser."); 
                        //res.send("Done - <a href='/tmp/"+dir_name+"/index.html' target='_blank'>Emperor</a> will open a new window in your default browser."); 
                        //html = "<a href='../tmp/andy_1450362333240_pcoa_3d/index' target='_blank'>Emperor1</a>"
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
//
//
router.post('/alpha_diversity', helpers.isLoggedIn, function(req, res) {
    console.log('in alpha div')
    var ts = req.body.ts;
    var metric = req.body.metric;
    var biom_file_name = ts+'_count_matrix.biom';
    var biom_file = path.join(process.env.PWD,'tmp', biom_file_name);

    
    var html = '';
    var title = 'VAMPS';
    console.log(biom_file)
    //var distmtx_file_name = ts+'_distance.csv';
    //var distmtx_file = path.join(process.env.PWD,'tmp',distmtx_file_name);
   
    var options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-in', biom_file, '--site_base', process.env.PWD, '--prefix', ts],
    };

   
    var log = fs.openSync(path.join(process.env.PWD,'logs','node.log'), 'a');
    // script will remove data from mysql and datset taxfile
    console.log(options.scriptPath+'alpha_diversity.py '+options.args.join(' '));
    var alphadiv_process = spawn( options.scriptPath+'/alpha_diversity.py', options.args, {
                env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
                detached: true, 
                //stdio: [ 'ignore', null, log ]
                stdio: 'pipe'  // stdin, stdout, stderr
            }); 
    
    stdout = '';
    alphadiv_process.stdout.on('data', function (data) {
        
        console.log(data)
        stdout += data;    
     
    });
    stderr = '';
    alphadiv_process.stderr.on('data', function (data) {
        
        console.log(data)
        stderr += data;    
     
    });
    alphadiv_process.on('close', function (code) {
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
      image_file = ts+'_phyloseq_'+plot_type+'_'+rando.toString()+'.png';
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
    var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
    
    console.log(options.scriptPath+script+' '+options.args.join(' '));
    var phyloseq_process = spawn( options.scriptPath+script, options.args, {
            env:{'PATH':req.CONFIG.PATH},
            detached: true, 
            //stdio: [ 'ignore', null, log ]
            stdio: 'pipe'  // stdin, stdout, stderr
    }); 
    stdout = '';
    lastline='';
    phyloseq_process.stdout.on('data', function (data) {
        lastline = data;
        stdout += data;      
    });
    stderr = '';
    phyloseq_process.stderr.on('data', function (data) {
        stderr += data;      
    }); 
    phyloseq_process.on('close', function (code) {
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

                 
                 // if(plot_type == 'heatmap'){   // for some unknown reason heatmaps are different: use pdf not svg
                 // //html = "<object  data='/"+image_file+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf'width='100%' height='700' >Your browser does not support SVG</object>";
                 //      html = "<div id='pdf'>";
                 //      html += "<object data='/"+image_file+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='100%' height='700' />";
                 //      html += " <p>ERROR in loading pdf file</p>";
                 //      html += "</object></div>"; 
                 // }else{
                      html = "<img src='/"+image_file+"'>";                    
                //}              
            }

          }else{
            console.log('ERROR-2');            
            html = 'Phyloseq R Script Error: '+stderr;
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
    var myurl = url.parse(req.url, true);
    //console.log('in piechart_single'+myurl)
    var ts = myurl.query.ts;
    //var id = myurl.query.id;
    //var pid = PROJECT_ID_BY_DID[did]
    //PROJECT_INFORMATION_BY_PID[pid].project
    //var ds_name = PROJECT_INFORMATION_BY_PID[pid].project+'--'+DATASET_NAME_BY_DID[did];
    var pjds = myurl.query.id;
    var ds_items = pjds.split('--');

    //var html  = COMMON.start_visuals_html('piechart');
    var html  = 'My HTML';

    //html += PCHARTS.create_single_piechart_html ( ts, ds_name, res );

    var new_matrix={}
    new_matrix.rows = BIOM_MATRIX.rows;
    new_matrix.columns =[];
    new_matrix.dataset = pjds;
    new_matrix.did = chosen_id_name_hash.ids[chosen_id_name_hash.names.indexOf(pjds)];
    //console.log('did ');
    //console.log(new_matrix.did );
    //console.log(ds_name );
    //console.log(new_matrix.did ); 
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
      //new_matrix.rows.push(BIOM_MATRIX.rows[n].name)
      //new_matrix.data.push(BIOM_MATRIX.data[n][d])
      new_matrix.data.push([BIOM_MATRIX.data[n][d]])
      new_matrix.total += BIOM_MATRIX.data[n][d]
    }
    console.log(JSON.stringify(new_matrix))
	
  	res.render('visuals/user_viz_data/bar_single', {
        title: 'Taxonomic Data',
        ts: ts || 'default_timestamp',
  		  matrix    :           JSON.stringify(new_matrix),
  		  post_items:           JSON.stringify(visual_post_items),
  		  //chosen_id_name_hash : JSON.stringify(chosen_id_name_hash),
        html: html,
        user: req.user, hostname: req.CONFIG.hostname,
    });

});

router.get('/sequences/', helpers.isLoggedIn, function(req, res) {
	var myurl = url.parse(req.url, true);
	var tax = myurl.query.taxa;
	var pjds = myurl.query.id;
  did = chosen_id_name_hash.ids[chosen_id_name_hash.names.indexOf(pjds)];
	//var pid = PROJECT_ID_BY_DID[did]
	//PROJECT_INFORMATION_BY_PID[pid].project
	//var ds_name = PROJECT_INFORMATION_BY_PID[pid].project+'--'+DATASET_NAME_BY_DID[did];
	//console.log('in sequences '+tax)

	//var q = QUERY.get_sequences_perDID_and_taxa_query(did,tax);
	
	connection.query(QUERY.get_sequences_perDID_and_taxa_query(did,tax), function(err, rows, fields){
	  
	      if (err)  {
	  		  console.log('Query error: ' + err);
	  		  console.log(err.stack);
	  		  res.send(err)
	      } else {
		  	
    			  for(s in rows){
    			  	//var buffer = new Buffer( rows[s].seq, 'binary' );
      				//var seqcomp = buffer.toString('base64');
      				rows[s].seq = rows[s].seq.toString('utf8')
      				rows[s].tax = ''

      				for(i in req.CONSTS.RANKS){
      					id_n_rank = rows[s][req.CONSTS.RANKS[i]+'_id']+'_'+req.CONSTS.RANKS[i];
      					//console.log(id_n_rank);
      					taxname =  new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[id_n_rank]['taxon'];
      					if(taxname.substr(-3) != '_NA'){
      						rows[s].tax += taxname+';'
      					}
      				} 
      				rows[s].tax = rows[s].tax.substr(0,rows[s].tax.length-1);  // remove trailing ';'
			
    			  }
    			
    			  res.render('visuals/user_viz_data/sequences', {
    		            title: 'Sequences',
    		            ds : pjds,
    		            tax : tax,
    				        rows : JSON.stringify(rows),
    		            user: req.user, hostname: req.CONFIG.hostname,
    		    });

	      }

	  });
	
	
});

/*
*   PARTIALS
*      These six partials all belong to the unit_selection page
*      and are shown via ajax depending on user selection in combo box
*       on that page.  AAV
*/
router.get('/partials/tax_silva108_simple', helpers.isLoggedIn,  function(req, res) {
    res.render('visuals/partials/tax_silva108_simple', {
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
router.get('/partials/tax_silva108_custom', helpers.isLoggedIn,  function(req, res) {
  res.render('visuals/partials/tax_silva108_custom',
    { title   : 'Silva(v108) Custom Taxonomy Selection'});
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
  var save_object = {}
  save_object.post_items = visual_post_items
  save_object.id_name_hash = chosen_id_name_hash
  console.log(save_object)

  var filename_path = path.join(req.CONFIG.USER_FILES_BASE,req.user.username,filename);
  helpers.mkdirSync(path.join(req.CONFIG.USER_FILES_BASE));  // create dir if not present
  helpers.mkdirSync(path.join(req.CONFIG.USER_FILES_BASE,req.user.username)); // create dir if not present
  //console.log(filename);
  helpers.write_to_file(filename_path, JSON.stringify(save_object));
    
  res.send("Saved as: <a href='saved_elements'>"+filename+"</a>");
  
  
});
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
      var saved_elements_dir = path.join(req.CONFIG.USER_FILES_BASE,req.user.username);

      file_info = {};
      modify_times = [];
      helpers.mkdirSync(saved_elements_dir);
      fs.readdir(saved_elements_dir, function(err, files){
          if(err){
      			
    				msg = 'ERROR Message '+err;
    				helpers.render_error_page(req,res,msg);
    			
    			
    		  }else{
      		  for (var f in files){
      	        var pts = files[f].split('-');
      	        if(pts[0] === 'datasets' || pts[0] === 'configuration'){
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
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'cluster_datasets', '--site_base', process.env.PWD, '--prefix', ts],
    };
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
    
    var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
    
    //var heatmap_process = spawn( python_exe+' '+options.scriptPath+'/distance.py', options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
    
    var cluster_process = spawn( options.scriptPath+'/distance.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true, 
            stdio: [ 'ignore', null, log ]
        });  // stdin, stdout, stderr
    
    
    //var heatmap_process = spawn( 'which' , ['python'], {env:{'PATH':envpath}});
    var output = '';
    cluster_process.stdout.on('data', function (data) {
      // console.log('stdout: ' + data);
      // //data = data.toString().replace(/^\s+|\s+$/g, '');
      // data = data.toString();
       output += data;
    });
       
    cluster_process.on('close', function (code) {
      console.log('heatmap_process process exited with code ' + code);
      
      //var last_line = ary[ary.length - 1];
      if(code === 0){   // SUCCESS        
        try{
            dataset_list = JSON.parse(output);        
            console.log(output);
            potential_chosen_id_name_hash  = COMMON.create_new_chosen_id_name_hash(dataset_list);  
            ascii_file = ts+'_'+metric+'_tree.txt';
            ascii_file_path = path.join(pwd,'tmp',ascii_file);
            fs.readFile(ascii_file_path, 'utf8', function (err,ascii_tree_data) {
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
                html += '/////<pre style="font-size:10px">'+metric+'<small>'+ascii_tree_data+'</small></pre>';

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
router.post('/download_file', helpers.isLoggedIn,  function(req, res) {
    console.log('in download_file')
    var html = '';
    var ts = req.body.ts;
    var file_type = req.body.file_type;
    if(file_type == 'biom'){
      file_name = ts+'_count_matrix.biom';      
    }else if(file_type == 'tax'){
      file_name = ts+'_taxonomy.txt';      
    }else if(file_type == 'meta'){
      file_name = ts+'_metadata.txt';      
    }else{
      // ERROR
    }
    file_path = path.join(process.env.PWD, 'tmp', file_name);
    res.setHeader('Content-Type', 'text');
    res.download(file_path); // Set disposition and send it.
});
//
//
//
router.get('/clear_filters', helpers.isLoggedIn, function(req, res) {
    SHOW_DATA = ALL_DATASETS;
    html = get_livesearch_html(SHOW_DATA.projects, PROJECT_INFORMATION_BY_PID, req.user);
    res.send(html);
});
//
//
//
router.get('/load_portal/:portal', helpers.isLoggedIn, function(req, res) {
    var portal = req.params.portal;
    console.log('in load_portal: '+portal)
    var info = PROJECT_INFORMATION_BY_PID;
    SHOW_DATA = ALL_DATASETS;
    var all_pr_dat = []
    prefixes = get_portal_prefixes(portal);    
    if(prefixes.length === 0){
      html = get_livesearch_html(SHOW_DATA.projects, info, req.user);
    }else{
      SHOW_DATA.projects.forEach(function(prj) {
        ucname = prj.name.toUpperCase();
        for(p in prefixes){
          if(ucname.indexOf(prefixes[p]) != -1){
            all_pr_dat.push(prj);        
          }
        }
      });
      html = get_livesearch_html(all_pr_dat, info, req.user);
    }
    res.send(html);
});
//
//  LIVESEARCH PROJECTS FILTER
//
router.get('/livesearch_projects/:q', helpers.isLoggedIn, function(req, res) {
  var q = req.params.q.toUpperCase();
  var myurl = url.parse(req.url, true);  
  var portal = myurl.query.portal;
  var info = PROJECT_INFORMATION_BY_PID;
  //console.log(q)
  
  var all_pr_dat = []
  if(portal){
    prefixes = get_portal_prefixes(portal);  // all uppercase
    console.log('got prefixes')
    if(q === '.....'){
      SHOW_DATA.projects.forEach(function(prj) {
        ucname = prj.name.toUpperCase();
        for(p in prefixes){
          if(ucname.indexOf(prefixes[p]) != -1){
            all_pr_dat.push(prj);        
          }
        }
      });
    }else{
      SHOW_DATA.projects.forEach(function(prj) {
        ucname = prj.name.toUpperCase();
        for(p in prefixes){
          if((ucname.indexOf(prefixes[p]) != -1) && ucname.indexOf(q) != -1){
              all_pr_dat.push(prj); 
          }       
        }
      });
    }
  }else{
      if(q === '.....'){          
          all_pr_dat = SHOW_DATA.projects
      }else{
          SHOW_DATA.projects.forEach(function(prj) {
            ucname = prj.name.toUpperCase();
            if(ucname.indexOf(q) != -1){
              all_pr_dat.push(prj);        
            }
          });
      }
  }

  if(all_pr_dat.length == 0){
    html = 'no projects found';
  }else{
    html = get_livesearch_html(all_pr_dat, info, req.user);
  }
  res.send(html);

});

//
//  LIVESEARCH ENV PROJECTS FILTER
//
router.get('/livesearch_env/:q', helpers.isLoggedIn, function(req, res) {
  var q = req.params.q;
  var myurl = url.parse(req.url, true);  
  var portal = myurl.query.portal;
  var info = PROJECT_INFORMATION_BY_PID;
  console.log(portal)
  console.log(q)
  var all_pr_dat = []
  if(portal){
    prefixes = get_portal_prefixes(portal);    // all uppercase
    console.log('got prefixes')
    if(q === '.....'){
      SHOW_DATA.projects.forEach(function(prj) {
        ucname = prj.name.toUpperCase();
        for(p in prefixes){
          if(ucname.indexOf(prefixes[p]) != -1){
            all_pr_dat.push(prj);        
          }
        }
      });
    }else{
      SHOW_DATA.projects.forEach(function(prj) {
        ucname = prj.name.toUpperCase();
        for(p in prefixes){
          if((ucname.indexOf(prefixes[p]) != -1) && parseInt(info[prj.pid].env_source_id) === parseInt(q)){
              all_pr_dat.push(prj); 
          }       
        }
      });
    }
  }else{
      if(q === '.....'){          
          all_pr_dat = SHOW_DATA.projects
      }else{
          SHOW_DATA.projects.forEach(function(prj) {
            if(parseInt(info[prj.pid].env_source_id) === parseInt(q)){
              all_pr_dat.push(prj);        
            }
          });
      }
  }
  if(all_pr_dat.length == 0){
    html = 'no projects found';
  }else{
    html = get_livesearch_html(all_pr_dat, info, req.user);
  }
  res.send(html);

});
//
//  LIVESEARCH TARGET PROJECTS FILTER
//
router.get('/livesearch_target/:q', helpers.isLoggedIn, function(req, res) {
  var q = req.params.q;
  var myurl = url.parse(req.url, true);  
  var portal = myurl.query.portal;
  var info = PROJECT_INFORMATION_BY_PID;
  //console.log(q)
  
  var all_pr_dat = []

  if(portal){
    prefixes = get_portal_prefixes(portal);    // all uppercase
    console.log('got prefixes')
    if(q === '.....'){
      SHOW_DATA.projects.forEach(function(prj) {
        ucname = prj.name.toUpperCase();
        for(p in prefixes){
          if(ucname.indexOf(prefixes[p]) != -1){
            all_pr_dat.push(prj);        
          }
        }
      });
    }else{
      SHOW_DATA.projects.forEach(function(prj) {
        ucname = prj.name.toUpperCase();
        pparts = prj.name.split('_');
        last_el = pparts[pparts.length - 1]
        for(p in prefixes){
          if((ucname.indexOf(prefixes[p]) != -1) && last_el === q){
              all_pr_dat.push(prj); 
          }       
        }
      });
    }
  }else{
      if(q === '.....'){          
          all_pr_dat = SHOW_DATA.projects
      }else{
          SHOW_DATA.projects.forEach(function(prj) {
            pparts = prj.name.split('_');
            last_el = pparts[pparts.length - 1]
            if(last_el === q){
              all_pr_dat.push(prj);        
            }
          });
      }
  }
  if(all_pr_dat.length == 0){
    html = 'no projects found';
  }else{
    html = get_livesearch_html(all_pr_dat, info, req.user);
  }
   res.send(html);

});
module.exports = router;

/**
* F U N C T I O N S
**/

// Generally put fuction in global.js or helpers.js
//
//
//
function get_portal_prefixes(portal){
    switch (portal) {
    
      case 'MBE':
          prefixes = [portal];
          break;
      case 'ICM':
          prefixes = [portal,'KCK'];
          break;
      case 'HMP':
          prefixes = [portal];
          break;
      case 'DCO':
          prefixes = [portal];
          break;
      case 'UC':
          prefixes = [portal];
          break;
      case 'RARE':
          prefixes = [portal];
          break;
      case 'CMP':
          prefixes = [portal];
          break;
      case 'LTR':
          prefixes = [portal];
          break;
      default:
          console.log('no portal found -- loading all data')
          prefixes = [];
    }
    return prefixes;
}
//
//
//
function get_livesearch_html(all_pr_dat, info, user)
{

  html = '';
  html += "<ul>";
   
  for (i in all_pr_dat) { 
      
          var pid = all_pr_dat[i].pid 
      
          if(user.security_level === 1 || (info[pid].permissions.length === 0) || (info[pid].permissions.indexOf(user.user_id) !== -1) ) { 
        
            pname = all_pr_dat[i].name;
            title = all_pr_dat[i].title;
            datasets = all_pr_dat[i].datasets;
            if(info[pid].public  === 1 || info[pid].public  === '1') { 
              var status='public'; 
            } else { 
              var status = 'private'; 
            } 
            var tt_pj_id  = 'project-|-'+pname+'-|-'+title+'-|-'+status; 
          
            html += "<li>";
            html += "  <label id='"+pname+"' class='project-select'>";
            html += "    <a href='#'  id='"+ pname +"_toggle' class='project_toggle'>";
            html += "      <img alt='plus' src='/images/tree_plus.gif'/>";
            html += "    </a>";
              
            html += "    <input type='checkbox' class='project_toggle' id='"+ pname+"--pj-id'  name='project_names[]' value='"+ pname +"'/>";
            html += "    <a href='/projects/"+pid+"'>";
            html += "      <span id='"+ tt_pj_id +"' class='tooltip_pjds_list'>";
            if(status == 'public') {     
              html += pname+"</span></a><small> <i>(public)</i></small>";
            }else{ 
                if(user.security_level === 1 ){
                    html += pname+"</span></a></a><small> <i>(PI: "+info[pid].username +")</i></small>";
                }else{ 
                    html += pname+"</span></a></a>";
                }
            }
            html += "  </label>";
            html += "  <ul>";
            html += "    <div id='"+ pname +"_ds_div' class='datasets_per_pr'>";
           //     <!--  class='display_none' -->
            for (k in datasets) { 
              did = datasets[k].did; 
              dname = datasets[k].dname;
              ddesc = datasets[k].ddesc; 
              pd = pname + '--' + dname; 
              pass_thru_value = did + '--' + pname + '--' + dname;
              var tt_ds_id  = 'dataset-|-'+pname+'-|-'+dname+'-|-'+ddesc;
              html += "       <li>";
              html += "         <label id='"+pd+"' class='dataset-select'  >";
              html += "            <input type='checkbox' id='"+pd+"' name='dataset_ids[]' class='dataset_check' value='"+did+"' onclick='checkme()'/>";
              html += "           <span id='"+tt_ds_id+"' class='tooltip_pjds_list'>"+ dname +"</span>";
              html += "        </label>";
              html += "      </li>";
            }
            html += "  </div>";
            html += "</ul>";
            html += "</li>"

        }
     
  }
  html += "</ul>";  
  return html;
}


