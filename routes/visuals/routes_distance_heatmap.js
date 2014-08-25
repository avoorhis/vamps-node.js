// distance_heatmap.js
var path = require('path');
var fs = require('fs');

var COMMON  = require('./routes_common');
var C = require('../../public/constants');

module.exports = {
		//
		// CREATE HEATMAP HTML
		//
		create_heatmap_html: function( ts, obj ) {
		  // write distance file using R
		  // The stdout from R script will be used and parsed
		  // to create distance_matrix JSON Object
		  //console.log(JSON.stringify(body.selection_obj.counts_matrix))
		  //console.log(matrix)
		  var exec = require('child_process').exec;
		  var env = process.env
		  var out_file = '../../tmp/'+ts+'_heatmap.html';
		  var items;
		  var dname;
		  var matrix_input_file = path.resolve(__dirname, '../../tmp/'+ts+'_text_matrix.mtx');
		  var script_file = path.resolve(__dirname, '../../public/scripts/distance.R');

		  //var RCall  = ['--no-restore','--no-save', script_file, matrix_file, 'horn'];
		  var command = C.RSCRIPT_CMD + ' ' + script_file + ' ' + matrix_input_file + ' ' + obj.selected_heatmap_distance;
		  console.log('R command: ' + command);
		  exec(command, {maxBuffer:16000*1024}, function (error, stdout, stderr) {  // currently 16000*1024 handles 232 datasets
		    stdout = stdout.trim();
		    console.log(stderr)
		    console.log(error)
		    console.log('-->'+stdout+'<--')
		    var selection_html = COMMON.get_selection_markup('heatmap', obj); 
		    if(stdout === 'dist(0)' || stdout === 'err') {
		    	var html = selection_html + '<div>Error -- No distances were calculated.</div>'
		    }else{
		    	var dm = create_distance_matrix(stdout);
		    	//console.log(dm)
		    	var html = selection_html + create_hm_html(dm);
		    }
		    
		    
		    // this is to write the html to show the colored heatmap
		    // input should be the html itself
		    COMMON.write_file(out_file,html);

		  });

		}		

}
//
//  CREATE DISTANCE MATRIX
//
function create_distance_matrix(outstr) {
			//console.log('stderr: ' + stderr);
	    raw_distance_array = outstr.toString().split('\n');
	    //console.log('distance array (stdout):')
	    //console.log(outstr);
	    var distance_matrix = {}
	    // distance_matrix[ds1][ds2] = 2
	    var dcolname = raw_distance_array[0].trim();
	    //console.log('dcolname:  '+dcolname)
	    distance_matrix[dcolname] = {}
	    distance_matrix[dcolname][dcolname] = 0;
	    //console.log(dcolname);
	    for(row in raw_distance_array){
	      if( ! raw_distance_array[row] ) { continue; }
	      
	      //console.log('-->'+raw_distance_array[row]+'<--');

	      if(raw_distance_array[row].indexOf("    ") === 0 ){   // starts with empty spaces
	        //console.log('found tab')
	        dcolname = raw_distance_array[row].trim()
	        if(dcolname in distance_matrix){
	        		// pass
	        }else{
	          distance_matrix[dcolname] = {}
	          distance_matrix[dcolname][dcolname] = 0;
	        }
	        
	        continue;       
	      }
	        
	      items = raw_distance_array[row].trim().split(/\s+/); // The length can only be 1 or 2 
	      
	      //console.log('items0 ' +items[0])
	      //console.log('items1 ' +items[1])
	      //console.log(items.length)
	      if(items.length === 2) {  // length == 2
	        //distance_matrix[items[0][dcolname]] = parseFloat(items[1]);
	        //distance_matrix[dcolname][items[0]] = parseFloat(items[1]);		        
	  
          if(items[0] in distance_matrix){
            //distance_matrix[items[0]][dcolname] = parseFloat(items[1]);

            //console.log('a '+dcolname+' - '+items[0])
          }else{
            //console.log('b '+dcolname+' - '+items[0])
            distance_matrix[items[0]] = {}
            distance_matrix[items[0]][items[0]] = 0
            
          }	
          distance_matrix[items[0]][dcolname] = parseFloat(items[1]);
          distance_matrix[dcolname][items[0]] = parseFloat(items[1]);
          //console.log(items[1])


	      }
	    } // end for row in raw...
	    return distance_matrix;
}

//
//  CREATE HTML
//
/*
TODO: That should be in an html file, we can only use DOM scripting to enhance functionality, not create it. What a user will see if javascript is disabled?
*/
function create_hm_html(dm) {

			
		    //console.log(dm);
		    var html = '';
		    //var selection_html = COMMON.get_selection_markup('heatmap', body); 
		    //html += selection_html;
		    html += "<div class='' id='distance_heatmap_div' >";
		    html += "<table border='1' class='heatmap_table' >";
		    html += '<tr><td></td>';

		    for(i=1;i<=Object.keys(dm).length;i++) {
		      html += '<td>'+i.toString()+'</td>';
		    }
		    html += '</tr>';
		    for(x_dname in dm) {
		      html += '<tr>';
		      html += '<td>'+x_dname+'</td>';
		      for(y_dname in dm) {
		      	
		        if(x_dname === y_dname){
		        	html += "<td id='' class='heat_map_td' bgcolor='#000'></td>";
		        }else{
		        	var id = x_dname+'-|-'+y_dname+'-|-'+dm[x_dname][y_dname];
		        	var svalue = Math.round( dm[x_dname][y_dname] * 15 );
		        	html += "<td id='"+id+"' class='heat_map_td tooltip' bgcolor='#"+C.HEATMAP_COLORS[svalue]+"'>"+dm[x_dname][y_dname]+"</td>";
		        }		        
		      }
		      html += '</tr>';
		    }
		    html += '</table>';
		    html += '</div>';
		    
		    return html;
		    

		}