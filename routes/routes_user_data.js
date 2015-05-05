var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var path  = require('path');
var fs   = require('fs-extra');
//
//
//
router.get('/your_data', helpers.isLoggedIn,  function(req,res){
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
/* GET Import Data page. */
router.get('/export_data', helpers.isLoggedIn, function(req, res) {
    res.render('user_data/export_data', { title: 'VAMPS:Import Data',
                           user: req.user
                          });
});
//
//
//
router.get('/your_projects', helpers.isLoggedIn,  function(req,res){
  
    res.render('user_data/your_projects', {        
      title: 'VAMPS:Data Administration',
      user: req.user
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