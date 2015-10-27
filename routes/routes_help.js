var express = require('express');
var router = express.Router();
var sweetcaptcha = new require('sweetcaptcha')('233846', 'f2a70ef1df3edfaa6cf45d7c338e40b8', '720457356dc3156eb73fe316a293af2f');
//var crypto = require('crypto');
// These are all under /help

/* GET Overview page. */
  router.get('/overview', function(req, res) {
      res.render('help/overview', { title: 'VAMPS:Overview', 
      user: req.user,
      hostname: req.C.hostname,
      message:'',
   });
  });

/* GET FAQ page. */
  router.get('/faq', function(req, res) {
      res.render('help/faq', { title: 'VAMPS:FAQ',
                message:'',
                user: req.user,
                hostname: req.C.hostname
                            });
  });

  /* GET Contact Us page. */
  router.get('/contact', function(req, res) {

      //get sweetcaptcha html for the contact area
        sweetcaptcha.api('get_html', function(err,html){
            //Send the guts of the captcha to your template
            res.render('help/contact', {
              captcha : html,
              title: 'VAMPS:Contact-Us',
              user: req.user,
              hostname: req.C.hostname
               });
        });
  });



module.exports = router;
