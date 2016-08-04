var os = require("os");


// module.exports = {
  /**
  * Test whether node js runs on a server or locally.
  * @return {boolean}
  */
  // var isNull = exports.isNull = function (value) {
  //        return value === null;
  // };

var IsLocal = exports.IsLocal = function () {
  var hostname = os.hostname();

  SERVER_NAMES = ["local"]

  console.log("HHH");
  console.log(hostname);

  // if (SERVER_NAMES.indexOf(hostname) >= 0) {
  //     console.log("Found");
  // } else {
  //     console.log("Not found");
  // }
  
  var ffound = false;
  

  SERVER_NAMES.forEach(function(entry) {
    console.log("entry = ");
    console.log(entry);
    // return hostname.indexOf(entry);
    if(hostname.indexOf(entry) >= 0) {
      console.log("Found");
      ffound = true;
    } else {
      next;
      console.log("Not found");
    }
  });
  console.log("ffound:");
  console.log(ffound);
  return ffound;
}
// };

