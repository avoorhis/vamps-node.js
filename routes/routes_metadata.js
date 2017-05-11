var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');
var form      = require("express-form");

/* GET metadata page. */
 router.get('/metadata', function(req, res) {
      console.log('in metadata')
      res.render('metadata/metadata', { title: 'VAMPS:Metadata',
            user: req.user,
            hostname: req.CONFIG.hostname
        });
  });

router.get('/metadata_list', helpers.isLoggedIn, function(req, res) {
      console.log('in metadata')
      var mdata_w_latlon = {}
      console.log(DatasetsWithLatLong)
      
      for(n in AllMetadataNames){
        md_selected = AllMetadataNames[n]
        mdata_w_latlon[md_selected] = 0
        for(did in DatasetsWithLatLong){
        //console.log(AllMetadata[did])
        //if(AllMetadata.hasOwnProperty(did)){
            //console.log('found1',did)
            mdata = AllMetadata[did]
            
            pid = PROJECT_ID_BY_DID[did]
            //console.log('pid',pid)
            pname = PROJECT_INFORMATION_BY_PID[pid].project
            if(mdata.hasOwnProperty(md_selected)){
                    mdata_w_latlon[md_selected] = 1
                
            }
        }
      }
      console.log(mdata_w_latlon)
      res.render('metadata/metadata_list', { title: 'VAMPS:Metadata List',
            user:         req.user,hostname: req.CONFIG.hostname,
            metadata:     AllMetadataNames,
            mdata_latlon: JSON.stringify(mdata_w_latlon),
            names_by_did: JSON.stringify(DATASET_NAME_BY_DID),
            pid_by_did:   JSON.stringify(PROJECT_ID_BY_DID),
            pinfo_by_pid: JSON.stringify(PROJECT_INFORMATION_BY_PID)
        });
});

router.get('/list_result/:mditem', helpers.isLoggedIn, function(req, res) {
      console.log('in metadatalist result')
      var md_selected = req.params.mditem;
      console.log(md_selected)
      var mdvalues = {};
      for(did in DATASET_NAME_BY_DID){
        if(did in AllMetadata){
        if(AllMetadata[did].hasOwnProperty(md_selected)){
             mdvalues[did] = AllMetadata[did][md_selected]
        }
       }
      }      
      res.render('metadata/list_result', { title: 'VAMPS:Metadata List Result',
            user:         req.user,hostname: req.CONFIG.hostname,
            vals:     		JSON.stringify(mdvalues),
            names_by_did: JSON.stringify(DATASET_NAME_BY_DID),
            pid_by_did:   JSON.stringify(PROJECT_ID_BY_DID),
            pinfo_by_pid: JSON.stringify(PROJECT_INFORMATION_BY_PID),       
            item:         md_selected	  				
        });
  });

router.get('/geomap/:item', helpers.isLoggedIn, function(req, res) {
      console.log('in metadata - geomap')
      var md_item = req.params.item;
      var metadata_info = get_metadata_hash(md_item)  // fxn: see below
      //console.log('metadata_info')
      //console.log(metadata_info)
      res.render('metadata/geomap', { title: 'VAMPS:Metadata Distribution',
            user    : req.user,hostname: req.CONFIG.hostname,
            md_item : md_item,
            mdinfo  : JSON.stringify(metadata_info),
            gekey   : req.CONFIG.GOOGLE_EARTH_KEY,           
        });
  });

module.exports = router;

//////////////////////////////
function get_metadata_hash(md_selected){
    var md_info = {}
    //md_info[md_item] = {}
    md_info.metadata = {}
    var got_lat, got_lon
    //console.log('PROJECT_ID_BY_DID.length')
    //console.log(PROJECT_ID_BY_DID)
    //console.log(Object.keys(PROJECT_ID_BY_DID).length)
    for(did in PROJECT_ID_BY_DID){
        //did = all_metadata[i]
        //console.log('did',did)
        //console.log('did type',typeof did)
        
        //console.log('mdata',mdata)
        //all_metadata.forEach(function(did) {
        //console.log('PROJECT_ID_BY_DID',PROJECT_ID_BY_DID)
        if(AllMetadata.hasOwnProperty(did)){
            //console.log('found1',did)
            mdata = AllMetadata[did]
            pid = PROJECT_ID_BY_DID[did]
            //console.log('pid',pid)
            pname = PROJECT_INFORMATION_BY_PID[pid].project
            if(mdata.hasOwnProperty(md_selected) && mdata.hasOwnProperty('latitude') && mdata.hasOwnProperty('longitude')){
                if(mdata['latitude'] != 'None' && mdata['longitude'] != 'None'){
                    //console.log('found2',md_selected)
                    pjds = pname+'--'+DATASET_NAME_BY_DID[did]
                    md_info.metadata[pjds] ={}        
                    md_info.metadata[pjds].pid = pid
                    md_info.metadata[pjds].did = did
                    md_info.metadata[pjds].value = mdata[md_selected]
                    md_info.metadata[pjds].latitude = mdata['latitude'] 
                    md_info.metadata[pjds].longitude = mdata['longitude']
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

router.get('/metadata_upload', [helpers.isLoggedIn], function (req, res) {
  console.log('in get metadata/metadata_upload');

  res.render('metadata/metadata_upload', {
    title: 'VAMPS: Metadata_upload',
    user: req.user,
    hostname: req.CONFIG.hostname,
  });
});

router.post('/metadata_upload',
  [helpers.isLoggedIn],
  form(
    form.field("project_title", "Project title").trim().required().entityEncode().is(/^[a-zA-Z0-9_]+$/),
    form.field("pi_name", "PI name").trim().required().entityEncode().is(/^[a-zA-Z- ]+$/),
    form.field("pi_email", "PI's email address").trim().isEmail().required().entityEncode(),
    form.field("project_abstract", "Project abstract").trim().required().entityEncode(),
    form.field("references", "References").trim().required().entityEncode(),
    // References should clean URL
    form.field("project_name", "VAMPS project name").trim().entityEncode(),
    form.field("dataset_name", "VAMPS dataset name").trim().entityEncode(),
    form.field("sample_name", "Sample ID (user sample name)").trim().required().entityEncode(),
    form.field("dna_extraction_meth", "DNA Extraction").trim().required().entityEncode(),
    form.field("dna_quantitation", "DNA Quantitation").trim().required().entityEncode(),
    form.field("collection_date", "Sample collection date (YYYY-MM-DD)").trim().required().entityEncode().isDate("Sample collection date format: YYYY-MM-DD"),
    form.field("latitude", "Latitude (WGS84 system, values bounded by ±90°)").trim().required().entityEncode().isDecimal(),
    form.field("longitude", "Longitude (values bounded by ±180°)").trim().required().entityEncode(),
    form.field("geo_loc_name_country", "Country").trim().entityEncode(),
    form.field("longhurst_zone", "Longhurst Zone").trim().entityEncode(),
    form.field("biome", "Biome").trim().required().entityEncode(),
    form.field("env_feature_primary", "Environmental Feature - Primary").trim().required().entityEncode(),
    form.field("env_feature_secondary", "Environmental Feature - Secondary").trim().entityEncode(),
    form.field("env_material_primary", "Environmental Material - Primary").trim().required().entityEncode(),
    form.field("env_material_secondary", "Environmental Material - Secondary").trim().entityEncode()
   ),
  function (req, res) {
    // http://stackoverflow.com/questions/10706588/how-do-i-repopulate-form-fields-after-validation-errors-with-express-form
    if (!req.form.isValid) {
      console.log('in post /metadata_upload, !req.form.isValid');
      console.log('MMM AllMetadataFromFile = helpers.get_metadata_from_file()')      
      AllMetadataFromFile = helpers.get_metadata_from_file()
      console.log(AllMetadataFromFile);
      
      
      console.log("req.form");
      console.log(req.form);
      
      req.edit_metadata_info = req.form;
      console.log("req.edit_metadata_info");
      console.log(req.edit_metadata_info);
      
      req.flash('fail', req.form.errors);
      editMetadataForm(req, res);
      
    }    
    else {
      console.log('in post /metadata_upload');
      console.log("PPP req.form");
      console.log(req.form);
      // console.log(req);
      //  req.form: 
      //      dna_extraction_meth: 'CTAB phenol/chloroform',

      res.redirect("/user_data/your_projects");
    }

    return;
  }
);

function editMetadataForm(req, res){
  console.log('in editMetadataForm');
  // console.log(req);
  console.log("RRR req.edit_metadata_info");
  console.log(req.edit_metadata_info);

  res.render('metadata/metadata_upload', {
    title: 'VAMPS: Metadata',
    user: req.user,
    hostname: req.CONFIG.hostname,
    edit_metadata_info: req.edit_metadata_info,
    //env_sources:  JSON.stringify(MD_ENV_PACKAGE),
  });
}

function NewMetadata(req, res, id){ /* fetch or create logic, storing as req.model or req.metadata */} 


function loadMetadata(req, res, id){ /* fetch or create logic, storing as req.model or req.metadata */} 

function editMetadata(req, res){ /* render logic */ }

function saveMetadata(req, res){ 
    if(!req.form.isValid){
        editMetadata(req, res);
    }else{
        saveToDb(req.metadata);
        res.redirect('/metadata'+req.metadata.id+'/edit');
    }
}



// ---- metadata_upload end ----