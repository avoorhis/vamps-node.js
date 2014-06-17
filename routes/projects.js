var express = require('express');
var router = express.Router();

// These are all under /user
/* GET New User page. */
router.get('/', function(req, res) {
    var db = req.db;
    var qSelect = "SELECT project,title,project_description from projects"
    console.log(qSelect)
    var collection = db.query(qSelect, function (err, rows, fields){
    	if(err)	{
			throw err;
		}else{
	    	res.render('projectlist', { "rows" : rows  });
    	}
    });
    
});

module.exports = router;
