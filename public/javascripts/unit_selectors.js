  // unit_selctors.js



function get_taxa_sil106_simple(){
  
  var domains = ['Archaea','Bacteria','Eukarya','Organelle','Unknown'];
  var html = "<ul>";
  html += "<li class='bold_font'>Domains to Include:";
  
  html += "</li>";
  html += "<span class='small_font' >";
  html += "  <input type='checkbox' id='toggle_taxa_btn' name='taxa_ckbx_toggle' checked='checked' value='all'  onclick=\"toggle_simple_taxa()\"  \> Toggle Domains";
  html += "</span>";
  for (var i in domains) {  
    var domain = domains[i];
    html += "  <li>";
    html += "  <label class='taxa-select'>";
    html += "    <input type='checkbox' class='simple_taxa_ckbx' checked='checked' id='"+domain+"' name='' onclick=\"open_datasets()\" \>";
    html +=    domain;
    html += "  </label>";
    html += "  </li>";
  };
  html += "  <br>";
  html += "  <li><span class='bold_font'>Include NAs:</span><br><span class='small_font'>(taxonomy not available)</span></li>";
  html += "  <li><input type='radio' id='' name='include_nas' value='no' > Do Not Include NAs</li>";
  html += "  <li><input type='radio' id='' checked='checked' name='include_nas' value='yes' > Include NAs</li>";
  html += "  <br>";
  html += "  <li class='bold_font'>Taxonomic Depth:</li>";
  html += "  <li><input type='radio' id='' name='tax_depth' value='domain'  > Domain</li>";
  html += "  <li><input type='radio' id='' checked='checked' name='tax_depth' value='phylum' > Phylum</li>";
  html += "  <li><input type='radio' id='' name='tax_depth' value='class'   > Class</li>";
  html += "  <li><input type='radio' id='' name='tax_depth' value='order'   > Order</li>";
  html += "  <li><input type='radio' id='' name='tax_depth' value='family'  > Family</li>";
  html += "  <li><input type='radio' id='' name='tax_depth' value='genus'   > Genus</li>";
  html += "  <li><input type='radio' id='' name='tax_depth' value='species' > Species</li>";
  html += "  <li><input type='radio' id='' name='tax_depth' value='strain'  > Strain</li>";
  html += "</ul>";
  return html;

}
////////////////////////////////////
function get_taxa_sil106_custom(){
  return '<br><h2>not written yet-1</h2>';
}
  
function get_taxa_gg_simple(){
  return '<br><h2>not written yet-2</h2>';
}
  
function get_taxa_gg_custom(){
  return '<br><h2>not written yet-3</h2>';
}
function get_med_nodes(){
  return '<br><h2>not written yet-4</h2>';
}

