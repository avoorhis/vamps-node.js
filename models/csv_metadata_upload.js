/*jshint multistr: true */

/*
1) get dataset_id
2) add dataset_id, field_name, field_type, example into custom_metadata_fields
3) add required info into db

*/
var get_dataset_id_query = "SELECT DISTINCT dataset_id
  FROM dataset
  JOIN project USING(project_id)
  WHERE dataset = '" +  + "'
  AND project = '" +  + "'
";
 console.log('running get_dataset_id_query');

module.exports = silvaTaxonomy;

function csvMetadataUpload() {
}

silvaTaxonomy.prototype.get_all_taxa = function(callback) 
{
  connection.query(taxa_query, function (err, rows, fields) {
    callback(err, rows);
  });
};

