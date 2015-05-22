//
//  CREATE SINGLE BARCHART on page load
//

$(document).ready(function() {  

	    var ts = pi_local.ts;
        barcharts_created = true;
		alert(dataset);
        //var info_line = create_header('bars', pi_local);
		var barcharts_div = document.getElementById('barcharts_div');
		barcharts_div.style.display = 'block';
        barcharts_div.innerHTML = 'info_line';
        //document.getElementById('pre_barcharts_table_div').style.display = 'block';


        data = [];
        for (var p in mtx_local.columns){
          tmp={};
          tmp.DatasetName = mtx_local.columns[p].name;
          for (var t in mtx_local.rows){
            tmp[mtx_local.rows[t].name] = mtx_local.data[t][p];
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
        
})

//
//
//
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
        .attr("xlink:xlink:href",  function(d) { return 'bar_single?ds='+d.DatasetName+'&ts='+ts;} )
	    .attr("target", '_blank' );

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
            var ds = ''; // PLACEHOLDER for TT
            var pct = (cnt * 100 / total).toFixed(2);
            var id = 'barcharts-|-' + d.name + '-|-'+ cnt.toString() + '-|-' + pct; 
            return id;    // ip of each rectangle should be datasetname-|-unitname-|-count
            //return this._parentNode.__data__.DatasetName + '-|-' + d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
          }) 

          .attr("class","tooltipx")
          .style("fill",   function(d) { return color(d.name); });


       //rect.append("svg:a").attr("xlink:href",  'http://www.google.com')
}

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

