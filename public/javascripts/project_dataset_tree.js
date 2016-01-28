// var is_visible = function(div_to_check) {
//   if (div_to_check.css('display') === 'block')
//   {  return true; }
//   else
//   { return false; }
// };
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


var toggle_checking_all = function(clicked) {
  
  $(clicked.parentNode.parentNode).find('input').prop('checked',
     function(idx, oldProp) {

	   return !oldProp;
     });
  return false;
};

var toggle_checking_datasets_by_pr = function(pr_checkbox, datasets_per_pr) {
  if (pr_checkbox.prop('checked')) {
   datasets_per_pr.find('input').prop('checked', true);
  }
  else {
   datasets_per_pr.find('input').prop('checked', false);

  }
};

var toggle_checking_datasets = function(pr_checkbox, datasets_per_pr) {
   
  if (datasets_per_pr.find('input').prop('checked')) {
    datasets_per_pr.find('input').prop('checked', false);  
  }
  else {
    datasets_per_pr.find('input').prop('checked', true);
  }
  count_checked_datasets();
};



var toggle_datasets = function(clicked) {
  $(clicked.parentNode.parentNode).find('.datasets_per_pr').toggle();
  //alert('h')
  count_checked_datasets()
  return false;
};

var minus_img = function(my_img) {
  my_img.attr('src', '/images/tree_minus.gif').attr('alt', 'minus');
};

var plus_img  = function(my_img) {
  my_img.attr('src', '/images/tree_plus.gif').attr('alt', 'plus');
};

var toggle_plus_img = function(clicked) {
  var my_img = $(clicked).children();
  // if (is_visible($(clicked.parentNode.parentNode).find('.datasets_per_pr'))) {
  //   minus_img(my_img);
  // }
  
  if ($(clicked.parentNode.parentNode).find('.datasets_per_pr').is(":visible")) {
    minus_img(my_img);

  }  
  else {
    plus_img(my_img);
    
  }

  return false;
};

var checkme = function(){
//alert('o')
  //var dataset_ids = document.getElementsByName('dataset_ids[]');
  //alert(dataset_ids.length)
   //ds_count += datasets_per_pr.find('input').prop('checked', true).length
    //document.getElementById('selected_ds_count_id').innerHTML = ds_count
  count_checked_datasets()
};

var uncheck_closed = function(parent_place) {
  // if (!is_visible(parent_place.find('.datasets_per_pr'))) {
  //   parent_place.find('input').prop('checked', false);
  // }
  if (parent_place.find('.datasets_per_pr').is(":hidden")) {
    parent_place.find('input').prop('checked', false);
  }
  count_checked_datasets()

};
var count_checked_datasets = function() {
  var all_dataset_ids = document.getElementsByName('dataset_ids[]');
  ds_count = 0
  for(i in all_dataset_ids){
    //alert(dataset_ids[i].checked)
    if(all_dataset_ids[i].checked === true){
      ds_count += 1
    }

  }
  document.getElementById('selected_ds_count_id').innerHTML = ds_count

};
$(document).ready(function () {
      
      //onPageLoad({});
      //dsets = <%= datasets %>
      //clear_filters();
      //var portal_local  = "<%= portal_to_show %>";
      //alert(portal_local)
      if(portal_local){
        var target = "/visuals/load_portal/"+portal_local;
      }else{
        var target = "/visuals/clear_filters";
      }
      filtering = 0;  
      document.getElementById('target_select').value='.....';
      document.getElementById('env_source_select').value='.....';
      document.getElementById('pname_search_id').value='';
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("GET", target, true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 ) {
          response  = JSON.parse(xmlhttp.responseText);
          document.getElementById("projects_select_div").innerHTML = response.html;
          document.getElementById("project_count_id").innerHTML = response.count;
          document.getElementById('selected_ds_count_id').innerHTML = 0
          onPageLoad();
        }
      }
      xmlhttp.send();
      
});

function onPageLoad(){
  // All commands here in separate file so I can run them after changing project list
    // by default everything is visible, in case there is no js
  $('.datasets_per_pr').addClass( "display_none" );
  
  // the minus sign should always close the tree AND uncheck all the ds cbs 
  //           the plus sign should always open the tree but not check anything.
  //  if the tree is closed the project cb should open AND check all the ds cbs
  //  if the tree is open the project cb should toggle on/off the ds cbs
  //  The project cb should never itself be checked — just open the tree and check ds (if tree is closed)
  //      and check or uncheck all the ds (if tree is open)

  // minus_plus_sign
  $('a.project_toggle').click(function(){
    toggle_datasets(this);
    // toggle_checking_all(this); 
    
    var datasets_per_pr = $(this.parentNode.parentNode).find('.datasets_per_pr');    
    toggle_checking_datasets(this, datasets_per_pr);
    toggle_plus_img(this);
    uncheck_closed($(this.parentNode.parentNode));
    return false;
    });
  
  // project checkbox
  $('input.project_toggle').click(function() {
     
    var checkbox = $(this);
    $(this).prop('checked', false)
    var datasets_per_pr = $(this.parentNode.parentNode).find('.datasets_per_pr');
    
    if (datasets_per_pr.is(":hidden")) {
      datasets_per_pr.show();
      minus_img(checkbox.siblings('a').find('img'));
    }
    toggle_checking_datasets(checkbox, datasets_per_pr);
  });
  
  // now load and check any datasets from 'data_to_open'
  
  if(datasets_local){
      
      $('input.project_toggle').each(function(){
        //alert($(this).prop('value'))
        var checkbox = $(this);
        var project = checkbox.prop('value')
        //alert(project)
        var datasets_per_pr = $(this.parentNode.parentNode).find('.datasets_per_pr');
        if( datasets_local.hasOwnProperty(project) ){
          //input.prop('checked', true)
          if (datasets_per_pr.is(":hidden")) {
            
            datasets_per_pr.show();
            minus_img(checkbox.siblings('a').find('img'));
          }
          check_selected_datasets(checkbox, datasets_per_pr, project, datasets_local[project]);
        }
      });
  }
  
  // if(portal_local){
  //   alert('lo')
  //   var xmlhttp = new XMLHttpRequest(); 
  //   xmlhttp.open("GET", "/visuals/livesearch_projects/"+portal_local, true);
  //   xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  //   xmlhttp.onreadystatechange=function() {
  //     if (xmlhttp.readyState==4 ) {
  //       document.getElementById("projects_select_div").innerHTML = xmlhttp.responseText;
  //       onPageLoad();      
  //     }
  //   }
  //   xmlhttp.send();
    
  // }
  
}

//
//
//

//test_to_open_project = [];

function clear_filters() {
  filtering = 0; 
  datasets_local = {}; 
  if(portal_local){
    var target = "/visuals/load_portal/"+portal_local;
  }else{
    var target = "/visuals/clear_filters";
  }
  document.getElementById('target_select').value='.....';
  document.getElementById('env_source_select').value='.....';
  document.getElementById('pname_search_id').value='';
  
  var xmlhttp = new XMLHttpRequest();  
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 ) {
      response  = JSON.parse(xmlhttp.responseText);
      document.getElementById("projects_select_div").innerHTML = response.html;
      document.getElementById("project_count_id").innerHTML = response.count;
      document.getElementById('selected_ds_count_id').innerHTML = 0
      onPageLoad();
      

    }
  }
  xmlhttp.send();
}
//
//
//
function filter_by_env() {
  filtering = 1;
  datasets_local = {};
  var env_source_id =  document.getElementById('env_source_select').value;
  if(portal_local){
    var target = "/visuals/livesearch_env/"+env_source_id+'?portal='+portal_local;
  }else{
    var target = "/visuals/livesearch_env/"+env_source_id+'?portal=';
  }
  var xmlhttp = new XMLHttpRequest();  
  
  
  document.getElementById('target_select').value='.....';
  document.getElementById('pname_search_id').value='';

  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 ) {
      response  = JSON.parse(xmlhttp.responseText);
      document.getElementById("projects_select_div").innerHTML = response.html;
      document.getElementById("project_count_id").innerHTML = response.count;
      document.getElementById('selected_ds_count_id').innerHTML = 0
      onPageLoad();      
    }
  }
  xmlhttp.send();
}
//
//
//
function filter_by_target() {
  filtering = 1;
  datasets_local = {};
  var genetarget =   document.getElementById('target_select').value;
  if(portal_local){
    var target = "/visuals/portal_livesearch_target/"+genetarget+'/'+portal_local;
  }else{
    var target = "/visuals/livesearch_target/"+genetarget;
  }
  var xmlhttp = new XMLHttpRequest(); 
  
  document.getElementById('env_source_select').value='.....';
  document.getElementById('pname_search_id').value='';
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 ) {
      response  = JSON.parse(xmlhttp.responseText);
      document.getElementById("projects_select_div").innerHTML = response.html;
      document.getElementById("project_count_id").innerHTML = response.count;
      document.getElementById('selected_ds_count_id').innerHTML = 0
      onPageLoad();      
    }
  }
  xmlhttp.send();
}
//
//  SHOW  RESULTS for project Search
//
function showLiveProjectNames(str) {
  filtering = 1;
  datasets_local = {};
  if (str.length==0) {
    str = '----';  // cannot be empty string : (hopefully no-one will search for this)
  }
  document.getElementById('env_source_select').value='.....';
  document.getElementById('target_select').value='.....';
  if(portal_local){
    var target = "/visuals/portal_livesearch_projects/"+str+'/'+portal_local;
  }else{
    var target = "/visuals/livesearch_projects/"+str;
  }
  var xmlhttp = new XMLHttpRequest();  
  xmlhttp.open("GET", target, true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 ) {
      response  = JSON.parse(xmlhttp.responseText);
      document.getElementById("projects_select_div").innerHTML = response.html;
      document.getElementById("project_count_id").innerHTML = response.count;
      document.getElementById('selected_ds_count_id').innerHTML = 0
      onPageLoad();      
    }
  }
  xmlhttp.send();
}
//
//
//
function check_selected_datasets(pr_checkbox, datasets_per_pr, project, dids) {
   //alert(datasets_per_pr.find('input').length)
  //alert(dids)
  //1740,1739,1745,1744,1741,1742,1751,1750,1752,1753,1746,1738,1748,1749,1747,1743

  datasets_per_pr.find('input').each( function(){
    var checkbox = $(this);
    var did = parseInt(checkbox.prop('value'));
    //alert(typeof did)
    //alert(did)
    //var pd= checkbox.prop('id')
    //ds = pd.split('--')[1]
    
    if(dids.indexOf(did) > -1){
      //alert(did)
      checkbox.prop('checked', true);
    }
    //alert(id)
  })
  
  count_checked_datasets()
};
