var express  = require('express');
var router   = express.Router();
var passport = require('passport');
var helpers  = require('./helpers/helpers');
//var queries = require('./queries');
var queries  = require('./queries_admin');
var config   = require(app_root + '/config/config');
var fs       = require('fs-extra');
var path     = require('path');
var spawn    = require('child_process').spawn;
var multer   = require('multer');
var storage  = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, '/tmp');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});
var User     = require(app_root + '/models/user_model');
var upload   = multer({storage: storage}).single('upload_metadata_file');

router.get('/admin_index', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log('in admin');
  res.render('admin/admin_index', {
    title: 'VAMPS Site Administration',
    user: req.user,
    hostname: req.CONFIG.hostname, // get the user out of session and pass to template
  });

});
//
//
//
router.get('/assign_permissions', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log('in assign_permissions');
  res.render('admin/assign_permissions', {
    title: 'VAMPS Site Administration',
    user: req.user,
    project_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
    user_info: JSON.stringify(ALL_USERS_BY_UID),
    hostname: req.CONFIG.hostname, // get the user out of session and pass to template
  });

});

//
//
//
router.get('/permissions', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log('in permissions');

  var user_order    = get_name_ordered_users_list()
  var project_order = get_name_ordered_projects_list()
  //console.log(JSON.stringify(ALL_USERS_BY_UID))
  res.render('admin/permissions', {
    title: 'VAMPS Site Administration',
    user: req.user,
    project_order: JSON.stringify(project_order),
    user_order: JSON.stringify(user_order),
    //project_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
    user_info: JSON.stringify(ALL_USERS_BY_UID),
    hostname: req.CONFIG.hostname, // get the user out of session and pass to template
  });

});
router.get('/public_status', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log('in public_status');
  //console.log(ALL_USERS_BY_UID);
  //console.log(PROJECT_INFORMATION_BY_PID);

  res.render('admin/public_status', {
    title: 'VAMPS Site Administration',
    user: req.user,
    project_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
    user_info: JSON.stringify(ALL_USERS_BY_UID),
    hostname: req.CONFIG.hostname, // get the user out of session and pass to template
  });

});

router.post('/public_update', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log('in public_update');
  //console.log(ALL_USERS_BY_UID);
  //console.log(PROJECT_INFORMATION_BY_PID);
  selected_pid = req.body.pid;
  new_public   = parseInt(req.body.public);
  //console.log(selected_pid,' ',new_public)
  response     = 'no'
  if (new_public !== PROJECT_INFORMATION_BY_PID[selected_pid].public) {
    //q = "UPDATE project set public='"+new_public+"' WHERE project_id='"+selected_pid+"'";
    q = queries.alter_project_public(new_public, selected_pid)
    if (new_public === 1) {
      PROJECT_INFORMATION_BY_PID[selected_pid].public      = 1;
      PROJECT_INFORMATION_BY_PID[selected_pid].permissions = [];
    } else {
      // give owner sole permissions
      PROJECT_INFORMATION_BY_PID[selected_pid].permissions = [PROJECT_INFORMATION_BY_PID[selected_pid].oid];
      PROJECT_INFORMATION_BY_PID[selected_pid].public      = 0;
    }
    connection.query(q, function (err, rows, fields) {
      //console.log(qSequenceCounts)
      if (err) {
        console.log('Query error: ' + err);
        response = 'Query error: ' + err;
      } else {
        response = 'Successfully updated project';
      }
      res.send(response);
    });
  } else {
    res.send('no change to public status');
  }
});
router.get('/admin_status', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log('in admin_status');

  var user_order = get_name_ordered_users_list()
  //console.log(ALL_USERS_BY_UID)
  res.render('admin/admin_status', {
    title: 'VAMPS Site Administration',
    user: req.user,
    //project_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
    user_info: JSON.stringify(user_order),
    hostname: req.CONFIG.hostname, // get the user out of session and pass to template
  });

});
router.post('/admin_update', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log('in admin_update');
  //console.log(ALL_USERS_BY_UID);
  //console.log(PROJECT_INFORMATION_BY_PID);
  var selected_uid = req.body.uid;
  new_status       = parseInt(req.body.status);
  //console.log(selected_pid,' ',new_public)
  var response     = 'no'
  if (new_status !== ALL_USERS_BY_UID[selected_uid].status) {
    q = queries.alter_security_level(new_status, selected_uid)  //"UPDATE user set security_level='"+new_status+"' WHERE user_id='"+selected_uid+"'";

    if (new_status === 1) {
      ALL_USERS_BY_UID[selected_uid].status = 1;  // Admin
    } else if (new_status === 10) {
      ALL_USERS_BY_UID[selected_uid].status = 10;  // MBL user
    } else if (new_status === 45) {
      ALL_USERS_BY_UID[selected_uid].status = 45;  // DCO Editor
    } else {
      ALL_USERS_BY_UID[selected_uid].status = 50; // Lowly User
    }
    connection.query(q, function (err, rows, fields) {
      if (err) {
        console.log('Query error: ' + err);
        response = 'Query error: ' + err;
      } else {
        response = 'Successfully updated user';
      }
      res.send(response);
    });
  } else {
    res.send('no change to admin status');
  }
});
router.post('/show_user_info', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log('in show_user_info');
  var selected_uid = req.body.uid;
  if (selected_uid in ALL_USERS_BY_UID) {
    info = ALL_USERS_BY_UID[selected_uid];
  } else {

  }
  var html = '<hr>';
  html += '<table>';
  html += '<tr>';
  html += '<td>Last</td><td>' + info.last_name + '</td>';
  html += '</tr>';
  html += '<tr>';
  html += '<td>First</td><td>' + info.first_name + '</td>';
  html += '</tr>';
  html += '<tr>';
  html += '<td>UserName</td><td>' + info.username + '</td>';
  html += '</tr>';
  html += '<table>';


  res.send(html);

});
//
//
//
router.get('/alter_datasets', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log('in alter_datasets')
  var url       = require('url');
  var url_parts = url.parse(req.url, true);
  var query     = url_parts.query;

  if (url_parts.query.pid === undefined) {
    //ERROR
    return
  } else {
    var pid = url_parts.query.pid;
  }
  var myjson;
  ALL_DATASETS.projects.forEach(function (prj) {
    if (prj.pid == pid) {
      myjson = prj;
    }
  });

  console.log(myjson)
  res.render('admin/alter_datasets', {
    title: 'VAMPS Site Administration',
    user: req.user,
    pid: pid,
    project_info: JSON.stringify(myjson),
    project: PROJECT_INFORMATION_BY_PID[pid].project,
    hostname: req.CONFIG.hostname, // get the user out of session and pass to template
  });

});
//
//
//
router.get('/alter_project', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log('in alter_project');
  var url       = require('url');
  var url_parts = url.parse(req.url, true);
  var query     = url_parts.query;
  var pid;

  if (url_parts.query.pid === undefined) {
    var proj_to_open = 0;
  } else {
    var proj_to_open = PROJECT_INFORMATION_BY_PID[url_parts.query.pid];
  }
  //console.log(PROJECT_INFORMATION_BY_PID);
  //console.log(ALL_USERS_BY_UID);
  var project_list = get_name_ordered_projects_list()
  res.render('admin/alter_project', {
    title: 'VAMPS Site Administration',
    user: req.user,
    proj_to_open: proj_to_open,
    project_list: JSON.stringify(project_list),
    user_info: JSON.stringify(ALL_USERS_BY_UID),
    hostname: req.CONFIG.hostname, // get the user out of session and pass to template
  });

});
//
//
//
router.post('/show_project_info', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log('in show_user_info');
  //console.log(PROJECT_INFORMATION_BY_PID);

  var selected_pid = req.body.pid;
  if (selected_pid in PROJECT_INFORMATION_BY_PID) {
    info = PROJECT_INFORMATION_BY_PID[selected_pid];
  } else {

  }
  var html = '';

  html += "<table class='admin_table' border='1'>";

  html += '<tr><th></th><th>Current Value</th><th>Enter or Select New Value</th><th></th><th>Msg</th></tr>';

  html += '<tr>';
  html += "<form id='' name='update_pname_form' method='POST' action='update_pname'>";
  html += ' <td>Project Name (pid)</td><td>' + info.project + ' <small>(' + info.pid + ')</small></td>';
  html += " <td><input type='edit' id='new_pname' name='new_pname' value='" + info.project + "' width='200' style='width: 200px' /></td>";
  html += " <td><input id='new_pname_btn' type='button' value='Update' onclick=\"update_project('pname', '" + selected_pid + "')\"></td>";
  html += " <td><div id='new_pname_response_id'></div></td>";
  html += "</form>";
  html += '</tr>';

  html += '<tr>';
  html += "<form id='' name='update_powner_form' method='POST' action='update_powner'>";
  html += ' <td>Owner (username-uid)</td><td>' + info.last + ', ' + info.first + ' <small>(' + info.username + "-" + info.oid + ')</small></td>';
  html += ' <td>';
  html += " <select id='new_oid' name='new_oid' width='200' style='width: 200px'>";
  for (uid in ALL_USERS_BY_UID) {
    if (ALL_USERS_BY_UID[uid].username !== 'guest') {
      if (ALL_USERS_BY_UID[uid].username === info.username) {
        html += "    <option selected value='" + uid + "'>" + ALL_USERS_BY_UID[uid].last_name + "," + ALL_USERS_BY_UID[uid].first_name;
        html += "     <small>(" + ALL_USERS_BY_UID[uid].username + ")</small></option>";
      } else {
        html += "    <option value='" + uid + "'>" + ALL_USERS_BY_UID[uid].last_name + "," + ALL_USERS_BY_UID[uid].first_name;
        html += "     <small>(" + ALL_USERS_BY_UID[uid].username + ")</small></option>";
      }
    }
  }
  html += " </select>";
  html += ' </td>';
  html += " <td><input id='new_powner_btn' type='button' value='Update' onclick=\"update_project('powner', '" + selected_pid + "')\"></td>";
  html += " <td><div id='new_powner_response_id'></div></td>";
  html += "</form>";
  html += '</tr>';


  html += '<tr>';
  html += "<form id='' name='update_ptitle_form' method='POST' action='update_ptitle'>";
  html += ' <td>Project Title</td><td><span>' + info.title + '</span></td>';
  html += " <td><input type='edit' id='new_ptitle' name='new_ptitle' value='" + info.title + "' width='200' style='width: 200px'/></td>";
  html += " <td><input id='new_ptitle_btn' type='button' value='Update' onclick=\"update_project('ptitle', '" + selected_pid + "')\"></td>";
  html += " <td><div id='new_ptitle_response_id'></div></td>";
  html += "</form>";
  html += '</tr>';

  html += '<tr>';
  html += "<form id='' name='update_pdesc_form' method='POST' action='update_pdesc'>";
  html += ' <td>Project Description</td><td><span>' + info.description + '</span></td>';
  html += " <td><textarea id='new_pdesc' name='new_pdesc'  value='" + info.description + "' rows='2' cols='28'>" + info.description + "</textarea></td>";
  html += " <td><input id='new_pdesc_btn' type='button' value='Update' onclick=\"update_project('pdesc', '" + selected_pid + "')\"></td>";
  html += " <td><div id='new_pdesc_response_id'></div></td>";
  html += "</form>";
  html += '</tr>';

  html += '<tr>';
  if (info.public === 1) {
    html += '<td>Public</td><td>True</td>';
  } else {
    html += '<td>Public</td><td>False</td>';
  }


  html += '<td><a href="public">View or Change</a></td>';
  html += "<td></td>";
  html += "<td></td>";
  html += '</tr>';

  html += '<tr>';
  html += '<td>Permissions</td><td>' + info.permissions + '</td>';
  html += '<td><a href="permissions">View or Change</a></td>';
  html += "<td></td>";
  html += "<td></td>";
  html += '</tr>';

  html += '<tr>';
  html += '<td>Datasets</td><td></td>';
  html += "<td><a href=\"alter_datasets?pid=" + selected_pid + "\">View or Change</a></td>";
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
router.post('/update_dataset_info', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  //console.log(req.body)
  console.log('in update_dataset_info');
  var did      = req.body.did;
  var pid      = req.body.pid;
  var new_name = req.body.name;
  var new_desc = req.body.desc;

  DATASET_NAME_BY_DID[did] = name;
  ALL_DATASETS.projects.forEach(function (prj) {
    if (prj.pid == pid) {
      prj.datasets.forEach(function (ds) {
        if (ds.did == did) {
          ds.dname = new_name;
          ds.ddesc = new_desc;
        }
      });
    }
  });

  console.log(new_name + ' -- ' + new_desc)
  res.send('Done!')

});
//
//
//
router.post('/update_project_info', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log(req.body);

  console.log('in update_project_info');
  var item_to_update = req.body.item;
  var value          = req.body.value;
  var pid            = req.body.pid;
  var q;

  //console.log(ALL_DATASETS);
  //console.log(typeof ALL_DATASETS);

  switch (item_to_update) {
    case 'pname':
      new_project_name                        = value;
      var rev_pname                           = helpers.reverse(new_project_name);
      var old_project_name                    = PROJECT_INFORMATION_BY_PID[pid].project;
      PROJECT_INFORMATION_BY_PID[pid].project = new_project_name;
      delete PROJECT_INFORMATION_BY_PNAME[old_project_name];
      PROJECT_INFORMATION_BY_PNAME[new_project_name] = PROJECT_INFORMATION_BY_PID[pid];
      ALL_DATASETS.projects.forEach(function (prj) {
        if (prj.pid == pid) {
          prj.name = new_project_name;
        }
      });
      q = queries.update_project_info(item_to_update, new_project_name, pid)
      break;

    case 'powner':
      new_owner_id                                = value;
      PROJECT_INFORMATION_BY_PID[pid].last        = ALL_USERS_BY_UID[new_owner_id].last_name;
      PROJECT_INFORMATION_BY_PID[pid].first       = ALL_USERS_BY_UID[new_owner_id].first_name;
      PROJECT_INFORMATION_BY_PID[pid].username    = ALL_USERS_BY_UID[new_owner_id].username;
      PROJECT_INFORMATION_BY_PID[pid].email       = ALL_USERS_BY_UID[new_owner_id].email;
      PROJECT_INFORMATION_BY_PID[pid].institution = ALL_USERS_BY_UID[new_owner_id].institution;
      PROJECT_INFORMATION_BY_PID[pid].oid         = new_owner_id;
      q                                           = queries.update_project_info(item_to_update, new_owner_id, pid)
      break;

    case 'ptitle':
      new_project_title                     = value;
      PROJECT_INFORMATION_BY_PID[pid].title = new_project_title;
      ALL_DATASETS.projects.forEach(function (prj) {
        if (prj.pid == pid) {
          prj.title = new_project_title;
        }
      });
      q = queries.update_project_info(item_to_update, new_project_title, pid)
      break;

    case 'pdesc':
      new_project_desc                            = value;
      PROJECT_INFORMATION_BY_PID[pid].description = new_project_desc;
      q += " project_description='" + new_project_desc + "'";
      q                                           = queries.update_project_info(item_to_update, new_project_desc, pid)
      break;

    default:
      console.log('ERROR in update_project_info');

  }

  console.log(q);
  connection.query(q, function (err, rows, fields) {
    if (err) {
      console.log('Query error: ' + err);
      response = 'Query error: ' + err;
    } else {
      response = 'Successfully updated';
    }
    res.send(response);
  });

});
//
//
//
router.post('/grant_access', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {

  console.log('in grant_access');
  var selected_uid = req.body.uid;
  var selected_pid = req.body.pid;
  var html         = 'Successfully Updated';
  // 1-add to PROJECT_INFORMATION_BY_PID[selected_pid]

  if (selected_pid in PROJECT_INFORMATION_BY_PID) {
    if (PROJECT_INFORMATION_BY_PID[selected_pid].permissions.indexOf(parseInt(selected_uid)) === -1) {
      PROJECT_INFORMATION_BY_PID[selected_pid].permissions.push(parseInt(selected_uid))
      //console.log('11111')

    } else {
      html = 'User already has access to this project.'
      res.send(html);

      //html = 'Trying to push!'

      console.log('22222');
      return;

    }
  } else {
    html = 'Could not find project - This is a PROBLEM!';
  }

  // 2- add to table 'access'
  //q = "INSERT ignore into `access` (user_id, project_id) VALUES('"+selected_uid+"','"+selected_pid+"')"
  connection.query(queries.insert_access_table(selected_uid, selected_pid), function (err, rows, fields) {
    //console.log(qSequenceCounts)
    if (err) {
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
router.get('/inactivate_user', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  console.log('in delete_user GET ADMIN')
  //console.log(JSON.stringify(ALL_USERS_BY_UID))
  // set active to 0 in user table
  // results on login attempt:  That account is inactive -- send email to vamps.mbl.edu to request re-activation.
  // also delete from ALL_USERS_BY_UID
  var user_order = get_name_ordered_users_list()
  res.render('admin/inactivate_user', {
    title: 'VAMPS Inactivate User',
    user: req.user,
    user_info: JSON.stringify(user_order),
    hostname: req.CONFIG.hostname, // get the user out of session and pass to template
  });
});
router.post('/inactivate_user', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  console.log('in delete_user POST ADMIN')
  // set active to 0 in user table
  // results on login attempt:  That account is inactive -- send email to vamps.mbl.edu to request re-activation.
  // also delete from ALL_USERS_BY_UID
  var uid_to_delete = req.body.uid;
  var response;
  // var finish = function(){
//       res.render('admin/inactivate_user', {
//               title     :'VAMPS Inactivate User',
//               user: req.user,
//               user_info: JSON.stringify(ALL_USERS_BY_UID),
//               hostname: req.CONFIG.hostname, // get the user out of session and pass to template
//             });
// 
//     };
  if (uid_to_delete == 0) {
    res.send('FAILED: Got a UID of zero!');
  } else if (uid_to_delete == req.user.user_id) {
    res.send('FAILED: You cannot inactivate yourself!');
  } else {
    delete ALL_USERS_BY_UID[uid_to_delete]
    req.db.query(queries.inactivate_user(uid_to_delete), function (err, rows) {
      if (err) {
        response = 'FAILED: sql error ' + err
      } else {
        response = 'Inactivate Success ( uid: ' + uid_to_delete + ' )'
      }
      res.send(response);
    });
    return;
  }

});
//
//
//
router.get('/update_metadata_object', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  console.log('in update_metadata_object')
  var meta_file = path.join(config.JSON_FILES_BASE, NODE_DATABASE + '--metadata.json');
  delete require.cache[require.resolve(meta_file)];  // THIS CLEARS THE REQUIRE CACHE
  //console.log(require.cache)
  //AllMetadata  = {}
  AllMetadata = require(meta_file);
  //console.log(AllMetadata['52'])
  var backURL = '/admin/admin_index'
  req.flash('success', 'Done');
  res.redirect(backURL);

});

router.get('/new_user', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  console.log('in new_user GET ADMIN')

  res.render('admin/new_user', {
    title: 'VAMPS Create new user',
    user: req.user,
    hostname: req.CONFIG.hostname,
    new_user: {}
  });
});
//
//
//
router.post('/new_user', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  console.log('in new_user --POST');

  var this_user_obj    = new User();
  var new_user         = this_user_obj.newUser(req.body);
  var vaildate_res     = this_user_obj.validate_new_user(req, new_user);

  function finish(nuser) {
    res.render('admin/new_user', {
      title: 'VAMPS Create new user',
      user: req.user,
      hostname: req.CONFIG.hostname,
      new_user: nuser
    });
  }

  if (vaildate_res[0] === 1) { // there are validation errors
    req = vaildate_res[1];
    finish(new_user);

  } else {

    req.db.query(queries.get_user_by_name(new_user.username), function (err, rows) {
      if (err) {
        console.log(err);
        req.flash('fail', err);
        finish(new_user);
      }
      if (rows.length) {
        console.log('Username is already taken.');
        req.flash('fail', 'Username "' + new_user.username + '" is already taken.');
        finish(new_user);

      } else {
        var newUserMysql            = {};
        newUserMysql.username       = new_user.username;
        newUserMysql.password       = new_user.password;  /// Password is HASHed in queries_admin
        newUserMysql.firstname      = new_user.firstname;
        newUserMysql.lastname       = new_user.lastname;
        newUserMysql.email          = new_user.email;
        newUserMysql.institution    = new_user.institution;
        newUserMysql.security_level = 50;  //reg user
        var insertQuery             = queries.insert_new_user(newUserMysql)

        req.db.query(insertQuery, function (err, rows) {
          if (err) {
            console.log(insertQuery);
            console.log(err);
            req.flash('fail', 'Username "' + new_user.username + '" is already taken.');
          } else {
            new_user.user_id                   = rows.insertId;
            var user_data_dir                  = path.join(req.CONFIG.USER_FILES_BASE, new_user.username);
            console.log('Admin:Validating/Creating User Data Directory: ' + user_data_dir);
            helpers.ensure_dir_exists(user_data_dir);  // also chmod to 0777 (ug+rwx)
            ALL_USERS_BY_UID[new_user.user_id] = {
              email: new_user.email,
              username: new_user.username,
              last_name: new_user.lastname,
              first_name: new_user.firstname,
              institution: new_user.institution,
            };
            req.flash('success', 'Success (username: ' + new_user.username + '; user_id: ' + new_user.user_id + ')');
          }
          finish(new_user);
        });
      }
    });
  }


});
//
//
//
router.get('/reset_user_password', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  console.log('in reset_user_password');
  var user_order = get_name_ordered_users_list()
  res.render('admin/new_password', {
    title: 'VAMPS Reset User Password',
    user: req.user,
    user_info: JSON.stringify(user_order),
    hostname: req.CONFIG.hostname, // get the user out of session and pass to template
  });
});
//
//
//
router.post('/reset_user_password', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  console.log('in reset_user_password --POST');
  console.log(req.body)
  var uid        = req.body.user_id;
  var password   = req.body.password;
  var user_order = get_name_ordered_users_list()
  var finish     = function () {
    res.render('admin/new_password', {
      title: 'VAMPS Reset User Password',
      user: req.user,
      user_info: JSON.stringify(user_order),
      hostname: req.CONFIG.hostname, // get the user out of session and pass to template
    });

  };
  if (password.length < 3 || password.length > 12) {
    req.flash('fail', 'FAILED: The password must be between 3 and 20 characters.');
  } else if (uid == '') {
    req.flash('fail', 'FAILED: You must select a user.');
  } else {

    var updateQuery = queries.reset_user_password_by_uid(password, uid)
    console.log(updateQuery);
    req.db.query(updateQuery, function (err, rows) {
      if (err) {
        req.flash('fail', 'FAILED: sql error ' + err);
      } else {
        req.flash('success', 'Success ( uid: ' + uid + ' )');
      }
      finish();

    });
    return;

  }
  finish();
});

router.get('/update_metadata', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  console.log('in GET validate_metadata');
  res.render('admin/validate_metadata', {
    title: 'VAMPS Validate Metadata',
    user: req.user,
    project_info: JSON.stringify(PROJECT_INFORMATION_BY_PNAME),
    hostname: req.CONFIG.hostname // get the user out of session and pass to template
  });
});
//
//
//
router.post('/show_metadata', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  console.log('In POST show_metadata');
  console.log(req.body)
  var pid = req.body.pid
  //console.log(pid)
  //console.log(PROJECT_INFORMATION_BY_PID[pid].project)
  var html_json    = {};
  html_json.data   = {};
  var req_metadata = req.CONSTS.REQ_METADATA_FIELDS

  var mdata = {}
  var dids  = DATASET_IDS_BY_PID[pid]
  for (n in dids) {
    mdata[dids[n]] = AllMetadata[dids[n]]
  }
  //console.log(mdata)  // has ids need to convert
  mdata                = convert_ids_to_names_for_display(mdata)
  //console.log(mdata)
  html_json.validation = validate_metadata(req, mdata)
  //console.log('validation result')
  //console.log(html_json.result)
  // for display we need the same order of fields
  // AND each dataset needs the all the fields
  html_json.sorted_req_header_names = req_metadata.sort()
  headers_cust                      = {}
  for (did in mdata) {
    for (mdname in mdata[did]) {
      if (req_metadata.indexOf(mdname) == -1) {
        headers_cust[mdname] = 1  // lookup
      }
    }
  }
  html_json.sorted_cust_header_names = Object.keys(headers_cust).sort()
  //console.log('sorted_cust_header_names')
  //console.log(html_json.sorted_cust_header_names)
  for (did in mdata) { // each item is a dataset_id
    ds                           = DATASET_NAME_BY_DID[did]
    html_json.data[ds]           = {}
    html_json.data[ds].req_data  = []
    html_json.data[ds].cust_data = []

    for (i in html_json.sorted_cust_header_names) {
      mdname = html_json.sorted_cust_header_names[i]
      if (mdata[did].hasOwnProperty(mdname)) {
        html_json.data[ds].cust_data.push(mdata[did][mdname])
      } else {
        html_json.data[ds].cust_data.push('')
      }
    }
    for (i in html_json.sorted_req_header_names) {
      mdname = html_json.sorted_req_header_names[i]
      //console.log('mdname '+mdname)
      if (mdata[did].hasOwnProperty(mdname)) {
        html_json.data[ds].req_data.push(mdata[did][mdname])
      } else {
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
router.post('/apply_metadata', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  console.log('in apply_metadata')
  if (req.CONFIG.site == 'vamps') {
    console.log('VAMPS PRODUCTION -- no print to log');
  } else {
    console.log(req.body)
  }
  var timestamp             = +new Date();
  var selected_pid          = req.body.pid
  var filename              = req.body.filename
  var file_path             = path.join(req.CONFIG.PROCESS_DIR, 'tmp', filename)
  var dids                  = DATASET_IDS_BY_PID[selected_pid]
  var new_required_metadata = {}
  var new_custom_metadata   = {}
  mdata                     = {}
  for (name in req.body) {
    //console.log('name in req.body '+name)
    if (name != 'pid' && name != 'filename') {

      items = name.split('--')
      dset  = items[0]
      // get did
      did   = 0
      for (i in dids) {
        if (DATASET_NAME_BY_DID[dids[i]] == dset) {
          did = dids[i]
        }
      }
      //console.log('AllMetadata[did]1 '+did)
      //console.log(AllMetadata[did])
      if (did == 0) {
        console.log('ERROR -- missed did')
      }
      mdname = items[1]
      value  = req.body[name]
      if (did in mdata) {
        mdata[did][mdname] = value
      } else {
        mdata[did]         = {}
        mdata[did][mdname] = value
      }

    }
  }
  //console.log('mdata1')
  //console.log(mdata)
  //mdata = convert_names_to_ids_for_storage(mdata)
  //console.log('mdata2')
  //console.log(mdata)

  for (did in mdata) {
    new_required_metadata[did] = {}
    new_custom_metadata[did]   = {}
    for (mdname in mdata[did]) {
      var val = mdata[did][mdname]
      if (req.CONSTS.REQ_METADATA_FIELDS.indexOf(mdname) == -1) {
        new_custom_metadata[did][mdname] = val
      } else {
        new_required_metadata[did][mdname] = val
      }
      if (AllMetadata.hasOwnProperty(did)) {
        AllMetadata[did][mdname] = val
      } else {
        AllMetadata[did]         = {}
        AllMetadata[did][mdname] = val
      }

    }
  }

  // Run script to add custom and required metadata to mysql database
  var options          = {
    scriptPath: req.CONFIG.PATH_TO_NODE_SCRIPTS,
    args: ['-host', req.CONFIG.dbhost, '-f', file_path, '-pid', selected_pid, '-q']
  };
  var script_name      = 'vamps_script_update_metadata.py'
  var script_path      = path.join(req.CONFIG.PATH_TO_NODE_SCRIPTS, script_name)
  var full_script_path = script_path + ' ' + options.args.join(' ')

  ////No module named argparse  need path
  var update_metadata_process = spawn(options.scriptPath + '/vamps_script_update_metadata.py', options.args, {
    env: {'PATH': req.CONFIG.PATH, 'LD_LIBRARY_PATH': req.CONFIG.LD_LIBRARY_PATH},
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
  update_metadata_process.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
    req.flash('fail', 'Metadata Update Failed');
  });
  update_metadata_process.on('close', function checkExitCode(code) {
    console.log('From apply_metadata process exited with code ' + code);
    if (req.CONFIG.site == 'vamps') {
      console.log('VAMPS PRODUCTION -- no print to log');
    } else {
      console.log('OUTPUT:\n' + output)
    }
    req.flash('success', 'Success in updating metadata');
    res.render('admin/validate_metadata', {
      title: 'VAMPS Validate Metadata',
      user: req.user,
      project_info: JSON.stringify(PROJECT_INFORMATION_BY_PNAME),
      hostname: req.CONFIG.hostname, // get the user out of session and pass to template
    });
  });


});
//
//
//
router.post('/upload_metadata', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  var parse = require('csv-parse');
  console.log('In POST admin upload_metadata');
  var username  = req.user.username;
  var timestamp = +new Date();
  if (req.CONFIG.site == 'vamps') {
    console.log('VAMPS PRODUCTION -- no print to log');
  } else {
    console.log(req.body)
  }
  upload(req, res, function (err) {
    if (err) {
      console.log('Error uploading file: ' + err.toString());
      return res.end("Error uploading file.");
    }
    req_metadata  = req.CONSTS.REQ_METADATA_FIELDS
    var html_json = {};
    if (!req.hasOwnProperty('file')) {
      res.end("Error uploading file: project selected? file to upload selected?")
      return
    }

    var selected_pid  = req.body.pid
    var dataset_ids   = DATASET_IDS_BY_PID[selected_pid]
    var project_name  = PROJECT_INFORMATION_BY_PID[selected_pid].project
    var metadata_file = req.file.path

    var parser = parse({delimiter: '\t'}, function createParserPipe(err, mdata) {
      if (err) {
        console.log('parsing error');
        res.json(JSON.stringify({"error": true, "msg": ["Error parsing file: " + err.toString()]}));
        return
      }
      html_json.validation              = {}
      html_json.validation.error        = false
      html_json.validation.empty_values = false
      html_json.validation.msg          = []
      //console.log("mdata: ");
      //console.log(mdata);


      //console.log('req_metadata')
      //console.log(req_metadata)
      var dataset_field_names = ['sample_name', '#SampleID', 'dataset', 'Dataset']
      var title_row           = mdata[0]
      idx                     = dataset_field_names.indexOf(title_row[0])
      if (idx != -1) {
        //console.log('found dataset_field '+title_row[0])
      } else {
        //console.log('we have no dataset_field')
        html_json.validation.error = true
        html_json.validation.msg.push("Did not find a dataset field in the csv file: (['sample_name','#SampleID','dataset','Dataset'])")
      }

      html_json.data = {}

      newmd = {}
      for (n = 1; n < mdata.length; n++) { // each row is a dataset -- start at 0 -skip title row
        dset = mdata[n][0]
        for (i in dataset_ids) {
          // only show datasets that are known:
          did = dataset_ids[i]
          if (dset == DATASET_NAME_BY_DID[did]) {
            newmd[did] = {}
            for (idx in title_row) {
              var val                                  = mdata[n][idx]
              newmd[did][title_row[idx].toLowerCase()] = val   //lowercase name for validation
            }
          }
        }
      }
      //console.log('newmd')
      //console.log(newmd)
      html_json.validation = validate_metadata(req, newmd)

      html_json.sorted_req_header_names = req_metadata.sort()
      headers_cust                      = {}
      for (did in newmd) {
        for (mdname in newmd[did]) {
          if (req_metadata.indexOf(mdname) == -1) {
            headers_cust[mdname] = 1  // lookup
          }
        }
      }
      html_json.sorted_cust_header_names = Object.keys(headers_cust).sort()


      for (did in newmd) {
        // only show datasets that are known:
        ds = DATASET_NAME_BY_DID[did]

        html_json.data[ds]              = {}
        html_json.data[ds]['req_data']  = []
        html_json.data[ds]['cust_data'] = []
        // this should show all metadata not just the required stuff
        for (i in html_json.sorted_cust_header_names) {
          mdname = html_json.sorted_cust_header_names[i]
          if (newmd[did].hasOwnProperty(mdname)) {
            html_json.data[ds]['cust_data'].push(newmd[did][mdname])
          } else {
            html_json.data[ds]['cust_data'].push('')
          }
        }
        for (i in html_json.sorted_req_header_names) {
          mdname = html_json.sorted_req_header_names[i]
          if (newmd[did].hasOwnProperty(mdname)) {
            html_json.data[ds]['req_data'].push(newmd[did][mdname])
          } else {
            html_json.data[ds]['req_data'].push('')
          }
        }


      }
      if (Object.keys(html_json.data).length === 0) {
        html_json.validation.error = true
        // remove all other messages:
        html_json.validation.msg   = ['Dataset names in the first column failed to match those in the database for this project: ' + project_name]
        html_json.validation.msg.push("Is the first column 'Dataset', 'sample_name', '#SampleID' or 'dataset' ?")
      }

      if (html_json.validation.error) {
        console.log('ERROR--MD UPLOAD--NO VALIDATION')
      } else {
        console.log('OK--VALIDATES')
      }
      html_json.filename = username + '_' + project_name + '--' + timestamp + '.json'
      file_path          = path.join(req.CONFIG.PROCESS_DIR, 'tmp', html_json.filename)

      mdata = convert_names_to_ids_for_storage(newmd)

      helpers.write_to_file(file_path, JSON.stringify(mdata))


      res.json(JSON.stringify(html_json));

    });


    try {
      console.log('looking for meta');
      stats = fs.lstatSync(metadata_file);
      if (stats.isFile()) {
        console.log('meta found');
        fs.createReadStream(metadata_file).pipe(parser);
        return html_json
      }
    }
    catch (e) {
      console.log('meta NOT found');
      html_json.validation.error = true
      html_json.validation.msg.push('Could not read csv file.')
      return html_json

    }

  });


});

router.get('/all_files_retrieval', [helpers.isLoggedIn, helpers.isAdmin], function get_all_files_retrieval(req, res) {
  var export_dir = path.join(config.USER_FILES_BASE);

  // console.log("XXX export_dir");
  // console.log(export_dir);

  helpers.walk(export_dir, function (err, files) {
    if (err) throw err;
    files.sort(function sortByTime(a, b) {
      //reverse sort: recent-->oldest
      return helpers.compareStrings_int(b.time.getTime(), a.time.getTime());
    });

    // console.log("JJJ JSON.stringify(files)");
    // console.log(JSON.stringify(files));

    res.render('admin/all_files_retrieval', {
      title: 'VAMPS: Users Files',
      user: req.user, hostname: req.CONFIG.hostname,
      finfo: JSON.stringify(files)

    });
  });
});

router.get('/create_dco_metadata_fileXX', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
  console.log('in create_dco_metadata_file')
  var timestamp    = +new Date();
  var out_file     = 'dco_all_' + timestamp + '.tsv'
  var outfile_path = path.join(req.CONFIG.PATH_TO_STATIC_DOWNLOADS, out_file)
  var pids_list    = []
  for (pid in PROJECT_INFORMATION_BY_PID) {
    project = PROJECT_INFORMATION_BY_PID[pid].project
    if (project.substring(0, 3) == 'DCO') {
      pids_list.push(pid)
    }
  }
  var pids_str = '"' + pids_list.join(',') + '"'
  var options  = {
    scriptPath: req.CONFIG.PATH_TO_NODE_SCRIPTS,
    args: ['-host', req.CONFIG.dbhost, '-pids', pids_str, '-outfile', outfile_path]
  };


  var script_name      = 'create_all_dco_metadata.py'
  var script_path      = path.join(req.CONFIG.PATH_TO_NODE_SCRIPTS, script_name)
  var full_script_path = script_path + ' ' + options.args.join(' ')
  console.log(full_script_path)
  return;

  var dco_metadata_process = spawn(options.scriptPath + '/vamps_script_update_metadata.py', options.args, {
    env: {'PATH': req.CONFIG.PATH, 'LD_LIBRARY_PATH': req.CONFIG.LD_LIBRARY_PATH},
    detached: true, stdio: 'pipe'
  });  // stdin, stdout, stderr


  console.log(full_script_path)

  var output = '';

  dco_metadata_process.stdout.on('data', function UpdateMetadata(data) {
    data = data.toString().trim();
    console.log('stdout: ' + data);
    output += data;
  });
  dco_metadata_process.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
    req.flash('fail', 'Metadata Update Failed');
  });
  dco_metadata_process.on('close', function checkExitCode(code) {
    console.log('From apply_metadata process exited with code ' + code);
    if (req.CONFIG.site == 'vamps') {
      console.log('VAMPS PRODUCTION -- no print to log');
    } else {
      console.log('OUTPUT:\n' + output)
    }
    req.flash('success', 'Success in updating metadata');
    res.render('admin/validate_metadata', {
      title: 'VAMPS Validate Metadata',
      user: req.user,
      project_info: JSON.stringify(PROJECT_INFORMATION_BY_PNAME),
      hostname: req.CONFIG.hostname, // get the user out of session and pass to template
    });
  });
});


//
function get_env_package_index(val) {
  var idx = -1
  for (key in MD_ENV_PACKAGE) {
    if (val != '' && MD_ENV_PACKAGE[key] == val.toLowerCase()) {
      idx = key;
    }
  }
  return idx
}

function get_target_gene_index(val) {
  var idx = -1
  for (key in MD_TARGET_GENE) {
    if (val != '' && MD_TARGET_GENE[key] == val.toLowerCase()) {
      idx = key;
    }
  }
  return idx
}

function get_domain_index(val) {
  var idx = -1
  for (key in MD_DOMAIN) {
    if (val != '' && MD_DOMAIN[key] == val.toLowerCase()) {
      idx = key;
    }
  }
  return idx
}

function get_geo_loc_name_index(val) {
  var idx = -1
  for (key in MD_ENV_CNTRY) {
    if (val != '' && MD_ENV_CNTRY[key] == val.toLowerCase()) {
      idx = key;
    }
  }
  if (idx == -1) {
    for (key in MD_ENV_LZC) {
      if (val != '' && MD_ENV_LZC[key] == val.toLowerCase()) {
        idx = key;
      }
    }
  }
  return idx
}

function get_sequencing_platform_index(val) {
  var idx = -1
  for (key in MD_SEQUENCING_PLATFORM) {
    if (val != '' && MD_SEQUENCING_PLATFORM[key] == val.toLowerCase()) {
      idx = key;
    }
  }
  return idx
}

function get_dna_region_index(val) {
  var idx = -1
  for (key in MD_DNA_REGION) {
    if (val != '' && MD_DNA_REGION[key] == val.toLowerCase()) {
      idx = key;
    }
  }
  return idx
}

function get_env_term_index(val) {
  var idx = -1
  for (key in MD_ENV_ENVO) {
    if (val != '' && MD_ENV_ENVO[key] == val.toLowerCase()) {
      idx = key;
    }
  }
  return idx
}

function get_adapter_sequence_index(val) {
  var idx = -1
  for (key in MD_ADAPTER_SEQUENCE) {
    if (val != '' && MD_ADAPTER_SEQUENCE[key] == val) {
      idx = key;
    }
  }
  return idx
}

function get_illumina_index_index(val) {
  var idx = -1
  for (key in MD_ILLUMINA_INDEX) {
    if (val != '' && MD_ILLUMINA_INDEX[key] == val) {
      idx = key;
    }
  }
  return idx
}

function get_run_index(val) {
  var idx = -1
  for (key in MD_RUN) {
    if (val != '' && MD_RUN[key] == val) {
      idx = key;
    }
  }
  return idx
}

function get_primer_suite_index(val) {
  var idx = -1
  for (key in MD_PRIMER_SUITE) {
    if (val != '' && MD_PRIMER_SUITE[key] == val) {
      idx = key;
    }
  }
  return idx
}

function validate_metadata(req, obj) {
  console.log('in fxn validate_metadata')
  console.log('must be done with names NOT IDs')

  //console.log(obj)

  var validation          = {}
  validation.error        = false
  validation.empty_values = false
  validation.msg          = []
  field_collector         = {}
  for (did in obj) {
    for (mdname in obj[did]) {
      field_collector[mdname.toLowerCase()] = 1  //lowercase
    }
  }
  //unique_field_list = Object.keys(field_collector)

  for (i in req.CONSTS.REQ_METADATA_FIELDS) {
    req_name = req.CONSTS.REQ_METADATA_FIELDS[i]
    if (field_collector.hasOwnProperty(req_name)) {
      console.log('got ' + req_name)
    } else {
      console.log('missing')
      validation.error = true
      validation.msg.push("Missing required field (entire column) in csv file: " + req_name)
    }
  }

  for (did in obj) {
    for (mdname in obj[did]) {
      ds      = DATASET_NAME_BY_DID[did]
      var val = obj[did][mdname]
      if ((val == undefined || val == '') && req.CONSTS.REQ_METADATA_FIELDS.indexOf(mdname) != -1) {   // and mdname in required_metadata_fields

        validation.empty_values = true
        validation.error        = true
        validation.msg.push(ds + ": Missing required value for: " + mdname)
      } else {
        if (mdname == 'env_package') {
          if (get_env_package_index(val) == -1) {
            validation.error = true
            validation.msg.push(ds + ": The 'env_package' value ('" + val + "') is not in the allowed list.")
          }
        } else if (mdname == 'target_gene') {
          if (get_target_gene_index(val) == -1) {
            validation.error = true
            validation.msg.push(ds + ": The 'target_gene' value ('" + val + "') is not in the allowed list.")
          }
        } else if (mdname == 'domain') {
          if (get_domain_index(val) == -1) {
            validation.error = true
            validation.msg.push(ds + ": The 'domain' value ('" + val + "') is not in the allowed list.")
          }
        } else if (mdname == 'geo_loc_name') {
          if (get_geo_loc_name_index(val) == -1) {
            validation.error = true
            validation.msg.push(ds + ": The 'geo_loc_name' value ('" + val + "') is not in the allowed list.")
          }
        } else if (mdname == 'sequencing_platform') {
          if (get_sequencing_platform_index(val) == -1) {
            validation.error = true
            validation.msg.push(ds + ": The 'sequencing_platform' value ('" + val + "') is not in the allowed list.")
          }
        } else if (mdname == 'dna_region') {
          if (get_dna_region_index(val) == -1) {
            validation.error = true
            validation.msg.push(ds + ": The 'dna_region' value ('" + val + "') is not in the allowed list.")
          }
        } else if (mdname == 'env_material') {
          if (get_env_term_index(val) == -1) {
            validation.error = true
            validation.msg.push(ds + ": The 'env_material' value ('" + val + "') is not in the allowed list.")
          }
        } else if (mdname == 'env_biome') {
          if (get_env_term_index(val) == -1) {
            validation.error = true
            validation.msg.push(ds + ": The 'env_biome' value ('" + val + "') is not in the allowed list.")
          }
        } else if (mdname == 'env_feature') {
          if (get_env_term_index(val) == -1) {
            validation.error = true
            validation.msg.push(ds + ": The 'env_feature' value ('" + val + "') is not in the allowed list.")
          }
        } else if (mdname == 'collection_date') {
          valid = helpers.isValidMySQLDate(val)
          if (!valid) {
            validation.error = true
            validation.msg.push(ds + ": The 'collection_date' value ('" + val + "') is not a valid date (valid format: YYYY-MM-DD).")
          }
        } else if (mdname == 'latitude' || mdname == 'longitude') {
          if (isNaN(val)) {
            validation.error = true
            validation.msg.push(ds + ": Latitude and Longitude must be in decimal degrees.")
          }
        }
      }
    }
  }
  return validation


}

function convert_ids_to_names_for_display(obj) {
  console.log('in fxn convert_ids_to_names_for_display')
  var new_obj = {}
  for (did in obj) {
    new_obj[did] = {}
    for (mdname in obj[did]) {
      mdname                  = mdname.toLowerCase()
      var data                = helpers.required_metadata_names_from_ids(obj[did], mdname)
      new_obj[did][data.name] = data.value
    }
  }
  return new_obj
}

function convert_names_to_ids_for_storage(obj) {
  console.log('in fxn convert_names_to_ids_for_storage')
  var new_obj = {}
  for (did in obj) {
    new_obj[did] = {}
    for (mdname in obj[did]) {
      var val                 = obj[did][mdname]
      var data                = helpers.required_metadata_ids_from_names(obj[did], mdname)
      new_obj[did][data.name] = data.value
    }
  }
  return new_obj
}

function get_name_ordered_users_list() {
  user_order = []
  for (uid in  ALL_USERS_BY_UID) {
    obj     = ALL_USERS_BY_UID[uid]
    obj.uid = uid
    user_order.push(obj)
  }
  user_order.sort(function sortByAlpha(a, b) {
    return helpers.compareStrings_alpha(a.last_name, b.last_name)
  });
  return user_order
}

function get_name_ordered_projects_list() {
  project_order = [];
  for (pid in  PROJECT_INFORMATION_BY_PID) {
    project_order.push(PROJECT_INFORMATION_BY_PID[pid])
  }
  project_order.sort(function sortByAlpha(a, b) {
    return helpers.compareStrings_alpha(a.project, b.project)
  });
  return project_order
}

// TODO: mv to helpers and refactor (see also in metadata & user_data
router.get('/file_utils', helpers.isLoggedIn, function (req, res) {

  console.log('in file_utils');
  var user = req.query.user;

  // console.log("file from file_utils: ");
  // console.log(file);
  //// DOWNLOAD //////
  if (req.query.fxn == 'download' && req.query.template == '1') {
    var file = path.join(req.CONFIG.PROCESS_DIR, req.query.filename);
    res.setHeader('Content-Type', 'text');
    res.download(file); // Set disposition and send it.
  } else if (req.query.fxn == 'download' && req.query.type == 'pcoa') {
    var file = path.join(req.CONFIG.PROCESS_DIR, 'tmp', req.query.filename);
    res.setHeader('Content-Type', 'text');
    res.download(file); // Set disposition and send it.
  } else if (req.query.fxn == 'download') {
    var file = path.join(req.CONFIG.USER_FILES_BASE, user, req.query.filename);

    res.setHeader('Content-Type', 'text');
    res.download(file); // Set disposition and send it.
    ///// DELETE /////
  } else if (req.query.fxn == 'delete') {
    // console.log("UUU req.query");
    // console.log(req.query);


    var file = path.join(req.CONFIG.USER_FILES_BASE, user, req.query.filename);

    if (req.query.type == 'elements') {
      fs.unlink(file, function deleteFile(err) {
        if (err) {
          console.log("err 8: ");
          console.log(err);
          req.flash('fail', err);
        } else {
          req.flash('success', 'Deleted: ' + req.query.filename);
          res.redirect("/visuals/saved_elements");
        }
      }); //
    } else {
      fs.unlink(file, function deleteFile(err) {
        if (err) {
          req.flash('fail', err);
          console.log("err 9: ");
          console.log(err);
        } else {
          req.flash('success', 'Deleted: ' + req.query.filename);
          res.redirect("/admin/all_files_retrieval");
        }
      });
    }

  }

});
//
//
//
router.get('/users_index', helpers.isLoggedIn, function (req, res) {

  console.log('in indexusers')
  console.log(req.user)
  var rows = []
  if (req.user.security_level <= 10) {
    // for(uid in ALL_USERS_BY_UID){
// 	        rows.push({uid:uid,fullname:ALL_USERS_BY_UID[uid].last_name+', '+ALL_USERS_BY_UID[uid].first_name,username:ALL_USERS_BY_UID[uid].username})
// 	    }
// 	    rows.sort(function(a, b){
// 	        return helpers.compareStrings_alpha(a.fullname, b.fullname);
// 	    });
    var qSelect    = "SELECT * from user where active='1'";
    var collection = req.db.query(qSelect, function (err, rows, fields) {
      if (err) {
        msg = 'ERROR Message ' + err;
        helpers.render_error_page(req, res, msg);
      } else {
        rows.sort(function (a, b) {
          // sort by last name
          return helpers.compareStrings_alpha(a.last_name, b.last_name);
        });
        console.log((new Date(rows[0].last_sign_in_at)).getFullYear())
        res.render('admin/users_index', {
          title: 'VAMPS:users',
          rows: rows,
          user: req.user, hostname: req.CONFIG.hostname
        });

      } // end else
    });
  } else {
    req.flash('fail', 'Permission Denied')
    res.render('denied', {
      title: 'VAMPS:users',
      user: req.user,
      hostname: req.CONFIG.hostname,
    });


  }

});
//
//
//
router.get('/kill_cluster_jobs', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
    console.log('IN GET kill_cluster_jobs')
    res.render('admin/kill_cluster_jobs', {
      title: 'VAMPS:kill_cluster_jobs',
      user: req.user,
      hostname: req.CONFIG.hostname,
    });
});
//
//
//
router.post('/kill_cluster_jobs', [helpers.isLoggedIn, helpers.isAdmin], function (req, res) {
    console.log('IN POST kill_cluster_jobs')
    console.log(req.body)
    var jid = req.body.jobid
    var cmd
    cmd += "export SGE_ROOT="+req.CONFIG.SGE_ROOT+'; '
    cmd += "/opt/sge/bin/lx-amd64/qdel "+jid
    if(! helpers.isInt(jid)){
        req.flash('fail', 'FAIL: Job ID is not Integer');
        res.redirect('/admin/kill_cluster_jobs');
        return
    }
    console.log('Running Command: '+cmd)
    const exec = require('child_process').exec;
    exec(cmd, {env: {'SGE_ROOT': req.CONFIG.SGE_ROOT}}, function(e, stdout, stderr) {
        if (e instanceof Error) {
            console.error(e);
            req.flash('fail', e.toString());
            res.redirect('/admin/kill_cluster_jobs');
            return
        }
        console.log('stdout ', stdout);
        console.log('stderr ', stderr);
        req.flash('success', 'Done: '+cmd);
        res.redirect('/admin/kill_cluster_jobs');
        return
    });
    
   //  res.render('admin/kill_cluster_jobs', {
//       title: 'VAMPS:kill_cluster_jobs',
//       user: req.user,
//       hostname: req.CONFIG.hostname,
//     });
});
//
//
//
module.exports = router;
