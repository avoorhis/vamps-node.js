
var view_saved_datasets_btn = document.getElementById('view_saved_datasets_btn');

if (typeof view_saved_datasets_btn !== 'undefined') {
	view_saved_datasets_btn.addEventListener('click', function () {
  	  window.location='saved_datasets';
	});
}


var clear_filters_btn_id = document.getElementById('clear_filters_btn_id');
if (typeof clear_filters_btn_id !== 'undefined') {
	clear_filters_btn_id.addEventListener('click', function () {
  	  clear_filters();
	});
}

var env_source_select = document.getElementById('env_source_select');
if (typeof env_source_select !== 'undefined') {
	env_source_select.addEventListener('change', function () {
  	  filter_by_env();
	});
}

var target_select = document.getElementById('target_select');
if (typeof target_select !== 'undefined') {
	target_select.addEventListener('change', function () {
  	  filter_by_target()
	});
}
//
//
//
function clear_filters() {
	
	document.getElementById('target_select').value='.....';
	document.getElementById('env_source_select').value='.....';
  document.getElementById('tax_search_id').value='';
  var xmlhttp = new XMLHttpRequest();  
	xmlhttp.open("GET", "/visuals/clear_filters", true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 ) {
      document.getElementById("projects_select_div").innerHTML = xmlhttp.responseText;
      onPageLoad();
    }
  }
  xmlhttp.send();
}
//
//
//
function filter_by_env() {

	var xmlhttp = new XMLHttpRequest();  
  
  var env_source_id =  document.getElementById('env_source_select').value;
  document.getElementById('target_select').value='.....';
  document.getElementById('tax_search_id').value='';

  xmlhttp.open("GET", "/visuals/livesearch_env/"+env_source_id, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 ) {
      document.getElementById("projects_select_div").innerHTML = xmlhttp.responseText;
      onPageLoad();      
    }
  }
 
  xmlhttp.send();
}
//
//
//
function filter_by_target() {

	var xmlhttp = new XMLHttpRequest(); 
	var target =   document.getElementById('target_select').value;
	document.getElementById('env_source_select').value='.....';
	document.getElementById('tax_search_id').value='';
  xmlhttp.open("GET", "/visuals/livesearch_target/"+target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 ) {
      document.getElementById("projects_select_div").innerHTML = xmlhttp.responseText;
      onPageLoad();      
    }
  }
 
  xmlhttp.send();
}
//
//  SHOW  RESULTS for project Search
//
function showLiveProjectNames(str) {

  if (str.length==0) {
    str = '----';  // cannot be empty string : (hopefully no-one will search for this)
  }
  document.getElementById('env_source_select').value='.....';
  document.getElementById('target_select').value='.....';

  var xmlhttp = new XMLHttpRequest();  
  xmlhttp.open("GET", "/visuals/livesearch_projects/"+str, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 ) {
      document.getElementById("projects_select_div").innerHTML = xmlhttp.responseText;
      onPageLoad();      
    }
  }
 
  xmlhttp.send();
}