

$( document ).ready(function() {

    
    load_dhtmlx_project_tree()

    clear_filters()

    if(Object.keys(datasets_local).length > 0){
      alert('datasets to load - in visuals_index.js')
      // $('input.project_toggle').each(function(){
      //   //alert($(this).prop('value'))
      //   var checkbox = $(this);
      //   var project = checkbox.prop('value')
      //   //alert(project)
      //   var datasets_per_pr = $(this.parentNode.parentNode).find('.datasets_per_pr');
      //   if( datasets_local.hasOwnProperty(project) ){
      //     //input.prop('checked', true)
      //     if (datasets_per_pr.is(":hidden")) {
            
      //       datasets_per_pr.show();
      //       minus_img(checkbox.siblings('a').find('img'));
      //     }
      //     check_selected_datasets(checkbox, datasets_per_pr, project, datasets_local[project]);
      //   }
      // });
    }
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

