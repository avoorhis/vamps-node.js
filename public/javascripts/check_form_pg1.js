// visualization: check_form_pg1.js

var dataset_select_form = document.getElementById('dataset_select_form');
var unit_selection = document.getElementById('unit_selection');
if (typeof unit_selection !=="undefined") 
{
  unit_selection.addEventListener('click', function () {
    // alert('Hello world');
    check_viz_selection_pg1(dataset_select_form);
  });
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
