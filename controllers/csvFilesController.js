var helpers   = require(app_root + '/routes/helpers/helpers');
var config              = require(app_root + '/config/config');
var fs                  = require("fs");
var path                = require("path");
var metadata_controller = require(app_root + '/controllers/metadataController');

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

exports.make_csv = function(req) {
  var out_csv_file_name;
  console.time("TIME: make_csv");

  var csv = metadata_controller.convertArrayOfObjectsToCSV({
    data: req.form,
    user_info: req.user,
    project_id: req.body.project_id
  });

  time_stamp = new Date().getTime();

  var base_name     = "metadata-project" + '_' + req.body.project + '_' + req.user.username + '_' + time_stamp + ".csv";
  out_csv_file_name = path.join(config.USER_FILES_BASE, req.user.username, base_name);

  //TODO: more robust project!

  fs.writeFile(out_csv_file_name, csv, function (err) {
    if (err) throw err;
  });

  console.log('file ' + out_csv_file_name + ' saved');

  var msg = 'File ' + base_name + ' was saved, please notify the Site administration if you have finished editing.';
  req.flash("success", msg);

  console.timeEnd("TIME: make_csv");
};
