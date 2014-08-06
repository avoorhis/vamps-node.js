/*
// anna's
require('nodetime').profile({
    accountKey: '13bf15a356e62b822df4395f183fe0a83af757f4', 
    appName: 'Node.js VAMPS Application'
  });
*/

var express = require('express');
var router = express.Router();
var session = require('express-session');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var passport = require('passport');
var db = require('mysql');
// without var declaration connection is global
// needed for DATASETS initialization
connection = require('./config/database-dev');
//connection.connect();
var routes = require('./routes/index');
var users = require('./routes/users');
var projects = require('./routes/projects');
var datasets = require('./routes/datasets');
//var ALL_DATASETS = require('./routes/load_all_datasets2')(connection);
var visuals = require('./routes/visuals/visualization');
var C = require('./public/constants');

var app = express();
app.set('appName', 'VAMPS');
require('./config/passport')(passport, connection); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// MIDDLEWARE  <-- must be in correct order:
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use('public/javascripts', express.static(path.join(__dirname, '/public/javascripts')));
app.use('public/stylesheets', express.static(path.join(__dirname, '/public/stylesheets')));
// app.use('views/add_ins', express.static(path.join(__dirname, '/views/add_ins')));
// required for passport
app.use(session({ secret: 'keyboard cat' })); // session secret
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Make our db accessible to our router
app.use(function(req, res, next){
    if(!connection) {return next(new Error('no db connection'));}
    req.db = connection;
    req.C = C;
    return next();
});

// example of roll-your-own middleware:
// GET: localhost:3000/?id=324
// app.use(function (req, res,next) {
//     console.log('START ');
//     if (req.query.id){
//         console.log('got id '+req.query.id);
//         next();
//     }else if (req.query.name){
//         console.log('got name '+req.query.name);
//         next();
//     }else{
//         next();
//     }
// });

// ROUTES:
app.use('/', routes);
app.use('/users', users);
app.use('/projects', projects);
app.use('/datasets', datasets);
app.use('/visuals', visuals);

// for non-routing pages such as heatmap, counts and bar_charts
app.get('/*', function(req, res, next){
    console.warn(req.params);
    console.warn(req.uri);
    var url = req.params[0];
    // I want to create a page like: counts_table_2014080_13452.html
    // for each link
    if(url === 'visuals/user_data/ctable.html') { // 
        // Yay this is the File A... 
        console.warn("The user file  has been requested");
        router.get('/visuals/user_data/ctable.html',  function(req, res) {
            console.warn('trying to open ctable.html');
        });
    } else {
        // we don't care about any other file, let it download too        
        console.warn("No Route Found");
        next();
    }
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers <-- these middleware go after routes

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    console.log('ENV: Development');
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error.ejs', {
            message: err.message,
            error: err
        });
    });
}
if (app.get('env') === 'production') {
    console.log('ENV: Production');
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.ejs', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
