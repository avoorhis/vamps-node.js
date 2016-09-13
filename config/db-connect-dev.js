////
///  config/db-connect-dev.js
//
NODE_DATABASE = 'vamps_js_development'
 // NODE_DATABASE = 'vamps_js_dev_av'
//NODE_DATABASE = 'vamps_dev_mobe'    // for testing MoBE data loading from qita output
//NODE_DATABASE = 'vamps_dev_testing'
//
///
////


var db_config = {
  host     : 'localhost',
  user     : 'ruby',
  password : 'ruby',
  database :  NODE_DATABASE,
  socketPath : '/private/var/mysql/mysql.sock'
	
};