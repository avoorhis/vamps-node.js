/* visualization: check_form_pg1.js
* CHECK_VIZ Page 1
* check if user has not selected any datasets.
* alerts and returns if not.
*/


//function initialize_form(){
var unit_selection_btn_exports = document.getElementById('unit_selection_btn_exports') || null;
var unit_selection_btn_visuals = document.getElementById('unit_selection_btn_visuals') || null;

if (unit_selection_btn_visuals !== null)
{
  unit_selection_btn_visuals.addEventListener('click', function () {

    //c = count_checked_datasets();
    //alert('show_dataset_tree')
    var form = document.getElementById('project_dataset_select_form');
    
      dids = projectTree.getAllChecked();
      //alert(checked)
      if(dids){
          didArray = dids.split(',');
          
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'dataset_ids';
          input.value = JSON.stringify(didArray);
          form.appendChild(input);

          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'retain_data';
          input.value = '1';
          form.appendChild(input);

          form.submit();
      }else{
          alert('Select some data');
          return;
      }
    
  });
}
if (unit_selection_btn_exports !== null) 
{
  unit_selection_btn_exports.addEventListener('click', function () {

  	//c = count_checked_datasets();
	  var form = document.getElementById('project_dataset_select_form');
    //if(show_dataset_tree){
      dids = projectTree.getAllChecked();
      //alert(checked)
      if(dids){
          didArray = dids.split(',');
          
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'dataset_ids';
          input.value = JSON.stringify(didArray);
          form.appendChild(input);

          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'retain_data';
          input.value = '1';
          form.appendChild(input);

          form.submit();
      }else{
          alert('Select some data');
          return;
      }

  });
}
//}
