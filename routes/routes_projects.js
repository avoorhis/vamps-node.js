let express = require('express');
let router = express.Router();
let fs   = require('fs-extra');
let nodemailer = require('nodemailer');
// let transporter = nodemailer.createTransport({});
// let zlib = require('zlib');
// let Readable = require('stream').Readable;
let helpers = require('./helpers/helpers');
let queries = require(app_root + '/routes/queries');
let path = require('path');
let config  = require(app_root + '/config/config');
//let crypto = require('crypto');
// These are all under /projects
/* GET New User page. */

router.get('/projects_index', function(req, res) {
  let project_list = [];

  for (let pid in PROJECT_INFORMATION_BY_PID){
    if(DATASET_IDS_BY_PID[pid].length > 0){
      project_list.push(PROJECT_INFORMATION_BY_PID[pid]);
    }
  }

  project_list.sort(function(a, b){
    return helpers.compareStrings_alpha(a.project, b.project);
  });

  console.log(project_list);
  res.render('projects/projects_index', {
    title: 'VAMPS Projects',
    projects: JSON.stringify(project_list),
    user: req.user, hostname: req.CONFIG.hostname
  });
});

function ProjectProfileFinishRequest (req, res, arg_obj) {
  res.render('projects/profile', {
    title: 'VAMPS Project',
    info: JSON.stringify(arg_obj.info),
    dsinfo: arg_obj.dsinfo,
    dscounts: JSON.stringify(arg_obj.dscounts),
    pid: req.params.id,
    mdata: JSON.stringify(arg_obj.mdata),
    pcount: arg_obj.project_count,
    portal: JSON.stringify(arg_obj.member_of_portal),
    publish_info: JSON.stringify(arg_obj.publish_data),
    pnotes: arg_obj.pnotes,
    dco_file: arg_obj.best_file,
    finfo: JSON.stringify(arg_obj.project_file_names),
    user: req.user,
    hostname: req.CONFIG.hostname
  });
}

function get_dscounts(dsinfo) {

  // return dsinfo.filter(function(obj)
  // {return (obj.did.startsWith(file_name_template))});
  let dscounts = {};

  for (let n in dsinfo) {
    let did = dsinfo[n].did;

    dscounts[did] = ALL_DCOUNTS_BY_DID[did];
  }
  return dscounts;
}

function get_dsinfo(req) {
  let all_pinfo = ALL_DATASETS.projects.find(project_obj => {
    return (project_obj.pid.toString() === req.params.id.toString());
  });
  return all_pinfo.datasets;
}

function get_mdata(dsinfo){
  let mdata = {};

  for (let n in dsinfo){
    let did = dsinfo[n].did;
    let metadata_name = dsinfo[n].dname;
    mdata[metadata_name] = {};

    for (let name in AllMetadata[did]){
      let data;
      if (name === 'primer_suite_id'){
        data = helpers.required_metadata_names_from_ids(AllMetadata[did], 'primer_ids');
        mdata[metadata_name][data.name] = data.value;
      }
      data = helpers.required_metadata_names_from_ids(AllMetadata[did], name);
      mdata[metadata_name][data.name] = data.value;
    }
  }
  return mdata;
}

function get_member_of_portal(req, info) {
  let project_parts = info.project.split('_');
  let project_prefix = project_parts[0]; // i.e. "DCO"
  let region_part = project_parts[project_parts.length - 1]; // i.e. "Av6"
  let portals_obj = req.CONSTS.PORTALS;

  let member_of_portal = {};

  member_of_portal = Object.keys(portals_obj).reduce((obj, portal) => {
    if (portals_obj[portal].prefixes.includes(project_prefix) ||
      portals_obj[portal].projects.includes(info.project) ||
      portals_obj[portal].suffixes.includes(region_part)
    ) {
      obj[portal] = {};
      obj[portal]["title"] = portals_obj[portal].maintitle;
      obj[portal]["portal"] = portal;
    }
    return obj;
    }, {});

  return member_of_portal;
}

//TODO: JSHint: This function's cyclomatic complexity is too high. (16) (W074)
router.get('/:id', helpers.isLoggedIn, function(req, res) {
  console.time("in_PJ_id");
  console.log('in PJ:id');
  console.log(req.params.id);
//  MD_ENV_PACKAGE
//  MD_DOMAIN
//  MD_DNA_REGION
//  MD_TARGET_GENE
//  MD_SEQUENCING_PLATFORM
//  MD_ADAPTER_SEQUENCE
//  MD_ILLUMINA_INDEX
//  MD_PRIMER_SUITE
//  MD_RUN
//  MD_ENV_ENVO    environmental
//  MD_ENV_CNTRY   country
//  MD_ENV_LZC     longhurst zone code
    
    if (req.params.id in PROJECT_INFORMATION_BY_PID) {
      let project_count = ALL_PCOUNTS_BY_PID[req.params.id];

      let dsinfo = get_dsinfo(req);
      let dscounts = get_dscounts(dsinfo);
      let mdata = get_mdata(dsinfo);

      let info = PROJECT_INFORMATION_BY_PID[req.params.id];
      let member_of_portal = get_member_of_portal(req, info);
      
      let info_file = '';
      let publish_data = {};
      // let best_file_path = '';
      let best_file = '';
      if(info.project.substring(0,3) === 'DCO'){
          try {
              info_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS,'DCO_INFO.json');
              publish_data = JSON.parse(fs.readFileSync(info_file, 'utf8'));
          } catch(e){
              publish_data = {};
          }
          // let dco_all_metadata_file = '';
          let best_date = Date.parse('2000-01-01');

          fs.readdirSync(req.CONFIG.PATH_TO_DCO_DOWNLOADS).forEach(file => {
              if (file.substring(0,16) === 'dco_all_metadata'){
                  //console.log('file '+file)
                  let file_date = file.substring(17, file.length - 7);
                  //console.log('file_date: '+file_date)
                  let d = Date.parse(file_date);
                  if (d > best_date){
                    best_file = file;
                  }
              }
          });
          //best_file =  'dco_all_metadata_'+yyyy+'-'+mm+'-'+dd+'.tsv.gz'
          //console.log('best_file '+best_file)
          // best_file_path = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS, best_file);
      }

      if(info.project.substring(0,3) === 'CMP'){
        try {
            info_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS,'CMP_INFO.json');
            publish_data = JSON.parse(fs.readFileSync(info_file, 'utf8'));
        } catch(e) {
            publish_data = {};
        }
      }
      let user_metadata_csv_files = get_csv_files(req);
      let project_file_names = filter_metadata_csv_files_by_project(user_metadata_csv_files, info.project, req.user.username);

      project_file_names.sort(function sortByTime(a, b) {
          //reverse sort: recent-->oldest
          return helpers.compareStrings_int(b.time.getTime(), a.time.getTime());
      });
      let pnotes = [];

      let arg_obj = {
        info: info,
        dsinfo: dsinfo,
        dscounts: dscounts,
        mdata: mdata,
        project_count: project_count,
        member_of_portal: member_of_portal,
        publish_data: publish_data,
        pnotes: pnotes,
        best_file: best_file,
        project_file_names: project_file_names,
      };

      connection.query(queries.get_project_notes_query(req.params.id), function mysqlGetNotes(err, rows){
          if (err)  {
                    console.log('Getting Project Notes Error: ' + err);
          } else {
            if(rows.length > 0){
              pnotes = rows[0].notes;
              arg_obj[pnotes] = pnotes;
            }
            ProjectProfileFinishRequest(req, res, arg_obj);
          }

      });
  }
    else {
    req.flash('fail','not found');
    res.redirect(req.get('referer'));
  }
  console.timeEnd("in_PJ_id");
});

router.post('/download_dco_metadata_file', helpers.isLoggedIn, function(req, res) {
  console.log('in POST download_dco_metadata_file');
  console.log(req.body);
  let file_path = path.join(req.CONFIG.PATH_TO_DCO_DOWNLOADS, req.body.dco_file);
  //let file_path = path.join('../vamps_data_downloads', req.body.file);
  console.log('file_path ' + file_path);
  // res.setHeader('Content-Type', 'application/gzip');
//     res.setHeader('Content-disposition', 'attachment; filename='+req.body.file);
//      let filestream = fs.createReadStream(file_path);
//   filestream.pipe(res);
  if (fs.existsSync(file_path)){
    console.log('Found file: '+file_path);
    res.download(file_path, function(err){
      if (err) {
        // Handle error, but keep in mind the response may be partially-sent
        // so check res.headersSent
        console.log(err);
      } else {
        // decrement a download credit, etc.
        console.log('okay');
      }
    });
  } else {
    console.log('no file found');
  }
});

// function make_mdata(mdname) {
//   if(mdname !== 'id'){
//     mdata[dsinfo[n].dname][mdname] = mdgroup[mdname];
//   }
// }

function get_csv_files(req) {
  // console.time("TIME: get_csv_files");

  let user_csv_dir = path.join(config.USER_FILES_BASE, req.user.username);
  let all_my_files = helpers.walk_sync(user_csv_dir);

  // console.timeEnd("TIME: get_csv_files");
  return all_my_files;
}

function filter_metadata_csv_files_by_project(file_names, project_name, username) {

  console.time("TIME: filter_metadata_csv_files_by_project");

  let file_name_template = "metadata-project_" + project_name + "_" + username;

  let project_metadata_file_names = file_names.filter(function(obj)
  {return (obj.filename.startsWith(file_name_template))});
  console.timeEnd("TIME: filter_metadata_csv_files_by_project");

  return project_metadata_file_names;
}

// router.get('/:id', helpers.isLoggedIn, function(req, res) {

// router.post('/import_choices/simple_fasta', [helpers.isLoggedIn, upload.array('upload_files', 12)],
//   form(
//     form.field("project", "Project Name").trim().required().is(/^[a-zA-Z_0-9]+$/, "Only letters, numbers and underscores are valid in %s").minLength(3).maxLength(20).entityEncode(),
//     form.field("dataset", "Dataset Name").trim().required().is(/^[a-zA-Z_0-9]+$/, "Only letters, numbers and underscores are valid in %s (no spaces)").maxLength(64).entityEncode()
//   ),
//   function (req, res)
//   {
//     console.log("QQQ1 in router.post('import_choices/simple_fasta'");
//     if (!req.form.isValid) {
//       req.flash('fail', req.form.errors);
//       editUploadData(req, res);
//       //TODO: check if the project name is in db, if not - redirect to add_project
//       return;
//     }
//     else
//     {
//       uploadData(req, res);
//     }
//   }
// );

// router.get('/update_metadata', helpers.isLoggedIn, function (req, res) {
//   console.log("IN Upload metadata");
//   console.log("not Coded yet");
//   res.render('/metadata', {
//   })
//   // req.flash('fail', 'Not Coded Yet');
//   // res.redirect('/user_data/your_data')
// });

module.exports = router;