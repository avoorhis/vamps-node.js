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
//router.get('/', isLoggedIn, function(req, res) {
// {
//     2: {'pname': "BPC_MRB_C", 'datasets':[
//         {"id":244,"ds":"dataset244"}
//     ]},
//     6: {'pname':"SLM_NIH_Bv4v5", 'datasets':[
//         {"id":3,"dname":"1St_121_Stockton"},
//         {"id":6,"dname":"1St_114_Hardinsburg"},
//         {"id":19,"dname":"1St_127_Pendleton"}
//     ]}

  
  
  	projects = Datasets.ALL

    console.log(JSON.stringify(projects));  
    res.render('visuals/index',{ title   : 'Show Datasets!',  
                                   rows    : JSON.stringify(projects)  ,
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


