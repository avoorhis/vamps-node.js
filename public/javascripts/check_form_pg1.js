/* visualization: check_form_pg1.js
* CHECK_VIZ Page 1
* check if user has not selected any datasets.
* alerts and returns if not.
*/


var selection_btn_visuals = document.getElementById('selection_btn_visuals') || null;
var selection_btn_exports = document.getElementById('selection_btn_exports') || null;
var selection_btn_oligotyping = document.getElementById('selection_btn_oligotyping') || null;
var selection_btn_otus = document.getElementById('selection_btn_otus') || null;

if (selection_btn_visuals !== null)
{
  selection_btn_visuals.addEventListener('click', function () {

    //c = count_checked_datasets();
    
      dids = projectTree.getAllChecked();
      //alert(dids)
      if(dids){
          didArray = dids.split(',');
          var f = document.createElement("form");
          f.setAttribute('method',"post");
          f.setAttribute('action',"/visuals/unit_selection");
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'dataset_ids';
          input.value = JSON.stringify(didArray);
          f.appendChild(input);

          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'retain_data';
          input.value = '1';
          f.appendChild(input);
          
          var submit = document.createElement('input');
          submit.setAttribute('type', "submit");
          f.appendChild(submit);
          document.body.appendChild(f);

          f.submit();
          document.body.removeChild(f);
      }else{
          alert('Select some data');
          return;
      }
    
  });
}
if (selection_btn_exports !== null) 
{
  selection_btn_exports.addEventListener('click', function () {

  	//c = count_checked_datasets();
	  var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"/user_data/export_selection");

    //if(show_dataset_tree){
    dids = projectTree.getAllChecked();
      //alert(checked)
    if(dids){
          didArray = dids.split(',');
          
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'dataset_ids';
          input.value = JSON.stringify(didArray);
          f.appendChild(input);

          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'retain_data';
          input.value = '1';
          f.appendChild(input);

          var submit = document.createElement('input');
          submit.setAttribute('type', "submit");
          f.appendChild(submit);
          document.body.appendChild(f);

          f.submit();
          document.body.removeChild(f);
    }else{
          alert('Select some data');
          return;
    }

  });
}
if (selection_btn_oligotyping !== null) 
{
  selection_btn_oligotyping.addEventListener('click', function () {

    var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"/oligotyping/taxa_selection");
    //if(show_dataset_tree){
    dids = projectTree.getAllChecked();
    if(dids){
          didArray = dids.split(',');
          
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'dataset_ids';
          input.value = JSON.stringify(didArray);
          f.appendChild(input);

          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'retain_data';
          input.value = '1';
          f.appendChild(input);

          var submit = document.createElement('input');
          submit.setAttribute('type', "submit");
          f.appendChild(submit);
          document.body.appendChild(f);
          
          f.submit();
          document.body.removeChild(f);
    }else{
          alert('Select some data');
          return;
    }

  });
}
//
//
//
if (selection_btn_otus !== null) 
{
  selection_btn_otus.addEventListener('click', function () {

    var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"/otus/method_selection");
    //if(show_dataset_tree){
    dids = projectTree.getAllChecked();
    if(dids){
          didArray = dids.split(',');
          
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'dataset_ids';
          input.value = JSON.stringify(didArray);
          f.appendChild(input);

          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'retain_data';
          input.value = '1';
          f.appendChild(input);

          var submit = document.createElement('input');
          submit.setAttribute('type', "submit");
          f.appendChild(submit);
          document.body.appendChild(f);
          
          f.submit();
          document.body.removeChild(f);
    }else{
          alert('Select some data');
          return;
    }

  });
}
