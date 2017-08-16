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
            //GLOBAL
            response = JSON.parse(txt);
            var html = ''
            
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
                html += "<tr><td>"+mditem+"</td>"
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
    project = document.getElementById('project_select_id').value;
    table_data = response
    
    var html = ''
            
 
            html += "<table border='1'>"
            
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
                    html += "<td style='padding:0 2px;'>"
                    if(mditem == 'target_gene'){
                        tmp = "<select>"  
                        for(id in tg){
                            if(tg[id] == value){
                               tmp += '<option selected>'+value+'</option>'
                            }else{
                                tmp += '<option>'+tg[id]+'</option>'
                            }
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'domain'){
                        tmp = "<select>"
                        for(id in dom){
                           if(dom[id] == value){
                               tmp += '<option selected>'+dom[id]+'</option>'
                           }else{
                                tmp += '<option>'+dom[id]+'</option>'
                           }
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'dna_region'){
                        tmp = "<select>"
                        for(id in dnareg){
                           if(dnareg[id] == value){
                               tmp += '<option selected>'+dnareg[id]+'</option>'
                           }else{
                                tmp += '<option>'+dnareg[id]+'</option>'
                           }
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'adapter_sequence'){
                        tmp = "<select>"
                        for(id in adap){
                           if(adap[id] == value){
                               tmp += '<option selected>'+adap[id]+'</option>'
                           }else{
                                tmp += '<option>'+adap[id]+'</option>'
                           }
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'illumina_index'){
                        tmp = "<select>"
                        for(id in ii){
                           if(ii[id] == value){
                               tmp += '<option selected>'+ii[id]+'</option>'
                           }else{
                                tmp += '<option>'+ii[id]+'</option>'
                           }
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'sequencing_platform'){
                        tmp = "<select>"
                        for(id in seqplat){
                           if(seqplat[id] == value){
                               tmp += '<option selected>'+seqplat[id]+'</option>'
                           }else{
                                tmp += '<option>'+seqplat[id]+'</option>'
                           }
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'run'){
                        tmp = "<select>"
                        for(id in run){
                           if(run[id] == value){
                               tmp += '<option selected>'+run[id]+'</option>'
                           }else{
                                tmp += '<option>'+run[id]+'</option>'
                           }
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'primer_suite'){
                        tmp = "<select>"
                        for(id in ps){
                           if(ps[id] == value){
                               tmp += '<option selected>'+ps[id].name+'</option>'
                           }else{
                                tmp += '<option>'+ps[id].name+'</option>'
                           }
                        }
                        tmp += "</select>"
                        html += tmp
                    }else if(mditem == 'env_package'){
                        tmp = "<select width='150' style='width: 150px;'>"
                        for(id in env_pack){
                           if(env_pack[id] == value){
                               tmp += '<option selected>'+env_pack[id]+'</option>'
                           }else{
                                tmp += '<option>'+env_pack[id]+'</option>'
                           }
                        }
                        tmp += "</select>"
                        html += tmp
                    }else{
                        html += "<input type='text' value='"+value+"' >"
                    }
                    html += "</td>"
                }
               //  if(mditem == 'target_gene'){
//                     for(j in sorted_datasets){
//                         ds = sorted_datasets[j]
//                         value = response[mditem][ds]
//                         //tmp = "<td style='padding:0 2px;'><select>"                        
//                         for(id in tg){
//                            alert(id)
//                           // if(tg[id] == value){
//                           //     tmp += '<option selected>'+value+'</option>'
//                           // }else{
//                          //       tmp += '<option>'+tg[id]+'</option>'
//                          //  }
//                         }
//                         //tmp += "</select></td>"
//                         //html += tmp
//                         //html += "<td style='padding:0 2px;'>XXX"
//                         html += "<td style='padding:0 2px;'>"+value+"</td>"
//                         //html += value
//                         
//                     }
//                 }else{
//                     for(j in sorted_datasets){
//                         ds = sorted_datasets[j]
//                         value = response[mditem][ds]
//                         
//                     }
//                 }
                html += "</tr>"
                
              //   for(j in sorted_datasets){
//                     ds = sorted_datasets[j]
//                     value = response[mditem][ds]
//                     html += "<td style='padding:0 2px;'>"
//                    
//                     if(mditem == 'target_gene'){
                        //alert(mditem)
                       //  tmp = "<select>"
//                         
//                         for(id in tg){
//                            alert(id)
//                            if(tg[id] == value){
//                                tmp += '<option selected>'+tg[id]+'</option>'
//                            }else{
//                                 tmp += '<option>'+tg[id]+'</option>'
//                            }
//                         }
//                         tmp += "</select>"
//                         
//                         html += tmp
                  //   }
//                     else if(mditem == 'domain'){
//                         tmp = "<select>"
//                         for(id in dom){
//                            if(dom[id] == value){
//                                tmp += '<option selected>'+dom[id]+'</option>'
//                            }else{
//                                 tmp += '<option>'+dom[id]+'</option>'
//                            }
//                         }
//                         tmp += "</select>"
//                         html += tmp
//                     }else if(mditem == 'env_biome'){
//                         tmp = "<select>"
//                         for(id in term){
//                            if(term[id] == value){
//                                tmp += '<option selected>'+term[id]+'</option>'
//                            }else{
//                                 tmp += '<option>'+term[id]+'</option>'
//                            }
//                         }
//                         tmp += "</select>"
//                         html += value
//                     }else{
//                         html += value
//                     }
//                     html += "</td>"
//                 }
                
                
            }
            html += '</table>'
            //alert(html)
            document.getElementById('metadata_table').innerHTML = html;
}