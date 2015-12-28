VAMPS rendition using Node.js (javascript)
=========
Visualization and Analysis of Microbial Population Structures
-----------------

INSTALL
--------------

**(Optional install method using VirtualBox and Vagrant -see below)**

**Requirements**
 * MySQL (https://www.mysql.com/, downloads are under http://dev.mysql.com/downloads/mysql/)
 * Node.js (http://nodejs.org/)
 * Python (https://www.python.org/) 
  (required python modules: numpy,scikit-bio,qiime,cogent,illumina-utils)
 * 'git' (https://help.github.com/articles/set-up-git/)

 
 For some additional functionality:
 * R (http://cran.r-project.org/doc/manuals/r-release/R-admin.html) 
 (Used for frequency heatmaps 
 --required modules:pheatmap,RColorBrowser,gtables,jsonlite,permute,vegan,Rcpp,colorspace,labeling,munsell,plyr,scales)

 * Emperor (Qiime's module, http://qiime.org/install/index.html) (Used for 3D PCoA visualizations)
 * Perl (https://www.perl.org/)  (used in GAST Taxonomic assignments)

**Install the source code**
 * run 'git clone https://github.com/avoorhis/vamps-node.js.git'.
Which will create the directory 'vamps-node.js'.

**Install node packages**
 * Move into the vamps-node.js directory ('cd vamps-node.js')
 * run: (sudo) npm install
 * (optional) look in file 'package.json' to see required modules.

**Install MYSQL database schema**
 * There are two mysql database schemas included in the vamps-node.js installation.
One has some data included that you can use in visualizations:
  db_schema.sql (update 9-4-2015)
  db_schema_w_test_data.sql (they may be compressed files)
Create a new database in your mysql installation and install one of the schemas in it.
 * Create a new file in the vamps-node.js/config directory named 'db-connection.js' with the contents as shown below.
 * In the new file fill in the correct values for the database name and mysql user and password.

**Sample config/db-connection.js**
```
  ////
  ///
  //
  NODE_DATABASE = 'vamps_starter'
  //
  ///
  ////

  var db_config = {
    host     : 'localhost',
    user     : 'mysql-username',
    password : 'mysql-password',
    database :  NODE_DATABASE,
    socketPath: '/tmp/mysql.sock'
  };
```
**Before starting the server**
 * Once the database is in place but before you start the server for the first time
go into the public/scripts directory and run the INITIALIZE_ALL_FILES.py script. 

   ```
   cd public/scripts; python INITIALIZE_ALL_FILES.py
   ```
  
   This script requires that you have a .my.cnf file in your home directory
(read about .my.cnf files here: https://dev.mysql.com/doc/refman/5.1/en/option-files.html).
The script will prompt you for a database - just enter the one you created above.
It may take awhile especially if the database is large, but it is required
to create the helper files that reside in the /public/json directory.
 * For the visualizations to work correctly you also need to fill in the correct paths
to various programs on your computer. Have a look at the bottom of the constants.py file
in the /public directory and change the paths to match your system. 

START the SERVER
----------------

Start the server:
  * run 'npm start' from the base of the vamps-node.js directory
  * If you've installed the schema with data (db_schema_w_test_data.sql), you can log in with the guest
  account (username:'guest'; password:'guest'), otherwise you should register a new account.

Optional: Install 'nodemon' to keep from restarting server after changes to the code.
* sudo npm install nodemon -g
* Then run as: 'nodemon bin/www'
* restart with rs
  
Optional: Install 'forever' which should re-start the server after a fatal crash.
* sudo npm install forever -g
* Then run as: 'forever bin/www'

* run both 'nodemon' and 'forever': 'forever -c nodemon bin/www'

----------------
OPTIONAL INSTALLATION METHOD USING VirtualBox and Vagrant
---------------

**Download and Install VirtualBox (https://www.virtualbox.org/)**

**Download and Install Vagrant (https://www.vagrantup.com/)**

Install the source code:
* run 'git clone https://github.com/avoorhis/vamps-node.js.git'.

Which will create the directory 'vamps-node.js'.
* Move into the vamps-node.js directory ('cd vamps-node.js')
* Run the command 'vagrant up'

UPDATE
---------------
To update modules:
  * npm update

To refresh anew via git
  * git fetch --all
  * git reset --hard origin/master

If this error occurs it is likely
the server is already running
  * events.js:72
    * throw er; // Unhandled 'error' event

--- Test for unused modules ---
  sudo npm install depcheck -g
  depcheck


TESTS
-------------

Test using mocha
  * make test
  OR
  * mocha

To check code quality:
  * plato -r -x public/javascripts/jquery-2.1.1.min.js -d reports public app.js views routes models config sbin

Then see file vamps-node.js/reports/index.html in a browser.

DB
---------------

MySQL db schema is included in root dir as: db_schema.sql

Applying new database schema from vamps2 (on vampsdev)
  I will record all alterations to the database here:
  
  2015-10-20 AAV Added new table: 
      CREATE TABLE `access` (
        `access_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
        `user_id` int(11) unsigned DEFAULT NULL,
        `project_id` int(11) unsigned DEFAULT NULL,
        PRIMARY KEY (`access_id`),
        UNIQUE KEY `pid_uid` (`user_id`,`project_id`),
        KEY `project_id` (`project_id`),
        KEY `user_id` (`user_id`),
        CONSTRAINT `access_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON UPDATE CASCADE,
        CONSTRAINT `access_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;


  2015-06-25 AAV Changed the field project.project_description from varchar to text.
  2015-06-25 AAV Changed the field project.title size from varchar 64 to varchar 255.

  2015-05-29 AAV Added a new table:
      CREATE TABLE `user_project_status` (
        `user_project_status_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
        `user` varchar(64) NOT NULL DEFAULT '',
        `project` varchar(20) DEFAULT NULL,
        `status` varchar(20) DEFAULT NULL,
        `message` varchar(128) DEFAULT NULL,
        `date` datetime DEFAULT NULL,
        PRIMARY KEY (`user_project_status_id`),
        UNIQUE KEY `user` (`user`,`project`)
      ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
  2015-02-11 AAV Added 'public' field to 'project' table. -->
  2015-05-15 AAV Changed varchar size from 32 to 60 in table.field: custom_metadata_fields.field_name
  
  alter table project add column `public` tinyint(3) unsigned NOT NULL DEFAULT '1' COMMENT ' 0 (private) or 1 (public)'
  CREATE TABLE `project` (
    `project_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `project` varchar(32) NOT NULL DEFAULT '',
    `title` varchar(64) NOT NULL DEFAULT '',
    `project_description` varchar(255) NOT NULL DEFAULT '',
    `rev_project_name` varchar(32) NOT NULL DEFAULT '',
    `funding` varchar(64) NOT NULL DEFAULT '',
    `owner_user_id` int(11) unsigned DEFAULT NULL,
    `public` tinyint(1) DEFAULT '1',
    PRIMARY KEY (`project_id`),
    UNIQUE KEY `project` (`project`),
    UNIQUE KEY `rev_project_name` (`rev_project_name`),
    KEY `project_fk_user_id_idx` (`owner_user_id`),
    CONSTRAINT `project_ibfk_1` FOREIGN KEY (`owner_user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE
  ) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;

  CREATE TABLE custom_metadata_fields (
    custom_metadata_fields_id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    project_id int(11) unsigned NOT NULL,
    field_name varchar(60) NOT NULL DEFAULT '',
    field_type varchar(16) NOT NULL DEFAULT 'varchar(128)',
    example varchar(128) NOT NULL,
    PRIMARY KEY (custom_metadata_fields_id),
    UNIQUE KEY project_id_field_name (project_id,field_name),
    KEY project_id (project_id),
    CONSTRAINT custom_metadata_fields_ibfk_1 FOREIGN KEY (project_id) REFERENCES project (project_id) ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=latin1;

  CREATE TABLE `required_metadata_info` (
    `required_sample_info_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `dataset_id` int(11) unsigned NOT NULL,
    `taxon_id` int(11) NOT NULL COMMENT 'Refers to the number assigned to the specific metagenome being sampled:\n  required for all sample submissions e.g. marine metagenome is 408172\n   http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi',
    `description` varchar(100) NOT NULL DEFAULT '' COMMENT 'A description of the sample that can include site, subject, sample matter',
    `common_name` varchar(100) NOT NULL DEFAULT '' COMMENT 'Name of the TAXON_ID e.g. 408172 is marine metagenome',
    `altitude` double NOT NULL COMMENT 'Height above ground or sea in the air (in meters) required for all sample submissions - 0 should be used if sample is not in the air above ground',
    `assigned_from_geo` char(1) NOT NULL COMMENT 'Is the latitude, longitude and elevation assigned from a geographic reference? y or n required for all sample submissions.',
    `collection_date` date NOT NULL COMMENT 'The day and time of sampling, single point in time using a 24 hour time format required for all sample submissions Date should be in MM/DD/YY format.  Time can be truncated or omitted or entered in a separate column collection_time',
    `depth` double NOT NULL COMMENT 'Depth underground for soil or under water for aquatic samples.  Should be in meters required for all sample submissions, should be in meters',
    `country` varchar(128) NOT NULL COMMENT 'The geographical origin of the sample as defined by the country\n  required for all sample submissions, chosen from the GAZ ontology\n  http://bioportal.bioontology.org/visualize/40651',
    `elevation` int(11) NOT NULL COMMENT 'Height of land above sea level in meters\n  required for all sample submissions, distinguish from altitude which is height above land or sea in the air.',
    `env_biome` varchar(128) NOT NULL COMMENT 'Classification of the location where the sample was obtained\n  required for all sample submissions. The world''s major communities, classified according to the predominant vegetation and characterized by adaptations of organisms to that particular environment\nhttp://www.ebi.ac.uk/ontology-lookup/browse.do?ontName=ENVO',
    `env_feature` varchar(128) NOT NULL COMMENT 'Classification of a specific feature in the biome\n  required for all sample submissions e.g. Was the feature a forest, grassland, agricultural site\n  http://www.ebi.ac.uk/ontology-lookup/browse.do?ontName=ENVO ',
    `env_matter` varchar(128) NOT NULL COMMENT 'Classification of the material being sampled\n  required for all sample submissions e.g. soil, sea water, feces\n  http://www.ebi.ac.uk/ontology-lookup/browse.do?ontName=ENVO',
    `latitude` double NOT NULL COMMENT 'Classification of the site by latitude and longitude in decimal degrees\n  required for all sample submissions. Please convert from GPS co-ordinates  or DD MM SS to decimal degrees\n  http://www.microbio.me/qiime/fusebox.psp?page=tools_geo.psp',
    `longitude` double NOT NULL COMMENT 'Classification of the site by latitude and longitude in decimal degrees\n  required for all sample submissions. Please convert from GPS co-ordinates  or DD MM SS to decimal degrees\n  http://www.microbio.me/qiime/fusebox.psp?page=tools_geo.psp',
    `public` char(1) NOT NULL COMMENT 'Has the sample been published?\n  responses: y/n',
    PRIMARY KEY (`required_sample_info_id`),
    UNIQUE KEY `dataset_id_u` (`dataset_id`),
    CONSTRAINT `required_metadata_info_ibfk_1` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`dataset_id`) ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
  
    
--- Dir structure ---
routes - server side logic
views - html/ejs
models - data retrieval (db for now, hdf5 in the future) 
public - client side, cached with an expiration time
sbin - additional scripts
downloads - will contain user downloaded files for retrieval


TODO
---------------
  * Testing!
  * Refactoring!
  * DONE:   projects/:id via REST
  * DONE:   user login and auth
  * 2015-05-11 Fix select-all-datasets when select project checkbox on visuals_index (community visualization) page
  * 2015-05-11 fix formating/style on search result page http://localhost:3000/search/search_result


