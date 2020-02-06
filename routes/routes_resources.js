const express = require('express');
var router = express.Router();
const path      = require('path');
const fs        = require('fs-extra');
const http = require('http');

/* GET Methods Publications page. */
router.get('/methods_pubs', (req, res) => {
      res.render('resources/methods_pubs', { 
          title: 'VAMPS:Methods Publications', 
          user: req.user,
          hostname: req.CONFIG.hostname,          
      });
});
/* GET Software page. */
router.get('/primers', (req, res) => {
      res.render('resources/primers', { 
          title: 'VAMPS:Primers',          
          user: req.user,
          hostname: req.CONFIG.hostname
      });
});
/* GET Research Publications page. */
router.get('/research_pubs', (req, res) => {
      res.render('resources/research_pubs', { 
          title: 'VAMPS:Research Publications',         
          user: req.user,
          hostname: req.CONFIG.hostname
      });
});
/* GET Software page. */
router.get('/software', (req, res) => {
      res.render('resources/software', { 
          title: 'VAMPS:Software and Links',          
          user: req.user,
          hostname: req.CONFIG.hostname
      });
});
/* GET Reference Data page. */
router.get('/reference_data', (req, res) => {

      //get sweetcaptcha html for the contact area
        //sweetcaptcha.api('get_html', (err,html) => {
            //Send the guts of the captcha to your template
            res.render('resources/reference_data', {
              title: 'VAMPS:Reference Data',
              user: req.user,             
              hostname: req.CONFIG.hostname
               });
        ;
});

  //
  //
  //
 

 
module.exports = router;
