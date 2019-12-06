let fs   = require('fs-extra');
let path = require('path');

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

  file_delete() {
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
        redirect_url: "/metadata/metadata_file_list"
      };
      fs.unlink(file, function callback(err) {
        this.react_to_delete(err, data);
        }.apply(this, data)
      );
    }
  }
}

module.exports = {
  FileUtil: FileUtil
};