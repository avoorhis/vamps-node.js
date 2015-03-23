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
 
var dataset_taxa_counts = " \
  SELECT distinct dataset_id, \
    sequence_pdr_info_id, \
    sequence_id, \
    seq_count, \
    silva_taxonomy_id, \
    domain_id, \
    phylum_id, \
    klass_id, \
    order_id, \
    family_id, \
    genus_id, \
    species_id, \
    strain_id \
  FROM sequence_pdr_info \
  JOIN sequence_uniq_info USING(sequence_id) \
  JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id, sequence_id) \
  JOIN silva_taxonomy USING(silva_taxonomy_id) \
";
console.log('running dataset_taxa_counts query');

module.exports = silvaTaxonomy;

function silvaTaxonomy() {
}

silvaTaxonomy.prototype.get_all_taxa = function(callback) 
{
  connection.db.query(taxa_query, function (err, rows, fields) {
    callback(err, rows);
  });
};

silvaTaxonomy.prototype.get_dataset_taxa_counts = function(callback) 
{
  connection.db.query(dataset_taxa_counts, function (err, rows, fields) {
    callback(err, rows);
  });
};
