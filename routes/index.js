var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'VAMPS-Node.js' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' })
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "email" : userEmail
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.location("userlist");
            // And forward to success page
            res.redirect("userlist");
        }
    });
});

/* GET Datasetlist page. */
router.get('/datasetlist', function(req, res) {
    
    var db = req.db;
    var collection = db.query('SELECT project,dataset FROM datasets JOIN projects on (projects.id=project_id)', function (err, rows, fields){
    	if(err)	{
			throw err;
		}else{
			datasets_by_project_all = new Object();
			for(n=0;n<rows.length;n++){
				//console.log(rows[n].dataset)
				//console.log(rows[n].project)
				if(rows[n].project in datasets_by_project_all){
					datasets_by_project_all[rows[n].project].push(rows[n].dataset)
				}else{
					datasets_by_project_all[rows[n].project] = [rows[n].dataset]
				}
			}
			console.log( Object.keys(datasets_by_project_all).length );
			res.render('datasetlist',{ title: 'Show Datasets!', rows: JSON.stringify(datasets_by_project_all) })
		}
		
    });  
});

module.exports = router;
