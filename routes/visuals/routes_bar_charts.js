// bar_charts.js
var fpath = require('path');
var fs = require('fs');
var COMMON  = require('./routes_common');

//var jsdom = require('jsdom');


module.exports = {

		//
		//  CREATE BARCHARTS HTML
		//
		create_barcharts_html: function( ts, count_matrix, body ) {
			var d3 = require("d3");
			var xmldom = require('xmldom')
			var outfile = '../../tmp/'+ts+'_barcharts.html';
			var ds_count = body.selection_obj.dataset_ids.length
			console.log(outfile)
			
			console.log('start matrix');
			console.log( count_matrix);
			console.log('end matrix');
			
			var data = [];
			for(n in count_matrix.dataset_names) {
				data.push({'DatasetName': count_matrix.dataset_names[n]});	
			}
			for(u in count_matrix.unit_names) {
				for(n in count_matrix.dataset_names) {
					dname = count_matrix.dataset_names[n];
					data[n][u] = count_matrix.unit_names[u][n];
				}
			}

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

			    // TODO:  More Colors
			var color = d3.scale.ordinal()									
			    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
			    // var level = 1
			    // level += 1
			    //var hex = level.toString(16);
			    // color = '#FFFF' + hex + hex
			    //
			    // $string2 =  str_pad(dechex(crc32($string1)), 8, '0', STR_PAD_LEFT) ;
					// $string3 = substr($string2,2,6);
					// return $string3;
			var test_color = COMMON.string_to_color_code('Bacteria;Protobacteria');
			var xAxis = d3.svg.axis()
			    .scale(x)
			    .orient("bottom");

			var yAxis = d3.svg.axis()
			    .scale(y)
			    .orient("left")
			    .tickFormat(d3.format(".2s"));

			var svg = d3.select("body").append("svg")
			    .attr("width",  width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			 
			

			// start matrix
			// { dataset_names: 
			//    [ 'SLM_NIH_Bv4v5--03_Junction_City_East',
			//      'SLM_NIH_Bv4v5--02_Spencer',
			//      'SLM_NIH_Bv4v5--01_Boonville' ],
			//   unit_names: 
			//    { 'Bacteria;Proteobacteria': [ 4, 2, 4 ],
			//      'Bacteria;Bacteroidetes': [ 272, 401, 430 ] } }
			// end matrix	
			//	CREATE:
			// start data
			// [ { DatasetName: 'SLM_NIH_Bv4v5--03_Junction_City_East',
			//     'Bacteria;Proteobacteria': '4',
			//     'Bacteria;Bacteroidetes': '272' },
			//   { DatasetName: 'SLM_NIH_Bv4v5--02_Spencer',
			//     'Bacteria;Proteobacteria': '2',
			//     'Bacteria;Bacteroidetes': '401' },
			//   { DatasetName: 'SLM_NIH_Bv4v5--01_Boonville',
			//     'Bacteria;Proteobacteria': '4',
			//     'Bacteria;Bacteroidetes': '430' } ]
			// end data
			
	
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
				//console.log('x');
				tot = d.total
				d.unitObj.forEach(function(o) {
						//console.log(o);
						o.y0 = (o.y0*100)/tot
						o.y1 = (o.y1*100)/tot
				});
			});
			
			var tooltip = d3.select("body")
				.append("div")
				.style("position", "absolute")
				.style("z-index", "10")
				.style("visibility", "hidden")
				.text( "a simple tooltip");
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
		      

		console.log('start data')
		console.log(data)
		console.log('end data') 
		
		// get a reference to our SVG object and add the SVG NS
		var svgGraph = d3.select('svg').attr('xmlns', 'http://www.w3.org/2000/svg');
		//console.log(svgGraph[0][0]);
		var svgXML = (new xmldom.XMLSerializer()).serializeToString( svgGraph[0][0] );
		
		console.log(svgXML)
		
		fs.writeFile( fpath.resolve(__dirname, outfile), svgXML, function(err) {
				      if(err) {
				        console.log('Could not write file: '+outfile+' Here is the error: '+err);
				      } else {
				        console.log("The file ("+outfile+") was saved!");
				      }
				      d3.select('svg').remove();

		});
		





	  } // end fxn


	 
} // end of module.exports
