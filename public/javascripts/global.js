


function load_main_menu(){
	html = ''
	html += "<div class='main_menu'>"
	html += "  <ul>"
	html += "    <li><a href='/'>VAMPS Home</a></li>"
	html += "    <li><a href='/helloworld'>Hello World Page</a></li>"
	html += "    <li><a href='/visuals'>Community Visualization</a></li>"
	html += "    <li><a href='/projects'>Project List</a></li>"
	html += "    <li><a href='/users'>User List</a></li>"
	html += "    <li><a href='/users/newuser'>User Administration</a></li>"
	html += "    <li><a href='#'>Upload Data</a></li>"
	html += "    <li><a href='#'>Export Data</a></li>"
	html += "    <li><a href='#'>Search</a></li>"
	html += "    <li><a href='#'>Distribution</a></li>"
	html += "   <li><a href='#'>Metadata</a></li>"
	html += "    <li><a href='#'>Portals</a></li>"
	html += "  </ul>"
	html += "</div>"
	var div = document.getElementById('main_menu').innerHTML = html
}

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