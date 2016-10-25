VAMPS -- Node.js (javascript)
=========
Visualization and Analysis of Microbial Population Structures
-----------------

INSTALL
--------------

**(Optional (easy-)install method using VirtualBox and Vagrant -see below)**

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

**Local settings**
If you going to assign taxonomy locally, run:
  * export PERL5LIB={YOUR_PATH}/vamps-node.js/public/scripts/gast
  * PATH=$PATH:{YOUR_PATH}/vamps-node.js/public/scripts/gast

**Install MYSQL database schema**
 * There are two mysql database schemas included in the vamps-node.js installation.
One has some data included that you can use in visualizations:
  db_schema.sql(.gz) (update 5-3-2016)
  db_schema_w_test_data.sql(.gz) (they may be compressed files)
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
   cd public/scripts/maintenance_scripts; 
   python INITIALIZE_SILVA_FILES.py
   python INITIALIZE_RDP_FILES.py
   ```
  
   This script requires that you have a .my.cnf file in your home directory
(read about .my.cnf files here: https://dev.mysql.com/doc/refman/5.1/en/option-files.html).
The script will prompt you for a database - just enter the one you created above.
It may take awhile especially if the database is large, but it is required
to create the helper files that reside in the /public/json directory.
 * For the visualizations to work correctly you also need to fill in the correct paths
to various programs on your computer. Have a look at the bottom of the constants.py file
in the /public directory and change the paths to match your system. 

CREATE a CONFIG file
----------------
Change config/config_example.js to your environment and save as config/config.js


START the SERVER
----------------

Start the server:
  * run 'npm start' from the base of the vamps-node.js directory
  * or use the script './vb_vamps-launcher.sh' |start|stop|status|
  * If you've installed the schema with data (db_schema_w_test_data.sql), you can log in with the guest
  account (username:'guest'; password:'guest') or the admin account (username:'admin'; password:'admin').
  You can change the password(s) using the admin account. Otherwise you should register a new account.

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

Create an empty directory named 'vamps-node.js' and place the two files 
(Vagrantfile and Vagrantboot4568.sh from this 'vamps-node.js' github site) into it.

WARNING: the RAM memory allocated to the VirtualBox in the Vagrantfile is 2GB.
This amount of memory will be pulled away from your host machine and could 
potentially prevent other programs from running on your host machine.
If needed change the value in the Vagrantfile to suit your system.

Alternatively install the vamps-node.js source code (assumes git is installed):
by running 'git clone https://github.com/avoorhis/vamps-node.js.git'.
Which will create the directory 'vamps-node.js'.

* Run the command 'vagrant up' from the new vamps-node.js directory.
Wait for the Ubuntu VirtualBox server to be created and all of the files 
and libraries to be installed (about 20-40 min). When finished vamps will be available 
in your browser at:  localhost:4568/
For more information see the help files at https://docs.vagrantup.com/v2/getting-started/index.html
and examine the Vagrantboot4568.sh and Vagrantfile in the vamps-node.js main directory.

To log into the virtual box running the node server (for maintenance or to update the source code):
* Run the command 'vagrant ssh' (requires ssh in the $PATH variable) and then 'cd vamps-node.js' to enter the base of the running server
The server should have started automatically and can be stopped, started or the status checked:
using "./vamps-launcher.sh stop|start|status"

* The log files are at ./logs/node-server.log and ./logs/node-error.log

* Update the vamps code: run 'git pull' and restart the server.


---------------
UPDATE
---------------
To update modules:
  * npm update
To update the vamps code:
 * git pull
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

-------------
TESTS
-------------

Test using mocha
  * make test
  OR
  * mocha

To check code quality:
  * plato -r -x public/javascripts/jquery-2.1.1.min.js -d reports public app.js views routes models config sbin

Then see file vamps-node.js/reports/index.html in a browser.

---------------
DB
---------------

MySQL db schema is included in root dir as: db_schema.sql

To apply a new database schema over an existing schema with data:
Dump the existing data: mysqldump -h <dbhost> <dbname> > mydb.sql
Edit mydb.sql:
  1 Remove the DROP TABLE queries
    egrep -v "DROP TABLE" mydb.sql > mydb2.sql
  2 Add 'IF NOT EXISTS' to 'CREATE TABLE' query
    LC_ALL=C sed "s/CREATE TABLE/CREATE TABLE IF NOT EXISTS/g" mydb2.sql > mydb3.sql
  3 Add IGNORE to 'INSERT INTO' query
    LC_ALL=C sed "s/INSERT INTO/INSERT IGNORE INTO/g" mydb3.sql > mydb4.sql
In Mysql: 
  use <dbname>
  source db_schema.sql (creates the new empty database)
  source mydb.sql to add data
 

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
  
Tue Aug  9 11:56:00 EDT 2016
ALTER TABLE user_project_status
ADD UNIQUE KEY user_project (user_id, project_id);
  
Tue Oct 25 13:33:01 EDT 2016
(used on local)
ALTER TABLE required_metadata_info
ADD COLUMN `fragment_name_id` TINYINT(3) UNSIGNED NOT NULL,
ADD COLUMN `dna_region_id` TINYINT(3) UNSIGNED NOT NULL,
ADD COLUMN `sequencing_platform_id` SMALLINT(3) UNSIGNED NOT NULL,
ADD COLUMN `domain_id` INT(3) UNSIGNED NOT NULL,
ADD COLUMN `env_biome_id` MEDIUMINT(8) UNSIGNED NOT NULL AFTER env_biome

CREATE TABLE `metadata_new_temp` (
  `dataset_id` int(11) unsigned NOT NULL,
  `dataset` varchar(64) NOT NULL,
  `dna_region_id` tinyint(3) unsigned DEFAULT NULL,
  `dna_region` varchar(32) NOT NULL DEFAULT '',
  `fragment_name_id` tinyint(3) unsigned DEFAULT NULL,
  `fragment_name` varchar(32) NOT NULL DEFAULT '16s',
  `project_id` int(11) unsigned NOT NULL,
  `project` varchar(32) NOT NULL DEFAULT '',
  `sequencing_platform_id` smallint(3) unsigned DEFAULT NULL,
  `sequencing_platform` varchar(32) NOT NULL DEFAULT 'unknown',
  `domain_id` int(3) unsigned DEFAULT NULL,
  `domain` varchar(32) NOT NULL DEFAULT '',
  UNIQUE KEY `dataset_id` (`dataset_id`),
  KEY `fragment_name_id` (`fragment_name_id`),
  KEY `sequencing_platform_id` (`sequencing_platform_id`),
  KEY `project_id` (`project_id`),
  KEY `dna_region_id` (`dna_region_id`),
  KEY `domain_id` (`domain_id`),
  CONSTRAINT `metadata_new_temp_ibfk_6` FOREIGN KEY (`domain_id`) REFERENCES `domain` (`domain_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO metadata_new_temp (dataset_id, dataset, project_id, project) 
SELECT dataset_id, dataset, project_id, project
FROM required_metadata_info
JOIN dataset USING(dataset_id)
JOIN project USING(project_id)

Manually
INSERT correct: dna_region (from a project name), fragment_name (16s for A and B, 18s for E and ITS), sequencing_platform (from custom metadata, various fields), domain (from a project name)


UPDATE metadata_new_temp
JOIN dna_region USING(dna_region)
SET metadata_new_temp.dna_region_id = dna_region.dna_region_id;

UPDATE metadata_new_temp
JOIN sequencing_platform USING(sequencing_platform)
SET metadata_new_temp.sequencing_platform_id = sequencing_platform.sequencing_platform_id;

UPDATE metadata_new_temp
JOIN fragment_name USING(fragment_name)
SET metadata_new_temp.fragment_name_id = fragment_name.fragment_name_id;

UPDATE metadata_new_temp
JOIN domain USING(domain)
SET metadata_new_temp.domain_id = domain.domain_id;

alter table metadata_new_temp
ADD FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`dataset_id`) ON UPDATE CASCADE,
ADD FOREIGN KEY (`fragment_name_id`) REFERENCES `fragment_name` (`fragment_name_id`) ON UPDATE CASCADE,
ADD FOREIGN KEY (`sequencing_platform_id`) REFERENCES `sequencing_platform` (`sequencing_platform_id`) ON UPDATE CASCADE,
ADD FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON UPDATE CASCADE,
ADD FOREIGN KEY (`dna_region_id`) REFERENCES `dna_region` (`dna_region_id`) ON UPDATE CASCADE,
ADD FOREIGN KEY (`domain_id`) REFERENCES `domain` (`domain_id`) ON UPDATE CASCADE

update required_metadata_info JOIN env_biome USING(env_biome) SET required_metadata_info.env_biome_id = env_biome.env_biome_id;

update required_metadata_info as i
  join metadata_new_temp as t using(dataset_id)
  set i.dna_region_id = t.dna_region_id
  , i.domain_id = t.domain_id
  , i.fragment_name_id = t.fragment_name_id
  , i.sequencing_platform_id = t.sequencing_platform_id
  

alter table required_metadata_info
ADD FOREIGN KEY (`env_biome_id`) REFERENCES `env_biome` (`env_biome_id`) ON UPDATE CASCADE,
ADD FOREIGN KEY (`fragment_name_id`) REFERENCES `fragment_name` (`fragment_name_id`) ON UPDATE CASCADE,
ADD FOREIGN KEY (`sequencing_platform_id`) REFERENCES `sequencing_platform` (`sequencing_platform_id`) ON UPDATE CASCADE,
ADD FOREIGN KEY (`dna_region_id`) REFERENCES `dna_region` (`dna_region_id`) ON UPDATE CASCADE,
ADD FOREIGN KEY (`domain_id`) REFERENCES `domain` (`domain_id`) ON UPDATE CASCADE

  
--- Dir structure ---
routes - server side logic
views - html/ejs
models - data retrieval (db for now, hdf5 in the future) 
public - client side, cached with an expiration time
public/scripts  - various external scripts
public/json  - files for dataset counts and metadata
sbin - additional scripts
downloads - will contain user downloaded files for retrieval
user_data - will hold projects,saved_datasets & configurations
tmp - temporary files prefixed with username (deleted by username on each login)

TODO
---------------
  * Testing!
  * Refactoring!
  * DONE:   projects/:id via REST
  * DONE:   user login and auth
  * 2015-05-11 Fix select-all-datasets when select project checkbox on visuals_index (community visualization) page
  * 2015-05-11 fix formating/style on search result page http://localhost:3000/search/search_result
  * This list is out of date


