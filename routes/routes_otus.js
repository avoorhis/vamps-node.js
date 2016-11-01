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
var iniparser = require('iniparser');
var COMMON = require('./visuals/routes_common');
var Readable = require('readable-stream').Readable;
//var chokidar = require('chokidar');
var spawn = require('child_process').spawn;
//var USER_DATA  = require('./routes_user_data');
//
// 
//
//
//

//
//
//

//
//
//
// YOUR PROJECTS
//

//
// POST ENTROPY
//
router.post('/method_selection', helpers.isLoggedIn, function (req, res) {
  console.log('in otus - -->>')
  console.log(req.body);
  console.log('<<--in otus - ')
  
  dataset_ids = JSON.parse(req.body.dataset_ids);
  chosen_id_name_hash           = COMMON.create_chosen_id_name_hash(dataset_ids);
      console.log('chosen_id_name_hash-->');
      console.log(chosen_id_name_hash);
      console.log(chosen_id_name_hash.ids.length);
      console.log('<--chosen_id_name_hash');

  res.render('otus/otus_method_selection', {
          title: 'VAMPS:OTUs',
          referer: 'oligotyping1',
          //constants: JSON.stringify(req.CONSTS),
          chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
          //selected_rank:'phylum', // initial condition
          //selected_domains:JSON.stringify(req.CONSTS.DOMAINS.domains), // initial condition
          message: '',
          //failmessage: req.flash('failMessage'),
          user: req.user, hostname: req.CONFIG.hostname
  });

});
//
//


//
//
//
module.exports = router;
