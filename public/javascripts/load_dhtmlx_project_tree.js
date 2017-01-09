
var ds_count = 0;
var clear_filters_btn_id = document.getElementById('clear_filters_btn_id');
if (typeof clear_filters_btn_id !== 'undefined') {
  clear_filters_btn_id.addEventListener('click', function () {
      clear_filters();
  });
}

var env_source_select = document.getElementById('env_source_select');
if (typeof env_source_select !== 'undefined') {
  env_source_select.addEventListener('change', function () {
      filter_by_env();
  });
}

var target_select = document.getElementById('target_select');
if (typeof target_select !== 'undefined') {
  target_select.addEventListener('change', function () {
      filter_by_target()
  });
}
var portal_select = document.getElementById('portal_select') || null;
if (portal_select !== null) {
  portal_select.addEventListener('change', function () {
      filter_by_portal()
  });
}
var pub_priv = document.getElementsByName('pub_priv');
if (typeof pub_priv[0] !== 'undefined') {
  pub_priv[0].addEventListener('click', function () {
      filter_by_status(1)
  });
  pub_priv[1].addEventListener('click', function () {
      filter_by_status(0)
  });
}
var metadata_select = document.getElementById('metadata_select');
if (typeof metadata_select !== 'undefined') {
  metadata_select.addEventListener('change', function () {
      filter_by_metadata()
  });
}
function initialize_dhtmlx_project_tree() {
    // http://docs.dhtmlx.com/tree__index.html
    projectTree = new dhtmlXTreeObject("projects_select_div","100%","100%",0);
    projectTree.setImagesPath("/images/dhtmlx/imgs/");
    projectTree.enableCheckBoxes(true);
    
    //projectTree.enableTreeLines(true); // true by default
    projectTree.enableTreeImages(false);
    projectTree.attachEvent("onCheck",function(id){
      on_check_dhtmlx(id)
    });
    projectTree.attachEvent("onDblClick", function(id){
      expand_tree_dhtmlx(id)
    });
    projectTree.attachEvent("onOpenEnd",onNodeSelect);
    projectTree.setXMLAutoLoading("/visuals/project_dataset_tree_dhtmlx");
    projectTree.setDataMode("json");

	// MOVED TO CLEAR FILTERS:: loads first level of tree
	//projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0","json");
    
}
//
//
//
  // function load_projects_only_tree(){
    
  //   var xmlhttp = new XMLHttpRequest();  
  //   xmlhttp.open("GET", 'get_projects_only_tree', true);
  //   xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  //   xmlhttp.onreadystatechange=function() {
  //     if (xmlhttp.readyState==4 ) {
  //         html = xmlhttp.responseText;
  //         document.getElementById('projects_only_select_div').innerHTML=html;

          
          
  //     }
  //   }
  //   xmlhttp.send();
  // }
//
//
//
// function set_dataset_count(id){
//     
//     var checked_nodes = projectTree.getAllChecked().split(',')
//     var count = 0
//     for(i in checked_nodes){
//         // only count datasets
//         if(projectTree.getLevel(checked_nodes[i]) === 2){
//             count += 1
//         }
//     }
//     document.getElementById('selected_ds_count_id').innerHTML = count
// }
function set_dataset_count(id){
    var len = 0
    if(Object.keys(datasets_local).length > 0){
      // DATA_TO_OPEN
      for(p in datasets_local){
        len += datasets_local[p].length
      }
      // re-set dataset_local
      datasets_local = {}
    }else{
      var checked_nodes = projectTree.getAllChecked().split(',') 
      if(checked_nodes.length == 1 && projectTree.getLevel(checked_nodes[0]) != 2){
        len = 0
      }else{
        len = checked_nodes.length
      }
    }
    document.getElementById('selected_ds_count_id').innerHTML = len
    projectTree.focusItem(id);
    
}
//
//
//
function onNodeSelect(id){
    
    var openState = projectTree.getOpenState(id);
    if(openState < 1){
        // un-select all on close node
        projectTree.setSubChecked(id, false)
    }else{
        projectTree.setSubChecked(id, true)
        projectTree.setCheck(id,false); 
    }
    set_dataset_count(id)
}
//
//
//
function on_check_dhtmlx(id){
        
    var level = projectTree.getLevel(id)
    
    if(level === 1){
        // project
        projectTree.openItem(id);
        projectTree.setCheck(id,false);  
        var openState = projectTree.getOpenState(id);
        if(openState === 1){
            dids = projectTree.getAllSubItems(id);
            didArray = dids.split(',');
            var checkStateZero = projectTree.isItemChecked(didArray[0]);
            if(checkStateZero  === 1){
                //checked
                projectTree.setSubChecked(id, false);
            }else{
                //not checked
                projectTree.setSubChecked(id, true);
                projectTree.setCheck(id,false); 
            }
        }else{
            
        }
    }else{
        // dataset

    }
    set_dataset_count(id)
}
//
//
//
function expand_tree_dhtmlx(id){
    //alert('expand')
    on_check_dhtmlx(id)
}
//
// CLEAR FILTERS
////////////////////////////////////////////
function clear_filters() {
  // used to clear all search filters and upon intial load
  
  var filtering = 0; 
  var datasets_local = {}; 
  if(portal_local){
    var target = "/visuals/load_portal/"+portal_local;
  }else{
    var target = "/visuals/clear_filters";
  }
  document.getElementById('target_select').value='.....';
  document.getElementById('metadata_select').value='.....';
  document.getElementById('env_source_select').value='.....';
  document.getElementById('pname_search_id').value='';
  document.getElementById('status_pub').checked=0;
  document.getElementById('status_priv').checked=0;
  if(document.getElementById('portal_select')){
    document.getElementById('portal_select').value ='.....'
  }
  var xmlhttp = new XMLHttpRequest();
  //alert(xmlhttp)  
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/json");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
        result = JSON.parse(xmlhttp.responseText);
        
        update_gui_elements(result)
        projectTree.deleteChildItems(0);
        //load initial
        projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json"); 
    
    }
  }
  xmlhttp.send();
}
//
//  SHOW/FILTER  RESULTS for project/substring Search
//
function afterCall(){
    var delay=500; //0.5 second - need 1/2 second for LOTS of saved datasets to load ~1000 
    setTimeout(function() {
        //your code to be executed after 0.5 second
        set_dataset_count(0);
        var cnodes = projectTree.getAllChecked()
        if(cnodes.length > 0){
            var l = cnodes.split(',')
            projectTree.focusItem(projectTree.getParentId(l[0]));
        }
    }, delay);
    
}
//
//   substring for project name filter
//  FILTER #1
//
function showLiveProjectNames(str) {
  var filtering = 1;
  var datasets_local = {};
  if (str.length==0) {
    str = '.....';  // cannot be empty string for url: (hopefully no-one will search for this)
  }
  document.getElementById('env_source_select').value='.....';
  document.getElementById('metadata_select').value='.....';
  document.getElementById('target_select').value='.....';
  document.getElementById('status_pub').checked=0;
  document.getElementById('status_priv').checked=0;
  if(document.getElementById('portal_select')){
    document.getElementById('portal_select').value ='.....'
  }
  if(portal_local){
    var target = "/visuals/livesearch_projects/"+str+'?portal='+portal_local;
  }else{
    var target = "/visuals/livesearch_projects/"+str;
  }
  var xmlhttp = new XMLHttpRequest();  
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
        result = JSON.parse(xmlhttp.responseText);
        update_gui_elements(result)
        projectTree.deleteChildItems(0);
        projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json");     
    }
  }
  xmlhttp.send();
}
//
//  SHOW/FILTER  RESULTS for environmental source Search
//  FILTER #2
function filter_by_env() {
  var filtering = 1;
  var datasets_local = {};
  var env_source_id =  document.getElementById('env_source_select').value;
  var target = "/visuals/livesearch_env/"+env_source_id;
  if(portal_local){
    target += '?portal='+portal_local;
  }
  var xmlhttp = new XMLHttpRequest();  
  
  
  document.getElementById('target_select').value='.....';
  document.getElementById('metadata_select').value='.....';
  document.getElementById('pname_search_id').value='';
  document.getElementById('status_pub').checked=0;
  document.getElementById('status_priv').checked=0;
  if(document.getElementById('portal_select')){
    document.getElementById('portal_select').value ='.....'
  }
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
      result = JSON.parse(xmlhttp.responseText);
      update_gui_elements(result)
      projectTree.deleteChildItems(0);
      projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json"); 
    }
  }
  xmlhttp.send();
}
//
// SHOW/FILTER  RESULTS for gene target Search
//  FILTER #3
//
function filter_by_target() {
  var filtering = 1;
  var datasets_local = {};
  var genetarget =   document.getElementById('target_select').value;
  var target = "/visuals/livesearch_target/"+genetarget;
  if(portal_local){
    target += '?portal='+portal_local;
  }
  var xmlhttp = new XMLHttpRequest(); 
  
  document.getElementById('env_source_select').value='.....';
  document.getElementById('metadata_select').value='.....';
  document.getElementById('pname_search_id').value='';
  document.getElementById('status_pub').checked=0;
  document.getElementById('status_priv').checked=0;
  if(document.getElementById('portal_select')){
    document.getElementById('portal_select').value ='.....'
  }
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
        result = JSON.parse(xmlhttp.responseText);
        update_gui_elements(result)
        projectTree.deleteChildItems(0);
        projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json");   
    }
  }
  xmlhttp.send();
}
//
// SHOW/FILTER  RESULTS for Portal
//  FILTER #4
//
function filter_by_portal() {
  var filtering = 1;
  var datasets_local = {};
  var portal_id =   document.getElementById('portal_select').value;
  var target = "/visuals/livesearch_portal/"+portal_id;
  if(portal_local){
    target += '?portal='+portal_local;
  }
  var xmlhttp = new XMLHttpRequest(); 
  
  document.getElementById('env_source_select').value='.....';
  document.getElementById('metadata_select').value='.....';
  document.getElementById('pname_search_id').value='';
  document.getElementById('status_pub').checked=0;
  document.getElementById('status_priv').checked=0;
  document.getElementById('target_select').value='.....';

  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
        result = JSON.parse(xmlhttp.responseText);
        update_gui_elements(result)
        projectTree.deleteChildItems(0);
        projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json");   
    }
  }
  xmlhttp.send();
}
//
// SHOW/FILTER  RESULTS for public/private
//  FILTER #5  
//
function filter_by_status(pub_status) {
  var filtering = 1;
  var datasets_local = {};
  var target = "/visuals/livesearch_status/"+pub_status;
  if(portal_local){
    target += '?portal='+portal_local;
  }
  var xmlhttp = new XMLHttpRequest(); 
  
  document.getElementById('env_source_select').value='.....';
  document.getElementById('metadata_select').value='.....';
  document.getElementById('target_select').value='.....';
  document.getElementById('pname_search_id').value='';
  if(document.getElementById('portal_select')){
    document.getElementById('portal_select').value ='.....'
  }
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
        result = JSON.parse(xmlhttp.responseText);
        update_gui_elements(result)
        projectTree.deleteChildItems(0);
        projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json");   
    }
  }
  xmlhttp.send();
}

//
// SHOW/FILTER  RESULTS for Metadata Search
//  FILTER #6
//
function filter_by_metadata() {
  var filtering = 1;
  var datasets_local = {};
  var metadata_item =   document.getElementById('metadata_select').value;
  var target = '/visuals/livesearch_metadata/'+encodeURIComponent(metadata_item);
  if(portal_local){
    target += '?portal='+portal_local;
  }
  var xmlhttp = new XMLHttpRequest(); 
  
  document.getElementById('env_source_select').value='.....';
  document.getElementById('pname_search_id').value='';
  document.getElementById('target_select').value='.....';
  document.getElementById('status_pub').checked=0;
  document.getElementById('status_priv').checked=0;
  if(document.getElementById('portal_select')){
    document.getElementById('portal_select').value ='.....'
  }
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
        result = JSON.parse(xmlhttp.responseText);
        update_gui_elements(result)
        projectTree.deleteChildItems(0);
        projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json");   
    }
  }
  xmlhttp.send();
}
function update_gui_elements(result){
  //alert(JSON.stringify(result))
  //alert(JSON.stringify(env_sources_local))
    if(result.substring == '' || result.substring == '.....'){
      document.getElementById('pname_search_id').value = ''
      //document.getElementById('pname_search_id').style.color = 'black'
      document.getElementById('substring_on_id').innerHTML = ''
    }else{
      document.getElementById('pname_search_id').value = result.substring
      //document.getElementById('pname_search_id').style.color = 'orange'
      document.getElementById('substring_on_id').innerHTML = '*'
    }
        
    if(result.env.length == 0 || result.env[0] == '.....'){
      document.getElementById('env_source_select').value = '.....'
      //document.getElementById('env_source_select').style.color = 'black'
      document.getElementById('env_on_id').innerHTML = ''
    }else{
      // env has a unique value structure
      document.getElementById('env_source_select').value = result.env[0]+'--'+env_sources_local[result.env[0]]
      //document.getElementById('env_source_select').style.color = 'orange'
      document.getElementById('env_on_id').innerHTML = '*'
    }
    if(result.target == '' || result.target == '.....'){
      document.getElementById('target_select').value = '.....'
      //document.getElementById('target_select').style.color = 'black'
      document.getElementById('target_on_id').innerHTML = ''
    }else{
      document.getElementById('target_select').value = result.target
      //document.getElementById('target_select').style.color = 'orange'
      document.getElementById('target_on_id').innerHTML = '*'
    }

    if(document.getElementById('portal_select') != null){
      if(result.portal == '' || result.portal == '.....'){
        document.getElementById('portal_select').value = '.....'
        //document.getElementById('portal_select').style.color = 'black'
        document.getElementById('portal_on_id').innerHTML = ''
      }else{
        document.getElementById('portal_select').value = result.portal
        //document.getElementById('portal_select').style.color = 'orange'
        document.getElementById('portal_on_id').innerHTML = '*'
      }
    }

    if(result.public == '0'){
      document.getElementById('status_pub').checked = false
      document.getElementById('status_priv').checked = true
      document.getElementById('public_on_id').innerHTML = '*'
    }else if(result.public == '1'){
      document.getElementById('status_pub').checked = true
      document.getElementById('status_priv').checked = false
      document.getElementById('public_on_id').innerHTML = '*'
    }else{
      document.getElementById('status_pub').checked = false
      document.getElementById('status_priv').checked = false
      document.getElementById('public_on_id').innerHTML = ''
    }

    if(result.metadata == '' || result.metadata == '.....'){
      document.getElementById('metadata_select').value = '.....'
      //document.getElementById('metadata_select').style.color = 'black'
      document.getElementById('metadata_on_id').innerHTML = ''
    }else{
      document.getElementById('metadata_select').value = result.metadata
      //document.getElementById('metadata_select').style.color = 'orange'
      document.getElementById('metadata_on_id').innerHTML = '*'
    }

    if( result.pid_length == 0 ){
        document.getElementById('nodata_span').innerHTML='No Projects Found';
    }else{
        document.getElementById('nodata_span').innerHTML='';
    }
    document.getElementById("project_count_id").innerHTML = result.pid_length;
    document.getElementById('selected_ds_count_id').innerHTML = 0


}
