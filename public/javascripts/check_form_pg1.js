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
	  form = document.getElementById('dataset_select_form');
	  form.submit();
	// this message is replaced with a flash message when datasets are empty
	//msg = 'You must select some datasets';
    //checkbox_name = "dataset_ids[]";
    //check_form(dataset_select_form, msg, checkbox_name);
  });
}
