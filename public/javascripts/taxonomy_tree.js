// taxonomy_tree.js

function toggle_selected_taxa(level,name) {

  var tax_div = document.getElementById(name+'_div');
  var cbs = tax_div.getElementsByTagName('input');
  var toggle = document.getElementById(name+'_toggle');
  var i;

  if (tax_div.style.display === 'inline'){
    tax_div.style.display = 'none';
    document.getElementById(name+'--cbid').checked = false;
    // change image to plus.png
    toggle.innerHTML = "<img alt='plus' src='/images/tree_plus.gif'/>";
    for (i=0; i < cbs.length; i++) {
      if (cbs[i].type === 'checkbox') {
        cbs[i].checked = false;
      }
    }
  } else {
    tax_div.style.display = 'inline';
    document.getElementById(name+'--cbid').checked = true;
    toggle.innerHTML = "<img alt='minus' src='/images/tree_minus.gif'/>";
    for (i=0; i < cbs.length; i++) {
      if (cbs[i].type === 'checkbox') {
        cbs[i].checked = true  ;
      }
    }
  }
}

function open_taxa(name) {

  // Called from index_visuals: project--dataset tree

  var tax_div = document.getElementById(name+'_div');
  var cbs = tax_div.getElementsByTagName('input');
  var toggle = document.getElementById(name+'_toggle');
  var i;
  if (tax_div.style.display === 'inline'){


    // uncheck project
    if (cbs[0].checked) {
      document.getElementById(name+'--cbid').checked = false;
      for (i=0; i < cbs.length; i++) {
        cbs[i].checked = false;
      }
    } else {
      document.getElementById(name+'--cbid').checked = true;
      for (i=0; i < cbs.length; i++) {
        cbs[i].checked = true;
      }
    }

  } else {

    // check project
    tax_div.style.display = 'inline';
    document.getElementById(name+'--cbid').checked = true;
    toggle.innerHTML = "<img alt='minus' src='/images/tree_minus.gif'/>";
    // now set all the ds checkboxes to 'checked'
    for (i=0; i < cbs.length; i++) {
      if (cbs[i].type === 'checkbox') {
        cbs[i].checked = true;
      }
    }
  }
}

function open_level(id, names, level) {
  var x = JSON.parse(names);
  alert(id);
  for (var i=0; i < x.length; i++) {
    //alert(i)
    var new_id = id+';'+i;
    open_taxa(new_id);
  }
}

