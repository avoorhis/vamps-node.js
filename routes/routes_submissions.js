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
    req.session.pi_list = pi_list;
    var user_id = req.user.user_id;
    Submission.getSubmitCodeByUser(user_id, function (err, rows) {
      // console.log("AAA0", res);

      if (err) {
        res.json(err);
      }
      else {
        var user_submits = rows;
        req.session.user_submits = user_submits;

        console.log("AAA0", user_submits);
        console.log("AAA1", JSON.stringify(user_submits));
        // [2018/06/13 16:26:32.598] [LOG]   AAA0 [ TextRow { submit_code: 'ashipunova354276' },
        // TextRow { submit_code: 'ashipunova_100460' } ]
        // [2018/06/13 16:26:32.601] [LOG]   AAA1 [{"submit_code":"ashipunova354276"},{"submit_code":"ashipunova_100460"}]
        //
        res.render('submissions/submission_request', {
          button_name: "Validate",
          d_region: "",
          domain: "",
          domain_regions: CONSTS.DOMAIN_REGIONS,
          funding_code: "",
          hostname: req.CONFIG.hostname,
          pi_list: pi_list,
          pi_id: "",
          pi_name: "",
          // previous_submission
          project_description: "",
          project_name1: "",
          project_name2: "",
          project_name3: "",
          project_title: "",
          submit_code: "",
          submit_name: "",
          samples_number: "",
          title: 'VAMPS: Submission Request',
          user: req.user,
          user_submits: user_submits,
        });

        // console.log('user');
        // console.log(req.user);


      }

    });

  });

// https://www.npmjs.com/package/express-form
// domain_region
// funding_code
// pi_name
// previous_submission
// project_description
// project_name1
// project_name2
// project_title
// samples_number

router.post('/submission_request',
  [helpers.isLoggedIn],
  form(
    form.field("d_region").trim().required().entityEncode(),
    form.field("funding_code").trim().required().is(/^[0-9]+$/).entityEncode().array(),
    form.field("pi_id").trim().required().is(/^[0-9]+$/).entityEncode().array(),
    form.field("pi_name").trim().required().is(/^[a-zA-Z- ]+$/).entityEncode().array(),
    form.field("submit_code").trim().entityEncode().array(),
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

    // field("post[user][id]").isInt(),

    // if(!req.form.isValid){
    //   // TODO: remove here, should be after validation only
    //   make_csv(req, res);
    //   editMetadata(req, res);
    // }else{
    //   make_csv(req, res);
    //   saveToDb(req.metadata);
    //   // TODO: change
    //   res.redirect("/metadata"+req.metadata.id+"/edit");
    // }

    if (!req.form.isValid) {
      console.log('2) in post /submission_request, !req.form.isValid');
    }
    else {
      console.log('3) in post /submission_request, req.form.isValid');
      req.flash('success', 'Form validated. Now download and open in OpenOffice or Excel to fill-in remaining data.');
      // DRY (already done in get)
      // var pi_list = submission_controller.get_pi_list();
      var pi_list = req.session.pi_list;
      // console.log('QQQ1 req.body.pi_list', pi_list);
      var user_submits = req.session.user_submits;
      // console.log('QQQ2 req.body.pi_list', user_submits);

      var d_region = req.form.d_region.split("#");
      // console.log("DDD d_region = ", d_region);
      res.render('submissions/submission_request', {
        // domain_region
        button_name: "Download as Spreadsheet",
        d_region: d_region, // d_region =  [ 'Fungal', 'ITS1', 'ITS1' ]
        domain_regions: CONSTS.DOMAIN_REGIONS,
        funding_code: req.form.funding_code,
        hostname: req.CONFIG.hostname,
        pi_list: pi_list,
        pi_id: req.form.pi_id,
        pi_name: req.form.pi_name,
        // previous_submission
        project_description: req.form.project_description,
        project_name1: req.form.project_name1,
        project_name2: req.form.project_name2,
        project_name3: req.body.d_region,
        project_title: req.form.project_title,
        submit_code: req.form.submit_code,
        samples_number: req.form.samples_number,
        title: 'VAMPS: Submission Request',
        user: req.user,
        user_submits: user_submits,
      });


      // Form validated.
      //   Now download and open in OpenOffice or Excel to fill-in remaining data
      // Unique Prefix
    }

    console.time("TIME: 1) in post /submission_request");
    // make_submission_object_from_db(req, res);
    console.timeEnd("TIME: 1) in post /submission_request");
  });

// function render_edit_form(req, res) {
//   // console.log("JJJ1 all_submission");
//   // console.log(JSON.stringify(all_submission));
//   //
//
//   connection.query(function (err, rows, fields) {
//     if (err) {
//       console.log('ERR', err);
//       return;
//     }
//     res.render('submissions/submission_request', {
//       title: 'VAMPS: Submission Request',
//       user: req.user,
//       user_submits: JSON.stringify(rows),
//       // regions: JSON.stringify(dandr),
//       // pi_list: JSON.stringify(pi_list),
//       hostname: req.CONFIG.hostname,
//     });
//   });
// }


module.exports = router;
