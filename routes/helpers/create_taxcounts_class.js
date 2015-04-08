/*
 * TaxCounts = create_taxcounts_class.js
 */

/*jshint multistr: true */

var helpers = require('./helpers');

// Private
function make_count_dict(row, dataset_seq_tax_dict)
{
  in_obj = row;
  dataset_id = parseInt(in_obj.dataset_id);
  count = parseInt(in_obj.seq_count);

  // console.log("NNN1 in_obj[dataset_id] = dataset_id = " + JSON.stringify(dataset_id));
  init_dataset_seq_tax_dict(dataset_seq_tax_dict);
  rank_attr = "";

  for (var field_name in in_obj)
  {
     var is_rank = helpers.check_if_rank(field_name.slice(0,-3));
     if (is_rank)
     {
       rank_attr += ("_" + in_obj[field_name]);
       count_taxa(dataset_seq_tax_dict);
     }
   }
}

function query_dataset_seq_tax()
{
  helpers.start = process.hrtime();

  var dataset_seq_tax_dict = {};
  console.log("Started query_dataset_seq_tax");

  var query = connection.db.query('SELECT * \
    FROM taxa_counts_temp \
  ');

  query.on('error', function(err) {
      throw err;
  });

  query.on('result', function(row) {
      connection.db.pause();
      make_count_dict(row, dataset_seq_tax_dict);
      connection.db.resume();
  });

  query.on('end', function(err) {
    if (err) throw err;
    // console.log("DDD6 dataset_seq_tax_dict = " + JSON.stringify(dataset_seq_tax_dict));
    helpers.elapsed_time("This is the running time for query_dataset_seq_tax");
    
    helpers.start = process.hrtime();
    helpers.write_to_file(file_name, JSON.stringify(dataset_seq_tax_dict));
    helpers.elapsed_time("This is the running time for write_to_file");
  });
}


function count_taxa(dataset_seq_tax_dict)
{
  if (dataset_seq_tax_dict[dataset_id][rank_attr] > 0)
  {
    dataset_seq_tax_dict[dataset_id][rank_attr] = dataset_seq_tax_dict[dataset_id][rank_attr] + count;
  }
  else
  {
    dataset_seq_tax_dict[dataset_id][rank_attr] = count;
  }
}

function init_dataset_seq_tax_dict(dataset_seq_tax_dict)
{
  if (!(dataset_seq_tax_dict[dataset_id]))
  {
    dataset_seq_tax_dict[dataset_id] = {};
  }

}

// Public
// module.exports = TaxCounts;
//
// function TaxCounts() {
//   helpers.start = process.hrtime();
//   file_name = "public/json/dataset_seq_tax_dict.json";
//   helpers.clear_file(file_name);
//
//   query_dataset_seq_tax();
// }

