var mysql = require('mysql2');

// exports.get_submissions_by_user = function(req, callback)
// {
//   var user_submissions_query = "SELECT submit_code from vamps.vamps_submissions where user_id = '" + req.user.user_id + "'";
//
//   connection.query(user_submissions_query, function (err, rows, fields) {
//     callback(err, rows);
//   });
// };

// exports.get_submissions_by_user = function (done) {
//   mysql.get().query('SELECT submit_code from vamps.vamps_submissions', function (err, rows) {
//     if (err) return done(err);
//     done(null, rows);
//   });
// };

exports.get_submissions_by_user = function(done) {
  mysql.get(mysql.READ, function(err, connection) {
    if (err) return done('Database problem');

    connection.query('SELECT submit_code from vamps.vamps_submissions', function (err, rows) {
      if (err) return done(err);
      done(null, rows);
      console.log("RRR", rows);
    });
  });
};


