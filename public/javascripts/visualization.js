// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.


//
// TOGGLE_SELECTED_DATASETS
//
function toggle_selected_datasets(pid, project)
{

  ds_div = document.getElementById(pid+'_ds_div');
  cbs = ds_div.getElementsByTagName('input')
  toggle = document.getElementById(project+'_toggle')
  if(ds_div.style.display == 'inline'){
    ds_div.style.display = 'none'
    document.getElementById(project+'--pj-id').checked = false
    // change image to plus.png
    toggle.innerHTML = "<img alt='plus' src='images/tree_plus.gif' width='10' />"
    for(var i=0; i < cbs.length; i++) {
      if(cbs[i].type == 'checkbox') {
        cbs[i].checked=false        
      }
    }
  }else{
    ds_div.style.display = 'inline'
    document.getElementById(project+'--pj-id').checked = true
    toggle.innerHTML = "<img alt='minus' src='images/tree_minus.gif' width='10' />"
    for(var i=0; i < cbs.length; i++) {
      if(cbs[i].type == 'checkbox') {
        cbs[i].checked=true        
      }
    }
  }

}
function toggle_simple_taxa()
{
  boxes = document.getElementsByClassName('simple_taxa_ckbx');
  if(boxes[0].checked == false){
      for (i = 0; i < boxes.length; i++){
          boxes[i].checked = true  
          document.getElementById('toggle_taxa_btn').checked = true    
      }
  }else{
      for (i = 0; i < boxes.length; i++){
          boxes[i].checked = false
          document.getElementById('toggle_taxa_btn').checked = false
      } 
  }
  
  
  
  
}
function load_visualization_items(rows,units){
  load_project_select(rows)
  load_unit_select(units)
}
function load_unit_select(unitSelections){
    rows = JSON.parse(unitSelections)
   html = "Units:"
    html += "<select>"
    for(i in rows.units) {
       value  = rows.units[i].id
       name   = rows.units[i].name
       html += "<option value='"+ value+"'>"+name+"</option>"
    }
    html += "</select>"
    var div = document.getElementById('units_select_div').innerHTML = html
}
function load_project_select(datasets_by_project_all){
  //alert('in load')
  rows = JSON.parse(datasets_by_project_all)
  html = '<ul>'
  for(i in rows.projects){
    pname = rows.projects[i].pname
    pid   = rows.projects[i].pid 
    html += "<li>"
    html += "<label class='project-select' >"
    html += "  <a href='#'  id='"+pname+"_toggle'"                
    html += "        onclick=\"toggle_selected_datasets('"+ pid +"','"+ pname +"'); return false;\" >"
    html += "  <img alt='plus' src='images/tree_plus.gif' width='10'/></a>"
    html += "  <input type='checkbox' id='"+ pname + "--pj-id' name='project_ids[]'" 
    html += "        onclick=\"open_datasets('"+ pid +"','"+ pname +"')\" \>"
    html += "<a href=''>"+ pname +"</a>"
    html += "</label>"
    html += "<ul>"
    html += "<div id='"+ pid+"_ds_div' class='display_none'>"
    for(k in rows.projects[i].datasets) {
      dname = rows.projects[i].datasets[k].dname
      did = rows.projects[i].datasets[k].did
      html += "<li>"
      html += "<label class='dataset-select' >"
      html += "   <input type='checkbox' id='"+ did +"' name='dataset_ids[]'"
      html += "      onclick=\"set_check_project('"+ pid +"','"+ pname +"')\" \>"
      html += dname
      html += "</label>"
      html += "</li>"
    } 
    html += "</div>"
    html += "</ul>"
    html += "</li>"
    
  }
  html += "</ul>"
  //alert(html)
  var div = document.getElementById('projects_select_div').innerHTML = html
}
// function toggleAll(name)
// {
//   boxes = document.getElementsByClassName(name);
//   for (i = 0; i < boxes.length; i++)
//     if (!boxes[i].disabled)
//    		{	boxes[i].checked = !boxes[i].checked ; }
// }
// 
// function toggleTaxSelection()
// {
//     custom_div = document.getElementById('custom_taxonomy_selector')
//     basic_div = document.getElementById('basic_taxonomy_selector')
//     if(custom_div.style.display=='none'){
//         custom_div.style.display='block';        
//         basic_div.style.display='none';
//        
//     }else{
//         custom_div.style.display='none';
//         basic_div.style.display='block';
//     }
//     
//   
//   
// }
// function getDatasets(form)
// {

// 	checked_datasets = json_project_tree.getAllCheckedBranches()
  	
//   	if(checked_datasets==''){
//   		alert("Select some datasets.")
//   		return
//   	}

//   var hiddenField1 = document.createElement("input"); 
// 	hiddenField1.setAttribute("type", 'hidden');
// 	hiddenField1.setAttribute("name", "datasets");
// 	hiddenField1.setAttribute("value", checked_datasets);	
// 	form.appendChild(hiddenField1);

//   	$(form).submit();
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
function open_datasets(pid, project)
{
  
  //alert('in open')
  ds_div = document.getElementById(pid+'_ds_div');
  cbs = ds_div.getElementsByTagName('input')
  toggle = document.getElementById(project+'_toggle')
  // if closed it will open
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



