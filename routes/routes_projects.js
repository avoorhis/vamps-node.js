var express = require('express');
var router = express.Router();
var fs   = require('fs');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({});
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
    //var keys = Object.keys(PROJECT_INFORMATION_BY_PNAME);
    //keys.sort();
    //var project_list = helpers.get_public_projects(req)
    project_list = [];
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
	if(req.params.id in PROJECT_INFORMATION_BY_PID){
      var info = PROJECT_INFORMATION_BY_PID[req.params.id];
      var project_count = ALL_PCOUNTS_BY_PID[req.params.id];


      dataset_counts = {};
      for(var n0 in ALL_DATASETS.projects){
        if(ALL_DATASETS.projects[n0].pid == req.params.id){
          dsinfo = ALL_DATASETS.projects[n0].datasets;
        }
      }
      for(var n in dsinfo){
        var did = dsinfo[n].did;
        dscounts[did] = ALL_DCOUNTS_BY_DID[did];
        mdata[dsinfo[n].dname] = {};
        if(HDF5_MDATA == ''){

            for (var name in AllMetadata[did]){
            
                var data = helpers.required_metadata_names_from_ids(AllMetadata[did], name);
                mdata[dsinfo[n].dname][data.name] = data.value;
                    
            }
        }else{
          var mdgroup = HDF5_MDATA.openGroup(did+"/metadata");
          mdgroup.refresh();

          Object.getOwnPropertyNames(mdgroup).forEach(function(mdname, idx, array) {
              if(mdname != 'id'){
                mdata[dsinfo[n].dname][mdname] = mdgroup[mdname];
              }
          });
        }

      }
      
        
        
        var project_parts = info.project.split('_');
        var project_prefix = info.project;
        if(project_parts.length >= 2 ){
            project_prefix = project_parts[0]+'_'+project_parts[1];
        }
        var member_of_portal = {};
        for(p in req.CONSTS.PORTALS){
            //console.log(p +' -- '+project_parts[0])
            if(req.CONSTS.PORTALS[p].prefixes.indexOf(project_parts[0]) != -1
                    || req.CONSTS.PORTALS[p].projects.indexOf(info.project) != -1
                    || req.CONSTS.PORTALS[p].suffixes.indexOf(project_parts[project_parts.length - 1]) != -1
                ){
                //console.log(req.CONSTS.PORTALS[p])
                member_of_portal[p] = {};
                member_of_portal[p].title = req.CONSTS.PORTALS[p].maintitle;
                member_of_portal[p].portal = p;
            }
        }
       
        
//console.log(member_of_portal)
        var info_file = '';
        var abstract_data = {};
        if(info.project.substring(0,3) == 'DCO'){
                try{
                  info_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS,'abstracts','DCO_info.json');
                  abstract_data = JSON.parse(fs.readFileSync(info_file, 'utf8'));
                }catch(e){
                  abstract_data = {};
                }
        }
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
                                      user   : req.user,
                                      hostname: req.CONFIG.hostname
                                    });
                
                   
        
        
      
      
      
      }else{
          req.flash('fail','not found');
          res.redirect(req.get('referer'));
          //return
      }

});



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
