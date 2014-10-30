// counts_matrix.js
var path = require('path');
var fs = require('fs');
var COMMON  = require('./routes_common');
var C = require('../../public/constants');
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


		get_biome_matrix: function(chosen_id_name_hash, post_items) {
			var date = new Date();
			var did,rank,db_tax_id,node_id,parent_id,id,tax_name,cnt;
			biome_matrix = {
				id: post_items.ts,
				format: "Biological Observation Matrix",
				units: post_items.unit_choice,
				generated_by:"VAMPS-NodeJS Version 2.0",
				date: date.toISOString(),
				rows:[],												// taxonomy (or OTUs, MED nodes) names
				columns:[],											// ORDERED dataset names
				column_totals:[],								// ORDERED datasets count sums
				max_dataset_count:0,						// maximum dataset count
				matrix_type: 'dense',
    			matrix_element_type: 'int',
     			shape: [],									// [row_count, col_count]
     			data:  []										// ORDERED list of lists of counts: [ [],[],[] ... ]
     		};
			
			var unit_name_lookup = {};
			var ukeys = [];
			var unit_name_lookup_per_dataset = {};
		  //var unit_id_lookup = {};
			// TESTING
			// data from DB or JSON_file or HTF5
			//var read_choices = ['DB','JSON','HTF5'];
			//var read_from = read_choices[0];
		  //if(read_from === 'JSON') {
		  for (var n in chosen_id_name_hash.ids) { // correct order
				  did = chosen_id_name_hash.ids[n];				  
				  rank = post_items.tax_depth;
				  //console.log('did '+did+' rank: '+rank);
				  //console.log(TaxaCounts[did][rank])				  
				  for(var r in new_taxonomy.taxa_tree_dict_map_by_rank[rank]) {
				  	
				  	db_tax_id = new_taxonomy.taxa_tree_dict_map_by_rank[rank][r].db_id;
				  	node_id = new_taxonomy.taxa_tree_dict_map_by_rank[rank][r].node_id	;			  	
				  	parent_id = new_taxonomy.taxa_tree_dict_map_by_rank[rank][r].parent_id;
				  	tax_name='';
				  	//console.log('RR '+C.RANKS.indexOf(rank))				  	
				  	id = node_id;
				  	while(id !== 0) {  				  		
				  		tax_name = new_taxonomy.taxa_tree_dict_map_by_id[id].taxon + ';' + tax_name;
				  		id = new_taxonomy.taxa_tree_dict_map_by_id[id].parent_id;
				  	}
				  	tax_name = tax_name.replace(/;+$/,'');  // remove trailing ';'
				  					  	
				  	cnt = 0
				  	if(did in taxa_counts) {
					  	if(rank in taxa_counts[did]) {
						  	if(db_tax_id in taxa_counts[did][rank]) {
						  		cnt = taxa_counts[did][rank][db_tax_id];				  		
						  	}
					  	}
				  	}
				  	
				  	//console.log('ds '+ds+'tax '+name+' - count '+count)
				  	//console.log(new_taxonomy.taxa_tree_dict_map_by_rank[rank][r])	
				  	//console.log(tax_name);
				  	unit_name_lookup[tax_name] = 1;
						ukeys.push(tax_name);
						if(did in unit_name_lookup_per_dataset) {
				  		if(tax_name in unit_name_lookup_per_dataset[did]) {
				  			unit_name_lookup_per_dataset[did][tax_name] += parseInt(cnt);
				  		}else{
				  			unit_name_lookup_per_dataset[did][tax_name] = parseInt(cnt);
				  		}

				  	}else{
				  		unit_name_lookup_per_dataset[did] = {};
				  		if(tax_name in unit_name_lookup_per_dataset[did]) {
				  			unit_name_lookup_per_dataset[did][tax_name] += parseInt(cnt);

				  		}else{
				  			unit_name_lookup_per_dataset[did][tax_name] = parseInt(cnt);
				  		}
				  	}
			   
			    }
			    var unit_name_counts={};
				  for(tax_name in unit_name_lookup){
				  	unit_name_counts[tax_name]=[];
				  }
				  for (var n in chosen_id_name_hash.ids) { // correct order
				  	did = chosen_id_name_hash.ids[n];
				  	
				  	for(tax_name in unit_name_lookup) {
				  		if(did in unit_name_lookup_per_dataset && tax_name in unit_name_lookup_per_dataset[did]) {
				  			cnt = unit_name_lookup_per_dataset[did][tax_name];
				  			unit_name_counts[tax_name].push(cnt);

				  		} else {
				  			unit_name_counts[tax_name].push(0);
				  		}
				  	}
				  }
				  ukeys.push(tax_name);
				  ukeys = ukeys.filter(onlyUnique);
				  ukeys.sort();

			}

			// remove empty rows:					
			var empty_row_name_collector = [];
  		for(var taxname in unit_name_counts) {
  			var sum = 0;
  			for(var c in unit_name_counts[taxname]){
  				sum += unit_name_counts[taxname][c];
  				//console.log(k);
  			}
  			if(sum===0){
  				// just need to remove names from ukeys and zero rows
  				// will be removed from data rows in create_biom_matrix()
  				var idx = ukeys.indexOf(taxname);
  				ukeys.splice(idx,1);
  			}		  			
  		}

		  		


			// if(sqlrows.length === 0) {
			// 	ukeys = undefined;
			// }else {

			// 	for (var r=0; r < sqlrows.length; r++){
				
			// 		tax = assemble_taxa(post_items.tax_depth, new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank, sqlrows[r]);

			// 	    var did  = sqlrows[r].dataset_id;
			// 	    var cnt  = sqlrows[r].seq_count;
			// 	    //var uid  = sqlrows[r].uid;
			// 	    //var uname = sqlrows[r].tax;
			// 	    var uname = tax;
			    
			// 		//unit_id_lookup   = create_unit_id_lookup( uid, counts, unit_id_lookup );
			// 		unit_name_lookup[uname] = 1;
			// 		ukeys.push(uname);

			// 		//unit_name_lookup_per_dataset[did][uid] = sumcounts
			// 	  	//unit_name_lookup = create_unit_name_lookup_per_dataset( did, uname, counts, unit_name_lookup);
			// 	  	if(did in unit_name_lookup_per_dataset) {
			// 	  		if(uname in unit_name_lookup_per_dataset[did]) {
			// 	  			unit_name_lookup_per_dataset[did][uname] += parseInt(cnt);
			// 	  		}else{
			// 	  			unit_name_lookup_per_dataset[did][uname] = parseInt(cnt);
			// 	  		}

			// 	  	}else{
			// 	  		unit_name_lookup_per_dataset[did] = {};
			// 	  		if(uname in unit_name_lookup_per_dataset[did]) {
			// 	  			unit_name_lookup_per_dataset[did][uname] += parseInt(cnt);

			// 	  		}else{
			// 	  			unit_name_lookup_per_dataset[did][uname] = parseInt(cnt);
			// 	  		}
			// 	  	}
			   
			//     }
			//     var unit_name_counts={};
			// 	  for(uname in unit_name_lookup){
			// 	  	unit_name_counts[uname]=[];
			// 	  }
			// 	  for (var n in chosen_id_name_hash.ids) { // correct order
			// 	  	did = chosen_id_name_hash.ids[n];
				  	
			// 	  	for(uname in unit_name_lookup) {
			// 	  		if(did in unit_name_lookup_per_dataset && uname in unit_name_lookup_per_dataset[did]) {
			// 	  			cnt = unit_name_lookup_per_dataset[did][uname];
			// 	  			unit_name_counts[uname].push(cnt);

			// 	  		} else {
			// 	  			unit_name_counts[uname].push(0);
			// 	  		}
			// 	  	}
			// 	  }
			// 	  ukeys.push(uname);
			// 	  ukeys = ukeys.filter(onlyUnique);
			// 	  ukeys.sort();



			// }


		  
		  //console.log(unit_name_counts);
		  
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
// 		fill_in_counts_matrix: function(selection_obj, field) {
// 			// This function creates a counts matrix using only the dataset_ids (no names)
// 			// and fills it in with zeros where appropriate.
// 			// when returned this matrix becomes part of the selection_obj
// 			// FORMAT:
// 			// counts_matrix:{"82":[4,2,2],"84":[0,0,1],"137":[0,0,1],"214":[272,401,430]}}

// 		  //selection_obj = JSON.parse(selection_obj);
		  
// 		  var matrix = {};  
		  
// 		  var dataset_ids = selection_obj.dataset_ids;
// 		  var unit_assoc  = selection_obj.unit_assoc[field];  // TODO: change depending on user selection
// 		  var seq_freqs   = selection_obj.seq_freqs;      
// 		  //console.log('')
// 		  //    seq_ids  : [id1,id2,id3...],
// 		  //    tax_id1 : [tct1,0,tid3...],
// 		  //    tax_id2 : [tct4,tct5,tct6...],
// 		  //    tax_id3 : [tct7,tct8,0...]
// 		  //    ....
// 		  //  }

// 		  //var old_sid = 'x';
// 		  //var tids = [96,214,82,214,137];
// 		  //var vals = [2,103,8,203,3];

// 		  // for (i=0; i < tids.length; i++) {
// 		  //   id = tids[i]
// 		  //   if (id in tmp){
// 		  //     tmp[id][0] += vals[i]
// 		  //   } else {
// 		  //     tmp[id] = [vals[i]]
// 		  //   }
// 		  // }
// 		  var counts = {};
// 		  var unit_id_lookup = {};
// 		  var unit_ids = [];
// 		  var unit_id;
// 		  var tmp;
		  
// 		  for (var n=0; n < unit_assoc.length; n++) {

// 		        unit_ids = unit_assoc[n];
// 		        tmp = {};
// 		        counts[dataset_ids[n]] = {};
// 		        for (var i=0; i < unit_ids.length; i++) {
// 		            unit_id = unit_ids[i];
// 		            unit_id_lookup[unit_id]=1;
// 		            if (unit_id in tmp){
// 		              tmp[ unit_id ] += seq_freqs[n][i];
// 		            } else {
// 		              tmp[ unit_id ] = seq_freqs[n][i];
// 		            }
// 		        }
// 		        counts[ dataset_ids[n] ]=tmp;
// 		  }
// 		  //console.log(JSON.stringify(counts,null,4));
// 		 //console.log(unit_id_lookup);
// 		// { '82': 8, '96': 2, '137': 3, '214': 306 }
// 		// { '82': 4, '96': 2, '214': 33 }
// 		// { '82': 1, '96': 1, '137': 1, '214': 277 }
// 		// { '82': 6, '96': 1, '137': 1, '214': 596 }
// 		// { '82': 1, '84': 4, '96': 2, '112': 1, '137': 1, '214': 75 }
// 		// { '82': 2, '96': 1, '112': 1, '214': 331 }
// 		  //var mtx = "\t";
		  
// 		  //for(did in dataset_ids) {
// 		  for (var uid in unit_id_lookup) {  
// 		    matrix[uid]=[];
		    
// 		    for (var d in dataset_ids) { // this is correct order
// 		    	did = dataset_ids[d];

// 		      if(uid in counts[did]){
// 		        c = counts[did][uid];
// 		      }else{
// 		        c = 0;
// 		      }
// 		      matrix[uid].push(c);

// 		    }
// 		  }
// 		  return matrix;
// 		},

	

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
	
	if(ukeys === undefined) {
		max = 0;
	}else{
		for(n in biome_matrix.columns) {
		  	max_count[biome_matrix.columns[n].id] = 0;
		  	for(d in biome_matrix.data) {
		  		max_count[biome_matrix.columns[n].id] += biome_matrix.data[d][n];
		  	}
		}
		var max = 0;
		for(n in chosen_id_name_hash.names) { 		// correct order
		  	biome_matrix.column_totals.push(max_count[chosen_id_name_hash.names[n]]);
		  	if(max_count[chosen_id_name_hash.names[n]] > max){
		  		max = max_count[chosen_id_name_hash.names[n]];
		  	}
		}
	}
	biome_matrix.max_dataset_count = max;
	//console.log(max_count);
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
// function create_unit_name_lookup( did, name, counts, unit_name_lookup ) {
 	
//  	if(name in unit_name_lookup) {
//     for (var c in counts) {
//       unit_name_lookup[name][c] += counts[c];
//     }
//   }else{
//     unit_name_lookup[name] = [];
//     for (var c in counts) {
//       unit_name_lookup[name].push(counts[c]);
//     }
//   }
//   return unit_name_lookup;

// }
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
// function create_text_matrix( unit_names, dataset_names, dataset_ids, matrix_with_names) {

// 		// 
// 		// MTX  for input to R scripts
// 		//
// 		var mtx = '';
// 	  for (var did in dataset_ids) {
	    
// 	    var index = dataset_names.ids.indexOf( dataset_ids[did] );
// 	    mtx += "\t" + dataset_names.names[ index ];
// 	    matrix_with_names.dataset_names.push(dataset_names.names[ index ]);
// 	  }
// 	  mtx += "\n";
	  
// 	  matrix_with_names.unit_names = unit_names;
	  
// 	  for(var uname in unit_names) {
// 	    mtx += uname;
// 	    for (var c in unit_names[uname]) {
// 	      mtx += "\t" + unit_names[uname][c].toString();
// 	    }
// 	    mtx += "\n";
// 	  }
// 	  return mtx;
// }
//
//  A S S E M B L E  T A X A
//
// function assemble_taxa(depth, dict, row) {
// 				var tax,domain,phylum,klass,order,family,genus,species,strain;
// 				var d_id = row.domain_id+"_domain";	
// 				//console.log('d_id '+d_id.toString())	      	      
// 	      if(d_id in dict){
// 	      	domain = dict[d_id]["taxon"];
// 	      }else{
// 	      	domain = 'unknown';
// 	      }
// 	      tax = domain;
// 				if(depth === 'phylum') {
// 		      var p_id = row.phylum_id+"_phylum";		
// 		      if(p_id in dict){
// 		      	phylum = dict[p_id]["taxon"];
// 		      }else{
// 		      	phylum = 'phylum_NA';
// 		      }
// 		      //console.log(domain+';'+phylum)
// 		      tax = domain+';'+phylum;
// 		    }else if(depth === 'class' || depth === 'klass') {
// 		    	var p_id = row.phylum_id+"_phylum";	
// 		    	var k_id = row.klass_id+"_klass";	
// 		      if(p_id in dict){
// 		      	phylum = dict[p_id]["taxon"];
// 		      }else{
// 		      	phylum = 'phylum_NA';
// 		      }
// 		      if(k_id in dict){
// 		      	klass = dict[k_id]["taxon"];
// 		      }else{
// 		      	klass = 'class_NA';
// 		      }
// 		      //console.log(domain+';'+phylum+';'+klass)
// 		      tax = domain+';'+phylum+';'+klass;
// 		    }else if(depth === 'order') {
// 		    	var p_id = row.phylum_id+"_phylum";	
// 		    	var k_id = row.klass_id+"_klass";	
// 		    	var o_id = row.order_id+"_order";	
		    	
// 		      if(p_id in dict){
// 		      	phylum = dict[p_id]["taxon"];
// 		      }else{
// 		      	phylum = 'phylum_NA';
// 		      }
// 		      if(k_id in dict){
// 		      	klass = dict[k_id]["taxon"];
// 		      }else{
// 		      	klass = 'class_NA';
// 		      }
// 		      if(o_id in dict){
// 		      	order = dict[o_id]["taxon"];
// 		      }else{
// 		      	order = 'order_NA';
// 		      }
// 		      //console.log(domain+';'+phylum+';'+klass+';'+order);
// 		      tax = domain+';'+phylum+';'+klass+';'+order;
// 		    }else if(depth === 'family') {
// 		    	var p_id = row.phylum_id+"_phylum";	
// 		    	var k_id = row.klass_id+"_klass";	
// 		    	var o_id = row.order_id+"_order";	
// 		    	var f_id = row.family_id+"_family";
		    	
// 		      if(p_id in dict){
// 		      	phylum = dict[p_id]["taxon"];
// 		      }else{
// 		      	phylum = 'phylum_NA';
// 		      }
// 		      if(k_id in dict){
// 		      	klass = dict[k_id]["taxon"];
// 		      }else{
// 		      	klass = 'class_NA';
// 		      }
// 		      if(o_id in dict){
// 		      	order = dict[o_id]["taxon"];
// 		      }else{
// 		      	order = 'order_NA';
// 		      }
// 		      if(f_id in dict){
// 		      	family = dict[f_id]["taxon"];
// 		      }else{
// 		      	family = 'family_NA';
// 		      }
// 		      //console.log(domain+';'+phylum+';'+klass+';'+order+';'+family);
// 		      tax = domain+';'+phylum+';'+klass+';'+order+';'+family;
// 		    }else if(depth === 'genus') {
// 		    	var p_id = row.phylum_id+"_phylum";	
// 		    	var k_id = row.klass_id+"_klass";	
// 		    	var o_id = row.order_id+"_order";	
// 		    	var f_id = row.family_id+"_family";
// 		    	var g_id = row.genus_id+"_genus";
		    	
// 		      if(p_id in dict){
// 		      	phylum = dict[p_id]["taxon"];
// 		      }else{
// 		      	phylum = 'phylum_NA';
// 		      }
// 		      if(k_id in dict){
// 		      	klass = dict[k_id]["taxon"];
// 		      }else{
// 		      	klass = 'class_NA';
// 		      }
// 		      if(o_id in dict){
// 		      	order = dict[o_id]["taxon"];
// 		      }else{
// 		      	order = 'order_NA';
// 		      }
// 		      if(f_id in dict){
// 		      	family = dict[f_id]["taxon"];
// 		      }else{
// 		      	family = 'family_NA';
// 		      }
// 		      if(g_id in dict){
// 		      	genus = dict[g_id]["taxon"];
// 		      }else{
// 		      	genus = 'genus_NA';
// 		      }
// 		      //console.log(domain+';'+phylum+';'+klass+';'+order+';'+family+';'+genus);
// 		      tax = domain+';'+phylum+';'+klass+';'+order+';'+family+';'+genus;
// 		    }else if(depth === 'species') {
// 		    	var p_id = row.phylum_id+"_phylum";	
// 		    	var k_id = row.klass_id+"_klass";	
// 		    	var o_id = row.order_id+"_order";	
// 		    	var f_id = row.family_id+"_family";
// 		    	var g_id = row.genus_id+"_genus";
// 		    	var s_id = row.species_id+"_species";
// 		      if(p_id in dict){
// 		      	phylum = dict[p_id]["taxon"];
// 		      }else{
// 		      	phylum = 'phylum_NA';
// 		      }
// 		      if(k_id in dict){
// 		      	klass = dict[k_id]["taxon"];
// 		      }else{
// 		      	klass = 'class_NA';
// 		      }
// 		      if(o_id in dict){
// 		      	order = dict[o_id]["taxon"];
// 		      }else{
// 		      	order = 'order_NA';
// 		      }
// 		      if(f_id in dict){
// 		      	family = dict[f_id]["taxon"];
// 		      }else{
// 		      	family = 'family_NA';
// 		      }
// 		      if(g_id in dict){
// 		      	genus = dict[g_id]["taxon"];
// 		      }else{
// 		      	genus = 'genus_NA';
// 		      }
// 		      if(s_id in dict){
// 		      	species = dict[s_id]["taxon"];
// 		      }else{
// 		      	species = 'species_NA';
// 		      }
// 		      //console.log(domain+';'+phylum+';'+klass+';'+order+';'+family+';'+genus+';'+species);
// 		      tax = domain+';'+phylum+';'+klass+';'+order+';'+family+';'+genus+';'+species;
// 		    }else if(depth === 'strain') {
// 		    	var p_id = row.phylum_id+"_phylum";	
// 		    	var k_id = row.klass_id+"_klass";	
// 		    	var o_id = row.order_id+"_order";	
// 		    	var f_id = row.family_id+"_family";
// 		    	var g_id = row.genus_id+"_genus";
// 		    	var s_id = row.species_id+"_species";
// 		    	var st_id = row.strain_id+"_strain";
// 		      if(p_id in dict){
// 		      	phylum = dict[p_id]["taxon"];
// 		      }else{
// 		      	phylum = 'phylum_NA';
// 		      }
// 		      if(k_id in dict){
// 		      	klass = dict[k_id]["taxon"];
// 		      }else{
// 		      	klass = 'class_NA';
// 		      }
// 		      if(o_id in dict){
// 		      	order = dict[o_id]["taxon"];
// 		      }else{
// 		      	order = 'order_NA';
// 		      }
// 		      if(f_id in dict){
// 		      	family = dict[f_id]["taxon"];
// 		      }else{
// 		      	family = 'family_NA';
// 		      }
// 		      if(g_id in dict){
// 		      	genus = dict[g_id]["taxon"];
// 		      }else{
// 		      	genus = 'genus_NA';
// 		      }
// 		      if(s_id in dict){
// 		      	species = dict[s_id]["taxon"];
// 		      }else{
// 		      	species = 'species_NA';
// 		      }
// 		      if(st_id in dict){
// 		      	strain = dict[st_id]["taxon"];
// 		      }else{
// 		      	strain = 'strain_NA';
// 		      }
// 		      //console.log(domain+';'+phylum+';'+klass+';'+order+';'+family+';'+genus+';'+species+';'+strain);
// 		      tax = domain+';'+phylum+';'+klass+';'+order+';'+family+';'+genus+';'+species+';'+strain;
// 		    }

// 		    return tax;

// }
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

