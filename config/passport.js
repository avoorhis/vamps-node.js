// config/passport.js
// load all the things we need
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

};
/////////////////////////
/////////////////////////

function generateHash(password) {
    //return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    var cipher = crypto.createCipher('aes-256-cbc', 'salt');
    cipher.update(password, 'utf8', 'base64');
    return cipher.final('base64');
}
function validatePassword(entered_pw, database_pw) {
    if (generateHash(entered_pw) === database_pw){
        console.log('Password Match!');
        return true;
    }
    console.log('No-Match!');
    return false;
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
            return done(null, rows[0], req.flash('loginMessage', 'Success!')); 
        }
        
        // if the user is found but the password is wrong:
        // create the loginMessage and save it to session as flashdata
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
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
    if(password.length < 3 || password.length > 20){
        return done(null, false, req.flash('signupMessage', 'The password must be between 3 and 20 characters.'));
    }
    if(checkUserName(username)){
        return done(null, false, req.flash('signupMessage', "The username cannot have any special characters (including <space> and underscore '_'). Alphanumeric only."));
    }
    if(username.length < 3 || username.length > 15){
        return done(null, false, req.flash('signupMessage', 'The username must be between 3 and 15 characters. Alphanumeric only.'));
    }
    if( email.indexOf("@") == -1 || email.length < 3 || email.length > 100 ){
        return done(null, false, req.flash('signupMessage', 'The email address is empty or the wrong format.'));
    }
    if( first.length < 1 || first.length > 50 ||  last.length < 1 || last.length > 50 ){
        return done(null, false, req.flash('signupMessage', 'Both first and last names are required.'));
    }
    if( inst.length < 1 || inst.length > 50){
        return done(null, false, req.flash('signupMessage', 'The Institution name is required.'));
    }

    db.query("select * from user where username = '"+username+"'",function(err,rows){
            if (err) {
              return done(null, false, { message: err });
            }
            if (rows.length) {
                //console.log('That username is already taken.');
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {

                // if there is no user with that username
                // create the user
                var newUserMysql            = {};
                newUserMysql.username       = username;
                newUserMysql.password       = generateHash(password); // use the generateHash function in our user model
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
                                    " '0000-00-00 00:00:00' )";


                console.log(insertQuery);
                db.query(insertQuery,function(err,rows){
                    newUserMysql.user_id = rows.insertId;
                    return done(null, newUserMysql);
                });
            }
    });

}

function checkUserName(name){
    reg = /[^A-Za-z0-9]/;   // allow alphanumeric ONLY!
    a = (reg.test(name));  
    //console.log(a)  
    return a;
}


