

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




function choose_fasta_style(style)
{
    if(style == 'single'){
        document.getElementById('dataset_input').style.display = 'block'
    }else{
        document.getElementById('dataset_input').style.display = 'none'
    }   
}

// function import_submit(page) {
//   var form = document.getElementById('import_form_id');
//   fileNames = document.getElementsByName('upload_files');
//   var metafile = fileNames[1];
//   //alert(metafile[0].type)
//   for(n in metafile){
//     alert(n +' '+metafile[n])
//   }
//   args = 'id=3'
//   var xmlhttp = new XMLHttpRequest();  
//   xmlhttp.open("POST", '../validate_metadata2', true);
//   xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
//   xmlhttp.setRequestHeader("data-type","html");
//   showDots='';
  
//   xmlhttp.onreadystatechange = function() {        
//     if (xmlhttp.readyState == 4 ) {
        
//         var response = xmlhttp.responseText;            
        
//     }
//   };
//   xmlhttp.send(args);
   
// }

