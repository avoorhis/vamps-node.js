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
