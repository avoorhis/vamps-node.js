// metadata_upload.js

/**
* Read csv into an object
* get field/column names and info into mixs_field_description
* Convert 'sample_name', 'ANONYMIZED_NAME', 'DESCRIPTION', 'TAXON_ID', 'common_name', 'TITLE' into dataset_id
* Put data into required_metadata_info
* create a custom metadata table, using dataset_id, mixs_field_description and the additional columns info
* The object should have methods:
* get required field names from db
* get custom field names from csv
* put custom field names into db
* create a custom table
* put required info in db
* put custom info in db
*/

var csvMetadataUpload = require('../models/csv_metadata_upload.js');
var csv_metadata_db = new csvMetadataUpload();

connection = require('../config/database-dev');

// ===
// call as node sbin/metadata_upload.js 

var fs = require('fs');
var parse = require('csv-parse');
var constants = require('../public/constants');

var req_fields = constants.required_metadata_fields;
var fields_to_replace = ['sample_name', 'ANONYMIZED_NAME', 'DESCRIPTION', 'TAXON_ID', 'common_name', 'TITLE'] 

// Using the first line of the CSV data to discover the column names
var input = fs.createReadStream('./data/KCK_LSM_Bv6_qii.csv');

// parser = parse({columns: true}, function(err, data){
parser = parse(function(err, data){
  do_smth_w_data(data);
})

parser_hash = parse({columns: true}, function(err, data){
  do_smth_w_data_hash(data);
})

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function do_smth_w_data(ddd)
{
  console.log("ddd");
  var column_names = ddd[0];
  console.log(column_names);
  var all_data = ddd.slice(1)
  console.log(all_data);
  console.log(req_fields);
  aa = column_names.diff(req_fields)
  console.log(aa);
  bb = req_fields.diff(column_names);
  console.log(bb);
  
}

function get_custom_columns(data_hash)
{
  var column_names = Object.keys(data_hash[0]);
  var not_req_column_names = column_names.diff(req_fields);
  var custom_column_names = not_req_column_names.diff(fields_to_replace);
  
  return custom_column_names;
}

function get_custom_columns_examples(data_hash, custom_column_names)
{
  custom_column_examples = {};
  for (var u = 0, len = custom_column_names.length; u < len; u++)
  {
    column_name = custom_column_names[u];
    console.log('column_name = ' + column_name);
    // for(row_obj in data_hash) 
    // {
    //   console.log(data_hash[row_obj][column_name]);
    // }  
    console.log(data_hash[0][column_name]);
    custom_column_examples[column_name] = data_hash[0][column_name];
  }
  console.log("custom_column_examples");
  console.log(custom_column_examples);
  return custom_column_examples;
}

function get_project_datasets(data_hash)
{
  
  var project_datasets = {},
      project = dataset = "";

  for(var row_obj in data_hash) 
  {
    project = data_hash[row_obj]['TITLE'];
    dataset = data_hash[row_obj]['sample_name'];
    
    if (project_datasets[project])
    {
      project_datasets[project].push(dataset);
    }
    else
    {
      project_datasets[project] = [];
      project_datasets[project].push(dataset);
    }    
  }  
  console.log(project_datasets);
  return project_datasets;
}

function get_db_dataset_ids(project_datasets)
{
  // { KCK_LSM_Bv6: 
  //    [ '071007st5b',
  //      'LSM.0008.031808st6',
  //      'LSM.0002.090407st6',
  //      '061307st4a',
  //      'LSM.0004.110707st6',
  // 
  for (var project in project_datasets)
  {
    if (project != "undefined")
    {
      datasets = "'" + project_datasets[project].join("', '") + "'";
    
      csv_metadata_db.get_dataset_ids(project, datasets, function(err, results) 
      {
        if (err)
          throw err; // or return an error message, or something
        else
        { 
          console.log(results)

        }
      });
    }
  }  
}

function do_smth_w_data_hash(data_hash)
{
  console.log("data_hash");
  console.log(data_hash[0]);
  custom_column_names = get_custom_columns(data_hash);
  console.log(custom_column_names);
  get_custom_columns_examples(data_hash, custom_column_names);
  project_datasets = get_project_datasets(data_hash);
  get_db_dataset_ids(project_datasets);
  
}


// input.pipe(parser);
input.pipe(parser_hash);
