var express = require('express');
var router = express.Router();
//var nodemailer = require('nodemailer');
var spawn = require('child_process').spawn;

//var sweetcaptcha = new require('sweetcaptcha')('233846', 'f2a70ef1df3edfaa6cf45d7c338e40b8', '720457356dc3156eb73fe316a293af2f');
//var crypto = require('crypto');
// These are all under /help

/* GET Overview page. */
  router.get('/overview', function(req, res) {
      res.render('help/overview', { title: 'VAMPS:Overview', 
      user: req.user,
      hostname: req.CONFIG.hostname,
      message:'',
   });
  });

/* GET FAQ page. */
  router.get('/faq', function(req, res) {
      res.render('help/faq', { title: 'VAMPS:FAQ',
                message:'',
                user: req.user,
                hostname: req.CONFIG.hostname
                            });
  });

  /* GET Contact Us page. */
  router.get('/contact', function(req, res) {

      //get sweetcaptcha html for the contact area
        //sweetcaptcha.api('get_html', function(err,html){
            //Send the guts of the captcha to your template
            res.render('help/contact', {
              
              title: 'VAMPS:Contact-Us',
              user: req.user,
              message:'',
              hostname: req.CONFIG.hostname
               });
        //});
  });

  //
  //
  //
  router.post('/contact', function (req, res) {
    console.log(req.body)
    var mailOptions = {
        scriptPath : req.CONFIG.PATH_TO_NODE_SCRIPTS,
        args :       [ '-to', req.CONFIG.CONTACT_EMAIL, '-from', req.body.email, '-name', req.body.name, '-sub', 'VAMPS Inquery', '-msg', req.body.message ],
    };
    console.log(mailOptions.scriptPath+'/send_email.py '+mailOptions.args.join(' '))
    var mail_process = spawn( mailOptions.scriptPath+'/send_email.py', mailOptions.args, {
                env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
                detached: true, 
                //stdio: [ 'ignore', null, log ]
                stdio: 'pipe'  // stdin, stdout, stderr
    }); 
    
    stdout = '';
    mail_process.stdout.on('data', function (data) {
        
        //console.log(data)
        stdout += data;    
     
    });
    stderr = '';
    mail_process.stderr.on('data', function (data) {
        
        console.log(data)
        stderr += data;    
     
    });
    mail_process.on('close', function (code) {
        console.log('mail_process process exited with code ' + code);
        if(code == 0){           
            res.send(stdout);                                 
        }else{
          console.log('python script error: '+stderr);
          res.send(stderr); 
        }      
    });   


      // var mailOpts, smtpTrans;
      // //Setup Nodemailer transport, I chose gmail. Create an application-specific password to avoid problems.
      // smtpTrans = nodemailer.createTransport('SMTP', {
      //     service: 'mail.mbl.edu',
      //     auth: {
      //         user: "avoorhis@mbl.edu",
      //         pass: "" 
      //     }
      // });
      // //Mail options
      // mailOpts = {
      //     from: req.body.name + ' <' + req.body.email + '>', //grab form data from the request body object
      //     to: 'avoorhis@mbl.edu',
      //     subject: 'Website contact form',
      //     text: req.body.message
      // };
      // console.log('mailOpts')
      // console.log(mailOpts);

      // smtpTrans.sendMail(mailOpts, function (error, response) {
      //     //Email not sent
      //     if (error) {
      //         res.render('help/contact', { title: 'Raging Flame Laboratory - Contact', message: 'Error occured, message not sent.', err: true, page: 'contact', user: req.user})
      //     }
      //     //Yay!! Email sent
      //     else {
      //         res.render('help/contact', { title: 'Raging Flame Laboratory - Contact', message: 'Message sent! Thank you.', err: false, page: 'contact', user: req.user })
      //     }
      // });
    });

module.exports = router;
