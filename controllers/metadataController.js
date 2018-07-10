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
function checkArray(my_arr) {
  for (var i = 0; my_arr.length > i; i++) {
    if (my_arr[i] === '') {
      return false;
    }
  }
  return true;
}

// function check_regexp(reg_exp, value, err_msg) {
//   var result = value.match(reg_exp);
//
//   // if (value !== '' && result === null) {
//   if (value !== '' && result !== null) {
//     throw new Error("'" + value + "' is not allowed in '%s'" + err_msg);
//   }
// }

// function region_valid(value, region_low, region_high) {
//   if ((value !== '') && (parseInt(value) < parseInt(region_low) || parseInt(value) > parseInt(region_high))) {
//     throw new Error("'" + value + "' is not valid, %s should be between " + region_low + " and " + region_high);
//   }
// }

function new_row_field_validation(req, field_name) {
  console.time('TIME: new_row_field_validation');
  var err_msg = '';

  //todo: send a value instead of 'req.body[field_name]'?
  var field_val_trimmed   = validator.escape(req.body[field_name] + '');
  field_val_trimmed       = validator.trim(field_val_trimmed + '');
  var field_val_not_valid = validator.isEmpty(field_val_trimmed + '');

  if (field_val_not_valid) {
    console.log("ERROR: an empty user's " + field_name);
    err_msg = 'User added field "' + field_name + '" must be not empty and have only alpha numeric characters';
    req.form.errors.push(err_msg);
  }

  console.timeEnd('TIME: new_row_field_validation');
  return field_val_trimmed;
}

function isUnique(all_clean_field_names_arr, column_name) {
  return (all_clean_field_names_arr.indexOf(column_name) < 0);
}

function get_cell_val_by_row(row_idx, req) {
  console.time('TIME: get_cell_val_by_row');
  var new_row_length = req.body.new_row_length;
  var new_row_val    = [];

  for (var cell_idx = 0; cell_idx < parseInt(new_row_length); cell_idx++) {
    var cell_name = 'new_row' + row_idx.toString() + 'cell' + cell_idx.toString();
    var clean_val = validator.escape(req.body[cell_name] + '');
    clean_val     = validator.trim(clean_val + '');

    new_row_val.push(clean_val);
  }
  console.timeEnd('TIME: get_cell_val_by_row');

  return new_row_val;
}

// get_names_from_ordered_const = function () {
//   console.time('time: ordered_metadata_names_only');
//
//   const arraycolumn = (arr, n) =>
//     arr.map(x => x[n]
//     )
//   ;
//
//   console.timeEnd('time: ordered_metadata_names_only');
//   return arraycolumn(CONSTS.ORDERED_METADATA_NAMES, 0);
// };

// function get_field_names_by_dataset_ids(dataset_ids) {
//
//   var field_names_arr = [];
//   if (typeof dataset_ids === 'undefined' || dataset_ids.length === 0) {
//     field_names_arr = field_names_arr.concat(Object.keys(MD_CUSTOM_FIELDS_UNITS));
//   }
//   else {
//     for (var i = 0; i < dataset_ids.length; i++) {
//       var dataset_id  = dataset_ids[i];
//       field_names_arr = field_names_arr.concat(Object.keys(AllMetadata[dataset_id]));
//     }
//   }
//   field_names_arr = helpers.unique_array(field_names_arr); // one level
//   field_names_arr.sort();
//
//   return field_names_arr;
// //  [
// //   'access_point_type',
// //   'adapter_sequence',
// //   'adapter_sequence_id',
// // ...
// }

// function prepare_empty_metadata_object(pid, field_names_arr, all_metadata) {
//   console.time('TIME: prepare_empty_metadata_object');
//   all_metadata = all_metadata || {};
//   if (!(all_metadata.hasOwnProperty(pid))) {
//     all_metadata[pid] = {};
//   }
//
//   for (var i = 0; i < field_names_arr.length; i++) {
//     var field_name = field_names_arr[i];
//     if (!(all_metadata[pid].hasOwnProperty(field_name))) {
//       all_metadata[pid][field_name] = [];
//     }
//   }
//
//   console.timeEnd('TIME: prepare_empty_metadata_object');
//   return all_metadata;
// }

// function get_project_info(project_name_or_pid) {
//   var project_info;
//
//   if (helpers.isInt(project_name_or_pid)) {
//     project_info = PROJECT_INFORMATION_BY_PID[project_name_or_pid];
//   }
//   else {
//     project_info = PROJECT_INFORMATION_BY_PNAME[project_name_or_pid];
//   }
//
//   return {
//     project: project_info.project,
//     first_name: project_info.first,
//     institution: project_info.institution,
//     last_name: project_info.last,
//     pi_email: project_info.email,
//     pi_name: project_info.first + ' ' + project_info.last,
//     project_title: project_info.title,
//     public: project_info.public,
//     username: project_info.username
//   };
// }

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

// function make_array4(field_names_arr) {
// // make a 2D array as in CONSTS.ORDERED_METADATA_NAMES: [field_names_arr[i2], field_names_arr[i2], '', '']
//   var new_arr = [];
//   for (var i2 = 0; i2 < field_names_arr.length; i2++) {
//     var temp_arr = [field_names_arr[i2], field_names_arr[i2], '', ''];
//     new_arr.push(temp_arr);
//   }
//   return new_arr;
// }

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

// public

// exports.get_all_field_units = function (req) {
//   var current_field_units = MD_CUSTOM_UNITS[req.body.project_id];
// };

exports.get_second = function (element) {
  console.time('TIME: get_second');

  for (var met_names_row in CONSTS.ORDERED_METADATA_NAMES) {
    if (CONSTS.ORDERED_METADATA_NAMES[met_names_row].includes(element)) {
      // console.log('ETET met_names_row[1]');
      // console.log(CONSTS.ORDERED_METADATA_NAMES[met_names_row][1]);
      return CONSTS.ORDERED_METADATA_NAMES[met_names_row][1];
    }
  }
  console.timeEnd('TIME: get_second');
};

// exports.env_items_validation = function (value) {
//   if (value === 'Please choose one') {
//     throw new Error('%s is required. Please choose one value from the dropdown menu');
//   }
// };
//
// exports.geo_loc_name_validation = function (value, source) {
//   if ((!checkArray(source.geo_loc_name_marine)) && (!checkArray(source.geo_loc_name_continental))) {
//     throw new Error("Either 'Country' or 'Longhurst Zone' are required"); // jshint ignore:line
//   }
// };
//
// exports.geo_loc_name_continental_filter = function (value) {
//   console.time('geo_loc_name_continental_filter');
//   for (var key in CONSTS.GAZ_SPELLING) {
//     if (CONSTS.GAZ_SPELLING.hasOwnProperty(key)) {
//       var curr = CONSTS.GAZ_SPELLING[key];
//       if (curr.indexOf(value.toLowerCase()) > -1) {
//         return key;
//       }
//     }
//   }
//   console.timeEnd('geo_loc_name_continental_filter');
// };
//
// exports.geo_loc_name_marine_validation = function (value) {
//   if (MD_ENV_LZC_vals.indexOf(value) < 0 && (value !== '')) {
//     throw new Error("There is no Longhurst Zone '" + value + "', please check the spelling");
//   }
// };
//
// exports.geo_loc_name_continental_validation = function (value) {
//   if (MD_ENV_CNTRY_vals.indexOf(value) < 0 && (value !== '')) {
//     throw new Error("There is no Country '" + value + "', please check the spelling");
//   }
// };

// exports.numbers_n_period = function (value) {
//   // var regex = /^[0-9.]+$/;
//   //[^0-9.] faster
//   var reg_exp = /[^0-9.]/;
//   var err_msg = ', please use only numbers and periods.';
//   check_regexp(reg_exp, value, err_msg);
// };
//
// exports.numbers_n_period_n_minus = function (value) {
//   // var regex = /^[0-9.]+$/;
//   //[^0-9.] faster
//   var reg_exp = /[^0-9.-]/;
//   var err_msg = ', please use only numbers, periods and minus.';
//   check_regexp(reg_exp, value, err_msg);
// };
//
// exports.longitude_valid = function (value) {
//   region_valid(value, -180, 180);
// };
//
// exports.latitude_valid = function (value) {
//   region_valid(value, -90, 90);
// };
//
// exports.ph_valid = function (value) {
//   region_valid(value, 0, 14);
// };
//
// exports.percent_valid = function (value) {
//   region_valid(value, 0, 100);
// };
//
// exports.positive = function (value) {
//   if (value !== '' && parseInt(value) < 0) {
//     throw new Error("'" + value + "' is not valid, %s should be greater then 0.");
//   }
// };

exports.get_column_name = function (row_idx, req) {
  console.time('TIME: get_column_name');

  var units_field_name = new_row_field_validation(req, 'Units' + row_idx);

  var users_column_name = new_row_field_validation(req, 'Column Name' + row_idx);

  // console.log('LLL1 units_field_name');
  // console.log(units_field_name);
  //
  // console.log('LLL2 users_column_name');
  // console.log(users_column_name);

  if (units_field_name !== '' && users_column_name !== '') {
    return [users_column_name, units_field_name];
  }
  console.timeEnd('TIME: get_column_name');
};

exports.collect_new_rows = function (req, all_field_names) {
  console.time('TIME: collect_new_rows');
  // var new_rows_hash = {};
  var new_row_num               = req.body.new_row_num;
  var all_clean_field_names_arr = helpers.unique_array(module.exports.get_first_column(all_field_names, 0));
  // console.log('JSON.stringify(unique_array.all_clean_field_names_arr)');
  // console.log(JSON.stringify(helpers.unique_array(all_clean_field_names_arr)));

  for (var row_idx = 1; row_idx < parseInt(new_row_num) + 1; row_idx++) {
    var column_n_unit_names = module.exports.get_column_name(row_idx, req);

    if (column_n_unit_names) {

      var users_column_name = column_n_unit_names[0];
      var units_field_name  = column_n_unit_names[1];
      var column_name       = users_column_name + ' (' + units_field_name + ')';
      var re                = / /g;
      var clean_column_name = users_column_name.toLowerCase().replace(re, '_') + '--UNITS--' + units_field_name.toLowerCase().replace(re, '_');


      if (column_name && isUnique(all_clean_field_names_arr, clean_column_name)) {
        // [ 'run', 'Sequencing run date', 'MBL Supplied', 'YYYY-MM-DD' ],
        all_field_names.push([clean_column_name, column_name, '', units_field_name]);
        req.form[clean_column_name] = [];
        req.form[clean_column_name] = get_cell_val_by_row(row_idx, req);
      }
      else if (!isUnique(all_clean_field_names_arr, clean_column_name)) {
        var err_msg = 'User added field with units "' + column_name + '" must be unique and have only alpha numeric characters';
        req.form.errors.push(err_msg);
      }
    }
  }
  console.timeEnd('TIME: collect_new_rows');

  return all_field_names;
};

exports.get_first_column = function (matrix, col) {
  console.time('TIME: get_first_column');
  var column = [];
  for (var i = 0; i < matrix.length; i++) {
    column.push(matrix[i][col]);
  }
  console.timeEnd('TIME: get_first_column');

  return column;
};

exports.get_new_val = function (req, all_metadata_pid, all_new_names) {
  var new_val = [];
  for (var new_name_idx in all_new_names) {
    var new_name = all_new_names[new_name_idx];
    if (new_name !== '') {
      new_val = req.body[new_name];
    }
    if (typeof new_val !== 'undefined' && new_val.length !== 0) {
      all_metadata_pid[new_name] = new_val;
    }
  }
  return all_metadata_pid;
};

exports.slice_object = function (object, slice_keys) {
  console.time('TIME: convert to string');
  for (var i = 0; i < slice_keys.length; i++) {
    slice_keys[i] = String(slice_keys[i]);
  }
  console.timeEnd('TIME: convert to string');

  return Object.keys(object)
    .filter(function (key) {
      return slice_keys.indexOf(key) >= 0;
    })
    .reduce(function (acc, key) {
      acc[key] = object[key];
      return acc;
    }, {});
};

exports.get_project_name = function (edit_metadata_file) {
  console.time('TIME: get_project_name');

  var edit_metadata_file_parts = edit_metadata_file.split('-')[1].split('_');
  var edit_metadata_project    = '';

  if (edit_metadata_file_parts.length >= 4) {

    edit_metadata_project = edit_metadata_file_parts[1] + '_' + edit_metadata_file_parts[2] + '_' + edit_metadata_file_parts[3];
  }

  console.timeEnd('TIME: get_project_name');
  return edit_metadata_project;
};

//TODO: cyclomatic comlexity is 8!
exports.get_primers_info = function (dataset_id) {
  console.time('TIME: get_primers_info');
  var primer_suite_id = AllMetadata[dataset_id]['primer_suite_id'];
  var primer_info     = {};

  if (typeof primer_suite_id === 'undefined' || typeof MD_PRIMER_SUITE[primer_suite_id] === 'undefined' || typeof MD_PRIMER_SUITE[primer_suite_id].primer === 'undefined') {
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
  // console.log('DDD primer_info');
  // console.log(JSON.stringify(primer_info));
  // {'F':['CCTACGGGAGGCAGCAG','CCTACGGG.GGC[AT]GCAG','TCTACGGAAGGCTGCAG'],'R':['GGATTAG.TACCC']}

  console.timeEnd('TIME: get_primers_info');
  return primer_info;
};


exports.get_all_req_metadata = function (dataset_id) {
  console.time('TIME: 5) get_all_req_metadata');

  var data = {};
  for (var idx = 0; idx < CONSTS.REQ_METADATA_FIELDS_wIDs.length; idx++) {
    var key      = CONSTS.REQ_METADATA_FIELDS_wIDs[idx];
    // data[key] = [];
    var val_hash = helpers.required_metadata_names_from_ids(AllMetadata[dataset_id], key + '_id');

    data[key] = val_hash.value;
  }
  console.time('TIME: 5) get_all_req_metadata');

  return data;
};

// exports.make_all_field_names = function (dataset_ids) {
//   var ordered_metadata_names_only = get_names_from_ordered_const();
//
//   // why get_field_names_by_dataset_ids again? 1) substract METADATA_NAMES_SUBSTRACT, 2) substract '_id', 3) substract ordered_metadata_names_only
//   var structured_field_names0 = get_field_names_by_dataset_ids(dataset_ids);
//   var diff_names              = structured_field_names0.filter(function (x) {
//     return CONSTS.METADATA_NAMES_SUBSTRACT.indexOf(x) < 0;
//   });
//   diff_names                  = diff_names.filter(function (item) {
//     return /^((?!_id).)*$/.test(item);
//   });
//   diff_names                  = diff_names.filter(function (x) {
//     return ordered_metadata_names_only.indexOf(x) < 0;
//   });
//
//   // // make a 2D array as in CONSTS.ORDERED_METADATA_NAMES: [diff_names[i2], diff_names[i2], '', '']
//   // // TODO: add units from db
//   // var big_arr_diff_names = [];
//   // for (var i2 = 0; i2 < diff_names.length; i2++) {
//   //   var temp_arr = [diff_names[i2], diff_names[i2], '', ''];
//   //   big_arr_diff_names.push(temp_arr);
//   // }
//
//   var big_arr_diff_names = make_array4(diff_names);
//   return helpers.unique_array(CONSTS.ORDERED_METADATA_NAMES.concat(big_arr_diff_names));
//
// };

exports.fill_out_arr_doubles = function (value, repeat_times) {
  var arr_temp = Array(repeat_times);

  arr_temp.fill(value, 0, repeat_times);

  return arr_temp;
};

// TODO: move to helpers, use here and for project_profile
// exports.get_project_prefix = function (project) {
//   console.time('TIME: get_project_prefix');
//   var project_parts  = project.split('_');
//   var project_prefix = project;
//
//   if (project_parts.length >= 2) {
//     project_prefix = project_parts[0] + '_' + project_parts[1];
//   }
//   console.timeEnd('TIME: get_project_prefix');
//   return project_prefix;
// };

// exports.array_from_object = function (data) {
//   var data_arr = [];
//   for (var key in data) {
//     var value_arr;
//     if (typeof data[key] === 'object') {
//       value_arr = data[key];
//     }
//     else {
//       value_arr = [data[key]];
//     }
//     value_arr.unshift(key);
//     data_arr.push(value_arr);
//   }
//   return data_arr;
// };

// exports.transpose_2d_arr = function (data_arr, project_id) {
//   console.time('TIME: transpose_2d_arr');
//
//   //make an array with proper length, even if the first one is empty
//   var matrix_length = DATASET_IDS_BY_PID[project_id].length + 1;
//   var length_array  = data_arr[0];
//   if (data_arr[0].length < matrix_length) {
//     length_array = module.exports.fill_out_arr_doubles('', matrix_length);
//   }
//
//   var newArray = length_array.map(function (col, i) {
//     return data_arr.map(function (row) {
//       return row[i];
//     });
//   });
//   console.timeEnd('TIME: transpose_2d_arr');
//   return newArray;
// };

//TODO: move to csv files controller?
//TODO: cyclomatic comlexity is 10!
// exports.convertArrayOfObjectsToCSV = function (args) {
//   console.time('TIME: convertArrayOfObjectsToCSV');
//
//   var result, columnDelimiter, lineDelimiter, data, cellEscape, data_arr, transposed_data_arr, user_info, project_id;
//
//   data = args.data || null;
//   if (data === null) {
//     return null;
//   }
//
//   user_info = args.user_info || null;
//   if (user_info === null) {
//     return null;
//   }
//
//   project_id = args.project_id || null;
//   if (project_id === null) {
//     return null;
//   }
//
//   data_arr = module.exports.array_from_object(data);
//
//   var matrix_length = DATASET_IDS_BY_PID[project_id].length + 1;
//   transposed_data_arr = module.exports.transpose_2d_arr(data_arr, matrix_length);
//
//   columnDelimiter = args.columnDelimiter || ',';
//   lineDelimiter   = args.lineDelimiter || '\n';
//   cellEscape      = args.cellEscape || '"';
//
//   result = '';
//   transposed_data_arr.map(function (row) {
//     // TODO: to a function?
//     // result = row.map(function (item) {
//     var r1 = row.map(function (item) {
//       // Wrap each element of the items array with quotes
//       return cellEscape + item + cellEscape;
//     }).join(columnDelimiter);
//
//     result += r1;
//     result += lineDelimiter;
//   });
//
//
//   console.timeEnd('TIME: convertArrayOfObjectsToCSV');
//
//   return result;
// };

// exports.get_pi_list = function () {
//   console.log('FROM Controller');
//   var pi_list = [];
//
//   for (var i in ALL_USERS_BY_UID) {
//     pi_list.push({
//       'PI': ALL_USERS_BY_UID[i].last_name + ' ' + ALL_USERS_BY_UID[i].first_name,
//       'pi_id': i,
//       'last_name': ALL_USERS_BY_UID[i].last_name,
//       'first_name': ALL_USERS_BY_UID[i].first_name,
//       'pi_email': ALL_USERS_BY_UID[i].email
//     });
//   }
//
//   pi_list.sort(function sortByAlpha(a, b) {
//     return helpers.compareStrings_alpha(a.PI, b.PI);
//   });
//
//   return pi_list;
// };

// exports.get_inits = function (arr) {
//   var inits_len     = arr.length;
//   var project_name1 = '';
//   for (var i = 0; i < inits_len; i++) {
//     project_name1 = project_name1 + arr[i][0];
//   }
//   return project_name1;
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

