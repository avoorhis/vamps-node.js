var express = require('express');
var router = express.Router();

// These are all under /user
/* GET User List (index) page. */
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

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});


module.exports = router;
