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
import configparser as ConfigParser
import subprocess
     


import datetime
datetime     = str(datetime.date.today())
    

def start_spingo(args):
    """
      Doc string
    """
    
    logging.info('CMD> '+' '.join(sys.argv))
    if args.verbose:
        print('CMD> ',sys.argv)
    
    datasets = {}
    
    config_path = os.path.join(args.project_dir, args.config_file)
    if not os.path.isfile(config_path):
        print( "Could not find config file ("+config_path+") **Exiting**")
        sys.exit()
   
    config = ConfigParser.ConfigParser()
    config.optionxform=str
    config.read(config_path)
    general_config_items = {}
    # CL take precedence for domain and dna_region
    
    for name, value in  config.items('MAIN'):
        #print('  %s = %s' % (name, value)  )
        general_config_items[name] = value
    #print(config.items('MAIN.dataset'))
    file_prefix = 'testing-fp'
    dir_prefix  = general_config_items['project_dir']
            
    
        
    total_uniques = 0
    for dataset_item in config.items('MAIN.dataset'):
            dataset = dataset_item[0]
            dscount = dataset_item[1]  # raw count
            print("\nDS KNT",dataset,dscount)
            unique_file = os.path.join(args.project_dir, 'analysis', dataset,'seqfile.unique.fa')
         
            spingo_out_file = os.path.join(args.project_dir, 'analysis', dataset, 'spingo_out.txt') # to be created
            spingo_args = [ '-i', unique_file, '-d', args.ref_database, '-w', '>', spingo_out_file ]
            spingo_cmd = args.path_to_spingo + ' ' + ' '.join(spingo_args)
            if args.verbose:
                print(spingo_cmd)
            subprocess.call(spingo_cmd, shell=True)
            """/Users/avoorhis/programming/SPINGO//spingo 
                -i /Users/avoorhis/programming/vamps-node.js/user_data/avoorhis/project-avoorhis_365797/analysis/H56Di.736010/seqfile.unique.fa 
                -d /Users/avoorhis/programming/SPINGO/database/RDP_11.2.species.fa 
                > /Users/avoorhis/programming/vamps-node.js/user_data/avoorhis/project-avoorhis_365797/analysis/H56Di.736010/spingo.out
                

"""
            
if __name__ == '__main__':
    import argparse
    
   
    
    myusage = """usage: spingo.py  [options]
         
         This is will start the (customized) python_pipeline
         for the GAST process, creating the vamps_* files
         for input to the new_vamps database.
         
         where
            
            -path_to_spingo/--path_to_spingo    REQ
            -db/--ref_database                  REQ
            -config/--config                    REQ
            -p/--project
            -project_dir/--project_dir                        
           
    
    
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage) 
    
    parser.add_argument("-project_dir", "--project_dir",    
                required=True,  action="store",   dest = "project_dir", 
                help = 'project directory')
    parser.add_argument("-p", "--project",        
                required=True,  action='store', dest = "project", 
                help="Project Name")
    parser.add_argument("-site", "--site",    
                required=False,  action='store', choices=['vamps','vampsdev','local'], dest = "site",  default='local',
                help="")                           
    parser.add_argument("-db", "--ref_database",    
                 required=True,  action="store",   dest = "ref_database",
                 help = 'See SPINGO README')                  
    parser.add_argument("-path_to_spingo", "--path_to_spingo",    
                required=True,  action="store",   dest = "path_to_spingo", 
                help = 'SPINGO Executable with full path') 
    parser.add_argument("-config", "--config",    
                required=True,  action="store",   dest = "config_file", 
                help = 'config file name') 
    parser.add_argument("-v", "--verbose",    
                required=False,  action="store_true",   dest = "verbose", default=False,
                help = 'chatty') 
    args = parser.parse_args() 

    start_spingo(args)
    #sys.exit('END: vamps_script_rdp_run.py')



