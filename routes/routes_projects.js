var express = require('express');
var router = express.Router();
var fs   = require('fs');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var zlib = require('zlib');
var Readable = require('stream').Readable;
var helpers = require('./helpers/helpers');
var path = require('path');
//var crypto = require('crypto');
// These are all under /projects
/* GET New User page. */
router.get('/projects_index', function(req, res) {
    var db = req.db;
    
    //console.log(ALL_DATASETS);
	//console.log(PROJECT_INFORMATION_BY_PNAME)
  	
   // var info = PROJECT_INFORMATION_BY_PID
  // console.log(info);
    var keys = Object.keys(PROJECT_INFORMATION_BY_PNAME);
    keys.sort();
    res.render('projects/projects_index', { 
                        title          : 'VAMPS Projects',
                        projects    : JSON.stringify(PROJECT_INFORMATION_BY_PNAME),
                        //data: JSON.stringify(info),
                        sorted_keys : keys,
                        user: req.user,hostname: req.CONFIG.hostname,
                });
    

});

router.get('/:id', helpers.isLoggedIn, function(req, res) {
    var db = req.db;
    var dsinfo = []; 
    var mdata = {}
    var dscounts = {};  
    
	  if(req.params.id in PROJECT_INFORMATION_BY_PID){
      var info = PROJECT_INFORMATION_BY_PID[req.params.id]
      var project_count = ALL_PCOUNTS_BY_PID[req.params.id]
      

      dataset_counts = {};
      for(n in ALL_DATASETS.projects){        
        if(ALL_DATASETS.projects[n].pid == req.params.id){
          dsinfo = ALL_DATASETS.projects[n].datasets;
        }
      }
      for(n in dsinfo){
        var did = dsinfo[n].did;
        dscounts[did] = ALL_DCOUNTS_BY_DID[did];
        mdata[dsinfo[n].dname] = AllMetadata[did]; 

      }
      //console.log('MD: '+JSON.stringify(mdata));
      var abstract_file = info.project+'.json';
      var abstract_file_path = path.join(process.env.PWD,'public','json',NODE_DATABASE+'--abstracts',abstract_file)
      
      
      fs.readFile(abstract_file_path, {encoding: 'utf-8'}, function(err,data){
            if (err){            
                //console.log('ERR '+err)
                abstract = '{"abstract":"Not Available"}';
            }else{
              //abstract = JSON.parse(data);
              //console.log('project: '+info.project+' AB: '+data)
              //console.log('PROJECT_INFORMATION_BY_PID',JSON.stringify(PROJECT_INFORMATION_BY_PID))
              abstract = data;
            }

            res.render('projects/profile', { 
                                          title  : 'VAMPS Project',
                                          info: JSON.stringify(info),
                                          dsinfo: dsinfo,
                                          dscounts: JSON.stringify(dscounts),
                                          pid: req.params.id,
                                          mdata: JSON.stringify(mdata),
                                          pcount: project_count,
                                          message: '',
                                          abstract:abstract,
                                          user   : req.user,hostname: req.CONFIG.hostname,
                                        });

      });
      
  }else{
      req.flash('message','not found')
      res.redirect(req.get('referer'));
      //return
  }
    
});

// router.post('/download_project_metadata_all', function(req, res) {
//     var db = req.db;
//     console.log(req.body);
//     var pid = req.body.project_id
//     var project = req.body.project
//     var timestamp = +new Date();  // millisecs since the epoch!
//     var user = req.user || 'no-user';
//     timestamp = user + '_' + timestamp;

//     // check if custom metadata table exists
//     //var qSelect = "SHOW tables like 'custom_metadata_"+pid+"'";
    
//     // get the fields from required_metadata_info as they may vary
//     //var qSelect = "SHOW columns from required_metadata_info";
//     //console.log('in projects-->');
//     //console.log(MetadataValues);
//     //console.log('<--in projects');
//     // we have all the metadata in MetadataValues by did
//     var q = "select dataset_id as did from dataset where project_id='"+pid+"'" 
//     var gzip = zlib.createGzip();
//     var myrows = {}; // myrows[mdname] == [] list of values
//     var header = 'Project: '+project+"\n\t"
//     var out_file = 'downloads/'+timestamp+'_'+project+'.metadata.gz';
//     var wstream = fs.createWriteStream(out_file);
//     var rs = new Readable;
//     var filetxt;
//     var collection = db.query(q, function (err, rows, fields){
//       if (err) {
//           throw err;
//       } else {
//         for(i in rows){
//           did = rows[i].did
//           dname = DATASET_NAME_BY_DID[did]
//           header += dname+"\t"
//           for(k in MetadataValues[did]){
//             nm = k
//             val = MetadataValues[did][k]
//             if(nm in myrows){
//               myrows[nm].push(val)
//             }else{
//               myrows[nm] = []
//               myrows[nm].push(val)
//             }
//           }
//         }
//       }
//       // print
//       header += "\n"
//       rs.push(header)
//       if(Object.keys(myrows).length === 0){
//         rs.push("NO METADATA FOUND\n")
//       }else{
//         for(mdname in myrows){
//           filetxt = mdname+"\t"  // restart sting
//           for(i in myrows[mdname]){
//             filetxt += myrows[mdname][i]+"\t"
//           }
//           filetxt += "\n";
//           rs.push(filetxt)
//         }
//       }
//       rs.push(null); 
//       rs
//         .pipe(gzip)
//         .pipe(wstream)
//         .on('finish', function () {  // finished
//           console.log('done compressing and writing file');
//           var info = { 
//                 "addr":'avoorhis@mbl.edu',
//                 "from":"vamps@mbl.edu",
//                 "subj":"metadata is ready",
//                 "msg":"Your metadata file is ready here:\n\nhttp://localhost:3000/"+"export_data/"
//               }
//           send_mail(info);
//           // transporter.sendMail({
//           //   from: 'vamps@mbl.edu',
//           //   to: 'avoorhis@mbl.edu',
//           //   subject: 'metadata is ready',
//           //   text: "Your metadata file is ready here:\n\nhttp://localhost:3000/"+"export_data/"
//           // });
//         });

//     });
//     //console.log(datasets);
// });


// move to routes/download.js
// router.post('/download_project_seqs_all', function(req, res) {
//     var db = req.db;
//     console.log(req.body);
//     var pid = req.body.project_id
//     var project = req.body.project
//     var seq, seqid, seq_count, pjds;
//     var timestamp = +new Date();  // millisecs since the epoch!
//     var user = req.user || 'no-user';
//     timestamp = user + '_' + timestamp;
    
//     var qSelect = "select UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, dataset from sequence_pdr_info\n";
//     //var qSelect = "select sequence_comp as seq, sequence_id, seq_count, dataset from sequence_pdr_info\n";
//     qSelect += " join sequence using (sequence_id)\n";
//     qSelect += " join dataset using (dataset_id)\n";
//     qSelect += " join project using (project_id)\n";
//     qSelect += " where project_id = '"+pid+"'";
//     qSelect += " limit 100 ";                     // <<<<-----  for testing
//     var gzip = zlib.createGzip();
//     console.log(qSelect);
//     var out_file = 'downloads/'+timestamp+'_'+project+'.fa.gz';
//     var wstream = fs.createWriteStream(out_file);
//     var rs = new Readable;
//     var collection = db.query(qSelect, function (err, rows, fields){
//       if (err) {
//           throw err;
//       } else {
//         for(i in rows){
//           seq = rows[i].seq.toString();
//           //var buffer = new Buffer(rows[i].seq, 'base64');
          
//           //console.log(seq);
//           seq_id = rows[i].sequence_id.toString();
//           seq_count = rows[i].seq_count.toString();
//           pjds = project+'--'+rows[i].dataset;
//           entry = '>'+seq_id+'|'+pjds+'|'+seq_count+"\n"+seq+"\n"
//           //console.log(entry)
//           rs.push(entry)         
//         }
       
//         rs.push(null);        
//       }
//       rs
//         .pipe(gzip)
//         .pipe(wstream)
//         .on('finish', function () {  // finished
//           console.log('done compressing and writing file');
//           transporter.sendMail({
//             from: 'vamps@mbl.edu',
//             to: 'avoorhis@mbl.edu',
//             subject: 'fasta is ready',
//             text: "Your fasta file is ready here:\n\nhttp://localhost:3000/"+"export_data/"
//           });
//         });
//     });

// });



module.exports = router;
