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
var loadCsv = function() {
    var reader = csv.createCsvFileReader('data/KCK_LSM_Bv6_qii.csv', {
      'separator': ',',
      'quote': '"',
      'escape': '"',       
      'comment': '',
  });

  var allEntries = new Array();

  reader.setColumnNames([ 'firstName', 'lastName', 'username' ]);

  reader.addListener('data', function(data) {
    //this gets called on every row load
    allEntries.push(data);
  });

  reader.addListener('end', function(data) {
    //this gets called when it's finished loading the entire file
    return allEntries;
  });
};

var myUsers = loadCsv();