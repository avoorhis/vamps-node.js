// This is an example! *** Change all paths to match your system *** 
var path = require('path');
var os = require('os');

var config = {};

//// PATHS ////
//
//// LOCAL Config ////
config.UPLOAD_FILE_SIZE = {bytes: 30000000, MB: 30}; // for VB should be 20,000,000 to 30,000,000 larger for vamps
config.PROCESS_DIR = 'your_path/vamps-node.js';
config.USER_FILES_BASE = path.join(config.PROCESS_DIR, '/user_data/', NODE_DATABASE);
config.JSON_FILES_BASE = path.join(config.PROCESS_DIR, '/public/json');
config.TMP = path.join(config.PROCESS_DIR, '/tmp');
// if you want to use rdp to assign taxonomy to your uploaded data
// install rdp (http://sourceforge.net/projects/rdp-classifier/files/rdp-classifier/) 
// on your system and provide the path to classifier.jar file here.
// You will also need java on your system to run this.
//config.PATH_TO_RDP = path.join(config.PROCESS_DIR, '/rdp_classifier/dist');
config.PATH_TO_NODE_SCRIPTS = path.join(config.PROCESS_DIR, 'public', 'scripts', 'node_process_scripts');
config.PATH_TO_VIZ_SCRIPTS = path.join(config.PROCESS_DIR, 'public', 'scripts', 'visualization_scripts');
config.PATH_TO_ADDITIONAL_SCRIPTS = path.join(config.PROCESS_DIR, 'public', 'scripts', 'bin');
//
// http://www.ncbi.nlm.nih.gov/books/NBK279671/
config.PATH_TO_BLAST = 'your_path';
config.PATH_TO_REF_DBS = 'your_path';
config.GAST_DB_PATH = path.join(config.PROCESS_DIR, 'public/scripts/gast/ref_files');
config.GAST_SCRIPT_PATH = path.join(config.PROCESS_DIR, 'public/scripts/gast');

// http://qiime.org/
config.PATH_TO_QIIME_BIN = '';
config.PATH_TO_VSEARCH = 'your_path/vsearch'; // not used IF vsearch in $PATH
config.PATH_TO_CLASSIFIER = config.PROCESS_DIR + '/rdp_classifier/dist'; // 
config.PATH = 'your_path:' + path.join(config.PROCESS_DIR, '/public/scripts/bin') + ':' + config.PATH_TO_NODE_SCRIPTS;
config.LD_LIBRARY_PATH = path.join(config.PROCESS_DIR, '/public/scripts') + ':/analysis/gast/ds/:your_path'
config.PYTHONPATH = 'your_path';
config.LAPACK = ''

config.PATH2 = '/opt/local/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin';
config.LD_LIBRARY_PATH2 = 'your_path'
config.PYTHONPATH2 = '/usr/local/lib';
config.GOOGLE_EARTH_KEY = ''

config.PERL5LIB = 'your_path'

config.site = 'local'; 
config.dbhost = 'localhost';
config.hostname = os.hostname();
config.server_port = '3000'
config.CONTACT_EMAIL = 'your_email'
config.cluster_available = false;

module.exports = config;
