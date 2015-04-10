
save_datasets_btn = document.getElementById('save_datasets_btn');
if (typeof save_datasets_btn !=="undefined") {
  save_datasets_btn.addEventListener('click', function () {
      save_datasets_list(ds_local,user_local);
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
		 	document.getElementById('save_ds_result').innerHTML = 'Saved'
		 }else{
		 	document.getElementById('save_ds_result').innerHTML = 'Not Saved'
		 }
       }
    };
    xmlhttp.send(args);
 	
}