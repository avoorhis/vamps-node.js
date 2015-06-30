// taxonomy_tree.js

$(document).ready(function () {
  // alert("HERE");

  $('a.domain_toggle').click(function(){
    alert("HERE: " + this.id);
    // toggle_selected_taxa('domain', this.id);
    // return false;
  });
});
// onclick="toggle_selected_taxa('domain','<%= id %>'); return false;"

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

  // Called from visuals_index: project--dataset tree
//alert(name);
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

function open_level(id, names_str, level) {
  // opens on double click
  var names = JSON.parse(names_str);
  var tax_div = document.getElementById(id+'_div');
  var new_id;
  //alert(names_str)
  //alert(level)
  //alert(tax_div.style.display)

  if( tax_div.style.display === '' || tax_div.style.display === 'none') {
      //alert('opening: first level')
      open_taxa(id);
  } else {
      for (var i in names) {
        new_id = id+';'+i;
        tax_div = document.getElementById(new_id+'_div');
        if( tax_div.style.display === '' || tax_div.style.display === 'none') {
          //alert('opening: '+new_id)
          //alert('opening: second level: '+new_id)
          open_taxa(new_id);
        }else{
          for (var j in names[i]) {
            new_id = id+';'+i+';'+j;
            //alert(new_id)
            tax_div = document.getElementById(new_id+'_div');
            if( tax_div.style.display === '' || tax_div.style.display === 'none') {
              //alert('opening: '+new_id)
              //alert('opening: third level: '+new_id)
              open_taxa(new_id);
            }else{
              for (var k in names[i][j]) {
                new_id = id+';'+i+';'+j+';'+k;
                tax_div = document.getElementById(new_id+'_div');
                if( tax_div.style.display === '' || tax_div.style.display === 'none') {
                  //alert('opening: forth level: '+new_id)
                  open_taxa(new_id);
                }else{
                  for (var l in names[i][j][k]) {
                    new_id = id+';'+i+';'+j+';'+k+';'+l;
                    tax_div = document.getElementById(new_id+'_div');
                    if( tax_div.style.display === '' || tax_div.style.display === 'none') {
                      //alert('opening: fifth level: '+new_id)
                      open_taxa(new_id);
                    }else{
                      for (var m in names[i][j][k][l]) {
                        new_id = id+';'+i+';'+j+';'+k+';'+l+';'+m;
                        tax_div = document.getElementById(new_id+'_div');
                        if( tax_div.style.display === '' || tax_div.style.display === 'none') {
                          //alert('opening: fifth level: '+new_id)
                          open_taxa(new_id);
                        }else{

                        }  
                      }
                    }
                  }
                }
              }
            }


          }
         
        }

      }
  }
  
}  // end fxn








