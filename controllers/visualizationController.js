const COMMON = require(app_root + '/routes/visuals/routes_common');
const helpers = require(app_root + '/routes/helpers/helpers');
const path = require('path');
const C = require(app_root + '/public/constants');
const fs   = require('fs-extra');
const url  = require('url');

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

  // get_biom_file_tmp_path(req) {
  //   return this.get_file_tmp_path_by_ending(req, 'count_matrix.biom');
  //   // const biom_file_name = this.get_file_names(req)['count_matrix.biom'];
  //   // const tmp_path = this.get_tmp_file_path(req);
  //   // return path.join(tmp_path, biom_file_name);
  // }

  get_tmp_file_path(req) {
    return req.CONFIG.TMP_FILES;
  }

  get_static_script_file_path(req) {
    return req.CONFIG.PATH_TO_STATIC_BASE;
  }

  get_viz_scripts_path(req) {
    return req.CONFIG.PATH_TO_VIZ_SCRIPTS;
  }

  print_log_if_not_vamps(req, msg, msg_prod = 'VAMPS PRODUCTION -- no print to log') {
    if (req.CONFIG.site === 'vamps') {
      console.log(msg_prod);
    } else {
      console.log(msg);
    }
  }

  test_if_json_file_exists(req, dataset_ids, did) {
    let files_prefix = this.get_json_files_prefix(req);
    let path_to_file = path.join(files_prefix, did + '.json');
    let error_msg = "";
    try {
      require(path_to_file);
    }
    catch (err) {
      console.log(err);
      // let pid = PROJECT_ID_BY_DID[did];
      // let pname = PROJECT_INFORMATION_BY_PID[pid].project;
      // let dname = DATASET_NAME_BY_DID[did];
      // error_msg = 'No Taxonomy found for this dataset (' + pname + '--' + dname + ' (did: ' + did + ')) and possibly others. Try selecting other units.';
      let p_d_name = req.session.project_dataset_vars.current_project_dataset_obj_by_did[did];
      error_msg = 'No Taxonomy found for this dataset (' + p_d_name + ' (did: ' + did + ')) and possibly others. Try selecting other units.';
    }
    if (error_msg){
      req.flash('fail', error_msg);
    }
  }

  get_user_timestamp(req) {
    let curr_timestamp = "";
    let user_timestamp = "";
    if (req.session.ts) {
      user_timestamp = req.session.ts;
    }
    else {
      curr_timestamp = +new Date();  // millisecs since the epoch!
      user_timestamp = req.user.username + '_' + curr_timestamp;
    }
    req.session.ts = user_timestamp;
    return user_timestamp;
  }

  get_timestamp_only(req) {
    const curr_ts = this.get_user_timestamp(req);
    const user_timestamp_arr = curr_ts.split("_");
    const timestamp_only = user_timestamp_arr[user_timestamp_arr.length - 1];
    return timestamp_only;
  }

  get_sequences_json_file_path(req, selected_did, user_timestamp = "") {
    if (user_timestamp === "") {
      user_timestamp = this.get_user_timestamp(req);
    }
    const user_timestamp_arr = user_timestamp.split("_");
    const timestamp_only = user_timestamp_arr[user_timestamp_arr.length - 1];
    const user_name = user_timestamp_arr.slice(0, -1).join("_");
    // const filename = user_timestamp + '_' + selected_did + '_sequences.json';
    const filename = user_name + '_' + selected_did + '_' + timestamp_only + '_sequences.json';
    const tmp_path = this.get_tmp_file_path(req);
    return path.join(tmp_path, filename);
  }

  get_tree_file_name(req, metric, user_timestamp = "") {
    if (user_timestamp === "") {
      user_timestamp = this.get_user_timestamp(req);
    }
    return user_timestamp + '_' + metric + '_tree.txt';
  }

  phyloseq_svgfile_name(req, user_timestamp = "") {
    if (user_timestamp === "") {
      user_timestamp = this.get_user_timestamp(req);
    }
    const rando = Math.floor((Math.random() * 100000) + 1);  // required to prevent image caching
    const plot_type = req.body.plot_type;
    return (user_timestamp + '_phyloseq_' + plot_type + '_' + rando.toString() + '.svg');
  }

  get_distmtx_file_name(req, user_timestamp = "") {
    if (user_timestamp === "") {
      user_timestamp = this.get_user_timestamp(req);
    }
    let suffix = req.body.split_distance_choice;
    const distmtx_file_name = user_timestamp + '_distance_' + suffix + '.tsv';
    return distmtx_file_name;
  }

  get_tmp_distmtx_file_path(req) {
    const test_split_file_name = this.get_distmtx_file_name(req);
    const tmp_path = this.get_tmp_file_path(req);
    const test_distmtx_file_path = path.join(tmp_path, test_split_file_name);

    return test_distmtx_file_path;
  }

  get_file_tmp_path_by_ending(req, ending) {
    const tmp_file_path = this.get_tmp_file_path(req);
    const file_name_obj = this.get_file_names(req);
    const file_name = file_name_obj[ending];
    const file_tmp_path = path.join(tmp_file_path, file_name);
    return file_tmp_path;
  }

  get_file_names_switch(req, file_type) {
    switch (file_type) {
      case 'biom':
        return this.get_file_tmp_path_by_ending(req, 'count_matrix.biom');
      case 'tax':
        return this.get_file_tmp_path_by_ending(req, 'taxonomy.txt');
      case 'meta':
        return this.get_file_tmp_path_by_ending(req, 'metadata.txt');
      default:
        console.log('ERROR In download_file');
    }
  }

  checkExistsWithTimeout(filePath, timeout) {
    // process.on('unhandledRejection', up => { throw up });
    process.on('unhandledRejection', up => { console.log(up) });
    console.log('Timeout = ', timeout);
    return new Promise(function (resolve, reject) {

      let timer = setTimeout(function () {
        watcher.close();
        reject(new Error('File did not exists and was not created during the timeout. Timeout = ', timeout));
      }, timeout);

      fs.access(filePath, fs.constants.R_OK, function (err) {
        if (!err) {
          clearTimeout(timer);
          watcher.close();
          resolve();
        }
      });

      let dir = path.dirname(filePath);
      let basename = path.basename(filePath);
      let watcher = fs.watch(dir, function (eventType, filename) {
        if (eventType === 'rename' && filename === basename) {
          clearTimeout(timer);
          watcher.close();
          resolve();
        }
      });
    });
  }


  get_file_names(req, user_ts = "") {
    if (user_ts === "") {
      user_ts = this.get_user_timestamp(req);
    }
    return {
      'adiversity-api.csv': user_ts + '-adiversity-api.csv',
      'dheatmap-api.html': user_ts + '-dheatmap-api.html',
      'piecharts-api.svg': user_ts + '-piecharts-api.svg',
      'count_matrix.biom': user_ts + '_count_matrix.biom',
      'distance.R': user_ts + '_distance.R',
      'distance.csv': user_ts + '_distance.csv',
      'distance.json': user_ts + '_distance.json',
      'distance_mh_bc.tsv': user_ts + '_distance_mh_bc.tsv',
      'fheatmap.svg': user_ts + '_fheatmap.svg',
      'metadata.txt': user_ts + '_metadata.txt',
      'outtree.tre': user_ts + '_outtree.tre',
      'pcoa3d': user_ts + '_pcoa3d',
      'pcoa.pdf': user_ts + '_pcoa.pdf',
      'pc.txt': user_ts + '_pc.txt',
      'taxonomy.txt': user_ts + '_taxonomy.txt',
    };
  }

}

class visualizationFilters {
  constructor() {
    this.md_env_package = MD_ENV_PACKAGE;
  }

  check_if_empty_val(val) {
    if (val === '.....'){
      return true;
    }
    else {
      return false;
    }
  }

  get_envid_lst(req) {
    console.log("get_envid_lst");
    const env_id_name = req.params.envid;
    const items = env_id_name.split('--');
    let envid = items[0];
    const env_name = items[1];
    let envid_lst = [];

    if (env_name === 'human associated') {  // get ids for 'human associated'
      envid_lst = Object.keys(this.md_env_package).filter(key => this.md_env_package[key].startsWith('human'));
    } else if (envid === '.....') {
      envid_lst = [];
    } else {
      envid_lst = [parseInt(envid)];
    }
    return envid_lst;
  }

  get_projects_to_filter(req) {
    const myurl = url.parse(req.url, true);
    const portal = myurl.query.portal;
    let projects_to_filter = [];
    if (portal) {
      projects_to_filter = helpers.get_portal_projects(req, portal);
    } else {
      projects_to_filter = SHOW_DATA.projects;
    }
    return projects_to_filter;
  }

  filter_project_tree_for_permissions(req, obj){
    console.log('Filtering tree projects for permissions');
    let new_project_tree_pids = [];
    for (let i in obj){
      //node = PROJECT_INFORMATION_BY_PID[pid];
      //console.log(obj[i])
      let pid = obj[i].pid;
      let node = PROJECT_INFORMATION_BY_PID[pid];
      //console.log(node)
      let is_visible = this.test_project_visibility_permissions(req, node);
      if (is_visible) {
        let not_metagenomic = parseInt(PROJECT_INFORMATION_BY_PID[pid].metagenomic) === 0;
        if (not_metagenomic){
          new_project_tree_pids.push(pid);
        }
      }
    }
    //console.log(obj)
    return new_project_tree_pids;
  }

  test_project_visibility_permissions(req, node) {
    let user_security_level_to_int = parseInt(req.user.security_level);
    let is_admin_user = user_security_level_to_int <= 10;
    let no_permissions = node.permissions.length === 0;
    let owner_is_user = node.permissions.indexOf(req.user.user_id) !== -1;
    let dco_project = (node.project).substring(0,3) === 'DCO';
    let dco_editor_for_dco_project = (user_security_level_to_int === 45 && dco_project);

    return node.public || is_admin_user || no_permissions || owner_is_user || dco_editor_for_dco_project;
  }

  get_PTREE_metadata (OBJ, q) {
    return OBJ.filter(prj => {
      let dids = DATASET_IDS_BY_PID[prj.pid];
      return dids.some(did => (did in AllMetadata && AllMetadata[did].hasOwnProperty(q)));
    });
  }

  filter_is_empty(current_filter) {
    const empty_vals = ['', '.....'];
    if (current_filter.length === 0 || empty_vals.includes(current_filter)) {
      return true;
    }
    else {
      return false;
    }
  }

  filter_by_substring(filter_obj, prj_obj) {
    let NewPROJECT_TREE_OBJ1 = [];
    let filter_empty = this.filter_is_empty(filter_obj.substring);
    if (filter_empty || prj_obj.length === 0) {
      NewPROJECT_TREE_OBJ1 = prj_obj;
    }
    else {
      NewPROJECT_TREE_OBJ1 = prj_obj.filter(prj => {
        let ucname = "";
        ucname = prj.name || prj.project;
        return ucname.toUpperCase().includes(filter_obj.substring);
      });
    }
    return NewPROJECT_TREE_OBJ1;
  }

  filter_by_env(filter_obj, NewPROJECT_TREE_OBJ1){
    //console.log('Filtering for ENV')
    let filter_empty = this.filter_is_empty(filter_obj.env);
    let NewPROJECT_TREE_OBJ2 = [];
    if (filter_empty || NewPROJECT_TREE_OBJ1.length === 0) {
      NewPROJECT_TREE_OBJ2 = NewPROJECT_TREE_OBJ1;
    }
    else {
      NewPROJECT_TREE_OBJ2 = NewPROJECT_TREE_OBJ1.filter(prj => {
        const current_pr_env_package_id = parseInt(PROJECT_INFORMATION_BY_PID[prj.pid].env_package_id);
        return filter_obj.env.includes(current_pr_env_package_id);
        });
    }
    // console.timeEnd("TIME: filter_by_env filter");
    return NewPROJECT_TREE_OBJ2;
  }

  filter_by_target(filter_obj, NewPROJECT_TREE_OBJ2) {
    let NewPROJECT_TREE_OBJ3 = [];
    let filter_empty = this.filter_is_empty(filter_obj.target);
    if (filter_empty || NewPROJECT_TREE_OBJ2.length === 0) {
      NewPROJECT_TREE_OBJ3 = NewPROJECT_TREE_OBJ2;
    }
    else {
      let pr_name = "";
      let pparts = [];
      let last_el = [];
      NewPROJECT_TREE_OBJ3 = NewPROJECT_TREE_OBJ2.filter(prj => {
        pr_name = prj.name || prj.project;
        pparts = pr_name.split('_');
        last_el = pparts[pparts.length - 1];
        return ((filter_obj.target === 'ITS' && last_el.startsWith('ITS')) || (last_el === filter_obj.target));
      });
    }
    return NewPROJECT_TREE_OBJ3;
  }

  filter_by_portal(filter_obj, NewPROJECT_TREE_OBJ3) {
    let NewPROJECT_TREE_OBJ4 = [];
    let filter_empty = this.filter_is_empty(filter_obj.portal);
    if (filter_empty || NewPROJECT_TREE_OBJ3.length === 0) {
      NewPROJECT_TREE_OBJ4 = NewPROJECT_TREE_OBJ3;
    }
    else {
      //console.log('Filtering for PORTAL')
      const portal = C.PORTALS[filter_obj.portal];
      NewPROJECT_TREE_OBJ4 = NewPROJECT_TREE_OBJ3.filter(prj => {
        let pr_name = prj.name || prj.project;
        let pparts = pr_name.split('_');
        let prefix = pparts[0];
        let suffix = pparts[pparts.length - 1];
        return (portal.prefixes.includes(prefix) || portal.projects.includes(pr_name) || portal.suffixes.includes(suffix));
      });
    }
    return NewPROJECT_TREE_OBJ4;
  }

  filter_by_public_private(filter_obj, NewPROJECT_TREE_OBJ4) {
    let NewPROJECT_TREE_OBJ5 = [];
    if (filter_obj.public === '-1' || NewPROJECT_TREE_OBJ4.length === 0) {
      NewPROJECT_TREE_OBJ5 = NewPROJECT_TREE_OBJ4;
    } else {
      //console.log('Filtering for PRIVACY')
      NewPROJECT_TREE_OBJ5 = NewPROJECT_TREE_OBJ4.filter(prj => PROJECT_INFORMATION_BY_PID[prj.pid].public === parseInt(filter_obj.public));
    }
    return NewPROJECT_TREE_OBJ5;
  }

  filter_by_metadata(filter_obj_metadata, current_NewPROJECT_TREE_OBJ) {
    let res_NewPROJECT_TREE_OBJ = [];
    let filter_empty = this.filter_is_empty(filter_obj_metadata);
    if (filter_empty || current_NewPROJECT_TREE_OBJ.length === 0) {
      res_NewPROJECT_TREE_OBJ = current_NewPROJECT_TREE_OBJ;
    }
    else {
      res_NewPROJECT_TREE_OBJ = current_NewPROJECT_TREE_OBJ.filter(prj => {
        let dids = DATASET_IDS_BY_PID[prj.pid];
        return dids.some(did => (did in AllMetadata && AllMetadata[did].hasOwnProperty(filter_obj_metadata)));
      });
    }
    return res_NewPROJECT_TREE_OBJ;
  }



// TODO: "This function's cyclomatic complexity is too high. (16)"
  filter_projects (req, prj_obj, filter_obj) {
    // 1 substring      name search
    // 2 env            search PROJECT_INFORMATION_BY_PID
    // 3 target         name search
    // 4 portal         helpers.get_portal_projects()
    // 5 public_private search PROJECT_INFORMATION_BY_PID
    // 6 metadata       helpers.get_PTREE_metadata
    //console.log(PROJECT_INFORMATION_BY_PID)
    //console.log('IN FilterProjects')
    //console.log(prj_obj, filter_obj)
    console.time("TIME: filter_projects");
    // SUBSTRING
    let NewPROJECT_TREE_OBJ1 = this.filter_by_substring(filter_obj, prj_obj);

    // ENV
    let NewPROJECT_TREE_OBJ2 = this.filter_by_env(filter_obj, NewPROJECT_TREE_OBJ1);

    // TARGET
    let NewPROJECT_TREE_OBJ3 = this.filter_by_target(filter_obj, NewPROJECT_TREE_OBJ2);

    // PORTAL
    let NewPROJECT_TREE_OBJ4 = this.filter_by_portal(filter_obj, NewPROJECT_TREE_OBJ3);

    // public/private
    let NewPROJECT_TREE_OBJ5 = this.filter_by_public_private(filter_obj, NewPROJECT_TREE_OBJ4);

    // METADATA1
    let NewPROJECT_TREE_OBJ6 = this.filter_by_metadata(filter_obj.metadata1, NewPROJECT_TREE_OBJ5);
    // let NewPROJECT_TREE_OBJ6 = [];
    // if (filter_obj.metadata1 === '' || filter_obj.metadata1 === '.....' || NewPROJECT_TREE_OBJ5.length === 0) {
    //   NewPROJECT_TREE_OBJ6 = NewPROJECT_TREE_OBJ5;
    // } else {
    //   NewPROJECT_TREE_OBJ6 = this.get_PTREE_metadata(NewPROJECT_TREE_OBJ5, filter_obj.metadata1);
    // }
    // METADATA2
    let NewPROJECT_TREE_OBJ7 = [];
    if (filter_obj.metadata2 === '' || filter_obj.metadata2 === '.....' || NewPROJECT_TREE_OBJ6.length === 0) {
      NewPROJECT_TREE_OBJ7 = NewPROJECT_TREE_OBJ6;
    } else {
      NewPROJECT_TREE_OBJ7 = this.get_PTREE_metadata(NewPROJECT_TREE_OBJ6, filter_obj.metadata2);
    }
    // METADATA1
    let NewPROJECT_TREE_OBJ8 = [];
    if (filter_obj.metadata3 === '' || filter_obj.metadata3 === '.....' || NewPROJECT_TREE_OBJ7.length === 0) {
      NewPROJECT_TREE_OBJ8 = NewPROJECT_TREE_OBJ7;
    } else {
      NewPROJECT_TREE_OBJ8 = this.get_PTREE_metadata(NewPROJECT_TREE_OBJ7, filter_obj.metadata3);
    }

    let new_obj = NewPROJECT_TREE_OBJ8;
    //console.log('new_obj')
    //console.log(new_obj)
    console.timeEnd("TIME: filter_projects");
    return new_obj;

  }

  get_global_filter_values(req) {
    const projects_to_filter = this.get_projects_to_filter(req);
    const newproject_tree_obj = this.filter_projects(req, projects_to_filter, PROJECT_FILTER);
    const project_tree_pids = this.filter_project_tree_for_permissions(req, newproject_tree_obj);
    this.update_project_filter_length(project_tree_pids);

    return {
      project_filter: PROJECT_FILTER,
      newproject_tree_obj: newproject_tree_obj,
      project_tree_pids: project_tree_pids
    };
  }

  update_project_filter_length(project_tree_pids) {
    PROJECT_FILTER.pid_length = project_tree_pids.length;
  }

}

class visualizationCommonVariables {
  constructor(req, chosen_id_order) {
    this.chosen_id_order = chosen_id_order || req.session.chosen_id_order;
    this.current_project_dataset_obj_by_name = this.get_current_project_dataset_obj_by_name();
    this.current_project_dataset_obj_by_did = this.get_current_project_dataset_obj_by_did();
    this.project_dataset_names = Object.keys(this.current_project_dataset_obj_by_name);
    this.current_project_dataset_obj_w_keys = this.get_current_project_dataset_obj_w_keys();
  }

  get_current_dataset_name_by_did(selected_did) {
    return DATASET_NAME_BY_DID[selected_did];
  }

  get_current_project_dataset_obj_by_did() {
    let ret = {};
    for (let key in this.current_project_dataset_obj_by_name){
      ret[this.current_project_dataset_obj_by_name[key]] = key;
    }
    return ret;
  }

  get_current_pr_dataset_name_by_did(selected_did) {
    return PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[selected_did]].project + '--' + DATASET_NAME_BY_DID[selected_did];
  }

  get_current_project_dataset_obj_by_name() {
    let current_project_dataset_obj = {};
    for (const did of this.chosen_id_order){
      const pid = PROJECT_ID_BY_DID[did];
      const project_name = PROJECT_INFORMATION_BY_PID[pid].project;
      const dataset_name = DATASET_NAME_BY_DID[did];
      const project_dataset_name = project_name + '--' + dataset_name;
      current_project_dataset_obj[project_dataset_name] = did;
    }
    return current_project_dataset_obj;
  }

  get_current_project_dataset_obj_w_keys() {
    if (!helpers.is_array(this.project_dataset_names)) {
      this.project_dataset_names = [this.project_dataset_names];
    }
    return this.project_dataset_names.reduce((res_arr, name) => {
      // FROM:   "DCO_SAR2_Bv4v5--C1_SR_Bac": 474458,
      // TO: {
      //     "did": 474458,
      //     "d_name": "DCO_SAR2_Bv4v5--C1_SR_Bac"
      //   },

      const inner_obj = {};
      inner_obj.did = this.current_project_dataset_obj_by_name[name];
      inner_obj.name = name;
      res_arr.push(inner_obj);
      return res_arr;
    }, []);
  }

  get_dataset_obj_by_did(selected_did_arr) {
    if (!helpers.is_array(selected_did_arr)) {
      selected_did_arr = [selected_did_arr];
    }
    let result_arr_arr = selected_did_arr.map(did => {
      return this.current_project_dataset_obj_w_keys.find(key => parseInt(key.did) === parseInt(did));
    });
    return result_arr_arr;
  }
}

module.exports = {
  viewSelectionGetData,
  viewSelectionFactory,
  visualizationFiles,
  visualizationFilters,
  visualizationCommonVariables
};
