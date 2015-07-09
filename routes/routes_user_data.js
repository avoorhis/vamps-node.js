var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var path  = require('path');
var fs   = require('fs-extra');
var url  = require('url');
var ini = require('ini');
var queries = require('./queries');
var iniparser = require('iniparser');
var PythonShell = require('python-shell');
var zlib = require('zlib');
var Readable = require('readable-stream').Readable;

var COMMON  = require('./visuals/routes_common');
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
//  EXPORT SELECTION
//
/* GET Import Choices page. */
router.post('/export_selection', helpers.isLoggedIn, function(req, res) {
  console.log('in routes_user_data.js /export_selection')
  console.log('req.body: export_selection-->>');
  console.log(req.body);
  console.log('req.body: export_selection');
  if(req.body.retain_data === '1'){
    dataset_ids = JSON.parse(req.body.dataset_ids);	
  }else{
    dataset_ids = req.body.dataset_ids;
  }
  console.log('dataset_ids '+dataset_ids);
  if (dataset_ids === undefined || dataset_ids.length === 0){
      console.log('redirecting back -- no data selected');
   	 req.flash('nodataMessage', 'Select Some Datasets');
   	 res.redirect('export_data');
     return;
  }else{
   // GLOBAL Variable
	  chosen_id_name_hash           = COMMON.create_chosen_id_name_hash(dataset_ids);
    console.log('chosen_id_name_hash-->');
	  console.log(chosen_id_name_hash);
	  console.log(chosen_id_name_hash.ids.length);
	  console.log('<--chosen_id_name_hash');
    res.render('user_data/export_selection', {
          title: 'VAMPS:Import Choices',
          referer: 'export_data',
          chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
          message: req.flash('successMessage'),
          failmessage: req.flash('failMessage'),
          user: req.user
        });
  }
});
//
//  EXPORT DATA
//
router.get('/export_data', helpers.isLoggedIn, function(req, res) {
    res.render('user_data/export_data', { title: 'VAMPS:Import Data',                                
                rows     : JSON.stringify(ALL_DATASETS),
                proj_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
                constants: JSON.stringify(req.C),
								message  : req.flash('nodataMessage'),
                user     : req.user
          });
});
//
//
/* GET Import Choices page. */
router.get('/import_choices', helpers.isLoggedIn, function(req, res) {
   console.log('import_choices')
    res.render('user_data/import_choices', {
          title: 'VAMPS:Import Choices',
          message: req.flash('successMessage'),
          failmessage: req.flash('failMessage'),
          user: req.user
          });
});
//
//
/* GET Import Data page. */
router.get('/import_data', helpers.isLoggedIn, function(req, res) {
    console.log('import_data')
    console.log(JSON.stringify(req.url))
    var myurl = url.parse(req.url, true);
    
    var import_type    = myurl.query.import_type;
    res.render('user_data/import_data', { 
	    title: 'VAMPS:Import Data',
  		message: req.flash('successMessage'),
	    failmessage: req.flash('failMessage'),
        import_type: import_type,
          user: req.user
                          });
});
//
//
/* GET Import Data page. */
router.get('/validate_format', helpers.isLoggedIn, function(req, res) {
    console.log('validate_format')
    console.log(JSON.stringify(req.url))
    var myurl = url.parse(req.url, true);
    
    var import_type    = myurl.query.import_type;
    res.render('user_data/validate_format', { 
	    title: 'VAMPS:Import Data',
  		message: req.flash('successMessage'),
	    failmessage: req.flash('failMessage'),
        import_type: import_type,
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
	console.log('in delete_project1: '+project+' - '+delete_kind);
	//console.log(JSON.stringify(PROJECT_INFORMATION_BY_PNAME));
	if(project in PROJECT_INFORMATION_BY_PNAME){
		var pid = PROJECT_INFORMATION_BY_PNAME[project].pid;
	    helpers.update_global_variables(pid,'del');
	}else{
		// project not in db?
		console.log('project was not found in db: PROJECT_INFORMATION_BY_PNAME')
        var pid = 0;
		
	}
        
        console.log('in delete_project2: '+project+' - '+pid);
		var options = {
	      scriptPath : req.C.PATH_TO_SCRIPTS,
	      args :       [ '-pid', pid, '-db', NODE_DATABASE, '--user',req.user.username,'--project',project,'-pdir',process.env.PWD ],
        }
		if(delete_kind == 'all'){
			// must delete pid data from mysql ()
			// and all datasets files
			options.args = options.args.concat(['--action', 'delete_whole_project']);
		    
		}else if(delete_kind == 'tax' && pid != 0){
			options.args = options.args.concat(['--action', 'delete_tax_only' ]);
		    
		}else if(delete_kind == 'meta' && pid != 0){
			options.args = options.args.concat(['--action',  'delete_metadata_only' ]);
		    
		}else{
			req.flash('message', 'ERROR nothing deleted');
	      	res.redirect("/user_data/your_projects");
		}
			console.log(options.args.join(' '))
			var spawn = require('child_process').spawn;
			var log = fs.openSync(path.join(process.env.PWD,'logs','node.log'), 'a');
			// script will remove data from mysql and datset taxfile
			console.log(options.scriptPath+'/node_script_utils.py '+options.args.join(' '));
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
				   //console.log('PID last line: '+last_line)				   
				   console.log('ALL_DATASETS1: '+JSON.stringify(ALL_DATASETS));	
                   
                   connection.query(queries.user_project_status('delete', req.user.username, project, '', ''), function(err, rows, fields){
                       if(err){ 
                           console.log('ERROR-in status update')
                       }else{
                        console.log('OK-deleted  status update')
                        }
                    });
                           					   
			   }else{
			   	  // python script error
			   }		   
		    });		
    		// called imediately
    		if(delete_kind == 'all'){    			
    			var msg = "You have deleted '"+project+"'"	    
    		}else if(delete_kind == 'tax'){
    			var msg = "You have deleted the taxonomy from '"+project+"'"		    
    		}else if(delete_kind == 'meta'){
    			var msg = "You have deleted the metadata from '"+project+"'"	    
    		}else{
    			req.flash('message', 'ERROR nothing deleted');
    	      	res.redirect("/user_data/your_projects");
    		}

    		req.flash('successMessage', msg);
          	res.redirect("/user_data/your_projects");	
            //res.redirect(req.get('referer'));
		
	
    console.log('req.body: dele-->>');
    console.log(req.user.username);
    console.log('req.body: del');
		   
	
});
router.get('/start_assignment/:project/:method', helpers.isLoggedIn,  function(req,res){
    
	
	console.log(req.params.project);
	var project = req.params.project;
	var method = req.params.method;
	console.log('start: '+project+' - '+method);
	//var base_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project:'+project);
	var data_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project:'+project);
	
	var data = ''
	
	//console.log('PROJECT_INFORMATION_BY_PID0: '+JSON.stringify(PROJECT_INFORMATION_BY_PID));
	
	var config_file = path.join(data_dir,'config.ini');
  	
	if(method == 'gast'){
		
		var gast_options = {
	      scriptPath : req.C.PATH_TO_SCRIPTS,
	      args :       [ '--classifier','gast', '--config', config_file, '--process_dir',process.env.PWD, '--data_dir', data_dir, '-db', NODE_DATABASE ],
	    };
	    console.log(gast_options.scriptPath+'/node_script_assign_taxonomy.py '+gast_options.args.join(' '));
		
		var spawn = require('child_process').spawn;
		var log = fs.openSync(path.join(data_dir,'node.log'), 'a');
		var gast_process = spawn( gast_options.scriptPath+'/node_script_assign_taxonomy.py', gast_options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr

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
			   console.log('NEW PID=: '+pid);
			   console.log('ALL_DATASETS: '+JSON.stringify(ALL_DATASETS));
			   if(helpers.isInt(pid)){
                   
                   connection.query(queries.get_select_datasets_queryPID(pid), function(err, rows1, fields){			       
					   if (err)  {
				 		  console.log('1-GAST-Query error: ' + err);				 		  			 		  
				       } else {
        				   connection.query(queries.get_select_sequences_queryPID(pid), function(err, rows2, fields){  			     
        				       if (err)  {
        				 		  	console.log('2-GAST-Query error: ' + err);        				 		  	
        				       } else {        
                        		   	status_params = {'type':'update',
                                        'user':req.user.username,
                                        'proj':project,
                                        'status':'GAST-SUCCESS',
								   'msg':'GAST -Tax assignments' } 
									helpers.assignment_finish_request(rows1,rows2,status_params)		 				   
        				       }
				       
        				   });
					   } // end else
				       
				   });		   
                   
	           }else{ // end if int
                   console.log('ERROR pid is not an integer: '+pid.toString());
			   }
		   }else{
		   		// ERROR
			   console.log('ERROR last line: '+last_line);
	   	  		//req.flash('message', 'Script Error');
	         	//res.redirect("/user_data/your_projects");
		   }
		});  // end gast_process ON Close
		
		
	  	
		// called imediately
		req.flash('successMessage', "GAST has been started for project: '"+project+"'");
      	res.redirect("/user_data/your_projects");
		

	}else if(method == 'rdp'){
		
		var rdp_options = {
	      scriptPath : req.C.PATH_TO_SCRIPTS,
	      args :       [ '--classifier','rdp', '--config', config_file, '--process_dir',process.env.PWD, '--data_dir', data_dir, '-db', NODE_DATABASE ],
	    };
	    console.log(rdp_options.scriptPath+'/node_script_assign_taxonomy.py '+rdp_options.args.join(' '));
		
		var spawn = require('child_process').spawn;
		var log = fs.openSync(path.join(data_dir,'node.log'), 'a');
		var rdp_process = spawn( rdp_options.scriptPath+'/node_script_assign_taxonomy.py', rdp_options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
		
		var output = ''
		// communicating with an external python process
		// all the print statements in the py script are printed to stdout
		// so you can grab the projectID here at the end of the process.
		// use looging in the script to log to a file.
		rdp_process.stdout.on('data', function (data) {
		  //console.log('stdout: ' + data);
		  data = data.toString().replace(/^\s+|\s+$/g, '');
		  output += data;
		  var lines = data.split('\n')
		  for(var n in lines){
		  	console.log('line: ' + lines[n]);
			if(lines[n].substring(0,4) == 'PID='){
				console.log('pid line '+lines[n]);
			}
		  }
		});
		 
		rdp_process.on('close', function (code) {
		   console.log('rdp_process process exited with code ' + code);
		   var ary = output.split("\n");
		   var last_line = ary[ary.length - 1];
		   if(code == 0){
			   console.log('RDP Success');
			   //console.log('PID last line: '+last_line)
			   var ll = last_line.split('=');
			   var pid = ll[1];
			   console.log('NEW PID=: '+pid);
			   //console.log('ALL_DATASETS: '+JSON.stringify(ALL_DATASETS));
			   if(helpers.isInt(pid)){
                   
                   connection.query(queries.get_select_datasets_queryPID(pid), function(err, rows1){			       
					   if (err)  {
				 		  console.log('1-RDP-Query error: ' + err);				 		  				 		  
				       } else {						   
        				   connection.query(queries.get_select_sequences_queryPID(pid), function(err, rows2){  			     
        				       if (err)  {
        				 		  	console.log('2-RDP-Query error: ' + err);        				 		  	
        				       } else {        
		                           status_params = {'type':'update',
		                                           'user':req.user.username,
		                                           'proj':project,
		                                           'status':'RDP-SUCCESS',
								   					'msg':'RDP -Tax assignments'  } 
									helpers.assignment_finish_request(rows1,rows2,status_params)	       		 				   
        				       }
				       
        				   });                           
                           
					   } // end else
				       
				   });

	           }else{ // end if int
                   console.log('ERROR pid is not an integer: '+pid.toString());
			   }
		   }else{
		   		// ERROR
			   console.log('ERROR last line: '+last_line);
	   	  		//req.flash('message', 'Script Error');
	         	//res.redirect("/user_data/your_projects");
		   }
		});  // end gast_process ON Close
        
        
		req.flash('successMessage', "RDP has been started for project: '"+project+"'");
		res.redirect("/user_data/your_projects");
		
	}else{
		
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
	  				 // console.log('1 ',config_file)
			 		 var config = iniparser.parseSync(config_file)
			      
			      	
	  				  project_info[stat_dir.mtime.getTime()] = {}
	  				  modify_times.push(stat_dir.mtime.getTime());
					 // console.log('2 ',config_file)
						if(project_name in PROJECT_INFORMATION_BY_PNAME){
							project_info[stat_dir.mtime.getTime()].pid = PROJECT_INFORMATION_BY_PNAME[project_name].pid;
							project_info[stat_dir.mtime.getTime()].status = 'Taxonomic Data Available';
							project_info[stat_dir.mtime.getTime()].tax = ALL_CLASSIFIERS_BY_PID[PROJECT_INFORMATION_BY_PNAME[project_name].pid];  
						}else{
						  	project_info[stat_dir.mtime.getTime()].pid = 0;
						  	project_info[stat_dir.mtime.getTime()].status = 'No Taxonomic Assignments Yet';
						  	project_info[stat_dir.mtime.getTime()].tax = 0;
						}
  				  	  project_info[stat_dir.mtime.getTime()].config = config;
  				  	  project_info[stat_dir.mtime.getTime()].directory = items[d];
  				  	  project_info[stat_dir.mtime.getTime()].mtime = stat_dir.mtime;
					  
				  }
				  catch (err) {
				  	console.log('nofile ',err)
				  }
  			  	 
  			  }
				
	        }
	      }
	  
		  modify_times.sort().reverse();
		  
		  //console.log(JSON.stringify(project_info));
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
//   GET -- EDIT_PROJECT: When first enter the page.
//
router.get('/edit_project/:project', helpers.isLoggedIn, function(req,res){
	console.log('in edit project');
	var project_name = req.params.project;
	var user_projects_base_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
	var config_file = path.join(user_projects_base_dir,'project:'+project_name,'config.ini');
	console.log(config_file);
	var project_info = {};
  	//var stat_config = fs.statSync(config_file);
 	project_info.config = iniparser.parseSync(config_file);
	if(project_name in PROJECT_INFORMATION_BY_PNAME){
		project_info.pid = PROJECT_INFORMATION_BY_PNAME[project_name].pid;
		project_info.status = 'Taxonomic Data Available';
		project_info.tax = 'GAST'; 
	}else{
		project_info.pid =0;
		project_info.status = 'No Taxonomic Assignments Yet';
		project_info.tax = 0; 
	}
	
	res.render('user_data/edit_project',
	  { title: 'Edit Project',   
		project: project_name,
		pinfo: JSON.stringify(project_info),
		env_sources :   JSON.stringify(req.C.ENV_SOURCE),
		message:'',
	    user: 	req.user
	  });
});
//
//   POST -- EDIT_PROJECT:  for accepting changes and re-showing the page
//
router.post('/edit_project', helpers.isLoggedIn, function(req,res){
	console.log('in edit project');
	console.log(req.body);
	var project_info = {};
	var project_name = req.body.old_project_name;
	var user_projects_base_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
	var project_dir = path.join(user_projects_base_dir,'project\:'+project_name)
	var config_file = path.join(project_dir,'config.ini');
    var timestamp = +new Date();  // millisecs since the epoch!
	var config_file_bu = path.join(project_dir,'config'+timestamp+'.ini');
	fs.copy(config_file, config_file_bu, function (err) {
  	  	if (err){
  	  		console.log(err)
  	  	}else{
  	  		console.log("copy success!")
  	  	}
	}) // copies fi
	//console.log(config_file);
	project_info.config = iniparser.parseSync(config_file);
	//console.log('config:');
	//console.log(JSON.stringify(project_info.config));
	// HAS NO ASSIGNMENTS: NEED CHANGE FILES ONLY	
	// changing data on the system must take this into account:
	// if the project has no assignments yet then it has no data in the database (ie no pid).
	// So just (1)alter the config.ini and the (2)directory name where it is located in user_data/NODE_DATABASE/<user>/project:*
	// Also the dataset (3)directories need to be updated.
	
	new_config_txt = "[GENERAL]\n";
	
	if(req.body.new_project_name && req.body.new_project_name != req.body.old_project_name){
		console.log('updating project name');
		var new_project_name = req.body.new_project_name.replace(/[\s+,.;:]/g,'_')
		new_config_txt += "project="+new_project_name+"\n";
		project_info.config.GENERAL.project=new_project_name;
		new_base_dir = path.join(user_projects_base_dir,'project\:'+new_project_name);
		new_config_file = path.join(new_base_dir,'config.ini');
		new_fasta_file = path.join(new_base_dir,'fasta.fa');
		new_config_txt += "baseoutputdir="+new_base_dir+"\n";
		new_config_txt += "configPath="+new_config_file+"\n";
		new_config_txt += "fasta_file="+new_fasta_file+"\n";
		project_name = new_project_name;
		
	}else{
		//console.log('NOT updating project name');
		new_config_txt += "project="+project_name+"\n";
		new_config_txt += "baseoutputdir="+project_info.config.GENERAL.baseoutputdir+"\n";
		new_config_txt += "configPath="+project_info.config.GENERAL.configPath+"\n";
		new_config_txt += "fasta_file="+project_info.config.GENERAL.fasta_file+"\n";		
	}
	
	if(req.body.new_project_title){
		console.log('updating project title');
		new_config_txt += "project_title="+req.body.new_project_title+"\n";
		project_info.config.GENERAL.project_title = req.body.new_project_title
	}else{
		//console.log('NOT updating project title');
		new_config_txt += "project_title="+project_info.config.GENERAL.project_title+"\n";
		
	}
	if(req.body.new_project_description){
		console.log('updating project description');
		new_config_txt += "project_description="+req.body.new_project_description+"\n";
		project_info.config.GENERAL.project_description = req.body.new_project_description
	}else{
		//console.log('NOT updating project description');
		new_config_txt += "project_description="+project_info.config.GENERAL.project_description+"\n";
		
	}
	new_config_txt += "platform="+project_info.config.GENERAL.platform+"\n";
	new_config_txt += "owner="+project_info.config.GENERAL.owner+"\n";
	new_config_txt += "config_file_type="+project_info.config.GENERAL.config_file_type+"\n";
	if(req.body.new_privacy != project_info.config.GENERAL.public){
		console.log('updating privacy');
		new_config_txt += "public="+req.body.new_privacy+"\n";
		project_info.config.GENERAL.public =req.body.new_privacy
	}else{
		//console.log('NOT updating privacy');
		new_config_txt += "public="+project_info.config.GENERAL.public+"\n";
		
	}
	new_config_txt += "fasta_type="+project_info.config.GENERAL.fasta_type+"\n";
	new_config_txt += "dna_region="+project_info.config.GENERAL.dna_region+"\n";
	new_config_txt += "project_sequence_count="+project_info.config.GENERAL.project_sequence_count+"\n";
	new_config_txt += "domain="+project_info.config.GENERAL.domain+"\n";
	new_config_txt += "number_of_datasets="+project_info.config.GENERAL.number_of_datasets+"\n";
	new_config_txt += "sequence_counts="+project_info.config.GENERAL.sequence_counts+"\n";
	
	if(req.body.new_env_source_id != project_info.config.GENERAL.env_source_id){
		console.log('updating env id');
		new_config_txt += "env_source_id="+req.body.new_env_source_id+"\n";
		project_info.config.GENERAL.env_source_id = req.body.new_env_source_id
	}else{
		//console.log('NOT updating env id');
		new_config_txt += "env_source_id="+project_info.config.GENERAL.env_source_id+"\n";
	}
	new_config_txt += "has_tax="+project_info.config.GENERAL.has_tax+"\n\n";
	new_config_txt += "[DATASETS]\n";
	var old_dataset_array = Object.keys(project_info.config.DATASETS).map(function(k) { return k });
	var counts_array = Object.keys(project_info.config.DATASETS).map(function(k) { return project_info.config.DATASETS[k] });
	console.log(old_dataset_array);
	project_info.config.DATASETS={}
	for(n in req.body.new_dataset_names){
		
		if(req.body.new_dataset_names[n]){
			new_dataset_name = req.body.new_dataset_names[n].replace(/[\s+,.;:]/g,'_')
			console.log('updating ds from '+old_dataset_array[n]+' to '+new_dataset_name);
			new_config_txt += new_dataset_name+"="+counts_array[n]+"\n";
			project_info.config.DATASETS[new_dataset_name] = counts_array[n];
		}else{
			//console.log('NOT updating ds  '+old_dataset_array[n]);
			new_config_txt += old_dataset_array[n]+"="+counts_array[n]+"\n";
			project_info.config.DATASETS[old_dataset_array[n]] = counts_array[n];
		}
	}
	
	console.log(new_config_txt)
	if(req.body.project_pid > 0){
		// TODO: HAS ASSIGNMENTS: NEED CHANGE DB & FILES
		// If the project has assignments:
		// change the three places on the file system as above but also:
		// the project_name,title,description and public in NODE_DATABASE.project
		// and the dataset_name,description and env_id in NODE_DATABASE.dataset
		// Also need to update PROJECT_INFORMATION_BY_PNAME and DATASET_ID_BY_DNAME
	}
	
 	
	if(project_name in PROJECT_INFORMATION_BY_PNAME){
		project_info.pid = PROJECT_INFORMATION_BY_PNAME[project_name].pid;
		project_info.status = 'Taxonomic Data Available';
		project_info.tax = 'GAST'; 
	}else{
		project_info.pid = 0;
		project_info.status = 'No Taxonomic Assignments Yet';
		project_info.tax = 0; 
	}
	fs.writeFile(config_file, new_config_txt,function(err){
        if(err){
			console.log(err);
			res.send(err);
        }else{
            console.log('write new config file success')
		  	if(req.body.new_project_name && req.body.new_project_name != req.body.old_project_name){
				// now change the directory name if the project_name is being updated
				fs.move(project_dir, new_base_dir, function(err){
					if(err){
						console.log(err);
						res.send(err);
					}else{
			  			console.log(project_name)
						console.log(JSON.stringify(project_info))
						update_dataset_names(req.body.new_dataset_names, old_dataset_array, new_base_dir)
						res.render('user_data/edit_project',
			  		  	  { title: 'Edit Project',   
			  		  		project: project_name,
			  		  		pinfo: JSON.stringify(project_info),
			  		  		env_sources :   JSON.stringify(req.C.ENV_SOURCE),
			  		  		message:'Project Updated',
			  		  	    user: 	req.user
			  		  	  });
					}
					
				})
			}else{
			  	console.log(project_name)
				console.log(JSON.stringify(project_info))
				update_dataset_names(req.body.new_dataset_names, old_dataset_array, project_dir)
				res.render('user_data/edit_project',
			  	  { title: 'Edit Project',   
			  		project: project_name,
			  		pinfo: JSON.stringify(project_info),
			  		env_sources :   JSON.stringify(req.C.ENV_SOURCE),
			  		message:'Project Updated',
			  	    user: 	req.user
			  	  });
			}
			
        }
    })
	
	function update_dataset_names(ds_names, old_array, dir){
		for(n in ds_names){
			if(ds_names[n]){
				if(ds_names[n]){
					
					old_name = old_array[n];
					old_name_path = path.join(dir,'analysis',old_name);
					new_name = ds_names[n].replace(/[\s+,.;:]/g,'_');
					new_name_path =path.join(dir,'analysis',new_name);
					console.log(old_name_path)
					console.log(new_name_path)
					fs.move(old_name_path, new_name_path, function(err){
						if(err){
							console.log('ERROR Moving dataset name '+err.toString())
						}else{
							console.log('moving '+old_name+' to '+new_name);
						}
					})
				}
			}
		}
	}
	
});
//
//
//
router.post('/upload_data', helpers.isLoggedIn, function(req,res){
    
  var project = req.body.project;
  var username = req.user.username;
  console.log('req.body upload_data');
    console.log(req.body);
  console.log(req.files);
    console.log('req.body upload_data');
    console.log(project);
    console.log(PROJECT_INFORMATION_BY_PNAME);
  if(project == '' || req.body.project == undefined){
	req.flash('failMessage', 'A project name is required.');
	res.redirect("/user_data/import_data");
  }else if(project in PROJECT_INFORMATION_BY_PNAME){
	req.flash('failMessage', 'That project name is already taken.');
	res.redirect("/user_data/import_data");
  }else if(req.files.fasta==undefined || req.files.fasta.size==0){
  	req.flash('failMessage', 'A fasta file is required.');
	res.redirect("/user_data/import_data");
  }else if(req.files.metadata==undefined || req.files.metadata.size==0 || req.files.metadata.mimetype !== 'text/csv'){
  	req.flash('failMessage', 'A metadata csv file is required.');
	res.redirect("/user_data/import_data");
  }else{
	var data_repository = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project:'+project);
      console.log(data_repository);
	
	var options = { scriptPath : req.C.PATH_TO_SCRIPTS,
        			args :       [ '-dir', data_repository, '-o', username, '-p', project]
    			};
	if(req.body.type == 'single'){
	    if(req.body.dataset == '' || req.body.dataset == undefined){
		  	req.flash('failMessage', 'A dataset name is required.');
		  	res.redirect("/user_data/import_data");
		}
		options.args = options.args.concat(['-t', 'single', '-d', req.body.dataset ]);            
  	}else if(req.body.type == 'multi') {
		options.args = options.args.concat(['-t', 'multi' ]); 
  	}else{
		req.flash('failMessage', 'No file type Info found  '+err);
		res.redirect("/user_data/import_data");
  	}
	var original_fastafile = path.join('./user_data', NODE_DATABASE, 'tmp', req.files.fasta.name);
	var original_metafile  = path.join('./user_data', NODE_DATABASE, 'tmp', req.files.metadata.name);
	//console.log(original_fastafile);
	//console.log(original_metafile);
 	// move files to user_data/<username>/ and rename
  	var LoadDataFinishRequest = function() {
		// START STATUS //
		req.flash('successMessage', "Upload in Progress: '"+ project+"'");
		status_params = {'type':'new',
		    'user':req.user.username,
		    'proj':project,
		    'status':'LOADED',
		    'msg':'Project is loaded --without tax assignments',
		    'render':{  title   : 'VAMPS: Import Success',                                
					    message : req.flash('successMessage'),
		                display: "Import_Success",
			            user: req.user                        
			        }                  
		}
		helpers.update_project_status(res, status_params);
	}
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
		    console.log(options.scriptPath+'/load_trimmed_data.py '+options.args.join(' '));
		    PythonShell.run('load_trimmed_data.py', options, function (err, output) {
		      if (err) {
				  req.flash('failMessage', 'Script Failure '+err);
				  res.redirect("/user_data/import_data");  // for now we'll send errors to the browser
			  }
			  console.log('script output: '+output);
			  LoadDataFinishRequest();
		    });
	  	}); // END move 2
	}); // END move 1
  } 
	
});
//
//
//
router.get('/file_utils', helpers.isLoggedIn, function(req, res){

	console.log('in file_utils');
	//console.log(req.query.filename);
	var user = req.query.user;
	
	console.log(file);
	//// DOWNLOAD //////
	if(req.query.fxn == 'download' && req.query.template == '1'){
      var file = path.join(process.env.PWD,req.query.filename);
      res.setHeader('Content-Type', 'text');
      res.download(file); // Set disposition and send it.
  }else if(req.query.fxn == 'download' &&  req.query.type=='pcoa'){
	    var file = path.join(process.env.PWD,'tmp',req.query.filename);
		  res.setHeader('Content-Type', 'text');
		  res.download(file); // Set disposition and send it.	
	}else if(req.query.fxn == 'download'){
	    var file = path.join(process.env.PWD,'user_data',NODE_DATABASE,user,req.query.filename);
		  res.setHeader('Content-Type', 'text');
		  res.download(file); // Set disposition and send it.	
	}else if(req.query.fxn == 'delete'){
	    var file = path.join(process.env.PWD,'user_data',NODE_DATABASE,user,req.query.filename);
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
router.post('/download_selected_seqs',helpers.isLoggedIn, function(req, res) {
  var db = req.db;
  console.log('req.body-->>');
  console.log(req.body);
  console.log('<<--req.body');
  console.log('in DOWNLOAD SELECTED SEQS');

  var qSelect = "SELECT UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n";
  //var qSelect = "select sequence_comp as seq, sequence_id, seq_count, dataset from sequence_pdr_info\n";
  qSelect += " JOIN sequence using (sequence_id)\n";
  qSelect += " JOIN dataset using (dataset_id)\n";
  qSelect += " JOIN project using (project_id)\n";
  var seq, seqid, seq_count, pjds;
  var timestamp = +new Date();  // millisecs since the epoch!

  var user_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
  helpers.mkdirSync(path.join('user_data',NODE_DATABASE));
  helpers.mkdirSync(user_dir);  // create dir if not exists
  var file_name;
  var out_file_path;
  
  if(req.body.download_type == 'whole_project'){
	  req.flash('message', 'Fasta being created');
		var pid = req.body.project_id;
		var project = req.body.project;
		file_name = 'fasta:'+timestamp+'_'+project+'.fa.gz';
  	out_file_path = path.join(user_dir,file_name);
  	qSelect += " where project_id = '"+pid+"'";
  
  }else if(req.body.download_type == 'partial_project'){
	  req.flash('message', 'Fasta being created');
    var pids = JSON.parse(req.body.datasets).ids;
		file_name = 'fasta:'+timestamp+'_'+'_custom.fa.gz';
    out_file_path = path.join(user_dir,file_name);
    qSelect += " where dataset_id in ("+pids+")";
    console.log(pids);

  }else if(req.body.download_type == 'custom_taxonomy'){
			console.log('in DOWNLOAD SEQS');
			req.flash('tax_message', 'Fasta being created');
			file_name = 'fasta:'+timestamp+'_custom_taxonomy.fa.gz';
  		out_file_path = path.join(user_dir,file_name);
			var tax_string = req.body.tax_string;
			tax_items = tax_string.split(';');
			qSelect += " JOIN silva_taxonomy_info_per_seq using (sequence_id)\n"; 
			qSelect += " JOIN silva_taxonomy using (silva_taxonomy_id)\n";
			add_where = ' WHERE '
			for(n in tax_items){
				rank = req.C.RANKS[n]
				qSelect += ' JOIN `'+rank+ '` using ('+rank+'_id)\n'
				add_where += '`'+rank+"`='"+tax_items[n]+"' and " 
			}
			qSelect = qSelect + add_where.substring(0, add_where.length - 5)
			
  }
  //qSelect += " limit 100 ";                     // <<<<-----  for testing


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
        //req.flash('Done')
				
      });
      
  });
  res.redirect(req.get('referer'));

});

//
// DOWNLOAD METADATA
//
router.post('/download_selected_metadata', helpers.isLoggedIn, function(req, res) {
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
				req.flash('message', 'Done');
				res.redirect(req.get('referer'));
		
      });

  //console.log(datasets);
});



module.exports = router;