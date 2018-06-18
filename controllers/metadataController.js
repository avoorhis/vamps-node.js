// var Metadata = require(app_root + '/models/metadata');
// var helpers  = require(app_root + '/routes/helpers/helpers');
var CONSTS = require(app_root + "/public/constants");

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

check_regexp = function(reg_exp, value, err_msg) {
  var result = value.match(reg_exp);

  // if (value !== "" && result === null) {
  if (value !== "" && result !== null) {
    throw new Error("'" + value + "' is not allowed in '%s'" + err_msg);
  }
};

region_valid = function(value, region_low, region_high) {
  if ((value !== '') && (parseInt(value) < parseInt(region_low) || parseInt(value) > parseInt(region_high))) {
    throw new Error("'" + value + "' is not valid, %s should be between " + region_low + " and " + region_high);
  }
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

exports.numbers_n_period = function(value) {
  // var regex = /^[0-9.]+$/;
  //[^0-9.] faster
  var reg_exp = /[^0-9.]/;
  var err_msg = ", please use only numbers and periods.";
  check_regexp(reg_exp, value, err_msg);
};

exports.numbers_n_period_n_minus = function(value) {
  // var regex = /^[0-9.]+$/;
  //[^0-9.] faster
  var reg_exp = /[^0-9.-]/;
  var err_msg = ", please use only numbers, periods and minus.";
  check_regexp(reg_exp, value, err_msg);
};

exports.longitude_valid = function(value) {
  region_valid(value, -180, 180);
};

exports.latitude_valid = function(value) {
  region_valid(value, -90, 90);
};

exports.ph_valid = function(value) {
  region_valid(value, 0, 14);
};

exports.percent_valid = function(value) {
  region_valid(value, 0, 100);
};

exports.positive = function(value) {
  if (value !== '' && parseInt(value) < 0) {
    throw new Error("'" + value + "' is not valid, %s should be greater then 0.");
  }
}