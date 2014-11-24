 
//  var pi_local  = JSON.parse('<%- post_items %>');
//  var mtx_local = JSON.parse('<%- matrix %>');
//  var md_local  = JSON.parse('<%- metadata %>');
//  var ds_local  = JSON.parse('<%- chosen_id_name_hash %>');

var PostItems = Backbone.Model.extend({
  initialize: function(){
      console.log('This model has been initialized.');
  },
  defaults: {
    unit_choice: '',
    no_of_datasets: 0,
    normalization: 'none',
    visuals: undefined,
    selected_distance: 'morisita_horn',
    tax_depth: 'phylum',
    domains: [ ],
    custom_taxa: [ 'NA' ],
    include_nas: 'yes',
    min_range: 0,
    max_range: 100,
    metadata: [],
    ts: '',
    max_ds_count: 0

  }

});
var user_choices = new PostItems();
for(n in pi_local){
  user_choices.set(n,pi_local[n])
}
//alert(user_choices.get('ts'));
//////////////////////////////////////////////////////////////////////////////////
//
//  Datasets
//
var Dataset = Backbone.Model.extend({
  initialize: function(){
      console.log('This model has been initialized.');
  },
  defaults: {
    did: 0,
    name: '' 
  }
});
var DatasetCollection = Backbone.Collection.extend({  model: Dataset });
var datasetsCollection = new DatasetCollection({ localStorage: new Backbone.LocalStorage('datasets-backbone'), });
for(n in ds_local.ids){
  //alert(ds_local.names[n])
  datasetsCollection.add(  new Dataset({ id:n, did:ds_local.ids[n], name:ds_local.names[n] }));
}
//alert("Collection size: " + datasets.length);
//var ds1 = datasetsCollection.get(1);
//datasetsCollection.get(1).save();
//alert(ds1.get('id'))

//////////////////////////////////////////////////////////////////////////////////
//
// METADATA
//
var Metadata = Backbone.Model.extend({

});
//////////////////////////////////////////////////////////////////////////////////
//
// DATA MATRIX
//
var MatrixRow = Backbone.Model.extend({
  defaults: {    
    type: 'taxonomy',
    taxname: '',
    data: []
  }
  // validate that user_choices.get('no_of_datasets') === length of data
});
var MatrixRowCollection = Backbone.Collection.extend({  model: MatrixRow });
var matrixRowsCollection = new MatrixRowCollection();
for(i in mtx_local.data){
  //alert(mtx_local.rows[i].name)
  matrixRowsCollection.add(  new MatrixRow({ id:i, taxname:mtx_local.rows[i].name, data:mtx_local.data[i] }));
}

//alert(matrixRowsCollection.pluck('taxname'))
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////


