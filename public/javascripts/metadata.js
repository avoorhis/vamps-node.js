


toggle_metadata = document.getElementById('toggle_metadata');
if (typeof toggle_metadata !=="undefined") {
  toggle_metadata.addEventListener('click', function () {
      toggle_metadata_view();
  });
}


//
// TOGGLE_METADATA_VIEW
//
function toggle_metadata_view()
{
  // page: metadata_table
  // toggles all/selected metadata
  
  var ckbx = document.getElementById('toggle_metadata');
  var load;
  if (ckbx.checked === true) {
          ckbx.checked = true;
          document.getElementById('md_select_phrase1').innerHTML = "Showing All Metadata";
          document.getElementById('md_select_phrase2').innerHTML = "Show Selected Metadata Only?";
          load = 'all'
  } else {
          ckbx.checked = false;
          document.getElementById('md_select_phrase1').innerHTML = "Showing Selected Metadata Only";
          document.getElementById('md_select_phrase2').innerHTML = "Show All Metadata?";
          load = 'selected'
  }

	var xmlhttp = new XMLHttpRequest();  
  xmlhttp.open("GET", '/visuals/partials/load_metadata?load='+load);
  xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState == 4 ) {
           var string = xmlhttp.responseText;
           document.getElementById('metadata_table_div').innerHTML = string;
           new Tablesort(document.getElementById('metadata_table'));
        }
  };
  xmlhttp.send();

}