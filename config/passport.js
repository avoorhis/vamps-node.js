// config/passport.js
// load all the things we need
var helpers = require('../routes/helpers/helpers');
var queries = require('../routes/queries_admin');
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
        console.log('in serialize: user_id='+user.user_id)
        done(null, user.user_id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        db.query(queries.get_user_by_uid(id), function(err, rows){
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
        console.log(req.body.userfirstname);
        //xx = signup_user(req, username, password, done, db);
        console.log('xx');
        console.log(done);
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
    var qSelectUser = queries.get_user_by_name(username)
    db.query(qSelectUser, function(err,rows){
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
   
    var qSelectUser = queries.get_user_by_name(username)
  
    db.query(qSelectUser, function(err,rows){
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
            var qResetUserSignin = queries.reset_user_signin(new_count, rows[0].current_sign_in_at, rows[0].user_id)
            //var q = "update user set sign_in_count='"+new_count+"', current_sign_in_at=CURRENT_TIMESTAMP(), last_sign_in_at='"+rows[0].current_sign_in_at+"' where user_id='"+rows[0].user_id+"'"
            //console.log(q);
            db.query(qResetUserSignin, function(err,rows){
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
    new_user = {}
    new_user.email = req.body.useremail;
    new_user.firstname = req.body.userfirstname;
    new_user.lastname = req.body.userlastname;
    new_user.institution = req.body.userinstitution;
    new_user.password = password;
    new_user.username = username;

    if(new_user.password.length < 3 || new_user.password.length > 12){
        return done(null, false, req.flash('message', 'Password must be between 3 and 20 characters.'));
    }

    if(helpers.checkUserName(new_user.username)){
        return done(null, false, req.flash('message', "Username cannot have any special characters (including <space> and underscore '_'). Alphanumeric only."));
    }

    if(new_user.username.length < 3 || new_user.username.length > 15){
        return done(null, false, req.flash('message', 'Username must be between 3 and 15 characters. Alphanumeric only.'));
    }

    if( new_user.email.indexOf("@") == -1 || new_user.email.length < 3 || new_user.email.length > 100 ){
        return done(null, false, req.flash('message', 'Email address is empty or the wrong format.'));
    }

    if( new_user.firstname.length < 1 || new_user.firstname.length > 20 ||  new_user.lastname.length < 1 || new_user.lastname.length > 20 ){
        return done(null, false, req.flash('message', 'Both first and last names are required.'));
    }

    if( new_user.institution.length < 1 || new_user.institution.length > 128){
        return done(null, false, req.flash('message', 'Institution name is required.'));
    }
    db.query(queries.get_user_by_name(new_user.username), function(err, select_rows){
            if (err) {
              console.log(err)
              return done(null, false, req.flash( 'message', err ));
            }
            if (select_rows.length) {
                console.log('Username is already taken.');
                return done(null, false, req.flash('message', 'Username is already taken.'));
            } else {

                // if there is no user with that username
                // create the user
                var newUserMysql            = {};
                newUserMysql.username       = new_user.username;
                newUserMysql.password       = helpers.generateHash(new_user.password); // use the generateHash function in our user model
                newUserMysql.firstname     = new_user.firstname;
                newUserMysql.lastname      = new_user.lastname;
                newUserMysql.email          = new_user.email;
                newUserMysql.institution    = new_user.institution;
                newUserMysql.security_level = 50;  //reg user
                
                // todo: why this is in two places? See routes/routes_admin.js:552
                
                //var insertQuery = queries.insert_new_user(username, password, first, last, email, inst)
                var insertQuery = queries.insert_new_user(newUserMysql)
                
                db.query(insertQuery, function(err, insert_rows){ 
                    if(err){  // error usually if contact-email-inst index is not unique
                        console.log(insertQuery);
                        console.log(err);
                        return done(null, false, req.flash( 'message', 'There was an error. Please contact us at vamps@mbl.edu to request an account' ));
                    }else{
                        new_user.user_id = insert_rows.insertId;
                        ALL_USERS_BY_UID[new_user.user_id] = {
                            email:      new_user.email,
                            username:   new_user.username,
                            last_name:  new_user.lastname,
                            first_name: new_user.firstname,
                            institution:new_user.institution,
                        }
                        return done(null, new_user);
                    }                   
                });
            }
    });

}
//
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
            file_pts = files[i].split('_')
            if(file_pts[0] === username){
                var curPath = temp_dir_path1 + "/" + files[i];
                helpers.deleteFolderRecursive(curPath);
            }
        }
        fs.readdir(temp_dir_path2, function(err,files){
            for (var i=0; i<files.length; i++) {
                file_pts = files[i].split('_')
                if(file_pts[0] === username){
                    var curPath = temp_dir_path2 + "/" + files[i];
                    helpers.deleteFolderRecursive(curPath);
                }
            }
            fs.readdir(temp_dir_path3, function(err,files){
                for (var i=0; i<files.length; i++) {
                    file_pts = files[i].split('_')
                    if(file_pts[0] === username){
                        var curPath = temp_dir_path3 + "/" + files[i];
                        helpers.deleteFolderRecursive(curPath);
            
                    }
                }
            });
                            
        });
        
    });
};
// var deleteFolderRecursive = function(path) {

//     var fs   = require('fs-extra');
//     if( fs.existsSync(path) ) {
//         if(fs.lstatSync(path).isFile()) {
//             fs.unlinkSync(path);
//         }else{
//             fs.readdirSync(path).forEach(function(file,index){
              
//               var curPath = path + "/" + file;
//               //console.log('curPath '+curPath)
//               if(fs.lstatSync(curPath).isDirectory()) { // recurse
//                 deleteFolderRecursive(curPath);
//               } else { // delete file
//                 //console.log('deleting '+curPath)
//                 fs.unlinkSync(curPath);
//               }
              
//             });
//             fs.rmdirSync(path);
//         }
    
//     }
// };
var update_password = function(req, username, newpass, done, db) {
    
    db.query(queries.reset_user_password_by_uname(newpass,username), function(err, rows, done){
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

