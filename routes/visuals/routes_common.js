// common.js



module.exports = {

	get_selection_markup: function( visual, body ) {
	  var html = "<div id='' class='selection_info'>";
	  if(visual === 'heatmap') {
	    html += '<li>Selected Distance Metric: ' + body.selected_heatmap_distance + '</li>';
	  }
	  if(visual === 'dendrogram') {
	    html += '<li>Selected Distance Metric: ' + body.selected_dendrogram_distance + '</li>';
	  }
	  html += '<li>Maximum Dataset Count: ' + body.max_ds_count.toString() + '</li>';
	  if(body.unit_choice.indexOf('tax') === 0 ) {
	    html += '<li>Included Domains: ' + body.domains     + '</li>';
	    html += '<li>Include NAs?: '     + body.include_nas + '</li>';
	    html += '<li>Taxonomic Depth: '  + body.tax_depth   + '</li>';
	  }
	  html += '<li>Normalization: ' + body.normalization + '</li>';
	  html += '</div>';
	  return html;
	},


	//
	//
	//
	get_taxonomy_query: function( db, uitems, body ) {
	  //console.log(body);
	  selection_obj = body.selection_obj;
	  //selection_obj = body.selection_obj;
	  
	  if (uitems[0] === 'tax' && uitems[1] === 'silva108'){  //covers both simple and custom taxonomy
	    uassoc = 'silva_taxonomy_info_per_seq_id';
	  }
	  var domains = body.domains || ['Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown'];
	  var tax_depth = body.tax_depth || 'phylum';
	  var fields = [];
	  var joins = '';
	  var and_domain_in = '';
	  var join_domain = " JOIN domain USING(domain_id)"
    var join_phylum = " JOIN phylum USING(phylum_id)";
    var join_klass = " JOIN klass USING(klass_id)";
    var join_order = " JOIN `order` USING(order_id)";
    var join_family = " JOIN family USING(family_id)";
    var join_genus = " JOIN genus USING(genus_id)";
    var join_species = " JOIN species USING(species_id)";
    var join_strain = " JOIN strain USING(strain_id)";
    
	  if (tax_depth === 'domain') {
	    fields = ['domain'];
	    joins = join_domain;
	  } else if (tax_depth === 'phylum') {
	    fields = ['domain','phylum'];
	    joins =  join_domain + join_phylum;
	  } else if (tax_depth === 'class')  {
	    fields = ['domain','phylum','klass'];
	    joins =  join_domain + join_phylum + join_klass;
	  } else if (tax_depth === 'order')  {
	    fields = ['domain','phylum','klass','`order`'];
	    joins =  join_domain + join_phylum + join_klass + join_order;
	  } else if (tax_depth === 'family') {
	    fields = ['domain','phylum','klass','`order`','family'];
	    joins =  join_domain + join_phylum + join_klass + join_order + join_family;
	  } else if (tax_depth === 'genus') {
	    fields = ['domain','phylum','klass','`order`','family','genus'];
	    joins =  join_domain + join_phylum + join_klass + join_order + join_family + join_genus;
	  } else if (tax_depth === 'species') {
	    fields = ['domain','phylum','klass','`order`','family','genus','species'];
	    joins =  join_domain + join_phylum + join_klass + join_order + join_family + join_genus + join_strain;
	  }
	    
	  if (domains.length < 5){
	    domains = domains.join("','");
	    and_domain_in = " AND domain in ('"+domains+"')";
	  }
	  
	  var tax_query = "SELECT distinct silva_taxonomy_id as id, concat_ws(';',"+fields+") as tax FROM silva_taxonomy\n";
	  tax_query     += joins;
	  
	  unit_id_array = []
	  for(var n in selection_obj.unit_assoc[uassoc]){
	    unit_id_array = unit_id_array.concat(selection_obj.unit_assoc[uassoc][n])

	  }
	  tax_query     += " WHERE silva_taxonomy_id in (" + unit_id_array + ")\n";
	  tax_query     += and_domain_in;
	  return tax_query;

	},

	//
	//
	//
	get_otus_query: function() {

	},

	//
	//
	//
	get_med_query: function() {

	},


	//
	// NORMALIZATION
	//
	normalize_counts: function(norm_type, body) {
	  
	  // get max dataset count
	  //var selection_obj = JSON.parse(obj);
	  var max_count = body.max_ds_count;
	  //selection_obj.max_ds_count = max_count;
	  console.log('in normalization: '+norm_type+' max: '+max_count.toString());

	  var new_counts_obj = [];
	  for (var n=0; n < body.selection_obj.seq_freqs.length; n++) {
	    var sum=0;
	    for (var i = 0; i < body.selection_obj.seq_freqs[n].length; i++ ) {
	      sum += body.selection_obj.seq_freqs[n][i];
	    }
	    var temp = [];
	    for (i=0; i < body.selection_obj.seq_freqs[n].length; i++) {

	      if (norm_type === 'max') {
	        temp.push( parseInt( ( body.selection_obj.seq_freqs[n][i] * max_count ) / sum, 10) );
	      } else {  // freq
	        temp.push( parseFloat( ( body.selection_obj.seq_freqs[n][i]  / sum ).toFixed(8) ) );
	      }

	    }
	    new_counts_obj.push(temp);
	  }
	  body.selection_obj.seq_freqs = new_counts_obj;
	  body.selection_obj.max_ds_count = max_count;
	  return body.selection_obj;
	},

	//
	//  MAX DS COUNT
	//
	get_max_dataset_count: function(obj) {
	  // Gets the maximum dataset count from the 'seq_freqs' in selection_obj
	  var max_count = 0;
	  for (var n=0; n < obj.seq_freqs.length; n++) {
	    var sum=0;
	    for (var i = 0; i < obj.seq_freqs[n].length; i++) {  
	      sum += parseInt(obj.seq_freqs[n][i]);
	      //console.log(obj.seq_freqs[n][i]);
	    }
	    
	    if (sum > max_count) {
	      max_count = sum;
	    }
	  }
	  return max_count;
	},

	//
	//
	//
	string_to_color_code: function(str) {
		// str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));

    // int/hash to hex
    for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));

    return colour;

	},


}   // end module.exports




