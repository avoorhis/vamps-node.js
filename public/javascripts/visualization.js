// visualization.js

document.getElementById('toggle_taxa_btn').addEventListener('click', function () {
    toggle_simple_taxa();
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
function get_requested_units_selection_box(file_id) {
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
  if(unit_selection === 'tax_silva108_simple') {
    // check for domains[].length must be > 0
    domain_names = thisform["domains[]"];
    msg = '1) You must select some taxa';
    for (i=0; i<domain_names.length; i++)
    {
      if (domain_names[i].checked) {
        valid = true;
      }
    }
  }else if(unit_selection === 'tax_silva108_custom'){
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









