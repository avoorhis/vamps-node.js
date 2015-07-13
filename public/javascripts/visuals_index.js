
var view_saved_datasets_btn = document.getElementById('view_saved_datasets2_btn') || null;
if (view_saved_datasets_btn !== null) {
	view_saved_datasets_btn.addEventListener('click', function () {
  	  window.location='saved_datasets';
	});
}