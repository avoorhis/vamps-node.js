var constants = require(app_root + '/public/constants');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();

module.exports = {

  // route middleware to make sure a user is logged in
  isLoggedIn: function (req, res, next) {

      // if user is authenticated in the session, carry on
      if (req.isAuthenticated()) {
        console.log("Hurray! isLoggedIn.req.isAuthenticated");
        return next();
      }
      // if they aren't redirect them to the home page
      console.log("Oops! NOT isLoggedIn.req.isAuthenticated");
      req.flash('loginMessage', 'Please login or register before continuing.');
      res.redirect('/users/login');
  }
  
  
};

/** Benchmarking
* Usage: 
    var helpers = require('../helpers/helpers');

    helpers.start = process.hrtime();
    some code
    helpers.elapsed_time("This is the running time for some code");
*/

module.exports.start = process.hrtime();

module.exports.elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(module.exports.start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(module.exports.start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
};

var ranks = constants.RANKS;

// todo: use in file instead of those in the class
module.exports.check_if_rank = function(field_name)
{
  // ranks = ["domain","phylum","klass","order","family","genus","species","strain"]
  return ranks.indexOf(field_name) > -1;
}

module.exports.render_error_page = function(req,res,msg)
{
  req.flash('errorMessage', msg);
  res.render('error',
    { title :  'Fail',	     
  	  message : req.flash('errorMessage'),
      user : 	req.user.username
    });
}

module.exports.clear_file = function(fileName)
{
  fs.openSync(fileName, "w");
}

module.exports.append_to_file = function(fileName, text) 
{
  fs.appendFileSync(fileName, text);
}

module.exports.write_to_file = function(fileName, text) 
{
  fs.writeFile(fileName, text, function(err){
	  if(err) { 
		  throw err;
      } else {
        
	  }
  });
}

module.exports.IsJsonString = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports.onlyUnique = function(value, index, self) { 
    return self.indexOf(value) === index;
}

module.exports.mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

module.exports.send_mail = function(mail_info) {
  var to_addr = mail_info.addr;
  var from_addr = mail_info.from;
  var subj = mail_info.subj;
  var msg = mail_info.msg;
  transporter.sendMail(mail_info, function (error, info) {
              if (error) {
                  console.log(error);
              } else {
                  console.log('Message sent: ' + info.messageId);
              }
    });

  // transporter.sendMail({
  //         from: from_addr,
  //         to: to_addr,
  //         subject: subj,
  //         text: msg
  //       });

}
