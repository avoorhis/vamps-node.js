var helpers = require(app_root + '/routes/helpers/helpers');

class Dataset {

  constructor(req, res, pid, data) {
    this.req         = req || {};
    this.res         = res || {};
    this.pid         = pid;
    this.dataset_obj = {};
    this.DatasetInfo = {};
    if (typeof this.req.form !== 'undefined') {
      this.datasets_length = this.req.form["dataset_id"].length;
      this.make_DatasetInfo(data);
    }
    else {
      //TODO: get datasets_length from csv
      this.datasets_length = data.dataset.length;
      this.make_empty_DatasetInfo(data);
    }
    this.dataset_objects_arr = [];
  }


  convert_dataset_name(my_str) {
    // only letters, numbers, and underscore
    return my_str.replace(/[^A-z0-9]+/g, "_");
  }

  convert_all_dataset_names(names_arr) {
    var d_converted_arr = [];
    for (var d in names_arr) {
      var curr_name  = names_arr[d];
      var clean_name = this.convert_dataset_name(curr_name);
      d_converted_arr.push(clean_name);
    }
    return d_converted_arr;
  }

  make_dataset_name(data){
    let datasets = [];
    if (data.dataset[0].length === 0 && data.sample_name[0].length > 0)
    {
      datasets = this.convert_all_dataset_names(data["sample_name"]);
    }
    else {
      datasets = this.convert_all_dataset_names(data["dataset"]);
    }
    return datasets;
  }

  make_tube_label(data) {
    let tube_labels = this.convert_all_dataset_names(data["dataset"]) || Array(this.datasets_length).fill("", 0);
    if ((tube_labels[0].length === 0) && (typeof data["tube_label"] !== 'undefined') && (data["tube_label"][0].length > 0) ) {
      tube_labels = this.convert_all_dataset_names(data["tube_label"]);
    }
    return tube_labels;
  }

  make_empty_DatasetInfo(data) {
    var formatedMysqlString     = this.get_mysql_formatted_date();
    this.DatasetInfo.dataset_id = Array(this.datasets_length).fill(0, 0);
    this.DatasetInfo.dataset    = this.make_dataset_name(data);
    this.DatasetInfo.dataset_description = data.dataset_description || Array(this.datasets_length).fill("", 0);
    this.DatasetInfo.tube_label = this.make_tube_label(data);
    this.DatasetInfo.project_id = Array(this.datasets_length).fill(this.pid, 0);
    this.DatasetInfo.created_at = Array(this.datasets_length).fill(formatedMysqlString, 0);
    this.DatasetInfo.updated_at = Array(this.datasets_length).fill(formatedMysqlString, 0);
  }

  make_DatasetInfo(data) {
    var curr_obj            = data;
    var dataset_ids         = [];
    var formatedMysqlString = this.get_mysql_formatted_date();

    if (this.req.form.dataset_id[0] === "") {
      dataset_ids                          = Array(this.datasets_length).fill(0, 0);
      curr_obj                             = this.req.form;
      this.DatasetInfo.dataset_id          = dataset_ids;
      this.DatasetInfo.dataset             = this.make_dataset_name(curr_obj);
        // this.convert_all_dataset_names(curr_obj["sample_name"]);
      this.DatasetInfo.dataset_description = curr_obj.dataset_description;
      this.DatasetInfo.tube_label          = this.make_tube_label(curr_obj);
        // this.DatasetInfo.dataset;
      this.DatasetInfo.project_id          = Array(this.datasets_length).fill(this.pid, 0);
      this.DatasetInfo.created_at          = Array(this.datasets_length).fill(formatedMysqlString, 0);
      this.DatasetInfo.updated_at          = Array(this.datasets_length).fill(formatedMysqlString, 0);
    }
    else {
      dataset_ids = curr_obj.dataset_id;
      //  WWW rows [ TextRow {
      //     dataset_id: 10931,
      //     dataset: 'test_dataset_1',
      //     dataset_description: 'Test dataset 1 description',
      //     project_id: 513,
      //     created_at: 2018-07-14T19:36:40.000Z,
      //     updated_at: 2018-07-14T19:36:40.000Z },
      //   TextRow {
    }

  }

  get_mysql_formatted_date() {
    var starttime           = new Date();
    var isotime             = new Date((new Date(starttime)).toISOString());
    var fixedtime           = new Date(isotime.getTime() - (starttime.getTimezoneOffset() * 60000));
    var formatedMysqlString = fixedtime.toISOString().slice(0, 19).replace('T', ' ');
    console.log(formatedMysqlString);

    // (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');

    return formatedMysqlString;

  }

  slice_object_of_arrays(my_object, position) {
    var sliced = [];
    for (var key in my_object) {
      var val_arr = my_object[key];
      sliced.push(val_arr[position]);
    }
    return sliced;
  }


  make_query() {

    var query     = "INSERT INTO dataset VALUES ";
    var query_end = " ON DUPLICATE KEY UPDATE dataset = VALUES(dataset), project_id = VALUES(project_id);";
    var vals_arr  = [];

    for (let i = 0; i < this.datasets_length; i++) {
      var curr_dat_arr = this.slice_object_of_arrays(this.DatasetInfo, i);
      var a = helpers.slice_object_by_positions(this.DatasetInfo, i);
      if (a === curr_dat_arr) {
        console.log("YES");
      }
      else {
        console.log("NO");
      }
      vals_arr.push(curr_dat_arr.join("', '"));
    }

    query = query + "('" + vals_arr.join("'), ('") + "')";
    query = query + query_end;
    return query;
  }

  update_dataset_obj(rows) {
    //     var did                     = rows.insertId;
    console.log('WWW002 rows', rows);
    this.dataset_objects_arr[this.pid.toString()] = Object.assign(rows);
    // this.dataset_objects_arr[482][0]
    // dataset = "test_dataset_1"
    // dataset_description = "Dataset_1 description"
    // dataset_id = 10895
    // project_id = 482
  }

  add_info_to_dataset_globals() {
    const pid          = this.pid.toString();
    const project_info = PROJECT_INFORMATION_BY_PID[pid];
    var temp_obj       = {};
    temp_obj.name      = project_info.project;
    temp_obj.pid       = this.pid;
    temp_obj.title     = project_info.title;
    temp_obj.datasets  = [];
    // temp_obj.ddesc = "C6 Consortia Inoculum";
    // temp_obj.did = 9347;
    // temp_obj.dname = "23";
    ALL_DATASETS.projects.push(temp_obj);
    DATASET_IDS_BY_PID[pid]     = [];
    this.DatasetInfo.dataset_id = [];

    for (let i = 0; i < this.datasets_length; i++) {
      if (this.dataset_objects_arr[pid].length !== this.datasets_length) {
        console.log("EEEE1 dataset_objects_arr[pid] = ", JSON.stringify(this.dataset_objects_arr[pid]));
        console.log("this.datasets_length = ", this.datasets_length);
      }
      var dataset_info       = this.dataset_objects_arr[pid][i];
      var myArray_dataset_id = this.DatasetInfo.dataset_id;
      this.add_obj_to_arr(dataset_info.dataset_id, myArray_dataset_id);
      var myArray_dataset = this.DatasetInfo.dataset;
      this.add_obj_to_arr(dataset_info.dataset, myArray_dataset);

      DATASET_IDS_BY_PID[pid].push(dataset_info.dataset_id);
      DATASET_NAME_BY_DID[dataset_info.dataset_id] = dataset_info.dataset;

      var tt_obj      = {};
      tt_obj["did"]   = dataset_info.dataset_id;
      tt_obj["dname"] = dataset_info.dataset;
      tt_obj["ddesc"] = dataset_info.dataset_description;

      var myArray1 = ALL_DATASETS.projects[ALL_DATASETS.projects.length - 1].datasets;
      this.add_obj_to_arr(tt_obj, myArray1);

      PROJECT_ID_BY_DID[dataset_info.dataset_id] = this.pid;
      // AllMetadata
    }
  }

  add_obj_to_arr(obj, myArray) {
    myArray[myArray.length] = obj;
  }

  getAllDatasets(callback) {

    return connection.query("SELECT * FROM dataset", callback);

  }

  getDatasetByName(dataset_name, callback) {

    return connection.query("SELECT * FROM dataset WHERE dataset = ?", [dataset_name], callback);
  }

  getDatasetById(dataset_ids, callback) {

    var dataset_ids_str = "('" + dataset_ids.join("', '") + "')";
    return connection.query("SELECT * FROM dataset WHERE dataset_id in ?", [dataset_ids_str], callback);
  }

  get_new_dataset_by_name(callback) {
    var dataset_names = "('" + this.DatasetInfo["dataset"].join("', '") + "')";

    return connection.query("SELECT * FROM dataset WHERE dataset in " + dataset_names + "AND project_id = ?", [this.pid], callback);
  }

  addDataset(callback) {
    var query = this.make_query();
    return connection.query(query, callback);
  }

}

module.exports = Dataset;
// UNIQUE KEY `dataset_project` (`dataset`,`project_id`)