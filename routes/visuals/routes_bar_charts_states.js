// bar_charts.js
var fpath = require('path');
var fs = require('fs');
var path = require('path');
var COMMON  = require('./routes_common');
var d3 = require("d3");
var xmldom = require('xmldom')



module.exports = {

		//
		//  CREATE BARCHARTS HTML
		//
		create_barcharts_html: function( ts, callback ) {
			//console.log(count_matrix)
			//path.join(__dirname, '/tmp/public')
			var infile = path.join(__dirname, '../../tmp/state_data.mtx');
			console.log('in STATES create_barcharts_html: '+infile)
			//var infile = 'http://localhost:3000/tmp/'+ts+'_count_matrix.biom';
			//fs.readFile(infile, 'utf8', function (err, json) {
  
  			var margin = {top: 20, right: 20, bottom: 30, left: 40},
				    width = 960 - margin.left - margin.right,
				    height = 500 - margin.top - margin.bottom;

				var x = d3.scale.ordinal()
				    .rangeRoundBands([0, width], .1);

				var y = d3.scale.linear()
				    .rangeRound([height, 0]);

				var color = d3.scale.ordinal()
				    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

				var xAxis = d3.svg.axis()
				    .scale(x)
				    .orient("bottom");

				var yAxis = d3.svg.axis()
				    .scale(y)
				    .orient("left")
				    .tickFormat(d3.format(".2s"));

				var svg = d3.select("body").append("svg")
				    .attr("width", width + margin.left + margin.right)
				    .attr("height", height + margin.top + margin.bottom)
				  .append("g")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				fs.readFile(infile, 'utf8', function (err, json) {
					
					data = d3.csv.parse(json)
				  console.log(data);
				  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "State"; }));

				  data.forEach(function(d) {
				    var y0 = 0;
				    
				    d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
				    d.total = d.ages[d.ages.length - 1].y1;
				    //console.log(d);
				  });

				  data.sort(function(a, b) { return b.total - a.total; });

				  x.domain(data.map(function(d) { return d.State; }));
				  y.domain([0, d3.max(data, function(d) { return d.total; })]);

				  svg.append("g")
				      .attr("class", "x axis")
				      .attr("transform", "translate(0," + height + ")")
				      .call(xAxis);

				  svg.append("g")
				      .attr("class", "y axis")
				      .call(yAxis)
				    .append("text")
				      .attr("transform", "rotate(-90)")
				      .attr("y", 6)
				      .attr("dy", ".71em")
				      .style("text-anchor", "end")
				      .text("Population");

				  var state = svg.selectAll(".state")
				      .data(data)
				    .enter().append("g")
				      .attr("class", "g")
				      .attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; });

				  state.selectAll("rect")
				      .data(function(d) { return d.ages; })
				    .enter().append("rect")
				      .attr("width", x.rangeBand())
				      .attr("y", function(d) { return y(d.y1); })
				      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
				      .style("fill", function(d) { return color(d.name); });

				  var legend = svg.selectAll(".legend")
				      .data(color.domain().slice().reverse())
				    .enter().append("g")
				      .attr("class", "legend")
				      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

				  legend.append("rect")
				      .attr("x", width - 18)
				      .attr("width", 18)
				      .attr("height", 18)
				      .style("fill", color);

				  legend.append("text")
				      .attr("x", width - 24)
				      .attr("y", 9)
				      .attr("dy", ".35em")
				      .style("text-anchor", "end")
				      .text(function(d) { return d; });


							  var svgGraph = d3.select('svg').attr('xmlns', 'http://www.w3.org/2000/svg');
								
								var svgXML = (new xmldom.XMLSerializer()).serializeToString( svgGraph[0][0] );
								//console.log(svgXML);
								console.log('returning');
								//return '<h1>start</h1>'+svgXML;
							//})
			//}
		});
			

	  } // end fxn


	 
} // end of module.exports
//
//
//
function create_svg_object(props, color, data) {

		  var svg = d3.select("body").append("svg")
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
				     .attr("dy", "1.4em") 
				     
				     
		  svg.append("g")
		      .attr("class", "x axis")
		      .call(props.xAxis)
		   	.append("text")
		      .attr("x", 500)
		      .attr("dy", ".8em")
		      .style("text-anchor", "end")
		      .text("Percent");
		 

		  var datasetName = svg.selectAll(".bar")
		      .data(data)
		    .enter().append("g")
		      .attr("class", "g")
		      .attr("transform", function(d) { return  "translate(0, " + props.y(d.DatasetName) + ")"; });

			//console.log('11')
		  
		  datasetName.selectAll("rect")
		      .data(function(d) { return d.unitObj; })
		    .enter().append("rect")
		      .attr("x", function(d) { return props.x(d.x0); })
		      .attr("y", 15)  // adjust where first bar starts on x-axis
		      .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
		      .attr("height",  18)
		   //    .attr("id",function(d) { 
		   //    	var cnt =  this._parentNode.__data__[d.name];
		   //    	var total = this._parentNode.__data__['total'];
		   //    	//console.log(this._parentNode.__data__['total']);
		   //    	var pct = (cnt * 100 / total).toFixed(2)
		   //     	return this._parentNode.__data__.DatasetName + '-|-' + d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
					// }) 
		      .attr("class","tooltip")
		      .style("fill",   function(d) { return color(d.name); });
		   
}

//
//
//
function get_image_properties(bar_height, ds_count) {
	var props = {};
	
	//props.margin = {top: 20, right: 20, bottom: 300, left: 50};
	props.margin = {top: 20, right: 100, bottom: 20, left: 300};
	//var width  = (ds_count * (bar_width + 5)) + 50 - margin.left - margin.right;
	//props.width  = (ds_count * (bar_width)) + 50;
	//props.height = 700 - props.margin.top - props.margin.bottom;
	var plot_width = 500;
	var gap = 2;  // gap on each side of bar
	props.width = plot_width + props.margin.left + props.margin.right
	props.height = (ds_count * (bar_height + 2 * gap)) + 125;
	//props.x = d3.scale.ordinal().rangeRoundBands([0, props.width], .1);
	//props.y = d3.scale.linear() .rangeRound([props.height, 0]);
	//console.log('1')
	props.x = d3.scale.linear() .rangeRound([0, plot_width]);
	//console.log('2')
	
	props.y = d3.scale.ordinal()
			.rangeBands([0, (bar_height + 2 * gap) * ds_count]);;
			//.rangeRoundBands([0, props.height], .1);
	//console.log('3')
	props.xAxis = d3.svg.axis()
			    .scale(props.x)
			    .orient("top");
	//console.log('4')
	props.yAxis = d3.svg.axis()
			    .scale(props.y)
			    .orient("left");
			    
			        
	return props;
}
//
//
//
function get_colors(unit_names){
	var colors = []
	for(var n in unit_names){
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



