var Project                 = require(app_root + '/models/project_model'); // jshint ignore:line
var Dataset                 = require(app_root + '/models/dataset_model');
var User                    = require(app_root + '/models/user_model');
var helpers                 = require(app_root + '/routes/helpers/helpers');
var CONSTS                  = require(app_root + '/public/constants');
var validator               = require('validator');
// var config    = require(app_root + '/config/config');
var fs                      = require('fs');
var path                    = require('path');
var new_metadata_controller = require(app_root + '/controllers/metadataController_copy');

// Display list of all Submissions.
// exports.submission_list = function (req, res) {
//   res.send('NOT IMPLEMENTED: Submission list');
// };


// private



function filterItems(arr, query) {
  return arr.filter(function (el) {
    return el.toLowerCase().indexOf(query.toLowerCase()) < 0;
  });
}

function make_ordered_field_names_obj() {
  console.time('TIME: make_ordered_field_names_obj');
  var ordered_field_names_obj = {};

  for (var i in CONSTS.ORDERED_METADATA_NAMES) {
    // [ 'biomass_wet_weight', 'Biomass - wet weight', '', 'gram' ]
    var temp_arr = [i];
    temp_arr.push(CONSTS.ORDERED_METADATA_NAMES[i]);
    ordered_field_names_obj[CONSTS.ORDERED_METADATA_NAMES[i][0]] = temp_arr;
  }
  console.timeEnd('TIME: make_ordered_field_names_obj');
  return ordered_field_names_obj;
}

function get_object_vals(object_name) {
  return Object.keys(object_name).map(function (key) {
    return object_name[key];
  });
}


function add_info_to_project_globals(object_to_add, pid) {

  //undefined: env_package_id
  if (typeof PROJECT_INFORMATION_BY_PID[pid] === 'undefined') {
    PROJECT_INFORMATION_BY_PID[pid]            = Object.assign(object_to_add);
    PROJECT_INFORMATION_BY_PID[pid].pid        = pid;
    PROJECT_INFORMATION_BY_PID[pid].project_id = pid;
  }

  if (typeof PROJECT_INFORMATION_BY_PNAME[object_to_add.project] === 'undefined') {
    PROJECT_INFORMATION_BY_PNAME[object_to_add.project] = Object.assign(PROJECT_INFORMATION_BY_PID[pid]);
  }
}

// exports.get_project_name = function (edit_metadata_file) {
//   console.time('TIME: get_project_name');
//
//   var edit_metadata_file_parts = edit_metadata_file.split('-')[1].split('_');
//   var edit_metadata_project    = '';
//
//   if (edit_metadata_file_parts.length >= 4) {
//
//     edit_metadata_project = edit_metadata_file_parts[1] + '_' + edit_metadata_file_parts[2] + '_' + edit_metadata_file_parts[3];
//   }
//
//   console.timeEnd('TIME: get_project_name');
//   return edit_metadata_project;
// };


exports.saveDataset = function (req, res) {
  console.log('TTT1 req.form from saveDataset = ', req.form);
  //dataset_id, dataset, dataset_description, project_id, created_at, updated_at,

  var dataset_obj                 = {};
  dataset_obj.dataset_id          = 0;
  dataset_obj.dataset             = req.form.dataset_name;
  dataset_obj.dataset_description = req.form.dataset_description;
  dataset_obj.project_id          = project_id;
  dataset_obj.created_at          = new Date();
  dataset_obj.updated_at          = new Date();

  console.log('OOO1 JSON.stringify(dataset_obj) = ', JSON.stringify(dataset_obj));

  // Dataset.addDataset(dataset_obj, function (err, rows) {

};

// [2018/06/26 13:52:48.300] [LOG]   MMM2, req.form { adaptor: [],
//   d_region: 'Eukaryal#v4#Ev4',
//   dataset_description: [],
//   dataset_name: [],
//   funding_code: [ '0' ],
//   pi_id_name: '913#Shangpliang H. Nakibapher Jones#Shangpliang#H. Nakibapher Jones#nakibapher19@gmail.com',
//   project_description: [ 'AAA description' ],
//   project_name1: [ 'HNJS' ],
//   project_name2: [ 'AAA' ],
//   project_title: [ 'AAA title' ],
//   sample_concentration: [],
//   samples_number: [ '2' ],
//   submit_code: [],
//   tube_label: [] }

exports.saveProject = function (req, res) { //check if exists in PROJECT_INFORMATION_BY_PID and just pull id and project_obj, render if yes; Project.addProject if new
  console.log('JJJ req.form from saveProject = ', req.form);
  // var d_region_arr  = req.form.d_region.split('#');
  // var metagenomic   = 0;
  // var project_name3 = d_region_arr[2];
  // if (d_region_arr[0] === 'Shotgun') {
  //   metagenomic   = 1;
  //   project_name3 = 'Sgun';
  // }
  // var user_id  = req.form.pi_id_name.split('#')[0];
  // var user_obj = User.getUserInfoFromGlobal(user_id);
  // console.log('OOO4 user_obj from saveProject = ', user_obj);

  // var project_obj                 = {};
  // project_obj.project_id          = 0;
  // project_obj.project             = req.form.project_name1 + '_' + req.form.project_name2 + '_' + project_name3;
  // project_obj.title               = req.form.project_title;
  // project_obj.project_description = req.form.project_description;
  // project_obj.rev_project_name    = reverseString(project_obj.project);
  // project_obj.funding             = req.form.funding_code;
  // project_obj.public              = 0;
  // project_obj.metagenomic         = metagenomic;
  // project_obj.matrix              = 0;
  // project_obj.created_at          = new Date();
  // project_obj.updated_at          = new Date();
  // project_obj.active              = 0;
  // project_obj.owner_info          = user_obj;


  //    User_obj.user_id            = user_id;
  //     User_obj.username           = ALL_USERS_BY_UID[user_id].username;
  //     User_obj.email              = ALL_USERS_BY_UID[user_id].email;
  //     User_obj.institution        = ALL_USERS_BY_UID[user_id].institution;
  //     User_obj.first_name         = ALL_USERS_BY_UID[user_id].first_name;
  //     User_obj.last_name          = ALL_USERS_BY_UID[user_id].last_name;
  //     User_obj.security_level     = ALL_USERS_BY_UID[user_id].status;
  //     User_obj.encrypted_password = ALL_USERS_BY_UID[user_id].encrypted_password;
  //     User_obj.groups             = ALL_USERS_BY_UID[user_id].groups;

  //2018-06-20 13:09:14

  var user_id       = req.form.pi_id_name.split('#')[0];
  // var user_obj      = User.getUserInfoFromGlobal(user_id);
  const new_project = new Project(req, res, 0, user_id);

  var project_obj = new_project.project_obj;
  console.log('OOO1 JSON.stringify(project_obj) = ', JSON.stringify(project_obj));

  // Project.getAllProjects(function (err, rows) {
  //   console.log('EEE err', err);
  //   console.log('EEE0 rows', rows);
  //
  // });

  new_project.addProject(project_obj, function (err, rows) {

    if (err) {
      console.log('WWW0 err', err);
      req.flash('fail', err);
      module.exports.show_metadata_new_again(req, res);
      // res.json(err);
    }
    else {
      console.log('WWW rows', rows);
      var pid = rows.insertId;
      add_info_to_project_globals(project_obj, pid);

      const met_obj = new new_metadata_controller.CreateDataObj(req, res, pid, []);

      var all_field_names = met_obj.collect_field_names();

      // var all_field_names = collect_field_names();
      // TODO: add
      //   funding_code: [ '0' ],
      //   sample_concentration: [],
      //   submit_code: [],
      //   tube_label:
      // d_region: 'Bacterial#v4v5#Bv4v5',
      //   dataset_description: [],
      //   dataset_name: [],
      //   funding_code: '0',
      //   pi_id_name: '1453#Amrani Said#Amrani#Said#said_amrani@yahoo.com',
      //   project_description: 'sdf sdgfdsg sfgdf',
      //   project_name1: 'SA',
      //   project_name2: 'AAA',
      //   project_title: 'AAA54645674',
      //   sample_concentration: [],
      //   samples_number: '2',
      //   submit_code: [],
      //   tube_label: [] }

      // 14	  ['run', 'Sequencing run date', 'MBL Supplied', 'YYYY-MM-DD'],

      var all_field_names4     = [];
      // var all_field_names4_temp = CONSTS.ORDERED_METADATA_NAMES;
      var parameter            = CONSTS.ORDERED_METADATA_NAMES.slice(0, 1);
      var new_user_submit      = [['', 'New submit info', '', '']];
      var user_sample_name     = CONSTS.ORDERED_METADATA_NAMES.slice(17, 18);
      var dataset_description  = [['dataset_description', 'Dataset description', 'User Supplied', '']];
      var tube_label           = [['tube_label', 'Tube label', 'User Supplied', '']];
      var sample_concentration = [['sample_concentration', 'Sample concentration', 'User Supplied', 'ng/ul']];
      var dna_quantitation     = CONSTS.ORDERED_METADATA_NAMES.slice(35, 36);
      var env_package          = CONSTS.ORDERED_METADATA_NAMES.slice(16, 17);

      var second_part_part_1 = CONSTS.ORDERED_METADATA_NAMES.slice(1, 16);
      var second_part_part_2 = CONSTS.ORDERED_METADATA_NAMES.slice(18, 35);
      var second_part_part_3 = CONSTS.ORDERED_METADATA_NAMES.slice(36);

      // var general = CONSTS.ORDERED_METADATA_NAMES.slice(1,1);
      // var funding_code = [['funding_code', 'Funding Code', 'User Supplied', 'numeric only']];
      // var vamps_dataset_name = CONSTS.ORDERED_METADATA_NAMES.slice(2,2);
      // var second_part_part = CONSTS.ORDERED_METADATA_NAMES.slice(3,5);
      // var domain = CONSTS.ORDERED_METADATA_NAMES.slice(6,6);
      // var target_gene = CONSTS.ORDERED_METADATA_NAMES.slice(7,7);
      // var dna_region = CONSTS.ORDERED_METADATA_NAMES.slice(8,8);

      //   submit_code: [],

      // [['structured comment name','Parameter','',''],['','General','',''],['dataset','VAMPS dataset name','MBL Supplied','']

      all_field_names4 = all_field_names4.concat(parameter);
      all_field_names4 = all_field_names4.concat(new_user_submit);
      all_field_names4 = all_field_names4.concat(user_sample_name);
      all_field_names4 = all_field_names4.concat(dataset_description);
      all_field_names4 = all_field_names4.concat(tube_label);
      all_field_names4 = all_field_names4.concat(sample_concentration);
      all_field_names4 = all_field_names4.concat(dna_quantitation);
      all_field_names4 = all_field_names4.concat(env_package);
      all_field_names4 = all_field_names4.concat(second_part_part_1);
      all_field_names4 = all_field_names4.concat(second_part_part_2);
      all_field_names4 = all_field_names4.concat(second_part_part_3);


      var all_metadata = met_obj.create_all_metadata_form_new(rows, req, res, all_field_names, project_obj);
      // all_metadata = { '485':
      //     { project: [ 'MS_AAA_EHSSU', 'MS_AAA_EHSSU', 'MS_AAA_EHSSU' ],
      //       dataset: ['', '', ''],
      //       sample_name: ['', '', ''],
      //       investigation_type: ['', '', ''],
      //       domain: ['', '', ''],
      //       first_name: [ 'Mohammadkarim', 'Mohammadkarim', 'Mohammadkarim' ],
      // module.exports.render_edit_form(req, res, all_metadata, all_field_names4);

      var all_field_units = MD_CUSTOM_UNITS[pid];

      const show_new = new new_metadata_controller.ShowObj(req, res, all_metadata, all_field_names4, all_field_units);
      show_new.render_edit_form();
    }
  });
};

exports.show_metadata_new_again = function (req, res) {
  //collect errors
  var myArray_fail = helpers.unique_array(req.form.errors);

  // if (helpers.has_duplicates(req.form.sample_name)) {
  //   myArray_fail.push('Sample ID (user sample name) should be unique.');
  // }

  myArray_fail.sort();
  console.log('myArray_fail = ', myArray_fail);
  req.flash('fail', myArray_fail);

  // console.log('QQQ1 req.body.pi_list', pi_list);
  // req.session.DOMAIN_REGIONS = CONSTS.DOMAIN_REGIONS;
  // req.session.button_name    = 'Add datasets';

  var d_region_arr   = req.form.d_region.split('#');
  var pi_id_name_arr = req.form.pi_id_name.split('#');
  var full_name      = pi_id_name_arr[3] + ' ' + pi_id_name_arr[2];
  var project_name1  = req.form.project_name1;
  if (project_name1 === '') {
    project_name1 = module.exports.get_inits(full_name.split(' '));
  }
  var project_name3 = d_region_arr[2];
  var project_name  = project_name1 + '_' + req.form.project_name2 + '_' + project_name3;

  console.log('PPP project_name1', project_name1);
  console.log('PPP1 project_name', project_name);
  res.render('metadata/metadata_new', {
    button_name: 'Validate',
    domain_regions: CONSTS.DOMAIN_REGIONS,
    hostname: req.CONFIG.hostname,
    pi_email: pi_id_name_arr[4],
    pi_list: req.session.pi_list,
    project_title: req.form.project_title,
    samples_number: req.form.samples_number,
    title: 'VAMPS: New Metadata',
    user: req.user,
  });
};

