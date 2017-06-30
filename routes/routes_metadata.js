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
// var expressValidator = require('express-validator');

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
  // console.log("ALLL1 AllMetadata = ");
  // console.log(AllMetadata);

  var pid = req.body.project_id;
  var all_metadata = {};
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

        //TODO: do once here and keep with form
        var project = all_metadata[pid]["project"];
        var abstract_data  = get_project_abstract_data(project, req);
        var project_prefix = get_project_prefix(project);

        // console.log("DDD forward_primer_seqs");
        // console.log(JSON.stringify(forward_primer_seqs));
        //
        // console.log("DDD reverse_primer_seqs");
        // console.log(JSON.stringify(reverse_primer_seqs));
        //
        // DDD forward_primer_seqs
        // "CCTACGGGAGGCAGCAG, CCTACGGG.GGC[AT]GCAG, TCTACGGAAGGCTGCAG"
        // DDD reverse_primer_seqs
        // "GGATTAG.TACCC"
        //
        all_field_names = CONSTS.ORDERED_METADATA_NAMES;
        res.render("metadata/metadata_upload_from_file", {
          title: "VAMPS: Metadata_upload",
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
          sample_type_options: CONSTS.SAMPLE_TYPE
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
      editMetadataForm(req, res);
      //TODO: remove make_csv from here, use only if valid.
      make_csv(req, res);
    }
    else {
      console.log('in post /metadata_upload');
      saveMetadata(req, res);
      res.redirect("/user_data/your_projects");
    }
    console.timeEnd("TIME: post metadata_upload");

  });

function editMetadataForm(req, res){
  console.time("TIME: editMetadataForm");

  console.log('in editMetadataForm');

  // var edit_metadata_address = "metadata/metadata_upload_from_file";

  //TODO: move! so the new fields stay after reload
  // var all_field_names = CONSTS.ORDERED_METADATA_NAMES;

  // console.log("FFF1 req.body");
  // console.log(req.body);

  var req_all_field_names = collect_new_rows(req, all_field_names);
  req = req_all_field_names[0];

  // console.log("FFF2 req.body");
  // console.log(req.body);

  all_field_names = req_all_field_names[1];
  // console.log("WWW req.form.errors");
  // console.log(req.form.errors);
  var all_field_names_from_body = Object.keys(req.body);
  // console.log("WWW all_field_names_from_body");
  // console.log(JSON.stringify(all_field_names_from_body));
  //
  // console.log("WWW1 all_field_names");
  // console.log(JSON.stringify(all_field_names));

  var myArray_fail = helpers.unique_array(req.form.errors);
  myArray_fail.sort();

  req.flash("fail", myArray_fail);

  var pid = req.body.project_id;

  req.form.pi_name = PROJECT_INFORMATION_BY_PID[pid].first + " " + PROJECT_INFORMATION_BY_PID[pid].last;
  req.form.pi_email = PROJECT_INFORMATION_BY_PID[pid].email;
  req.form.project_title = PROJECT_INFORMATION_BY_PID[pid].title;
  // req.form.forward_primer =

  // console.log("FFF2 req.form");
  // console.log(req.form);
  var all_metadata = {};
  all_metadata[pid] = req.form;

  // console.log("XXX3 all_metadata");
  // console.log(all_metadata);

  var project = all_metadata[pid]["project"][0];
  var abstract_data  = get_project_abstract_data(project, req);
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
    sample_type_options: CONSTS.SAMPLE_TYPE
  });
  console.timeEnd("TIME: editMetadataForm");
}

function get_primers_info(dataset_id) {
  console.time("TIME: get_primers_info");

  var primer_suite_id = AllMetadata[dataset_id]["primer_suite_id"];
  var primer_info = {};
  for (var i = 0; i < MD_PRIMER_SUITE[primer_suite_id].primer.length; i++) {

    var curr_direction = MD_PRIMER_SUITE[primer_suite_id].primer[i].direction;

    if (typeof primer_info[curr_direction] === 'undefined' || primer_info[curr_direction].length === 0) {
      primer_info[curr_direction] = [];
    }

    primer_info[curr_direction].push(MD_PRIMER_SUITE[primer_suite_id].primer[i].sequence);
  }
  console.log("DDD primer_info");
  console.log(JSON.stringify(primer_info));
  // {"F":["CCTACGGGAGGCAGCAG","CCTACGGG.GGC[AT]GCAG","TCTACGGAAGGCTGCAG"],"R":["GGATTAG.TACCC"]}

  console.timeEnd("TIME: get_primers_info");
  return primer_info;
  // return [forward_primer_seqs.join(', '), reverse_primer_seqs.join(', ')];
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

function populate_metadata_hash(rows, pid, all_metadata) {
  console.time("TIME: 3) populate_metadata_hash");

  all_metadata[pid]["dataset_id"] = [];
  all_metadata[pid]["dataset"] = [];
  all_metadata[pid]["dataset_description"] = [];

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];

    var dataset_id = row.did;

    all_metadata[pid]["project"]     = row.project;
    all_metadata[pid]["project_title"] = row.title;
    all_metadata[pid]["username"]    = row.username;
    all_metadata[pid]["pi_name"]     = row.first_name + " " + row.last_name;
    all_metadata[pid]["pi_email"]    = row.email;
    all_metadata[pid]["institution"] = row.institution;
    all_metadata[pid]["first_name"]  = row.first_name;
    all_metadata[pid]["last_name"]   = row.last_name;
    all_metadata[pid]["public"]      = row.public;
    all_metadata[pid]["dataset_id"].push(row.did);
    all_metadata[pid]["dataset"].push(row.dataset);
    all_metadata[pid]["dataset_description"].push(row.dataset_description);

    var primers_info_by_dataset_id = get_primers_info(row.did);
    // {"F":["CCTACGGGAGGCAGCAG","CCTACGGG.GGC[AT]GCAG","TCTACGGAAGGCTGCAG"],"R":["GGATTAG.TACCC"]}


    console.log("PPP AllMetadata[dataset_id].forward_primer");
    console.log(AllMetadata[dataset_id]["forward_primer"]);

    AllMetadata[dataset_id]["forward_primer"] = primers_info_by_dataset_id['F'];
    AllMetadata[dataset_id]["reverse_primer"] = primers_info_by_dataset_id['R'];

    console.log("PPP1 AllMetadata[dataset_id].forward_primer");
    console.log(AllMetadata[dataset_id]["forward_primer"]);

    var all_metadata_keys_hash = Object.keys(AllMetadata[dataset_id]);
    var ids_data = get_all_req_metadata(dataset_id);

    all_metadata[pid] = add_all_val_by_key(all_metadata_keys_hash, AllMetadata[dataset_id], all_metadata[pid]);

    all_metadata[pid] = add_all_val_by_key(CONSTS.REQ_METADATA_FIELDS_wIDs, ids_data, all_metadata[pid]);

  }
  console.timeEnd("TIME: 3) populate_metadata_hash");
  console.log("XXX all_metadata");
  console.log(all_metadata);
  return all_metadata;
}


function get_all_req_metadata(dataset_id) {
  console.time("TIME: 5) get_all_req_metadata");

  var data = {};
  for (var idx = 0; idx < CONSTS.REQ_METADATA_FIELDS_wIDs.length; idx++) {
    var key  = CONSTS.REQ_METADATA_FIELDS_wIDs[idx];
    data[key] = [];
    var val_hash = helpers.required_metadata_names_from_ids(AllMetadata[dataset_id], key + "_id");

    data[key].push(val_hash.value);
  }
  console.time("TIME: 5) get_all_req_metadata");

  return data;
}


function add_all_val_by_key(my_key_hash, my_val_hash, all_metadata_pid) {
  console.time("TIME: 6) add_all_val_by_key");

  for (var i1 = 0, len1 = my_key_hash.length; i1 < len1; i1++) {
    var key = my_key_hash[i1];
    var val = my_val_hash[key];

    console.log("KKK1 key");
    console.log(JSON.stringify(key));

    console.log("KKK2 val");
    console.log(JSON.stringify(val));
    
    if (!(all_metadata_pid.hasOwnProperty(key))) {
      all_metadata_pid[key] = [];
    }
    all_metadata_pid[key].push(val);

  }
  console.timeEnd("TIME: 6) add_all_val_by_key");
  return all_metadata_pid;
}

// function get_all_field_names(all_metadata) {
//   console.time("TIME: get_all_field_names");
//
//   var all_field_names = [];
//   for (var pid in all_metadata) {
//     for (var did in all_metadata[pid]) {
//       for (var d_info in all_metadata[pid][did]) {
//         all_field_names.push(d_info);
//       }
//     }
//   }
//   console.timeEnd("TIME: get_all_field_names");
//
//   return all_field_names;
// }

function get_project_abstract_data(project, req)
{
  console.time("TIME: get_project_abstract_data");
  var info_file = '';
  var abstract_data = {};
  if (project.substring(0,3) === 'DCO'){
    info_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS, 'abstracts', 'DCO_info.json');
    abstract_data = JSON.parse(fs.readFileSync(info_file, 'utf8'));
  }
  console.timeEnd("TIME: get_project_abstract_data");
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

function make_csv(req) {
  var out_csv_file_name;
  console.time("TIME: make_csv");

  //TODO: check where it is called from
  console.log("MMM make_csv: form_values");

  var csv = convertArrayOfObjectsToCSV({
    data: req.form
  });

  project = req.form["project"];

  var rando = helpers.getRandomInt(10000, 99999);

  out_csv_file_name = path.join(config.USER_FILES_BASE, req.user.username, "metadata-project" + '_' + project + '_' + rando.toString() + ".csv");

  fs.writeFile(out_csv_file_name, csv, function (err) {
    if (err) throw err;
  });

  console.log('file ' + out_csv_file_name + ' saved');

  console.timeEnd("TIME: make_csv");
}

function convertArrayOfObjectsToCSV(args) {
  console.time("TIME: convertArrayOfObjectsToCSV");

  var result, columnDelimiter, lineDelimiter, data, headers, headers_length;

    data = args.data || null;
    if (data === null) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    headers = data['dataset'];
    headers_length = data['dataset'].length;

    // first line = datasets
    result = ' ';
    result += columnDelimiter;
    result += headers.join(columnDelimiter);
    result += lineDelimiter;

    // TODO: get keys from an array of what to save (not dataset_id, for example)
    for (var key in data) {
        var item = data[key];

        result += key;
        result += columnDelimiter;

        if (typeof item === "object") {
            result += item.join(columnDelimiter);
        } else if (typeof item === "string") {
            for(var i = 0; i < headers_length; i++) {
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

function new_row_field_validation(req, field_name) {
  console.time("TIME: new_row_field_validation");
  var err_msg = '';

  //todo: send a value instead of "req.body[field_name]"?
  var field_val_trimmed = validator.escape(req.body[field_name] + "");
  field_val_trimmed = validator.trim(field_val_trimmed + "");
  var field_val_not_valid = validator.isEmpty(field_val_trimmed + "");

  if (field_val_not_valid) {
    console.log("ERROR: an empty user's " + field_name);
    err_msg = 'User added field "' + field_name + '" must be not empty and have only alpha numeric characters';
    req.form.errors.push(err_msg);
  }

  console.timeEnd("TIME: new_row_field_validation");
  return field_val_trimmed;
}

function get_column_name(row_idx, req) {
  console.time("TIME: get_column_name");

  var units_field_name  = new_row_field_validation(req, "Units" + row_idx);
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
}

function get_cell_val_by_row(row_idx, req) {
  console.time("TIME: get_cell_val_by_row");
  var new_row_length = req.body.new_row_length;
  var new_row_val = [];

  for (var cell_idx = 0; cell_idx < parseInt(new_row_length); cell_idx++) {
    var cell_name = "new_row" + row_idx.toString() + "cell" + cell_idx.toString();
    var clean_val = validator.escape(req.body[cell_name] + "");
    clean_val = validator.trim(clean_val + "");

    new_row_val.push(clean_val);
  }
  console.timeEnd("TIME: get_cell_val_by_row");

  return new_row_val;
}

function getCol(matrix, col) {
  console.time("TIME: getCol");
  var column = [];
  for (var i=0; i < matrix.length; i++) {
    column.push(matrix[i][col]);
  }
  console.timeEnd("TIME: getCol");

  return column;
}

function isUnique(all_clean_field_names_arr, column_name) {
  return (all_clean_field_names_arr.indexOf(column_name) < 0);
}

// var array = [new Array(20), new Array(20), new Array(20)]; //..your 3x20 array
// getCol(array, 0); //Get first column

function collect_new_rows(req, all_field_names) {
  console.time("TIME: collect_new_rows");
  // var new_rows_hash = {};
  var new_row_num = req.body.new_row_num;
  var all_clean_field_names_arr = helpers.unique_array(getCol(all_field_names, 0));
  // console.log("JSON.stringify(unique_array.all_clean_field_names_arr)");
  // console.log(JSON.stringify(helpers.unique_array(all_clean_field_names_arr)));

  for (var row_idx = 1; row_idx < parseInt(new_row_num) + 1; row_idx++) {
    var column_n_unit_names = get_column_name(row_idx, req);

    if (column_n_unit_names) {

      var users_column_name = column_n_unit_names[0];
      var units_field_name  = column_n_unit_names[1];
      var column_name = users_column_name + ' (' + units_field_name + ')';
      var re = / /g;
      var clean_column_name = users_column_name.toLowerCase().replace(re, '_') + '_' + units_field_name.toLowerCase().replace(re, '_');


      if (column_name && isUnique(all_clean_field_names_arr, clean_column_name)) {
        // [ 'run', 'Sequencing run date', 'MBL Supplied', 'YYYY-MM-DD' ],
        all_field_names.push([clean_column_name, column_name, '', units_field_name]);
        req.form[clean_column_name] = [];
        req.form[clean_column_name] = get_cell_val_by_row(row_idx, req);
      }
    }
  }


  console.timeEnd("TIME: collect_new_rows");

  return [req, all_field_names];

}

// ---- metadata_upload end ----

