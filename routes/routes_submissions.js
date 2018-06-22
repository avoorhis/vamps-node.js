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
var metadata_controller   = require(app_root + '/controllers/metadataController');


/* GET new submission form */
router.get('/submission_request',
  [helpers.isLoggedIn],
  function (req, res) {
    console.log('in GET submission_request');

    // DRY (same in post)
    var pi_list         = submission_controller.get_pi_list();
    req.session.pi_list = pi_list;
    var user_id         = req.user.user_id;
    Submission.getSubmitCodeByUser(user_id, function (err, rows) {
      // console.log("AAA0", res);

      if (err) {
        res.json(err);
      }
      else {
        var user_submits         = rows;
        req.session.user_submits = user_submits;

        console.log("AAA0", user_submits);
        console.log("AAA1", JSON.stringify(user_submits));
        // [2018/06/13 16:26:32.598] [LOG]   AAA0 [ TextRow { submit_code: 'ashipunova354276' },
        // TextRow { submit_code: 'ashipunova_100460' } ]
        // [2018/06/13 16:26:32.601] [LOG]   AAA1 [{"submit_code":"ashipunova354276"},{"submit_code":"ashipunova_100460"}]
        //
        res.render('submissions/submission_request', {
          button_name: "Validate",
          dataset_name: "",
          d_region: "",
          domain: "",
          domain_regions: CONSTS.DOMAIN_REGIONS,
          funding_code: "",
          hostname: req.CONFIG.hostname,
          pi_list: pi_list,
          pi_id_name: "",
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
    // form.field("pi_id").trim().required().is(/^[0-9]+$/).entityEncode().array(),
    // form.field("pi_name").trim().required().is(/^[a-zA-Z- ]+$/).entityEncode().array(),
    form.field("adaptor").trim().required().is(/^[a-zA-Z0-9]+$/).entityEncode().array(),
    form.field("d_region").trim().required().entityEncode(),
    form.field("dataset_description").trim().required().is(/^[a-zA-Z0-9,_ -]+$/).entityEncode().array(),
    form.field("dataset_name").trim().is(/^[a-zA-Z0-9_]+$/).entityEncode().array(),
    form.field("funding_code").trim().required().is(/^[0-9]+$/).entityEncode().array(),
    form.field("pi_id_name").trim().required().entityEncode(),
    form.field("project_description").trim().required().entityEncode().array(),
    form.field("project_name1").trim().required().entityEncode().array(),
    form.field("project_name2").trim().required().entityEncode().array(),
    form.field("project_title").trim().required().is(/^[a-zA-Z0-9,_ -]+$/).entityEncode().array(),
    form.field("sample_concentration").trim().required().isInt().entityEncode().array(),
    form.field("samples_number").trim().required().is(/^[0-9]+$/).entityEncode().array(),
    form.field("submit_code").trim().entityEncode().array(),
    form.field("tube_label").trim().required().is(/^[a-zA-Z0-9_ -]+$/).entityEncode().array()
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
      console.log("EEE req.form.errors", req.form.errors);
      console.log("FOFOFO req.form", req.form);

      //collect errors
      var myArray_fail = helpers.unique_array(req.form.errors);

      if (helpers.has_duplicates(req.form.sample_name)) {
        myArray_fail.push('Sample ID (user sample name) should be unique.');
      }

      myArray_fail.sort();
      console.log("myArray_fail = ", myArray_fail);
      req.flash("fail", myArray_fail);

      // console.log('QQQ1 req.body.pi_list', pi_list);
      req.session.DOMAIN_REGIONS = CONSTS.DOMAIN_REGIONS;
      req.session.button_name    = "Add datasets";
      var pi_id_name_arr         = req.form.pi_id_name.split("#");
      // console.log("DDD d_region = ", d_region);
      res.render('submissions/submission_request', {
        // domain_region
        button_name: req.session.button_name,
        dataset_name: req.form.dataset_name,
        d_region: req.form.d_region.split("#"), // d_region =  [ 'Fungal', 'ITS1', 'ITS1' ]
        domain_regions: req.session.DOMAIN_REGIONS,
        funding_code: req.form.funding_code,
        messages: req.flash,
        hostname: req.CONFIG.hostname,
        pi_list: req.session.pi_list,
        pi_id: pi_id_name_arr[0],
        pi_id_name: req.form.pi_id_name,
        pi_name: pi_id_name_arr[1],
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
        user_submits: req.session.user_submits,
      });


      // Form validated.
      //   Now download and open in OpenOffice or Excel to fill-in remaining data
      // Unique Prefix
    }

    else if (req.session.button_name === "Add datasets") {
      console.log('3) in post /submission_request, req.form.isValid');
      req.flash('success', 'Form validated. Now download and open in OpenOffice or Excel to fill-in remaining data.');
      console.log("req.session.button_name: ", req.session.button_name);
      // console.log('QQQ1 req.body.pi_list', pi_list);
      req.session.DOMAIN_REGIONS = CONSTS.DOMAIN_REGIONS;
      req.session.button_name    = "Add metadata";
      var pi_id_name_arr1         = req.form.pi_id_name.split("#");
      // console.log("DDD d_region = ", d_region);
      res.render('submissions/submission_request', {
        // domain_region
        button_name: "Add metadata",
        dataset_name: req.form.dataset_name,
        d_region: req.form.d_region.split("#"), // d_region =  [ 'Fungal', 'ITS1', 'ITS1' ]
        domain_regions: req.session.DOMAIN_REGIONS,
        funding_code: req.form.funding_code,
        hostname: req.CONFIG.hostname,
        pi_list: req.session.pi_list,
        pi_id: pi_id_name_arr1[0],
        pi_id_name: req.form.pi_id_name,
        pi_name: pi_id_name_arr1[1],
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
        user_submits: req.session.user_submits,
      });
      // Form validated.
      //   Now download and open in OpenOffice or Excel to fill-in remaining data
      // Unique Prefix
    }
    else {
      console.log('3) in post /submission_request, req.form.isValid');
      req.flash('success', 'Form validated. Now download and open in OpenOffice or Excel to fill-in remaining data.');
      // console.log('QQQ1 req.body.pi_list', pi_list);
      req.session.DOMAIN_REGIONS = CONSTS.DOMAIN_REGIONS;
      req.session.button_name    = "Add datasets";
      var d_region               = req.form.d_region.split("#");
      var pi_id_name_arr         = req.form.pi_id_name.split("#");
      // console.log("DDD d_region = ", d_region);
      res.render('submissions/submission_request', {
        // domain_region
        button_name: req.session.button_name,
        dataset_name: req.form.dataset_name,
        d_region: d_region, // d_region =  [ 'Fungal', 'ITS1', 'ITS1' ]
        domain_regions: req.session.DOMAIN_REGIONS,
        funding_code: req.form.funding_code,
        hostname: req.CONFIG.hostname,
        pi_list: req.session.pi_list,
        pi_id: pi_id_name_arr[0],
        pi_id_name: req.form.pi_id_name,
        pi_name: pi_id_name_arr[1],
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
        user_submits: req.session.user_submits,
      });


      // Form validated.
      //   Now download and open in OpenOffice or Excel to fill-in remaining data
      // Unique Prefix
    }

    // console.time("TIME: 1) in post /submission_request");
    // make_submission_object_from_db(req, res);
    // console.timeEnd("TIME: 1) in post /submission_request");
  });

router.get('/submission_form_faq', function (req, res) {
  res.render('submissions/submission_form_faq.html', {
    title: 'Sample Submission Process',
    user: req.user,
    hostname: req.CONFIG.hostname,
  });
});


module.exports = router;
