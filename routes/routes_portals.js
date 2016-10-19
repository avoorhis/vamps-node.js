var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');
var path  = require('path');

/* GET Portals page. */
router.get('/portals_index', function(req, res) {
    res.render('portals/portals_index', { 
            title: 'VAMPS:Portals',
            portals : JSON.stringify(req.CONSTS.PORTALS),
            user: req.user,hostname: req.CONFIG.hostname,
            message:'',
        });
});
//
//
//
router.get('/visuals_index/:portal', function(req, res) {
    console.log('in portals visuals_index')
    console.log(ALL_DATASETS);
    
    var portal = req.params.portal;
    console.log('visuals_index: '+portal);
    
    var project_list = helpers.get_portal_projects(req, portal)
    
    
    // GLOBAL
    SHOW_DATA = project_list;
    
    res.render('visuals/visuals_index', { 
            title     : 'VAMPS:Portals:Dataset Selection',
            subtitle  : "Dataset Selection Page",
            proj_info : JSON.stringify(PROJECT_INFORMATION_BY_PID),
            constants : JSON.stringify(req.CONSTS),
            md_names    : AllMetadataNames,
            filtering : 0,
            portal_to_show : portal,
            data_to_open : JSON.stringify({}),
            user      : req.user,hostname: req.CONFIG.hostname,
            message   :'',
        });
});
//
// PROJECTS
//
router.get('/projects/:portal', function(req, res) {
    console.log('in projects/:portal')
    var portal = req.params.portal;
    var project_list = helpers.get_portal_projects(req, portal)
    
    project_list.sort(function(a, b){
          return helpers.compareStrings_alpha(a.project, b.project);
    });
    console.log(project_list)
    res.render('portals/projects', { 
            title     : 'VAMPS:'+portal+'Portals',
            user      : req.user,hostname: req.CONFIG.hostname,
            portal    : req.CONSTS.PORTALS[portal].pagetitle,
            projects  : JSON.stringify(project_list),
            message   : '',
        });
});
//
// METADATA
//
router.get('/metadata/:portal', function(req, res) {
    var portal = req.params.portal;

    res.render('portals/metadata', { 
            title: 'VAMPS:'+portal+' Portal Metadata',
            user: req.user,hostname: req.CONFIG.hostname,
            portal:portal,
            message:'',
        });
});

router.get('/:portal', function(req, res) {
    console.log('in /:portal')
    var portal = req.params.portal;
    var pagetitle, maintitle, subtitle;

    var pi = req.CONSTS.PORTALS[portal]
    console.log('pi',pi)
    res.render('portals/home', { 
            title       : pi.pagetitle,
            maintitle   : pi.maintitle,
            subtitle    : pi.subtitle,
            portal      : portal,
            user: req.user,hostname: req.CONFIG.hostname,
            message:'',
        });
    
});
router.get('/geomap/:portal', function(req, res) {
    console.log('in geomap')
    var portal = req.params.portal;

// { 'ICM_CNE_Bv6--CNE_0001_2003_04_14': 
//    { latitude: '0.0',
//      longitude: '0.0',
//      project: 'ICM_CNE_Bv6',
//      dataset: 'CNE_0001_2003_04_14' },
//   'ICM_CNE_Bv6--CNE_0002_2003_07_03': 
//    { latitude: '0.0',
//      longitude: '0.0',
//      project: 'ICM_CNE_Bv6',
//      dataset: 'CNE_0002_2003_07_03' },
//   'ICM_CNE_Bv6--CNE_0003_2003_10_11': 
//    { latitude: '0.0',
//      longitude: '0.0',
//      project: 'ICM_CNE_Bv6',
//      dataset: 'CNE_0003_2003_10_11' },
//   'ICM_CNE_Bv6--CNE_0004_2004_01_22': 
//    { latitude: '0.0',
//      longitude: '0.0',
//      project: 'ICM_CNE_Bv6',
//      dataset: 'CNE_0004_2004_01_22' } 
//  }

    var portal_info = get_portal_metadata(req, portal)
    //console.log('FOUND '+JSON.stringify(portal_info))
    res.render('portals/geomap', { 
            title       : 'VAMPS: Geomap',
            portal      : portal,
            portal_info : JSON.stringify(portal_info[portal]),
            user: req.user,hostname: req.CONFIG.hostname,
            message:'',
        });

});


module.exports = router;

//
//  FUNCTIONS
//
function get_portal_metadata(req, portal){
    // all_metadata is by did
    
    portal_info = {}
    portal_info[portal] = {}
    portal_info[portal].metadata = {}
    var project_list = helpers.get_portal_projects(req, portal)
    var pi = req.CONSTS.PORTALS[portal]
  
    
    //console.log('all_metadata 1361 RARE_EFF--EFF_20090112')
    //console.log(all_metadata[1361])
    //console.log(all_metadata[1361].hasOwnProperty('latitude'))
    var got_lat, got_lon
    for(did in DATASET_NAME_BY_DID){
        //did = all_metadata[i]
        pid = PROJECT_ID_BY_DID[did]
        //console.log(PROJECT_INFORMATION_BY_PID[pid])
        pname = PROJECT_INFORMATION_BY_PID[pid].project
        var mdgroup = HDF5_MDATA.openGroup(did+"/metadata");
        mdgroup.refresh()
        if(pi.project_prefixes.length > 0){
            for(p in pi.project_prefixes){
              //console.log('p',p,prefixes[p])
              if( pname.indexOf(pi.project_prefixes[p]) === 0 ){
                  //console.log('FOUND '+pname)
                  pjds = pname+'--'+DATASET_NAME_BY_DID[did]
                  portal_info[portal].metadata[pjds] = {}
                  if(got_lat === false)
                    portal_info[portal].metadata[pjds].latitude = 'notFound'
                  if(got_lon === false)
                    portal_info[portal].metadata[pjds].longitude = 'notFound'
                  portal_info[portal].metadata[pjds].pid = pid
                  portal_info[portal].metadata[pjds].did = did
                  got_lat=false
                  got_lon=false
              
                  //collected_metadata[pjds] = all_metadata[did]
                  if(mdgroup.hasOwnProperty('lat')){
                    portal_info[portal].metadata[pjds].latitude = mdgroup.lat
                    got_lat=true
                  }else if(mdgroup.hasOwnProperty('latitude')){
                    portal_info[portal].metadata[pjds].latitude = mdgroup.latitude
                    got_lat=true
                  }

                  if(mdgroup.hasOwnProperty('lon')){
                    portal_info[portal].metadata[pjds].longitude = mdgroup.lon
                    got_lon=true
                  }else if(mdgroup.hasOwnProperty('longitude')){
                    portal_info[portal].metadata[pjds].longitude = mdgroup.longitude
                    got_lon=true
                  }
                  //collected_metadata[pjds] = { 'lat':all_metadata[did].lat, 'lon':all_metadata[did].lon }
              }       
            }
        }else if(pi.project_names.length > 0){
            for(p in pi.project_names){
              //console.log('p',p,prefixes[p])
              if( pname === pi.project_names[p] ){
                  //console.log('FOUND '+pname)
                  pjds = pname+'--'+DATASET_NAME_BY_DID[did]
                  portal_info[portal].metadata[pjds] = {}
                  if(got_lat === false)
                    portal_info[portal].metadata[pjds].latitude = 'notFound'
                  if(got_lon === false)
                    portal_info[portal].metadata[pjds].longitude = 'notFound'
                  portal_info[portal].metadata[pjds].pid = pid
                  portal_info[portal].metadata[pjds].did = did
                  got_lat=false
                  got_lon=false
              
                  //collected_metadata[pjds] = all_metadata[did]
                  if(mdgroup.hasOwnProperty('lat')){
                    portal_info[portal].metadata[pjds].latitude = mdgroup.lat
                    got_lat=true
                  }else if(mdgroup.hasOwnProperty('latitude')){
                    portal_info[portal].metadata[pjds].latitude = mdgroup.latitude
                    got_lat=true
                  }

                  if(mdgroup.hasOwnProperty('lon')){
                    portal_info[portal].metadata[pjds].longitude = mdgroup.lon
                    got_lon=true
                  }else if(mdgroup.hasOwnProperty('longitude')){
                    portal_info[portal].metadata[pjds].longitude = mdgroup.longitude
                    got_lon=true
                  }
                  //collected_metadata[pjds] = { 'lat':all_metadata[did].lat, 'lon':all_metadata[did].lon }
              }       
            }
        }else  if(portal_suffixes.length > 0){
            for(p in portal_suffixes){
              //console.log('p',p,prefixes[p])
              if( pname.indexOf(portal_suffixes[p]) === (pname.length - portal_suffixes[p].length) ){
                  //console.log('FOUND '+pname)
                  pjds = pname+'--'+DATASET_NAME_BY_DID[did]
                  portal_info[portal].metadata[pjds] = {}
                  if(got_lat === false)
                    portal_info[portal].metadata[pjds].latitude = 'notFound'
                  if(got_lon === false)
                    portal_info[portal].metadata[pjds].longitude = 'notFound'
                  portal_info[portal].metadata[pjds].pid = pid
                  portal_info[portal].metadata[pjds].did = did
                  got_lat=false
                  got_lon=false
              
                  //collected_metadata[pjds] = all_metadata[did]
                  if(mdgroup.hasOwnProperty('lat')){
                    portal_info[portal].metadata[pjds].latitude = mdgroup.lat
                    got_lat=true
                  }else if(mdgroup.hasOwnProperty('latitude')){
                    portal_info[portal].metadata[pjds].latitude = mdgroup.latitude
                    got_lat=true
                  }

                  if(mdgroup.hasOwnProperty('lon')){
                    portal_info[portal].metadata[pjds].longitude = mdgroup.lon
                    got_lon=true
                  }else if(mdgroup.hasOwnProperty('longitude')){
                    portal_info[portal].metadata[pjds].longitude = mdgroup.longitude
                    got_lon=true
                  }
                  //collected_metadata[pjds] = { 'lat':all_metadata[did].lat, 'lon':all_metadata[did].lon }
              }       
            }
        }else{
        
        }
    }

    return portal_info;
}
//
//
//
    
