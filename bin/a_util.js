var os = require("os");

var IsLocal = exports.IsLocal = function () {
  var hostname = os.hostname();

  SERVER_NAMES = ["local"]

  var ffound = false;
  
  SERVER_NAMES.forEach(function(entry) {
    // console.log("entry = ");
    // console.log(entry);
    if(hostname.indexOf(entry) >= 0) {
      ffound = true;
    }
  });
  return ffound;
}

