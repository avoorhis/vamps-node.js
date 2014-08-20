var start = process.hrtime();

// benchmarking
var elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
    //start = process.hrtime(); // reset the timer
};


// http://book.mixu.net/node/ch6.html
// Constructor
function CustomTaxa(taxon_objs) {
  // always initialize all instance properties
  this.taxa_tree_dict = [];
  this.taxon_objs = taxon_objs;
  this.taxon_name_id = 1;
}
// class methods

// Foo.prototype.fooBar = function() {

  /**
  * http://jsfiddle.net/WilsonPage/yJSjP/3/
   * 'FindOne'
   * 
   * Returns one object from a collection of objects
   * that has a matching '_id' attribute
   * 
   * @param  {Array}    collection  An array of objects
   * @param  {String}   _id         The _id we are looking for
   * @param  {Function} cb          Callback - function(err, Item){}
   */
var nodeExist_1 = function(dict, taxon, rank) {
    var i = null;
      for (i = 0; dict.length > i; i += 1) {
        if (dict[i].taxon === taxon && dict[i].rank === rank) {
            return true;
        }
    }
    return false;
};

var nodeExist = function(dictMap, taxon_rank) {
    return dictMap[taxon_rank];
};


   
CustomTaxa.prototype.init_node = function() {
  // console.log("taxon_objs = " + JSON.stringify(this.taxon_objs));
  var dictMap = {};

  
  // for (var i=0; i < this.taxon_objs.length; i++)
  for (var i=0; i < 5; i++)
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
          
      
          // this.taxa_tree_dict[]
          // start = process.hrtime();
          node = nodeExist(dictMap, taxa_name + taxa_rank);
          // benchmarking
          // elapsed_time(">>>0 nodeExist(dictMap, taxa_name + taxa_rank);");
          
          // start = process.hrtime();
          // nodeExist_1(this.taxa_tree_dict, taxa_name, taxa_rank);
          // elapsed_time(">>>1 nodeExist_1(this.taxa_tree_dict, taxa_name, taxa_rank);");
          
          
          console.log("111 nodeExist(this.taxa_tree_dict, taxa_name + taxa_rank); = " + JSON.stringify(node));
          
          // get_current_node_id
          
          if (!node)
          {
            current_dict.node_id = this.taxon_name_id;
            this.taxa_tree_dict.push(current_dict);
            
            dictMap[current_dict.taxon + current_dict.rank] = current_dict;
            i_am_a_parent = current_dict.node_id;

            this.taxon_name_id += 1;
            parent_node = current_dict;
          }
          else
          {
            parent_node = node;
            i_am_a_parent = node.node_id;            
          }
          // else find the node and get id for parent/child
          console.log("current_dict = " + JSON.stringify(current_dict));
          console.log("i_am_a_parent = " + JSON.stringify(i_am_a_parent));
          
        }   
      }   
    }
  }
  console.log("555");
  console.log("taxa_tree_dict = " + JSON.stringify(this.taxa_tree_dict));
  console.log("dictMap = " + JSON.stringify(dictMap));
  
}

CustomTaxa.prototype.add_child_to_parent = function(dict, parent_id, node_id) {
  dict[parent_id].children_ids.push(node_id)
};

// export the class
module.exports = CustomTaxa;
