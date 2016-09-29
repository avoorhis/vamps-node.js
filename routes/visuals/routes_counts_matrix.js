// counts_matrix.js
var path = require('path');
var fs = require('fs');
//var hdf5 = require('hdf5');
var COMMON  = require('./routes_common');
var C = require('../../public/constants');
var extend = require('util')._extend;
// biom format:dense: http://biom-format.org/documentation/format_versions/biom-1.0.html#example-biom-files
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


		get_biom_matrix: function(chosen_id_name_hash, post_items) {
			var date = new Date();
			var did,rank,db_tax_id,node_id,cnt,matrix_file;
			biom_matrix = {
					id: post_items.ts,
					format: "Biological Observation Matrix 0.9.1-dev",
					format_url:"http://biom-format.org/documentation/format_versions/biom-1.0.html",
					type: "OTU table",
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
			//GLOBAL.boim_matrix;
			var ukeys = [];
			var unit_name_lookup = {};
			var unit_name_lookup_per_dataset = {};
			var unit_name_counts = {};
		
			if(post_items.unit_choice === 'tax_rdp_simple') {
				taxonomy_object = new_rdp_taxonomy
			}else if(post_items.unit_choice === 'tax_silva119_simple'){
				taxonomy_object = new_taxonomy
			}else if(post_items.unit_choice === 'tax_silva119_custom'){
				taxonomy_object = new_taxonomy
			}else{
				taxonomy_object = new_taxonomy
			}
			// TESTING
			// data from DB or JSON_file or HTF5
			//var read_choices = ['DB','JSON','HTF5'];
			//var read_from = read_choices[0];
		  //if(read_from === 'JSON') {
			db_tax_id_list = {};
		  for (var n in chosen_id_name_hash.ids) { // has correct order
				
				  did = chosen_id_name_hash.ids[n];	

				  if(post_items.unit_choice === 'tax_silva119_simple' || post_items.unit_choice === 'tax_rdp_simple') {
				  		rank = post_items.tax_depth;
							rank_no = parseInt(C.RANKS.indexOf(rank))	+ 1;
							for(var x in TAXCOUNTS[did]){

								if((x.match(/_/g) || []).length == rank_no){

									var ids = x.split('_');   // x === _5_55184_61061_62018_62239_63445
									cnt = TAXCOUNTS[did][x];
									var tax_long_name = '';
									var domain = '';
									for(var y=1;y<ids.length;y++){  // must start at 1 because leading '_':  _2_55184
										var db_id = ids[y];
										var this_rank = C.RANKS[y-1];
										var db_id_n_rank = db_id+'_'+this_rank;
										//console.log('tax_node2 '+JSON.stringify(db_id_n_rank))
										var tax_node = {};
										if(db_id_n_rank in taxonomy_object.taxa_tree_dict_map_by_db_id_n_rank) {
											tax_node = taxonomy_object.taxa_tree_dict_map_by_db_id_n_rank[db_id_n_rank];
									  }
									  if(this_rank == 'domain'){
											domain = tax_node.taxon;
									  }
										
										if(tax_node.taxon == undefined){
											
											if(this_rank == 'klass'){
											    tax_long_name += 'class_NA;';
											}else{
											    tax_long_name += this_rank+'_NA;';
											}
										}else{
											tax_long_name += tax_node.taxon+';';
										}
                                        //console.log('tax_node3 '+JSON.stringify(tax_node))
									}
									
									tax_long_name = tax_long_name.slice(0,-1); // remove trailing ';'
									//console.log('long tax_name '+tax_long_name+' - '+cnt.toString());
									//console.log('IN NO NAs1')
									//console.log(tax_long_name.substring(tax_long_name.length-3,tax_long_name.length))
									//console.log('domain '+domain)
									//console.log(post_items.domains)
									// SCREEN INCLUDE_NAS
									// if selected domains excludes organelles then also exclude 'Bacteria;Cyanobacteria;Chloroplast'
									if(post_items.include_nas == 'no' ){
										if(tax_long_name.substring(tax_long_name.length-3,tax_long_name.length) != '_NA'){
											//console.log('ADDING '+tax_long_name)
											// SCREEN DOMAINS
											if( domain == 'Bacteria' 
													&& (post_items.domains.indexOf('Organelle') == -1) // Organelle has been de-selected
													&& tax_long_name.substring(0,34) == 'Bacteria;Cyanobacteria;Chloroplast'  // tax name starts with string

													){
														console.log('Excluding',tax_long_name)
											}else{
													if(post_items.domains.indexOf(domain) != -1){														
														unit_name_lookup[tax_long_name] = 1;
														unit_name_lookup_per_dataset = fillin_name_lookup_per_ds(unit_name_lookup_per_dataset, did, tax_long_name, cnt);
													}
											}

										}
										
									}else{
										// SCREEN DOMAINS
										if( domain == 'Bacteria' 
													&& (post_items.domains.indexOf('Organelle') == -1) // Organelle has been de-selected
													&& tax_long_name.substring(0,34) == 'Bacteria;Cyanobacteria;Chloroplast'  // tax name starts with string

													){
														console.log('Excluding',tax_long_name)
											}else{
													if(post_items.domains.indexOf(domain) != -1){
															unit_name_lookup[tax_long_name] = 1;
															unit_name_lookup_per_dataset = fillin_name_lookup_per_ds(unit_name_lookup_per_dataset, did, tax_long_name, cnt);
													}
											}
									}


								}

							}
				  
							

					}else if(post_items.unit_choice === 'tax_silva119_custom'){
								// ie custom_taxa: [ '1', '60', '61', '1184', '2120', '2261' ]  these are node_id(s)
								db_tax_id_list[did] = {};
								
								for(var t in post_items.custom_taxa) {
									//var name_n_rank = post_items.custom_taxa[t];
									var selected_node_id = post_items.custom_taxa[t];
									//console.log('selected_node_id ', selected_node_id)
									if( taxonomy_object.taxa_tree_dict_map_by_id.hasOwnProperty(selected_node_id) ){

										var tax_node = taxonomy_object.taxa_tree_dict_map_by_id[selected_node_id];
										//console.log(tax_node)
										var rank_name = tax_node.rank;
										var rank_no = parseInt(C.RANKS.indexOf(rank_name));
										//console.log('got one '+ rank_name)
									//console.log('name_n_rank',name_n_rank)
									//console.log('TAXCOUNTS[did]>>')
									//console.log(TAXCOUNTS[did])
									//console.log('<<TAXCOUNTS[did]')
									//for(var x in TAXCOUNTS[did]){
									//	var cnt = TAXCOUNTS[did][x]
										//var ids = x.split('_');// _3437_1749484_1819019_2223710_2287237_2311724_2240949_2062201: 9,
										// ids = ['','3437','1749484','1819019','2223710','2287237','2311724','2240949','2062201']
										//ids.shift(); // remove first -blank- item

										//temp = name_n_rank.split('_')
										//rank_name = temp[1]
										//rank_no = parseInt(C.RANKS.indexOf(rank_name));
										//console.log(rank_no,rank_name)
										// db_id = ids[rank_no]
										// //console.log(rank_name,rank_no,db_id)
										// db_id_n_rank = db_id+'_'+rank_name;
										//console.log('tax',testtax,db_id_n_rank,rank_name,rank_no,db_id)
										//if(name_n_rank in new_taxonomy.taxa_tree_dict_map_by_name_n_rank){
											db_tax_id_list[did][selected_node_id] = ''
											tax_long_name = '';
											//if(db_id_n_rank in new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank) {
											//tax_node = new_taxonomy.taxa_tree_dict_map_by_name_n_rank[name_n_rank];
											//console.log('tax_node', name_n_rank, tax_node);
											// // to get the counts we want to move up the parent tree to '0'
											// console.log(rank_no)
											// if(rank_no  === 0){
											// 	db_tax_id_list.did.name_n_rank.unshift(tax_node.db_id)  // add to beginning
											// }else if(rank_no  === 1) { // phylum
											// 	db_tax_id_list.did.name_n_rank.unshift(tax_node.db_id)  // add to beginning
											// 	parentnode = new_taxonomy.taxa_tree_dict_map_by_id[tax_node.parent_id]
											// }


											new_node_id = tax_node.parent_id
											db_tax_id_list[did][selected_node_id] = '_' + tax_node.db_id  // add to beginning
											tax_long_name = tax_node.taxon;
											while(new_node_id !== 0) {  		
												new_node = taxonomy_object.taxa_tree_dict_map_by_id[new_node_id];
									  		db_id = new_node.db_id;
									  		db_tax_id_list[did][selected_node_id] =  '_' + db_id + db_tax_id_list[did][selected_node_id];
									  		new_node_id = new_node.parent_id; 
									  		tax_long_name = new_node.taxon+';'+tax_long_name;
									  		 	
									  	}
									  	cnt = 0
									  	for(var id_chain in TAXCOUNTS[did]){
									  			//console.log('id_chain',id_chain)
									  			//if(id_chain.indexOf(db_tax_id_list[did][name_n_rank]) === 0){
									  			if(id_chain == db_tax_id_list[did][selected_node_id]){	
									  				//console.log('MATCH',db_tax_id_list[did][selected_node_id], id_chain);
									  				cnt = TAXCOUNTS[did][id_chain];
									  				break;
									  			}
									  	}
							  			//console.log('COUNT',cnt, rank_name, tax_long_name)
									  	if(post_items.include_nas == 'no' ){
										
												if(tax_long_name.substring(tax_long_name.length-3,tax_long_name.length) != '_NA'){
													//console.log('ADDING '+tax_long_name)
													// SCREEN DOMAINS
													//if(post_items.domains.indexOf(rank_name) != -1){
														//console.log('FOUND1',rank_name);
														unit_name_lookup[tax_long_name] = 1;
														unit_name_lookup_per_dataset = fillin_name_lookup_per_ds(unit_name_lookup_per_dataset, did, tax_long_name, cnt);
													//}
												}
												
											}else{
												// SCREEN DOMAINS
												//if(post_items.domains.indexOf(rank_name) != -1){
														//console.log('FOUND2',rank_name);
														unit_name_lookup[tax_long_name] = 1;
														unit_name_lookup_per_dataset = fillin_name_lookup_per_ds(unit_name_lookup_per_dataset, did, tax_long_name, cnt);
												//}
											}

											

									  }

								}
								
					}

			}
			
		
			unit_name_counts = create_unit_name_counts(unit_name_lookup, chosen_id_name_hash, unit_name_lookup_per_dataset);


			ukeys = remove_empty_rows(unit_name_counts);
			ukeys = ukeys.filter(onlyUnique);
			ukeys.sort();

			// Bacteria;Bacteroidetes;Bacteroidia;Bacteroidales;Bacteroidaceae;Bacteroides
			//console.log(unit_name_counts);
			//console.log('POSTx - from routes_counts_matrix.js');
			//console.log(post_items);

			biom_matrix 	= create_biom_matrix( biom_matrix, unit_name_counts, ukeys, chosen_id_name_hash );

			if(post_items.update_data === true || post_items.update_data === 1 || post_items.update_data === '1'){

				biom_matrix = this.get_custom_biom_matrix( post_items, biom_matrix );

			}else{
			// nothing here for the time being.....
			}

			matrix_file = '../../tmp/'+post_items.ts+'_count_matrix.biom';
			
			// For R:phyloseq object
			var tax_file = '../../tmp/'+post_items.ts+'_taxonomy.txt';
			COMMON.output_tax_file( tax_file, biom_matrix,C.RANKS.indexOf(post_items.tax_depth));

			//COMMON.write_file( matrix_file, JSON.stringify(biom_matrix) );
			COMMON.write_file( matrix_file, JSON.stringify(biom_matrix,null,2) );

			return biom_matrix;

			function onlyUnique(value, index, self) {
				return self.indexOf(value) === index;
			}

	},

		 //
  // GET CUSTOM BIOM MATRIX
  //
  get_custom_biom_matrix: function(visual_post_items, mtx) {
    var custom_count_matrix = extend({},mtx);  // this clones count_matrix which keeps original intact.

    var max_cnt = mtx.max_dataset_count,
        min     = visual_post_items.min_range,
        max     = visual_post_items.max_range,
        norm    = visual_post_items.normalization;

    //console.log('in custom biom '+max_cnt.toString());

        // Adjust for percent limit change
        var new_counts = [];
        var new_units = [];
        for(var c in custom_count_matrix.data) {

          var got_one = false;
          for(var k in custom_count_matrix.data[c]) {
            var thispct = (custom_count_matrix.data[c][k]*100)/custom_count_matrix.column_totals[k];
            if(thispct > min && thispct < max){
              got_one = true;
            }
          }

          if(got_one){
            new_counts.push(custom_count_matrix.data[c]);
            new_units.push(custom_count_matrix.rows[c]);
          }else{
            console.log('rejecting '+custom_count_matrix.rows[c].name);
          }
        }
        custom_count_matrix.data = new_counts;
        custom_count_matrix.rows = new_units;


        // Adjust for normalization
        var tmp1 = [];
        if (norm === 'maximum'|| norm === 'max') {
            console.log('calculating norm MAX')
						for(var cc in custom_count_matrix.data) {
              new_counts = [];
              for (var kc in custom_count_matrix.data[cc]) {
                  new_counts.push(parseInt( ( custom_count_matrix.data[cc][kc] * max_cnt ) / custom_count_matrix.column_totals[kc], 10) );

              }
              tmp1.push(new_counts);
            }
            custom_count_matrix.data = tmp1;
        }else if(norm === 'frequency' || norm === 'freq'){
            console.log('calculating norm FREQ')
						for (var cc1 in custom_count_matrix.data) {
              new_counts = [];
              for (var kc1 in custom_count_matrix.data[cc1]) {
                  new_counts.push(parseFloat( (custom_count_matrix.data[cc1][kc1] / custom_count_matrix.column_totals[kc1]).toFixed(6) ) );
              }
              tmp1.push(new_counts);
            }
            custom_count_matrix.data = tmp1;
        }else{
          // nothing here
					console.log('no-calculating norm NORM')
        }

        // re-calculate totals
        var tots = [];
        // TODO: "'tmp' is already defined."
	        var tmp2 = {};
        for(var cc2 in custom_count_matrix.data) {
          for(var kc2 in custom_count_matrix.data[cc2]) {
            if(kc2 in tmp2){
              tmp2[kc2] += custom_count_matrix.data[cc2][kc2];
            }else{
              tmp2[kc2] = custom_count_matrix.data[cc2][kc2];
            }
          }
        }
        for (var kc3 in custom_count_matrix.columns){
          tots.push(tmp2[kc3]);
        }
        custom_count_matrix.column_totals = tots;
        custom_count_matrix.shape = [ custom_count_matrix.rows.length, custom_count_matrix.columns.length ];

    //console.log('returning custom_count_matrix');
    return custom_count_matrix;
  },


};


//
//  R E M O V E  E M P T Y  R O W S
//
function remove_empty_rows(taxa_counts) {
		// remove empty rows:					
		
		var tmparr = [];
		for(var taxname in taxa_counts) {
			var sum = 0;
			for(var c in taxa_counts[taxname]){
				sum += taxa_counts[taxname][c];
				//console.log(k);
			}
			if(sum > 0){
				tmparr.push(taxname);
			}	  			
		}
		return tmparr;

}
//
//	C R E A T E  U N I T  N A M E  C O U N T S
//
function create_unit_name_counts(unit_name_lookup, chosen_id_name_hash, unit_name_lookup_per_dataset) {
		
		var taxa_counts={};
	
	  for(var tax_name in unit_name_lookup){
	  	taxa_counts[tax_name]=[];
	  }	
	
	
		for (var n in chosen_id_name_hash.ids) { // correct order
	  	did = chosen_id_name_hash.ids[n];				  	
	  	for (var tax_name1 in unit_name_lookup) {
	  		if(did in unit_name_lookup_per_dataset && tax_name1 in unit_name_lookup_per_dataset[did]) {
	  			cnt = unit_name_lookup_per_dataset[did][tax_name1];
	  			taxa_counts[tax_name1].push(cnt);
	  		} else {
	  			taxa_counts[tax_name1].push(0);
	  		}
	  	}
	  }
	  return taxa_counts;
}
//
//	F I L L I N  N A M E  L O O K U P  P E R  D S
//
function fillin_name_lookup_per_ds(lookup, did, tax_name, cnt) {
	
		
										
		if(did in lookup) {
  		if(tax_name in lookup[did]) {
  			lookup[did][tax_name] += parseInt(cnt);
  		}else{
  			lookup[did][tax_name] = parseInt(cnt);
  		}

  	}else{
  		lookup[did] = {};
  		if(tax_name in lookup[did]) {
  			lookup[did][tax_name] += parseInt(cnt);

  		}else{
  			lookup[did][tax_name] = parseInt(cnt);
  		}
  	}
  	return lookup;
}
//
//  C R E A T E  C O N C A T E N A T E D  T A X  N A M E
//
// function create_concatenated_tax_name(node_id) {		
// 		var tax_name = '';					  	
//   	while(node_id !== 0) {  		
//   		tax_name = new_taxonomy.taxa_tree_dict_map_by_id[node_id].taxon + ';' + tax_name;
//   		node_id = new_taxonomy.taxa_tree_dict_map_by_id[node_id].parent_id;  	
//   	}
//   	return tax_name.replace(/;+$/,'');  // remove trailing ';'

// }
//
//  F I N D  C O U N T  P E R  D S  A N D  R A N K
//
// function find_count_per_ds_and_rank(did, rank, db_tax_id) {
// 		cnt = 0;
//   	if(did in TaxaCounts) {
// 	  	if(rank in TaxaCounts[did]) {
// 		  	if(db_tax_id in TaxaCounts[did][rank]) {
// 		  		cnt = TaxaCounts[did][rank][db_tax_id];				  		
// 		  	}
// 	  	}
//   	}
//   	return cnt;
// }
//
//  C R E A T E  C O N C A T E N A T E D  T A X  N A M E
//
// function create_tax_name_list(node_id) {		
// 		var tax_name = [];					  	
//   	while(node_id !== 0) {  				  		
//   		//tax_name.unshift( new_taxonomy.taxa_tree_dict_map_by_id[node_id].taxon );
//   		tax_name = new_taxonomy.taxa_tree_dict_map_by_id[node_id].taxon  +';'+ tax_name;
//   		node_id = new_taxonomy.taxa_tree_dict_map_by_id[node_id].parent_id;
//   	}
//   	return tax_name.replace(/;+$/,''); // remove trailing ';'
//   	//return tax_name; // remove trailing ';'
// }
//
//
//
// function clean_custom_names(name_array) {
// 		name_array = name_array.filter(onlyUnique);
// 		name_array.sort(function(a, b){
// 				return b.length - a.length; // ASC -> a - b; DESC -> b - a
// 		});
		
// 		var ukeys2 = [];
// 		//ukeys.sort();
// 		var rank_num = 10; // too long rank to start
// 		console.log(name_array)
// 		for(var i in name_array) {
// 			got_one = true;
// 			for(n in ukeys2 ){
// 				if(ukeys2[n].indexOf(name_array[i]) === 0){
// 						console.log('MATCH! -no add '+ name_array[i]);
// 						got_one = false;
// 					}else{
// 						//console.log('add '+ukeys[i]+' test against '+ukeys2[n])
// 						//ukeys2.push(ukeys[i]);
// 						//got_one = true;
// 					}
// 			}
// 			if(got_one == true){
// 				ukeys2.push(name_array[i]);
// 			}
// 		}
// 		console.log('ukeys2')
// 		console.log(ukeys2);

// 		return ukeys2;
// }
//
//
//
function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}
//
//	C R E A T E  B I O M  M A T R I X
//
function create_biom_matrix(biom_matrix, unit_name_counts, ukeys, chosen_id_name_hash ) {
	
	//console.log(ukeys);  // uname:
	//console.log(chosen_id_name_hash);
	for (var n in chosen_id_name_hash.names) {   // correct order
	    //console.log(dataset_ids[did])
	    //biom_matrix.columns.push({ name: chosen_id_name_hash.names[n], did:chosen_id_name_hash.ids[n], metadata: {} });
	    biom_matrix.columns.push({ did: chosen_id_name_hash.ids[n], id: chosen_id_name_hash.names[n], metadata: null });
	}
	// ukeys is sorted by alpha
	for(var uk in ukeys) {
		
		biom_matrix.rows.push({ id: ukeys[uk], metadata: null });
		
		biom_matrix.data.push(unit_name_counts[ukeys[uk]]);
	}

	biom_matrix.shape = [biom_matrix.rows.length, biom_matrix.columns.length];
	
	var max_count = {};
	var max;
	if(ukeys === undefined) {
		max = 0;
	}else{
		for (var n1 in biom_matrix.columns) {
		  	max_count[biom_matrix.columns[n1].id] = 0;
		  	for(var d in biom_matrix.data) {
		  		max_count[biom_matrix.columns[n1].id] += biom_matrix.data[d][n1];
		  	}
		}
		max = 0;
		for (var n2 in chosen_id_name_hash.names) { 		// correct order
		  	biom_matrix.column_totals.push(max_count[chosen_id_name_hash.names[n2]]);
		  	if(max_count[chosen_id_name_hash.names[n2]] > max){
		  		max = max_count[chosen_id_name_hash.names[n2]];
		  	}
		}
	}
	biom_matrix.max_dataset_count = max;
	//console.log(max_count);
	return(biom_matrix);
}


