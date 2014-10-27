VAMPS rendition using Node.js (javascript)
=========
Visualization and Analysis of Microbial Population Structures
-----------------

To run this program first install Node.js (http://nodejs.org/)
look in package.json to see required modules or run
 * (sudo) npm -g install

To update modules:
  * npm update

To refresh anew via git
  * git fetch --all
  * git reset --hard origin/master

If this error occurs it is likely
the server is already running
  * events.js:72
    * throw er; // Unhandled 'error' event

--- START ---

Start this project:
  * npm start

Install nodemon to keep from restarting server after changes
  * sudo npm install nodemon -g
Then run as: 
  * nodemon bin/www

--- TESTS ---

Test using mocha
  * make test
  OR
  * mocha

To check code quality:
  * plato -r -x public/javascripts/jquery-2.1.1.min.js -d reports public app.js views routes models config 

Then see file vamps-node.js/reports/index.html in a browser.

--- DB ---

MySQL db schema is included in root dir as: db_schema.sql

Applying new database schema from vamps2 (on vampsdev)
  I will record all alterations to the database here:
  
  CREATE TABLE custom_metadata_fields (
    custom_metadata_fields_id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    project_id int(11) unsigned NOT NULL,
    field_name varchar(32) NOT NULL DEFAULT '',
    field_type varchar(16) NOT NULL DEFAULT 'varchar(128)',
    example varchar(128) NOT NULL,
    PRIMARY KEY (custom_metadata_fields_id),
    UNIQUE KEY project_id_field_name (project_id,field_name),
    KEY project_id (project_id),
    CONSTRAINT custom_metadata_fields_ibfk_1 FOREIGN KEY (project_id) REFERENCES project (project_id) ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=latin1;


--- Dir structure ---
routes - server side logic
views - html/ejs
models - data retrieval (db for now, hdf5 in the future) 
public - client side, cached with an expiration time
sbin - additional scripts


--- TODO ---
  * Testing!
  * Refactoring!
  * DONE:   projects/:id via REST
  * DONE:   user login and auth
  * add 960.gs grid to pages


