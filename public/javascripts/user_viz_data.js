//
//  CREATE SINGLE BARCHART on page load
//
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





function get_single_bar_html(obj){
	
	var html ='';
	html += "<div class='overflow_500'>";
	html += "<table id='single_barchart_table_id' class='table table-condensed overflow200 sortable'>";
  html += '<thead>'
	html += "<tr><th width='25' >color</th><th>Taxonomy <small>(click to sort)</small></th><th>Count <small>(click to sort)</small></th></tr>";
  html += '</thead><tbody>'
	var total = 0;
  for(n in obj.rows){
    total += parseInt(obj.data[n]);
  }
  //alert(html)
  for(n in obj.rows){
		if(obj.data[n] > 0){
			color = string_to_color_code(obj.rows[n].id)
			link = 'sequences?id='+obj.columns[0].id+'&taxa='+encodeURIComponent(obj.rows[n].id)+'&filename='+filename;
			var pct = ((obj.data[n] / total)*100).toFixed(2);
      var id = 'barcharts-|-' + obj.rows[n].id + '-|-'+ obj.data[n] + '-|-' + pct;
      
      html += "<tr class='tooltip_viz' id='"+id+"' ><td style='background-color:"+color+"'></td>";
      html += "<td><a href='"+link+"'>"+obj.rows[n].id+'</a></td><td>'+obj.data[n]+"</td></tr>";
		}
	}
	html += '</tbody>'
  html += '</table></div>';
	
	return html;
}
//
//
//
function get_double_bar_html(obj){
  
  var html ='';

  html += "<div class='overflow_500'>";
  html += "<table class='table table-condensed overflow200 sortable'>";
  html += '<thead>'
  html += "<tr><th width='25' >color</th><th>Taxonomy <small>(click to sort)</small></th><th>"+obj.datasets[0]+" <small>(click to sort)</small></th><th>"+obj.datasets[1]+" <small>(click to sort)</small></th></tr>";
  html += '</thead><tbody>'
  var total = [0,0];
  var pct1,pct2,id1,id2;
  for(n in obj.rows){
    total[0] += parseInt(obj.data[n][0]);
    total[1] += parseInt(obj.data[n][1]);
  }
  for(n in obj.rows){
    //if(obj.data[n] > 0){
      color = string_to_color_code(obj.rows[n].id)
      link1 = 'sequences?id='+obj.columns[0].id+'&taxa='+encodeURIComponent(obj.rows[n].id)+'&filename='+filename;
      link2 = 'sequences?id='+obj.columns[1].id+'&taxa='+encodeURIComponent(obj.rows[n].id)+'&filename='+filename;
      pct1 = ((obj.data[n][0] / total[0])*100).toFixed(2);
      id1 = 'barcharts-|-' + obj.rows[n].id + '-|-'+ obj.data[n][0] + '-|-' + pct1;
      pct2 = ((obj.data[n][1] / total[1])*100).toFixed(2);
      id2 = 'barcharts-|-' + obj.rows[n].id + '-|-'+ obj.data[n][1] + '-|-' + pct2;
      html += "<tr>"

      html += "<td style='background-color:"+color+"'></td>";

      //html += "<td><a href='"+link2+"'>"+obj.rows[n].id+'</a></td>'
      html += "<td>"+obj.rows[n].id+'</td>'
      //html += "<td class='tooltip_viz' id='"+id1+"' >"+obj.data[n][0]+'</td>'
      html += "<td class='tooltip_viz' id='"+id1+"' ><a href='"+link1+"'>"+obj.data[n][0]+'</a></td>'
      //html += "<td class='tooltip_viz' id='"+id2+"' >"+obj.data[n][1]+'</td>'
      html += "<td class='tooltip_viz' id='"+id2+"' ><a href='"+link2+"'>"+obj.data[n][1]+'</a></td>'

      html += "</tr>";
    //}
  }
  html += '</tbody>'
  html += '</table></div>';
  
  return html;
}
// function create_svg_object(props, color, data, ts) {
//        //d3.select('svg').remove();
//       
//       var svg = d3.select("#barcharts_div").append("svg")
//                   .attr("width",  props.width)
//                   .attr("height", props.height)
//                 .append("g")
//                   .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");
//       
//       
//       // axis legends -- would like to rotate dataset names
//       props.y.domain(data.map(function(d) { return d.datasetName; }));
//       props.x.domain([0, 100]);
// 
// 
//        var datasetBar = svg.selectAll(".bar")
//           .data(data)
//         .enter() .append("g")
//           .attr("class", "g")
//           .attr("transform", function(d) { return  "translate(0, " + props.y(d.datasetName) + ")"; })  
// 	 
// 
//        var gnodes = datasetBar.selectAll("rect")
//            .data(function(d) { return d.unitObj; })
//            .enter()
//              .append('a').attr("xlink:href",  function(d) { 
// 			     return 'sequences?taxa='+encodeURIComponent(d.name)+'&did='+mtx_local.did;
// 			  }).style("fill",   function(d) { return color(d.name); });
//           
//        gnodes.append("rect")
//              .attr("x", function(d) { return props.x(d.x0); })
//              .attr("y", 15)  // adjust where first bar starts on x-axis
//              .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
//              .attr("height",  25)
// 		     
//              .attr("id",function(d,i) { 
//                 var cnt =  mtx_local.data[i];
//                 var total = mtx_local.total;
//                 var pct = (cnt * 100 / total).toFixed(2);
//                 var id = 'barcharts-|-' + d.name + '-|-'+ cnt.toString() + '-|-' + pct;
//                 return id;    // ip of each rectangle should be datasetname-|-unitname-|-count
//               }) 
// 			  .attr("class","tooltipx");
// 
// 
// }

// function get_image_properties(bar_height, ds_count) {
//   var props = {};
//   
//   //props.margin = {top: 20, right: 20, bottom: 300, left: 50};
//   props.margin = {top: 20, right: 0, bottom: 20, left: 0};
//   
//   var plot_width = 900;
//   var gap = 2;  // gap on each side of bar
//   props.width = plot_width + props.margin.left + props.margin.right;
//   props.height = (ds_count * (bar_height + 2 * gap)) + 125;
//   
//   props.x = d3.scale.linear() .rangeRound([0, plot_width]);
//     
//   props.y = d3.scale.ordinal()
//       .rangeBands([0, (bar_height + 2 * gap) * ds_count]);
//     
//   props.xAxis = d3.svg.axis()
//           .scale(props.x)
//           .orient("top");
//   
//   props.yAxis = d3.svg.axis()
//           .scale(props.y)
//           .orient("left");
//           
//               
//   return props;
// }


