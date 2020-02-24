const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries');
const C       = require(app_root + '/public/constants');

class GlobalVars {
  constructor() {
  }

  sort_AllMetadataNames() {
    C.AllMetadataNames.sort((a, b) => {
      return helpers.compareStrings_alpha(a, b);
    });
  }

  make_all_datasets(datasetsByProject, pids, titles) {
    C.ALL_DATASETS.projects = Object.keys(datasetsByProject).reduce((prjs, p) => {
      let tmp = {};
      tmp.name = p;
      tmp.pid = pids[p];
      tmp.title = titles[p];
      tmp.datasets = datasetsByProject[p].reduce((datasets, d_obj) => {
        let temp_datasets_obj = {
          did: d_obj.did,
          dname: d_obj.dname,
          ddesc: d_obj.ddesc
        };
        return datasets.concat(temp_datasets_obj);
      }, []);
      return prjs.concat(tmp);
    }, []);
  }

  // This function's cyclomatic complexity is too high. (6)(W074)
  get_DatasetsWithLatLong(mdname, did) {
    let isLatitude = (mdname === 'latitude' && !isNaN(C.AllMetadata[did].latitude));
    let isLongitude = (mdname === 'longitude' && !isNaN(C.AllMetadata[did].longitude));

    if (isLatitude || isLongitude) {
      if (!(did in C.DatasetsWithLatLong)) {
        C.DatasetsWithLatLong[did] = {};
        let pname = C.PROJECT_INFORMATION_BY_PID[C.PROJECT_ID_BY_DID[did]].project;
        C.DatasetsWithLatLong[did].proj_dset = pname + '--' + C.DATASET_NAME_BY_DID[did];
        C.DatasetsWithLatLong[did].pid = C.PROJECT_ID_BY_DID[did];
      }
      switch (mdname) {
        case 'latitude':
          C.DatasetsWithLatLong[did].latitude = +C.AllMetadata[did].latitude;
          break;
        case 'longitude':
          C.DatasetsWithLatLong[did].longitude = +C.AllMetadata[did].longitude;
          break;
      }
    }
  }

  make_AllMetadataNames(mdname) {
    if (!C.AllMetadataNames.includes(mdname)) {
      C.AllMetadataNames.push(mdname);
    }
  }

  get_AllMetadataNames_n_clean_metadata() {
    let clean_metadata = {};
    for (let did in C.AllMetadata) {
      if (did in C.DATASET_NAME_BY_DID) {
        clean_metadata[did] = C.AllMetadata[did];
        for (let mdname in C.AllMetadata[did]) {
          this.make_AllMetadataNames(mdname);
          this.get_DatasetsWithLatLong(mdname, did);
        }
      }
    }
  }

  init_dataset_ids_by_pid(pid) {
    if (!C.DATASET_IDS_BY_PID.hasOwnProperty(pid)) {
      C.DATASET_IDS_BY_PID[pid] = [];
    }
  }

  add_to_datasetsByProject(datasetsByProject, project, dataset_options) {
    if (datasetsByProject.hasOwnProperty(project)) {
      datasetsByProject[project].push(dataset_options);
    } else {
      datasetsByProject[project] = [dataset_options];
    }
    return datasetsByProject;
  }

  get_envpkgid(did) {
    let envpkgid = '1';
    if (C.AllMetadata.hasOwnProperty(did) && C.AllMetadata[did].hasOwnProperty('env_package_id')) {
      envpkgid = C.AllMetadata[did].env_package_id;
    }
    return envpkgid;
  }

  get_project_information_by_pid(current_row) {
    let pid = current_row.pid;
    let project = current_row.project;
    let did = current_row.did;

    let envpkgid = this.get_envpkgid(did);

    let ca = helpers.convertJSDateToString(current_row.created_at);
    let ua = helpers.convertJSDateToString(current_row.updated_at);

    let owner_id = current_row.owner_user_id;
    C.PROJECT_INFORMATION_BY_PID[pid] = {
      "last": current_row.last_name,
      "first": current_row.first_name,
      "username": current_row.username,
      "oid": owner_id,
      "email": current_row.email,
      "env_package_id": envpkgid,  // FROM AllMetadata: mostly used here for the filter on dataset selection page
      "institution": current_row.institution,
      "project": project,
      "pid": pid,
      "title": current_row.title,
      "description": current_row.project_description,
      "public": current_row.public,
      "metagenomic": current_row.metagenomic,
      "matrix": current_row.matrix,
      //"seqs_available" :   current_row.seqs_available,
      "created_at": ca,
      "updated_at": ua
    };
    if (current_row.public || current_row.username === 'guest') {
      C.PROJECT_INFORMATION_BY_PID[pid].permissions = [];  // PUBLIC
    } else {
      C.PROJECT_INFORMATION_BY_PID[pid].permissions = [owner_id]; // initially has only project owner_id
    }
  }

  run_permissions_query(rows) {
    //console.log(PROJECT_INFORMATION_BY_PID)

    for (let i in rows) {
      let current_row = rows[i];
      let pid = current_row.project_id;
      let uid = current_row.user_id;

      if (pid in C.PROJECT_INFORMATION_BY_PID) {
        let project                           = C.PROJECT_INFORMATION_BY_PID[pid].project;
        C.PROJECT_INFORMATION_BY_PNAME[project] = C.PROJECT_INFORMATION_BY_PID[pid];
        if (C.PROJECT_INFORMATION_BY_PID[pid].username === 'guest') {
          C.PROJECT_INFORMATION_BY_PID[pid].permissions = [];
        }
        else {
          if (!C.PROJECT_INFORMATION_BY_PID[pid].permissions.includes(uid)) {
            C.PROJECT_INFORMATION_BY_PID[pid].permissions.push(uid);
          }
        }
      }
    }
  }

  run_select_datasets_query(rows) {
    let pids = {};
    let titles = {};
    let datasetsByProject = {};
    for (let i = 0; i < rows.length; i++) {
      let current_row = rows[i];
      let project = current_row.project;
      if (project === undefined) {
        continue;
      }
      let pid = current_row.pid;

      this.init_dataset_ids_by_pid(pid);

      let did = current_row.did;
      let no_did = [undefined, 'null', null];
      if (!no_did.includes(did)) {
        let dataset = current_row.dataset;
        let dataset_description = current_row.dataset_description;
        C.PROJECT_ID_BY_DID[did] = pid;
        C.DATASET_NAME_BY_DID[did] = dataset;
        let dataset_options = {did: did, dname: dataset, ddesc: dataset_description};
        datasetsByProject = this.add_to_datasetsByProject(datasetsByProject, project, dataset_options);
        C.DATASET_IDS_BY_PID[pid].push(did);
      }

      if (!C.PROJECT_INFORMATION_BY_PID.hasOwnProperty(pid)) {
        this.get_project_information_by_pid(current_row);
        C.PROJECT_INFORMATION_BY_PNAME[project] = C.PROJECT_INFORMATION_BY_PID[pid];

        pids[project] = pid;
        titles[project] = current_row.title;
      }
    }
    this.make_all_datasets(datasetsByProject, pids, titles);
    console.log('Getting md-names and those w/ lat/lon');
    this.get_AllMetadataNames_n_clean_metadata();
    this.sort_AllMetadataNames();

    connection.query(queries.get_project_permissions(), (err, rows) => {
      //console.log(qSequenceCounts)
      if (err) {
        console.log('Query error: ' + err);
        console.log(err.stack);
        process.exit(1);
      } else {
        this.run_permissions_query(rows);
      }

      console.log(' UPDATING PERMISSIONS: "' + queries.get_project_permissions() + '"');
    });
  }

  make_pid_by_did_dict(rows) {
    let p_d = [];
    for (let r in rows) {
      let d_id = rows[r]['dataset_id'];
      p_d[d_id] = rows[r]['project_id'];
    }
    return p_d;
  }

//add the same check to PROJECT_ID_BY_DID creation elsewhere
  get_select_seq_counts_query(rows) {
    // console.time("TIME: get_select_seq_counts_query");
    // console.log(Object.values(PROJECT_ID_BY_DID));
    connection.query('SELECT dataset_id, project_id from dataset', (err, rows2) => {

      // console.time("TIME: make_pid_by_did_dict");
      //instead it's better to use PROJECT_ID_BY_DID after it's initialized
      let pid_by_did_dict = [];
      if (Object.keys(C.PROJECT_ID_BY_DID).length > 0) {
        pid_by_did_dict = C.PROJECT_ID_BY_DID;
      } else {
        pid_by_did_dict = this.make_pid_by_did_dict(rows2);
      }
      // console.timeEnd("TIME: make_pid_by_did_dict");

      for (let i = 0; i < rows.length; i++) {
        let did = rows[i].dataset_id;
        let pid = pid_by_did_dict[did];
        //console.log('rows[i].project_id in run_select_sequences_query');
        // let pid                 = rows[i].project_id;
        let count = rows[i].seq_count;
        let cid = rows[i].classifier_id;
        C.ALL_DCOUNTS_BY_DID[did] = parseInt(count);
        if (C.ALL_CLASSIFIERS_BY_CID.hasOwnProperty(cid)) {
          C.ALL_CLASSIFIERS_BY_PID[pid] = C.ALL_CLASSIFIERS_BY_CID[cid];
        }
        if (pid in C.ALL_PCOUNTS_BY_PID) {
          C.ALL_PCOUNTS_BY_PID[pid] += parseInt(count);
        } else {
          C.ALL_PCOUNTS_BY_PID[pid] = parseInt(count);
        }
      }
      // console.log("ALL_PCOUNTS_BY_PID: ");
      // console.log(C.ALL_PCOUNTS_BY_PID);
      // make_counts_globals(rows, pid_by_did_dict);

    });
    // console.timeEnd("TIME: get_select_seq_counts_query");

  }

  get_select_custom_units_query(rows) {
    // console.time("TIME: get_select_custom_units_query");
    for (let i = 0; i < rows.length; i++) {
      let project_id  = rows[i]["project_id"];
      let field_name  = rows[i]["field_name"];
      let field_units = rows[i]["field_units"];

      if (!C.MD_CUSTOM_UNITS.hasOwnProperty(project_id)) {
        C.MD_CUSTOM_UNITS[project_id] = {};
      }
      C.MD_CUSTOM_UNITS[project_id][field_name] = field_units;

      if (!C.MD_CUSTOM_FIELDS_UNITS.hasOwnProperty(field_name)) {
        C.MD_CUSTOM_FIELDS_UNITS[field_name] = {};
      }
      C.MD_CUSTOM_FIELDS_UNITS[field_name] = field_units;
    }
    // console.timeEnd("TIME: get_select_custom_units_query");
  }

  // TODO: "This function's cyclomatic complexity is too high. (6)"
  // TODO: how to test?
  update_global_variables(pid, type) {
    if (type === 'del') {
      let dids  = C.DATASET_IDS_BY_PID[pid];
      let pname = C.PROJECT_INFORMATION_BY_PID[pid].project;
      console.log('RE-INTIALIZING C.ALL_DATASETS');
      let dataset_objs = [];
      for (let i in C.ALL_DATASETS.projects) {
        let item = C.ALL_DATASETS.projects[i];
        //console.log('item'+item);
        // {"name":"142","pid":105,"title":"Title","datasets":[{"did":496,"dname":"142_ds","ddesc":"142_ds_description"}]
        if (item.pid === pid) {
          dataset_objs = item.datasets;
          //console.log('SPLICING '+pid);
          C.ALL_DATASETS.projects.splice(i, 1);
          break;
        }
      }
      console.log('RE-INTIALIZING C.PROJECT_ID_BY_DID');
      console.log('RE-INTIALIZING C.DATASET_NAME_BY_DID');
      console.log('RE-INTIALIZING C.ALL_DCOUNTS_BY_DID');
      for (let d in dids) {
        delete C.PROJECT_ID_BY_DID[dids[d]];
        delete C.DATASET_NAME_BY_DID[dids[d]];
        delete C.ALL_DCOUNTS_BY_DID[dids[d]];
        delete C.DatasetsWithLatLong[dids[d]];
      }
      console.log('RE-INTIALIZING C.PROJECT_INFORMATION_BY_PID');
      console.log('RE-INTIALIZING C.DATASET_IDS_BY_PID');
      console.log('RE-INTIALIZING C.ALL_PCOUNTS_BY_PID');
      console.log('RE-INTIALIZING C.ALL_CLASSIFIERS_BY_PID');
      console.log('RE-INTIALIZING C.PROJECT_INFORMATION_BY_PNAME');
      console.log('RE-INTIALIZING C.DatasetsWithLatLong');

      delete C.PROJECT_INFORMATION_BY_PID[pid];
      delete C.DATASET_IDS_BY_PID[pid];
      delete C.ALL_PCOUNTS_BY_PID[pid];
      delete C.ALL_CLASSIFIERS_BY_PID[pid];
      delete C.PROJECT_INFORMATION_BY_PNAME[pname];

    }
    // else if (type === 'add') {
    //
    // }
    // else {
    //   // ERROR
    // }
  }

  get_select_env_term_query(rows) {
    for (let i = 0; i < rows.length; i++) {
      let ont = rows[i].ont;
      switch (ont) {
        case 'ENVO':
          C.MD_ENV_ENVO[rows[i].term_id] = rows[i].term_name;
          break;
        case 'CTY':
          C.MD_ENV_CNTRY[rows[i].term_id] = rows[i].term_name;
          break;
        case 'LZC':
          C.MD_ENV_LZC[rows[i].term_id] = rows[i].term_name;
          break;
      }
    }
  }

  get_select_env_package_query(rows) {
    for (let i = 0; i < rows.length; i++) {
      C.MD_ENV_PACKAGE[rows[i].env_package_id] = rows[i].env_package;
    }
  }

  
  get_select_domain_query(rows) {
    for (let i = 0; i < rows.length; i++) {
      C.MD_DOMAIN[rows[i].domain_id] = rows[i].domain;
    }
  }

  get_select_dna_region_query(rows) {
    for (let i = 0; i < rows.length; i++) {
      C.MD_DNA_REGION[rows[i].dna_region_id] = rows[i].dna_region.toLowerCase();
    }
  }

  get_select_target_gene_query(rows) {
    for (let i = 0; i < rows.length; i++) {
      C.MD_TARGET_GENE[rows[i].target_gene_id] = rows[i].target_gene.toLowerCase();
    }
  }

  get_select_sequencing_platform_query(rows) {
    for (let i = 0; i < rows.length; i++) {
      C.MD_SEQUENCING_PLATFORM[rows[i].sequencing_platform_id] = rows[i].sequencing_platform;
    }
  }

  get_select_Illumina_3letter_adapter_query(rows) {
    for (let i = 0; i < rows.length; i++) {
      C.MD_3LETTER_ADAPTER[rows[i].illumina_adaptor_id] = rows[i].illumina_adaptor;
    }
  }

  get_select_adapter_sequence_query(rows) {
    for (let i = 0; i < rows.length; i++) {
      C.MD_ADAPTER_SEQUENCE[rows[i].run_key_id] = rows[i].run_key;
    }
  }

  get_select_illumina_index_query(rows) {
    for (let i = 0; i < rows.length; i++) {
      C.MD_ILLUMINA_INDEX[rows[i].illumina_index_id] = rows[i].illumina_index;
    }
  }

  get_select_primer_suite_query(rows) {
    for (let i = 0; i < rows.length; i++) {

      if (!C.MD_PRIMER_SUITE.hasOwnProperty(rows[i].primer_suite_id)) {
        C.MD_PRIMER_SUITE[rows[i].primer_suite_id]        = {};
        C.MD_PRIMER_SUITE[rows[i].primer_suite_id].id     = rows[i].primer_suite_id;
        C.MD_PRIMER_SUITE[rows[i].primer_suite_id].name   = rows[i].primer_suite;
        C.MD_PRIMER_SUITE[rows[i].primer_suite_id].region = rows[i].region;
        C.MD_PRIMER_SUITE[rows[i].primer_suite_id].domain = rows[i].domain;
        C.MD_PRIMER_SUITE[rows[i].primer_suite_id].primer = [];
      }
      C.MD_PRIMER_SUITE[rows[i].primer_suite_id].primer.push({
        "primer": rows[i].primer,
        "primer_id": rows[i].primer_id,
        "direction": rows[i].direction,
        "sequence": rows[i].sequence
      });
    }
  }

  get_select_run_query(rows) {
    for (let i = 0; i < rows.length; i++) {
      C.MD_RUN[rows[i].run_id] = rows[i].run;
    }
  }
}

module.exports = {
  GlobalVars: GlobalVars
};