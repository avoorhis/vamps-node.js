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
import MySQLdb
from time import sleep
import gzip
import ConfigParser
#sys.path.append( '/bioware/python/lib/python2.7/site-packages/' )
#py_pipeline_path = os.path.expanduser('~/programming/py_mbl_sequencing_pipeline')
from IlluminaUtils.lib import fastalib
import datetime
today     = str(datetime.date.today())
import subprocess

import vamps_script_database_loader as load_data
import vamps_script_create_json_dataset_files as dataset_files_creator

"""

"""
          
    
    
def create_dirs(args,collector):
    for pj in collector:
        project_dir = os.path.join(args.process_dir,'user_data',args.NODE_DATABASE,args.owner,'project:'+pj)
        analysis_dir = os.path.join(project_dir,'analysis')  
        if not os.path.exists(project_dir):
            os.makedirs(project_dir)
        if not os.path.exists(analysis_dir):
            os.makedirs(analysis_dir)
        for ds in collector[pj]:
            dataset_dir = os.path.join(analysis_dir,ds) 
            if not os.path.exists(dataset_dir):
                os.makedirs(dataset_dir)
    
    
def write_seqfiles(args,collector):
    stats = {}
    for pj in collector:
        project_dir = os.path.join(args.process_dir,'user_data',args.NODE_DATABASE,args.owner,'project:'+pj)
        
        #datasets[pj] = {}
        #files = {}
        stats[pj] = {}
        analysis_dir = os.path.join(project_dir,'analysis')
        #gast_dir = os.path.join(basedir,'analysis/gast')
        main_file = os.path.join(project_dir,'seqfile.fa')
        
        seq_count = 0
        dataset_counts = {}
        for ds in collector[pj]:
            dataset_counts[ds] = 0
            ds_dir = os.path.join(analysis_dir,ds)
            
            ds_file = os.path.join(ds_dir,'seqfile.fa')
            tax_file = os.path.join(ds_dir,'sequences_n_taxonomy.txt')
            ds_fp  = open(ds_file,'w')
            tax_fp = open(tax_file,'w')    
            id2 = 1
            for i,obj in enumerate(collector[pj][ds]):            
                id1 = str(i+1)
                cnt = collector[pj][ds][i]['count']
                
                tax_fp.write(collector[pj][ds][i]['seq']+"\t"+collector[pj][ds][i]['tax']+"\t"+collector[pj][ds][i]['rank']+"\t"+str(collector[pj][ds][i]['count'])+"\t"+collector[pj][ds][i]['distance']+"\t"+collector[pj][ds][i]['refhvrids']+"\n")
                for m in range(cnt):
                    ds_fp.write('>'+str(id2)+"\n"+collector[pj][ds][i]['seq']+"\n") 
                    id2 += 1
                seq_count += cnt
                dataset_counts[ds] += cnt
            ds_fp.close()
            tax_fp.close()
            
            
        num_datasets = len(collector[pj])
        
        #print datasets

        # for ds in files:
        #     files[ds].close()
        stats[pj]['seq_count'] = seq_count
        stats[pj]['num_datasets'] = num_datasets
        stats[pj]['datasets'] = dataset_counts
    return stats
    #for ds in datasets:
        #os.mkdir()

def parse_file(args):
    std_headers = ['refhvr_ids', 'Distance', 'Sequence', 'Rank', 'Taxonomy']
    # Typical header: refhvr_ids\tAB_SAND_Bv6--HS122\tAB_SAND_Bv6--HS123\tDistance\tSequence\tRank\tTaxonomy
    header_items = []
    collector = {}
    if args.project:
        collector[args.project] = {}
    if args.orig_names:            
        print 'using orig names'
    else:
        print 'Have project: not using orig names'
    with open(args.tax_by_seq_file, mode='r') as infile:
        
        for i,l in enumerate(infile):
            line_items = l.strip().split('\t')
            print '0',line_items[0]
            if i == 0 and line_items[0] != 'TaxBySeq':
                print 'This doesnt look like a TaxBySeq File from VAMPS -- Exiting'
                sys.exit()
            if line_items[0] == 'TaxBySeq':
                continue
            if line_items[0] == 'refhvr_ids':
                header_items = line_items
                #print header_items
                pjds_ary = []
                projects = {}
                for header in header_items:
                    if header not in std_headers:

                        if args.orig_names:
                            pjds = header
                            (pj,ds) = header.split('--')
                            if pj in collector:
                                collector[pj][ds] = []
                            else:
                                collector[pj] = {}
                                collector[pj][ds] = []
                        else:
                            
                            ds = header.replace('--','__')
                            pjds = args.project+'--'+header.replace('--','__')
                            collector[args.project][ds] = []
                        pjds_ary.append(pjds)
                        
                continue
            
            #tax_collector[ds][tax]
            if not header_items:
                sys.exit('no headers This doesn"t look like a TaxBySeq File' )
            
            #print len(line_items),len(std_headers),len(pjds_ary)
            if len(line_items) != (len(std_headers)+len(pjds_ary)):
                continue
            
            refhvrids = line_items[0]
            distance  = line_items[len(pjds_ary)+1]
            seq       = line_items[len(pjds_ary)+2]
            rank      = line_items[len(pjds_ary)+3]
            tax       = line_items[len(pjds_ary)+4]
            
            
            for i,pjds in enumerate(pjds_ary):
                (pj,ds) = pjds.split('--')
                count = int(line_items[1+i])
                #print count
                if count  > 0:              
                    collector[pj][ds].append({'tax':tax,'count':count,'seq':seq,'distance':distance,'refhvrids':refhvrids,'rank':rank})



    #print collector 
    #print
    for pj in collector:
        for ds in collector[pj]:
            print pj,ds,len(collector[pj][ds])
    return collector                

            
def write_config(args,stats):
    for pj in stats:
        project_dir = os.path.join(args.process_dir,'user_data',args.NODE_DATABASE,args.owner,'project:'+pj)
        ini_file = os.path.join(project_dir,'config.ini') 
        print 'Writing config.ini file:',ini_file  
        f = open(ini_file, 'w')
        f.write('[GENERAL]'+"\n")
        
        f.write('project='+pj+"\n")
        
        f.write("project_title=\n")
        f.write("project_description=\n")
        f.write('baseoutputdir='+project_dir+"\n")
        f.write('configPath='+ini_file+"\n")
        f.write('fasta_file='+os.path.join(project_dir,'seqfile.fa')+"\n")
        f.write('platform=new_vamps'+"\n")
        f.write('owner='+args.owner+"\n")
        f.write('config_file_type=ini'+"\n")
        f.write('public=False'+"\n")
        f.write('fasta_type='+args.upload_type+"\n")
        f.write('dna_region='+args.dna_region+"\n")
        f.write('project_sequence_count='+str(stats[pj]['seq_count'])+"\n")
        f.write('domain='+args.domain+"\n")
        f.write('number_of_datasets='+str(stats[pj]['num_datasets'])+"\n")
        f.write('sequence_counts=RAW'+"\n")
        f.write('env_source_id='+str(args.envid)+"\n")
        f.write('has_tax=0'+"\n")
        f.write("\n")
        f.write('[DATASETS]'+"\n")
        print stats[pj]
        for ds in stats[pj]['datasets']:
            f.write(ds+'='+str(stats[pj]['datasets'][ds])+"\n")
        
    
    f.close()
    
def unique_seqs(args,stats):
    fastaunique_cmd = os.path.join(args.process_dir,'public','scripts','fastaunique')
    print args
    for pj in stats:
        project_dir = os.path.join(args.process_dir,'user_data',args.NODE_DATABASE,args.owner,'project:'+pj)
        for ds in stats[pj]["datasets"]:
            print ds
            ds_dir = os.path.join(project_dir, 'analysis',ds)
            fasta_file  = os.path.join(ds_dir, 'seqfile.fa')
            unique_file = os.path.join(ds_dir, 'unique.fa')
            names_file  = os.path.join(ds_dir, 'names')
            fastaunique_call = fastaunique_cmd + " -o "+unique_file+" -n "+names_file +" "+fasta_file
            ds_unique_seq_count = subprocess.check_output(fastaunique_call, shell=True)

def check_project_names(args,collector):
    """
    This alters any project name from collector that is the same as already in the database.
    
    """
    tmp = {}
    for pj in collector:
        q = "SELECT project from project where project='%s'" % (pj)
        print 'Checking pj name:',q
        cur.execute(q)
        if cur.rowcount > 0:
            new_proj_name = pj+'_'+str(random.randint(1000,9999))
            tmp[pj] = new_proj_name

            #return ('ERROR','Duplicate project name1; Query:'+q)
    for pj in tmp:
        collector[tmp[pj]] = collector[pj]
        print 'removing duplicate project:',pj
        del collector[pj]
    for pj in collector:
        print pj
    return collector
        
def run_metadata(args):
    print 'csv',args.metadata_file
    logging.info('csv '+ args.metadata_file)
    lol = list(csv.reader(open(args.metadata_file, 'rb'), delimiter='\t'))
    
    project_dir = os.path.join(args.process_dir,'user_data',args.NODE_DATABASE,args.owner,'project:'+pj)
    mdfile_clean = os.path.join(project_dir,'metadata_clean.csv')
    f = open(mdfile_clean, 'w')
    found_dsets_dict={}
    TMP_METADATA_ITEMS = {}
     
    for line in lol:
        pj = line[0]
        ds = line[1]
        scn = line[2]
        val = line[3]
        uts = line[4]
        if pj in TMP_METADATA_ITEMS:
            if ds in TMP_METADATA_ITEMS[pj]:
                if scn in TMP_METADATA_ITEMS[pj][ds]:
                    print 'ERROR: Two scn for same ds',pj,ds,scn,val
                else:
                    TMP_METADATA_ITEMS[pj][ds][scn]=val
            else:
                TMP_METADATA_ITEMS[pj][ds]={}
                TMP_METADATA_ITEMS[pj][ds][scn]=val
        else:
            TMP_METADATA_ITEMS[pj]={}
            TMP_METADATA_ITEMS[pj][ds]={}
            TMP_METADATA_ITEMS[pj][ds][scn]=val
    
    print TMP_METADATA_ITEMS
    f.close()

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
    # parser.add_argument("-dir","--basedir",                   
    # 			required=True,  action="store",   dest = "basedir", 
    # 			help="""Directory to output ini and dir structure""")  
    
   
                                                   
    parser.add_argument("-t", "--upload_type",
    			required=False,  action='store', dest = "upload_type",  default='',
                choices=['tax_by_seq','single'], help="multi or single dataset")
    # parser.add_argument("-co", "--config_only", 
    # 			required=False,  action='store_true', dest = "config_only",  default=False, 
    # 			help="")
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
    			required=False,  action='store', dest = "project",  default='', 
    			help="")
    parser.add_argument("-pdir", "--process_dir",    
                required=False,  action="store",   dest = "process_dir", default='./',
                help = '')
    parser.add_argument('-db', '--NODE_DATABASE',         
                required=True,   action="store",  dest = "NODE_DATABASE",            
                help = 'node database') 
    parser.add_argument('-orig_names', '--orig_names',         
                required=False,   action="store_true",  dest = "orig_names",            
                help = 'if true -- ') 
    parser.add_argument('-file', '--file',         
                required=True,   action="store",  dest = "tax_by_seq_file",            
                help = '')
    parser.add_argument('-md_file', '--md_file',         
                required=False,   action="store",  dest = "metadata_file", default='',           
                help = '')
    parser.add_argument('-use_tax', '--use_tax',         
                required=False,   action="store_true",  dest = "use_tax",         
                help = '')
    args = parser.parse_args() 
    args.ref_db_dir = 'none'   
    args.classifier = 'unknown' 
    args.input_type = 'tax_by_seq' 
    args.datetime     = str(datetime.date.today())    
    
  #   mysql_conn = MySQLdb.connect(host="localhost", # your host, usually localhost
  #                         db = args.NODE_DATABASE,
  #                         read_default_file="~/.my.cnf"  )
  #   cur = mysql_conn.cursor()
    
    
  #   collector = parse_file(args) 
    
    
    
  #   collector = check_project_names(args,collector)
  #   print collector
  #   #push_to_database(collector)
  #   #sys.exit()
  #   create_dirs(args,collector)   
    
  #   #sys.exit()
  #   stats = write_seqfiles(args,collector)
  #   print "STATS:\n",stats
  #   unique_seqs(args,stats)
  # #  write_metafile(args,stats)
  #   write_config(args,stats)
  #   if args.use_tax:
  #       pids = []
  #       for pj in stats:
  #           print
  #           print "STARTING DB Load - Project: "+pj
  #           args.basedir = os.path.join(args.process_dir,'user_data',args.NODE_DATABASE, args.owner,'project:'+pj)

  #           logging.info('running vamps_script_database_loader.py')
  #           args.pid = int(load_data.start(args))
            
  #           logging.info('GOT NEW PID: '+str(args.pid))
  #           print 'GOT NEW PID: '+str(args.pid)
  #           stats[pj]["pid"]=args.pid
  #           pids.append(str(args.pid))

  #       for pj in stats:
  #           print
  #           print "STARTING taxcounts files - Project: "+pj
  #           args.pid =  stats[pj]["pid"]   
  #           logging.info('running vamps_script_create_json_dataset_files.py')   
  #           dataset_files_creator.go_add(args)
  #           logging.info("finishing taxcounts")
            
            
  #           # 5-5-5-5-5-5

  #           logging.info("DONE")
  #           print "DONE WITH ",pj
    
    

  #       #
  #       # this must be the last print:
        
  #       #
  #       #
  #       print "PIDS="+'-'.join(pids) 
  #       logging.info("ALL DONE: (PID="+str(args.pid)+')')
        
    if args.metadata_file:
        run_metadata(args)