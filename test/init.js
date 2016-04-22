process.env.NODE_ENV = 'testing'
var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    //connection = require('../config/database-test');
    app = require('../app')
var express = require('express');
var passport = require('passport');
var helpers = require('../routes/helpers/helpers');


app.testuser    = {user:'TEST',pass:'TEST',first:'TestTest',last:'TestTest',email:'test@mbl.edu',inst:'MBL'}
//var privileged_user = {user:'TEST',pass:'TEST',first:'TestTest',last:'TestTest',email:'test@mbl.edu',inst:'MBL'}


// // Fake user login with passport.
// app.mockPassportInitialize = function () {
//     var passport = require('passport');
//     passport.initialize = function () {
//         return function (req, res, next) {
//             passport = this;
//             passport._key = 'passport';
//             passport._userProperty = 'user';
//             passport.serializeUser = function(user, done) {
//                 return done(null, user.id);
//             };
//             passport.deserializeUser = function(user, done) {
//                 return done(null, user);
//             };
//             req._passport = {
//                 instance: passport
//             };
//             req._passport.session = {
//                 user: new app.models.User({ id: 1, name: 'Joe Rogan' })
//             };

//             return next();
//         };
//     };
// };

module.exports = app;