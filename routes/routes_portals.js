var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');
var path  = require('path');

/* GET Portals page. */
router.get('/portals_index', function(req, res) {
    res.render('portals/portals_index', { 
    		title: 'VAMPS:Portals',
            user: req.user,hostname: req.C.hostname,
    		message:'',
                          });
});
router.get('/visuals_index/:portal', function(req, res) {
    console.log('in portals visuals_index')
    console.log(ALL_DATASETS);
    
    var portal = req.params.portal;
    console.log('xportal '+portal);
    var some_datasets = {}
    some_datasets.projects = []
    ALL_DATASETS.projects.forEach(function(prj) {
      parts = prj.name.split('_')
      if(parts[0] == portal){  // UC, ICM, HMP, MBE ....
        some_datasets.projects.push(prj);        
      }
    });
    SHOW_DATA = some_datasets;
    console.log('some'+JSON.stringify(some_datasets));
    res.render('visuals/visuals_index', { 
            title: 'VAMPS:Portals_Index',
            //rows     : JSON.stringify(some_datasets),
            proj_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
            constants: JSON.stringify(req.C),
            filtering: 0,
            //portal_name: portal,
            user: req.user,hostname: req.C.hostname,
            message:'',
                          });
});
//
//  MOBE
//
router.get('/mobe/mobe_index', function(req, res) {
    res.render('portals/mobe/mobe_index', { 
    		title: 'VAMPS:Microbiology Of the Built Environment Portal',
            user: req.user,hostname: req.C.hostname,
    		message:'',
        });
});
//
//  ICOMM
//
router.get('/icomm/icomm_index', function(req, res) {
    res.render('portals/icomm/icomm_index', { 
        title: 'VAMPS:International Census of Marine Microbes Portal',
        user: req.user,hostname: req.C.hostname,
        message:'',
        });
});
//
//  HMP
//
router.get('/hmp/hmp_index', function(req, res) {
    res.render('portals/hmp/hmp_index', { 
        title: 'VAMPS:Human Microbiome Project Portal',
        user: req.user,hostname: req.C.hostname,
        message:'',
        });
});
//
//  CODL
//
router.get('/codl/codl_index', function(req, res) {
    res.render('portals/codl/codl_index', { 
        title: 'VAMPS:Census of Deep Life Portal',
        user: req.user,hostname: req.C.hostname,
        message:'',
        });
});
//
//  UC
//
router.get('/uc/uc_index', function(req, res) {
    res.render('portals/uc/uc_index', { 
        title: 'VAMPS:Ulcerative Colitis Portal',
        user: req.user,hostname: req.C.hostname,
        message:'',
        });
});
//
//  RARE
//
router.get('/rare/rare_index', function(req, res) {
    res.render('portals/rare/rare_index', { 
        title: 'VAMPS:The Rare Biosphere Portal',
        user: req.user,hostname: req.C.hostname,
        message:'',
        });
});
//
//  CMP
//
router.get('/cmp/cmp_index', function(req, res) {
    res.render('portals/cmp/cmp_index', { 
        title: 'VAMPS:Coral Microbe Project Portal',
        user: req.user,hostname: req.C.hostname,
        message:'',
        });
});
//
//  MIRADA
//
router.get('/mirada/mirada_index', function(req, res) {
    res.render('portals/mirada/mirada_index', { 
        title: 'VAMPS:Microbial Inventory Research Across Diverse Aquatic Sites Portal',
        user: req.user,hostname: req.C.hostname,
        message:'',
        });
});

module.exports = router;


