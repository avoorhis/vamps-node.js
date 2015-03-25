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
 
// var dataset_taxa_counts = " \
//   SELECT dataset_id, \
//     sequence_pdr_info_id, \
//     sequence_id, \
//     seq_count, \
//     silva_taxonomy_id, \
//     domain_id, \
//     phylum_id, \
//     klass_id, \
//     order_id, \
//     family_id, \
//     genus_id, \
//     species_id, \
//     strain_id \
//   FROM sequence_pdr_info \
//   JOIN sequence_uniq_info USING(sequence_id) \
//   JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id, sequence_id) \
//   JOIN silva_taxonomy USING(silva_taxonomy_id) \
// ";

// CREATE beforehend
// CREATE TABLE IF NOT EXISTS taxa_counts_temp
// (
//   taxa_counts_temp_id INT(10) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
//   UNIQUE KEY sequence_pdr_info_id (sequence_pdr_info_id)
// )
// SELECT DISTINCT
//   dataset_id,
//   seq_count,
//   sequence_id,
//   sequence_pdr_info_id,
//   silva_taxonomy_id,
//   domain_id,
//   phylum_id,
//   klass_id,
//   order_id,
//   family_id,
//   genus_id,
//   species_id,
//   strain_id
// FROM sequence_pdr_info
// JOIN sequence_uniq_info USING(sequence_id)
// JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id, sequence_id)
// JOIN silva_taxonomy USING(silva_taxonomy_id)

var dataset_taxa_counts_amount = " \
  SELECT count(taxa_counts_temp_id) as counts \
    FROM taxa_counts_temp \
";

var dataset_taxa_counts = " \
  SELECT * \
    FROM taxa_counts_temp \
  JOIN ( \
      SELECT taxa_counts_temp_id FROM taxa_counts_temp ORDER BY taxa_counts_temp_id \
      LIMIT ?, ? \
      ) AS t USING(taxa_counts_temp_id) \
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

// silvaTaxonomy.prototype.get_dataset_taxa_counts_amount = function(callback) 
// {
//   connection.db.query(dataset_taxa_counts_amount, function (err, rows, fields) {
//     callback(err, rows);
//   });
// };
// 
silvaTaxonomy.prototype.get_dataset_taxa_counts_amount = function(callback) 
{
  connection.db.query(dataset_taxa_counts_amount, function (err, rows, fields) {
    callback(err, rows);
  });
};

  // counts = 0;
  // connection.db.query(dataset_taxa_counts_amount, function(err, rows){
  //  if(err) {
  //    throw err;
  //  }else{    
  //    console.log( rows );
  //    counts = rows[0]["counts"];
  //    console.log('333 get_dataset_taxa_counts_amount = ' + JSON.stringify(rows[0]["counts"]));
  //  }
  //   console.log('444 get_dataset_taxa_counts_amount = ' + JSON.stringify(counts));
  	
  // });
  // console.log('555 get_dataset_taxa_counts_amount = ' + JSON.stringify(a));
  // 0
  
  
  // connection.db.query(dataset_taxa_counts_amount, function (err, rows, fields) {
  //   callback(err, rows);
  // });
  // 
  // connection.db.query(dataset_taxa_counts, function (err, rows, fields) {
  //   callback(err, rows);
  // });

silvaTaxonomy.prototype.get_dataset_taxa_counts = function(from_here, chunk_size, callback) 
{
  console.log("AAA in silvaTaxonomy.prototype.get_dataset_taxa_counts");
  console.log("AAA from_here = " + from_here);
  console.log("AAA chunk_size = " + chunk_size);

  connection.db.query(dataset_taxa_counts, [from_here, chunk_size], function (err, info) {
    // callback(err, rows);
    console.log("III1 info");
    console.log(info);

    callback(err, info);
  
  // connection.db.query(dataset_taxa_counts, [from_here, chunk_size], function(err, rows, fields) {
  //   console.log("AAA1 from_here = " + rows);
  //   console.log("AAA2 fields = " + fields);
  //   console.log("AAA3 info = " + info);
  //   
    // callback(err, rows);
  });
};


// silvaTaxonomy.prototype.get_dataset_taxa_counts = function(callback) 
// {
//   connection.db.query(dataset_taxa_counts, function (err, rows, fields) {
//     callback(err, rows);
//   });
// };
