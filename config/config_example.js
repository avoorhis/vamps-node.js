// This is an example! *** Change all paths to match your system *** 
var path = require('path');
var os = require('os');

var config = {};

//// PATHS *** Change these to match your system ***  ////
//  Should always have trailing slash/
config.PROCESS_DIR = ''
/////////////////////////////////////////////////////////////////
config.USER_FILES_BASE = path.join(config.PROCESS_DIR,'user_data')
config.JSON_FILES_BASE = path.join(config.PROCESS_DIR,'public','json')
config.SYSTEM_FILES_BASE = config.PROCESS_DIR
config.TMP = '/tmp/'
config.PATH_TO_STATIC_DOWNLOADS = 'vamps_data_downloads'
config.PATH_TO_USER_DATA_UPLOADS = 'vamps_data_uploads'
config.PATH_TO_DCO_DOWNLOADS = path.join(config.PROCESS_DIR,'public','dco')


config.PATH_TO_VIZ_SCRIPTS = path.join(config.PROCESS_DIR,'public','scripts','visualization_scripts');
config.PATH_TO_NODE_SCRIPTS = path.join(config.PROCESS_DIR,'public','scripts','node_process_scripts');


config.GAST_DB_PATH = path.join(config.PROCESS_DIR, 'public', 'databases', 'GAST');
config.GAST_SCRIPT_PATH = path.join(config.PROCESS_DIR,'public','scripts','node_process_scripts');

config.PATH_TO_BLAST = '/usr/local/ncbi/blast/bin/';
// OLGOTYPING HELPERS
config.PATH_TO_OLIGOTYPING_BIN = 'oligotyping';

// http://qiime.org/
config.PATH_TO_QIIME_BIN = '/usr/local/programming/bin/';
config.PATH_TO_VSEARCH = '/usr/local/bin/vsearch';
// if you want to use rdp to assign taxonomy to your uploaded data
// install rdp (http://sourceforge.net/projects/rdp-classifier/files/rdp-classifier/)
// on your system and provide the path to classifier.jar file here.
// You will also need java on your system to run this.
config.PATH_TO_CLASSIFIER = '/usr/local/programming/rdp_classifier/dist/';
config.PATH_TO_SPINGO = '/usr/local/programming/SPINGO/';  //

// paths to run python
config.PATH = '/usr/local/anaconda3/bin:/opt/local/bin:/opt/local/sbin:/usr/local/bin:/sbin:/usr/sbin:/bin:/usr/bin';
config.LD_LIBRARY_PATH = 'seqinfobin/lib/:/usr/local/mysql-5.5.32-linux2.6-x86_64/lib/'

config.user_groups = {
        'test2' : "WHERE project in ('project1','project2')",
        'test'  : "WHERE project like 'TFV%'"
}

config.site = 'local'   // local, vamps ,vampsdev .....
config.dbhost = 'localhost';
config.hostname = 'localhost';
config.UPLOAD_FILE_SIZE = {bytes:30000000,MB:30};  // for VB should be 20,000,000 to 30,000,000 larger for vamps
config.GOOGLE_EARTH_KEY = '';   // using avoorhis@mbl.edu google account
config.CONTACT_EMAIL = 'avoorhis@mbl.edu'
config.server_port =  '3000' // for vamps and vampsdev will be visible on port 8124
config.cluster_available = false;

// For email from vamps:
config.vamps_email = "";
config.smtp_connection_obj = {
  host: "smtp.xxx.edu",
  port: 25,
  secure: false
};

module.exports = config;
