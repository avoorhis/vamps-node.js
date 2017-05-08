var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');

/* GET metadata page. */
 router.get('/metadata', function(req, res) {
      console.log('in metadata')
      res.render('metadata/metadata', { title: 'VAMPS:Metadata',
            user: req.user,
            hostname: req.CONFIG.hostname,
	  
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
            item:         md_selected,
	  				
                            });
  });

router.get('/geomap/:item', helpers.isLoggedIn, function(req, res) {
      console.log('in metadata - geomap')
      var md_item = req.params.item;
      var metadata_info = get_metadata_hash(md_item)  // fxn: see below
      console.log('metadata_info')
      console.log(metadata_info)
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
    console.log('PROJECT_ID_BY_DID.length')
    console.log(PROJECT_ID_BY_DID)
    console.log(Object.keys(PROJECT_ID_BY_DID).length)
    for(did in PROJECT_ID_BY_DID){
        //did = all_metadata[i]
        //console.log('did',did)
        //console.log('did type',typeof did)
        
        //console.log('mdata',mdata)
        //all_metadata.forEach(function(did) {
        //console.log('PROJECT_ID_BY_DID',PROJECT_ID_BY_DID)
        if(AllMetadata.hasOwnProperty(did)){
            console.log('found1',did)
            mdata = AllMetadata[did]
            pid = PROJECT_ID_BY_DID[did]
            console.log('pid',pid)
            pname = PROJECT_INFORMATION_BY_PID[pid].project
            if(mdata.hasOwnProperty(md_selected) && mdata.hasOwnProperty('latitude') && mdata.hasOwnProperty('longitude')){
                if(mdata['latitude'] != 'None' && mdata['longitude'] != 'None'){
                    console.log('found2',md_selected)
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