var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');

/* GET metadata page. */
 router.get('/metadata', function(req, res) {
      console.log('in metadata')
      res.render('metadata/metadata', { title: 'VAMPS:Metadata',
            user: req.user,hostname: req.CONFIG.hostname,
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


module.exports = router;
