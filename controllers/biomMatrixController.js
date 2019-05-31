const COMMON = require(app_root + '/routes/visuals/routes_common');
const C      = require(app_root + '/public/constants');
var path     = require("path");

class BiomMatrix {

  constructor(req, visual_post_items) {
    this.req = req;
    this.visual_post_items = visual_post_items;
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
      units: this.visual_post_items.unit_choice,
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
    let temp_obj = {};
    let chosen_datasets = this.visual_post_items.chosen_datasets;
    for (let idx in chosen_datasets) {
      temp_obj.did = chosen_datasets[idx]["did"];
      temp_obj.id  = chosen_datasets[idx]["name"];
      temp_obj.metadata = null;
    }
    console.timeEnd("get_columns");
  }

}

class WriteMatrixFile {

  constructor(post_items, biom_matrix) {
    this.post_items = post_items;
    this.biom_matrix = biom_matrix;
    this.tmp_path = app_root +  '/tmp/';
  }

  write_matrix_files() {
    let common_file_name_part = this.tmp_path + this.post_items.ts;
    let tax_file_name = common_file_name_part + '_taxonomy.txt';
    COMMON.output_tax_file( tax_file_name, this.biom_matrix, C.RANKS.indexOf(this.post_items.tax_depth));

    let matrix_file_name = common_file_name_part + '_count_matrix.biom';
    COMMON.write_file( matrix_file_name, JSON.stringify(this.biom_matrix,null,2) );
  }

  get_file_prefix(req, unit_choice) {
    var files_prefix;
    if (unit_choice === 'tax_rdp2.6_simple'){
      files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE + "--datasets_rdp2.6");
    } else if (unit_choice === 'tax_generic_simple'){
      files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE + "--datasets_generic");
    } else {
      files_prefix = path.join(req.CONFIG.JSON_FILES_BASE, NODE_DATABASE + "--datasets_" + C.default_taxonomy.name);  // default
    }
    return files_prefix; // /Users/ashipunova/BPC/vamps-node.js/public/json/vamps2--datasets_silva119
  }
}

module.exports = {
  BiomMatrix: BiomMatrix,
  WriteMatrixFile: WriteMatrixFile
};
