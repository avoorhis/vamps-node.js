var express = require("express");
var router  = express.Router();
var helpers = require("./helpers/helpers");
var form    = require("express-form");
var queries = require(app_root + "/routes/queries");
var CONSTS  = require(app_root + "/public/constants");
var fs = require("fs");
var path = require("path");
var config  = require(app_root + '/config/config');
var validator = require('validator');
// var expressValidator = require('express-validator');

/* GET metadata page. */
 router.get('/metadata', function(req, res) {
      console.log('in metadata');
      res.render('metadata/metadata', { title: 'VAMPS:Metadata',
            user: req.user,
            hostname: req.CONFIG.hostname
        });
  });

router.get('/metadata_list', helpers.isLoggedIn, function(req, res) {
      console.log('in metadata');
      var mdata_w_latlon = {};
      console.log(DatasetsWithLatLong);
      //console.log(DatasetsWithLatLong)  // json
      //console.log(AllMetadataNames)  // list (req w _ids)
      for(var n in AllMetadataNames){
        md_selected = AllMetadataNames[n];
        mdata_w_latlon[md_selected] = 0;
        
        //console.log(md_selected)
        for(var did in DatasetsWithLatLong){
        //console.log(AllMetadata[did])
        //if(AllMetadata.hasOwnProperty(did)){
            //console.log('found1',did)
            //var mdata = helpers.required_metadata_names_from_ids(AllMetadata[did], md_selected)
            mdata = AllMetadata[did];   // has ids
            
            pid = PROJECT_ID_BY_DID[did];
            //console.log('pid',pid)
            pname = PROJECT_INFORMATION_BY_PID[pid].project;
            
            if(mdata.hasOwnProperty(md_selected)){
                    mdata_w_latlon[md_selected] = 1;
            }
        }
      }
      //console.log(mdata_w_latlon)
      res.render("metadata/metadata_list", { title: "VAMPS:Metadata List",
            user:         req.user,hostname: req.CONFIG.hostname,
            metadata:     AllMetadataNames,
            req_mdata_names: JSON.stringify(req.CONSTS.REQ_METADATA_FIELDS_wIDs),
            mdata_latlon: JSON.stringify(mdata_w_latlon),
            names_by_did: JSON.stringify(DATASET_NAME_BY_DID),
            pid_by_did:   JSON.stringify(PROJECT_ID_BY_DID),
            pinfo_by_pid: JSON.stringify(PROJECT_INFORMATION_BY_PID)
        });
});

router.get('/list_result/:mditem', helpers.isLoggedIn, function(req, res) {
      console.log('in metadatalist result');
      var md_selected = req.params.mditem;
      console.log(md_selected);
      var mdvalues = {};
      for(var did in DATASET_NAME_BY_DID){
        if(did in AllMetadata){
        if(req.CONSTS.REQ_METADATA_FIELDS_wIDs.indexOf(md_selected.slice(0,md_selected.length-3)) !== -1){
            var data = helpers.required_metadata_names_from_ids(AllMetadata[did], md_selected);  // send _id
            mdvalues[did] = data.value;
            md_selected_show = data.name;
        }else if(AllMetadata[did].hasOwnProperty(md_selected)){
             mdvalues[did] = AllMetadata[did][md_selected];
             md_selected_show = md_selected;
             
        }
       }
      }      
      res.render('metadata/list_result', { title: 'VAMPS:Metadata List Result',
            user:           req.user,hostname: req.CONFIG.hostname,
            vals:     		JSON.stringify(mdvalues),
            names_by_did:   JSON.stringify(DATASET_NAME_BY_DID),
            pid_by_did:     JSON.stringify(PROJECT_ID_BY_DID),
            pinfo_by_pid:   JSON.stringify(PROJECT_INFORMATION_BY_PID),       
            item:           md_selected_show	  				
        });
  });

router.get('/geomap/:item', helpers.isLoggedIn, function(req, res) {
      console.log('in metadata - geomap');
      var md_item = req.params.item;
      if(req.CONSTS.REQ_METADATA_FIELDS_wIDs.indexOf(md_item.slice(0,md_item.length-3)) !== -1){
        md_item_show = md_item.slice(0,md_item.length-3);
      }else{
        md_item_show = md_item;
      }
      var metadata_info = get_metadata_hash(md_item);  // fxn: see below
      //console.log('metadata_info')
      res.render('metadata/geomap', { title: 'VAMPS:Metadata Distribution',
            user    : req.user,hostname: req.CONFIG.hostname,
            md_item : md_item_show,
            mdinfo  : JSON.stringify(metadata_info),
            gekey   : req.CONFIG.GOOGLE_EARTH_KEY,           
        });
  });

module.exports = router;

//////////////////////////////
function get_metadata_hash(md_selected){
    var md_info = {};
    //md_info[md_item] = {}
    md_info.metadata = {};
    var got_lat, got_lon;
    //console.log('PROJECT_ID_BY_DID.length')
    //console.log(PROJECT_ID_BY_DID)
    //console.log(Object.keys(PROJECT_ID_BY_DID).length)
    for(var did in PROJECT_ID_BY_DID){
        
        if(AllMetadata.hasOwnProperty(did)){
            //console.log('found1',did)
            var mdata = AllMetadata[did];
            var pid = PROJECT_ID_BY_DID[did];
            //console.log('pid',pid)
            pname = PROJECT_INFORMATION_BY_PID[pid].project;
            if(mdata.hasOwnProperty(md_selected) && mdata.hasOwnProperty('latitude') && mdata.hasOwnProperty('longitude')){
                if(mdata['latitude'] !== 'None' && mdata['longitude'] !== 'None'){
                    //console.log('found2',md_selected)
                    var pjds = pname+'--'+DATASET_NAME_BY_DID[did];
                    md_info.metadata[pjds] ={};
                    md_info.metadata[pjds].pid = pid;
                    md_info.metadata[pjds].did = did;
                    var data = helpers.required_metadata_names_from_ids(mdata, md_selected);
                    md_info.metadata[pjds].value = data.value;
                    //md_info.metadata[pjds].value = mdata[md_selected]
                    md_info.metadata[pjds].latitude = mdata['latitude'];
                    md_info.metadata[pjds].longitude = mdata['longitude'];
                }

            }
        }else{            
            //console.log('did '+did+' not found in PROJECT_ID_BY_DID')
        }        
        
    }

    return md_info;

}

// ---- metadata_upload ----
/*
  TOC:
  render new form
  render edit form
  create form from db
  create form from req.form
  create form from a csv file
  from form to a csv file
  from form to req form
  save from a csv file to db
  save from form to db ??
  if csv files: show a list and compare
  common functions
*/

router.post('/show_metadata_form_from_db',
  [helpers.isLoggedIn],
  function (req, res) {

    console.time("TIME: 1) in post /show_metadata_form");
    // make_metadata_hash(req, res, req.body.project_id);
    console.log("MMM show_metadata_form with db data");
    // populate all_metadata from db and show form
    pid = req.body.project_id;
    dataset_ids = DATASET_IDS_BY_PID[pid];

    //TODO:
    for (var idx in dataset_ids) {
      var dataset_id = dataset_ids[idx];
      // var all_metadata_keys_hash = Object.keys(AllMetadata[dataset_id]);
      // var ids_data = get_all_req_metadata(dataset_id);
      // console.log("MMM2 ids_data");
      // console.log(ids_data);
      var primers_info_by_dataset_id = get_primers_info(dataset_id);

      AllMetadata[dataset_id]["forward_primer"] = primers_info_by_dataset_id['F'];
      AllMetadata[dataset_id]["reverse_primer"] = primers_info_by_dataset_id['R'];
    }

    console.log("RRR AllMetadata");
    console.log(AllMetadata);

    var all_field_names = helpers.unique_array(CONSTS.METADATA_FORM_REQUIRED_FIELDS.concat(get_field_names(dataset_ids)));

    console.log("HHH3 all_field_names");
    console.log(JSON.stringify(all_field_names));

    var all_metadata    = make_metadata_object(req, res, {}, pid, AllMetadata, all_field_names);
    render_edit_form(req, res, all_metadata, all_field_names);
    console.timeEnd("TIME: 1) in post /show_metadata_form");
  });


// if csv files: show a list and compare
router.get('/metadata_file_list', function(req, res) {
  console.time("TIME: get metadata_file_list");
  console.log('in metadata_file_list');
  var user_metadata_csv_files = get_csv_files(req);

  res.render('metadata/metadata_file_list', { title: 'VAMPS:Metadata',
    user: req.user,
    hostname: req.CONFIG.hostname,
    finfo: JSON.stringify(user_metadata_csv_files),
    edit: true
  });
  console.timeEnd("TIME: get metadata_file_list");

});

function get_csv_files(req) {
  console.time("TIME: get_csv_files");

  var user_csv_dir = path.join(config.USER_FILES_BASE, req.user.username);
  var all_my_files = helpers.walk_sync(user_csv_dir);

  console.timeEnd("TIME: get_csv_files");
  return all_my_files;
}

router.post('/metadata_files',
  [helpers.isLoggedIn],
  function (req, res) {
    console.time("TIME: in post /metadata_files");
    var table_diff_html, sorted_files, files_to_compare;
    sorted_files = sorted_files_by_time(req);
    files_to_compare = sorted_files_to_compare(req, sorted_files);

    if (typeof req.body.compare !== 'undefined' && req.body.compare.length === 2) {

      table_diff_html = get_file_diff(req, files_to_compare);
      res.render("metadata/metadata_file_list", {
        title: "VAMPS: Metadata File List",
        user: req.user,
        hostname: req.CONFIG.hostname,
        table_diff_html: table_diff_html,
        finfo: JSON.stringify(sorted_files),
        files_to_compare: files_to_compare,
        file_names: req.body.compare,
        edit: true
      });
    }
    else if (typeof req.body.edit_metadata_file !== 'undefined' && req.body.edit_metadata_file.length !== 0) {
      var all_metadata = make_metadata_hash_from_file(req, res, req.body.edit_metadata_file);
      //TODO: DRY: use parts of make_metadata_hash

      render_edit_form(req, res, all_metadata, CONSTS.ORDERED_METADATA_NAMES);
    }
    else {
      req.flash("fail", "Please choose two files to compare or one to edit");
      res.redirect("/metadata/metadata_file_list");
    }

    console.timeEnd("TIME: in post /metadata_files");
  });

function sorted_files_by_time(req) {
  console.time("sorted_files_by_time");
  var f_info = JSON.parse(req.body.file_info);
  var dir = path.join(config.USER_FILES_BASE, req.user.username);
  f_info.sort(function(a, b) {
    return fs.statSync(path.join(dir, a.filename)).mtime.getTime() -
      fs.statSync(path.join(dir, b.filename)).mtime.getTime();
  });

  console.timeEnd("sorted_files_by_time");
  return f_info;
}

function sorted_files_to_compare(req, sorted_files) {
  console.time("sorted_files_to_compare");

  var file_names_array = req.body.compare;
  var files = [];

  if (typeof file_names_array === 'undefined' || file_names_array.length === 0) {
    return null;
  }
  sorted_files.filter(function (el) {
    if (file_names_array.includes(el.filename)) {
      files.push(el);
    }
  });
  console.timeEnd("sorted_files_to_compare");
  return files;
}

function get_file_diff(req, files) {
  var coopy = require('coopyhx');
  var inputPath1 = path.join(config.USER_FILES_BASE, req.user.username, files[0]["filename"]);
  var inputPath2 = path.join(config.USER_FILES_BASE, req.user.username, files[1]["filename"]);

  console.log("PPP1 inputPath1");
  console.log(inputPath1);

  // TODO: check if exactly two names

  var columnDelimiter = ',';
  var lineDelimiter = '\n';
  var cellEscape = '"';

  var data1 = String(fs.readFileSync(inputPath1));
  var data2 = String(fs.readFileSync(inputPath2));
  // console.log("AAA7 data1");
  // console.log(data1);
  // todo: async?
  // var parse = require('csv-parse');
  // var parser = parse({delimiter: columnDelimiter, trim: true}, function(err, data){
  //   console.log("AAA7 data");
  //   console.log(data);
  // });
  // fs.createReadStream(inputPath1).pipe(parser);


  var parse_sync = require('csv-parse/lib/sync');
  var records1 = parse_sync(data1, {trim: true});
  var records2 = parse_sync(data2, {trim: true});

  var table1 = new coopy.CoopyTableView(records1);
  var table2 = new coopy.CoopyTableView(records2);

  var alignment = coopy.compareTables(table1,table2).align();

  var data_diff = [];
  var table_diff = new coopy.CoopyTableView(data_diff);

  var flags = new coopy.CompareFlags();
  var highlighter = new coopy.TableDiff(alignment, flags);
  highlighter.hilite(table_diff);

  var diff2html = new coopy.DiffRender();
  diff2html.render(table_diff);
  var table_diff_html = diff2html.html();

  return "<div class = 'highlighter'>" + table_diff_html + "</div>";

}
// common functions

function get_project_abstract_data(project, path_to_static)
{
  console.time("TIME: get_project_abstract_data");

  var info_file = '';
  var abstract_data = {};
  if (project.substring(0,3) === 'DCO'){
    info_file = path.join(path_to_static, 'abstracts', 'DCO_info.json');
    abstract_data = JSON.parse(fs.readFileSync(info_file, 'utf8'));
  }
  console.timeEnd("TIME: get_project_abstract_data");
  return abstract_data;
}

// TODO: move to helpers, use here and for project_profile
function get_project_prefix(project) {
  console.time("TIME: get_project_prefix");
  var project_parts = project.split('_');
  var project_prefix = project;
  if(project_parts.length >= 2 ){
    project_prefix = project_parts[0] + '_' + project_parts[1];
  }
  console.timeEnd("TIME: get_project_prefix");
  return project_prefix;
}

function add_all_val_by_key(my_key_hash, my_val_hash, all_metadata_pid) {
  console.time("TIME: 6) add_all_val_by_key");

  for (var i1 = 0, len1 = my_key_hash.length; i1 < len1; i1++) {
    var key = my_key_hash[i1];
    var val = my_val_hash[key];

    if (!(all_metadata_pid.hasOwnProperty(key))) {
      all_metadata_pid[key] = [];
    }
    all_metadata_pid[key].push(val);

  }
  console.timeEnd("TIME: 6) add_all_val_by_key");
  return all_metadata_pid;
}


function prepare_empty_metadata_object(pid, field_names_arr, all_metadata) {
  console.time("TIME: prepare_empty_metadata_object");
  all_metadata = all_metadata || {};
  if (!(all_metadata.hasOwnProperty(pid))) {
    all_metadata[pid] = {};
  }

  for (var i = 0; i < field_names_arr.length; i++) {
    var field_name = field_names_arr[i];
    if (!(all_metadata[pid].hasOwnProperty(field_name))) {
      all_metadata[pid][field_name] = [];
    }
  }

  console.timeEnd("TIME: prepare_empty_metadata_object");
  return all_metadata;
}

function get_field_names(dataset_ids){
  var field_names_arr = [];
  field_names_arr = field_names_arr.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
  field_names_arr = field_names_arr.concat(CONSTS.METADATA_NAMES_ADD);

  for (var i = 0; i < dataset_ids.length; i++) {
    var dataset_id = dataset_ids[i];

    field_names_arr = field_names_arr.concat(Object.keys(AllMetadata[dataset_id]));

    field_names_arr = helpers.unique_array(field_names_arr);
    field_names_arr.sort();
  }
  return field_names_arr;
}

router.get('/file_utils', helpers.isLoggedIn, function (req, res) {

  console.time('file_utils');
  var user = req.query.user;

  console.log("file from file_utils: ");
  console.log(file);
  //// DOWNLOAD //////
  var file;
  if (req.query.fxn == 'download' && req.query.template == '1') {
    file = path.join(process.env.PWD, req.query.filename);
    res.setHeader('Content-Type', 'text');
    res.download(file); // Set disposition and send it.
  } else if (req.query.fxn == 'download' &&  req.query.type=='pcoa') {
    file = path.join(process.env.PWD, 'tmp', req.query.filename);
    res.setHeader('Content-Type', 'text');
    res.download(file); // Set disposition and send it.
  } else if (req.query.fxn == 'download') {
    file = path.join(req.CONFIG.USER_FILES_BASE, user, req.query.filename);

    res.setHeader('Content-Type', 'text');
    res.download(file); // Set disposition and send it.
    ///// DELETE /////
  } else if (req.query.fxn == 'delete') {

    file = path.join(req.CONFIG.USER_FILES_BASE, user, req.query.filename);

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
          res.redirect("/metadata/metadata_file_list");
        }
      });
    }

  }
  console.timeEnd('file_utils');

});

// common functions
function render_edit_form(req, res, all_metadata, all_field_names) {
  console.log("JJJ1 all_metadata");
  console.log(JSON.stringify(all_metadata));

  console.log("JJJ2 all_field_names");
  console.log(JSON.stringify(all_field_names));

  res.render("metadata/metadata_edit_form", {
    title: "VAMPS: Metadata_upload",
    user: req.user,
    hostname: req.CONFIG.hostname,
    all_metadata: all_metadata,
    all_field_names: all_field_names,
    dividers: CONSTS.ORDERED_METADATA_DIVIDERS,
    dna_extraction_options: CONSTS.MY_DNA_EXTRACTION_METH_OPTIONS,
    dna_quantitation_options: CONSTS.DNA_QUANTITATION_OPTIONS,
    biome_primary_options: CONSTS.BIOME_PRIMARY,
    feature_primary_options: CONSTS.FEATURE_PRIMARY,
    material_primary_options: CONSTS.MATERIAL_PRIMARY,
    metadata_form_required_fields: CONSTS.METADATA_FORM_REQUIRED_FIELDS,
    env_package_options: CONSTS.DCO_ENVIRONMENTAL_PACKAGES,
    investigation_type_options: CONSTS.INVESTIGATION_TYPE,
    sample_type_options: CONSTS.SAMPLE_TYPE
  });
}


function make_metadata_object(req, res, all_metadata, pid, info, all_field_names) {
  console.time("TIME: make_metadata_object");
  console.log("GGG info");
  console.log(info);

  var dataset_ids  = DATASET_IDS_BY_PID[pid];
  var project      = PROJECT_INFORMATION_BY_PID[pid].project;
  var repeat_times = dataset_ids.length;


  // 0) get field_names
  // var all_field_names = helpers.unique_array(CONSTS.METADATA_FORM_REQUIRED_FIELDS.concat(get_field_names(dataset_ids)));

  // console.log("HHH3 all_field_names");
  // console.log(JSON.stringify(all_field_names));

  // 1)
  all_metadata = prepare_empty_metadata_object(pid, all_field_names, all_metadata);
  // console.log("MMM2 all_metadata");
  // console.log(all_metadata);

  //2) all
  all_metadata[pid] = info;

  //3) special
  var abstract_data = get_project_abstract_data(project, req.CONFIG.PATH_TO_STATIC_DOWNLOADS)[get_project_prefix(project)];

  var project_info = get_project_info(pid);
  console.log("NNN1 project_info");
  console.log(project_info);
  all_metadata[pid]["first_name"] = fill_out_arr_doubles(project_info.first, repeat_times);
  all_metadata[pid]["institution"] = fill_out_arr_doubles(project_info.institution, repeat_times);
  all_metadata[pid]["last_name"] = fill_out_arr_doubles(project_info.last, repeat_times);
  all_metadata[pid]["pi_email"] = fill_out_arr_doubles(project_info.email, repeat_times);
  all_metadata[pid]["pi_name"] = fill_out_arr_doubles(project_info.pi_name, repeat_times);
  all_metadata[pid]["project"] = fill_out_arr_doubles(project_info.project, repeat_times);
  all_metadata[pid]["project_abstract"] = fill_out_arr_doubles(abstract_data.pdfs, repeat_times);
  all_metadata[pid]["project_title"] = fill_out_arr_doubles(project_info.title, repeat_times);
  all_metadata[pid]["public"] = fill_out_arr_doubles(project_info.public, repeat_times);
  all_metadata[pid]["references"] = fill_out_arr_doubles(project_info.references, repeat_times);
  all_metadata[pid]["username"] = fill_out_arr_doubles(project_info.username, repeat_times);


  console.log("MMM3 all_metadata");
  console.log(all_metadata);

  console.timeEnd("TIME: make_metadata_object");
  return all_metadata;
}


function get_project_info(project_name_or_pid) {
  var project_info;
  if (helpers.isInt(project_name_or_pid)) {
    project_info = PROJECT_INFORMATION_BY_PID[project_name_or_pid];
  }
  else {
    project_info = PROJECT_INFORMATION_BY_PNAME[project_name_or_pid];
  }
  project_info.pi_name = project_info.first + " " + project_info.last;

  return project_info;

}

function fill_out_arr_doubles(value, repeat_times) {
  var arr_temp = Array(repeat_times);
  arr_temp.fill(value, 0, repeat_times);
  return arr_temp;
}


function get_primers_info(dataset_id) {
  console.time("TIME: get_primers_info");
  var primer_suite_id = AllMetadata[dataset_id]["primer_suite_id"];
  var primer_info = {};

  if (typeof primer_suite_id === 'undefined' || typeof MD_PRIMER_SUITE[primer_suite_id] === 'undefined' || typeof MD_PRIMER_SUITE[primer_suite_id].primer === 'undefined' ) {
    return {};
  }
  else {
    try {
      for (var i = 0; i < MD_PRIMER_SUITE[primer_suite_id].primer.length; i++) {

        var curr_direction = MD_PRIMER_SUITE[primer_suite_id].primer[i].direction;

        if (typeof primer_info[curr_direction] === 'undefined' || primer_info[curr_direction].length === 0) {
          primer_info[curr_direction] = [];
        }

        primer_info[curr_direction].push(MD_PRIMER_SUITE[primer_suite_id].primer[i].sequence);
      }
    } catch (err) {
      // Handle the error here.
      return {};
    }

  }
  // console.log("DDD primer_info");
  // console.log(JSON.stringify(primer_info));
  // {"F":["CCTACGGGAGGCAGCAG","CCTACGGG.GGC[AT]GCAG","TCTACGGAAGGCTGCAG"],"R":["GGATTAG.TACCC"]}

  console.timeEnd("TIME: get_primers_info");
  return primer_info;
}



// ---- metadata_upload end ----
