var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');
var queries = require('./queries');

router.get('/admin_index', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
   
   console.log('in admin')
   res.render('admin/admin_index', {
              title     :'VAMPS Site Administration',
              message   : req.flash('message'), 
              user: req.user, 
              hostname: req.C.hostname, // get the user out of session and pass to template
            }); 

});
//
//
//
router.get('/assign_permissions', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
   
   console.log('in assign_permissions')
   res.render('admin/assign_permissions', {
              title     :'VAMPS Site Administration',
              message   : req.flash('message'), 
              user: req.user, 
              project_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
              user_info: JSON.stringify(ALL_USERS_BY_UID),
              hostname: req.C.hostname, // get the user out of session and pass to template
            }); 

});

//
//
//
router.get('/permissions', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
   
   console.log('in permissions')
   //console.log(ALL_USERS_BY_UID)
   console.log(PROJECT_INFORMATION_BY_PID)
   res.render('admin/permissions', {
              title     :'VAMPS Site Administration',
              message   : req.flash('message'), 
              user: req.user, 
              project_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
              user_info: JSON.stringify(ALL_USERS_BY_UID),
              hostname: req.C.hostname, // get the user out of session and pass to template
            }); 

});
router.get('/public', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
   
   console.log('in public')
   //console.log(ALL_USERS_BY_UID)
   console.log(PROJECT_INFORMATION_BY_PID)
   res.render('admin/public', {
              title     :'VAMPS Site Administration',
              message   : req.flash('message'), 
              user: req.user, 
              project_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
              user_info: JSON.stringify(ALL_USERS_BY_UID),
              hostname: req.C.hostname, // get the user out of session and pass to template
            }); 

});
router.post('/public_update', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
   
   console.log('in public_update')
   //console.log(ALL_USERS_BY_UID)
   console.log(PROJECT_INFORMATION_BY_PID);
   selected_pid = req.body.pid 
   new_public = parseInt(req.body.public);
   if(new_public !== PROJECT_INFORMATION_BY_PID[selected_pid].public){
        q = "UPDATE project set public='"+new_public+"' WHERE project_id='"+selected_pid+"'"

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
                  response = 'Query error: ' + err
                }else{
                  response = 'Successfully updated'
                   
                }    
                   
                res.send(response)
              
        });
  }else{
    res.send('no change to public status')
  }
});
router.post('/show_user_info', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
   
      console.log('in show_user_info')
      selected_uid = req.body.uid 
      if(selected_uid in ALL_USERS_BY_UID){
        info = ALL_USERS_BY_UID[selected_uid]
      }else{

      }
      html = '<hr>'
      html += '<table>'
      html += '<tr>';
      html += '<td>Last</td><td>'+info.last_name+'</td>';
      html += '</tr>';
      html += '<tr>';
      html += '<td>First</td><td>'+info.first_name+'</td>';
      html += '</tr>';
      html += '<tr>';
      html += '<td>UserName</td><td>'+info.username+'</td>';
      html += '</tr>';
      html += '<table>'


      res.send(html)

});
//
//
//
router.get('/alter_project', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
   
   console.log('in alter_project')
   var url = require('url');
   var url_parts = url.parse(req.url, true);
   var query = url_parts.query;
   
   if(url_parts.query.pid === undefined){
    var pid = 0;
   }else{
    var pid = url_parts.query.pid;
   }
   console.log(pid) 
   res.render('admin/alter_project', {
              title     :'VAMPS Site Administration',
              message   : req.flash('message'), 
              user: req.user, 
              pid_to_open:pid,
              project_info: JSON.stringify(PROJECT_INFORMATION_BY_PID),
              user_info: JSON.stringify(ALL_USERS_BY_UID),
              hostname: req.C.hostname, // get the user out of session and pass to template
            }); 

});
//
//
//
router.post('/show_project_info', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
   
      console.log('in show_user_info')
      console.log(PROJECT_INFORMATION_BY_PID)

      selected_pid = req.body.pid 
      if(selected_pid in PROJECT_INFORMATION_BY_PID){
        info = PROJECT_INFORMATION_BY_PID[selected_pid]
      }else{

      }
      html = ''
      
      html += "<table class='admin_table' border='1'>";
      html += '<tr><th></th><th>Current Value</th><th>Enter or Select New Value</th><th></th><th>Msg</th></tr>';
      
      html += '<tr>';
      html += "<form id='' name='update_pname_form' method='POST' action='update_pname'>"
      html += ' <td>Project Name (pid)</td><td>'+info.project+' <small>('+info.pid+')</small></td>';
      html += " <td><input type='edit' id='new_pname' name='new_pname' value='"+info.project+"' width='200' style='width: 200px' /></td>";
      html += " <td><input id='new_pname_btn' type='button' value='Update' onclick=\"update_project('pname', '"+selected_pid+"')\"></td>";
      html += " <td><div id='new_pname_response_id'></div></td>";
      html += "</form>"
      html += '</tr>';
      
      html += '<tr>';
      html += "<form id='' name='update_powner_form' method='POST' action='update_powner'>"
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
      html += "</form>"
      html += '</tr>';
      
      
      html += '<tr>';
      html += "<form id='' name='update_ptitle_form' method='POST' action='update_ptitle'>"
      html += ' <td>Project Title</td><td>'+info.title+'</td>';
      html += " <td><input type='edit' id='new_ptitle' name='new_ptitle' value='"+info.title+"' width='200' style='width: 200px'/></td>";
      html += " <td><input id='new_ptitle_btn' type='button' value='Update' onclick=\"update_project('ptitle', '"+selected_pid+"')\"></td>";
      html += " <td><div id='new_ptitle_response_id'></div></td>";
      html += "</form>"
      html += '</tr>';
      
      html += '<tr>';
      html += "<form id='' name='update_pdesc_form' method='POST' action='update_pdesc'>"
      html += ' <td>Project Description</td><td>'+info.description+'</td>';
      html += " <td><textarea id='new_pdesc' name='new_pdesc'  value='"+info.description+"' rows='2' cols='28'>"+info.description+"</textarea></td>";
      html += " <td><input id='new_pdesc_btn' type='button' value='Update' onclick=\"update_project('pdesc', '"+selected_pid+"')\"></td>";
      html += " <td><div id='new_pdesc_response_id'></div></td>";
      html += "</form>"
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
      html += '<td><a href="">View or Change</a></td>';
      html += "<td></td>";
      html += "<td></td>";
      html += '</tr>';
      
      html += '<table>';
      //html += "<input type='submit' value='Update'>";
      //html += "<input type='hidden' name='pid' value='"+selected_pid+"'>";
      //html += '</form>'

      res.send(html)

});
//
//
//
router.post('/update_project_info', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
  console.log(req.body)
  console.log('in update_project_info');
  var item_to_update = req.body.item;
  var value = req.body.value;
  var pid = req.body.pid;
  var q = "UPDATE project set";
  console.log(ALL_DATASETS)
  console.log(typeof ALL_DATASETS)
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
                prj.name = new_project_name
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
                prj.title = new_project_title
              }
          });
          q += " title='"+new_project_title+"'"; 
          break;

      case 'pdesc':
          new_project_desc = value;
          PROJECT_INFORMATION_BY_PID[pid].description = new_project_desc;
          q += " project_description='"+new_project_desc+"'";          
          break;

      default:
          console.log('ERROR in update_project_info');
      
    }
    q += " WHERE project_id='"+pid+"'";

    console.log(q)
    connection.query(q, function(err, rows, fields){ 
        //console.log(qSequenceCounts)
            if (err)  {
              console.log('Query error: ' + err);
              response = 'Query error: ' + err
            }else{
              response = 'Successfully updated'
               
            }    
               
            res.send(response)
          
    });

    
});
//
//
//
router.post('/grant_access', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
   
      console.log('in grant_access')
      selected_uid = req.body.uid;
      selected_pid = req.body.pid;
      var html = 'Successfully Updated'
      // 1-add to PROJECT_INFORMATION_BY_PID[selected_pid]
      if(selected_pid in PROJECT_INFORMATION_BY_PID){        
        console.log(PROJECT_INFORMATION_BY_PID[selected_pid].permissions)
        console.log(PROJECT_INFORMATION_BY_PID[selected_pid].permissions.indexOf(parseInt(selected_uid)))
        if(PROJECT_INFORMATION_BY_PID[selected_pid].permissions.indexOf(parseInt(selected_uid)) === -1){
            PROJECT_INFORMATION_BY_PID[selected_pid].permissions.push(parseInt(selected_uid))
            console.log('11111')
        }else{
          html = 'User already has access to this project.'
          res.send(html)

          //html = 'Trying to push!'
          console.log('22222')
          return
        }
      }else{
        html = 'Could not find project - This is a PROBLEM!'
      }
      
      // 2- add to table 'access'
      //q = "INSERT ignore into `access` (user_id, project_id) VALUES('"+selected_uid+"','"+selected_pid+"')"
      connection.query(queries.insert_access_table(selected_uid,selected_pid), function(err, rows, fields){ 
      //console.log(qSequenceCounts)
          if (err)  {
            console.log('Query error: ' + err);
            
            html = 'Query error: ' + err
          } else {            
            
          }
          res.send(html)
         
      });
      




      

});
// router.post('/grant_access2', [helpers.isLoggedIn, helpers.isAdmin], function(req, res) {
   
//       console.log('in grant_access')
//       selected_uid = req.body.uid;
//       selected_pid = req.body.pid;
//       var html = 'Successfully Updated'
//       // 1-add to PROJECT_INFORMATION_BY_PID[selected_pid]
//       if(selected_pid in PROJECT_INFORMATION_BY_PID){        
        
//         if(PROJECT_INFORMATION_BY_PID[selected_pid].permissions.indexOf(selected_uid) === -1){
//             html = 'User already has access in PROJECT_INFORMATION_BY_PID'
//         }else{
//           PROJECT_INFORMATION_BY_PID[selected_pid].permissions.push(selected_uid)

//         }
//       }else{
//         html = 'Could not find project - This is a PROBLEM!'
//       }
      
//       // 2- add to table 'access'
//       //q = "INSERT ignore into `access` (user_id, project_id) VALUES('"+selected_uid+"','"+selected_pid+"')"
//       connection.query(queries.insert_access_table(selected_uid,selected_pid), function(err, rows, fields){ 
//       //console.log(qSequenceCounts)
//           if (err)  {
//             console.log('Query error: ' + err);
            
//             html = 'Query error: ' + err
//           } else {            
            
//           }
//           res.send(html)
         
//       });
      




      

// });

module.exports = router;
