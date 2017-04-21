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
router.get('/users_index', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
    
	console.log('in indexusers')
	console.log(req.user)
    if(req.user.security_level === 1 || req.user.security_level === 10){
		var qSelect = "SELECT * from user";
	    var collection = req.db.query(qSelect, function (err, rows, fields){
	      if (err)  {
  			 msg = 'ERROR Message '+err;
  			 helpers.render_error_page(req,res,msg);
		   } else {
          rows.sort(function(a, b){
            // sort by last name
            return helpers.compareStrings_alpha(a.last_name, b.last_name);
          });
          res.render('user_admin/users_index', { 
                  title: 'VAMPS:users', 
                  rows : rows, 
                  user: req.user,hostname: req.CONFIG.hostname  
				  });

		   }
	    });
	}else{
	    req.flash('fail', 'Permission Denied')
        res.render('denied', { 
                title: 'VAMPS:users', 
                user: req.user,
                hostname: req.CONFIG.hostname,
		    });

          
	}

});


// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function(req, res) {
    
    console.log('login', req.body)
    res.render('user_admin/login', { 
                      title: 'VAMPS:login',
                      user: req.user, 
                      hostname: req.CONFIG.hostname,
                      return_to_url: req.session.returnTo });
});

// var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/users/profile';

router.post('/login',  passport.authenticate('local-login', { 
  // successRedirect: '/users/profile',
  failureRedirect: 'login',
  failureFlash: true }), function (req, res) {  
    var url = req.body.return_to_url || '/';
    console.log("=====: req.body.return_to_url");
    console.log(url);
    res.redirect(url);    
    delete req.session.returnTo;
    req.body.return_to_url = "";
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
    var data_dir = path.join(req.CONFIG.USER_FILES_BASE,req.user.username)
console.log('PROFILE')
    fs.ensureDir(data_dir, function (err) {
        if(err) {console.log(err);} // => null
        else{
            fs.chmod(data_dir, 0775, function (err) {
                if(err) {console.log(err);} // ug+rwx
                else{
                  res.render('user_admin/profile', {
                      title:'VAMPS:profile',
                      user : req.user,hostname: req.CONFIG.hostname // get the user out of session and pass to template
                  });
                }
            });
        }       

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
      var collection = req.db.query(qSelect, function (err, rows, fields){
        if (err)  {
          msg = 'ERROR Message '+err;
          helpers.render_error_page(req,res,msg);
        } else {
            res.render('users/profile', {
              title     :'VAMPS:profile',
              projects  : rows,
              user_info : JSON.stringify(ALL_USERS_BY_UID[uid]),
              user      : req.user,hostname: req.CONFIG.hostname // get the user out of session and pass to template
            });  
             

        }
      });

});

module.exports = router;
