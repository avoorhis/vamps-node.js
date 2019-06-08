const COMMON = require(app_root + '/routes/visuals/routes_common');
const C      = require(app_root + '/public/constants');
let path     = require("path");
var extend = require('util')._extend;

// let helpers = require(app_root + '/routes/helpers/helpers');

class BiomMatrix {

  constructor(req, visual_post_items) {
    this.req               = req;
    this.visual_post_items = visual_post_items;
    this.units             = this.visual_post_items.unit_choice;
    this.chosen_datasets   = this.visual_post_items.chosen_datasets; /* post_items.chosen_datasets["0"] = {
  "did": 475152,
  "name": "SLM_NIR2_Bv4--Aligator_Pool01"
}*/
    this.chosen_dids           = this.get_dids();
    this.taxa_counts            = new module.exports.TaxaCounts(this.req, this.visual_post_items, this.chosen_dids);

    const taxonomy_factory = new module.exports.TaxonomyFactory(this.visual_post_items, this.taxa_counts, this.chosen_dids);
    this.taxonomy_lookup_module = taxonomy_factory.chosen_taxonomy;
    this.taxonomy_lookup_module.make_tax_name_cnt_obj_per_did();
    const tax_names                    = this.taxonomy_lookup_module.tax_name_cnt_obj_1;
    const tax_name_cnt_obj_per_dataset = this.taxonomy_lookup_module.tax_name_cnt_obj_per_dataset;

    this.unit_name_counts = this.taxa_counts.create_unit_name_counts(tax_names, tax_name_cnt_obj_per_dataset);
    let ukeys = this.remove_empty_rows(); //TODO: refactor
    this.ukeys = ukeys.filter(this.onlyUnique);
    this.ukeys.sort();

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

    let true_meaning = [true, 1, "1"];
    if (this.visual_post_items.update_data in true_meaning) {
      this.biom_matrix = this.get_updated_biom_matrix(); // this.visual_post_items, this.biom_matrix
    }

    let write_matrix_file_mod = new module.exports.WriteMatrixFile(this.visual_post_items, this.biom_matrix);
    write_matrix_file_mod.write_matrix_files();
  }

  get_columns() {
    console.time("get_columns");
    let columns = [];
    for (let idx in this.chosen_datasets) {//TODO: change
      let temp_col_obj = {};
      temp_col_obj.did = this.chosen_datasets[idx]["did"];
      temp_col_obj.id  = this.chosen_datasets[idx]["name"];
      temp_col_obj.metadata = null;
      columns.push(temp_col_obj);
    }
    console.timeEnd("get_columns");
    return columns;
  }

  get_dids() {
    let dids = this.chosen_datasets.map(function (value) { return value.did; });
    return dids;
  }

  remove_empty_rows() {
    var tmparr = [];
    for (var taxname in this.unit_name_counts) {//TODO: change
      let sum = 0;
      for (let c in this.unit_name_counts[taxname]){//TODO: change
        let curr_cnts = this.unit_name_counts[taxname][c];
        let it_is_number = !Number.isNaN(curr_cnts);
        if (it_is_number) {
          sum += this.unit_name_counts[taxname][c];
        }
      }
      if (sum > 0) {
        tmparr.push(taxname);
      }
    }
    return tmparr;
  }

  get_updated_biom_matrix(post_items, mtx) {//TODO: refactor
    console.log('in UPDATED biom_matrix');
    var custom_count_matrix = extend({},mtx);  // this clones count_matrix which keeps original intact.

    var max_cnt = mtx.max_dataset_count,
        min     = post_items.min_range,
        max     = post_items.max_range,
        norm    = post_items.normalization;

    // Adjust for percent limit change
    var new_counts = [];
    var new_units = [];
    for (var c in custom_count_matrix.data) {//TODO: change

      var got_one = false;
      for (var k in custom_count_matrix.data[c]) {//TODO: change
        var thispct = (custom_count_matrix.data[c][k]*100)/custom_count_matrix.column_totals[k];
        if(thispct > min && thispct < max){
          got_one = true;
        }
      }

      if(got_one){
        new_counts.push(custom_count_matrix.data[c]);
        new_units.push(custom_count_matrix.rows[c]);
      }else{
        console.log('rejecting '+custom_count_matrix.rows[c].name);
      }
    }
    custom_count_matrix.data = new_counts;
    custom_count_matrix.rows = new_units;


    // Adjust for normalization
    var tmp1 = [];
    if (norm === 'maximum'|| norm === 'max') {
      console.log('calculating norm MAX');
      for (var cc in custom_count_matrix.data) {//TODO: change
        new_counts = [];
        for (var kc in custom_count_matrix.data[cc]) {//TODO: change
          new_counts.push(parseInt( ( custom_count_matrix.data[cc][kc] * max_cnt ) / custom_count_matrix.column_totals[kc], 10) );

        }
        tmp1.push(new_counts);
      }
      custom_count_matrix.data = tmp1;
    }else if(norm === 'frequency' || norm === 'freq'){
      console.log('calculating norm FREQ');
      for (var cc1 in custom_count_matrix.data) {//TODO: change
        new_counts = [];
        for (var kc1 in custom_count_matrix.data[cc1]) {//TODO: change
          new_counts.push(parseFloat( (custom_count_matrix.data[cc1][kc1] / custom_count_matrix.column_totals[kc1]).toFixed(6) ) );
        }
        tmp1.push(new_counts);
      }
      custom_count_matrix.data = tmp1;
    }else{
      // nothing here
      console.log('no-calculating norm NORM');
    }

    // re-calculate totals
    var tots = [];
    // TODO: "'tmp' is already defined."
    var tmp2 = {};
    for (var cc2 in custom_count_matrix.data) {//TODO: change
      for (var kc2 in custom_count_matrix.data[cc2]) {//TODO: change
        if(kc2 in tmp2){
          tmp2[kc2] += custom_count_matrix.data[cc2][kc2];
        }else{
          tmp2[kc2] = custom_count_matrix.data[cc2][kc2];
        }
      }
    }
    for (var kc3 in custom_count_matrix.columns){//TODO: change
      tots.push(tmp2[kc3]);
    }
    custom_count_matrix.column_totals = tots;
    custom_count_matrix.shape = [ custom_count_matrix.rows.length, custom_count_matrix.columns.length ];

    //console.log('returning custom_count_matrix');
    return custom_count_matrix;
  }

  create_biom_matrix() {//TODO: refactor
    console.log('in create_this.biom_matrix');  // uname:

    // this.ukeys is sorted by alpha
    for (var uk_idx in this.ukeys) {//TODO: change for
      let curr_tax_name = this.ukeys[uk_idx];
      this.biom_matrix.rows.push({ id: curr_tax_name, metadata: null });//TODO make rows func

      this.biom_matrix.data.push(this.unit_name_counts[curr_tax_name]);// adds counts
    }

    this.biom_matrix.shape = [this.biom_matrix.rows.length, this.biom_matrix.columns.length];

    let max = 0;

    if (this.ukeys) {
      max = this.get_max(max);
    }
    //console.log('in create_this.biom_matrix1');
    this.biom_matrix.max_dataset_count = max;
    // console.log('in create_this.biom_matrix2');
    return this.biom_matrix;
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  get_max(max){
    let max_count = this.get_max_count_per_did();

    for (let idx in this.visual_post_items.chosen_datasets) {// correct order //TODO: change for
      let dname = this.visual_post_items.chosen_datasets[idx].name;
      this.biom_matrix.column_totals.push(max_count[dname]);
      if(max_count[dname] > max){
        max = max_count[dname];
      }
    }
    return max;
  }

  get_max_count_per_did(){
    let max_count = {};
    let columns = this.biom_matrix.columns;

    for (let c_idx in columns) {//TODO: change
      let dname = columns[c_idx].id;
      max_count[dname] = 0;
      for (let d_idx in this.biom_matrix.data) {//TODO: change
        max_count[dname] += this.biom_matrix.data[d_idx][c_idx];
      }
    }
    return max_count;
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

    this.tax_id_obj_by_did_filtered_by_rank = this.make_tax_id_obj_by_did_filtered_by_rank(); //TODO: only for simple?
  }

  get_taxonomy_file_prefix() {
    let files_prefix = "";
    let taxonomy_name = NODE_DATABASE;
    if (this.units === 'tax_rdp2.6_simple'){
      taxonomy_name += "--datasets_rdp2.6";
    } else if (this.units === 'tax_generic_simple'){
      taxonomy_name += "--datasets_generic";
    } else {
      taxonomy_name += "--datasets_" + C.default_taxonomy.name;  // default
    }
    files_prefix = path.join(this.req.CONFIG.JSON_FILES_BASE, taxonomy_name);
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
    let taxcounts_obj_for_all_datasets = {};
    for (let d_idx in this.chosen_dids) {//TODO: change
      let did = this.chosen_dids[d_idx];
      try {
        let path_to_file               = path.join(this.taxonomy_file_prefix, did + '.json');
        let jsonfile                   = require(path_to_file);
        taxcounts_obj_for_all_datasets[did] = jsonfile['taxcounts'];
      } catch (err) {
        console.log('2-no file ' + err.toString() + ' Exiting');
        console.log('this.taxonomy_file_prefix = ' + this.taxonomy_file_prefix);
        console.log('did = ' + did);
        taxcounts_obj_for_all_datasets[did] = [];
      }
    }
    return taxcounts_obj_for_all_datasets;
  }

  make_curr_taxcounts_obj_w_arr_by_did() {
    // for each did get keys
    // keys "_1_2" to array [1,2]
    // add previous info
    let tax_id_obj_of_arr_by_did = {};

    for (let d_idx in this.chosen_dids) {//TODO: change
      let did = this.chosen_dids[d_idx];
      tax_id_obj_of_arr_by_did[did] = [];
      let curr_obj = this.curr_taxcounts_obj_of_str_by_did[did];
      for (const [current_tax_id_row, current_cnt] of Object.entries(curr_obj)) {
        let temp_obj = {};
        let current_tax_id_arr_clean = this.split_taxcounts_to_arr(current_tax_id_row);
        temp_obj["tax_id_row"] = current_tax_id_row;
        temp_obj["cnt"] = current_cnt;
        temp_obj["tax_id_arr"] = current_tax_id_arr_clean;
        tax_id_obj_of_arr_by_did[did].push(temp_obj);
      }
    }
    return tax_id_obj_of_arr_by_did;
  }

  split_taxcounts_to_arr(current_tax_id_row) {
    let current_tax_id_arr = current_tax_id_row.split("_");
    let current_tax_id_arr_clean =  current_tax_id_arr.filter(function (el) { return (el) });
    return current_tax_id_arr_clean;
  }

  make_tax_id_obj_by_did_filtered_by_rank() { //check if it is faster to make arrays from all tax_id_rows first
    console.time("TIME: make_tax_id_obj_by_did_filtered_by_rank");
    let tax_id_obj_by_did_filtered_by_rank = {};

    for (let d_idx in this.chosen_dids) {//TODO: change
      let did = this.chosen_dids[d_idx];
      let current_tax_id_rows = this.curr_taxcounts_obj_w_arr_by_did[did].filter(this.filter_tax_id_rows_by_rank.bind(this));
      tax_id_obj_by_did_filtered_by_rank[did] = current_tax_id_rows;
    }
    console.timeEnd("TIME: make_tax_id_obj_by_did_filtered_by_rank");
    return tax_id_obj_by_did_filtered_by_rank;
  }

  filter_tax_id_rows_by_rank(el) {
    let rank_no = parseInt(C.RANKS.indexOf(this.rank)) + 1;
    return el.tax_id_arr.length === rank_no;
  }

  create_unit_name_counts(tax_names, tax_name_cnt_obj_per_dataset) {// TODO: refactor
    var taxa_counts = {};
    for (var tax_name in tax_names){//TODO: change
      taxa_counts[tax_name] = [];
    }

    for (var i in this.chosen_dids) {// correct order //TODO: change for
      var did = this.chosen_dids[i];
      for (var tax_name1 in tax_names) {//TODO: change
        try {
          let curr_cnt = tax_name_cnt_obj_per_dataset[did][tax_name1] || 0;
          taxa_counts[tax_name1].push(curr_cnt);
        }
        catch(err) {
          taxa_counts[tax_name1].push(0);
        }
      }
    }
    //console.log('taxa_counts')
    //console.log(taxa_counts)
    return taxa_counts;
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
    this.chosen_dids                  = chosen_dids;
    this.post_items                   = visual_post_items;
    this.taxa_counts_module           = taxa_counts;
    this.taxonomy_object              = this.taxa_counts_module.taxonomy_object;
    this.chosen_dids                  = chosen_dids;
    this.tax_name_cnt_obj_1           = {};
    this.tax_name_cnt_obj_per_dataset = {};
  }

  fillin_name_lookup_per_ds(lookup, did, tax_name, cnt) {//TODO: refactor
    if (did in lookup) {
      if (tax_name in lookup[did]) {
        lookup[did][tax_name] += parseInt(cnt);
      } else {
        lookup[did][tax_name] = parseInt(cnt);
      }

    } else {
      lookup[did] = {};
      if (tax_name in lookup[did]) {
        lookup[did][tax_name] += parseInt(cnt);

      }else{
        lookup[did][tax_name] = parseInt(cnt);
      }
    }

    return lookup;
  }

}

class TaxonomySimple extends Taxonomy {

  make_tax_name_cnt_obj_per_did() {
    for (let did_idx in this.chosen_dids) {//TODO: change
      let did = this.chosen_dids[did_idx];
      let curr_taxcounts_obj = this.taxa_counts_module.tax_id_obj_by_did_filtered_by_rank[did];

      console.time("TIME: current_tax_id_row_list");
      for (let obj_idx in curr_taxcounts_obj){//TODO: change
        let curr_obj = curr_taxcounts_obj[obj_idx];
        let cnt = curr_obj.cnt;
        let tax_long_name = this.get_tax_long_name(curr_obj, this.taxonomy_object);

        this.tax_name_cnt_obj_1[tax_long_name] = 1;
        this.tax_name_cnt_obj_per_dataset      = this.fillin_name_lookup_per_ds(this.tax_name_cnt_obj_per_dataset, did, tax_long_name, cnt); //TODO: refactor
      }
      console.timeEnd("TIME: current_tax_id_row_list");
    }
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

    tax_long_name = this.clean_long_name(tax_long_name_arr); //TODO: join instead

    return tax_long_name;
  }

  get_one_taxon_name(db_id, rank) {
    let one_taxon_name = "";
    let db_id_n_rank = db_id + '_' + rank;
    let tax_node = this.get_tax_node(db_id_n_rank, this.taxonomy_object); //TODO: save db_id_n_rank and one_taxon_name to a dict and check if there first. Benchmark first!
    let rank_name = this.check_rank_name(rank); //TODO: this and if below ot a func?
    if (tax_node.taxon) {
      one_taxon_name = tax_node.taxon;
    }
    else {
      one_taxon_name = rank_name + '_NA';
    }
    return one_taxon_name;
  }


  clean_long_name(tax_long_name_arr) {
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
    let rank_name = this_rank;
    if (this_rank === 'klass') {
      rank_name = 'class';
    }
    return rank_name;
  }

}

class TaxonomyCustom extends Taxonomy {

  make_tax_name_cnt_obj_per_did() { //TODO: refactor
    console.time('TIME: taxonomy_unit_choice_custom');
    // ie custom_taxa: [ '1', '60', '61', '1184', '2120', '2261' ]  these are node_id(s)

    this.chosen_dids.forEach((did) => {
      let custom_taxa = this.post_items.custom_taxa;

      let db_tax_id_list  = {};
      db_tax_id_list[did] = {};

      for (let t_idx = 0, taxa_length = custom_taxa.length; t_idx < taxa_length; t_idx++) {
        let selected_node_id = this.post_items.custom_taxa[t_idx];
        if (this.taxonomy_object.taxa_tree_dict_map_by_id.hasOwnProperty(selected_node_id)) {

          let tax_node = this.taxonomy_object.taxa_tree_dict_map_by_id[selected_node_id];

          let id_chain_start       = '';
          let custom_tax_long_name = '';

          let new_node_id      = tax_node.parent_id;
          id_chain_start       = '_' + tax_node.db_id;  // add to beginning
          custom_tax_long_name = tax_node.taxon;

          let combined_ids_res                  = this.combine_db_tax_id_list(new_node_id, custom_tax_long_name, id_chain_start);
          db_tax_id_list[did][selected_node_id] = combined_ids_res[0];
          custom_tax_long_name                  = combined_ids_res[1];

          let cnt = this.get_tax_cnt(db_tax_id_list, did, selected_node_id, this.taxa_counts_module.tax_id_obj_by_did);

          this.tax_name_cnt_obj_1[custom_tax_long_name] = 1;
          this.tax_name_cnt_obj_per_dataset      = this.fillin_name_lookup_per_ds(this.tax_name_cnt_obj_per_dataset, did, custom_tax_long_name, cnt); //TODO: refactor
        }
      }
      console.timeEnd('TIME: taxonomy_unit_choice_custom');
    });
  }

  combine_db_tax_id_list(new_node_id, tax_long_name, id_chain) {// TODO: refactor
    let new_node;
    let db_id;
    while (new_node_id !== 0) {
      new_node      = this.taxonomy_object.taxa_tree_dict_map_by_id[new_node_id];
      db_id         = new_node.db_id;
      id_chain 			= '_' + db_id + id_chain;
      new_node_id   = new_node.parent_id;
      tax_long_name = new_node.taxon + ';' + tax_long_name;
    }
    return [id_chain, tax_long_name];
  }

  get_tax_cnt(db_tax_id_list, did, selected_node_id) {//TODO: refactor
    console.time('TIME: for id_chain');
    const taxcounts = this.taxa_counts_module.curr_taxcounts_obj_of_str_by_did[did];
    let curr_tax_id_chain = db_tax_id_list[did][selected_node_id];
    let temp_cnt = 0;
    if (Object.keys(taxcounts).indexOf(curr_tax_id_chain) !== -1) {
      temp_cnt = taxcounts[curr_tax_id_chain];
    }
    console.timeEnd('TIME: for id_chain');
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