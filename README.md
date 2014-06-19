# VAMPS rendition using Node.js (javascript)

# to run this program first install Node.js (http://nodejs.org/)
# look in package.json to see required modules
# to update modules:
> npm update

# Start this with
> npm start

# to refresh anew via git
git reset --hard HEAD

#  if this error occurs it is likely
# the server is already running
events.js:72
        throw er; // Unhandled 'error' event

## test using mocha
> make test
OR
> mocha

# MySQL db schema is included in root dir as: db_schema.sql


# TODO TODO
# Testing!
# projects/:id via REST
# user login and auth