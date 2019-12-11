let fs   = require('fs-extra');
let path = require('path');
let spawn = require('child_process').spawn;
let helpers = require(app_root + '/routes/helpers/helpers');
const C = require(app_root + '/public/constants');

class FileUtil {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.user = this.req.query.user || this.req.user.username;
    this.filename = this.req.query.filename || "";
    this.file_paths = new module.exports.visualizationFiles();
  }

  file_download() {
    let file = '';

    if (this.req.query.template === '1') {
      file = path.join(this.file_paths.get_process_dir(this.req), this.filename);
    }
    else if (this.req.query.type === 'pcoa') {
      file = path.join(this.file_paths.get_tmp_file_path(this.req), this.filename);
    }
    else {
      file = this.file_paths.get_user_file_path(this.req, this.user, this.filename);
    }
    this.res.setHeader('Content-Type', 'text');
    this.res.download(file); // Set disposition and send it.
  }

  react_to_delete(err, data) {
    if (err) {
      console.log(data.err_msg);
      console.log(err);
      this.req.flash('fail', err);
    }
    else {
      this.req.flash('success', 'Deleted: ' + this.filename);
      this.res.redirect(data.redirect_url);
    }
  }

  file_delete(redirect_url_after_delete = undefined) {
    let file = this.file_paths.get_user_file_path(this.req, this.user, this.filename);

    if (this.req.query.type === 'elements') {
      let data = {
        err_msg: "err 8: ",
        redirect_url: "/visuals/saved_elements"
      };
      fs.unlink(file, function callback(err) {
        this.react_to_delete(err, data);
        }.apply(this, data)
      );
    }
    else {
      let data = {
        err_msg: "err 9: ",
        redirect_url: redirect_url_after_delete
      };
      fs.unlink(file, function callback(err) {
        this.react_to_delete(err, data);
        }.apply(this, data)
      );
    }
  }

  // TODO: JSHint: This function's cyclomatic complexity is too high. (7)(W074)
  get_norm(normalization) {
    let norm = "";
    if (normalization === 'max' || normalization === 'maximum' || normalization === 'normalized_to_maximum') {
      norm = 'normalized_to_maximum';
    }
    else if (normalization === 'percent' || normalization === 'frequency' || normalization === 'normalized_by_percent') {
      norm = 'normalized_by_percent';
    }
    else {
      norm = 'not_normalized';
    }
    return norm;
  }

  get_pid_lookup(dids){
    let pid_lookup = [];
    Object.keys(PROJECT_ID_BY_DID).forEach(did => {
      let pid = PROJECT_ID_BY_DID[did];
      if (dids.includes(did) && !pid_lookup.includes(pid)) {
        pid_lookup.push(pid);
      }
    });
    return pid_lookup.join(',');
  }

  get_pid_list(dids, file_tags){
    let pids_str = "";
    if (file_tags[0] === '--dco_metadata_file') {
      let pid_list = [];
      for (let pname in PROJECT_INFORMATION_BY_PNAME) {
        if (pname.substring(0, 3) === 'DCO') {
          pid_list.push(PROJECT_INFORMATION_BY_PNAME[pname].pid);
        }
      }
      pids_str = JSON.stringify(pid_list.join(','));
    }
    else {
      pids_str = this.get_pid_lookup(dids);
    }
    return pids_str;
  }

  get_export_cmd_options(user_dir, ts, dids, file_tags, normalization, rank, domains, include_nas, compress) {
    let req = this.req;
    let site = req.CONFIG.site;
    let dids_str = JSON.stringify(dids.join(','));
    let pids_str = this.get_pid_list(dids, file_tags);
    let norm = this.get_norm(normalization);

    let export_cmd_options = {
    scriptPath: this.file_paths.get_path_to_node_scripts(req),
      args: ['-s', site,
      '-u', req.user.username,
      '-r', ts,
      '-base', user_dir,
      '-dids', dids_str,
      '-pids', pids_str,
      '-norm', norm,
      '-rank', rank,
      '-db', NODE_DATABASE
    ] // '-compress'

  };
    for (let t in file_tags) {
      export_cmd_options.args.push(file_tags[t]);
    }
    if (compress) {
      export_cmd_options.args.push('-compress');
    }
    if (domains !== '') {
      export_cmd_options.args.push('-domains');
      export_cmd_options.args.push(JSON.stringify(domains.join(', ')));
    }
    console.log('include NAs', include_nas);
    if (include_nas === 'no') {
      export_cmd_options.args.push('-exclude_nas');
    }
    return export_cmd_options;
  }

  cluster_export(qsub_file_path, qsub_script_text){
    let req = this.req;
    fs.writeFile(qsub_file_path, qsub_script_text, function writeFile(err) {
      if (err) {
        return console.log(err);
      }
      else {
        console.log("The file was saved!");
        //console.log(qsub_script_text);
        fs.chmod(qsub_file_path, '0775', function chmodFile(err) {
          if (err) {
            return console.log(err);
          }
          else {
            let dwnld_process = spawn(qsub_file_path, {}, {
              env: {'PATH': req.CONFIG.PATH, 'LD_LIBRARY_PATH': req.CONFIG.LD_LIBRARY_PATH},
              detached: true,
              stdio: ['pipe', 'pipe', 'pipe']
              //stdio: [ 'ignore', null, log ]
            });  // stdin, stdout, stderr1
          }
        });
      }
    });
  }

  no_cluster_export(export_cmd, export_cmd_options) {
    let req = this.req;
    console.log('No Cluster Available according to req.CONFIG.cluster_available');
    let cmd = path.join(export_cmd_options.scriptPath, export_cmd) + ' ' + export_cmd_options.args.join(' ');
    console.log('RUNNING:', cmd);

    let dwnld_process = spawn(path.join(export_cmd_options.scriptPath, export_cmd), export_cmd_options.args, {
      env: {'PATH': req.CONFIG.PATH, 'LD_LIBRARY_PATH': req.CONFIG.LD_LIBRARY_PATH},
      detached: true,
      stdio: ['pipe', 'pipe', 'pipe']  // stdin, stdout, stderr
    });
    let stdout = '';
    dwnld_process.stdout.on('data', function dwnldProcessStdout(data) {
      stdout += data;
    });
    let stderr = '';
    dwnld_process.stderr.on('data', function dwnldProcessOnData(data) {
      stderr += data;
    });
    dwnld_process.on('close', function dwnldProcessOnClose(code) {
      console.log('dwnld_process process exited with code ' + code);
      //console.log('stdout', stdout);
      //console.log('stderr', stderr);
      if (code !== 0) {
        console.log('ERROR', stderr);
        //res.send('Frequency Heatmap R Script Error:'+stderr);
      }
    });
  }

  create_export_files (user_dir, ts, dids, file_tags, normalization, rank, domains, include_nas, compress) {
    let req = this.req;
    let log = path.join(req.CONFIG.TMP_FILES, 'export_log.txt');
    let code       = 'NVexport';
    let export_cmd = 'vamps_export_data.py';

    let export_cmd_options = this.get_export_cmd_options(user_dir, ts, dids, file_tags, normalization, rank, domains, include_nas, compress);
    let cmd_list = [];
    cmd_list.push(path.join(export_cmd_options.scriptPath, export_cmd) + ' ' + export_cmd_options.args.join(' '));

    if (req.CONFIG.cluster_available === true) {
      let qsub_script_text = helpers.get_qsub_script_text(req, log, req.CONFIG.TMP, code, cmd_list);
      let qsub_file_name   = req.user.username + '_qsub_export_' + ts + '.sh';
      let qsub_file_path   = path.join(req.CONFIG.TMP_FILES, qsub_file_name);
      this.cluster_export(qsub_file_path, qsub_script_text);

      console.log('RUNNING(via qsub):', cmd_list[0]);
      console.log('qsub_file_path:', qsub_file_path);
    }
    else {
      this.no_cluster_export(export_cmd, export_cmd_options);
    }
    return;
  }
}

class visualizationFiles {
  constructor() {
    this.user_file_path = "";
  }

  get_path_to_node_scripts(req) {
    return req.CONFIG.PATH_TO_NODE_SCRIPTS;
  }

  get_process_dir(req) {
    return req.CONFIG.PROCESS_DIR;
  }

  get_user_file_path(req, user = req.body.user, filename = req.body.filename) {
    this.user_file_path = req.CONFIG.USER_FILES_BASE;
    return path.join(this.user_file_path, user, filename);
  }

  get_json_files_prefix(req) {
    return path.join(req.CONFIG.JSON_FILES_BASE,
      NODE_DATABASE + "--datasets_" + C.default_taxonomy.name);
  }

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

module.exports = {
  FileUtil: FileUtil,
  visualizationFiles: visualizationFiles
};