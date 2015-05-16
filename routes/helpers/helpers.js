var constants = require(app_root + '/public/constants');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();

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
      req.flash('loginMessage', 'Please login or register before continuing.');
      res.redirect('/users/login');
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
}

module.exports.render_error_page = function(req,res,msg)
{
  req.flash('errorMessage', msg);
  res.render('error',
    { title :  'Fail',	     
  	  message : req.flash('errorMessage'),
      user : 	req.user.username
    });
}

module.exports.clear_file = function(fileName)
{
  fs.openSync(fileName, "w");
}

module.exports.append_to_file = function(fileName, text) 
{
  fs.appendFileSync(fileName, text);
}

module.exports.write_to_file = function(fileName, text) 
{
  fs.writeFile(fileName, text, function(err){
	  if(err) { 
		  throw err;
      } else {
        
	  }
  });
}
module.exports.isInt = function(value) 
{
  return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}
module.exports.IsJsonString = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports.onlyUnique = function(value, index, self) { 
    return self.indexOf(value) === index;
}

module.exports.mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

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

}
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
      var user_id = rows[i].owner_user_id;
      
      PROJECT_ID_BY_DID[did]=pid;

      PROJECT_INFORMATION_BY_PID[pid] = {
        "last" :			rows[i].last_name,
        "first" :			rows[i].first_name,
        "username" :		rows[i].username,
        "email" :			rows[i].email,
        "env_source_name" :	rows[i].env_source_name,
        "institution" :		rows[i].institution,
        "project" :			project,
		"pid" :			    pid,
        "title" :			rows[i].title,
        "description" :		rows[i].description,
        "public" :          rows[i].public,
		  
      }
      if(public){
        PROJECT_INFORMATION_BY_PID[pid].permissions = 0;
      }else{
        PROJECT_INFORMATION_BY_PID[pid].permissions = user_id;
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
      
      DATASET_NAME_BY_DID[did] = dataset
      
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
	
    
    for(did in AllMetadata){
  	  for(mdname in AllMetadata[did] ){
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
  				DatasetsWithLatLong[did]={}
				
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
    AllMetadataNames.sort();
    
	
}
//
//
//
module.exports.run_select_sequences_query = function(rows){
        for (var i=0; i < rows.length; i++) {
        //console.log(rows[i].project_id);
          var pid = rows[i].project_id;
          var did = rows[i].dataset_id;
          var count= rows[i].seq_count;
          ALL_DCOUNTS_BY_DID[did] = parseInt(count);
         

          if(pid in ALL_PCOUNTS_BY_PID){
             ALL_PCOUNTS_BY_PID[pid] += parseInt(count);
          }else{
             ALL_PCOUNTS_BY_PID[pid] = parseInt(count);
          }
        }
}
module.exports.update_global_variables = function(pid,type){
	if(type=='del'){
		var dids= DATASET_IDS_BY_PID[pid];
		var pname = PROJECT_INFORMATION_BY_PID[pid].project;
		
		for(i in ALL_DATASET){
			item = ALL_DATASETS[i];
			// {"name":"142","pid":105,"title":"Title","datasets":[{"did":496,"dname":"142_ds","ddesc":"142_ds_description"}]
			if(item.pid == pid){
				ALL_DATASETS.splice(i,1);
				break;
			}
			
		}
		for(d in dids){
			
			delete PROJECT_ID_BY_DID[dids[d]];
			delete DATASET_NAME_BY_DID[dids[d]];
			delete ALL_DCOUNTS_BY_DID[dids[d]];
		}
		delete PROJECT_INFORMATION_BY_PID[pid];
		delete DATASET_IDS_BY_PID[pid];
		delete ALL_PCOUNTS_BY_PID[pid];
		delete PROJECT_INFORMATION_BY_PNAME[pname];
		
	}else if(type=='add'){
		
	}else{
		// ERROR
	}
}


