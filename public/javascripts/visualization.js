// visualization.js

var toggle_checking_all = function(clicked) {
  $(clicked.parentNode.parentNode).find('input').prop('checked', 
     function(idx, oldProp) {
       return !oldProp;
     });
  return false;
};

var toggle_datasets = function(clicked) {
  $(clicked.parentNode.parentNode).find('.datasets_per_pr').toggle();
  return false;
};

var minus_img = function(my_img) {
	my_img.attr('src', '/images/tree_minus.gif').attr('alt', 'minus');        
}

var plus_img  = function(my_img) {
	my_img.attr('src', '/images/tree_plus.gif').attr('alt', 'plus');        
}

var toggle_plus_img = function(clicked) {
  var my_img = $(clicked).children();
  if ($(clicked.parentNode.parentNode).find('.datasets_per_pr').css('display') == 'block') {
    minus_img(my_img);
  }
  else {
    plus_img(my_img);
  }
  return false;  
};

var uncheck_closed = function(parent_place) {
	if (parent_place.find('.datasets_per_pr').css('display') == 'none') {
		parent_place.find('input').prop('checked', false);	
	}
}

$(document).ready(function () {
  // alert("HERE");
 	
	// by default everything is visible, in case there is no js
  $('.datasets_per_pr').addClass( "display_none" );

  $('a.project_toggle').click(function(){
    // e.preventDefault();
    toggle_datasets(this);
    toggle_checking_all(this);
    toggle_plus_img(this);
		uncheck_closed($(this.parentNode.parentNode));    
    return false;
  });
  
  $('input.project_toggle').click(function() {
		var checkbox = $(this),
			datasets_per_pr = $(this.parentNode.parentNode).find('.datasets_per_pr');

		if (datasets_per_pr.css('display') == 'none') {
		  datasets_per_pr.show();        
		  minus_img(checkbox.siblings('a').find('img'));
		  datasets_per_pr.find('input').attr('checked', true);
		}        
		if (datasets_per_pr.css('display') == 'block') {
		  if (checkbox.prop('checked')) {
		   datasets_per_pr.find('input').prop('checked', true);	
			}
			else {
		   datasets_per_pr.find('input').prop('checked', false);	
			}
		}
	});  
})

//
// TOGGLE_SIMPLE_TAXA
//
function toggle_simple_taxa()
{
  // page: unit_selection
  // units: taxonomy
  // toggles domain checkboxes on/off
  var boxes = document.getElementsByClassName('simple_taxa_ckbx');
  var i;
  if (boxes[0].checked === false) {
      for (i = 0; i < boxes.length; i++) {
          boxes[i].checked = true;
          document.getElementById('toggle_taxa_btn').checked = true;
      }
  } else {
      for (i = 0; i < boxes.length; i++) {
          boxes[i].checked = false;
          document.getElementById('toggle_taxa_btn').checked = false;
    }
  }
}


//
// GET REQUESTED UNITS SELECTION BOX
//
function get_requested_units_selection_box(file_id) {
  // Using ajax it will show the requested units module
  
  var file = '';    
  var partial_name = '/visuals/partials/'+file_id;

  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET",partial_name, true);
  xmlhttp.onreadystatechange=function(){
         if (xmlhttp.readyState==4 && xmlhttp.status==200){
           string=xmlhttp.responseText;
           //alert(partial_name)
           var div = document.getElementById('units_select_div').innerHTML = string;
         }
  }
  xmlhttp.send();

}


//
// CHECK_VIZ Page 1
//
function check_viz_selection_pg1(thisform) {
  // simple function to check if user has not selected any datasets.
  // alerts and returns if not.
  var x = thisform["dataset_ids[]"];
  var gotone = false;
  for (var i=0; i<x.length; i++)
  {
      if (x[i].checked) {
        gotone = true;
      }
  }
  if (gotone){
    thisform.submit();
  } else {
    alert('You must select some datasets');
    return;
  }
}
//
// CHECK_VIZ Page 2
//
function check_viz_selection_pg2(thisform) {
  // simple function to check if user has not selected any visuals.
  // alerts and returns if not.
  var x = thisform["visuals[]"];
  var gotone = false;
  for (var i=0; i<x.length; i++)
  {
      if (x[i].checked) {
        gotone = true;
      }
  }
  if (gotone){
    thisform.submit();
  } else {
    alert('You must select a display output');
    return;
  }
  // what else do we check here?
  // check for NO unit_associations: unit_assoc":{"tax_silva108_id":[],"tax_gg_id":[],"med_node_id":[],"otu_id":[]}}

}









