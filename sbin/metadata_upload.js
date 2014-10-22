// metadata_upload.js

/**
* Read csv into an object
* get field/column names and info into mixs_field_description
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

// var csv = require('csv');

// ===
// call as node sbin/metadata_upload.js 

var fs = require('fs');
var parse = require('csv-parse');


// Using the first line of the CSV data to discover the column names
var input = fs.createReadStream('./data/KCK_LSM_Bv6_qii.csv');

// parser = parse({columns: true}, function(err, data){
parser = parse(function(err, data){
  do_smth_w_data(data);
})

function do_smth_w_data(ddd)
{
  console.log("ddd");
  var column_names = ddd[0];
  console.log(column_names);
  var m_l = ddd.length;
  var all_data = ddd.slice(1)
  console.log(all_data);
  console.log(m_l);
}

input.pipe(parser);
