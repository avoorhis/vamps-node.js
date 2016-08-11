var superagent = require('superagent');
var agent = superagent.agent();
var theAccount = {
  "username": "TEST",
  "password": "TEST"
};

exports.login = function (request, done) {
  request
    .post('/users/login')
    .send(theAccount)
    .end(function (err, res) {
      if (err) {
        throw err;
      }
      agent.saveCookies(res);
      done(agent);
    });
};