var fpath = require('path');
var fs = require('fs');
var path = require('path');
var COMMON  = require('./routes_common');
var d3 = require("d3");
var xmldom = require('xmldom');


module.exports = {

		//
		//  CREATE PIECHARTS HTML
		//
		create_piecharts_html: function( timestamp, res, mtx ) {
			

  		var counts_per_ds = [];
  		var tmp={};
  		for(var i in mtx.columns){
  			tmp[mtx.columns[i].name]=[]; // datasets
  		}
			for(var x in mtx.data){
  			for(var i in mtx.columns){
  				tmp[mtx.columns[i].name].push(mtx.data[x][i]);
  			}  			
  		}
  		var myjson_obj={};
  		myjson_obj.names=[];
  		myjson_obj.values=[];
  		for(var x in tmp) {
  			counts_per_ds.push(tmp[x]);
  			myjson_obj.names.push(x);
  			myjson_obj.values.push(tmp[x]);
  		}
  		
			//console.log(myjson_obj);

  		var unit_list = [];
			for(o in mtx.rows){
				unit_list.push(mtx.rows[o].name);
			}
			var colors = get_colors(unit_list);
			var pies_per_row = 6;
			//iw = 800
			var image_w = 800;
			var m = 20;  // margin
			//var r = 320/pies_per_row; // 4 ppr
			var r = (((image_w - m)/pies_per_row) - (2*m)) / 2
	    //var r = 280/pies_per_row; // radius: 6 ppr
	    //var r = 240/pies_per_row; // radius: 8 ppr
	    //var image_w = ((m+(2*r))*pies_per_row)+m
	    //var image_w = 2*(r+m)*pies_per_row;
	    
	    var image_h = Math.ceil(counts_per_ds.length / 4 ) * ( 2 * ( r + m ) )+ 30;

		  
			var arc = d3.svg.arc()
                .innerRadius(r / 2)
                .outerRadius(r);

			var pie = d3.layout.pie();
				   
			var svgContainer = d3.select("body").append("svg")
                                  .attr("width",image_w)
                                  .attr("height",image_h);
			
			var pies = 	svgContainer.selectAll("svg")
			//var svg = d3.select("body").selectAll("svg")
			    .data(myjson_obj.values)

			  .enter().append("g")			    
			    .attr("transform", function(d, i){
			    		//console.log(i);
			    		var modulo_i = i+1;
			    		var d = r+m;
			    		var h_spacer = d*2*(i % pies_per_row);
			    		var v_spacer = d*2*Math.floor(i / pies_per_row);			    					    		
			    		return "translate(" + (d + h_spacer) + "," + (d + v_spacer) + ")";	
			    })
				.append("a")

		    	.attr("xlink:xlink:href",  function(d,i) { return 'piechart_single?ds='+myjson_obj.names[i]+'&ts='+timestamp;} );
			

			pies.selectAll("path")
			    //.data(d3.layout.pie().sort(null))
			    .data(d3.layout.pie())
			  .enter().append("path")
			    .attr("d", d3.svg.arc()
			    .innerRadius(0)
			    .outerRadius(r))
			    .attr("id",function(d,i) { 
		      	var cnt =  d.value;
		      	//var total = this._parentNode.__data__['total'];
		      	
		      	var total = 0;
		      	for(k in this._parentNode.__data__){
		      		total += this._parentNode.__data__[k];
		      	}
		      	//console.log(this._parentNode);
		      	var pct = (cnt * 100 / total).toFixed(2);
		       	return unit_list[i]+'-|-'+cnt.toString()+'-|-'+pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
		       	//return this._parentNode.__data__.DatasetName + '-|-' + d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
					}) 
		      .attr("class","tooltip")
			    .style("fill", function(d, i) { 
			    	//console.log(d);
			    	return colors[i]; 
			    });

			  // add dataset text
			  d3.selectAll("g")
			  	.data(myjson_obj.names)
			  	
			  	.append("text")
			  	.attr("dx", -(r+m))
			  	.attr("dy", r+m)			  	
        	.attr("text-anchor", "left")
        	.attr("font-size","9px")
        	.append('tspan')
			  	.text(function(d, i) {
			  		s = d.split('--')
			  		return 'Project: '+s[0];
			  	})
			  	.append('tspan')
			  	.text(function(d, i) {
			  		//console.log('xxy');
			  		//console.log(d);
			  		s = d.split('--')
			  		return 'Dataset: '+s[1];
			  	}).attr('x', '-60').attr('dy', '15')

			  	 
					//console.log(svg.node());
					//console.log((new xmldom.XMLSerializer()).serializeToString(d3.select('svg')));

				  var svgGraph = d3.selectAll('svg').attr('xmlns', 'http://www.w3.org/2000/svg');
						
					//console.log(svgGraph[0]);
						
					//console.log(svgGraph[0][0]);
					
					var svgXML = (new xmldom.XMLSerializer()).serializeToString( svgGraph[0][0] );
					//console.log(svgXML);
					var html = "<div id='' class='chart_div center_table'>"+svgXML+"</div>";
			

				d3.select('svg').remove();
				return html;


	  }, // end fxn
	  //
	  // SINGLE PIE
	  //
	  create_single_piechart_html: function( ts, ds_name, res ) {

	  		var ds_index = chosen_id_name_hash.names.indexOf(ds_name);
	  		console.log(ds_index)
	  		var data = [];

	  		var unit_list = [];
	  		var total = 0;
	  		for(i in biom_matrix.data){
	  			data.push(biom_matrix.data[i][ds_index]);
	  			total += biom_matrix.data[i][ds_index];
	  			//data.push({name: biom_matrix.rows[i].name, cnt: biom_matrix.data[i][ds_index]});
	  			unit_list.push(biom_matrix.rows[i].name);
	  		}
	  		console.log(data);
				var width = 800,
    			height = 500,
    			radius = Math.min(width, height) / 2;
				var colors = get_colors(unit_list);
	  		//console.log(colors);

	  		var arc = d3.svg.arc()
    			.outerRadius(radius - 10)
    			.innerRadius(0);

				var pie = d3.layout.pie()
    			//.sort()
    			.value(function(d) { return d; });

    		var svg = d3.select("body").append("svg")
				    .attr("width", width)
				    .attr("height", height)
				  .append("g")
				    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");				

				var g = svg.selectAll(".arc")
				      .data(pie(data))
				    .enter().append("g")
				      .attr("class", "arc")
				     .attr("id",function(d,i) { 
		      	var cnt =  d.value;
		      	//var total = this._parentNode.__data__['total'];
		      	
		      	//console.log(this._parentNode);
		      	var pct = (cnt * 100 / total).toFixed(2);
		       	return unit_list[i]+'-|-'+cnt.toString()+'-|-'+pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
		       	//return this._parentNode.__data__.DatasetName + '-|-' + d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
					}) 
		      .attr("class","tooltip")

				g.append("path")
				      .attr("d", arc)
				      .style("fill", function(d,i) { return colors[i]; });

				var svgGraph = d3.selectAll('svg').attr('xmlns', 'http://www.w3.org/2000/svg');
					
				var svgXML = (new xmldom.XMLSerializer()).serializeToString( svgGraph[0][0] );
					
				var html = "<div id='' class='chart_div center_table'>"+svgXML+"</div>";
			
				d3.select('svg').remove();
				return html;

		}

};

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
