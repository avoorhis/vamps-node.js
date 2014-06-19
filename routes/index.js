var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'VAMPS-Node.js' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' })
});

router.get('/login', function(req, res) {
  	res.render('login', { title: 'VAMPS: Login' })
});

router.post('/login',
  	passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);



module.exports = router;
