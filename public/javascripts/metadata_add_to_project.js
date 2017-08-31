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
            dname_lookup = response.dname_lookup  // dname_lookup[did] = dname
            did_lookup = response.did_lookup     // did_lookup[dname] = did
            md_obj = response.by_mditem     // md_obj[mditem][dname] = value
            var html = '<br>'
            
           //  html += "<select>"
//             //alert(tg)
//             for(target_gene_id in tg){
//              html += '<option>'+tg[target_gene_id]+'</option>'
//             }
//             html += "</select>"
            html += "<table border='1'>"
            
            //alert(response)
            // if(md_obj.hasOwnProperty('latitude')){
//                 dids = Object.keys(md_obj.latitude)
//             }else{
//                 alert('No required metadata')
//                 return
//             }
            // n=0
//             for(mditem in response){
//                 datasets = Object.keys(response[mditem])
//                 n += 1
//                 if(n == 1){
//                     continue
//                 }
//             }
            sorted_datasets = Object.keys(did_lookup).sort()
            sorted_keys = Object.keys(md_obj).sort()   // md items
            //alert(sorted_keys)
            html += "<tr><th></th>"
            for(j in sorted_datasets){
                html += "<th title='did="+did_lookup[sorted_datasets[j]]+"'>"+sorted_datasets[j]+"</th>"
            }
            html += "</tr>"
            n=0
            for(i in sorted_keys){
                mditem = sorted_keys[i]
                //console.log(mditem)
                if(reqfields.indexOf(mditem) == -1){ 
                    html += "<tr><td>"+mditem+"</td>"
                }else{
                    html += "<tr><td>"+mditem+"*</td>"
                }
                for(j in sorted_datasets){
                    ds = sorted_datasets[j]
                    did = did_lookup[sorted_datasets[j]]
                    value = md_obj[mditem][did]
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
   
    project = document.getElementById('project_select_id').value;
    table_data = md_obj
    //dname_lookup = response.dname_lookup  // dname_lookup[did] = dname
    //did_lookup = response.did_lookup     // did_lookup[dname] = did
    //alert(dset_lookup)
    document.getElementById('save_btn').disabled = false;
    document.getElementById('save_btn').style.visibility = 'visible';
    document.getElementById('edit_btn').disabled = true;
    document.getElementById('edit_btn').style.visibility = 'hidden';
    
    var html = ''
            html += " <input type='button' id='dlt_btn' onclick='delete_checked()' Value='Delete Checked' >"
            html += "<br><table id='md_table' border='1'>"
            //alert(response)
           //  if(table_data.hasOwnProperty('latitude')){
//                 //datasets = Object.keys(table_data.latitude)
//             }else{
//                 alert('No required metadata')
//                 return
//             }
            //sorted_datasets = Object.keys(did_lookup).sort()
            //sorted_keys = Object.keys(md_obj).sort()   // md items
            //sorted_datasets = datasets.sort()
            //sorted_keys = Object.keys(table_data).sort() 
            //alert(datasets)
            html += "<tr><th></th><th></th>"
            //alert(sorted_datasets[0])
            //alert(dset_lookup[sorted_datasets[0]])
            for(j in sorted_datasets){
                html += "<th title='did="+did_lookup[sorted_datasets[j]]+"' id='"+did_lookup[sorted_datasets[j]]+"'>"+sorted_datasets[j]+"</th>"
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
                    did = did_lookup[sorted_datasets[j]]
                    value = table_data[mditem][did]
                    
                    selid = mditem+'_id_'+did
                    html += "<td style=''>"
                    if(mditem == 'geo_loc_name'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"  
                        for(i in loc){
                            line = "<option value='"+loc[i].name+"'>"+loc[i].name+'</option>'
                            if(loc[i].name == value){                               
                                line = "<option selected value='"+loc[i].name+"'>"+loc[i].name+'</option>'                           
                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'env_material'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"  
                        for(id in mat){
                            line = "<option value='"+mat[id]+"'>"+mat[id]+'</option>'
                            if(mat[id] == value){                               line = "<option selected value='"+mat[id]+"'>"+mat[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'env_feature'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"  
                        for(id in feat){
                            line = "<option value='"+feat[id]+"'>"+feat[id]+'</option>'
                            if(feat[id] == value){                               line = "<option selected value='"+feat[id]+"'>"+feat[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'env_biome'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in biom){
                           line = "<option value='"+biom[id]+"'>"+biom[id]+'</option>'
                           if(biom[id] == value){                               line = "<option selected value='"+biom[id]+"'>"+biom[id]+'</option>'                           }
                           tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'target_gene'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"  
                        for(id in tg){
                            line = "<option value='"+tg[id]+"'>"+tg[id]+'</option>'
                            if(tg[id] == value){                               line = "<option selected value='"+tg[id]+"'>"+tg[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'domain'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in dom){
                           line = "<option value='"+dom[id]+"'>"+dom[id]+'</option>'
                           if(dom[id] == value){                               line = "<option selected value='"+dom[id]+"'>"+dom[id]+'</option>'                           }
                           tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'dna_region'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in dnareg){
                            line = "<option value='"+dnareg[id]+"'>"+dnareg[id]+'</option>'
                            if(dnareg[id] == value){                               line = "<option selected value='"+dnareg[id]+"'>"+dnareg[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'adapter_sequence'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in adap){
                            line = "<option value='"+adap[id]+"'>"+adap[id]+'</option>'
                            if(adap[id] == value){                               line = "<option selected value='"+adap[id]+"'>"+adap[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'illumina_index'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in ii){
                            line = "<option value='"+ii[id]+"'>"+ii[id]+'</option>'
                            if(ii[id] == value){ line = "<option selected value='"+ii[id]+"'>"+ii[id]+'</option>'                           }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'sequencing_platform'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in seqplat){
                            line = "<option value='"+seqplat[id]+"'>"+seqplat[id]+'</option>'
                            if(seqplat[id] == value){                               line = "<option selected value='"+seqplat[id]+"'>"+seqplat[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'run'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in run){
                            line = "<option value='"+run[id]+"'>"+run[id]+'</option>'
                            if(run[id] == value){                                   line = "<option selected value='"+run[id]+"'>"+run[id]+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'primer_suite'){
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in ps){
                            line = "<option value='"+ps[id].name+"'>"+ps[id].name+'</option>'
                            if(ps[id].name == value){                               line = "<option selected value='"+ps[id].name+"'>"+ps[id].name+'</option>'                            }
                            tmp += line
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'env_package'){
                        
                        tmp = "<select id='"+selid+"' width='150' style='width: 150px;'>"
                        for(id in env_pack){
                            line = "<option value='"+env_pack[id]+"'>"+env_pack[id]+'</option>'
                            if(env_pack[id] == value){                               line = "<option selected value='"+env_pack[id]+"'>"+env_pack[id]+'</option>'                            }
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
    collector.project = project
    collector.data = {}
    var mditems_w_ids = ['env_package','env_biome','env_feature','env_material','target_gene','run','primer_suite','adapter_sequence','dna_region','domain','geo_loc_name','illumina_index','sequencing_platform']
    var dataset_row = table.rows[0]
    var dataset_order = [] // two placeholders!!
    for (var j = 0, col; col = dataset_row.cells[j]; j++) {
        if(col.innerHTML != ''){
            dataset_order.push(col.id)
            //collector.data[col.id] = {}
        }
    }
    //console.log(datasets)
    for(var i = 1, row; row = table.rows[i]; i++){  // skip row zero
        if(mditems_w_ids.indexOf(row.id) == -1){
            row_id = row.id
        }else{
            //row_id = row.id + '_id'
            row_id = row.id
        }
        
        collector.data[row_id] = {}
        for (var j = 2, col; col = row.cells[j]; j++) { // skip col zero and one
            ds_index = j - 2
            
            if(col.getElementsByTagName("input")[0] == undefined){
                value = col.getElementsByTagName("select")[0].value
            }else{
                value = col.getElementsByTagName("input")[0].value
            }
            collector.data[row_id][dataset_order[ds_index]] = value
        }
    }
    //console.log('collector:')
    //console.log(collector)
    
    var xmlhttp = new XMLHttpRequest();	
    xmlhttp.open("POST", "/user_data/save_metadata", true);
	xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
             response = JSON.parse(xmlhttp.responseText)
             //console.log(response)
             alert(response.resp)
        }
    }
    xmlhttp.send(JSON.stringify(collector));
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