var path = require('path');
var fs = require('fs');
var d3 = require("d3");
var xmldom = require('xmldom');
var COMMON  = require('./routes_common');

// # 	for line in csv.reader(tsv, dialect="excel-tab"):
// 	# 		print line
// 	# 		if line_count == 0:
// 	# 			names = line[1:]				
// 	# 			for i in names:
// 	# 				metadata[i] = {}
// 	# 		else:
// 	# 			ds = line[0]
// 	# 			for i,item in enumerate(line):					
// 	# 				if i>0:
// 	# 					if item in metadata[names[i-1]]:
// 	# 						metadata[names[i-1]][item].append(ds)
// 	# 					else:
// 	# 						metadata[names[i-1]][item] =[ds]
						
// # {'density': {'novalue': [ds1,ds2,ds3], '1026.45':[ds4,ds5] },
// #  'envo_material': {'ocean water':[ds1,ds2,ds3,ds4,ds5,ds12,ds13], 'lake water': [ds6,ds7,ds8,ds9,ds11]}
// #  }

module.exports = {


		create_pcoa_graphs: function(matrix, metadata_filename) {
			console.log('in pcoa')
			console.log(typeof(matrix))
			//console.log(metadata_filename)
			var svgGraph ='';
			//console.log(metadata)
			//fs.readFile(metadata_filename, 'utf8', function (err, data) {
  		//		 var mdata = d3.tsv.parse(data);
  		//		 console.log(mdata)
  				mdata = {};
  				for(m in metadata) {
  					var ds = metadata[m]['project_dataset'];
  					for(name in metadata[m]) {
  						if(name !== 'project_dataset') {
  							//console.log(metadata[m][item]);
  							var value = metadata[m][name];
								//console.log(name)  							
  							if(name in mdata) {
  								if(value in mdata[name]){
  									mdata[name][value].push(ds);
  								}else {
  									mdata[name][value] = [ds];
  								}
  							}else {
  								mdata[name] = {};
  								mdata[name][value] = [ds];
  							}  							
  						}
  					}
  				}	

					console.log(mdata);
					var metadata_count = Object.keys(mdata).length;
					// size and margins for the chart
					var margin = {top: 20, right: 15, bottom: 50, left: 60};
					var img_width = 900;
					var img_height = 320 * metadata_count;
					var base_chart_size = 300;
					var chart_width  = base_chart_size - margin.left - margin.right;
					var chart_height = base_chart_size - margin.top  - margin.bottom;
					var colors = ['#1111ff','#3333ff','#5555ff','#7777ff','#9999ff','#aaaaff','#ccccff','#ddeeee','#eeeedd','#ffdddd','#ffbbbb','#ff9999','#ff7777','#ff5555','#ff3333','#ff0000'];
					var x = d3.scale.linear()
		          .domain([-1, 1])  // the range of the values to plot
		          .range([ 0, chart_width ]);        // the pixel range of the x-axis

					var y = d3.scale.linear()
		          .domain([-1, 1])
		          .range([ chart_height, 0 ]);

		      //var vectors = ['v1','v2','v3'];
		      var vectors = [ ['v1','v2'], ['v1','v3'], ['v2','v3'] ];
		      var svgContainer = d3.select("body")
		      				.append("svg")
		              .attr('width', img_width)
									.attr('height', img_height);


					var md_count = 0;			
					for(m in mdata)	{	 
						var mdata_name = m;
						console.log(mdata_name);
						for(v in vectors) {
			      		console.log(v)
			      		xdata = matrix[vectors[v][0]];
								ydata = matrix[vectors[v][1]];
								//var chart = 'chart'+v.toString();
								var chart_tx = base_chart_size;
						    var chart_ty = base_chart_size; 
									// the main object where the chart and axis will be drawn
								var chart = svgContainer.append('g')
									.attr('transform', 'translate(' + (margin.left + (v * chart_tx)) + ',' + (margin.top + (md_count * chart_ty)) + ')')
									.attr('width', chart_width)
									.attr('height', chart_height)
									.attr('class', 'main')   

									// draw the x axis
								var xAxis = d3.svg.axis()
									.scale(x)
									.orient('bottom').ticks(5);

								chart.append('g')
									.attr('transform', 'translate(0,' + chart_height + ')')
									.attr('class', 'main axis date')
									.call(xAxis);

									// draw the y axis
								var yAxis = d3.svg.axis()
									.scale(y)
									.orient('left').ticks(5);

								chart.append('g')
									.attr('transform', 'translate(0,0)')
									.attr('class', 'main axis date')
									.call(yAxis);

									// draw the graph object
									var g = chart.append("g"); 

									g.selectAll("scatter-dots")
									  .data(ydata)  // using the values in the ydata array
									  .enter().append("circle")  // create a new circle for each value
									      .attr("cy", function (d) { return y(d); } ) // translate y value to a pixel
									      .attr("cx", function (d,i) { return x(xdata[i]); } ) // translate x value
									      .attr("r", 2) // radius of circle
									      .style("opacity", 0.6); // opacity of circle
									
									g.append('text')
										.attr('class', 'x label')
										.attr('text-anchor','end')
										.attr("x", chart_width / 2)
			    					.attr("y", chart_height + 30)
			    					.text(vectors[v][0]);      

			    				g.append("text")
			    					.attr('class', 'y label')
								    .attr("transform", "rotate(-90)")
								    .attr("y", 0 - margin.left)
								    .attr("x",0 - (chart_height / 2))
								    .attr("dy", "1em")
								    .style("text-anchor", "middle")
								    .text(vectors[v][1]);
								  if(v == 1){
								  	g.append('text')					
											.attr('text-anchor','middle')
											.attr("x", chart_width / 2)
				    					.attr("y", 0 )
				    					.style("font-size", "12px") 
	        						.style("text-decoration", "underline")  
				    					.text(mdata_name);     
								  }
									
						}	
					md_count += 1;
					}						

					d3.selectAll('.axis line, .axis path')
     				.style({'stroke': 'Black', 'fill': 'none', 'stroke-width': '1px'});


					svgGraph = d3.selectAll('svg').attr('xmlns', 'http://www.w3.org/2000/svg');
					//console.log(svgGraph[0]);
						
					//console.log(svgGraph[0][0]);
					
					var svgXML = (new xmldom.XMLSerializer()).serializeToString( svgGraph[0][0] );
					//console.log(svgXML);
					var html = "<div id='' class='chart_div center_table'>"+svgXML+"</div>";
			
					d3.select('svg').remove();
					return html;
			//})
		}

}
