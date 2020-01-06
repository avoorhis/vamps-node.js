let Project              = require(app_root + '/models/project_model');
let Dataset              = require(app_root + '/models/dataset_model');
let csv_files_controller = require(app_root + '/controllers/csvFilesController');
// let User                 = require(app_root + '/models/user_model');
const helpers            = require(app_root + '/routes/helpers/helpers');
const constants_metadata = require(app_root + '/public/constants_metadata');
const constants          = require(app_root + '/public/constants');
const CONSTS             = Object.assign(constants, constants_metadata);
let validator            = require('validator');

// let csv_files_controller = require(app_root + '/controllers/csvFilesController');

class CreateDataObj {

  constructor(req, res, project_id, dataset_ids) {
    this.req             = req;
    this.res             = res;
    this.pid             = project_id || '';
    this.dataset_ids     = DATASET_IDS_BY_PID[this.pid] || dataset_ids || [];

    this.field_names    = new module.exports.FieldNames(req, this.dataset_ids);
    this.all_field_names = this.field_names.collect_field_names();
    this.required_field_names_for_env = this.field_names.required_field_names_for_env;

    this.all_metadata    = {};
    this.metadata_new_form_fields = this.field_names.metadata_new_form_fields;

    this.prepare_empty_metadata_object();

  }

  create_an_empty_fixed_length_obj(field_names_arr) {
    let data_obj = {};
    for (let i = 0; i < field_names_arr.length; i++) {
      const field_name = field_names_arr[i];
      const name_is_already_in = data_obj.hasOwnProperty(field_name);

      if (!name_is_already_in) {
        data_obj[field_name] = [];
      }
    }

    return data_obj;
  }

  prepare_empty_metadata_object() {
    // console.time('TIME: prepare_empty_metadata_object');
    let empty_field_names_obj = this.create_an_empty_fixed_length_obj(this.all_field_names);
    this.all_metadata[this.pid] = empty_field_names_obj;

    const dataset_ids_exist = this.dataset_ids.length > 0;
    if (dataset_ids_exist)
    {
      this.all_metadata[this.pid]['dataset_id'] = this.dataset_ids;
    }

    // console.timeEnd('TIME: prepare_empty_metadata_object');
  }

  // get_project_info(req, res, project_name_or_pid) {
  //   let project_info;
  //
  //   // let user_id  = req.form.pi_id_name.split('#')[0];
  //   // let user_obj = User.getUserInfoFromGlobal(user_id);
  //
  //   // TODO: use with new
  //   // if (typeof project_name_or_pid === 'undefined') {
  //   // const new_project = new Project(req, res, "", user_obj);
  //   // let project_obj   = new_project.project_obj;
  //   // }
  //
  //   if (helpers.isInt(project_name_or_pid)) {
  //     project_info = PROJECT_INFORMATION_BY_PID[project_name_or_pid];
  //   }
  //   else {
  //     project_info = PROJECT_INFORMATION_BY_PNAME[project_name_or_pid];
  //   }
  //
  //   return {
  //     project: project_info.project,
  //     first_name: project_info.first,
  //     institution: project_info.institution,
  //     last_name: project_info.last,
  //     pi_email: project_info.email,
  //     pi_name: project_info.first + ' ' + project_info.last,
  //     project_title: project_info.title,
  //     public: project_info.public,
  //     username: project_info.username
  //   };
  // }

  add_project_abstract_info(project_obj, existing_all_metadata_pid, repeat_times) {
    let to_repeat = project_obj.abstract_data.pdfs;

    if ((typeof existing_all_metadata_pid['project_abstract'] !== 'undefined') && (typeof existing_all_metadata_pid['project_abstract'][0] !== 'undefined') && (!Array.isArray(existing_all_metadata_pid['project_abstract'][0]))) {
      let project_abstract_correct_form = helpers.unique_array(existing_all_metadata_pid['project_abstract']);
      to_repeat                         = project_abstract_correct_form[0].split(',');
    }
    return this.fill_out_arr_doubles(to_repeat, repeat_times);
  }

  make_metadata_object_from_form() {
    // console.time("TIME: make_metadata_object_from_form");
    console.trace("Show me, I'm in make_metadata_object_from_form");
    let data = this.req.form;

    //new
    if (data['dataset_id'][0] === "") {
      this.show_with_new_datasets();
    }
    else {
      this.existing_object_from_form(data);
    }
    // console.timeEnd("TIME: make_metadata_object_from_form");
  }

  show_with_new_datasets() {
    let pid  = this.req.body.project_id;
    let data = this.req.form;

    const new_dataset = new Dataset(this.req, this.res, this.pid, data);
    let DatasetInfo   = new_dataset.DatasetInfo;
    let that          = this;
    // console.log('OOO1 JSON.stringify(DatasetInfo) = ', JSON.stringify(DatasetInfo));
    new_dataset.addDataset(function (err, rows) {
      // console.time("TIME: in post /metadata_new, add dataset");
      if (err) {
        console.log('WWW000 err', err);
        this.req.flash('fail', err);
      }
      else {
        console.log('New datasets SAVED');
        // console.log('WWW rows', rows);
        new_dataset.get_new_dataset_by_name(
          function (err, rows) {
            if (err) {
              // console.log('WWW00 err', err);
              this.req.flash('fail', err);
            }
            else {
              // console.log('WWW22 rows', rows);
              new_dataset.update_dataset_obj(rows, pid);
              new_dataset.add_info_to_dataset_globals();
              data['dataset']    = new_dataset.DatasetInfo.dataset;
              data['dataset_id'] = new_dataset.DatasetInfo.dataset_id;
              that.existing_object_from_form(data);
            }
          }
        );
      }
    });
  }

  make_metadata_object_with_new_datasets(req, res, pid, data) {
    // let dataset_count =
    const new_dataset = new Dataset(req, res, pid, data);
    let DatasetInfo   = new_dataset.DatasetInfo;
    let that          = this;
    // console.log('OOO1 JSON.stringify(DatasetInfo) = ', JSON.stringify(DatasetInfo));
    new_dataset.addDataset(function (err, rows) {
      // console.time("TIME: in post /metadata_new, add dataset");
      if (err) {
        // console.log('WWW0 err', err);
        req.flash('fail', err);
      }
      else {
        console.log('New datasets SAVED');
        // console.log('WWW rows', rows);
        new_dataset.get_new_dataset_by_name(
          function (err, rows) {
            if (err) {
              // console.log('WWW00 err', err);
              req.flash('fail', err);
            }
            else {
              // console.log('WWW22 rows', rows);
              new_dataset.update_dataset_obj(rows, pid);
              // new_dataset.dataset_objects_arr;
              new_dataset.add_info_to_dataset_globals();
              data['dataset_id'] = new_dataset.DatasetInfo.dataset_id; // duplicate
              data['dataset']    = helpers.unique_array(new_dataset.DatasetInfo.dataset);  // duplicate
              that.existing_object_from_form(req, res, pid, data);
            }
          }
        );
      }
    });
  }

  array_has_no_valid_val(arr) {
    let arr_is_valid = true;
    let arr_u = helpers.unique_array(arr);

    let arr_all_undef = !(helpers.is_empty(arr_u.filter(x => typeof(x) === 'undefined')));
    let arr_all_empty_equivalents = !(helpers.is_empty(arr_u.filter(x => CONSTS.EMPTY_EQUIVALENTS.includes(x))));
    let empty = helpers.is_empty(arr_u);
    if (arr_all_undef || arr_all_empty_equivalents || empty) {
      arr_is_valid = false;
    }
    return arr_is_valid;
  }

  geo_loc_info(all_metadata, pid){
    let all_geo_location_metadata = Object.keys(all_metadata[pid])
      .filter(f_name => f_name.startsWith("geo_loc"))
      .reduce((res, f) => {
        res[f] = all_metadata[pid][f];
        return res;
        }, {});

    let has_geo_loc_name_id = this.array_has_no_valid_val(all_geo_location_metadata['geo_loc_name_id']);
    let has_geo_loc_name = this.array_has_no_valid_val(all_geo_location_metadata['geo_loc_name']);
    let has_geo_loc_name_continental = this.array_has_no_valid_val(all_geo_location_metadata['geo_loc_name_continental']);
    let has_geo_loc_name_marine = this.array_has_no_valid_val(all_geo_location_metadata['geo_loc_name_marine']);

    if (has_geo_loc_name && !(has_geo_loc_name_continental || has_geo_loc_name_marine)) {
      if (has_geo_loc_name_id) {

        let cont = helpers.slice_object_by_keys_to_arr(MD_ENV_CNTRY, all_geo_location_metadata['geo_loc_name_id']);
        let marine = helpers.slice_object_by_keys_to_arr(MD_ENV_LZC, all_geo_location_metadata['geo_loc_name_id']);
        all_metadata[pid]['geo_loc_name_continental'] = cont;
        all_metadata[pid]['geo_loc_name_marine'] = marine;
      }
      else {// no id, but correct names: find if it is cont or marine and copy
        console.log("TODO");
      }
    //  TODO: else if only name - copy
    }
    return all_metadata[pid];
  }

  existing_object_from_form(req, res, pid, data) {
    // existing
    //add project_abstract etc.
    //TODO: DRY with other such places.

    let normal_length = data['dataset'].length;
    for (let a in data) {
      if (data[a].length < normal_length && (typeof data[a][0] !== 'undefined')) {
        data[a] = this.fill_out_arr_doubles(data[a][0], normal_length);
      }
    }
    let all_metadata         = this.make_metadata_object(req, res, pid, data); // if use this.all_metadata = wrong
    let all_field_names_orig = this.field_names.make_all_field_names(data['dataset_id']); // to names!!!
    
    //add_new
    let all_field_names_with_new = this.collect_new_rows(req, all_field_names_orig); // to names!!!

    // console.log("YYY3 all_field_names_with_new");
    // console.log(JSON.stringify(all_field_names_with_new));

    let all_field_names_first_column = this.get_first_column(all_field_names_with_new, 0); // to names!!!
    let all_new_names                = all_field_names_first_column.slice(all_field_names_first_column.indexOf("enzyme_activities") + 1); // to names!!!
    all_metadata[pid]                = this.get_new_val(req, all_metadata[pid], all_new_names);

    // req = helpers.collect_errors(req);

    // ShowObj {
    //
    //   constructor(req, res, all_metadata, all_field_names_arr,
    // done ordered_field_names_obj
    // TODO: ??? all_field_units, ordered_field_names_obj, user, hostname)

    // TODO: if from csv there is no req.body!
    let all_field_units = MD_CUSTOM_UNITS[req.body.project_id];

    const show_new = new module.exports.ShowObj(req, res, all_metadata, all_field_names_with_new, all_field_units, this.required_field_names_for_env);
    show_new.render_edit_form();
  }

  make_metadata_object(req, res, pid, data_obj) {
    // console.time('TIME: make_metadata_object');

    // let all_metadata = {};
    let dataset_ids  = DATASET_IDS_BY_PID[pid] || data_obj['dataset_id'];
    let repeat_times = dataset_ids.length;

    // 0) get field_names
    // let all_field_names = this.collect_field_names(dataset_ids);

    // 1)
    //   // TODO: don't send all_metadata?
    let all_metadata = this.all_metadata;

    //2) all

    all_metadata[pid] = data_obj;

    //3) special
    all_metadata[pid] = this.geo_loc_info(all_metadata, pid);
    const owner_id = PROJECT_INFORMATION_BY_PID[pid].oid; // TODO: already have?
    const new_project = new Project(req, res, pid, owner_id);  // TODO: already have?
    new_project.make_project_obj_with_existing_project_info_by_pid(pid);
    const project_info = new_project.project_obj;

    // TODO: move to db creation?
    // console.log('MMM33 all_metadata[pid]');
    // console.log(JSON.stringify(all_metadata[pid]));

    for (let idx in CONSTS.PROJECT_INFO_FIELDS) {
      let field_name = CONSTS.PROJECT_INFO_FIELDS[idx];

      //todo: split if, if length == dataset_ids.length - just use as is
      if ((typeof all_metadata[pid][field_name] !== 'undefined') && all_metadata[pid][field_name].length < 1) {
        all_metadata[pid][field_name] = this.fill_out_arr_doubles(all_metadata[pid][field_name], repeat_times);
      }
      else {
        all_metadata[pid][field_name] = this.fill_out_arr_doubles(project_info[field_name], repeat_times);
      }
    }
    all_metadata[pid]['project_abstract'] = this.add_project_abstract_info(new_project.project_obj, all_metadata[pid], repeat_times);
    // from submission datasets: all_metadata[pid].project_abstract = Array[3]
    //  0 = ""
    //  1 = ""
    //  2 = ""
    // from form before this.add_project_abstract_info: all_metadata[pid].project_abstract = Array[12]
    //  0 = "DCO_ORC_Orcutt_CoDL_11_02_14.pdf,DCO_BOM_Bomberg_CoDL_16_09.pdf"
    //  1 = "DCO_ORC_Orcutt_CoDL_11_02_14.pdf,DCO_BOM_Bomberg_CoDL_16_09.pdf"
    //  ...
    // from db, csv and form: all_metadata[pid].project_abstract = Array[12]
    //  0 = Array[2]
    //   0 = "DCO_ORC_Orcutt_CoDL_11_02_14.pdf"
    //   1 = "DCO_BOM_Bomberg_CoDL_16_09.pdf"
    //  ...

    // console.log('PPP project_obj.abstract_data');
    // console.log(JSON.stringify(new_project.project_obj.abstract_data));

    // from submission datasets: new_project.project_obj.abstract_data = Object
    //  pdfs = Array[0]
    // from db, form and csv:
    // new_project.project_obj.abstract_data = Object
    //  id = "11121/3482-2884-1949-7794-CC"
    //  pdfs = Array[2]
    //   0 = "DCO_ORC_Orcutt_CoDL_11_02_14.pdf"
    //   1 = "DCO_BOM_Bomberg_CoDL_16_09.pdf"
    //   length = 2
    //   __proto__ = Array[0]
    //  url = "https://deepcarbon.net/dco_project_summary?uri=http://info.deepcarbon.net/individual/n2434"

    // check_pi_name(all_metadata[pid]);

    // console.timeEnd('TIME: make_metadata_object');
    return all_metadata;
  }

  // new rows
  new_row_field_validation(req, field_name) {
    // console.time('TIME: new_row_field_validation');
    let err_msg = '';

    //todo: send a value instead of 'req.body[field_name]'?
    let field_val_trimmed   = validator.escape(req.body[field_name] + '');
    field_val_trimmed       = validator.trim(field_val_trimmed + '');
    let field_val_not_valid = validator.isEmpty(field_val_trimmed + '');

    if (field_val_not_valid) {
      console.log("ERROR: an empty user's " + field_name);
      err_msg = 'User added field "' + field_name + '" must be not empty and have only alpha numeric characters';
      req.form.errors.push(err_msg);
    }

    // console.timeEnd('TIME: new_row_field_validation');
    return field_val_trimmed;
  }

  get_column_name(row_idx, req) {
    // console.time('TIME: get_column_name');

    let units_field_name  = this.new_row_field_validation(req, 'Units' + row_idx);
    let users_column_name = this.new_row_field_validation(req, 'Column Name' + row_idx);
    if (units_field_name !== '' && users_column_name !== '') {
      return [users_column_name, units_field_name];
    }
    // console.timeEnd('TIME: get_column_name');
  }

  isUnique(all_clean_field_names_arr, column_name) {
    return (!all_clean_field_names_arr.includes(column_name));
  }

  get_cell_val_by_row(row_idx, req) {
    // console.time('TIME: get_cell_val_by_row');
    let new_row_length = req.body.new_row_length;
    let new_row_val    = [];

    for (let cell_idx = 0; cell_idx < parseInt(new_row_length); cell_idx++) {
      let cell_name = 'new_row' + row_idx.toString() + 'cell' + cell_idx.toString();
      let clean_val = validator.escape(req.body[cell_name] + '');
      clean_val     = validator.trim(clean_val + '');

      new_row_val.push(clean_val);
    }
    // console.timeEnd('TIME: get_cell_val_by_row');

    return new_row_val;
  }

  get_first_column(matrix, col) {
    // console.time('TIME: get_first_column');
    let column = [];
    for (let i = 0; i < matrix.length; i++) {
      column.push(matrix[i][col]);
    }
    // console.timeEnd('TIME: get_first_column');

    return column;
  }

  collect_new_rows(req, all_field_names) {
    // console.time('TIME: collect_new_rows');
    let new_row_num               = req.body.new_row_num;
    let all_clean_field_names_arr = helpers.unique_array(this.get_first_column(all_field_names, 0));

    for (let row_idx = 1; row_idx < parseInt(new_row_num) + 1; row_idx++) {
      let column_n_unit_names = this.get_column_name(row_idx, req);

      if (column_n_unit_names) {

        let users_column_name = column_n_unit_names[0];
        let units_field_name  = column_n_unit_names[1];
        let column_name       = users_column_name + ' (' + units_field_name + ')';
        let re                = / /g;
        let clean_column_name = users_column_name.toLowerCase().replace(re, '_') + '--UNITS--' + units_field_name.toLowerCase().replace(re, '_');


        if (column_name && this.isUnique(all_clean_field_names_arr, clean_column_name)) {
          // [ 'run', 'Sequencing run date', 'MBL Supplied', 'YYYY-MM-DD' ],
          all_field_names.push([clean_column_name, column_name, '', units_field_name]);
          req.form[clean_column_name] = [];
          req.form[clean_column_name] = this.get_cell_val_by_row(row_idx, req);
        }
        else if (!this.isUnique(all_clean_field_names_arr, clean_column_name)) {
          let err_msg = 'User added field with units "' + column_name + '" must be unique and have only alpha numeric characters';
          req.form.errors.push(err_msg);
        }
      }
    }
    // console.timeEnd('TIME: collect_new_rows');

    return all_field_names;
  }

  fill_out_arr_doubles(value, repeat_times) {
    let arr_temp = Array(repeat_times);

    arr_temp.fill(value, 0, repeat_times);

    return arr_temp;
  }

  get_pi_list() {
    console.log('FROM Metadata Controller');
    let pi_list = [];

    for (let i in ALL_USERS_BY_UID) {
      pi_list.push({
        'PI': ALL_USERS_BY_UID[i].last_name + ' ' + ALL_USERS_BY_UID[i].first_name,
        'pi_id': i,
        'last_name': ALL_USERS_BY_UID[i].last_name,
        'first_name': ALL_USERS_BY_UID[i].first_name,
        'pi_email': ALL_USERS_BY_UID[i].email
      });
    }

    pi_list.sort(function sortByAlpha(a, b) {
      return helpers.compareStrings_alpha(a.PI, b.PI);
    });

    return pi_list;
  }

  from_obj_to_obj_of_arr(data, pid, dataset_ids_in) {
    // console.time('TIME: from_obj_to_obj_of_arr');
    let obj_of_arr = {};

    let dataset_ids = DATASET_IDS_BY_PID[pid] || dataset_ids_in;

    let all_field_names = this.all_field_names;

    for (let did_idx in dataset_ids) {
      let did = dataset_ids[did_idx];
      for (let field_name_idx in all_field_names) {

        let field_name = all_field_names[field_name_idx];
        if (!(obj_of_arr.hasOwnProperty(field_name))) {
          obj_of_arr[field_name] = [];
        }
        obj_of_arr[field_name].push(data[did][field_name]);
      }
    }

    // console.log('HHH3 obj_of_arr from from_obj_to_obj_of_arr');
    // console.log(JSON.stringify(obj_of_arr));
    // adapter_sequence = [
    //   'NNNNCAGTA',
    //   'NNNNATCGA',
    //   'NNNNAGACA',
    //   null,
    //   'NNNNCAGTA',
    //   'NNNNATCGA',
    //   null,
    //   'NNNNTGATA',
    //   'NNNNTAGCA',
    //   'NNNNATATA',
    //   'NNNNTCACA',
    //   'NNNNACTAT'
    // ]
    // console.timeEnd('TIME: from_obj_to_obj_of_arr');
    return obj_of_arr;
  }

  get_dna_region(d_region_arr) {
    return d_region_arr[1].split('_')[0];
  }

  get_domain(d_region_arr) {
    return helpers.findByValueOfObject(CONSTS.DOMAIN_REGIONS.domain_regions, "domain", d_region_arr[0])[0].domain_show;
  }

  get_domain_id(domain) {
    let domain_id            = 0;
    const arr1               = CONSTS.DOMAINS.domains;
    const current_domain_obj = helpers.findByValueOfObject(arr1, 'name', domain);
    if (typeof current_domain_obj[0] !== 'undefined') {
      domain_id = current_domain_obj[0].id;
    }
    return domain_id;
  }

  get_target_gene(domain) {
    let target_gene = helpers.findByValueOfObject(CONSTS.TARGET_GENE, "domain", domain)[0].target_gene;
    // if (typeof target_gene === "object" && target_gene.length > 1) {
    //
    // }
    return target_gene;
  }

  // TODO: refactor: JSHint: This function's cyclomatic complexity is too high. (9) (W074)
  create_all_metadata_form_new(all_field_names, project_obj) {
    // console.time('TIME: create_all_metadata_form_new');

    let req = this.req;
    let pid = project_obj.pid;
    console.log('DDD pid', pid);
    let d_region_arr = [];
    if ((typeof req.form !== "undefined") && (typeof req.form.d_region !== "undefined")) {
      d_region_arr = req.form.d_region.split('#');
    }
    // console.log('DDD3, all_field_names', JSON.stringify(all_field_names));

    // move to Names
    let more_fields = ['adapter_sequence_id', // TODO: clarify, why here and what for
      'dataset_description',
      'dataset_id',
      'dna_region_id',
      'domain_id',
      'env_biome_id',
      'env_feature_id',
      'env_material_id',
      'env_package_id',
      'geo_loc_name_id',
      'illumina_index_id',
      'primer_suite_id',
      'run_id',
      'sequencing_platform_id',
      'target_gene_id',
      'tube_label',
      'sample_num'];

    // move to Names
    all_field_names = helpers.unique_array(all_field_names.concat(more_fields));

    // console.log('DDD3_1, all_field_names', JSON.stringify(all_field_names)); // cond1

    this.prepare_empty_metadata_object(pid, all_field_names, {});
    let repeat_times = parseInt(req.form.samples_number, 10) || parseInt(req.form.dataset.length, 10);
    let current_info = Object.assign(project_obj);

    const brand_new_project_not_in_db = (d_region_arr.length > 0);
    if (brand_new_project_not_in_db) {
      current_info.domain      = this.get_domain(d_region_arr);
      current_info.dna_region  = this.get_dna_region(d_region_arr);
      current_info.target_gene = this.get_target_gene(current_info.domain);
      current_info.domain_id   = this.get_domain_id(current_info.domain);
    }

    let all_metadata = this.all_metadata;
    if (typeof all_metadata[pid] === 'undefined') {
      all_metadata[pid] = {};
    }

    for (let i = 0; i < all_field_names.length; i++) {
      let field_name = all_field_names[i];
      let val        = current_info[field_name] || '';
      if (typeof current_info[field_name] !== 'undefined') {
        all_metadata[pid][field_name] = [current_info[field_name]];
      }

      //todo: split if, if length == dataset_ids.length - just use as is
      let field_has_value = ((typeof all_metadata[pid] !== 'undefined') && (typeof all_metadata[pid][field_name] !== 'undefined') && all_metadata[pid][field_name].length < 1);
      if (field_has_value) {
        all_metadata[pid][field_name] = this.fill_out_arr_doubles(all_metadata[pid][field_name], repeat_times);
      }
      else {
        all_metadata[pid][field_name] = this.fill_out_arr_doubles(val, repeat_times);
      }
    }

    all_metadata[pid].sample_num = Array.from(new Array(repeat_times), (val, index) => index + 1);

    all_metadata[pid]['project_abstract'] = this.add_project_abstract_info(project_obj, repeat_times);

    // console.timeEnd('TIME: create_all_metadata_form_new');

    console.log("DDD11: ", JSON.stringify(all_metadata));
    return all_metadata;

  }

  get_new_val(req, all_metadata_pid, all_new_names) {
    let new_val = [];
    for (let new_name_idx in all_new_names) {
      let new_name = all_new_names[new_name_idx];
      if (new_name !== '') {
        new_val = req.body[new_name];
      }
      if (typeof new_val !== 'undefined' && new_val.length !== 0) {
        all_metadata_pid[new_name] = new_val;
      }
    }
    return all_metadata_pid;
  }

  get_all_req_metadata(dataset_id) {
    // console.time('TIME: 5) get_all_req_metadata');
    let fail_msg = [];
    let data = {};
    for (let idx = 0; idx < CONSTS.REQ_METADATA_FIELDS_wIDs.length; idx++) {
      let key      = CONSTS.REQ_METADATA_FIELDS_wIDs[idx];
      // data[key] = [];
      if (typeof AllMetadata[dataset_id] === 'undefined' )
      {
        console.log('There is no ' + key + ' metadata for dataset_id = ' + dataset_id + ' in metadataController.get_all_req_metadata');
        fail_msg.push('Missing required metadata for dataset ' + DATASET_NAME_BY_DID[dataset_id] + ': ' + key);
        data[key] = [];
      }
      else {
        let val_hash = helpers.required_metadata_names_from_ids(AllMetadata[dataset_id], key + '_id');
        data[key] = val_hash.value;
      }
    }
    // console.time('TIME: 5) get_all_req_metadata');

    return {'data': data, 'fail_msg': fail_msg};
  }

  // This function cyclomatic complexity is too high (9)
  get_primers_info(dataset_id) {
    // console.time('TIME: get_primers_info');
    let primer_info = {
      'F': [],
      'R': [],
    };
    let primer_suite_id;

    if (typeof AllMetadata[dataset_id] !== 'undefined') {
      primer_suite_id = AllMetadata[dataset_id]['primer_suite_id'];
    }
    else {
      return primer_info;
    }

    // when it's here?
    if (typeof primer_suite_id === 'undefined' ||
      typeof MD_PRIMER_SUITE[primer_suite_id] === 'undefined' ||
      typeof MD_PRIMER_SUITE[primer_suite_id].primer === 'undefined') {
      console.log("In get_primers_info primer_suite_id second if");

      return primer_info;
    }
    else {

      console.log("In get_primers_info primer_suite_id second if/else");

      try {
        for (let i = 0; i < MD_PRIMER_SUITE[primer_suite_id].primer.length; i++) {

          let curr_direction = MD_PRIMER_SUITE[primer_suite_id].primer[i].direction;

          const primer_info_curr_direction_is_empty = helpers.is_empty(primer_info[curr_direction]);

          if (typeof primer_info[curr_direction] === 'undefined' || primer_info_curr_direction_is_empty) {
            primer_info[curr_direction] = [];
          }

          primer_info[curr_direction].push(MD_PRIMER_SUITE[primer_suite_id].primer[i].sequence);
        }
      } catch (err) {
        // Handle the error here.
        return {};
      }

    }
    // console.log('DDD primer_info');
    // console.log(JSON.stringify(primer_info));
    // {'F':['CCTACGGGAGGCAGCAG','CCTACGGG.GGC[AT]GCAG','TCTACGGAAGGCTGCAG'],'R':['GGATTAG.TACCC']}

    // console.timeEnd('TIME: get_primers_info');
    return primer_info;
  }

  saveDataset(req, project_id) {
    // console.log('TTT1 req.form from saveDataset = ', req.form);
    //dataset_id, dataset, dataset_description, project_id, created_at, updated_at,

    let dataset_obj                 = {};
    dataset_obj.dataset_id          = 0;
    dataset_obj.dataset             = req.form.dataset_name;
    dataset_obj.dataset_description = req.form.dataset_description;
    dataset_obj.project_id          = project_id;
    dataset_obj.created_at          = new Date();
    dataset_obj.updated_at          = new Date();

    // console.log('OOO1 JSON.stringify(dataset_obj) = ', JSON.stringify(dataset_obj));
  }

  make_new_project_for_form(project_obj) {

    let all_field_names = this.all_field_names;

    // TODO: move to field_names?
    let all_field_names4 = helpers.slice_object_by_keys_to_arr(CONSTS.ORDERED_METADATA_NAMES_OBJ, CONSTS.CORRECT_ORDER_FOR_NEW_DATASETS_FORM);

    let all_metadata = this.create_all_metadata_form_new(all_field_names, project_obj);
    // all_metadata = { '485':
    //     { project: [ 'MS_AAA_EHSSU', 'MS_AAA_EHSSU', 'MS_AAA_EHSSU' ],
    //       dataset: ['', '', ''],
    //       sample_name: ['', '', ''],
    //       investigation_type: ['', '', ''],
    //       domain: ['', '', ''],
    //       first_name: [ 'Mohammadkarim', 'Mohammadkarim', 'Mohammadkarim' ],
    // module.exports.render_edit_form(req, res, all_metadata, all_field_names4);

    let all_field_units = MD_CUSTOM_UNITS[project_obj.pid];

    let show_new = new module.exports.ShowObj(this.req, this.res, all_metadata, all_field_names4, all_field_units, this.required_field_names_for_env);
    show_new.render_edit_form();
  }

  project_already_in_db(req, res, rows, new_project) {
    let project_obj        = new_project.project_obj;
    // console.log("rows project_id?");
    project_obj.project_id = this.pid;
    project_obj.pid        = this.pid;
    new_project.add_info_to_project_globals(project_obj, this.pid);

    this.make_new_project_for_form(project_obj);
  }

  req_form_isValid_and_new_project(req, res, new_project) {
    const project_obj = new_project.project_obj;

    // console.log('OOO1 JSON.stringify(project_obj) = ', JSON.stringify(project_obj));
    new_project.addProject(project_obj, function (err, rows) {
        // console.time("TIME: in post /metadata_new, add project");
        if (err) {
          // console.log('WWW0 err', err);
          req.flash('fail', err);
          const met_obj  = new module.exports.CreateDataObj(req, res, 0, []);
          // console.log("AAALLL3 met_obj.all_field_names4");
          // console.log(met_obj.all_field_names4.filter(function(item){return item === "conductivity"}));

          const show_new = new module.exports.ShowObj(req, res, met_obj.all_metadata, met_obj.all_field_names4, met_obj.all_field_units, met_obj.required_field_names_for_env);
          show_new.show_metadata_new_again(req, res);
        }
        else {
          console.log('New project SAVED');
          // console.log('WWW rows', rows);
          const pid = rows.insertId;
          new_project.add_info_to_project_globals(project_obj, pid);
          const met_obj = new module.exports.CreateDataObj(req, res, pid, []);
          met_obj.make_new_project_for_form(project_obj);
        }
        // console.timeEnd("TIME: in post /metadata_new, add project");
      }
    );
  }

  unify_us_names(curr_country_in) {
    let curr_country_out = [];
    try {
      let curr_country_out = curr_country_in.slice();
      for (let n in curr_country_in) {
        let diff_spelling = "";
        diff_spelling = helpers.geo_loc_name_continental_filter(curr_country_in[n]);
        if (typeof diff_spelling !== 'undefined') {
          curr_country_out[n] = diff_spelling;
        }
      }
    }
    catch (err) {
      console.warn("No geo_loc_name?!");
    }

    return curr_country_out;
  }

  clean_up_metadata_new_form() {
    let metadata_new_form_vals = {};
    for (let i in this.metadata_new_form_fields) {
      metadata_new_form_vals[this.metadata_new_form_fields[i]] = "";
    }
    return metadata_new_form_vals;
  }

  get_user_name_from_new_type_csv(req, transposed) {
    let pi_name_exists = helpers.check_for_undefined0(req, transposed['pi_name'], "Please check PI name in the CSV");
    if (pi_name_exists) {
      let pi_name                 = transposed['pi_name'][0];
      let [first_name, last_name] = pi_name.split(" ");
      return [first_name, last_name];
    }
    else {
      return ["", ""]; //TODO: stop and show error or write into log
    }
  }

  get_email_from_new_type_csv(req, transposed) {
    let email = "";
    let email_exists = helpers.check_for_undefined0(req, transposed['pi_email'], "Please check PI email in the CSV");

    if (email_exists) {
      email = transposed['pi_email'][0];
    }
    return email;
  }

  get_institution_from_new_type_csv(req, transposed) {
    let pi_institution_exists = helpers.check_for_undefined0(req, transposed['pi_institution'], "Please check PI institution in the CSV");

    let institution = "";
    if (pi_institution_exists) {
      institution = transposed['pi_institution'][0];
    }
    return institution;
  }

  get_owner_id_with_new_type_csv(req, transposed, this_user) {
    const [first_name, last_name] = this.get_user_name_from_new_type_csv(req, transposed);

    let email = this.get_email_from_new_type_csv(req, transposed);
    let institution = this.get_institution_from_new_type_csv(req, transposed);

    this_user.getUserInfoFromGlobalbyUniqKey(first_name, last_name, email, institution);
    let owner_id = this_user.User_obj.user_id;
    return owner_id;
  }

  get_curr_country_from_new_type_csv(transposed) {
    const curr_country = this.unify_us_names(transposed["geo_loc_name_continental"]);
    transposed["geo_loc_name_continental"] = curr_country;
    return transposed;
  }
}

class ShowObj {

  constructor(req, res, all_metadata, all_field_names_arr, all_field_units, required_fields) {
    this.req                     = req;
    this.res                     = res;
    this.field_names             = new module.exports.FieldNames(this.req);
    this.all_metadata            = all_metadata;
    this.all_field_names_arr     = all_field_names_arr;
    this.all_field_units         = all_field_units || [];
    this.hostname                = req.CONFIG.hostname;
    this.user                    = req.user;
    this.required_fields         = this.get_required_fields(required_fields);
  }

  get_required_fields(required_fields_from_args){
    let required_fields_out = required_fields_from_args;
    let obj_is_empty = helpers.is_empty(required_fields_from_args);
    if (obj_is_empty)
    {
      required_fields_out = CONSTS.METADATA_FORM_REQUIRED_FIELDS;
    }
    return required_fields_out;
  }

  get_initials(arr) {
    let inits_len     = arr.length;
    let project_name1 = '';
    for (let i = 0; i < inits_len; i++) {
      project_name1 = project_name1 + arr[i][0];
    }
    return project_name1;
  }

  get_mbl_edit() {
    let mbl_edit = "no_edit";
    let is_outer_user = (this.req.user.security_level > 10);
    if (!is_outer_user) {
      mbl_edit = "can_edit";
    }
    return mbl_edit;
  }

  write_csv(pid) {
    let mbl_edit = this.get_mbl_edit();
    let has_datasets = (typeof DATASET_IDS_BY_PID[pid] !== 'undefined') && (DATASET_IDS_BY_PID[pid].length > 0);
    let form_exists = (typeof this.req.form !== 'undefined');
    if (has_datasets && (this.req.url !== "/metadata_new_csv_upload") && form_exists) {
      const csv_files_obj = new csv_files_controller.CsvFilesWrite(this.req, this.res);
      csv_files_obj.create_metadata_project_csv(this.req);

      if (mbl_edit === "can_edit") {
        csv_files_obj.make_csv_to_upload_to_pipeline(this.req);
      }
    }
  }

  render_edit_form() {
    // console.trace("Show me, I'm in render_edit_form");
    this.req = helpers.collect_errors(this.req);
    const mbl_edit = this.get_mbl_edit();

    // console.log('JJJ1 all_metadata from render_edit_form');
    // console.log(JSON.stringify(this.all_metadata));

    const target_gene_options = this.get_target_gene_options();
    const adapt_3letter_options = this.get_options_from_global_obj(MD_3LETTER_ADAPTER);

    const country_options = this.get_options_from_global_obj(MD_ENV_CNTRY);
    const marine_zone_options = this.get_options_from_global_obj(MD_ENV_LZC);

    const pid = Object.keys(this.all_metadata)[0] || this.req.body.project_id;

    this.write_csv(pid);

    const all_field_units = this.all_field_units || MD_CUSTOM_UNITS[pid] || {};
    const env_package_options = Object.keys(CONSTS.PACKAGES_AND_PORTALS);

    const ordered_field_names_obj = this.field_names.make_ordered_field_names_obj(this.all_field_names_arr);

    this.res.render('metadata/metadata_edit_form', {
      title: 'VAMPS: Metadata_upload',
      user: this.user,
      hostname: this.hostname,
      all_field_names: this.all_field_names_arr,
      all_field_units: all_field_units,
      all_metadata: this.all_metadata,
      button_name: "Save",
      dividers: CONSTS.ORDERED_METADATA_DIVIDERS,
      mbl_edit: mbl_edit,
      metadata_form_required_fields: this.required_fields,
      ordered_field_names_obj: ordered_field_names_obj,
      //options:
      adapt_3letter_options: adapt_3letter_options,
      biome_primary_options: CONSTS.BIOME_PRIMARY,
      country_options: country_options,
      dna_extraction_options: CONSTS.MY_DNA_EXTRACTION_METH_OPTIONS,
      dna_quantitation_options: CONSTS.DNA_QUANTITATION_OPTIONS,
      env_package_options: env_package_options, //DCO_ENVIRONMENTAL_PACKAGES,
      feature_primary_options: CONSTS.FEATURE_PRIMARY,
      investigation_type_options: CONSTS.INVESTIGATION_TYPE,
      marine_zone_options: marine_zone_options,
      material_primary_options: CONSTS.MATERIAL_PRIMARY,
      sample_type_options: CONSTS.SAMPLE_TYPE,
      target_gene_options: target_gene_options
    });
  }

  get_options_from_global_obj(g_obj) {
    let options_arr = [];
    options_arr = Object.keys(g_obj).map((k) => g_obj[k]).sort();
    return ["Select..."].concat(options_arr);
  }

  get_target_gene_options() {
    let arr1 = CONSTS.TARGET_GENE.map(function (t) {
      return [].concat(t.target_gene);
    });
    arr1     = helpers.unique_array(helpers.flat_array(arr1));
    return ["Select..."].concat(arr1);
  }

  make_metadata_new_form_values(req) {
    let metadata_new_form_values = {};
    metadata_new_form_values.project_name     = "";
    metadata_new_form_values.pi_name_reversed = "";
    metadata_new_form_values.project_name1    = "";
    metadata_new_form_values.project_name2    = "";
    metadata_new_form_values.project_name3    = "";
    metadata_new_form_values.d_region            = req.form.d_region;
    metadata_new_form_values.funding_code        = req.form.funding_code;
    metadata_new_form_values.pi_id_name          = req.form.pi_id_name;
    metadata_new_form_values.package             = req.form.package;
    metadata_new_form_values.project_description = req.form.project_description;
    metadata_new_form_values.project_title       = req.form.project_title;
    metadata_new_form_values.reference           = req.form.reference;
    metadata_new_form_values.samples_number      = req.form.samples_number;

    let d_region_arr   = req.form.d_region.split('#');
    let pi_id_name_arr = req.form.pi_id_name.split('#');
    if (!pi_id_name_arr.includes("")) {
      metadata_new_form_values.full_name        = pi_id_name_arr[3] + ' ' + pi_id_name_arr[2];
      metadata_new_form_values.pi_email         = pi_id_name_arr[4];
      metadata_new_form_values.pi_name_reversed = pi_id_name_arr[2] + ' ' + pi_id_name_arr[3];
      metadata_new_form_values.project_name1    = req.form.project_name1;

      let full_name_arr = metadata_new_form_values.full_name.split(' ');
      if (metadata_new_form_values.project_name1 === '') {
        metadata_new_form_values.project_name1  = this.get_initials(full_name_arr);
      }

      metadata_new_form_values.project_name2 = req.form.project_name2;
      metadata_new_form_values.project_name3 = d_region_arr[2];
      metadata_new_form_values.project_name  = metadata_new_form_values.project_name1 + '_' + req.form.project_name2 + '_' + metadata_new_form_values.project_name3;
    }
    return metadata_new_form_values;
  }

  show_metadata_new_again(req, res) {
    // TODO: send to object creation in Imp
    let metadata_new_form_values = this.make_metadata_new_form_values(req);

    req      = helpers.collect_errors(req);
    this.req = req;

    //TODO: move all renders to route_metadata
    res.render('metadata/metadata_new', {
      // TODO: object created separately in Imp.
      // TODO just use form
      button_name: 'Validate',
      domain_regions: CONSTS.DOMAIN_REGIONS,
      hostname: req.CONFIG.hostname,
      metadata_new_form_values: metadata_new_form_values,
      packages_and_portals: Object.keys(CONSTS.PACKAGES_AND_PORTALS),
      pi_list: req.session.pi_list,
      title: 'VAMPS: New Metadata',
      user: req.user,
    });
  }

}

class FieldNames {
  // collect all known
  // add new
  // filter by env
  // order for existing and new datasets
  // get required

  constructor(req, dataset_ids) {
    this.dataset_ids = dataset_ids || [];
    this.all_field_names = this.collect_field_names();
    let field_names_by_env = this.filter_field_names_by_env(req);
    this.required_field_names_for_env = this.env_req_filters(field_names_by_env);
    this.metadata_new_form_fields = CONSTS.METADATA_NEW_FORM_FIELDS;

  }

  // collect all known
  collect_field_names() {
    let all_field_names = this.get_field_names_by_dataset_ids(this.dataset_ids);
    all_field_names     = all_field_names.concat(CONSTS.METADATA_FORM_REQUIRED_FIELDS);
    all_field_names     = all_field_names.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
    all_field_names     = all_field_names.concat(CONSTS.PROJECT_INFO_FIELDS);
    all_field_names     = all_field_names.concat(CONSTS.METADATA_NAMES_ADD);

    all_field_names = helpers.unique_array(all_field_names);
    return all_field_names;
  }

  make_all_field_names(dataset_ids) {
    // why get_field_names_by_dataset_ids again? 1) substract METADATA_NAMES_SUBSTRACT, 2) substract '_id', 3) substract CONSTS.CORRECT_ORDER_FOR_EXISTING_DATASETS_FORM
    let structured_field_names0 = this.get_field_names_by_dataset_ids(dataset_ids);

    let diff_names = structured_field_names0.filter(x => !CONSTS.METADATA_NAMES_SUBSTRACT.includes(x));

    diff_names = diff_names.filter(function (item) {
      return /^((?!_id).)*$/.test(item);
    });

    diff_names = diff_names.filter(x => !CONSTS.CORRECT_ORDER_FOR_EXISTING_DATASETS_FORM.includes(x));

    let big_arr_diff_names = this.make_array4(diff_names);

    // console.time('TIME: ordered_existing');

    let ordered_existing = helpers.slice_object_by_keys_to_arr(CONSTS.ORDERED_METADATA_NAMES_OBJ, CONSTS.CORRECT_ORDER_FOR_EXISTING_DATASETS_FORM);

    let big_arr4 = helpers.unique_array(ordered_existing.concat(big_arr_diff_names));

    // console.timeEnd('TIME: ordered_existing');
    // console.log('MMM11 big_arr4');
    // console.log(JSON.stringify(big_arr4));

    return big_arr4;
  }

  // filter by env
  unify_env_name(env_package) {
    let re1               = / /gi;
    let re2               = /-/gi;
    let re3               = /\//gi;
    let env_package_unified_name = env_package.toLowerCase().replace(re1, '_').replace(re2, '_').replace(re3, '_');
    return env_package_unified_name;
  }

  get_fields_by_env(env_package) {
    let env_package_unified_name = this.unify_env_name(env_package);
    return CONSTS.FIELDS_BY_ENV[env_package_unified_name];
  }

  get_env_proper_name(env_package) {
    let name = "";
    let obj_name = CONSTS.PACKAGES_AND_PORTALS_ALIASES;
    let unified_name = this.unify_env_name(env_package);
    for (let key in obj_name) {
      let value_arr = obj_name[key];
      if (value_arr.includes(unified_name)) {
        name = key;
        break;
      }
    }
    return name;
  }

  filter_field_names_by_env(req) {
    // console.log(req.body);

    let req_body_exists = ((typeof req.body !== 'undefined') && (typeof req.body.package !== 'undefined')) ;
    let req_form_exists = ((typeof req.form !== 'undefined') && (typeof req.form.package !== 'undefined'));
    let env_package = "unknown";
    let proper_env_name = env_package;
    let field_names = [];
    if (req_body_exists || req_form_exists) {
      env_package = req.body.package || req.form.package;
      proper_env_name = this.get_env_proper_name(env_package);
      field_names = this.get_fields_by_env(env_package);
    }
    return field_names;
  }

  env_req_filters(field_names_by_env) {
    console.log("In env_req_filters");
    let required_names = [];
    for (let i in field_names_by_env) {
      let current_field_name = field_names_by_env[i];
      if (current_field_name.includes("*")) {
        let cleaned_f_name = current_field_name.replace("*", "");
        required_names.push(cleaned_f_name); // TODO: check if name exists in CONSTS
      }
    }
    return required_names;
  }

  // filter by dataset_id
  get_field_names_by_dataset_ids() {

    let field_names_arr = [];

    field_names_arr = field_names_arr.concat(Object.keys(MD_CUSTOM_FIELDS_UNITS));
    for (let i = 0; i < this.dataset_ids.length; i++) {
      let dataset_id = this.dataset_ids[i];
      if (typeof AllMetadata[dataset_id] !== 'undefined') {
        field_names_arr = field_names_arr.concat(Object.keys(AllMetadata[dataset_id]));
      }
    }
    field_names_arr = helpers.unique_array(field_names_arr); // one level
    field_names_arr.sort();

    return field_names_arr;
//  [
//   'access_point_type',
//   'adapter_sequence',
//   'adapter_sequence_id',
// ...
  }

  //  from Show!
  make_ordered_field_names_obj(all_field_names_arr4) {
    //[ 'biomass_wet_weight', 'Biomass - wet weight', '', 'gram' ],
    // console.time('TIME: make_ordered_field_names_obj');
    let temp_all_field_names_ordered = all_field_names_arr4.map(function (field_name_arr){
      return field_name_arr[0] === "" ? field_name_arr[1] : field_name_arr[0];
    });

    const ordered_field_names_obj = helpers.slice_object_by_keys(CONSTS.ORDERED_METADATA_NAMES_OBJ, temp_all_field_names_ordered);

    // console.timeEnd('TIME: make_ordered_field_names_obj');
    return ordered_field_names_obj;
  }

  // misc

  make_array4(field_names_arr) {
// make a 2D array: [field_names_arr[i2], field_names_arr[i2], '', '']
    let new_arr = [];
    for (let i2 = 0; i2 < field_names_arr.length; i2++) {
      let temp_arr = [field_names_arr[i2], field_names_arr[i2], '', ''];
      new_arr.push(temp_arr);
    }
    return new_arr;
  }

}

// export the class
module.exports = {
  CreateDataObj: CreateDataObj,
  ShowObj: ShowObj,
  FieldNames: FieldNames
};
