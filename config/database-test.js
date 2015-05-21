var db = require('mysql');

var connection = db.createConnection({
  host     : 'localhost',
  user     : 'ruby',
  password : 'ruby',
  database : 'vamps_js_testing'
});

module.exports = connection;