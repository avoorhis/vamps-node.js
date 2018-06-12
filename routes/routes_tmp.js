var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');



// router.get('/:file', function(req, res){
//     var file = req.params.file
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
    var pwd = req.CONFIG.PROCESS_DIR;
    var file = 'views/tmp/'+req.params.dir_name+'/index.html'
    res.sendFile(file, {root:pwd})
});

router.get('/oligotyping/oligo/:img', function(req, res){
    console.log('9&&&& HERE in routes_tmp.js ' +req.params.img)
    var pwd = req.CONFIG.PROCESS_DIR;
    //var file = '/Users/avoorhis/programming/vamps-node.js/views/tmp/projects/'+req.params.dir_name+'/HTML-OUTPUT/index.html'
    //var root = 'views/tmp/projects/'+req.params.dir_name+'/HTML-OUTPUT/index.html'
    //es.sendFile(file)
});
module.exports = router;
