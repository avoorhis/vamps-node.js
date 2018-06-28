var mysql = require('mysql2');

var User       = {

  getAllUsers: function (callback) {

    return connection.query("Select * from user", callback);

  },
  getUserById: function (user_id, callback) {

    return connection.query("select * from user where user_id = ?", [user_id], callback);
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
    
    User_obj.user_id            = user_id;
    User_obj.username           = ALL_USERS_BY_UID[user_id].username;
    User_obj.email              = ALL_USERS_BY_UID[user_id].email;
    User_obj.institution        = ALL_USERS_BY_UID[user_id].institution;
    User_obj.first_name         = ALL_USERS_BY_UID[user_id].first_name;
    User_obj.last_name          = ALL_USERS_BY_UID[user_id].last_name;
    User_obj.security_level     = ALL_USERS_BY_UID[user_id].status;
    User_obj.encrypted_password = ALL_USERS_BY_UID[user_id].encrypted_password;
    User_obj.groups             = ALL_USERS_BY_UID[user_id].groups;

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
  }
  // ,
  // deleteUser: function (id, callback) {
  //   return connection.query("delete from user where Id=?", [id], callback);
  // },
  // updateUser: function (id, User, callback) {
  //   return connection.query("update user set Title=?,Status=? where Id=?", [User.Title, User.Status, id], callback);
  // }

};
module.exports = User;
