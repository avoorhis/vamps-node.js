/*jslint node: true */

const express = require('express');
var router = express.Router();
const helpers = require('./helpers/helpers');
const queries = require('./queries');


router.get('/index', helpers.isLoggedIn, (req, res) => {
    console.log('In Metagenome index.html')
    project_list=[]
    DBConn.query(queries.get_metagenomic_projects_query(), (err, rows, fields) => {
        let metagenomic_information_by_pid = {}  // local var for now
        for(n in rows){
            pid = rows[n].pid
            pname = rows[n].project
            project_list.push(pname)
            metagenomic_information_by_pid[pname] = {}
            
            for(item in rows[n]){                
                
                metagenomic_information_by_pid[pname].last            = rows[n]['last_name']
                metagenomic_information_by_pid[pname].first           = rows[n]['first_name']
                metagenomic_information_by_pid[pname].username        = rows[n]['username']
                metagenomic_information_by_pid[pname].oid             = rows[n]['owner_user_id']
                metagenomic_information_by_pid[pname].email           = rows[n]['email']
                metagenomic_information_by_pid[pname].institution     = rows[n]['institution']
                metagenomic_information_by_pid[pname].project         = pname
                metagenomic_information_by_pid[pname].pid             = pid
                metagenomic_information_by_pid[pname].title           = rows[n]['title']
                metagenomic_information_by_pid[pname].description     = rows[n]['project_description']
                metagenomic_information_by_pid[pname].public          = rows[n]['public']
                metagenomic_information_by_pid[pname].permissions     = []
            }
        }
        project_list.sort()
        //console.log(metagenomic_information_by_pid)
        res.render('metagenome/metagenome_index', {
                                  title       : 'Metagenomic Project Listing',
                                  subtitle    : 'Project Selection Page',
                                  obj         : JSON.stringify(metagenomic_information_by_pid),
                                  name_lst    : JSON.stringify(project_list),
                                  user        : req.user,
                                  hostname    : req.CONFIG.hostname,
                                  
        });
             
    });
});
 

module.exports = router;
