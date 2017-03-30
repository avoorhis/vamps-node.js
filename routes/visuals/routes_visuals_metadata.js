var path = require('path');
var fs = require('fs');
var COMMON  = require('./routes_common');




module.exports = {


		write_metadata_file: function(chosen_id_name_hash, post_items) {
			console.log('in metadata')
			var metadata_names = post_items.metadata;
			console.log(metadata_names)
			var metadata = [];
			var metadata2 = {};
			var file_name = post_items.ts+'_metadata.txt';
			var metadata_filename = path.join(__dirname, '../../tmp/'+file_name);
			var txt = 'DATASET';
			for (var n in metadata_names) {				
					var name = metadata_names[n];
					txt += 		"\t" + name;	
			}
			txt += 		"\tproject_dataset\n";
			var txt2 = '';
			for (var i in chosen_id_name_hash.names) {
				var ds_row = {};
				var pjds = chosen_id_name_hash.names[i];
				metadata2[pjds] = {};
				var tmp = pjds.split('--');
				var did = chosen_id_name_hash.ids[i];
				txt2 = pjds;
				
				for (var n in metadata_names) {				
					var mdname = metadata_names[n];
					if(mdname == 'env_package'){
						value = MD_ENV_PACKAGE[METADATA[did]['env_package_id']]
					}else if(mdname == 'env_biome'){
						value = MD_ENV_TERM[METADATA[did]['env_biome_id']]
					}else if(mdname == 'env_feature'){
						value = MD_ENV_TERM[METADATA[did]['env_feature_id']]
					}else if(mdname == 'env_matter'){
						value = MD_ENV_TERM[METADATA[did]['env_matter_id']]
					}else if(mdname == 'geo_loc_name'){
						value = MD_ENV_TERM[METADATA[did]['geo_loc_name_id']]
					}else if(mdname == 'sequencing_platform'){
						value = MD_SEQUENCING_PLATFORM[METADATA[did]['sequencing_platform_id']]
					}else if(mdname == 'dna_region'){
						value = MD_DNA_REGION[METADATA[did]['dna_region_id']]
					}else if(mdname == 'target_gene'){
						value = MD_TARGET_GENE[METADATA[did]['target_gene_id']]
					}else if(mdname == 'domain'){
						value = MD_DOMAIN[METADATA[did]['domain_id']]
					}else if(mdname == 'adapter_sequence'){
						value = MD_ADAPTER_SEQUENCE[METADATA[did]['adapter_sequence_id']]
					}else if(mdname == 'index_sequence'){
						value = MD_INDEX_SEQUENCE[METADATA[did]['index_sequence_id']]
					}else if(mdname == 'primer_suite'){
						value = MD_PRIMER_SUITE[METADATA[did]['primer_suite_id']]
					}else{
						value = METADATA[did][mdname];
					}
					//console.log('VALUE: '+value)

			

					if(did in METADATA) {
						ds_row[mdname] = value
						metadata2[pjds][mdname] = value
						
						if(value == '' || value == undefined){
							txt2 += "\tundefined";
						}else{
							txt2 += "\t" + value
						}
					}else{
						txt2 += "\tno_value";
					}
				}
				
				
				if(txt2.length > pjds.length+2){  // the +2 is to account for tabs in the txt2
					txt += txt2 + "\t"+pjds+"\n";
				}
				metadata2[pjds].project = tmp[0];
				metadata2[pjds].dataset = tmp[1];
				
				ds_row.project_dataset = pjds;
				ds_row.project = tmp[0];
				ds_row.dataset = tmp[1];

				metadata.push(ds_row);
				
			}
			COMMON.write_file(metadata_filename, txt);
			return metadata2;
		},
		//
		//
		//
		write_mapping_file: function(chosen_id_name_hash, post_items) {
			//console.log('in metadata')
			var metadata_names = post_items.metadata;
			
			var metadata = [];
			var metadata2 = {};
			var file_name = post_items.ts+'_metadata.txt';
			var metadata_filename = path.join(__dirname, '../../tmp/'+file_name);
			var txt = "#SampleID";
			for (var n in metadata_names) {				
					var name = metadata_names[n];
					txt += 		"\t" + name;	
			}
			txt += 		"\tProject\tDescription\n";
			var txt2 = '';
			for (var i in chosen_id_name_hash.names) {
				var ds_row = {};
				var pjds = chosen_id_name_hash.names[i];
				metadata2[pjds] = {};
				var tmp = pjds.split('--');
				var did = chosen_id_name_hash.ids[i];
				txt2 = pjds;
				
				for (var n in metadata_names) {				
					var mdname = metadata_names[n];
                    if(mdname == 'env_package'){
						value = MD_ENV_PACKAGE[METADATA[did]['env_package_id']]
						console.log(mdname+' VALUE: '+JSON.stringify(METADATA[did]))
						console.log(MD_ENV_PACKAGE)
					}else if(mdname == 'env_biome'){
						value = MD_ENV_TERM[METADATA[did]['env_biome_id']]
					}else if(mdname == 'env_feature'){
						value = MD_ENV_TERM[METADATA[did]['env_feature_id']]
					}else if(mdname == 'env_matter'){
						value = MD_ENV_TERM[METADATA[did]['env_matter_id']]
					}else if(mdname == 'geo_loc_name'){
						value = MD_ENV_TERM[METADATA[did]['geo_loc_name_id']]
					}else if(mdname == 'sequencing_platform'){
						value = MD_SEQUENCING_PLATFORM[METADATA[did]['sequencing_platform_id']]
					}else if(mdname == 'dna_region'){
						value = MD_DNA_REGION[METADATA[did]['dna_region_id']]
					}else if(mdname == 'target_gene'){
						value = MD_TARGET_GENE[METADATA[did]['target_gene_id']]
					}else if(mdname == 'sequencing_platform'){
						value = MD_SEQUENCING_PLATFORM[METADATA[did]['sequencing_platform_id']]
					}else if(mdname == 'domain'){
						value = MD_DOMAIN[METADATA[did]['domain_id']]
					}else if(mdname == 'adapter_sequence'){
						value = MD_ADAPTER_SEQUENCE[METADATA[did]['adapter_sequence_id']]
					}else if(mdname == 'index_sequence'){
						value = MD_INDEX_SEQUENCE[METADATA[did]['index_sequence_id']]
					}else if(mdname == 'primer_suite'){
						value = MD_PRIMER_SUITE[METADATA[did]['primer_suite_id']]
					}else{
						value = METADATA[did][mdname];
					}
					




					if(did in METADATA) {
						ds_row[mdname] = value;
						metadata2[pjds][mdname] = value;
						if(metadata2[pjds][mdname] == ''){
							txt2 += "\tundefined";
						}else{
							txt2 += "\t" + value;
						}
					}else{
						txt2 += "\tno_value";
					}
				}
				
				//if(txt2.length > pjds.length+2){  // the +2 is to account for tabs in the txt2
					txt += txt2 + "\t"+tmp[0]+ "\t"+pjds+"\n";
				//}
				metadata2[pjds].project = tmp[0];
				metadata2[pjds].dataset = tmp[1];
				
				ds_row.project_dataset = pjds;
				ds_row.project = tmp[0];
				ds_row.dataset = tmp[1];

				metadata.push(ds_row);
				
			}
			COMMON.write_file(metadata_filename, txt);
			return metadata2;
		},
		//
		//
		//
		create_metadata_table: function(chosen_id_name_hash, visual_post_items) {
				var html = "<table border='1' id='metadata_table' class='single_border center_table'>";
				html += "<thead><tr><th>Dataset (sortable)</th><th>Name (sortable)</th><th>Value (sortable)</th></tr></thead><tbody>";
				var found_metadata = false;
				for (var i in chosen_id_name_hash.ids) {
						var did = chosen_id_name_hash.ids[i];
						var ds = chosen_id_name_hash.names[i];

						for(var md_name in METADATA[did]) {	
							found_metadata = true;				

							var md_value = METADATA[did][md_name];
							if(visual_post_items.metadata.indexOf(md_name) !== -1) {  // only show selected metadata names
									html += "<tr><td>"+ds+"</td><td>"+md_name+"</td><td>"+md_value+"</td></tr>";
									
							}
						}
				}
				html += "</tbody></table>";
				
				
				if( ! found_metadata){
					html = "<h2>No Metadata Found</h2>";
				}if( visual_post_items.metadata.length === 0){
					html = "<h2>No Metadata Selected</h2>";
				}
				
				return html;
		}

		
}

