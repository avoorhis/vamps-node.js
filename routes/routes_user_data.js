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
router.get('/start_assignment/:project/:method', helpers.isLoggedIn,  function(req,res){
    
	console.log(req.params.project);
	var project = req.params.project;
	var method = req.params.method;
	console.log('start: '+project+' - '+method);
	var base_dir = path.join(process.cwd(),'user_data',NODE_DATABASE,req.user.username,'project:'+project);
	var data = ''
	
		
	
	var config_file = path.join(base_dir,'config.ini');
  	
	if(method == 'gast'){
		
		var options = {
	      scriptPath : 'public/scripts',
	      args :       [ '--classifier','gast', '--config', config_file, '-dir', base_dir, '-db', NODE_DATABASE ],
	    };
	    console.log(options.scriptPath+'/assign_taxonomy.py '+options.args.join(' '));
		
		var spawn = require('child_process').spawn;
		var log = fs.openSync(path.join(base_dir,'node.log'), 'a');
		var python = spawn( options.scriptPath+'/assign_taxonomy.py', options.args, {detached: true, stdio: [ log, log, log ]} );
		// python.stdout.on('data', function (data) {
// 		  console.log('stdout: ' + data);
// 		});

		// python.stderr.on('data', function (data) {
		//   console.log('stderr: ' + data);
		// });
		//
		 python.on('close', function (code) {
		   console.log('child process exited with code ' + code);
		   
		   //var ds = require('./load_all_datasets');
		   
		   
		 });
		
		// PythonShell.run('assign_taxonomy.py', options, function (err, output) {
		// 	      if (err) {
		// 	  console.log('Script ERROR: '+err)
		//   }else{
		// 	console.log('requiring load_all_datasets');
		// 	  		var ds = require('load_all_datasets');
		// 	console.log('running get_datasets');
		// 	  		var rs_ds = ds.get_datasets(function(ALL_DATASETS){
		// 		console.log('re-gathering data');
		// 	});
		//   }
		  
	    //});
		// this returns immediately
		
		
			
	  	req.flash('successMessage', 'GAST has been started for '+project);
      	res.redirect("/user_data/your_projects");
		
	}else{
		var options = {
	      scriptPath : 'public/scripts',
	      args :       [ '--classifier','rdp', '--config', config_file, '-dir', base_dir, '-db', NODE_DATABASE ],
	    };
		req.flash('successMessage', 'RDP has been started for '+project);
		res.redirect("/user_data/your_projects");
		
	}
	
	
	
	
});
//
//
//
router.get('/your_projects', helpers.isLoggedIn,  function(req,res){
  
    var user_projects_base_dir = path.join(process.cwd(),'user_data',NODE_DATABASE,req.user.username);
   
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
  var data_repository = path.join(process.cwd(),'user_data',NODE_DATABASE,req.user.username,'project:'+req.body.project);
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
var file = path.join('user_data',NODE_DATABASE,user,req.query.filename);
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

var user_dir = path.join('user_data',NODE_DATABASE,req.user.username);
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
        for (var k in MetadataValues[did]){
          nm = k;
          val = MetadataValues[did][k];
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