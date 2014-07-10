

//
// TOGGLE_SELECTED_DATASETS
//
function toggle_selected_datasets(project)
{
  // Called from index_visuals: project--dataset tree

  var ds_div = document.getElementById(project+'_ds_div');
  var cbs = ds_div.getElementsByTagName('input');
  var toggle = document.getElementById(project+'_toggle');
  var i;
  
  if (ds_div.style.display === 'inline'){
    ds_div.style.display = 'none';
    document.getElementById(project+'--pj-id').checked = false;
    // change image to plus.png
    toggle.innerHTML = "<img alt='plus' src='/images/tree_plus.gif' width='10' />";
    for (i=0; i < cbs.length; i++) {
      if (cbs[i].type === 'checkbox') {
        cbs[i].checked = false;
      }
    }
  } else {
    ds_div.style.display = 'inline';
    document.getElementById(project+'--pj-id').checked = true;
    toggle.innerHTML = "<img alt='minus' src='/images/tree_minus.gif' width='10' />";
    for (i=0; i < cbs.length; i++) {
      if (cbs[i].type === 'checkbox') {
        cbs[i].checked = true  ;
      }
    }
  }
}


/**
* HTML with ejs instead
//
//  LOAD PROJECT SELECT
//
function load_project_select(projects){
  // Called from index_visuals: project--dataset tree
 
  rows = JSON.parse(projects)
  html = '<ul>'
  for (i in rows.projects){
    pname   = rows.projects[i].name
    datasets = rows.projects[i].datasets
    
    html += "<li>"
    html += "<label class='project-select' >"
    html += "  <a href='#'  id='"+ pname +"_toggle'"
    html += "        onclick=\"toggle_selected_datasets('"+ pname +"'); return false;\" >"
    html += "  <img alt='plus' src='/images/tree_plus.gif' width='10'/></a>"
    html += "  <input type='checkbox' id='"+ pname + "--pj-id' name='project_names[]' value='"+ pname + "'"
    html += "        onclick=\"open_datasets('"+ pname +"')\" \>"
    html += "<a href=''>"+ pname +"</a>"
    html += "</label>"
    html += "<ul>"
    html += "<div id='"+pname+"_ds_div' class='display_none'>"
    for(k in datasets) {
      dname = datasets[k].dname
      did = datasets[k].did
      pd = pname+'--'+dname
      pass_thru_value = did+'--'+pname+'--'+dname
      html += "<li>"
      html += "<label class='dataset-select' name='xx' >"
      html += "   <input type='checkbox' id='"+ pd +"' name='dataset_ids[]' value='"+ pass_thru_value +"'"
      html += "      onclick=\"set_check_project('"+ pname +"')\" \>"
      html += dname
      html += "</label>"
      html += "</li>"
    }
    html += "</div>"
    html += "</ul>"
    html += "</li>"

  }
  html += "</ul>";
  //html += "<input type='hidden' id='' value='OtherSeCrEt' name='my_hidden_var2' />"
  //alert(html)
  var div = document.getElementById('projects_select_div').innerHTML = html;
}
*/

//
//  OPEN DATASETS
//
function open_datasets(project)
{

  // Called from index_visuals: project--dataset tree

  ds_div = document.getElementById(project+'_ds_div');
  cbs = ds_div.getElementsByTagName('input');
  toggle = document.getElementById(project+'_toggle');
  if(ds_div.style.display == 'inline'){

    // uncheck project
    if (cbs[0].checked) {
      document.getElementById(project+'--pj-id').checked = false;
      for (i=0; i < cbs.length; i++) {
        cbs[i].checked = false;
      }
    } else {
      document.getElementById(project+'--pj-id').checked = true;
      for (i=0; i < cbs.length; i++) {
        cbs[i].checked = true;
      }
    }

  } else {

    // check project
    ds_div.style.display = 'inline';
    document.getElementById(project+'--pj-id').checked = true;
    toggle.innerHTML = "<img alt='minus' src='/images/tree_minus.gif' width='10' />";
    // now set all the ds checkboxes to 'checked'
    for (i=0; i < cbs.length; i++) {
      if (cbs[i].type === 'checkbox') {
        cbs[i].checked = true;
      }
    }
  }


}
//
//  SET_CHECK_PROJECTS
//
function set_check_project(project)
{
  // Called from index_visuals: project--dataset tree
  ds_div = document.getElementById(project+'_ds_div');
  cbs = ds_div.getElementsByTagName('input')
  have_acheck = false
  for(var i=0; i < cbs.length; i++) {
    if(cbs[i].checked){
      have_acheck = true
    }
  }
  if (have_acheck){
    document.getElementById(project+'--pj-id').checked = true;
  } else {
    document.getElementById(project+'--pj-id').checked = false;
  }
}




