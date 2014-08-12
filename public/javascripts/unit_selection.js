// visualization: unit_selection.js

toggle_taxa_btn = document.getElementById('toggle_taxa_btn');
if (typeof toggle_taxa_btn !=="undefined") {
  toggle_taxa_btn.addEventListener('click', function () {
      toggle_simple_taxa();
  });
}

$(document).ready(function(){
    $("#unit_selection_name").on("change", get_requested_units_selection_box);
});

//
// TOGGLE_SIMPLE_TAXA
//
function toggle_simple_taxa()
{
  // page: unit_selection
  // units: taxonomy
  // toggles domain checkboxes on/off
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
// GET REQUESTED UNITS SELECTION BOX
//
function get_requested_units_selection_box() {
  var file_id = this.value;  
  // Using ajax it will show the requested units module
  var file = '';
  var partial_name = '/visuals/partials/'+file_id;
  //alert(partial_name)
  var xmlhttp = new XMLHttpRequest();
  
  xmlhttp.open("GET", partial_name);
  xmlhttp.onreadystatechange = function() {
    
         if (xmlhttp.readyState == 4 ) {
           var string = xmlhttp.responseText;
           
           var div = document.getElementById('units_select_div').innerHTML = string;
         }
  };
  xmlhttp.send();

}

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
// CHECK_VIZ Page 2 (visuals/unit_selection)
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

