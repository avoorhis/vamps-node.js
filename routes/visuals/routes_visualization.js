const express = require('express');
const router = express.Router();

// const util = require('util');
const url  = require('url');
// const http = require('http');
const path = require('path');
const fs   = require('fs-extra');
const multer    = require('multer');
const config  = require(app_root + '/config/config');
const upload = multer({ dest: config.TMP, limits: { fileSize: config.UPLOAD_FILE_SIZE.bytes }  });
const helpers = require('../helpers/helpers');
const QUERY = require('../queries');

const COMMON  = require('./routes_common');
const C = require('../../public/constants');
const META    = require('./routes_visuals_metadata');
const IMAGES = require('../routes_images');
const biom_matrix_controller = require(app_root + '/controllers/biomMatrixController');
const visualization_controller = require(app_root + '/controllers/visualizationController');
const spawn = require('child_process').spawn;
// const app = express();
// const js2xmlparser = require("js2xmlparser");
// const xml_convert = require('xml-js');

const file_path_obj =  new visualization_controller.visualizationFiles();

function add_datasets_to_visual_post_items(visual_post_items, dataset_ids) {
// get dataset_ids the add names for biom file output:
// chosen_id_order was set in unit_select and added to session variable
  visual_post_items.chosen_datasets = [];
  for (let n in dataset_ids) {
    let did = dataset_ids[n];
    let dname = DATASET_NAME_BY_DID[did];
    let pname = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;
    visual_post_items.chosen_datasets.push({did: did, name: pname + '--' + dname});
  }
  return visual_post_items;
}

function start_visual_post_items(req) {
  const visualization_obj = new visualization_controller.viewSelectionFactory(req);
  let dataset_ids = visualization_obj.dataset_ids;
  let visual_post_items = visualization_obj.visual_post_items;

  visual_post_items = add_datasets_to_visual_post_items(visual_post_items, dataset_ids);

  console.log('VS--visual_post_items and id-hash:>>');
  let msg = 'visual_post_items: ' + JSON.stringify(visual_post_items) + '\nreq.session: ' + JSON.stringify(req.session);
  file_path_obj.print_log_if_not_vamps(req, msg);
  console.log('<<VS--visual_post_items');

  return visual_post_items;
}

//
//  V I E W  S E L E C T I O N
//
// test: get graphics ("show available graphics")
router.post('/view_selection', [helpers.isLoggedIn, upload.single('upload_files', 12)], function(req, res) {
  console.log('in POST view_selection');
  /*
     var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
  console.log('query', req.query)
  console.log('file',req.file)
  console.log('body',req.body);
  console.log('upload',upload.single('upload_files', 12))
  This page (view_selection) comes after the datasets and units have been selected
     in the previous two pages.
  It should be protected with isLoggedIn like /unit_selection below.
  The function call will look like this when isLoggedIn is in place:
             router.post('/view_selection', isLoggedIn, function(req, res) {
  This page is where the user will choose to view his/her selected visuals.
  The left side will show a synopsis of what choices the user has made:
     datasets, normalization, units and any specifics such as tax rank, domain, NAs ....
  The middle section will have a list of buttons allowing download of files
  And the right side will have links to the previously selected visuals.
  Before this page is rendered the visuals should have been created using the functions called below.
  The visual pages will be created in a public directory and each page will have a random number or timestamp
     attached so the page is private and can be deleted later.
  TESTING:
     There should be one or more datasets shown in list
     There should be one or more visual choices shown.

  var body = JSON.parse(req.body);
  if(typeof visual_post_items == undefined){
  */

  console.log(req.user.username+' req.body: view_selection body-->>');
  file_path_obj.print_log_if_not_vamps(req, 'req.body = ' + JSON.stringify(req.body));
  console.log('<<--req.body: view_selection');

  helpers.start = process.hrtime();
  let image_to_open = {};

  let visual_post_items = start_visual_post_items(req);

  visual_post_items.ts = file_path_obj.get_user_timestamp(req);

  console.log('entering MTX.get_biom_matrix');
  console.time("TIME: biom_matrix_new");
  const biom_matrix_obj = new biom_matrix_controller.BiomMatrix(req, visual_post_items);
  let biom_matrix = biom_matrix_obj.biom_matrix;
  console.timeEnd("TIME: biom_matrix_new");

  visual_post_items.max_ds_count = biom_matrix.max_dataset_count;

  if (visual_post_items.metadata.indexOf('primer_suite') !== -1){
    visual_post_items.metadata.push('primers');
  }
  let metadata = META.write_mapping_file(visual_post_items);

  console.log('image to open', image_to_open);

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

function get_dataset_ids(req) {
  let dataset_ids = [];
  if (req.body.api === '1'){
    console.log('API-API-API');
    dataset_ids = JSON.parse(req.body.ds_order);
  } else if (req.body.resorted === '1'){
    dataset_ids = req.body.ds_order;
  } else if (req.body.from_geo_search === '1'){
    dataset_ids = req.body.dids;
  } else {
    dataset_ids = JSON.parse(req.body.dataset_ids);
  }
  return dataset_ids;
}

function no_data(req, res, needed_constants) {
  console.log('redirecting back -- no data selected');
  req.flash('fail', 'Select Some Datasets');
  render_visuals_index(req, res, needed_constants);
}

//
// U N I T  S E L E C T I O N
//
// use the isLoggedIn function to limit exposure of each page to
// logged in users only
// test: select datasets
router.post('/unit_selection', helpers.isLoggedIn, function(req, res) {
  console.log("req.session.unit_choice: ");
  console.log(req.session.unit_choice);
  let current_unit_choice = "";
  if (typeof unit_choice === 'undefined'){
    current_unit_choice = 'tax_' + C.default_taxonomy.name + '_simple';
    console.log(current_unit_choice);
  }
  else {
    current_unit_choice = unit_choice;
  }

  console.log(req.user.username+' req.body: unit_selection-->>');
  file_path_obj.print_log_if_not_vamps(req, JSON.stringify(req.body));
  console.log('req.body: unit_selection');

  let dataset_ids = get_dataset_ids(req);
  /*
  * I call this here and NOT in view_selection
  A user can jump here directly from geo_search
  However a user can jump directly to view_select from
  saved datasets which they could conceivably manipulate
  * */

  dataset_ids = helpers.screen_dids_for_permissions(req, dataset_ids);

  file_path_obj.print_log_if_not_vamps(req, 'dataset_ids ' + JSON.stringify(dataset_ids));

  let needed_constants = helpers.retrieve_needed_constants(C,'unit_selection');
  if (dataset_ids === undefined || dataset_ids.length === 0) {
    no_data(req, res, needed_constants);
    return;
  }
  else {
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

      chosen_dataset_order.push( { did:did, name:pname + '--' + dname } );  // send this to client
      // !!!use default taxonomy here (may choose other on this page)
      file_path_obj.test_if_json_file_exists(req, i, dataset_ids, did);
    }

    // benchmarking
    helpers.start = process.hrtime();
    helpers.elapsed_time("START: select from sequence_pdr_info and sequence_uniq_info-->>>>>>");

    console.log('chosen_dataset_order-->');
    file_path_obj.print_log_if_not_vamps(req, chosen_dataset_order);
    console.log('<--chosen_dataset_order');

    // else {
    //   console.log("unit_choice is defined: " + unit_choice);
    // }
    res.render('visuals/unit_selection', {
      title: 'VAMPS: Units Selection',
      referer: 'visuals_index',
      chosen_datasets: JSON.stringify(chosen_dataset_order),
      constants    : JSON.stringify(needed_constants),
      md_cust      : JSON.stringify(custom_metadata_headers),  // should contain all the cust headers that selected datasets have
      md_req       : JSON.stringify(required_metadata_headers),   //
      unit_choice  : current_unit_choice,
      user         : req.user,
      hostname     : req.CONFIG.hostname,
    });  // end render
  }
  // benchmarking
  helpers.elapsed_time(">>>>>>>> 4 After Page Render <<<<<<");

}); // end fxn

/*
 * GET visualization page.
 */

function get_data_to_open(req) {
  let DATA_TO_OPEN = {};
  if (req.body.data_to_open) {
    // open many projects
    let obj = JSON.parse(req.body.data_to_open);
    for (let pj in obj){
      let pid = PROJECT_INFORMATION_BY_PNAME[pj].pid;
      DATA_TO_OPEN[pid] = obj[pj];
    }
    //console.log('got data to open '+data_to_open)
  } else if (req.body.project){
    // open whole project
    DATA_TO_OPEN[req.body.project_id] = DATASET_IDS_BY_PID[req.body.project_id];
  }
  console.log('DATA_TO_OPEN');
  console.log(DATA_TO_OPEN);
  return DATA_TO_OPEN;
}

function render_visuals_index(res, req, needed_constants = C) {
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
}

// test: first page
router.get('/visuals_index', helpers.isLoggedIn, function(req, res) {
  console.log('in GET visuals_index');
  // This page is arrived at using GET from the Main Menu
  // It will be protected using the helpers.isLoggedIn function
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
  // GLOBAL
  DATA_TO_OPEN = get_data_to_open(req);

  let needed_constants = helpers.retrieve_needed_constants(C,'visuals_index');
  render_visuals_index(res, req, needed_constants);
});

// test: show page
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
  // GLOBAL
  DATA_TO_OPEN = get_data_to_open(req);

  let needed_constants = C;
  render_visuals_index(res, req, needed_constants);
});

//
//
// test: reorder_datasets
router.post('/reorder_datasets', helpers.isLoggedIn, function(req, res) {
  let selected_dataset_order = {};
  selected_dataset_order.names = [];
  selected_dataset_order.ids = [];
  for (let n in req.session.chosen_id_order){
    let did = req.session.chosen_id_order[n];
    let pjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project+'--'+DATASET_NAME_BY_DID[did];
    selected_dataset_order.names.push(pjds);
    selected_dataset_order.ids.push(did);
  }

  // console.log(req.session);
  const user_timestamp = file_path_obj.get_user_timestamp(req);
  res.render('visuals/reorder_datasets', {
    title: 'VAMPS: Reorder Datasets',
    selected_datasets: JSON.stringify(selected_dataset_order),
    constants: JSON.stringify(C),
    referer: req.body.referer,
    ts: user_timestamp,
    user: req.user, hostname: req.CONFIG.hostname,
  });

});
//
//
// test: view_saved_datasets from selection
router.post('/view_saved_datasets', helpers.isLoggedIn, function(req, res) {
  // this fxn is required for viewing list of saved datasets
  // when 'toggle open button is activated'
  // let fxn = req.body.fxn;
  // console.log('XX'+JSON.stringify(req.body));
  // let file_path = path.join(req.CONFIG.USER_FILES_BASE, req.body.user, req.body.filename);
  let file_path = file_path_obj.get_user_file_path(req);
  console.log("file_path from view_saved_datasets");
  console.log(file_path);
  // let dataset_ids = [];

  read_file_when_ready(file_path);
  fs.readFile(file_path, 'utf8', function readFile(err,data) {
    if (err) {
      let msg = 'ERROR Message ' + err;
      helpers.render_error_page(req,res,msg);
    } else {
      console.log(data);
      res.send(data);
    }
  });
});

//
//
// test: dendrogram
router.post('/dendrogram',  helpers.isLoggedIn,  function(req,  res) {
  console.log('found routes_dendrogram-x');
///// this vesion of dendrogram is or running d3 on CLIENT: Currently:WORKING
///// It passes the newick string back to view_selection.js
///// and tries to construct the svg there before showing it.
  console.log('req.body dnd');
  file_path_obj.print_log_if_not_vamps(req, req.body);
  console.log('req.body dnd');
  let metric = req.body.metric;
  // let script = req.body.script; // python,  phylogram or phylonator
  const script = '/distance_and_ordination.py';
  let image_type = req.body.image_type; // png(python script) or svg
  //console.log('image_type '+image_type);
  // see: http://bl.ocks.org/timelyportfolio/59acc3853b02e47e0dfc

  let biom_file_path = file_path_obj.get_file_tmp_path_by_ending(req, 'count_matrix.biom');
  let tmp_file_path = file_path_obj.get_tmp_file_path(req);

  let user_timestamp = file_path_obj.get_user_timestamp(req);
  let options = {
    scriptPath: req.CONFIG.PATH_TO_VIZ_SCRIPTS,
    args: [ '-in',  biom_file_path,  '-metric', metric, '--function', 'dendrogram-' + image_type, '--basedir', tmp_file_path, '--prefix', user_timestamp ],
  };
  console.log(options.scriptPath + script + ' ' + options.args.join(' '));

  let dendrogram_process = spawn( options.scriptPath + script,
    options.args, {
      env: {'PATH': req.CONFIG.PATH,
        'LD_LIBRARY_PATH': req.CONFIG.LD_LIBRARY_PATH},
      detached: true,
      stdio: 'pipe' // stdin,  stdout,  stderr
    });

  let stdout = '';
  dendrogram_process.stdout.on('data',  function dendrogramProcessStdout(data) {
    stdout += data.toString();
  });

  dendrogram_process.on('close',  function dendrogramProcessOnClose(code) {
    console.log('dendrogram_process process exited with code ' + code);
    let lines = [];
    if (code === 0){ // SUCCESS
      if (image_type === 'd3'){
        // file_path_obj.print_log_if_not_vamps(req, 'stdout: ' + stdout);

        lines = stdout.split('\n');
        const startsWith_newick = lines.filter((line) => line.startsWith("NEWICK")).join("");
        let newick = "";
        try {
          newick = startsWith_newick.split('=')[1];
          // file_path_obj.print_log_if_not_vamps(req, 'NWK->' + newick);
        }
        catch(err) {
          newick = {"ERROR": err};
        }
        res.send(newick);
        return;
      }
    }
    else{
      console.log('stdout: ' + stdout);
    }
  });
});

//
// P C O A
//
//test: "PCoA 2D Analyses (R/pdf)"
// router.post('/pcoa', helpers.isLoggedIn, function(req, res) {
//   console.log('in PCoA');
//   //console.log(metadata);
//   let ts = req.body.ts;
//   // let rando = Math.floor((Math.random() * 100000) + 1);  // required to prevent image caching
//   let metric = req.body.metric;
//   // let image_type = req.body.image_type;
//   //let image_file = ts+'_'+metric+'_pcoaR'+rando.toString()+'.pdf';
//   let image_file = ts+'_pcoa.pdf';
//   let biom_file_name = ts+'_count_matrix.biom';
//   let biom_file = path.join(req.CONFIG.PROCESS_DIR,'tmp', biom_file_name);

//   let tmp_path = path.join(req.CONFIG.PROCESS_DIR,'tmp');
//
//   let md1 = req.body.md1 || "Project";
//   let md2 = req.body.md2 || "Description";
//
//     // let options = {
//     //   scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
//     //   args :       [ '-in', biom_file, '-metric', metric, '--function', 'pcoa_2d', '--site_base', req.CONFIG.PROCESS_DIR, '--prefix', ts],
//     // };
//     let options2 = {
//       scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
//       args :       [ tmp_path, ts, metric, md1, md2, image_file],
//     };
//     console.log(options2.scriptPath+'/pcoa2.R '+options2.args.join(' '));
//
//     let pcoa_process = spawn( options2.scriptPath+'/pcoa2.R', options2.args, {
//         env:{ 'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
//         detached: true,
//         stdio: [ 'ignore', null, log ]
//         //stdio: 'pipe' // stdin, stdout, stderr
//     });
//
//     pcoa_process.on('close', function pcoaProcessOnClose(code) {
//         //console.log('pcoa_process process exited with code ' + code+' -- '+output);
//         //distance_matrix = JSON.parse(output);
//         //let last_line = ary[ary.length - 1];
//       let html = "";
//       if (code === 0){   // SUCCESS
//
//         //html = "<img src='/"+image_file+"'>";
//         //let image = path.join('/tmp/',image_file);
//         html = "<div id='pdf'>";
//         html += "<object data='/"+image_file+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='1000' height='600' />";
//         html += " <p>ERROR in loading pdf file</p>";
//         html += "</object></div>";
//         //console.log(html);
//
//       }
//       else {
//         console.log('ERROR');
//         html='PCoA Script Failure -- Try a deeper rank, or more metadata or datasets';
//       }
//       res.send(html);
//       });
// });
//test: "PCoA 2D Analyses (R/pdf)"
router.post('/pcoa', helpers.isLoggedIn, function(req, res) {

  console.log('in PCoA');
  // Nov 13 12:06:36 bpcweb7 ts from pcoa 2d:  ashipunova_1573664792697

  const user_timestamp = file_path_obj.get_user_timestamp(req);
  const metric = req.body.metric;
  let image_file = file_path_obj.get_file_names(req)['pcoa.pdf'];
    // user_timestamp + '_pcoa.pdf';
  const md1 = req.body.md1 || "Project";
  const md2 = req.body.md2 || "Description";
  const tmp_path = file_path_obj.get_tmp_file_path(req);
  let options2 = {
    script: '/pcoa2.R',
    scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
    args :       [ tmp_path, user_timestamp, metric, md1, md2, image_file],
  };
  console.log(options2.scriptPath + options2.script + ' ' + options2.args.join(' '));

  let pcoa_process = spawn( options2.scriptPath + options2.script, options2.args, {
    env: { 'PATH': req.CONFIG.PATH, 'LD_LIBRARY_PATH': req.CONFIG.LD_LIBRARY_PATH },
    detached: true,
    stdio: [ 'ignore', null, null ]
  });

  let html = "";
  pcoa_process.on('close', function pcoaProcessOnClose(code) {

    if (code === 0) {   // SUCCESS

      html = "<div id='pdf'>";
      html += "<embed src='/static_base/tmp/" + image_file + "' type='application/pdf' width='1000' height='600' />";
      html += "</div>";
      console.log(html);
      var data = {}
        data.html = html
        data.filename = image_file   // returns data and local file_name to be written to
        res.json(data)
        return
      
    }
    else {
      console.log('ERROR');
      html = 'PCoA Script Failure -- Try a deeper rank, or more metadata or datasets';
    }
    //res.send(html);
  });
});
//
//
//  EMPEROR....
// POST is for PC file link
// test: "PCoA 3D Analyses (Emperor)"
router.post('/pcoa3d', helpers.isLoggedIn, function(req, res) {
  console.log('POST in pcoa3d');

  let metric = req.session.selected_distance;
  const biom_file_path = file_path_obj.get_file_tmp_path_by_ending(req, 'count_matrix.biom');
  const mapping_file_path = file_path_obj.get_file_tmp_path_by_ending(req, 'metadata.txt');

  let options1 = {
    scriptPath : file_path_obj.get_viz_scripts_path(req),
    script: "distance_and_ordination.py",
    args: ['-in', biom_file_path,
      '-metric', metric,
      '--function', 'pcoa_3d',
      '--basedir', file_path_obj.get_tmp_file_path(req),
      '--prefix', file_path_obj.get_user_timestamp(req),
      '-m', mapping_file_path
    ],
  };

  const script_full_path = path.join(options1.scriptPath, options1.script);
  let pcoa_process = spawn( script_full_path, options1.args, {
    env:{ 'PATH': req.CONFIG.PATH, 'LD_LIBRARY_PATH': req.CONFIG.LD_LIBRARY_PATH },
    detached: true,
    stdio:['pipe', 'pipe', 'pipe']
  });
  // pcoa_process.stdout.on('data', function pcoaProcessStdout(data) {
  //   //console.log('1stdout: ' + data);
  // });
  let stderr1 = '';
  pcoa_process.stderr.on('data', function pcoaProcessStderr(data) {
    console.log('1stderr-POST: ' + data);
    stderr1 += data;
  });
  pcoa_process.on('close', function pcoaProcessOnClose(code) {
    console.log('pcoa_process1 process exited with code ' + code);
    if (code === 0){ // SUCCESS

      const pc_file_name = file_path_obj.get_file_names(req)['pc.txt'];
      const biom_file_name = file_path_obj.get_file_names(req)['count_matrix.biom'];
      const mapping_file_name = file_path_obj.get_file_names(req)['metadata.txt'];
      const dist_file_name = file_path_obj.get_file_names(req)['distance.csv'];
      const dir_name = file_path_obj.get_file_names(req)['pcoa3d'];
      const index_file_name = dir_name + '/index.html';
      let html = "** <a href='/static_base/tmp/" + index_file_name + "' target='_blank'>Open Emperor</a> **";
      html += "<br>Principal Components File: <a href='/static_base/tmp/" + pc_file_name + "' target='_blank'>" + pc_file_name + "</a>";
      html += "<br>Biom File: <a href='/static_base/tmp/" + biom_file_name + "' target='_blank'>" + biom_file_name + "</a>";
      html += "<br>Mapping (metadata) File: <a href='/static_base/tmp/" + mapping_file_name + "' target='_blank'>" + mapping_file_name + "</a>";
      html += "<br>Distance File: <a href='/static_base/tmp/" + dist_file_name + "' target='_blank'>" + dist_file_name + "</a>";

      let data = {};
      data.html = html;
      data.filename = index_file_name ;  // returns data and local file_name to be written to
      res.json(data);
    }
    else{
      console.log('ERROR in PCOA 3D: ', stderr1);
      res.send('Python Script Error: ' + stderr1);
    }
  });
  /////////////////////////////////////////////////
});

//
// DATA BROWSER
//
// test: "data browser Krona" viz.
function format_sumator(allData) {
  let array = [""];
  printList(allData);
  array.push("");
  // console.log(array);

  function printList(items) {
    if (helpers.is_object(items)) {
      getChildren(items);
    }
    else if (helpers.is_array(items)) {
      printArray(items);
    }
    else {
      array.push("<val>" + items + "</val>");
    }
  }

  function getChildren(parent) {
    const fields_w_val = ["rank", "seqcount", "val"];
    // const fields2skip = ["depth", "name", "parent", "children"];
    const fields2skip = ["name"];

    for (let child in parent) {
      if (fields_w_val.includes(child)) {
        array.push(`<${child}>`);
        printList(parent[child]);
        array.push(`</${child}>`);
      }
      else if (!fields2skip.includes(child)) {
        array.push(`<node name='${child}'>`);
        printList(parent[child]);
        array.push("</node>");
      }
    }
  }

  function printArray(myArray){
    for(let i = 0; i < myArray.length; i++){
      //console.log(myArray[i]);
      array.push("<val>" + myArray[i] + "</val>");
    }
  }
  return array.join("");
}

router.get('/dbrowser', helpers.isLoggedIn, function(req, res) {
  console.log('in dbrowser');
  let matrix_file_path = file_path_obj.get_file_tmp_path_by_ending(req, 'count_matrix.biom');
  read_file_when_ready(matrix_file_path);
  let biom_matrix = JSON.parse(fs.readFileSync(matrix_file_path, 'utf8'));
  let max_total_count = Math.max.apply(null, biom_matrix.column_totals);

  // sum counts
  console.time("TIME: get_sumator new");
  const taxonomy_class = new biom_matrix_controller.Taxonomy({"chosen_dids": req.session.chosen_id_order, "visual_post_items": {}, "taxa_counts_module": {}});

  let sumator_new = taxonomy_class.get_sumator(biom_matrix);

  console.timeEnd("TIME: get_sumator new");

  console.time("TIME: format_sumator sumator new");

  let result_xml = format_sumator(sumator_new);
  console.timeEnd("TIME: format_sumator sumator new");

  // console.log("result_xml: ");
  // console.log(result_xml);
  console.log("render visuals/dbrowser");

  res.render('visuals/dbrowser', {
    title: 'VAMPS:Taxonomy Browser (Krona)',
    user:                req.user,
    html:                result_xml,
    max_total_count:     max_total_count,
    matrix:              JSON.stringify(biom_matrix)
  });
});

//
// OLIGOTYPING
//
// Commented out on 2019/09/16 aav
// router.post('/oligotyping', helpers.isLoggedIn, function(req, res) {
//   let ts = req.session.ts;
//   console.log('in POST oligotyping');
//
//   let html='';
//   let matrix_file_path = path.join(config.PROCESS_DIR,'tmp',ts+'_count_matrix.biom');
//   let biom_matrix = JSON.parse(fs.readFileSync(matrix_file_path, 'utf8'));
//   let max_total_count = Math.max.apply(null, biom_matrix.column_totals);
//
//   //console.log('max_total_count '+max_total_count.toString());
//
//
//   // write html to a file and open it
//
//   console.log("render visuals/oligotyping");
//   //let file_name = ts+'_krona.html';
//   //let html_path = path.join(req.CONFIG.PROCESS_DIR,'tmp', file_name);
//
//   res.render('visuals/oligotyping', {
//     title: 'VAMPS:Oligotyping',
//     html:                html,
//     max_total_count:     max_total_count,
//     matrix:              JSON.stringify(biom_matrix),
//     //chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
//     user :  req.user, hostname : req.CONFIG.hostname,
//
//   });
//
//
// });

function get_fill(req) {
  let fill = req.session.tax_depth.charAt(0).toUpperCase() + req.session.tax_depth.slice(1);
  if (fill === 'Klass') {
    fill = 'Class';
  }
  return fill;
}

function get_plot_specific_options(plot_type, req, options, svgfile_name) {
  let phy, md1, md2, ordtype, maxdist, script;
  let dist_metric = req.body.metric;
  let fill = get_fill(req);

  switch(plot_type) {
    case 'bar':
      options.script = 'phyloseq_bar.R';
      phy = req.body.phy;
      options.args = options.args.concat([svgfile_name, phy, fill]);
      break;
    case 'heatmap':
      options.script = 'phyloseq_heatmap.R';
      //image_file = ts+'_phyloseq_'+plot_type+'_'+rando.toString()+'.png';
      phy = req.body.phy;
      md1 = req.body.md1;
      ordtype = req.body.ordtype;
      options.args = options.args.concat([svgfile_name, dist_metric, phy, md1, ordtype, fill]);
      break;
    case 'network':
      options.script = 'phyloseq_network.R';
      md1 = req.body.md1 || "Project";
      md2 = req.body.md2 || "Description";
      maxdist = req.body.maxdist || "0.3";
      options.args = options.args.concat([svgfile_name, dist_metric, md1, md2, maxdist]);
      break;
    case 'ord':
      options.script = 'phyloseq_ord.R';
      md1 = req.body.md1 || "Project";
      md2 = req.body.md2 || "Description";
      ordtype = req.body.ordtype || "PCoA";
      options.args = options.args.concat([svgfile_name, dist_metric, md1, md2, ordtype]);
      break;
    case 'tree':
      options.script = 'phyloseq_tree.R';
      md1 = req.body.md1 || "Description";
      options.args = options.args.concat([svgfile_name, dist_metric, md1]);
      break;
  }
  // if (plot_type === 'heatmap'){   // for some unknown reason heatmaps are different: use pdf not svg

  return options;

}

function show_data(res, contents, svgfile_name) {
  let data = {};
  data.html = contents;
  data.filename = svgfile_name; // returns data and local file_name to be written to
  res.json(data);
}

//
//
// test: choose phylum, "Phyloseq Bars (R/svg)"
router.post('/phyloseq', helpers.isLoggedIn, function(req, res) {
  console.log('in phyloseq post');

  const user_timestamp = file_path_obj.get_user_timestamp(req);
  const svgfile_name = file_path_obj.phyloseq_svgfile_name(req, user_timestamp);
  const tmp_file_path = file_path_obj.get_tmp_file_path(req);
  const svgfile_path = path.join(tmp_file_path, svgfile_name);

  let options = {
    scriptPath: req.CONFIG.PATH_TO_VIZ_SCRIPTS,
    args:       [ tmp_file_path, user_timestamp ],
  };

  let plot_type = req.body.plot_type;
  console.time("TIME: plot_type = " + plot_type);

  options = get_plot_specific_options(plot_type, req, options, svgfile_name);

  console.log(path.join(options.scriptPath, options.script) + ' ' + options.args.join(' '));
  let phyloseq_process = spawn( path.join(options.scriptPath, options.script), options.args, {
    env: {'PATH': req.CONFIG.PATH},
    detached: true,
    //stdio: [ 'ignore', null, null ]
    stdio: 'pipe'  // stdin, stdout, stderr
  });
  let stdout = '';
  let lastline = '';
  phyloseq_process.stdout.on('data', function phyloseqProcessStdout(data) {
    lastline = data;
    stdout += data;
  });

  let stderr = '';
  phyloseq_process.stderr.on('data', function phyloseqProcessStderr(data) {
    stderr += data;
  });

  phyloseq_process.on('close', function phyloseqProcessOnClose(code) {
    console.log('phyloseq_process process exited with code ' + code);

    let html = '';
    if (code === 0){   // SUCCESS

      read_file_when_ready(svgfile_path);
      fs.readFile(svgfile_path, 'utf8', function(err, contents){

        if(err){ res.send('ERROR reading file')}
        show_data(res, contents, svgfile_name);

      });
    }
    else {
      console.log('ERROR-2');
      html = "<dev class = 'base_color_red'>Phyloseq Error: Try selecting more data, deeper taxonomy or excluding 'NA's</dev>";
      show_data(res, html, svgfile_name);
    }
  });
  console.timeEnd("TIME: plot_type = " + plot_type);

});

//
//  G E O S P A T I A L (see view_selection.js)
//

//
// BAR-CHART -- SINGLE
//
// test: BAR-CHART -- SINGLE - (click on a bar)

// function get_selected_pjds() {
//   pi.chosen_datasets = [{did:did1, name:ds1}, {did:did2, name:ds2}];
//   pi.no_of_datasets=2;
// }

function get_chosen_datasets(selected_did_arr) {
  if (!helpers.is_array(selected_did_arr)) {
    selected_did_arr = [selected_did_arr];
  }
  return selected_did_arr.reduce((res_arr, did) => {
    let selected_pjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project + '--' + DATASET_NAME_BY_DID[did];
    res_arr.push({did: did, name: selected_pjds});
    return res_arr;
  }, []);
}

function make_pi(selected_did_arr, req, metric = undefined) {
  let pi = {};
  pi.chosen_datasets = get_chosen_datasets(selected_did_arr);
  // let selected_pjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[selected_did]].project + '--' + DATASET_NAME_BY_DID[selected_did];
  // pi.chosen_datasets = [{did: selected_did, name: selected_pjds}];
  pi.no_of_datasets = pi.chosen_datasets.length;
  pi.ts = file_path_obj.get_user_timestamp(req);
  pi.unit_choice = req.session.unit_choice;
  pi.min_range = req.session.min_range;
  pi.max_range = req.session.max_range;
  pi.normalization = req.session.normalization;
  pi.tax_depth = req.session.tax_depth;
  pi.include_nas = req.session.include_nas;
  pi.domains = req.session.domains;
  if (metric) {
    pi.selected_distance = metric;
  }

  return pi;
}

function make_new_matrix(req, pi, selected_did, order) {
  let overwrite_the_matrix_file = false;  // DO NOT OVERWRITE The Matrix File
  console.time("TIME: biom_matrix_new_from_bar_single");
  const biom_matrix_obj = new biom_matrix_controller.BiomMatrix(req, pi, overwrite_the_matrix_file);
  let new_matrix = biom_matrix_obj.biom_matrix;
  console.timeEnd("TIME: biom_matrix_new_from_bar_single");

  new_matrix.dataset = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[selected_did]].project + '--' + DATASET_NAME_BY_DID[selected_did];
  new_matrix.did = selected_did;
  new_matrix.total = 0;
  new_matrix = helpers.sort_json_matrix(new_matrix, order);
  return new_matrix;
}

function mysqlSelectedSeqsPerDID_to_file(err, req, res, rows, selected_did){
  console.time("TIME: mysqlSelectedSeqsPerDID_to_file");

  if (err)  {
    console.log('Query error: ' + err);
    console.log(err.stack);
    res.send(err);
  }
  else {
    let new_rows = {};
    new_rows[selected_did] = [];
    new_rows = rows.reduce((ob, item) => {
      let did = item.dataset_id;
      // ob[did] is the same as new_rows[selected_did]
      ob[did].push({
        seq: item.seq.toString(),
        seq_count: item.seq_count,
        gast_distance: item.gast_distance,
        classifier: item.classifier,
        domain_id: item.domain_id,
        phylum_id: item.phylum_id,
        klass_id: item.klass_id,
        order_id: item.order_id,
        family_id: item.family_id,
        genus_id: item.genus_id,
        species_id: item.species_id,
        strain_id: item.strain_id
      });
      return ob;
    }, new_rows);

    // order by seq_count DESC
    new_rows[selected_did].sort(function sortByCount(a, b) {
      return b.seq_count - a.seq_count;
    });

    let file_path = file_path_obj.get_sequences_json_file_path(req, selected_did);
    console.log("EEE5 seq file_path:", file_path);
    fs.writeFileSync(file_path, JSON.stringify(new_rows[selected_did]));
  }
  console.timeEnd("TIME: mysqlSelectedSeqsPerDID_to_file");
}

// On the bar_single page with the single taxonomy bar and list of included taxonomies
// when you click on the button: Ordering: Taxa Names it should toggle both the list and and bar to order
// the taxonomic names a-z then to z-a and so forth.
//
// The button: Ordering: Counts is also a toggle but the ordering is by taxonomic counts and not alphabetical.

function get_new_order_by_button(order) {
  let new_order = {};
  switch (order.orderby) {
    case "alpha":
      if (order.value === 'a') {
        new_order.alpha_value = 'z';
      }
      else {
        new_order.alpha_value = 'a';
      }
      new_order.count_value = '';
      break;
    case "count":
      if (order.value === 'min') {
        new_order.count_value = 'max';
      } else {
        new_order.count_value = 'min';
      }
      new_order.alpha_value = '';
      break;
    default:
      break;
  }
  return new_order;
}

function write_seq_file_async(req, res, selected_did) {
  connection.query(QUERY.get_sequences_perDID([selected_did], req.session.unit_choice),
    function (err, rows) {
      mysqlSelectedSeqsPerDID_to_file(err, req, res, rows, selected_did);
    });
}

router.get('/bar_single', helpers.isLoggedIn, function(req, res) {
  console.log('in routes_viz/bar_single');
  let myurl = url.parse(req.url, true);
  //console.log('in piechart_single',myurl.query)
  let selected_did = myurl.query.did;
  let orderby = myurl.query.orderby || 'alpha'; // alpha, count
  let value = myurl.query.val || 'z'; // a,z, min, max
  let order = {orderby: orderby, value: value}; // orderby: alpha: a,z or count: min,max

  let pi = make_pi([selected_did], req);
  let new_matrix = make_new_matrix(req, pi, selected_did, order);

  let new_order = get_new_order_by_button(order);

  if (pi.unit_choice !== 'OTUs') {
    write_seq_file_async(req, res, selected_did);
    const bar_type = 'single';
    const timestamp_only = file_path_obj.get_timestamp_only(req);
    LoadDataFinishRequestFunc({req, res, pi, timestamp_only, new_matrix, new_order, bar_type});
  }
});

function LoadDataFinishRequestFunc({req, res, pi, timestamp_only, new_matrix, new_order, bar_type, dist = ""}) {
  console.log('LoadDataFinishRequest in bar_' + bar_type);
  let title = 'Taxonomic Data';
  if (pi.unit_choice === 'OTUs') {
    title = 'OTU Count Data';
  }
  let url = 'visuals/user_viz_data/bar_' + bar_type;
  res.render(url, {
    title: title,
    ts: timestamp_only,
    matrix: JSON.stringify(new_matrix),
    post_items: JSON.stringify(pi),
    bar_type: bar_type,
    order: JSON.stringify(new_order),
    dist: dist,
    user: req.user, hostname: req.CONFIG.hostname,
  });
}

//
// B A R - C H A R T  -- D O U B L E
//
// test: click on cell of distance heatmap
router.get('/bar_double', helpers.isLoggedIn, function(req, res) {
  console.log('in routes_viz/bar_double');

  let myurl = url.parse(req.url, true);
  // console.log(myurl.query);
  let did1 = myurl.query.did1;
  let did2 = myurl.query.did2;
  let dist = myurl.query.dist;
  let metric = myurl.query.metric;
  let orderby = myurl.query.orderby || 'alpha'; // alpha, count
  let value = myurl.query.val || 'z'; // a,z, min, max
  let order = {orderby: orderby, value: value}; // orderby: alpha: a,z or count: min,max
  let pi = make_pi([did1, did2], req, metric);

  let overwrite_matrix_file = false;  // DO NOT OVERWRITE The Matrix File
  console.time("TIME: biom_matrix_new_from_bar_double");
  const biom_matrix_obj = new biom_matrix_controller.BiomMatrix(req, pi, overwrite_matrix_file);
  let new_matrix = biom_matrix_obj.biom_matrix;
  console.timeEnd("TIME: biom_matrix_new_from_bar_double");

  //DOUBLE
  //console.log(JSON.stringify(new_matrix))
  new_matrix = helpers.sort_json_matrix(new_matrix, order);

  let new_order = get_new_order_by_button(order);

  write_seq_file_async(req, res, did1);
  write_seq_file_async(req, res, did2);
  let bar_type = "double";
  const timestamp_only = file_path_obj.get_timestamp_only(req);
  LoadDataFinishRequestFunc({req, res, pi, timestamp_only, new_matrix, new_order, bar_type, dist});
});

//
//  S E Q U E N C E S
//

function err_read_file(err, req, res, seqs_filename) {
  console.log(err);
  if (req.session.unit_choice === 'OTUs'){
    res.send('<br><h3>No sequences are associated with this OTU project.</h3>');
  }
  else {
    res.send('<br><h3>No file found: ' + seqs_filename + "; Use the browsers 'Back' button and try again</h3>");
  }
}

function get_clean_data_or_die(req, res, data, pjds, selected_did, search_tax, seqs_filename) {
  let clean_data = "";
  console.log("EEE1 seqs_filename", seqs_filename);
  try {
    clean_data = JSON.parse(data);
  } catch (e) {
    console.log(e);
    // TODO: Andy, how to test this?
    res.render('visuals/user_viz_data/sequences', {
      title: 'Sequences',
      ds: pjds,
      did: selected_did,
      tax: search_tax,
      fname: seqs_filename,
      seq_list: 'Error Retrieving Sequences',
      user: req.user, hostname: req.CONFIG.hostname,
    });
    return;
  }
  return clean_data;
}

function render_seq(req, res, pjds, search_tax, seqs_filename = '', seq_list = '')
{
  console.log("EEE2 seqs_filename", seqs_filename);

  res.render('visuals/user_viz_data/sequences', {
    title: 'Sequences',
    ds: pjds,
    tax: search_tax,
    fname: seqs_filename,
    seq_list: seq_list,
    user: req.user,
    hostname: req.CONFIG.hostname,
  });
}

function filter_data_by_last_taxon(search_tax, clean_data) {
  const search_tax_arr = search_tax.split(";");
  const last_element_number = search_tax_arr.length - 1;
  const last_taxon = search_tax_arr[last_element_number];
  const curr_rank = C.RANKS[last_element_number];
  const rank_name_id = curr_rank + "_id";
  const db_id = new_taxonomy.taxa_tree_dict_map_by_rank[curr_rank].filter(i => i.taxon === last_taxon).map(e => e.db_id);
  let filtered_data = clean_data;

  try {
    filtered_data = clean_data.filter(i => (parseInt(i[rank_name_id]) === parseInt(db_id)));
  }
  catch (e) {
    console.log("No clean_data in filter_data_by_last_taxon");
  }
  return filtered_data;
}

function get_long_tax_name(curr_ob) {
  return Object.keys(curr_ob).reduce((long_name_arr, key) => {
    if (key.endsWith("_id")) {
      let db_id = curr_ob[key];
      let curr_rank_name = key.substring(0, key.length - 3);
      let curr_name = "";
      try {
        curr_name = new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[db_id + "_" + curr_rank_name].taxon;
      }
      catch(e) {
        curr_name = curr_rank_name + "_NA";
      }
      long_name_arr.push(curr_name);
    }
    return long_name_arr;
  }, []);
}

function make_seq_list_by_filtered_data_loop(filtered_data) {
  let seq_list = filtered_data.reduce((comb_list, curr_ob) => {
    // console.time("TIME: prettyseq");
    let prettyseq = helpers.make_color_seq(curr_ob.seq);
    // console.timeEnd("TIME: prettyseq");
    let seq_tax_arr = get_long_tax_name(curr_ob);
    let seq_tax = seq_tax_arr.join(";");
    comb_list.push({
      prettyseq: prettyseq,
      seq: curr_ob.seq,
      seq_count: curr_ob.seq_count,
      gast_distance: curr_ob.gast_distance,
      classifier: curr_ob.classifier,
      tax: seq_tax
    });

    return comb_list;
  }, []);

  return seq_list;
}

async function read_file_when_ready(filename_path) {
  return await file_path_obj.checkExistsWithTimeout(filename_path, 1000);
}

// test: visuals/bar_single?did=474463&ts=anna10_1568652597457&order=alphaDown
// click on a barchart row
router.get('/sequences/', helpers.isLoggedIn, function(req, res) {
  console.log('in sequences');
  const myurl = url.parse(req.url, true);
  // console.log(myurl.query);
  const search_tax = myurl.query.taxa;
  const seqs_filename = myurl.query.filename;
  const tmp_file_path = file_path_obj.get_tmp_file_path(req);
  const seqs_filename_path = path.join(tmp_file_path, seqs_filename);
  console.log("EEE1 seqs_filename_path", seqs_filename_path);

  //
  // http://localhost:3000/visuals/bar_single?did=474467&ts=anna10_1573500571628&order=alphaDown// anna10_474467_1573500576052_sequences.json
  let selected_did = myurl.query.did;
  let pjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[selected_did]].project + '--' + DATASET_NAME_BY_DID[selected_did];

  if (seqs_filename){
    //console.log('found filename', seqs_filename)

    console.log("EEE2 seqs_filename_path", seqs_filename_path);

    fs.access(seqs_filename_path, error => {
      if (error) {
        console.log("Not ready yet: ", seqs_filename_path);
      }
      else {
        fs.readFile(seqs_filename_path, 'utf8', function readFile(err, data) {
          console.time("TIME: readFile");
          if (err) {
            err_read_file(err, req, res, seqs_filename);
          }
          //console.log('parsing data')
          console.log("EEE3 seqs_filename", seqs_filename);

          let clean_data = get_clean_data_or_die(req, res, data, pjds, selected_did, search_tax, seqs_filename);

          console.time("TIME: loop through clean_data");
          let filtered_data = filter_data_by_last_taxon(search_tax, clean_data);
          let seq_list = make_seq_list_by_filtered_data_loop(filtered_data);
          console.timeEnd("TIME: loop through clean_data");

          render_seq(req, res, pjds, search_tax, seqs_filename, JSON.stringify(seq_list));
          console.timeEnd("TIME: readFile");
        }.bind());
      }
    });

    // fs.readFile(seqs_filename_path, 'utf8', function readFile(err, data) {
    //   console.time("TIME: readFile");
    //   if (err) {
    //     err_read_file(err, req, res, seqs_filename);
    //   }
    //   //console.log('parsing data')
    //   console.log("EEE3 seqs_filename", seqs_filename);
    //
    //   let clean_data = get_clean_data_or_die(req, res, data, pjds, selected_did, search_tax, seqs_filename);
    //
    //   console.time("TIME: loop through clean_data");
    //   let filtered_data = filter_data_by_last_taxon(search_tax, clean_data);
    //   let seq_list = make_seq_list_by_filtered_data_loop(filtered_data);
    //   console.timeEnd("TIME: loop through clean_data");
    //
    //   render_seq(req, res, pjds, search_tax, seqs_filename, JSON.stringify(seq_list));
    //   console.timeEnd("TIME: readFile");
    // }.bind());
  }
  else {
    // TODO: Andy, how to test this?
    // render_seq(req, res, pjds, search_tax, '', 'Error Retrieving Sequences');
    res.render('visuals/user_viz_data/sequences', {
      title: 'Sequences',
      ds: pjds,
      tax: search_tax,
      fname: '',
      seq_list: 'Error Retrieving Sequences',
      user: req.user, hostname: req.CONFIG.hostname,
    });
  }
});

/*
*   PARTIALS
*      These six partials all belong to the unit_selection page
*      and are shown via ajax depending on user selection in combo box
*       on that page.  AAV
*/
//test: simple_taxonomy
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

// test: it is only called from public/javascrips/metadata.js line 30
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

// test: on unit_select page drop down -select RDP
router.get('/partials/tax_rdp2.6_simple', helpers.isLoggedIn,  function(req, res) {
  res.render("visuals/partials/tax_rdp26_simple", {
    doms : C.UNITSELECT.rdp2_6_simple.domains,
  });
});

// test: on unit_select page drop down - select Generic
router.get('/partials/tax_generic_simple', helpers.isLoggedIn,  function(req, res) {
  res.render("visuals/partials/tax_generic_simple", {
    doms: C.DOMAINS
  });
});

//test: save_datasets
router.post('/save_datasets', helpers.isLoggedIn,  function(req, res) {

  console.log('req.body: save_datasets-->>');
  file_path_obj.print_log_if_not_vamps(req, req.body);
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
// test: click go to saved datasets
router.get('/saved_elements', helpers.isLoggedIn,  function(req, res) {
  console.log('in show_saved_datasets');
  if (req.user.username === 'guest'){
    req.flash('fail', "The 'guest' user cannot save datasets");
    res.redirect('/user_data/your_data');
  } else {
    //console.log('req.body: show_saved_datasets-->>');
    //console.log(req.body);
    //console.log('req.body: show_saved_datasets');
    let acceptable_prefixes = ['datasets', 'image'];
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
          if (parseInt(acceptable_prefixes.indexOf(pts[0])) !== -1 ){
            //file_info.files.push(files[f]);
            let stat = fs.statSync(path.join(saved_elements_dir, files[f]));
            file_info[stat.mtime.getTime()] = {
              'filename': files[f],
              'size': stat.size,
              'mtime': stat.mtime.toString()
            };
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

// html += add_html(dataset_arr, did, name);

function reorder_did_html(did, name, idx) {
  let html = "";
  html += "<tr class='tooltip_row'>";
  html += "<td class='dragHandle' id = '" + did + "--" + name + "'> ";
  html += "<input type = 'hidden' name = 'ds_order[]' value='" + did + "'>";
  html += (parseInt(idx)+1).toString() + " (id:" + did + ") - " + name;
  html += "</td>";
  html += "   <td>";
  html += "       <a href='#' onclick='move_to_the_top(" + (parseInt(idx) + 1).toString() + ",\"" + did + "--" + name + "\")'>^</a>";
  html += "   </td>";
  html += "</tr>";

  return html;
}

function reverse_or_reset_datasets(ids) {
  let html = '';

  html += "<table id='drag_table' class='table table-condensed' >";
  html += "<thead></thead>";
  html += "  <tbody>";
  html += ids.reduce((html_txt, did, idx) => {
    let name = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project + '--' + DATASET_NAME_BY_DID[did];
    return html_txt += reorder_did_html(did, name, idx);
  }, "");
  html += "</tbody>";
  html += "</table>";
  return html;
}

//
//  R E S E T
// test: from reorder_datasets click "reset order"
router.post('/reset_ds_order', helpers.isLoggedIn,  function(req, res) {
  console.log('in reset_ds_order');

  let html = '';
  html += reverse_or_reset_datasets(req.session.chosen_id_order);

  res.send(html);
});

function compare_by_key_name_asc(key_name) {
  return function compare( a, b ) {
    if ( a[key_name] < b[key_name] ){
      return -1;
    }
    if ( a[key_name] > b[key_name] ){
      return 1;
    }
    return 0;
  };

}


//
// A L P H A - B E T I Z E
// test: from re-order datasets, "Alphabetize"
router.post('/alphabetize_ds_order', helpers.isLoggedIn,  function(req, res) {
  console.log('in alphabetize_ds_order');

  let name_ids = req.session.chosen_id_order.reduce((arr_of_obj, did) => {
    let temp_obj = {
      did: did,
      d_name: PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project + '--' + DATASET_NAME_BY_DID[did]
    };
    arr_of_obj.push(temp_obj);
    return arr_of_obj;
  }, []);

  name_ids.sort(compare_by_key_name_asc("d_name"));
  let dids_sorted_by_dname = name_ids.reduce((did_arr, ob) => {
    did_arr.push(ob["did"]);
    return did_arr;
  }, []);

  let html = '';
  html += reverse_or_reset_datasets(dids_sorted_by_dname);

  res.send(html);
});


//
// R E V E R S E  O R D E R
//
// test: from re-order datasets, "Reverse"
router.post('/reverse_ds_order', helpers.isLoggedIn,  function(req, res) {
  console.log('in reverse_ds_order');
  let ids = JSON.parse(req.body.ids);
  ids.reverse();

  let html = '';
  html += reverse_or_reset_datasets(ids);
  res.send(html);
});
//
//  C L U S T E R  D A T A S E T  O R D E R
// test: from re-order datasets, "--Select distance metric to cluster by:". Should not be "undefined"
router.post('/cluster_ds_order', helpers.isLoggedIn,  function(req, res) {
  console.log('in cluster_ds_order');
  let html = '';
  const user_timestamp = file_path_obj.get_user_timestamp(req);

  let metric = req.body.metric;
  let biom_file_path = file_path_obj.get_file_tmp_path_by_ending(req, 'count_matrix.biom');
  let tmp_file_path = file_path_obj.get_tmp_file_path(req);

  let pjds_lookup = {};
  for (let i in req.session.chosen_id_order){
    let did = req.session.chosen_id_order[i];
    let pjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project+'--'+DATASET_NAME_BY_DID[did];
    pjds_lookup[pjds] = did;
  }
  let options = {
    scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
    args :       [ '-in', biom_file_path, '-metric', metric, '--function', 'cluster_datasets', '--basedir', tmp_file_path, '--prefix', user_timestamp],
  };
  console.log(options.scriptPath + '/distance_and_ordination.py ' + options.args.join(' '));

  let cluster_process = spawn( options.scriptPath + '/distance_and_ordination.py', options.args, {
    env:{'PATH': req.CONFIG.PATH, 'LD_LIBRARY_PATH': req.CONFIG.LD_LIBRARY_PATH},
    detached: true,
    stdio: [ 'ignore', null, null ]
  });  // stdin, stdout, stderr

  //let heatmap_process = spawn( 'which' , ['python'], {env:{'PATH':envpath}});
  let output = '';
  cluster_process.stdout.on('data', function clusterProcessStdout(data) {
    output += data.toString();
  });

  cluster_process.on('close', function clusterProcessOnClose(code) {
    console.log('ds cluster process exited with code ' + code);
    let lines = output.split(/\n/);
    let ds_list = "";
    for (let i in lines){
      if (lines[i].substring(0,7) === 'DS_LIST'){
        let tmp = lines[i].split('=');
        ds_list = tmp[1];
      }
    }
    file_path_obj.print_log_if_not_vamps(req, 'dsl: ' + JSON.stringify(ds_list));

    //let last_line = ary[ary.length - 1];
    if (code === 0){   // SUCCESS
      try {
        let dataset_list = JSON.parse(ds_list);

        let potential_chosen_id_name_hash = COMMON.create_new_chosen_id_name_hash(dataset_list, pjds_lookup);
        let ascii_file = file_path_obj.get_tree_file_name(req, metric);
        let ascii_file_path = path.join(tmp_file_path, ascii_file);
        read_file_when_ready(ascii_file_path);
        fs.readFile(ascii_file_path, 'utf8', function readAsciiTreeFile(err, ascii_tree_data) {
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
              html += "<td class='dragHandle' id='" + potential_chosen_id_name_hash.ids[i] + "--" + potential_chosen_id_name_hash.names[i] + "'> ";
              html += "<input type='hidden' name='ds_order[]' value='" + potential_chosen_id_name_hash.ids[i] + "'>";
              html += (parseInt(i) + 1).toString() + " (id:" +  potential_chosen_id_name_hash.ids[i] + ") - " + potential_chosen_id_name_hash.names[i];
              html += "</td>";
              html += "   <td>";
              html += "       <a href='#' onclick='move_to_the_top(" + (parseInt(i) + 1).toString() + ",\"" + potential_chosen_id_name_hash.ids[i] + "--" + potential_chosen_id_name_hash.names[i] + "\")'>^</a>";
              html += "   </td>";
              html += "</tr>";
            }
            html += "</tbody>";
            html += "</table>";
            html += '/////<pre style="font-size:10px">' + metric + '<br><small>' + ascii_tree_data + '</small></pre>';

            res.send(html);
          }
        });
      }
      catch(err) {
        res.send('Calculation Error: ' + err.toString());
      }
    }
  });
});
//
//
//
// test heatmap
router.post('/dheatmap_number_to_color', helpers.isLoggedIn,  function(req, res) {
  console.log('in dheatmap_number_to_color');

  const distmtx_file_tmp_path = file_path_obj.get_file_tmp_path_by_ending(req, 'distance.json');

  read_file_when_ready(distmtx_file_tmp_path);
  const distance_matrix = JSON.parse(fs.readFileSync(distmtx_file_tmp_path, 'utf8'));

  let metadata = {};
  metadata.numbers_or_colors = req.body.numbers_or_colors;
  metadata.split = false;
  metadata.metric = req.session.selected_distance;  // revert back to selected
  let html = IMAGES.create_hm_table(req, distance_matrix, metadata );

  const outfile_name = file_path_obj.get_file_names(req)['dheatmap-api.html'];

  let data = {};
  data.html = html;
  data.numbers_or_colors = req.body.numbers_or_colors;
  data.filename = outfile_name;
  //res.send(outfile_name)
  res.json(data);
});

function FinishSplitFile(req, res){
  let distmtx_file_path = file_path_obj.get_tmp_distmtx_file_path(req);

  read_file_when_ready(distmtx_file_path);
  fs.readFile(distmtx_file_path, 'utf8', function readFile(err, mtxdata) {
    if (err) {
      res.json({'err': err});
    } else {
      let split_distance_csv_matrix = mtxdata.split('\n');

      let metadata = {};
      metadata.numbers_or_colors = req.body.numbers_or_colors;
      metadata.split = true;
      metadata.metric = req.body.split_distance_choice;

      let html = IMAGES.create_hm_table_from_csv(req, split_distance_csv_matrix, metadata );

      let outfile_name = file_path_obj.get_file_names(req)['dheatmap-api.html'];

      let data = {};
      data.html = html;
      data.numbers_or_colors = req.body.numbers_or_colors;
      data.filename = outfile_name;
      res.json(data);
    }
  });
}


router.post('/dheatmap_split_distance', helpers.isLoggedIn,  function(req, res) {
  console.log('in dheatmap_split_distance');
  console.log(req.body);

  const test_distmtx_file = file_path_obj.get_file_tmp_path_by_ending(req, 'distance_mh_bc.tsv');

  if (helpers.fileExists(test_distmtx_file)){
    console.log('Using Old Files');
    FinishSplitFile(req, res);
    return;
  }

  const biom_file_path = file_path_obj.get_file_tmp_path_by_ending(req, 'count_matrix.biom');
  const user_timestamp = file_path_obj.get_user_timestamp(req);
  const tmp_file_path = file_path_obj.get_tmp_file_path(req);
  let options = {
    scriptPath: req.CONFIG.PATH_TO_VIZ_SCRIPTS,
    args:       [ '-in', biom_file_path, '-splits', '--function', 'splits_only', '--basedir', tmp_file_path, '--prefix', user_timestamp ],
  };

  console.log(options.scriptPath + '/distance_and_ordination.py ' + options.args.join(' '));
  let split_process = spawn( options.scriptPath +'/distance_and_ordination.py', options.args, {
    env: {'PATH': req.CONFIG.PATH, 'LD_LIBRARY_PATH': req.CONFIG.LD_LIBRARY_PATH},
    detached: true,
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
    console.log('finished code:' + code.toString());
    console.log('Creating New Split Distance Files');
    FinishSplitFile(req, res);

  });
});

//
//
//
// test: "More download choices" "Matrix file" or "Biom Matrix File" etc.
router.post('/download_file', helpers.isLoggedIn, function(req, res) {
  console.log('in routes_visualization download_file');
  const file_type = req.body.file_type;
  res.setHeader('Content-Type', 'text/plain');

  if (file_type === 'matrix') {
    let user_timestamp = file_path_obj.get_user_timestamp(req);
    let tmp_file_path = file_path_obj.get_tmp_file_path(req);
    helpers.create_matrix_from_biom(res, tmp_file_path, user_timestamp);
  }
  else {
    const file_path = file_path_obj.get_file_names_switch(req, file_type);
    res.download(file_path); // Set disposition and send it.
  }

});

//
//
//
// test: clear by substring, first opening
router.get('/clear_filters', helpers.isLoggedIn, function(req, res) {
  //SHOW_DATA = ALL_DATASETS;
  console.log('in clear filters');
  //console.log(req.query)
  //FILTER_ON = false
  PROJECT_TREE_OBJ = [];
  if (req.query.hasOwnProperty('btn') && req.query.btn === '1'){
    DATA_TO_OPEN = {};
  }
  //DATA_TO_OPEN = {}
  PROJECT_TREE_PIDS = filters_obj.filter_project_tree_for_permissions(req, SHOW_DATA.projects);
  PROJECT_FILTER = {"substring":"", "env":[], "target":"", "portal":"", "public":"-1", "metadata1":"", "metadata2":"", "metadata3":"", "pid_length":PROJECT_TREE_PIDS.length};
  res.json(PROJECT_FILTER);
});


//
//
//

router.get('/load_portal/:portal', helpers.isLoggedIn, function(req, res) {
  let portal = req.params.portal;

  console.log('in load_portal: ' + portal);
  SHOW_DATA = ALL_DATASETS;
  PROJECT_TREE_OBJ = [];

  PROJECT_TREE_OBJ = helpers.get_portal_projects(req, portal);
  PROJECT_TREE_PIDS = filters_obj.filter_project_tree_for_permissions(req, PROJECT_TREE_OBJ);
  let PROJECT_FILTER = {"substring": "", "env": [],"target": "", "portal": "", "public": "-1", "metadata1": "", "metadata2": "", "metadata3": "", "pid_length":  PROJECT_TREE_PIDS.length};
  res.json(PROJECT_FILTER);
});
//
//
//  FILTERS FILTERS  FILTERS FILTERS  FILTERS FILTERS  FILTERS FILTERS
//  FILTERS FILTERS  FILTERS FILTERS  FILTERS FILTERS  FILTERS FILTERS
//

const filters_obj =  new visualization_controller.visualizationFilters();

//  FILTER #1 LIVESEARCH PROJECTS (substring) FILTER
//
// test: search by substring
router.get('/livesearch_projects/:substring', function(req, res) {
  console.log('viz:in livesearch_projects/:substring');
  let substring = req.params.substring.toUpperCase();
  let empty_string = filters_obj.check_if_empty_val(substring);
  if (empty_string) {
    substring = "";
  }
  PROJECT_FILTER.substring = substring;

  const global_filter_vals = filters_obj.get_global_filter_values(req);
  PROJECT_FILTER = global_filter_vals.project_filter;
  NewPROJECT_TREE_OBJ = global_filter_vals.newproject_tree_obj;
  PROJECT_TREE_PIDS = global_filter_vals.project_tree_pids;

  // file_path_obj.print_log_if_not_vamps(req, 'PROJECT_FILTER');
  console.log(PROJECT_FILTER);

  res.json(PROJECT_FILTER);
});


//
//  FILTER #2 LIVESEARCH ENV PROJECTS FILTER
//
// test click filter by ENV source on visuals_index
router.get('/livesearch_env/:envid', function(req, res) {
  PROJECT_FILTER.env = filters_obj.get_envid_lst(req);

  const global_filter_vals = filters_obj.get_global_filter_values(req);
  PROJECT_FILTER = global_filter_vals.project_filter;
  NewPROJECT_TREE_OBJ = global_filter_vals.newproject_tree_obj;
  PROJECT_TREE_PIDS = global_filter_vals.project_tree_pids;

  // file_path_obj.print_log_if_not_vamps(req, 'PROJECT_FILTER');
  console.log(PROJECT_FILTER);
  res.json(PROJECT_FILTER);

});
//
//  FILTER #3 LIVESEARCH TARGET PROJECTS FILTER
//
// test click filter by domain/Target on visuals_index
router.get('/livesearch_target/:gene_target', function(req, res) {
  let gene_target = req.params.gene_target;
  let empty_string = filters_obj.check_if_empty_val(gene_target);
  if (empty_string) {
    gene_target = "";
  }
  PROJECT_FILTER.target = gene_target;

  const global_filter_vals = filters_obj.get_global_filter_values(req);
  PROJECT_FILTER = global_filter_vals.project_filter;
  NewPROJECT_TREE_OBJ = global_filter_vals.newproject_tree_obj;
  PROJECT_TREE_PIDS = global_filter_vals.project_tree_pids;

  console.log(PROJECT_FILTER);
  res.json(PROJECT_FILTER);

});
//
//
// FILTER #4
//
// test click filter by portal on visuals_index
router.get('/livesearch_portal/:portal', function(req, res) {
  console.log('viz:in livesearch portal');
  let select_box_portal = req.params.portal;
  let empty_string = filters_obj.check_if_empty_val(select_box_portal);
  if (empty_string) {
    select_box_portal = "";
  }
  PROJECT_FILTER.portal = select_box_portal;

  const global_filter_vals = filters_obj.get_global_filter_values(req);
  PROJECT_FILTER = global_filter_vals.project_filter;
  NewPROJECT_TREE_OBJ = global_filter_vals.newproject_tree_obj;
  PROJECT_TREE_PIDS = global_filter_vals.project_tree_pids;

  res.json(PROJECT_FILTER);

});
//
//
//
//  FILTER # 5 LIVESEARCH PUBLIC/PRIVATE PROJECTS FILTER
//
// test: click public/private on visuals_index
router.get('/livesearch_status/:q', function(req, res) {
  console.log('viz:in livesearch status');
  PROJECT_FILTER.public = req.params.q;

  const global_filter_vals = filters_obj.get_global_filter_values(req);
  PROJECT_FILTER = global_filter_vals.project_filter;
  NewPROJECT_TREE_OBJ = global_filter_vals.newproject_tree_obj;
  PROJECT_TREE_PIDS = global_filter_vals.project_tree_pids;

  console.log(PROJECT_FILTER);
  res.json(PROJECT_FILTER);

});
//
//
//  FILTER #6  LIVESEARCH METADATA FILTER
//
// test click filter by Metadata on visuals_index
router.get('/livesearch_metadata/:num/:q', function(req, res) {
  console.log('viz:in livesearch metadata');

  let num = req.params.num;
  let q = req.params.q;
  console.log('num ' + num);
  console.log('query ' + q);

  let empty_string = filters_obj.check_if_empty_val(q);
  if (empty_string) {
    q = "";
  }
  PROJECT_FILTER['metadata' + num] = q;

  const global_filter_vals = filters_obj.get_global_filter_values(req);
  PROJECT_FILTER = global_filter_vals.project_filter;
  NewPROJECT_TREE_OBJ = global_filter_vals.newproject_tree_obj;
  PROJECT_TREE_PIDS = global_filter_vals.project_tree_pids;

  console.log(PROJECT_FILTER);
  res.json(PROJECT_FILTER);

});

function get_files_prefix(req) {
  let files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE) + "--datasets_" ;
  let units = req.body.units;
  let taxonomies = {
    default_simple: 'tax_' + C.default_taxonomy.name + '_simple',
    default_custom: 'tax_' + C.default_taxonomy.name + '_custom',
    rdp: 'tax_rdp2.6_simple',
    generic: 'tax_generic_simple'
  };

  if (units === taxonomies["default_simple"] || units === taxonomies["default_custom"]) {
    files_prefix = files_prefix + C.default_taxonomy.name;
  } else if (units === taxonomies['rdp']) {
    files_prefix = files_prefix + "rdp2.6";
  } else if (units === taxonomies['generic']) {
    files_prefix = files_prefix + "generic";
  } else {
    console.log('ERROR: Units not found: ' + req.body.units); // ERROR
  }
  return files_prefix;
}
//
// test: page after custom taxonomy been chosen, shows the tree
router.post('/check_units', function(req, res) {
  console.log('IN check_UNITS');
  console.log(req.body);
  let path_to_file;
  let jsonfile;

  let files_prefix = get_files_prefix(req);
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
    }
    catch(e){
      file_err='FAIL';
      break;
    }
  }
  res.send(file_err);
});
//
//

function json_item_collect(node, json_item, checked) {
  let temp_ob = {
    id: node.node_id,
    text: node.taxon,
    tooltip: node.rank,
  };

  if (node.children_ids.length === 0){
    temp_ob.child = 0;
  } else {
    temp_ob.child = 1;
    temp_ob.item = [];
  }

  if (typeof checked !== "undefined") {
    temp_ob.checked = true;
  }

  json_item.push(temp_ob);

}

//
// test: choose custom taxonomy, show tree
// TODO: JSHint: This function's cyclomatic complexity is too high. (6) (W074)
router.get('/tax_custom_dhtmlx', function(req, res) {
  console.time("TIME: tax_custom_dhtmlx");
  //console.log('IN tax_custom_dhtmlx')
  let myurl = url.parse(req.url, true);
  let id = myurl.query.id;

  let json = {};
  json.id = id;
  json.item = [];

  if (parseInt(id) === 0){
    console.time("TIME: id = 0");

    /*
        return json for collapsed tree: 'domain' only
            json = {"id":"0","item":[
                {"id":"1","text":"Bacteria","tooltip":"domain","checked":true,"child":"1","item":[]},
                {"id":"214","text":"Archaea","tooltip":"domain","checked":true,"child":"1","item":[]},
                {"id":"338","text":"Unknown","tooltip":"domain","checked":true,"child":"1","item":[]},
                {"id":"353","text":"Organelle","tooltip":"domain","checked":true,"child":"1","item":[]}
                ]
            }
    */

    new_taxonomy.taxa_tree_dict_map_by_rank["domain"].map(
      function(node) { return json_item_collect(node, json.item, "checked"); }
    );

    json.item.sort(function(a, b) {
      return helpers.compareStrings_alpha(a.text, b.text);
    });

    console.timeEnd("TIME: id = 0");

  } else {
    console.time("TIME: id != 0");
    const objects_w_this_parent_id = new_taxonomy.taxa_tree_dict_map_by_id[id].children_ids.map(n_id => new_taxonomy.taxa_tree_dict_map_by_id[n_id]);
    objects_w_this_parent_id.map(
      function(node) { return json_item_collect(node, json.item); }
    );

    json.item.sort(function sortByAlpha(a, b) {
      return helpers.compareStrings_alpha(a.text, b.text);
    });
    console.timeEnd("TIME: id != 0");

  }
  console.timeEnd("TIME: tax_custom_dhtmlx");
  res.json(json);
});
//
//  project_custom_dhtmlx
//
// test: show tree
// TODO: JSHint: This function's cyclomatic complexity is too high. (10) (W074)
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
  if (parseInt(id) === 0){
    for (let i = 0; i < PROJECT_TREE_PIDS.length; i++ ){

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
        itemtext += "<small> <i>(public)</i></small>";
      } else {
        itemtext += "<a href='/users/" + node.oid + "'><small> <i>(PI: " + node.username +")</i></small></a>";
      }

      if (Object.keys(DATA_TO_OPEN).indexOf(pid_str) >= 0){
        json.item.push({id:'p'+pid_str, text:itemtext, checked:false, open:'1', child:1, item:[]});
      } else {
        json.item.push({id:'p'+pid_str, text:itemtext, checked:false, child:1, item:[]});
      }


    }
    //console.log(JSON.stringify(json, null, 4))

  }
  else {
    //console.log(JSON.stringify(ALL_DATASETS))
    let this_project = {};
    id = id.substring(1);  // id = pxx
    ALL_DATASETS.projects.forEach(function(prj) {
      if (parseInt(prj.pid) === parseInt(id)){
        this_project = prj;
      }
    });
    let all_checked_dids = [];
    if (Object.keys(DATA_TO_OPEN).length > 0){

      console.log('dto');
      file_path_obj.print_log_if_not_vamps(req, 'DATA_TO_OPEN');
      for (let openpid in DATA_TO_OPEN){
        Array.prototype.push.apply(all_checked_dids, DATA_TO_OPEN[openpid]);
      }
    }
    console.log('all_checked_dids:');
    file_path_obj.print_log_if_not_vamps(req, JSON.stringify(all_checked_dids));

    let pname = this_project.name;
    for (let n in this_project.datasets){
      let did   = this_project.datasets[n].did;
      //console.log('didXX',did)
      let dname = this_project.datasets[n].dname;
      let ddesc = this_project.datasets[n].ddesc;
      let tt_ds_id  = 'dataset/' + pname + '/' + dname + '/' + ddesc;
      itemtext = "<span id='" +  tt_ds_id  + "' class='tooltip_pjds_list'>" + dname + "</span>";
      if (all_checked_dids.indexOf(parseInt(did)) === -1){
        json.item.push({id:did, text:itemtext, child:0});
      } else {
        json.item.push({id:did, text:itemtext, checked:'1', child:0});
      }
    }
  }
  json.item.sort(function sortByAlpha(a, b){
    return helpers.compareStrings_alpha(a.text, b.text);
  });
  //console.log(json.item)
  res.send(json);
});
//
//
// test: click on row (index 1...) of taxonomy table
router.get('/taxa_piechart', function(req, res) {
  console.log('IN taxa_piechart - routes_visualizations');
  const myurl = url.parse(req.url, true);
  const tax = myurl.query.tax;
  const tmp_file_path = file_path_obj.get_tmp_file_path(req);
  const matrix_file_name = file_path_obj.get_file_names(req)['count_matrix.biom'];
  const matrix_file_path = path.join(tmp_file_path, matrix_file_name);

  read_file_when_ready(matrix_file_path);
  fs.readFile(matrix_file_path, 'utf8', function(err, mtxdata){
    if (err) {
      let msg = 'ERROR Message ' + err;
      helpers.render_error_page(req, res, msg);
    } else {
      let biom_matrix = JSON.parse(mtxdata);
      let data = [];
      let new_matrix = {};

      for (let i in biom_matrix.rows){
        if (biom_matrix.rows[i].id === tax){

          data = biom_matrix.data[i];
          // data = [1,2,3,4]
          // want [[1],[2],[3],[4]]

          new_matrix.data = [];
          for (let n in data){
            new_matrix.data.push([data[n]]);
          }
          new_matrix.columns = [biom_matrix.rows[i]];
        }
      }
      new_matrix.rows = biom_matrix.columns;
      file_path_obj.print_log_if_not_vamps(req, 'new mtx:' + JSON.stringify(new_matrix) + '\ncounts: ' + JSON.stringify(new_matrix.data));

      let cols =  biom_matrix.columns;

      const timestamp_only = file_path_obj.get_timestamp_only(req);
      res.render('visuals/user_viz_data/pie_single_tax', {
        title: 'Datasets PieChart',
        matrix: JSON.stringify(new_matrix),
        //post_items: JSON.stringify(visual_post_items),
        tax: tax,
        datasets: JSON.stringify(cols),
        counts: data,
        ts: timestamp_only,
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