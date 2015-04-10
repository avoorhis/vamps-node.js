download_project_fasta_form_id
download_project_metadata_form_id

download_project_metadata_form_btn = document.getElementById('download_project_metadata_form_btn');
if (typeof download_project_metadata_form_btn !=="undefined") {
  download_project_metadata_form_btn.addEventListener('click', function () {
      create_download_file('metadata');
  });
}

download_project_fasta_form_btn = document.getElementById('download_project_fasta_form_btn');
if (typeof download_project_fasta_form_btn !=="undefined") {
  download_project_fasta_form_btn.addEventListener('click', function () {
      create_download_file('fasta');
  });
}


//
// SAVE DATASET LIST
//
var create_download_file = function(type)
{
	
	if(type == 'fasta'){
		form = document.getElementById('download_project_fasta_form_id');
		el = document.getElementById('download_fasta_response');		
	}else if(type == 'metadata'){
		form = document.getElementById('download_project_metadata_form_id');
		el = document.getElementById('download_metadata_response');		
	}
	
	form.submit();
	el.innerHTML = 'Gathering Data -- you will recieve and email when ready.'
	    
 	
}