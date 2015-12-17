var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');



//router.get('/tmp/:dir_name/index', function(req, res){
// router.get('/andy_1450362333240_pcoa_3d/index', function(req, res){
//     console.log('1&&&& HERE ')
// });
// router.get('/andy_1450362333240_pcoa_3d/:index', function(req, res){
//     console.log('2&&&& HERE ')
// });
// // router.get('/andy_1450362333240_pcoa_3d/index.html', function(req, res){
// //     console.log('3&&&& HERE ')
// // });
// // router.get('/andy_1450362333240_pcoa_3d/index', function(req, res){
// //     console.log('4&&&& HERE ')
// // });
// router.get('/andy_1450362333240_pcoa_3d/', function(req, res){
//     console.log('5&&&& HERE ')
// });


// for Emperor or any other pre-made html file: ie oligotyping
router.get('/:dir_name/index', function(req, res){
    console.log('6&&&& HERE ' +req.params.dir_name)
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    var file = 'views/tmp/'+req.params.dir_name+'/index.html'
    res.sendFile(file, {root:pwd})
});

module.exports = router;
