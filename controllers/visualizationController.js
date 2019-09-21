class viewSelection {
  setGetData(get_data) {
    this.get_data = get_data;
  }

  getGetData() {
    return this.get_data.get_get_data();
  }

}
// https://itnext.io/how-we-avoided-if-else-and-wrote-extendable-code-with-strategy-pattern-256e34b90caf
class viewSelectionGetData {

  constructor(func) {
    // it’s a function reference and not an actual call.
    this.get_data = func;
  }

  get_get_data() {
    return this.get_data();
  }
}

const default_data = new viewSelectionGetData(() => 'this is the get_data for gold');
const from_upload_configuration_file = new viewSelectionGetData(() => 'this is the get_data for gold');
const from_directory_configuration_file = new viewSelectionGetData(() => 'this is the get_data for goldAndInternational');
const resorted = new viewSelectionGetData(() => 'this is the get_data for goldAndDataHeavy');
const update_data = new viewSelectionGetData(() => 'this is the get_data for silver');
const cancel_resort = new viewSelectionGetData(() => 'this is the get_data for silver');
const restore_image = new viewSelectionGetData(() => 'this is the get_data for silver');
const api = new viewSelectionGetData(() => 'this is the get_data for silver');

module.exports = {
  viewSelection,
  default_data, from_upload_configuration_file, from_directory_configuration_file, resorted, update_data, cancel_resort, restore_image, api,
};

//   function StrategyA(){
//
//   }
//   StrategyA.prototype = {
//     execute: function() {
//       //custom behavior here
//     }
//   }
//
//   function StrategyB(){
//   }
//   StrategyB.prototype = {
//     execute: function() {
//       //custom behavior here
//     }
//   }
// }
//
// class viewSelectionFactory {
//   let  StrategyA = require('./strategyA.js'),
//   StrategyB = require('./strategyB.js');
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
//
// module.exports = {
//   StrategyA: StrategyA,
//   StrategyB: StrategyB
// }