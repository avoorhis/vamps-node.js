// TODO: get_taxonomy_query has depth 15! Can we simplify it, that it's no more then 3?
var express = require('express');
var router = express.Router();
var C = require(app_root + '/public/constants');
//var mysql = require('mysql2');
//var util = require('util');
var helpers = require('./helpers/helpers');

module.exports = {

alter_project_public: function(public, pid){
    var q = "UPDATE project set public='"+public+"' WHERE project_id='"+pid+"'";
    return q;    
},

alter_security_level: function( status, uid ){
    
    var qAlterSecLevel = "UPDATE user set security_level='"+status+"' WHERE user_id='"+uid+"'";
    console.log(qAlterSecLevel);
    return qAlterSecLevel;      
},
reset_user_password_by_uid: function(pass, uid){
    //var updateQuery = "UPDATE user set encrypted_password='"+helpers.generateHash(pass)+"', active='1' where user_id='"+uid+"'";
    var updateQuery = "UPDATE user set encrypted_password=PASSWORD('"+pass+"'), active='1' where user_id='"+uid+"'";
    
    return updateQuery
},
reset_user_password_by_uname: function(pass, uname){
    //var updateQuery = "UPDATE user set encrypted_password='"+helpers.generateHash(pass)+"', active='1' where username='"+uname+"'";
    var updateQuery = "UPDATE user set encrypted_password=PASSWORD('"+pass+"'), active='1' where username='"+uname+"'";
    return updateQuery
},
reset_user_signin: function(new_count, old_date, uid){
    var updateQuery = "UPDATE user set sign_in_count='"+new_count+"', current_sign_in_at=CURRENT_TIMESTAMP(), last_sign_in_at='"+old_date+"' WHERE user_id='"+uid+"'"
    return updateQuery
},

insert_access_table: function(uid,pid){
    
    var qInsertAccess = "INSERT ignore into `access` (user_id, project_id)";
    qInsertAccess += " VALUES(" + connection.escape(uid) + ", " + connection.escape(pid) + ")"; 
    console.log(qInsertAccess);
    return qInsertAccess; 
     
},
inactivate_user: function( uid ){
    
    var qDeleteAccess = "UPDATE user set active='0' WHERE user_id='"+uid+"'";
    console.log(qDeleteAccess);
    return qDeleteAccess;      
}, 
//
//
//
insert_new_user: function(mysql_new_user){
    
    var qInsertUser = "INSERT INTO user (username, encrypted_password, first_name, last_name, email, institution, active, sign_in_count, security_level, current_sign_in_at, last_sign_in_at)";
    qInsertUser +=    " VALUES ('" + mysql_new_user.username +"', "+
                                   // helpers.generateHash(mysql_new_user.password) +"', '"+
                                    "PASSWORD('"+mysql_new_user.password+"'),   '"+
                                    mysql_new_user.firstname +"', '"+
                                    mysql_new_user.lastname +"', '"+
                                    mysql_new_user.email +"', '"+
                                    mysql_new_user.institution +"',"+                                    
                                    " 1,"+
                                     " 1, "+
                                     mysql_new_user.security_level +","+
                                    " CURRENT_TIMESTAMP(), "+
                                     " CURRENT_TIMESTAMP() )";
    //console.log(qInsertUser)
    return qInsertUser
},
get_user_by_name: function(uname, passwd){
    var q = "SELECT user_id, username, email, institution, first_name, last_name, active, security_level,"
     q += " encrypted_password, PASSWORD('"+passwd+"') as entered_pw, sign_in_count,"
     q += " DATE_FORMAT(current_sign_in_at,'%Y-%m-%d %T') as current_sign_in_at,last_sign_in_at FROM user"
     q += " WHERE username ='"+uname+"'"
    return q;
},

get_user_by_uid: function(uid){
    var q = "SELECT * from user WHERE user_id ='"+uid+"'"
    return q;
},
update_project_info: function(item_to_update, item, pid){
    var q = 'UPDATE project set'
    switch(item_to_update){
        case 'pname':
            var rev_pname = helpers.reverse(item);
            q += " project='"+item+"', rev_project_name='"+rev_pname+"' ";
            break;
        case 'powner':
            q += " owner_user_id='"+item+"'" ;
            break;
        case 'ptitle':
            q += " title='"+item+"'";
            break;
        case 'pdesc':
            q += " project_description='"+item+"'";
            break;
        default:
            console.log('ERROR in update_project_info query');
    }
    q += " WHERE project_id='"+pid+"'"
    return q
    
}

}