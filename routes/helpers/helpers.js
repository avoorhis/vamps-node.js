const C       = require(app_root + '/public/constants');
const queries = require(app_root + '/routes/queries');
const CFG  = require(app_root + '/config/config');
const express     = require('express');
const fs          = require('fs-extra');
const nodemailer  = require('nodemailer');
let transporter = nodemailer.createTransport({});
const util        = require('util');
const path        = require('path');

// route middleware to make sure a user is logged in
module.exports.isLoggedIn = (req, res, next) => {
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

module.exports.isAdmin = (req, res, next) => {
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

module.exports.array_from_object = data => {
  let data_arr = [];
  for (let key in data) {
    let value_arr = {};
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

module.exports.get_second = element => {
  // console.time('TIME: get_second:'+element);
  if (C.ORDERED_METADATA_NAMES_OBJ.hasOwnProperty(element)) {
    return C.ORDERED_METADATA_NAMES_OBJ[element][1];
  }
  // console.timeEnd('TIME: get_second:'+element);
};

/** Benchmarking
 * Usage:
 var helpers = require('../helpers/helpers');

 helpers.start = process.hrtime();
 some code
 helpers.elapsed_time("This is the running time for some code");
 */

module.exports.start = process.hrtime();

function check_file_formats(filename) {
  let file_formats    = C.download_file_formats;
  let file_first_part = filename.split('-')[0];
  return file_formats.includes(file_first_part);
}

function get_user_dirname(dirname) {
  let dirname_arr = dirname.split('/');
  return dirname_arr[dirname_arr.length - 1];
}

function get_sizer_and_filesize(size) {
  let fileSize = (size).toFixed(1);
  let sizer    = 'Bytes';
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

function add_to_retrieve(results, stat, file, filename) {
  let sizer_and_filesize = get_sizer_and_filesize(stat.size);
  results.push({
    'filename': filename,
    // 'size': stat.size,
    'fileSize': sizer_and_filesize[0],
    'sizer': sizer_and_filesize[1],
    'time': stat.mtime,
    'mtime_format': format_time(stat.mtime),
    'user_dirname': get_user_dirname(path.dirname(file))
  });
  return results;
}

function walk_recursively(dir, done) {
// var file_formats = C.download_file_formats;
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) {return done(err)}
    let pending = list.length;
    if (!pending) {return done(null, results)}
    list.forEach(file_from_list => {
      let file = path.resolve(dir, file_from_list);
      fs.stat(file, (err, stat) => {
        let is_directory = (stat && stat.isDirectory());
        if (is_directory) {
          walk_recursively(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) {done(null, results)}
          });
        }
        else {
          let filename = path.basename(file);
          let file_format_is_ok = check_file_formats(filename);
          if (file_format_is_ok) {
            results = add_to_retrieve(results, stat, file, filename);
          }
          if (!--pending) {done(null, results)}
        }
      });
    });
  });
}

module.exports.walk = (dir, done) => {
  walk_recursively(dir, done);
};

function walk_sync_recursive(dir) {
  let results = [];
  let list    = fs.readdirSync(dir);
  list.forEach( file => {
    file     = path.resolve(dir, file);
    let stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk_sync_recursive(file));
    }
    else {
      let filename = path.basename(file);

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

module.exports.walk_sync = dir => {
  return walk_sync_recursive(dir);
};

module.exports.elapsed_time = note => {
  var precision = 3; // 3 decimal places
  var elapsed   = process.hrtime(module.exports.start)[1] / 1000000; // divide by a million to get nano to milli
  console.log(process.hrtime(module.exports.start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note);
};


// todo: use in file instead of those in the class
module.exports.check_if_rank = (field_name) => {

  let ranks = C.RANKS;

  // ranks = ["domain","phylum","klass","order","family","genus","species","strain"]
  return ranks.includes(field_name);
};

module.exports.render_error_page = (req, res, msg) => {
  req.flash('fail', msg);
  res.render('error',
    {
      title: 'Fail',
      user: req.user.username
    });
};

module.exports.write_to_file = (fileName, text) => {
  fs.writeFile(fileName, text, err => {
    if (err) {
      throw err;
    }
  });
};

module.exports.getRandomInt  = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.IsJsonString = str => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

module.exports.IsNumeric = n => {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

module.exports.onlyUnique = (value, index, self) => {
  // usage: ukeys = ukeys.filter(helpers.onlyUnique);
  return self.indexOf(value) === index;
};

module.exports.mkdirSync = path => {
  try {
    fs.mkdirSync(path);
  } catch (e) {
    if (e.code !== 'EEXIST') {throw e}
  }
};

module.exports.fileExists = path => {
  try {
    return fs.statSync(path).isFile() || fs.statSync(path).isDirectory();
  }
  catch (err) {
    return false;
  }
};

module.exports.reverseString = str => {
  return str.split("").reverse().join("");
};

module.exports.send_mail = mail_info => {
  // let to_addr   = mail_info.addr;
  // let from_addr = mail_info.from;
  // let subj      = mail_info.subj;
  // let msg       = mail_info.msg;
  transporter.sendMail(mail_info, (error, info) => {
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

module.exports.assignment_finish_request = (res, rows1, rows2, status_params) => {
  //console.log('query ok1 '+JSON.stringify(rows1));
  //console.log('query ok2 '+JSON.stringify(rows2));
  const global_vars_controller  = require(app_root + '/controllers/globalVarsController');
  const global_vars = new global_vars_controller.GlobalVars();

  global_vars.run_select_datasets_query(rows1);
  console.log(' UPDATING C.ALL_DATASETS');
  console.log(' UPDATING C.PROJECT_ID_BY_DID');
  console.log(' UPDATING C.PROJECT_INFORMATION_BY_PID');
  console.log(' UPDATING C.PROJECT_INFORMATION_BY_PNAME');
  console.log(' UPDATING C.DATASET_IDS_BY_PID');
  console.log(' UPDATING C.DATASET_NAME_BY_DID');
  console.log(' UPDATING C.AllMetadataNames');
  console.log(' UPDATING C.DatasetsWithLatLong');
  // This function needs to be (re)written
  //this.run_select_sequences_query(rows2);
  console.log(' UPDATING C.ALL_DCOUNTS_BY_DID');
  console.log(' UPDATING C.ALL_PCOUNTS_BY_PID ');
  console.log(' UPDATING C.ALL_CLASSIFIERS_BY_PID');
  // re-run re-create new_taxonomy (see app.js)
  const silvaTaxonomy      = require(app_root + '/models/silva_taxonomy');
  var all_silva_taxonomy = new silvaTaxonomy();
  const CustomTaxa         = require('./custom_taxa_class');
  all_silva_taxonomy.get_all_taxa( (err, results) => {
    if (err)
      throw err; // or return an error message, or something
    else
      C.new_taxonomy = new CustomTaxa(results);
    //new_taxonomy.make_html_tree_file(new_taxonomy.taxa_tree_dict_map_by_id, new_taxonomy.taxa_tree_dict_map_by_rank["domain"]);
  });
  console.log(' UPDATED C.new_taxonomy');
};

module.exports.reverse                   = str => {
  return str.split("").reverse().join("");
};

module.exports.clean_string              = str => {
  // this replaces everything that is not letter,number or underscore (\w) with underscore
  return str.replace(/[^\w]/gi, '_');
};

module.exports.get_metadata_from_file = () => {
  let meta_file = path.join(CFG.JSON_FILES_BASE, NODE_DATABASE + '--metadata.json');
  try {
    AllMetadataFromFile = require(meta_file);
  }
  catch (e) {
    console.log(e);
    AllMetadataFromFile = {};
  }
  return AllMetadataFromFile;
};

module.exports.write_metadata_to_files = did => {
  let dataset_file = path.join(CFG.JSON_FILES_BASE, NODE_DATABASE + '--datasets_' + C.default_taxonomy.name, did + '.json');

  fs.readFile(dataset_file, 'utf8', (err, data) => {
    if (err) throw err;
    //Do your processing, MD5, send a satellite to the moon, etc.
    //console.log('predata',data)
    data.metadata = C.AllMetadata[did];
    //console.log('postdata',data)
    fs.writeFile(dataset_file, data, err => {
      if (err) throw err;
      console.log('done writing ' + did + '.json');
    });
  });


};

module.exports.mysql_real_escape_string = str => {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
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

module.exports.isValidIdSelector = function (str) {
    var regex = new RegExp(/^[A-Za-z][A-Za-z0-9_\-\:\.]*$/gm);
    return regex.test(str);
};
// module.exports.checkUserName = (username) => {   // SAME FXN IN PASSPORT
//   let reg = /[^A-Za-z0-9]/;   // allow alphanumeric ONLY!
//   return (reg.test(username));
// };

module.exports.compareStrings_alpha = (a, b) => {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};
// Sort list of json objects numerically
module.exports.compareStrings_int   = (a, b) => {
  // Assuming you want case-insensitive comparison
  a = parseInt(a);
  b = parseInt(b);
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};

// test - single_bar
// TODO: duplicated in common_selection.js
// JSHint: This function's cyclomatic complexity is too high. (6)(W074)
module.exports.sort_json_matrix = (mtx, fxn_obj) => {
  // fxn must be one of min,max, alphaUp, alphaDown
  // else original mtx returned
  // sorts MATRIX by tax alpha or counts OF FIRST COLUMN only
  // Does not (yet) sort datasets
  let curr_obj = [];
  mtx.data.map((curr, i) => { return curr_obj.push({tax: mtx.rows[i], cnt: mtx.data[i]}); });

  let reorder = false;
  switch(fxn_obj.orderby) {
    case 'alpha':
      if (fxn_obj.value === 'a') {
        curr_obj.sort(function sortByAlpha(a, b) {
          return module.exports.compareStrings_alpha(b.tax.id, a.tax.id);
        });
      }
      else {
        curr_obj.sort(function sortByAlpha(a, b) {
          return module.exports.compareStrings_alpha(a.tax.id, b.tax.id);
        });
      }
      reorder = true;
      break;
    case 'count':
      if (fxn_obj.value == 'max') {
        curr_obj.sort(function sortByCount(a, b) {
          return module.exports.compareStrings_int(a.cnt[0], b.cnt[0])
        });
      }
      else {
        curr_obj.sort(function sortByCount(a, b) {
          return module.exports.compareStrings_int(b.cnt[0], a.cnt[0])
        });
        
      }
      reorder = true;
      break;
  }

  if (reorder) {
    mtx.rows = [];
    mtx.data = [];
    curr_obj.forEach(curr => {
      mtx.rows.push(curr.tax);
      mtx.data.push(curr.cnt);
    });
  }
  return mtx;
};

module.exports.get_portal_projects = (req, portal) => {
  let projects = [];
  let cnsts_basis = C.PORTALS[portal];

  C.ALL_DATASETS.projects.forEach( prj => {
    let pinfo = C.PROJECT_INFORMATION_BY_PID[prj.pid];
    let split = prj.name.split('_');

    if (cnsts_basis.projects.includes(prj.name)) {
      projects.push(pinfo);

    }
    if (cnsts_basis.prefixes.includes(split[0])) {
      projects.push(pinfo);
    }
    //console.log('UniEuk-basis',basis);
    if (cnsts_basis.suffixes.includes(split[split.length - 1])) {
      //console.log('UniEuk',JSON.stringify(pinfo));
      projects.push(pinfo);
    }
  });

  return projects;
};

// module.exports.get_public_projects  = () => {
//   let projects = [];
//   C.ALL_DATASETS.projects.forEach( (prj) => {
//     let pinfo = C.PROJECT_INFORMATION_BY_PID[prj.pid];
//     projects.push(pinfo);
//   });
//   return projects;
// };

module.exports.make_color_seq = seq => {
  // default color  = #333 - dark grey

  let previous_base = "";
  let return_string = '<span>';

  for (const base of seq) {
    if (previous_base === base){
      return_string += base;
    }
    else {
      switch (base) {
        case 'A':
          return_string += "</span><span class='base_color_red'>A";
          break;
        case 'C':
          return_string += "</span><span class='base_color_blue'>C";
          break;
        case 'G':
          return_string += "</span><span class='base_color_black'>G";
          break;
        case 'T':
          return_string += "</span><span class='base_color_orange'>T";
          break;
        default:
          return_string += "</span><span class='base_color_darkgrey'>" + base;
          break;
      }
      previous_base = base;
    }
  }
  return_string += "</span>";

  return return_string;
};    //end of function make_color_seq

// TODO: to globVar, not used
// module.exports.update_project_information_global_object = (pid, form, user_obj) => {
//   console.log('Updating PROJECT_INFORMATION_BY_PID');
//   if (CFG.site == 'vamps') {
//     console.log('VAMPS PRODUCTION -- no print to log');
//   } else {
//     console.log(pid);
//     console.log(JSON.stringify(form));
//     console.log(JSON.stringify(user_obj));
//   }
//   if (PROJECT_INFORMATION_BY_PID.hasOwnProperty(pid) == true) {
//     console.log('pid already in PROJECT_INFORMATION_BY_PID -- how can that be?');
//     return;
//   }
//   console.log('Creating new PROJECT_INFORMATION_BY_PID[pid]');
//   var ca                                              = module.exports.convertJSDateToString(rows[i].created_at)
//   var ua                                              = module.exports.convertJSDateToString(rows[i].updated_at)
//   C.PROJECT_INFORMATION_BY_PID[pid]                     = {};
//   C.PROJECT_INFORMATION_BY_PID[pid]                     = {
//     "last": user_obj.last_name,
//     "first": user_obj.first_name,
//     "username": user_obj.username,
//     "oid": user_obj.user_id,
//     "email": user_obj.email,
//     // "env_source_name" : rows[i].env_source_name,
//     "env_source_id": form.new_env_source_id,
//     "institution": user_obj.institution,
//     "project": form.new_project_name,
//     "pid": pid,
//     "title": form.new_project_title,
//     "description": form.new_project_description,
//     "public": form.new_privacy,
//     "permissions": [user_obj.user_id],
//     "metagenomic": rows[i].metagenomic,
//     //"seqs_available" :   rows[i].seqs_available,
//     "created_at": ca,
//     "updated_at": ua
//   };
//   PROJECT_INFORMATION_BY_PNAME[form.new_project_name] = PROJECT_INFORMATION_BY_PID[pid];
//   console.log('PROJECT_INFORMATION_BY_PID[pid]');
//   console.log(PROJECT_INFORMATION_BY_PID[pid]);
// };

// function mysqlTimeStampToDate(timestamp) {
//   //function parses mysql datetime string and returns javascript Date object
//   //input has to be in this format: 2007-06-05 15:26:02
//   var regex = /^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
//   console.log(timestamp)
//   var parts = timestamp.replace(regex, "$1 $2 $3 $4 $5 $6").split(' ');
//   console.log('2')
//   return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
// }

module.exports.update_status = (status_params) => {
  console.log('in update_status');
  console.log(util.inspect(status_params, false, null));

  if (status_params.type === 'delete') {
    let delete_status_params = [status_params.user_id, status_params.pid];
    statQuery            = queries.MakeDeleteStatusQ();
    console.log('in update_status, after delete_status');
    DBConn.query(statQuery, delete_status_params, (err, rows) => {
      if (err) {
        console.log('ERROR1-in status update: ' + err);
      }
      else {
        console.log('in statQuery');
        console.log(util.inspect(rows, false, null));
      }
    });
  }
  else if (status_params.type == 'update') {
    statQuery2 = queries.MakeInsertStatusQ(status_params);
    // console.log('statQuery2: ' + statQuery2);
    DBConn.query(statQuery2, (err, rows) => {
      if (err) {
        console.log('ERROR2-in status update: ' + err);
      } else {
        console.log('status update2');
        console.log(util.inspect(rows, false, null));
      }
    });
  }
  else {  // Type::New
    statQuery1 = queries.MakeInsertStatusQ(status_params);
    // console.log('statQuery1: ' + statQuery1);
    DBConn.query(statQuery1, (err, rows) => {
      if (err) {
        console.log('ERROR2-in status update: ' + err);
      } else {
        console.log('status update1');
        console.log(util.inspect(rows, false, null));
      }
    });
  } // Type::New
};

module.exports.fetchInfo = (query, values, callback) => {
  DBConn.query(query, values, (err, rows) => {
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
// function htmlEntities(str) {
//   return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// }

module.exports.get_local_script_text = (cmd_list) => {
  script_text = "#!/bin/sh\n\n";
  //script_text += 'TSTAMP=`date "+%Y%m%d%H%M%S"`'+"\n\n";
  script_text += 'echo -n "Hostname: "' + "\n";
  script_text += "hostname\n";
  script_text += 'echo -n "Current working directory: "' + "\n";
  script_text += "pwd\n\n";
  if(CFG.site == 'vamps' || CFG.site == 'vampsdev'){
    script_text += "source /groups/vampsweb/"+CFG.site+"/seqinfobin/vamps_environment.sh\n\n";
  }
  for (var i in cmd_list) {
    script_text += cmd_list[i] + "\n\n";
  }
  return script_text;
};

module.exports.get_qsub_script_text = (req, scriptlog, dir_path, cmd_name, cmd_list) => {
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
  // TODO: DRY with l 1380
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
  script_text += "#$ -pe smp 8\n";
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
    script_text += cmd_list[i] + "\n";
    script_text += "echo \"DONE-"+i.toString()+"\" >> " + scriptlog + "\n\n"
  }
//
//     //script_text += "chmod 666 "+log+"\n";
//     //$script_text .= "sleep 120\n";   # for testing
  script_text += "\nEND\n";
  script_text += "}\n";
//     script_text += "status\n";  //#  status will show up in export.out
  script_text += "submit_job\n";
  //##### END  create command

  return script_text;

};

module.exports.get_qsub_script_text_only = (req, scriptlog, dir_path, cmd_name, cmd_list) => {
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

module.exports.isLocal = req => {
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

module.exports.local_log = (req, msg) => {
  if (module.exports.isLocal(req)) {
    console.log(msg);
  }
};

// TODO: to fileController
module.exports.deleteFolderRecursive = (path) => {
  if (fs.existsSync(path)) {
    if (fs.lstatSync(path).isFile()) {
      try {
        fs.unlinkSync(path);
      } catch (e) {
        console.log("Could not delete1: " + path);
      }
    } else {
      fs.readdirSync(path).forEach( (file, index) => {
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
module.exports.make_gast_script_txt = (req, data_dir, project, cmd_list, opts) => {
  //console.log('OPTS: ')
  //console.log(opts)
  make_gast_script_txt = "";
  if (module.exports.isLocal(req)) {
    make_gast_script_txt += "export PERL5LIB=" + app_root + "/public/scripts/gast\n"
    make_gast_script_txt += "PATH=$PATH:" + app_root + "/public/scripts/gast:" + req.CONFIG.GAST_SCRIPT_PATH + "\n"
    make_gast_script_txt += "touch " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"
  }

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
    var parallel_env_tag = '-pe smp 8'  // req to work on vamps cluster 2019-01
    make_gast_script_txt += "qsub "+parallel_env_tag+" "+sync_tag+" " + data_dir + "/clust_gast_ill_" + project + ".sh\n";
  }
  make_gast_script_txt += "echo \"Done with cluster_gast\" >> " + data_dir + "/cluster.log\n"
  make_gast_script_txt += "echo \"Running install scripts (see log)\" >> " + data_dir + "/cluster.log\n"
  for (var i in cmd_list) {
    make_gast_script_txt += cmd_list[i] + "\n";
    make_gast_script_txt += "echo \"DONE-"+i.toString()+"\" >> " + data_dir + "/cluster.log\n\n"
  }

  make_gast_script_txt += "\n";
  // make_gast_script_txt += "touch " + path.join(data_dir, "TEMP.tmp");
  // make_gast_script_txt += "\n";
  return make_gast_script_txt
}

module.exports.isEmptyObject = obj => {
  return !Object.keys(obj).length;
}

module.exports.isValidMySQLDate = dateString => {
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
module.exports.convertJSDateToString = jddate => {
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
    return '';
  }

};

//
//
//
module.exports.run_external_command             = script_path => {
  console.log('in helpers.run_external_command()')
  console.log(script_path)
  const exec   = require('child_process').exec;
  var child  = exec(script_path);
  var output = '';

  child.stdout.on('data', function AddDataToOutput(data) {
    data = data.toString().trim();
    output += data;
    //CheckIfPID(data);
  });


  child.stderr.on('data', data => {
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
};

function get_geo_loc_name(id) {
  if (C.MD_ENV_CNTRY.hasOwnProperty(id)) {
    return C.MD_ENV_CNTRY[id];
  }
  else {
    return C.MD_ENV_LZC[id];
  }
}

module.exports.required_metadata_ids_from_names = (selection_obj, mdname) => {
  // test visuals/unit_selection from custom tax
  let idname, value;

  switch (mdname) {
    case 'env_package':
      idname = 'env_package_id';
      value  = C.MD_ENV_PACKAGE[selection_obj[idname]];
      break;
    case 'env_biome':
      idname = 'env_biome_id';
      value  = C.MD_ENV_ENVO[selection_obj[idname]];
      break;
    case 'env_feature':
      idname = 'env_feature_id';
      value  = C.MD_ENV_ENVO[selection_obj[idname]];
      break;
    case 'env_material':
      idname = 'env_material_id';
      value  = C.MD_ENV_ENVO[selection_obj[idname]];
      break;
    case 'geo_loc_name':
      idname = 'geo_loc_name_id';
      value = get_geo_loc_name(selection_obj[idname]);
      break;
    case 'sequencing_platform':
      idname = 'sequencing_platform_id';
      value  = C.MD_SEQUENCING_PLATFORM[selection_obj[idname]];
      break;
    case 'dna_region':
      idname = 'dna_region_id';
      value  = C.MD_DNA_REGION[selection_obj[idname]];
      break;
    case 'target_gene':
      idname = 'target_gene_id';
      value  = C.MD_TARGET_GENE[selection_obj[idname]];
      break;
    case 'domain':
      idname = 'domain_id';
      value  = C.MD_DOMAIN[selection_obj[idname]];
      break;
    case 'adapter_sequence':
      idname = 'adapter_sequence_id';
      value  = C.MD_ADAPTER_SEQUENCE[selection_obj[idname]];
      break;
    case 'illumina_index':
      idname = 'illumina_index_id';
      value  = C.MD_ILLUMINA_INDEX[selection_obj[idname]];
      break;
    case 'run':
      idname = 'run_id';
      value  = C.MD_RUN[selection_obj[idname]];
      break;
    case 'primer_suite':
      idname = 'primer_suite_id';
      value = get_current_primer_suite(selection_obj[idname]);
      break;
    case 'primers':
      idname = 'primer_ids';
      value = get_current_primers(selection_obj['primer_suite_id']);
      break;
    default:
      idname = mdname;
      value  = selection_obj[mdname];
    }
  // eg: { name: 'primer_suite_id', value: 'Bacterial V6 Suite' } or { name: 'domain_id', value: 'Bacteria' }
  return {"name": idname, "value": value};
};

function get_current_primer_suite(id) {

  if (C.MD_PRIMER_SUITE.hasOwnProperty(id) && C.MD_PRIMER_SUITE[id].hasOwnProperty('name')) {
    return C.MD_PRIMER_SUITE[id].name;
  }
  else {
    return 'unknown';
  }
}

function get_current_primers(id) {
  let val = [];
  let current_primers = C.MD_PRIMER_SUITE[id].primer;
  for (let primer of current_primers) {
    val.push(primer.sequence);
  }
  return val.join(' ');
}

module.exports.required_metadata_names_from_ids = (selection_obj, name_id) => {
  let id = selection_obj[name_id];
  let real_name, value;
  switch(name_id) {
    case 'env_package_id':
      real_name = 'env_package';
      value     = C.MD_ENV_PACKAGE[id];
      break;
    case 'target_gene_id':
      real_name = 'target_gene';
      value     = C.MD_TARGET_GENE[id];
      break;
    case 'domain_id':
      real_name = 'domain';
      value     = C.MD_DOMAIN[id];
      break;
    case 'geo_loc_name_id':
      real_name = 'geo_loc_name';
      value = get_geo_loc_name(id);
      break;
    case 'sequencing_platform_id':
      real_name = 'sequencing_platform';
      value     = C.MD_SEQUENCING_PLATFORM[id];
      break;
    case 'dna_region_id':
      real_name = 'dna_region';
      value     = C.MD_DNA_REGION[id];
      break;
    case 'env_material_id':
      real_name = 'env_material';
      value     = C.MD_ENV_ENVO[id];
      break;
    case 'env_biome_id':
      real_name = 'env_biome';
      value     = C.MD_ENV_ENVO[id];
      break;
    case 'env_feature_id':
      real_name = 'env_feature';
      value     = C.MD_ENV_ENVO[id];
      break;
    case 'adapter_sequence_id':
      real_name = 'adapter_sequence';
      value     = C.MD_ADAPTER_SEQUENCE[id];
      break;
    case 'illumina_index_id':
      real_name = 'illumina_index';
      value     = C.MD_ILLUMINA_INDEX[id];
      break;
    case 'run_id':
      real_name = 'run';
      value     = C.MD_RUN[id];
      break;
    case 'primer_suite_id':
      real_name = 'primer_suite';
      value = get_current_primer_suite(id);
      break;
    case 'primer_ids':
      real_name = 'primers';
      value = get_current_primers(selection_obj['primer_suite_id']);


      break;
    default:
      real_name = name_id;
      value     = id;
  }
  return {"name": real_name, "value": value};
};

//
//
//
module.exports.get_metadata_obj_from_dids = dids => {
  let metadata = {};
  let mdobj;
  for (let n in dids) {
    metadata[dids[n]] = {};
    mdobj             = C.AllMetadata[dids[n].toString()];
    for (let key in mdobj) {
      md = module.exports.required_metadata_names_from_ids(mdobj, key);
      metadata[dids[n]][md.name] = md.value;
    }
  }
  //console.log(metadata)
  return metadata;
};
//
//

user_is_admin = req => {
  return ( parseInt(req.user.security_level, 10) === parseInt(C.user_security_level.admin, 10));
};

user_is_mbl_user = req => {
  return ( parseInt(req.user.security_level, 10) === parseInt(C.user_security_level.mbl_user, 10));
};

user_has_project_permissions = (req, pinfo) => {
  user_has_permissions = false;
  project_is_public = (pinfo.public === parseInt("1", 10));
  user_is_owner = (req.user.user_id === pinfo.oid);
  user_has_spec_permission = pinfo.permissions.includes(req.user.user_id);
  user_has_permissions = (project_is_public || user_is_owner || user_is_admin(req) || user_is_mbl_user(req) || user_has_spec_permission);
  return user_has_permissions;
};

module.exports.screen_dids_for_permissions = (req, dids) => {
  // This is called from unit_select and view_select (others?)  to catch and remove dids that
  // are found through searches such as geo_search and go to unit_select directly
  // bypassing the usual tree filter 'filter_project_tree_for_permissions' (fxn above)
  // permissions are in PROJECT_INFORMATION_BY_PID
  var new_did_list = [];
  for (var i in dids) {
    if (C.PROJECT_ID_BY_DID.hasOwnProperty(dids[i]) && C.PROJECT_INFORMATION_BY_PID.hasOwnProperty(C.PROJECT_ID_BY_DID[dids[i]])) {
      pinfo = C.PROJECT_INFORMATION_BY_PID[C.PROJECT_ID_BY_DID[dids[i]]];
      if (user_has_project_permissions(req, pinfo)) {
        new_did_list.push(parseInt(dids[i]));
      }
    }
  }
  return new_did_list;
};

module.exports.screen_pids_for_permissions = (req, pids) => {
  // This is called from unit_select and view_select (others?)  to catch and remove dids that
  // are found through searches such as geo_search and go to unit_select directly
  // bypassing the usual tree filter 'filter_project_tree_for_permissions' (fxn above)
  // permissions are in PROJECT_INFORMATION_BY_PID
  var new_pid_list = [];
  for (var i in pids) {
    pinfo = C.PROJECT_INFORMATION_BY_PID[pids[i]];
    if (user_has_project_permissions(req, pinfo)) {
      new_pid_list.push(pids[i]);
    }
  }
  return new_pid_list;
};

module.exports.unique_array = (myArray) => {
  let uSet = new Set(myArray);
  return [...uSet];
};

module.exports.flat_array = (myArray) => {
  return myArray.reduce((acc, val) => acc.concat(val), []);
};

module.exports.has_duplicates = (myArray) => {
  return ((parseInt(new Set(myArray).size)) !== parseInt(myArray.length));
};

module.exports.log_timestamp = () => {
  let date = new Date();
  // console.log("date.toDateString():");
  // console.log(date.toDateString());
  let day  = date.toLocaleDateString();
  let time = date.toLocaleTimeString();
  return day + " " + time;
};

module.exports.get_key_from_value = (obj, value) => {
  // returns the key first found object only
  //console.log('3 -in get_key from val - ' + value);
  found_key   = null;
  unknown_key = null;
  for (let key in obj) {
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
  //console.log('4 -key - ' + found_key);
  return found_key;
};

module.exports.ensure_dir_exists = (dir) => {
  fs.ensureDir(dir, err => {
    if (err) {
      console.log(err);
    } // => null
    else {
      //Octal literals with prefix '0' are not allowed. Use '0o' prefix instead
      fs.chmod(dir, 0o777, (err) => {
        if (err) {
          console.log(err);
        } // ug+rwx
      });
      console.log(dir + ' Guaranteed to exist on login')
    }        // dir has now been created, including the directory it is to be placed in

  });
// Use abstract equality == for "is number" test
  module.exports.isEven = (n) => {
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
// TODO: move to a controller

function checkArray(my_arr) {
  if (my_arr.length === 0) {
    return false;
  }

  for (let i = 0; my_arr.length > i; i++) {
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

exports.numbers_n_period = value => {
  let reg_exp = /[^0-9.]/;
  let err_msg = ', please use only numbers and periods.';
  check_regexp(reg_exp, value, err_msg);
};

exports.numbers_n_period_n_minus = value => {
  let reg_exp = /[^0-9.-]/;
  let err_msg = ', please use only numbers, periods and minus.';
  check_regexp(reg_exp, value, err_msg);
};

exports.longitude_valid =  value => {
  region_valid(value, -180, 180);
};

exports.latitude_valid = value => {
  region_valid(value, -90, 90);
};

exports.ph_valid = value => {
  region_valid(value, 0, 14);
};

exports.percent_valid = value => {
  region_valid(value, 0, 100);
};

exports.positive = value => {
  if (value !== '' && parseInt(value) < 0) {
    throw new Error("'" + value + "' is not valid, %s should be greater then 0.");
  }
};

exports.dropdown_items_validation = value => {
  if (value === 'Please choose one') {
    throw new Error('%s is required. Please choose one value from the dropdown menu');
  }
};

remove_dummy_entries = arr =>{
  let bad_values = ["Select..."];
  return arr.filter(n => !bad_values.includes(n));
};

exports.adapt_3letter_validation = (value, source) => {
  // console.time('adapt_3letter_filter');
  let has_index_and_runkey = checkArray(source.illumina_index) && checkArray(source.adapter_sequence);
  let has_adapt_3letter = checkArray(remove_dummy_entries(source.adapt_3letter));

  if (!has_index_and_runkey && !has_adapt_3letter) {
    throw new Error("Either 'Index Sequence (for Illumina) and Adapter Sequence' or 'Adapter Name (3 letters)' are required"); // jshint ignore:line
    }
  // console.timeEnd('adapt_3letter_filter');
};

const const_target_gene               = C.TARGET_GENE;
module.exports.target_gene_validation = (gene, source) => {
  let u_domains_set         = new Set(source.domain);
  let u_domains_arr         = [...u_domains_set];
  let curr_domain           = u_domains_arr[0];
  let this_domain_tg_object = module.exports.findByValueOfObject(const_target_gene, "domain", curr_domain);
  let curr_target_genes     = this_domain_tg_object[0]['target_gene'];
  let target_gene_correct   = curr_target_genes.includes(gene);
  let curr_target_genes_str = curr_target_genes.join(" or ");
  if (!target_gene_correct) {
    throw new Error('For domain ' + curr_domain + ' please choose ' + curr_target_genes_str + ' from Target Gene Name.');
  }
};

exports.geo_loc_name_validation = (value, source) => {
  if ((!checkArray(source.geo_loc_name_marine)) && (!checkArray(source.geo_loc_name_continental))) {
    throw new Error("Either 'Country' or 'Longhurst Zone' are required"); // jshint ignore:line
  }
};

exports.depth = (value, source) => {
  if ((!checkArray(source.tot_depth_water_col)) && (!checkArray(source.depth_subseafloor)) && (!checkArray(source.depth_subterrestrial))) {
      throw new Error("Either 'Depth Below Surface' or 'Depth Below Seafloor' or 'Water Column Depth' are required"); // jshint ignore:line
  }
};

exports.geo_loc_name_continental_filter = value => {
  for (const key in C.GAZ_SPELLING) {
    if (C.GAZ_SPELLING[key].includes(value.toLowerCase())) {
      return key;
    }
  }
};

exports.recommended_temperature = value => {
  if (value === '') {
    throw new Error("Temperature is recommended");
  }
};

exports.recommended_conduct = value => {
  if (value === '') {
    throw new Error("Conductivity is recommended");
  }
};

exports.slice_object_by_keys_to_arr = (obj, slice_keys) => {
  let res_arr = [];
  for (let n in slice_keys) {
    let next_f_name = slice_keys[n];
    res_arr = res_arr.concat([obj[next_f_name]]);
  }
  return res_arr;
};

exports.slice_object_by_keys = (object, slice_keys) => {
  // console.time('TIME: convert to string');
  for (let i = 0; i < slice_keys.length; i++) {
    slice_keys[i] = String(slice_keys[i]);
  }

  // console.timeEnd('TIME: convert to string');
  return Object.keys(object) // 1) for each obj's key
    .filter(key => slice_keys.includes(key)) // 2) if it is in slice_keys
    .reduce((accum, key) => { // 3) add the key/value pair to a new obj
      accum[key] = object[key];
      return accum;
    }, {});
};

if (!Object.entries)
  Object.entries = obj => {
    var ownProps = Object.keys( obj ),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array

    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    return resArray;
  };

exports.slice_object_by_positions = (my_object, begin_ind, end_ind) => {
  let sliced = [];
  sliced = Object.entries(my_object).slice(begin_ind, end_ind).map(entry => entry[1]);
  return sliced;
};

exports.get_key_index = (my_obj, my_key) => {
  my_ind = Object.keys(my_obj).indexOf(my_key);
  // my_ind += 1;
  return my_ind;
};

exports.findByValueOfObject = (arr, key, value) => {
  return arr.filter( item => {
    return (item[key] === value);
  });
};

exports.check_for_undefined0 = (req, to_check, err_msg) => {
  {
    let exists = (typeof to_check !== 'undefined');
    if (!exists) {
      req.flash('fail', err_msg);
    }
    return exists;
  }
};

exports.transpose_2d_arr_and_fill = (data_arr, matrix_length) => {
  // console.time('TIME: transpose_2d_arr_and_fill');

  //make an array with proper length, even if the first one is empty
  // var matrix_length = C.DATASET_IDS_BY_PID[project_id].length + 1;
  let length_array = data_arr[0];
  if (data_arr[0].length < matrix_length) {
    length_array = module.exports.fill_out_arr_doubles('', matrix_length);
  }

  let newArray = length_array.map( (col, i) => {
    return data_arr.map( (row) => {
      return row[i];
    });
  });
  // console.timeEnd('TIME: transpose_2d_arr_and_fill');
  return newArray;
};

exports.collect_errors = collect_errors;

function collect_errors(req) {
  let success_msgs    = req.flash("success") || [];
  let flash_msgs_sess = req.session.flash || {};
  let fail_msgs       = req.flash("fail") || [];
  let myArray_fail    = fail_msgs;

  req.session.flash = [];

  if ((typeof req.form !== 'undefined') && (req.form.errors.length > 0)) {
    let combine_err = [].concat(flash_msgs_sess.error);
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

// TODO: JSHint: This function's cyclomatic complexity is too high. (9)(W074)
function transpose_arr_of_obj(a) {
  // console.time('TIME: transpose_arr_of_obj');

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
  // console.timeEnd('TIME: transpose_arr_of_obj');
  return transposed_object;
}

// function jsUcfirst(string) {
//   return string.charAt(0).toUpperCase() + string.slice(1);
// }

//
//
//
exports.retrieve_needed_constants = (cnsts, view) => {
    var obj = {};
    obj.UNITSELECT = cnsts.UNITSELECT;
    if (view === 'view_selection'){
        obj.VISUAL_THUMBNAILS = cnsts.VISUAL_THUMBNAILS;
        obj.VISUALOUTPUTCHOICES = cnsts.VISUALOUTPUTCHOICES;
        obj.DISTANCECHOICES = cnsts.DISTANCECHOICES;
        obj.NORMALIZATIONCHOICES = cnsts.NORMALIZATIONCHOICES;
        obj.show_nas = cnsts.show_nas;
        obj.PCT_RANGE = cnsts.PCT_RANGE;
        obj.RANKS = cnsts.RANKS;
    }
    else if (view === 'unit_selection') {  // unit_selection
    
    }
    else if(view === 'visuals_index'){  // visuals_index
        obj.TARGETS = cnsts.TARGETS;
        obj.PORTALS = cnsts.PORTALS;
    }
    else if(view === 'export'){
        obj.DOMAINS = cnsts.DOMAINS;
    }
    return obj;
};

exports.is_empty = (obj_or_arr) => {
  return Object.keys(obj_or_arr).length === 0;
};

exports.is_object = (data) => {
  return data && (data.constructor === Object);
};

exports.is_array = (data) => {
  return data && (Array.isArray(data));
};

exports.create_matrix_from_biom = (res, file_path, ts) => {
    console.log('IN create_matrix_from_biom');
    let out_file_name = ts + '_count_matrix.txt';
    let biom_file_name = ts + '_count_matrix.biom';
    let biom_file_path = path.join(file_path, biom_file_name);
    let out_file_path = path.join(file_path,  out_file_name);
    //console.log("biom_file_path: " + biom_file_path);
    //console.log("out_file_path: " + out_file_path);
    fs.readFile(biom_file_path, (err, data) => {
        if(err){ console.log(err); return; }
        const parsed_data = JSON.parse(data);
        let txt = '';
        let tmp_txt = [];
        for (let n in parsed_data.columns){
            let ds = parsed_data.columns[n].id;
            tmp_txt.push(ds);
        }
        txt += '\t' + tmp_txt.join('\t') + '\n';
        for(let n in parsed_data.rows){
            txt += parsed_data.rows[n].id + '\t' + parsed_data.data[n].join('\t') + '\n';
        }        
        fs.writeFile(out_file_path, txt, (err, data) => {
            if (err) { console.log(err); return; }
            console.log("Successfully Written to File.");
            
            res.download(out_file_path); // Set disposition and send it.
        });
    });
};

module.exports.clean_escape = (text) => {
  return text.replace(/\\r?\\n|\\r|\\n/g, " ");
};

module.exports.print_log_if_not_vamps = (to_log, msg_prod = 'VAMPS PRODUCTION -- no print to log') => {
    if (CFG.site === 'vamps') {
      console.log(msg_prod);
    } else {
      console.log(to_log);
    }
}