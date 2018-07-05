var Project   = require(app_root + '/models/project_model');
// var Dataset   = require(app_root + '/models/dataset_model');
// var User      = require(app_root + '/models/user_model');
var helpers = require(app_root + '/routes/helpers/helpers');
var CONSTS  = require(app_root + '/public/constants');
// var validator = require('validator');
// var config    = require(app_root + '/config/config');
// var fs        = require('fs');
// var path      = require('path');

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
class CreateDataObj {

  constructor(req, res, project_id, dataset_ids) {
    this.req             = req || {};
    this.res             = res || {};
    this.pid             = project_id || '';
    this.dataset_ids     = dataset_ids || [];
    this.all_field_names = this.collect_field_names();
    this.all_metadata    = this.prepare_empty_metadata_object();
    //
    // this.project         = PROJECT_INFORMATION_BY_PID[project_id].project;
  }

  collect_field_names() {
    var all_field_names = this.get_field_names_by_dataset_ids(this.dataset_ids);
    all_field_names     = all_field_names.concat(CONSTS.METADATA_FORM_REQUIRED_FIELDS);
    all_field_names     = all_field_names.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
    all_field_names     = all_field_names.concat(CONSTS.PROJECT_INFO_FIELDS);
    all_field_names     = all_field_names.concat(CONSTS.METADATA_NAMES_ADD);

    all_field_names = helpers.unique_array(all_field_names);
    return all_field_names;
  }

  get_field_names_by_dataset_ids() {

    var field_names_arr = [];

    if (typeof dataset_ids === 'undefined' || this.dataset_ids.length === 0) {
      field_names_arr = field_names_arr.concat(Object.keys(MD_CUSTOM_FIELDS_UNITS));
    }
    else {
      for (var i = 0; i < this.dataset_ids.length; i++) {
        var dataset_id  = this.dataset_ids[i];
        field_names_arr = field_names_arr.concat(Object.keys(AllMetadata[dataset_id]));
      }
    }
    field_names_arr = helpers.unique_array(field_names_arr); // one level
    field_names_arr.sort();

    return field_names_arr;
//  [
//   'access_point_type',
//   'adapter_sequence',
//   'adapter_sequence_id',
// ...
  }

  prepare_empty_metadata_object() {
    console.time('TIME: prepare_empty_metadata_object');
    var pid = this.pid;
    var field_names_arr = this.all_field_names;
    var all_metadata = this.all_metadata || {};

    if (!(all_metadata.hasOwnProperty(this.pid))) {
      all_metadata[pid] = {};
    }

    for (var i = 0; i < field_names_arr.length; i++) {
      var field_name = field_names_arr[i];
      if (!(all_metadata[pid].hasOwnProperty(field_name))) {
        all_metadata[pid][field_name] = [];
      }
    }

    console.timeEnd('TIME: prepare_empty_metadata_object');
    this.all_metadata = all_metadata;
  }

  get_project_info(req, res, project_name_or_pid) {
    var project_info;

    if (typeof project_name_or_pid === 'undefined') {
      const new_project = new Project(req, res, user_obj);
      var project_obj = new_project.project_obj;

    }
    if (helpers.isInt(project_name_or_pid)) {
      project_info = PROJECT_INFORMATION_BY_PID[project_name_or_pid];
    }
    else {
      project_info = PROJECT_INFORMATION_BY_PNAME[project_name_or_pid];
    }

    return {
      project: project_info.project,
      first_name: project_info.first,
      institution: project_info.institution,
      last_name: project_info.last,
      pi_email: project_info.email,
      pi_name: project_info.first + ' ' + project_info.last,
      project_title: project_info.title,
      public: project_info.public,
      username: project_info.username
    };
  }


  //TODO: cyclomatic comlexity is 7!
  make_metadata_object(req, res, pid, data_obj) {
    console.time('TIME: make_metadata_object');
    console.timeEnd('TIME: make_metadata_object');

    var all_metadata = {};
    var dataset_ids  = DATASET_IDS_BY_PID[pid];
    var repeat_times = dataset_ids.length;

    // 0) get field_names
    var all_field_names = this.collect_field_names(dataset_ids);

    // 1)
    //   // TODO: don't send all_metadata?
    all_metadata = this.all_metadata;

    //2) all

    all_metadata[pid] = data_obj;

    //3) special

    // TODO: move to db creation?
    // TODO: user_obj
    var project_info = get_project_info(req, res, pid);
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


  }

  get_pi_list () {
    console.log('FROM Metadata Controller');
    var pi_list = [];

    for (var i in ALL_USERS_BY_UID) {
      pi_list.push({
        'PI': ALL_USERS_BY_UID[i].last_name + ' ' + ALL_USERS_BY_UID[i].first_name,
        'pi_id': i,
        'last_name': ALL_USERS_BY_UID[i].last_name,
        'first_name': ALL_USERS_BY_UID[i].first_name,
        'pi_email': ALL_USERS_BY_UID[i].email
      });
    }

    pi_list.sort(function sortByAlpha(a, b) {
      return helpers.compareStrings_alpha(a.PI, b.PI);
    });

    return pi_list;
  }

}

class ShowObj {

  constructor(req, res, all_metadata, all_field_names_arr, all_field_units, ordered_field_names_obj, user, hostname) {
    this.res                     = res;
    this.all_metadata            = all_metadata;
    this.all_field_names_arr     = all_field_names_arr;
    this.all_field_units         = all_field_units;
    this.ordered_field_names_obj = ordered_field_names_obj;
    this.user                    = user;
    this.hostname                = hostname;
  }

  render_edit_form() {
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

  show_metadata_new_again (req, res) {
    //collect errors
    var myArray_fail = helpers.unique_array(req.form.errors);

    myArray_fail.sort();
    console.log('myArray_fail = ', myArray_fail);
    req.flash('fail', myArray_fail);

    // TODO: send to object creation in Imp
    var d_region_arr   = req.form.d_region.split('#');
    var pi_id_name_arr = req.form.pi_id_name.split('#');
    var full_name      = pi_id_name_arr[3] + ' ' + pi_id_name_arr[2];
    var project_name1  = req.form.project_name1;
    if (project_name1 === '') {
      project_name1 = module.exports.get_inits(full_name.split(' '));
    }
    var project_name3 = d_region_arr[2];
    var project_name  = project_name1 + '_' + req.form.project_name2 + '_' + project_name3;

    res.render('metadata/metadata_new', {
      // TODO: object created separately in Imp.
      button_name: 'Validate',
      domain_regions: CONSTS.DOMAIN_REGIONS,
      hostname: req.CONFIG.hostname,
      pi_email: pi_id_name_arr[4],
      pi_list: req.session.pi_list,
      pi_name: full_name,
      project_name: project_name,
      project_title: req.form.project_title,
      samples_number: req.form.samples_number,
      title: 'VAMPS: New Metadata',
      user: req.user,
    });
  }


}

// export the class
// module.exports = ShowObj;

module.exports = {
  CreateDataObj: CreateDataObj,
  ShowObj: ShowObj
};

