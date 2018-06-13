var express               = require('express');
var router                = express.Router();
var helpers               = require('./helpers/helpers');
var form                  = require("express-form");
var CONSTS                = require(app_root + "/public/constants");
var fs                    = require("fs");
var path                  = require("path");
var config                = require(app_root + '/config/config');
var validator             = require('validator');
var nodeMailer            = require('nodemailer');
var Submission            = require(app_root + '/models/submission');
var submission_controller = require(app_root + '/controllers/submissionController');


/* GET new submission form */
router.get('/submission_request',
  [helpers.isLoggedIn],
  function (req, res) {
    console.log('in GET submission_request');

    var pi_list = submission_controller.get_pi_list();
    var user_id = req.user.user_id;
    Submission.getSubmitCodeByUser(user_id, function (err, rows) {
      // console.log("AAA0", res);

      if (err) {
        res.json(err);
      }
      else {
        var user_submits = rows;
        // console.log("AAA0", user_submits);
        // console.log("AAA1", JSON.stringify(user_submits));

        res.render('submissions/submission_request', {
          title: 'VAMPS: Submission Request',
          user: req.user,
          hostname: req.CONFIG.hostname,
          user_submits: user_submits,
          domain_regions: CONSTS.DOMAIN_REGIONS,
          // JSON.stringify(dandr),
          pi_list: pi_list
        });

        // console.log('user');
        // console.log(req.user);


      }

    });

  });

router.post('/submission_request',
  [helpers.isLoggedIn],
  form(
    form.field("domain_region").trim().required().entityEncode().array(),
    form.field("funding_code").trim().required().is(/^[0-9]+$/).entityEncode().array(),
    form.field("pi_name").trim().required().is(/^[a-zA-Z- ]+$/).entityEncode().array(),
    form.field("previous_submission").trim().entityEncode().array(),
    form.field("project_description").trim().required().entityEncode().array(),
    form.field("project_name1").trim().required().entityEncode().array(),
    form.field("project_name2").trim().required().entityEncode().array(),
    form.field("project_title").trim().required().is(/^[a-zA-Z0-9,_ -]+$/).entityEncode().array(),
    form.field("samples_number").trim().required().is(/^[0-9]+$/).entityEncode().array()
),
  function (req, res) {
    console.log('in POST submission_request');
    console.log('OOO post');
    console.log('req.body', req.body);
    console.log('req.form', req.form);

    if (!req.form.isValid) {
      console.log('in post /submission_request, !req.form.isValid');
    }
    else {
      console.log('in post /submission_request, req.form.isValid');
    }

    console.time("TIME: 1) in post /submission_request");
    // make_submission_object_from_db(req, res);
    console.timeEnd("TIME: 1) in post /submission_request");
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
