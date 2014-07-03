

// visualization.js

// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
var selected_datasets = [];


//
// TOGGLE_SELECTED_DATASETS
//
function toggle_selected_datasets(project)
{

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
//
// TOGGLE_SIMPLE_TAXA
//
function toggle_simple_taxa()
{
  var boxes = document.getElementsByClassName('simple_taxa_ckbx');
  var i;
  if (boxes[0].checked === false) {
      for (i = 0; i < boxes.length; i++) {
          boxes[i].checked = true;
          document.getElementById('toggle_taxa_btn').checked = true;
      }
  } else {
      for (i = 0; i < boxes.length; i++) {
          boxes[i].checked = false;
          document.getElementById('toggle_taxa_btn').checked = false;
    }
  }
}
//
// LOAD_VISUALIZATION_ITEMS Page 1
//
function load_visualization_items_p1(rows){
  load_project_select(rows);
}

//
// GET REQUESTED UNITS SELECTION BOX
//
function get_requested_units_selection_box(file_id) {

  var file = '';
  
  // case functions are in unit_selectors.js
  
  var partial_name = '/visuals/partials/'+file_id;

  
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET",partial_name, true);
  xmlhttp.onreadystatechange=function(){
         if (xmlhttp.readyState==4 && xmlhttp.status==200){
           string=xmlhttp.responseText;
           //alert(partial_name)
           var div = document.getElementById('units_select_div').innerHTML = string;
         }
  }
  xmlhttp.send();

}

//
//  LOAD PROJECT SELECT
//
function load_project_select(projects){
  //alert('in load')
 
  rows = JSON.parse(projects)
  html = '<ul>'
  for (i in rows.projects){
    pname   = rows.projects[i].name
    datasets = rows.projects[i].datasets
   // alert(i)
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
//
// LOAD_VISUALIZATION_ITEMS Page 1
//





//
//  OPEN DATASETS
//
function open_datasets(project)
{

  //alert('in open')


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
//
// CHECK_VIZ Page 1
//
function check_viz_selection_pg1(thisform) {

  var x = thisform["dataset_ids[]"];
  var gotone = false;
  for (var i=0; i<x.length; i++)
  {
      if (x[i].checked) {
        gotone = true;
      }
  }
  if (gotone){
    thisform.submit();
  } else {
    alert('You must select some datasets');
    return;
  }
}
//
// CHECK_VIZ Page 2
//
function check_viz_selection_pg2(thisform) {

  var x = thisform["visuals[]"];
  var gotone = false;
  for (var i=0; i<x.length; i++)
  {
      if (x[i].checked) {
        gotone = true;
      }
  }
  if (gotone){
    thisform.submit();
  } else {
    alert('You must select a display output');
    return;
  }
  // what else do we check here?
  // check for NO unit_associations: unit_assoc":{"tax_silva108_id":[],"tax_gg_id":[],"med_node_id":[],"otu_id":[]}}

}









