// var mysql = require('mysql2');

class Dataset {

  constructor(req, res, pid) {
    this.req             = req || {};
    this.res             = res || {};
    this.pid             = pid;
    this.dataset_obj     = {};
    this.DatasetInfo     = {};
    this.make_DatasetInfo();
    this.datasets_length = this.DatasetInfo.dataset_id.length || 0;
  }

  slice_object_of_arrays(my_object, position) {
    var sliced = [];
    for (var key in my_object) {
      var val_arr = my_object[key];
      sliced.push(val_arr[position]);
    }
    return sliced;
  }

  add_all_new_datasets() {
    for (let i = 0; i < this.datasets_length; i++) {
      var curr_obj = this.slice_object_of_arrays(this.DatasetInfo, i);
      this.addDataset(curr_obj, function (err, res) {
        console.log("RRR55 res", res);
      });
    }
  }

  updateDatasetInfo() {
    //get from query
    var did = 0;
    this.DatasetInfo.dataset_id = did;
  }

  my_callback(err, res) {
      console.log("RRR55 res", res);
  }

  after_save() {
    for (let i = 0; i < this.datasets_length; i++) {
      var dataset = this.DatasetInfo.dataset[i];
      this.getDatasetByName(dataset, this.my_callback());
    }

    this.updateDatasetInfo();
    this.add_info_to_dataset_globals(this.DatasetInfo);

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

  make_DatasetInfo() {
    this.DatasetInfo.dataset_id          = this.req.form.dataset_id;
    this.DatasetInfo.dataset             = this.convert_all_dataset_names(this.req.form["sample_name"]);
    this.DatasetInfo.dataset_description = this.req.form.dataset_description; // get from form
    this.DatasetInfo.project_id          = Array(this.req.form["sample_name"].length).fill(this.pid, 0);
    this.DatasetInfo.created_at          = Array(this.req.form["sample_name"].length).fill(new Date(), 0);
    this.DatasetInfo.updated_at          = Array(this.req.form["sample_name"].length).fill(new Date(), 0);
  }

  // after_dataset_saved(err, rows) {
  //   if (err) {
  //     console.log('WWW01 err', err);
  //     this.req.flash('fail', err);
  //     //  show same the form again
  //   }
  //   else {
  //     console.log('New dataset SAVED');
  //     console.log('WWW02 rows', rows);
  //     var did                     = rows.insertId;
  //     this.DatasetInfo.dataset_id = did;
  //     this.add_info_to_dataset_globals(this.DatasetInfo);
  //   }
  //   // this.make_dataset_obj_from_new_info();
  // }

  add_info_to_dataset_globals(object_to_add) {
    const pid = this.pid;
    if (typeof DATASET_IDS_BY_PID[pid] === 'undefined') {
      DATASET_IDS_BY_PID[pid]                       = object_to_add.dataset_id;
      DATASET_NAME_BY_DID[object_to_add.dataset_id] = object_to_add.dataset;
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

  getDatasetById(dataset_id, callback) {
    return connection.query("select * from dataset where dataset_id = ?", [dataset_id], callback);
  }

  getDatasetByName(dataset, callback) {
    return connection.query("select * from dataset where dataset = ?", [dataset], callback);
  }

  addDataset(DatasetInfo_arr, callback) {
    return connection.query("INSERT INTO dataset VALUES(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE dataset = VALUES(dataset), project_id = VALUES(project_id);", DatasetInfo_arr, callback);
  }


}

module.exports = Dataset;
// UNIQUE KEY `dataset_project` (`dataset`,`project_id`)
