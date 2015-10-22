var config = {};

//// PATHS *** Change these to match your system ***  ////
//
config.PROCESS_DIR = '/usr/local/www/vampsdev/projects/vamps-node.js';
// if you want to use rdp to assign taxonomy to your uploaded data
// install rdp (http://sourceforge.net/projects/rdp-classifier/files/rdp-classifier/) 
// on your system and provide the path to classifier.jar file here.
// You will also need java on your system to run this.
config.PATH_TO_RDP = '/Users/avoorhis/programming/rdp_classifier/dist/';

//
// http://www.ncbi.nlm.nih.gov/books/NBK279671/
config.PATH_TO_BLAST = '/usr/local/ncbi/blast/bin/';


// http://qiime.org/
//config.PATH_TO_QIIME_BIN = '/opt/local/Library/Frameworks/Python.framework/Versions/2.7/bin/';
config.PATH_TO_QIIME_BIN = '/usr/local/bin/';

// paths to run python 
//config.PATH = '/groups/vampsweb/vampsdev/seqinfobin:/opt/sge/bin/lx-amd64:/groups/vampsweb/vampsdev/seqinfobin/bin:/groups/vampsweb/vampsdev/qiime-1.7.0/bin:/groups/vampsweb/vampsdev/qiime-1.7.0/emperor/bin:/bioware/jre/bin:/usr/local/sge/bin/lx24-amd64:/sbin:/usr/sbin:/bin:/usr/bin:/bioware/mysql-5.5.13-linux2.6-x86_64/bin:/bioware/mpich2/bin/';
//config.LD_LIBRARY_PATH = ''
config.PATH = '/opt/local/bin:/opt/local/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/local/ncbi/blast/bin:/opt/local/bin:/usr/local/mysql/bin';
//config.PATH = '/opt/local/bin:/opt/local/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/mysql/bin'
config.LD_LIBRARY_PATH = '/opt/local/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/site-packages:/opt/local/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7:/Users/avoorhis/programming/vamps-node.js'



module.exports = config;