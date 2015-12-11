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

# try:
#     import database_importer as uploader
# except:
#     logging.info( "database_importer is not avalable")
# try:
#     import run_gast as gast
# except:
#     logging.info( "run_gast is not avalable")
# try:
#     import run_rdp as rdp
# except:
#     logging.info( "run_rdp is not avalable")
import datetime
datetime     = str(datetime.date.today())
import subprocess

# /groups/vampsweb/vampsdev/vamps_gast.py 
# -r 24295512 
# -p Fgt56 
# -u avoorhis 
# -reg unknown 
# -site vampsdev 
# -dom bacteria 
# -out /groups/vampsweb/vampsdev/tmp/avoorhis_24295512 
# --classifier GAST 
# -tcount 50 
# --use64bit 
# --use_cluster 
# --full_length

#use_local_pipeline = False
#py_pipeline_path = os.path.expanduser('~/programming/py_mbl_sequencing_pipeline')
#logging.debug( py_pipeline_path)
#sys.path.append(py_pipeline_path)

#from pipeline.run import Run
#from pipelineprocessor import process
#from pipeline.db_upload import MyConnection
#from pipeline.utils import Dirs, PipelneUtils       
    

def start_gast(args):
    """
      Doc string
    """
    logging.info('CMD> '+' '.join(sys.argv))
    print 'CMD> ',sys.argv
    use_local_pipeline = False
    if args.site == 'vamps' or args.site == 'vampsdev':
        sys.path.append(os.path.join('/','groups','vampsweb','py_mbl_sequencing_pipeline'))
        from pipeline.run import Run
        from pipelineprocessor import process
        from pipeline.db_upload import MyConnection
        from pipeline.utils import Dirs, PipelneUtils
        use_cluster     = True
    else:
        sys.path.append(os.path.join(args.process_dir,'public','scripts'))
        from gast.run import Run
        from gast.pipelineprocessor import process
        use_cluster     = False
    
    platform        = 'new_vamps'
    runcode         = 'NONE'
    site            = 'new_vamps'
    load_db         = True
    steps           = 'gast,new_vamps'
    fasta_file_from_cl  = '' #args.fasta_file
    
    mobedac         = False # True or False
    gast_input_source = 'file'
    seq_count   = 0
    
    
    os.chdir(args.project_dir)
    info_load_infile = args.config
    if not os.path.isfile(info_load_infile):
        logging.info( "Could not find config file ("+info_load_infile+") **Exiting**")
        sys.exit()
   
    config = ConfigParser.ConfigParser()
    config.optionxform=str
    config.read(info_load_infile)
    general_config_items = {}
    # CL take precedence for domain and dna_region
    
    for name, value in  config.items('GENERAL'):
        #print '  %s = %s' % (name, value)  
        general_config_items[name] = value
        
    file_prefix = 'testing-fp'
    dir_prefix  = general_config_items['baseoutputdir']
            
    logging.info(   'FROM INI-->'      )  
    logging.info(   general_config_items) 
    logging.info(   '<<--FROM INI'    )
    #in utils.py: def __init__(self, is_user_upload, dir_prefix, platform, lane_name = '', site = ''):
    #dirs = Dirs(True, dir_prefix, platform, site = site) 
    if not os.path.exists(args.project_dir):
        sys.exit(args.project_dir+' not found')
    
    analysis_dir = os.path.join(args.project_dir,'analysis') 
    gast_dir = os.path.join(analysis_dir,'gast') 
    if not os.path.exists(analysis_dir) or not os.path.exists(gast_dir):  
        print 'Could not find analysis or gast directory'
        sys.exit(1)
    #global_gast_dir = dirs.check_dir(dirs.gast_dir) 
    
    logging.debug(analysis_dir)
   
    
    
    myRunDict = {}
    # this is a minimal run dictionary for the general stanza
    myRunDict['general'] = {'run_date':datetime,                 
                            'new_vamps_upload':   True,
                            'vamps_user_upload':    True,
                            'use64bit':             False,
                            'mobedac':              mobedac,
                            'gast_input_source':    gast_input_source,
                            'input_file_names':     'vamps_upload',
                            'input_file_lanes':     '1',
                            'input_file_formats':   'fasta',
                            'run':                  runcode,
                            'use_cluster':          use_cluster,
                            'platform':             'new_vamps',
                            'dna_region':           general_config_items['dna_region'],
                            'domain':               general_config_items['domain'],
                            'env_source_id':        general_config_items['env_source_id'],
                            'classifier':           args.classifier,
                            'user':                 general_config_items['owner'],
                            'site':                 args.site, 
                            'load_vamps_database':  load_db,
                            'use_full_length':      True,
                            'input_files':          None,
                            'files_list':           [],
                            'output_dir':           general_config_items['baseoutputdir'],
                            'file_prefix':          file_prefix,
                            'project':              general_config_items['project'],
                            #new_vamps::
                            'project_dir':          args.project_dir,
                            'node_db':              args.NODE_DATABASE,
                            'process_dir':          args.process_dir,
                            
                            'ref_db_dir':           args.ref_db_dir,
                            'config_file':          args.config
                            
                            
                        }
    
    
    print myRunDict
    
    #
    #
    #
    run = Run(myRunDict, general_config_items['baseoutputdir'])
    #sys.exit()
    #
    #
    #
    # pack the things we'll need for GAST
    #run.project = project
    #run.dataset = dataset
    run.load_db = load_db
    #run.env_source_id=env_source_id
    run.site = site
    run.fasta_file_from_cl=fasta_file_from_cl
    run.runcode = runcode
    
    run.samples = {}

        
    ds_list = []
    datasets_list = config.options('DATASETS')
    number_of_datasets = len(datasets_list)
    info_tax_file = os.path.join(general_config_items['baseoutputdir'],'INFO_CONFIG.ini')
    info_fh = open(info_tax_file,'w')
    logging.info( 'Writing to '+info_tax_file)
    info_fh.write("[GENERAL]\n")
    info_fh.write('project='+general_config_items['project']+"\n")
    info_fh.write("classifier=GAST\n")
    info_fh.write("status=gasting\n")
    info_fh.write('date='+datetime+"\n")
    info_fh.write('file_base='+general_config_items['baseoutputdir']+"\n")
    info_fh.write("has_tax=0\n")
    info_fh.write("sequence_counts=UNIQUE\n")
    
    info_fh.write("number_of_datasets="+str(number_of_datasets)+"\n")
    info_fh.write("owner="+general_config_items['owner']+"\n")
    info_fh.write("dna_region="+general_config_items['dna_region']+"\n")
    info_fh.write("domain="+general_config_items['domain']+"\n")
    info_fh.write("env_source_id="+general_config_items['env_source_id']+"\n")
    info_fh.write("public="+general_config_items['public']+"\n")
    info_fh.flush()
    total_uniques = 0
    datasets = {}
    for dataset in datasets_list:
        logging.info( "\nlooking for unique file for "+dataset)
        ds_dir = os.path.join(gast_dir, dataset)
        fasta_file  = os.path.join(ds_dir, 'seqfile.fa')
        unique_file = os.path.join(ds_dir, 'unique.fa')
        names_file  = os.path.join(ds_dir, 'names')
        if not os.path.exists(unique_file):  
            logging.debug('Could not find unique file '+unique_file)
        #fastcount_call = "grep '>' "+unique_file+" | wc -l"
        grep_cmd = ['grep', '-c', '>', unique_file]
        logging.debug( ' '.join(grep_cmd) )
        ds_unique_seq_count = subprocess.check_output(grep_cmd).strip()
        
        #ds_unique_seq_count = subprocess.check_output(fastcount_call, shell=True)
        total_uniques += int(ds_unique_seq_count)
        datasets[dataset]=ds_unique_seq_count
    info_fh.write("project_total_sequence_count="+general_config_items['project_sequence_count']+"\n")
    info_fh.write("project_unique_sequence_count="+str(total_uniques)+"\n")
    info_fh.write("\n[DATASETS]\n")
    for ds in datasets:
        info_fh.write(ds+"="+str(datasets[ds]))
    info_fh.flush()
    info_fh.close()
    
    # delete old config file:
    #os.remove(info_load_infile)
    #
    #logging.debug('DATASETS '+';'.join(datasets_list))
    run.datasets = datasets_list
    
    
    ###############################################################
    # This starts the MBL GAST python pipeline at the GAST STEP unless vampsupload only was passed as a step
    #
    # now do all the work
    # possible steps: trim,chimera,gast,vampsupload,new_vamps
    
    process(run, steps)
    

            
if __name__ == '__main__':
    import argparse
    
   
    
    myusage = """

            usage: vamps_script_gast_run.py  [options]
         
         This is will start the (customized) python_pipeline
         for the GAST process, creating the vamps_* files
         for input to the new_vamps database.
         
         where
            
            -c/--config    REQUIRED path to config file.
                            
                    SHOULD be the only thing needed
                    (create config file with 1-vamps-load.py   )   
           
    
    
    """
 