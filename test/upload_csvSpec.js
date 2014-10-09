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
var csv_filename = __dirname + '/../data/KCK_LSM_Bv6_qii.csv';
// var csv_filename = __dirname + '/crazy.csv';
console.log('csv_filename');
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

