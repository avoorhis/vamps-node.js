

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
    toggle.innerHTML = "<img alt='plus' src='images/tree_plus.gif' width='10' />";
    for (i=0; i < cbs.length; i++) {
      if (cbs[i].type === 'checkbox') {
        cbs[i].checked = false;
      }
    }
  } else {
    ds_div.style.display = 'inline';
    document.getElementById(project+'--pj-id').checked = true;
    toggle.innerHTML = "<img alt='minus' src='images/tree_minus.gif' width='10' />";
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
// LOAD_VISUALIZATION_ITEMS Page 2
//
function load_visualization_items_p2(selection_obj,constants){
  
  var items = JSON.parse(selection_obj);
  //alert(items.getNumberOfDatasets())  // This doesn't seem to work
  
  show_selected_datasets(selection_obj);
  load_unit_select(constants);
  show_visuals_output_choices();
}
//
//   SHOW VISUALS OUTPUT CHOICES
//
function show_visuals_output_choices(){
    var html = 'heatmap,barcharts,coutsTable....';
    var div = document.getElementById('show_visuals_output_choices').innerHTML = html;
}
//
//  LOAD UNIT SELECT
//
function load_unit_select(constants){
    var C = JSON.parse(constants);
    var rows = C.UNITSELECT.units;
    var html = "";
    html += "<select onchange='get_requested_units_selection_box(this.value);return false;'>";
    html += "<option value='none'>Choose Units</option>";
    for (var i in rows) {
      var file_id  = rows[i].id;
      var name = rows[i].name;
      var file = rows[i].file;
      html += "<option value='"+ file_id +"'>"+ name +"</option>";
     }
    html += "</select>";
    var div = document.getElementById('units_select_choices_div').innerHTML = html;
}
//
// GET REQUESTED UNITS SELECTION BOX
//
function get_requested_units_selection_box(file_id){

  var html = '';
  // case functions are in unit_selectors.js
  switch(file_id){
    case 'tax_silva108_simple':
      html = get_taxa_sil108_simple();
      break;
    case 'tax_silva108_custom':
      html = get_taxa_sil108_custom();
      break;
    case 'tax_gg_simple':
      html = get_taxa_gg_simple();
      break;
    case 'tax_gg_custom':
      html = get_taxa_gg_custom();
      break;
    case 'med_nodes':
      html = get_med_nodes();
      break;
    default:
      html = 'Select Another';
  }
  var div = document.getElementById('units_select_div').innerHTML = html;

}
//
//  SHOW SELECTED DATASETS
//
function show_selected_datasets(selection_obj){

  
  var items = JSON.parse(selection_obj);
  var html = "Here are your selected datasets:<br>&nbsp;&nbsp;&nbsp;&nbsp;";
  html += "<select>";

  for (var i in items.dataset_names){
    html += "<option>";
    html += items.dataset_names[i];
    html += "</option>";
  }
  html += '</select>';
  html += '<br>To change these <a href="/visuals">GoBack</a> to the previous page.';
  //alert(html);
  var div = document.getElementById('show_selected_datasets_div').innerHTML = html;

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
    
    html += "<li>"
    html += "<label class='project-select' >"
    html += "  <a href='#'  id='"+ pname +"_toggle'"
    html += "        onclick=\"toggle_selected_datasets('"+ pname +"'); return false;\" >"
    html += "  <img alt='plus' src='images/tree_plus.gif' width='10'/></a>"
    html += "  <input type='checkbox' id='"+ pname + "--pj-id' name='project_names[]' value='"+ pname + "'"
    html += "        onclick=\"open_datasets('"+ pname +"')\" \>"
    html += "<a href=''>"+ pname +"</a>"
    html += "</label>"
    html += "<ul>"
    html += "<div id='"+pname+"_ds_div' class='display_none'>"
    for(k in datasets) {
      dname = datasets[k].dname
      did = datasets[k].did
      ds_count = datasets[k].ds_count
      pd = pname+'--'+dname
      pass_value = did+'--'+pname+'--'+dname+'--'+ds_count
      html += "<li>"
      html += "<label class='dataset-select' name='xx' >"
      html += "   <input type='checkbox' id='"+ pd +"' name='dataset_ids[]' value='"+ pass_value +"'"
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
    toggle.innerHTML = "<img alt='minus' src='images/tree_minus.gif' width='10' />";
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
// CHECK_FOR_NO_DATASET
//
function check_for_no_datasets(thisform){

  var x = thisform["dataset_ids[]"];
  gotone = false;
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


