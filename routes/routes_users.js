var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');

//var session   = require('express-session')
//var flash    = require('connect-flash');
//var LocalStrategy = require('passport-local').Strategy;

/* GET User List (index) page. */
router.get('/index_users', helpers.isLoggedIn, function(req, res) {
    
	console.log('in indexusers')
	console.log(req.user)
    if(req.user.security_level == 1){
		var qSelect = "SELECT * from user";
	    var collection = req.db.query(qSelect, function (err, rows, fields){
	      if (err)  {
  			 msg = 'ERROR Message '+err;
  			 helpers.render_error_page(req,res,msg);
		   } else {
		        res.render('user_admin/index_users', { 
		                              title: 'users', 
                                  rows : rows, 
		                              user: req.user,  message:''  
				});

		   }
	    });
	}else{
        res.render('denied', { 
                              title: 'users', user: req.user,
							  message: req.flash('nopermissionMessage', 'Permission Denied') 
		});

          
	}

});


// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function(req, res) {
    res.render('user_admin/login', { 
                      title: 'login',
                      message: req.flash('loginMessage'), 
                      user: req.user });
});

router.post('/login',
    
    passport.authenticate('local-login', { successRedirect: '/users/profile',
                                   failureRedirect: 'login',
                                   failureFlash: true })
);

// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('user_admin/signup', { 
                            title: 'signup',
                            message: req.flash('signupMessage'), user: req.user });
});

// process the signup form
router.post('/signup',
    passport.authenticate('local-signup', { successRedirect : '/users/profile', // redirect to the secure profile section
                                    failureRedirect : 'signup', // redirect back to the signup page if there is an error
                                    failureFlash : true // allow flash messages
}));

// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
router.get('/profile', helpers.isLoggedIn, function(req, res) {
    res.render('user_admin/profile', {
        title:'profile',
        message: req.flash('loginMessage'), 
        user : req.user // get the user out of session and pass to template
    });
});

// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/:id', function(req, res) {
   
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
              title     :'profile',
              message   : req.flash('message'), 
              projects  : rows,
              user_info : JSON.stringify(ALL_USERS_BY_UID[uid]),
              user      : req.user // get the user out of session and pass to template
            });  
             

        }
      });


   

});


module.exports = router;
