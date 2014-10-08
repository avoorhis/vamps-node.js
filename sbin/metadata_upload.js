// metadata_upload.js
// 
// /**
// * Read csv into an object
// * get field/column names and info into mixs_field_description
// * Put data into required_metadata_info
// * create a custom metadata table, using dataset_id, mixs_field_description and the additional columns info
// * The object should have methods:
// * get required field names from db
// * get custom field names from csv
// * put custom field names into db
// * create a custom table
// * put required info in db
// * put custom info in db
// */

// var util = require('util')
//   , Transform = require('stream').Transform
//   , _ = require('lodash');
// 
// var COLUMNS_LINE = 'Index,Timestamp,Event Type,Player Id,Event Data';
// var COLUMNS = COLUMNS_LINE.split(',');
// 
// function Parser(options) {
//   options = options || {};
//   // Parser expects objects coming in, and will emit objects going out
//   options.objectMode = true;
// 
//   Transform.call(this, options);
// 
//   this._rawHeader = [];
//   this.header = null;
// }
// 
// // Parser is a `Transform` stream (readable and writable)
// // Pipe data through it and get parsed data out of it
// util.inherits(Parser, Transform);
// 
// Parser.prototype._transform = function(data, encoding, done) {
//   if (!this.header) {
//     this._rawHeader.push(data);
//     if (this._isHeaderEnd(data)) {
//       this.header = this._parseRawHeader(this._rawHeader);
//       // Let the world know we are done parsing the header
//       this.emit('header', this.header);
//       this.push({header: this.header});
//     }
//   }
//   // After parsing the header, push data rows
//   else {
//     this.push(this._parseRow(data));
//   }
//   done();
// };
// 
// // Test if a line is the last header item
// Parser.prototype._isHeaderEnd = function(data) {
//   return data.join(',') === COLUMNS_LINE;
// };
// 
// // Make header lines one pretty object
// Parser.prototype._parseRawHeader = function(rawHeader) {
//   var header = {}
//     , self = this;
//   _.forEach(rawHeader, function(row) {
//     var parsedHeaderRow = self._parseHeaderRow(row);
//     // Players are added to an array
//     if (parsedHeaderRow['Player']) {
//       if (!header['Players']) header['Players'] = [];
//       header['Players'].push(parsedHeaderRow['Player']);
//     }
//     // The rest is just added to the header object
//     else {
//       _.extend(header, parsedHeaderRow);
//     }
//   });
//   return header;
// };
// 
// Parser.prototype._parseHeaderRow = function(row) {
//   var result = {}
//     , key = row[0];
//   if (key.match(/^Game Export/)) {
//     result['Title'] = key;
//   }
//   else if (key === 'Player' || key === 'Map') {
//     result[key] = {
//       'id': row[1],
//       'name': row[2]
//     };
//   }
//   else if (key === 'Time Range') {
//     result[key] = {
//       'start': row[1],
//       'end': row[2]
//     };
//   }
//   // Indicates column names line
//   else if (key === 'Index') {
//     result['Columns'] = row;
//   }
//   // Default behavior
//   else {
//     result[key] = row[1];
//   }
//   return result;
// };
// 
// // Parse a data row into an object
// Parser.prototype._parseRow = function(row) {
//   var result = _.zipObject(COLUMNS, row);
//   // "Expand" event data column
//   var eventData = result['Event Data'];
//   result['Event Data'] = {};
//   eventData = eventData.split(', ');
//   _.forEach(eventData, function(item) {
//     item = item.split('=');
//     result['Event Data'][item[0]] = item[1];
//   });
//   return result;
// };
// 
// module.exports = function(options) {
//   return new Parser(options);
// };
var Transform = require('stream').Transform
  , csv = require('csv-streamify')
  , JSONStream = require('JSONStream');

var csvToJson = csv({objectMode: true});

var parser = new Transform({objectMode: true});
// parser._transform = function(data, encoding, done) {
//   this.push(data);
//   done();
// };

parser.header = null;
parser._rawHeader = [];
parser._transform = function(data, encoding, done) {
  if (!this.header) {
    this._rawHeader.push(data);
    if (data[0] === 'sample_name') {
      // We reached the last line of the header
      this.header = this._rawHeader;
      this.push({header: this.header});
    }
  }
  // After parsing the header, push data rows
  else {
    this.push({row: data});
  }
  done();
};


var jsonToStrings = JSONStream.stringify(false);

process.stdin
.pipe(csvToJson)
.pipe(parser)
.pipe(jsonToStrings)
.pipe(process.stdout);


// ====
// // var csv = require('ya-csv');
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
