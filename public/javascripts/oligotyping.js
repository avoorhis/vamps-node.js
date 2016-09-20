
//
//  SHOW  RESULTS for Taxonomy Search
//
function showOligotypingTaxResult(str) {
  
  
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
          document.getElementById("oligo_genus_err_msg").innerHTML = '';
          document.getElementById("hidden_item").value = response;
          document.getElementById("fasta_start_btn").disabled = false;
          document.getElementById("fasta_start_btn").style.background = '#3CBC3C';
        }
  }
  xmlhttp.send();
}

function get_oligotype_seqs(){
		
		var tax_string = document.getElementById("livesearch_result_div").value
    var tax_obj = document.getElementById("hidden_item").value;
    
    //var xmlhttp = new XMLHttpRequest();
    //var args = 'tax_string='+tax_string
    //args += '&tax_obj='+tax_obj
  	
  	var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"/oligotyping/status");

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