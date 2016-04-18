var db = require('mysql2');
//var fs = require('fs-extra');

//var db_config_file = './config/db-connection.js';
//eval(fs.readFileSync(db_config_file).toString());
NODE_DATABASE = 'vamps_testing'
var connection = db.createConnection({
  host     : 'localhost',
  user     : 'ruby',
  password : 'ruby',
  database : NODE_DATABASE
});

module.exports = connection;