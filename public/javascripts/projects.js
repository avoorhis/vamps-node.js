// projects.js

function load_projectslist(rows)
{
	rows = JSON.parse(rows)
	
	var html = '<ul>'
	for(i in rows){
		html += "<li><a href='/projects/:id'>"+rows[i].project+"</a>"
		html += ' -- '+rows[i].title
		html += ' '+rows[i].project_description
	}
	html += '</ul>'
	var div = document.getElementById('project_list_div').innerHTML = html

}