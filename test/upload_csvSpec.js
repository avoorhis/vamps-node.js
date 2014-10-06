var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    connection = require('../config/database-test');
var express = require('express');
var passport = require('passport');
// var helpers = require('../routes/helpers/helpers');
var mycsv = require('ya-csv');
console.log(__dirname);

var csvUpload = require('../sbin/metadata_upload');
var csv_filename = ('crazy.csv');
console.log(csv_filename);

describe('csvUpload', function(){
  it('Check csv', function(done){

    myCSV = new csvUpload(csv_filename);
    console.log("URA!5554");
    
    // loadCsv(csv_filename, function(err, results) {
    //   if (err) {
    //     // error handling
    //     // return ...
    //   }
    //   // nominal case: use results that contains peoples !
    //   console.log("URA111:");
    //   console.dir(results);
    // });
    
      });
  });
  
  // it('should save without error', function(done){
  
  // input = [ [ '1', '2', '3', '4' ], [ 'a', 'b', 'c', 'd' ] ];
  // mycsv(input, function(err, output){
  //   output.should.eql('1,2,3,4\na,b,c,d');
  // });
    // it('should save without error', function(done){
    //   var user = new User('Luna');
    //   user.save(done);
    // })
// })

          // console.log("res 111");
          // console.log(res);
          // 
          // 
          // var stringify = require('csv-stringify');
          // 
          // input = [ [ '1', '2', '3', '4' ], [ 'a', 'b', 'c', 'd' ] ];
          // stringify(input, function(err, output){
          //   output.should.eql('1,2,3,4\na,b,c,d');
          // });