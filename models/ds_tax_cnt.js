// var cnts_query1 = "SELECT dataset_id as did, seq_count, silva_taxonomy_info_per_seq_id as uid, concat_ws(';',domain,phylum,klass,`order`,family,genus,species) as tax
//    FROM sequence_pdr_info as t1
//    JOIN sequence_uniq_info as t2 USING(sequence_id)
//    JOIN silva_taxonomy_info_per_seq as t3 USING (silva_taxonomy_info_per_seq_id)
//    JOIN silva_taxonomy as t4 USING(silva_taxonomy_id)
//  JOIN domain USING(domain_id) 
// JOIN phylum USING(phylum_id) 
// JOIN klass USING(klass_id) 
// JOIN `order` USING(order_id) 
// JOIN family USING(family_id) 
// JOIN genus USING(genus_id) 
// JOIN species USING(species_id) 
// WHERE dataset_id in (51,40,26,91,77,80,45,55,42,17,63,18,71,74,13,34,90,58,19,24,85,10,62,67,43,46,38,31,49,86,20,48,33,56,82,84,73,36,76,72,16,39,52,29,12,8,41,32,64,79,47,22,88,57,50,59,5,11,92,70,68,66,35,6,89,87,69,14,61,15,53,9,60,21,81,37,83,78,28,7,44,54,23,25,75,2,1,3,4,30,65,27)";
// 
// var cnts_query2 = "SELECT dataset_id as did, seq_count, silva_taxonomy_info_per_seq_id as uid, concat_ws(';',domain,phylum,klass,`order`,family,genus,species) as tax
//    FROM sequence_pdr_info as t1
//    JOIN sequence_uniq_info as t2 USING(sequence_id)
//    JOIN silva_taxonomy_info_per_seq as t3 USING (silva_taxonomy_info_per_seq_id)
//    JOIN silva_taxonomy as t4 USING(silva_taxonomy_id)
// WHERE dataset_id in (51,40,26,91,77,80,45,55,42,17,63,18,71,74,13,34,90,58,19,24,85,10,62,67,43,46,38,31,49,86,20,48,33,56,82,84,73,36,76,72,16,39,52,29,12,8,41,32,64,79,47,22,88,57,50,59,5,11,92,70,68,66,35,6,89,87,69,14,61,15,53,9,60,21,81,37,83,78,28,7,44,54,23,25,75,2,1,3,4,30,65,27)";
//  console.log('running custom tax query short-1');
// 
// module.exports = silvaTaxonomy;
// 
// function datasetTaxaCnts() {
// }
// 
// datasetTaxaCnts.prototype.get_cnts = function(callback) 
// {
//   DBConn.query(taxa_query, function (err, rows, fields) {
//     callback(err, rows);
//   });
// };
// 
