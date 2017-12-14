/*jslint node: true */
// "use strict" ;

var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var path = require('path');
var fs = require('fs-extra');
var queries = require('./queries');
var config = require('../config/config');
var mysql = require('mysql2');
var COMMON = require('./visuals/routes_common');




router.get('/index', helpers.isLoggedIn, function (req, res) {
    console.log('In Metagenome index.html')
    
    connection.query(queries.get_metagenomic_projects_query(), function (err, rows, fields) {
        for(n in rows){
            console.log(rows[n])
        }
  
        res.render('metagenome/metagenome_index', {
                                  title       : 'Metagenomic Project Listing',
                                  subtitle    : 'Project Selection Page',
                                  obj         : JSON.stringify(rows),
                                  user        : req.user,
                                  hostname    : req.CONFIG.hostname,
                                  
        });
             
    });
});
 

module.exports = router;
