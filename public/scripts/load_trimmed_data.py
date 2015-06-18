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
from time import sleep
import ConfigParser
#sys.path.append( '/bioware/python/lib/python2.7/site-packages/' )
py_pipeline_path = os.path.expanduser('~/programming/py_mbl_sequencing_pipeline')
from IlluminaUtils.lib import fastalib
import datetime
today     = str(datetime.date.today())
import subprocess

"""

"""
          
    
    
def create_dirs(args):
    outdir = args.outdir
    analysis_dir = os.path.join(outdir,'analysis')
    #gast_dir = os.path.join(outdir,'analysis/gast')
    if not os.path.exists(analysis_dir):
        os.makedirs(analysis_dir)
    #if os.path.exists(gast_dir):
    #    shutil.rmtree(gast_dir)
    #os.makedirs(gast_dir)
    
def write_seqfiles(args):
    outdir = args.outdir
    
    datasets = {}
    files = {}
    stats = {}
    analysis_dir = os.path.join(outdir,'analysis')
    #gast_dir = os.path.join(outdir,'analysis/gast')
    if args.config_only:
        config = ConfigParser.RawConfigParser()
        
        info_file = os.path.join(outdir,'INFO-TAX.config')
        if os.path.isfile(info_file):
            print '1found file'
        else:
            info_file = os.path.join(outdir,'INFO_CONFIG.ini')
            if os.path.isfile(info_file):
                print '2found file'
        
        config.read(info_file)
        #ds = config.get("DATASETS") 
        seq_count = config.get("GENERAL",'project_total_sequence_count')
        
        ds_count = config.get("GENERAL",'number_of_datasets')
        datasets = dict(config.items('DATASETS'))
        
        
            
    else:    
        if args.upload_type == 'single':
            ds = args.dataset
            datasets[ds] = 0
            ds_dir = os.path.join(analysis_dir,ds)
            if not os.path.exists(ds_dir):
                os.makedirs(ds_dir)
            file = os.path.join(ds_dir,'seqfile.fa')
            fp = open(file,'w')
            files[ds] = fp
        seq_count = 0
        ds_count = 0
        
        f = fastalib.SequenceSource(fafile)
        while f.next():
            defline = f.id
            
            if args.upload_type == 'single':
                ds = args.dataset
                # should split on pipe and space
                #id = defline.split('|')[0].split('_')[0]
                id = defline.replace(' ','|').split('|')[0]
                datasets[ds] += 1                
                fp.write('>'+id+"\n"+f.seq+"\n")
            else:    
            
                try:
                    #id = defline.replace(' ','|')
                    # mobe  defline='>10056.000010538_2 HWI-M00888:59:000000000-A62ET:1:1101:15096:1532 1:N:0:GACCGTAAACTC orig_bc=GACCGTAAACTC new_bc=GACCGTAAACTC bc_diffs=0'
                    if 'orig_bc' in defline and 'new_bc' in defline:
                        #if there are orig_bc and new_bc in defline then assume mobe/qiime file
                        #and break up like this:
                        print 'found mobe defline'
                        tmp = defline.replace(' ','|').split('|')
                        ds = tmp[0].split('_')[0]
                        #id = tmp[1]
                        id = tmp[0].split('_')[1]  
                    else:
                        tmp = defline.replace(' ','|').split('|')
                        #print defline
                        ds = tmp[0]
                        id = tmp[1]
                    ds_dir = os.path.join(analysis_dir,ds)
                    
                    file = os.path.join(ds_dir,'seqfile.fa')
                    if ds in datasets:
                        datasets[ds] +=1
                    else:
                        datasets[ds] = 1
                    if ds in files:
                        files[ds].write('>'+id+"\n"+f.seq+"\n")
                    else:
                        if not os.path.exists(ds_dir):
                            os.makedirs(ds_dir)
                        #os.makedirs(ds_dir)
                        fp = open(file,'w')
                        files[ds] = fp
                        fp.write('>'+id+"\n"+f.seq+"\n")
                except:
                    sys.exit("Please check the multi-dataset format: ( defline='>" + defline+"' )")
            
            seq_count += 1
        ds_count = len(datasets)
        f.close()
        #print datasets
    
        for ds in files:
            files[ds].close()
    stats['seq_count'] = seq_count
    stats['ds_count'] = ds_count
    stats['datasets'] = datasets
    return stats
    #for ds in datasets:
        #os.mkdir()
        
def write_metafile(args,stats):
    
    f = open(mdfile_clean, 'wt')
    
    req_metadata = ['altitude','assigned_from_geo','collection_date','common_name','country','depth','description','elevation','env_biome','env_feature','env_matter','latitude','longitude','public','taxon_id']
    req_for_multi = ['sample_name','dataset']
    with open(mdfile, mode='r') as infile:
        reader = csv.reader(infile, delimiter='\t')  # TAB Only delimiter
        with open(mdfile_clean, mode='w') as outfile:
            writer = csv.writer(outfile, delimiter='\t')  # TAB Only delimiter
        
            md_datasets = []
            dataset_index = -1
            for i,items in enumerate(reader):
                if items == []:
                    continue
                if i==0:
                    if len(items) == 0:
                        sys.exit('No empty lines allowed.')
                    headers = items
                    header_count = len(headers)
                    #print headers
                    for n,req in enumerate(req_metadata):
                        if req not in headers:
                            print ','.join(req_metadata)
                            sys.exit('Found Missing Required Metadata: '+req)
                    
                    if args.upload_type == 'multi':
                        ds_in_headers = False
                        if req_for_multi[0] in headers:
                            ds_in_headers = True
                            dataset_index = headers.index(req_for_multi[0])
                        elif req_for_multi[1] in headers:
                            ds_in_headers = True
                            dataset_index = headers.index(req_for_multi[1])
                        else:
                            sys.exit("No dataset column found (allowed column names: 'dataset', 'sample_name')")
                    else:
                        items.insert(0,'dataset')
                else:
                    if args.upload_type == 'multi':
                        md_datasets.append(items[dataset_index])
                    else:
                        items.insert(0,args.dataset)  
                
                if len(items) > 0:
                    #print items
                    if args.upload_type == 'multi' and len(items) != header_count:
                        sys.exit('1-Missing Data: '+','.join(items))
                    elif args.upload_type == 'single' and len(items) != header_count +1:
                        sys.exit('2-Missing Data: '+','.join(items))
                    print "writing clean metadata file "+mdfile_clean
                    writer.writerow(items)
            if args.upload_type == 'multi':
            # check for datasets column in metadata -- needed to assign metadata to datasets
            # each dataset in the fasta (stats.datasets) MUST be in the metadata file (md_datasets)
                #print md_datasets
                #print stats['datasets']
                for ds in stats['datasets']:
                    if ds not in md_datasets:
                        sys.exit('Found a dataset that is not in the metadata file: '+ds)

    outfile.close()
    infile.close()
            
def write_config(args,stats):
    ini_file = os.path.join(args.outdir,'config.ini') 
    print 'Writing config.ini file:',ini_file  
    f = open(ini_file, 'w')
    f.write('[GENERAL]'+"\n")
    f.write('project='+args.project+"\n")
    f.write("project_title=\n")
    f.write("project_description=\n")
    f.write('baseoutputdir='+args.outdir+"\n")
    f.write('configPath='+ini_file+"\n")
    f.write('fasta_file='+fafile+"\n")
    f.write('platform=new_vamps'+"\n")
    f.write('owner='+args.owner+"\n")
    f.write('config_file_type=ini'+"\n")
    f.write('public=False'+"\n")
    f.write('fasta_type='+args.upload_type+"\n")
    f.write('dna_region='+args.dna_region+"\n")
    f.write('project_sequence_count='+str(stats['seq_count'])+"\n")
    f.write('domain='+args.domain+"\n")
    f.write('number_of_datasets='+str(stats['ds_count'])+"\n")
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
    fastaunique_cmd = py_pipeline_path+'/pipeline/bin/fastaunique'
    print args
    for dataset in stats["datasets"]:
        print dataset
        ds_dir = os.path.join(args.outdir, 'analysis',dataset)
        fasta_file  = os.path.join(ds_dir, 'seqfile.fa')
        unique_file = os.path.join(ds_dir, 'unique.fa')
        names_file  = os.path.join(ds_dir, 'names')
        fastaunique_call = fastaunique_cmd + " -o "+unique_file+" -n "+names_file +" "+fasta_file
        ds_unique_seq_count = subprocess.check_output(fastaunique_call, shell=True)
        
        
if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: load_trimmed_data.py  [options]
         
         Start of VAMPS upload process:
         Creates config.ini file
         THIS REPLACES the gast directory!!!!
         Takes fasta file and directory as input
         where
            
           
            
            -dir/--outdir         REQUIRED  path for creating dir structure
            
          
            
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
    parser.add_argument("-dir","--outdir",                   
    			required=True,  action="store",   dest = "outdir", 
    			help="""Directory to output ini and dir structure""")  
    
   
    # parser.add_argument("-o", "--owner",
    #             required=True,  action="store",   dest = "owner", default='guest',
    #             help="vamps user name/owner")
    # parser.add_argument("-p", "--project",
    #             required=True,  action='store', dest = "project",  default='',
    #             help="Project name")
    
    
    parser.add_argument("-d", "--dataset",        
    			required=False,  action='store', dest = "dataset",  default='',
    			help="Dataset Name") 
                                                 
    parser.add_argument("-t", "--upload_type",
    			required=True,  action='store', dest = "upload_type",  default='multi',
                choices=['multi','single'], help="multi or single dataset")
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
    args = parser.parse_args()    
   
    args.datetime     = str(datetime.date.today())    
    
    #check fasta
    #check meta
    if args.upload_type == 'single' and not args.dataset:
        sys.exit('Requires dataset for single mode')
    fafile = os.path.join(args.outdir,'fasta.fa')
    mdfile = os.path.join(args.outdir,'meta.csv') 
    mdfile_clean = os.path.join(args.outdir,'meta_clean.csv')
    
    
    create_dirs(args)    
    stats = write_seqfiles(args)
    print stats
    unique_seqs(args,stats)
    write_metafile(args,stats)
    write_config(args,stats)
        
