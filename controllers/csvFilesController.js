// var Metadata = require(app_root + '/models/metadata');
var helpers   = require(app_root + '/routes/helpers/helpers');
var CONSTS    = require(app_root + "/public/constants");
var validator = require('validator');
var config              = require(app_root + '/config/config');
var fs                  = require("fs");
var path                = require("path");

// Display list of all Submissions.
// exports.submission_list = function (req, res) {
//   res.send('NOT IMPLEMENTED: Submission list');
// };


// private
// checkArray = function (my_arr) {
//   for (var i = 0; my_arr.length > i; i++) {
//     if (my_arr[i] === "")
//       return false;
//   }
//   return true;
// };
//
// check_regexp = function (reg_exp, value, err_msg) {
//   var result = value.match(reg_exp);
//
//   // if (value !== "" && result === null) {
//   if (value !== "" && result !== null) {
//     throw new Error("'" + value + "' is not allowed in '%s'" + err_msg);
//   }
// };
//
// region_valid = function (value, region_low, region_high) {
//   if ((value !== '') && (parseInt(value) < parseInt(region_low) || parseInt(value) > parseInt(region_high))) {
//     throw new Error("'" + value + "' is not valid, %s should be between " + region_low + " and " + region_high);
//   }
// };
//
// new_row_field_validation = function (req, field_name) {
//   console.time("TIME: new_row_field_validation");
//   var err_msg = '';
//
//   //todo: send a value instead of "req.body[field_name]"?
//   var field_val_trimmed   = validator.escape(req.body[field_name] + "");
//   field_val_trimmed       = validator.trim(field_val_trimmed + "");
//   var field_val_not_valid = validator.isEmpty(field_val_trimmed + "");
//
//   if (field_val_not_valid) {
//     console.log("ERROR: an empty user's " + field_name);
//     err_msg = 'User added field "' + field_name + '" must be not empty and have only alpha numeric characters';
//     req.form.errors.push(err_msg);
//   }
//
//   console.timeEnd("TIME: new_row_field_validation");
//   return field_val_trimmed;
// };
//
// isUnique = function (all_clean_field_names_arr, column_name) {
//   return (all_clean_field_names_arr.indexOf(column_name) < 0);
// };
//
// get_cell_val_by_row = function (row_idx, req) {
//   console.time("TIME: get_cell_val_by_row");
//   var new_row_length = req.body.new_row_length;
//   var new_row_val    = [];
//
//   for (var cell_idx = 0; cell_idx < parseInt(new_row_length); cell_idx++) {
//     var cell_name = "new_row" + row_idx.toString() + "cell" + cell_idx.toString();
//     var clean_val = validator.escape(req.body[cell_name] + "");
//     clean_val     = validator.trim(clean_val + "");
//
//     new_row_val.push(clean_val);
//   }
//   console.timeEnd("TIME: get_cell_val_by_row");
//
//   return new_row_val;
// };
//
// get_names_from_ordered_const = function() {
//   console.time("time: ordered_metadata_names_only");
//
//   const arraycolumn = (arr, n) => arr.map(x => x[n]);
//
//   // var ordered_metadata_names_only = consts.metadata_form_required_fields.concat(arraycolumn(consts.ordered_metadata_names, 0));
//
//   console.timeEnd("time: ordered_metadata_names_only");
//   return arraycolumn(CONSTS.ORDERED_METADATA_NAMES, 0);
// };
//
// get_field_names = function(dataset_ids) {
//   var field_names_arr = [];
//   // field_names_arr = field_names_arr.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
//   // field_names_arr = field_names_arr.concat(CONSTS.PROJECT_INFO_FIELDS);
//
//   for (var i = 0; i < dataset_ids.length; i++) {
//     var dataset_id = dataset_ids[i];
//
//     field_names_arr = field_names_arr.concat(Object.keys(AllMetadata[dataset_id]));
//
//     field_names_arr = helpers.unique_array(field_names_arr);
//     field_names_arr.sort();
//   }
//
//   // console.log("MMM0 AllMetadataNames");
//   // console.log(JSON.stringify(AllMetadataNames));
//   //
//   // console.log("MMM1 field_names_arr");
//   // console.log(JSON.stringify(field_names_arr));
//
//   return field_names_arr;
// };
//
// prepare_empty_metadata_object = function(pid, field_names_arr, all_metadata) {
//   console.time("TIME: prepare_empty_metadata_object");
//   all_metadata = all_metadata || {};
//   if (!(all_metadata.hasOwnProperty(pid))) {
//     all_metadata[pid] = {};
//   }
//
//   for (var i = 0; i < field_names_arr.length; i++) {
//     var field_name = field_names_arr[i];
//     if (!(all_metadata[pid].hasOwnProperty(field_name))) {
//       all_metadata[pid][field_name] = [];
//     }
//   }
//
//   console.timeEnd("TIME: prepare_empty_metadata_object");
//   return all_metadata;
// };
//
// get_project_info = function (project_name_or_pid) {
//   var project_info;
//
//   if (helpers.isInt(project_name_or_pid)) {
//     project_info = PROJECT_INFORMATION_BY_PID[project_name_or_pid];
//   }
//   else {
//     project_info = PROJECT_INFORMATION_BY_PNAME[project_name_or_pid];
//   }
//
//   return {
//     project: project_info.project,
//     first_name: project_info.first,
//     institution: project_info.institution,
//     last_name: project_info.last,
//     pi_email: project_info.email,
//     pi_name: project_info.first + " " + project_info.last,
//     project_title: project_info.title,
//     public: project_info.public,
//     username: project_info.username
//   };
// };
//
// filterItems = function(arr, query) {
//   return arr.filter(function (el) {
//     return el.toLowerCase().indexOf(query.toLowerCase()) < 0;
//   });
// };

// public

exports.sorted_files_by_time = function(req) {
  console.time("sorted_files_by_time");
  var f_info = JSON.parse(req.body.file_info);
  var dir    = path.join(config.USER_FILES_BASE, req.user.username);
  f_info.sort(function (a, b) {
    return fs.statSync(path.join(dir, a.filename)).mtime.getTime() -
      fs.statSync(path.join(dir, b.filename)).mtime.getTime();
  });

  console.timeEnd("sorted_files_by_time");
  return f_info;
};

exports.sorted_files_to_compare = function(req, sorted_files) {
  console.time("sorted_files_to_compare");

  var file_names_array = req.body.compare;
  var files            = [];

  if (typeof file_names_array === 'undefined' || file_names_array.length === 0) {
    return null;
  }
  sorted_files.filter(function (el) {
    if (file_names_array.includes(el.filename)) {
      files.push(el);
    }
  });
  console.timeEnd("sorted_files_to_compare");
  return files;
};

exports.get_file_diff = function(req, files) {
  var coopy      = require('coopyhx');
  var inputPath1 = path.join(config.USER_FILES_BASE, req.user.username, files[0]["filename"]);
  var inputPath2 = path.join(config.USER_FILES_BASE, req.user.username, files[1]["filename"]);

  // console.log("PPP1 inputPath1");
  // console.log(inputPath1);

  var columnDelimiter = ',';
  var lineDelimiter   = '\n';
  var cellEscape      = '"';

  var data1 = String(fs.readFileSync(inputPath1));
  var data2 = String(fs.readFileSync(inputPath2));
  // console.log("AAA7 data1");
  // console.log(data1);
  // todo: async?
  // var parse = require('csv-parse');
  // var parser = parse({delimiter: columnDelimiter, trim: true}, function(err, data){
  //   console.log("AAA7 data");
  //   console.log(data);
  // });
  // fs.createReadStream(inputPath1).pipe(parser);


  var parse_sync = require('csv-parse/lib/sync');
  var records1   = parse_sync(data1, {trim: true});
  var records2   = parse_sync(data2, {trim: true});

  var table1 = new coopy.CoopyTableView(records1);
  var table2 = new coopy.CoopyTableView(records2);

  var alignment = coopy.compareTables(table1, table2).align();

  var data_diff  = [];
  var table_diff = new coopy.CoopyTableView(data_diff);

  var flags       = new coopy.CompareFlags();
  var highlighter = new coopy.TableDiff(alignment, flags);
  highlighter.hilite(table_diff);

  var diff2html = new coopy.DiffRender();
  diff2html.render(table_diff);
  var table_diff_html = diff2html.html();

  return "<div class = 'highlighter'>" + table_diff_html + "</div>";
};

exports.get_csv_files = function(req) {
  console.time("TIME: get_csv_files");

  var user_csv_dir = path.join(config.USER_FILES_BASE, req.user.username);
  var all_my_files = helpers.walk_sync(user_csv_dir);

  console.timeEnd("TIME: get_csv_files");
  return all_my_files;
};
