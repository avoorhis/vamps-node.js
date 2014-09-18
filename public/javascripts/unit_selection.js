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
  $('.tree .parent_li > span.sign > i').addClass('icon-plus-sign').removeClass('icon-no-sign');;

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
      check_last_visible(this_to_check);
      toggle_checking_taxa($(this), this_to_check);
    } else {
      show_children(this);
    }
  });  

  $('.open-one-layer').dblclick(open_one_layer); 
}

var open_one_layer = function()
{
   first_hidden_class = $(this).parent('li.parent_li').find(":hidden:first").parent().attr('class');
   $(this).parent('li.parent_li').find("." + first_hidden_class).each(function(i)
   {
     try
     {
        show_children(this);
     }
     catch(e)
     {
       ;
       //Handle errors here
     }     
  })   
}

var check_last_visible = function(this_to_check)
{
  // clicked = $(".open-one-layer:contains(Bacteria)");
  all_plus_vis = $(this_to_check).closest('ul').find('.icon-plus-sign:visible, .icon-no-sign:visible');
  all_inputs_vis = all_plus_vis.closest('span.sign').siblings('input.custom-taxa');
  all_inputs_vis.prop( "checked", true );
  // toggle_checking_taxa(this_to_check, all_inputs_vis)

  //$('[mandatory="true"],[validate="true"]')
  // clicked = $(".open-one-layer:contains(Archaea)");
  // last_open_class = clicked.parent('li.parent_li').find(":visible:last").parent().parent('ul').attr('class');
  // alert(last_open_class);
  //  // $(this)
  //  // var this_to_check = $(this.parentNode.parentNode).find('.custom-taxa');
  //  // last_open_class = clicked.closest('.parent_li').find(":visible:last").parent().parent('ul').attr('class');
  //  
  //   clicked.parent('li.parent_li').find("." + last_open_class).each(function(i)
  //   {
  //     try
  //     {
  //       check = $(this).find(' > input')
  //       alert(check.className);
  //        // toggle_checking_taxa($(this), $(this.parentNode.parentNode).find('.custom-taxa'));
  //     }
  //     catch(e)
  //     {
  //       ;
  //       //Handle errors here
  //     }     
  //  })
   
  //  clicked.parent('li.parent_li').find("." + last_open_class).each(function(i)
  //  {
  //    try
  //    {
  //      check = $(this)
  //      alert(this.className);
  //       // toggle_checking_taxa($(this), $(this.parentNode.parentNode).find('.custom-taxa'));
  //    }
  //    catch(e)
  //    {
  //      ;
  //      //Handle errors here
  //    }     
  // })

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
  $(current).parent('li.parent_li').find(' > span.sign > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');  
}

var toggle_checking_taxa = function(pr_checkbox, this_to_check) {
  if (pr_checkbox.prop('checked')) {
   this_to_check.find('input').prop('checked', true);
  }
  else {
   this_to_check.find('input').prop('checked', false);
  }
};

var toggle_children = function()
{
    var children = $(this).parent('li.parent_li').find(' > ul > li');
    var current = this;
    if (children.is(":visible")) {
        hide_children(current, children);
        $(this).siblings().find('input').each(function(i){$(this).prop( "checked", false )});
    } else {
        show_children(current);
    }
    
    return false;
}