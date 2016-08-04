var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');

/* GET metadata page. */
 router.get('/metadata', function(req, res) {
      console.log('in metadata')
      res.render('metadata/metadata', { title: 'VAMPS:Metadata',
            user: req.user,
            hostname: req.CONFIG.hostname,
	  				message:'',
                            });
  });

router.get('/metadata_list', helpers.isLoggedIn, function(req, res) {
      console.log('in metadata')
      res.render('metadata/metadata_list', { title: 'VAMPS:Metadata List',
            user:         req.user,hostname: req.CONFIG.hostname,
            metadata:     AllMetadataNames,
            names_by_did: JSON.stringify(DATASET_NAME_BY_DID),
            pid_by_did:   JSON.stringify(PROJECT_ID_BY_DID),
            pinfo_by_pid: JSON.stringify(PROJECT_INFORMATION_BY_PID),
	  				message:  '',
                            });
  });

router.get('/list_result/:mditem', helpers.isLoggedIn, function(req, res) {
      console.log('in metadatalist result')
      var md_selected = req.params.mditem;
      console.log(md_selected)
      var mdvalues = {};
      for(did in DATASET_NAME_BY_DID){
        var mdgroup = HDF5_MDATA.openGroup(did+"/metadata");
        mdgroup.refresh()
        if(mdgroup.hasOwnProperty(md_selected)){
          mdvalues[did] = mdgroup[md_selected]
        }
      }      
      res.render('metadata/list_result', { title: 'VAMPS:Metadata List Result',
            user:         req.user,hostname: req.CONFIG.hostname,
            vals:     		JSON.stringify(mdvalues),
            names_by_did: JSON.stringify(DATASET_NAME_BY_DID),
            pid_by_did:   JSON.stringify(PROJECT_ID_BY_DID),
            pinfo_by_pid: JSON.stringify(PROJECT_INFORMATION_BY_PID),       
            item:         md_selected,
	  				message:  '',
                            });
  });

router.get('/geomap/:item', helpers.isLoggedIn, function(req, res) {
      console.log('in metadata - geomap')
      var md_item = req.params.item;
      var metadata_info = get_metadata_hash(md_item)  // fxn: see below
      //console.log(metadata_info)
      res.render('metadata/geomap', { title: 'VAMPS:Metadata Distribution',
            user    : req.user,hostname: req.CONFIG.hostname,
            md_item : md_item,
            mdinfo  : JSON.stringify(metadata_info),
            gekey   : req.CONFIG.GOOGLE_EARTH_KEY,
            message:  '',
                            });
  });

module.exports = router;

//////////////////////////////
function get_metadata_hash(md_selected){
    var md_info = {}
    //md_info[md_item] = {}
    md_info.metadata = {}
    var got_lat, got_lon
    for(did in DATASET_NAME_BY_DID){
        //did = all_metadata[i]

        //all_metadata.forEach(function(did) {
        pid = PROJECT_ID_BY_DID[did]
        //console.log(all_metadata[did])
        pname = PROJECT_INFORMATION_BY_PID[pid].project
        var mdgroup = HDF5_MDATA.openGroup(did+"/metadata");
        mdgroup.refresh()
        if(mdgroup.hasOwnProperty(md_selected)){
            //console.log('found',md_selected)
            pjds = pname+'--'+DATASET_NAME_BY_DID[did]
            md_info.metadata[pjds] ={}
            
            if(got_lat === false)
              md_info.metadata[pjds].latitude = 'notFound'
            if(got_lon === false)
              md_info.metadata[pjds].longitude = 'notFound'
            md_info.metadata[pjds].pid = pid
            md_info.metadata[pjds].did = did
            md_info.metadata[pjds].value = mdgroup[md_selected]

            got_lat=false
            got_lon=false
            
            //collected_metadata[pjds] = all_metadata[did]
            if(mdgroup.hasOwnProperty('lat')){
              md_info.metadata[pjds].latitude = mdgroup.lat
              got_lat=true
            }else if(mdgroup.hasOwnProperty('latitude')){
              md_info.metadata[pjds].latitude = mdgroup.latitude
              got_lat=true
            }

            if(mdgroup.hasOwnProperty('lon')){
              md_info.metadata[pjds].longitude = mdgroup.lon
              got_lon=true
            }else if(mdgroup.hasOwnProperty('longitude')){
              md_info.metadata[pjds].longitude = mdgroup.longitude
              got_lon=true
            }
        }
    }

    return md_info;

}