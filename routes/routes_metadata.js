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

router.post('/metadata_upload',
  [helpers.isLoggedIn],
  form(
    form.field("dataset_id", "").trim().required().entityEncode().isInt().array(),
    form.field("project_title", "Project title").trim().required().entityEncode().is(/^[a-zA-Z0-9_ -]+$/),
    form.field("pi_name", "PI name").trim().required().entityEncode().is(/^[a-zA-Z- ]+$/),
    form.field("pi_email", "PI's email address").trim().isEmail().required().entityEncode(),
    form.field("project_abstract", "Project abstract").trim().required().entityEncode(),
    form.field("references", "References").trim().required().entityEncode().array(),
    // References should clean URL
    form.field("project", "VAMPS project name").trim().entityEncode(),
    form.field("dataset", "VAMPS dataset name").trim().entityEncode().array(),
    form.field("sample_name", "Sample ID (user sample name)").trim().required().entityEncode().array(),
    form.field("dna_extraction_meth", "DNA Extraction").trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("dna_quantitation", "DNA Quantitation").trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("collection_date", "Sample collection date (YYYY-MM-DD)").trim().required().entityEncode().isDate("Sample collection date format: YYYY-MM-DD").array(),
    form.field("latitude", "Latitude (WGS84 system, values bounded by ±90°)").trim().required().entityEncode().isDecimal().array(),
    form.field("longitude", "Longitude (values bounded by ±180°)").trim().required().entityEncode().array(),
    form.field("geo_loc_name_country", "Country").trim().entityEncode().array(),
    form.field("longhurst_zone", "Longhurst Zone").trim().entityEncode().array(),
    form.field("biome_primary", "Biome - Primary").trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("biome_secondary", "Biome - Secondary").trim().entityEncode().array(),
    form.field("feature_primary", "Environmental Feature - Primary").trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("feature_secondary", "Environmental Feature - Secondary").trim().entityEncode().array(),
    form.field("material_primary", "Environmental Material - Primary").trim().required().entityEncode().custom(env_items_validation).array(),
    form.field("material_secondary", "Environmental Material - Secondary").trim().entityEncode().array()
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
      editMetadataForm(req, res);
      //TODO: remove from here, use only if valid.
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
      biome_secondary_options: CONSTS.BIOME_SEQ_OPTIONS,
      feature_primary_options: CONSTS.FEATURE_PRIMARY,
      feature_secondary_aquifer: CONSTS.FEATURE_SECONDARY_AQUIFER,
      material_primary_options: CONSTS.MATERIAL_PRIMARY,
      material_secondary_biofilm: CONSTS.MATERIAL_SECONDARY_BIOFILM,
      metadata_form_required_fields: CONSTS.METADATA_FORM_REQUIRED_FIELDS
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
  var metadata_names = ['adapter_sequence', 'dna_region', 'domain', 'env_biome', 'env_feature', 'env_matter', 'env_package', 'geo_loc_name', 'illumina_index', 'primer_suite', 'run', 'sequencing_platform', 'target_gene'];
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
     env_matter: "unknown",
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

function make_all_arrays(all_metadata, pid, dataset_id) {
  for (dataset_id in AllMetadataFromFile) {
    Object.keys(AllMetadataFromFile[dataset_id]).forEach(function(key) {
      var val = AllMetadataFromFile[dataset_id][key];
      all_metadata[pid][key] = [];
    });
  }
  return all_metadata;
}

function populate_metadata_hash(rows, pid, all_metadata) {
  // all_metadata[pid]["dataset_ids"] = {}
  all_metadata[pid]["dataset_id"] = [];
  all_metadata[pid]["dataset"] = [];
  all_metadata[pid]["dataset_description"] = [];

  make_all_arrays(all_metadata, pid, dataset_id);

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

      Object.keys(AllMetadataFromFile[dataset_id]).forEach(function(key) {
        var val = AllMetadataFromFile[dataset_id][key];
        /*
        key
          latitude
        val
          64.49
        */
        all_metadata[pid][key].push(val);
      });

      console.log("DDD11 all_metadata");
      console.log(all_metadata);

      // all_metadata[pid]["dataset_ids"][dataset_id] = get_values_from_ids(AllMetadataFromFile, dataset_id, all_metadata[pid]["dataset_ids"][dataset_id]);

      // console.log("MMM all_metadata");
      // console.log(all_metadata);
      /* MMM all_metadata
{ "47":
   { dataset_ids:
      { "4312": [Object],
        "4313": [Object],
        "4314": [Object],
        "4315": [Object],
        "4316": [Object],
        "4317": [Object],
        "4318": [Object] },
     project: "DCO_GAI_Bv3v5",
     title: "Icelandic Volcanic Lake",
     username: "gaidos",
     email: "gaidos@hawaii.edu",
     institution: "University of Hawaii",
     first_name: "Eric",
     last_name: "Gaidos",
     public: 0 } }
 */

  }
  return all_metadata;
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
function make_metadata_hash(req, res){
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
          biome_secondary_options: CONSTS.BIOME_SEQ_OPTIONS,
          feature_primary_options: CONSTS.FEATURE_PRIMARY,
          feature_secondary_aquifer: CONSTS.FEATURE_SECONDARY_AQUIFER,
          material_primary_options: CONSTS.MATERIAL_PRIMARY,
          material_secondary_biofilm: CONSTS.MATERIAL_SECONDARY_BIOFILM,
          metadata_form_required_fields: CONSTS.METADATA_FORM_REQUIRED_FIELDS
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

        file_name = path.join(config.USER_FILES_BASE, req.user["username"], "metadata_" + rando.toString() + '_' + project + ".csv");

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

