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

// domains are checked at the beginning
  $('.tree ul.domain > li.parent_li > input').each(function(i,e){
      $(this).prop( "checked", true );
  });
  
  $('.tree li.parent_li > span').click(toggle_children);
  $('.tree li.parent_li > input').click(toggle_children);

  
  // $('.tree li.parent_li > span').click(function(e){
  //   toggle_children();
  //   e.stopPropagation();
  // });
  
  // $('.tree li.parent_li > span').on('click', function (e) {
  //     var children = $(this).parent('li.parent_li').find(' > ul > li');
  //     if (children.is(":visible")) {
  //         children.hide('fast');
  //         $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
  //         // $(this).attr('title', 'Expand this branch').find(' > img').attr("src").replace("plus", "minus");
  //     } else {
  //         children.show('fast');
  //         $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
  //         // $(this).attr('title', 'Expand this branch').find(' > img').attr("src").replace("minus", "plus");
  //         // $(this).find('img').attr("src").replace("minus", "plus");
  //     }
  //     e.stopPropagation();
  // });



// $( "input:checked" )
// Check #x
// $( "#x" ).prop( "checked", true );
// Uncheck #x
// $( "#x" ).prop( "checked", false );
  // th.parent('li.parent_li').find('input').each(function(i){$(this).prop( "checked", false )})
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

  // var show_next_level = function() {
  //   children.show('fast');
  //   $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
  // }

  // var hide_next_level = function() {
  //   children.hide('fast');
  //   $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
  // }
  
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


var show_children = function()
{
  alert(this);
  $(this).parent('li.parent_li').find(' > ul > li').show('fast');
  $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');  
}

var toggle_children = function()
{
    var children = $(this).parent('li.parent_li').find(' > ul > li');
    var current = this;
    see_this(current);
    // alert("children");
    if (children.is(":visible")) {
        children.hide('fast');
        $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
        $(this).siblings().find('input').each(function(i){$(this).prop( "checked", false )});
    } else {
        children.show('fast');
        $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
        if (this.type === "checkbox")
        {
          // alert(this.checked);      
          this.checked.toggle();    
        }
        // $(this).siblings().find('input').each(function(i){$(this).prop( "checked", true )});
    }
    
    return false;
}