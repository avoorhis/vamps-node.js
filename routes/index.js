var express = require('express');
var router = express.Router();


var ds = require('./load_all_datasets');
var rs = ds.get_datasets(function(ALL_DATASETS){
  GLOBAL.ALL_DATASETS = ALL_DATASETS;

  /* GET home page. */
  router.get('/', function(req, res) {
    res.render('index', { title: 'VAMPS Home Page', user: req.user });
  });

  /* GET Overview page. */
  router.get('/overview', function(req, res) {
      res.render('overview', { title: 'Overview of the VAMPS Project', user: req.user });
  });

  /* GET Search page. */
  router.get('/search', function(req, res) {
      res.render('search', { title: 'Search VAMPS datasets', 
      											 user: req.user 
      											});
  });





});

module.exports = router;
