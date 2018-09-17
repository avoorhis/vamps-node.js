// var mysql = require('mysql2');

class User {

  constructor() {
    this.User_obj = {
      username: "",
      email: "",
      institution: "",
      first_name: "",
      last_name: "",
      security_level: "",
      encrypted_password: "",
      groups: "",
    };
  }

  getAllUsers(callback) {
    return connection.query("Select * from user", callback);
  }

  getUserById(user_id, callback) {

    return connection.query("select * from user where user_id = ?", [user_id], callback);
  }

  getUser_id(first_name, last_name, email, institution, callback) {

    return connection.query("SELECT user_id FROM user WHERE first_name = ? AND last_name = ? AND email = ? AND institution = ?", [first_name, last_name, email, institution], callback);
  }

  getUserInfoFromGlobalbyUniqKey(first_name, last_name, email, institution) {
    var uniq_key = first_name + "#" + last_name + "#" + email + "#" + institution;

    if (typeof ALL_USERS_BY_UnK[uniq_key] !== 'undefined') {
     this.User_obj.user_id        = ALL_USERS_BY_UnK[uniq_key].user_id;
     this.User_obj.username       = ALL_USERS_BY_UnK[uniq_key].username;
     this.User_obj.email          = ALL_USERS_BY_UnK[uniq_key].email;
     this.User_obj.institution    = ALL_USERS_BY_UnK[uniq_key].institution;
     this.User_obj.first_name     = ALL_USERS_BY_UnK[uniq_key].first_name;
     this.User_obj.last_name      = ALL_USERS_BY_UnK[uniq_key].last_name;
     this.User_obj.security_level = ALL_USERS_BY_UnK[uniq_key].status;
     this.User_obj.groups         = ALL_USERS_BY_UnK[uniq_key].groups;
    }
    else {
      console.log("ERR from getUserInfoFromGlobalbyUniqKey. No such user: ALL_USERS_BY_UnK[uniq_key]", uniq_key);
    }
  }

  getUserInfoFromGlobal(user_id) {

    // console.log("UUU1 ALL_USERS_BY_UID = ", ALL_USERS_BY_UID);
    //   { email: 'kirchman@udel.edu',
    //      username: 'kirchman',
    //      last_name: 'Kirchman',
    //      first_name: 'David',
    //      institution: 'University of Delaware',
    //      status: 50,
    //      groups: [] }

    this.User_obj.user_id = user_id;
    if (typeof ALL_USERS_BY_UID[user_id] !== 'undefined') {
      this.User_obj.username           = ALL_USERS_BY_UID[user_id].username;
      this.User_obj.email              = ALL_USERS_BY_UID[user_id].email;
      this.User_obj.institution        = ALL_USERS_BY_UID[user_id].institution;
      this.User_obj.first_name         = ALL_USERS_BY_UID[user_id].first_name;
      this.User_obj.last_name          = ALL_USERS_BY_UID[user_id].last_name;
      this.User_obj.security_level     = ALL_USERS_BY_UID[user_id].status;
      this.User_obj.encrypted_password = ALL_USERS_BY_UID[user_id].encrypted_password;
      this.User_obj.groups             = ALL_USERS_BY_UID[user_id].groups;
    }
  }

  addUser(callback) {
    return connection.query("Insert into user values(?,?,?,?,?,?,?,?,?,?,?,?)", [
      this.User_obj.user_id,
      this.User_obj.username,
      this.User_obj.email,
      this.User_obj.institution,
      this.User_obj.first_name,
      this.User_obj.last_name,
      this.User_obj.active,
      this.User_obj.security_level,
      this.User_obj.encrypted_password,
      this.User_obj.sign_in_count,
      this.User_obj.current_sign_in_at,
      this.User_obj.last_sign_in_at
    ], callback);
  }

  newUser(req_body, username, password) {
    var new_user = {};
    new_user.email          = req_body.useremail.trim();
    new_user.firstname      = req_body.userfirstname.trim();
    new_user.lastname       = req_body.userlastname.trim();
    new_user.institution    = req_body.userinstitution.trim();
    new_user.password       = password;
    new_user.username       = username.trim();
    return(new_user);
  }

}

module.exports = User;
