// visualization: unit_selection.js

tax_counts_link = document.getElementById('counts_table');
if (typeof tax_counts_link !=="undefined") {
  tax_counts_link.addEventListener('click', function () {
      //alert('here in tt')
      create_counts_table();
  });
}
tax_counts_btn = document.getElementById('counts_table_hide_btn');
tax_counts_div = document.getElementById('tax_table_div');
if (typeof tax_counts_btn !=="undefined") {
  tax_counts_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(tax_counts_btn.value == 'close'){
        hide_visual_element(tax_counts_div,tax_counts_btn);
      }else{
        show_visual_element(tax_counts_div,tax_counts_btn);
      }
      
  });
}
metadata_link = document.getElementById('metadata2_table');
if (typeof metadata_link !=="undefined") {
  metadata_link.addEventListener('click', function () {
      create_metadata_table();
  });
}
//
// PIECHARTS
//
piecharts_link = document.getElementById('piecharts');
if (typeof piecharts_link !=="undefined") {
  piecharts_link.addEventListener('click', function () {
      //alert('here in pc')
      create_piecharts(pi_local.ts);
  });
}
piecharts_btn = document.getElementById('piecharts_hide_btn');
piecharts_div = document.getElementById('piecharts_div');
if (typeof piecharts_btn !=="undefined") {
  piecharts_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(piecharts_btn.value == 'close'){
        hide_visual_element(piecharts_div,piecharts_btn);
      }else{
        show_visual_element(piecharts_div,piecharts_btn);
      }
      
  });
}
//
// BARCHARTS
//
barchart_link = document.getElementById('barcharts');
if (typeof barchart_link !=="undefined") {
  barchart_link.addEventListener('click', function () {
      //alert('here in pc')
      create_barcharts(pi_local.ts);
  });
}
barcharts_btn = document.getElementById('barcharts_hide_btn');
barcharts_div = document.getElementById('barcharts_div');
if (typeof barcharts_btn !=="undefined") {
  barcharts_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(barcharts_btn.value == 'close'){
        hide_visual_element(barcharts_div,barcharts_btn);
      }else{
        show_visual_element(barcharts_div,barcharts_btn);
      }
      
  });
}
//
//
//
function load_tooltip(visual) {

  if(visual === 'counts_table') {

    $(".counts_tbl_tooltip").tooltip({               
        tip: "#counts_tt_span",          
        position: 'center below',          
        offset: [-40,0],
        opacity: 0.95,          
        delay: 0,
        onBeforeShow: function() {

            var passthru = this.getTrigger().attr("id");            
            var stuff = passthru.split('-|-')
            dname = stuff[0];
            cnt = stuff[1];
            pct   = stuff[2];
            count = cnt + ' ('+pct+' %)'                       
            $("#counts_tt_span table td#dataset").text(dname);
            $("#counts_tt_span table td#count").text(count);               
        },           
    });        
    $(".counts_tbl_tooltip").hover(function() {         
         var cell = $(this);   
    });  

  }else if(visual === 'piecharts' || visual === 'barcharts') {

    $(".piebarchart_tooltip").tooltip({               
        tip: "#piebarchart_tt_span",          
        position: 'center below',          
        offset: [-30,0],
        opacity: 0.95,          
        delay: 0,
        onBeforeShow: function(){  
           
          var passthru = this.getTrigger().attr("id");
          var stuff = passthru.split('-|-')
          uname = stuff[0];
          cnt = stuff[1];
          pct   = stuff[2];
          count = cnt + ' ('+pct+' %)'
          $("#piebarchart_tt_span table td#unit").text(uname); 
          $("#piebarchart_tt_span table td#count").text(count);      
        },       
    });           
    $(".piebarchart_tooltip").hover(function() {         
       var cell = $(this);  
    });

  }else if(visual === 'metadata'){

  }

}
function hide_visual_element(table_div, btn){
  table_div.style.display = 'none';
  btn.value = 'open';
}

function show_visual_element(table_div, btn){
  table_div.style.display = 'block';
  btn.value = 'close';
}

//
// TAX TABLE
//
function create_counts_table() {
      //alert(local_data.unit_choice)
      tt_div = document.getElementById('tax_table_div');
      document.getElementById('pre_counts_table_div').style.display = 'block';
      
      var html = '';
      //var html = "<div id='' class='visual_top_div'>";
      //html += "<input type='button' id='counts_table_hide_btn' value='close'>";
      //html += "</div>";
      //html += "<table border='1' class='single_border center_table'><tr><td>";
      //html += COMMON.get_selection_markup('counts_table', pi_local);     // block for listing prior selections: domains,include_NAs ...
      //html += '</td><td>';
      //html += COMMON.get_choices_markup('counts_table', pi_local);       // block for controls to normalize, change tax percentages or distance
      //html += '</td></tr></table>';


      html += "<table border='1' class='single_border small_font counts_table' >";
      html += "<tr><td></td>";
      for(i in mtx_local.columns){
        html += "<td>"+mtx_local.columns[i].name +"</td>"
      }
      html += "</tr>";
      
      for(i in mtx_local.rows){
        html += "<tr>";
        html += "<td>"+mtx_local.rows[i].name +"</td>";
        for(d in mtx_local.data[i]) {
          var cnt = mtx_local.data[i][d];
          var pct =  (cnt * 100 / mtx_local.column_totals[d]).toFixed(2);
          var id  = mtx_local.columns[d].name+'-|-'+cnt.toString()+'-|-'+pct.toString();
          html += "<td id='"+id+"' class='counts_tbl_tooltip right_justify'>"+cnt+'</td>';
          //html += "<td>"+mtx_local.data[i][d] +"</td>";
        }
        html += "</tr>";
      }
      // TOTALS
      html += "<tr>";
      html += "<td class='right_justify'><strong>Sums:</strong></td>";
      for(i in mtx_local.column_totals){
        html += "<td class='right_justify'>"+mtx_local.column_totals[i] +"</td>"
      }
      html += "</tr>";
      html += "</table>";
      

      tooltip_tbl = "<span id='counts_tt_span' class='chart_tooltip' >";
      tooltip_tbl += "<table style='margin:0'>";   
      tooltip_tbl += "<tr>";
      tooltip_tbl += " <td class='dataset'>Dataset:</td>";
      tooltip_tbl += " <td id='dataset'></td>";
      tooltip_tbl += "</tr>";
      tooltip_tbl += "<tr>";
      tooltip_tbl += "  <td class='count'>Count:</td>";
      tooltip_tbl += "  <td id='count'></td>";
      tooltip_tbl += "</tr>";    
      tooltip_tbl += "</table>";  
      tooltip_tbl += "</span>";
      document.getElementById('counts_tooltip_div').innerHTML = tooltip_tbl;
      tt_div.innerHTML = html;
      load_tooltip('counts_table');
};
//
//  CREATE METADATA TABLE
//
function create_metadata_table() {
      //alert(local_md)
      md_div = document.getElementById('metadata_local_table_div');
      var html = '';
      html += "<table border='1' class='single_border small_font md_table' >";
      html += "<thead><tr><th>Dataset (sortable)</th><th>Name (sortable)</th><th>Value (sortable)</th></tr></thead><tbody>";
      for (var i in ds_local.ids) {
          var did = ds_local.ids[i];
          var ds = ds_local.names[i];

         // for(var md_name in MetadataValues[did]) { 
          //  found_metadata = true;        

            var md_value = MetadataValues[did][md_name];
          //  if(pi_local.metadata.indexOf(md_name) !== -1) {  // only show selected metadata names
                html += "<tr><td>"+ds+"</td><td>"+md_name+"</td><td>"+md_value+"</td></tr>";
                
          //  }
         // }
      }
      html += "</tbody></table>";
      //alert(md_local[0].env_matter)
      
      md_div.innerHTML = html;
};
//
//  CREATE HEATMAP
//
function create_heatmap() {
       alert('im HM')
       hm_div = document.getElementById('distance_heatmap_div');
       html = ''
       for(i in md_local){
        html += "<li>"+md_local[i]+"</li>";
       }
      hm_div.innerHTML = html;
};
//
//  CREATE PIECHARTS
//
function create_piecharts(ts) {
      
       document.getElementById('pre_piecharts_table_div').style.display = 'block';
      //d3.select('svg').remove();

      var counts_per_ds = [];
      var tmp={};
      for(var i in mtx_local.columns){
        tmp[mtx_local.columns[i].name]=[]; // datasets
      }
      for(var x in mtx_local.data){
        for(var i in mtx_local.columns){
          tmp[mtx_local.columns[i].name].push(mtx_local.data[x][i]);
        }       
      }
      var myjson_obj={};
      myjson_obj.names=[];
      myjson_obj.values=[];
      for(var x in tmp) {
        counts_per_ds.push(tmp[x]);
        myjson_obj.names.push(x);
        myjson_obj.values.push(tmp[x]);
      }
      
      //alert(myjson_obj.names);

      var unit_list = [];
      for(o in mtx_local.rows){
        unit_list.push(mtx_local.rows[o].name);
      }
      var colors = get_colors(unit_list);
      var pies_per_row = 4;
      var m = 20;  // margin
      var r = 320/pies_per_row; // five pies per row
      var image_w = 2*(r+m)*pies_per_row;
      
      var image_h = Math.ceil(counts_per_ds.length / 4 ) * ( 2 * ( r + m ) )+ 30;

      
      var arc = d3.svg.arc()
                .innerRadius(r / 2)
                .outerRadius(r);

      
           

      //var counts_per_ds = [[100,20,5],[20,20,20]];
      
      //for(i in counts_per_ds){
      var svgContainer = d3.select("#piecharts_div").append("svg")
                                  .attr("width",image_w)
                                  .attr("height",image_h);
      
      var pies =  svgContainer.selectAll("svg")
                    .data(myjson_obj.values)
                    .enter().append("g")          
                      .attr("transform", function(d, i){
                          //console.log(i);
                          var modulo_i = i+1;
                          var d = r+m;
                          var h_spacer = d*2*(i % pies_per_row);
                          var v_spacer = d*2*Math.floor(i / pies_per_row);                            
                          return "translate(" + (d + h_spacer) + "," + (d + v_spacer) + ")";  
                      })
                    .append("a")
                      .attr("xlink:xlink:href",  function(d,i) { return 'piechart_single?ds='+myjson_obj.names[i]+'&ts='+ts;} );
      
      pies.selectAll("path")
          .data(d3.layout.pie())
        .enter().append("path")
          .attr("d", d3.svg.arc()
          .innerRadius(0)
          .outerRadius(r))
          .attr("id",function(d,i) { 
            var cnt =  d.value;
            var total = 0;
            for(k in this.parentNode.__data__){
              total += this.parentNode.__data__[k];
            }
            //var total = this.parentNode.__data__['total'];
            //console.log(this._parentNode);
            var pct = (cnt * 100 / total).toFixed(2);
            //alert(unit_list[i]+'-|-'+cnt.toString()+'-|-'+total+'-|-'+pct)
            return unit_list[i]+'-|-'+cnt.toString()+'-|-'+pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
            //return this._parentNode.__data__.DatasetName + '-|-' + d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
          }) 
          .attr("class","piebarchart_tooltip")
          .style("fill", function(d, i) {             
            return colors[i]; 
          });

      d3.selectAll("g")
          .data(myjson_obj.names)
          
          .append("text")
          .attr("dx", -(r+m))
          .attr("dy", r+m)          
          .attr("text-anchor", "left")
          .attr("font-size","9px")
          .text(function(d, i) {
            return d;
          });

            
        // add dataset text
       
      var tooltip_tbl = "<span id='piebarchart_tt_span' class='chart_tooltip' >";
      tooltip_tbl += "<table style='margin:0'>";      
      tooltip_tbl += "<tr>";        
      tooltip_tbl += "<td class='tax'>Tax:</td>";
      tooltip_tbl += "<td id='unit'></td>";
      tooltip_tbl += "</tr>";
      tooltip_tbl += "<tr>";        
      tooltip_tbl += "<td class='knt'>Count:</td>";
      tooltip_tbl += "<td id='count'></td>";
      tooltip_tbl += "</tr>";     
      tooltip_tbl += "</table>";  
      tooltip_tbl += "</span>";
      document.getElementById('piebarcharts_tooltip_div').innerHTML = tooltip_tbl;
      load_tooltip('piecharts');
      //hm_div.innerHTML = html;
};
//
//  CREATE BARCHARTS
//
function create_barcharts(ts) {

        document.getElementById('pre_barcharts_table_div').style.display = 'block';

        data = [];
        for (var o in mtx_local.columns){
          tmp={};
          tmp.DatasetName = mtx_local.columns[o].name;
          for (var t in mtx_local.rows){
            tmp[mtx_local.rows[t].name] = mtx_local.data[t][o];
          }
          data.push(tmp);
        }

      
        var unit_list = [];
        // TODO: "'o' is already defined."
        for (var o in mtx_local.rows){
          unit_list.push(mtx_local.rows[o].name);
        }
        

        var ds_count = mtx_local.shape[1];      
        var bar_height = 15;
        var props = get_image_properties(bar_height, ds_count); 
        //console.log(props)
        var color = d3.scale.ordinal()                  
          .range( get_colors(unit_list) );

        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "DatasetName"; }));

        

        data.forEach(function(d) {
          var x0 = 0;
          d.unitObj = color.domain().map(function(name) { 
            return { name: name, x0: x0, x1: x0 += +d[name] }; 
          });
          //console.log(d.unitObj);
          d.total = d.unitObj[d.unitObj.length - 1].x1;
          //console.log(d.total);
        });


        data.forEach(function(d) {
          // normalize to 100%
          tot = d.total;
          d.unitObj.forEach(function(o) {
              //console.log(o);
              o.x0 = (o.x0*100)/tot;
              o.x1 = (o.x1*100)/tot;
          });
        });
      
        
        create_svg_object(props, color, data, ts);
        var tooltip_tbl = "<span id='piebarchart_tt_span' class='chart_tooltip' >";
      tooltip_tbl += "<table style='margin:0'>";      
      tooltip_tbl += "<tr>";        
      tooltip_tbl += "<td class='tax'>Tax:</td>";
      tooltip_tbl += "<td id='unit'></td>";
      tooltip_tbl += "</tr>";
      tooltip_tbl += "<tr>";        
      tooltip_tbl += "<td class='knt'>Count:</td>";
      tooltip_tbl += "<td id='count'></td>";
      tooltip_tbl += "</tr>";     
      tooltip_tbl += "</table>";  
      tooltip_tbl += "</span>";
      document.getElementById('piebarcharts_tooltip_div').innerHTML = tooltip_tbl;
      load_tooltip('barcharts');
}

//////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
function get_image_properties(bar_height, ds_count) {
  var props = {};
  
  //props.margin = {top: 20, right: 20, bottom: 300, left: 50};
  props.margin = {top: 20, right: 100, bottom: 20, left: 300};
  
  var plot_width = 650;
  var gap = 2;  // gap on each side of bar
  props.width = plot_width + props.margin.left + props.margin.right;
  props.height = (ds_count * (bar_height + 2 * gap)) + 125;
  
  props.x = d3.scale.linear() .rangeRound([0, plot_width]);
    
  props.y = d3.scale.ordinal()
      .rangeBands([0, (bar_height + 2 * gap) * ds_count]);
    
  props.xAxis = d3.svg.axis()
          .scale(props.x)
          .orient("top");
  
  props.yAxis = d3.svg.axis()
          .scale(props.y)
          .orient("left");
          
              
  return props;
}
function create_svg_object(props, color, data, ts) {
      
      //d3.select('svg').remove();
      
      var svg = d3.select("#barcharts_div").append("svg")
                  .attr("width",  props.width)
                  .attr("height", props.height)
                .append("g")
                  .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");
      
      
      // axis legends -- would like to rotate dataset names
      props.y.domain(data.map(function(d) { return d.DatasetName; }));
      props.x.domain([0, 100]);

      svg.append("g")
          .attr("class", "y axis")
          .call(props.yAxis)
          .selectAll("text")  
             .style("text-anchor", "end")
             .attr("dx", "-.5em")
             .attr("dy", "1.4em"); 
             
             
      svg.append("g")
          .attr("class", "x axis")
          .call(props.xAxis)
        .append("text")
          .attr("x", 650)
          .attr("dy", ".8em")
          .style("text-anchor", "end")
          .text("Percent");
     
     
      

      // var datasetBar = svg.selectAll("a")
      //     .data(data)
      //   .enter().append("a")
      //   .attr("xlink:href",  'http://www.google.com' )
      //   .append("g")
      //     .attr("class", "g")
      //     .attr("transform", function(d) { return  "translate(0, " + props.y(d.DatasetName) + ")"; })
       var datasetBar = svg.selectAll(".bar")
          .data(data)
        .enter() .append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return  "translate(0, " + props.y(d.DatasetName) + ")"; })  
          .append("a")
        .attr("xlink:xlink:href",  function(d) { return 'piechart_single?ds='+d.DatasetName+'&ts='+ts;} );

      datasetBar.selectAll("rect")
     //     .append("a")
     //   .attr("xlink:href",  'http://www.google.com')
          .data(function(d) { return d.unitObj; })
        .enter()
        .append("rect")
          .attr("x", function(d) { return props.x(d.x0); })
          .attr("y", 15)  // adjust where first bar starts on x-axis
          .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
          .attr("height",  18)
          .attr("id",function(d) { 
            var cnt =  this.parentNode.__data__[d.name];
            var total = this.parentNode.__data__['total'];
            //console.log(this._parentNode.__data__['total']);
            var pct = (cnt * 100 / total).toFixed(2);
            return d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
            //return this._parentNode.__data__.DatasetName + '-|-' + d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
          }) 
          .attr("class","piebarchart_tooltip")
          .style("fill",   function(d) { return color(d.name); });

       //rect.append("svg:a").attr("xlink:href",  'http://www.google.com')
       
}
//
// GET REQUESTED UNITS SELECTION BOX
//
// function get_requested_units_selection_box() {
//   var file_id = this.value;
//   // Using ajax it will show the requested units module
//   var file = '';
//   var partial_name = '/visuals/partials/'+file_id;
//   //alert(partial_name)
//   var xmlhttp = new XMLHttpRequest();
//   xmlhttp.addEventListener("load", transferComplete(file_id), false);

//   xmlhttp.open("GET", partial_name);
//   xmlhttp.onreadystatechange = function() {

//          if (xmlhttp.readyState == 4 ) {
//            var string = xmlhttp.responseText;

//            var div = document.getElementById('units_select_choices_div').innerHTML = string;
//            show_custom_taxa_tree();
//          }
//   };
//   xmlhttp.send();
// }

function get_colors(unit_names){
  var colors = [];
  for(var n in unit_names){
    //alert(unit_names[n]);
    col = string_to_color_code(unit_names[n]);
    //console.log(col);
    colors.push(col);
  }
  return colors;
}
function string_to_color_code(str){
    var hash = 0;
    for(var i=0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 3) - hash);
    }
    var color = Math.abs(hash).toString(16).substring(0, 6);
    return "#" + '000000'.substring(0, 6 - color.length) + color;
}


