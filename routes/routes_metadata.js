var express = require("express");
var router  = express.Router();
var helpers = require("./helpers/helpers");
var form    = require("express-form");
// var queries = require(app_root + "/routes/queries");
var CONSTS  = require(app_root + "/public/constants");
var fs      = require("fs");
var path    = require("path");
var config  = require(app_root + '/config/config');
// var validator           = require('validator');
// var expressValidator = require('express-validator');
var nodeMailer           = require('nodemailer');
var Project              = require(app_root + '/models/project_model');
var Dataset              = require(app_root + '/models/dataset_model');
// var User    = require(app_root + '/models/user_model');
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
  const met_obj = new metadata_controller.CreateDataObj(req, res, "", "");

  var pi_list         = met_obj.get_pi_list();
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
    form.field("samples_number").trim().required().is(/^[0-9]+$/).entityEncode(),
    form.field("submit_code").trim().entityEncode().array(),
    form.field("tube_label").trim().required().is(/^[a-zA-Z0-9_ -]+$/).entityEncode().array()
  ),
  function (req, res) {
    console.time("TIME: in post /metadata_new");
    // console.log("MMM1, req.body", req.body);
    // console.log("MMM2, req.form", req.form);
    const show_new = new metadata_controller.ShowObj(req, res);

    if (!req.form.isValid) {
      console.log('!req.form.isValid');
      console.log("EEE req.form.errors", req.form.errors);
      show_new.show_metadata_new_again();
    }
    else {
      console.log("metadata_upload_new is valid");
      var user_id       = req.form.pi_id_name.split('#')[0];
      const new_project = new Project(req, res, 0, user_id);
      var project_obj   = new_project.project_obj;
      console.log('OOO1 JSON.stringify(project_obj) = ', JSON.stringify(project_obj));
      new_project.addProject(project_obj, function (err, rows) {
          console.time("TIME: in post /metadata_new, add project");
          if (err) {
            console.log('WWW0 err', err);
            req.flash('fail', err);
            show_new.show_metadata_new_again();
          }
          else {

            console.log('New project SAVED');
            console.log('WWW rows', rows);
            var pid = rows.insertId;
            new_project.add_info_to_project_globals(project_obj, pid);

            const met_obj = new metadata_controller.CreateDataObj(req, res, pid, []);
            met_obj.make_new_project_for_form(rows, project_obj);
          }
          console.timeEnd("TIME: in post /metadata_new, add project");
        }
      );
    }
    console.timeEnd("TIME: in post /metadata_new");
  });

// render edit form
router.post('/metadata_edit_form',
  [helpers.isLoggedIn],
  function (req, res) {

    console.time("TIME: 1) in post /metadata_edit_form");
    make_metadata_object_from_db(req, res);
    console.timeEnd("TIME: 1) in post /metadata_edit_form");
  });

// create form from req.form
// TODO: update field names from https://docs.google.com/spreadsheets/d/1adAtGc9DdY2QBQZfd1oaRdWBzjOv4t-PF1hBfO8mAoA/edit#gid=1223926458
router.post('/metadata_upload',
  [helpers.isLoggedIn],
  form(
    form.field("npoc", helpers.get_second("npoc")).trim().entityEncode().array(),
    form.field("access_point_type", helpers.get_second("access_point_type")).trim().entityEncode().array(),
    form.field("adapter_sequence", helpers.get_second("adapter_sequence")).trim().required().entityEncode().array(),
    form.field("alkalinity", helpers.get_second("alkalinity")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("ammonium", helpers.get_second("ammonium")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("bicarbonate", helpers.get_second("bicarbonate")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("env_biome", helpers.get_second("env_biome")).trim().required().custom(helpers.env_items_validation).entityEncode().array(),
    form.field("biome_secondary", helpers.get_second("biome_secondary")).trim().entityEncode().array(),
    form.field("calcium", helpers.get_second("calcium")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("carbonate", helpers.get_second("carbonate")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("chloride", helpers.get_second("chloride")).trim().entityEncode().array(),
    form.field("clone_library_results", helpers.get_second("clone_library_results")).trim().entityEncode().array(),
    form.field("collection_date", helpers.get_second("collection_date")).trim().required().isDate("Sample collection date format: YYYY-MM-DD").entityEncode().array(),
    form.field("conductivity", helpers.get_second("conductivity")).trim().custom(helpers.numbers_n_period).required().entityEncode().array(),
    form.field("dataset", helpers.get_second("dataset")).trim().required().entityEncode().array(),
    form.field("dataset_description").trim().required().is(/^[a-zA-Z0-9,_ -]+$/).entityEncode().array(),
    form.field("dataset_id", "").trim().required().isInt().entityEncode().array(),
    // form.field("del180_water", helpers.get_second("del180_water")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),
    form.field("del180_water", helpers.get_second("del180_water")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),

    form.field("depth_in_core", helpers.get_second("depth_in_core")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("depth_subseafloor", helpers.get_second("depth_subseafloor")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("depth_subterrestrial", helpers.get_second("depth_subterrestrial")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("diss_hydrogen", helpers.get_second("diss_hydrogen")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("diss_inorg_carb", helpers.get_second("diss_inorg_carb")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),
    form.field("diss_inorg_carbon_del13c", helpers.get_second("diss_inorg_carbon_del13c")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),
    form.field("diss_org_carb", helpers.get_second("diss_org_carb")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("diss_oxygen", helpers.get_second("diss_oxygen")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("dna_extraction_meth", helpers.get_second("dna_extraction_meth")).trim().required().custom(helpers.env_items_validation).entityEncode().array(),
    form.field("dna_quantitation", helpers.get_second("dna_quantitation")).trim().required().custom(helpers.env_items_validation).entityEncode().array(),
    form.field("dna_region", helpers.get_second("dna_region")).trim().required().entityEncode().array(),
    form.field("domain", helpers.get_second("domain")).trim().required().entityEncode().array(),
    form.field("elevation", helpers.get_second("elevation")).trim().required("", "Elevation is required (for terrestrial only)").custom(helpers.numbers_n_period_n_minus).entityEncode().array(),
    form.field("env_package", helpers.get_second("env_package")).trim().required().custom(helpers.env_items_validation).entityEncode().array(),
    form.field("enzyme_activities", helpers.get_second("enzyme_activities")).trim().entityEncode().array(),
    form.field("env_feature", helpers.get_second("env_feature")).trim().required().custom(helpers.env_items_validation).entityEncode().array(),
    form.field("fish_probe_name", helpers.get_second("fish_probe_name")).trim().entityEncode().array(),
    form.field("fish_probe_seq", helpers.get_second("fish_probe_seq")).trim().is(/^$|[ATUGCYRSWKMBDHVN]/).entityEncode().array(),
    form.field("feature_secondary", helpers.get_second("feature_secondary")).trim().entityEncode().array(),
    form.field("formation_name", helpers.get_second("formation_name")).trim().entityEncode().array(),
    form.field("forward_primer", helpers.get_second("forward_primer")).trim().entityEncode().array(),
    form.field("functional_gene_assays", helpers.get_second("functional_gene_assays")).trim().entityEncode().array(),
    form.field("geo_loc_name_continental", helpers.get_second("geo_loc_name_continental")).trim().custom(helpers.geo_loc_name_continental_filter).custom(helpers.geo_loc_name_validation).custom(helpers.geo_loc_name_continental_validation).entityEncode().array(),
    form.field("geo_loc_name_marine", helpers.get_second("geo_loc_name_marine")).trim().custom(helpers.geo_loc_name_validation).custom(helpers.geo_loc_name_marine_validation).entityEncode().array(),
    form.field("illumina_index", helpers.get_second("illumina_index")).trim().entityEncode().array(),
    // Index sequence (required for Illumina)
    form.field("intact_polar_lipid", helpers.get_second("intact_polar_lipid")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("investigation_type", helpers.get_second("investigation_type")).trim().required().entityEncode().array(),
    form.field("iron", helpers.get_second("iron")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("iron_ii", helpers.get_second("iron_ii")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("iron_iii", helpers.get_second("iron_iii")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("isol_growth_cond", helpers.get_second("isol_growth_cond")).trim().entityEncode().array(),
    // form.field("latitude", helpers.get_second("latitude")).trim().custom(helpers.latitude_valid).is(/^$|^[0-9.-]+$/).required().entityEncode().array(),
    //, see <a href='https://www.latlong.net/degrees-minutes-seconds-to-decimal-degrees' target='_blank'>a converter</a>
    form.field("latitude", helpers.get_second("latitude")).trim().custom(helpers.latitude_valid).is(/^$|^[0-9.-]+$/, "%s should be in decimal degrees (numbers only). Please see the Tutorial for help").required().entityEncode().array(),
    form.field("longitude", helpers.get_second("longitude")).trim().custom(helpers.longitude_valid).is(/^$|^[0-9.-]+$/, "%s should be in decimal degrees (numbers only). Please see the Tutorial for help").required().entityEncode().array(),
    form.field("magnesium", helpers.get_second("magnesium")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("manganese", helpers.get_second("manganese")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("env_material", helpers.get_second("env_material")).trim().required().custom(helpers.env_items_validation).entityEncode().array(),
    form.field("material_secondary", helpers.get_second("material_secondary")).trim().entityEncode().array(),
    form.field("methane", helpers.get_second("methane")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("methane_del13c", helpers.get_second("methane_del13c")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),
    form.field("microbial_biomass_fish", helpers.get_second("microbial_biomass_fish")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    // form.field("microbial_biomass_avg_cell_number", helpers.get_second("microbial_biomass_avg_cell_number")).trim().entityEncode().array(),
    // form.field("microbial_biomass_intactpolarlipid", helpers.get_second("microbial_biomass_intactpolarlipid")).trim().entityEncode().array(),
    form.field("microbial_biomass_microscopic", helpers.get_second("microbial_biomass_microscopic")).trim().entityEncode().array(),
    // form.field("microbial_biomass_platecounts", helpers.get_second("microbial_biomass_platecounts")).trim().entityEncode().array(),
    form.field("microbial_biomass_qpcr", helpers.get_second("microbial_biomass_qpcr")).trim().entityEncode().array(),
    form.field("nitrate", helpers.get_second("nitrate")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("nitrite", helpers.get_second("nitrite")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("nitrogen_tot", helpers.get_second("nitrogen_tot")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("noble_gas_chemistry", helpers.get_second("noble_gas_chemistry")).trim().entityEncode().array(),
    form.field("org_carb_nitro_ratio", helpers.get_second("org_carb_nitro_ratio")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("ph", helpers.get_second("ph")).trim().custom(helpers.numbers_n_period).custom(helpers.ph_valid).required().entityEncode().array(),
    form.field("part_org_carbon_del13c", helpers.get_second("part_org_carbon_del13c")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),
    form.field("phosphate", helpers.get_second("phosphate")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("pi_email", helpers.get_second("pi_email")).trim().isEmail().required().entityEncode().array(),
    form.field("pi_name", helpers.get_second("pi_name")).trim().required().is(/^[a-zA-Z- ]+$/).entityEncode().array(),
    form.field("plate_counts", helpers.get_second("plate_counts")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("porosity", helpers.get_second("porosity")).trim().custom(helpers.numbers_n_period).custom(helpers.percent_valid).entityEncode().array(),
    form.field("potassium", helpers.get_second("potassium")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("pressure", helpers.get_second("pressure")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("project", helpers.get_second("project")).trim().required().entityEncode().array(),
    form.field("project_abstract", helpers.get_second("project_abstract")).trim().required().entityEncode().array(),
    form.field("project_title", helpers.get_second("project_title")).trim().required().is(/^[a-zA-Z0-9,_ -]+$/).entityEncode().array(),
    form.field("redox_potential", helpers.get_second("redox_potential")).trim().custom(helpers.numbers_n_period_n_minus).entityEncode().array(),
    form.field("redox_state", helpers.get_second("redox_state")).trim().is(/^$|^[a-zA-Z ]+$/).entityEncode().array(),
    form.field("reference", helpers.get_second("reference")).trim().entityEncode().array(),
    form.field("resistivity", helpers.get_second("resistivity")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("reverse_primer", helpers.get_second("reverse_primer")).trim().entityEncode().array(),
    form.field("rock_age", helpers.get_second("rock_age")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("run", helpers.get_second("run")).trim().required().entityEncode().array(),
    form.field("salinity", helpers.get_second("salinity")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("sample_collection_device", helpers.get_second("sample_collection_device")).trim().entityEncode().array(),
    form.field("samp_store_dur", helpers.get_second("samp_store_dur")).trim().is(/^$|^[0-9a-zA-Z ]+$/).entityEncode().array(),
    form.field("samp_store_temp", helpers.get_second("samp_store_temp")).trim().is(/^$|^[0-9.-]+$/).entityEncode().array(),
    form.field("sample_name", helpers.get_second("sample_name")).trim().required().entityEncode().array(),
    form.field("sample_size_mass", helpers.get_second("sample_size_mass")).trim().custom(helpers.positive).custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("sample_size_vol", helpers.get_second("sample_size_vol")).trim().custom(helpers.positive).custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("sample_type", helpers.get_second("sample_type")).trim().required().custom(helpers.env_items_validation).entityEncode().array(),
    form.field("sequencing_meth", helpers.get_second("sequencing_meth")).trim().required().entityEncode().array(),
    form.field("silicate", helpers.get_second("silicate")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("sodium", helpers.get_second("sodium")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("sulfate", helpers.get_second("sulfate")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("sulfide", helpers.get_second("sulfide")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("sulfur_tot", helpers.get_second("sulfur_tot")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("target_gene", helpers.get_second("target_gene")).trim().required().entityEncode().array(),
    form.field("temperature", helpers.get_second("temperature")).trim().is(/^$|^[0-9.-]+$/).required().entityEncode().array(),
    form.field("tot_carb", helpers.get_second("tot_carb")).trim().custom(helpers.numbers_n_period).custom(helpers.percent_valid).entityEncode().array(),
    form.field("tot_depth_water_col", helpers.get_second("tot_depth_water_col")).trim().custom(helpers.numbers_n_period).entityEncode().array(),
    form.field("tot_inorg_carb", helpers.get_second("tot_inorg_carb")).trim().custom(helpers.numbers_n_period).custom(helpers.percent_valid).entityEncode().array(),
    form.field("tot_org_carb", helpers.get_second("tot_org_carb")).trim().custom(helpers.numbers_n_period).custom(helpers.percent_valid).entityEncode().array(),
    form.field("trace_element_geochem", helpers.get_second("trace_element_geochem")).trim().entityEncode().array(),
    form.field("water_age", helpers.get_second("water_age")).trim().custom(helpers.numbers_n_period).entityEncode().array()
  ),
  function (req, res) {
    console.time("TIME: post metadata_upload");
    if (!req.form.isValid) {
      console.log('in post /metadata_upload, !req.form.isValid');

      make_metadata_object_from_form(req, res);
      console.log("III in form");
      //TODO: include what below to callback for dataset upload, right now it saves what is in the form, no datasets etc.
      if ((typeof DATASET_IDS_BY_PID[req.body.project_id] !== 'undefined') && (DATASET_IDS_BY_PID[req.body.project_id].length > 0)) {
        const csv_files_obj = new csv_files_controller.CsvFiles(req, res);
        csv_files_obj.make_csv(req, res);
      }
      else {
        // do it after asynchronous make_metadata_object_from_form is done with global objects
      }

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
  console.trace("Show me, I'm in make_metadata_object_from_form");
  var pid  = req.body.project_id;
  var data = req.form;

  // console.log("DDD9 req.form");
  // console.log(JSON.stringify(req.form));

  //new
  if (data['dataset_id'][0] === "") {
    const new_dataset = new Dataset(req, res, pid);
    var DatasetInfo   = new_dataset.DatasetInfo;
    console.log('OOO1 JSON.stringify(DatasetInfo) = ', JSON.stringify(DatasetInfo));
    new_dataset.addDataset(function (err, rows) {
      console.time("TIME: in post /metadata_new, add dataset");
      if (err) {
        console.log('WWW0 err', err);
        req.flash('fail', err);
        // show_new.show_metadata_new_again(); TODO: show the same form with empty datasets again
      }
      else {
        console.log('New datasets SAVED');
        console.log('WWW rows', rows);
        new_dataset.get_new_dataset_by_name(
          function (err, rows) {
            if (err) {
              console.log('WWW00 err', err);
              req.flash('fail', err);
              // show_new.show_metadata_new_again(); TODO: show the same form with empty datasets again
            }
            else {
              console.log('WWW22 rows', rows);
              new_dataset.update_dataset_obj(rows, pid);
              // new_dataset.dataset_objects_arr;
              new_dataset.add_info_to_dataset_globals();
              existing_object_from_form(req, res, pid, data);
            }
          }
        );

        //  then all from "existing"
      }


    });
  }

  console.timeEnd("TIME: make_metadata_object_from_form");
}

function existing_object_from_form(req, res, pid, data) {
  // existing
  //add project_abstract etc.
  //TODO: DRY with other such places.
  const met_obj = new metadata_controller.CreateDataObj(req, res, pid, data['dataset_id']);

  var normal_length = data['dataset'].length;
  for (var a in data) {
    if (data[a].length < normal_length && (typeof data[a][0] !== 'undefined')) {
      data[a] = met_obj.fill_out_arr_doubles(data[a][0], normal_length);
    }
  }
  var all_metadata         = met_obj.make_metadata_object(req, res, pid, data);
  var all_field_names_orig = met_obj.make_all_field_names(data['dataset_id']);


  //add_new
  var all_field_names_with_new = met_obj.collect_new_rows(req, all_field_names_orig);

  // console.log("YYY3 all_field_names_with_new");
  // console.log(JSON.stringify(all_field_names_with_new));

  var all_field_names_first_column = met_obj.get_first_column(all_field_names_with_new, 0);
  var all_new_names                = all_field_names_first_column.slice(all_field_names_first_column.indexOf("enzyme_activities") + 1);
  all_metadata[pid]                = met_obj.get_new_val(req, all_metadata[pid], all_new_names);

  //collect errors
  var myArray_fail = helpers.unique_array(req.form.errors);

  if (helpers.has_duplicates(req.form.sample_name)) {
    myArray_fail.push('Sample ID (user sample name) should be unique.');
  }

  myArray_fail.sort();
  req.flash("fail", myArray_fail);

  // ShowObj {
  //
  //   constructor(req, res, all_metadata, all_field_names_arr,
  // done ordered_field_names_obj
  // TODO: ??? all_field_units, ordered_field_names_obj, user, hostname)

  var all_field_units = MD_CUSTOM_UNITS[req.body.project_id];

  const show_new = new metadata_controller.ShowObj(req, res, all_metadata, all_field_names_with_new, all_field_units);
  show_new.render_edit_form();

}

// create form from a csv file

function make_metadata_object_from_csv(req, res) {
  console.time("TIME: make_metadata_object_from_csv");

  // console.log("MMM req.body from make_metadata_object_from_csv");
  // console.log(req.body);
  var file_name     = req.body.edit_metadata_file;
  const cur_project = new Project(req, res, 0, 0);
  var project_name  = req.body.project || cur_project.get_project_name_from_file_name(file_name);
  var pid           = PROJECT_INFORMATION_BY_PNAME[project_name]["pid"];

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

  const met_obj          = new metadata_controller.CreateDataObj(req, res, pid, dataset_ids);
  var data_in_obj_of_arr = met_obj.from_obj_to_obj_of_arr(data, pid);

// all_metadata
  var all_metadata     = met_obj.make_metadata_object(req, res, pid, data_in_obj_of_arr);
  var all_field_names4 = met_obj.make_all_field_names(dataset_ids);

  // console.log("DDD3 all_field_names from make_metadata_object_from_csv");
  // console.log(JSON.stringify(all_field_names));
  //
  // console.log("DDD4 all_metadata from make_metadata_object_from_csv");
  // console.log(JSON.stringify(all_metadata));
  req.body.project_id = pid;

  var all_field_units = MD_CUSTOM_UNITS[pid];
  const show_new      = new metadata_controller.ShowObj(req, res, all_metadata, all_field_names4, all_field_units);
  show_new.render_edit_form();

  console.timeEnd("TIME: make_metadata_object_from_csv");
}

// create form from db
function make_metadata_object_from_db(req, res) {
  console.time("TIME: make_metadata_object_from_db");
  var pid         = req.body.project_id;
  //repeated!
  var dataset_ids = DATASET_IDS_BY_PID[pid];
  // var project     = PROJECT_INFORMATION_BY_PID[pid].project;

  // get_db_data
  console.time("TIME: helpers.slice_object");
  var AllMetadata_picked = helpers.slice_object(AllMetadata, dataset_ids);
  console.timeEnd("TIME: helpers.slice_object");

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

  const met_obj = new metadata_controller.CreateDataObj(req, res, pid, dataset_ids);

  // add missing info to AllMetadata_picked
  console.time("TIME: add missing info to AllMetadata_picked");
  for (var d in dataset_ids) {
    var dataset_id = dataset_ids[d];
    var ids_data   = met_obj.get_all_req_metadata(dataset_id);

    Object.assign(AllMetadata_picked[dataset_id], ids_data);
    var primers_info_by_dataset_id = met_obj.get_primers_info(dataset_id);

    AllMetadata_picked[dataset_id]["forward_primer"] = primers_info_by_dataset_id['F'];
    AllMetadata_picked[dataset_id]["reverse_primer"] = primers_info_by_dataset_id['R'];

    AllMetadata_picked[dataset_id]["dataset"]             = dataset_info_by_did[dataset_id]["dname"];
    AllMetadata_picked[dataset_id]["dataset_description"] = dataset_info_by_did[dataset_id]["ddesc"];

    AllMetadata_picked[dataset_id]["dataset_id"] = dataset_id;
  }
  console.timeEnd("TIME: add missing info to AllMetadata_picked");

  // var data_in_obj_of_arr = metadata_controller.from_obj_to_obj_of_arr(AllMetadata_picked, pid);

  // add abstract_data

  // as many values per field as there are datasets

  var user_id = PROJECT_INFORMATION_BY_PID[pid].oid;
  // var user_obj = new User.getUserInfoFromGlobal(user_id);

  const new_project = new Project(req, res, pid, user_id);
  var project_obj   = new_project.project_obj;

  var abstract_data = project_obj.abstract_data;

  var data_in_obj_of_arr                 = met_obj.from_obj_to_obj_of_arr(AllMetadata_picked, pid);
  data_in_obj_of_arr["project_abstract"] = met_obj.fill_out_arr_doubles(abstract_data.pdfs, dataset_ids.length);

  var all_metadata = met_obj.make_metadata_object(req, res, pid, data_in_obj_of_arr);

  var all_field_names4 = met_obj.make_all_field_names(dataset_ids);

  // console.log("DDD2 all_field_names");
  // console.log(JSON.stringify(all_field_names));
  // console.log("DDD2 all_metadata");
  // console.log(JSON.stringify(all_metadata));

  const show_new = new metadata_controller.ShowObj(req, res, all_metadata, all_field_names4);
  show_new.render_edit_form();
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

  const csv_files_obj = new csv_files_controller.CsvFiles(req, res);
  csv_files_obj.make_csv();
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
  const csv_files_obj         = new csv_files_controller.CsvFiles(req, res);
  var user_metadata_csv_files = csv_files_obj.get_csv_files();

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
    const csv_files_obj = new csv_files_controller.CsvFiles(req, res);
    sorted_files        = csv_files_obj.sorted_files_by_time();
    files_to_compare    = csv_files_obj.sorted_files_to_compare(sorted_files);

    if (typeof req.body.compare !== 'undefined' && req.body.compare.length === 2) {

      table_diff_html = csv_files_obj.get_file_diff(files_to_compare);
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
    if (error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
    // res.render('index');
  });

  console.timeEnd("TIME: send_mail_finished");
}

// ---- metadata_upload end ----
