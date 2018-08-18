// var mysql = require('mysql2');

var User       = {

  getAllUsers: function (callback) {

    return connection.query("Select * from user", callback);

  },

  getUserById: function (user_id, callback) {

    return connection.query("select * from user where user_id = ?", [user_id], callback);
  },

  getUser_id: function (first_name, last_name, email, institution, callback) {

    return connection.query("SELECT user_id FROM user WHERE first_name = ? AND last_name = ? AND email = ? AND institution = ?", [first_name, last_name, email, institution], callback);
  },

  getUserInfoFromGlobalbyUniqKey: function (first_name, last_name, email, institution) {
    var User_obj = {};
    var uniq_key = first_name + "#" + last_name + "#" + email + "#" + institution;

    if (typeof ALL_USERS_BY_UnK[uniq_key] !== 'undefined') {
      User_obj.user_id        = ALL_USERS_BY_UnK[uniq_key].user_id;
      User_obj.username       = ALL_USERS_BY_UnK[uniq_key].username;
      User_obj.email          = ALL_USERS_BY_UnK[uniq_key].email;
      User_obj.institution    = ALL_USERS_BY_UnK[uniq_key].institution;
      User_obj.first_name     = ALL_USERS_BY_UnK[uniq_key].first_name;
      User_obj.last_name      = ALL_USERS_BY_UnK[uniq_key].last_name;
      User_obj.security_level = ALL_USERS_BY_UnK[uniq_key].status;
      User_obj.groups         = ALL_USERS_BY_UnK[uniq_key].groups;
    }
    // TODO: move to init
    else {
      User_obj.user_id            = 0;
      User_obj.username           = "";
      User_obj.email              = "";
      User_obj.institution        = "";
      User_obj.first_name         = "";
      User_obj.last_name          = "";
      User_obj.security_level     = "";
      User_obj.encrypted_password = "";
      User_obj.groups             = "";
    }
    return User_obj;

  },

  getUserInfoFromGlobal: function (user_id) {
    var User_obj = {};

    // console.log("UUU1 ALL_USERS_BY_UID = ", ALL_USERS_BY_UID);
    //   { email: 'kirchman@udel.edu',
    //      username: 'kirchman',
    //      last_name: 'Kirchman',
    //      first_name: 'David',
    //      institution: 'University of Delaware',
    //      status: 50,
    //      groups: [] },

    User_obj.user_id = user_id;
    if (typeof ALL_USERS_BY_UID[user_id] !== 'undefined') {
      User_obj.username           = ALL_USERS_BY_UID[user_id].username;
      User_obj.email              = ALL_USERS_BY_UID[user_id].email;
      User_obj.institution        = ALL_USERS_BY_UID[user_id].institution;
      User_obj.first_name         = ALL_USERS_BY_UID[user_id].first_name;
      User_obj.last_name          = ALL_USERS_BY_UID[user_id].last_name;
      User_obj.security_level     = ALL_USERS_BY_UID[user_id].status;
      User_obj.encrypted_password = ALL_USERS_BY_UID[user_id].encrypted_password;
      User_obj.groups             = ALL_USERS_BY_UID[user_id].groups;
    }
    // TODO: move to init
    else {
      User_obj.username           = "";
      User_obj.email              = "";
      User_obj.institution        = "";
      User_obj.first_name         = "";
      User_obj.last_name          = "";
      User_obj.security_level     = "";
      User_obj.encrypted_password = "";
      User_obj.groups             = "";
    }
    return User_obj;
  },

  addUser: function (User_obj, callback) {
    return connection.query("Insert into user values(?,?,?,?,?,?,?,?,?,?,?,?)", [
      User_obj.user_id,
      User_obj.username,
      User_obj.email,
      User_obj.institution,
      User_obj.first_name,
      User_obj.last_name,
      User_obj.active,
      User_obj.security_level,
      User_obj.encrypted_password,
      User_obj.sign_in_count,
      User_obj.current_sign_in_at,
      User_obj.last_sign_in_at
    ], callback);
  },


};
module.exports = User;
