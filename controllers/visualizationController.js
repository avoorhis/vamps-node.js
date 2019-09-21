const COMMON = require(app_root + '/routes/visuals/routes_common');
const helpers = require(app_root + '/routes/helpers/helpers');
const fs = require('fs-extra');
const path = require('path');

class viewSelectionGetData {
  // const default_data = new viewSelectionGetData(() => 'this is the get_data for gold');
// const from_upload_configuration_file = new viewSelectionGetData(() => 'this is the get_data for gold');
// const from_directory_configuration_file = new viewSelectionGetData(() => 'this is the get_data for goldAndInternational');
// const from_resorted = new viewSelectionGetData(() => 'this is the get_data for goldAndDataHeavy');
// const from_update_data = new viewSelectionGetData(() => 'this is the get_data for silver');
// const from_cancel_resort = new viewSelectionGetData(() => 'this is the get_data for silver');
// const from_restore_image = new viewSelectionGetData(() => 'this is the get_data for silver');
// const from_api = new viewSelectionGetData(() => 'this is the get_data for silver');
//
  constructor(req) {
    // this.image_to_open = {};
    this.dataset_ids = [];
    this.new_dataset_ids = [];
    this.visual_post_items = {};
    this.req = req;
    this.domains = ['Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown'];
  }

  get_visual_post_items_common() {
    this.visual_post_items.custom_taxa = this.req.session.custom_taxa;
    this.visual_post_items.domains = this.req.session.domains;
    this.visual_post_items.include_nas = this.req.session.include_nas;
    this.visual_post_items.max_range = this.req.session.max_range;
    this.visual_post_items.metadata = this.req.session.metadata;
    this.visual_post_items.min_range = this.req.session.min_range;
    this.visual_post_items.no_of_datasets = this.dataset_ids.length;
    this.visual_post_items.normalization = this.req.session.normalization;
    this.visual_post_items.selected_distance = this.req.session.selected_distance;
    this.visual_post_items.tax_depth = this.req.session.tax_depth;
    this.visual_post_items.unit_choice = this.req.session.unit_choice;
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

  from_api() {
    console.log('From: API-API-API');
    this.visual_post_items = COMMON.default_post_items();
    // Change defaults:
    this.req.session.normalization = this.visual_post_items.normalization = this.req.body.normalization          || "none";
    this.req.session.selected_distance = this.visual_post_items.selected_distance = this.req.body.selected_distance  || "morisita_horn";
    this.req.session.tax_depth   = this.visual_post_items.tax_depth = this.req.body.tax_depth                  || "phylum";
    this.req.session.domains     = this.visual_post_items.domains = this.req.body.domains                      || ["Archaea", "Bacteria", "Eukarya", "Organelle", "Unknown"];
    this.req.session.include_nas = this.visual_post_items.include_nas = this.req.body.include_nas              || "yes";
    this.req.session.min_range   = this.visual_post_items.min_range = this.req.body.min_range                  || '0';
    this.req.session.max_range   = this.visual_post_items.max_range = this.req.body.max_range                  || '100';

    if ((this.req.body).hasOwnProperty('ds_order') && this.req.body.ds_order.length !== 0){
      console.log('Found api dids ',this.req.body.ds_order);
      try {
        this.dataset_ids = JSON.parse(this.req.body.ds_order);
      }
      catch(e){
        this.dataset_ids = this.req.body.ds_order;
      }
      this.new_dataset_ids = helpers.screen_dids_for_permissions(this.req, this.dataset_ids);
      this.dataset_ids = this.new_dataset_ids;
      this.req.session.chosen_id_order = this.visual_post_items.ds_order = this.dataset_ids;
    }
    else if ( (this.req.body).hasOwnProperty('project') && PROJECT_INFORMATION_BY_PNAME.hasOwnProperty(this.req.body.project) ){
      console.log('Found api project ',this.req.body.project);
      let pid = PROJECT_INFORMATION_BY_PNAME[this.req.body.project].pid;
      this.new_dataset_ids = helpers.screen_dids_for_permissions(this.req, this.dataset_ids_BY_PID[pid.toString()]);
      this.visual_post_items.ds_order = this.new_dataset_ids;
      console.log(PROJECT_INFORMATION_BY_PNAME[this.req.body.project]);
      console.log(this.visual_post_items.ds_order);
      this.req.session.chosen_id_order = this.dataset_ids = this.visual_post_items.ds_order;
      //console.log('dids',this.dataset_ids)
    } else {
      console.log('API ALERT - no dids or project');
      return;
    }

    this.visual_post_items.update_data = this.req.body.update_data || '1';   // fires changes

    this.req.session.no_of_datasets  = this.visual_post_items.no_of_datasets = this.dataset_ids.length;

    // for API select ALL metadata with these datasets
    let md = {}; // hash lookup unique
    for (let n in this.dataset_ids){
      let did = this.dataset_ids[n];
      for (let item in AllMetadata[did]){
        md[item] =1;
      }
    }
    this.req.session.metadata  = this.visual_post_items.metadata = Object.keys(md);

  }

  from_restore_image() {
    console.log('in view_selection RESTORE IMAGE');
  }

  from_cancel_resort() {
    console.log('resorted canceled');
    this.req.flash('success','Canceled Resort.');
    this.dataset_ids = JSON.parse(this.req.body.ds_order);
  }

  from_update_data() {  // from 'Update' button on view_selection.html
    console.log('Update Data');
    // populate this.req.session and this.visual_post_items from this.req.body(post)
    this.dataset_ids = this.req.session.chosen_id_order;
    this.visual_post_items = COMMON.save_post_items(this.req);
    for (let item in this.visual_post_items){
      this.req.session[item] = this.visual_post_items[item];
    }
  }

  from_resorted() {
    console.log('resorted === 1');
    // populate this.visual_post_items from this.req.session (except new ds_order)
    this.req.flash('success','The dataset order has been updated.');
    this.dataset_ids = this.req.body.ds_order;
    this.req.session.chosen_id_order = this.dataset_ids;
    this.get_visual_post_items_common();
  }

  from_directory_configuration_file() {
    // ALL Config files now loaded through GET (see router.get('/view_selection/:filename/:from_configuration_file')
    console.log('from_directory_configuration_file-POST');

    this.dataset_ids = this.req.session.chosen_id_order;
    this.get_visual_post_items_common();
    this.visual_post_items.update_data = 1;
  }
  // not in resorted: this.visual_post_items.update_data = 1;

  from_upload_configuration_file() {
    console.log('from_upload_configuration_file-POST');
    this.dataset_ids = this.req.session.chosen_id_order;
    this.get_visual_post_items_common();
    this.visual_post_items.update_data = 1;
  }
  
}
// module.exports = function () {
//
//   var serviceDescriptions: [
//     { name: 'a', service:  StrategyA},
//     {name: 'b', service:  StrategyB}
//   ];
//
//   var getStrategy: function (name) {
//     //asuming you have underscore, otherwise, just iterate the array to look for the proper service
//     return _.find(this.serviceDescriptions, {name: name}).service;
//   };
//
// }


class viewSelectionFactory {

  constructor(req) {
    this.req = req;
    this.dataset_ids = [];
    this.visual_post_items = {};
    this.get_data = new module.exports.viewSelectionGetData(req);
    this.select_get_data_strategy();
  }
    // module.exports.viewSelectionGetData
  select_get_data_strategy() {
    let req_body = this.req.body;

    if (req_body.api === '1') {
      this.get_data.from_api();
    }
    else if (req_body.cancel_resort === '1') {
      this.get_data.from_cancel_resort();
    }
    else if (req_body.from_directory_configuration_file === '1') {
      this.get_data.from_directory_configuration_file();
    }
    else if (req_body.from_upload_configuration_file === '1') {
      this.get_data.from_upload_configuration_file();
    }
    else if (req_body.resorted === '1') {
      this.get_data.from_resorted();
    }
    else if (req_body.restore_image === '1') {
      this.get_data.from_restore_image();
    }
    else if (req_body.update_data === '1') {
      this.get_data.from_update_data();
    }  // from 'Update' button on view_selection.html
    else {
      this.get_data.default_data();
    }

    this.dataset_ids = this.get_data.dataset_ids;
    this.visual_post_items = this.get_data.visual_post_items;
  }
}

module.exports = {
  viewSelectionGetData,
  viewSelectionFactory
};

