"use strict"
// for newrelic: start in config.js
const config = require('./config/config');
const dbconn = require('./config/database').pool;
const path = require('path');
// explicitly makes conn global
global.connection = dbconn;
global.app_root = path.resolve(__dirname);
const C		= require('./public/constants');


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




const compression = require('compression');
const express = require('express');
const expressSanitizer = require('express-sanitizer');
// var expressValidator = require('express-validator');
// const { check, validationResult } = require('express-validator');

//var expose = require('express-expose');
const router = express.Router();
const session = require('express-session');


const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const passport = require('passport');
const favicon = require('serve-favicon');
const fs = require('fs-extra');
const zlib = require('zlib');
const sizeof = require('object-sizeof');

const routes      = require('./routes/index');  // This grabs ALL_DATASETS from routes/load_all_datasets.js
const users       = require('./routes/routes_users');
const tmp         = require('./routes/routes_tmp');
const user_data   = require('./routes/routes_user_data');
const search      = require('./routes/routes_search');
const projects    = require('./routes/routes_projects');
const datasets    = require('./routes/routes_datasets');
const help        = require('./routes/routes_help');
const resources   = require('./routes/routes_resources');
const admin       = require('./routes/routes_admin');
const oligotyping = require('./routes/routes_oligotyping');
const otus        = require('./routes/routes_otus');
const api         = require('./routes/routes_api');
const portals     = require('./routes/routes_portals');
const metadata    = require('./routes/routes_metadata');
const metagenome  = require('./routes/routes_metagenome');
//console.log('test')
const visuals = require('./routes/visuals/routes_visualization');
//console.log('test2')
const expressSanitized = require('express-sanitized');
// add timestamps in front of log messages
require('console-stamp')(console, { pattern: 'yyyy/mm/dd HH:MM:ss.l' });

const app = express();
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
// app.use(bodyParser({uploadDir:'./uploads'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,         // allows for richer json like experience https://www.npmjs.com/package/qs#readme
    limit: '50mb',          // size of body
    parameterLimit: 1000000 // number of parameters
}));

app.use(expressSanitizer()); // this line follows bodyParser() instantiations
app.use(expressSanitized()); // this line follows bodyParser()
// app.use(expressValidator()); // this line must be immediately after any of the bodyParser middlewares!



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
app.use('public/help_pages',  express.static(path.join(__dirname, 'public', 'help_pages')));
app.use('/static_base',       express.static(config.PATH_TO_STATIC_BASE));        // base of user variable/changing files for download
app.use('/static_dnld',       express.static(config.PATH_TO_STATIC_DOWNLOADS));   // path for static stable downloadable files
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
        req.db = connection; // not needed because connection is in global scope
        req.CONSTS = C;     // doubtful if this is needed
        req.CONFIG = config;
        return next();
    }
});


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
app.use('/api', api);
app.use('/metagenome', metagenome);

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
    var err = new Error('Page Not Found');
    err.status = 404;
    //next(err);
    res.render('error', {
        message: err,
        error: err,
        title:'ERROR',
        hostname        : req.CONFIG.hostname,
        user: req.user,
    });
});

/// error handlers <-- these middleware go after routes

// development error handler
// will print stacktrace


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

app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('404', { url: '/' });
        // res.render('404', { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});




fs.ensureDir(config.USER_FILES_BASE, function (err) {
    if(err) {console.log(err);} // => null
    else{
        if(config.site != 'vamps' && config.site != 'vampsdev'){
            fs.chmod(config.USER_FILES_BASE, 0o775, function (err) {
                if(err) {console.log(err);} // ug+rwx
            });
        }
        console.log('Ensured USER FILES dir is present:\n\t'+config.USER_FILES_BASE)

    }        // dir has now been created, including the directory it is to be placed in

});

/**
 * Create global objects once upon server startup
 */

const silvaTaxonomy = require('./models/silva_taxonomy');
let all_silva_taxonomy = new silvaTaxonomy();

const rdpTaxonomy = require('./models/rdp_taxonomy');
let all_rdp_taxonomy = new rdpTaxonomy();

const genericTaxonomy = require('./models/generic_taxonomy');
let all_generic_taxonomy = new genericTaxonomy();

const CustomTaxa  = require('./routes/helpers/custom_taxa_class');
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

//var taxcounts_file = path.join( config.JSON_FILES_BASE, NODE_DATABASE+'--taxcounts.json' );
let meta_file      = path.join( config.JSON_FILES_BASE, NODE_DATABASE+'--metadata.json' );

try {
   C.AllMetadata        = require(meta_file);
}
catch (e) {
   if(app.get('env') === 'production'){
     console.log('Could not get AllMetadata in app.js; Exiting' + e.toString())
     process.exit()
   }
   C.AllMetadata = {}
}
console.log('Loading METADATA as AllMetadata from:\n\t'+meta_file);



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
        C.new_taxonomy = new CustomTaxa(results);
        try{
            console.log('SIZE (silva-taxonomy object):',sizeof(C.new_taxonomy));
        }catch(e){
            console.log('Could not get sizeof(constants.new_taxonomy) in app.js; Exiting')
            process.exit()
        }
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
        //console.log('1(silva)-taxa_tree_dict_map_by_db_id_n_rank["2357955_family"] = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["2357955_family"]));
        //console.log(new_taxonomy.taxa_tree_dict_map_by_rank['domain'])
        //console.log('taxa_tree_dict_map_by_rank["phylum"] = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_rank['phylum']));
        //console.log('taxa_tree_dict_map_by_name_n_rank = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_name_n_rank));
        //console.log('taxa_tree_dict_map_by_name_n_rank["Acidobacteria_phylum"] = ' + JSON.stringify(C.new_taxonomy.taxa_tree_dict_map_by_name_n_rank["Acidobacteria_phylum"]));
        //console.log('taxa_tree_dict_map_by_name_n_rank["Bacteria_domain"] = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_name_n_rank["Bacteria_domain"]));
        //console.log('taxa_tree_dict_map_by_db_id_n_rank["3927_domain"] = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["3927_domain"]));

        //console.log('RRR333 taxa_tree_dict_map_by_db_id_n_rank = '+JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank));
        //console.log(PROJECT_INFORMATION_BY_PID)

        //console.log(MD_PRIMER_SUITE[34])
        //console.log(MD_SEQUENCING_PLATFORM)

        //console.log(AllMetadata[88])
        //var mode = 0777 & ~process.umask();
        //console.log('mode',mode)
        console.log('process.umask',process.umask())
        //process.umask(022)
        //console.log('process.umask',process.umask(0))
    }
});
// THESE SHOULDN'T BE LOADED UNTILL NEEDED
all_rdp_taxonomy.get_all_taxa(function(err, results) {
    if (err)
        console.log(err); // or return an error message, or something
    else
    {
        C.new_rdp_taxonomy = new CustomTaxa(results);
        if(typeof C.new_rdp_taxonomy === 'object'){
            try{
                console.log('SIZE (rdp-taxonomy object):',sizeof(C.new_rdp_taxonomy));
            }catch(e){
                C.new_rdp_taxonomy = {};
                console.log('Could not get sizeof(new_rdp_taxonomy) in app.js; Connection Problem?')
            }
        }
    }
});
all_generic_taxonomy.get_all_taxa(function(err, results) {
    if (err)
        console.log(err); // or return an error message, or something
    else
    {
        C.new_generic_taxonomy = new CustomTaxa(results);
        if(typeof C.new_generic_taxonomy === 'object'){
            try{
                console.log('SIZE (generic-taxonomy object):',sizeof(C.new_generic_taxonomy));
            }catch(e){
                C.new_generic_taxonomy = {};
                console.log('Could not get sizeof(new_generic_taxonomy) in app.js; Connection Problem?')
            }
        }
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
