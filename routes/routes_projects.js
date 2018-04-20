var express = require('express');
var router = express.Router();
var fs   = require('fs-extra');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({});
var zlib = require('zlib');
var Readable = require('stream').Readable;
var helpers = require('./helpers/helpers');
var path = require('path');
var config  = require(app_root + '/config/config');
//var crypto = require('crypto');
// These are all under /projects
/* GET New User page. */
router.get('/projects_index', function(req, res) {
  var db = req.db;

  //console.log(ALL_DATASETS);
  //console.log(PROJECT_INFORMATION_BY_PNAME)

  // var info = PROJECT_INFORMATION_BY_PID
  // console.log(info);
  //var keys = Object.keys(PROJECT_INFORMATION_BY_PNAME);
  //keys.sort();
  //var project_list = helpers.get_public_projects(req)
  var project_list = [];
  for(var pid in PROJECT_INFORMATION_BY_PID){
    if(DATASET_IDS_BY_PID[pid].length > 0){
      project_list.push(PROJECT_INFORMATION_BY_PID[pid]);
    }
  }

  // var pinfo = PROJECT_INFORMATION_BY_PID[prj.pid];
  //       //var public = pinfo.public
  //       //if(pinfo.public == 1){
  //           projects.push(pinfo);
  //       //}
  //
  // });

  project_list.sort(function(a, b){
    return helpers.compareStrings_alpha(a.project, b.project);
  });
  console.log(project_list);
  res.render('projects/projects_index', {
    title          : 'VAMPS Projects',
    projects  : JSON.stringify(project_list),
    user: req.user,hostname: req.CONFIG.hostname
  });


});

router.get('/:id', helpers.isLoggedIn, function(req, res) {
  var db = req.db;
  var dsinfo = [];
  var mdata = {};
  var dscounts = {};
  console.log('in PJ:id');
  console.log(req.params.id)
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

  //console.log(req.user)
 //  if(req.query.hasOwnProperty('metagenomic') && req.query.metagenomic == 1){
//     var metagenomic = true
//     var search_obj = METAGENOMIC_INFORMATION_BY_PID
//   }else{
//     var metagenomic = false
//     var search_obj = PROJECT_INFORMATION_BY_PID
//   }
      if(req.params.id in PROJECT_INFORMATION_BY_PID){
        var info = PROJECT_INFORMATION_BY_PID[req.params.id];
        var project_count = ALL_PCOUNTS_BY_PID[req.params.id];
        console.log(info)
        console.log("ALL_PCOUNTS_BY_PID 2: ");
        console.log(ALL_PCOUNTS_BY_PID);

        var dataset_counts = {};
        for(var n0 in ALL_DATASETS.projects){
          if(ALL_DATASETS.projects[n0].pid == req.params.id){
            dsinfo = ALL_DATASETS.projects[n0].datasets;
          }
        }
        for(var n in dsinfo){
          var did = dsinfo[n].did;
          dscounts[did] = ALL_DCOUNTS_BY_DID[did];
          mdata[dsinfo[n].dname] = {};
      

            for (var name in AllMetadata[did]){
              var data
              if(name == 'primer_suite_id'){
                data = helpers.required_metadata_names_from_ids(AllMetadata[did], 'primer_ids');
                mdata[dsinfo[n].dname][data.name] = data.value;
              }
              data = helpers.required_metadata_names_from_ids(AllMetadata[did], name);
              mdata[dsinfo[n].dname][data.name] = data.value;

            }
  


        }

        var project_parts = info.project.split('_');
        var project_prefix = info.project;

        if(project_parts.length >= 2 ){
          project_prefix = project_parts[0]+'_'+project_parts[1];
        }
        var member_of_portal = {};
        for(var p in req.CONSTS.PORTALS){
          //console.log(p +' -- '+project_parts[0])
          if(req.CONSTS.PORTALS[p].prefixes.indexOf(project_parts[0]) !== -1 ||
            req.CONSTS.PORTALS[p].projects.indexOf(info.project) !== -1 ||
            req.CONSTS.PORTALS[p].suffixes.indexOf(project_parts[project_parts.length - 1]) !== -1
          ){
            //console.log(req.CONSTS.PORTALS[p])
            member_of_portal[p] = {};
            member_of_portal[p].title = req.CONSTS.PORTALS[p].maintitle;
            member_of_portal[p].portal = p;
          }
        }



        var info_file = ''
        var abstract_data = {}
        var best_file_path = ''
        var best_file = ''
        if(info.project.substring(0,3) == 'DCO'){

          try{
            info_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS,'abstracts','DCO_info.json');
            abstract_data = JSON.parse(fs.readFileSync(info_file, 'utf8'));
          }catch(e){
            abstract_data = {};
          }
          var dco_all_metadata_file =''
          best_date = Date.parse('2000-01-01')

          fs.readdirSync(req.CONFIG.PATH_TO_DCO_DOWNLOADS).forEach(file => {
            if(file.substring(0,16) == 'dco_all_metadata'){
            //console.log('file '+file)
            file_date = file.substring(17,file.length - 7)
            //console.log('file_date: '+file_date)
            d = Date.parse(file_date)
            if(d > best_date){
              best_file = file
            }
          }
        })
          //best_file =  'dco_all_metadata_'+yyyy+'-'+mm+'-'+dd+'.tsv.gz'
          //console.log('best_file '+best_file)
          best_file_path = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS,best_file)


        }

        var user_metadata_csv_files = get_csv_files(req);
        var project_file_names = filter_csv_files_by_project(user_metadata_csv_files, info.project, req.user.username);

        project_file_names.sort(function sortByTime(a, b) {
          //reverse sort: recent-->oldest
          return helpers.compareStrings_int(b.time.getTime(), a.time.getTime());
        });

        //console.log(info)
        res.render('projects/profile', {
          title  : 'VAMPS Project',
          info: JSON.stringify(info),
          project_prefix : project_prefix,
          dsinfo: dsinfo,
          dscounts: JSON.stringify(dscounts),
          pid: req.params.id,
          mdata: JSON.stringify(mdata),
          pcount: project_count,
          portal :    JSON.stringify(member_of_portal),
          //abstracts: JSON.stringify(abstracts[project_prefix]),
          abstract_info : JSON.stringify(abstract_data),

          dco_file: best_file,

          finfo: JSON.stringify(project_file_names),

          user   : req.user,
          hostname: req.CONFIG.hostname
        });

  }else{
    req.flash('fail','not found');
    res.redirect(req.get('referer'));
    //return
  }
});

router.post('/download_dco_metadata_file', helpers.isLoggedIn, function(req, res) {
  console.log('in POST download_dco_metadata_file')
  console.log(req.body)
  var file_path = path.join(req.CONFIG.PATH_TO_DCO_DOWNLOADS, req.body.dco_file);
  //var file_path = path.join('../vamps_data_downloads', req.body.file);
  console.log('file_path '+file_path)
  // res.setHeader('Content-Type', 'application/gzip');
//     res.setHeader('Content-disposition', 'attachment; filename='+req.body.file);
//      var filestream = fs.createReadStream(file_path);
//   filestream.pipe(res);
  if(fs.existsSync(file_path)){
    console.log('Found file: '+file_path);
    res.download(file_path, function(err){
      if (err) {
        // Handle error, but keep in mind the response may be partially-sent
        // so check res.headersSent
        console.log(err)
      } else {
        // decrement a download credit, etc.
        console.log('okay')
      }
    })
  }else{
    console.log('no file found')
  }
});



function make_mdata(mdname) {
  if(mdname !== 'id'){
    mdata[dsinfo[n].dname][mdname] = mdgroup[mdname];
  }
}

function get_csv_files(req) {
  console.time("TIME: get_csv_files");

  var user_csv_dir = path.join(config.USER_FILES_BASE, req.user.username);
  var all_my_files = helpers.walk_sync(user_csv_dir);

  console.timeEnd("TIME: get_csv_files");
  return all_my_files;
}

function filter_csv_files_by_project(file_names, project_name, username) {
  console.time("TIME: filter_csv_files_by_project");

  file_name_template = "metadata-project_" + project_name + "_" + username;
  var project_file_names = [];

  for (var i0 in file_names) {
    if (file_names[i0].filename.indexOf(file_name_template) > -1) {
      project_file_names.push(file_names[i0]);
    }
  }
  console.timeEnd("TIME: filter_csv_files_by_project");

  return project_file_names;
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