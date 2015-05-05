
var pool = require("generic-pool");
var fs = require('fs-extra');
mysql = require('mysql2');

//
eval(fs.readFileSync('config/db-connect-dev.js').toString());
//eval(fs.readFileSync('config/db-connect-test.js').toString());
//eval(fs.readFileSync('config/db-connect-production.js').toString());




 
var clientPool = genericPool.Pool({
  name: "MySQL",
  create: function (callback) {
    var connection = db.createConnection(config);
    connection.connect(function (error) {
      if (!error) {
        replaceClientOnDisconnect(connection);
      }
      callback(error, connection);
    });
  },
  destroy: function(connection) {
    connection.end();
  },
  // Maximum number of concurrent clients.
  max: 5
  // Minimum number of connections ready in the pool.
  // If set, then make sure to drain() on process shutdown.
  min: 1
  // How long a resource can stay idle before being removed.
  idleTimeoutMillis: 30000,
  // Use console.log if true, but it can also be function (message, level).
  log : true
});
 
// If a minimum number of clients is set, then process.exit() can hang
// unless the following listener is set.
process.on("exit", function() {
  clientPool.drain(function () {
    clientPool.destroyAllNow();
  });
});

module.exports = connection;