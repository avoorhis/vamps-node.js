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
import logging
from time import sleep
import ConfigParser

import datetime
datetime     = str(datetime.date.today())
import subprocess



            
if __name__ == '__main__':
    import argparse
    myusage = """usage: vamps_data_script.py  [options]
         
         where
            
    
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    # REQUIRED::TRUE
    
    
                                            
    
    parser.add_argument("-project_dir","--project_dir",                   
                required=True,  action="store",   dest = "project_dir", 
                help="""Directory to output ini and dir structure""")   
    
    parser.add_argument("-owner", "--owner",        
                required=True,  action='store', dest = "owner", 
                help="")
    parser.add_argument("-p", "--project",        
                required=True,  action='store', dest = "project",  default=False, 
                help="")
    parser.add_argument("-work", "--work",    
                required=True,  action='store', choices=['UPLOAD','GAST','RDP'], dest = "work", 
                help="")
###################
    # REQUIRED::FALSE
    parser.add_argument('-db', '--NODE_DATABASE',         
                required=False,   action="store",  dest = "NODE_DATABASE",            
                help = 'node database') 
    parser.add_argument('-ref_db_dir', '--reference_db_dir',         
                required=False,   action="store",  dest = "ref_db_dir",           
                help = 'ref database dir')   
    parser.add_argument("-c", "--config_file",             
                required=False,  action="store",   dest = "config", default='',
                help="config file with path") 
    parser.add_argument("-path_to_classifier", "--path_to_classifier",    
                required=False,  action="store",   dest = "path_to_classifier", default='./',
                help = '') 
    parser.add_argument("-process_dir", "--process_dir",    
                required=False,  action="store",   dest = "process_dir", default='',
                help = '')
    parser.add_argument("-d", "--dataset",        
                required=False,  action='store', dest = "dataset",  default='',
                help="Dataset Name")                                                  
    parser.add_argument("-upload_type", "--upload_type",
                required=False,  action='store', dest = "upload_type",  default='multi',
                choices=['multi','single'], help="multi or single dataset")

    parser.add_argument("-dna_region", "--dna_region",    
                required=False,  action='store', dest = "dna_region",  default='v6',
                help="")
    parser.add_argument("-domain", "--domain",        
                required=False,  action='store', dest = "domain",  default='bacteria', 
                help="")
    parser.add_argument("-envid", "--env_source_id", 
                required=False,  action='store', dest = "envid",  default='100', 
                help="")
    parser.add_argument("-public", "--public",        
                required=False,  action='store_true', dest = "public",  default=False, 
                help="")
    parser.add_argument("-site", "--site",    
                required=False,  action='store', choices=['vamps','vampsdev','local'], dest = "site",  default='local',
                help="")
    
    args = parser.parse_args() 
   
    
    

    if args.work == 'UPLOAD':
        import vamps_load_trimmed_data as upload
        logging.info("starting UPLOAD")
        print "starting UPLOAD"
        upload.start_upload(args)

    else:
        if args.work == 'GAST':
            import vamps_script_gast_run as gast
            logging.info("starting GAST")
            print "starting GAST"
            args.classifier = args.work
            gast.start_gast(args)

        elif args.work == 'RDP':
            import vamps_script_rdp_run as rdp
            logging.info("starting RDP")
            print "starting RDP"
            args.classifier = args.work
            rdp.start_rdp(args)

        import vamps_script_database_loader as load_data
        logging.info('running vamps_script_database_loader.py')
        print(args.NODE_DATABASE+' - '+ args.project_dir)
        print("starting database_loader script")
        
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
        print("starting metadata_upload script")
        load_metadata.start_pipeline_load(args)
        logging.info("finishing metadata")

        
        # 4-4-4-4-4-4
        # creates taxcount/metadata file
        import vamps_script_create_json_dataset_files as dataset_files_creator
        logging.info('running vamps_script_create_json_dataset_files.py')   
        print("starting taxcounts and metadata files creation")
        dataset_files_creator.go_add(args)
        logging.info("finishing taxcounts")
        
        
        # 5-5-5-5-5-5

        logging.info("DONE")
        print "DONE"
        # this must be the last print:
        print "PID="+str(args.pid)
        
        logging.info("ALL DONE: (PID="+str(args.pid)+')')










 