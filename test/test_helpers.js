var express = require('express');
var passport = require('passport');

module.exports = {
  prepApp: function (done) {
    // var app = getApp();
    var app = express();
    console.log(app);
    // compound = app.compound;
    app.use(mockPassportInitialize());
    // app.on('configure', function () { app.mockPassportInitialize(); });
    app.on('ready', function () { done(); });
    return app;
  }
};