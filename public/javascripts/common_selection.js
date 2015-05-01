


var save_datasets_btn = document.getElementById('save_datasets_btn');
if (typeof save_datasets_btn !=="undefined") {
  save_datasets_btn.addEventListener('click', function () {
	  save_datasets_list(ds_local,user_local);
  });
}
var reorder_datasets_btn = document.getElementById('reorder_datasets_btn');
if (typeof reorder_datasets_btn !=="undefined") {
  reorder_datasets_btn.addEventListener('click', function () {
	  window.location='reorder_datasets';
	  // form = 
  });
}
var change_datasets_btn = document.getElementById('change_datasets_btn');
if (typeof change_datasets_btn !=="undefined") {
  change_datasets_btn.addEventListener('click', function () {
      
	  window.location='index_visuals';
  });
}

//
// SAVE DATASET LIST
//
var save_datasets_list = function(ds_local, user)
{
	
    var timestamp = +new Date();  // millisecs since the epoch!
    
	var filename = user + '_datasets_' + timestamp + '.json';
    
    var args =  "datasets="+JSON.stringify(ds_local);
    args += "&filename="+filename;
    args += "&user="+user;
	//console.log('args '+args);
	var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", 'save_datasets', true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {

       if (xmlhttp.readyState == 4 ) {
         var response = xmlhttp.responseText;
		 //alert(string);
		 if(response == 'OK'){
		 	document.getElementById('save_ds_result').innerHTML = "Saved as: <a href='saved_datasets'>"+ filename+ "</a>"
		 }else{
		 	document.getElementById('save_ds_result').innerHTML = 'Problem: Not Saved'
		 }
       }
    };
    xmlhttp.send(args);
 	
}