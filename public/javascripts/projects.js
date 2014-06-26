// projects.js

function load_projectslist(rows)
{
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