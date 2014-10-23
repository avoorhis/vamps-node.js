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

var metadata_dict_by_dataset = {};

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

function get_custom_columns(data_hash)
{
  var column_names = Object.keys(data_hash[0]);
  var not_req_column_names = column_names.diff(req_fields);
  var custom_column_names = not_req_column_names.diff(fields_to_replace);

  return custom_column_names;
}

function get_custom_column_examples(metadata_dict_by_project, custom_column_names)
{
  var custom_column_examples = {};
  for( project in metadata_dict_by_project)
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
  // console.log(project_datasets);
  return project_datasets;
}



function get_db_ids()
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
          // console.log(data_hash);

          // format_custom_metadata_fields_info(results, custom_column_examples, metadata_dict_by_dataset);
          format_custom_metadata_fields_info(results);
          /*
          custom_column_examples:
          { habitat: 'salt marsh',
            collection_time: '10:10:00',
            type_sample: 'saltmarsh',
            environmental_zone: 'temperate',
            specific_conductance: '45.4',
            Dissolved_Oxygen2: '63.3',
            absolute_depth_beta: '26
          */
        }
      });

    }
  }
}

// function format_custom_metadata_fields_info(dataset_ids, custom_column_examples, metadata_dict_by_dataset)
function format_custom_metadata_fields_info(db_ids)
{
  var insert_into_custom_fields = [];
  console.log("9999");
  // console.log("custom_column_examples");
  // console.log(custom_column_examples);
  for (project in metadata_dict_by_project)
  {
    // console.log(project);
    // console.log(metadata_dict_by_project[project][0]);
    var filteredprojects = db_ids.filter(function(obj) {
        return (obj.project === project);
    });
    project_id = filteredprojects[0]['project_id'];
    console.log("custom_column_examples[project]");
    console.log(custom_column_examples[project]);
    // Object.keys(custom_column_examples[project]).forEach(
    //   console.log("key");
    //   console.log(key);
    //   )
    for (var i = 0; custom_column_names.length > i; i += 1)
    {
        field_name = custom_column_names[i];
        console.log("field_name = " + field_name);
        example = custom_column_examples[project][field_name];
        console.log("example = " + example);
        into_db = project_id + ", '" + field_name + "', '" + example + "'"
        insert_into_custom_fields.push(into_db)
    }
  }
  console.log("insert_into_custom_fields");
  console.log(insert_into_custom_fields);
  
  csv_metadata_db.insert_custom_field_names(insert_into_custom_fields, function insert_db(err, results)
  {
    if (err)
      throw err; // or return an error message, or something
    else
    {
      console.log("results");    
      console.log(results);    
    }
  });
  // for (var i = 0; project_ids.length > i; i += 1)
  // {
  //   // console.log(project_ids[i]);
  //   // console.log(project_ids[i]['project']);
  //   project_project = project_ids[i]['project'] + "--" + project_ids[i]['project'];
  //   // console.log(metadata_dict_by_project[project_project]);
  //   project_id = project_ids[i]['project_id'];
  //   // console.log("77777");
  //   // console.log(project_id, field_name, example);
  //   console.log(project_id, field_name, example);
  // }
}

// function format_custom_metadata_fields_info(dataset_ids)
// {
//   // console.log("dataset_ids");
//   // console.log(dataset_ids);
//   // console.log("custom_column_examples 11");
//   // console.log(custom_column_examples);
//   // console.log("metadata_dict_by_dataset");
//   // console.log(metadata_dict_by_dataset);
//   var insert_into_custom_fields = [];
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
function make_metadata_dict_by_pr_dataset(data_hash)
{
  metadata_dict_by_dataset = {};

  for (var i = 0; data_hash.length > i; i += 1) {
    dataset = data_hash[i]['sample_name'];
    project = data_hash[i]['TITLE'];
    metadata_dict_by_dataset[project + "--" + dataset] = data_hash[i];
  }
  return metadata_dict_by_dataset;
}

function make_metadata_dict_by_project(data_hash)
{
  metadata_dict_by_project = {};

  for (var i = 0; data_hash.length > i; i += 1) {
    project = data_hash[i]['TITLE'];
    if (metadata_dict_by_project[project])
    {
      metadata_dict_by_project[project].push(data_hash[i]);
    }
    else
    {
      metadata_dict_by_project[project] = [];
      metadata_dict_by_project[project].push(data_hash[i]);
    }
  }
  return metadata_dict_by_project;
}

function do_smth_w_data_hash(data_hash)
{
  // console.log("data_hash[0]");
  // console.log(data_hash[0]);
  metadata_dict_by_project = make_metadata_dict_by_project(data_hash);
  custom_column_names = get_custom_columns(data_hash);
  // console.log(custom_column_names);
  custom_column_examples = get_custom_column_examples(metadata_dict_by_project, custom_column_names);
  // console.log("custom_column_examples 333");
  // console.log(custom_column_examples);
  metadata_dict_by_dataset = make_metadata_dict_by_pr_dataset(data_hash);
  // console.log(metadata_dict_by_dataset);
  // console.log("=====");

  project_datasets = get_project_datasets(data_hash);
  get_db_ids();
}


// input.pipe(parser);
input.pipe(parser_hash);

// connection.destroy( );
