// visualization: check_form_pg2.js

var get_graphics_form = document.getElementById('get_graphics_form');
get_graphics = document.getElementById('get_graphics');
if (typeof get_graphics !=="undefined") 
{
  get_graphics.addEventListener('click', function () {
      check_viz_selection_pg2(get_graphics_form);
  });
}

//
// CHECK_VIZ Page 2
//
function check_viz_selection_pg2(thisform) {
  // simple function to check if user has not selected any visuals.
  // alerts and returns if not.
  var visuals = thisform["visuals[]"];
  var unit_selection = thisform["unit_selection"].value;
  var valid  = false;
  var msg = '';
  var domain_names;
  var i;
  
  // test for selected units: taxonomy, med_nodes, otus
  if (unit_selection === 'tax_silva108_simple') {
    // check for domains[].length must be > 0
    domain_names = thisform["domains[]"];
    msg = '1) You must select some taxa';
    for (i=0; i<domain_names.length; i++)
    {
      if (domain_names[i].checked) {
        valid = true;
      }
    }
  } else if (unit_selection === 'tax_silva108_custom'){
    // check for domain_names <-- atleast one selected
    domain_names = thisform["domain_names[]"];
    msg = '2) You must select some taxa';

    for (i=0; i<domain_names.length; i++)
    {
      if (domain_names[i].checked) {
        valid = true;
      }
    }

  }else{

  }
  
  if(!valid){alert(msg);return;}

  //
  // test for selected visuals: counts_table, heatmap ...
  //
  valid  = false;
  for (i=0; i<visuals.length; i++)
  {
      msg = 'You must select one or more display output choices';
      if (visuals[i].checked) {
        valid = true;
      }
  }
  if(!valid){alert(msg); return;}

  
  thisform.submit();
  

  // what else do we check here?
  // check for NO unit_associations: unit_assoc":{"tax_silva108_id":[],"tax_gg_id":[],"med_node_id":[],"otu_id":[]}}

}

