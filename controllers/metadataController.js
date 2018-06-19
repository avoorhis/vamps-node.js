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

get_names_from_ordered_const = function() {
  console.time("time: ordered_metadata_names_only");

  const arraycolumn = (arr, n) => arr.map(x => x[n]);

  // var ordered_metadata_names_only = consts.metadata_form_required_fields.concat(arraycolumn(consts.ordered_metadata_names, 0));

  console.timeEnd("time: ordered_metadata_names_only");
  return arraycolumn(CONSTS.ORDERED_METADATA_NAMES, 0);
};

get_field_names = function(dataset_ids) {
  var field_names_arr = [];
  // field_names_arr = field_names_arr.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
  // field_names_arr = field_names_arr.concat(CONSTS.PROJECT_INFO_FIELDS);

  for (var i = 0; i < dataset_ids.length; i++) {
    var dataset_id = dataset_ids[i];

    field_names_arr = field_names_arr.concat(Object.keys(AllMetadata[dataset_id]));

    field_names_arr = helpers.unique_array(field_names_arr);
    field_names_arr.sort();
  }

  // console.log("MMM0 AllMetadataNames");
  // console.log(JSON.stringify(AllMetadataNames));
  //
  // console.log("MMM1 field_names_arr");
  // console.log(JSON.stringify(field_names_arr));

  return field_names_arr;
};

prepare_empty_metadata_object = function(pid, field_names_arr, all_metadata) {
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

filterItems = function(arr, query) {
  return arr.filter(function (el) {
    return el.toLowerCase().indexOf(query.toLowerCase()) < 0;
  });
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


exports.get_all_req_metadata = function(dataset_id) {
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

exports.make_all_field_names = function(dataset_ids) {
  var ordered_metadata_names_only = get_names_from_ordered_const();

  var structured_field_names0 = get_field_names(dataset_ids);
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

exports.fill_out_arr_doubles = function(value, repeat_times) {
  var arr_temp = Array(repeat_times);

  arr_temp.fill(value, 0, repeat_times);

  return arr_temp;
};

exports.from_obj_to_obj_of_arr = function(data, pid) {
  console.time("TIME: from_obj_to_obj_of_arr");
  var obj_of_arr = {};

  var dataset_ids = DATASET_IDS_BY_PID[pid];

  // var all_field_names = helpers.unique_array(CONSTS.METADATA_FORM_REQUIRED_FIELDS.concat(get_field_names(dataset_ids)));
  //TODO: make field_names collection a separate function
  var all_field_names = CONSTS.METADATA_FORM_REQUIRED_FIELDS.concat(get_field_names(dataset_ids));
  all_field_names     = all_field_names.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
  all_field_names     = all_field_names.concat(CONSTS.PROJECT_INFO_FIELDS);
  all_field_names     = all_field_names.concat(CONSTS.METADATA_NAMES_ADD);

  all_field_names = helpers.unique_array(all_field_names);

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

exports.make_ordered_field_names_obj = function() {
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
}

exports.make_metadata_object = function(req, res, pid, info) {
  console.time("TIME: make_metadata_object");

  var all_metadata = {};
  var dataset_ids  = DATASET_IDS_BY_PID[pid];
  var project      = PROJECT_INFORMATION_BY_PID[pid].project;
  var repeat_times = dataset_ids.length;

  // 0) get field_names
  //TODO: DRY
  var all_field_names = CONSTS.METADATA_FORM_REQUIRED_FIELDS.concat(get_field_names(dataset_ids));
  all_field_names     = all_field_names.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
  all_field_names     = all_field_names.concat(CONSTS.PROJECT_INFO_FIELDS);
  all_field_names     = helpers.unique_array(all_field_names);

  // console.log("HHH3 all_field_names");
  // console.log(JSON.stringify(all_field_names));


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
  // console.log("HHH info object in make_metadata_object");
  // console.log(JSON.stringify(info));

  all_metadata[pid] = info;

  //3) special

  // TODO: move to db creation?
  var project_info = get_project_info(pid);
  // console.log("MMM33 all_metadata[pid]");
  // console.log(JSON.stringify(all_metadata[pid]));

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


  console.timeEnd("TIME: make_metadata_object");
  return all_metadata;
};
