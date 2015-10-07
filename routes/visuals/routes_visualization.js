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
  //console.log('chosen_id_name_hash:>>');
  
  
  if(req.body.resorted === '1'){
  	 req.flash('message','The dataset order has been updated.')
	   dataset_ids = req.body.ds_order;
	   chosen_id_name_hash  = COMMON.create_chosen_id_name_hash(dataset_ids);	
  } 
  // GLOBAL Variable
  visual_post_items = COMMON.save_post_items(req);

  
  helpers.start = process.hrtime();
  
  
  // GLOBAL
  var timestamp = +new Date();  // millisecs since the epoch!
  timestamp = req.user.username + '_' + timestamp;
  visual_post_items.ts = timestamp;
  distance_matrix = {};
  biom_matrix = MTX.get_biom_matrix(chosen_id_name_hash, visual_post_items);
  visual_post_items.max_ds_count = biom_matrix.max_dataset_count;
  console.log('visual_post_items:>>');
  console.log(visual_post_items);
  console.log('<<visual_post_items:');


  // GLOBAL
  //console.log('metadata>>');
  //metadata = META.write_metadata_file(chosen_id_name_hash, visual_post_items);
  metadata = META.write_mapping_file(chosen_id_name_hash, visual_post_items);
  //metadata = JSON.parse(metadata);
  //console.log(metadata);
  //console.log('<<metadata');
  //console.log('MAP:::');
  //console.log(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank)
  //console.log(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["724_class"]["taxon"])

  //
  //uid_matrix = MTX.fill_in_counts_matrix( selection_obj, unit_field );  // just ids, but filled in zeros
  // {unit_id:[cnt1,cnt2...] // counts are in ds order
  
  //console.log(biom_matrix);


  res.render('visuals/view_selection', {
                                title     :           'VAMPS: Visuals Select',
                                referer   : 'unit_selection',
                                chosen_id_name_hash : JSON.stringify(chosen_id_name_hash),
                                matrix    :           JSON.stringify(biom_matrix),
                                metadata  :           JSON.stringify(metadata),
                                constants :           JSON.stringify(req.C),
                                post_items:           JSON.stringify(visual_post_items),
                                user      :           req.user,hostname: req.C.hostname,
	                          //locals: {flash: req.flash('infomessage')},
                                message   : req.flash('message')
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
   	 res.redirect('visuals_index');
     return;
  }else{
	  // Global TAXCOUNTS, METADATA
	  TAXCOUNTS = {};
	  METADATA  = {}; 
	  // Gather just the tax data of selected datasets
	  for(var i in dataset_ids){
	    var path_to_file = path.join(process.env.PWD,'public','json',NODE_DATABASE+"--datasets", dataset_ids[i] +'.json');
		  try{
        var jsonfile = require(path_to_file);
      }
      catch(err){
        console.log('no file '+err.toString()+' Exiting');
        req.flash('nodataMessage', "ERROR \
          Dataset file not found '"+dataset_ids[i] +".json' (run INITIALIZE_ALL_FILES.py in the public/scripts directory)");
        res.redirect('visuals_index');
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
	  var available_units = req.C.AVAILABLE_UNITS; // ['med_node_id','otu_id','taxonomy_gg_id']

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
	                    constants    : JSON.stringify(req.C),
	                    md_cust      : JSON.stringify(custom_metadata_headers),  // should contain all the cust headers that selected datasets have
		  				        md_req       : JSON.stringify(required_metadata_headers),
		  				        message      : req.flash(),
	                    user         : req.user,hostname: req.C.hostname,
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
  TAXCOUNTS = {}; // empty out this global variable: fill it in unit_selection
  METADATA  = {}
  
  res.render('visuals/visuals_index', {
                                title    : 'VAMPS: Select Datasets',
                                rows     : JSON.stringify(ALL_DATASETS),
                                proj_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
                                constants: JSON.stringify(req.C),
	  							              message  : req.flash('nodataMessage'),
                                user     : req.user,hostname: req.C.hostname,
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
                                constants    : JSON.stringify(req.C),
								                referer: req.body.referer,
                                ts : ts,
                                user: req.user, hostname: req.C.hostname,
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
  var file_path = path.join('user_data',NODE_DATABASE,req.body.user,req.body.filename);
  console.log(file_path);
  var dataset_ids = [];
  fs.readFile(file_path, 'utf8',function(err,data) {
    if (err) {
      msg = 'ERROR Message '+err;
        helpers.render_error_page(req,res,msg);
    
    }else{    
      res.send(data);
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
    var pwd = process.env.PWD || req.config.PROCESS_DIR;
    var biom_file = path.join(pwd,'tmp', biom_file_name);
    //console.log('mtx1')
   
    var html = '';
    var title = 'VAMPS';

    var distmtx_file_name = ts+'_distance.csv';
    var distmtx_file = path.join(pwd,'tmp',distmtx_file_name);
    
    var options = {
     scriptPath : 'public/scripts',
       args :       [ '-in', biom_file, '-metric', metric, '--function', 'dheatmap', '--site_base', process.env.PWD, '--prefix', ts],
     };
        
    
    var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
    
    //var heatmap_process = spawn( python_exe+' '+options.scriptPath+'/distance.py', options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
    var heatmap_process = spawn( options.scriptPath+'/distance.py', options.args, {
            env:{'PATH':req.config.PATH,'LD_LIBRARY_PATH':req.config.LD_LIBRARY_PATH},
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
                  constants : JSON.stringify(req.C),
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
  var pwd = process.env.PWD || req.config.PROCESS_DIR;
  var html = '';
  var title = 'VAMPS';

  var distmtx_file_name = ts+'_distance.csv';
  var distmtx_file = path.join(pwd,'tmp',distmtx_file_name);
  

  var fheatmap_script_file = path.resolve(pwd, 'public','scripts','fheatmap.R');

  shell_command = [req.C.RSCRIPT_CMD, fheatmap_script_file, biom_file, visual_post_items.selected_distance, visual_post_items.tax_depth, ts ].join(' ');

  //COMMON.run_script_cmd(req, res, ts, shell_command, 'fheatmap');
  var options = {
     scriptPath : 'public/scripts',
       args :       [  biom_file, visual_post_items.selected_distance, visual_post_items.tax_depth, ts],
  };
  // RScript --no-restore --no-save /usr/local/www/vampsdev/projects/vamps-node.js/public/scripts/fheatmap.R 
  //    /usr/local/www/vampsdev/projects/vamps-node.js/tmp/avoorhis_1443031027846_count_matrix.biom morisita_horn phylum avoorhis_1443031027846    
  
  var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
  
  
  console.log(options.scriptPath+'/fheatmap.R '+options.args.join(' '));
  var fheatmap_process = spawn( options.scriptPath+'/fheatmap.R', options.args, {
          env:{'PATH':req.config.PATH},
          detached: true, 
          stdio: [ 'ignore', null, log ]
          //stdio: 'pipe'  // stdin, stdout, stderr
      }); 
  
  

   
  fheatmap_process.on('close', function (code) {
        console.log('fheatmap_process process exited with code ' + code);
        //distance_matrix = JSON.parse(output);
        //var last_line = ary[ary.length - 1];
        if(code === 0){   // SUCCESS       
              image = '/'+ts+'__heatmap.svg';
              image_file = path.join(process.env.PWD,'tmp', ts+'_heatmap.svg');
            
              fs.readFile(image_file, 'utf8', function (err,data) {
                if (err) {
                   console.log(err);
                   res.send('FreqHeatmap File Error');
                 }
                 console.log('Reading: '+image)
                 //data_items = data.split('\n')
                 
                 //X=data_items.slice(1,data_items.length)
                 //d = X.join('\n')
                 //console.log(d)
                 res.send(data);
              });
                                        
        }else{
          console.log('ERROR');
          res.send('Frequency Heatmap R Script Error');
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
    var pwd = process.env.PWD || req.config.PROCESS_DIR;
    //console.log('image_type '+image_type);
    // see:  http://bl.ocks.org/timelyportfolio/59acc3853b02e47e0dfc
  
    var biom_file_name = ts+'_count_matrix.biom';
    var biom_file = path.join(pwd,'tmp',biom_file_name);

    var html = '';
    var title = 'VAMPS';

    var distmtx_file_name = ts+'_distance.csv';
    var distmtx_file = path.join(pwd,'tmp',distmtx_file_name);
    

    var options = {
      scriptPath : 'public/scripts',
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'dendrogram-'+image_type, '--site_base', pwd, '--prefix', ts ],
    };
   
    var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
    var dendrogram_process = spawn( options.scriptPath+'/distance.py', options.args, {
            env:{'PATH':req.config.PATH,'LD_LIBRARY_PATH':req.config.LD_LIBRARY_PATH},
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
                      newick = {"ERROR":err}
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
          console.log('stderr: '+stderr)
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
    var metric = req.body.metric;
    var image_type = req.body.image_type;
    var biom_file_name = ts+'_count_matrix.biom';
    var biom_file = path.join(process.env.PWD,'tmp', biom_file_name);
    var pwd = process.env.PWD || req.config.PROCESS_DIR;
    
    var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
    
    
    
    if(image_type == '2d'){
        
        var options = {
          scriptPath : 'public/scripts',
          args :       [ '-in', biom_file, '-metric', metric, '--function', 'pcoa_2d', '--site_base', process.env.PWD, '--prefix', ts],
        };
        console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
        
        var pcoa_process = spawn( options.scriptPath+'/distance.py', options.args, {
            env:{'PATH':req.config.PATH,'LD_LIBRARY_PATH':req.config.LD_LIBRARY_PATH},
            detached: true, 
            stdio: [ 'ignore', null, log ]
            //stdio: 'pipe' // stdin, stdout, stderr
        });  
    
        
        pcoa_process.on('close', function (code) {
            //console.log('pcoa_process process exited with code ' + code+' -- '+output);
            //distance_matrix = JSON.parse(output);
            //var last_line = ary[ary.length - 1];
            if(code === 0){   // SUCCESS       
              var image = path.join('/',ts+'_pcoa.pdf');              
              var html = "<div id='pdf'>";
              html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='1000' height='900' />";
              html += " <p>ERROR in loading pdf file</p>";
              html += "</object></div>";
              //console.log(html);                 
              res.send(html);                                    
            }else{
                console.log('ERROR');
                res.send('PCoA Python Error');
            }      
        });   
        
        
    }else if(image_type == '3d'){
        
     
        // see next FXN
        
    }
    
});
//
//  EMPEROR....
// POST is for PC file link
router.post('/pcoa_3d', helpers.isLoggedIn, function(req, res) {
        var ts = visual_post_items.ts; 
        var pwd = process.env.PWD || req.config.PROCESS_DIR;
        var pc_file_name = ts+'.pc';
        //var pc_file = path.join(pwd,'tmp', pc_file_name);
        var txt = "Principal Components File: <a href='/"+pc_file_name+"'>"+pc_file_name+"</a>";
        res.send(txt)
});
// GET is to create and open EMPEROR
router.get('/pcoa_3d', helpers.isLoggedIn, function(req, res) {
        
        console.log('in 3D')
        console.log(visual_post_items)
        var ts = visual_post_items.ts;    
        var metric = visual_post_items.selected_distance;
        
        var pwd = process.env.PWD || req.config.PROCESS_DIR;
        var biom_file_name = ts+'_count_matrix.biom';
        var biom_file = path.join(pwd,'tmp', biom_file_name);
        
        var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');

        var mapping_file_name = ts+'_metadata.txt';
        var mapping_file = path.join(pwd,'tmp', mapping_file_name);        
        var pc_file_name = ts+'.pc';
        var pc_file = path.join(pwd,'tmp', pc_file_name);
        
        var dir_name = ts+'_pcoa_3d';
        var dir_path = path.join(pwd,'tmp', dir_name);        
        var html_path = path.join(dir_path, 'index.html');  // file to be created by make_emperor.py script
        //var html_path2 = path.join('../','tmp', dir_name, 'index.html');  // file to be created by make_emperor.py script
        var options1 = {
          scriptPath : 'public/scripts',
          args :       [ '-i', biom_file, '-metric', metric, '--function', 'pcoa_3d', '--site_base', process.env.PWD, '--prefix', ts],
        };
        var options2 = {
            //scriptPath : req.config.PATH_TO_QIIME_BIN,
            scriptPath : 'public/scripts',
            args :       [ '-i', pc_file, '-m', mapping_file, '-o', dir_path],
        };
        console.log('outdir: '+dir_path);
        console.log(options1.scriptPath+'/distance.py '+options1.args.join(' '));
        
        var pcoa_process = spawn( options1.scriptPath+'/distance.py', options1.args, {
            env:{ 'PATH':req.config.PATH,'LD_LIBRARY_PATH':req.config.LD_LIBRARY_PATH },
            detached: true, 
            stdio:['pipe', 'pipe', 'pipe']
            //stdio: [ 'ignore', null, log ]
        });  // stdin, stdout, stderr    
       
        pcoa_process.stdout.on('data', function (data) { console.log('1stdout: ' + data);  });
        stderr1=''
        pcoa_process.stderr.on('data', function (data) {
                console.log('1stderr: ' + data);
                stderr += data;               
        });
        pcoa_process.on('close', function (code1) {
                console.log('pcoa_process1 process exited with code ' + code1);
                
                if(code1 === 0){    // SUCCESS       
                    console.log(options2.scriptPath+'/make_emperor_custom.py '+options2.args.join(' '));
                    var emperor_process = spawn( options2.scriptPath+'/make_emperor_custom.py', options2.args, {
                            env:{ 'PATH':req.config.PATH,'LD_LIBRARY_PATH':req.config.LD_LIBRARY_PATH },
                            detached: true, 
                            stdio:'pipe' // stdin, stdout, stderr
                            //stdio: [ 'ignore', null, log ]
                    });  
                    
                    emperor_process.stdout.on('data', function (data) { console.log('2stdout: ' + data);  });
                    stderr2=''
                    emperor_process.stderr.on('data', function (data) {
                            console.log('2stderr: ' + data);
                            stderr2 += data;                       
                    });
                    emperor_process.on('close', function (code2) {
                          console.log('emperor_process process exited with code ' + code2);
                          
                          if(code2 == 0){           
                              
                              console.log('opening file:///'+html_path)
                              //res.send()
                              res.sendFile('tmp/'+dir_name+'/index.html', {root:pwd})

                              //open('file://'+html_path);
                              //res.send(ok_form+"Done - <a href='https://github.com/biocore/emperor' target='_blank'>Emperor</a> will open a new window in your default browser."); 
                          }else{
                            // python script error
                            //console.log('make_emperor script error:' + errdata2);
                            res.send('make_emperor2 SCRIPT error '+stderr2)
                          }      
                    });                      
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
    //console.log(JSON.stringify(biom_matrix,null,2));
    var html='';
    var max_total_count = Math.max.apply(null, biom_matrix.column_totals);
    //console.log('column_totals '+biom_matrix.column_totals);
    //console.log('max_total_count '+max_total_count.toString());

    // sum counts
    sumator = get_sumator(req)
 
    //console.log(JSON.stringify(sumator))
    
    for(d in sumator['domain']){
        
      // #### DOMAIN ####
      //var dnode_name =  dname
      html += "<node name='"+d+"'>\n";
      html += " <seqcount>";
      for(c_domain in sumator['domain'][d]['knt']){
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
      matrix:              JSON.stringify(biom_matrix),
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
      scriptPath : 'public/scripts/',
      args :       [ '-in', biom_file, '--site_base', process.env.PWD, '--prefix', ts],
    };

   
    var log = fs.openSync(path.join(process.env.PWD,'logs','node.log'), 'a');
    // script will remove data from mysql and datset taxfile
    console.log(options.scriptPath+'alpha_diversity.py '+options.args.join(' '));
    var alphadiv_process = spawn( options.scriptPath+'/alpha_diversity.py', options.args, {
                env:{'PATH':req.config.PATH,'LD_LIBRARY_PATH':req.config.LD_LIBRARY_PATH},
                detached: true, 
                //stdio: [ 'ignore', null, log ]
                stdio: 'pipe'  // stdin, stdout, stderr
            }); 
    
    stdout = '';
    alphadiv_process.stdout.on('data', function (data) {
        
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        //data = data.toString().trim()
        console.log(data)
        stdout += data;    
     
    });
    stderr = '';
    alphadiv_process.stderr.on('data', function (data) {
        
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        //data = data.toString().trim()
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
    var dist_metric = req.body.metric;
    var plot_type = req.body.plot_type;
    var image_file = ts+'_phyloseq_'+plot_type+'.svg';
    var image_path = path.join(process.env.PWD,'tmp', image_file);
    try{
      fs.unlinkSync(image_path);
    }catch(err){
      console.log(err);
    }
    var pwd = process.env.PWD || req.config.PROCESS_DIR;
    
    // var biom_file_name = ts+'_count_matrix.biom';
    // var biom_file = path.join(process.env.PWD,'tmp', biom_file_name);
    // var tax_file_name = ts+'_taxonomy.txt';
    // var tax_file = path.join(process.env.PWD,'tmp', tax_file_name);
    // var map_file_name = ts+'_metadata.txt';
    // var map_file = path.join(process.env.PWD,'tmp', map_file_name);
    var tmp_path = path.join(process.env.PWD,'tmp');
    var html = '';
    var title = 'VAMPS';
    //console.log(biom_file)
    //var distmtx_file_name = ts+'_distance.csv';
    //var distmtx_file = path.join(process.env.PWD,'tmp',distmtx_file_name);
    var options = {
      scriptPath : 'public/scripts/',
      args :       [ tmp_path, ts ],
    };
    if(plot_type == 'bar'){
      script = 'phyloseq_bar.R';
      var phy = req.body.phy;
      var fill = visual_post_items.tax_depth.charAt(0).toUpperCase() + visual_post_items.tax_depth.slice(1);
      if(fill === 'Klass'){
        fill = 'Class';
      }
      options.args = options.args.concat([phy, fill]);
    }else if(plot_type == 'heatmap'){
      script = 'phyloseq_heatmap.R';
      var phy = req.body.phy;
      var md1 = req.body.md1;
      var ordtype = req.body.ordtype;
      var fill = visual_post_items.tax_depth.charAt(0).toUpperCase() + visual_post_items.tax_depth.slice(1);
      if(fill === 'Klass'){
        fill = 'Class';
      }
      options.args = options.args.concat([dist_metric, phy, md1, ordtype, fill]);
    }else if(plot_type == 'network'){
      script = 'phyloseq_network.R';
      var md1 = req.body.md1 || "Project";
      var md2 = req.body.md2 || "Description";
      var maxdist = req.body.maxdist || "0.3";
      options.args = options.args.concat([dist_metric, md1, md2, maxdist]);
    }else if(plot_type == 'ord'){
      script = 'phyloseq_ord.R';
      var md1 = req.body.md1 || "Project";
      var md2 = req.body.md2 || "Description";
      var ordtype = req.body.ordtype || "PCoA";
      options.args = options.args.concat([dist_metric, md1, md2, ordtype]);
    }else{
      //ERROR
    }
    var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
    
    console.log(options.scriptPath+script+' '+options.args.join(' '));
    var phyloseq_process = spawn( options.scriptPath+script, options.args, {
            env:{'PATH':req.config.PATH},
            detached: true, 
            //stdio: [ 'ignore', null, log ]
            stdio: 'pipe'  // stdin, stdout, stderr
        }); 
    stdout = '';
    phyloseq_process.stdout.on('data', function (data) {
        
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        //data = data.toString().trim()
        //console.log(data)
        stdout += data;    
     
    });
    stderr = '';
    phyloseq_process.stderr.on('data', function (data) {
        
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        //data = data.toString().trim()
        //console.log(data)
        stderr += data;    
     
    }); 
    phyloseq_process.on('close', function (code) {
          console.log('phyloseq_process process exited with code ' + code);
          //distance_matrix = JSON.parse(output);
          //var last_line = ary[ary.length - 1];
          
          if(code === 0){   // SUCCESS       
            
//res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//  res.header('Expires', '-1');
 // res.header('Pragma', 'no-cache');
                res.send("<img src='/"+image_file+"'>")
              //  fs.readFile(image_path, 'utf8', function (err, data) {
              //   if (err) {
              //      console.log(err);
              //      res.send('Phyloseq File Error');
              //    }
              //    console.log('Reading: '+image_file)
              //    //data_items = data.split('\n')
             
              //    //X=data_items.slice(1,data_items.length)
              //    //d = X.join('\n')
              //    //console.log(d)
              //    res.send(data);
              // });
           
                                          
          }else{
            console.log('ERROR');
            res.send('Phyloseq R script Error: '+stderr);
          }      
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
    
    for(r in biom_matrix.rows){
        tax_string = biom_matrix.rows[r].id;
        tax_items = tax_string.split(';');
        key = tax_items[0];
        //console.log(tax_items);
        for(t in tax_items){
           var taxa = tax_items[t];
           var rank = req.C.RANKS[t];
           if(rank=='domain'){
               d = tax_items[t]
               for(i in chosen_id_name_hash.ids){
                   if(d in sumator['domain']){
                       if(i in sumator['domain'][d]['knt']){
                           sumator['domain'][d]['knt'][i] += parseInt(biom_matrix.data[r][i]); 
                       }else{
                           sumator['domain'][d]['knt'][i] = parseInt(biom_matrix.data[r][i]); 
                       } 
                   }else{
                       sumator['domain'][d]={};
                       sumator['domain'][d]['phylum']={}
                       sumator['domain'][d]['knt']=[] 
                       sumator['domain'][d]['knt'][i] = parseInt(biom_matrix.data[r][i]);  
                   }
               }
           }
           if(rank=='phylum'){
               p = tax_items[t]
               for(i in chosen_id_name_hash.ids){
                   if(p in sumator['domain'][d]['phylum']){
                       if(i in sumator['domain'][d]['phylum'][p]['knt']){
                           sumator['domain'][d]['phylum'][p]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]={};
                       sumator['domain'][d]['phylum'][p]['klass']={};
                       sumator['domain'][d]['phylum'][p]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['knt'][i] = parseInt(biom_matrix.data[r][i]); 
                   }
               }
           }
           if(rank=='klass'){
               k = tax_items[t]
               for(i in chosen_id_name_hash.ids){
                   if(k in sumator['domain'][d]['phylum'][p]['klass']){
                       if(i in sumator['domain'][d]['phylum'][p]['klass'][k]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]['klass'][k]={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][i] = parseInt(biom_matrix.data[r][i]); 
                   }
               }
           }
           if(rank=='order'){
               o = tax_items[t]
               for(i in chosen_id_name_hash.ids){
                   if(o in sumator['domain'][d]['phylum'][p]['klass'][k]['order']){
                       if(i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][i] = parseInt(biom_matrix.data[r][i]); 
                   }
               }
           }
           if(rank=='family'){
               f = tax_items[t]
               for(i in chosen_id_name_hash.ids){
                   if(f in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family']){
                       if(i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][i] = parseInt(biom_matrix.data[r][i]); 
                   }
               }
           }
           if(rank=='genus'){
               g = tax_items[t]
               for(i in chosen_id_name_hash.ids){                   
                   if(g in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus']){
                       if(i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][i] = parseInt(biom_matrix.data[r][i]); 
                   }
               }
           }

           if(rank=='species'){
               s = tax_items[t]
               for(i in chosen_id_name_hash.ids){                   
                   if(s in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species']){
                       if(i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]={};

                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][i] = parseInt(biom_matrix.data[r][i]); 
                   }
               }
           }
           if(rank=='strain'){
               st = tax_items[t]
               for(i in chosen_id_name_hash.ids){                   
                   if(st in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']){
                       if(i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       }else{
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   }else{
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]={};
                       //sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][i] = parseInt(biom_matrix.data[r][i]); 
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
    new_matrix.rows = biom_matrix.rows;
    new_matrix.columns =[];
    new_matrix.dataset = pjds;
    new_matrix.did = chosen_id_name_hash.ids[chosen_id_name_hash.names.indexOf(pjds)];
    //console.log('did ');
    //console.log(new_matrix.did );
    //console.log(ds_name );
    //console.log(new_matrix.did ); 
    new_matrix.data = []
    new_matrix.total = 0
    new_matrix.shape = [biom_matrix.shape[0],1]
    var idx = -1;

    for(d in biom_matrix.columns){
      if(biom_matrix.columns[d].id == pjds){
      	//console.log('found idx '+biom_matrix.columns[d].name)
      	idx = d;
      	new_matrix.columns.push(biom_matrix.columns[d]);
      	//new_matrix.columns.push({"name":ds_name,"did":did});
      	break;
      }
    }


    for(n in biom_matrix.data){
      //new_matrix.rows.push(biom_matrix.rows[n].name)
      //new_matrix.data.push(biom_matrix.data[n][d])
      new_matrix.data.push([biom_matrix.data[n][d]])
      new_matrix.total += biom_matrix.data[n][d]
    }
    console.log(JSON.stringify(new_matrix))
	
  	res.render('visuals/user_viz_data/bar_single', {
        title: 'Dataset Taxonomic Data',
        ts: ts || 'default_timestamp',
  		  matrix    :           JSON.stringify(new_matrix),
  		  post_items:           JSON.stringify(visual_post_items),
  		  //chosen_id_name_hash : JSON.stringify(chosen_id_name_hash),
        html: html,
        user: req.user, hostname: req.C.hostname,
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

      				for(i in req.C.RANKS){
      					id_n_rank = rows[s][req.C.RANKS[i]+'_id']+'_'+req.C.RANKS[i];
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
    		            user: req.user, hostname: req.C.hostname,
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



router.post('/save_datasets', helpers.isLoggedIn,  function(req, res) {

  console.log('req.body: save_datasets-->>');
  console.log(req.body);
  console.log('req.body: save_datasets');
	
	var filename_path = path.join('user_data',NODE_DATABASE,req.user.username,req.body.filename);
	helpers.mkdirSync(path.join('user_data',NODE_DATABASE));  // create dir if not present
	helpers.mkdirSync(path.join('user_data',NODE_DATABASE,req.user.username)); // create dir if not present
	//console.log(filename);
	helpers.write_to_file(filename_path,req.body.datasets);
		
	res.send('OK');
  
	
});
//
//
//
router.get('/saved_datasets', helpers.isLoggedIn,  function(req, res) {
    console.log('in show_saved_datasets');
    if(req.user.username == 'guest'){
      req.flash('message', "The 'guest' user has no saved datasets");
      res.redirect('/user_data/your_data');
    }else{
      //console.log('req.body: show_saved_datasets-->>');
      //console.log(req.body);
      //console.log('req.body: show_saved_datasets');
      var saved_datasets_dir = path.join('user_data',NODE_DATABASE,req.user.username);

      file_info = {};
      modify_times = [];
      helpers.mkdirSync(saved_datasets_dir);
      fs.readdir(saved_datasets_dir, function(err, files){
          if(err){
      			
    				msg = 'ERROR Message '+err;
    				helpers.render_error_page(req,res,msg);
    			
    			
    		  }else{
      		  for (var f in files){
      	        var pts = files[f].split(':');
      	        if(pts[0] === 'datasets'){
      	          //file_info.files.push(files[f]);
      	          stat = fs.statSync(path.join(saved_datasets_dir,files[f]));
      			       file_info[stat.mtime.getTime()] = { 'filename':files[f], 'size':stat.size, 'mtime':stat.mtime }
      			       modify_times.push(stat.mtime.getTime());
      			  
      	        }
      	    }	  
      		  modify_times.sort().reverse();
      		  //console.log(JSON.stringify(file_info));
      		} 
    		  
      		res.render('visuals/saved_datasets',
      		    { title: 'saved_datasets',
      		     
      		      finfo: JSON.stringify(file_info),
      		      times: modify_times,
      		  	  message: req.flash('message'),
      		      user: req.user, hostname: req.C.hostname,
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
    var pwd = process.env.PWD || req.config.PROCESS_DIR;
    console.log(req.body)
    var options = {
      scriptPath : 'public/scripts',
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'cluster_datasets', '--site_base', process.env.PWD, '--prefix', ts],
    };
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
    
    var log = fs.openSync(path.join(pwd,'logs','node.log'), 'a');
    
    //var heatmap_process = spawn( python_exe+' '+options.scriptPath+'/distance.py', options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
    
    var cluster_process = spawn( options.scriptPath+'/distance.py', options.args, {
            env:{'PATH':req.config.PATH,'LD_LIBRARY_PATH':req.config.LD_LIBRARY_PATH},
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
                html += '/////<pre style="font-size:10px"><small>'+ascii_tree_data+'</small></pre>';

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

module.exports = router;

/**
* F U N C T I O N S
**/

// Generally put fuction in global.js or helpers.js
//
//
//


