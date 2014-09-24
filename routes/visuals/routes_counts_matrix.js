// counts_matrix.js
var path = require('path');
var fs = require('fs');
var COMMON  = require('./routes_common');
// biome format:dense: http://biom-format.org/documentation/format_versions/biom-1.0.html#example-biom-files
// {
//     "id":null,
//     "format": "Biological Observation Matrix 0.9.1-dev",
//     "format_url": "http://biom-format.org/documentation/format_versions/biom-1.0.html",
//     "type": "OTU table",
//     "generated_by": "QIIME revision 1.4.0-dev",
//     "date": "2011-12-19T19:00:00",
//     "rows":[
//             {"id":"GG_OTU_1", "metadata":null},
//             {"id":"GG_OTU_2", "metadata":null},
//             {"id":"GG_OTU_3", "metadata":null},
//             {"id":"GG_OTU_4", "metadata":null},
//             {"id":"GG_OTU_5", "metadata":null}
//         ],
//     "columns": [
//             {"id":"Sample1", "metadata":null},
//             {"id":"Sample2", "metadata":null},
//             {"id":"Sample3", "metadata":null},
//             {"id":"Sample4", "metadata":null},
//             {"id":"Sample5", "metadata":null},
//             {"id":"Sample6", "metadata":null}
//         ],
//     "matrix_type": "dense",
//     "matrix_element_type": "int",
//     "shape": [5, 6],
//     "data":  [[0,0,1,0,0,0],
//               [5,1,0,2,3,1],
//               [0,0,1,4,2,0],
//               [2,1,1,0,0,1],
//               [0,1,1,0,0,0]]
// }


module.exports = {


		get_biome_matrix: function(chosen_id_name_hash, post_items, sqlrows) {
			var date = new Date()
			
			biome_matrix = {
				id: post_items.ts,
				format: "Biological Observation Matrix",
				units: post_items.unit_choice,
				generated_by:"VAMPS-NodeJS Version 2.0",
				date: date.toISOString(),
				rows:[],										// taxonomy (or OTUs, MED nodes) names
				columns:[],									// ORDERED dataset names
				column_totals:[],								// ORDERED datasets count sums
				max_dataset_count:0,							// maximum dataset count
				matrix_type: 'dense',
    		matrix_element_type: 'int',
     		shape: [],									// [row_count, col_count]
     		data:  []										// ORDERED list of lists of counts: [ [],[],[] ... ]
     	}
			
			var unit_name_lookup = {};
			var ukeys = [];
			var unit_name_lookup_per_dataset = {};
		  //var unit_id_lookup = {};
			for (var r=0; r < sqlrows.length; r++){

				tax = assemble_tax(post_items.tax_depth, new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank, sqlrows[r]);


		    var did  = sqlrows[r].did;
		    var cnt  = sqlrows[r].seq_count;
		    //var uid  = sqlrows[r].uid;
		    //var uname = sqlrows[r].tax;
		    var uname = tax;
		    //counts = uid_matrix[uid];
		    //biome_matrix.rows.push({id:name})
		    //biome_matrix.data.push(counts)
		    //console.log(counts)
				//unit_id_lookup   = create_unit_id_lookup( uid, counts, unit_id_lookup );
				unit_name_lookup[uname] = 1;
				ukeys.push(uname);

				//unit_name_lookup_per_dataset[did][uid] = sumcounts
		  	//unit_name_lookup = create_unit_name_lookup_per_dataset( did, uname, counts, unit_name_lookup);
		  	if(did in unit_name_lookup_per_dataset) {
		  		if(uname in unit_name_lookup_per_dataset[did]) {
		  			unit_name_lookup_per_dataset[did][uname] += parseInt(cnt);
		  		}else{
		  			unit_name_lookup_per_dataset[did][uname] = parseInt(cnt);
		  		}

		  	}else{
		  		unit_name_lookup_per_dataset[did] = {};
		  		if(uname in unit_name_lookup_per_dataset[did]) {
		  			unit_name_lookup_per_dataset[did][uname] += parseInt(cnt);

		  		}else{
		  			unit_name_lookup_per_dataset[did][uname] = parseInt(cnt);
		  		}
		  	}
		   
		  }

		  var unit_name_counts={};
		  for(uname in unit_name_lookup){
		  	unit_name_counts[uname]=[];
		  }
		  for (var n in chosen_id_name_hash.ids) { // correct order
		  	did = chosen_id_name_hash.ids[n];
		  	
		  	for(uname in unit_name_lookup) {
		  		if(did in unit_name_lookup_per_dataset && uname in unit_name_lookup_per_dataset[did]) {
		  			cnt = unit_name_lookup_per_dataset[did][uname];
		  			unit_name_counts[uname].push(cnt)

		  		} else {
		  			unit_name_counts[uname].push(0)
		  		}
		  	}
		  }
		  ukeys.push(uname);
		  ukeys = ukeys.filter(onlyUnique);
		  ukeys.sort()
		  //console.log(unit_name_lookup_per_dataset);
		  
		  biome_matrix 	= create_biome_matrix( biome_matrix, unit_name_counts, ukeys, chosen_id_name_hash );
		  
		  var matrix_file = '../../tmp/'+post_items.ts+'_count_matrix.biom';
		    
 			console.log('Writing matrix file');
 			//COMMON.write_file( matrix_file, JSON.stringify(biome_matrix) );
 			COMMON.write_file( matrix_file, JSON.stringify(biome_matrix,null,2) );

			return biome_matrix;

			function onlyUnique(value, index, self) { 
		    return self.indexOf(value) === index;
			}

		},

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
		  //console.log('')
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
		  
		  //for(did in dataset_ids) {
		  for (var uid in unit_id_lookup) {  
		    matrix[uid]=[]  
		    
		    for (var d in dataset_ids) { // this is correct order
		    	did = dataset_ids[d]

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

	

};
//
//
//
function create_biome_matrix(biome_matrix, unit_name_counts, ukeys, chosen_id_name_hash ) {
	
	//console.log(ukeys);  // uname:
	//console.log(chosen_id_name_hash);
	for (var n in chosen_id_name_hash.names) {   // correct order
	    //console.log(dataset_ids[did])
	    biome_matrix.columns.push({ id: chosen_id_name_hash.names[n], metadata: {} });
	}
	// ukeys is sorted by alpha
	for(uk in ukeys) {
		
		biome_matrix.rows.push({ id: ukeys[uk], metadata: {} });
		
		biome_matrix.data.push(unit_name_counts[ukeys[uk]]);
	}

	biome_matrix.shape = [biome_matrix.rows.length, biome_matrix.columns.length];
	
	var max_count = {};
  for(n in biome_matrix.columns) {
  	console.log(biome_matrix.columns[n].id);
  	max_count[biome_matrix.columns[n].id] = 0;
  	for(d in biome_matrix.data) {
  		max_count[biome_matrix.columns[n].id] += biome_matrix.data[d][n]
  	}
  }
  var max = 0;
  for(n in chosen_id_name_hash.names) { 		// correct order
  	biome_matrix.column_totals.push(max_count[chosen_id_name_hash.names[n]])
  	if(max_count[chosen_id_name_hash.names[n]] > max){
  		max = max_count[chosen_id_name_hash.names[n]];
  	}
  }
  biome_matrix.max_dataset_count = max;
  console.log(max_count);
	return(biome_matrix);
}
//
//  CREATE UNIT ID LOOKUP
//
// function create_unit_id_lookup( uid, counts, unit_id_lookup ) {
	 	
// 	 	if(uid in unit_id_lookup) {
//       for (var c in counts) {
//         unit_id_lookup[uid][c] += counts[c]
//       }
//     }else{
//       unit_id_lookup[uid] = []
//       for (var c in counts) {
//         unit_id_lookup[uid].push(counts[c])
//       }
//     }
//     return unit_id_lookup
// }
//
//  CREATE UNIT NAME LOOKUP
//
function create_unit_name_lookup( did, name, counts, unit_name_lookup ) {
 	
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
  return unit_name_lookup

}
//
//
//
//function create_json_id_matrix(mtx) {
//	return JSON.stringify(mtx)+"\n";
//}
//
//  CREATE CSV ID MATRIX
//
// function create_csv_id_matrix( unit_ids, dataset_ids ) {
// 		//
// 		// CSV3
// 		//
// 	  var csv = 'DatasetId';   // for D3.js stackbars
// 		for(var uid in unit_ids) {
// 			csv += ','+uid;
// 		}
// 		csv += "\n";
// 		for (var did in dataset_ids) {  // in correct order
			
// 	    csv += dataset_ids[did];
// 	    for(var uid in unit_ids){  // 
// 	    	csv += ','+ unit_ids[uid][did]
// 	    }
// 	    csv += "\n";
// 		}
// 		return csv;
// }
//
// CREATE TEXT MATRIX
//
function create_text_matrix( unit_names, dataset_names, dataset_ids, matrix_with_names) {

		// 
		// MTX  for input to R scripts
		//
		var mtx = '';
	  for (var did in dataset_ids) {
	    console.log(dataset_ids[did])
	    var index = dataset_names.ids.indexOf( dataset_ids[did] );
	    mtx += "\t" + dataset_names.names[ index ];
	    matrix_with_names.dataset_names.push(dataset_names.names[ index ]);
	  }
	  mtx += "\n";
	  
	  matrix_with_names.unit_names = unit_names;
	  
	  for(var uname in unit_names) {
	    mtx += uname;
	    for (var c in unit_names[uname]) {
	      mtx += "\t" + unit_names[uname][c].toString();
	    }
	    mtx += "\n";
	  }
	  return mtx;
}
//
//  CREATE CSV TEXT MATRIX
//
function assemble_tax(depth, dict, row) {
				var tax;
				var domain;
				var phylum;
				var klass;
				var order;
				var family;
				var genus;
				var species;
				var strain;
				var d_id = row.domain_id+"_domain";		      	      
	      if(d_id in dict){
	      	domain = dict[d_id]["taxon"];
	      }else{
	      	domain = 'unknown';
	      }
				if(depth === 'phylum') {
		      var p_id = row.phylum_id+"_phylum";		
		      if(p_id in dict){
		      	phylum = dict[p_id]["taxon"];
		      }else{
		      	phylum = 'unknown';
		      }
		      console.log(domain+';'+phylum)
		      tax = domain+';'+phylum;
		    }else if(depth === 'class') {
		    	var p_id = row.phylum_id+"_phylum";	
		    	var k_id = row.klass_id+"_klass";	
		      if(p_id in dict){
		      	phylum = dict[p_id]["taxon"];
		      }else{
		      	phylum = 'unknown';
		      }
		      if(k_id in dict){
		      	klass = dict[k_id]["taxon"];
		      }else{
		      	klass = 'unknown';
		      }
		      console.log(domain+';'+phylum+';'+klass)
		      tax = domain+';'+phylum+';'+klass;
		    }else if(depth === 'order') {
		    	var p_id = row.phylum_id+"_phylum";	
		    	var k_id = row.klass_id+"_klass";	
		    	var o_id = row.order_id+"_order";	
		    	
		      if(p_id in dict){
		      	phylum = dict[p_id]["taxon"];
		      }else{
		      	phylum = 'unknown';
		      }
		      if(k_id in dict){
		      	klass = dict[k_id]["taxon"];
		      }else{
		      	klass = 'unknown';
		      }
		      if(o_id in dict){
		      	order = dict[o_id]["taxon"];
		      }else{
		      	order = 'unknown';
		      }
		      console.log(domain+';'+phylum+';'+klass+';'+order);
		      tax = domain+';'+phylum+';'+klass+';'+order;
		    }else if(depth === 'family') {
		    	var p_id = row.phylum_id+"_phylum";	
		    	var k_id = row.klass_id+"_klass";	
		    	var o_id = row.order_id+"_order";	
		    	var f_id = row.family_id+"_family";
		    	
		      if(p_id in dict){
		      	phylum = dict[p_id]["taxon"];
		      }else{
		      	phylum = 'unknown';
		      }
		      if(k_id in dict){
		      	klass = dict[k_id]["taxon"];
		      }else{
		      	klass = 'unknown';
		      }
		      if(o_id in dict){
		      	order = dict[o_id]["taxon"];
		      }else{
		      	order = 'unknown';
		      }
		      if(f_id in dict){
		      	family = dict[f_id]["taxon"];
		      }else{
		      	family = 'unknown';
		      }
		      console.log(domain+';'+phylum+';'+klass+';'+order+';'+family);
		      tax = domain+';'+phylum+';'+klass+';'+order+';'+family;
		    }else if(depth === 'genus') {
		    	var p_id = row.phylum_id+"_phylum";	
		    	var k_id = row.klass_id+"_klass";	
		    	var o_id = row.order_id+"_order";	
		    	var f_id = row.family_id+"_family";
		    	var g_id = row.genus_id+"_genus";
		    	
		      if(p_id in dict){
		      	phylum = dict[p_id]["taxon"];
		      }else{
		      	phylum = 'unknown';
		      }
		      if(k_id in dict){
		      	klass = dict[k_id]["taxon"];
		      }else{
		      	klass = 'unknown';
		      }
		      if(o_id in dict){
		      	order = dict[o_id]["taxon"];
		      }else{
		      	order = 'unknown';
		      }
		      if(f_id in dict){
		      	family = dict[f_id]["taxon"];
		      }else{
		      	family = 'unknown';
		      }
		      if(g_id in dict){
		      	genus = dict[g_id]["taxon"];
		      }else{
		      	genus = 'unknown';
		      }
		      console.log(domain+';'+phylum+';'+klass+';'+order+';'+family+';'+genus);
		      tax = domain+';'+phylum+';'+klass+';'+order+';'+family+';'+genus;
		    }else if(depth === 'species') {
		    	var p_id = row.phylum_id+"_phylum";	
		    	var k_id = row.klass_id+"_klass";	
		    	var o_id = row.order_id+"_order";	
		    	var f_id = row.family_id+"_family";
		    	var g_id = row.genus_id+"_genus";
		    	var s_id = row.species_id+"_species";
		      if(p_id in dict){
		      	phylum = dict[p_id]["taxon"];
		      }else{
		      	phylum = 'unknown';
		      }
		      if(k_id in dict){
		      	klass = dict[k_id]["taxon"];
		      }else{
		      	klass = 'unknown';
		      }
		      if(o_id in dict){
		      	order = dict[o_id]["taxon"];
		      }else{
		      	order = 'unknown';
		      }
		      if(f_id in dict){
		      	family = dict[f_id]["taxon"];
		      }else{
		      	family = 'unknown';
		      }
		      if(g_id in dict){
		      	genus = dict[g_id]["taxon"];
		      }else{
		      	genus = 'unknown';
		      }
		      if(s_id in dict){
		      	species = dict[s_id]["taxon"];
		      }else{
		      	species = 'unknown';
		      }
		      console.log(domain+';'+phylum+';'+klass+';'+order+';'+family+';'+genus+';'+species);
		      tax = domain+';'+phylum+';'+klass+';'+order+';'+family+';'+genus+';'+species;
		    }else if(depth === 'strain') {
		    	var p_id = row.phylum_id+"_phylum";	
		    	var k_id = row.klass_id+"_klass";	
		    	var o_id = row.order_id+"_order";	
		    	var f_id = row.family_id+"_family";
		    	var g_id = row.genus_id+"_genus";
		    	var s_id = row.species_id+"_species";
		    	var st_id = row.strain_id+"_strain";
		      if(p_id in dict){
		      	phylum = dict[p_id]["taxon"];
		      }else{
		      	phylum = 'unknown';
		      }
		      if(k_id in dict){
		      	klass = dict[k_id]["taxon"];
		      }else{
		      	klass = 'unknown';
		      }
		      if(o_id in dict){
		      	order = dict[o_id]["taxon"];
		      }else{
		      	order = 'unknown';
		      }
		      if(f_id in dict){
		      	family = dict[f_id]["taxon"];
		      }else{
		      	family = 'unknown';
		      }
		      if(g_id in dict){
		      	genus = dict[g_id]["taxon"];
		      }else{
		      	genus = 'unknown';
		      }
		      if(s_id in dict){
		      	species = dict[s_id]["taxon"];
		      }else{
		      	species = 'unknown';
		      }
		      if(st_id in dict){
		      	strain = dict[st_id]["taxon"];
		      }else{
		      	strain = 'unknown';
		      }
		      console.log(domain+';'+phylum+';'+klass+';'+order+';'+family+';'+genus+';'+species+';'+strain);
		      tax = domain+';'+phylum+';'+klass+';'+order+';'+family+';'+genus+';'+species+';'+strain;
		    }

		    return tax;

}
// function create_csv_text_matrix( unit_names, dataset_names, dataset_ids ) {
// 		//
// 	  // CSV2
// 	  //		  
// 	  var csv = 'DatasetName';   // for D3.js stackbars
// 	  for(var uname in unit_names) {
// 			csv += ','+uname;
// 		}
// 		csv += "\n";
// 		for (var did in dataset_ids) {  // in correct order
// 			var index = dataset_names.ids.indexOf( dataset_ids[did] );
// 	    csv += dataset_names.names[ index ];
// 	    for(var uname in unit_names){  // 
// 	    	csv += ','+ unit_names[uname][did]
// 	    }
// 	    csv += "\n";
// 		}
// 		return csv;
// }

