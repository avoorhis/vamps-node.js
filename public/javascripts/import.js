

//
// DENDROGRAM1  D3 Phylogram
//
var use_original_names = document.getElementById('use_original_names');

if (use_original_names !== null) {
  use_original_names.addEventListener('click', function () {
      var project = document.getElementById('project');
      if(project.disabled == true){
        project.disabled=false;
        project.value = '';
      }else{
        project.disabled=true;
        project.value = 'Disabled';
      }      
	 });
}
//
//
//
// function check_fasta_inputs(){
//     all_good = true
//     
//     pname = document.getElementById('pname_input')
//     if(pname.value == ''){
//         all_good = false
//     }
//     file = document.getElementById('file_input')
//     if(file.value == ''){
//         all_good = false
//     }
//     unique = document.getElementsByName('unique_status')
//     if(unique[0].checked == false && unique[1].checked == false){
//         all_good = false
//     }
//     format = document.getElementsByName('fasta_format')
//     if(format[0].checked == false && format[1].checked == false){
//         all_good = false
//     }
//     dname = document.getElementById('dname_input')
//     if(format[0].checked==true && dname.value == ''){
//         all_good = false
//     }
//     if(format[0].checked==true){
//         dname.disabled = false
//         dname.placeholder = "Dataset(Sample) Name"
//     }else{
//         dname.disabled = true
//         dname.value = ''
//         dname.placeholder = "Disabled by default"
//     }
//     submit_btn = document.getElementById('submit_btn')
//     
//     //alert(all_good)
//     if(all_good){
//         submit_btn.disabled = false
//     }else{
//         submit_btn.disabled = true
//     }
//     
//     
// }
//
//
//
function process_upload_metadata_form(file_type) {
    document.getElementById('data_holder').style.display = 'block';
    document.getElementById('result_table').innerHTML = 'Loading'
    var file = document.getElementById('file_input').files[0];
    //alert(file == undefined)
    var pid = document.getElementById('pid_select').value
    if(file == undefined){
        alert('You must attach a file!')
        return;
    }
    //var args = {}
    //args.pid_select = pid
    //args.file = file
    //alert(pid)
    var formData = new FormData();
    formData.append('file', file);    
    formData.append("pid_select", pid);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", '/user_data/upload_metadata_fileAV', true);
    //xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    //xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 ) {
        
        //var data = JSON.parse(xmlhttp.response)
        //var data = JSON.parse(xmlhttp.response)
        var html = "<a href='/user_data/import_choices/metadata'>Delete and Start Over</a>" 
        var result = JSON.parse(xmlhttp.response)
        //alert(result.errors)
        html += result.html
        html += "<br>"
        if( result.errors == '1'){            
            html += "<b style='color:red;'>Not Validated:</b>"
            html += "&nbsp;&nbsp;Edit your CSV file and try again."
        }else{
            html += "<b style='color:green;'>Validated!!</b>"
            html += "&nbsp;&nbsp;Select one: [ <input type='radio' name='data_handling' value='replace'> Delete and Replace"
            html += "&nbsp;&nbsp;&nbsp;&nbsp;<input type='radio' name='data_handling' value='add'> Add to Existing ]"
            html += "&nbsp;&nbsp;&nbsp;&nbsp;<a class='button' href='' onclick=\"write_metadata('"+pid+"','"+result.metadata_dir+"','"+result.filename+"')\">Accept this data and write project metadata to database</a>"            
        }
        html += "<br><br>"
        //alert(data)
        // var html = "<table border='1' >"
//         
//         for(i in data){
//             html += "<tr>"
//             for(m in data[i]){
//                 html += "<td>"+data[i][m]+"</td>"
//             }
//             html += "</tr>"
//         }
//         html += "</table>"
        document.getElementById('result_table').innerHTML = html;
        
      }
    };

    xmlhttp.send(formData);
}
function process_upload_form(file_type) {
    
    var new_pname = ''
    var pid = ''
    var file = document.getElementById('file_input').files[0];
    if(file_type == 'metadata'){
        //pid = document.getElementById('pid_select').value
        //var url = "/user_data/upload_metadata_fileAV"
    }else{
        var url = "/user_data/upload_import_file"
        var project_name = document.getElementById('pname_input').value
        pattern=/([^a-zA-Z0-9\.]+)/gi
    
        new_pname = project_name.replace(pattern, '_')  // replace bad chars with underscore
        if(new_pname.length > 30){
            alert('Project name is too long (limit 30 characters)')
            return
        }
        if(new_pname.length < 3){
            alert('Project name is too short (minimum 3 characters)')
            return
        }
    }
    
    var formData = new FormData();
    formData.append('file', file);    
    formData.append('file_type', file_type);
    formData.append("project_name", new_pname);
    formData.append("project_id", pid);
    
    var xmlhttp = new XMLHttpRequest();
    
    
    
    xmlhttp.open("POST", url, true);
    //xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.upload.onprogress = function(e) {
      document.getElementById('bar_div').style.display = 'block'
      if (e.lengthComputable) {
        //console.log(e);
        var percentage = (e.loaded / e.total) * 100;
        console.log(percentage + "%");
        document.getElementById('bar').style.width = percentage + "%"
        document.getElementById('bar').innerHTML = percentage.toFixed(0) + "%"
        
        
      }
    };

    xmlhttp.onerror = function(e) {
      console.log('Error');
      console.log(e);
    };
    xmlhttp.onload = function() {
      console.log('this '+this.statusText);
      if(this.statusText == 'OK'){
        document.getElementById('bar').innerHTML = 'Finished Uploading'
      }
    };
    // xmlhttp.onreadystatechange = function() {
//         if (xmlhttp.readyState == 4 ) {
//             
//             //var resp = JSON.parse(xmlhttp.response)
//             var resp = xmlhttp.response
//             alert(resp)
//             
//         }
//       };
    xmlhttp.send(formData);
    
}
//
//
//
function write_metadata(pid, md_file_path, md_file_name){
    data_handling = document.getElementsByName('data_handling')
    var args = {}
    args.pid = pid
    args.metadata_dir  = md_file_path
    args.metadata_file = md_file_name
    //alert(pid)
    if(data_handling[0].checked == true){
        //alert('delete and replace')
        args.type = 'replace'
    }else if(data_handling[1].checked == true){
        //alert('add to existing')
        args.type = 'add'
    }else{
        alert("You must select either to 'replace' or 'add' the new metadata to the old (if present).")
        return
    }
    console.log('pid='+(args.pid).toString())
    var xmlhttp = new XMLHttpRequest();
    
    xmlhttp.open("POST", '/user_data/loadDB_from_metadata_fileAV', true);
    //xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 ) {
        var resp = xmlhttp.response
        alert('response '+resp)
      }
    }
    xmlhttp.send(JSON.stringify(args));
    
}




