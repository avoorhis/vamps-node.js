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


sys.path.append(os.path.expanduser('~/programming/vamps-node.js/public/scripts/'))

#except:
#    logging.info("add_taxcounts is not avalable")    



#try:
#import node_script_metadata_lookup as metadata_file_creator
#    logging.info('found node_script_metadata_lookup script')
#except:
#    logging.info("node_script_metadata_lookup is not avalable")    




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
    			required=True,  action="store",   dest = "basedir", 
                help = '')         
    parser.add_argument("-pdir", "--process_dir",    
                required=False,  action="store",   dest = "process_dir", default='/Users/avoorhis/programming/vamps-node.js/',
                help = '')
    args = parser.parse_args() 
    #os.chdir(os.path.expanduser('~/programming/vamps-node.js'))
    #os.chdir(args.basedir)
    
    LOG_FILENAME = '/Users/avoorhis/programming/vamps-node.js/logs/assign_tax.log'
    LOG_FILENAME = os.path.join(args.basedir,'assign_tax.log')
    print LOG_FILENAME
        
        
    logging.basicConfig(filename=LOG_FILENAME, level=logging.DEBUG)    
    logging.debug(sys.path)


    #try:

    import node_script_database_loader as load_data
    logging.warning('LOGGING found database_loader script')

    #except:
    # logging.info("database_loader is not avalable")

    #try:

    import node_script_upload_metadata as load_metadata
    logging.warning('found node_script_upload_metadata script')

    #except:
    #    logging.info("node_script_upload_metadata is not avalable")   

    #try:
    import node_script_create_json_dataset_files as dataset_files_creator
    logging.warning('found add_taxcounts script')                      
    
    
   
    
                  
    logging.warning("log: "+LOG_FILENAME)
    #steps ='gast'
    #steps ='vampsupload'
    args = parser.parse_args()
    

    # 1-1-1-1-1-1
    if args.classifier == 'gast':
        #try:
        import node_script_gast_run as gast
        #    logging.info('found gast script')
        #except:
        #    logging.info("run_gast is not avalable")
        logging.info("starting GAST")
        gast.start_gast(args)

    elif args.classifier == 'rdp':
        #try:
        import node_script_rdp_run as rdp
        #except:
        #    logging.info("run_rdp is not avalable")
        logging.info("starting RDP")
        rdp.start_rdp(args)
    else:
        pass

    # 2-2-2-2-2-2
    # load seq data from user_upload dir to database
	# has sequences_file and now will load to db:
    logging.info(args.NODE_DATABASE+' - '+ args.basedir)
    logging.info("starting db upload")

    args.pid = load_data.start(args)

    
    # 3-3-3-3-3-3
    # load metadata from file to database

    logging.info("starting metadata")
    load_metadata.start(args)
    logging.info("finishing metadata")

    
    # 4-4-4-4-4-4
    # creates taxcount/metadata file
    logging.info("starting taxcounts")
    dataset_files_creator.go_add(args)
    logging.info("finishing taxcounts")
    
    
    # 5-5-5-5-5-5
    #logging.info("starting metadata lookup")
    #metadata_file_creator.start(args.NODE_DATABASE, args.process_dir)
    logging.info("DONE")
    print "DONE"
    # this must be the last print:
    print "PID="+str(args.pid)
    
    logging.info("ALL DONE: (PID="+str(args.pid)+')')
    
        
