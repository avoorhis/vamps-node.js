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
//var config  = require(app_root + '/config/config');
//var multer    = require('multer');
//var upload = multer({ dest: config.TMP, limits: { fileSize: config.UPLOAD_FILE_SIZE.bytes }  });
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
    var data_dir = path.join(req.CONFIG.USER_FILES_BASE,req.user.username);
    //str.startsWith('/metadata/file_utils')
    var redirect_to_home = [
      '/metadata/metadata_edit_form',
      '/metadata/metadata_file_list',
      '/metadata/metadata_files',
      '/metadata/metadata_upload'
    ];
    var url = req.body.return_to_url || '/';
    if (redirect_to_home.indexOf(req.body.return_to_url) !== -1) {
      url = '/';
    }
    
    
   //  console.log(PROJECT_INFORMATION_BY_PID[283])
//     console.log('USER_GROUPS3')
//     console.log(USER_GROUPS)
//     console.log('ALL_USERS_BY_UID')
//     console.log(ALL_USERS_BY_UID)
    for(uid in ALL_USERS_BY_UID){
        if( ALL_USERS_BY_UID[uid].hasOwnProperty('groups') && (ALL_USERS_BY_UID[uid].groups).length > 0){
            for(i in ALL_USERS_BY_UID[uid].groups){
                var gp = ALL_USERS_BY_UID[uid].groups[i];
                pid_list = USER_GROUPS[gp]
                for(j in pid_list){
                    var pid = pid_list[j]
                    
                    //console.log('pushing uid '+uid+' to pid '+pid)
                    //console.log(PROJECT_INFORMATION_BY_PID[pid].permissions)
                    //console.log('pushing uid2')
                    if(PROJECT_INFORMATION_BY_PID.hasOwnProperty(pid) && PROJECT_INFORMATION_BY_PID[pid].permissions.indexOf(parseInt(uid)) == -1){
                        //console.log('2pushing uid '+uid+' to pid '+pid)
                        PROJECT_INFORMATION_BY_PID[pid].permissions.push(parseInt(uid))
                    }
                    
                    
                }
                
            }
        }
     
    }
    //console.log(PROJECT_INFORMATION_BY_PID)
    
    fs.ensureDir(data_dir, function (err) {
        if(err) {console.log(err);} // => null
        else{
            console.log('Checking USER_FILES_BASE: '+data_dir+' Exists - yes');
            fs.chmod(data_dir, 0775, function (err) {
                if(err) {console.log(err);} // ug+rwx
                else{
                    console.log('Setting USER_FILES_BASE permissions to 0775');
                    console.log('=== url ===: req.body.return_to_url');
                    console.log(url);
                    
                    //console.log('USER',req.user)
                    res.redirect(url);    
                    delete req.session.returnTo;
                    req.body.return_to_url = '';
                }
            });
        }
    });
    
    
    
  }
);



// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function(req, res) {
        new_user = {};
        // render the page and pass in any flash data if it exists
        console.log('new_user--signup');
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
              title     :'VAMPS:change-password',
              form_type : 'update',
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
router.get('/update_account', helpers.isLoggedIn, function(req, res) {
  console.log('In GET::update_account');


  res.render('user_admin/update_account', {
              title     :'VAMPS:update-account',
              user      : req.user, hostname: req.CONFIG.hostname // get the user out of session and pass to template
            });  
});
router.post('/update_account', helpers.isLoggedIn, function(req, res) {
    console.log('In POST::update_account');
    console.log(req.body)
    console.log(ALL_USERS_BY_UID[req.body.uid])
    if(req.body.uid != req.user.user_id){
        console.log('No match - get out of here.')
        req.flash('fail', 'Something went wrong - exiting');
        res.redirect('/users/update_account');
        return;
    }
    if(req.body.new_email == ALL_USERS_BY_UID[req.body.uid].email && req.body.new_institution == ALL_USERS_BY_UID[req.body.uid].institution){
        console.log('No Update Needed')
        req.flash('success', 'No Update Needed');
        res.redirect('/users/update_account');
    }else{
        // NEEDS VALIDATION!!!
        var query = "UPDATE user set email='"+req.body.new_email+"', institution='"+req.body.new_institution+"' where user_id='"+req.body.uid+"'"
        req.db.query(query, function (err, rows, fields){
            if (err)  {
                req.flash('fail', 'Something went wrong with update - exiting');
                res.redirect('/users/update_account');
                return;
            }else{
                req.flash('success', 'Update Success');
                ALL_USERS_BY_UID[req.body.uid].email        = req.body.new_email
                ALL_USERS_BY_UID[req.body.uid].institution  = req.body.new_institution
                res.redirect('/users/update_account');
            }
        })
    }
    
});
//
//
router.get('/forgotten_password', function(req, res) {
    console.log('IN GET::forgotten_password')
    res.render('user_admin/change_password', {
          title     :'VAMPS:forgotten-password',
          form_type : 'forgotten',
           hostname: req.CONFIG.hostname // get the user out of session and pass to template
        });
});
router.post('/reset_password', function(req, res) {
    console.log('IN POST::reset_password')
    console.log(req.body);
    //{ username: 'avoorhis', email: 'avoorhis@mbl.edu' }
    // create new password and send via email to user
    req.flash('success', 'Email Sent To: '+req.body.email);
    res.redirect('/users/forgotten_password')
});
//
//
router.get('/:id', helpers.isLoggedIn, function(req, res) {
   
   var uid = req.params.id
   console.log(ALL_USERS_BY_UID[uid]);
   console.log('in indexusers:id')
   //console.log(req.user)
   if(ALL_USERS_BY_UID[uid] == undefined ){
    res.render('index', {
        title: 'VAMPS:Home',
        user: req.user, 
        hostname: req.CONFIG.hostname 
     });
     return;  
   }else{
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
    }

});
<<<<<<< HEAD
=======
//
//
//
>>>>>>> 2456995ec9a01ca8ce6dd4331befc0efe25809b0


module.exports = router;
