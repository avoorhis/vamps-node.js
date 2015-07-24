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
     
#try:
import rdp
#logging.info('found node_script_fasta2tax script')
#except:
#    logging.info("node_script_fasta2tax is not avalable")


import datetime
datetime     = str(datetime.date.today())
#py_pipeline_path = os.path.expanduser('~/programming/py_mbl_sequencing_pipeline')

 
    

def start_rdp(args):
    """
      Doc string
    """
    
    
    logging.debug('CMD> '+args.process_dir+'/public/scripts/'+os.path.basename(__file__)+' --config '+args.config+' -ddir '+args.basedir+' -pdir '+args.process_dir+' -ref_db '+args.ref_db)
    print('CMD> '+args.process_dir+'/public/scripts/'+os.path.basename(__file__)+' --config '+args.config+' -ddir '+args.basedir+' -pdir '+args.process_dir+' -ref_db '+args.ref_db)
    logging.debug(args)
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
            
    logging.warning(   'FROM INI-->'      )  
    logging.warning(   general_config_items) 
    logging.warning(   '<<--FROM INI'    )
    
    #global_gast_dir = os.path.join(args.basedir,'analysis','gast')
    analysis_dir = os.path.join(args.basedir,'analysis')
    #fastaunique_cmd = py_pipeline_path+'/pipeline/bin/fastaunique'
    total_uniques = 0
    for dataset_item in config.items('DATASETS'):
         dataset = dataset_item[0]
         dscount = dataset_item[1]  # raw count
         #print "\nUnique-ing",dataset
         ds_dir = os.path.join(analysis_dir, dataset)
         fasta_file  = os.path.join(ds_dir, 'seqfile.fa')
         unique_file = os.path.join(ds_dir, 'unique.fa')
         names_file  = os.path.join(ds_dir, 'names')
         rdp_dir = os.path.join(ds_dir, 'rdp')
         if not os.path.exists(rdp_dir):
             os.makedirs(rdp_dir)
         rdp_out_file = os.path.join(rdp_dir, 'rdp_out.txt') # to be created
         #fastaunique_call = fastaunique_cmd +" "+fasta_file+" -o "+unique_file+" -n "+names_file
         #print 'fastaunique_call',fastaunique_call
         #fastaunique_call = [fastaunique_cmd,fasta_file,"-o "+unique_file,"-n "+names_file,"-f"]
         #print fastaunique_call
         #ds_unique_seq_count = subprocess.check_output(fastaunique_call, shell=True)
         #print 'ds_unique_seq_count',ds_unique_seq_count
         
         #total_uniques += int(ds_unique_seq_count)
         logging.info("starting RDP")
         print 'running rdp on',dataset
         print 'uniques file',unique_file
         print 'rdp_out file',rdp_out_file
         print 'ref db', args.ref_db
         rdp.run_rdp( unique_file, rdp_out_file, args.process_dir, args.ref_db )
    

            
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
    parser = argparse.ArgumentParser(description="" ,usage=myusage) 
    parser.add_argument("-c", "--config",             
                required=True,  action="store",   dest = "config",
                help="config file with path")
    parser.add_argument("-ddir", "--data_dir",    
                required=True,  action="store",   dest = "basedir", 
                help = '') 
    parser.add_argument("-ref_db", "--reference_db",    
                required=True,  action="store",   dest = "ref_db", 
                help = '') 
    parser.add_argument("-pdir", "--process_dir",    
                required=False,  action="store",   dest = "process_dir", default='/Users/avoorhis/programming/vamps-node.js/',
                help = '')
    args = parser.parse_args() 

    start_rdp(args)



