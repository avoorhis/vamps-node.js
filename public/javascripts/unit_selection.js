// visualization: unit_selection.js

$(document).ready(function(){

    $('.selectpicker').selectpicker({showSubtext:true, tickIcon: '',});
    //unit_selection_id
    $("#unit_selection_id").on("change", get_requested_units_selection_box);

    toggle_meta_r_btn = document.getElementById('toggle_meta_r_btn') || null;
    if (toggle_meta_r_btn !== null) {
      toggle_meta_r_btn.addEventListener('click', function () {
          toggle_required_metadata();
      });
    }

    toggle_meta_c_btn = document.getElementById('toggle_meta_c_btn') || null;
    if (toggle_meta_c_btn !== null) {
      toggle_meta_c_btn.addEventListener('click', function () {
          toggle_custom_metadata();
      });
    }

    //get_requested_units_selection_box(unit_selection);

    load_initial_taxa_tree(unit_selection);
    //load_custom_tree();
    

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
  //alert(boxes)
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
//
//
function load_initial_taxa_tree(unit_selection) {
  get_requested_units_selection_box(unit_selection)
}
// var treeData = [
//     {title: "item1 with key and tooltip", tooltip: "Look, a tool tip!" },
//     {title: "item2: selected on init", selected: true },
//     {title: "Folder", folder: true, key: "id3",
//       children: [
//         {title: "Sub-item 3.1",
//           children: [
//             {title: "Sub-item 3.1.1", key: "id3.1.1" },
//             {title: "Sub-item 3.1.2", key: "id3.1.2" }
//           ]
//         },
//         {title: "Sub-item 3.2",
//           children: [
//             {title: "Sub-item 3.2.1", key: "id3.2.1" },
//             {title: "Sub-item 3.2.2", key: "id3.2.2" }
//           ]
//         }
//       ]
//     },
//     {title: "Document with some children (expanded on init)", key: "id4", expanded: true,
//       children: [
//         {title: "Sub-item 4.1 (active on init)", active: true,
//           children: [
//             {title: "Sub-item 4.1.1", key: "id4.1.1" },
//             {title: "Sub-item 4.1.2", key: "id4.1.2" }
//           ]
//         },
//         {title: "Sub-item 4.2 (selected on init)", selected: true,
//           children: [
//             {title: "Sub-item 4.2.1", key: "id4.2.1" },
//             {title: "Sub-item 4.2.2", key: "id4.2.2" }
//           ]
//         },
//         {title: "Sub-item 4.3 (hideCheckbox)", hideCheckbox: true },
//         {title: "Sub-item 4.4 (unselectable)", unselectable: true }
//       ]
//     },
//     {title: "Lazy folder", folder: true, lazy: true }
//   ];

// function load_custom_tree() {
//   var xmlhttp1 = new XMLHttpRequest();
  
//   document.getElementById('units_select_choices_div').innerHTML = '';

    
  
//   //xmlhttp1.addEventListener("load", transferComplete(file_id), false);
//   //alert('simple')
//   //xmlhttp1.open("GET", '/visuals/partials/tax_silva108_custom');
//   //xmlhttp1.onreadystatechange = function() {

//   //   if (xmlhttp1.readyState == 4 ) {

//   //      var data = xmlhttp1.responseText;
//         //alert(data)
//        //alert(file_id)
//         //document.getElementById('unit_selection_id').value = 'tax_silva108_custom'
//         //show_custom_taxa_tree();
        
//             //alert(data)
//             $("#customTree").fancytree({
//               checkbox: true,
//               icon: true,
//               //imagePath:'fancytree',
//               source: treeData , //JSON.parse(data),
              
//               cache: false
//               //source: $.ajax({url:file_path,  dataType: "json"})
                
//             });

//   //      }
//   //};
//   //xmlhttp1.send();
// }
//
// GET REQUESTED UNITS SELECTION BOX
//
function get_requested_units_selection_box(file) {
  
  if(this.value){
    var file_id = this.value
  }else{
    var file_id = file
  }
  //alert(file_id)
  //alert(file_id)
  // Using ajax it will show the requested units module
  var file = '';
  var partial_name = '/visuals/partials/'+file_id;
  //var partial_name = '/public/json/tax_silva108_custom.json' //+file_id;
  //alert(partial_name)
  var xmlhttp1 = new XMLHttpRequest();
  var xmlhttp2 = new XMLHttpRequest();
  var customTree;  // = new dhtmlXTreeObject("treeBox","100%","100%",0);
  $("#echoSelection").text('');
  document.getElementById('units_select_choices_div').innerHTML = '';

    
  xmlhttp1.addEventListener("load", transferComplete(file_id), false);
  //alert('simple')
  xmlhttp1.open("GET", partial_name);
  xmlhttp1.onreadystatechange = function() {

         if (xmlhttp1.readyState == 4 ) {

            var data = xmlhttp1.responseText;
            
           //alert(file_id)
            document.getElementById('unit_selection_id').value = file_id
            //show_custom_taxa_tree();
            if(file_id == 'tax_silva108_simple'){
              
                document.getElementById('units_select_choices_div').innerHTML = data;
                toggle_taxa_btn = document.getElementById('toggle_taxa_btn') || null;
                if (toggle_taxa_btn !== null) {
                  toggle_taxa_btn.addEventListener('click', function () {
                      toggle_simple_taxa();
                  });
                } 

            }else if(file_id == 'tax_silva108_custom'){
                //alert('custom')
                document.getElementById('units_select_choices_div').innerHTML = data;
                show_custom_taxa_tree()
                



            }else if(file_id == 'tax_silva108_custom_fancytree'){
                //alert(data)
                customFile = "/json/tax_silva108_custom_fancytree.json" 
                $("#units_select_choices_div").fancytree({
                  checkbox: true,
                  icon: false,
                  clickFolderMode: 4,
                  selectMode: 2,
                  keyPathSeparator: "/",
                  //generateIds: true,
                  //idPrefix:'XXX_',
                  //imagePath:'fancytree',
                  //source:  JSON.parse(data),
                  source:  {
                    url:customFile
                  },

                  
                  select: function(event, data) {
                    // Display list of selected nodes
                    var selNodes = data.tree.getSelectedNodes();
                    // convert to title/key array
                    var selKeys = $.map(selNodes, function(node){
                         return "[" + node.key + "]: '" + node.title + "'";
                         //return node.getKeyPath()
                      });
                    $("#echoSelection").text(selKeys);
                  },
                  click: function(event, data) {
                    // We should not toggle, if target was "checkbox", because this
                    // would result in double-toggle (i.e. no toggle)
                    if( $.ui.fancytree.getEventTargetType(event) === "title" ){
                      data.node.toggleSelected();
                    }
                  },
                  keydown: function(event, data) {
                    if( event.which === 32 ) {
                      data.node.toggleSelected();
                      return false;
                    }
                  }

                  //cache: true
                  //source: $.ajax({url:file_path,  dataType: "json"})
                    
                });
                
                $('#get_graphics_form').submit(function() {
                  // Render hidden <input> elements for active and selected nodes
                  
                  $("#units_select_choices_div").fancytree("getTree").generateFormElements();

                  //alert("POST data:\n" + jQuery.param($(this).serializeArray()));
                  
                  // return false to prevent submission of this sample
                  //return false;
                });
            }else if(file_id == 'tax_silva108_custom_dhtmlx'){
                //alert(data)
                
                customTree = new dhtmlXTreeObject("units_select_choices_div","100%","100%",0);
                customTree.setImagesPath("/images/dhtmlx/imgs/");
                customTree.enableCheckBoxes(true);
                customTree.enableTreeLines(true); // true by default
                customTree.enableTreeImages(false);
                customTree.enableThreeStateCheckboxes(true);
                customTree.enableSmartCheckboxes(true);
                //customTree.setImagesPath("/Users/avoorhis/programming/vamps-node.js/public/images/dhtmlx/imgs/");
                
                // USING file: AJAX not needed here
                customFile = "/json/tax_silva108_custom_dhtmlx.json"
                //document.getElementById('units_select_choices_div').innerHTML = 'customTree';
                
                customTree.load(customFile,"json");
                //customTree.parse(JSON.parse(data),"json");

                //alert(customTree.getAllLeafs())
            }
            xmlhttp2.open("GET", 'set_units?units='+file_id);
            xmlhttp2.send();
         }
  };
  xmlhttp1.send();

}
// function get_requested_units_selection_box_orig(file) {
//   //alert(file)
//   if(this.value){
//     var file_id = this.value
//   }else{
//     var file_id = file
//   }
  
//   //alert(file_id)
//   // Using ajax it will show the requested units module
//   var file = '';
//   var partial_name = '/visuals/partials/'+file_id;
//   //alert(partial_name)
//   var xmlhttp1 = new XMLHttpRequest();
//   var xmlhttp2 = new XMLHttpRequest();
//   xmlhttp1.addEventListener("load", transferComplete(file_id), false);

//   xmlhttp1.open("GET", partial_name);
//   xmlhttp1.onreadystatechange = function() {

//          if (xmlhttp1.readyState == 4 ) {

//             var string = xmlhttp1.responseText;
//             var div = document.getElementById('units_select_choices_div').innerHTML = string;
//            //alert(file_id)
//             document.getElementById('unit_selection_id').value = file_id
//             show_custom_taxa_tree();
//             if(file_id == 'tax_silva108_simple'){
//               toggle_taxa_btn = document.getElementById('toggle_taxa_btn') || null;
//               //alert(toggle_taxa_btn)
//               if (toggle_taxa_btn !== null) {
//                 toggle_taxa_btn.addEventListener('click', function () {
//                     toggle_simple_taxa();
//                 });
//               }
//             }
//             xmlhttp2.open("GET", 'set_units?units='+file_id);
//             xmlhttp2.send();
//          }
//   };
//   xmlhttp1.send();
// }
// function get_requested_units_selection_box2(file) {
  
//   if(this.value){
//     var file_id = this.value
//   }else{
//     var file_id = file
//   }
//   //alert(file_id)
//   //alert(file_id)
//   // Using ajax it will show the requested units module
//   var file = '';
//   var partial_name = '/visuals/partials/'+file_id;
//   //var partial_name = '/public/json/tax_silva108_custom.json' //+file_id;
//   //alert(partial_name)
//   var xmlhttp1 = new XMLHttpRequest();
//   var xmlhttp2 = new XMLHttpRequest();
//   document.getElementById('units_select_choices_div').innerHTML = '';

    
//   //xmlhttp1.addEventListener("load", transferComplete(file_id), false);
//   //alert('simple')
//   xmlhttp1.open("GET", partial_name);
//   xmlhttp1.onreadystatechange = function() {

//          if (xmlhttp1.readyState == 4 ) {

//             var data = xmlhttp1.responseText;
            
//            //alert(file_id)
//             document.getElementById('unit_selection_id').value = file_id
//             //show_custom_taxa_tree();
//             if(file_id == 'tax_silva108_simple'){
              
//                 document.getElementById('units_select_choices_div').innerHTML = data;
//                 toggle_taxa_btn = document.getElementById('toggle_taxa_btn') || null;
//                 if (toggle_taxa_btn !== null) {
//                   toggle_taxa_btn.addEventListener('click', function () {
//                       toggle_simple_taxa();
//                   });
//                 } 

//             }else{
              
//                 //alert(data)
//                 $("#units_select_choices_div").fancytree({
//                   checkbox: true,
//                   icon: false,
//                   clickFolderMode: 4,
//                   selectMode: 2,
//                   keyPathSeparator: "/",
//                   //generateIds: true,
//                   //idPrefix:'XXX_',
//                   //imagePath:'fancytree',
//                   source:  JSON.parse(data),
//                   //source:  treeData //JSON.parse(data),
//                   select: function(event, data) {
//                     // Display list of selected nodes
//                     var selNodes = data.tree.getSelectedNodes();
//                     // convert to title/key array
//                     var selKeys = $.map(selNodes, function(node){
//                          return "[" + node.key + "]: '" + node.title + "'";
//                          //return node.getKeyPath()
//                       });
//                     $("#echoSelection").text(selKeys);
//                   },
//                   click: function(event, data) {
//                     // We should not toggle, if target was "checkbox", because this
//                     // would result in double-toggle (i.e. no toggle)
//                     if( $.ui.fancytree.getEventTargetType(event) === "title" ){
//                       data.node.toggleSelected();
//                     }
//                   },
//                   keydown: function(event, data) {
//                     if( event.which === 32 ) {
//                       data.node.toggleSelected();
//                       return false;
//                     }
//                   }

//                   //cache: true
//                   //source: $.ajax({url:file_path,  dataType: "json"})
                    
//                 });
                
//                 $('#get_graphics_form').submit(function() {
//                   // Render hidden <input> elements for active and selected nodes
                  
//                   $("#units_select_choices_div").fancytree("getTree").generateFormElements();

//                   //alert("POST data:\n" + jQuery.param($(this).serializeArray()));
                  
//                   // return false to prevent submission of this sample
//                   //return false;
//                 });



//             }
//             xmlhttp2.open("GET", 'set_units?units='+file_id);
//             xmlhttp2.send();
//          }
//   };
//   xmlhttp1.send();

// }

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
var get_graphics = document.getElementById('get_graphics') || null;
if (get_graphics !== null)
{
  get_graphics.addEventListener('click', function () {
    var unit_selection = get_graphics_form["unit_selection"].value;
    if (unit_selection === 'tax_silva108_simple')
    {
      msg = 'You must select some taxa';
      var taxa_checked = check_form(get_graphics_form, msg, "domains[]");
    }else if (unit_selection === 'tax_silva108_custom')
    {
      msg = 'You must select some custom taxa';
      var taxa_checked = check_form(get_graphics_form, msg, "custom_taxa");
      //var taxa_checked = check_form(get_graphics_form, msg, "ft_1");
      get_graphics_form.submit();
      
    }else{
      get_graphics_form.submit();
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
