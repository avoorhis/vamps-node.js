const COMMON = require(app_root + '/routes/visuals/routes_common');
const helpers = require(app_root + '/routes/helpers/helpers');
const path = require('path');
const C = require(app_root + '/public/constants');

class viewSelectionGetData {

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
    /*
    * See
    https://github.com/joefutrelle/VAMPS_API_Interaction
    https://github.com/avoorhis/VAMPS-api
    https://github.com/sydneyruzicka/VAMPS_API_Interaction
    *
    * */
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
      this.new_dataset_ids = helpers.screen_dids_for_permissions(this.req, DATASET_IDS_BY_PID[pid.toString()]);
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
}

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
    else if (req_body.resorted === '1') {
      this.get_data.from_resorted();
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

class visualizationFiles {
  // constructor(req) {
  // }

  get_process_dir(req) {
    return req.CONFIG.PROCESS_DIR;
  }

  get_user_file_path(req) {
    const user_file_path = req.CONFIG.USER_FILES_BASE;
    return path.join(user_file_path, req.body.user, req.body.filename);
  }

  get_json_files_prefix(req) {
    return path.join(req.CONFIG.JSON_FILES_BASE,
      NODE_DATABASE + "--datasets_" + C.default_taxonomy.name);
  }

  get_biom_file_path(req, ts) {
    let biom_file_name = ts + '_count_matrix.biom';
    return path.join(req.CONFIG.TMP_FILES,  biom_file_name);
  }

  get_tmp_file_path(req) {
    return req.CONFIG.TMP_FILES;
  }

  print_log_if_not_vamps(req, msg, msg_prod = 'VAMPS PRODUCTION -- no print to log') {
    if (req.CONFIG.site === 'vamps') {
      console.log(msg_prod);
    } else {
      console.log(msg);
    }
  }

  get_timestamp(req) {
    let timestamp = +new Date();  // millisecs since the epoch!
    return req.user.username + '_' + timestamp;
  }
}

class sumator {
  constructor(req) {
    this.domains = ['Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown'];
    this.chosen_dids = req.session.chosen_id_order;
  }
  //  for dbrowser
//

  connect_names_with_cnts() {
    // console.time("TIME: connect_names_with_cnts");

    this.chosen_dids.map(did => {
      let curr_taxcounts_obj = this.tax_id_obj_by_did_filtered[did];
      curr_taxcounts_obj.map(curr_obj => {
        let tax_long_name = this.get_tax_long_name(curr_obj, this.taxonomy_object);

        if (tax_long_name) {
          curr_obj["tax_long_name"] = tax_long_name;
          this.tax_name_used_unique.add(tax_long_name);
        }
      });
    });
    let tax_cnt_obj_arrs = this.make_tax_name_cnt_obj_per_dataset(this.taxa_counts_module.tax_id_obj_by_did_filtered_by_rank);

    // console.timeEnd("TIME: connect_names_with_cnts");
    return tax_cnt_obj_arrs;
  }

  get_all_tax_str_array(biom_matrix) {
    return biom_matrix.rows.map(row => {
      row.id.split(';');
    });
  }

  get_all_tax_by_rank_obj(biom_matrix) {
    let arr_of_tax_by_rank_obj = [];
    for (let row_ind in biom_matrix.rows) {
      let tax_items_arr = this.get_tax_str_array(biom_matrix, row_ind);

      let tax_by_rank_obj = this.make_tax_by_rank_obj(tax_items_arr);
      arr_of_tax_by_rank_obj.push(tax_by_rank_obj);
    }
    return arr_of_tax_by_rank_obj;
  }
// TODO: JSHint: This function's cyclomatic complexity is too high. (35) (W074)
  get_sumator(req, biom_matrix){
    let sumator = {};
    let arr_of_tax_by_rank_obj = this.get_all_tax_by_rank_obj(biom_matrix);
    // for (let row_ind in biom_matrix.rows){
    //   let tax_items_arr = this.get_tax_str_array(biom_matrix, row_ind);
    //
    //   let tax_by_rank_obj = this.make_tax_by_rank_obj(tax_items_arr);
    //   arr_of_tax_by_rank_obj.push(tax_by_rank_obj);
      // Object.keys(tax_by_rank_obj).map((key) => {
      //   let curr_rank = key;
      //   let curr_taxon = tax_by_rank_obj[key];
      //   sumator[curr_rank] = curr_taxon;
      // });


      //         sumator['domain'][d]['phylum'][p]={};
      //         sumator['domain'][d]['phylum'][p]['klass'] = {};
      //         sumator['domain'][d]['phylum'][p]['knt'] = [];
      //         sumator['domain'][d]['phylum'][p]['knt'][i] = parseInt(biom_matrix.data[r][i]);

      //     const sumator = {};
      //     sumator['domain'] = {};
      // for (let t in tax_items){
      //   let taxa = tax_items[t];
      //   let rank = C.RANKS[t];
      //
      //
      //   if (rank === 'domain'){
      //     let d = taxa;
      //     for (let i in req.session.chosen_id_order){
      //       if (d in sumator['domain']){
      //         if (i in sumator['domain'][d]['knt']){
      //           sumator['domain'][d]['knt'][i] += parseInt(biom_matrix.data[r][i]);
      //         }
      //         else {
      //           sumator['domain'][d]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //         }
      //       } else {
      //         sumator['domain'][d] = {};
      //         sumator['domain'][d]['phylum'] = {};
      //         sumator['domain'][d]['knt'] = [];
      //         sumator['domain'][d]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //       }
      //     }
      //   }
      //   if (rank === 'phylum'){
      //     let p = taxa;
      //     for (let i in req.session.chosen_id_order){
      //       if (p in sumator['domain'][d]['phylum']){
      //         if (i in sumator['domain'][d]['phylum'][p]['knt']){
      //           sumator['domain'][d]['phylum'][p]['knt'][i] += parseInt(biom_matrix.data[r][i]);
      //         } else {
      //           sumator['domain'][d]['phylum'][p]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //         }
      //       } else {
      //         sumator['domain'][d]['phylum'][p]={};
      //         sumator['domain'][d]['phylum'][p]['klass'] = {};
      //         sumator['domain'][d]['phylum'][p]['knt'] = [];
      //         sumator['domain'][d]['phylum'][p]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //       }
      //     }
      //   }
      //   if (rank === 'klass'){
      //     let k = taxa;
      //     for (let i in req.session.chosen_id_order){
      //       if (k in sumator['domain'][d]['phylum'][p]['klass']){
      //         if (i in sumator['domain'][d]['phylum'][p]['klass'][k]['knt']){
      //           sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][i] += parseInt(biom_matrix.data[r][i]);
      //         } else {
      //           sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //         }
      //       } else {
      //         sumator['domain'][d]['phylum'][p]['klass'][k]={};
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order']={};
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['knt']=[];
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //       }
      //     }
      //   }
      //   if (rank === 'order'){
      //     let o = taxa;
      //     for (let i in req.session.chosen_id_order){
      //       if (o in sumator['domain'][d]['phylum'][p]['klass'][k]['order']){
      //         if (i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt']){
      //           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][i] += parseInt(biom_matrix.data[r][i]);
      //         }
      //         else {
      //           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //         }
      //       } else {
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]={};
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family']={};
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt']=[];
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //       }
      //     }
      //   }
      //   if (rank === 'family'){
      //     let f = taxa;
      //     for (let i in req.session.chosen_id_order){
      //       if (f in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family']){
      //         if (i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt']){
      //           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][i] += parseInt(biom_matrix.data[r][i]);
      //         } else {
      //           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //         }
      //       } else {
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]={};
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus']={};
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt']=[];
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //       }
      //     }
      //   }
      //   if (rank === 'genus'){
      //     let g = taxa;
      //     for (let i in req.session.chosen_id_order){
      //       if (g in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus']){
      //         if (i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt']){
      //           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][i] += parseInt(biom_matrix.data[r][i]);
      //         } else {
      //           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //         }
      //       } else {
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]={};
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species']={};
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt']=[];
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //       }
      //     }
      //   }
      //   if (rank === 'species'){
      //     let s = taxa;
      //
      //     for (let i in req.session.chosen_id_order){
      //       if (s in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species']){
      //         if (i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt']){
      //           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][i] += parseInt(biom_matrix.data[r][i]);
      //         } else {
      //           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //         }
      //       } else {
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]={};
      //
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']={};
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt']=[];
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //       }
      //     }
      //   }
      //   if (rank === 'strain'){
      //     let st = taxa;
      //     for (let i in req.session.chosen_id_order){
      //       if (st in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']){
      //         if (i in sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt']){
      //           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][i] += parseInt(biom_matrix.data[r][i]);
      //         }
      //         else {
      //           sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //         }
      //       }
      //       else {
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]={};
      //         //sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain']={};
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt']=[];
      //         sumator['domain'][d]['phylum'][p]['klass'][k]['order'][o]['family'][f]['genus'][g]['species'][s]['strain'][st]['knt'][i] = parseInt(biom_matrix.data[r][i]);
      //       }
      //     }
      //   }
      // }
    // }
    return sumator;
  }

  make_empty_summator(tax_items_arr) {

  }
    /* goal:
    sumator =
    {
     "domain":
     {
       "Archaea":
       {
         "phylum": {},
         "knt": []
        }
      }
    }
    const obj = newParamArr.reduce((obj, value, index) => {
    obj[value] = paramArr[index];
    return obj;
    }, {});
    result = Object.assign(...keys.map((k, i) => ({[k]: values[i]})))
    or the object spread syntax (ES2018):

    result = keys.reduce((o, k, i) => ({...o, [k]: values[i]}), {})
          tots = arr[0].map((col, i) => {// transpose
        return arr.map(row => row[i]) // loop over rows
          .reduce((tot, cell) => tot + cell, // sum by col
            0);
      });
    */
  // }

  make_tax_by_rank_obj(tax_items_arr) {

    let keys = C.RANKS;
    let vals = tax_items_arr;


    const tax_by_rank = keys.reduce((obj, key, index) => {
      if (vals[index]) {
        obj[key] = vals[index];
      }
      return obj;
    }, {});
    return tax_by_rank;
    /*
    {
      "domain": "Archaea",
      "phylum": "Euryarchaeota"
    }
    * */
  }

  amake_empty_summator(sumator, taxa, rank) {
    for (let d in this.domains) {
      sumator[d] = {};
    }
    let rank_no = parseInt(C.RANKS.indexOf(this.rank)) + 1;

    let this_t_rank = this.domains[rank];
    sumator[this_t_rank][taxa] = {};
    sumator[this_t_rank][taxa][rank + 1] = {};
    sumator[this_t_rank][taxa]['knt'] = [];
    return sumator;
  }
  // sumator_general();

}

module.exports = {
  viewSelectionGetData,
  viewSelectionFactory,
  visualizationFiles,
  sumator
};

