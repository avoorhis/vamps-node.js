
var view_saved_datasets_btn = document.getElementById('view_saved_datasets_btn');

if (typeof view_saved_datasets_btn !== 'undefined') {
	view_saved_datasets_btn.addEventListener('click', function () {
  	  window.location='saved_datasets';
	});
}