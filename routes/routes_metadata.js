var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');

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
      //console.log(DatasetsWithLatLong)  // json
      //console.log(AllMetadataNames)  // list (req w _ids)
      for(n in AllMetadataNames){
        md_selected = AllMetadataNames[n]
        mdata_w_latlon[md_selected] = 0
        
        //console.log(md_selected)
        for(did in DatasetsWithLatLong){
        //console.log(AllMetadata[did])
        //if(AllMetadata.hasOwnProperty(did)){
            //console.log('found1',did)
            //var mdata = helpers.required_metadata_names_from_ids(AllMetadata[did], md_selected)
            mdata = AllMetadata[did]   // has ids
            
            pid = PROJECT_ID_BY_DID[did]
            //console.log('pid',pid)
            pname = PROJECT_INFORMATION_BY_PID[pid].project
            
            if(mdata.hasOwnProperty(md_selected)){
                    mdata_w_latlon[md_selected] = 1                
            }
        }
      }
      //console.log(mdata_w_latlon)
      res.render('metadata/metadata_list', { title: 'VAMPS:Metadata List',
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
      console.log('in metadatalist result')
      var md_selected = req.params.mditem;
      console.log(md_selected) 
        
      var mdvalues = {};
      for(did in DATASET_NAME_BY_DID){
        if(did in AllMetadata){
        if(req.CONSTS.REQ_METADATA_FIELDS_wIDs.indexOf(md_selected.slice(0,md_selected.length-3)) != -1){
            var data = helpers.required_metadata_names_from_ids(AllMetadata[did], md_selected)  // send _id
            console.log('data')
            console.log(data)
            mdvalues[did] = data.value
            md_selected_show = data.name
        }else if(AllMetadata[did].hasOwnProperty(md_selected)){
             mdvalues[did] = AllMetadata[did][md_selected]
             md_selected_show = md_selected
             
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
      console.log('in metadata - geomap')
      var md_item = req.params.item;
      if(req.CONSTS.REQ_METADATA_FIELDS_wIDs.indexOf(md_item.slice(0,md_item.length-3)) != -1){
        md_item_show = md_item.slice(0,md_item.length-3)
      }else{
        md_item_show = md_item
      }
      var metadata_info = get_metadata_hash(md_item)  // fxn: see below
      //console.log('metadata_info')
      //console.log(metadata_info)
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
    var md_info = {}
    //md_info[md_item] = {}
    md_info.metadata = {}
    var got_lat, got_lon
    //console.log('PROJECT_ID_BY_DID.length')
    //console.log(PROJECT_ID_BY_DID)
    //console.log(Object.keys(PROJECT_ID_BY_DID).length)
    for(did in PROJECT_ID_BY_DID){
        
        if(AllMetadata.hasOwnProperty(did)){
            //console.log('found1',did)
            var mdata = AllMetadata[did]
            var pid = PROJECT_ID_BY_DID[did]
            //console.log('pid',pid)
            pname = PROJECT_INFORMATION_BY_PID[pid].project
            if(mdata.hasOwnProperty(md_selected) && mdata.hasOwnProperty('latitude') && mdata.hasOwnProperty('longitude')){
                if(mdata['latitude'] != 'None' && mdata['longitude'] != 'None'){
                    //console.log('found2',md_selected)
                    var pjds = pname+'--'+DATASET_NAME_BY_DID[did]
                    md_info.metadata[pjds] ={}        
                    md_info.metadata[pjds].pid = pid
                    md_info.metadata[pjds].did = did
                    var data = helpers.required_metadata_names_from_ids(mdata, md_selected)
                    md_info.metadata[pjds].value = data.value
                    //md_info.metadata[pjds].value = mdata[md_selected]
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