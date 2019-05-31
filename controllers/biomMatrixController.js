const COMMON = require(app_root + '/routes/visuals/routes_common');
const C      = require(app_root + '/public/constants');
var path     = require("path");

class BiomMatrix {

  constructor(req, visual_post_items) {
    this.req = req;
    this.visual_post_items = visual_post_items;
    this.units = this.visual_post_items.unit_choice;
    this.choosen_datasets = this.visual_post_items.chosen_datasets; /* post_items.chosen_datasets["0"] = {
  "did": 475152,
  "name": "SLM_NIR2_Bv4--Aligator_Pool01"
}*/
    this.choosen_dids = this.get_dids();
    this.taxa_counts = new module.exports.TaxaCounts(this.visual_post_items, this.choosen_dids);

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

  //  ---
    let date = new Date();
    this.biom_matrix = {
      id: this.visual_post_items.ts,
      format: "Biological Observation Matrix 0.9.1-dev",
      format_url:"http://biom-format.org/documentation/format_versions/biom-1.0.html",
      type: "OTU table",
      units: this.units,
      generated_by:"VAMPS-NodeJS Version 2.0",
      date: date.toISOString(),
      rows: [this.rows],												// taxonomy (or OTUs, MED nodes) names
      columns: [this.columns],											// ORDERED dataset names
      column_totals: [],								// ORDERED datasets count sums
      max_dataset_count: 0,						// maximum dataset count
      matrix_type: 'dense',
      matrix_element_type: 'int',
      shape: [],									// [row_count, col_count]
      data:  this.ordered_list_of_lists_of_tax_counts
    };

  }

  get_columns() {
    console.time("get_columns");
    let temp_col_obj = {};
    for (let idx in this.choosen_datasets) {
      temp_col_obj.did = this.choosen_datasets[idx]["did"];
      temp_col_obj.id  = this.choosen_datasets[idx]["name"];
      temp_col_obj.metadata = null;
    }
    console.timeEnd("get_columns");
    return temp_col_obj;
  }

  get_dids() {
    let dids = this.choosen_datasets.map(function (value) { return value.did; });
    return dids;
  }
}

class TaxaCounts {

  constructor(post_items, choosen_dids) {
    this.post_items = post_items;
    this.choosen_dids = choosen_dids;
    this.units = this.post_items.unit_choice;
    this.taxonomy_file_prefix = this.get_taxonomy_file_prefix();
    this.rank = this.post_items.tax_depth;
    this.tax_complexity = this.choose_simple_or_custom();

    this.taxonomy_object = this.get_taxonomy_object();
    this.taxcounts_obj_from_file = this.get_taxcounts_obj_from_file(); /*{
  "_3": 42700,
  "_2": 30,
  "_1": 1071,
  "_4": 2,
  "_3_8": 31939,*/
    this.unit_name_lookup = {};
    this.unit_name_lookup_per_dataset = this.create_an_empty_unit_name_lookup_per_dataset();
    this.current_tax_id_row_list = this.collect_tax_id_rows();


    //  --
    /*	unit_name_lookup = res[0];
	unit_name_lookup_per_dataset = res[1];

	let unit_name_counts = create_unit_name_counts(unit_name_lookup, post_items, unit_name_lookup_per_dataset);
	let ukeys = remove_empty_rows(unit_name_counts);*/
  }

  get_taxonomy_file_prefix() {
    let files_prefix;
    if (this.units === 'tax_rdp2.6_simple'){
      files_prefix = path.join(this.req.CONFIG.JSON_FILES_BASE, NODE_DATABASE + "--datasets_rdp2.6");
    } else if (this.units === 'tax_generic_simple'){
      files_prefix = path.join(this.req.CONFIG.JSON_FILES_BASE, NODE_DATABASE + "--datasets_generic");
    } else {
      files_prefix = path.join(this.req.CONFIG.JSON_FILES_BASE, NODE_DATABASE + "--datasets_" + C.default_taxonomy.name);  // default
    }
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

  create_an_empty_unit_name_lookup_per_dataset() {
    let empty_unit_name_lookup_per_dataset = {};
    for (let idx in this.choosen_dids) {
      let did = this.choosen_dids[idx];
      empty_unit_name_lookup_per_dataset[did] = {};
    }
    return empty_unit_name_lookup_per_dataset;
  }

  get_taxcounts_obj_from_file(did) {
    try {
      let path_to_file = path.join(this.taxonomy_file_prefix, did +'.json');
      let jsonfile = require(path_to_file);
      return jsonfile['taxcounts'];
    }
    catch(err) {
      console.log('2-no file ' + err.toString() + ' Exiting');
      console.log('this.taxonomy_file_prefix = ' + this.taxonomy_file_prefix);
      console.log('did = ' + did);
      return {};
    }
  }

  choose_simple_or_custom() {
    let unit_choice_simple = (this.units.substr(this.units.length - 6) === 'simple');
    let unit_choice_custom = (this.units === 'tax_' + C.default_taxonomy.name + '_custom');
    if (unit_choice_simple) {
      return "simple";
    }
    else if (unit_choice_custom) {
      return "custom";
    }
    else {
      console.log("ERROR: Can't choose simple or custom taxonomy");
    }
  }

  taxonomy_unit_choice_simple(did) {

  }

  collect_tax_id_rows() {
    console.time("TIME: collect_tax_id_rows");
    let current_tax_id_rows = [];
    let rank_no = parseInt(C.RANKS.indexOf(this.rank))	+ 1;

    for (let current_tax_id_row in this.taxcounts_obj_from_file) {
      let current_ids_amount = (current_tax_id_row.match(/_/g) || []).length;
      let current_ids_amount1 = current_tax_id_row.split("_");
      if (current_ids_amount === rank_no) {
        current_tax_id_rows.push(current_tax_id_row);
      }
    }
    console.timeEnd("TIME: collect_tax_id_rows");
    return current_tax_id_rows;
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
    COMMON.output_tax_file( tax_file_name, this.biom_matrix, C.RANKS.indexOf(this.post_items.tax_depth));

    let matrix_file_name = common_file_name_part + '_count_matrix.biom';
    COMMON.write_file( matrix_file_name, JSON.stringify(this.biom_matrix,null,2) );
  }

}

module.exports = {
  BiomMatrix: BiomMatrix,
  TaxaCounts: TaxaCounts,
  WriteMatrixFile: WriteMatrixFile
};
