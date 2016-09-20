var CONSTS = require(app_root + '/public/constants');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var queries = require('../queries');
var util = require('util');
var path  = require('path');
var crypto = require('crypto');
var mysql = require('mysql2');
var spawn = require('child_process').spawn;

module.exports = {
  // route middleware to make sure a user is logged in
  isLoggedIn: function (req, res, next) {
      // if user is authenticated in the session, carry on

      if (req.isAuthenticated()) {
        console.log("Hurray! isLoggedIn.req.isAuthenticated:",req.user.username);
        return next();
      }
      // if they aren't redirect them to the home page
      console.log("Oops! NOT isLoggedIn.req.isAuthenticated");
      // save the url in the session
      req.session.returnTo = req.originalUrl;
      req.flash('loginMessage', 'Please login or register before continuing.');
      res.redirect('/users/login');
      return;
  },

  // route middleware to make sure a user is an aministrator
  isAdmin: function (req, res, next) {

      if (req.user.security_level === 1) {
        console.log("Hurray! USER is an Admin:",req.user.username);
        return next();
      }
      // if they aren't redirect them to the home page
      console.log("Whoa! NOT an Admin: ",req.user.username);
      // save the url in the session
      req.session.returnTo = req.path;
      //console.log('URL Requested: '+JSON.stringify(req));
      //console.log(util.inspect(req, {showHidden: false, depth: null}));
      req.flash('message', 'The page you are trying to access is for VAMPS admins only.');
      res.redirect('/');
      return;
  }

};

/** Benchmarking
* Usage:
    var helpers = require('../helpers/helpers');

    helpers.start = process.hrtime();
    some code
    helpers.elapsed_time("This is the running time for some code");
*/

module.exports.start = process.hrtime();

module.exports.elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(module.exports.start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(module.exports.start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
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
  req.flash('errorMessage', msg);
  res.render('error',
    { title :  'Fail',
      message : req.flash('errorMessage'),
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
module.exports.run_select_sequences_query = function(rows){
        for (var i=0; i < rows.length; i++) {
        //console.log(rows[i].project_id);
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
        console.log('query ok1 '+JSON.stringify(rows1));   // queries.get_select_datasets_queryPID
        console.log('query ok2 '+JSON.stringify(rows2));  // queries.get_select_sequences_queryPID
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
        var silvaTaxonomy = require('../../models/silva_taxonomy');
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
// module.exports.update_metadata_from_file = function (){
//     var meta_file      = path.join(process.env.PWD,'public','json',NODE_DATABASE+'--metadata.json');
//     try {
//       AllMetadata        = require(meta_file);
//     }
//     catch (e) {
//       console.log(e);
//       AllMetadata = {};
//     }
// };
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
  console.log('ALL_DATASETS--get_public_projects', ALL_DATASETS);
  //console.log(JSON.stringify(basis))
  ALL_DATASETS.projects.forEach(function(prj) {

  var pinfo = PROJECT_INFORMATION_BY_PID[prj.pid];
        //var public = pinfo.public
        if(pinfo.public == 1){
            projects.push(pinfo);
        }

  });

  console.log('INFO', projects);
  return projects;

};

module.exports.get_attributes_from_hdf5_group =function(did, type) {
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
  project_list = [];

    OBJ.forEach(function(prj) {
      dids = DATASET_IDS_BY_PID[prj.pid];
      for (var i in dids){
        var did = dids[i];
        var mdgroup = HDF5_MDATA.openGroup(did+"/metadata");
        mdgroup.refresh();
        //console.log(q, mdgroup[q])
        if(mdgroup.hasOwnProperty(q) && project_list.indexOf(prj) < 0){
          //console.log(prj);x
          project_list.push(prj);
        }
      }
    });
    return project_list;
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

// mysql queries

// TODO: Column: 52 "This function's cyclomatic complexity is too high. (20)"
module.exports.run_select_datasets_query = function(rows){
    var pids         = {};
    var titles       = {};
    var datasetsByProject = {};
    for (var i=0; i < rows.length; i++) {
          var project = rows[i].project;
          var did = rows[i].did;
          var dataset = rows[i].dataset;
          var dataset_description = rows[i].dataset_description;
          var pid = rows[i].pid;
          var public = rows[i].public;
          var owner_id = rows[i].owner_user_id;

          PROJECT_ID_BY_DID[did]=pid;

          PROJECT_INFORMATION_BY_PID[pid] = {
            "last" :            rows[i].last_name,
            "first" :            rows[i].first_name,
            "username" :        rows[i].username,
            "oid" :             owner_id,
            "email" :            rows[i].email,
            "env_source_name" : rows[i].env_source_name,
            "env_source_id" :   rows[i].env_sample_source_id,
            "institution" :      rows[i].institution,
            "project" :          project,
            "pid" :              pid,
            "title" :            rows[i].title,
            "description" :      rows[i].project_description,
            "public" :          rows[i].public,
          };
          if(public || rows[i].username === 'guest'){
            PROJECT_INFORMATION_BY_PID[pid].permissions = [];  // PUBLIC
          }else{
            PROJECT_INFORMATION_BY_PID[pid].permissions = [owner_id]; // initially has only project owner_id
          }
          PROJECT_INFORMATION_BY_PNAME[project] =  PROJECT_INFORMATION_BY_PID[pid];

          if(pid in DATASET_IDS_BY_PID){
            DATASET_IDS_BY_PID[pid].push(did);
          }else{
            DATASET_IDS_BY_PID[pid]=[];
            DATASET_IDS_BY_PID[pid].push(did);
          }
          pids[project] = pid;
          titles[project] = rows[i].title;

          DATASET_NAME_BY_DID[did] = dataset;


          if (project === undefined){ continue; }
          if (project in datasetsByProject){
              datasetsByProject[project].push({ did:did, dname:dataset, ddesc: dataset_description});
          } else {
              datasetsByProject[project] =   [{ did:did, dname:dataset, ddesc: dataset_description }];
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
              if(mdname == 'latitude' || mdname == 'longitude'){

                if(did in DatasetsWithLatLong){
                  if(mdname == 'latitude'){
                    DatasetsWithLatLong[did].latitude = AllMetadata[did].latitude;
                  }else{
                    DatasetsWithLatLong[did].longitude = AllMetadata[did].longitude;
                  }
                }else{
                  DatasetsWithLatLong[did]={};

                  var pname = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;
                  DatasetsWithLatLong[did].proj_dset = pname+'--'+DATASET_NAME_BY_DID[did];
                  DatasetsWithLatLong[did].pid = PROJECT_ID_BY_DID[did];
                  if(mdname == 'latitude'){
                    DatasetsWithLatLong[did].latitude = AllMetadata[did].latitude;
                  }else{
                    DatasetsWithLatLong[did].longitude = AllMetadata[did].longitude;
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
                        DatasetsWithLatLong[did].latitude = mdgroup[mdname];
                      }else{
                        DatasetsWithLatLong[did].longitude = mdgroup[mdname];
                      }
                    }else{
                      DatasetsWithLatLong[did]={};

                      var pname = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;
                      DatasetsWithLatLong[did].proj_dset = pname+'--'+DATASET_NAME_BY_DID[did];
                      DatasetsWithLatLong[did].pid = PROJECT_ID_BY_DID[did];
                      if(mdname == 'latitude'){
                        // TODO: Column: 47 "Blocks are nested too deeply. (4)"
                        DatasetsWithLatLong[did].latitude = mdgroup[mdname];
                      }else{
                        DatasetsWithLatLong[did].longitude = mdgroup[mdname];
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

      console.log(' UPDATING PERMISSIONS: '+queries.get_project_permissions());
    });
};


module.exports.update_status = function(status_params) {
  console.log('in update_status');
  console.log(util.inspect(status_params, false, null));

  if (status_params.type === 'delete') {
    delete_status_params = [status_params.user_id, status_params.project];
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
    statQuery2 = queries.MakeUpdateStatusQ(status_params);
    console.log('statQuery2: ' + statQuery2);
    connection.query(statQuery2, function(err, rows) {
      if(err) {
        console.log('ERROR2-in status update: ' + err);
      } else {
        console.log('status update2');
        console.log(util.inspect(rows, false, null));
      }
    });
  } else {  // Type::New
      // TODO? INSERT INTO table (id, name, age) VALUES(1, "A", 19) ON DUPLICATE KEY UPDATE
      // name="A", age=19
    statQuery1 = queries.MakeInsertStatusQ(status_params);
    console.log('statQuery1: ' + statQuery1);
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
module.exports.create_export_files = function (req, user_dir, ts, dids, file_tags, normalization, rank, domains, compress) {
      var db = req.db;
    //file_name = 'fasta-'+ts+'_custom.fa.gz';
    var log = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'export_log.txt');
    //var log = path.join(user_dir, 'export_log.txt');
    if (normalization == 'max' || normalization == 'maximum' || normalization == 'normalized_to_maximum') {
        norm = 'normalized_to_maximum';
    } else if (normalization == 'percent') {
        norm = 'normailzed_by_percent';
    } else {
        norm = 'not_normalized';
    }

    var site = req.CONFIG.site;
    var code = 'NVexport';
    var pid_lookup = {};
    console.log('dids', dids);
    export_cmd = 'vamps_export_data.py';
    for (n=0;n<dids.length;n++) {
        console.log('did', dids[n]);
        pid_lookup[PROJECT_ID_BY_DID[dids[n]]] = 1;
    }

    var dids_str = JSON.stringify(dids.join(', '));
    var pids_str = JSON.stringify((Object.keys(pid_lookup)).join(', '));
    
    console.log('pids', pids_str);
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
    var cmd_list = [];
    cmd_list.push(path.join(export_cmd_options.scriptPath, export_cmd)+' '+export_cmd_options.args.join(' '));

    if (req.CONFIG.cluster_available === true) {
            qsub_script_text = get_qsub_script_text(log, req.CONFIG.TMP, site, code, cmd_list);
            qsub_file_name = req.user.username+'_qsub_export_'+ts+'.sh';
            qsub_file_path = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'tmp', qsub_file_name);

            fs.writeFile(qsub_file_path, qsub_script_text, function writeFile(err) {
                if (err) {
                    return console.log(err);
                } else {
                    console.log("The file was saved!");

                    console.log(qsub_script_text);
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

module.exports.get_local_script_text = function(log, site, code, cmd_list) {
    script_text = "#!/bin/sh\n\n";
    script_text += "# CODE:\t$code\n\n";
    script_text += 'TSTAMP=`date "+%Y%m%d%H%M%S"`'+"\n\n";
    script_text += 'echo -n "Hostname: "'+"\n";
    script_text += "hostname\n";
    script_text += 'echo -n "Current working directory: "'+"\n";
    script_text += "pwd\n\n";
    for (var i in cmd_list) {
        script_text += cmd_list[i]+"\n\n";
    }
    return script_text;
};