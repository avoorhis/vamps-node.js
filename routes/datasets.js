var express = require('express');
var router = express.Router();


/* GET datasets listing. */
router.get('/', function(req, res) {
  res.send('respond with a dataset resource');
});

function get_user(req){
	if(!req.user || req.user==undefined)
		return ''
  	return req.user  	 	
}

module.exports = router;
