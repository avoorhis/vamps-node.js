var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var queries = require('./queries');
var config  = require(app_root + '/config/config');
var fs      = require('fs-extra');
var path      = require('path');
var spawn     = require('child_process').spawn;
var multer    = require('multer');
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, '/tmp');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});
var upload = multer({ storage : storage}).single('upload_metadata_file');

router.get('/admin_index', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {

  console.log('in admin');
   res.render('admin/admin_index', {
              title     :'VAMPS Site Administration',
              message   : req.flash('message'),
              user: req.user,
              hostname: req.CONFIG.hostname, // get the user out of session and pass to template
            });

});
//
//
//
router.get('/assign_permissions', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {

  console.log('in assign_permissions');
   res.render('admin/assign_permissions', {
              title     :'VAMPS Site Administration',
              message   : req.flash('message'),
              user: req.user,
              project_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
              user_info: JSON.stringify(ALL_USERS_BY_UID),
              hostname: req.CONFIG.hostname, // get the user out of session and pass to template
            });

});

//
//
//
router.get('/permissions', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {

  console.log('in permissions');
  //console.log(ALL_USERS_BY_UID);
  //console.log(PROJECT_INFORMATION_BY_PID);
   res.render('admin/permissions', {
              title     :'VAMPS Site Administration',
              message   : req.flash('message'),
              user: req.user,
              project_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
              user_info: JSON.stringify(ALL_USERS_BY_UID),
              hostname: req.CONFIG.hostname, // get the user out of session and pass to template
            });

});
router.get('/public', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {

  console.log('in public');
  //console.log(ALL_USERS_BY_UID);
  //console.log(PROJECT_INFORMATION_BY_PID);
   res.render('admin/public', {
              title     :'VAMPS Site Administration',
              message   : req.flash('message'),
              user: req.user,
              project_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
              user_info: JSON.stringify(ALL_USERS_BY_UID),
              hostname: req.CONFIG.hostname, // get the user out of session and pass to template
            });

});
router.post('/public_update', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {

   console.log('in public_update');
   //console.log(ALL_USERS_BY_UID);
   //console.log(PROJECT_INFORMATION_BY_PID);
   selected_pid = req.body.pid ;
   new_public = parseInt(req.body.public);
   //console.log(selected_pid,' ',new_public)
   response = 'no'
   if(new_public !== PROJECT_INFORMATION_BY_PID[selected_pid].public){
      q = "UPDATE project set public='"+new_public+"' WHERE project_id='"+selected_pid+"'";

      if(new_public === 1){
            PROJECT_INFORMATION_BY_PID[selected_pid].public = 1;
            PROJECT_INFORMATION_BY_PID[selected_pid].permissions = [];
      }else{
            // give owner sole permissions
            PROJECT_INFORMATION_BY_PID[selected_pid].permissions = [PROJECT_INFORMATION_BY_PID[selected_pid].oid];
            PROJECT_INFORMATION_BY_PID[selected_pid].public = 0;
      }
      connection.query(q, function(err, rows, fields){
            //console.log(qSequenceCounts)
                if (err)  {
                  console.log('Query error: ' + err);
                  response = 'Query error: ' + err;
                }else{
                  response = 'Successfully updated';
                }
                res.send(response);
      });
  }else{
    res.send('no change to public status');
  }
});
router.post('/show_user_info', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {

  console.log('in show_user_info');
  selected_uid = req.body.uid;
      if(selected_uid in ALL_USERS_BY_UID){
        info = ALL_USERS_BY_UID[selected_uid];
      }else{

      }
      html = '<hr>';
      html += '<table>';
      html += '<tr>';
      html += '<td>Last</td><td>'+info.last_name+'</td>';
      html += '</tr>';
      html += '<tr>';
      html += '<td>First</td><td>'+info.first_name+'</td>';
      html += '</tr>';
      html += '<tr>';
      html += '<td>UserName</td><td>'+info.username+'</td>';
      html += '</tr>';
      html += '<table>';


      res.send(html);

});
//
//
//
router.get('/alter_datasets', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
   
    console.log('in alter_datasets')
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    if(url_parts.query.pid === undefined){
     //ERROR
     return
    }else{
    var pid = url_parts.query.pid;
    }

    ALL_DATASETS.projects.forEach(function(prj) {
      if(prj.pid == pid){
        myjson = prj;        
      }
    });

    console.log(myjson) 
    res.render('admin/alter_datasets', {
              title     :'VAMPS Site Administration',
              message   : req.flash('message'), 
              user: req.user, 
              pid: pid,
              //constants.ENV_SOURCE
              project_info: JSON.stringify(myjson),
              project: PROJECT_INFORMATION_BY_PID[pid].project,
              hostname: req.CONFIG.hostname, // get the user out of session and pass to template
            }); 

});
//
//
//
router.get('/alter_project', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {

  console.log('in alter_project');
   var url = require('url');
   var url_parts = url.parse(req.url, true);
   var query = url_parts.query;
   var pid;
   
   if(url_parts.query.pid === undefined){
    pid = 0;
   }else{
    pid = url_parts.query.pid;
   }
   console.log(pid);
   res.render('admin/alter_project', {
              title     :'VAMPS Site Administration',
              message   : req.flash('message'),
              user: req.user,
              pid_to_open:pid,
              env: JSON.stringify(req.CONSTS.ENV_SOURCE),
              project_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
              user_info: JSON.stringify(ALL_USERS_BY_UID),
              hostname: req.CONFIG.hostname, // get the user out of session and pass to template
            });

});
//
//
//
router.post('/show_project_info', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {

  console.log('in show_user_info');
  //console.log(PROJECT_INFORMATION_BY_PID);

  selected_pid = req.body.pid;
      if(selected_pid in PROJECT_INFORMATION_BY_PID){
        info = PROJECT_INFORMATION_BY_PID[selected_pid];
      }else{

      }
      html = '';

      html += "<table class='admin_table' border='1'>";

      html += '<tr><th></th><th>Current Value</th><th>Enter or Select New Value</th><th></th><th>Msg</th></tr>';

      html += '<tr>';
      html += "<form id='' name='update_pname_form' method='POST' action='update_pname'>";
      html += ' <td>Project Name (pid)</td><td>'+info.project+' <small>('+info.pid+')</small></td>';
      html += " <td><input type='edit' id='new_pname' name='new_pname' value='"+info.project+"' width='200' style='width: 200px' /></td>";
      html += " <td><input id='new_pname_btn' type='button' value='Update' onclick=\"update_project('pname', '"+selected_pid+"')\"></td>";
      html += " <td><div id='new_pname_response_id'></div></td>";
      html += "</form>";
      html += '</tr>';

      html += '<tr>';
      html += "<form id='' name='update_powner_form' method='POST' action='update_powner'>";
      html += ' <td>Owner (username-uid)</td><td>'+info.last+', '+info.first+' <small>('+info.username+"-"+info.oid+')</small></td>';
      html += ' <td>';
      html += " <select id='new_oid' name='new_oid' width='200' style='width: 200px'>";
      for(uid in ALL_USERS_BY_UID) {
          if(ALL_USERS_BY_UID[uid].username !== 'guest'){
            if(ALL_USERS_BY_UID[uid].username === info.username){
              html += "    <option selected value='"+uid+"'>"+ALL_USERS_BY_UID[uid].last_name+","+ALL_USERS_BY_UID[uid].first_name;
              html += "     <small>("+ALL_USERS_BY_UID[uid].username+")</small></option>";
            }else{
              html += "    <option value='"+uid+"'>"+ALL_USERS_BY_UID[uid].last_name+","+ALL_USERS_BY_UID[uid].first_name;
              html += "     <small>("+ALL_USERS_BY_UID[uid].username+")</small></option>";
            }
          }
      }
      html += " </select>";
      html += ' </td>';
      html += " <td><input id='new_powner_btn' type='button' value='Update' onclick=\"update_project('powner', '"+selected_pid+"')\"></td>";
      html += " <td><div id='new_powner_response_id'></div></td>";
      html += "</form>";
      html += '</tr>';


      html += '<tr>';
      html += "<form id='' name='update_ptitle_form' method='POST' action='update_ptitle'>";
      html += ' <td>Project Title</td><td><span>'+info.title+'</span></td>';
      html += " <td><input type='edit' id='new_ptitle' name='new_ptitle' value='"+info.title+"' width='200' style='width: 200px'/></td>";
      html += " <td><input id='new_ptitle_btn' type='button' value='Update' onclick=\"update_project('ptitle', '"+selected_pid+"')\"></td>";
      html += " <td><div id='new_ptitle_response_id'></div></td>";
      html += "</form>";
      html += '</tr>';

      html += '<tr>';
      html += "<form id='' name='update_pdesc_form' method='POST' action='update_pdesc'>";
      html += ' <td>Project Description</td><td><span>'+info.description+'</span></td>';
      html += " <td><textarea id='new_pdesc' name='new_pdesc'  value='"+info.description+"' rows='2' cols='28'>"+info.description+"</textarea></td>";
      html += " <td><input id='new_pdesc_btn' type='button' value='Update' onclick=\"update_project('pdesc', '"+selected_pid+"')\"></td>";
      html += " <td><div id='new_pdesc_response_id'></div></td>";
      html += "</form>";
      html += '</tr>';

      

      html += '<tr>';
      html += "<form id='' name='update_penv_form' method='POST' action='update_penv'>";
      html += "<td>Environmental Source</td><td>"+ info.env_source_name+"</td>";
      html += "<td>";
      html += " <select id='new_eid' name='new_eid' width='200' style='width: 200px'> ";   
      for(eid in req.CONSTS.ENV_SOURCE) {                        
          if(req.CONSTS.ENV_SOURCE[eid] === info.env_source_name){
              html += "<option selected value='"+ eid+"'>"+ req.CONSTS.ENV_SOURCE[eid];
              html += " <small>("+ eid +")</small></option>";
          }else{
              html += "<option value='"+ eid+"'>"+ req.CONSTS.ENV_SOURCE[eid];
              html += " <small>("+ eid +")</small></option>";
          }                           
      }  
      html += '</select>';
      html += '</td>';
      html += "<td><input id='new_penv_btn' type='button' value='Update' onclick=\"update_project('penv', '"+selected_pid+"')\"></td>";
      html += "<td><div id='new_penv_response_id'></div></td>";
      html += "</form>";
      html += '</tr>';


      html += '<tr>';
      if(info.public === 1){
        html += '<td>Public</td><td>True</td>';
      }else{
        html += '<td>Public</td><td>False</td>';
      }


      html += '<td><a href="public">View or Change</a></td>';
      html += "<td></td>";
      html += "<td></td>";
      html += '</tr>';

      html += '<tr>';
      html += '<td>Permissions</td><td>'+info.permissions+'</td>';
      html += '<td><a href="permissions">View or Change</a></td>';
      html += "<td></td>";
      html += "<td></td>";
      html += '</tr>';

      html += '<tr>';
      html += '<td>Datasets</td><td></td>';
      html += "<td><a href=\"alter_datasets?pid="+selected_pid+"\">View or Change</a></td>";
      html += "<td></td>";
      html += "<td></td>";
      html += '</tr>';

      html += '<table>';
      //html += "<input type='submit' value='Update'>";
      //html += "<input type='hidden' name='pid' value='"+selected_pid+"'>";
      //html += '</form>'

      res.send(html);

});
//
//
//
router.post('/update_dataset_info', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
  //console.log(req.body)
  console.log('in update_dataset_info');
  var did = req.body.did;
  var pid = req.body.pid;
  var new_name = req.body.name;
  var new_desc = req.body.desc;

  DATASET_NAME_BY_DID[did] = name;
  ALL_DATASETS.projects.forEach(function(prj) {
    if(prj.pid == pid){
      prj.datasets.forEach(function(ds) {
        if(ds.did == did){
          ds.dname = new_name;
          ds.ddesc = new_desc;
        }
      });          
    }
  });

  console.log(new_name+' -- '+new_desc)
  res.send('Done!')

});
//
//
//
router.post('/update_project_info', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {

  console.log(req.body);

  console.log('in update_project_info');
  var item_to_update = req.body.item;
  var value = req.body.value;
  var pid = req.body.pid;
  var q = "UPDATE project set";

  console.log(ALL_DATASETS);
  console.log(typeof ALL_DATASETS);

  switch(item_to_update){
      case 'pname':
          new_project_name = value;
          var rev_pname = helpers.reverse(new_project_name);
          var old_project_name = PROJECT_INFORMATION_BY_PID[pid].project;
          PROJECT_INFORMATION_BY_PID[pid].project     = new_project_name;
          delete PROJECT_INFORMATION_BY_PNAME[old_project_name];
          PROJECT_INFORMATION_BY_PNAME[new_project_name] = PROJECT_INFORMATION_BY_PID[pid];
          ALL_DATASETS.projects.forEach(function(prj) {
              if(prj.pid == pid){
                prj.name = new_project_name;
              }
          });



          q += " project='"+new_project_name+"', rev_project_name='"+rev_pname+"' ";
          break;

      case 'powner':
          new_owner_id = value;
          PROJECT_INFORMATION_BY_PID[pid].last        = ALL_USERS_BY_UID[new_owner_id].last_name;
          PROJECT_INFORMATION_BY_PID[pid].first       = ALL_USERS_BY_UID[new_owner_id].first_name;
          PROJECT_INFORMATION_BY_PID[pid].username    = ALL_USERS_BY_UID[new_owner_id].username;
          PROJECT_INFORMATION_BY_PID[pid].email       = ALL_USERS_BY_UID[new_owner_id].email;
          PROJECT_INFORMATION_BY_PID[pid].institution = ALL_USERS_BY_UID[new_owner_id].institution;
          PROJECT_INFORMATION_BY_PID[pid].oid         = new_owner_id;
          q += " owner_user_id='"+new_owner_id+"'" ;
          break;

      case 'ptitle':
          new_project_title = value;
          PROJECT_INFORMATION_BY_PID[pid].title       = new_project_title;
          ALL_DATASETS.projects.forEach(function(prj) {
              if(prj.pid == pid){
                prj.title = new_project_title;
              }
          });
          q += " title='"+new_project_title+"'";
          break;

      case 'pdesc':
          new_project_desc = value;
          PROJECT_INFORMATION_BY_PID[pid].description = new_project_desc;
          q += " project_description='"+new_project_desc+"'";
          break;

      case 'penv':
          new_project_envid = value;
          PROJECT_INFORMATION_BY_PID[pid].env_source_name = new_project_envid;
          q += " env_source_id='"+new_project_env+"'";          
          break;
      default:
          console.log('ERROR in update_project_info');

    }
    q += " WHERE project_id='"+pid+"'";

    console.log(q);
    connection.query(q, function(err, rows, fields){
        //console.log(qSequenceCounts)
            if (err)  {
              console.log('Query error: ' + err);
              response = 'Query error: ' + err;
            }else{
              response = 'Successfully updated';

            }

            res.send(response);

    });


});
//
//
//
router.post('/grant_access', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {

      console.log('in grant_access');
      selected_uid = req.body.uid;
      selected_pid = req.body.pid;
      var html = 'Successfully Updated';
      // 1-add to PROJECT_INFORMATION_BY_PID[selected_pid]

      if(selected_pid in PROJECT_INFORMATION_BY_PID){        
        //console.log(PROJECT_INFORMATION_BY_PID[selected_pid].permissions)
        //console.log(PROJECT_INFORMATION_BY_PID[selected_pid].permissions.indexOf(parseInt(selected_uid)))
        if(PROJECT_INFORMATION_BY_PID[selected_pid].permissions.indexOf(parseInt(selected_uid)) === -1){
            PROJECT_INFORMATION_BY_PID[selected_pid].permissions.push(parseInt(selected_uid))
            //console.log('11111')

        }else{
          html = 'User already has access to this project.'
          res.send(html);

          //html = 'Trying to push!'

          console.log('22222');
          return;

        }
      }else{
        html = 'Could not find project - This is a PROBLEM!';
      }

      // 2- add to table 'access'
      //q = "INSERT ignore into `access` (user_id, project_id) VALUES('"+selected_uid+"','"+selected_pid+"')"
      connection.query(queries.insert_access_table(selected_uid,selected_pid), function(err, rows, fields){
      //console.log(qSequenceCounts)
          if (err)  {
            console.log('Query error: ' + err);

            html = 'Query error: ' + err;
          } else {

          }
          res.send(html);

      });

});
//
//
//
router.get('/new_user', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
    console.log('in new_user GET ADMIN')

    res.render('admin/new_user', {
              title     :'VAMPS Create new user',
              message   : req.flash('message'),
              user      : req.user,
              hostname  : req.CONFIG.hostname
    });
});
//
//
//
router.post('/new_user', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
    console.log('in new_user --POST')
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.useremail;
    var first = req.body.userfirstname;
    var last = req.body.userlastname;
    var inst = req.body.userinstitution;
    var finish = function(){
      res.render('admin/new_user', {
                            title     :'VAMPS Create new user',
                            message   : req.flash('message'),
                            user: req.user,
                            hostname: req.CONFIG.hostname
                          });

    };
    if(password.length < 3 || password.length > 12){
        req.flash('message', 'The password must be between 3 and 20 characters.');
    }
    if(helpers.checkUserName(username)){
        req.flash('message', "The username cannot have any special characters (including <space> and underscore '_'). Alphanumeric only.");
    }
    if(username.length < 3 || username.length > 15){
        req.flash('message', 'The username must be between 3 and 15 characters. Alphanumeric only.');
    }
    if( email.indexOf("@") == -1 || email.length < 3 || email.length > 100 ){
        req.flash('message', 'The email address is empty or the wrong format.');
    }
    if( first.length < 1 || first.length > 50 ||  last.length < 1 || last.length > 50 ){
        req.flash('message', 'Both first and last names are required.');
    }
    if( inst.length < 1 || inst.length > 50){
        req.flash('message', 'The Institution name is required.');
    }else{



        req.db.query("select * from user where username = '"+username+"'",function(err,rows){
                if (err) {
                  return done(null, false, { message: err });
                }
                if (rows.length) {
                    //console.log('That username is already taken.');
                    return done(null, false, req.flash('message', 'That username is already taken.'));
                } else {

                    var insertQuery = "INSERT INTO user (username, encrypted_password, first_name, last_name, email, institution, active, sign_in_count, current_sign_in_at, last_sign_in_at)";
                    insertQuery +=    " VALUES ('" + username +"', '"+ 
                                        helpers.generateHash(password) +"', '"+ 
                                        first +"', '"+ 
                                        last +"', '"+ 
                                        email +"', '"+ 
                                        inst +"',"+
                                        " 1,"+
                                        " 1,"+
                                        " CURRENT_TIMESTAMP(), "+
                                        " CURRENT_TIMESTAMP() )";

                    console.log(insertQuery);
                    req.db.query(insertQuery, function(err,rows){
                        user_id = rows.insertId;
                        ALL_USERS_BY_UID[user_id] = {}
                        ALL_USERS_BY_UID[user_id].email       = email;
                        ALL_USERS_BY_UID[user_id].username    = username;
                        ALL_USERS_BY_UID[user_id].last_name   = last;
                        ALL_USERS_BY_UID[user_id].first_name  = first;
                        ALL_USERS_BY_UID[user_id].institution = inst;
                       
                        req.flash('message', 'Success (user:'+username+'; uid:'+user_id+')');
                        finish();
                        return;

                    });
                }
        });
        return;
         
    }    
    finish();
});
//
//
//
router.get('/reset_user_password', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
    console.log('in reset_user_password');
    res.render('admin/new_password', {
              title     :'VAMPS Reset User Password',
              message   : req.flash('message'),
              user: req.user,
              user_info: JSON.stringify(ALL_USERS_BY_UID),
              hostname: req.CONFIG.hostname, // get the user out of session and pass to template
            });
});
router.post('/reset_user_password', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
    console.log('in reset_user_password --POST');
    console.log(req.body)
    var uid = req.body.user_id;
    var password = req.body.password;
    var finish = function(){
      res.render('admin/new_password', {
              title     :'VAMPS Reset User Password',
              message   : req.flash('message'),
              user: req.user,
              user_info: JSON.stringify(ALL_USERS_BY_UID),
              hostname: req.CONFIG.hostname, // get the user out of session and pass to template
            });

    };
    if(password.length < 3 || password.length > 12){
        req.flash('message', 'FAILED: The password must be between 3 and 20 characters.');
    }else if(uid == ''){
        req.flash('message', 'FAILED: You must select a user.');
    }else{
        
        var updateQuery = "UPDATE user set encrypted_password='"+helpers.generateHash(password)+"' where user_id='"+uid+"'";
        console.log(updateQuery);
        req.db.query(updateQuery, function(err,rows){
          if (err) {
              req.flash('message', 'FAILED: sql error '+err);
          }else{
              req.flash('message', 'Success ( uid: '+uid+' )');
          }
            finish();
            
        });
        return;

    }
    finish();
});

router.get('/update_metadata', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
  console.log('in GET validate_metadata');
  res.render('admin/validate_metadata', {
              title     :'VAMPS Validate Metadata',
              message   : req.flash('message'),
              user: req.user,
              project_info: JSON.stringify(PROJECT_INFORMATION_BY_PNAME),
              hostname: req.CONFIG.hostname, // get the user out of session and pass to template
  });
});
//
//
//
router.post('/show_metadata', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
  console.log('In POST show_metadata');
  console.log(req.body)
  pid = req.body.pid
  //console.log(pid)
  //console.log(PROJECT_INFORMATION_BY_PID[pid].project)
  html_json = {};
  html_json.data = {};
  req_metadata = req.CONSTS.REQ_METADATA_FIELDS

  mdata = {}
  dids = DATASET_IDS_BY_PID[pid]
  for(n in dids){
    mdata[dids[n]] = AllMetadata[dids[n]]
  }
  //console.log(mdata)  // has ids need to convert
  mdata = convert_ids_to_names_for_display(mdata)
  //console.log(mdata)
  html_json.validation = validate_metadata(req, mdata)
  //console.log('validation result')
  //console.log(html_json.result)
  // for display we need the same order of fields
  // AND each dataset needs the all the fields
  html_json.sorted_req_header_names = req_metadata.sort()
  headers_cust = {}
  for(did in mdata){
    for(mdname in mdata[did]){
        if(req_metadata.indexOf(mdname) == -1){
            headers_cust[mdname] = 1  // lookup
        }
    }
  }
  html_json.sorted_cust_header_names = Object.keys(headers_cust).sort()
  //console.log('sorted_cust_header_names')
  //console.log(html_json.sorted_cust_header_names)
  for(did in mdata){ // each item is a dataset_id
    ds = DATASET_NAME_BY_DID[did]    
    html_json.data[ds] = {}
    html_json.data[ds].req_data = []
    html_json.data[ds].cust_data = []
    
    for(i in html_json.sorted_cust_header_names){
      mdname = html_json.sorted_cust_header_names[i]
      if(mdata[did].hasOwnProperty(mdname)){
        html_json.data[ds].cust_data.push(mdata[did][mdname])
      }else{
        html_json.data[ds].cust_data.push('')
      }
    }
    for(i in html_json.sorted_req_header_names){
      mdname = html_json.sorted_req_header_names[i]
      //console.log('mdname '+mdname)
      if(mdata[did].hasOwnProperty(mdname)){
        html_json.data[ds].req_data.push(mdata[did][mdname])   
      }else{
        html_json.data[ds].req_data.push('')
      }
    }
  }
  //console.log('html_json')
  //console.log(html_json)
  res.json(html_json);
});
//
//
//

//
//
//
router.post('/apply_metadata', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
  console.log('in apply_metadata')
  if(req.CONFIG.site == 'vamps' ){
    console.log('VAMPS PRODUCTION -- no print to log');
  }else{
    console.log(req.body)
  }
  var timestamp = +new Date();
  var selected_pid = req.body.pid
  var filename = req.body.filename
  var file_path = path.join(process.env.PWD,'tmp',filename) 
  var dids = DATASET_IDS_BY_PID[selected_pid]
  new_required_metadata = {}
  new_custom_metadata = {}
  mdata = {}
  for(name in req.body){
    //console.log('name in req.body '+name)
    if(name != 'pid' && name != 'filename'){
        
      items = name.split('--')
      dset = items[0]
      // get did
      did = 0
      for(i in dids){
        if(DATASET_NAME_BY_DID[dids[i]] == dset){
          did = dids[i]
        }
      }
      //console.log('AllMetadata[did]1 '+did)
      //console.log(AllMetadata[did])
      if(did == 0){
        console.log('ERROR -- missed did')
      }
      mdname = items[1]
      value = req.body[name]
      if(did in mdata){
        mdata[did][mdname] = value
      }else{
        mdata[did] = {}
        mdata[did][mdname] = value
      }
      
    }
  }
  //console.log('mdata1')
  //console.log(mdata)
  //mdata = convert_names_to_ids_for_storage(mdata)
  //console.log('mdata2')
  //console.log(mdata)
  //id_list = ['fragment_name','country','dna_region','domain','env_biome','env_feature','env_matter','env_package','sequencing_platform']
  for(did in mdata){
    new_required_metadata[did] = {}
    new_custom_metadata[did] = {}
    for(mdname in mdata[did]){
        var val = mdata[did][mdname]        
        if(req.CONSTS.REQ_METADATA_FIELDS.indexOf(mdname) == -1){
            new_custom_metadata[did][mdname]    = val
        }else{
            new_required_metadata[did][mdname]  = val            
        }
        if(AllMetadata.hasOwnProperty(did)){
            AllMetadata[did][mdname]            = val
        }else{
            AllMetadata[did] = {}
            AllMetadata[did][mdname]            = val
        }
        
    }
  }
  
  // Run script to add custom and required metadata to mysql database
  var options = { scriptPath : req.CONFIG.PATH_TO_NODE_SCRIPTS,
                  args : [ '-host', req.CONFIG.dbhost, '-f', file_path, '-pid', selected_pid, '-q' ]
              };
  var script_name = 'vamps_script_update_metadata.py'
  var script_path = path.join(req.CONFIG.PATH_TO_NODE_SCRIPTS,script_name)
  var full_script_path = script_path + ' ' + options.args.join(' ')
  
  ////No module named argparse  need path
  var update_metadata_process = spawn( options.scriptPath + '/vamps_script_update_metadata.py', options.args, {
                        env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
                        detached: true, stdio: 'pipe'
                    });  // stdin, stdout, stderr
  //var exec = require('child_process').exec;
  
  console.log(full_script_path)
  //var child = exec(full_script_path);
  var output = '';
  
  update_metadata_process.stdout.on('data', function UpdateMetadata(data) {
        data = data.toString().trim();
        console.log('stdout: ' + data);
        output += data;
  });
  update_metadata_process.stderr.on('data', function(data) {
      console.log('stderr: ' + data);
      req.flash('message', 'Metadata Update Failed');
  });
  update_metadata_process.on('close', function checkExitCode(code) {
     console.log('From apply_metadata process exited with code ' + code);
     if(req.CONFIG.site == 'vamps' ){
        console.log('VAMPS PRODUCTION -- no print to log');
     }else{
        console.log('OUTPUT:\n'+output )
     }
     req.flash('message', 'Success in updating metadata');
     res.render('admin/validate_metadata', {
              title     :'VAMPS Validate Metadata',
              message   : req.flash('message'),
              user: req.user,
              project_info: JSON.stringify(PROJECT_INFORMATION_BY_PNAME),
              hostname: req.CONFIG.hostname, // get the user out of session and pass to template
    });
  });
  
  
 

});
//
//
//
router.post('/upload_metadata', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
  var parse = require('csv-parse');
  console.log('In POST admin upload_metadata');
  var username = req.user.username;
  var timestamp = +new Date();
  if(req.CONFIG.site == 'vamps' ){
    console.log('VAMPS PRODUCTION -- no print to log');
  }else{
    console.log(req.body)
  }
  upload(req,res,function(err) {
        if(err) {  console.log('Error uploading file: '+err.toString()); return res.end("Error uploading file.");  }
        req_metadata = req.CONSTS.REQ_METADATA_FIELDS
        var html_json = {};
        if(! req.hasOwnProperty('file')){
          res.end("Error uploading file: project selected? file to upload selected?")
          return
        }
        
        var selected_pid = req.body.pid
        var dataset_ids = DATASET_IDS_BY_PID[selected_pid]
        var project_name = PROJECT_INFORMATION_BY_PID[selected_pid].project
        var metadata_file = req.file.path
        
         var parser = parse({delimiter: '\t'}, function createParserPipe(err, mdata) {
              if(err) {  
                console.log('parsing error'); 
                res.json(JSON.stringify({"error":true,"msg":["Error parsing file: "+err.toString()]}));
                return 
              }
              html_json.validation = {}
              html_json.validation.error = false
              html_json.validation.empty_values = false
              html_json.validation.msg = []
              //console.log("mdata: ");
              //console.log(mdata);
              

              //console.log('req_metadata')
              //console.log(req_metadata)
              var dataset_field_names = ['sample_name','#SampleID','dataset','Dataset']
              var title_row = mdata[0]
              idx = dataset_field_names.indexOf(title_row[0])
              if(idx != -1){
                dataset_field = title_row[0]
                //console.log('found dataset_field '+dataset_field)
              }else{
                //console.log('we have no dataset_field')
                html_json.validation.error = true
                html_json.validation.msg.push("Did not find a dataset field in the csv file: (['sample_name','#SampleID','dataset','Dataset'])")
              }
              
              html_json.data = {}
              
              newmd ={}
              for(n=1;n<mdata.length;n++){ // each row is a dataset -- start at 0 -skip title row
                dset = mdata[n][0]
                for(i in dataset_ids){
                  // only show datasets that are known:
                  did = dataset_ids[i]
                  if(dset == DATASET_NAME_BY_DID[did]){
                    newmd[did]={}
                    for(idx in title_row){
                        var val = mdata[n][idx]
                        newmd[did][title_row[idx]] = val                    
                    }
                  }
                }
            }
            //console.log('newmd')       
            //console.log(newmd)      
            html_json.validation = validate_metadata(req, newmd) 
            
            html_json.sorted_req_header_names = req_metadata.sort()
            headers_cust = {}
            for(did in newmd){
                for(mdname in newmd[did]){
                    if(req_metadata.indexOf(mdname) == -1){
                        headers_cust[mdname] = 1  // lookup
                    }
                }
            }
            html_json.sorted_cust_header_names = Object.keys(headers_cust).sort()
  
       
               
                for(did in newmd){
                    // only show datasets that are known:
                    ds = DATASET_NAME_BY_DID[did] 
                    
                    html_json.data[ds] = {}
                    html_json.data[ds]['req_data'] = []
                    html_json.data[ds]['cust_data'] = []
                    // this should show all metadata not just the required stuff
                    for(i in html_json.sorted_cust_header_names){
                        mdname = html_json.sorted_cust_header_names[i]
                        if(newmd[did].hasOwnProperty(mdname)){
                            html_json.data[ds]['cust_data'].push(newmd[did][mdname])
                        }else{
                            html_json.data[ds]['cust_data'].push('')
                        }
                    }
                    for(i in html_json.sorted_req_header_names){
                        mdname = html_json.sorted_req_header_names[i]
                        if(newmd[did].hasOwnProperty(mdname)){
                            html_json.data[ds]['req_data'].push(newmd[did][mdname])
                        }else{
                            html_json.data[ds]['req_data'].push('')
                        }
                    }
                    
                
               }
              if(Object.keys(html_json.data).length === 0 ){
                    html_json.validation.error = true
                    html_json.validation.msg.push('Dataset names in the file failed to match those in the database for this project: '+project_name)               
              }  // end parser
              
              //console.log('html_json')
              //console.log(JSON.stringify(html_json, null, 2))
              
              if(html_json.validation.error){
                console.log('ERROR--MD UPLOAD--NO VALIDATION')
                html_json.filename = ''
              }else{
                console.log('OK--VALIDATES')
                // write tmp json file
                html_json.filename = username+'_'+project_name+'--'+timestamp+'.json'
                file_path = path.join(process.env.PWD,'tmp',html_json.filename)  
                mdata = convert_names_to_ids_for_storage(newmd)               
                helpers.write_to_file(file_path,JSON.stringify(mdata))
                
              }
              
              res.json(JSON.stringify(html_json));
              
          });
  
  
          try{
            console.log('looking for meta');
            stats = fs.lstatSync(metadata_file);
            if (stats.isFile()) {
              console.log('meta found');
              fs.createReadStream(metadata_file).pipe(parser);
              return html_json
            }
          }
          catch(e) {
            console.log('meta NOT found');
            html_json.validation.error = true
            html_json.validation.msg.push('Could not read csv file.')
            return html_json
            
          }
        
  });

 
});
//
function get_env_package_index(val){
  var idx = -1
  for(key in MD_ENV_PACKAGE){
    if(val != '' && MD_ENV_PACKAGE[key] == val){
        idx = key;
    }
  }
  return idx
} 
function get_fragment_name_index(val){  
  var idx = -1
  for(key in MD_FRAGMENT_NAME){
    if(val != '' && MD_FRAGMENT_NAME[key] == val){
        idx = key;
    }
  }
  return idx
} 
function get_domain_index(val){              
  var idx = -1
  for(key in MD_DOMAIN){
    if(val != '' && MD_DOMAIN[key] == val){
        idx = key;
    }
  }
  return idx
}
function get_country_index(val){       
  var idx = -1
  for(key in MD_COUNTRY){
    if(val != '' && MD_COUNTRY[key] == val){
        idx = key;
    }
  }
  return idx
}
function get_sequencing_platform_index(val){       
  var idx = -1
  for(key in MD_SEQUENCING_PLATFORM){
    if(val != '' && MD_SEQUENCING_PLATFORM[key] == val){
        idx = key;
    }
  }
  return idx
} 
function get_dna_region_index(val){   
  var idx = -1
  for(key in MD_DNA_REGION){
    if(val != '' && MD_DNA_REGION[key] == val){
        idx = key;
    }
  }
  return idx
} 
function get_env_term_index(val){     
  var idx = -1
  for(key in MD_ENV_TERM){
    if(val != '' && MD_ENV_TERM[key] == val){
        idx = key;
    }
  }
  return idx
}
function validate_metadata(req, obj){
    console.log('in fxn validate_metadata')
    console.log('must be done with names NOT IDs')
    
    //console.log(obj)
    
    var validation = {}
    validation.error = false
    validation.empty_values = false
    validation.msg = []
    field_collector = {}
    for(did in obj){
        for(mdname in obj[did]){
            field_collector[mdname]=1
        }
    }
    //unique_field_list = Object.keys(field_collector)        
                          
    for(i in req.CONSTS.REQ_METADATA_FIELDS){
        req_name = req.CONSTS.REQ_METADATA_FIELDS[i]
        if(field_collector.hasOwnProperty(req_name)){
            console.log('got '+req_name)
        }else{
            console.log('missing')
            validation.error = true
            validation.msg.push("Missing required field in csv file: "+req_name)
        }
    }
                          
    for(did in obj){
        for(mdname in obj[did]){                             
                  ds = DATASET_NAME_BY_DID[did] 
                  var val = obj[did][mdname]
                  if((val == undefined || val == '') && req.CONSTS.REQ_METADATA_FIELDS.indexOf(mdname) != -1 ){   // and mdname in required_metadata_fields
                    
                    validation.empty_values = true
                    validation.error = true
                    validation.msg.push(ds+": Missing required value for: "+mdname)
                  }else{
                          if(mdname == 'env_package'){                                       
            
                            if(get_env_package_index(val) == -1){
                              validation.error = true
                              validation.msg.push(ds+": The 'env_package' value ('"+val+"') is not in the allowed list.")
                            }
                          }else if(mdname == 'fragment_name'){                                  
            
                            if(get_fragment_name_index(val) == -1){
                              validation.error = true
                              validation.msg.push(ds+": The 'fragment_name' value ('"+val+"') is not in the allowed list.")
                            }
                          }else if(mdname == 'domain'){                                           
            
                            if(get_domain_index(val) == -1){
                              validation.error = true
                              validation.msg.push(ds+": The 'domain' value ('"+val+"') is not in the allowed list.")
                            }
                          }else if(mdname == 'country'){                                            
            
                            if(get_country_index(val) == -1){
                              validation.error = true
                              validation.msg.push(ds+": The 'country' value ('"+val+"') is not in the allowed list.")
                            }
                          }else if(mdname == 'sequencing_platform'){                                           
            
                            if(get_sequencing_platform_index(val) == -1){
                              validation.error = true
                              validation.msg.push(ds+": The 'sequencing_platform' value ('"+val+"') is not in the allowed list.")
                            }
                          }else if(mdname == 'dna_region'){                                         
            
                            if(get_dna_region_index(val) == -1){
                              validation.error = true
                              validation.msg.push(ds+": The 'dna_region' value ('"+val+"') is not in the allowed list.")
                            }
                          }else if(mdname == 'env_matter'){                                           
            
                            if(get_env_term_index(val) == -1){
                              validation.error = true
                              validation.msg.push(ds+": The 'env_matter' value ('"+val+"') is not in the allowed list.")
                            }
                          }else if(mdname == 'env_biome'){                                              
            
                            if(get_env_term_index(val) == -1){
                              validation.error = true
                              validation.msg.push(ds+": The 'env_biome' value ('"+val+"') is not in the allowed list.")
                            }
                          }else if(mdname == 'env_feature'){                                           
            
                            if(get_env_term_index(val) == -1){
                              validation.error = true
                              validation.msg.push(ds+": The 'env_feature' value ('"+val+"') is not in the allowed list.")
                            }
                          }else if(mdname == 'assigned_from_geo'){                                           
            
                            //val = val.toLowerCase()
                            if(val == 'y' || val == 'n'){
                              //console.log('FOUND '+val)                          
                            }else{                          
                              validation.error = true
                              validation.msg.push(ds+": The 'assigned_from_geo' value ('"+val+"') must be either 'y' or 'n'.")
                            }
                          }else if(mdname == 'collection_date'){                                           
            
                            valid = helpers.isValidMySQLDate(val)
                            if(valid){
                              //console.log('FOUND '+val)                          
                            }else{                          
                              validation.error = true
                              validation.msg.push(ds+": The 'collection_date' value ('"+val+"') is not a valid date.")
                            }
                          }else if(mdname == 'altitude' || mdname == 'elevation' || mdname == 'depth'){                            
                            if(isNaN(val)){                                  
                              validation.error = true
                              validation.msg.push(ds+": The '"+mdname+"' value ('"+val+"') must be a number.")                         
                            }
                          }else if(mdname == 'latitude' || mdname == 'longitude'){                            
                            if(isNaN(val)){                                  
                              validation.error = true
                              validation.msg.push(ds+": Latitude and Longitude must be in decimal degrees.")                         
                            }
                          }else if(mdname == 'description' || mdname == 'common_name'){                            
                              if(val == ''){
                                validation.error = true
                                validation.msg.push(ds+": The value for '"+mdname+"' is not allowed to be empty.")
                              }
                          }else if(mdname == 'taxon_id'){                       
                              if(isNaN(val)){
                                validation.error = true
                                validation.msg.push(ds+": The value for '"+mdname+"' must be a integer from the NCBI database.")
                              }
                          }
                                      
                          
                              //validation.data[dset]['req_data'].push(val)
                  }
        }
    }
    return validation


}
function convert_ids_to_names_for_display(obj){
    console.log('in fxn convert_ids_to_names_for_display')
    var new_obj = {}
    for(did in obj){
        new_obj[did] = {}
        for(mdname in obj[did]){      
            if(mdname == 'env_package_id'){              
              new_obj[did]['env_package'] = MD_ENV_PACKAGE[obj[did][mdname]]
            }else if(mdname == 'fragment_name_id'){              
              new_obj[did]['fragment_name'] = MD_FRAGMENT_NAME[obj[did][mdname]]
            }else if(mdname == 'domain_id'){              
              new_obj[did]['domain'] = MD_DOMAIN[obj[did][mdname]]
            }else if(mdname == 'country_id'){              
              new_obj[did]['country'] = MD_COUNTRY[obj[did][mdname]]
            }else if(mdname == 'sequencing_platform_id'){              
              new_obj[did]['sequencing_platform'] = MD_SEQUENCING_PLATFORM[obj[did][mdname]]
            }else if(mdname == 'dna_region_id'){              
              new_obj[did]['dna_region'] = MD_DNA_REGION[obj[did][mdname]]
            }else if(mdname == 'env_matter_id'){              
              new_obj[did]['env_matter'] = MD_ENV_TERM[obj[did][mdname]]
            }else if(mdname == 'env_biome_id'){              
              new_obj[did]['env_biome'] = MD_ENV_TERM[obj[did][mdname]]
            }else if(mdname == 'env_feature_id'){              
              new_obj[did]['env_feature'] = MD_ENV_TERM[obj[did][mdname]]
            }else{              
              new_obj[did][mdname] = obj[did][mdname]
          }
        }
    }
    return new_obj
}
function convert_names_to_ids_for_storage(obj){
    console.log('in fxn convert_names_to_ids_for_storage')
    var new_obj = {}
    for(did in obj){
        new_obj[did] = {}
      for(mdname in obj[did]){
        var val = obj[did][mdname]
        if(mdname == 'fragment_name'){
            new_obj[did]['fragment_name_id']   = get_fragment_name_index(val)
        }else if(mdname == 'country'){
            new_obj[did]['country_id']          = get_country_index(val)
        }else if(mdname == 'dna_region'){
            new_obj[did]['dna_region_id']      = get_dna_region_index(val)
        }else if(mdname == 'domain'){
            new_obj[did]['domain_id']         = get_domain_index(val)
        }else if(mdname == 'env_biome'){
            new_obj[did]['env_biome_id']     = get_env_term_index(val)
        }else if(mdname == 'env_feature'){
            new_obj[did]['env_feature_id']      = get_env_term_index(val)
        }else if(mdname == 'env_matter'){
            new_obj[did]['env_matter_id']       = get_env_term_index(val)
        }else if(mdname == 'env_package'){
            new_obj[did]['env_package_id']     = get_env_package_index(val)
        }else if(mdname == 'sequencing_platform'){
            new_obj[did]['sequencing_platform_id']  = get_sequencing_platform_index(val)
        }else{            
            new_obj[did][mdname] =  val            
        }
      }
    }
    return new_obj
}
//
//
//
module.exports = router;
