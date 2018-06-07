var express = require('express');
var router  = express.Router();
var helpers = require('./helpers/helpers');
var form    = require("express-form");
var CONSTS  = require(app_root + "/public/constants");
var fs = require("fs");
var path = require("path");
var config  = require(app_root + '/config/config');
var validator = require('validator');
var nodeMailer = require('nodemailer');


/* GET new submission form */
router.get('/submission_request', function(req, res) {
  console.log('in submission_request');
  res.render('submissions/submission_request', { title: 'VAMPS: Submission Request',
    user: req.user,
    hostname: req.CONFIG.hostname
  });
});

router.post('/submission_request',
  [helpers.isLoggedIn],
  function (req, res) {

    // get_pi_list
    pi_list = [];
    for (var i in ALL_USERS_BY_UID) {
      pi_list.push({'PI': ALL_USERS_BY_UID[i].last_name + ' ' + ALL_USERS_BY_UID[i].first_name, 'pid': i});

    }
    pi_list.sort(function sortByAlpha(a, b) {
      return helpers.compareStrings_alpha(a.PI, b.PI);
    });
    console.log(pi_list);

    // Previous Submissions List
    var user_submissions_query = "SELECT submit_code from vamps.vamps_submissions where user_id='" + req.user.user_id + "'";
    console.log(user_submissions_query);

    // Domain and Region List

    console.time("TIME: 1) in post /edit_submission_form");
    // make_submission_object_from_db(req, res);
    console.timeEnd("TIME: 1) in post /edit_submission_form");
  });

function render_edit_form(req, res) {
  // console.log("JJJ1 all_submission");
  // console.log(JSON.stringify(all_submission));
  //

  connection.query(function (err, rows, fields) {
    if (err) {
      console.log('ERR', err);
      return;
    }
    res.render('submissions/submission_request', {
      title: 'VAMPS: Submission Request',
      user: req.user,
      user_submits: JSON.stringify(rows),
      // regions: JSON.stringify(dandr),
      // pi_list: JSON.stringify(pi_list),
      hostname: req.CONFIG.hostname,
    });
  });
}


module.exports = router;