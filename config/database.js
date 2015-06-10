


//

//eval(fs.readFileSync('config/db-connect-test.js').toString());
//eval(fs.readFileSync('config/db-connect-production.js').toString());


//var connection;

// Generated by LiveScript 1.2.0   https://github.com/felixge/node-mysql/issues/761
// Edited: replaced all "db" with "exports.db"
(function(){
   var handleDisconnect,mysql, this$ = this;
   var mysql = require('mysql2');
   var fs = require('fs-extra');
   var config_file = 'config/db-connect-dev.js'
   eval(fs.readFileSync(config_file).toString());
   exports.db = null;
   handleDisconnect = function(){
     console.log('Trying to Connect...');
	 exports.db = mysql.createConnection(db_config);
     exports.db.connect(function(err){
	   if (err != null) {
         console.log('Error connecting to mysql:', err);
         exports.db = null;
         return setTimeout(handleDisconnect, 2000);
       }else{
       	console.log('DATABASE: '+db_config.database+' (see file '+config_file+')')
        console.log('Connected!');
       }
     });
     return exports.db.on('error', function(err){
       console.log('Database error:', err);
       if (err.code === 'PROTOCOL_CONNECTION_LOST') {
         exports.db = null;
		 console.log('Found error PROTOCOL_CONNECTION_LOST -- restarting');
         return handleDisconnect();
       } else {
         return process.exit(1);
       }
     });
   };
   handleDisconnect();

}).call(this);
