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
print sys.path
import run_gast as gast
try:
    import database_importer as uploader
    print 'found database_importer script'
except:
    print "database_importer is not avalable"
try:
    import run_gast as gast
    print 'found gast script'
except:
    print "run_gast is not avalable"
try:
    import run_rdp as rdp
except:
    print "run_rdp is not avalable"
    
    
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
            
            -c/--config    REQUIRED path to config file.
                            
                    SHOULD be the only thing needed
                    (create config file with 1-vamps-load.py   )   
           
    
    
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
   
    parser.add_argument("-c", "--config",             
    			required=True,  action="store",   dest = "config",
                help="config file with path") 
    parser.add_argument('-db', '--NODE_DATABASE',         
    			required=True,   action="store",  dest = "NODE_DATABASE",            
                help = 'steps to run')                                           
    parser.add_argument('-class', '--classifier',         
    			required=True,   action="store",  dest = "classifier",              
                help = 'steps to run')  
    parser.add_argument("-dir", "--baseoutputdir",    
    			required=True,  action="store",   dest = "baseoutputdir", 
                help = '')         

    args = parser.parse_args() 
    #os.chdir(os.path.expanduser('~/programming/vamps-node.js'))
    #os.chdir(args.baseoutputdir)
    
    LOG_FILENAME = args.baseoutputdir+'/log.txt'
    
    logger = logging.getLogger('')
    logging.basicConfig(level=logging.DEBUG, filename=LOG_FILENAME, filemode="a+",
                            format="%(asctime)-15s %(levelname)-8s %(message)s")
                            
    
                  
    logger.info("log: "+LOG_FILENAME)
    #steps ='gast'
    #steps ='vampsupload'
    args = parser.parse_args()
    

   
    if args.classifier == 'gast':
        print 'starting GAST'
        logger.info("starting GAST")
        gast.start_gast(args)
    else:
        print 'starting RDP'
        logging.info("starting RDP")
        #rdp.start_rdp(args)
    
    print args.NODE_DATABASE, args.baseoutputdir
    print 'Starting Database Upload'
    logging.info("starting db upload")
    
    uploader.start(args.NODE_DATABASE, args.baseoutputdir)
    
    print "DONE"
    logging.info("ALL DONE")
        
