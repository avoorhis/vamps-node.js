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


METAGENOMIC_INFORMATION_BY_PID = {}

router.get('/index', helpers.isLoggedIn, function (req, res) {
    console.log('In Metagenome index.html')
    
    connection.query(queries.get_metagenomic_projects_query(), function (err, rows, fields) {
        for(n in rows){
            pid = rows[n].pid
            METAGENOMIC_INFORMATION_BY_PID[pid] = {}
            
            for(item in rows[n]){                
                METAGENOMIC_INFORMATION_BY_PID[pid].last            = rows[n]['last_name']
                METAGENOMIC_INFORMATION_BY_PID[pid].first           = rows[n]['first_name']
                METAGENOMIC_INFORMATION_BY_PID[pid].username        = rows[n]['username']
                METAGENOMIC_INFORMATION_BY_PID[pid].oid             = rows[n]['owner_user_id']
                METAGENOMIC_INFORMATION_BY_PID[pid].email           = rows[n]['email']
                METAGENOMIC_INFORMATION_BY_PID[pid].institution     = rows[n]['institution']
                METAGENOMIC_INFORMATION_BY_PID[pid].project         = rows[n]['project']
                METAGENOMIC_INFORMATION_BY_PID[pid].pid             = pid
                METAGENOMIC_INFORMATION_BY_PID[pid].title           = rows[n]['title']
                METAGENOMIC_INFORMATION_BY_PID[pid].description     = rows[n]['project_description']
                METAGENOMIC_INFORMATION_BY_PID[pid].public          = rows[n]['public']
                METAGENOMIC_INFORMATION_BY_PID[pid].permissions     = []
            }
        }
  //console.log(METAGENOMIC_INFORMATION_BY_PID)
        res.render('metagenome/metagenome_index', {
                                  title       : 'Metagenomic Project Listing',
                                  subtitle    : 'Project Selection Page',
                                  obj         : JSON.stringify(METAGENOMIC_INFORMATION_BY_PID),
                                  user        : req.user,
                                  hostname    : req.CONFIG.hostname,
                                  
        });
             
    });
});
 

module.exports = router;
