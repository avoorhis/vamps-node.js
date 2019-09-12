/*
* Call:
*
*   const biom_matrix_obj = new biom_matrix_controller.BiomMatrix(req, visual_post_items, write_file);
    let new_matrix = biom_matrix_obj.biom_matrix;
* */

const COMMON = require(app_root + '/routes/visuals/routes_common');
const C      = require(app_root + '/public/constants');
const path   = require("path");
const extend = require('util')._extend;

let helpers = require(app_root + '/routes/helpers/helpers');

class BiomMatrix {

  constructor(req, visual_post_items, write_file) {
    this.req               = req;
    this.visual_post_items = visual_post_items;
    this.write_file = write_file;
    this.units             = this.visual_post_items.unit_choice;
    this.chosen_datasets   = this.visual_post_items.chosen_datasets; /* post_items.chosen_datasets["0"] = {
  "did": 475152,
  "name": "SLM_NIR2_Bv4--Aligator_Pool01"
}*/
    // console.time('TIME: chosen_dids');
    this.chosen_dids           = this.get_dids();
    // console.timeEnd('TIME: chosen_dids');

    // console.time('TIME: get_taxa_counts');
    this.taxa_counts            = new module.exports.TaxaCounts(this.req, this.visual_post_items, this.chosen_dids);
    // console.timeEnd('TIME: get_taxa_counts');

    // console.time('TIME: get_lookups');
    const taxonomy_factory = new module.exports.TaxonomyFactory(this.visual_post_items, this.taxa_counts, this.chosen_dids);
    this.taxonomy_lookup_module = taxonomy_factory.chosen_taxonomy;
    this.unit_name_counts = this.taxonomy_lookup_module.tax_cnt_obj_arrs;
    // console.timeEnd('TIME: get_lookups');

    // console.time('TIME: ukeys');
    // console.time("time: remove_empty_rows");
    let ukeys = this.remove_empty_rows();
    // console.timeEnd("time: remove_empty_rows");

    this.ukeys = ukeys.filter(helpers.onlyUnique);
    this.ukeys.sort();
    // console.timeEnd('TIME: ukeys');

    // console.time('TIME: create_biom_matrix');
    this.rows = {}; /*[
    {
      "id": "Bacteria;Bacteroidetes",
      "metadata": null
    },*/
    this.columns = this.get_columns(); /*    {
      "did": 475152,
      "id": "SLM_NIR2_Bv4--Aligator_Pool01",
      "metadata": null
    },*/

    this.ordered_list_of_lists_of_tax_counts = [];
    let date = new Date();
    this.biom_matrix = {
      id: this.visual_post_items.ts,
      format: "Biological Observation Matrix 0.9.1-dev",
      format_url:"http://biom-format.org/documentation/format_versions/biom-1.0.html",
      type: "OTU table",
      units: this.units,
      generated_by:"VAMPS-NodeJS Version 2.0",
      date: date.toISOString(),
      rows: [],												// taxonomy (or OTUs, MED nodes) names
      columns: this.columns,					// ORDERED dataset names
      column_totals: [],							// ORDERED datasets count sums
      max_dataset_count: 0,						// maximum dataset count
      matrix_type: 'dense',
      matrix_element_type: 'int',
      shape: [],									// [row_count, col_count]
      data: this.ordered_list_of_lists_of_tax_counts
    };

    this.biom_matrix = this.create_biom_matrix();
    // console.timeEnd('TIME: create_biom_matrix');
    console.log("GGG0 this.visual_post_items");
    console.log(this.visual_post_items);

    let true_meaning = [true, 1, "1"];
    if (this.visual_post_items.update_data in true_meaning) {
      this.biom_matrix = this.get_updated_biom_matrix(); // this.visual_post_items, this.biom_matrix
    }

    // console.time('TIME: write_matrix_files');
    if (this.write_file === true || this.write_file === undefined) {//TODO: refactor
      let write_matrix_file_mod = new module.exports.WriteMatrixFile(this.visual_post_items, this.biom_matrix);
      write_matrix_file_mod.write_matrix_files();
    }
    // console.timeEnd('TIME: write_matrix_files');
  }

  get_columns() {
    // console.time("TIME: get_columns");
    let columns = [];
    for (let idx = 0, arr_len = this.chosen_datasets.length; idx < arr_len; idx++){

      let temp_col_obj = {};
      temp_col_obj.did = this.chosen_datasets[idx]["did"];
      temp_col_obj.id  = this.chosen_datasets[idx]["name"];
      temp_col_obj.metadata = null;
      columns.push(temp_col_obj);
    }
    // console.timeEnd("TIME: get_columns");
    return columns;
  }

  get_dids() {
    return this.chosen_datasets.map(value => value.did);
  }

  remove_empty_rows() {
    const cnts_obj = this.unit_name_counts;
    return Object.keys(cnts_obj)
      .filter(taxname =>
        (cnts_obj[taxname].filter(Number).length) > 0);
  }

  check_what_to_update() {
    // normalization, percent, domains, Taxonomic Depth, include NAs
    let adjust = {
    adjust_for_normalization: false,
    adjust_for_percent_limit_change: true
  };

     if (typeof this.visual_post_items.normalization !== "undefined" && this.visual_post_items.normalization !== "none") {
       adjust.adjust_for_normalization = true;
     }

    let min_percent = parseInt(this.visual_post_items.min_range) === 0;
    let max_percent = parseInt(this.visual_post_items.max_range) === 100;
    if (min_percent && max_percent) {
      adjust.adjust_for_percent_limit_change = false;
    }

  return adjust;
  }

  get_updated_biom_matrix() {
    console.log('in UPDATED biom_matrix');
    console.log("GGG1 this.visual_post_items");
    console.log(this.visual_post_items);
    // console.time("TIME: get_updated_biom_matrix");
    let custom_count_matrix = extend({}, this.biom_matrix);  // this clones count_matrix which keeps original intact.

    let adjust = this.check_what_to_update();
    if (adjust.adjust_for_normalization) {
      custom_count_matrix = this.adjust_for_normalization(custom_count_matrix);
    }
    if (adjust.adjust_for_percent_limit_change) {
      custom_count_matrix = this.adjust_for_percent_limit_change(custom_count_matrix);
    }
    custom_count_matrix.column_totals = this.re_calculate_totals(custom_count_matrix);
    custom_count_matrix.shape = [ custom_count_matrix.rows.length, custom_count_matrix.columns.length ];

    // console.timeEnd("TIME: get_updated_biom_matrix");
    return custom_count_matrix;
  }

  get_crt_pct(custom_count_matrix, cell, idx2) {
    let curr_col_total = custom_count_matrix.column_totals[idx2];
    let curr_cell_pct = cell * 100 / curr_col_total;
    return curr_cell_pct;
  }

  check_if_in_interval(custom_count_matrix, row, min, max){
    return row.find((cell, idx2) => {
      let curr_cell_pct = this.get_crt_pct(custom_count_matrix, cell, idx2);
      return curr_cell_pct > min && curr_cell_pct < max;
    });
  }

  adjust_for_percent_limit_change(custom_count_matrix) {
    // console.time("TIME: adjust_for_percent_limit_change");
    let min_percent = this.visual_post_items.min_range;
    let max_percent = this.visual_post_items.max_range;
    // let min = 0;
    // let max = 0;
    let new_counts = [];
    let new_units = [];
    let cnt_matrix = custom_count_matrix.data;

    cnt_matrix.map((row, idx1) => {
      let got_one = this.check_if_in_interval(custom_count_matrix, row, min_percent, max_percent);

      if (got_one){
        new_counts.push(cnt_matrix[idx1]);
        new_units.push(custom_count_matrix.rows[idx1]);
      }
      else {
        console.log('rejecting ' + custom_count_matrix.rows[idx1].id);
      }
    });
    custom_count_matrix.data = new_counts;
    custom_count_matrix.rows = new_units;
    // console.timeEnd("TIME: adjust_for_percent_limit_change");

    return custom_count_matrix;
  }

  adjust_for_normalization(custom_count_matrix) {
    let norm = this.visual_post_items.normalization;
    if (norm === 'maximum'|| norm === 'max') {
      custom_count_matrix.data = this.calculating_norm(custom_count_matrix, this.calculating_norm_max.bind(this));
    }
    else if (norm === 'frequency' || norm === 'freq') {
      custom_count_matrix.data = this.calculating_norm(custom_count_matrix, this.calculating_norm_freq);
    }
    else{
      // nothing here
      console.log('no-calculating norm NORM');
    }
    return custom_count_matrix;
  }

  calculating_norm(custom_count_matrix, normalization_kind_func) {
    console.log('calculating norm MAX');
    // console.time("TIME: calculating_norm");

    let arr = custom_count_matrix.data;
    let new_counts = [];

    for (let i = 0, arr_len = arr.length; i < arr_len; i++){
      let interim_arr = [];
      for (let j = 0, arr1_len = arr[i].length; j < arr1_len; j++) {
        let cell = custom_count_matrix.data[i][j];
        let col_total = custom_count_matrix.column_totals[j];
        let norm = cell / col_total;
        interim_arr[j] = normalization_kind_func(norm);
      }
      new_counts.push(interim_arr);
    }
    // console.timeEnd("TIME: calculating_norm");

    return new_counts;
  }

  calculating_norm_freq(norm_cnt) {
    const fractionDigits = 6;
    return parseFloat( norm_cnt.toFixed(fractionDigits) ) || 0;
  }

  calculating_norm_max(norm_cnt) {
    let max_cnt = this.biom_matrix.max_dataset_count;
    let normalized_cnt = norm_cnt * max_cnt;
    let radix = 10;
    return parseInt(normalized_cnt, radix) || 0;
  }

  re_calculate_totals(custom_count_matrix) {
    // console.time("TIME: re_calculate_totals");
    let arr = custom_count_matrix.data;
    let tots = [];
    try {
      tots = arr[0].map((col, i) => {// transpose
        return arr.map(row => row[i]) // loop over rows
          .reduce((tot, cell) => tot + cell, // sum by col
            0);
      });
    }
    catch (e) {
      console.log(e);
      console.log("Empty lines in the matrix, probably too many domains were deselected.");
    }

    // console.timeEnd("TIME: re_calculate_totals");
    return tots;
  }

  create_biom_matrix() {
    console.log('in create_this.biom_matrix');  // uname:
    // console.time('TIME: create_this.biom_matrix');

    // this.ukeys is sorted by alpha
    for (let uk_idx in this.ukeys) {
      let curr_tax_name = this.ukeys[uk_idx];
      this.biom_matrix.rows.push({ id: curr_tax_name, metadata: null });

      this.biom_matrix.data.push(this.unit_name_counts[curr_tax_name]);// adds counts
    }

    this.biom_matrix.shape = [this.biom_matrix.rows.length, this.biom_matrix.columns.length];

    let max = 0;
    if (this.ukeys) {
      max = this.get_max();
    }
    this.biom_matrix.max_dataset_count = max;
    // console.timeEnd('TIME: create_this.biom_matrix');
    return this.biom_matrix;
  }

  get_values(obj) {
    return Object.keys(obj).map(key => obj[key]);
  }

  get_max(){
    // console.time("time: get_max");
    let total_count_per_d = this.get_total_count_per_d();

    this.biom_matrix.column_totals = this.get_values(total_count_per_d);

    let max = Math.max(...this.biom_matrix.column_totals);
    // console.timeEnd("time: get_max");
    return max;
  }

  get_total_count_per_d(){
    // console.time("time: get_total_count_per_d");
    let total_count = {};
    let columns = this.biom_matrix.columns;

    columns.map((c, c_idx) => {
      let dname = c.id;
      total_count[dname] = 0;
      this.biom_matrix.data.map((d, d_idx) => {
        total_count[dname] += this.biom_matrix.data[d_idx][c_idx];
      });
    });

    // console.timeEnd("time: get_total_count_per_d");

    return total_count;
  }
}

class TaxaCounts {

  constructor(req, post_items, chosen_dids) { //change this. to let if use only inside
    this.req                  = req;
    this.post_items           = post_items;
    this.chosen_dids          = chosen_dids;
    this.units                = this.post_items.unit_choice;
    this.taxonomy_file_prefix = this.get_taxonomy_file_prefix();
    this.rank                 = this.post_items.tax_depth;

    this.taxonomy_object           = this.get_taxonomy_object();
    this.curr_taxcounts_obj_of_str_by_did = this.get_taxcounts_obj_from_file();
    this.curr_taxcounts_obj_w_arr_by_did  = this.make_curr_taxcounts_obj_w_arr_by_did(); /*{   "475002": {     "_3": 37486,     "_1": 6,*/

    this.tax_id_obj_by_did_filtered_by_rank = this.make_tax_id_obj_by_did_filtered_by_rank();
  }

  get_taxonomy_file_prefix() {
    let taxonomy_name = NODE_DATABASE;
    if (this.units === 'tax_rdp2.6_simple'){
      taxonomy_name += "--datasets_rdp2.6";
    } else if (this.units === 'tax_generic_simple'){
      taxonomy_name += "--datasets_generic";
    } else {
      taxonomy_name += "--datasets_" + C.default_taxonomy.name;  // default
    }
    let files_prefix = path.join(this.req.CONFIG.JSON_FILES_BASE, taxonomy_name);
    return files_prefix; // /Users/ashipunova/BPC/vamps-node.js/public/json/vamps2--datasets_silva119
  }

  get_taxonomy_object() {
    let taxonomy_object;
    if (this.units === 'tax_rdp2.6_simple') {
      taxonomy_object = new_rdp_taxonomy;
    } else if (this.units === 'tax_generic_simple') {
      taxonomy_object = new_generic_taxonomy;
    } else {
      taxonomy_object = new_taxonomy;
    }
    return taxonomy_object;
  }

  get_taxcounts_obj_from_file() {
    // console.time("time: get_taxcounts_obj_from_file");

    let taxcounts_obj_for_all_datasets = {};
    this.chosen_dids.map(did => {
      try {
        let path_to_file                    = path.join(this.taxonomy_file_prefix, did + '.json');
        let jsonfile                        = require(path_to_file);
        taxcounts_obj_for_all_datasets[did] = jsonfile['taxcounts'];
      } catch (err) {
        console.log('2-no file ' + err.toString() + ' Exiting');
        console.log('this.taxonomy_file_prefix = ' + this.taxonomy_file_prefix);
        console.log('did = ' + did);
        taxcounts_obj_for_all_datasets[did] = [];
      }
      return taxcounts_obj_for_all_datasets;
    });

    // console.timeEnd("time: get_taxcounts_obj_from_file");

    return taxcounts_obj_for_all_datasets;
  }

  make_curr_taxcounts_obj_w_arr_by_did() {
    // for each did get keys
    // keys "_1_2" to array [1,2]
    // add previous info
    // console.time("time: make_curr_taxcounts_obj_w_arr_by_did");

    let tax_id_obj_of_arr_by_did = {};

    for (let d_idx in this.chosen_dids) {
      if (this.chosen_dids.hasOwnProperty(d_idx)) {
        let did                       = this.chosen_dids[d_idx];
        tax_id_obj_of_arr_by_did[did] = [];
        let curr_obj                  = this.curr_taxcounts_obj_of_str_by_did[did];
        for (const [current_tax_id_row, current_cnt] of Object.entries(curr_obj)) {
          let temp_obj                 = {};
          let current_tax_id_arr_clean = this.split_taxcounts_to_arr(current_tax_id_row);
          temp_obj["tax_id_row"]       = current_tax_id_row;
          temp_obj["cnt"]              = current_cnt;
          temp_obj["tax_id_arr"]       = current_tax_id_arr_clean;
          tax_id_obj_of_arr_by_did[did].push(temp_obj);
        }
      }
    }
    // console.timeEnd("time: make_curr_taxcounts_obj_w_arr_by_did");

    return tax_id_obj_of_arr_by_did;
  }

  split_taxcounts_to_arr(current_tax_id_row) {
    let current_tax_id_arr = current_tax_id_row.split("_");
    let current_tax_id_arr_numbers_only = current_tax_id_arr.filter(Number);
    return current_tax_id_arr_numbers_only;
  }

  make_tax_id_obj_by_did_filtered_by_rank() {
    // console.time("TIME: make_tax_id_obj_by_did_filtered_by_rank");
    let tax_id_obj_by_did_filtered_by_rank = {};

    for (let d_idx in this.chosen_dids) {
      if (this.chosen_dids.hasOwnProperty(d_idx)) {
        let did                                 = this.chosen_dids[d_idx];
        let current_tax_id_rows                 = this.curr_taxcounts_obj_w_arr_by_did[did].filter(this.filter_tax_id_rows_by_rank.bind(this));
        tax_id_obj_by_did_filtered_by_rank[did] = current_tax_id_rows;
      }
    }
    // console.timeEnd("TIME: make_tax_id_obj_by_did_filtered_by_rank");
    return tax_id_obj_by_did_filtered_by_rank;
  }

  filter_tax_id_rows_by_rank(el) {
    let rank_no = parseInt(C.RANKS.indexOf(this.rank)) + 1;
    return el.tax_id_arr.length === rank_no;
  }
}

class TaxonomyFactory {
  constructor(visual_post_items, taxa_counts, chosen_dids) {
    this.units       = visual_post_items.unit_choice;
    this.taxa_counts_module = taxa_counts;
    this.chosen_dids = chosen_dids;
    this.chosen_taxonomy = this.choose_simple_or_custom_lookup_module(visual_post_items, this.taxa_counts_module, this.chosen_dids);
  }

  choose_simple_or_custom_lookup_module(visual_post_items, taxa_counts_module, chosen_dids) {
    let unit_choice_simple = (this.units.substr(this.units.length - 6) === 'simple');
    let unit_choice_custom = (this.units === 'tax_' + C.default_taxonomy.name + '_custom');
    //TODO: args object send to whatever module is chosen
    if (unit_choice_simple) {
      return new module.exports.TaxonomySimple(visual_post_items, taxa_counts_module, chosen_dids);
    }
    else if (unit_choice_custom) {
      return new module.exports.TaxonomyCustom(visual_post_items, taxa_counts_module, chosen_dids);
    }
    else {
      console.log("ERROR: Can't choose simple or custom taxonomy");
    }
  }

}

class Taxonomy {
  constructor(visual_post_items, taxa_counts, chosen_dids) {
    this.chosen_dids                = chosen_dids;
    this.post_items                 = visual_post_items;
    this.taxa_counts_module         = taxa_counts;
    this.taxonomy_object            = this.taxa_counts_module.taxonomy_object;
    this.id_rank_taxa_cash          = {};
    this.tax_name_used_unique       = new Set();
    this.tax_id_obj_by_did_filtered = this.taxa_counts_module.tax_id_obj_by_did_filtered_by_rank;
    this.tax_cnt_obj_arrs           = this.connect_names_with_cnts();
  }

  make_empty_tax_cnt_obj() {
    // console.time("TIME: make_empty_tax_cnt_obj");
    let tax_cnt_obj_arrs_empty = {};
    let dids_len = this.chosen_dids.length;

    for (let name of this.tax_name_used_unique) {
      tax_cnt_obj_arrs_empty[name] = Array(dids_len).fill(0);
    }

    // console.timeEnd("TIME: make_empty_tax_cnt_obj");
    return tax_cnt_obj_arrs_empty;
  }

  make_tax_name_cnt_obj_per_dataset(tax_id_obj_by_did_filtered) {
    // console.time("TIME: make_tax_name_cnt_obj_per_dataset_map");
    let tax_cnt_obj_arrs = this.make_empty_tax_cnt_obj();

    this.chosen_dids.map((did, d_idx) => {
     const curr_tax_info_obj = tax_id_obj_by_did_filtered[did];
     curr_tax_info_obj.map(ob => {
       // tax_cnt_obj_arrs[ob.tax_long_name][d_idx] = ob.cnt;
       if (ob.tax_long_name) {
         tax_cnt_obj_arrs[ob.tax_long_name][d_idx] = ob.cnt;
       }
       else {
         console.log('Skipping Empty ob.tax_long_name index:' + d_idx + ' with count:' + String(ob.cnt));
       }
     });
    });

    // console.timeEnd("TIME: make_tax_name_cnt_obj_per_dataset_map");
    return tax_cnt_obj_arrs;
  }
}

class TaxonomySimple extends Taxonomy {

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

  get_tax_long_name(curr_obj) {
    let ids = curr_obj.tax_id_arr;
    let tax_long_name = '';
    let tax_long_name_arr = [];

    for (let id_idx = 0, len = ids.length; id_idx < len; id_idx++) {
      let db_id = ids[id_idx];

      let current_rank = C.RANKS[id_idx];
      let one_taxon_name = this.get_one_taxon_name(db_id, current_rank);
      tax_long_name_arr.push(one_taxon_name);
    }
    tax_long_name_arr = this.screen_domains(tax_long_name_arr);

    if (tax_long_name_arr.length) {
      tax_long_name = this.combine_long_name(tax_long_name_arr);

      return tax_long_name;
    }
  }

  get_one_taxon_name(db_id, rank) {
    // console.time("time: get_one_taxon_name");

    let one_taxon_name = "";
    let db_id_n_rank = db_id + '_' + rank;

    if (this.id_rank_taxa_cash.hasOwnProperty(db_id_n_rank)) {
      one_taxon_name = this.id_rank_taxa_cash[db_id_n_rank];
    }
    else {
      let tax_node = this.get_tax_node(db_id_n_rank, this.taxonomy_object);
      if (tax_node.taxon) {
        one_taxon_name = tax_node.taxon;
      } else { //TODO: check for empty_... and combine with _NA?
        let rank_name  = this.check_rank_name(rank);
        one_taxon_name = rank_name + '_NA';
      }
      this.id_rank_taxa_cash[db_id_n_rank] = one_taxon_name;
    }
    // console.timeEnd("time: get_one_taxon_name");

    return one_taxon_name;
  }

  check_domain_is_selected(tax_long_name_arr) {
    let domain_is_selected = this.post_items.domains.includes(tax_long_name_arr[0]);
    if (!domain_is_selected) {
      console.log('Excluding', tax_long_name_arr);
      tax_long_name_arr = [];
    }
    return tax_long_name_arr;
  }

  check_organel_and_chloropl(tax_long_name_arr) {
    let organelle_has_been_de_selected = this.post_items.domains.indexOf('Organelle') === -1;
    if (organelle_has_been_de_selected) {
      let has_chloroplast = tax_long_name_arr.includes('Chloroplast');
      let has_bacteria = tax_long_name_arr[0] === 'Bacteria';
      if (has_bacteria && has_chloroplast) {
        console.log('Excluding', tax_long_name_arr);
        tax_long_name_arr = [];
      }
    }
    return tax_long_name_arr;
  }

  screen_domains(tax_long_name_arr) {
    tax_long_name_arr = this.check_organel_and_chloropl(tax_long_name_arr);
    tax_long_name_arr = this.check_domain_is_selected(tax_long_name_arr);
    return tax_long_name_arr;
  }

  combine_long_name(tax_long_name_arr) {
    return tax_long_name_arr.join(";");
  }

  get_tax_node(db_id_n_rank, taxonomy_object) {
    let tax_node = {};
    if (db_id_n_rank in taxonomy_object.taxa_tree_dict_map_by_db_id_n_rank) {
      tax_node = taxonomy_object.taxa_tree_dict_map_by_db_id_n_rank[db_id_n_rank];
    }
    return tax_node;
  }

  check_rank_name(this_rank) {
    // console.time("time: check_rank_name");

    let rank_name = this_rank;
    // const wrong_class_names = ["klass" ]; //TODO: add empty_
    if (this_rank === "klass") {
      rank_name = 'class';
    }
    // console.timeEnd("time: check_rank_name");

    return rank_name;
  }
}

class TaxonomyCustom extends Taxonomy {
  connect_names_with_cnts() {
    // console.time('TIME: make_tax_name_cnt_obj_per_did_custom_map');
    // ie custom_taxa: [ '1', '60', '61', '1184', '2120', '2261' ]  these are node_id(s)

    this.chosen_dids.map(did => {
      this.tax_id_obj_by_did_filtered[did] = [];

      this.post_items["custom_taxa"].map(selected_node_id => {
        if (this.taxonomy_object.taxa_tree_dict_map_by_id.hasOwnProperty(selected_node_id)) {
          let temp_obj = {};
          let combined_ids_res = this.combine_db_tax_id_list(selected_node_id);
          let id_chain = combined_ids_res[0];
          let custom_tax_long_name = combined_ids_res[1];
          temp_obj["tax_long_name"] = custom_tax_long_name;
          temp_obj["tax_id_row"] = id_chain;
          temp_obj["cnt"] = this.get_tax_cnt(id_chain, did) || 0;

          this.tax_name_used_unique.add(custom_tax_long_name);
          this.tax_id_obj_by_did_filtered[did].push(temp_obj);
        }
      });
    });
    // TODO: Why is it called from here?
    let tax_cnt_obj_arrs = this.make_tax_name_cnt_obj_per_dataset(this.tax_id_obj_by_did_filtered);
    // console.timeEnd('TIME: make_tax_name_cnt_obj_per_did_custom_map');

    return tax_cnt_obj_arrs;

  }

  initialize_custom_tax_node(selected_node_id) {
    let tax_node = this.taxonomy_object.taxa_tree_dict_map_by_id[selected_node_id];
    let new_node_id = tax_node.parent_id;
    let id_chain = '_' + tax_node.db_id;  // add _ to beginning
    let tax_long_name = tax_node.taxon;
    return [new_node_id, id_chain, tax_long_name];
  }

  combine_db_tax_id_list(selected_node_id) {// TODO: refactor
    // console.time('TIME: combine_db_tax_id_list');
    // let tax_node = this.taxonomy_object.taxa_tree_dict_map_by_id[selected_node_id];
    // let new_node_id = tax_node.parent_id;
    // let id_chain = '_' + tax_node.db_id;  // add _ to beginning
    // let tax_long_name = tax_node.taxon;
    let [new_node_id, id_chain, tax_long_name] = this.initialize_custom_tax_node(selected_node_id);

    let new_node;
    let db_id;
    while (new_node_id !== 0) {
      new_node      = this.taxonomy_object.taxa_tree_dict_map_by_id[new_node_id];
      db_id         = new_node.db_id;
      id_chain 			= '_' + db_id + id_chain;
      new_node_id   = new_node.parent_id;
      tax_long_name = new_node.taxon + ';' + tax_long_name;
    }
    // console.timeEnd('TIME: combine_db_tax_id_list');

    return [id_chain, tax_long_name];
  }

  get_tax_cnt(id_chain, did) {
    // console.time('TIME: get_tax_cnt');
    const taxcounts = this.taxa_counts_module.curr_taxcounts_obj_of_str_by_did[did];
    let curr_tax_id_chain = id_chain;
    let temp_cnt = 0;
    try {
      temp_cnt = taxcounts[curr_tax_id_chain];
    }
    catch (err) {}
    // console.timeEnd('TIME: get_tax_cnt');
    return temp_cnt;
  }
}

class WriteMatrixFile {

  constructor(post_items, biom_matrix) {
    this.post_items = post_items;
    this.biom_matrix = biom_matrix;
    this.tmp_path = app_root + '/tmp/';
  }

  write_matrix_files() {
    let common_file_name_part = this.tmp_path + this.post_items.ts;
    let tax_file_name = common_file_name_part + '_taxonomy.txt';
    COMMON.output_tax_file(tax_file_name, this.biom_matrix, C.RANKS.indexOf(this.post_items.tax_depth));

    let matrix_file_name = common_file_name_part + '_count_matrix.biom';
    COMMON.write_file(matrix_file_name, JSON.stringify(this.biom_matrix,null,2) );
  }
}

module.exports = {
  BiomMatrix: BiomMatrix,
  TaxaCounts: TaxaCounts,
  Taxonomy: Taxonomy,
  TaxonomyFactory: TaxonomyFactory,
  TaxonomySimple: TaxonomySimple,
  TaxonomyCustom: TaxonomyCustom,
  WriteMatrixFile: WriteMatrixFile
};