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
import csv
from time import sleep
import logging

import ConfigParser
import datetime
today     = str(datetime.date.today())
import subprocess




#sys.path.append(os.path.expanduser('~/programming/vamps-node.js/public/scripts/'))
script_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(script_path)


use_local_pipeline = False
# py_pipeline_path = os.path.expanduser('~/programming/py_mbl_sequencing_pipeline')
# print py_pipeline_path
# sys.path.append(py_pipeline_path)
# from pipeline.run import Run
# from pipelineprocessor import process
# from pipeline.db_upload import MyConnection
# from pipeline.utils import Dirs, PipelneUtils
    


if __name__ == '__main__':
    import argparse
    
   
    
    myusage = """usage: Assign_Taxonomy  STEP 1  [options]
         
         This is will start the (customized) python_pipeline
         for the GAST process, creating the vamps_* files
         for input to the new_vamps database.
         
         where
            
            -c/--config    REQUIRED full path to config file.
                            
                    SHOULD be the only thing needed
                    (create config file with 1-vamps-load.py   )   
          -classifier gast or rdp
           -db NODE_DATABASE
           --process_dir  base id node js
           --data_dir  where the fasta and meta are
    
    
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
    parser.add_argument("-c", "--config",             
                required=True,  action="store",   dest = "config",
                help="config file with path") 
    
    parser.add_argument('-db', '--NODE_DATABASE',         
                required=True,   action="store",  dest = "NODE_DATABASE",            
                help = 'node database') 
    
    parser.add_argument('-ref_db_dir', '--reference_db_dir',         
                required=True,   action="store",  dest = "ref_db_dir", default = "default",           
                help = 'ref database dir')                                           
    
    parser.add_argument('-class', '--classifier',         
                required=True,   action="store",  dest = "classifier",              
                help = 'gast or rdp')  
    
    parser.add_argument("-ddir", "--data_dir",    
                required=True,  action="store",   dest = "basedir", 
                help = '')         
    parser.add_argument("-script_dir", "--script_dir",    
                required=False,  action="store",   dest = "rdp_script_dir", 
                help = '') 
    parser.add_argument("-pdir", "--process_dir",    
                required=False,  action="store",   dest = "process_dir", default='/Users/avoorhis/programming/vamps-node.js/',
                help = '')

    parser.add_argument("-host", "--host",    
                required=False,  action="store",   dest = "hostname", default='local',
                help = '')

    args = parser.parse_args() 


    
    
    LOG_FILENAME = os.path.join(args.basedir,'assign_tax.log')
    print LOG_FILENAME
                
    logging.basicConfig(filename=LOG_FILENAME, level=logging.DEBUG, filemode="w")    
    logging.debug(sys.path)
          


    logging.warning("log: "+LOG_FILENAME)
    #steps ='gast'
    #steps ='vampsupload'
    args = parser.parse_args()

# THIS SCRIPT SAMPLE
#    /Users/avoorhis/programming/vamps-node.js/public/scripts/vamps_script_assign_taxonomy.py 
#           --classifier gast 
#           --config /Users/avoorhis/programming/vamps-node.js/user_data/vamps_js_dev_av/andy/project-142c/config.ini 
#           --process_dir /Users/avoorhis/programming/vamps-node.js 
#           --data_dir /Users/avoorhis/programming/vamps-node.js/user_data/vamps_js_dev_av/andy/project:142c 
#           -db vamps_js_dev_av

    # 1-1-1-1-1-1
    if args.classifier.upper() == 'GAST' :


        
        import vamps_script_gast_run as gast
        logging.info("starting GAST")
        print "starting GAST"
        gast.start_gast(args)

    elif args.classifier.upper() == 'RDP':
        
        import vamps_script_rdp_run as rdp


        logging.info("starting RDP")
        print "starting RDP"
        rdp.start_rdp(args)



    else:
        pass

    # 2-2-2-2-2-2
    # load seq data from user_upload dir to database
    # has sequences_file and now will load to db:


    import vamps_script_database_loader as load_data
    logging.info('running vamps_script_database_loader.py')
    print(args.NODE_DATABASE+' - '+ args.basedir)
    print("starting db upload")
    
    #try:
    args.pid = int(load_data.start(args))
    # except:
    #     logging.info('PID IS NOT INT: '+str(args.pid)+ ' -EXITING')
    #     print 'PID IS NOT INT: '+str(args.pid)+ ' -EXITING'
    #     sys.exit(-2)
    logging.info('GOT NEW PID: '+str(args.pid))
    print 'GOT NEW PID: '+str(args.pid)

    # 3-3-3-3-3-3
    # load metadata from file to database
    import vamps_script_upload_metadata as load_metadata
    logging.info('running vamps_script_upload_metadata.py')
    print("starting metadata")
    load_metadata.start(args)
    logging.info("finishing metadata")

    
    # 4-4-4-4-4-4
    # creates taxcount/metadata file
    import vamps_script_create_json_dataset_files as dataset_files_creator
    logging.info('running vamps_script_create_json_dataset_files.py')   
    print("starting taxcounts")
    dataset_files_creator.go_add(args)
    logging.info("finishing taxcounts")
    
    
    # 5-5-5-5-5-5

    logging.info("DONE")
    print "DONE"
    # this must be the last print:
    print "PID="+str(args.pid)
    
    logging.info("ALL DONE: (PID="+str(args.pid)+')')
    
        
