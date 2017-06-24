var express = require("express");
var router  = express.Router();
var helpers = require("./helpers/helpers");
var form    = require("express-form");
var queries = require(app_root + "/routes/queries");
var CONSTS  = require(app_root + "/public/constants");
var fs = require("fs");
var path = require("path");
var config  = require(app_root + '/config/config');
var validator = require('validator');
var expressValidator = require('express-validator');

/* GET metadata page. */
 router.get('/metadata', function(req, res) {
      console.log('in metadata');
      res.render('metadata/metadata', { title: 'VAMPS:Metadata',
            user: req.user,
            hostname: req.CONFIG.hostname
        });
  });

router.get('/metadata_list', helpers.isLoggedIn, function(req, res) {
      console.log('in metadata');
      var mdata_w_latlon = {};
      console.log(DatasetsWithLatLong);
      //console.log(DatasetsWithLatLong)  // json
      //console.log(AllMetadataNames)  // list (req w _ids)
      for(var n in AllMetadataNames){
        md_selected = AllMetadataNames[n];
        mdata_w_latlon[md_selected] = 0;
        
        //console.log(md_selected)
        for(var did in DatasetsWithLatLong){
        //console.log(AllMetadata[did])
        //if(AllMetadata.hasOwnProperty(did)){
            //console.log('found1',did)
            //var mdata = helpers.required_metadata_names_from_ids(AllMetadata[did], md_selected)
            mdata = AllMetadata[did];   // has ids
            
            pid = PROJECT_ID_BY_DID[did];
            //console.log('pid',pid)
            pname = PROJECT_INFORMATION_BY_PID[pid].project;
            
            if(mdata.hasOwnProperty(md_selected)){
                    mdata_w_latlon[md_selected] = 1;
            }
        }
      }
      //console.log(mdata_w_latlon)
      res.render("metadata/metadata_list", { title: "VAMPS:Metadata List",
            user:         req.user,hostname: req.CONFIG.hostname,
            metadata:     AllMetadataNames,
            req_mdata_names: JSON.stringify(req.CONSTS.REQ_METADATA_FIELDS_wIDs),
            mdata_latlon: JSON.stringify(mdata_w_latlon),
            names_by_did: JSON.stringify(DATASET_NAME_BY_DID),
            pid_by_did:   JSON.stringify(PROJECT_ID_BY_DID),
            pinfo_by_pid: JSON.stringify(PROJECT_INFORMATION_BY_PID)
        });
});

router.get('/list_result/:mditem', helpers.isLoggedIn, function(req, res) {
      console.log('in metadatalist result');
      var md_selected = req.params.mditem;
      console.log(md_selected);
      var mdvalues = {};
      for(var did in DATASET_NAME_BY_DID){
        if(did in AllMetadata){
        if(req.CONSTS.REQ_METADATA_FIELDS_wIDs.indexOf(md_selected.slice(0,md_selected.length-3)) !== -1){
            var data = helpers.required_metadata_names_from_ids(AllMetadata[did], md_selected);  // send _id
            mdvalues[did] = data.value;
            md_selected_show = data.name;
        }else if(AllMetadata[did].hasOwnProperty(md_selected)){
             mdvalues[did] = AllMetadata[did][md_selected];
             md_selected_show = md_selected;
             
        }
       }
      }      
      res.render('metadata/list_result', { title: 'VAMPS:Metadata List Result',
            user:           req.user,hostname: req.CONFIG.hostname,
            vals:     		JSON.stringify(mdvalues),
            names_by_did:   JSON.stringify(DATASET_NAME_BY_DID),
            pid_by_did:     JSON.stringify(PROJECT_ID_BY_DID),
            pinfo_by_pid:   JSON.stringify(PROJECT_INFORMATION_BY_PID),       
            item:           md_selected_show	  				
        });
  });

router.get('/geomap/:item', helpers.isLoggedIn, function(req, res) {
      console.log('in metadata - geomap');
      var md_item = req.params.item;
      if(req.CONSTS.REQ_METADATA_FIELDS_wIDs.indexOf(md_item.slice(0,md_item.length-3)) !== -1){
        md_item_show = md_item.slice(0,md_item.length-3);
      }else{
        md_item_show = md_item;
      }
      var metadata_info = get_metadata_hash(md_item);  // fxn: see below
      //console.log('metadata_info')
      res.render('metadata/geomap', { title: 'VAMPS:Metadata Distribution',
            user    : req.user,hostname: req.CONFIG.hostname,
            md_item : md_item_show,
            mdinfo  : JSON.stringify(metadata_info),
            gekey   : req.CONFIG.GOOGLE_EARTH_KEY,           
        });
  });

module.exports = router;

//////////////////////////////
function get_metadata_hash(md_selected){
    var md_info = {};
    //md_info[md_item] = {}
    md_info.metadata = {};
    var got_lat, got_lon;
    //console.log('PROJECT_ID_BY_DID.length')
    //console.log(PROJECT_ID_BY_DID)
    //console.log(Object.keys(PROJECT_ID_BY_DID).length)
    for(var did in PROJECT_ID_BY_DID){
        
        if(AllMetadata.hasOwnProperty(did)){
            //console.log('found1',did)
            var mdata = AllMetadata[did];
            var pid = PROJECT_ID_BY_DID[did];
            //console.log('pid',pid)
            pname = PROJECT_INFORMATION_BY_PID[pid].project;
            if(mdata.hasOwnProperty(md_selected) && mdata.hasOwnProperty('latitude') && mdata.hasOwnProperty('longitude')){
                if(mdata['latitude'] !== 'None' && mdata['longitude'] !== 'None'){
                    //console.log('found2',md_selected)
                    var pjds = pname+'--'+DATASET_NAME_BY_DID[did];
                    md_info.metadata[pjds] ={};
                    md_info.metadata[pjds].pid = pid;
                    md_info.metadata[pjds].did = did;
                    var data = helpers.required_metadata_names_from_ids(mdata, md_selected);
                    md_info.metadata[pjds].value = data.value;
                    //md_info.metadata[pjds].value = mdata[md_selected]
                    md_info.metadata[pjds].latitude = mdata['latitude'];
                    md_info.metadata[pjds].longitude = mdata['longitude'];
                }

            }
        }else{            
            //console.log('did '+did+' not found in PROJECT_ID_BY_DID')
        }        
        
    }

    return md_info;

}

// ---- metadata_upload ----
// AllMetadata = helpers.get_metadata_from_file()

router.post('/start_edit',
  [helpers.isLoggedIn],
  function (req, res) {

    console.time("TIME: 1) in post /start_edit");

    make_metadata_hash(req, res);

    console.timeEnd("TIME: 1) in post /start_edit");
  });

// TODO: rename
// todo: if there is req.form (or req.body?) use the result?
function make_metadata_hash(req, res) {
  console.time("TIME: 2) make_metadata_hash");

  pid = req.body.project_id;
  all_metadata = {};
  if (helpers.isInt(pid))
  {
    all_metadata[pid] = {};
    connection.query(queries.get_select_datasets_queryPID(pid), function (err, rows, fields) {
      if (err)
      {
        console.log('get_select_datasets_queryPID error: ' + err);
      }
      else
      {
        console.log("in make_metadata_hash");
        all_metadata = populate_metadata_hash(rows, pid, all_metadata);

        var project = all_metadata[pid]["project"];
        var abstract_data = get_project_abstract_data(project, req);
        var project_prefix = get_project_prefix(project);

        res.render("metadata/metadata_upload_from_file", {
          title: "VAMPS: Metadata_upload",
          user: req.user,
          hostname: req.CONFIG.hostname,
          abstract_data_pr: abstract_data[project_prefix],
          all_metadata: all_metadata,
          all_field_names: CONSTS.ORDERED_METADATA_NAMES,
          dividers: CONSTS.ORDERED_METADATA_DIVIDERS,
          dna_extraction_options: CONSTS.MY_DNA_EXTRACTION_METH_OPTIONS,
          dna_quantitation_options: CONSTS.DNA_QUANTITATION_OPTIONS,
          biome_primary_options: CONSTS.BIOME_PRIMARY,
          feature_primary_options: CONSTS.FEATURE_PRIMARY,
          material_primary_options: CONSTS.MATERIAL_PRIMARY,
          metadata_form_required_fields: CONSTS.METADATA_FORM_REQUIRED_FIELDS,
          env_package_options: CONSTS.DCO_ENVIRONMENTAL_PACKAGES,
          investigation_type_options: CONSTS.INVESTIGATION_TYPE,
          sample_type_options: CONSTS.SAMPLE_TYPE,
          new_row_info_arr: ""
        });

      }
      // end else
    });
  }
  else
  { // end if int
    console.log('ERROR pid is not an integer: ', pid);
  }
  console.timeEnd("TIME: 2) make_metadata_hash");
}

// TODO: update field names from https://docs.google.com/spreadsheets/d/1adAtGc9DdY2QBQZfd1oaRdWBzjOv4t-PF1hBfO8mAoA/edit#gid=1223926458
router.post('/metadata_upload',
  [helpers.isLoggedIn],
  form(
    form.field("NPOC", get_second("NPOC")).trim().entityEncode().array(),
    form.field("access_point_type", get_second("access_point_type")).trim().entityEncode().array(),
    form.field("adapter_sequence", get_second("adapter_sequence")).trim().entityEncode().array().required(),
    form.field("alkalinity", get_second("alkalinity")).trim().entityEncode().array(),
    form.field("ammonium", get_second("ammonium")).trim().entityEncode().array(),
    form.field("bicarbonate", get_second("bicarbonate")).trim().entityEncode().array(),
    form.field("env_biome", get_second("env_biome")).trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("biome_secondary", get_second("biome_secondary")).trim().entityEncode().array(),
    form.field("calcium", get_second("calcium")).trim().entityEncode().array(),
    form.field("calcium_carbonate", get_second("calcium_carbonate")).trim().entityEncode().array(),
    form.field("chloride", get_second("chloride")).trim().entityEncode().array(),
    form.field("clone_library_results", get_second("clone_library_results")).trim().entityEncode().array(),
    form.field("collection_date", get_second("collection_date")).trim().required().entityEncode().isDate("Sample collection date format: YYYY-MM-DD").array(),
    form.field("conductivity", get_second("conductivity")).trim().entityEncode().array().required(),
    form.field("dataset", get_second("dataset")).trim().entityEncode().array().required(),
    form.field("dataset_id", "").trim().required().entityEncode().isInt().array(),
    form.field("del18O_water", get_second("del18O_water")).trim().entityEncode().array(),
    form.field("depth_in_core", get_second("depth_in_core")).trim().entityEncode().array(),
    form.field("depth_subseafloor", get_second("depth_subseafloor")).trim().entityEncode().array(),
    form.field("depth_subterrestrial", get_second("depth_subterrestrial")).trim().entityEncode().array(),
    form.field("diss_hydrogen", get_second("diss_hydrogen")).trim().entityEncode().array(),
    form.field("diss_inorg_carb", get_second("diss_inorg_carb")).trim().entityEncode().array(),
    form.field("diss_inorg_carbon_del13C", get_second("diss_inorg_carbon_del13C")).trim().entityEncode().array(),
    form.field("diss_org_carb", get_second("diss_org_carb")).trim().entityEncode().array(),
    form.field("diss_oxygen", get_second("diss_oxygen")).trim().entityEncode().array(),
    form.field("dna_extraction_meth", get_second("dna_extraction_meth")).trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("dna_quantitation", get_second("dna_quantitation")).trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("dna_region", get_second("dna_region")).trim().entityEncode().array().required(),
    form.field("domain", get_second("domain")).trim().entityEncode().array().required(),
    form.field("elevation", get_second("elevation")).trim().entityEncode().array().required(),
    form.field("env_package", get_second("env_package")).trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("enzyme_activities", get_second("enzyme_activities")).trim().entityEncode().array(),
    form.field("env_feature", get_second("env_feature")).trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("feature_secondary", get_second("feature_secondary")).trim().entityEncode().array(),
    form.field("formation_name", get_second("formation_name")).trim().entityEncode().array(),
    form.field("forward_primer", get_second("forward_primer")).trim().entityEncode().array().required(),
    form.field("functional_gene_assays", get_second("functional_gene_assays")).trim().entityEncode().array(),
    form.field("geo_loc_name_continental", get_second("geo_loc_name_continental")).trim().entityEncode().array().required(),
    form.field("geo_loc_name_marine", get_second("geo_loc_name_marine")).trim().entityEncode().array().required(),
    form.field("illumina_index", get_second("illumina_index")).trim().entityEncode().array(),
    // Index sequence (required for Illumina)
    form.field("investigation_type", get_second("investigation_type")).trim().entityEncode().array().required(),
    form.field("iron", get_second("iron")).trim().entityEncode().array(),
    form.field("iron_II", get_second("iron_II")).trim().entityEncode().array(),
    form.field("iron_III", get_second("iron_III")).trim().entityEncode().array(),
    form.field("isol_growth_cond", get_second("isol_growth_cond")).trim().entityEncode().array(),
    form.field("latitude", get_second("latitude")).trim().required().entityEncode().isDecimal().array(),
    form.field("longitude", get_second("longitude")).trim().required().entityEncode().isDecimal().array(),
    form.field("magnesium", get_second("magnesium")).trim().entityEncode().array(),
    form.field("manganese", get_second("manganese")).trim().entityEncode().array(),
    form.field("env_material", get_second("env_material")).trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("material_secondary", get_second("material_secondary")).trim().entityEncode().array(),
    form.field("methane", get_second("methane")).trim().entityEncode().array(),
    form.field("methane_del13C", get_second("methane_del13C")).trim().entityEncode().array(),
    form.field("microbial_biomass_FISH", get_second("microbial_biomass_FISH")).trim().entityEncode().array(),
    form.field("microbial_biomass_avg_cell_number", get_second("microbial_biomass_avg_cell_number")).trim().entityEncode().array(),
    form.field("microbial_biomass_intactpolarlipid", get_second("microbial_biomass_intactpolarlipid")).trim().entityEncode().array(),
    form.field("microbial_biomass_microscopic", get_second("microbial_biomass_microscopic")).trim().entityEncode().array(),
    form.field("microbial_biomass_platecounts", get_second("microbial_biomass_platecounts")).trim().entityEncode().array(),
    form.field("microbial_biomass_qPCR", get_second("microbial_biomass_qPCR")).trim().entityEncode().array(),
    form.field("nitrate", get_second("nitrate")).trim().entityEncode().array(),
    form.field("nitrite", get_second("nitrite")).trim().entityEncode().array(),
    form.field("nitrogen_tot", get_second("nitrogen_tot")).trim().entityEncode().array(),
    form.field("noble_gas_chemistry", get_second("noble_gas_chemistry")).trim().entityEncode().array(),
    form.field("org_carb_nitro_ratio", get_second("org_carb_nitro_ratio")).trim().entityEncode().array(),
    form.field("pH", get_second("pH")).trim().entityEncode().array().required(),
    form.field("part_org_carbon_del13C", get_second("part_org_carbon_del13C")).trim().entityEncode().array(),
    form.field("phosphate", get_second("phosphate")).trim().entityEncode().array(),
    form.field("pi_email", get_second("pi_email")).trim().isEmail().required().entityEncode(),
    form.field("pi_name", get_second("pi_name")).trim().required().entityEncode().is(/^[a-zA-Z- ]+$/),
    form.field("plate_counts", get_second("plate_counts")).trim().entityEncode().array(),
    form.field("porosity", get_second("porosity")).trim().entityEncode().array(),
    form.field("potassium", get_second("potassium")).trim().entityEncode().array(),
    form.field("pressure", get_second("pressure")).trim().entityEncode().array(),
    form.field("project", get_second("project")).trim().entityEncode().array().required(),
    form.field("project_abstract", get_second("project_abstract")).trim().required().entityEncode(),
    form.field("project_title", get_second("project_title")).trim().required().entityEncode().is(/^[a-zA-Z0-9,_ -]+$/),
    form.field("redox_potential", get_second("redox_potential")).trim().entityEncode().array(),
    form.field("redox_state", get_second("redox_state")).trim().entityEncode().array().required(),
    form.field("references", get_second("references")).trim().entityEncode().array(),
    form.field("resistivity", get_second("resistivity")).trim().entityEncode().array(),
    form.field("reverse_primer", get_second("reverse_primer")).trim().entityEncode().array().required(),
    form.field("rock_age", get_second("rock_age")).trim().entityEncode().array(),
    form.field("run", get_second("run")).trim().entityEncode().array().required(),
    form.field("salinity", get_second("salinity")).trim().entityEncode().array(),
    form.field("samp_store_dur", get_second("samp_store_dur")).trim().entityEncode().array(),
    form.field("samp_store_temp", get_second("samp_store_temp")).trim().entityEncode().array(),
    form.field("sample_name", get_second("sample_name")).trim().entityEncode().array().required(),
    form.field("sample_size_mass", get_second("sample_size_mass")).trim().entityEncode().array(),
    form.field("sample_size_vol", get_second("sample_size_vol")).trim().entityEncode().array(),
    form.field("sample_type", get_second("sample_type")).trim().entityEncode().array().required().custom(env_items_validation),
    form.field("sequencing_meth", get_second("sequencing_meth")).trim().entityEncode().array().required(),
    form.field("sodium", get_second("sodium")).trim().entityEncode().array(),
    form.field("sulfate", get_second("sulfate")).trim().entityEncode().array(),
    form.field("sulfide", get_second("sulfide")).trim().entityEncode().array(),
    form.field("sulfur_tot", get_second("sulfur_tot")).trim().entityEncode().array(),
    form.field("target_gene", get_second("target_gene")).trim().entityEncode().array().required(),
    form.field("temperature", get_second("temperature")).trim().entityEncode().array().required(),
    form.field("tot_carb", get_second("tot_carb")).trim().entityEncode().array(),
    form.field("tot_depth_water_col", get_second("tot_depth_water_col")).trim().entityEncode().array(),
    form.field("tot_inorg_carb", get_second("tot_inorg_carb")).trim().entityEncode().array(),
    form.field("tot_org_carb", get_second("tot_org_carb")).trim().entityEncode().array(),
    form.field("trace_element_geochem", get_second("trace_element_geochem")).trim().entityEncode().array(),
    form.field("water_age", get_second("water_age")).trim().entityEncode().array()
  ),
  function (req, res) {
    console.time("TIME: post metadata_upload");
    if (!req.form.isValid) {
      console.log('in post /metadata_upload, !req.form.isValid');
      req.flash("fail", req.form.errors);
      editMetadataForm(req, res);
      //TODO: remove make_csv from here, use only if valid.
      make_csv(req, res);
    }
    else {
      console.log('in post /metadata_upload');
      console.time("TIME: saveMetadata");
      saveMetadata(req, res);
      console.timeEnd("TIME: saveMetadata");
      res.redirect("/user_data/your_projects");
    }
    console.timeEnd("TIME: post metadata_upload");

  });

function editMetadataForm(req, res){
  console.time("TIME: editMetadataForm");

  console.log('in editMetadataForm');
  // console.log(req);

  var edit_metadata_address = "metadata/metadata_upload_from_file";
  // console.log("AAA2 edit_metadata_address = 'metadata/metadata_upload_from_file'");
  //
  // console.log("XXX1 all_metadata: req.form");
  // console.log(req.form);
  //
  // console.log("XXX2 req.body.project_id");
  // console.log(req.body.project_id);
  // console.log(pid);

  var new_row_info_arr_err = collect_new_row(req);
  var new_row_info_arr = new_row_info_arr_err[0];
  req = new_row_info_arr_err[1];


  // console.log("FFF new_row_info_arr");
  // console.log(new_row_info_arr);
  // [ { col1__units1: [ '', 'r1c2', '', '', '', '', '', '' ] },
  //   { col2__units2: [ 'r2c1', 'r2c2', '', '', '', '', '', '' ] },
  //   { col3__: [ 'r3c1', 'r2c3', '', '', '', '', '', '' ] } ]
  // [ { 'Column name 1,units in row 1': [ 'cell 1 row 1', 'row1 cell 2', '', '', '', '', '', '' ] },
  //   { ',': [ '', '', '', '', '', '', '', '' ] } ]

  //TODO: move to add_new_fields_to_all function
  var metadata_form = req.form;
  var all_field_names = CONSTS.ORDERED_METADATA_NAMES;
  var result_it = "";

  for (var a1 in new_row_info_arr) {
    // new_row_info_arr[a1]
    // { 'Column name 1,units in row 1': [ 'cell 1 row 1', 'row1 cell 2', '', '', '', '', '', '' ] }
    var row_field_name = "new_row" + a1;

    for (var key in new_row_info_arr[a1]) {
      if( new_row_info_arr[a1].hasOwnProperty(key) ) {
        // result_it += 'key = ' + key + " , val = " + new_row_info_arr[a1][key] + "\n";
        // console.log(Array.isArray(new_row_info_arr[a1][key]));
        /*
         * Array.isArray(variable) =
         true
         key = Column name 1,units in row 1 , val = cell 1 row 1,row1 cell 2,,,,,,
         * */
        metadata_form[row_field_name] = new_row_info_arr[a1][key];
        // TODO: change "new_row" + a1 to a  database field name
        var key_arr;
        key_arr = key.split(",");

        var curr_header = key_arr[0];
        var curr_units = key_arr[1];
        all_field_names.push([row_field_name, curr_header + " (" + curr_units +")", "", curr_units]);
        // ["enzyme_activities","enzyme activities (key findings)","", ""],

      }
    }
  }

  metadata_form.pi_name = PROJECT_INFORMATION_BY_PID[pid].first + " " + PROJECT_INFORMATION_BY_PID[pid].last;
  metadata_form.pi_email = PROJECT_INFORMATION_BY_PID[pid].email;
  metadata_form.project_title = PROJECT_INFORMATION_BY_PID[pid].title;

  var all_metadata = {};
  all_metadata[pid] = metadata_form;

  console.log("XXX3 all_metadata");
  console.log(all_metadata);

  var project = all_metadata[pid]["project"][0];
  var abstract_data = get_project_abstract_data(project, req);
  var project_prefix = get_project_prefix(project);

  res.render('metadata/metadata_upload_from_file', {
    title: 'VAMPS: Metadata_upload',
    user: req.user,
    hostname: req.CONFIG.hostname,
    abstract_data_pr: abstract_data[project_prefix],
    all_metadata: all_metadata,
    all_field_names: all_field_names,
    dividers: CONSTS.ORDERED_METADATA_DIVIDERS,
    dna_extraction_options: CONSTS.MY_DNA_EXTRACTION_METH_OPTIONS,
    dna_quantitation_options: CONSTS.DNA_QUANTITATION_OPTIONS,
    biome_primary_options: CONSTS.BIOME_PRIMARY,
    feature_primary_options: CONSTS.FEATURE_PRIMARY,
    material_primary_options: CONSTS.MATERIAL_PRIMARY,
    metadata_form_required_fields: CONSTS.METADATA_FORM_REQUIRED_FIELDS,
    env_package_options: CONSTS.DCO_ENVIRONMENTAL_PACKAGES,
    investigation_type_options: CONSTS.INVESTIGATION_TYPE,
    sample_type_options: CONSTS.SAMPLE_TYPE,
    new_row_info_arr: new_row_info_arr
  });
  console.timeEnd("TIME: editMetadataForm");
}


//TODO: benchmark
function get_second(element) {
  console.time("TIME: get_second");

  for (var met_names_row in CONSTS.ORDERED_METADATA_NAMES)
  {
    if (CONSTS.ORDERED_METADATA_NAMES[met_names_row].includes(element))
    {
      // console.log("ETET met_names_row[1]");
      // console.log(CONSTS.ORDERED_METADATA_NAMES[met_names_row][1]);
      return CONSTS.ORDERED_METADATA_NAMES[met_names_row][1];
    }
  }
  console.timeEnd("TIME: get_second");

}


// http://stackoverflow.com/questions/10706588/how-do-i-repopulate-form-fields-after-validation-errors-with-express-form


// function NewMetadata(req, res, id){ /* fetch or create logic, storing as req.model or req.metadata */}


// function loadMetadata(req, res, id){ /* fetch or create logic, storing as req.model or req.metadata */}

// function editMetadataFromFile(req, res){ /* render logic */ }

function saveMetadata(req, res){
  console.time("TIME: saveMetadata");

  if(!req.form.isValid){
        // TODO: remove here, should be after validation only
        make_csv(req, res);
        editMetadata(req, res);
    }else{
        make_csv(req, res);
        saveToDb(req.metadata);
        // TODO: change
        res.redirect("/metadata"+req.metadata.id+"/edit");
    }
  console.timeEnd("TIME: saveMetadata");

}

function make_empty_arrays(all_metadata, pid) {
  console.time("TIME: 4) make_empty_arrays");

  for (var dataset_id in AllMetadata) {

    console.time("TIME: 41) dataset_id.keys");

    var all_keys = Object.keys(AllMetadata[dataset_id]);

    for (var k1 = 0; k1 < all_keys.length; k1++ ) {
      var key_name1 = all_keys[k1];
      all_metadata[pid][key_name1] = [];
    }
    console.timeEnd("TIME: 41) dataset_id.keys");

  }

  console.time("TIME: 42) CONSTS.REQ_METADATA_FIELDS_wIDs");

  for (var i = 0, len = CONSTS.REQ_METADATA_FIELDS_wIDs.length; i < len; i++) {
    var key_name2 = CONSTS.REQ_METADATA_FIELDS_wIDs[i];
    all_metadata[pid][key_name2] = [];
  }

  console.timeEnd("TIME: 42) CONSTS.REQ_METADATA_FIELDS_wIDs");

  console.timeEnd("TIME: 4) make_empty_arrays");

  return all_metadata;
}

function populate_metadata_hash(rows, pid, all_metadata) {
  console.time("TIME: 3) populate_metadata_hash");

  // all_metadata[pid]["dataset_ids"] = {}
  all_metadata[pid]["dataset_id"] = [];
  all_metadata[pid]["dataset"] = [];
  all_metadata[pid]["dataset_description"] = [];

  // console.log("PPP1 populate_metadata_hash: ");
  make_empty_arrays(all_metadata, pid);

  // console.log("PPP2 all_metadata");
  // console.log(all_metadata);

  for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      /*
      console.log("WWW row");
      console.log(row);
      TextRow {
        project: 'DCO_GAI_Bv3v5',
        title: 'Icelandic Volcanic Lake',
        did: 4312,
        pid: 47,
        dataset: 'S1',
        dataset_description: 'NULL',
        username: 'gaidos',
        email: 'gaidos@hawaii.edu',
        institution: 'University of Hawaii',
        first_name: 'Eric',
        last_name: 'Gaidos',
        owner_user_id: 54,
        public: 0 }

{
      dataset_id: [ "4312", "4313", "4314", "4315", "4316", "4317", "4318", "4319" ],
  project_title: [ "Icelandic Volcanic Lake" ],
  collection_date:
   [ "2007-06-01",
     "2007-06-01",
     "2007-06-01",
     "2007-06-01",
     "2007-06-01",
     "2007-06-01",
     "2007-06-01",
     "2008-10-11" ],


      */
      var dataset_id = row.did;
    // console.log('PPP3 from populate_metadata_hash row');
    // console.log(row);

      all_metadata[pid]["project"]     = row.project;
      all_metadata[pid]["project_title"] = row.title;
      all_metadata[pid]["username"]    = row.username;
      all_metadata[pid]["pi_name"]     = row.first_name + " " + row.last_name;
      all_metadata[pid]["pi_email"]    = row.email;
      all_metadata[pid]["institution"] = row.institution;
      all_metadata[pid]["first_name"]  = row.first_name;
      all_metadata[pid]["last_name"]   = row.last_name;
      all_metadata[pid]["public"]      = row.public;
      // console.log("AllMetadata[dataset_id]");
      // console.log(AllMetadata[dataset_id]);
      all_metadata[pid]["dataset_id"].push(row.did);
      all_metadata[pid]["dataset"].push(row.dataset);
      all_metadata[pid]["dataset_description"].push(row.dataset_description);

      /*
      console.log("AllMetadata[dataset_id]");
      console.log(AllMetadata[dataset_id]);
  sodium: '30.65',
  collection_date: '2007-06-01',
      */

    var all_metadata_keys_hash = Object.keys(AllMetadata[dataset_id]);

    all_metadata[pid] = add_all_val_by_key(all_metadata_keys_hash, AllMetadata[dataset_id], all_metadata[pid]);

    all_metadata[pid] = add_all_val_by_key(CONSTS.REQ_METADATA_FIELDS_wIDs, AllMetadata[dataset_id], all_metadata[pid]);

  }
  console.timeEnd("TIME: 3) populate_metadata_hash");

  return all_metadata;
}

function add_all_val_by_key(my_key_hash, my_val_hash, res_hash) {
  console.time("TIME: 5) add_all_val_by_key");

  for (var i1 = 0, len1 = my_key_hash.length; i1 < len1; i1++) {
    var key = my_key_hash[i1];
    var val = my_val_hash[key];
    // if (!(res_hash.hasOwnProperty(key))) {
    //   res_hash[key] = [];
    // }
    res_hash[key].push(val);
  }
  console.timeEnd("TIME: 5) add_all_val_by_key");
  return res_hash;
}

function get_all_field_names(all_metadata) {
  console.time("TIME: get_all_field_names");

  var all_field_names = [];
  for (var pid in all_metadata) {
    for (var did in all_metadata[pid]) {
      for (var d_info in all_metadata[pid][did]) {
        all_field_names.push(d_info);
      }
    }
  }
  console.timeEnd("TIME: get_all_field_names");

  return all_field_names;
}

function get_project_abstract_data(project, req)
{
  var info_file = '';
  var abstract_data = {};
  if (project.substring(0,3) === 'DCO'){
    info_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS, 'abstracts', 'DCO_info.json');
    abstract_data = JSON.parse(fs.readFileSync(info_file, 'utf8'));
  }

  return abstract_data;
}

// TODO: move to helpers, use here and for project_profile
function get_project_prefix(project) {
  console.time("TIME: get_project_prefix");
  var project_parts = project.split('_');
  var project_prefix = project;
  if(project_parts.length >= 2 ){
    project_prefix = project_parts[0] + '_' + project_parts[1];
  }
  console.timeEnd("TIME: get_project_prefix");
  return project_prefix;
}

function env_items_validation(value) {
  if (value === "Please choose one") {
      throw new Error("%s is required. Please choose one value from the dropdown menu");
  }
}

function make_csv(req, res) {
  var out_csv_file_name;
  console.time("TIME: make_csv");

  //TODO: check where it is called from
  console.log("MMM make_csv: form_values");
  input = req.form;

  var csv = convertArrayOfObjectsToCSV({
    data: req.form
  });

  project = req.form["project"];

  // out_csv_file_names = makeFileName(req, project);

  // for (var f = 0; f < out_csv_file_names.length; f++) {
  //   out_csv_file_name = out_csv_file_names[f];
  //
  //   fs.writeFile(out_csv_file_name, csv, function (err) {
  //     if (err) throw err;
  //   });
  // }
  var rando = helpers.getRandomInt(10000, 99999);

  out_csv_file_name = path.join(config.USER_FILES_BASE, req.user.username, "metadata-project" + '_' + project + '_' + rando.toString() + ".csv");
  console.log("OOO out_csv_file_name");
  console.log(out_csv_file_name);

  fs.writeFile(out_csv_file_name, csv, function (err) {
    if (err) throw err;
  });

  console.log('file ' + out_csv_file_name + ' saved');

  console.timeEnd("TIME: make_csv");
}

// function makeFileName(req, project) {
//   console.time("TIME: makeFileName");
//
//   var rando = helpers.getRandomInt(10000, 99999);
//
//   file_name1 = path.join(config.USER_FILES_BASE, req.user.username, "metadata-" + rando.toString() + '_' + project + ".csv");
//   file_name2 = path.join(config.USER_METADATA, "metadata-" + rando.toString() + '_' + req.user.username + '_' + project + ".csv");
//
//   console.timeEnd("TIME: makeFileName");
//   return [file_name1, file_name2];
// }

function convertArrayOfObjectsToCSV(args) {
  console.time("TIME: convertArrayOfObjectsToCSV");

  var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data === null) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    headers = data['dataset'];
    headers_length = headers.length;

    // first line = datasets
    result = ' ';
    result += columnDelimiter;
    result += headers.join(columnDelimiter);
    result += lineDelimiter;

    // TODO: get keys from an array of what to save (not dataset_id, for example)
    for (var key in data) {
        item = data[key];

        result += key;
        result += columnDelimiter;

        if (typeof item === "object") {
            result += item.join(columnDelimiter);
        } else if (typeof item === "string") {
            for(i = 0; i < headers_length; i++) {
                result += item;
                result += columnDelimiter;
            }
        }
        result += lineDelimiter;
    }

    // console.log("CCC3 convertArrayOfObjectsToCSV result");
    // console.log(result);
  console.timeEnd("TIME: convertArrayOfObjectsToCSV");

  return result;
}

function new_row_val_validation(req, field_name) {
  console.time("TIME: new_row_val_validation");
  var field_val = req.body[field_name];

  // console.log("validator isEmpty");
  // console.log("field_name");
  // console.log(field_name);

  // console.log("XXX1 field_val");
  // console.log(field_val);
  var field_val_trimmed = validator.escape(field_val + "");
  // console.log("XXX2 field_val_trimmed");
  // console.log(field_val_trimmed);
  field_val_trimmed = validator.trim(field_val_trimmed + "");
  // console.log("XXX3 field_val_trimmed");
  // console.log(field_val_trimmed);
  var field_val_not_valid = validator.isEmpty(field_val_trimmed + "");
  // console.log("XXX4 field_val_not_valid");
  // console.log(field_val_not_valid);

  rrr = req.checkBody(field_name)
    .notEmpty().withMessage('User added field "' + field_name + '" must be not empty')
    .isAlphanumeric().withMessage('User added field "' + field_name + '" must have alphanumeric characters only')
    .isAscii();
  // console.log("rrr");
  // console.log(rrr);
  // ValidatorChain {
  //   errorFormatter: [Function: errorFormatter],
  //   param: 'Units3',
  //     value: '',
  //     validationErrors:
  //   [ { param: 'Units3', msg: 'Users must be an array', value: '' },
  //     { param: 'Units3', msg: 'Users must be an array', value: '' },
  //     { param: 'Units3', msg: 'Users must be an array', value: '' } ],

  // isAlphanumeric
  // isAscii
  // stripLow
  // console.log(field_val_trimmed);

  var errors = req.validationErrors();
  // console.log("VVV validationErrors");
  // console.log(errors);
/*
* VVV validationErrors
 [ { param: 'Units3',
 msg: 'User added field "Units3" must be not empty',
 value: '' },
 { param: 'Units3',
 msg: 'User added field "Units3" must have alphanumeric characters only',
 value: '' },
 { param: 'Units3', msg: 'Invalid value', value: '' } ]
* */

  if (field_val_not_valid)
  {
    console.log("ERRRR");
    return [true, field_val_trimmed];
  }
  else
  {
    console.log("OK");
    return [false, field_val_trimmed];
  }
  console.timeEnd("TIME: new_row_val_validation");

}

function make_new_row_hash(req, new_row_info_arr, column_name_field_val_trimmed, units_field_val_trimmed, row_idx) {
  console.time("TIME: make_new_row_hash");

  var new_row_length = req.body.new_row_length;
  var new_row_head_arr = [column_name_field_val_trimmed, units_field_val_trimmed];

        // column_name_field_val_trimmed + " (" + units_field_val_trimmed + ")";
  var new_row_info = {};

  new_row_info[new_row_head_arr] = [];

  for (var cell_idx = 0; cell_idx < parseInt(new_row_length); cell_idx++) {

    var cell_name = "new_row" + row_idx.toString() + "cell" + cell_idx.toString();
    // console.log("CCC cell_name");
    // console.log(cell_name);
    //
    // console.log("LLL req.body[cell_name]");
    // console.log(req.body[cell_name]);

    var clean_val = validator.escape(req.body[cell_name] + "");
    clean_val = validator.trim(clean_val + "");
    new_row_info[new_row_head_arr].push(clean_val);
  }
  // console.log("WWW new_row_info");
  // console.log(new_row_info);

  new_row_info_arr.push(new_row_info);
  // { col2__units2: [ 'r2c1', 'r2c2', '', '', '', '', '', '' ] }

  // new_row1cell4
  //new_row
  console.timeEnd("TIME: make_new_row_hash");

  return new_row_info_arr;
}


function collect_new_row(req) {
  console.time("TIME: collect_new_row");

  // var sanitizeHtml = require('sanitize-html');

  var new_row_info_arr = [];

  // console.log("new_row_num11");
  var new_row_num = req.body.new_row_num;

  // console.log(new_row_num);
  //
  // console.log("new_row_length 111");
  // console.log(new_row_length);

  for (var row_idx = 1; row_idx < parseInt(new_row_num) + 1; row_idx++) {
    // console.log("row_idx");
    // console.log(row_idx);

    var units_field_name = "Units" + row_idx;
    var column_name_field_name = "Column Name" + row_idx;


    var col_val_res = [];
    col_val_res = new_row_val_validation(req, column_name_field_name);
    if (col_val_res[0]) {
      req.form.errors.push(column_name_field_name + ' should be not empty');
      continue;
    }
    else {
      var column_name_field_val_trimmed = col_val_res[1];
    }

    var units_val_res = [];
    units_val_res = new_row_val_validation(req, units_field_name);
    if (units_val_res[0]) {
      req.form.errors.push(units_field_name + ' should be not empty');
      continue;
    }
    else {
      var units_field_val_trimmed = units_val_res[1];
    }

    // console.log("column_name_field_val_trimmed");
    //
    // console.log(column_name_field_val_trimmed);
    // console.log("QQQ req.form.errors");
    // console.log(req.form.errors);


    make_new_row_hash(req, new_row_info_arr, column_name_field_val_trimmed, units_field_val_trimmed, row_idx);

    // row = 0 row = {"Column name 1,units in row 1":["cell 1 row 1","row1 cell 2","","","","","",""]} row = 1 row = {",":["","","","","","","",""]}

  }

  console.timeEnd("TIME: collect_new_row");
  return [new_row_info_arr, req];
}

// ---- metadata_upload end ----

