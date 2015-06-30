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
var Readable = require('stream').Readable;

var helpers = require('../helpers/helpers');
var QUERY = require('../queries');


var COMMON  = require('./routes_common');
var META    = require('./routes_metadata');
//var PCOA    = require('./routes_pcoa');
var MTX     = require('./routes_counts_matrix');
//var HMAP    = require('./routes_distance_heatmap');
//var DEND    = require('./routes_dendrogram');
//var BCHARTS = require('./routes_bar_charts');
//var PCHARTS = require('./routes_pie_charts');
//var CTABLE  = require('./routes_counts_table');
var PythonShell = require('python-shell');
var app = express();
var d3 = require("d3");
var xmldom = require('xmldom');
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


  // GLOBAL
  console.log('metadata');
  //metadata = META.write_metadata_file(chosen_id_name_hash, visual_post_items);
  metadata = META.write_mapping_file(chosen_id_name_hash, visual_post_items);
  //metadata = JSON.parse(metadata);
  console.log(metadata);
  console.log('metadata');
  //console.log('MAP:::');
  //console.log(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank)
  //console.log(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["724_class"]["taxon"])

  //
  //uid_matrix = MTX.fill_in_counts_matrix( selection_obj, unit_field );  // just ids, but filled in zeros
  // {unit_id:[cnt1,cnt2...] // counts are in ds order
  console.log('visual_post_items:>>');
  console.log(visual_post_items);
  console.log('<<visual_post_items:');
  //console.log(biom_matrix);


  res.render('visuals/view_selection', {
                                title     :           'VAMPS: Visuals Select',
                                chosen_id_name_hash : JSON.stringify(chosen_id_name_hash),
                                matrix    :           JSON.stringify(biom_matrix),
                                metadata  :           JSON.stringify(metadata),
                                constants :           JSON.stringify(req.C),
                                post_items:           JSON.stringify(visual_post_items),
                                user      :           req.user,
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
	  console.log(JSON.stringify(METADATA))
	  //console.log(JSON.stringify(TAXCOUNTS))
	  console.log('Pulling TAXCOUNTS and METADATA ONLY for datasets selected (from files)');
	  //console.log('TAXCOUNTS= '+JSON.stringify(TAXCOUNTS));
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
	                    chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
	                    constants    : JSON.stringify(req.C),
	                    md_cust      : JSON.stringify(custom_metadata_headers),  // should contain all the cust headers that selected datasets have
		  				md_req       : JSON.stringify(required_metadata_headers),
		  				message      : req.flash(),
	                    user         : req.user
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
  console.log(ALL_DATASETS);
  TAXCOUNTS = {}; // empty out this global variable: fill it in unit_selection
  METADATA  = {}
  
  res.render('visuals/visuals_index', {
                                title    : 'VAMPS: Select Datasets',
                                rows     : JSON.stringify(ALL_DATASETS),
                                proj_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
                                constants: JSON.stringify(req.C),
	  							message  : req.flash('nodataMessage'),
                                user     : req.user
                            });
});

//
//
//
router.post('/reorder_datasets', helpers.isLoggedIn, function(req, res) {
    
	var referer = req.body.referer;
    res.render('visuals/reorder_datasets', {
                                title   : 'VAMPS: Reorder Datasets',
                                chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
                                constants    : JSON.stringify(req.C),
								referer: referer,
                                user: req.user
                            });
  //console.log(chosen_id_name_hash)
});
router.post('/view_saved_datasets', helpers.isLoggedIn, function(req, res) {

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
// Download Counts Matrix
router.post('/download_counts_matrix', helpers.isLoggedIn, function(req, res) {
	//console.log('in download_counts_matrix')
	//console.log(biom_matrix)
    var timestamp = +new Date();  // millisecs since the epoch!
    timestamp = req.user.username + '_' + timestamp;
	var out_file = "downloads/"+timestamp+"_matrix.csv.gz";
    var wstream = fs.createWriteStream(out_file);
	var gzip = zlib.createGzip();
    var rs = new Readable();
	
	header_txt = "Taxonomy ("+visual_post_items.tax_depth+" level)";
	for (var y in biom_matrix.columns){
		header_txt += ','+biom_matrix.columns[y].name;
	}
	header_txt += '\n\r';
	rs.push(header_txt);
	for (var i in biom_matrix.rows){
		row_txt = '';
		row_txt += biom_matrix.rows[i].name;
		for (var k in biom_matrix.data[i]){
			row_txt += ','+biom_matrix.data[i][k];
		}
		row_txt += '\n\r';
		rs.push(row_txt);
	}
	rs.push('\n\r');
	rs.push(null);
  	rs
	  .pipe(gzip)
      .pipe(wstream)
      .on('finish', function () {  // finished
        console.log('done compressing and writing file');
      });
});
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
    var biom_file = path.join(__dirname, '../../tmp/'+biom_file_name);

    //console.log('mtx1')

  //mtx = COMMON.run_pyscript_cmd(req,res, ts, biom_file, 'heatmap', metric);
    var exec = require('child_process').exec;
    //var PythonShell = require('python-shell');
    var html = '';
    var title = 'VAMPS';

    var distmtx_file_name = ts+'_distance.csv';
    var distmtx_file = path.join(process.env.PWD,'tmp',distmtx_file_name);
    
    var options = {
      scriptPath : 'public/scripts',
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'dheatmap', '--site_base', process.env.PWD, '--prefix', ts],
    };
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
    PythonShell.run('distance.py', options, function (err, mtx) {
      if (err) {
  		  res.send(err);
  	  }else{
	      distance_matrix = JSON.parse(mtx);
	      //console.log('dmtx');
		  //console.log(chosen_id_name_hash);
	      //console.log(distance_matrix);
	      var m = JSON.stringify(mtx);
		  var ids = {}
		  for(i in chosen_id_name_hash.names){
		  	
		  }
		  for(pjds in distance_matrix){
		  	console.log(pjds)
			  var ds = pjds.split('--')[1]
			  var did = DATASET_ID_BY_DNAME[ds];
			  ids[pjds] = did 
		  }
		  //console.log(ids)
	      res.render('visuals/partials/load_distance',{
	                                        dm        : distance_matrix,
			  								hash   	  : JSON.stringify(chosen_id_name_hash),			  							
	                                        constants : JSON.stringify(req.C),
	                                      });
	  }
    });

});

//
//   F R E Q U E N C Y  H E A T M A P
//
router.post('/frequency_heatmap', helpers.isLoggedIn, function(req, res) {

  console.log('in Freq HP');
  var ts = req.body.ts;
  var metric = req.body.metric;
  var biom_file_name = ts+'_count_matrix.biom';
  var biom_file = path.join(process.env.PWD, 'tmp',biom_file_name);

  var exec = require('child_process').exec;
  //var PythonShell = require('python-shell');
  var html = '';
  var title = 'VAMPS';

  var distmtx_file_name = ts+'_distance.csv';
  var distmtx_file = path.join(process.env.PWD,'tmp',distmtx_file_name);
  

  var fheatmap_script_file = path.resolve(process.env.PWD, 'public','scripts','fheatmap.R');

  shell_command = [req.C.RSCRIPT_CMD, fheatmap_script_file, biom_file, visual_post_items.selected_distance, visual_post_items.tax_depth, ts ].join(' ');

  COMMON.run_script_cmd(req, res, ts, shell_command, 'fheatmap');


});
router.post('/dendrogram', helpers.isLoggedIn, function(req, res) {
    console.log('found routes_dendrogram');

    //console.log('req.body dnd');
    //console.log(req.body);
    //console.log('req.body dnd');
    var ts = req.body.ts;
    var metric = req.body.metric;
	var script = req.body.script; // python, phylogram or phylonator
    var image_type = req.body.image_type;  // png(python script) or svg
    // see:  http://bl.ocks.org/timelyportfolio/59acc3853b02e47e0dfc
	
	var biom_file_name = ts+'_count_matrix.biom';
    var biom_file = path.join(process.env.PWD,'tmp',biom_file_name);


    var exec = require('child_process').exec;
    //var PythonShell = require('python-shell');
    var html = '';
    var title = 'VAMPS';

    var distmtx_file_name = ts+'_distance.csv';
    var distmtx_file = path.join(process.env.PWD,'tmp',distmtx_file_name);
    

    var options = {
      scriptPath : 'public/scripts',
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'dendrogram-'+image_type, '--site_base', process.env.PWD, '--prefix', ts ],
    };
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '));

    PythonShell.run('distance.py', options, function (err, output) {
      if (err) {
		  res.send(err);  // for now we'll send errors to the browser
	  }else{
	      function buildNewickNodes(node, callback) {
	        newickNodes.push(node);
	        if (node.branchset) {
	          for (var i=0; i < node.branchset.length; i++) {
	            buildNewickNodes(node.branchset[i]);
	          }
	        }
	      }
		  var viz_width = 1200;
		  var viz_height = (visual_post_items.no_of_datasets*12)+100;
	      //var m = JSON.stringify(mtx)
	      var html;
	      if(image_type == 'svg'){
	        //console.log(JSON.parse(output))
  			var d3 = require("d3");
  			var xmldom = require('xmldom');
  			var Newick    = require(path.join(process.env.PWD,'public','javascripts','newick'));
			var div_width = 1200;
  			newick = JSON.parse(output);
  			//console.log('Newick ',newick)
  			var json  = Newick.parse(newick);
  			//console.log(JSON.stringify(json,null,4))
  			var newickNodes = [];

  			buildNewickNodes(json);
			
			if(script == 'phylogram'){
				var Phylogram = require(path.join(process.env.PWD,'public','javascripts','d3.phylogram'));
				var tree_data = d3.phylogram.build('body', json, {
				  width: viz_width-400,   // minus 400 is for padding on right to view dataset names
				  height: viz_height
				});
			}else if(script == 'phylonator'){
				var Phylogram = require(path.join(process.env.PWD,'public','javascripts','d3.phylonator'));
				var tree_data = d3.phylonator.build('body', json, {
				  width: viz_width-400,    // minus 400 is for padding on right to view dataset names
				  height: viz_height,
				  skipBranchLengthScaling: true
				});
			}

			//console.log('Newick2 ')
			
			//console.log('Newick3 ')
			var svgXML = (new xmldom.XMLSerializer()).serializeToString( tree_data.vis[0][0] );
			//console.log('Newick4 ')
			html = "<svg height='"+viz_height+"' width='100%'>"+svgXML+"</svg>";

			d3.select('svg').remove();

			//console.log(html);

	      }else{
	        var image = '/tmp_images/'+ts+'_dendrogram.pdf';
	        html = "<div id='pdf'>";
	        html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='100%' height='"+viz_height+"' />";
	        html += " <p>ERROR in loading pdf file</p>";
	        html += "</object></div>";
	      }
	      //html = viz_height
          res.send(html);
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
    
    
    var exec = require('child_process').exec;
    if(image_type == '2d'){
        
        var options = {
          scriptPath : 'public/scripts',
          args :       [ '-in', biom_file, '-metric', metric, '--function', 'pcoa', '--site_base', process.env.PWD, '--prefix', ts],
        };
        console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
        PythonShell.run('distance.py', options, function (err, pcoa_data) {
          if (err) {
    		  res.send('ERROR '+err); // for now we'll send errors to the browser
    	  }else{
    	      //console.log(pcoa_data)
    	      //pcoa_data = JSON.parse(pcoa_data)
    	      //console.log(pcoa_data);

    	      var image = '/tmp_images/'+ts+'_pcoa.pdf';
    	      var html = "<div id='pdf'>";
    	      html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='1000' height='900' />";
    	      html += " <p>ERROR in loading pdf file</p>";
    	      html += "</object></div>";
    	      //console.log(html);
              
    	      res.send(html);
      	}

        });       
        
        
    }else if(image_type == '3d'){
        
        var mapping_file_name = ts+'_metadata.txt';
        var mapping_file = path.join(process.env.PWD,'tmp', mapping_file_name);        
        var pc_file_name = ts+'.pc';
        var pc_file = path.join(process.env.PWD,'tmp', pc_file_name);
        
        var dir_name = ts+'_pcoa_3d';
        var dir_path = path.join(process.env.PWD,'tmp', dir_name);
        
        var html_path = path.join(dir_path, 'index.html');  // file to be created by make_emperor.py script
        //var html_path2 = path.join('../','tmp', dir_name, 'index.html');  // file to be created by make_emperor.py script
        var options1 = {
          scriptPath : 'public/scripts',
          args :       [ '-i', biom_file, '-metric', metric, '--function', 'pcoa_3d', '--site_base', process.env.PWD, '--prefix', ts],
        };
        var options2 = {
          //scriptPath : req.C.PATH_TO_QIIME_BIN,
            scriptPath : 'public/scripts',
          args :       [ '-i', pc_file, '-m', mapping_file, '-o', dir_path],
        };
        console.log(options1.scriptPath+'/distance.py '+options1.args.join(' '));
        PythonShell.run('distance.py', options1, function (err, pcoa_data) {
          if (err) {
    		  res.send('ERROR-1 '+err); // for now we'll send errors to the browser
    	  }else{
    	      //console.log(pcoa_data)
    	      //pcoa_data = JSON.parse(pcoa_data)
    	      //console.log(pcoa_data);
              console.log(options2.scriptPath+'/make_emperor.py '+options2.args.join(' '));
              PythonShell.run('make_emperor.py', options2, function (err, pcoa_data) {
                  if (err) {
            		  res.send('ERROR-2 '+err); // for now we'll send errors to the browser
            	  }else{
                        
                      console.log(html_path);
                        open('file:///'+html_path);
                        res.send("Done - <a href='https://github.com/biocore/emperor' target='_blank'>Emperor</a> should open a new window in your default browser.");

                  }
              });
    	      
      	  }

        });
        
    }
    
});
//
// P C O A
//
router.post('/dbrowser', helpers.isLoggedIn, function(req, res) {
    var ts = req.body.ts;
    console.log('in dbrowser');
    //console.log(JSON.stringify(biom_matrix,null,2));
    
    var max_total_count = Math.max.apply(null, biom_matrix.column_totals);
    //console.log('column_totals '+biom_matrix.column_totals);
    //console.log('max_total_count '+max_total_count.toString());
    var html = "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Strict//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'>\n";
    html += "<html xmlns='http://www.w3.org/1999/xhtml' xml:lang=\"en\" lang=\"en\">\n";
    html += "<head>\n";
    html += " <meta charset=\"utf-8\"/>\n";
    html += " <link rel='shortcut icon' href='../public/images/favicon.ico' />\n";
    html += " <script id=\"notfound\">window.onload=function(){document.body.innerHTML=\"Could not get resources from 'http://krona.sourceforge.net'.\"}</script>\n";
    html += " <script src=\"../public/javascripts/krona-2.0.js\"></script>\n";
    html += "</head>\n";
    html += "<body>\n";
    html += " <img id='hiddenImage' src='../public/images/hidden.png' style='display:none' />\n";
    html += " <noscript>Javascript must be enabled to view this page.</noscript>\n";
    html += " <div style='display:none'>\n";
    html += "  <krona  collapse='false' key='true'>\n";
    html += "  <attributes magnitude='seqcount'>\n";
    html += "  <attribute display='Abundance'>seqcount</attribute>\n";
    html += "  <attribute display='Rank' mono='true'>rank</attribute>\n";
    html += "  </attributes>\n";
    html += "  <color attribute='seqcount' valueStart='0' valueEnd='"+max_total_count.toString()+"' hueStart='120' hueEnd='240'></color>\n";
    html += "  <datasets>\n";
    for(i in chosen_id_name_hash.names){
        html += "    <dataset>"+chosen_id_name_hash.names[i]+"</dataset>\n";
    }
    html += "  </datasets>\n";
    html += "  <node id='dataset_name' name='root'>\n";
	html += "   <seqcount>";
    for(i in chosen_id_name_hash.names){
        html += "<val>"+biom_matrix.column_totals[i].toString()+"</val>";
    }
    html += "</seqcount>\n";
   
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
            //var pnode_name =  getLastPart(pname)
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
                //var knode_name =  getLastPart(kname)
                html += "  <node name='"+k+"'>\n";
                html += "   <seqcount>";
                for(c_klass in sumator['domain'][d]['phylum'][p]['klass'][k]['knt']){
                    html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][c_klass].toString()+"</val>";
                }
                html += "</seqcount>\n";
                html += "   <rank><val>klass</val></rank>\n";

                // #### ORDER ####
                for(o in sumator['domain'][d]['phylum'][p]['klass'][k]['order']){
                    //var onode_name =  getLastPart(oname)
                    html += "   <node name='"+o+"'>\n";
                    html += "    <seqcount>";
                    for(c_order in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt']){
                        html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][c_order].toString()+"</val>";
                    }
                    html += "</seqcount>\n";
                    html += "    <rank><val>order</val></rank>\n";

                    // #### FAMILY ####
                    for(f in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family']){
                        //var fnode_name =  getLastPart(fname)
                        html += "    <node name='"+f+"'>\n";
                        html += "     <seqcount>";
                        for(c_family in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt']){
                            html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][c_family].toString()+"</val>";
                        }
                        html += "</seqcount>\n";
                        html += "     <rank><val>family</val></rank>\n";

                        // #### GENUS ####
                        for(g in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus']){
                            //var gnode_name =  getLastPart(gname)
                            html += "     <node name='"+g+"'>\n";
                            html += "      <seqcount>";
                            for(c_genus in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt']){
                                html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][c_genus].toString()+"</val>";
                            }
                            html += "</seqcount>\n";
                            html += "      <rank><val>genus</val></rank>\n";

                            // #### SPECIES ####

        ///// TODO TODO //////

                            html += "     </node>\n";
                        }
                        html += "    </node>\n";
                    }
                    html += "   </node>\n";
                }
                html += "  </node>\n";
            }
            html += " </node>\n";
        }       
        html += "</node>\n";
    }    
    html += "  </node>\n";
    html += "  </krona>\n";
    html += " </div></body></html>\n";
    // write html to a file and open it like Emperor
    
    
    var file_name = ts+'_krona.html';
    var html_path = path.join(process.env.PWD,'tmp', file_name);
    console.log(html_path);
    fs.writeFile(html_path,html,function(err){
        if(err){
            res.send(err)
        }else{
            console.log('opening file:///'+html_path)
            open('file:///'+html_path);
            res.send("Done - <a href='http://sourceforge.net/projects/krona/' target='_blank'>Krona Hierarchical Data Browser</a> should open a new window in your default browser.");
        }
    })
    
});
function get_sumator(req){
    
    var sumator = {};
    sumator['domain']={};
    var did = chosen_id_name_hash.ids[i];
    var dname = chosen_id_name_hash.names[i];
    
    for(r in biom_matrix.rows){
        tax_string = biom_matrix.rows[r].name;
        tax_items = tax_string.split(';');
        key = tax_items[0];
        console.log(tax_items);
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
         }
    }
    return sumator;
}


// function getLastPart(str) {
//     var i = str.split(';');
//     return i[i.length-1];
// }
//
//  G E O S P A T I A L
//
router.get('/user_viz_data/geospatial', helpers.isLoggedIn, function(req, res) {
  var myurl = url.parse(req.url, true);

  var ts    = myurl.query.ts;
  var html  = COMMON.start_visuals_html('geospatial');

  res.render('visuals/user_viz_data/geospatial', {
            title: 'VAMPS Geospatial Data',
            timestamp: ts || 'default_timestamp',
            html : html+"<h2>Not Coded Yet</h2>",
            user: req.user
      });
});

//
// B A R - C H A R T  -- S I N G L E
//
router.get('/bar_single', helpers.isLoggedIn, function(req, res) {
    var myurl = url.parse(req.url, true);
    //console.log('in piechart_single'+myurl)
    var ts = myurl.query.ts;
    var did = myurl.query.did;
	var pid = PROJECT_ID_BY_DID[did]
	//PROJECT_INFORMATION_BY_PID[pid].project
	var ds_name = PROJECT_INFORMATION_BY_PID[pid].project+'--'+DATASET_NAME_BY_DID[did];
    //var html  = COMMON.start_visuals_html('piechart');
	var html  = 'My HTML';

    //html += PCHARTS.create_single_piechart_html ( ts, ds_name, res );
    
    var new_matrix={}
	new_matrix.rows = biom_matrix.rows;
	new_matrix.columns =[];
	new_matrix.dataset = ds_name;
	new_matrix.did = did;
	new_matrix.data = []
	new_matrix.total = 0
	new_matrix.shape = [biom_matrix.shape[0],1]
	var idx = -1;
	
	for(d in biom_matrix.columns){
		if(biom_matrix.columns[d].did == did){
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
          user: req.user
        });

});

router.get('/sequences/', helpers.isLoggedIn, function(req, res) {
	var myurl = url.parse(req.url, true);
	var tax = myurl.query.taxa;
	var did = myurl.query.did;
	var pid = PROJECT_ID_BY_DID[did]
	//PROJECT_INFORMATION_BY_PID[pid].project
	var ds_name = PROJECT_INFORMATION_BY_PID[pid].project+'--'+DATASET_NAME_BY_DID[did];
	//console.log('in sequences '+tax)

	//var q = QUERY.get_sequences_perDID_and_taxa_query(did,tax);
	
	connection.db.query(QUERY.get_sequences_perDID_and_taxa_query(did,tax), function(err, rows, fields){
	  
	      if (err)  {
	  		  console.log('Query error: ' + err);
	  		  console.log(err.stack);
	  		  process.exit(1);
	      } else {
		  	//console.log(rows)
			//console.log(JSON.stringify(rows))
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
				//rows[s].tax = domain+';'+phylum+';'+klass;
// 				  console.log(seqcomp);
 				  //seq = zlib.Inflate(seqcomp.toString('utf8'))
				  //console.log(JSON.stringify(seq))
			  }
			
			res.render('visuals/user_viz_data/sequences', {
		            title: 'Sequences',
		            ds : ds_name,
		            tax : tax,
				    rows : JSON.stringify(rows),
		            user: req.user
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
		  console.log(JSON.stringify(file_info));
		} 
		  
		res.render('visuals/saved_datasets',
		    { title: 'saved_datasets',
		     
		      finfo: JSON.stringify(file_info),
		      times: modify_times,
		  	  message: req.flash('message'),
		      user: 	req.user
		});
			//}
	
    });
	
});
//
//  R E S E T
//
router.post('/reset', helpers.isLoggedIn,  function(req, res) {
	var html = '';
    html += "<table id='drag_table' class='table table-condensed' >"
    for (var i in chosen_id_name_hash.names){
         html += "<tr class='tooltip_row'>";
         html += "<td class='dragHandle' id='"+chosen_id_name_hash.ids[i]+"--"+chosen_id_name_hash.names[i]+"'> ";
		 html += "<input type='hidden' name='ds_order[]' value='"+chosen_id_name_hash.ids[i]+"'>";
         html += (parseInt(i)+1).toString()+" - "+chosen_id_name_hash.names[i] + " (id:"+ chosen_id_name_hash.ids[i]+")"
         html += "</td>";
         html += "</tr>";
     }  
    html += "</table>";	
	res.send(html)
});
//
// A L P H A B E T I Z E
//
router.post('/alphabetize', helpers.isLoggedIn,  function(req, res) {
	
	var html = '';
    html += "<table id='drag_table' class='table table-condensed' >"
	var names = chosen_id_name_hash.names.slice()  // slice make an independant copy of the array
	var ids = chosen_id_name_hash.ids.slice()      // rather than copy reference
	
    names.sort()
	for (var i in names){
		id = ids[chosen_id_name_hash.names.indexOf(names[i])]
		 html += "<tr class='tooltip_row'>";
         html += "<td class='dragHandle' id='"+ id +"--"+names[i]+"'> ";
		 html += "<input type='hidden' name='ds_order[]' value='"+ id +"'>";
         html += (parseInt(i)+1).toString()+" - "+names[i] + " (id:"+ id +")"
         html += "</td>";
         html += "</tr>";
     }  
    html += "</table>";	
	res.send(html)
});

module.exports = router;

/**
* F U N C T I O N S
**/

// Generally put fuction in global.js or helpers.js
//
//
//


