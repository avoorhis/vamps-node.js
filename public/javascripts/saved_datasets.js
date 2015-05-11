
var view_array = document.getElementsByName('view_array[]');
//alert(view_array[0].value)
for(i = 0; i < view_array.length; i++){
	val = view_array[i];
	//alert(val)

}

function view_datasets_ajax( filename, user, fxn ){
	
        
		args  = 'filename='+filename;
		args += '&user='+user;
		args += '&fxn='+fxn;
		var xmlhttp = new XMLHttpRequest();
	    xmlhttp.open("POST", "/visuals/view_saved_datasets", true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	    xmlhttp.onreadystatechange = function() {

	       if (xmlhttp.readyState == 4 ) {
				var data = xmlhttp.responseText;
				obj = JSON.parse(data);
				dataset_ids = obj.ids;
				var html = "<div class='auto_height200 border1'>"
				html += "<form id='' name='' method='POST' action='unit_selection'>"
				html += "<button type='submit' class='btn btn-xs btn-primary'>use these in visualizations</button>"
				html += "<input type='hidden' name='search' value='1' >"
				html += "<input type='hidden' name='dataset_ids' value='"+ JSON.stringify(dataset_ids)+"' >"
				html += "</form>"
				
				html += "<table class='small_font table table-condensed' >";
			 	html += '<tr><td></td><th>SampleID</th><th>project--dataset</th></tr>';
 				
 			for( var i in obj.ids ){
 				var id =  obj.ids[i];
 				var dsname = obj.names[i];
 				html += '<tr><td>'+i.toString()+'</td><td>'+id+'</td><td>'+dsname+'</td></tr>';
		
 			}
 			html += '</table></div>';
			 document.getElementById(filename+"_div").innerHTML=html;
	       }
	    };
	    xmlhttp.send(args);
}

