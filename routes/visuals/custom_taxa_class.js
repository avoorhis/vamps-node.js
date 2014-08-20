// http://book.mixu.net/node/ch6.html
// Constructor
function CustomTaxa(taxon_objs) {
  // always initialize all instance properties
  this.taxa_tree_dict = [];
  this.taxon_objs = taxon_objs;
  this.taxon_name_id = 0;
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
var findOne = function(collection, val, options, cb){
  if(typeof options === 'function'){ cb = options; options = {}; }

  // [Default] defualt attribute to search is '_id'
  options.key = options.key || '_id';

  // use async.detect() to return the first item that
  // matches the condition
  async.detect(collection, function(item, callback){
    var isMatch = (item[options.key] === val);
    return callback(isMatch);
  },cb);
};

CustomTaxa.prototype.init_node = function() {
  // console.log("taxon_objs = " + JSON.stringify(this.taxon_objs));
  var rank_num = 0;

  
  for (var i=0; i < this.taxon_objs.length; i++)
  {
    in_obj = this.taxon_objs[i];
    console.log("taxon_objs[i] = " + JSON.stringify(in_obj));
    // http://blog.tcs.de/creating-trees-from-sql-queries-in-javascript/
    for (var taxa_rank in in_obj) 
    {
      var current_dict = 
      {
        parent_id: "",
        children_ids : [],
        taxon: "",
        rank: "",
        node_id: 0    
      };  
      
      // if (in_obj.hasOwnProperty(taxa_rank)) 
      // {
        // console.log("taxa_rank = " + JSON.stringify(taxa_rank));
        // console.log("in_obj[taxa_rank] = taxa_name = " + JSON.stringify(taxa_name));
        var taxa_name = in_obj[taxa_rank];
        // if 
          current_dict.taxon = taxa_name;
          current_dict.rank = taxa_rank;
          current_dict.node_id = this.taxon_name_id;
      // }
      console.log("current_dict = " + JSON.stringify(current_dict));
      this.taxa_tree_dict.push(current_dict);
      this.taxon_name_id += 1;
      // .find(look_up)
      console.log("555");
      // console.log(typeof this.taxa_tree_dict);
      findOne(this.taxa_tree_dict, 'Archaea', {key: 'taxon'}, function(result){
         console.log(result);

      });
    }
  }
  console.log("taxa_tree_dict = " + JSON.stringify(this.taxa_tree_dict));
  
}

CustomTaxa.prototype.add_child_to_parent = function(dict, parent_id, node_id) {
  dict[parent_id].children_ids.push(node_id)
};

// export the class
module.exports = CustomTaxa;
