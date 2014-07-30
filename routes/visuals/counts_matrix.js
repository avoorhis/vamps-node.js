// counts_matrix.js
var path = require('path');
var fs = require('fs');

module.exports = {

		//
		// F I L L  I N  C O U N T S  M A T R I X
		//
		fill_in_counts_matrix: function(selection_obj, field) {
			// This function creates a counts matrix using only the dataset_ids (no names)
			// and fills it in with zeros where appropriate.
			// when returned this matrix becomes part of the selection_obj
			// FORMAT:
			// counts_matrix:{"82":[4,2,2],"84":[0,0,1],"137":[0,0,1],"214":[272,401,430]}}

		  //selection_obj = JSON.parse(selection_obj);
		  var matrix = {};  
		  
		  var dataset_ids = selection_obj.dataset_ids;
		  var unit_assoc  = selection_obj.unit_assoc[field];  // TODO: change depending on user selection
		  var seq_freqs   = selection_obj.seq_freqs;      
		        
		  //    seq_ids  : [id1,id2,id3...],
		  //    tax_id1 : [tct1,0,tid3...],
		  //    tax_id2 : [tct4,tct5,tct6...],
		  //    tax_id3 : [tct7,tct8,0...]
		  //    ....
		  //  }

		  //var old_sid = 'x';
		  //var tids = [96,214,82,214,137];
		  //var vals = [2,103,8,203,3];

		  // for (i=0; i < tids.length; i++) {
		  //   id = tids[i]
		  //   if (id in tmp){
		  //     tmp[id][0] += vals[i]
		  //   } else {
		  //     tmp[id] = [vals[i]]
		  //   }
		  // }
		  var counts = {};
		  var unit_id_lookup = {};
		  var unit_ids = [];
		  var unit_id;
		  var tmp;
		  
		  for (var n=0; n < unit_assoc.length; n++) {

		        unit_ids = unit_assoc[n];
		        tmp = {};
		        counts[dataset_ids[n]] = {};
		        for (var i=0; i < unit_ids.length; i++) {
		            unit_id = unit_ids[i];
		            unit_id_lookup[unit_id]=1;
		            if (unit_id in tmp){
		              tmp[ unit_id ] += seq_freqs[n][i];
		            } else {
		              tmp[ unit_id ] = seq_freqs[n][i];
		            }
		        }
		        counts[ dataset_ids[n] ]=tmp;
		  }
		  //console.log(JSON.stringify(counts,null,4));
		 //console.log(unit_id_lookup);
		// { '82': 8, '96': 2, '137': 3, '214': 306 }
		// { '82': 4, '96': 2, '214': 33 }
		// { '82': 1, '96': 1, '137': 1, '214': 277 }
		// { '82': 6, '96': 1, '137': 1, '214': 596 }
		// { '82': 1, '84': 4, '96': 2, '112': 1, '137': 1, '214': 75 }
		// { '82': 2, '96': 1, '112': 1, '214': 331 }
		  //var mtx = "\t";
		  
		 
		  for (var uid in unit_id_lookup) {  
		    matrix[uid]=[]  
		    
		    for (var did in counts) {
		      if(uid in counts[did]){
		        c = counts[did][uid];
		      }else{
		        c = 0;
		      }
		      matrix[uid].push(c);

		    }
		  }
		  return matrix;
		},

		//
		//  O U T P U T  M A T R I X
		//
		output_matrix: function(to_loc, ts, body, sqlrows ) {
		  // This function creates two matrices from the data in body.selection_obj and sqlrows
			// one matrix is printed to a text file to which the unique timestamp (ts) is appended.
			// the matrix file is the input for Rscripts that use it: heatmap and dendrogram
			// FORMAT:
			//        dsname1    dsname2       dsname3
			// unitname1  4       2       4
			// unitname2  272     401     430
			//
			// The other matrix is a JSON Object and is returned from this function for use in 
			// the counts table 
			// FORMAT:
			// { dataset_names: 
   		// 		[ dsname1,     dsname2,     dsname3  ],
  		// 	 unit_names: 
   		//		[	unitname1: [ '1', '0', '1'  ],
     	//			unitname2: [ '2', '1', '2'  ],
     	//			unitname3: [ '315', '778' ] 
     	//		] 
     	// }
 
		  // need chosen units, tax depth(if applicable), db
		  selection_obj = body.selection_obj
		  name_hash = body.chosen_id_name_hash
		  
		  var matrix_with_names = {};
		  matrix_with_names.dataset_names = [];
		  matrix_with_names.unit_names = []
		  var unit_name_lookup = {}

		  for (var r=0; r < sqlrows.length; r++){
		    id = sqlrows[r].id;
		    name = sqlrows[r].tax;
		    counts = selection_obj.counts_matrix[id];
		    if(name in unit_name_lookup) {
		      for (var c in counts) {
		        unit_name_lookup[name][c] += counts[c]
		      }
		    }else{
		      unit_name_lookup[name] = []
		      for (var c in counts) {
		        unit_name_lookup[name].push(counts[c])
		      }
		    }
		  }

		  var mtx = "";
		  for (var did in selection_obj.dataset_ids) {
		    
		    var index = name_hash.ids.indexOf( selection_obj.dataset_ids[did] );
		    mtx += "\t" + name_hash.names[ index ];
		    matrix_with_names.dataset_names.push(name_hash.names[ index ]);
		  }
		  mtx += "\n";
		  
		  matrix_with_names.unit_names = unit_name_lookup;
		  
		  for(var uname in unit_name_lookup) {
		    mtx += uname;
		    for (var c in unit_name_lookup[uname]) {
		      mtx += "\t" + unit_name_lookup[uname][c].toString();
		    }
		    mtx += "\n";
		  }

		  //console.log(matrix_with_names);
		  
		  if(to_loc === 'to_console') {
		    console.log(mtx);
		  }else{
		    //console.log('mtx1');
		    //console.log(mtx);
		    //console.log(matrix_with_names);
		    //console.log('mtx2');
		    // to file
		    var file = '../../tmp/'+ts+'_text_matrix.mtx';
		    var html = mtx;
		    fs.writeFile(path.resolve(__dirname, file), html, function(err) {
		      if(err) {
		        console.log('Could not write file: '+file+' Here is the error: '+err);
		      } else {
		        console.log("The file ("+file+") was saved!");
		      }
		    });


		  }
		  return matrix_with_names;
		  
		}

};


