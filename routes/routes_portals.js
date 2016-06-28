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
    
    var pi = get_portinfo(req, portal)

    console.log('pi',pi)
    
    // ALL_DATASETS.projects.forEach(function(prj) {
      
    //   if(prj.name.indexOf(portal) === 0){  // UC, ICM, HMP, MBE ....
    //     some_datasets.projects.push(prj);        
    //   }
    // });
    // GLOBAL
    SHOW_DATA = project_list;
    
    res.render('visuals/visuals_index', { 
            title     : 'VAMPS:Portals:Dataset Selection',
            subtitle  : pi.subtitle+' - Dataset Selection Page',
            //rows     : JSON.stringify(some_datasets),
            proj_info : JSON.stringify(PROJECT_INFORMATION_BY_PID),
            constants : JSON.stringify(req.CONSTS),
            md_names    : AllMetadataNames,
            filtering : 0,
            portal_to_show : portal,
            data_to_open : JSON.stringify({}),
            //portal_name: portal,
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
    //var pi = get_portinfo(req, portal)
    
    //console.log('pi',pi)
    //console.log('pinfo'+JSON.stringify(PROJECT_INFORMATION_BY_PID));
    //console.log('data'+JSON.stringify(some_datasets));
    res.render('portals/projects', { 
            title     : 'VAMPS:'+portal+'Portals',
            user      : req.user,hostname: req.CONFIG.hostname,
            portal    : portal,
            //pinfo     : JSON.stringify(PROJECT_INFORMATION_BY_PID),
            data      : project_list,
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

    var pi = get_portinfo(req, portal)
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

    //console.log(AllMetadata)
    var portal_info = get_portal_metadata(req, portal, AllMetadata)
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
function get_portal_metadata(req, portal, all_metadata){
    // all_metadata is by did
    
    portal_info = {}
    portal_info[portal] = {}
    portal_info[portal].metadata = {}
    var project_list = helpers.get_portal_projects(req, portal)
    var pi = get_portinfo(req, portal)
  
    
    //console.log('all_metadata 1361 RARE_EFF--EFF_20090112')
    //console.log(all_metadata[1361])
    //console.log(all_metadata[1361].hasOwnProperty('latitude'))
    var got_lat, got_lon
    for(did in all_metadata){
        //did = all_metadata[i]

        //all_metadata.forEach(function(did) {
        pid = PROJECT_ID_BY_DID[did]
        //console.log(PROJECT_INFORMATION_BY_PID[pid])
        pname = PROJECT_INFORMATION_BY_PID[pid].project
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
                  if(all_metadata[did].hasOwnProperty('lat')){
                    portal_info[portal].metadata[pjds].latitude = all_metadata[did].lat
                    got_lat=true
                  }else if(all_metadata[did].hasOwnProperty('latitude')){
                    portal_info[portal].metadata[pjds].latitude = all_metadata[did].latitude
                    got_lat=true
                  }

                  if(all_metadata[did].hasOwnProperty('lon')){
                    portal_info[portal].metadata[pjds].longitude = all_metadata[did].lon
                    got_lon=true
                  }else if(all_metadata[did].hasOwnProperty('longitude')){
                    portal_info[portal].metadata[pjds].longitude = all_metadata[did].longitude
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
                  if(all_metadata[did].hasOwnProperty('lat')){
                    portal_info[portal].metadata[pjds].latitude = all_metadata[did].lat
                    got_lat=true
                  }else if(all_metadata[did].hasOwnProperty('latitude')){
                    portal_info[portal].metadata[pjds].latitude = all_metadata[did].latitude
                    got_lat=true
                  }

                  if(all_metadata[did].hasOwnProperty('lon')){
                    portal_info[portal].metadata[pjds].longitude = all_metadata[did].lon
                    got_lon=true
                  }else if(all_metadata[did].hasOwnProperty('longitude')){
                    portal_info[portal].metadata[pjds].longitude = all_metadata[did].longitude
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
                  if(all_metadata[did].hasOwnProperty('lat')){
                    portal_info[portal].metadata[pjds].latitude = all_metadata[did].lat
                    got_lat=true
                  }else if(all_metadata[did].hasOwnProperty('latitude')){
                    portal_info[portal].metadata[pjds].latitude = all_metadata[did].latitude
                    got_lat=true
                  }

                  if(all_metadata[did].hasOwnProperty('lon')){
                    portal_info[portal].metadata[pjds].longitude = all_metadata[did].lon
                    got_lon=true
                  }else if(all_metadata[did].hasOwnProperty('longitude')){
                    portal_info[portal].metadata[pjds].longitude = all_metadata[did].longitude
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
function get_portinfo(req, portal){
    info = {}
    info.projects = []
    info.portal_info = {}
    info.project_prefixes = []
    info.project_names = []
    info.project_suffixes = []
    switch (portal) {
        
        case 'MBE':
            info.pagetitle = 'VAMPS:Microbiology Of the Built Environment Portal';
            info.maintitle   = 'VAMPS: MoBEDAC Portal'
            info.subtitle    = 'Microbiome of the Built Environment -Data Analysis Core.'
            info.project_prefixes = ['MBE'];
            info.zoom = 4  // mostly US?
            
            break;
        case 'ICOMM':
            info.pagetitle = 'VAMPS:International Census of Marine Microbes Portal';
            info.maintitle = 'VAMPS: ICoMM - Microbis Portal'
            info.subtitle = 'The role of the International Census of Marine Microbes (ICoMM) is to promote an agenda and an environment that will accelerate discovery,<br>understanding, and awareness of the global significance of marine microbes.'
            info.project_prefixes = ['ICM','KCK'];
            info.zoom = 2  // worldwide
            
            break;
        case 'HMP':
            info.pagetitle = 'VAMPS:Human Microbiome Project Portal';
            info.maintitle = 'VAMPS: HMP Portal'
            info.subtitle = ''
            info.project_prefixes = ['HMP'];
            info.zoom = 4  // mostly US? Do we even have or want distribution?
            
            break;
        case 'CODL':
            info.pagetitle = 'VAMPS:Census of Deep Life Portal';
            info.maintitle = 'VAMPS: Census of Deep Life Portal'
            info.subtitle = 'The mandate of the Census of Deep Life is to perform a global survey of life in continental and marine subsurface environments using deep DNA sequencing technology.'
            info.project_prefixes = ['DCO'];
            info.zoom = 2  // worldwide
            
            break;
        case 'UC':
            info.pagetitle = 'VAMPS:Ulcerative Colitis Portal';
            info.maintitle = 'VAMPS Ulcerative Colitis Portal'
            info.subtitle = 'The Role of the Gut Microbiota in Ulcerative Colitis<br>NIH Human Microbiome Demonstration Project.'
            info.project_prefixes = [portal];
            info.zoom = 4  // mostly US?
            
            break;
        case 'RARE':
            info.pagetitle = 'VAMPS:The Rare Biosphere Portal';
            info.maintitle = 'VAMPS: Rare Biosphere Portal'
            info.subtitle = 'A New Paradigm for Microbiology.'
            info.project_prefixes = [portal];
            info.zoom = 13  // mostly Falmouth
            
            break;
        case 'CMP':
            info.pagetitle = 'VAMPS:Coral Microbe Project Portal';
            info.maintitle = 'VAMPS: Coral Microbiome Portal'
            info.subtitle = ''
            info.project_prefixes = [portal];
            info.zoom = 3  
            
            break;
        case 'LTER':
            info.pagetitle = 'VAMPS:Microbial Inventory Research Across Diverse Aquatic Sites Portal';
            info.maintitle = 'VAMPS: MIRADA Portal'
            info.subtitle = 'Microbial Inventory Research Across Diverse Aquatic Long Term Ecological Research (LTER) Sites.'
            info.project_prefixes = ['LTR'];
            info.zoom = 5  // mostly US
            
            break;
        case 'UNIEUK':
            info.pagetitle = 'VAMPS:UniEuk';
            info.maintitle = 'VAMPS: UniEuk Portal'
            info.subtitle = 'All Things Eukarya'
            info.project_suffixes = ['Ev9'];
            info.zoom = 2  // worldwide
            
            break;
        case 'PSPHERE':
            info.pagetitle = 'VAMPS:The Plastisphere';
            info.maintitle = 'VAMPS: Plastisphere Portal'
            info.subtitle = 'Bacteria and Plastics'
            info.project_names = ['LAZ_DET_Bv3v4','LAZ_SEA_Bv6','LAZ_SEA_Ev9','LAZ_SEA_Bv6v4'];
            info.zoom = 5  // mostly US
            
            break;
        default:
            console.log('no portal')
            info.pagetitle = 'VAMPS:';
            info.maintitle = 'VAMPS:'
            info.subtitle = ''
            info.project_names = [];
            info.zoom = 2
            
            return
            
    }
    return info;
}
