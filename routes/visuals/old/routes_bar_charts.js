// bar_charts.js
var fpath = require('path');
var fs = require('fs');
var path = require('path');
var COMMON  = require('./routes_common');
var d3 = require("d3");
var xmldom = require('xmldom');



module.exports = {

		//
		//  CREATE BARCHARTS HTML
		//
		create_barcharts_html: function( timestamp, res, mtx ) {
							
			//var infile = path.join(__dirname, '../../tmp/'+ts+'_count_matrix.biom');
			//console.log('in create_barcharts_html: '+infile)
				//var infile = 'http://localhost:3000/tmp/'+ts+'_count_matrix.biom';
			//fs.readFile(infile, 'utf8', function (err, json) {
  			//mtx = JSON.parse(json);

	  		data = [];
				for (var o in mtx.columns){
	  			tmp={};
	  			tmp.DatasetName = mtx.columns[o].name;
	  			for (var t in mtx.rows){
	  				tmp[mtx.rows[t].name] = mtx.data[t][o];
	  			}
	  			data.push(tmp);
	  		}

  		
  			var unit_list = [];
        // TODO: "'o' is already defined."
  			for (var o in mtx.rows){
  				unit_list.push(mtx.rows[o].name);
  			}
  			

 				var ds_count = mtx.shape[1];			
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
			
				console.log(data);
		  	create_svg_object(props, color, timestamp, data);


			  var svgGraph = d3.select('svg').attr('xmlns', 'http://www.w3.org/2000/svg');
				//console.log(svgGraph[0][0]);
				var svgXML = (new xmldom.XMLSerializer()).serializeToString( svgGraph[0][0] );
				//console.log(svgXML);
				//return '<h1>start</h1>'+svgXML;
				html = "<div id='' class='center'>"+svgXML+"</div>";
				
				d3.select('svg').remove();
				return html;
			//})  // end readfile
			
			
	  } // end fxn

	 
}; // end of module.exports
//
//
//
function create_svg_object(props, color, timestamp, data) {

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
		    .attr("xlink:xlink:href",  function(d) { return 'piechart_single?ds='+d.DatasetName+'&ts='+timestamp;} );

		  datasetBar.selectAll("rect")
		 // 		.append("a")
		 //   .attr("xlink:href",  'http://www.google.com')
		      .data(function(d) { return d.unitObj; })
		    .enter()
		    .append("rect")
		      .attr("x", function(d) { return props.x(d.x0); })
		      .attr("y", 15)  // adjust where first bar starts on x-axis
		      .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
		      .attr("height",  18)
		      .attr("id",function(d) { 
		      	var cnt =  this._parentNode.__data__[d.name];
		      	var total = this._parentNode.__data__['total'];
		      	//console.log(this._parentNode.__data__['total']);
		      	var pct = (cnt * 100 / total).toFixed(2);
		       	return d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
		       	//return this._parentNode.__data__.DatasetName + '-|-' + d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
					}) 
		      .attr("class","tooltip")
		      .style("fill",   function(d) { return color(d.name); });

		   //rect.append("svg:a").attr("xlink:href",  'http://www.google.com')
		   
}

//
//
//
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
function get_colors(unit_names){
	var colors = [];
	for(var n in unit_names){
		//console.log(unit_names[n]);
		col=COMMON.string_to_color_code(unit_names[n]);
		//console.log(col);
		colors.push(col);
	}
	return colors;
}
//
//
//
function convert_matrix(mtx) {
		var data = [];
		for (var n in mtx.dataset_names) {
			data.push({'DatasetName': mtx.dataset_names[n]});	
		}
		for (var u in mtx.unit_names) {
			for (var k in mtx.dataset_names) {
				//dname = mtx.dataset_names[k];
				data[k][u] = mtx.unit_names[u][k];
			}
		}
		return data;
}



