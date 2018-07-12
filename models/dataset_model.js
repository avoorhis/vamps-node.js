class Dataset {

  constructor(req, res, pid) {
    this.req                    = req || {};
    this.res                    = res || {};
    this.pid                    = pid;
    this.dataset_obj            = {};
    // this.dataset_info_from_form = this.get_dataset_info_from_form();
    this.make_dataset_obj();
  }

  make_dataset_obj() {
    if (parseInt(this.req.form['dataset_id'][0], 10) > 0) {
      this.make_dataset_obj_from_existing_data();
    }
    else {
      this.save_new_samples();

      // add check if exist, see project, get data from globals
      this.make_dataset_obj_from_new_info();
    }
  }

  convert_dataset_name(my_str) {
    // only letters, numbers, and underscore
    return my_str.replace(/[W_]+/g, "_");
  }

  get_dataset_info_from_form() {
    const info                  = this.req.form;
    var sample_name_arr         = [];
    var dataset_description_arr = [];

    if (info.hasOwnProperty("sample_name")) {
      sample_name_arr = info["sample_name"];
    }
    if (info.hasOwnProperty("dataset_description")) {
      dataset_description_arr = info["dataset_description"];
    }
    return [sample_name_arr, dataset_description_arr];
  }

  make_DatasetInfo(value, index, array) {

    console.log(value);
    console.log(index);

    const DatasetInfo               = {};
    DatasetInfo.dataset_id          = 0;
    DatasetInfo.dataset             = this.convert_dataset_name(value);
    DatasetInfo.dataset_description = ""; // get from form
    DatasetInfo.project_id          = this.pid;
    DatasetInfo.created_at          = new Date();
    DatasetInfo.updated_at          = new Date();
  }

  save_new_samples() {
    // function logArrayElements(element, index, array) {
    //   console.log('a[' + index + '] = ' + element);
    // }

    // [2, 5, , 9].forEach(logArrayElements);
    // TODO: in method
    var DatasetInfo = {};
    var sample_name_arr = this.req.form["sample_name"];
    var dataset_description_arr = this.req.form["dataset_description"];

    for (let i = 0; i < sample_name_arr.length; i++) {
      DatasetInfo.dataset_id          = 0;
      DatasetInfo.dataset             = this.convert_dataset_name(sample_name_arr[i]);
      DatasetInfo.dataset_description = dataset_description_arr[i];
      DatasetInfo.project_id          = this.pid;
      DatasetInfo.created_at          = new Date();
      DatasetInfo.updated_at          = new Date();
    }
    // var DatasetInfo = this.dataset_info_from_form[0].forEach(this.make_DatasetInfo);

    this.addDataset(DatasetInfo, function (err, rows) {
      if (err) {
        console.log('WWW01 err', err);
        this.req.flash('fail', err);
        //  show same the form again
      }
      else {
        console.log('New dataset SAVED');
        console.log('WWW02 rows', rows);
        var did = rows.insertId;
      }
      // this.make_dataset_obj_from_new_info();
    });

  }

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

  make_dataset_obj_from_new_info() {
    var temp_dataset_obj = {};

  }

  getAllDatasets(callback) {

    return connection.query("Select * from dataset", callback);

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

  addDataset(DatasetInfo, callback) {
    return connection.query("INSERT INTO dataset VALUES(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE dataset = VALUES(dataset), project_id = VALUES(project_id);", [DatasetInfo.dataset_id,
      DatasetInfo.dataset,
      DatasetInfo.dataset_description,
      DatasetInfo.project_id,
      DatasetInfo.created_at,
      DatasetInfo.updated_at,
    ], callback);
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
