/*
 * TaxonomyTree = custom_taxa_class.js
 */

/*jshint multistr: true */

var CONSTS = require(app_root + '/public/constants');
var helpers = require('./helpers');
var fs = require('fs');

// Private
var taxon_name_id = 1;
var ranks = CONSTS.RANKS;

function make_dictMap_by_rank(tags) {
  var dictMap_by_rank = {};
  // var ranks = CONSTS.RANKS;
  ranks.forEach(function(rank) {
    dictMap_by_rank[rank] = [];
  });
  var i = null;
  for (i = 0; tags.length > i; i += 1) {
    dictMap_by_rank[tags[i].rank].push(tags[i]);
  }
  return dictMap_by_rank;
}

function add_to_dict_by_key(dictMap, dictMap_key, value) 
{
  dictMap[dictMap_key] = value;
  return dictMap;
}

function get_by_key(dictMap, dictMap_key) 
{
  return dictMap[dictMap_key];
}

function make_current_dict(taxa_name, taxa_rank, i_am_a_parent, taxon_name_id, db_id)
{
  var current_dict =
  {
    parent_id: "",
    children_ids : [],
    taxon: "",
    rank: "",
    node_id: 1,
    db_id: 1
  };
  
  current_dict.taxon = taxa_name;
  current_dict.rank = taxa_rank;
  current_dict.parent_id = i_am_a_parent;
  current_dict.node_id = taxon_name_id;
  current_dict.db_id = db_id;
  return current_dict;
}

function add_children_to_parent(dictMap_by_id, current_dict)
{
  add_to_dict_by_key(dictMap_by_id, current_dict.node_id, current_dict);
  
//  TODO: test if changed to var and removed from above
  parent_node = dictMap_by_id[current_dict.parent_id];
  if (parent_node)
  {
    parent_node.children_ids.push(current_dict.node_id);
  }
  return parent_node;
}

function check_if_rank(field_name)
{
  // ranks = ["domain","phylum","klass","order","family","genus","species","strain"]
  return ranks.indexOf(field_name) > -1;
}

function make_taxa_tree_dictNEW(taxonomy_obj)
{
  var taxa_tree_dict = [];
  var dictMap_by_name_n_rank = {};
  var dictMap_by_db_id_n_rank = {};
  var ranks = ['domain','phylum','klass','order','family','genus','species','strain']
  var dictMap_by_id = {};
  //console.log("HHH0");
  //console.log("taxonomy_obj = " + JSON.stringify(taxonomy_obj));
  //console.log("HHH");
  
  for (var i=0, len = taxonomy_obj.length; i < len; i++)
  {
    
	in_obj = taxonomy_obj[i];
    console.log("\ntaxon_objs[i] = " + JSON.stringify(in_obj));
    var i_am_a_parent = 0;
	//var domain_id = in_obj.domain_id
    //for (var field_name in in_obj)
	for(var n=0; n<ranks.length; n++)
	//for(var n=ranks.length-1; n>=0; n--)
    {
      		var field_name = ranks[n]

	        var db_id_field_name = field_name + "_id";
	        // console.log("db_id_field_name = " + JSON.stringify(db_id_field_name));
	        var db_id = in_obj[db_id_field_name];
	        // console.log("db_id = " + JSON.stringify(db_id));
      
	        //var parent_node = {}; 
	        var current_dict = {};
	        taxa_rank = field_name;
		
	        var taxa_name = in_obj[taxa_rank];
          
	        console.log(" name_rank1 = " + taxa_name + " - " + taxa_rank);
			
			node = get_by_key(dictMap_by_name_n_rank, taxa_name + "_" + taxa_rank);
			console.log(taxa_rank+" old_node = " + JSON.stringify(node));
			
		
			if (!node || taxa_name.substr(-3) == '_NA')
	        {
		          //console.log("taxa_name = " + JSON.stringify(taxa_name));
		          //console.log("taxa_rank = " + JSON.stringify(taxa_rank));
		          //console.log("i_am_a_parent = " + JSON.stringify(i_am_a_parent));
		          //console.log("taxon_name_id = " + JSON.stringify(taxon_name_id));
		          //console.log("name_rank2 = " + taxa_name+' - '+taxa_rank)
		          current_dict = make_current_dict(taxa_name, taxa_rank, i_am_a_parent, taxon_name_id, db_id);
				  console.log(taxa_rank+" new_node = " + JSON.stringify(current_dict));
				  //console.log("current_dict = " + JSON.stringify(current_dict,null,4))
          
				  taxa_tree_dict.push(current_dict);
         
		          add_to_dict_by_key(dictMap_by_name_n_rank,  current_dict.taxon + "_" + current_dict.rank, current_dict);
          
				  add_to_dict_by_key(dictMap_by_db_id_n_rank, current_dict.db_id + "_" + current_dict.rank, current_dict);

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
  
  return [taxa_tree_dict, dictMap_by_id, dictMap_by_db_id_n_rank, dictMap_by_name_n_rank];
}

// todo: refactoring! Too long and nested
function make_taxa_tree_dict(taxonomy_obj)
{
  var taxa_tree_dict = [];
  var dictMap_by_name_n_rank = {};
  var dictMap_by_db_id_n_rank = {};
  
  var dictMap_by_id = {};
  //console.log("HHH0");
  //console.log("taxonomy_obj = " + JSON.stringify(taxonomy_obj));
  //console.log("HHH");
  
  for (var i=0, len = taxonomy_obj.length; i < len; i++)
  {
    
	in_obj = taxonomy_obj[i];
    //console.log("\ntaxon_objs[i] = " + JSON.stringify(in_obj));
    var i_am_a_parent = 0;
	//var domain_id = in_obj.domain_id
    for (var field_name in in_obj)
    {
       //console.log("field_name = " + JSON.stringify(field_name));
      // ranks.forEach(function(rank) {
       //  dictMap_by_rank[rank] = [];
       //});
       
      
      var is_rank = check_if_rank(field_name);
      if (is_rank)
      {
        var db_id_field_name = field_name + "_id";
        // console.log("db_id_field_name = " + JSON.stringify(db_id_field_name));
        var db_id = in_obj[db_id_field_name];
        // console.log("db_id = " + JSON.stringify(db_id));
      
        var parent_node = {}; 
        var current_dict = {};
        taxa_rank = field_name;
		
        if (in_obj.hasOwnProperty(taxa_rank))
        {
          var taxa_name = in_obj[taxa_rank];
          if (taxa_name)
          {
            //console.log("name_rank1 = " + taxa_name + " - " + taxa_rank);
			node = get_by_key(dictMap_by_name_n_rank, taxa_name + "_" + taxa_rank);
			//console.log("old_node = " + JSON.stringify(node));
            
			
			if (!node)
            {
              // console.log("taxa_name = " + JSON.stringify(taxa_name));
              // console.log("taxa_rank = " + JSON.stringify(taxa_rank));
              // console.log("i_am_a_parent = " + JSON.stringify(i_am_a_parent));
              // console.log("taxon_name_id = " + JSON.stringify(taxon_name_id));
              // console.log("name_rank2 = " + taxa_name+' - '+taxa_rank)
              current_dict = make_current_dict(taxa_name, taxa_rank, i_am_a_parent, taxon_name_id, db_id);
			        //console.log("new_node = " + JSON.stringify(current_dict));
			        //console.log("current_dict = " + JSON.stringify(current_dict,null,4))
              
			        taxa_tree_dict.push(current_dict);
             
              add_to_dict_by_key(dictMap_by_name_n_rank,  current_dict.taxon + "_" + current_dict.rank, current_dict);
              
			        add_to_dict_by_key(dictMap_by_db_id_n_rank, current_dict.db_id + "_" + current_dict.rank, current_dict);

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
      else
      {
        continue;
      }
    }
  } 
  
  return [taxa_tree_dict, dictMap_by_id, dictMap_by_db_id_n_rank, dictMap_by_name_n_rank];
}

function start_ul(level, new_level, class_name)
{
  if (level != new_level)
  {
    var html = '\n<ul class="' + class_name + '">';
    // console.log(html); 
    return html;
  }
}

function end_ul(level, new_level, class_name)
{
  if (level === new_level)
  {
    var html = '\n</li>\n</ul> <!-- class="' + class_name + '"-->';
    return html;
  }
}

function clear_partial_file(fileName)
{
  fs.openSync(fileName, "w");
}

function write_partial(fileName, html) 
{
  fs.appendFileSync(fileName, html);
}

function add_li(this_node)
{
  this_html = '<li>\n';
  this_html += '<span class="sign"><i class="icon-no-sign"></i></span>';
  this_html += '<input name="custom_taxa" class="custom-taxa" type="checkbox" id="' + this_node.taxon + '" value="' + this_node.taxon + '_' +this_node.rank + '"/>\n';  
  this_html += '<span class="open-one-layer">' + this_node.taxon + '</span>';
  return this_html;
}

function traverse(dict_map_by_id, this_node, level, fileName)
{ 
  /** todo: 
  *) benchmark what's faster: write_partial 3 times or collect html and then write_partial once above.
  */
  var new_level = 0;  
  var html = "";

  html = start_ul(level, new_level, this_node.rank);
  write_partial(fileName, html);
    
  var kids_length = this_node.children_ids ? this_node.children_ids.length : 0;
  
  //console.log('this_node: ' + JSON.stringify(this_node));
    
  html = add_li(this_node);
  write_partial(fileName, html);
  
  for (var i=0; i < kids_length; i++)
  {
//    TODO: The parameter level should not be assigned
    level += 1;
    traverse(dict_map_by_id, dict_map_by_id[this_node.children_ids[i]], level, fileName);
    level -= 1;    
  }
  new_level = level;
  html = end_ul(level, new_level, this_node.rank);
  write_partial(fileName, html);
  
}

function add_title(fileName, title)
{
  write_partial(fileName, title);
}

// Public
module.exports = TaxonomyTree;

function TaxonomyTree(rows) {
  this.taxa_tree_dict = [];
  this.taxa_tree_dict_map_by_rank = [];
  this.taxonomy_obj = rows;
  
  temp_arr = make_taxa_tree_dict(this.taxonomy_obj);
  this.taxa_tree_dict = temp_arr[0];
  this.taxa_tree_dict_map_by_id = temp_arr[1]; 
  this.taxa_tree_dict_map_by_db_id_n_rank = temp_arr[2]; 
  this.taxa_tree_dict_map_by_name_n_rank = temp_arr[3]; 
  this.taxa_tree_dict_map_by_rank = make_dictMap_by_rank(this.taxa_tree_dict);
  //console.log("HHH1");
  //console.log("taxonomy_obj = " + JSON.stringify(this.taxonomy_obj));
  //console.log("HHH");
}

TaxonomyTree.prototype.make_dict = function(tree_obj, key_name) 
{
  var i = null;
  new_dict = {};
  for (i = 0; tree_obj.length > i; i += 1) {
    new_dict[tree_obj[i][key_name]] = tree_obj[i];
  }
  return new_dict;
};

TaxonomyTree.prototype.make_html_tree_file = function(dict_map_by_id, domains)
{
  var level = 1;
  var fileName = __dirname + '/../../views/visuals/partials/tax_silva108_custom.html';
  
  clear_partial_file(fileName);
  var page_head = "<h3>Silva(v108) Custom Taxonomy Selection</h3>\n<input type='hidden' value='tax_silva108_custom' name='unit_choice' />\n\
  <div class='radiobox'>\n\
		Selection Mode:\n\
    <input id='clade' type='radio' value='clade' checked='checked' name='mode'>\n\
    Clade\n\
    <input id='individual' type='radio' value='individual' name='mode'>\n\
    Individual\n\
  </div>\n\
  <div class='tree well'>";
  add_title(fileName, page_head);
  
  for (var i=0; i < domains.length; i++)
  {
    traverse(dict_map_by_id, domains[i], level, fileName);
  }
  write_partial(fileName, "</div> <!-- tree well -->");
  
  
};
