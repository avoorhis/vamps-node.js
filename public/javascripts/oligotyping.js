
//
//  SHOW  RESULTS for Taxonomy Search
//
function showOligotypingTaxResult(str) {

//alert('otr')
  if (str.length==0) {
    document.getElementById("livesearch_taxonomy").innerHTML="";
    document.getElementById("livesearch_taxonomy").style.border="0px";
    document.getElementById("livesearch_taxonomy").style.height="0";
    document.getElementById("livesearch_result_div").value = ''
    document.getElementById("livesearch_tax_dropdown").style.visibility='hidden';
    return;
  }else{
    document.getElementById("livesearch_tax_dropdown").style.visibility='visible';
  }
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
      document.getElementById("livesearch_taxonomy").innerHTML=xmlhttp.responseText;
      document.getElementById("livesearch_taxonomy").style.border="1px solid #A5ACB2";
      document.getElementById("livesearch_taxonomy").style.height="150px";
      document.getElementById("livesearch_taxonomy").style.width="500px";
      document.getElementById("livesearch_taxonomy").style.overflow="auto";
    }
  }
  xmlhttp.open("GET","/oligotyping/livesearch_taxonomy/"+str, true);
  xmlhttp.send();
}
function get_tax_str(taxon,rank){

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "/oligotyping/livesearch_taxonomy/" + rank+'/'+taxon, true);
  xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var response = xmlhttp.responseText;
          var tmp = JSON.parse(response);

          document.getElementById("livesearch_result_div").value = tmp.full_string;
          //document.getElementById("oligo_genus_err_msg").innerHTML = '';
          document.getElementById("hidden_item").value = response;
          document.getElementById("fasta_start_btn").disabled = false;
          document.getElementById("fasta_start_btn").style.background = '#3CBC3C';
        }
  }
  xmlhttp.send();
}
function get_oligotype_seqs(){
  var tax_obj = document.getElementById("hidden_item").value;
  // var xmlhttp = new XMLHttpRequest();
//   args = {'tax_obj':tax_obj}
//   document.getElementById("oligo_genus_err_msg").innerHTML = '';
//   xmlhttp.open("POST", "/oligotyping/project_list2", true);
//   xmlhttp.setRequestHeader("Content-type","application/json");
//   xmlhttp.onreadystatechange = function() {
//         if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//           var response = xmlhttp.responseText;
//           alert(response)
//           
//         }
//   }
//   xmlhttp.send(JSON.stringify(args));
}

// function search_for_sequences(){
//     var form = document.getElementById("export_data_form")
//     var tax_obj = form.elements['tax_obj'].value
//     // /oligotyping/project_list2
//     var args = {'tax_obj':tax_obj}
//     args.tax_string = form.elements['tax_string'].value
//     var xmlhttp = new XMLHttpRequest();
//     xmlhttp.open("POST", "/oligotyping/project_list2", true);
//     xmlhttp.setRequestHeader("Content-type","application/json");
//     xmlhttp.onreadystatechange = function() {
//         if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//           //alert(xmlhttp.responseText)
//           //console.log('home')
//           try{
//             var response = JSON.parse(xmlhttp.responseText);
//             alert(response.msg)
//           }catch(e){
//             console.log('in try:err')
//             var xmlhttp2 = new XMLHttpRequest();
//             xmlhttp2.onreadystatechange=function() {
//                 if (xmlhttp2.readyState==4 && xmlhttp2.status==200) {
//                         var response = xmlhttp2.responseText;
//                         console.log(response)
//                 }
//             }
//             xmlhttp2.open("GET", "/oligotyping/project_list", true);
//             xmlhttp2.send()
//           }
//                 
//         }
//     }
//     xmlhttp.send(JSON.stringify(args));
// }
function get_oligotype_seqs2(){

	var tax_string = document.getElementById("livesearch_result_div").value
    var tax_obj = document.getElementById("hidden_item").value;
    document.getElementById("oligo_genus_err_msg").style.visibility = 'visible';
    document.getElementById("oligo_genus_err_msg").innerHTML = 'no';
    

  	var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"/oligotyping/project_list");

  	var input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'tax_obj';
    input.value = tax_obj;
    f.appendChild(input);


    var submit = document.createElement('input');
    submit.setAttribute('type', "submit");
    f.appendChild(submit);
    document.body.appendChild(f);

    f.submit();
    document.body.removeChild(f);

}
//
function delete_project(code){
	var resp = confirm('are you sure?')
	if(resp){		
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                    var response = xmlhttp.responseText;
                    document.getElementById(code).style.display = 'none';
            }
        }
        xmlhttp.open("GET", "/oligotyping/delete/" + code, true);
	    xmlhttp.send();
    }else{
		return
	}

}
function view_entropy(code){
    var args = {'code':code}
    //console.log(args)
    var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "/oligotyping/view_pdf", true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                var response = xmlhttp.responseText;
                alert(response)
                //document.getElementById('pdf_link').innerHTML = response
                window.open(response)
                //document.getElementById('html_link_div').innerHTML = ''
        }
    }
    xmlhttp.send(JSON.stringify(args));
}
function run_oligotyping(btn, code){
	

	var form = document.getElementById("oligotyping_form_id")
	document.getElementById("html_link_div").innerHTML = 'Status: Running'
	//document.getElementById("html_link_div").disabled = true
	var html_dir = "/oligotyping/projects/"+form.elements['username'].value+'_'+'OLIGOTYPING_'+code
	var args = {'code':code}
	args.family = form.elements['family'].value
	args.genus = form.elements['genus'].value
	args.directory = form.elements['directory'].value
	args.MIN_ACTUAL_ABUNDANCE = form.elements['MIN_ACTUAL_ABUNDANCE'].value
	args.MIN_SUBSTANTIVE_ABUNDANCE = form.elements['MIN_SUBSTANTIVE_ABUNDANCE'].value
	args.MIN_NUMBER_OF_SAMPLES = form.elements['MIN_NUMBER_OF_SAMPLES'].value
 	args.MIN_PERCENT_ABUNDANCE = form.elements['MIN_PERCENT_ABUNDANCE'].value
    //alert(args.MIN_PERCENT_ABUNDANCE)
	if(btn =='rerun'){
		var c_el = document.getElementById("largeC")
		//document.getElementById("html_link_div").disabled = true
		args.SELECTED_COMPONENTS = form.elements['SELECTED_COMPONENTS'].value
		var oligo_text = "To re-run:<br>Enter Selected Components \
												<br>(a comma separated list of base locations). \
												<br>For help choosing use either the<br>entropy graph or the Oligotyping HTML Page. \
												<br><input type='button' id=''  class='btn btn-xs btn-primary' value='re-Run Oligo' onclick=\"run_oligotyping('rerun','"+code+"')\" /> \
												( <a href='/oligotyping/rewind/"+ code + "/oligo' class='btn btn-xs btn-link' >Re-wind to here</a> )"
	}else{
		var c_el = document.getElementById("smallc")
		args.NUMBER_OF_AUTO_COMPONENTS = form.elements['NUMBER_OF_AUTO_COMPONENTS'].value
		var oligo_text = "Enter values for the command line parameters shown to the left \
												<br>or leave the defaults. The '-c' value should be<br>changed to be less than or equal to the number<br> of tall peaks from the entropy graph. \
												<br><input type='button' id=''  class='btn btn-xs btn-primary' value='Run Oligo' onclick=\"run_oligotyping('run','"+code+"')\" />"

	}

	if(c_el.value == ''){
		alert('Fill in values for all the parameters.')
		return
	}
	//alert(args)
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "/oligotyping/oligo/" + code, true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                var response = xmlhttp.responseText;
                var html = "** <a href='"+response+"' target='_blank'>Open HTML</a> **"
                //alert(response)
                document.getElementById('html_link_div').innerHTML = html
                
        }
    }
    xmlhttp.send(JSON.stringify(args));
	//form.submit()
 
}
function open_html(code){
    //alert(code)
    //var user_dir_path = 'file://groups/vampsweb/vamps_node_data/user_data/avoorhis/oligotyping-1538593525362'
    //var olig_dir = 'oligotyping-'+req.body.oligo_code
    //var data_repo_path = path.join(user_dir_path, olig_dir);
    //var html = user_dir_path+'/OLIGOTYPE/HTML-OUTPUT/index.html'
    var html = '/user_projects/avoorhis_oligotyping-'+code+'/index.html'
    console.log('html')
    console.log(html)
    window.open(html)
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
