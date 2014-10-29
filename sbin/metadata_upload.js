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

var metadata_dict_by_pr_dataset = {};

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
  return dict;
}

function make_metadata_dict_by_pr_dataset(csv_data_hash)
{
  metadata_dict_by_pr_dataset = {};

  for (var i = 0; csv_data_hash.length > i; i += 1) {
    var dataset = csv_data_hash[i]['sample_name'];
    var project = csv_data_hash[i]['TITLE'];
    metadata_dict_by_pr_dataset[project + "--" + dataset] = csv_data_hash[i];
  }
  return metadata_dict_by_pr_dataset;
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

function correct_dataset_name(dataset)
{
   return dataset.replace(/\./g,"_");
}

function make_dict_by_project_datasets(csv_data_hash)
{

  var project_datasets = {};

  for(var row_obj in csv_data_hash)
  {
    var project = csv_data_hash[row_obj]['TITLE'];
    var dataset = csv_data_hash[row_obj]['sample_name'];
    if (dataset)
    {
      dataset = correct_dataset_name(dataset);
    }
    project_datasets = add_to_dict(project_datasets, project, dataset);
  }
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
          // todo: add ids to dict, use for custom and requireds
          insert_into_custom_fields_txt = format_custom_metadata_fields_info(results);
          call_insert_custom_fields_into_db(insert_into_custom_fields_txt);
          insert_into_required_metadata_info_txt = format_required_metadata_info(results);
          call_insert_required_fields_into_db(insert_into_required_metadata_info_txt);          
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

function get_this_dataset_id(db_ids, dataset)
{
  return db_ids.filter(function(obj) {
    return (obj.dataset === dataset);
    
    // if(obj.dataset === dataset)
    //{
    //  return obj.dataset_id;      
    //}
  });
}


function call_insert_custom_fields_into_db(insert_into_custom_fields_txt)
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
    // separate, use above for required too
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

function custom_fields(csv_data_hash)
{
  custom_column_names = get_custom_columns_from_csv(csv_data_hash);
  // console.log("custom_column_names");
  // console.log(custom_column_names);
  custom_column_examples = get_custom_column_examples_from_csv(metadata_dict_by_project, custom_column_names);
  // console.log("custom_column_examples 333");
  // console.log(custom_column_examples);
  
}


// * put required info in db
/*
dataset_id, altitude, assigned_from_geo, collection_date, depth, country, elevation, env_biome, env_feature, env_matter, latitude, longitude, temp, salinity, diss_oxygen, public
*/

function format_required_metadata_info(db_ids)
{
  var insert_into_required_metadata_info_txt = [];
  for (var project in metadata_dict_by_project)
  {
    console.log("db_ids");
    console.log(db_ids);
    
    for (var i = 0; metadata_dict_by_project[project].length > i; i += 1)
    {
      console.log("111 =====");
      
      var dataset = correct_dataset_name(metadata_dict_by_project[project][i]["sample_name"]);      
      var this_dataset = get_this_dataset_id(db_ids, dataset);
      var dataset_id = "";
      if (this_dataset[0])
      {
        var dataset_id = this_dataset[0].dataset_id;
        var altitude = metadata_dict_by_project[project][i]["altitude"];
        var assigned_from_geo = metadata_dict_by_project[project][i]["assigned_from_geo"];
        var collection_date = correct_db_data(metadata_dict_by_project[project][i]["collection_date"]);
        var depth = metadata_dict_by_project[project][i]["depth"];
        var country = metadata_dict_by_project[project][i]["country"];
        var elevation = metadata_dict_by_project[project][i]["elevation"];
        var env_biome = metadata_dict_by_project[project][i]["env_biome"];
        var env_feature = metadata_dict_by_project[project][i]["env_feature"];
        var env_matter = metadata_dict_by_project[project][i]["env_matter"];
        var latitude = metadata_dict_by_project[project][i]["latitude"];
        var longitude = metadata_dict_by_project[project][i]["longitude"];
        var temp = metadata_dict_by_project[project][i]["temp"];
        var salinity = metadata_dict_by_project[project][i]["salinity"];
        var diss_oxygen = metadata_dict_by_project[project][i]["diss_oxygen"];
        var is_public = metadata_dict_by_project[project][i]["public"];      
        
        var into_db = dataset_id + ", " + altitude + ", '" + assigned_from_geo + "', '" + collection_date + "', " + depth + ", '" + country + "', " + elevation + ", '" + env_biome + "', '" + env_feature + "', '" + env_matter + "', " + latitude + ", " + longitude + ", " + temp + ", " + salinity + ", " + diss_oxygen + ", '" + is_public + "'";
        insert_into_required_metadata_info_txt.push(into_db);
        
      }
      else
      {
        console.log("Add this dataset to db: " + dataset);
      }
    }
  }
  console.log("7777 insert_into_required_metadata_info_txt");
  console.log(insert_into_required_metadata_info_txt);
  
  return insert_into_required_metadata_info_txt;
}

function call_insert_required_fields_into_db(insert_into_required_metadata_info_txt)
{
  csv_metadata_db.insert_required_field_names(insert_into_required_metadata_info_txt, function insert_db(err, results)
  {
    if (err)
      throw err; // or return an error message, or something
    else
    {
      console.log("insert_required_field_names results");    
      console.log(results);    
    }
  });
}

function correct_db_data(collection_date)
{
  var d = new Date(Date.parse(collection_date));
  return d.toISOString().replace(/T.+/, '');
}

function do_smth_w_data_hash(csv_data_hash)
{
  // console.log("=====");
  // console.log("csv_data_hash[0]");
  // console.log(csv_data_hash[0]);
  metadata_dict_by_project = make_metadata_dict_by_project(csv_data_hash);
  metadata_dict_by_pr_dataset = make_metadata_dict_by_pr_dataset(csv_data_hash);
  // console.log("=====");
  // console.log("metadata_dict_by_pr_dataset");
  // console.log(metadata_dict_by_pr_dataset);
  
  project_datasets = make_dict_by_project_datasets(csv_data_hash);
  
  custom_fields(csv_data_hash);
  work_with_ids_from_db();
  
}


// input.pipe(parser);
input.pipe(parser_hash);

// connection.destroy( );
