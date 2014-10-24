// metadata_upload.js

/**
* Read csv into an object
* get field/column names and info into custom_metadata_fields (mixs_field_description)
* Convert 'sample_name', 'ANONYMIZED_NAME', 'DESCRIPTION', 'TAXON_ID', 'common_name', 'TITLE' into dataset_id
* Put data into required_metadata_info
* create a custom metadata table, using project_id, custom_metadata_fields and the additional columns info
* The object should have methods:
*   get required field names from db (for now from constants)
* get required field info from csv
*   get custom field names etc. from csv
*   put custom field names into db
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
var fields_to_replace = ['sample_name', 'ANONYMIZED_NAME', 'DESCRIPTION', 'TAXON_ID', 'common_name', 'TITLE'];

var metadata_dict_by_dataset = {};

var input = fs.createReadStream('./data/KCK_LSM_Bv6_qii.csv');

parser_hash = parse({columns: true}, function(err, data){
  do_smth_w_data_hash(data);
});

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

// todo: move to helper, use also in custom_taxa_class.js
function add_to_dict(dict, key, value)
{
  if (!(dict[key]))
  {
    dict[key] = [];
  }
  dict[key].push(value);    
  return dict
}

function make_metadata_dict_by_pr_dataset(csv_data_hash)
{
  metadata_dict_by_dataset = {};

  for (var i = 0; csv_data_hash.length > i; i += 1) {
    var dataset = csv_data_hash[i]['sample_name'];
    var project = csv_data_hash[i]['TITLE'];
    metadata_dict_by_dataset[project + "--" + dataset] = csv_data_hash[i];
  }
  return metadata_dict_by_dataset;
}

function make_metadata_dict_by_project(csv_data_hash)
{
  metadata_dict_by_project = {};

  for (var i = 0; csv_data_hash.length > i; i += 1) {
    var project = csv_data_hash[i]['TITLE'];
    metadata_dict_by_project = add_to_dict(metadata_dict_by_project, project, csv_data_hash[i]);
  }
  return metadata_dict_by_project;
}

function make_dict_by_project_datasets(csv_data_hash)
{

  var project_datasets = {};

  for(var row_obj in csv_data_hash)
  {
    var project = csv_data_hash[row_obj]['TITLE'];
    var dataset = csv_data_hash[row_obj]['sample_name'];
    project_datasets = add_to_dict(project_datasets, project, dataset);
  }
  // console.log(project_datasets);
  return project_datasets;
}

// * get custom field names etc. from csv

function get_custom_columns_from_csv(csv_data_hash)
{
  var column_names = Object.keys(csv_data_hash[0]);
  var not_req_column_names = column_names.diff(req_fields);
  var custom_column_names = not_req_column_names.diff(fields_to_replace);

  return custom_column_names;
}

function get_custom_column_examples_from_csv(metadata_dict_by_project, custom_column_names)
{
  var custom_column_examples = {};
  for(var project in metadata_dict_by_project)
  {
    // console.log("555");
    // console.log(metadata_dict_by_project[project]);
    custom_column_examples[project] = [];
    for (var u = 0, len = custom_column_names.length; u < len; u++)
    {
      column_name = custom_column_names[u];
      custom_column_examples[project][column_name] = metadata_dict_by_project[project][0][column_name];
    }
  }
  return custom_column_examples;
}

function work_with_ids_from_db()
{
  // console.log("000000");
  // console.log(project_datasets);
  // console.log("111111");

  for (var project in project_datasets)
  {
    if (project != "undefined")
    {
      var datasets = "'" + project_datasets[project].join("', '") + "'";

      csv_metadata_db.get_dataset_ids(project, datasets, function work_with_dataset_id(err, results)
      {
        if (err)
          throw err; // or return an error message, or something
        else
        {
          insert_into_custom_fields_txt = format_custom_metadata_fields_info(results);
          call_insert_into_db(insert_into_custom_fields_txt);
        }
      });
    }
  }
}

function get_this_project(db_ids, project)
{
  return db_ids.filter(function(obj) {
      return (obj.project === project);
  });
}

function call_insert_into_db(insert_into_custom_fields_txt)
{
  csv_metadata_db.insert_custom_field_names(insert_into_custom_fields_txt, function insert_db(err, results)
  {
    if (err)
      throw err; // or return an error message, or something
    else
    {
      console.log("insert_custom_field_names results");    
      console.log(results);    
    }
  });
}

function format_custom_metadata_fields_info(db_ids)
{
  var insert_into_custom_fields_txt = [];
  for (var project in metadata_dict_by_project)
  {
    var filteredprojects = get_this_project(db_ids, project);
    project_id = filteredprojects[0].project_id;
    for (var i = 0; custom_column_names.length > i; i += 1)
    {
        field_name = custom_column_names[i];
        example = custom_column_examples[project][field_name];
        into_db = project_id + ", '" + field_name + "', '" + example + "'";
        insert_into_custom_fields_txt.push(into_db);
    }
  }
  return insert_into_custom_fields_txt;
}

// function format_custom_metadata_fields_info(dataset_ids)
// {
//   // console.log("dataset_ids");
//   // console.log(dataset_ids);
//   // console.log("custom_column_examples 11");
//   // console.log(custom_column_examples);
//   // console.log("metadata_dict_by_dataset");
//   // console.log(metadata_dict_by_dataset);
//   var insert_into_custom_fields_txt = [];
//   // console.log("9999");
//   for (var i = 0; dataset_ids.length > i; i += 1)
//   {
//     // console.log(dataset_ids[i]);
//     // console.log(dataset_ids[i]['dataset']);
//     project_dataset = dataset_ids[i]['project'] + "--" + dataset_ids[i]['dataset'];
//     // console.log(metadata_dict_by_dataset[project_dataset]);
//     dataset_id = dataset_ids[i]['dataset_id'];
//     // console.log("77777");
//     console.log(dataset_id);
//     // console.log(dataset_id, field_name, example);
//     // console.log(dataset_id, field_name, example);
//   }
// }


function do_smth_w_data_hash(csv_data_hash)
{
  // console.log("csv_data_hash[0]");
  // console.log(csv_data_hash[0]);
  metadata_dict_by_project = make_metadata_dict_by_project(csv_data_hash);
  // console.log("metadata_dict_by_project");
  // console.log(metadata_dict_by_project);
  custom_column_names = get_custom_columns_from_csv(csv_data_hash);
  // console.log("custom_column_names");
  // console.log(custom_column_names);
  custom_column_examples = get_custom_column_examples_from_csv(metadata_dict_by_project, custom_column_names);
  // console.log("custom_column_examples 333");
  // console.log(custom_column_examples);
  metadata_dict_by_dataset = make_metadata_dict_by_pr_dataset(csv_data_hash);
  // console.log("metadata_dict_by_dataset");
  // console.log(metadata_dict_by_dataset);
  // console.log("=====");

  project_datasets = make_dict_by_project_datasets(csv_data_hash);
  work_with_ids_from_db();
}


// input.pipe(parser);
input.pipe(parser_hash);

// connection.destroy( );
