/*jslint node: true */
// "use strict" ;

var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');
var queries = require('./queries');
//var mysql = require('mysql2');
//var COMMON = require('./visuals/routes_common');


METAGENOMIC_INFORMATION_BY_PID = {}  // GLOBAL

router.get('/index', helpers.isLoggedIn, function (req, res) {
    console.log('In Metagenome index.html')
    project_list=[]
    connection.query(queries.get_metagenomic_projects_query(), function (err, rows, fields) {
        for(n in rows){
            pid = rows[n].pid
            pname = rows[n].project
            project_list.push(pname)
            METAGENOMIC_INFORMATION_BY_PID[pname] = {}
            
            for(item in rows[n]){                
                
                METAGENOMIC_INFORMATION_BY_PID[pname].last            = rows[n]['last_name']
                METAGENOMIC_INFORMATION_BY_PID[pname].first           = rows[n]['first_name']
                METAGENOMIC_INFORMATION_BY_PID[pname].username        = rows[n]['username']
                METAGENOMIC_INFORMATION_BY_PID[pname].oid             = rows[n]['owner_user_id']
                METAGENOMIC_INFORMATION_BY_PID[pname].email           = rows[n]['email']
                METAGENOMIC_INFORMATION_BY_PID[pname].institution     = rows[n]['institution']
                METAGENOMIC_INFORMATION_BY_PID[pname].project         = pname
                METAGENOMIC_INFORMATION_BY_PID[pname].pid             = pid
                METAGENOMIC_INFORMATION_BY_PID[pname].title           = rows[n]['title']
                METAGENOMIC_INFORMATION_BY_PID[pname].description     = rows[n]['project_description']
                METAGENOMIC_INFORMATION_BY_PID[pname].public          = rows[n]['public']
                METAGENOMIC_INFORMATION_BY_PID[pname].permissions     = []
            }
        }
        project_list.sort()
        //console.log(METAGENOMIC_INFORMATION_BY_PID)
        res.render('metagenome/metagenome_index', {
                                  title       : 'Metagenomic Project Listing',
                                  subtitle    : 'Project Selection Page',
                                  obj         : JSON.stringify(METAGENOMIC_INFORMATION_BY_PID),
                                  name_lst    : JSON.stringify(project_list),
                                  user        : req.user,
                                  hostname    : req.CONFIG.hostname,
                                  
        });
             
    });
});
 

module.exports = router;
