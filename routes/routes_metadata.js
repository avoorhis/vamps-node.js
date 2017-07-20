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


// function findByValueOfObject(arr, key, value) {
//   return arr.filter(function(item) {
//     return (item[key] === value);
//   });
// }



function get_project_name(edit_metadata_file) {
  console.time("TIME: get_project_prefix");
  // var edit_metadata_file = "metadata-project_DCO_GAI_Bv3v5_65982.csv";
  var edit_metadata_file_parts = edit_metadata_file.split('-')[1].split('_');
  // console.log("XXX edit_metadata_file_parts");
  // console.log(edit_metadata_file_parts);
  // [ 'project', 'DCO', 'GAI', 'Bv3v5', '31989.csv' ]
  var edit_metadata_project = "";
  if(edit_metadata_file_parts.length >= 4 ) {

    edit_metadata_project = edit_metadata_file_parts[1] + "_" + edit_metadata_file_parts[2] + "_" + edit_metadata_file_parts[3];
  }


  console.timeEnd("TIME: get_project_prefix");
  return edit_metadata_project;
}

function make_metadata_hash_from_file(req, res, file_name) {
  console.time("TIME: make_metadata_hash_from_file");
  //  TODO: DRY with make_metadata_hash


  console.log("EEE1 file_name");
  console.log(file_name);
  var project_name = get_project_name(file_name);
  var project_id_to_edit = PROJECT_INFORMATION_BY_PNAME[project_name]["pid"];

  var all_metadata = {};
  if (helpers.isInt(project_id_to_edit)) {
    // console.log("EEE2 project_id_to_edit");
    // console.log(project_id_to_edit);

    // add_data_to_all_metadata(req);

    all_metadata[project_id_to_edit] = {};
    var inputPath = path.join(config.USER_FILES_BASE, req.user.username, file_name);

    var file_content = fs.readFileSync(inputPath);
    var parse_sync = require('csv-parse/lib/sync');
    var data = parse_sync(file_content, {columns: true, trim: true});
    console.log("AAA7 data");
    console.log(data);

    for (var idx in data) {
      for (var key in data[idx]) {
        if (!(all_metadata[project_id_to_edit].hasOwnProperty(key))) {
          all_metadata[project_id_to_edit][key] = [];
        }
        all_metadata[project_id_to_edit][key].push(data[idx][key]);
      }
    }
    all_metadata[project_id_to_edit]["first_name"]  = data[0].first_name;
    all_metadata[project_id_to_edit]["institution"] = data[0].institution;
    all_metadata[project_id_to_edit]["last_name"]   = data[0].last_name;
    all_metadata[project_id_to_edit]["pi_email"]    = data[0].pi_email;
    all_metadata[project_id_to_edit]["pi_name"]     = data[0].first_name + " " + data[0].last_name;
    all_metadata[project_id_to_edit]["project"]     = data[0].project;
    all_metadata[project_id_to_edit]["project_title"] = data[0].project_title;
    all_metadata[project_id_to_edit]["public"]      = data[0].public;
    all_metadata[project_id_to_edit]["username"]    = data[0].username;
    //TODO: get!
    all_metadata[project_id_to_edit]["abstract_data_pr"] = [];

    return all_metadata;
  }
  else
  { // end if int
    console.log('ERROR pid is not an integer: ', project_id_to_edit);
  }

  console.timeEnd("TIME: make_metadata_hash_from_file");
}



router.post('/start_edit',
  [helpers.isLoggedIn],
  function (req, res) {

    console.time("TIME: 1) in post /start_edit");
    make_metadata_hash(req, res, req.body.project_id);

    console.timeEnd("TIME: 1) in post /start_edit");
  });

// TODO: rename
// todo: if there is req.form (or req.body?) use the result?
function make_metadata_hash(req, res, pid) {
  console.time("TIME: 2) make_metadata_hash");


  // var pid = req.body.project_id;
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
        // TODO: add to all_metadata
        var project = all_metadata[pid]["project"];

        // TODO: add to all_metadata
        var abstract_data  = get_project_abstract_data(project, req);
        var project_prefix = get_project_prefix(project);

        // console.log("XXX project_prefix");
        // console.log(project_prefix);
        //DCO_GAI

        render_edit_form(req, res, abstract_data[project_prefix], all_metadata, CONSTS.ORDERED_METADATA_NAMES);

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

  var all_field_names_with_new = collect_new_rows(req, CONSTS.ORDERED_METADATA_NAMES);

  var all_field_names_first_column = get_first_column(all_field_names_with_new, 0);

  // console.log("WWW1 all_field_names_first_column");
  // console.log(JSON.stringify(all_field_names_first_column));

  var myArray_fail = helpers.unique_array(req.form.errors);
  myArray_fail.sort();

  req.flash("fail", myArray_fail);

  var pid = req.body.project_id;

  req.form.pi_name = PROJECT_INFORMATION_BY_PID[pid].first + " " + PROJECT_INFORMATION_BY_PID[pid].last;
  req.form.pi_email = PROJECT_INFORMATION_BY_PID[pid].email;
  req.form.project_title = PROJECT_INFORMATION_BY_PID[pid].title;

  var all_metadata = {};

  var all_new_names = all_field_names_first_column.slice(all_field_names_first_column.indexOf("enzyme_activities") + 1);

  all_metadata[pid] = req.form;
  all_metadata[pid] = get_new_val(req, all_metadata[pid], all_new_names);

  // TODO: move to "add to all_metadata"
  var project = all_metadata[pid]["project"][0];
  var abstract_data  = get_project_abstract_data(project, req);
  var project_prefix = get_project_prefix(project);

  render_edit_form(req, res, abstract_data[project_prefix], all_metadata, all_field_names_with_new);

  console.timeEnd("TIME: editMetadataForm");
}

function get_new_val(req, all_metadata_pid, all_new_names) {
  var new_val = [];
  for (var new_name_idx in all_new_names) {
    var new_name = all_new_names[new_name_idx];
    if (new_name !== '')
    {
      new_val = req.body[new_name];
    }
    if (typeof new_val !== 'undefined' && new_val.length !== 0) {
      all_metadata_pid[new_name] = new_val;
    }
  }
  return all_metadata_pid;
}

function get_primers_info(dataset_id) {
  console.time("TIME: get_primers_info");
  var primer_suite_id = AllMetadata[dataset_id]["primer_suite_id"];
  var primer_info = {};

  if (typeof primer_suite_id === 'undefined' || typeof MD_PRIMER_SUITE[primer_suite_id] === 'undefined' || typeof MD_PRIMER_SUITE[primer_suite_id].primer === 'undefined' ) {
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

    AllMetadata[dataset_id]["forward_primer"] = primers_info_by_dataset_id['F'];
    AllMetadata[dataset_id]["reverse_primer"] = primers_info_by_dataset_id['R'];


    var all_metadata_keys_hash = Object.keys(AllMetadata[dataset_id]);
    var ids_data = get_all_req_metadata(dataset_id);


    all_metadata[pid] = add_all_val_by_key(all_metadata_keys_hash, AllMetadata[dataset_id], all_metadata[pid]);

    all_metadata[pid] = add_all_val_by_key(CONSTS.REQ_METADATA_FIELDS_wIDs, ids_data, all_metadata[pid]);

  }
  console.timeEnd("TIME: 3) populate_metadata_hash");
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
    
    if (!(all_metadata_pid.hasOwnProperty(key))) {
      all_metadata_pid[key] = [];
    }
    all_metadata_pid[key].push(val);

  }
  console.timeEnd("TIME: 6) add_all_val_by_key");
  return all_metadata_pid;
}


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
  // console.log("MMM make_csv: PROJECT_INFORMATION_BY_PID");
  // console.log(PROJECT_INFORMATION_BY_PID);
  // console.log("MMM1 make_csv: PROJECT_INFORMATION_BY_PNAME");
  // console.log(PROJECT_INFORMATION_BY_PNAME);


  var csv = convertArrayOfObjectsToCSV({
    data: req.form,
    user_info: req.user
  });

  var rando = helpers.getRandomInt(10000, 99999);

  out_csv_file_name = path.join(config.USER_FILES_BASE, req.user.username, "metadata-project" + '_' + data.project + '_' + rando.toString() + ".csv");

  fs.writeFile(out_csv_file_name, csv, function (err) {
    if (err) throw err;
  });

  console.log('file ' + out_csv_file_name + ' saved');

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

function transpose_2d_arr(my_hash) {
  console.time("TIME: transpose_2d_arr");
  var newArray = my_hash[0].map(function(col, i) {
    return my_hash.map(function(row) {
      return row[i];
    });
  });
  console.timeEnd("TIME: transpose_2d_arr");
  return newArray;
}

function get_project_info(project_name) {
  var project_info = PROJECT_INFORMATION_BY_PNAME[project_name];

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

function convertArrayOfObjectsToCSV(args) {
  console.time("TIME: convertArrayOfObjectsToCSV");

  var result, columnDelimiter, lineDelimiter, data, cellEscape, data_arr, transposed_data_arr, user_info, project_info;

  data = args.data || null;
  if (data === null) {
    return null;
  }

  user_info = args.user_info || null;
  if (user_info === null) {
    return null;
  }
  // console.log("DDD1 data.project[0]");
  // console.log(data.project[0]);

  var project_info_hash = get_project_info(data.project[0]);
  console.log("DDD project_info_hash");
  console.log(project_info_hash);

  data_arr = array_from_object(data);
  console.log("CCC1 convertArrayOfObjectsToCSV data_arr");
  console.log(data_arr);

  var dataset_length = data.dataset.length;

  for (var key in project_info_hash){

    var arr_temp = Array(dataset_length - 1);
    arr_temp.unshift(key);

    arr_temp.fill(project_info_hash[key], 1, dataset_length);
    // console.log("DDD7 arr_temp");
    // console.log(arr_temp);
    // console.log("DDD72 arr_temp.length === dataset_length");
    // console.log(arr_temp.length === dataset_length);

    data_arr.push(arr_temp);
  }
  /*
  * [ [ 'NPOC', '', '', '', '', '', '', '', '' ],
  [ 'access_point_type' ],
  *
  * */

  console.log("CCC11 convertArrayOfObjectsToCSV again data_arr");
  console.log(JSON.stringify(data_arr));

  transposed_data_arr = transpose_2d_arr(data_arr);
  // console.log("CCC2 convertArrayOfObjectsToCSV transposed_data_arr");
  // console.log(transposed_data_arr);

  columnDelimiter = args.columnDelimiter || ',';
  lineDelimiter = args.lineDelimiter || '\n';
  cellEscape = args.cellEscape || '"';

  result = '';
  transposed_data_arr.map(function(row) {
    // TODO: to a function?
    var r1 = row.map(function(item){
      // Wrap each element of the items array with quotes
      return cellEscape + item + cellEscape;
    }).join(columnDelimiter);

    result += r1;
    result += lineDelimiter;
  });

  // for (var key in project_info_hash) {
  //   cellEscape + item + cellEscape
  // }

   // TODO: get keys from an array of what to save (dataset_id, for example)


  console.log("CCC3 convertArrayOfObjectsToCSV result");
  console.log(result);
  //"NPOC","access_point_type","adapter_sequence",

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

function get_first_column(matrix, col) {
  console.time("TIME: get_first_column");
  var column = [];
  for (var i=0; i < matrix.length; i++) {
    column.push(matrix[i][col]);
  }
  console.timeEnd("TIME: get_first_column");

  return column;
}

function isUnique(all_clean_field_names_arr, column_name) {
  return (all_clean_field_names_arr.indexOf(column_name) < 0);
}

function collect_new_rows(req, all_field_names) {
  console.time("TIME: collect_new_rows");
  // var new_rows_hash = {};
  var new_row_num = req.body.new_row_num;
  var all_clean_field_names_arr = helpers.unique_array(get_first_column(all_field_names, 0));
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
      else if (! isUnique(all_clean_field_names_arr, clean_column_name)) {
        var err_msg = 'User added field with units "' + column_name + '" must be unique and have only alpha numeric characters';
        req.form.errors.push(err_msg);
      }
    }
  }


  console.timeEnd("TIME: collect_new_rows");

  return all_field_names;

}
// ---- metadata_upload 1 ----
// render new form
// ?? render_edit_form(req, res, {}, {}, all_field_names)

// render edit form
// TODO: abstract_data_project add to all_metadata
function render_edit_form(req, res, abstract_data_pr, all_metadata, all_field_names) {
  res.render("metadata/metadata_upload_from_file", {
    title: "VAMPS: Metadata_upload",
    user: req.user,
    hostname: req.CONFIG.hostname,
    abstract_data_pr: abstract_data_pr,
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

// create form from db
// create form from req.form
// create form from a csv file
// from form to a csv file
// from form to req form
// from a csv file to db
// from form to db ??

// if csv files: show a list and compare
router.get('/metadata_file_list', function(req, res) {
  console.time("TIME: get metadata_file_list");
  console.log('in metadata_file_list');
  var user_metadata_csv_files = get_csv_files(req);

  res.render('metadata/metadata_file_list', { title: 'VAMPS:Metadata',
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
    sorted_files = sorted_files_by_time(req);
    files_to_compare = sorted_files_to_compare(req, sorted_files);

    if (typeof req.body.compare !== 'undefined' && req.body.compare.length !== 0) {
      // TODO: check that there are exactly 2 files to compare
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

      var all_metadata = make_metadata_hash_from_file(req, res, req.body.edit_metadata_file);
      //TODO: DRY: use parts of make_metadata_hash

      render_edit_form(req, res, {}, all_metadata, CONSTS.ORDERED_METADATA_NAMES);

    }

    console.timeEnd("TIME: in post /metadata_files");
  });

function sorted_files_by_time(req) {
  console.time("sorted_files_by_time");
  var f_info = JSON.parse(req.body.file_info);
  var dir = path.join(config.USER_FILES_BASE, req.user.username);
  f_info.sort(function(a, b) {
    return fs.statSync(path.join(dir, a.filename)).mtime.getTime() -
      fs.statSync(path.join(dir, b.filename)).mtime.getTime();
  });

  console.timeEnd("sorted_files_by_time");
  return f_info;
}

function sorted_files_to_compare(req, sorted_files) {
  console.time("sorted_files_to_compare");

  var file_names_array = req.body.compare;
  var files = [];

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
  var coopy = require('coopyhx');
  var inputPath1 = path.join(config.USER_FILES_BASE, req.user.username, files[0]["filename"]);
  var inputPath2 = path.join(config.USER_FILES_BASE, req.user.username, files[1]["filename"]);

  console.log("PPP1 inputPath1");
  console.log(inputPath1);

  // TODO: check if exactly two names

  var columnDelimiter = ',';
  var lineDelimiter = '\n';
  var cellEscape = '"';

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
  var records1 = parse_sync(data1, {trim: true});
  var records2 = parse_sync(data2, {trim: true});

  var table1 = new coopy.CoopyTableView(records1);
  var table2 = new coopy.CoopyTableView(records2);

  var alignment = coopy.compareTables(table1,table2).align();

  var data_diff = [];
  var table_diff = new coopy.CoopyTableView(data_diff);

  var flags = new coopy.CompareFlags();
  var highlighter = new coopy.TableDiff(alignment, flags);
  highlighter.hilite(table_diff);

  var diff2html = new coopy.DiffRender();
  diff2html.render(table_diff);
  var table_diff_html = diff2html.html();

  return "<div class = 'highlighter'>" + table_diff_html + "</div>";

}


// ---- metadata_upload end ----
