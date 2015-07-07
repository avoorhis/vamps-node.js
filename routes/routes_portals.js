var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');
var path  = require('path');

/* GET Portals page. */
router.get('/portals_index', function(req, res) {
    res.render('portals/portals_index', { 
    		title: 'VAMPS:Portals',
        user: req.user,
    		message:'',
                          });
});

//
//  MOBE
//
router.get('/mobe/mobe_index', function(req, res) {
    res.render('portals/mobe/mobe_index', { 
    		title: 'VAMPS:Microbiology Of the Built Environment Portal',
            user: req.user,
    		message:'',
        });
});
//
//  ICOMM
//
router.get('/icomm/icomm_index', function(req, res) {
    res.render('portals/icomm/icomm_index', { 
        title: 'VAMPS:International Census of Marine Microbes Portal',
        user: req.user,
        message:'',
        });
});
//
//  HMP
//
router.get('/hmp/hmp_index', function(req, res) {
    res.render('portals/hmp/hmp_index', { 
        title: 'VAMPS:Human Microbiome Project Portal',
        user: req.user,
        message:'',
        });
});
//
//  CODL
//
router.get('/codl/codl_index', function(req, res) {
    res.render('portals/codl/codl_index', { 
        title: 'VAMPS:Census of Deep Life Portal',
        user: req.user,
        message:'',
        });
});
//
//  UC
//
router.get('/uc/uc_index', function(req, res) {
    res.render('portals/uc/uc_index', { 
        title: 'VAMPS:Ulcerative Colitis Portal',
        user: req.user,
        message:'',
        });
});
//
//  RARE
//
router.get('/rare/rare_index', function(req, res) {
    res.render('portals/rare/rare_index', { 
        title: 'VAMPS:The Rare Biosphere Portal',
        user: req.user,
        message:'',
        });
});
//
//  CMP
//
router.get('/cmp/cmp_index', function(req, res) {
    res.render('portals/cmp/cmp_index', { 
        title: 'VAMPS:Coral Microbe Project Portal',
        user: req.user,
        message:'',
        });
});
//
//  MIRADA
//
router.get('/mirada/mirada_index', function(req, res) {
    res.render('portals/mirada/mirada_index', { 
        title: 'VAMPS:Microbial Inventory Research Across Diverse Aquatic Sites Portal',
        user: req.user,
        message:'',
        });
});

module.exports = router;


