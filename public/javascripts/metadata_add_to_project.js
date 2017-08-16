// toggle_metadata = document.getElementById('toggle_metadata') || null;
// if (toggle_metadata !== null) {
//   toggle_metadata.addEventListener('click', function () {
//       toggle_metadata_view();
//   });
// }

function get_metadata(project){
    //alert(project)
    args = {"project":project}	
    var xmlhttp = new XMLHttpRequest();	
    xmlhttp.open("POST", "/user_data/retrieve_metadata", true);
	xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
            var txt = xmlhttp.responseText
            //alert(txt)
            var response = JSON.parse(txt);
            var html = ''
            html += "<table border='1'>"
            
            //alert(response)
            if(response.hasOwnProperty('latitude')){
                datasets = Object.keys(response.latitude)
            }else{
                alert('No required metadata')
                return
            }
            // n=0
//             for(mditem in response){
//                 datasets = Object.keys(response[mditem])
//                 n += 1
//                 if(n == 1){
//                     continue
//                 }
//             }
            sorted_datasets = datasets.sort()
            sorted_keys = Object.keys(response).sort() 
            //alert(datasets)
            html += "<tr><th></th>"
            for(j in sorted_datasets){
                html += "<th>"+sorted_datasets[j]+"</th>"
            }
            html += "</tr>"
            n=0
            for(i in sorted_keys){
                mditem = sorted_keys[i]
                html += "<tr><td>"+mditem+"</td>"
                for(j in sorted_datasets){
                    ds = sorted_datasets[j]
                    value = response[mditem][ds]
                    html += "<td style='padding:2px;'>"+value+"</td>"
                }
                html += "</tr>"
                
            }
            html += '</table>'
            document.getElementById('metadata_table').innerHTML = html;
        }
    
    }
    xmlhttp.send(JSON.stringify(args));
    
}