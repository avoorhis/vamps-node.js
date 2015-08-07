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
import re
import sys
import shutil
import types
import time
import random
import csv
import logging
from time import sleep
import ConfigParser
#sys.path.append( '/bioware/python/lib/python2.7/site-packages/' )
#py_pipeline_path = os.path.expanduser('~/programming/py_mbl_sequencing_pipeline')
from IlluminaUtils.lib import fastalib
import datetime
today     = str(datetime.date.today())
import subprocess

"""

"""
          
    
    
def create_dirs(args):
    basedir = args.basedir
    analysis_dir = os.path.join(basedir,'analysis')
    #gast_dir = os.path.join(basedir,'analysis/gast')
    if not os.path.exists(analysis_dir):
        os.makedirs(analysis_dir)
    #if os.path.exists(gast_dir):
    #    shutil.rmtree(gast_dir)
    #os.makedirs(gast_dir)
    
def write_seqfiles(args,collector):
    basedir = args.basedir
    
    datasets = {}
    files = {}
    stats = {}
    analysis_dir = os.path.join(basedir,'analysis')
    #gast_dir = os.path.join(basedir,'analysis/gast')
    #main_file = os.path.join(basedir,'seqfile.fa')
    main_fp = open(main_file,'w')
    seq_count = 0
    dataset_counts = {}
    for ds in collector:
        dataset_counts[ds] = 0
        ds_dir = os.path.join(analysis_dir,ds)
        if not os.path.exists(ds_dir):
            os.makedirs(ds_dir)
        ds_file = os.path.join(ds_dir,'seqfile.fa')
        tax_file = os.path.join(ds_dir,'sequences_n_taxonomy.txt')
        ds_fp  = open(ds_file,'w')
        tax_fp = open(tax_file,'w')    
        id2 = 1
        for i,obj in enumerate(collector[ds]):            
            id1 = str(i+1)
            cnt = collector[ds][i]['count']
            #main_fp.write('>'+ds+'|'+id1+"\n"+collector[ds][i]['seq']+"\n")
            tax_fp.write(collector[ds][i]['seq']+"\t"+collector[ds][i]['tax']+"\t"+collector[ds][i]['rank']+"\t"+str(collector[ds][i]['count'])+"\t"+collector[ds][i]['distance']+"\t"+collector[ds][i]['refhvrids']+"\n")
            for m in range(cnt):
                ds_fp.write('>'+str(id2)+"\n"+collector[ds][i]['seq']+"\n") 
                id2 += 1
            seq_count += cnt
            dataset_counts[ds] += cnt
        ds_fp.close()
        tax_fp.close()
        
            
    num_datasets = len(collector)
    #main_fp.close()
    #print datasets

    for ds in files:
        files[ds].close()
    stats['seq_count'] = seq_count
    stats['num_datasets'] = num_datasets
    stats['datasets'] = dataset_counts
    return stats
    #for ds in datasets:
        #os.mkdir()

def parse_file(args):
    std_headers = ['refhvr_ids', 'Distance', 'Sequence', 'Rank', 'Taxonomy']
    # Typical header: refhvr_ids\tAB_SAND_Bv6--HS122\tAB_SAND_Bv6--HS123\tDistance\tSequence\tRank\tTaxonomy
    header_items = []
    collector = {}
    with open(args.tax_by_seq_file, mode='r') as infile:
        
        for i,l in enumerate(infile):
            line_items = l.strip().split('\t')
            if line_items[0] == 'TaxBySeq':
                continue
            if line_items[0] == 'refhvr_ids':
                header_items = line_items
                print header_items
                pjds = []

                for header in header_items:
                    if header not in std_headers:
                        ds = header.replace('--','__')
                        pjds.append(ds)
                        collector[ds] = []
                continue
            #tax_collector[ds][tax]
            if not header_items:
                sys.exit('no headers')
            if len(line_items) != (len(std_headers)+len(pjds)):
                continue
            print line_items
            refhvrids = line_items[0]
            distance  = line_items[len(pjds)+1]
            seq       = line_items[len(pjds)+2]
            rank      = line_items[len(pjds)+3]
            tax       = line_items[len(pjds)+4]
            
            
            for n,ds in enumerate(pjds):
                count = int(line_items[1+n])
                #print count
                if count  > 0:              
                    collector[ds].append({'tax':tax,'count':count,'seq':seq,'distance':distance,'refhvrids':refhvrids,'rank':rank})



    #print collector 
    for ds in collector:
        print ds,len(collector[ds])
    return collector                

            
def write_config(args,stats):
    ini_file = os.path.join(args.basedir,'config.ini') 
    print 'Writing config.ini file:',ini_file  
    f = open(ini_file, 'w')
    f.write('[GENERAL]'+"\n")
    f.write('project='+args.project+"\n")
    f.write("project_title=\n")
    f.write("project_description=\n")
    f.write('baseoutputdir='+args.basedir+"\n")
    f.write('configPath='+ini_file+"\n")
    f.write('fasta_file='+os.path.join(args.basedir,'seqfile.fa')+"\n")
    f.write('platform=new_vamps'+"\n")
    f.write('owner='+args.owner+"\n")
    f.write('config_file_type=ini'+"\n")
    f.write('public=False'+"\n")
    f.write('fasta_type='+args.upload_type+"\n")
    f.write('dna_region='+args.dna_region+"\n")
    f.write('project_sequence_count='+str(stats['seq_count'])+"\n")
    f.write('domain='+args.domain+"\n")
    f.write('number_of_datasets='+str(stats['num_datasets'])+"\n")
    f.write('sequence_counts=RAW'+"\n")
    f.write('env_source_id='+str(args.envid)+"\n")
    f.write('has_tax=0'+"\n")
    f.write("\n")
    f.write('[DATASETS]'+"\n")
    print stats
    for ds in stats['datasets']:
        f.write(ds+'='+str(stats['datasets'][ds])+"\n")
        
    
    f.close()
    
def unique_seqs(args,stats):
    fastaunique_cmd = os.path.join(args.process_dir,'public','scripts','fastaunique')
    print args
    for dataset in stats["datasets"]:
        print dataset
        ds_dir = os.path.join(args.basedir, 'analysis',dataset)
        fasta_file  = os.path.join(ds_dir, 'seqfile.fa')
        unique_file = os.path.join(ds_dir, 'unique.fa')
        names_file  = os.path.join(ds_dir, 'names')
        fastaunique_call = fastaunique_cmd + " -o "+unique_file+" -n "+names_file +" "+fasta_file
        ds_unique_seq_count = subprocess.check_output(fastaunique_call, shell=True)

def put_taxonomy_in_db(args,collector):
    pass       
        
if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: load_tax_by_seq.py  [options]
         
         Start of VAMPS upload process:
         Creates config.ini file
         THIS REPLACES the gast directory!!!!
         Takes fasta file and directory as input
         where
            
           
            
            -dir/--basedir         REQUIRED  path for creating dir structure
            
          
            
            -t/--upload_type    REQUIRED defaults to 'multi' [single or multi] (Most MBE projects are multi)
            
            -d/--dataset          REQUIRED IF: source file type is single
            
            -co/--config_only       DON'T delete and re-create the analysis/gast directory 
                                    The gast file (vamps_sequences_pipe) must already be present
            Optional:
            -reg/--dna_region     defaults to v6            
            -dom/--domain         defaults to bacteria
            -env/--env_source_id  defaults to 100 (unknown)
            -pub/--public         defaults to False
            
    
    
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
    # parser.add_argument("-fa", "--fastafile",
    #             required=True,  action='store', dest = "fastafile",  default='',
    #             help="")
    # parser.add_argument("-md", "--metafile",
    #             required=True,  action='store', dest = "metafile",  default='',
    #             help="")   
    parser.add_argument("-dir","--basedir",                   
    			required=True,  action="store",   dest = "basedir", 
    			help="""Directory to output ini and dir structure""")  
    
   
                                                   
    parser.add_argument("-t", "--upload_type",
    			required=True,  action='store', dest = "upload_type",  default='multi',
                choices=['tax_by_seq','single'], help="multi or single dataset")
    parser.add_argument("-co", "--config_only", 
    			required=False,  action='store_true', dest = "config_only",  default=False, 
    			help="")
    parser.add_argument("-reg", "--dna_region",    
    			required=False,  action='store', dest = "dna_region",  default='v6',
    			help="")
    parser.add_argument("-dom", "--domain",        
    			required=False,  action='store', dest = "domain",  default='bacteria', 
    			help="")
    parser.add_argument("-env", "--env_source_id", 
    			required=False,  action='store', dest = "envid",  default='100', 
    			help="")
    parser.add_argument("-pub", "--public",        
    			required=False,  action='store_true', dest = "public",  default=False, 
    			help="")
    parser.add_argument("-o", "--owner",        
    			required=True,  action='store', dest = "owner",  default=False, 
    			help="")
    parser.add_argument("-p", "--project",        
    			required=True,  action='store', dest = "project",  default=False, 
    			help="")
    parser.add_argument("-pdir", "--process_dir",    
                required=False,  action="store",   dest = "process_dir", default='/Users/avoorhis/programming/vamps-node.js/',
                help = '')
    parser.add_argument('-db', '--NODE_DATABASE',         
                required=True,   action="store",  dest = "NODE_DATABASE",            
                help = 'node database') 


    args = parser.parse_args() 
    args.ref_db = 'none'   
    args.classifier = 'unknown' 
    args.input_type = 'tax_by_seq' 
    args.datetime     = str(datetime.date.today())    
    
    
    args.tax_by_seq_file = os.path.join(args.basedir,'tax_by_seq.txt')
    
    
    create_dirs(args)   
    collector = parse_file(args) 
    stats = write_seqfiles(args,collector)
    print stats
    unique_seqs(args,stats)
  #  write_metafile(args,stats)
    write_config(args,stats)



    import vamps_script_database_loader as load_data
    logging.info('running vamps_script_database_loader.py')
    args.pid = int(load_data.start(args))
    
    logging.info('GOT NEW PID: '+str(args.pid))
    print 'GOT NEW PID: '+str(args.pid)

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
        
