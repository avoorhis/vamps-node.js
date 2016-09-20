// search.js
// $('.selectpicker').selectpicker();
// $(document).ready(function(){
//     $('a.back').click(function(){
//         parent.history.back();
//         return false;
//     });
// });
// document.getElementById("livesearch_result_div").value = '';
// document.getElementById("create_fasta_hidden_id").value = ''
// document.getElementById("find_datasets_hidden_id").value = ''
// document.getElementById("find_datasets_btn").disabled=true;
// document.getElementById("create_fasta_btn").disabled=true;

var metadata_search_range_div1 = document.getElementById('metadata_search_range_div1') || null;
var metadata_search_field1 = document.getElementById('field1_metadata_search') || null;
var metadata_search_range_div2 = document.getElementById('metadata_search_range_div2') || null;
var metadata_search_field2 = document.getElementById('field2_metadata_search') || null;
var metadata_search_range_div3 = document.getElementById('metadata_search_range_div3') || null;
var metadata_search_field3 = document.getElementById('field3_metadata_search') || null;
var search_metadata_activate_btn2 = document.getElementById('search_metadata_activate_btn2') || null;
var search_metadata_activate_btn3 = document.getElementById('search_metadata_activate_btn3') || null;
var search_metadata_btn = document.getElementById('search_metadata_btn') || null;

if (search_metadata_btn !== null) {
  search_metadata_btn.addEventListener('click', function () {
	  var form = document.getElementById('metadata_search_form');
	  var search1_comparison = document.getElementById('search1_comparison');
	  //alert(search1_comparison.value);
	  
	  form.submit();
    
  });
}

if (search_metadata_activate_btn2 !== null) {
  search_metadata_activate_btn2.addEventListener('click', function () {
    
	if(metadata_search_field2.disabled === true){
      
	  metadata_search_field2.disabled = false;
    }else{
      metadata_search_field2.disabled = true;
    }
    
  });
}
if (search_metadata_activate_btn3 !== null) {
  search_metadata_activate_btn3.addEventListener('click', function () {
    if(metadata_search_field3.disabled === true){
      metadata_search_field3.disabled = false;
    }else{
      metadata_search_field3.disabled = true;
    }
  });
}



var selection_choices = ['equal_to','less_than','greater_than','not_equal_to','between_range','outside_range'];

if (metadata_search_field1 !== null) {
  metadata_search_field1.addEventListener('change', function () {
      var item = metadata_search_field1.value;
      if(item == 'NONE'){
        metadata_search_range_div1.style.display    = "none";
      }else{
        var html = "";
        if(Array.isArray(mi_local[item])){
          //html += "<br>";
          for(var i in mi_local[item]){
            val = mi_local[item][i];
            name = 'search1_data_'+item+'[]';
            html += " <input type='checkbox' id='"+val+"' name='"+name+"' value='"+val+"' >&nbsp;"+val;
            //html += " <input type='checkbox' id='"+val+"' name='data[]' value='"+val+"' onclick=\"save_value1(this.value,'"+item+"')\" >"+val;
          }
        }else{
          var min = mi_local[item].min;
          var max = mi_local[item].max;
          var range = max - min;
          if(range > 1){
            range = Math.ceil(max) - Math.floor(min);
          }
          
          html += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Values Min: "+min+" Max: "+max;
          //html += " -->> Select range to search: "+range
          
          html += "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-->> Select Comparison:";
          
          html += " <select id='search1_comparison' name='search1_comparison' onchange=\"change_comparison(this.value,'1')\" >";
          for (var y in selection_choices) {
			       html += "      <option class='' value='"+selection_choices[y]+"'>"+selection_choices[y]+"</option>";
          } 
          html += "</select> ";
          html += "<div id='input1_comparison'> ";
          html += " Enter: <input type='text' id='' name='search1_single-comparison-value' value='' maxlength='10' size='10' > (numeric only)";
          html += "</div>";

        }
        //html += "<br><input type='button' value='Search Datasets' >"
        metadata_search_range_div1.innerHTML        = html;
        metadata_search_range_div1.style.display    = "block";
        metadata_search_range_div1.style.background = "#C0C0C0";
        metadata_search_range_div1.style.padding    = "3px";
        metadata_search_range_div1.style.width      = "95%";
        document.getElementById('search_metadata_btn').disabled    = false;
      }
  });
}

//
if (metadata_search_field2 !== null) {
  metadata_search_field2.addEventListener('change', function () {
      var item = metadata_search_field2.value;
      if(item == 'NONE'){
        metadata_search_range_div2.style.display    = "none";
      }else{
        var html = "";
        if(Array.isArray(mi_local[item])){
          //html += "<br>";
          for (var i in mi_local[item]){
            val = mi_local[item][i];
            name = 'search2_data_'+item+'[]';
            html += " <input type='checkbox' id='"+val+"' name='"+name+"' value='"+val+"' >&nbsp;"+val;
          }
        }else{
          var min = mi_local[item].min;
          var max = mi_local[item].max;
          var range = max - min;
          if(range > 1){
            range = Math.ceil(max) - Math.floor(min);
          }
          
          html += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Values Min: "+min+" Max: "+max;
          //html += " -->> Select range to search: "+range
          
          html += "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-->> Select Comparison:";
          
          html += " <select id='search2_comparison' name='search2_comparison' onchange=\"change_comparison(this.value,'2')\" >";
          for(var x in selection_choices) {
            html += "      <option class='' value='"+selection_choices[x]+"'>"+selection_choices[x]+"</option>";
          } 
          html += "</select> ";
          html += "<div id='input2_comparison'> ";
          html += " Enter: <input type='text' id='' name='search2_single-comparison-value' value='' maxlength='10' size='10' > (numeric only)";
          html += "</div>";

        }
        //html += "<br><input type='button' value='Search Datasets' >"
        metadata_search_range_div2.innerHTML        = html;
        metadata_search_range_div2.style.display    = "block";
        metadata_search_range_div2.style.background = "#C0C0C0";
        metadata_search_range_div2.style.padding    = "3px";
        metadata_search_range_div2.style.width      = "95%";
        document.getElementById('search_metadata_btn').disabled    = false;
      }
  });
}
//
if (metadata_search_field3 !== null) {
  metadata_search_field3.addEventListener('change', function () {
      var item = metadata_search_field3.value;
      if(item == 'NONE'){
        metadata_search_range_div3.style.display    = "none";
      }else{
        var html = "";
        if(Array.isArray(mi_local[item])){
          //html += "<br>";
          for (var i in mi_local[item]){
            val = mi_local[item][i];
            name = 'search3_data_'+item+'[]';
            html += " <input type='checkbox' id='"+val+"' name='"+name+"' value='"+val+"' >&nbsp;"+val;
          }
        }else{
          var min = mi_local[item].min;
          var max = mi_local[item].max;
          var range = max - min;
          if(range > 1){
            range = Math.ceil(max) - Math.floor(min);
          }
          
          html += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Values Min: "+min+" Max: "+max;
          //html += " -->> Select range to search: "+range
          
          html += "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-->> Select Comparison:";
          
          html += " <select id='search3_comparison' name='search3_comparison' onchange=\"change_comparison(this.value,'3')\" >";
          for (var z in selection_choices) {
            html += "      <option class='' value='"+selection_choices[z]+"'>"+selection_choices[z]+"</option>";
          } 
          html += "</select> ";
          html += "<div id='input3_comparison'> ";
          html += " Enter: <input type='text' id='' name='search3_single-comparison-value' value='' maxlength='10' size='10' > (numeric only)";
          html += "</div>";
        }
        //html += "<br><input type='button' value='Search Datasets' >"
        metadata_search_range_div3.innerHTML        = html;
        metadata_search_range_div3.style.display    = "block";
        metadata_search_range_div3.style.background = "#C0C0C0";
        metadata_search_range_div3.style.padding    = "3px";
        metadata_search_range_div3.style.width      = "95%";
        document.getElementById('search_metadata_btn').disabled    = false;
      }
  });
}
//
//
//
function change_comparison(comparison, item){
    var comparison_input;  
    var minval;
    var maxval;
    var oneval;
    
  if(item==1){
    comparison_input = document.getElementById('input1_comparison');
    minval = 'search1_min-comparison-value';
    maxval = 'search1_max-comparison-value';
    oneval = 'search1_single-comparison-value';
  }else if(item==2){
    comparison_input = document.getElementById('input2_comparison');
    minval = 'search2_min-comparison-value';
    maxval = 'search2_max-comparison-value';
    oneval = 'search2_single-comparison-value';
  }else if(item==3){
    comparison_input = document.getElementById('input3_comparison');
    minval = 'search3_min-comparison-value';
    maxval = 'search3_max-comparison-value';
    oneval = 'search3_single-comparison-value';
  }
  
  var html;
  if(comparison == selection_choices[4] || comparison == selection_choices[5]){  // inside or outside range
    html = " Enter Min: <input type='text' id='' name='"+minval+"' value='' maxlength='10' size='7' >";
    html += "  Max: <input type='text' id='' name='"+maxval+"' value='' maxlength='10' size='7' > (numeric only)";
    comparison_input.innerHTML = html;
  }else{  // single value
    html = " Enter: <input type='text' id='' name='"+oneval+"' value='' maxlength='10' size='10' > (numeric only)";
    comparison_input.innerHTML = html;
  }
  
}
//
//
//
function showMetadataHint(str) {
    var html='';
	if (str.length == 0) {
        document.getElementById("txtHint").innerHTML = "";
        return;
    } else {
	    var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                //var response = xmlhttp.responseText;
                
				var response = xmlhttp.responseText;
				if(response == 'No Suggestions'){
					html = response;
				}else{
				    var items = response.split('--');

       	            html += "<div class='my_custom_dropdown' >";
                   
                    html += "<ul class='' >";
                    for(i in items){					 
                 	   html += "<li ><a role=\"menuitem\" tabindex=\"-1\" href='metadata_name/"+items[i]+"' >"+items[i]+"</a></li>";
                    }
                    html += "</ul>";
                    html += "</div>";
				    //html = "<div>my div</div>"
					//alert(html)
				}
				//alert('here '+html)
				document.getElementById("txtHint").innerHTML = html;
				
            }
        }
        xmlhttp.open("GET", "gethint/" + str, true);
        xmlhttp.send();
    }
}
//
//  SHOW  RESULTS for Taxonomy Search
//
function showTaxResult(str) {
  
  var find_datasets_btn = document.getElementById("find_datasets_btn") || null;
  var create_fasta_btn = document.getElementById("create_fasta_btn") || null;
  if (str.length==0) {
    document.getElementById("livesearch_taxonomy").innerHTML="";
    document.getElementById("livesearch_taxonomy").style.border="0px";
    document.getElementById("livesearch_taxonomy").style.height="0";
    document.getElementById("livesearch_result_div").value = ''
    if(find_datasets_btn != null){
      document.getElementById("find_datasets_btn").disabled=true;
      document.getElementById("find_datasets_hidden_id").value = ''
    }
    if(create_fasta_btn != null){
      document.getElementById("create_fasta_btn").disabled=true;
      document.getElementById("create_fasta_hidden_id").value = ''
    }
    document.getElementById("livesearch_tax_dropdown").style.visibility='hidden';
    return;
  }else{
    if(find_datasets_btn != null){
      document.getElementById("find_datasets_btn").disabled=false;
    }
    if(create_fasta_btn != null){
      document.getElementById("create_fasta_btn").disabled=false;
    }
    document.getElementById("livesearch_tax_dropdown").style.visibility='visible';
  }
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
      document.getElementById("livesearch_taxonomy").innerHTML=xmlhttp.responseText;
      document.getElementById("livesearch_taxonomy").style.border="1px solid #A5ACB2";
      document.getElementById("livesearch_taxonomy").style.height="200px";
      document.getElementById("livesearch_taxonomy").style.width="500px";
      document.getElementById("livesearch_taxonomy").style.overflow="auto";
    }
  }
  xmlhttp.open("GET","/search/livesearch_taxonomy/"+str,true);
  xmlhttp.send();
}
//
//  SHOW  RESULTS for User Search
//
function showUserResult(str) {
  if (str.length==0) {
    document.getElementById("livesearch_user").innerHTML="";
    document.getElementById("livesearch_user").style.border="0px";
    document.getElementById("livesearch_user").style.height="0";
    document.getElementById("livesearch_user_dropdown").style.visibility='hidden';
    //document.getElementById("livesearch_result_div").value = ''
    //document.getElementById("find_datasets_btn").disabled=true;
    //document.getElementById("create_fasta_btn").disabled=true;
    //document.getElementById("create_fasta_hidden_id").value = ''
    //document.getElementById("find_datasets_hidden_id").value = ''
    return;
  }else{
    //document.getElementById("find_datasets_btn").disabled=false;
    //document.getElementById("create_fasta_btn").disabled=false;
    document.getElementById("livesearch_user_dropdown").style.visibility='visible';
  }
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
      document.getElementById("livesearch_user").innerHTML=xmlhttp.responseText;
      document.getElementById("livesearch_user").style.border="1px solid #A5ACB2";
      document.getElementById("livesearch_user").style.height="200px";
      document.getElementById("livesearch_user").style.width="500px";
      document.getElementById("livesearch_user").style.overflow="auto";
    }
  }
  xmlhttp.open("GET","livesearch_user/"+str,true);
  xmlhttp.send();
}
//
//  SHOW  RESULTS for Project Search
//
function showProjectResult(str) {
  //alert(str)
  if (str.length==0) {
    document.getElementById("livesearch_project").innerHTML="";
    document.getElementById("livesearch_project").style.border="0px";
    document.getElementById("livesearch_project").style.height="0";
    document.getElementById("livesearch_project_dropdown").style.visibility='hidden';
    return;
  }else{
    //document.getElementById("find_datasets_btn").disabled=false;
    //document.getElementById("create_fasta_btn").disabled=false;
    document.getElementById("livesearch_project_dropdown").style.visibility='visible';
  }
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
      document.getElementById("livesearch_project").innerHTML=xmlhttp.responseText;
      document.getElementById("livesearch_project").style.border="1px solid #A5ACB2";
      document.getElementById("livesearch_project").style.height="200px";
      document.getElementById("livesearch_project").style.width="500px";
      document.getElementById("livesearch_project").style.overflow="auto";
    }
  }
  xmlhttp.open("GET","livesearch_project/"+str,true);
  xmlhttp.send();
}
//
//
//
function get_tax_str(taxon,rank){
    
	var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          document.getElementById("find_datasets_btn").disabled=false;
          document.getElementById("create_fasta_btn").disabled=false;
          var response = xmlhttp.responseText;
          var tmp = JSON.parse(response);
          document.getElementById("livesearch_result_div").value = tmp.full_string;
          document.getElementById("create_fasta_hidden_id").value = tmp.full_string;
          document.getElementById("find_datasets_hidden_id").value = tmp.full_string;
        }
    }
    xmlhttp.open("GET", "livesearch_taxonomy/" + rank+'/'+taxon, true);
    xmlhttp.send();
}