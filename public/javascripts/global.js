// global.js

// $(document).ready(function(){
//     $('a.back').click(function(){
//         parent.history.back();
//         return false;
//     });
// });



function is_checked(id_names)
{
  return $('input[name="'+id_names+'"]:checked').length > 0; 
}

function check_form(select_form, msg, checkbox_name)
{
  var my_check = false;
  my_check = is_checked(checkbox_name);
  my_check ? select_form.submit() : alert(msg);
  return my_check;
}

function show_post_array(body) {

  //if (ENV.development){
    document.getElementById('DEBUG_div').style.border='1px solid red';
    document.getElementById('DEBUG_div').style.padding ='3px';
    document.getElementById('DEBUG_div').style.height ='100px';
    document.getElementById('DEBUG_div').style.overflow ='auto';
    document.getElementById('DEBUG_div').innerHTML = body;
  //}
}


// $(document).ready(function(){
//     $('#save_order_btn').click(function(){
        
//         table = document.getElementById('drag_table');
//         var new_ds_order = []
//         var i;
//         for (i = 0; i < table.rows.length; i++) {
//           new_ds_order.push(table.rows[i].cells[0].id);
//         }
//         return false;
//     });
// });