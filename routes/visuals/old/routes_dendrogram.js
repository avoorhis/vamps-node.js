// distance_heatmap.js
var path = require('path');
var fs = require('fs');
var xmldom = require('xmldom');
var d3 = require("d3");
var COMMON  = require('./routes_common');
var C = require('../../public/constants');

module.exports = {
		//
	
		//
		//  CREATE DISTANCE MATRIX
		//
		create_tree: function (outstr) {
			//console.log('stderr: ' + stderr);
	    raw_distance_array = outstr.toString().split('\n');
	    //console.log('distance array (stdout):')
	    //console.log(outstr);
	    var distance_matrix = {};
	    // distance_matrix[ds1][ds2] = 2;
	    var dcolname = raw_distance_array[0].trim();
	    //console.log('dcolname:  '+dcolname);
	    distance_matrix[dcolname] = {};
	    distance_matrix[dcolname][dcolname] = 0;
	    //console.log(dcolname);
	    for(row in raw_distance_array){
	      if( ! raw_distance_array[row] ) { continue; }
	      
	      //console.log('-->'+raw_distance_array[row]+'<--');

	      if(raw_distance_array[row].indexOf("    ") === 0 ){   // starts with empty spaces
	        //console.log('found tab')
	        dcolname = raw_distance_array[row].trim();
	        if(dcolname in distance_matrix){
	        		// pass
	        }else{
	          distance_matrix[dcolname] = {};
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

            //console.log('a '+dcolname+' - '+items[0]);
          }else{
            //console.log('b '+dcolname+' - '+items[0]);
            distance_matrix[items[0]] = {};
            distance_matrix[items[0]][items[0]] = 0;
            
          }	
          distance_matrix[items[0]][dcolname] = parseFloat(items[1]);
          distance_matrix[dcolname][items[0]] = parseFloat(items[1]);
          //console.log(items[1])


	      }
	    } // end for row in raw...
	    return distance_matrix;
		},
		//
		//
		//
		create_newick: function () {

		},
		//
		//  CREATE HTML
		//
	
		create_dendrogram_html: function (newick, ds_count) {
			//console.log(newick);

		  var Newick    = require('../../public/javascripts/newick');
		  var Phylogram = require('../../public/javascripts/d3.phylogram');
		  var newick  = Newick.parse(newick);
		  
	    var newickNodes = [];
      function buildNewickNodes(node, callback) {
        newickNodes.push(node);
        if (node.branchset) {
          for (var i=0; i < node.branchset.length; i++) {
            buildNewickNodes(node.branchset[i]);
          }
        }
      }
      buildNewickNodes(newick);

      var tree_data = d3.phylogram.build('body', newick, {
        width: 300,
        height: ds_count*100
      });

			//console.log(tree_data.vis[0][0]);

			var svgXML = (new xmldom.XMLSerializer()).serializeToString( tree_data.vis[0][0] );
			var html = "<div id='' class='chart_div center_table'><svg height='"+(ds_count*100)+"' width='900'>"+svgXML+"</svg></div>";
		  //console.log(svg);
		  d3.select('svg').remove();
		  return html;
		    
		}

};



