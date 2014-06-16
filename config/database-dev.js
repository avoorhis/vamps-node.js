var db = require('mysql');

var connection = db.createConnection({
  host     : 'localhost',
  user     : 'ruby',
  password : 'ruby',
  database : 'vamps_js_development'
});
connection.connect();
module.exports = connection;