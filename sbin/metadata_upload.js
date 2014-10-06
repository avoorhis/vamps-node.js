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

var csv = require('ya-csv');

//load csv file
var loadCsv = function(csv_filename) {
  console.log(csv_filename);
    var reader = csv.createCsvFileReader(csv_filename, {
      'separator': ',',
      'quote': '"',
      'escape': '"',       
      'comment': '',
  });

  var allEntries = new Array();

  reader.setColumnNames([ 'first', 'second', 'third' ]);

  reader.addListener('data', function(data) {
    //this gets called on every row load
    allEntries.push(data);
  });

  reader.addListener('end', function(data) {
    //this gets called when it's finished loading the entire file
    console.log("URA222");
    console.log(allEntries);
    
    return allEntries;
  });
};


// Public
module.exports = csvUpload;

function csvUpload(csv_filename) {
  this.myCSV = loadCsv(csv_filename);
  console.log("URA111:");
  console.log(this.myCSV);
  
}

// csvUpload.prototype.make_dict = function(tree_obj, key_name) 
// {
//   var i = null;
//   new_dict = {};
//   for (i = 0; tree_obj.length > i; i += 1) {
//     new_dict[tree_obj[i][key_name]] = tree_obj[i];
//   }
//   return new_dict;
// };
