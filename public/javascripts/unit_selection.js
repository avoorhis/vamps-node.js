// visualization: unit_selection.js

toggle_taxa_btn = document.getElementById('toggle_taxa_btn');
if (typeof toggle_taxa_btn !=="undefined") {
  toggle_taxa_btn.addEventListener('click', function () {
      toggle_simple_taxa();
  });
}

save_datasets_btn = document.getElementById('save_datasets_btn');
if (typeof save_datasets_btn !=="undefined") {
  save_datasets_btn.addEventListener('click', function () {
      save_datasets_list(ds_local,user_local);
  });
}

toggle_meta_r_btn = document.getElementById('toggle_meta_r_btn');
if (typeof toggle_meta_r_btn !=="undefined") {
  toggle_meta_r_btn.addEventListener('click', function () {
      toggle_required_metadata();
  });
}

toggle_meta_c_btn = document.getElementById('toggle_meta_c_btn');
if (typeof toggle_meta_c_btn !=="undefined") {
  toggle_meta_c_btn.addEventListener('click', function () {
      toggle_custom_metadata();
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
// TOGGLE_REQUIRED_METADATA
//
function toggle_required_metadata()
{
  // page: unit_selection
  // units: taxonomy
  // toggles domain checkboxes on/off
  var boxes = document.getElementsByClassName('required_meta_ckbx');
  var i;
  if (boxes[0].checked === false) {
      for (i = 0; i < boxes.length; i++) {
          boxes[i].checked = true;
          document.getElementById('toggle_meta_r_btn').checked = true;
      }
  } else {
      for (i = 0; i < boxes.length; i++) {
          boxes[i].checked = false;
          document.getElementById('toggle_meta_r_btn').checked = false;
    }
  }
}
//
// TOGGLE_CUSTOM_METADATA
//
function toggle_custom_metadata()
{
  // page: unit_selection
  // units: taxonomy
  // toggles domain checkboxes on/off
  var boxes = document.getElementsByClassName('custom_meta_ckbx');
  var i;
  if (boxes[0].checked === false) {
      for (i = 0; i < boxes.length; i++) {
          boxes[i].checked = true;
          document.getElementById('toggle_meta_c_btn').checked = true;
      }
  } else {
      for (i = 0; i < boxes.length; i++) {
          boxes[i].checked = false;
          document.getElementById('toggle_meta_c_btn').checked = false;
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
}

// visualization: check_form_pg2.js

var get_graphics_form = document.getElementById('get_graphics_form');
var get_graphics = document.getElementById('get_graphics');
if (typeof get_graphics !=="undefined")
{
  get_graphics.addEventListener('click', function () {
    var unit_selection = get_graphics_form["unit_selection"].value;
    if (unit_selection === 'tax_silva108_simple')
    {
      msg = 'You must select some taxa';
      var taxa_checked = check_form(get_graphics_form, msg, "domains[]");
    }
    if (unit_selection === 'tax_silva108_custom')
    {
      msg = 'You must select some custom taxa';
      var taxa_checked = check_form(get_graphics_form, msg, "custom_taxa");
      //get_graphics_form.submit();
      
    }
    if (taxa_checked)
    {
     // msg = 'You must select one or more display output choices';
     // check_form(get_graphics_form, msg, "visuals[]");
    }
  });
}

// custom taxa tree
function show_custom_taxa_tree()
{
  $('.tree li:has(ul)').addClass('parent_li');
  $('.tree .parent_li > span.sign > i').addClass('icon-plus-sign').removeClass('icon-no-sign');

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

  // Default Selection Mode: Clade
  $('input.custom-taxa').click({param1: "clade"}, check_input);

  $('.radiobox input').click(function() {
    check_mode = this.id;
    $('input.custom-taxa').unbind('click');
    $('input.custom-taxa').click({param1: check_mode}, check_input);

  });

  $('.open-one-layer').dblclick(open_one_layer);
}

var check_input = function(event)
{
  var check_mode = event.data.param1;
  var children = $(this).parent('li.parent_li').find(' > ul > li');
  if (children.is(":visible")) {
    check_mode === "clade" ? check_last_visible(this) : toggle_checking;

  } 
  // uncomment to show children on check
  // else {
    // show_children(this);
    // alert("HERE");
  // }
};

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
       //Handle errors here
     }
  });
};

var check_last_visible = function(this_input)
{
  all_plus_vis = $(this_input).closest('ul').find('.icon-plus-sign:visible, .icon-no-sign:visible');
  all_inputs_vis = all_plus_vis.closest('span.sign').siblings('input.custom-taxa');
  all_inputs_vis.each(toggle_checking);
};

var show_children = function(current)
{
  $(current).parent('li.parent_li').find(' > ul > li').show('fast');
  var span_sign = $(current).parent('li.parent_li').find(' > span').filter('.sign');
  span_sign.attr('title', 'Collapse this branch');
  span_sign.find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
};

var hide_children = function(current, children)
{
  children.hide('fast');
  $(current).parent('li.parent_li').find(' > span.sign > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
};

// todo: the same in project_dataset_tree.js
var toggle_checking = function()
{
  $(this.parentNode.parentNode).find('input').filter(":visible").prop('checked',
     function(idx, oldProp) {
       return !oldProp;
     });
};

var count_checked = function()
{
  a = $( "input" ).filter(':checked').length;
  alert(a);
};

// todo: similar in project_dataset_tree.js
var uncheck_closed =  function(current)
{
  $(current).siblings().find('input').each(function(i){$(this).prop( "checked", false )});
};

var toggle_children = function()
{
    var children = $(this).parent('li.parent_li').find(' > ul > li');
    var current = this;
    if (children.is(":visible")) {
        hide_children(current, children);
        uncheck_closed(this);
    } else {
        show_children(this);
    }

    return false;
};
//
// SAVE DATASET LIST
//
var save_datasets_list = function(ds_local,user)
{
	
    var timestamp = +new Date();  // millisecs since the epoch!
    
	var filename = user + '_datasets_' + timestamp + '.json';
    
    var args =  "datasets="+JSON.stringify(ds_local);
    args += "&filename="+filename;
    args += "&user="+user;
	//console.log('args '+args);
	var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", 'save_datasets', true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {

       if (xmlhttp.readyState == 4 ) {
         var string = xmlhttp.responseText;
		 alert(string);
       }
    };
    xmlhttp.send(args);
 	
}