// counts_table.js
var path = require('path');
var fs = require('fs');

var COMMON  = require('./routes_common');

module.exports = {

	//
	// CREATE COUNTS TABLE HTML
	//
	create_counts_table_html: function( ts, count_matrix, body ) {
	  // Intend to create (write) counts_table page here.
	  // The page should have a timestamp and/or username appeneded to the file name
	  // so that it is unique to the user.
	  // The page should be purged when? -- after a certain length of time
	  // or when the user leaves the page.
	  
	  var file = '../../tmp/'+ts+'_counts_table.html';
	  var html = '';
	  var selection_html = COMMON.get_selection_markup('counts_table', body); 
	  html += selection_html;
	  html += "<div id='' class='counts_table_div' >";
	  var column_totals = {};
	  html += "<table border='1' class='counts_table' >";
	  html += "<tr><td></td>";
	  for(n in count_matrix.dataset_names) {
	    html += "<td>"+count_matrix.dataset_names[n]+"</td>";
	  }
	  html += "</tr>";  
	  var row_count = 0;
	  for(name in count_matrix.unit_names) {
	    
	    html += "<tr>";
	    html += "<td>"+name+"</td>";
	    var col_count = 0;
	    for(c in count_matrix.unit_names[name]) {
	      if(column_totals[col_count] === undefined){
	        column_totals[col_count] =  count_matrix.unit_names[name][c];
	      }else{
	        column_totals[col_count] +=  count_matrix.unit_names[name][c];
	      }
	      
	      html += "<td>"+count_matrix.unit_names[name][c]+"</td>";
	      col_count += 1;
	    }
	    html += "</tr>";
	    row_count += 1;
	  }
	  html += "<tr><td></td>";
	  for(n in column_totals) {
	    html += "<td>"+column_totals[n]+"</td>";
	  }
	  html += "</tr>";
	  html += "</table>";
	  html += "</div>"
	  //console.log(column_totals)
	  fs.writeFile(path.resolve(__dirname, file), html, function(err) {
	    if(err) {
	      console.log('Could not write file: '+file+' Here is the error: '+err);
	    } else {
	      console.log("The file ("+file+") was saved!");
	    }
	  });
	}

}