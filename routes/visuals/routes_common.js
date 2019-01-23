// common.js
var path = require('path');
var fs = require('fs-extra');
var extend = require('util')._extend;
//var COMMON  = require('./routes_common');
var C = require('../../public/constants');
var config  = require(app_root + '/config/config');
//var HMAP    = require('./routes_distance_heatmap');
//var DEND    = require('./routes_dendrogram');
//var PCOA    = require('./routes_pcoa');

module.exports = {

  start_visuals_html: function(visual) {
    var html = '<table border="1" class="single_border center_table"><tr><td>';
    html += this.get_selection_markup(visual, visual_post_items); // block for listing prior selections: domains,include_NAs ...
    html += '</td><td>';
    html += this.get_choices_markup(visual, visual_post_items);      // block for controls to normalize, change tax percentages or distance
    html += '</td></tr></table>';
    return html;
  },

  get_selection_markup: function( visual, obj ) {

    // obj is visual_post_items
    var html = "<div id='' class='selection_info'>";
    if(visual === 'heatmap' ||visual === 'dendrogram' || visual === 'pcoa' ) {
      html += '<li>Selected Distance Metric: ' + obj.selected_distance + '</li>';
    }
    html += '<li>Maximum Dataset Count (raw): ' + obj.max_ds_count.toString() + '</li>';
    if(obj.unit_choice.indexOf('tax') === 0 ) {
      html += '<li>Included Domains: ' + obj.domains     + '</li>';
      html += '<li>Include NAs?: '     + obj.include_nas + '</li>';
      html += '<li>Taxonomic Depth: '  + obj.tax_depth   + '</li>';
    }
    if(obj.normalization === 'none') {
      html += '<li>Normalization: ' + obj.normalization + ' (raw counts)</li>';
    }else{
      html += '<li>Normalization: ' + obj.normalization + '</li>';
    }
    html += '</div>';
    return html;
  },
  //
  //
  //
  get_choices_markup: function( visual, obj ) {
    var html = "<div id='' class='choices_info'>";
    //title: req.params.title   || 'default_title',
    //  timestamp: myurl.query.ts || 'default_timestamp',
    //  html : html,
    //  user: req.user
    html += "<form name='' method='GET'>";
    if( visual === 'heatmap' || visual === 'dendrogram' || visual === 'pcoa' ) {
      //console.log(C.DISTANCECHOICES)
      var viz_page = 'selected_distance';
      var distrows = C.DISTANCECHOICES.choices;
      html += '<li>Change Distance Metric: ';
      html += "<select name='selected_distance' class='small_font'>";
      for (var d in distrows ) {
        if (obj[viz_page] === distrows[d].id) {
          html += "<option value='"+distrows[d].id+"' selected='selected' >"+distrows[d].show+"</option>";
        }else{
          html += "<option value='"+distrows[d].id+"'>"+distrows[d].show+"</option>";
        }
      }
      html += "</select></li>";
      html += '<hr>';
    }
  // unit_choice: 'tax_silva108_simple',
  // max_ds_count: 3609,
  // no_of_datasets: 232,
  // normalization: 'none',
  // visuals: [ 'barcharts' ],
  // selected_heatmap_distance: 'morisita_horn',
  // selected_dendrogram_distance: 'morisita_horn',
  // tax_depth: 'phylum',
  // domains: [ 'Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown' ],
  // include_nas: 'yes' }



    html += '<li>Normalization: ';
    if(obj.normalization === 'frequency' || obj.normalization === 'freq') {
      html += '<input type="radio" name="norm" value="none" >None &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="max"  >To Maximum Count &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="freq" checked="checked">To Frequency';
    } else if (obj.normalization === 'maximum' || obj.normalization === 'max') {
      html += '<input type="radio" name="norm" value="none" >None &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="max"  checked="checked">To Maximum Count &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="freq" >To Frequency';
    } else {
      html += '<input type="radio" name="norm" value="none" checked="checked" >None &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="max"  >To Maximum Count &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="freq" >To Frequency';
    }
    html += '</li>';
    html += '<hr>';
    html += '<li>Limit view based on count percentage: &nbsp;&nbsp;&nbsp;';

     html += "MIN <select name='min_range' class='small_font'>";
     for( var n=0;n < C.PCT_RANGE.length-1;n++ ) {
       if(obj.min_range.toString() === C.PCT_RANGE[n].toString()) {
         html += "<option value='"+C.PCT_RANGE[n]+"' selected='selected'>"+C.PCT_RANGE[n]+" %</option>";
       }else{
         html += "<option value='"+C.PCT_RANGE[n]+"'>"+C.PCT_RANGE[n]+" %</option>";
       }
     }
    html += "</select>";
    html += "&nbsp;&nbsp;&nbsp; MAX <select name='max_range' class='small_font'>";
    // TODO: "'n' is already defined."
     for (var n1=1; n1 < C.PCT_RANGE.length; n1++ ) {

       if(obj.max_range.toString() === C.PCT_RANGE[n1].toString()) {
         html += "<option value='"+C.PCT_RANGE[n1]+"' selected='selected'>"+C.PCT_RANGE[n1]+" %</option>";
       }else{
         html += "<option value='"+C.PCT_RANGE[n1]+"'>"+C.PCT_RANGE[n1]+" %</option>";
       }
     }
    html += "</select></li>";
    html += '<hr>';
    html += "<li>Make your selections then press: ";
    html += "<input type='submit' value='Change View' ></li>";
    html += '<input type="hidden" name="ts" value="'+obj.ts+'">';
    html += '</form>';
    html += '</div>';
    return html;
  },

  //
  //
  //
  default_post_items: function() {
    var post_hash = {
        unit_choice: 'tax_'+C.default_taxonomy.name+'_simple',
        no_of_datasets: undefined,
        normalization: 'none',
        visuals: undefined,
        selected_distance: 'morisita_horn',
        tax_depth: 'phylum',
        domains: [ 'Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown' ],
        custom_taxa: [ 'NA' ],
        include_nas: 'yes',
        min_range: 0,
        max_range: 100,
        metadata: [  ],
        update_data: false,
        ts: undefined,
        max_ds_count: undefined
    }
    return post_hash;
  },

  save_post_items: function(req) {
    // GLOBAL Variable
    var post_hash = {};
    if(config.site == 'vamps' ){
      console.log('VAMPS PRODUCTION -- no print to log');
    }else{
      console.log('VS--BODY (routes_common.js)',req.body)
    }

    if(req.body.ds_order === undefined) {

          post_hash.unit_choice                  = req.body.unit_choice;
          //visual_post_items.max_ds_count                 = COMMON.get_max_dataset_count(selection_obj);
          console.log('(req.session.chosen_id_order).length')
          console.log((req.session.chosen_id_order).length)
          post_hash.no_of_datasets               = (req.session.chosen_id_order).length;
          
          post_hash.normalization                = req.body.normalization || 'none';
          post_hash.visuals                      = req.body.visuals;
          post_hash.selected_distance            = req.body.selected_distance || 'morisita_horn';
          post_hash.tax_depth                    = req.body.tax_depth    || 'custom';

          if(post_hash.unit_choice === 'tax_'+C.default_taxonomy.name+'_simple'){
            post_hash.domains                    = req.body.domains      || ['NA'];
          }else if( post_hash.unit_choice === 'tax_rdp2.6_simple' || post_hash.unit_choice === 'tax_generic_simple'){
            post_hash.domains                    = req.body['domains']      || ['NA'];
          }else{
            post_hash.domains = ['NA']
          }

          if(typeof post_hash.domains == 'string') {
              post_hash.domains = post_hash.domains.split(',');
          }
          if(config.site == 'vamps' ){
            console.log('VAMPS PRODUCTION -- no print to log');
          }else{
            console.log(req.body.custom_taxa)
            console.log(typeof req.body.custom_taxa)
          }
          //post_hash.custom_taxa   = req.body.custom_taxa  || ['NA'];
          post_hash.custom_taxa   = req.session.custom_taxa || ['NA'];
          // html: [ '1', '60', '2120', '2261' ], object
          // fancy & dhtmlx:  1,60,2120,2260,2261,2266  string
          if(typeof req.body.custom_taxa === 'string'){
            if(req.body.custom_taxa === ''){
              post_hash.custom_taxa   = ['NA'];
            }else{
              post_hash.custom_taxa   = req.body.custom_taxa.split(',');
            }
          }

          

          // in the unusual event that a single custom checkbox is selected --> must change from string to list:

          if(typeof post_hash.custom_taxa !== 'object') {post_hash.custom_taxa = [post_hash.custom_taxa]; }
          
          if(post_hash.unit_choice === 'tax_'+C.default_taxonomy.name+'_custom' && post_hash.custom_taxa != ['NA']){
            post_hash.custom_taxa = this.clean_custom_tax(post_hash.custom_taxa);
          }


          post_hash.include_nas                  = req.body.include_nas  || 'yes';
          post_hash.min_range                    = req.body.min_range || 0;
          post_hash.max_range                    = req.body.max_range || 100;
          if(typeof req.body.selected_metadata == 'string'){
            post_hash.metadata                     = req.body.selected_metadata.split(',') || [];
          }else{
            post_hash.metadata                     = req.body.selected_metadata  || [];
          }

          post_hash.update_data                  = req.body.update_data  || false;  // zer


    }else {
        //console.log('DEFINING chosen_id_name_hash')
        //req.session.chosen_id_order = req.session.chosen_id_order //this.create_chosen_id_name_hash(req.body.ds_order);
        //post_hash = visual_post_items;
    }

    return post_hash;
  },

  //
  //
  //
  //
  // write file
  //
  write_file: function(filename, txt) {

    fs.writeFile(path.resolve(__dirname, filename), txt, function(err) {
      if(err) {
        console.log('Could not write file: '+filename+' Here is the error: '+err);
      } else {
        console.log("The file ("+filename+") was saved!");
      }
    });

  },
  //
  //  tax file for phyloseq
  //
  output_tax_file: function( tax_file, biom_matrix, rank_num) {
    var tax;
    txt = '';
    //console.log('rank '+rank)

    var header = "\tDomain"
    for(r = 1; r <= rank_num; r++){
      rank = C.RANKS[r]
      if(rank == 'klass'){ rank = 'Class'}
      rank = rank[0].toUpperCase() + rank.slice(1)
      header += "\t"+rank;
    }
    header += "\n";
    txt += header;
    for(i in biom_matrix.rows){
      tax = biom_matrix.rows[i].id;
      //console.log(tax)
      items = tax.split(';');
      txt += tax;
      for(t in items){
        //if(t==1){
        //  txt += "\t"+items[0]+';'+items[t];
        //}else{
          txt += "\t"+items[t];
        //}

      }
      txt += "\n";
    }

    fs.writeFile(path.resolve(__dirname, tax_file), txt, function(err) {
      if(err) {
        console.log('Could not write tax file: '+tax_file+' Here is the error: '+err);
      } else {
        console.log("The file ("+tax_file+") was saved!");
      }
    });


  },
  //
  // NORMALIZATION
  //
  normalize_counts: function(norm_type, selection_obj, max_count) {

    // get max dataset count
    //var selection_obj = JSON.parse(obj);
    //var max_count = post_items.max_ds_count;
    //selection_obj.max_ds_count = max_count;
    console.log('in normalization: '+norm_type+' max: '+max_count.toString());

    var new_counts_obj = [];
    for (var n=0; n < selection_obj.seq_freqs.length; n++) {
      var sum=0;
      for (var i = 0; i < selection_obj.seq_freqs[n].length; i++ ) {
        sum += selection_obj.seq_freqs[n][i];
      }
      var temp = [];
      for (i=0; i < selection_obj.seq_freqs[n].length; i++) {

        if (norm_type === 'max') {
          temp.push( parseInt( ( selection_obj.seq_freqs[n][i] * max_count ) / sum, 10) );
        } else {  // freq
          temp.push( parseFloat( ( selection_obj.seq_freqs[n][i]  / sum ).toFixed(8) ) );
        }

      }
      new_counts_obj.push(temp);
    }

    return new_counts_obj;
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
    //console.log(max_count);
    return max_count;
  },

  //
  // STRING to COLOR CODE
  //
  string_to_color_code2: function(str) {
    // str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
    // int/hash to hex
    // TODO: "'i' is already defined."
    for (var i1 = 0, colour = "#"; i1 < 3; colour += ("00" + ((hash >> i1++ * 8) & 0xFF).toString(16)).slice(-2));
    return colour;
  },
  string_to_color_code: function (str){
    var hash = 0;
    for(var i=0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 3) - hash);
    }
    var color = Math.abs(hash).toString(16).substring(0, 6);
    return "#" + '000000'.substring(0, 6 - color.length) + color;
  },


//
//
//
run_script_cmd: function (req,res, ts, command, visual_name) {
     var exec = require('child_process').exec;

    console.log(command);
    exec(command, {maxBuffer:16000*1024}, function (err, stdout, stderr) {  // currently 16000*1024 handles 232 datasets
        if(err) {
        	res.send('ERROR: '+err);
        }else{
			if(visual_name == 'fheatmap'){
	            var image = '/tmp_images/'+ts+'_heatmap.pdf';
	            var html = "<div id='pdf'>";
	            html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='1000' height='900' />";
	            html += " <p>ERROR in loading pdf file</p>";
	            html += "</object></div>";
	            //var html = "<img alt='alt_freq-heatmap-fig' src='"+image+"' />"
	            //console.log(html);
	            res.send(html);
	        }
		}

    });
 },


//
//
//
create_chosen_id_name_order: function(dataset_ids) {
  console.log('in common: create_chosen_id_name_order' );
  console.log('in common: WAS create_chosen_id_name_hash' );
  var id_name_order    = [];
  
  for (var i in dataset_ids){
      var did   = dataset_ids[i];
      var name = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project+'--'+DATASET_NAME_BY_DID[did]
  	  id_name_order.push({did:did,name:name})
  }

  return id_name_order;
},
create_new_chosen_id_name_hash: function(dataset_list, pjds_lookup) {

  if(config.site == 'vamps' ){
      console.log('VAMPS PRODUCTION -- no print to log');
  }else{
      
  }
  var potential_id_name_hash    = {};
  potential_id_name_hash.ids    = [];
  potential_id_name_hash.names  = [];
  
  for (var i in dataset_list){
      var pjds = dataset_list[i]
      var did = pjds_lookup[pjds]
      
      potential_id_name_hash.ids.push(did);
      potential_id_name_hash.names.push(pjds);
  }

  return potential_id_name_hash;
},
//
//
//

get_metadata_selection: function(dataset_ids, type) {
    req_metadata = C.REQ_METADATA_FIELDS;
    //console.log('req_metadata '+req_metadata)
    fields_lookup = {};
    for (var i in dataset_ids) {
      var did = dataset_ids[i];
      //console.log('id '+ id)
      if (did in AllMetadata) {        
        for (var field in AllMetadata[did]) {

          //console.log('field_name '+field)
          // keep *_id in metadata file(s) and show name on GUI
          if(field == 'env_package_id'){
            test = 'env_package'
          }else if(field == 'dna_region_id'){
            test = 'dna_region'
          }else if(field == 'geo_loc_name_id'){
            test = 'geo_loc_name'
          }else if(field == 'domain_id'){
            test = 'domain'
          }else if(field == 'target_gene_id'){
            test = 'target_gene'
          }else if(field == 'sequencing_platform_id'){
            test = 'sequencing_platform'
          }else if(field == 'env_biome_id'){
            test = 'env_biome'
          }else if(field == 'env_material_id'){
            test = 'env_material'
          }else if(field == 'env_feature_id'){
            test = 'env_feature'
          }else if(field == 'adapter_sequence_id'){
            test = 'adapter_sequence'
          }else if(field == 'illumina_index_id'){
            test = 'illumina_index'
          }else if(field == 'run_id'){
            test = 'run'
          }else if(field == 'primer_suite_id'){
            test = 'primer_suite'
          }else{
            test = field
          }

    			if(type == 'custom'){
    	  		  if (req_metadata.indexOf(test) === -1 ) {
    	              //console.log('PUT IN CUSTOM '+field)
    	              fields_lookup[test] = 1;
    	          }

    			}else{  // REQUIRED

      	  		  if (req_metadata.indexOf(test) >= 0 ) {
      	              //console.log('PUT IN CUSTOM '+field)
      	              fields_lookup[test] = 1;
      	          }
    			}

        }
      }

    }
    return Object.keys(fields_lookup).sort();
},
//
//
//
check_initial_status: function(url) {

  var values_updated;
  var min,max,norm,dist;
  // these only seen in url after page first rendered
  if(url.query.min_range === undefined) {
    min   = 0;
    max   = 100;
    norm  = 'none';
    dist  = 'morisita_horn';  // default distance
    values_updated = false;
  } else {
    min   = url.query.min_range  || 0;
    max   = url.query.max_range  || 100;
    norm  = url.query.norm       ||  'none';
    dist  = url.query.selected_distance || 'morisita_horn';  // default distance
    values_updated = true;
  }

  if(Number(max) <= Number(min)) {min=0;max=100;}
  visual_post_items.min_range = Number(min);
  visual_post_items.max_range = Number(max);
  visual_post_items.normalization = norm;
  visual_post_items.selected_distance = dist;

  //console.log('min '+min.toString()+' max '+max.toString()+' norm '+norm)
  if(Number(min)===0 && Number(max)===100 && norm==='none') {
    //
    values_updated = false;  // return to initial state
  }
  console.log('values_updated: '+values_updated.toString());
  return values_updated;
},
//
//
//
clean_custom_tax: function(custom_tax_ids){
    console.log('cleaning custom tax')
    cleaned_id_list = []
    nodes_to_delete = []
    //console.log('custom_tax_ids')
    //console.log(custom_tax_ids)
    for(index in custom_tax_ids){
      node_id = custom_tax_ids[index]
      //console.log('node_id')
      //console.log(node_id)
      node = new_taxonomy.taxa_tree_dict_map_by_id[node_id]
      //console.log('nodes ',node)
      parent_id = node.parent_id.toString()
      //console.log('parent_id ',parent_id)
      //console.log(custom_tax_ids.indexOf(parent_id))
      if(nodes_to_delete.indexOf(parent_id) == -1 && custom_tax_ids.indexOf(parent_id) > -1){
        nodes_to_delete.push(parent_id)
      }


    }
    //console.log('nodes_to_delete ',nodes_to_delete)
    for(index in custom_tax_ids){
      node_id = custom_tax_ids[index].toString()
      //console.log(node_id,' ',cleaned_id_list.indexOf(node_id),' ',nodes_to_delete.indexOf(node_id))
      if(cleaned_id_list.indexOf(node_id) == -1 && nodes_to_delete.indexOf(node_id) == -1){
        cleaned_id_list.push(node_id)
      }
    }

    //console.log('cleaned_id_list ',cleaned_id_list)
    custom_tax_ids = cleaned_id_list
    return custom_tax_ids

    // no cleaning
    // Bacteria;Acidobacteria
    // Bacteria;Acidobacteria;Acidobacteria
    // Bacteria;Acidobacteria;Acidobacteria;Acidobacteriales
    // Bacteria;Acidobacteria;Acidobacteria;Acidobacteriales;Acidobacteriaceae
    // Bacteria;Acidobacteria;Acidobacteria;Acidobacteriales;Acidobacteriaceae;Chloroacidobacterium
    // Bacteria;Acidobacteria;Acidobacteria_gp22
    // Bacteria;Acidobacteria;Acidobacteria_gp26
    // Bacteria;Acidobacteria;Holophagae

    // with cleaning
    // Bacteria;Acidobacteria;Acidobacteria;Acidobacteriales;Acidobacteriaceae;Chloroacidobacterium
    // Bacteria;Acidobacteria;Acidobacteria_gp22
}
//
//
//
};   // end module.exports
