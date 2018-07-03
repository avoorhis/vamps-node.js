var Project   = require(app_root + '/models/project_model');
var Dataset   = require(app_root + '/models/dataset_model');
var User      = require(app_root + '/models/user_model');
var helpers   = require(app_root + '/routes/helpers/helpers');
var CONSTS    = require(app_root + "/public/constants");
var validator = require('validator');
var config    = require(app_root + '/config/config');
var fs        = require("fs");
var path      = require("path");

// 1 create data from
// 1.1  db
// 1.2  form
// 1.3  file

// 2 saved data to
// 2.1  db
// 2.2  form
// 2.3  file

// 3 show data

// http://book.mixu.net/node/ch6.html
// CLASS ShowObj()
function ShowObj() {
  // needed:
  // project_id (for all_field_units, all_metadata, globals: PROJECT_INFORMATION_BY..., DATASET_IDS_BY_PID)
  // dataset_ids (for show, for global: DATASET_IDS_BY_PID[pid];
  // req.user
  // req.CONFIG.hostname
  // all_field_names with units etc.: [["structured comment name","Parameter","",""],["","New submit info","",""]
  // all_metadata with arrays as big as there are datasets: {"495":{"dna_region":["v4","v4"],"domain":["Bacteria","Bacteria"]
  // ordered_field_names_obj
  // MD_CUSTOM_UNITS[project_id] (all_field_units)
  // -- in all_metadata --
  // all_metadata[pid]
  // all_metadata[pid]["dataset"]
  // all_metadata[pid]["dataset_id"]

  InObj.prototype.render_edit_form = function() {
  res.render("metadata/metadata_edit_form", {
    title: "VAMPS: Metadata_upload",
    user: req.user,
    hostname: req.CONFIG.hostname,
    all_metadata: all_metadata,
    all_field_names: all_field_names,
    ordered_field_names_obj: ordered_field_names_obj,
    all_field_units: all_field_units,
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

// export the class
  module.exports = ShowObj;


}



//exports.render_edit_form = function (req, res, all_metadata, all_field_names) {
//   console.log("JJJ1 all_metadata from render_edit_form");
//   console.log(JSON.stringify(all_metadata));
//
//   console.log("JJJ2 all_field_names from render_edit_form");
//   console.log(JSON.stringify(all_field_names));
//
//   MD_ENV_CNTRY_vals           = get_object_vals(MD_ENV_CNTRY);
//   MD_ENV_LZC_vals             = get_object_vals(MD_ENV_LZC);
//   var ordered_field_names_obj = make_ordered_field_names_obj();
//
//   res.render("metadata/metadata_edit_form", {
//     title: "VAMPS: Metadata_upload",
//     user: req.user,
//     hostname: req.CONFIG.hostname,
//     all_metadata: all_metadata,
//     all_field_names: all_field_names,
//     ordered_field_names_obj: ordered_field_names_obj,
//     all_field_units: MD_CUSTOM_UNITS[req.body.project_id],
//     dividers: CONSTS.ORDERED_METADATA_DIVIDERS,
//     dna_extraction_options: CONSTS.MY_DNA_EXTRACTION_METH_OPTIONS,
//     dna_quantitation_options: CONSTS.DNA_QUANTITATION_OPTIONS,
//     biome_primary_options: CONSTS.BIOME_PRIMARY,
//     feature_primary_options: CONSTS.FEATURE_PRIMARY,
//     material_primary_options: CONSTS.MATERIAL_PRIMARY,
//     metadata_form_required_fields: CONSTS.METADATA_FORM_REQUIRED_FIELDS,
//     env_package_options: CONSTS.DCO_ENVIRONMENTAL_PACKAGES,
//     investigation_type_options: CONSTS.INVESTIGATION_TYPE,
//     sample_type_options: CONSTS.SAMPLE_TYPE
//   });
// };