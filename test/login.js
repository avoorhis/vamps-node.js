
// passportStub = require('passport-stub')
// request      = require('supertest')
// app          = require('../app')

// passportStub.install(app);
// req = request(app)

// describe('GET /visuals/visuals_index', function(){

//   it('responds with 401 if not logged in', function(done){
//     req.get('/visuals/visuals_indexd').expect(401).end();done()
//   })

//   it('responds with 200 when logged in', function(done){
//     passportStub.login({
//           username: 'TEST', password: 'TEST'
//     });
//     req.get('/visuals/visuals_indexd').expect(201).end();done()
//   })
// })
process.env.NODE_ENV = 'testing'
var util = require('util');
var async = require('async'),
//passportStub = require('passport-stub'),
    request = require('supertest'),
    superagent = require('superagent'),
    should = require('should'),
    expect = require('chai').expect,

    app = require('../app')


//     //connection = require('../config/database-test');

//passportStub.install(app)
var agent = request.agent(app);
//process.env.NODE_ENV = 'test';
describe('<<< Sessions >>>', function() {
  var login_profile = {  // need test login here
                username: 'TEST',
                password: 'TEST',
              };
  var signup_profile = {
                username: 'username',
                userfirstname: 'firstname',
                userlastname: 'lastname',
                useremail: 'email',
                password: 'password',
                userinstitution: 'institution'
              };
              
  it('Should create a session', function(done) {
    agent.get('/users/login')
    .send(login_profile)
    .end(function(err, res) {
      if (err) console.log('error' + err.message);
      console.log('status code1: ' + res.status);
      agent.get('/users/profile')
      .end(function(err, res){
        console.log('status code2: ' + res.status);
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

  it('Should return the current session', function(done) {
    agent.get('/users/signin').end(function(err, res) {
      expect(res.status).to.equal(200);
      done();
    });
  });
});





// describe('admin_index:', function () {
//     before(function(done){
//               var profile = {
//                 username: 'username',
//                 userfirstname: 'firstname',
//                 userlastname: 'lastname',
//                 useremail: 'email',
//                 password: 'password',
//                 userinstitution: 'institution'
//               };
//         request(app)
//           .post('/users/signup')
//           .send(profile)
//           .end(function(err,res){
//               if(err)
//                 {
//                   console.log(err);
//                 }
//               console.log(res.request._data);
//               res.status.should.equal(200);
//               responseemail = res.body.email;
//               done();

//           });

//     });



  // it 'responds with 401 if not logged in', (done) ->
  //   req.get('/admin').expect(401).end done

  // it 'responds with 200 when logged in', (done) ->
  //   passportStub.login username: 'john.doe'
  //   req.get('/admin').expect(200).end done

  // it('responds with 401 if not logged in', function(done){
  //     request(app)
  //     .get('/admin/admin_index').expect(401)
  //     .end(function (err, res) {

  //       done();
  //     });
  // });

  // it('responds with 200 when logged in', function(done){
  //     request(app)
  //     .get('/admin/admin_index')
  //     .end(function (err, res) {
  //       passportStub.login({username: 'john.doe'})

  //       done();
  //     });
  // });

//});
