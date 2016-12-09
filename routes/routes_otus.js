/*jslint node: true */
// "use strict" ;

var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var path = require('path');
var fs = require('fs-extra');
var queries = require('./queries');
var config = require('../config/config');
var mysql = require('mysql2');
var iniparser = require('iniparser');
var COMMON = require('./visuals/routes_common');
var Readable = require('readable-stream').Readable;
//var chokidar = require('chokidar');
var spawn = require('child_process').spawn;
//var USER_DATA  = require('./routes_user_data');
//
//
//

//
// POST ENTROPY
//
router.post('/method_selection', helpers.isLoggedIn, function (req, res) {
  console.log('in method_selection -->>')
  console.log(req.body);
  console.log('<<--in method_selection')

  dataset_ids = JSON.parse(req.body.dataset_ids);
  chosen_id_name_hash           = COMMON.create_chosen_id_name_hash(dataset_ids);
      console.log('chosen_id_name_hash-->');
      console.log(chosen_id_name_hash);
      console.log(chosen_id_name_hash.ids.length);
      console.log('<--chosen_id_name_hash');

  res.render('otus/otus_method_selection', {
          title: 'VAMPS:OTUs',
          referer: 'otus',
          chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
          message: '',
          user: req.user, hostname: req.CONFIG.hostname
  });

});
//
//
router.post('/create_otus_step1', helpers.isLoggedIn, function (req, res) {
  console.log('in create_otus_step1')
  console.log(req.body);
  console.log('<<--in create_otus_step1')
  var dataset_lookup = {}
  var html='';
  var timestamp = +new Date();  // millisecs since the epoch!
  var otu_method = req.body.otu_method
  var otu_size;
  switch(otu_method){
      case 'closed_ref':
            otu_size = req.body.ref_otu_size;
            break;
      case 'uclust':
            otu_size = req.body.ucl_otu_size;
            break;
      case 'slp':
            otu_size = req.body.slp_otu_size;
            break;
      case 'crop':
            otu_size = req.body.crp_otu_size;
            break;
      default:
            otu_method = 'uclust'
            otu_size = '3'
  }
  var sql_dids = (chosen_id_name_hash.ids).join("','")
  q = "SELECT UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n"
  q += " JOIN sequence using (sequence_id)\n"
  q += " JOIN silva_taxonomy_info_per_seq using(sequence_id)\n"
  q += " JOIN silva_taxonomy using(silva_taxonomy_id)\n"
  q += " JOIN dataset using (dataset_id)\n"
  q += " JOIN project using (project_id)\n"
  // it possible we need to include taxonomy in defline
  q += " WHERE dataset_id in('"+sql_dids+"') \n"
  console.log('query',q);
  var cmd_options = {
      exec : 'otu_create_fasta.py',
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [       ],
  };
  var collection = connection.query(q, function (err, rows, fields) {
    if (err) {
        throw err;
    } else {
      //console.log('rows',rows)
      if(rows.length == 0){
        tax_obj.msg = 'ERROR'
        //res.json(tax_obj)
        var msg = "NO Data Found"
        req.flash('Message', msg)
        //console.log(msg)
        res.render('otus/otus_method_selection', {
            title: 'VAMPS:OTUs',
            referer: 'OTUs',
            chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
            message: req.flash('Message'),
            user: req.user, hostname: req.CONFIG.hostname
        });

      }else{
          var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
          var user_dir_path = path.join(pwd,'public','user_projects');
          var otu_dir = req.user.username+'-'+otu_method+'-otus-'+timestamp
          var data_repo_path = path.join(user_dir_path, otu_dir);
          var fasta_file = 'fasta.fa'
          var fasta_file_path = path.join(data_repo_path, fasta_file);
          var config_file = 'config.ini'
          var config_file_path = path.join(data_repo_path, config_file);
          var FASTA_SUCCESS_FILE    = path.join(data_repo_path,'COMPLETED-FASTA')
          console.log(data_repo_path)
          fs.ensureDir(data_repo_path, function (err) {
            if(err){ return console.log(err) } // => null
            fs.chmod(data_repo_path, '0775', function chmodFile(err) {
                if(err){ return console.log(err) } // => null
                var wstream = fs.createWriteStream(fasta_file_path);
                var rs = new Readable();
                var seq_counter = 0
                var sum_seq_length = 0
                for (var i in rows) {
                  seq = rows[i].seq.toString();
                  seq_id = rows[i].sequence_id.toString();
                  seq_count = rows[i].seq_count
                  pjds = rows[i].project+'--'+rows[i].dataset;
                  dataset_lookup[pjds] = 1
                  for(i = 1; i<=parseInt(seq_count); i++ ){
                    //seq_counter += 1
                    //var len = seq.length
                    //console.log('len',len)
                    //sum_seq_length += len
                    //var no = parseInt(i)

                    //entry = '>'+pjds+sep+seq_id+'-'+no.toString()+"\n"+seq+"\n";
                    //DCO_BRA_Av6--IODP_331_Site_C14B_1_1--240591553_1

                    entry = '>'+pjds+'--'+seq_id+'_'+i+"\n"+seq+"\n";
                    rs.push(entry);
                  } // end for i
                } // end rows

                rs.push(null);

                rs
                  .pipe(wstream)
                  .on('finish', function readableStreamOnFinish() {  // finished fasta
                    console.log('done  writing *.fa file; now writeing config:');
                    //var cutoff = ((sum_seq_length / seq_counter) * 0.8).toFixed(0)

                    //console.log('sum_seq_length',sum_seq_length)
                    //console.log('seq_counter',seq_counter)
                    //console.log('cutoff',cutoff)

                    var config_text = '\n[MAIN]\npath='+data_repo_path+"\n";
                    config_text += 'directory='+otu_dir+"\n";
                    //config_text += 'taxonomy='+tax_obj.full_string+"\n";
                    config_text += 'otu_method='+otu_method+"\n";
                    config_text += 'otu_size='+otu_size+"\n";

                    config_text += '\n[DATASETS]'+"\n";
                    for(pjds in dataset_lookup){
                      config_text += pjds+"\n";
                    }
                    fs.closeSync(fs.openSync(FASTA_SUCCESS_FILE, 'w'));
                    fs.writeFile(config_file_path, config_text, function writeConfigFile(err) {
                        if(err) { return console.log(err); }
                        console.log("The Config file was saved!");
                    })

                  });  // on

            });  // chmod
          })
res.redirect('project_list')  // may not see well yet as fasta needs to be completed 
      } // end else
    } // end else
  }); // end query

});
//
//
// YOUR PROJECTS
//
router.get('/project_list', helpers.isLoggedIn, function (req, res) {
    //console.log(PROJECT_INFORMATION_BY_PNAME);

    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    var user_dir_path = path.join(pwd,'public','user_projects');


    var project_info = {};
    var file_info = [];

     fs.readdir(user_dir_path, function readProjectsDir(err, items) {
            if (err) { return console.log(err); }
            project_info = {}
            for (var d in items) {
                // andy-uclust-otus-1481290684543
                var pts = items[d].split('-');
                if (pts[0] === req.user.username && pts[2] === 'otus') {
                  console.log('got dir', items[d])
                    var otus_code = pts[3];  // ie 1481290684543
                    project_info[otus_code] = {};
                    var stat = fs.statSync(path.join(user_dir_path, items[d]));

                    if (stat.isDirectory()) {
                        // stat.mtime.getTime() is for sorting to list in oreder

                        // need to read config file
                        // check status?? dir strcture: analisis/gast/<ds>
                        var data_repo_path = path.join(user_dir_path, items[d]);
                        var config_file = path.join(data_repo_path, 'config.ini');

                        project_info[otus_code].fasta_status   = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-FASTA')) ? 'COMPLETED' : ''
                        //project_info[oligo_code].entropy_status = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-ENTROPY')) ? 'COMPLETED' : ''
                        //project_info[oligo_code].oligo_status   = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-OLIGO')) ? 'COMPLETED' : ''

                        try{
                            var config = iniparser.parseSync(config_file);

                            file_info.push({ 'otus_code':otus_code, 'time':stat.mtime});

                            project_info[otus_code].method = config['MAIN']['otu_method'];
                            project_info[otus_code].size = config['MAIN']['otu_size'];
                            project_info[otus_code].start_date = stat.mtime.toISOString().substring(0,10);

                        }
                        catch(e){
                          console.log('Config file ERROR',data_repo_path)
                        }

                    }

                  }
            }
            file_info.sort(function sortByTime(a, b) {
              //reverse sort: recent-->oldest
              return helpers.compareStrings_int(b.time.getTime(), a.time.getTime());
            });
            //console.log(project_info)
            //console.log(file_info)
            res.render('otus/otus_project_list',
                { title: 'OTU Projects',
                  pinfo: JSON.stringify(project_info),
                  finfo: JSON.stringify(file_info),
                  //env_sources :   JSON.stringify(req.CONSTS.ENV_SOURCE),
                  //failmessage : req.flash('failMessage'),
                  message : req.flash('Message'),
                  user: req.user, hostname: req.CONFIG.hostname
            });

    });  // readdir
    // ref commands
    //    /groups/vampsweb/vampsdev/apps/db2fasta_otus_vamps
    //    /groups/vampsweb/vampsdev/seqinfobin/mothur "#unique.seqs(fasta=/groups/vampsweb/vampsdev/otus/avoorhis_23618455//usearch_ref.fa)"
    //    /groups/vampsweb/vampsdev/apps/otu_usearch_ref.py
    //
    // uclust commands
    //    /groups/vampsweb/vampsdev/apps/db2fasta_otus_vamps
    //    /groups/vampsweb/vampsdev/apps/otus_uc2mtx_vamps
    //    /groups/vampsweb/vampsdev/apps/otu2tax_vamps
    // slp commands
    //    /groups/vampsweb/vampsdev/apps/db2fasta_otus_vamps
    //    /groups/vampsweb/vampsdev/apps/otus_slp2mtx_vamps
    // crop commands
});
//
//
//
//
//
//
router.get('/delete/:method/:code', helpers.isLoggedIn, function (req, res) {
  console.log('in otus delete')
  var method = req.params.method
  var otus_code = req.params.code
  var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
  var user_dir_path = path.join(pwd,'public','user_projects');
  var otus_dir = req.user.username+'-'+method+'-otus-'+otus_code
  var data_repo_path = path.join(user_dir_path, otus_dir);
  console.log(data_repo_path)
  helpers.deleteFolderRecursive(data_repo_path)
  res.send('OK')
});
//
//
//
module.exports = router;
