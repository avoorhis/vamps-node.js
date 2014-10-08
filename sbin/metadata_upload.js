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
var fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');

var output = [];
var parser = parse({delimiter: ','})
var input = fs.createReadStream('./data/KCK_LSM_Bv6_qii.csv');
var transformer = transform(function(record, callback){
  setTimeout(function(){
    callback(null, record.join(' ')+'\n');
  }, 500);
}, {parallel: 10});
input.pipe(parser).pipe(transformer).pipe(process.stdout);

// var csv = require('ya-csv');
// 
// 
// // make filePath a parameter, and use a callback function
// function loadCsv(filePath, callback) {
//   
//   // make csv_data scoped to readFile()
//   var csv_data = [];
//   var IN = require('ya-csv');
//   var reader = IN.createCsvFileReader(filePath, {
//     separator: ',', // quotes around property name are optional
//     columnsFromHeader: true   
//     });
// 
//   // data is emitted for each processed line
//   reader.on('data', function(item) {
//     // console.log('777');
//     
//     // closure magic: csv_data is accessible because current function is nested into readFile()
//     get_headers(JSON.stringify(item));
//     csv_data.push(item);
//   });
// 
//   // end event
//   reader.on('end', function() {
//     // return results to caller, simply by invoking the callback.
//     // by convention, first argument is an error, which is null it no problem occured
//     // console.log('888');
//     // console.log('csv_data1:');
//     // console.log(csv_data);
//     // return csv_data;    
//     callback(null, csv_data);
//     // return csv_data;    
//   });
// 
//   // error handling
//   reader.on('error', function(err) {
//     // stop listening on events, to avoid continuing queuing data
//     // console.log('999');
//     reader.removeAllListeners();
//     // report to caller the error.
//     // console.log('000');
//     callback(err);
//   });
//   
//   // console.log('csv_data2:');
//   // console.log(csv_data);
//   // console.log('reader:');
//   // console.log(reader);
// }
// 
// function do_smth_w_csv_content(err, results) {
//   if (err) {
//     // error handling
//     // return ...
//   }
//   // nominal case: use results that contains csv_data !
//   headers = results[0];
//   headers1 = JSON.stringify(headers);
//   console.log("URA 111:");
//   console.log(util.inspect(headers, false, null)); 
//   console.log("URA 12:");
//   console.log(util.inspect(headers1, false, null)); 
//   // console.log(results);
//   console.log('headers1');
//   console.log(typeof headers1);
//   // console.log(headers1.keys());
// }
// 
// var get_headers = function(item)
// {
//   // console.log('get_headers item:');
//   // if (!item.hasOwnProperty('sample_name')) {
//   //     console.log('sample_name property is missing');
//   //     
//   // }
//   // else
//   // {
//     var pr = item;
//     // var pr = item.keys();
//     console.log('get_headers');
//     console.log(pr);
//     
//   // }
//   
// }
// 
// // module.exports = loadCsv;
// // Public
// module.exports = csvUpload;
// var util = require("util");
// function csvUpload(csv_filename) {
// 
//   loadCsv(csv_filename, do_smth_w_csv_content);
//   
//   
// }
// 
// 
// // csvUpload.prototype.make_dict = function(tree_obj, key_name) 
// // {
// //   var i = null;
// //   new_dict = {};
// //   for (i = 0; tree_obj.length > i; i += 1) {
// //     new_dict[tree_obj[i][key_name]] = tree_obj[i];
// //   }
// //   return new_dict;
// // };
