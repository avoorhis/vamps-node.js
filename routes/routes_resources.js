var express = require('express');
var router = express.Router();
var path      = require('path');
var fs        = require('fs-extra');
var http = require('http');

/* GET Methods Publications page. */
router.get('/methods_pubs', function(req, res) {
      res.render('resources/methods_pubs', { 
          title: 'VAMPS:Methods Publications', 
          user: req.user,
          hostname: req.CONFIG.hostname,
          message:'',
      });
});
/* GET Software page. */
router.get('/primers', function(req, res) {
      res.render('resources/primers', { 
          title: 'VAMPS:Primers',
          message:'',
          user: req.user,
          hostname: req.CONFIG.hostname
      });
});
/* GET Research Publications page. */
router.get('/research_pubs', function(req, res) {
      res.render('resources/research_pubs', { 
          title: 'VAMPS:Research Publications',
          message:'',
          user: req.user,
          hostname: req.CONFIG.hostname
      });
});
/* GET Software page. */
router.get('/software', function(req, res) {
      res.render('resources/software', { 
          title: 'VAMPS:Software and Links',
          message:'',
          user: req.user,
          hostname: req.CONFIG.hostname
      });
});
/* GET Reference Data page. */
router.get('/reference_data', function(req, res) {

      //get sweetcaptcha html for the contact area
        //sweetcaptcha.api('get_html', function(err,html){
            //Send the guts of the captcha to your template
            res.render('resources/reference_data', {
              title: 'VAMPS:Reference Data',
              user: req.user,
              message:'',
              hostname: req.CONFIG.hostname
               });
        ;
});

  //
  //
  //
 

 
module.exports = router;
