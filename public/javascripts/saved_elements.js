
var view_array = document.getElementsByName('view_array[]');
//alert(view_array[0].value)
for(i = 0; i < view_array.length; i++){
	val = view_array[i];
	//alert(val)

}

function view_datasets_ajax( filename, user, fxn ){
	
        
		var args  = 'filename='+filename;
		args += '&user='+user;
		args += '&fxn='+fxn;
		var xmlhttp = new XMLHttpRequest();
		//var btn = document.getElementById(filename+'_open_btn_id')
		//value = btn.value
		
    xmlhttp.open("POST", "/visuals/view_saved_datasets", true);
	  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {

		    if (xmlhttp.readyState == 4 ) {
					var data = xmlhttp.responseText;
					obj = JSON.parse(data);
					dataset_ids = obj.ids;
					//alert(dataset_ids)
					tree_data = get_data_for_tree(obj);
					//alert(JSON.stringify(tree_data))
					var html = "<div class='auto_height200 border1'><table><tr>";
					html += "<td>Visuals:</td>";
					
					html += "<td><form id='' name='' method='POST' action='visuals_index'>";
					html += "<button type='submit' class='btn btn-xs btn-link'>TreeSelect</button>";					
					html += "<input type='hidden' name='data_to_open' value='"+ JSON.stringify(tree_data)+"' >";
					html += "</form></td>";

					html += "<td><form id='' name='' method='POST' action='unit_selection'>";
					html += "<button type='submit' class='btn btn-xs btn-link'>UnitSelect</button>";					
					html += "<input type='hidden' name='retain_data' value='1' >";
					html += "<input type='hidden' name='dataset_ids' value='"+ JSON.stringify(dataset_ids)+"' >";
					html += "</form></td>";

					html += "<td>Exports:</td>";

					html += "<td><form id='' name='' method='POST' action='../user_data/export_data'>";
					html += "<button type='submit' class='btn btn-xs btn-link'>TreeSelect</button>";					
					html += "<input type='hidden' name='data_to_open' value='"+ JSON.stringify(tree_data)+"' >";
					html += "</form></td>"

					html += "<td><form id='' name='' method='POST' action='../user_data/export_selection'>";			
					html += "<button type='submit' class='btn btn-xs btn-link'>UnitSelect</button>";
					html += "<input type='hidden' name='retain_data' value='1' >";
					html += "<input type='hidden' name='dataset_ids' value='"+ JSON.stringify(dataset_ids)+"' >";
					html += "</form></td></tr></table>"
				
					html += "<table class='small_font table table-condensed' >";
				 	html += '<tr><td></td><th>SampleID</th><th>project--dataset</th></tr>';
					
		 			for( var i in obj.ids ){
		 				var id =  obj.ids[i];
		 				var dsname = obj.names[i];
		 				html += '<tr><td>'+(parseInt(i)+parseInt(1)).toString()+'</td><td>'+id+'</td><td>'+dsname+'</td></tr>';
		 			}
		 			html += '</table></div>';
					document.getElementById(filename+"_div").innerHTML=html;
					document.getElementById(filename+'_open_btn_id').innerHTML = 'toggle open <span class="caret"></span>'

		    }
    };
    xmlhttp.send(args);
	
}
function get_data_for_tree(file_json) {
	//					{"ids":["1720","1719","1715","1714","1716","1717","1721","1718"],
	//					"names":["ICM_ABR_Bv6--ABR_0001_2005_01_02","ICM_ABR_Bv6--ABR_0003_2005_01_02","ICM_ABR_Bv6--ABR_0005_2005_01_07","ICM_ABR_Bv6--ABR_0007_2005_01_07","ICM_ABR_Bv6--ABR_0009_2005_01_30","ICM_ABR_Bv6--ABR_0011_2005_01_30","ICM_ABR_Bv6--ABR_0013_2005_02_26","ICM_ABR_Bv6--ABR_0015_2005_02_26"]}
	// convert to pjname = [did list]
	projects = {}
	for(i in file_json.names){
		p = file_json.names[i].split('--')[0];
		if(projects.hasOwnProperty(p)){
			projects[p].push(parseInt(file_json.ids[i]));
		}else{
			projects[p] = [parseInt(file_json.ids[i])]
		}
	}
	return projects;

}

// function view_datasets_ajax2( filename, user, fxn ){
	
        
// 		var args  = 'filename='+filename;
// 		args += '&user='+user;
// 		args += '&fxn='+fxn;
// 		var xmlhttp = new XMLHttpRequest();
// 		//var btn = document.getElementById(filename+'_open_btn_id')
// 		//value = btn.value
		
//     xmlhttp.open("POST", "/visuals/view_saved_datasets", true);
// 	  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
//     xmlhttp.onreadystatechange = function() {

// 		    if (xmlhttp.readyState == 4 ) {
// 					var data = xmlhttp.responseText;
// 					obj = JSON.parse(data);
// 					dataset_ids = obj.ids;
// 					alert(dataset_ids)
				
// 					var f = document.createElement("form");
// 					f.setAttribute('method',"POST");
// 					f.setAttribute('action',"unit_selection");

// 					var i1 = document.createElement("input"); //input element, text
// 					i1.setAttribute('type',"hidden");
// 					i1.setAttribute('name',"retain_data");
// 					i1.setAttribute('value',"1");


// 					var i2 = document.createElement("input"); //input element, text
// 					i2.setAttribute('type',"hidden");
// 					i2.setAttribute('name',"dataset_ids");
// 					i2.setAttribute('value',JSON.stringify(dataset_ids));


// 					var s = document.createElement("input"); //input element, Submit button
// 					s.setAttribute('type',"submit");
// 					s.setAttribute('value',"Submit");

// 					f.appendChild(i1);
// 					f.appendChild(i12);
// 					f.appendChild(s);
// 					f.submit();
// 					// var html = "<div class='auto_height200 border1'><table><tr><td>"
// 					// html += "<form id='' name='' method='POST' action='unit_selection'>"
// 					// html += "<button type='submit' class='btn btn-xs btn-primary'>use these in visualizations</button>";					
// 					// html += "<input type='hidden' name='retain_data' value='1' >"
// 					// html += "<input type='hidden' name='dataset_ids' value='"+ JSON.stringify(dataset_ids)+"' >"
// 					// html += "</form></td>"

// 					// html += "<td><form id='' name='' method='POST' action='../user_data/export_selection'>"					
// 					// html += " <button type='submit' class='btn btn-xs btn-primary'>use these in exports</button>"
// 					// html += "<input type='hidden' name='retain_data' value='1' >"
// 					// html += "<input type='hidden' name='dataset_ids' value='"+ JSON.stringify(dataset_ids)+"' >"
// 					// html += "</form></td></tr></table>"
				
// 					// html += "<table class='small_font table table-condensed' >";
// 				 // 	html += '<tr><td></td><th>SampleID</th><th>project--dataset</th></tr>';
					
// 		 		// 	for( var i in obj.ids ){
// 		 		// 		var id =  obj.ids[i];
// 		 		// 		var dsname = obj.names[i];
// 		 		// 		html += '<tr><td>'+(parseInt(i)+parseInt(1)).toString()+'</td><td>'+id+'</td><td>'+dsname+'</td></tr>';
// 		 		// 	}
// 		 		// 	html += '</table></div>';
// 					// document.getElementById(filename+"_div").innerHTML=html;
// 					// document.getElementById(filename+'_open_btn_id').innerHTML = 'toggle open <span class="caret"></span>'

// 		    }
//     };
//     xmlhttp.send(args);
	
// }
