var express = require('express');
var router = express.Router();



// GLOBAL VARIABLES HERE
//if(DATASETS==undefined){
// if DATASETS exists don't go here again!  
DATASETS={}
ds = require('./load_all_datasets')
rs = ds.get_datasets(function(DATASETS){
	
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
