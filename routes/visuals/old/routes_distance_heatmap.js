// distance_heatmap.js
var path = require('path');
var fs = require('fs');


var COMMON  = require('./routes_common');
var C = require('../../public/constants');

module.exports = {
		
		//
		//  CREATE DISTANCE MATRIX
		//
		// create_distance_matrix: function (outstr) {
		// 	//console.log('stderr: ' + stderr);
	 //    raw_distance_array = outstr.toString().split('\n');
	 //    //console.log('distance array (stdout):')
	 //    //console.log(outstr);
	 //    var distance_matrix = {};
	 //    // distance_matrix[ds1][ds2] = 2
	 //    var dcolnames = raw_distance_array[0].trim().split("\t");
	 //    //console.log('dcolnames:  '+dcolnames)
	 //    //distance_matrix[dcolname] = {};
	 //    //distance_matrix[dcolname][dcolname] = 0;
	 //    //console.log(dcolname);
	 //    for(n in dcolnames) {
	 //    	distance_matrix[dcolnames[n]] = {};
	 //    }
	 //    for(n in raw_distance_array){
	 //    	//console.log(raw_distance_array[n])	    	
	    	
	 //      if( ! raw_distance_array[n].trim() ) { continue; } // skip blank lines
	 //      if( n == 0 ) { continue; }   						// skip header
	 //      var items = raw_distance_array[n].trim().split("\t");
	 //      //console.log('i  '+items)
		//   var ds = items.shift();  // remove and return dataset
		//   //console.log('ds  '+ds)
	 //      for(i in items){     	
	 //      	distance_matrix[ds][dcolnames[i]] = items[i];	      
	 //      }	      

	 //    } // end for row in raw...
	 //    //console.log(distance_matrix)
	 //    return distance_matrix;
		// },

		//
		//  CREATE HTML
		//	
// 		create_hm_html: function (dm) {
//
//
// 		    //console.log(dm);
// 		    var html = '';
//
// 		    //html += "<div class='' id='distance_heatmap_div center_table' >";
// 		    html += "<form name='save_ds_order_form' id='' class='' method='POST' action='/hm_save_order'>";
// 			html += "<table border='1' id='drag_table' class='heatmap_table center_table' >";
// 		    html += "<tr class='nodrag nodrop' ><td></td><td>";
// 		    html += "<div class='blue'>xSimilar</div>";
// 		    html += "<div class='red'>Dissimilar</div>";
// 		    html += "<div id='ds_save_order_div'>";
// 			html += "   <button type='submit' id='ds_save_order_btn' class='' >Save Order</button>";
// 			html += "</div>";
// 		    html += '</td>';
//
// 		    for(i=1;i<=Object.keys(dm).length;i++) {
// 		      //html += "<td>"+i.toString()+'</td>';
// 		      html += "<td><div class='cell'></div></td>";
// 		    }
// 		    html += '</tr>';
// 		    var n=1;
// 		    for(x_dname in dm) {
// 		      html += "<tr id='"+x_dname+"' class='tooltip_row' >";
// 		      html += "<td  id='"+x_dname+"' class='dragHandle'>"+n.toString()+"</td><td class='dragHandle ds_cell' >";
// 			  html += "<input type='hidden' name='ds_order[]' value="+items.ids[i]+" > "+x_dname+"</td>";
// 		      for(y_dname in dm) {
//
// 		        if(x_dname === y_dname){
// 		        	html += "<td id='' class='heat_map_td' bgcolor='#000'></td>";
// 		        }else{
// 		        	var id = x_dname+'-|-'+y_dname+'-|-'+dm[x_dname][y_dname];
// 		        	var svalue = Math.round( dm[x_dname][y_dname] * 15 );
// 		        	//html += "<td id='"+id+"' class='heat_map_td tooltip' bgcolor='#"+C.HEATMAP_COLORS[svalue]+"'>"+dm[x_dname][y_dname]+"</td>";
// 		        	html += "<td id='"+id+"' class='heat_map_td tooltip' bgcolor='#"+C.HEATMAP_COLORS[svalue]+"'></td>";
// 		        }
// 		      }
// 		      html += '</tr>';
// 		      n+=1;
// 		    }
// 		    html += '</table>';
// 			html += '</form>';
// 		    html += '</div>';
//
// 		    return html;
//
//
// 		}
//
 };



