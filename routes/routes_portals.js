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
//
//
router.get('/mobe', function(req, res) {
    res.render('portals/mobe', { 
    		title: 'VAMPS:Microbiology Of the Built Environment Portal',
        user: req.user,
    		message:'',
                          });
});
  module.exports = router;


