// var Metadata = require(app_root + '/models/metadata');
var helpers   = require(app_root + '/routes/helpers/helpers');
var CONSTS    = require(app_root + "/public/constants");
var validator = require('validator');

// Display list of all Submissions.
// exports.submission_list = function (req, res) {
//   res.send('NOT IMPLEMENTED: Submission list');
// };


// private
checkArray = function (my_arr) {
  for (var i = 0; my_arr.length > i; i++) {
    if (my_arr[i] === "")
      return false;
  }
  return true;
};

check_regexp = function (reg_exp, value, err_msg) {
  var result = value.match(reg_exp);

  // if (value !== "" && result === null) {
  if (value !== "" && result !== null) {
    throw new Error("'" + value + "' is not allowed in '%s'" + err_msg);
  }
};

region_valid = function (value, region_low, region_high) {
  if ((value !== '') && (parseInt(value) < parseInt(region_low) || parseInt(value) > parseInt(region_high))) {
    throw new Error("'" + value + "' is not valid, %s should be between " + region_low + " and " + region_high);
  }
};

new_row_field_validation = function (req, field_name) {
  console.time("TIME: new_row_field_validation");
  var err_msg = '';

  //todo: send a value instead of "req.body[field_name]"?
  var field_val_trimmed   = validator.escape(req.body[field_name] + "");
  field_val_trimmed       = validator.trim(field_val_trimmed + "");
  var field_val_not_valid = validator.isEmpty(field_val_trimmed + "");

  if (field_val_not_valid) {
    console.log("ERROR: an empty user's " + field_name);
    err_msg = 'User added field "' + field_name + '" must be not empty and have only alpha numeric characters';
    req.form.errors.push(err_msg);
  }

  console.timeEnd("TIME: new_row_field_validation");
  return field_val_trimmed;
};

isUnique = function (all_clean_field_names_arr, column_name) {
  return (all_clean_field_names_arr.indexOf(column_name) < 0);
};

get_cell_val_by_row = function (row_idx, req) {
  console.time("TIME: get_cell_val_by_row");
  var new_row_length = req.body.new_row_length;
  var new_row_val    = [];

  for (var cell_idx = 0; cell_idx < parseInt(new_row_length); cell_idx++) {
    var cell_name = "new_row" + row_idx.toString() + "cell" + cell_idx.toString();
    var clean_val = validator.escape(req.body[cell_name] + "");
    clean_val     = validator.trim(clean_val + "");

    new_row_val.push(clean_val);
  }
  console.timeEnd("TIME: get_cell_val_by_row");

  return new_row_val;
};

// public

exports.get_all_field_units = function (req) {
  var current_field_units = MD_CUSTOM_UNITS[req.body.project_id];
};

exports.get_second = function (element) {
  console.time("TIME: get_second");

  for (var met_names_row in CONSTS.ORDERED_METADATA_NAMES) {
    if (CONSTS.ORDERED_METADATA_NAMES[met_names_row].includes(element)) {
      // console.log("ETET met_names_row[1]");
      // console.log(CONSTS.ORDERED_METADATA_NAMES[met_names_row][1]);
      return CONSTS.ORDERED_METADATA_NAMES[met_names_row][1];
    }
  }
  console.timeEnd("TIME: get_second");
};

exports.env_items_validation = function (value) {
  if (value === "Please choose one") {
    throw new Error("%s is required. Please choose one value from the dropdown menu");
  }
};


exports.geo_loc_name_validation = function (value, source) {
  if ((!checkArray(source.geo_loc_name_marine)) && (!checkArray(source.geo_loc_name_continental))) {
    throw new Error("Either 'Country' or 'Longhurst Zone' are required");
  }
};

exports.geo_loc_name_continental_filter = function (value) {
  console.time("geo_loc_name_continental_filter");
  for (var key in CONSTS.GAZ_SPELLING) {
    if (CONSTS.GAZ_SPELLING.hasOwnProperty(key)) {
      var curr = CONSTS.GAZ_SPELLING[key];
      if (curr.indexOf(value.toLowerCase()) > -1) {
        return key;
      }
    }
  }
  console.timeEnd("geo_loc_name_continental_filter");
};

exports.get_object_vals = function (object_name) {
  return Object.keys(object_name).map(function (key) {
    return object_name[key];
  });
};

exports.geo_loc_name_marine_validation = function (value) {
  if (MD_ENV_LZC_vals.indexOf(value) < 0 && (value !== '')) {
    throw new Error("There is no Longhurst Zone '" + value + "', please check the spelling");
  }
};

exports.geo_loc_name_continental_validation = function (value) {
  if (MD_ENV_CNTRY_vals.indexOf(value) < 0 && (value !== '')) {
    throw new Error("There is no Country '" + value + "', please check the spelling");
  }
};

exports.numbers_n_period = function (value) {
  // var regex = /^[0-9.]+$/;
  //[^0-9.] faster
  var reg_exp = /[^0-9.]/;
  var err_msg = ", please use only numbers and periods.";
  check_regexp(reg_exp, value, err_msg);
};

exports.numbers_n_period_n_minus = function (value) {
  // var regex = /^[0-9.]+$/;
  //[^0-9.] faster
  var reg_exp = /[^0-9.-]/;
  var err_msg = ", please use only numbers, periods and minus.";
  check_regexp(reg_exp, value, err_msg);
};

exports.longitude_valid = function (value) {
  region_valid(value, -180, 180);
};

exports.latitude_valid = function (value) {
  region_valid(value, -90, 90);
};

exports.ph_valid = function (value) {
  region_valid(value, 0, 14);
};

exports.percent_valid = function (value) {
  region_valid(value, 0, 100);
};

exports.positive = function (value) {
  if (value !== '' && parseInt(value) < 0) {
    throw new Error("'" + value + "' is not valid, %s should be greater then 0.");
  }
};

exports.get_column_name = function (row_idx, req) {
  console.time("TIME: get_column_name");

  var units_field_name = new_row_field_validation(req, "Units" + row_idx);

  var users_column_name = new_row_field_validation(req, "Column Name" + row_idx);

  // console.log("LLL1 units_field_name");
  // console.log(units_field_name);
  //
  // console.log("LLL2 users_column_name");
  // console.log(users_column_name);

  if (units_field_name !== "" && users_column_name !== "") {
    return [users_column_name, units_field_name];
  }
  console.timeEnd("TIME: get_column_name");
};

exports.collect_new_rows = function (req, all_field_names) {
  console.time("TIME: collect_new_rows");
  // var new_rows_hash = {};
  var new_row_num               = req.body.new_row_num;
  var all_clean_field_names_arr = helpers.unique_array(module.exports.get_first_column(all_field_names, 0));
  // console.log("JSON.stringify(unique_array.all_clean_field_names_arr)");
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
  console.timeEnd("TIME: collect_new_rows");

  return all_field_names;
};

exports.get_first_column = function (matrix, col) {
  console.time("TIME: get_first_column");
  var column = [];
  for (var i = 0; i < matrix.length; i++) {
    column.push(matrix[i][col]);
  }
  console.timeEnd("TIME: get_first_column");

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
  console.time("TIME: convert to string");
  for (var i = 0; i < slice_keys.length; i++) slice_keys[i] = String(slice_keys[i]);
  console.timeEnd("TIME: convert to string");

  return Object.keys(object)
    .filter(function (key) {
      return slice_keys.indexOf(key) >= 0;
    })
    .reduce(function (acc, key) {
      acc[key] = object[key];
      return acc;
    }, {});
};

exports.get_project_name =  function(edit_metadata_file) {
  console.time("TIME: get_project_name");

  var edit_metadata_file_parts = edit_metadata_file.split('-')[1].split('_');
  var edit_metadata_project    = "";

  if (edit_metadata_file_parts.length >= 4) {

    edit_metadata_project = edit_metadata_file_parts[1] + "_" + edit_metadata_file_parts[2] + "_" + edit_metadata_file_parts[3];
  }

  console.timeEnd("TIME: get_project_name");
  return edit_metadata_project;
};

exports.get_primers_info = function(dataset_id) {
  console.time("TIME: get_primers_info");
  var primer_suite_id = AllMetadata[dataset_id]["primer_suite_id"];
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
  // console.log("DDD primer_info");
  // console.log(JSON.stringify(primer_info));
  // {"F":["CCTACGGGAGGCAGCAG","CCTACGGG.GGC[AT]GCAG","TCTACGGAAGGCTGCAG"],"R":["GGATTAG.TACCC"]}

  console.timeEnd("TIME: get_primers_info");
  return primer_info;
};
