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
// var csv_filename = path.join(__dirname, 'data/KCK_LSM_Bv6_qii.csv');
// var csv_filename = '../data/KCK_LSM_Bv6_qii.csv';
var csv_filename = __dirname + '/crazy.csv';
console.log(csv_filename);

describe('csvUpload', function(){
  it('Check csv', function(done){

    var myCSV = new csvUpload(csv_filename);
    console.log("FROM spec!");
    // console.log(myCSV);
    
    // myCSV(csv_filename, function(err, results) {
    //   if (err) {
    //     // error handling
    //     // return ...
    //   }
    //   // nominal case: use results that contains csv_datas !
    //   console.log("URA111:");
    //   console.dir(results);
    // });
    
    // myCSV();
  });
});

// var csvUpload1 = require('../sbin/metadata_upload');
// var csv_filename1 = 'crazy.csv';
// console.log(csv_filename1);
// 
// // var csvUpload1 = require('./sbin/metadata_upload');
// // var csv_filename1 = path.join(__dirname, 'data/KCK_LSM_Bv6_qii.csv');
// // myCSV = new csvUpload1(csv_filename);
// // console.log("URA!");
// 
// 
// describe('csvUpload', function(){
//   it('Check csv', function(done){
// 
//     var loadCsv1 = new csvUpload1(csv_filename1);
//     console.log("URA!5554");
//     
//     // function csvUpload(csv_filename) {
//     // loadCsv1(csv_filename1, function(err, results) {
//     //   if (err) {
//     //     // error handling
//     //     // return ...
//     //   }
//     //   // nominal case: use results that contains peoples !
//     //   console.log("URA 222:");
//     //   console.dir(results);
//     // });
//     
//     //   // this.myCSV = loadCsv(csv_filename);
//     //   // console.log("URA111:");
//     //   // console.log(this.myCSV);
//     //   
//     // }
//     
//     
//     // loadCsv(csv_filename, function(err, results) {
//     //   if (err) {
//     //     // error handling
//     //     // return ...
//     //   }
//     //   // nominal case: use results that contains peoples !
//     //   console.log("URA111:");
//     //   console.dir(results);
//     // });
//     
//       });
//   });
  
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