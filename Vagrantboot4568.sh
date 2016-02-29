#!/usr/bin/env bash


# nice example:
# https://github.com/HabitRPG/habitrpg/blob/develop/vagrant.sh


dbrootuser='root'
dbrootpass='rootpass'
vampsdbuser='ruby'
vampsdbpass='ruby'
vampsdb='vamps_starter'
app_name='vamps-node.js'
LOGFILE="/home/vagrant/node_server.log"

function create_mysql_mycnf_file () {
    echo "COMMENT===>Creating ~/.my.cnf_node"
    touch .my.cnf_node
    echo "[client]" >> .my.cnf_node
    echo "user=$vampsdbuser" >> .my.cnf_node
    echo "password=$vampsdbpass" >> .my.cnf_node
    #echo "host=127.0.0.1" >> .my.cnf_node
    sudo chown -R vagrant .my.cnf_node
}

# function create_vamps_start_script () {
#     echo "COMMENT===>Creating start_script.sh"
#     touch /home/vagrant/$app_name/start_script.sh
#     echo "#!/bin/bash" >> /home/vagrant/$app_name/start_script.sh
#     echo "" >>  /home/vagrant/$app_name/start_script.sh
#     echo "cd /home/vagrant/$app_name" >> /home/vagrant/$app_name/start_script.sh
#     echo "forever -l $LOGFILE start bin/www" >> /home/vagrant/$app_name/start_script.sh
#     echo "exit" >> /home/vagrant/$app_name/start_script.sh
#     echo "" >>  /home/vagrant/$app_name/start_script.sh
#     #echo "host=127.0.0.1" >> .my.cnf_node
#     sudo chown vagrant /home/vagrant/$app_name/start_script.sh
#     sudo chmod +x /home/vagrant/$app_name/start_script.sh
# }

function create_vamps_node_config_file () {
    echo "COMMENT===>Creating config/config.js"
    sudo rm config/config.js
    touch config/config.js
    echo "var path = require('path');" >> config/config.js
    echo "var os = require('os');" >> config/config.js
    echo "var config = {};"  >> config/config.js
    echo "config.PROCESS_DIR = '/home/vagrant/vamps-node.js';" >> config/config.js
    echo "config.USER_FILES_BASE = '/home/vagrant/vamps-node.js/user_data/'+NODE_DATABASE;" >> config/config.js
    echo "config.JSON_FILES_BASE = '/home/vagrant/vamps-node.js/public/json/';" >> config/config.js
    echo "config.PATH_TO_NODE_SCRIPTS = path.join(process.env.PWD,'public','scripts','node_process_scripts');" >> config/config.js
    echo "config.PATH_TO_VIZ_SCRIPTS = path.join(process.env.PWD,'public','scripts','visualization_scripts/');" >> config/config.js
    echo "config.PATH_TO_BLAST = '';" >> config/config.js
    echo "config.PATH_TO_QIIME_BIN = '';" >> config/config.js
    echo "config.PATH_TO_VSEARCH = '';" >> config/config.js
    echo "config.PATH_TO_CLASSIFIER = '/home/vagrant/rdp_classifier/';" >> config/config.js   
    echo "config.PATH = '/opt/local/bin:/opt/local/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/local/bin:/usr/local/mysql/bin'" >> config/config.js
    echo "config.LD_LIBRARY_PATH = '/home/vagrant/vamps-node.js/public/scripts'" >> config/config.js
    echo "config.PYTHONPATH = '/usr/local/lib/';" >> config/config.js
    echo "config.LAPACK = '';" >> config/config.js
    echo "config.PERL5LIB = '/opt/local/lib/perl5/site_perl/5.16.3/darwin-thread-multi-2level/'" >> config/config.js
    echo "config.site = 'local';" >> config/config.js
    echo "config.dbhost = 'localhost';" >> config/config.js
    echo "config.hostname = os.hostname();" >> config/config.js
    echo "module.exports = config;" >> config/config.js
}

function create_vamps_node_db_connection_file () {
    echo "COMMENT===>Configuring vamps-node.js MySQL connection...."
    touch config/db-connection.js
    echo "NODE_DATABASE='${vampsdb}'"       >> config/db-connection.js;
    echo "var db_config = {"                >> config/db-connection.js;
    echo "    user     : '${vampsdbuser}'," >> config/db-connection.js;
    echo "    password : '${vampsdbpass}'," >> config/db-connection.js;
    echo "    database :  NODE_DATABASE,"   >> config/db-connection.js;
    #echo "    socketPath: '/tmp/mysql.sock'" >> vamps-node.js/config/db-connection.js;
    echo "};"                               >> config/db-connection.js;
}

function create_n_load_mysql_database () {
    echo "COMMENT===>Installing MySQL...."
    sudo debconf-set-selections <<< "mysql-server-5.5 mysql-server/root_password password $dbrootpass"
    sudo debconf-set-selections <<< "mysql-server-5.5 mysql-server/root_password_again password $dbrootpass"
    sudo apt-get install -qq mysql-server-5.5
    if [ ! -f /var/log/databasesetup ];
    then
        echo "CREATE USER '$vampsdbuser'@'localhost' IDENTIFIED BY '$vampsdbpass'" | mysql -u $dbrootuser -p$dbrootpass
        echo "CREATE DATABASE $vampsdb" | mysql -u $dbrootuser -p$dbrootpass
        echo "GRANT ALL ON $vampsdb.* TO '$vampsdbuser'@'localhost'" | mysql -u $dbrootuser -p$dbrootpass
        echo "flush privileges" | mysql -u $dbrootuser -p$dbrootpass

        touch /var/log/databasesetup

        #if [ -f /vagrant/data/db_schema_w_test_data.sql ];
        if [ -f db_schema_w_test_data.sql.gz ];
        then
            gunzip db_schema_w_test_data.sql.gz
            mysql -u $dbrootuser -p$dbrootpass $vampsdb < db_schema_w_test_data.sql
        elif [ -f db_schema_w_test_data.sql ] 
        then
            mysql -u $dbrootuser -p$dbrootpass $vampsdb < db_schema_w_test_data.sql
        fi
    fi
}

function load_r_and_libraries () {
    echo "COMMENT===>Amending Sources List with R mirror"
    echo "deb http://cran.rstudio.com/bin/linux/ubuntu precise/" >> ./sources.list.appendme
    sudo cat /etc/apt/sources.list ./sources.list.appendme  > ./sources.list.tmp
    sudo mv ./sources.list.tmp /etc/apt/sources.list
    rm ./sources.list.appendme

    echo "as per: https://cran.r-project.org/bin/linux/ubuntu/README add pub-key"
    sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E084DAB9
    sudo apt-get update -qq
    
    echo "COMMENT===>Installing R and needed libraries"
    sudo apt-get install -qq r-base r-base-dev
    sudo su - -c "R -e \"install.packages('ctc', repos = 'http://cran.rstudio.com/')\""
    sudo su - -c "R -e \"install.packages('plyr', repos = 'http://cran.rstudio.com/')\""
    sudo su - -c "R -e \"install.packages('Rcpp', repos = 'http://cran.rstudio.com/')\""
    sudo su - -c "R -e \"install.packages('scales', repos = 'http://cran.rstudio.com/')\""
    sudo su - -c "R -e \"install.packages('vegan', repos = 'http://cran.rstudio.com/')\""
    sudo su - -c "R -e \"install.packages('ggplot2', repos = 'http://cran.rstudio.com/')\""
    sudo su - -c "R -e \"install.packages('pheatmap', repos = 'http://cran.rstudio.com/')\""
    sudo su - -c "R -e \"install.packages('RColorBrewer', repos = 'http://cran.rstudio.com/')\""
    sudo su - -c "R -e \"install.packages('jsonlite', repos = 'http://cran.rstudio.com/')\""
    sudo su - -c "R -e \"install.packages('ape', repos = 'http://cran.rstudio.com/')\""
    sudo su - -c "R -e \"source('http://bioconductor.org/biocLite.R'); biocLite('phyloseq')\""
    #sudo su - -c "R -e \"install.packages('phyloseq', repos = 'http://cran.rstudio.com/')\""
     
}

function load_python_libraries () {

   
    
    echo "COMMENT===>Installing Python NumPy...."
    sudo pip install numpy 
    #sudo pip install emperor==0.9.3


    echo "COMMENT===>Installing Python SciPy...."
    sudo pip install scipy

    echo "COMMENT===>Installing Python SciKit-Bio Prerequisites...."
    sudo easy_install -U distribute
    sudo apt-get install -qq pkg-config libcairo2-dev libpng-dev libfreetype6-dev libjpeg-dev
    #sudo pip install cairocffi
    #sudo pip install pygtk
    
    echo "COMMENT===>Installing illumina-utils...."
    # need v 1.4.2 to work with python 2.7.3 in Ubuntu
    sudo pip install illumina-utils==1.4.2
    
    #echo "COMMENT===>Installing Python SciKit-Bio...."
    # scikit-bio is installed by emperor
    #sudo pip install scikit-bio==0.3.0
    #sudo pip install scikit-bio


    echo "COMMENT===>Installing Python Cogent...."
    sudo pip install cogent

    echo "COMMENT===>Installing QIIME Emperor...."
    sudo pip install emperor --upgrade
    

}
function initialize_environment () {
    export NODE_ENV=production
    
    echo "COMMENT===>Updating apt-get repositories...."
    sudo apt-get update -qq
    
    echo "COMMENT===>Installing Python Development Libraries..and pip.."
    sudo apt-get install -qq python-dev libmysqlclient-dev python-pip
    sudo apt-get install -qq curl libblas-dev liblapack-dev libatlas-base-dev gfortran
    sudo pip install --upgrade pip
    sudo pip install MySQL-python
    
    echo "COMMENT===>Installing python-software-properties needed for npm...."
    apt-get install -qq python-software-properties
    
   

    echo "COMMENT===>Installing Unix build tools - needed for make..."
    apt-get install -qq build-essential gcc
    echo "COMMENT===>Installing Git...."
    apt-get install -qq git


    echo "COMMENT===>Installing node.js (version 4.x)...."
    curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
    apt-get install -qq nodejs
    
    echo "COMMENT===>Updating npm...."
    npm install -g npm
    
}

initialize_environment
create_mysql_mycnf_file
load_python_libraries
load_r_and_libraries

echo "COMMENT===>Installing JAVA...."
sudo apt-get install -qq default-jre

echo "COMMENT===>Getting RDP_Classifier from SourceForge...."
cd /home/vagrant
curl -L0k http://skylineservers.dl.sourceforge.net/project/rdp-classifier/rdp-classifier/rdp_classifier_2.2.zip > /home/vagrant/rdp_classifier.zip

unzip /home/vagrant/rdp_classifier.zip
ln -s /home/vagrant/rdp_classifier_2.2 /home/vagrant/rdp_classifier
cd /home/vagrant/rdp_classifier
mkdir train
echo "COMMENT===>Training the RDP Classifier...."
java -Xmx400m -cp rdp_classifier-2.2.jar edu/msu/cme/rdp/classifier/train/ClassifierTraineeMaker sampledata/testTaxonForQuerySeq.txt sampledata/testQuerySeq.fasta 1 version1 test train
cp sampledata/rRNAClassifier.properties train
cd /home/vagrant
# rdp.py PATH_2_DB = '/home/vagrant/rdp_classifier/train'

echo "COMMENT===>Cloning into vamps-node.js repository from github.com...."
git clone https://github.com/avoorhis/vamps-node.js.git
sudo chown -R vagrant vamps-node.js

echo "COMMENT===>Updating/Installing VAMPS-Node modules...."
cd vamps-node.js; sudo npm install

echo "COMMENT===>Installing npm forever (global)...."
sudo npm install -g forever

echo "COMMENT===>Installing npm node-gyp (global)...."
sudo npm install -g node-gyp

echo "COMMENT===>Creating config.js and db-connection.js...."
create_vamps_node_config_file
create_vamps_node_db_connection_file

echo "COMMENT===>Creating, Configuring and Loading VAMPS MySQL Database...."
create_n_load_mysql_database


echo "COMMENT===>Running INITIALIZE_ALL_FILES Script...."
public/scripts/maintenance_scripts/INITIALIZE_ALL_FILES.py -dbuser $vampsdbuser -dbpass $vampsdbpass -db $vampsdb

sudo chgrp -R vagrant ../*
sudo chmod -R ug+rw ../* 

# Uncomment these lines to auto-start the vamps.js server when provisioning
# start server as regular user (vagrant) not sudo (root)
#sudo -u vagrant npm start
#cd /home/vagrant/$app_name
#create_vamps_start_script
#forever -l $LOGFILE start bin/www
echo "COMMENT===>Starting VAMPS-Node.js Server on localhost:4568"
su - vagrant -c "touch /home/vagrant/$app_name/logs/node-error.log"
su - vagrant -c "touch /home/vagrant/$app_name/logs/node-server.log"
su - vagrant -c "cd /home/vagrant/$app_name; ./vamps-launcher.sh start"
#su - vagrant -c /home/vagrant/$app_name/start_script.sh
#sudo -u vagrant forever -l $LOGFILE start bin/www

#npm start



