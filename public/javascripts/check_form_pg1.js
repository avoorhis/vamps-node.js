/* visualization: check_form_pg1.js
* CHECK_VIZ Page 1
* check if user has not selected any datasets.
* alerts and returns if not.
*/

var dataset_select_form = document.getElementById('dataset_select_form');
var unit_selection = document.getElementById('unit_selection');
if (typeof unit_selection !=="undefined") 
{
  unit_selection.addEventListener('click', function () {
    // alert('Hello world');
    msg = 'You must select some datasets';
    checkbox_name = "dataset_ids[]";
    check_form(dataset_select_form, msg, checkbox_name);
    // check_viz_selection_pg1(dataset_select_form);
  });
}

function is_checked(id_names)
{
  return $('input[name="'+id_names+'"]:checked').length > 0; 
}

function check_form(select_form, msg, checkbox_name)
{
  var my_check = false;
  my_check = is_checked(checkbox_name);
  my_check ? select_form.submit() : alert(msg);
  return;
}

// 
// //
// // CHECK_VIZ Page 1
// //
// function check_viz_selection_pg1(thisform) {
//   // simple function to check if user has not selected any datasets.
//   // alerts and returns if not.
//   var x = thisform["dataset_ids[]"];
//   var gotone = false;
//   for (var i=0; i<x.length; i++)
//   {
//       if (x[i].checked) {
//         gotone = true;
//       }
//   }
//   if (gotone){
//     thisform.submit();
//   } else {
//     alert('You must select some datasets');
//     return;
//   }
// }
