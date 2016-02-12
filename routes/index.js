var express = require('express');
var router = express.Router();
var fs   = require('fs-extra');
var path  = require('path');
var helpers = require('./helpers/helpers');
var ds = require('./load_all_datasets');

var rs_ds = ds.get_datasets(function(ALL_DATASETS){
  
  GLOBAL.ALL_DATASETS = ALL_DATASETS;
  

  /* GET home page. */
  router.get('/', function(req, res) {
    res.render('index', {
            title: 'VAMPS:Home',
            message   :     req.flash('message'),
            user: req.user, 
            hostname: req.CONFIG.hostname });
  });



  



  
  /* GET Saved Data page. */
  router.get('/saved_data', helpers.isLoggedIn, function(req, res) {
      res.render('saved_data', { title: 'VAMPS:Saved Data',
                user: req.user, 
                hostname: req.CONFIG.hostname,
	               message:'',
                            });
  });
 



  /* GET Geo-Distribution page. */
  router.get('/geodistribution', function(req, res) {

	  //console.log(DatasetsWithLatLong)
	  res.render('geodistribution', { title: 'VAMPS:Geo_Distribution',
      user: req.user, 
      hostname: req.CONFIG.hostname,
	    geodata: JSON.stringify(DatasetsWithLatLong),
	    message:'',
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
