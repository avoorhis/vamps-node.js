var express = require('express');
var router = express.Router();

module.exports = {

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

  }
}




