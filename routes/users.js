var express = require('express');
var router = express.Router();
var passport = require('passport');
//var session   = require('express-session')
//var flash    = require('connect-flash');
//var LocalStrategy = require('passport-local').Strategy;



// These are all under /user
/* GET User List (index) page. */
router.get('/', function(req, res) {
    var db = req.db;
    var qSelect = "SELECT * from users"
    console.log(qSelect)
    var collection = db.query(qSelect, function (err, rows, fields){
    	if(err)	{
			throw err;
		}else{

	    	res.render('user_admin/index', { "rows" : rows, "user": req.user  || ''  });
    	}
    });
    
});
// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function(req, res) {
    res.render('user_admin/login', { message: req.flash('loginMessage'), "user": req.user || '' })
});

router.post('/login',
    passport.authenticate('local-login', { successRedirect: '/',
                                   failureRedirect: 'login',
                                   failureFlash: true })
);

// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('user_admin/signup', { message: req.flash('signupMessage'), "user": req.user || '' });
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
router.get('/profile', isLoggedIn, function(req, res) {
    res.render('user_admin/profile', {
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

module.exports = router;

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

