// benchmarking
var constants = require('../../public/constants');

var start = process.hrtime();
var elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
    //start = process.hrtime(); // reset the timer
};


function CustomTaxa(taxon_objs) {
    this.taxa_tree_dict = [];
    // this.taxon_objs = taxon_objs;
    this.taxon_objs = [{"domain":"Archaea","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"D-F10","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"Group_C3","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"Marine_Benthic_Group_A","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Acidobacteria","order":"Acidobacteriales","family":"Acidobacteriaceae","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Holophagae","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Holophagae","order":"Holophagales","family":"Holophagaceae","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"Acidimicrobiales","family":"","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"Acidimicrobiales","family":"Acidimicrobiaceae","genus":"","species":"","strain":""}];
    
    this.taxon_name_id = 1;

}

CustomTaxa.prototype.execute = function() {
  this.taxa_tree_dict = init_node(this.taxon_objs);
  return this.taxa_tree_dict;
};

// http://book.mixu.net/node/ch6.html
// Constructor
// function CustomTaxa(taxon_objs) {
//   // always initialize all instance properties
//   this.taxa_tree_dict = [];
//   // this.taxon_objs = taxon_objs;
//   this.taxon_objs = [{"domain":"Archaea","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"D-F10","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"Group_C3","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"Marine_Benthic_Group_A","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Acidobacteria","order":"Acidobacteriales","family":"Acidobacteriaceae","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Holophagae","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Holophagae","order":"Holophagales","family":"Holophagaceae","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"","family":"","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"Acidimicrobiales","family":"","genus":"","species":"","strain":""},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"Acidimicrobiales","family":"Acidimicrobiaceae","genus":"","species":"","strain":""}];
//   this.taxon_name_id = 1;
//   this.taxa_tree_dict = init_node(this.taxa_tree_dict);
// }

function make_dictMap_by_rank(tags) {
  var dictMap_by_rank = {};
  var ranks = constants.RANKS;
  ranks.forEach(function(rank) {
    dictMap_by_rank[rank] = [];
  });
  // var tags = this.taxa_tree_dict;
  var i = null;
  for (i = 0; tags.length > i; i += 1) {
    dictMap_by_rank[tags[i].rank].push(tags[i]);
  }
  return dictMap_by_rank
}

// class methods
// Foo.prototype.fooBar = function() {

function get_by_key(dictMap, dictMap_key) {
    return dictMap[dictMap_key];
};

CustomTaxa.prototype.init_node = function(taxon_objs) 
// function init_node() 
{
  // this.taxa_tree_dict = taxa_tree_dict;
  console.log("taxon_objs = " + JSON.stringify(this.taxon_objs));
  var dictMap_by_name_n_rank = {};
  var dictMap_by_id = {};
  for (var i=0; i < this.taxon_objs.length; i++)
  {
    in_obj = this.taxon_objs[i];
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
            current_dict.node_id = this.taxon_name_id;
            this.taxa_tree_dict.push(current_dict);

            // start = process.hrtime();
            dictMap_by_name_n_rank[current_dict.taxon + current_dict.rank] = current_dict;
            // elapsed_time(">>>0 nodeExist(dictMap_by_name_n_rank, taxa_name + taxa_rank);");
            dictMap_by_id[current_dict.node_id] = current_dict;

      //       start = process.hrtime();
      //       dictMap_by_rank[current_dict.rank].push(current_dict);
      //       elapsed_time(">>>4 populate dictMap_by_rank[\"domain\"]");
            
            i_am_a_parent = current_dict.node_id;

            this.taxon_name_id += 1;

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
  // items = this.taxa_tree_dict.filter(function(item){
  //   return (item.node_id === 15);
  // });
  // console.log(items);

  start = process.hrtime();
  
  items = this.taxa_tree_dict.filter(function(item){
    return (item.rank === "domain");
    // return (item.taxon === taxa_name);
  });
  elapsed_time(">>>3 filter");
  console.log("333 filter = " + JSON.stringify(items) + "\n=====\n");


  // console.log("666");
  // console.log(get_by_key(dictMap_by_rank, "domain"));
  
  start = process.hrtime();
  // elapsed_time(">>>7 create separately dictMap_by_rank[\"domain\"]");
  // console.log("777 dictMap_by_rank[\"domain\"] = " + JSON.stringify(items) + "\n=====\n");
  // 
  // 
  // start = process.hrtime();
  dictMap_by_rank = make_dictMap_by_rank(this.taxa_tree_dict);
  items = dictMap_by_rank["domain"];
  elapsed_time(">>>5 dictMap_by_rank[\"domain\"]");
  console.log("444 dictMap_by_rank[\"domain\"] = " + JSON.stringify(items) + "\n=====\n");

  // console.log(dictMap_by_rank["domain"])
  console.log("ALL in dictMap_by_rank = " + JSON.stringify(dictMap_by_rank));

  console.log("taxa_tree_dict = " + JSON.stringify(this.taxa_tree_dict));
//   console.log("dictMap = " + JSON.stringify(dictMap));
  return this.taxa_tree_dict;
}

// export the class
module.exports = CustomTaxa;
