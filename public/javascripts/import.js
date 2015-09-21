

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






function create_viz(visual, ts) {
   
   
}

