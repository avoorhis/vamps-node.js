var Metadata = require(app_root + '/models/metadata');
var helpers  = require(app_root + '/routes/helpers/helpers');

// Display list of all Submissions.
// exports.submission_list = function (req, res) {
//   res.send('NOT IMPLEMENTED: Submission list');
// };

exports.get_all_field_units = function(req) {
  var current_field_units = MD_CUSTOM_UNITS[req.body.project_id];
};
