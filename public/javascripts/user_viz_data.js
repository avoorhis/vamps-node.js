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
$("body").delegate(".tooltipx", "mouseover mouseout mousemove", function (event) {
      var link = this,
      html = '';
      $link = $(this);
     
      if (event.type == 'mouseover') {
        tip.id = link.id;
		//alert(tip.id)
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

$(document).ready(function() {  

	    var ts = pi_local.ts;
		
        //var info_line = create_header('bars', pi_local);
		var barcharts_div = document.getElementById('barcharts_div');
		barcharts_div.style.display = 'block';
        barcharts_table_div.innerHTML = get_html(mtx_local);
        //document.getElementById('pre_barcharts_table_div').style.display = 'block';


        data = [];
        // for (var p in mtx_local.columns){
           tmp={};
           tmp.DatasetName = mtx_local.dataset;
		   //tmp.alltotal = mtx_local.total
           for (var t in mtx_local.rows){
             tmp[mtx_local.rows[t]] = mtx_local.data[t];
           }
           data.push(tmp);
         

      
        var unit_list = mtx_local.rows;
       
        // for (var o in mtx_local.rows){
      //     unit_list.push(mtx_local.rows[o].name);
      //   }
        

        var ds_count = 1;      
        var bar_height = 20;
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
function get_html(obj){
	
	var html ='';
	html += "<div class='overflow200'>";
	html += "<table class='table overflow200'>";
	html += '<tr><td width="25">color</td><td>Taxonomy</td><td>Count</td></tr>';
	for(n in obj.rows){
		if(obj.data[n] > 0){
			color = string_to_color_code(obj.rows[n])
			html += "<tr><td style='background-color:"+color+"'></td><td>"+obj.rows[n]+'</td><td>'+obj.data[n]+'</td></tr>';
		}
	}
	html += '</table></div>';
	
	return html;
}
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


       var datasetBar = svg.selectAll(".bar")
          .data(data)
        .enter() .append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return  "translate(0, " + props.y(d.DatasetName) + ")"; })  
	 

       var gnodes = datasetBar.selectAll("rect")
           .data(function(d) { return d.unitObj; })
           .enter()
             .append('a').attr("xlink:href",  function(d) { 
			     return 'sequences/'+d.name
			  }).style("fill",   function(d) { return color(d.name); });
          
       gnodes.append("rect")
             .attr("x", function(d) { return props.x(d.x0); })
             .attr("y", 15)  // adjust where first bar starts on x-axis
             .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
             .attr("height",  25)
		     
             .attr("id",function(d,i) { 
                var cnt =  mtx_local.data[i];
                var total = mtx_local.total;
                var pct = (cnt * 100 / total).toFixed(2);
                var id = 'barcharts-|-' + d.name + '-|-'+ cnt.toString() + '-|-' + pct;
                return id;    // ip of each rectangle should be datasetname-|-unitname-|-count
              }) 
			  .attr("class","tooltipx");


}

function get_image_properties(bar_height, ds_count) {
  var props = {};
  
  //props.margin = {top: 20, right: 20, bottom: 300, left: 50};
  props.margin = {top: 20, right: 0, bottom: 20, left: 0};
  
  var plot_width = 900;
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

