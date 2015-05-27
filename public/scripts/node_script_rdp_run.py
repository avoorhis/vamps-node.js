#!/usr/bin/env python

##!/usr/bin/env python
# -*- coding: utf-8 -*-

# Copyright (C) 2011, Marine Biological Laboratory
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free
# Software Foundation; either version 2 of the License, or (at your option)
# any later version.
#
# Please read the COPYING file.
#

import os
from stat import * # ST_SIZE etc
import sys
import shutil
import types
import time
import random
import logging
import csv
from time import sleep
import ConfigParser
import subprocess
logger = logging.getLogger('')
logging.basicConfig(stream=sys.stdout, level=logging.INFO)
#try:
import rdp
#logging.info('found node_script_fasta2tax script')
#except:
#    logging.info("node_script_fasta2tax is not avalable")


import datetime
datetime     = str(datetime.date.today())
py_pipeline_path = os.path.expanduser('~/programming/py_mbl_sequencing_pipeline')

 
    

def start_rdp(args):
    """
      Doc string
    """
    print args
    datasets = {}
    info_load_infile = args.config
    if not os.path.isfile(info_load_infile):
        print( "Could not find config file ("+info_load_infile+") **Exiting**")
        sys.exit()
   
    config = ConfigParser.ConfigParser()
    config.optionxform=str
    config.read(info_load_infile)
    general_config_items = {}
    # CL take precedence for domain and dna_region
    
    for name, value in  config.items('GENERAL'):
        #print '  %s = %s' % (name, value)  
        general_config_items[name] = value
    #print     config.items('DATASETS')
    file_prefix = 'testing-fp'
    dir_prefix  = general_config_items['baseoutputdir']
            
    print(   'FROM INI-->'      )  
    print(   general_config_items) 
    print(   '<<--FROM INI'    )
    
    global_gast_dir = os.path.join(args.baseoutputdir,'analysis','gast')
    fastaunique_cmd = py_pipeline_path+'/pipeline/bin/fastaunique'
    total_uniques = 0
    for dataset_item in config.items('DATASETS'):
         dataset = dataset_item[0]
         dscount = dataset_item[1]
         print "\nUnique-ing",dataset
         ds_dir = os.path.join(global_gast_dir, dataset)
         fasta_file  = os.path.join(ds_dir, 'seqfile.fa')
         unique_file = os.path.join(ds_dir, 'unique.fa')
         names_file  = os.path.join(ds_dir, 'names')
         rdp_out_file = os.path.join(ds_dir, 'rdp_out.txt')
         fastaunique_call = fastaunique_cmd +" "+fasta_file+" -o "+unique_file+" -n "+names_file
         print 'fastaunique_call',fastaunique_call
         #fastaunique_call = [fastaunique_cmd,fasta_file,"-o "+unique_file,"-n "+names_file,"-f"]
         #print fastaunique_call
         ds_unique_seq_count = subprocess.check_output(fastaunique_call, shell=True)
         print 'ds_unique_seq_count',ds_unique_seq_count
         
         #total_uniques += int(ds_unique_seq_count)
         logging.info("starting RDP")
         print 'running rdp'
         print unique_file,rdp_out_file
         rdp.run_rdp(unique_file,rdp_out_file)
         
         # datasets[dataset]=dscount
         #
         # fasta2tax_cmd = py_pipeline_path+"/fasta2tax.pl "
         # fasta2tax_cmd += " --user="+user
         # fasta2tax_cmd += " --inputfile="+unique_file
         # fasta2tax_cmd += " --project="+project
         # fasta2tax_cmd += " --dataset="+dataset
         # #fasta2tax_cmd += " --path-to-apps="+rdp_apps_directory
         # fasta2tax_cmd += " --database="+dbName_vamps
         # fasta2tax_cmd += " --table1=vamps_data_cube_uploads";
         # fasta2tax_cmd += " --table2=vamps_junk_data_cube_pipe";
         # fasta2tax_cmd += " --db_hostname="+db_hostname_vamps
         # fasta2tax_cmd += " --db-user="+db_user
         # fasta2tax_cmd += " --db-password="+db_password
         # fasta2tax_cmd += " & ";
         #
         # print  fasta2tax_cmd
         sys.exit('QUIT')
         # fasta2tax_result = subprocess.call(fasta2tax_cmd, shell=True)
         # print "updating vamps_projects_datasets_pipe"
         # updatePDP = "INSERT INTO vamps_projects_datasets_pipe (project,dataset,has_tax,date_trimmed,dataset_count)\
         #         VALUES('"+project+"','"+dataset+"','1','"+today+"','"+str(ds_seq_count)+"') \
         #         ON DUPLICATE KEY UPDATE has_tax='1'";
         #
         # #updatePDP = "UPDATE vamps_projects_datasets_pipe set has_tax='1' where project='"+project+"' and dataset='"+dataset+"'";
         # vamps_cursor.execute(updatePDP)
    

            
if __name__ == '__main__':
    import argparse
    
   
    
    myusage = """usage: rdp.py  [options]
         
         This is will start the (customized) python_pipeline
         for the GAST process, creating the vamps_* files
         for input to the new_vamps database.
         
         where
            
            -c/--config    REQUIRED path to config file.
                            
                    SHOULD be the only thing needed
                    (create config file with 1-vamps-load.py   )   
           
    
    
    """
  
