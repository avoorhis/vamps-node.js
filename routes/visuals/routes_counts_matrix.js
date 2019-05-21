// counts_matrix.js
var path = require('path');
var fs = require('fs-extra');
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


	get_biom_matrix: function(req, post_items, write_file) {
		var date = new Date();
		var did, rank, db_tax_id, node_id, cnt, matrix_file;
		var biom_matrix_start = {
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
		//var ukeys = [];


		var biom_matrix = fill_out_taxonomy(req, biom_matrix_start, post_items, write_file)
		//console.log('biom_matrix')
		//console.log(biom_matrix)
		//console.log('//////////////////////////////////////////////////////////////')
		return biom_matrix

	},





	//


};


//
//
//
// GET CUSTOM BIOM MATRIX
//
function get_updated_biom_matrix(post_items, mtx) {
	console.log('in UPDATED biom_matrix')
	var custom_count_matrix = extend({},mtx);  // this clones count_matrix which keeps original intact.

	var max_cnt = mtx.max_dataset_count,
			min     = post_items.min_range,
			max     = post_items.max_range,
			norm    = post_items.normalization;

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
}

//

//
//
function get_file_prefix(req, unit_choice) {
	var files_prefix;
	if (unit_choice === 'tax_rdp2.6_simple'){
		files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE + "--datasets_rdp2.6");
	} else if (unit_choice === 'tax_generic_simple'){
		files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE + "--datasets_generic");
	} else {
		files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE + "--datasets_" + C.default_taxonomy.name);  // default
	}
	return files_prefix;
}

function get_taxonomy_object(unit_choice) {
	var taxonomy_object;
	if (unit_choice === 'tax_rdp2.6_simple') {
		taxonomy_object = new_rdp_taxonomy;
	} else if (unit_choice === 'tax_generic_simple'){
		taxonomy_object = new_generic_taxonomy;
	}else{
		taxonomy_object = new_taxonomy;
	}
	return taxonomy_object;
}

function taxonomy_unit_choice_simple(taxcounts, rank, taxonomy_object, did) {
	let unit_name_lookup = {};
	let unit_name_lookup_per_dataset = {};
	let rank_no = parseInt(C.RANKS.indexOf(rank))	+ 1;
	for(let x in taxcounts){
		//console.log('new_taxonomy',taxonomy_object.taxa_tree_dict_map_by_db_id_n_rank)

		if((x.match(/_/g) || []).length === rank_no){

			let ids = x.split('_');   // x === _5_55184_61061_62018_62239_63445

			let cnt = taxcounts[x];
			let tax_long_name = '';
			let domain = '';
			//TODO: this for to func
			for (let y=1; y<ids.length; y++){  // must start at 1 because leading '_':  _2_55184
				let db_id = ids[y];
				let this_rank = C.RANKS[y-1];
				let db_id_n_rank = db_id+'_'+this_rank;
				//console.log('tax_node2 '+JSON.stringify(db_id_n_rank))
				let tax_node = {};
				if(db_id_n_rank in taxonomy_object.taxa_tree_dict_map_by_db_id_n_rank) {
					tax_node = taxonomy_object.taxa_tree_dict_map_by_db_id_n_rank[db_id_n_rank];
				}
				if(this_rank === 'domain'){
					domain = tax_node.taxon;
				}

				if(tax_node.taxon === undefined){

					if(this_rank === 'klass'){
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
			unit_name_lookup[tax_long_name] = 1;
			unit_name_lookup_per_dataset = fillin_name_lookup_per_ds(unit_name_lookup_per_dataset, did, tax_long_name, cnt);
		}
	}
	return [unit_name_lookup, unit_name_lookup_per_dataset];
}

function fill_out_taxonomy(req, biom_matrix, post_items, write_file){
	console.log('IN routes_counts_matrix::fill_out_taxonomy');
	let db_tax_id_list = {};
	//console.log(post_items)
	let files_prefix = get_file_prefix(req, post_items.unit_choice);
	let taxonomy_object = get_taxonomy_object(req, post_items.unit_choice);
	let unit_name_lookup = {};
	let unit_name_lookup_per_dataset = {};
	let taxcounts;
	for (let i in post_items.chosen_datasets) { // has correct order
		let did = post_items.chosen_datasets[i].did;
		try{
			let path_to_file = path.join(files_prefix, did +'.json');
			let jsonfile = require(path_to_file);
			taxcounts = jsonfile['taxcounts'];
		}
		catch(err){
			console.log('2-no file '+err.toString()+' Exiting');
			let file_found_error = true; // Never used!
			//res.redirect('visuals_index');
			//return;
		}

		//console.log(did)
		let rank = post_items.tax_depth;
		//console.log('rank: '+rank)
		//if(post_items.unit_choice === 'tax_'+C.default_taxonomy.name+'_simple' || post_items.unit_choice === 'tax_rdp2.6_simple'|| post_items.unit_choice === 'tax_generic_simple') {
		let unit_choice_simple = post_items.unit_choice.substr(post_items.unit_choice.length - 6) === 'simple';
		let unit_choice_custom = post_items.unit_choice === 'tax_' + C.default_taxonomy.name + '_custom';
		let res;
		if (unit_choice_simple) {
			res = taxonomy_unit_choice_simple(taxcounts, rank, taxonomy_object, did);
			unit_name_lookup = res[0];
			unit_name_lookup_per_dataset = res[1]
		}
		// {
		// 	rank_no = parseInt(C.RANKS.indexOf(rank))	+ 1;
		// 	for(let x in taxcounts){
		// 		//console.log('new_taxonomy',taxonomy_object.taxa_tree_dict_map_by_db_id_n_rank)
		//
		// 		if((x.match(/_/g) || []).length === rank_no){
		//
		// 			let ids = x.split('_');   // x === _5_55184_61061_62018_62239_63445
		//
		// 			let cnt = taxcounts[x];
		// 			let tax_long_name = '';
		// 			let domain = '';
		// 			for (let y=1; y<ids.length; y++){  // must start at 1 because leading '_':  _2_55184
		// 				let db_id = ids[y];
		// 				let this_rank = C.RANKS[y-1];
		// 				let db_id_n_rank = db_id+'_'+this_rank;
		// 				//console.log('tax_node2 '+JSON.stringify(db_id_n_rank))
		// 				let tax_node = {};
		// 				if(db_id_n_rank in taxonomy_object.taxa_tree_dict_map_by_db_id_n_rank) {
		// 					tax_node = taxonomy_object.taxa_tree_dict_map_by_db_id_n_rank[db_id_n_rank];
		// 				}
		// 				if(this_rank == 'domain'){
		// 					domain = tax_node.taxon;
		// 				}
		//
		// 				if(tax_node.taxon == undefined){
		//
		// 					if(this_rank == 'klass'){
		// 						tax_long_name += 'class_NA;';
		// 					}else{
		// 						tax_long_name += this_rank+'_NA;';
		// 					}
		// 				}else{
		// 					tax_long_name += tax_node.taxon+';';
		// 				}
		// 				//console.log('tax_node3 '+JSON.stringify(tax_node))
		// 			}
		//
		// 			tax_long_name = tax_long_name.slice(0,-1); // remove trailing ';'
		// 			unit_name_lookup[tax_long_name] = 1;
		// 			unit_name_lookup_per_dataset = fillin_name_lookup_per_ds(unit_name_lookup_per_dataset, did, tax_long_name, cnt);
		// 		}
		// 	}
		//
		// }
		//
		else if (unit_choice_custom) {
			// ie custom_taxa: [ '1', '60', '61', '1184', '2120', '2261' ]  these are node_id(s)
			db_tax_id_list[did] = {};

			for (let t in post_items.custom_taxa) {
				//let name_n_rank = post_items.custom_taxa[t];
				let selected_node_id = post_items.custom_taxa[t];
				//console.log('selected_node_id ', selected_node_id)
				if (taxonomy_object.taxa_tree_dict_map_by_id.hasOwnProperty(selected_node_id)) {

					let tax_node  = taxonomy_object.taxa_tree_dict_map_by_id[selected_node_id];
					//console.log(tax_node)
					let rank_name = tax_node.rank;
					let rank_no   = parseInt(C.RANKS.indexOf(rank_name));

					db_tax_id_list[did][selected_node_id] = ''
					tax_long_name                         = '';

					new_node_id                           = tax_node.parent_id;
					db_tax_id_list[did][selected_node_id] = '_' + tax_node.db_id  // add to beginning
					tax_long_name                         = tax_node.taxon;
					while (new_node_id !== 0) {
						new_node                              = taxonomy_object.taxa_tree_dict_map_by_id[new_node_id];
						db_id                                 = new_node.db_id;
						db_tax_id_list[did][selected_node_id] = '_' + db_id + db_tax_id_list[did][selected_node_id];
						new_node_id                           = new_node.parent_id;
						tax_long_name                         = new_node.taxon + ';' + tax_long_name;

					}
					cnt = 0;
					for (let id_chain in taxcounts) {
						//console.log('id_chain',id_chain)
						//if(id_chain.indexOf(db_tax_id_list[did][name_n_rank]) === 0){
						if (id_chain == db_tax_id_list[did][selected_node_id]) {
							//console.log('MATCH',db_tax_id_list[did][selected_node_id], id_chain);
							cnt = taxcounts[id_chain];
							break;
						}
					}
					unit_name_lookup[tax_long_name] = 1;
					unit_name_lookup_per_dataset    = fillin_name_lookup_per_ds(unit_name_lookup_per_dataset, did, tax_long_name, cnt);
				}

			}

		} else {
			console.log('unit_choice error');
		}

	}

	unit_name_counts = create_unit_name_counts(unit_name_lookup, post_items, unit_name_lookup_per_dataset);
	ukeys = remove_empty_rows(unit_name_counts);
	ukeys = ukeys.filter(onlyUnique);
	ukeys.sort();
	// Bacteria;Bacteroidetes;Bacteroidia;Bacteroidales;Bacteroidaceae;Bacteroides
	//console.log(unit_name_counts);
	//console.log('POSTx - from routes_counts_matrix.js');
	//console.log(post_items);

	biom_matrix 	= create_biom_matrix( biom_matrix, unit_name_counts, ukeys, post_items );
	if(post_items.update_data === true || post_items.update_data === 1 || post_items.update_data === '1'){
		biom_matrix = get_updated_biom_matrix( post_items, biom_matrix );

	}else{
		// nothing here for the time being.....
	}


	if(write_file == true || write_file == undefined){
		let tax_file = '../../tmp/'+post_items.ts+'_taxonomy.txt';
		COMMON.output_tax_file( tax_file, biom_matrix, C.RANKS.indexOf(post_items.tax_depth));

		matrix_file = '../../tmp/'+post_items.ts+'_count_matrix.biom';
		//COMMON.write_file( matrix_file, JSON.stringify(biom_matrix) );
		COMMON.write_file( matrix_file, JSON.stringify(biom_matrix,null,2) );
	}
	return biom_matrix;

	function onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}
}
//
//
//
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
function create_unit_name_counts(unit_name_lookup, post_items, unit_name_lookup_per_dataset) {

	var taxa_counts={};
	for(var tax_name in unit_name_lookup){
		taxa_counts[tax_name]=[];
	}

	//console.log('unit_name_lookup')
	//console.log(unit_name_lookup)
	for (var i in post_items.chosen_datasets) { // correct order
		var did = post_items.chosen_datasets[i].did
		for (var tax_name1 in unit_name_lookup) {
			if(did in unit_name_lookup_per_dataset && tax_name1 in unit_name_lookup_per_dataset[did]) {
				cnt = unit_name_lookup_per_dataset[did][tax_name1];
				taxa_counts[tax_name1].push(cnt);
			} else {
				taxa_counts[tax_name1].push(0);
			}
		}
	}
	//console.log('taxa_counts')
	//console.log(taxa_counts)
	return taxa_counts;
}
//
//	F I L L I N  N A M E  L O O K U P  P E R  D S
//
function fillin_name_lookup_per_ds(lookup, did, tax_name, cnt) {


	//console.log('lookup1')
	//console.log(lookup)
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
	//console.log('lookup2')
	//console.log(lookup)
	return lookup;
}
//
//
//
function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}
//
//	C R E A T E  B I O M  M A T R I X
//
function create_biom_matrix(biom_matrix, unit_name_counts, ukeys, post_items ) {

	console.log('in create_biom_matrix');  // uname:


	for (var i in post_items.chosen_datasets) {   // correct order
		var did = post_items.chosen_datasets[i].did
		var dname = post_items.chosen_datasets[i].name
		//console.log(dataset_ids[did])
		//biom_matrix.columns.push({ name: chosen_id_name_hash.names[n], did:chosen_id_name_hash.ids[n], metadata: {} });
		biom_matrix.columns.push({ did: did, id: dname, metadata: null });
	}
	// ukeys is sorted by alpha
	for(var uk in ukeys) {

		biom_matrix.rows.push({ id: ukeys[uk], metadata: null });

		biom_matrix.data.push(unit_name_counts[ukeys[uk]]);
	}
	//  console.log('biom_matrix.rows');
// 	console.log(biom_matrix.rows);
// 	console.log('biom_matrix.data');
// 	console.log(biom_matrix.data);
	biom_matrix.shape = [biom_matrix.rows.length, biom_matrix.columns.length];

	var max_count = {};
	var max;
	if(ukeys === undefined) {
		max = 0;
	}else{
		for (var n in biom_matrix.columns) {
			max_count[biom_matrix.columns[n].id] = 0;  //id is the NAME of the dataset in biom
			for(var d in biom_matrix.data) {
				max_count[biom_matrix.columns[n].id] += biom_matrix.data[d][n];
			}
		}
		max = 0;
		for (var i in post_items.chosen_datasets) { 		// correct order
			var dname = post_items.chosen_datasets[i].name
			biom_matrix.column_totals.push(max_count[dname]);
			if(max_count[dname] > max){
				max = max_count[dname];
			}
		}
	}
	//console.log('in create_biom_matrix1');
	biom_matrix.max_dataset_count = max;
	// console.log('in create_biom_matrix2');
// 	console.log(biom_matrix);
// 	console.log(max_count);
	return(biom_matrix);
}