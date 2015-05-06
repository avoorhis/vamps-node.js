var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var path  = require('path');
var fs   = require('fs-extra');
var ini = require('ini');
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

    var export_dir = path.join('user_data',NODE_DATABASE,req.user.username);
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
                           user: req.user.username,
                           finfo: JSON.stringify(file_info),
						message : req.flash('deleteMessage'),
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
router.get('/start_assignment/:project/:method', helpers.isLoggedIn,  function(req,res){
    console.log('start gast');
	console.log(req.params.project);
	var project = req.params.project;
	var method = req.params.method;
	var base_dir = path.join('user_data',NODE_DATABASE,req.user.username,'project:'+project);
	var config_file = path.join(base_dir,'config.ini');
  	
	if(method == 'gast'){
		flash_message = 'GAST has been started for '+project
	}else{
		flash_message = 'RDP has been started for '+project
	}
	req.flash('successMessage', flash_message);
	res.redirect("/user_data/your_projects");
	
	
	
});
//
//
//
router.get('/your_projects', helpers.isLoggedIn,  function(req,res){
  
    var user_projects_base_dir = path.join('user_data',NODE_DATABASE,req.user.username);
   
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
	          
	          stat = fs.statSync(path.join(user_projects_base_dir,items[d]));
			  if(stat.isDirectory()){
				  // stat.mtime.getTime() is for sorting to list in oreder
				  project_info[stat.mtime.getTime()] = {}
				  modify_times.push(stat.mtime.getTime());
				  // need to read config file
				  // check status?? dir strcture: analisis/gast/<ds>
				  var config_file = path.join(user_projects_base_dir,items[d],'config.ini');
				  var config = ini.parse(fs.readFileSync(config_file, 'utf-8'));
				  project_info[stat.mtime.getTime()].config = config;
				  project_info[stat.mtime.getTime()].directory = items[d];
				  project_info[stat.mtime.getTime()].mtime = stat.mtime;
			  }
			  
			  
	        }
	      }
	  
		  modify_times.sort().reverse();
		  
		  console.log(JSON.stringify(project_info));
		  res.render('user_data/your_projects',
		    { title: 'User Projects',
		     
		      pinfo: JSON.stringify(project_info),
		      times: modify_times,
		  	  env_sources :   JSON.stringify(req.C.ENV_SOURCE),
		  	  deletemessage : req.flash('deleteMessage'),
		  	  successmessage : req.flash('successMessage'),
		      user: 	req.user.username
		    });
		}
	
    });
   
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
	res.redirect("/import_data");
  }
  var data_repository = path.join('./user_data',NODE_DATABASE,req.user.username,'project:'+req.body.project);
  console.log(data_repository);
  // continuity checks:
  
	 
  if(req.files.fasta==undefined || req.files.fasta.size==0){
  	req.flash('failMessage', 'A fasta file is required.');
	res.redirect("/import_data");
  }else if(req.files.metadata==undefined || req.files.metadata.size==0 || req.files.metadata.mimetype !== 'text/csv'){
  	req.flash('failMessage', 'A metadata csv file is required.');
	res.redirect("/import_data");
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
			res.redirect("/import_data");
		}
  	fs.move(original_metafile,  path.join(data_repository,'meta.csv'), function (err) {
    	if (err) {
			req.flash('failMessage', '2-File move failure '+err);
			res.redirect("/import_data");
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
			  res.redirect("/import_data");  // for now we'll send errors to the browser
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


module.exports = router;