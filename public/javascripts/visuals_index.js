



$( document ).ready(function() {

    
    load_dhtmlx_project_tree()

    clear_filters()

    if(Object.keys(datasets_local).length > 0){
      //alert('datasets to load - in visuals_index.js')
      for(pid in datasets_local){
      	dids = datasets_local[pid]
      	projectTree.openItem(pid)
      	for(n in dids){
      		did = dids[n]
      		//alert(did)

      	}
      		
      }
  }


});

