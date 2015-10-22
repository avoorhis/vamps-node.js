$(document).ready(function(){

   
    select_user = document.getElementById('select_user') || null;
    if (select_user !== null) {
      select_user.addEventListener('change', function () {
          get_select_user_info();
      });
    }

    select_project = document.getElementById('select_project') || null;
    if (select_project !== null) {
      select_project.addEventListener('change', function () {
          show_access_button();
      });
    }

    select_project_alter = document.getElementById('select_project_alter') || null;
    if (select_project_alter !== null) {
      select_project_alter.addEventListener('change', function () {
          show_current_project_info();
      });
    }

    grant_access_btn = document.getElementById('grant_access_btn') || null;
    if (grant_access_btn !== null) {
      grant_access_btn.addEventListener('click', function () {
          grant_access();
      });
    }
    

});
//
//
//
function update_project(item_to_update, pid)
{
    
    switch(item_to_update){
      case 'pname':
          response_div = document.getElementById('new_pname_response_id');
          new_value = document.getElementById('new_pname').value;
          break;
      case 'powner':
          response_div = document.getElementById('new_powner_response_id');
          new_value = document.getElementById('new_oid').value;
          break;
      case 'ptitle':
          response_div = document.getElementById('new_ptitle_response_id');
          new_value = document.getElementById('new_ptitle').value;
          break;
      case 'pdesc':
          response_div = document.getElementById('new_pdesc_response_id');
          new_value = document.getElementById('new_pdesc').value;
          break;
      default:
          response_div = document.getElementById('new_pname_response_id');
          new_value = document.getElementById('new_pname').value;

      
    }
    var xmlhttp = new XMLHttpRequest();  
    xmlhttp.open("POST", '/admin/update_project_info', true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("data-type","html");
    var args = 'item='+item_to_update+'&value='+new_value+'&pid='+pid;
    xmlhttp.onreadystatechange = function() {        
      if (xmlhttp.readyState == 4 ) {
          
          var response = xmlhttp.responseText;            
          response_div.innerHTML = response;      
         
      }
    };
    xmlhttp.send(args);
}
//
// SELECT USER
//
function get_select_user_info()
{
  
    selected_uid = document.getElementById('select_user').value;
    user_info_div = document.getElementById('user_info_div');
    document.getElementById('select_projects_div').style.visibility = 'visible';
    



    var xmlhttp = new XMLHttpRequest();  
    xmlhttp.open("POST", '/admin/show_user_info', true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("data-type","html");
    var args = 'uid='+selected_uid;
    xmlhttp.onreadystatechange = function() {        
      if (xmlhttp.readyState == 4 ) {
          
          var response = xmlhttp.responseText;            
          user_info_div.innerHTML = response;      
         
      }
    };
    xmlhttp.send(args);
  
}

//
//
//
function show_access_button()
{
    //alert('in show_access_button');
    selected_uid = document.getElementById('select_user').value;
    info_div = document.getElementById('info_div');
    selected_pid = document.getElementById('select_project').value;
    document.getElementById('assign_access_div').style.visibility = 'visible';

}
function grant_access()
{
    selected_uid = document.getElementById('select_user').value;
    selected_pid = document.getElementById('select_project').value;
    document.getElementById('select_project').value = '.....';
    document.getElementById('assign_access_div').style.visibility = 'hidden';
    
    var xmlhttp = new XMLHttpRequest();  
    xmlhttp.open("POST", '/admin/grant_access', true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("data-type","html");
    var args = 'uid='+selected_uid+'&pid='+selected_pid;
    xmlhttp.onreadystatechange = function() {        
      if (xmlhttp.readyState == 4 ) {
          
          var response = xmlhttp.responseText;            
          info_div.innerHTML = response;      
         
      }
    };
    xmlhttp.send(args);

}
//
//
//
function show_current_project_info()
{
    //alert('in show_access_button');
    
    info_div = document.getElementById('current_info');
    selected_pid = document.getElementById('select_project_alter').value;
    var xmlhttp = new XMLHttpRequest();  
    xmlhttp.open("POST", '/admin/show_project_info', true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("data-type","html");
    var args = 'pid='+selected_pid;
    xmlhttp.onreadystatechange = function() {        
      if (xmlhttp.readyState == 4 ) {
          
          var response = xmlhttp.responseText;            
          info_div.innerHTML = response;      
         
      }
    };
    xmlhttp.send(args);

}
