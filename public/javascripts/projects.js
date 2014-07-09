// projects.js
// onload="load_projectslist('<%= JSON.stringify(rows) %>"
// document.addEventListener( "DOMContentLoaded", load_projectslist(JSON.stringify(all_projects)), false );
document.addEventListener( "DOMContentLoaded", call_me(all_projects), false );

function call_me()
{
	var fooJSON = JSON.stringify(all_projects);
	
	alert("URA");
	alert(fooJSON);
	// get it as json from an ajax-call??? http://stackoverflow.com/questions/23031161/get-variable-on-client-side-from-the-server-side-express-js-node-js
}

function load_projectslist(rows)
{
	alert("URA");
	alert(all_projects);
  rows = JSON.parse(rows);
  var html = '<ul>';
  var i;
  
  for (i in rows){
    html += "<li><a href='/projects/"+rows[i].id+"'>"+rows[i].project+"</a>";
    html += ' -- '+rows[i].title;
    html += ' '+rows[i].project_description;
  }
  html += '</ul>';
  var div = document.getElementById('project_list_div').innerHTML = html;

}

function load_project(p){
  var project = JSON.parse(p);
  var html = '<ul> ';
  html += '<li>'+project[0].id+'</li>';
  html += '<li>'+project[0].project+'</li>';
  html += '<li>'+project[0].title+'</li>';
  html += '<li>'+project[0].project_description+'</li>';
  html += '</ul>';
  var div = document.getElementById('project_info_div').innerHTML = html;
}

if (typeof exports !== 'undefined') {
   exports.load_projectslist = load_projectslist
   exports.load_project = load_project
}
