class Dataset {

  constructor(req, res, pid) {
    this.req             = req || {};
    this.res             = res || {};
    this.pid             = pid;
    this.dataset_obj     = {};
    this.DatasetInfo     = {};
    this.datasets_length = this.req.form["dataset_id"].length || 0;

    this.make_DatasetInfo();
    this.dataset_objects_arr = [];
  }


  convert_dataset_name(my_str) {
    // only letters, numbers, and underscore
    return my_str.replace(/[W_]+/g, "_");
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

  make_DatasetInfo(dat_obj) {
    var curr_obj            = dat_obj;
    var dataset_ids         = [];
    var formatedMysqlString = this.get_mysql_formatted_date();

    if (this.req.form.dataset_id[0] === "") {
      dataset_ids                          = Array(this.datasets_length).fill(0, 0);
      curr_obj                             = this.req.form;
      this.DatasetInfo.dataset_id          = dataset_ids;
      this.DatasetInfo.dataset             = this.convert_all_dataset_names(curr_obj["sample_name"]);
      this.DatasetInfo.dataset_description = curr_obj.dataset_description;
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

  slice_object_of_array(my_object, position) {
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
      var curr_dat_arr = this.slice_object_of_array(this.DatasetInfo, i);
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
  }

  add_info_to_dataset_globals() {
    const pid          = this.pid.toString();
    const project_info = PROJECT_INFORMATION_BY_PID[pid];
    var temp_obj       = {};
    temp_obj.name      = project_info.project;
    temp_obj.pid       = this.pid;
    temp_obj.title     = project_info.title;
    temp_obj.datasets  = [];
    ALL_DATASETS.projects.push(temp_obj);
    DATASET_IDS_BY_PID[pid] = [];

    for (let i = 0; i < this.datasets_length; i++) {
      var dataset_info = this.dataset_objects_arr[pid][i];
      if (typeof DATASET_IDS_BY_PID[pid] === 'undefined') {
        DATASET_IDS_BY_PID[pid].push(dataset_info.dataset_id);
        DATASET_NAME_BY_DID[dataset_info.dataset_id] = dataset_info.dataset;

        var tt_obj      = {};
        tt_obj["did"]   = dataset_info.dataset_id;
        tt_obj["dname"] = dataset_info.dataset;
        tt_obj["ddesc"] = dataset_info.dataset_description;
        // temp_obj.datasets.push(tt_obj); // TODO: check below!
        ALL_DATASETS.projects[projects.length - 1].push(tt_obj);

        PROJECT_ID_BY_DID[dataset_info.dataset_id] = this.pid;
      }
    }

    // 3) ALL_DATASETS.projects[0]
    // {
    //   "name": "DAH_CFRL_ITS1",
    //   "pid": 481,
    //   "title": "CF Regional Lavage ITS1",
    //   "datasets": [
    //     {
    //       "did": 10894,
    //       "dname": "CFRL6_f_ITS1",
    //       "ddesc": "CFRL_ITS1"
    //     },
    // ...
    //     {
    //       "did": 10893,
    //       "dname": "CFRL9_e_ITS1",
    //       "ddesc": "CFRL_ITS1"
    //     }
    //   ]
    // }


  }


  getAllDatasets(callback) {

    return connection.query("Select * from dataset", callback);

  }

  getDatasetByName(dataset_name, callback) {

    return connection.query("select * from dataset where dataset = ?", [dataset_name], callback);
  }

  get_new_dataset_by_name(callback) {
    var dataset_names = "('" + this.req.form["sample_name"].join("', '") + "')";

    return connection.query("select * from dataset where dataset in " + dataset_names + "AND project_id = ?", [this.pid], callback);
  }

// getDatasetById(id, callback) {
//
//   return connection.query("select * from dataset where dataset_id = ?", [dataset_id], callback);
// }
//dataset_id, dataset, dataset_description, project_id, created_at, updated_at,

// new_dataset.addDataset(function (err, rows) {
// console.time("TIME: in make_metadata_object_from_form, add dataset");
// if (err) {
//   console.log('WWW0 err', err);
//   req.flash('fail', err);
// }
// else {
//   console.log('New datasets SAVED');
//   console.log('WWW rows', rows);
//   // var did = rows.insertId;
//   // new_dataset.add_info_to_dataset_globals(dataset_obj, did);
//
// }

  addDataset(callback) {
    var query = this.make_query();
    return connection.query(query, callback);
  }

// deleteDataset(id, callback) {
//   return connection.query("delete from dataset where Id=?", [id], callback);
// }
// updateDataset(id, Dataset, callback) {
//   return connection.query("update dataset set Title=?,Status=? where Id=?", [Dataset.Title, Dataset.Status, id], callback);
// }

}

module.exports = Dataset;
// UNIQUE KEY `dataset_project` (`dataset`,`project_id`)