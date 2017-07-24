var CONSTS = require(app_root + '/public/constants');
var queries = require(app_root + '/routes/queries');
var config  = require(app_root + '/config/config');

var express = require('express');
var router = express.Router();
var fs = require('fs');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({});
var util = require('util');
var path  = require('path');
var crypto = require('crypto');
var mysql = require('mysql2');
var spawn = require('child_process').spawn;
var helpers = require(app_root + '/routes/helpers/helpers');

// module.exports = {
// route middleware to make sure a user is logged in
module.exports.isLoggedIn = function(req, res, next) {
  // if user is authenticated in the session, carry on

  if (req.isAuthenticated()) {
    console.log("Hurray! isLoggedIn.req.isAuthenticated:", req.user.username);
    return next();
  }
  // if they aren't redirect them to the home page
  console.log("Oops! NOT isLoggedIn.req.isAuthenticated");
  // save the url in the session
  req.session.returnTo = req.originalUrl;
  req.flash('loginMessage', 'Please login or register before continuing.');
  res.redirect('/users/login');
  // return;
};
module.exports.isLoggedInAPI = function(req, res) {
  if (req.isAuthenticated()) {
    console.log("Hurray! API User isLoggedInAPI.req.isAuthenticated:", req.user.username);
    return true;
  }else{
    console.log("Oops! NOT isLoggedIn.req.isAuthenticated");
    return false;
  }
  
};
// route middleware to make sure a user is an aministrator
module.exports.isAdmin = function(req, res, next) {
  if (req.user.security_level === 1) {
    console.log("Hurray! USER is an Admin:", req.user.username);
    return next();
  }
  // if they aren't redirect them to the home page
  console.log("Whoa! NOT an Admin: ", req.user.username);
  // save the url in the session
  req.session.returnTo = req.path;
  //console.log('URL Requested: '+JSON.stringify(req));
  //console.log(util.inspect(req, {showHidden: false, depth: null}));
  req.flash('fail', 'The page you are trying to access is for VAMPS admins only.');
  res.redirect('/');
  // return;
};


// };

/** Benchmarking
 * Usage:
 var helpers = require('../helpers/helpers');

 helpers.start = process.hrtime();
 some code
 helpers.elapsed_time("This is the running time for some code");
 */

module.exports.start = process.hrtime();

function check_file_formats(filename) {
  var file_formats = CONSTS.download_file_formats;
  var file_first_part = filename.split('-')[0];
  return file_formats.indexOf(file_first_part) !== -1;
}

function get_user_dirname(dirname) {
  var dirname_arr = dirname.split('/');
  return dirname_arr[dirname_arr.length - 1];
}

function get_sizer_and_filesize(size) {
  var fileSize = (size).toFixed(1);
  var sizer = 'Bytes';
  if (size > 1000) {
    fileSize = (size / 1000.0).toFixed(1);
    sizer = 'KB';
  }
  if (size > 1000000) {
    fileSize = (size / 1000000.0).toFixed(1);
    sizer = 'MB';
  }
  if (size > 1000000000) {
    fileSize = (size / 1000000000.0).toFixed(1);
    sizer = 'GB';
  }
  return [fileSize, sizer];
}

function format_time(mtime){
  console.log("GGG mtime.toString().split(' ')");
  console.log(mtime.toString().split(" "));
  // [ 'Mon', 'Jul', '24', '2017', '16:43:56', 'GMT-0400', '(EDT)' ]
  a = mtime.toString().split(" ").slice(1, 5).join(" ");
  // return str.split("").reverse().join("");
  //
  // var dids_str = JSON.stringify(dids.join(', '));
  console.log(a);

  return a;
  // mtime.toString().split();
    //Mon Jul 24 2017 16:43:56 GMT-0400 (EDT)
    // .toISOString().replace(/T/,' ').replace(/\..+/, '');
  // .replace(/T/,' ').replace(/.000Z$/,'');
  // .toString();
  // Wed Jul 05 2017 12:15:22 GMT-0400 (EDT)
}

function walk_recursively(dir, done) {
// var file_formats = CONSTS.download_file_formats;
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk_recursively(file, function(err, res) {
            results = results.concat(res);
            if (!--pending){
              done(null, results);
            }
          });
        } else {
          var filename = path.basename(file);

          if (check_file_formats(filename)) {
            var sizer_and_filesize = get_sizer_and_filesize(stat.size);
            results.push({'filename': filename,
                          // 'size': stat.size,
                          'fileSize': sizer_and_filesize[0],
                          'sizer':    sizer_and_filesize[1],
                          'time':     stat.mtime,
                          'mtime_format': format_time(stat.mtime),
                          'user_dirname': get_user_dirname(path.dirname(file))});
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

module.exports.walk = function(dir, done) {
  walk_recursively(dir, done);
};

function walk_sync_recursive(dir) {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk_sync_recursive(file));
    }
    else {
      var filename = path.basename(file);

      if (check_file_formats(filename)) {
        results.push({'filename': filename,
          'size': stat.size,
          'time': stat.mtime,
          'mtime_format': format_time(stat.mtime),
          'user_dirname': get_user_dirname(path.dirname(file))});
      }
    }
  });
  return results;
}

module.exports.walk_sync = function(dir) {
  return walk_sync_recursive(dir);
};

module.exports.elapsed_time = function(note){
  var precision = 3; // 3 decimal places
  var elapsed = process.hrtime(module.exports.start)[1] / 1000000; // divide by a million to get nano to milli
  console.log(process.hrtime(module.exports.start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note);
};

var ranks = CONSTS.RANKS;

// todo: use in file instead of those in the class
module.exports.check_if_rank = function(field_name)
{
  // ranks = ["domain","phylum","klass","order","family","genus","species","strain"]
  return ranks.indexOf(field_name) > -1;
};

module.exports.render_error_page = function(req,res,msg)
{
  req.flash('fail', msg);
  res.render('error',
    { title :  'Fail',
      user :   req.user.username
    });
};

module.exports.clear_file = function(fileName)
{
  fs.openSync(fileName, "w");
};

module.exports.append_to_file = function(fileName, text)
{
  fs.appendFileSync(fileName, text);
};

module.exports.write_to_file = function(fileName, text)
{
  fs.writeFile(fileName, text, function(err){
    if(err) {
      throw err;
    } else {

    }
  });
};
module.exports.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.isInt = function(value)
{
  return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value));
};
module.exports.IsJsonString = function(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

module.exports.onlyUnique = function(value, index, self) {
  // usage: ukeys = ukeys.filter(helpers.onlyUnique);
  return self.indexOf(value) === index;
};

module.exports.mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
};

module.exports.fileExists = function (path) {
  try
  {
    return fs.statSync(path).isFile() || fs.statSync(path).isDirectory();
  }
  catch (err)
  {
    return false;
  }
};

module.exports.send_mail = function(mail_info) {
  var to_addr = mail_info.addr;
  var from_addr = mail_info.from;
  var subj = mail_info.subj;
  var msg = mail_info.msg;
  transporter.sendMail(mail_info, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Message sent: ' + info.messageId);
    }
  });

  // transporter.sendMail({
  //         from: from_addr,
  //         to: to_addr,
  //         subject: subj,
  //         text: msg
  //       });

};
//
//
//
module.exports.get_select_seq_counts_query = function(rows){
  for (var i=0; i < rows.length; i++) {
    //console.log('rows[i].project_id in run_select_sequences_query');
    var pid = rows[i].project_id;
    var did = rows[i].dataset_id;
    var count= rows[i].seq_count;
    var cid  =  rows[i].classifier_id;
    ALL_DCOUNTS_BY_DID[did] = parseInt(count);
    if(ALL_CLASSIFIERS_BY_CID.hasOwnProperty(cid)){
      ALL_CLASSIFIERS_BY_PID[pid] = ALL_CLASSIFIERS_BY_CID[cid];
    }else{

    }
    if(pid in ALL_PCOUNTS_BY_PID){
      ALL_PCOUNTS_BY_PID[pid] += parseInt(count);
    }else{
      ALL_PCOUNTS_BY_PID[pid] = parseInt(count);
    }
  }
};

module.exports.run_ranks_query = function(rank,rows){
  for (var i=0; i < rows.length; i++) {
    var id = rows[i][rank+'_id'];
    var name = rows[i][rank];
    RANK_ID_BY_NAME[rank][name] = id;
  }
};

module.exports.get_select_env_term_query = function(rows){
  for (var i=0; i < rows.length; i++) {
    MD_ENV_TERM[rows[i].term_id] = rows[i].term_name;
  }
};
module.exports.get_select_env_package_query = function(rows){
  for (var i=0; i < rows.length; i++) {
    MD_ENV_PACKAGE[rows[i].env_package_id] = rows[i].env_package;
  }
};
module.exports.get_select_domain_query = function(rows){
  for (var i=0; i < rows.length; i++) {
    MD_DOMAIN[rows[i].domain_id] = rows[i].domain;
  }
};
module.exports.get_select_dna_region_query = function(rows){
  for (var i=0; i < rows.length; i++) {
    MD_DNA_REGION[rows[i].dna_region_id] = rows[i].dna_region.toLowerCase();
  }
};
module.exports.get_select_target_gene_query = function(rows){
  for (var i=0; i < rows.length; i++) {
    MD_TARGET_GENE[rows[i].target_gene_id] = rows[i].target_gene.toLowerCase();
  }
};
module.exports.get_select_sequencing_platform_query = function(rows){
  for (var i=0; i < rows.length; i++) {
    MD_SEQUENCING_PLATFORM[rows[i].sequencing_platform_id] = rows[i].sequencing_platform;
  }
};
module.exports.get_select_adapter_sequence_query = function(rows){
  for (var i=0; i < rows.length; i++) {
    MD_ADAPTER_SEQUENCE[rows[i].run_key_id] = rows[i].run_key;
  }
};
module.exports.get_select_illumina_index_query = function(rows){
  for (var i=0; i < rows.length; i++) {
    MD_ILLUMINA_INDEX[rows[i].illumina_index_id] = rows[i].illumina_index;
  }
};

///////////////////////
module.exports.get_select_primer_suite_query = function(rows){
  for (var i=0; i < rows.length; i++) {

    if( ! MD_PRIMER_SUITE.hasOwnProperty(rows[i].primer_suite_id)){
      MD_PRIMER_SUITE[rows[i].primer_suite_id] = {};
      MD_PRIMER_SUITE[rows[i].primer_suite_id].id = rows[i].primer_suite_id;
      MD_PRIMER_SUITE[rows[i].primer_suite_id].name   = rows[i].primer_suite;
      MD_PRIMER_SUITE[rows[i].primer_suite_id].region = rows[i].region;
      MD_PRIMER_SUITE[rows[i].primer_suite_id].domain = rows[i].domain;
      MD_PRIMER_SUITE[rows[i].primer_suite_id].primer = [];
    }
    MD_PRIMER_SUITE[rows[i].primer_suite_id].primer.push({
      "primer"    :   rows[i].primer,
      "primer_id" :   rows[i].primer_id,
      "direction" :   rows[i].direction,
      "sequence"  :   rows[i].sequence

    });


  }
};
// module.exports.get_select_primer_query = function(rows){
//     for (var i=0; i < rows.length; i++) {
//         // MD_PRIMER[primer_suite_id] = [array of primers] names or seqs????
//         // [{'sequence':xxx, 'direction':'F','original_seq':xxxx,'name':967F,'region':'v6','domain':}
//
//         if(rows[i].primer_suite_id in MD_PRIMER)
//
//     }
// };
////////////////////

module.exports.get_select_run_query = function(rows){
  for (var i=0; i < rows.length; i++) {
    MD_RUN[rows[i].run_id] = rows[i].run;
  }
};
// TODO: "This function's cyclomatic complexity is too high. (6)"
module.exports.run_permissions_query = function(rows){
  //console.log(PROJECT_INFORMATION_BY_PID)
  for (var i=0; i < rows.length; i++) {
    var pid = rows[i].project_id;
    var uid = rows[i].user_id;

    if(pid in PROJECT_INFORMATION_BY_PID ){
      var project = PROJECT_INFORMATION_BY_PID[pid].project;
      PROJECT_INFORMATION_BY_PNAME[project] =  PROJECT_INFORMATION_BY_PID[pid];
      if(PROJECT_INFORMATION_BY_PID[pid].public === 1 || PROJECT_INFORMATION_BY_PID[pid].username === 'guest'){
        PROJECT_INFORMATION_BY_PID[pid].permissions = [];
      }else{
        // TODO: "Blocks are nested too deeply. (4)"
        if(PROJECT_INFORMATION_BY_PID[pid].permissions.indexOf(uid) === -1){
          PROJECT_INFORMATION_BY_PID[pid].permissions.push(uid);
        }
      }
    }
  }
  //console.log(PROJECT_INFORMATION_BY_PID)
};
// TODO: "This function's cyclomatic complexity is too high. (6)"
module.exports.update_global_variables = function(pid,type){
  if(type=='del'){
    var dids= DATASET_IDS_BY_PID[pid];
    var pname = PROJECT_INFORMATION_BY_PID[pid].project;
    console.log('RE-INTIALIZING ALL_DATASETS');
    dataset_objs = [];
    for(var i in ALL_DATASETS.projects){
      item = ALL_DATASETS.projects[i];
      //console.log('item'+item);
      // {"name":"142","pid":105,"title":"Title","datasets":[{"did":496,"dname":"142_ds","ddesc":"142_ds_description"}]
      if(item.pid == pid){
        dataset_objs = item.datasets;
        //console.log('SPLICING '+pid);
        ALL_DATASETS.projects.splice(i,1);
        break;
      }

    }
    console.log('RE-INTIALIZING PROJECT_ID_BY_DID');
    console.log('RE-INTIALIZING DATASET_NAME_BY_DID');
    console.log('RE-INTIALIZING ALL_DCOUNTS_BY_DID');
    for(var d in dids){

      delete PROJECT_ID_BY_DID[dids[d]];
      delete DATASET_NAME_BY_DID[dids[d]];
      delete ALL_DCOUNTS_BY_DID[dids[d]];
      delete DatasetsWithLatLong[dids[d]];
    }
    console.log('RE-INTIALIZING PROJECT_INFORMATION_BY_PID');
    console.log('RE-INTIALIZING DATASET_IDS_BY_PID');
    console.log('RE-INTIALIZING ALL_PCOUNTS_BY_PID');
    console.log('RE-INTIALIZING ALL_CLASSIFIERS_BY_PID');
    console.log('RE-INTIALIZING PROJECT_INFORMATION_BY_PNAME');
    console.log('RE-INTIALIZING DatasetsWithLatLong');

    delete PROJECT_INFORMATION_BY_PID[pid];
    delete DATASET_IDS_BY_PID[pid];
    delete ALL_PCOUNTS_BY_PID[pid];
    delete ALL_CLASSIFIERS_BY_PID[pid];
    delete PROJECT_INFORMATION_BY_PNAME[pname];

  }else if(type=='add'){

  }else{
    // ERROR
  }
};

module.exports.assignment_finish_request = function(res, rows1, rows2, status_params) {
  console.log('query ok1 '+JSON.stringify(rows1));
  console.log('query ok2 '+JSON.stringify(rows2));

  this.run_select_datasets_query(rows1);
  console.log(' UPDATING ALL_DATASETS');
  console.log(' UPDATING PROJECT_ID_BY_DID');
  console.log(' UPDATING PROJECT_INFORMATION_BY_PID');
  console.log(' UPDATING PROJECT_INFORMATION_BY_PNAME');
  console.log(' UPDATING DATASET_IDS_BY_PID');
  console.log(' UPDATING DATASET_NAME_BY_DID');
  console.log(' UPDATING AllMetadataNames');
  console.log(' UPDATING DatasetsWithLatLong');

  this.run_select_sequences_query(rows2);
  console.log(' UPDATING ALL_DCOUNTS_BY_DID');
  console.log(' UPDATING ALL_PCOUNTS_BY_PID ');
  console.log(' UPDATING ALL_CLASSIFIERS_BY_PID');
  // re-run re-create new_taxonomy (see app.js)
  var silvaTaxonomy = require(app_root + '/models/silva_taxonomy');
  var all_silva_taxonomy = new silvaTaxonomy();
  var CustomTaxa  = require('./custom_taxa_class');
  all_silva_taxonomy.get_all_taxa(function(err, results) {
    if (err)
      throw err; // or return an error message, or something
    else
      new_taxonomy = new CustomTaxa(results);
    //new_taxonomy.make_html_tree_file(new_taxonomy.taxa_tree_dict_map_by_id, new_taxonomy.taxa_tree_dict_map_by_rank["domain"]);
  });
  console.log(' UPDATED new_taxonomy');
};
module.exports.reverse = function (str) {
  return str.split("").reverse().join("");
};
module.exports.clean_string = function (str) {
  // this replaces everything that is not letter,number or underscore (\w) with underscore
  return str.replace(/[^\w]/gi, '_');
};

module.exports.get_metadata_from_file = function (){
  var meta_file = path.join(config.JSON_FILES_BASE, NODE_DATABASE + '--metadata.json');
  try { AllMetadataFromFile = require(meta_file); }
  catch (e) {
    console.log(e);
    AllMetadataFromFile = {};
  }
  return AllMetadataFromFile;
};

// TODO: "This function's cyclomatic complexity is too high. (11)"
module.exports.mysql_real_escape_string = function (str) {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\"+char; // prepends a backslash to backslash, percent,
                          // and double/single quotes
    }
  });
};

module.exports.checkUserName = function(username) {   // SAME FXN IN PASSPORT
  reg = /[^A-Za-z0-9]/;   // allow alphanumeric ONLY!
  a = (reg.test(username));
  //console.log(a)
  return a;
};
module.exports.generateHash = function(password) {
  //return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  var cipher = crypto.createCipher('aes-256-cbc', 'salt');
  cipher.update(password, 'utf8', 'base64');
  return cipher.final('base64');
};
// Sort list of json objects alphabetically
module.exports.compareStrings_alpha = function(a, b) {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};
// Sort list of json objects numerically
module.exports.compareStrings_int = function(a, b) {
  // Assuming you want case-insensitive comparison
  a = parseInt(a);
  b = parseInt(b);
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};
module.exports.sort_json_matrix = function(mtx, fxn_obj) {
  // fxn must be one of min,max, alphaUp, alphaDown
  // else original mtx returned
  // sorts MATRIX by tax alpha or counts OF FIRST COLUMN only
  // Does not (yet) sort datasets
  obj = [];
  for(var i in mtx.data){
    obj.push({tax:mtx.rows[i],cnt:mtx.data[i]});
  }
  var reorder = false;
  if(fxn_obj.orderby == 'alpha'){
    if(fxn_obj.value == 'a'){
      obj.sort(function sortByAlpha(a, b) {
        return module.exports.compareStrings_alpha(b.tax.id, a.tax.id);
      });
      reorder = true;
    }else{
      obj.sort(function sortByAlpha(a, b) {
        return module.exports.compareStrings_alpha(a.tax.id, b.tax.id);
      });
      reorder = true;
    }
  }else if(fxn_obj.orderby == 'count'){
    if(fxn_obj.value == 'max'){
      obj.sort(function sortByCount(a, b) {
        return b.cnt[0] - a.cnt[0];
      });
      reorder = true;
    }else{
      obj.sort(function sortByCount(a, b) {
        return a.cnt[0] - b.cnt[0];
      });
      reorder = true;
    }
  }else{

  }

  if(reorder){
    mtx.rows = [];
    mtx.data = [];
    for(var i1 in obj){
      //console.log(i,obj[i])
      mtx.rows.push(obj[i1].tax);
      mtx.data.push(obj[i1].cnt);
    }
  }
  return mtx;

};
module.exports.get_portal_projects = function(req, portal) {

  projects = [];
  var basis = req.CONSTS.PORTALS[portal];
  //switch (portal) {
  console.log('ALL_DATASETS-PORTAL', ALL_DATASETS);
  console.log(JSON.stringify(basis));
  ALL_DATASETS.projects.forEach(function(prj) {
    var pinfo = PROJECT_INFORMATION_BY_PID[prj.pid];
    var split = prj.name.split('_');

    if(basis.projects.indexOf(prj.name) != -1){
      projects.push(pinfo);
    }
    if(basis.prefixes.indexOf(split[0]) != -1){
      projects.push(pinfo);
    }
    //console.log('UniEuk-basis',basis);
    if(basis.suffixes.indexOf(split[split.length-1]) != -1){
      //console.log('UniEuk',JSON.stringify(pinfo));
      projects.push(pinfo);
    }
  });

  console.log('INFO', projects);
  return projects;

};
module.exports.get_public_projects = function(req) {

  projects = [];
  //var basis = req.CONSTS.PORTALS[portal]
  //switch (portal) {
  //console.log('ALL_DATASETS--get_public_projects', ALL_DATASETS);
  //console.log(JSON.stringify(basis))
  ALL_DATASETS.projects.forEach(function(prj) {

    var pinfo = PROJECT_INFORMATION_BY_PID[prj.pid];
    //var public = pinfo.public
    //if(pinfo.public == 1){
    projects.push(pinfo);
    //}

  });

  //console.log('INFO', projects);
  return projects;

};

module.exports.get_attributes_from_hdf5_group = function(did, type) {
  var hash = {};
  var h5group;
  if(type == 'metadata'){
    h5group = HDF5_MDATA.openGroup(did+"/"+type);
  }else{
    h5group = HDF5_TAXDATA.openGroup(did+"/"+type);
  }

  h5group.refresh();
  Object.getOwnPropertyNames(h5group).forEach(function(str, idx, array) {
    if(str != 'id'){
      hash[str] = h5group[str];
    }
  });
  return hash;
};

module.exports.get_PTREE_metadata = function(OBJ, q) {
  projects = [];
  phash = {};
  OBJ.forEach(function(prj) {
    dids = DATASET_IDS_BY_PID[prj.pid];
    for(var n in dids){

      if(dids[n] in AllMetadata && AllMetadata[dids[n]].hasOwnProperty(q)){
        phash[prj.pid] = 1;
      }
    }
  });

  for(pid in phash){
    projects.push(PROJECT_INFORMATION_BY_PID[pid]);
  }

  return projects;
};

module.exports.make_color_seq = function(seq){

  var return_string = '';
  for(var i = 0; i < seq.length; i++)
  {
    var base = seq.charAt(i);
    if(base == 'A')
    {
      return_string += "<font color='red'>"+base+"</font>";
    }
    else if(base == 'C')
    {
      return_string += "<font color='blue'>"+base+"</font>";
    }
    else if(base == 'G')
    {
      return_string += "<font color='black'>"+base+"</font>";
    }
    else if(base == 'T')
    {
      return_string += "<font color='orange'>"+base+"</font>";
    }
    else
    {
      return_string += "<font color='darkgrey'>"+base+"</font>";
    }

  }

  return return_string;
};    //end of function make_color_seq

module.exports.update_project_information_global_object = function(pid, form, user_obj){
  console.log('Updating PROJECT_INFORMATION_BY_PID');
  if(config.site == 'vamps' ){
    console.log('VAMPS PRODUCTION -- no print to log');
  }else{
    console.log(pid);
    console.log(JSON.stringify(form));
    console.log(JSON.stringify(user_obj));
  }
  if( PROJECT_INFORMATION_BY_PID.hasOwnProperty(pid) == true){
    console.log('pid already in PROJECT_INFORMATION_BY_PID -- how can that be?');
    return;
  }
  console.log('Creating new PROJECT_INFORMATION_BY_PID[pid]');
  PROJECT_INFORMATION_BY_PID[pid] = {};
  PROJECT_INFORMATION_BY_PID[pid] = {
    "last" :             user_obj.last_name,
    "first" :            user_obj.first_name,
    "username" :         user_obj.username,
    "oid" :              user_obj.user_id,
    "email" :            user_obj.email,
    // "env_source_name" : rows[i].env_source_name,
    "env_source_id" :    form.new_env_source_id,
    "institution" :      user_obj.institution,
    "project" :          form.new_project_name,
    "pid" :              pid,
    "title" :            form.new_project_title,
    "description" :      form.new_project_description,
    "public" :           form.new_privacy,
    "permissions" :     [user_obj.user_id]
  };
  PROJECT_INFORMATION_BY_PNAME[form.new_project_name] =  PROJECT_INFORMATION_BY_PID[pid];
  console.log('PROJECT_INFORMATION_BY_PID[pid]');
  console.log(PROJECT_INFORMATION_BY_PID[pid]);
};

// TODO: Column: 52 "This function's cyclomatic complexity is too high. (20)"
module.exports.run_select_datasets_query = function(rows){
  var pids         = {};
  var titles       = {};
  var datasetsByProject = {};
  for (var i=0; i < rows.length; i++) {
    var project = rows[i].project;
    if (project === undefined){ continue; }
    var pid = rows[i].pid;
    var did = rows[i].did;
    if(! DATASET_IDS_BY_PID.hasOwnProperty(pid)){
      DATASET_IDS_BY_PID[pid]=[];
    }
    if (did === undefined || did === 'null'|| did === null){
      //console.log('DATASET NULL');
    }else{

      var dataset = rows[i].dataset;
      var dataset_description = rows[i].dataset_description;
      PROJECT_ID_BY_DID[did] = pid;
      DATASET_NAME_BY_DID[did] = dataset;
      if (datasetsByProject.hasOwnProperty(project)){
        datasetsByProject[project].push({ did:did, dname:dataset, ddesc: dataset_description});
      } else {
        datasetsByProject[project] =   [{ did:did, dname:dataset, ddesc: dataset_description }];
      }


      DATASET_IDS_BY_PID[pid].push(did);

    }

    if(AllMetadata.hasOwnProperty(did) && AllMetadata[did].hasOwnProperty('env_package_id')){
      var envpkgid = AllMetadata[did].env_package_id;
    }else{
      var envpkgid = '1';
    }



    if( ! PROJECT_INFORMATION_BY_PID.hasOwnProperty(pid)){
      var public = rows[i].public;
      var owner_id = rows[i].owner_user_id;
      PROJECT_INFORMATION_BY_PID[pid] = {
        "last" :            rows[i].last_name,
        "first" :           rows[i].first_name,
        "username" :        rows[i].username,
        "oid" :             owner_id,
        "email" :           rows[i].email,
        "env_package_id" :  envpkgid,  // FROM AllMetadata: mostly used here for the filter function on dataset selection page
        "institution" :     rows[i].institution,
        "project" :         project,
        "pid" :             pid,
        "title" :           rows[i].title,
        "description" :     rows[i].project_description,
        "public" :          rows[i].public,
      };
      if(public || rows[i].username === 'guest'){
        PROJECT_INFORMATION_BY_PID[pid].permissions = [];  // PUBLIC
      }else{
        PROJECT_INFORMATION_BY_PID[pid].permissions = [owner_id]; // initially has only project owner_id
      }
      PROJECT_INFORMATION_BY_PNAME[project] =  PROJECT_INFORMATION_BY_PID[pid];

      pids[project] = pid;
      titles[project] = rows[i].title;
    }

  }

  // todo: console.log(datasetsByProject.length); datasetsByProject - not an array
  for (var p in datasetsByProject){
    var tmp = {};
    tmp.name = p;
    tmp.pid = pids[p];
    tmp.title = titles[p];
    tmp.datasets = [];
    for (var d in datasetsByProject[p]){
      var ds = datasetsByProject[p][d].dname;
      var dp_did = datasetsByProject[p][d].did;
      var ddesc = datasetsByProject[p][d].ddesc;
      tmp.datasets.push({ did:dp_did, dname:ds, ddesc:ddesc });
    }
    ALL_DATASETS.projects.push(tmp);
  }
  //console.log(JSON.stringify(ALL_DATASETS))
  console.log('Getting md-names and those w/ lat/lon');
  //var clean_metadata = {};
  if(HDF5_MDATA === ''){
    var clean_metadata = {};
    // TODO: "Blocks are nested too deeply. (4)"
    for(did in AllMetadata){
      if(did in DATASET_NAME_BY_DID){
        clean_metadata[did] = AllMetadata[did];
        for(var mdname in AllMetadata[did] ){
          //console.log(mdname)
          if(AllMetadataNames.indexOf(mdname) == -1){
            AllMetadataNames.push(mdname);
          }
          if((mdname == 'latitude' && ! isNaN(AllMetadata[did].latitude)) || (mdname == 'longitude' && ! isNaN(AllMetadata[did].longitude))){
            if(did in DatasetsWithLatLong){
              if(mdname == 'latitude' ){
                DatasetsWithLatLong[did].latitude = +AllMetadata[did].latitude;
              }else{
                DatasetsWithLatLong[did].longitude = +AllMetadata[did].longitude;
              }
            }else{
              DatasetsWithLatLong[did]={};

              var pname = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;
              DatasetsWithLatLong[did].proj_dset = pname+'--'+DATASET_NAME_BY_DID[did];
              DatasetsWithLatLong[did].pid = PROJECT_ID_BY_DID[did];
              if(mdname == 'latitude'){
                DatasetsWithLatLong[did].latitude = +AllMetadata[did].latitude;
              }else{
                DatasetsWithLatLong[did].longitude = +AllMetadata[did].longitude;
              }
            }
          }
        }
      }
    }
  }else{
    for(did in DATASET_NAME_BY_DID){
      //console.log(did)
      //clean_metadata[did] = {}

      var mdgroup = HDF5_MDATA.openGroup(did+"/metadata");
      mdgroup.refresh();
      // TODO: "This function's cyclomatic complexity is too high. (8)"
      // TODO: "Don't make functions within a loop."
      Object.getOwnPropertyNames(mdgroup).forEach(function(mdname, idx, array) {
        if(mdname != 'id'){
          //console.log(mdname, group[mdname])
          //clean_metadata[did][mdname] = mdgroup[mdname]

          if(AllMetadataNames.indexOf(mdname) == -1){
            AllMetadataNames.push(mdname);
          }
          if(mdname == 'latitude' || mdname == 'longitude'){
            if(did in DatasetsWithLatLong){
              if(mdname == 'latitude'){
                // TODO: "Blocks are nested too deeply. (4)"
                DatasetsWithLatLong[did].latitude = +mdgroup[mdname];
              }else{
                DatasetsWithLatLong[did].longitude = +mdgroup[mdname];
              }
            }else{
              DatasetsWithLatLong[did]={};

              var pname = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;
              DatasetsWithLatLong[did].proj_dset = pname+'--'+DATASET_NAME_BY_DID[did];
              DatasetsWithLatLong[did].pid = PROJECT_ID_BY_DID[did];
              if(mdname == 'latitude'){
                // TODO: Column: 47 "Blocks are nested too deeply. (4)"
                DatasetsWithLatLong[did].latitude = +mdgroup[mdname];
              }else{
                DatasetsWithLatLong[did].longitude = +mdgroup[mdname];
              }
            }
          }


        }
      });
    }
  }


  AllMetadataNames.sort(function(a, b){
    return module.exports.compareStrings_alpha(a, b);
  });
  //console.log(AllMetadataNames)
  connection.query(queries.get_project_permissions(), function(err, rows, fields){
    //console.log(qSequenceCounts)
    if (err)  {
      console.log('Query error: ' + err);
      console.log(err.stack);
      process.exit(1);
    } else {
      module.exports.run_permissions_query(rows);
    }

    console.log(' UPDATING PERMISSIONS: "'+queries.get_project_permissions()+'"');
  });
};


module.exports.update_status = function(status_params) {
  console.log('in update_status');
  console.log(util.inspect(status_params, false, null));

  if (status_params.type === 'delete') {
    delete_status_params = [status_params.user_id, status_params.pid];
    statQuery = queries.MakeDeleteStatusQ();
    console.log('in update_status, after delete_status');
    connection.query(statQuery, delete_status_params, function(err, rows) {
      if(err) { console.log('ERROR1-in status update: ' + err);
      }
      else {
        console.log('in statQuery');
        console.log(util.inspect(rows, false, null));
      }
    });
  } else if(status_params.type == 'update') {
    statQuery2 = queries.MakeInsertStatusQ(status_params);
    // console.log('statQuery2: ' + statQuery2);
    connection.query(statQuery2, function(err, rows) {
      if(err) {
        console.log('ERROR2-in status update: ' + err);
      } else {
        console.log('status update2');
        console.log(util.inspect(rows, false, null));
      }
    });
  } else {  // Type::New
    statQuery1 = queries.MakeInsertStatusQ(status_params);
    // console.log('statQuery1: ' + statQuery1);
    connection.query(statQuery1 , function(err, rows) {
      if(err) {
        console.log('ERROR2-in status update: ' + err);
      } else {
        console.log('status update1');
        console.log(util.inspect(rows, false, null));
      }
    });
  } // Type::New
};

module.exports.fetchInfo = function (query, values, callback) {
  connection.query(query, values, function(err, rows) {
    if (err) {
      callback(err, null);
    }
    else
    {
      console.log('--- rows from fetchInfo ---');
      console.log(util.inspect(rows, false, null));

      callback(null, rows[0]);
    }
  });
};

//
//
//
/////////////////// EXPORTS ///////////////////////////////////////////////////////////////////////
module.exports.create_export_files = function (req, user_dir, ts, dids, file_tags, normalization, rank, domains, include_nas, compress) {
  var db = req.db;
  //file_name = 'fasta-'+ts+'_custom.fa.gz';
  var log = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'export_log.txt');
  //var log = path.join(user_dir, 'export_log.txt');
  if (normalization == 'max' || normalization == 'maximum' || normalization == 'normalized_to_maximum') {
    norm = 'normalized_to_maximum';
  } else if (normalization == 'percent' || normalization == 'frequency' || normalization == 'normalized_by_percent' ) {
    norm = 'normalized_by_percent';
  } else {
    norm = 'not_normalized';
  }

  var site = req.CONFIG.site;
  var code = 'NVexport';
  var pid_lookup = {};
  //console.log('dids', dids);
  export_cmd = 'vamps_export_data.py';
  for (n=0; n<dids.length; n++) {
    //console.log('did', dids[n]);
    pid_lookup[PROJECT_ID_BY_DID[dids[n]]] = 1;
  }

  var dids_str = JSON.stringify(dids.join(', '));
  var pids_str = JSON.stringify((Object.keys(pid_lookup)).join(', '));

  //console.log('pids', pids_str);
  //var file_tags = file_tags.join(' ')

  var export_cmd_options = {

    scriptPath : path.join(req.CONFIG.PATH_TO_NODE_SCRIPTS),
    args :       ['-s', site,
      '-u', req.user.username,
      '-r', ts,
      '-base', user_dir,
      '-dids', dids_str,
      '-pids', pids_str,
      '-norm', norm,
      '-rank', rank,
      '-db', NODE_DATABASE
    ] // '-compress'

  };
  for (var t in file_tags) {
    export_cmd_options.args.push(file_tags[t]);
  }
  if(compress){
    export_cmd_options.args.push('-compress');
  }
  if(domains != ''){
    export_cmd_options.args.push('-domains');
    export_cmd_options.args.push(JSON.stringify(domains.join(', ')));
  }
  console.log('include NAs',include_nas)
  if(include_nas == 'no'){
    export_cmd_options.args.push('-exclude_nas');
  }
  var cmd_list = [];
  cmd_list.push(path.join(export_cmd_options.scriptPath, export_cmd)+' '+export_cmd_options.args.join(' '));

  if (req.CONFIG.cluster_available === true) {
    qsub_script_text = this.get_qsub_script_text(log, req.CONFIG.TMP, site, code, cmd_list);
    qsub_file_name = req.user.username+'_qsub_export_'+ts+'.sh';
    qsub_file_path = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'tmp', qsub_file_name);
    console.log('RUNNING(via qsub):', cmd_list[0]);
    console.log('qsub_file_path:', qsub_file_path);
    fs.writeFile(qsub_file_path, qsub_script_text, function writeFile(err) {
      if (err) {
        return console.log(err);
      } else {
        console.log("The file was saved!");
        //console.log(qsub_script_text);
        fs.chmod(qsub_file_path, '0775', function chmodFile(err) {
          if (err) {
            return console.log(err);
          } else {
            var dwnld_process = spawn( qsub_file_path, {}, {
              env:{ 'PATH':req.CONFIG.PATH, 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
              detached: true,
              stdio:['pipe', 'pipe', 'pipe']
              //stdio: [ 'ignore', null, log ]
            });  // stdin, stdout, stderr1


          }
        });
      }
    });


  } else {
    console.log('No Cluster Available according to req.CONFIG.cluster_available');
    var cmd = path.join(export_cmd_options.scriptPath, export_cmd)+' '+export_cmd_options.args.join(' ');
    console.log('RUNNING:', cmd);
    //var log = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'tmp_log.log')
    var dwnld_process = spawn( path.join(export_cmd_options.scriptPath, export_cmd), export_cmd_options.args, {
      env:{ 'PATH':req.CONFIG.PATH, 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
      detached: true,
      stdio: ['pipe', 'pipe', 'pipe']  // stdin, stdout, stderr
    });
    stdout = '';
    dwnld_process.stdout.on('data', function dwnldProcessStdout(data) {
      stdout += data;
    });
    stderr = '';
    dwnld_process.stderr.on('data', function dwnldProcessOnData(data) {
      stderr += data;
    });
    dwnld_process.on('close', function dwnldProcessOnClose(code) {
      console.log('dwnld_process process exited with code ' + code);
      //console.log('stdout', stdout);
      //console.log('stderr', stderr);
      if (code === 0) {   // SUCCESS

      } else {
        console.log('ERROR', stderr);
        //res.send('Frequency Heatmap R Script Error:'+stderr);
      }
    });
  }

  return;

};

module.exports.get_local_script_text = function(code, cmd_list) {
  script_text = "#!/bin/sh\n\n";
  script_text += "# CODE:\t$code\n\n";
  script_text += 'TSTAMP=`date "+%Y%m%d%H%M%S"`'+"\n\n";
  script_text += 'echo -n "Hostname: "'+"\n";
  script_text += "hostname\n";
  script_text += 'echo -n "Current working directory: "'+"\n";
  script_text += "pwd\n\n";
  if(config.site == 'vamps' || config.site == 'vampsdev'){
    script_text += 'source /groups/vampsweb/'+config.site+'/seqinfobin/vamps_environment.sh\n\n'
  }
  for (var i in cmd_list) {
    script_text += cmd_list[i]+"\n\n";
  }
  return script_text;
};

module.exports.get_qsub_script_text = function(log, pwd, site, name, cmd_list) {
  /*
   #!/bin/sh
   # CODE:
   # source environment:\n";
   source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh
   TSTAMP=`date "+%Y%m%d%H%M%S"`'
   # . /usr/share/Modules/init/sh
   # export MODULEPATH=/usr/local/www/vamps/software/modulefiles
   # module load clusters/vamps
   cd "+pwd+"
   function status() {
   qstat -f
   }
   function submit_job() {
   cat<<END | qsub
   #!/bin/bash
   #$ -j y
   #$ -o "+log+"
   #$ -N "+name+"
   #$ -cwd
   #$ -V
   echo -n "Hostname: "
   hostname
   echo -n "Current working directory: "
   pwd
   source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh
   for (i in cmd_list) {
   cmd_list[i]
   }
   END
   }
   status
   submit_job
   */
  //### Create Cluster Script
  script_text = "#!/bin/bash\n\n";
  script_text += "# CODE:\t"+name+"\n\n";
  script_text += "# source environment:\n";
  script_text += "source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh\n\n";
  script_text += 'TSTAMP=`date "+%Y%m%d%H%M%S"`'+"\n\n";
  script_text += "# Loading Module didn't work when testing:\n";
  //$script_text .= "LOGNAME=test-output-$TSTAMP.log\n";
  script_text += ". /usr/share/Modules/init/sh\n";
  script_text += "export MODULEPATH=/usr/local/www/vamps/software/modulefiles\n";
  script_text += "module load clusters/vamps\n\n";
  script_text += "cd /groups/vampsweb/tmp\n\n";
  //script_text += "cd /groups/vampsweb/vampsdev_node_data/\n\n";
  //script_text += "cd "+pwd+"\n\n";
  //script_text += "mkdir "+pwd+"/gast\n\n";
  //script_text += "mkdir gast\n\n";
  //    script_text += "function status() {\n";
//     script_text += "   qstat -f\n";
//     script_text += "}\n\n";
  script_text += "function submit_job() {\n";
  script_text += "cat<<END | qsub\n";
  script_text += "#!/bin/bash\n";
  script_text += "#$ -j y\n";
  script_text += "#$ -o "+log+"\n";
  script_text += "#$ -N "+name+"\n";
  script_text += "#$ -cwd\n";
  script_text += "#$ -V\n";
  script_text += 'echo -n "Hostname: "'+"\n";
  script_text += "hostname\n";
  script_text += 'echo -n "qsub: Current working directory: "'+"\n";
  script_text += "pwd\n\n";
//     script_text += "source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh\n\n";
  for (var i in cmd_list) {
    script_text += cmd_list[i]+"\n";
  }
//
//     //script_text += "chmod 666 "+log+"\n";
//     //$script_text .= "sleep 120\n";   # for testing
  script_text += "END\n";
  script_text += "}\n";
//     script_text += "status\n";  //#  status will show up in export.out
  script_text += "submit_job\n";
  //##### END  create command

  return script_text;

};

module.exports.get_qsub_script_text_only = function(req, scriptlog, dir_path, cmd_name, cmd_list) {
  script_text = "#!/bin/bash\n"
  script_text += "# CODE:\t${cmd_name}\n"
  script_text += "# source environment:\n"
  script_text += "source /groups/vampsweb/"+req.CONFIG.site+"/seqinfobin/vamps_environment.sh\n\n"
  script_text += "TSTAMP=\`date +%Y%m%d%H%M%S\`\n\n"
  script_text += "# Loading Module didn work when testing:\n"
  script_text += ". /usr/share/Modules/init/sh\n"
  script_text += "export MODULEPATH=/usr/local/www/vamps/software/modulefiles\n"
  script_text += "module load clusters/vamps\n\n"
  script_text += "PATH=$PATH:"+req.CONFIG.PATH_TO_NODE_SCRIPTS+":"+path.join(req.CONFIG.PROCESS_DIR, '/public/scripts')+":"+req.CONFIG.GAST_SCRIPT_PATH+"\n"
  script_text += "echo \"PATH is \$PATH\"\n"

  for (var i in cmd_list) {
    script_text += cmd_list[i]+"\n";
  }

  console.log("script_text from get_qsub_script_text_only: ")
  console.log(util.inspect(script_text, false, null));
  return script_text;

};

module.exports.isLocal = function (req) {
  return !(req.CONFIG.dbhost == 'vampsdev' || req.CONFIG.dbhost == 'vampsdb');
};

module.exports.deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    if(fs.lstatSync(path).isFile()) {
      try {
        fs.unlinkSync(path);
      } catch(e){ console.log("Could not delete1: "+path) }
    }else{
      fs.readdirSync(path).forEach(function(file,index){
        var curPath = path + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) { // recurse
          module.exports.deleteFolderRecursive(curPath);
        } else { // delete file
          try {
            fs.unlinkSync(curPath);
          } catch(e){ console.log("Could not delete2: "+curPath) }
        }
      });
      try {
        fs.rmdirSync(path);
      } catch(e){ console.log("Could not delete3: "+path) }
    }
  }
};
//
//
//
module.exports.make_gast_script_txt = function(req, data_dir, project) {


  make_gast_script_txt = "";
  if (module.exports.is_local)
  {
    make_gast_script_txt += "export PERL5LIB="+app_root+"/public/scripts/gast\n"
    make_gast_script_txt += "PATH=$PATH:"+app_root+"/public/scripts/gast:"+req.CONFIG.GAST_SCRIPT_PATH+"\n"
    make_gast_script_txt += "touch "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n"
  }
  make_gast_script_txt += "ls "+data_dir+"/*"+file_suffix+" > "+data_dir+"/filenames.list\n"
  make_gast_script_txt += "# chmod 666 "+data_dir+"/filenames.list\n"
  make_gast_script_txt += "cd "+data_dir+"\n";

  make_gast_script_txt += "\n";
  make_gast_script_txt += "\n";
  make_gast_script_txt += `FILE_NUMBER=\`wc -l < ${data_dir}/filenames.list\``;
  make_gast_script_txt += "\n";

  make_gast_script_txt += "echo \"total files = $FILE_NUMBER\" >> "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n"

  make_gast_script_txt += "cat >"+data_dir+"/clust_gast_ill_"+project+".sh <<InputComesFromHERE\n"
  make_gast_script_txt += "#!/bin/bash\n";


  if (module.exports.is_local)
  {
    make_gast_script_txt += "\n";
    make_gast_script_txt += "for FASTA in "+data_dir+"/*"+file_suffix+"; do \n"
    make_gast_script_txt += "# INFILE=\\$(basename \\$FASTA)\n"
    make_gast_script_txt += "INFILE=\\$FASTA\n"
    make_gast_script_txt += "echo \"\\$INFILE\" >> "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n"
    make_gast_script_txt += "\n";
  }
  else
  {

    make_gast_script_txt += "#$ -S /bin/bash\n"
    make_gast_script_txt += "#$ -N clust_gast_ill_"+project+".sh\n"
    make_gast_script_txt += "# Giving the name of the output log file\n"
    make_gast_script_txt += "#$ -o "+data_dir+"/cluster.log\n"
    make_gast_script_txt += "#$ -j y\n"
    make_gast_script_txt += "# Send mail to these users\n"
    make_gast_script_txt += "#$ -M "+req.user.email+"\n"
    make_gast_script_txt += "# Send mail; -m as sends on abort, suspend.\n"
    make_gast_script_txt += "#$ -m as\n"
    make_gast_script_txt += "#$ -t 1-\${FILE_NUMBER##*( )}\n"
    make_gast_script_txt += "# Now the script will iterate $FILE_NUMBER times.\n"

    //make_gast_script_txt += "  . /xraid/bioware/Modules/etc/profile.modules\n"
    //make_gast_script_txt += "  module load bioware\n"
    //make_gast_script_txt += "  PATH=$PATH:"+app_root+"/public/scripts/gast:"+req.CONFIG.GAST_SCRIPT_PATH+"\n"
    make_gast_script_txt += "  source /groups//vampsweb/"+req.CONFIG.site+"/seqinfobin/vamps_environment.sh\n"
    make_gast_script_txt += "  echo \"===== $PATH ====\" >> "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n"

    make_gast_script_txt += "  LISTFILE="+data_dir+"/filenames.list\n"
    make_gast_script_txt += "  echo \"LISTFILE is \\$LISTFILE\" >> "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n";

    make_gast_script_txt += "\n";
    make_gast_script_txt += '  INFILE=\\`sed -n "\\${SGE_TASK_ID}p" \\$LISTFILE\\`';
  }

  make_gast_script_txt += "\n";
  make_gast_script_txt += "  echo \"=====\" >> "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n"
  make_gast_script_txt += "  echo \"file name is \\$INFILE\" >> "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n"
  make_gast_script_txt += "  echo '' >> "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n"
  make_gast_script_txt += "  echo \"SGE_TASK_ID = \\$SGE_TASK_ID\" >> "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n"
  make_gast_script_txt += "  echo '' >> "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n"
  make_gast_script_txt += "  echo \""+gast_script_path+"/gast_ill -saveuc -nodup "+full_option+" -in \\$INFILE -db "+gast_db_path+"/"+ref_db_name+".fa -rtax "+gast_db_path+"/"+ref_db_name+".tax -out \\$INFILE.gast -uc \\$INFILE.uc -threads 0\" >> "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n"

  make_gast_script_txt += "   "+gast_script_path+"/gast_ill -saveuc -nodup "+full_option+" -in \\$INFILE -db "+gast_db_path+"/"+ref_db_name+".fa -rtax "+gast_db_path+"/"+ref_db_name+".tax -out \\$INFILE.gast -uc \\$INFILE.uc -threads 0\n";
  make_gast_script_txt += "\n";

  if (module.exports.is_local)
  {
    make_gast_script_txt += "done\n";
  }
  make_gast_script_txt += "\n";
  make_gast_script_txt +=  "  chmod 666 "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n"
  make_gast_script_txt += "\n";
  make_gast_script_txt +=  "InputComesFromHERE\n"

  make_gast_script_txt +=  "echo \"Running clust_gast_ill_"+project+".sh\" >> "+data_dir+"/clust_gast_ill_"+project+".sh.sge_script.sh.log\n"

  make_gast_script_txt += "\n";
  make_gast_script_txt += "\n";

  if (module.exports.is_local)
  {
    // # TODO: make local version, iterate over (splited) files in LISTFILE instead of qsub
    make_gast_script_txt += "bash "+data_dir+"/clust_gast_ill_"+project+".sh\n";
  }
  else
  {
    make_gast_script_txt += "qsub -sync y "+data_dir+"/clust_gast_ill_"+project+".sh\n";
  }
  // qsub -cwd -sync y ${data_dir}/clust_gast_ill_${project}.sh`;

  make_gast_script_txt += "\n";
  // make_gast_script_txt += "touch " + path.join(data_dir, "TEMP.tmp");
  // make_gast_script_txt += "\n";
  return make_gast_script_txt
}

module.exports.filter_projects = function(req, prj_obj, filter_obj) {
  // 1 substring      name search
  // 2 env            search PROJECT_INFORMATION_BY_PID
  // 3 target         name search
  // 4 portal         helpers.get_portal_projects()
  // 5 public_private search PROJECT_INFORMATION_BY_PID
  // 6 metadata       helpers.get_PTREE_metadata
  //console.log(PROJECT_INFORMATION_BY_PID)
  //console.log('IN FilterProjects')
  //console.log(prj_obj, filter_obj)

  // SUBSTRING
  var NewPROJECT_TREE_OBJ1 = []

  if(filter_obj.substring == '' || filter_obj.substring === '.....'){
    NewPROJECT_TREE_OBJ1 = prj_obj
  }else{
    //console.log('Filtering for SUBSTRING')
    prj_obj.forEach(function(prj) {
      if(prj.hasOwnProperty('name')){
        ucname = prj.name.toUpperCase();
      }else{
        ucname = prj.project.toUpperCase();
      }
      if(ucname.indexOf(filter_obj.substring) != -1){
        NewPROJECT_TREE_OBJ1.push(prj);
      }
    });

  }

  // ENV
  var NewPROJECT_TREE_OBJ2 = []
  if(filter_obj.env.length == 0 || filter_obj.env[0] === '.....'){  // should ALWAYS BE A LIST
    NewPROJECT_TREE_OBJ2 = NewPROJECT_TREE_OBJ1
  }else{
    //console.log('Filtering for ENV')
    NewPROJECT_TREE_OBJ1.forEach(function(prj) {
      if(filter_obj.env.indexOf(parseInt(PROJECT_INFORMATION_BY_PID[prj.pid].env_package_id)) != -1){
        NewPROJECT_TREE_OBJ2.push(prj);
      }
    });

  }

  // TARGET
  var NewPROJECT_TREE_OBJ3 = []
  if(filter_obj.target == '' || filter_obj.target === '.....'){
    NewPROJECT_TREE_OBJ3 = NewPROJECT_TREE_OBJ2
  }else{
    //console.log('Filtering for TARGET')
    NewPROJECT_TREE_OBJ2.forEach(function(prj) {
      if(prj.hasOwnProperty('name')){
        pparts = prj.name.split('_');
      }else{
        pparts = prj.project.split('_');
      }
      last_el = pparts[pparts.length - 1]
      if(filter_obj.target === 'ITS' && last_el.substring(0,3) === 'ITS'){
        NewPROJECT_TREE_OBJ3.push(prj);
      }else if(last_el === filter_obj.target){
        NewPROJECT_TREE_OBJ3.push(prj);
      }
    });

  }
  // PORTAL
  var NewPROJECT_TREE_OBJ4 = []
  if(filter_obj.portal == '' || filter_obj.portal === '.....'){
    NewPROJECT_TREE_OBJ4 = NewPROJECT_TREE_OBJ3
  }else{
    //console.log('Filtering for PORTAL')
    portal = req.CONSTS.PORTALS[filter_obj.portal]
    NewPROJECT_TREE_OBJ3.forEach(function(prj) {
      if(prj.hasOwnProperty('name')){
        pname = prj.name
      }else{
        pname = prj.project
      }
      pparts = pname.split('_');
      prefix = pparts[0]
      suffix = pparts[pparts.length - 1]
      if(portal.prefixes.indexOf(prefix) != -1 || portal.projects.indexOf(pname) != -1 || portal.suffixes.indexOf(suffix) != -1){
        NewPROJECT_TREE_OBJ4.push(prj);
      }

    });

  }

  // public/private
  var NewPROJECT_TREE_OBJ5 = []
  if(filter_obj.public == '-1'){
    NewPROJECT_TREE_OBJ5 = NewPROJECT_TREE_OBJ4
  }else{
    //console.log('Filtering for PRIVACY')
    NewPROJECT_TREE_OBJ4.forEach(function(prj) {
      if(PROJECT_INFORMATION_BY_PID[prj.pid].public === parseInt(filter_obj.public)){
        NewPROJECT_TREE_OBJ5.push(prj);
      }
    });
  }

  // METADATA1
  var NewPROJECT_TREE_OBJ6 = []
  if(filter_obj.metadata1 == '' || filter_obj.metadata1 === '.....'){
    NewPROJECT_TREE_OBJ6 = NewPROJECT_TREE_OBJ5
  }else{
    NewPROJECT_TREE_OBJ6 = module.exports.get_PTREE_metadata(NewPROJECT_TREE_OBJ5, filter_obj.metadata1)
  }
  // METADATA2
  var NewPROJECT_TREE_OBJ7 = []
  if(filter_obj.metadata2 == '' || filter_obj.metadata2 === '.....'){
    NewPROJECT_TREE_OBJ7 = NewPROJECT_TREE_OBJ6
  }else{
    NewPROJECT_TREE_OBJ7 = module.exports.get_PTREE_metadata(NewPROJECT_TREE_OBJ6, filter_obj.metadata2)
  }
  // METADATA1
  var NewPROJECT_TREE_OBJ8 = []
  if(filter_obj.metadata3 == '' || filter_obj.metadata3 === '.....'){
    NewPROJECT_TREE_OBJ8 = NewPROJECT_TREE_OBJ7
  }else{
    NewPROJECT_TREE_OBJ8 = module.exports.get_PTREE_metadata(NewPROJECT_TREE_OBJ7, filter_obj.metadata3)
  }


  var new_obj = NewPROJECT_TREE_OBJ8
  //console.log('new_obj')
  //console.log(new_obj)
  return new_obj

}
// Validates that the input string is a valid date formatted as "mm/dd/yyyy"
module.exports.isValidMySQLDate = function(dateString){
  // First check for the pattern
  //if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
  //    return false;
  if(!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(dateString))
    return false;
  // Parse the date parts to integers
  var parts = dateString.split("-");
  var year = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10);
  var day = parseInt(parts[2], 10);

  // Check the ranges of month and year
  if(year < 1000 || year > 3000 || month == 0 || month > 12)
    return false;

  var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

  // Adjust for leap years
  if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
    monthLength[1] = 29;

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
};
//
//
//
module.exports.run_external_command = function(script_path)
{
  console.log('in helpers.run_external_command()')
  console.log(script_path)
  var exec = require('child_process').exec;
  var child = exec(script_path);
  var output = '';

  child.stdout.on('data', function AddDataToOutput(data) {
    data = data.toString().trim();
    output += data;
    //CheckIfPID(data);
  });


  child.stderr.on('data', function(data) {
    console.log('stdout: ' + data);
  });

  child.on('close', function checkExitCode(code) {
    console.log('From run_external_command process exited with code ' + code);
    var ary = output.split("\n");

    var last_line = ary[ary.length - 1];
    console.log('last_line:', last_line);
    if (code === 0)
    {
      //callback_function(callback_function_options, last_line);
    }
    else // code != 0
    {
      console.log('FAILED',script_path)
      //failedCode(req, res, path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-' + project), project, last_line);
    }
  });


}
module.exports.required_metadata_ids_from_names = function(selection_obj, mdname)
{
  // TODO
  var idname,value
  if(mdname == 'env_package'){
    idname = 'env_package_id'
    value = MD_ENV_PACKAGE[selection_obj[idname]]
  }else if(mdname == 'env_biome'){
    idname = 'env_biome_id'
    value = MD_ENV_TERM[selection_obj[idname]]
  }else if(mdname == 'env_feature'){
    idname = 'env_feature_id'
    value = MD_ENV_TERM[selection_obj[idname]]
  }else if(mdname == 'env_material'){
    idname = 'env_material_id'
    value = MD_ENV_TERM[selection_obj[idname]]
  }else if(mdname == 'geo_loc_name'){
    idname = 'geo_loc_name_id'
    value = MD_ENV_TERM[selection_obj[idname]]
  }else if(mdname == 'sequencing_platform'){
    idname = 'sequencing_platform_id'
    value = MD_SEQUENCING_PLATFORM[selection_obj[idname]]
  }else if(mdname == 'dna_region'){
    idname = 'dna_region_id'
    value = MD_DNA_REGION[selection_obj[idname]]
  }else if(mdname == 'target_gene'){
    idname = 'target_gene_id'
    value = MD_TARGET_GENE[selection_obj[idname]]
  }else if(mdname == 'domain'){
    idname = 'domain_id'
    value = MD_DOMAIN[selection_obj[idname]]
  }else if(mdname == 'adapter_sequence'){
    idname = 'adapter_sequence_id'
    value = MD_ADAPTER_SEQUENCE[selection_obj[idname]]
  }else if(mdname == 'illumina_index'){
    idname = 'illumina_index_id'
    value = MD_ILLUMINA_INDEX[selection_obj[idname]]
  }else if(mdname == 'run'){
    idname = 'run_id'
    value = MD_RUN[selection_obj[idname]]
  }else if(mdname == 'primer_suite'){
    idname = 'primer_suite_id'
    if(MD_PRIMER_SUITE.hasOwnProperty(selection_obj[idname]) && MD_PRIMER_SUITE[selection_obj[idname]].hasOwnProperty('name')){
      value = MD_PRIMER_SUITE[selection_obj[idname]].name
    }else{
      value = 'unknown'
    }
  }else{
    idname = mdname
    value = selection_obj[mdname];
  }
  // eg: { name: 'primer_suite_id', value: 'Bacterial V6 Suite' } or { name: 'domain_id', value: 'Bacteria' }
  return {"name":idname, "value":value}
};

module.exports.required_metadata_names_from_ids = function(selection_obj, name_id)
{
  var id = selection_obj[name_id];
  var real_name, value;
  if(name_id == 'env_package_id'){
    real_name = 'env_package';
    value = MD_ENV_PACKAGE[id];
  }else if(name_id == 'target_gene_id'){
    real_name = 'target_gene';
    value = MD_TARGET_GENE[id];
  }else if(name_id == 'domain_id'){
    real_name = 'domain';
    value = MD_DOMAIN[id];
  }else if(name_id == 'geo_loc_name_id'){
    real_name = 'geo_loc_name';
    value = MD_ENV_TERM[id];
  }else if(name_id == 'sequencing_platform_id'){
    real_name = 'sequencing_platform';
    value = MD_SEQUENCING_PLATFORM[id];
  }else if(name_id == 'dna_region_id'){
    real_name = 'dna_region';
    value = MD_DNA_REGION[id];
  }else if(name_id == 'env_material_id'){
    real_name = 'env_material';
    value = MD_ENV_TERM[id];
  }else if(name_id == 'env_biome_id'){
    real_name = 'env_biome';
    value = MD_ENV_TERM[id]
  }else if(name_id == 'env_feature_id'){
    real_name = 'env_feature';
    value = MD_ENV_TERM[id];
  }else if(name_id == 'adapter_sequence_id'){
    real_name = 'adapter_sequence';
    value = MD_ADAPTER_SEQUENCE[id];
  }else if(name_id == 'illumina_index_id'){
    real_name = 'illumina_index';
    value = MD_ILLUMINA_INDEX[id];
  }else if(name_id == 'run_id'){
    real_name = 'run';
    value = MD_RUN[id];
  }else if(name_id == 'primer_suite_id'){
    real_name = 'primer_suite';
    //value = MD_PRIMER_SUITE[id]
    if(MD_PRIMER_SUITE.hasOwnProperty(id) && MD_PRIMER_SUITE[id].hasOwnProperty('name')){
      value = MD_PRIMER_SUITE[id].name;
    }else{
      value = 'unknown';
    }
  }else{
    real_name = name_id;
    value = id;
  }
  // eg: { name: 'primer_suite', value: 'Bacterial V6 Suite' } or { name: 'domain', value: 'Bacteria' }
  return {"name":real_name,"value":value}

};
//
//
//
module.exports.get_metadata_obj_from_dids = function(dids){
    var metadata = {}
    for(n in dids){
        metadata[dids[n]] = {}
        mdobj = AllMetadata[dids[n].toString()]
        for(key in mdobj){
           md = helpers.required_metadata_names_from_ids(mdobj, key)
           metadata[dids[n]][md.name] = md.value
        }
    }
    //console.log(metadata)
    return metadata
}
//
//
module.exports.screen_dids_for_permissions = function(req, dids)
{
  // This is called from unit_select and view_select (others?)  to catch and remove dids that
  // are found through searches such as geo_search and go to unit_select directly
  // bypassing the usual tree filter 'filter_project_tree_for_permissions' (fxn above)
  // permissions are in PROJECT_INFORMATION_BY_PID
  var new_did_list = []
  for(i in dids){
    if(PROJECT_ID_BY_DID.hasOwnProperty(dids[i]) && PROJECT_INFORMATION_BY_PID.hasOwnProperty(PROJECT_ID_BY_DID[dids[i]])){
      pinfo = PROJECT_INFORMATION_BY_PID[ PROJECT_ID_BY_DID[dids[i]] ]
      if(pinfo.public == 1 || pinfo.public == '1'){
        new_did_list.push(dids[i])
      }else{
        // allow if user is owner (should have uid in permissions but check anyway)
        // allow if user is admin
        // allow if user is in pinfo.permission
        if(req.user.user_id == pinfo.oid || req.user.security_level <= 10 || pinfo.permissions.indexOf(req.user.user_id) != -1 ){
          new_did_list.push(dids[i])
        }
      }
    }
  }
  return new_did_list
};

module.exports.unique_array = function(myArray)
{
  var uSet = new Set(myArray);
  return [...uSet];
};

