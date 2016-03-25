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
      //console.log(AllMetadata)
      res.render('metadata/metadata_list', { title: 'VAMPS:Metadata List',
            user:         req.user,hostname: req.CONFIG.hostname,
            metadata:     AllMetadataNames,
            names_by_did: JSON.stringify(DATASET_NAME_BY_DID),
            pid_by_did:   JSON.stringify(PROJECT_ID_BY_DID),
            pinfo_by_pid: JSON.stringify(PROJECT_INFORMATION_BY_PID),
            allmetadata:  JSON.stringify(AllMetadata),

	  				message:  '',
                            });
  });

router.get('/list_result/:item', helpers.isLoggedIn, function(req, res) {
      console.log('in metadatalist result')
      var item = req.params.item;
      console.log(item)
      var did_list = [];
      for(did in AllMetadata){
      	if(item in AllMetadata[did]){
      		did_list.push(did)
      	}
      }
      res.render('metadata/list_result', { title: 'VAMPS:Metadata List Result',
            user:         req.user,hostname: req.CONFIG.hostname,
            dids:     		did_list,
            names_by_did: JSON.stringify(DATASET_NAME_BY_DID),
            pid_by_did:   JSON.stringify(PROJECT_ID_BY_DID),
            pinfo_by_pid: JSON.stringify(PROJECT_INFORMATION_BY_PID),  
            all_metadata:  JSON.stringify(AllMetadata),       
            item:         item,
	  				message:  '',
                            });
  });

router.get('/geomap/:item', helpers.isLoggedIn, function(req, res) {
      console.log('in metadata - geomap')
      var md_item = req.params.item;
      //console.log(AllMetadata)
      var metadata_info = get_metadata_hash(md_item, AllMetadata)
      //console.log(metadata_info)
      res.render('metadata/geomap', { title: 'VAMPS:Metadata Distribution',
            user    : req.user,hostname: req.CONFIG.hostname,
            md_item : md_item,
            mdinfo  : JSON.stringify(metadata_info),
            gekey     : req.CONFIG.GOOGLE_EARTH_KEY,
            message:  '',
                            });
  });

module.exports = router;

//////////////////////////////
function get_metadata_hash(md_item, all_metadata){
    var md_info = {}
    //md_info[md_item] = {}
    md_info.metadata = {}
    var got_lat, got_lon
    for(did in all_metadata){
        //did = all_metadata[i]

        //all_metadata.forEach(function(did) {
        pid = PROJECT_ID_BY_DID[did]
        //console.log(all_metadata[did])
        pname = PROJECT_INFORMATION_BY_PID[pid].project
        
        //console.log('p',p,prefixes[p])
        
        //console.log('FOUND '+pname)

        if(all_metadata[did].hasOwnProperty(md_item)){
            pjds = pname+'--'+DATASET_NAME_BY_DID[did]
            md_info.metadata[pjds] ={}
            

            if(got_lat === false)
              md_info.metadata[pjds].latitude = 'notFound'
            if(got_lon === false)
              md_info.metadata[pjds].longitude = 'notFound'
            md_info.metadata[pjds].pid = pid
            md_info.metadata[pjds].did = did
            md_info.metadata[pjds].value = all_metadata[did][md_item]

            got_lat=false
            got_lon=false
            
            //collected_metadata[pjds] = all_metadata[did]
            if(all_metadata[did].hasOwnProperty('lat')){
              md_info.metadata[pjds].latitude = all_metadata[did].lat
              got_lat=true
            }else if(all_metadata[did].hasOwnProperty('latitude')){
              md_info.metadata[pjds].latitude = all_metadata[did].latitude
              got_lat=true
            }

            if(all_metadata[did].hasOwnProperty('lon')){
              md_info.metadata[pjds].longitude = all_metadata[did].lon
              got_lon=true
            }else if(all_metadata[did].hasOwnProperty('longitude')){
              md_info.metadata[pjds].longitude = all_metadata[did].longitude
              got_lon=true
            }
        //collected_metadata[pjds] = { 'lat':all_metadata[did].lat, 'lon':all_metadata[did].lon }
        }
          
       
    }

    return md_info;

}