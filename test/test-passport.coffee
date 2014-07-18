users = require './../data/users'

data = users: []
data.users.anon = authenticated: false
data.users.admin = users[0]  
data.users.jk = users[1]  
data.users.artle = users[5] 
data.users.beountain = users[4] 

setSession = (userKey) ->
  if data.users[userKey]?
    global.session = data.users[userKey]
  else
    global.session = data.users.admin


module.exports =

  setSession: setSession

  initialize: (app) ->

    # default to admin
    global.session = data.users.admin

    (req, res, next) ->
      passport = @
      passport._key = 'passport'
      passport._userProperty = 'user'
      passport.serializeUser = (user, done) -> done null, user
      passport.deserializeUser = (user, done) -> done null, global.session

      req._passport = instance: passport

      req._passport.session = user: session

      # allow us to change the session from the client in integration tests
      app.get '/set-session/:id', (req, r) =>
        setSession req.params.id
        r.send { set: data.users[req.params.id] }

      next()