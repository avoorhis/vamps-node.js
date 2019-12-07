let fs   = require('fs-extra');
let path = require('path');
let spawn = require('child_process').spawn;
let helpers = require(app_root + '/routes/helpers/helpers');

class FileUtil {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.user = this.req.query.user;
    this.filename = this.req.query.filename;
  }

  file_download() {
    let file = '';

    if (this.req.query.template === '1') {
      file = path.join(this.req.CONFIG.PROCESS_DIR, this.filename);
    }
    else if (this.req.query.type === 'pcoa') {
      file = path.join(this.req.CONFIG.TMP_FILES, this.filename);
    }
    else {
      file = path.join(this.req.CONFIG.USER_FILES_BASE, this.user, this.filename);
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
    let file = path.join(this.req.CONFIG.USER_FILES_BASE, this.user, this.filename);

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
    scriptPath: path.join(req.CONFIG.PATH_TO_NODE_SCRIPTS),
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
      // fs.writeFile(qsub_file_path, qsub_script_text, function writeFile(err) {
      //   if (err) {
      //     return console.log(err);
      //   } else {
      //     console.log("The file was saved!");
      //     //console.log(qsub_script_text);
      //     fs.chmod(qsub_file_path, '0775', function chmodFile(err) {
      //       if (err) {
      //         return console.log(err);
      //       } else {
      //         let dwnld_process = spawn(qsub_file_path, {}, {
      //           env: {'PATH': req.CONFIG.PATH, 'LD_LIBRARY_PATH': req.CONFIG.LD_LIBRARY_PATH},
      //           detached: true,
      //           stdio: ['pipe', 'pipe', 'pipe']
      //           //stdio: [ 'ignore', null, log ]
      //         });  // stdin, stdout, stderr1
      //       }
      //     });
      //   }
      // });
    }
    else {
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

    return;
  }

}

module.exports = {
  FileUtil: FileUtil
};