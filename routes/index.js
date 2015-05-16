var express = require('express');


var router = express.Router();

var fs   = require('fs-extra');
var path  = require('path');
var sweetcaptcha = new require('sweetcaptcha')('233846', 'f2a70ef1df3edfaa6cf45d7c338e40b8', '720457356dc3156eb73fe316a293af2f');
var helpers = require('./helpers/helpers');

var ds = require('./load_all_datasets');
var rs_ds = ds.get_datasets(function(ALL_DATASETS){
  
  GLOBAL.ALL_DATASETS = ALL_DATASETS;
  

  /* GET home page. */
  router.get('/', function(req, res) {
    res.render('index', {
            title: 'VAMPS:Home',
            message: req.flash('fail'),
            user: req.user });
  });

  /* GET Overview page. */
  router.get('/overview', function(req, res) {
      res.render('overview', { title: 'VAMPS:Overview', 
	  user: req.user,
  		message:'',
   });
  });



  
  /* GET Saved Data page. */
  router.get('/saved_data', helpers.isLoggedIn, function(req, res) {
      res.render('saved_data', { title: 'VAMPS:Saved Data',
                             user: req.user,
	  message:'',
                            });
  });
 
 


  /* GET Geo-Distribution page. */
  router.get('/geodistribution', function(req, res) {
      

	  testpaths = {}
	  testpaths['495'] = {"latitude":10,"longitude":-45};
	  testpaths['496'] = {"latitude":10.23,"longitude":-10};
	  testpaths['497'] = {"latitude":20,"longitude":-30};
	  testpaths['498'] = {"latitude":2,"longitude":-34};
	  
	  res.render('geodistribution', { title: 'VAMPS:Geo_Distribution',
                             user: req.user,
	  geodata: JSON.stringify(DatasetsWithLatLong),
	  message:'',
                            });
  });

  /* GET metadata page. */
  router.get('/metadata', function(req, res) {
      res.render('metadata', { title: 'VAMPS:Metadata',
                             user: req.user,
	  message:'',
                            });
  });

  /* GET Portals page. */
  router.get('/portals', function(req, res) {
      res.render('portals', { title: 'VAMPS:Portals',
                             user: req.user,
	  message:'',
                            });
  });
  /* GET FAQ page. */
  router.get('/faq', function(req, res) {
      res.render('faq', { title: 'VAMPS:FAQ',
	  						message:'',
                             user: req.user
                            });
  });
  /* GET Contact Us page. */
  router.get('/contact', function(req, res) {

      //get sweetcaptcha html for the contact area
        sweetcaptcha.api('get_html', function(err,html){
            //Send the guts of the captcha to your template
            res.render('contact', {
              captcha : html,
              title: 'VAMPS:Cuntact-Us',
              user: req.user
               });
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



// transporter.sendMail(mailOptions, function (error, info) {
//                 if (error) {
//                     console.log(error);
//                 } else {
//                     console.log('Message sent: ' + info.response);
//                 }
//             });

  // function IsNumeric(n) {
  //   return !isNaN(parseFloat(n)) && isFinite(n);
  // }
  // function onlyUnique(value, index, self) {
  //   return self.indexOf(value) === index;
  // }
  // var mkdirSync = function (path) {
  //   try {
  //     fs.mkdirSync(path);
  //   } catch(e) {
  //     if ( e.code != 'EEXIST' ) throw e;
  //   }
  // }

});

module.exports = router;
