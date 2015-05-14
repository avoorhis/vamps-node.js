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
logger = logging.getLogger('')
try:
    import database_importer as uploader
except:
    logger.info( "database_importer is not avalable")
try:
    import run_gast as gast
except:
    logger.info( "run_gast is not avalable")
try:
    import run_rdp as rdp
except:
    logger.info( "run_rdp is not avalable")
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

use_local_pipeline = False
py_pipeline_path = os.path.expanduser('~/programming/py_mbl_sequencing_pipeline')
logger.info( py_pipeline_path)
sys.path.append(py_pipeline_path)
from pipeline.run import Run
from pipelineprocessor import process
from pipeline.db_upload import MyConnection
from pipeline.utils import Dirs, PipelneUtils       
    

def start_gast(args):
    """
      Doc string
    """
    
    platform        = 'new_vamps'
    runcode         = 'NONE'
    site            = 'new_vamps'
    load_db         = True
    steps           = 'gast,new_vamps'
    fasta_file_from_cl  = '' #args.fasta_file
    use_cluster     = False
    mobedac         = False # True or False
    gast_input_source = 'file'
    seq_count   = 0
    log_file_path = os.path.join(args.baseoutputdir,'log.txt')
    logging.basicConfig(level=logging.DEBUG, filename=log_file_path, filemode="a+",
                            format="%(asctime)-15s %(levelname)-8s %(message)s")
    os.chdir(args.baseoutputdir)
    info_load_infile = args.config
    if not os.path.isfile(info_load_infile):
        logger.info( "Could not find config file ("+info_load_infile+") **Exiting**")
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
            
    logger.info(   'FROM INI-->'      )  
    logger.info(   general_config_items) 
    logger.info(   '<<--FROM INI'    )
    #in utils.py: def __init__(self, is_user_upload, dir_prefix, platform, lane_name = '', site = ''):
    dirs = Dirs(True, dir_prefix, platform, site = site) 
    
    analysis_dir = dirs.check_dir(dirs.analysis_dir)    
    global_gast_dir = dirs.check_dir(dirs.gast_dir) 
    logger.info( analysis_dir,global_gast_dir)
   
    
    
    myRunDict = {}
    # this is a minimal run dictionary for the general stanza
    myRunDict['general'] = {'run_date':datetime,                 
                            'new_vamps_upload':   True,
                            'use64bit':             True,
                            'mobedac':              mobedac,
                            'gast_input_source':    gast_input_source,
                            'input_file_names':     'vamps_upload',
                            'input_file_lanes':     '1',
                            'input_file_formats':   'fasta',
                            'run':                  runcode,
                            'use_cluster':          use_cluster,
                            'platform':             general_config_items['platform'],
                            'dna_region':           general_config_items['dna_region'],
                            'domain':               general_config_items['domain'],
                            'env_source_id':		general_config_items['env_source_id'],
                            'classifier':           'GAST',
                            'user':                 general_config_items['owner'],
                            'site':                 'new_vamps', 
                            'load_vamps_database':  load_db,
                            'use_full_length':      True,
                            'input_files':          None,
                            'files_list':           [],
                            'output_dir':           general_config_items['baseoutputdir'],
                            'file_prefix':          file_prefix,
                            'project':				general_config_items['project']
                        }
    logger.info( myRunDict)
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
    
    
    #run.basedir = file_base
    #fastaunique_cmd = '/bioware/seqinfo/bin/fastaunique'
    fastaunique_cmd = py_pipeline_path+'/pipeline/bin/fastaunique'

        
    ds_list = []
    datasets_list = config.options('DATASETS')
    number_of_datasets = len(datasets_list)
    info_tax_file = os.path.join(general_config_items['baseoutputdir'],'INFO_CONFIG.ini')
    info_fh = open(info_tax_file,'w')
    logger.info( 'Writing to ',info_tax_file)
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
        logger.info( "\nUnique-ing",dataset)
        ds_dir = os.path.join(global_gast_dir, dataset)
        fasta_file  = os.path.join(ds_dir, 'seqfile.fa')
        unique_file = os.path.join(ds_dir, 'unique.fa')
        names_file  = os.path.join(ds_dir, 'names')
        fastaunique_call = fastaunique_cmd + " -o "+unique_file+" -n "+names_file +" "+fasta_file
        ds_unique_seq_count = subprocess.check_output(fastaunique_call, shell=True)
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
    run.datasets = datasets_list
    
    
    ###############################################################
    # This starts the MBL GAST python pipeline at the GAST STEP unless vampsupload only was passed as a step
    #
    # now do all the work
    # possible steps: trim,chimera,gast,vampsupload,new_vamps
    
    process(run, steps)
    

            
if __name__ == '__main__':
    import argparse
    
   
    
    myusage = """usage: gast.py  [options]
         
         This is will start the (customized) python_pipeline
         for the GAST process, creating the vamps_* files
         for input to the new_vamps database.
         
         where
            
            -c/--config    REQUIRED path to config file.
                            
                    SHOULD be the only thing needed
                    (create config file with 1-vamps-load.py   )   
           
    
    
    """
 