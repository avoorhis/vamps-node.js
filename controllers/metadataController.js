// var Metadata = require(app_root + '/models/metadata');
// var helpers  = require(app_root + '/routes/helpers/helpers');
var CONSTS = require(app_root + "/public/constants");

// Display list of all Submissions.
// exports.submission_list = function (req, res) {
//   res.send('NOT IMPLEMENTED: Submission list');
// };

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