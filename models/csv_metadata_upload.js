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
  // console.log('QQQQ insert_into_custom_fields_info:');
  // console.log(insert_into_custom_fields_info);

  var insert_custom_field_names_query = "INSERT IGNORE INTO custom_metadata_fields (project_id, field_name, example) VALUES ( " + insert_into_custom_fields_info[0] + " )";
  
  for (var i = 1; insert_into_custom_fields_info.length > i; i += 1)
  {
    insert_custom_field_names_query += ", ( " + insert_into_custom_fields_info[i] + " ) ";
  }
  return insert_custom_field_names_query;
}

function make_insert_required_field_names_query(insert_into_required_fields_info)
{
  var insert_required_field_names_query = "INSERT IGNORE INTO required_metadata_info (dataset_id, altitude, assigned_from_geo, collection_date, depth, country, elevation, env_biome, env_feature, env_matter, latitude, longitude, temp, salinity, diss_oxygen, public) VALUES ( " + insert_into_required_fields_info[0] + " )";
  
  for (var i = 1; insert_into_required_fields_info.length > i; i += 1)
  {
    insert_required_field_names_query += ", ( " + insert_into_required_fields_info[i] + " ) ";
  }
  return insert_required_field_names_query;
}

function make_get_custom_fields_query(project_id)
{
  var get_custom_fields_query = "SELECT DISTINCT field_name, field_type \
    FROM custom_metadata_fields \
    WHERE project_id = '" + project_id + "' \
  ";
   console.log('get_custom_fields_query:');
   console.log(get_custom_fields_query);
   return get_custom_fields_query;
}

//todo: move to models
function make_create_custom_query(custom_fields, project_id)
{
  var table_name = "custom_metadata_" + project_id;
  var create_custom_query = "CREATE TABLE IF NOT EXISTS " + table_name;
      create_custom_query += "( " + table_name + "_id int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY, ";
      create_custom_query += "project_id int(11) unsigned NOT NULL, ";
      create_custom_query += "dataset_id int(11) unsigned NOT NULL";
  var unique_key_fields =  "project_id "; 
      unique_key_fields +=  ", dataset_id"; 
  for (var i = 0; custom_fields.length > i; i += 1)
  {
   create_custom_query += ", " + custom_fields[i].field_name + " " + custom_fields[i].field_type + " NOT NULL";
  }
  for (var i = 0; custom_fields.slice(0,14).length > i; i += 1)
  {
   unique_key_fields +=  ", " + custom_fields[i].field_name; 
  }
  create_custom_query += ", KEY project_id (project_id)";
  create_custom_query += ", KEY dataset_id (dataset_id)";
  create_custom_query += ", UNIQUE KEY unique_key (" + unique_key_fields + ")";
  create_custom_query += ", FOREIGN KEY (project_id) REFERENCES project (project_id) ON UPDATE CASCADE ";
  create_custom_query += ", FOREIGN KEY (dataset_id) REFERENCES dataset (dataset_id) ON UPDATE CASCADE ";
  create_custom_query += ")";
  console.log('create_custom_query:');
  console.log(create_custom_query);
  
  return create_custom_query;
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
  var insert_into_custom_fields_info_query = make_insert_custom_field_names_query(insert_into_custom_fields_info);
  console.log('insert_into_custom_fields_info_query:');
  console.log(insert_into_custom_fields_info_query);
  
  connection.query(insert_into_custom_fields_info_query, function (err, rows, fields) {
    callback(err, rows);
  });
};

csvMetadataUpload.prototype.insert_required_field_names = function(insert_into_required_fields_info, callback) 
{
  var insert_into_required_fields_info_query = make_insert_required_field_names_query(insert_into_required_fields_info);
  console.log('888 insert_into_required_fields_info_query:');
  console.log(insert_into_required_fields_info_query);
  
  connection.query(insert_into_required_fields_info_query, function (err, rows, fields) {
    callback(err, rows);
  });
};

csvMetadataUpload.prototype.select_custom_fields_names = function(project_id, callback) 
{
  get_custom_fields_names_query = make_get_custom_fields_query(project_id);
  connection.query(get_custom_fields_names_query, function (err, rows, fields) {
    callback(err, rows);
  });
};

csvMetadataUpload.prototype.make_custom_table_per_pr = function(custom_fields, project_id, callback) 
{
  create_custom_query = make_create_custom_query(custom_fields, project_id)
  connection.query(create_custom_query, function (err, rows, fields) {
    callback(err, rows);
  });
};

csvMetadataUpload.prototype.insert_into_custom_metadata_per_pr = function(insert_into_custom_metadata_info_query, callback) 
{
  connection.query(insert_into_custom_metadata_info_query, function (err, rows, fields) {
    callback(err, rows);
  });
};


