/*
 * TaxCounts = create_taxcounts_class.js
 */

/*jshint multistr: true */

var constants = require(app_root + '/public/constants');
var helpers = require('./helpers');
// var fs = require('fs');

// var silvaTaxonomy = require('./models/silva_taxonomy');
// var all_silva_taxonomy = new silvaTaxonomy();
// all_silva_taxonomy.get_dataset_taxa_counts(function(err, results) {
//   if (err)
//     throw err; // or return an error message, or something
//   else
//   {
//     console.log("1111")
//     console.log(results)
//     
//     var Treeize   = require('treeize');
//     var people    = new Treeize();
// 
//     a = people.grow(results);
//     // people.getData()
//     console.log("555555")
//     console.log(a)
//     console.log(a.toString())
//   }
// });

// Private

function make_taxa_count_dict(dataset_seq_tax_obj)
{
  var dataset_seq_tax_dict = {}
  // console.log("HHH1");
  // console.log("dataset_seq_tax_obj = " + JSON.stringify(dataset_seq_tax_obj));  
  for (var i=0, len = dataset_seq_tax_obj.length; i < len; i++)
  {
    
  	in_obj = dataset_seq_tax_obj[i];
    console.log("\n=======\nTTT1 dataset_seq_tax_obj[i] = " + JSON.stringify(in_obj));
    dataset_id = in_obj["dataset_id"];
    count = in_obj["seq_count"]
    console.log("NNN1 in_obj[dataset_id] = dataset_id = " + JSON.stringify(dataset_id));
    dataset_seq_tax_dict[dataset_id] = {};
    
    for (var field_name in in_obj)
    {
     
       var is_rank = helpers.check_if_rank(field_name.slice(0,-3));
       if (is_rank)
       {
         try 
         {
           console.log("EEE field_name = " + JSON.stringify(field_name));
           console.log("EEE1 in_obj[field_name] = " + JSON.stringify(in_obj[field_name]));
           
           // dataset_seq_tax_dict[dataset_id].set(field_name, in_obj[field_name])
           console.log("CCC count = " + count);
           dataset_seq_tax_dict[dataset_id][in_obj[field_name]] = count;
         }
         catch (e) 
         {
           console.log("entering catch block");
           console.log(e);
           console.log("leaving catch block");
         }
         finally 
         {
           console.log("entering and leaving the finally block");
         }
         
         
       }
       // console.log("DDD1 dataset_seq_tax_dict = " + JSON.stringify(dataset_seq_tax_dict));
       
     }
     console.log("DDD2 dataset_seq_tax_dict = " + JSON.stringify(dataset_seq_tax_dict));
     
   }
   console.log("DDD3 dataset_seq_tax_dict = " + JSON.stringify(dataset_seq_tax_dict));
       
  
}


// Public
module.exports = TaxCounts;

function TaxCounts(rows) {
  helpers.start = process.hrtime();
  
  // this.taxa_tree_dict = [];
  // this.taxa_tree_dict_map_by_rank = [];
  this.dataset_seq_tax_obj = rows;
  this.dataset_seq_tax_dict = make_taxa_count_dict(this.dataset_seq_tax_obj)

  // temp_arr = make_taxa_count_dict(this.dataset_seq_tax_obj);
  // this.taxa_tree_dict = temp_arr[0];
  // this.taxa_tree_dict_map_by_id = temp_arr[1]; 
  // this.taxa_tree_dict_map_by_db_id_n_rank = temp_arr[2]; 
  // this.taxa_tree_dict_map_by_name_n_rank = temp_arr[3]; 
  // this.taxa_tree_dict_map_by_rank = make_dictMap_by_rank(this.taxa_tree_dict);
  //console.log("HHH1");
  //console.log("taxonomy_obj = " + JSON.stringify(this.taxonomy_obj));
  //console.log("HHH");
}

TaxCounts.prototype.print_res = function(rows) 
{
  console.log("HHH2");
  // console.log("rows = " + JSON.stringify(rows));
  
}

// silvaTaxonomy.prototype.get_dataset_taxa_counts = function(callback) 
// {
//   connection.db.query(dataset_taxa_counts, function (err, rows, fields) {
//     callback(err, rows);
//   });
// };
// 
// TaxonomyTree.prototype.make_taxcounts_dict = function(tree_obj, key_name) 
// {
//   var i = null;
//   new_dict = {};
//   for (i = 0; tree_obj.length > i; i += 1) {
//     new_dict[tree_obj[i][key_name]] = tree_obj[i];
//   }
//   return new_dict;
// };
