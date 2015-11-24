var constants = require(app_root + '/public/constants');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var queries = require('../queries');
var util = require('util');
var path  = require('path');

module.exports = {

  

  // route middleware to make sure a user is logged in
  isLoggedIn: function (req, res, next) {

      
      
      // if user is authenticated in the session, carry on
      
      if (req.isAuthenticated()) {
        console.log("Hurray! isLoggedIn.req.isAuthenticated");
        return next();
      }
      // if they aren't redirect them to the home page
      console.log("Oops! NOT isLoggedIn.req.isAuthenticated");
      // save the url in the session 
      req.session.returnTo = req.path;
      //console.log('URL Requested: '+JSON.stringify(req));
      //console.log(util.inspect(req, {showHidden: false, depth: null}));
      req.flash('loginMessage', 'Please login or register before continuing.');
      res.redirect('/users/login');
      return;
      // res.render('user_admin/login', {
      //                 title: 'VAMPS: Login',                      
      //                 message      : req.flash(),
      //                 user         : req.user
      // });  // end render

  },
  
  // route middleware to make sure a user is an aministrator
  isAdmin: function (req, res, next) {

      //if user is authenticated in the session, carry on
      
      if (req.user.security_level === 1) {
        console.log("Hurray! USER is an Admin");
        return next();
      }
      // if they aren't redirect them to the home page
      console.log("Whoa! NOT an Admin");
      // save the url in the session 
      req.session.returnTo = req.path;
      //console.log('URL Requested: '+JSON.stringify(req));
      //console.log(util.inspect(req, {showHidden: false, depth: null}));
      //req.flash('loginMessage', 'Please login or register before continuing.');
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

var ranks = constants.RANKS;

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
      user : 	req.user.username
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
            "first" :			      rows[i].first_name,
            "username" :		    rows[i].username,
            "oid" :             owner_id,
            "email" :			      rows[i].email,
            "env_source_name" : rows[i].env_source_name,
            "env_source_id" :   rows[i].env_sample_source_id,
            "institution" :		  rows[i].institution,
            "project" :			    project,
    		    "pid" :			        pid,
            "title" :			      rows[i].title,
            "description" :	    rows[i].project_description,
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
	
    console.log('Cleaning Metadata');
    var clean_metadata = {};
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
    AllMetadata = clean_metadata;
    AllMetadataNames.sort();

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
          ALL_CLASSIFIERS_BY_PID[pid] = ALL_CLASSIFIERS_BY_CID[cid];

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
              if(PROJECT_INFORMATION_BY_PID[pid].permissions.indexOf(uid) === -1){
                PROJECT_INFORMATION_BY_PID[pid].permissions.push(uid);
              }
            }
          }          
        }
        //console.log(PROJECT_INFORMATION_BY_PID)
};
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
module.exports.get_status = function(user, project){
    var statQuery='';
    statQuery += "SELECT status,message from user_project_status";  
    statQuery += " WHERE user='"+user+"' and project ='"+project+"' ";
    console.log(statQuery);
        connection.query(statQuery , function(err, rows, fields){
              if(err) { console.log('ERROR-in status query: '+err); 
            }else{
              return rows;
            } 
                           
    });
};
module.exports.update_status = function(status_params){
  console.log('in update_status');
  if(status_params.type == 'delete'){
    var statQuery = '';
        statQuery += "DELETE from user_project_status";  
        statQuery += " WHERE user='"+status_params.user+"' and project ='"+status_params.project+"' ";
        console.log('query: '+statQuery);
        connection.query(statQuery , function(err, rows, fields){
              if(err) { console.log('ERROR1-in status update: '+err); }               
        });
  }else if(status_params.type == 'update'){
        
    var statQuery2 = '';
              if('pid' in status_params && 'project' in status_params){  
                  statQuery2 += "UPDATE user_project_status set status='"+status_params.status+"', message='"+status_params.msg+"'";  
                  statQuery2 += " WHERE user='"+status_params.user+"' and project ='"+status_params.project+"' and project_id='"+status_params.pid+"'";
              }else if('pid' in status_params){
                  statQuery2 += "UPDATE user_project_status set status='"+status_params.status+"', message='"+status_params.msg+"'";  
                  statQuery2 += " WHERE user='"+status_params.user+"' and project_id='"+status_params.pid+"'";
              }else if('project' in status_params){  
                  statQuery2 += "UPDATE user_project_status set status='"+status_params.status+"', message='"+status_params.msg+"'";  
                  statQuery2 += " WHERE user='"+status_params.user+"' and project ='"+status_params.project+"'";
              }else{
                //ERROR
              }
              console.log('query2: '+statQuery2);
              connection.query(statQuery2 , function(err, rows, fields){
                    if(err) { 
                      console.log('ERROR2-in status update: '+err); 
                    }else{
                      console.log('status update2'); 
                    } 
              }); 
                        
        
  } else {
    var statQuery1 = '';
      if('pid' in status_params && 'project' in status_params){        
        statQuery1 += "INSERT IGNORE into user_project_status (user,project,project_id,status,message)";          
        statQuery1 += " VALUES ('"+status_params.user+"','"+status_params.project+"','"+status_params.pid+"','"+status_params.status+"','"+status_params.msg+"')";
      }else if('pid' in status_params){
        statQuery1 += "INSERT IGNORE into user_project_status (user,project_id,status,message)";          
        statQuery1 += " VALUES ('"+status_params.user+"','"+status_params.pid+"','"+status_params.status+"','"+status_params.msg+"')";
      }else if('project' in status_params){
        statQuery1 += "INSERT IGNORE into user_project_status (user,project,status,message)";          
        statQuery1 += " VALUES ('"+status_params.user+"','"+status_params.project+"','"+status_params.status+"','"+status_params.msg+"')";
      }else{
        // ERROR
      }
      console.log('query1: '+statQuery1);

      connection.query(statQuery1 , function(err, rows, fields){
            if(err) { 
              console.log('ERROR1-in status update: '+err); 
            }else{
              console.log('status update1'); 
            }
      });
  }       
  
};

module.exports.assignment_finish_request = function(res, rows1, rows2, status_params) {
        console.log('query ok1 '+JSON.stringify(rows1));   // queries.get_select_datasets_queryPID
        console.log('query ok2 '+JSON.stringify(rows2));	// queries.get_select_sequences_queryPID	           
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
            new_taxonomy.make_html_tree_file(new_taxonomy.taxa_tree_dict_map_by_id, new_taxonomy.taxa_tree_dict_map_by_rank["domain"]);    
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
module.exports.update_metadata_from_file = function (){
    var meta_file      = path.join(process.env.PWD,'public','json',NODE_DATABASE+'--metadata.json');
    try {
      AllMetadata        = require(meta_file);
    }
    catch (e) {
      console.log(e);
      AllMetadata = {};
    }
};
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
