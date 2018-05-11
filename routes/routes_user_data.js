/*jslint node: true */
// "use strict" ;

var express   = require('express');
var router    = express.Router();
var passport  = require('passport');
var path      = require('path');
var fs        = require('fs-extra');
var url       = require('url');
var ini       = require('ini');
var iniparser = require('iniparser');
var zlib      = require('zlib');
var multer    = require('multer');
var util      = require('util');
var escape    = require('escape-html');
var form      = require("express-form");
var mysql     = require('mysql2');
var pdf       = require('html-pdf');
var Readable  = require('readable-stream').Readable;
var spawn     = require('child_process').spawn;

var helpers = require(app_root + '/routes/helpers/helpers');
var queries = require(app_root + '/routes/queries');
var config  = require(app_root + '/config/config');
var CONSTS  = require(app_root + '/public/constants');
var COMMON  = require(app_root + '/routes/visuals/routes_common');
var META    = require('./visuals/routes_visuals_metadata');
var MTX     = require('./visuals/routes_counts_matrix');
//var progress = require('progress-stream');
//var upload = multer({ dest: config.TMP, limits: { fileSize: config.UPLOAD_FILE_SIZE.bytes }  });
var upload = multer({ dest: config.TMP, limits: { fileSize: '4gb' }  });
GLOBAL_EDIT_METADATA = {}
var infile_fa = "infile.fna";

//
// YOUR DATA
//
router.get('/your_data', helpers.isLoggedIn, function get_your_data(req, res) {
    console.log('in your data, req.user = ');
    console.log(req.user);
    // Should create empty directory for any user projects
    // that are in database BUT NOT in PROJECT_INFORMATION_BY_PID
    // this will allow adding to or deleteing these empty projects.
    //console.log(PROJECT_INFORMATION_BY_PNAME['seek'])
    connection.query(queries.get_projects_queryUID(req.user.user_id), function (err, rows, fields) {
        for(n in rows){
            pid = rows[n].project_id
            var dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+rows[n].project);
            if(! helpers.fileExists(dir)){
                 // turned OFF
                 //helpers.mkdirSync(dir);
            }
        }
    });
    res.render('user_data/your_data', {
        title: 'VAMPS:Data Administration',
        user: req.user, hostname: req.CONFIG.hostname,
        
    });
});

//
// FILE RETRIEVAL
//
/* GET Export Data page. */
router.get('/file_retrieval', helpers.isLoggedIn, function get_file_retrieval(req, res) {
  var export_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
  
  helpers.walk(export_dir, function(err, files) {
    if (err) throw err;
    files.sort(function sortByTime(a, b) {
      //reverse sort: recent-->oldest
      return helpers.compareStrings_int(b.time.getTime(), a.time.getTime());
    });
    //console.log(JSON.stringify(files))
    res.render('user_data/file_retrieval', { title: 'VAMPS:Retrieve Data',
      user: req.user, hostname: req.CONFIG.hostname,
      finfo: JSON.stringify(files)

    });
  });
});

//
//  EXPORT CONFIRM
//
router.post('/export_confirm', helpers.isLoggedIn, function (req, res) {
    console.log('req.body: export_confirm-->>');
    console.log(req.body);
    //console.log(req.session);
    console.log('req.body: <<--export_confirm');
    
    
    var id_name_order           = COMMON.create_chosen_id_name_order(req.session.chosen_id_order);
    if (req.body.fasta === undefined
        && req.body.taxbyseq === undefined
        && req.body.taxbyref === undefined
        && req.body.taxbytax === undefined
        && req.body.matrix === undefined
        && req.body.metadata1 === undefined
        && req.body.metadata2 === undefined
        && req.body.biom === undefined ) {
        req.flash('fail', 'Select one or more file formats');
        
        res.render('user_data/export_selection', {
          title					: 'VAMPS: Export Choices',
          referer				: 'export_data',
          chosen_id_name_hash	: JSON.stringify(id_name_order),
          constants				: JSON.stringify(req.CONSTS),
          selected_rank			: req.body.tax_depth,
          selected_domains		: JSON.stringify(req.body.domains),
          user: req.user, hostname: req.CONFIG.hostname
        });
        return;
    }
    
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
      if (key === 'taxbytax') {
        requested_files.push('-taxbytax_file');
      }
      if (key === 'metadata1') {
        requested_files.push('-metadata_file1');
      }
      if (key === 'metadata2') {
        requested_files.push('-metadata_file2');
      }
      if (key === 'biom') {
        requested_files.push('-biom_file');
      }


    }
    //console.log('id_name_order' )
    //console.log(id_name_order )
    if (requested_files.length >0) {
      if (req.body.tax_depth=='class') {var td='klass';}
      else {var td=req.body.tax_depth;}
      helpers.create_export_files(req, 
            user_dir, 
            timestamp, 
            req.session.chosen_id_order, 
            requested_files, 
            req.body.normalization, 
            td, 
            req.body.domains, 
            'yes',   // include_nas
            true );
    }
	req.flash('success', "Your file(s) are being created -- <a href='/user_data/file_retrieval' >when ready they will be accessible here: File Retrieval</a>");
    res.render('user_data/export_selection', {
          title: 'VAMPS: Export Choices',
          referer: 'export_data',
          chosen_id_name_hash 	: JSON.stringify(id_name_order),
          constants				: JSON.stringify(req.CONSTS),
          selected_rank			: req.body.tax_depth,
          selected_domains		: JSON.stringify(req.body.domains),
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
    var dataset_ids = JSON.parse(req.body.dataset_ids);
  } else {
    var dataset_ids = req.body.dataset_ids;
  }
  req.session.chosen_id_order   = dataset_ids
  
  //console.log('dataset_ids:: '+dataset_ids);
  if (dataset_ids === undefined || dataset_ids.length === 0) {
      console.log('redirecting back -- no data selected');
      req.flash('fail', 'Select Some Datasets');
      res.redirect('/visuals/visuals_index');
     return;
  } else {
   // GLOBAL Variable
  var id_name_order           = COMMON.create_chosen_id_name_order(dataset_ids);
 
    res.render('user_data/export_selection', {
          title: 'VAMPS: Export Choices',
          referer: 'export_data',
          constants: JSON.stringify(req.CONSTS),
          chosen_id_name_hash: JSON.stringify(id_name_order),
          selected_rank:'phylum', // initial condition
          selected_domains:JSON.stringify(req.CONSTS.DOMAINS.domains), // initial condition
          user: req.user, hostname: req.CONFIG.hostname
        });
  }
});


// AAV add metadata to established project Aug 14 2017
router.get('/import_choices/add_metadata_to_pr', helpers.isLoggedIn, function (req, res) {
    console.log('in GET import_choices/add_metadata_to_pr');
    //console.log(req.query)
    var project = req.query.project || ''
    //console.log(PROJECT_INFORMATION_BY_PID)
    owned_projects = [] 
    if(! project){
        for(pid in PROJECT_INFORMATION_BY_PID){
            if(PROJECT_INFORMATION_BY_PID[pid].oid == req.user.user_id){
                owned_projects.push(PROJECT_INFORMATION_BY_PID[pid].project)
            }
        }
    }
    //console.log('owned_projects',owned_projects)
    //console.log('MD_ENV_CNTRY size',Object.keys(MD_ENV_CNTRY).length)
    //console.log('MD_ENV_LZC size',Object.keys(MD_ENV_LZC).length)
    //console.log('MD_ENV_ENVO size',Object.keys(MD_ENV_ENVO).length)
    //console.log('MD_ENV_ENVO')
    var loc_array = []
    for(id in MD_ENV_CNTRY){
        loc_array.push({"name":MD_ENV_CNTRY[id],"id":id})
    }
    for(id in MD_ENV_LZC){
        loc_array.push({"name":MD_ENV_LZC[id],"id":id})
    }
    loc_array.sort(function sortByName(a, b) {
                return helpers.compareStrings_alpha(a.name, b.name);
    });
    
    res.render('user_data/add_metadata_to_project', {
          title: 'VAMPS:Add Metadata To Project',
          project: project,
          owned_projects : owned_projects,
          target_gene : JSON.stringify(MD_TARGET_GENE),
          domain : JSON.stringify(MD_DOMAIN),
          feature : JSON.stringify(req.CONSTS.FEATURE_PRIMARY),
          material : JSON.stringify(req.CONSTS.MATERIAL_PRIMARY),
          biome : JSON.stringify(req.CONSTS.BIOME_PRIMARY),
          location : JSON.stringify(loc_array),
          env_package : JSON.stringify(MD_ENV_PACKAGE),
          adapter_sequence : JSON.stringify(MD_ADAPTER_SEQUENCE),
          sequencing_platform : JSON.stringify(MD_SEQUENCING_PLATFORM),
          dna_region : JSON.stringify(MD_DNA_REGION),
          run : JSON.stringify(MD_RUN),
          primer_suite : JSON.stringify(MD_PRIMER_SUITE),
          illumina_index : JSON.stringify(MD_ILLUMINA_INDEX),
          req_md_fields : JSON.stringify(req.CONSTS.REQ_METADATA_FIELDS),
          user: req.user, hostname: req.CONFIG.hostname
          });
          
          //  res.render('user_data/add_metadata_to_project', {
//             title: 'VAMPS:Add Metadata To Project',
//             user: req.user,
//             hostname: req.CONFIG.hostname,
//             all_metadata: all_metadata,
//             all_field_names: all_field_names,
//             dividers: CONSTS.ORDERED_METADATA_DIVIDERS,
//             dna_extraction_options: CONSTS.MY_DNA_EXTRACTION_METH_OPTIONS,
//             dna_quantitation_options: CONSTS.DNA_QUANTITATION_OPTIONS,
//             biome_primary_options: CONSTS.BIOME_PRIMARY,
//             feature_primary_options: CONSTS.FEATURE_PRIMARY,
//             material_primary_options: CONSTS.MATERIAL_PRIMARY,
//             metadata_form_required_fields: CONSTS.METADATA_FORM_REQUIRED_FIELDS,
//             env_package_options: CONSTS.DCO_ENVIRONMENTAL_PACKAGES,
//             investigation_type_options: CONSTS.INVESTIGATION_TYPE,
//             sample_type_options: CONSTS.SAMPLE_TYPE
//           });
});
router.post('/retrieve_metadata', helpers.isLoggedIn, function (req, res) {
    console.log('in retrieve_metadata')
    console.log(req.body)
    var project = req.body.project;
    //console.log(project)
    var pid = PROJECT_INFORMATION_BY_PNAME[project].pid
    //console.log('pid',pid)
    var metadata = {}   // metadata[dname][mditem] = value
    metadata.by_mditem = {}   // metadata[mditem][dname] = value
    var dids = DATASET_IDS_BY_PID[pid]
    metadata.did_lookup = {}
    metadata.dname_lookup = {}
    //console.log('dids',dids)
    for(n in dids){
        dname = DATASET_NAME_BY_DID[dids[n]]
        //metadata[dname] = AllMetadata[dids[n]]
        metadata.did_lookup[dname] = dids[n]
        metadata.dname_lookup[dids[n]] = dname
    }
    
    for(i in req.CONSTS.REQ_METADATA_FIELDS){
        reqmdname = req.CONSTS.REQ_METADATA_FIELDS[i]    // ie "target_gene"
        metadata.by_mditem[reqmdname] = {}
        for(n in dids){
            did = dids[n]
            //console.log('did',did)
            dname = DATASET_NAME_BY_DID[did]
            
            if(AllMetadata.hasOwnProperty(did)){
                //console.log('Got ONE')
                if(AllMetadata[did].hasOwnProperty(reqmdname+'_id')){
                    return_obj = helpers.required_metadata_names_from_ids(AllMetadata[did],reqmdname+'_id')
                    metadata.by_mditem[return_obj.name][did] = return_obj.value
                }else if(AllMetadata[did].hasOwnProperty(reqmdname)){
                    metadata.by_mditem[reqmdname][did] = AllMetadata[did][reqmdname]
                }else{
                    metadata.by_mditem[reqmdname][did] = 'unknown'
                }
            }else{
                metadata.by_mditem[reqmdname][did] = 'unknownX'
            }
        }
    }
    //console.log('geo_loc_name')
    //console.log(metadata.by_mditem['geo_loc_name'])
    // adding custom metadata keys
    //console.log('keys1')
    //console.log(Object.keys(metadata.by_mditem))
    for(n in dids){
        did = dids[n]
        dname = DATASET_NAME_BY_DID[did]
        for(mdname in AllMetadata[did]){
            if( ! metadata.by_mditem.hasOwnProperty(mdname) && ! metadata.by_mditem.hasOwnProperty(mdname.substring(0,mdname.length-3))){
                metadata.by_mditem[mdname] = {}                
            }
        }        
    }
    //console.log('keys2')
    //console.log(Object.keys(metadata.by_mditem))
    // what is this for? Fill in custom metadata and unknowns
    for(mdname in metadata.by_mditem){
        for(n in dids){
            did = dids[n]
            dname = DATASET_NAME_BY_DID[did]
            if( AllMetadata.hasOwnProperty(did) && AllMetadata[did].hasOwnProperty(mdname) ){
                metadata.by_mditem[mdname][did] = AllMetadata[did][mdname]
            }else{
            
            }
        }
    }
    console.log('end of retr data')
    //console.log(Object.keys(metadata.by_mditem))
    //console.log(metadata.by_mditem)
    //console.log(metadata.by_mditem)
    //console.log(AllMetadata['73'])
    if(GLOBAL_EDIT_METADATA.hasOwnProperty('project') &&  GLOBAL_EDIT_METADATA.project == project){
       res.json(GLOBAL_EDIT_METADATA)
    }else{
        res.json(metadata)
    }
//
//
//
});
//
//  
//
router.post('/save_metadata', helpers.isLoggedIn, function (req, res) {
    console.log('in save metadata')
    console.log(req.body)
    
    GLOBAL_EDIT_METADATA = {}
    GLOBAL_EDIT_METADATA.project = req.body.project
    GLOBAL_EDIT_METADATA.by_mditem = req.body.data
    var pid = PROJECT_INFORMATION_BY_PNAME[GLOBAL_EDIT_METADATA.project].pid
    var dids = DATASET_IDS_BY_PID[pid]
    GLOBAL_EDIT_METADATA.did_lookup = {}
    GLOBAL_EDIT_METADATA.dname_lookup = {}
    //console.log('dids',dids)
    for(n in dids){
        dname = DATASET_NAME_BY_DID[dids[n]]
        GLOBAL_EDIT_METADATA.did_lookup[dname] = dids[n]
        GLOBAL_EDIT_METADATA.dname_lookup[dids[n]] = dname
    }
    
    var reqmditems_w_ids = ['env_package','env_biome','env_feature','env_material','target_gene','run','primer_suite','adapter_sequence','dna_region','domain','geo_loc_name','illumina_index','sequencing_platform']
    var reqmditems_wo_ids = ['latitude','longitude','collection_date']
    var pid = PROJECT_INFORMATION_BY_PNAME[req.body.project].pid
    //to_save_metadata = {}
    var obj = {}
    // want obj[did][mditem] = val
    for(i in dids){
        obj[dids[i]] = {}
    }
    // validate_metadata()
    // save to AllMetadata[did]
    req_data = {}
    cust_data= {}
    for(i in dids){
        did = dids[i]
        req_data[did] = {}
        cust_data[did] = {}
        for(mdname in GLOBAL_EDIT_METADATA.by_mditem){
            //console.log('mdname01 - '+mdname)
            val = GLOBAL_EDIT_METADATA.by_mditem[mdname][did]
            ret = save_av_metadata('id', mdname, val )
            obj[did][ret.name] = ret.value
            if(AllMetadata.hasOwnProperty(did)){
                AllMetadata[did][ret.name] = ret.value
            }else{
                AllMetadata[did] = {}
                AllMetadata[did][ret.name] = ret.value
            }
            if( reqmditems_w_ids.indexOf(mdname) != -1 || reqmditems_wo_ids.indexOf(mdname) != -1){
                req_data[did][ret.name] = ret.value
            }else{
                cust_data[did][ret.name] = ret.value
            }
        }
        //console.log('WRITING',did)
        
        helpers.write_metadata_to_files(did)
    }
   
    // REQUIRED METADATA
    var req_sql_fields = Array.from(reqmditems_wo_ids) // copies array not point to it
    var same_sql_fields = Array.from(reqmditems_wo_ids)
  
    for(n in reqmditems_w_ids){
        req_sql_fields.push(reqmditems_w_ids[n]+'_id')
        same_sql_fields.push(reqmditems_w_ids[n])
    }
   
    for(did in req_data){
        //console.log(req_data[did])
        q = "UPDATE required_metadata_info set "
        for(n in req_sql_fields){
            q += req_sql_fields[n]+"='"+req_data[did][req_sql_fields[n]]+"',"
        }
        q = q.substring(0,q.length-1)
        q += " where dataset_id='"+did+"'"
        //console.log(q)
        connection.query(q, function update_req_metadata(err, rows, fields) {
           if (err) {
             console.log('ERROR-in req metadata update: '+err);
           } else {
             console.log('OK- Still needs Re-build files and server restart');
           }
        });
        
    }
    req.flash('success', "Your data has been saved")
    // CUSTOM METADATA  
    // two tables involved: custom_metadata_<pid> and custom_metadata_fields
    // need to either delete/recreate *pid table or delete/add fields to existing table
    // Not sure the best way????
    // maybe write the entire json object into a file and send the administartor (me) an alert.
    // who should then run a script to install the metadata; rebuild the files and re-start the server
    
    // update_files()
    res.json({"resp":"Saved!"})
  
  
});
function save_av_metadata(type, mdname, data){
    console.log('type '+type+' item: '+mdname)
    var md = {}    
    if(data == ''){
        data = 'unknown'
    }
    if(mdname == 'adapter_sequence'){
        // get id asoc w/ env_package 
        idname = mdname+'_id'               
        value = helpers.get_key_from_value(MD_ADAPTER_SEQUENCE, data)                
    }else if(mdname == 'dna_region'){  
        idname = mdname+'_id'            
        value = helpers.get_key_from_value(MD_DNA_REGION, data)                
    }else if(mdname == 'domain'){     
        idname = mdname+'_id'         
        value = helpers.get_key_from_value(MD_DOMAIN, data)                
    }else if(mdname == 'env_biome'){  
        idname = mdname+'_id'              
        value = helpers.get_key_from_value(MD_ENV_ENVO, data)
                 
    }else if(mdname == 'env_feature'){
        idname = mdname+'_id'              
        value = helpers.get_key_from_value(MD_ENV_ENVO, data)                
    }else if(mdname == 'env_material'){
        idname = mdname+'_id'             
        value = helpers.get_key_from_value(MD_ENV_ENVO, data)                
    }else if(mdname == 'env_package'){
        idname = mdname+'_id'              
        value = helpers.get_key_from_value(MD_ENV_PACKAGE, data)                
    }else if(mdname == 'geo_loc_name'){
        idname = mdname+'_id'             
        value = helpers.get_key_from_value(MD_ENV_CNTRY, data) 
        if(! value ){
            value = helpers.get_key_from_value(MD_ENV_LZC, data) 
        }               
    }else if(mdname == 'primer_suite'){
        idname = mdname+'_id' 
        var p_obj = {}
        for(id in MD_PRIMER_SUITE){
            p_obj[id] = MD_PRIMER_SUITE[id].name
        }          
        value = helpers.get_key_from_value(p_obj, data)                
    }else if(mdname == 'run'){        
        idname = mdname+'_id'      
        value = helpers.get_key_from_value(MD_RUN, data)                
    }else if(mdname == 'target_gene'){
        idname = mdname+'_id'              
        value = helpers.get_key_from_value(MD_TARGET_GENE, data)                
    }else if(mdname == 'illumina_index'){
        idname = mdname+'_id'              
        value = helpers.get_key_from_value(MD_ILLUMINA_INDEX, data)                
    }else if(mdname == 'sequencing_platform'){ 
        idname = mdname+'_id'             
        value = helpers.get_key_from_value(MD_SEQUENCING_PLATFORM, data)                
    }else{ 
        idname =  mdname          
        value = data              
    }
    //console.log('2 '+idname+' -- '+value)
    md = { "name":idname, "value": value }
        //console.log('did '+did+' - '+mdname+' - '+data[did]+' key: '+value)
    return md    
}
function save_cust_metadata(pid, mdname, data){
    //console.log('type cust - item: '+mdname)
    for(did in data){
        //console.log(did+' - '+data[did])
    }
}
//
// IMPORT_CHOICES
//
/* GET Import Choices page. */
router.get('/import_choices', helpers.isLoggedIn, function (req, res) {
  console.log('in import_choices');
  var project = req.query.project || '' // url should always be like: /user_data/import_choices?project=andy003 
  if(req.user.security_level > 1 && req.CONFIG.hostname == 'bpcweb8'){
      req.flash('fail','Not coded yet')
      res.render('user_data/your_data', {
        title: 'VAMPS:Data Administration',
        user: req.user, hostname: req.CONFIG.hostname,
        
      });
      return;
  }
  if (req.user.username == 'guest') {
       req.flash('fail', "The 'guest' user is not permitted to import data");
       res.redirect('/user_data/your_data');
  } else {
      res.render('user_data/import_choices', {
          title: 'VAMPS:Import Choices',
          project: project,
          user: req.user, hostname: req.CONFIG.hostname
          });
  }
});

router.get('/import_choices/fasta', [helpers.isLoggedIn], function (req, res) {
    console.log('in GET import_choices/fasta')
    var rando = Math.floor((Math.random() * (999999 - 100000 + 1)) + 100000);
    var default_project_name = req.user.username+'_'+rando.toString();
    res.render('user_data/import_choices/fasta', {
          title: 'VAMPS:Import Data:fasta',
          def_name:default_project_name,
          user: req.user, hostname: req.CONFIG.hostname
    });
          
});
router.get('/import_choices/matrix', [helpers.isLoggedIn], function (req, res) {
    console.log('in GET import_choices/matrix')
    var rando = Math.floor((Math.random() * (999999 - 100000 + 1)) + 100000);
    var default_project_name = req.user.username+'_'+rando.toString();
    res.render('user_data/import_choices/matrix', {
          title: 'VAMPS:Import Data:matrix',
          def_name:default_project_name,
          user: req.user, hostname: req.CONFIG.hostname
    });
          
});
router.get('/import_choices/biom', [helpers.isLoggedIn], function (req, res) {
    console.log('in GET import_choices/biom')
    var rando = Math.floor((Math.random() * (999999 - 100000 + 1)) + 100000);
    var default_project_name = req.user.username+'_'+rando.toString();
    res.render('user_data/import_choices/biom', {
          title: 'VAMPS:Import Data:Biom',
          def_name:default_project_name,
          user: req.user, hostname: req.CONFIG.hostname
    });
          
});
//
//
router.post('/upload_import_file', [helpers.isLoggedIn, upload.any()], function(req, res) {
    console.log('in POST test_upload')
    console.log(req.body)
    
    var project = req.body.project_name
    var file_type = req.body.file_type
    var timestamp = +new Date();  // millisecs since the epoch!
    var original_file_path = req.files[0].path
    var original_file_name = req.files[0].originalname
    
    //
   
    var error_fxn = function(msg){
        console.log('FAIL re-open import choices page2')
        req.flash('fail',msg)
        res.render('user_data/import_choices', {
          title: 'VAMPS:Import Choices',
          project: '',
          user: req.user, hostname: req.CONFIG.hostname
          });
        return
    }
    if(PROJECT_INFORMATION_BY_PNAME.hasOwnProperty(project)){
        error_fxn('That project name is not availible.')
        return
    }
    var info = {}
    
    info.project_name = project
    info.total_seq_count = 0
    info.owner = req.user.username
    info.max_dataset_count = 0
    info.num_of_datasets = 0
    info.public = 1 
    info.dataset = {}
    info.project_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username,'project-'+project);
    var new_info_filename_path = path.join(info.project_dir, req.CONSTS.CONFIG_FILE)
    var analysis_dir = path.join(info.project_dir, 'analysis')
    if(file_type == 'fasta'){
        var new_file_name = 'original_fasta.fna'
    }else if(file_type == 'matrix'){
        var new_file_name = 'original_matrix.csv'
    }else{
        console.log('Unknown file_type: '+file_type)
        return
    }
    
    var new_file_path = path.join(info.project_dir, new_file_name)
    
       
    
   
    fs.mkdir(info.project_dir, function ensureProjectsDir(err) {
        if(err){return console.log(err);} // => null
        fs.chmodSync(info.project_dir, 0o775);
        var readStream = fs.createReadStream(original_file_path);
        var writeStream = fs.createWriteStream(new_file_path,{mode: 0o664});
        if(IsFileCompressed(req.files[0])){     
            var gunzip = zlib.createGunzip();
            //console.log('File is gzip compressed')
            rs = readStream.pipe(gunzip)   //.pipe(writeStream);
        }else{
            //console.log('Move file as is')
            rs = readStream     //.pipe(writeStream);
        }
                
        
        var chunks = [];
        var chunkstr = '';
        var ds_counts = {}
        rs.on('error', err => {
            // handle error
            console.log('error: '+err)
        });
        rs.on('data', chunk => {
            //console.log(chunk.toString())
            //chunks.push(chunk.toString());
            chunkstr += chunk.toString()
        });

        // File is done being read
        
        rs.on('close', () => {
            line_split_chunks = chunkstr.split('\n')
// MATRIX             
            if(file_type == 'matrix'){
                var split_on = '\t'
                for(n in line_split_chunks){
                    if(n==0){
                        datasets = line_split_chunks[n].trim().split(split_on)
                        //console.log('datasets')
                        //console.log(datasets)
                        unique = helpers.unique_array(datasets)
                        if(datasets.length == unique.length){
                            console.log('Dataset names are unique - good')
                        }else{
                            console.log('ERROR: Dataset Names ARE NOT unique')
                            return;
                        }
                    }else{
                        row_items = line_split_chunks[n].trim().split(split_on)
                        tax = row_items[0]
                        //console.log(tax)
                        tax_items = tax.split(';')
                        if(tax_items.length > 8){
                            console.log('ERROR: too many tax items -row:'+n.toString())
                            return
                        }                        
                    }
                
                }
                info.type = file_type
                info.num_of_datasets = datasets.length
                var pid = 'none'
                var load_cmd = path.join(req.CONFIG.PATH_TO_NODE_SCRIPTS,'vamps_script_matrix_loader.py')
                var load_params = ['-i',new_file_path,'-d',info.project_dir,'-host',req.CONFIG.hostname,'-p',info.project_name,'-u',req.user.username]
                console.log(load_cmd + ' ' + load_params.join(' '))
                var matrix_proc = spawn(load_cmd, load_params, {
                    env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
                    detached: true, stdio: 'pipe'
                });
                var output    = '';
                var last_line = ''
                matrix_proc.stderr.on('data', function (data) {
                  console.log('error '+data.toString()) 
                  last_line = data.toString()  
                });
                matrix_proc.stdout.on('data', function (data) { 
                  //console.log('stdout:')  
                  line = data.toString()
                  //console.log(line)   
                  output += line
              
                });
                matrix_proc.on('close', function (code) {
				    console.log('close: load_cmd proc exited with code ' + code);
				    
				    
				    if(code === 0){
				        lines = output.split('\n')
				        for(n in lines){
				            //console.log(lines[n]) 
				            if(lines[n].substring(0,8) == 'done pid'){
                                parts = lines[n].split(' ')
                                //console.log(parts)
                                pid = parts[2]
                            }
				        }
				        var create_json_files_cmd = path.join(req.CONFIG.PATH_TO_NODE_SCRIPTS,'/rebuild_vamps_files.py')
				        var create_json_files_params = ['-host', req.CONFIG.site, '--json_file_path', req.CONFIG.JSON_FILES_BASE,'-units','generic', '--pids', pid]
                        console.log(create_json_files_cmd + ' ' + create_json_files_params.join(' '))
                        var json_files_proc = spawn(create_json_files_cmd, create_json_files_params, {
                            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
                            detached: true, stdio: 'pipe'
                        });
                        json_files_proc.stderr.on('data', function (data) {
                          console.log(data.toString())   
                        });
                        json_files_proc.stdout.on('data', function (data) { 
                          //console.log('stdout:')  
                          line = data.toString()
                          //console.log(line)   
                          output += line
                        });
                        json_files_proc.on('close', function (code) {
				            console.log('close: json_files_proc proc exited with code ' + code);
				        })
				        fs.writeFile(new_info_filename_path, ini.stringify(info, { section: 'MAIN' }), {mode:0o664}, function writeConfigFile(err) {                                  
                        if(err){return console.log(err);} // => null
                            fs.chmodSync(new_info_filename_path, 0o664);
                            fs.chmodSync(new_file_path, 0o664);
                            req.flash('success', "Success - Project `"+info.project_name+"` loaded to `Your Projects`");

                            //error_fxn("Success - Project `"+info.project_name+"` loaded to `Your Projects`")
                            res.render('user_data/import_choices/matrix', {
                              title: 'VAMPS:Import Choices',
                              def_name:'',
                              user: req.user, hostname: req.CONFIG.hostname
                            });
                            return
                        }); 
                        
                    }else{
                        console.log('FAIL re-open import choices page')
                        req.flash('fail',' Fail: '+last_line)
                        res.redirect('/')
                        // res.render('user_data/import_choices', {
//                           title: 'VAMPS:Import Choices',
//                           project: '',
//                           user: req.user, hostname: req.CONFIG.hostname
//                         });
                        return
                    }
					
				})
            
// BIOM            
            }else if(file_type == 'biom'){
                console.log('Biom file detected')
// FASTA
            }else{  // not matrix or biom --> fasta??
            
            for(n in line_split_chunks){
                //console.log('Line: '+line_split_chunks[n])
                if(line_split_chunks[n][0] == '>'){
                    line_items = line_split_chunks[n].split(/\s+/)  // split on white space                     
                    first_item = line_items[0].substring(1,line_items[0].length)  // remove '>'
                    // now this is common M9Akey217.141086_98 last digits are 'count'
                    // need to be removed
                    first_item = first_item.split('_')[0]  // if trailing number: remove it
                    if(ds_counts.hasOwnProperty(first_item)){
                        ds_counts[first_item] += 1
                    }else{
                        ds_counts[first_item] = 1                        
                    }                                   
                }
            }
            
            for(ds in ds_counts){
                //console.log(ds+' - '+ds_counts[ds].toString())
                info.dataset[ds] = ds_counts[ds]
                if(ds_counts[ds] > info.max_dataset_count){
                     info.max_dataset_count = ds_counts[ds]
                }
            }
            var demultiplex_cmd = path.join(req.CONFIG.PATH_TO_NODE_SCRIPTS,'demultiplex.py')
            var fastaunique_cmd = path.join(req.CONFIG.PATH_TO_NODE_SCRIPTS,'fastaunique')
            var demultiplex_params = ['-i',new_file_path,'-d',info.project_dir,'-f',fastaunique_cmd]
            console.log(demultiplex_cmd + ' ' + demultiplex_params.join(' '))
            var proc = spawn(demultiplex_cmd, demultiplex_params, {
                    env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
                    detached: true, stdio: 'pipe'
            });
            var output = '';
			proc.stderr.on('data', function (data) {
			  console.log(data.toString())   
			});
			proc.stdout.on('data', function (data) { 
			  //console.log('stdout:')  
			  //console.log(data.toString())   
			  output += data.toString()
			  
			});
			proc.on('close', function (code) {
				console.log('close: demultiplex (+/-fastaunique) proc exited with code ' + code);
				//console.log("output: ");
				output = output.trim().split("\n");
				// see bottom of demultiplex.py script out put is pure JSON: 
				// print('{"UNIQUE_SEQ_COUNT":'+str(sum_unique_seq_count)+',"TOTAL_SEQ_COUNT":'+str(total_seq_count)+'}')
				for( n in output){
					try{
						counts = JSON.parse(output[n])
						//console.log(counts)
					}catch(e){
						//console.log('err: '+e.toString());
					}
					
				}
				console.log('UNIQUE_SEQ_COUNT:'+counts['UNIQUE_SEQ_COUNT'].toString())
				console.log('TOTAL_SEQ_COUNT:'+counts['TOTAL_SEQ_COUNT'].toString())
				
				if(helpers.isInt(counts['TOTAL_SEQ_COUNT']) && helpers.isInt(counts['UNIQUE_SEQ_COUNT'])){  // should unique count
					//info.unique_seq_count = output
					console.log('seq_counts SUCCESS: got counts from demultiplex.py')
					info.unique_seq_count = counts['UNIQUE_SEQ_COUNT']
					info.total_seq_count  = counts['TOTAL_SEQ_COUNT']
					info.num_of_datasets  = counts['SAMPLE_COUNT']
					
				}else{
					console.log('seq_count Error: Check demultiplex.py.')
					info.unique_seq_count = 0
					info.total_seq_count  = 0
				}
				
				//console.log(new_info_filename_path)
				fs.writeFile(new_info_filename_path, ini.stringify(info, { section: 'MAIN' }), {mode:0o664}, function writeConfigFile(err) {                                  
					if(err){return console.log(err);} // => null
					fs.chmodSync(new_info_filename_path, 0o664);
					fs.chmodSync(new_file_path, 0o664);
					req.flash('success', "Success - Project `"+info.project_name+"` loaded to `Your Projects`");

					//error_fxn("Success - Project `"+info.project_name+"` loaded to `Your Projects`")
					res.render('user_data/import_choices/fasta', {
					  title: 'VAMPS:Import Choices',
					  def_name:'',
					  user: req.user, hostname: req.CONFIG.hostname
					});
					return
				}); 
			});
            }
        }).pipe(writeStream)
        

    })
    
    
});
 

router.get('/upload_configuration', [helpers.isLoggedIn], function (req, res) {
  console.log('in upload_configuration')


  res.render('user_data/import_choices/config_file', {
            title:       'Configuration File',
            user:        req.user,
            hostname:    req.CONFIG.hostname,
            //pinfo:       JSON.stringify(user_project_info),
            //project: project,
            //import_type: import_type,
          });
});


router.post('/upload_file', [helpers.isLoggedIn, upload.any()], function(req, res) {
    // called from user_data.js as way to upload random files from /users/profile.html
    console.log('in POST test_upload')
    console.log(req.body)
    //console.log('file:',req.files)
    
    var timestamp = +new Date();  // millisecs since the epoch!
    var originalFilePath = req.files[0].path
    var originalFileName = req.files[0].originalname
    var new_file_name = req.body.username+'_'+timestamp+'_'+originalFileName
    var new_file_path = path.join(req.CONFIG.PATH_TO_USER_DATA_UPLOADS, new_file_name)
    console.log('new_file_path: '+new_file_path)
    fs.move(originalFilePath, new_file_path, function moveDataDir(err) {
            if (err) {
              console.log('err:'+err);
              res.send(err);
            } else {
              console.log('From: '+ originalFilePath);
              console.log('To: '+ new_file_path);
              res.send({'success':'hello'});
            }
    });
    
});
//
//
//

router.post('/import_choices/re_create_from_file', [helpers.isLoggedIn, upload.single('upload_files', 12)], function (req, res) {
    console.log('in re_create_image_from_file')
    console.log(req.body)
    
    var upld_obj = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
    console.log(upld_obj)
    var timestamp = +new Date();
    if(upld_obj.hasOwnProperty('image')){
      console.log('1FILE is IMAGE')
      image = upld_obj.image
      new_filename = 'image-'+image+'-'+timestamp+'.json'
    }else{
      console.log('2FILE is CONFIG')
      new_filename = 'configuration-'+timestamp+'.json'
    }
      
    new_filename_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, new_filename)
    console.log(new_filename_path)
    fs.move(req.file.path, new_filename_path, function(err){
      if (err) return console.error(err)
      //var args = "?filename="+new_filename
      //args += "&from_configuration_file=1"
      //res.redirect('/visuals/view_selection'+args)
      res.redirect('/visuals/view_selection/'+new_filename+'/1')
    })
});

//
// VALIDATE FORMAT
//
/* GET Validate page. */
router.get('/validate_format', helpers.isLoggedIn, function (req, res) {
  console.log('validate_format');
  console.log("JSON.stringify(req.url): ");
  console.log(JSON.stringify(req.url));
  var myurl = url.parse(req.url, true);
  console.log("myurl.query");
  console.log(myurl.query);
  var file_type    = myurl.query.file_type;
  res.render('user_data/validate_format', {
    title: 'VAMPS:Import Data',
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

    console.log("req.body");
    console.log(req.body);
    console.log("req.file");
    console.log(req.file);
    var file_type    = req.body.file_type;
    var file_style   = req.body.file_style;
    
    var file_path = path.join(process.env.PWD, req.file.path);
    console.log('file_path '+ file_path);

    var options = { scriptPath : req.CONFIG.PATH_TO_NODE_SCRIPTS,
                  args : [ '-i', file_path, '-ft', file_type, '-s', file_style, '-process_dir', process.env.PWD, ]
              };

    console.log(options.scriptPath + '/vamps_script_validate.py '+options.args.join(' '));

    var log = fs.openSync(path.join(process.env.PWD, 'logs', 'validate.log'), 'a');
    var validate_process = spawn( options.scriptPath + '/vamps_script_validate.py', options.args, {
                        env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
                        detached: true, stdio: 'pipe'
                    });  // stdin, stdout, stderr
    var output = '';
    validate_process.stdout.on('data', function validateScriptStdout(data) {
      //console.log('stdout: ' + data);
      data = data.toString().replace(/^\s+|\s+$/g, '');
      output += data;


    });
    validate_process.on('close', function validateScriptOnClose(code) {
        console.log('validate_process exited with code ' + code);
       

        var ary = output.substring(2, output.length-2).split("', '");
        var result = ary.shift();
       
        //var last_line = ary[ary.length - 1];
        if (code === 0) {
          

          if (result == 'OK') {
            req.flash('success', 'Validates');
          } else {
            req.flash('fail', 'Failed Validation');
          }
          res.render('user_data/validate_format', {
               title: 'VAMPS:Import Data',
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
          req.flash('fail', 'Failed Validation');
          res.render('user_data/validate_format', {
              title: 'VAMPS:Import Data',
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
  console.log("req.params.id 1: ");
  console.log(req.params.id);
  var project = req.params.id;
  var config_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project, req.CONSTS.CONFIG_FILE);

  var cfg_data = ini.parse(fs.readFileSync(config_file, 'utf-8'));
  
  res.render('user_data/profile', {
      project : project,
      pinfo   : JSON.stringify(cfg_data),
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
  console.log("req.params.id 2: ");
  console.log(req.params.id);
  var project = req.params.id;
  var config_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project, req.CONSTS.CONFIG_FILE);

  stats = fs.statSync(config_file);
  if (stats.isFile()) {
     console.log('config found');
     var cfg_data = ini.parse(fs.readFileSync(config_file, 'utf-8'));
  } else {
    //console.log('config NOT found')
     cfg_data = {'config file NOT AVAILABLE':1};
  }
  var metadata_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project, 'metadata_clean.csv');

  var parser = parse({delimiter: '\t'}, function createParserPipe(err, data) {
      json_data = {};


      res.render('user_data/metadata', {
        project : project,
        pinfo   : JSON.stringify(cfg_data),
        mdata   : data,
        title   : project,
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
      pinfo   : JSON.stringify(cfg_data),
      mdata   : [],
      title   : project,
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
        var config_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project, req.CONSTS.CONFIG_FILE);
        var metadata_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project, 'metadata_clean.csv');

        stats = fs.statSync(config_file);
        if (stats.isFile()) {
           console.log('config found');
           var cfg_data = ini.parse(fs.readFileSync(config_file, 'utf-8'));
        } else {
            console.log('config NOT found');
            cfg_data = {'config file NOT AVAILABLE':1};
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

  if (project in PROJECT_INFORMATION_BY_PNAME) {
    var pid = PROJECT_INFORMATION_BY_PNAME[project].pid;
    helpers.update_global_variables(pid, 'del');
  } else {
    // project not in db?
    console.log('project was not found in PROJECT_INFORMATION_BY_PNAME');
    var pid = 0;
  }

    
    var options = {
        scriptPath : req.CONFIG.PATH_TO_NODE_SCRIPTS,
        args :       [ '-pid', pid, '-site', req.CONFIG.site, '--user', req.user.username, '--project', project, '-pdir', process.env.PWD ],
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
      req.flash('fail', 'ERROR nothing deleted');
      res.redirect("/user_data/your_projects");
      return;
    }
    

    var log = fs.openSync(path.join(process.env.PWD, 'logs', 'delete.log'), 'a');


      // called imediately
      var msg = "";
      if (delete_kind == 'all') {
        msg = "Deletion in progress: '"+project+"'";
      } else if (delete_kind == 'tax') {
        msg = "Deletion in progress: taxonomy from '"+project+"'";
      } else if (delete_kind == 'meta') {
        msg = "Deletion in progress: metadata from '"+project+"'";
      } else {
        req.flash('fail', 'ERROR nothing deleted');
        res.redirect("/user_data/your_projects");
        return;
      }
      if (delete_kind == 'all') {
          // MOVE file dir to DELETED path (so it won't show in 'your_projects' list)
          var data_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project);
          var deleted_data_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'DELETED_project'+timestamp+'-'+project);
			
		  fs.remove(data_dir, function(err){
			if(err){ 
				console.log(err); 
				data_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'DELETED_'+project);
				fs.rmdir(data_dir, function(err2){
					console.log(err2); 
				})
			}
			console.log('Successfully removed')
			req.flash('success', msg);
            res.redirect("/user_data/your_projects");
		  })
		  //helpers.deleteFolderRecursive(data_dir)
		  
         

      } else {
        req.flash('success', msg);
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
              req.flash('fail', "Error: Could not duplicate: '"+project+"' to '"+project+"_dupe'. Does it already exist?");
            res.redirect("/user_data/your_projects");
            return;
          }
    }catch(err) {
      console.log('dir doesnt exist -good- continuing on');
    }

    fs.copy(data_dir, new_data_dir, function copyDataDir(err) {
      if (err) {
        console.log("err 2: ");
        console.log(err);
      } else {
        // need to change config file of new project to include new name:
        console.log('duplicate copy success!');
        var config_file = path.join(new_data_dir, req.CONSTS.CONFIG_FILE);
        var project_info = {};
        project_info.config = iniparser.parseSync(config_file);
        var config_info = project_info.config.GENERAL;
        config_info.project = project+'_dupe';
        config_info.baseoutputdir = new_data_dir;
        config_info.configPath = path.join(new_data_dir, req.CONSTS.CONFIG_FILE);
        config_info.fasta_file = path.join(new_data_dir, infile_fa);
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


    var config_file = path.join(data_dir, req.CONSTS.CONFIG_FILE);

    res.render('user_data/assign_taxonomy', {
      project : project,
      title   : project,
      tax_choices : JSON.stringify(req.CONSTS.UNIT_ASSIGNMENT_CHOICES),
      user: req.user, hostname: req.CONFIG.hostname
     });

});

//
// START_ASSIGNMENT
//

// TODO: split!!!
// !!! NOW FROM HERE !!!
//router.get('/start_assignment/:project/:classifier/:ref_db', helpers.isLoggedIn, function (req, res) {
router.get('/start_assignment/:project/:classifier/:ref_db', helpers.isLoggedIn, function (req, res) {
  var cmd_list = [];
  console.log('in start_assignment--->');
  console.log("req.params: ");
  console.log(req.params);
  console.log('<--- in start_assignment');
  var project = req.params.project;
  var classifier = req.params.classifier;  // GAST, RDP  or SPINGO
  var ref_db = req.params.ref_db
  // /GAST/SILVA108_FULL_LENGTH">Assign Taxonomy - GAST (Silva108)</a></li>
  // /GAST/GG_MAY2013">Assign Taxonomy - GAST (GreenGenes May2013)</a></li>
  // /RDP/2.10.1">Assign Taxonomy - RDP (2.10.1)</a></li>
  // /RDP/GG_MAY2013">Assign Taxonomy - RDP (GreenGenes May2013)</a></li>
  // /RDP/ITS1"

  //var classifier = req.CONSTS.UNIT_ASSIGNMENT_CHOICES[classifier_id].method;
  //var ref_db_dir = req.params.ref_db;
  //var ref_db_dir = req.CONSTS.UNIT_ASSIGNMENT_CHOICES[classifier_id].refdb;
  console.log('start: Project: ' + project + ' - Classifier: ' + classifier + ' - RefDatabase: ' + ref_db);
  status_params = {'type': 'update', 'user_id': req.user.user_id, 'project': project, 'status': '', 'msg': '' };
  var data_dir  = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-' + project);
  //TODO: check if needed:
  var qsub_script_path = req.CONFIG.PATH_TO_NODE_SCRIPTS;

  var config_file = path.join(data_dir, req.CONSTS.CONFIG_FILE);
  try
  {
    //var stat_config = fs.statSync(config_file);
    // console.log('1 ', config_file)
    project_config = iniparser.parseSync(config_file);
    //console.log('project_config', project_config);
    //console.log('project_config2', project_config.MAIN.fasta_type);
    // TODO: project_config is wrong (not updated) in
      // project_title: '',
      // project_description: '',
      // sequence_counts: 'NOT_UNIQUED'
    // ===
  }
  catch (err)
  {
    console.log('no read config file ', err);
  }

  var options = {
    scriptPath : qsub_script_path,
    gast_run_args : [ '-c', config_file, '-process_dir', process.env.PWD,
    '-project_dir', data_dir, '-db', NODE_DATABASE, '-ref_db_dir', ref_db, '-site', req.CONFIG.site ],
    rdp_run_args :  [ '-c', config_file, '-process_dir', process.env.PWD, '-site', req.CONFIG.site,
    '-project_dir', data_dir, '-ref_db', ref_db, '-path_to_classifier', req.CONFIG.PATH_TO_CLASSIFIER ],
    database_loader_args : [ '-class', classifier, '-host', req.CONFIG.dbhost, '-process_dir', process.env.PWD, '-project_dir', data_dir, '-db', NODE_DATABASE, '-ref_db_dir', ref_db],
    upload_metadata_args : [ '-project_dir', data_dir, '-host', req.CONFIG.dbhost, '-db', NODE_DATABASE ],
    create_json_args : [ '-process_dir', process.env.PWD, '-host', req.CONFIG.dbhost, '-project_dir', data_dir, '-db', NODE_DATABASE ]
 };

  if (classifier == 'SPINGO')
  {
    // calls helpers.make_gast_script_txt
    var script_name = 'spingo_script.sh';
    var cmd_list = spingoTax(req, project_config, options, ref_db);
    console.log(cmd_list)
    status_params.statusOK = 'OK-SPINGO';
    status_params.statusSUCCESS = 'SPINGO-SUCCESS';
    status_params.msgOK = 'Finished SPINGO';
    status_params.msgSUCCESS = 'SPINGO -Tax assignments';
    
  }
  else if (classifier == 'GAST')
  {
    // calls helpers.make_gast_script_txt
    cmd_list = gastTax(req, project_config, options, ref_db);
  }
  else if (classifier == 'RDP' )
  {
    // TODO: move to a separate function!
    // These are from the RDP README
    var gene = '16srrna'; // default
    if (ref_db == '2.12-ITS')
    {
      gene = 'fungalits_unite';
    }
    var path2classifier = path.join(req.CONFIG.PATH_TO_CLASSIFIER,'classifier.jar')  // + '_' + ref_db;
    rdp_cmd1 = options.scriptPath + '/vamps_script_rdp_run.py -project_dir ' + data_dir + ' -p ' + project + ' -site ' + req.CONFIG.site + ' -path_to_classifier ' + path2classifier + ' -gene ' + gene +  ' --config '+ req.CONSTS.CONFIG_FILE
    rdp_cmd2 = options.scriptPath + '/vamps_script_rdp_database_loader.py -project_dir ' + data_dir + ' -p ' + project + ' -site ' + req.CONFIG.site + ' --classifier RDP' + ' --config '+ req.CONSTS.CONFIG_FILE
    rdp_cmd3 = options.scriptPath + '/vamps_script_upload_metadata.py -project_dir ' + data_dir + ' -p ' + project + ' -site ' + req.CONFIG.site + ' --config '+ req.CONSTS.CONFIG_FILE
    rdp_cmd4 = options.scriptPath + '/vamps_script_create_json_dataset_files.py -project_dir ' + data_dir + ' -p ' + project + ' -site ' + req.CONFIG.site + ' -units rdp2.6 --jsonfile_dir ' + req.CONFIG.JSON_FILES_BASE + ' --config '+ req.CONSTS.CONFIG_FILE

    script_name = 'rdp_script.sh';
    status_params.statusOK = 'OK-RDP';
    status_params.statusSUCCESS = 'RDP-SUCCESS';
    status_params.msgOK = 'Finished RDP';
    status_params.msgSUCCESS = 'RDP -Tax assignments';
    cmd_list = [ rdp_cmd1, rdp_cmd2, rdp_cmd3, rdp_cmd4 ];
  }

  //TODO: separate below as write and run, see also uploadData - DRY
  // var script_text = "";

  var script_vars = GetScriptVars(req, data_dir, cmd_list, classifier);
  var scriptlog   = script_vars[0];
  var script_text = script_vars[1];
  // TODO: test, should be:
  // scriptlog: /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project/script.log
  // script_text: #!/bin/sh
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
  // --- end test
  var script_path     = path.join(data_dir, script_name);
  var nodelog         = fs.openSync(path.join(data_dir, 'assignment.log'), 'a', 0664);
  var ok_code_options = [classifier, status_params, res, ref_db];

  // console.log('XXX0 writeFile from start_assignment after gasttax, ok_code_options  ');
  
  var mode = 0775;
  var oldmask = process.umask(0);
  console.log("script_path2 = " + script_path);
  fs.writeFile(script_path, 
    script_text, 
    {
      mode: mode
    }, 
    function(err) {
      if(err) {
          return console.log(err);
      }
      else
      {
        RunAndCheck(script_path, nodelog, req, project, res, checkPid, ok_code_options);
        status_params.status = status_params.statusSUCCESS;
        status_params.msg = status_params.msgSUCCESS;
        helpers.update_status(status_params);
        req.flash('success', classifier + " has been started for project: '" + project + "'");
        res.redirect("/user_data/your_projects");
        process.umask(oldmask);
        console.log("1-The file was saved!");
      }
  }); 
});

// Functions for tax_assignment

function checkPid(check_pid_options, last_line)
{

  classifier    = check_pid_options[0];
  // last_line     = check_pid_options[1];
  status_params = check_pid_options[1];
  res           = check_pid_options[2];
  ref_db    = check_pid_options[3];
  console.log(' classifier CLCLCL: ' + classifier);
  console.log(' last_line CLCLCL: ' + last_line);
  console.log(' classifier CLCLCL: ');
  console.log("status_params from checkPid: ");
  console.log(util.inspect(status_params, false, null));

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

        connection.query(queries.get_select_seq_count_queryPID(pid), function (err, rows2, fields) {
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
          ALL_CLASSIFIERS_BY_PID[pid] = classifier + '_' + ref_db;
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
function spingoTax(req, project_config, options, ref_db)
{
  console.log('in routes_user_data::spingoTax')
  var cmd_list = []
  var project  = project_config.GENERAL.project;
  var data_dir = project_config.GENERAL.baseoutputdir;
  var ref_db_path = req.CONFIG.PATH_TO_SPINGO+'/database/'+ref_db+'.species.fa'
  
  for(ds in project_config.DATASETS){
    var inFasta = project_config.GENERAL.baseoutputdir+'/'+ds+'.fa'
    var out_file = project_config.GENERAL.baseoutputdir+'/'+ds+'.spingo.out'
    cmd = req.CONFIG.PATH_TO_SPINGO+'/spingo -i '+  inFasta +' -d '+ref_db_path +' > '+out_file
    cmd_list.push(cmd)
  }
  return cmd_list
  
}
function gastTax(req, project_config, options, ref_db)
{
  console.log('in routes_user_data::gastTax')
  var project  = project_config.MAIN.project_name;
  var data_dir = project_config.MAIN.project_dir;
  script_name = 'gast_script.sh';

  // var oldmask = process.umask(0);
  // fs.closeSync(fs.openSync(`${data_dir}/clust_gast_ill_${project}.sh`, 'w', 0777));
  // process.umask(oldmask);
  full_option = '';
  file_suffix      = ".fa" //+ getSuffix(project_config.MAIN.dna_region);
  ref_db_name      = chooseRefFile(req.params.classifier);  //req.body.classifier
  full_option      = getFullOption(req.params.classifier);
  gast_db_path     = config.GAST_DB_PATH;
  gast_script_path = config.GAST_SCRIPT_PATH;
  
  console.log('gast_db_path: ' + gast_db_path); 
  console.log('gast_script_path: ' + gast_script_path); 

  // var ookeys = Object.keys(project_info[project].validation);
  // console.log('OOO ookeys: '); 
  // console.log(util.inspect(ookeys, false, null));

  // var uc_file_name_base = `${data_dir}/${ookeys[1]}`;
  // console.log('OOO1 uc_file_name_base: ' + uc_file_name_base); 
  // var oldmask = process.umask(0);
  // fs.closeSync(fs.openSync(uc_file_name_base + ".uc", 'w', 0666));
  // console.log("file is open: " + uc_file_name_base + ".uc");
  // fs.closeSync(fs.openSync(uc_file_name_base + ".gast", 'w', 0666));
  // console.log("file is open: " + uc_file_name_base + ".gast");
  // fs.closeSync(fs.openSync(uc_file_name_base + ".unique", 'w', 0666));
  // console.log("file is open: " + uc_file_name_base + ".unique");
  // 
  // var gast_log_file = path.join(data_dir, "gast.log");
  // fs.closeSync(fs.openSync(gast_log_file, 'w', 0666));
  // console.log("file is open: " + gast_log_file);
  // 
  // var names_file = path.join(data_dir, "test_gast_dataset.fa.names");
  // fs.closeSync(fs.openSync(names_file, 'w', 0666));
  // console.log("file is open: " + names_file);
  // 
  // 
  // process.umask(oldmask);


// /groups/vampsweb/vampsdev_node_data/user_data/AnnaSh/project-test_gast_project/test_gast_dataset.fa.unique.uc

//from inside of gast_script.sh 
  // create filenames.list and get numbers
  // create clust_gast_ill_PROJECT_NAME.sh
  // run it
  make_gast_script_txt = helpers.make_gast_script_txt(req, data_dir, project);
  scriptlog   = path.join(data_dir, 'cluster.log');
  
  //make_gast_script_txt = helpers.get_qsub_script_text_only(scriptlog, data_dir, req.CONFIG.site, 'gastTax', cmd_list)
  //is_local = helpers.isLocal(req);
  // for tests: is_local = false;
  var database_loader = req.CONFIG.PATH_TO_NODE_SCRIPTS+'/vamps_script_database_loader.py'
  database_loader += " -site " + req.CONFIG.site
  database_loader += " -class GAST" 
  database_loader += " -project_dir "+data_dir
  //database_loader += " -ref_db_dir "+ref_db_name
  metadata_file_exists = true  // testing
  if(metadata_file_exists){
  	metadata_loader   = req.CONFIG.PATH_TO_NODE_SCRIPTS+'/vamps_script_upload_metadata.py'
  }
  create_json_files = req.CONFIG.PATH_TO_NODE_SCRIPTS+'/vamps_script_create_json_dataset_files.py'


  status_params.statusOK      = 'OK-GAST';
  status_params.statusSUCCESS = 'GAST-SUCCESS';
  status_params.msgOK         = 'Finished GAST';
  status_params.msgSUCCESS    = 'GAST -Tax assignments';

  // TODO:
  // test db
  // user_project_status_id  user_id  project_id  status  message  created_at  updated_at
  // 34  4  4  GAST-SUCCESS  GAST -Tax assignments  2016-09-02 12:26:21  2016-09-02 12:31:12
  cmd_list = [
      make_gast_script_txt, database_loader, metadata_loader, create_json_files
  ];
  
  console.log('GGG2: gastTax: cmd_list ');
  console.log(util.inspect(cmd_list, false, null));
  return cmd_list;
}




function getSuffix(dna_region)
{
  if (CONSTS.REF_SUFFIX["unique.nonchimeric.fa"].indexOf(project_config.GENERAL.dna_region) >= 0) 
  {
    console.log('dna_region in CONSTS.REF_SUFFIX["unique.nonchimeric.fa"]');  
    return ".unique.nonchimeric.fa";  
  }
  else if (CONSTS.REF_SUFFIX.unique.indexOf(project_config.GENERAL.dna_region) >= 0) 
  {
    console.log('dna_region in CONSTS.REF_SUFFIX.unique'); 
    return ".unique";  
  }
  else 
  {
    console.log('ERR dna_region from getSuffix'); 
  }
}

function chooseRefFile(classifier_id)
{
  return CONSTS.UNIT_ASSIGNMENT_CHOICES[classifier_id].refdb; 
}

function getFullOption(classifier_id)
{
  if (CONSTS.REF_FULL_OPTION.indexOf(classifier_id) >= 0)
  {
    return "-full";
  }
  else
  {
    return "";
  }
}

function getFastaExtensions(data_dir)
{
  var files = fs.readdirSync(data_dir);
  for(var i in files) {
    if(path.extname(files[i]) === ".fa") {
     return ".fa";
    }
    else if(path.extname(files[i]) === ".fna") {
     return ".fna";
    }
  }
}


function metadata_upload(req, options, data_dir, project)
{
  // TODO: separate metadata upload from gast!
  // metadata must go in after the projects and datasets:
  // Should go into db after we have project and datasets in the db
  // Should go in as entire project (w all datasets) -- not dataset by dataset
  // PROBLEM: Here we dont have datasets yet in db
  // Andy, Where is metadata_loader.py??? ASh
  return options.scriptPath + '/metadata_loader.py -site ' + req.CONFIG.site + 
    ' -indir ' + data_dir + 
    ' -p '     + project;
}

//
// YOUR PROJECTS
//
router.get('/your_projects', helpers.isLoggedIn, function (req, res) {
    if(req.CONFIG.hostname.substring(0,7) == 'bpcweb8'){
      req.flash('fail','Not coded yet')
      res.render('user_data/your_data', {
        title: 'VAMPS:Data Administration',
        user: req.user, hostname: req.CONFIG.hostname,
      });
      return;
    }
    var user_projects_base_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
   // AAV must find and list projects that 
   //   1) have no directory (DB only)
   //   2) have no presence in PROJECT_INFORMATION_BY_PID
   //   3) have no datasets (also not in PROJECT_INFORMATION_BY_PID
   //   4) directory only (not in DB) -- orphan directory
   //   For this page 'your_projects' we'll look in PROJECT_INFORMATION_BY_PID
   //  and the directory list 
  //console.log(PROJECT_INFORMATION_BY_PID)
  project_info = {};
  pnames = [];
  
  
  
  // get user projects in database
  for(pid in PROJECT_INFORMATION_BY_PID){
    if(PROJECT_INFORMATION_BY_PID[pid].oid == req.user.user_id){
        // this data trumps directory_data.config
        p = PROJECT_INFORMATION_BY_PID[pid].project
        project_info[p] = {}; 
        project_info[p].pid = pid; 
        project_info[p].validation = {};
        project_info[p].public = PROJECT_INFORMATION_BY_PID[pid].public;
        
        project_info[p].classified_by = ALL_CLASSIFIERS_BY_PID[PROJECT_INFORMATION_BY_PNAME[p].pid];
        
        project_info[p].env_source_id = PROJECT_INFORMATION_BY_PID[pid].env_source_id;
        project_info[p].in_global_obj = true
        //project_info[p].empty_dir = 'unknown'
        project_info[p].vamps_status = 'ON_VAMPS'
        project_info[p].num_of_datasets = DATASET_IDS_BY_PID[pid].length 
        if(DATASET_IDS_BY_PID[pid].length == 0){
            project_info[p].taxonomy = 'No Datasets (NOT on VAMPS)'
            project_info[p].seq_count = 0
        }else{
            project_info[p].taxonomy = 'Taxonomic Data Available (project on VAMPS)'
            project_info[p].seq_count = ALL_PCOUNTS_BY_PID[pid]
        }
        pnames.push(p);
    }
  }
  
  // get user projects in file system
    fs.readdir(user_projects_base_dir, function readProjectsDir(err, items) {
    if (err) {

      fs.ensureDir(user_projects_base_dir, function ensureProjectsDir(err) {
        console.log("err 3: ");
        console.log(err); // => null
        // dir has now been created, including the directory it is to be placed in
      });


    } else {
        for (var d in items) {
            var pts = items[d].split('-');  // ALL items in this dir should have this '-' to separate on
            if (pts[0] === 'project' || pts[0].substring(0,7) === 'DELETED') {

              var project_name = items[d].substring(8,items[d].length);
              //console.log()
              //console.log('dir',items[d])
              if( ! project_info.hasOwnProperty(project_name)){
                // these projects are either empty (NoDataYet) or orphans (dir w/o DB presence)
                console.log('project in file but not in DB', project_name)
                project_info[project_name] = {};
                project_info[project_name].pid = '0';
                project_info[project_name].validation = {};
                project_info[project_name].vamps_status = 'NOT_ON_VAMPS';
                project_info[project_name].classified_by = 'none'
                project_info[project_name].in_global_obj = false
                project_info[project_name].ptype = ''
                pnames.push(project_name);
              }
          
          var stat_dir = fs.statSync(path.join(user_projects_base_dir, items[d]));

          if (stat_dir.isDirectory()) {
            // stat.mtime.getTime() is for sorting to list in oreder

            // need to read config file
            // check status?? dir strcture: analisis/gast/<ds>
            var config_file = path.join(user_projects_base_dir, items[d], req.CONSTS.CONFIG_FILE);
            //console.log(config_file)
            var cfg_data = {}
            try {  // to read config file
              
              //console.log('2 ', config_file)
              cfg_data = ini.parse(fs.readFileSync(config_file, 'utf-8'))
            }
            catch (err) {
                console.log(' **NO CONFIG: '+project_name)
            }
           //console.log(cfg_data)
              if( cfg_data.hasOwnProperty('MAIN')){              
                //console.log(' found MAIN ')
                if(cfg_data.MAIN.hasOwnProperty('dataset')){
                    //console.log(' found MAIN.datasets ')
                    var list_of_datasets = Object.keys(cfg_data.MAIN.dataset);
                    project_info[project_name].DATASETS = cfg_data.MAIN.dataset;
                }
                //console.log(' items ')
                //console.log(items[d])
                project_info[project_name].num_of_datasets = cfg_data.MAIN.num_of_datasets
                project_info[project_name].directory = items[d];              
                if( cfg_data.MAIN.hasOwnProperty('type')){
                    //console.log(' found MAIN.type ')
                    project_info[project_name].ptype = cfg_data.MAIN.type;
                }
              }else{
                 console.log('Lost Project: '+project_name+' NO CONFIG: '+project_name)
              }
              
            
          }

        }
      }

      pnames.sort();
      //console.log("JSON.stringify(project_info)");
      //console.log(JSON.stringify(project_info,null,2));

    }  // readdir/err

      res.render('user_data/your_projects',
          { title: 'User Projects',
            pinfo: JSON.stringify(project_info),
            pnames: pnames,
            //env_sources :   JSON.stringify(MD_ENV_PACKAGE),
            user: req.user, hostname: req.CONFIG.hostname
        });

    });  // readdir

});
//
//   GET -- EDIT_PROJECT: When first enter the page.
//
router.get('/edit_project/:project', helpers.isLoggedIn, function (req, res) {
  console.log('in edit project:GET');
  //console.log(PROJECT_INFORMATION_BY_PID)
  var project_name = req.params.project;
  var user_projects_base_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);


  var config_file = path.join(user_projects_base_dir, 'project-'+project_name, req.CONSTS.CONFIG_FILE);

  var project_info = {};
    //var stat_config = fs.statSync(config_file);
   project_info.config = iniparser.parseSync(config_file);

  if (project_name in PROJECT_INFORMATION_BY_PNAME) {   // these projects have tax assignments
    //console.log("PROJECT_INFORMATION_BY_PNAME[project_name]: ");
    //console.log(PROJECT_INFORMATION_BY_PNAME[project_name]);
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
        user: req.user, hostname: req.CONFIG.hostname,
    });
});

//
//   POST -- EDIT_PROJECT:  for accepting changes and re-showing the page
//

router.post('/edit_project', helpers.isLoggedIn, function (req, res) {
  console.log('in edit project POST, req.body:');
  console.log(req.body);


  if (req.body.new_project_name && req.body.new_project_name != req.body.old_project_name) {
    if (req.body.new_project_name in PROJECT_INFORMATION_BY_PNAME) {
      console.log('ERROR');
      req.flash('fail', 'That project name is taken -- choose another.');
      res.redirect('/user_data/edit_project/'+req.body.old_project_name);
      return;
    }
  }


  // UPDATE DB ONLY if TAX ASSIGNMENTS PRESENT
  // TODO: move to queries and add escapes!
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
    
    connection.query(p_sql, function mysqlUpdateProject(err, rows, fields) {
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

    //2- PROJECT_INFORMATION_BY_PID
    //console.log('PROJECT_INFORMATION_BY_PID')
    //console.log(req.body.project_pid);

    PROJECT_INFORMATION_BY_PID[req.body.project_pid].project        = req.body.new_project_name;
    //PROJECT_INFORMATION_BY_PID[req.body.project_pid].env_package_id  = '';
    PROJECT_INFORMATION_BY_PID[req.body.project_pid].title          = req.body.new_project_title;
    PROJECT_INFORMATION_BY_PID[req.body.project_pid].description    = req.body.new_project_description;
    if (req.body.new_privacy == 'False') {
      PROJECT_INFORMATION_BY_PID[req.body.project_pid].public = 0;
    } else {
      PROJECT_INFORMATION_BY_PID[req.body.project_pid].public = 1;
    }

    //TODO: proper escape and move to queries 
    //also not the place to add or delete datasets
    for (var d in req.body.new_dataset_names) {
      if(d != ''){
          var d_sql = "UPDATE dataset set dataset='"+req.body.new_dataset_names[d]+"', \n";
          //d_sql += " env_sample_source_id='"+req.body.new_env_source_id+"', \n";
          d_sql += " dataset_description='"+helpers.mysql_real_escape_string(req.body.new_dataset_descriptions[d])+"'\n";
          d_sql += " WHERE dataset_id='"+req.body.dataset_ids[d]+"' ";
          d_sql += " AND project_id='"+req.body.project_pid+"' ";
          // TODO: Don't make functions within a loop.
          connection.query(d_sql, function mysqlUpdateDataset(err, rows, fields) {
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
  var config_file = path.join(project_dir, req.CONSTS.CONFIG_FILE);
  var timestamp = +new Date();  // millisecs since the epoch!
  var config_file_bu = path.join(project_dir, 'config'+timestamp+'.ini');
  fs.copy(config_file, config_file_bu, function copyConfigFile(err) {
        if (err) {
          console.log("err 4: ");
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
    new_config_file = path.join(new_base_dir, req.CONSTS.CONFIG_FILE);
    new_fasta_file = path.join(new_base_dir, infile_fa);
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
  
  project_info.config.DATASETS={};
  config_info.datasets = [];
  for (var n in req.body.dataset_ids) {
    new_dataset_name = req.body.new_dataset_names[n].replace(/[\s+, ;:]/g, '_');
    config_info.datasets.push({"oldname":old_dataset_array[n], "dsname":new_dataset_name, "did":req.body.dataset_ids[n], "count":counts_array[n]});
  }

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
  console.log("req.file: ");
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
          var upload_metadata_process = spawn( options.scriptPath+'/metadata_utils.py', options.args, {
                                        env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
                                        detached: true, stdio: 'pipe'
                                    });  // stdin, stdout, stderr
          var output = '';
          console.log('py process pid='+upload_metadata_process.pid);
          upload_metadata_process.stdout.on('data', function uploadMetadataScriptStdout(data) {
            //console.log('stdout: ' + data);
            data = data.toString().replace(/^\s+|\s+$/g, '');
            output += data;

            // var lines = data.split('\n')
            // for(var n in lines){
            //  //console.log('line: ' + lines[n]);
              // if(lines[n].substring(0,4) == 'PID='){
              //  console.log('pid line ' + lines[n]);
              // }
            // }
          });
          upload_metadata_process.on('close', function uploadMetadataScriptOnClose(code) {
           console.log('upload_metadata_process exited with code ' + code);
           var ary = output.split("\n");
           var last_line = ary[ary.length - 1];
           if(code === 0){
                console.log('Upload METADATA Success');
                //console.log('PID last line: '+last_line)
                //var ll = last_line.split('=');
                // possible multiple pids
                if(has_tax){
                  console.log("PROJECT_INFORMATION_BY_PNAME[project]: ");
                  console.log(PROJECT_INFORMATION_BY_PNAME[project]);
                  pid = PROJECT_INFORMATION_BY_PNAME[project].pid;
                  connection.query(queries.get_select_datasets_queryPID(pid), function mysqlGetDatasetsByPID(err, rows1, fields){
                    if (err)  {
                      console.log('1-Upload METADATA-Query error: ' + err);                   
                    } else {
                          connection.query(queries.get_select_seq_count_queryPID(pid), function mysqlGetSeqsByPID(err, rows2, fields){
                            if (err)  {
                              console.log('2-Upload METADATA-Query error: ' + err);                   
                            } else {

                                                    
                              //helpers.metadata_upload_from_file();  // need to update to hdf5 file??

                              req.flash('success', 'Metadata Upload in Progress');
                              res.redirect("/user_data/import_choices");
                            }

                          });
                    } // end else

                  });
                }else{  // end if(has_tax)
                  req.flash('success', 'Metadata Upload in Progress');
                  res.redirect("/user_data/import_choices");
                }

           }else{
              // ERROR
              console.log('ERROR last line: '+last_line);

              // NO REDIRECT here
              req.flash('fail', 'Script Error: '+last_line);
              res.redirect("/user_data/import_choices");
           }
        });  // end upload_metadata_process ON Close

//  });

});

//
//  UPLOAD DATA
//
// AShipunova Aug 2016
// TODO: Andy, how to make it fail? For testing?

function ProjectNameExists(project, req, res)
{
  console.log('BBB: ProjectNameExists: PROJECT_INFORMATION_BY_PNAME ');
  console.log(util.inspect(PROJECT_INFORMATION_BY_PNAME, false, null));
  //
  // console.log('BBB: ProjectNameExists: project: ' + project);

  if (project in PROJECT_INFORMATION_BY_PNAME) {
      req.flash('fail', 'That project name is already taken.');
      res.redirect(path.join("/user_data", req.url));
      console.log('This project name is already taken');
      return true;
  }
  else
  {
    console.log('Project name does not exist');
    return false;
  }
}

function FastaProvided(req, res)
{
  if (req.files[0].filename === undefined || req.files[0].size === 0) {
    req.flash('fail', 'A fasta file is required. Check if it exists.');
    res.redirect(path.join("/user_data", req.url));
    return false;
  }
  else
  {
    return true;
  }
}

// ??? TODO: check?
function ResFilePathExists(req, data_repository, res)
{
  if (helpers.fileExists(data_repository)) {
      return true;
    }
    else
    {
      req.flash('fail', 'There is no such file: ' + data_repository);
      console.log("AAA data_repository: " + data_repository);
      res.redirect(path.join("/user_data", req.url));
      return false;
    }
}

function MetadataFileProvided(req, res)
{
  if (req.files[1].filename === undefined || req.files[1].size === 0) {
    // console.log("DDD2 in MetadataFileProvided, filename === undefined");
    req.flash('fail', 'A metadata csv file is required. Check if it exists.');
    res.redirect(path.join("/user_data", req.url));
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
  var project_id;
  var redirect_url = path.join('/user_data', req.url);
  console.log('PROJ',project)
  helpers.fetchInfo("SELECT project_id FROM project WHERE project = ?", [project], function(err, content) {
      if (err) {
          console.log("err 5: ");
          console.log(err);
          req.flash('fail', '1-There is no such project, please create one.');
          res.redirect(redirect_url);
          return false;
      } else {
        try 
        {
          project_id = content.project_id;
          console.log("project_id: ");
          console.log(project_id);
          return true;  
        }
        catch(err) {
          req.form.errors.pr_not_exists = 'No such project: ' + project;
          console.log('Redirect err from ProjectExistsInDB. No such project: ' + project + ". " + err + '; Please add a new project at /user_data/add_project');
          req.flash('fail', '2-There is no such project, please create ' + project);
          try        { res.redirect(redirect_url); }
          catch(err) { console.log('Redirect err from ProjectExistsInDB to ' + redirect_url + ". " + err); }
          return false;
        }
      }
  });
}

function ProjectValidation(req, project, data_repository, res)
{

  // TODO: check if added but not in PROJECT_INFORMATION_BY_PNAME? or update PROJECT_INFORMATION_BY_PNAME after add_project?
  // see
  // routes/helpers/helpers.js:251:    console.log('RE-INTIALIZING PROJECT_INFORMATION_BY_PNAME');
  // routes/helpers/helpers.js:258:    delete PROJECT_INFORMATION_BY_PNAME[pname];
  // routes/helpers/helpers.js:274:        console.log(' UPDATING PROJECT_INFORMATION_BY_PNAME');
  // routes/helpers/helpers.js:521:          PROJECT_INFORMATION_BY_PNAME[project] =  PROJECT_INFORMATION_BY_PID[pid];
  // routes/load_all_datasets.js:18:  PROJECT_INFORMATION_BY_PNAME= {};  // 0 if public otherwise == user id
  // routes/load_all_datasets.js:45:      console.log(' INITIALIZING PROJECT_INFORMATION_BY_PNAME');
  // routes/routes_admin.js:372:          delete PROJECT_INFORMATION_BY_PNAME[old_project_name];
  // routes/routes_admin.js:373:          PROJECT_INFORMATION_BY_PNAME[new_project_name] = PROJECT_INFORMATION_BY_PID[pid];
  //
  if (!(project in PROJECT_INFORMATION_BY_PNAME)) {
    console.log("running1 ProjectExistsInDB");
    project_exists_in_db = ProjectExistsInDB(project, req, res);
    console.log("project_exists_in_db = " + project_exists_in_db);
  }

  console.log("running FastaProvided");
  fasta_exists = FastaProvided(req, res);
  console.log("fasta_exists = " + fasta_exists);

  console.log("running MetadataFileProvided");
  metadata_file_exists = MetadataFileProvided(req, res);
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
  req.flash('success', "Upload in Progress: '" + project + "'");

  // type, user, project, status, msg
  res.render('success', {  title   : 'VAMPS: Import Success',
                            display : display,
                            user    : req.user, hostname: req.CONFIG.hostname
  });
};

function OriginalMetafileUpload(req, options)
{
  console.log("QQQ3 in OriginalMetafileUpload");

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

  return options;
}

function CheckFileTypeInfo(req, options)
{
  console.log("QQQ4 in CheckFileTypeInfo");
  // console.log("QQQ444 req.url: " + req.url);

  var redirect_url = path.join('/user_data', req.url);
  if (req.body.type == 'simple_fasta') {
      if (req.body.dataset === '' || req.body.dataset === undefined) {
        req.flash('fail', 'A dataset name is required.');
        res.redirect(redirect_url);
        return;
      }
      options.args = options.args.concat(['-upload_type', 'single', '-d', req.body.dataset ]);
    } else if (req.body.type == 'multi_fasta') {
        options.args = options.args.concat(['-upload_type', 'multi' ]);
    } else {
        req.flash('fail', 'No file type info found');
        res.redirect(redirect_url);
        return;
    }
    return options;
}

function CreateUploadOptions(req, res, project)
{
  console.log("QQQ3 in CreateUploadOptions");

  var username = req.user.username;
  console.log('1-req.body upload_data');
  console.log(req.body);
  console.log("req.files from CreateUploadOptions");
  console.log(req.files);
  console.log('2-req.body upload_data');

  var data_repository = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-' + project);
  // console.log("data_repository DDD: " + data_repository);

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


    options.args = options.args.concat(['-q' ]);   // QUIET
    return [data_repository, options];
}

function CreateCmdList(req, options, data_repository)
{
  //console.log(options.scriptPath + '/vamps_script_load_trimmed_data.py ' + options.args.join(' '));
  var load_cmd = options.scriptPath + '/vamps_script_load_trimmed_data.py ' + options.args.join(' ');
  // console.log("LLL load_cmd: " + load_cmd);
  // /Users/ashipunova/BPC/vamps-node.js/public/scripts/node_process_scripts//vamps_script_load_trimmed_data.py -project_dir /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project -owner admin -p test_gast_project -site local -infile /Users/ashipunova/BPC/vamps-node.js/tmp/b3a0c4ca3964f701e8ea6ef5d5fe2c56 -mdfile /Users/ashipunova/BPC/vamps-node.js/tmp/a9825a22a87f9b6600e7bf44dd13be48 -upload_type single -d test_gast_dataset -q

  var cmd_list = [load_cmd];

  if (req.body.type == 'multi_fasta') {
      var new_fasta_file_name = infile_fa;
      // var demultiplex_cmd = options.scriptPath + '/vamps_script_demultiplex.sh ' + data_repository + ' ' + new_fasta_file_name;
      //var demultiplex_cmd = path.join(config.PATH_TO_NODE_SCRIPTS, '/vamps_script_demultiplex.sh') + ' ' + req.CONFIG.PATH + ' ' + data_repository + ' ' + new_fasta_file_name;
      var demultiplex_cmd = path.join(config.PATH_TO_NODE_SCRIPTS, '/vamps_script_demultiplex.sh') + ' ' + data_repository + ' ' + new_fasta_file_name;
      console.log("req.CONFIG.PATH HHH = " + req.CONFIG.PATH);
      cmd_list.push(demultiplex_cmd);
  }

  // todo: provied ".fa" fo single and ".fna" for multi
  // var fnaunique_cmd = options.scriptPath + '/vamps_script_fnaunique.sh ' + req.CONFIG.PATH + " " + data_repository;
  //var fnaunique_cmd = path.join(config.PATH_TO_NODE_SCRIPTS, '/vamps_script_fnaunique.sh') + ' ' + req.CONFIG.PATH + ' ' + data_repository;
  //var fnaunique_cmd = path.join(config.PATH_TO_NODE_SCRIPTS, '/vamps_script_fnaunique.sh') + ' ' + req.CONFIG.PATH + ' ' + data_repository;
  var fnaunique_cmd = path.join(config.PATH_TO_NODE_SCRIPTS, '/vamps_script_fnaunique.sh') + ' ' + data_repository;
  //console.log("LLL1 options.scriptPath: " + options.scriptPath);
  //console.log("LLL2 fnaunique_cmd: " + fnaunique_cmd);
  
  cmd_list.push(fnaunique_cmd);

  //console.log("CCC1 cmd_list: ");
  //console.log(util.inspect(cmd_list, false, null));
  return cmd_list;

  //TODO:
  // test:
  // CCC1 cmd_list:
  // [ '/Users/ashipunova/BPC/vamps-node.js/public/scripts/node_process_scripts/vamps_script_load_trimmed_data.py -project_dir /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project -owner admin -p test_gast_project -site local -infile /Users/ashipunova/BPC/vamps-node.js/tmp/... -mdfile /Users/ashipunova/BPC/vamps-node.js/tmp/... -upload_type single -d test_gast_dataset -q',
  //   '/Users/ashipunova/BPC/vamps-node.js/public/scripts/node_process_scripts/vamps_script_fnaunique.sh /opt/local/bin:/opt/local/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/local/ncbi/blast/bin:/opt/local/bin:/usr/local/mysql/bin:/opt/local/Library/Frameworks/Python.framework/Versions/2.7/bin:/Users/ashipunova/BPC/vamps-node.js/public/scripts/bin: /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-test_gast_project' ]

}

function CheckIfPID(data)
{
  var lines = data.split('\n');
  for (var n in lines) {
    if (lines[n].substring(0, 4) == 'PID=') {
    console.log('NNN pid line ' + lines[n]);
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

function GetScriptVars(req, data_repository, cmd_list, cmd_name)
{
  if (helpers.isLocal(req))
  {
    console.log('FOUND LOCAL')
    scriptlog   = path.join(data_repository, 'script.log');
    script_text = helpers.get_local_script_text(cmd_list);
  }
  else
  {
    scriptlog   = path.join(data_repository, 'cluster.log');
    script_text = helpers.get_qsub_script_text_only(req, scriptlog, data_repository, cmd_name, cmd_list);
  }
  
  // console.log('111 scriptlog: ' + scriptlog);
  // console.log('222 script_text: ' + script_text);
  // console.log('222 =====');
  // console.log(helpers.isLocal(req));
  return [scriptlog, script_text];
}

// TODO: remove repetitions, see title: 'VAMPS:Import Data'
function editUploadData(req, res)
{
  console.log("EEE1 editUploadData: req.form");
  console.log(util.inspect(req.form, false, null));
  url = path.join('user_data', req.url);
  
  res.render(url, {
    title:        'VAMPS:Import Data',
    import_type:  req.body.type,
    user:         req.user,
    form_data:    req.form,
    hostname:     req.CONFIG.hostname
  });
}

function successCode(successCode_options, last_line)
{
  req     = successCode_options[0];
  res     = successCode_options[1];
  project = successCode_options[2];
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
}

// TODO: how to test:
// use multi_fasta
// EEE line: for file in /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-imp_pr_not_exists/*.fa; do fastaunique ; done\n
// EEE line: Error: File does not exist, or you do not have the right permissions to read it: "/Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-imp_pr_not_exists/*.fa"
// run_process process exited with code 255
// last_line: for file in /Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-imp_pr_not_exists/*.fa; do fastaunique ; done\nError: File does not exist, or you do not have the right permissions to read it: "/Users/ashipunova/BPC/vamps-node.js/user_data/vamps2/admin/project-imp_pr_not_exists/*.fa"
// has .fna instead!
// or call unexisting script

function failedCode(req, res, data_repository, project, last_line)
{
 fs.move(data_repository, path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'FAILED-project-' + project),
  function failureHandle(err) {
   if (err) { 
     console.log("err 6: ");  
     console.log(err);  
   }
   else {
       req.flash('fail', 'Script Failure: ' + last_line);
       status_params = {'type':    'update',
                        'user_id': req.user.user_id,
                        'project': project,
                        'status':  'Script Failure',
                        'msg':     'Script Failure'
       };
       var redirect_url = path.join('/user_data', req.url);
       res.render(redirect_url, {
         user: req.user,
         hostname: req.CONFIG.hostname,
       });
       
       // res.redirect(redirect_url);  // for now we'll send errors to the browser
       return;
   }
 });
}

function RunAndCheck(script_path, nodelog, req, project, res, callback_function, callback_function_options)
{
  // http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn
  console.log("QQQ6 in RunAndCheck");
  console.log("QQQRRR1 script_path: " + script_path);

  var exec = require('child_process').exec;
  var child = exec(script_path);
  var output = '';
  
  child.stdout.on('data', function AddDataToOutput(data) {
        data = data.toString().trim();
        output += data;
        console.log('stdout: ' + data);
        CheckIfPID(data);
  });
  
 
  
  child.stderr.on('data', function(data) {
      console.log('stderr: ' + data);
  });
  
  child.on('close', function checkExitCode(code) {
     console.log('From RunAndCheck process exited with code ' + code);
     var ary = output.split("\n");
     console.log("TTT output.split (ary) ");
     console.log(util.inspect(ary, false, null));
     var last_line = ary[ary.length - 1];
     console.log('last_line:', last_line);
     if (code === 0)
     {
       callback_function(callback_function_options, last_line);
     }
     else // code != 0
     {
       console.log('FAILED',script_path)
       //failedCode(req, res, path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-' + project), project, last_line);
     }
  });

  //
  // var run_process = spawn( 'bash', [script_path], {
  //   detached: true, stdio: [ 'ignore', null, nodelog ]
  // });  // stdin, s
  //
  // var output = '';
  //
  // // TODO: where "data" come from?
  // run_process.stdout.on('data', function AddDataToOutput(data) {
  //   data = data.toString().trim();
  //   output += data;
  //   CheckIfPID(data);
  // });
  //
  // run_process.on('close', function checkExitCode(code) {
  //    console.log('run_process process exited with code ' + code);
  //    var ary = output.split("\n");
  //    console.log("TTT output.split (ary) ");
  //    console.log(util.inspect(ary, false, null));
  //    var last_line = ary[ary.length - 1];
  //    console.log('last_line:', last_line);
  //    if (code === 0)
  //    {
  //      callback_function(callback_function_options, last_line);
  //    }
  //    else // code != 0
  //    {
  //      failedCode(req, res, path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-' + project), project, last_line);
  //    }
  // });
}

function writeAndRunScript(req, res, project, options, data_repository)
{
  console.log("QQQ5 in writeAndRunScript");

  fs.ensureDir(data_repository, function chDataRepMode(err) {
    if (err) {console.log('No such dir: ensureDir err:', err);} // => null
    else
    {
      // TODO: name this function, what is it doing?:
      fs.chmod(data_repository, 0777, function chmodDataRepo(err) {
        if (err) {
          console.log('chmod err:', err);
          return;
        }
        var cmd_list = CreateCmdList(req, options, data_repository);
        script_name     = 'load_script.sh';
        var nodelog     = fs.openSync(path.join(data_repository, 'assignment.log'), 'a', 0664);
        var script_vars = GetScriptVars(req, data_repository, cmd_list, 'vampsupld');
        var scriptlog   = script_vars[0];
        var script_text = script_vars[1];
        var script_path = path.join(data_repository, script_name);
        var ok_code_options = [req, res, project];

        var mode = 0775;
        var oldmask = process.umask(0);
        console.log("script_path1 = " + script_path);
        fs.writeFile(script_path, 
          script_text, 
          {
            mode: mode
          }, 
          function(err) {
            if(err) {
                return console.log(err);
            }
            else
            {
              RunAndCheck(script_path, nodelog, req, project, res, successCode, ok_code_options);
              process.umask(oldmask);
              console.log("2-The file was saved!");
            }
        }); // end writeFile
      });     //   END data_repository chmod
    }         // end else
  });         //   END ensuredir  
}
//
//
//
// router.post('/validate_metadata2', [helpers.isLoggedIn, upload.array('upload_files', 12)], helpers.isLoggedIn, function (req, res) {
//     console.log('in validate_metadata2')
//     console.log('1req.body upload_data_tax_by_seq');
//     console.log(req.body);
//     console.log("req.files from validate_metadata2");
//     console.log(req.files);  // array
  
// });
//
function validate_metadata(req, res, options)
{
  console.log('in validate_metadata')
  console.log(req.files)
  console.log(options)
  var metadata_file = req.files[1].path
  console.log('metadata_file')
  console.log(metadata_file)
  var parse = require('csv-parse');
  var url_parts = url.parse(req.url);
  var import_type = url_parts.pathname.split("/").slice(-1)[0];
  var project = req.body.project
  
  //var metadata_file = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+project, 'metadata_clean.csv');
  mdata = []
  html_json = {} 
  html_json.error = false
  



  var parser = parse({delimiter: '\t'}, function createParserPipe(err, mdata) {
      
      html_json = {};
      console.log("mdata: ");
      console.log(mdata);
      req_metadata = req.CONSTS.REQ_METADATA_FIELDS
      console.log('req_metadata')
      console.log(req_metadata)
      dataset_field_names = ['sample_name','#SampleID','dataset','Dataset']
      title_row = mdata[0]
      idx = dataset_field_names.indexOf(title_row[0])
      if(idx != -1){
        dataset_field = title_row[0]
        console.log('found dataset_field '+dataset_field)
      }else{
        console.log('we have no dataset_field')
        html_json.error = true

      }
      
      html_json['required_metadata'] = req_metadata
      for(n=1;n<mdata.length;n++){ // each item is a dataset
        dset = mdata[n][0]
        html_json[dset] = []
        for(m in req_metadata){
          req_name = req_metadata[m]
          idx = title_row.indexOf(req_name)
          if(idx == -1){
            html_json[dset].push('')
            html_json.error = true
          }else{
            html_json[dset].push(mdata[n][idx])
          }
          
        }

      }
      console.log('html_json')
      console.log(html_json)
      html_json.error = true
      if(html_json.error){
          res.render(path.join('user_data',url_parts.pathname), {
                  title:       'Import DataX',
                  user:        req.user,
                  hostname:    req.CONFIG.hostname,
                  pinfo:       JSON.stringify({}),
                  project:      '',
                  html_json:    JSON.stringify(html_json),
                  import_type: import_type,
          });
        }
      
  });
  
  
  try{
    console.log('looking for meta');
    stats = fs.lstatSync(metadata_file);
    if (stats.isFile()) {
      console.log('meta found');
      fs.createReadStream(metadata_file).pipe(parser);
      return html_json
    }
  }
  catch(e) {
    console.log('meta NOT found');
    html_json.error = true
    html_json.error_msg = 'Could not read csv file.'
    return html_json
    
  }

}
//
//
//

function uploadData(req, res)  // from line 406
{
  console.log("QQQ2 in uploadData");
  var url_parts = url.parse(req.url);
  var import_type = url_parts.pathname.split("/").slice(-1)[0];
  var project = helpers.clean_string(req.body.project);  // should turn space into underscore
  console.log('P',project)
  // TODO: check if CreateUploadOptions does anything else and separate
  var created_options = CreateUploadOptions(req, res, project);
  var data_repository = created_options[0];
  var options         = created_options[1];

  options = OriginalMetafileUpload(req, options);

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
  result = validate_metadata(req, res, options)
  



  options = CheckFileTypeInfo(req, options);
    // TODO: test
    // MMM CheckFileTypeInfo. options:
    // ...
    //      '-upload_type',
    //      'single',
    //      '-d',
    //      'test_gast_dataset' ] }

  writeAndRunScript(req, res, project, options, data_repository);
}


router.get('/add_project', [helpers.isLoggedIn], function (req, res) {
  console.log('in add_project-ttt');

  res.render('user_data/add_project', {
    title: 'VAMPS: Add a new project',
    user: req.user,
    hostname: req.CONFIG.hostname,
  });
});


function getPrivacyCode(privacy_bulean){
  if (privacy_bulean === 'True')
    { return 1; }
  else
    { return 0; }
}

function saveToDb(req, res){
  var user_id;
  var user_info = [req.form.first_name, req.form.last_name, req.form.email, req.form.new_institution];
  var query_user_id = 'SELECT user_id FROM user WHERE first_name = ? AND last_name = ? AND email = ? AND institution = ?;';

  helpers.fetchInfo(query_user_id, user_info, function mysqlSelectUID(err, content) {
      if (err) {
        console.log("Err from saveToDb");
        console.log("err 7: ");
        console.log(err);
          // TODO: Do something with your error...
      } else {
          owner_user_id = content.user_id;
          var new_privacy = 1;
          new_privacy = getPrivacyCode(req.form.new_privacy);
          //TODO wrire a test for connection insert 1 vs. 0 for privacy

          var sql_a = queries.MakeInsertProjectQ(req.form, owner_user_id, new_privacy);
          // console.log("QQQ sql_a = " + sql_a);
          connection.query(sql_a,
          function (err, rows) {
           if (err) {
             console.log('ERROR-in project insert: ' + err);
             // TODO: fix: req flash doesn't work from here!
             req.flash('fail', err);
             return false;
           } else {

             req.body.project_pid = rows.insertId;
             // console.log('RRR: req.body.project_pid ' + req.body.project_pid);
             // AAV -- Do we want this new empty project in PROJECT_INFORMATION_BY_PNAME???
             // Currently this new project doesn't have a directory in /groups/vampsweb/vampsdev_node_data/user_data/andy
             // AND it is absent from the dropdown box when wanting to add datasets  
             //helpers.update_project_information_global_object(req.body.project_pid, req.form, req.user)
             
             return rows.insertId;
           }
        });
      }
  });
}


function editAddProject(req, res){
  console.log('in editAddProject');

  // TODO: keep chosen ENV_SOURCE

  res.render('user_data/add_project', {
    title: 'VAMPS: Add a new project',
    user: req.user,
    hostname: req.CONFIG.hostname,
    add_project_info: req.add_project_info,
    //env_sources:  JSON.stringify(MD_ENV_PACKAGE),
  });
}

// TODO: if user info didn't change, use user_id from req.user
router.post('/add_project',
  [helpers.isLoggedIn],
  form(
    form.field("new_project_name", "Project Name").trim().required().is(/^[a-zA-Z_0-9]+$/, "Only letters, numbers and underscores are valid in %s").minLength(3).maxLength(20).entityEncode(),
    form.field("new_privacy", "Public").trim().required().is(/False|True/),
    form.field("new_project_title", "Title").trim().required().entityEncode().maxLength(100),
    form.field("new_project_description", "Description").trim().required().entityEncode().maxLength(255),
    form.field("new_funding", "Funding").trim().required().is(/[0-9]/),
    // post.super.nested.property
    form.field("first_name", "First Name").trim().required().entityEncode().is(/^[a-zA-Z-]+$/),
    form.field("last_name", "Last Name").trim().required().entityEncode().is(/^[a-zA-Z-]+$/),
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
      //console.log('FORM INFOx')
      //console.log(req)
      var project_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-'+req.form.new_project_name)
      helpers.mkdirSync(project_dir)
      res.redirect("/user_data/import_choices?project="+req.form.new_project_name);
    }

    return;
  }
);


//
// UPLOAD DATA TAX-BY-SEQ
//
router.get('/import_choices/tax_by_seq', [helpers.isLoggedIn], function (req, res) {
  var url_parts = url.parse(req.url);
  var import_type = url_parts.pathname.split("/").slice(-1)[0];
  console.log(url_parts);
  var project = req.query.project || ''
  console.log('proj',project)
  console.log('import_type',import_type)
  //url         = path.join('user_data', req.url);
  //import_type = req.url.split("/").slice(-1)[0];
  //'/import_choices/multi_fasta', 'multi_fasta'
  user_project_info = {}
  connection.query(queries.get_projects_queryUID(req.user.user_id), function (err, rows, fields) {
      if (err)
      {
        console.log(err);
      }
      else
      {
          for(n in rows){
            pid = rows[n]['project_id']
            p   = rows[n]['project']
            user_project_info[pid] = {'project':p}            
          }
          res.render(path.join('user_data',url_parts.pathname), {
            title:       'Import Data',
            user:        req.user,
            hostname:    req.CONFIG.hostname,
            pinfo:       JSON.stringify(user_project_info),
            project: project,
            import_type: import_type,
          });
     }
  });
});

router.post('/import_choices/upload_data_tax_by_seq', [helpers.isLoggedIn, upload.array('upload_files', 12)], function (req, res) {

  console.log('upload_data_tax_by_seq');
  console.log("PLPLPLPL req.url = " + req.url);
  var project = req.body.project || '';
  var use_original_names = req.body.use_original_names || 'off';
  var username = req.user.username;
  var use_file_taxonomy = req.body.use_tax_from_file;
  var redirect_url = path.join('/user_data', req.url);

  

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
  console.log("req.files from upload_data_tax_by_seq");
  console.log(req.files);  // array
  console.log('project: '+project || 'none');
  console.log('use_original_names: '+use_original_names);
  console.log('2req.body upload_data_tax_by_seq');
  
  var render_url = path.join("/user_data", req.url);
  
  if (req.files.length === 0 ) {
    req.flash('fail', 'Make sure you are choosing a file to upload and that it is smaller than '+ req.CONFIG.UPLOAD_FILE_SIZE+' bytes');

    res.redirect(render_url);
    return;
  }

  if (req.files[0] && req.files[0].size > config.UPLOAD_FILE_SIZE.bytes) {  // 1155240026
    req.flash('fail', 'The file '+req.files[0].originalname+' exceeds the limit of '+config.UPLOAD_FILE_SIZE.MB);
    res.redirect(render_url);
    return;
  }
  if (req.files[1] && req.files[1].size > config.UPLOAD_FILE_SIZE.bytes) {
    req.flash('fail', 'The file '+req.files[1].originalname+' exceeds the limit of '+config.UPLOAD_FILE_SIZE.MB);
    res.redirect(render_url);
    return;
  }
  if ((project === '' || req.body.project === undefined) && req.body.use_original_names != 'on') {
    req.flash('fail', 'A project name is required.');
    res.redirect(render_url);
    return;
  } else if (project in PROJECT_INFORMATION_BY_PNAME) {
    req.flash('fail', 'That project name is already taken.');
    res.redirect(render_url);
    return;
  } else if (req.files[0].filename === undefined || req.files[0].size === 0) {
    req.flash('fail', 'A tax_by_seq file is required.');
    res.redirect(render_url);
    return;
  } else {



      //var file_path = path.join(process.env.PWD, req.file.path);
      //var original_taxbyseqfile = path.join('./user_data', NODE_DATABASE, 'tmp', req.files[0].filename);
      //var original_metafile  = path.join('./user_data', NODE_DATABASE, 'tmp', req.files[1].filename);
      //var original_taxbyseqfile = path.join(process.env.PWD, 'tmp', req.files[0].filename);
      var original_taxbyseqfile = path.join('/tmp', req.files[0].filename);
      console.log("original_taxbyseqfile: ");
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
          req.flash('fail', 'No file type info found:  ');
          res.redirect(render_url);
          return;
      }

        console.log(options.scriptPath + '/vamps_load_tax_by_seq.py '+options.args.join(' '));

        var log = fs.openSync(path.join(process.env.PWD, 'logs', 'upload_taxbyseq.log'), 'a');


        var tax_by_seq_process = spawn( options.scriptPath + '/vamps_load_tax_by_seq.py', options.args, {
                              env:{ 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH, 'PATH':req.CONFIG.PATH },
                              detached: true, stdio: 'pipe'
                            });  // stdin, stdout, stderr
        console.log('py process pid='+tax_by_seq_process.pid);
        var output = '';
        // communicating with an external python process
        // all the print statements in the py script are printed to stdout
        // so you can grab the projectID here at the end of the process.
        // use looging in the script to log to a file.
        tax_by_seq_process.stdout.on('data', function TaxBySeqProcessStdout(data) {
            //console.log('Processing data');
            // data = data.toString().replace(/^\s+|\s+$/g, '');
            data = data.toString().trim();
            output += data;
            CheckIfPID(data);
        });
        tax_by_seq_process.on('close', function TaxBySeqProcessOnClose(code) {
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
                      connection.query(queries.get_select_datasets_queryPID(pid), function mysqlSelectDatasetsByPID(err, rows1, fields) {
                        if (err)  {
                           console.log('1-TAXBYSEQ-Query error: ' + err);
                        } else {
                               connection.query(queries.get_select_seq_count_queryPID(pid), function mysqlSelectSeqssByPID(err, rows2, fields) {
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
            console.log("output: ");
            console.log(output);
            console.log('ERROR last line: '+code);
            
           }
        });  // end tax_by_seq_process ON Close

  }

  console.log('LoadDataFinishRequest in upload_data_tax_by_seq');
  LoadDataFinishRequest(req, res, project, "TaxBySeq_Import_Success");


});

//
//  FILE UTILS
//
router.get('/file_utils', helpers.isLoggedIn, function (req, res) {

  console.log('in file_utils');
  var user = req.query.user;

  console.log("file from file_utils: ");
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
      fs.unlink(file, function deleteFile(err) {
        if (err) {
          console.log("err 8: ");
          console.log(err);
          req.flash('fail', err);
        } else {
          req.flash('success', 'Deleted: '+req.query.filename);
          res.redirect("/visuals/saved_elements");
        }
      }); //
    } else {
      fs.unlink(file, function deleteFile(err) {
        if (err) {
          req.flash('fail', err);
          console.log("err 9: ");
          console.log(err);
        } else {
          req.flash('success', 'Deleted: '+req.query.filename);
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
    var dids = req.session.chosen_id_order;
    file_name = 'fasta-'+timestamp+'_custom.fa.gz';
    out_file_path = path.join(user_dir, file_name);
    qSelect += " where dataset_id in ("+dids+")";
    console.log(dids);

  } else if (req.body.download_type == 'custom_taxonomy') {

      req.flash('success', 'Fasta being created');
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
  var collection = db.query(qSelect, function mysqlSelectSeqs(err, rows, fields) {
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
      .on('finish', function readableStreamOnFinish() {  // finished
        console.log('done compressing and writing file: fasta');
        var info = {
              to : req.user.email,
              from : "vamps@mbl.edu",
              subject : "fasta file is ready",
              text : "Your fasta file is ready here:https://vamps2.mbl.edu\n\nAfter you log in go to the 'Your Data/File Retrieval' Page."
            };
        helpers.send_mail(info);


      });

  });

  res.send(file_name);


});
//
//
//
router.get('/required_metadata_options', helpers.isLoggedIn, function(req, res) {
    console.log('in required_metadata_options')
    res.render('user_data/required_metadata_options', {
              title     :'VAMPS Validate Metadata',
              user: req.user,
              md_env_pkg:           JSON.stringify(MD_ENV_PACKAGE),
            md_env_term:            JSON.stringify(MD_ENV_ENVO),
            md_env_cntry:           JSON.stringify(MD_ENV_CNTRY),   
            md_env_lzc:             JSON.stringify(MD_ENV_LZC),     
            md_sequencing_platform: JSON.stringify(MD_SEQUENCING_PLATFORM),
            md_target_gene:         JSON.stringify(MD_TARGET_GENE),
            md_domain:              JSON.stringify(MD_DOMAIN),
            md_dna_region:          JSON.stringify(MD_DNA_REGION),
            md_adapter_sequence:    JSON.stringify(MD_ADAPTER_SEQUENCE),	
            md_illumina_index:      JSON.stringify(MD_ILLUMINA_INDEX),
            md_primer_suite:        JSON.stringify(MD_PRIMER_SUITE),
            md_run:					JSON.stringify(MD_RUN),
            
            hostname: req.CONFIG.hostname,
    });
});
//
// DOWNLOAD METADATA
//
router.post('/download_selected_metadata', helpers.isLoggedIn, function download_metadata(req, res) {
  var db = req.db;
  console.log('metadata download POST req.body-->>');
  // here from project info page
  console.log(req.body);
  var timestamp = +new Date();  // millisecs since the epoch!
    
  var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
  helpers.mkdirSync(req.CONFIG.USER_FILES_BASE);
  helpers.mkdirSync(user_dir);  // create dir if not exists
  var orientation = req.body.orientation;
  var dids;
  var project;
  var file_name;
  var out_file_path;
  var file_tag;

  if (req.body.download_type == 'whole_project') {
        var pid  = req.body.pid;
        var file_tag = []
        dids = DATASET_IDS_BY_PID[pid];
        if(req.body.hasOwnProperty('project')){
          project = req.body.project;
        }else{
          project = PROJECT_INFORMATION_BY_PID[pid].project
        }
        console.log(PROJECT_INFORMATION_BY_PID[pid])
        if(PROJECT_INFORMATION_BY_PID[pid].hasOwnProperty('metagenomic')){
            if((PROJECT_INFORMATION_BY_PID[pid].metagenomic).toString() == '1'){
                file_tag.push('--include_metagenomic')
            }
        }
        if(orientation == 'cols'){
            file_name = 'metadata-'+timestamp+'-2.tsv.gz';
            file_tag.push('--metadata_file2')
        }else{
            file_name = 'metadata-'+timestamp+'-1.tsv.gz';
            file_tag.push('--metadata_file1')
        }
        console.log(file_tag)
        //file_name = 'metadata-'+timestamp+'_'+project+'.csv';
        out_file_path = path.join(user_dir, file_name);
        header = "Project: "+project+"\n\t";
         helpers.create_export_files(req, 
            user_dir, 
            timestamp, 
            dids, 
            file_tag, 
            'none',     // normalization 
            'phylum',      // tax depth --doesn't matter here for metadata 
            ['Bacteria'],     // domains --doesn't matter here for metadata
            'yes',     // yes or no --doesn't matter here for metadata
            true);
        res.send(file_name);
        return;
  } else if (req.body.download_type == 'partial_project'){
        dids = req.session.chosen_id_order;
        if(orientation == 'cols'){
            //file_name = 'metadata-samples_in_cols'+timestamp+'.csv.gz';
            file_name = 'metadata-'+timestamp+'-2.tsv.gz';
            file_tag = ['--metadata_file2']
        }else{
            //file_name = 'metadata-samples_in_rows'+timestamp+'.csv.gz';
            file_name = 'metadata-'+timestamp+'-1.tsv.gz';
            file_tag = ['--metadata_file1']
        }
        
        //out_file_path = path.join(user_dir, file_name);
        out_file_path = path.join('tmp', file_name);
        header = 'Project: various'+"\n\t";
         helpers.create_export_files(req, 
            user_dir, 
            timestamp, 
            dids, 
            file_tag, 
            'none',     // normalization 
            'phylum',      // tax depth --doesn't matter here for metadata 
            ['Bacteria'],     // domains --doesn't matter here for metadata
            'yes',     // yes or no --doesn't matter here for metadata
            true);
        res.send(file_name);
        return;
        
  } else if (req.body.download_type == 'all_dco'){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) {
        dd = '0'+dd
        } 
        if(mm<10) {
            mm = '0'+mm
        } 
        today = yyyy +'-'+ mm + '-' + dd;
        var dids = new Array()
        for(pid in PROJECT_INFORMATION_BY_PID){
            project = PROJECT_INFORMATION_BY_PID[pid].project
            if(project.substring(0,3)=='DCO'){
                //console.log(PROJECT_INFORMATION_BY_PID[pid])
                dids_list = DATASET_IDS_BY_PID[pid]
                dids = dids.concat(dids_list)
            } 
        }
        file_name = 'dco_all_metadata_'+today+'.tsv.gz'
        out_file_path = path.join(req.CONFIG.PATH_TO_DCO_DOWNLOADS, file_name)
        //out_file_path = path.join('../vamps_data_downloads', file_name)
        header = 'Project: DCO'+"\n\t";
        helpers.create_export_files(req, 
            req.CONFIG.PATH_TO_DCO_DOWNLOADS, 
            timestamp, 
            [''],  // empty did list for dco_bulk 
            ['--dco_metadata_file'], 
            'none',     // normalization 
            'phylum',      // tax depth --doesn't matter here for metadata 
            ['Bacteria'],     // domains --doesn't matter here for metadata
            'yes',     // yes or no --doesn't matter here for metadata
            true);
         res.send(file_name);
        return;    
            
            
  
   console.log('out_file_path: '+out_file_path)
    var gzip = zlib.createGzip();
    var myrows = {}; // myrows[mdname] == [] list of values

    var wstream = fs.createWriteStream(out_file_path);
    var rs = new Readable();
    var filetxt;
    var mditems_list = [];
	var dataset_name_list = []
    for (var i in dids) {
        did = dids[i];
        dname = DATASET_NAME_BY_DID[did];     
        //console.log('dname '+dname)   
        pname = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;
        pjds = pname+'--'+dname
        dataset_name_list.push(pjds)
        
        for (var mdname in AllMetadata[did]){
          //console.log(mdname)
          var data = helpers.required_metadata_names_from_ids(AllMetadata[did], mdname)
           
          if( mditems_list.indexOf(data.name) == -1){
            mditems_list.push(data.name)
          }
          
          if(orientation == 'cols'){
              if(data.name in myrows){					
                myrows[data.name][pjds] = data.value;
              }else{
                myrows[data.name] = {};
                myrows[data.name][pjds] = data.value;
              }
          
          }else{
              if(pjds in myrows){
                myrows[pjds][data.name] = data.value;
              }else{
                myrows[pjds] = [];
                myrows[pjds][data.name] = data.value;
              }              
          }
        }
        

    }
	var header = '\t';
	if(orientation == 'cols'){
       	// metadata in rows; units in column 2 ?
       	header += dataset_name_list.sort().join('\t');
    }else{
    	
    	header += mditems_list.sort().join('\t');
    }
    //console.log(header)
    header += "\n";
    rs.push(header);
    dnlist = dataset_name_list.sort()
    mdnlist = mditems_list.sort()
    //console.log(mdnl)
    //console.log(dnl)
    if (Object.keys(myrows).length === 0) {
      rs.push("NO METADATA FOUND\n");
    } else {
      if(orientation == 'cols'){
      	for(i in mdnlist){
      		filetxt = mdnlist[i]
      		for (n in dnlist) {
          		filetxt += "\t"+myrows[mdnlist[i]][dnlist[n]];
        	}
        	filetxt += "\n";
      		rs.push(filetxt);
      	}
      }else{
      	for(n in dnlist){
      		filetxt = dnlist[n]
      		for (i in mdnlist) {
          		filetxt += "\t"+myrows[dnlist[n]][mdnlist[i]];
        	}
        	filetxt += "\n";
      		rs.push(filetxt);
      	}
      	
      }
      
     
      
    }
    rs.push(null);
    rs
      .pipe(gzip)
      .pipe(wstream)
      .on('finish', function readableStreamOnFinish() {  // finished
        console.log('done compressing and writing file: metadata');
      });
      console.log(out_file_path)
      //res.download(path.join(__dirname  +'/../' +  out_file_path))
      fs.chmodSync(out_file_path, 0775)
      res.send(file_name);
   }
});
//
//
//
router.get('/download_selected_metadata', helpers.isLoggedIn, function download_metadata(req, res) {
  
  var db = req.db;
  console.log('metadate download GET req.body-->>');
  
  var timestamp = +new Date();  // millisecs since the epoch!

  var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
  helpers.mkdirSync(req.CONFIG.USER_FILES_BASE);
  helpers.mkdirSync(user_dir);  // create dir if not exists
  var dids;
  var header, project;
  var file_name;
  var out_file_path;

  
    var pid  = req.query.pid
    console.log('pid '+pid)
    if(pid == undefined || pid == '' || pid == 0 || ! pid ){
      res.send('Choose a project');
      return;
    }
    dids = DATASET_IDS_BY_PID[pid];
    
    project = PROJECT_INFORMATION_BY_PID[pid].project
    
    
    //file_name = 'metadata-'+timestamp+'_'+project+'.csv.gz';
    file_name = req.user.username+'-metadata'+timestamp+'_'+project+'.csv';
    out_file_path = path.join('tmp', file_name);
    
  
    console.log('dids');
    console.log(dids);


    var gzip = zlib.createGzip();
    var myrows = {}; // myrows[mdname] == [] list of values

    var wstream = fs.createWriteStream(out_file_path);
    var rs = new Readable();
    var filetxt;
    var name_collector = {}
      for (var i in dids) {
        did = dids[i];
        myrows[did] = {}
        dname = DATASET_NAME_BY_DID[did];
        // if (req.body.download_type == 'whole_project') {
        //   header += dname+"\t";

        // } else {
        //   pname = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;
        //   header += pname+'--'+dname+"\t";
        // }

        //if(HDF5_MDATA === ''){
        for (var mdname in AllMetadata[did]){
          
          //console.log(mdname)
            var data = helpers.required_metadata_names_from_ids(AllMetadata[did], mdname)
            
            name_collector[data.name] = 1
            myrows[did][data.name] = data.value;
        }
        
      }
    
    header = "Dataset";
    mdkeys = Object.keys(name_collector)  // convert to a list
    for (var i in mdkeys) {
      header += "\t"+mdkeys[i];
    }
    header += "\n";
    rs.push(header);
    filetxt = ''
    if (Object.keys(myrows).length === 0) {
      rs.push("NO METADATA FOUND\n");
    } else {
      for (did in myrows) {
        ds = DATASET_NAME_BY_DID[did]
        filetxt += ds
        for (var i in mdkeys) {
          mdname = mdkeys[i]
          //filetxt = mdname+"\t";  // restart sting
          if(myrows[did].hasOwnProperty(mdname)){
            filetxt += "\t"+myrows[did][mdname];
          }else{
            filetxt += "\t";
          }
          // for (i in myrows[did]) {
          //   filetxt += myrows[mdname][i]+"\t";
          // }
          
        }
        filetxt += "\n";
        
      }
    }
    rs.push(filetxt);
    //console.log(JSON.stringify(filetxt))
    rs.push(null);
    rs
      //.pipe(gzip)
      .pipe(wstream)
      .on('finish', function readableStreamOnFinish() {  // finished
        console.log('done writing file');
        //console.log(JSON.stringify(req.user))
        
        //req.flash('Done')
        console.log(path.join(process.env.PWD,  out_file_path))
        res.download(path.join(process.env.PWD,   out_file_path))


      });
      
    
      //res.send(file_name);
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
    helpers.mkdirSync(req.CONFIG.USER_FILES_BASE);
    helpers.mkdirSync(user_dir);  // create dir if not exists

    //console.log(biom_matrix)
    dids = req.session.chosen_id_order;
    var timestamp = +new Date();
    var file_name = 'matrix-'+timestamp+'.csv';
    //out_file_path = path.join(user_dir, file_name);


    var out_file = path.join(user_dir, file_name);
    var wstream = fs.createWriteStream(out_file);
    var gzip = zlib.createGzip();
    var rs = new Readable();

    header_txt = "Taxonomy ("+req.session.tax_depth+" level)";
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
    .on('finish', function readableStreamOnFinish() {  // finished
      console.log('done compressing and writing file');
    });


    console.log('dids');
    console.log(dids);
    res.send(file_name);

});
//
//
//
router.post('/copy_html_to_image', helpers.isLoggedIn, function (req, res) {

    req.on('readable', function(){
      console.log(req.read());
    });

    console.log('in copy_html_to_image');
    console.log(req.body);
    // Lint: "Unreachable 'var' after 'return'."
    var ts = req.body.ts;
    var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
    var html, outfile;
    if(req.body.image == 'barcharts'){
      html = req.body.html;
      outfile = path.join( user_dir, 'barcharts-image-'+ts+'.png' );
      
    }else if(req.body.image == 'piecharts'){
      html = req.body.html;
      outfile = path.join( user_dir, 'piecharts-image-'+ts+'.png' );
    }else if(req.body.image == 'dheatmap'){
        outfile = path.join( user_dir, 'heatmap-image-'+ts+'.pdf' );

        html = "<center><table border='1'>  <tr><td></td><td>dataset <span class='blue'>Similar</span>&nbsp;<span class='red'>Dissimilar</span></td>";
        for(i=1; i<=Object.keys(distance_matrix).length; i++) {
          html += "<td></td>";
        }
        html += "</tr>";
        var n = 1;
        console.log(distance_matrix);
        var id_name_order           = COMMON.create_chosen_id_name_order(req.session.chosen_id_order);
        
        var w = id_name_order.length;
        console.log(w);
        for(var x in id_name_order) {
          var x_dname = id_name_order[x].name;
          html += "<tr id='"+x_dname+"'>";
          html += "<td  id='"+x_dname+"' class='dragHandle ds_cell'>"+n.toString()+"</td>";
          html += "<td class='dragHandle ds_cell' ><input type='hidden' name='ds_order[]' value='"+id_order[x]+"' >"+ x_dname +"</td>";
          for(var y in id_name_order) {
            var y_dname = id_name_order[y].name;
              var dist = distance_matrix[x_dname][y_dname].toFixed(5);
              if(x_dname === y_dname){
                html += "<td id='' class='heat_map_td' bgcolor='#000'></td>";
              }else{
                var id = 'dheatmap/'+x_dname+'/'+y_dname+'/'+dist;
                var svalue = Math.round( distance_matrix[x_dname][y_dname] * 15 );
                html += "<td id='"+id+"' class='heat_map_td tooltip_viz' bgcolor='#"+req.CONSTS.HEATMAP_COLORS[svalue]+"'>";
                html += "&nbsp;&nbsp;&nbsp;";
                html += "</td>";
              }
          }
        html += "</tr>";
        n++;
        }
        html += "</table></center>";

        console.log(html);

        var options = { format: 'Letter' };
        pdf.create(html, {}).toFile(outfile, function createPDF(err, res2) {
          if (err) return console.log(err);
          console.log(res2); // { filename: '/app/businesscard.pdf' }
          res.send('OK');
        });
    }
    console.log('outfile');
    console.log(outfile);
    console.log(html);
    var webshot = require('webshot');
    var options = {
      siteType: 'html',
      //screenSize: { width: w*20, height: w*14 },   // size of window

      customCSS: 'table {background:#F5F5DC;border-collapse: collapse;} .red {color:white;background:red;} .blue {color:white;background:blue;} td {padding:0 5px;}'
    };
    webshot(html, outfile, options, function createWebshotFromHTML(err) {
      // screenshot now saved to <>.png
      if(err){
        console.log("err 10: ");
        console.log(err);
      }
      else {
        res.send('OK');
      }
    });


});
//
//
//
router.post('/download_file', helpers.isLoggedIn, function (req, res) {
    console.log('in routes_user_data download_file');
    // file_type - fasta, metadata, or matrix
    console.log(req.body);
    var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
    var timestamp = +new Date();  // millisecs since the epoch!
    var file_tag = ['-'+req.body.file_type+'_file'];
    
      helpers.create_export_files(req, 
        user_dir, 
        timestamp, 
        req.session.chosen_id_order, 
        file_tag, 
        req.session.normalization, 
        req.session.tax_depth, 
        req.session.domains, 
        req.session.include_nas,  // yes or no
        true);
    //}
    res.send(req.body.file_type);
});
//
// COPY FILES from tmp directory to user directory
//
router.post('/copy_file_for_download', helpers.isLoggedIn, function (req, res) {
    console.log('copy_file_for_download req.body-->>');
	// these files being copied are already created when the visualization page is reached
    console.log(req.body);
    old_ts = req.body.ts;
    file_type = req.body.file_type;
    var timestamp = +new Date();
    var old_file_name;
    var new_file_name;
    var old_file_path
    var new_file_name = file_type+'-'+timestamp+'.txt';
    if (file_type == 'phyloseq-biom') {
      old_file_name = old_ts+'_count_matrix.biom';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
      new_file_name = file_type+'-'+timestamp+'.biom';
    }else if (file_type == 'phyloseq-tax') {
      old_file_name = old_ts+'_taxonomy.txt';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
    }else if (file_type == 'phyloseq-tree') {
      old_file_name = old_ts+'_outtree.tre';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
      new_file_name = file_type+'-'+timestamp+'.tre';
    }else if (file_type == 'distance-R') {
      old_file_name = old_ts+'_distance.R';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
    }else if (file_type == 'distance-py') {
      old_file_name = old_ts+'_distance.json';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
      new_file_name = file_type+'-'+timestamp+'.json';
    }else if (file_type == 'emperor-pc') {
      old_file_name = old_ts+'.pc';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
    }else if (file_type == 'pdf-fheatmap') {
      old_file_name = old_ts+'_fheatmap.pdf';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
      new_file_name = file_type+'-'+timestamp+'.pdf';
    }else if (file_type == 'pdf-pcoa') {
      old_file_name = old_ts+'_pcoa.pdf';
       old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
      new_file_name = file_type+'-'+timestamp+'.pdf';
    }else if (file_type == 'metadata') {
      old_file_name = old_ts+'_metadata.txt';
      old_file_path = path.join(process.env.PWD, 'tmp', old_file_name);
      new_file_name = file_type+'-'+timestamp+'.tsv';
    }else if (file_type == 'slp_otus') {
      old_file_name = old_ts
       old_file_path = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS, 'clusters', old_file_name);
       console.log(old_file_path)
      new_file_name = 'otus-'+old_ts;
    }else{
      console.log("In routes_user_data/copy_file_for_download and couldn't find file_type: ", file_type);
    }
    
    
    var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
    
    helpers.mkdirSync(req.CONFIG.USER_FILES_BASE);
    helpers.mkdirSync(user_dir);  // create dir if not exists
    var destination = path.join( user_dir, new_file_name );
    console.log(old_file_path, destination);
    fs.copy(old_file_path, destination, function copyFile(err) {
        if (err) return console.error(err);
        console.log("copy success!");
    });

    res.send(new_file_name);
});
//
//
//
router.get('/get_template', function (req, res) {
    console.log('in get_template')
    var template = ''
    var template_path = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS,template)
    console.log(template_path)
});

//
//  FUNCTIONS 
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

  fs.writeFile(config_file, new_config_txt, function writeConfigFile(err) {
        if (err) {
          console.log("err 11: ");
          console.log(err);
          res.send(err);
        } else {
          console.log('write new config file success');
            if (has_new_pname) {
            // now change the directory name if the project_name is being updated
              old_base_dir = config_info.old_base_name;
              new_base_name = config_info.baseoutputdir;
              fs.move(old_base_dir, new_base_dir, function moveFile(err) {
                if (err) {
                  console.log("err 12: ");
                  console.log(err);
                  res.send(err);
                } else {

                  update_dataset_names(config_info);
                  req.flash('success', msg);
                  res.redirect('/user_data/your_projects');

                }

              });
          } else {

            update_dataset_names(config_info);
            req.flash('success', msg);
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
          fs.move(old_name_path, new_name_path, function moveFile(err) {
            if (err) {
              console.log('WARNING failed to move dataset name '+err.toString());
            } else {
              console.log('moving '+config_info.datasets[n].oldname+' to '+config_info.datasets[n].dsname);
            }
          });


    }
}
//
//
//
//
//

module.exports = router;
