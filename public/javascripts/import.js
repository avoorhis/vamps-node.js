

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

function check_fasta_inputs()
{
    all_good = true
    
    pname = document.getElementById('pname_input')
    if(pname.value == ''){
        all_good = false
    }
    file = document.getElementById('file_input')
    if(file.value == ''){
        all_good = false
    }
    unique = document.getElementsByName('unique_status')
    if(unique[0].checked == false && unique[1].checked == false){
        all_good = false
    }
    format = document.getElementsByName('fasta_format')
    if(format[0].checked == false && format[1].checked == false){
        all_good = false
    }
    dname = document.getElementById('dname_input')
    if(format[0].checked==true && dname.value == ''){
        all_good = false
    }
    if(format[0].checked==true){
        dname.disabled = false
        dname.placeholder = "Dataset(Sample) Name"
    }else{
        dname.disabled = true
        dname.value = ''
        dname.placeholder = "Disabled by default"
    }
    submit_btn = document.getElementById('submit_btn')
    
    //alert(all_good)
    if(all_good){
        submit_btn.disabled = false
    }else{
        submit_btn.disabled = true
    }
    
    
}

