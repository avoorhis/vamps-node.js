module.exports = {
  console.log('In prepApp'); 
  prepApp: function (done) {
    var app = getApp();
    compound = app.compound;
    compound.on('configure', function () { app.mockPassportInitialize(); });
    compound.on('ready', function () { done(); });
    return app;
  }
};