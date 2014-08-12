// bar_charts.js
var fpath = require('path');
var fs = require('fs');
var COMMON  = require('./routes_common');
var d3 = require("d3");
var xmldom = require('xmldom')
//var jsdom = require('jsdom');


module.exports = {

		//
		//  CREATE BARCHARTS HTML
		//
		create_barcharts_html: function( ts, count_matrix, body ) {
			
			var outfile = '../../tmp/'+ts+'_barcharts.html';
			var ds_count = body.selection_obj.dataset_ids.length
			//console.log(outfile)
			var bar_width = 15;
			var data = convert_matrix(count_matrix);

			
			// gets margins, width and height
			var props = get_image_properties(bar_width, ds_count);		

			//var x = d3.scale.linear();
			 
			// get_colors: transforms unit names to unique hex colors
			var color = d3.scale.ordinal()									
			    .range( get_colors(count_matrix.unit_names) );
			    
			 
			color.domain(d3.keys(data[0]).filter(function(key) { return key !== "DatasetName"; }));
			
			data.forEach(function(d) {
		    var y0 = 0;
		    d.unitObj = color.domain().map(function(name) {
		    	 //console.log(d[name])
		    	 return {name: name, y0: y0, y1: y0 += +d[name]}; 
		    });
		    d.total = d.unitObj[d.unitObj.length - 1].y1;

		  });

			data.forEach(function(d) {
				// normalize to 100%
				tot = d.total
				d.unitObj.forEach(function(o) {
						//console.log(o);
						o.y0 = (o.y0*100)/tot
						o.y1 = (o.y1*100)/tot
				});
			});
			console.log(JSON.stringify(data))
			
		  // axis legends -- would like to rotate dataset names
		  props.x.domain(data.map(function(d) { return d.DatasetName; }));
		  props.y.domain([0, 100]);

		  create_svg_object(props, color, data);
		
		
			// get a reference to our SVG object and add the SVG NS
			var svgGraph = d3.select('svg').attr('xmlns', 'http://www.w3.org/2000/svg');
			//console.log(svgGraph[0][0]);
			var svgXML = (new xmldom.XMLSerializer()).serializeToString( svgGraph[0][0] );
			
			console.log(svgXML)
			
			COMMON.write_file(outfile,svgXML);
			d3.select('svg').remove();

	  } // end fxn


	 
} // end of module.exports
//
//
//
function create_svg_object(props, color, data) {

		  var svg = d3.select("body").append("svg")
							    .attr("width",  props.width + props.margin.left + props.margin.right)
							    .attr("height", props.height + props.margin.top + props.margin.bottom)
							  .append("g")
							    .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");

			svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + props.height + ")")
		      .call(props.xAxis)
		      .selectAll("text")  
				     .style("text-anchor", "end")
				     .attr("dx", "-.8em")
				     .attr("dy", "1.4em")  // move the dataset name to the left
				     .attr("transform", function(d) {
				         return "rotate(-90)" 
				     });

		  svg.append("g")
		      .attr("class", "y axis")
		      .call(props.yAxis)
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Percent");

		  var datasetName = svg.selectAll(".DatasetName")
		      .data(data)
		    .enter().append("g")
		      .attr("class", "g")
		      .attr("transform", function(d) { return "translate(" + props.x(d.DatasetName) + ",0)"; });

		  datasetName.selectAll("rect")
		      .data(function(d) { return d.unitObj; })
		    .enter().append("rect")
		      .attr("width", props.x.rangeBand())
					.attr("id",function(d) { 
		       	return this._parentNode.__data__.DatasetName + '-|-'+d.name + '-|-'+this._parentNode.__data__[d.name].toString() // tip of each rectangle should be datasetname-|-unitname-|-count
					})  
		      .attr("y", function(d) { return props.y(d.y1); })
		      .attr("x", 25)  // adjust where first bar starts on x-axis
		      .attr("height",  function(d) { return props.y(d.y0) - props.y(d.y1); })
		      .attr("class","tooltip")
		      .style("fill",   function(d) { return color(d.name); });
}

//
//
//
function get_image_properties(bar_width, ds_count) {
	var props = {};
	props.margin = {top: 20, right: 20, bottom: 300, left: 50};
	//var width  = (ds_count * (bar_width + 5)) + 50 - margin.left - margin.right;
	props.width  = (ds_count * (bar_width)) + 50;
	props.height = 700 - props.margin.top - props.margin.bottom;

	props.x = d3.scale.ordinal().rangeRoundBands([0, props.width], .1);
	props.y = d3.scale.linear()
			    .rangeRound([props.height, 0]);

	props.xAxis = d3.svg.axis()
			    .scale(props.x)
			    .orient("bottom");

	props.yAxis = d3.svg.axis()
			    .scale(props.y)
			    .orient("left")
			    .tickFormat(d3.format(".2s"));		
			        
	return props;
}
//
//
//
function get_colors(unit_names){
	var colors = []
	for(var n in unit_names){
		console.log(n)
		colors.push(COMMON.string_to_color_code(n));
	}
	return colors;
}
//
//
//
function convert_matrix(mtx) {
		var data = [];
		for(n in mtx.dataset_names) {
			data.push({'DatasetName': mtx.dataset_names[n]});	
		}
		for(u in mtx.unit_names) {
			for(n in mtx.dataset_names) {
				//dname = mtx.dataset_names[n];
				data[n][u] = mtx.unit_names[u][n];
			}
		}
		return data;
}



