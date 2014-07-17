express = require 'express'
passport = require 'passport'
passportMock = require './mock-passport-middleware'
 
mockUser = name: { givenName: "Jonathon", familyName: "Kresner" }
 
global.app = express()
 
app.configure ->
  app.use express.static(__dirname + '/public')
  app.use express.bodyParser()
  app.use express.cookieParser()
 
  app.use express.session { secret: 'your secret' }
 
  # use our passportMock middleware instead of original passport.initialize()
  # app.use passport.initialize()
  app.use passportMock.initialize( mockUser )  # pass in the object wanted as session/user
  app.use passport.session()
