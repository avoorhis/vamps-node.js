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


function compareStrings_alpha(a, b) {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};