var express = require('express');
var router = express.Router();

/* GET Userlist page. */
router.get('/', function(req, res) {
    var db = req.db;
    var qSelect = "SELECT * from users"
    console.log(qSelect)
    var collection = db.query(qSelect, function (err, rows, fields){
    	if(err)	{
			throw err;
		}else{

	    	res.render('userlist', { "rows" : rows  });
    	}
    });
    
});

module.exports = router;