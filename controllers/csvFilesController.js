var helpers = require(app_root + '/routes/helpers/helpers');
var config  = require(app_root + '/config/config');
var fs      = require("fs");
var path    = require("path");

class CsvFileRead {
  constructor(req, res, full_file_name) {
    this.inputPath   = full_file_name;
    var file_content = fs.readFileSync(this.inputPath);
    var parse_sync   = require('csv-parse/lib/sync');
    this.data_arr    = parse_sync(file_content, {columns: true, trim: true});
  }
}

class CsvFilesWrite {

  constructor(req, res) {
    this.req      = req;
    this.res      = res;
    this.hostname = req.CONFIG.hostname;
    this.user     = req.user;
  }

  sorted_files_by_time() {
    console.time("sorted_files_by_time");
    var f_info = JSON.parse(this.req.body.file_info);
    var dir    = path.join(config.USER_FILES_BASE, this.user.username);
    f_info.sort(function (a, b) {
      return fs.statSync(path.join(dir, a.filename)).mtime.getTime() -
        fs.statSync(path.join(dir, b.filename)).mtime.getTime();
    });

    console.timeEnd("sorted_files_by_time");
    return f_info;
  }
  
  sorted_files_to_compare(sorted_files) {
    console.time("sorted_files_to_compare");

    var file_names_array = this.req.body.compare;
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
  }

  get_file_diff(files) {
    var coopy      = require('coopyhx');
    var inputPath1 = path.join(config.USER_FILES_BASE, this.user.username, files[0]["filename"]);
    var inputPath2 = path.join(config.USER_FILES_BASE, this.user.username, files[1]["filename"]);

    // console.log("PPP1 inputPath1");
    // console.log(inputPath1);

    // var columnDelimiter = ',';
    // var lineDelimiter   = '\n';
    // var cellEscape      = '"';

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
  }

  get_csv_files() {
    console.time("TIME: get_csv_files");

    var user_csv_dir = path.join(config.USER_FILES_BASE, this.user.username);
    var all_my_files = helpers.walk_sync(user_csv_dir);

    console.timeEnd("TIME: get_csv_files");
    return all_my_files;
  }

  convertArrayOfObjectsToCSV(args) {
    console.time('TIME: convertArrayOfObjectsToCSV');

    var data_copy = Object.assign({}, args.data) || null;
    if (data_copy === null) {
      return null;
    }

    var user_info = args.user_info || null;
    if (user_info === null) {
      return null;
    }

    var project_id = args.project_id || null;
    if (project_id === null) {
      return null;
    }

    var data_arr = helpers.array_from_object(data_copy);

    var matrix_length   = DATASET_IDS_BY_PID[project_id].length + 1;
    var transposed_data_arr = helpers.transpose_2d_arr_and_fill(data_arr, matrix_length);

    var columnDelimiter = args.columnDelimiter || ',';
    var lineDelimiter   = args.lineDelimiter || '\n';
    var cellEscape      = args.cellEscape || '"';

    var result = '';
    transposed_data_arr.map(function (row) {
      // TODO: to a function?
      // result = row.map(function (item) {
      var r1 = row.map(function (item) {
        // Wrap each element of the items array with quotes
        return cellEscape + item + cellEscape;
      }).join(columnDelimiter);

      result += r1;
      result += lineDelimiter;
    });


    console.timeEnd('TIME: convertArrayOfObjectsToCSV');

    return result;
  }

  make_out_file_base_name(req){
    const time_stamp = new Date().getTime();

    var file_name_project_part = req.body.project || PROJECT_INFORMATION_BY_PID[req.body.project_id].project;
    if (typeof req.body.project !== "string") {
      file_name_project_part = helpers.unique_array(file_name_project_part);
    }
    const base_name = "metadata-project" + '_' + file_name_project_part + '_' + this.user.username + '_' + time_stamp + ".csv";

    return base_name;

  }

  make_csv() {
    console.time("TIME: make_csv");
    var req = this.req;

    var csv = this.convertArrayOfObjectsToCSV({
      data: req.form, // if new datasets, add info from globals instead
      user_info: req.user, //use this.user
      project_id: req.body.project_id
    });

    const base_name = this.make_out_file_base_name(req);
    const out_csv_file_name = path.join(config.USER_FILES_BASE, req.user.username, base_name);

    fs.writeFile(out_csv_file_name, csv, function (err) {
      if (err) throw err;
    });

    console.log('file ' + out_csv_file_name + ' saved');

    var msg = 'File ' + base_name + ' was saved, please notify the Site administration if you have finished editing.';
    req.flash("success", msg);

    console.timeEnd("TIME: make_csv");
  }
}

module.exports = {
  CsvFileRead: CsvFileRead,
  CsvFiles: CsvFilesWrite
};
