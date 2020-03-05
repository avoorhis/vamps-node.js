


$.fn.scrollView = function () {
    return this.each(function () {
        $('html, body').animate({
            scrollTop: $(this).offset().top - 80
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
// Distance Heatmap pie charts/barcharts
$("body").delegate(".tooltip_viz", "mouseover mouseout mousemove", function (event) {
      var link = this,
      html = '';
      $link = $(this);
     
      if (event.type == 'mouseover') {
        tip.id = link.id;
        link.id = '';
        id_items = tip.id.split('/');  // use slash '/' here to split save space on long/many ids
        html = "<table><tr>";
        if(id_items[0] == 'dh') {  // distance heatmap
          html += "<td>"+id_items[1]+"</td>";
          html += "</tr><tr>";
          html += "<td>"+id_items[2]+"</td>";
          html += "</tr><tr>";
          html += "<td>Distance: "+id_items[3]+": "+id_items[4]+"</td>";
        }else if(id_items[0] == 'fq'){  // frequencies for tax table
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
        id_items = tip.id.split('-|-'); // MUST split on '-|-' see constants.js for constants.VISUAL_THUMBNAILS
        
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
var selected_distance_combo = document.getElementById('selected_distance');
if (typeof selected_distance_combo !=="undefined") {
  $('.selectpicker').on('change', function () {
      //alert(selected_distance_combo)
      document.getElementById('output_choices_submit_btn').disabled = false;
    document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update'
      document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
}
// MIN Select (Combo)
var min_range_combo = document.getElementById('min_range') ;
if (typeof min_range_combo !=="undefined") {
  min_range_combo.addEventListener('change', function () {
      document.getElementById('output_choices_submit_btn').disabled = false;
    document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update'
      document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
}
// MAX Select (Combo)
var max_range_combo = document.getElementById('max_range');
if (typeof max_range_combo !=="undefined") {
  max_range_combo.addEventListener('change', function () {
      document.getElementById('output_choices_submit_btn').disabled = false;
    document.getElementById('output_choices_submit_btn').innerHTML='<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Update'
      document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
}

//
// COUNTS MATRIX
//
var tax_counts_link = document.getElementById('counts_matrix_link_id') || null;
var tax_counts_btn = document.getElementById('counts_matrix_hide_btn');
var tax_counts_div = document.getElementById('counts_matrix_div');
var pre_counts_matrix_div = document.getElementById('pre_counts_matrix_div');
if (tax_counts_link !== null) {
    tax_counts_link.addEventListener('click', function () {
    
        if(typeof tax_table_created == "undefined"){
        
            create_viz('counts_matrix', false);
            
        }else{
            if(tax_counts_btn.value == 'hide'){
              //toggle_visual_element(tax_counts_div,'show',tax_counts_btn);
            }else{
              toggle_visual_element(tax_counts_div,'hide',tax_counts_btn);
            }
        }
    	$(pre_counts_matrix_div).scrollView();	
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
var counts_matrix_open_btn = document.getElementById('counts_matrix_open_btn') || null;
if (counts_matrix_open_btn !== null) {
  counts_matrix_open_btn.addEventListener('click', function () {
      
      create_viz('counts_matrix', true);      
  });
}

//
// BARCHARTS
//
var barchart_link = document.getElementById('barcharts_link_id') || null;
var barcharts_btn = document.getElementById('barcharts_hide_btn');
var barcharts_div = document.getElementById('barcharts_div');
var pre_barcharts_div = document.getElementById('pre_barcharts_div');
if (barchart_link !== null) {
  barchart_link.addEventListener('click', function () {
      
    if(typeof barcharts_created == "undefined"){
        create_viz('barcharts', false);
        
      }else{
        if(barcharts_btn.value == 'hide', false){        
          //toggle_visual_element(barcharts_div,'show',barcharts_btn);
        }else{
          toggle_visual_element(barcharts_div,'hide',barcharts_btn);
        }
      }
      $(pre_barcharts_div).scrollView();
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
var barcharts_open_btn = document.getElementById('barcharts_open_btn');
if (typeof barcharts_open_btn !== "undefined") {
  barcharts_open_btn.addEventListener('click', function () {
      create_viz('barcharts', pi_local.ts, true, cts_local);      
  });
}
//
// PIECHARTS
//
var piecharts_link = document.getElementById('piecharts_link_id') || null;
var piecharts_btn = document.getElementById('piecharts_hide_btn');
var piecharts_div = document.getElementById('piecharts_div');

var pre_piecharts_div = document.getElementById('pre_piecharts_div');
if (piecharts_link !== null) {
  piecharts_link.addEventListener('click', function () {
      
    if(typeof piecharts_created == "undefined"){
        create_viz('piecharts', false);
    		
      }else{
        if(piecharts_btn.value == 'hide'){
          //toggle_visual_element(piecharts_div,'show',piecharts_btn);
        }else{
          toggle_visual_element(piecharts_div,'hide',piecharts_btn);
        }
      }
      $(pre_piecharts_div).scrollView();
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
var piecharts_open_btn = document.getElementById('piecharts_open_btn');
if (typeof piecharts_open_btn !== "undefined") {
  piecharts_open_btn.addEventListener('click', function () {
      create_viz('piecharts', pi_local.ts, true, cts_local);      
  });
}
//
// DISTANCE HEATMAP
//
var dheatmap_link = document.getElementById('dheatmap_link_id') || null;
var dheatmap_hide_btn = document.getElementById('dheatmap_hide_btn');
var dheatmap_div = document.getElementById('dheatmap_div');
var pre_dheatmap_div = document.getElementById('pre_dheatmap_div');
if (dheatmap_link !== null) {
  dheatmap_link.addEventListener('click', function () {
      
    if(typeof dheatmap_created == "undefined"){
        create_viz('dheatmap', false);
        
      }else{
        if(dheatmap_hide_btn.value == 'hide'){        
          //toggle_visual_element(dheatmap_div,'show',dheatmap_btn);
        }else{
          toggle_visual_element(dheatmap_div,'hide',dheatmap_hide_btn);
        }
      }
      $(pre_dheatmap_div).scrollView();
  });
}
if (typeof dheatmap_hide_btn !== "undefined") {
  dheatmap_hide_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dheatmap_hide_btn.value == 'hide'){        
        toggle_visual_element(dheatmap_div,'show',dheatmap_hide_btn);
      }else{
        toggle_visual_element(dheatmap_div,'hide',dheatmap_hide_btn);
      }
      
  });
}
var dheatmap_open_btn = document.getElementById('dheatmap_open_btn');
if (typeof dheatmap_open_btn !== "undefined") {
  dheatmap_open_btn.addEventListener('click', function () {
      create_viz('dheatmap', pi_local.ts, true, cts_local);      
  });
}
//
// FREQUENCY HEATMAP
//
var fheatmap_link = document.getElementById('fheatmap_link_id') || null;
var fheatmap_btn = document.getElementById('fheatmap_hide_btn');
var fheatmap_div = document.getElementById('fheatmap_div');

var pre_fheatmap_div = document.getElementById('pre_fheatmap_div');
if (fheatmap_link !== null) {
  fheatmap_link.addEventListener('click', function () {
      
    if(typeof fheatmap_created == "undefined"){
        create_viz('fheatmap', false);
    		
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
var fheatmap_open_btn = document.getElementById('fheatmap_open_btn');
if (typeof fheatmap_open_btn !== "undefined") {
  fheatmap_open_btn.addEventListener('click', function () {
      create_viz('fheatmap', pi_local.ts, true, cts_local);      
  });
}
//
// DENDROGRAM1  D3 Phylogram
//
var dendrogram01_link = document.getElementById('dendrogram01_link_id') || null;
var dendrogram01_btn = document.getElementById('dendrogram01_hide_btn');
var dendrogram01_div = document.getElementById('dendrogram01_div');

var pre_dendrogram01_div = document.getElementById('pre_dendrogram01_div');
if (dendrogram01_link !== null) {
  dendrogram01_link.addEventListener('click', function () {
      
    if(typeof dendrogram01_created == "undefined"){
        create_viz('dendrogram01', false);
    		
      }else{
        if(dendrogram01_btn.value == 'hide'){        
          //toggle_visual_element(dendrogram1_div,'show',dendrogram1_btn);
        }else{
          toggle_visual_element(dendrogram01_div,'hide',dendrogram01_btn);
        }
      }
    $(pre_dendrogram01_div).scrollView();
  });
}
if (typeof dendrogram01_btn !== "undefined") {
  dendrogram01_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dendrogram01_btn.value == 'hide'){        
        toggle_visual_element(dendrogram01_div,'show',dendrogram01_btn);
      }else{
        toggle_visual_element(dendrogram01_div,'hide',dendrogram01_btn);
      }      
  });
}
var dendrogram01_open_btn = document.getElementById('dendrogram01_open_btn');
if (typeof dendrogram01_open_btn !== "undefined") {
  dendrogram01_open_btn.addEventListener('click', function () {
      create_viz('dendrogram01', pi_local.ts, true, cts_local);      
  });
}

//
// DENDROGRAM3  D3 Radial
//
var dendrogram03_link = document.getElementById('dendrogram03_link_id') || null;
var dendrogram03_btn = document.getElementById('dendrogram03_hide_btn');
var dendrogram03_div = document.getElementById('dendrogram03_div');

var pre_dendrogram03_div = document.getElementById('pre_dendrogram03_div');
if (dendrogram03_link !== null) {
  dendrogram03_link.addEventListener('click', function () {
      
    if(typeof dendrogram03_created == "undefined"){
        create_viz('dendrogram03', false);
    		
      }else{
        if(dendrogram03_btn.value == 'hide'){        
          //toggle_visual_element(dendrogram_div,'show',dendrogram_btn);
        }else{
          toggle_visual_element(dendrogram03_div,'hide',dendrogram3_btn);
        }
      }
    $(pre_dendrogram03_div).scrollView();
  });
}
if (typeof dendrogram03_btn !== "undefined") {
  dendrogram03_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dendrogram03_btn.value == 'hide'){        
        toggle_visual_element(dendrogram03_div,'show',dendrogram03_btn);
      }else{
        toggle_visual_element(dendrogram03_div,'hide',dendrogram03_btn);
      }      
  });
}
var dendrogram03_open_btn = document.getElementById('dendrogram03_open_btn');
if (typeof dendrogram03_open_btn !== "undefined") {
  dendrogram03_open_btn.addEventListener('click', function () {
      create_viz('dendrogram03', pi_local.ts, true, cts_local);      
  });
}
var adiversity_open_btn = document.getElementById('adiversity_open_btn');
if (typeof adiversity_open_btn !== "undefined") {
  adiversity_open_btn.addEventListener('click', function () {
      create_viz('adiversity', pi_local.ts, true, cts_local);      
  });
}
//
// ALPHA DIVERSITY
//
var adiversity_link = document.getElementById('adiversity_link_id') || null;
var adiversity_btn = document.getElementById('adiversity_hide_btn');
var adiversity_div = document.getElementById('adiversity_div');

var pre_adiversity_div = document.getElementById('pre_adiversity_div');
if (adiversity_link !== null) {
  adiversity_link.addEventListener('click', function () {
      
    if(typeof adiversity_created == "undefined"){
        create_viz('adiversity', false);
        
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

// create fasta
var download_fasta_btn = document.getElementById('download_fasta_btn') || null;
if (download_fasta_btn !== null) {
  download_fasta_btn.addEventListener('click', function () {
      //alert(selected_distance_combo)
      form = document.getElementById('download_fasta_form_id');
      download_type = form.download_type.value; 
      ts =  '';       
      download_data('fasta',  download_type, ts);
  });
}


// create counts matrix
var download_matrix_btn = document.getElementById('download_matrix_btn') || null;
if (download_matrix_btn !== null) {
  download_matrix_btn.addEventListener('click', function () {
      
      form = document.getElementById('download_matrix_form_id');
      download_type = form.download_type.value;       
      ts =  form.ts.value;    
      download_data('matrix', download_type, ts);
  });
}



function create_freq_table_file(script, ts) {
    // for view_selection tables: frequency 
    download_data(script, 'partial_project', ts);
}
function transfer_file_for_download(script, ts) {
    download_data(script, '', ts);
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





function toggle_visual_element(table_div, tog, btn){
  if(tog == 'show') {
    table_div.style.display = 'none';
    btn.value = 'show';
    btn.innerHTML = 'Show Panel';
  }else{
    table_div.style.display = 'block';
    btn.value = 'hide';
    btn.innerHTML = 'Hide Panel';
  }
}


function create_viz(visual, new_window) {
   
    if(visual === 'counts_matrix'){
      create_counts_matrix(new_window);      
    }else if(visual === 'piecharts'){
      create_piecharts_group(new_window);
    }else if(visual === 'barcharts'){
      create_barcharts_group(new_window);
    }else if(visual === 'dheatmap'){
      create_dheatmap(new_window);
    }else if(visual === 'fheatmap'){
      create_fheatmap(new_window);
    }else if(visual === 'dendrogram01'){
      create_dendrogram('svg','phylogram', new_window);
    }else if(visual === 'dendrogram03'){
      create_dendrogram('svg','radial', new_window);
    }else if(visual === 'adiversity'){
      create_adiversity(new_window);
    }else{

    }
}
//
//
//
//
// TAX TABLE
//
function create_counts_matrix(new_window) {
            
      if(new_window){
            var htmlstring = document.getElementById('counts_matrix_div').innerHTML;
            function openindex()
                {
                      rando = Math.floor(Math.random() * 20);
                      OpenWindow=window.open("", "counts_matrix"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
                      OpenWindow.document.write(new_window_skeleton(htmlstring))
                      OpenWindow.document.close()
                      self.name="main"
                }
            openindex()
            return
      }
      tax_table_created = true;
      //var init = {"selected_distance":"horn","normalization":"none","min_range":"0","max_range":"100"}
      var info_line = create_header('ftable', pi_local);
      
      document.getElementById('counts_matrix_title').innerHTML = info_line;
      document.getElementById('pre_counts_matrix_div').style.display = 'block';
      document.getElementById('counts_matrix_title').style.color = 'white';
      document.getElementById('counts_matrix_title').style['font-size'] = 'small';
      
      var tax_counts_div = document.getElementById('counts_matrix_div');
      tax_counts_div.innerHTML = '';
      tax_counts_div.style.display = 'block';
      var html = '';
      if(mtx_local.taxonomy == 0){
        html += "<div class='pull-left'>OTU Count: "+mtx_local.shape[0]+"; No Taxonomy Available</div>";
      }else{
        html += "<div class='pull-left'>OTU Count: "+mtx_local.shape[0]+"; Taxonomy is in the far right hand column.</div>";
      }   
      html += "<br>"
      html += "<div style='height:500px;overflow:auto;'>"
      html += "<table id='counts_matrix_id' border='0' class='' >";
      html += "<tr><td></td><td>OTU</td>"
    let dataset_totals = {}
    //let dataset_filtered_totals = {}
    for (var n in mtx_local.columns){
          ds = mtx_local.columns[n].id
          dataset_totals[ds] = 0;
          //dataset_filtered_totals = 0;
          html += "<td>"+ds+"</td>"
    }
    if(mtx_local.taxonomy == 1){
          html += "<td>OTU Taxonomy</td>"
    }
    html += "</tr>"

    for (var n in mtx_local.rows){
        otu = mtx_local.rows[n].id
        html += "<tr>";
        html += '<td>'+(parseInt(n)+1)+'</td>';
        html += '<td>'+otu+'</td>';   
        for (var m in mtx_local.columns){
            ds = mtx_local.columns[m].id
            cnt = mtx_local.data[n][m]
            html += '<td>'+ cnt +'</td>'
            dataset_totals[ds] += parseInt(cnt)
        }
        if(mtx_local.taxonomy == 1){
            html += '<td>'+ mtx_local.rows[n].metadata.taxonomy +'</td>'
        }
        html += "</tr>"; 
    }
    html += "<tr><td></td><td>Totals:</td>"
    for (var n in mtx_local.columns) {
        ds = mtx_local.columns[n].id
        html += "<td>"+ dataset_totals[ds].toString() +"</td>"
    }
    html += "</tr>"
    html += "</table></div>";
    tax_counts_div.innerHTML = html;
    document.getElementById('counts_matrix_dnld_btn').disabled = false
      
    document.getElementById('pre_counts_matrix_div').style.display = 'block';
      
}

function graph_counts(new_id,taxonomy,counts){
  
  
  var bodyRect = document.body.getBoundingClientRect()
  var graphRect = document.getElementById('flot_graph_link'+new_id).getBoundingClientRect();
  topOffset   = graphRect.top  - bodyRect.top;
  leftOffset  = graphRect.left - bodyRect.left;
   
  if(typeof id !== 'undefined' && id == new_id){
    // same: hide graph
    chart_data = []
    if(document.getElementById('tax_counts_graph_div').style.display=='none'){
        document.getElementById('tax_counts_graph_div').style.display='block'
    }
  }else{
    // different: -- show graph
    
    $('#tax_counts_graph_div').css({
                'top':topOffset-200,
                'left':leftOffset, 
                'z-index':1000, 
                'width': '600px',
                'height': '400px', 
                "display":"block",   
                'position': 'absolute', 
                'border':'1px solid black', 
                'padding':'55px'
              });
  
    id = new_id
  }
  counts = JSON.parse(counts)
  //alert(typeof data)
  if(typeof chart_data == 'undefined'){
    chart_data = []
  }
  var myseries = []
  for(c in counts){
    myseries.push([parseInt(c)+1,counts[c]])
  }
  taxa = taxonomy.split(';')
  var deepest_tax = taxa[taxa.length-2]+' '+taxa[taxa.length-1]
  chart_data.push({data:myseries, label:deepest_tax, lines:{show:true}, points:{show:true}})
  //alert(data.length)
  var options = {
    
    legend:{position:'nw'},
    grid: {
        borderWidth: 1,
        labelMargin: 5,
        backgroundColor: {
            colors: ["#fff", "#e4f4f4"]
        },
        margin: {
            top: 40,
            bottom: 20,
            left: 5
        }
    },
    
    xaxis:{
          min: 1,
          //max: datasetcount,
          tickSize: 1,
          tickDecimals: 0,
          labelHeight: 30
      },
      yaxis:{
         min: 0,
         tickDecimals: 0
      }
  };
  
    $.plot($("#tax_counts_graph_div"), chart_data, options);
    var xaxisLabel = $("<div class='axisLabel xaxisLabel'></div>").text("Dataset").appendTo($('#tax_counts_graph_div'));
    var graph_title = $("<div class='graph_title'></div>").text("Sequence Counts").appendTo($('#tax_counts_graph_div'));
    var close_button = $("<input class='graph_close_btn axisLabel btn btn-xs btn-primary' type='button' value='Close' onclick='close_graph()'>").appendTo($('#tax_counts_graph_div'));
   
    graph_title.css("margin-top",  0);
  
}
function close_graph(){
    chart_data = []
    document.getElementById('tax_counts_graph_div').style.display = 'none'
}

function standardDeviation(values){
  var avg = average(values);
  
  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });
  
  var avgSquareDiff = average(squareDiffs);
  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function average(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}


//
//
//

//
//  CREATE DIST HEATMAP
//

//
//
//
function create_dheatmap(new_window) {      
      if(new_window){
        var htmlstring = document.getElementById('dheatmap_div').innerHTML;
        function openindex()
            {
              rando = Math.floor(Math.random() * 20);
              OpenWindow=window.open("", "heatmap"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
              OpenWindow.document.write(new_window_skeleton(htmlstring))
              OpenWindow.document.close()
              self.name="main"
            }

        openindex()
        return

      }
      var dhm_div = document.getElementById('dheatmap_div');
      dhm_div.innerHTML = '';
      dhm_div.style.display = 'block';
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      //var init = {"selected_distance":"morisita_horn","normalization":"none","min_range":"0","max_range":"100"}
      var info_line = create_header('dhm', pi_local);
      document.getElementById('dheatmap_title').innerHTML = info_line;
      document.getElementById('dheatmap_title').style.color = 'white';
      document.getElementById('dheatmap_title').style['font-size'] = 'small';
      var html = '';
      document.getElementById('pre_dheatmap_div').style.display = 'block';
       // get distance matrix via AJAX
      var xmlhttp = new XMLHttpRequest();  
      //xmlhttp.open("POST", '/visuals/heatmap', true);
      var args = {}
      args.image = 'dheatmap'
      args.source = 'website'
      args.type = 'otus'
      xmlhttp.open("POST", '/api/create_image', true);
      xmlhttp.setRequestHeader("Content-type","application/json");
      showDots='';
      var myWaitVar = setInterval(myWaitFunction,1000,dhm_div);
      xmlhttp.onreadystatechange = function() {        
        if (xmlhttp.readyState == 4 ) {
            clearInterval(myWaitVar);
            var data = JSON.parse(xmlhttp.response)
            dhm_div.innerHTML = data.html;
            document.getElementById('dheatmap_dnld_btn').disabled = false            
        }
      };
      xmlhttp.send(JSON.stringify(args));      
}
//
//  CREATE FREQUENCY HEATMAP
//
function create_fheatmap(new_window) {
      //alert('im HM')
      if(new_window){

          var htmlstring = document.getElementById('fheatmap_div').innerHTML;


          function openindex()
            {
              rando = Math.floor(Math.random() * 20);
              OpenWindow=window.open("", "fheatmap"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
              OpenWindow.document.write(new_window_skeleton(htmlstring))
              OpenWindow.document.close()
              self.name="main"
            }

          openindex()
          return


     }
      var fhm_div = document.getElementById('fheatmap_div');
      
      fhm_div.innerHTML = '';
      fhm_div.style.display = 'block';
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      var info_line = create_header('fhm', pi_local);
      document.getElementById('fheatmap_title').innerHTML = info_line;
      document.getElementById('fheatmap_title').style.color = 'white';
      document.getElementById('fheatmap_title').style['font-size'] = 'small';
      
      var args = {}
      args.image = 'fheatmap'
      args.source = 'website'
      document.getElementById('pre_fheatmap_div').style.display = 'block';
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/api/create_image', true);
      xmlhttp.setRequestHeader("Content-type","application/json");
      showDots='';
      var myWaitVar = setInterval(myWaitFunction,1000,fhm_div);
      xmlhttp.onreadystatechange = function() {        
        if (xmlhttp.readyState == 4 ) {
            clearInterval(myWaitVar);
            var data = JSON.parse(xmlhttp.response)
            fhm_div.innerHTML = data.html;
            document.getElementById('fheatmap_dnld_btn').disabled = false
        }
      };
      xmlhttp.send(JSON.stringify(args));   
      
}
//
//  CREATE PIECHARTS
//
function create_piecharts_group(new_window) {
    if(new_window){

          var htmlstring = document.getElementById('piecharts_div').innerHTML;


          function openindex()
            {
              rando = Math.floor(Math.random() * 20);
              OpenWindow=window.open("", "piecharts"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
              OpenWindow.document.write(new_window_skeleton(htmlstring))
              OpenWindow.document.close()
              self.name="main"
            }

          openindex()
          return
    }
    piecharts_created = true;
    //var init = {"selected_distance":"morisita_horn","normalization":"none","min_range":"0","max_range":"100"}
    var info_line = create_header('pies', pi_local);
    document.getElementById('piecharts_title').innerHTML = info_line;
    var piecharts_div = document.getElementById('piecharts_div');
    document.getElementById('piecharts_title').style.color = 'white';
    document.getElementById('piecharts_title').style['font-size'] = 'small';
    piecharts_div.innerHTML = '';
    piecharts_div.style.display = 'block';
    document.getElementById('pre_piecharts_div').style.display = 'block';
     
    // this fxn is in common_selection.js
    //create_piecharts('group', pi_local.ts, mtx_local);
    var xmlhttp = new XMLHttpRequest();

        var args = {}
        args.image = 'piecharts'
        args.source = 'website'
        args.type = 'otus'
        xmlhttp.open("POST", '/api/create_image', true); 
        //         alert(xmlhttp) 
        xmlhttp.setRequestHeader("Content-type","application/json");
        showDots='';
        var myWaitVar = setInterval(myWaitFunction,1000,piecharts_div);      
        xmlhttp.onreadystatechange = function(){
            if (xmlhttp.readyState == 4 ) {
                clearInterval(myWaitVar);
               data = JSON.parse(xmlhttp.response)
               
               //alert(data)          
               piecharts_div.innerHTML = data.html;
                document.getElementById('piecharts_dnld_btn').disabled = false          
            }
         }

        xmlhttp.send(JSON.stringify(args));
     return

}


//
//  CREATE BARCHARTS
//
function create_barcharts_group(new_window) {
      
    if(new_window){
        let htmlstring = document.getElementById('barcharts_div').innerHTML;
        function openindex() {
              rando = Math.floor(Math.random() * 20);
              OpenWindow=window.open("", "barcharts"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
              OpenWindow.document.write(new_window_skeleton(htmlstring))
              OpenWindow.document.close()
              self.name="main"
        }
        openindex()
        return;
    }
    barcharts_created = true;
    let info_line = create_header('bars', pi_local);
    document.getElementById('barcharts_title').innerHTML = info_line;
    let barcharts_div = document.getElementById('barcharts_div');
    document.getElementById('barcharts_title').style.color = 'white';
    document.getElementById('barcharts_title').style['font-size'] = 'small';
    barcharts_div.innerHTML = '';
    barcharts_div.style.display = 'block';
//    barcharts_div.style.display = 'block';
         
    document.getElementById('pre_barcharts_div').style.display = 'block';
     
    // this fxn is in common_selection.js
    //create_barcharts('group', pi_local.ts, mtx_local, {alpha_value:'z',count_value:"min"});
    let xmlhttp = new XMLHttpRequest();

    let args = {}
    args.image = 'barcharts'
    args.source = 'website'
    args.type = 'otus'
    xmlhttp.open("POST", '/api/create_image', true); 
    //         alert(xmlhttp) 
    xmlhttp.setRequestHeader("Content-type","application/json");
    showDots='';
    let myWaitVar = setInterval(myWaitFunction,1000,barcharts_div);
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 ) {
           clearInterval(myWaitVar);
           data = JSON.parse(xmlhttp.response)
            barcharts_div.innerHTML = data.html;
           document.getElementById('barcharts_dnld_btn').disabled = false
        }
     }
    xmlhttp.send(JSON.stringify(args));
    return
}

//
//
//
function create_dendrogram(image_type, script, new_window) {
      //alert('im DEND')
     if(new_window){
        if(script == 'phylogram'){
          var htmlstring = document.getElementById('dendrogram01_div').innerHTML;
        }else if(script == 'radial'){
          var htmlstring = document.getElementById('dendrogram03_div').innerHTML;
        }

        function openindex()
            {
                  rando = Math.floor(Math.random() * 20);
                  OpenWindow=window.open("", "dendrogram"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
                  OpenWindow.document.write(new_window_skeleton(htmlstring))
                  OpenWindow.document.close()
                  self.name="main"
            }

        openindex()
        return

    }
      var info_line = create_header('dendrogram', pi_local);
      var dend_div;
      if(script == 'phylogram'){  // svg
        //dendrogram1_created = true;
        var dend_div = document.getElementById('dendrogram01_div');        
        document.getElementById('pre_dendrogram01_div').style.display = 'block';        
        dend_div.style.display = 'block';
        document.getElementById('dendrogram01_title').innerHTML = info_line;
        document.getElementById('dendrogram01_title').style.color = 'white';
        document.getElementById('dendrogram01_title').style['font-size'] = 'small';
      
      }else if(script == 'radial'){  // svg
        //dendrogram3_created = true;
        var dend_div = document.getElementById('dendrogram03_div');        
        document.getElementById('pre_dendrogram03_div').style.display = 'block';        
        dend_div.style.display = 'block';
        document.getElementById('dendrogram03_title').innerHTML = info_line;
        document.getElementById('dendrogram03_title').style.color = 'white';
        document.getElementById('dendrogram03_title').style['font-size'] = 'small';
      }else{
        return;
      }
      dend_div.innerHTML = '';
      
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      
      
      
      var html = '';
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+pi_local.ts;
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
          //htmlstring ="('ICM_LCY_Bv6--LCY_0007_2003_05_04':0.090874090613,('ICM_LCY_Bv6--LCY_0001_2003_05_11':0.00863121477239,('ICM_LCY_Bv6--LCY_0005_2003_05_16':0.00382350678165,'ICM_LCY_Bv6--LCY_0003_2003_05_04':0.00382350678165)))"
          var newick = Newick.parse(htmlstring);
         
          //alert(JSON.stringify(newick, null, 4))
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
          var w = 1100;
          var h = 900;
          if(ds_local.ids.length > 50){
            h = 1200;
          }
          if(script == 'phylogram'){
              document.getElementById('dendrogram01_div').innerHTML = '';
              document.getElementById('dendrogram01_dnld_btn').disabled = false
              d3.phylogram.build('#dendrogram01_div', newick, {
                width: w,
                height: h,
                skipBranchLengthScaling: true  //Make a dendrogram instead of a phylogram. (right justified tree)
              });
              
          }else if(script == 'radial') {
              
              document.getElementById('dendrogram03_div').innerHTML = '';
              document.getElementById('dendrogram03_dnld_btn').disabled = false
              d3.phylogram.buildRadial('#dendrogram03_div', newick, {
                width: w,
                height: h
              });
              
              
          }

         
          

        }  // end if xmlhttp.readyState


      };
      xmlhttp.send(args);
 
}

function create_adiversity(new_window){
    if(new_window){

          var htmlstring = document.getElementById('adiversity_div').innerHTML;

          function openindex()
            {
              rando = Math.floor(Math.random() * 20);
              OpenWindow=window.open("", "adiversity"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
              OpenWindow.document.write(new_window_skeleton(htmlstring))
              OpenWindow.document.close()
              self.name="main"
            }

          openindex()
          return


    }
    adiversity_created = true;
    var info_line = create_header('adiversity', pi_local);
    document.getElementById('adiversity_title').innerHTML = info_line;
    document.getElementById('adiversity_title').style.color = 'white';
    document.getElementById('adiversity_title').style['font-size'] = 'small';
    document.getElementById('pre_adiversity_div').style.display = 'block';
    document.getElementById('adiversity_div').style.display = 'block';
    document.getElementById('adiversity_div').innerHTML = '....';

      adiversity_created = true;
      var adiversity_div = document.getElementById('adiversity_div');
      adiversity_div.innerHTML = '';
      adiversity_div.style.display = 'block';
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      var info_line = create_header('adiversity', pi_local);
      document.getElementById('adiversity_title').innerHTML = info_line;
      
      var html = '';
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+pi_local.ts;
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
           document.getElementById('adiversity_dnld_btn').disabled = false
        }
      };
      xmlhttp.send(args);      
         

}

//
//
//



//
//  Interval timer  
//
function myWaitFunction(div) {
    if(showDots === '..........'){ showDots = ''; }
    showDots = showDots || '.';
    div.innerHTML = showDots;
    showDots += '.';
}
//
//
//

function create_header(viz, pi) {
  
  var txt;
  //viz_possibles = ['bars','pies','geo','dhm','fhm','dendrogram','pcoa','ftable','mtable'];
  
    if(viz == 'bars'){
      txt = 'Barcharts --> ';
    }else if(viz == 'pies'){
      txt = 'Piecharts --> ';
    }else if(viz == 'dhm'){
      txt = 'Distance Heatmap --> ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'ftable'){
      txt = 'Frequency Table --> ';
    }else if(viz == 'fhm'){
      txt = 'Frequency Heatmap --> ';
    }else if(viz == 'dendrogram'){
      txt = 'Dendrogram --> ';
    }else if(viz == 'adiversity'){
      txt = 'Alpha Diversity--> ';
    }else{
      txt = 'ERROR in fxn create_headers '+viz;
    }
  txt += ' Normalization: ' + pi.normalization+'; ';
  txt += ' Counts Min/Max: ' + pi.min_range+'% -- '+pi.max_range+'%';
     
  return txt;
}

function new_window_skeleton(html){

  txt = '<html lang="en">'+"\n"
  txt += "<HEAD>"+"\n"
  txt +="<title>VAMPS: Visuals Select</title>"+"\n"
  txt +='<link rel="stylesheet" type="text/css" href="/stylesheets/style.css">'+"\n"
  txt +='<link rel="stylesheet" type="text/css" href="/stylesheets/visualization.css">'+"\n"
  txt +='<link rel="stylesheet" href="/stylesheets/bootstrap.min.css" >'+"\n"
  txt +='<link rel="stylesheet" href="/stylesheets/bootstrap-theme.min.css">'+"\n"
  txt +='<link href="/stylesheets/bootstrap-responsive.css" rel="stylesheet" \>'+"\n"
  txt +="</HEAD>"+"\n"
  txt +="<BODY>"+"\n"
  txt +="<div style='border:1px solid grey;padding:5px;background:lightgreen;'>"
  txt +="<table border='0'>"
  var n = 0;
  var cols = 2;
  for(item in pi_local){
    if(item !== 'metadata' && item !== 'ts'){
      txt += "<td align='right' style='padding-left:3px;'>"+item+":</td><td>&nbsp;"+pi_local[item]+"</td>"
      if( n % cols === (cols - 1) ) {
          txt += "</tr><tr>"
      }
      n += 1;
    }
  }
  txt +="</table>" +"\n";
  txt +="</div>" +"\n";
  txt +=html+"\n"
  txt +="<div id='counts_tooltip_div' class=''></div>" +"\n";
  txt +="<div id='piebarcharts_tooltip_div' class=''></div>" +"\n";
  txt +="<script type='text/javascript' src='/javascripts/jquery-2.1.1.min.js'></script>" +"\n";
  txt +="<script type='text/javascript' src='/javascripts/jquery-ui.min.js'></script>"+"\n"
  txt +="<script type='text/javascript' src='/javascripts/bootstrap.min.js'></script>"+"\n"
  txt +='<script type="text/javascript" src="/javascripts/tablesort.min.js"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/jquery.scrollTo.min.js"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/jquery.tablednd.js"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/d3.min.js" charset="utf-8"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/d3pie.min.js" charset="utf-8"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/d3.phylogram.js" charset="utf-8"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/d3.phylonator.js" charset="utf-8"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/newick.js" charset="utf-8"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/drag_rows.js"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/global.js"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/common_selection.js"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/view_selection.js"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/bootstrap-select.js"></script>'+"\n"
  txt +='<script type="text/javascript" src="/javascripts/jquery.flot.min.js"></script>'+"\n"
  txt +="</BODY>"+"\n"
  txt +="</HTML>"+"\n"
  // code for tooltips
  txt +="<script>"
  txt +="var $liveTip = $('<div id='livetip_chart'></div>').hide().appendTo('body'),$win = $(window),showTip;"+"\n"
  txt +="var tip = {title: '', offset: 12,delay: 50,position: function(event) {var positions = {x: event.pageX, y: event.pageY};var dimensions = {x: [$win.width(),$liveTip.outerWidth()], y: [$win.scrollTop() + $win.height(),$liveTip.outerHeight()]};for ( var axis in dimensions ) {if (dimensions[axis][0] <dimensions[axis][1] + positions[axis] + this.offset) {positions[axis] -= dimensions[axis][1] + this.offset;} else {positions[axis] += this.offset;}}$liveTip.css({top: positions.y,left: positions.x});}};"+"\n"
  txt +="$('body').delegate('.tooltip_viz', 'mouseover mouseout mousemove', function (event) {var link = this,html = '';$link = $(this);if (event.type == 'mouseover') {tip.id = link.id;link.id = '';id_items = tip.id.split('/');html = '<table><tr>';if(id_items[0] == 'dheatmap') {html += '<td>'+id_items[1]+'</td>';html += '</tr><tr>';html += '<td>'+id_items[2]+'</td>';html += '</tr><tr>';html += '<td>Distance: '+id_items[3]+'</td>';}else if(id_items[0] == 'frequencies'){html += '<td>'+id_items[1]+'</td>';html += '</tr><tr>';html += '<td>'+id_items[2]+'</td>';html += '</tr><tr>';html += '<td>Count: '+id_items[3]+' ('+id_items[4]+'%)</td>';}else{ html += '<td>'+id_items[1]+'</td>';    html += '</tr><tr>';html += '<td>Count: '+id_items[2]+' ('+id_items[3]+'%)</td>';}html += '</tr><table>';showTip = setTimeout(function() {$link.data('tipActive', true);tip.position(event);$liveTip.html('<div>' + html  + '</div>').fadeOut(0).fadeIn(200);}, tip.delay);}if (event.type == 'mouseout') {link.id = tip.id || link.id;if ($link.data('tipActive')) {$link.removeData('tipActive');$liveTip.hide();} else {clearTimeout(showTip); }}if (event.type == 'mousemove' && $link.data('tipActive')) { tip.position(event);}});"+"\n"
  txt +="</script>"
  return txt
}
//
//
//


