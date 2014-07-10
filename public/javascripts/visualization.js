

// visualization.js


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
// CHECK_VIZ Page 1
//
function check_viz_selection_pg1(thisform) {
  // simple function to check if user has not selected any datasets.
  // alerts and returns if not.
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
  // simple function to check if user has not selected any visuals.
  // alerts and returns if not.
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









