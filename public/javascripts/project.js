
// viz_select_form_btn = document.getElementById('viz_select_form_btn') || null;
// if (viz_select_form_btn !== null) {
//   viz_select_form_btn.addEventListener('click', function () {
//       form = document.getElementById('viz_select_form_id');
//       pid = form.project_id.value;
//       project = form.project.value;
//       //alert(project)
//       load_selected_datasets('visuals', pid, project);
//       return;
//       //download_data('fasta', pid, project, download_type);
//   });
// }
// export_select_form_btn = document.getElementById('export_select_form_btn') || null;
// if (export_select_form_btn !== null) {
//   export_select_form_btn.addEventListener('click', function () {
//       form = document.getElementById('export_select_form_id');
//       pid = form.project_id.value;
//       project = form.project.value;
//             alert(project)
//       //download_data('fasta', pid, project, download_type);
//   });
// }

download_project_fasta_form_btn = document.getElementById('download_project_fasta_form_id') || null;
if (download_project_fasta_form_btn !== null) {
  download_project_fasta_form_btn.addEventListener('click', function () {
      form = document.getElementById('download_project_fasta_form_id');
      pid = form.project_id.value;
      project = form.project.value;
      download_type = form.download_type.value;      
      download_data('fasta', pid, project, download_type, '');
  });
}
download_project_metadata_form_btn1 = document.getElementById('download_project_metadata_form_btn1') || null;
if (download_project_metadata_form_btn1 !== null) {
  download_project_metadata_form_btn1.addEventListener('click', function () {
      form = document.getElementById('download_project_metadata_form1');
      pid = form.project_id.value;
      orientation = form.sample_orientation.value;
      project = form.project.value;
      download_type = form.download_type.value;   
      download_data('metadata', pid, project, download_type, orientation);
  });
}
download_project_metadata_form_btn2 = document.getElementById('download_project_metadata_form_btn2') || null;
if (download_project_metadata_form_btn2 !== null) {
  download_project_metadata_form_btn2.addEventListener('click', function () {
      form = document.getElementById('download_project_metadata_form2');
      pid = form.project_id.value;
      orientation = form.sample_orientation.value;
      project = form.project.value;
      download_type = form.download_type.value;    
      download_data('metadata', pid, project, download_type, orientation);
  });
}
//
// SAVE DATASET LIST
//

// TODO this is same code as in view_selection.js
function download_data(type, pid, project, download_type, orientation) {
    var html = '';
    var args =  "pid="+pid;
    args += "&project="+project;
    args += "&download_type="+download_type;
    
    var xmlhttp = new XMLHttpRequest(); 
    if(type == 'metadata'){
      args += "&orientation="+orientation
      target = '/user_data/download_selected_metadata';      
    } else{
      target = '/user_data/download_selected_seqs'
    }
    xmlhttp.open("POST", target, true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 ) {
         var filename = xmlhttp.responseText; 
         html += "<div class='pull-right'>Your file is being compiled.<br>The filename is: "+filename;
         html += "<br>When ready your file can be downloaded from the <a href='/user_data/file_retrieval'>file retrieval page.</a></div>"
         document.getElementById('download_confirm_id').innerHTML = html;
      }
    };
    xmlhttp.send(args);   
}

// function download_dco_metadata(file){
//     //alert('in download_dco_metadata '+file )
//     var xmlhttp = new XMLHttpRequest(); 
//     var args = {'file':file}
//     xmlhttp.open("POST", '/projects/download_dco_metadata_file', true);
//     xmlhttp.setRequestHeader("Content-type","application/json");
//     xmlhttp.onreadystatechange = function() {
//       if (xmlhttp.readyState == 4 ) {
//         //  var filename = xmlhttp.responseText; 
// //          html += "<div class='pull-right'>Your file is being compiled.<br>The filename is: "+filename;
// //          html += "<br>When ready your file can be downloaded from the <a href='/user_data/file_retrieval'>file retrieval page.</a></div>"
// //          document.getElementById('download_confirm_id').innerHTML = html;
//       }
//     };
//     xmlhttp.send(JSON.stringify(args));   
// }
// var download_data = function(type)
// {
	
// function load_selected_datasets(page, pid, project) {
//     var html = '';
//     var args =  "pid="+pid;
//     args += "&project="+project;
//     //alert(args)    
//     var xmlhttp = new XMLHttpRequest(); 
//     if(page == 'visuals'){
//       target = '/visuals/visuals_index';      
//     } else{
//       target = '/user_data/export_data'
//     }
//     xmlhttp.open("POST", target, false);
//     xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
//     // xmlhttp.onreadystatechange = function() {
      
//     // };
//     xmlhttp.send(args);  
//     return; 
// }	


// 	if(type == 'fasta'){
// 		form = document.getElementById('download_project_fasta_form_id');
// 		el = document.getElementById('download_fasta_response');		
// 	}else if(type == 'metadata'){
// 		form = document.getElementById('download_project_metadata_form_id');
// 		el = document.getElementById('download_metadata_response');		
// 	}
	
// 	form.submit();
// 	el.innerHTML = 'Gathering Data -- you will recieve and email when ready.'
	    
 	
// }