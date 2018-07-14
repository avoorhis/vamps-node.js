class Dataset {

  constructor(req, res, pid) {
    this.req             = req || {};
    this.res             = res || {};
    this.pid             = pid;
    this.dataset_obj     = {};
    this.DatasetInfo     = {};
    this.datasets_length = this.req.form["dataset_id"].length || 0;

    this.make_DatasetInfo();

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
      // this.make_dataset_obj_from_new_info();
    }
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
    var dataset_ids = [];
    if (this.req.form.dataset_id[0] === "") {
      dataset_ids = Array(this.datasets_length).fill(0, 0);
    }
    else {
      dataset_ids = this.req.form.dataset_id;
    }
    this.DatasetInfo.dataset_id          = dataset_ids;
    this.DatasetInfo.dataset             = this.convert_all_dataset_names(this.req.form["sample_name"]);
    this.DatasetInfo.dataset_description = this.req.form.dataset_description; // get from form
    this.DatasetInfo.project_id          = Array(this.datasets_length).fill(this.pid, 0);
    this.DatasetInfo.created_at          = Array(this.datasets_length).fill(new Date(), 0);
    this.DatasetInfo.updated_at          = Array(this.datasets_length).fill(new Date(), 0);
  }


  slice_object_of_array(my_object, position) {
    var sliced = [];
    for (var key in my_object) {
      var val_arr = my_object[key];
      sliced.push(val_arr[position]);
    }
    return sliced;
  }


  save_new_samples() {

    var query     = "INSERT INTO dataset VALUES ";
    var query_end = " ON DUPLICATE KEY UPDATE dataset = VALUES(dataset), project_id = VALUES(project_id);";
    var vals_arr  = [];

    for (let i = 0; i < this.datasets_length; i++) {
      var curr_dat_arr = this.slice_object_of_array(this.DatasetInfo, i);
      vals_arr.push(curr_dat_arr.join("', '"));
    }

    query = query + "('" + vals_arr.join("'), ('") + "')";
    query = query + query_end;

    connection.query(query, function (err, rows) {
      console.trace("Show me, I'm in addDataset callback");

      if (err) {
          console.log('WWW01 err', err);
          this.req.flash('fail', err);
          //  show same the form again
        }
        else {
          console.log('New dataset SAVED');
          console.log('WWW02 rows', rows);
          var did                     = rows.insertId;
          this.DatasetInfo.dataset_id = did;
          this.add_info_to_dataset_globals(this.DatasetInfo);
        }
        // this.make_dataset_obj_from_new_info();
      }
    );
  }


  after_dataset_saved(err, rows) {
    if (err) {
      console.log('WWW01 err', err);
      this.req.flash('fail', err);
      //  show same the form again
    }
    else {
      console.log('New dataset SAVED');
      console.log('WWW02 rows', rows);
      var did                     = rows.insertId;
      this.DatasetInfo.dataset_id = did;
      this.add_info_to_dataset_globals(this.DatasetInfo);
    }
    // this.make_dataset_obj_from_new_info();
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


  getAllDatasets(callback) {

    return connection.query("Select * from dataset", callback);

  }

  getDatasetByName(dataset_name, callback) {

    return connection.query("select * from dataset where dataset = ?", [dataset_name], callback);
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

  addDataset(query, callback) {
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