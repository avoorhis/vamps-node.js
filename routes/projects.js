var express = require('express');
var router = express.Router();

// These are all under /projects
/* GET New User page. */
router.get('/', function(req, res) {
    var db = req.db;
    var qSelect = "SELECT id,project,title,project_description from projects"
    console.log(qSelect)
    var collection = db.query(qSelect, function (err, rows, fields){
    	if(err)	{
			throw err;
		}else{
	    	res.render('projects/index', { "rows" : rows, "user": get_user(req)  });
    	}
    });
    
});

router.get('/:id', function(req, res) {
    var db = req.db;
    var qSelect = "SELECT id,project,title,project_description from projects where id='"+ req.params.id +"'"
    console.log(qSelect)
    var collection = db.query(qSelect, function (err, rows, fields){
    	if(err)	{
			throw err;
		}else{
	    	res.render('projects/profile', { "rows" : rows, "user": get_user(req)  });
    	}
    });
    
});

function get_user(req){
    if(!req.user || req.user==undefined)
        return ''
    return req.user         
}

module.exports = router;
