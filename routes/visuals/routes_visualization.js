const express = require('express');
const router = express.Router();

const util = require('util');
const url  = require('url');
const http = require('http');
const path = require('path');
const fs   = require('fs-extra');
// const open = require('open');
//const async = require('async');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({});
const zlib = require('zlib');
const Readable = require('readable-stream').Readable;
const multer    = require('multer');
const config  = require(app_root + '/config/config');
const upload = multer({ dest: config.TMP, limits: { fileSize: config.UPLOAD_FILE_SIZE.bytes }  });
const helpers = require('../helpers/helpers');
const QUERY = require('../queries');

const COMMON  = require('./routes_common');
const C = require('../../public/constants');
const META    = require('./routes_visuals_metadata');
const IMAGES = require('../routes_images');
//const PCOA    = require('./routes_pcoa');
// const MTX     = require('./routes_counts_matrix');
const biom_matrix_controller = require(app_root + '/controllers/biomMatrixController');
//const HMAP    = require('./routes_distance_heatmap');
//const DEND    = require('./routes_dendrogram');
//const BCHARTS = require('./routes_bar_charts');
//const PCHARTS = require('./routes_pie_charts');
//const CTABLE  = require('./routes_counts_table');
//const PythonShell = require('python-shell');
const spawn = require('child_process').spawn;
const app = express();
// GLOBALS
// PROJECT_TREE_PIDS = []
// PROJECT_TREE_OBJ = []
// DATA_TO_OPEN = {};
//const xmldom = require('xmldom');

// // init_node const node_class =
// const CustomTaxa  = require('./custom_taxa_class');


//
//  V I E W  S E L E C T I O N
//
//TODO: fix JSHint: This function's cyclomatic complexity is too high. (31) (W074)
router.post('/view_selection', [helpers.isLoggedIn, upload.single('upload_files', 12)], function(req, res) {
   console.log('in POST view_selection');

    // let url_parts = url.parse(req.url, true);
//     let query = url_parts.query;
    //console.log('query', req.query)
    //console.log('file',req.file)
    //console.log('body',req.body);
    //console.log('upload',upload.single('upload_files', 12))
  // This page (view_selection) comes after the datasets and units have been selected
  //    in the previous two pages.
  // It should be protected with isLoggedIn like /unit_selection below.
  // The function call will look like this when isLoggedIn is in place:
  //            router.post('/view_selection', isLoggedIn, function(req, res) {
  // This page is where the user will choose to view his/her selected visuals.
  // The left side will show a synopsis of what choices the user has made:
  //    datasets, normalization, units and any specifics such as tax rank, domain, NAs ....
  // The middle section will have a list of buttons allowing download of files
  // And the right side will have links to the previously selected visuals.
  // Before this page is rendered the visuals should have been created using the functions called below.
  // The visual pages will be created in a public directory and each page will have a random number or timestamp
  //    attached so the page is private and can be deleted later.
  // TESTING:
  //    There should be one or more datasets shown in list
  //    There should be one or more visual choices shown.
  //
  //let body = JSON.parse(req.body);
  //if (typeof visual_post_items == undefined){
    let visual_post_items = {};
  //}
  // if (req.body.unit_choice == 'tax_rdp2.6_simple'){
//     delete req.body[C.default_taxonomy.name+'_domains']
//   }else if (req.body.unit_choice == 'tax_'+C.default_taxonomy.name+'_simple'){
//     delete req.body['rdp2.6_domains']
//   }
  console.log(req.user.username+' req.body: view_selection body-->>');
  if (req.CONFIG.site === 'vamps') {
      console.log('VAMPS PRODUCTION -- no print to log');
  } else {
    console.log('req.body');
    console.log(req.body);
  }
  console.log('<<--req.body: view_selection');

  helpers.start = process.hrtime();
  let image_to_open = {};
  let dataset_ids = [];
  let new_dataset_ids = [];
  if (req.body.api === '1'){
        console.log('From: API-API-API');
        visual_post_items = COMMON.default_post_items();
        // Change defaults:
        req.session.normalization = visual_post_items.normalization = req.body.normalization          || "none";
        req.session.selected_distance = visual_post_items.selected_distance = req.body.selected_distance  || "morisita_horn";
        req.session.tax_depth   = visual_post_items.tax_depth = req.body.tax_depth                  || "phylum";
        req.session.domains     = visual_post_items.domains = req.body.domains                      || ["Archaea", "Bacteria", "Eukarya", "Organelle", "Unknown"];
        req.session.include_nas = visual_post_items.include_nas = req.body.include_nas              || "yes";
        req.session.min_range   = visual_post_items.min_range = req.body.min_range                  || '0';
        req.session.max_range   = visual_post_items.max_range = req.body.max_range                  || '100';

        if ((req.body).hasOwnProperty('ds_order') && req.body.ds_order.length !== 0){
            console.log('Found api dids ',req.body.ds_order);
            try {
                dataset_ids = JSON.parse(req.body.ds_order);
            }
            catch(e){
                dataset_ids = req.body.ds_order;
            }
            new_dataset_ids = helpers.screen_dids_for_permissions(req, dataset_ids);
            dataset_ids = new_dataset_ids;
            req.session.chosen_id_order = visual_post_items.ds_order = dataset_ids;
        }else if ( (req.body).hasOwnProperty('project') && PROJECT_INFORMATION_BY_PNAME.hasOwnProperty(req.body.project) ){
            console.log('Found api project ',req.body.project);
            let pid = PROJECT_INFORMATION_BY_PNAME[req.body.project].pid;
            new_dataset_ids = helpers.screen_dids_for_permissions(req, DATASET_IDS_BY_PID[pid.toString()]);
            visual_post_items.ds_order = new_dataset_ids;
            console.log(PROJECT_INFORMATION_BY_PNAME[req.body.project]);
            console.log(visual_post_items.ds_order);
            req.session.chosen_id_order = dataset_ids = visual_post_items.ds_order;
            //console.log('dids',dataset_ids)
        } else {
            console.log('API ALERT - no dids or project');
            return;
        }

        visual_post_items.update_data = req.body.update_data              || '1';   // fires changes

        req.session.no_of_datasets  = visual_post_items.no_of_datasets = dataset_ids.length;

        // for API select ALL metadata with these datasets
        let md = {}; // hash lookup unique
        for (let n in dataset_ids){
            let did = dataset_ids[n];
            for (let item in AllMetadata[did]){
                md[item] =1;
            }
        }
        req.session.metadata  = visual_post_items.metadata = Object.keys(md);

  }
  else if (req.body.restore_image === '1'){
        console.log('in view_selection RESTORE IMAGE');
  }
  else if (req.body.cancel_resort === '1'){
        console.log('resorted canceled');
        req.flash('success','Canceled Resort.');
        dataset_ids = JSON.parse(req.body.ds_order);

  }
  else if (req.body.update_data === '1'){  // from 'Update' button on view_selection.html
        console.log('Update Data');
        // populate req.session and visual_post_items from req.body(post)
        dataset_ids = req.session.chosen_id_order;
        visual_post_items = COMMON.save_post_items(req);
        for (let item in visual_post_items){
            req.session[item] = visual_post_items[item];
        }
        //console.log('XXXXXXXXXXX-VPI')
        //console.log(visual_post_items)

  }else if (req.body.resorted === '1'){
        console.log('resorted == 1');
        // populate visual_post_items from req.session (except new ds_order)
        req.flash('success','The dataset order has been updated.');
        dataset_ids = req.body.ds_order;
        req.session.chosen_id_order = dataset_ids;
        visual_post_items.unit_choice = req.session.unit_choice;
        visual_post_items.no_of_datasets = dataset_ids.length;
        visual_post_items.normalization = req.session.normalization;
        visual_post_items.selected_distance = req.session.selected_distance;
        visual_post_items.tax_depth = req.session.tax_depth;
        visual_post_items.include_nas = req.session.include_nas;
        visual_post_items.min_range = req.session.min_range;
        visual_post_items.max_range = req.session.max_range;
        visual_post_items.metadata = req.session.metadata;
        visual_post_items.domains = req.session.domains;
        visual_post_items.custom_taxa = req.session.custom_taxa;


  }else if (req.body.from_directory_configuration_file === '1'){
        // ALL Config files now loaded through GET (see router.get('/view_selection/:filename/:from_configuration_file')
        console.log('from_directory_configuration_file-POST');
        // populate visual_post_items from ?????
        let config_file_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, req.body.filename);
        let upld_obj = JSON.parse(fs.readFileSync(config_file_path, 'utf8'));
        //console.log(upld_obj)
        let config_file_data = create_clean_config(req, upld_obj); // put into req.session
        if (Object.keys(config_file_data).length === 0){
            //error
            res.redirect('saved_elements');
            return;
        }
        for (let item in config_file_data) {// TODO: copy the object faster
            req.session[item] = config_file_data[item];
        }
        dataset_ids = req.session.chosen_id_order;
        visual_post_items.unit_choice = req.session.unit_choice;
        visual_post_items.no_of_datasets = dataset_ids.length;
        visual_post_items.normalization = req.session.normalization;
        visual_post_items.selected_distance = req.session.selected_distance;
        visual_post_items.tax_depth = req.session.tax_depth;
        visual_post_items.include_nas = req.session.include_nas;
        visual_post_items.min_range = req.session.min_range;
        visual_post_items.max_range = req.session.max_range;
        visual_post_items.metadata = req.session.metadata;
        visual_post_items.domains = req.session.domains;
        visual_post_items.custom_taxa = req.session.custom_taxa;
        visual_post_items.update_data = 1;
  }
  else if (req.body.from_upload_configuration_file === '1') {
        // UPLOAD Config file
        console.log('from_upload_configuration_file-POST');
        // populate visual_post_items from ????
        // For this we need the upload.single('upload_files', 12) in the post definition
        let upload_file = req.file.path;
        let upld_obj = JSON.parse(fs.readFileSync(upload_file, 'utf8'));//,function(err, data){
        let config_file_data = create_clean_config(req, upld_obj); // put into req.session
        if (Object.keys(config_file_data).length === 0){
            //error
            res.redirect('saved_elements');
            return;
        }
        for (let item in config_file_data) {//TODO: already done above - DRY
            req.session[item] = config_file_data[item];
        }
        dataset_ids = req.session.chosen_id_order;
        visual_post_items.unit_choice = req.session.unit_choice;
        visual_post_items.no_of_datasets = dataset_ids.length;
        visual_post_items.normalization = req.session.normalization;
        visual_post_items.selected_distance = req.session.selected_distance;
        visual_post_items.tax_depth = req.session.tax_depth;
        visual_post_items.include_nas = req.session.include_nas;
        visual_post_items.min_range = req.session.min_range;
        visual_post_items.max_range = req.session.max_range;
        visual_post_items.metadata = req.session.metadata;
        visual_post_items.domains = req.session.domains;
        visual_post_items.custom_taxa = req.session.custom_taxa;
        visual_post_items.update_data = 1;


        //let image_to_open = load_configuration_file(req, res, config_file_data)
        // FIXME need datasets from config file


  } else {
        // DONE Direct from unit_select
        console.log('DEFAULT req.body');
        visual_post_items = COMMON.save_post_items(req);
        //console.log('visual_post_items')
        //console.log(visual_post_items)
        dataset_ids = req.session.chosen_id_order;
        req.session.no_of_datasets = dataset_ids.length;
        req.session.metadata = visual_post_items.metadata;
        req.session.normalization = "none";
        req.session.selected_distance = "morisita_horn";
        req.session.tax_depth = req.body.tax_depth;
        req.session.domains = req.body.domains || [ 'Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown'];
        req.session.include_nas = "yes";
        req.session.min_range = '0';
        req.session.max_range = '100';
        req.session.unit_choice = req.body.unit_choice;
        req.session.custom_taxa = visual_post_items.custom_taxa;
  }

  // get dataset_ids the add names for biom file output:
  // chosen_id_order was set in unit_select and added to session variable
  visual_post_items.chosen_datasets = [];
  //visual_post_items.chosen_name_order = []
  for (let n in dataset_ids){
        let did = dataset_ids[n];
        let dname = DATASET_NAME_BY_DID[did];
        let pname = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;
        visual_post_items.chosen_datasets.push( { did:did,name:pname+'--'+dname } );
  }

  // let file_found_error = false;
  // for (let i in dataset_ids){
//     let did = dataset_ids[i]
//     console.log('looking through dataset_ids:'+did.toString())
//      }

  let timestamp = +new Date();  // millisecs since the epoch!
  timestamp = req.user.username + '_' + timestamp;
  visual_post_items.ts = timestamp;
  req.session.ts = timestamp;
  // let distance_matrix = {};

  console.log('VS--visual_post_items and id-hash:>>');
  if (req.CONFIG.site === 'vamps' ){
      console.log('VAMPS PRODUCTION -- no print to log');
  } else {
    console.log('visual_post_items:');
    console.log(visual_post_items);
    console.log('req.session');
    console.log(req.session);

  }
  console.log('<<VS--visual_post_items');
  console.log('entering MTX.get_biom_matrix');
  console.time("TIME: biom_matrix_new");
  const biom_matrix_obj = new biom_matrix_controller.BiomMatrix(req, visual_post_items);
  let biom_matrix = biom_matrix_obj.biom_matrix;
  console.timeEnd("TIME: biom_matrix_new");
  // // console.time("TIME: biom_matrix old refactored");
  // let biom_matrix = MTX.get_biom_matrix(req, visual_post_items);
  // // console.timeEnd("TIME: biom_matrix old refactored");
  //console.log('8')
  visual_post_items.max_ds_count = biom_matrix.max_dataset_count;
  //console.log('9')
  if (visual_post_items.metadata.indexOf('primer_suite') !== -1){
      visual_post_items.metadata.push('primers');
  }
  let metadata = META.write_mapping_file(visual_post_items);


  console.log('image to open', image_to_open);
//console.log('biom_matrix',biom_matrix);
  // function see below
  //render_view_selection(res, req, metadata, image_to_open)
  let needed_constants = helpers.retrieve_needed_constants(C,'view_selection');

  res.render('visuals/view_selection', {
                                title           : 'VAMPS: Visuals Select',
                                referer         : 'unit_selection',
                                matrix          : JSON.stringify(biom_matrix),
                                metadata        : JSON.stringify(metadata),
                                constants       : JSON.stringify(needed_constants),
                                post_items      : JSON.stringify(visual_post_items),
                                user            : req.user,
                                hostname        : req.CONFIG.hostname,
                                token           : req.CONFIG.MAPBOX_TOKEN,
                                image_to_render : JSON.stringify(image_to_open),
             });

});
//
// Load Configuration File
// TODO: JSHint: This function's cyclomatic complexity is too high. (12) (W074)
function load_configuration_file(req, res, config_file_data )
{
    console.log('config_file_data');
    console.log(config_file_data);
    //req.session = config_file_data
     let image_to_open = {};


    const allowed_images = ["dheatmap", "piecharts", "barcharts", "counts_matrix", "metadata_table", "fheatmap", "dendrogram01", "dendrogram03", "pcoa", "pcoa3d", "geospatial", "adiversity"];

    if (allowed_images.indexOf(config_file_data.image) !== -1){
        console.log('FILE is IMAGE-2');
    }
    if (config_file_data.hasOwnProperty('image') ){
      console.log('FILE is IMAGE-1');
      image_to_open.image = config_file_data.image;
    }

    if (config_file_data.hasOwnProperty('phylum')){
      console.log('FILE is IMAGE (phyloseq bars or heatmap)');
      image_to_open.phylum = config_file_data.phylum;
    }
    else {
      console.log('FILE is CONFIG or IMAGE w/o phyloseq bars or heatmap');
    }
    let visual_post_items = config_file_data;
    let ids = config_file_data.id_name_hash.ids;
    let new_dataset_ids = helpers.screen_dids_for_permissions(req, ids);

    req.flash('success', 'Using data from configuration file.');
    console.log('in view_selection FROM CONFIG or IMAGE');


    visual_post_items.no_of_datasets = new_dataset_ids.length;
    for (let n in chosen_id_name_hash.ids){
        let did = chosen_id_name_hash.ids[n];
        let pid = PROJECT_ID_BY_DID[did];
        let pjds = PROJECT_INFORMATION_BY_PID[pid].project + '--' + DATASET_NAME_BY_DID[did];
        chosen_id_name_hash.names.push(pjds);
    }
    if (! config_file_data.hasOwnProperty('metadata') || config_file_data['metadata'].length === 0){
        visual_post_items.metadata = ['latitude','longitude'];
    }

    let files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE + "--datasets_" + C.default_taxonomy.name);

    for (let i in chosen_id_name_hash.ids){
      let did = chosen_id_name_hash.ids[i];
      try {
            if (visual_post_items.unit_choice === 'tax_rdp2.6_simple'){
                files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_rdp2.6");
            }
            let path_to_file = path.join(files_prefix, did.toString() +'.json');

            try {
              let jsonfile = require(path_to_file);
            }
            catch(e1){
              try {
                let files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_generic");
                // TODO: dataset_ids is not deined?
                let path_to_file = path.join(files_prefix, dataset_ids[i] +'.json');
                let jsonfile = require(path_to_file);
              }
              catch(e2) {
                console.log('2-no file '+e2.toString()+' Exiting');
                req.flash('fail', `ERROR 
                Dataset file not found '${dataset_ids[i]}.json' This means that one or more datasets do not have counts or sequences represented and some visuals on this page may not function.`);
            //res.redirect('visuals_index');
            //return;
              }
            }
            TAXCOUNTS[did] = jsonfile['taxcounts'];
            METADATA[did]  = jsonfile['metadata'];
      }
      catch(err){
        console.log('2-no file '+err.toString()+' Exiting');
        req.flash('fail', `ERROR 
          Dataset file not found '${dataset_ids[i]}.json' This means that one or more datasets do not have counts or sequences represented and some visuals on this page may not function.`);
      }
    }
    return image_to_open;
}

//
//  Create Clean Configuration File (From file upload)
//
//TODO: JSHint: This function's cyclomatic complexity is too high. (30) (W074)
function create_clean_config(req, upld_obj)
{
  //fs.readFile(upload_file, 'utf8',function(err, data){
        //if (err){ return err }

  let timestamp = +new Date();
  let ts = req.user.username  + '_'+timestamp;
  let clean_obj = {};
  clean_obj.ts = ts;
  let new_filename = "";

  if (upld_obj.hasOwnProperty('image')) {
    console.log('1) FILE is IMAGE');
    clean_obj.image = upld_obj.image;
    new_filename = 'image-' + clean_obj.image + '-' + clean_obj.ts + '.json';
  } else {
    console.log('2) FILE is CONFIG');
    new_filename = 'configuration-' + timestamp + '.json';
  }

  if (! upld_obj.hasOwnProperty('chosen_id_order')) {
      req.flash('fail', "This doesn't look like a well formatted JSON Configuration file");
      return {};
  }

  let ids = upld_obj.chosen_id_order;
  let new_dataset_ids = helpers.screen_dids_for_permissions(req, ids);
  if (! upld_obj.hasOwnProperty('source') && upld_obj.source.substring(0, 4) !== 'vamps'){
    req.flash('fail', "This doesn't look like a well formatted JSON Configuration file");
    return {};
  }
  if (new_dataset_ids.length === 0){
    req.flash('fail', 'There are no active datasets (or you do not have the correct permissions) to load');
    return {};

  } else {
    // move the file ASIS to the CONFIG.USER_FILES_BASE location
    clean_obj.chosen_id_order = new_dataset_ids;
    clean_obj.no_of_datasets = new_dataset_ids.length;

    // ADD DEFAULTS if needed
    if (! upld_obj.hasOwnProperty('metadata') || upld_obj.metadata.length === 0){
      clean_obj.metadata = ['latitude','longitude'];
    } else {
      clean_obj.metadata = upld_obj.metadata;
    }
    clean_obj.unit_choice = 'tax_'+C.default_taxonomy.name+'_simple';
    clean_obj.custom_taxa = ["NA"];
    const allowed_norms = ['none', 'maximum', 'frequency'];
    if (! upld_obj.hasOwnProperty('normalization') || allowed_norms.indexOf(upld_obj.normalization) === -1){
      clean_obj.normalization = 'none';
    } else {
      clean_obj.normalization = upld_obj.normalization;
    }
    const allowed_distance_metrics = ['jaccard','kulczynski','canberra','morisita_horn','bray_curtis'];
    if (! upld_obj.hasOwnProperty('selected_distance') || allowed_distance_metrics.indexOf(upld_obj.selected_distance) === -1){
      clean_obj.selected_distance = 'morisita_horn';
    } else {
      clean_obj.selected_distance = upld_obj.selected_distance;
    }
    const allowed_ranks = C.RANKS;
    if (! upld_obj.hasOwnProperty('tax_depth') || allowed_ranks.indexOf(upld_obj.tax_depth) === -1){
      clean_obj.tax_depth = 'phylum';
    } else {
      clean_obj.tax_depth = upld_obj.tax_depth;
    }
    const allowed_incnas = ['yes','no'];
    if (! upld_obj.hasOwnProperty('include_nas') || allowed_incnas.indexOf(upld_obj.include_nas) === -1){
      clean_obj.include_nas = 'yes';
    } else {
      clean_obj.include_nas = upld_obj.include_nas;
    }
    // DOMAINS
    let allowed_domains = C.DOMAINS.domains;
    if (! upld_obj.hasOwnProperty('domains') || upld_obj.domains.length === 0){
      clean_obj.domains = ["Archaea", "Bacteria", "Eukarya", "Organelle", "Unknown"];
    }
    else {
      let arr = [];
      for (let n in allowed_domains){
        if (upld_obj.domains.indexOf(allowed_domains[n].name) !== -1){
            arr.push(allowed_domains[n].name);
        }
      }
      clean_obj.domains = arr;
      if (upld_obj.domains.length === 0){
        clean_obj.domains = ["Archaea", "Bacteria", "Eukarya", "Organelle", "Unknown"];
      }
    }

    if (typeof upld_obj.min_range === 'string'){
      clean_obj.min_range = parseInt(upld_obj.min_range) || 0;
    }
    if (! upld_obj.hasOwnProperty('min_range') || upld_obj.min_range < 0  || upld_obj.min_range > 99) {
      clean_obj.min_range = 0;
    }
    if (typeof upld_obj.max_range === 'string'){
      clean_obj.max_range = parseInt(upld_obj.max_range) || 100;
    }
    if (! upld_obj.hasOwnProperty('max_range') || upld_obj.max_range < 1  || upld_obj.max_range > 100){
      clean_obj.max_range = 100;
    }

    let new_filename_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, new_filename);
    fs.writeFileSync(new_filename_path, JSON.stringify(clean_obj));
    return clean_obj;
  }
  //});
}
//
// U N I T  S E L E C T I O N
//
// use the isLoggedIn function to limit exposure of each page to
// logged in users only
// TODO: JSHint: This function's cyclomatic complexity is too high. (13) (W074)
router.post('/unit_selection', helpers.isLoggedIn, function(req, res) {
//router.post('/unit_selection',  function(req, res) {
  let error_msg = '';

  console.log(req.user.username+' req.body: unit_selection-->>');
  if (req.CONFIG.site === 'vamps' ){
    console.log('VAMPS PRODUCTION -- no print to log');
  } else {
    console.log(req.body);
  }
  console.log('req.body: unit_selection');
  if (typeof  unit_choice === 'undefined'){
    let unit_choice = 'tax_'+C.default_taxonomy.name+'_simple';
    console.log(unit_choice);
  }
  //let this_session_metadata = {}
  let dataset_ids = [];
  if (req.body.api === '1'){
    console.log('API-API-API');
    dataset_ids = JSON.parse(req.body.ds_order);
  }else if (req.body.resorted === '1'){
  	dataset_ids = req.body.ds_order;
  }else if (req.body.from_geo_search === '1'){
    dataset_ids = req.body.dids;
  } else {
    dataset_ids = JSON.parse(req.body.dataset_ids);
  }
  let needed_constants = helpers.retrieve_needed_constants(C,'unit_selection');
  let LoadFailureRequest = function (req, res) {
        // return to
        res.render('visuals/visuals_index', {
          title       : 'VAMPS: Select Datasets',
          subtitle    : 'Dataset Selection Page',
          proj_info   : JSON.stringify(PROJECT_INFORMATION_BY_PID),
          constants   : JSON.stringify(needed_constants),
          md_env_package : JSON.stringify(MD_ENV_PACKAGE),
          md_names    : AllMetadataNames,
          filtering   : 0,
          portal_to_show : '',
          data_to_open: JSON.stringify(DATA_TO_OPEN),
          user        : req.user,
          hostname    : req.CONFIG.hostname,
      });
    };
  // I call this here and NOT in view_selection
  // A user can jump here directly from geo_search
  // However a user can jump directly to view_select from
  // saved datasets or configuration which they could conceivably manipulate
  dataset_ids = helpers.screen_dids_for_permissions(req, dataset_ids);

  if (req.CONFIG.site === 'vamps' ){
    console.log('VAMPS PRODUCTION -- no print to log');
  } else {
    console.log('dataset_ids '+dataset_ids);
  }
  if (dataset_ids === undefined || dataset_ids.length === 0){
      console.log('redirecting back -- no data selected');
   	  req.flash('fail', 'Select Some Datasets');
   	  LoadFailureRequest(req, res);
      return;
  }
  else {
    // let available_units = C.AVAILABLE_UNITS; // ['med_node_id','otu_id','taxonomy_gg_id']

    // GLOBAL Variable

    req.session.chosen_id_order   = dataset_ids;

    // Thes get only the names of the available metadata:
    let custom_metadata_headers   = COMMON.get_metadata_selection(dataset_ids, 'custom');
    let required_metadata_headers = COMMON.get_metadata_selection(dataset_ids, 'required');

     // Gather just the tax data of selected datasets
    let chosen_dataset_order = [];

    for (let i in req.session.chosen_id_order){
      let did = req.session.chosen_id_order[i];
      let dname = DATASET_NAME_BY_DID[did];
      let pname = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;

      chosen_dataset_order.push( { did:did, name:pname+'--'+dname } );  // send this to client

      // !!!use default taxonomy here (may choose other on this page)
      let files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_"+C.default_taxonomy.name);
      let path_to_file = path.join(files_prefix, did +'.json');
      try {
          let jsonfile = require(path_to_file);
          //this_session_metadata[did]  = jsonfile['metadata'];
      }
      catch(err){
          console.log(err);
          let pid = PROJECT_ID_BY_DID[dataset_ids[i]];
          let pname = PROJECT_INFORMATION_BY_PID[pid].project;
          let dname = DATASET_NAME_BY_DID[did];
          //this_session_metadata[did]  = {}
          error_msg = 'No Taxonomy found for this dataset ('+pname+'--'+dname+' (did:'+did+')) and possibly others. Try selecting other units.';
      }
    }

	 if (error_msg){
	    req.flash('fail', error_msg);
	 }
	  // benchmarking
	  helpers.start = process.hrtime();
	  helpers.elapsed_time("START: select from sequence_pdr_info and sequence_uniq_info-->>>>>>");

	  console.log('chosen_dataset_order-->');
	  if (req.CONFIG.site === 'vamps' ){
        console.log('VAMPS PRODUCTION -- no print to log');
      } else {
        console.log(chosen_dataset_order);
      }
	  console.log('<--chosen_dataset_order');

	  res.render('visuals/unit_selection', {
	                    title: 'VAMPS: Units Selection',
                        referer: 'visuals_index',
	                    chosen_datasets: JSON.stringify(chosen_dataset_order),
	                    constants    : JSON.stringify(needed_constants),
	                    md_cust      : JSON.stringify(custom_metadata_headers),  // should contain all the cust headers that selected datasets have
		  				md_req       : JSON.stringify(required_metadata_headers),   //
                        unit_choice  : unit_choice,
	                    user         : req.user,hostname: req.CONFIG.hostname,
	  });  // end render
  }
    // benchmarking
  helpers.elapsed_time(">>>>>>>> 4 After Page Render <<<<<<");


}); // end fxn

/*
 * GET visualization page.
 */
router.get('/visuals_index', helpers.isLoggedIn, function(req, res) {
    console.log('in GET visuals_index');
    // This page is arrived at using GET from the Main Menu
    // It will be protected usind the helpers.isLoggedIn function
    // TESTING:
    //      Should show the closed project list on initialize
    //      The javascript functions (load_project_select, set_check_project, open_datasets, toggle_selected_datasets)
    //        should work to open the project (show and check the datasets) when either the plus image is clicked or the
    //        checkbox is selected. Clicking the minus image should deselect the datasets and close the dataset list.
    //        While the project is open clicking on the project checkbox should toggle all the datasets under it.
    //      Clicking the submit button when no datasets have been selected should result in an alert box and a
    //      return to the page.
    //console.log(PROJECT_INFORMATION_BY_PID);
    console.log(req.user.username+' in GET req.body visuals_index');
    //console.log(req.body)

    //console.log(ALL_DATASETS);
    // GLOBAL
    SHOW_DATA = ALL_DATASETS;
    TAXCOUNTS = {}; // empty out this global variable: fill it in unit_selection
    METADATA  = {};
    unit_choice = 'tax_'+C.default_taxonomy.name+'_simple';
    // GLOBAL
    DATA_TO_OPEN = {};
    if (req.body.data_to_open){
      // open many projects
      let obj = JSON.parse(req.body.data_to_open);
      for (let pj in obj){
        let pid = PROJECT_INFORMATION_BY_PNAME[pj].pid;
        DATA_TO_OPEN[pid] = obj[pj];
      }
      //console.log('got data to open '+data_to_open)
    }else if (req.body.project){
      // open whole project
      DATA_TO_OPEN[req.body.project_id] = DATASET_IDS_BY_PID[req.body.project_id];
    }
    console.log('DATA_TO_OPEN');
    console.log(DATA_TO_OPEN);

    let needed_constants = helpers.retrieve_needed_constants(C,'visuals_index');
    res.render('visuals/visuals_index', {
        title       : 'VAMPS: Select Datasets',
        subtitle    : 'Dataset Selection Page',
        proj_info   : JSON.stringify(PROJECT_INFORMATION_BY_PID),
        constants   : JSON.stringify(needed_constants),
        md_env_package : JSON.stringify(MD_ENV_PACKAGE),
        md_names    : AllMetadataNames,
        filtering   : 0,
        portal_to_show : '',
        data_to_open: JSON.stringify(DATA_TO_OPEN),
        user        : req.user,
        hostname    : req.CONFIG.hostname,

    });
  });

router.post('/visuals_index', helpers.isLoggedIn, function(req, res) {
  console.log('in POST visuals_index '+ req.user.username);
  // This page is arrived at using GET from the Main Menu
  // It will be protected usind the helpers.isLoggedIn function
  // TESTING:
  //      Should show the closed project list on initialize
  //      The javascript functions (load_project_select, set_check_project, open_datasets, toggle_selected_datasets)
  //        should work to open the project (show and check the datasets) when either the plus image is clicked or the
  //        checkbox is selected. Clicking the minus image should deselect the datasets and close the dataset list.
  //        While the project is open clicking on the project checkbox should toggle all the datasets under it.
  //      Clicking the submit button when no datasets have been selected should result in an alert box and a
  //      return to the page.
  //console.log(PROJECT_INFORMATION_BY_PID);
  //console.log(req.body)

  //console.log(ALL_DATASETS);
  // GLOBAL
  SHOW_DATA = ALL_DATASETS;
  TAXCOUNTS = {}; // empty out this global variable: fill it in unit_selection
  METADATA  = {};
  let unit_choice = 'tax_'+C.default_taxonomy.name+'_simple';
  // GLOBAL
  DATA_TO_OPEN = {};
  if (req.body.data_to_open) {// TODO: DRY, the similar peace above
    // open many projects
    let obj = JSON.parse(req.body.data_to_open);
    for (let pj in obj){
      let pid = PROJECT_INFORMATION_BY_PNAME[pj].pid;
      DATA_TO_OPEN[pid] = obj[pj];
    }
    //console.log('got data to open '+data_to_open)
  }
  else if (req.body.project) {
    // open whole project
    DATA_TO_OPEN[req.body.project_id] = DATASET_IDS_BY_PID[req.body.project_id];
  }
  console.log('DATA_TO_OPEN');
  console.log(DATA_TO_OPEN);


  res.render('visuals/visuals_index', {
      title       : 'VAMPS: Select Datasets',
      subtitle    : 'Dataset Selection Page',
      proj_info   : JSON.stringify(PROJECT_INFORMATION_BY_PID),
      constants   : JSON.stringify(C),
      md_env_package : JSON.stringify(MD_ENV_PACKAGE),
      md_names    : AllMetadataNames,
      filtering   : 0,
      portal_to_show : '',
      data_to_open: JSON.stringify(DATA_TO_OPEN),
      user        : req.user,
      hostname    : req.CONFIG.hostname,

  });
});

//
//
//
router.post('/reorder_datasets', helpers.isLoggedIn, function(req, res) {

    let ts = req.session.ts;
    let selected_dataset_order = {};
    selected_dataset_order.names = [];
    selected_dataset_order.ids = [];
    for (let n in req.session.chosen_id_order){
        let did = req.session.chosen_id_order[n];
        let pjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project+'--'+DATASET_NAME_BY_DID[did];
        selected_dataset_order.names.push(pjds);
        selected_dataset_order.ids.push(did);
    }


    console.log(req.session);
    res.render('visuals/reorder_datasets', {
                                title   : 'VAMPS: Reorder Datasets',
                                selected_datasets: JSON.stringify(selected_dataset_order),
                                constants    : JSON.stringify(C),
								                referer: req.body.referer,
                                ts : ts,
                                user: req.user, hostname: req.CONFIG.hostname,
                            });

});
//
//
//
router.post('/view_saved_datasets', helpers.isLoggedIn, function(req, res) {
  // this fxn is required for viewing list of saved datasets
  // when 'toggle open button is activated'
  let fxn = req.body.fxn;
  //console.log('XX'+JSON.stringify(req.body));
  let file_path = path.join(req.CONFIG.USER_FILES_BASE, req.body.user, req.body.filename);
  console.log(file_path);
  // let dataset_ids = [];
  fs.readFile(file_path, 'utf8',function readFile(err,data) {
    if (err) {
        let msg = 'ERROR Message '+err;
        helpers.render_error_page(req,res,msg);
    } else {
      console.log(data);
      res.send(data);
    }
  });
});
router.post('/get_saved_datasets', helpers.isLoggedIn, function(req, res) {
  // this fxn is required for viewing list of saved datasets
  // when 'toggle open button is activated'
  console.log(req.body.filename);
  //console.log('XX'+JSON.stringify(req.body));
  let file_path = path.join(req.CONFIG.USER_FILES_BASE, req.body.user, req.body.filename);
  console.log(file_path);
  // let dataset_ids = [];
  fs.readFile(file_path, 'utf8',function readFile(err, data) {
    if (err) {
        let msg = 'ERROR Message ' + err;
        helpers.render_error_page(req,res,msg);
    } else {
      res.redirect('unit_selection');
    }
  });
});
//
//
//
router.post('/dendrogram', helpers.isLoggedIn, function(req, res) {
    console.log('found routes_dendrogram-x');
    ///// this vesion of dendrogram is or running d3 on CLIENT: Currently:WORKING
    ///// It passes the newick string back to view_selection.js
    ///// and tries to construct the svg there before showing it.
    console.log('req.body dnd');
    if (req.CONFIG.site === 'vamps' ){
        console.log('VAMPS PRODUCTION -- no print to log');
    } else {
      console.log(req.body);
    }
    console.log('req.body dnd');
    let ts = req.body.ts;
    let metric = req.body.metric;
    let script = req.body.script; // python, phylogram or phylonator
    let image_type = req.body.image_type;  // png(python script) or svg
    let pwd = req.CONFIG.PROCESS_DIR || req.CONFIG.PROCESS_DIR;
    //console.log('image_type '+image_type);
    // see:  http://bl.ocks.org/timelyportfolio/59acc3853b02e47e0dfc

    let biom_file_name = ts+'_count_matrix.biom';
    let biom_file = path.join(pwd,'tmp',biom_file_name);

    let html = '';
    let title = 'VAMPS';

    let distmtx_file_name = ts+'_distance.csv';
    let distmtx_file = path.join(pwd,'tmp',distmtx_file_name);


    let options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'dendrogram-'+image_type, '--basedir', pwd, '--prefix', ts ],
    };

    let log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
    console.log(options.scriptPath+'/distance_and_ordination.py '+options.args.join(' '));
    let dendrogram_process = spawn( options.scriptPath+'/distance_and_ordination.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true,
            //stdio: [ 'ignore', null, log ] // stdin, stdout, stderr
            stdio: 'pipe'  // stdin, stdout, stderr
    });

    let stdout = '';
    dendrogram_process.stdout.on('data', function dendrogramProcessStdout(data) {
        //
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stdout += data;

    });
    let stderr = '';
    dendrogram_process.stderr.on('data', function dendrogramProcessStderr(data) {
        console.log('stderr: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stderr += data;
    });

    // TODO: JSHint: This function's cyclomatic complexity is too high. (8) (W074)
    dendrogram_process.on('close', function dendrogramProcessOnClose(code) {
        console.log('dendrogram_process process exited with code ' + code);

      let newick = "";
        //let last_line = ary[ary.length - 1];
      if (code === 0){   // SUCCESS
        if (image_type === 'd3'){
          if (req.CONFIG.site === 'vamps' ){
            console.log('VAMPS PRODUCTION -- no print to log');
          }
          else {
            console.log('stdout: ' + stdout);
          }
          let lines = stdout.split('\n');
          for (let n in lines){
            if (lines[n].substring(0,6) === 'NEWICK' ){
              let tmp = lines[n].split('=');
              console.log('FOUND NEWICK ' + tmp[1]);

            }
          }

          try {
            //newick = JSON.parse(tmp[1]);
            newick = tmp[1]; //TODO: JSHint: 'tmp' is not defined. (W117) ???
            if (req.CONFIG.site === 'vamps' ){
              console.log('VAMPS PRODUCTION -- no print to log');
            } else {
              console.log('NWK->' + newick);
            }
          }
          catch(err){
            newick = {"ERROR":err};
          }
          res.send(newick);
        } else {  // 'pdf'
          let viz_width = 1200;
          let viz_height = (visual_post_items.no_of_datasets*12)+100;
          let image = '/'+ts+'_dendrogram.pdf';
          //console.log(image)
          html = "<div id='pdf'>";
          html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='100%' height='"+viz_height+"' />";
          html += " <p>ERROR in loading pdf file</p>";
          html += "</object></div>";
          res.send(html);
        }
      }
      else {
        console.log('stderr: ' + stderr);
        res.send('Script Error');
      }
    });




});

//
// P C O A
//
router.post('/pcoa', helpers.isLoggedIn, function(req, res) {
  console.log('in PCoA');
  //console.log(metadata);
  let ts = req.body.ts;
  let rando = Math.floor((Math.random() * 100000) + 1);  // required to prevent image caching
  let metric = req.body.metric;
  let image_type = req.body.image_type;
  //let image_file = ts+'_'+metric+'_pcoaR'+rando.toString()+'.pdf';
  let image_file = ts+'_pcoa.pdf';
  let biom_file_name = ts+'_count_matrix.biom';
  let biom_file = path.join(req.CONFIG.PROCESS_DIR,'tmp', biom_file_name);
  let pwd = req.CONFIG.PROCESS_DIR || req.CONFIG.PROCESS_DIR;
  let tmp_path = path.join(req.CONFIG.PROCESS_DIR,'tmp');
  let log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');

  let md1 = req.body.md1 || "Project";
  let md2 = req.body.md2 || "Description";

    // let options = {
    //   scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
    //   args :       [ '-in', biom_file, '-metric', metric, '--function', 'pcoa_2d', '--site_base', req.CONFIG.PROCESS_DIR, '--prefix', ts],
    // };
    let options2 = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ tmp_path, ts, metric, md1, md2, image_file],
    };
    console.log(options2.scriptPath+'/pcoa2.R '+options2.args.join(' '));

    let pcoa_process = spawn( options2.scriptPath+'/pcoa2.R', options2.args, {
        env:{ 'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
        detached: true,
        stdio: [ 'ignore', null, log ]
        //stdio: 'pipe' // stdin, stdout, stderr
    });

    pcoa_process.on('close', function pcoaProcessOnClose(code) {
        //console.log('pcoa_process process exited with code ' + code+' -- '+output);
        //distance_matrix = JSON.parse(output);
        //let last_line = ary[ary.length - 1];
        if (code === 0){   // SUCCESS

          //html = "<img src='/"+image_file+"'>";
          //let image = path.join('/tmp/',image_file);
          let html = "<div id='pdf'>";
          html += "<object data='/"+image_file+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='1000' height='600' />";
          html += " <p>ERROR in loading pdf file</p>";
          html += "</object></div>";
          //console.log(html);

        } else {
            console.log('ERROR');
            let html='PCoA Script Failure -- Try a deeper rank, or more metadata or datasets';
        }

        res.send(html);

      });




});
//
//  EMPEROR....
// POST is for PC file link
router.post('/pcoa3d', helpers.isLoggedIn, function(req, res) {

        let ts = req.session.ts;
        let pwd = req.CONFIG.PROCESS_DIR || req.CONFIG.PROCESS_DIR;
        let pc_file_name = ts+'_pc.txt';
            //let pc_file = path.join(pwd,'tmp', pc_file_name);
            ///////////////////////////////////////////////////
        console.log('POST in 3D');
        if (req.CONFIG.site === 'vamps' ){
            console.log('VAMPS PRODUCTION -- no print to log');
        }
        // else {
            //console.log(visual_post_items);
        // }

        let metric = req.session.selected_distance;

        // let pwd = req.CONFIG.PROCESS_DIR || req.CONFIG.PROCESS_DIR;
        let biom_file_name = ts+'_count_matrix.biom';
        let biom_file = path.join(pwd,'tmp', biom_file_name);

        let log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');

        let mapping_file_name = ts+'_metadata.txt';
        let mapping_file = path.join(pwd,'tmp', mapping_file_name);
        let pc_file = path.join(pwd,'tmp', pc_file_name);
        //let tax_file_name = ts+'_taxonomy.txt';
        //let tax_file = path.join(pwd,'tmp', tax_file_name);
        let dist_file_name = ts+'_distance.csv';
        let dist_file = path.join(pwd,'tmp', dist_file_name);

        let dir_name = ts+'_pcoa3d';
        let dir_path = path.join(pwd,'views/tmp', dir_name);
        let html_path = path.join(dir_path, 'index.html');  // file to be created by make_emperor.py script
        //let html_path2 = path.join('../','tmp', dir_name, 'index.html');  // file to be created by make_emperor.py script
        let options1 = {
            scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
            args :       [ '-in', biom_file, '-metric', metric, '--function', 'pcoa_3d', '--basedir', pwd, '--prefix', ts,'-m', mapping_file],
        };
        //  let options2 = {
        //       //scriptPath : req.CONFIG.PATH_TO_QIIME_BIN,
        //       scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
        //       args :       [ '-i', pc_file, '-m', mapping_file, '-o', dir_path],
        //   };
        console.log('outdir: '+dir_path);
        console.log(options1.scriptPath+'/distance_and_ordination.py '+options1.args.join(' '));


  let pcoa_process = spawn( options1.scriptPath+'/distance_and_ordination.py', options1.args, {
      env:{ 'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
      detached: true,
      stdio:['pipe', 'pipe', 'pipe']
      //stdio: [ 'ignore', null, log ]
        });  // stdin, stdout, stderr

        pcoa_process.stdout.on('data', function pcoaProcessStdout(data) {
            //console.log('1stdout: ' + data);
        });
        let stderr1 = '';
        pcoa_process.stderr.on('data', function pcoaProcessStderr(data) {
                console.log('1stderr-POST: ' + data);
                stderr1 += data;
                //res.send(stderr1);
                //return;
        });
        pcoa_process.on('close', function pcoaProcessOnClose(code) {
                console.log('pcoa_process1 process exited with code ' + code);

                if (code === 0){    // SUCCESS


                            let html = "** <a href='/tmp/"+dir_name+"/index' target='_blank'>Open Emperor</a> **";
                            html += "<br>Principal Components File: <a href='/"+pc_file_name+"'>"+pc_file_name+"</a>";
                            html += "<br>Biom File: <a href='/"+biom_file_name+"'>"+biom_file_name+"</a>";
                            html += "<br>Mapping (metadata) File: <a href='/"+mapping_file_name+"'>"+mapping_file_name+"</a>";
                            html += "<br>Distance File: <a href='/"+dist_file_name+"'>"+dist_file_name+"</a>";
                            //html += " <a href='../tmp/"+dir_name+"/index' target='_blank'>Emperor5</a>"

                            res.send(html);




                } else {
                    //console.log('ERROR');
                    res.send('Python Script Error: '+stderr1);
                }
        });
        /////////////////////////////////////////////////



});


//
// DATA BROWSER
//
router.get('/dbrowser', helpers.isLoggedIn, function(req, res) {
  let ts = req.session.ts;
  console.log('in dbrowser');
  console.log(req.session);
  let html='';
  let matrix_file_path = path.join(config.PROCESS_DIR,'tmp',ts + '_count_matrix.biom');
  let biom_matrix = JSON.parse(fs.readFileSync(matrix_file_path, 'utf8'));
  let max_total_count = Math.max.apply(null, biom_matrix.column_totals);

  //console.log('max_total_count '+max_total_count.toString());

  // sum counts
  let sumator = get_sumator(req, biom_matrix);

  //console.log(JSON.stringify(sumator))

  for (let d in sumator['domain']) {

    // #### DOMAIN ####
    //let dnode_name =  dname
    html += "<node name='"+d+"'>\n";
    html += " <seqcount>";
    for (let c_domain in sumator['domain'][d]['knt']) {
        html += "<val>"+sumator['domain'][d]['knt'][c_domain].toString()+"</val>";
    }
      html += "</seqcount>\n";
      html += " <rank><val>domain</val></rank>\n";

      // #### PHYLUM ####
      for (let p in sumator['domain'][d]['phylum']){
        html += " <node name='" + p + "'>\n";
        html += "  <seqcount>";
        for (let c_phylum in sumator['domain'][d]['phylum'][p]['knt']){
            html += "<val>"+sumator['domain'][d]['phylum'][p]['knt'][c_phylum].toString() + "</val>";
        }
        html += "</seqcount>\n";
        html += "  <rank><val>phylum</val></rank>\n";
        ///
        // #### KLASS ####
        for (let k in sumator['domain'][d]['phylum'][p]['klass'])
        {
          html += "  <node name='" + k + "'>\n";
          html += "   <seqcount>";
          for (let c_klass in sumator['domain'][d]['phylum'][p]['klass'][k]['knt']){
              html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][c_klass].toString()+"</val>";
          }
          html += "</seqcount>\n";
          html += "   <rank><val>klass</val></rank>\n";

            // #### ORDER ####
          for (let o in sumator['domain'][d]['phylum'][p]['klass'][k]['order']) {
            html += "   <node name='" + o + "'>\n";
            html += "    <seqcount>";
            for (let c_order in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt']) {
              html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][c_order].toString()+"</val>";
            }
            html += "</seqcount>\n";
            html += "    <rank><val>order</val></rank>\n";

            // #### FAMILY ####
            for (let f in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family']){
              html += "    <node name='"+f+"'>\n";
              html += "     <seqcount>";
              // TODO: JSHint: Blocks are nested too deeply. (6) (W073)
              for (let c_family in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt']) {
                  html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][c_family].toString()+"</val>";
              }
              html += "</seqcount>\n";
              html += "     <rank><val>family</val></rank>\n";

              // #### GENUS ####
              for (let g in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus']) {
                html += "     <node name='"+g+"'>\n";
                html += "      <seqcount>";
                for (let c_genus in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt']){
                    html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][c_genus].toString()+"</val>";
                }
                html += "</seqcount>\n";
                html += "      <rank><val>genus</val></rank>\n";

                // #### SPECIES ####
                for (let s in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species']) {
                  html += "     <node name='" + s + "'>\n";
                  html += "      <seqcount>";
                  for (let c_species in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt']){
                      html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][c_species].toString()+"</val>";
                  }
                  html += "</seqcount>\n";
                  html += "      <rank><val>species</val></rank>\n";

                  // #### STRAIN ####
                  for (let st in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']){
                        html += "     <node name='"+st+"'>\n";
                        html += "      <seqcount>";
                        for (let c_strain in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt']){
                            html += "<val>"+sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][c_strain].toString()+"</val>";
                }
                html += "</seqcount>\n";
                html += "      <rank><val>strain</val></rank>\n";
///// DONE //////
                html += "     </node>\n";
                  }  // end strain
                  html += "     </node>\n";
                }  // end species
                html += "     </node>\n";
              }  // end genus
              html += "    </node>\n";
            }  // end family
            html += "   </node>\n";
          }  // end order
          html += "  </node>\n";
        }  // end klass
        html += " </node>\n";
      }  // end phylum
      html += "</node>\n";
  }    // end domain
  html += "  </node>\n";


  // write html to a file and open it

  console.log("render visuals/dbrowser");
  //let file_name = ts+'_krona.html';
  //let html_path = path.join(req.CONFIG.PROCESS_DIR,'tmp', file_name);

  res.render('visuals/dbrowser', {
    title: 'VAMPS:Taxonomy Browser (Krona)',
    user:                req.user,
    html:                html,
    max_total_count:     max_total_count,
    matrix:              JSON.stringify(biom_matrix)

  });
});
//
// OLIGOTYPING
//
router.post('/oligotyping', helpers.isLoggedIn, function(req, res) {
    let ts = req.session.ts;
    console.log('in POST oligotyping');

    let html='';
    let matrix_file_path = path.join(config.PROCESS_DIR,'tmp',ts+'_count_matrix.biom');
    let biom_matrix = JSON.parse(fs.readFileSync(matrix_file_path, 'utf8'));
    let max_total_count = Math.max.apply(null, biom_matrix.column_totals);

    //console.log('max_total_count '+max_total_count.toString());


    // write html to a file and open it

    console.log("render visuals/oligotyping");
    //let file_name = ts+'_krona.html';
    //let html_path = path.join(req.CONFIG.PROCESS_DIR,'tmp', file_name);

    res.render('visuals/oligotyping', {
      title: 'VAMPS:Oligotyping',
      html:                html,
      max_total_count:     max_total_count,
      matrix:              JSON.stringify(biom_matrix),
      //chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
      user :  req.user, hostname : req.CONFIG.hostname,

    });


});


//
//
//
router.post('/phyloseq', helpers.isLoggedIn, function(req, res) {
    console.log('in phyloseq post');
    //console.log(req.body)

    let ts = req.body.ts;
    let rando = Math.floor((Math.random() * 100000) + 1);  // required to prevent image caching
    let dist_metric = req.body.metric;
    let plot_type = req.body.plot_type;
    let image_file = ts+'_phyloseq_'+plot_type+'_'+rando.toString()+'.svg';
    let phy,md1,md2,ordtype,maxdist,script;

    let pwd = req.CONFIG.PROCESS_DIR || req.CONFIG.PROCESS_DIR;
    let fill = req.session.tax_depth.charAt(0).toUpperCase() + req.session.tax_depth.slice(1);
    if (fill === 'Klass'){
        fill = 'Class';
    }
    let tmp_path = path.join(req.CONFIG.PROCESS_DIR,'tmp');
    let html = '';
    //console.log(biom_file)
    let options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ tmp_path, ts ],
    };
    if (plot_type == 'bar'){
      script = 'phyloseq_bar.R';
      phy = req.body.phy;
      options.args = options.args.concat([image_file, phy, fill]);
    }else if (plot_type == 'heatmap'){
      script = 'phyloseq_heatmap.R';
      //image_file = ts+'_phyloseq_'+plot_type+'_'+rando.toString()+'.png';
      phy = req.body.phy;
      md1 = req.body.md1;
      ordtype = req.body.ordtype;
      options.args = options.args.concat([image_file, dist_metric, phy, md1, ordtype, fill]);
    }else if (plot_type == 'network'){
      script = 'phyloseq_network.R';
      md1 = req.body.md1 || "Project";
      md2 = req.body.md2 || "Description";
      maxdist = req.body.maxdist || "0.3";
      options.args = options.args.concat([image_file, dist_metric, md1, md2, maxdist]);
    }else if (plot_type == 'ord'){
      script = 'phyloseq_ord.R';
      md1 = req.body.md1 || "Project";
      md2 = req.body.md2 || "Description";
      ordtype = req.body.ordtype || "PCoA";
      options.args = options.args.concat([image_file, dist_metric, md1, md2, ordtype]);
    }else if (plot_type == 'tree'){
      script = 'phyloseq_tree.R';
      md1 = req.body.md1 || "Description";
      options.args = options.args.concat([image_file, dist_metric, md1]);
    } else {
      //ERROR
    }
    let log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');

    console.log(path.join(options.scriptPath, script)+' '+options.args.join(' '));
    let phyloseq_process = spawn( path.join(options.scriptPath, script), options.args, {
            env:{'PATH':req.CONFIG.PATH},
            detached: true,
            //stdio: [ 'ignore', null, log ]
            stdio: 'pipe'  // stdin, stdout, stderr
    });
    stdout = '';
    lastline='';
    phyloseq_process.stdout.on('data', function phyloseqProcessStdout(data) {
        lastline = data;
        stdout += data;
    });
    stderr = '';
    phyloseq_process.stderr.on('data', function phyloseqProcessStderr(data) {
        stderr += data;
    });
    phyloseq_process.on('close', function phyloseqProcessOnClose(code) {
          console.log('phyloseq_process process exited with code ' + code);
          //distance_matrix = JSON.parse(output);
          //let last_line = ary[ary.length - 1];
          if (code === 0){   // SUCCESS
            console.log('last: '+lastline);
            if (lastline.toString().substring(0,5) == 'ERROR'){
                    console.log('ERROR-1');
                    html = lastline;
            } else {

              //   let image = '/'+ts+'_heatmap.pdf';
              // //console.log(image)
              // html = "<div id='pdf'>";
              // html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='100%' height='700' />";
              // html += " <p>ERROR in loading pdf file</p>";
              // html += "</object></div>";
              // res.send(html);

              // return;


                 if (plot_type == 'heatmap'){   // for some unknown reason heatmaps are different: use pdf not svg
                 //html = "<object  data='/"+image_file+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf'width='100%' height='700' >Your browser does not support SVG</object>";
                      html = "<div id='pdf'>";
                      html += "<object data='/"+image_file+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='100%' height='700' />";
                      html += " <p>ERROR in loading pdf file</p>";
                      html += "</object></div>";
                 } else {
                      html = "<img src='/"+image_file+"'  >";
                }
            }

          } else {
            console.log('ERROR-2');
            html = "Phyloseq Error: Try selecting more data, deeper taxonomy or excluding 'NA's"
          }
          //console.log(html);
          res.send(html);

    });

});

//
//  for dbrowser
//
function get_sumator(req, biom_matrix){

    let sumator = {};
    sumator['domain']={};

    for (let r in biom_matrix.rows){
        tax_string = biom_matrix.rows[r].id;
        tax_items = tax_string.split(';');
        key = tax_items[0];
        //console.log(tax_items);
        for (t in tax_items){
           let taxa = tax_items[t];
           let rank = C.RANKS[t];
           if (rank=='domain'){
               d = tax_items[t];
               for (i in req.session.chosen_id_order){
                   if (d in sumator['domain']){
                       if (i in sumator['domain'][d]['knt']){
                           sumator['domain'][d]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       } else {
                           sumator['domain'][d]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   } else {
                       sumator['domain'][d]={};
                       sumator['domain'][d]['phylum']={};
                       sumator['domain'][d]['knt']=[];
                       sumator['domain'][d]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                   }
               }
           }
           if (rank=='phylum'){
               p = tax_items[t];
               for (i in req.session.chosen_id_order){
                   if (p in sumator['domain'][d]['phylum']){
                       if (i in sumator['domain'][d]['phylum'][p]['knt']){
                           sumator['domain'][d]['phylum'][p]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       } else {
                           sumator['domain'][d]['phylum'][p]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   } else {
                       sumator['domain'][d]['phylum'][p]={};
                       sumator['domain'][d]['phylum'][p]['klass']={};
                       sumator['domain'][d]['phylum'][p]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                   }
               }
           }
           if (rank=='klass'){
               k = tax_items[t];
               for (i in req.session.chosen_id_order){
                   if (k in sumator['domain'][d]['phylum'][p]['klass']){
                       if (i in sumator['domain'][d]['phylum'][p]['klass'][k]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       } else {
                           sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   } else {
                       sumator['domain'][d]['phylum'][p]['klass'][k]={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                   }
               }
           }
           if (rank=='order'){
               o = tax_items[t];
               for (i in req.session.chosen_id_order){
                   if (o in sumator['domain'][d]['phylum'][p]['klass'][k]['order']){
                       if (i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       } else {
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   } else {
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                   }
               }
           }
           if (rank=='family'){
               f = tax_items[t];
               for (i in req.session.chosen_id_order){
                   if (f in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family']){
                       if (i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       } else {
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   } else {
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                   }
               }
           }
           if (rank=='genus'){
               g = tax_items[t];
               for (i in req.session.chosen_id_order){
                   if (g in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus']){
                       if (i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       } else {
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   } else {
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                   }
               }
           }
           if (rank=='species'){
               s = tax_items[t];
               for (i in req.session.chosen_id_order){
                   if (s in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species']){
                       if (i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       } else {
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   } else {
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]={};

                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                   }
               }
           }
           if (rank=='strain'){
               st = tax_items[t];
               for (i in req.session.chosen_id_order){
                   if (st in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']){
                       if (i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt']){
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][i] += parseInt(biom_matrix.data[r][i]);
                       } else {
                           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                       }
                   } else {
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]={};
                       //sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']={};
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt']=[];
                       sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][i] = parseInt(biom_matrix.data[r][i]);
                   }
               }
           }
        }
    }
    return sumator;
}



//
//  G E O S P A T I A L (see view_selection.js)
//


//
// B A R - C H A R T  -- S I N G L E
//
router.get('/bar_single', helpers.isLoggedIn, function(req, res) {
    console.log('in routes_viz/bar_single');
    let myurl = url.parse(req.url, true);
    //console.log('in piechart_single',myurl.query)
    //let ts = myurl.query.ts;
    let selected_did = myurl.query.did;
    let orderby = myurl.query.orderby || 'alphaDown'; // alpha, count
    let value = myurl.query.val || 'z'; // a,z, min, max
    let order = {orderby:orderby, value:value}; // orderby: alpha: a,z or count: min,max
    //let ds_items = pjds.split('--');
     //console.log('myurl.query')
     //console.log(myurl.query)
     //console.log('bar_single:session')
     //console.log(req.session)

    let pi = {};
    let selected_pjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[selected_did]].project +'--'+DATASET_NAME_BY_DID[selected_did];
    pi.chosen_datasets = [{did:selected_did, name:selected_pjds}];
    pi.no_of_datasets=1;
    pi.ts = req.session.ts;
    pi.unit_choice = req.session.unit_choice;
    pi.min_range = req.session.min_range;
    pi.max_range = req.session.max_range;
    pi.normalization = req.session.normalization;
    pi.tax_depth = req.session.tax_depth;
    pi.include_nas = req.session.include_nas;
    pi.domains = req.session.domains;
    let write_file = false;  // DO NOT OVERWRITE The Matrix File
    // let new_matrix = MTX.get_biom_matrix(req, pi, write_file);
    console.time("TIME: biom_matrix_new_from_bar_single");
    const biom_matrix_obj = new biom_matrix_controller.BiomMatrix(req, pi, write_file);
    let new_matrix = biom_matrix_obj.biom_matrix;
    console.timeEnd("TIME: biom_matrix_new_from_bar_single");

    new_matrix.dataset = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[selected_did]].project +'--'+DATASET_NAME_BY_DID[selected_did];
    new_matrix.did = selected_did;

    new_matrix.total = 0;


    //let idx = -1;



    new_matrix = helpers.sort_json_matrix(new_matrix, order);
    let new_order = {};
    if (order.orderby =='alpha' ){
      if (order.value == 'a'){
        new_order.alpha_value = 'z'
      } else {
        new_order.alpha_value = 'a'
      }
      new_order.count_value = ''
    } else {
      if (order.value == 'min'){
        new_order.count_value = 'max'
      } else {
        new_order.count_value = 'min'
      }
      new_order.alpha_value = ''
    }

    //console.log('order')
    //console.log(order)
    //console.log('new_order')
    //console.log(new_order)
    let timestamp = +new Date();  // millisecs since the epoch!
    let filename = req.user.username+'_'+selected_did+'_'+timestamp+'_sequences.json';
    let file_path = path.join('tmp',filename);
    //console.log(file_path)
    new_rows = {};
    new_rows[selected_did] = [];
    let LoadDataFinishRequest = function (req, res, project, display) {
        console.log('LoadDataFinishRequest in bar_single');
        if (pi.unit_choice == 'OTUs'){
            let title = 'OTU Count Data'
        } else {
            let title = 'Taxonomic Data'
        }
        res.render('visuals/user_viz_data/bar_single', {
              title     : title,
              ts        : timestamp,
              matrix    : JSON.stringify(new_matrix),
              post_items: JSON.stringify(pi),
              bar_type  : 'single',
              order     : JSON.stringify(new_order),
              //html: html,
              user: req.user, hostname: req.CONFIG.hostname,
          });
    };
    if ( pi.unit_choice == 'OTUs'){

        LoadDataFinishRequest(req, res, timestamp, new_matrix, new_order);

    } else {

        connection.query(QUERY.get_sequences_perDID([selected_did], pi.unit_choice), function mysqlSelectSeqsPerDID(err, rows, fields){
            if (err)  {
              console.log('Query error: ' + err);
              console.log(err.stack);
              res.send(err)
            } else {
              //console.log(rows)
              for (s in rows){
                  //rows[s].seq = rows[s].seq.toString('utf8')
                  did = rows[s].dataset_id;

                  let seq = rows[s].seq.toString('utf8');
                  let seq_cnt = rows[s].seq_count;
                  let gast = rows[s].gast_distance;
                  let classifier = rows[s].classifier;
                  let d_id = rows[s].domain_id;
                  let p_id = rows[s].phylum_id;
                  let k_id = rows[s].klass_id;
                  let o_id = rows[s].order_id;
                  let f_id = rows[s].family_id;
                  let g_id;
                  if (rows[s].hasOwnProperty("genus_id")){
                    if (rows[s].genus_id == 'undefined'){
                        g_id = 'genus_NA'
                    } else {
                        g_id = rows[s].genus_id
                    }

                  } else {
                    g_id = ''
                  }

                  if (rows[s].hasOwnProperty("species_id")){
                    let sp_id = rows[s].species_id
                  } else {
                    let sp_id = ''
                  }
                  let st_id = rows[s].strain_id;
                  new_rows[did].push({seq:seq,seq_count:seq_cnt,gast_distance:gast,classifier:classifier,domain_id:d_id,phylum_id:p_id,klass_id:k_id,order_id:o_id,family_id:f_id,genus_id:g_id,species_id:sp_id,strain_id:st_id})

              }
              // order by seq_count DESC
              new_rows[selected_did].sort(function sortByCount(a, b) {
                return b.seq_count - a.seq_count;
              });

              fs.writeFileSync(file_path, JSON.stringify(new_rows[selected_did]));

              LoadDataFinishRequest(req, res, timestamp, new_matrix, new_order);

            }
        })

    }

});


//
// B A R - C H A R T  -- D O U B L E
//

router.get('/bar_double', helpers.isLoggedIn, function(req, res) {

    console.log('in routes_viz/bar_double');

    let myurl = url.parse(req.url, true);
    console.log(myurl.query);
    let did1 = myurl.query.did1;
    let did2 = myurl.query.did2;
    let dist = myurl.query.dist;
    let metric = myurl.query.metric;
    //let ts   = myurl.query.ts;
    let orderby = myurl.query.orderby || 'alpha'; // alpha, count
    let value = myurl.query.val || 'z'; // a,z, min, max
    let order = {orderby:orderby, value:value}; // orderby: alpha: a,z or count: min,max
    let ds1  = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did1]].project+'--'+DATASET_NAME_BY_DID[did1];
    let ds2  = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did2]].project+'--'+DATASET_NAME_BY_DID[did2];

    //let ds_items = pjds.split('--');

    //console.log(ds1, ds2)

    let pi = {};
    pi.chosen_datasets = [{did:did1, name:ds1},{did:did2, name:ds2}];
    pi.no_of_datasets=2;
    pi.ts = req.session.ts;
    pi.unit_choice = req.session.unit_choice;
    pi.min_range = req.session.min_range;
    pi.max_range = req.session.max_range;
    pi.normalization = req.session.normalization;
    pi.tax_depth = req.session.tax_depth;
    pi.include_nas = req.session.include_nas;
    pi.domains = req.session.domains;
    pi.selected_distance = metric;
    let write_file = false;  // DO NOT OVERWRITE The Matrix File
    // let new_matrix = MTX.get_biom_matrix(req, pi, write_file);
    console.time("TIME: biom_matrix_new_from_bar_double");
    const biom_matrix_obj = new biom_matrix_controller.BiomMatrix(req, pi, write_file);
    let new_matrix = biom_matrix_obj.biom_matrix;
    console.timeEnd("TIME: biom_matrix_new_from_bar_double");
    //console.log('new_matrix')
    //console.log(new_matrix)




    //DOUBLE
    //console.log(JSON.stringify(new_matrix))
    new_matrix = helpers.sort_json_matrix(new_matrix,order);
    let new_order = {};
    if (order.orderby =='alpha' ){
      if (order.value == 'a'){
        new_order.alpha_value = 'z'
      } else {
        new_order.alpha_value = 'a'
      }
      new_order.count_value = ''
    } else {
      if (order.value == 'min'){
        new_order.count_value = 'max'
      } else {
        new_order.count_value = 'min'
      }
      new_order.alpha_value = ''
    }

    let timestamp = +new Date();  // millisecs since the epoch!
    console.log('TS HM File',timestamp);
    let filename1 = req.user.username+'_'+did1+'_'+timestamp+'_sequences.json';
    let file_path1 = path.join('tmp',filename1);
    let filename2 = req.user.username+'_'+did2+'_'+timestamp+'_sequences.json';
    let file_path2 = path.join('tmp',filename2);
    //console.log(file_path)
    new_rows = {};
    new_rows[did1] = [];
    new_rows[did2] = [];
    //console.log(new_rows)
    let LoadDataFinishRequest = function (req, res, timestamp, new_matrix, new_order, dist) {
       console.log('LoadDataFinishRequest in bar_double');
       if (pi.unit_choice == 'OTUs'){
            let title = 'OTU Count Data'
       } else {
            let title = 'Taxonomic Data'
       }
       res.render('visuals/user_viz_data/bar_double', {
                  title     : title,
                  ts        : timestamp,
                  matrix    : JSON.stringify(new_matrix),
                  post_items: JSON.stringify(pi),
                  bar_type  : 'double',
                  order     : JSON.stringify(new_order),
                  dist      : dist,
                  user: req.user, hostname: req.CONFIG.hostname,
              });
    };
    if ( pi.unit_choice == 'OTUs'){

        LoadDataFinishRequest(req, res, timestamp, new_matrix, new_order, dist);

    } else {
        connection.query(QUERY.get_sequences_perDID(did1+"','"+did2, pi.unit_choice), function mysqlSelectSeqsPerDID(err, rows, fields){
            if (err)  {
              console.log('Query error: ' + err);
              console.log(err.stack);
              res.send(err)
            } else {
              //console.log(rows)
              // should write to a file? Or res.render here?

              for (s in rows){
                  did = rows[s].dataset_id;

                  //console.log(did)
                  //rows[s].seq = rows[s].seq.toString('utf8')
                  let seq = rows[s].seq.toString('utf8');
                  let seq_cnt = rows[s].seq_count;
                  let gast = rows[s].gast_distance;
                  let classifier = rows[s].classifier;
                  let d_id = rows[s].domain_id;
                  let p_id = rows[s].phylum_id;
                  let k_id = rows[s].klass_id;
                  let o_id = rows[s].order_id;
                  let f_id = rows[s].family_id;
                  let g_id = rows[s].genus_id;
                  let sp_id = rows[s].species_id;
                  let st_id = rows[s].strain_id;
                  new_rows[did].push({seq:seq,seq_count:seq_cnt,gast_distance:gast,classifier:classifier,domain_id:d_id,phylum_id:p_id,klass_id:k_id,order_id:o_id,family_id:f_id,genus_id:g_id,species_id:sp_id,strain_id:st_id})
                  //new_rows[did].seq = rows[s].seq.toString('utf8')
              }
              // order by seq_count DESC
              //console.log(new_rows)
              new_rows[did1].sort(function sortByCount(a, b) {
                      return b.seq_count - a.seq_count;
              });
              new_rows[did2].sort(function sortByCount(a, b) {
                      return b.seq_count - a.seq_count;
              });

              fs.writeFile(file_path1, JSON.stringify(new_rows[did1]), function writeFile(err) {
                if (err) return console.log(err);
                console.log('wrote file > '+file_path1);


                fs.writeFile(file_path2, JSON.stringify(new_rows[did2]), function writeFile(err) {
                  if (err) return console.log(err);
                  console.log('wrote file > '+file_path2);

                  LoadDataFinishRequest(req, res, timestamp, new_matrix, new_order, dist);
                });

              });

            }
        })
    }

});
//
//  S E Q U E N C E S
//
router.get('/sequences/', helpers.isLoggedIn, function(req, res) {
	console.log('in sequences');
	let myurl = url.parse(req.url, true);
	console.log(myurl.query);
	let search_tax = myurl.query.taxa;
    let seqs_filename = myurl.query.filename;


    let seq_list = [];
    let d,p,k,o,f,g,sp,st;
    let selected_did = myurl.query.did;
    let pjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[selected_did]].project+'--'+DATASET_NAME_BY_DID[selected_did];
	if (seqs_filename){
    //console.log('found filename',seqs_filename)

    fs.readFile(path.join('tmp',seqs_filename), 'utf8', function readFile(err,data) {
      if (err) {
        console.log(err);
        if (req.session.unit_choice == 'OTUs'){
            res.send('<br><h3>No sequences are associated with this OTU project.</h3>')
        } else {
            res.send('<br><h3>No file found: '+seqs_filename+"; Use the browsers 'Back' button and try again</h3>")
        }
      }
      //console.log('parsing data')
      try {
        let clean_data = JSON.parse(data)
      }catch(e){
        console.log(e);
        res.render('visuals/user_viz_data/sequences', {
                    title: 'Sequences',
                    ds : pjds,
                    did : selected_did,
                    tax : search_tax,
                    fname : seqs_filename,
                    seq_list : 'Error Retrieving Sequences',
                    user: req.user, hostname: req.CONFIG.hostname,
        });
        return
      }

      for (i in clean_data){

          seq_tax = '';
          let data = clean_data[i];

          d  = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.domain_id+"_domain"].taxon;

          try {
                p  = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.phylum_id+"_phylum"].taxon;
          }catch(e){
                p = 'phylum_NA'
          }
          try {
                k  = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.klass_id+"_klass"].taxon;
          }catch(e){
                k = 'class_NA'
          }
          try {
                o  = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.order_id+"_order"].taxon;
          }catch(e){
                o = 'order_NA'
          }
          try {
                f  = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.family_id+"_family"].taxon;
          }catch(e){
                f = 'family_NA'
          }
          try {
                g  = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.genus_id+"_genus"].taxon;
          }catch(e){
                g = 'genus_NA'
          }
          try {
                sp = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.species_id+"_species"].taxon;
          }
          catch(e){
                sp = 'species_NA'
          }
          try {
                st = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[data.strain_id+"_strain"].taxon;
          }
          catch(e){
                st = 'strain_NA'
          }
          seq_tax = d+';'+p+';'+k+';'+o+';'+f+';'+g+';'+sp+';'+st;
          if (seq_tax.substring(0, search_tax.length) === search_tax){
            seq_list.push({prettyseq:helpers.make_color_seq(data.seq), seq:data.seq, seq_count:data.seq_count, gast_distance:data.gast_distance, classifier:data.classifier, tax:seq_tax});
          }
      }

      res.render('visuals/user_viz_data/sequences', {
                    title: 'Sequences',
                    ds : pjds,
                    tax : search_tax,
                    fname : seqs_filename,
                    seq_list : JSON.stringify(seq_list),
                    user: req.user, hostname: req.CONFIG.hostname,
      });
    });
  } else {
      res.render('visuals/user_viz_data/sequences', {
                    title: 'Sequences',
                    ds : pjds,
                    tax : search_tax,
                    fname : '',
                    seq_list : 'Error Retrieving Sequences',
                    user: req.user, hostname: req.CONFIG.hostname,
        });

  }

	//   });

});

/*
*   PARTIALS
*      These six partials all belong to the unit_selection page
*      and are shown via ajax depending on user selection in combo box
*       on that page.  AAV
*/
router.get('/partials/tax_'+C.default_taxonomy.name+'_simple', helpers.isLoggedIn,  function(req, res) {
    console.log("in '/partials/tax_'+C.default_taxonomy.name+'_simple'");
    res.render('visuals/partials/tax_'+C.default_taxonomy.name+'_simple', {
        doms : C.UNITSELECT.silva119_simple.domains
    });
});
//
//
//

// benchmarking
// let start = process.hrtime();
//

// };
router.get('/partials/load_metadata', helpers.isLoggedIn,  function(req, res) {
  let myurl = url.parse(req.url, true);
  let load = myurl.query.load  || 'all';   // either 'all' or 'selected'
  res.render('visuals/partials/load_metadata',
    { title   : 'metadata_table',
      load    : load
    });
});
//
//
//
router.get('/partials/tax_'+C.default_taxonomy.name+'_custom', helpers.isLoggedIn,  function(req, res) {
  res.render('visuals/partials/tax_'+C.default_taxonomy.name+'_custom',  { title   : C.default_taxonomy.show+' Custom Taxonomy Selection'});
});
router.get('/partials/tax_rdp2.6_simple', helpers.isLoggedIn,  function(req, res) {
    res.render("visuals/partials/tax_rdp26_simple", {

        doms : C.UNITSELECT.rdp2_6_simple.domains,

    });
});
router.get('/partials/tax_generic_simple', helpers.isLoggedIn,  function(req, res) {
    res.render("visuals/partials/tax_generic_simple", {
        doms: C.DOMAINS
    });
});
router.get('/partials/tax_gg_custom', helpers.isLoggedIn,  function(req, res) {
    res.render('visuals/partials/tax_gg_custom',{});
});
router.get('/partials/tax_gg_simple', helpers.isLoggedIn,  function(req, res) {
    res.render('visuals/partials/tax_gg_simple',{});
});
router.get('/partials/otus', helpers.isLoggedIn,  function(req, res) {
    res.render('visuals/partials/otus',{});
});
router.get('/partials/med_nodes', helpers.isLoggedIn,  function(req, res) {
    res.render('visuals/partials/med_nodes',{});
});
//
// SAVE CONFIG
//
router.post('/save_config', helpers.isLoggedIn,  function(req, res) {

  console.log('req.body: save_config-->>');
  if (req.CONFIG.site == 'vamps' ){
      console.log('VAMPS PRODUCTION -- no print to log');
  } else {
      console.log(req.body);
  }
  console.log('<--req.body: save_config');
  let timestamp = +new Date();  // millisecs since the epoch!
  let filename = 'configuration-' + timestamp + '.json';

  let json_obj = Object.assign({},req.session);
  json_obj.source = 'vamps.mbl.edu';
  json_obj.ts = +new Date();
  delete json_obj.cookie;
  delete json_obj.returnTo;
  delete json_obj.flash;
  delete json_obj.passport;
  delete json_obj.cookie;


  if (req.CONFIG.site == 'vamps' ){
        console.log('VAMPS PRODUCTION -- no print to log');
  } else {
        console.log('json_obj');
        console.log(json_obj)
  }
  let filename_path = path.join(req.CONFIG.USER_FILES_BASE,req.user.username,filename);
  helpers.mkdirSync(path.join(req.CONFIG.USER_FILES_BASE));  // create dir if not present
  helpers.mkdirSync(path.join(req.CONFIG.USER_FILES_BASE,req.user.username)); // create dir if not present
  //console.log(filename);
  helpers.write_to_file(filename_path, JSON.stringify(json_obj));

  res.send("Saved as: <a href='saved_elements'>"+filename+"</a>");


});
//
//
//


router.post('/save_datasets', helpers.isLoggedIn,  function(req, res) {

  console.log('req.body: save_datasets-->>');
  if (req.CONFIG.site == 'vamps' ){
    console.log('VAMPS PRODUCTION -- no print to log');
  } else {
    console.log(req.body);
  }
  console.log('req.body: save_datasets');

	let filename_path = path.join(req.CONFIG.USER_FILES_BASE,req.user.username,req.body.filename);
	helpers.mkdirSync(path.join(req.CONFIG.USER_FILES_BASE));  // create dir if not present
	helpers.mkdirSync(path.join(req.CONFIG.USER_FILES_BASE,req.user.username)); // create dir if not present
	//console.log(filename);
	helpers.write_to_file(filename_path,req.body.datasets);

	res.send('OK');


});
//
//
//
router.get('/saved_elements', helpers.isLoggedIn,  function(req, res) {
    console.log('in show_saved_datasets');
    if (req.user.username == 'guest'){
      req.flash('fail', "The 'guest' user cannot save datasets");
      res.redirect('/user_data/your_data');
    } else {
      //console.log('req.body: show_saved_datasets-->>');
      //console.log(req.body);
      //console.log('req.body: show_saved_datasets');
      let acceptable_prefixes = ['datasets', 'configuration', 'image'];
      let saved_elements_dir = path.join(req.CONFIG.USER_FILES_BASE,req.user.username);

      let file_info = {};
      let modify_times = [];
      helpers.mkdirSync(saved_elements_dir);
      fs.readdir(saved_elements_dir, function(err, files){
          if (err){

    				let msg = 'ERROR Message '+err;
    				helpers.render_error_page(req,res,msg);


    		  } else {
      		  for (let f in files){
      	        let pts = files[f].split('-');
      	        if (acceptable_prefixes.indexOf(pts[0]) != -1 ){
      	          //file_info.files.push(files[f]);
      	          stat = fs.statSync(path.join(saved_elements_dir,files[f]));
      			       file_info[stat.mtime.getTime()] = { 'filename':files[f], 'size':stat.size, 'mtime':stat.mtime.toString() };
      			       modify_times.push(stat.mtime.getTime());

      	        }
      	    }
      		  modify_times.sort().reverse();
      		  //console.log(JSON.stringify(file_info));
      		}

      		res.render('visuals/saved_elements',
      		    { title: 'saved_elements',

      		      finfo: JSON.stringify(file_info),
      		      times: modify_times,
      		      user: req.user, hostname: req.CONFIG.hostname,
      		});

      });
    }

});
//
//  R E S E T
//
router.post('/reset_ds_order', helpers.isLoggedIn,  function(req, res) {
        console.log('in reset_ds_order');
        let html = '';
        html += "<table id='drag_table' class='table table-condensed' >";
        html += "<thead></thead>";
        html += "  <tbody>";

        for (let i in req.session.chosen_id_order){
             let did = req.session.chosen_id_order[i];
             let name = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project+'--'+DATASET_NAME_BY_DID[did];
             html += "<tr class='tooltip_row'>";
             html += "<td class='dragHandle' id='"+did+"--"+name+"'> ";
                 html += "<input type='hidden' name='ds_order[]' value='"+did+"'>";
             html += (parseInt(i)+1).toString()+" (id:"+ did+") - "+name;
             html += "</td>";
             html += "   <td>";
             html += "       <a href='#' onclick='move_to_the_top("+(parseInt(i)+1).toString()+",\""+did+"--"+name+"\")'>^</a>";
             html += "   </td>";
             html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";
        res.send(html)
});
//
// A L P H A - B E T I Z E
//
router.post('/alphabetize_ds_order', helpers.isLoggedIn,  function(req, res) {
	console.log('in alphabetize_ds_order');
	let html = '';
  html += "<table id='drag_table' class='table table-condensed' >";
  html += "<thead></thead>";
  html += "  <tbody>";
  //console.log(req.session)
  let names = [];
  let ids = [];

  for (let i in req.session.chosen_id_order){
    let did = req.session.chosen_id_order[i];
    let name = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project+'--'+DATASET_NAME_BY_DID[did];
    names.push(name);
    ids.push(did)
  }

  let names_copy = names.slice();  // slice make an independant copy of the array
  names_copy.sort(); // alpha sort
  for (let i in names_copy){
		     id = ids[names.indexOf(names_copy[i])];
		     name = names_copy[i];
		     html += "<tr class='tooltip_row'>";
         html += "<td class='dragHandle' id='"+ id +"--"+name+"'> ";
		     html += "<input type='hidden' name='ds_order[]' value='"+ id +"'>";
         html += (parseInt(i)+1).toString()+" (id:"+ id +") - "+name;
         html += "</td>";
         html += "   <td>";
         html += "       <a href='#' onclick='move_to_the_top("+(parseInt(i)+1).toString()+",\""+id +"--"+name+"\")'>^</a>";
         html += "   </td>";
         html += "</tr>";
  }
  html += "</tbody>";
  html += "</table>";
	res.send(html)
});
//
// R E V E R S E  O R D E R
//
router.post('/reverse_ds_order', helpers.isLoggedIn,  function(req, res) {
  console.log('in reverse_ds_order');
  let ids = JSON.parse(req.body.ids);
  let html = '';
  //console.log(req.session)
  html += "<table id='drag_table' class='table table-condensed' >";
  html += "<thead></thead>";
  html += "  <tbody>";
  ids.reverse();
  //console.log(ids)
  for (let i in ids){
         name = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[ids[i]]].project+'--'+DATASET_NAME_BY_DID[ids[i]];
         html += "<tr class='tooltip_row'>";
         html += "<td class='dragHandle' id='"+ ids[i] +"--"+name+"'> ";
         html += "<input type='hidden' name='ds_order[]' value='"+ ids[i] +"'>";
         html += (parseInt(i)+1).toString()+" (id:"+ ids[i] +") - "+name;
         html += "</td>";
         html += "   <td>";
         html += "       <a href='#' onclick='move_to_the_top("+(parseInt(i)+1).toString()+",\""+ids[i] +"--"+name+"\")'>^</a>";
         html += "   </td>";
         html += "</tr>";
  }
  html += "</tbody>";
  html += "</table>";
  res.send(html)
});
//
//  C L U S T E R  D A T A S E T  O R D E R
//
router.post('/cluster_ds_order', helpers.isLoggedIn,  function(req, res) {
    console.log('in cluster_ds_order');
    let html = '';
    let ts = req.body.ts;
    let metric = req.body.metric;
    let biom_file_name = ts+'_count_matrix.biom';
    let biom_file = path.join(req.CONFIG.PROCESS_DIR,'tmp',biom_file_name);
    let pwd = req.CONFIG.PROCESS_DIR || req.CONFIG.PROCESS_DIR;
    let pjds_lookup = {};
    for (i in req.session.chosen_id_order){
        let did = req.session.chosen_id_order[i];
        let pjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project+'--'+DATASET_NAME_BY_DID[did];
        pjds_lookup[pjds] = did
    }
    let options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'cluster_datasets', '--basedir', pwd, '--prefix', ts],
    };
    console.log(options.scriptPath+'/distance_and_ordination.py '+options.args.join(' '));

    let log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');


    let cluster_process = spawn( options.scriptPath+'/distance_and_ordination.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true,
            stdio: [ 'ignore', null, log ]
        });  // stdin, stdout, stderr


    //let heatmap_process = spawn( 'which' , ['python'], {env:{'PATH':envpath}});
    let output = '';
    cluster_process.stdout.on('data', function clusterProcessStdout(data) {
        //console.log('stdout: ' + data);
        output += data.toString();
    });

    cluster_process.on('close', function clusterProcessOnClose(code) {
      console.log('ds cluster process exited with code ' + code);
      let lines = output.split(/\n/);

      for (i in lines){

        if (lines[i].substring(0,7) == 'DS_LIST'){
          tmp = lines[i].split('=');
          let ds_list = tmp[1];

        }
      }
      if (req.CONFIG.site == 'vamps' ){
        console.log('VAMPS PRODUCTION -- no print to log');
      } else {
        console.log('dsl',ds_list)
      }
      //let last_line = ary[ary.length - 1];
      if (code === 0){   // SUCCESS
        try {

            dataset_list = JSON.parse(ds_list);

            potential_chosen_id_name_hash  = COMMON.create_new_chosen_id_name_hash(dataset_list,pjds_lookup);
            ascii_file = ts+'_'+metric+'_tree.txt';
            ascii_file_path = path.join(pwd,'tmp',ascii_file);
            fs.readFile(ascii_file_path, 'utf8', function readAsciiTreeFile(err,ascii_tree_data) {
              if (err) {
                return console.log(err);
              } else {
                //console.log(data);

                html = '';

                html += "<table id='drag_table' class='table table-condensed' >";
                html += "<thead></thead>";
                html += "  <tbody>";
                for (let i in potential_chosen_id_name_hash.names){
                    html += "<tr class='tooltip_row'>";
                    html += "<td class='dragHandle' id='"+potential_chosen_id_name_hash.ids[i]+"--"+potential_chosen_id_name_hash.names[i]+"'> ";
                    html += "<input type='hidden' name='ds_order[]' value='"+potential_chosen_id_name_hash.ids[i]+"'>";
                    html += (parseInt(i)+1).toString()+" (id:"+ potential_chosen_id_name_hash.ids[i]+") - "+potential_chosen_id_name_hash.names[i];
                    html += "</td>";
                    html += "   <td>";
                    html += "       <a href='#' onclick='move_to_the_top("+(parseInt(i)+1).toString()+",\""+potential_chosen_id_name_hash.ids[i]+"--"+potential_chosen_id_name_hash.names[i]+"\")'>^</a>";
                    html += "   </td>";
                    html += "</tr>";
                }
                html += "</tbody>";
                html += "</table>";
                html += '/////<pre style="font-size:10px">'+metric+'<br><small>'+ascii_tree_data+'</small></pre>';

                res.send(html)
              }
            });
        }
        catch(err){
          res.send('Calculation Error: '+err.toString())
        }


      } else {
        //console.log('output')
        //console.log(output);
        //res.send(err);
      }
    });



});
//
//
//

router.post('/dheatmap_number_to_color', helpers.isLoggedIn,  function(req, res) {
    console.log('in dheatmap_number_to_color');
    console.log(req.body);

    let ts = req.session.ts;
    let distmtx_file_name = ts+'_distance.json';
    let distmtx_file = path.join(config.PROCESS_DIR,'tmp',distmtx_file_name);
    //console.log(distmtx_file)
    let distance_matrix = JSON.parse(fs.readFileSync(distmtx_file, 'utf8')); // function (err, distance_matrix) {

    //distance_matrix = JSON.parse(data);
    //console.log(distance_matrix)
    metadata = {};
    metadata.numbers_or_colors = req.body.numbers_or_colors;
    metadata.split = false;
    metadata.metric = req.session.selected_distance;  // revert back to selected
    let html = IMAGES.create_hm_table(req, distance_matrix, metadata );

    //console.log(html)
    let outfile_name = ts + '-dheatmap-api.html';
    outfile_path = path.join(config.PROCESS_DIR,'tmp', outfile_name);  // file name save to user_location
    //console.log('outfile_path:',outfile_path)
    //result = IMAGES.save_file(html, outfile_path) // this saved file should now be downloadable from jupyter notebook
    //console.log(result)
    //res.send(outfile_name)
    let data = {};
    data.html = html;
    data.numbers_or_colors = req.body.numbers_or_colors;
    data.filename = outfile_name;
    //res.send(outfile_name)
    res.json(data)


});
router.post('/dheatmap_split_distance', helpers.isLoggedIn,  function(req, res) {
    console.log('in dheatmap_split_distance');
    console.log(req.body);


    let ts = req.session.ts;
    let test_split_file_name = ts+'_distance_mh_bc.tsv';
    let test_distmtx_file = path.join(config.PROCESS_DIR,'tmp',test_split_file_name );
    let pwd = req.CONFIG.PROCESS_DIR || req.CONFIG.PROCESS_DIR;
    let biom_file_name = ts+'_count_matrix.biom';
    let biom_file = path.join(pwd,'tmp',biom_file_name);



    let FinishSplitFile = function(req, res){
        let ts = req.session.ts;
        //let suffix = split_file_suffixes[req.body.split_distance_choice]
        let suffix = req.body.split_distance_choice;
        //let distmtx_file_name = ts+'_distance_'+suffix+'.json';
        let distmtx_file_name = ts+'_distance_'+suffix+'.tsv';
        let distmtx_file = path.join(config.PROCESS_DIR,'tmp', distmtx_file_name);
        //console.log(distmtx_file)
        fs.readFile(distmtx_file, 'utf8',function readFile(err,mtxdata) {
            if (err) {
                res.json({'err':err})
            } else {
                //console.log(mtxdata)
                let split_distance_csv_matrix = mtxdata.split('\n');

                let IMAGES = require('../routes_images');
                metadata = {};
                metadata.numbers_or_colors = req.body.numbers_or_colors;
                metadata.split = true;
                metadata.metric = suffix;

                let html = IMAGES.create_hm_table_from_csv(req, split_distance_csv_matrix, metadata );

                let outfile_name = ts + '-dheatmap-api.html';
                outfile_path = path.join(config.PROCESS_DIR,'tmp', outfile_name);  // file name save to user_location

                let data = {};
                data.html = html;
                data.numbers_or_colors = req.body.numbers_or_colors;
                data.filename = outfile_name;
                //res.send(outfile_name)
                res.json(data)
            }

        });
    };
    if (helpers.fileExists(test_distmtx_file)){
        console.log('Using Old Files');
        FinishSplitFile(req, res);
        return
    }

    let options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-in', biom_file, '-splits', '--function', 'splits_only', '--basedir', pwd, '--prefix', ts ],
    };
    console.log(options.scriptPath+'/distance_and_ordination.py '+options.args.join(' '));
    let split_process = spawn( options.scriptPath+'/distance_and_ordination.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true,
            //stdio: [ 'ignore', null, log ] // stdin, stdout, stderr
            stdio: 'pipe'  // stdin, stdout, stderr
    });

    let stdout = '';
    split_process.stdout.on('data', function splitsProcessStdout(data) {
        //
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stdout += data;

    });
    let stderr = '';
    split_process.stderr.on('data', function splitsProcessStderr(data) {
        console.log('stderr: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stderr += data;
    });
    split_process.on('close', function splitsProcessOnClose(code) {
        console.log('finished code:'+code.toString());
        console.log('Creating New Split Distance Files');
        FinishSplitFile(req, res)
        //let split_distance_csv_matrix = JSON.parse(fs.readFile(distmtx_file, 'utf8', function)) // function (err, distance_matrix) {


    })
});
//
//
//

router.post('/download_file', helpers.isLoggedIn,  function(req, res) {
    console.log('in routes_visualization download_file');
    let html = '';
    let ts = req.body.ts;
    let file_type = req.body.file_type;
    file_path = path.join(req.CONFIG.PROCESS_DIR, 'tmp');
    if (file_type == 'matrix'){
      res.setHeader('Content-Type', 'text');
      out_file_name = ts+'_count_matrix.txt';
      biom_file_name = ts+'_count_matrix.biom';
      helpers.create_matrix_from_biom(res, file_path, biom_file_name, out_file_name)
    }else if (file_type == 'biom'){
      file_name = ts+'_count_matrix.biom';
      res.setHeader('Content-Type', 'text');
      res.download(path.join(file_path, file_name)); // Set disposition and send it.
    }else if (file_type == 'tax'){
      file_name = ts+'_taxonomy.txt';
      res.setHeader('Content-Type', 'text');
      res.download(path.join(file_path, file_name)); // Set disposition and send it.
    }else if (file_type == 'meta'){
      file_name = ts+'_metadata.txt';
      res.setHeader('Content-Type', 'text');
      res.download(path.join(file_path, file_name)); // Set disposition and send it.
    }else if (file_type == 'configuration'){
      file_name = req.body.filename;
      config_file_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
      res.setHeader('Content-Type', 'json');
      res.download(path.join(config_file_path, file_name)); // Set disposition and send it.
    } else {
      // ERROR
      console.log('ERROR In download_file')
    }



});

//
//
//
router.get('/clear_filters', helpers.isLoggedIn, function(req, res) {
    //SHOW_DATA = ALL_DATASETS;
    console.log('in clear filters');
    //console.log(req.query)
    //FILTER_ON = false
    PROJECT_TREE_OBJ = [];
    if (req.query.hasOwnProperty('btn') && req.query.btn == '1'){
        DATA_TO_OPEN = {}
    }
    //DATA_TO_OPEN = {}
    PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, SHOW_DATA.projects);
    PROJECT_FILTER = {"substring":"", "env":[],"target":"", "portal":"", "public":"-1", "metadata1":"", "metadata2":"", "metadata3":"", "pid_length":PROJECT_TREE_PIDS.length};
    res.json(PROJECT_FILTER);

});
//
//
//
function filter_project_tree_for_permissions(req, obj){
  console.log('Filtering tree projects for permissions');
  let new_project_tree_pids = [];
  for ( i in obj ){
      //node = PROJECT_INFORMATION_BY_PID[pid];
      //console.log(obj[i])
      pid = obj[i].pid;
      node = PROJECT_INFORMATION_BY_PID[pid];
      //console.log(node)
      if (
            node.public
            || req.user.security_level <= 10                    // admin user ==1
            || node.permissions.length === 0                    // ??
            || node.permissions.indexOf(req.user.user_id) !== -1 // owner is user
            || (req.user.security_level == 45 && (node.project).substring(0,3) == 'DCO') // DCO Editor all DCO* projects
            ) {

                if (PROJECT_INFORMATION_BY_PID[pid].metagenomic == 0){
                    new_project_tree_pids.push(pid)
                }

      }
  }
  //console.log(obj)
  return new_project_tree_pids
}
//
//
//

//
//
//
router.get('/load_portal/:portal', helpers.isLoggedIn, function(req, res) {
    let portal = req.params.portal;

    console.log('in load_portal: '+portal);
    SHOW_DATA = ALL_DATASETS;
    PROJECT_TREE_OBJ = [];

    PROJECT_TREE_OBJ = helpers.get_portal_projects(req, portal);
    PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, PROJECT_TREE_OBJ);
    PROJECT_FILTER = {"substring":"", "env":[],"target":"", "portal":"", "public":"-1", "metadata1":"", "metadata2":"", "metadata3":"", "pid_length":PROJECT_TREE_PIDS.length};
    res.json(PROJECT_FILTER);
});
//
//
//  FILTERS FILTERS  FILTERS FILTERS  FILTERS FILTERS  FILTERS FILTERS
//  FILTERS FILTERS  FILTERS FILTERS  FILTERS FILTERS  FILTERS FILTERS
//
//  FILTER #1 LIVESEARCH PROJECTS (substring) FILTER
//
router.get('/livesearch_projects/:substring', function(req, res) {
  console.log('viz:in livesearch_projects/:substring');
  let substring = req.params.substring.toUpperCase();
  let myurl = url.parse(req.url, true);
  let portal = myurl.query.portal;
  if (substring === '.....'){
    substring = ''
  }

  PROJECT_FILTER.substring = substring;

  let projects_to_filter = [];
  if (portal){
    projects_to_filter = helpers.get_portal_projects(req, portal)
  } else {
    projects_to_filter = SHOW_DATA.projects
  }
  NewPROJECT_TREE_OBJ = helpers.filter_projects(req, projects_to_filter, PROJECT_FILTER);

  PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, NewPROJECT_TREE_OBJ);
  PROJECT_FILTER.pid_length = PROJECT_TREE_PIDS.length;
  if (req.CONFIG.site == 'vamps' ){
      console.log('VAMPS PRODUCTION -- no print to log');
  } else {
    console.log('PROJECT_FILTER')
  }

  console.log(PROJECT_FILTER);

  res.json(PROJECT_FILTER);

});

//
//  FILTER #2 LIVESEARCH ENV PROJECTS FILTER
//
router.get('/livesearch_env/:envid', function(req, res) {
  let envid = req.params.envid;
  let items = envid.split('--');
  envid = items[0]; //TODO: why redefine here? was just defined 2 lines before.
  let env_name = items[1];
  let myurl = url.parse(req.url, true);
  let portal = myurl.query.portal;
  let info = PROJECT_INFORMATION_BY_PID;

  let envid_lst = [];
  if (env_name === 'human associated'){  // get id for 'human associated'
    envid_lst = [];
    for (let key in MD_ENV_PACKAGE){
      if (MD_ENV_PACKAGE[key].substring(0,5) === 'human'){
        envid_lst.push(parseInt(key));
      }
    }
  }else if (envid === '.....'){
    envid_lst = [];
  } else {
    envid_lst = [parseInt(envid)];
  }

  PROJECT_FILTER.env = envid_lst;

  let projects_to_filter = [];
  if (portal){
    projects_to_filter = helpers.get_portal_projects(req, portal);
  } else {
    projects_to_filter = SHOW_DATA.projects;
  }
  NewPROJECT_TREE_OBJ = helpers.filter_projects(req, projects_to_filter, PROJECT_FILTER);

  PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, NewPROJECT_TREE_OBJ);
  PROJECT_FILTER.pid_length = PROJECT_TREE_PIDS.length;
  console.log(PROJECT_FILTER);
  res.json(PROJECT_FILTER);

});
//
//  FILTER #3 LIVESEARCH TARGET PROJECTS FILTER
//
router.get('/livesearch_target/:gene_target', function(req, res) {
  let gene_target = req.params.gene_target;
  let myurl = url.parse(req.url, true);
  let portal = myurl.query.portal;
  if (gene_target === '.....') {
    gene_target = '';
  }

  PROJECT_FILTER.target = gene_target;
  let projects_to_filter = [];
  if (portal) {
    projects_to_filter = helpers.get_portal_projects(req, portal);
  } else{
    projects_to_filter = SHOW_DATA.projects;
  }
  NewPROJECT_TREE_OBJ = helpers.filter_projects(req, SHOW_DATA.projects, PROJECT_FILTER);

  PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, NewPROJECT_TREE_OBJ);
  PROJECT_FILTER.pid_length = PROJECT_TREE_PIDS.length;
  console.log(PROJECT_FILTER);
  res.json(PROJECT_FILTER);

});
//
//
// FILTER #4
//
router.get('/livesearch_portal/:portal', function(req, res) {
  console.log('viz:in livesearch portal');
  let select_box_portal = req.params.portal;
  let myurl = url.parse(req.url, true);
  let portal = myurl.query.portal;  // we have this turned off: portal selection on portal page

  if (select_box_portal === '.....') {
    select_box_portal = '';
  }

  PROJECT_FILTER.portal = select_box_portal;
  let projects_to_filter = [];
  if (portal){
    projects_to_filter = helpers.get_portal_projects(req, portal);
  } else {
    projects_to_filter = SHOW_DATA.projects;
  }
  //console.log(PROJECT_FILTER)
  NewPROJECT_TREE_OBJ = helpers.filter_projects(req, SHOW_DATA.projects, PROJECT_FILTER);
  //console.log(NewPROJECT_TREE_OBJ)
  PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, NewPROJECT_TREE_OBJ);
  PROJECT_FILTER.pid_length = PROJECT_TREE_PIDS.length;
  //console.log(PROJECT_FILTER)
  res.json(PROJECT_FILTER);

});
//
//
//
//  FILTER # 5 LIVESEARCH PUBLIC/PRIVATE PROJECTS FILTER
//
router.get('/livesearch_status/:q', function(req, res) {
  console.log('viz:in livesearch status');
  let q = req.params.q;
  let myurl = url.parse(req.url, true);
  let portal = myurl.query.portal;

  PROJECT_FILTER.public = q;

  if (portal){
    let projects_to_filter = helpers.get_portal_projects(req, portal)
  } else {
    let projects_to_filter = SHOW_DATA.projects
  }
  NewPROJECT_TREE_OBJ = helpers.filter_projects(req, projects_to_filter, PROJECT_FILTER);

  PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, NewPROJECT_TREE_OBJ);
  PROJECT_FILTER.pid_length = PROJECT_TREE_PIDS.length;
  console.log(PROJECT_FILTER);
  res.json(PROJECT_FILTER);

});
//
//
//  FILTER #6  LIVESEARCH METADATA FILTER
//
router.get('/livesearch_metadata/:num/:q', function(req, res) {
  console.log('viz:in livesearch metadata');

  let num = req.params.num;
  let q = req.params.q;
  console.log('num '+num);
  console.log('query '+q);
  let myurl = url.parse(req.url, true);
  let portal = myurl.query.portal;
  if (q === '.....'){
    q = ''
  }

  PROJECT_FILTER['metadata'+num] = q;
  //PROJECT_FILTER.metadata_num = num

  if (portal){
    let projects_to_filter = helpers.get_portal_projects(req, portal)
  } else {
    let projects_to_filter = SHOW_DATA.projects
  }
  NewPROJECT_TREE_OBJ = helpers.filter_projects(req, projects_to_filter, PROJECT_FILTER);

  PROJECT_TREE_PIDS = filter_project_tree_for_permissions(req, NewPROJECT_TREE_OBJ);
  PROJECT_FILTER.pid_length = PROJECT_TREE_PIDS.length;
  console.log(PROJECT_FILTER);
  res.json(PROJECT_FILTER);

});
//
//
//
router.post('/check_units', function(req, res) {
  console.log('IN check_UNITS');
  console.log(req.body);
  let files_prefix;
  let path_to_file;
  let jsonfile;

  if (req.body.units == 'tax_'+C.default_taxonomy.name+'_simple' || req.body.units == 'tax_'+C.default_taxonomy.name+'_custom'){
        files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_"+C.default_taxonomy.name);
  }else if (req.body.units == 'tax_rdp2.6_simple'){
        files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_rdp2.6");
  }else if (req.body.units == 'tax_generic_simple'){
        files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE+"--datasets_generic");
  } else {
        console.log('ERROR:Units not found: '+req.body.units)  // ERROR
  }
  let file_err = 'PASS';
  let dataset_ids = req.session.chosen_id_order;
  // console.log('dataset_ids')
//   console.log(dataset_ids)

  for (let i in dataset_ids){
        //console.log(dataset_ids[i]+' <> '+DATASET_NAME_BY_DID[dataset_ids[i]])
        path_to_file = path.join(files_prefix, dataset_ids[i] +'.json');
        //console.log(path_to_file)
        try {
            jsonfile = require(path_to_file);
        }catch(e){
            file_err='FAIL';
            break
        }
  }
  res.send(file_err);

});
//
//
//
router.get('/tax_custom_dhtmlx', function(req, res) {
    //console.log('IN tax_custom_dhtmlx')
    let myurl = url.parse(req.url, true);
    let id = myurl.query.id;
    //console.log('id='+id)
    let json = {};
    json.id = id;
    json.item = [];
    if (id==0){
        // return json for collapsed tree: 'domain' only
//         json = {"id":"0", "item":[
//             {"id":"1", "text":"Bacteria", "tooltip":"domain", "checked":true,"child":"1", "item":[]},
//             {"id":"214", "text":"Archaea", "tooltip":"domain", "checked":true,"child":"1", "item":[]},
//             {"id":"338", "text":"Unknown", "tooltip":"domain", "checked":true,"child":"1", "item":[]},
//             {"id":"353", "text":"Organelle", "tooltip":"domain", "checked":true,"child":"1", "item":[]}
//             ]
//         }

        //console.log(new_taxonomy.taxa_tree_dict_map_by_rank["domain"])
        for ( n in new_taxonomy.taxa_tree_dict_map_by_rank["domain"]){
            node = new_taxonomy.taxa_tree_dict_map_by_rank["domain"][n];
            if (node.children_ids.length === 0){
                json.item.push({id:node.node_id,text:node.taxon,tooltip:node.rank,checked:true,child:0})
            } else {
                json.item.push({id:node.node_id,text:node.taxon,tooltip:node.rank,checked:true,child:1,item:[]})
            }
        }
        json.item.sort(function(a, b) {
            return helpers.compareStrings_alpha(a.text, b.text);
        });
    } else {
        for (n in new_taxonomy.taxa_tree_dict_map_by_id[id].children_ids){
            node_id = new_taxonomy.taxa_tree_dict_map_by_id[id].children_ids[n];
            node = new_taxonomy.taxa_tree_dict_map_by_id[node_id];
            //console.log('node')
            //console.log(node)
            if (node.children_ids.length === 0){
                json.item.push({id:node.node_id,text:node.taxon,tooltip:node.rank,child:0})
            } else {
                json.item.push({id:node.node_id,text:node.taxon,tooltip:node.rank,child:1,item:[]})
            }
        }
        json.item.sort(function sortByAlpha(a, b) {
            return helpers.compareStrings_alpha(a.text, b.text);
        });
    }
    res.json(json)
});
//
//  project_custom_dhtmlx
//
router.get('/project_dataset_tree_dhtmlx', function(req, res) {
    console.log('IN project_dataset_tree_dhtmlx - routes_visualizations');
    let myurl = url.parse(req.url, true);
    let id = myurl.query.id;
    console.log('id='+id);
    let json = {};
    json.id = id;
    json.item = [];
    console.log('DATA_TO_OPEN');
    console.log(DATA_TO_OPEN);
    //PROJECT_TREE_OBJ = []
    //console.log('PROJECT_TREE_PIDS2',PROJECT_TREE_PIDS)
    let itemtext;
    if (id==0){

        for ( i=0;i<PROJECT_TREE_PIDS.length;i++ ){

            let pid = PROJECT_TREE_PIDS[i];
            let node = PROJECT_INFORMATION_BY_PID[pid];
            //console.log('node',node)
            let tt_pj_id = 'project/'+node.project+'/'+node.title;
            if (node.public) {
              tt_pj_id += '/public';
            } else {
              tt_pj_id += '/private';
            }
            let pid_str = pid.toString();
            itemtext = "<span id='"+ tt_pj_id +"' class='tooltip_pjds_list'>"+node.project+"</span>";
            itemtext    += " <a href='/projects/"+pid_str+"'><span title='profile' class='glyphicon glyphicon-question-sign'></span></a>";
            if (node.public) {
                itemtext += "<small> <i>(public)</i></small>"
            } else {
                itemtext += "<a href='/users/"+ node.oid+"'><small> <i>(PI: "+node.username +")</i></small></a>"
            }

            if (Object.keys(DATA_TO_OPEN).indexOf(pid_str) >= 0){
              json.item.push({id:'p'+pid_str, text:itemtext, checked:false, open:'1', child:1, item:[]});
            } else {
              json.item.push({id:'p'+pid_str, text:itemtext, checked:false,  child:1, item:[]});
            }


        }
        //console.log(JSON.stringify(json, null, 4))

    } else {
        //console.log(JSON.stringify(ALL_DATASETS))
        let this_project = {};
        id = id.substring(1);  // id = pxx
        ALL_DATASETS.projects.forEach(function(prj) {
          if (prj.pid == id){
            this_project = prj
          }
        });
        let all_checked_dids = [];
        if (Object.keys(DATA_TO_OPEN).length > 0){

          console.log('dto');
          if (req.CONFIG.site == 'vamps' ){
            console.log('VAMPS PRODUCTION -- no print to log');
          } else {
            console.log(DATA_TO_OPEN);
          }
          for (openpid in DATA_TO_OPEN){
            Array.prototype.push.apply(all_checked_dids, DATA_TO_OPEN[openpid])
          }
        }
        console.log('all_checked_dids:');
        if (req.CONFIG.site == 'vamps' ){
          console.log('VAMPS PRODUCTION -- no print to log');
        } else {
          console.log(all_checked_dids)
        }
        let pname = this_project.name;
        for (n in this_project.datasets){
            let did   = this_project.datasets[n].did;
            //console.log('didXX',did)
            let dname = this_project.datasets[n].dname;
            let ddesc = this_project.datasets[n].ddesc;
            let tt_ds_id  = 'dataset/'+pname+'/'+dname+'/'+ddesc;
            itemtext = "<span id='"+ tt_ds_id +"' class='tooltip_pjds_list'>"+dname+"</span>";
            if (all_checked_dids.indexOf(parseInt(did)) === -1){
              json.item.push({id:did, text:itemtext, child:0})
            } else {
              json.item.push({id:did, text:itemtext, checked:'1', child:0})
            }
        }
    }
    json.item.sort(function sortByAlpha(a, b){
          return helpers.compareStrings_alpha(a.text, b.text);
    });
    //console.log(json.item)
    res.send(json)
});
//
//
//
router.get('/taxa_piechart', function(req, res) {
    console.log('IN taxa_piechart - routes_visualizations');
    let myurl = url.parse(req.url, true);
    let tax = myurl.query.tax;
    let timestamp = +new Date();  // millisecs since the epoch!
    let ts = req.session.ts;
    let matrix_file_path = path.join(config.PROCESS_DIR,'tmp',ts+'_count_matrix.biom');

    fs.readFile(matrix_file_path, 'utf8', function(err,mtxdata){
        if (err) {
            let msg = 'ERROR Message '+err;
            helpers.render_error_page(req,res,msg);
        } else {
            let biom_matrix = JSON.parse(mtxdata);
            let data = [];
            let new_matrix = {};

            for (i in biom_matrix.rows){
              if (biom_matrix.rows[i].id == tax){

                data = biom_matrix.data[i];
                // data = [1,2,3,4]
                // want [[1],[2],[3],[4]]

                new_matrix.data = [];
                for (n in data){
                  new_matrix.data.push([data[n]])
                }
                new_matrix.columns = [biom_matrix.rows[i]]
              }
            }
            new_matrix.rows = biom_matrix.columns;
            if (req.CONFIG.site == 'vamps' ){
              console.log('VAMPS PRODUCTION -- no print to log');
            } else {
              console.log('new mtx:',new_matrix);
              console.log('counts:',new_matrix.data)
            }
            let cols =  biom_matrix.columns;

            res.render('visuals/user_viz_data/pie_single_tax', {
                      title: 'Datasets PieChart',
                      matrix    :           JSON.stringify(new_matrix),
                      //post_items:           JSON.stringify(visual_post_items),
                      tax : tax,
                      datasets : JSON.stringify(cols),
                      counts : data,
                      ts : timestamp,
                      user: req.user, hostname: req.CONFIG.hostname,
            });

            
            
        }
    });
    
    
});

module.exports = router;

/**
* F U N C T I O N S
**/

// Generally put fucntion in global.js or helpers.js
//
