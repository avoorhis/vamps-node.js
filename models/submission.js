var mysql = require('mysql2');

exports.get_submissions_by_user = function(req, callback)
{
  var user_submissions_query = "SELECT submit_code from test_vamps.vamps_submissions";
  // where user_id = '" + req.user.user_id + "'";

  connection.query(user_submissions_query, function (err, rows, fields) {
    if (err)
    {    console.log("EEE", err);

      return err;}
    console.log("RRR", rows);

    callback(err, rows);
  });
};



