/* jshint multistr: true */

var taxa_query_pt1 = "SELECT DISTINCT domain, phylum, klass, `order`, family, genus, species, strain, \
 domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id \
 FROM ";

 var taxa_query_pt2 = " JOIN domain AS dom USING(domain_id) \
 JOIN phylum AS phy USING(phylum_id) \
 JOIN klass AS kla USING(klass_id) \
 JOIN `order` AS ord USING(order_id) \
 JOIN family AS fam USING(family_id) \
 JOIN genus AS gen USING(genus_id) \
 JOIN species AS spe USING(species_id) \
 JOIN strain AS str USING(strain_id)";
 //console.log('running custom tax query short-2');
 
console.log('GENERIC: running dataset_taxa_counts query from models/generic_taxonomy.js');

module.exports = genericTaxonomy;

function genericTaxonomy() {
}

genericTaxonomy.prototype.get_all_taxa = function(callback) 
{
  var query = taxa_query_pt1 + 'generic_taxonomy' + taxa_query_pt2;
  connection.query(query, function (err, rows, fields) {
    callback(err, rows);
  });
};
