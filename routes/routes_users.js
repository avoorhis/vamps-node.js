var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var fs = require('fs-extra');
var async = require('async');
var validator = require('validator');
//var crypto = require('crypto')
var path = require('path');
var nodemailer = require('nodemailer');

new_user = {}
/* GET User List (index) page. */


// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function(req, res) {
    res.render('user_admin/login', { 
                      title: 'VAMPS:login',
                      user: req.user, 
                      hostname: req.CONFIG.hostname,
                      return_to_url: req.session.returnTo });
});


router.post('/login',  passport.authenticate('local-login', { 
  // successRedirect: '/users/profile',
  failureRedirect: 'login',   // on fail GET:login (empty form)
  failureFlash: true }), function (req, res) {  
    var data_dir = path.join(req.CONFIG.USER_FILES_BASE,req.user.username);
    //str.startsWith('/metadata/file_utils')
    var redirect_to_home = [
      '/metadata/metadata_edit_form',
      '/metadata/metadata_file_list',
      '/metadata/metadata_files',
      '/metadata/metadata_upload'
    ];
    var url = req.body.return_to_url || '/';
    if (redirect_to_home.indexOf(req.body.return_to_url) !== -1) {
      url = '/';
    }
    
    
   //  console.log(PROJECT_INFORMATION_BY_PID[283])
//     console.log('USER_GROUPS3')
//     console.log(USER_GROUPS)
//     console.log('ALL_USERS_BY_UID')
//     console.log(ALL_USERS_BY_UID)
    for(uid in ALL_USERS_BY_UID){
        if( ALL_USERS_BY_UID[uid].hasOwnProperty('groups') && (ALL_USERS_BY_UID[uid].groups).length > 0){
            for(i in ALL_USERS_BY_UID[uid].groups){
                var gp = ALL_USERS_BY_UID[uid].groups[i];
                pid_list = USER_GROUPS[gp]
                for(j in pid_list){
                    var pid = pid_list[j]
                    
                    //console.log('pushing uid '+uid+' to pid '+pid)
                    //console.log(PROJECT_INFORMATION_BY_PID[pid].permissions)
                    //console.log('pushing uid2')
                    if(PROJECT_INFORMATION_BY_PID.hasOwnProperty(pid) && PROJECT_INFORMATION_BY_PID[pid].permissions.indexOf(parseInt(uid)) == -1){
                        //console.log('2pushing uid '+uid+' to pid '+pid)
                        PROJECT_INFORMATION_BY_PID[pid].permissions.push(parseInt(uid))
                    }
                    
                    
                }
                
            }
        }
     
    }
    //console.log(PROJECT_INFORMATION_BY_PID)
    
    fs.ensureDir(data_dir, function (err) {
        if(err) {console.log(err);} // => null
        else{
            console.log('Checking USER_FILES_BASE: '+data_dir+' Exists - yes');
            fs.chmod(data_dir, 0777, function (err) {
                if(err) {console.log(err);} // ug+rwx
                else{
                    console.log('Setting USER_FILES_BASE permissions to 0775');
                    console.log('=== url ===: req.body.return_to_url');
                    console.log(url);
                    
                    //console.log('USER',req.user)
                    res.redirect(url);    
                    delete req.session.returnTo;
                    req.body.return_to_url = '';
                }
            });
        }
    });
    
    
    
  }
);



// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function(req, res) {
        new_user = {};
        // render the page and pass in any flash data if it exists
        console.log('new_user--signup');
        //console.log(new_user)
        res.render('user_admin/signup', { 
                            title   : 'VAMPS:signup',
                            user    : req.user,
                            hostname: req.CONFIG.hostname,
                            new_user: new_user
        });
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
                successRedirect : '/users/profile', // redirect to the secure profile section
                failureRedirect : 'signup', // redirect back to the signup page if there is an error
                failureFlash : true         // allow flash messages
}));

// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
router.get('/profile', helpers.isLoggedIn, function(req, res) {
    console.log('PROFILE')    
    res.render('user_admin/profile', {
          title:'VAMPS:profile',
          user : req.user,hostname: req.CONFIG.hostname // get the user out of session and pass to template
    });        

});

// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
// =====================================
// CHANGE PASSWORD =====================
// =====================================
router.get('/change_password', helpers.isLoggedIn, function(req, res) {
  console.log('In change_password for logged in users');


  res.render('user_admin/change_password', {
              title     :'VAMPS:change-password',
              form_type : 'update',
              user      : req.user, hostname: req.CONFIG.hostname // get the user out of session and pass to template
            });  
});
router.get('/change_password/:id', function(req, res) {
    console.log('In change_password for forgotten passwords');
    // should be private but not logged in
    console.log(req.params)
    var file_code_path = path.join(req.CONFIG.TMP_FILES,'tmp','resetPW-'+req.params.id+'.json')
    console.log(file_code_path)
    // if file exists then valid? (or confirm some file content?) -- delete file after success
    //if(helpers.fileExists(file_code_path)){
    fs.readFile(file_code_path, function(err,data){
        if(err){
            console.log('No file exists -- does not validate -1!!')
            res.redirect('/')
            return
        }
        var data = JSON.parse(data)
        console.log('File exists -- Validated!!')
        res.render('user_admin/change_password', {
              title     : 'VAMPS:change-password',
              form_type : 'forgotten2',
              code      : req.params.id,
              username  : data.username,
              uid       : data.uid,
              hostname  : req.CONFIG.hostname // get the user out of session and pass to template
        });  
    })
    
});
//
//
//
router.post('/change_password',  passport.authenticate('local-reset', { 
                                        successRedirect: '/users/login',        successFlash: true,
                                        failureRedirect: '/users/change_password',failureFlash: true 
                                 })
);
//
//
//
router.get('/update_account', helpers.isLoggedIn, function(req, res) {
  console.log('In GET::update_account');

  res.render('user_admin/update_account', {
              title     :'VAMPS:update-account',
              user      : req.user, hostname: req.CONFIG.hostname // get the user out of session and pass to template
            });  
});
router.post('/update_account', helpers.isLoggedIn, function(req, res) {
    console.log('In POST::update_account');
    console.log(req.body)
    
    //console.log(ALL_USERS_BY_UID[req.body.uid])
    var inst  = req.body.new_institution
    var email = req.body.new_email
    
    if (!validator.isEmail(email)) {
      req.flash('fail', 'Email address is empty or the wrong format.');
      res.redirect('/users/update_account');
      return;
    }
    if (validator.isEmpty(inst) || inst.length > 100) {
      req.flash('fail', 'Institution name is required. (size limit=100chars)');
      res.redirect('/users/update_account');
      return;
    }
    if(req.body.uid != req.user.user_id){
        console.log('No match - get out of here.')
        req.flash('fail', 'Something went wrong - exiting');
        res.redirect('/users/update_account');
        return;
    }
    if(email == ALL_USERS_BY_UID[req.body.uid].email && inst == ALL_USERS_BY_UID[req.body.uid].institution){
        console.log('No Update Needed')
        req.flash('success', 'No Update Needed - Exiting');
        res.redirect('/users/update_account');
    }else{
        var query = "UPDATE user set email='"+email+"', institution='"+inst+"' where user_id='"+req.body.uid+"'"
        req.db.query(query, function (err, rows, fields){
            if (err)  {
                req.flash('fail', 'Something went wrong with update - exiting');
                res.redirect('/users/update_account');
                return;
            }else{
                req.flash('success', 'Update Success');
                ALL_USERS_BY_UID[req.body.uid].email        = email
                ALL_USERS_BY_UID[req.body.uid].institution  = inst
                res.redirect('/users/update_account');
            }
        })
    }
    
});
//
//
router.get('/forgotten_password', function(req, res) {
    console.log('IN GET::forgotten_password')
    res.render('user_admin/change_password', {
          title     :'VAMPS:forgotten-password',
          form_type : 'forgotten1',
           hostname: req.CONFIG.hostname // get the user out of session and pass to template
        });
});
//
//
router.post('/reset_password1', function(req, res) {
    console.log('IN POST::reset_password1')
    console.log(req.body);
    //{ username: 'avoorhis', email: 'avoorhis@mbl.edu' }
    // create new password and send via email to user
    //if username empty or not in users throw error
    // if email not email format or not in users throw error
    
    var email = req.body.email
    var username = req.body.username
    if (validator.isEmpty(username) || username.length > 30) {
      req.flash('fail', 'username is required.');
      res.redirect('/users/forgotten_password');
      return;
    }
    if (!validator.isEmail(email)) {
      req.flash('fail', 'Email address is empty or the wrong format.');
      res.redirect('/users/forgotten_password');
      return;
    }
    var query = "SELECT user_id from user where username='"+username+"' and email ='"+email+"'"
    console.log(query)
    req.db.query(query, function(err, rows, fields){
        if (err)  {
                req.flash('fail', 'We cannot find that username--email combination. Please contact us [vamps@mbl.edu] for assistance.');
                res.redirect('/users/forgotten_password');
                return;
        }else{
                if(rows.length !== 1){
                    req.flash('fail', 'We cannot find that username--email combination. Please contact us [vamps@mbl.edu] for assistance.');
                    res.redirect('/users/forgotten_password');
                    return;
                }
                let transporter = nodemailer.createTransport(req.CONFIG.smtp_connection_obj) 
                console.log(rows)
                var uid = rows[0].user_id
      
                // verify connection configuration
                //create unique link: vamps2.mbl.edu/users/change_password?123xyz
                //var link;
                var rando = Math.floor((Math.random() * (999999 - 100000 + 1)) + 100000);
                var link = req.CONFIG.server_url+'/users/change_password/'+rando
                // if(req.CONFIG.hostname == 'localhost'){
//                     link = req.CONFIG.server_url+'/users/change_password/'+rando
//                 }else{
//                     link = 'https://vamps2.mbl.edu/users/change_password/'+rando
//                 }
                // write json file to 
                var file_path = path.join(req.CONFIG.TMP_FILES,'tmp','resetPW-'+rando+'.json')
                console.log(file_path)
                var file_text = { "username":username, "uid":uid, "email":email }
                var message = {
                  from: "vamps@mbl.edu",
                  to:  email,
                  subject: "Reset VAMPS Password",
                  text: link +" <-- Follow this link to re-set your password.",
                  html: "<p>To reset your VAMPS password follow the link below:<br><br><a href=\""+link+"\">"+link+"</a></p>"
                };
                //console.log(message)
                fs.writeFile(file_path, JSON.stringify(file_text), {mode: 0775}, function(err) {
                      if(err) {return console.log(err);}
                      else{
          
                        transporter.verify(function(error, success) {
                            if (error) {
                                console.log(error);
                                req.flash('fail', 'Something went wrong with request. Please send an email to: vamps@mbl.edu');
                                res.redirect('/users/forgotten_password');
                                return;
                            } else {
                                console.log("Server is ready to take our messages");
                            }
                        });
                        transporter.sendMail(message, (error, info) => {
                            if (error) {
                                console.log('Error occurred');
                                console.log(error.message);            
                                req.flash('fail', 'Something went wrong with request. Please send an email to: vamps@mbl.edu');
                                res.redirect('/users/forgotten_password');
                                return;
                            }

                            console.log('Message sent successfully!');
        
                        });
                        req.flash('success', 'Email Sent To: '+email);
                        res.redirect('/users/forgotten_password')
                 }
                })
                
                
                
        }
    })
    
    
});
//
//
//
router.post('/reset_password2', function(req, res) {
    console.log('IN POST::reset_password2')
    console.log(req.body);
    var queries       = require('../routes/queries_admin');
    var new_password = req.body.new_password
    var confirm_password = req.body.confirm_password
    if (!validator.equals(new_password, confirm_password)) {
      req.flash('fail', 'Passwords do not match!');
      res.render('user_admin/change_password', {
              title     : 'VAMPS:change-password',
              form_type : 'forgotten2',
              code      : req.body.code,
              username  : req.body.username,
              uid       : req.body.uid,
              hostname  : req.CONFIG.hostname // get the user out of session and pass to template
        }); 
        return 
    }
    if (!validator.isLength(new_password, {min: 6, max: 12})) {
      req.flash('fail', 'Password must be between 6 and 12 characters.');
      res.render('user_admin/change_password', {
              title     : 'VAMPS:change-password',
              form_type : 'forgotten2',
              code      : req.body.code,
              username  : req.body.username,
              uid       : req.body.uid,
              hostname  : req.CONFIG.hostname // get the user out of session and pass to template
        }); 
        return 
    }
    // validate existence of file -- then delete it
    // file has been validated and deleted in router.get('/change_password/:id', function(req, res) {
    var file_code_path = path.join(req.CONFIG.TMP_FILES,'tmp','resetPW-'+req.body.code+'.json')
    //read file and validate username & email
    fs.readFile(file_code_path, function(err,data){
        if(err){
            console.log('No file exists -- does not validate -2!!')
            res.redirect('/')
            return
        }
        var data = JSON.parse(data)
        // now delete file
        console.log('Deleting: '+file_code_path)
        // This will delete file leaving no trace....
        //fs.unlinkSync(file_code_path);
       
        // now valid must enter new PW in database and return user to logon screen
    
        console.log('Trying: '+queries.reset_user_password_by_uid(new_password, req.body.uid))
        req.db.query(queries.reset_user_password_by_uid(new_password, req.body.uid), function(err, rows, fields){
            if(err){ console.log(err);return }
            console.log('Success -- password Updated')
            req.flash('success', 'Password updated! Password updated! Password updated! Password updated! Password updated!');
            res.redirect('/users/login')
            return
        })
    }); 
    
});
router.get('/:id', helpers.isLoggedIn, function(req, res) {
   
   var uid = req.params.id
   console.log(ALL_USERS_BY_UID[uid]);
   console.log('in indexusers:id')
   //console.log(req.user)
   if(ALL_USERS_BY_UID[uid] == undefined ){
    res.render('index', {
        title: 'VAMPS:Home',
        user: req.user, 
        hostname: req.CONFIG.hostname 
     });
     return;  
   }else{
           var qSelect = "SELECT * from project where owner_user_id='"+uid+"'";
           console.log(qSelect)
           var collection = req.db.query(qSelect, function (err, rows, fields){
            if (err)  {
              msg = 'ERROR Message '+err;
              helpers.render_error_page(req,res,msg);
            } else {
                res.render('users/profile', {
                  title     :'VAMPS:profile',
                  projects  : rows,
                  user_info : JSON.stringify(ALL_USERS_BY_UID[uid]),
                  user      : req.user, hostname: req.CONFIG.hostname // get the user out of session and pass to template
                });  
     

            }
          });
    }

});



module.exports = router;
