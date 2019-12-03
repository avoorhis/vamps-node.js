const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries');

class GlobalVars {
  constructor() {
  }

  sort_AllMetadataNames() {
    AllMetadataNames.sort((a, b) => {
      return helpers.compareStrings_alpha(a, b);
    });
  }

  make_all_datasets(datasetsByProject, pids, titles) {
    ALL_DATASETS.projects = Object.keys(datasetsByProject).reduce((prjs, p) => {
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
    let isLatitude = (mdname === 'latitude' && !isNaN(AllMetadata[did].latitude));
    let isLongitude = (mdname === 'longitude' && !isNaN(AllMetadata[did].longitude));

    if (isLatitude || isLongitude) {
      if (!(did in DatasetsWithLatLong)) {
        DatasetsWithLatLong[did] = {};
        let pname = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project;
        DatasetsWithLatLong[did].proj_dset = pname + '--' + DATASET_NAME_BY_DID[did];
        DatasetsWithLatLong[did].pid = PROJECT_ID_BY_DID[did];
      }
      switch (mdname) {
        case 'latitude':
          DatasetsWithLatLong[did].latitude = +AllMetadata[did].latitude;
          break;
        case 'longitude':
          DatasetsWithLatLong[did].longitude = +AllMetadata[did].longitude;
          break;
      }
    }
  }

  make_AllMetadataNames(mdname) {
    if (!AllMetadataNames.includes(mdname)) {
      AllMetadataNames.push(mdname);
    }
  }

  get_AllMetadataNames_n_clean_metadata() {
    let clean_metadata = {};
    for (let did in AllMetadata) {
      if (did in DATASET_NAME_BY_DID) {
        clean_metadata[did] = AllMetadata[did];
        for (let mdname in AllMetadata[did]) {
          this.make_AllMetadataNames(mdname);
          this.get_DatasetsWithLatLong(mdname, did);
        }
      }
    }
  }

  init_dataset_ids_by_pid(pid) {
    if (!DATASET_IDS_BY_PID.hasOwnProperty(pid)) {
      DATASET_IDS_BY_PID[pid] = [];
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
    if (AllMetadata.hasOwnProperty(did) && AllMetadata[did].hasOwnProperty('env_package_id')) {
      envpkgid = AllMetadata[did].env_package_id;
    }
    return envpkgid;
  }


// TODO: JSHint: This function's cyclomatic complexity is too high. (8)(W074)
  run_select_datasets_query(rows) {
    let pids = {};
    let titles = {};
    let datasetsByProject = {};
    for (let i = 0; i < rows.length; i++) {
      let project = rows[i].project;
      if (project === undefined) {
        continue;
      }
      let pid = rows[i].pid;

      this.init_dataset_ids_by_pid(pid);

      let did = rows[i].did;
      let no_did = [undefined, 'null', null];
      if (!no_did.includes(did)) {
        let dataset = rows[i].dataset;
        let dataset_description = rows[i].dataset_description;
        PROJECT_ID_BY_DID[did] = pid;
        DATASET_NAME_BY_DID[did] = dataset;
        let dataset_options = {did: did, dname: dataset, ddesc: dataset_description};
        datasetsByProject = this.add_to_datasetsByProject(datasetsByProject, project, dataset_options);
        DATASET_IDS_BY_PID[pid].push(did);
      }

      let envpkgid = this.get_envpkgid(did);

      let ca = helpers.convertJSDateToString(rows[i].created_at);
      let ua = helpers.convertJSDateToString(rows[i].updated_at);

      if (!PROJECT_INFORMATION_BY_PID.hasOwnProperty(pid)) {
        let owner_id = rows[i].owner_user_id;
        PROJECT_INFORMATION_BY_PID[pid] = {
          "last": rows[i].last_name,
          "first": rows[i].first_name,
          "username": rows[i].username,
          "oid": owner_id,
          "email": rows[i].email,
          "env_package_id": envpkgid,  // FROM AllMetadata: mostly used here for the filter on dataset selection page
          "institution": rows[i].institution,
          "project": project,
          "pid": pid,
          "title": rows[i].title,
          "description": rows[i].project_description,
          "public": rows[i].public,
          "metagenomic": rows[i].metagenomic,
          "matrix": rows[i].matrix,
          //"seqs_available" :   rows[i].seqs_available,
          "created_at": ca,
          "updated_at": ua
        };
        let public_pr = rows[i].public;
        if (public_pr || rows[i].username === 'guest') {
          PROJECT_INFORMATION_BY_PID[pid].permissions = [];  // PUBLIC
        } else {
          PROJECT_INFORMATION_BY_PID[pid].permissions = [owner_id]; // initially has only project owner_id
        }
        PROJECT_INFORMATION_BY_PNAME[project] = PROJECT_INFORMATION_BY_PID[pid];

        pids[project] = pid;
        titles[project] = rows[i].title;
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
        helpers.run_permissions_query(rows);
      }

      console.log(' UPDATING PERMISSIONS: "' + queries.get_project_permissions() + '"');
    });
  }


  make_pid_by_did_dict(rows) {
    let p_d = [];
    for (let r in rows) {
      let d_id = rows[r]['dataset_id'];
      let p_id = rows[r]['project_id'];
      p_d[d_id] = p_id;
    }
    return p_d;
  }


//add the same check to PROJECT_ID_BY_DID creation elsewhere
  get_select_seq_counts_query(rows) {
    // console.time("TIME: get_select_seq_counts_query");
    // console.log(Object.values(PROJECT_ID_BY_DID));
    connection.query('SELECT dataset_id, project_id from dataset', function (err, rows2) {

      // console.time("TIME: make_pid_by_did_dict");
      //instead it's better to use PROJECT_ID_BY_DID after it's initialized
      let pid_by_did_dict = [];
      if (Object.keys(PROJECT_ID_BY_DID).length > 0) {
        pid_by_did_dict = PROJECT_ID_BY_DID;
      } else {
        pid_by_did_dict = make_pid_by_did_dict(rows2);
      }
      // console.timeEnd("TIME: make_pid_by_did_dict");

      for (let i = 0; i < rows.length; i++) {
        let did = rows[i].dataset_id;
        let pid = pid_by_did_dict[did];
        //console.log('rows[i].project_id in run_select_sequences_query');
        // let pid                 = rows[i].project_id;
        let count = rows[i].seq_count;
        let cid = rows[i].classifier_id;
        ALL_DCOUNTS_BY_DID[did] = parseInt(count);
        if (ALL_CLASSIFIERS_BY_CID.hasOwnProperty(cid)) {
          ALL_CLASSIFIERS_BY_PID[pid] = ALL_CLASSIFIERS_BY_CID[cid];
        }
        if (pid in ALL_PCOUNTS_BY_PID) {
          ALL_PCOUNTS_BY_PID[pid] += parseInt(count);
        } else {
          ALL_PCOUNTS_BY_PID[pid] = parseInt(count);
        }
      }
      // console.log("ALL_PCOUNTS_BY_PID: ");
      // console.log(ALL_PCOUNTS_BY_PID);
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

      if (!MD_CUSTOM_UNITS.hasOwnProperty(project_id)) {
        MD_CUSTOM_UNITS[project_id] = {};
      }
      MD_CUSTOM_UNITS[project_id][field_name] = field_units;

      if (!MD_CUSTOM_FIELDS_UNITS.hasOwnProperty(field_name)) {
        MD_CUSTOM_FIELDS_UNITS[field_name] = {};
      }
      MD_CUSTOM_FIELDS_UNITS[field_name] = field_units;
    }
    // console.timeEnd("TIME: get_select_custom_units_query");
  }

}

module.exports = {
  GlobalVars: GlobalVars
};