var C       = require(app_root + '/public/constants');
var queries = require(app_root + '/routes/queries');
const config  = require(app_root + '/config/config');

var express     = require('express');
var router      = express.Router();
var fs          = require('fs-extra');
var nodemailer  = require('nodemailer');
var transporter = nodemailer.createTransport({});
var util        = require('util');
var path        = require('path');
//var crypto = require('crypto');
var mysql       = require('mysql2');
var spawn       = require('child_process').spawn;

// module.exports = {
// route middleware to make sure a user is logged in
module.exports.isLoggedIn = function (req, res, next) {
  // if user is authenticated in the session, carry on

  if (req.isAuthenticated()) {
    console.log(module.exports.log_timestamp());
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

// module.exports.isLoggedInAPI = function(req, res) {
//   if (req.isAuthenticated()) {
//     console.log("Hurray! API User isLoggedInAPI.req.isAuthenticated:", req.user.username);
//     return true;
//   }else{
//     console.log("Oops! NOT isLoggedIn.req.isAuthenticated");
//     return false;
//   }
//   
// };
// route middleware to make sure a user is an aministrator

module.exports.isAdmin = function (req, res, next) {
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

module.exports.array_from_object = function (data) {
  var data_arr = [];
  for (var key in data) {
    var value_arr = {};
    if (typeof data[key] === 'object') {
      value_arr = data[key];
    }
    else {
      value_arr = [data[key]];
    }
    // value_arr.unshift(key);

    value_arr = [key].concat(value_arr);
    data_arr.push(value_arr);
  }
  return data_arr;
};

module.exports.get_second = function (element) {
  console.time('TIME: get_second');

  for (var met_names_row in C.ORDERED_METADATA_NAMES) {
    if (C.ORDERED_METADATA_NAMES[met_names_row].includes(element)) {
      // console.log('ETET met_names_row[1]');
      // console.log(C.ORDERED_METADATA_NAMES[met_names_row][1]);
      return C.ORDERED_METADATA_NAMES[met_names_row][1];
    }
  }
  console.timeEnd('TIME: get_second');
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
  var file_formats    = C.download_file_formats;
  var file_first_part = filename.split('-')[0];
  return file_formats.indexOf(file_first_part) !== -1;
}

function get_user_dirname(dirname) {
  var dirname_arr = dirname.split('/');
  return dirname_arr[dirname_arr.length - 1];
}

function get_sizer_and_filesize(size) {
  var fileSize = (size).toFixed(1);
  var sizer    = 'Bytes';
  if (size > 1000) {
    fileSize = (size / 1000.0).toFixed(1);
    sizer    = 'KB';
  }
  if (size > 1000000) {
    fileSize = (size / 1000000.0).toFixed(1);
    sizer    = 'MB';
  }
  if (size > 1000000000) {
    fileSize = (size / 1000000000.0).toFixed(1);
    sizer    = 'GB';
  }
  return [fileSize, sizer];
}

function format_time(mtime) {
  return mtime.toString().split(" ").slice(1, 5).join(" ");
  // mtime.toString().split();
  //Mon Jul 24 2017 16:43:56 GMT-0400 (EDT)
  // .toISOString().replace(/T/,' ').replace(/\..+/, '');
  // .replace(/T/,' ').replace(/.000Z$/,'');
  // .toString();
}

function walk_recursively(dir, done) {
// var file_formats = C.download_file_formats;
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function (file) {
      file = path.resolve(dir, file);
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walk_recursively(file, function (err, res) {
            results = results.concat(res);
            if (!--pending) {
              done(null, results);
            }
          });
        } else {
          var filename = path.basename(file);

          if (check_file_formats(filename)) {
            var sizer_and_filesize = get_sizer_and_filesize(stat.size);
            results.push({
              'filename': filename,
              // 'size': stat.size,
              'fileSize': sizer_and_filesize[0],
              'sizer': sizer_and_filesize[1],
              'time': stat.mtime,
              'mtime_format': format_time(stat.mtime),
              'user_dirname': get_user_dirname(path.dirname(file))
            });
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

module.exports.walk = function (dir, done) {
  walk_recursively(dir, done);
};

function walk_sync_recursive(dir) {
  var results = [];
  var list    = fs.readdirSync(dir);
  list.forEach(function (file) {
    file     = path.resolve(dir, file);
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk_sync_recursive(file));
    }
    else {
      var filename = path.basename(file);

      if (check_file_formats(filename)) {
        results.push({
          'filename': filename,
          'size': stat.size,
          'time': stat.mtime,
          'mtime_format': format_time(stat.mtime),
          'user_dirname': get_user_dirname(path.dirname(file))
        });
      }
    }
  });
  return results;
}

module.exports.walk_sync = function (dir) {
  return walk_sync_recursive(dir);
};

module.exports.elapsed_time = function (note) {
  var precision = 3; // 3 decimal places
  var elapsed   = process.hrtime(module.exports.start)[1] / 1000000; // divide by a million to get nano to milli
  console.log(process.hrtime(module.exports.start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note);
};

var ranks = C.RANKS;

// todo: use in file instead of those in the class
module.exports.check_if_rank = function (field_name) {
  // ranks = ["domain","phylum","klass","order","family","genus","species","strain"]
  return ranks.indexOf(field_name) > -1;
};

module.exports.render_error_page = function (req, res, msg) {
  req.flash('fail', msg);
  res.render('error',
    {
      title: 'Fail',
      user: req.user.username
    });
};

module.exports.clear_file = function (fileName) {
  fs.openSync(fileName, "w");
};

module.exports.append_to_file = function (fileName, text) {
  fs.appendFileSync(fileName, text);
};

module.exports.write_to_file = function (fileName, text) {
  fs.writeFile(fileName, text, function (err) {
    if (err) {
      throw err;
    } else {

    }
  });
};
module.exports.getRandomInt  = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.isInt        = function (value) {
  return !isNaN(value) && (function (x) {
    return (x | 0) === x;
  })(parseFloat(value));
};

module.exports.IsJsonString = function (str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

module.exports.onlyUnique = function (value, index, self) {
  // usage: ukeys = ukeys.filter(helpers.onlyUnique);
  return self.indexOf(value) === index;
};

module.exports.mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch (e) {
    if (e.code != 'EEXIST') throw e;
  }
};

module.exports.fileExists = function (path) {
  try {
    return fs.statSync(path).isFile() || fs.statSync(path).isDirectory();
  }
  catch (err) {
    return false;
  }
};

module.exports.reverseString = function (str) {
  var out_str = '';
  for (var i = str.length - 1; i >= 0; i--) {
    out_str += str[i];
  }
  return out_str;
}

module.exports.send_mail = function (mail_info) {
  var to_addr   = mail_info.addr;
  var from_addr = mail_info.from;
  var subj      = mail_info.subj;
  var msg       = mail_info.msg;
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

module.exports.get_select_custom_units_query = function (rows) {
  console.time("TIME: get_select_custom_units_query");
  for (var i = 0; i < rows.length; i++) {
    var project_id  = rows[i]["project_id"];
    var field_name  = rows[i]["field_name"];
    var field_units = rows[i]["field_units"];

    if (!MD_CUSTOM_UNITS.hasOwnProperty(project_id)) {
      MD_CUSTOM_UNITS[project_id] = {};
    }
    MD_CUSTOM_UNITS[project_id][field_name] = field_units;

    if (!MD_CUSTOM_FIELDS_UNITS.hasOwnProperty(field_name)) {
      MD_CUSTOM_FIELDS_UNITS[field_name] = {};
    }
    MD_CUSTOM_FIELDS_UNITS[field_name] = field_units;
  }
  console.timeEnd("TIME: get_select_custom_units_query");
};

function make_pid_by_did_dict(rows) {
  var p_d = [];
  for (var r in rows) {
    var d_id  = rows[r]['dataset_id'];
    var p_id  = rows[r]['project_id'];
    p_d[d_id] = p_id;
  }
  return p_d;
}

//add the same check to PROJECT_ID_BY_DID creation elsewhere
module.exports.get_select_seq_counts_query = function (rows) {
  console.time("TIME: get_select_seq_counts_query");
  // console.log(Object.values(PROJECT_ID_BY_DID));
  connection.query('SELECT dataset_id, project_id from dataset', function (err, rows2, fields) {

    console.time("TIME: make_pid_by_did_dict");
    //instead it's better to use PROJECT_ID_BY_DID after it's initialized
    var pid_by_did_dict = [];
    if (Object.keys(PROJECT_ID_BY_DID).length > 0) {
      pid_by_did_dict = PROJECT_ID_BY_DID;
    }
    else {
      pid_by_did_dict = make_pid_by_did_dict(rows2);
    }
    console.timeEnd("TIME: make_pid_by_did_dict");

    for (var i = 0; i < rows.length; i++) {
      var did = rows[i].dataset_id;
      var pid = pid_by_did_dict[did];
      //console.log('rows[i].project_id in run_select_sequences_query');
      // var pid                 = rows[i].project_id;
      var count               = rows[i].seq_count;
      var cid                 = rows[i].classifier_id;
      ALL_DCOUNTS_BY_DID[did] = parseInt(count);
      if (ALL_CLASSIFIERS_BY_CID.hasOwnProperty(cid)) {
        ALL_CLASSIFIERS_BY_PID[pid] = ALL_CLASSIFIERS_BY_CID[cid];
      }
      if (pid in ALL_PCOUNTS_BY_PID) {
        ALL_PCOUNTS_BY_PID[pid] += parseInt(count);
      } else {
        ALL_PCOUNTS_BY_PID[pid] = parseInt(count);
      }
    }
    // console.log("ALL_PCOUNTS_BY_PID: ");
    // console.log(ALL_PCOUNTS_BY_PID);
    // make_counts_globals(rows, pid_by_did_dict);

  });
  console.timeEnd("TIME: get_select_seq_counts_query");

};

module.exports.run_ranks_query = function (rank, rows) {
  for (var i = 0; i < rows.length; i++) {
    var id                      = rows[i][rank + '_id'];
    var name                    = rows[i][rank];
    RANK_ID_BY_NAME[rank][name] = id;
  }
};

module.exports.get_select_env_term_query            = function (rows) {
  for (var i = 0; i < rows.length; i++) {
    var ont = rows[i].ont;
    if (ont == 'ENVO') {
      MD_ENV_ENVO[rows[i].term_id] = rows[i].term_name;
    } else if (ont == 'CTY') {
      MD_ENV_CNTRY[rows[i].term_id] = rows[i].term_name;
    } else if (ont == 'LZC') {
      MD_ENV_LZC[rows[i].term_id] = rows[i].term_name;
    }


  }
};
module.exports.get_select_env_package_query         = function (rows) {
  for (var i = 0; i < rows.length; i++) {
    MD_ENV_PACKAGE[rows[i].env_package_id] = rows[i].env_package;
  }
};
module.exports.get_select_domain_query              = function (rows) {
  for (var i = 0; i < rows.length; i++) {
    MD_DOMAIN[rows[i].domain_id] = rows[i].domain;
  }
};
module.exports.get_select_dna_region_query          = function (rows) {
  for (var i = 0; i < rows.length; i++) {
    MD_DNA_REGION[rows[i].dna_region_id] = rows[i].dna_region.toLowerCase();
  }
};
module.exports.get_select_target_gene_query         = function (rows) {
  for (var i = 0; i < rows.length; i++) {
    MD_TARGET_GENE[rows[i].target_gene_id] = rows[i].target_gene.toLowerCase();
  }
};
module.exports.get_select_sequencing_platform_query = function (rows) {
  for (var i = 0; i < rows.length; i++) {
    MD_SEQUENCING_PLATFORM[rows[i].sequencing_platform_id] = rows[i].sequencing_platform;
  }
};
module.exports.get_select_adapter_sequence_query    = function (rows) {
  for (var i = 0; i < rows.length; i++) {
    MD_ADAPTER_SEQUENCE[rows[i].run_key_id] = rows[i].run_key;
  }
};
module.exports.get_select_illumina_index_query      = function (rows) {
  for (var i = 0; i < rows.length; i++) {
    MD_ILLUMINA_INDEX[rows[i].illumina_index_id] = rows[i].illumina_index;
  }
};

///////////////////////
module.exports.get_select_primer_suite_query = function (rows) {
  for (var i = 0; i < rows.length; i++) {

    if (!MD_PRIMER_SUITE.hasOwnProperty(rows[i].primer_suite_id)) {
      MD_PRIMER_SUITE[rows[i].primer_suite_id]        = {};
      MD_PRIMER_SUITE[rows[i].primer_suite_id].id     = rows[i].primer_suite_id;
      MD_PRIMER_SUITE[rows[i].primer_suite_id].name   = rows[i].primer_suite;
      MD_PRIMER_SUITE[rows[i].primer_suite_id].region = rows[i].region;
      MD_PRIMER_SUITE[rows[i].primer_suite_id].domain = rows[i].domain;
      MD_PRIMER_SUITE[rows[i].primer_suite_id].primer = [];
    }
    MD_PRIMER_SUITE[rows[i].primer_suite_id].primer.push({
      "primer": rows[i].primer,
      "primer_id": rows[i].primer_id,
      "direction": rows[i].direction,
      "sequence": rows[i].sequence

    });


  }
};

////////////////////

module.exports.get_select_run_query    = function (rows) {
  for (var i = 0; i < rows.length; i++) {
    MD_RUN[rows[i].run_id] = rows[i].run;
  }
};
// TODO: "This function's cyclomatic complexity is too high. (6)"
module.exports.run_permissions_query   = function (rows) {
  //console.log(PROJECT_INFORMATION_BY_PID)

  for (var i = 0; i < rows.length; i++) {
    var pid = rows[i].project_id;
    var uid = rows[i].user_id;

    if (pid in PROJECT_INFORMATION_BY_PID) {
      var project                           = PROJECT_INFORMATION_BY_PID[pid].project;
      PROJECT_INFORMATION_BY_PNAME[project] = PROJECT_INFORMATION_BY_PID[pid];
      if (PROJECT_INFORMATION_BY_PID[pid].username === 'guest') {
        PROJECT_INFORMATION_BY_PID[pid].permissions = [];
      } else {
        // TODO: "Blocks are nested too deeply. (4)"
        if (PROJECT_INFORMATION_BY_PID[pid].permissions.indexOf(uid) === -1) {
          PROJECT_INFORMATION_BY_PID[pid].permissions.push(uid);
        }
      }
    }
  }
  //console.log(PROJECT_INFORMATION_BY_PID)
};
// TODO: "This function's cyclomatic complexity is too high. (6)"
module.exports.update_global_variables = function (pid, type) {
  if (type == 'del') {
    var dids  = DATASET_IDS_BY_PID[pid];
    var pname = PROJECT_INFORMATION_BY_PID[pid].project;
    console.log('RE-INTIALIZING ALL_DATASETS');
    dataset_objs = [];
    for (var i in ALL_DATASETS.projects) {
      item = ALL_DATASETS.projects[i];
      //console.log('item'+item);
      // {"name":"142","pid":105,"title":"Title","datasets":[{"did":496,"dname":"142_ds","ddesc":"142_ds_description"}]
      if (item.pid == pid) {
        dataset_objs = item.datasets;
        //console.log('SPLICING '+pid);
        ALL_DATASETS.projects.splice(i, 1);
        break;
      }

    }
    console.log('RE-INTIALIZING PROJECT_ID_BY_DID');
    console.log('RE-INTIALIZING DATASET_NAME_BY_DID');
    console.log('RE-INTIALIZING ALL_DCOUNTS_BY_DID');
    for (var d in dids) {

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

  } else if (type == 'add') {

  } else {
    // ERROR
  }
};

module.exports.assignment_finish_request = function (res, rows1, rows2, status_params) {
  //console.log('query ok1 '+JSON.stringify(rows1));
  //console.log('query ok2 '+JSON.stringify(rows2));

  module.exports.run_select_datasets_query(rows1);
  console.log(' UPDATING ALL_DATASETS');
  console.log(' UPDATING PROJECT_ID_BY_DID');
  console.log(' UPDATING PROJECT_INFORMATION_BY_PID');
  console.log(' UPDATING PROJECT_INFORMATION_BY_PNAME');
  console.log(' UPDATING DATASET_IDS_BY_PID');
  console.log(' UPDATING DATASET_NAME_BY_DID');
  console.log(' UPDATING AllMetadataNames');
  console.log(' UPDATING DatasetsWithLatLong');
  // This function needs to be (re)written
  //this.run_select_sequences_query(rows2);
  console.log(' UPDATING ALL_DCOUNTS_BY_DID');
  console.log(' UPDATING ALL_PCOUNTS_BY_PID ');
  console.log(' UPDATING ALL_CLASSIFIERS_BY_PID');
  // re-run re-create new_taxonomy (see app.js)
  var silvaTaxonomy      = require(app_root + '/models/silva_taxonomy');
  var all_silva_taxonomy = new silvaTaxonomy();
  var CustomTaxa         = require('./custom_taxa_class');
  all_silva_taxonomy.get_all_taxa(function (err, results) {
    if (err)
      throw err; // or return an error message, or something
    else
      new_taxonomy = new CustomTaxa(results);
    //new_taxonomy.make_html_tree_file(new_taxonomy.taxa_tree_dict_map_by_id, new_taxonomy.taxa_tree_dict_map_by_rank["domain"]);
  });
  console.log(' UPDATED new_taxonomy');
};
module.exports.reverse                   = function (str) {
  return str.split("").reverse().join("");
};
module.exports.clean_string              = function (str) {
  // this replaces everything that is not letter,number or underscore (\w) with underscore
  return str.replace(/[^\w]/gi, '_');
};

module.exports.get_metadata_from_file = function () {
  var meta_file = path.join(config.JSON_FILES_BASE, NODE_DATABASE + '--metadata.json');
  try {
    AllMetadataFromFile = require(meta_file);
  }
  catch (e) {
    console.log(e);
    AllMetadataFromFile = {};
  }
  return AllMetadataFromFile;
};

module.exports.write_metadata_to_files = function (did) {
  var dataset_file = path.join(config.JSON_FILES_BASE, NODE_DATABASE + '--datasets_' + C.default_taxonomy.name, did + '.json');

  fs.readFile(dataset_file, 'utf8', function (err, data) {
    if (err) throw err;
    //Do your processing, MD5, send a satellite to the moon, etc.
    //console.log('predata',data)
    data.metadata = AllMetadata[did]
    //console.log('postdata',data)
    fs.writeFile(dataset_file, data, function (err) {
      if (err) throw err;
      console.log('done writing ' + did + '.json');
    });
  });


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
        return "\\" + char; // prepends a backslash to backslash, percent,
                            // and double/single quotes
    }
  });
};

module.exports.checkUserName = function (username) {   // SAME FXN IN PASSPORT
  reg = /[^A-Za-z0-9]/;   // allow alphanumeric ONLY!
  a   = (reg.test(username));
  //console.log(a)
  return a;
};
// module.exports.generateHash = function(password) {
//   //return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
//   var cipher = crypto.createCipher('aes-256-cbc', 'salt');
//   cipher.update(password, 'utf8', 'base64');
//   return cipher.final('base64');
// };
// Sort list of json objects alphabetically
module.exports.compareStrings_alpha = function (a, b) {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};
// Sort list of json objects numerically
module.exports.compareStrings_int   = function (a, b) {
  // Assuming you want case-insensitive comparison
  a = parseInt(a);
  b = parseInt(b);
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};
module.exports.sort_json_matrix     = function (mtx, fxn_obj) {
  // fxn must be one of min,max, alphaUp, alphaDown
  // else original mtx returned
  // sorts MATRIX by tax alpha or counts OF FIRST COLUMN only
  // Does not (yet) sort datasets
  obj = [];
  for (var i in mtx.data) {
    obj.push({tax: mtx.rows[i], cnt: mtx.data[i]});
  }
  var reorder = false;
  if (fxn_obj.orderby == 'alpha') {
    if (fxn_obj.value == 'a') {
      obj.sort(function sortByAlpha(a, b) {
        return module.exports.compareStrings_alpha(b.tax.id, a.tax.id);
      });
      reorder = true;
    } else {
      obj.sort(function sortByAlpha(a, b) {
        return module.exports.compareStrings_alpha(a.tax.id, b.tax.id);
      });
      reorder = true;
    }
  } else if (fxn_obj.orderby == 'count') {
    if (fxn_obj.value == 'max') {
      obj.sort(function sortByCount(a, b) {
        return b.cnt[0] - a.cnt[0];
      });
      reorder = true;
    } else {
      obj.sort(function sortByCount(a, b) {
        return a.cnt[0] - b.cnt[0];
      });
      reorder = true;
    }
  } else {

  }

  if (reorder) {
    mtx.rows = [];
    mtx.data = [];
    for (var i1 in obj) {
      //console.log(i,obj[i])
      mtx.rows.push(obj[i1].tax);
      mtx.data.push(obj[i1].cnt);
    }
  }
  return mtx;

};
module.exports.get_portal_projects  = function (req, portal) {
  projects        = [];
  var cnsts_basis = C.PORTALS[portal];
  //switch (portal) {
  //console.log('ALL_DATASETS-PORTAL', ALL_DATASETS);
  //console.log('JSON.stringify(cnsts_basis)');
  //console.log(JSON.stringify(cnsts_basis));
  ALL_DATASETS.projects.forEach(function (prj) {
    var pinfo = PROJECT_INFORMATION_BY_PID[prj.pid];
    var split = prj.name.split('_');

    if (cnsts_basis.projects.indexOf(prj.name) != -1) {
      projects.push(pinfo);
    }
    if (cnsts_basis.prefixes.indexOf(split[0]) != -1) {
      projects.push(pinfo);
    }
    //console.log('UniEuk-basis',basis);
    if (cnsts_basis.suffixes.indexOf(split[split.length - 1]) != -1) {
      //console.log('UniEuk',JSON.stringify(pinfo));
      projects.push(pinfo);
    }
  });

  return projects;

};
module.exports.get_public_projects  = function (req) {

  projects = [];
  //var basis = C.PORTALS[portal]
  //switch (portal) {
  //console.log('ALL_DATASETS--get_public_projects', ALL_DATASETS);
  //console.log(JSON.stringify(basis))
  ALL_DATASETS.projects.forEach(function (prj) {

    var pinfo = PROJECT_INFORMATION_BY_PID[prj.pid];
    //var public = pinfo.public
    //if(pinfo.public == 1){
    projects.push(pinfo);
    //}

  });

  //console.log('INFO', projects);
  return projects;

};

// module.exports.get_attributes_from_hdf5_group = function(did, type) {
//   var hash = {};
//   var h5group;
//   if(type == 'metadata'){
//     h5group = HDF5_MDATA.openGroup(did+"/"+type);
//   }else{
//     h5group = HDF5_TAXDATA.openGroup(did+"/"+type);
//   }
// 
//   h5group.refresh();
//   Object.getOwnPropertyNames(h5group).forEach(function(str, idx, array) {
//     if(str != 'id'){
//       hash[str] = h5group[str];
//     }
//   });
//   return hash;
// };

module.exports.get_PTREE_metadata = function (OBJ, q) {
  projects = [];
  phash    = {};
  OBJ.forEach(function (prj) {
    dids = DATASET_IDS_BY_PID[prj.pid];
    for (var n in dids) {

      if (dids[n] in AllMetadata && AllMetadata[dids[n]].hasOwnProperty(q)) {
        phash[prj.pid] = 1;
      }
    }
  });

  for (pid in phash) {
    projects.push(PROJECT_INFORMATION_BY_PID[pid]);
  }

  return projects;
};

module.exports.make_color_seq = function (seq) {

  var return_string = '';
  for (var i = 0; i < seq.length; i++) {
    var base = seq.charAt(i);
    if (base == 'A') {
      return_string += "<font color='red'>" + base + "</font>";
    }
    else if (base == 'C') {
      return_string += "<font color='blue'>" + base + "</font>";
    }
    else if (base == 'G') {
      return_string += "<font color='black'>" + base + "</font>";
    }
    else if (base == 'T') {
      return_string += "<font color='orange'>" + base + "</font>";
    }
    else {
      return_string += "<font color='darkgrey'>" + base + "</font>";
    }

  }

  return return_string;
};    //end of function make_color_seq

module.exports.update_project_information_global_object = function (pid, form, user_obj) {
  console.log('Updating PROJECT_INFORMATION_BY_PID');
  if (config.site == 'vamps') {
    console.log('VAMPS PRODUCTION -- no print to log');
  } else {
    console.log(pid);
    console.log(JSON.stringify(form));
    console.log(JSON.stringify(user_obj));
  }
  if (PROJECT_INFORMATION_BY_PID.hasOwnProperty(pid) == true) {
    console.log('pid already in PROJECT_INFORMATION_BY_PID -- how can that be?');
    return;
  }
  console.log('Creating new PROJECT_INFORMATION_BY_PID[pid]');
  var ca                                              = module.exports.convertJSDateToString(rows[i].created_at)
  var ua                                              = module.exports.convertJSDateToString(rows[i].updated_at)
  PROJECT_INFORMATION_BY_PID[pid]                     = {};
  PROJECT_INFORMATION_BY_PID[pid]                     = {
    "last": user_obj.last_name,
    "first": user_obj.first_name,
    "username": user_obj.username,
    "oid": user_obj.user_id,
    "email": user_obj.email,
    // "env_source_name" : rows[i].env_source_name,
    "env_source_id": form.new_env_source_id,
    "institution": user_obj.institution,
    "project": form.new_project_name,
    "pid": pid,
    "title": form.new_project_title,
    "description": form.new_project_description,
    "public": form.new_privacy,
    "permissions": [user_obj.user_id],
    "metagenomic": rows[i].metagenomic,
    //"seqs_available" :   rows[i].seqs_available,
    "created_at": ca,
    "updated_at": ua
  };
  PROJECT_INFORMATION_BY_PNAME[form.new_project_name] = PROJECT_INFORMATION_BY_PID[pid];
  console.log('PROJECT_INFORMATION_BY_PID[pid]');
  console.log(PROJECT_INFORMATION_BY_PID[pid]);
};

// TODO: Column: 52 "This function's cyclomatic complexity is too high. (20)"
module.exports.run_select_datasets_query = function (rows) {
  var pids              = {};
  var titles            = {};
  var datasetsByProject = {};
  for (var i = 0; i < rows.length; i++) {
    var project = rows[i].project;
    if (project === undefined) {
      continue;
    }
    var pid = rows[i].pid;
    var did = rows[i].did;
    if (!DATASET_IDS_BY_PID.hasOwnProperty(pid)) {
      DATASET_IDS_BY_PID[pid] = [];
    }
    if (did === undefined || did === 'null' || did === null) {
      //console.log('DATASET NULL');
    } else {

      var dataset              = rows[i].dataset;
      var dataset_description  = rows[i].dataset_description;
      PROJECT_ID_BY_DID[did]   = pid;
      DATASET_NAME_BY_DID[did] = dataset;
      if (datasetsByProject.hasOwnProperty(project)) {
        datasetsByProject[project].push({did: did, dname: dataset, ddesc: dataset_description});
      } else {
        datasetsByProject[project] = [{did: did, dname: dataset, ddesc: dataset_description}];
      }


      DATASET_IDS_BY_PID[pid].push(did);

    }

    if (AllMetadata.hasOwnProperty(did) && AllMetadata[did].hasOwnProperty('env_package_id')) {
      var envpkgid = AllMetadata[did].env_package_id;
    } else {
      var envpkgid = '1';
    }

    var ca = module.exports.convertJSDateToString(rows[i].created_at)
    var ua = module.exports.convertJSDateToString(rows[i].updated_at)

    if (!PROJECT_INFORMATION_BY_PID.hasOwnProperty(pid)) {
      var public                      = rows[i].public;
      var owner_id                    = rows[i].owner_user_id;
      PROJECT_INFORMATION_BY_PID[pid] = {
        "last": rows[i].last_name,
        "first": rows[i].first_name,
        "username": rows[i].username,
        "oid": owner_id,
        "email": rows[i].email,
        "env_package_id": envpkgid,  // FROM AllMetadata: mostly used here for the filter function on dataset selection page
        "institution": rows[i].institution,
        "project": project,
        "pid": pid,
        "title": rows[i].title,
        "description": rows[i].project_description,
        "public": rows[i].public,
        "metagenomic": rows[i].metagenomic,
        "matrix": rows[i].matrix,
        //"seqs_available" :   rows[i].seqs_available,
        "created_at": ca,
        "updated_at": ua
      };
      if (public || rows[i].username === 'guest') {
        PROJECT_INFORMATION_BY_PID[pid].permissions = [];  // PUBLIC
      } else {
        PROJECT_INFORMATION_BY_PID[pid].permissions = [owner_id]; // initially has only project owner_id
      }
      PROJECT_INFORMATION_BY_PNAME[project] = PROJECT_INFORMATION_BY_PID[pid];

      pids[project]   = pid;
      titles[project] = rows[i].title;
    }

  }

  // todo: console.log(datasetsByProject.length); datasetsByProject - not an array
  for (var p in datasetsByProject) {
    var tmp      = {};
    tmp.name     = p;
    tmp.pid      = pids[p];
    tmp.title    = titles[p];
    tmp.datasets = [];
    for (var d in datasetsByProject[p]) {
      var ds     = datasetsByProject[p][d].dname;
      var dp_did = datasetsByProject[p][d].did;
      var ddesc  = datasetsByProject[p][d].ddesc;
      tmp.datasets.push({did: dp_did, dname: ds, ddesc: ddesc});
    }
    ALL_DATASETS.projects.push(tmp);
  }
  //console.log(JSON.stringify(ALL_DATASETS))
  console.log('Getting md-names and those w/ lat/lon');
  //var clean_metadata = {};
  //if(HDF5_MDATA === ''){
  var clean_metadata = {};
  // TODO: "Blocks are nested too deeply. (4)"
  for (did in AllMetadata) {
    if (did in DATASET_NAME_BY_DID) {
      clean_metadata[did] = AllMetadata[did];
      for (var mdname in AllMetadata[did]) {
        //console.log(mdname)
        if (AllMetadataNames.indexOf(mdname) == -1) {
          AllMetadataNames.push(mdname);
        }
        if ((mdname == 'latitude' && !isNaN(AllMetadata[did].latitude)) || (mdname == 'longitude' && !isNaN(AllMetadata[did].longitude))) {
          if (did in DatasetsWithLatLong) {
            if (mdname == 'latitude') {
              DatasetsWithLatLong[did].latitude = +AllMetadata[did].latitude;
            } else {
              DatasetsWithLatLong[did].longitude = +AllMetadata[did].longitude;
            }
          } else {
            DatasetsWithLatLong[did] = {};

            var pname                          = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;
            DatasetsWithLatLong[did].proj_dset = pname + '--' + DATASET_NAME_BY_DID[did];
            DatasetsWithLatLong[did].pid       = PROJECT_ID_BY_DID[did];
            if (mdname == 'latitude') {
              DatasetsWithLatLong[did].latitude = +AllMetadata[did].latitude;
            } else {
              DatasetsWithLatLong[did].longitude = +AllMetadata[did].longitude;
            }
          }
        }
      }
    }
  }
//   }else{
//     for(did in DATASET_NAME_BY_DID){
//       //console.log(did)
//       //clean_metadata[did] = {}
// 
//       var mdgroup = HDF5_MDATA.openGroup(did+"/metadata");
//       mdgroup.refresh();
//       // TODO: "This function's cyclomatic complexity is too high. (8)"
//       // TODO: "Don't make functions within a loop."
//       Object.getOwnPropertyNames(mdgroup).forEach(function(mdname, idx, array) {
//         if(mdname != 'id'){
//           //console.log(mdname, group[mdname])
//           //clean_metadata[did][mdname] = mdgroup[mdname]
// 
//           if(AllMetadataNames.indexOf(mdname) == -1){
//             AllMetadataNames.push(mdname);
//           }
//           if(mdname == 'latitude' || mdname == 'longitude'){
//             if(did in DatasetsWithLatLong){
//               if(mdname == 'latitude'){
//                 // TODO: "Blocks are nested too deeply. (4)"
//                 DatasetsWithLatLong[did].latitude = +mdgroup[mdname];
//               }else{
//                 DatasetsWithLatLong[did].longitude = +mdgroup[mdname];
//               }
//             }else{
//               DatasetsWithLatLong[did]={};
// 
//               var pname = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;
//               DatasetsWithLatLong[did].proj_dset = pname+'--'+DATASET_NAME_BY_DID[did];
//               DatasetsWithLatLong[did].pid = PROJECT_ID_BY_DID[did];
//               if(mdname == 'latitude'){
//                 // TODO: Column: 47 "Blocks are nested too deeply. (4)"
//                 DatasetsWithLatLong[did].latitude = +mdgroup[mdname];
//               }else{
//                 DatasetsWithLatLong[did].longitude = +mdgroup[mdname];
//               }
//             }
//           }
// 
// 
//         }
//       });
//     }
//   }


  AllMetadataNames.sort(function (a, b) {
    return module.exports.compareStrings_alpha(a, b);
  });
  //console.log(AllMetadataNames)
  connection.query(queries.get_project_permissions(), function (err, rows, fields) {
    //console.log(qSequenceCounts)
    if (err) {
      console.log('Query error: ' + err);
      console.log(err.stack);
      process.exit(1);
    } else {
      module.exports.run_permissions_query(rows);
    }

    console.log(' UPDATING PERMISSIONS: "' + queries.get_project_permissions() + '"');
  });
};

function mysqlTimeStampToDate(timestamp) {
  //function parses mysql datetime string and returns javascript Date object
  //input has to be in this format: 2007-06-05 15:26:02
  var regex = /^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
  console.log(timestamp)
  var parts = timestamp.replace(regex, "$1 $2 $3 $4 $5 $6").split(' ');
  console.log('2')
  return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
}

module.exports.update_status = function (status_params) {
  console.log('in update_status');
  console.log(util.inspect(status_params, false, null));

  if (status_params.type === 'delete') {
    delete_status_params = [status_params.user_id, status_params.pid];
    statQuery            = queries.MakeDeleteStatusQ();
    console.log('in update_status, after delete_status');
    connection.query(statQuery, delete_status_params, function (err, rows) {
      if (err) {
        console.log('ERROR1-in status update: ' + err);
      }
      else {
        console.log('in statQuery');
        console.log(util.inspect(rows, false, null));
      }
    });
  } else if (status_params.type == 'update') {
    statQuery2 = queries.MakeInsertStatusQ(status_params);
    // console.log('statQuery2: ' + statQuery2);
    connection.query(statQuery2, function (err, rows) {
      if (err) {
        console.log('ERROR2-in status update: ' + err);
      } else {
        console.log('status update2');
        console.log(util.inspect(rows, false, null));
      }
    });
  } else {  // Type::New
    statQuery1 = queries.MakeInsertStatusQ(status_params);
    // console.log('statQuery1: ' + statQuery1);
    connection.query(statQuery1, function (err, rows) {
      if (err) {
        console.log('ERROR2-in status update: ' + err);
      } else {
        console.log('status update1');
        console.log(util.inspect(rows, false, null));
      }
    });
  } // Type::New
};

module.exports.fetchInfo = function (query, values, callback) {
  connection.query(query, values, function (err, rows) {
    if (err) {
      callback(err, null);
    }
    else {
      console.log('--- rows from fetchInfo ---');
      console.log(util.inspect(rows, false, null));

      callback(null, rows[0]);
    }
  });
};
//
//
//
function htmlEntities(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

//
//
//
/////////////////// EXPORTS ///////////////////////////////////////////////////////////////////////
module.exports.create_export_files = function (req, user_dir, ts, dids, file_tags, normalization, rank, domains, include_nas, compress) {
  var db  = req.db;
  //file_name = 'fasta-'+ts+'_custom.fa.gz';
  var log = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'export_log.txt');
  //var log = path.join(user_dir, 'export_log.txt');
  if (normalization == 'max' || normalization == 'maximum' || normalization == 'normalized_to_maximum') {
    norm = 'normalized_to_maximum';
  } else if (normalization == 'percent' || normalization == 'frequency' || normalization == 'normalized_by_percent') {
    norm = 'normalized_by_percent';
  } else {
    norm = 'not_normalized';
  }

  var site       = req.CONFIG.site;
  var code       = 'NVexport';
  var pid_lookup = {};
  var pids_str;
  //console.log('dids', dids);
  export_cmd     = 'vamps_export_data.py';
  for (n = 0; n < dids.length; n++) {
    //console.log('did', dids[n]);
    pid_lookup[PROJECT_ID_BY_DID[dids[n]]] = 1;
  }

  var dids_str = JSON.stringify(dids.join(','));

  if (file_tags[0] == '--dco_metadata_file') {
    pid_list = []
    for (pname in PROJECT_INFORMATION_BY_PNAME) {
      if (pname.substring(0, 3) == 'DCO') {
        pid_list.push(PROJECT_INFORMATION_BY_PNAME[pname].pid)
      }
    }
    pids_str = JSON.stringify(pid_list.join(','));
  } else {
    pids_str = JSON.stringify((Object.keys(pid_lookup)).join(','));
  }
  //console.log('pids', pids_str);
  //var file_tags = file_tags.join(' ')

  var export_cmd_options = {

    scriptPath: path.join(req.CONFIG.PATH_TO_NODE_SCRIPTS),
    args: ['-s', site,
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
  if (compress) {
    export_cmd_options.args.push('-compress');
  }
  if (domains != '') {
    export_cmd_options.args.push('-domains');
    export_cmd_options.args.push(JSON.stringify(domains.join(', ')));
  }
  console.log('include NAs', include_nas)
  if (include_nas == 'no') {
    export_cmd_options.args.push('-exclude_nas');
  }
  var cmd_list = [];
  cmd_list.push(path.join(export_cmd_options.scriptPath, export_cmd) + ' ' + export_cmd_options.args.join(' '));

  if (req.CONFIG.cluster_available === true) {
    qsub_script_text = module.exports.get_qsub_script_text(req, log, req.CONFIG.TMP, code, cmd_list);
    qsub_file_name   = req.user.username + '_qsub_export_' + ts + '.sh';
    qsub_file_path   = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'tmp', qsub_file_name);
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
            var dwnld_process = spawn(qsub_file_path, {}, {
              env: {'PATH': req.CONFIG.PATH, 'LD_LIBRARY_PATH': req.CONFIG.LD_LIBRARY_PATH},
              detached: true,
              stdio: ['pipe', 'pipe', 'pipe']
              //stdio: [ 'ignore', null, log ]
            });  // stdin, stdout, stderr1


          }
        });
      }
    });


  } else {
    console.log('No Cluster Available according to req.CONFIG.cluster_available');
    var cmd = path.join(export_cmd_options.scriptPath, export_cmd) + ' ' + export_cmd_options.args.join(' ');
    console.log('RUNNING:', cmd);
    //var log = path.join(req.CONFIG.SYSTEM_FILES_BASE, 'tmp_log.log')
    var dwnld_process = spawn(path.join(export_cmd_options.scriptPath, export_cmd), export_cmd_options.args, {
      env: {'PATH': req.CONFIG.PATH, 'LD_LIBRARY_PATH': req.CONFIG.LD_LIBRARY_PATH},
      detached: true,
      stdio: ['pipe', 'pipe', 'pipe']  // stdin, stdout, stderr
    });
    stdout            = '';
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

module.exports.get_local_script_text = function (cmd_list) {
  script_text = "#!/bin/sh\n\n";
  //script_text += 'TSTAMP=`date "+%Y%m%d%H%M%S"`'+"\n\n";
  script_text += 'echo -n "Hostname: "' + "\n";
  script_text += "hostname\n";
  script_text += 'echo -n "Current working directory: "' + "\n";
  script_text += "pwd\n\n";
  if(config.site == 'vamps' || config.site == 'vampsdev'){
    script_text += "source /groups/vampsweb/"+config.site+"/seqinfobin/vamps_environment.sh\n\n";
  }
  for (var i in cmd_list) {
    script_text += cmd_list[i] + "\n\n";
  }
  return script_text;
};

module.exports.get_qsub_script_text = function (req, scriptlog, dir_path, cmd_name, cmd_list) {
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
   #$ -o "+scriptlog+"
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
  script_text += "# CODE:\t" + cmd_name + "\n\n";
  script_text += "# source environment:\n";
  script_text += "source /groups/vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh\n\n";
  script_text += 'TSTAMP=`date "+%Y%m%d%H%M%S"`' + "\n\n";
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
  script_text += "#$ -o " + scriptlog + "\n";
  script_text += "#$ -N " + cmd_name + "\n";
  //script_text += "#$ -p 100\n";   // priority default is 0
  script_text += "#$ -cwd\n";
  script_text += "#$ -V\n";
  script_text += 'echo -n "Hostname: "' + "\n";
  script_text += "hostname\n";
  script_text += 'echo -n "qsub: Current working directory: "' + "\n";
  script_text += "pwd\n\n";
  script_text += "source /groups/vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh\n\n"
//     script_text += "source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh\n\n";

  for (var i in cmd_list) {
    script_text += cmd_list[i] + "\n\n";
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

module.exports.get_qsub_script_text_only = function (req, scriptlog, dir_path, cmd_name, cmd_list) {
  script_text = "#!/bin/bash\n"
  script_text += "# CODE:\t${cmd_name}\n"
  script_text += "# source environment:\n"
  script_text += "source /groups/vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh\n\n"
  script_text += "TSTAMP=\`date +%Y%m%d%H%M%S\`\n\n"
  script_text += "# Loading Module didn't work when testing:\n"
  script_text += ". /usr/share/Modules/init/sh\n"
  script_text += "export MODULEPATH=/usr/local/www/vamps/software/modulefiles\n"
  script_text += "module load clusters/vamps\n\n"
  script_text += "PATH=$PATH:" + req.CONFIG.PATH_TO_NODE_SCRIPTS + ":" + path.join(req.CONFIG.PROCESS_DIR, '/public/scripts') + ":" + req.CONFIG.GAST_SCRIPT_PATH + "\n"
  script_text += "echo \"PATH is \$PATH\"\n"

  for (var i in cmd_list) {
    script_text += cmd_list[i] + "\n\n";
  }

  console.log("script_text from get_qsub_script_text_only: ")
  console.log(util.inspect(script_text, false, null));
  return script_text;

};

module.exports.isLocal = function (req) {
  var conf = "";
  if (typeof req.CONFIG === 'undefined') {
    conf  = require(app_root + '/config/config');
  }
  else {
    conf = req.CONFIG;
  }

  var ext_hosts = ['vampsdev', 'bpcweb7', 'vamps', 'vampsdb'];

  var not_ext_hosts = !(ext_hosts.includes(conf.dbhost));
  return not_ext_hosts;

    // return !(conf.dbhost === 'vampsdev' || conf.dbhost === 'bpcweb7' || conf.dbhost === 'vampsdb' || conf.dbhost === 'vamps');
};

module.exports.local_log = function (req, msg) {
  if (module.exports.isLocal(req)) {
    console.log(msg);
  }
};

module.exports.deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    if (fs.lstatSync(path).isFile()) {
      try {
        fs.unlinkSync(path);
      } catch (e) {
        console.log("Could not delete1: " + path)
      }
    } else {
      fs.readdirSync(path).forEach(function (file, index) {
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          module.exports.deleteFolderRecursive(curPath);
        } else { // delete file
          try {
            fs.unlinkSync(curPath);
          } catch (e) {
            console.log("Could not delete2: " + curPath)
          }
        }
      });
      try {
        fs.rmdirSync(path);
      } catch (e) {
        console.log("Could not delete3: " + path)
      }
    }
  }
};
//
//
//
module.exports.make_gast_script_txt = function (req, data_dir, project, cmd_list, opts) {
  console.log('OPTS: ')
  console.log(opts)
  make_gast_script_txt = "";
  if (module.exports.isLocal(req)) {
    make_gast_script_txt += "export PERL5LIB=" + app_root + "/public/scripts/gast\n"
    make_gast_script_txt += "PATH=$PATH:" + app_root + "/public/scripts/gast:" + req.CONFIG.GAST_SCRIPT_PATH + "\n"
    make_gast_script_txt += "touch " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"
  }
  // /groups/vampsweb/vampsdev_node_data/user_data/avoorhis/project-avoorhis_435638/analysis/*/seqfile.unique.fa
  make_gast_script_txt += "ls " + data_dir + "/analysis/*/seqfile.unique" + opts.file_suffix + " > " + data_dir + "/filenames.list\n"
  make_gast_script_txt += "# chmod 666 " + data_dir + "/filenames.list\n"
  make_gast_script_txt += "cd " + data_dir + "\n";

  make_gast_script_txt += "\n";
  make_gast_script_txt += "\n";
  make_gast_script_txt += `FILE_NUMBER=\`/usr/bin/wc -l < ${data_dir}/filenames.list\``;
  make_gast_script_txt += "\n";

  make_gast_script_txt += "echo \"total files = $FILE_NUMBER\" >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"

  make_gast_script_txt += "cat >" + data_dir + "/clust_gast_ill_" + project + ".sh <<InputComesFromHERE\n"
  make_gast_script_txt += "#!/bin/bash\n";


  if (module.exports.isLocal(req)) {
    make_gast_script_txt += "\n";
    make_gast_script_txt += "for FASTA in " + data_dir + "/*" + opts.file_suffix + "; do \n"
    make_gast_script_txt += "# INFILE=\\$(basename \\$FASTA)\n"
    make_gast_script_txt += "INFILE=\\$FASTA\n"
    make_gast_script_txt += "echo \"\\$INFILE\" >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"
    make_gast_script_txt += "\n";
  }
  else {

    make_gast_script_txt += "#$ -S /bin/bash\n"
    make_gast_script_txt += "#$ -N clust_gast_ill_" + project + ".sh\n"
    make_gast_script_txt += "# Giving the name of the output log file\n"
    make_gast_script_txt += "#$ -o " + data_dir + "/cluster.log\n"
    make_gast_script_txt += "#$ -j y\n"
    make_gast_script_txt += "# Send mail to these users\n"
    make_gast_script_txt += "#$ -M " + req.user.email + "\n"
    make_gast_script_txt += "# Send mail; -m as sends on abort, suspend.\n"
    make_gast_script_txt += "#$ -m as\n"
    make_gast_script_txt += "#$ -t 1-\${FILE_NUMBER##*( )}\n"
    make_gast_script_txt += "# Now the script will iterate $FILE_NUMBER times.\n"

    //make_gast_script_txt += "  . /xraid/bioware/Modules/etc/profile.modules\n"
    //make_gast_script_txt += "  module load bioware\n"
    //make_gast_script_txt += "  PATH=$PATH:"+app_root+"/public/scripts/gast:"+req.CONFIG.GAST_SCRIPT_PATH+"\n"
    make_gast_script_txt += "  source /groups//vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh\n"
    make_gast_script_txt += "  echo \"===== $PATH ====\" >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"

    make_gast_script_txt += "  LISTFILE=" + data_dir + "/filenames.list\n"
    make_gast_script_txt += "  echo \"LISTFILE is \\$LISTFILE\" >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n";

    make_gast_script_txt += "\n";
    make_gast_script_txt += '  INFILE=\\`sed -n "\\${SGE_TASK_ID}p" \\$LISTFILE\\`';
  }

  make_gast_script_txt += "\n";
  make_gast_script_txt += "  echo \"=====\" >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"
  make_gast_script_txt += "  echo \"file name is \\$INFILE\" >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"
  make_gast_script_txt += "  echo '' >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"
  make_gast_script_txt += "  echo \"SGE_TASK_ID = \\$SGE_TASK_ID\" >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"
  make_gast_script_txt += "  echo '' >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"
  make_gast_script_txt += "  echo \"" + opts.gast_script_path + "/gast/gast_ill -saveuc -nodup " + opts.full_option + " -in \\$INFILE -db " + opts.gast_db_path + "/" + opts.ref_db_name + ".fa -rtax " + opts.gast_db_path + "/" + opts.ref_db_name + ".tax -out \\$INFILE.gast -uc \\$INFILE.uc -threads 0\" >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"

  make_gast_script_txt += "   " + opts.gast_script_path + "/gast/gast_ill -saveuc -nodup " + opts.full_option + " -in \\$INFILE -db " + opts.gast_db_path + "/" + opts.ref_db_name + ".fa -rtax " + opts.gast_db_path + "/" + opts.ref_db_name + ".tax -out \\$INFILE.gast -uc \\$INFILE.uc -threads 0\n";
  make_gast_script_txt += "\n";

  if (module.exports.isLocal(req)) {
    make_gast_script_txt += "done\n";
  }
  make_gast_script_txt += "\n";
  make_gast_script_txt += "  chmod 666 " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"
  make_gast_script_txt += "\n";
  make_gast_script_txt += "InputComesFromHERE\n"

  make_gast_script_txt += "echo \"Running clust_gast_ill_" + project + ".sh\" >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"

  make_gast_script_txt += "\n";
  make_gast_script_txt += "\n";
  make_gast_script_txt += "export SGE_ROOT=/opt/sge\n";
  make_gast_script_txt += "source /groups/vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh\n\n"
  if (module.exports.isLocal(req)) {
    // # TODO: make local version, iterate over (splited) files in LISTFILE instead of qsub
    make_gast_script_txt += "bash " + data_dir + "/clust_gast_ill_" + project + ".sh\n";
  }
  else {
    // the -sync y tag means that the following install scripts will run AFTER the cluster gast scripts finish
    var sync_tag = '-sync y' // forces qsub to wait until all jobs finish before exiting
    var parallel_env_tag = '-pe smp 5'  // req to work on vamps cluster 2019-01
    make_gast_script_txt += "qsub "+parallel_env_tag+" "+sync_tag+" " + data_dir + "/clust_gast_ill_" + project + ".sh\n";
  }
  make_gast_script_txt += "echo \"Done with cluster_gast\" >> " + data_dir + "/cluster.log\n"
  make_gast_script_txt += "echo \"Running install scripts (see log)\" >> " + data_dir + "/cluster.log\n"
  for (var i in cmd_list) {
    make_gast_script_txt += cmd_list[i] + "\n\n";
  }

  make_gast_script_txt += "\n";
  // make_gast_script_txt += "touch " + path.join(data_dir, "TEMP.tmp");
  // make_gast_script_txt += "\n";
  return make_gast_script_txt
}

module.exports.isEmptyObject = function (obj) {
  return !Object.keys(obj).length;
}

module.exports.filter_projects  = function (req, prj_obj, filter_obj) {
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

  if (filter_obj.substring == '' || filter_obj.substring === '.....') {
    NewPROJECT_TREE_OBJ1 = prj_obj
  } else {
    //console.log('Filtering for SUBSTRING')
    prj_obj.forEach(function (prj) {
      if (prj.hasOwnProperty('name')) {
        ucname = prj.name.toUpperCase();
      } else {
        ucname = prj.project.toUpperCase();
      }
      if (ucname.indexOf(filter_obj.substring) != -1) {
        NewPROJECT_TREE_OBJ1.push(prj);
      }
    });

  }

  // ENV
  var NewPROJECT_TREE_OBJ2 = []
  if (filter_obj.env.length == 0 || filter_obj.env[0] === '.....') {  // should ALWAYS BE A LIST
    NewPROJECT_TREE_OBJ2 = NewPROJECT_TREE_OBJ1
  } else {
    //console.log('Filtering for ENV')
    NewPROJECT_TREE_OBJ1.forEach(function (prj) {
      if (filter_obj.env.indexOf(parseInt(PROJECT_INFORMATION_BY_PID[prj.pid].env_package_id)) != -1) {
        NewPROJECT_TREE_OBJ2.push(prj);
      }
    });

  }

  // TARGET
  var NewPROJECT_TREE_OBJ3 = []
  if (filter_obj.target == '' || filter_obj.target === '.....') {
    NewPROJECT_TREE_OBJ3 = NewPROJECT_TREE_OBJ2
  } else {
    //console.log('Filtering for TARGET')
    NewPROJECT_TREE_OBJ2.forEach(function (prj) {
      if (prj.hasOwnProperty('name')) {
        pparts = prj.name.split('_');
      } else {
        pparts = prj.project.split('_');
      }
      last_el = pparts[pparts.length - 1]
      if (filter_obj.target === 'ITS' && last_el.substring(0, 3) === 'ITS') {
        NewPROJECT_TREE_OBJ3.push(prj);
      } else if (last_el === filter_obj.target) {
        NewPROJECT_TREE_OBJ3.push(prj);
      }
    });

  }
  // PORTAL
  var NewPROJECT_TREE_OBJ4 = []
  if (filter_obj.portal == '' || filter_obj.portal === '.....') {
    NewPROJECT_TREE_OBJ4 = NewPROJECT_TREE_OBJ3
  } else {
    //console.log('Filtering for PORTAL')
    portal = C.PORTALS[filter_obj.portal]
    NewPROJECT_TREE_OBJ3.forEach(function (prj) {
      if (prj.hasOwnProperty('name')) {
        pname = prj.name;
      } else {
        pname = prj.project;
      }
      pparts = pname.split('_');
      prefix = pparts[0]
      suffix = pparts[pparts.length - 1]
      if (portal.prefixes.indexOf(prefix) != -1 || portal.projects.indexOf(pname) != -1 || portal.suffixes.indexOf(suffix) != -1) {
        NewPROJECT_TREE_OBJ4.push(prj);
      }

    });

  }

  // public/private
  var NewPROJECT_TREE_OBJ5 = []
  if (filter_obj.public == '-1') {
    NewPROJECT_TREE_OBJ5 = NewPROJECT_TREE_OBJ4
  } else {
    //console.log('Filtering for PRIVACY')
    NewPROJECT_TREE_OBJ4.forEach(function (prj) {
      if (PROJECT_INFORMATION_BY_PID[prj.pid].public === parseInt(filter_obj.public)) {
        NewPROJECT_TREE_OBJ5.push(prj);
      }
    });
  }

  // METADATA1
  var NewPROJECT_TREE_OBJ6 = []
  if (filter_obj.metadata1 == '' || filter_obj.metadata1 === '.....') {
    NewPROJECT_TREE_OBJ6 = NewPROJECT_TREE_OBJ5
  } else {
    NewPROJECT_TREE_OBJ6 = module.exports.get_PTREE_metadata(NewPROJECT_TREE_OBJ5, filter_obj.metadata1)
  }
  // METADATA2
  var NewPROJECT_TREE_OBJ7 = []
  if (filter_obj.metadata2 == '' || filter_obj.metadata2 === '.....') {
    NewPROJECT_TREE_OBJ7 = NewPROJECT_TREE_OBJ6
  } else {
    NewPROJECT_TREE_OBJ7 = module.exports.get_PTREE_metadata(NewPROJECT_TREE_OBJ6, filter_obj.metadata2)
  }
  // METADATA1
  var NewPROJECT_TREE_OBJ8 = []
  if (filter_obj.metadata3 == '' || filter_obj.metadata3 === '.....') {
    NewPROJECT_TREE_OBJ8 = NewPROJECT_TREE_OBJ7
  } else {
    NewPROJECT_TREE_OBJ8 = module.exports.get_PTREE_metadata(NewPROJECT_TREE_OBJ7, filter_obj.metadata3)
  }


  var new_obj = NewPROJECT_TREE_OBJ8
  //console.log('new_obj')
  //console.log(new_obj)
  return new_obj

}
// Validates that the input string is a valid date formatted as "mm/dd/yyyy"
module.exports.isValidMySQLDate = function (dateString) {
  // First check for the pattern
  //if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
  //    return false;

  // MUST be of this format: YYYY-MM-DD (only 2 digit days and months)
  if(!/^\d{4}\-\d{2}\-\d{2}$/.test(dateString))
    return false;
  // Parse the date parts to integers
  var parts = dateString.split("-");
  var year  = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10);
  var day   = parseInt(parts[2], 10);


  // Check the ranges of month and year (no future years allowed)
  if(year < 1000 || year > (new Date()).getFullYear() || month == 0 || month > 12)
    return false;

  var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Adjust for leap years
  if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
    monthLength[1] = 29;

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
};
//
//
//
module.exports.convertJSDateToString = function (jddate) {
  try {
    var full_year = jddate.getFullYear()
    var month     = parseInt(jddate.getMonth()) + 1
    var date      = parseInt(jddate.getDate())
    if (date < 10) {
      date = '0' + date.toString()
    }
    if (month < 10) {
      month = '0' + month.toString()
    }
    if (isNaN(full_year)) {
      return ''
    } else {
      return full_year.toString() + '-' + month.toString() + '-' + date.toString()
    }
  } catch (e) {
    return ''
  }

};
//
//
//
module.exports.run_external_command             = function (script_path) {
  console.log('in helpers.run_external_command()')
  console.log(script_path)
  var exec   = require('child_process').exec;
  var child  = exec(script_path);
  var output = '';

  child.stdout.on('data', function AddDataToOutput(data) {
    data = data.toString().trim();
    output += data;
    //CheckIfPID(data);
  });


  child.stderr.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  child.on('close', function checkExitCode(code) {
    console.log('From run_external_command process exited with code ' + code);
    var ary = output.split("\n");

    var last_line = ary[ary.length - 1];
    console.log('last_line:', last_line);
    if (code === 0) {
      //callback_function(callback_function_options, last_line);
    }
    else // code != 0
    {
      console.log('FAILED', script_path)
      //failedCode(req, res, path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'project-' + project), project, last_line);
    }
  });


}
module.exports.required_metadata_ids_from_names = function (selection_obj, mdname) {
  // TODO
  var idname, value
  if (mdname == 'env_package') {
    idname = 'env_package_id'
    value  = MD_ENV_PACKAGE[selection_obj[idname]]
  } else if (mdname == 'env_biome') {
    idname = 'env_biome_id'
    value  = MD_ENV_ENVO[selection_obj[idname]]
  } else if (mdname == 'env_feature') {
    idname = 'env_feature_id'
    value  = MD_ENV_ENVO[selection_obj[idname]]
  } else if (mdname == 'env_material') {
    idname = 'env_material_id'
    value  = MD_ENV_ENVO[selection_obj[idname]]
  } else if (mdname == 'geo_loc_name') {
    idname = 'geo_loc_name_id'
    if (MD_ENV_CNTRY.hasOwnProperty(selection_obj[idname])) {
      value = MD_ENV_CNTRY[selection_obj[idname]]
    } else {
      value = MD_ENV_LZC[selection_obj[idname]]
    }
  } else if (mdname == 'sequencing_platform') {
    idname = 'sequencing_platform_id'
    value  = MD_SEQUENCING_PLATFORM[selection_obj[idname]]
  } else if (mdname == 'dna_region') {
    idname = 'dna_region_id'
    value  = MD_DNA_REGION[selection_obj[idname]]
  } else if (mdname == 'target_gene') {
    idname = 'target_gene_id'
    value  = MD_TARGET_GENE[selection_obj[idname]]
  } else if (mdname == 'domain') {
    idname = 'domain_id'
    value  = MD_DOMAIN[selection_obj[idname]]
  } else if (mdname == 'adapter_sequence') {
    idname = 'adapter_sequence_id'
    value  = MD_ADAPTER_SEQUENCE[selection_obj[idname]]
  } else if (mdname == 'illumina_index') {
    idname = 'illumina_index_id'
    value  = MD_ILLUMINA_INDEX[selection_obj[idname]]
  } else if (mdname == 'run') {
    idname = 'run_id'
    value  = MD_RUN[selection_obj[idname]]
  } else if (mdname == 'primer_suite') {
    idname = 'primer_suite_id'
    if (MD_PRIMER_SUITE.hasOwnProperty(selection_obj[idname]) && MD_PRIMER_SUITE[selection_obj[idname]].hasOwnProperty('name')) {
      value = MD_PRIMER_SUITE[selection_obj[idname]].name
    } else {
      value = 'unknown'
    }
  } else if (mdname == 'primers') {
    idname = 'primer_ids'
    if (MD_PRIMER_SUITE.hasOwnProperty(selection_obj['primer_suite_id'])) {
      val = []
      for (n in MD_PRIMER_SUITE[selection_obj['primer_suite_id']].primer) {
        val.push(MD_PRIMER_SUITE[selection_obj['primer_suite_id']].primer[n].sequence)
      }
      value = val.join(' ')
    } else {
      value = 'unknown'
    }
  } else {
    idname = mdname
    value  = selection_obj[mdname];
  }
  // eg: { name: 'primer_suite_id', value: 'Bacterial V6 Suite' } or { name: 'domain_id', value: 'Bacteria' }
  return {"name": idname, "value": value}
};

module.exports.required_metadata_names_from_ids = function (selection_obj, name_id) {
  var id = selection_obj[name_id];
  var real_name, value;
  if (name_id == 'env_package_id') {
    real_name = 'env_package';
    value     = MD_ENV_PACKAGE[id];
  } else if (name_id == 'target_gene_id') {
    real_name = 'target_gene';
    value     = MD_TARGET_GENE[id];
  } else if (name_id == 'domain_id') {
    real_name = 'domain';
    value     = MD_DOMAIN[id];
  } else if (name_id == 'geo_loc_name_id') {
    real_name = 'geo_loc_name';
    if (MD_ENV_CNTRY.hasOwnProperty(id)) {
      value = MD_ENV_CNTRY[id];
    } else {
      value = MD_ENV_LZC[id];
    }
  } else if (name_id == 'sequencing_platform_id') {
    real_name = 'sequencing_platform';
    value     = MD_SEQUENCING_PLATFORM[id];
  } else if (name_id == 'dna_region_id') {
    real_name = 'dna_region';
    value     = MD_DNA_REGION[id];
  } else if (name_id == 'env_material_id') {
    real_name = 'env_material';
    value     = MD_ENV_ENVO[id];
  } else if (name_id == 'env_biome_id') {
    real_name = 'env_biome';
    value     = MD_ENV_ENVO[id]
  } else if (name_id == 'env_feature_id') {
    real_name = 'env_feature';
    value     = MD_ENV_ENVO[id];
  } else if (name_id == 'adapter_sequence_id') {
    real_name = 'adapter_sequence';
    value     = MD_ADAPTER_SEQUENCE[id];
  } else if (name_id == 'illumina_index_id') {
    real_name = 'illumina_index';
    value     = MD_ILLUMINA_INDEX[id];
  } else if (name_id == 'run_id') {
    real_name = 'run';
    value     = MD_RUN[id];
  } else if (name_id == 'primer_suite_id') {
    real_name = 'primer_suite';
    //value = MD_PRIMER_SUITE[id]
    if (MD_PRIMER_SUITE.hasOwnProperty(id) && MD_PRIMER_SUITE[id].hasOwnProperty('name')) {
      value = MD_PRIMER_SUITE[id].name;
    } else {
      value = 'unknown';
    }
  } else if (name_id == 'primer_ids') {
    real_name = 'primers'
    if (MD_PRIMER_SUITE.hasOwnProperty(selection_obj['primer_suite_id'])) {
      val = []
      for (n in MD_PRIMER_SUITE[selection_obj['primer_suite_id']].primer) {
        val.push(MD_PRIMER_SUITE[selection_obj['primer_suite_id']].primer[n].sequence)
      }
      value = val.join(' ')
    } else {
      value = 'unknown'
    }
  } else {
    real_name = name_id;
    value     = id;
  }
  // eg: { name: 'primer_suite', value: 'Bacterial V6 Suite' } or { name: 'domain', value: 'Bacteria' }
  return {"name": real_name, "value": value}

};
//
//
//
module.exports.get_metadata_obj_from_dids = function (dids) {
  var metadata = {}
  var mdobj;
  for (n in dids) {
    metadata[dids[n]] = {}
    mdobj             = AllMetadata[dids[n].toString()]
    for (key in mdobj) {
      md                         = module.exports.required_metadata_names_from_ids(mdobj, key)
      metadata[dids[n]][md.name] = md.value
    }
  }
  //console.log(metadata)
  return metadata
}
//
//
module.exports.screen_dids_for_permissions = function (req, dids) {
  // This is called from unit_select and view_select (others?)  to catch and remove dids that
  // are found through searches such as geo_search and go to unit_select directly
  // bypassing the usual tree filter 'filter_project_tree_for_permissions' (fxn above)
  // permissions are in PROJECT_INFORMATION_BY_PID
  var new_did_list = []
  for (i in dids) {
    if (PROJECT_ID_BY_DID.hasOwnProperty(dids[i]) && PROJECT_INFORMATION_BY_PID.hasOwnProperty(PROJECT_ID_BY_DID[dids[i]])) {
      pinfo = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[dids[i]]]
      if (pinfo.public == 1 || pinfo.public == '1') {
        new_did_list.push(dids[i])
      } else {
        // allow if user is owner (should have uid in permissions but check anyway)
        // allow if user is admin
        // allow if user is in pinfo.permission
        if (req.user.user_id == pinfo.oid || req.user.security_level <= 10 || pinfo.permissions.indexOf(req.user.user_id) != -1) {
          new_did_list.push(dids[i])
        }
      }
    }
  }
  return new_did_list
};
module.exports.screen_pids_for_permissions = function (req, pids) {
  // This is called from unit_select and view_select (others?)  to catch and remove dids that
  // are found through searches such as geo_search and go to unit_select directly
  // bypassing the usual tree filter 'filter_project_tree_for_permissions' (fxn above)
  // permissions are in PROJECT_INFORMATION_BY_PID
  var new_pid_list = []
  for (i in pids) {
    pinfo = PROJECT_INFORMATION_BY_PID[pids[i]]
    // allow if user is owner (should have uid in permissions but check anyway)
    // allow if user is admin
    // allow if user is in pinfo.permission
    if (pinfo.public == 1 || pinfo.public == '1') {
      new_pid_list.push(pids[i])
    } else if (req.user.user_id == pinfo.oid || req.user.security_level <= 10 || pinfo.permissions.indexOf(req.user.user_id) != -1) {
      new_pid_list.push(pids[i])
    }
  }
  return new_pid_list;
};

module.exports.unique_array = function (myArray) {
  var uSet = new Set(myArray);
  return [...uSet];
};

module.exports.flat_array = function (myArray) {
  return myArray.reduce((acc, val) => acc.concat(val), []);
};

module.exports.has_duplicates = function (myArray) {
  return ((parseInt(new Set(myArray).size)) !== parseInt(myArray.length));
};

module.exports.log_timestamp = function () {
  var date = new Date();
  // console.log("date.toDateString():");
  // console.log(date.toDateString());
  var day  = date.toLocaleDateString();
  var time = date.toLocaleTimeString();
  return day + " " + time;
};

module.exports.get_key_from_value = function (obj, value) {
  // returns the key first found object only
  console.log('3 -in get_key from val - ' + value);
  found_key   = null;
  unknown_key = null;
  for (key in obj) {
    if (obj[key] == value) {
      found_key = key;
    }
    if (obj[key] == 'unknown') {
      unknown_key = key;
    }
  }
  if (!found_key) {
    found_key = unknown_key;
  }
  if (!found_key) {
    found_key = null;
  }
  console.log('4 -key - ' + found_key)
  return found_key;
};

module.exports.ensure_dir_exists = function (dir) {
  fs.ensureDir(dir, function (err) {
    if (err) {
      console.log('2');
      console.log(err);
    } // => null
    else {
      fs.chmod(dir, 0777, function (err) {
        if (err) {
          console.log(err);
        } // ug+rwx
      });
      console.log(dir + ' Guaranteed to exist on login')
    }        // dir has now been created, including the directory it is to be placed in

  });
// Use abstract equality == for "is number" test
  module.exports.isEven = function (n) {
    return n == parseFloat(n) ? !(n % 2) : void 0;
  }

};

function check_regexp(reg_exp, value, err_msg) {
  var result = value.match(reg_exp);

  // if (value !== '' && result === null) {
  if (value !== '' && result !== null) {
    throw new Error("'" + value + "' is not allowed in '%s'" + err_msg);
  }
}

// metadata form validation
// TODO: move to controller


function checkArray(my_arr) {
  for (var i = 0; my_arr.length > i; i++) {
    if (my_arr[i] === '') {
      return false;
    }
  }
  return true;
}

function region_valid(value, region_low, region_high) {
  if ((value !== '') && (parseInt(value) < parseInt(region_low) || parseInt(value) > parseInt(region_high))) {
    throw new Error("'" + value + "' is not valid, %s should be between " + region_low + " and " + region_high);
  }
}

exports.numbers_n_period = function (value) {
  // var regex = /^[0-9.]+$/;
  //[^0-9.] faster
  var reg_exp = /[^0-9.]/;
  var err_msg = ', please use only numbers and periods.';
  check_regexp(reg_exp, value, err_msg);
};

exports.numbers_n_period_n_minus = function (value) {
  // var regex = /^[0-9.]+$/;
  //[^0-9.] faster
  var reg_exp = /[^0-9.-]/;
  var err_msg = ', please use only numbers, periods and minus.';
  check_regexp(reg_exp, value, err_msg);
};

exports.longitude_valid = function (value) {
  region_valid(value, -180, 180);
};

exports.latitude_valid = function (value) {
  region_valid(value, -90, 90);
};

exports.ph_valid = function (value) {
  region_valid(value, 0, 14);
};

exports.percent_valid = function (value) {
  region_valid(value, 0, 100);
};

exports.positive = function (value) {
  if (value !== '' && parseInt(value) < 0) {
    throw new Error("'" + value + "' is not valid, %s should be greater then 0.");
  }
};

exports.dropdown_items_validation = function (value) {
  if (value === 'Please choose one') {
    throw new Error('%s is required. Please choose one value from the dropdown menu');
  }
};

const const_target_gene               = C.TARGET_GENE;
module.exports.target_gene_validation = function (gene, source) {
  let u_domains_set         = new Set(source.domain);
  let u_domains_arr         = [...u_domains_set];
  let curr_domain           = u_domains_arr[0];
  let this_domain_tg_object = module.exports.findByValueOfObject(const_target_gene, "domain", curr_domain);
  let curr_target_genes     = this_domain_tg_object[0]['target_gene'];
  let target_gene_correct   = curr_target_genes.includes(gene);
  let curr_target_genes_str = curr_target_genes.join(" or ");
  if (!target_gene_correct) {
    throw new Error('For domain ' + curr_domain + ' please choose ' + curr_target_genes_str + ' from Target gene name.');
  }
};

exports.geo_loc_name_validation = function (value, source) {
  if ((!checkArray(source.geo_loc_name_marine)) && (!checkArray(source.geo_loc_name_continental))) {
    throw new Error("Either 'Country' or 'Longhurst Zone' are required"); // jshint ignore:line
  }
};

exports.geo_loc_name_continental_filter = function (value) {
  console.time('geo_loc_name_continental_filter');
  for (const key in C.GAZ_SPELLING) {
    if (C.GAZ_SPELLING.hasOwnProperty(key)) {
      const curr = C.GAZ_SPELLING[key];
      if (curr.indexOf(value.toLowerCase()) > -1) {
        return key;
      }
    }
  }
  console.timeEnd('geo_loc_name_continental_filter');
};

exports.geo_loc_name_marine_validation = function (value) {
  if (MD_ENV_LZC_vals.indexOf(value) < 0 && (value !== '')) {
    throw new Error("There is no Longhurst Zone '" + value + "', please check the spelling");
  }
};

exports.geo_loc_name_continental_validation = function (value) {
  if (MD_ENV_CNTRY_vals.indexOf(value) < 0 && (value !== '')) {
    throw new Error("There is no Country '" + value + "', please check the spelling");
  }
};

exports.slice_object = function (object, slice_keys) {
  console.time('TIME: convert to string');
  for (var i = 0; i < slice_keys.length; i++) {
    slice_keys[i] = String(slice_keys[i]);
  }
  console.timeEnd('TIME: convert to string');

  return Object.keys(object)
    .filter(function (key) {
      return slice_keys.indexOf(key) >= 0;
    })
    .reduce(function (acc, key) {
      acc[key] = object[key];
      return acc;
    }, {});
};

exports.findByValueOfObject = function (arr, key, value) {
  return arr.filter(function (item) {
    return (item[key] === value);
  });
};

exports.check_for_undefined0 = function (req, to_check, err_msg) {
  {
    let exists = (typeof to_check !== 'undefined');
    if (!exists) {
      req.flash('fail', err_msg);
    }
    return exists;
  }
};

exports.transpose_2d_arr_and_fill = function (data_arr, matrix_length) {
  console.time('TIME: transpose_2d_arr_and_fill');

  //make an array with proper length, even if the first one is empty
  // var matrix_length = DATASET_IDS_BY_PID[project_id].length + 1;
  var length_array = data_arr[0];
  if (data_arr[0].length < matrix_length) {
    length_array = module.exports.fill_out_arr_doubles('', matrix_length);
  }

  var newArray = length_array.map(function (col, i) {
    return data_arr.map(function (row) {
      return row[i];
    });
  });
  console.timeEnd('TIME: transpose_2d_arr_and_fill');
  return newArray;
};

exports.collect_errors = collect_errors;

function collect_errors(req) {
  var success_msgs    = req.flash("success") || [];
  var flash_msgs_sess = req.session.flash || {};
  var fail_msgs       = req.flash("fail") || [];
  var myArray_fail    = fail_msgs;

  req.session.flash = [];

  if ((typeof req.form !== 'undefined') && (req.form.errors.length > 0)) {
    var combine_err = [].concat(flash_msgs_sess.error);
    combine_err     = combine_err.concat(flash_msgs_sess.fail);
    combine_err     = combine_err.concat(fail_msgs);
    combine_err     = combine_err.concat(req.form.errors);
    combine_err     = combine_err.filter(x => x); //removing null, undefined, 0, -0, NaN, "", false, document.all
    myArray_fail    = module.exports.unique_array(combine_err);
    if ((typeof req.form.sample_name !== "undefined") && (module.exports.has_duplicates(req.form.sample_name))) {
      myArray_fail.push('Sample ID (user sample name) should be unique.');
    }
    myArray_fail.sort();
    req.flash("fail", myArray_fail);
  }
  req.session.flash = {"fail": myArray_fail, "success": success_msgs};

  return req;
}

exports.transpose_arr_of_obj = transpose_arr_of_obj;

function transpose_arr_of_obj(a) {
  console.time('TIME: transpose_arr_of_obj');

  var array_width = a.length || 0;
  var headers     = a[0] instanceof Object ? Object.keys(a[0]) : [];
  var h           = headers.length;

  // In case it is a zero matrix, no transpose routine needed.
  if (h === 0 || array_width === 0) {
    return [];
  }

  var transposed_object = {};

  for (var i = 0; i < array_width; i++) {

    for (var k in headers) {
      header = headers[k];
      if (a[i].hasOwnProperty(header)) {
        if (!transposed_object.hasOwnProperty(header)) {
          transposed_object[header] = [];
        }
        transposed_object[header].push(a[i][header]);
      }
    }
  }
  console.timeEnd('TIME: transpose_arr_of_obj');
  return transposed_object;
}

function jsUcfirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
//
//
//
exports.retrieve_needed_constants = function(cnsts, view)
{
    var obj = {}
    obj.UNITSELECT = cnsts.UNITSELECT
    if(view == 'view_selection'){
        obj.VISUAL_THUMBNAILS = cnsts.VISUAL_THUMBNAILS
        obj.VISUALOUTPUTCHOICES = cnsts.VISUALOUTPUTCHOICES
        obj.DISTANCECHOICES = cnsts.DISTANCECHOICES
        obj.NORMALIZATIONCHOICES = cnsts.NORMALIZATIONCHOICES 
        obj.show_nas = cnsts.show_nas
        obj.PCT_RANGE = cnsts.PCT_RANGE 
    }else if(view == 'unit_selection') {  // unit_selection
    
    }else if(view == 'visuals_index'){  // visuals_index
        obj.TARGETS = cnsts.TARGETS
        obj.PORTALS = cnsts.PORTALS
    }else if(view == 'export'){
        obj.DOMAINS = cnsts.DOMAINS
    }
    return obj    
}
// module.exports.validate_name = function (name) {
//     console.log('helpers.validate_name: '+name)
//     pattern=/([^a-zA-Z0-9\.]+)/gi
//     
//     var new_pname = name.replace(pattern, '_')
//     //console.log('xx: '+new_name)
//     if(new_pname.length > 30){
//         //console.log('too long')
//         return false;
//     }
//     if(new_pname.length < 3){
//         //console.log('too short')
//         return false;
//     }
//     return new_pname;
// }


