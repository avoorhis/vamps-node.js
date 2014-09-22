var fpath = require('path');
var fs = require('fs');
var path = require('path');
var COMMON  = require('./routes_common');
var d3 = require("d3");
var xmldom = require('xmldom')


module.exports = {

		//
		//  CREATE PIECHARTS HTML
		//
		create_piecharts_html: function( ts, html, user, res, mtx ) {
			

  		var counts_per_ds = [];
  		var tmp={};
  		for(var i in mtx.columns){
  			tmp[mtx.columns[i].id]=[] // datasets
  		}
			for(var x in mtx.data){
  			for(var i in mtx.columns){
  				tmp[mtx.columns[i].id].push(mtx.data[x][i]);
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
  		
			console.log(myjson_obj);

  		var unit_list = [];
			for(o in mtx.rows){
				unit_list.push(mtx.rows[o].id);
			}
			var colors = get_colors(unit_list) ;
			var pies_per_row = 4
			var m = 20;  // margin
	    var r = 320/pies_per_row; // five pies per row
	    var image_w = 2*(r+m)*pies_per_row;
	    
	    var image_h = Math.ceil(counts_per_ds.length / 4 ) * ( 2 * ( r + m ) )+ 30

			//var ds_count = mtx.shape[1];			
			//var bar_height = 15;
			//var props = get_image_properties(bar_height, ds_count);	
			//console.log(props)
			//var color = d3.scale.ordinal()									
		  //  .range( get_colors(unit_list) );
		  
		  //console.log(unit_list)
		  //console.log(colors);
		  
			var arc = d3.svg.arc()
                .innerRadius(r / 2)
                .outerRadius(r);

			var pie = d3.layout.pie();
				   

			//var counts_per_ds = [[100,20,5],[20,20,20]];
			
			//for(i in counts_per_ds){
			var svgContainer = d3.select("body").append("svg")
                                  .attr("width",image_w)
                                  .attr("height",image_h)
			
			var pies = 	svgContainer.selectAll("svg")
			//var svg = d3.select("body").selectAll("svg")
			    .data(myjson_obj.values)

			  .enter().append("g")
			    //.attr("transform", "translate(" + (r + m) + "," + (r + m) + ")");
			    .attr("transform", function(d, i){
			    		//console.log(i);
			    		var modulo_i = i+1;
			    		var d = r+m;
			    		var h_spacer = d*2*(i % pies_per_row);
			    		var v_spacer = d*2*Math.floor(i / pies_per_row);			    					    		
			    		return "translate(" + (d + h_spacer) + "," + (d + v_spacer) + ")";					    	

			    });

			
			pies.selectAll("path")
			    .data(d3.layout.pie())
			  .enter().append("path")
			    .attr("d", d3.svg.arc()
			    .innerRadius(r / 2)
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
			  	.text(function(d, i) {
			  		//console.log('xxy');
			  		//console.log(d);
			  		return d;
			  	})
					//console.log(svg.node());
					//console.log((new xmldom.XMLSerializer()).serializeToString(d3.select('svg')));

				  var svgGraph = d3.selectAll('svg').attr('xmlns', 'http://www.w3.org/2000/svg');
						
					//console.log(svgGraph[0]);
						
					//console.log(svgGraph[0][0]);
					
					var svgXML = (new xmldom.XMLSerializer()).serializeToString( svgGraph[0][0] );
					html = html + svgXML;
						
				//}
//

//console.log(xml)
				//return '<h1>start</h1>'+svgXML;
				
				res.render('visuals/user_data/piecharts', {
          //title: req.params.title   || 'default_title',
          timestamp: ts || 'default_timestamp',
          html : html,
          user: user
       	});

				d3.select('svg').remove();


		//}); // end readfile


	  } // end fxn

}

//
//
//
function get_colors(unit_names){
	var colors = []
	for(var n in unit_names){
		//console.log(unit_names[n])
		col=COMMON.string_to_color_code(unit_names[n])
		//console.log(col)
		colors.push(col);
	}
	return colors;
}
