/*
 * TaxonomyTree = custom_taxa_class1.js
 */

var constants = require('../../public/constants');
var helpers = require('../helpers');

// Private
// var userCount = 0;
var taxon_name_id = 1;

// function depositeMinusFee(num1) {
//   return num1 - 0.1;
// }

function make_dictMap_by_rank(tags) {
  var dictMap_by_rank = {};
  var ranks = constants.RANKS;
  ranks.forEach(function(rank) {
    dictMap_by_rank[rank] = [];
  });
  var i = null;
  for (i = 0; tags.length > i; i += 1) {
    dictMap_by_rank[tags[i].rank].push(tags[i]);
  }
  return dictMap_by_rank
}

function get_by_key(dictMap, dictMap_key) {
    return dictMap[dictMap_key];
};


function make_taxa_tree_dict(taxonomy_obj)
{
  // console.log("taxon_objs = " + JSON.stringify(taxonomy_obj));
  var taxa_tree_dict = [];
  var dictMap_by_name_n_rank = {};
  var dictMap_by_id = {};
  for (var i=0; i < taxonomy_obj.length; i++)
  {
    in_obj = taxonomy_obj[i];
    console.log("taxon_objs[i] = " + JSON.stringify(in_obj));
    var i_am_a_parent = 0;

    for (var taxa_rank in in_obj)
    {
      var current_dict =
      {
        parent_id: "",
        children_ids : [],
        taxon: "",
        rank: "",
        node_id: 1
      };
      var parent_node = current_dict;

      if (in_obj.hasOwnProperty(taxa_rank))
      {
        // console.log("taxa_rank = " + JSON.stringify(taxa_rank));
        // console.log("in_obj[taxa_rank] = taxa_name = " + JSON.stringify(taxa_name));
        var taxa_name = in_obj[taxa_rank];
        if (taxa_name)
        {
          current_dict.taxon = taxa_name;
          current_dict.rank = taxa_rank;

          current_dict.parent_id = i_am_a_parent;
          node = get_by_key(dictMap_by_name_n_rank, taxa_name + taxa_rank);

          if (!node)
          {
            current_dict.node_id = taxon_name_id;
            taxa_tree_dict.push(current_dict);

            // start = process.hrtime();
            dictMap_by_name_n_rank[current_dict.taxon + current_dict.rank] = current_dict;
            // elapsed_time(">>>0 nodeExist(dictMap_by_name_n_rank, taxa_name + taxa_rank);");
            dictMap_by_id[current_dict.node_id] = current_dict;

      //       start = process.hrtime();
      //       dictMap_by_rank[current_dict.rank].push(current_dict);
      //       elapsed_time(">>>4 populate dictMap_by_rank[\"domain\"]");
            
            i_am_a_parent = current_dict.node_id;

            taxon_name_id += 1;

            parent_node = dictMap_by_id[current_dict.parent_id];
            if (parent_node)
            {
              // console.log("BEFORE parent_node = " + JSON.stringify(parent_node));
              parent_node.children_ids.push(current_dict.node_id)
              // console.log("AFTER parent_node = " + JSON.stringify(parent_node));
            }

          }
          else
          {
            i_am_a_parent = node.node_id;
          }

          // else find the node and get id for parent/child
          // console.log("current_dict = " + JSON.stringify(current_dict));
          // console.log("i_am_a_parent = " + JSON.stringify(i_am_a_parent));

        }
      }
    }
  }
  console.log("555");
  // items = taxa_tree_dict.filter(function(item){
  //   return (item.node_id === 15);
  // });
  // console.log(items);

  // start = process.hrtime();
  helpers.start = process.hrtime();
  
  items = taxa_tree_dict.filter(function(item){
    return (item.rank === "domain");
    // return (item.taxon === taxa_name);
  });
  helpers.elapsed_time(">>>3 filter");
  console.log("333 filter = " + JSON.stringify(items) + "\n=====\n");


  // console.log("666");
  // console.log(get_by_key(dictMap_by_rank, "domain"));
  
  // start = process.hrtime();
  // elapsed_time(">>>7 create separately dictMap_by_rank[\"domain\"]");
  // console.log("777 dictMap_by_rank[\"domain\"] = " + JSON.stringify(items) + "\n=====\n");
  // 
  // 
  // start = process.hrtime();
  helpers.start = process.hrtime();
  dictMap_by_rank = make_dictMap_by_rank(taxa_tree_dict);
  items = dictMap_by_rank["domain"];
  helpers.elapsed_time(">>>5 dictMap_by_rank[\"domain\"]");
  console.log("444 dictMap_by_rank[\"domain\"] = " + JSON.stringify(items) + "\n=====\n");

  // console.log(dictMap_by_rank["domain"])
  console.log("ALL in dictMap_by_rank = " + JSON.stringify(dictMap_by_rank));

  console.log("taxa_tree_dict = " + JSON.stringify(taxa_tree_dict));
//   console.log("dictMap = " + JSON.stringify(dictMap));
  return taxa_tree_dict;
}


// Public
self = module.exports = TaxonomyTree;

function TaxonomyTree(rows) {
  this.taxa_tree_dict = [];
  this.taxonomy_obj = rows;
  
  this.taxa_tree_dict = make_taxa_tree_dict(this.taxonomy_obj);
  // this.id = userCount;
  // this.name = n;
  // this._paid = false;
  // this.balance = 0;
  // userCount++;
}

TaxonomyTree.prototype.togglePaid = function() {
  this._paid = !this._paid;
};

TaxonomyTree.prototype.userType = function() {
  if(this._paid) return 'Paid TaxonomyTree';
  else           return 'Free TaxonomyTree';
};

TaxonomyTree.prototype.addBalance = function(amount) {
  this.balance += depositeMinusFee(amount);
};
