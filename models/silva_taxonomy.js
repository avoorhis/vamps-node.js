/*jshint multistr: true */

var taxa_query = "SELECT DISTINCT domain, phylum, klass, `order`, family, genus, species, strain \
 , domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id \
 FROM silva_taxonomy \
 JOIN domain AS dom USING(domain_id) \
 JOIN phylum AS phy USING(phylum_id) \
 JOIN klass AS kla USING(klass_id) \
 JOIN `order` AS ord USING(order_id) \
 JOIN family AS fam USING(family_id) \
 JOIN genus AS gen USING(genus_id) \
 JOIN species AS spe USING(species_id) \
 JOIN strain AS str USING(strain_id)";
 console.log('running custom tax query short-2');
 
console.log('running dataset_taxa_counts query');

module.exports = silvaTaxonomy;

function silvaTaxonomy() {
}

silvaTaxonomy.prototype.get_all_taxa = function(callback) 
{
  connection.query(taxa_query, function (err, rows, fields) {
    callback(err, rows);
  });
};
