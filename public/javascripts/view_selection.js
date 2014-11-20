//var COMMON  = require('./routes_common');
// visualization: unit_selection.js
// COUNTS
tax_counts_link = document.getElementById('counts_table');
if (typeof tax_counts_link !=="undefined") {
  tax_counts_link.addEventListener('click', function () {
      
      create_counts_table();
  });
}
// tax_counts_btn = document.getElementById('counts_table_hide_btn');
// tax_counts_div = document.getElementById('tax_table_div');
// if (typeof tax_counts_btn !=="undefined") {
//   tax_counts_btn.addEventListener('click', function () {
//       //alert('here in tt')
//       if(tax_counts_btn.value == 'close'){
//         hide_visual_element(tax_counts_div,tax_counts_btn);
//       }else{
//         show_visual_element(tax_counts_div,tax_counts_btn);
//       }
      
//   });
// }
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
// piecharts_btn = document.getElementById('piecharts_hide_btn');
// piecharts_div = document.getElementById('piecharts_div');
// if (typeof piecharts_btn !=="undefined") {
//   piecharts_btn.addEventListener('click', function () {
//       //alert('here in tt')
//       if(piecharts_btn.value == 'close'){
//         hide_visual_element(piecharts_div,piecharts_btn);
//       }else{
//         show_visual_element(piecharts_div,piecharts_btn);
//       }
      
//   });
// }
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
// barcharts_btn = document.getElementById('barcharts_hide_btn');
// barcharts_div = document.getElementById('barcharts_div');
// if (typeof barcharts_btn !=="undefined") {
//   barcharts_btn.addEventListener('click', function () {
//       //alert('here in tt')
//       if(barcharts_btn.value == 'close'){
//         hide_visual_element(barcharts_div,barcharts_btn);
//       }else{
//         show_visual_element(barcharts_div,barcharts_btn);
//       }
      
//   });
// }

//
//
//
// TEST
//
test_link = document.getElementById('test_page');
if (typeof test_link !=="undefined") {
  test_link.addEventListener('click', function () {
      //alert('here in pc')
      create_test_page(pi_local.ts);
  });
}
function create_test_page(ts) {
  

var opened = window.open("");
opened.document.write("<html><head><title>My title</title></head><body>test</body></html>");


}
//
//
//
// function load_tooltip(visual) {

//   if(visual === 'counts_table') {

//     $(".counts_tbl_tooltip").tooltip({               
//         tip: "#counts_tt_span",          
//         position: 'center below',          
//         offset: [-40,0],
//         opacity: 0.95,          
//         delay: 0,
//         onBeforeShow: function() {

//             var passthru = this.getTrigger().attr("id");            
//             var stuff = passthru.split('-|-')
//             dname = stuff[0];
//             cnt = stuff[1];
//             pct   = stuff[2];
//             count = cnt + ' ('+pct+' %)'                       
//             $("#counts_tt_span table td#dataset").text(dname);
//             $("#counts_tt_span table td#count").text(count);               
//         },           
//     });        
//     $(".counts_tbl_tooltip").hover(function() {         
//          var cell = $(this);   
//     });  

//   }else if(visual === 'piecharts' || visual === 'barcharts') {

//     $(".piebarchart_tooltip").tooltip({               
//         tip: "#piebarchart_tt_span",          
//         position: 'center below',          
//         offset: [-30,0],
//         opacity: 0.95,          
//         delay: 0,
//         onBeforeShow: function(){  
           
//           var passthru = this.getTrigger().attr("id");
//           var stuff = passthru.split('-|-')
//           uname = stuff[0];
//           cnt = stuff[1];
//           pct   = stuff[2];
//           count = cnt + ' ('+pct+' %)'
//           $("#piebarchart_tt_span table td#unit").text(uname); 
//           $("#piebarchart_tt_span table td#count").text(count);      
//         },       
//     });           
//     $(".piebarchart_tooltip").hover(function() {         
//        var cell = $(this);  
//     });

//   }else if(visual === 'metadata'){

//   }

// }
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

      var count_table_window = window.open();
      var html = '';
      //var html = "<div id='' class='visual_top_div'>";
      //html += "<input type='button' id='counts_table_hide_btn' value='close'>";
      //html += "</div>";
      html += "<table border='1' class='single_border center_table font_small'>";
      html += '<tr><td>Current Normalization</td><td>'+pi_local.normalization+'</td></tr>';
      //html += COMMON.get_selection_markup('counts_table', pi_local);     // block for listing prior selections: domains,include_NAs ...
      html += "<tr><td><input type='radio' name='norm' selected value='none'>none</td>";
      html += "<td><input type='radio' name='norm' value='max'>max</td>";
      html += "<td><input type='radio' name='norm' value='freq'>freq</td></tr>";
      //html += COMMON.get_choices_markup('counts_table', pi_local);       // block for controls to normalize, change tax percentages or distance
      html += '</table>';


      html += "<table border='1' class='single_border small_font counts_table' >";
      html += "<tr><td></td>";
      for(i in mtx_local.columns){
        html += "<td class=''>"+mtx_local.columns[i].name +"</td>"
      }
      html += "</tr>";
      
      for(i in mtx_local.rows){
        html += "<tr class='chart_row'>";
        html += "<td class='right_justify'>"+mtx_local.rows[i].name +"</td>";
        for(d in mtx_local.data[i]) {
          var cnt = mtx_local.data[i][d];
          var pct =  (cnt * 100 / mtx_local.column_totals[d]).toFixed(2);
          var id  = mtx_local.rows[i].name+'-|-'+mtx_local.columns[d].name+'-|-'+cnt.toString()+'-|-'+pct.toString();
          //html += "<td data-ot='"+id+"' data-ot-title='"+mtx_local.columns[d].name+"' data-ot-fixed='true' id='"+id+"' class='counts_tbl_tooltip right_justify'>"+cnt+'</td>';
          html += "<td id='"+id+"' class='chart_tooltip right_justify'>"+cnt+'</td>';
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
      

     
      
      count_table_window.document.write("<html><head><title>VAMPS Counts</title>\n");
      count_table_window.document.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"/stylesheets/style.css\">\n");
      count_table_window.document.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"/stylesheets/960.css\">\n");
      count_table_window.document.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"/stylesheets/visualization.css\">\n");
      
      
      //count_table_window.document.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"/stylesheets/opentip.css\">\n");
      //count_table_window.document.write("<script src=\"/javascripts/opentip-native.min.js\"></script>\n");

      count_table_window.document.write("</head><body>"+html+"\n");
      

      count_table_window.document.write("<script src=\"/javascripts/jquery-2.1.1.min.js\"></script>\n");
      count_table_window.document.write("<script src=\"/javascripts/view_selection_client.js\"></script>\n");
                  


      //count_table_window.document.write("<script type=\"text/javascript\" src=\"/public/javascripts/global.js\"></script>");
      count_table_window.document.write("</body></html>");
      count_table_window.document.close();
      //load_tooltip('counts_table');
};
//
//  CREATE METADATA TABLE
//
function create_metadata_table() {
     
      var metadata_table_window = window.open();
      metadata_table_window.document.write("<html><head><title>VAMPS Metadata</title>\n");
      metadata_table_window.document.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"/stylesheets/style.css\">\n");
      metadata_table_window.document.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"/stylesheets/960.css\">\n");
      metadata_table_window.document.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"/stylesheets/visualization.css\">\n");
      metadata_table_window.document.write("</head><body>\n");

      var html = '';
      html += "<table border='1' id='metadata_table' class='single_border small_font md_table' >";
      html += "<thead><tr><th>Dataset (sortable)</th><th>Name (sortable)</th><th>Value (sortable)</th></tr></thead><tbody>";
      
      for (var ds in md_local) {

          for(k in md_local[ds]) {
            html += "<tr>";
            html += "<td>"+ds+"</td>";
            md_item = k
            md_val = md_local[ds][k]
            html += "<td>"+md_item+"</td><td>"+md_val+"</td>";
            html += "</tr>";
          }        
      }
      html += "</tbody></table>";
      
      
      metadata_table_window.document.write(html+"\n");
      metadata_table_window.document.write("<script src=\"/javascripts/jquery-2.1.1.min.js\"></script>\n");
      metadata_table_window.document.write("<script type='text/javascript' src='/javascripts/tablesort.min.js'></script>\n");
      metadata_table_window.document.write("<script>\n");
      metadata_table_window.document.write("  new Tablesort(document.getElementById('metadata_table')); \n");
      metadata_table_window.document.write("</script>\n");
      metadata_table_window.document.write("<script src=\"/javascripts/view_selection_client.js\"></script>\n");
      metadata_table_window.document.write("</body></html>");
      metadata_table_window.document.close();
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
      
      var piecharts_window = window.open('');

      piecharts_window.document.close();
     
      var newWindowRoot = d3.select(piecharts_window.document.body);
      newWindowRoot.append("div")
          .attr("class", "pies")
          .attr("id","viz")
          .style("width","800px")
          .style("text-align","center")
          .style("background","lightgray")
          .style("border","1px solid black")


     var myjson_obj=[];
     
     for(var g in mtx_local.columns) {  // per ds
        
        var ds = mtx_local.columns[g].name;
        var tdata = [];
        var ttax = [];        
        //total = 0;
        //var totals = [];
        total = mtx_local.column_totals[g]
        for(k in mtx_local.data){
          tdata.push(mtx_local.data[k][g])
          ttax.push(mtx_local.rows[k].name);
          //total = mtx_local.data[k][g]
          
        }
        //for(k in mtx_local.data) {
          //totals.push(total)
        //}

        myjson_obj.push({ name:ds, data:tdata, tax:ttax, total:total });  // one for each dataset
        //var total = d3.sum(tdata, function(d){ return d; });
        //alert(totals);
     }


//alert(JSON.stringify(myjson_obj))

      var unit_list = [];
      for(o in mtx_local.rows){
        unit_list.push(mtx_local.rows[o].name);
      }
      var colors = get_colors(unit_list);
  
      var radius = 100;
      //var pies_per_row = 4;

      var arc = d3.svg.arc()
          .outerRadius(radius - 10);       
                
      var pie = d3.layout.pie()
            .value(function (d) { return d; })
            .sort(null);
      
      var ttip = newWindowRoot
          .append("div")  // declare the tooltip div 
          .attr("class", "tooltip")              // apply the 'tooltip' class
          .style("opacity", 1e-6);    // set the opacity to nil


      //var svg = newWindowRoot
      var svg = newWindowRoot.select("#viz")
            .selectAll('svg')
            .data(myjson_obj)
            .enter().append("svg")
      //var svgContainer = d3.select('#viz_div').append('svg')
            .attr('width', radius*2)
            .attr('height',radius*2)
            .append("g")
            .attr("transform", "translate(" + radius + "," + radius + ")")
           
            .append("a")
              .attr("id", function(d,i) { return myjson_obj[i].name } )
              .attr("xlink:href", function(d,i) { return 'piechart_single?ds='+myjson_obj[i].name+'&ts='+ts;} );           
      
     
      var arcs = svg.selectAll("g")
          .data(function (d,i) { 
            //alert(JSON.stringify(d.name)) 
            
            return pie(d.data); })
          .enter().append("g")
          .attr("class", "chart_tooltip")
          .attr("id",function(d,i) {
                              
                var total = this.parentNode.__data__.total; 
                //alert(JSON.stringify(this.parentNode.__data__.total))                           
                var pct = (d.value * 100 / total).toFixed(2);
                return unit_list[i]+'-|-'+d.value.toString()+'-|-'+pct.toString();
          })
          .on("mouseover", function(d,i) { 
              
      //        ttip.transition()
      //          .duration(0)  
      //          .style("opacity", 1);                             
              })
          
          .on("mousemove", function(d,i){
            var pnode = this.parentNode;
            var ds = pnode.__data__.name; 
                //alert(JSON.stringify(pnode.__data__))
            var total = pnode.__data__.total; 
            var pct = (d.value * 100 / total).toFixed(2);
            ttip
             .html( 
                '<table>' + // The first <a> tag
                '<tr><td colspan="2">' +  ds +'</td></tr>'+ 
                 '<tr><td bgcolor="'+colors[i]+'" width="15">&nbsp;</td><td>'+unit_list[i] +'</td></tr>'+
                 '<tr><td></td><td>Count ' +  d.value.toString() +'</td></tr>'+ 
                 '<tr><td></td><td>Frequency ' +  pct.toString() +'%'+'</td></tr>'+                    // closing </a> tag
                '</table>'
              ).style('position','absolute')
             .style('top', (d3.event.pageY)+'px')
             .style('left', (d3.event.pageX+20)+'px')
             .style('background','lightsteelblue')
             .style('padding','3px')
             .style('font','9px sans-serif')
             .style('border','0px')
             .style('border-radius','8px')
             .style("opacity", 1);
            
//alert(JSON.stringify(this.parentNode))
              
          })
          .on("mouseout", function (d) {
                 // Hide the tooltip
              ttip
                .style("opacity", 1e-6);
          });


      arcs.append("path")
          .attr("d", arc)         
          .style("fill", function (d,i) { return colors[i]; });
   
};
//
//  CREATE BARCHARTS
//
function create_barcharts(ts) {

        //document.getElementById('pre_barcharts_table_div').style.display = 'block';

      var barcharts_window = window.open('');      
      barcharts_window.document.close();
      //piecharts_window.document.write()
      var newWindowRoot = d3.select(barcharts_window.document.body);
      newWindowRoot
        .append("div")
          .attr("class", "bars")
          .attr("id","viz")
          .style("background","lightgray")
          .style("border","1px solid black")

     
      var unit_list = [];
      for(o in mtx_local.rows){
        unit_list.push(mtx_local.rows[o].name);
      }
      var colors = get_colors(unit_list);  



        data = [];
        for (var o in mtx_local.columns){
          tmp={};
          tmp.DatasetName = mtx_local.columns[o].name;
          for (var t in mtx_local.rows){
            tmp[mtx_local.rows[t].name] = mtx_local.data[t][o];
          }
          data.push(tmp);
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
          //alert(d.total)
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
      
        
        create_svg_object(props, color, colors, data, ts, newWindowRoot);
     
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
//
//
//
function create_svg_object(props, color, colors, data, ts, window) {
      
      //d3.select('svg').remove();
      
      var ttip = window
          .append("div")  // declare the tooltip div 
          .attr("class", "tooltip")              // apply the 'tooltip' class
          .style("opacity", 1e-6);    // set the opacity to nil

      var svg = window.select("#viz").append("svg")
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
          .attr("id",function(d,i) { 
            var pnode = this.parentNode;
            var cnt =  pnode.__data__[d.name];
            var total = pnode.__data__['total'];
            //console.log(this._parentNode.__data__['total']);
            var pct = (cnt * 100 / total).toFixed(2);
            return d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
            //return this._parentNode.__data__.DatasetName + '-|-' + d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
          }) 
          .on("mouseover", function(d,i) { 
              
                            
              })
          
          .on("mousemove", function(d,i){
            var pnode = this.parentNode;
            //var ds = pnode.__data__.name; 
            //alert(JSON.stringify(pnode.__data__))
            var ds = pnode.__data__.DatasetName
            var cnt =  pnode.__data__[d.name];
            var total = pnode.__data__['total'];
            //console.log(this._parentNode.__data__['total']);
            var pct = (cnt * 100 / total).toFixed(2);
            ttip
             .html( 
                '<table>' + // The first <a> tag
                '<tr><td colspan="2">' +  ds +'</td></tr>'+ 
                 '<tr><td bgcolor="'+colors[i]+'" width="15">&nbsp;</td><td>'+d.name +'</td></tr>'+
                 '<tr><td></td><td>Count ' +  cnt.toString() +'</td></tr>'+ 
                 '<tr><td></td><td>Frequency ' +  pct.toString() +'%'+'</td></tr>'+                    // closing </a> tag
                '</table>'
              ).style('position','absolute')
             .style('top', (d3.event.pageY)+'px')
             .style('left', (d3.event.pageX+20)+'px')
             .style('background','lightsteelblue')
             .style('padding','3px')
             .style('font','9px sans-serif')
             .style('border','0px')
             .style('border-radius','8px')
             .style("opacity", 1);
            
//alert(JSON.stringify(this.parentNode))
              
          })
          .on("mouseout", function (d) {
                 // Hide the tooltip
              ttip
                .style("opacity", 1e-6);
          })
          //.attr("class","piebarchart_tooltip")
          .style("fill",   function(d,i) { return colors[i]; });

       //rect.append("svg:a").attr("xlink:href",  'http://www.google.com')
       
}


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


