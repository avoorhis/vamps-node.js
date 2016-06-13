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
    var some_datasets = {}
    some_datasets.projects = []
    var subtitle = get_portal_metadata(portal, {}, true)
    ALL_DATASETS.projects.forEach(function(prj) {
      
      if(prj.name.indexOf(portal) === 0){  // UC, ICM, HMP, MBE ....
        some_datasets.projects.push(prj);        
      }
    });
    // GLOBAL
    SHOW_DATA = some_datasets;
    
    res.render('visuals/visuals_index', { 
            title     : 'VAMPS:Portals:Dataset Selection',
            subtitle  : subtitle+' - Dataset Selection Page',
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
    var portal = req.params.portal;
    some_datasets = []
    ALL_DATASETS.projects.forEach(function(prj) {
      //project = PROJECT_INFORMATION_BY_PID[pid].project
      if(prj.name.indexOf(portal) === 0 ){  // UC, ICM, HMP, MBE ....
        some_datasets.push(prj.pid);        
      }
    });
    console.log('pinfo'+JSON.stringify(PROJECT_INFORMATION_BY_PID));
    res.render('portals/projects', { 
            title     : 'VAMPS:'+portal+'Portals',
            user      : req.user,hostname: req.CONFIG.hostname,
            portal    : portal,
            pinfo     : JSON.stringify(PROJECT_INFORMATION_BY_PID),
            data      : some_datasets,
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
    
    var portal = req.params.portal;
    var pagetitle, maintitle, subtitle;
    switch (portal) {
    
        case 'MBE':
            pagetitle = 'VAMPS:Microbiology Of the Built Environment Portal';
            maintitle   = 'VAMPS: MoBEDAC Portal'
            subtitle    = 'Microbiome of the Built Environment -Data Analysis Core.'
            break;
        case 'ICOMM':
            pagetitle = 'VAMPS:International Census of Marine Microbes Portal';
            maintitle = 'VAMPS: ICoMM - Microbis Portal'
            subtitle = 'The role of the International Census of Marine Microbes (ICoMM) is to promote an agenda and an environment that will accelerate discovery,<br>understanding, and awareness of the global significance of marine microbes.'
            break;
        case 'HMP':
            pagetitle = 'VAMPS:Human Microbiome Project Portal';
            maintitle = 'VAMPS: HMP Portal'
            subtitle = ''
            break;
        case 'CODL':
            pagetitle = 'VAMPS:Census of Deep Life Portal';
            maintitle = 'VAMPS: Census of Deep Life Portal'
            subtitle = 'The mandate of the Census of Deep Life is to perform a global survey of life in continental and marine subsurface environments using deep DNA sequencing technology.'
            break;
        case 'UC':
            pagetitle = 'VAMPS:Ulcerative Colitis Portal';
            maintitle = 'VAMPS Ulcerative Colitis Portal'
            subtitle = 'The Role of the Gut Microbiota in Ulcerative Colitis<br>NIH Human Microbiome Demonstration Project.'
            break;
        case 'RARE':
            pagetitle = 'VAMPS:The Rare Biosphere Portal';
            maintitle = 'VAMPS: Rare Biosphere Portal'
            subtitle = 'A New Paradigm for Microbiology.'
            break;
        case 'CMP':
            pagetitle = 'VAMPS:Coral Microbe Project Portal';
            maintitle = 'VAMPS: Coral Microbiome Portal'
            subtitle = ''
            break;
        case 'LTER':
            pagetitle = 'VAMPS:Microbial Inventory Research Across Diverse Aquatic Sites Portal';
            maintitle = 'VAMPS: MIRADA Portal'
            subtitle = 'Microbial Inventory Research Across Diverse Aquatic Long Term Ecological Research (LTER) Sites.'
            break;
        case 'UNIEUK':

            pagetitle = 'VAMPS:UniEuk';
            maintitle = 'VAMPS: UniEuk Portal'
            subtitle = 'All Things Eukarya'
            break;
        case 'PSPHERE':
            pagetitle = 'VAMPS:The Plastisphere';
            maintitle = 'VAMPS: Plastisphere Portal'
            subtitle = 'Bacteria and Plastics'

            break;
        default:
            console.log('no portal')
            res.render('portals/portals_index', { 
                title: 'VAMPS:Portals',                
                user: req.user,hostname: req.CONFIG.hostname,
                message:'',
            });
            return
            
    }
    
    res.render('portals/home', { 
            title       : pagetitle,
            maintitle   : maintitle,
            subtitle    : subtitle,
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
    var portal_info = get_portal_metadata(portal, AllMetadata, false)
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
function get_portal_metadata(portal, all_metadata, get_subtitle){
    // all_metadata is by did
    
    portal_info = {}
    portal_info[portal] = {}
    portal_info[portal].metadata = {}
    project_prefixes = []
    portal_projects = []
    portal_suffixes = []
    switch (portal) {
    
      case 'MBE':
          project_prefixes = ['MBE'];
          portal_info[portal].zoom = 4  // mostly US?
          subtitle = 'Microbiology of the Built Environment Portal'
          break;
      case 'ICOMM':
          project_prefixes = ['ICM','KCK'];
          portal_info[portal].zoom = 2  // worldwide
          subtitle = 'ICoMM Portal'
          break;
      case 'HMP':
          project_prefixes = ['HMP'];
          portal_info[portal].zoom = 4  // mostly US? Do we even have or want distribution?
          subtitle = 'Human Microbiome Project Portal'
          break;
      case 'CODL':
          project_prefixes = ['DCO'];
          portal_info[portal].zoom = 2  // worldwide
          subtitle = 'Census of Deep Life Portal'
          break;
      case 'UC':
          project_prefixes = [portal];
          portal_info[portal].zoom = 4  // mostly US?
          subtitle = 'Ulcerative Colitis Portal'
          break;
      case 'RARE':
          project_prefixes = [portal];
          portal_info[portal].zoom = 13  // mostly Falmouth
          subtitle = 'The Rare Biosphere Portal'
          break;
      case 'CMP':
          project_prefixes = [portal];
          portal_info[portal].zoom = 3  // mostly Falmouth
          subtitle = 'The Coral Microbiome Project'
          break;
      case 'LTER':
          project_prefixes = ['LTR'];
          portal_info[portal].zoom = 5  // mostly US
          subtitle = 'MIRADA Portal'
          break;
      case 'UNIEUK':
          portal_suffixes = ['Ev9'];
          portal_info[portal].zoom = 2  // worldwide
          subtitle = 'UniEuk'
          break;
        case 'PSPHERE':
          portal_projects = ['LAZ_DET_Bv3v4','LAZ_SEA_Bv6','LAZ_SEA_Ev9','LAZ_SEA_Bv6v4'];
          portal_info[portal].zoom = 5  // mostly US
          subtitle = 'Plastisphere Portal'
          break;
      default:
          console.log('no portal found -- loading all data')
    }
    if(get_subtitle){
        return subtitle
    }
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
        if(portal_prefixes.length > 0){
            for(p in portal_prefixes){
              //console.log('p',p,prefixes[p])
              if( pname.indexOf(portal_prefixes[p]) === 0 ){
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
        }else if(portal_projects.length > 0){
            for(p in portal_projects){
              //console.log('p',p,prefixes[p])
              if( pname === portal_projects[p] ){
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


