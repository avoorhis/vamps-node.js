var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');
var path  = require('path');
var fs   = require('fs-extra');

/* GET Portals page. */
router.get('/portals_index', function(req, res) {
    res.render('portals/portals_index', { 
            title: 'VAMPS:Portals',
            portals : JSON.stringify(req.CONSTS.PORTALS),
            user: req.user,hostname: req.CONFIG.hostname,
        });
});
//
//
//
router.get('/visuals_index/:portal', function(req, res) {
    console.log('in portals visuals_index')
    
    var portal = req.params.portal;
    //console.log('visuals_index: '+portal);
    
    var project_list = helpers.get_portal_projects(req, portal)
    
    
    // GLOBAL
    SHOW_DATA = project_list;
    
    res.render('visuals/visuals_index', { 
            title     : 'VAMPS:Portals:Dataset Selection',
            subtitle  : "Dataset Selection Page",
            proj_info : JSON.stringify(PROJECT_INFORMATION_BY_PID),
            constants : JSON.stringify(req.CONSTS),
            md_env_package : JSON.stringify(MD_ENV_PACKAGE),
            md_names    : AllMetadataNames,
            filtering : 0,
            portal_to_show : portal,
            data_to_open : JSON.stringify({}),
            user      : req.user,hostname: req.CONFIG.hostname,
        });
});
//
// PROJECTS
//
router.get('/projects/:portal', function(req, res) {
    
    var portal = req.params.portal;
    console.log('in projects/:portal:'+portal)
    var project_list = helpers.get_portal_projects(req, portal)
    
    project_list.sort(function(a, b){
          return helpers.compareStrings_alpha(a.project, b.project);
    });
    
        res.render('portals/projects', { 
            title     : 'VAMPS:'+portal+'Portals',
            user      : req.user,hostname: req.CONFIG.hostname,
            portal    : req.CONSTS.PORTALS[portal].pagetitle,
            projects  : JSON.stringify(project_list),
        });
    
});
router.get('/abstracts/CMP', function(req, res) {
    
    var portal = 'CMP'
    console.log('in abstracts/CMP')
    var info_data = {}
    if(portal == 'CMP'){
        var cmp_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS,'abstracts','CMP_info.json')
        //info_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS,'abstracts','DCO_info.json');
        info_data = JSON.parse(fs.readFileSync(cmp_file, 'utf8'));
    }
    var project_list = helpers.get_portal_projects(req, portal)
    
    project_list.sort(function(a, b){
          return helpers.compareStrings_alpha(a.project, b.project);
    });
    
        res.render('portals/coral_microbiome/abstracts', { 
            title     : 'VAMPS:'+portal+'Portals',
            user      : req.user,hostname: req.CONFIG.hostname,
            portal    : req.CONSTS.PORTALS[portal].pagetitle,
            projects  : JSON.stringify(project_list),
            info      : JSON.stringify(info_data),
        });
    
});
//
// METADATA
//
// router.get('/metadata/:portal', function(req, res) {
//     var portal = req.params.portal;
//     console.log('in metadata/:portal:'+portal)
//     var project_list = helpers.get_portal_projects(req, portal)
//     
//     var md = {}
//     for(n in project_list){
//         var pid = project_list[n].pid
//         var dids = DATASET_IDS_BY_PID[pid]
//        
//         
//         md_order = []
//         md_lookup = {}
//         for(m in dids){
//             var pjds = project_list[n].project+'--'+DATASET_NAME_BY_DID[dids[m]]
//             
//             md[pjds] = {}
//             headers = {}
//             for(item in AllMetadata[dids[m]]){
//                 console.log('item '+item)
//                 result = helpers.required_metadata_names_from_ids(AllMetadata[dids[m]], item)
//                 console.log(result)
//                 console.log(result.name +' -- '+result.value)
//                 md[pjds][result.name] = result.value
//                 headers[result.name] = 1
//                 md_lookup[item] = 1
//             }
//             
//         }
//     }
//     md_order = Object.keys(md_lookup)
//     md_order.sort()
//     hd_order = Object.keys(headers)
//     hd_order.sort()
//     console.log(md['CMP_JJ_Bv5v6x--ApD2'])
//     res.render('portals/metadata', { 
//             title  : 'VAMPS:'+portal+' Portal Metadata',
//             user   : req.user,hostname: req.CONFIG.hostname,
//             mdata  : JSON.stringify(md),
//             portal : portal,
//             md_order: JSON.stringify(md_order),
//             hd_order: JSON.stringify(hd_order)
//             
//         });
// });

router.get('/:portal', function(req, res) {
    
    var portal = req.params.portal;
    console.log('in /:portal -'+portal)
    var pagetitle, maintitle, subtitle;
    var info_data = {}
    if(portal == 'CMP'){
        var cmp_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS,'abstracts','CMP_info.json')
        //info_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS,'abstracts','DCO_info.json');
        info_data = JSON.parse(fs.readFileSync(cmp_file, 'utf8'));
    }
    
    var project_list = helpers.get_portal_projects(req, portal)
    
    project_list.sort(function(a, b){
          return helpers.compareStrings_alpha(a.project, b.project);
    });
    //console.log('project_list')
    //console.log(project_list)
    //console.log('info')
    //console.log(info_data)
    var pi = req.CONSTS.PORTALS[portal]
    
    res.render('portals/home', { 
            title       : pi.pagetitle,
            maintitle   : pi.maintitle,
            subtitle    : pi.subtitle,
            portal      : portal,
            projects  : JSON.stringify(project_list),
            info : JSON.stringify(info_data),
            user: req.user,hostname: req.CONFIG.hostname,
        });
    
});
router.get('/geomap/:portal', function(req, res) {
    console.log('in geomap')
    var portal = req.params.portal;

    var portal_info = get_portal_metadata(req, portal)
    portal_info[portal].zoom = req.CONSTS.PORTALS[portal].zoom
    //console.log('FOUND '+JSON.stringify(portal_info))
    res.render('portals/geomap', { 
            title       : 'VAMPS: Geomap',
            portal      : portal,
            portal_info : JSON.stringify(portal_info[portal]),
            user: req.user,hostname: req.CONFIG.hostname,
            token       : req.CONFIG.MAPBOX_TOKEN,
        });

});

// router.get('/coral_microbiome/background', function(req, res) {
//     console.log('in /coral_microbiome/background')
//     // var portal = req.params.portal;
// // 
// //     var portal_info = get_portal_metadata(req, portal)
// //     portal_info[portal].zoom = req.CONSTS.PORTALS[portal].zoom
// //     //console.log('FOUND '+JSON.stringify(portal_info))
//     res.render('portals/coral_microbiome/background', { 
//             title       : 'VAMPS: Background',
//             user: req.user,hostname: req.CONFIG.hostname,
//             
//         });
// 
// });

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
  
    
    
    for(did in DATASET_NAME_BY_DID){   // too big
        //did = all_metadata[i]
        pid = PROJECT_ID_BY_DID[did]
        //console.log(PROJECT_INFORMATION_BY_PID[pid])
        pname = PROJECT_INFORMATION_BY_PID[pid].project
        
        dataset_metadata = AllMetadata[did] || {}
            
        
        if(pi.prefixes.length > 0){
            //console.log('prefixes')
            for(p in pi.prefixes){  // CMP
              //console.log('p1',p,prefixes[p])
              if( pname.substring(0, pi.prefixes[p].length) === pi.prefixes[p] ){
                  
                  pjds = pname+'--'+DATASET_NAME_BY_DID[did]
                  portal_info[portal].metadata[pjds] = {}
                  
                  portal_info[portal].metadata[pjds].pid = pid
                  portal_info[portal].metadata[pjds].did = did
                  
              
                  //collected_metadata[pjds] = all_metadata[did]
                                    
                    //console.log('FOUND in prefixes1 '+did+' - '+pname)
                    if(dataset_metadata.hasOwnProperty('latitude')){
                        portal_info[portal].metadata[pjds].latitude = dataset_metadata.latitude
                    }else{
                        portal_info[portal].metadata[pjds].latitude = ''
                    } 
                    //console.log('FOUND in prefixes2 '+did+' - '+pname)                       
                    if(dataset_metadata.hasOwnProperty('longitude')){
                        portal_info[portal].metadata[pjds].longitude = dataset_metadata.longitude
                    }else{
                        portal_info[portal].metadata[pjds].longitude = ''
                    }
                    //console.log('FOUND in prefixes3 '+did+' - '+pname)                     
                  
                  //collected_metadata[pjds] = { 'lat':all_metadata[did].lat, 'lon':all_metadata[did].lon }
              }       
            }
        }
        //
        if(pi.projects.length > 0){
            //console.log('projects')
            for(p in pi.projects){
              //console.log('p2',p,prefixes[p])
              if( pname === pi.projects[p] ){
                  //console.log('FOUND in projects '+pname)
                  pjds = pname+'--'+DATASET_NAME_BY_DID[did]
                  portal_info[portal].metadata[pjds] = {}
                  portal_info[portal].metadata[pjds].pid = pid
                  portal_info[portal].metadata[pjds].did = did
              
                                       
                if(dataset_metadata.hasOwnProperty('latitude')){
                    portal_info[portal].metadata[pjds].latitude = dataset_metadata.latitude
                }else{
                    portal_info[portal].metadata[pjds].latitude = ''
                }                        
                if(dataset_metadata.hasOwnProperty('longitude')){
                    portal_info[portal].metadata[pjds].longitude = dataset_metadata.longitude
                }else{
                    portal_info[portal].metadata[pjds].longitude = ''
                }                                    
                  
              }       
            }
        }
        //
        if(pi.suffixes.length > 0){
            //console.log('suffixes')
            for(p in pi.suffixes){
              //console.log('p3',p,pi.suffixes[p])
              if( pname.substring(pname.length - pi.suffixes[p].length) === pi.suffixes[p] ){
                 // console.log('FOUND in suffixes '+pname)
                  pjds = pname+'--'+DATASET_NAME_BY_DID[did]
                  portal_info[portal].metadata[pjds] = {}
                  portal_info[portal].metadata[pjds].pid = pid
                  portal_info[portal].metadata[pjds].did = did
              
                                        
                if(dataset_metadata.hasOwnProperty('latitude')){
                    portal_info[portal].metadata[pjds].latitude = dataset_metadata.latitude
                }else{
                    portal_info[portal].metadata[pjds].latitude = ''
                }                        
                if(dataset_metadata.hasOwnProperty('longitude')){
                    portal_info[portal].metadata[pjds].longitude = dataset_metadata.longitude
                }else{
                    portal_info[portal].metadata[pjds].longitude = ''
                }                                      
                  
              }       
            }
        }else{
        
        }
    }
    //console.log('JSON.stringify(portal_info)')
    //console.log(JSON.stringify(portal_info))
    return portal_info;
}
//
//
//
    
