var express = require('express');
var router = express.Router();

// These are all under /projects
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

router.get('/project/:id', function(req, res) {
    var db = req.db;
    var qSelect = "SELECT project,title,project_description from projects where id='"+ req.params.id +"'"
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
