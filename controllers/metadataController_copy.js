var Project   = require(app_root + '/models/project_model');
var Dataset   = require(app_root + '/models/dataset_model');
var User      = require(app_root + '/models/user_model');
var helpers   = require(app_root + '/routes/helpers/helpers');
var CONSTS    = require(app_root + '/public/constants');
var validator = require('validator');
var config    = require(app_root + '/config/config');
var fs        = require('fs');
var path      = require('path');

// 1 create data from
// 1.1  db
// 1.2  form
// 1.3  file

// 2 saved data to
// 2.1  db
// 2.2  form
// 2.3  file

// 3 show data
// ===

// 1 create data
function CreateDataObj(req, res) {

  this.project_id   = '';
  // Object.keys(all_metadata)[0]; // check if exists and not 0
  this.dataset_ids  = []; // DATASET_IDS_BY_PID[pid] or from db or from save
  this.all_metadata = prepare_empty_metadata_object(pid, all_field_names, {});

  this.all_field_names = collect_field_names(dataset_ids);
  this.project         = PROJECT_INFORMATION_BY_PID[project_id].project;

}

function collect_field_names(dataset_ids) {
}

function prepare_empty_metadata_object(pid, field_names_arr, all_metadata) {
  console.time('TIME: prepare_empty_metadata_object');
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

  console.timeEnd('TIME: prepare_empty_metadata_object');
  return all_metadata;
}

CreateDataObj.prototype.make_metadata_object = function (req, res, pid, info) {
  console.time('TIME: make_metadata_object');

  var repeat_times = dataset_ids.length;


  //2) all

  all_metadata[pid] = info;

  //3) special

  // TODO: move to db creation?
  var project_info = get_project_info(pid);
  console.log('MMM33 all_metadata[pid]');
  console.log(JSON.stringify(all_metadata[pid]));

  for (var idx in CONSTS.PROJECT_INFO_FIELDS) {
    var field_name = CONSTS.PROJECT_INFO_FIELDS[idx];

    //todo: split if, if length == dataset_ids.length - just use as is
    if ((typeof all_metadata[pid][field_name] !== 'undefined') && all_metadata[pid][field_name].length < 1) {
      all_metadata[pid][field_name] = module.exports.fill_out_arr_doubles(all_metadata[pid][field_name], repeat_times);
    }
    else {
      all_metadata[pid][field_name] = module.exports.fill_out_arr_doubles(project_info[field_name], repeat_times);
    }
  }

  if ((all_metadata[pid]['project_abstract'] === 'undefined') || (!all_metadata[pid].hasOwnProperty(['project_abstract']))) {
    all_metadata[pid]['project_abstract'] = module.exports.fill_out_arr_doubles('', repeat_times);
  }
  else {

    if ((all_metadata[pid]['project_abstract'][0] !== 'undefined') && (!Array.isArray(all_metadata[pid]['project_abstract'][0]))) {

      var project_abstract_correct_form = helpers.unique_array(all_metadata[pid]['project_abstract']);

      if (typeof project_abstract_correct_form[0] !== 'undefined') {

        all_metadata[pid]['project_abstract'] = module.exports.fill_out_arr_doubles(project_abstract_correct_form[0].split(','), repeat_times);

      }
    }
  }

  console.log('MMM9 all_metadata[pid]');
  console.log(JSON.stringify(all_metadata[pid]));

  console.timeEnd('TIME: make_metadata_object');
  return all_metadata;
};

// TODO: functions to make: all_field_names_arr, all_field_units, ordered_field_names_obj,


// http://book.mixu.net/node/ch6.html
// 3 CLASS ShowObj()
// function ShowObj(res, all_metadata, all_field_names_arr, all_field_units, ordered_field_names_obj, user, hostname) {
// needed:
// project_id (for all_field_units, all_metadata, globals: PROJECT_INFORMATION_BY..., DATASET_IDS_BY_PID)
// dataset_ids (for show, for global: DATASET_IDS_BY_PID[pid];
// req.user
// req.CONFIG.hostname
// all_field_names_arr with units etc.: [['structured comment name','Parameter','',''],['','New submit info','','']
// all_metadata with arrays as big as there are datasets: {'495':{'dna_region':['v4','v4'],'domain':['Bacteria','Bacteria']
// ordered_field_names_obj
// MD_CUSTOM_UNITS[project_id] (all_field_units)
// -- in all_metadata --
// all_metadata[pid]
// all_metadata[pid]['dataset']
// all_metadata[pid]['dataset_id']

class ShowObj {

  constructor (res, all_metadata, all_field_names_arr, all_field_units, ordered_field_names_obj, user, hostname) {
    this.res = res;
    this.all_metadata = all_metadata;
    this.all_field_names_arr = all_field_names_arr;
    this.all_field_units = all_field_units;
    this.ordered_field_names_obj = ordered_field_names_obj;
    this.user = user;
    this.hostname = hostname;
  }

  render_edit_form()  {
    this.res.render('metadata/metadata_edit_form', {
      title: 'VAMPS: Metadata_upload',
      user: this.user,
      hostname: this.hostname,
      all_metadata: this.all_metadata,
      all_field_names: this.all_field_names_arr,
      ordered_field_names_obj: this.ordered_field_names_obj,
      all_field_units: this.all_field_units,
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

}

// export the class
// module.exports = ShowObj;

module.exports = {
  CreateDataObj: CreateDataObj,
  ShowObj: ShowObj
};

