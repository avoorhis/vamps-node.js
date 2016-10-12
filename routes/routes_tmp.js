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


// EMPEROR
router.get('/:dir_name/index', function(req, res){
    console.log('6&&&& HERE in routes_tmp.js ' +req.params.dir_name)
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    var file = 'views/tmp/'+req.params.dir_name+'/index.html'
    res.sendFile(file, {root:pwd})
});
//
//
// OLIGOTYPING
router.get('/:dir_name', function(req, res){
    console.log('7&&&& HERE in routes_tmp.js ' +req.params.dir_name)
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    var file = 'tmp/xxxxx_OLIGOTYPING_1474656828888/HTML-OUTPUT/index.html'
    //var root = 'views/tmp/projects/'+req.params.dir_name+'/HTML-OUTPUT/index.html'
    res.sendFile(file, {root:pwd})
});
// router.get('/:img', function(req, res){
//     console.log('8&&&& HERE in routes_tmp.js ' +req.params.img)
//     var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
//     //var file = '/Users/avoorhis/programming/vamps-node.js/views/tmp/projects/'+req.params.dir_name+'/HTML-OUTPUT/index.html'
//     //var root = 'views/tmp/projects/'+req.params.dir_name+'/HTML-OUTPUT/index.html'
//     //es.sendFile(file)
// });
// router.get('/oligotyping/oligo/:img', function(req, res){
//     console.log('9&&&& HERE in routes_tmp.js ' +req.params.img)
//     var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
//     //var file = '/Users/avoorhis/programming/vamps-node.js/views/tmp/projects/'+req.params.dir_name+'/HTML-OUTPUT/index.html'
//     //var root = 'views/tmp/projects/'+req.params.dir_name+'/HTML-OUTPUT/index.html'
//     r//es.sendFile(file)
// });
router.get('/oligotyping/oligo/:img', function(req, res){
    console.log('9&&&& HERE in routes_tmp.js ' +req.params.img)
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    //var file = '/Users/avoorhis/programming/vamps-node.js/views/tmp/projects/'+req.params.dir_name+'/HTML-OUTPUT/index.html'
    //var root = 'views/tmp/projects/'+req.params.dir_name+'/HTML-OUTPUT/index.html'
    //es.sendFile(file)
});
module.exports = router;
