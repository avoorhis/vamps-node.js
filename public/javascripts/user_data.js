

$( document ).ready(function() {

    //show_dataset_tree = false; // true/false on intial load show projects only
    //load_projects_only_tree()

    //initialize_dhtmlx_project_tree()
    //clear_filters()
    
    
    //document.getElementById('projects_select_div').style.display = 'none'
    //document.getElementById('projects_only_select_div').style.display = 'inline'
    //initialize_form()


});



var view_saved_datasets_btn = document.getElementById('view_saved_datasets_btn') || null;
if (view_saved_datasets_btn !== null) {
	view_saved_datasets_btn.addEventListener('click', function () {
  	  window.location='../visuals/saved_datasets';
	});
}

var validate_meta_submit_btn = document.getElementById('validate_meta_submit_btn_id') || null;
if (validate_meta_submit_btn !== null) {
	validate_meta_submit_btn.addEventListener('click', function () {
  	  //alert('validate meta')
  	  file = document.getElementById('upload_file_meta');
  	  if(file.value == ''){
  	  	alert('You must enter a file');
  	  	return;
  	  }
  	  form = document.getElementById('validate_meta_form');
  	  //alert(form)
  	  form.submit();
	});
}

var validate_fasta_submit_btn = document.getElementById('validate_fasta_submit_btn_id') || null;
if (validate_fasta_submit_btn !== null) {
	validate_fasta_submit_btn.addEventListener('click', function () {
  	  //alert('validate fasta')
  	  file = document.getElementById('upload_file_fasta');
  	  if(file.value == ''){
  	  	alert('You must enter a file');
  	  	return
  	  }
  	  form = document.getElementById('validate_fasta_form');
  	  form.submit();
	});
}
function show_go_btn(project, classifier, ref_db){
    //alert(classifier)
    //alert(item)
    var html = "<a href='/user_data/start_assignment/"+project+"/"+classifier+"/"+ref_db+"' class='btn btn-xs btn-success' name='assignment_choice' >Start</a>"
    document.getElementById('start_btn_id').innerHTML = html;
}
//
//
//
function get_ref_dbs(project, classifier){
    var html = 'Choose Ref_DB: '
    //alert(choices_local[item].ref_db)
    html += "<select onchange=\"show_go_btn('"+project+"','"+classifier+"',this.value)\">"
    html += '<option>choose</option>'
    for(x in choices_local[classifier].ref_db){
    html += '<option>'+choices_local[classifier].ref_db[x]+'</option>'
    }
    html += '</select>'
    document.getElementById('refdb_id').innerHTML = html;
}
function test_upload(user){
    //alert('hello')
    var file = document.getElementById('myFile').files[0];
    //alert(file.name)
    // name, size
    
    var formData = new FormData();
    
    //var file = $('#myFile').files[0];
    
    formData.append('myFile', file);
    formData.append('originalFileName', file.name);
    formData.append("username", user);
    var xmlhttp = new XMLHttpRequest();
    
    xmlhttp.open("POST", "/user_data/test_upload", true);
    
    // xmlhttp.onreadystatechange = function() {
//         if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//           var response = xmlhttp.responseText;
//           //alert(response)
//         }
//     }
    
    xmlhttp.upload.onprogress = function(e) {
      document.getElementById('bar_div').style.visibility = 'visible'
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
    xmlhttp.send(formData);

}