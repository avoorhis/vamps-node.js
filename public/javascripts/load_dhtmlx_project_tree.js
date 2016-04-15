
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
function set_dataset_count(id){
    
    var checked_nodes = projectTree.getAllChecked().split(',')
    var count = 0
    for(i in checked_nodes){
        // only count datasets
        if(projectTree.getLevel(checked_nodes[i]) === 2){
            count += 1
        }
    }
    document.getElementById('selected_ds_count_id').innerHTML = count
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
  var xmlhttp = new XMLHttpRequest();  
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
        pcount = xmlhttp.responseText;
        
        if( pcount === 0 ){
            document.getElementById('nodata_span').innerHTML='No Data';
        }else{
            document.getElementById('nodata_span').innerHTML='';
        }
        
        document.getElementById("project_count_id").innerHTML = xmlhttp.responseText;
        
        document.getElementById('selected_ds_count_id').innerHTML = 0
        
        projectTree.deleteChildItems(0);
        //load initial
        
        //projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0","json"); 
        projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json"); 
    
    }
  }
  xmlhttp.send();
}
//
//  SHOW/FILTER  RESULTS for project/substring Search
//
function afterCall(){
  //alert('set_dataset_count(0)')
    var delay=100; //0.1 second
    setTimeout(function() {
        //your code to be executed after 0.1 second
        set_dataset_count(0)
    }, delay);
}
function showLiveProjectNames(str) {
  var filtering = 1;
  var datasets_local = {};
  if (str.length==0) {
    str = '----';  // cannot be empty string : (hopefully no-one will search for this)
  }
  document.getElementById('env_source_select').value='.....';
  document.getElementById('metadata_select').value='.....';
  document.getElementById('target_select').value='.....';
  document.getElementById('status_pub').checked=0;
  document.getElementById('status_priv').checked=0;
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
        pcount = xmlhttp.responseText;
        if( pcount == 0 ){
            document.getElementById('nodata_span').innerHTML='No Data';
        }else{
            document.getElementById('nodata_span').innerHTML='';
        }
      document.getElementById("project_count_id").innerHTML = pcount;
      document.getElementById('selected_ds_count_id').innerHTML = 0
      projectTree.deleteChildItems(0);
      projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json");     
    }
  }
  xmlhttp.send();
}
//
//  SHOW/FILTER  RESULTS for environmental source Search
//
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
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
      pcount = xmlhttp.responseText;
        if( pcount == 0 ){
            document.getElementById('nodata_span').innerHTML='No Data';
        }else{
            document.getElementById('nodata_span').innerHTML='';
        }  
      document.getElementById("project_count_id").innerHTML = pcount;
      document.getElementById('selected_ds_count_id').innerHTML = 0
      projectTree.deleteChildItems(0);
      projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json"); 
    }
  }
  xmlhttp.send();
}
//
// SHOW/FILTER  RESULTS for gene target Search
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
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
       pcount = xmlhttp.responseText;
        if( pcount == 0 ){
            document.getElementById('nodata_span').innerHTML='No Data';
        }else{
            document.getElementById('nodata_span').innerHTML='';
        }     
      document.getElementById("project_count_id").innerHTML = pcount;
      document.getElementById('selected_ds_count_id').innerHTML = 0
      projectTree.deleteChildItems(0);
      projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json");   
    }
  }
  xmlhttp.send();
}
//
// SHOW/FILTER  RESULTS for gene target Search
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
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
       pcount = xmlhttp.responseText;
        if( pcount == 0 ){
            document.getElementById('nodata_span').innerHTML='No Data';
        }else{
            document.getElementById('nodata_span').innerHTML='';
        }     
      document.getElementById("project_count_id").innerHTML = pcount;
      document.getElementById('selected_ds_count_id').innerHTML = 0
      projectTree.deleteChildItems(0);
      projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json");   
    }
  }
  xmlhttp.send();
}

//
// SHOW/FILTER  RESULTS for Metadata Search
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
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if ( xmlhttp.readyState == 4 ) {
       pcount = xmlhttp.responseText;
        if( pcount == 0 ){
            document.getElementById('nodata_span').innerHTML='No Data';
        }else{
            document.getElementById('nodata_span').innerHTML='';
        }     
      document.getElementById("project_count_id").innerHTML = pcount;
      document.getElementById('selected_ds_count_id').innerHTML = 0
      projectTree.deleteChildItems(0);
      projectTree.load("/visuals/project_dataset_tree_dhtmlx?id=0",afterCall,"json");   
    }
  }
  xmlhttp.send();
}
