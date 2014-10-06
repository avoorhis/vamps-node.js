// common.js
var path = require('path');
var fs = require('fs');
var extend = require('util')._extend;
var C = require('../../public/constants');

module.exports = {

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
      for(d in distrows ) {
        if(obj[viz_page] === distrows[d].id) {
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
    if(obj.normalization === 'freq') {
      html += '<input type="radio" name="norm" value="none" >None &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="max" >To Maximum Count &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="freq" checked="checked">To Frequency';
    } else if (obj.normalization === 'max') {
      html += '<input type="radio" name="norm" value="none" >None &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="max" checked="checked">To Maximum Count &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="freq" >To Frequency';
    } else {
      html += '<input type="radio" name="norm" value="none" checked="checked">None &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="max" >To Maximum Count &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="freq" >To Frequency';
    }
    html += '</li>';
    html += '<hr>';
    html += '<li>Limit view based on tax percentage: &nbsp;&nbsp;&nbsp;';
     
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
     for( var n=1;n < C.PCT_RANGE.length;n++ ) {
       
       if(obj.max_range.toString() === C.PCT_RANGE[n].toString()) {
         html += "<option value='"+C.PCT_RANGE[n]+"' selected='selected'>"+C.PCT_RANGE[n]+" %</option>";
       }else{
         html += "<option value='"+C.PCT_RANGE[n]+"'>"+C.PCT_RANGE[n]+" %</option>";
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
  get_taxonomy_query: function( db, uitems, chosen_id_name_hash, post_items) {
    //console.log(body);
    //selection_obj = selection_obj;
    //selection_obj = body.selection_obj;
    
    //   SELECT dataset_id, silva_taxonomy_info_per_seq_id as id, concat_ws(';',domain,phylum) as tax 
    //   From sequence_pdr_info as t1
    //   JOIN sequence_uniq_info as t2 using(sequence_id)
    //   JOIN silva_taxonomy_info_per_seq as t3 using (silva_taxonomy_info_per_seq_id)
    //   JOIN silva_taxonomy as t4 USING(silva_taxonomy_id)
    //   JOIN domain USING(domain_id) 
    //   JOIN phylum USING(phylum_id) 
    //   WHERE dataset_id in (150,151,152,153)

    if (uitems[0] === 'tax' && uitems[1] === 'silva108'){  //covers both simple and custom taxonomy
      uassoc = 'silva_taxonomy_info_per_seq_id';
    }
    var domains = post_items.domains || ['Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown'];
    var tax_depth = post_items.tax_depth || 'phylum';
    var fields = [];
    var ids = [];
    var joins = '';
    var and_domain_in = '';
    var join_domain   = " JOIN domain USING(domain_id)";
    var join_phylum   = " JOIN phylum USING(phylum_id)";
    var join_klass     = " JOIN klass USING(klass_id)";
    var join_order     = " JOIN `order` USING(order_id)";
    var join_family   = " JOIN family USING(family_id)";
    var join_genus     = " JOIN genus USING(genus_id)";
    var join_species   = " JOIN species USING(species_id)";
    var join_strain   = " JOIN strain USING(strain_id)";
    
    if (tax_depth === 'domain') {
      fields = ['domain'];
      ids = ['domain_id'];
      joins = join_domain;
    } else if (tax_depth === 'phylum') {
      fields = ['domain','phylum'];
      ids = ['domain_id','phylum_id'];
      joins =  join_domain + join_phylum;
    } else if (tax_depth === 'class')  {
      fields = ['domain','phylum','klass'];
      ids = ['domain_id','phylum_id','klass_id'];
      joins =  join_domain + join_phylum + join_klass;
    } else if (tax_depth === 'order')  {
      fields = ['domain','phylum','klass','`order`'];
      ids = ['domain_id','phylum_id','klass_id','order_id'];
      joins =  join_domain + join_phylum + join_klass + join_order;
    } else if (tax_depth === 'family') {
      fields = ['domain','phylum','klass','`order`','family'];
      ids = ['domain_id','phylum_id','klass_id','order_id','family_id'];
      joins =  join_domain + join_phylum + join_klass + join_order + join_family;
    } else if (tax_depth === 'genus') {
      fields = ['domain','phylum','klass','`order`','family','genus'];
      ids = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id'];
      joins =  join_domain + join_phylum + join_klass + join_order + join_family + join_genus;
    } else if (tax_depth === 'species') {
      fields = ['domain','phylum','klass','`order`','family','genus','species'];
      ids = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id'];
      joins =  join_domain + join_phylum + join_klass + join_order + join_family + join_genus + join_species;
    }
      
    if (domains.length < 5){
      domains = domains.join("','");
      and_domain_in = " AND domain in ('"+domains+"')";
    }
    
    //var tax_query = "SELECT dataset_id as did, seq_count, silva_taxonomy_info_per_seq_id as uid, silva_taxonomy_id\n";
     //  var tax_query = "SELECT dataset_id as did, seq_count, silva_taxonomy_info_per_seq_id as uid, concat_ws(';',"+fields+") as tax\n";
     // tax_query     += "   FROM sequence_pdr_info as t1\n";
     // tax_query     += "   JOIN sequence_uniq_info as t2 USING(sequence_id)\n";
     // tax_query     += "   JOIN silva_taxonomy_info_per_seq as t3 USING (silva_taxonomy_info_per_seq_id)\n";
     // tax_query     += "   JOIN silva_taxonomy as t4 USING(silva_taxonomy_id)\n";

   //  //var tax_query = "SELECT distinct silva_taxonomy_info_per_seq_id as id, concat_ws(';',"+fields+") as tax FROM silva_taxonomy_info_per_seq as t1\n";
   //  //tax_query     += "JOIN silva_taxonomy as t2 USING(silva_taxonomy_id)\n";
     
    

     var tax_query = "SELECT dataset_id, seq_count, " + ids + "\n";
     // var tax_query = "SELECT dataset_id as did, seq_count, silva_taxonomy_info_per_seq_id as uid, concat_ws(';',"+fields+") as tax\n";
    tax_query     += "   FROM sequence_pdr_info as t1\n";
    tax_query     += "   JOIN sequence_uniq_info as t2 USING(sequence_id)\n";
    tax_query     += "   JOIN silva_taxonomy_info_per_seq as t3 USING (silva_taxonomy_info_per_seq_id)\n";
    tax_query     += "   JOIN silva_taxonomy as t4 USING(silva_taxonomy_id)\n";
    //tax_query     += joins;


    // OLD db -->
    // var tax_query = "SELECT dataset_id as did, seq_count,  taxonomy as tax\n";
   //   tax_query     += "   FROM sequence_pdr_info as t1\n";
   //   tax_query     += "   JOIN sequence_uniq_info as t2 USING(sequence_id)\n";
   //   tax_query     += "   JOIN taxonomies_old as t4 on (t2.silva_taxonomy_info_per_seq_id=t4.id)\n";
     // <-- OLD db
    
    tax_query     += " WHERE dataset_id in ("+chosen_id_name_hash.ids+")\n";
    //tax_query     += " WHERE silva_taxonomy_info_per_seq_id in (" + unit_id_array + ")\n";
    tax_query     += and_domain_in;
    return tax_query;


    function onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
    }

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
    for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
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
  // GET CUSTOM BIOME MATRIX
  //
  get_custom_biome_matrix: function(visual_post_items, mtx) {
    var custom_count_matrix = extend({},mtx);  // this clones count_matrix which keeps original intact.
    
    var max_cnt = visual_post_items.max_ds_count,
        min     = visual_post_items.min_range,
        max     = visual_post_items.max_range,
        norm    = visual_post_items.normalization;

    //console.log('in custom biome '+max_cnt.toString());
        
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
  }

};   // end module.exports




