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
  // .find(' > span').attr('title', 'Collapse this branch');
  
  $('.tree li.parent_li > span').each(function(i,e){
      if ($(this).find('i').hasClass("icon-plus-sign")){
          $(this).parent('li.parent_li').find(' > ul > li').hide();
      }
  });
  
  $('.tree li.parent_li > span').on('click', function (e) {
      var children = $(this).parent('li.parent_li').find(' > ul > li');
      if (children.is(":visible")) {
          children.hide('fast');
          $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
          // $(this).attr('title', 'Expand this branch').find(' > img').attr("src").replace("plus", "minus");
      } else {
          children.show('fast');
          $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
          // $(this).attr('title', 'Expand this branch').find(' > img').attr("src").replace("minus", "plus");
          // $(this).find('img').attr("src").replace("minus", "plus");
      }
      e.stopPropagation();
  });
  
// .attr("src", toggle_switch.attr("src").replace("down", "up"));
  
  // $('li.expandable').click(function() {
  //     $(this).children('ul').toggle();
  //     return false;
  // });
  // 
  // location.reload();
  
  // $('div#custom_taxa_tree > ul.domain').children().css( "border", "3px double red" );
  // .addClass( "display_none" );


  // works
  // $( "div#my_custom_list ul" ).click(function(){
  //   $(this).children().css( "border", "3px double red" );
  //   // $(this).children().toggle();
  //   
  // });
  
  // works
  // $( "div#my_custom_list ul > li" ).click(function(){
  //   $(this).css( "border", "3px double red" );
  // });
  
}

// =====
$(function () {    
    
    $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
    
    $('.tree li.parent_li > span').each(function(i,e){
        if ($(this).find('i').hasClass("icon-plus-sign")){
            $(this).parent('li.parent_li').find(' > ul > li').hide();
        }
    });
    
    $('.tree li.parent_li > span').on('click', function (e) {
        var children = $(this).parent('li.parent_li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');
            $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
        } else {
            children.show('fast');
            $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
        }
        e.stopPropagation();
    });
    
});