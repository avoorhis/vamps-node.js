var mysql = require('mysql2');

var Dataset    = {

  getAllDatasets: function (callback) {

    return connection.query("Select * from dataset", callback);

  },
  getDatasetById: function (id, callback) {

    return connection.query("select * from dataset where dataset_id = ?", [dataset_id], callback);
  },
  addDataset: function (Dataset, callback) {
    return connection.query("INSERT INTO dataset VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE dataset = VALUES(dataset), rev_dataset_name = VALUES(rev_dataset_name);", [Dataset.dataset_id,
      Dataset.dataset,
      Dataset.title,
      Dataset.dataset_description,
      Dataset.rev_dataset_name,
      Dataset.funding,
      Dataset.owner_user_id,
      Dataset.public,
      Dataset.metagenomic,
      Dataset.matrix,
      Dataset.created_at,
      Dataset.updated_at,
      Dataset.active
    ], callback);
  },
  deleteDataset: function (id, callback) {
    return connection.query("delete from dataset where Id=?", [id], callback);
  },
  updateDataset: function (id, Dataset, callback) {
    return connection.query("update dataset set Title=?,Status=? where Id=?", [Dataset.Title, Dataset.Status, id], callback);
  }

};
module.exports = Dataset;
//  UNIQUE KEY `dataset` (`dataset`),
//   UNIQUE KEY `rev_dataset_name` (`rev_dataset_name`),