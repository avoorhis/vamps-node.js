var express = require('express');
var router = express.Router();


var ds = require('./load_all_datasets');
var rs = ds.get_datasets(function(ALL_DATASETS){
  GLOBAL.ALL_DATASETS = ALL_DATASETS;

  /* GET home page. */
  router.get('/', function(req, res) {
    res.render('index', { title: 'VAMPS-Node.js', user: req.user });
  });

  /* GET Hello World page. */
  router.get('/helloworld', function(req, res) {
      res.render('helloworld', { title: 'Hello, World!' });
  });
});

module.exports = router;
