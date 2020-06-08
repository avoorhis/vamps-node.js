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
    

def start_rdp(args):
    """
      Doc string
    """
    
    

    import rdp.rdp as rdp
    logging.info('CMD> '+' '.join(sys.argv))
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
            
    
    # global_gast_dir = os.path.join(args.basedir,'analysis','gast')
#     rdp_dir = os.path.join(args.project_dir,'rdp')
#     if not os.path.exists(rdp_dir):
#         os.makedirs(rdp_dir)
        
    total_uniques = 0
    for dataset_item in config.items('MAIN.dataset'):
            dataset = dataset_item[0]
            dscount = dataset_item[1]  # raw count
            print("\nDS KNT",dataset,dscount)
            unique_file = os.path.join(args.project_dir, 'analysis', dataset,'seqfile.unique.fa')
         
            #rdp_out_file = os.path.join(rdp_dir, dataset+'.rdp') # to be created
            rdp_out_file = os.path.join(args.project_dir, 'analysis', dataset, 'rdp_out.rdp') # to be created
            rdp.run_rdp( unique_file, rdp_out_file, args.path_to_classifier, args.gene, args.host )
    

            
if __name__ == '__main__':
    import argparse
    
   
    
    myusage = """usage: rdp.py  [options]
         
         This is will start the (customized) python_pipeline
         for the GAST process, creating the vamps_* files
         for input to the new_vamps database.
         
         where
            
            FILL THIS IN! 
           
    
    
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage) 
    
    parser.add_argument("-project_dir", "--project_dir",    
                required=True,  action="store",   dest = "project_dir", 
                help = 'project directory')
    parser.add_argument("-p", "--project",        
                required=True,  action='store', dest = "project", 
                help="Project Name")
    parser.add_argument("-host", "--host",    
                required=False,  action='store', choices=['vamps','vampsdev','local'], dest = "host",  default='local',
                help="")            
                 
    parser.add_argument("-gene", "--gene",    
                 required=False,  action="store",   dest = "gene", default="16srrna",
                 help = 'See RDP README: 16srrna, fungallsu, fungalits_warcup, fungalits_unite') 
                 
    parser.add_argument("-path_to_classifier", "--path_to_classifier",    
                required=False,  action="store",   dest = "path_to_classifier", default='/Users/avoorhis/programming/rdp_classifier/classifier.jar',
                help = 'rdp classifier with full path') 
    parser.add_argument("-config", "--config",    
                required=True,  action="store",   dest = "config_file", 
                help = 'config file name') 
    args = parser.parse_args() 

    start_rdp(args)
    #sys.exit('END: vamps_script_rdp_run.py')



