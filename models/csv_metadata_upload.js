/*jshint multistr: true */

/*
1) get dataset_id
2) add dataset_id, field_name, field_type, example into custom_metadata_fields
3) add required info into db

*/

function make_dataset_id_query(project, datasets)
{
  var get_dataset_id_query = "SELECT DISTINCT dataset, dataset_id \
    FROM dataset \
    JOIN project USING(project_id) \
    WHERE dataset in (" + datasets + ") \
    AND project = '" + project + "' \
  ";
   console.log('running get_dataset_id_query:');
   console.log(get_dataset_id_query);
   return get_dataset_id_query;
}

module.exports = csvMetadataUpload;

function csvMetadataUpload() {
}

csvMetadataUpload.prototype.get_dataset_ids = function(project, datasets, callback) 
{
  get_dataset_id_query = make_dataset_id_query(project, datasets);
  connection.query(get_dataset_id_query, function (err, rows, fields) {
    callback(err, rows);
  });
};

