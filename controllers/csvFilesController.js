var helpers = require(app_root + '/routes/helpers/helpers');
var config  = require(app_root + '/config/config');
var fs      = require("fs");
var path    = require("path");

class CsvFileRead {
  constructor(req, res, full_file_name) {
    this.inputPath   = full_file_name;
    var file_content = fs.readFileSync(this.inputPath);
    var parse_sync   = require('csv-parse/lib/sync');
    this.data_arr    = parse_sync(file_content, {columns: true, trim: true}); //
    this.data_arr_no_head = parse_sync(file_content, {trim: true}); //columns: true,
  }

  get_structured_names(parsed_csv_obj) {
    // const metadata_name_field = "structured_comment_name";
    let structured_names = [];
    var array_width = parsed_csv_obj.length || 0;

    for (var i = 0; i < array_width; i++) {
      structured_names.push(parsed_csv_obj[i][0]);
    }
    return structured_names;
  }

  create_an_empty_fixed_length_array(number_of_datasets) {
    var data_arr = [];
    var length = number_of_datasets;

    for (var i = 0; i < length; i++) {
      data_arr.push("");
    }
    return data_arr;
  }

  create_an_empty_transposed_object_for_template(parsed_csv_obj) {
    var empty_transposed_object = {};
    const structured_names = this.get_structured_names(parsed_csv_obj);
    for (var id in structured_names) {
      empty_transposed_object[structured_names[id]] = [];
    }
    return empty_transposed_object;
  }

  make_obj_from_template_csv(parsed_csv_obj) {
    console.time('TIME: make_obj_from_template_csv');

    var array_width = parsed_csv_obj.length || 0;
    var column_num  = parsed_csv_obj[0] instanceof Object ? Object.keys(parsed_csv_obj[0]) : [];
    var headers_len = column_num.length;

    // const structured_names = this.get_structured_names(parsed_csv_obj);

    // In case it is a zero matrix, no transpose routine needed.
    if (headers_len === 0 || array_width === 0) {
      return [];
    }

    const key_const      = ['structured_comment_name', 'Metadata name'].length;
    const dataset_num    = headers_len - key_const;
    var transposed_object = this.create_an_empty_transposed_object_for_template(parsed_csv_obj);

    const empty_fixed_length_array = this.create_an_empty_fixed_length_array(dataset_num);

    for (var i = 0; i < array_width; i++) {
      let metadata_name = parsed_csv_obj[i][0];
      let dataset_ord_num  = 0;
      transposed_object[metadata_name] = empty_fixed_length_array.slice(); // must be "slice" to make a copy

      for (var n = 0; n < dataset_num; n++) {
        dataset_ord_num = key_const + n;
        let val = parsed_csv_obj[i][dataset_ord_num];
        if (val.length > 0) {
          transposed_object[metadata_name][n] = val;
        }
      }
    }

    console.timeEnd('TIME: make_obj_from_template_csv');
    return transposed_object;
  }
}

class CsvFilesWrite { // writes a csv file from form, manageable from "Your Data")

  constructor(req, res) {
    this.req      = req;
    this.res      = res;
    this.hostname = req.CONFIG.hostname;
    this.user     = req.user;
    this.fields_for_pipeline_csv = {"adaptor": ["adapter_sequence"],
      "amp_operator": ["amp_operator"],
      "barcode": ["barcode"],
      "barcode_index": ["barcode_index"],
      "data_owner": ["username"],
      "dataset": ["dataset"],
      "dataset_description": ["dataset_description"],
      "dna_region": ["dna_region"],
      "email": ["pi_email"],
      "env_source_name": ["env_package"],
      "first_name": ["first_name"],
      "funding": ["funding"],
      "insert_size": ["insert_size"],
      "institution": ["institution"],
      "lane": ["lane"],
      "last_name": ["last_name"],
      "overlap": ["overlap"],
      "platform": ["MBL_platform"],
      "primer_suite": ["primer_suite"],
      "project": ["project"],
      "project_description": ["project_description"],
      "project_title": ["project_title"],
      "read_length": ["read_length"],
      "run": ["run"],
      "run_key": ["run_key"],
      "seq_operator": ["seq_operator"],
      "tubelabel": ["tubelabel"],
    };
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

    var file_name_project_part = req.body.project;
    if (typeof PROJECT_INFORMATION_BY_PID[req.body.project_id] !== 'undefined') {
        file_name_project_part = PROJECT_INFORMATION_BY_PID[req.body.project_id].project;
    }

    if (typeof req.body.project !== "string") {
      file_name_project_part = helpers.unique_array(file_name_project_part);
    }
    const base_name = "metadata-project" + '_' + file_name_project_part + '_' + this.user.username + '_' + time_stamp + ".csv";

    return base_name;
  }

  make_csv_to_upload_to_pipeline(req) {

    this.fields_for_pipeline_csv = {"adaptor": ["adapter_sequence"],
      "amp_operator": ["amp_operator"],
      "barcode": ["barcode"],
      "barcode_index": ["barcode_index"],
      "data_owner": ["username"],
      "dataset": ["dataset"],
      "dataset_description": ["dataset_description"],
      "dna_region": ["dna_region"],
      "email": ["pi_email"],
      "env_source_name": ["env_package"],
      "first_name": ["first_name"],
      "funding": ["funding"],
      "insert_size": ["insert_size"],
      "institution": ["institution"],
      "lane": ["lane"],
      "last_name": ["last_name"],
      "overlap": ["overlap"],
      "platform": ["MBL_platform"],
      "primer_suite": ["primer_suite"],
      "project": ["project"],
      "project_description": ["project_description"],
      "project_title": ["project_title"],
      "read_length": ["read_length"],
      "run": ["run"],
      "run_key": ["run_key"],
      "seq_operator": ["seq_operator"],
      "tubelabel": ["tubelabel"],
    };

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
