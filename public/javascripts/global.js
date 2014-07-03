// global.js


function show_post_array(body) {

  //if(ENV.development){
  	document.getElementById('DEBUG_div').style.border='1px solid red';
  	document.getElementById('DEBUG_div').style.padding ='3px';
  	document.getElementById('DEBUG_div').style.height ='100px';
  	document.getElementById('DEBUG_div').style.overflow ='auto';
    document.getElementById('DEBUG_div').innerHTML = body;
  //}
}