require('should-http');

var express = require('express')
  , app = express()
  // , request = require('../../')
  , request = require('superagent')
  , assert = require('assert')
  , should = require('should')
  , cookieParser = require('cookie-parser')
  , session = require('express-session');

app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// app.use(session({
//   secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: true
// })); // session secret


app.post('/signin', function(req, res) {
  req.session.user = 'hunter@hunterloftis.com';
  res.redirect('/dashboard');
});

app.post('/setcookie', function(req, res) {
  res.cookie('cookie', 'jar');
  res.sendStatus(200);
});

app.get('/getcookie', function(req, res) {
  res.status(200).send(req.cookies.cookie);
});

app.get('/dashboard', function(req, res) {
  if (req.session.user) return res.status(200).send('dashboard');
  res.status(401).send('dashboard');
});

app.all('/signout', function(req, res) {
  req.session.regenerate(function() {
    res.status(200).send('signout');
  });
});

app.get('/', function(req, res) {
  if (req.session.user) return res.redirect('/dashboard');
  res.status(200).send('home');
});

app.post('/redirect', function(req, res) {
  res.redirect('/simple');
});

app.get('/simple', function(req, res) {
  res.status(200).send('simple');
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('request', function() {
  describe('persistent agent', function() {
    var agent1 = request.agent();
    var agent2 = request.agent();
    var agent3 = request.agent();
    var agent4 = request.agent();

    it('should gain a session on POST', function(done) {
      agent3
        .post(base + '/signin')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          should.not.exist(res.headers['set-cookie']);
          res.text.should.containEql('dashboard');
          done();
        });
    });

    it('should start with empty session (set cookies)', function(done) {
      agent1
        .get(base + '/dashboard')
        .end(function(err, res) {
          should.exist(err);
          res.should.have.status(401);
          should.exist(res.headers['set-cookie']);
          done();
        });
    });

    it('should gain a session (cookies already set)', function(done) {
      agent1
        .post(base + '/signin')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          should.not.exist(res.headers['set-cookie']);
          res.text.should.containEql('dashboard');
          done();
        });
    });

    it('should persist cookies across requests', function(done) {
      agent1
        .get(base + '/dashboard')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          done();
        });
    });

    it('should have the cookie set in the end callback', function(done) {
      agent4
        .post(base + '/setcookie')
        .end(function(err, res) {
          agent4
            .get(base + '/getcookie')
            .end(function(err, res) {
              should.not.exist(err);
              res.should.have.status(200);
              assert(res.text === 'jar');
              done();
            });
        });
    });

    it('should not share cookies', function(done) {
      agent2
        .get(base + '/dashboard')
        .end(function(err, res) {
          should.exist(err);
          res.should.have.status(401);
          done();
        });
    });

    it('should not lose cookies between agents', function(done) {
      agent1
        .get(base + '/dashboard')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          done();
        });
    });

    it('should be able to follow redirects', function(done) {
      agent1
        .get(base)
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          res.text.should.containEql('dashboard');
          done();
        });
    });

    it('should be able to post redirects', function(done) {
      agent1
        .post(base + '/redirect')
        .send({ foo: 'bar', baz: 'blaaah' })
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          res.text.should.containEql('simple');
          res.redirects.should.eql([base + '/simple']);
          done();
        });
    });

    it('should be able to limit redirects', function(done) {
      agent1
        .get(base)
        .redirects(0)
        .end(function(err, res) {
          should.exist(err);
          res.should.have.status(302);
          res.redirects.should.eql([]);
          res.header.location.should.equal('/dashboard');
          done();
        });
    });

    it('should be able to create a new session (clear cookie)', function(done) {
      agent1
        .post(base + '/signout')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          should.exist(res.headers['set-cookie']);
          done();
        });
    });

    it('should regenerate with an empty session', function(done) {
      agent1
        .get(base + '/dashboard')
        .end(function(err, res) {
          should.exist(err);
          res.should.have.status(401);
          should.not.exist(res.headers['set-cookie']);
          done();
        });
    });
  });
});
// var request = require('superagent');
// var user_aut = request.agent();
// var util = require('util');
//     // console.log(util.inspect(app.testuser, false, null));
// user_aut
//   .post('http://localhost:3000/users/login')
//   .send({ username: 'TEST',
//           pass: 'TEST' })
//   .end(function(err, res) {
//     console.log("YYY");
//     console.log(util.inspect(res, false, null));
//
//     // user1 will manage its own cookies
//     // res.redirects contains an Array of redirects
//   });
//
//   describe('POST /user_data/import_choices', function(){
//     it('should return 201 for image creation after login', function (done) {
//       user_aut
//         .get('/user_data/import_choices')
//         // .send({name: 'test.png'})
//         .end(function (err, res) {
//           if (err) return done(err);
//           console.log("TTT");
//           console.log(util.inspect(res.text, false, null));
//           console.log("111");
//           console.log(util.inspect(res, false, null));
//
//           res.status.should.be.equal(201);
//           done();
//         });
//     });
//   });


// 'use strict';
// var should = require('should');
//
// describe('addition', function () {
//   it('should add 1+1 correctly', function (done) {
//     var onePlusOne = 1 + 1;
//     console.log("onePlusOne = " + onePlusOne);
//     onePlusOne.should.equal(2);
//     // must call done() so that mocha know that we are... done.
//     // Useful for async tests.
//     done();
//   });
// });

// var request = require('supertest'),
//     app = require('../app'),
//     should = require('should')
// var util = require('util');
//     // console.log(util.inspect(app.testuser, false, null));
//
//
// describe('auth testing', function() {
//   var agent = request.agent(app); // revised
//
//   beforeEach(function(done) {
//
//       agent.get('/users/login') // revised
//         .auth('TEST', 'TEST')
//               // .expect("set-cookie", "check correct cookie here") // appended
//           .end(function(err, res) {
//               should.not.exist(err);
//               agent.saveCookies(res);
//               console.log("CCC agent.res");
//               console.log(util.inspect(agent.res, false, null));
//
//               // or write some code to check your cookie here
//               done();
//           });
//   });
//
//   it('should correctly make an authenticated request', function(done){
//       agent
//           .get('/user_data/import_choices')
//           .end(function(err,res) {
//               if (err) {
//                   throw err;
//               }
//               console.log("RRR res.text")
//               console.log(util.inspect(res.text, false, null));
//
//               res.status.should.be.equal(200);
//               done();
//           });
//   });
//
// });
// ===
// var supertest = require('supertest');
// describe('Routing', function() {
//     var url = 'http://localhost:3000';
//     var server = supertest.agent(url);
//
//     var credentials = {
//         username: 'TEST',
//         pass: 'TEST'
//     };
//
//
//     describe('Login', function() {
//
//         beforeEach(function (done) {
//           server
//             .post('/users/login')
//             .send(credentials)
//             .end(function(err, res) {
//                 if (err) {
//                     throw err;
//                 }
//                 server.saveCookies(res);
//                 done();
//             });
//         });
//
//
//         it('should login ok given valid credentials', function(done) {
//             server
//                 .post('/users/login')
//                 .send(credentials)
//                 .end(function(err, res) {
//                     if (err) {
//                         throw err;
//                     }
//                     server.saveCookies(res);
//                     done();
//                 });
//         });
//
//
//         it('should correctly make an authenticated request', function(done){
//             server
//                 .get('/user_data/import_choices')
//                 .end(function(err,res) {
//                     if (err) {
//                         throw err;
//                     }
//                     res.status.should.be.equal(200);
//                     done();
//                 });
//         });
//     });
// });

// ===
// .field('user', 'myUsername') and .field('pass', 'myPassword').
// ===
// var app = require('../app');
// var request = require('supertest')(app);
// var login = require('./login_test');
//
// describe('MyApp', function () {
//
//   var agent;
//
//   beforeEach(function (done) {
//     login.login(request, function (loginAgent) {
//       agent = loginAgent;
//       done();
//     });
//   });
//
//   it('should allow access to admin when logged in', function (done) {
//     var req = request.get('/user_data/import_choices');
//     agent.attachCookies(req);
//     req.expect(200, done);
//   });
//
// });
// ===
// var request = require('supertest'),
//     should = require('chai').should();
//     var util = require('util');
//     // console.log(util.inspect(app.testuser, false, null));
//
// describe('ImageController', function() {
//   var agent = request.agent('http://localhost:3000/');
//
//   beforeEach(function(done){
//       agent
//         .post('/users/login')
//         .send({username: 'TEST', password: 'TEST'})
//         .end(function(err, res) {
//           if (err) return done(err);
//
//           done();
//         });
//   })
//
//   afterEach(function(done){
//       agent
//         .get('/logout')
//         .end(function(err, res) {
//           if (err) return done(err);
//
//           done();
//         });
//   })
//
//   describe('POST /user_data/import_choices', function(){
//     it('should return 201 for image creation after login', function (done) {
//       agent
//         .get('user_data/import_choices')
//         // .send({name: 'test.png'})
//         .end(function (err, res) {
//           if (err) return done(err);
//           console.log("TTT");
//           console.log(util.inspect(res.text, false, null));
//           console.log("111");
//           console.log(util.inspect(res, false, null));
//
//           res.status.should.be.equal(201);
//           done();
//         });
//     });
//   });
// });