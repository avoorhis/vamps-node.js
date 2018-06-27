var express = require("express");
var router  = express.Router();
var helpers = require("./helpers/helpers");
var form    = require("express-form");
var queries = require(app_root + "/routes/queries");
var CONSTS  = require(app_root + "/public/constants");
var fs      = require("fs");
var path    = require("path");
var config  = require(app_root + '/config/config');
// var validator           = require('validator');
// var expressValidator = require('express-validator');
var nodeMailer           = require('nodemailer');
var Metadata             = require(app_root + '/models/metadata');
var metadata_controller  = require(app_root + '/controllers/metadataController');
var csv_files_controller = require(app_root + '/controllers/csvFilesController');

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
// if not valid show again with errors
// if valid
// save project to vamps2
// save the rest into vamps_submissions
// run the "normal" edit metadata with samples_number datasets
// save datasets to vamps2?
// <% if (samples_number > 0){ %>
// <% for (var i = 0; i < Number(samples_number); i++) { %>

// ?? render_edit_form(req, res, {}, {}, all_field_names)

router.get('/metadata_new', helpers.isLoggedIn, function (req, res) {
  var pi_list = metadata_controller.get_pi_list();
  req.session.pi_list = pi_list;
  res.render('metadata/metadata_new', {
    title: 'VAMPS: New Metadata',
    user: req.user,
    hostname: req.CONFIG.hostname,
    button_name: "Validate",
    domain_regions: CONSTS.DOMAIN_REGIONS,
    samples_number: "",
    pi_list: pi_list
  });
});

router.post('/metadata_new',
  [helpers.isLoggedIn],
  form(
    // form.field("pi_id").trim().required().is(/^[0-9]+$/).entityEncode().array(),
    // form.field("pi_name").trim().required().is(/^[a-zA-Z- ]+$/).entityEncode().array(),
    form.field("adaptor").trim().required().is(/^[a-zA-Z0-9]+$/).entityEncode().array(),
    form.field("d_region").trim().required().entityEncode(),
    form.field("dataset_description").trim().required().is(/^[a-zA-Z0-9,_ -]+$/).entityEncode().array(),
    form.field("dataset_name").trim().is(/^[a-zA-Z0-9_]+$/).entityEncode().array(),
    form.field("funding_code").trim().required().is(/^[0-9]+$/).entityEncode(),
    form.field("pi_id_name").trim().required().entityEncode(),
    form.field("project_description").trim().required().entityEncode(),
    form.field("project_name1").trim().required().entityEncode(),
    form.field("project_name2").trim().required().entityEncode(),
    form.field("project_title").trim().required().is(/^[a-zA-Z0-9,_ -]+$/).entityEncode(),
    form.field("sample_concentration").trim().required().isInt().entityEncode().array(),
    form.field("samples_number").trim().required().is(/^[0-9]+$/).entityEncode().array(),
    form.field("submit_code").trim().entityEncode().array(),
    form.field("tube_label").trim().required().is(/^[a-zA-Z0-9_ -]+$/).entityEncode().array()
  ),
  function (req, res) {
    console.log('in POST METADATA new form');
    console.log('OOO post');
    console.log("MMM1, req.body", req.body);

    // MMM1, req.body { project_title: 'AAA title',
    //   pi_id_name: '913#Shangpliang H. Nakibapher Jones#Shangpliang#H. Nakibapher Jones#nakibapher19@gmail.com',
    //   pi_email: 'nakibapher19@gmail.com',
    //   project_description: 'AAA description',
    //   d_region: 'Eukaryal#v4#Ev4',
    //   project_name1: 'HNJS',
    //   project_name2: 'AAA',
    //   project_name3: 'Ev4',
    //   reference: '',
    //   funding_code: '0',
    //   samples_number: '2',
    //   new_row_num: '',
    //   new_row_length: '',
    //   from_where: 'metadata_new_form',
    //   done_editing: 'not_done_editing' }
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

    // var last_name     = this.value.split("#")[2];
    // var first_name    = this.value.split("#")[3];
    // var full_name     = first_name + " " + last_name;
    // var inits         = full_name.split(" ");

    console.log("MMM2, req.form", req.form);

    if (!req.form.isValid) {
      console.log('!req.form.isValid');
      console.log("EEE req.form.errors", req.form.errors);

      //collect errors
      var myArray_fail = helpers.unique_array(req.form.errors);

      // if (helpers.has_duplicates(req.form.sample_name)) {
      //   myArray_fail.push('Sample ID (user sample name) should be unique.');
      // }

      myArray_fail.sort();
      console.log("myArray_fail = ", myArray_fail);
      req.flash("fail", myArray_fail);

      // console.log('QQQ1 req.body.pi_list', pi_list);
      // req.session.DOMAIN_REGIONS = CONSTS.DOMAIN_REGIONS;
      // req.session.button_name    = "Add datasets";

      var d_region_arr   = req.form.d_region.split("#");
      var pi_id_name_arr = req.form.pi_id_name.split("#");
      var full_name      = pi_id_name_arr[3] + " " + pi_id_name_arr[2];
      var project_name1  = req.form.project_name1;
      if (project_name1 === '') {
        project_name1 = metadata_controller.get_inits(full_name.split(" "));
      }
      var project_name3 = d_region_arr[2];
      var project_name  = project_name1 + "_" + req.form.project_name2 + "_" + project_name3;

      console.log("PPP project_name1", project_name1);
      console.log("PPP1 project_name", project_name);
      res.render('metadata/metadata_new', {
        button_name: "Validate",
        domain_regions: CONSTS.DOMAIN_REGIONS,
        hostname: req.CONFIG.hostname,
        pi_email: pi_id_name_arr[4],
        pi_list: req.session.pi_list,
        project_title: req.form.project_title,
        samples_number: req.form.samples_number,
        title: 'VAMPS: New Metadata',
        user: req.user,
      });
    }
    else {
      // ?? render_edit_form(req, res, {}, {}, all_field_names)
      console.log("metadata_upload_new is valid");
      metadata_controller.saveProject(req, res);
    }
  });

// render edit form
router.post('/metadata_edit_form',
  [helpers.isLoggedIn],
  function (req, res) {

    console.time("TIME: 1) in post /metadata_edit_form");
    make_metadata_object_from_db(req, res);
    console.timeEnd("TIME: 1) in post /metadata_edit_form");
  });

// function render_edit_form(req, res, all_metadata, all_field_names) {
//   // console.log("JJJ1 all_metadata");
//   // console.log(JSON.stringify(all_metadata));
//   //
//   // console.log("JJJ2 all_field_names");
//   // console.log(JSON.stringify(all_field_names));
//
//   MD_ENV_CNTRY_vals           = metadata_controller.get_object_vals(MD_ENV_CNTRY);
//   MD_ENV_LZC_vals             = metadata_controller.get_object_vals(MD_ENV_LZC);
//   var ordered_field_names_obj = metadata_controller.make_ordered_field_names_obj();
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
// }


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
      console.log("III in form");
      csv_files_controller.make_csv(req, res);

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
      data[a] = metadata_controller.fill_out_arr_doubles(data[a][0], normal_length);
    }
  }

  var all_metadata         = metadata_controller.make_metadata_object(req, res, pid, data);
  var all_field_names_orig = metadata_controller.make_all_field_names(data['dataset_id']);


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

  metadata_controller.render_edit_form(req, res, all_metadata, all_field_names_with_new);

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

  var data_in_obj_of_arr = metadata_controller.from_obj_to_obj_of_arr(data, pid);

  // all_metadata
  var all_metadata    = metadata_controller.make_metadata_object(req, res, pid, data_in_obj_of_arr);
  var all_field_names = metadata_controller.make_all_field_names(dataset_ids);

  // console.log("DDD3 all_field_names from make_metadata_object_from_csv");
  // console.log(JSON.stringify(all_field_names));
  //
  // console.log("DDD4 all_metadata from make_metadata_object_from_csv");
  // console.log(JSON.stringify(all_metadata));
  req.body.project_id = pid;
  metadata_controller.render_edit_form(req, res, all_metadata, all_field_names);

  console.timeEnd("TIME: make_metadata_object_from_csv");
}

// create form from db
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
    var ids_data   = metadata_controller.get_all_req_metadata(dataset_id);

    Object.assign(AllMetadata_picked[dataset_id], ids_data);
    var primers_info_by_dataset_id = metadata_controller.get_primers_info(dataset_id);

    AllMetadata_picked[dataset_id]["forward_primer"] = primers_info_by_dataset_id['F'];
    AllMetadata_picked[dataset_id]["reverse_primer"] = primers_info_by_dataset_id['R'];

    AllMetadata_picked[dataset_id]["dataset"]             = dataset_info_by_did[dataset_id]["dname"];
    AllMetadata_picked[dataset_id]["dataset_description"] = dataset_info_by_did[dataset_id]["ddesc"];

    AllMetadata_picked[dataset_id]["dataset_id"] = dataset_id;
  }
  console.timeEnd("TIME: add missing info to AllMetadata_picked");

  var data_in_obj_of_arr = metadata_controller.from_obj_to_obj_of_arr(AllMetadata_picked, pid);

  // add abstract_data
  var abstract_data = metadata_controller.get_project_abstract_data(project, req.CONFIG.PATH_TO_STATIC_DOWNLOADS)[metadata_controller.get_project_prefix(project)];
  if (typeof abstract_data === 'undefined') {
    abstract_data      = {};
    abstract_data.pdfs = [];
  }

  data_in_obj_of_arr["project_abstract"] = metadata_controller.fill_out_arr_doubles(abstract_data.pdfs, dataset_ids.length);

  var all_metadata = metadata_controller.make_metadata_object(req, res, pid, data_in_obj_of_arr);

  var all_field_names = metadata_controller.make_all_field_names(dataset_ids);

  // console.log("DDD2 all_field_names");
  // console.log(JSON.stringify(all_field_names));
  // console.log("DDD2 all_metadata");
  // console.log(JSON.stringify(all_metadata));

  metadata_controller.render_edit_form(req, res, all_metadata, all_field_names);

  console.timeEnd("TIME: make_metadata_object_from_db");
}

// from form to a csv file

// from a csv file to db

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
  console.log("SSS in saveMetadata");

  csv_files_controller.make_csv(req, res);
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
  var user_metadata_csv_files = csv_files_controller.get_csv_files(req);

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

router.post('/metadata_files',
  [helpers.isLoggedIn],
  function (req, res) {

    console.time("TIME: in post /metadata_files");
    var table_diff_html, sorted_files, files_to_compare;
    sorted_files     = csv_files_controller.sorted_files_by_time(req);
    files_to_compare = csv_files_controller.sorted_files_to_compare(req, sorted_files);

    if (typeof req.body.compare !== 'undefined' && req.body.compare.length === 2) {

      table_diff_html = csv_files_controller.get_file_diff(req, files_to_compare);
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

// doesn't work from controller
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
});

  console.timeEnd("TIME: send_mail_finished");
}

// ---- metadata_upload end ----
