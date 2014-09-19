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
		create_piecharts_html: function( ts, html, user, res ) {
			var infile = path.join(__dirname, '../../tmp/'+ts+'_count_matrix.biom');
			console.log('in create_piecharts_html: '+infile)
			//var infile = 'http://localhost:3000/tmp/'+ts+'_count_matrix.biom';
			fs.readFile(infile, 'utf8', function (err, json) {
			mtx = JSON.parse(json);

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
  		for(var x in tmp) {
  			counts_per_ds.push(tmp[x]);
  		}
  		
			console.log(tmp);

  		var unit_list = [];
			for(o in mtx.rows){
				unit_list.push(mtx.rows[o].id);
			}
			var colors = get_colors(unit_list) ;
			var m = 20;
	    var r = 80; // five pies per row
	    var image_w = 900;
	    var image_h = (counts_per_ds.length / 5 ) * ( 4 * ( r + m ) )

			//var ds_count = mtx.shape[1];			
			//var bar_height = 15;
			//var props = get_image_properties(bar_height, ds_count);	
			//console.log(props)
			//var color = d3.scale.ordinal()									
		  //  .range( get_colors(unit_list) );
		  
		  console.log(unit_list)
		  console.log(colors);
		  
			var arc = d3.svg.arc()
                .innerRadius(r / 2)
                .outerRadius(r);

			var pie = d3.layout.pie();
				   

			//var counts_per_ds = [[100,20,5],[20,20,20]];
			var xml ='';
			//for(i in counts_per_ds){
				var svgContainer = d3.select("body").append("svg")
                                  .attr("width",image_w)
                                  .attr("height",image_h);
			
			var pies = 	svgContainer.selectAll("div")
			//var svg = d3.select("body").selectAll("svg")
			    .data(counts_per_ds)
			  .enter().append("g")
			    //.attr("transform", "translate(" + (r + m) + "," + (r + m) + ")");
			    .attr("transform", function(d, i){
			    		//console.log(i);
			    		var modulo_i = i+1;
			    		var d = r+m;
			    		//var spacer = d * i * 2
			    		//if((modulo_i % 5) === 0) {
			    		var h_spacer = d*2*(i % 4);
			    		var v_spacer = 1;
			    		var row = Math.floor(i/4);
			    		var v_spacer = d*2*row;
			    		
			    		//console.log(v_spacer)
			    		//}
			    		if((modulo_i % 5) === 0) {
			    			//console.log('=== 0');
			    			// reset h_spacer 
			    			
			    			return "translate(" + (d + h_spacer)+ "," + (d + v_spacer) + ")"
			    		}else{

			    			//console.log('not== 0');

			    			return "translate(" + (d + h_spacer) + "," + (d + v_spacer) + ")"


			    			
			    		}
			    });

			// The data for each svg:svg element is a row of numbers (an array). We pass
			// that to d3.layout.pie to compute the angles for each arc. These start and end
			// angles are passed to d3.svg.arc to draw arcs! Note that the arc radius is
			// specified on the arc, not the layout.
			pies.selectAll("path")
			    .data(d3.layout.pie())
			  .enter().append("path")
			    .attr("d", d3.svg.arc()
			    .innerRadius(r / 2)
			    .outerRadius(r))
			    .attr("id",function(d,i) { 
		      	//var cnt =  this._parentNode.__data__[d.name];
		      	//var total = this._parentNode.__data__['total'];
		      	console.log(d);
		      	console.log(i);
		      	//var pct = (cnt * 100 / total).toFixed(2)
		       	return mtx.columns[i].id;    // ip of each rectangle should be datasetname-|-unitname-|-count
		       	//return this._parentNode.__data__.DatasetName + '-|-' + d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
					}) 
		      .attr("class","tooltip")
			    .style("fill", function(d, i) { 
			    	//console.log(d);
			    	return colors[i]; 
			    });


//console.log(svg.node());
		//console.log((new xmldom.XMLSerializer()).serializeToString(d3.select('svg')));

				  	var svgGraph = d3.selectAll('svg').attr('xmlns', 'http://www.w3.org/2000/svg');
						
						//console.log(svgGraph[0]);
						
						//console.log(svgGraph[0][0]);
						var svgXML = (new xmldom.XMLSerializer()).serializeToString( svgGraph[0][0] );
						xml += svgXML;
						svg=null
				//}
//

//console.log(xml)
				//return '<h1>start</h1>'+svgXML;
				html = html + "<div id='' class='svg_div'>"+svgXML+"</div>"
				res.render('visuals/user_data/piecharts', {
          //title: req.params.title   || 'default_title',
          timestamp: ts || 'default_timestamp',
          html : xml,
          user: user
       	});

				//d3.select('svg').remove();


		}); // end readfile


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
