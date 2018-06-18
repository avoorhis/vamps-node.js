var express             = require("express");
var router              = express.Router();
var helpers             = require("./helpers/helpers");
var form                = require("express-form");
var queries             = require(app_root + "/routes/queries");
var CONSTS              = require(app_root + "/public/constants");
var fs                  = require("fs");
var path                = require("path");
var config              = require(app_root + '/config/config');
// var validator           = require('validator');
// var expressValidator = require('express-validator');
var nodeMailer          = require('nodemailer');
var Metadata            = require(app_root + '/models/metadata');
var metadata_controller = require(app_root + '/controllers/metadataController');

/* GET metadata page. */
router.get('/metadata', function (req, res) {
  console.log('in metadata');
  res.render('metadata/metadata', {
    title: 'VAMPS:Metadata',
    user: req.user,
    hostname: req.CONFIG.hostname
  });
});

router.get('/metadata_list', helpers.isLoggedIn, function (req, res) {
  console.log('in metadata');
  var mdata_w_latlon = {};
  console.log(DatasetsWithLatLong);
  //console.log(DatasetsWithLatLong)  // json
  //console.log(AllMetadataNames)  // list (req w _ids)
  for (var n in AllMetadataNames) {
    md_selected                 = AllMetadataNames[n];
    mdata_w_latlon[md_selected] = 0;

    //console.log(md_selected)
    for (var did in DatasetsWithLatLong) {
      //console.log(AllMetadata[did])
      //if(AllMetadata.hasOwnProperty(did)){
      //console.log('found1',did)
      //var mdata = helpers.required_metadata_names_from_ids(AllMetadata[did], md_selected)
      mdata = AllMetadata[did];   // has ids

      pid   = PROJECT_ID_BY_DID[did];
      //console.log('pid',pid)
      pname = PROJECT_INFORMATION_BY_PID[pid].project;

      if (mdata.hasOwnProperty(md_selected)) {
        mdata_w_latlon[md_selected] = 1;
      }
    }
  }
  //console.log(mdata_w_latlon)
  res.render("metadata/metadata_list", {
    title: "VAMPS:Metadata List",
    user: req.user, hostname: req.CONFIG.hostname,
    metadata: AllMetadataNames,
    req_mdata_names: JSON.stringify(req.CONSTS.REQ_METADATA_FIELDS_wIDs),
    mdata_latlon: JSON.stringify(mdata_w_latlon),
    names_by_did: JSON.stringify(DATASET_NAME_BY_DID),
    pid_by_did: JSON.stringify(PROJECT_ID_BY_DID),
    pinfo_by_pid: JSON.stringify(PROJECT_INFORMATION_BY_PID)
  });
});

router.get('/list_result/:mditem', helpers.isLoggedIn, function (req, res) {
  console.log('in metadatalist result');
  var md_selected = req.params.mditem;
  console.log(md_selected);
  var mdvalues = {};
  for (var did in DATASET_NAME_BY_DID) {
    if (did in AllMetadata) {
      if (req.CONSTS.REQ_METADATA_FIELDS_wIDs.indexOf(md_selected.slice(0, md_selected.length - 3)) !== -1) {
        var data         = helpers.required_metadata_names_from_ids(AllMetadata[did], md_selected);  // send _id
        mdvalues[did]    = data.value;
        md_selected_show = data.name;
      } else if (AllMetadata[did].hasOwnProperty(md_selected)) {
        mdvalues[did]    = AllMetadata[did][md_selected];
        md_selected_show = md_selected;

      }
    }
  }
  res.render('metadata/list_result', {
    title: 'VAMPS:Metadata List Result',
    user: req.user, hostname: req.CONFIG.hostname,
    vals: JSON.stringify(mdvalues),
    names_by_did: JSON.stringify(DATASET_NAME_BY_DID),
    pid_by_did: JSON.stringify(PROJECT_ID_BY_DID),
    pinfo_by_pid: JSON.stringify(PROJECT_INFORMATION_BY_PID),
    item: md_selected_show
  });
});

router.get('/geomap/:item', helpers.isLoggedIn, function (req, res) {
  console.log('in metadata - geomap');
  var md_item = req.params.item;
  if (req.CONSTS.REQ_METADATA_FIELDS_wIDs.indexOf(md_item.slice(0, md_item.length - 3)) !== -1) {
    md_item_show = md_item.slice(0, md_item.length - 3);
  } else {
    md_item_show = md_item;
  }
  var metadata_info = get_metadata_hash(md_item);  // fxn: see below
  //console.log('metadata_info')
  res.render('metadata/geomap', {
    title: 'VAMPS:Metadata Distribution',
    user: req.user, hostname: req.CONFIG.hostname,
    md_item: md_item_show,
    mdinfo: JSON.stringify(metadata_info),
    gekey: req.CONFIG.GOOGLE_EARTH_KEY,
  });
});

module.exports = router;

//////////////////////////////
function get_metadata_hash(md_selected) {
  var md_info      = {};
  //md_info[md_item] = {}
  md_info.metadata = {};
  var got_lat, got_lon;
  //console.log('PROJECT_ID_BY_DID.length')
  //console.log(PROJECT_ID_BY_DID)
  //console.log(Object.keys(PROJECT_ID_BY_DID).length)
  for (var did in PROJECT_ID_BY_DID) {

    if (AllMetadata.hasOwnProperty(did)) {
      //console.log('found1',did)
      var mdata = AllMetadata[did];
      var pid   = PROJECT_ID_BY_DID[did];
      //console.log('pid',pid)
      pname     = PROJECT_INFORMATION_BY_PID[pid].project;
      if (mdata.hasOwnProperty(md_selected) && mdata.hasOwnProperty('latitude') && mdata.hasOwnProperty('longitude')) {
        if (mdata['latitude'] !== 'None' && mdata['longitude'] !== 'None') {
          //console.log('found2',md_selected)
          var pjds                         = pname + '--' + DATASET_NAME_BY_DID[did];
          md_info.metadata[pjds]           = {};
          md_info.metadata[pjds].pid       = pid;
          md_info.metadata[pjds].did       = did;
          var data                         = helpers.required_metadata_names_from_ids(mdata, md_selected);
          md_info.metadata[pjds].value     = data.value;
          //md_info.metadata[pjds].value = mdata[md_selected]
          md_info.metadata[pjds].latitude  = mdata['latitude'];
          md_info.metadata[pjds].longitude = mdata['longitude'];
        }

      }
    } else {
      //console.log('did '+did+' not found in PROJECT_ID_BY_DID')
    }

  }

  return md_info;

}

// ---- metadata_upload ----
// AllMetadata = helpers.get_metadata_from_file()


// function findByValueOfObject(arr, key, value) {
//   return arr.filter(function(item) {
//     return (item[key] === value);
//   });
// }


// http://stackoverflow.com/questions/10706588/how-do-i-repopulate-form-fields-after-validation-errors-with-express-form


// function NewMetadata(req, res, id){ /* fetch or create logic, storing as req.model or req.metadata */}


// function loadMetadata(req, res, id){ /* fetch or create logic, storing as req.model or req.metadata */}

// function editMetadataFromFile(req, res){ /* render logic */ }

/*
  TOC:
  render new form
  render edit form
  create form from db
  create form from req.form
  create form from a csv file
  from form to a csv file
  from form to req form
  save from a csv file to db
  save from form to db ??
  if csv files: show a list and compare
  common functions
*/

// render new form
// ?? render_edit_form(req, res, {}, {}, all_field_names)

// render edit form
router.post('/metadata_edit_form',
  [helpers.isLoggedIn],
  function (req, res) {

    console.time("TIME: 1) in post /metadata_edit_form");
    make_metadata_object_from_db(req, res);
    console.timeEnd("TIME: 1) in post /metadata_edit_form");
  });

function render_edit_form(req, res, all_metadata, all_field_names) {
  // console.log("JJJ1 all_metadata");
  // console.log(JSON.stringify(all_metadata));
  //
  // console.log("JJJ2 all_field_names");
  // console.log(JSON.stringify(all_field_names));

  MD_ENV_CNTRY_vals           = metadata_controller.get_object_vals(MD_ENV_CNTRY);
  MD_ENV_LZC_vals             = metadata_controller.get_object_vals(MD_ENV_LZC);
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
}


// create form from req.form
// TODO: update field names from https://docs.google.com/spreadsheets/d/1adAtGc9DdY2QBQZfd1oaRdWBzjOv4t-PF1hBfO8mAoA/edit#gid=1223926458
router.post('/metadata_upload',
  [helpers.isLoggedIn],
  form(
    form.field("npoc", metadata_controller.get_second("npoc")).trim().entityEncode().array(),
    form.field("access_point_type", metadata_controller.get_second("access_point_type")).trim().entityEncode().array(),
    form.field("adapter_sequence", metadata_controller.get_second("adapter_sequence")).trim().required().entityEncode().array(),
    form.field("alkalinity", metadata_controller.get_second("alkalinity")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("ammonium", metadata_controller.get_second("ammonium")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("bicarbonate", metadata_controller.get_second("bicarbonate")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("env_biome", metadata_controller.get_second("env_biome")).trim().required().custom(metadata_controller.env_items_validation).entityEncode().array(),
    form.field("biome_secondary", metadata_controller.get_second("biome_secondary")).trim().entityEncode().array(),
    form.field("calcium", metadata_controller.get_second("calcium")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("carbonate", metadata_controller.get_second("carbonate")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("chloride", metadata_controller.get_second("chloride")).trim().entityEncode().array(),
    form.field("clone_library_results", metadata_controller.get_second("clone_library_results")).trim().entityEncode().array(),
    form.field("collection_date", metadata_controller.get_second("collection_date")).trim().required().isDate("Sample collection date format: YYYY-MM-DD").entityEncode().array(),
    form.field("conductivity", metadata_controller.get_second("conductivity")).trim().custom(metadata_controller.numbers_n_period).required().entityEncode().array(),
    form.field("dataset", metadata_controller.get_second("dataset")).trim().required().entityEncode().array(),
    form.field("dataset_id", "").trim().required().isInt().entityEncode().array(),
    // form.field("del180_water", metadata_controller.get_second("del180_water")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),
    form.field("del180_water", metadata_controller.get_second("del180_water")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),

    form.field("depth_in_core", metadata_controller.get_second("depth_in_core")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("depth_subseafloor", metadata_controller.get_second("depth_subseafloor")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("depth_subterrestrial", metadata_controller.get_second("depth_subterrestrial")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("diss_hydrogen", metadata_controller.get_second("diss_hydrogen")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("diss_inorg_carb", metadata_controller.get_second("diss_inorg_carb")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),
    form.field("diss_inorg_carbon_del13c", metadata_controller.get_second("diss_inorg_carbon_del13c")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),
    form.field("diss_org_carb", metadata_controller.get_second("diss_org_carb")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("diss_oxygen", metadata_controller.get_second("diss_oxygen")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("dna_extraction_meth", metadata_controller.get_second("dna_extraction_meth")).trim().required().custom(metadata_controller.env_items_validation).entityEncode().array(),
    form.field("dna_quantitation", metadata_controller.get_second("dna_quantitation")).trim().required().custom(metadata_controller.env_items_validation).entityEncode().array(),
    form.field("dna_region", metadata_controller.get_second("dna_region")).trim().required().entityEncode().array(),
    form.field("domain", metadata_controller.get_second("domain")).trim().required().entityEncode().array(),
    form.field("elevation", metadata_controller.get_second("elevation")).trim().required("", "Elevation is required (for terrestrial only)").custom(metadata_controller.numbers_n_period_n_minus).entityEncode().array(),
    form.field("env_package", metadata_controller.get_second("env_package")).trim().required().custom(metadata_controller.env_items_validation).entityEncode().array(),
    form.field("enzyme_activities", metadata_controller.get_second("enzyme_activities")).trim().entityEncode().array(),
    form.field("env_feature", metadata_controller.get_second("env_feature")).trim().required().custom(metadata_controller.env_items_validation).entityEncode().array(),
    form.field("fish_probe_name", metadata_controller.get_second("fish_probe_name")).trim().entityEncode().array(),
    form.field("fish_probe_seq", metadata_controller.get_second("fish_probe_seq")).trim().is(/^$|[ATUGCYRSWKMBDHVN]/).entityEncode().array(),
    form.field("feature_secondary", metadata_controller.get_second("feature_secondary")).trim().entityEncode().array(),
    form.field("formation_name", metadata_controller.get_second("formation_name")).trim().entityEncode().array(),
    form.field("forward_primer", metadata_controller.get_second("forward_primer")).trim().entityEncode().array(),
    form.field("functional_gene_assays", metadata_controller.get_second("functional_gene_assays")).trim().entityEncode().array(),
    form.field("geo_loc_name_continental", metadata_controller.get_second("geo_loc_name_continental")).trim().custom(metadata_controller.geo_loc_name_continental_filter).custom(metadata_controller.geo_loc_name_validation).custom(metadata_controller.geo_loc_name_continental_validation).entityEncode().array(),
    form.field("geo_loc_name_marine", metadata_controller.get_second("geo_loc_name_marine")).trim().custom(metadata_controller.geo_loc_name_validation).custom(metadata_controller.geo_loc_name_marine_validation).entityEncode().array(),
    form.field("illumina_index", metadata_controller.get_second("illumina_index")).trim().entityEncode().array(),
    // Index sequence (required for Illumina)
    form.field("intact_polar_lipid", metadata_controller.get_second("intact_polar_lipid")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("investigation_type", metadata_controller.get_second("investigation_type")).trim().required().entityEncode().array(),
    form.field("iron", metadata_controller.get_second("iron")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("iron_ii", metadata_controller.get_second("iron_ii")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("iron_iii", metadata_controller.get_second("iron_iii")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("isol_growth_cond", metadata_controller.get_second("isol_growth_cond")).trim().entityEncode().array(),
    // form.field("latitude", metadata_controller.get_second("latitude")).trim().custom(metadata_controller.latitude_valid).is(/^$|^[0-9.-]+$/).required().entityEncode().array(),
    //, see <a href='https://www.latlong.net/degrees-minutes-seconds-to-decimal-degrees' target='_blank'>a converter</a>
    form.field("latitude", metadata_controller.get_second("latitude")).trim().custom(metadata_controller.latitude_valid).is(/^$|^[0-9.-]+$/, "%s should be in decimal degrees (numbers only). Please see the Tutorial for help").required().entityEncode().array(),
    form.field("longitude", metadata_controller.get_second("longitude")).trim().custom(metadata_controller.longitude_valid).is(/^$|^[0-9.-]+$/, "%s should be in decimal degrees (numbers only). Please see the Tutorial for help").required().entityEncode().array(),
    form.field("magnesium", metadata_controller.get_second("magnesium")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("manganese", metadata_controller.get_second("manganese")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("env_material", metadata_controller.get_second("env_material")).trim().required().custom(metadata_controller.env_items_validation).entityEncode().array(),
    form.field("material_secondary", metadata_controller.get_second("material_secondary")).trim().entityEncode().array(),
    form.field("methane", metadata_controller.get_second("methane")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("methane_del13c", metadata_controller.get_second("methane_del13c")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),
    form.field("microbial_biomass_fish", metadata_controller.get_second("microbial_biomass_fish")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    // form.field("microbial_biomass_avg_cell_number", metadata_controller.get_second("microbial_biomass_avg_cell_number")).trim().entityEncode().array(),
    // form.field("microbial_biomass_intactpolarlipid", metadata_controller.get_second("microbial_biomass_intactpolarlipid")).trim().entityEncode().array(),
    form.field("microbial_biomass_microscopic", metadata_controller.get_second("microbial_biomass_microscopic")).trim().entityEncode().array(),
    // form.field("microbial_biomass_platecounts", metadata_controller.get_second("microbial_biomass_platecounts")).trim().entityEncode().array(),
    form.field("microbial_biomass_qpcr", metadata_controller.get_second("microbial_biomass_qpcr")).trim().entityEncode().array(),
    form.field("nitrate", metadata_controller.get_second("nitrate")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("nitrite", metadata_controller.get_second("nitrite")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("nitrogen_tot", metadata_controller.get_second("nitrogen_tot")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("noble_gas_chemistry", metadata_controller.get_second("noble_gas_chemistry")).trim().entityEncode().array(),
    form.field("org_carb_nitro_ratio", metadata_controller.get_second("org_carb_nitro_ratio")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("ph", metadata_controller.get_second("ph")).trim().custom(metadata_controller.numbers_n_period).custom(metadata_controller.ph_valid).required().entityEncode().array(),
    form.field("part_org_carbon_del13c", metadata_controller.get_second("part_org_carbon_del13c")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),
    form.field("phosphate", metadata_controller.get_second("phosphate")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("pi_email", metadata_controller.get_second("pi_email")).trim().isEmail().required().entityEncode().array(),
    form.field("pi_name", metadata_controller.get_second("pi_name")).trim().required().is(/^[a-zA-Z- ]+$/).entityEncode().array(),
    form.field("plate_counts", metadata_controller.get_second("plate_counts")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("porosity", metadata_controller.get_second("porosity")).trim().custom(metadata_controller.numbers_n_period).custom(metadata_controller.percent_valid).entityEncode().array(),
    form.field("potassium", metadata_controller.get_second("potassium")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("pressure", metadata_controller.get_second("pressure")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("project", metadata_controller.get_second("project")).trim().required().entityEncode().array(),
    form.field("project_abstract", metadata_controller.get_second("project_abstract")).trim().required().entityEncode().array(),
    form.field("project_title", metadata_controller.get_second("project_title")).trim().required().is(/^[a-zA-Z0-9,_ -]+$/).entityEncode().array(),
    form.field("redox_potential", metadata_controller.get_second("redox_potential")).trim().custom(metadata_controller.numbers_n_period_n_minus).entityEncode().array(),
    form.field("redox_state", metadata_controller.get_second("redox_state")).trim().is(/^$|^[a-zA-Z ]+$/).entityEncode().array(),
    form.field("reference", metadata_controller.get_second("reference")).trim().entityEncode().array(),
    form.field("resistivity", metadata_controller.get_second("resistivity")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("reverse_primer", metadata_controller.get_second("reverse_primer")).trim().entityEncode().array(),
    form.field("rock_age", metadata_controller.get_second("rock_age")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("run", metadata_controller.get_second("run")).trim().required().entityEncode().array(),
    form.field("salinity", metadata_controller.get_second("salinity")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("sample_collection_device", metadata_controller.get_second("sample_collection_device")).trim().entityEncode().array(),
    form.field("samp_store_dur", metadata_controller.get_second("samp_store_dur")).trim().is(/^$|^[0-9a-zA-Z ]+$/).entityEncode().array(),
    form.field("samp_store_temp", metadata_controller.get_second("samp_store_temp")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),
    form.field("sample_name", metadata_controller.get_second("sample_name")).trim().required().entityEncode().array(),
    form.field("sample_size_mass", metadata_controller.get_second("sample_size_mass")).trim().custom(metadata_controller.positive).custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("sample_size_vol", metadata_controller.get_second("sample_size_vol")).trim().custom(metadata_controller.positive).custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("sample_type", metadata_controller.get_second("sample_type")).trim().required().custom(metadata_controller.env_items_validation).entityEncode().array(),
    form.field("sequencing_meth", metadata_controller.get_second("sequencing_meth")).trim().required().entityEncode().array(),
    form.field("silicate", metadata_controller.get_second("silicate")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("sodium", metadata_controller.get_second("sodium")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("sulfate", metadata_controller.get_second("sulfate")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("sulfide", metadata_controller.get_second("sulfide")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("sulfur_tot", metadata_controller.get_second("sulfur_tot")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("target_gene", metadata_controller.get_second("target_gene")).trim().required().entityEncode().array(),
    form.field("temperature", metadata_controller.get_second("temperature")).trim().is(/^$|^[0-9.-]+$/).required().entityEncode().array(),
    form.field("tot_carb", metadata_controller.get_second("tot_carb")).trim().custom(metadata_controller.numbers_n_period).custom(metadata_controller.percent_valid).entityEncode().array(),
    form.field("tot_depth_water_col", metadata_controller.get_second("tot_depth_water_col")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array(),
    form.field("tot_inorg_carb", metadata_controller.get_second("tot_inorg_carb")).trim().custom(metadata_controller.numbers_n_period).custom(metadata_controller.percent_valid).entityEncode().array(),
    form.field("tot_org_carb", metadata_controller.get_second("tot_org_carb")).trim().custom(metadata_controller.numbers_n_period).custom(metadata_controller.percent_valid).entityEncode().array(),
    form.field("trace_element_geochem", metadata_controller.get_second("trace_element_geochem")).trim().entityEncode().array(),
    form.field("water_age", metadata_controller.get_second("water_age")).trim().custom(metadata_controller.numbers_n_period).entityEncode().array()
  ),
  function (req, res) {
    console.time("TIME: post metadata_upload");
    if (!req.form.isValid) {
      console.log('in post /metadata_upload, !req.form.isValid');

      make_metadata_object_from_form(req, res);
      make_csv(req, res);

      if (req.body.done_editing === "done_editing") {
        send_mail_finished(req, res);
      }

      // done_editing: 'not_done_editing' }

    }
    else {
      console.log('in post /metadata_upload');
      saveMetadata(req, res);
      res.redirect("/user_data/your_projects");
    }
    console.timeEnd("TIME: post metadata_upload");
  });

function make_metadata_object_from_form(req, res) {
  console.time("TIME: make_metadata_object_from_form");
  var pid  = req.body.project_id;
  var data = req.form;

  // console.log("DDD9 req.form");
  // console.log(JSON.stringify(req.form));


  //add project_abstract etc.
  //TODO: DRY with other such places.

  var normal_length = data['dataset'].length;
  for (var a in data) {
    if (data[a].length < normal_length && (typeof data[a][0] !== 'undefined')) {
      data[a] = fill_out_arr_doubles(data[a][0], normal_length);
    }
  }

  var all_metadata         = make_metadata_object(req, res, pid, data);
  var all_field_names_orig = make_all_field_names(data['dataset_id']);

  //add_new
  var all_field_names_with_new = metadata_controller.collect_new_rows(req, all_field_names_orig);

  // console.log("YYY3 all_field_names_with_new");
  // console.log(JSON.stringify(all_field_names_with_new));

  var all_field_names_first_column = metadata_controller.get_first_column(all_field_names_with_new, 0);
  var all_new_names                = all_field_names_first_column.slice(all_field_names_first_column.indexOf("enzyme_activities") + 1);
  all_metadata[pid]                = metadata_controller.get_new_val(req, all_metadata[pid], all_new_names);

  //collect errors
  var myArray_fail = helpers.unique_array(req.form.errors);

  if (helpers.has_duplicates(req.form.sample_name)) {
    myArray_fail.push('Sample ID (user sample name) should be unique.');
  }

  myArray_fail.sort();
  req.flash("fail", myArray_fail);

  render_edit_form(req, res, all_metadata, all_field_names_with_new);

  console.timeEnd("TIME: make_metadata_object_from_form");
}

// create form from a csv file

function make_metadata_object_from_csv(req, res) {
  console.time("TIME: make_metadata_object_from_csv");

  // console.log("MMM req.body from make_metadata_object_from_csv");
  // console.log(req.body);

  var file_name    = req.body.edit_metadata_file;
  var project_name = metadata_controller.get_project_name(file_name);
  var pid          = PROJECT_INFORMATION_BY_PNAME[project_name]["pid"];


  // console.log("GGG1 project_name from metadata_controller.get_project_name");
  // console.log(project_name);
  //data from file
  var inputPath    = path.join(config.USER_FILES_BASE, req.user.username, file_name);
  var file_content = fs.readFileSync(inputPath);
  var parse_sync   = require('csv-parse/lib/sync');
  var data_arr     = parse_sync(file_content, {columns: true, trim: true});

  var data        = {};
  var dataset_ids = [];
  for (var dict_idx in data_arr) {
    var dataset_id   = data_arr[dict_idx]['dataset_id'];
    data[dataset_id] = data_arr[dict_idx];
    dataset_ids.push(dataset_id);
  }

  // console.log("MMM0 dataset_ids");
  // console.log(dataset_ids);

  var data_in_obj_of_arr = from_obj_to_obj_of_arr(data, pid);

  // all_metadata
  var all_metadata    = make_metadata_object(req, res, pid, data_in_obj_of_arr);
  var all_field_names = make_all_field_names(dataset_ids);

  // console.log("DDD3 all_field_names from make_metadata_object_from_csv");
  // console.log(JSON.stringify(all_field_names));
  //
  // console.log("DDD4 all_metadata from make_metadata_object_from_csv");
  // console.log(JSON.stringify(all_metadata));
  req.body.project_id = pid;
  render_edit_form(req, res, all_metadata, all_field_names);

  console.timeEnd("TIME: make_metadata_object_from_csv");
}

// create form from db

function get_all_req_metadata(dataset_id) {
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
}

function make_metadata_object_from_db(req, res) {
  console.time("TIME: make_metadata_object_from_db");
  var pid         = req.body.project_id;
  //repeated!
  var dataset_ids = DATASET_IDS_BY_PID[pid];
  var project     = PROJECT_INFORMATION_BY_PID[pid].project;

  // get_db_data
  console.time("TIME: metadata_controller.slice_object");
  var AllMetadata_picked = metadata_controller.slice_object(AllMetadata, dataset_ids);
  console.timeEnd("TIME: metadata_controller.slice_object");

  console.time("TIME: dataset_info");
  // get dataset_info

  var dataset_info;
  for (var i in ALL_DATASETS.projects) {
    var item = ALL_DATASETS.projects[i];
    if (String(item.pid) === String(pid)) {
      dataset_info = item.datasets;
      break;
    }
  }

  var dataset_info_by_did = {};
  for (var idx in dataset_info) {
    dataset_info_by_did[dataset_info[idx]["did"]] = dataset_info[idx];
  }
  console.timeEnd("TIME: dataset_info");

  // add missing info to AllMetadata_picked
  console.time("TIME: add missing info to AllMetadata_picked");
  for (var d in dataset_ids) {
    var dataset_id = dataset_ids[d];
    var ids_data   = get_all_req_metadata(dataset_id);

    Object.assign(AllMetadata_picked[dataset_id], ids_data);
    var primers_info_by_dataset_id = metadata_controller.get_primers_info(dataset_id);

    AllMetadata_picked[dataset_id]["forward_primer"] = primers_info_by_dataset_id['F'];
    AllMetadata_picked[dataset_id]["reverse_primer"] = primers_info_by_dataset_id['R'];

    AllMetadata_picked[dataset_id]["dataset"]             = dataset_info_by_did[dataset_id]["dname"];
    AllMetadata_picked[dataset_id]["dataset_description"] = dataset_info_by_did[dataset_id]["ddesc"];

    AllMetadata_picked[dataset_id]["dataset_id"] = dataset_id;
  }
  console.timeEnd("TIME: add missing info to AllMetadata_picked");

  var data_in_obj_of_arr = from_obj_to_obj_of_arr(AllMetadata_picked, pid);

  // add abstract_data
  var abstract_data = get_project_abstract_data(project, req.CONFIG.PATH_TO_STATIC_DOWNLOADS)[get_project_prefix(project)];
  if (typeof abstract_data === 'undefined') {
    abstract_data      = {};
    abstract_data.pdfs = [];
  }

  data_in_obj_of_arr["project_abstract"] = fill_out_arr_doubles(abstract_data.pdfs, dataset_ids.length);

  var all_metadata = make_metadata_object(req, res, pid, data_in_obj_of_arr);

  var all_field_names = make_all_field_names(dataset_ids);

  // console.log("DDD2 all_field_names");
  // console.log(JSON.stringify(all_field_names));
  // console.log("DDD2 all_metadata");
  // console.log(JSON.stringify(all_metadata));

  render_edit_form(req, res, all_metadata, all_field_names);

  console.timeEnd("TIME: make_metadata_object_from_db");
}

function make_all_field_names(dataset_ids) {
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

}

function filterItems(arr, query) {
  return arr.filter(function (el) {
    return el.toLowerCase().indexOf(query.toLowerCase()) < 0;
  });
}

function from_obj_to_obj_of_arr(data, pid) {
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
}

// from form to a csv file

function make_csv(req) {
  var out_csv_file_name;
  console.time("TIME: make_csv");

  // var csv = convertArrayOfObjectsToCSV({
  //   data: req.form,
  //   user_info: req.user
  // });

  var csv = convertArrayOfObjectsToCSV({
    data: req.form,
    user_info: req.user,
    project_id: req.body.project_id
  });

  time_stamp = new Date().getTime();

  var base_name     = "metadata-project" + '_' + req.body.project + '_' + req.user.username + '_' + time_stamp + ".csv";
  out_csv_file_name = path.join(config.USER_FILES_BASE, req.user.username, base_name);

  //TODO: more robust project!

  fs.writeFile(out_csv_file_name, csv, function (err) {
    if (err) throw err;
  });

  console.log('file ' + out_csv_file_name + ' saved');

  var msg = 'File ' + base_name + ' was saved, please notify the Site administration if you have finished editing.';
  req.flash("success", msg);

  console.timeEnd("TIME: make_csv");
}

function array_from_object(data) {
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
}

function transpose_2d_arr(data_arr, project_id) {
  console.time("TIME: transpose_2d_arr");

  //make an array with proper length, even if the first one is empty
  var matrix_length = DATASET_IDS_BY_PID[project_id].length + 1;
  var length_array  = data_arr[0];
  if (data_arr[0].length < matrix_length) {
    length_array = fill_out_arr_doubles('', matrix_length);
  }

  var newArray = length_array.map(function (col, i) {
    return data_arr.map(function (row) {
      return row[i];
    });
  });
  console.timeEnd("TIME: transpose_2d_arr");
  return newArray;
}

function convertArrayOfObjectsToCSV(args) {
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

  data_arr = array_from_object(data);

  transposed_data_arr = transpose_2d_arr(data_arr, project_id);

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
}

// from a csv file to db

// ??

// TODO: mv to helpers and refactor (see also in admin & user_data
router.get('/file_utils', helpers.isLoggedIn, function (req, res) {

  console.time('file_utils');
  var user = req.query.user;

  console.log("file from file_utils: ");
  console.log(file);
  //// DOWNLOAD //////
  var file;
  if (req.query.fxn == 'download' && req.query.template == '1') {
    file = path.join(req.CONFIG.PROCESS_DIR, req.query.filename);
    res.setHeader('Content-Type', 'text');
    res.download(file); // Set disposition and send it.
  } else if (req.query.fxn == 'download' && req.query.type == 'pcoa') {
    file = path.join(req.CONFIG.PROCESS_DIR, 'tmp', req.query.filename);
    res.setHeader('Content-Type', 'text');
    res.download(file); // Set disposition and send it.
  } else if (req.query.fxn == 'download') {
    file = path.join(req.CONFIG.USER_FILES_BASE, user, req.query.filename);

    res.setHeader('Content-Type', 'text');
    res.download(file); // Set disposition and send it.
    ///// DELETE /////
  } else if (req.query.fxn == 'delete') {

    file = path.join(req.CONFIG.USER_FILES_BASE, user, req.query.filename);

    if (req.query.type == 'elements') {
      fs.unlink(file, function deleteFile(err) {
        if (err) {
          console.log("err 8: ");
          console.log(err);
          req.flash('fail', err);
        } else {
          req.flash('success', 'Deleted: ' + req.query.filename);
          res.redirect("/visuals/saved_elements");
        }
      }); //
    } else {
      fs.unlink(file, function deleteFile(err) {
        if (err) {
          req.flash('fail', err);
          console.log("err 9: ");
          console.log(err);
        } else {
          req.flash('success', 'Deleted: ' + req.query.filename);
          res.redirect("/metadata/metadata_file_list");
        }
      });
    }

  }
  console.timeEnd('file_utils');

});

// save from form to db ??

function saveMetadata(req, res) {
  console.time("TIME: saveMetadata");
  make_csv(req, res);
  // var pid = req.body.project_id;
  req.flash("success", "Success with the metadata submit!");

  res.redirect("/projects/" + req.body.project_id);
  // res.redirect("/metadata/metadata_file_list");
  // /help/contact

  // res.render('help/contact', {
  //
  //   title: 'VAMPS:Contact Us',
  //   choices : req.CONSTS.CONTACT_US_SUBJECTS,
  //   user: req.user,
  //
  //   hostname: req.CONFIG.hostname
  // });

  // editMetadata(req, res);
  // if(!req.form.isValid){
  //   // TODO: remove here, should be after validation only
  //   make_csv(req, res);
  //   editMetadata(req, res);
  // }else{
  //   make_csv(req, res);
  //   saveToDb(req.metadata);
  //   // TODO: change
  //   res.redirect("/metadata"+req.metadata.id+"/edit");
  // }
  console.timeEnd("TIME: saveMetadata");

}

// if csv files: show a list and compare
router.get('/metadata_file_list', function (req, res) {
  console.time("TIME: get metadata_file_list");
  console.log('in metadata_file_list');
  var user_metadata_csv_files = get_csv_files(req);

  user_metadata_csv_files.sort(function sortByTime(a, b) {
    //reverse sort: recent-->oldest
    return helpers.compareStrings_int(b.time.getTime(), a.time.getTime());
  });


  res.render('metadata/metadata_file_list', {
    title: 'VAMPS:Metadata',
    user: req.user,
    hostname: req.CONFIG.hostname,
    finfo: JSON.stringify(user_metadata_csv_files),
    edit: true
  });
  console.timeEnd("TIME: get metadata_file_list");

});

function get_csv_files(req) {
  console.time("TIME: get_csv_files");

  var user_csv_dir = path.join(config.USER_FILES_BASE, req.user.username);
  var all_my_files = helpers.walk_sync(user_csv_dir);

  console.timeEnd("TIME: get_csv_files");
  return all_my_files;
}

router.post('/metadata_files',
  [helpers.isLoggedIn],
  function (req, res) {

    console.time("TIME: in post /metadata_files");
    var table_diff_html, sorted_files, files_to_compare;
    sorted_files     = sorted_files_by_time(req);
    files_to_compare = sorted_files_to_compare(req, sorted_files);

    if (typeof req.body.compare !== 'undefined' && req.body.compare.length === 2) {

      table_diff_html = get_file_diff(req, files_to_compare);
      res.render("metadata/metadata_file_list", {
        title: "VAMPS: Metadata File List",
        user: req.user,
        hostname: req.CONFIG.hostname,
        table_diff_html: table_diff_html,
        finfo: JSON.stringify(sorted_files),
        files_to_compare: files_to_compare,
        file_names: req.body.compare,
        edit: true
      });
    }
    else if (typeof req.body.edit_metadata_file !== 'undefined' && req.body.edit_metadata_file.length !== 0) {
      make_metadata_object_from_csv(req, res);
    }
    else {
      req.flash("fail", "Please choose two files to compare or one to edit");
      res.redirect("/metadata/metadata_file_list");
    }

    console.timeEnd("TIME: in post /metadata_files");
  });

function sorted_files_by_time(req) {
  console.time("sorted_files_by_time");
  var f_info = JSON.parse(req.body.file_info);
  var dir    = path.join(config.USER_FILES_BASE, req.user.username);
  f_info.sort(function (a, b) {
    return fs.statSync(path.join(dir, a.filename)).mtime.getTime() -
      fs.statSync(path.join(dir, b.filename)).mtime.getTime();
  });

  console.timeEnd("sorted_files_by_time");
  return f_info;
}

function sorted_files_to_compare(req, sorted_files) {
  console.time("sorted_files_to_compare");

  var file_names_array = req.body.compare;
  var files            = [];

  if (typeof file_names_array === 'undefined' || file_names_array.length === 0) {
    return null;
  }
  sorted_files.filter(function (el) {
    if (file_names_array.includes(el.filename)) {
      files.push(el);
    }
  });
  console.timeEnd("sorted_files_to_compare");
  return files;
}

function get_file_diff(req, files) {
  var coopy      = require('coopyhx');
  var inputPath1 = path.join(config.USER_FILES_BASE, req.user.username, files[0]["filename"]);
  var inputPath2 = path.join(config.USER_FILES_BASE, req.user.username, files[1]["filename"]);

  // console.log("PPP1 inputPath1");
  // console.log(inputPath1);

  var columnDelimiter = ',';
  var lineDelimiter   = '\n';
  var cellEscape      = '"';

  var data1 = String(fs.readFileSync(inputPath1));
  var data2 = String(fs.readFileSync(inputPath2));
  // console.log("AAA7 data1");
  // console.log(data1);
  // todo: async?
  // var parse = require('csv-parse');
  // var parser = parse({delimiter: columnDelimiter, trim: true}, function(err, data){
  //   console.log("AAA7 data");
  //   console.log(data);
  // });
  // fs.createReadStream(inputPath1).pipe(parser);


  var parse_sync = require('csv-parse/lib/sync');
  var records1   = parse_sync(data1, {trim: true});
  var records2   = parse_sync(data2, {trim: true});

  var table1 = new coopy.CoopyTableView(records1);
  var table2 = new coopy.CoopyTableView(records2);

  var alignment = coopy.compareTables(table1, table2).align();

  var data_diff  = [];
  var table_diff = new coopy.CoopyTableView(data_diff);

  var flags       = new coopy.CompareFlags();
  var highlighter = new coopy.TableDiff(alignment, flags);
  highlighter.hilite(table_diff);

  var diff2html = new coopy.DiffRender();
  diff2html.render(table_diff);
  var table_diff_html = diff2html.html();

  return "<div class = 'highlighter'>" + table_diff_html + "</div>";

}

// common functions

function get_project_info(project_name_or_pid) {
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

}

function get_project_abstract_data(project, path_to_static) {
  console.time("TIME: get_project_abstract_data");

  var info_file     = '';
  var abstract_data = {};
  if (project.substring(0, 3) === 'DCO') {
    info_file     = path.join(path_to_static, 'abstracts', 'DCO_info.json');
    abstract_data = JSON.parse(fs.readFileSync(info_file, 'utf8'));
  }
  console.timeEnd("TIME: get_project_abstract_data");
  return abstract_data;
}

// TODO: move to helpers, use here and for project_profile
function get_project_prefix(project) {
  console.time("TIME: get_project_prefix");
  var project_parts  = project.split('_');
  var project_prefix = project;

  if (project_parts.length >= 2) {
    project_prefix = project_parts[0] + '_' + project_parts[1];
  }
  console.timeEnd("TIME: get_project_prefix");
  return project_prefix;
}

function add_all_val_by_key(my_key_hash, my_val_hash, all_metadata_pid) {
  console.time("TIME: 6) add_all_val_by_key");

  for (var i1 = 0, len1 = my_key_hash.length; i1 < len1; i1++) {
    var key = my_key_hash[i1];
    var val = my_val_hash[key];

    if (!(all_metadata_pid.hasOwnProperty(key))) {
      all_metadata_pid[key] = [];
    }
    all_metadata_pid[key].push(val);

  }
  console.timeEnd("TIME: 6) add_all_val_by_key");
  return all_metadata_pid;
}


function prepare_empty_metadata_object(pid, field_names_arr, all_metadata) {
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
}

function get_field_names(dataset_ids) {
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
}

function get_names_from_ordered_const() {
  console.time("time: ordered_metadata_names_only");

  const arraycolumn = (arr, n) => arr.map(x => x[n]);

  // var ordered_metadata_names_only = consts.metadata_form_required_fields.concat(arraycolumn(consts.ordered_metadata_names, 0));

  console.timeEnd("time: ordered_metadata_names_only");
  return arraycolumn(CONSTS.ORDERED_METADATA_NAMES, 0);
}

function fill_out_arr_doubles(value, repeat_times) {
  var arr_temp = Array(repeat_times);

  arr_temp.fill(value, 0, repeat_times);

  return arr_temp;
}

function make_ordered_field_names_obj() {
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

function send_mail_finished(req, res) {
  console.time("TIME: send_mail_finished");

  let transporter = nodeMailer.createTransport(config.smtp_connection_obj);

  var d            = new Date();
  var timeReadable = d.toDateString();

  var text_msg = req.user.first_name + " " + req.user.last_name + " (" + req.user.email + ")" + " finished submitting available metadata to " + req.body.project + " on " + timeReadable + ".";

  let mailOptions = {
    from: '"VAMPS2" <' + config.vamps_email + '>', // sender address
    // to: req.body.to, // list of receivers
    // subject: req.body.subject, // Subject line
    to: ["hlizarralde@mbl.edu"],
    subject: "Metadata edited",
    text: text_msg
    // text: req.body.body, // plain text body
    // html: '<b>NodeJS Email Tutorial</b>' // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if(error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  // res.render('index');
})
  ;

  console.timeEnd("TIME: send_mail_finished");
}

function make_metadata_object(req, res, pid, info) {
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
      all_metadata[pid][field_name] = fill_out_arr_doubles(all_metadata[pid][field_name], repeat_times);
    }
    else {
      all_metadata[pid][field_name] = fill_out_arr_doubles(project_info[field_name], repeat_times);
    }
  }

  if ((all_metadata[pid]["project_abstract"] === 'undefined') || (!all_metadata[pid].hasOwnProperty(["project_abstract"]))) {
    all_metadata[pid]["project_abstract"] = fill_out_arr_doubles("", repeat_times);
  }
  else {

    if ((all_metadata[pid]["project_abstract"][0] !== 'undefined') && (!Array.isArray(all_metadata[pid]["project_abstract"][0]))) {

      var project_abstract_correct_form = helpers.unique_array(all_metadata[pid]["project_abstract"]);

      if (typeof project_abstract_correct_form[0] !== 'undefined') {

        all_metadata[pid]["project_abstract"] = fill_out_arr_doubles(project_abstract_correct_form[0].split(","), repeat_times);

      }
    }
  }

  // console.log("MMM9 all_metadata[pid][\"reference\"]");
  // console.log(JSON.stringify(all_metadata[pid]["reference"]));


  console.timeEnd("TIME: make_metadata_object");
  return all_metadata;
}

// ---- metadata_upload end ----
