
selection_btn_visuals = document.getElementById('selection_btn_visuals') || null;
if (selection_btn_visuals !== null) {
  selection_btn_visuals.addEventListener('click', function () {
        
        // get selected matrix
        radios = document.getElementsByName('otu')
        selected_id = 0
        for(r in radios){
            if(radios[r].checked == true){
                selected_id = radios[r].id
            }
        }
        if(selected_id > 0){
            
          var f = document.createElement("form");
          f.setAttribute('method',"post");
          f.setAttribute('action',"view_selection");
          var input = document.createElement('input');
         
          input.type = 'hidden';
          input.name = 'otu_id';
          input.value = selected_id;
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

function delete_project(method,code){
	var resp = confirm('are you sure?')
	if(resp){
		//alert('good',resp)
		var xmlhttp = new XMLHttpRequest();
	  xmlhttp.open("GET", "/otus/delete/" + method + '/' + code, true);
    xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = xmlhttp.responseText;
            // if(response=='OK')
            document.getElementById(code).style.display = 'none';

          }
    }
	  xmlhttp.send();
	}else{
		return
	}

}
//
//
//
function adjust_radios(method){
  // unselect all
  document.getElementById('ref_otu_size3').checked = false
  document.getElementById('ref_otu_size6').checked = false
  document.getElementById('ref_otu_size9').checked = false
  document.getElementById('ucl_otu_size3').checked = false
  document.getElementById('ucl_otu_size6').checked = false
  document.getElementById('ucl_otu_size9').checked = false
  document.getElementById('slp_otu_size3').checked = false
  document.getElementById('slp_otu_size6').checked = false
  document.getElementById('slp_otu_size9').checked = false
  document.getElementById('crp_otu_size3').checked = false
  document.getElementById('crp_otu_size6').checked = false
  switch(method){
      case 'closed_ref':
            document.getElementById('ref_otu_size3').disabled = false
            document.getElementById('ref_otu_size6').disabled = false
            document.getElementById('ref_otu_size9').disabled = false
            document.getElementById('ref_otu_size3').checked = true // check first
            document.getElementById('ucl_otu_size3').disabled = true
            document.getElementById('ucl_otu_size6').disabled = true
            document.getElementById('ucl_otu_size9').disabled = true
            document.getElementById('slp_otu_size3').disabled = true
            document.getElementById('slp_otu_size6').disabled = true
            document.getElementById('slp_otu_size9').disabled = true
            document.getElementById('crp_otu_size3').disabled = true
            document.getElementById('crp_otu_size6').disabled = true
            break;
      case 'uclust':
            document.getElementById('ref_otu_size3').disabled = true
            document.getElementById('ref_otu_size6').disabled = true
            document.getElementById('ref_otu_size9').disabled = true
            document.getElementById('ucl_otu_size3').disabled = false
            document.getElementById('ucl_otu_size6').disabled = false
            document.getElementById('ucl_otu_size9').disabled = false
            document.getElementById('ucl_otu_size3').checked = true // check first
            document.getElementById('slp_otu_size3').disabled = true
            document.getElementById('slp_otu_size6').disabled = true
            document.getElementById('slp_otu_size9').disabled = true
            document.getElementById('crp_otu_size3').disabled = true
            document.getElementById('crp_otu_size6').disabled = true
            break;
      case 'slp':
            document.getElementById('ref_otu_size3').disabled = true
            document.getElementById('ref_otu_size6').disabled = true
            document.getElementById('ref_otu_size9').disabled = true
            document.getElementById('ucl_otu_size3').disabled = true
            document.getElementById('ucl_otu_size6').disabled = true
            document.getElementById('ucl_otu_size9').disabled = true
            document.getElementById('slp_otu_size3').disabled = false
            document.getElementById('slp_otu_size6').disabled = false
            document.getElementById('slp_otu_size9').disabled = false
            document.getElementById('slp_otu_size3').checked = true // check first
            document.getElementById('crp_otu_size3').disabled = true
            document.getElementById('crp_otu_size6').disabled = true
            break;
      case 'crop':
            document.getElementById('ref_otu_size3').disabled = true
            document.getElementById('ref_otu_size6').disabled = true
            document.getElementById('ref_otu_size9').disabled = true
            document.getElementById('ucl_otu_size3').disabled = true
            document.getElementById('ucl_otu_size6').disabled = true
            document.getElementById('ucl_otu_size9').disabled = true
            document.getElementById('slp_otu_size3').disabled = true
            document.getElementById('slp_otu_size6').disabled = true
            document.getElementById('slp_otu_size9').disabled = true
            document.getElementById('crp_otu_size3').disabled = false
            document.getElementById('crp_otu_size6').disabled = false
            document.getElementById('crp_otu_size3').checked = true // check first
            break;
      default:
            // ERROR
  }



}

function load_otu_list(){


var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", "/otus/load_otu_list", true);
    xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = xmlhttp.responseText;
            //console.log(response)
            document.getElementById('otus_select_div').innerHTML = response

          }
    }
	xmlhttp.send();
}