

$( document ).ready(function() {

    //show_dataset_tree = false; // true/false on intial load show projects only
    //load_projects_only_tree()

    initialize_dhtmlx_project_tree()
    clear_filters()
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

// function change_tree(tree){
//   //document.getElementById('projects_select_div').innerHTML=''
//   if(tree == 'projects'){
//     show_dataset_tree = false;
//     document.getElementById('projects_select_div').style.display = 'none'
//     document.getElementById('projects_only_select_div').style.display = 'inline'
//     load_projects_only_tree()

//   }else{
//     show_dataset_tree = true;
//     document.getElementById('projects_select_div').style.display = 'inline'
//     document.getElementById('projects_only_select_div').style.display = 'none'
//     clear_filters()
//   }
//   //initialize_form()
// }