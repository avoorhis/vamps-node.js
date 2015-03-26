/*
 * TaxCounts = create_taxcounts_class.js
 */

/*jshint multistr: true */

var constants = require(app_root + '/public/constants');
var helpers = require('./helpers');
var fs = require('fs');

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
var silvaTaxonomy = require(app_root + '/models/silva_taxonomy');
var all_silva_taxonomy = new silvaTaxonomy();
var converter = require('json-2-csv');

function test_chunks()
{
  var dataset_seq_tax_dict = {};
  
  var query = connection.db.query('SELECT * \
    FROM taxa_counts_temp \
  ');

  query.on('error', function(err) {
      throw err;
  });

  // query.on('fields', function(fields) {
  //   console.log("SSS1 fields");
  //     console.log(fields);
  // });

  // query.on('result', function(row) {
  //   console.log("SSS2 fields");
  //     console.log(row);
  // });
  
  query.on('result', function(row) {
      connection.db.pause();
      // Do some more processing on the row
      // helpers.write_to_file(file_name, JSON.stringify(row));
      // converter.json2csv(row, json2csvCallback);
      // todo call dict creation
      // make_taxa_count_dict_by_line(row);
      // console.log("SSS2 fields");
      // console.log(row);
      
      //===
      // console.log("HHH1");
      // console.log("dataset_seq_tax_obj = " + JSON.stringify(dataset_seq_tax_obj));  
      // for (var i=0, len = dataset_seq_tax_obj.length; i < len; i++)
      // {
      // 
      //  in_obj = dataset_seq_tax_obj[i];
        // console.log("\n=======\nTTT1 dataset_seq_tax_obj[i] = " + JSON.stringify(in_obj));
        in_obj = row;
        dataset_id = parseInt(in_obj["dataset_id"]);
        count = in_obj["seq_count"]

        console.log("NNN1 in_obj[dataset_id] = dataset_id = " + JSON.stringify(dataset_id));
        init_dataset_seq_tax_dict(dataset_seq_tax_dict);
        rank_attr = ""

        for (var field_name in in_obj)
        {

           var is_rank = helpers.check_if_rank(field_name.slice(0,-3));
           if (is_rank)
           {
             rank_attr += ("_" + in_obj[field_name]);
             helpers.start = process.hrtime();     
             count_taxa(dataset_seq_tax_dict);
             helpers.elapsed_time("This is the running time for some code");         
           }       
         }
       // }
       console.log("DDD3 dataset_seq_tax_dict = " + JSON.stringify(dataset_seq_tax_dict));

      
      //===
      
      connection.db.resume();
  });
  
  return dataset_seq_tax_dict;
  // connection.end();
}


var json2csvCallback = function (err, csv) {
    if (err) throw err;
    console.log("VVV csv");
    console.log(csv);
    fs.appendFile(file_name, csv);
};
 

function get_table_chunks(total_amount)
{
  console.log("FFF1 in get_table_chunks");
  
  from_here = 0;
  // chunk_size = 50000
  chunk_size = 2;
  amount_left = total_amount;
  
  while (amount_left > 0)
  {
    console.log("FFF3 in get_table_chunks.while");
    console.log("FFF3 chunk_size = " + chunk_size);
    console.log("FFF3 amount_left = " + amount_left);

    all_silva_taxonomy.get_dataset_taxa_counts(from_here, chunk_size, function(err, rows, fields) 
    {
      console.log("III2 rows, fields");
      console.log(rows[0]);
      // console.log(JSON.stringify(fields));
      console.log(rows[0]["dataset_id"]);
      arr = rows[0]
      
      Object.keys(arr).forEach(function(key) {
        var val = arr[key];
        // logic();
        // console.log("RRR1 val, key");
        //       
        // console.log(val);
        // console.log(key);
        
        
      });
      
      // for (var i = 0, len = arr.length; i < len; i++) {
        // someFn(arr[i]);
        
        // fs.appendFile(file_name, );
        
      // }

      
      // var text = ""
      // { taxa_counts_temp_id: 3,
      //   dataset_id: 450,
      //   seq_count: 1,
      //   sequence_id: 6160503,
      //   sequence_pdr_info_id: 13582163,
      //   silva_taxonomy_id: 75836,
      //   domain_id: 2,
      //   phylum_id: 53583,
      //   klass_id: 59463,
      //   order_id: 60420,
      //   family_id: 60641,
      //   genus_id: 61847,
      //   species_id: 61933,
      //   strain_id: 956 }
      
// todo: write titles once
// taxa_counts_temp_id      
// dataset_id,
// seq_count,
// sequence_id,
// sequence_pdr_info_id,
// silva_taxonomy_id,
// domain_id,
// phylum_id,
// klass_id,
// order_id,
// family_id,
// genus_id,
// species_id,
// strain_id,

      
      // fs.appendFile(file_name, JSON.stringify(rows[0]), function (err) {
      // });
      // fs.appendFile(file_name, ",");
        // rows.each(element, index) {     console.log(element.firstName + " " + element.lastName);   } 
    });


    // all_silva_taxonomy.get_dataset_taxa_counts(from_here, chunk_size, function(err, results) 
    // {
    //   console.log("III2 results");
    //   console.log(results[0]);
    //   // helpers.write_to_file(file_name, JSON.stringify(results));
    //   fs.appendFile(file_name, JSON.stringify(results[0]), function (err) {
    //   });
    //   fs.appendFile(file_name, ",");
    //     // rows.each(element, index) {     console.log(element.firstName + " " + element.lastName);   } 
    // });
    
    // all_silva_taxonomy.get_dataset_taxa_counts(from_here, chunk_size, function(err, results) 
    // {
    //   console.log("III1 info");
    //   console.log(info);
    // 
    //   
    //   console.log("EEE in all_silva_taxonomy.get_dataset_taxa_counts");
    //   console.log("EEE1 from_here = " + rows);
    //   console.log("EEE2 fields = " + fields);
    //   console.log("EEE3 info = " + info);
    //   
    //   if (err)
    //     throw err; // or return an error message, or something
    //   else
    //   {
    //     console.log("888 results")
    //     console.log(results)  
    //     dataset_seq_tax_dict = make_taxa_count_dict(results)
    //         
    //   }
    // });
    amount_left -= chunk_size;
    from_here += chunk_size;
  }
}

function count_taxa(dataset_seq_tax_dict)
{
  try 
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
  catch (e) 
  {
    console.log(e);
  }
  // finally 
  // {
  //   console.log("entering and leaving the finally block");
  // }
  return dataset_seq_tax_dict;
}

function init_dataset_seq_tax_dict(dataset_seq_tax_dict)
{
  if (!(dataset_seq_tax_dict[dataset_id]))
  {
    dataset_seq_tax_dict[dataset_id] = {};
  }
  return dataset_seq_tax_dict
}

function make_taxa_count_dict(dataset_seq_tax_obj)
{

  var dataset_seq_tax_dict = {};
  // console.log("HHH1");
  // console.log("dataset_seq_tax_obj = " + JSON.stringify(dataset_seq_tax_obj));  
  for (var i=0, len = dataset_seq_tax_obj.length; i < len; i++)
  {
    
  	in_obj = dataset_seq_tax_obj[i];
    // console.log("\n=======\nTTT1 dataset_seq_tax_obj[i] = " + JSON.stringify(in_obj));
    dataset_id = parseInt(in_obj["dataset_id"]);
    count = in_obj["seq_count"]
    
    // console.log("NNN1 in_obj[dataset_id] = dataset_id = " + JSON.stringify(dataset_id));
    init_dataset_seq_tax_dict(dataset_seq_tax_dict);
    rank_attr = ""

    for (var field_name in in_obj)
    {
     
       var is_rank = helpers.check_if_rank(field_name.slice(0,-3));
       if (is_rank)
       {
         rank_attr += ("_" + in_obj[field_name]);
         helpers.start = process.hrtime();     
         count_taxa(dataset_seq_tax_dict);
         helpers.elapsed_time("This is the running time for some code");         
       }       
     }
   }
   console.log("DDD3 dataset_seq_tax_dict = " + JSON.stringify(dataset_seq_tax_dict));
  
}


function make_taxa_count_dict_by_line(in_obj, dataset_seq_tax_dict)
{
  console.log("HHH1");
  console.log("in_obj = " + JSON.stringify(in_obj));  
  // console.log("dataset_seq_tax_dict = " + JSON.stringify(this.dataset_seq_tax_dict));  

  var dataset_seq_tax_dict_1 = {};
  // // console.log("HHH1");
  // // console.log("dataset_seq_tax_obj = " + JSON.stringify(dataset_seq_tax_obj));  
  // for (var i=0, len = dataset_seq_tax_obj.length; i < len; i++)
  // {
    
    // in_obj = dataset_seq_tax_obj[i];
    // console.log("\n=======\nTTT1 dataset_seq_tax_obj[i] = " + JSON.stringify(in_obj));
    dataset_id = parseInt(in_obj["dataset_id"]);
    count = in_obj["seq_count"]
    
    // console.log("NNN1 in_obj[dataset_id] = dataset_id = " + JSON.stringify(dataset_id));
    init_dataset_seq_tax_dict(dataset_seq_tax_dict);
    rank_attr = ""

    for (var field_name in in_obj)
    {
     
       var is_rank = helpers.check_if_rank(field_name.slice(0,-3));
       if (is_rank)
       {
         rank_attr += ("_" + in_obj[field_name]);
         helpers.start = process.hrtime();     
         count_taxa(dataset_seq_tax_dict);
         helpers.elapsed_time("This is the running time for some code");         
       }       
     }
   // }
   console.log("DDD3 dataset_seq_tax_dict = " + JSON.stringify(dataset_seq_tax_dict));
}


// Public
module.exports = TaxCounts;

function TaxCounts(total_amount) {
  helpers.start = process.hrtime();
  file_name = "public/json/dataset_seq_tax_dict.json"
  helpers.clear_file(file_name);
  
  // this.taxa_tree_dict = [];
  // this.taxa_tree_dict_map_by_rank = [];
  console.log("FFF2 in TaxCounts");
  console.log("total_amount = " + total_amount);
  
  this.dataset_seq_tax_dict_res = {};
  this.dataset_seq_tax_dict_res = test_chunks();
  console.log("DDD4 this.dataset_seq_tax_dict_res = " + JSON.stringify(this.dataset_seq_tax_dict_res));
  // get_table_chunks(total_amount);
  // this.obj_dataset_seq_tax_dict;
  
  
  // fs.readFile(file_name, function (err, data) {
  //   if (err) throw err;
  //   this.obj_dataset_seq_tax_dict = JSON.parse(data);
  //   console.log("TTT1");
  //   console.log("obj_dataset_seq_tax_dict = " + JSON.stringify(this.obj_dataset_seq_tax_dict));
  //   console.log("TTT2");
  //   dataset_seq_tax_dict = make_taxa_count_dict(this.obj_dataset_seq_tax_dict)
  // 
  // });
  

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
