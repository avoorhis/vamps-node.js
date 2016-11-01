// try{
//     require('newrelic');
//     console.log('Starting newrelic module: logging to ./newrelic_agent.log')
// }
// catch (e) {
//   console.log(e);
// }

// anna's
// try{
//   require('nodetime').profile({
//     accountKey: '13bf15a356e62b822df4395f183fe0a83af757f4', 
//     appName: 'Node.js VAMPS Application'
//   });
// }
// catch(err){
//   console.log(err.toString())
// }


// //var H5Type = require('hdf5/lib/globals').H5Type;
// //console.log(H5Type)

// var group = file.createGroup('VAMPS-ds');
// var buffer=new Buffer(8*10*8, "binary");
// buffer.rank=2;
// buffer.rows=8;
// buffer.columns=10;
// buffer.type = h5g.H5Type.H5T_NATIVE_DOUBLE;
// //console.log(buffer.type)
// for (j = 0; j < buffer.columns; j++) {
//   for (i = 0; i < buffer.rows; i++){
//     if (j< (buffer.columns/2)) {
//       buffer.writeDoubleLE(1.0, 8*(i*buffer.columns+j));
//     }
//     else {
//       buffer.writeDoubleLE(2.0, 8*(i*buffer.columns+j));
//     }
//   }
// }

// h5lt.makeDataset(group.id, 'Waldo', buffer);
// group.close()
// file.close();
// module.exports.Access = {
//   ACC_RDONLY : 0, /*absence of rdwr => rd-only */
//   ACC_RDWR   : 1, /*open for read and write    */
//   ACC_TRUNC  : 2, overwrite existing files   
//   ACC_EXCL   : 4, /*fail if file already exists*/
//   ACC_DEBUG  : 8, /*print debug info      */
//   ACC_CREAT  : 10 /*create non-existing files  */
// };

var compression = require('compression');
var express = require('express');
//var expose = require('express-expose');
var router = express.Router();
var session = require('express-session');
var path = require('path');
global.app_root = path.resolve(__dirname);
//var hdf5 = require('hdf5');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var passport = require('passport');
var favicon = require('serve-favicon');
var fs = require('fs-extra');
var zlib = require('zlib');

//var db = require('mysql2');
// without var declaration connection is global
// needed for DATASETS initialization

connection = require('./config/database').pool;



var routes    = require('./routes/index');  // This grabs ALL_DATASETS from routes/load_all_datasets.js
var users     = require('./routes/routes_users');
var tmp       = require('./routes/routes_tmp');
var user_data = require('./routes/routes_user_data');
var search    = require('./routes/routes_search');
var projects  = require('./routes/routes_projects');
var datasets  = require('./routes/routes_datasets');
var help      = require('./routes/routes_help');
var resources = require('./routes/routes_resources');
var admin     = require('./routes/routes_admin');
var oligotyping = require('./routes/routes_oligotyping');
var otus        = require('./routes/routes_otus');

var portals   = require('./routes/routes_portals');
var metadata   = require('./routes/routes_metadata');
//console.log('test')
var visuals = require('./routes/visuals/routes_visualization');
//console.log('test2')
var consts = require('./public/constants');
var config = require('./config/config');
var app = express();
app.set('appName', 'VAMPS');
require('./config/passport')(passport, connection); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.set(express.static(__dirname + 'tmp'));
// MIDDLEWARE  <-- must be in correct order:
app.use(favicon( path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser({limit: 1024000000 })); // 1024MB
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


//upload.single('singleInputFileName')
//app.use(upload.single('singleInputFileName'));  // for multipart uploads: files

app.use(cookieParser());

app.use(compression());
/**
 * maxAge used to cache the content, # msec
 * to "uncache" some pages: http://stackoverflow.com/questions/17407770/express-setting-different-maxage-for-certain-files
 */
app.use(express.static( 'public', {maxAge: '24h' }));
app.use(express.static('tmp'));
// 2016-09-19 added Not sure if security risk:  AAV
//app.use(express.static('user_data'));  // 2016-09-19 added to allow users to view png in oligotyping run -also html

// app.use(express.static(__dirname + '/public', {maxAge: 900000 }));
// app.use(express.static(path.join(__dirname, '/public')));

app.use('public/javascripts', express.static(path.join(__dirname, 'public', 'javascripts')));
app.use('public/stylesheets', express.static(path.join(__dirname, 'public', 'stylesheets')));
app.use('/static', express.static(config.PATH_TO_STATIC_DOWNLOADS));   // path for static downloadable files
// app.use('views/add_ins', express.static(path.join(__dirname, '/views/add_ins')));
// required for passport
// app.use(session({ secret: 'keyboard cat',  cookie: {maxAge: 900000}})); // session secret
app.use(session({ 
	secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
})); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.use(function(req, res, next){
	if (connection == null) {
	   this.send('We cannot reach the database right now, please try again later.');
	   return;
	 }else{
	    req.db = connection;
	    req.CONSTS = consts;
        req.CONFIG = config;
	    return next();
	}
});
//var hdf5 = require('hdf5').hdf5;
// example of roll-your-own middleware:
// GET: localhost:3000/?id=324
// app.use(function (req, res,next) {
//     console.log('START ');
//     if (req.query.id){
//         console.log('got id '+req.query.id);
//         next();
//     }else if (req.query.name){
//         console.log('got name '+req.query.name);
//         next();
//     }else{
//         next();
//     }
// });

// ROUTES:
app.use('/', routes);
app.use('/help', help);
app.use('/resources', resources);
app.use('/tmp', tmp);
app.use('/admin', admin);
app.use('/users', users);
app.use('/projects', projects);
app.use('/datasets', datasets);
app.use('/visuals', visuals);
app.use('/search', search);
app.use('/user_data', user_data);
app.use('/portals', portals);
app.use('/metadata', metadata);
app.use('/oligotyping', oligotyping);
app.use('/otus', otus);

// for non-routing pages such as heatmap, counts and bar_charts
app.get('/*', function(req, res, next){
    console.warn(req.params);
    console.warn(req.uri);
    var url = req.params[0];
    // I want to create a page like: counts_table_2014080_13452.html
    // for each link
    if (url === 'visuals/user_viz_data/ctable.html') { // 
        // Yay this is the File A... 
        console.warn("The user file  has been requested");
        router.get('/visuals/user_viz_data/ctable.html',  function(req, res) {
            console.warn('trying to open ctable.html');
        });
    } else {
        // we don't care about any other file, let it download too        
        console.warn("No Route Found");
        next();
    }
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers <-- these middleware go after routes
app.set('env', process.env.NODE_ENV);
// development error handler
// will print stacktrace
console.log('DATABASE: '+NODE_DATABASE);
console.log('Database set in config/db-connection.js');
console.log('ENV:',app.get('env'));
console.log('Environment set in bin/www');
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error.ejs', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.ejs', {
        message: err.message,
        error: {}
    });
});

var os = require("os");
console.log('HOSTNAME: '+os.hostname())

fs.ensureDir(config.USER_FILES_BASE, function (err) {
    if(err) {console.log(err);} // => null
    else{
        if(config.site != 'vamps' && config.site != 'vampsdev'){
            fs.chmod(config.USER_FILES_BASE, 0775, function (err) {
                if(err) {console.log(err);} // ug+rwx       
            });
        }
        console.log('Ensured USER FILES dir is present: '+config.USER_FILES_BASE)
        
    }        // dir has now been created, including the directory it is to be placed in

});

/**
* Create global objects once upon server startup
*/

var silvaTaxonomy = require('./models/silva_taxonomy');
var all_silva_taxonomy = new silvaTaxonomy();

var rdpTaxonomy = require('./models/rdp_taxonomy');
var all_rdp_taxonomy = new rdpTaxonomy();

var CustomTaxa  = require('./routes/helpers/custom_taxa_class');
//var CustomTaxa  = require('./routes/helpers/custom_taxa_class_json');   // for fancytree:  https://github.com/mar10/fancytree
//var CustomTaxa  = require('./routes/helpers/custom_taxa_class_dhtmlx');   // for dhtmlx:  http://dhtmlx.com/docs/products/dhtmlxTree/
//var TreeModel = require('tree-model');;

// GLOBAL if leave off 'var':
// FORMAT: TaxaCounts[ds_id][rank_name][tax_id] = count
// script: /public/scripts/create_taxcounts_lookup.py


// these files are manually created before server startup using the scripts in public/scripts
// var rstream = fs.createReadStream('./public/json/tax_counts--'+NODE_DATABASE+'.json.gz');
// var unzip = zlib.createGunzip();
// var taxcounts =''
// var chunk;
// rstream.pipe(unzip)
// 	.on('data', function (chunk) {
// 		taxcounts += chunk;
//   	})
// 	.on('end', function() {
// 		    console.log('Finished reading TAXCOUNTS');
// 	});

////////////////////////////////////////////////////////
/////// hdf5 Code //////////////
AllMetadata = {}

try{
    //var h5 = require('hdf5')
    var hdf5 = require('hdf5').hdf5; // File; Filters
    // var h5lt = require('hdf5').h5lt; // dataset
    // var h5tb = require('hdf5').h5tb; // table
    // var h5pt = require('hdf5').h5pt; // table
    // var h5im = require('hdf5').h5im; // image
    // var h5ds = require('hdf5').h5ds; // scale
    var h5g  = require('hdf5/lib/globals');
    // GLOBAL:
    HDF5_MDATA  = new hdf5.File(path.join( config.JSON_FILES_BASE, NODE_DATABASE+'--metadata.h5XX' ),  h5g.Access.ACC_RDONLY);
    HDF5_TAXDATA = new hdf5.File(path.join( config.JSON_FILES_BASE, NODE_DATABASE+'--taxcounts.h5XX' ), h5g.Access.ACC_RDONLY);
    //var groupTest = HDF5test_data.openGroup('test');
    //var group51 = HDF5_data.openGroup("86");
    var did_list = HDF5_MDATA.getMemberNamesByCreationOrder(); // retreives all the 'groups' ie dids
    //console.log(mdgroup86['temp'])
    //console.log('group56',group56.id)
    // var groupTargets=THE_TEST_FILE.createGroup('test/sodium-icosanoate');
    // groupTargets['Computed Heat of Formation' ] = -221.78436098572274;
    // groupTargets['Computed Ionization Potential' ] = 9.57689311885752;
    // groupTargets['Computed Total Energy' ] = -3573.674399276322;
    // groupTargets.Status = 256;
    // groupTargets.Information = "\"There are no solutions; there are only trade-offs.\" -- Thomas Sowell";
    // group56.flush();
    // var group = THE_TEST_FILE.openGroup('test/sodium-icosanoate')
    // var metadata = group56.getDatasetAttributes("metadata");
    // console.log(metadata)
    // var taxcounts = group56.getDatasetAttributes("taxcounts");
    // console.log(HDF5_DATA.getMemberNamesByCreationOrder())
    // att = testattr['temp']
    // for(i in did_list){
    //     var did = did_list[i]
    //     AllMetadata[did] = {}
    //     var mdgroup = HDF5_MDATA.openGroup(did+"/metadata");
    //     mdgroup.refresh()
    //     Object.getOwnPropertyNames(mdgroup).forEach(function(mdname, idx, array) {
    //         if(mdname != 'id'){
    //           //console.log(mdname, group[mdname])
    //           //AllMetadata[did][mdname] = mdgroup[mdname]
    //         }         
    //     });
    // }
    //console.log('aux_corrected_sample_depth',metadata['aux_corrected_sample_depth'])
    //console.log(h5g)
    // group.close()
    // THE_TEST_FILE.close()
    // var group88 = THE_FILE.openGroup('53')
    // group88.refresh();
    // for(n in hdf5){
    //     console.log(n)
    // }

    // var tax_attrs = group88.getDatasetAttributes("taxcounts");
    // var meta_attrs = group88.getDatasetAttributes("metadata");
    // group88.refresh();
    // attrText = '';
    // console.log(group88['longitude'])
    // Object.getOwnPropertyNames(tax_attrs).forEach(function(val, idx, array) {
    //    console.log(val,tax_attrs[val])
    //   if (val !=  'id') {
    //     if (meta_attrs[val].constructor.name === Array) {
    //       attrText += val + ' :  ';
    //       for (var mIndex = 0; mIndex < attrs[val].Length(); mIndex++) {
    //         attrText += meta_attrs[val][mIndex];
    //         if (mIndex < meta_attrs[val].Length() - 1) {
    //           attrText += ',';
    //         }
    //       }
    //     }
    //     else{
    //       attrText += val + ' :  ' + meta_attrs[val] + '\n';
    //     }
    //   }
    //   console.log(attrText)
    // });
    // var readAsBuffer = h5lt.readDatasetAsBuffer(  group88.id, 'metadata', {});

    // console.log(readAsBuffer)
    // for(n in tax_attrs){
    //     console.log(tax_attrs[n])
    // }
    // for(n in meta_attrs){
    //     console.log("\n",n)
    //     console.log(meta_attrs[n].toString())
    // }
    // console.log('g88',h5lt.get_num_attrs(group88.id))
    // console.log('group88',group88['latitude'] )
    ////////// END hdf5 Code ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
}catch(err){
    // If we're here we don't have HDF5
    console.log(err)
    HDF5_MDATA  = ''
    HDF5_TAXDATA = ''
    //var taxcounts_file = path.join( config.JSON_FILES_BASE, NODE_DATABASE+'--taxcounts.json' );
    var meta_file      = path.join( config.JSON_FILES_BASE, NODE_DATABASE+'--metadata.json' );
    AllTaxCounts = {}
    
    try {
        AllTaxCounts   = require(taxcounts_file);
        console.log('Loading TAXCOUNTS as AllTaxCounts from: '+taxcounts_file);
    }
    catch (e) {
      console.log(e);      
    }
    
    try {
        AllMetadata        = require(meta_file);
    }
    catch (e) {
      console.log(e);
      AllMetadata = {}
    }
    console.log('Loading METADATA as AllMetadata from: '+meta_file);
}
try{
    var sizeof = require('object-sizeof');
}catch(e){
    console.log(e);
}
//see file models/silva_taxonomy.js
all_silva_taxonomy.get_all_taxa(function(err, results) {
  if (err)
    throw err; // or return an error message, or something
  else
  {
    //console.log("AAA all_silva_taxonomy from app = " + JSON.stringify(results));

    //TAXCOUNTS = JSON.parse(taxcounts);
    //console.log('TAXCOUNTS2 '+JSON.stringify(TAXCOUNTS));
    // var small_rows = [ {"domain":"Archaea","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":1,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":13,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"D-F10","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":13,"klass_id":33,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"Group_C3","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":13,"klass_id":52,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"Marine_Benthic_Group_A","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":13,"klass_id":58,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":1,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":1,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":2,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Acidobacteria","order":"Acidobacteriales","family":"Acidobacteriaceae","genus":"","species":"","strain":"","domain_id":2,"phylum_id":2,"klass_id":2,"order_id":7,"family_id":8,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Holophagae","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":2,"klass_id":55,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Holophagae","order":"Holophagales","family":"Holophagaceae","genus":"","species":"","strain":"","domain_id":2,"phylum_id":2,"klass_id":55,"order_id":73,"family_id":138,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":3,"klass_id":5,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"Acidimicrobiales","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":3,"klass_id":5,"order_id":5,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"Acidimicrobiales","family":"Acidimicrobiaceae","genus":"","species":"","strain":"","domain_id":2,"phylum_id":3,"klass_id":5,"order_id":5,"family_id":6,"genus_id":1,"species_id":1,"strain_id":1}];
    // var new_taxonomy = new CustomTaxa(small_rows);
    // uncomment when we want all data:
    //SEE require('./routes/helpers/custom_taxa_class');
    new_taxonomy = new CustomTaxa(results);
    try{
        console.log('SIZE (silva-taxonomy object):',sizeof(new_taxonomy));
    }catch(e){}
    // uncomment to print out the object:
    //console.log('000 new_taxonomy = ' + JSON.stringify(new_taxonomy));
    //
    /// CREATE CUSTOM TAXONOMY TREE:  NOT NEEDED if using dhtmlx tree
    //new_taxonomy.make_html_tree_file(new_taxonomy.taxa_tree_dict_map_by_id, new_taxonomy.taxa_tree_dict_map_by_rank["domain"]); 
    //new_taxonomy.make_fancytree_file(new_taxonomy.taxa_tree_dict_map_by_id, new_taxonomy.taxa_tree_dict_map_by_rank["domain"]); 
    //new_taxonomy.make_dhtmlx_tree_file(new_taxonomy.taxa_tree_dict_map_by_id, new_taxonomy.taxa_tree_dict_map_by_rank["domain"]);    
    //
    //console.log("\nnew_taxonomy.taxa_tree_dict = " + JSON.stringify(new_taxonomy.taxa_tree_dict));
    //for(n in new_taxonomy.taxa_tree_dict){
    //	console.log(JSON.stringify(new_taxonomy.taxa_tree_dict[n]))
    //}
    //console.log("\ntaxa_tree_dict_map_by_id = " + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_id[2266]));
//console.log(new_taxonomy.taxa_tree_dict_map_by_rank["domain"])
//console.log('taxa_tree_dict_map_by_db_id_n_rank["3_domain"] = '+JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["3_domain"]));


    //console.log('1(silva)-taxa_tree_dict_map_by_db_id_n_rank["140108_domain"] = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["140108_domain"]));
    console.log('1(silva)-taxa_tree_dict_map_by_db_id_n_rank["2357955_family"] = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["2357955_family"]));

    //console.log('taxa_tree_dict_map_by_rank["phylum"] = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_rank['phylum']));
    //console.log('taxa_tree_dict_map_by_name_n_rank = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_name_n_rank));
    //console.log('taxa_tree_dict_map_by_name_n_rank["Acidobacteria_phylum"] = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_name_n_rank["Acidobacteria_phylum"]));
    //console.log('taxa_tree_dict_map_by_name_n_rank["Bacteria_domain"] = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_name_n_rank["Bacteria_domain"]));
    //console.log('taxa_tree_dict_map_by_db_id_n_rank["3927_domain"] = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["3927_domain"]));

    //console.log('RRR333 taxa_tree_dict_map_by_db_id_n_rank = '+JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank));
    
  }
});

all_rdp_taxonomy.get_all_taxa(function(err, results) {
  if (err)
    throw err; // or return an error message, or something
  else
  {
    new_rdp_taxonomy = new CustomTaxa(results);
    try{
        console.log('SIZE (rdp-taxonomy object):',sizeof(new_rdp_taxonomy));
    }catch(e){}
    console.log('2(rdp)-taxa_tree_dict_map_by_db_id_n_rank["3446_domain"] = ' + JSON.stringify(new_rdp_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["140108_domain"]));
  }
});

//var taxCounts = require('./routes/helpers/create_taxcounts_class');
//new taxCounts();


module.exports = app;

// if (!module.parent) {
//   http.createServer(app).listen(process.env.PORT, function(){
//     console.log("Server listening on port " + app.get('port'));
//   });
// }




