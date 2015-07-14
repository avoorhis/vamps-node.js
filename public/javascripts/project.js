download_project_fasta_form_id
download_project_metadata_form_id



download_project_fasta_form_btn = document.getElementById('download_project_fasta_form_btn');
if (typeof download_project_fasta_form_btn !=="undefined") {
  download_project_fasta_form_btn.addEventListener('click', function () {
      form = document.getElementById('download_project_fasta_form_id');
      pid = form.project_id.value;
      project = form.project.value;
      download_type = form.download_type.value;      
      download_data('fasta', pid, project, download_type);
  });
}
download_project_metadata_form_btn = document.getElementById('download_project_metadata_form_btn');
if (typeof download_project_metadata_form_btn !=="undefined") {
  download_project_metadata_form_btn.addEventListener('click', function () {
      form = document.getElementById('download_project_metadata_form_id');
      pid = form.project_id.value;
      project = form.project.value;
      download_type = form.download_type.value;    
      download_data('metadata', pid, project, download_type);
  });
}

//
// SAVE DATASET LIST
//

// TODO this is same code as in view_selection.js
function download_data(type, pid, project, download_type) {
    var html = '';
    var args =  "pid="+pid;
    args += "&project="+project;
    args += "&download_type="+download_type;
    
    var xmlhttp = new XMLHttpRequest(); 
    if(type == 'metadata'){
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
// var download_data = function(type)
// {
	
	


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