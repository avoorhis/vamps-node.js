VAMPS rendition using Node.js (javascript)
=========
Visualization and Analysis of Microbial Population Structures
-----------------

To run this program first install Node.js (http://nodejs.org/)
look in package.json to see required modules

To update modules:
	* npm update

Start this project:
	* npm start

To refresh anew via git
	* git fetch --all
	* git reset --hard origin/master

If this error occurs it is likely
the server is already running
	* events.js:72
        * throw er; // Unhandled 'error' event

Test using mocha
	* make test
	OR
	* mocha

MySQL db schema is included in root dir as: db_schema.sql

Install nodemon to keep from restarting server after changes
sudo npm install nodemon -g
Then run as: nodemon bin/www 

TODO TODO
	* Testing!
	* DONE:   projects/:id via REST
	* DONE:   user login and auth
