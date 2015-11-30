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
     


import datetime
datetime     = str(datetime.date.today())
    

def start_rdp(args):
    """
      Doc string
    """
    
    sys.path.append(os.path.join(args.process_dir,'public','scripts'))

    import rdp.rdp as rdp
    logging.debug('CMD> '+args.process_dir+'/public/scripts/'+os.path.basename(__file__)+' --config '+args.config+' -project_dir '+args.project_dir+' -process_dir '+args.process_dir+' -path_to_classifier '+args.path_to_classifier+' -ref_db '+args.ref_db_dir)
    print('CMD> '+args.process_dir+'/public/scripts/'+os.path.basename(__file__)+' --config '+args.config+' -project_dir '+args.project_dir+' -pdir '+args.process_dir+' -path_to_classifier '+args.path_to_classifier+' -ref_db '+args.ref_db_dir)
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
            
    logging.warning(   'FROM config.INI-->'      )  
    logging.warning(   general_config_items) 
    logging.warning(   '<<--FROM INI'    )
    
    #global_gast_dir = os.path.join(args.basedir,'analysis','gast')
    analysis_dir = os.path.join(args.project_dir,'analysis')
    
    total_uniques = 0
    for dataset_item in config.items('DATASETS'):
            dataset = dataset_item[0]
            dscount = dataset_item[1]  # raw count
            #print "\nUnique-ing",dataset
            rdp_dir = os.path.join(analysis_dir, 'rdp')
            ds_dir = os.path.join(rdp_dir, dataset)
            if not os.path.exists(rdp_dir):
                os.makedirs(rdp_dir)
            if not os.path.exists(ds_dir):
                os.makedirs(ds_dir)
        
            fasta_file  = os.path.join(ds_dir, 'seqfile.fa')
            unique_file = os.path.join(ds_dir, 'unique.fa')
            names_file  = os.path.join(ds_dir, 'names')

            if not os.path.exists(unique_file):                
                fasta_file_gast  = os.path.join(analysis_dir, 'gast', dataset, 'seqfile.fa')
                unique_file_gast = os.path.join(analysis_dir, 'gast', dataset, 'unique.fa')
                names_file_gast  = os.path.join(analysis_dir, 'gast', dataset, 'names')
                try:
                    shutil.copyfile(fasta_file_gast, fasta_file)
                    shutil.copyfile(unique_file_gast, unique_file)
                    shutil.copyfile(names_file_gast, names_file)
                except:
                    print "Could not find unique.fa file - ",ds_dir
                    sys.exit(1)

            rdp_out_file = os.path.join(ds_dir, 'rdp_out.txt') # to be created

            logging.info("starting RDP")
            print 'running rdp on',dataset
            print 'uniques file',unique_file
            print 'rdp_out file',rdp_out_file
            print 'ref db dir', args.ref_db_dir
            rdp.run_rdp( unique_file, rdp_out_file, args.process_dir, args.path_to_classifier, args.ref_db_dir )
    

            
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
    parser.add_argument("-project_dir", "--project_dir",    
                required=True,  action="store",   dest = "project_dir", 
                help = '') 
    parser.add_argument("-ref_db", "--reference_db",    
                required=True,  action="store",   dest = "ref_db", 
                help = '') 
    parser.add_argument("-path_to_classifier", "--path_to_classifier",    
                required=True,  action="store",   dest = "path_to_classifier", 
                help = '') 
    parser.add_argument("-process_dir", "--process_dir",    
                required=False,  action="store",   dest = "process_dir", default='/',
                help = '')
    args = parser.parse_args() 

    start_rdp(args)



