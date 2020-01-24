const COMMON = require(app_root + '/routes/visuals/routes_common');
const helpers = require(app_root + '/routes/helpers/helpers');
// const path = require('path');
const C = require(app_root + '/public/constants');
// const fs   = require('fs-extra');
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
      // console.log(PROJECT_INFORMATION_BY_PNAME[this.req.body.project]);
      // console.log(this.visual_post_items.ds_order);
      this.req.session.chosen_id_order = this.new_dataset_ids;
      // = this.visual_post_items.ds_order;
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
    this.get_visual_post_items_common();
    this.visual_post_items.custom_taxa = this.req.session.custom_taxa;
    this.update_req_session();
  }

  update_req_session() {
    let viz_vars = new module.exports.visualizationCommonVariables(this.req, this.dataset_ids);
    this.visual_post_items.chosen_datasets = viz_vars.get_dataset_obj_by_did(this.dataset_ids);
    this.req.session.project_dataset_vars.current_project_dataset_obj_w_keys = this.visual_post_items.chosen_datasets;
    this.req.session.chosen_id_order = this.dataset_ids;
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
    let owner_is_user = node.permissions.includes(req.user.user_id);
    let dco_project = (node.project).substring(0,3) === 'DCO';
    let dco_editor_for_dco_project = (user_security_level_to_int === 45 && dco_project);

    return node.public || is_admin_user || no_permissions || owner_is_user || dco_editor_for_dco_project;
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

  filter_projects (req, prj_obj, filter_obj) {
    // 1 substring      name search
    // 2 env            search PROJECT_INFORMATION_BY_PID
    // 3 target         name search
    // 4 portal         helpers.get_portal_projects()
    // 5 public_private search PROJECT_INFORMATION_BY_PID
    // 6 metadata       search AllMetadata
    //console.log(PROJECT_INFORMATION_BY_PID)
    //console.log('IN FilterProjects')
    //console.log(prj_obj, filter_obj)
    // console.time("TIME: filter_projects");
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

    // METADATA2
    let NewPROJECT_TREE_OBJ7 = this.filter_by_metadata(filter_obj.metadata2, NewPROJECT_TREE_OBJ6);

    // METADATA3
    let NewPROJECT_TREE_OBJ8 = this.filter_by_metadata(filter_obj.metadata3, NewPROJECT_TREE_OBJ7);

    let new_obj = NewPROJECT_TREE_OBJ8;
    //console.log('new_obj')
    //console.log(new_obj)
    // console.timeEnd("TIME: filter_projects");
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
  // visualizationFiles,
  visualizationFilters,
  visualizationCommonVariables
};
