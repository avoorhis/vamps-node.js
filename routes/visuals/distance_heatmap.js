// distance_heatmap.js
var path = require('path');
var fs = require('fs');

var COMMON  = require('./common');
var colors = ['1111ff','3333ff','5555ff','7777ff','9999ff','aaaaff','ccccff','ddeeee','eeeedd','ffdddd','ffbbbb','ff9999','ff7777','ff5555','ff3333','ff0000'];
module.exports = {
		//
		// CREATE HEATMAP HTML
		//
		create_heatmap_html: function( ts, body ) {
		  // write distance file using R
		  // The stdout from R script will be used and parsed
		  // to create distance_matrix JSON Object
		  //console.log(JSON.stringify(body.selection_obj.counts_matrix))
		  //console.log(matrix)
		  var spawn = require('child_process').exec;
		  var env = process.env
		  var file = '../../tmp/'+ts+'_heatmap.html';
		  var html = "";
		  var items;
		  var dname;
		  var matrix_input_file = path.resolve(__dirname, '../../tmp/'+ts+'_text_matrix.mtx');
		  var script_file = path.resolve(__dirname, '../../public/scripts/distance.R');
		  //var RCall  = ['--no-restore','--no-save', script_file, matrix_file, 'horn'];
		  var command = "RScript --no-restore --no-save " + script_file +' '+ matrix_input_file +' '+body.selected_heatmap_distance;
		  var R      = spawn(command, function (error, stdout, stderr) {
		    console.log('R command: ' + command);
		    //console.log('stderr: ' + stderr);
		    raw_distance_array = stdout.toString().split('\n');
		    //console.log('distance array (stdout):')
		    //0console.log(raw_distance_array);
		    var distance_matrix = {}
		    // distance_matrix[ds1][ds2] = 2
		    // 
		    for(row in raw_distance_array){
		      if( ! raw_distance_array[row] ) { continue; }
		      //console.log('-->'+raw_distance_array[row]+'<--');

		      if(raw_distance_array[row].indexOf("    ") === 0 ){   // starts with empty spaces
		        //console.log('found tab')
		        dcolname = raw_distance_array[row].trim()
		        if(dcolname in distance_matrix){

		        }else{
		          distance_matrix[dcolname] = {}
		          distance_matrix[dcolname][dcolname] = 0;
		        }
		        
		        continue;       
		      }
		        
		      items = raw_distance_array[row].trim().split(/\s+/); // The length can only be 1 or 2 
		      //console.log(raw_distance_array[row])
		      //console.log('items0 ' +items[0])
		      //console.log('items1 ' +items[1])
		      //console.log(items.length)
		      if(items.length == 1){
		        if(items[0] === dcolname){
		          distance_matrix[dcolname][items[0]] = 0;
		        }else{
		          // do nothing no distance here
		        }
		        
		      }else{  // length == 2
		        //distance_matrix[dname][items[0]] = parseFloat(items[1]);
		        distance_matrix[dcolname][items[0]] = parseFloat(items[1]);		        
		        
		          if(items[0] in distance_matrix){
		            distance_matrix[items[0]][dcolname] = parseFloat(items[1]);
		            //console.log('a '+dcolname+' - '+items[0])
		          }else{
		            //console.log('b '+dcolname+' - '+items[0])
		            distance_matrix[items[0]] = {}
		            distance_matrix[items[0]][items[0]] = 0
		            distance_matrix[items[0]][dcolname] = parseFloat(items[1]);
		            distance_matrix[dcolname][items[0]] = parseFloat(items[1]);
		          }		     
		        
		      }      
		    }

		    console.log(distance_matrix);

		    var selection_html = COMMON.get_selection_markup('heatmap', body); 
		    html += selection_html;
		    html += "<table border='1' class='heatmap_table' >";
		    html += '<tr><td></td>';
		    var i = 1;
		    for(x_dname in distance_matrix) {
		      //html += '<td>'+x_dname+'</td>';
		      html += '<td>'+i.toString()+'</td>';
		      i++;
		    }
		    html += '</tr>';
		    for(x_dname in distance_matrix) {
		      html += '<tr>';
		      html += '<td>'+x_dname+'</td>';
		      for(y_dname in distance_matrix) {
		      	
		        if(x_dname === y_dname){
		        	html += "<td width='10' height='10' bgcolor='#000'></td>";
		        }else{
		        	var svalue = Math.round( distance_matrix[x_dname][y_dname] * 15 )
		        	html += "<td width='10' height='10' bgcolor='#"+colors[svalue]+"'>"+distance_matrix[x_dname][y_dname]+"</td>";
		        }
		        
		      }
		      html += '</tr>';
		    }
		    html += '</table>';
		    // this is to write the html to show the colored heatmap
		    // input should be the html itself
		    fs.writeFile(path.resolve(__dirname, file), html, function(err) {
		      if(err) {
		       console.log('Could not write file: '+file+' Here is the error: '+err);
		      } else {
		       console.log("The file ("+file+") was saved!");
		      }
		    });

		  });
		}
}
