var express = require('express');
var router = express.Router();
var fs   = require('fs');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var zlib = require('zlib');
var Readable = require('stream').Readable;
//var crypto = require('crypto');
// These are all under /projects
/* GET New User page. */
router.get('/index_projects', function(req, res) {
    var db = req.db;
    
    var qSelect = "SELECT project_id, project, title, project_description from project";

    console.log(ALL_DATASETS);
    var collection = db.query(qSelect, function (err, rows, fields){
      if (err) {
      throw err;
    } else {
        res.render('projects/index_projects', { 
                        title          : 'VAMPS Projects',
                        all_projects : rows, 
                        ALL    : JSON.stringify(ALL_DATASETS),
                        user: req.user });
      }
    });

});

router.get('/:id', function(req, res) {
    var db = req.db;
    var qSelect = "SELECT project_id, project, title, project_description from project where project_id = '" + req.params.id +"'";
    //console.log(qSelect);
    var collection = db.query(qSelect, function (err, row, fields){
      if (err)  {
      throw err;
    } else {
        res.render('projects/profile', { 
                                title  : 'VAMPS Project',
                                project: row, 
                                user   : req.user });
      }
    });

});

router.post('/download_project_metadata_all', function(req, res) {
    var db = req.db;
    console.log(req.body);
    var pid = req.body.project_id
    var project = req.body.project
});

router.post('/download_project_seqs_all', function(req, res) {
    var db = req.db;
    console.log(req.body);
    var pid = req.body.project_id
    var project = req.body.project
    var seq, seqid, seq_count, pjds;
    var timestamp = +new Date();  // millisecs since the epoch!
    var user = req.user || 'no-user';
    timestamp = user + '_' + timestamp;
    
    var qSelect = "select UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, dataset from sequence_pdr_info\n";
    //var qSelect = "select sequence_comp as seq, sequence_id, seq_count, dataset from sequence_pdr_info\n";
    qSelect += " join sequence using (sequence_id)\n";
    qSelect += " join dataset using (dataset_id)\n";
    qSelect += " join project using (project_id)\n";
    qSelect += " where project_id = '"+pid+"'";
    qSelect += " limit 100 ";
    var gzip = zlib.createGzip();
    console.log(qSelect);
    var out_file = 'downloads/'+timestamp+'_'+project+'.fa.gz';
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
          pjds = project+'--'+rows[i].dataset;
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
          console.log('done compressingand writing file');
        });
    });

});

module.exports = router;
