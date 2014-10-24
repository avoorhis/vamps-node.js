/*jshint multistr: true */

/*
1) get dataset_id
2) add dataset_id, field_name, field_type, example into custom_metadata_fields
3) add required info into db

*/

function make_db_id_query(project, datasets)
{
  var get_dataset_id_query = "SELECT DISTINCT project, project_id, dataset, dataset_id \
    FROM dataset \
    JOIN project USING(project_id) \
    WHERE dataset in (" + datasets + ") \
    AND project = '" + project + "' \
  ";
   console.log('get_dataset_id_query:');
   console.log(get_dataset_id_query);
   return get_dataset_id_query;
}

function make_insert_custom_field_names_query(insert_into_custom_fields_info)
{
  var insert_custom_field_names_query = "INSERT IGNORE INTO custom_metadata_fields (project_id, field_name, example) VALUES ( " + insert_into_custom_fields_info[0] + " )"
  
  for (var i = 1; insert_into_custom_fields_info.length > i; i += 1)
  {
    insert_custom_field_names_query += ", ( " + insert_into_custom_fields_info[i] + " ) ";
  }
  // insert_custom_field_names_query = "";
  // "INSERT IGNORE INTO custom_metadata_fields (dataset_id, field_name, example) 
  // VALUES ()
  // ";
  // 
  return insert_custom_field_names_query;
}

// public

module.exports = csvMetadataUpload;

function csvMetadataUpload() {
}

csvMetadataUpload.prototype.get_dataset_ids = function(project, datasets, callback) 
{
  get_db_id_query = make_db_id_query(project, datasets);
  connection.query(get_db_id_query, function (err, rows, fields) {
    callback(err, rows);
  });
};

csvMetadataUpload.prototype.insert_custom_field_names = function(insert_into_custom_fields_info, callback) 
{
  insert_into_custom_fields_info_query = make_insert_custom_field_names_query(insert_into_custom_fields_info);
  console.log('insert_into_custom_fields_info_query:');
  console.log(insert_into_custom_fields_info_query);
  
  connection.query(insert_into_custom_fields_info_query, function (err, rows, fields) {
    callback(err, rows);
  });
};

