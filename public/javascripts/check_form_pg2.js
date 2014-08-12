// visualization: check_form_pg2.js

var get_graphics_form = document.getElementById('get_graphics_form');
var get_graphics = document.getElementById('get_graphics');
if (typeof get_graphics !=="undefined") 
{
  get_graphics.addEventListener('click', function () {
      check_viz_selection_pg2(get_graphics_form);
  });
}

//
// CHECK_VIZ Page 2
//

function is_checked(id_names)
{
  return $('input[name="'+id_names+'"]:checked').length > 0; 
}

// todo: DRY valid = false; check; if(!valid) {alert(msg);return;}
// function check_for_taxa()
// {
//   
// }
function check_viz_selection_pg2(thisform) {
  // simple function to check if user has not selected any visuals.
  // alerts and returns if not.
  var unit_selection = thisform["unit_selection"].value;
  var valid = false;
  var msg = '';
  
  // test for selected units: taxonomy, med_nodes, otus
  if (unit_selection === 'tax_silva108_simple' || unit_selection === 'tax_silva108_custom') {
  
  // if (unit_selection === 'tax_silva108_simple') {
  //   // check for domains[].length must be > 0
  //   msg = '1) You must select some taxa';
  //   valid = is_checked(domains_id_names);
  // } else if (unit_selection === 'tax_silva108_custom'){
  //   // check for domain_names <-- atleast one selected
    // msg = '2) You must select some taxa';
    msg = 'You must select some taxa';
    valid = is_checked("domains[]");
  }
  // else{
  // 
  // }
  
  if(!valid) {alert(msg);return;}

  //
  // test for selected visuals: counts_table, heatmap ...
  //
  valid = false;
  msg = 'You must select one or more display output choices';
  valid = is_checked("visuals[]");
  
  if(!valid){alert(msg); return;}
  
  thisform.submit();
  
  // what else do we check here?
  // check for NO unit_associations: unit_assoc":{"tax_silva108_id":[],"tax_gg_id":[],"med_node_id":[],"otu_id":[]}}

}

