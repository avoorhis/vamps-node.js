var express = require('express');


var router = express.Router();

var fs   = require('fs-extra');
var path  = require('path');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var zlib = require('zlib');
var Readable = require('stream').Readable;
var helpers = require('./helpers/helpers');
var ds = require('./load_all_datasets');
var PythonShell = require('python-shell');
var sweetcaptcha = new require('sweetcaptcha')('233846', 'f2a70ef1df3edfaa6cf45d7c338e40b8', '720457356dc3156eb73fe316a293af2f');
var rs_ds = ds.get_datasets(function(ALL_DATASETS){
  
  GLOBAL.ALL_DATASETS = ALL_DATASETS;
  

  /* GET home page. */
  router.get('/', function(req, res) {
    res.render('index', {
            title: 'VAMPS:Home',
            message: req.flash('fail'),
            user: req.user });
  });

  /* GET Overview page. */
  router.get('/overview', function(req, res) {
      res.render('overview', { title: 'VAMPS:Overview', user: req.user });
  });



  /* GET Import Data page. */
  router.get('/import_data', helpers.isLoggedIn, function(req, res) {
      res.render('import_data', { 
		    title: 'VAMPS:Import Data',
	  		message: req.flash('successMessage'),
		    failmessage: req.flash('failMessage'),
            user: req.user
                            });
  });
  /* GET Saved Data page. */
  router.get('/saved_data', helpers.isLoggedIn, function(req, res) {
      res.render('saved_data', { title: 'VAMPS:Saved Data',
                             user: req.user
                            });
  });
  /* GET Import Data page. */
  router.get('/export_data', helpers.isLoggedIn, function(req, res) {
      res.render('export_data', { title: 'VAMPS:Import Data',
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
          var pts = files[f].split('_');
          if(pts[1] === 'metadata' || pts[1] === 'fasta'){
            file_info.files.push(files[f]);
            stat = fs.statSync(export_dir+'/'+files[f]);
            file_info.mtime[files[f]] = stat.mtime;  // modify time
            file_info.size[files[f]] = stat.size;
          }
        }
        //console.log(file_info)
        res.render('file_retrieval', { title: 'VAMPS:Export Data',
                             user: req.user.username,
                             finfo: JSON.stringify(file_info),
							message : req.flash('deleteMessage'),
                            });
      });
  });

  router.get('/file_utils', helpers.isLoggedIn, function(req, res){

	//console.log('dnld');
	//console.log(req.query.filename);
	var user = req.query.user;
	var file = path.join('user_data',NODE_DATABASE,user,req.query.filename);
	//console.log(file);
	//// DOWNLOAD //////
	if(req.query.fxn == 'download' && req.query.type == 'fasta'){
		res.download(file); // Set disposition and send it.
	}else if(req.query.fxn == 'download' && req.query.type == 'metadata'){
		res.download(file); // Set disposition and send it.
	}
	
	//// DELETE FILES /////
	if(req.query.fxn == 'delete'){
		if(req.query.type == 'datasets'){
			fs.unlink(file, function(err){
				if(err){ 
					console.log(err); 
				}else{
					req.flash('deleteMessage', 'Deleted: '+req.query.filename);
					res.redirect("/visuals/saved_datasets");
				}	
			}); //
		}else{
			fs.unlink(file, function(err){
				if(err){ 
					console.log(err); 
				}else{
					req.flash('deleteMessage', 'Deleted: '+req.query.filename);
					res.redirect("/file_retrieval");	
				}
			}); //
		}
		
	}
	
	//// VIEW DATA (datasets) /////
	if(req.query.fxn == 'view'){
			
	}
	//// USE DATA (datasets) /////
	// redirect to /visuals/unit_selection
	if(req.query.fxn == 'usethese'){
		
			
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

  /* GET Geo-Distribution page. */
  router.get('/geodistribution', function(req, res) {
      res.render('geodistribution', { title: 'VAMPS:Geo_Distribution',
                             user: req.user
                            });
  });

  /* GET metadata page. */
  router.get('/metadata', function(req, res) {
      res.render('metadata', { title: 'VAMPS:Metadata',
                             user: req.user
                            });
  });

  /* GET Portals page. */
  router.get('/portals', function(req, res) {
      res.render('portals', { title: 'VAMPS:Portals',
                             user: req.user
                            });
  });

  /* GET Contact Us page. */
  router.get('/contact', function(req, res) {

      //get sweetcaptcha html for the contact area
        sweetcaptcha.api('get_html', function(err,html){
            //Send the guts of the captcha to your template
            res.render('contact', {
              captcha : html,
              title: 'VAMPS:Cuntact-Us',
              user: req.user
               });
        });
  });
  router.post('/upload_data',  function(req,res){
      
	  console.log('req.body upload_data');
      console.log(req.body);
	  console.log(req.files);
      console.log('req.body upload_data');
	  var data_repository = path.join('./user_data',NODE_DATABASE,req.user.username,req.body.project);
	  console.log(data_repository);
	  // continuity checks:
	  
	  
	  
	  
		 
	  if(req.body.project==undefined || req.body.dataset==undefined){
		req.flash('failMessage', 'FAIL (project and dataset names are required)');
	  	res.redirect("/import_data");
	  }else if(req.files.fasta==undefined || req.files.fasta.size==0){
	  	req.flash('failMessage', 'FAIL (A fasta file is required)');
		res.redirect("/import_data");
	  }else if(req.files.metadata==undefined || req.files.metadata.size==0 || req.files.metadata.mimetype !== 'text/csv'){
	  	req.flash('failMessage', 'FAIL (A metadata csv file is required)');
		res.redirect("/import_data");
	  }else{
	  	req.flash('successMessage', 'Upload in Progress');
		var project = req.body.project;
		var original_fastafile = path.join('./user_data', NODE_DATABASE, req.files.fasta.name);
		var original_metafile  = path.join('./user_data', NODE_DATABASE, req.files.metadata.name);
		//console.log(original_fastafile);
		//console.log(original_metafile);
	 	// move files to user_data/<username>/ and rename
	  	fs.move(original_fastafile, path.join(data_repository,'fasta.fa'), function (err) {
	    	if (err) return console.error(err);
	  	fs.move(original_metafile,  path.join(data_repository,'meta.csv'), function (err) {
	    	if (err) return console.error(err);
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
				  res.send(err);  // for now we'll send errors to the browser
			  }else{
				  console.log('NO ERRORS')
			  }
			  console.log("success!");
			  res.redirect("/import_data");
		    });
			
	  	});
		});
	  } 
		
		 
	
  });
  //
  //
  //
  router.post('/contact', function(req, res) {

    //Validate captcha
    sweetcaptcha.api('check', {sckey: req.body["sckey"], scvalue: req.body["scvalue"]}, function(err, response){
        if (err) return console.log(err);

        if (response === 'true') {
            // valid captcha

            // setup e-mail data with unicode symbols
            var info = {
                to: 'avoorhis@mbl.edu',
                from: 'vamps@mbl.edu',
                subject: 'New email from your website contact form', // Subject line
                text: req.body["contact-form-message"] + "\n\nYou may contact this sender at: " + req.body["contact-form-mail"] // plaintext body
              };
            send_mail(info);

            //Success
            res.send("Thanks! We have sent your message.");

        }
        if (response === 'false'){
            // invalid captcha
            console.log("Invalid Captcha");
            res.send("Try again");

        }
    });

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
  		file_name = req.user.username+'_fasta_'+timestamp+'_'+project+'.fa.gz';
    	out_file_path = path.join(user_dir,file_name);
    	qSelect += " where project_id = '"+pid+"'";
    }else{
      var pids = JSON.parse(req.body.datasets).ids;
		  file_name = req.user.username+'_fasta_'+timestamp+'_'+'_custom.fa.gz';
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
          send_mail(info);
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
    file_name = req.user.username+'_metadata_'+timestamp+'_'+project+'.gz';
    out_file_path = path.join(user_dir,file_name);
  }else{
    dids = JSON.parse(req.body.datasets).ids;
    file_name = req.user.username+'_metadata_'+timestamp+'.gz';
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
          send_mail(info);
          // transporter.sendMail({
          //   from: 'vamps@mbl.edu',
          //   to: 'avoorhis@mbl.edu',
          //   subject: 'metadata is ready',
          //   text: "Your metadata file is ready here:\n\nhttp://localhost:3000/"+"export_data/"
          // });
        });

    //console.log(datasets);
  });

// transporter.sendMail(mailOptions, function (error, info) {
//                 if (error) {
//                     console.log(error);
//                 } else {
//                     console.log('Message sent: ' + info.response);
//                 }
//             });
  function send_mail(mail_info) {
    var to_addr = mail_info.addr;
    var from_addr = mail_info.from;
    var subj = mail_info.subj;
    var msg = mail_info.msg;
    transporter.sendMail(mail_info, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Message sent: ' + info.response);
                }
            });

    // transporter.sendMail({
    //         from: from_addr,
    //         to: to_addr,
    //         subject: subj,
    //         text: msg
    //       });

  }
  // function IsNumeric(n) {
  //   return !isNaN(parseFloat(n)) && isFinite(n);
  // }
  // function onlyUnique(value, index, self) {
  //   return self.indexOf(value) === index;
  // }
  // var mkdirSync = function (path) {
  //   try {
  //     fs.mkdirSync(path);
  //   } catch(e) {
  //     if ( e.code != 'EEXIST' ) throw e;
  //   }
  // }

});

module.exports = router;
