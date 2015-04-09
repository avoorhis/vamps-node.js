
var view_array = document.getElementsByName('view_array[]');
//alert(view_array[0].value)
for(i = 0; i < view_array.length; i++){
	val = view_array[i];
	//alert(val)

}

function sendAjaxUseOrView( filename, user, fxn ){
	
        
		args ='filename='+filename;
		args += '&user='+user;
		args += '&fxn='+fxn;
		var xmlhttp = new XMLHttpRequest();
	    xmlhttp.open("POST", "/visuals/useview_saved_datasets", true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	    xmlhttp.onreadystatechange = function() {

	       if (xmlhttp.readyState == 4 ) {
				var data = xmlhttp.responseText;
				obj = JSON.parse(data);
				dataset_ids = obj.ids;
				var html = "<div class='auto_height200 border1'>"
				html += "<form id='' name='' method='POST' action='unit_selection'>"
				html += "<input type='submit' value='use in visualizations' />"
				html += "<input type='hidden' name='search' value='1' >"
				html += "<input type='hidden' name='dataset_ids' value='"+ JSON.stringify(dataset_ids)+"' >"
				html += "</form>"
				html += "<table class='small_font'>";
			 	html += '<tr><th>SampleID</th><th>project--dataset</th></tr>';
 		
 			for( var i in obj.ids ){
 				var id =  obj.ids[i];
 				var dsname = obj.names[i];
 				html += '<tr><td>'+id+'</td><td>'+dsname+'</td></tr>';
		
 			}
 			html += '</table></div>';
			 document.getElementById(filename+"_div").innerHTML=html;
	       }
	    };
	    xmlhttp.send(args);
}

