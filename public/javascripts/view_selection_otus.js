


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
          html += "<td>Distance: "+id_items[3]+":"+id_items[4]+"</td>";
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
        
            create_viz('counts_matrix');
            
        }else{
            if(tax_counts_btn.value == 'hide'){
              //toggle_visual_element(tax_counts_div,'show',tax_counts_btn);
            }else{
              toggle_visual_element(tax_counts_div,'hide',tax_counts_btn);
            }
        }
    		
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
        create_viz('barcharts');
        
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
        create_viz('dheatmap');
        
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


function create_viz(visual) {
   
    if(visual === 'counts_matrix'){
      create_counts_matrix();      
    }else if(visual === 'piecharts'){
      create_piecharts_group();
    }else if(visual === 'barcharts'){
      create_barcharts_group();
    }else if(visual === 'dheatmap'){
      create_dheatmap();
    }else{

    }
}
//
//
//
//
// TAX TABLE
//
function create_counts_matrix() {
            
      
      tax_table_created = true;
      var init = {"selected_distance":"horn","normalization":"none","min_range":"0","max_range":"100"}
      var info_line = create_header('ftable', init);
      

      document.getElementById('counts_matrix_title').innerHTML = info_line;
      
      document.getElementById('pre_counts_matrix_div').style.display = 'block';
      document.getElementById('counts_matrix_title').style.color = 'white';
      document.getElementById('counts_matrix_title').style['font-size'] = 'small';
      
      var tax_counts_div = document.getElementById('counts_matrix_div');
      tax_counts_div.innerHTML = '';
      tax_counts_div.style.display = 'block';
      var html = '';
         
      html += "<br><table id='counts_matrix_id' border='0' class='' >";
      html += "<tr><td>OTU</td>"
      for (var ds in ds_ord){
          html += "<td>"+ds+"</td>"  
      }
      html += "</tr>"
      for (var otu in otu_tax){
        html += "<tr>";
        html += '<td>'+otu+'</td>';   
        for (var ds in ds_ord){
            html += '<td>'+mtx_local[otu][ds] +'</td>'
        }
        html += "</tr>"; 
      }
      html += "</table>";
      tax_counts_div.innerHTML = html; 
      document.getElementById('counts_matrix_dnld_btn').disabled = false
      
      
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
function create_dheatmap() {
      //alert('im HM')
      
      dheatmap_created = true;
      var dhm_div = document.getElementById('dheatmap_div');
      dhm_div.innerHTML = '';
      dhm_div.style.display = 'block';
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      var init = {"selected_distance":"horn","normalization":"none","min_range":"0","max_range":"100"}
      var info_line = create_header('dhm', init);
      document.getElementById('dheatmap_title').innerHTML = info_line;
      document.getElementById('dheatmap_title').style.color = 'white';
      document.getElementById('dheatmap_title').style['font-size'] = 'small';
      var html = '';
      var args =  "metric="+init.selected_distance;
      args += "&ts=";
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
            document.getElementById('dheatmap_dnld_btn').disabled = false
            

        }
      };
      xmlhttp.send(args);      
}

//
//  CREATE PIECHARTS
//
function create_piecharts_group() {
    
    piecharts_created = true;
    var init = {"selected_distance":"horn","normalization":"none","min_range":"0","max_range":"100"}
    var info_line = create_header('pies', init);
    
    document.getElementById('piecharts_title').innerHTML = info_line;
    var piecharts_div = document.getElementById('piecharts_div');
    document.getElementById('piecharts_title').style.color = 'white';
    document.getElementById('piecharts_title').style['font-size'] = 'small';
    piecharts_div.innerHTML = '';
    piecharts_div.style.display = 'block';
    
    document.getElementById('pre_piecharts_div').style.display = 'block';
     
    // this fxn is in common_selection.js
    create_piecharts('group', ts, mtx_local);
    
    document.getElementById('piecharts_dnld_btn').disabled = false

}


//
//  CREATE BARCHARTS
//
function create_barcharts_group() {
      
    
    barcharts_created = true;
    var init = {"selected_distance":"horn","normalization":"none","min_range":"0","max_range":"100"}
    var info_line = create_header('bars', init);
    document.getElementById('barcharts_title').innerHTML = info_line;
    document.getElementById('barcharts_title').style.color = 'white';
    document.getElementById('barcharts_title').style['font-size'] = 'small';
    document.getElementById('barcharts_div').innerHTML = '';
//    barcharts_div.style.display = 'block';
         
    document.getElementById('pre_barcharts_div').style.display = 'block';
     
         // this fxn is in common_selection.js
    create_barcharts('group', ts, mtx_local, {alpha_value:'z',count_value:"min"});
    document.getElementById('barcharts_dnld_btn').disabled = false

}
//
//
//
function heatmap_click_fxn(did1,ds1,did2,ds2){
      //alert(did1)
      var args =  "did1="+did1;
      args += "&ds1="+ds1;
      args += "&did2="+did2;
      args += "&ds2="+ds2;
      //args += "&ts="+ts;
      //document.getElementById('pre_adiversity_div').style.display = 'block';
       // get distance matrix via AJAX
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/visuals/bar_double', true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      //showDots='';
      //var myWaitVar = setInterval(myWaitFunction,1000,adiversity_div);
      xmlhttp.onreadystatechange = function() {        
        if (xmlhttp.readyState == 4 ) {

          
           //clearInterval(myWaitVar);
            var retstring = xmlhttp.responseText;           
        alert(retstring)
        window.open(retstring,"_blank")
        
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
  //viz_possibles = ['bars','pies','geo','dhm','fhm','dend-svg','dend-pdf','pcoa','ftable','mtable'];
  
    if(viz == 'bars'){
      txt = 'Barcharts --> ';
    }else if(viz == 'pies'){
      txt = 'Piecharts --> ';
    }else if(viz == 'dhm'){
      txt = 'Distance Heatmap --> ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'ftable'){
      txt = 'Frequency Table --> ';
    }else{
      txt = 'ERROR in fxn create_headers '+viz;
    }
  txt += ' Normalization: ' + pi.normalization+'; ';
  txt += ' Counts Min/Max: ' + pi.min_range+'% -- '+pi.max_range+'%';
     
  return txt;
}





