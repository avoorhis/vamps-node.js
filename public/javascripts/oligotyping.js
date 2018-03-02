
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
  //alert(tax_obj)
  var xmlhttp = new XMLHttpRequest();
  args = {'tax_obj':tax_obj}
  document.getElementById("oligo_genus_err_msg").innerHTML = '';
  xmlhttp.open("POST", "/oligotyping/project_list2", true);
  xmlhttp.setRequestHeader("Content-type","application/json");
  xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var response = xmlhttp.responseText;
          //alert(response)
          // try{
//             var tmp = JSON.parse(response);
//           }catch(e){
//           
//           }

          //alert(tmp['res'])
          //document.getElementById("oligo_genus_err_msg").style.visibility = 'visible';
          //document.getElementById("oligo_genus_err_msg").innerHTML = 'No Data';
        }
  }
  xmlhttp.send(JSON.stringify(args));
}


function get_oligotype_seqs2(){

	var tax_string = document.getElementById("livesearch_result_div").value
    var tax_obj = document.getElementById("hidden_item").value;
    document.getElementById("oligo_genus_err_msg").style.visibility = 'visible';
    document.getElementById("oligo_genus_err_msg").innerHTML = 'no';
    //var xmlhttp = new XMLHttpRequest();
    //var args = 'tax_string='+tax_string
    //args += '&tax_obj='+tax_obj

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
		//alert('good',resp)
		var xmlhttp = new XMLHttpRequest();
	  xmlhttp.open("GET", "/oligotyping/delete/" + code, true);
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var response = xmlhttp.responseText;
      // if(response=='OK')
      document.getElementById(code).style.display = 'none';
    }
	  xmlhttp.send();
	}else{
		return
	}

}
function run_oligotyping(btn, code){
	//alert('help')

	var form = document.getElementById("oligotyping_form_id")
	document.getElementById("html_link_info").innerHTML = 'Status: Running'
	//document.getElementById("html_link").disabled = true
	var html_dir = "/oligotyping/projects/"+form.elements['username'].value+'_'+'OLIGOTYPING_'+code
	args = 'code='+code
	args += '&family='+form.elements['family'].value
	args += '&genus='+form.elements['genus'].value
	args += '&directory='+form.elements['directory'].value
	args += '&MIN_ACTUAL_ABUNDANCE='+form.elements['MIN_ACTUAL_ABUNDANCE'].value
	args += '&MIN_SUBSTANTIVE_ABUNDANCE='+form.elements['MIN_SUBSTANTIVE_ABUNDANCE'].value
	args += '&MIN_NUMBER_OF_SAMPLES='+form.elements['MIN_NUMBER_OF_SAMPLES'].value
 	args += '&MIN_PERCENT_ABUNDANCE='+form.elements['MIN_PERCENT_ABUNDANCE'].value

	if(btn =='rerun'){
		var c_el = document.getElementById("largeC")
		//document.getElementById("html_link_btn").disabled = true
		args += '&SELECTED_COMPONENTS='+form.elements['SELECTED_COMPONENTS'].value
		var oligo_text = "To re-run:<br>Enter Selected Components \
												<br>(a comma separated list of base locations). \
												<br>For help choosing use either the<br>entropy graph or the Oligotyping HTML Page. \
												<br><input type='button' id=''  class='btn btn-xs btn-primary' value='re-Run Oligo' onclick=\"run_oligotyping('rerun','"+code+"')\" /> \
												( <a href='/oligotyping/rewind/"+ code + "/oligo' class='btn btn-xs btn-link' >Re-wind to here</a> )"
	}else{
		var c_el = document.getElementById("smallc")
		args += '&NUMBER_OF_AUTO_COMPONENTS='+form.elements['NUMBER_OF_AUTO_COMPONENTS'].value
		var oligo_text = "Enter values for the command line parameters shown to the left \
												<br>or leave the defaults. The '-c' value should be<br>changed to be less than or equal to the number<br> of tall peaks from the entropy graph. \
												<br><input type='button' id=''  class='btn btn-xs btn-primary' value='Run Oligo' onclick=\"run_oligotyping('run','"+code+"')\" />"

	}

	if(c_el.value == ''){
		alert('Fill in values for all the parameters.')
		return
	}
	//alert(args)
	form.submit()
 //window.open('file:///User/avoorhis/programming/vamps-node.js/views/tmp/projects/andy_OLIGOTYPING_1474547262567/HTML-OUTPUT/index.html')
	// var xmlhttp = new XMLHttpRequest();
 //  xmlhttp.open("POST", '/oligotyping/oligo/'+code, true);
 //  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
 //  xmlhttp.setRequestHeader("data-type","html");

 //  xmlhttp.onreadystatechange = function() {
 //    if (xmlhttp.readyState == 4 ) {

 //        //var response = xmlhttp.responseText;
 //        //alert(response)
 //        var rando = getRandomInt(10000,99999)
 //        var link = html_dir+"/HTML-OUTPUT/index.html?rando="+rando.toString()
 //        var html = "** <a href='"+link+"' target='_blank'>Open HTML</a> **"
 //        document.getElementById("html_link_div").innerHTML = html
 //        document.getElementById("html_link_info").innerHTML = 'READY'
 //        document.getElementById("oligo_text").innerHTML = oligo_text
 //    }
 //  };
 //  xmlhttp.send(args);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
