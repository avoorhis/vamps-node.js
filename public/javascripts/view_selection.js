
$(document).ready(function(){

    $('.selectpicker').selectpicker({showSubtext:true, tickIcon: '',});

    $("#metadata_local_table_div").on("click", "#metadata_table", function () {
        new Tablesort(document.getElementById('metadata_table'));
    });
});

$.fn.scrollView = function () {
    return this.each(function () {
        $('html, body').animate({
            scrollTop: $(this).offset().top -70
        }, 500);
    });
}

// code for tooltips

var $liveTip = $('<div id="livetip_chart"></div>').hide().appendTo('body'),
    $win = $(window),
    showTip;

var tip = {
  title: '',
  offset: 12,
  delay: 50,
  position: function(event) {
    var positions = {x: event.pageX, y: event.pageY};
    var dimensions = {
      x: [
        $win.width(),
        $liveTip.outerWidth()
      ],
      y: [
        $win.scrollTop() + $win.height(),
        $liveTip.outerHeight()
      ]
    };
 
    for ( var axis in dimensions ) {
 
      if (dimensions[axis][0] <dimensions[axis][1] + positions[axis] + this.offset) {
        positions[axis] -= dimensions[axis][1] + this.offset;
      } else {
        positions[axis] += this.offset;
      }
 
    }
 
    $liveTip.css({
      top: positions.y,
      left: positions.x
    });
  }
};


$("body").delegate(".tooltip_viz", "mouseover mouseout mousemove", function (event) {
      var link = this,
      html = '';
      $link = $(this);
     
      if (event.type == 'mouseover') {
        tip.id = link.id;
        link.id = '';
        id_items = tip.id.split('-|-');
        html = "<table><tr>";
        if(id_items[0] == 'dheatmap') {
          html += "<td>"+id_items[1]+"</td>";
          html += "</tr><tr>";
          html += "<td>"+id_items[2]+"</td>";
          html += "</tr><tr>";
          html += "<td>Distance: "+id_items[3]+"</td>";
        }else if(id_items[0] == 'frequencies'){
          html += "<td>"+id_items[1]+"</td>";
          html += "</tr><tr>";
          html += "<td>"+id_items[2]+"</td>";
          html += "</tr><tr>";
          html += "<td>Count: "+id_items[3]+" ("+id_items[4]+"%)</td>";
        }else{  // barcharts and piecharts            
          html += "<td>"+id_items[1]+"</td>";
          html += "</tr><tr>";
          html += "<td>Count: "+id_items[2]+" ("+id_items[3]+"%)</td>";
        }
        html += "</tr><table>";

        showTip = setTimeout(function() {
     
          $link.data('tipActive', true);
          
          tip.position(event);
     //alert(event.pageX)
          $liveTip
          .html('<div>' + html  + '</div>')
          .fadeOut(0)
          .fadeIn(200);
     
        }, tip.delay);
      }
     
      if (event.type == 'mouseout') {
        link.id = tip.id || link.id;
        if ($link.data('tipActive')) {
          $link.removeData('tipActive');
          $liveTip.hide();
        } else {
          clearTimeout(showTip);
        }
      }
     
      if (event.type == 'mousemove' && $link.data('tipActive')) {
        tip.position(event);
      }
              
});              

$("body").delegate(".tooltip_viz_help", "mouseover mouseout mousemove", function (event) {
      var link = this,
      html = '';
      $link = $(this);
     
      if (event.type == 'mouseover') {
        tip.id = link.id;
        //alert(tip.id)
        link.id = '';
        if(tip.id==''){
          return;  // no need to show if nothing there
        }
        id_items = tip.id.split('-|-');
        
        // html = "Requirements:<br>";
        // html += '<ul>';        
        // for(var i=0;i<=id_items.length-1;i++){
        //    //html += "<tr><td>"+id_items[i]+"</td></tr>"; 
        //    html += "<li>"+id_items[i]+"</li>"      
        // }
        // html += '</ul>';


        html = "<table>";
        html += "<tr><td>Requirements:</td></tr>";
        for(var i=0;i<=id_items.length-1;i++){
          html += "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;"+id_items[i]+"</td></tr>";       
        }
        html += "<table>";

        
        showTip = setTimeout(function() {
     
          $link.data('tipActive', true);
          
          tip.position(event);
     //alert(event.pageX)
          $liveTip
          .html('<div>' + html  + '</div>')
          .fadeOut(0)
          .fadeIn(200);
     
        }, tip.delay);
      }
     
      if (event.type == 'mouseout') {
        link.id = tip.id || link.id;
        if ($link.data('tipActive')) {
          $link.removeData('tipActive');
          $liveTip.hide();
        } else {
          clearTimeout(showTip);
        }
      }
     
      if (event.type == 'mousemove' && $link.data('tipActive')) {
        tip.position(event);
      }
              
});              
var showDots='';
// download fasta
if (document.getElementById('download_fasta_btn') !== null) {
download_fasta_btn = document.getElementById('download_fasta_btn');
if (typeof download_fasta_btn !== "undefined") {
  download_fasta_btn.addEventListener('click', function () {
      //alert(selected_distance_combo)
      form = document.getElementById('download_fasta_form_id');
      datasets = form.datasets.value;
      download_type = form.download_type.value; 
      ts =  '';       
      download_data('fasta', datasets, download_type, ts);
  });
}
}
// download metadata
if (document.getElementById('download_metadata_btn') !== null) {
download_metadata_btn = document.getElementById('download_metadata_btn');
if (typeof download_metadata_btn !== "undefined") {
  download_metadata_btn.addEventListener('click', function () {
      //alert(selected_distance_combo)
      form = document.getElementById('download_metadata_form_id');
      datasets = form.datasets.value;
      download_type = form.download_type.value;  
      ts =  '';      
      download_data('metadata', datasets, download_type, ts);
  });
}
}

if (document.getElementById('download_matrix_btn') !== null) {

download_matrix_btn = document.getElementById('download_matrix_btn');
if (typeof download_matrix_btn !== "undefined") {
  download_matrix_btn.addEventListener('click', function () {
      
      form = document.getElementById('download_matrix_form_id');
      datasets = form.datasets.value;
      download_type = form.download_type.value;       
      ts =  form.ts.value;    
      download_data('matrix', datasets, download_type, ts);
  });
}
}

// normalization radio-buttons
var norm_counts_radios = document.getElementsByName('normalization');
if (typeof norm_counts_radios[1] !=="undefined") {
  norm_counts_radios[1].addEventListener('click', function () {
    val = norm_counts_radios[1].value
    //alert('1 '+val)
	  document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update'
	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
}
if (typeof norm_counts_radios[2] !=="undefined") {
  norm_counts_radios[2].addEventListener('click', function () {
    val = norm_counts_radios[2].value
    //alert('2 '+val)
	  document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update'
	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
}
if (typeof norm_counts_radios[3] !=="undefined") {
  norm_counts_radios[3].addEventListener('click', function () {
    //alert('3')
    document.getElementById('output_choices_submit_btn').disabled = false;
    document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update'
    document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
}
// include_nas radio-buttons
var include_nas_radios = document.getElementsByName('include_nas');
if (typeof include_nas_radios[1] !=="undefined") {
  include_nas_radios[1].addEventListener('click', function () {
    //alert('1')
    document.getElementById('output_choices_submit_btn').disabled = false;
    document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update'
    document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
}
if (typeof include_nas_radios[2] !=="undefined") {
  include_nas_radios[2].addEventListener('click', function () {
    //alert('2')
    document.getElementById('output_choices_submit_btn').disabled = false;
    document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update'
    document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
}
// Distance Metric Select (Combo)
selected_distance_combo = document.getElementById('selected_distance');
if (typeof selected_distance_combo !=="undefined") {
	$('.selectpicker').on('change', function () {
  	  //alert(selected_distance_combo)
      document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update'
  	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
	});
}
// MIN Select (Combo)
min_range_combo = document.getElementById('min_range') ;
if (typeof min_range_combo !=="undefined") {
	min_range_combo.addEventListener('change', function () {
  	  document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update'
  	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
	});
}
// MAX Select (Combo)
max_range_combo = document.getElementById('max_range');
if (typeof max_range_combo !=="undefined") {
	max_range_combo.addEventListener('change', function () {
  	  document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update'
  	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
	});
}
//
//
// COUNTS Table
//
var tax_counts_link = document.getElementById('counts_table_link_id') || null;
var tax_counts_btn = document.getElementById('counts_table_hide_btn');
var tax_counts_div = document.getElementById('tax_table_div');
var counts_table_download_btn = document.getElementById('counts_table_download_btn');
var pre_counts_table_div = document.getElementById('pre_counts_table_div');
if (tax_counts_link !== null) {
  	tax_counts_link.addEventListener('click', function () {
    
	if(typeof tax_table_created == "undefined"){
        create_viz('counts_table', pi_local.ts);
		counts_table_download_btn.disabled = false;
    }else{
        if(tax_counts_btn.value == 'hide'){
          //toggle_visual_element(tax_counts_div,'show',tax_counts_btn);
        }else{
          toggle_visual_element(tax_counts_div,'hide',tax_counts_btn);
        }
    }
	$(pre_counts_table_div).scrollView();
  });
}
if (typeof tax_counts_btn !=="undefined") {
	tax_counts_btn.addEventListener('click', function () {
      if(tax_counts_btn.value == 'hide'){
        toggle_visual_element(tax_counts_div,'show',tax_counts_btn);
      }else{
        toggle_visual_element(tax_counts_div,'hide',tax_counts_btn);
      }
  });
}
if (typeof counts_table_download_btn !=="undefined") {
  
  counts_table_download_btn.addEventListener('click', function () {
	  
   //alert(ds_local.ids)
   download_data('matrix', JSON.stringify(ds_local), 'partial_project', pi_local.ts)


   //  var f = document.createElement("form");
	  // f.setAttribute('method',"POST");
	  // f.setAttribute('action',"/visuals/download_counts_matrix");
	  
   //  var s = document.createElement("input"); //input element, text
   //  s.setAttribute('type',"hidden");
   //  s.setAttribute('value',ts_local);   
   //  f.appendChild(s);

	  // var s = document.createElement("input"); //input element, text
	  // s.setAttribute('type',"submit");
	  // s.setAttribute('value',"Submit");	  
	  // f.appendChild(s);

	  // document.getElementsByTagName('body')[0].appendChild(f);
	  // f.submit();
  });
}
//
// METADATA  Table
//
var metadata_link = document.getElementById('metadata_table_link_id') || null;
var metadata_btn = document.getElementById('metadata_table_hide_btn');
var metadata_div = document.getElementById('metadata_local_table_div');
var metadata_download_btn = document.getElementById('metadata_download_btn');
var pre_metadata_table_div = document.getElementById('pre_metadata_table_div');
if (metadata_link !== null) {
  	metadata_link.addEventListener('click', function () {
      //alert(window)
	  //$(window).scrollTo(500);
	  
	  if(typeof metadata_table_created == "undefined"){
        create_viz('metadata_table', pi_local.ts);
		metadata_download_btn.disabled = false;
      }else{
        if(metadata_btn.value == 'hide'){
          //toggle_visual_element(metadata_div,'show',metadata_btn);
        }else{
          toggle_visual_element(metadata_div,'hide',metadata_btn);
        }
      }
      $(pre_metadata_table_div).scrollView();
  });
}
if (typeof metadata_btn !=="undefined") {
  metadata_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(metadata_btn.value == 'hide'){
        toggle_visual_element(metadata_div,'show',metadata_btn);
      }else{
        toggle_visual_element(metadata_div,'hide',metadata_btn);
      }
      
  });
}
//
// PIECHARTS
//
var piecharts_link = document.getElementById('piecharts_link_id') || null;
var piecharts_btn = document.getElementById('piecharts_hide_btn');
var piecharts_div = document.getElementById('piecharts_div');
var piecharts_download_btn = document.getElementById('piecharts_download_btn');
var pre_piecharts_table_div = document.getElementById('pre_piecharts_table_div');
if (piecharts_link !== null) {
  piecharts_link.addEventListener('click', function () {
      
	  if(typeof piecharts_created == "undefined"){
        create_viz('piecharts', pi_local.ts);
		piecharts_download_btn.disabled = false;
      }else{
        if(piecharts_btn.value == 'hide'){
          //toggle_visual_element(piecharts_div,'show',piecharts_btn);
        }else{
          toggle_visual_element(piecharts_div,'hide',piecharts_btn);
        }
      }
      $(pre_piecharts_table_div).scrollView();
  });
}
if (typeof piecharts_btn !=="undefined") {
  piecharts_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(piecharts_btn.value == 'hide'){
        toggle_visual_element(piecharts_div,'show',piecharts_btn);
      }else{
        toggle_visual_element(piecharts_div,'hide',piecharts_btn);
      }
      
  });
}
//
// KRONA Chart (Data Browser)
//
// var dbrowser_link = document.getElementById('dbrowser_link_id') || null;
// var dbrowser_btn = document.getElementById('dbrowser_hide_btn');
// var dbrowser_div = document.getElementById('dbrowser_div');
// var dbrowser_download_btn = document.getElementById('dbrowser_download_btn');
// var pre_dbrowser_div = document.getElementById('pre_dbrowser_div');
// if (dbrowser_link !== null) {
//   dbrowser_link.addEventListener('click', function () {
      
// 	  if(typeof dbrowser_created == "undefined"){
//         create_viz('dbrowser', pi_local.ts);
// 		dbrowser_download_btn.disabled = false;
//       }else{
//         if(dbrowser_btn.value == 'hide'){
//           //toggle_visual_element(piecharts_div,'show',dbrowser_btn);
//         }else{
//           toggle_visual_element(dbrowser_div,'hide',dbrowser_btn);
//         }
//       }
//       $(pre_dbrowser_div).scrollView();
//   });
// }
// if (typeof dbrowser_btn !=="undefined") {
//   dbrowser_btn.addEventListener('click', function () {
//       //alert('here in tt')
//       if(dbrowser_btn.value == 'hide'){
//         toggle_visual_element(dbrowser_div,'show',dbrowser_btn);
//       }else{
//         toggle_visual_element(dbrowser_div,'hide',dbrowser_btn);
//       }
      
//   });
// }
//
// BARCHARTS
//
var barchart_link = document.getElementById('barcharts_link_id') || null;
var barcharts_btn = document.getElementById('barcharts_hide_btn');
var barcharts_div = document.getElementById('barcharts_div');
var barcharts_download_btn = document.getElementById('barcharts_download_btn');
var pre_barcharts_table_div = document.getElementById('pre_barcharts_table_div');
if (barchart_link !== null) {
  barchart_link.addEventListener('click', function () {
      
	  if(typeof barcharts_created == "undefined"){
        create_viz('barcharts', pi_local.ts);
		    barcharts_download_btn.disabled = false;
      }else{
        if(barcharts_btn.value == 'hide'){        
          //toggle_visual_element(barcharts_div,'show',barcharts_btn);
        }else{
          toggle_visual_element(barcharts_div,'hide',barcharts_btn);
        }
      }
      $(pre_barcharts_table_div).scrollView();
  });
}
if (typeof barcharts_btn !=="undefined") {
  barcharts_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(barcharts_btn.value == 'hide'){        
        toggle_visual_element(barcharts_div,'show',barcharts_btn);
      }else{
        toggle_visual_element(barcharts_div,'hide',barcharts_btn);
      }
      
  });
}
//
// DISTANCE HEATMAP
//
var dheatmap_link = document.getElementById('dheatmap_link_id') || null;
var dheatmap_btn = document.getElementById('dheatmap_hide_btn');
var dheatmap_div = document.getElementById('dheatmap_div');
var dheatmap_download_btn = document.getElementById('dheatmap_download_btn');
var pre_dheatmap_div = document.getElementById('pre_dheatmap_div');
if (dheatmap_link !== null) {
  dheatmap_link.addEventListener('click', function () {
      
	  if(typeof dheatmap_created == "undefined"){
        create_viz('dheatmap', pi_local.ts);
		dheatmap_download_btn.disabled = false;
      }else{
        if(dheatmap_btn.value == 'hide'){        
          //toggle_visual_element(dheatmap_div,'show',dheatmap_btn);
        }else{
          toggle_visual_element(dheatmap_div,'hide',dheatmap_btn);
        }
      }
      $(pre_dheatmap_div).scrollView();
  });
}
if (typeof dheatmap_btn !== "undefined") {
  dheatmap_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dheatmap_btn.value == 'hide'){        
        toggle_visual_element(dheatmap_div,'show',dheatmap_btn);
      }else{
        toggle_visual_element(dheatmap_div,'hide',dheatmap_btn);
      }
      
  });
}
//
// FREQUENCY HEATMAP
//
var fheatmap_link = document.getElementById('fheatmap_link_id') || null;
var fheatmap_btn = document.getElementById('fheatmap_hide_btn');
var fheatmap_div = document.getElementById('fheatmap_div');
var fheatmap_download_btn = document.getElementById('fheatmap_download_btn');
var pre_fheatmap_div = document.getElementById('pre_fheatmap_div');
if (fheatmap_link !== null) {
  fheatmap_link.addEventListener('click', function () {
      
	  if(typeof fheatmap_created == "undefined"){
        create_viz('fheatmap', pi_local.ts);
		fheatmap_download_btn.disabled = false;
      }else{
        if(fheatmap_btn.value == 'hide'){        
          //toggle_visual_element(fheatmap_div,'show',fheatmap_btn);
        }else{
          toggle_visual_element(fheatmap_div,'hide',fheatmap_btn);
        }
      }  
	  $(pre_fheatmap_div).scrollView();    
  });
}
if (typeof fheatmap_btn !== "undefined") {
  fheatmap_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(fheatmap_btn.value == 'hide'){        
        toggle_visual_element(fheatmap_div,'show',fheatmap_btn);
      }else{
        toggle_visual_element(fheatmap_div,'hide',fheatmap_btn);
      }
      
  });
}
//
// DENDROGRAM1  D3 Phylogram
//
var dendrogram1_link = document.getElementById('dendrogram1_link_id') || null;
var dendrogram1_btn = document.getElementById('dendrogram1_hide_btn');
var dendrogram1_div = document.getElementById('dendrogram1_div');
var dendrogram1_download_btn = document.getElementById('dendrogram1_download_btn');
var pre_dendrogram1_div = document.getElementById('pre_dendrogram1_div');
if (dendrogram1_link !== null) {
  dendrogram1_link.addEventListener('click', function () {
      
	  if(typeof dendrogram1_created == "undefined"){
        create_viz('dendrogram1', pi_local.ts);
		dendrogram1_download_btn.disabled = false;
      }else{
        if(dendrogram1_btn.value == 'hide'){        
          //toggle_visual_element(dendrogram1_div,'show',dendrogram1_btn);
        }else{
          toggle_visual_element(dendrogram1_div,'hide',dendrogram1_btn);
        }
      }
	  $(pre_dendrogram1_div).scrollView();
  });
}
if (typeof dendrogram1_btn !== "undefined") {
  dendrogram1_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dendrogram1_btn.value == 'hide'){        
        toggle_visual_element(dendrogram1_div,'show',dendrogram1_btn);
      }else{
        toggle_visual_element(dendrogram1_div,'hide',dendrogram1_btn);
      }      
  });
}
//
// DENDROGRAM2  D3 Phylonator
//
var dendrogram2_link = document.getElementById('dendrogram2_link_id') || null;
var dendrogram2_btn = document.getElementById('dendrogram2_hide_btn');
var dendrogram2_div = document.getElementById('dendrogram2_div');
var dendrogram2_download_btn = document.getElementById('dendrogram2_download_btn');
var pre_dendrogram2_div = document.getElementById('pre_dendrogram2_div');
if (dendrogram2_link !== null) {
  dendrogram2_link.addEventListener('click', function () {
      
	  if(typeof dendrogram2_created == "undefined"){
        create_viz('dendrogram2', pi_local.ts);
		dendrogram2_download_btn.disabled = false;
      }else{
        if(dendrogram2_btn.value == 'hide'){        
          //toggle_visual_element(dendrogram_div,'show',dendrogram_btn);
        }else{
          toggle_visual_element(dendrogram2_div,'hide',dendrogram2_btn);
        }
      }
	  $(pre_dendrogram2_div).scrollView();
  });
}
if (typeof dendrogram2_btn !== "undefined") {
  dendrogram2_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dendrogram2_btn.value == 'hide'){        
        toggle_visual_element(dendrogram2_div,'show',dendrogram2_btn);
      }else{
        toggle_visual_element(dendrogram2_div,'hide',dendrogram2_btn);
      }      
  });
}
//
// DENDROGRAM3  D3 Radial
//
var dendrogram3_link = document.getElementById('dendrogram3_link_id') || null;
var dendrogram3_btn = document.getElementById('dendrogram3_hide_btn');
var dendrogram3_div = document.getElementById('dendrogram3_div');
var dendrogram3_download_btn = document.getElementById('dendrogram3_download_btn');
var pre_dendrogram3_div = document.getElementById('pre_dendrogram3_div');
if (dendrogram3_link !== null) {
  dendrogram3_link.addEventListener('click', function () {
      
    if(typeof dendrogram3_created == "undefined"){
        create_viz('dendrogram3', pi_local.ts);
    dendrogram3_download_btn.disabled = false;
      }else{
        if(dendrogram3_btn.value == 'hide'){        
          //toggle_visual_element(dendrogram_div,'show',dendrogram_btn);
        }else{
          toggle_visual_element(dendrogram3_div,'hide',dendrogram3_btn);
        }
      }
    $(pre_dendrogram3_div).scrollView();
  });
}
if (typeof dendrogram3_btn !== "undefined") {
  dendrogram3_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dendrogram3_btn.value == 'hide'){        
        toggle_visual_element(dendrogram3_div,'show',dendrogram3_btn);
      }else{
        toggle_visual_element(dendrogram3_div,'hide',dendrogram3_btn);
      }      
  });
}
//
// DENDROGRAM PDF
//
var dendrogram_pdf_link = document.getElementById('dendrogram_pdf_link_id') || null;
var dendrogram_pdf_btn = document.getElementById('dendrogram_pdf_hide_btn');
var dendrogram_pdf_div = document.getElementById('dendrogram_pdf_div');
var dendrogram_pdf_download_btn = document.getElementById('dendrogram_pdf_download_btn');
var pre_dendrogram_pdf_div = document.getElementById('pre_dendrogram_pdf_div');
if (dendrogram_pdf_link !== null) {
  dendrogram_pdf_link.addEventListener('click', function () {
      
	  if(typeof dendrogram_pdf_created == "undefined"){
        create_viz('dendrogram_pdf', pi_local.ts);
		dendrogram_pdf_download_btn.disabled = false;
      }else{
        if(dendrogram_pdf_btn.value == 'hide'){        
          //toggle_visual_element(dendrogram_pdf_div,'show',dendrogram_pdf_btn);
        }else{
          toggle_visual_element(dendrogram_pdf_div,'hide',dendrogram_pdf_btn);
        }
      }
      $(pre_dendrogram_pdf_div).scrollView();
  });
}
if (typeof dendrogram_pdf_btn !== "undefined") {
  dendrogram_pdf_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dendrogram_pdf_btn.value == 'hide'){        
        toggle_visual_element(dendrogram_pdf_div,'show',dendrogram_pdf_btn);
      }else{
        toggle_visual_element(dendrogram_png_div,'hide',dendrogram_pdf_btn);
      }      
  });
}
//
// PCOA  2D
//
var pcoa_link = document.getElementById('pcoa_link_id') || null;
var pcoa_btn = document.getElementById('pcoa_hide_btn');
var pcoa_div = document.getElementById('pcoa_div');
var pcoa_download_btn = document.getElementById('pcoa_download_btn');
var pre_pcoa_div = document.getElementById('pre_pcoa_div');
if (pcoa_link !== null) {
  pcoa_link.addEventListener('click', function () {
      
	  if(typeof pcoa_created == "undefined"){
        create_viz('pcoa', pi_local.ts);
		pcoa_download_btn.disabled = false;
      }else{
        if(pcoa_btn.value == 'hide'){        
          //toggle_visual_element(pcoa_div,'show',pcoa_btn);
        }else{
          toggle_visual_element(pcoa_div,'hide',pcoa_btn);
        }
      } 
	  $(pre_pcoa_div).scrollView();     
  });
}
if (typeof pcoa_btn !== "undefined") {
  pcoa_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(pcoa_btn.value == 'hide'){        
        toggle_visual_element(pcoa_div,'show',pcoa_btn);
      }else{
        toggle_visual_element(pcoa_div,'hide',pcoa_btn);
      }
      
  });
}
//
// PCOA  3D
//
var pcoa_3d_link = document.getElementById('pcoa_3d_link_id') || null;
var pcoa_3d_btn = document.getElementById('pcoa_3d_hide_btn');
var pcoa_3d_div = document.getElementById('pcoa_3d_div');
var pcoa_3d_download_btn = document.getElementById('pcoa_3d_download_btn');
var pre_pcoa_3d_div = document.getElementById('pre_pcoa_3d_div');
if (pcoa_3d_link !== null) {
  pcoa_3d_link.addEventListener('click', function () {
      
	  if(typeof pcoa_3d_created == "undefined"){
        create_viz('pcoa_3d', pi_local.ts);
		pcoa_3d_download_btn.disabled = false;
      }else{
        if(pcoa_3d_btn.value == 'hide'){        
          //toggle_visual_element(pcoa_div,'show',pcoa_btn);
        }else{
          toggle_visual_element(pcoa_3d_div,'hide',pcoa_3d_btn);
        }
      } 
	  $(pre_pcoa_3d_div).scrollView();     
  });
}
if (typeof pcoa_3d_btn !== "undefined") {
  pcoa_3d_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(pcoa_3d_btn.value == 'hide'){        
        toggle_visual_element(pcoa_3d_div,'show',pcoa_3d_btn);
      }else{
        toggle_visual_element(pcoa_3d_div,'hide',pcoa_3d_btn);
      }
      
  });
}
//
// GEOSPATIAL
//
var geospatial_link = document.getElementById('geospatial_link_id') || null;
var geospatial_btn = document.getElementById('geospatial_hide_btn');
var geospatial_div = document.getElementById('map-canvas');
var geospatial_download_btn = document.getElementById('geospatial_download_btn');
var pre_geospatial_div = document.getElementById('pre_geospatial_div');
if (geospatial_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  geospatial_link.addEventListener('click', function () {
      
	  if(typeof geospatial_created == "undefined"){
        create_viz('geospatial', pi_local.ts);
		    geospatial_download_btn.disabled = false;
      }else{
        if(geospatial_btn.value == 'hide'){        
         // toggle_visual_element(geospatial_div,'show',geospatial_btn);
        }else{
          toggle_visual_element(geospatial_div,'hide',geospatial_btn);
        }
      } 
	  $(pre_geospatial_div).scrollView();     
  });
}
if (typeof geospatial_btn !== "undefined") {
  geospatial_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(geospatial_btn.value == 'hide'){        
        toggle_visual_element(geospatial_div,'show',geospatial_btn);
      }else{
        toggle_visual_element(geospatial_div,'hide',geospatial_btn);
      }
      
  });
}
//
// ALPHA DIVERSITY
//
var adiversity_link = document.getElementById('adiversity_link_id') || null;
var adiversity_btn = document.getElementById('adiversity_hide_btn');
var adiversity_div = document.getElementById('adiversity_div');
var adiversity_download_btn = document.getElementById('adiversity_download_btn');
var pre_adiversity_div = document.getElementById('pre_adiversity_div');
if (adiversity_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  adiversity_link.addEventListener('click', function () {
      
    if(typeof adiversity_created == "undefined"){
        create_viz('adiversity', pi_local.ts);
        adiversity_download_btn.disabled = false;
      }else{
        if(adiversity_btn.value == 'hide'){        
         // toggle_visual_element(adiversity_div,'show',adiversity_btn);
        }else{
          toggle_visual_element(adiversity_div,'hide',adiversity_btn);
        }
      } 
    $(pre_adiversity_div).scrollView();     
  });
}
if (typeof adiversity_btn !== "undefined") {
  adiversity_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(adiversity_btn.value == 'hide'){        
        toggle_visual_element(adiversity_div,'show',adiversity_btn);
      }else{
        toggle_visual_element(adiversity_div,'hide',adiversity_btn);
      }
      
  });
}
//
// PHYLOSEQ 01
//
var phyloseq01_link = document.getElementById('phyloseq01_link_id') || null;
var phyloseq01_btn = document.getElementById('phyloseq01_hide_btn');
var phyloseq01_div = document.getElementById('phyloseq01_div');
var phyloseq01_download_btn = document.getElementById('phyloseq01_download_btn');
var pre_phyloseq01_div = document.getElementById('pre_phyloseq01_div');
if (phyloseq01_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  phyloseq01_link.addEventListener('click', function () {
      
    if(typeof phyloseq01_created == "undefined"){
        create_viz('phyloseq01', pi_local.ts);
        phyloseq01_download_btn.disabled = false;
      }else{
        if(phyloseq01_btn.value == 'hide'){        
         // toggle_visual_element(adiversity_div,'show',adiversity_btn);
        }else{
          toggle_visual_element(phyloseq01_div,'hide',phyloseq01_btn);
        }
      } 
    $(pre_phyloseq01_div).scrollView();     
  });
}
if (typeof phyloseq01_btn !== "undefined") {
  phyloseq01_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(phyloseq01_btn.value == 'hide'){        
        toggle_visual_element(phyloseq01_div,'show',phyloseq01_btn);
      }else{
        toggle_visual_element(phyloseq01_div,'hide',phyloseq01_btn);
      }
      
  });
}
//
// PHYLOSEQ 02
//
var phyloseq02_link = document.getElementById('phyloseq02_link_id') || null;
var phyloseq02_btn = document.getElementById('phyloseq02_hide_btn');
var phyloseq02_div = document.getElementById('phyloseq02_div');
var phyloseq02_download_btn = document.getElementById('phyloseq02_download_btn');
var pre_phyloseq02_div = document.getElementById('pre_phyloseq02_div');
if (phyloseq02_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  phyloseq02_link.addEventListener('click', function () {
      
    if(typeof phyloseq02_created == "undefined"){
        create_viz('phyloseq02', pi_local.ts);
        phyloseq02_download_btn.disabled = false;
      }else{
        if(phyloseq02_btn.value == 'hide'){        
         // toggle_visual_element(adiversity_div,'show',adiversity_btn);
        }else{
          toggle_visual_element(phyloseq02_div,'hide',phyloseq02_btn);
        }
      } 
    $(pre_phyloseq02_div).scrollView();     
  });
}
if (typeof phyloseq02_btn !== "undefined") {
  phyloseq02_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(phyloseq02_btn.value == 'hide'){        
        toggle_visual_element(phyloseq02_div,'show',phyloseq02_btn);
      }else{
        toggle_visual_element(phyloseq02_div,'hide',phyloseq02_btn);
      }
      
  });
}
//
// PHYLOSEQ 03
//
var phyloseq03_link = document.getElementById('phyloseq03_link_id') || null;
var phyloseq03_btn = document.getElementById('phyloseq03_hide_btn');
var phyloseq03_div = document.getElementById('phyloseq03_div');
var phyloseq03_download_btn = document.getElementById('phyloseq03_download_btn');
var pre_phyloseq03_div = document.getElementById('pre_phyloseq03_div');
if (phyloseq03_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  phyloseq03_link.addEventListener('click', function () {
      
    if(typeof phyloseq03_created == "undefined"){
        create_viz('phyloseq03', pi_local.ts);
        phyloseq03_download_btn.disabled = false;
      }else{
        if(phyloseq03_btn.value == 'hide'){        
         // toggle_visual_element(adiversity_div,'show',adiversity_btn);
        }else{
          toggle_visual_element(phyloseq03_div,'hide',phyloseq03_btn);
        }
      } 
    $(pre_phyloseq03_div).scrollView();     
  });
}
if (typeof phyloseq03_btn !== "undefined") {
  phyloseq03_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(phyloseq03_btn.value == 'hide'){        
        toggle_visual_element(phyloseq03_div,'show',phyloseq03_btn);
      }else{
        toggle_visual_element(phyloseq03_div,'hide',phyloseq03_btn);
      }
      
  });
}
//
// PHYLOSEQ 04
//
var phyloseq04_link = document.getElementById('phyloseq04_link_id') || null;
var phyloseq04_btn = document.getElementById('phyloseq04_hide_btn');
var phyloseq04_div = document.getElementById('phyloseq04_div');
var phyloseq04_download_btn = document.getElementById('phyloseq04_download_btn');
var pre_phyloseq04_div = document.getElementById('pre_phyloseq04_div');
if (phyloseq04_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  phyloseq04_link.addEventListener('click', function () {
      
    if(typeof phyloseq04_created == "undefined"){
        create_viz('phyloseq04', pi_local.ts);
        phyloseq04_download_btn.disabled = false;
      }else{
        if(phyloseq04_btn.value == 'hide'){        
         // toggle_visual_element(adiversity_div,'show',adiversity_btn);
        }else{
          toggle_visual_element(phyloseq04_div,'hide',phyloseq04_btn);
        }
      } 
    $(pre_phyloseq04_div).scrollView();     
  });
}
if (typeof phyloseq04_btn !== "undefined") {
  phyloseq04_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(phyloseq04_btn.value == 'hide'){        
        toggle_visual_element(phyloseq04_div,'show',phyloseq04_btn);
      }else{
        toggle_visual_element(phyloseq04_div,'hide',phyloseq04_btn);
      }
      
  });
}
//
// PHYLOSEQ 05
//
var phyloseq05_link = document.getElementById('phyloseq05_link_id') || null;
var phyloseq05_btn = document.getElementById('phyloseq05_hide_btn');
var phyloseq05_div = document.getElementById('phyloseq05_div');
var phyloseq05_download_btn = document.getElementById('phyloseq05_download_btn');
var pre_phyloseq05_div = document.getElementById('pre_phyloseq05_div');
if (phyloseq05_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  phyloseq05_link.addEventListener('click', function () {
      
    if(typeof phyloseq05_created == "undefined"){
        create_viz('phyloseq05', pi_local.ts);
        phyloseq05_download_btn.disabled = false;
      }else{
        if(phyloseq05_btn.value == 'hide'){        
         // toggle_visual_element(adiversity_div,'show',adiversity_btn);
        }else{
          toggle_visual_element(phyloseq05_div,'hide',phyloseq05_btn);
        }
      } 
    $(pre_phyloseq05_div).scrollView();     
  });
}
if (typeof phyloseq05_btn !== "undefined") {
  phyloseq05_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(phyloseq05_btn.value == 'hide'){        
        toggle_visual_element(phyloseq05_div,'show',phyloseq05_btn);
      }else{
        toggle_visual_element(phyloseq05_div,'hide',phyloseq05_btn);
      }
      
  });
}
//
//
//
// TEST
//
// test_link = document.getElementById('test_page_link_id');
// if (typeof test_link !=="undefined") {
//   test_link.addEventListener('click', function () {
//       //alert('here in pc')
//       create_test_page(pi_local.ts);
//   });
// }
// function create_test_page(ts) {
//
//     var opened = window.open("");
//     opened.document.write("<html><head><title>My title</title></head><body>open in another page:  test</body></html>");
//
// }



function toggle_visual_element(table_div, tog, btn){
  if(tog == 'show') {
    table_div.style.display = 'none';
    btn.value = 'show';
	btn.innerHTML = 'show';
  }else{
    table_div.style.display = 'block';
    btn.value = 'hide';
	btn.innerHTML = 'hide';
  }
}


function create_viz(visual, ts) {
   
    if(visual === 'counts_table'){
      create_counts_table();      
    }else if(visual === 'metadata_table'){
      create_metadata_table();
    }else if(visual === 'piecharts'){
      create_piecharts(ts);
    }else if(visual === 'barcharts'){
      create_barcharts_group(ts);
    }else if(visual === 'dheatmap'){
      create_dheatmap(ts);
    }else if(visual === 'dendrogram1'){
      create_dendrogram(ts,'svg','phylogram');
    }else if(visual === 'dendrogram2'){
      create_dendrogram(ts,'svg','phylonator');
    }else if(visual === 'dendrogram3'){
      create_dendrogram(ts,'svg','radial');
    }else if(visual === 'dendrogram_pdf'){
      create_dendrogram(ts,'pdf','python');
    }else if(visual === 'pcoa'){
      create_pcoa(ts,'2d');
    }else if(visual === 'pcoa_3d'){
      create_pcoa(ts,'3d');
    }else if(visual === 'fheatmap'){
      create_fheatmap(ts);
    }else if(visual === 'geospatial'){
      create_geospatial(ts);
    }else if(visual === 'dbrowser'){
      create_dbrowser(ts);
    }else if(visual === 'adiversity'){
      create_adiversity(ts);
    }else if(visual === 'phyloseq01'){
      create_phyloseq(ts,'bar');
    }else if(visual === 'phyloseq02'){
      create_phyloseq(ts,'heatmap');
    }else if(visual === 'phyloseq03'){
      create_phyloseq(ts,'network');
    }else if(visual === 'phyloseq04'){
      create_phyloseq(ts,'ord1');
    }else if(visual === 'phyloseq05'){
      create_phyloseq(ts,'tree');
    }else{

    }
}

//
// TAX TABLE
//
function create_counts_table() {
      
      tax_table_created = true;
      var info_line = create_header('ftable', pi_local);
      document.getElementById('counts_table_title').innerHTML = info_line;
      document.getElementById('pre_counts_table_div').style.display = 'block';
      var tax_counts_div = document.getElementById('tax_table_div');
	  tax_counts_div.style.display = 'block';
      var html = '';
         
      html += "</table>  ";
      html += "</span>";

      //html += "<table border='1' class='single_border small_font counts_table' >";
	  html += "<table border='1' class='table table-condensed' >";
      html += "<tr><td></td><td></td>";
      for (var n in mtx_local.columns) {
        html += "<td class=''>"+mtx_local.columns[n].id +"</td>";
      }
      html += "</tr>";
      
      for (var i in mtx_local.rows){
        count = parseInt(i)+1;
        html += "<tr class='chart_row'><td>"+count.toString()+"</td>";
        html += "<td class='left_justify'>"+mtx_local.rows[i].id +"</td>";
        for (var da in mtx_local.data[i]) {
          var cnt = mtx_local.data[i][da];
		  
          var pct =  (cnt * 100 / mtx_local.column_totals[da]).toFixed(2);
          var id  = 'frequencies-|-'+mtx_local.rows[i].id+'-|-'+mtx_local.columns[da].id+'-|-'+cnt.toString()+'-|-'+pct.toString();
          html += "<td id='"+id+"' class='tooltip_viz right_justify'>"+cnt.toString()+'</td>';
          
        }
        html += "</tr>";
      }
      // TOTALS
      html += "<tr><td></td>";
      html += "<td class='right_justify'><strong>Sums:</strong></td>";
      for (var m in mtx_local.column_totals){
        var total;
  		  if(pi_local.normalization == 'frequency'){
  			  total = mtx_local.column_totals[m].toFixed(6);
  		  }else{
  			  total = mtx_local.column_totals[m];
  		  }
  		  html += "<td class='right_justify'>" + total + "</td>";
      }
      html += "</tr>";
      html += "</table>";

      //document.getElementById('counts_tooltip_div').innerHTML = tooltip_tbl;
      tax_counts_div.innerHTML = html;   
}

//
//  CREATE METADATA TABLE
//
function create_metadata_table() {
     
    metadata_table_created = true;
    var info_line = create_header('mtable', pi_local);
    var metadata_div = document.getElementById('metadata_local_table_div');
	  metadata_div.style.display = 'block';
    document.getElementById('pre_metadata_table_div').style.display = 'block';
    var html = '';
      //html += "<table border='1' id='metadata_table' class='single_border small_font md_table' >";
	  html += "<table border='1' id='metadata_table' class='table table-condensed' >";
    html += "<thead><tr><th>Dataset (sortable)</th><th>Name (sortable)</th><th>Value (sortable)</th></tr></thead><tbody>";
      
    for (var ds in md_local) {

          for (var k in md_local[ds]) {
            html += "<tr>";
            html += "<td>"+ds+"</td>";
            md_item = k;
            md_val = md_local[ds][k];
            html += "<td>"+md_item+"</td><td>"+md_val+"</td>";
            html += "</tr>";
          }        
    }
    html += "</tbody></table>";

      //alert(md_local[0].env_matter)
    metadata_div.innerHTML = html;
}

//
//  CREATE Dendrogram
//

function create_dendrogram(ts, image_type, script) {
      //alert('im DEND')
      
      var info_line = create_header('dend', pi_local);
      var dend_div;
      if(image_type == 'pdf'){
        //dendrogram_pdf_created = true;
        var dend_div = document.getElementById('dendrogram_pdf_div');
        document.getElementById('pre_dendrogram_pdf_div').style.display = 'block';
  	    dend_div.style.display = 'block';
        document.getElementById('dendrogram_pdf_title').innerHTML = info_line;
      }else if(script == 'phylogram'){  // svg
        //dendrogram1_created = true;
        var dend_div = document.getElementById('dendrogram1_div');
        document.getElementById('pre_dendrogram1_div').style.display = 'block';
  	  	dend_div.style.display = 'block';
        document.getElementById('dendrogram1_title').innerHTML = info_line;
      }else if(script == 'phylonator'){  // svg
        //dendrogram2_created = true;
        var dend_div = document.getElementById('dendrogram2_div');
        document.getElementById('pre_dendrogram2_div').style.display = 'block';
  	  	dend_div.style.display = 'block';
        document.getElementById('dendrogram2_title').innerHTML = info_line;
      }else if(script == 'radial'){  // svg
        //dendrogram3_created = true;
        var dend_div = document.getElementById('dendrogram3_div');
        document.getElementById('pre_dendrogram3_div').style.display = 'block';
        dend_div.style.display = 'block';
        document.getElementById('dendrogram3_title').innerHTML = info_line;
      }
      
      
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      
      
      
      var html = '';
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+ts;
      args += "&image_type="+image_type;
	    args += "&script="+script;
      
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/visuals/dendrogram', true);  // gets newick
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      showDots='';
      var myWaitVar = setInterval(myWaitFunction,1000,dend_div);
      xmlhttp.onreadystatechange = function() {        
        if (xmlhttp.readyState == 4 ) {
          clearInterval(myWaitVar);
          var htmlstring = xmlhttp.responseText;
          if(image_type == 'pdf'){
              html = "<div id='' >"+htmlstring+"</div>";
              dend_div.innerHTML = html;
          }else{


              //var newick = Newick.parse("(((Crotalus_oreganus_oreganus_cytochrome_b:0.00800,Crotalus_horridus_cytochrome_b:0.05866):0.04732,(Thamnophis_elegans_terrestris_cytochrome_b:0.//00366,Thamnophis_atratus_cytochrome_b:0.00172):0.06255):0.00555,(Pituophis_catenifer_vertebralis_cytochrome_b:0.00552,Lampropeltis_getula_cytochrome_b:0.02035):0.05762,((//Diadophis_punctatus_cytochrome_b:0.06486,Contia_tenuis_cytochrome_b:0.05342):0.01037,Hypsiglena_torquata_cytochrome_b:0.05346):0.00779);")
              var newick = Newick.parse(htmlstring);
              //var newick = JSON.parse(newick);
              var newickNodes = []
              function buildNewickNodes(node, callback) {
                newickNodes.push(node)
                if (node.branchset) {
                  for (var i=0; i < node.branchset.length; i++) {
                    buildNewickNodes(node.branchset[i])
                  }
                }
              }
              buildNewickNodes(newick)
              var w = 800;
              var h = 900;
              if(ds_local.ids.length > 50){
                h = 1200;
              }
              if(script == 'phylogram'){
                  document.getElementById('dendrogram1_div').innerHTML = '';
                  d3.phylogram.build('#dendrogram1_div', newick, {
                    width: w,
                    height: h
                  });
              }else if(script == 'phylonator'){
                  document.getElementById('dendrogram2_div').innerHTML = '';
                  d3.phylonator.build('#dendrogram2_div', newick, {
                    width: w,
                    height: h,
                    skipBranchLengthScaling: true
                  });
              }else if(script == 'radial') {
                  document.getElementById('dendrogram3_div').innerHTML = '';
                  d3.phylogram.buildRadial('#dendrogram3_div', newick, {
                    width: w,
                    height: h
                  });
              }

          } // end else
          

        }  // end if xmlhttp.readyState


      };
      xmlhttp.send(args);
 
}


//
//  CREATE PCoA -- both 2d and 3d
//
function create_pcoa(ts,image_type) {
      //alert('JS PCoA: '+image_type)
    var address, info_line, pcoa_div;
    if(image_type === '2d'){
        pcoa_created = true;
        pcoa_div = document.getElementById('pcoa_div');
        info_line = create_header('pcoa', pi_local);
  	    pcoa_div.style.display = 'block';
        document.getElementById('pcoa_title').innerHTML = info_line;
        document.getElementById('pre_pcoa_div').style.display = 'block';
        address = '/visuals/pcoa';
    }else if(image_type === '3d'){
        pcoa_created = true;
        pcoa_div = document.getElementById('pcoa_3d_div');
        info_line = create_header('pcoa_3d', pi_local);
  	    pcoa_div.style.display = 'block';
        document.getElementById('pcoa_3d_title').innerHTML = info_line;
        document.getElementById('pre_pcoa_3d_div').style.display = 'block';
        address = '/visuals/pcoa_3d';
    }else{
        // ERROR
    }
      
      
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+ts;
      args += "&image_type="+image_type;
      
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", address, true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.setRequestHeader("data-type","html");
      showDots='';
      var myWaitVar = setInterval(myWaitFunction,1000,pcoa_div);
      xmlhttp.onreadystatechange = function() {        
        if (xmlhttp.readyState == 4 ) {
            clearInterval(myWaitVar);
            var response = xmlhttp.responseText;            
            pcoa_div.innerHTML = response;      
           
        }
      };
      xmlhttp.send(args);
      
}
//
//  CREATE DBROWSER
//
function create_dbrowser(ts) {
     
         dbrowser_created = true;
         var info_line = create_header('dbrowser', pi_local);
         var dbrowser_div = document.getElementById('dbrowser_div');
         dbrowser_div.style.display = 'block';
         document.getElementById('dbrowser_title').innerHTML = info_line;
         document.getElementById('pre_dbrowser_div').style.display = 'block';
         var args =  "ts="+ts;
         var xmlhttp = new XMLHttpRequest();  
         xmlhttp.open("POST", '/visuals/dbrowser', true);
         xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
         showDots='';
         var myWaitVar = setInterval(myWaitFunction,1000,dbrowser_div);
         xmlhttp.onreadystatechange = function() {          
           if (xmlhttp.readyState == 4 ) {
              clearInterval(myWaitVar);
              var response = xmlhttp.responseText;              
              dbrowser_div.innerHTML = response;            
           }
         };
         xmlhttp.send(args);
}
//
//
//

//
//  CREATE DIST HEATMAP
//
function create_dheatmap(ts) {
      //alert('im HM')
      dheatmap_created = true;
      var dhm_div = document.getElementById('dheatmap_div');
	    dhm_div.style.display = 'block';
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      var info_line = create_header('dhm', pi_local);
      document.getElementById('dheatmap_title').innerHTML = info_line;
      
      var html = '';
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+ts;
      document.getElementById('pre_dheatmap_div').style.display = 'block';
       // get distance matrix via AJAX
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/visuals/heatmap', true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      showDots='';
      var myWaitVar = setInterval(myWaitFunction,1000,dhm_div);
      xmlhttp.onreadystatechange = function() {        
        if (xmlhttp.readyState == 4 ) {
            clearInterval(myWaitVar);
            var htmlstring = xmlhttp.responseText;           
            dhm_div.innerHTML = htmlstring;
        }
      };
      xmlhttp.send(args);      
}
//
//  CREATE FREQUENCY HEATMAP
//
function create_fheatmap(ts) {
      //alert('im HM')
      fheatmap_created = true;
      var fhm_div = document.getElementById('fheatmap_div');
	    fhm_div.style.display = 'block';
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      var info_line = create_header('fhm', pi_local);
      document.getElementById('fheatmap_title').innerHTML = info_line;
      
      var html = '';
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+ts;
      document.getElementById('pre_fheatmap_div').style.display = 'block';
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/visuals/frequency_heatmap', true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      showDots='';
      var myWaitVar = setInterval(myWaitFunction,1000,fhm_div);
      xmlhttp.onreadystatechange = function() {        
        if (xmlhttp.readyState == 4 ) {
            clearInterval(myWaitVar);
            var htmlstring = xmlhttp.responseText;           
            fhm_div.innerHTML = htmlstring;
        }
      };
      xmlhttp.send(args);   
      
}
//
//  CREATE GEOSPATIAL
//
function create_geospatial(ts) {
      //alert('in GEO')
      geospatial_created = true;
      var geo_div = document.getElementById('map-canvas');
	    geo_div.style.display = 'block';
	    geo_div.style.height = '900px';
            
      var info_line = create_header('geo', pi_local);
      
      document.getElementById('geospatial_title').innerHTML = info_line;
       
      document.getElementById('pre_geospatial_div').style.display = 'block';
      
      var loc_data = [];
      var lat_lon_collector = {};
      var latlon;
      
      for (var ds in md_local) {
          var lat = '';
          var lon = '';
          for (var k in md_local[ds]) {
            md_item = k;
            if(md_item == 'latitude') {
              lat = Number(md_local[ds][k]);
            }
            if(md_item == 'longitude'){              
              lon = Number(md_local[ds][k]);
            }           
            
          } 
          
          if(typeof lat == 'number' && typeof lon == 'number'){
            latlon = lat.toString() +';'+ lon.toString();
            if (latlon in lat_lon_collector) {
              newds = lat_lon_collector[latlon] + "<br>" + ds;
              lat_lon_collector[latlon] = newds;
            }else{
              lat_lon_collector[latlon] = ds;
            }            
          }
      }
      var z = 1;

      for(latlon in lat_lon_collector){
        //alert(latlon)
        ds = lat_lon_collector[latlon];
        var latlons =  latlon.split(';');
        loc_data.push([ds,latlons[0],latlons[1],z]);
        z+=1; 

      }

      if (loc_data.length === 0){
          geospatial_div.innerHTML='No Lat/Lon Data Found/Selected';
      }else{
        var center = new google.maps.LatLng(loc_data[0][1],loc_data[0][2]); 
        var mapCanvas = document.getElementById('map-canvas');
        var mapOptions = {
          center : center,
          zoom   : 3,
          //zoom: 2,
          //mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(mapCanvas, mapOptions);
        var infowindow =  new google.maps.InfoWindow({
          content: ''
        });

        setMarkers(map, loc_data, infowindow);
      }  
}
//
//
//
function bindInfoWindow(marker, map, infowindow, html) { 
  google.maps.event.addListener(marker, 'click', function() { 
    infowindow.setContent(html); 
    infowindow.open(map, marker); 
  }); 
} 
//
//
//
function setMarkers(map, loc_data, infowindow) {
  for (var i = 0; i < loc_data.length; i++) {
    // create a marker
	 // alert(locations[0])
    var data = loc_data[i];
	
    var myLatLng = new google.maps.LatLng(data[1],data[2]); 
    var marker = new google.maps.Marker({
      title: data[0],
      position: myLatLng,
      map: map
    });
    
    // add an event listener for this marker
    bindInfoWindow(marker, map, infowindow, "<p>" + data[0] + "</p>"); 

  }

}
//
//  CREATE PIECHARTS
//
function create_piecharts(ts) {
     
    piecharts_created = true;
    
    var info_line = create_header('pies', pi_local);
	  var piecharts_div = document.getElementById('piecharts_div');
    piecharts_div.innerHTML = '';
	  piecharts_div.style.display = 'block';
    document.getElementById('piecharts_title').innerHTML = info_line;
    document.getElementById('pre_piecharts_table_div').style.display = 'block';
    //d3.select('svg').remove();
    var unit_list = [];
    for (var o in mtx_local.rows){
        unit_list.push(mtx_local.rows[o].id);
    }
    //var colors = get_colors(unit_list);
    
	
	var tmp={};
	var tmp_names={};
    for (var d in mtx_local.columns){
      tmp[mtx_local.columns[d].id]=[]; // data
      //tmp_names[mtx_local.columns[d].id]=mtx_local.columns[d].id; // datasets
    }
    for (var x in mtx_local.data){
      for (var y in mtx_local.columns){
        tmp[mtx_local.columns[y].id].push(mtx_local.data[x][y]);
      }
    }
    var myjson_obj={};
    myjson_obj.names=[];
    myjson_obj.values=[];
    //myjson_obj.dids=[];
    for (var z in tmp) {
        
        myjson_obj.names.push(z);
        myjson_obj.values.push(tmp[z]);
        //myjson_obj.dids.push(z);
    }
	//alert(myjson_obj.names);
    
    var pies_per_row = 4;
    var m = 20; // margin
    var r = 320/pies_per_row; // five pies per row
    var image_w = 2*(r+m)*pies_per_row;
    var image_h = Math.ceil(myjson_obj.values.length / 4 ) * ( 2 * ( r + m ) )+ 30;
    var arc = d3.svg.arc()
        .innerRadius(0)
        .outerRadius(r);
    var pie = d3.layout.pie();
	
    var svgContainer = d3.select("#piecharts_div").append("svg")
        .attr("width",image_w)
        .attr("height",image_h);
		
    var pies = svgContainer.selectAll("svg")
        .data(myjson_obj.values)
        .enter().append("g")
        .attr("transform", function(d, i){

            var modulo_i = i+1;
            var diam = r+m;
            var h_spacer = diam*2*(i % pies_per_row);
            var v_spacer = diam*2*Math.floor(i / pies_per_row);
            return "translate(" + (diam + h_spacer) + "," + (diam + v_spacer) + ")";
        })
        
		.append("a")
        //.attr("xlink:xlink:href", function(d, i) { return 'bar_single?did='+myjson_obj.dids[i]+'&ts='+ts;} )
        .attr("xlink:xlink:href", function(d, i) { return 'bar_single?id='+myjson_obj.names[i]+'&ts='+ts;} )
		.attr("target", '_blank' );
	pies.append("text")
        .attr("dx", -(r+m))
        .attr("dy", r+m)
        .attr("text-anchor", "center")
        .attr("font-size","9px")
        .text(function(d, i) {
			return mtx_local.columns[i].id;
        });
    pies.selectAll("path")
        .data(pie.sort(null))
        .enter().append("path")
        .attr("d", arc)
        .attr("id",function(d, i) {
            var cnt = d.value;
            var total = 0;
            for (var k in this.parentNode.__data__){
              total += this.parentNode.__data__[k];
            }           
            
            var ds = ''; // PLACEHOLDER for TT
            var pct = (cnt * 100 / total).toFixed(2);
            var id = 'piecharts-|-'+unit_list[i]+'-|-'+cnt.toString()+'-|-'+pct;
            //alert(unit_list[i]+'-|-'+cnt.toString()+'-|-'+total+'-|-'+pct)
            return id; // ip of each rectangle should be datasetname-|-unitname-|-count
           
        })
        .attr("class","tooltip_viz")
        .style("fill", function(d, i) {
            return string_to_color_code(unit_list[i]);;
        });


   
}

//
//  CREATE BARCHARTS
//
function create_barcharts_group(ts) {
// 
//         
         barcharts_created = true;
         var info_line = create_header('bars', pi_local);
 		     document.getElementById('barcharts_div').innerHTML = '';
// 		barcharts_div.style.display = 'block';
         document.getElementById('barcharts_title').innerHTML = info_line;
         document.getElementById('pre_barcharts_table_div').style.display = 'block';
		 
         // this fxn is in common_selection.js
         create_barcharts('group');

}
//
//
//
function create_adiversity(ts){
    //python scripts
    adiversity_created = true;
    var info_line = create_header('adiversity', pi_local);
    document.getElementById('adiversity_title').innerHTML = info_line;
    document.getElementById('pre_adiversity_div').style.display = 'block';
    document.getElementById('adiversity_div').style.display = 'block';
    document.getElementById('adiversity_div').innerHTML = '....';

      adiversity_created = true;
      var adiversity_div = document.getElementById('adiversity_div');
      adiversity_div.style.display = 'block';
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      var info_line = create_header('adiversity', pi_local);
      document.getElementById('adiversity_title').innerHTML = info_line;
      
      var html = '';
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+ts;
      document.getElementById('pre_adiversity_div').style.display = 'block';
       // get distance matrix via AJAX
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/visuals/alpha_diversity', true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      showDots='';
      var myWaitVar = setInterval(myWaitFunction,1000,adiversity_div);
      xmlhttp.onreadystatechange = function() {        
        if (xmlhttp.readyState == 4 ) {
           clearInterval(myWaitVar);
           var retstring = xmlhttp.responseText;           
           var lines = retstring.split('\n');
           //alert(lines[0])
           var headers = lines.shift();
           //var line2 = lines.pop();
           //alert(headers)
           html = "<table class='table'>";
           html += '<tr>';
           //alert(line2)
           var header_items = headers.split('\t')
           for(i in header_items){
             html += '<td>'+header_items[i]+'</td>';
           }
           html +=  '</tr>';
           for(i in lines){
              html +=  '<tr>';
              items = lines[i].split('\t');
              for(j in items){
                html += '<td>'+items[j]+'</td>';
              }
              html +=  '</tr>';
           }
           html += '</table>';

           adiversity_div.innerHTML = html;
        }
      };
      xmlhttp.send(args);      
         

}

//
//  CREATE PHYLOSEQ
//
function create_phyloseq(ts,code) {
      //alert('im HM')
      phyloseq_created = true;
      var phylo_div,info_line
      var html = '';
      var args =  "metric="+pi_local.selected_distance;
      args += "&plot_type="+code;
      args += "&ts="+ts;

      if(code == 'bar'){
        phylo_div = document.getElementById('phyloseq01_div');
        info_line = create_header('phyloseq', pi_local);
        document.getElementById('phyloseq01_title').innerHTML = info_line;
        document.getElementById('pre_phyloseq01_div').style.display = 'block';
      }else if(code == 'heatmap'){
        phylo_div = document.getElementById('phyloseq02_div');
        info_line = create_header('phyloseq', pi_local);
        document.getElementById('phyloseq02_title').innerHTML = info_line;
        document.getElementById('pre_phyloseq02_div').style.display = 'block';
      }else if(code == 'network'){
        phylo_div = document.getElementById('phyloseq03_div');
        info_line = create_header('phyloseq', pi_local);
        document.getElementById('phyloseq03_title').innerHTML = info_line;
        document.getElementById('pre_phyloseq03_div').style.display = 'block';
        md1 = document.getElementById('phyloseq_network_md1').value;
        md2 = document.getElementById('phyloseq_network_md2').value;
        args += "&md1="+md1+"&md2="+md2;
      }else if(code == 'ord1'){
        phylo_div = document.getElementById('phyloseq04_div');

        info_line = create_header('phyloseq', pi_local);
        document.getElementById('phyloseq04_title').innerHTML = info_line;
        document.getElementById('pre_phyloseq04_div').style.display = 'block';
        md1 = document.getElementById('phyloseq_ord_md1').value;
        md2 = document.getElementById('phyloseq_ord_md2').value;
        args += "&md1="+md1+"&md2="+md2;
      }else if(code == 'tree'){
        phylo_div = document.getElementById('phyloseq05_div');
        info_line = create_header('phyloseq', pi_local);
        document.getElementById('phyloseq05_title').innerHTML = info_line;
        document.getElementById('pre_phyloseq05_div').style.display = 'block';
      }
      //phylo_div.innerHTML = '....';
      phylo_div.style.display = 'block';
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      
      
      
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/visuals/phyloseq', true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      //xmlhttp.setRequestHeader("Content-type","application/xml");
      showDots='';
      var myWaitVar = setInterval(myWaitFunction,1000,phylo_div);
      xmlhttp.onreadystatechange = function() {        
        if (xmlhttp.readyState == 4 ) {
           clearInterval(myWaitVar);
           var htmlstring = xmlhttp.responseText;           
           phylo_div.innerHTML = htmlstring;
        }
      };
      xmlhttp.send(args);   
      
}
//
//  Interval timer  
//
function myWaitFunction(div) {
    showDots = showDots || '.';
    div.innerHTML = showDots;
    showDots += '.';
}
//
//
//

function create_header(viz, pi) {
  
  var txt;
  //viz_possibles = ['bars','pies','geo','dhm','fhm','dend-svg','dend-pdf','pcoa','ftable','mtable'];
  
    if(viz == 'geo'){
      txt = 'Geospatial --> ';
    }else if(viz == 'bars'){
      txt = 'Barcharts --> ';
    }else if(viz == 'pies'){
      txt = 'Piecharts --> ';
    }else if(viz == 'dhm'){
      txt = 'Distance Heatmap --> ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'fhm'){
      txt = 'Frequency Heatmap --> ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'dend'){
      txt = 'Dendrogram --> ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'pcoa'){
      txt = 'PCoA 2D --> ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'pcoa_3d'){
      txt = 'PCoA 3D -->';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'ftable'){
      txt = 'Frequency Table --> ';
    }else if(viz == 'mtable'){
      txt = 'Metadata Table --> ';
    }else if(viz == 'dbrowser'){
      txt = 'Data Browser --> ';
    }else if(viz == 'adiversity'){
      txt = 'Alpha Diversity --> ';
    }else if(viz == 'phyloseq'){
      txt = 'Phyloseq testing --> ';
    }else{
      txt = 'ERROR in fxn create_headers '+viz;
    }
  txt += ' Normalization: ' + pi.normalization+'; ';
  txt += ' Counts Min/Max: ' + pi.min_range+'% -- '+pi.max_range+'%';
     
  return txt;
}

function download_data(type, datasets, download_type, ts) {
    var html = '';
    var args =  "datasets="+datasets;
    args += "&download_type="+download_type;
    
    var xmlhttp = new XMLHttpRequest(); 
    if(type == 'metadata'){
      target = '/user_data/download_selected_metadata';      
    } else if(type == 'fasta'){
      target = '/user_data/download_selected_seqs'
    }else if(type == 'matrix'){
//alert(ts)
      args += '&ts='+ts;
      target = '/user_data/download_selected_matrix'
    }else{

    }
    xmlhttp.open("POST", target, true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 ) {
         var filename = xmlhttp.responseText; 
         html += "<div class='pull-right'>Your file is being compiled.<br>The filename is: "+filename;
         html += "<br>When ready your file can be downloaded from the <a href='/user_data/file_retrieval'>file retrieval page.</a></div>"
         document.getElementById('download_confirm_id').innerHTML = html;
      }
    };
    xmlhttp.send(args);   
}
