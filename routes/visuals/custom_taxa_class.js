/*
 * TaxonomyTree = custom_taxa_class.js
 */

var constants = require('../../public/constants');
var helpers = require('../helpers');

// Private
var taxon_name_id = 1;

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

function add_to_dict_by_key(dictMap, dictMap_key, value) 
{
  dictMap[dictMap_key] = value;
  return dictMap
};

function get_by_key(dictMap, dictMap_key) 
{
  return dictMap[dictMap_key];
};

function make_current_dict(taxa_name, taxa_rank, i_am_a_parent, taxon_name_id)
{
  var current_dict =
  {
    parent_id: "",
    children_ids : [],
    taxon: "",
    rank: "",
    node_id: 1
  };
  
  current_dict.taxon = taxa_name;
  current_dict.rank = taxa_rank;
  current_dict.parent_id = i_am_a_parent;
  current_dict.node_id = taxon_name_id;
  return current_dict;
}

function add_children_to_parent(dictMap_by_id, current_dict)
{
  add_to_dict_by_key(dictMap_by_id, current_dict.node_id, current_dict);
  
  parent_node = dictMap_by_id[current_dict.parent_id];
  if (parent_node)
  {
    parent_node.children_ids.push(current_dict.node_id)
  }
  return parent_node;
}

function childrens(dict_map_by_id, this_node, my_html, count_uls)
{
  var childrens_arr = this_node.children_ids;
  console.log("AAAA this_node = " + JSON.stringify(this_node));
  console.log("UUUUU childrens_arr = " + JSON.stringify(childrens_arr));
  
  // AAAA this_node = {"parent_id":0,"children_ids":[2],"taxon":"Archaea","rank":"domain","node_id":1}
  // UUUUU childrens_arr = [2]
  
  if (childrens_arr.length > 0)
  {
    for (var i=0; i < childrens_arr.length; i++)
    {
      this_node = dict_map_by_id[childrens_arr[i]];
      // console.log("TTT this_node = " + JSON.stringify(this_node));
      // TTT this_node = {"parent_id":1,"children_ids":[3,4,5],"taxon":"Crenarchaeota","rank":"phylum","node_id":2}
    
      my_html += '<ul class="' + this_node.rank + '">';
      my_html += '<li class="expandable">' + this_node.taxon;
      count_uls += 1;
    }
    childrens(dict_map_by_id, this_node, my_html, count_uls);
  }
  /*
  want to see here:
  <div id=\"my_custom_list\">
  <ul class=\"domain\">
  <li class=\"expandable\">Archaea
  <ul class=\"phylum\">
  <li class=\"expandable\">Crenarchaeota
  <ul class=\"klass\">
  <li class=\"expandable\">D-F10
  <li class=\"expandable\">Group_C3
  <li class=\"expandable\">Marine_Benthic_Group_A"
  
  */
  
  console.log("YYY my_html = " + JSON.stringify(my_html));
  console.log("EEE count_uls = " + JSON.stringify(count_uls));
  
  return [count_uls, my_html, this_node]; 
}

function make_html_tree(dict_map_by_id)
{
  // {"1":{"parent_id":0,"children_ids":[2],"taxon":"Archaea","rank":"domain","node_id":1},
  // "2":{"parent_id":1,"children_ids":[3,4,5],"taxon":"Crenarchaeota","rank":"phylum","node_id":2},
  var count_uls = 0;
  var domain_node = dict_map_by_id["1"];
  
  var my_html = '<div id="my_custom_list">';
  my_html += '<ul class="' + domain_node.rank + '">';
  my_html += '<li class="expandable">' + domain_node.taxon;
  
  // var childrens_arr = domain_node.children_ids;
  // if (childrens_arr.length > 0)
  // {
  
  // repete
  // [count_uls, my_html, this_node] 
  var res = childrens(dict_map_by_id, domain_node, my_html, count_uls);
  count_uls = res[0];
  my_html = res[1];
  this_node = res[2];

  //     for (var i=0; i < children_length; i++)
  //     {
  //       var this_node = dict_map_by_id[childrens_arr[i]];
  //       // console.log("TTT this_node = " + JSON.stringify(this_node));
  //       // TTT this_node = {"parent_id":1,"children_ids":[3,4,5],"taxon":"Crenarchaeota","rank":"phylum","node_id":2}
  //       
  //       my_html += '<ul class="' + this_node.rank + '">';
  //       my_html += '<li class="expandable">' + this_node.taxon;
  //       count_uls += 1;
  //     }
  // }
  // repete

  // console.log("TTT count_uls = " + JSON.stringify(count_uls));
  
  for (var i=0; i <= count_uls; i++)
  {
    my_html += '</li>';
    my_html += '</ul>';    
  }
  
  my_html += '</div>';
  console.log("MMM my_html = " + JSON.stringify(my_html));
  
  /*
  is_terminal = false;
  current_node = dict_map_by_id["1"];
  function getLeaf(node) {
      if (node.children_ids.length) {
          return getLeaf(node.leftChild);
      } else if (node.rightChild) {
          return getLeaf(node.rightChild);
      } else { // node must be a leaf node
          return node;
      }
  }
  
  if (current_node.parent_id === 0)
  {
    if (current_node.children_ids.length === 0)
    {
      is_terminal = true;
    }    
    else
    {
      
    }
  }
  */
}


function make_taxa_tree_dict(taxonomy_obj)
{
  var taxa_tree_dict = [];
  var dictMap_by_name_n_rank = {};
  var dictMap_by_id = {};
  for (var i=0; i < taxonomy_obj.length; i++)
  {
    in_obj = taxonomy_obj[i];
    // console.log("taxon_objs[i] = " + JSON.stringify(in_obj));
    var i_am_a_parent = 0;

    for (var taxa_rank in in_obj)
    {
      var parent_node = current_dict = {};

      if (in_obj.hasOwnProperty(taxa_rank))
      {
        var taxa_name = in_obj[taxa_rank];
        if (taxa_name)
        {
          node = get_by_key(dictMap_by_name_n_rank, taxa_name + taxa_rank);

          if (!node)
          {
            current_dict = make_current_dict(taxa_name, taxa_rank, i_am_a_parent, taxon_name_id)

            taxa_tree_dict.push(current_dict);
            
            add_to_dict_by_key(dictMap_by_name_n_rank, current_dict.taxon + current_dict.rank, current_dict);

            i_am_a_parent = current_dict.node_id;

            taxon_name_id += 1;
            
            add_children_to_parent(dictMap_by_id, current_dict);
          }
          else
          {
            i_am_a_parent = node.node_id;
          }
        }
      }
    }
  }  
  return [taxa_tree_dict, dictMap_by_id];
}

// Public
module.exports = TaxonomyTree;

function TaxonomyTree(rows) {
  this.taxa_tree_dict = this.taxa_tree_dict_map_by_rank = [];
  this.taxonomy_obj = rows;
  
  temp_arr = make_taxa_tree_dict(this.taxonomy_obj);
  this.taxa_tree_dict = temp_arr[0];
  this.taxa_tree_dict_map_by_rank = make_dictMap_by_rank(this.taxa_tree_dict);
  this.taxa_tree_dict_map_by_id = temp_arr[1];
  
  this.html_tree = make_html_tree(this.taxa_tree_dict_map_by_id);
}

TaxonomyTree.prototype.make_dict = function(tree_obj, key_name) 
{
  var i = null;
  new_dict = {};
  for (i = 0; tree_obj.length > i; i += 1) {
    new_dict[tree_obj[i][key_name]] = tree_obj[i];
  }
  return new_dict;
}


// 
// TaxonomyTree.prototype.togglePaid = function() {
//   this._paid = !this._paid;
// };
// 
// TaxonomyTree.prototype.userType = function() {
//   if(this._paid) return 'Paid TaxonomyTree';
//   else           return 'Free TaxonomyTree';
// };
// 
// TaxonomyTree.prototype.addBalance = function(amount) {
//   this.balance += depositeMinusFee(amount);
// };
