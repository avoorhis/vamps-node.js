
selection_btn_visuals = document.getElementById('selection_btn_visuals') || null;
var clear_filters_btn_id = document.getElementById('clear_filters_btn_id') || null;
if (clear_filters_btn_id !== null) {
  clear_filters_btn_id.addEventListener('click', function () {
      clear_filters();
  });
}


var target_select = document.getElementById('target_select') || null;
if (target_select !== null) {
  target_select.addEventListener('change', function () {
      filter_by_target()
  });
}
var otu_size_btns = document.getElementsByName('otu_size') || null;
if (typeof otu_size_btns[0] !== 'undefined') {
    otu_size_btns[0].addEventListener('click', function () {
      filter_by_otu_size('.03')
  });
  otu_size_btns[1].addEventListener('click', function () {
      filter_by_otu_size('.06')
  });
  otu_size_btns[2].addEventListener('click', function () {
      filter_by_otu_size('.10')
  });
}
var pub_priv = document.getElementsByName('pub_priv');
if (typeof pub_priv[0] !== 'undefined') {
  pub_priv[0].addEventListener('click', function () {
      filter_by_status(1)
  });
  pub_priv[1].addEventListener('click', function () {
      filter_by_status(0)
  });
}

if (selection_btn_visuals !== null) {
  selection_btn_visuals.addEventListener('click', function () {
        
        // get selected matrix
        radios = document.getElementsByName('otu')
        selected_id = 0
        for(r in radios){
            if(radios[r].checked == true){
                selected_id = radios[r].id
            }
        }
        if(selected_id > 0){
            
          var f = document.createElement("form");
          f.setAttribute('method',"post");

          f.setAttribute('action',"view_selection");

          var input = document.createElement('input');
         
          input.type = 'hidden';
          input.name = 'otu_id';
          input.value = selected_id;
          f.appendChild(input);
          
          var submit = document.createElement('input');
          submit.setAttribute('type', "submit");
          f.appendChild(submit);
          document.body.appendChild(f);

          f.submit();
          document.body.removeChild(f);
        }else{
            alert('Select some data');
            return;
        }
        
        
  });
}

function delete_project(method,code){
	var resp = confirm('are you sure?')
	if(resp){
		//alert('good',resp)
		var xmlhttp = new XMLHttpRequest();
	  xmlhttp.open("GET", "/otus/delete/" + method + '/' + code, true);
    xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = xmlhttp.responseText;
            // if(response=='OK')
            document.getElementById(code).style.display = 'none';

          }
    }
	  xmlhttp.send();
	}else{
		return
	}

}
//
//
//
function adjust_radios(method){
  // unselect all
  document.getElementById('ref_otu_size3').checked = false
  document.getElementById('ref_otu_size6').checked = false
  document.getElementById('ref_otu_size9').checked = false
  document.getElementById('ucl_otu_size3').checked = false
  document.getElementById('ucl_otu_size6').checked = false
  document.getElementById('ucl_otu_size9').checked = false
  document.getElementById('slp_otu_size3').checked = false
  document.getElementById('slp_otu_size6').checked = false
  document.getElementById('slp_otu_size9').checked = false
  document.getElementById('crp_otu_size3').checked = false
  document.getElementById('crp_otu_size6').checked = false
  switch(method){
      case 'closed_ref':
            document.getElementById('ref_otu_size3').disabled = false
            document.getElementById('ref_otu_size6').disabled = false
            document.getElementById('ref_otu_size9').disabled = false
            document.getElementById('ref_otu_size3').checked = true // check first
            document.getElementById('ucl_otu_size3').disabled = true
            document.getElementById('ucl_otu_size6').disabled = true
            document.getElementById('ucl_otu_size9').disabled = true
            document.getElementById('slp_otu_size3').disabled = true
            document.getElementById('slp_otu_size6').disabled = true
            document.getElementById('slp_otu_size9').disabled = true
            document.getElementById('crp_otu_size3').disabled = true
            document.getElementById('crp_otu_size6').disabled = true
            break;
      case 'uclust':
            document.getElementById('ref_otu_size3').disabled = true
            document.getElementById('ref_otu_size6').disabled = true
            document.getElementById('ref_otu_size9').disabled = true
            document.getElementById('ucl_otu_size3').disabled = false
            document.getElementById('ucl_otu_size6').disabled = false
            document.getElementById('ucl_otu_size9').disabled = false
            document.getElementById('ucl_otu_size3').checked = true // check first
            document.getElementById('slp_otu_size3').disabled = true
            document.getElementById('slp_otu_size6').disabled = true
            document.getElementById('slp_otu_size9').disabled = true
            document.getElementById('crp_otu_size3').disabled = true
            document.getElementById('crp_otu_size6').disabled = true
            break;
      case 'slp':
            document.getElementById('ref_otu_size3').disabled = true
            document.getElementById('ref_otu_size6').disabled = true
            document.getElementById('ref_otu_size9').disabled = true
            document.getElementById('ucl_otu_size3').disabled = true
            document.getElementById('ucl_otu_size6').disabled = true
            document.getElementById('ucl_otu_size9').disabled = true
            document.getElementById('slp_otu_size3').disabled = false
            document.getElementById('slp_otu_size6').disabled = false
            document.getElementById('slp_otu_size9').disabled = false
            document.getElementById('slp_otu_size3').checked = true // check first
            document.getElementById('crp_otu_size3').disabled = true
            document.getElementById('crp_otu_size6').disabled = true
            break;
      case 'crop':
            document.getElementById('ref_otu_size3').disabled = true
            document.getElementById('ref_otu_size6').disabled = true
            document.getElementById('ref_otu_size9').disabled = true
            document.getElementById('ucl_otu_size3').disabled = true
            document.getElementById('ucl_otu_size6').disabled = true
            document.getElementById('ucl_otu_size9').disabled = true
            document.getElementById('slp_otu_size3').disabled = true
            document.getElementById('slp_otu_size6').disabled = true
            document.getElementById('slp_otu_size9').disabled = true
            document.getElementById('crp_otu_size3').disabled = false
            document.getElementById('crp_otu_size6').disabled = false
            document.getElementById('crp_otu_size3').checked = true // check first
            break;
      default:
            // ERROR
  }



}

function load_otu_list(){


    var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", "/otus/load_otu_list", true);
    xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            //var response = xmlhttp.responseText;
            //console.log(response)
            result = JSON.parse(xmlhttp.responseText);
            var html = create_otu_table_from_otu_project(result)
            document.getElementById('otus_select_div').innerHTML = html

          }
    }
	xmlhttp.send();
}
function create_otu_table_from_otu_project(obj){

    html = ''
    html += "<table border='1' class='table'>"
    html += "<tr><td></td><td>OTU Project Name</td><td>DS Count</td><td>OTU Count</td><td>OTU Size</td><td>Method</td></tr>"
    for(prj in obj){
        html += "<tr>"
        html += "<td><input type='radio' id='"+ obj[prj].opid +"' name='otu'></td>"
        html += "<td>"+prj+"</td>"
        html += "<td>"+obj[prj].ds_count+"</td>"
        html += "<td>"+obj[prj].otu_count+"</td>"
        html += "<td>"+obj[prj].size+"</td>"
        html += "<td>"+obj[prj].method+"</td>"
        html += "</tr>"
    }
    html += "</table>"
    return html
}
// CLEAR FILTERS
////////////////////////////////////////////
function clear_filters() {
  // used to clear all search filters and upon intial load
  //alert('in clear filters')
  var filtering = 0; 
  var datasets_local = {}; 
  
  var target = "/otus/clear_filters";
  
  document.getElementById('pname_search_id').value='';
  document.getElementById('target_select').value='.....';
  document.getElementById('size03').checked=0;
  document.getElementById('size06').checked=0;
  document.getElementById('size10').checked=0;
  
  var xmlhttp = new XMLHttpRequest();
  //alert(xmlhttp)  
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/json");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
        result = JSON.parse(xmlhttp.responseText);
        var html = create_otu_table_from_otu_project(result)
        document.getElementById('otus_select_div').innerHTML = html
            
    }
  }
  xmlhttp.send();
}


//
//   substring for project name filter
//  FILTER #1
//
function showLiveProjectNames(str) {
  
  var filtering = 1;
  var datasets_local = {};
  if (str.length==0) {
    str = '.....';  // cannot be empty string for url: (hopefully no-one will search for this)
  }
  
  document.getElementById('target_select').value='.....';
  document.getElementById('size03').checked=0;
  document.getElementById('size06').checked=0;
  document.getElementById('size10').checked=0;
  
  var target = "/otus/livesearch_projects/"+str;
  
  var xmlhttp = new XMLHttpRequest();  
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
        result = JSON.parse(xmlhttp.responseText);
        var html = create_otu_table_from_otu_project(result)
        document.getElementById('otus_select_div').innerHTML = html    
    }
  }
  xmlhttp.send();
}

//
// SHOW/FILTER  RESULTS for gene target Search
//  FILTER #3
//
function filter_by_target() {
  var filtering = 1;
  var datasets_local = {};
  var genetarget =   document.getElementById('target_select').value;
  var target = "/otus/livesearch_target/"+genetarget;
  
  var xmlhttp = new XMLHttpRequest(); 
  
  
  document.getElementById('pname_search_id').value='';
  document.getElementById('size03').checked=0;
  document.getElementById('size06').checked=0;
  document.getElementById('size10').checked=0;
 
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
        result = JSON.parse(xmlhttp.responseText);
        var html = create_otu_table_from_otu_project(result)
        document.getElementById('otus_select_div').innerHTML = html
        
    }
  }
  xmlhttp.send();
}


function filter_by_otu_size(size) {
  var filtering = 1;
  var datasets_local = {};
  var target = "/otus/livesearch_otu_size/"+size;
  
  var xmlhttp = new XMLHttpRequest(); 
  
 
  document.getElementById('target_select').value='.....';
  document.getElementById('pname_search_id').value='';
  
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
        result = JSON.parse(xmlhttp.responseText);
        var html = create_otu_table_from_otu_project(result)
        document.getElementById('otus_select_div').innerHTML = html
    }
  }
  xmlhttp.send();
}

function update_gui_elements(result){
  //alert(JSON.stringify(result))
  //alert(JSON.stringify(env_sources_local))
    if(result.substring == '' || result.substring == '.....'){
      document.getElementById('pname_search_id').value = ''
      //document.getElementById('pname_search_id').style.color = 'black'
      document.getElementById('substring_on_id').innerHTML = ''
    }else{
      document.getElementById('pname_search_id').value = result.substring
      //document.getElementById('pname_search_id').style.color = 'orange'
      document.getElementById('substring_on_id').innerHTML = '*'
    }
        
    
    if(result.target == '' || result.target == '.....'){
      document.getElementById('target_select').value = '.....'
      //document.getElementById('target_select').style.color = 'black'
      document.getElementById('target_on_id').innerHTML = ''
    }else{
      document.getElementById('target_select').value = result.target
      //document.getElementById('target_select').style.color = 'orange'
      document.getElementById('target_on_id').innerHTML = '*'
    }

    

    if(result.public == '0'){
      document.getElementById('status_pub').checked = false
      document.getElementById('status_priv').checked = true
      document.getElementById('public_on_id').innerHTML = '*'
    }else if(result.public == '1'){
      document.getElementById('status_pub').checked = true
      document.getElementById('status_priv').checked = false
      document.getElementById('public_on_id').innerHTML = '*'
    }else{
      document.getElementById('status_pub').checked = false
      document.getElementById('status_priv').checked = false
      document.getElementById('public_on_id').innerHTML = ''
    }



}
