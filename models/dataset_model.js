class Dataset {

  constructor(req, res, pid) {
    this.req      = req || {};
    this.res      = res || {};
    this.pid      = pid;
    this.project_obj = {};
    this.make_project_obj();
  }

  getAllDatasets(callback) {

    return connection.query("Select * from dataset", callback);

  }
  // getDatasetById(id, callback) {
  //
  //   return connection.query("select * from dataset where dataset_id = ?", [dataset_id], callback);
  // }
  //dataset_id, dataset, dataset_description, project_id, created_at, updated_at,

  addDataset(Dataset, callback) {
    return connection.query("INSERT INTO dataset VALUES(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE dataset = VALUES(dataset), project_id = VALUES(project_id);", [Dataset.dataset_id,
      Dataset.dataset,
      Dataset.dataset_description,
      Dataset.project_id,
      Dataset.created_at,
      Dataset.updated_at,
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
