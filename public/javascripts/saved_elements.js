
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
					dataset_ids = [];
					line_data = ''
		 			for( var i in obj ){
		 				var did =  obj[i].did;
		 				var dsname = obj[i].name;
		 				line_data += '<tr><td>'+(parseInt(i)+parseInt(1)).toString()+'</td><td>'+did+'</td><td>'+dsname+'</td></tr>';
		 				dataset_ids.push(did)
		 			}
					//alert(dataset_ids)
					tree_data = get_data_for_tree(obj);
					//alert(JSON.stringify(tree_data))
					var html = "<div class='auto_height200 border1'><table><tr>";
					html += "<td>Load data into page:</td>";
					
					html += "<td><form id='' name='' method='POST' action='visuals_index'>";
					html += "<button type='submit' class='btn btn-xs btn-link'>Tree Selection</button>";					
					html += "<input type='hidden' name='data_to_open' value='"+ JSON.stringify(tree_data)+"' >";
					html += "</form></td>";

					html += "<td><form id='' name='' method='POST' action='unit_selection'>";
					html += "or <button type='submit' class='btn btn-xs btn-link'>Unit Selection</button>";					
					html += "<input type='hidden' name='retain_data' value='1' >";
					html += "<input type='hidden' name='dataset_ids' value='"+ JSON.stringify(dataset_ids)+"' >";
					html += "</form></td>";

					
					html += "</tr></table>"
				
					html += "<table class='small_font table table-condensed' >";
				 	html += '<tr><td></td><th>SampleID</th><th>project--dataset</th></tr>';
					html += line_data					
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
	// NEW
	// [{"did":"339906","name":"AB_HGB1_Bv6v4--HGB_0005_2"},{"did":"339907","name":"AB_HGB1_Bv6v4--HGB_0014_2"},
	//{"did":"339908","name":"AB_HGB1_Bv6v4--HGB_0020"},{"did":"339909","name":"AB_HGB1_Bv6v4--HGB_0021"},{"did":"339910","name":"AB_HGB1_Bv6v4--HGB_0022"},{"did":"339911","name":"AB_HGB1_Bv6v4--HGB_0023"},
	//{"did":"339912","name":"AB_HGB1_Bv6v4--HGB_0024"},{"did":"339913","name":"AB_HGB1_Bv6v4--HGB_0025"}
	projects = {}
	for(i in file_json){
		var pj = file_json[i].name.split('--')[0];
		if(projects.hasOwnProperty(pj)){
			projects[pj].push( parseInt(file_json[i].did) );
		}else{
			projects[pj] = [ parseInt(file_json[i].did) ]
		}
	}
	return projects;

}
function load_configuration(filename) {
		var args  = 'filename='+filename;
		//args += '&user='+user;
		args += '&from_configuration_file=1';
		var xmlhttp = new XMLHttpRequest();
		//var btn = document.getElementById(filename+'_open_btn_id')
		//value = btn.value
    xmlhttp.open("POST", "/visuals/view_selection", true);
	  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  //   xmlhttp.onreadystatechange = function() {

		//     if (xmlhttp.readyState == 4 ) {
		// 			//var data = xmlhttp.responseText;
		// 		}
		// };
		xmlhttp.send(args);
}
//
//
//
function cancel_rename(oldfile, datatype) {
	var originaltext = "<button id='' class='btn btn-xs btn-link' onclick=\"rename_file('"+oldfile+"','"+datatype+"')\">rename</button>"
	
	var rename_div = document.getElementById('rename_div')
	rename_div.style.border = "0"
	rename_div.innerHTML = originaltext
	
}
function update_file_name(oldfile, datatype) {
	var rename_div = document.getElementById('rename_div')
	var form = document.getElementById('rename_file_form')
	
	//console.log(form)
	var newfile_edit = document.getElementById('new_file_txt').value.replace(/ /g,'').replace(/\./g,'')
	var test = isValidIdSelector(newfile_edit)
	if(test){
		//console.log(test)
		//console.log(newfile_edit)
		var newfile = 'datasets-'+newfile_edit+'.json'
		if(newfile == oldfile){
			cancel_rename(oldfile, datatype)
			return
		}
		var originaltext = "<button id='' class='btn btn-xs btn-link' onclick=\"rename_file('"+newfile+"','"+datatype+"')\">rename</button>"
	
		var e1 = document.createElement("input"); //input element, text
		e1.setAttribute('type',"hidden");
		e1.setAttribute('name',"newfilename");
		e1.setAttribute('value',newfile);
		form.appendChild(e1);
		var e2 = document.createElement("input"); //input element, text
		e2.setAttribute('type',"hidden");
		e2.setAttribute('name',"oldfilename");
		e2.setAttribute('value',oldfile);
		form.appendChild(e2);
		form.submit()
	
		// the following is redundant as the page reloads - but thats okay
		var filenameplace = document.getElementById(oldfile)
		filenameplace.innerHTML = newfile
		rename_div.style.border = "0"
		rename_div.innerHTML = originaltext
	}else{
	   alert('No Special Characters Allowed in Filenames')
	}
	
}
function isValidIdSelector(str) {
    var regex = new RegExp(/^[A-Za-z0-9_]*$/gm);  // no special chars
    return regex.test(str);
};
function rename_file(oldfile, datatype) {
	if(datatype == 'datasets'){
	  var maxchars = '30' 
	  var rename_div = document.getElementById('rename_div')
	  rename_div.style.border = "1px solid black"
	  var txtbox = "<form id='rename_file_form' method='POST' action='rename_datasets_file' \">"
	  var name1 = 'datasets-'
	  var name2 = oldfile.split('.')[0].split('-')[1]
 	  var name3 = '.json'
 	  txtbox += name1+"<input id='new_file_txt' type='text' size='"+name2.length+"' maxlength='"+maxchars+"' value='"+name2+"' />"+name3
 	  
 	  txtbox += "<br>Max "+maxchars+" characters --  <span style='padding-left:5px;'>"
 	  txtbox += "<input type='button' style='width:50px' class='btn btn-xs btn-primary' value='cancel' onclick=\"cancel_rename('"+oldfile+"','"+datatype+"')\">"
 	  txtbox += " <input type='button' style='width:50px' class='btn btn-xs btn-primary' value='enter' onclick=\"update_file_name('"+oldfile+"','"+datatype+"')\">"
 	  
 	  txtbox += '</span></form>'
 	
 	  rename_div.innerHTML = txtbox
	
	
	}
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
