// config/passport.js
// load all the things we need
var helpers = require('../routes/helpers/helpers');
var LocalStrategy = require('passport-local').Strategy;
//var bcrypt        = require('bcrypt-nodejs');


var crypto = require('crypto')


//var mysql = require('mysql');
 
//var connection = require('./database-dev');
     
//connection.query('USE vidyawxx_build2');    
     
// expose this function to our app using module.exports
module.exports = function(passport, db) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
            console.log('in serialize:'+user.user_id)
        done(null, user.user_id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        db.query("select * from user where user_id = "+id, function(err, rows){
          done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField       : 'username',
        passwordField       : 'password',
        passReqToCallback   : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        //console.log(req.body.userfirstname);
        return signup_user(req, username, password, done, db);
    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form
        return login_auth_user(req, username, password, done, db);
    }));

    // =========================================================================
    // LOCAL RESET =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-reset', new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField : 'username',  // hidden
        passwordField : 'old_password',
        newPasswordField1 : 'new_password1',
        newPasswordField2 : 'new_password2',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form
        newpass1 = req.body.new_password1;
        newpass2 = req.body.new_password2;
        if(newpass1 === '' || newpass2 === '' || password === ''){
            { return done(null, false, req.flash('message', "You must fill-in all fields."));}
        }
        if(newpass1 !== newpass2){
            { return done(null, false, req.flash('message', "Your password verification doesn't match."));}
        }
        if(newpass1.length < 3 || newpass1.length > 12){
            { return done(null, false, req.flash('message', 'The password must be between 3 and 20 characters.'))};
        }

        return reset_password_auth(req, username, password, newpass1, done, db);
    }));


};
/////////////////////////
/////////////////////////


function validatePassword(entered_pw, database_pw) {
    if (helpers.generateHash(entered_pw) === database_pw){
        console.log('Password Match!');
        return true;
    }
    console.log('No-Match!');
    return false;
}
function reset_password_auth(req, username, password, newpass, done, db){
    db.query("SELECT user_id, username, email, institution,  active, security_level, encrypted_password \
             FROM user WHERE username = '" + username + "'",function(err,rows){
        if (err)
            { return done(null, false, { message: err }); }
        if (!rows.length) {
            // req.flash is the way to set flashdata using connect-flash
            { return done(null, false, req.flash('message', 'No user found.'));}
        }
        // If the account is not active
        if (rows[0].active !== 1) {
            { return done(null, false, req.flash('message', 'That account is inactive -- send email to vamps.mbl.edu to request re-activation.'));}
        }

        if ( validatePassword(password, rows[0].encrypted_password) )
        { 
            update_password(req, username, newpass, done, db)
            req.flash('message', 'Success. LOGGING OUT')
            //req.session.destroy()
//req.logout()

            //return done(null, false, req.flash('message', 'Success.')); 
            return done(null, rows[0], req.flash('message', 'Success.')); 
        }
        
        // if the user is found but the password is wrong:
        // create the loginMessage and save it to session as flashdata
        return done(null, false, req.flash('message', 'Wrong password -- try again.'));
        // all is well, return successful user

    });

}
function login_auth_user(req, username, password, done, db){
    db.query("SELECT user_id, username, email, institution, first_name, last_name, active, security_level, \
             encrypted_password, sign_in_count, DATE_FORMAT(current_sign_in_at,'%Y-%m-%d %T') as current_sign_in_at,last_sign_in_at \
             FROM user WHERE username = '" + username + "'",function(err,rows){
        if (err)
            //return done(err);
            { return done(null, false, { message: err }); }
        if (!rows.length) {
            // req.flash is the way to set flashdata using connect-flash
            { return done(null, false, req.flash('loginMessage', 'No user found.'));}
        }
        // If the account is not active
        if (rows[0].active !== 1) {
            { return done(null, false, req.flash('loginMessage', 'That account is inactive -- send email to vamps.mbl.edu to request re-activation.'));}
        }

        //Wed Feb 11 2015 15:05:29 GMT-0500 (EST)
        if ( validatePassword(password, rows[0].encrypted_password) )
        { 
            var new_count = parseInt(rows[0].sign_in_count) + 1;            
            var q = "update user set sign_in_count='"+new_count+"', current_sign_in_at=CURRENT_TIMESTAMP(), last_sign_in_at='"+rows[0].current_sign_in_at+"' where user_id='"+rows[0].user_id+"'"
            //console.log(q);
            db.query(q,function(err,rows){
                if (err){ console.log(err); }
            });

            // Here on login we delete the users tmp/* files from previous sessions.
            // This seems better than on logout bacause users are less likely to manually logout.
            try{
                delete_previous_tmp_files(req, username);
            }catch(e){
                console.log(e)
            }

            return done(null, rows[0]); 
        }
        
        // if the user is found but the password is wrong:
        // create the loginMessage and save it to session as flashdata
        return done(null, false, req.flash('loginMessage', 'Wrong password -- try again.'));
        // all is well, return successful user

    });

}
function signup_user(req, username, password, done, db){
    // validate all 6 entries here
    // 1- check for empty fields and long lengths
    // username -> no spaces or 'funny' chars
     // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    var email = req.body.useremail;
    var first = req.body.userfirstname;
    var last = req.body.userlastname;
    var inst = req.body.userinstitution;
    if(password.length < 3 || password.length > 12){
        return done(null, false, req.flash('message', 'The password must be between 3 and 20 characters.'));
    }
    if(helpers.checkUserName(username)){
        return done(null, false, req.flash('message', "The username cannot have any special characters (including <space> and underscore '_'). Alphanumeric only."));
    }
    if(username.length < 3 || username.length > 15){
        return done(null, false, req.flash('message', 'The username must be between 3 and 15 characters. Alphanumeric only.'));
    }
    if( email.indexOf("@") == -1 || email.length < 3 || email.length > 100 ){
        return done(null, false, req.flash('message', 'The email address is empty or the wrong format.'));
    }
    if( first.length < 1 || first.length > 50 ||  last.length < 1 || last.length > 50 ){
        return done(null, false, req.flash('message', 'Both first and last names are required.'));
    }
    if( inst.length < 1 || inst.length > 50){
        return done(null, false, req.flash('message', 'The Institution name is required.'));
    }

    db.query("select * from user where username = '"+username+"'",function(err,rows){
            if (err) {
              return done(null, false, { message: err });
            }
            if (rows.length) {
                //console.log('That username is already taken.');
                return done(null, false, req.flash('message', 'That username is already taken.'));
            } else {

                // if there is no user with that username
                // create the user
                var newUserMysql            = {};
                newUserMysql.username       = username;
                newUserMysql.password       = helpers.generateHash(password); // use the generateHash function in our user model
                newUserMysql.firstname      = first;
                newUserMysql.lastname       = last;
                newUserMysql.email          = email;
                newUserMysql.institution    = inst;
                newUserMysql.security_level = 50;  //reg user

                var insertQuery = "INSERT INTO user (username, encrypted_password, first_name, last_name, email, institution, active, sign_in_count, current_sign_in_at,last_sign_in_at)";
                insertQuery +=    " VALUES ('" + username +"', '"+ 
                                    newUserMysql.password +"', '"+ 
                                    newUserMysql.firstname +"', '"+ 
                                    newUserMysql.lastname +"', '"+ 
                                    newUserMysql.email +"', '"+ 
                                    newUserMysql.institution +"',"+
                                    " 1,"+
                                    " 1,"+
                                    " CURRENT_TIMESTAMP(), "+
                                    " '' )";


                console.log(insertQuery);
                db.query(insertQuery,function(err,rows){
                    newUserMysql.user_id = rows.insertId;
                    return done(null, newUserMysql);
                });
            }
    });

}
//
//
//
// var checkUserName = function(username){
//     reg = /[^A-Za-z0-9]/;   // allow alphanumeric ONLY!
//     a = (reg.test(username));  
//     //console.log(a)  
//     return a;
// }
//
//
//
var delete_previous_tmp_files = function(req, username){
    var path = require('path');
    var fs   = require('fs-extra');
    // dirs to delete from on login::
    var temp_dir_path1 = path.join(process.env.PWD,'tmp');
    var temp_dir_path2 = path.join(process.env.PWD,'views','tmp');
    // for vamps and vampsdev qsub scripts:
    var temp_dir_path3 = path.join(req.CONFIG.SYSTEM_FILES_BASE,'tmp');
    console.log(temp_dir_path3)
    fs.readdir(temp_dir_path1, function(err,files){
        for (var i=0; i<files.length; i++) {
            if(files[i].substring(0,username.length) === username){
                var curPath = temp_dir_path1 + "/" + files[i];
                deleteFolderRecursive(curPath);
            }
        }
        fs.readdir(temp_dir_path2, function(err,files){
            for (var i=0; i<files.length; i++) {
                if(files[i].substring(0,username.length) === username){
                    var curPath = temp_dir_path2 + "/" + files[i];
                    deleteFolderRecursive(curPath);
                }
            }
            fs.readdir(temp_dir_path3, function(err,files){
                for (var i=0; i<files.length; i++) {
                    if(files[i].substring(0,username.length) === username){
                        var curPath = temp_dir_path3 + "/" + files[i];
                        deleteFolderRecursive(curPath);
            
                    }
                }
            });
                            
        });
        
    });
};
var deleteFolderRecursive = function(path) {

    var fs   = require('fs-extra');
    if( fs.existsSync(path) ) {
        if(fs.lstatSync(path).isFile()) {
            fs.unlinkSync(path);
        }else{
            fs.readdirSync(path).forEach(function(file,index){
              
              var curPath = path + "/" + file;
              //console.log('curPath '+curPath)
              if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
              } else { // delete file
                //console.log('deleting '+curPath)
                fs.unlinkSync(curPath);
              }
              
            });
            fs.rmdirSync(path);
        }
    
    }
};
var update_password = function(req, username, newpass, done, db) {
    db.query("UPDATE user set encrypted_password='"+helpers.generateHash(newpass)+"' WHERE username = '" + username + "'",function(err,rows){
        if (err){ 
            return done(null, false, { message: err }); 
        }else{
            //return done(null, false, req.flash('message', 'Success! Password Updated'));
            console.log('logging out')
            req.session.destroy()
            req.logout()

        }
    });
}

