var Project   = require(app_root + '/models/project_model');
var User      = require(app_root + '/models/user_model');
var helpers   = require(app_root + '/routes/helpers/helpers');
var CONSTS    = require(app_root + "/public/constants");
var validator = require('validator');
var config    = require(app_root + '/config/config');
var fs        = require("fs");
var path      = require("path");

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

get_names_from_ordered_const = function () {
  console.time("time: ordered_metadata_names_only");

  const arraycolumn = (arr, n) =>
  arr.map(x => x[n])
  ;

  // var ordered_metadata_names_only = consts.metadata_form_required_fields.concat(arraycolumn(consts.ordered_metadata_names, 0));

  console.timeEnd("time: ordered_metadata_names_only");
  return arraycolumn(CONSTS.ORDERED_METADATA_NAMES, 0);
};

// get_all_dataset_ids = function () {
//   console.time("TIME: get_all_dataset_ids");
//   var all_dataset_ids = Object.keys(AllMetadata[dataset_id]);
//   console.timeEnd("TIME: get_all_dataset_ids");
//   return all_dataset_ids_uniq;
// };


get_field_names_by_dataset_ids = function (dataset_ids) {

  var field_names_arr = [];
  // field_names_arr = field_names_arr.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
  // field_names_arr = field_names_arr.concat(CONSTS.PROJECT_INFO_FIELDS);
  if (typeof dataset_ids === 'undefined' || dataset_ids.length === 0) {
    // get all custom fields
  //MD_CUSTOM_FIELDS_UNITS
    // {
    //   "ammonium": "micromolePerKilogram",
    //   "chloride": "micromolePerKilogram",
    field_names_arr = field_names_arr.concat(Object.keys(MD_CUSTOM_FIELDS_UNITS));

  }
  else {
    for (var i = 0; i < dataset_ids.length; i++) {
      var dataset_id = dataset_ids[i];
      field_names_arr = field_names_arr.concat(Object.keys(AllMetadata[dataset_id]));
    }
  }
  field_names_arr = helpers.unique_array(field_names_arr); // one level
  field_names_arr.sort();

  // console.log("MMM0 AllMetadata");
  // console.log(JSON.stringify(AllMetadata));
  //
  // console.log("MMM1 field_names_arr");
  // console.log(JSON.stringify(field_names_arr));

  return field_names_arr;
};

prepare_empty_metadata_object = function (pid, field_names_arr, all_metadata) {
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
};

get_project_info = function (project_name_or_pid) {
  var project_info;

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
    pi_name: project_info.first + " " + project_info.last,
    project_title: project_info.title,
    public: project_info.public,
    username: project_info.username
  };
};

filterItems = function (arr, query) {
  return arr.filter(function (el) {
    return el.toLowerCase().indexOf(query.toLowerCase()) < 0;
  });
};

make_ordered_field_names_obj = function () {
  console.time("TIME: make_ordered_field_names_obj");
  var ordered_field_names_obj = {};

  for (var i in CONSTS.ORDERED_METADATA_NAMES) {
    // [ 'biomass_wet_weight', 'Biomass - wet weight', '', 'gram' ]
    var temp_arr = [i];
    temp_arr.push(CONSTS.ORDERED_METADATA_NAMES[i]);
    ordered_field_names_obj[CONSTS.ORDERED_METADATA_NAMES[i][0]] = temp_arr;
  }
  console.timeEnd("TIME: make_ordered_field_names_obj");
  return ordered_field_names_obj;
};

get_object_vals = function (object_name) {
  return Object.keys(object_name).map(function (key) {
    return object_name[key];
  });
};

reverseString = function (str) {
  var out_str = '';
  for (var i = str.length - 1; i >= 0; i--) {
    out_str += str[i];
  }
  return out_str;
};

collect_field_names = function(dataset_ids) {
  var all_field_names = CONSTS.METADATA_FORM_REQUIRED_FIELDS.concat(get_field_names_by_dataset_ids(dataset_ids));
  all_field_names     = all_field_names.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
  all_field_names     = all_field_names.concat(CONSTS.PROJECT_INFO_FIELDS);
  all_field_names     = all_field_names.concat(CONSTS.METADATA_NAMES_ADD);

  all_field_names = helpers.unique_array(all_field_names);
  return all_field_names;

};

// prepare_field_names = function (dataset_ids) {
//   var all_field_names = CONSTS.METADATA_FORM_REQUIRED_FIELDS;
//   if (typeof dataset_ids !== 'undefined' && dataset_ids.length !== 0) {
//     all_field_names = all_field_names.concat(get_field_names_by_dataset_ids(dataset_ids));
//   }
//   all_field_names = all_field_names.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
//   all_field_names = all_field_names.concat(CONSTS.PROJECT_INFO_FIELDS);
//   all_field_names = helpers.unique_array(all_field_names);
//   return all_field_names;
// };

create_all_metadata_form_new = function (rows, req, res, all_field_names) {
  var pid           = rows.insertId;
  var warningStatus = rows.warningStatus;
  var user_id       = req.form.pi_id_name.split("#")[0];

  var user_obj = User.getUserInfoFromGlobal(user_id);
  // console.log("DDD3, all_dataset_ids.flat(2)", all_dataset_ids);

  console.log("DDD pid", pid);


  var all_metadata = {};
  all_metadata     = prepare_empty_metadata_object(pid, all_field_names, all_metadata);
  console.log("PPP01 all_metadata from create_all_metadata_form_new", all_metadata);
  var repeat_times = parseInt(req.form.samples_number, 10);
  console.log(typeof repeat_times);
  var project_info = {
    project: project_obj.project,
    first_name: user_obj.first_name,
    institution: user_obj.institution,
    last_name: user_obj.last_name,
    pi_email: user_obj.email,
    pi_name: user_obj.first_name + " " + user_obj.last_name,
    project_title: project_obj.title,
    public: project_obj.public,
    username: user_obj.username
  };


  console.log("MMM33 all_metadata[pid]");
  console.log(JSON.stringify(all_metadata[pid]));

  for (var idx in CONSTS.PROJECT_INFO_FIELDS) {
    var field_name                = CONSTS.PROJECT_INFO_FIELDS[idx];
    all_metadata[pid][field_name] = [project_info[field_name]];
    //todo: split if, if length == dataset_ids.length - just use as is
    if ((typeof all_metadata[pid][field_name] !== 'undefined') && all_metadata[pid][field_name].length < 1) {
      all_metadata[pid][field_name] = module.exports.fill_out_arr_doubles(all_metadata[pid][field_name], repeat_times);
    }
    else {
      all_metadata[pid][field_name] = module.exports.fill_out_arr_doubles(project_info[field_name], repeat_times);
    }
  }

  if ((all_metadata[pid]["project_abstract"] === 'undefined') || (!all_metadata[pid].hasOwnProperty(["project_abstract"]))) {
    all_metadata[pid]["project_abstract"] = module.exports.fill_out_arr_doubles("", repeat_times);
  }
  else {

    if ((all_metadata[pid]["project_abstract"][0] !== 'undefined') && (!Array.isArray(all_metadata[pid]["project_abstract"][0]))) {

      var project_abstract_correct_form = helpers.unique_array(all_metadata[pid]["project_abstract"]);

      if (typeof project_abstract_correct_form[0] !== 'undefined') {

        all_metadata[pid]["project_abstract"] = module.exports.fill_out_arr_doubles(project_abstract_correct_form[0].split(","), repeat_times);

      }
    }
  }

  var more_fields = ["adapter_sequence_id",
    "dataset_description",
    "dataset_id",
    "dna_region_id",
    "domain_id",
    "env_biome_id",
    "env_feature_id",
    "env_material_id",
    "env_package_id",
    "geo_loc_name_id",
    "illumina_index_id",
    "primer_suite_id",
    "run_id",
    "sequencing_platform_id",
    "target_gene_id"];

  for (var f in more_fields) {
    all_metadata[pid][more_fields[f]] = module.exports.fill_out_arr_doubles("", repeat_times);

  }
  // var pid  = req.body.project_id;
  // var data = req.form;
  //
  //   // console.log("DDD9 req.form");
  //   // console.log(JSON.stringify(req.form));
  //
  //
  //   //add project_abstract etc.
  //   //TODO: DRY with other such places.
  //
  //   var normal_length = req.form.samples_number;
  //   for (var a in data) {
  //     if (data[a].length < normal_length && (typeof data[a][0] !== 'undefined')) {
  //       data[a] = module.exports.fill_out_arr_doubles(data[a][0], normal_length);
  //     }
  //   }
  //

  console.log("PPP02 all_metadata from create_all_metadata_form_new", all_metadata);
//--
  // "4115":{"adapter_sequence_id":"81",
  // "geo_loc_name_id":"668066",
  // "run_id":"66",
  // "collection_date":"2008-04-12",
  // "env_material_id":"6191",
  // "dna_region_id":"12",
  // "longitude":"8.43361",
  // "domain_id":"3",
  // "target_gene_id":"1",
  // "env_feature_id":"1425",
  // "env_package_id":"22",
  // "illumina_index_id":"83",
  // "env_biome_id":"6191",
  // "latitude":"55.02861",
  // "primer_suite_id":"23",
  // "sequencing_platform_id":"1"},

  return all_metadata;
  //TODO: create all_metadata for empty new project
  // "4115":{"adapter_sequence_id":"81",
  // "geo_loc_name_id":"668066",
  // "run_id":"66",
  // "collection_date":"2008-04-12",
  // "env_material_id":"6191",
  // "dna_region_id":"12",
  // "longitude":"8.43361",
  // "domain_id":"3",
  // "target_gene_id":"1",
  // "env_feature_id":"1425",
  // "env_package_id":"22",
  // "illumina_index_id":"83",
  // "env_biome_id":"6191",
  // "latitude":"55.02861",
  // "primer_suite_id":"23",
  // "sequencing_platform_id":"1"},

  // project_abstracts
  // res.render('metadata/metadata_edit_form', {
  // title: "VAMPS: Metadata_upload",
  // user: req.user,
  // hostname: req.CONFIG.hostname,
  // all_metadata: {},
  // all_field_names: all_field_names,
  // ordered_field_names_obj: ordered_field_names_obj,
  // all_field_units: MD_CUSTOM_UNITS[req.body.project_id],
  // dividers: CONSTS.ORDERED_METADATA_DIVIDERS,
  // dna_extraction_options: CONSTS.MY_DNA_EXTRACTION_METH_OPTIONS,
  // dna_quantitation_options: CONSTS.DNA_QUANTITATION_OPTIONS,
  // biome_primary_options: CONSTS.BIOME_PRIMARY,
  // feature_primary_options: CONSTS.FEATURE_PRIMARY,
  // material_primary_options: CONSTS.MATERIAL_PRIMARY,
  // metadata_form_required_fields: CONSTS.METADATA_FORM_REQUIRED_FIELDS,
  // env_package_options: CONSTS.DCO_ENVIRONMENTAL_PACKAGES,
  // investigation_type_options: CONSTS.INVESTIGATION_TYPE,
  // sample_type_options: CONSTS.SAMPLE_TYPE
  // button_name: "Submit",
  // domain_regions: CONSTS.DOMAIN_REGIONS,
  // hostname: req.CONFIG.hostname,
  // pi_list: req.session.pi_list,
  // project_title: req.form.project_title,
  // samples_number: req.form.samples_number,
  // title: 'VAMPS: New Metadata',
  // user: req.user
  // });
  // }

};
// public

// exports.get_all_field_units = function (req) {
//   var current_field_units = MD_CUSTOM_UNITS[req.body.project_id];
// };

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

exports.get_project_name = function (edit_metadata_file) {
  console.time("TIME: get_project_name");

  var edit_metadata_file_parts = edit_metadata_file.split('-')[1].split('_');
  var edit_metadata_project    = "";

  if (edit_metadata_file_parts.length >= 4) {

    edit_metadata_project = edit_metadata_file_parts[1] + "_" + edit_metadata_file_parts[2] + "_" + edit_metadata_file_parts[3];
  }

  console.timeEnd("TIME: get_project_name");
  return edit_metadata_project;
};

exports.get_primers_info = function (dataset_id) {
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


exports.get_all_req_metadata = function (dataset_id) {
  console.time("TIME: 5) get_all_req_metadata");

  var data = {};
  for (var idx = 0; idx < CONSTS.REQ_METADATA_FIELDS_wIDs.length; idx++) {
    var key      = CONSTS.REQ_METADATA_FIELDS_wIDs[idx];
    // data[key] = [];
    var val_hash = helpers.required_metadata_names_from_ids(AllMetadata[dataset_id], key + "_id");

    data[key] = val_hash.value;
  }
  console.time("TIME: 5) get_all_req_metadata");

  return data;
};

exports.make_all_field_names = function (dataset_ids) {
  var ordered_metadata_names_only = get_names_from_ordered_const();

  var structured_field_names0 = get_field_names_by_dataset_ids(dataset_ids);
  var diff_names              = structured_field_names0.filter(function (x) {
    return CONSTS.METADATA_NAMES_SUBSTRACT.indexOf(x) < 0;
  });
  diff_names                  = diff_names.filter(function (item) {
    return /^((?!_id).)*$/.test(item);
  });
  diff_names                  = diff_names.filter(function (x) {
    return ordered_metadata_names_only.indexOf(x) < 0;
  });

  // make a 2D array as in CONSTS.ORDERED_METADATA_NAMES
  // TODO: add units from db
  var big_arr_diff_names = [];
  for (var i2 = 0; i2 < diff_names.length; i2++) {
    var temp_arr = [diff_names[i2], diff_names[i2], "", ""];
    big_arr_diff_names.push(temp_arr);
  }

  return helpers.unique_array(CONSTS.ORDERED_METADATA_NAMES.concat(big_arr_diff_names));

};

exports.fill_out_arr_doubles = function (value, repeat_times) {
  var arr_temp = Array(repeat_times);

  arr_temp.fill(value, 0, repeat_times);

  return arr_temp;
};

exports.from_obj_to_obj_of_arr = function (data, pid) {
  console.time("TIME: from_obj_to_obj_of_arr");
  var obj_of_arr = {};

  var dataset_ids = DATASET_IDS_BY_PID[pid];

  // var all_field_names = helpers.unique_array(CONSTS.METADATA_FORM_REQUIRED_FIELDS.concat(get_field_names_by_dataset_ids(dataset_ids)));
  //TODO: make field_names collection a separate function
  // var all_field_names = CONSTS.METADATA_FORM_REQUIRED_FIELDS.concat(get_field_names_by_dataset_ids(dataset_ids));
  // all_field_names     = all_field_names.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
  // all_field_names     = all_field_names.concat(CONSTS.PROJECT_INFO_FIELDS);
  // all_field_names     = all_field_names.concat(CONSTS.METADATA_NAMES_ADD);
  //
  // all_field_names = helpers.unique_array(all_field_names);

  var all_field_names = collect_field_names(dataset_ids);
  // console.log("HHH0 AllMetadataNames");
  // console.log(JSON.stringify(AllMetadataNames));
  //
  // console.log("HHH2 all_field_names");
  // console.log(JSON.stringify(all_field_names));

  for (var did_idx in dataset_ids) {
    var did = dataset_ids[did_idx];
    for (var field_name_idx in all_field_names) {

      var field_name = all_field_names[field_name_idx];
      if (!(obj_of_arr.hasOwnProperty(field_name))) {
        obj_of_arr[field_name] = [];
      }
      obj_of_arr[field_name].push(data[did][field_name]);
    }
  }

  // console.log("HHH3 obj_of_arr from from_obj_to_obj_of_arr");
  // console.log(JSON.stringify(obj_of_arr));

  console.timeEnd("TIME: from_obj_to_obj_of_arr");
  return obj_of_arr;
};

//not_used?
// exports.add_all_val_by_key = function(my_key_hash, my_val_hash, all_metadata_pid) {
//   console.time("TIME: 6) add_all_val_by_key");
//
//   for (var i1 = 0, len1 = my_key_hash.length; i1 < len1; i1++) {
//     var key = my_key_hash[i1];
//     var val = my_val_hash[key];
//
//     if (!(all_metadata_pid.hasOwnProperty(key))) {
//       all_metadata_pid[key] = [];
//     }
//     all_metadata_pid[key].push(val);
//
//   }
//   console.timeEnd("TIME: 6) add_all_val_by_key");
//   return all_metadata_pid;
// };

exports.get_project_abstract_data = function (project, path_to_static) {
  console.time("TIME: get_project_abstract_data");

  var info_file     = '';
  var abstract_data = {};
  if (project.substring(0, 3) === 'DCO') {
    info_file     = path.join(path_to_static, 'abstracts', 'DCO_info.json');
    abstract_data = JSON.parse(fs.readFileSync(info_file, 'utf8'));
  }
  console.timeEnd("TIME: get_project_abstract_data");
  return abstract_data;
};

// TODO: move to helpers, use here and for project_profile
exports.get_project_prefix = function (project) {
  console.time("TIME: get_project_prefix");
  var project_parts  = project.split('_');
  var project_prefix = project;

  if (project_parts.length >= 2) {
    project_prefix = project_parts[0] + '_' + project_parts[1];
  }
  console.timeEnd("TIME: get_project_prefix");
  return project_prefix;
};

exports.array_from_object = function (data) {
  var data_arr = [];
  for (var key in data) {
    var value_arr;
    if (typeof data[key] === "object") {
      value_arr = data[key];
    }
    else {
      value_arr = [data[key]];
    }
    value_arr.unshift(key);
    data_arr.push(value_arr);
  }
  return data_arr;
};

exports.transpose_2d_arr = function (data_arr, project_id) {
  console.time("TIME: transpose_2d_arr");

  //make an array with proper length, even if the first one is empty
  var matrix_length = DATASET_IDS_BY_PID[project_id].length + 1;
  var length_array  = data_arr[0];
  if (data_arr[0].length < matrix_length) {
    length_array = module.exports.fill_out_arr_doubles('', matrix_length);
  }

  var newArray = length_array.map(function (col, i) {
    return data_arr.map(function (row) {
      return row[i];
    });
  });
  console.timeEnd("TIME: transpose_2d_arr");
  return newArray;
};

//TODO: move to csv files controller?
exports.convertArrayOfObjectsToCSV = function (args) {
  console.time("TIME: convertArrayOfObjectsToCSV");

  var result, columnDelimiter, lineDelimiter, data, cellEscape, data_arr, transposed_data_arr, user_info, project_id;

  data = args.data || null;
  if (data === null) {
    return null;
  }

  user_info = args.user_info || null;
  if (user_info === null) {
    return null;
  }

  project_id = args.project_id || null;
  if (project_id === null) {
    return null;
  }

  data_arr = module.exports.array_from_object(data);

  transposed_data_arr = module.exports.transpose_2d_arr(data_arr, project_id);

  columnDelimiter = args.columnDelimiter || ',';
  lineDelimiter   = args.lineDelimiter || '\n';
  cellEscape      = args.cellEscape || '"';

  result = '';
  transposed_data_arr.map(function (row) {
    // TODO: to a function?
    var r1 = row.map(function (item) {
      // Wrap each element of the items array with quotes
      return cellEscape + item + cellEscape;
    }).join(columnDelimiter);

    result += r1;
    result += lineDelimiter;
  });

  console.timeEnd("TIME: convertArrayOfObjectsToCSV");

  return result;
};

exports.get_pi_list = function () {
  console.log("FROM Controller");
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
};

exports.get_inits = function (arr) {
  var inits_len     = arr.length;
  var project_name1 = "";
  for (var i = 0; i < inits_len; i++) {
    project_name1 = project_name1 + arr[i][0];
  }
  return project_name1;
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

exports.saveProject = function (req, res) {
  console.log("JJJ req.form from saveProject = ", req.form);
  var d_region_arr  = req.form.d_region.split("#");
  var owner_info    = req.form.pi_id_name.split("#");
  var metagenomic   = 0;
  var project_name3 = d_region_arr[2];
  if (d_region_arr[0] === 'Shotgun') {
    metagenomic   = 1;
    project_name3 = "Sgun";
  }
  project_obj                     = {};
  project_obj.project_id          = 0;
  project_obj.project             = req.form.project_name1 + "_" + req.form.project_name2 + "_" + project_name3;
  project_obj.title               = req.form.project_title;
  project_obj.project_description = req.form.project_description;
  project_obj.rev_project_name    = reverseString(project_obj.project);
  project_obj.funding             = req.form.funding_code;
  project_obj.public              = 0;
  project_obj.metagenomic         = metagenomic;
  project_obj.matrix              = 0;
  project_obj.created_at          = new Date();
  project_obj.updated_at          = new Date();
  project_obj.active              = 0;


  //2018-06-20 13:09:14

  console.log("OOO1 JSON.stringify(project_obj) = ", JSON.stringify(project_obj));

  // Project.getAllProjects(function (err, rows) {
  //   console.log("EEE err", err);
  //   console.log("EEE0 rows", rows);
  //
  // });

  Project.addProject(project_obj, function (err, rows) {

    if (err) {
      console.log("WWW0 err", err);
      req.flash("fail", err);

      // res.json(err);
    }
    else {
      console.log("WWW rows", rows);
      var all_field_names = collect_field_names();
      // TODO: add
      //   funding_code: [ '0' ],
      //   sample_concentration: [],
      //   submit_code: [],
      //   tube_label:
      all_field_names = [["structured comment name", "Parameter", "", ""], ["", "General", "", ""], ["dataset", "VAMPS dataset name", "MBL Supplied", ""], ["geo_loc_name_continental", "Country (if not international waters)", "User Supplied", ""], ["geo_loc_name_marine", "Longhurst Zone (if marine)", "User Supplied", ""], ["", "MBL generated laboratory metadata", "", ""], ["domain", "Domain", "MBL Supplied", ""], ["target_gene", "Target gene name", "MBL Supplied", "16S rRNA, mcrA, etc"], ["dna_region", "DNA region", "MBL Supplied", ""], ["sequencing_platform", "Sequencing method", "MBL Supplied", ""], ["forward_primer", "Forward PCR Primer", "MBL Supplied", ""], ["reverse_primer", "Reverse PCR Primer", "MBL Supplied", ""], ["illumina_index", "Index sequence (for Illumina)", "MBL Supplied", ""], ["adapter_sequence", "Adapter sequence", "MBL Supplied", ""], ["run", "Sequencing run date", "MBL Supplied", "YYYY-MM-DD"], ["", "User supplied metadata", "", ""], ["env_package", "Environmental Package", "User supplied", ""], ["sample_name", "Sample ID (user sample name)", "User supplied", ""], ["investigation_type", "Investigation Type", "User supplied", ""], ["sample_type", "Sample Type", "User supplied", ""], ["collection_date", "Sample collection date", "User supplied", "YYYY-MM-DD"], ["latitude", "Latitude (±90°)", "User supplied", "decimal degrees ±90°"], ["longitude", "Longitude (±180°)", "User supplied", "decimal degrees ±180°"], ["env_biome", "Environmental Biome - Primary", "User supplied", ""], ["biome_secondary", "Environmental Biome - Secondary", "User supplied", ""], ["env_feature", "Environmental Feature - Primary", "User supplied", ""], ["feature_secondary", "Environmental Feature - Secondary", "User supplied", ""], ["env_material", "Environmental Material - Primary", "User supplied", ""], ["material_secondary", "Environmental Material - Secondary", "User supplied", ""], ["", "Enter depth values in one or more categories", "", ""], ["depth_subseafloor", "Depth below seafloor", "User supplied", "mbsf"], ["depth_subterrestrial", "Depth below terrestrial surface", "User supplied", "meter"], ["tot_depth_water_col", "Water column depth", "User supplied", "meter"], ["elevation", "Elevation (if terrestrial)", "User supplied", "meter"], ["dna_extraction_meth", "DNA Extraction", "User supplied", ""], ["dna_quantitation", "DNA Quantitation", "User supplied", ""], ["", "Enter either volume or mass", "", ""], ["sample_size_vol", "Sample Size (volume)", "User supplied", "liter"], ["sample_size_mass", "Sample Size (mass)", "User supplied", "gram"], ["sample_collection_device", "Sample collection device", "User supplied", ""], ["formation_name", "Formation name", "User supplied", ""], ["", "Sample handling", "", ""], ["samp_store_dur", "Storage duration", "User supplied", "days"], ["samp_store_temp", "Storage temperature", "User supplied", "degrees celsius"], ["isol_growth_cond", "Isolation and growth condition (reference)", "User supplied", "PMID, DOI or URL"], ["", "Non-biological", "", ""], ["ph", "pH", "User supplied", ""], ["temperature", "Temperature", "User supplied", "degrees celsius"], ["conductivity", "Conductivity", "User supplied", "mS/cm"], ["resistivity", "Resistivity", "", "ohm-meter"], ["salinity", "Salinity", "", "PSU"], ["pressure", "Pressure", "", "bar"], ["redox_state", "Redox state", "", ""], ["redox_potential", "Redox potential", "", "millivolt"], ["diss_oxygen", "Dissolved oxygen", "", "µmol/kg"], ["diss_hydrogen", "Dissolved hydrogen", "", "µmol/kg"], ["diss_org_carb", "Dissolved organic carbon", "", "µmol/kg"], ["diss_inorg_carb", "Dissolved inorganic carbon", "", "µmol/kg"], ["tot_org_carb", "Total organic carbon", "", "percent"], ["npoc", "Non-purgeable organic carbon", "", "µmol/kg"], ["tot_inorg_carb", "Total inorganic carbon", "", "percent"], ["tot_carb", "Total carbon", "", "percent"], ["carbonate", "Carbonate", "", "µmol/kg"], ["bicarbonate", "Bicarbonate", "", "µmol/kg"], ["silicate", "Silicate", "", "µmol/kg"], ["del180_water", "Delta 180 of water", "", "parts per mil"], ["part_org_carbon_del13c", "Delta 13C for particulate organic carbon", "", "parts per mil"], ["diss_inorg_carbon_del13c", "Delta 13C for dissolved inorganic carbon", "", "parts per mil"], ["methane_del13c", "Delta 13C for methane", "", "parts per mil"], ["alkalinity", "Alkalinity", "", "meq/L"], ["calcium", "Calcium", "", "µmol/kg"], ["sodium", "Sodium", "", "µmol/kg"], ["ammonium", "Ammonium", "", "µmol/kg"], ["nitrate", "Nitrate", "", "µmol/kg"], ["nitrite", "Nitrite", "", "µmol/kg"], ["nitrogen_tot", "Total nitrogen", "", "µmol/kg"], ["org_carb_nitro_ratio", "Carbon nitrogen ratio", "", ""], ["sulfate", "Sulfate", "", "µmol/kg"], ["sulfide", "Sulfide", "", "µmol/kg"], ["sulfur_tot", "Total sulfur", "", "µmol/kg"], ["chloride", "Chloride", "", "µmol/kg"], ["phosphate", "Phosphate", "", "µmol/kg"], ["potassium", "Potassium", "", "µmol/kg"], ["iron", "Total iron", "", "µmol/kg"], ["iron_ii", "Iron II", "", "µmol/kg"], ["iron_iii", "Iron III", "", "µmol/kg"], ["magnesium", "Magnesium", "", "µmol/kg"], ["manganese", "Manganese", "", "µmol/kg"], ["methane", "Methane", "", "µmol/kg"], ["noble_gas_chemistry", "Noble gas chemistry", "", ""], ["trace_element_geochem", "Trace element geochemistry", "", ""], ["porosity", "Porosity", "", "percent"], ["rock_age", "Sediment or rock age", "", "millions of years (Ma)"], ["water_age", "Water age", "", "thousands of years (ka)"], ["", "Biological", "", ""], ["microbial_biomass_microscopic", "Microbial biomass - total cell counts", "", "cells/g"], ["n_acid_for_cell_cnt", "NA dyes used for total cell counts", "", ""], ["microbial_biomass_fish", "FISH-based cell counts", "", "cells/g"], ["fish_probe_name", "Name of FISH probe", "", ""], ["fish_probe_seq", "Sequence of FISH probe", "", ""], ["intact_polar_lipid", "Intact polar lipid", "", "pg/g"], ["microbial_biomass_qpcr", "qPCR and primers used", "", "gene copies"], ["biomass_wet_weight", "Biomass - wet weight", "", "gram"], ["biomass_dry_weight", "Biomass - dry weight", "", "gram"], ["plate_counts", "Plate counts - colony forming", "", "CFU/ml"], ["functional_gene_assays", "functional gene assays", "", ""], ["clone_library_results", "clone library results", "", ""], ["enzyme_activities", "enzyme activities", "", ""], ["", "User-added", "", ""], ["geo_loc_name", "geo_loc_name", "", ""]];

      var all_metadata = create_all_metadata_form_new(rows, req, res, all_field_names);
      // all_metadata = { '485':
      //     { project: [ 'MS_AAA_EHSSU', 'MS_AAA_EHSSU', 'MS_AAA_EHSSU' ],
      //       dataset: ["", "", ""],
      //       sample_name: ["", "", ""],
      //       investigation_type: ["", "", ""],
      //       sample_type: ["", "", ""],
      //       collection_date: ["", "", ""],
      //       latitude: ["", "", ""],
      //       longitude: ["", "", ""],
      //       geo_loc_name_continental: ["", "", ""],
      //       geo_loc_name_marine: ["", "", ""],
      //       env_package: ["", "", ""],
      //       env_biome: ["", "", ""],
      //       env_feature: ["", "", ""],
      //       env_material: ["", "", ""],
      //       elevation: ["", "", ""],
      //       dna_extraction_meth: ["", "", ""],
      //       dna_quantitation: ["", "", ""],
      //       domain: ["", "", ""],
      //       target_gene: ["", "", ""],
      //       dna_region: ["", "", ""],
      //       sequencing_meth: ["", "", ""],
      //       forward_primer: ["", "", ""],
      //       reverse_primer: ["", "", ""],
      //       illumina_index: ["", "", ""],
      //       adapter_sequence: ["", "", ""],
      //       run: ["", "", ""],
      //       ph: ["", "", ""],
      //       temperature: ["", "", ""],
      //       conductivity: ["", "", ""],
      //       geo_loc_name: ["", "", ""],
      //       sequencing_platform: ["", "", ""],
      //       primer_suite: ["", "", ""],
      //       first_name: [ 'Mohammadkarim', 'Mohammadkarim', 'Mohammadkarim' ],
      //       institution:
      //         [ 'University of Duisburg-Essen',
      //           'University of Duisburg-Essen',
      //           'University of Duisburg-Essen' ],
      //       last_name: [ 'Saeedghalati', 'Saeedghalati', 'Saeedghalati' ],
      //       pi_email:
      //         [ 'm.saeedghalati@uni-due.de',
      //           'm.saeedghalati@uni-due.de',
      //           'm.saeedghalati@uni-due.de' ],
      //       pi_name:
      //         [ 'Mohammadkarim Saeedghalati',
      //           'Mohammadkarim Saeedghalati',
      //           'Mohammadkarim Saeedghalati' ],
      //       project_title: [ 'AAA title', 'AAA title', 'AAA title' ],
      //       public: [ 0, 0, 0 ],
      //       username: [ 'saeedghalati', 'saeedghalati', 'saeedghalati' ],
      //       project_abstract: [ '', '', '' ],
      //       adapter_sequence_id: ["", "", ""],
      //       dataset_description: ["", "", ""],
      //       dataset_id: ["", "", ""],
      //       dna_region_id: ["", "", ""],
      //       domain_id: ["", "", ""],
      //       env_biome_id: ["", "", ""],
      //       env_feature_id: ["", "", ""],
      //       env_material_id: ["", "", ""],
      //       env_package_id: ["", "", ""],
      //       geo_loc_name_id: ["", "", ""],
      //       illumina_index_id: ["", "", ""],
      //       primer_suite_id: ["", "", ""],
      //       run_id: ["", "", ""],
      //       sequencing_platform_id: ["", "", ""],
      //       target_gene_id: ["", "", ""]
      //     } };
      module.exports.render_edit_form(req, res, all_metadata, all_field_names);
    }
  });
};

exports.make_metadata_object = function (req, res, pid, info) {
  console.time("TIME: make_metadata_object");

  var all_metadata = {};
  var dataset_ids  = DATASET_IDS_BY_PID[pid];
  var project      = PROJECT_INFORMATION_BY_PID[pid].project;
  var repeat_times = dataset_ids.length;

  // console.log("LLL ALL_DATASETS", ALL_DATASETS);

  // 0) get field_names
  //TODO: DRY and clean up
  // var all_field_names = CONSTS.METADATA_FORM_REQUIRED_FIELDS.concat(get_field_names_by_dataset_ids(dataset_ids));
  // all_field_names     = all_field_names.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
  // all_field_names     = all_field_names.concat(CONSTS.PROJECT_INFO_FIELDS);
  // all_field_names     = helpers.unique_array(all_field_names);
  var all_field_names = collect_field_names(dataset_ids);

  console.log("HHH3 all_field_names");
  console.log(JSON.stringify(all_field_names));


  // console.log("QQQ0 AllMetadataNames");
  // console.log(JSON.stringify(AllMetadataNames));
  //
  // console.log("QQQ1 all_field_names");
  // console.log(JSON.stringify(all_field_names));


  // 1)
  // TODO: don't send all_metadata?
  all_metadata = prepare_empty_metadata_object(pid, all_field_names, all_metadata);
  // console.log("MMM2 all_metadata");
  // console.log(all_metadata);

  //2) all
  console.log("HHH info object in make_metadata_object");
  console.log(JSON.stringify(info));

  all_metadata[pid] = info;

  //3) special

  // TODO: move to db creation?
  var project_info = get_project_info(pid);
  console.log("MMM33 all_metadata[pid]");
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

  if ((all_metadata[pid]["project_abstract"] === 'undefined') || (!all_metadata[pid].hasOwnProperty(["project_abstract"]))) {
    all_metadata[pid]["project_abstract"] = module.exports.fill_out_arr_doubles("", repeat_times);
  }
  else {

    if ((all_metadata[pid]["project_abstract"][0] !== 'undefined') && (!Array.isArray(all_metadata[pid]["project_abstract"][0]))) {

      var project_abstract_correct_form = helpers.unique_array(all_metadata[pid]["project_abstract"]);

      if (typeof project_abstract_correct_form[0] !== 'undefined') {

        all_metadata[pid]["project_abstract"] = module.exports.fill_out_arr_doubles(project_abstract_correct_form[0].split(","), repeat_times);

      }
    }
  }

  // console.log("MMM9 all_metadata[pid][\"reference\"]");
  // console.log(JSON.stringify(all_metadata[pid]["reference"]));

  console.log("MMM9 all_metadata[pid]");
  console.log(JSON.stringify(all_metadata[pid]));

  console.timeEnd("TIME: make_metadata_object");
  return all_metadata;
};

exports.render_edit_form = function (req, res, all_metadata, all_field_names) {
  console.log("JJJ1 all_metadata");
  console.log(JSON.stringify(all_metadata));

  console.log("JJJ2 all_field_names");
  console.log(JSON.stringify(all_field_names));

  MD_ENV_CNTRY_vals           = get_object_vals(MD_ENV_CNTRY);
  MD_ENV_LZC_vals             = get_object_vals(MD_ENV_LZC);
  var ordered_field_names_obj = make_ordered_field_names_obj();

  res.render("metadata/metadata_edit_form", {
    title: "VAMPS: Metadata_upload",
    user: req.user,
    hostname: req.CONFIG.hostname,
    all_metadata: all_metadata,
    all_field_names: all_field_names,
    ordered_field_names_obj: ordered_field_names_obj,
    all_field_units: MD_CUSTOM_UNITS[req.body.project_id],
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
};
