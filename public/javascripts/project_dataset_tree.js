// var is_visible = function(div_to_check) {
//   if (div_to_check.css('display') === 'block')
//   {  return true; }
//   else
//   { return false; }
// };

var toggle_checking_all = function(clicked) {
  
  $(clicked.parentNode.parentNode).find('input').prop('checked',
     function(idx, oldProp) {
	   return !oldProp;
     });
  return false;
};

var toggle_checking_datasets_by_pr = function(pr_checkbox, datasets_per_pr) {
  if (pr_checkbox.prop('checked')) {
   datasets_per_pr.find('input').prop('checked', true);
  }
  else {
   datasets_per_pr.find('input').prop('checked', false);
  }
};

var toggle_checking_datasets = function(pr_checkbox, datasets_per_pr) {
  if (datasets_per_pr.find('input').prop('checked')) {
    datasets_per_pr.find('input').prop('checked', false);    
  }
  else {
    datasets_per_pr.find('input').prop('checked', true);
  }
};


var toggle_datasets = function(clicked) {
  $(clicked.parentNode.parentNode).find('.datasets_per_pr').toggle();
  return false;
};

var minus_img = function(my_img) {
  my_img.attr('src', '/images/tree_minus.gif').attr('alt', 'minus');
};

var plus_img  = function(my_img) {
  my_img.attr('src', '/images/tree_plus.gif').attr('alt', 'plus');
};

var toggle_plus_img = function(clicked) {
  var my_img = $(clicked).children();
  // if (is_visible($(clicked.parentNode.parentNode).find('.datasets_per_pr'))) {
  //   minus_img(my_img);
  // }
  
  if ($(clicked.parentNode.parentNode).find('.datasets_per_pr').is(":visible")) {
    minus_img(my_img);
  }  
  else {
    plus_img(my_img);
  }
  return false;
};

var checkme = function(){
  //var dataset_ids = document.getElementsByName('dataset_ids');
  alert('dataset_ids[0].value')
};

var uncheck_closed = function(parent_place) {
  // if (!is_visible(parent_place.find('.datasets_per_pr'))) {
  //   parent_place.find('input').prop('checked', false);
  // }
  if (parent_place.find('.datasets_per_pr').is(":hidden")) {
    parent_place.find('input').prop('checked', false);
  }
};

$(document).ready(function () {
   onPageLoad();
});
function onPageLoad(){
  // All commands here in separate file so I can run them after changing project list
    // by default everything is visible, in case there is no js
  $('.datasets_per_pr').addClass( "display_none" );
  
  // the minus sign should always close the tree AND uncheck all the ds cbs 
  //           the plus sign should always open the tree but not check anything.
  //  if the tree is closed the project cb should open AND check all the ds cbs
  //  if the tree is open the project cb should toggle on/off the ds cbs
  //  The project cb should never itself be checked — just open the tree and check ds (if tree is closed)
  //      and check or uncheck all the ds (if tree is open)

  // minus_plus_sign
  $('a.project_toggle').click(function(){
    toggle_datasets(this);
    // toggle_checking_all(this); 
    
    var datasets_per_pr = $(this.parentNode.parentNode).find('.datasets_per_pr');    
    toggle_checking_datasets(this, datasets_per_pr);
    toggle_plus_img(this);
    uncheck_closed($(this.parentNode.parentNode));
    return false;
    });
  
  // project checkbox
  $('input.project_toggle').click(function() {
     
    var checkbox = $(this);
    $(this).prop('checked', false)
    var datasets_per_pr = $(this.parentNode.parentNode).find('.datasets_per_pr');
    
    if (datasets_per_pr.is(":hidden")) {
      datasets_per_pr.show();
      minus_img(checkbox.siblings('a').find('img'));
    }
    toggle_checking_datasets(checkbox, datasets_per_pr);
  });
}

