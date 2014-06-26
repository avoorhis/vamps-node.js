// visualization.js

// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
var selected_datasets = [];


//
// TOGGLE_SELECTED_DATASETS
//
function toggle_selected_datasets(pid, project)
{

  var ds_div = document.getElementById(pid+'_ds_div');
  var cbs = ds_div.getElementsByTagName('input');
  var toggle = document.getElementById(project+'_toggle');
  if(ds_div.style.display === 'inline'){
    ds_div.style.display = 'none';
    document.getElementById(project+'--pj-id').checked = false;
    // change image to plus.png
    toggle.innerHTML = "<img alt='plus' src='images/tree_plus.gif' width='10' />";
    for(var i=0; i < cbs.length; i++) {
      if(cbs[i].type === 'checkbox') {
        cbs[i].checked=false;
      }
    }
  } else {
    ds_div.style.display = 'inline';
    document.getElementById(project+'--pj-id').checked = true;
    toggle.innerHTML = "<img alt='minus' src='images/tree_minus.gif' width='10' />";
    for(var n=0; n < cbs.length; n++) {
      if(cbs[n].type === 'checkbox') {
        cbs[n].checked=true  ;
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
  if (boxes[0].checked === false){
      for (var i = 0; i < boxes.length; i++){
          boxes[i].checked = true;
          document.getElementById('toggle_taxa_btn').checked = true;
      }
  }else{
      for (var n = 0; n < boxes.length; n++){
          boxes[n].checked = false;
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
function load_visualization_items_p2(bodyItems,constants){
  show_selected_datasets(bodyItems);
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
    for(i in rows) {
        file_id  = rows[i].id
        name   = rows[i].name
        file = rows[i].file
        html += "<option value='"+ file_id +"'>"+ name +"</option>"
     }
    html += "</select>"
    var div = document.getElementById('units_select_choices_div').innerHTML = html
}
//
// GET REQUESTED UNITS SELECTION BOX
//
function get_requested_units_selection_box(file_id){

  html=''
  // case functions are in unit_selectors.js
  switch(file_id){
    case 'tax_silva116_simple':
      html = get_taxa_sil106_simple();
      break;
    case 'tax_silva116_custom':
      html = get_taxa_sil106_custom();
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
  var div = document.getElementById('units_select_div').innerHTML = html

}
//
//  SHOW SELECTED DATASETS
//
function show_selected_datasets(bodyItems){

  body = JSON.parse(bodyItems)
  html = "Here are your selected datasets:<br>&nbsp;&nbsp;&nbsp;&nbsp;"
  html += "<select>"

  for(i in body.dataset_ids){
    //alert(i)
    html += "<option>"
    html += body.dataset_ids[i]
    html += "</option>"
  }
  html += '</select>'
  html += '<br>To change these <a href="/visuals">GoBack</a> to the previous page.'
  //alert(html)
  var div = document.getElementById('show_selected_datasets_div').innerHTML = html

}
//
//  LOAD PROJECT SELECT
//
function load_project_select(datasets_by_project_all){
  //alert('in load')
  rows = JSON.parse(datasets_by_project_all)
  html = '<ul>'
  for (var i in rows.projects){
    pname = rows.projects[i].pname
    pid   = rows.projects[i].pid

    html += "<li>"
    html += "<label class='project-select' >"
    html += "  <a href='#'  id='"+ pname +"_toggle'"
    html += "        onclick=\"toggle_selected_datasets('"+ pid +"','"+ pname +"'); return false;\" >"
    html += "  <img alt='plus' src='images/tree_plus.gif' width='10'/></a>"

    html += "  <input type='checkbox' id='"+ pname + "--pj-id' name='project_ids[]' value='"+ pname + "'"
    html += "        onclick=\"open_datasets('"+ pid +"','"+ pname +"')\" \>"
    html += "<a href=''>"+ pname +"</a>"
    html += "</label>"
    html += "<ul>"
    html += "<div id='"+ pid +"_ds_div' class='display_none'>"
    for(k in rows.projects[i].datasets) {
      dname = rows.projects[i].datasets[k].dname
      did = rows.projects[i].datasets[k].did
      pd = pname+'--'+dname
      html += "<li>"
      html += "<label class='dataset-select' name='xx' >"
      html += "   <input type='checkbox' id='"+ pd +"' name='dataset_ids[]' value='"+ pd +"'"
      html += "      onclick=\"set_check_project('"+ pid +"','"+ pname +"')\" \>"
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




//   checked_datasets = json_project_tree.getAllCheckedBranches()

//     if(checked_datasets==''){
//       alert("Select some datasets.")
//       return
//     }

//   var hiddenField1 = document.createElement("input");
//   hiddenField1.setAttribute("type", 'hidden');
//   hiddenField1.setAttribute("name", "datasets");
//   hiddenField1.setAttribute("value", checked_datasets);
//   form.appendChild(hiddenField1);

//     $(form).submit();
// }

//
// CHECK_FOR_SELECTED_DATASETS
//
// function check_for_selected_datasets(form)
// {

//   cbs = document.getElementsByName(project+'--ds-ids[]')
//   alert(cbs)
//   have_acheck = false
//   for(var i=0; i < cbs.length; i++) {
//     if(cbs[i].checked){
//       have_acheck = true
//     }

//   }
//   if(have_acheck){
//     alert('submitting')
//     $(form).submit();
//   }else{
//     alert('Select some data!')
//     return;
//   }
//   return;
// }
//
// OPEN_DATASETS
//

// function open_this_taxon(rank,id,name)
// {
//     alert('open_this_taxon rank='+rank+' name='+name)
// }
// function toggle_lower_taxa(rank,id,name)
// {
//     alert('toggle_lower_taxa id='+id)
//
//     if(rank==0){
//         // get list phylum level for this name
//         // select distinct phylum from taxonomies
//         // JOIN phylums on phylum_id=phylums.id
//         // where domain_id='id'
//         // Phylum.joins("JOIN taxonomies ON phylum_id = phylums.id").where("domain_id=3").distinct
//     }else if(rank==1){
//         // Klass.joins("JOIN taxonomies ON klass_id = klasses.id").where("phylum_id=3").distinct
//     }else if(rank==2){
//         // Order.joins("JOIN taxonomies ON order_id = orders.id").where("klass_id=3").distinct
//     }else if(rank==3){
//         // Family.joins("JOIN taxonomies ON family_id = families.id").where("order_id=3").distinct
//     }else if(rank==4){
//         // Genus.joins("JOIN taxonomies ON genus_id = genus.id").where("family_id=3").distinct
//     }else if(rank==5){
//         // Species.joins("JOIN taxonomies ON species_id = species.id").where("genus_id=3").distinct
//     }else if(rank==6){
//         // Strain.joins("JOIN taxonomies ON strain_id = strain.id").where("species_id=3").distinct
//     }else{
//         // ERROR
//     }
// params = 'rank='+rank
// params += '&id='+id
// params += '&name='+name
//
// $.ajax({
//   url: "/visualization_controller/show_hide_subitem",
//   data: params,
//   dataType: 'script'
// })
//
// }

//
//  OPEN DATASETS
//
function open_datasets(pid, project)
{

  //alert('in open')
  ds_div = document.getElementById(pid+'_ds_div');
  cbs = ds_div.getElementsByTagName('input');
  toggle = document.getElementById(project+'_toggle');
  if(ds_div.style.display == 'inline'){

    // uncheck project
    if(cbs[0].checked == true) {
      document.getElementById(project+'--pj-id').checked = false
      for(var i=0; i < cbs.length; i++) {
        cbs[i].checked=false
      }
    }else{
      document.getElementById(project+'--pj-id').checked = true
      for(var i=0; i < cbs.length; i++) {
        cbs[i].checked=true
      }
    }

  }else{

    // check project
    ds_div.style.display = 'inline'
    document.getElementById(project+'--pj-id').checked = true
    toggle.innerHTML = "<img alt='minus' src='images/tree_minus.gif' width='10' />"
    // now set all the ds checkboxes to 'checked'
    for(var i=0; i < cbs.length; i++) {
      if(cbs[i].type == 'checkbox') {
        cbs[i].checked=true
      }
    }
  }


}
//
//  SET_CHECK_PROJECTS
//
function set_check_project(pid, project)
{
  ds_div = document.getElementById(pid+'_ds_div');
  cbs = ds_div.getElementsByTagName('input')
  have_acheck = false
  for(var i=0; i < cbs.length; i++) {
    if(cbs[i].checked){
      have_acheck = true
    }
  }
  if(have_acheck){
    document.getElementById(project+'--pj-id').checked = true
  }else{
    document.getElementById(project+'--pj-id').checked = false
  }
}
//
// CHECK_FOR_NO_DATASET
//
function check_for_no_datasets(thisform){

  var x = thisform["dataset_ids[]"];
  gotone = false
  for (var i=0; i<x.length; i++)
  {
      if(x[i].checked == true){
        gotone = true
      }
  }
  if(gotone){
    thisform.submit();
  }else{
    alert('You must select some datasets')
    return;
  }
}


