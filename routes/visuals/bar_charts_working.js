// bar_charts.js
var path = require('path');
var fs = require('fs');
//var http = require('http');
var d3 = require("d3");
var jsdom = require('jsdom');

module.exports = {

		//
		//  CREATE BARCHARTS HTML
		//
		create_barcharts_html: function( ts, matrix, body ) {
			var outfile = '../../tmp/'+ts+'_barcharts.html';
			var ds_count = body.selection_obj.dataset_ids.length
			htmlStub = "<html><head><title>VAMPS BarCharts</title><link rel='stylesheet' type='text/css' href='/stylesheets/style.css'>";
			htmlStub += "<link rel='stylesheet' type='text/css' href='/stylesheets/tipsy.css'>";
			htmlStub += "</head><body>";
			htmlStub += "<div id='dataviz-container' class='center'></div>";
			htmlStub += "<script type='text/javascript' src='http://d3js.org/d3.v3.min.js'></script>";
			//htmlStub += "<script type='text/javascript' src='/javascripts/jquery-2.1.1.min.js'></script>";
			htmlStub += "<script type='text/javascript' src='http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js'></script>";
			htmlStub += "<script type='text/javascript' src='/javascripts/jquery.tipsy.js'></script>";
			
							// JQUERY MOUSEOVER
							 htmlStub += "<script type='text/javascript'> ";
							htmlStub += " $('.tip').tipsy({ ";
        			htmlStub += " gravity: 'w', ";
        			htmlStub += " html: true, ";
        			htmlStub += " title: function() {";
          		htmlStub += "		var items = this.id.split('---'); ";
          		htmlStub += "		var dname = items[0], uname = items[1], count= items[2]; ";
          		
          		//htmlStub += "		var txt = '<table>'; ";
          		//htmlStub += "		txt += '<tr>'; ";
          		htmlStub += "		var txt = dname+'<br>'; ";
          		htmlStub += "		txt += uname+'<br>'; ";
          		htmlStub += "		txt += 'count: '+count; ";
          		// htmlStub += "		txt += '</tr>'; ";
          		// htmlStub += "		txt += '<tr>'; ";
          		// htmlStub += "		txt += '<td>Taxa:</td><td>'+uname+'</td>'; ";
          		// htmlStub += "		txt += '</tr>'; ";
          		// htmlStub += "		txt += '<tr>'; ";
          		// htmlStub += "		txt += '<td>Count:</td><td>'+count+'</td>'; ";
          		// htmlStub += "		txt += '</tr>'; ";
          		// htmlStub += "		txt += '</table>'; ";
         			
         			htmlStub += "  	return txt ";
        			htmlStub += " }";
      				htmlStub += " });";
							// htmlStub += " $(document).ready(function() { ";
							// 							// Tooltip only Text
							// htmlStub += " $('.masterTooltip').hover(function(){ ";
				   //    									// Hover over code
				   //    htmlStub += " 		var title = $(this).attr('title'); ";
				   //    htmlStub += " 		$(this).data('tipText', title).removeAttr('title'); ";
				   //    htmlStub += " 		$('<p class='tooltip'></p>') ";
				   //    htmlStub += " 		.text(title) ";
				   //    htmlStub += " 		.appendTo('body') ";
				   //    htmlStub += " 		.fadeIn('slow'); ";
							// htmlStub += " }, function() { ";
				   //    									// Hover out code
				   //    htmlStub += " 		$(this).attr('title', $(this).data('tipText')); ";
				   //    htmlStub += " 		$('.tooltip').remove(); ";
							// htmlStub += " }).mousemove(function(e) { ";
				   //    htmlStub += " 		var mousex = e.pageX + 20;  ";//Get X coordinates
				   //    htmlStub += " 		var mousey = e.pageY + 10; "; //Get Y coordinates
				   //    htmlStub += " 		$('.tooltip') ";
				   //    htmlStub += " 		.css({ top: mousey, left: mousex }) ";
							// htmlStub += " }); ";
							// htmlStub += " }); ";
							 htmlStub += " </script> ";
			
			htmlStub += "</body></html>";

			var csv_file = path.resolve(__dirname, '../../tmp/'+ts+'_text_matrix.csv');
			//var html = '<h3>TEST</h3>';
			jsdom.env({ features : { QuerySelector : true }, html : htmlStub, done : function(errors, window) {
					
					
					
					var el = window.document.querySelector('#dataviz-container');
					var body = window.document.querySelector('body');
					var bar_width = 15;
					// process the html document, like if we were at client side
					var margin = {top: 20, right: 20, bottom: 300, left: 50};
					//var width  = (ds_count * (bar_width + 5)) + 50 - margin.left - margin.right;
					var width  = (ds_count * (bar_width)) + 50;
					var height = 700 - margin.top - margin.bottom;

					//var x = d3.scale.linear();
					var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
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

					var svg = d3.select(el).append("svg")
					    .attr("width",  width + margin.left + margin.right)
					    .attr("height", height + margin.top + margin.bottom)
					  .append("g")
					    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

					fs.readFile(csv_file, 'utf8', function (error, data) {
					//d3.csv(csv_file, function(error, data) {
						if(error){
							console.log(error)
						}else{

							data = d3.csv.parse(data);							

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
								console.log('x');
								tot = d.total
								d.unitObj.forEach(function(o) {
										console.log(o);
										o.y0 = (o.y0*100)/tot
										o.y1 = (o.y1*100)/tot
								});
							});
							
							var tooltip = d3.select(body)
									.append("div")
									.style("position", "absolute")
									.style("z-index", "10")
									.style("visibility", "hidden")
									.text("a simple tooltip");
							// sort by total count:
						 	// data.sort(function(a, b) { return b.total - a.total; });

						  // axis legends -- would like to rotate dataset names
						  x.domain(data.map(function(d) { return d.DatasetName; }));
						  //y.domain([0, d3.max(data, function(d) { return d.total; })]);
						  y.domain([0, 100]);
							svg.append("g")
						      .attr("class", "x axis")
						      .attr("transform", "translate(0," + height + ")")
						      .call(xAxis)
						      .selectAll("text")  
								     .style("text-anchor", "end")
								     .attr("dx", "-.8em")
								     .attr("dy", "1.4em")  // move the dataset name to the left
								     .attr("transform", function(d) {
								         return "rotate(-90)" 
								     });

						  svg.append("g")
						      .attr("class", "y axis")
						      .call(yAxis)
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
						      .attr("transform", function(d) { return "translate(" + x(d.DatasetName) + ",0)"; });

						  datasetName.selectAll("rect")
						      .data(function(d) { return d.unitObj; })
						    .enter().append("rect")
						      .attr("width", x.rangeBand())
						      .attr("id",function(d) { 
						      	return this._parentNode.__data__.DatasetName + '---'+d.name + '---'+this._parentNode.__data__[d.name].toString() // id of each rectangle should be datasetname---unitname---count
						      })  
						      .attr("y", function(d) { return y(d.y1); })
						      .attr("x", 25)  // adjust where first bar starts on x-axis
						      .attr("height",  function(d) { return y(d.y0) - y(d.y1); })
						      .attr("class","tip")
						      .style("fill",   function(d) { return color(d.name); });

						  //   var legend = svg.selectAll(".legend")
						  //     .data(color.domain().slice().reverse())
						  //   .enter().append("g")
						  //     .attr("class", "legend")
						  //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

						  // legend.append("rect")
						  //     .attr("x", width - 18)
						  //     .attr("width", 18)
						  //     .attr("height", 18)
						  //     .style("fill", color);

						  // legend.append("text")
						  //     .attr("x", width - 24)
						  //     .attr("y", 9)
						  //     .attr("dy", ".35em")
						  //     .style("text-anchor", "end")
						  //     .text(function(d) { return d; });

						  d3.select(el)
						  	.append("svg:svg")
						  	.attr('width', 600)
						  	.attr('height', 300)
						  	
				
						// add document html to var and write it to file
						var svgsrc = window.document.innerHTML

						fs.writeFile(path.resolve(__dirname, outfile), svgsrc, function(err) {
				      if(err) {
				        console.log('Could not write file: '+outfile+' Here is the error: '+err);
				      } else {
				        console.log("The file ("+outfile+") was saved!");
				      }
				    });
						} // end readCSV error
			    });



				}
			})





	  } // end fxn

}
