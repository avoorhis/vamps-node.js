var path = require('path');
var fs = require('fs');
var COMMON  = require('./routes_common');


module.exports = {


		write_metadata_file: function(chosen_id_name_hash, post_items, sqlrows) {
			console.log('in metadata')
			var test_metadata = ['blue_group','red_group'];
			//var txt = "project_dataset\tproject\tdataset\n";
			var txt = "project_dataset\tproject\tdataset\ttest_color_grouping\n";
			var meta_file = '../../tmp/'+post_items.ts+'_metadata.txt';
			var metadata = [];

			for(i in chosen_id_name_hash.names) {
				console.log(chosen_id_name_hash.names[i]);
				var ds = chosen_id_name_hash.names[i];
				var tmp = ds.split('--');
				if(i % 2 === 0){
					var c = test_metadata[0]
				}else{
					var c = test_metadata[1]
				}
				txt += ds + "\t" + tmp[0] + "\t" + tmp[1] +"\t"+c+ "\n";  // just put project and dataset in here for now				
				metadata.push({'project_dataset':ds,'project':tmp[0],'dataset':tmp[1],'test_color_group':c});

				//txt += ds + "\t" + tmp[0] + "\t" + tmp[1] + "\n";  // just put project and dataset in here for now				
				//metadata.push({'project_dataset':ds,'project':tmp[0],'dataset':tmp[1]});

			}
			//console.log('Writing metadata file');
 			
 			//COMMON.write_file( meta_file, txt );
 			return metadata
		}


}
