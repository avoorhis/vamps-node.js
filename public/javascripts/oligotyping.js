
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
  xmlhttp.open("GET","livesearch_taxonomy/"+str,true);
  xmlhttp.send();
}
function get_tax_str(taxon,rank){
    
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "livesearch_taxonomy/" + rank+'/'+taxon, true);
  xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var response = xmlhttp.responseText;
          var tmp = JSON.parse(response);
          //alert(response)
          document.getElementById("livesearch_result_div").value = tmp.full_string;
          document.getElementById("hidden_item").value = response;
          
        }
  }
  xmlhttp.send();
}

function get_oligotype_seqs(){
		
		var tax_string = document.getElementById("livesearch_result_div").value
    var tax_obj = document.getElementById("hidden_item").value;
    
    var xmlhttp = new XMLHttpRequest();
    var args = 'tax_string='+tax_string
    args += '&tax_obj='+tax_obj
  	xmlhttp.open("POST", "oligotyping_fasta", true);
  	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  	xmlhttp.onreadystatechange = function() {

  			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var response = xmlhttp.responseText;
          
          if(response == 'ERROR'){
          	alert('No Data Found')
          }else{
          	res = JSON.parse(response)
          	alert(res.filename)
          	window.open('','_blank',"width=400,height=300")
          }
          
        }
  	}
  	xmlhttp.send(args);


}