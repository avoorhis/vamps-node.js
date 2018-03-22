

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
function process_upload_form(file_type) {
    
    var file = document.getElementById('file_input').files[0];
    var project_name = document.getElementById('pname_input').value
    var formData = new FormData();
    formData.append('file', file);    
    formData.append('file_type', file_type);
    formData.append("project_name", project_name);
    var xmlhttp = new XMLHttpRequest();
    
    var url = "/user_data/upload_import_file"
    
    xmlhttp.open("POST", url, true);
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
    xmlhttp.send(formData);
    
}





