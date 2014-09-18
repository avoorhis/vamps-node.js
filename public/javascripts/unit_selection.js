// visualization: unit_selection.js

toggle_taxa_btn = document.getElementById('toggle_taxa_btn');
if (typeof toggle_taxa_btn !=="undefined") {
  toggle_taxa_btn.addEventListener('click', function () {
      toggle_simple_taxa();
  });
}

$(document).ready(function(){
    $("#unit_selection_name").on("change", get_requested_units_selection_box);
});

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
function get_requested_units_selection_box() {
  var file_id = this.value;  
  // Using ajax it will show the requested units module
  var file = '';
  var partial_name = '/visuals/partials/'+file_id;
  //alert(partial_name)
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.addEventListener("load", transferComplete(file_id), false);
  
  xmlhttp.open("GET", partial_name);
  xmlhttp.onreadystatechange = function() {
    
         if (xmlhttp.readyState == 4 ) {
           var string = xmlhttp.responseText;
           
           var div = document.getElementById('units_select_choices_div').innerHTML = string;
           show_custom_taxa_tree();
         }
  };
  xmlhttp.send();
}

function transferComplete(file_id) {
  // alert("The transfer is complete.");
  // var div = document.getElementById('units_select_choices_div').innerHTML = string;
  // alert(file_id);
  // if (file_id === "tax_silva108_custom")
  // {
  //   show_custom_taxa_tree();
  //   // convertTrees();
  // }
  ;
}  

// visualization: check_form_pg2.js

var get_graphics_form = document.getElementById('get_graphics_form');
var get_graphics = document.getElementById('get_graphics');
if (typeof get_graphics !=="undefined") 
{
  get_graphics.addEventListener('click', function () {
    var unit_selection = get_graphics_form["unit_selection"].value;
    if (unit_selection === 'tax_silva108_simple' || unit_selection === 'tax_silva108_custom') 
    {
      msg = 'You must select some taxa';
      var taxa_checked = check_form(get_graphics_form, msg, "domains[]");
    }

    if (taxa_checked) 
    {
      msg = 'You must select one or more display output choices';
      check_form(get_graphics_form, msg, "visuals[]");
    }    
  });
}

// custom taxa tree
function show_custom_taxa_tree()
{
  $('.tree li:has(ul)').addClass('parent_li');
  // $('.tree li:has(ul)').find(' > span.sign').attr('title', 'Expand this branch');
//     $('.tree li:has(ul)').find(' > span.sign').attr('title', 'Collapse this branch');

// hide by default
  $('.tree li.parent_li > span').filter('.sign').each(function(i,e){
      if ($(this).find('i').hasClass("icon-plus-sign")){
          $(this).parent('li.parent_li').find(' > ul > li').hide();
          $(this).attr('title', 'Expand this branch');
      }
  });

// domains are checked at the beginning
  $('.tree ul.domain > li.parent_li > input').each(function(i,e){
      $(this).prop( "checked", true );
  });
  
  $('.tree li.parent_li > span').filter('.sign').click(toggle_children);

  $('input.custom-taxa').click(function() {
    var children = $(this).parent('li.parent_li').find(' > ul > li');
    var this_to_check = $(this.parentNode.parentNode).find('.custom-taxa');
  
    if (children.is(":visible")) {
      toggle_checking_taxa($(this), this_to_check);
    } else {
      show_children(this);
    }
  });

  $('.open-one-layer').dblclick(function() {
    open_one_layer();
    // alert(this.className)
  })  
  
}

var open_one_layer = function()
{
   alert($(this).className);
}

var count_checked = function()
{
  a = $( "input" ).filter(':checked').length;
  alert(a);
}

var see_this = function(variable)
{
  alert(variable.type);
}


var show_children = function(current)
{
  $(current).parent('li.parent_li').find(' > ul > li').show('fast');
  var span_sign = $(current).parent('li.parent_li').find(' > span').filter('.sign');
  span_sign.attr('title', 'Collapse this branch');
  span_sign.find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
}

var hide_children = function(current, children)
{
  children.hide('fast');
  // $(current).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
  $(current).parent('li.parent_li').find(' > span.sign > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');  
}

// var toggle_checking = function(cl_checkbox) {
//   val = cl_checkbox.value;
//   cl_checkbox = $('input[value='+val+']');
// };

var toggle_checking_taxa = function(pr_checkbox, this_to_check) {
  if (pr_checkbox.prop('checked')) {
   this_to_check.find('input').prop('checked', true);
  }
  else {
   this_to_check.find('input').prop('checked', false);
  }
};

var toggle_children1 = function()
{
    var children = $(this).parent('li.parent_li').find(' > ul > li');
    var checkbox = $(this);
    var this_to_check = $(this.parentNode.parentNode).find('.custom-taxa');
    
    if (children.is(":visible")) {
      toggle_checking_taxa(checkbox, this_to_check);
    } else {
        show_children(checkbox);
    }
    
    return false;
}

var toggle_children = function()
{
    var children = $(this).parent('li.parent_li').find(' > ul > li');
    var current = this;
    if (children.is(":visible")) {
        hide_children(current, children);
        count_checked();
        $(this).siblings().find('input').each(function(i){$(this).prop( "checked", false )});
        count_checked();
    } else {
        show_children(current);
    }
    
    return false;
}