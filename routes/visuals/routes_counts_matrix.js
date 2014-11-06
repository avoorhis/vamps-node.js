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
			
			var ukeys = [];
			var unit_name_lookup = {};
			var unit_name_lookup_per_dataset = {};
			var unit_name_counts = {};
		  
			// TESTING
			// data from DB or JSON_file or HTF5
			//var read_choices = ['DB','JSON','HTF5'];
			//var read_from = read_choices[0];
		  //if(read_from === 'JSON') {
				  
		  for (var n in chosen_id_name_hash.ids) { // has correct order
				  
				  did = chosen_id_name_hash.ids[n];	

				  if(post_items.unit_choice === 'tax_silva108_simple') {

						  rank = post_items.tax_depth;
						  //console.log('did '+did+' rank: '+rank);
						  		  
						  for(var r in new_taxonomy.taxa_tree_dict_map_by_rank[rank]) {
						  	
						  	db_tax_id = new_taxonomy.taxa_tree_dict_map_by_rank[rank][r].db_id;
						  	node_id   = new_taxonomy.taxa_tree_dict_map_by_rank[rank][r].node_id;	
						  	
								var tax_long_name = create_concatenated_tax_name(node_id);	
								unit_name_lookup[tax_long_name] = 1;					  	
						  	ukeys.push(tax_long_name);	

						  	cnt = find_count_per_ds_and_rank(did, rank, db_tax_id);		// This uses TaxaCounts created in app.js from JSON file  	
						  	
						  	unit_name_lookup_per_dataset = fillin_name_lookup_per_ds(unit_name_lookup_per_dataset, did, tax_long_name, cnt);		 	
					   
					    }	

			    }else if(post_items.unit_choice === 'tax_silva108_custom'){

			    		for(var t in post_items.custom_taxa) {
							 		//console.log(post_items.custom_taxa[t])
							 		var name_and_rank  = post_items.custom_taxa[t]
							 		var items          = name_and_rank.split('_');
							 		var tax_short_name = items[0];							 		
							 		rank           = items[1];
							 		db_tax_id = new_taxonomy.taxa_tree_dict_map_by_name_n_rank[name_and_rank].db_id;
							 		node_id   = new_taxonomy.taxa_tree_dict_map_by_name_n_rank[name_and_rank].node_id;
							 		
							 		var tax_long_name = create_concatenated_tax_name(node_id);
							 		unit_name_lookup[tax_long_name] = 1;
									ukeys.push(tax_long_name);

							 		cnt = find_count_per_ds_and_rank(did, rank, db_tax_id);
							  	
							  	unit_name_lookup_per_dataset = fillin_name_lookup_per_ds(unit_name_lookup_per_dataset, did, tax_long_name, cnt);						   
						  
						  }  // END :: for(t in post_items.custom_taxa) {				


			    }				    
			}
			ukeys = ukeys.filter(onlyUnique);
		  ukeys.sort();

			unit_name_counts = create_unit_name_counts(unit_name_lookup, chosen_id_name_hash, unit_name_lookup_per_dataset);	
			
			ukeys = remove_empty_rows(unit_name_counts, ukeys);	


		  // Bacteria;Bacteroidetes;Bacteroidia;Bacteroidales;Bacteroidaceae;Bacteroides
		  //console.log(unit_name_counts);
		  //console.log(ukeys);
		  biom_matrix 	= create_biom_matrix( biom_matrix, unit_name_counts, ukeys, chosen_id_name_hash );
		  
		  matrix_file = '../../tmp/'+post_items.ts+'_count_matrix.biom';
		    
			console.log('Writing matrix file');
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
    
    var max_cnt = visual_post_items.max_ds_count,
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
            console.log('rejecting '+custom_count_matrix.rows[c].id);
          }
        }
        custom_count_matrix.data = new_counts;
        custom_count_matrix.rows = new_units;
                

        // Adjust for normalization
        var tmp = [];
        if (norm === 'max') {
            for(var c in custom_count_matrix.data) {
              var new_counts = [];
              for(var k in custom_count_matrix.data[c]) {                
                  new_counts.push(parseInt( ( custom_count_matrix.data[c][k] * max_cnt ) / custom_count_matrix.column_totals[k], 10) );                  
              }    
              tmp.push(new_counts);              
            }
            custom_count_matrix.data = tmp;
        }else if(norm === 'freq'){
            for(var c in custom_count_matrix.data) {              
              var new_counts = [];
              for(var k in custom_count_matrix.data[c]) {                
                  new_counts.push(parseFloat( custom_count_matrix.data[c][k] / custom_count_matrix.column_totals[k].toFixed(8) ) );                    
              }    
              tmp.push(new_counts);
            }
            custom_count_matrix.data = tmp;
        }else{
          // nothing here
        }

        // re-calculate totals
        var tots = [];
        var tmp = {};
        for(var c in custom_count_matrix.data) {
          for(var k in custom_count_matrix.data[c]) {
            if(k in tmp){
              tmp[k] += custom_count_matrix.data[c][k];
            }else{
              tmp[k] = custom_count_matrix.data[c][k];
            }            
          }
        }
        for(var k in custom_count_matrix.columns){
          tots.push(tmp[k]);
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
function remove_empty_rows(taxa_counts, ukeys) {
		// remove empty rows:					
		
		for(var taxname in taxa_counts) {
			var sum = 0;
			for(var c in taxa_counts[taxname]){
				sum += taxa_counts[taxname][c];
				//console.log(k);
			}
			if(sum===0){
				// just need to remove names from ukeys and zero rows
				// will be removed from data rows in create_biom_matrix()
				var idx = ukeys.indexOf(taxname);
				ukeys.splice(idx,1);
			}		  			
		}
		return ukeys;

}
//
//	C R E A T E  U N I T  N A M E  C O U N T S
//
function create_unit_name_counts(unit_name_lookup, chosen_id_name_hash, unit_name_lookup_per_dataset) {
		
		var taxa_counts={};
	  
	  for(tax_name in unit_name_lookup){
	  	taxa_counts[tax_name]=[];
	  }	
	  
	  
		for (var n in chosen_id_name_hash.ids) { // correct order
	  	did = chosen_id_name_hash.ids[n];				  	
	  	for(var tax_name in unit_name_lookup) {
	  		if(did in unit_name_lookup_per_dataset && tax_name in unit_name_lookup_per_dataset[did]) {
	  			cnt = unit_name_lookup_per_dataset[did][tax_name];
	  			taxa_counts[tax_name].push(cnt);
	  		} else {
	  			taxa_counts[tax_name].push(0);
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
//  F I N D  C O U N T  P E R  D S  A N D  R A N K
//
function find_count_per_ds_and_rank(did, rank, db_tax_id) {
		var cnt = 0
  	if(did in TaxaCounts) {
	  	if(rank in TaxaCounts[did]) {
		  	if(db_tax_id in TaxaCounts[did][rank]) {
		  		cnt = TaxaCounts[did][rank][db_tax_id];				  		
		  	}
	  	}
  	}
  	return cnt
}
//
//  C R E A T E  C O N C A T E N A T E D  T A X  N A M E
//
function create_concatenated_tax_name(node_id) {		
		var tax_name = '';					  	
  	while(node_id !== 0) {  				  		
  		tax_name = new_taxonomy.taxa_tree_dict_map_by_id[node_id].taxon + ';' + tax_name;
  		node_id = new_taxonomy.taxa_tree_dict_map_by_id[node_id].parent_id;
  	}
  	return tax_name.replace(/;+$/,'');  // remove trailing ';'

}
//
//	C R E A T E  B I O M E  M A T R I X
//
function create_biom_matrix(biom_matrix, unit_name_counts, ukeys, chosen_id_name_hash ) {
	
	//console.log(ukeys);  // uname:
	//console.log(chosen_id_name_hash);
	for (var n in chosen_id_name_hash.names) {   // correct order
	    //console.log(dataset_ids[did])
	    biom_matrix.columns.push({ id: chosen_id_name_hash.names[n], metadata: {} });
	}
	// ukeys is sorted by alpha
	for(var uk in ukeys) {
		
		biom_matrix.rows.push({ id: ukeys[uk], metadata: {} });
		
		biom_matrix.data.push(unit_name_counts[ukeys[uk]]);
	}

	biom_matrix.shape = [biom_matrix.rows.length, biom_matrix.columns.length];
	
	var max_count = {};
	var max;
	if(ukeys === undefined) {
		max = 0;
	}else{
		for(var n in biom_matrix.columns) {
		  	max_count[biom_matrix.columns[n].id] = 0;
		  	for(d in biom_matrix.data) {
		  		max_count[biom_matrix.columns[n].id] += biom_matrix.data[d][n];
		  	}
		}
		max = 0;
		for(var n in chosen_id_name_hash.names) { 		// correct order
		  	biom_matrix.column_totals.push(max_count[chosen_id_name_hash.names[n]]);
		  	if(max_count[chosen_id_name_hash.names[n]] > max){
		  		max = max_count[chosen_id_name_hash.names[n]];
		  	}
		}
	}
	biom_matrix.max_dataset_count = max;
	//console.log(max_count);
	return(biom_matrix);
}


