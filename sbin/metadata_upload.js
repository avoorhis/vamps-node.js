// metadata_upload.js

/**
* Read csv into an object
* get field/column names and info into custom_metadata_fields (mixs_field_description)
* Convert 'sample_name', 'ANONYMIZED_NAME', 'DESCRIPTION', 'TAXON_ID', 'common_name', 'title' into dataset_id
* Put data into required_metadata_info
* create a custom metadata table, using project_id, custom_metadata_fields and the additional columns info
* The object should have methods:
*   get required field names from db (for now from constants)
*   get required field info from csv
*   get custom field names etc. from csv
*   put custom field names into db
*   put required info in db
*   create a custom table for this project
*   put custom info in db
 ===
* Call as node sbin/metadata_upload.js csv_file_path
* All database specific things are in models/csv_metadata_upload.js
*/


var helpers = require('../routes/helpers/helpers');

var csvMetadataUpload = require('../models/csv_metadata_upload.js');
var csv_metadata_db = new csvMetadataUpload();

connection = require('../config/database-dev');

var fs = require('fs');
var parse = require('csv-parse');
var constants = require('../public/constants');

var req_fields = constants.REQ_METADATA_FIELDS;


var fields_to_replace = ['sample_name', 'ANONYMIZED_NAME', 'title'];


var metadata_dict_by_pr_dataset = {};


function usage()
{
  console.log("This script puts metadata in the Qiita format into the database.");
  console.log("It adds data to required_metadata_info and custom_metadata_fields");
  console.log("and creates a custom metadata table per project (like 'custom_metadata_18')");
  console.log("Please provide a path to a csv file in the command line.");
  console.log("Example: node sbin/metadata_upload.js ./data/KCK_LSM_Bv6_qii.csv");
}

function get_csv_filename()
{
  // var my_args = process.argv.slice(2);
  
  if (process.argv.length === 3)
  {
    return process.argv[2];    
  }
  else
  {
    usage();
    process.exit(0);
  }
}

var input = fs.createReadStream(get_csv_filename());
// todo: use in transform pipe, close when done
// https://github.com/wdavidw/node-csv-parse
// input.on('finish', function() {
//   console.log('ok: csv metadata');
//   // this.end();
//   
//   // return handler(null);
//   // return null;
// });

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

function make_metadata_dict_by_project(csv_data_hash)
{
  var metadata_dict_by_project = {};

  for (var i = 0; csv_data_hash.length > i; i += 1) {
    var project = csv_data_hash[i]['title'];
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
    var project = csv_data_hash[row_obj]['title'];
    var dataset = csv_data_hash[row_obj]['sample_name'];
    if (dataset !== undefined)
    {
      dataset = correct_dataset_name(dataset);
    }
    if (project !== undefined)
    {
      project_datasets = add_to_dict(project_datasets, project, dataset); 
    }
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
  for (var project in metadata_dict_by_project)
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

function work_with_ids_from_db(project_datasets, metadata_dict_by_project)
{
  // console.log("000000");
  // console.log(project_datasets);
  // console.log("111111");

  for (var project in project_datasets)
  {
    if ((project !== undefined) && (project !== "undefined"))
    {
      
      var datasets = "'" + project_datasets[project].join("', '") + "'";
      csv_metadata_db.get_dataset_ids(project, datasets, function work_with_dataset_id(err, results)
      {
        if (err)
          throw err; // or return an error message, or something
        else
        {
          // todo: add ids to dict, use for custom and requireds
          metadata_dict_by_project_w_ids = update_metadata_dict_by_project(results, metadata_dict_by_project);

          insert_into_custom_fields_txt = format_custom_metadata_fields_info(metadata_dict_by_project_w_ids[project]);
          call_insert_custom_fields_into_db(insert_into_custom_fields_txt);          
          insert_into_required_metadata_info_txt = format_required_metadata_info(metadata_dict_by_project_w_ids[project].metadata);
          call_insert_required_fields_into_db(insert_into_required_metadata_info_txt);
          make_custom_table(metadata_dict_by_project_w_ids[project]);          
        }
      });
    }
    // else
    // {
    //   console.log("8888 =====");
    //   console.log("project");
    //   console.log(project);
    //   
    // }
  }
}

function add_ids_to_metadata(db_ids, metadata_from_csv)
{
  for (var k = 0; metadata_from_csv.length > k; k += 1)
  {
    sample_name = correct_dataset_name(metadata_from_csv[k].sample_name);
    res = get_this_dataset(db_ids, sample_name);
    if (res[0] && (metadata_from_csv[k]["title"] === res[0].project))
    {
      metadata_from_csv[k].project_id = res[0].project_id;
      metadata_from_csv[k].dataset_id = res[0].dataset_id;
      metadata_from_csv[k].correct_dataset_name = sample_name;
    }
  }
  return metadata_from_csv;
}

function update_metadata_dict_by_project(db_id_results, metadata_dict_by_project)
{
  var metadata_dict_by_project_w_ids = {};
  for (var project in metadata_dict_by_project)
  {
    if (metadata_dict_by_project[project])
    {
      var metadata_arr_by_project = add_ids_to_metadata(db_id_results, metadata_dict_by_project[project]);
      var res = get_this_project(db_id_results, project);

      metadata_dict_by_project_w_ids[project] = {project_id: res[0].project_id, metadata: metadata_arr_by_project};
    }
  }
  return metadata_dict_by_project_w_ids;
}


function get_this_project(db_ids, project)
{
  return db_ids.filter(function(obj) {
      return (obj.project === project);
  });
}

function get_this_dataset(db_ids, dataset)
{
  return db_ids.filter(function(obj) {
    return (obj.dataset === dataset);
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

function format_custom_metadata_fields_info(metadata_by_project_w_ids)
{
  var insert_into_custom_fields_txt = [];
  var project = metadata_by_project_w_ids.metadata[0]["title"];
  var project_id = metadata_by_project_w_ids.project_id;
  for (var i = 0; custom_column_names.length > i; i += 1)
  {
      var field_name = custom_column_names[i].toLowerCase();
      var example = custom_column_examples[project][field_name];
      var into_db = project_id + ", '" + field_name + "', '" + example + "'";
      insert_into_custom_fields_txt.push(into_db);
  }
  // console.log("SSSSS");
  // console.log(insert_into_custom_fields_txt);

  return insert_into_custom_fields_txt;
}

function custom_fields(csv_data_hash, metadata_dict_by_project)
{
  custom_column_names = get_custom_columns_from_csv(csv_data_hash);
  // console.log("OOO custom_column_names");
  // console.log(custom_column_names);
  custom_column_examples = get_custom_column_examples_from_csv(metadata_dict_by_project, custom_column_names);
  // console.log("custom_column_examples 333");
  // console.log(custom_column_examples);
}

function get_comma(i)
{
  comma = ", ";
  if (i === 0) 
    comma = "";
  return comma;
}

// * put required info in db
function combine_required_data(this_entry)
{
  // console.log("RRR req_fields:");
  // console.log(req_fields);
  
  var into_db = "";
  var quote = "'";
  for (var i = 0; req_fields.length > i; i += 1)
  {
    var value = "";
    value = this_entry[req_fields[i]];
    if (req_fields[i] === "collection_date")
    {
      value = correct_db_data(this_entry[req_fields[i]]);
    }
    into_db += get_comma(i) + quote + value + quote;
  }  
  return into_db;
}

function format_required_metadata_info(metadata_dict_w_ids)
{
  var insert_into_required_metadata_info_txt = [];
  for (var i = 0; metadata_dict_w_ids.length > i; i += 1)
  {
    var this_entry = metadata_dict_w_ids[i];
    var dataset = this_entry.correct_dataset_name;
    var dataset_id = this_entry.dataset_id;
    if (dataset_id !== undefined)
    {
      // var into_db = combine_required_data(this_entry);
      var into_db = dataset_id + ", " + combine_required_data(this_entry);
      // var altitude = this_entry["altitude"];
      // var assigned_from_geo = this_entry["assigned_from_geo"];
      // var collection_date = "";
      // // if (this_entry["collection_date"] != "unknown")
      // // {
      //   collection_date = correct_db_data(this_entry["collection_date"]);
      // // }
      // var depth = this_entry["depth"];
      // var country = this_entry["country"];
      // var elevation = this_entry["elevation"];
      // var env_biome = this_entry["env_biome"];
      // var env_feature = this_entry["env_feature"];
      // var env_material = this_entry["env_material"];
      // var latitude = this_entry["latitude"];
      // var longitude = this_entry["longitude"];
      // var is_public = this_entry["public"];
      // 
      // var into_db = dataset_id + ", " + altitude + ", '" + assigned_from_geo + "', '" + collection_date + "', " + depth + ", '" + country + "', " + elevation + ", '" + env_biome + "', '" + env_feature + "', '" + env_material + "', " + latitude + ", " + longitude + ", " + temp + ", " + salinity + ", " + diss_oxygen + ", '" + is_public + "'";
      insert_into_required_metadata_info_txt.push(into_db);
    }
    else
    {
      console.log("ERROR: Add this dataset to db: " + this_entry.sample_name);
    }
  }
  return insert_into_required_metadata_info_txt;
}

function call_insert_required_fields_into_db(insert_into_required_metadata_info_txt)
{
  csv_metadata_db.insert_required_field_names(req_fields, insert_into_required_metadata_info_txt, function insert_db(err, results)
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

/* create a custom table for this project
 * read data from custom_metadata_fields
 * create table
 * put in data from csv
*/

function make_custom_table(project_metadata_dict_w_ids)
{
  var project_id = project_metadata_dict_w_ids.project_id;
  var metadata = project_metadata_dict_w_ids.metadata;
  var table_name = "custom_metadata_" + project_id;    
  csv_metadata_db.select_custom_fields_names(project_id, function get_custom_fields_names(err, custom_fields_names)
  {
    call_make_custom_table_per_pr(custom_fields_names, project_id, table_name);
    custom_fields_names_arr = format_custom_fields_names(custom_fields_names, metadata);
    call_insert_into_custom_metadata_info(metadata, table_name, custom_fields_names_arr);
  });
}

function call_make_custom_table_per_pr(custom_fields_names, project_id, table_name)
{
  csv_metadata_db.make_custom_table_per_pr(custom_fields_names, project_id, function create_custom_table(err, results)
  {
    if (err)
      throw err; // or return an error message, or something
    else
    {
      if (results.warningCount === 1)
      {
        console.log("Warning: Please check " + table_name + " table, it seems to exist already.");
      }
    }
  });
}

function call_insert_into_custom_metadata_info(project_metadata_dict_w_ids, table_name, custom_fields_names_arr)
{
  csv_metadata_db.insert_into_custom_metadata_per_pr(project_metadata_dict_w_ids, table_name, custom_fields_names_arr, function insert_into_custom_metadata(err, results)
  {
    if (err)
      throw err; // or return an error message, or something
    else
    {
      console.log("insert_into_custom_metadata_info: ");
      console.log(results);      
    }
  });
}


function collect_custom_fields_names_into_arr(custom_fields_names)
{
  var custom_fields_names_arr = [];
  for (var k = 0; custom_fields_names.length > k; k += 1)
  {
    field_name = custom_fields_names[k].field_name;
    custom_fields_names_arr.push(field_name);
  }
  return custom_fields_names_arr;
}

function format_custom_fields_names(custom_fields_names)
{
  var custom_fields_names_arr = collect_custom_fields_names_into_arr(custom_fields_names);
  custom_fields_names_arr.unshift("dataset_id");
  custom_fields_names_arr.unshift("project_id");
  
  return custom_fields_names_arr;
}

function to_lower_case(csv_data_hash_raw)
{
  var csv_data_hash = [];
  for (var i = 0; csv_data_hash_raw.length > i; i += 1)
  {
    var temp_hash = {};
    // console.log("===== DDDD ");
    // console.log(i);
    // console.log("csv_data_hash_raw[i]");
    // console.log(csv_data_hash_raw[i]);
    for (var key in csv_data_hash_raw[i])
    {
      temp_hash[key.toLowerCase()] = csv_data_hash_raw[i][key];
    }          
    csv_data_hash[i] = temp_hash;
  }
  return csv_data_hash;
}

function do_smth_w_data_hash(csv_data_hash_raw)
{
  // console.log("===== HHH ");
  // console.log("csv_data_hash");
  // console.log(csv_data_hash);
  var csv_data_hash = to_lower_case(csv_data_hash_raw);
  var metadata_dict_by_project = make_metadata_dict_by_project(csv_data_hash);

  var project_datasets = make_dict_by_project_datasets(csv_data_hash);

  custom_fields(csv_data_hash, metadata_dict_by_project);
  work_with_ids_from_db(project_datasets, metadata_dict_by_project);  
}

// input.pipe(parser);

// http://nicolashery.com/parse-data-files-using-nodejs-streams/
input.pipe(parser_hash);
// .pipe(process.stdout);
// input.push(null);  

// connection.destroy( );
