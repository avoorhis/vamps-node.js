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

var fs = require('fs');

function get_line(filename, line_no, callback) {
    var data = fs.readFileSync(filename, 'utf8');
    var lines = data.split("\n");

    if(+line_no > lines.length){
      throw new Error('File end reached without finding line');
    }

    return callback(null, lines[+line_no]);
}

var headers = get_line('./data/KCK_LSM_Bv6_qii.csv', 0, function(err, line){
  // console.log('The line: ' + line);
  return line;
})

console.log('The headers: ' + typeof headers);

var headers_arr = headers.split(",");
console.log('The headers_arr: ');
console.log(headers_arr);

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

// todo: move all sql to models and constants to constants
required_fields_from_template = ["sample_name", "ANONYMIZED_NAME", "DESCRIPTION", "TAXON_ID", "common_name", "TITLE", "altitude", "assigned_from_geo", "collection_date", "collection_time", "depth", "country", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "temp", "salinity", "diss_oxygen", "public"];

database_req_fields = ["dataset_id", "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "temp", "salinity", "diss_oxygen", "public"]

custom_fields = headers_arr.diff( required_fields_from_template ); 
console.log(custom_fields);
/*
[ 'habitat',
  'type_sample',
  'environmental_zone',
  'specific_conductance',
  'Dissolved_Oxygen2',
  'absolute_depth_beta',
  'lat_lon',
  'conductivity',
  'longhurst_long_name',
  'volume_filtered',
  'fecal_coliform',
  'redox_state',
  'depth_start',
  'depth_end',
  'iho_area',
  'notes',
  'precipitation',
  'volume_filtered',
  'longhurst_zone' ]
*/

// => [1, 2, 6]

// node sbin/metadata_upload.js