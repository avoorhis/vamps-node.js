/*jslint node: true */
// "use strict" ;

var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var path = require('path');
var fs = require('fs-extra');
var url = require('url');
var ini = require('ini');
var queries = require('./queries');
var iniparser = require('iniparser');
//var PythonShell = require('python-shell');
var zlib = require('zlib');
var config = require('../config/config');
var multer = require('multer');
var util = require('util');
var escape = require('escape-html');
var form = require("express-form");
var mysql = require('mysql2');

//var progress = require('progress-stream');
var upload = multer({ dest: config.TMP, limits: { fileSize: config.UPLOAD_FILE_SIZE.bytes }  });

var Readable = require('readable-stream').Readable;
var COMMON = require('./visuals/routes_common');
// router.use(multer({ dest: 'tmp',
// rename: function (fieldname, filename) {
// return filename+Date.now();
// },
// onFileUploadStart: function (file) {
// console.log(file.originalname + ' is starting ...')
// },
// onFileUploadComplete: function (file) {
// console.log(file.fieldname + ' uploaded to ' + file.path)
// done=true;
// }
// }));
var spawn = require('child_process').spawn;
//
// YOUR DATA
//
router.get('/your_data', function (req, res) {
  console.log('in your data');
  console.log(req.user);
  res.render('user_data/your_data', {
    title: 'VAMPS:Data Administration',
    user: req.user, hostname: req.CONFIG.hostname,
    message: req.flash('message'),
  });
});

//
// FILE RETRIEVAL
//
/* GET Export Data page. */
router.get('/file_retrieval', helpers.isLoggedIn, function (req, res) {

    var export_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
    var file_formats = req.CONSTS.download_file_formats;
    var file_info = [];

    fs.readdir(export_dir, function (err, files) {
      for (var f in files) {
        var pts = files[f].split('-');
        if (file_formats.indexOf(pts[0]) != -1) {
          stat = fs.statSync(export_dir+'/'+files[f]);
          file_info.push({ 'filename':files[f], 'size':stat.size, 'time':stat.mtime});
        }
      }
      file_info.sort(function (a, b) {
          //reverse sort: recent-->oldest
          return helpers.compareStrings_int(b.time.getTime(), a.time.getTime());
      });
      //console.log(file_info)
      res.render('user_data/file_retrieval', { title: 'VAMPS:Export Data',
              user: req.user, hostname: req.CONFIG.hostname,
              finfo: JSON.stringify(file_info),
              message : req.flash('message'),
            });
    });
});

//
//  EXPORT CONFIRM
//
router.post('/export_confirm', helpers.isLoggedIn, function (req, res) {
    console.log('req.body: export_confirm-->>');
    console.log(req.body);
    console.log('req.body: <<--export_confirm');
    if (req.body.fasta === undefined
        && req.body.taxbyseq === undefined
        && req.body.taxbyref === undefined
        && req.body.matrix === undefined
        && req.body.metadata === undefined
        && req.body.biom === undefined ) {
        req.flash('failMessage', 'Select one or more file formats');
        res.render('user_data/export_selection', {
          title: 'VAMPS: Export Choices',
          referer: 'export_data',
          chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
          constants: JSON.stringify(req.CONSTS),
          selected_rank:req.body.tax_depth,
              selected_domains:JSON.stringify(req.body.domains),
          message: 'Select one or more file formats',
          user: req.user, hostname: req.CONFIG.hostname
        });
        return;
    }
    var dids = req.body.dids.split(', ');
    var requested_files = [];

    if (req.body.fasta) {

    }
    var timestamp = +new Date();  // millisecs since the epoch!
    var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
    helpers.mkdirSync(req.CONFIG.USER_FILES_BASE); // create dir if not exists
    helpers.mkdirSync(user_dir);

    for (var key in req.body) {
      if (key === 'fasta') {
        requested_files.push('-fasta_file');
      }
      if (key === 'matrix') {
        requested_files.push('-matrix_file');
      }
      //if (key === 'taxbyref') {
      //  requested_files.push('-taxbyref_file');
      //}
      if (key === 'taxbyseq') {
        requested_files.push('-taxbyseq_file');
      }
      if (key === 'metadata') {
        requested_files.push('-metadata_file');
      }
      if (key === 'biom') {
        requested_files.push('-biom_file');
      }


    }
    if (requested_files.length >0) {
      if (req.body.tax_depth=='class') {var td='klass';}
      else {var td=req.body.tax_depth;}
      create_export_files(req, user_dir, timestamp, dids, requested_files, req.body.normalization, td, req.body.domains );
    }
    //console.log(requested_files);

    res.render('user_data/export_selection', {
          title: 'VAMPS: Export Choices',
          referer: 'export_data',
          chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
          constants: JSON.stringify(req.CONSTS),
          selected_rank:req.body.tax_depth,
              selected_domains:JSON.stringify(req.body.domains),
          message: "Your file(s) are being created -- <a href='/user_data/file_retrieval' >when ready they will be accessible here</a>",
          user: req.user, hostname: req.CONFIG.hostname
    });


});
//
//
//
router.get('/get_projects_only_tree', helpers.isLoggedIn, function (req, res) {
    console.log('in get_projects_only_tree');  // for export data
    var html = '';

    html += '<ul>';
    for (var id in PROJECT_INFORMATION_BY_PID) {
      //console.log(id)
      name = PROJECT_INFORMATION_BY_PID[id].project;
      html += "<li><input type='checkbox' name='project_ids' value='"+id+"'> "+name+"</li>";

    }
    html += '<ul>';
    res.send(html);
});
//
//  EXPORT SELECTION
//
/* GET Import Choices page. */
router.post('/export_selection', helpers.isLoggedIn, function (req, res) {
  console.log('in routes_user_data.js /export_selection');
  console.log('req.body: export_selection-->>');
  console.log(req.body);
  console.log('req.body: <<--export_selection');


  if (req.body.retain_data === '1') {
    dataset_ids = JSON.parse(req.body.dataset_ids);
  } else {
    dataset_ids = req.body.dataset_ids;
  }
  console.log('dataset_ids '+dataset_ids);
  if (dataset_ids === undefined || dataset_ids.length === 0) {
      console.log('redirecting back -- no data selected');
      req.flash('nodataMessage', 'Select Some Datasets');
      res.redirect('export_data');
     return;
  } else {
   // GLOBAL Variable
  chosen_id_name_hash           = COMMON.create_chosen_id_name_hash(dataset_ids);
    console.log('chosen_id_name_hash-->');
  console.log(chosen_id_name_hash);
  console.log(chosen_id_name_hash.ids.length);
  console.log('<--chosen_id_name_hash');

    res.render('user_data/export_selection', {
          title: 'VAMPS: Export Choices',
          referer: 'export_data',
          constants: JSON.stringify(req.CONSTS),
          chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
          selected_rank:'phylum', // initial condition
          selected_domains:JSON.stringify(req.CONSTS.DOMAINS.domains), // initial condition
          message: req.flash('successMessage'),
          failmessage: req.flash('failMessage'),
          user: req.user, hostname: req.CONFIG.hostname
        });
  }
});
//
//  EXPORT DATA
//
router.post('/export_data', helpers.isLoggedIn, function (req, res) {
  console.log('req.body export_data');
  console.log(req.body);
  // GLOBAL
  DATA_TO_OPEN = {};
  SHOW_DATA = ALL_DATASETS;
  if (req.body.data_to_open) {
    // open many projects
    obj = JSON.parse(req.body.data_to_open);
    for (var pj in obj) {
      pid = PROJECT_INFORMATION_BY_PNAME[pj].pid;
      DATA_TO_OPEN[pid] = obj[pj];
    }
    //console.log('got data to open '+data_to_open)
  } else if (req.body.project) {
    // open whole project
    DATA_TO_OPEN[req.body.project_id] = DATASET_IDS_BY_PID[req.body.project_id];
  }
  console.log('DATA_TO_OPEN-exports');
  console.log(DATA_TO_OPEN);

    res.render('user_data/export_data', { title: 'VAMPS:Export Data',
                rows     : JSON.stringify(ALL_DATASETS),
                proj_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
                constants: JSON.stringify(req.CONSTS),
                md_names    : AllMetadataNames,
                data_to_open: JSON.stringify(DATA_TO_OPEN),
                message  : req.flash('nodataMessage'),
                user: req.user, hostname: req.CONFIG.hostname
          });
});


//
// IMPORT_CHOICES
//
/* GET Import Choices page. */
router.get('/import_choices', helpers.isLoggedIn, function (req, res) {
  console.log('import_choices');
  
  if(req.CONFIG.hostname.substring(0,7) == 'bpcweb8'){
      res.render('user_data/your_data', {
        title: 'VAMPS:Data Administration',
        user: req.user, hostname: req.CONFIG.hostname,
        message: req.flash('message','Not coded yet'),
      });
      return;
  }
  if (req.user.username == 'guest') {
       req.flash('message', "The 'guest' user is not permitted to import data");
       res.redirect('/user_data/your_data');
  } else {
      res.render('user_data/import_choices', {
          title: 'VAMPS:Import Choices',
          message: req.flash('successMessage'),
          failmessage: req.flash('failMessage'),
          user: req.user, hostname: req.CONFIG.hostname
          });
  }
});
//
// IMPORT DATA
//
/* GET Import Data page. */
router.get('/import_data', helpers.isLoggedIn, function (req, res) {
  console.log('import_data');
  console.log(req.url);
  var myurl = url.parse(req.url, true);


  var user_projects_base_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);

  var my_projects = [];
  var import_type    = myurl.query.import_type;

    fs.readdir(user_projects_base_dir, function (err, items) {
        if (err) {

          fs.ensureDir(user_projects_base_dir, function (err) {
            console.log(err); // => null
            // dir has now been created, including the directory it is to be placed in
          });


        } else {
          console.log(user_projects_base_dir);
          for (var d in items) {
            var pts = items[d].split('-');
            if (pts[0] === 'project') {

              var project_name = pts[1];
              my_projects.push(project_name);

            }
          }

          res.render('user_data/import_data', {
            title: 'VAMPS:Import Data',
            message: req.flash('successMessage'),
            failmessage: req.flash('failMessage'),
            import_type: import_type,
            my_projects: my_projects,
            user: req.user,
            hostname: req.CONFIG.hostname
          });

        } // end else
      });


});
//
// VALIDATE FORMAT
//
/* GET Validate page. */
router.get('/validate_format', helpers.isLoggedIn, function (req, res) {
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
      user: req.user, hostname: req.CONFIG.hostname
                        });
});
//
//  VALIDATE FILE
//
router.post('/validate_file', [helpers.isLoggedIn, upload.single('upload_file', 12)], function (req, res) {
    console.log('POST validate_file');

    console.log(req.body);
    console.log(req.file);
    var file_type    = req.body.file_type;
    var file_style   = req.body.file_style;
    console.log('file_type '+ file_type);
    console.log('file_style '+ file_style);
    var file_path = path.join(process.env.PWD, req.file.path);
    console.log('file_path '+ file_path);

    var options = { scriptPath : req.CONFIG.PATH_TO_NODE_SCRIPTS,
                  args : [ '-i', file_path, '-ft', file_type, '-s', file_style, '-process_dir', process.env.PWD, ]
              };

    console.log(options.scriptPath+'/vamps_script_validate.py '+options.args.join(' '));

    var log = fs.openSync(path.join(process.env.PWD, 'logs', 'validate.log'), 'a');
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

        var ary = output.substring(2, output.length-2).split("', '");
        var result = ary.shift();
        console.log(ary);
        //var last_line = ary[ary.length - 1];
        if (code === 0) {
          //console.log('OK '+code)
          console.log(typeof ary);

          if (result == 'OK') {
            req.flash('message', 'Validates');
          } else {
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
               user: req.user, hostname: req.CONFIG.hostname
             });

        } else {
          console.log('ERROR '+code);
          req.flash('message', 'Failed Validation');
          res.render('user_data/validate_format', {
              title: 'VAMPS:Import Data',
              message: req.flash('message'),
              file_type: file_type,
              user: req.user, hostname: req.CONFIG.hostname
                          });
        }

    });


});
//
// USER PROJECT INFO:ID
//
router.get('/user_project_info/:id', helpers.isLoggedIn, function (req, res) {
  console.log(req.params.id);
  var project = req.params.id;
  var config_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project, 'config.ini');

  var config = ini.parse(fs.readFileSync(config_file, 'utf-8'));
  console.log(config);
  res.render('user_data/profile', {
      project : project,
      pinfo   : JSON.stringify(config),
      title   : project,
      user: req.user, hostname: req.CONFIG.hostname
         });
});
//
// USER PROJECT METADATA:ID
//
router.get('/user_project_metadata/:id', helpers.isLoggedIn, function (req, res) {
  var parse = require('csv-parse');
  var async = require('async');
  console.log(req.params.id);
  var project = req.params.id;
  var config_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project, 'config.ini');

  stats = fs.statSync(config_file);
  if (stats.isFile()) {
     console.log('config found');
     var config = ini.parse(fs.readFileSync(config_file, 'utf-8'));
  } else {
    //console.log('config NOT found')
     config = {'config file NOT AVAILABLE':1};
  }
  var metadata_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project, 'metadata_clean.csv');

  var parser = parse({delimiter: '\t'}, function (err, data) {
      json_data = {};
      console.log(data);

      res.render('user_data/metadata', {
        project : project,
        pinfo   : JSON.stringify(config),
        mdata   : data,
        title   : project,
        message : req.flash('successMessage'),
        user: req.user, hostname: req.CONFIG.hostname
      });

  });
  try{
    console.log('looking for meta');
    stats = fs.lstatSync(metadata_file);
    if (stats.isFile()) {
      console.log('meta found');
      fs.createReadStream(metadata_file).pipe(parser);
    }
  }
  catch(e) {
    console.log('meta NOT found');
    res.render('user_data/metadata', {
      project : project,
      pinfo   : JSON.stringify(config),
      mdata   : [],
      title   : project,
      message : req.flash('successMessage'),
      user: req.user, hostname: req.CONFIG.hostname
    });
  }

});

router.get('/user_project_validation/:id', helpers.isLoggedIn, function (req, res) {
        // THIS IS FOR UNLOADED PROJECTS (After upload and before tax assignment)
        //will only show up if config.ini is present
        // check that metadata file is present
        // check that sequence file(s) are present
        // check config variables
        // grep Traceback project-*/cluster.log
        var config_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project, 'config.ini');
        var metadata_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project, 'metadata_clean.csv');

        stats = fs.statSync(config_file);
        if (stats.isFile()) {
           console.log('config found');
           var config = ini.parse(fs.readFileSync(config_file, 'utf-8'));
        } else {
            console.log('config NOT found');
            config = {'config file NOT AVAILABLE':1};
        }
        res.redirect("/user_data/your_projects");
});
//
//  DELETE PROJECT:PROJECT:KIND
//
router.get('/delete_project/:project/:kind', helpers.isLoggedIn, function (req, res) {

  var delete_kind = req.params.kind;
  var project = req.params.project;
  var timestamp = +new Date();  // millisecs since the epoch!
  console.log('in delete_project1: '+project+' - '+delete_kind);
  //console.log(JSON.stringify(PROJECT_INFORMATION_BY_PNAME));

  if (project in PROJECT_INFORMATION_BY_PNAME) {
    var pid = PROJECT_INFORMATION_BY_PNAME[project].pid;
    helpers.update_global_variables(pid, 'del');
  } else {
    // project not in db?
    console.log('project was not found in db: PROJECT_INFORMATION_BY_PNAME');
    var pid = 0;
  }

    console.log('in delete_project2: '+project+' - '+pid);
    var options = {
        scriptPath : req.CONFIG.PATH_TO_NODE_SCRIPTS,
        args :       [ '-pid', pid, '-db', NODE_DATABASE, '--user', req.user.username, '--project', project, '-pdir', process.env.PWD ],
        };
    if (delete_kind == 'all') {
      // must delete pid data from mysql ()
      // and all datasets files
      options.args = options.args.concat(['--action', 'delete_whole_project']);
    } else if (delete_kind == 'tax' && pid !== 0) {
      options.args = options.args.concat(['--action', 'delete_tax_only' ]);

    } else if (delete_kind == 'meta' && pid !== 0) {
      options.args = options.args.concat(['--action', 'delete_metadata_only' ]);

    } else {
      req.flash('message', 'ERROR nothing deleted');
      res.redirect("/user_data/your_projects");
      return;
    }
    console.log(options.args.join(' '));

    var log = fs.openSync(path.join(process.env.PWD, 'logs', 'delete.log'), 'a');
      // script will remove data from mysql and datset taxfile

    console.log(options.scriptPath+'/vamps_script_utils.py '+options.args.join(' '));
      var delete_process = spawn( options.scriptPath+'/vamps_script_utils.py', options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr


      var output = '';
      delete_process.stdout.on('data', function (data) {
        //console.log('stdout: ' + data);
        // data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString().trim();
        output += data;
        CheckIfPID(data);
      });

      delete_process.on('close', function (code) {
          console.log('delete_process process exited with code ' + code);
          var ary = output.split("\n");
          var last_line = ary[ary.length - 1];
          if (code === 0) {
           //console.log('PID last line: '+last_line)
              status_params = {'type': 'delete', 'user_id':req.user.user_id,
                                'project':project, 'status':'delete', 'msg':'delete' };
              helpers.update_status(status_params);
          } else {
             // python script error
          }
      });
      // called imediately
      var msg = "";
      if (delete_kind == 'all') {
        msg = "Deletion in progress: '"+project+"'";
      } else if (delete_kind == 'tax') {
        msg = "Deletion in progress: taxonomy from '"+project+"'";
      } else if (delete_kind == 'meta') {
        msg = "Deletion in progress: metadata from '"+project+"'";
      } else {
        req.flash('message', 'ERROR nothing deleted');
        res.redirect("/user_data/your_projects");
        return;
      }
      if (delete_kind == 'all') {
          // MOVE file dir to DELETED path (so it won't show in 'your_projects' list)
          var data_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project);
          var deleted_data_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'DELETED_project'+timestamp+'-'+project);

          fs.move(data_dir, deleted_data_dir, function (err) {
            if (err) {
              console.log(err);
              res.send(err);
            } else {
              console.log('moved project_dir to DELETED_project_dir');
              req.flash('successMessage', msg);
              res.redirect("/user_data/your_projects");
              return;
            }

          });

      } else {
        req.flash('successMessage', msg);
        res.redirect("/user_data/your_projects");
      }


});
//
// DUPLICATE_PROJECT
//
router.get('/duplicate_project/:project', helpers.isLoggedIn, function (req, res) {
   var project = req.params.project;
   var data_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project);
   var new_data_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project+'_dupe');


   try{
      stats = fs.lstatSync(new_data_dir);
      if (stats.isDirectory()) {
              console.log('dir exists - returning');
              req.flash('failMessage', "Error: Could not duplicate: '"+project+"' to '"+project+"_dupe'. Does it already exist?");
            res.redirect("/user_data/your_projects");
            return;
          }
    }catch(err) {
      console.log('dir doesnt exist -good- continuing on');
    }

    fs.copy(data_dir, new_data_dir, function (err) {
      if (err) {
        console.log(err);
      } else {
        // need to change config file of new project to include new name:
        console.log('duplicate copy success!');
        var config_file = path.join(new_data_dir, 'config.ini');
        var project_info = {};
        project_info.config = iniparser.parseSync(config_file);
        var config_info = project_info.config.GENERAL;
        config_info.project = project+'_dupe';
        config_info.baseoutputdir = new_data_dir;
        config_info.configPath = path.join(new_data_dir, 'config.ini');
        config_info.fasta_file = path.join(new_data_dir, 'infile.fna');
        config_info.datasets = [];
        for (var ds in project_info.config.DATASETS) {
          config_info.datasets.push({ "dsname":ds, "count":project_info.config.DATASETS[ds], "oldname":ds });
        }
        update_config(res, req, config_file, config_info, false, 'Duplicated '+project+' to: '+config_info.project);
      }
    }); // copies directory, even if it has subdirectories or files

});
//
//
//
router.get('/assign_taxonomy/:project/', helpers.isLoggedIn, function (req, res) {
    var project = req.params.project;
    var data_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project);


    var config_file = path.join(data_dir, 'config.ini');

    res.render('user_data/assign_taxonomy', {
      project : project,
      title   : project,
      message : req.flash('successMessage'),
      tax_choices : JSON.stringify(req.CONSTS.UNIT_ASSIGNMENT_CHOICES),
      user: req.user, hostname: req.CONFIG.hostname
     });

});

//
// START_ASSIGNMENT
//


//router.get('/start_assignment/:project/:classifier/:ref_db', helpers.isLoggedIn, function (req, res) {
router.get('/start_assignment/:project/:classifier_id', helpers.isLoggedIn, function (req, res) {
  var scriptlog = "";
  var cmd_list = [];
  var exec = require('child_process').exec;
  console.log('in start_assignment--->');
  console.log(req.params);
  console.log('<--- in start_assignment');
  var project = req.params.project;
  var classifier_id = req.params.classifier_id;
  // /GAST/SILVA108_FULL_LENGTH">Assign Taxonomy - GAST (Silva108)</a></li>
  // /GAST/GG_MAY2013">Assign Taxonomy - GAST (GreenGenes May2013)</a></li>
  // /RDP/2.10.1">Assign Taxonomy - RDP (2.10.1)</a></li>
  // /RDP/GG_MAY2013">Assign Taxonomy - RDP (GreenGenes May2013)</a></li>
  // /RDP/ITS1"

  var classifier = req.CONSTS.UNIT_ASSIGNMENT_CHOICES[classifier_id].method;
  //var ref_db_dir = req.params.ref_db;
  var ref_db_dir = req.CONSTS.UNIT_ASSIGNMENT_CHOICES[classifier_id].refdb;
  console.log('start: ' + project + ' - ' + classifier + ' - ' + ref_db_dir);
  status_params = {'type': 'update', 'user_id': req.user.user_id, 'project': project, 'status': '', 'msg': '' };
  var data_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-' + project);
  var qsub_script_path = req.CONFIG.PATH_TO_NODE_SCRIPTS;

  var config_file = path.join(data_dir, 'config.ini');
  try
  {
    //var stat_config = fs.statSync(config_file);
    // console.log('1 ', config_file)
    var project_config = iniparser.parseSync(config_file);
    console.log('project_config', project_config);
    console.log('project_config2', project_config['GENERAL'].fasta_type);
  }
  catch (err)
  {
    console.log('no read config file ', err);
  }

  var options = {
    scriptPath : qsub_script_path,
    gast_run_args : [ '-c', config_file, '-process_dir', process.env.PWD,
    '-project_dir', data_dir, '-db', NODE_DATABASE, '-ref_db_dir', ref_db_dir, '-site', req.CONFIG.site ],
    rdp_run_args :  [ '-c', config_file, '-process_dir', process.env.PWD, '-site', req.CONFIG.site,
    '-project_dir', data_dir, '-ref_db', ref_db_dir, '-path_to_classifier', req.CONFIG.PATH_TO_CLASSIFIER ],
    database_loader_args : [ '-class', classifier, '-host', req.CONFIG.dbhost, '-process_dir', process.env.PWD, '-project_dir', data_dir, '-db', NODE_DATABASE, '-ref_db_dir', ref_db_dir],
    upload_metadata_args : [ '-project_dir', data_dir, '-host', req.CONFIG.dbhost, '-db', NODE_DATABASE ],
    create_json_args : [ '-process_dir', process.env.PWD, '-host', req.CONFIG.dbhost, '-project_dir', data_dir, '-db', NODE_DATABASE ]
 };

  if (classifier.toUpperCase() == 'GAST')
  {
    if (project_config['GENERAL'].fasta_type == 'multi')
    {
      //unique_cmd = options.scriptPath + '1-demultiplex_fna.sh ' + data_dir + ' infile.fna'
    }
    else
    {
      var single_dataset_name = Object.keys(project_config.DATASETS)[0];
    //unique_cmd = options.scriptPath + '1-single_fna.sh ' + data_dir + ' infile.fna ' + single_dataset_name
    }
    // try: check project name and enter empty project (just to create pid)
    project_init = options.scriptPath + '/project_initialization.py -site ' + req.CONFIG.site + ' -indir ' + data_dir + ' -p ' + project + ' -uid ' + req.user.user_id;

    // metadata must go in after the projects and datasets:
    // Should go into db after we have project and datasets in the db
    // Should go in as entire project (w all datasets) -- not dataset by dataset
    // PROBLEM: Here we dont have datasets yet in db
    metadata_cmd = options.scriptPath + '/metadata_loader.py -site ' + req.CONFIG.site + ' -indir ' + data_dir + ' -p ' + project;

    // Command is split to run once for each dataset on the cluster:
    run_gast_cmd = options.scriptPath + '/2-vamps_nodejs_gast.sh -x ' + data_dir + ' -s ' + project + ' -d gast -v -e fa.unique -r ' + classifier_id + ' -f -p both -w ' + req.CONFIG.site;
    //run_cmd2 = "/bioware/seqinfo/bin/gast_ill -saveuc -nodup -full -ignoregaps -in " + data_dir + "/fasta.fa.unique -db /groups/g454/blastdbs/gast_distributions/" + classifier_id + ".fa -rtax /groups/g454/blastdbs/gast_distributions/" + classifier_id + ".tax -out " + data_dir + "/gast/fasta_out.gast -uc " + data_dir + "/gast/fasta_out.uc -threads 0 -strand both"

    //run_cmd3 = options.scriptPath + '3-vamps_nodejs_database_loader.py -site ' + req.CONFIG.site + ' -indir ' + data_dir + ' -ds ' + single_dataset_name

    //run_cmd = options.scriptPath + '/vamps_script_gast_run.py ' + options.gast_run_args.join(' '),
    script_name = 'gast_script.sh';
    status_params.statusOK = 'OK-GAST';
    status_params.statusSUCCESS = 'GAST-SUCCESS';
    status_params.msgOK = 'Finished GAST';
    status_params.msgSUCCESS = 'GAST -Tax assignments';
    cmd_list = [
        //unique_cmd,
        project_init,
        metadata_cmd,
        run_gast_cmd

        //options.scriptPath + '/vamps_script_database_loader.py ' + options.database_loader_args.join(' '),
        //  "pid=$(head -n 1 " + data_dir + "/pid.txt)", // pid is in a file pid.txt written by database loader
        //options.scriptPath + '/vamps_script_load_metadata.py ' + options.upload_metadata_args.join(' '),
        //options.scriptPath + '/vamps_script_create_json_dataset_files.py ' + options.create_json_args.join(' ')
      ];
    }
    else if (classifier.toUpperCase() == 'RDP' )
    {
      // These are from the RDP README
      var gene = '16srrna'; // default
      if (classifier_id == 'refRDP_2.12-ITS')
      {
        gene = 'fungalits_unite';
      }
      var path2classifier = req.CONFIG.PATH_TO_CLASSIFIER + '_' + ref_db_dir;
      rdp_cmd1 = options.scriptPath + '/vamps_script_rdp_run.py -project_dir ' + data_dir + ' -p ' + project + ' -site ' + req.CONFIG.site + ' -path_to_classifier ' + path2classifier + ' -gene ' + gene;
      rdp_cmd2 = options.scriptPath + '/vamps_script_rdp_database_loader.py -project_dir ' + data_dir + ' -p ' + project + ' -site ' + req.CONFIG.site + ' --classifier RDP';
      rdp_cmd3 = options.scriptPath + '/vamps_script_upload_metadata.py -project_dir ' + data_dir + ' -p ' + project + ' -site ' + req.CONFIG.site;
      rdp_cmd4 = options.scriptPath + '/vamps_script_create_json_dataset_files.py -project_dir ' + data_dir + ' -p ' + project + ' -site ' + req.CONFIG.site + ' --jsonfile_dir ' + req.CONFIG.JSON_FILES_BASE;

      script_name = 'rdp_script.sh';
      status_params.statusOK = 'OK-RDP';
      status_params.statusSUCCESS = 'RDP-SUCCESS';
      status_params.msgOK = 'Finished RDP';
      status_params.msgSUCCESS = 'RDP -Tax assignments';
      cmd_list = [ rdp_cmd1, rdp_cmd2, rdp_cmd3, rdp_cmd4 ];
  }

  var script_text = "";
  if (req.CONFIG.dbhost == 'vampsdev' || req.CONFIG.dbhost == 'vampsdb')
  {
   scriptlog = path.join(data_dir, 'cluster.log');
   //var script_text = get_qsub_script_text(scriptlog, data_dir, req.CONFIG.dbhost, classifier, cmd_list)
   script_text = get_qsub_script_text(scriptlog, data_dir, req.CONFIG.dbhost, classifier, cmd_list);
  }
  else
  {
   scriptlog = path.join(data_dir, 'script.log');
   script_text = get_local_script_text(scriptlog, 'local', classifier, cmd_list);
  }
  var script_path = path.join(data_dir, script_name);

  fs.writeFile(script_path, script_text, function (err) {
    if (err) return console.log(err);
    // Make script executable
    child = exec( 'chmod ug+rwx ' + script_path,
    function (error, stdout, stderr) {
      console.log('1stdout: ' + stdout);
      console.log('1stderr: ' + stderr);
      if (error !== null)
      {
        console.log('1exec error: ' + error);
      }
      else
      {
        // run script
        var nodelog = fs.openSync(path.join(data_dir, 'assignment.log'), 'a');

        console.log('RUNNING: ' + script_path);
        var run_process = spawn( script_path, [], {
          // env:{'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH,
          // 'PATH':req.CONFIG.PATH,
          // 'PERL5LIB':req.CONFIG.PERL5LIB,
          // 'SGE_ROOT':req.CONFIG.SGE_ROOT, 'SGE_CELL':req.CONFIG.SGE_CELL, 'SGE_ARCH':req.CONFIG.SGE_ARCH
          // },
          detached: true, stdio: [ 'ignore', null, nodelog ]
        }); // stdin, s
        var output = '';
        run_process.stdout.on('data', function (data) {
          //console.log('stdout: ' + data);
          // data = data.toString().replace(/^\s + |\s + $/g, '');
          data = data.toString().trim();
          output += data;
          CheckIfPID(data);
        });
        run_process.on('close', function (code) {
          console.log('run_process process exited with code ' + code);
          var ary = output.split("\n");
          var last_line = ary[ary.length - 1];
          console.log('last_line:', last_line);
          if (code === 0)
          {
            console.log(classifier.toUpperCase() + ' Success');
            //console.log('PID last line: ' + last_line)
            var ll = last_line.split('=');
            var pid = ll[1];
            console.log('NEW PID=: ' + pid);
            //console.log('ALL_DATASETS: ' + JSON.stringify(ALL_DATASETS));
            if (helpers.isInt(pid))
            {
              connection.query(queries.get_select_datasets_queryPID(pid), function (err, rows1, fields) {
                if (err)
                {
                  console.log('1-GAST/RDP-Query error: ' + err);
                }
                else
                {
                  connection.query(queries.get_select_sequences_queryPID(pid), function (err, rows2, fields) {
                  if (err)
                  {
                    console.log('2-GAST/RDP-Query error: ' + err);
                  }
                  else
                  {
                    helpers.assignment_finish_request(res, rows1, rows2, status_params);
                    status_params.status = status_params.statusOK;
                    status_params.msg = status_params.msgOK;
                    helpers.update_status(status_params);

                    ALL_CLASSIFIERS_BY_PID[pid] = classifier + '_' + ref_db_dir;
                    console.log('FROM func. ALL_CLASSIFIERS_BY_PID: ' + ALL_CLASSIFIERS_BY_PID);
                    console.log('FROM func. ALL_CLASSIFIERS_BY_PID[pid]: ' + ALL_CLASSIFIERS_BY_PID[pid]);

                  }

                });
                } // end else

              });

            }
            else
            { // end if int
              console.log('ERROR pid is not an integer: ', pid);
            }
          }
          else
          {
            // ERROR
            console.log('ERROR last line: ' + last_line);
            //req.flash('message', 'Script Error');
            //res.redirect("/user_data/your_projects");
          }
        }); // end gast_process ON Close
      }
    });

  });

  status_params.status = status_params.statusSUCCESS;
  status_params.msg = status_params.msgSUCCESS;
  helpers.update_status(status_params);
  req.flash('successMessage', classifier + " has been started for project: '" + project + "'");
  res.redirect("/user_data/your_projects");

});
//
// YOUR PROJECTS
//
router.get('/your_projects', helpers.isLoggedIn, function (req, res) {
    //console.log(PROJECT_INFORMATION_BY_PNAME);
    if(req.CONFIG.hostname.substring(0,7) == 'bpcweb8'){
      res.render('user_data/your_data', {
        title: 'VAMPS:Data Administration',
        user: req.user, hostname: req.CONFIG.hostname,
        message: req.flash('message','Not coded yet'),
      });
      return;
    }
    var user_projects_base_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
    // if (req.CONFIG.hostname.substring(0, 7) == 'bpcweb7') {
    //     var user_projects_base_dir = path.join('/groups/vampsweb/vampsdev_user_data/', req.user.username);
    // } else if (req.CONFIG.hostname.substring(0, 7) == 'bpcweb8') {
    //     var user_projects_base_dir = path.join('/groups/vampsweb/vamps_user_data/', req.user.username);
    // } else {
    //     var user_projects_base_dir = path.join(process.env.PWD, 'user_data', NODE_DATABASE, req.user.username);
    // }
  project_info = {};
  pnames = [];
    fs.readdir(user_projects_base_dir, function (err, items) {
    if (err) {

      fs.ensureDir(user_projects_base_dir, function (err) {
        console.log(err); // => null
        // dir has now been created, including the directory it is to be placed in
      });


    } else {
        for (var d in items) {
                var pts = items[d].split('-');
                if (pts[0] === 'project') {

          var project_name = pts[1];
          var stat_dir = fs.statSync(path.join(user_projects_base_dir, items[d]));

          if (stat_dir.isDirectory()) {
            // stat.mtime.getTime() is for sorting to list in oreder

            // need to read config file
            // check status?? dir strcture: analisis/gast/<ds>
            var config_file = path.join(user_projects_base_dir, items[d], 'config.ini');

            try {
              //var stat_config = fs.statSync(config_file);
               // console.log('1 ', config_file)
              var config = iniparser.parseSync(config_file);
              var list_of_datasets = Object.keys(config.DATASETS);
              project_info[project_name] = {};
              project_info[project_name].validation = {};
              pnames.push(project_name);

              //new_status = helpers.get_status(req.user.username, project_name);
              //console.log(new_status); // Async only -- doesn't work
              //console.log(ALL_CLASSIFIERS_BY_PID);
              // console.log('2 ', config_file)
              if (project_name in PROJECT_INFORMATION_BY_PNAME) {
                      project_info[project_name].pid = PROJECT_INFORMATION_BY_PNAME[project_name].pid;
                      project_info[project_name].tax_status = 'Taxonomic Data Available';
                      project_info[project_name].classified_by = ALL_CLASSIFIERS_BY_PID[PROJECT_INFORMATION_BY_PNAME[project_name].pid];
              } else {
                  var metadata_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project_name, 'metadata_clean.csv');
                  var fasta_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project_name, 'metadata_clean.csv');
                  //console.log('config.DATASETS', config.DATASETS)
                  project_info[project_name].validation['metadata_clean.csv'] = helpers.fileExists(metadata_file);  // true or false

                  for (var i in list_of_datasets) {
                      var dsname = list_of_datasets[i];
                      var unique_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project_name, dsname+'.fa.unique');
                      project_info[project_name].validation[dsname+'.fa.unique'] = helpers.fileExists(unique_file);  // true or false
                  }
                  project_info[project_name].pid = 0;
                  project_info[project_name].tax_status = 'No Taxonomic Assignments Yet';
                  project_info[project_name].classified_by = 'none';
              }
              //project_info[project_name].config = config;
              project_info[project_name].directory = items[d];
              project_info[project_name].mtime = stat_dir.mtime;
              project_info[project_name].project = project_name;
              project_info[project_name].number_of_datasets = config.GENERAL.number_of_datasets;
              project_info[project_name].project_sequence_count = config.GENERAL.project_sequence_count;
              project_info[project_name].public = config.GENERAL.public;
              project_info[project_name].env_source_id = config.GENERAL.env_source_id;
              project_info[project_name].DATASETS = config.DATASETS;
            }
            catch (err) {
              //console.log('nofile ', err);
            }

          }

        }
      }

      pnames.sort();
      //console.log(pnames);
      console.log(JSON.stringify(project_info));

    }  // readdir/err

      res.render('user_data/your_projects',
          { title: 'User Projects',
            pinfo: JSON.stringify(project_info),
            pnames: pnames,
            env_sources :   JSON.stringify(req.CONSTS.ENV_SOURCE),
            failmessage : req.flash('failMessage'),
            successmessage : req.flash('successMessage'),
            user: req.user, hostname: req.CONFIG.hostname
        });

    });  // readdir

});
//
//   GET -- EDIT_PROJECT: When first enter the page.
//
router.get('/edit_project/:project', helpers.isLoggedIn, function (req, res) {
  console.log('in edit project:GET');
  var project_name = req.params.project;
  var user_projects_base_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);


  var config_file = path.join(user_projects_base_dir, 'project-'+project_name, 'config.ini');

  //console.log(config_file);

  var project_info = {};
    //var stat_config = fs.statSync(config_file);
   project_info.config = iniparser.parseSync(config_file);

  if (project_name in PROJECT_INFORMATION_BY_PNAME) {   // these projects have tax assignments
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
    for (var i = 0; i < ALL_DATASETS.projects.length; i++) {
      if (ALL_DATASETS.projects[i].pid == project_info.pid) {
        for (var d = 0; d < ALL_DATASETS.projects[i].datasets.length; d++) {
          var did = ALL_DATASETS.projects[i].datasets[d].did;
          var ds  = ALL_DATASETS.projects[i].datasets[d].dname;
          var ddesc = ALL_DATASETS.projects[i].datasets[d].ddesc;

          project_info.dsets.push({ "did":did, "name":ds, "ddesc":ddesc });
        }
      }
    }


  } else {
    project_info.pid =0;
    project_info.status = 'No Taxonomic Assignments Yet';
    project_info.tax = 0;
    project_info.dsets = [];
    project_info.title = project_info.config.GENERAL.project_title;
    project_info.pdesc = project_info.config.GENERAL.project_description;
    if (project_info.config.GENERAL.public == 'True' || project_info.config.GENERAL.public == 1) {
      project_info.public = 1;
    } else {
      project_info.public = 0;
    }

    for (var ds in project_info.config.DATASETS) {
      project_info.dsets.push({ "did":'', "name":ds, "ddesc":'' });
    }

  }

  res.render('user_data/edit_project', {
        title       : 'Edit Project',
        project     : project_name,
        pinfo       : JSON.stringify(project_info),
        env_sources : JSON.stringify(req.CONSTS.ENV_SOURCE),
        message     : req.flash('message'),
        user: req.user, hostname: req.CONFIG.hostname,
    });
});

//
//   POST -- EDIT_PROJECT:  for accepting changes and re-showing the page
//

router.post('/edit_project', helpers.isLoggedIn, function (req, res) {
  console.log('in edit project:POST');
  console.log(req.body);


  if (req.body.new_project_name && req.body.new_project_name != req.body.old_project_name) {
    if (req.body.new_project_name in PROJECT_INFORMATION_BY_PNAME) {
      console.log('ERROR');
      req.flash('message', 'That project name is taken -- choose another.');
      res.redirect('/user_data/edit_project/'+req.body.old_project_name);
      return;
    }
  }


  // UPDATE DB ONLY if TAX ASSIGNMENTS PRESENT
  if (req.body.project_pid !== 0 && req.body.project_pid !== '0') {
    //sql call to projects, datasets
    var p_sql = "UPDATE project set project='"+req.body.new_project_name+"', \n";
    p_sql += " title='"+helpers.mysql_real_escape_string(req.body.new_project_title)+"', \n";
    p_sql += " rev_project_name='"+helpers.reverse(req.body.new_project_name)+"', \n";
    p_sql += " project_description='"+helpers.mysql_real_escape_string(req.body.new_project_description)+"', \n";
    if (req.body.new_privacy == 'False') {
      p_sql += " public='0'\n";
    } else {
      p_sql += " public='1'\n";
    }
    p_sql += " WHERE project_id='"+req.body.project_pid+"' ";
    console.log(p_sql);
    connection.query(p_sql, function (err, rows, fields) {
       if (err) {
         console.log('ERROR-in project update: '+err);
       } else {
         console.log('OK- project info updated: '+req.body.project_pid);
       }
    });

    // TODO  needed updates to data objects:
    //1- PROJECT_INFORMATION_BY_PNAME
    //console.log('PROJECT_INFORMATION_BY_PNAME')
    var tmp = PROJECT_INFORMATION_BY_PNAME[req.body.old_project_name];
    delete PROJECT_INFORMATION_BY_PNAME[req.body.old_project_name];
    PROJECT_INFORMATION_BY_PNAME[req.body.new_project_name] = tmp;
    //console.log(PROJECT_INFORMATION_BY_PNAME);

    //2- PROJECT_INFORMATION_BY_PID
    //console.log('PROJECT_INFORMATION_BY_PID')
    //console.log(req.body.project_pid);

    PROJECT_INFORMATION_BY_PID[req.body.project_pid].project         = req.body.new_project_name;
    PROJECT_INFORMATION_BY_PID[req.body.project_pid].env_source_name = req.CONSTS.ENV_SOURCE[req.body.new_env_source_id];
    PROJECT_INFORMATION_BY_PID[req.body.project_pid].title           = req.body.new_project_title;
    PROJECT_INFORMATION_BY_PID[req.body.project_pid].description     = req.body.new_project_description;
    if (req.body.new_privacy == 'False') {
      PROJECT_INFORMATION_BY_PID[req.body.project_pid].public = 0;
    } else {
      PROJECT_INFORMATION_BY_PID[req.body.project_pid].public = 1;
    }

    //console.log(PROJECT_INFORMATION_BY_PID[req.body.project_pid]);

    for (var d in req.body.new_dataset_names) {
      var d_sql = "UPDATE dataset set dataset='"+req.body.new_dataset_names[d]+"', \n";
      d_sql += " env_sample_source_id='"+req.body.new_env_source_id+"', \n";
      d_sql += " dataset_description='"+helpers.mysql_real_escape_string(req.body.new_dataset_descriptions[d])+"'\n";
      d_sql += " WHERE dataset_id='"+req.body.dataset_ids[d]+"' ";
      d_sql += " AND project_id='"+req.body.project_pid+"' ";
      //console.log(d_sql);
      // TODO: Don't make functions within a loop.
      connection.query(d_sql, function (err, rows, fields) {
        if (err) {
          console.log('ERROR - in dataset update: '+err);
        } else {
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
    for (var i = 0; i < ALL_DATASETS.projects.length; i++) {
      if (ALL_DATASETS.projects[i].pid == req.body.project_pid) {
        ALL_DATASETS.projects[i].name = req.body.new_project_name;
        ALL_DATASETS.projects[i].title = req.body.new_project_title;

        for (var d = 0; d < ALL_DATASETS.projects[i].datasets.length; d++) {
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
  var user_projects_base_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);

  var project_dir = path.join(user_projects_base_dir, 'project-'+project_name);
  var config_file = path.join(project_dir, 'config.ini');
  var timestamp = +new Date();  // millisecs since the epoch!
  var config_file_bu = path.join(project_dir, 'config'+timestamp+'.ini');
  fs.copy(config_file, config_file_bu, function (err) {
        if (err) {
          console.log(err);
        } else {
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

  if (req.body.new_project_name && req.body.new_project_name != req.body.old_project_name) {
    console.log('updating project name');
    var new_project_name = req.body.new_project_name.replace(/[\s+, ;:]/g, '_');
    config_info.project = new_project_name;
    project_info.config.GENERAL.project=new_project_name;
    new_base_dir = path.join(user_projects_base_dir, 'project-'+new_project_name);
    new_config_file = path.join(new_base_dir, 'config.ini');
    new_fasta_file = path.join(new_base_dir, 'infile.fna');
    config_info.baseoutputdir = new_base_dir;
    config_info.configPath = new_config_file;
    config_info.fasta_file = new_fasta_file;
    project_name = new_project_name;

  } else {
    config_info.project = project_name;
    config_info.baseoutputdir = project_info.config.GENERAL.baseoutputdir;
    config_info.configPath = project_info.config.GENERAL.configPath;
    config_info.fasta_file = project_info.config.GENERAL.fasta_file;
  }

  if (req.body.new_project_title) {
    console.log('updating project title');

    config_info.project_title = req.body.new_project_title;
    project_info.config.GENERAL.project_title = req.body.new_project_title;
  } else {
    config_info.project_title = project_info.config.GENERAL.project_title;
  }
  if (req.body.new_project_description) {
    console.log('updating project description');
    config_info.project_description = req.body.new_project_description;
    project_info.config.GENERAL.project_description = req.body.new_project_description;
  } else {
    config_info.project_description = project_info.config.GENERAL.project_description;
  }

  config_info.platform = project_info.config.GENERAL.platform;
  config_info.owner = project_info.config.GENERAL.owner;
  config_info.config_file_type = project_info.config.GENERAL.config_file_type;
  if (req.body.new_privacy != project_info.config.GENERAL.public) {
    console.log('updating privacy');
    config_info.public = req.body.new_privacy;
    project_info.config.GENERAL.public =req.body.new_privacy;
  } else {
    config_info.public = project_info.config.GENERAL.public;
  }

  config_info.fasta_type = project_info.config.GENERAL.fasta_type;
  config_info.dna_region = project_info.config.GENERAL.dna_region;
  config_info.project_sequence_count = project_info.config.GENERAL.project_sequence_count;
  config_info.domain = project_info.config.GENERAL.domain;
  config_info.number_of_datasets = project_info.config.GENERAL.number_of_datasets;
  config_info.sequence_counts = project_info.config.GENERAL.sequence_counts;

  if (req.body.new_env_source_id != project_info.config.GENERAL.env_source_id) {
    console.log('updating env id');
    config_info.env_source_id = req.body.new_env_source_id;
    project_info.config.GENERAL.env_source_id = req.body.new_env_source_id;
  } else {
    config_info.env_source_id = project_info.config.GENERAL.env_source_id;
  }

  config_info.has_tax = project_info.config.GENERAL.has_tax;

  var old_dataset_array = Object.keys(project_info.config.DATASETS).map(function (k) { return k; });
  var counts_array = Object.keys(project_info.config.DATASETS).map(function (k) { return project_info.config.DATASETS[k]; });
  console.log(old_dataset_array);
  project_info.config.DATASETS={};
  config_info.datasets = [];
  for (var n in req.body.dataset_ids) {
    new_dataset_name = req.body.new_dataset_names[n].replace(/[\s+, ;:]/g, '_');
    config_info.datasets.push({"oldname":old_dataset_array[n], "dsname":new_dataset_name, "did":req.body.dataset_ids[n], "count":counts_array[n]});
  }

  //console.log(config_info.datasets);
  if (req.body.project_pid > 0) {
    // TODO: HAS ASSIGNMENTS: NEED CHANGE DB & FILES
    // If the project has assignments:
    // change the three places on the file system as above but also:
    // the project_name, title, description and public in NODE_DATABASE.project
    // and the dataset_name, description and env_id in NODE_DATABASE.dataset
    // Also need to update PROJECT_INFORMATION_BY_PNAME
  }


  if (project_name in PROJECT_INFORMATION_BY_PNAME) {
    project_info.pid = PROJECT_INFORMATION_BY_PNAME[project_name].pid;
    project_info.status = 'Taxonomic Data Available';
    project_info.tax = 'GAST';
  } else {
    project_info.pid = 0;
    project_info.status = 'No Taxonomic Assignments Yet';
    project_info.tax = 0;
  }


  if (req.body.new_project_name && req.body.new_project_name != req.body.old_project_name) {
    config_info.old_base_name = project_info.config.GENERAL.baseoutputdir;
    update_config(res, req, config_file, config_info, true, 'Updated project: '+config_info.project);
  } else {
    update_config(res, req, config_file, config_info, false, 'Updated project: '+config_info.project);
  }


});
//
//  UPLOAD  METADATA
//
router.post('/upload_metadata', [helpers.isLoggedIn, upload.single('upload_file', 12)], function (req, res) {
  var project = req.body.project_name;
  var file_format = req.body.metadata_file_format;
  var original_metafile = path.join(process.env.PWD, req.file.path);
  var username = req.user.username;
  console.log('1-req.body upload_metadata');
  console.log(req.body);
  console.log(req.file);
  console.log('2-req.body upload_metadata');
  var has_tax = false;
  if (project in PROJECT_INFORMATION_BY_PNAME) {
    has_tax = true;

  }

  var timestamp = +new Date();  // millisecs since the epoch!
  var data_repository = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project);

					var options = { scriptPath : req.CONFIG.PATH_TO_NODE_SCRIPTS,
		        			args : [ '-i', original_metafile, '-t',file_format,'-o', username, '-p', project, '-db', NODE_DATABASE, '-add','-pdir',process.env.PWD,]
		    			};
					if(has_tax){
						options.args = options.args.concat(['--has_tax']);
					}
					console.log(options.scriptPath+'/metadata_utils.py '+options.args.join(' '));
					
					var log = fs.openSync(path.join(process.env.PWD,'logs','upload.log'), 'a');
					var upload_metadata_process = spawn( options.scriptPath+'/metadata_utils.py', options.args, {detached: true, stdio: [ 'ignore', null, log ]} );  // stdin, stdout, stderr
					var output = '';
					console.log('py process pid='+upload_metadata_process.pid);
					upload_metadata_process.stdout.on('data', function (data) {
					  console.log('stdout: ' + data);
					  data = data.toString().replace(/^\s+|\s+$/g, '');
					  output += data;

					  // var lines = data.split('\n')
					  // for(var n in lines){
					  // 	//console.log('line: ' + lines[n]);
							// if(lines[n].substring(0,4) == 'PID='){
							// 	console.log('pid line ' + lines[n]);
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
									connection.query(queries.get_select_datasets_queryPID(pid), function (err, rows1, fields){
								    if (err)  {
							 		  	console.log('1-Upload METADATA-Query error: ' + err);				 		  			
							      } else {
			        				   	connection.query(queries.get_select_sequences_queryPID(pid), function (err, rows2, fields){
			        				   		if (err)  {
			        				 		  	console.log('2-Upload METADATA-Query error: ' + err);        				 		
			        				    	} else {

			                      												
															//helpers.update_metadata_from_file();  // need to update to hdf5 file??

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
// ASh Aug 2016
// TODO: Andy, how to make it fail? For testing?
function ProjectNameGiven(project, req, res)
{
  if (project === '' || req.body.project === undefined) {
    req.flash('failMessage', 'A project name is required.');
    res.redirect("/user_data/import_data?import_type=" + req.body.type);
    return false;
  }
  else
  { return true; }
}

function ProjectNameExists(project, req, res)
{
  console.log('BBB: ProjectNameExists: PROJECT_INFORMATION_BY_PNAME ');
  console.log(util.inspect(PROJECT_INFORMATION_BY_PNAME, false, null));
  //
  // console.log('BBB: ProjectNameExists: project: ' + project);

  if (project in PROJECT_INFORMATION_BY_PNAME) {
      req.flash('failMessage', 'That project name is already taken.');
      res.redirect("/user_data/import_data?import_type=" + req.body.type);
      console.log('This project name is already taken');
      return true;
  }
  else
  {
    console.log('Project name does not exist');
    return false;
  }
}

function FastaExists(req, res)
{
  if (req.files[0].filename === undefined || req.files[0].size === 0) {
    req.flash('failMessage', 'A fasta file is required.');
    res.redirect("/user_data/import_data?import_type=" + req.body.type);
    return false;
  }
  else
  {
    return true;
  }
}

function ResFilePathExists(req, data_repository, res)
{
  if (helpers.fileExists(data_repository)) {
      return true;
    }
    else
    {
      req.flash('failMessage', 'There is no such file: ' + data_repository);
      console.log("AAA data_repository: " + data_repository);
      res.redirect("/user_data/import_data?import_type=" + req.body.type);
      return false;
    }
}

function MetadataFileExists(req, res)
{
  if (req.files[1].filename === undefined || req.files[1].size === 0) {
    req.flash('failMessage', 'A metadata csv file is required.');
    res.redirect("/user_data/import_data");
      return false;
    }
    else
    {
      return true;
    }
}

function ProjectExistsInDB(project, req, res)
{
  console.log("running ProjectExistsInDB");
  q = helpers.MakeSelectProjectId(project);
  console.log("q = " + q);
  result = helpers.RunQuery(q);
  console.log(util.inspect(result, false, null));
  if (result === '' || result === undefined)
  {
    req.flash('failMessage', 'There is no such project');
    res.redirect("/user_data/import_data");
    return false;
  }
  else
  {
    return true;
  }
}

function ProjectValidation(req, project, data_repository, res)
{
  console.log("running1 ProjectExistsInDB");
  project_exists_in_db = ProjectExistsInDB(project, req, res);
  console.log("project_exists_in_db = " + project_exists_in_db);

  console.log("running ProjectNameGiven");
  project_name_given = ProjectNameGiven(project, req, res);
  console.log("project_name_given = " + project_name_given);

  // console.log("running ProjectNameExists");
  // project_name_exists = ProjectNameExists(project, req, res);
  // console.log("project_name_exists = " + project_name_exists);

  console.log("running FastaExists");
  fasta_exists = FastaExists(req, res);
  console.log("fasta_exists = " +fasta_exists);

  // console.log("running ResFilePathExists");
  // console.log("data_repository = " + data_repository);
  // file_path_exists = ResFilePathExists(req, data_repository, res);
  // console.log("file_path_exists = " + file_path_exists);

  console.log("running MetadataFileExists");
  metadata_file_exists = MetadataFileExists(req, res);
  console.log("metadata_file_exists = " + metadata_file_exists);
}

// TODO: move to helpers
function IsFileCompressed(file)
{
  var file_compressed = false;
  if (file.mimetype === 'application/x-gzip')
  {
    file_compressed = true;
  }
  return file_compressed;
}

var LoadDataFinishRequest = function (req, res, project, display) {
  console.log('display from LoadDataFinishRequest: ' + "display");

  // START STATUS //
  req.flash('successMessage', "Upload in Progress: '" + project + "'");

  // type, user, project, status, msg
  res.render('success', {  title   : 'VAMPS: Import Success',
                            message : req.flash('successMessage'),
                            display : display,
                            user    : req.user, hostname: req.CONFIG.hostname
  });
};

function OriginalMetafileUpload(req, options)
{
  var original_metafile  = '';
  try {
    //original_metafile  = path.join(process.env.PWD, 'tmp', req.files[1].filename);
    original_metafile   = path.join(req.CONFIG.TMP, req.files[1].filename);
    options.args        = options.args.concat(['-mdfile', original_metafile ]);
    metadata_compressed = IsFileCompressed(req.files[1]);

    if (metadata_compressed) options.args = options.args.concat(['-md_comp' ]);
  }
  catch(err) {
    console.log('No Metadata file: ' + err + '; Continuing on');
    original_metafile  = '';
  }

  // return original_metafile;
}

function CheckFileTypeInfo(req, options)
{
  if (req.body.type == 'simple_fasta') {
      if (req.body.dataset === '' || req.body.dataset === undefined) {
        req.flash('failMessage', 'A dataset name is required.');
        res.redirect("/user_data/import_data");
        return;
      }
      options.args = options.args.concat(['-upload_type', 'single', '-d', req.body.dataset ]);
    } else if (req.body.type == 'multi_fasta') {
        options.args = options.args.concat(['-upload_type', 'multi' ]);
    } else {
        req.flash('failMessage', 'No file type info found');
        res.redirect("/user_data/import_data");
        return;
    }
}

function CreateUploadOptions(req, res, project)
{
  var username = req.user.username;
  console.log('1-req.body upload_data');
  console.log(req.body);
  console.log(req.files);
  console.log('2-req.body upload_data');
  //console.log(project);

  //console.log(PROJECT_INFORMATION_BY_PNAME);
  var data_repository = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-' + project);
  console.log("data_repository DDD: " + data_repository);

  var fs_old   = require('fs');

  is_valid = ProjectValidation(req, project, data_repository, res);

  status_params = {'type'   : 'new',
                   'user_id': req.user.user_id,
                   'project': project,
                   'status' : 'OK',
                   'msg'    : 'Upload Started'};
  helpers.update_status(status_params);

  var original_fastafile = path.join(req.CONFIG.TMP, req.files[0].filename);

  var options = { scriptPath : req.CONFIG.PATH_TO_NODE_SCRIPTS,
              args : [ '-project_dir', data_repository, '-owner', username, '-p', project, '-site', req.CONFIG.site, '-infile', original_fastafile]
          };

  fasta_compressed = IsFileCompressed(req.files[0]);
  if (fasta_compressed) options.args = options.args.concat(['-fa_comp' ]);

  // console.log('========');

  OriginalMetafileUpload(req, options);
  // console.log('MMM Metadata file. options: ');
  // console.log(util.inspect(options, false, null));
  //TODO:
  // test, should be
//   MMM Metadata file. options:
//   { scriptPath: '/Users/ashipunova/BPC/vamps-node.js/public/scripts/node_process_scripts/',
//     args:
//      [ '-project_dir',
//        '/Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project',
//        '-owner',
//        'admin',
//        '-p',
//        'test_gast_project',
//        '-site',
//        'local',
//        '-infile',
//        '/Users/ashipunova/BPC/vamps-node.js/tmp/6004582520e0cf5ee0cb8a2a97232bee',
//        '-mdfile',
//        '/Users/ashipunova/BPC/vamps-node.js/tmp/59b29388a55ab33935d054bd0b4e2613' ] }
//

  CheckFileTypeInfo(req, options);
    // console.log('MMM CheckFileTypeInfo. options: ');
    // console.log(util.inspect(options, false, null));
    // TODO: test
    // MMM CheckFileTypeInfo. options:
    // ...
    //      '-upload_type',
    //      'single',
    //      '-d',
    //      'test_gast_dataset' ] }

    options.args = options.args.concat(['-q' ]);   // QUIET
    return [data_repository, options];
}

function CreateCmdList(req, options, data_repository)
{
  console.log(options.scriptPath + '/vamps_script_load_trimmed_data.py ' + options.args.join(' '));
  var load_cmd = options.scriptPath + '/vamps_script_load_trimmed_data.py ' + options.args.join(' ');
  // console.log("LLL load_cmd: " + load_cmd);
  // /Users/ashipunova/BPC/vamps-node.js/public/scripts/node_process_scripts//vamps_script_load_trimmed_data.py -project_dir /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project -owner admin -p test_gast_project -site local -infile /Users/ashipunova/BPC/vamps-node.js/tmp/b3a0c4ca3964f701e8ea6ef5d5fe2c56 -mdfile /Users/ashipunova/BPC/vamps-node.js/tmp/a9825a22a87f9b6600e7bf44dd13be48 -upload_type single -d test_gast_dataset -q

  var cmd_list = [load_cmd];

  if (req.body.type == 'multi_fasta') {
      var new_fasta_file_name = 'infile.fna';
      var demultiplex_cmd = options.scriptPath + '/vamps_script_demultiplex.sh ' + data_repository + ' ' + new_fasta_file_name;
      cmd_list.push(demultiplex_cmd);
  }

  var fnaunique_cmd = options.scriptPath + '/vamps_script_fnaunique.sh ' + req.CONFIG.PATH + " " + data_repository;
  console.log("LLL1 options.scriptPath: " + options.scriptPath);
  console.log("LLL fnaunique_cmd: " + fnaunique_cmd);
  console.log("LLL2 data_repository: " + data_repository);
  console.log("LLL3 req.CONFIG.PATH: " + req.CONFIG.PATH);

  cmd_list.push(fnaunique_cmd);

  // console.log("CCC1 cmd_list: ");
  // console.log(util.inspect(cmd_list, false, null));
  return cmd_list;

  //TODO:
  // test:
  // CCC1 cmd_list:
  // [ '/Users/ashipunova/BPC/vamps-node.js/public/scripts/node_process_scripts/vamps_script_load_trimmed_data.py -project_dir /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project -owner admin -p test_gast_project -site local -infile /Users/ashipunova/BPC/vamps-node.js/tmp/... -mdfile /Users/ashipunova/BPC/vamps-node.js/tmp/... -upload_type single -d test_gast_dataset -q',
  //   '/Users/ashipunova/BPC/vamps-node.js/public/scripts/node_process_scripts/vamps_script_fnaunique.sh /opt/local/bin:/opt/local/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/local/ncbi/blast/bin:/opt/local/bin:/usr/local/mysql/bin:/opt/local/Library/Frameworks/Python.framework/Versions/2.7/bin:/Users/ashipunova/BPC/vamps-node.js/public/scripts/bin: /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project' ]

}

function CheckIfPID(data)
{
  // console.log("FFF In CheckIfPID");
  var lines = data.split('\n');
  for (var n in lines) {
  // console.log('line: ' + lines[n]);
    if (lines[n].substring(0, 4) == 'PID=') {
    console.log('pid line ' + lines[n]);
    }
  }
}
// TODO: test
// CheckIfPID
// SSS2 stdout: _-n Hostname:
// Annas-MacBook.local
// -n Current working directory:
// /Users/ashipunova/BPC/vamps-node.js_
// GET /user_data/import_data?import_type=simple_fasta 200 14.158 ms - -
// SSS2 stdout: _reading /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project/test_gast_dataset-original.fna
// Deleting: /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project/meta-original.csv
// Deleting: /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project/test_gast_dataset-original.fna_
// SSS2 stdout: _Single file to unique_
// SSS2 stdout: _PPPATH\n
//
// lines: -n Hostname:
// lines: Annas-MacBook.local
// lines: -n Current working directory: ,/Users/ashipunova/BPC/vamps-node.js
// lines: reading /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project/test_gast_dataset-original.fna,Deleting: /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project/meta-original.csv,Deleting: /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project/test_gast_dataset-original.fna
// lines: Single file to unique
// lines: PPPATH\n,/Users/ashipunova/bin:/opt/local/bin:/opt/local/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/Library/TeX/texbin:/usr/local/mysql/bin:/opt/local/bin:/opt/local/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/local/ncbi/blast/bin:/opt/local/bin:/usr/local/mysql/bin:/opt/local/Library/Frameworks/Python.framework/Versions/2.7/bin:/Users/ashipunova/BPC/vamps-node.js/public/scripts/bin:\n,for file in /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project/*.fa; do fastaunique ; done\n
//

function GetScriptVars(req, data_repository, cmd_list)
{
  if (req.CONFIG.dbhost == 'vampsdev' || req.CONFIG.dbhost == 'vampsdb')
  {
   scriptlog   = path.join(data_repository, 'cluster.log');
   //var script_text = get_qsub_script_text(scriptlog, data_dir, req.CONFIG.dbhost, classifier, cmd_list)
   script_text = get_qsub_script_text(scriptlog, data_repository, req.CONFIG.dbhost, 'vampsupld', cmd_list);
  }
  else
  {
   scriptlog   = path.join(data_repository, 'script.log');
   script_text = get_local_script_text(scriptlog, 'local', 'vampsupld', cmd_list);
  }
  // console.log('111 scriptlog: ' + scriptlog);
  // console.log('222 script_text: ' + script_text);
  // console.log('222 =====');
  return [scriptlog, script_text];
}

router.post('/upload_data', [helpers.isLoggedIn, upload.array('upload_files', 12)], function (req, res) {
  var exec    = require('child_process').exec;
  var project  = helpers.clean_string(req.body.project);

  var created_options = CreateUploadOptions(req, res, project);
  var data_repository = created_options[0];
  var options         = created_options[1];
  console.log('MMM options: ');
  console.log(util.inspect(options, false, null));
  // TODO: test
  // MMM options:
  // { scriptPath: '/Users/ashipunova/BPC/vamps-node.js/public/scripts/node_process_scripts/',
  //   args:
  //    [ '-project_dir',
  //      '/Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project',
  //      '-owner',
  //      'admin',
  //      '-p',
  //      'test_gast_project',
  //      '-site',
  //      'local',
  //      '-infile',
  //      '/Users/ashipunova/BPC/vamps-node.js/tmp/44d4ec767dca9ccecfe7870b98fb4600',
  //      '-mdfile',
  //      '/Users/ashipunova/BPC/vamps-node.js/tmp/7be23488983b4c30ba0e32c4c5692b88',
  //      '-upload_type',
  //      'single',
  //      '-d',
  //      'test_gast_dataset',
  //      '-q' ] }

  fs.ensureDir(data_repository, function (err) {
      if (err) {console.log('ensureDir err:', err);} // => null
      else
      {
        fs.chmod(data_repository, 0775, function (err) {
          if (err) {
            console.log('chmod err:', err);
            return;
          }
          var cmd_list = CreateCmdList(req, options, data_repository);
          console.log("CCC2 cmd_list: ");
          console.log(util.inspect(cmd_list, false, null));

          script_name = 'load_script.sh';
          var nodelog     = fs.openSync(path.join(data_repository, 'assignment.log'), 'a');
          var script_vars = GetScriptVars(req, data_repository, cmd_list);
          var scriptlog   = script_vars[0];
          var script_text = script_vars[1];
          // TODO: test:
// 111 scriptlog: /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project/script.log
// 222 script_text: #!/bin/sh
//
// # CODE:  $code
//
// TSTAMP=`date "+%Y%m%d%H%M%S"`
//
// echo -n "Hostname: "
// hostname
// echo -n "Current working directory: "
// pwd
//
// /Users/ashipunova/BPC/vamps-node.js/public/scripts/node_process_scripts/vamps_script_load_trimmed_data.py -project_dir /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project -owner admin -p test_gast_project -site local -infile /Users/ashipunova/BPC/vamps-node.js/tmp/0e1cb0aad4ce57b30c6a0002a1ac2527 -mdfile /Users/ashipunova/BPC/vamps-node.js/tmp/dce2a788f226eb033388f2844a89648e -upload_type single -d test_gast_dataset -q
// /Users/ashipunova/BPC/vamps-node.js/public/scripts/node_process_scripts/vamps_script_fnaunique.sh /opt/local/bin:/opt/local/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/local/ncbi/blast/bin:/opt/local/bin:/usr/local/mysql/bin:/opt/local/Library/Frameworks/Python.framework/Versions/2.7/bin:/Users/ashipunova/BPC/vamps-node.js/public/scripts/bin: /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project
//
// 222 =====
//
// TODO: split the part below into smaller functions
          var script_path = path.join(data_repository, script_name);

          fs.writeFile(script_path, script_text, function (err) {
              if (err) return console.log(err);
              child = exec( 'chmod ug+rwx '+script_path, function (error, stdout, stderr) {
                  if (error !== null) {
                    console.log('1exec chmod error: ' + error);
                  }
                  else
                  {
                    var run_process = spawn( script_path, [], {
                      // env:{'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH,
                      // 'PATH':req.CONFIG.PATH,
                      // 'PERL5LIB':req.CONFIG.PERL5LIB,
                      // 'SGE_ROOT':req.CONFIG.SGE_ROOT, 'SGE_CELL':req.CONFIG.SGE_CELL, 'SGE_ARCH':req.CONFIG.SGE_ARCH
                      // },
                      detached: true, stdio: [ 'ignore', null, nodelog ]
                    });  // stdin, s

                    var output = '';

                    run_process.stdout.on('data', function (data) {
                      data = data.toString().trim();
                      output += data;
                      CheckIfPID(data);
                    });

                    run_process.on('close', function (code) {
                       console.log('run_process process exited with code ' + code);
                       var ary = output.split("\n");
                       var last_line = ary[ary.length - 1];
                       console.log('last_line:', last_line);
                       if (code === 0) {
                          status_params = {'type':'update',
                                            'user_id':req.user.user_id,
                                            'project':project,
                                            'status':'LOADED',
                                            'msg':'Project is loaded --without tax assignments'
                              };
                            helpers.update_status(status_params);

                            console.log('LoadDataFinishRequest in upload_data, project:');
                            console.log(util.inspect(project, false, null));

                            LoadDataFinishRequest(req, res, project, "Import_Success");
                            console.log('Finished loading ' + project);
                            // ();
                       } else
                       {
                        fs.move(data_repository, path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'FAILED-project-'+project), function (err) {
                            if (err) { console.log(err);  }
                            else {
                                req.flash('failMessage', 'Script Failure: '+last_line);
                                status_params = {'type':'update', 'user_id':req.user.user_id,
                                    'project':project, 'status':'Script Failure', 'msg':'Script Failure'
                                };
                                    //helpers.update_status(status_params);
                                res.redirect("/user_data/import_data?import_type="+req.body.type);  // for now we'll send errors to the browser
                                return;
                            }
                        });
                       }
                    });
                  } // end if/else
              }); // end exec
          });  // end writeFile

        });     //   END chmod
      }         // end else
    });         //   END ensuredir
//      }); //       END move 2
//      });  //     END move 1

});


router.get('/add_project', [helpers.isLoggedIn], function (req, res) {
  console.log('in add_project');

  res.render('user_data/add_project', {
    title: 'VAMPS: Add a new project',
    user: req.user,
    hostname: req.CONFIG.hostname,
    message: req.flash('message'),
    env_sources: JSON.stringify(req.CONSTS.ENV_SOURCE),
  });
});

function fetchID(data, callback) {
  user_info = [data.first_name, data.last_name, data.email, data.new_institution];
  
  
  connection.query('SELECT user_id FROM user WHERE first_name = ? AND last_name = ? AND email = ? AND institution = ?;', user_info, function(err, rows) {
    if (err) {
        callback(err, null);
    } else 
    {
      console.log('--- rows ---');
      console.log(util.inspect(rows, false, null));

      callback(null, rows[0].user_id);
    }
  });
}

function get_privacy_code(privacy_bulean){
  if (privacy_bulean === 'True')
    { return 1 }
  else
    { return 0 }
}

function saveToDb(req, res){ 
  var user_id;

  fetchID(req.form, function(err, content) {
      if (err) {
          console.log(err);
          // TODO: Do something with your error...
      } else {
          owner_user_id = content;
          var new_privacy = 1
          new_privacy = get_privacy_code(req.form.new_privacy);
          //TODO wrire a test for connection insert 1 vs. 0 for privacy

          // var project_columns = ['project', 'title', 'project_description', 'rev_project_name', 'funding', 'owner_user_id', 'public'];
          // var project_info = [req.form.new_project_name, req.form.new_project_title, req.form.new_project_description, "REVERSE(" + req.form.new_project_name + ")", req.form.new_funding, owner_user_id, new_privacy];
          // var inserts = [project_columns, project_info];
          // var insert_project_q = 'INSERT INTO project (??) VALUES (?);'
          //
          //
          // sql_a = mysql.format(insert_project_q, inserts);
          // sql_a = sql_a.replace(/'REVERSE\((\w+)\)'/g, 'REVERSE(\'$1\')');
          var sql_a = helpers.MakeInsertProjectQ(req.form, owner_user_id, new_privacy);
          console.log("AAA sql_a = " + sql_a);
          // connection.query('INSERT INTO project (project, title, project_description, rev_project_name, funding, owner_user_id, public) VALUES (?, ?, ?, REVERSE(?), ?, ?, ?);',
          
          connection.query(sql_a, 
          function (err, rows) {
           if (err) {
             console.log('ERROR-in project insert: ' + err);
             return;
     
           } else {

             req.body.project_pid = rows.insertId; 
             return rows.insertId;
           }
        });
      }
  });
}


function editAddProject(req, res){
  console.log('in editAddProject');

  // TODO: keep choosen ENV_SOURCE

  res.render('user_data/add_project', {
    title: 'VAMPS: Add a new project',
    user: req.user,
    hostname: req.CONFIG.hostname,
    messages: req.messages,
    add_project_info: req.add_project_info,
    env_sources:  JSON.stringify(req.CONSTS.ENV_SOURCE),
  });
}

// TODO: if user info didn't change use user_id from req.user
router.post('/add_project',
  [helpers.isLoggedIn],
  form(
    form.field("new_project_name", "Project Name").trim().required().is(/^[a-zA-Z_0-9]+$/, "Only letters, numbers and underscores are valid in %s").minLength(3).maxLength(20).entityEncode(),
    form.field("new_env_source_id", "ENV Source").trim().required().isInt(),
    form.field("new_privacy", "Public").trim().required().is(/False|True/),
    form.field("new_project_title", "Title").trim().required().entityEncode().maxLength(100),
    form.field("new_project_description", "Description").trim().required().entityEncode().maxLength(255),
    form.field("new_funding", "Funding").trim().required().is(/[0-9]/),
    // post.super.nested.property
    form.field("first_name", "First Name").trim().required().entityEncode().isAlphanumeric(),
    form.field("last_name", "Last Name").trim().required().entityEncode().isAlphanumeric(),
    form.field("email", "Email").trim().isEmail().required().entityEncode(),
    form.field("new_institution", "Institution").trim().required().entityEncode()
   ),
  function (req, res) {

    if (!req.form.isValid) {
      req.add_project_info = req.form;
      req.messages = req.form.errors;
      editAddProject(req, res);
    }
    else
    {
      saveToDb(req, res);      
      res.redirect("/user_data/import_choices");
    }

    return;
  }
);




//
// UPLOAD DATA TAX-BY-SEQ
//
router.post('/upload_data_tax_by_seq', [helpers.isLoggedIn, upload.array('upload_files', 12)], function (req, res) {

  console.log('upload_data_tax_by_seq');
  var project = req.body.project || '';
  var use_original_names = req.body.use_original_names || 'off';
  var username = req.user.username;
  var use_file_taxonomy = req.body.use_tax_from_file;

  //var p = progress()
  //req.pipe(p)
  //p.headers = req.headers
  //p.on('progress', function (progress) {
  //  console.log(progress);

    /*
    {
      percentage: 9.05,
      transferred: 949624,
      length: 10485760,
      remaining: 9536136,
      eta: 42,
      runtime: 3,
      delta: 295396,
      speed: 949624
    }
    */
  //});
  console.log('1req.body upload_data_tax_by_seq');
  console.log(req.body);
  console.log(req.files);  // array
  console.log('project: '+project || 'none');
  console.log('use_original_names: '+use_original_names);
  console.log('2req.body upload_data_tax_by_seq');
  //console.log(project);
  //console.log(PROJECT_INFORMATION_BY_PNAME);
  if (req.files.length === 0 ) {
    req.flash('failMessage', 'Make sure you are choosing a file to upload and that it is smaller than '+ req.CONFIG.UPLOAD_FILE_SIZE+' bytes');
    res.redirect("/user_data/import_data");
    return;
  }

  if (req.files[0] && req.files[0].size > config.UPLOAD_FILE_SIZE.bytes) {  // 1155240026
    req.flash('failMessage', 'The file '+req.files[0].originalname+' exceeds the limit of '+config.UPLOAD_FILE_SIZE.MB);
    res.redirect("/user_data/import_data");
    return;
  }
  if (req.files[1] && req.files[1].size > config.UPLOAD_FILE_SIZE.bytes) {
    req.flash('failMessage', 'The file '+req.files[1].originalname+' exceeds the limit of '+config.UPLOAD_FILE_SIZE.MB);
    res.redirect("/user_data/import_data");
    return;
  }
  if ((project === '' || req.body.project === undefined) && req.body.use_original_names != 'on') {
    req.flash('failMessage', 'A project name is required.');
    res.redirect("/user_data/import_data");
    return;
  } else if (project in PROJECT_INFORMATION_BY_PNAME) {
    req.flash('failMessage', 'That project name is already taken.');
    res.redirect("/user_data/import_data");
    return;
  } else if (req.files[0].filename === undefined || req.files[0].size === 0) {
    req.flash('failMessage', 'A tax_by_seq file is required.');
    res.redirect("/user_data/import_data");
    return;
  } else {



      //var file_path = path.join(process.env.PWD, req.file.path);
      //var original_taxbyseqfile = path.join('./user_data', NODE_DATABASE, 'tmp', req.files[0].filename);
      //var original_metafile  = path.join('./user_data', NODE_DATABASE, 'tmp', req.files[1].filename);
      //var original_taxbyseqfile = path.join(process.env.PWD, 'tmp', req.files[0].filename);
      var original_taxbyseqfile = path.join('/tmp', req.files[0].filename);
      console.log(original_taxbyseqfile);
      // TODO: test
      taxbyseq_compressed = IsFileCompressed(req.files[0]);
      //
      // taxbyseq_compressed = metadata_compressed = false;
      // if (req.files[0].mimetype === 'application/x-gzip') {
      //   taxbyseq_compressed = true;
      // }
      var original_metafile  = '';
      try {
        //original_metafile  = path.join(process.env.PWD, 'tmp', req.files[1].filename);
        original_metafile  = path.join('/tmp', req.files[1].filename);
        // TODO: test
        metadata_compressed = IsFileCompressed(req.files[1]);

        // if (req.files[1].mimetype === 'application/x-gzip') {
        //   metadata_compressed = true;
        // }
      }
      catch(err) {
        console.log('No Metadata file: '+err+'; Continuing on');
        original_metafile  = '';
      }
    //console.log('file '+req.files[0].originalname)
    //console.log(req.files[0])
    //console.log(taxbyseq_compressed)
    //console.log(taxbyseq_compressed)
    // { fieldname: 'upload_files',
    //   originalname: 'avoorhis_21190707TaxBySeq.txt.gz',
    //   encoding: '7bit',
    //   mimetype: 'application/x-gzip',
    //   destination: '/tmp',
    //   filename: 'c903a589970b36746c1bf22503270713',
    //   path: '/tmp/c903a589970b36746c1bf22503270713',
    //   size: 234197
    // }
    // { fieldname: 'upload_files',
    //   originalname: 'CNE_TaxBySeq.txt',
    //   encoding: '7bit',
    //   mimetype: 'text/plain',
    //   destination: '/tmp',
    //   filename: '3fdba8fdb25390c38e511149f459ee96',
    //   path: '/tmp/3fdba8fdb25390c38e511149f459ee96',
    //   size: 1668848
    // }

      var options = { scriptPath : req.CONFIG.PATH_TO_NODE_SCRIPTS,
                  args :       [ '-infile', original_taxbyseqfile, '-o', username, '--upload_type', 'multi',
                                  '--process_dir', process.env.PWD, '-db', NODE_DATABASE, '-host', req.CONFIG.dbhost ]
      };
      if (taxbyseq_compressed) {
        options.args = options.args.concat(['-tax_comp']);
      }
      if (original_metafile) {
        options.args = options.args.concat(['-md_file', original_metafile]);
        if (metadata_compressed) {
          options.args = options.args.concat(['-md_comp']);
        }
      }
      if (use_file_taxonomy === '1') {
        options.args = options.args.concat(['-use_tax']);
      }
      if (use_original_names == 'on') {
          options.args = options.args.concat(['-orig_names']);
      } else if (use_original_names == 'off') {
          options.args = options.args.concat(['-p', project]);
      } else {
          req.flash('failMessage', 'No file type info found:  ');
          res.redirect("/user_data/import_data");
          return;
      }

        console.log(options.scriptPath+'/vamps_load_tax_by_seq.py '+options.args.join(' '));

        var log = fs.openSync(path.join(process.env.PWD, 'logs', 'upload_taxbyseq.log'), 'a');


        var tax_by_seq_process = spawn( options.scriptPath+'/vamps_load_tax_by_seq.py', options.args, {
                              env:{ 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH, 'PATH':req.CONFIG.PATH },
                              detached: true, stdio: [ 'ignore', null, log ]
                            });  // stdin, stdout, stderr
        console.log('py process pid='+tax_by_seq_process.pid);
        var output = '';
        // communicating with an external python process
        // all the print statements in the py script are printed to stdout
        // so you can grab the projectID here at the end of the process.
        // use looging in the script to log to a file.
        tax_by_seq_process.stdout.on('data', function (data) {
            //console.log('Processing data');
            // data = data.toString().replace(/^\s+|\s+$/g, '');
            data = data.toString().trim();
            output += data;
            CheckIfPID(data);
        });
        tax_by_seq_process.on('close', function (code) {
           console.log('tax_by_seq_process exited with code ' + code);
           //console.log('output', output);
           var ary = output.split("\n");
           var last_line = ary[ary.length - 1];
           if (code === 0) {
             console.log('TAXBYSEQ Success');
             //console.log('PID last line: '+last_line)
             if (use_file_taxonomy) {
                 var ll = last_line.split('=');
                 // possibly multiple pids
                 pid_list = ll[1].split('-');
                 for (var i in pid_list) {
                   //var pid = ll[1];
                   var pid = pid_list[i];
                   console.log('NEW PID=: '+pid);
                   //console.log('ALL_DATASETS: '+JSON.stringify(ALL_DATASETS));
                   if (helpers.isInt(pid)) {
                     // TODO: Don't make functions within a loop.
                      connection.query(queries.get_select_datasets_queryPID(pid), function (err, rows1, fields) {
                        if (err)  {
                           console.log('1-TAXBYSEQ-Query error: ' + err);
                        } else {
                               connection.query(queries.get_select_sequences_queryPID(pid), function (err, rows2, fields) {
                                 if (err)  {
                                   console.log('2-TAXBYSEQ-Query error: ' + err);
                                } else {
                                  status_params = {'type':'update', 'user_id':req.user.user_id,
                                                  'pid':pid, 'status':'TAXBYSEQ-SUCCESS', 'msg':'TAXBYSEQ -Tax assignments' };

                                  helpers.assignment_finish_request(res, rows1, rows2, status_params);
                                  helpers.update_status(status_params);
                                  ALL_CLASSIFIERS_BY_PID[pid] = 'unknown';


                                }

                               });
                         } // end else

                     });

                       } else { // end if int
                             console.log('ERROR pid is not an integer: '+pid.toString());
                   }
                 } // end for pid in pid_list
              }
           } else {
               // ERROR
               console.log(output);
              console.log('ERROR last line: '+code);
               // NO REDIRECT here
               //req.flash('message', 'Script Error'+last_line);
              //res.redirect("/user_data/your_projects");
           }
        });  // end tax_by_seq_process ON Close

      // }); //   END chmod
      // }); //       END move 2
      // });  //     END move 1

  }

  console.log('LoadDataFinishRequest in upload_data_tax_by_seq');
  // console.log(util.inspect(req, false, null));
  // console.log('---');
  // console.log(util.inspect(res, false, null));
  // console.log('---');
  console.log(util.inspect(project, false, null));
  LoadDataFinishRequest(req, res, project, "TaxBySeq_Import_Success");


});

//
//  FILE UTILS
//
router.get('/file_utils', helpers.isLoggedIn, function (req, res) {

  console.log('in file_utils');
  //console.log(req.query.filename);
  var user = req.query.user;

  console.log(file);
  //// DOWNLOAD //////
  if (req.query.fxn == 'download' && req.query.template == '1') {
      var file = path.join(process.env.PWD, req.query.filename);
      res.setHeader('Content-Type', 'text');
      res.download(file); // Set disposition and send it.
  } else if (req.query.fxn == 'download' &&  req.query.type=='pcoa') {
      var file = path.join(process.env.PWD, 'tmp', req.query.filename);
      res.setHeader('Content-Type', 'text');
      res.download(file); // Set disposition and send it.
  } else if (req.query.fxn == 'download') {
        var file = path.join(req.CONFIG.USER_FILES_BASE, user, req.query.filename);

      res.setHeader('Content-Type', 'text');
      res.download(file); // Set disposition and send it.
  ///// DELETE /////
  } else if (req.query.fxn == 'delete') {
      var file = path.join(req.CONFIG.USER_FILES_BASE, user, req.query.filename);

    if (req.query.type == 'elements') {
      fs.unlink(file, function (err) {
        if (err) {
          console.log(err);
        } else {
          req.flash('message', 'Deleted: '+req.query.filename);
          res.redirect("/visuals/saved_elements");
        }
      }); //
    } else {
      fs.unlink(file, function (err) {
        if (err) {
          console.log(err);
        } else {
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
router.post('/download_selected_seqs', helpers.isLoggedIn, function (req, res) {
  var db = req.db;
  console.log('seqs req.body-->>');
  console.log(req.body);
  console.log('<<--req.body');
  console.log('in DOWNLOAD SELECTED SEQS');
  var referer = req.body.referer;
  var qSelect = "SELECT UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n";
  //var qSelect = "select sequence_comp as seq, sequence_id, seq_count, dataset from sequence_pdr_info\n";
  qSelect += " JOIN sequence using (sequence_id)\n";
  qSelect += " JOIN dataset using (dataset_id)\n";
  qSelect += " JOIN project using (project_id)\n";
  var seq, seqid, seq_count, pjds;
  var timestamp = +new Date();  // millisecs since the epoch!
  var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
  // if (req.CONFIG.hostname.substring(0, 7) == 'bpcweb7') {
  //       var user_dir = path.join('/groups/vampsweb/vampsdev_user_data/', req.user.username);
  // } else if (req.CONFIG.hostname.substring(0, 7) == 'bpcweb8') {
  //       var user_dir = path.join('/groups/vampsweb/vamps_user_data/', req.user.username);
  // } else {
  //       var user_dir = path.join(process.env.PWD, 'user_data', NODE_DATABASE, req.user.username);
  // }
  helpers.mkdirSync(req.CONFIG.USER_FILES_BASE);
  helpers.mkdirSync(user_dir);  // create dir if not exists
  var file_name;
  var out_file_path;

  if (req.body.download_type == 'whole_project') {

    var pid = req.body.pid;
    var project = req.body.project;
    file_name = 'fasta-'+timestamp+'_'+project+'.fa.gz';
    out_file_path = path.join(user_dir, file_name);
    qSelect += " where project_id = '"+pid+"'";

  } else if (req.body.download_type == 'partial_project') {

    //var pids = JSON.parse(req.body.datasets).ids;
    var dids = chosen_id_name_hash.ids;
    file_name = 'fasta-'+timestamp+'_custom.fa.gz';
    out_file_path = path.join(user_dir, file_name);
    qSelect += " where dataset_id in ("+dids+")";
    console.log(dids);

  } else if (req.body.download_type == 'custom_taxonomy') {

      req.flash('tax_message', 'Fasta being created');
      file_name = 'fasta-'+timestamp+'_custom_taxonomy.fa.gz';
      out_file_path = path.join(user_dir, file_name);
      var tax_string = req.body.tax_string;
      tax_items = tax_string.split(';');
      qSelect += " JOIN silva_taxonomy_info_per_seq using (sequence_id)\n";
      qSelect += " JOIN silva_taxonomy using (silva_taxonomy_id)\n";
      add_where = ' WHERE ';
      for (var n in tax_items) {
        rank = req.CONSTS.RANKS[n];
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
  var collection = db.query(qSelect, function (err, rows, fields) {
    if (err) {
        throw err;
    } else {
      for (var i in rows) {
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
              text : "Your fasta file is ready here:https://vamps.mbl.edu:8124\n\nAfter you log in go to the 'Your Data/File Retrieval' Page."
            };
        helpers.send_mail(info);


      });

  });

  res.send(file_name);


});

//
// DOWNLOAD METADATA
//
router.post('/download_selected_metadata', helpers.isLoggedIn, function (req, res) {
  var db = req.db;
  console.log('meta req.body-->>');
  console.log(req.body);
  var timestamp = +new Date();  // millisecs since the epoch!

  var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
  helpers.mkdirSync(req.CONFIG.USER_FILES_BASE);
  helpers.mkdirSync(user_dir);  // create dir if not exists
  var dids;
  var header, project;
  var file_name;
  var out_file_path;

  if (req.body.download_type == 'whole_project') {
    var pid  = req.body.pid;
    dids = DATASET_IDS_BY_PID[pid];
    project = req.body.project;
    file_name = 'metadata-'+timestamp+'_'+project+'.csv.gz';
    out_file_path = path.join(user_dir, file_name);
    header = 'Project: '+project+"\n\t";
  } else {   // partial projects
    dids = chosen_id_name_hash.ids;
    file_name = 'metadata-'+timestamp+'.csv.gz';
    out_file_path = path.join(user_dir, file_name);
    header = 'Project: various'+"\n\t";
  }
    console.log('dids');
    console.log(dids);


    var gzip = zlib.createGzip();
    var myrows = {}; // myrows[mdname] == [] list of values

    var wstream = fs.createWriteStream(out_file_path);
    var rs = new Readable();
    var filetxt;

      for (var i in dids) {
        did = dids[i];
        dname = DATASET_NAME_BY_DID[did];
        if (req.body.download_type == 'whole_project') {
          header += dname+"\t";

        } else {
          pname = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;
          header += pname+'--'+dname+"\t";
        }

        if(HDF5_MDATA === ''){
            for (var k in AllMetadata[did]){
              nm = k;
              val = AllMetadata[did][k];
              if(nm in myrows){
                myrows[nm].push(val);
              }else{
                myrows[nm] = [];
                myrows[nm].push(val);
              }
            }
        }else{
            var mdgroup = HDF5_MDATA.openGroup(did+"/metadata");
            mdgroup.refresh();
            Object.getOwnPropertyNames(mdgroup).forEach(function(mdname, idx, array) {
                if(mdname != 'id'){
                    val = mdgroup[mdname];
                    if(mdname in myrows){
                        myrows[mdname].push(val);
                      }else{
                        myrows[mdname] = [];
                        myrows[mdname].push(val);
                      }
                }
            });
        }



      }

    // print
    header += "\n";
    rs.push(header);
    if (Object.keys(myrows).length === 0) {
      rs.push("NO METADATA FOUND\n");
    } else {
      for (var mdname in myrows) {
        filetxt = mdname+"\t";  // restart sting
        for (i in myrows[mdname]) {
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
              text : "Your metadata file is ready here:\n\nhttps://vamps.mbl.edu:8124\n\nAfter you log in go to the 'Your Data/File Retrieval' Page."
        };
        helpers.send_mail(info);
        //req.flash('Done')



      });

    res.send(file_name);
});

//
// DOWNLOAD MATRIX
//
router.post('/download_selected_matrix', helpers.isLoggedIn, function (req, res) {
    var db = req.db;
    console.log('matrix req.body-->>');
    console.log(req.body);
    //var timestamp = +new Date();  // millisecs since the epoch!

     var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
    //var user_dir = path.join('user_data', NODE_DATABASE, req.user.username);
    helpers.mkdirSync(req.CONFIG.USER_FILES_BASE);
    helpers.mkdirSync(user_dir);  // create dir if not exists

    //console.log(biom_matrix)
    dids = chosen_id_name_hash.ids;
    var timestamp = +new Date();
    var file_name = 'matrix-'+timestamp+'.csv';
    //out_file_path = path.join(user_dir, file_name);


    var out_file = path.join(user_dir, file_name);
    var wstream = fs.createWriteStream(out_file);
    var gzip = zlib.createGzip();
    var rs = new Readable();

    header_txt = "Taxonomy ("+visual_post_items.tax_depth+" level)";
    for (var y in biom_matrix.columns) {
      header_txt += ', '+biom_matrix.columns[y].id;
    }
    header_txt += '\n\r';
    rs.push(header_txt);
    for (var i in biom_matrix.rows) {
      row_txt = '';
      row_txt += biom_matrix.rows[i].id;
      for (var k in biom_matrix.data[i]) {
        row_txt += ', '+biom_matrix.data[i][k];
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
//
//
router.post('/download_file', helpers.isLoggedIn, function (req, res) {
    console.log('in download_file');
    // file_type - fasta, metadata, or matrix
    console.log(req.body);
    var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
    var timestamp = +new Date();  // millisecs since the epoch!
    var file_tag = ['-'+req.body.file_type+'_file'];

    create_export_files(req, user_dir, timestamp, chosen_id_name_hash.ids, file_tag, visual_post_items.normalization, visual_post_items.tax_depth, visual_post_items.domains);
    res.send(req.body.file_type);
});
//
// DOWNLOAD PHYLOSEQ FILES
//
router.post('/copy_file_for_download', helpers.isLoggedIn, function (req, res) {
    console.log('phyloseq req.body-->>');

    console.log(req.body);
    old_ts = req.body.ts;
    file_type = req.body.file_type;
    var timestamp = +new Date();
    var old_file_name
    var new_file_name = file_type+'_'+timestamp+'.txt';
    if (file_type == 'phyloseq-biom') {
      old_file_name = old_ts+'_count_matrix.biom';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
      new_file_name = file_type+'_'+timestamp+'.biom';
    } else if (file_type == 'phyloseq-tax') {
      old_file_name = old_ts+'_taxonomy.txt';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
    } else if (file_type == 'phyloseq-meta') {
      old_file_name = old_ts+'_metadata.txt';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
    } else if (file_type == 'phyloseq-tree') {
      old_file_name = old_ts+'_outtree.tre';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
      new_file_name = file_type+'_'+timestamp+'.tre';
    }else if (file_type == 'distance-R') {
      old_file_name = old_ts+'_distance.R';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
    }else if (file_type == 'distance-py') {
      old_file_name = old_ts+'_distance.csv';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
      new_file_name = file_type+'_'+timestamp+'.csv';
    }else if (file_type == 'emperor-pc') {
      old_file_name = old_ts+'.pc';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
    }else if (file_type == 'pdf-fheatmap') {
      old_file_name = old_ts+'_fheatmap.pdf';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
      new_file_name = file_type+'_'+timestamp+'.pdf';
    }else if (file_type == 'pdf-pcoa') {
      old_file_name = old_ts+'_pcoa.pdf';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
      new_file_name = file_type+'_'+timestamp+'.pdf';

    }
    var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
    helpers.mkdirSync(req.CONFIG.USER_FILES_BASE);
    helpers.mkdirSync(user_dir);  // create dir if not exists
    var destination = path.join( user_dir, new_file_name );
    console.log(old_file_path, destination)
    fs.copy(old_file_path, destination, function (err) {
        if (err) return console.error(err);
        console.log("copy success!");
    });

    res.send(new_file_name);
});

//
// <<<< FUNCTIONS >>>>
//
function update_config(res, req, config_file, config_info, has_new_pname, msg) {
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

  for (var n in config_info.datasets) {
      new_config_txt += config_info.datasets[n].dsname+"="+config_info.datasets[n].count+"\n";
  }

  console.log(new_config_txt);

  fs.writeFile(config_file, new_config_txt, function (err) {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          console.log('write new config file success');
            if (has_new_pname) {
            // now change the directory name if the project_name is being updated
              old_base_dir = config_info.old_base_name;
              new_base_name = config_info.baseoutputdir;
              fs.move(old_base_dir, new_base_dir, function (err) {
                if (err) {
                  console.log(err);
                  res.send(err);
                } else {

                  update_dataset_names(config_info);
                  req.flash('successMessage', msg);
                  res.redirect('/user_data/your_projects');

                }

              });
          } else {

            update_dataset_names(config_info);
            req.flash('successMessage', msg);
            res.redirect('/user_data/your_projects');

          }

        }
    });


}
function update_dataset_names(config_info) {

    for (var n in config_info.datasets) {

          old_name_path = path.join(config_info.baseoutputdir, 'analysis', config_info.datasets[n].oldname);
          new_name_path = path.join(config_info.baseoutputdir, 'analysis', config_info.datasets[n].dsname);
          console.log(old_name_path);
          console.log(new_name_path);
          // TODO: Don't make functions within a loop.
          fs.move(old_name_path, new_name_path, function (err) {
            if (err) {
              console.log('WARNING failed to move dataset name '+err.toString());
            } else {
              console.log('moving '+config_info.datasets[n].oldname+' to '+config_info.datasets[n].dsname);
            }
          });


    }
}

/////////////////// EXPORTS ///////////////////////////////////////////////////////////////////////
function create_export_files(req, user_dir, ts, dids, file_tags, normalization, rank, domains) {
      var db = req.db;
    //file_name = 'fasta-'+ts+'_custom.fa.gz';
    var log = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'export_log.txt');
    //var log = path.join(user_dir, 'export_log.txt');
    if (normalization == 'max' || normalization == 'maximum' || normalization == 'normalized_to_maximum') {
        norm = 'normalized_to_maximum';
    } else if (normalization == 'percent') {
        norm = 'normailzed_by_percent';
    } else {
        norm = 'not_normalized';
    }

    var site = req.CONFIG.site;
    var code = 'NVexport';
    var pid_lookup = {};
    console.log('dids', dids);
    export_cmd = 'vamps_export_data.py';
    for (n=0;n<dids.length;n++) {
        console.log('did', dids[n]);
        pid_lookup[PROJECT_ID_BY_DID[dids[n]]] = 1;
    }

    var dids_str = JSON.stringify(dids.join(', '));
    var pids_str = JSON.stringify((Object.keys(pid_lookup)).join(', '));
    var domain_str = JSON.stringify(domains.join(', '));
    console.log('pids', pids_str);
    //var file_tags = file_tags.join(' ')
    var export_cmd_options = {

                         scriptPath : path.join(req.CONFIG.PATH_TO_NODE_SCRIPTS),
                         args :       ['-s', site,
                                         '-u', req.user.username,
                                         '-r', ts,
                                         '-base', user_dir,
                                         '-dids', dids_str,
                                         '-pids', pids_str,
                                         '-compress',
                                         '-norm', norm,
                                         '-rank', rank,
                                         '-domains', domain_str,
                                         '-db', NODE_DATABASE
                                         ] // '-compress'

                     };
    for (var t in file_tags) {
        export_cmd_options.args.push(file_tags[t]);
    }
    var cmd_list = [];
    cmd_list.push(path.join(export_cmd_options.scriptPath, export_cmd)+' '+export_cmd_options.args.join(' '));

    if (req.CONFIG.cluster_available === true) {
            qsub_script_text = get_qsub_script_text(log, req.CONFIG.TMP, site, code, cmd_list);
            qsub_file_name = req.user.username+'_qsub_export_'+ts+'.sh';
            qsub_file_path = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'tmp', qsub_file_name);

            fs.writeFile(qsub_file_path, qsub_script_text, function (err) {
                if (err) {
                    return console.log(err);
                } else {
                    console.log("The file was saved!");

                    console.log(qsub_script_text);
                    fs.chmod(qsub_file_path, '0775', function (err) {
                        if (err) {
                            return console.log(err);
                        } else {
                            var dwnld_process = spawn( qsub_file_path, {}, {
                              env:{ 'PATH':req.CONFIG.PATH, 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
                              detached: true,
                              stdio:['pipe', 'pipe', 'pipe']
                                //stdio: [ 'ignore', null, log ]
                            });  // stdin, stdout, stderr1


                        }
                    });
                 }
            });


    } else {
        console.log('No Cluster Available according to req.CONFIG.cluster_available');
        var cmd = path.join(export_cmd_options.scriptPath, export_cmd)+' '+export_cmd_options.args.join(' ');
        console.log('RUNNING:', cmd);
        //var log = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'tmp_log.log')
        var dwnld_process = spawn( path.join(export_cmd_options.scriptPath, export_cmd), export_cmd_options.args, {
                              env:{ 'PATH':req.CONFIG.PATH, 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
                              detached: true,
                              stdio: ['pipe', 'pipe', 'pipe']  // stdin, stdout, stderr
        });
        stdout = '';
        dwnld_process.stdout.on('data', function (data) {
            stdout += data;
        });
        stderr = '';
        dwnld_process.stderr.on('data', function (data) {
            stderr += data;
        });
        dwnld_process.on('close', function (code) {
            console.log('dwnld_process process exited with code ' + code);
            //console.log('stdout', stdout);
            //console.log('stderr', stderr);
            if (code === 0) {   // SUCCESS

            } else {
              console.log('ERROR', stderr);
              //res.send('Frequency Heatmap R Script Error:'+stderr);
            }
        });
    }

    return;

}
// function create_metadata_file(req, user_dir, ts, dids) {
//
//     var file_name, out_file_path;
//     file_name = 'metadata-'+ts+'_custom.gz';
//     out_file_path = path.join(user_dir, file_name);
//     pids = []
//
//         if (req.CONFIG.cluster_available == true) {
//             qsub_script_text = get_qsub_script_text(log, site, code, cmd_list)
//
//         } else {
//
//         }
//     return file_name;
// }
// function create_taxbytax_file(req, user_dir, ts, dids) {
//
//     var file_name, out_file_path;
//     file_name = 'taxbytax-'+ts+'_custom.gz';
//     out_file_path = path.join(user_dir, file_name);
//         if (req.CONFIG.cluster_available == true) {
//             qsub_script_text = get_qsub_script_text(log, site, code, cmd_list)
//
//         } else {
//
//         }
//     return file_name;
// }
// function create_taxbyref_file(req, user_dir, ts, dids) {
//
//     var file_name, out_file_path;
//     file_name = 'taxbyref-'+ts+'_custom.gz';
//     out_file_path = path.join(user_dir, file_name);
//         if (req.CONFIG.cluster_available == true) {
//             qsub_script_text = get_qsub_script_text(log, site, code, cmd_list)
//
//         } else {
//
//         }
//     return file_name;
// }
// function create_taxbyseq_file(req, user_dir, ts, dids) {
//
//     var file_name, out_file_path;
//     file_name = 'taxbyseq-'+ts+'_custom.gz';
//     out_file_path = path.join(user_dir, file_name);
//         if (req.CONFIG.cluster_available == true) {
//             qsub_script_text = get_qsub_script_text(log, site, code, cmd_list)
//
//         } else {
//
//         }
//     return file_name;
// }
function create_fasta_file(req, user_dir, ts, dids) {
    var db = req.db;
    file_name = 'fasta-'+ts+'_custom.fa.gz';
    var log = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'export_log.txt');
    //var log = path.join(user_dir, 'export_log.txt');

    var site = req.CONFIG.site;
    var code = 'NVtest';
    export_cmd = 'vamps_export_data.py';

    dids = JSON.stringify(dids);

    var export_cmd_options = {
                         scriptPath : path.join(req.CONFIG.SYSTEM_FILES_BASE, 'scripts'),
                         args :       ['-s', site, '-u', req.user.username, '-r', ts, '-base', user_dir, '-dids', dids, '--fasta_file', '-compress' ] // '-compress'
                     };
    var cmd_list = [];
    cmd_list.push(path.join(export_cmd_options.scriptPath, export_cmd)+' '+export_cmd_options.args.join(' '));

    if (req.CONFIG.cluster_available === true) {
            qsub_script_text = get_qsub_script_text(log, req.CONFIG.TMP, site, code, cmd_list);
            qsub_file_name = req.user.username+'_qsub_export_'+ts+'.sh';
            qsub_file_path = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'tmp', qsub_file_name);

            fs.writeFile(qsub_file_path, qsub_script_text, function (err) {
                if (err) {
                    return console.log(err);
                } else {
                    console.log("The file was saved!");

                    console.log(qsub_script_text);
                    fs.chmod(qsub_file_path, '0775', function (err) {
                        if (err) {
                            return console.log(err);
                        } else {
                            var pcoa_process = spawn( qsub_file_path, {}, {
                              env:{ 'PATH':req.CONFIG.PATH, 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
                              detached: true,
                              stdio:['pipe', 'pipe', 'pipe']
                                //stdio: [ 'ignore', null, log ]
                            });  // stdin, stdout, stderr1


                        }
                    });
                 }
            });

        } else {
            console.log('No Cluster Available');
        }
    return file_name;

    // TODO: Unreachable 'var' after 'return'.
     var qSelect = "SELECT UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n";
    //var qSelect = "select sequence_comp as seq, sequence_id, seq_count, dataset from sequence_pdr_info\n";
    qSelect += " JOIN sequence using (sequence_id)\n";
    qSelect += " JOIN dataset using (dataset_id)\n";
    qSelect += " JOIN project using (project_id)\n";
    var seq, seqid, seq_count, pjds;
    var file_name, out_file_path;

    //var pids = JSON.parse(req.body.datasets).ids;

    out_file_path = path.join(user_dir, file_name);
    qSelect += " where dataset_id in ("+pids+")";

    var gzip = zlib.createGzip();
    console.log(qSelect);

    var wstream = fs.createWriteStream(out_file_path);
    var rs = new Readable();
    var collection = db.query(qSelect, function (err, rows, fields) {
      if (err) {
          throw err;
      } else {
        for (var i in rows) {
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
                text : "Your fasta file is ready here:https://vamps.mbl.edu:8124\n\nAfter you log in go to the 'Your Data/File Retrieval' Page."
              };
          helpers.send_mail(info);


        });

    });

    return file_name;

}
/////////////////////////////////////////////////////////////////////////////////////////////////
function get_local_script_text(log, site, code, cmd_list) {
      //### Create Cluster Script
    script_text = "#!/bin/sh\n\n";
    script_text += "# CODE:\t$code\n\n";
    //script_text += "# source environment:\n";
    //script_text += "source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh\n\n";
    script_text += 'TSTAMP=`date "+%Y%m%d%H%M%S"`'+"\n\n";

    script_text += 'echo -n "Hostname: "'+"\n";
    script_text += "hostname\n";
    script_text += 'echo -n "Current working directory: "'+"\n";
    script_text += "pwd\n\n";
    for (var i in cmd_list) {
        script_text += cmd_list[i]+"\n";
    }
    //script_text += "chmod 666 "+log+"\n";

    //##### END  create command

    return script_text;
}
//
//
//
function get_qsub_script_text(log, pwd, site, name, cmd_list) {
    /*
    #!/bin/sh
    # CODE:
    # source environment:\n";
    source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh
    TSTAMP=`date "+%Y%m%d%H%M%S"`'
    # . /usr/share/Modules/init/sh
    # export MODULEPATH=/usr/local/www/vamps/software/modulefiles
    # module load clusters/vamps
    cd "+pwd+"
    function status() {
       qstat -f
    }
    function submit_job() {
    cat<<END | qsub
    #!/bin/bash
    #$ -j y
    #$ -o "+log+"
    #$ -N "+name+"
    #$ -cwd
    #$ -V
    echo -n "Hostname: "
    hostname
    echo -n "Current working directory: "
    pwd
    source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh
    for (i in cmd_list) {
        cmd_list[i]
    }
    END
    }
    status
    submit_job
    */
    //### Create Cluster Script
    script_text = "#!/bin/bash\n\n";
    script_text += "# CODE:\t"+name+"\n\n";
    script_text += "# source environment:\n";
    script_text += "source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh\n\n";
    script_text += 'TSTAMP=`date "+%Y%m%d%H%M%S"`'+"\n\n";
    script_text += "# Loading Module didn't work when testing:\n";
    //$script_text .= "LOGNAME=test-output-$TSTAMP.log\n";
    script_text += ". /usr/share/Modules/init/sh\n";
    script_text += "export MODULEPATH=/usr/local/www/vamps/software/modulefiles\n";
    script_text += "module load clusters/vamps\n\n";
     script_text += "cd /groups/vampsweb/tmp\n\n";
    //script_text += "cd /groups/vampsweb/vampsdev_node_data/\n\n";
    //script_text += "cd "+pwd+"\n\n";
    //script_text += "mkdir "+pwd+"/gast\n\n";
    //script_text += "mkdir gast\n\n";
 //    script_text += "function status() {\n";
//     script_text += "   qstat -f\n";
//     script_text += "}\n\n";
     script_text += "function submit_job() {\n";
     script_text += "cat<<END | qsub\n";
     script_text += "#!/bin/bash\n";
     script_text += "#$ -j y\n";
     script_text += "#$ -o "+log+"\n";
     script_text += "#$ -N "+name+"\n";
     script_text += "#$ -cwd\n";
     script_text += "#$ -V\n";
     script_text += 'echo -n "Hostname: "'+"\n";
     script_text += "hostname\n";
     script_text += 'echo -n "qsub: Current working directory: "'+"\n";
     script_text += "pwd\n\n";
//     script_text += "source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh\n\n";
     for (var i in cmd_list) {
         script_text += cmd_list[i]+"\n";
     }
//
//     //script_text += "chmod 666 "+log+"\n";
//     //$script_text .= "sleep 120\n";   # for testing
     script_text += "END\n";
     script_text += "}\n";
//     script_text += "status\n";  //#  status will show up in export.out
     script_text += "submit_job\n";
    //##### END  create command

    return script_text;

}


function get_qsub_script_text2(log, pwd, site, name, cmd_list) {

    //### Create Cluster Script
    script_text = "#!/bin/sh\n\n";
    script_text += "# CODE:\t"+name+"\n\n";
    script_text += "# source environment:\n";
    script_text += "source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh\n\n";
    script_text += 'TSTAMP=`date "+%Y%m%d%H%M%S"`'+"\n\n";
    script_text += "# Loading Module didn't work when testing:\n";
    //$script_text .= "LOGNAME=test-output-$TSTAMP.log\n";
    script_text += "export MODULEPATH=/usr/local/www/vamps/software/modulefiles\n";
    script_text += ". /xraid/bioware/Modules/etc/profile.modules\n";
    script_text += "# . /usr/share/Modules/init/sh\n";
    script_text += "# export MODULEPATH=/usr/local/www/vamps/software/modulefiles\n";
    script_text += "module load clusters/vamps\n\n";
    script_text += "cd "+pwd+"\n\n";


    for (var i in cmd_list) {
        script_text += cmd_list[i]+"\n";
    }
    //script_text += "chmod 666 "+log+"\n";
    //$script_text .= "sleep 120\n";   # for testing

    script_text += "\n";


    //##### END  create command

    return script_text;

}
//
//
//

module.exports = router;
