var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  if(req.user==undefined){
  	user = ''
  }else{
  	user = req.user.username
  }
  res.render('index', { title: 'VAMPS-Node.js', user: user });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' })
});





module.exports = router;
