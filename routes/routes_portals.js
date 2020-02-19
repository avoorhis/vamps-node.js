const express = require('express');
var router = express.Router();
const helpers = require(app_root + '/routes/helpers/helpers');
const C = require(app_root + '/public/constants');
const path  = require('path');
const fs   = require('fs-extra');

/* GET Portals page. */
router.get('/portals_index', (req, res) => {
    res.render('portals/portals_index', { 
            title: 'VAMPS:Portals',
            portals : JSON.stringify(C.PORTALS),
            user: req.user,hostname: req.CONFIG.hostname,
        });
});
//
//
//
router.get('/visuals_index/:portal', helpers.isLoggedIn, (req, res) => {
    console.log('in portals visuals_index')
    
    var portal = req.params.portal;
    //console.log('visuals_index: '+portal);
    
    var project_list = helpers.get_portal_projects(req, portal)
    
    
    // GLOBAL
    SHOW_DATA = project_list;
    
    res.render('visuals/visuals_index', { 
            title     : 'VAMPS:Portals:Dataset Selection',
            subtitle  : "Dataset Selection Page",

            proj_info : JSON.stringify(C.PROJECT_INFORMATION_BY_PID),
            constants : JSON.stringify(C),
            md_env_package : JSON.stringify(C.MD_ENV_PACKAGE),
            md_names    : C.AllMetadataNames,
            filtering : 0,
            portal_to_show : portal,
            data_to_open : JSON.stringify({}),
            user      : req.user,hostname: req.CONFIG.hostname,
        });
});
//
// PROJECTS
//
router.get('/projects/:portal',  (req, res) => {
    
    var portal = req.params.portal;
    console.log('in projects/:portal:'+portal)
    var project_list = helpers.get_portal_projects(req, portal)
    //console.log(project_list)
    //console.log(req.query)
    
    if(req.query.hasOwnProperty('dco_code')){        
        var alter_dco_list = req.query['dco_code']        
    }else{
        var alter_dco_list = 'none'
    }
    //console.log('alter_dco_list')
    //console.log(alter_dco_list)
    project_list.sort( (a, b) => {
          return helpers.compareStrings_alpha(a.project, b.project);
    });
    
        res.render('portals/projects', { 
            title     : 'VAMPS:'+portal+'Portals',
            user      : req.user,hostname: req.CONFIG.hostname,
            pagetitle : C.PORTALS[portal].pagetitle,
            portal_code    : portal,
            projects  : JSON.stringify(project_list),
            alter_dco_code: alter_dco_list
        });
    
});
//
//
router.post('/dco_project_list',  (req, res) => {
    
    console.log('in dco_project_list')
    console.log(req.body)
    var list_type = req.body.value;
    var sort_col = req.body.sortby;
    var direction = req.body.dir;
    var projects        = [];
    var project_list = helpers.get_portal_projects(req, 'CODL')
    //console.log(C.DatasetsWithLatLong)
    
    let publish_data = {}
    try{
        info_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS, req.CONFIG.INFO_FILES['dco']);
        publish_data = JSON.parse(fs.readFileSync(info_file, 'utf8'));
    }catch(e) {
        publish_data = {};
    }
    
    //console.log(publish_data)
    // start with all DCO projects COMPLETE
    // then, if find empty did, convert to PARTIAL
    // Count datasets with
    let pids_with_latlon = {}
    for(did in C.DatasetsWithLatLong){
        if(C.DatasetsWithLatLong[did].latitude != '' || C.DatasetsWithLatLong[did].longitude != ''){
            pids_with_latlon[C.DatasetsWithLatLong[did].pid] = 1
        }    
    }
    
     //console.log(pids_with_latlon)
    let new_dco_list_latlon = {}
    project_list.forEach( prj => {
        if(list_type=='ampl'){ 
            if(prj.metagenomic == 0){
                projects.push(prj)
            }
        }else if(list_type== 'sgun'){
            if(prj.metagenomic == 1){
                projects.push(prj)
            }
        }else{  // all
            projects.push(prj)
        }
        new_dco_list_latlon[prj.pid] = 'EMPTY'
    })
    //for(pid in new_dco_list_latlon){
    
    //}
    
    for(did in C.DatasetsWithLatLong){
        //console.log(C.DatasetsWithLatLong[did].pid)
        //console.log(C.DatasetsWithLatLong[did])
        if(new_dco_list_latlon.hasOwnProperty(C.DatasetsWithLatLong[did].pid) == true){
            if(new_dco_list_latlon[C.DatasetsWithLatLong[did].pid] == 'EMPTY'){
                new_dco_list_latlon[C.DatasetsWithLatLong[did].pid] = 1
            }else{
                new_dco_list_latlon[C.DatasetsWithLatLong[did].pid] += 1
            }            
        }     
    }
    for(pid in new_dco_list_latlon){
        //console.log(DATASET_IDS_BY_PID[pid].length)
        //console.log(new_dco_list_latlon[pid])
        if(DATASET_IDS_BY_PID[pid].length == new_dco_list_latlon[pid]){
            new_dco_list_latlon[pid] = 'COMPLETE'
        }
        if(new_dco_list_latlon[pid] != 'EMPTY' && new_dco_list_latlon[pid] != 'COMPLETE'){
            new_dco_list_latlon[pid] = 'PARTIAL'
        }
        
    }
    
    projects.forEach( prj => {
        prj.latlon_status = new_dco_list_latlon[prj.pid]
        proj_prefix = prj.project.substring(0,prj.project.lastIndexOf('_'))  // ie DCO_SPO_Ev9 ==> DCO_SPO
        prj.accessions = []
        if(proj_prefix in publish_data){
            //if(publish_data[proj_prefix].hasOwnProperty('sra_accessions')){
            for(n in publish_data[proj_prefix]['sra_accessions']){
                if(publish_data[proj_prefix]['sra_accessions'][n].hasOwnProperty('bioproject')){
                    prj.accessions.push(publish_data[proj_prefix]['sra_accessions'][n]['bioproject'])
                }
            }
            //}
        }
        //prj.accession = publish_data.sra_accessions
    
    })
    //console.log(projects)
    //console.log(new_dco_list_latlon)
    // fwd rev
    // if(fwd == true){
//         fwd = false
//     }else{
//     
//     }
    projects.sort( (a, b) => {
        if(sort_col == 'project'){
            if(direction == 'fwd'){  
                return helpers.compareStrings_alpha(a.project, b.project);
            }else{
                return helpers.compareStrings_alpha(b.project, a.project);
            }
       //  }
//         else if(sort_col == 'accession'){
//             if(direction == 'fwd'){  
//                 return helpers.compareStrings_alpha(a.accession[0], b.accession[0]);
//             }else{
//                 return helpers.compareStrings_alpha(b.accession[0], a.accession[0]);
//             }
        }else if(sort_col == 'title'){
            if(direction == 'fwd'){  
                return helpers.compareStrings_alpha(a.title, b.title);
            }else{
                return helpers.compareStrings_alpha(b.title, a.title);
            }
        }else if(sort_col == 'user'){
            if(direction == 'fwd'){  
                return helpers.compareStrings_alpha(a.username, b.username);
            }else{
                return helpers.compareStrings_alpha(b.username, a.username);
            }
        }else if(sort_col == 'email'){
            if(direction == 'fwd'){  
                return helpers.compareStrings_alpha(a.email, b.email);
            }else{
                return helpers.compareStrings_alpha(b.email, a.email);
            }
        }else if(sort_col == 'inst'){
            if(direction == 'fwd'){  
                return helpers.compareStrings_alpha(a.institution, b.institution);
            }else{
                return helpers.compareStrings_alpha(b.institution, a.institution);
            }
        }else if(sort_col == 'status'){
            if(direction == 'fwd'){  
                return helpers.compareStrings_int(a.public, b.public);
            }else{
                return helpers.compareStrings_int(b.public, a.public);
            }
        }else if(sort_col == 'md'){
            if(direction == 'fwd'){  
                return helpers.compareStrings_alpha(a.latlon_status, b.latlon_status);
            }else{
                return helpers.compareStrings_alpha(b.latlon_status, a.latlon_status);
            }
        }
    });
    //console.log(projects)
    var html = ''
    var cnt = 1;
    html += "** Click table header to sort each column: **<br>"
    html += "<table id='sorted' class='table table-condensed table-striped' >"
    html += "<thead>"
    html += "<tr><th></th><th onclick=\"sort_table('project','"+list_type+"','"+direction+"')\">Name</th>"
    html += "<th onclick=\"sort_table('title','"+list_type+"','"+direction+"')\">Project Title</th>"
    html += "<th onclick=\"sort_table('user','"+list_type+"','"+direction+"')\">P.I. username</th>"
    html += "<th onclick=\"sort_table('email','"+list_type+"','"+direction+"')\">Email</th>"
    html += "<th onclick=\"sort_table('inst','"+list_type+"','"+direction+"')\">Institute</th>"
    html += "<th onclick=\"sort_table('status','"+list_type+"','"+direction+"')\">Status</th>"
    html += "<th onclick=\"sort_table('accession','"+list_type+"','"+direction+"')\">Accession</th>"
    html += "<th onclick=\"sort_table('md','"+list_type+"','"+direction+"')\">Lat/Lon Metadata Status</th></tr>"
    html += "</thead>"
    html += "<tbody>"
    projects.forEach( prj => {
        //console.log(prj.pid)
        html += "<tr>"
        html += "<td>"+cnt+"</td>"
        html += "<td><a class='tooltip_pname' href='/projects/"+prj.pid+"'>"+prj.project+"</a></td>"
        html += "<td>"+prj.title+"</td>"
        html += "<td>"+prj.username+"</td>"
        html += "<td>"+prj.email+"</td>"
        html += "<td>"+prj.institution+"</td>"
        if(prj.public == 1){
            html += "<td>public</td>"
        }else{
            html += "<td>private</td>"
        }
        html += "<td>"
        for(n in prj.accessions){
            html += "<a href='https://www.ncbi.nlm.nih.gov/bioproject?term="+prj.accessions[n]+"' target='_blank'>"+prj.accessions[n]+"</a><br>"
        }
        html += "</td>"
        html += "<td>"+prj.latlon_status+"</td>"
        
        
        html += "</tr>"
        cnt += 1
    })
    html += "</tbody>"
    html += "</table>"
    
    
    res.send(html);    
    
});
router.get('/abstracts/CMP', (req, res) => {
    
    var portal = 'CMP'
    console.log('in abstracts/CMP')
    var info_data = {}
    if(portal == 'CMP'){
        var cmp_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS, req.CONFIG.INFO_FILES['cmp'])
        info_data = JSON.parse(fs.readFileSync(cmp_file, 'utf8'));
    }
    var project_list = helpers.get_portal_projects(req, portal)
    
    project_list.sort( (a, b) => {
          return helpers.compareStrings_alpha(a.project, b.project);
    });
    
        res.render('portals/coral_microbiome/abstracts', { 
            title     : 'VAMPS:'+portal+'Portals',
            user      : req.user,hostname: req.CONFIG.hostname,
            portal    : C.PORTALS[portal].pagetitle,
            projects  : JSON.stringify(project_list),
            info      : JSON.stringify(info_data),
        });
    
});
//
// METADATA
//
// router.get('/metadata/:portal', (req, res) => {
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

router.get('/:portal', (req, res) => {
    
    var portal = req.params.portal;
    console.log('in /:portal -'+portal)
    var pagetitle, maintitle, subtitle;
    var info_data = {}
    if(portal == 'CMP'){
        var cmp_file = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS, req.CONFIG.INFO_FILES['cmp'])
        info_data = JSON.parse(fs.readFileSync(cmp_file, 'utf8'));
    }
    
    var project_list = helpers.get_portal_projects(req, portal)
    
    project_list.sort( (a, b) => {
          return helpers.compareStrings_alpha(a.project, b.project);
    });
    //console.log('project_list')
    //console.log(project_list)
    //console.log('info')
    //console.log(info_data)
    var pi = C.PORTALS[portal]
    
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
router.get('/geomap/:portal', (req, res) => {
    console.log('in geomap')
    var portal = req.params.portal;

    var portal_info = get_portal_metadata(req, portal)
    portal_info[portal].zoom = C.PORTALS[portal].zoom
    //console.log('FOUND '+JSON.stringify(portal_info))
    res.render('portals/geomap', { 
            title       : 'VAMPS: Geomap',
            portal      : portal,
            portal_info : JSON.stringify(portal_info[portal]),
            user: req.user,hostname: req.CONFIG.hostname,
            token       : req.CONFIG.MAPBOX_TOKEN,
        });

});

router.get('/protocol_list/:portal', (req, res) => {
    console.log('in /protocol_list/:portal')
    let portal = req.params.portal;
    console.log(portal)
    if(portal == 'ICOMM') {
        let protocol_dir = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS, 'protocols')
        let protocol_list = []
        console.log(protocol_dir)
        fs.readdir(protocol_dir, (err, files) => {
            files.forEach(file => {
                console.log(file);
                let file_w_dnld_path = path.join('protocols',file)
                protocol_list.push({file_w_path:file_w_dnld_path, file_name:file})
            });

            res.render('portals/census_of_marine_microbes/protocol_list', {
                title       : 'VAMPS: ICoMM Protocols',
                user: req.user,hostname: req.CONFIG.hostname,
                p_list: JSON.stringify(protocol_list)
            });
        });

    }
//
//     var portal_info = get_portal_metadata(req, portal)
//     portal_info[portal].zoom = C.PORTALS[portal].zoom
//     //console.log('FOUND '+JSON.stringify(portal_info))
//

});

module.exports = router;

//
//  FUNCTIONS
//
function get_portal_metadata(req, portal){
    // all_metadata is by did
    
    let portal_info = {}
    portal_info[portal] = {}
    portal_info[portal].metadata = {}
    var project_list = helpers.get_portal_projects(req, portal)
    var pi = C.PORTALS[portal]
  
    
    
    for(did in C.DATASET_NAME_BY_DID){   // too big
        //did = all_metadata[i]
        pid = C.PROJECT_ID_BY_DID[did]
        //console.log(PROJECT_INFORMATION_BY_PID[pid])
        pname = C.PROJECT_INFORMATION_BY_PID[pid].project
        
        dataset_metadata = C.AllMetadata[did] || {}
            
        
        if(pi.prefixes.length > 0){
            //console.log('prefixes')
            for(p in pi.prefixes){  // CMP
              //console.log('p1',p,prefixes[p])
              if( pname.substring(0, pi.prefixes[p].length) === pi.prefixes[p] ){
                  
                  pjds = pname+'--'+ C.DATASET_NAME_BY_DID[did]
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
                  pjds = pname+'--'+C.DATASET_NAME_BY_DID[did]
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
                  pjds = pname+'--'+C.DATASET_NAME_BY_DID[did]
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
    
