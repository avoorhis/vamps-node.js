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

// var csv = require('ya-csv');


// make filePath a parameter, and use a callback function
function loadCsv(filePath, callback) {
  
  // make people scoped to readFile()
  var people = [];
  var IN = require('ya-csv');
  var reader = IN.createCsvFileReader(filePath, {
    separator: ',', // quotes around property name are optional
    columnsFromHeader: true   
    });

  // data is emitted for each processed line
  reader.on('data', function(item) {
    // console.log('777');
    
    // closure magic: people is accessible because current function is nested into readFile()
    // console.log(item);
    people.push(item);
  });

  // end event
  reader.on('end', function() {
    // return results to caller, simply by invoking the callback.
    // by convention, first argument is an error, which is null it no problem occured
    console.log('888');
    console.log('people1:');
    console.log(people);
    return people;    
    callback(null, people);
    // return people;    
  });

  // error handling
  reader.on('error', function(err) {
    // stop listening on events, to avoid continuing queuing data
    console.log('999');
    reader.removeAllListeners();
    // report to caller the error.
    console.log('000');
    callback(err);
  });
  
  console.log('people2:');
  console.log(people);
  console.log('reader:');
  console.log(reader);
}

module.exports = loadCsv;
// Public
// module.exports = csvUpload;
// 
// function csvUpload(csv_filename) {
//   loadCsv(csv_filename, function(err, results) {
//     if (err) {
//       // error handling
//       // return ...
//     }
//     // nominal case: use results that contains peoples !
//     console.log("URA111:");
//     // console.dir(results);
//   });
//   
//   // this.myCSV = loadCsv(csv_filename);
//   // console.log("URA111:");
//   // console.log(this.myCSV);
//   
// }


// csvUpload.prototype.make_dict = function(tree_obj, key_name) 
// {
//   var i = null;
//   new_dict = {};
//   for (i = 0; tree_obj.length > i; i += 1) {
//     new_dict[tree_obj[i][key_name]] = tree_obj[i];
//   }
//   return new_dict;
// };
