const COMMON = require(app_root + '/routes/visuals/routes_common');

class viewSelectionGetData {
  // const default_data = new viewSelectionGetData(() => 'this is the get_data for gold');
// const from_upload_configuration_file = new viewSelectionGetData(() => 'this is the get_data for gold');
// const from_directory_configuration_file = new viewSelectionGetData(() => 'this is the get_data for goldAndInternational');
// const resorted = new viewSelectionGetData(() => 'this is the get_data for goldAndDataHeavy');
// const update_data = new viewSelectionGetData(() => 'this is the get_data for silver');
// const cancel_resort = new viewSelectionGetData(() => 'this is the get_data for silver');
// const restore_image = new viewSelectionGetData(() => 'this is the get_data for silver');
// const api = new viewSelectionGetData(() => 'this is the get_data for silver');
//
  constructor(req) {
    this.image_to_open = {};
    this.dataset_ids = [];
    this.new_dataset_ids = [];
    this.visual_post_items = {};
    this.req = req;
    this.domains = ['Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown'];
  }

  default_data() {
    console.log('DEFAULT req.body');
    this.visual_post_items = COMMON.save_post_items(this.req);
    this.dataset_ids = this.req.session.chosen_id_order;
    this.req.session.no_of_datasets = this.dataset_ids.length;
    this.req.session.metadata = this.visual_post_items.metadata;
    this.req.session.normalization = "none";
    this.req.session.selected_distance = "morisita_horn";
    this.req.session.tax_depth = this.req.body.tax_depth;
    this.req.session.domains = this.req.body.domains || this.domains;
    this.req.session.include_nas = "yes";
    this.req.session.min_range = '0';
    this.req.session.max_range = '100';
    this.req.session.unit_choice = this.req.body.unit_choice;
    this.req.session.custom_taxa = this.visual_post_items.custom_taxa;
  }

  from_upload_configuration_file(){
  }
}

module.exports = function () {

  var serviceDescriptions: [
    { name: 'a', service:  StrategyA},
    {name: 'b', service:  StrategyB}
  ];

  var getStrategy: function (name) {
    //asuming you have underscore, otherwise, just iterate the array to look for the proper service
    return _.find(this.serviceDescriptions, {name: name}).service;
  };

}


// class viewSelectionFactory {
//   // let  StrategyA = require('./strategyA.js'),
//   // StrategyB = require('./strategyB.js');
//
//   module.exports = function () {
//
//     var serviceDescriptions: [
//       { name: 'a', service:  StrategyA },
//       { name: 'b', service:  StrategyB }
//     ];
//
//     var getStrategy: function (name) {
//       //asuming you have underscore, otherwise, just iterate the array to look for the proper service
//       return _.find(this.serviceDescriptions, {name: name}).service;
//     };
//
//   }
// }


// module.exports = {
//   StrategyA: StrategyA,
//   StrategyB: StrategyB
// }

// class viewSelection {
//   setGetData(get_data) {
//     this.get_data = get_data;
//   }
//
//   getGetData() {
//     return this.get_data.get_get_data();
//   }
//
// }
// // https://itnext.io/how-we-avoided-if-else-and-wrote-extendable-code-with-strategy-pattern-256e34b90caf
// class viewSelectionGetData {
//
//   constructor(func) {
//     // it’s a function reference and not an actual call.
//     this.get_data = func;
//   }
//
//   get_get_data() {
//     return this.get_data();
//   }
// }
//
// const default_data = new viewSelectionGetData(() => 'this is the get_data for gold');
// const from_upload_configuration_file = new viewSelectionGetData(() => 'this is the get_data for gold');
// const from_directory_configuration_file = new viewSelectionGetData(() => 'this is the get_data for goldAndInternational');
// const resorted = new viewSelectionGetData(() => 'this is the get_data for goldAndDataHeavy');
// const update_data = new viewSelectionGetData(() => 'this is the get_data for silver');
// const cancel_resort = new viewSelectionGetData(() => 'this is the get_data for silver');
// const restore_image = new viewSelectionGetData(() => 'this is the get_data for silver');
// const api = new viewSelectionGetData(() => 'this is the get_data for silver');
//
// module.exports = {
//   // viewSelection,
//   viewSelectionGetData
// };

