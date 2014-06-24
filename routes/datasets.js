var express = require('express');
var router = express.Router();


/* GET datasets listing. */
router.get('/', function(req, res) {
  res.send('respond with a dataset resource');
});


module.exports = router;
