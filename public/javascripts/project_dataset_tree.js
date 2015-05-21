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

var toggle_checking_datasets = function(pr_checkbox, datasets_per_pr) {
  if (pr_checkbox.prop('checked')) {
   datasets_per_pr.find('input').prop('checked', true);
  }
  else {
   datasets_per_pr.find('input').prop('checked', false);
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

var uncheck_closed = function(parent_place) {
  // if (!is_visible(parent_place.find('.datasets_per_pr'))) {
  //   parent_place.find('input').prop('checked', false);
  // }
  if (parent_place.find('.datasets_per_pr').is(":hidden")) {
    parent_place.find('input').prop('checked', false);
  }
};

$(document).ready(function () {
   

  // by default everything is visible, in case there is no js
  $('.datasets_per_pr').addClass( "display_none" );

  $('a.project_toggle').click(function(){
    // e.preventDefault();
    toggle_datasets(this);
	//alert(JSON.stringify(this))
    toggle_checking_all(this);
    toggle_plus_img(this);
    uncheck_closed($(this.parentNode.parentNode));
    return false;
  });

  $('input.project_toggle').click(function() {
    
	  var checkbox = $(this);
      var datasets_per_pr = $(this.parentNode.parentNode).find('.datasets_per_pr');
    
    // if (!is_visible(datasets_per_pr)) {
    if (datasets_per_pr.is(":hidden")) {
      datasets_per_pr.show();
      minus_img(checkbox.siblings('a').find('img'));
    }
    toggle_checking_datasets(checkbox, datasets_per_pr);
  });
});
