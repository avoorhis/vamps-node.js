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

  	//c = count_checked_datasets();
  	//alert(c)
	  // this message is replaced with a flash message when datasets are empty
	//msg = 'You must select some datasets';
    //checkbox_name = "dataset_ids[]";
    // ds = document.getElementsByClassName('dataset_check');
    dids = projectTree.getAllChecked();
    //alert(checked)
    if(dids){
        didArray = dids.split(',');
        form = document.getElementById('dataset_select_form');
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

return;
  //   var im_checked = 0;
  //   $('.dataset_check').each(function(){
  //    	var input = $(this);
  //    	if(input.prop('checked') == true){
  //    		im_checked += 1;
  //    	}
  //   })

  //   if(im_checked){
	 //  		form = document.getElementById('dataset_select_form');
	 //  		form.submit();
		// }else{
		// 		alert('Select some data');
		// 		return;
		// }
	
    //check_form(dataset_select_form, msg, checkbox_name);
  });
}
