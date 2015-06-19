
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


$("body").delegate(".tooltipx", "mouseover mouseout mousemove", function (event) {
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


// normalization radio-buttons
var norm_counts_radios = document.getElementsByName('normalization');
if (typeof norm_counts_radios[0] !=="undefined") {
  norm_counts_radios[0].addEventListener('click', function () {
	  document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update Data'
	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
  norm_counts_radios[1].addEventListener('click', function () {
	  document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update Data'
	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
  norm_counts_radios[2].addEventListener('click', function () {
	  document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update Data'
	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
}
// Distance Metric Select (Combo)
selected_distance_combo = document.getElementById('selected_distance');

if (typeof selected_distance_combo !=="undefined") {
	$('.selectpicker').on('change', function () {
  	  //alert(selected_distance_combo)
      document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update Data'
  	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
	});
}
// MIN Select (Combo)
min_range_combo = document.getElementById('min_range');
if (typeof min_range_combo !=="undefined") {
	min_range_combo.addEventListener('change', function () {
  	  document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update Data'
  	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
	});
}
// MAX Select (Combo)
max_range_combo = document.getElementById('max_range');
if (typeof max_range_combo !=="undefined") {
	max_range_combo.addEventListener('change', function () {
  	  document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update Data'
  	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
	});
}
//
//
// COUNTS Table
//
var tax_counts_link = document.getElementById('counts_table_link_id');
var tax_counts_btn = document.getElementById('counts_table_hide_btn');
var tax_counts_div = document.getElementById('tax_table_div');
var counts_table_download_btn = document.getElementById('counts_table_download_btn');
var pre_counts_table_div = document.getElementById('pre_counts_table_div');
if (typeof tax_counts_link !=="undefined") {
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
	  var f = document.createElement("form");
	  f.setAttribute('method',"POST");
	  f.setAttribute('action',"download_counts_matrix");
	  
	  var s = document.createElement("input"); //input element, text
	  s.setAttribute('type',"submit");
	  s.setAttribute('value',"Submit");
	  
	  f.appendChild(s);
	  document.getElementsByTagName('body')[0].appendChild(f);
	  f.submit();
  });
}
//
// METADATA  Table
//
var metadata_link = document.getElementById('metadata_table_link_id');
var metadata_btn = document.getElementById('metadata_table_hide_btn');
var metadata_div = document.getElementById('metadata_local_table_div');
var metadata_download_btn = document.getElementById('metadata_download_btn');
var pre_metadata_table_div = document.getElementById('pre_metadata_table_div');
if (typeof metadata_link !=="undefined") {
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
var piecharts_link = document.getElementById('piecharts_link_id');
var piecharts_btn = document.getElementById('piecharts_hide_btn');
var piecharts_div = document.getElementById('piecharts_div');
var piecharts_download_btn = document.getElementById('piecharts_download_btn');
var pre_piecharts_table_div = document.getElementById('pre_piecharts_table_div');
if (typeof piecharts_link !=="undefined") {
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
var dbrowser_link = document.getElementById('dbrowser_link_id');
var dbrowser_btn = document.getElementById('dbrowser_hide_btn');
var dbrowser_div = document.getElementById('dbrowser_div');
var dbrowser_download_btn = document.getElementById('dbrowser_download_btn');
var pre_dbrowser_div = document.getElementById('pre_dbrowser_div');
if (typeof dbrowser_link !=="undefined") {
  dbrowser_link.addEventListener('click', function () {
      
	  if(typeof dbrowser_created == "undefined"){
        create_viz('dbrowser', pi_local.ts);
		dbrowser_download_btn.disabled = false;
      }else{
        if(dbrowser_btn.value == 'hide'){
          //toggle_visual_element(piecharts_div,'show',dbrowser_btn);
        }else{
          toggle_visual_element(dbrowser_div,'hide',dbrowser_btn);
        }
      }
      $(pre_dbrowser_div).scrollView();
  });
}
if (typeof dbrowser_btn !=="undefined") {
  dbrowser_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dbrowser_btn.value == 'hide'){
        toggle_visual_element(dbrowser_div,'show',dbrowser_btn);
      }else{
        toggle_visual_element(dbrowser_div,'hide',dbrowser_btn);
      }
      
  });
}
//
// BARCHARTS
//
var barchart_link = document.getElementById('barcharts_link_id');
var barcharts_btn = document.getElementById('barcharts_hide_btn');
var barcharts_div = document.getElementById('barcharts_div');
var barcharts_download_btn = document.getElementById('barcharts_download_btn');
var pre_barcharts_table_div = document.getElementById('pre_barcharts_table_div');
if (typeof barchart_link !=="undefined") {
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
var dheatmap_link = document.getElementById('dheatmap_link_id');
var dheatmap_btn = document.getElementById('dheatmap_hide_btn');
var dheatmap_div = document.getElementById('dheatmap_div');
var dheatmap_download_btn = document.getElementById('dheatmap_download_btn');
var pre_dheatmap_div = document.getElementById('pre_dheatmap_div');
if (typeof dheatmap_link !=="undefined") {
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
var fheatmap_link = document.getElementById('fheatmap_link_id');
var fheatmap_btn = document.getElementById('fheatmap_hide_btn');
var fheatmap_div = document.getElementById('fheatmap_div');
var fheatmap_download_btn = document.getElementById('fheatmap_download_btn');
var pre_fheatmap_div = document.getElementById('pre_fheatmap_div');
if (typeof fheatmap_link !=="undefined") {
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
var dendrogram1_link = document.getElementById('dendrogram1_link_id');
var dendrogram1_btn = document.getElementById('dendrogram1_hide_btn');
var dendrogram1_div = document.getElementById('dendrogram1_div');
var dendrogram1_download_btn = document.getElementById('dendrogram1_download_btn');
var pre_dendrogram1_div = document.getElementById('pre_dendrogram1_div');
if (typeof dendrogram1_link !=="undefined") {
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
var dendrogram2_link = document.getElementById('dendrogram2_link_id');
var dendrogram2_btn = document.getElementById('dendrogram2_hide_btn');
var dendrogram2_div = document.getElementById('dendrogram2_div');
var dendrogram2_download_btn = document.getElementById('dendrogram2_download_btn');
var pre_dendrogram2_div = document.getElementById('pre_dendrogram2_div');
if (typeof dendrogram2_link !=="undefined") {
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
// DENDROGRAM PDF
//
var dendrogram_pdf_link = document.getElementById('dendrogram_pdf_link_id');
var dendrogram_pdf_btn = document.getElementById('dendrogram_pdf_hide_btn');
var dendrogram_pdf_div = document.getElementById('dendrogram_pdf_div');
var dendrogram_pdf_download_btn = document.getElementById('dendrogram_pdf_download_btn');
var pre_dendrogram_pdf_div = document.getElementById('pre_dendrogram_pdf_div');
if (typeof dendrogram_pdf_link !=="undefined") {
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
var pcoa_link = document.getElementById('pcoa_link_id');
var pcoa_btn = document.getElementById('pcoa_hide_btn');
var pcoa_div = document.getElementById('pcoa_div');
var pcoa_download_btn = document.getElementById('pcoa_download_btn');
var pre_pcoa_div = document.getElementById('pre_pcoa_div');
if (typeof pcoa_link !=="undefined") {
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
var pcoa_3d_link = document.getElementById('pcoa_3d_link_id');
var pcoa_3d_btn = document.getElementById('pcoa_3d_hide_btn');
var pcoa_3d_div = document.getElementById('pcoa_3d_div');
var pcoa_3d_download_btn = document.getElementById('pcoa_3d_download_btn');
var pre_pcoa_3d_div = document.getElementById('pre_pcoa_3d_div');
if (typeof pcoa_3d_link !=="undefined") {
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
var geospatial_link = document.getElementById('geospatial_link_id');
var geospatial_btn = document.getElementById('geospatial_hide_btn');
var geospatial_div = document.getElementById('map-canvas');
var geospatial_download_btn = document.getElementById('geospatial_download_btn');
var pre_geospatial_div = document.getElementById('pre_geospatial_div');
if (typeof geospatial_link !=="undefined") {
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
      html += "<tr><td></td>";
      for (var n in mtx_local.columns) {
        html += "<td class=''>"+mtx_local.columns[n].name +"</td>";
      }
      html += "</tr>";
      
      for (var i in mtx_local.rows){
        html += "<tr class='chart_row'>";
        html += "<td class='left_justify'>"+mtx_local.rows[i].name +"</td>";
        for (var da in mtx_local.data[i]) {
          var cnt = mtx_local.data[i][da];
		  
          var pct =  (cnt * 100 / mtx_local.column_totals[da]).toFixed(2);
          var id  = 'frequencies-|-'+mtx_local.rows[i].name+'-|-'+mtx_local.columns[da].name+'-|-'+cnt.toString()+'-|-'+pct.toString();
          html += "<td id='"+id+"' class='tooltipx right_justify'>"+String(cnt)+'</td>';
          
        }
        html += "</tr>";
      }
      // TOTALS
      html += "<tr>";
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
      }
      
      
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      
      
      
      var html = '';
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+ts;
      args += "&image_type="+image_type;
	  args += "&script="+script;
      
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/visuals/dendrogram', true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState == 4 ) {
           var htmlstring = xmlhttp.responseText;
           html = "<div id='' >"+htmlstring+"</div>";
           dend_div.innerHTML = html;
        }
      };
      xmlhttp.send(args);
 
}


//
//  CREATE PCoA -- both 2d and 3d
//
function create_pcoa(ts,image_type) {
      //alert('JS PCoA')
    if(image_type == '2d'){
        pcoa_created = true;
        var pcoa_div = document.getElementById('pcoa_div');
        var info_line = create_header('pcoa', pi_local);
  	    pcoa_div.style.display = 'block';
        document.getElementById('pcoa_title').innerHTML = info_line;
        document.getElementById('pre_pcoa_div').style.display = 'block';
    }else if(image_type =='3d'){
        pcoa_created = true;
        var pcoa_3d_div = document.getElementById('pcoa_3d_div');
        var info_line = create_header('pcoa_3d', pi_local);
  	    pcoa_3d_div.style.display = 'block';
        document.getElementById('pcoa_3d_title').innerHTML = info_line;
        document.getElementById('pre_pcoa_3d_div').style.display = 'block';
    }else{
        // ERROR
    }
      
      
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+ts;
      args += "&image_type="+image_type;
      
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/visuals/pcoa', true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState == 4 ) {
           var response = xmlhttp.responseText;
           
           if(image_type == '2d'){
               pcoa_div.innerHTML = response;
           }else if(image_type == '3d'){
               pcoa_3d_div.innerHTML = response;
           }
           
           
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
         xmlhttp.onreadystatechange = function() {
           if (xmlhttp.readyState == 4 ) {
              var response = xmlhttp.responseText;              
              dbrowser_div.innerHTML = response;            
           }
         };
         xmlhttp.send(args);
}
//
//
//
function get_dbrowser_html() {
    
        // var html = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n";
        // html += "<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\" lang=\"en\">\n";
        // html += "<head>\n";
        // html += "<meta charset=\"utf-8\"/>\n";
        // html += "<link rel='shortcut icon' href='/images/favicon.ico' />\n";
        // html += "<script id=\"notfound\">window.onload=function(){document.body.innerHTML=\"Could not get resources from 'http://krona.sourceforge.net'.\"}</script>\n";
        // html += "<script src=\"/javascript/krona-2.3.js\"></script>\n";
        // html += "</head>\n";
        // html += "<body>\n";
        // html += "<img id='hiddenImage' src='/images/hidden.png' style='display:none' />\n";
        // html += "<noscript>Javascript must be enabled to view this page.</noscript>\n";
        // html += "<div style='display:none'>\n";
        // html += "<krona  collapse='false' key='true'>\n";
        // html += "<attributes magnitude='seqcount'>\n";
        // html += "  <attribute display='Abundance'>seqcount</attribute>\n";
        // html += "  <attribute display='Rank' mono='true'>rank</attribute>\n";
        // html += "</attributes>\n";
      //return html
}
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
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
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
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
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
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      
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

function bindInfoWindow(marker, map, infowindow, html) { 
  google.maps.event.addListener(marker, 'click', function() { 
    infowindow.setContent(html); 
    infowindow.open(map, marker); 
  }); 
} 
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
	piecharts_div.style.display = 'block';
    document.getElementById('piecharts_title').innerHTML = info_line;
    document.getElementById('pre_piecharts_table_div').style.display = 'block';
    //d3.select('svg').remove();
    var unit_list = [];
    for (var o in mtx_local.rows){
        unit_list.push(mtx_local.rows[o].name);
    }
    //var colors = get_colors(unit_list);
    
	
	var tmp={};
	var tmp_names={};
    for (var d in mtx_local.columns){
      tmp[mtx_local.columns[d].did]=[]; // data
      tmp_names[mtx_local.columns[d].did]=mtx_local.columns[d].name; // datasets
    }
    for (var x in mtx_local.data){
      for (var y in mtx_local.columns){
        tmp[mtx_local.columns[y].did].push(mtx_local.data[x][y]);
      }
    }
    var myjson_obj={};
    myjson_obj.names=[];
    myjson_obj.values=[];
    myjson_obj.dids=[];
    for (var z in tmp) {
        
        myjson_obj.names.push(tmp_names[z]);
        myjson_obj.values.push(tmp[z]);
        myjson_obj.dids.push(z);
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
        .attr("xlink:xlink:href", function(d, i) { return 'bar_single?did='+myjson_obj.dids[i]+'&ts='+ts;} )
		.attr("target", '_blank' );
	pies.append("text")
        .attr("dx", -(r+m))
        .attr("dy", r+m)
        .attr("text-anchor", "center")
        .attr("font-size","9px")
        .text(function(d, i) {
			return mtx_local.columns[i].name;
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
        .attr("class","tooltipx")
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
// 		var barcharts_div = document.getElementById('barcharts_div');
// 		barcharts_div.style.display = 'block';
         document.getElementById('barcharts_title').innerHTML = info_line;
         document.getElementById('pre_barcharts_table_div').style.display = 'block';
		 
         // this fxn is in common_selection.js
         create_barcharts('group');

}


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
    }else{
      txt = 'ERROR in fxn create_headers '+viz;
    }
  txt += ' Normalization: ' + pi.normalization+'; ';
  txt += ' Counts Min/Max: ' + pi.min_range+'% -- '+pi.max_range+'%';
     
  return txt;
}

