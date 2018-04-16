// visualization: unit_selection.js
var get_graphics_form = document.getElementById('get_graphics_form');
var get_graphics_btn = document.getElementById('get_graphics_btn') || null;
//custom_selection = 'html'
//custom_selection = 'fancytree'
custom_selection = 'dhtmlx'
var simple_loaded, custom_loaded, rdp_loaded;
mode='clade'  // or individual
document.getElementById('select_type_clade').checked = true;

$(document).ready(function(){

    $('.selectpicker').selectpicker({showSubtext:true, tickIcon: '',});
    //unit_selection_id
    //$("#unit_selection_id").on("change", get_requested_units_selection_box);
    $("#unit_choice_id").on("change", show_tax_selection_box);

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

    //get_requested_units_selection_box(unit_choice);

    load_initial_taxa_tree(unit_choice);
    //load_custom_tree();
    

});

if (get_graphics_btn !== null)
{

  get_graphics_btn.addEventListener('click', function () {
    //var unit_choice = get_graphics_form["unit_choice"].value;
    // alert(unit_choice)
    msg = 'You must select some taxa';
    var selected_unit_choice = document.getElementById('unit_choice_id').value
    //alert(selected_unit_choice+' '+custom_selection)
    if (selected_unit_choice === 'tax_silva119_simple'){
      var taxa_checked = check_form(get_graphics_form, msg, "domains[]");
    }else if (selected_unit_choice === 'tax_rdp2.6_simple'){
      var taxa_checked = check_form(get_graphics_form, msg, "domains[]");
    }else if (selected_unit_choice === 'tax_generic_simple'){
      var taxa_checked = check_form(get_graphics_form, msg, "domains[]");
    }else if (selected_unit_choice === 'tax_silva119_custom')
    {
      if(custom_selection == 'html'){
        var taxa_checked = check_form(get_graphics_form, msg, "custom_taxa");
        //var taxa_checked = check_form(get_graphics_form, msg, "ft_1");
      }else if(custom_selection == 'fancytree'){
        tree = $('#custom_treebox').fancytree('getTree');
        // nodes are weird: node[0]= <FancytreeNode(#1, 'Archaea')>
        var node_ids = $.map(tree.getSelectedNodes(), function(node){
            return node.key;
        });
        // add hidden input
        if(node_ids === ''){
          alert(msg)
          return
        }else{
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'custom_taxa';
          input.value = node_ids.toString();
          get_graphics_form.appendChild(input);
        }
        
      }else if(custom_selection == 'dhtmlx'){
        var node_ids = customTree.getAllChecked()
        // nodes are keys to server: new_taxonomy.taxa_tree_dict_map_by_id
        //alert(node_ids)
        //alert(typeof node_ids)
        if(node_ids === ''){
          alert(msg)
          return
        }else{
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'custom_taxa';
          input.value = node_ids.toString();
          get_graphics_form.appendChild(input);
        }
        
      }
      get_graphics_form.submit();
      
    }else{
      alert('ERROR '+selected_unit_choice)
    }
    if (taxa_checked)
    {
     // msg = 'You must select one or more display output choices';
     // check_form(get_graphics_form, msg, "visuals[]");
    }
  });
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
function load_initial_taxa_tree(unit_choice) {
  //get_requested_units_selection_box(unit_choice)
  // all created on INITIAL PAGE LOAD
  
  document.getElementById('unit_choice_id').value = unit_choice
  var xmlhttp2 = new XMLHttpRequest();
  switch(unit_choice){
    case 'tax_silva119_simple':
      load_silva119_tax_simple();
      // globals
      simple_loaded = true;  custom_loaded = false; rdp_loaded = false;generic_loaded=false;// fancytree_loaded = false;  dhtmlx_loaded = false
      document.getElementById('simple_treebox').style.display = 'block'
      document.getElementById('custom_tax_div').style.display = 'none'
      document.getElementById('generic_treebox').style.display = 'none'
      document.getElementById('rdp_treebox').style.display = 'none'
      
      break;
    case 'tax_silva119_custom':
      load_custom_tax_tree();
      // globals
      simple_loaded = false;  custom_loaded = true; rdp_loaded = false;generic_loaded=false;// fancytree_loaded = false;  dhtmlx_loaded = false
      document.getElementById('simple_treebox').style.display = 'none'
      document.getElementById('custom_tax_div').style.display = 'block'
      document.getElementById('generic_treebox').style.display = 'none'
      document.getElementById('rdp_treebox').style.display = 'none'
      
      break;
    case 'tax_rdp2.6_simple':
        
      load_rdp_tax_simple()
      // globals
      simple_loaded = false;  custom_loaded = false; rdp_loaded = true;generic_loaded=false;
      document.getElementById('simple_treebox').style.display = 'none'
      document.getElementById('custom_tax_div').style.display = 'none'
      document.getElementById('generic_treebox').style.display = 'none'
      document.getElementById('rdp_treebox').style.display = 'block'
      
      break;   
    case 'tax_generic_simple':
        
      load_rdp_tax_simple()
      // globals
      simple_loaded = false;  custom_loaded = false; rdp_loaded = false;generic_loaded=true;
      document.getElementById('simple_treebox').style.display = 'none'
      document.getElementById('custom_tax_div').style.display = 'none'
      document.getElementById('generic_treebox').style.display = 'block'
      document.getElementById('rdp_treebox').style.display = 'none'
      
      break;   
    default:
      alert(unit_choice+' not implemented...')
  }
  
  //xmlhttp2.open("GET", 'set_units?units='+unit_choice);
  //xmlhttp2.send();

}
function load_silva119_tax_simple() {
      var xmlhttp1 = new XMLHttpRequest();
      xmlhttp1.open("GET", '/visuals/partials/tax_silva119_simple');
      xmlhttp1.onreadystatechange = function() {

             if (xmlhttp1.readyState == 4 ) {

                var data = xmlhttp1.responseText;
                
                //alert(file_id)
                document.getElementById('unit_choice_id').value = 'tax_silva119_simple'
                //show_custom_taxa_tree();
                
                document.getElementById('simple_treebox').innerHTML = data;
                disable_or_enable_chbxs(document.getElementsByClassName('simple_taxa_rdp_ckbx'), document.getElementsByClassName('simple_taxa_silva_ckbx')) // so won't be sent to server
                toggle_taxa_btn = document.getElementById('toggle_taxa_silva_btn') || null;
                if (toggle_taxa_btn !== null) {
                  toggle_taxa_btn.addEventListener('click', function () {
                      
                      toggle_simple_taxa('simple_taxa_silva_ckbx',toggle_taxa_btn);
                  });
                } 
                simple_loaded = true
             }
      };
      xmlhttp1.send();
}
function load_generic_tax_simple() {
      var xmlhttp1 = new XMLHttpRequest();
      xmlhttp1.open("GET", '/visuals/partials/tax_generic_simple');
      xmlhttp1.onreadystatechange = function() {

             if (xmlhttp1.readyState == 4 ) {

                var data = xmlhttp1.responseText;
                //alert(file_id)
                document.getElementById('unit_choice_id').value = 'tax_generic_simple'
                //show_custom_taxa_tree();
                
                document.getElementById('generic_treebox').innerHTML = data;
                disable_or_enable_chbxs(document.getElementsByClassName('simple_taxa_silva_ckbx'), document.getElementsByClassName('simple_taxa_generic_ckbx')) // so won't be sent to server
                toggle_taxa_btn = document.getElementById('toggle_taxa_generic_btn') || null;
                if (toggle_taxa_btn !== null) {
                  toggle_taxa_btn.addEventListener('click', function () {
                      
                      toggle_simple_taxa('simple_taxa_generic_ckbx',toggle_taxa_btn);
                  });
                } 
                generic_loaded = true
             }
      };
      xmlhttp1.send();
}
function load_custom_tax_tree() {
      
      switch(custom_selection){

        case 'html':
            var xmlhttp1 = new XMLHttpRequest();
            xmlhttp1.open("GET", '/visuals/partials/tax_silva119_custom');
            xmlhttp1.onreadystatechange = function() {

                   if (xmlhttp1.readyState == 4 ) {

                      var data = xmlhttp1.responseText;
                      
                     //alert(file_id)
                      document.getElementById('unit_choice_id').value = 'tax_silva119_custom'
                      //show_custom_taxa_tree();
                      
                      //alert('custom')
                      document.getElementById('custom_treebox').innerHTML = data;
                      show_custom_taxa_tree()
                      custom_loaded = true
                   
                      
                   }
            };
            xmlhttp1.send();
            break;
        case 'fancytree':
            load_fancytree();
            // customTree.bind("fancytreedblclick", function(event, data){
            //   if( data.node.isFolder() ){
            //     return false;
            //   }
            // });
            break;
        case 'dhtmlx':
            load_dhtmlx()
            break;
        default:
          alert('error')
    }

}
function load_rdp_tax_simple() {
      
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", '/visuals/partials/tax_rdp2.6_simple');
      xmlhttp.onreadystatechange = function() {
              
             if (xmlhttp.readyState == 4 ) {

                var data = xmlhttp.responseText;
                
                
                document.getElementById('unit_choice_id').value = 'tax_rdp2.6_simple'
                //show_custom_taxa_tree();
                
                document.getElementById('rdp_treebox').innerHTML = data;
                
                disable_or_enable_chbxs(document.getElementsByClassName('simple_taxa_silva_ckbx'), document.getElementsByClassName('simple_taxa_rdp_ckbx')) // so won't be sent to server
                toggle_taxa_btn = document.getElementById('toggle_taxa_rdp_btn') || null;
                if (toggle_taxa_btn !== null) {
                  toggle_taxa_btn.addEventListener('click', function () {
                      
                      toggle_simple_taxa('simple_taxa_rdp_ckbx',toggle_taxa_btn);

                  });
                } 
                rdp_loaded = true
             }
      };
      xmlhttp.send();
}
function disable_or_enable_chbxs(bxs_to_disable, bxs_to_enable){
  //alert(bxs_to_disable.length)
  for(var i = 0;i < bxs_to_disable.length; i++) {
    //if(bxs_to_disable[i].style.display == 'none') {
        //alert(bxs_to_disable)
        bxs_to_disable[i].disabled = true;
    //}
  }
  for(var i = 0;i < bxs_to_enable.length; i++) {
      //if(bxs_to_enable[i].style.display == 'none') {
          //alert(bxs_to_enable)
          bxs_to_enable[i].disabled = false;
      //}
  }
}
// function load_fancytree() {
    
//     //customFile = "/json/tax_silva108_custom_fancytree.json" 
//     customTree = $("#custom_treebox").fancytree({
//       checkbox: true,
//       icon: false,
//       clickFolderMode: 4,
//       selectMode: 3,
//       keyPathSeparator: "/",
//       //generateIds: true,
//       //idPrefix:'XXX_',
//       //imagePath:'fancytree',
//       //source:  JSON.parse(data),
//       source:  {
//         //url:customFile,
//         url:'/visuals/tax_custom_fancytree'
//       },
//       //dblclick: function(event, data) {
//       //  return false;
//       //},
//       dblclick: function(event, data) {
//         //data.node.toggleSelected();
//         //data.node.toggleExpanded();
//         //alert(data.node)
//         var node = data.node;
//         //id = node.id
//         var id = node.key
//         var taxon = node.title
//         //alert(taxon) 
//         expand_children_fancytree(node)
//         return false;  // this turns off/on default behavior
//       },
//       lazyLoad: function(event, data){
//           var node = data.node;
//           //alert(node.key,' ',node.node_id)
//           // Load child nodes via ajax GET /getTreeData?mode=children&parent=1234
//           data.result = {
//              url: "/visuals/tax_custom_fancytree?id="+node.key,
//              data: {mode: "children", parent: node.key},
//              cache: false
//            };
//       },
      
//     });
//     custom_loaded = true
// }

// function expand_children_fancytree(node) {
//   //alert(node)

  

//   if(node.isExpanded()){
//     // second+ times through: -- node is open
//     // get children and open one level

//     child_nodes = node.getChildren()
//     // alert(child_nodes)
//     for(i in child_nodes){
//        cnode = child_nodes[i]
//        alert(cnode)
       
       
//        expand_children(cnode)
//     }
//   }else{
//     //first time through: node is not expanded: must open(lazy) first
//     node.load().done(function() {
//         //child_nodes = node.getChildren()
        
//         node.setExpanded(true);
//         //alert(child_nodes)
//         // for(i in child_nodes){
//         //   cnode = child_nodes[i]
//         //   //expand_children(cnode)
//         //   cnode.setExpanded()
//         // }
//         //node.visit(function(childNode) {
//           //alert(childNode)
//           //node.setExpanded(true);
//            // childNode.setExpanded(true);
//             //expand_children(childNode)
//         //});
//     });

//     //child_nodes = node.getChildren()
//   }
  
//   //alert(child_nodes)
//   // for(n in child_nodes){
//   //   cnode = child_nodes[n]
//   //   alert(cnode)
//   // }
// }
function load_dhtmlx() {
    customTree = new dhtmlXTreeObject("custom_treebox","100%","100%",0);
    customTree.setImagesPath("/images/dhtmlx/imgs/");
    customTree.enableCheckBoxes(true);
    //customTree.enableThreeStateCheckboxes(true);
    customTree.enableTreeLines(true); // true by default
    customTree.enableTreeImages(false);
    customTree.attachEvent("onCheck",function(id){
        on_check_dhtmlx(id)
    });
    customTree.attachEvent("onDblClick", function(id){
        expand_tree_dhtmlx(id)
    });
    
    customTree.setXMLAutoLoading("/visuals/tax_custom_dhtmlx");
	  customTree.setDataMode("json");
	  //load first level of tree
	  customTree.load("/visuals/tax_custom_dhtmlx?id=0","json");
    
    // USING file: AJAX not needed here
    //customFile = "/json/tax_silva108_custom_dhtmlx.json"
    //customTree.load(customFile,"json");
    
    custom_loaded = true
    
}

// initialize

function change_mode_dhtmlx(change_to_mode){
  mode = change_to_mode;
  //document.getElementById('select_type_'+change_to_mode).checked = true;
}

function reset_tree_dhtmlx(){
  clk_counter = 0
  customTree.refreshItem();
}
function on_check_dhtmlx(id){

  if(mode == 'individual') 
   {
       //this.setSubChecked(id,false);
       // allows only the individual checkbox tobe 
       // selected or unselected.
      // if(customTree.isItemChecked(id)){
      //   alert('checked')
      //   //customTree.setCheck(id,false);

      // }else{
      //   alert('not checked')
      //   //customTree.setCheck(id,true);
      // }

      
   }else{  // clade mode ....
       customTree.openItem(id);
  
       if(customTree.isItemChecked(id)){
          customTree.setSubChecked(id,false);
          customTree.setCheck(id,true);   
          //alert(id)
       }else{
             //turn off this level
          customTree.setCheck(id,false);
          subTaxons = customTree.getAllSubItems(id);
          subTaxonsArray = subTaxons.split(',');
          //alert(subTaxons)
          for(i=0;i<subTaxonsArray.length;i++)
          {
           
            sid = subTaxonsArray[i];
            //alert(sid)
            //open state only applies to folders/nodes not leaves
            openState = customTree.getOpenState(sid);
            //alert(openState)
            //customTree.setCheck(sid,true);
          
            if(openState < 1){
              customTree.setCheck(sid,true);  
            }else{
              customTree.setCheck(sid,false); 
            }
    
          } //end of loop
          
       }

   }  
  // if(customTree.getOpenState(id)){
    
  //   nodes = customTree.getAllSubItems(id)
  //   alert(nodes)
  //   customTree.setSubChecked(id,true)

  // }else{
  //   // closed -- do nothing
  // }
}

function expand_tree_dhtmlx(id){
  //alert(customTree.hasChildren(id))
  //kids = customTree.getAllSubItems(id);
  level = customTree.getLevel(id)
  clk_counter = 0
  //clk_counter = level
  //alert(level)
  if ( customTree.hasChildren(id) ) {
       
      //clk_counter++;
      //if(clk_counter+level <= 7){
        //document.getElementById('custom_rank_info').innerHTML = 'opening;
        customTree.openAllItems(id,true); 

      //}else{
      //  alert('no more levels')
      //}

      
       
        // openkids = customTree.getAllSubItems(id).split(',');
        // //alert(openkids)
        // gotone = false
        // for(i in openkids){
        //   if(customTree.hasChildren(id)){
        //     gotone = true
        //   }
        // }
        // if(openkids !=[] && ! gotone){
        //   alert(gotone)
        // }

        
        //taxon = taxa[ccid];
        
        //alert(kids)
        // if(kids !=0)
        // {
             
        //      // here we try to prevent opening the OTU list on double click
        //      kids_array = kids.split(',');
        //      new_kids='';
        //      for(n=0;n<kids_array.length;n++){
                  
        //         new_kids = new_kids + kids_array[n] + ',';
                 
        //      }
        //      kids = new_kids.replace(/,$/,"");
             
        //      this.openItemsDynamic(kids,false);
        // }
  }else{
    alert('no sub-levels found')
  }

}
function show_tax_selection_box() {
  // show/hide
  
  //alert('in s-h sel box')
  target = this.value
  
  //alert(target)
  document.getElementById('unit_choice_id').value = target
  switch(target){
    case 'tax_silva119_simple':
        if(!simple_loaded){
          load_silva119_tax_simple()
        }
        document.getElementById('generic_treebox').style.display = 'none'
        document.getElementById('rdp_treebox').style.display     = 'none'
        document.getElementById('simple_treebox').style.display  = 'block'
        document.getElementById('custom_tax_div').style.display  = 'none'
        break;
        
    case 'tax_silva119_custom':
        if(!custom_loaded){
          load_custom_tax_tree()
        }
        document.getElementById('generic_treebox').style.display = 'none'
        document.getElementById('rdp_treebox').style.display     = 'none'
        document.getElementById('simple_treebox').style.display = 'none'
        document.getElementById('custom_tax_div').style.display = 'block'
        break;
        
    case 'tax_rdp2.6_simple':
        if(!rdp_loaded){
          load_rdp_tax_simple()
        }
        document.getElementById('generic_treebox').style.display = 'none'
        document.getElementById('rdp_treebox').style.display     = 'block'
        document.getElementById('simple_treebox').style.display = 'none'
        document.getElementById('custom_tax_div').style.display = 'none'
        break;  
         
    case 'tax_generic_simple':
        if(!generic_loaded){
          load_generic_tax_simple()
        }
        document.getElementById('generic_treebox').style.display = 'block'
        document.getElementById('rdp_treebox').style.display     = 'none'
        document.getElementById('simple_treebox').style.display = 'none'
        document.getElementById('custom_tax_div').style.display = 'none'
        break;   
    
    default:
        document.getElementById('generic_treebox').style.display = 'none'
        document.getElementById('rdp_treebox').style.display     = 'none'
        document.getElementById('simple_treebox').style.display = 'block'
        document.getElementById('custom_tax_div').style.display = 'none'
       
        alert('Not Implemented Yet')
  }
  document.getElementById('flash_message_id').innerHTML = ''
  var xmlhttp = new XMLHttpRequest();
  var args = {}
  args.units = target
  xmlhttp.open("POST", 'check_units');
  xmlhttp.setRequestHeader("Content-type","application/json");
  xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
            
            var response = xmlhttp.responseText;
            if(response == 'FAIL'){
                alert('Some or all of the selected datasets do not have associated taxonomy here')
            }
        }
  };
  xmlhttp.send(JSON.stringify(args));
  
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
