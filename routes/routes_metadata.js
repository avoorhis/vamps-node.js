var express = require("express");
var router  = express.Router();
var helpers = require("./helpers/helpers");
var form    = require("express-form");
var queries = require(app_root + "/routes/queries");
var CONSTS  = require(app_root + "/public/constants");
var fs = require("fs");
var path = require("path");
var config  = require(app_root + '/config/config');

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
// AllMetadataFromFile = helpers.get_metadata_from_file()

router.get("/metadata_upload_from_file", [helpers.isLoggedIn], function (req, res) {
  console.log("in get metadata/metadata_upload_from_file");

  //TODO: What to show for project and dataset?
  res.render('metadata/metadata_upload_from_file', {
    title: 'VAMPS: Metadata_upload',
    user: req.user,
    hostname: req.CONFIG.hostname
  });
});

router.get("/metadata_upload_new", [helpers.isLoggedIn], function (req, res) {
  console.log("in get metadata/metadata_upload_new");

  //TODO: What to show for project and dataset?
  res.render('metadata/metadata_upload_new', {
    title: 'VAMPS: Metadata_upload',
    user: req.user,
    hostname: req.CONFIG.hostname
  });
});

// TODO: update pairs from https://docs.google.com/spreadsheets/d/1adAtGc9DdY2QBQZfd1oaRdWBzjOv4t-PF1hBfO8mAoA/edit#gid=1223926458
router.post('/metadata_upload',
  [helpers.isLoggedIn],
  form(
    form.field("NPOC", "NPOC (Non-purgeable organic carbon)").trim().entityEncode().array(),
    form.field("access_point_type", "Access Point Type").trim().entityEncode().array(),
    form.field("adapter_sequence", "Adapter sequence").trim().entityEncode().array().required(),
    form.field("alkalinity", "Alkalinity").trim().entityEncode().array(),
    form.field("ammonium", "Ammonium").trim().entityEncode().array(),
    form.field("bicarbonate", "Bicarbonate").trim().entityEncode().array(),
    form.field("env_biome", "Biome - Primary").trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("env_biome_sec", "Biome - Secondary").trim().entityEncode().array(),
    form.field("calcium", "Calcium").trim().entityEncode().array(),
    form.field("calcium_carbonate", "Calcium carbonate").trim().entityEncode().array(),
    form.field("chloride", "Chloride").trim().entityEncode().array(),
    form.field("clone_library_results", "clone library results (key findings)").trim().entityEncode().array(),
    form.field("collection_date", "Sample collection date (YYYY-MM-DD)").trim().required().entityEncode().isDate("Sample collection date format: YYYY-MM-DD").array(),
    form.field("conductivity", "Conductivity").trim().entityEncode().array().required(),
    form.field("dataset", "VAMPS dataset name").trim().entityEncode().array().required(),
    form.field("dataset_id", "").trim().required().entityEncode().isInt().array(),
    form.field("del18O_water", "Delta 18O of water").trim().entityEncode().array(),
    form.field("depth_in_core", "Depth within core").trim().entityEncode().array(),
    form.field("depth_subseafloor", "Depth below seafloor").trim().entityEncode().array(),
    form.field("depth_subterrestrial", "Depth below terrestrial surface").trim().entityEncode().array(),
    form.field("diss_hydrogen", "Dissolved hydrogen").trim().entityEncode().array(),
    form.field("diss_inorg_carb", "Dissolved inorganic carbon").trim().entityEncode().array(),
    form.field("diss_inorg_carbon_del13C", "Delta 13C for dissolved inorganic carbon").trim().entityEncode().array(),
    form.field("diss_org_carb", "Dissolved organic carbon").trim().entityEncode().array(),
    form.field("diss_oxygen", "Dissolved oxygen").trim().entityEncode().array(),
    form.field("dna_extraction_meth", "DNA Extraction").trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("dna_quantitation", "DNA Quantitation").trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("dna_region", "DNA region").trim().entityEncode().array().required(),
    form.field("domain", "Domain").trim().entityEncode().array().required(),
    form.field("elevation", "Elevation above sea level (land only)").trim().entityEncode().array().required(),
    form.field("env_package", "Environmental Package").trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("enzyme_activities", "enzyme activities (key findings)").trim().entityEncode().array(),
    form.field("env_feature", "Environmental Feature - Primary").trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("env_feature_sec", "Environmental Feature - Secondary").trim().entityEncode().array(),
    form.field("formation_name", "Formation name").trim().entityEncode().array(),
    form.field("forward_primer", "Forward PCR Primer").trim().entityEncode().array().required(),
    form.field("functional_gene_assays", "functional gene assays (key findings)").trim().entityEncode().array(),
    form.field("geo_loc_name_continental", "Country").trim().entityEncode().array().required(),
    form.field("geo_loc_name_marine", "Longhurst Zone").trim().entityEncode().array().required(),
    form.field("illumina_index", "Index sequence (for Illumina)").trim().entityEncode().array(),
    // Index sequence (required for Illumina)
    form.field("investigation_type", "Investigation Type").trim().entityEncode().array().required(),
    form.field("iron", "Total iron").trim().entityEncode().array(),
    form.field("iron_II", "Iron II").trim().entityEncode().array(),
    form.field("iron_III", "Iron III").trim().entityEncode().array(),
    form.field("isol_growth_cond", "Isolation and growth condition (publication reference)").trim().entityEncode().array(),
    form.field("latitude", "Latitude (WGS84 system, values bounded by ±90°)").trim().required().entityEncode().isDecimal().array(),
    form.field("longitude", "Longitude (values bounded by ±180°)").trim().required().entityEncode().isDecimal().array(),
    form.field("magnesium", "Magnesium").trim().entityEncode().array(),
    form.field("manganese", "Manganese").trim().entityEncode().array(),
    form.field("env_material", "Environmental Material - Primary").trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("env_material_sec", "Environmental Material - Secondary").trim().entityEncode().array(),
    form.field("methane", "Methane").trim().entityEncode().array(),
    form.field("methane_del13C", "Delta 13C for methane").trim().entityEncode().array(),
    form.field("microbial_biomass_FISH", "Microbial biomass – FISH").trim().entityEncode().array(),
    form.field("microbial_biomass_avg_cell_number", "Microbial biomass – other").trim().entityEncode().array(),
    form.field("microbial_biomass_intactpolarlipid", "Microbial biomass – intact polar lipid").trim().entityEncode().array(),
    form.field("microbial_biomass_microscopic", "Microbial biomass – microscopic").trim().entityEncode().array(),
    form.field("microbial_biomass_platecounts", "Microbial biomass – plate counts - cell numbers").trim().entityEncode().array(),
    form.field("microbial_biomass_qPCR", "Microbial biomass – Q-PCR and primers used").trim().entityEncode().array(),
    form.field("nitrate", "Nitrate").trim().entityEncode().array(),
    form.field("nitrite", "Nitrite").trim().entityEncode().array(),
    form.field("nitrogen_tot", "Total nitrogen").trim().entityEncode().array(),
    form.field("noble_gas_chemistry", "Noble gas chemistry").trim().entityEncode().array(),
    form.field("org_carb_nitro_ratio", "Carbon nitrogen ratio").trim().entityEncode().array(),
    form.field("pH", "pH").trim().entityEncode().array().required(),
    form.field("part_org_carbon_del13C", "Delta 13C for particulate organic carbon").trim().entityEncode().array(),
    form.field("phosphate", "Phosphate").trim().entityEncode().array(),
    form.field("pi_email", "PI's email address").trim().isEmail().required().entityEncode(),
    form.field("pi_name", "PI name").trim().required().entityEncode().is(/^[a-zA-Z- ]+$/),
    form.field("plate_counts", "Plate counts – colony forming units").trim().entityEncode().array(),
    form.field("porosity", "Porosity").trim().entityEncode().array(),
    form.field("potassium", "Potassium").trim().entityEncode().array(),
    form.field("pressure", "Pressure").trim().entityEncode().array(),
    form.field("project", "VAMPS project name").trim().entityEncode().array().required(),
    form.field("project_abstract", "Project abstract").trim().required().entityEncode(),
    form.field("project_title", "Project title").trim().required().entityEncode().is(/^[a-zA-Z0-9_ -]+$/),
    form.field("redox_potential", "Redox potential").trim().entityEncode().array(),
    form.field("redox_state", "Redox state").trim().entityEncode().array().required(),
    form.field("references", "References").trim().entityEncode().array(),
    form.field("resistivity", "Resistivity").trim().entityEncode().array(),
    form.field("reverse_primer", "Reverse PCR Primer").trim().entityEncode().array().required(),
    form.field("rock_age", "Sediment or rock age").trim().entityEncode().array(),
    form.field("run", "Sequencing run date (YYYY-MM-DD)").trim().entityEncode().array().required(),
    form.field("salinity", "Salinity").trim().entityEncode().array(),
    form.field("samp_store_dur", "Storage duration ").trim().entityEncode().array(),
    form.field("samp_store_temp", "Storage temperature").trim().entityEncode().array(),
    form.field("sample_name", "Sample ID (user sample name)").trim().entityEncode().array().required(),
    form.field("sample_size_mass", "Sample Size (mass)").trim().entityEncode().array(),
    form.field("sample_size_vol", "Sample Size (volume)").trim().entityEncode().array(),
    form.field("sample_type", "Sample Type (most often environmental)").trim().entityEncode().array().required(),
    form.field("sequencing_meth", "Sequencing method").trim().entityEncode().array().required(),
    form.field("sodium", "Sodium").trim().entityEncode().array(),
    form.field("sulfate", "Sulfate").trim().entityEncode().array(),
    form.field("sulfide", "Sulfide").trim().entityEncode().array(),
    form.field("sulfur_tot", "Total sulfur").trim().entityEncode().array(),
    form.field("target_gene", "Target gene name (16S rRNA, mcrA)").trim().entityEncode().array().required(),
    form.field("temperature", "Temperature").trim().entityEncode().array().required(),
    form.field("tot_carb", "Total carbon").trim().entityEncode().array(),
    form.field("tot_depth_water_col", "Water column depth (Sampling depth if applicable. If sampling below seafloor, depth of water column at the seafloor)").trim().entityEncode().array(),
    form.field("tot_inorg_carb", "Total inorganic carbon").trim().entityEncode().array(),
    form.field("tot_org_carb", "Total organic carbon").trim().entityEncode().array(),
    form.field("trace_element_geochem", "Trace element geochemistry").trim().entityEncode().array(),
    form.field("water_age", "Water age").trim().entityEncode().array()
  ),
  function (req, res) {
    // http://stackoverflow.com/questions/10706588/how-do-i-repopulate-form-fields-after-validation-errors-with-express-form
    if (!req.form.isValid) {
      console.log('in post /metadata_upload, !req.form.isValid');
      // console.log('MMM AllMetadataFromFile = helpers.get_metadata_from_file()')
      // AllMetadataFromFile = helpers.get_metadata_from_file()
      // console.log(AllMetadataFromFile);

      console.log("QQQ req.params");
      console.log(req.params);


      console.log("req.form");
      console.log(req.form);

      console.log("req.body");
      console.log(req.body);

      req.flash("fail", req.form.errors);
      console.log("req.form.errors");
      console.log(req.form.errors);

      console.log('req.form.getErrors("env_biome")');
      console.log(req.form.getErrors("env_biome"));


      console.log('req.form.getErrors()');
      console.log(req.form.getErrors());


      editMetadataForm(req, res);
      //TODO: remove make_csv from here, use only if valid.
      make_csv(req, res);


    }
    else {
      console.log('in post /metadata_upload');
      console.log("PPP req.form");
      console.log(req.form);
      // console.log(req);
      //  req.form:
      //      dna_extraction_meth: "CTAB phenol/chloroform",
      saveMetadata(req, res);

      res.redirect("/user_data/your_projects");
    }
  }
);

function format_form(req, res) {
  edit_metadata_info = {};
  console.log("RRR req.body");
  console.log(req.body);
  /*
  "16s": [ "16s", "16s", "16s", "16s", "16s", "16s", "16s", "16s" ],
  project: "DCO_GAI_Bv3v5",
  pi_name: "",
  dataset_id: [ "4312", "4313", "4314", "4315", "4316", "4317", "4318", "4319" ],
  pi_email: "",


  */
  console.log("QQQ req.form");
  console.log(req.form);
// { dataset_id: [ "4312", "4313", "4314", "4315", "4316", "4317", "4318", "4319" ],
  // project_title: [ "Icelandic Volcanic Lake" ],

  return edit_metadata_info;
}

function editMetadataForm(req, res){
  console.log('in editMetadataForm');
  // console.log(req);

  edit_metadata_address = "metadata/metadata_upload_from_file";
  console.log("AAA2 edit_metadata_address = 'metadata/metadata_upload_from_file'");

  // console.log("XXX1 all_metadata: req.form");
  // console.log(req.form);
  // console.log("XXX2 req.body.project_id");
  // console.log(req.body.project_id);
  // console.log(pid);
  // console.log("XXX3 req.body.project_id");
  // console.log(all_metadata);
  all_metadata = {pid: req.form};
  res.render('metadata/metadata_upload_from_file', {
    title: 'VAMPS: Metadata_upload',
    user: req.user,
    hostname: req.CONFIG.hostname,
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
    investigation_type_options: CONSTS.INVESTIGATION_TYPE
  });
}


// http://stackoverflow.com/questions/10706588/how-do-i-repopulate-form-fields-after-validation-errors-with-express-form


function NewMetadata(req, res, id){ /* fetch or create logic, storing as req.model or req.metadata */}


function loadMetadata(req, res, id){ /* fetch or create logic, storing as req.model or req.metadata */}

function editMetadataFromFile(req, res){ /* render logic */ }

function saveMetadata(req, res){
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
}

// router.post('/metadata_upload/:id',

// app.param('id', loadMetadata);
// app.get('/project/:id/edit', editMetadata);
// app.post('/project/:id', saveMetadata);

router.post('/start_edit',
  [helpers.isLoggedIn],
  function (req, res) {
    console.log("in post /start_edit");

    console.log("FFF req");
    // console.log(req.body);
    // console.log(req.body.project_id);
    // console.log(req.body.project);
    // console.log("MMM AllMetadataFromFile = helpers.get_metadata_from_file()")
    AllMetadataFromFile = helpers.get_metadata_from_file();
    // console.log(AllMetadataFromFile["47"]);
    // all_metadata = {}
    make_metadata_hash(req, res);
    console.log("TTT all_metadata from start_edit");
    console.log(all_metadata);
    /*
    FFF req
    { project_id: '47', project: 'DCO_GAI_Bv3v5' }
    47
    DCO_GAI_Bv3v5

     res.json(rows);

     var user = rows[0].userid;
     var password= rows[0].password;

    */
});

function get_values_from_ids(METADATA, did, all_metadata_p_d) {
  var metadata_names = ['adapter_sequence', 'dna_region', 'domain', 'env_biome', 'env_feature', 'env_material', 'env_package', 'geo_loc_name', 'illumina_index', 'primer_suite', 'run', 'sequencing_platform', 'target_gene'];
  // var ds_row = {};

  metadata_names.forEach(function(mdname) {
    // console.log(mdname);
    var data = helpers.required_metadata_ids_from_names(METADATA[did], mdname);
    /*
    console.log("DDD data");
    console.log(data);
    DDD data
    { name: 'run_id', value: '20080709' }
    */

    if(did in METADATA) {
      // ds_row[mdname] = data.value
      all_metadata_p_d[mdname] = data.value;
    }

    /*
DDD metadata
{ "4319":
   { adapter_sequence: "TGTCA",
     dna_region: "v3v5",
     domain: "Bacteria",
     env_biome: "unknown",
     env_feature: "unknown",
     env_material: "unknown",
     env_package: "unknown",
     geo_loc_name: "unknown",
     illumina_index: "unknown",
     primer_suite: "Bacterial V3-V5 Suite",
     run: "20080709",
     sequencing_platform: "unknown",
     target_gene: "16s" } }


    */


  });
  // console.log("DDD all_metadata_p_d");
  // console.log(all_metadata_p_d);
  return all_metadata_p_d;
}

function make_empty_arrays(all_metadata, pid) {
  console.log("KKK From AllMetadataFromFile");
  console.log("KKK333 AllMetadataFromFile");
  console.log(AllMetadataFromFile);

  for (var dataset_id in AllMetadataFromFile) {
    console.log("DADA dataset_id");
    Object.keys(AllMetadataFromFile[dataset_id]).forEach(function(key) {
      // var val = AllMetadataFromFile[dataset_id][key];
      all_metadata[pid][key] = [];

      console.log("KKK1 key:");
      console.log(key);
      console.log("KKK2 pid:");
      console.log(pid);
      // console.log("KKK3 val:");
      // console.log(val);

    });

    for (var i = 0, len = CONSTS.REQ_METADATA_FIELDS_wIDs.length; i < len; i++) {
      var key_name = CONSTS.REQ_METADATA_FIELDS_wIDs[i];
      all_metadata[pid][key_name] = [];
    }



    // get_values_from_ids(METADATA, did, all_metadata_p_d)

    // var ds_row = {};

    // metadata_names.forEach(function(mdname) {
    //   // console.log(mdname);
    //   var data = helpers.required_metadata_ids_from_names(METADATA[did], mdname);
    //   /*
    //    console.log("DDD data");
    //    console.log(data);
    //    DDD data
    //    { name: 'run_id', value: '20080709' }
    //    */
    //
    //   if(did in METADATA) {
    //     // ds_row[mdname] = data.value
    //     all_metadata_p_d[mdname] = data.value;
    //   }
    // });

  }
  // all_metadata[pid]["dataset_ids"][dataset_id] = get_values_from_ids(AllMetadataFromFile, dataset_id, all_metadata[pid]["dataset_ids"][dataset_id]);


  return all_metadata;
}

function populate_metadata_hash(rows, pid, all_metadata) {
  // all_metadata[pid]["dataset_ids"] = {}
  all_metadata[pid]["dataset_id"] = [];
  all_metadata[pid]["dataset"] = [];
  all_metadata[pid]["dataset_description"] = [];

  console.log("PPP1 populate_metadata_hash: ");
  make_empty_arrays(all_metadata, pid);

  console.log("PPP2 all_metadata");
  console.log(all_metadata);

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
      all_metadata[pid]["project"]     = row.project;
      all_metadata[pid]["title"]       = row.title;
      all_metadata[pid]["username"]    = row.username;
      all_metadata[pid]["email"]       = row.email;
      all_metadata[pid]["institution"] = row.institution;
      all_metadata[pid]["first_name"]  = row.first_name;
      all_metadata[pid]["last_name"]   = row.last_name;
      all_metadata[pid]["public"]      = row.public;
      // console.log("AllMetadataFromFile[dataset_id]");
      // console.log(AllMetadataFromFile[dataset_id]);
      all_metadata[pid]["dataset_id"].push(row.did);
      all_metadata[pid]["dataset"].push(row.dataset);
      all_metadata[pid]["dataset_description"].push(row.dataset_description);

      console.log('AAA5 all_metadata[pid]["dataset_id"]');
      console.log(all_metadata[pid]["dataset_id"]);
      /*
      console.log("AllMetadataFromFile[dataset_id]");
      console.log(AllMetadataFromFile[dataset_id]);
  sodium: '30.65',
  collection_date: '2007-06-01',
      */

      // key_hash = Object.keys(AllMetadataFromFile[dataset_id]);
      // for (var i1 = 0, len1 = key_hash.length; i1 < len1; i1++) {
      //   var key = key_hash[i1];
      //   var val = AllMetadataFromFile[dataset_id][key];
      //   all_metadata[pid][key].push(val);
      //
      // }
    add_all_metadata_from_file(Object.keys(AllMetadataFromFile[dataset_id]), dataset_id);
    add_required_metadata_from_id(CONSTS.REQ_METADATA_FIELDS_wIDs, dataset_id);

      // for (var i2 = 0, len2 = CONSTS.REQ_METADATA_FIELDS_wIDs.length; i2 < len2; i2++) {
      //   var mdname = CONSTS.REQ_METADATA_FIELDS_wIDs[i2];
      //
      //   console.log("MDMDM11 mdname: ");
      //   console.log(mdname);
      //
      //   var data = helpers.required_metadata_names_from_ids(AllMetadataFromFile[dataset_id], mdname + "_id");
      //   all_metadata[pid][mdname].push(data.value);
      //
      // }

  }
  return all_metadata;
}

function add_all_metadata_from_file(my_hash, dataset_id) {
  for (var i1 = 0, len1 = my_hash.length; i1 < len1; i1++) {
    var key = my_hash[i1];
    var val = AllMetadataFromFile[dataset_id][key];
    all_metadata[pid][key].push(val);

  }
}


function add_required_metadata_from_id(my_hash, dataset_id) {
  for (var idx = 0, len = my_hash.length; idx < len; idx++) {
    var key = my_hash[idx];
    var data = helpers.required_metadata_names_from_ids(AllMetadataFromFile[dataset_id], key + "_id");

    all_metadata[pid][key].push(data.value);
  }
}

// function populate_metadata_hash(rows, pid, all_metadata){
//   all_metadata[pid]["dataset_ids"] = {}
//
//   for (var i = 0; i < rows.length; i++) {
//       var row = rows[i];
//       /*
//       console.log("WWW row");
//       console.log(row);
//       TextRow {
//         project: 'DCO_GAI_Bv3v5',
//         title: 'Icelandic Volcanic Lake',
//         did: 4312,
//         pid: 47,
//         dataset: 'S1',
//         dataset_description: 'NULL',
//         username: 'gaidos',
//         email: 'gaidos@hawaii.edu',
//         institution: 'University of Hawaii',
//         first_name: 'Eric',
//         last_name: 'Gaidos',
//         owner_user_id: 54,
//         public: 0 }
//
// { dataset_id: [ '4312', '4313', '4314', '4315', '4316', '4317', '4318', '4319' ],
//   project_title: [ 'Icelandic Volcanic Lake' ],
//
//       */
//       var dataset_id = row.did
//       all_metadata[pid]["project"]     = row.project
//       all_metadata[pid]["title"]       = row.title
//       all_metadata[pid]["username"]    = row.username
//       all_metadata[pid]["email"]       = row.email
//       all_metadata[pid]["institution"] = row.institution
//       all_metadata[pid]["first_name"]  = row.first_name
//       all_metadata[pid]["last_name"]   = row.last_name
//       all_metadata[pid]["public"]      = row.public
//       // console.log("AllMetadataFromFile[dataset_id]");
//       // console.log(AllMetadataFromFile[dataset_id]);
//
//       all_metadata[pid]["dataset_ids"][dataset_id] = AllMetadataFromFile[dataset_id]
//       all_metadata[pid]["dataset_ids"][dataset_id] = get_values_from_ids(AllMetadataFromFile, dataset_id, all_metadata[pid]["dataset_ids"][dataset_id]);
//       all_metadata[pid]["dataset_ids"][dataset_id]["dataset"] = row.dataset
//       all_metadata[pid]["dataset_ids"][dataset_id]["dataset_description"] = row.dataset_description
//   }
//   return all_metadata
// };

function get_all_field_names(all_metadata) {
  var all_field_names = [];
  for (var pid in all_metadata) {
    for (var did in all_metadata[pid]) {
      for (var d_info in all_metadata[pid][did]) {
        all_field_names.push(d_info);
      }
    }
  }
  return all_field_names;
}

function intersection_destructive(a, b)
{
  var result = [];
  while( a.length > 0 && b.length > 0 )
  {
     if      (a[0] < b[0] ){ a.shift(); }
     else if (a[0] > b[0] ){ b.shift(); }
     else /* they're equal */
     {
       result.push(a.shift());
       b.shift();
     }
  }

  return result;
}



// TODO: rename
// todo: if there is req.form (or req.body?) use the result?
function make_metadata_hash(req, res) {
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
        // console.log("rows");
        // empty all_metadata
        all_metadata = populate_metadata_hash(rows, pid, all_metadata);
        // var all_field_names = CONSTS.ORDERED_METADATA_NAMES;
        // console.log("EEE all_field_names");
        // console.log(all_field_names);
        // var dividers = CONSTS.ORDERED_METADATA_DIVIDERS;

        console.log("YYY all_metadata from make_metadata_hash");
        console.log(all_metadata);
        /*
        YYY all_metadata from make_metadata_hash
        { "47":
           { dataset_id: [ 4312, 4313, 4314, 4315, 4316, 4317, 4318, 4319 ],
             dataset: [ 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'Sk_hlaup' ],
        ...
        project: "DCO_GAI_Bv3v5",
        title: "Icelandic Volcanic Lake",

        XXX1 all_metadata: req.form
        { dataset_id: [ "0", "1", "2", "3", "4", "5", "6", "7" ],
          project_title: "Icelandic Volcanic Lake",
          pi_name: "",

        */
        res.render("metadata/metadata_upload_from_file", {
          title: "VAMPS: Metadata_upload",
          user: req.user,
          hostname: req.CONFIG.hostname,
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
          investigation_type_options: CONSTS.INVESTIGATION_TYPE
        });


        // project_dataset_info_res = JSON.stringify(rows)
        // console.log(JSON.stringify(rows1));
        // for (var row in rows1[0])
        // {
        //   console.log(row);
        //   console.log(row.did);
        // }

      }
       // end else
    });
  }
  else
  { // end if int
    console.log('ERROR pid is not an integer: ', pid);
  }
}

function env_items_validation(value) {
  console.log("EEE env_items_validation(value)");
  console.log(value);
  if (value === "Please choose one") {
      throw new Error("Please choose one value from the dropdown menu for %s.");
  }
}

function make_csv(req, res) {
    //TODO: check where it is called from
    console.log("MMM make_csv: form_values");
    input = req.form;

    var csv = convertArrayOfObjectsToCSV({
        data: req.form
    });

    project = req.form["project"];
    out_csv_file_name = makeFileName(req, project);

    fs.writeFile(out_csv_file_name, csv, function(err) {
        if (err) throw err;
        console.log('file ' + out_csv_file_name + ' saved');
    });
    }

    function makeFileName(req, project) {
        var rando = helpers.getRandomInt(10000, 99999);

        file_name = path.join(config.USER_FILES_BASE, req.user.username, "metadata-" + rando.toString() + '_' + project + ".csv");

        return file_name
    }

function convertArrayOfObjectsToCSV(args) {
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
    return result;
}

// ---- metadata_upload end ----

