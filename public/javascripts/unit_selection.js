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
  // }
  ;
}  

function show_custom_taxa_tree()
{
   var il = document.getElementById('my_custom_list').getElementsByTagName('li');
   for(i=0;i<il.length;i++)
   {
     il[i].hide;
   }
}
  // $(li).
  //   <li>
  //     <label class='tax_select'>
  // <!-- ///////// D O M A I N /////////////////////////////////////////////// -->
  //       <a href=''  id='<%= id %>_toggle' class='domain_toggle'  onclick="toggle_selected_taxa('domain','<%= id %>'); return false;" >
  //         <img alt='plus' src='/images/tree_plus.gif'/>
  //       </a>
  //       <input type='checkbox' id='<%= id %>--cbid' name='domain_names[]' value='<%= domain %>' onclick="open_taxa('<%= id %>'); return false;"/>
  //     </label>
  //     <span ondblclick="open_level('<%= id %>','<%= JSON.stringify(all_tax_data[domain]) %>','1'); return false;"><%= domain %></span>
  
  


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
