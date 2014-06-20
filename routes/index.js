var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'VAMPS-Node.js', "user": get_user(req) });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!', "user": get_user(req) })
});


function get_user(req){
	if(!req.user || req.user==undefined)
		return ''
  	return req.user  	 	
}


module.exports = router;
