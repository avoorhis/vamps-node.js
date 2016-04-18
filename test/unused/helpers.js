module.exports = {
    prepApp: function (done) {
        console.log('In prepApp');
        var app = require('../app')
        compound = app.compound;
        compound.on('configure', function () { app.mockPassportInitialize(); });
        compound.on('ready', function () { done(); });
        return app;
    }
};
