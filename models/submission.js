var mysql = require('mysql2');

// exports.get_submissions_by_user = function (callback) {
//
//   return connection.query("Select * from test_vamps.vamps_submissions", callback);
//
// };


var Submission = {

  getAllSubmissions: function (user_id, callback) {

    return connection.query("Select * from test_vamps.vamps_submissions where user_id = " + connection.escape(user_id), callback);

  },
  getSubmitCodeByUser: function (user_id, callback) {

    return connection.query("Select distinct submit_code from test_vamps.vamps_submissions where user_id = " + connection.escape(user_id), callback);

  },
  getSubmissionById: function (id, callback) {

    return connection.query("select * from test_vamps.vamps_submissions where Id=?", [id], callback);
  },
  addSubmission: function (Submission, callback) {
    return connection.query("Insert into test_vamps.vamps_submissions values(?,?,?)", [Submission.Id, Submission.Title, Submission.Status], callback);
  },
  deleteSubmission: function (id, callback) {
    return connection.query("delete from test_vamps.vamps_submissions where Id=?", [id], callback);
  },
  updateSubmission: function (id, Submission, callback) {
    return connection.query("update test_vamps.vamps_submissions set Title=?,Status=? where Id=?", [Submission.Title, Submission.Status, id], callback);
  }

};
module.exports = Submission;
