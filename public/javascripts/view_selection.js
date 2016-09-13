

$(document).ready(function(){

    $('.selectpicker').selectpicker({showSubtext:true, tickIcon: '',});

    $("#metadata_table_div").on("click", "#metadata_table", function () {
        new Tablesort(document.getElementById('metadata_table'));
    });
    // capture entire page click -- to cancel(hide) charts
    //document.body.addEventListener('click', hide_chart(e), true);
    //$(window).click(function(e){
    //  e_page_click = window.event
     // page_click(e_page_click)
    //});
    //click_on_graph_icon = false;
});

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

// Save Confiuration
save_config = document.getElementById('save_config_id') || null;
if (save_config !== null) {
  save_config.addEventListener('click', function () {
      save_configuration(ds_local,user_local);
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

// create metadata
var download_metadata_btn = document.getElementById('download_metadata_btn') || null;
if (download_metadata_btn !== null) {
  download_metadata_btn.addEventListener('click', function () {
      //alert(selected_distance_combo)
      form = document.getElementById('download_metadata_form_id');
      download_type = form.download_type.value;  
      ts =  '';      
      download_data('metadata', download_type, ts);
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
////////////////////////////////////////////////////////////////////////////////
// var visuals = ['counts_table','metadata_table','dheatmap','barcharts','piecharts','fheatmap',
//                 'dendrogram01','dendrogram03','pcoa','pcoa3d','geodistribution','adiversity','phyloseq_bars01',
//                 'phyloseq_hm02','phyloseq_nw03','phyloseq_ord04','phyloseq_tree05'] //    'dbrowser',
// alert(document.getElementById('counts_table_link_id').innerHTML)
// for(n in visuals){
//       //alert(visuals[n])
//       var prefix   = visuals[n] 
         
//       var p_prediv    = 'pre_'+prefix+'_div' 
//       var p_link      = prefix+'_link_id'
//       var p_div       = prefix+'_div'        
//       var p_title     = prefix+'_title'     
//       var p_hide_btn  = prefix+'_hide_btn'  
//       var p_open_btn  = prefix+'_open_btn' 
//       var p_created   = prefix+'_created'

//       var link = document.getElementById(p_link) || null;
      
//       var hide_btn = document.getElementById(p_hide_btn);
//       //alert(hide_btn)
//       var div = document.getElementById(p_div);
//       var prediv = document.getElementById(p_prediv);
//       if (link !== null) {
//           link.addEventListener('click', function () {
          
//         if(typeof p_created == "undefined"){
//               create_viz(prefix, pi_local.ts, false);
//           //counts_table_download_btn.disabled = false;
//           }else{
//               if(hide_btn.value == 'hide'){
//                 //toggle_visual_element(tax_counts_div,'show',tax_counts_btn);
//               }else{
//                 toggle_visual_element(div,'hide',hide_btn);
//               }
//           }
//         $(prediv).scrollView();
//         });
//       }
//       if (typeof hide_btn !== "undefined") {
//         hide_btn.addEventListener('click', function () {
//             if(hide_btn.value == 'hide'){
//               toggle_visual_element(div,'show',hide_btn);
//             }else{
//               toggle_visual_element(div,'hide',hide_btn);
//             }
//         });
//       }
      
//       var open_btn = document.getElementById(p_open_btn) || null;
//       if (open_btn !== null) {
//         open_btn.addEventListener('click', function () {
//             create_viz(prefix, pi_local.ts, true);      
//         });
//       }

// }





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


function create_viz(visual, ts, new_window) {
   
    if(visual === 'counts_table'){
      create_counts_table(new_window);      
    }else if(visual === 'metadata_table'){
      create_metadata_table(new_window);
    }else if(visual === 'piecharts'){
      create_piecharts(ts, new_window);
    }else if(visual === 'barcharts'){
      create_barcharts_group(ts, new_window);
    }else if(visual === 'dheatmap'){
      create_dheatmap(ts, new_window);
    }else if(visual === 'dendrogram01'){
      create_dendrogram(ts,'svg','phylogram', new_window);
    //}
    //else if(visual === 'dendrogram2'){
    //  create_dendrogram(ts,'svg','phylonator', new_window);
    }else if(visual === 'dendrogram03'){
      create_dendrogram(ts,'svg','radial', new_window);
    }else if(visual === 'pcoa'){
      create_pcoa(ts,'2d', new_window);
    }else if(visual === 'pcoa3d'){
      create_pcoa(ts,'3d');
    }else if(visual === 'fheatmap'){
      create_fheatmap(ts, new_window);
    }else if(visual === 'geospatial'){
      create_geospatial(new_window);
    }else if(visual === 'dbrowser'){
      //create_dbrowser(ts);
    }else if(visual === 'adiversity'){
      create_adiversity(ts, new_window);
    }else if(visual === 'phyloseq01'){
      create_phyloseq(ts,'bar', new_window);
    }else if(visual === 'phyloseq02'){
      create_phyloseq(ts,'heatmap', new_window);
    }else if(visual === 'phyloseq03'){
      create_phyloseq(ts,'network', new_window);
    }else if(visual === 'phyloseq04'){
      create_phyloseq(ts,'ord', new_window);
    }else if(visual === 'phyloseq05'){
      create_phyloseq(ts,'tree', new_window);
    }else if(visual === 'cytoscape'){
      create_cytoscape(ts);
    }else if(visual === 'oligotyping'){
      create_oligotyping(ts);
    }else{

    }
}
function create_cytoscape(ts){
  //alert(ts)
  var cydiv = document.getElementById('cytoscape_div');

  // cytoscape_created = true;
      
      
  //     //cydiv.innerHTML = '';
    

  var cy = cytoscape({
    container: cydiv,
    elements: [
    { data: { id: 'a' } },
    { data: { id: 'b' } },
    {
      data: {
        id: 'ab',
        source: 'a',
        target: 'b'
      }
    }]
  });
  for (var i = 0; i < 10; i++) {
      cy.add({
          data: { id: 'node' + i }
          }
      );
      var source = 'node' + i;
      cy.add({
          data: {
              id: 'edge' + i,
              source: source,
              target: (i % 2 == 0 ? 'a' : 'b')
          }
      });
  }



cydiv.style.border = '1px solid red'
cydiv.style.height = '200px'
cydiv.style.width = '100%'
cydiv.style.display = 'inline-block';
//cydiv.style.width = '100%';

document.getElementById('pre_cytoscape_div').style.display = 'block';

}
//
// TAX TABLE
//
function create_counts_table(new_window) {
      
      if(new_window == true){
        var htmlstring = document.getElementById('counts_table_div').innerHTML;
        function openindex()
            {
                  rando = Math.floor(Math.random() * 20);
                  OpenWindow=window.open("", "counts_table"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
                  OpenWindow.document.write(new_window_skeleton(htmlstring))
                  OpenWindow.document.close()
                  self.name="main"
            }
        openindex()
        return
      }
      tax_table_created = true;
      var info_line = create_header('ftable', pi_local);
      

      document.getElementById('counts_table_title').innerHTML = info_line;
      
      document.getElementById('pre_counts_table_div').style.display = 'block';
      document.getElementById('counts_table_title').style.color = 'white';
      document.getElementById('counts_table_title').style['font-size'] = 'small';
      
      var tax_counts_div = document.getElementById('counts_table_div');
      tax_counts_div.innerHTML = '';
      tax_counts_div.style.display = 'block';
      var html = '';
         
      // need the max ranks
      maxrank = 0;
      for (var i in mtx_local.rows){
        taxitems = mtx_local.rows[i].id.split(';');
        if(maxrank < taxitems.length){
          maxrank = taxitems.length;
        }
      }
      html += "<div id='tax_counts_graph_div' style='background-color:white;width:600px;height:400px;display:none;'></div>";
      html += "<br><br><br><br><br><table id='counts_table_id' border='0' class='' >";
      html += "<tr><td class='no_border'></td>"
      for (t = 0; t < maxrank; t++) {
        if(t==2){
          html += "<th class='' valign='bottom'><small>Class</small></th>";
        }else{
          html += "<th class='' valign='bottom'><small>"+cts_local.RANKS[t].toUpperCase().charAt(0)+cts_local.RANKS[t].slice(1)+"</small></th>";
        }
      }
      html += "<th class='right_justify' valign='bottom'><small>Graph</small></th>";
      for (var n in mtx_local.columns) {
        //html += "<th class='verticalTableHeader' >"+mtx_local.columns[n].id +"</th>";
        html += "<th class='rotate'><div><span><a href='bar_single?id="+mtx_local.columns[n].id+"' target='_blank'>"+(parseInt(n)+1).toString()+') '
        html += mtx_local.columns[n].id+"</a></span></div></th>";
      
      }

      
      html += "<th class='right_justify' valign='bottom'><small>Total</small></th>";
      html += "<th class='right_justify' valign='bottom'><small>Average</small></th>";
      html += "<th class='right_justify' valign='bottom'><small>Min</small></th>";
      html += "<th class='right_justify' valign='bottom'><small>Max</small></th>";
      html += "<th class='right_justify' valign='bottom'><small>Std Dev</small></th>";

      html += "</tr>";
      
      for (var i in mtx_local.rows){
        count = parseInt(i)+1;
        taxitems = mtx_local.rows[i].id.split(';');

        html += "<tr class='chart_row'><td>"+count.toString()+"</td>";
        
        for (t = 0; t < maxrank; t++) {
          if(taxitems.length > t){
            html += "<td class='left_justify'>"+taxitems[t] +"</td>";
          }else{
            html += "<td class='left_justify'>--</td>";
          }
        }
        counts_string=JSON.stringify(mtx_local.data[i])
        html += "<td title='Graph' align='center' style='cursor:pointer;'>"
        graph_link_id = 'flot_graph_link'+i.toString()
        html += "<img width='25' id='"+graph_link_id+"' src='/images/visuals/graph.png' onclick=\"graph_counts('"+i.toString()+"','"+mtx_local.rows[i].id+"','"+counts_string+"')\">"
        html += "</td>";


        var tot   = 0;
        var avg   = 0;
        var min   = mtx_local.data[i][0];
        var max   = 0;
        var sd    = 0;
        for (var da in mtx_local.data[i]) {
          var cnt = mtx_local.data[i][da];
          var ds_num = (parseInt(da)+1).toString()
          var pct =  (cnt * 100 / mtx_local.column_totals[da]).toFixed(2);
          var id  = 'frequencies-|-'+mtx_local.rows[i].id+'-|-'+ds_num+') '+mtx_local.columns[da].id+'-|-'+cnt.toString()+'-|-'+pct.toString();
          html += "<td id='"+id+"' class='tooltip_viz right_justify tax_data'>"+cnt.toString()+'</td>';
          tot += cnt;
          if(cnt > max){
            max = cnt
          }
          if(cnt < min){
            min = cnt
          }
          
        }
        
        
        
        
        avg = (tot/(mtx_local.columns).length).toFixed(2)
        sd = standardDeviation(mtx_local.data[i]).toFixed(2)
        html += "<td title='Total' class='right_justify tax_result'><small>"+tot.toString()+'</small></td>';
        html += "<td title='Average' class='right_justify tax_result'><small>"+avg.toString()+"</small></td>";
        html += "<td title='Min' class='right_justify tax_result'><small>"+min.toString()+"</small></td>";
        html += "<td title='Max' class='right_justify tax_result'><small>"+max.toString()+"</small></td>";
        html += "<td title='Std Deviation' class='right_justify tax_result'><small>"+sd.toString()+"</small></td>";
        html += "</tr>";
      }
      // TOTALS
      html += "<tr><td></td>";
      for (t = 0; t < maxrank; t++) {
        html += "<td></td>";
      }
      html += "<td class='right_justify'><strong>Sums:</strong></td>";
      for (var m in mtx_local.column_totals){
        var total;
        if(pi_local.normalization == 'frequency'){
          total = mtx_local.column_totals[m].toFixed(6);
        }else{
          total = mtx_local.column_totals[m];
        }
        html += "<td title='Column Sum' class='right_justify'>" + total + "</td>";
      }
      html += "</tr>";
      html += "</table>";
      
      //document.getElementById('counts_tooltip_div').innerHTML = tooltip_tbl;
      tax_counts_div.innerHTML = html; 
      document.getElementById('counts_table_dnld_btn').disabled = false
      //$(".verticalTableHeader").each(function(){$(this).height($(this).width())  
      
}

function graph_counts(new_id,taxonomy,counts){
  
  var e = window.event;
  
  if(typeof id !== 'undefined' && id == new_id){
    // same: hide graph
    chart_data = []
    if(document.getElementById('tax_counts_graph_div').style.display=='none'){
        document.getElementById('tax_counts_graph_div').style.display='block'
    }
  }else{
    // different: -- show graph
    $('#tax_counts_graph_div').css({'top':e.pageY-200,'left':e.pageX, 'position':'absolute', 'border':'1px solid black', 'padding':'55px'});
    document.getElementById('tax_counts_graph_div').style.display='block'
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
//  CREATE METADATA TABLE
//
function create_metadata_table(new_window) {
     
    if(new_window){
        var htmlstring = document.getElementById('metadata_table_div').innerHTML;
        function openindex()
            {
                  rando = Math.floor(Math.random() * 20);
                  OpenWindow=window.open("", "metadata_table"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
                  OpenWindow.document.write(new_window_skeleton(htmlstring))
                  OpenWindow.document.close()
                  self.name="main"
            }
        openindex()
        return
    }
    metadata_table_created = true;
    var info_line = create_header('mtable', pi_local);
    document.getElementById('metadata_table_title').innerHTML = info_line;
    document.getElementById('metadata_table_title').style.color = 'white';
    document.getElementById('metadata_table_title').style['font-size'] = 'small';
    var metadata_div = document.getElementById('metadata_table_div');
    
    metadata_div.innerHTML = '';
    metadata_div.style.display = 'block';
    document.getElementById('pre_metadata_table_div').style.display = 'block';
    var html = '';
      //html += "<table border='1' id='metadata_table' class='single_border small_font md_table' >";
    html += "<table border='1' id='metadata_table' class='table table-condensed' >";
    html += "<thead><tr><th>Dataset (click to sort)</th><th>Name (click to sort)</th><th>Value (click to sort)</th></tr></thead><tbody>";
      
    for (var ds in md_local) {

          for (var md_item in md_local[ds]) {
            html += "<tr>";
            html += "<td>"+ds+"</td>";
            md_val = md_local[ds][md_item];
            if(md_val == '' || md_val == undefined){
              md_val = 'undefined';
            }
            html += "<td>"+md_item+"</td><td>"+md_val+"</td>";
            html += "</tr>";
          }        
    }
    html += "</tbody></table>";

      //alert(md_local[0].env_matter)
    metadata_div.innerHTML = html;
    document.getElementById('metadata_table_dnld_btn').disabled = false
}

//
//  CREATE Dendrogram
//

function create_dendrogram(ts, image_type, script, new_window) {
      //alert('im DEND')
    if(new_window){
        if(image_type == 'pdf'){
          //var htmlstring = document.getElementById('dendrogram_pdf_div').innerHTML;
        }else if(script == 'phylogram'){
          var htmlstring = document.getElementById('dendrogram01_div').innerHTML;
        //}else if(script == 'phylonator'){  
        //  var htmlstring = document.getElementById('dendrogram2_div').innerHTML;
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
      var info_line = create_header('dend', pi_local);
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
                height: h
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


//
//  CREATE PCoA -- both 2d and 3d
//
function create_pcoa(ts,image_type, new_window) {
      //alert('JS PCoA: '+image_type)
    if(new_window){
        if(image_type === '2d'){
          var htmlstring = document.getElementById('pcoa_div').innerHTML;
        
        
          function openindex()
            {
                  rando = Math.floor(Math.random() * 20);
                  OpenWindow=window.open("", "pcoa"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
                  OpenWindow.document.write(new_window_skeleton(htmlstring))
                  OpenWindow.document.close()
                  self.name="main"
            }

          openindex()
          return
        }

    }
    var address, info_line, pcoa_div;
    var args =  "metric="+pi_local.selected_distance;
    args += "&ts="+ts;
    args += "&image_type="+image_type;
    if(image_type === '2d'){
        //pcoa_created = true;
        pcoa_div = document.getElementById('pcoa_div');        
        info_line = create_header('pcoa', pi_local);        
        pcoa_div.style.display = 'block';
        md1 = document.getElementById('pcoa_md1').value;
        md2 = document.getElementById('pcoa_md2').value;
        document.getElementById('pcoa_title').innerHTML = info_line;
        document.getElementById('pcoa_title').style.color = 'white';
        document.getElementById('pcoa_title').style['font-size'] = 'small';
        document.getElementById('pre_pcoa_div').style.display = 'block';
        address = '/visuals/pcoa';
        args += "&md1="+md1+"&md2="+md2;
    }else if(image_type === '3d'){
        //alert('3d')
        pcoa_created = true;
        pcoa_div = document.getElementById('pcoa3d_div');        
        info_line = create_header('pcoa3d', pi_local);        
        pcoa_div.style.display = 'block';
        document.getElementById('pcoa3d_title').innerHTML = info_line;
        document.getElementById('pcoa3d_title').style.color = 'white';
        document.getElementById('pcoa3d_title').style['font-size'] = 'small';
        document.getElementById('pre_pcoa3d_div').style.display = 'block';
        address = '/visuals/pcoa3d';
    }else{
        // ERROR
    }
      
      pcoa_div.innerHTML = '';
      
      
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
            if(image_type === '2d'){
              document.getElementById('pcoa_dnld_btn').disabled = false
            }else{
              document.getElementById('pcoa3d_dnld_btn').disabled = false     
            }
        }
      };
      xmlhttp.send(args);
      
}
//
//  CREATE DBROWSER
//
// function create_dbrowser(ts) {
     
//          dbrowser_created = true;
//          var info_line = create_header('dbrowser', pi_local);
//          var dbrowser_div = document.getElementById('dbrowser_div');
//          document.getElementById('dbrowser_title').innerHTML = info_line;
//          document.getElementById('dbrowser_title').style.color = 'white';
//         document.getElementById('dbrowser_title').style['font-size'] = 'small';
//          dbrowser_div.style.display = 'block';
         
//          document.getElementById('pre_dbrowser_div').style.display = 'block';
//          var args =  "ts="+ts;
//          var xmlhttp = new XMLHttpRequest();  
//          xmlhttp.open("POST", '/visuals/dbrowser', true);
//          xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
//          showDots='';
//          var myWaitVar = setInterval(myWaitFunction,1000,dbrowser_div);
//          xmlhttp.onreadystatechange = function() {          
//            if (xmlhttp.readyState == 4 ) {
//               clearInterval(myWaitVar);
//               var response = xmlhttp.responseText;              
//               dbrowser_div.innerHTML = response;            
//            }
//          };
//          xmlhttp.send(args);
// }
function create_oligotyping(ts) {
     
        oligotyping_created = true;
        var info_line = create_header('oligotyping', pi_local);
        var oligotyping_div = document.getElementById('oligotyping_div');
        document.getElementById('oligotyping_title').innerHTML = info_line;
        document.getElementById('oligotyping_title').style.color = 'white';
        document.getElementById('oligotyping_title').style['font-size'] = 'small';
        oligotyping_div.style.display = 'block';
         
        document.getElementById('pre_oligotyping_div').style.display = 'block';
        var args =  "ts="+ts;
        var xmlhttp = new XMLHttpRequest();  
        xmlhttp.open("POST", '/visuals/oligotyping', true);
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        showDots='';
        var myWaitVar = setInterval(myWaitFunction,1000,oligotyping_div);
        xmlhttp.onreadystatechange = function() {          
           if (xmlhttp.readyState == 4 ) {
              clearInterval(myWaitVar);
              var response = xmlhttp.responseText;              
              oligotyping_div.innerHTML = response;            
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
function recreate_image_from_html(image, ts) {
  var htmlstring
  //var str = htmlstring.replace(/\r?\n|\r/g,'')
  //alert(encodeURIComponent(str))
  //var args = 'html='+encodeURIComponent(htmlstring)
  var args = ''
  args += 'ts='+ts
  args += '&image='+image
  if(image == 'barcharts'){
    htmlstring = document.getElementById('barcharts_div').innerHTML;
    args += '&html='+encodeURIComponent(htmlstring)
  }else if(image == 'piecharts'){
    htmlstring = document.getElementById('piecharts_div').innerHTML;
    args += '&html='+encodeURIComponent(htmlstring)
  }else{
    htmlstring = document.getElementById('dheatmap_div').innerHTML;
  }
  //alert(args)
  var xmlhttp = new XMLHttpRequest(); 
  xmlhttp.open("POST", '/user_data/copy_html_to_image', true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange = function() {        
        if (xmlhttp.readyState == 4 ) {
            html = 'Saved!\n\n(File available from the "File Retrieval" button on the "Your Data" page)'
            alert(html)            
        }
      };
  xmlhttp.send(args);      
}
//
//
//
function create_dheatmap(ts, new_window) {
      //alert('im HM')
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
      dheatmap_created = true;
      var dhm_div = document.getElementById('dheatmap_div');
      dhm_div.innerHTML = '';
      dhm_div.style.display = 'block';
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      var info_line = create_header('dhm', pi_local);
      document.getElementById('dheatmap_title').innerHTML = info_line;
      document.getElementById('dheatmap_title').style.color = 'white';
      document.getElementById('dheatmap_title').style['font-size'] = 'small';
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
            document.getElementById('dheatmap_dnld_btn').disabled = false
            

        }
      };
      xmlhttp.send(args);      
}
//
//  CREATE FREQUENCY HEATMAP
//
function create_fheatmap(ts, new_window) {
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
      fheatmap_created = true;
      var fhm_div = document.getElementById('fheatmap_div');
      
      fhm_div.innerHTML = '';
      fhm_div.style.display = 'block';
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      var info_line = create_header('fhm', pi_local);
      document.getElementById('fheatmap_title').innerHTML = info_line;
      document.getElementById('fheatmap_title').style.color = 'white';
      document.getElementById('fheatmap_title').style['font-size'] = 'small';
      
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
            document.getElementById('fheatmap_dnld_btn').disabled = false
        }
      };
      xmlhttp.send(args);   
      
}
//
//  CREATE GEOSPATIAL
//
function create_geospatial(new_window) {
      //alert('in GEO')
      if(new_window){
        
          var htmlstring = document.getElementById('geospatial_div').innerHTML;
        
        
          function openindex()
            {
              rando = Math.floor(Math.random() * 20);
              OpenWindow=window.open("", "geospatial"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
              OpenWindow.document.write(new_window_skeleton(htmlstring))
              OpenWindow.document.close()
              self.name="main"
            }

          openindex()
          return
       

    }
      geospatial_created = true;
      var geo_div = document.getElementById('geospatial_div');
      
      geo_div.innerHTML = '';
      geo_div.style.display = 'block';
      geo_div.style.height = '900px';
            
      var info_line = create_header('geo', pi_local);      
      document.getElementById('geospatial_title').innerHTML = info_line;
      document.getElementById('geospatial_title').style.color = 'white';
      document.getElementById('geospatial_title').style['font-size'] = 'small';
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
              newds = lat_lon_collector[latlon] + ";" + ds;
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
//alert(ds)
      if (loc_data.length === 0){
          geospatial_div.innerHTML='No Lat/Lon Data Found/Selected';
      }else{
        var center = new google.maps.LatLng(loc_data[0][1],loc_data[0][2]); 
        var mapCanvas = document.getElementById('geospatial_div');
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
    //var data = loc_data[i];
  
    var myLatLng = new google.maps.LatLng(loc_data[i][1],loc_data[i][2]); 
    var marker = new google.maps.Marker({
      title: loc_data[i][0],
      position: myLatLng,
      map: map
    });
    //alert(data[0])
    // add an event listener for this marker
    var ds_array = loc_data[i][0].split(';')
    var html = '';
    html += "<table  class='table table_striped' >"
    html += '<tr><th>Dataset</th></tr>';
    for(d in ds_array){
      //var pid = pid_collector[lines[l]].pid;
      //var val = pid_collector[lines[l]].value;
      html += "<tr><td>" + ds_array[d] + "</td></tr>"
    }
    html += '</table>'
    bindInfoWindow(marker, map, infowindow, "<p>" + html + "</p>"); 

  }

}
//
//  CREATE PIECHARTS
//
function create_piecharts(ts, new_window) {
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
    
    var info_line = create_header('pies', pi_local);
    document.getElementById('piecharts_title').innerHTML = info_line;
    var piecharts_div = document.getElementById('piecharts_div');
    document.getElementById('piecharts_title').style.color = 'white';
    document.getElementById('piecharts_title').style['font-size'] = 'small';
    piecharts_div.innerHTML = '';
    piecharts_div.style.display = 'block';
    
    document.getElementById('pre_piecharts_div').style.display = 'block';
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
  document.getElementById('piecharts_dnld_btn').disabled = false

   
}
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
        //alert(retstring)
        window.open(retstring,"_blank")
        //    var lines = retstring.split('\n');
        //    //alert(lines[0])
        //    var headers = lines.shift();
        //    //var line2 = lines.pop();
        //    //alert(headers)
        //    html = "<table class='table'>";
        //    html += '<tr>';
        //    //alert(line2)
        //    var header_items = headers.split('\t')
        //    for(i in header_items){
        //      html += '<td>'+header_items[i]+'</td>';
        //    }
        //    html +=  '</tr>';
        //    for(i in lines){
        //       html +=  '<tr>';
        //       items = lines[i].split('\t');
        //       for(j in items){
        //         html += '<td>'+items[j]+'</td>';
        //       }
        //       html +=  '</tr>';
        //    }
        //    html += '</table>';

        //    adiversity_div.innerHTML = html;
        }
      };
      xmlhttp.send(args);      
}
//
//  CREATE BARCHARTS
//
function create_barcharts_group(ts, new_window) {
      
    if(new_window){
          var htmlstring = document.getElementById('barcharts_div').innerHTML;
          function openindex()
            {
              rando = Math.floor(Math.random() * 20);
              OpenWindow=window.open("", "barcharts"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
              OpenWindow.document.write(new_window_skeleton(htmlstring))
              OpenWindow.document.close()
              self.name="main"
            }
          openindex()
          return
    }
    barcharts_created = true;
    var info_line = create_header('bars', pi_local);
    document.getElementById('barcharts_title').innerHTML = info_line;
    document.getElementById('barcharts_title').style.color = 'white';
    document.getElementById('barcharts_title').style['font-size'] = 'small';
    document.getElementById('barcharts_div').innerHTML = '';
//    barcharts_div.style.display = 'block';
         
    document.getElementById('pre_barcharts_div').style.display = 'block';
     
         // this fxn is in common_selection.js
    create_barcharts('group', ts);
    document.getElementById('barcharts_dnld_btn').disabled = false

}
//
//
//
function create_adiversity(ts, new_window){
    //python scripts
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
           document.getElementById('adiversity_dnld_btn').disabled = false
        }
      };
      xmlhttp.send(args);      
         

}

//
//  CREATE PHYLOSEQ
//
function create_phyloseq(ts,code, new_window) {
      //alert('im HM')
      //phyloseq_created = true;
      if(new_window){
          if(code == 'bar'){
            var htmlstring = document.getElementById('phyloseq_bars01_div').innerHTML;
          }else if(code == 'heatmap'){
            var htmlstring = document.getElementById('phyloseq_hm02_div').innerHTML;
          }else if(code == 'network'){
            var htmlstring = document.getElementById('phyloseq_nw03_div').innerHTML;
          }else if(code == 'ord'){
            var htmlstring = document.getElementById('phyloseq_ord04_div').innerHTML;
          }else if(code == 'tree'){
            var htmlstring = document.getElementById('phyloseq_tree05_div').innerHTML;
          }
          function openindex()
            {
                  rando = Math.floor(Math.random() * 20);
                  OpenWindow=window.open("", "phyloseq"+rando.toString(), "height=900, width=900,toolbar=no,scrollbars=yes,menubar=no");
                  OpenWindow.document.write(new_window_skeleton(htmlstring))
                  OpenWindow.document.close()
                  self.name="main"
            }

          openindex()
          return
       

    }
      var phylo_div,info_line,md1='',md2='',phy='',ord_type;
      var html = '';
      var args =  "metric="+pi_local.selected_distance;
      args += "&plot_type="+code;
      args += "&ts="+ts;

      if(code == 'bar'){
        phy = document.getElementById('phyloseq_bar_phylum').value;
        if(phy == '0'){
          alert('You must choose a phylum.')
          return
        }
        phylo_div = document.getElementById('phyloseq_bars01_div');
        info_line = create_header('phyloseq_bars01', pi_local);
        document.getElementById('phyloseq_bars01_title').innerHTML = info_line;
        document.getElementById('phyloseq_bars01_title').style.color = 'white';
        document.getElementById('phyloseq_bars01_title').style['font-size'] = 'small';
        document.getElementById('pre_phyloseq_bars01_div').style.display = 'block';
        
        args += "&phy="+phy;
      }else if(code == 'heatmap'){
        phy = document.getElementById('phyloseq_heatmap_phylum').value;
        if(phy == '0'){
          alert('You must choose a phylum.')
          return
        }
        phylo_div = document.getElementById('phyloseq_hm02_div');
        info_line = create_header('phyloseq_hm02', pi_local);
        document.getElementById('phyloseq_hm02_title').innerHTML = info_line;
        document.getElementById('phyloseq_hm02_title').style.color = 'white';
        document.getElementById('phyloseq_hm02_title').style['font-size'] = 'small';
        document.getElementById('pre_phyloseq_hm02_div').style.display = 'block';
        
        ord_types = document.getElementsByName('phyloseq_heatmap_type');
        md1 = document.getElementById('phyloseq_heatmap_md1').value;
        ord_type = 'PCoA';
        if(ord_types[0].checked == true){
          ord_type = 'NMDS';
        }
        args += "&phy="+phy+"&md1="+md1+"&ordtype="+ord_type;
      }else if(code == 'network'){
        phylo_div = document.getElementById('phyloseq_nw03_div');
        info_line = create_header('phyloseq_nw03', pi_local);
        document.getElementById('phyloseq_nw03_title').innerHTML = info_line;
        document.getElementById('phyloseq_nw03_title').style.color = 'white';
        document.getElementById('phyloseq_nw03_title').style['font-size'] = 'small';
        document.getElementById('pre_phyloseq_nw03_div').style.display = 'block';
        md1 = document.getElementById('phyloseq_network_md1').value;
        md2 = document.getElementById('phyloseq_network_md2').value;
        max_dists = document.getElementsByName('phyloseq_nwk_dist');
        max_dist = '0.3';
        if(max_dists[0].checked == true){
          max_dist = '0.1';
        }else if(max_dists[1].checked == true){
          max_dist = '0.2';
        }else if(max_dists[2].checked == true){
          max_dist = '0.3';
        }else if(max_dists[3].checked == true){
          max_dist = '0.4';
        }
        args += "&md1="+md1+"&md2="+md2+"&maxdist="+max_dist;
      }else if(code == 'ord'){
        
        phylo_div = document.getElementById('phyloseq_ord04_div');
        info_line = create_header('phyloseq_ord04', pi_local);
        document.getElementById('phyloseq_ord04_title').innerHTML = info_line;
        document.getElementById('phyloseq_ord04_title').style.color = 'white';
        document.getElementById('phyloseq_ord04_title').style['font-size'] = 'small';
        document.getElementById('pre_phyloseq_ord04_div').style.display = 'block';
        md1 = document.getElementById('phyloseq_ord_md1').value;
        md2 = document.getElementById('phyloseq_ord_md2').value;
        ord_types = document.getElementsByName('phyloseq_ord_type');
        ord_type = 'PCoA';
        if(ord_types[0].checked == true){
          ord_type = 'NMDS';
        }
        args += "&md1="+md1+"&md2="+md2+"&ordtype="+ord_type;
        
      }else if(code == 'tree'){
        phylo_div = document.getElementById('phyloseq_tree05_div');
        info_line = create_header('phyloseq_tree05', pi_local);
        document.getElementById('phyloseq_tree05_title').innerHTML = info_line;
        document.getElementById('phyloseq_tree05_title').style.color = 'white';
        document.getElementById('phyloseq_tree05_title').style['font-size'] = 'small';
        document.getElementById('pre_phyloseq_tree05_div').style.display = 'block';
        md1 = document.getElementById('phyloseq_tree_md1').value;
        args += "&md1="+md1;

      }
      phylo_div.innerHTML = '';
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
           var response = xmlhttp.responseText;          
           phylo_div.innerHTML = response;
           if(code == 'bar'){
              document.getElementById('phyloseq_bars01_dnld_btn').disabled = false
            }else if(code == 'heatmap'){
              document.getElementById('phyloseq_hm02_dnld_btn').disabled = false
            }else if(code == 'network'){
              document.getElementById('phyloseq_nw03_dnld_btn').disabled = false
            }else if(code == 'ord'){
              document.getElementById('phyloseq_ord04_dnld_btn').disabled = false
            }else if(code == 'tree'){
              document.getElementById('phyloseq_tree05_dnld_btn').disabled = false
            }
        }
      };
      xmlhttp.send(args);   
      
}
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
    }else if(viz == 'pcoa3d'){
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
    }else if(viz == 'phyloseq_bars01'){
      txt = 'Phyloseq Bars --> ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'phyloseq_hm02'){
      txt = 'Phyloseq Heatmap --> ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'phyloseq_nw03'){
      txt = 'Phyloseq Network --> ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'phyloseq_ord04'){
      txt = 'Phyloseq Ordination --> ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'phyloseq_tree05'){
      txt = 'Phyloseq Tree --> ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'oligotyping'){
      txt = 'Oligotyping --> '; 
    }else{
      txt = 'ERROR in fxn create_headers '+viz;
    }
  txt += ' Normalization: ' + pi.normalization+'; ';
  txt += ' Counts Min/Max: ' + pi.min_range+'% -- '+pi.max_range+'%';
     
  return txt;
}

function download_data(type, download_type, ts) {
    var html = '';
    var args = 'ts='+ts;
    var xmlhttp = new XMLHttpRequest(); 
    
    // if(type == 'metadata'){
    //   target = '/user_data/download_file'  
    //   args += '&file_type='+type;  
    //   args += "&download_type="+download_type; 
    // } else 
    if(type == 'fasta'){
      target = '/user_data/download_file'
      args += '&file_type='+type;
      args += "&download_type="+download_type;
    }else if(type == 'matrix'){    
      target = '/user_data/download_file'
      args += '&file_type='+type;
      args += "&download_type="+download_type;
    
     // else if(type == 'csv'){    
     //  target = '/user_data/download_file'
     //  args += '&file_type='+type;
     //  args += "&download_type="+download_type;
    } else if(type == 'frequency'){    
      target = '/user_data/download_file'
      args += '&file_type='+type;
    }
    else{
      target = '/user_data/copy_file_for_download'
      args += '&file_type='+type;
    }
    
   
    xmlhttp.open("POST", target, true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 ) {
         var filename = xmlhttp.responseText; 
         //html += "<div class='pull-right'>Your file is being compiled and can be downloaded from the"
         //html += "<br><a href='/user_data/file_retrieval'>file retrieval page when ready.</a></div>"
         //document.getElementById('download_confirm_id').innerHTML = html;
         html = 'Saved!\n\n(File available from the "File Retrieval" button on the "Your Data" page)'
         alert(html)
      }
    };
    xmlhttp.send(args);   
}

//
//
//
function save_configuration(ds_local, user){
  
  if(user=='guest'){
      alert("The 'guest' user is not permitted to save datasets.");
      return;
    }
  args=''
  var xmlhttp = new XMLHttpRequest(); 
  xmlhttp.open("POST", '/visuals/save_config', true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 ) {
         var response = xmlhttp.responseText; 
         document.getElementById('save_config_confirmation').innerHTML = response
         
      }
    };
    xmlhttp.send(args);   
}

function reload_view_form(){
  
  form = document.getElementById('reload_form_id');
  form.submit();
  return null
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
  txt +="$('body').delegate('.tooltip_viz', 'mouseover mouseout mousemove', function (event) {var link = this,html = '';$link = $(this);if (event.type == 'mouseover') {tip.id = link.id;link.id = '';id_items = tip.id.split('-|-');html = '<table><tr>';if(id_items[0] == 'dheatmap') {html += '<td>'+id_items[1]+'</td>';html += '</tr><tr>';html += '<td>'+id_items[2]+'</td>';html += '</tr><tr>';html += '<td>Distance: '+id_items[3]+'</td>';}else if(id_items[0] == 'frequencies'){html += '<td>'+id_items[1]+'</td>';html += '</tr><tr>';html += '<td>'+id_items[2]+'</td>';html += '</tr><tr>';html += '<td>Count: '+id_items[3]+' ('+id_items[4]+'%)</td>';}else{ html += '<td>'+id_items[1]+'</td>';    html += '</tr><tr>';html += '<td>Count: '+id_items[2]+' ('+id_items[3]+'%)</td>';}html += '</tr><table>';showTip = setTimeout(function() {$link.data('tipActive', true);tip.position(event);$liveTip.html('<div>' + html  + '</div>').fadeOut(0).fadeIn(200);}, tip.delay);}if (event.type == 'mouseout') {link.id = tip.id || link.id;if ($link.data('tipActive')) {$link.removeData('tipActive');$liveTip.hide();} else {clearTimeout(showTip); }}if (event.type == 'mousemove' && $link.data('tipActive')) { tip.position(event);}});"+"\n"
  txt +="$('body').delegate('.tooltip_viz_help', 'mouseover mouseout mousemove', function (event) {var link = this,html = '';$link = $(this);if (event.type == 'mouseover') {tip.id = link.id;link.id = '';if(tip.id==''){return;}id_items = tip.id.split('-|-');html = '<table>';html += '<tr><td>Requirements:</td></tr>';for(var i=0;i<=id_items.length-1;i++){html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+id_items[i]+'</td></tr>';}html += '<table>';showTip = setTimeout(function() {$link.data('tipActive', true);tip.position(event);$liveTip.html('<div>' + html  + '</div>').fadeOut(0).fadeIn(200); }, tip.delay);}if (event.type == 'mouseout') {link.id = tip.id || link.id;if ($link.data('tipActive')) {$link.removeData('tipActive');$liveTip.hide();} else {clearTimeout(showTip);}}if (event.type == 'mousemove' && $link.data('tipActive')) {tip.position(event);}});"+"\n"
  txt +="</script>"
  return txt
}


