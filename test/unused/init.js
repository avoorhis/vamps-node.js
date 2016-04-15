var app = require('../app')
// Fake user login with passport.
app.mockPassportInitialize = function () {
    var passport = require('passport');
    passport.initialize = function () {
        return function (req, res, next) {
            passport = this;
            passport._key = 'passport';
            passport._userProperty = 'user';
            passport.serializeUser = function(user, done) {
                return done(null, user.id);
            };
            passport.deserializeUser = function(user, done) {
                return done(null, user);
            };
            req._passport = {
                instance: passport
            };
            req._passport.session = {
                user: new app.models.User({ id: 1, name: 'Joe Rogan' })
            };

            return next();
        };
    };
};
