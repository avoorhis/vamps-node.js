// toggle_metadata = document.getElementById('toggle_metadata') || null;
// if (toggle_metadata !== null) {
//   toggle_metadata.addEventListener('click', function () {
//       toggle_metadata_view();
//   });
// }

function get_metadata(project){
    //alert(project)
    document.getElementById('save_btn').disabled = true;
    document.getElementById('save_btn').style.visibility = 'hidden';
    if(project == 'Select Project'){
        document.getElementById('metadata_table').innerHTML = '';
        document.getElementById('edit_btn').disabled = true;
        document.getElementById('edit_btn').style.visibility = 'hidden';
        return
    }
    document.getElementById('edit_btn').disabled = false;
    document.getElementById('edit_btn').style.visibility = 'visible';
    
    args = {"project":project}	
    var xmlhttp = new XMLHttpRequest();	
    xmlhttp.open("POST", "/user_data/retrieve_metadata", true);
	xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
            var txt = xmlhttp.responseText
            //alert(txt)
            //GLOBAL
            response = JSON.parse(txt);
            var html = '<br>'
            
           //  html += "<select>"
//             //alert(tg)
//             for(target_gene_id in tg){
//              html += '<option>'+tg[target_gene_id]+'</option>'
//             }
//             html += "</select>"
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
                if(reqfields.indexOf(mditem) == -1){ 
                    html += "<tr><td>"+mditem+"</td>"
                }else{
                    html += "<tr><td>"+mditem+"*</td>"
                }
                for(j in sorted_datasets){
                    ds = sorted_datasets[j]
                    value = response[mditem][ds]
                    html += "<td style='padding:0 2px;'>"+value+"</td>"
                }
                html += "</tr>"
                
            }
            html += '</table>'
            document.getElementById('metadata_table').innerHTML = html;
        }
    
    }
    xmlhttp.send(JSON.stringify(args));
    
}
//
//
//
function edit_form(){
    //alert(loc['8840'])
    //alert('8840')
    project = document.getElementById('project_select_id').value;
    table_data = response
    document.getElementById('save_btn').disabled = false;
    document.getElementById('save_btn').style.visibility = 'visible';
    document.getElementById('edit_btn').disabled = true;
    document.getElementById('edit_btn').style.visibility = 'hidden';
    var html = ''
            html += " <input type='button' id='dlt_btn' onclick='delete_checked()' Value='Delete Checked' >"
            html += "<br><table id='md_table' border='1'>"
            //alert(response)
            if(response.hasOwnProperty('latitude')){
                datasets = Object.keys(response.latitude)
            }else{
                alert('No required metadata')
                return
            }
            sorted_datasets = datasets.sort()
            sorted_keys = Object.keys(response).sort() 
            //alert(datasets)
            html += "<tr><th></th><th></th>"
            for(j in sorted_datasets){
                html += "<th id='"+sorted_datasets[j]+"'>"+sorted_datasets[j]+"</th>"
            }
            html += "</tr>"
            n=0
            for(i in sorted_keys){
                mditem = sorted_keys[i]
                //alert(' mdi '+mditem)
                html += "<tr id='"+mditem+"'><td style='padding:0 2px;'>"
                if(reqfields.indexOf(mditem) == -1){ 
                    html += "<input class='del_ck' type='checkbox'  value='"+mditem+"'>"
                    html += "</td><td>"+mditem+"</td>"
                }else{
                    html += "<input disabled class='del_ck' type='checkbox' value='"+mditem+"'></td><td>"+mditem+"*</td>"
                }
                for(j in sorted_datasets){
                    ds = sorted_datasets[j]
                    value = response[mditem][ds]
                    
                    selid = mditem+'_id_'+ds
                    html += "<td style=''>"
                    if(mditem == 'geo_loc_name'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"  
                        for(i in loc){
                            line = "<option value='"+loc[i].id+"'>"+loc[i].name+'</option>'
                            if(loc[i].name == value){                               
                              line = "<option selected value='"+loc[i].id+"'>"+loc[i].name+'</option>'                           
                             }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'env_material'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"  
                        for(id in mat){
                            line = "<option value='"+id+"'>"+mat[id]+'</option>'
                            if(mat[id] == value){                               line = "<option selected value='"+id+"'>"+mat[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'env_feature'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"  
                        for(id in feat){
                            line = "<option value='"+id+"'>"+feat[id]+'</option>'
                            if(feat[id] == value){                               line = "<option selected value='"+id+"'>"+feat[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'env_biome'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in biom){
                           line = "<option value='"+id+"'>"+biom[id]+'</option>'
                           if(biom[id] == value){                               line = "<option selected value='"+id+"'>"+biom[id]+'</option>'                           }
                           tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'target_gene'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"  
                        for(id in tg){
                            line = "<option value='"+id+"'>"+tg[id]+'</option>'
                            if(tg[id] == value){                               line = "<option selected value='"+id+"'>"+tg[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'domain'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in dom){
                           line = "<option value='"+id+"'>"+dom[id]+'</option>'
                           if(dom[id] == value){                               line = "<option selected value='"+id+"'>"+dom[id]+'</option>'                           }
                           tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'dna_region'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in dnareg){
                            line = "<option value='"+id+"'>"+dnareg[id]+'</option>'
                            if(dnareg[id] == value){                               line = "<option selected value='"+id+"'>"+dnareg[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'adapter_sequence'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in adap){
                            line = "<option value='"+id+"'>"+adap[id]+'</option>'
                            if(adap[id] == value){                               line = "<option selected value='"+id+"'>"+adap[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'illumina_index'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in ii){
                            line = "<option value='"+id+"'>"+ii[id]+'</option>'
                            if(ii[id] == value){ line = "<option selected value='"+id+"'>"+ii[id]+'</option>'                           }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'sequencing_platform'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in seqplat){
                            line = "<option value='"+id+"'>"+seqplat[id]+'</option>'
                            if(seqplat[id] == value){                               line = "<option selected value='"+id+"'>"+seqplat[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'run'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in run){
                            line = "<option value='"+id+"'>"+run[id]+'</option>'
                            if(run[id] == value){                                   line = "<option selected value='"+id+"'>"+run[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'primer_suite'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in ps){
                            line = "<option value='"+id+"'>"+ps[id].name+'</option>'
                            if(ps[id].name == value){                               line = "<option selected value='"+id+"'>"+ps[id].name+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'env_package'){
                        
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in env_pack){
                            line = "<option value='"+id+"'>"+env_pack[id]+'</option>'
                            if(env_pack[id] == value){                               line = "<option selected value='"+id+"'>"+env_pack[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else{
                        html += "<input id='"+selid+"' type='text' value='"+value+"' >"
                    }
                    html += "</td>"
                }

                html += "</tr>"
            }
            html += '</table>'
            //alert(html)
            document.getElementById('metadata_table').innerHTML = html;
}
//
//
//
function save_form(){
    
    var project = document.getElementById('project_select_id').value;
    var table = document.getElementById("md_table");
    //alert('not yet: '+project)
    var collector = {}
    var dataset_row = table.rows[0]
    var datasets = [] // two placeholders!!
    for (var j = 0, col; col = dataset_row.cells[j]; j++) {
        if(col.innerHTML != ''){
            datasets.push(col.id)
        }
    }
    console.log(datasets)
    for(var i = 1, row; row = table.rows[i]; i++){  // skip row zero
        collector[row.id] = {}
        
        for (var j = 2, col; col = row.cells[j]; j++) { // skip col zero and one
            ds_index = j - 2
            console.log(row.col)
            collector[row.id][datasets[ds_index]] = 1
        }
        //console.log(row.cells[1].innerHTML)
        //console.log(row.id)
        //alert(row[i].id)
    }
    console.log(collector)
}
//
//
//
function delete_checked(){
    checked = document.getElementsByClassName('del_ck')
    for(n in checked){
        //alert(checked[n].checked)
        if(checked[n].checked == true){
            alert('Delete '+checked[n].value+'?')
        }
    
    }
}