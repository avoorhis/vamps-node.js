var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var path  = require('path');
var fs   = require('fs-extra');
var ini = require('ini');
var iniparser = require('iniparser');
var PythonShell = require('python-shell');
var zlib = require('zlib');
var Readable = require('stream').Readable;
//
//
//
router.get('/your_data',  function(req,res){
  console.log('in your data');
    res.render('user_data/your_data', {        
      title: 'VAMPS:Data Administration',
      user: req.user
       });
});

/* GET Export Data page. */
router.get('/file_retrieval', helpers.isLoggedIn, function(req, res) {

    var export_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
    var mtime = {};
    var size = {};
    var file_info = {};
    file_info.mtime ={};
    file_info.size = {};
    file_info.files = [];
    fs.readdir(export_dir, function(err, files){
      for (var f in files){
        var pts = files[f].split(':');
        if(pts[0] === 'metadata' || pts[0] === 'fasta'){
          file_info.files.push(files[f]);
          stat = fs.statSync(export_dir+'/'+files[f]);
          file_info.mtime[files[f]] = stat.mtime;  // modify time
          file_info.size[files[f]] = stat.size;
        }
      }
      //console.log(file_info)
      res.render('user_data/file_retrieval', { title: 'VAMPS:Export Data',
                           user: req.user,
                           finfo: JSON.stringify(file_info),
							message : req.flash('message'),
                          });
    });
});
//
//
/* GET Import Data page. */
router.get('/import_data', helpers.isLoggedIn, function(req, res) {
    res.render('user_data/import_data', { 
	    title: 'VAMPS:Import Data',
  		message: req.flash('successMessage'),
	    failmessage: req.flash('failMessage'),
          user: req.user
                          });
});

//
//
//
router.get('/export_data', helpers.isLoggedIn, function(req, res) {
    res.render('user_data/export_data', { title: 'VAMPS:Import Data',
                           user: req.user
                          });
});
//
//
//
router.get('/user_project_info/:id', helpers.isLoggedIn, function(req, res) {
    console.log(req.params.id);
	var project = req.params.id;
    var config_file = path.join('user_data',NODE_DATABASE,req.user.username,'project:'+project,'config.ini');
	var config = ini.parse(fs.readFileSync(config_file, 'utf-8'));
	console.log(config)
	res.render('user_data/profile', { 
			project : project,
			pinfo   : JSON.stringify(config),
			title   : project,
	        user    : req.user 
         });
});
//
//
//
router.get('/delete_project/:project/:kind', helpers.isLoggedIn,  function(req,res){
	
	var delete_kind = req.params.kind;
	var project = req.params.project;
	console.log('in delete_project: '+project+' - '+delete_kind);
	console.log(JSON.stringify(PROJECT_INFORMATION_BY_PNAME));
	if(project in PROJECT_INFORMATION_BY_PNAME){
		var pid = PROJECT_INFORMATION_BY_PNAME[project].pid;
	
	
		console.log('in delete_project: '+project+' - '+pid);
	
		if(delete_kind == 'all'){
			// must delete pid data from mysql ()
			// and all datasets files
			var options = {
		      scriptPath : 'public/scripts',
		      args :       [ '-pid', pid, '-db', NODE_DATABASE, '--action', 'delete_project' ],
		    };
			var spawn = require('child_process').spawn;
			var log = fs.openSync(path.join(process.env.PWD,'logs','node.log'), 'a');
			// script will remove data from mysql and datset taxfile
			var delete_process = spawn( options.scriptPath+'/node_script_utils.py', options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
			var output = '';
			delete_process.stdout.on('data', function (data) {
			  //console.log('stdout: ' + data);
			  data = data.toString().replace(/^\s+|\s+$/g, '');
			  output += data;
			  var lines = data.split('\n')
			  for(var n in lines){
			  	//console.log('line: ' + lines[n]);
				if(lines[n].substring(0,4) == 'PID='){
					console.log('pid line '+lines[n]);
				}
			  }
			});
		 
			delete_process.on('close', function (code) {
			   console.log('delete_process process exited with code ' + code);
			   var ary = output.split("\n");
			   var last_line = ary[ary.length - 1];
			   if(code == 0){
				   console.log('GAST Success');
				   //console.log('PID last line: '+last_line)
				   var ll = last_line.split('=');
				   var pid = ll[1];
				   console.log('GOT NEW PID=: '+pid);
				   console.log('ALL_DATASETS1: '+JSON.stringify(ALL_DATASETS));
			   
				   helpers.update_global_variables(pid, 'del');
				   console.log('ALL_DATASETS2: '+JSON.stringify(ALL_DATASETS));
				   
			   }else{
			   	  // python script error
			   }
		   
		    });
		
		
		}else if(delete_kind == 'tax_only'){
		
		}else{
			console.log('ERROR')
		}
	}else{
		// project not in db?
		console.log('project was not found in db: PROJECT_INFORMATION_BY_PNAME')
		
	}
    console.log('req.body: dele-->>');
    console.log(req.user.username);
    console.log('req.body: del');
		   // still need to delete directoru in user_data:
		   var project_data_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project:'+project);
		   console.log('project_data_dir '+project_data_dir)
		   if(fs.lstatSync(project_data_dir).isDirectory()){
			   console.log('is DIR')
			   fs.remove(project_data_dir, function (err) {
 				     if (err) {
 				        console.error(err);
				 		req.flash('failmessage', 'Error removing'+project+' Here is the error: '+err);
				       	res.redirect("/user_data/your_projects");
 				     }else{
 				     	console.log('DELETED: '+project_data_dir)
				 		req.flash('successmessage', 'Completely Removing '+project);
				       	res.redirect("/user_data/your_projects");
						 
 				     }
 				   });
		   }else{
		   		console.log('is NOT DIR')
		
		   }
	
});
router.get('/start_assignment/:project/:method', helpers.isLoggedIn,  function(req,res){
    
	var queries = require('./queries');
	console.log(req.params.project);
	var project = req.params.project;
	var method = req.params.method;
	console.log('start: '+project+' - '+method);
	//var base_dir = path.join(process.cwd(),'user_data',NODE_DATABASE,req.user.username,'project:'+project);
	var data_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project:'+project);
	var process_dir = process.env.PWD;
	var data = ''
	
	console.log('PROJECT_INFORMATION_BY_PID0: '+JSON.stringify(PROJECT_INFORMATION_BY_PID));
	
	var config_file = path.join(data_dir,'config.ini');
  	
	if(method == 'gast'){
		
		var gast_options = {
	      scriptPath : req.C.PATH_TO_SCRIPTS,
	      args :       [ '--classifier','gast', '--config', config_file, '--process_dir',process_dir, '--data_dir', data_dir, '-db', NODE_DATABASE ],
	    };
	    console.log(gast_options.scriptPath+'/node_script_assign_taxonomy.py '+gast_options.args.join(' '));
		
		var spawn = require('child_process').spawn;
		var log = fs.openSync(path.join(data_dir,'node.log'), 'a');
		var gast_process = spawn( gast_options.scriptPath+'/node_script_assign_taxonomy.py', gast_options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr


		// python.stderr.on('data', function (data) {
		//   console.log('stderr: ' + data);
		// });
		//
		// python.stdout.on('data', function (data) {
		//   console.log('python stdout ' + data);
		// });
		//
		// python.stderr.on('data', function (data) {
		//   console.log('python stderr: ' + data);
		// });
		var output = ''
		// communicating with an external python process
		// all the print statements in the py script are printed to stdout
		// so you can grab the projectID here at the end of the process.
		// use looging in the script to log to a file.
		gast_process.stdout.on('data', function (data) {
		  //console.log('stdout: ' + data);
		  data = data.toString().replace(/^\s+|\s+$/g, '');
		  output += data;
		  var lines = data.split('\n')
		  for(var n in lines){
		  	//console.log('line: ' + lines[n]);
			if(lines[n].substring(0,4) == 'PID='){
				console.log('pid line '+lines[n]);
			}
		  }
		});
		 
		gast_process.on('close', function (code) {
		   console.log('gast_process process exited with code ' + code);
		   var ary = output.split("\n");
		   var last_line = ary[ary.length - 1];
		   if(code == 0){
			   console.log('GAST Success');
			   //console.log('PID last line: '+last_line)
			   var ll = last_line.split('=');
			   var pid = ll[1];
			   console.log('GOT NEW PID=: '+pid);
			   console.log('ALL_DATASETS: '+JSON.stringify(ALL_DATASETS));
			   if(helpers.isInt(pid)){
				   connection.db.query(queries.get_select_datasets_queryPID(pid), function(err, rows, fields){			       
					   if (err)  {
				 		  console.log('Query error: ' + err);
				 		  console.log(err.stack);
				 		  process.exit(1);
				       } else {
						   console.log('query ok '+JSON.stringify(rows));
				           helpers.run_select_datasets_query(rows);
					       console.log(' UPDATED ALL_DATASETS');
					       console.log(' UPDATED PROJECT_ID_BY_DID');
						   
					       console.log(' UPDATED PROJECT_INFORMATION_BY_PID');
					       console.log(' UPDATED PROJECT_INFORMATION_BY_PNAME');
					       console.log(' UPDATED DATASET_IDS_BY_PID');
					       console.log(' UPDATED DATASET_NAME_BY_DID');
					   } // end else
				       
				   });
			   
				   //
				   connection.db.query(queries.get_select_sequences_queryPID(pid), function(err, rows, fields){  			     
				       if (err)  {
				 		  	console.log('Query error: ' + err);
				 		  	console.log(err.stack);
				 		  	process.exit(1);
				       } else {        
				         	helpers.run_select_sequences_query(rows);
  				       	 	console.log(' UPDATED ALL_DCOUNTS_BY_DID');
  				       	 	console.log(' UPDATED ALL_PCOUNTS_BY_PID '+JSON.stringify(ALL_PCOUNTS_BY_PID));
		 				   var mdv_file = path.join(process_dir,'public','json','metadata--' + NODE_DATABASE+'.json')
		 				   
				       }
				       
				   });
				   
					// 			   		var options = {
					// 			   	      scriptPath : 'public/scripts',
					// 			   	      args :       [ '--pid',pid, '-db', NODE_DATABASE, '--add',  ],
					// 			   	    };
					// 			   		var counts_process = spawn( options2.scriptPath+'/process_add_project_taxcounts.py', options2.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
					//
					// counts_process.stdout.on('data', function (data) {
					// 			   		  console.log('counts_process stdout: ' + data);
					//
					// 			   		});
					// 			   		counts_process.on('close', function (code) {
					// 			   		   console.log('counts_process.py process exited with code ' + code);
					// 			   	    });// end counts_process ON Close
	           }else{ // end if int
				    console.log('ERROR pid is not an integer: '+pid)
			   }
		   }else{
		   		// ERROR
			   console.log('ERROR last line: '+last_line)
	   	  		//req.flash('message', 'Script Error');
	         	//res.redirect("/user_data/your_projects");
		   }
		});  // end gast_process ON Close
		
		
	  	
		// called imediately
		req.flash('successMessage', 'GAST has been started for '+project);
      	res.redirect("/user_data/your_projects");
		
	}else{
		var rdp_options = {
	      scriptPath : req.C.PATH_TO_SCRIPTS,
	      args :       [ '--classifier','rdp', '--config', config_file, '--process_dir',process_dir, '--data_dir', data_dir, '-db', NODE_DATABASE ],
	    };
	    console.log(rdp_options.scriptPath+'/node_script_assign_taxonomy.py '+rdp_options.args.join(' '));
		
		var spawn = require('child_process').spawn;
		var log = fs.openSync(path.join(data_dir,'node.log'), 'a');
		var gast_process = spawn( rdp_options.scriptPath+'/node_script_assign_taxonomy.py', rdp_options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
		
		req.flash('successMessage', 'RDP has been started for '+project);
		res.redirect("/user_data/your_projects");
		
	}
	
	
});
//
//
//
router.get('/your_projects', helpers.isLoggedIn,  function(req,res){
  
    var user_projects_base_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
   
	project_info = {};
	modify_times = [];
    fs.readdir(user_projects_base_dir, function(err, items){
		if(err){		  
			msg = 'ERROR Message '+err;
			helpers.render_error_page(req,res,msg);
		  
		}else{
		  for (var d in items){
	        var pts = items[d].split(':');
	        if(pts[0] === 'project'){
				
				var project_name = pts[1];
  	          	var stat_dir = fs.statSync(path.join(user_projects_base_dir,items[d]));
			  
  			  if(stat_dir.isDirectory()){
  				  // stat.mtime.getTime() is for sorting to list in oreder
  				  
  				  // need to read config file
  				  // check status?? dir strcture: analisis/gast/<ds>
  				  var config_file = path.join(user_projects_base_dir,items[d],'config.ini');
				  
				  try{
					  var stat_config = fs.statSync(config_file);
	  				  console.log('1 ',config_file)
			 		 var config = iniparser.parseSync(config_file)
			      
			      	
	  				  project_info[stat_dir.mtime.getTime()] = {}
	  				  modify_times.push(stat_dir.mtime.getTime());
					  console.log('2 ',config_file)
  				  	  
  				  	  project_info[stat_dir.mtime.getTime()].config = config;
  				  	  project_info[stat_dir.mtime.getTime()].directory = items[d];
  				  	  project_info[stat_dir.mtime.getTime()].mtime = stat_dir.mtime;
					  if(project_name in PROJECT_INFORMATION_BY_PNAME){
					  		project_info[stat_dir.mtime.getTime()].pid = PROJECT_INFORMATION_BY_PNAME[project_name].pid;
							project_info[stat_dir.mtime.getTime()].status = 'Taxonomic Data Available';
					  }else{
						  project_info[stat_dir.mtime.getTime()].pid = 0;
						  project_info[stat_dir.mtime.getTime()].status = 'No Taxonomic Assignments Yet'
					  }
					  
				  }
				  catch (err) {
				  	console.log('nofile ',err)
				  }
				  

  			  	 
  			  }
				
				
				
	          
			  // 	          stat = fs.statSync(path.join(user_projects_base_dir,items[d]));
			  // if(stat.isDirectory()){
			  // 				  // stat.mtime.getTime() is for sorting to list in oreder
			  // 				  project_info[stat.mtime.getTime()] = {}
			  // 				  modify_times.push(stat.mtime.getTime());
			  // 				  // need to read config file
			  // 				  // check status?? dir strcture: analisis/gast/<ds>
			  // 				  var config_file = path.join(user_projects_base_dir,items[d],'config.ini');
			  // 				  console.log(config_file)
			  // 				  fs.ensureFile(config_file, function (err) {
			  // 				  	var config = ini.parse(fs.readFileSync(config_file, 'utf-8'));
			  // 				  	project_info[stat.mtime.getTime()].config = config;
			  // 				  	project_info[stat.mtime.getTime()].directory = items[d];
			  // 				  	project_info[stat.mtime.getTime()].mtime = stat.mtime;
			  // 	  })
			  // }
			  
			  
	        }
	      }
	  
		  modify_times.sort().reverse();
		  
		  console.log(JSON.stringify(project_info));
		  res.render('user_data/your_projects',
		    { title: 'User Projects',
		     
		      pinfo: JSON.stringify(project_info),
		      times: modify_times,
		  	  env_sources :   JSON.stringify(req.C.ENV_SOURCE),
		  	  failmessage : req.flash('failMessage'),
		  	  successmessage : req.flash('successMessage'),
		      user: 	req.user
		    });
		}  // readdir/err
	
    });  // readdir
   
});
//
//
//
router.post('/upload_data',  function(req,res){
    
  console.log('req.body upload_data');
    console.log(req.body);
  console.log(req.files);
    console.log('req.body upload_data');
  if(req.body.project == '' || req.body.project == undefined){
	req.flash('failMessage', 'A project name is required.');
	res.redirect("/user_data/import_data");
  }
  var data_repository = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project:'+req.body.project);
  console.log(data_repository);
  // continuity checks:
  
	 
  if(req.files.fasta==undefined || req.files.fasta.size==0){
  	req.flash('failMessage', 'A fasta file is required.');
	res.redirect("/user_data/import_data");
  }else if(req.files.metadata==undefined || req.files.metadata.size==0 || req.files.metadata.mimetype !== 'text/csv'){
  	req.flash('failMessage', 'A metadata csv file is required.');
	res.redirect("/user_data/import_data");
  }else{
	var project = req.body.project;
	var original_fastafile = path.join('./user_data', NODE_DATABASE, 'tmp', req.files.fasta.name);
	var original_metafile  = path.join('./user_data', NODE_DATABASE, 'tmp', req.files.metadata.name);
	//console.log(original_fastafile);
	//console.log(original_metafile);
 	// move files to user_data/<username>/ and rename
  	fs.move(original_fastafile, path.join(data_repository,'fasta.fa'), function (err) {
    	if (err) {
			req.flash('failMessage', '1-File move failure  '+err);
			res.redirect("/user_data/import_data");
		}
  	fs.move(original_metafile,  path.join(data_repository,'meta.csv'), function (err) {
    	if (err) {
			req.flash('failMessage', '2-File move failure '+err);
			res.redirect("/user_data/import_data");
		}
		// create a config file and analysis/gast/<ds> directory tree
		// run python script "load_trimmed_data.py"
		//
	    
		if(req.body.type == 'single'){
			var options = {
		      scriptPath : 'public/scripts',
		      args :       [ '-dir', data_repository, '-t', 'single', '-d', req.body.dataset ],
		    };
	  	}else if(req.body.type == 'multi') {
	  		console.log('Multi-in upload_data');
				var options = {
			      scriptPath : 'public/scripts',
			      args :       [ '-dir', data_repository, '-t', 'multi' ],
			    };
  
	  	}else{
	  	  	// ERROR
	  		  console.log('ERROR-in upload_data')
	  	}
		
	    console.log(options.scriptPath+'/load_trimmed_data.py '+options.args.join(' '));

	    PythonShell.run('load_trimmed_data.py', options, function (err, output) {
	      if (err) {
			  req.flash('failMessage', 'Script Failure '+err);
			  res.redirect("/user_data/import_data");  // for now we'll send errors to the browser
		  }else{
			  req.flash('successMessage', 'Upload in Progress: '+ req.body.project);
		      res.render('success',{
		                    title   : 'VAMPS: Success',                                
							message : req.flash('successMessage'),
		                    user: req.user                        
		              });
		  }
		  
	    });
		
  	});
	});
  } 
	
});
//
//
//
router.get('/file_utils', helpers.isLoggedIn, function(req, res){

	console.log('in file_utils');
	//console.log(req.query.filename);
	var user = req.query.user;
	var file = path.join(process.env.PWD,'user_data',NODE_DATABASE,user,req.query.filename);
	console.log(file);
	//// DOWNLOAD //////
	if(req.query.fxn == 'download' ){
	
			res.download(file); // Set disposition and send it.
	
	
	}else if(req.query.fxn == 'delete'){
	
		if(req.query.type == 'datasets'){
			fs.unlink(file, function(err){
				if(err){ 
					console.log(err); 
				}else{
					req.flash('message', 'Deleted: '+req.query.filename);
					res.redirect("/visuals/saved_datasets");
				}	
			}); //
		}else{
			fs.unlink(file, function(err){
				if(err){ 
					console.log(err); 
				}else{
					req.flash('message', 'Deleted: '+req.query.filename);
					res.redirect("/user_data/file_retrieval");	
				}
			}); 
		}
	
	}



////  FINALLY REDIRECT /////
// if(req.query.type == 'datasets'){
// 	res.redirect("/visuals/show_saved_datasets");
// }else if (req.query.type == 'metadata' || req.query.type == 'fasta'){
// 	res.redirect("/file_retrieval");
// }else{
// 	res.redirect("/");
// }
});
//
// DOWNLOAD SEQUENCES
//
router.post('/download_selected_seqs', function(req, res) {
  var db = req.db;
  console.log(req.body);

  var qSelect = "select UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n";
  //var qSelect = "select sequence_comp as seq, sequence_id, seq_count, dataset from sequence_pdr_info\n";
  qSelect += " join sequence using (sequence_id)\n";
  qSelect += " join dataset using (dataset_id)\n";
  qSelect += " join project using (project_id)\n";
  var seq, seqid, seq_count, pjds;
  var timestamp = +new Date();  // millisecs since the epoch!

var user_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
helpers.mkdirSync(path.join('user_data',NODE_DATABASE));
helpers.mkdirSync(user_dir);  // create dir if not exists
  var file_name;
  var out_file_path;
  if(req.body.download_type == 'whole_project')
  {
		var pid = req.body.project_id;
		var project = req.body.project;
		file_name = 'fasta:'+timestamp+'_'+project+'.fa.gz';
  	out_file_path = path.join(user_dir,file_name);
  	qSelect += " where project_id = '"+pid+"'";
  }else{
    var pids = JSON.parse(req.body.datasets).ids;
	  file_name = 'fasta:'+timestamp+'_'+'_custom.fa.gz';
    out_file_path = path.join(user_dir,file_name);
    qSelect += " where dataset_id in ("+pids+")";
    console.log(pids);

  }
  qSelect += " limit 100 ";                     // <<<<-----  for testing




               // <<<<-----  for testing
  var gzip = zlib.createGzip();
  console.log(qSelect);

  var wstream = fs.createWriteStream(out_file_path);
  var rs = new Readable();
  var collection = db.query(qSelect, function (err, rows, fields){
    if (err) {
        throw err;
    } else {
      for (var i in rows){
        seq = rows[i].seq.toString();
        //var buffer = new Buffer(rows[i].seq, 'base64');
        //console.log(seq);
        seq_id = rows[i].sequence_id.toString();
        seq_count = rows[i].seq_count.toString();
        //project = rows[i].project;
        pjds = rows[i].project+'--'+rows[i].dataset;
        entry = '>'+seq_id+'|'+pjds+'|'+seq_count+"\n"+seq+"\n";
        //console.log(entry);
        rs.push(entry);
      }

      rs.push(null);
    }
    rs
      .pipe(gzip)
      .pipe(wstream)
      .on('finish', function () {  // finished
        console.log('done compressing and writing file');
        var info = {
              to:'avoorhis@mbl.edu',
              from:"vamps@mbl.edu",
              subject:"fasta file is ready",
              text:"Your fasta file is ready here:\n\nhttp://localhost:3000/"+"export_data/"
            };
        helpers.send_mail(info);
      });
  });

});

//
// DOWNLOAD METADATA
//
router.post('/download_selected_metadata', function(req, res) {
  var db = req.db;
  console.log(req.body);
  var timestamp = +new Date();  // millisecs since the epoch!


var user_dir = path.join('user_data',NODE_DATABASE,req.user.username);
helpers.mkdirSync(path.join('user_data',NODE_DATABASE));
helpers.mkdirSync(user_dir);  // create dir if not exists
var dids;
var project;
var file_name;
var out_file_path;

if(req.body.download_type == 'whole_project'){
  var pid  = req.body.project_id;
  dids = DATASET_IDS_BY_PID[pid];
  project = req.body.project;
  file_name = 'metadata:'+timestamp+'_'+project+'.csv.gz';
  out_file_path = path.join(user_dir,file_name);
}else{
  dids = JSON.parse(req.body.datasets).ids;
  file_name = 'metadata:'+timestamp+'.csv.gz';
  out_file_path = path.join(user_dir, file_name);
  }
  console.log('dids');
  console.log(dids);


  // check if custom metadata table exists
  //var qSelect = "SHOW tables like 'custom_metadata_"+pid+"'";

  // get the fields from required_metadata_info as they may vary
  //var qSelect = "SHOW columns from required_metadata_info";
  //console.log('in projects-->');
  //console.log(MetadataValues);
  //console.log('<--in projects');
  // we have all the metadata in MetadataValues by did

  var gzip = zlib.createGzip();
  var myrows = {}; // myrows[mdname] == [] list of values
  var header = 'Project: '+project+"\n\t";

  var wstream = fs.createWriteStream(out_file_path);
  var rs = new Readable();
  var filetxt;

      for (var i in dids){
        did = dids[i];
        dname = DATASET_NAME_BY_DID[did];
        header += dname+"\t";
        for (var k in METADATA[did]){
          nm = k;
          val = METADATA[did][k];
          if(nm in myrows){
            myrows[nm].push(val);
          }else{
            myrows[nm] = [];
            myrows[nm].push(val);
          }
        }
      }

    // print
    header += "\n";
    rs.push(header);
    if(Object.keys(myrows).length === 0){
      rs.push("NO METADATA FOUND\n");
    }else{
      for (var mdname in myrows){
        filetxt = mdname+"\t";  // restart sting
        for(i in myrows[mdname]){
          filetxt += myrows[mdname][i]+"\t";
        }
        filetxt += "\n";
        rs.push(filetxt);
      }
    }
    rs.push(null);
    rs
      .pipe(gzip)
      .pipe(wstream)
      .on('finish', function () {  // finished
        console.log('done compressing and writing file');
        var info = {
              to:'avoorhis@mbl.edu',
              from:"vamps@mbl.edu",
              subject:"metadata is ready",
              text:"Your metadata file is ready here:\n\nhttp://localhost:3000/"+"export_data/"
        };
        helpers.send_mail(info);
        //req.flash('Done')
		//res.redirect(req.body.referer)
		res.redirect(req.get('referer'));
		
      });

  //console.log(datasets);
});



module.exports = router;