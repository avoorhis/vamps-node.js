var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var fs = require('fs-extra');
var async = require('async');
//var crypto = require('crypto')
var path = require('path');
//var nodemailer = require('nodemailer');
//var session   = require('express-session')
//var flash    = require('connect-flash');
//var LocalStrategy = require('passport-local').Strategy;
new_user = {}
/* GET User List (index) page. */


// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function(req, res) {
    res.render('user_admin/login', { 
                      title: 'VAMPS:login',
                      user: req.user, 
                      hostname: req.CONFIG.hostname,
                      return_to_url: req.session.returnTo });
});


router.post('/login',  passport.authenticate('local-login', { 
  // successRedirect: '/users/profile',
  failureRedirect: 'login',   // on fail GET:login (empty form)
  failureFlash: true }), function (req, res) {  
    var data_dir = path.join(req.CONFIG.USER_FILES_BASE,req.user.username)
    
    fs.ensureDir(data_dir, function (err) {
        if(err) {console.log(err);} // => null
        else{
            console.log('Checking USER_FILES_BASE: '+data_dir+' Exists - yes')
            fs.chmod(data_dir, 0775, function (err) {
                if(err) {console.log(err);} // ug+rwx
                else{
                    console.log('Setting USER_FILES_BASE permissions to 0775')
                    var url = req.body.return_to_url || '/';
                    console.log("=====: req.body.return_to_url");
                    console.log(url);
                    res.redirect(url);    
                    delete req.session.returnTo;
                    req.body.return_to_url = "";
                }
            })
        }
    })
    
    
  }
);



// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        console.log('new_user--signup')
        //console.log(new_user)
        res.render('user_admin/signup', { 
                            title   : 'VAMPS:signup',
                            user    : req.user,
                            hostname: req.CONFIG.hostname,
                            new_user: new_user
        });
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
                successRedirect : '/users/profile', // redirect to the secure profile section
                failureRedirect : 'signup', // redirect back to the signup page if there is an error
                failureFlash : true         // allow flash messages
}));

// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
router.get('/profile', helpers.isLoggedIn, function(req, res) {
    console.log('PROFILE')    
    res.render('user_admin/profile', {
          title:'VAMPS:profile',
          user : req.user,hostname: req.CONFIG.hostname // get the user out of session and pass to template
    });        

});

// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
// =====================================
// CHANGE PASSWORD =====================
// =====================================
router.get('/change_password', helpers.isLoggedIn, function(req, res) {
  console.log('In change_password');


  res.render('user_admin/change_password', {
              title     :'VAMPS:change_password',
              user      : req.user, hostname: req.CONFIG.hostname // get the user out of session and pass to template
            });  
});
//
//
//
router.post('/change_password',  passport.authenticate('local-reset', { 
                                        successRedirect: '/users/login',        successFlash: true,
                                        failureRedirect: '/users/change_password',failureFlash: true 
                                 })
);
//
//
//
router.get('/:id', helpers.isLoggedIn, function(req, res) {
   
   var uid = req.params.id
   console.log(ALL_USERS_BY_UID[uid]);
   console.log('in indexusers:id')
   //console.log(req.user)

   var qSelect = "SELECT * from project where owner_user_id='"+uid+"'";
   console.log(qSelect)
   var collection = req.db.query(qSelect, function (err, rows, fields){
    if (err)  {
      msg = 'ERROR Message '+err;
      helpers.render_error_page(req,res,msg);
    } else {
        res.render('users/profile', {
          title     :'VAMPS:profile',
          projects  : rows,
          user_info : JSON.stringify(ALL_USERS_BY_UID[uid]),
          user      : req.user, hostname: req.CONFIG.hostname // get the user out of session and pass to template
        });  
     

    }
  });

});

module.exports = router;
