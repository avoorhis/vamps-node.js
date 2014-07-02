// // var async = require('async'),
// //     request = require('supertest'),
// //     should = require('should'),
// //     app = require('../app'),
// //     connection = require('../config/database-test');
// 
// process.env.NODE_ENV = 'test';
// var app = require('../app'),
// 		connection = require('../config/database-test');
// var Browser = require('zombie');
// 
// describe('Form page functionality', function(){
// 
// 
// 
// 	// (Username
// 	//  Password
// 	//  First Name
// 	//  Last name
// 	//  Email
// 	//  Institution)
// 	it('The register page should show a register form');
// 	it('The register page should refuse empty submissions');
// 	it('The register page should refuse partial submissions');
// 	it('The register page should keep values on partial submissions');
// 	it('The register page should refuse invalid emails');
// 	it('The register page should accept complete submissions (userfirstname / userlastname / useremail / userinstitution)');
// 	it('The register page succsessful registration should redirect to users/profile');
// 	it('The profile page (users/profile) should have "Profile Page" and all user info + UserID');
// 	it('The register page should give a message and redirect back to "/users/signup" if the username exists');
// 	it('The register page should have the link to the login page.');
// 
// })
// // 
// // 
// // 	
// // 	/* What's this doing? */
// //   before(function (done) {
// //     this.timeout(5000);
// //     async.series([
// //       function (cb) {
// //         connection.query(
// //           'SELECT * FROM mocha_test_table WHERE fname="TEST'+
// //           '" AND lname="TEST";',function(err,results){
// //             done();
// //           });
// //       }
// //     ], done);
// //   });
// // 
// //   it('Text on form page', function(done){
// //     request(app)
// //       .post('/users/login')
// //       .expect(200)
// //       // .send({ username: 'TEST', email: 'TEST'})
// //       .send({ username: 'TEST', password: 'TEST'})
// //       .end(function (err, res) {
// //         res.text.should.include('Form');
// //         it('Need to be able to see the text for input box', function(done){
// //           res.text.should.include('<input type="text" name="fname">');
// //           done();
// //         });
// //         it('Need to be able to see all the previous inputs listed', function(done){
// //           res.text.should.include('<div> TEST TEST TEST TEST </div>');
// //           done();
// //         });
// //         done();
// //       });
// //   });
// //   
// //   it('Need to be able enter lname/fname values', function(done){
// //     request(app)
// //       .post('/form')
// //       .expect(200)
// //       .send({ username: 'TEST', email: 'TEST', fname: 'TEST1', lname: 'TEST1'})
// //       .end(function (err, res) {
// //         it('Need to be able to see entry in the database', function(done){
// //           connection.query(
// //             'SELECT * FROM mocha_test_table WHERE fname="TEST'+
// //             '" AND lname="TEST";',function(err,results){
// //               results.length.should.not.equal(0);
// //         console.log('here');
// //               done();
// //             });
// //         });
// //         it('Need to be able to see entry on the page', function(done){
// //           res.text.should.include('<div> TEST TEST TEST1 TEST1 </div>');
// //           done();
// //         });
// // 
// //         it('Need to see the link to the login page', function(done){
// //           res.text.should.include('<a href="/login">Exit</a>');
// //           done();
// //         });
// //         done();
// //       });
// //     });
