/*
 * TaxonomyTree = custom_taxa_class.js
 */

var constants = require('../../public/constants');
var helpers = require('../helpers');
var fs = require('fs');

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

function start_ul(level, new_level, class_name)
{
  if (level != new_level)
  {
    var html = '<ul class="' + class_name + '">';
    console.log(html); 
    return html;
  }
}

function end_ul(level, new_level, class_name)
{
  if (level === new_level)
  {
    // console.log("</li>");
    // console.log('</ul> <!-- class="' + class_name + '"-->'); 
    var html = '</li>\n</ul> <!-- class="' + class_name + '"-->'
    console.log(html);
    return html;
  }
}

// function create_partial_file(fileName)
// {
//   fs.exists(fileName, function (exists) {
//           if (exists) {
//           }
//         }
//       );
//   fs.open(fileName, flags, [mode], callback)  
// }

function write_partial(html) 
{

  var fileName = __dirname + '/../../views/visuals/partials/tax_silva108_custom.html';
  console.log("LLL __dirname = " + __dirname);
  console.log("LLL1 html = " + html);
  
  fs.appendFileSync(fileName, html);
}

function traverse(dict_map_by_id, this_node, level)
{ 
  var new_level = 0;  
  var html = "";
  console.log("XXX this_node = " +  JSON.stringify(this_node));
  console.log("XXX_start level = " + level);
  console.log("XXX_start new_level = " + new_level);
  
  html = start_ul(level, new_level, this_node.rank);
  write_partial(html);
    
  var kids_length = this_node.children_ids ? this_node.children_ids.length : 0;
  
  console.log("TTT this_node.children_ids (kids_length) = " + JSON.stringify(kids_length));
  console.log('<li class="expandable">' + this_node.taxon);
  html = '<li class="expandable">' + this_node.taxon;
  write_partial(html);
  
  for (var i=0; i < kids_length; i++)
  {
    level += 1;
    traverse(dict_map_by_id, dict_map_by_id[this_node.children_ids[i]], level);
    level -= 1;    
  }
  new_level = level;
  console.log("XXX_end level = " + level);
  console.log("XXX_end new_level = " + new_level);
  html = end_ul(level, new_level, this_node.rank);
  write_partial(html);
  
  console.log("\n=================\n");
  
}

function make_html_tree(dict_map_by_id, domains)
{
  var level = 1;
  // create_partial_file();
  
  for (var i=0; i < domains.length; i++)
  {
    traverse(dict_map_by_id, domains[i], level);
  }
}

// Public
module.exports = TaxonomyTree;

function TaxonomyTree(rows) {
  this.taxa_tree_dict = [];
  this.taxa_tree_dict_map_by_rank = [];
  this.taxonomy_obj = rows;
  
  temp_arr = make_taxa_tree_dict(this.taxonomy_obj);
  this.taxa_tree_dict = temp_arr[0];
  this.taxa_tree_dict_map_by_rank = make_dictMap_by_rank(this.taxa_tree_dict);
  this.taxa_tree_dict_map_by_id = temp_arr[1];
  
  this.html_tree = make_html_tree(this.taxa_tree_dict_map_by_id, this.taxa_tree_dict_map_by_rank["domain"]);
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
