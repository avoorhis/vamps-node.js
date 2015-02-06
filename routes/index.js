var express = require('express');
var router = express.Router();
var fs   = require('fs');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var zlib = require('zlib');
var Readable = require('stream').Readable;

var ds = require('./load_all_datasets');
var rs = ds.get_datasets(function(ALL_DATASETS){
  GLOBAL.ALL_DATASETS = ALL_DATASETS;

  /* GET home page. */
  router.get('/', function(req, res) {
    res.render('index', { title: 'VAMPS:Home', user: req.user });
  });

  /* GET Overview page. */
  router.get('/overview', function(req, res) {
      res.render('overview', { title: 'VAMPS:Overview', user: req.user });
  });

  /* GET Search page. */
  router.get('/search', function(req, res) {
      //console.log(MetadataValues)
      var tmp_metadata_fields = {};
      var metadata_fields = {};
      for(did in MetadataValues){
        for(name in MetadataValues[did]){
            val = MetadataValues[did][name];
            if(name in tmp_metadata_fields){
              tmp_metadata_fields[name].push(val); 
            }else{
              if(IsNumeric(val)){
                tmp_metadata_fields[name]=[];
              }else{
                tmp_metadata_fields[name]=['non-numeric'];
              }
              tmp_metadata_fields[name].push(val); 
            }           
        }
      }
      console.log(tmp_metadata_fields)
      for(name in tmp_metadata_fields){
        if(tmp_metadata_fields[name][0] == 'non-numeric'){
          tmp_metadata_fields[name].shift(); //.filter(onlyUnique);
          metadata_fields[name] = tmp_metadata_fields[name].filter(onlyUnique);
        }else{
          var min = Math.min.apply(null, tmp_metadata_fields[name]);
          var max = Math.max.apply(null, tmp_metadata_fields[name]);
          metadata_fields[name] = {"min":min,"max":max};
        }
      }
      console.log(metadata_fields)
      res.render('search', { title: 'VAMPS:Search',
                            metadata_items: JSON.stringify(metadata_fields),
      											 user: req.user
      											});
  });

  /* GET Import Data page. */
  router.get('/import_data', function(req, res) {
      res.render('import_data', { title: 'VAMPS:Import Data', 
                             user: req.user 
                            });
  });
  /* GET Import Data page. */
  router.get('/export_data', function(req, res) {
      res.render('export_data', { title: 'VAMPS:Import Data', 
                             user: req.user 
                            });
  });
  /* GET Export Data page. */
  router.get('/file_retrieval', function(req, res) {
      
      var user = req.user || 'no-user';  
      var export_dir = 'downloads';
      var mtime = {};
      var size = {};
      fs.readdir(export_dir, function(err, files){   
        
        for(f in files){
          stat = fs.statSync(export_dir+'/'+files[f]);
          mtime[files[f]] = stat.mtime;  // modify time
          size[files[f]] = stat.size;
        }
        
        res.render('file_retrieval', { title: 'VAMPS:Export Data', 
                             user: user,
                             files:files,
                             mtime:mtime,
                             size:size
                            });
      });
  });

  router.get('/file_utils', function(req, res){

    console.log('dnld')
    console.log(req.query.filename)
    var file = 'downloads/'+req.query.filename;
    
    if(req.query.fxn == 'download' && req.query.type == 'fasta'){
      res.download(file); // Set disposition and send it.
    }else if(req.query.fxn == 'download' && req.query.type == 'metadata'){
      res.download(file); // Set disposition and send it.
    }else if(req.query.fxn == 'delete'){
      fs.unlink(file); // 
      res.redirect("/file_retrieval")
    }
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
    
    if(req.body.download_type == 'whole_project'){
      var pid = req.body.project_id
      var project = req.body.project
      var out_file = 'downloads/'+timestamp+'_'+project+'.fa.gz';
      qSelect += " where project_id = '"+pid+"'";
    }else{
      var pids = JSON.parse(req.body.datasets).ids
      var out_file = 'downloads/'+timestamp+'.fa.gz';
      qSelect += " where dataset_id in ("+pids+")";
      console.log(pids);
             
    }
    qSelect += " limit 100 ";                     // <<<<-----  for testing
    
    var seq, seqid, seq_count, pjds;
    var timestamp = +new Date();  // millisecs since the epoch!
    var user = req.user || 'no-user';
    timestamp = user + '_' + timestamp;
    
    
                 // <<<<-----  for testing
    var gzip = zlib.createGzip();
    console.log(qSelect);
    
    var wstream = fs.createWriteStream(out_file);
    var rs = new Readable;
    var collection = db.query(qSelect, function (err, rows, fields){
      if (err) {
          throw err;
      } else {
        for(i in rows){
          seq = rows[i].seq.toString();
          //var buffer = new Buffer(rows[i].seq, 'base64');
          //console.log(seq);
          seq_id = rows[i].sequence_id.toString();
          seq_count = rows[i].seq_count.toString();
          //project = rows[i].project;
          pjds = rows[i].project+'--'+rows[i].dataset;
          entry = '>'+seq_id+'|'+pjds+'|'+seq_count+"\n"+seq+"\n"
          //console.log(entry)
          rs.push(entry)         
        }
       
        rs.push(null);        
      }
      rs
        .pipe(gzip)
        .pipe(wstream)
        .on('finish', function () {  // finished
          console.log('done compressing and writing file');
          var info = { 
                "addr":'avoorhis@mbl.edu',
                "from":"vamps@mbl.edu",
                "subj":"fasta file is ready",
                "msg":"Your fasta file is ready here:\n\nhttp://localhost:3000/"+"export_data/"
              }
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
    
    if(req.body.download_type == 'whole_project'){      
      var pid  = req.body.project_id
      var dids = DATASET_IDS_BY_PID[pid];
      var project = req.body.project
      var out_file = 'downloads/'+timestamp+'_'+project+'.metadata.gz';
    }else{
      var dids = JSON.parse(req.body.datasets).ids  
      var out_file = 'downloads/'+timestamp+'.metadata.gz';    
    }
    console.log('dids')
    console.log(dids)
    var timestamp = +new Date();  // millisecs since the epoch!
    var user = req.user || 'guest';
    timestamp = user + '_' + timestamp;

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
    var header = 'Project: '+project+"\n\t"
    
    var wstream = fs.createWriteStream(out_file);
    var rs = new Readable;
    var filetxt;
    
        for(i in dids){
          did = dids[i]
          dname = DATASET_NAME_BY_DID[did]
          header += dname+"\t"
          for(k in MetadataValues[did]){
            nm = k
            val = MetadataValues[did][k]
            if(nm in myrows){
              myrows[nm].push(val)
            }else{
              myrows[nm] = []
              myrows[nm].push(val)
            }
          }
        }
      
      // print
      header += "\n"
      rs.push(header)
      if(Object.keys(myrows).length === 0){
        rs.push("NO METADATA FOUND\n")
      }else{
        for(mdname in myrows){
          filetxt = mdname+"\t"  // restart sting
          for(i in myrows[mdname]){
            filetxt += myrows[mdname][i]+"\t"
          }
          filetxt += "\n";
          rs.push(filetxt)
        }
      }
      rs.push(null); 
      rs
        .pipe(gzip)
        .pipe(wstream)
        .on('finish', function () {  // finished
          console.log('done compressing and writing file');
          var info = { 
                "addr":'avoorhis@mbl.edu',
                "from":"vamps@mbl.edu",
                "subj":"metadata is ready",
                "msg":"Your metadata file is ready here:\n\nhttp://localhost:3000/"+"export_data/"
              }
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
  function send_mail(mail_info) {
    var to_addr = mail_info.addr;
    var from_addr = mail_info.from
    var subj = mail_info.subj
    var msg = mail_info.msg
    transporter.sendMail({
            from: from_addr,
            to: to_addr,
            subject: subj,
            text: msg
          });

  }
  function IsNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
  }

});

module.exports = router;
