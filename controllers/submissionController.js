var Submission = require(app_root + '/models/submission');

// Display list of all Submissions.
// exports.submission_list = function (req, res) {
//   res.send('NOT IMPLEMENTED: Submission list');
// };

exports.get_pi_list = function () {
  console.log("FROM Controller");
  var pi_list = [];

  console.log("LLLLL ALL_USERS_BY_UID", ALL_USERS_BY_UID);
  for (var i in ALL_USERS_BY_UID) {
    pi_list.push({'PI': ALL_USERS_BY_UID[i].last_name + ' ' + ALL_USERS_BY_UID[i].first_name, 'pid': i});

  }

  pi_list.sort(function sortByAlpha(a, b) {
    return helpers.compareStrings_alpha(a.PI, b.PI);
  });

  console.log("PPP1");
  console.log(pi_list);
};

