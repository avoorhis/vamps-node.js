const express = require('express');
var router = express.Router();
const fs   = require('fs-extra');
const path  = require('path');
const helpers = require('./helpers/helpers');
const ds = require('./load_all_datasets');

var rs_ds = ds.get_datasets(function(ALL_DATASETS){
  
  //GLOBAL.ALL_DATASETS = ALL_DATASETS;  // GLOBAL keyword is deprecated and not needed here
  

  /* GET home page. */
  router.get('/', function(req, res) {
    res.render('index', {
            title: 'VAMPS:Home',
            user: req.user, 
            hostname: req.CONFIG.hostname 
        });
  });




  /* GET Saved Data page. */
  router.get('/saved_data', helpers.isLoggedIn, function(req, res) {
      res.render('saved_data', { title: 'VAMPS:Saved Data',
                user: req.user, 
                hostname: req.CONFIG.hostname
        });
  });
 



 

  router.get('/geodistribution', function(req, res) {

	  console.log(DatasetsWithLatLong)
	  res.render('geodistribution', { title: 'VAMPS:Geo_Distribution',
            user: req.user, 
            hostname: req.CONFIG.hostname,
	        geodata: JSON.stringify(DatasetsWithLatLong),
	        token : req.CONFIG.MAPBOX_TOKEN
           
        });
  });  
  //
  //
  //
  router.post('/contact', function(req, res) {

    //Validate captcha
    sweetcaptcha.api('check', {sckey: req.body["sckey"], scvalue: req.body["scvalue"]}, function(err, response){
        if (err) return console.log(err);

        if (response === 'true') {
            // valid captcha

            // setup e-mail data with unicode symbols
            var info = {
                to: 'avoorhis@mbl.edu',
                from: 'vamps@mbl.edu',
                subject: 'New email from your website contact form', // Subject line
                text: req.body["contact-form-message"] + "\n\nYou may contact this sender at: " + req.body["contact-form-mail"] // plaintext body
              };
            send_mail(info);

            //Success
            res.send("Thanks! We have sent your message.");

        }
        if (response === 'false'){
            // invalid captcha
            console.log("Invalid Captcha");
            res.send("Try again");

        }
    });

});


});

module.exports = router;
