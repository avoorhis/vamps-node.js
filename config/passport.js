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
        console.log(req.body.userfirstname);
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
    function(req, username, password, done) { // callback with email and password from our form
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
        console.log('Match!');
        return true;
    }
    console.log('No-Match!');
    return false;
}

function login_auth_user(req, username, password, done, db){

    db.query("SELECT * FROM user WHERE username = '" + username + "'",function(err,rows){
        if (err)
            //return done(err);
            { return done(null, false, { message: err }); }
        if (!rows.length) {
            // req.flash is the way to set flashdata using connect-flash
            { return done(null, false, req.flash('loginMessage', 'No user found.'));}
        }
        // if the user is found but the password is wrong

        //if (!( rows[0].password == password))
        if ( validatePassword(password, rows[0].encrypted_password) )
            { return done(null, rows[0], req.flash('loginMessage', 'Success!')); }

        // create the loginMessage and save it to session as flashdata
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
        // all is well, return successful user

    });

}
function signup_user(req, username, password, done, db){
     // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    db.query("select * from user where username = '"+username+"'",function(err,rows){
            console.log(rows);
            console.log("above row object");
            if (err) {
              return done(null, false, { message: err });
            }
            if (rows.length) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {

                // if there is no user with that username
                // create the user
                var newUserMysql        = {};
                newUserMysql.username   = username;
                newUserMysql.password   = generateHash(password); // use the generateHash function in our user model
                newUserMysql.firstname  = req.body.userfirstname;
                newUserMysql.lastname   = req.body.userlastname;
                newUserMysql.email      = req.body.useremail;
                newUserMysql.institution= req.body.userinstitution;
                newUserMysql.security_level= 50;  //reg user

                var insertQuery = "INSERT INTO user (username, encrypted_password, first_name, last_name, email, institution)";
                insertQuery +=    " VALUES ('" + username +"', '"+ newUserMysql.password +"', '"+ newUserMysql.firstname +"', '"+ newUserMysql.lastname +"', '"+ newUserMysql.email +"', '"+ newUserMysql.institution +"')";


                console.log(insertQuery);
                db.query(insertQuery,function(err,rows){
                    newUserMysql.user_id = rows.insertId;
                    return done(null, newUserMysql);
                });
            }
    });

}




