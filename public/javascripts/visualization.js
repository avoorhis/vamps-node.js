// visualization.js

var toggle_checking_all = function(clicked) {
  $(clicked.parentNode.parentNode).find('input').prop('checked', 
      function(idx, oldProp) {
        return !oldProp;
      });
  return false;
};

var toggle_datasets = function(clicked) {
  // var datasets_per_pr = $(clicked.parentNode.parentNode).children('ul').children('.datasets_per_pr');
  $(clicked.parentNode.parentNode).find('.datasets_per_pr').toggle();
  return false;
};

var toggle_plus_img = function(clicked) {
  var my_img = $(clicked).children();
  if ($(clicked.parentNode.parentNode).find('.datasets_per_pr').css('display') == 'block') {
    my_img.attr('src', '/images/tree_minus.gif').attr('alt', 'minus');        
  }
  else {
    my_img.attr('src', '/images/tree_plus.gif').attr('alt', 'plus');
  }
  return false;  
};

$(document).ready(function () {
  // alert("HERE");
 
  $('.datasets_per_pr').addClass( "display_none" );
  $('a.project_toggle').click(function(){
    // e.preventDefault();
    toggle_datasets(this);
    toggle_checking_all(this);
    toggle_plus_img(this);
		// var datasets_per_pr = $(this.parentNode.parentNode).children('ul').children('.datasets_per_pr');
    // var datasets_per_pr = $(this.parentNode.parentNode).find('.datasets_per_pr');
    if ($(this.parentNode.parentNode).find('.datasets_per_pr').css('display') == 'none') {
			// datasets_per_pr.find('input').prop('checked', false);	
			$(this.parentNode.parentNode).find('input').prop('checked', false);	
		}
    
		// alert($(this.parentNode.parentNode).find('input').prop('checked'));

    // datasets_per_pr.toggle();
    // var my_img = $(this).children();
    // // toggle_plus_img($(this).children(), datasets_per_pr.css('display'));
    //     var $checkboxes = $(this).parent().find('input[type=checkbox]');
    //     $checkboxes.prop('checked', $(this).is(':checked'));


    // if (datasets_per_pr.css('display') == 'block') {
    //   my_img.attr('src', '/images/tree_minus.gif').attr('alt', 'minus');  
    //   check_all($(this), true);                    
    // }
    // else {
    //   my_img.attr('src', '/images/tree_plus.gif').attr('alt', 'plus');
    //   check_all($(this), false);                    
    // }
    
    return false;
  });
  
  jQuery('input.project_toggle').click(function() {
        // alert($(this.parentNode.parentNode).find('.datasets_per_pr').css('display'));
        var checkbox = jQuery(this),
            datasets_per_pr = $(this.parentNode.parentNode).find('.datasets_per_pr');

        if (datasets_per_pr.css('display') == 'none') {
          datasets_per_pr.show();          
          checkbox.siblings('a').find('img').attr('src', '/images/tree_minus.gif').attr('alt', 'minus');  
          datasets_per_pr.find('input').attr('checked', true);
        }        
        if (datasets_per_pr.css('display') == 'block') {
          if (checkbox.prop('checked')) {
	          // alert(checkbox.prop('checked'));
	          datasets_per_pr.find('input').prop('checked', true);	
	// .prop('checked', 
	// 					      function(idx, oldProp) {
	// 					        return !oldProp;
	// 					      })
	// .attr('checked', false);	
					}
					else {
	          // alert("NOT: checkbox.prop('checked')");
	          datasets_per_pr.find('input').prop('checked', false);	
	// .prop('checked', 
	// 					      function(idx, oldProp) {
	// 					        return !oldProp;
	// 					      })
	// .attr('checked', true);							
					}
					
					
        }

        // datasets_per_pr.slideToggle('slow');
					// alert(datasets_per_pr.find('input').prop('checked'));
     });
  
  // $('input.project_toggle').click(function(e)// {
  //     e.preventDefault();
  //     // alert($(this).siblings('a').find('img').attr('src')); /images/tree_plus.gif
  //     if ($(this).siblings('a').find('img').attr('src') == "/images/tree_plus.gif") {
  //       $(this.parentNode.parentNode).children('ul').children('.datasets_per_pr').show();    
  //       $(this).siblings('a').find('img').attr('src', '/images/tree_minus.gif').attr('alt', 'minus');  
  //       // $(this.parentNode.parentNode).find('.datasets_per_pr').find("input").prop('checked', true);
  //       // $(this).prop('checked', true);
  //     }
  //     // else {
  //     //   $(this).prop('checked', true);
  //     // }
  //     
  //     if (!$(this).is(':checked')) {
  //       alert("!$(this).is(':checked')");
  //     }
  //     else
  //     {
  //       alert($(this).prop('checked'));
  //     }
  //     
  //     toggle_checking_all(this);
  //     if (!$(this).is(':checked')) {
  //       alert("!$(this).is(':checked')");
  //     }
  //     else
  //     {
  //       alert($(this).prop('checked'));
  //     }
  //     
  //     // $(this).prop('checked', true);
  //     // alert($(this).prop('checked'));
  //     return false;
  //   });
  
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









