let fs   = require('fs-extra');
let path = require('path');

class FileUtil {
  file_download(req, res) {
    let file = '';
    let user = req.query.user;
    let filename = req.query.filename;

    if (req.query.template === '1') {
      file = path.join(req.CONFIG.PROCESS_DIR, filename);
    }
    else if (req.query.type === 'pcoa') {
      file = path.join(req.CONFIG.TMP_FILES, filename);
    }
    else {
      file = path.join(req.CONFIG.USER_FILES_BASE, user, filename);
    }
    res.setHeader('Content-Type', 'text');
    res.download(file); // Set disposition and send it.
  }

  file_delete(req, res) {
    let user = req.query.user;
    let file = path.join(req.CONFIG.USER_FILES_BASE, user, req.query.filename);

    if (req.query.type === 'elements') {
      fs.unlink(file, function deleteFile(err) {
        if (err) {
          console.log("err 8: ");
          console.log(err);
          req.flash('fail', err);
        }
        else {
          req.flash('success', 'Deleted: ' + req.query.filename);
          res.redirect("/visuals/saved_elements");
        }
      }); //
    }
    else {
      fs.unlink(file, function deleteFile(err) {
        if (err) {
          req.flash('fail', err);
          console.log("err 9: ");
          console.log(err);
        } else {
          req.flash('success', 'Deleted: ' + req.query.filename);
          res.redirect("/metadata/metadata_file_list");
        }
      });
    }
  }
}

module.exports = {
  FileUtil: FileUtil
};