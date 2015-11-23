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
//var PythonShell = require('python-shell');
var zlib = require('zlib');
var multer = require('multer');
var upload = multer(multer({ dest: path.join('tmp')}));
var Readable = require('readable-stream').Readable;
var COMMON  = require('./visuals/routes_common');


//
// YOUR DATA
//
router.get('/your_data',  function(req,res){
  console.log('in your data');
  console.log(req.user);
    res.render('user_data/your_data', {
      title: 'VAMPS:Data Administration',
      user: req.user, hostname: req.C.hostname,
      message: req.flash('message'),

    });
});

//
// FILE RETRIEVAL
//
/* GET Export Data page. */
router.get('/file_retrieval', helpers.isLoggedIn, function(req, res) {

    
    if(req.C.hostname.substring(0,7) == 'bpcweb7'){
        var export_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username);
    }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
        var export_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username);
    }else{
        var export_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
    }
    
    var mtime = {};
    var size = {};
    var file_info = {};
    file_info.mtime ={};
    file_info.size = {};
    file_info.files = [];
    fs.readdir(export_dir, function(err, files){
      for (var f in files){
        var pts = files[f].split(':');
        if(pts[0] === 'metadata' || pts[0] === 'fasta' || pts[0] === 'matrix'){
          file_info.files.push(files[f]);
          stat = fs.statSync(export_dir+'/'+files[f]);
          file_info.mtime[files[f]] = stat.mtime;  // modify time
          file_info.size[files[f]] = stat.size;
        }
      }
      //console.log(file_info)
      res.render('user_data/file_retrieval', { title: 'VAMPS:Export Data',
              user: req.user, hostname: req.C.hostname,
              finfo: JSON.stringify(file_info),
							message : req.flash('message'),
            });
    });
});

//
//  EXPORT CONFIRM
//
router.post('/export_confirm', helpers.isLoggedIn, function(req, res) {
		console.log('req.body: export_confirm-->>');
		console.log(req.body);
		console.log('req.body: <<--export_confirm');
		if(req.body.fasta === undefined
				&& req.body.taxbyseq === undefined
				&& req.body.taxbyref === undefined
				&& req.body.taxbytax === undefined
				&& req.body.metadata === undefined ){
				req.flash('failMessage', 'Select one or more file formats');
				res.render('user_data/export_selection', {
		      title: 'VAMPS: Export Choices',
		      referer: 'export_data',
		      chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
		      message: 'Select one or more file formats',
		      user: req.user, hostname: req.C.hostname
		    });
		    return;
		}
		var dids = req.body.dids;
		var requested_files = [];

		if(req.body.fasta){

		}
		for(var fmt in req.body){
			if(fmt != 'dids'){
				requested_files.push(fmt);
			}
		}
		console.log(requested_files);
		create_fasta_file(req,dids);

		res.render('user_data/export_selection', {
		      title: 'VAMPS: Export Choices',
		      referer: 'export_data',
		      chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
		      message: "Your files are being created -- when ready they will be accessible <a href='/user_data/file_retrieval' >here</a>",
		      user: req.user, hostname: req.C.hostname
		});


});
//
//  EXPORT SELECTION
//
/* GET Import Choices page. */
router.post('/export_selection', helpers.isLoggedIn, function(req, res) {
  console.log('in routes_user_data.js /export_selection');
  console.log('req.body: export_selection-->>');
  console.log(req.body);
  console.log('req.body: <<--export_selection');
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
          title: 'VAMPS: Export Choices',
          referer: 'export_data',
          chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
          message: req.flash('successMessage'),
          failmessage: req.flash('failMessage'),
          user: req.user, hostname: req.C.hostname
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
                user: req.user, hostname: req.C.hostname
          });
});
//
// IMPORT_CHOICES
//
/* GET Import Choices page. */
router.get('/import_choices', helpers.isLoggedIn, function(req, res) {
  console.log('import_choices');
   if(req.user.username == 'guest'){
   		req.flash('message', "The 'guest' user is not permitted to import data");
   		res.redirect('/user_data/your_data');
   }else{
    	res.render('user_data/import_choices', {
          title: 'VAMPS:Import Choices',
          message: req.flash('successMessage'),
          failmessage: req.flash('failMessage'),
          user: req.user, hostname: req.C.hostname
          });
  }
});
//
// IMPORT DATA
//
/* GET Import Data page. */
router.get('/import_data', helpers.isLoggedIn, function(req, res) {
  console.log('import_data');
  console.log(JSON.stringify(req.url));
  var myurl = url.parse(req.url, true);
  if(req.C.hostname.substring(0,7) == 'bpcweb7'){
        var user_projects_base_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username);
  }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
        var user_projects_base_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username);
  }else{
        var user_projects_base_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
  }
  var my_projects = [];
  var import_type    = myurl.query.import_type;

		fs.readdir(user_projects_base_dir, function(err, items){
				if(err){

					fs.ensureDir(user_projects_base_dir, function (err) {
		  			console.log(err); // => null
		  			// dir has now been created, including the directory it is to be placed in
					});


				}else{
				  for (var d in items){
		        var pts = items[d].split('_');
		        if(pts[0] === 'project'){

							var project_name = pts[1];
							my_projects.push(project_name);

						}
					}

					res.render('user_data/import_data', {
				    title: 'VAMPS:Import Data',
			  		message: req.flash('successMessage'),
				    failmessage: req.flash('failMessage'),
			      import_type: import_type,
			      my_projects:my_projects,
			      user: req.user, hostname: req.C.hostname
			    });

				} // end else
			});


});
//
// VALIDATE FORMAT
//
/* GET Validate page. */
router.get('/validate_format', helpers.isLoggedIn, function(req, res) {
  console.log('validate_format');
  console.log(JSON.stringify(req.url));
  var myurl = url.parse(req.url, true);
  console.log(myurl.query);
  var file_type    = myurl.query.file_type;
  res.render('user_data/validate_format', {
    title: 'VAMPS:Import Data',
		message: req.flash('successMessage'),
      file_type: file_type,
      file_style:'',
      result:'',
      original_fname:'',
      user: req.user, hostname: req.C.hostname
                        });
});
//
//  VALIDATE FILE
//
router.post('/validate_file', [helpers.isLoggedIn, upload.single('upload_file', 12)], function(req, res) {
  console.log('POST validate_file');
    //console.log(JSON.stringify(req.url))
    //var myurl = url.parse(req.url, true);
    console.log(req.body);
    console.log(req.file);
    var file_type    = req.body.file_type;
    var file_style   = req.body.file_style;
    console.log('file_type '+ file_type);
    console.log('file_style '+ file_style);
    var file_path = path.join(process.env.PWD,req.file.path);
    console.log('file_path '+ file_path);

		var options = { scriptPath : req.C.PATH_TO_SCRIPTS,
		        			args : [ '-i', file_path, '-ft',file_type,'-s', file_style,'-pdir',process.env.PWD,]
		    			};

		console.log(options.scriptPath+'/vamps_script_validate.py '+options.args.join(' '));
		var spawn = require('child_process').spawn;
		var log = fs.openSync(path.join(process.env.PWD,'node.log'), 'a');
		var validate_process = spawn( options.scriptPath+'/vamps_script_validate.py', options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
		var output = '';
		validate_process.stdout.on('data', function (data) {
		  //console.log('stdout: ' + data);
		  data = data.toString().replace(/^\s+|\s+$/g, '');
		  output += data;


		});
		validate_process.on('close', function (code) {
				console.log('validate_process exited with code ' + code);
				console.log(output);

				var ary = output.substring(2,output.length-2).split("', '");
				var result = ary.shift();
				console.log(ary);
				//var last_line = ary[ary.length - 1];
				if(code === 0){
					//console.log('OK '+code)
					console.log(typeof ary);

					if(result == 'OK'){
						req.flash('message', 'Validates');
					}else{
						req.flash('message', 'Failed Validation');
					}
					res.render('user_data/validate_format', {
					     title: 'VAMPS:Import Data',
				  		 message: req.flash('message'),

				       file_type: file_type,
				       //result:    JSON.stringify(ary),
				       file_style: file_style,
				       result_ary:    ary,
				       original_fname: req.file.originalname,
				       result : result,
				       user: req.user, hostname: req.C.hostname
             });

				}else{
					console.log('ERROR '+code);
					req.flash('message', 'Failed Validation');
					res.render('user_data/validate_format', {
					    title: 'VAMPS:Import Data',
				  		message: req.flash('message'),
				      file_type: file_type,
				      user: req.user, hostname: req.C.hostname
                          });
				}

	  });


});
//
// USER PROJECT INFO:ID
//
router.get('/user_project_info/:id', helpers.isLoggedIn, function(req, res) {
    console.log(req.params.id);
	var project = req.params.id;
    if(req.C.hostname.substring(0,7) == 'bpcweb7'){
        var config_file = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username,'project-'+project,'config.ini');
    }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
        var config_file = path.join('/groups/vampsweb/vamps_user_data/',req.user.username,'project-'+project,'config.ini');
    }else{
        var config_file = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project-'+project,'config.ini');
	}
	var config = ini.parse(fs.readFileSync(config_file, 'utf-8'));
	console.log(config);
	res.render('user_data/profile', {
			project : project,
			pinfo   : JSON.stringify(config),
			title   : project,
	    user: req.user, hostname: req.C.hostname
         });
});
//
// USER PROJECT METADATA:ID
//
router.get('/user_project_metadata/:id', helpers.isLoggedIn, function(req, res) {
    var parse = require('csv-parse');
	var async = require('async');
    console.log(req.params.id);
	var project = req.params.id;
    if(req.C.hostname.substring(0,7) == 'bpcweb7'){
        var config_file = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username,'project-'+project,'config.ini');
    }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
        var config_file = path.join('/groups/vampsweb/vamps_user_data/',req.user.username,'project-'+project,'config.ini');
    }else{
        var config_file = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project-'+project,'config.ini');
	}
	stats = fs.statSync(config_file);
	if (stats.isFile()) {
	   console.log('config found')
	   var config = ini.parse(fs.readFileSync(config_file, 'utf-8'));
	}else{
		console.log('config NOT found')
		 config = {'config file NOT AVAILABLE':1}
	}
	if(req.C.hostname.substring(0,7) == 'bpcweb7'){
        var metadata_file = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username,'project-'+project,'metadata_clean.csv');
    }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
        var metadata_file = path.join('/groups/vampsweb/vamps_user_data/',req.user.username,'project-'+project,'metadata_clean.csv');
    }else{
	    var metadata_file = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project-'+project,'metadata_clean.csv');
	}
	var parser = parse({delimiter: '\t'}, function(err, data){
	  	json_data = {}
	  	console.log(data)

	  	res.render('user_data/metadata', {
				project : project,
				pinfo   : JSON.stringify(config),
				mdata   : data,
				title   : project,
				message : req.flash('successMessage'),
		    user: req.user, hostname: req.C.hostname
      });

	});
	try{
		console.log('looking for meta')
		stats = fs.lstatSync(metadata_file);
		if (stats.isFile()) {
			console.log('meta found')
	    fs.createReadStream(metadata_file).pipe(parser);
		}
	}
	catch(e){
		console.log('meta NOT found')
			res.render('user_data/metadata', {
				project : project,
				pinfo   : JSON.stringify(config),
				mdata   : [],
				title   : project,
				message : req.flash('successMessage'),
		    user: req.user, hostname: req.C.hostname
      });
	}
	

	// var Converter = require("csvtojson").Converter;
	// var converter = new Converter({delimiter:'\t'});
 //  console.log(req.params.id);
	// var project = req.params.id;
 //  var config_file = path.join('user_data',NODE_DATABASE,req.user.username,'project-'+project,'config.ini');
	// var config = ini.parse(fs.readFileSync(config_file, 'utf-8'));
	// var metadata_file = path.join('user_data',NODE_DATABASE,req.user.username,'project-'+project,'metadata_clean.csv');
	
	// converter.on("end_parsed", function (jsonArray) {
 //   	console.log(jsonArray); //here is your result jsonarray 
	// 	res.render('user_data/metadata', {
	// 		project : project,
	// 		pinfo   : JSON.stringify(config),
	// 		mdata   : JSON.stringify(jsonArray),
	// 		title   : project,
	// 		message : req.flash('successMessage'),
	//     user: req.user, hostname: req.C.hostname
 //         });

	// });

	  	

	
	// //try{
	// 	stats = fs.lstatSync(metadata_file);
	// 	if (stats.isFile()) {
	//       require("fs").createReadStream(metadata_file).pipe(converter);
	   
	// //}catch(err){
	// //  	console.log('dir doesnt exist -good- continuing on');
	// //}

		
	// }else{
	// 	metadata = {'NOT AVAILABLE':1}
	// }


	
});
//
//  DELETE PROJECT:PROJECT:KIND
//
router.get('/delete_project/:project/:kind', helpers.isLoggedIn,  function(req,res){

	var delete_kind = req.params.kind;
	var project = req.params.project;
	var timestamp = +new Date();  // millisecs since the epoch!
	console.log('in delete_project1: '+project+' - '+delete_kind);
	//console.log(JSON.stringify(PROJECT_INFORMATION_BY_PNAME));

	if(project in PROJECT_INFORMATION_BY_PNAME){
		var pid = PROJECT_INFORMATION_BY_PNAME[project].pid;
	  helpers.update_global_variables(pid,'del');
	}else{
		// project not in db?
		console.log('project was not found in db: PROJECT_INFORMATION_BY_PNAME');
    var pid = 0;

	}

    console.log('in delete_project2: '+project+' - '+pid);
		var options = {
	      scriptPath : req.C.PATH_TO_SCRIPTS,
	      args :       [ '-pid', pid, '-db', NODE_DATABASE, '--user',req.user.username,'--project',project,'-pdir',process.env.PWD ],
        };
		if(delete_kind == 'all'){
			// must delete pid data from mysql ()
			// and all datasets files
			options.args = options.args.concat(['--action', 'delete_whole_project']);
		}else if(delete_kind == 'tax' && pid !== 0){
			options.args = options.args.concat(['--action', 'delete_tax_only' ]);

		}else if(delete_kind == 'meta' && pid !== 0){
			options.args = options.args.concat(['--action',  'delete_metadata_only' ]);

		}else{
			req.flash('message', 'ERROR nothing deleted');
	    res.redirect("/user_data/your_projects");
	    return;
		}
    console.log(options.args.join(' '));
			var spawn = require('child_process').spawn;
			var log = fs.openSync(path.join(process.env.PWD,'logs','node.log'), 'a');
			// script will remove data from mysql and datset taxfile


			console.log(options.scriptPath+'/vamps_script_utils.py '+options.args.join(' '));
      var delete_process = spawn( options.scriptPath+'/vamps_script_utils.py', options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr


			var output = '';
			delete_process.stdout.on('data', function (data) {
			  //console.log('stdout: ' + data);
			  data = data.toString().replace(/^\s+|\s+$/g, '');
			  output += data;
			  var lines = data.split('\n');
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
			    if(code === 0){
				   //console.log('PID last line: '+last_line)
              status_params = {'type':'delete', 'user':req.user.username,
                                'project':project, 'status':'delete',	'msg':'delete' };
              helpers.update_status(status_params );                            
			    }else{
			   	  // python script error
			    }
	    });
  		// called imediately
      var msg = "";
  		if(delete_kind == 'all'){    
  			msg = "Deletion in progress: '"+project+"'";
  		}else if(delete_kind == 'tax'){
  			msg = "Deletion in progress: taxonomy from '"+project+"'";
  		}else if(delete_kind == 'meta'){
  			msg = "Deletion in progress: metadata from '"+project+"'";
  		}else{
  			req.flash('message', 'ERROR nothing deleted');
  	    res.redirect("/user_data/your_projects");
  	    return;
  		}
  		if(delete_kind == 'all'){
  				// MOVE file dir to DELETED path (so it won't show in 'your_projects' list)
					if(req.C.hostname.substring(0,7) == 'bpcweb7'){
                        var data_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username,'project-'+project);
                        var deleted_data_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username,'DELETED_project'+timestamp+':'+project);
                    }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
                        var data_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username,'project-'+project);
                        var deleted_data_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username,'DELETED_project'+timestamp+':'+project);
                    }else{
					    var data_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project-'+project);
					    var deleted_data_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'DELETED_project'+timestamp+':'+project);
					}
					fs.move(data_dir, deleted_data_dir, function(err){
						if(err){
							console.log(err);
							res.send(err);
						}else{
							console.log('moved project_dir to DELETED_project_dir');
							req.flash('successMessage', msg);
    					res.redirect("/user_data/your_projects");
    					return;
						}

					});

			}else{
				req.flash('successMessage', msg);
      	res.redirect("/user_data/your_projects");
			}
    

});
//
// DUPLICATE_PROJECT
//
router.get('/duplicate_project/:project', helpers.isLoggedIn,  function(req,res){
		var project = req.params.project;
		if(req.C.hostname.substring(0,7) == 'bpcweb7'){
            var data_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username,'project-'+project);
            var new_data_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username,'project-'+project+'_dupe');
        }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
            var data_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username,'project-'+project);
            var new_data_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username,'project-'+project+'_dupe');
        }else{
		    var data_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project-'+project);
		    var new_data_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project-'+project+'_dupe');
		}
		try{
			stats = fs.lstatSync(new_data_dir);
			if (stats.isDirectory()) {
	      console.log('dir exists - returning');
	      req.flash('failMessage', "Error: Could not duplicate: '"+project+"' to '"+project+"_dupe'. Does it already exist?");
	    	res.redirect("/user_data/your_projects");
	    	return;
	    }
	  }catch(err){
	  	console.log('dir doesnt exist -good- continuing on');
	  }

		fs.copy(data_dir, new_data_dir, function (err) {
  		if (err) {
  			console.log(err);
  		}else{
  			// need to change config file of new project to include new name:
  			console.log('duplicate copy success!');
  			var config_file = path.join(new_data_dir,'config.ini');
  			var project_info = {};
  			project_info.config = iniparser.parseSync(config_file);
				var config_info = project_info.config.GENERAL;
				config_info.project = project+'_dupe';
				config_info.baseoutputdir = new_data_dir;
				config_info.configPath = path.join(new_data_dir,'config.ini');
				config_info.fasta_file = path.join(new_data_dir,'fasta.fa');
				config_info.datasets = [];
				for(var ds in project_info.config.DATASETS){
					config_info.datasets.push({ "dsname":ds, "count":project_info.config.DATASETS[ds], "oldname":ds });
				}
				update_config(res,req, config_file, config_info, false, 'Duplicated '+project+' to: '+config_info.project);
    	}
		}); // copies directory, even if it has subdirectories or files

});
router.get('/assign_taxonomy/:project', helpers.isLoggedIn,  function(req,res){
		var project = req.params.project;
		if(req.C.hostname.substring(0,7) == 'bpcweb7'){
            var data_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username,'project-'+project);
        }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
            var data_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username,'project-'+project);
        }else{
		    var data_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project-'+project);
		}
		var config_file = path.join(data_dir,'config.ini');

		res.render('user_data/assign_taxonomy', {
			project : project,
			//pinfo   : JSON.stringify(config),
			//mdata   : JSON.stringify(jsonArray),
			title   : project,
			message : req.flash('successMessage'),
	    user: req.user, hostname: req.C.hostname
     });

});
//
// START_ASSIGNMENT
//
router.get('/start_assignment/:project/:classifier/:ref_db', helpers.isLoggedIn,  function(req,res){




	console.log(req.params.project);
	var project = req.params.project;


	var classifier = req.params.classifier;
	var ref_db_dir = req.params.ref_db;
	console.log('start: '+project+' - '+classifier+' - '+ref_db_dir);


	//var base_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project-'+project);
	if(req.C.hostname.substring(0,7) == 'bpcweb7'){
        var data_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username,'project-'+project);
    }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
        var data_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username,'project-'+project);
    }else{
	    var data_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project-'+project);
    }
	var data = '';

	//console.log('PROJECT_INFORMATION_BY_PID0: '+JSON.stringify(PROJECT_INFORMATION_BY_PID));

	var config_file = path.join(data_dir,'config.ini');


	if(classifier == 'GAST' || classifier == 'gast'){
		status_params = {'type':'update', 'user':req.user.username,
                                'project':project, 'status':'OK-GAST',	'msg':'Starting GAST' };
		helpers.update_status(status_params);
		var gast_options = {
	      scriptPath : req.C.PATH_TO_SCRIPTS,

	      args :       [ '--classifier',classifier, '--config', config_file, '--process_dir', process.env.PWD, 
	      							'--data_dir', data_dir, '-db', NODE_DATABASE, '-ref_db_dir', ref_db_dir, '--host', req.C.hostname ]
	    };
	    console.log('CMD> '+gast_options.scriptPath+'/vamps_script_assign_taxonomy.py '+gast_options.args.join(' '));

		var spawn = require('child_process').spawn;
		var log = fs.openSync(path.join(data_dir,'node.log'), 'a');


		var gast_process = spawn( gast_options.scriptPath+'/vamps_script_assign_taxonomy.py', gast_options.args, {
		                    env:{'LD_LIBRARY_PATH':req.config.LD_LIBRARY_PATH, 
		                        'PATH':req.config.PATH, 
		                        'PERL5LIB':req.config.PERL5LIB,
		                        'SGE_ROOT':req.config.SGE_ROOT, 'SGE_CELL':req.config.SGE_CELL, 'SGE_ARCH':req.config.SGE_ARCH 
		                        },
		                    detached: true, stdio: [ 'ignore', null, log ]		                
		                } );  // stdin, stdout, stderr


		var output = '';
		// communicating with an external python process
		// all the print statements in the py script are printed to stdout
		// so you can grab the projectID here at the end of the process.
		// use looging in the script to log to a file.
		gast_process.stdout.on('data', function (data) {
		  //console.log('stdout: ' + data);
		  data = data.toString().replace(/^\s+|\s+$/g, '');
		  output += data;
		  var lines = data.split('\n');
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
		   if(code === 0){
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
                      	status_params = {'type':'update',  'user':req.user.username,
                                        'project':project, 'status':'GAST-SUCCESS','msg':'GAST -Tax assignments' };
								   
												helpers.assignment_finish_request(res,rows1,rows2,status_params);
												helpers.update_status(status_params);

												ALL_CLASSIFIERS_BY_PID[pid] = classifier+'_'+ref_db_dir;


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




	}else if(classifier == 'RDP' || classifier == 'rdp'){
		status_params = {'type':'update', 'user':req.user.username,
                     'project':project,     'status':'OK-RDP',	'msg':'Starting RDP' };
		helpers.update_status(status_params);

		var rdp_options = {
	      scriptPath : req.C.PATH_TO_SCRIPTS,
	      args :       [ '--classifier',classifier, '--config', config_file, 
	      							'--process_dir',process.env.PWD, '--data_dir', data_dir, 
	      							'-db', NODE_DATABASE, '-ref_db_dir', ref_db_dir,
	      							'-script_dir', req.config.PATH_TO_CLASSIFIER ],
	    };


	  console.log('CMD> '+rdp_options.scriptPath+'/vamps_script_assign_taxonomy.py '+rdp_options.args.join(' '));

		var spawn = require('child_process').spawn;
		var log = fs.openSync(path.join(data_dir,'node.log'), 'a');
		var rdp_process = spawn( rdp_options.scriptPath+'/vamps_script_assign_taxonomy.py', rdp_options.args, {
		                    env:{'LD_LIBRARY_PATH':req.config.LD_LIBRARY_PATH, 'PATH':req.config.PATH, 'PERL5LIB':req.config.PERL5LIB},
		                    detached: true, stdio: [ 'ignore', null, log ]		                
		                } );  // stdin, stdout, stderr


		var output = '';
		// communicating with an external python process
		// all the print statements in the py script are printed to stdout
		// so you can grab the projectID here at the end of the process.
		// use looging in the script to log to a file.
		rdp_process.stdout.on('data', function (data) {
		  //console.log('stdout: ' + data);
		  data = data.toString().replace(/^\s+|\s+$/g, '');
		  output += data;
		  var lines = data.split('\n');
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
		   if(code === 0){
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
													status_params = {'type':'update', 'user':req.user.username,
													               'project':project, 'status':'OK-RDP',	'msg':'Finished RDP'  };

													helpers.assignment_finish_request(res,rows1,rows2,status_params);
													helpers.update_status(status_params);

													ALL_CLASSIFIERS_BY_PID[pid] = classifier+'_'+ref_db_dir;

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
// YOUR PROJECTS
//
router.get('/your_projects', helpers.isLoggedIn,  function(req,res){
		console.log(PROJECT_INFORMATION_BY_PNAME);
    if(req.C.hostname.substring(0,7) == 'bpcweb7'){
        var user_projects_base_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username);
    }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
        var user_projects_base_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username);
    }else{
        var user_projects_base_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
    }
	project_info = {};
	pnames = [];
    fs.readdir(user_projects_base_dir, function(err, items){
		if(err){

			fs.ensureDir(user_projects_base_dir, function (err) {
  			console.log(err); // => null
  			// dir has now been created, including the directory it is to be placed in
			});


		}else{
		    for (var d in items){
                var pts = items[d].split('-');
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
		 		 			var config = iniparser.parseSync(config_file);

		      
  				  	project_info[project_name] = {};
  				  
  				  	pnames.push(project_name);

  				  	//new_status = helpers.get_status(req.user.username,project_name);
  				  	//console.log(new_status); // Async only -- doesn't work
              //console.log(ALL_CLASSIFIERS_BY_PID);
				 			// console.log('2 ',config_file)
							if(project_name in PROJECT_INFORMATION_BY_PNAME){
								project_info[project_name].pid = PROJECT_INFORMATION_BY_PNAME[project_name].pid;
								project_info[project_name].tax_status = 'Taxonomic Data Available';
								project_info[project_name].classified_by = ALL_CLASSIFIERS_BY_PID[PROJECT_INFORMATION_BY_PNAME[project_name].pid];
							}else{
					  		project_info[project_name].pid = 0;
					  		project_info[project_name].tax_status = 'No Taxonomic Assignments Yet';
					  		project_info[project_name].classified_by = 'none';
							}
				  	  project_info[project_name].config = config;
				  	  project_info[project_name].directory = items[d];
				  	  project_info[project_name].mtime = stat_dir.mtime;

			  		}
			  		catch (err) {
			  			console.log('nofile ',err);
			  		}
			  
			  	}

        }
	    }

		  pnames.sort();
		  //console.log(pnames);
		  //console.log(JSON.stringify(project_info));

		}  // readdir/err

			res.render('user_data/your_projects',
			    { title: 'User Projects',
			      pinfo: JSON.stringify(project_info),
			      pnames: pnames,
			  	  env_sources :   JSON.stringify(req.C.ENV_SOURCE),
			  	  failmessage : req.flash('failMessage'),
			  	  successmessage : req.flash('successMessage'),
			      user: req.user, hostname: req.C.hostname
		    });

    });  // readdir

});
//
//   GET -- EDIT_PROJECT: When first enter the page.
//
router.get('/edit_project/:project', helpers.isLoggedIn, function(req,res){
	console.log('in edit project:GET');
	var project_name = req.params.project;
	if(req.C.hostname.substring(0,7) == 'bpcweb7'){
        var user_projects_base_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username);
    }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
        var user_projects_base_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username);
    }else{
	    var user_projects_base_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
	}
	var config_file = path.join(user_projects_base_dir,'project-'+project_name,'config.ini');

	//console.log(config_file);

	var project_info = {};
  	//var stat_config = fs.statSync(config_file);
 	project_info.config = iniparser.parseSync(config_file);

	if(project_name in PROJECT_INFORMATION_BY_PNAME){   // these projects have tax assignments
		console.log(PROJECT_INFORMATION_BY_PNAME[project_name]);
		project_info.pid = PROJECT_INFORMATION_BY_PNAME[project_name].pid;
		project_info.status = 'Taxonomic Data Available';
		project_info.tax = 'GAST';
		project_info.title = PROJECT_INFORMATION_BY_PNAME[project_name].title;
		project_info.pdesc = PROJECT_INFORMATION_BY_PNAME[project_name].description;
		project_info.public = PROJECT_INFORMATION_BY_PNAME[project_name].public;


		//console.log('datasets with dids')
		//project_info.dids = DATASET_IDS_BY_PID[project_info.pid]
		//console.log(PROJECT_INFORMATION_BY_PID[project_info.pid]);
		//console.log(DATASET_IDS_BY_PID[project_info.pid]);

		project_info.dsets = [];
		for(var i = 0; i < ALL_DATASETS.projects.length; i++) {
			if(ALL_DATASETS.projects[i].pid == project_info.pid){
				for(var d = 0; d < ALL_DATASETS.projects[i].datasets.length; d++) {
					var did = ALL_DATASETS.projects[i].datasets[d].did;
					var ds  = ALL_DATASETS.projects[i].datasets[d].dname;
					var ddesc = ALL_DATASETS.projects[i].datasets[d].ddesc;

					project_info.dsets.push({ "did":did, "name":ds, "ddesc":ddesc });
				}
			}
		}


	}else{
		project_info.pid =0;
		project_info.status = 'No Taxonomic Assignments Yet';
		project_info.tax = 0;
		project_info.dsets = [];
		project_info.title = project_info.config.GENERAL.project_title;
		project_info.pdesc = project_info.config.GENERAL.project_description;
		if(project_info.config.GENERAL.public == 'True' || project_info.config.GENERAL.public == 1){
			project_info.public = 1;
		}else{
			project_info.public = 0;
		}

		for(var ds in project_info.config.DATASETS) {
			project_info.dsets.push({ "did":'', "name":ds, "ddesc":'' });
		}

	}

	res.render('user_data/edit_project', {
				title       : 'Edit Project',
				project     : project_name,
				pinfo       : JSON.stringify(project_info),
				env_sources : JSON.stringify(req.C.ENV_SOURCE),
				message     : req.flash('message'),
	    	user: req.user, hostname: req.C.hostname,
	  });
});

//
//   POST -- EDIT_PROJECT:  for accepting changes and re-showing the page
//

router.post('/edit_project', helpers.isLoggedIn, function(req,res){
	console.log('in edit project:POST');
	console.log(req.body);


	if(req.body.new_project_name && req.body.new_project_name != req.body.old_project_name){
		if(req.body.new_project_name in PROJECT_INFORMATION_BY_PNAME){
			console.log('ERROR');
			req.flash('message', 'That project name is taken -- choose another.');
			res.redirect('/user_data/edit_project/'+req.body.old_project_name);
			return;
		}
	}


	// UPDATE DB if TAX ASSIGNMENTS PRESENT
	if(req.body.project_pid !== 0){
		//sql call to projects, datasets
		var p_sql = "UPDATE project set project='"+req.body.new_project_name+"',\n";
		p_sql += " title='"+helpers.mysql_real_escape_string(req.body.new_project_title)+"',\n";
		p_sql += " rev_project_name='"+helpers.reverse(req.body.new_project_name)+"',\n";
		p_sql += " project_description='"+helpers.mysql_real_escape_string(req.body.new_project_description)+"',\n";
		if(req.body.new_privacy == 'False'){
			p_sql += " public='0'\n";
		}else{
			p_sql += " public='1'\n";
		}
		p_sql += " WHERE project_id='"+req.body.project_pid+"' ";
		console.log(p_sql);
    connection.query(p_sql, function(err, rows, fields){
       if(err){
         console.log('ERROR-in project update: '+err);
       }else{
         console.log('OK- project info updated: '+req.body.project_pid);
       }
    });

    // TODO  needed updates to data objects:
    //1- PROJECT_INFORMATION_BY_PNAME
    //console.log('PROJECT_INFORMATION_BY_PNAME')
    //console.log(PROJECT_INFORMATION_BY_PNAME);
    var tmp = PROJECT_INFORMATION_BY_PNAME[req.body.old_project_name];
    delete PROJECT_INFORMATION_BY_PNAME[req.body.old_project_name];
    PROJECT_INFORMATION_BY_PNAME[req.body.new_project_name] = tmp;
    //console.log(PROJECT_INFORMATION_BY_PNAME);

    //2- PROJECT_INFORMATION_BY_PID
    //console.log('PROJECT_INFORMATION_BY_PID')
		//console.log(PROJECT_INFORMATION_BY_PID[req.body.project_pid]);
    PROJECT_INFORMATION_BY_PID[req.body.project_pid].project         = req.body.new_project_name;
    PROJECT_INFORMATION_BY_PID[req.body.project_pid].env_source_name = req.C.ENV_SOURCE[req.body.new_env_source_id];
    PROJECT_INFORMATION_BY_PID[req.body.project_pid].title           = req.body.new_project_title;
    PROJECT_INFORMATION_BY_PID[req.body.project_pid].description     = req.body.new_project_description;
    if(req.body.new_privacy == 'False'){
    	PROJECT_INFORMATION_BY_PID[req.body.project_pid].public = 0;
    }else{
    	PROJECT_INFORMATION_BY_PID[req.body.project_pid].public = 1;
    }

		//console.log(PROJECT_INFORMATION_BY_PID[req.body.project_pid]);

    for(var d in req.body.new_dataset_names){
    
    	var d_sql = "UPDATE dataset set dataset='"+req.body.new_dataset_names[d]+"',\n";
			d_sql += " env_sample_source_id='"+req.body.new_env_source_id+"',\n";
			d_sql += " dataset_description='"+helpers.mysql_real_escape_string(req.body.new_dataset_descriptions[d])+"'\n";
			d_sql += " WHERE dataset_id='"+req.body.dataset_ids[d]+"' ";
			d_sql += " AND project_id='"+req.body.project_pid+"' ";
			console.log(d_sql);
			connection.query(d_sql, function(err, rows, fields){
        if(err){
          console.log('ERROR - in dataset update: '+err);
        }else{
        	console.log('OK - dataset info updated: '+req.body.dataset_ids[d]);
        }
      });
      //3- DATASET_NAME_BY_DID
    	//console.log('DATASET_NAME_BY_DID')
    	//console.log(DATASET_NAME_BY_DID[req.body.dataset_ids[d]]);
			DATASET_NAME_BY_DID[req.body.dataset_ids[d]] = req.body.new_dataset_names[d];
			//console.log(DATASET_NAME_BY_DID[req.body.dataset_ids[d]]);
    }



    //4- ALL_DATASETS
    //console.log('ALL_DATASETS')
    //console.log(ALL_DATASETS.projects[0]);
    for(var i = 0; i < ALL_DATASETS.projects.length; i++) {
			if(ALL_DATASETS.projects[i].pid == req.body.project_pid) {
				ALL_DATASETS.projects[i].name = req.body.new_project_name;
				ALL_DATASETS.projects[i].title = req.body.new_project_title;


				for(var d = 0; d < ALL_DATASETS.projects[i].datasets.length; d++) {
					var did = ALL_DATASETS.projects[i].datasets[d].did;
					var idx = req.body.dataset_ids.indexOf(did.toString());
					ALL_DATASETS.projects[i].datasets[d].dname = req.body.new_dataset_names[idx];
					ALL_DATASETS.projects[i].datasets[d].ddesc = req.body.new_dataset_descriptions[idx];

				}
			}
		}

	}


	var project_info = {};
	var project_name = req.body.old_project_name;
	if(req.C.hostname.substring(0,7) == 'bpcweb7'){
        var user_projects_base_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username);
    }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
        var user_projects_base_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username);
    }else{
	    var user_projects_base_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
	}
	var project_dir = path.join(user_projects_base_dir,'project-'+project_name);
	var config_file = path.join(project_dir,'config.ini');
    var timestamp = +new Date();  // millisecs since the epoch!
	var config_file_bu = path.join(project_dir,'config'+timestamp+'.ini');
	fs.copy(config_file, config_file_bu, function (err) {
  	  	if (err){
  	  		console.log(err);
  	  	}else{
  	  		console.log("copy success!");
  	  	}
	}); // copies fi
	//console.log(config_file);


	project_info.config = iniparser.parseSync(config_file);



	//console.log('config:');
	//console.log(JSON.stringify(project_info.config));
	// HAS NO ASSIGNMENTS: NEED CHANGE FILES ONLY
	// changing data on the system must take this into account:
	// if the project has no assignments yet then it has no data in the database (ie no pid).
	// So just (1)alter the config.ini and the (2)directory name where it is located in user_data/NODE_DATABASE/<user>/project:*
	// Also the dataset (3)directories need to be updated.

	config_info = {};

	if(req.body.new_project_name && req.body.new_project_name != req.body.old_project_name){
		console.log('updating project name');
		var new_project_name = req.body.new_project_name.replace(/[\s+,;:]/g,'_');
		config_info.project = new_project_name;
		project_info.config.GENERAL.project=new_project_name;
		new_base_dir = path.join(user_projects_base_dir,'project-'+new_project_name);
		new_config_file = path.join(new_base_dir,'config.ini');
		new_fasta_file = path.join(new_base_dir,'fasta.fa');
		config_info.baseoutputdir = new_base_dir;
		config_info.configPath = new_config_file;
		config_info.fasta_file = new_fasta_file;
		project_name = new_project_name;

	}else{
		config_info.project = project_name;
		config_info.baseoutputdir = project_info.config.GENERAL.baseoutputdir;
		config_info.configPath = project_info.config.GENERAL.configPath;
		config_info.fasta_file = project_info.config.GENERAL.fasta_file;
	}

	if(req.body.new_project_title){
		console.log('updating project title');

		config_info.project_title = req.body.new_project_title;
		project_info.config.GENERAL.project_title = req.body.new_project_title;
	}else{
		config_info.project_title = project_info.config.GENERAL.project_title;
	}
	if(req.body.new_project_description){
		console.log('updating project description');
		config_info.project_description = req.body.new_project_description;
		project_info.config.GENERAL.project_description = req.body.new_project_description;
	}else{
		config_info.project_description = project_info.config.GENERAL.project_description;
	}

	config_info.platform = project_info.config.GENERAL.platform;
	config_info.owner = project_info.config.GENERAL.owner;
	config_info.config_file_type = project_info.config.GENERAL.config_file_type;
	if(req.body.new_privacy != project_info.config.GENERAL.public){
		console.log('updating privacy');
		config_info.public = req.body.new_privacy;
		project_info.config.GENERAL.public =req.body.new_privacy;
	}else{
		config_info.public = project_info.config.GENERAL.public;
	}

	config_info.fasta_type = project_info.config.GENERAL.fasta_type;
	config_info.dna_region = project_info.config.GENERAL.dna_region;
	config_info.project_sequence_count = project_info.config.GENERAL.project_sequence_count;
	config_info.domain = project_info.config.GENERAL.domain;
	config_info.number_of_datasets = project_info.config.GENERAL.number_of_datasets;
	config_info.sequence_counts = project_info.config.GENERAL.sequence_counts;

	if(req.body.new_env_source_id != project_info.config.GENERAL.env_source_id){
		console.log('updating env id');
		config_info.env_source_id = req.body.new_env_source_id;
		project_info.config.GENERAL.env_source_id = req.body.new_env_source_id;
	}else{
		config_info.env_source_id = project_info.config.GENERAL.env_source_id;
	}

	config_info.has_tax = project_info.config.GENERAL.has_tax;

	var old_dataset_array = Object.keys(project_info.config.DATASETS).map(function(k) { return k; });
	var counts_array = Object.keys(project_info.config.DATASETS).map(function(k) { return project_info.config.DATASETS[k]; });
	console.log(old_dataset_array);
	project_info.config.DATASETS={};
	config_info.datasets = [];
	for(var n in req.body.dataset_ids){
		new_dataset_name = req.body.new_dataset_names[n].replace(/[\s+,;:]/g,'_');
		config_info.datasets.push({"oldname":old_dataset_array[n],"dsname":new_dataset_name,"did":req.body.dataset_ids[n],"count":counts_array[n]});
	}

	//console.log(config_info.datasets);
	if(req.body.project_pid > 0){
		// TODO: HAS ASSIGNMENTS: NEED CHANGE DB & FILES
		// If the project has assignments:
		// change the three places on the file system as above but also:
		// the project_name,title,description and public in NODE_DATABASE.project
		// and the dataset_name,description and env_id in NODE_DATABASE.dataset
		// Also need to update PROJECT_INFORMATION_BY_PNAME
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


	if(req.body.new_project_name && req.body.new_project_name != req.body.old_project_name){
		config_info.old_base_name = project_info.config.GENERAL.baseoutputdir;
		update_config(res,req, config_file, config_info, true, 'Updated project: '+config_info.project);
	}else{
		update_config(res,req, config_file, config_info,  false, 'Updated project: '+config_info.project);
	}


});
//
//  UPLOAD  METADATA
//
router.post('/upload_metadata', [helpers.isLoggedIn, upload.single('upload_file', 12)], function(req,res){
	var project = req.body.project_name;
	var file_format = req.body.metadata_file_format;
	var original_metafile = path.join(process.env.PWD,req.file.path);
	var username = req.user.username;
	console.log('1-req.body upload_metadata');
  console.log(req.body);
  console.log(req.file);
  console.log('2-req.body upload_metadata');
  var has_tax = false;
  if(project in PROJECT_INFORMATION_BY_PNAME){
  	has_tax = true;
  
  }

  var timestamp = +new Date();  // millisecs since the epoch!
  if(req.C.hostname.substring(0,7) == 'bpcweb7'){
        var data_repository = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username,'project-'+project);
  }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
        var data_repository = path.join('/groups/vampsweb/vamps_user_data/',req.user.username,'project-'+project);
  }else{
        var data_repository = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project-'+project);
  }
  //var new_metafile = path.join(data_repository,'metadata_'+timestamp+'.csv');
  // fs.move(original_metafile, new_metafile, function (err) {
		//     	if (err) {
		// 				req.flash('failMessage', '1-File move failure  '+err);
		// 				status_params = {'type':'update', 'user':req.user.username,
		// 									'project':project, 'status':'FAIL-1',	'msg':'1-File move failure'  }
		// 				helpers.update_status(status_params);
		// 				res.redirect("/user_data/import_data");
		// 				return;
		// 			}
					var options = { scriptPath : req.C.PATH_TO_SCRIPTS,
		        			args : [ '-i', original_metafile, '-t',file_format,'-o', username, '-p', project, '-db', NODE_DATABASE, '-add','-pdir',process.env.PWD,]
		    			};
					if(has_tax){
						options.args = options.args.concat(['--has_tax']);
					}
					console.log(options.scriptPath+'/metadata_utils.py '+options.args.join(' '));
					var spawn = require('child_process').spawn;
					var log = fs.openSync(path.join(process.env.PWD,'node.log'), 'a');
					var upload_metadata_process = spawn( options.scriptPath+'/metadata_utils.py', options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
					var output = '';
					upload_metadata_process.stdout.on('data', function (data) {
					  console.log('stdout: ' + data);
					  data = data.toString().replace(/^\s+|\s+$/g, '');
					  output += data;

					  // var lines = data.split('\n')
					  // for(var n in lines){
					  // 	//console.log('line: ' + lines[n]);
							// if(lines[n].substring(0,4) == 'PID='){
							// 	console.log('pid line '+lines[n]);
							// }
					  // }
					});
					upload_metadata_process.on('close', function (code) {
				   console.log('upload_metadata_process exited with code ' + code);
				   var ary = output.split("\n");
				   var last_line = ary[ary.length - 1];
				   if(code === 0){
					   		console.log('Upload METADATA Success');
					   		//console.log('PID last line: '+last_line)
					   		//var ll = last_line.split('=');
					   		// possible multiple pids
					    	if(has_tax){
					   			console.log(PROJECT_INFORMATION_BY_PNAME[project]);
					   			pid = PROJECT_INFORMATION_BY_PNAME[project].pid;
									connection.query(queries.get_select_datasets_queryPID(pid), function(err, rows1, fields){
								    if (err)  {
							 		  	console.log('1-Upload METADATA-Query error: ' + err);				 		  			 
							      } else {
			        				   	connection.query(queries.get_select_sequences_queryPID(pid), function(err, rows2, fields){  
			        				   		if (err)  {
			        				 		  	console.log('2-Upload METADATA-Query error: ' + err);        				 		  
			        				    	} else {
			                      												   
															helpers.update_metadata_from_file();
															req.flash('successMessage', 'Metadata Upload in Progress');
			       									res.redirect("/user_data/import_choices");
			        				    	}

			        				   	});
								   	} // end else

							   	});
								}else{  // end if(has_tax)
									req.flash('successMessage', 'Metadata Upload in Progress');
			       			res.redirect("/user_data/import_choices");
								}

				   }else{
				   		// ERROR
				   		//console.log(last_line);
					    console.log('ERROR last line: '+last_line);

			   	  	// NO REDIRECT here
			   	  	req.flash('failMessage', 'Script Error: '+last_line);
			        res.redirect("/user_data/import_choices");
				   }
				});  // end upload_metadata_process ON Close

//	});

});

//
//  UPLOAD DATA
//
router.post('/upload_data', [helpers.isLoggedIn, upload.array('upload_files', 12)], function(req,res){

  var project = helpers.clean_string(req.body.project);
  var username = req.user.username;
  console.log('1-req.body upload_data');
  console.log(req.body);
  console.log(req.files);
  console.log('2-req.body upload_data');
  console.log(project);
  //console.log(PROJECT_INFORMATION_BY_PNAME);
  var fs_old   = require('fs');
  if(project === '' || req.body.project === undefined){
		req.flash('failMessage', 'A project name is required.');
		res.redirect("/user_data/import_data");
		return;
  }else if(project in PROJECT_INFORMATION_BY_PNAME){
		req.flash('failMessage', 'That project name is already taken.');
		res.redirect("/user_data/import_data");
		return;
  }else if(req.files[0].filename === undefined || req.files[0].size === 0){
  	    req.flash('failMessage', 'A fasta file is required.');
		res.redirect("/user_data/import_data");
		return;
  }else if(req.files[1].filename === undefined || req.files[1].size === 0){
  	    req.flash('failMessage', 'A metadata csv file is required.');
		res.redirect("/user_data/import_data");
		return;
  }else{
		    if(req.C.hostname.substring(0,7) == 'bpcweb7'){
		        var data_repository = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username,'project-'+project);
		    }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
                var data_repository = path.join('/groups/vampsweb/vamps_user_data/',req.user.username,'project-'+project);
		    }else{ 
		        var data_repository = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username,'project-'+project);
		    }
		    console.log(data_repository);
			status_params = {'type':'new', 'user':req.user.username,
											'project':project, 'status':'OK',	'msg':'Upload Started'  };
			helpers.update_status(status_params);
			var options = { scriptPath : req.C.PATH_TO_SCRIPTS,
		        			args :       [ '-dir', data_repository, '-o', username, '-p', project]
		    			};
			if(req.body.type == 'simple_fasta'){
			    if(req.body.dataset === '' || req.body.dataset === undefined){
				  	req.flash('failMessage', 'A dataset name is required.');
				  	res.redirect("/user_data/import_data");
				  	return;
					}
					options.args = options.args.concat(['-t', 'single', '-d', req.body.dataset ]);
		  }else if(req.body.type == 'multi_fasta') {
					options.args = options.args.concat(['-t', 'multi' ]);
		  }else{
					req.flash('failMessage', 'No file type info found');
					res.redirect("/user_data/import_data");
					return;
		  }
			var original_fastafile = path.join(process.env.PWD, 'tmp', req.files[0].filename);
			var original_metafile  = path.join(process.env.PWD, 'tmp', req.files[1].filename);
			//console.log(original_fastafile);
			//console.log(original_metafile);
		 	// move files to user_data/<username>/ and rename
			var LoadDataFinishRequest = function() {
					// START STATUS //
					req.flash('successMessage', "Upload in Progress: '"+ project+"'");

					// type, user, project, status, msg

					res.render('success', {  title   : 'VAMPS: Import Success',
								          message : req.flash('successMessage'),
					                display : "Import_Success",
						              user    : req.user
						        });
			};
			
			fs.move(original_fastafile, path.join(data_repository,'fasta.fa'), function (err) {
		    	if (err) {
						req.flash('failMessage', '1-File move failure  '+err);
						status_params = {'type':'update', 'user':req.user.username,
											'project':project, 'status':'FAIL-1',	'msg':'1-File move failure'  };
						helpers.update_status(status_params);
						res.redirect("/user_data/import_data");
						return;
					}
			  	fs.move(original_metafile,  path.join(data_repository,'meta_original.csv'), function (err) {
			    	if (err) {
							req.flash('failMessage', '2-File move failure '+err);
							status_params = {'type':'update', 'user':req.user.username,
											'project':project, 'status':'FAIL-2',	'msg':'2-File move failure'  };
							helpers.update_status(status_params);
							res.redirect("/user_data/import_data");
							return;
						}

                fs_old.chmod(data_repository, 0775, function (err) {
			    if (err) {
			        console.log(err)
			        return;
			    }
				    console.log(options.scriptPath+'/vamps_load_trimmed_data.py '+options.args.join(' '));

				    var spawn = require('child_process').spawn;
						var log = fs.openSync(path.join(data_repository,'node.log'), 'a');
						var load_trim_process = spawn( options.scriptPath+'/vamps_load_trimmed_data.py', options.args, {
						    env:{'LD_LIBRARY_PATH':req.config.LD_LIBRARY_PATH, 'PATH':req.config.PATH},
						    detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
						var output = '';

						load_trim_process.stdout.on('data', function (data) {
						  console.log('stdout: ' + data);
						  data = data.toString().replace(/^\s+|\s+$/g, '');
						  output += data;
						  var lines = data.split('\n');

						});
						
						load_trim_process.on('close', function (code) {
						   console.log('load_trim_process process exited with code ' + code);
						   var ary = output.split("\n");
						   var last_line = ary[ary.length - 1];
						   if(code === 0){
							   	console.log('Load Success');
							   	status_params = {'type':'update', 'user':req.user.username,
								 			'project':project, 'status':'LOADED',	'msg':'Project is loaded --without tax assignments'  };
						   		helpers.update_status(status_params);
						   		console.log('Finished loading '+project);
						   		LoadDataFinishRequest();
							 }else{
								 	req.flash('failMessage', 'Script Failure: '+last_line);
								  status_params = {'type':'update', 'user':req.user.username,
												'project':project, 'status':'Script Failure',	'msg':'Script Failure'  };
								  helpers.update_status(status_params);
								  res.redirect("/user_data/import_data?import_type="+req.body.type);  // for now we'll send errors to the browser
								  return;
							 }
						});

			  	}); // END move 2
			}); // END move 1
			});  // end mkdir

  }
  

});

//
// UPLOAD DATA TAX-BY-SEQ
//
router.post('/upload_data_tax_by_seq',  [helpers.isLoggedIn, upload.array('upload_files', 12)], function(req,res){

	console.log('upload_data_tax_by_seq');
	var project = req.body.project || '';
	var use_original_names = req.body.use_original_names || 'off';
  var username = req.user.username;
  var use_file_taxonomy = req.body.use_tax_from_file;
  console.log('1req.body upload_data_tax_by_seq');
  console.log(req.body);
  console.log(req.files);  // array
  console.log('project: '+project);
  console.log('use_original_names: '+use_original_names);
  console.log('2req.body upload_data_tax_by_seq');
  //console.log(project);
  //console.log(PROJECT_INFORMATION_BY_PNAME);

  if((project === '' || req.body.project === undefined) && req.body.use_original_names != 'on'){
		req.flash('failMessage', 'A project name is required.');
		res.redirect("/user_data/import_data");
		return;
  }else if(project in PROJECT_INFORMATION_BY_PNAME){
		req.flash('failMessage', 'That project name is already taken.');
		res.redirect("/user_data/import_data");
		return;
  }else if(req.files[0].filename === undefined || req.files[0].size === 0){
  	req.flash('failMessage', 'A tax_by_seq file is required.');
		res.redirect("/user_data/import_data");
		return;
  }else{

    console.log('working');
			//var file_path = path.join(process.env.PWD,req.file.path);
			//var original_taxbyseqfile = path.join('./user_data', NODE_DATABASE, 'tmp', req.files[0].filename);
			//var original_metafile  = path.join('./user_data', NODE_DATABASE, 'tmp', req.files[1].filename);
			var original_taxbyseqfile = path.join(process.env.PWD, 'tmp',req.files[0].filename); //path.join('./user_data', NODE_DATABASE, 'tmp', req.files[0].filename);
			console.log(original_taxbyseqfile);
			var original_metafile  = '';
			try{
				original_metafile  = path.join(process.env.PWD, 'tmp',req.files[1].filename); //path.join('./user_data', NODE_DATABASE, 'tmp', req.files[1].filename);
			}
			catch(err){
				console.log(err);
			}

			console.log(original_metafile);


			var options = { scriptPath : req.C.PATH_TO_SCRIPTS,
		        			args :       [ '-file', original_taxbyseqfile, '-o', username, '-pdir',process.env.PWD,'-db', NODE_DATABASE ]
		    			};
			if(original_metafile){
				options.args = options.args.concat(['-md_file',original_metafile]);
			}
			if(req.body.use_tax_from_file === 1){
				options.args = options.args.concat(['-use_tax']);
			}
			if(use_original_names == 'on'){
					options.args = options.args.concat(['-orig_names']);
		  }else if(use_original_names == 'off'){
					options.args = options.args.concat(['-p', project]);
		  }else{
					req.flash('failMessage', 'No file type info found:  ');
					res.redirect("/user_data/import_data");
					return;
		  }
			//var original_tax_by_seq = path.join('./user_data', NODE_DATABASE, 'tmp', req.file.filename);

			//console.log(original_fastafile);
			//console.log(original_metafile);
		 	// move files to user_data/<username>/ and rename
			var LoadDataFinishRequest = function() {
					// START STATUS //
					req.flash('successMessage', "Upload in Progress: 'TaxBySeq File'");

					// type, user, project, status, msg

					res.render('success', {  title   : 'VAMPS: Import Success',
								          message : req.flash('successMessage'),
					                display : "Import_Success",
						              user    : req.user
						  });
			};

	  
				//console.log('Moved file '+req.file.filename+ ' to '+path.join(data_dir,'tax_by_seq.txt'))

		    console.log(options.scriptPath+'/vamps_load_tax_by_seq.py '+options.args.join(' '));
		    return;
		    var spawn = require('child_process').spawn;
				var log = fs.openSync(path.join(process.env.PWD,'node.log'), 'a');
				var tax_by_seq_process = spawn( options.scriptPath+'/vamps_load_tax_by_seq.py', options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
				var output = '';
				// communicating with an external python process
				// all the print statements in the py script are printed to stdout
				// so you can grab the projectID here at the end of the process.
				// use looging in the script to log to a file.
				tax_by_seq_process.stdout.on('data', function (data) {
					  //console.log('stdout: ' + data);
					  data = data.toString().replace(/^\s+|\s+$/g, '');
					  output += data;
					  var lines = data.split('\n');
					  for(var n in lines){
					  	//console.log('line: ' + lines[n]);
							if(lines[n].substring(0,4) == 'PID='){
								console.log('pid line '+lines[n]);
							}
					  }
				});
				tax_by_seq_process.on('close', function (code) {
				   console.log('tax_by_seq_process process exited with code ' + code);
				   var ary = output.split("\n");
				   var last_line = ary[ary.length - 1];
				   if(code === 0){
					   console.log('TAXBYSEQ Success');
					   //console.log('PID last line: '+last_line)
					   var ll = last_line.split('=');
					   // possible multiple pids
					   pid_list = ll[1].split('-');
					   for(var i in pid_list){
						   //var pid = ll[1];
						   var pid = pid_list[i];
						   console.log('NEW PID=: '+pid);
						   console.log('ALL_DATASETS: '+JSON.stringify(ALL_DATASETS));
						   if(helpers.isInt(pid)){

			            connection.query(queries.get_select_datasets_queryPID(pid), function(err, rows1, fields){
								    if (err)  {
							 		  	console.log('1-TAXBYSEQ-Query error: ' + err);				 		  			 
							      } else {
			        				   	connection.query(queries.get_select_sequences_queryPID(pid), function(err, rows2, fields){  
			        				   		if (err)  {
			        				 		  	console.log('2-TAXBYSEQ-Query error: ' + err);        				 		  
			        				    	} else {
			                      	status_params = {'type':'update', 'user':req.user.username,
			                                        'pid':pid,'status':'TAXBYSEQ-SUCCESS','msg':'TAXBYSEQ -Tax assignments' };
											   
															helpers.assignment_finish_request(res,rows1,rows2,status_params);
															helpers.update_status(status_params);
															ALL_CLASSIFIERS_BY_PID[pid] = 'unknown';


			        				    	}

			        				   	});
								   	} // end else

							   });

				           }else{ // end if int
			                   console.log('ERROR pid is not an integer: '+pid.toString());
						   }
						 } // end for pid in pid_list
				   }else{
				   		// ERROR
				   		console.log(output);
					    console.log('ERROR last line: '+code);
			   	  	// NO REDIRECT here
			   	  	//req.flash('message', 'Script Error'+last_line);
			        //res.redirect("/user_data/your_projects");
				   }
				});  // end tax_by_seq_process ON Close



  }
  LoadDataFinishRequest();


});

//
//  FILE UTILS
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
	      if(req.C.hostname.substring(0,7) == 'bpcweb7'){
            var file = path.join('/groups/vampsweb/vampsdev_user_data/',user,req.query.filename);
          }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
            var file = path.join('/groups/vampsweb/vamps_user_data/',user,req.query.filename);
          }else{
	        var file = path.join(process.env.PWD,'user_data',NODE_DATABASE,user,req.query.filename);
	      }
		  res.setHeader('Content-Type', 'text');
		  res.download(file); // Set disposition and send it.
	///// DELETE /////
	}else if(req.query.fxn == 'delete'){
	    if(req.C.hostname.substring(0,7) == 'bpcweb7'){
            var file = path.join('/groups/vampsweb/vampsdev_user_data/',user,req.query.filename);
        }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
            var file = path.join('/groups/vampsweb/vamps_user_data/',user,req.query.filename);
        }else{
	        var file = path.join(process.env.PWD,'user_data',NODE_DATABASE,user,req.query.filename);
		}
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

});

//
// DOWNLOAD SEQUENCES
//
router.post('/download_selected_seqs', helpers.isLoggedIn, function(req, res) {
  var db = req.db;
  console.log('seqs req.body-->>');
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
  if(req.C.hostname.substring(0,7) == 'bpcweb7'){
        var user_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username);
  }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
        var user_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username);
  }else{
        var user_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
  }
  helpers.mkdirSync(path.join('user_data',NODE_DATABASE));
  helpers.mkdirSync(user_dir);  // create dir if not exists
  var file_name;
  var out_file_path;

  if(req.body.download_type == 'whole_project'){

		var pid = req.body.project_id;
		var project = req.body.project;
		file_name = 'fasta:'+timestamp+'_'+project+'.fa.gz';
  	out_file_path = path.join(user_dir,file_name);
  	qSelect += " where project_id = '"+pid+"'";

  }else if(req.body.download_type == 'partial_project'){

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
			add_where = ' WHERE ';
			for(var n in tax_items){
				rank = req.C.RANKS[n];
				qSelect += ' JOIN `'+rank+ '` using ('+rank+'_id)\n';
				add_where += '`'+rank+"`='"+tax_items[n]+"' and ";
			}
			qSelect = qSelect + add_where.substring(0, add_where.length - 5);

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
        console.log(JSON.stringify(req.user));
        var info = {
              to : req.user.email,
              from : "vamps@mbl.edu",
              subject : "fasta file is ready",
              text : "Your fasta file is ready here:\n\nhttp://localhost:3000/"+"export_data/"
            };
        helpers.send_mail(info);


      });

  });

  res.send(file_name);

});

//
// DOWNLOAD METADATA
//
router.post('/download_selected_metadata', helpers.isLoggedIn, function(req, res) {
  var db = req.db;
  console.log('meta req.body-->>');
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
        //console.log(JSON.stringify(req.user))
        var info = {
              to : req.user.email,
              from : "vamps@mbl.edu",
              subject : "metadata is ready",
              text : "Your metadata file is ready here:\n\nhttp://localhost:3000/"+"export_data/"
        };
        helpers.send_mail(info);
        //req.flash('Done')



      });

  	res.send(file_name);
});

//
// DOWNLOAD MATRIX
//
router.post('/download_selected_matrix', helpers.isLoggedIn, function(req, res) {
  	var db = req.db;
  	console.log('matrix req.body-->>');
  	console.log(req.body);
  	//var timestamp = +new Date();  // millisecs since the epoch!
		for (var i in biom_matrix.rows){
 			row_txt = '';
 			row_txt += biom_matrix.rows[i].name;
 			console.log(row_txt);
 		}

		var user_dir = path.join('user_data',NODE_DATABASE,req.user.username);
		helpers.mkdirSync(path.join('user_data',NODE_DATABASE));
		helpers.mkdirSync(user_dir);  // create dir if not exists


		dids = JSON.parse(req.body.datasets).ids;
		var timestamp = req.body.ts;
		var file_name = 'matrix:'+timestamp+'.csv';
		//out_file_path = path.join(user_dir, file_name);


		var out_file = path.join('user_data',NODE_DATABASE,req.user.username,file_name);
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
		//.pipe(gzip)
		.pipe(wstream)
		.on('finish', function () {  // finished
		  console.log('done compressing and writing file');
		});


		console.log('dids');
		console.log(dids);
		res.send(file_name);

});
//
// <<<< FUNCTIONS >>>>
//
function update_config(res,req, config_file, config_info, has_new_pname, msg){
	console.log(config_info);
	var new_config_txt = "[GENERAL]\n";
	new_config_txt += "project="+config_info.project+"\n";
	new_config_txt += "baseoutputdir="+config_info.baseoutputdir+"\n";
	new_config_txt += "configPath="+config_info.configPath+"\n";
	new_config_txt += "fasta_file="+config_info.fasta_file+"\n";


	new_config_txt += "project_title="+helpers.mysql_real_escape_string(config_info.project_title)+"\n";
	new_config_txt += "project_description="+helpers.mysql_real_escape_string(config_info.project_description)+"\n";


	new_config_txt += "platform="+config_info.platform+"\n";
	new_config_txt += "owner="+config_info.owner+"\n";
	new_config_txt += "config_file_type="+config_info.config_file_type+"\n";
	new_config_txt += "public="+config_info.public+"\n";
	new_config_txt += "fasta_type="+config_info.fasta_type+"\n";
	new_config_txt += "dna_region="+config_info.dna_region+"\n";
	new_config_txt += "project_sequence_count="+config_info.project_sequence_count+"\n";
	new_config_txt += "domain="+config_info.domain+"\n";
	new_config_txt += "number_of_datasets="+config_info.number_of_datasets+"\n";
	new_config_txt += "sequence_counts="+config_info.sequence_counts+"\n";
	new_config_txt += "env_source_id="+config_info.env_source_id+"\n";
	new_config_txt += "has_tax="+config_info.has_tax+"\n\n";
	new_config_txt += "[DATASETS]\n";

	for(var n in config_info.datasets){
			new_config_txt += config_info.datasets[n].dsname+"="+config_info.datasets[n].count+"\n";
	}

	console.log(new_config_txt);

	fs.writeFile(config_file, new_config_txt, function(err){
        if(err){
					console.log(err);
					res.send(err);
        }else{
          console.log('write new config file success');
				  	if(has_new_pname){
						// now change the directory name if the project_name is being updated
							old_base_dir = config_info.old_base_name;
							new_base_name = config_info.baseoutputdir;
							fs.move(old_base_dir, new_base_dir, function(err){
								if(err){
									console.log(err);
									res.send(err);
								}else{
						  
									update_dataset_names(config_info);
									req.flash('successMessage', msg);
									res.redirect('/user_data/your_projects');

								}

							});
					}else{

						update_dataset_names(config_info);
						req.flash('successMessage', msg);
						res.redirect('/user_data/your_projects');

					}

        }
    });


}
function update_dataset_names(config_info){

		for(var n in config_info.datasets){

					old_name_path = path.join(config_info.baseoutputdir,'analysis',config_info.datasets[n].oldname);
					new_name_path = path.join(config_info.baseoutputdir,'analysis',config_info.datasets[n].dsname);
					console.log(old_name_path);
					console.log(new_name_path);
					fs.move(old_name_path, new_name_path, function(err){
						if(err){
							console.log('WARNING failed to move dataset name '+err.toString());
						}else{
							console.log('moving '+config_info.datasets[n].oldname+' to '+config_info.datasets[n].dsname);
						}
					});


		}
}
function create_fasta_file(req, pids){
		var qSelect = "SELECT UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n";
		//var qSelect = "select sequence_comp as seq, sequence_id, seq_count, dataset from sequence_pdr_info\n";
		qSelect += " JOIN sequence using (sequence_id)\n";
		qSelect += " JOIN dataset using (dataset_id)\n";
		qSelect += " JOIN project using (project_id)\n";
		var seq, seqid, seq_count, pjds;
		var timestamp = +new Date();  // millisecs since the epoch!
        if(req.C.hostname.substring(0,7) == 'bpcweb7'){
            var user_dir = path.join('/groups/vampsweb/vampsdev_user_data/',req.user.username);
        }else if(req.C.hostname.substring(0,7) == 'bpcweb8'){
            var user_dir = path.join('/groups/vampsweb/vamps_user_data/',req.user.username);
        }else{
		    var user_dir = path.join(process.env.PWD,'user_data',NODE_DATABASE,req.user.username);
		}
		helpers.mkdirSync(path.join('user_data',NODE_DATABASE));
		helpers.mkdirSync(user_dir);  // create dir if not exists
		var file_name;
		var out_file_path;

		//var pids = JSON.parse(req.body.datasets).ids;
		file_name = 'fasta:'+timestamp+'_'+'_custom.fa.gz';
		out_file_path = path.join(user_dir,file_name);
		qSelect += " where dataset_id in ("+pids+")";

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
		      console.log(JSON.stringify(req.user));
		      var info = {
		            to : req.user.email,
		            from : "vamps@mbl.edu",
		            subject : "fasta file is ready",
		            text : "Your fasta file is ready here:\n\nhttp://localhost:3000/"+"export_data/"
		          };
		      helpers.send_mail(info);


		    });

		});

		res.send(file_name);

}


module.exports = router;