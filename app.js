var express = require('express');
var session      = require('express-session')
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash    = require('connect-flash');
var db = require('mysql');
var connection = require('./config/database-dev');
connection.connect();
var routes = require('./routes/index');
var users = require('./routes/users');
var projects = require('./routes/projects');
var datasets = require('./routes/datasets');
var visuals = require('./routes/visuals/visualization');
var C = require('./config/constants')
var app = express();
require('./config/passport')(passport,connection); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
//app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// required for passport
app.use(session({ secret: 'keyboard cat' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = connection;
    req.C = C;
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/projects', projects);
app.use('/datasets', datasets);
app.use('/visuals', visuals);




/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    console.log('ENV: Development')
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error.ejs', {
            message: err.message,
            error: err
        });
    });
}
if (app.get('env') === 'production') {
    console.log('ENV: Production')
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

