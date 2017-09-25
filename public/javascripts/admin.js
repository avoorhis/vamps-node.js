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

    $('#upload_metadata_form').submit(function() {
        var selected_pid = document.getElementById('select_project_for_metadata').value;
        if(selected_pid == 0){
          alert('Select a project')
          return false
        }
        var selected_file = document.getElementById('meta').value;
        var info_div = document.getElementById('md_result_div');
        if(selected_file.length == 0){
          alert('Select a file')
          return false
        }
        $("#status").empty().text("File is uploading...");

        $(this).ajaxSubmit({

            error: function(xhr) {
                status('Error: ' + xhr.status);
            },

            success: function(response) {
               // alert()
                response = JSON.parse(response)

                console.log('submit sucess: ')
                var html = ''
                html += "<form id='' name='' method='POST' action='apply_metadata'>"
                html += "<input type='hidden' name='pid' value='"+selected_pid+"'>"
                html += "<input type='hidden' name='filename' value='"+response.filename+"'>"
                if(response.validation.error){
                  html += "Error count: "+response.validation.msg.length.toString()
                  html += "<div class='error_div'>"
                  for(i in response.validation.msg){
                    html += response.validation.msg[i]+"<br>"
                  }
                  html += "</div>"
                  html += "<div class='pull-right'><small><input type='submit' value='Bypass Validation' /></small>"
                  html += "</div>"
                }else{
                  html += "<span style='color:green'>Validated!</span> <input type='submit' class='btn btn-xs btn-success' value='Apply This Metadata'>"
                }

                html += "<br>(Required Metadata from Upload (in blue) - read-only)<br>"
                html += "<div style='width:100%;height:200px;overflow:auto'>"
                html += "<table class='table table-striped'><tr><td>Dataset</td>"
                var req_header_names = response.sorted_req_header_names
                var cust_header_names = response.sorted_cust_header_names
                for(n in req_header_names){
                  html += "<td>"+req_header_names[n]+"</td>"
                }
                for(n in cust_header_names){
                  html += "<td>"+cust_header_names[n]+"</td>"
                }
                html += "</tr>"
                html += "<tr>"
                for(ds in response.data){
                  //if( ds != 'required_metadata' && ds != 'error'){
                    html += "<tr>"
                    html += "<td>"+ds+"</td>"
                    for(i in response.data[ds]['req_data']){
                        html += "<td bgcolor='#AFDDF9'>"+response.data[ds]['req_data'][i]
                        name = ds+'--'+req_header_names[i]// concat ds and headername
                        html += "<input type='hidden' name='"+name+"' value='"+response.data[ds]['req_data'][i]+"'>"
                        html += "</td>"
                    }
                    for(i in response.data[ds]['cust_data']){
                        html += "<td bgcolor='#F9AFB9'>"+response.data[ds]['cust_data'][i]
                        name = ds+'--'+cust_header_names[i]// concat ds and headername
                        html += "<input type='hidden' name='"+name+"' value='"+response.data[ds]['cust_data'][i]+"'>"
                        html += "</td>"
                    }
                    html += "</tr>"
                  //}
                }
                html += "</table>"
                html += "</div>"
                if( ! response.empty_values){
                  html += "</form>"
                }
                //info_div.innerHTML = html;

                $("#md_result_div").empty().html(html);
                $("#status").empty().text("");

            }
        });
        //Very important line, it disable the page refresh.
        return false;
    });


});

//
//
//
function update_dataset(did, pid)
{
  //alert(did+' - '+pid)
      response_div = document.getElementById('msg_div_'+did);
      name = document.getElementById('new_dname_edit_'+did).value;
      desc = document.getElementById('new_ddesc_edit_'+did).value;

      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("POST", '/admin/update_dataset_info', true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.setRequestHeader("data-type","html");
      var args = 'pid='+pid+'&did='+did+'&name='+name+'&desc='+desc;

      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {

            var response = xmlhttp.responseText;
            response_div.innerHTML = response;

        }
      };
      xmlhttp.send(args);


}
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
          return 'ERROR'


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
function grant_access(type, id)
{

    var info_div = document.getElementById('response_info');

    //form = document.getElementById(type+'_'+id);

    //alert('1')
    var selected_pid, selected_uid;
    var select_name = type+'_'+id+'_select'
    //alert(type+" "+id)
    //alert(select_name)
    if(type === 'by_user'){
      selected_pid = document.getElementById(select_name).value
      selected_uid = id
    }else if(type === 'by_project'){
      selected_uid = document.getElementById(select_name).value
      selected_pid = id
    }else{

      info_div.innerHTML = 'Error-1';
      return;
    }

    //alert(selected_pid+" "+selected_uid)

    if(selected_uid === '0' || selected_pid === '0'){
      info_div.innerHTML = 'Choose a name';
      return;
    }
   //return

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
function change_public(pid)
{
  var info_div = document.getElementById('msg_div_'+pid);
  var form = document.getElementById('public_form_'+pid);
  radio_name = 'public_radio_'+pid
  //alert(document.forms[4].name)
  //alert(form.name)

   pub = form[radio_name][0]
   priv = form[radio_name][1]

   if(pub.checked){
     public = '1'
   }else{
    public = '0'
   }
   var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", '/admin/public_update', true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("data-type","html");
    var args = 'public='+public+'&pid='+pid;
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
function change_admin(uid)
{
  var info_div = document.getElementById('msg_div_'+uid);
  var form = document.getElementById('admin_form_'+uid);
  var inactivate_name = 'inactivate_radio_'+uid
  if(form[inactivate_name].checked){
        
        var args = 'inactivate=1&uid='+uid;
        url = '/admin/inactivate_user'
  }else{
      url = '/admin/admin_update'
      var radio_name = 'admin_radio_'+uid
      var admin_status_radios    = form[radio_name]

       if(admin_status_radios[0].checked){
            status = '1'
       }else if(admin_status_radios[1].checked){
            status = '10' 
       }else if(admin_status_radios[2].checked){
            status = '45' 
       }else{
            status = '50' 
       }
       
    }
   var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("data-type","html");
    var args = 'status='+status+'&uid='+uid;
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 ) {
          var response = xmlhttp.responseText;
          //if(! form[inactivate_name].checked){
            info_div.innerHTML = response;
          //}

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
    document.getElementById('refresh_div').href = 'alter_project?pid='+selected_pid
    //"<a href='alter_project?pid="+selected_pid+"'></a>";

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
//
//
//
function download_metadata(){
    var info_div = document.getElementById('md_result_div');
    var selected_pid = document.getElementById('select_project_for_metadata').value;
    if(selected_pid == 0){
      alert('Select a project')
      info_div.innerHTML = "";
      return
    }
    window.open('/user_data/download_selected_metadata?pid='+selected_pid);

}
//
//
//
function upload_metadata(){
    var form = document.getElementById('upload_metadata_form');
    var info_div = document.getElementById('md_result_div');
    var selected_pid = document.getElementById('select_project_for_metadata').value;
    if(selected_pid == 0){
      alert('Select a project')
      info_div.innerHTML = "";
    }
    var input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", "selected_pid");
    input.setAttribute("value", selected_pid);
    form.appendChild(input);

    $(form).submit();

}
//
//
//
function show_metadata(){
  
    var info_div = document.getElementById('md_result_div');
    var selected_pid = document.getElementById('select_project_for_metadata').value;
    if(selected_pid == 0){
      alert('Select a project')
      info_div.innerHTML = "";
      return
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", '/admin/show_metadata', true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("data-type","html");
    var args = 'pid='+selected_pid;
    //text_edits = ['altitude','collection_date','common_name','depth','description','elevation','latitude','longitude','public','taxon_id','fragment_name','dna_region','sequencing_platform','domain']
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 ) {
          info_div.style.width = '100%'
          //info_div.style.height = '300px'
          //info_div.style.overflow = 'auto';
          var html = ''
          var response = JSON.parse(xmlhttp.responseText);
          if(response.validation.error){
              html += "Error count: "+response.validation.msg.length.toString()
              html += "<div class='error_div' >"
              for(i in response.validation.msg){
                html += response.validation.msg[i]+"<br>"
              }
              html += "</div>"
            }else if(response.validation.empty_values){
              html += 'Empty Values present'
            }else{
              // VALIDATES (Prepend form)

              html += "<div style='color:green'>Validated!</div>"

          }

          var req_header_names = response.sorted_req_header_names
          var cust_header_names = response.sorted_cust_header_names

          html += "Required Metadata from Database (in blue) - read-only)<br>"
          html += "<div style='width:100%;height:200px;overflow:auto'>"
          html += "<table class='table table-striped'><tr><td>Dataset</td>"

          for(n in req_header_names){
            html += "<td>"+req_header_names[n]+"</td>"
          }
          for(n in cust_header_names){
            html += "<td>"+cust_header_names[n]+"</td>"
          }
          html += "</tr>"
          html += "<tr>"
          for(ds in response.data){
            html += "<tr>"
            html += "<td>"+ds+"</td>"
            for(i in response.data[ds]['req_data']){
                html += "<td bgcolor='#AFDDF9'>"+response.data[ds]['req_data'][i]
                name = ds+'--'+req_header_names[i]// concat ds and headername
                html += "<input type='hidden' name='"+name+"' value='"+response.data[ds]['req_data'][i]+"'>"
                html += "</td>"
            }
            for(i in response.data[ds]['cust_data']){
                html += "<td bgcolor='#F9AFB9'>"+response.data[ds]['cust_data'][i]
                name = ds+'--'+cust_header_names[i]// concat ds and headername
                html += "<input type='hidden' name='"+name+"' value='"+response.data[ds]['cust_data'][i]+"'>"
                html += "</td>"
            }
            html += "</tr>"
          }
          html += "</table></div>"
          info_div.innerHTML = html;

      }
    };
    xmlhttp.send(args);
}
function create_dco_file(){
    var args = {}
    args.download_type = 'all_dco'
    args.orientation = 'rows'
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", '/user_data/download_selected_metadata', true);
    xmlhttp.setRequestHeader("Content-type","application/json");
   
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 ) {
          var response = xmlhttp.responseText;
          alert('Saved: '+response)
      }
    }
    xmlhttp.send(JSON.stringify(args));
}