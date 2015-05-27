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
sys.path.append(os.path.expanduser('~/programming/vamps-node.js/public/scripts/'))
logging.info(sys.path)

#try:
import node_script_gast_run as gast
#    logging.info('found gast script')
#except:
#    logging.info("run_gast is not avalable")

#try:
import node_script_rdp_run as rdp_starter
#except:
#    logging.info("run_rdp is not avalable")

#try:
import node_script_database_loader as uploader
#    logging.info('found database_loader script')
#except:
#    logging.info("database_loader is not avalable")

#try:
import node_script_upload_metadata as upload_metadata
#    logging.info('found node_script_upload_metadata script')
#except:
#    logging.info("node_script_upload_metadata is not avalable")   

#try:
import node_script_create_json_dataset_files as dataset_files_creator
#    logging.info('found add_taxcounts script')
#except:
#    logging.info("add_taxcounts is not avalable")    



#try:
#import node_script_metadata_lookup as metadata_file_creator
#    logging.info('found node_script_metadata_lookup script')
#except:
#    logging.info("node_script_metadata_lookup is not avalable")    
import datetime
today     = str(datetime.date.today())
import subprocess



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
    parser.add_argument('-class', '--classifier',         
    			required=True,   action="store",  dest = "classifier",              
                help = 'gast or rdp')  
    parser.add_argument("-ddir", "--data_dir",    
    			required=True,  action="store",   dest = "baseoutputdir", 
                help = '')         
    parser.add_argument("-pdir", "--process_dir",    
                required=False,  action="store",   dest = "process_dir", default='/Users/avoorhis/programming/vamps-node.js/',
                help = '')
    args = parser.parse_args() 
    #os.chdir(os.path.expanduser('~/programming/vamps-node.js'))
    #os.chdir(args.baseoutputdir)
    
    LOG_FILENAME = args.baseoutputdir+'/log.txt'
    
    logger = logging.getLogger('')
    #logging.basicConfig(level=logging.DEBUG, filename=LOG_FILENAME, filemode="a+",
    #                            format="%(asctime)-15s %(levelname)-8s %(message)s")
    logging.basicConfig(stream=sys.stdout, level=logging.INFO)                       
    
    
    #logger.addHandler(ch)
    
                  
    logger.info("log: "+LOG_FILENAME)
    #steps ='gast'
    #steps ='vampsupload'
    args = parser.parse_args()
    

    # 1-1-1-1-1-1
    if args.classifier == 'gast':
        logger.info("starting GAST")
        gast.start_gast(args)
    else:
        print "starting RDP"
        logging.info("starting RDP")
        rdp_starter.start_rdp(args)
    
    # 2-2-2-2-2-2
    # load seq data from user_upload dir to database
	# has sequences_file and now will load to db:
    logging.info(args.NODE_DATABASE, args.baseoutputdir)
    logging.info("starting db upload")
    pid = uploader.start(args.NODE_DATABASE, args.baseoutputdir, args.process_dir)
    
    # 3-3-3-3-3-3
    # load metadata from file to database
    logging.info("starting metadata upload")
    upload_metadata.start(args.NODE_DATABASE, args.baseoutputdir)
    
    # 4-4-4-4-4-4
    # creates taxcount/metadata file
    logging.info("starting taxcounts")
    dataset_files_creator.go_add(args.NODE_DATABASE, pid, args.process_dir)
    
    
    
    # 5-5-5-5-5-5
    #logging.info("starting metadata lookup")
    #metadata_file_creator.start(args.NODE_DATABASE, args.process_dir)
    
    print "DONE"
    # this must be the last print:
    print "PID="+str(pid)
    
    logging.info("ALL DONE: "+str(pid))
    
        
