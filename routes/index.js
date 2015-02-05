var express = require('express');
var router = express.Router();
var fs   = require('fs');

var ds = require('./load_all_datasets');
var rs = ds.get_datasets(function(ALL_DATASETS){
  GLOBAL.ALL_DATASETS = ALL_DATASETS;
  
  /* GET home page. */
  router.get('/', function(req, res) {
    res.render('index', { title: 'VAMPS:Home', user: req.user });
  });

  /* GET Overview page. */
  router.get('/overview', function(req, res) {
      res.render('overview', { title: 'VAMPS:Overview', user: req.user });
  });

  /* GET Search page. */
  router.get('/search', function(req, res) {
      res.render('search', { title: 'VAMPS:Search', 
      											 user: req.user 
      											});
  });

  /* GET Import Data page. */
  router.get('/import_data', function(req, res) {
      res.render('import_data', { title: 'VAMPS:Import Data', 
                             user: req.user 
                            });
  });
  /* GET Import Data page. */
  router.get('/export_data', function(req, res) {
      res.render('export_data', { title: 'VAMPS:Import Data', 
                             user: req.user 
                            });
  });
  /* GET Export Data page. */
  router.get('/file_retrieval', function(req, res) {
      
      var user = req.user || 'no-user';  
      var export_dir = 'downloads';
      var mtime = {};
      var size = {};
      fs.readdir(export_dir, function(err, files){   
        
        for(f in files){
          stat = fs.statSync(export_dir+'/'+files[f]);
          mtime[files[f]] = stat.mtime;  // modify time
          size[files[f]] = stat.size;
        }
        
        res.render('file_retrieval', { title: 'VAMPS:Export Data', 
                             user: user,
                             files:files,
                             mtime:mtime,
                             size:size
                            });
      });
  });

  router.get('/file_utils', function(req, res){

    console.log('dnld')
    console.log(req.query.filename)
    var file = 'downloads/'+req.query.filename;
    
    if(req.query.fxn == 'download' && req.query.type == 'fasta'){
      res.download(file); // Set disposition and send it.
    }else if(req.query.fxn == 'download' && req.query.type == 'metadata'){
      res.download(file); // Set disposition and send it.
    }else if(req.query.fxn == 'delete'){
      fs.unlink(file); // 
      res.redirect("/file_retrieval")
    }
  });

  /* GET Geo-Distribution page. */
  router.get('/geodistribution', function(req, res) {
      res.render('geodistribution', { title: 'VAMPS:Geo_Distribution', 
                             user: req.user 
                            });
  });

  /* GET metadata page. */
  router.get('/metadata', function(req, res) {
      res.render('metadata', { title: 'VAMPS:Metadata', 
                             user: req.user 
                            });
  });

  /* GET Portals page. */
  router.get('/portals', function(req, res) {
      res.render('portals', { title: 'VAMPS:Portals', 
                             user: req.user 
                            });
  });

});

module.exports = router;
