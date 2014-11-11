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


		create_pcoa_graphs: function(matrix) {

					var svgGraph ='';

			
			//fs.readFile(metadata_filename, 'utf8', function (err, data) {
  		//		 var mdata = d3.tsv.parse(data);
  		//		 console.log(mdata)
  				var mdata_name_value_lookup = {};
  				var mdata_name_ds_lookup = {};
  				for(var m in metadata) {
  					var ds = metadata[m]['project_dataset'];
  					for(var name in metadata[m]) {
  						if(name !== 'project_dataset') {
  							//console.log(metadata[m][item]);
  							var value = metadata[m][name];
								//console.log(name)  
								// mdata_name_value_lookup							
  							if(name in mdata_name_value_lookup) {
  								if(value in mdata_name_value_lookup[name]){
  									mdata_name_value_lookup[name][value].push(ds);
  								}else {
  									mdata_name_value_lookup[name][value] = [ds];
  								}
  							}else {
  								mdata_name_value_lookup[name] = {};
  								mdata_name_value_lookup[name][value] = [ds];
  							}
  							// mdata_vals is for the tool tip
  							if(name in mdata_name_ds_lookup) {
  								mdata_name_ds_lookup[name][ds] = value;  								
  							}else {  	  								
  								mdata_name_ds_lookup[name] = {};
  								mdata_name_ds_lookup[name][ds] = value;
  							}
  						
  						}
  					}
  				}
  				//console.log(mdata_vals);
  				var p=d3.scale.category20();
					var colors = p.range(); // ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
                      // "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
  				var mdata_colors = {};
  				mdata_colors_by_val = {};
  				//mdata_colors[name]['HMP_204_Bv4v5--204_10_GG_26Jan12_H'] = '#ababab';
  				for(var mname in mdata_name_value_lookup) {
  					mdata_colors[mname] = {};
  					mdata_colors_by_val[mname] = {};
  					c = 0;
  					for(var val in mdata_name_value_lookup[mname]){
  						
  						for(var d in mdata_name_value_lookup[mname][val]){
  							ds = mdata_name_value_lookup[mname][val][d];
                //TODO: 'ds' used out of scope
  							mdata_colors[mname][ds] = colors[c];
  							mdata_colors_by_val[mname][val] = colors[c];
  						}
  						// if(mname in mdata_colors_by_val) {
  							
  						// 		mdata_colors_by_val[mname][val] = colors[c];
  							
  							
  						// }else {
  						// 	mdata_colors_by_val[mname]={};
  							
  						// }
  						c += 1;
  					}
  				}
  				//console.log(metadata)
  				//console.log(mdata_name_value_lookup)
					//console.log(mdata_colors_by_val);
					var metadata_count = Object.keys(mdata_name_value_lookup).length;
					// size and margins for the chart
					var margin = {top: 20, right: 25, bottom: 50, left: 60};
					var img_width = 1100;
					var img_height = 320 * metadata_count;
					var base_chart_size = 300;
					var chart_width  = base_chart_size - margin.left - margin.right;
					var chart_height = base_chart_size - margin.top  - margin.bottom;
					// add the tooltip area to the webpage
					
					var x = d3.scale.linear()
		          .domain([-1, 1])  					// the range of the values to plot
		          .range([ 0, chart_width ]);        // the pixel range of the x-axis

					var y = d3.scale.linear()
		          .domain([-1, 1])
		          .range([ chart_height, 0 ]);

		      var vectors = [ ['P1','P2'], ['P1','P3'], ['P2','P3'] ];
		      var svgContainer = d3.select("body")
		      				.append("svg")
		              .attr('width', img_width)
									.attr('height', img_height);


					var md_count = 0;			
					for(var mdata_name in mdata_name_value_lookup)	{	 
            // var mdata_name = m;
						//var colors_needed = Object.keys(mdata[m]).length;
						
						//var mdata_colors = default_colors.slice(0,colors_needed);
						//console.log(mdata_colors)

						for(var v in vectors) {
			      		
			      		xdata = matrix[vectors[v][0]];
								ydata = matrix[vectors[v][1]];
								//console.log('ydata '+ydata.toString())
								//var chart = 'chart'+v.toString();
								var chart_tx = base_chart_size;
						    var chart_ty = base_chart_size; 
									// the main object where the chart and axis will be drawn
								var chart = svgContainer.append('g')
									.attr('transform', 'translate(' + (margin.left + (v * chart_tx)) + ',' + (margin.top + (md_count * chart_ty)) + ')')
									.attr('width', chart_width)
									.attr('height', chart_height)
									.attr('class', 'main');

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
                    // TODO: functions made inside a loop are slow
									      .attr("cy", function (d) { return y(d); } ) // translate y value to a pixel
									      .attr("cx", function (d,i) { return x(xdata[i]); } ) // translate x value
									      .attr("r", function (d,i) { 
									      	//console.log(mdata_name_ds_lookup[mdata_name][matrix.names[i]])
									      	if(mdata_name_ds_lookup[mdata_name][matrix.names[i]] === undefined){  // don't show undefined data
									      		return 0;
									      	}else{
									      		return 2;
									      	}									      
									      } ) // radius of circle
									      //.style("opacity", 0.6) // opacity of circle
									      .attr("id",function(d,i) {
									      		var ret_str = matrix.names[i]+'-|-'+mdata_name+'-|-'+mdata_name_ds_lookup[mdata_name][matrix.names[i]];
									      		
									      		return ret_str;    // ip of each dot should be ds -|- metadataname -|- metadatavalue									       	
												}) 
											  .attr("class","tooltip")
									      .style("fill", function(d,i){
									      	ds = matrix.names[i];
									      	return mdata_colors[mdata_name][ds];
									      });
									      

									

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
				    					.text('metadata name: '+mdata_name);     
								  }

								  if(v == 2 && Object.keys(mdata_name_value_lookup[mdata_name]).length <= 14) {
								  	// add legend to right hand graph
										var legend = g.append("g")
										  .attr("class", "legend")
										  .attr("x", chart_width - 5)
										  .attr("y", 15)
										  .attr("height", chart_height)
										  .attr("width", 100);
										  // mdata_name
										legend.selectAll('g').data( Object.keys(mdata_name_value_lookup[mdata_name]) )
									      .enter()
									      .append('g')
									      .each(function(d, i) {
									        var g = d3.select(this);
									        g.append("rect")
									          .attr("x", chart_width)
									          .attr("y", i*15)
									          .attr("width", 7)
									          .attr("height", 7)
									          .style("fill", mdata_colors_by_val[mdata_name][d]);
									        
									        g.append("text")
									          .attr("x", chart_width + 10)
									          .attr("y", i * 15 + 8)
									          .attr("height",30)
									          .attr("width",100)
									          .style("fill", mdata_colors_by_val[mdata_name][d])
									          .text(d);

									      });
								  }

								  
									
						}	
					md_count += 1;
					}						


					d3.selectAll('.axis line, .axis path')
     				.style({'stroke': 'Black', 'fill': 'none', 'stroke-width': '1px'});

					
					svgGraph = d3.selectAll('svg').attr('xmlns', 'http://www.w3.org/2000/svg');
					
						
					//console.log(svgGraph[0][0]);
					
					var svgXML = (new xmldom.XMLSerializer()).serializeToString( svgGraph[0][0] );
					//console.log(svgXML);
					//var html = "<div id='' class='chart_div center_table'>"+svgXML+"</div>";
					var html = "<div id='' class='pcoa_chart_div center_table'>"+svgXML+"</div>";
					d3.select('svg').remove();
					return html;
			//})
		}

}
