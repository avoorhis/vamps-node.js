var express = require('express');
var router = express.Router();
var Datasets = require('../../config/all_datasets')
//var helpers = require('./helpers')
var app = express();


//router.post('/unit_selection', isLoggedIn, function(req, res) {
router.post('/unit_selection',  function(req, res) {
  console.log("Got response: " + res.statusCode);
  console.log(req.body);
  console.log(JSON.stringify(req.C));
  // dataset selection +/- is checked in routes/visualization.js: check_for_no_datasets()
  res.render('visuals/unit_selection', {   title: 'Unit Selection',
                  body: JSON.stringify(req.body),
                  constants: JSON.stringify(req.C),
                              "user": req.user
                });

});
/* GET visualization page. */
router.get('/',  function(req, res) {
  
  	projects_datasets = Datasets.ALL
  	// could this projects_datasets list be filtered/limited here
  	// depending on user selected input or user access permissions?
    console.log(JSON.stringify(projects_datasets));  
    res.render('visuals/index',{ title   : 'Show Datasets!',  
                                   rows    : JSON.stringify(projects_datasets)  ,
                                   "user": req.user  
                                    })
    
});

module.exports = router;

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
      return next();
    }
    // if they aren't redirect them to the home page
    res.redirect('/');
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


