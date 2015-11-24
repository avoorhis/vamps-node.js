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
import math
import shutil
import gzip
import types
import time
import random
import csv
from time import sleep
import ConfigParser
import MySQLdb
#sys.path.append( '/bioware/python/lib/python2.7/site-packages/' )
script_path = './'
from IlluminaUtils.lib import fastalib
import datetime
today     = str(datetime.date.today())
import subprocess

dataset_name_fields = ['#SampleID','sample_name','dataset']
"""

"""
env_codes = {'air':'10',
'extreme habitat':'20',
'host-associated':'30',
'ENVO:human-associated habitat':'40',
'human-amniotic-fluid':'45',
'human-blood':'47',
'human-gut':'43',
'human-oral':'42',
'human-skin':'41',
'human-urine':'46',
'human-vaginal':'44',
'indoor':'140',
'microbial mat/biofilm':'50',
'miscellaneous_natural_or_artificial_environment':'60',
'plant associated':'70',
'sediment':'80',
'soil/sand':'90',
'unknown':'100',
'wastewater/sludge':'110',
'water-freshwater':'120',
'water-marine':'130'}         
    
    
def create_dirs(args, projects):
    # args.outdir ends with owner name: create if it doesn't exists
    if not os.path.exists(args.outdir_base):
            os.makedirs(args.outdir_base)
    for pj in projects:
        proj_dir = os.path.join(args.outdir_base,'project-'+pj)
        if os.path.exists(proj_dir):
            print "Path Exists: "+proj_dir
            sys.exit()
        else:
            os.makedirs(proj_dir)

        analysis_dir = os.path.join(proj_dir,'analysis')
        gast_dir = os.path.join(analysis_dir,'gast')
        if not os.path.exists(analysis_dir):
            os.makedirs(analysis_dir)
        if not os.path.exists(gast_dir):
            os.makedirs(gast_dir)
        
def write_seqfiles(args, projects):
    in_seqs_file = args.fastafile
    files = {}
    seqs = {}
    if not os.path.exists(args.outdir_base):
        print "Cold not find seqs file",in_seqs_file
        sys.exit()
    f = fastalib.SequenceSource(in_seqs_file)
    while f.next():
        # Man.1675.kitc.1011001_153282 HWI-ST753:174:D21V7ACXX:1:1101:18721:29707 1:N:0: orig_bc=GGAAAGTCGAAG new_bc=GGAAAGTCGAAG bc_diffs=0\n
        defline = f.id.strip()
        
        #id = defline.replace(' ','|')
        # mobe  defline='>10056.000010538_2 HWI-M00888:59:000000000-A62ET:1:1101:15096:1532 1:N:0:GACCGTAAACTC orig_bc=GACCGTAAACTC new_bc=GACCGTAAACTC bc_diffs=0'
        
        #if there are orig_bc and new_bc in defline then assume mobe/qiime file
        #and break up like this:
        #print 'found mobe defline'
        tmp = defline.replace(' ','|').split('|')
        ds = tmp[0].split('_')[0]
        id = tmp[1]
        #id = tmp[0].split('_')[1]  
        #print ds, id
        for pj in projects:
            if pj not in seqs:
                seqs[pj] = {}
            if ds in projects[pj]:                
                if ds not in seqs[pj]:
                    seqs[pj][ds] = []
                seqs[pj][ds].append({"id":id,"seq":f.seq})
                
    for pj in seqs:
        stats = {}
        stats[pj] = {}
        proj_dir = os.path.join(args.outdir_base,'project-'+pj)
        gast_dir  = os.path.join(proj_dir,'analysis','gast')
        pj_seq_count = 0
        for ds in seqs[pj]:                
            stats[pj][ds]={}
            ds_dir = os.path.join(gast_dir,ds)
            if not os.path.exists(ds_dir):
                os.makedirs(ds_dir)
            seqsfile = os.path.join(ds_dir,'seqfile.fa')
            print 'writing to',seqsfile
            fp = open(seqsfile,'w')
            ds_seq_count = 0
            for item in seqs[pj][ds]:
                id = item["id"]
                seq = item["seq"]
                print pj, ds, id
                fp.write('>'+id+"\n"+seq+"\n")
                ds_seq_count += 1
                pj_seq_count += 1
            fp.close()
            stats[pj][ds]['ds_seq_count'] = ds_seq_count
        stats[pj]['pj_seq_count'] = pj_seq_count
        stats[pj]['ds_count'] =  len(projects[pj])
        stats[pj]['datasets'] =  projects[pj]
       
        
    
    return stats
    
        
def write_metafile(args,projects,stats):
    print "STARTing Metadata"
    #mdfile = os.path.join(args.outdir,'meta_original.csv') 
    req_metadata = ['altitude','assigned_from_geo','collection_date','common_name','country','depth','description','elevation','env_biome','env_feature','env_matter','latitude','longitude','public','taxon_id']
    #req_for_multi = ['#SampleID','sample_name','dataset']
    in_md_file = args.metafile
    metadata = {}
    with open(in_md_file, mode='r') as infile:
        reader = csv.reader(infile, delimiter='\t')  # TAB Only delimiter
        for i,items in enumerate(reader):
            if i==0:
                headers = items
                continue
            header_count = len(headers)
            if dataset_name_fields[0] in headers:
                dataset_index = headers.index(dataset_name_fields[0])
            else:
                print "Didn't find '#SampleID' in metafile"
                sys.exit()
            ds = items[dataset_index]
            for pj in projects:
                if pj not in metadata:
                    metadata[pj]={}
                if ds in projects[pj]:
                    metadata[pj][ds] = items  
                    #print items
            # find env_source, dna_region and domain
            idx = 0
            if 'ENV_FEATURE' in headers:  # or ENV_BIOME
                idx = headers.index('ENV_FEATURE')
            elif 'env_feature' in headers:
                idx = headers.index('env_feature')
            val = items[idx] # ENVO:human-associated habitat
            env_keys = env_codes.keys()
            print 'val',val
            elist = [x for x in env_keys if val in x]
            
            if len(elist) > 0:
                args.envid = env_codes[elist[0]]
            # TARGET_SUBFRAGMENT
            idx = 0
            if 'TARGET_SUBFRAGMENT' in headers:  # or ENV_BIOME
                idx = headers.index('TARGET_SUBFRAGMENT')
            elif 'target_subfragment' in headers:
                idx = headers.index('target_subfragment')
            if idx:
                args.dna_region = items[idx]  # V34

    
    #print headers
    #print metadata
    
    for pj in projects:
        mdfile = os.path.join(args.outdir_base,'project-'+pj,'metadata_clean.csv')
        with open(mdfile, mode='w') as outfile:
            outfile.write('\t'.join(headers)+"\n")
            for ds in projects[pj]:
                line = metadata[pj][ds]
                outfile.write('\t'.join(line)+"\n")

    outfile.close()
    infile.close()
            
def write_config(args,projects,stats):
    for pj in projects:

        ini_file = os.path.join(args.outdir_base,'project-'+pj,'config.ini')
        print 'Writing config.ini file:',ini_file  
        f = open(ini_file, 'w')
        f.write('[GENERAL]'+"\n")
        f.write('project='+pj+"\n")
        f.write("project_title=\n")
        f.write("project_description=\n")
        f.write('baseoutputdir='+args.outdir_base+"\n")
        f.write('configPath='+ini_file+"\n")
        f.write("fasta_file=\n")
        f.write('platform=new_vamps'+"\n")
        f.write('owner='+args.owner+"\n")
        f.write('config_file_type=ini'+"\n")
        if args.private:
            f.write('public=False'+"\n")
        else:
            f.write('public=True'+"\n")
        f.write("fasta_type=multi\n")
        f.write('dna_region='+args.dna_region+"\n")
        f.write('project_sequence_count='+str(stats[pj]['pj_seq_count'])+"\n")
        f.write('domain='+args.domain+"\n")
        f.write('number_of_datasets='+str(stats[pj]['ds_count'])+"\n")
        f.write('sequence_counts=trimmed'+"\n")
        f.write('env_source_id='+str(args.envid)+"\n")
        f.write('has_tax=0'+"\n")
        f.write("\n")
        f.write('[DATASETS]'+"\n")
        print stats
        for ds in projects[pj]:
            f.write(ds+'='+str(stats[pj][ds]['ds_seq_count'])+"\n")
            
        f.close()
    
def unique_seqs(args,projects,stats):
    fastaunique_cmd = 'fastaunique'
    print args
    if not os.path.exists(fastaunique_cmd):
        fastaunique_cmd = '/groups/vampsweb/vampsdev/seqinfobin/fastaunique'
    for pj in projects:
        for dataset in stats[pj]["datasets"]:
            print dataset
            proj_dir = os.path.join(args.outdir_base,'project-'+pj)
            ds_dir = os.path.join(proj_dir, 'analysis','gast', dataset)
            fasta_file  = os.path.join(ds_dir, 'seqfile.fa')
            unique_file = os.path.join(ds_dir, 'unique.fa')
            names_file  = os.path.join(ds_dir, 'names')
            fastaunique_call = fastaunique_cmd + " -o "+unique_file+" -n "+names_file +" "+fasta_file
            ds_unique_seq_count = subprocess.check_output(fastaunique_call, shell=True)

def split_data_into_projects(args,dscount):
    num_projects = raw_input("\nGot it -- how many projects do you want to create? ") 
    print num_projects
    try:
        x = int(num_projects)+1
    except ValueError:
        print 'Not an int'
        sys.exit()
    print "Okay making "+num_projects+" projects"
    projects = {}
    alpha = ['A','B','C','D','E','F','G','H','I','J','K','L']
    project_order = []
    keys = sorted(datasets.keys())
    fl = int(math.floor(dscount/int(num_projects)))
    start = 0
    end = fl
    for i in range(int(num_projects)):
        proj = args.project+alpha[i]
        #projects[proj] =[]
        #print proj
        project_order.append(proj)
        dsets = keys[start:end]
        projects[proj] = dsets
        start = end
        end = end + fl

    
    print 'floor '+str(fl)
    remainder_count = int(dscount) - (int(num_projects)*fl)
    print 'remainder '+str(remainder_count)
    # add the remainder to the last project
    lastp = project_order[-1]
    lastd = keys[-remainder_count:]
    projects[lastp] = projects[lastp] + lastd
    for pj in project_order:
        print pj, len(projects[pj]),'datasets'
        print projects[pj]
        print
    ans4 = raw_input('Are you satisfied with these '+num_projects+' projects? (Y/n) ')
    if ans4 == 'y' or ans4 == 'Y':
        print "yes continuing"
        return ('Y',projects)
    else:
        print "No"
        return ('N',{})

def get_datasets(args):
    log_file = args.metafile
    
    fh = open(log_file,'r')
    datasets = {}
    counter = 0
    for line in fh:
        #print line
        line = line.strip()
        if not line:
            continue
        items = line.split()        
        if items[0] in dataset_name_fields: 
            continue        
        
        print items[0]
        datasets[items[0]]= 1
        counter += 1
    print len(datasets)
    return [counter,datasets]

def go(args,projects):
    create_dirs(args,projects)    
    stats = write_seqfiles(args,projects)
    print stats
    unique_seqs(args,projects,stats)
    write_metafile(args,projects,stats)
    write_config(args,projects,stats)


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
    
    parser.add_argument("-fasta","--fastafile",                   
                required=True,  action="store",   dest = "fastafile", 
                help="""MBE Directory to output ini and dir structure""")    
    parser.add_argument("-meta","--metafile",                   
                required=True,  action="store",   dest = "metafile", 
                help="""MBE Directory to output ini and dir structure""")
     
    
    parser.add_argument("-reg", "--dna_region",    
     			required=False,  action='store', dest = "dna_region",  default='v6',
     			help="")
    parser.add_argument("-dom", "--domain",        
     			required=False,  action='store', dest = "domain",  default='unknown', 
     			help="")
    parser.add_argument("-env", "--env_source_id", 
     			required=False,  action='store', dest = "envid",  default='100', 
     			help="")
    parser.add_argument("-private", "--private",      
     			required=False,  action='store_true', dest = "private",  default=False, 
     			help="")
    parser.add_argument("-owner", "--owner",        
     			required=False,  action='store', dest = "owner",  default='admin', 
     			help="")
    parser.add_argument("-project", "--project",        
     			required=True,  action='store', dest = "project",  default=False, 
     			help="")
    args = parser.parse_args()    
   
    args.datetime     = str(datetime.date.today())    
    
    #check fasta
    #check meta
    
    (dscount,datasets) = get_datasets(args)


    db = MySQLdb.connect(host="localhost", # your host, usually localhost
                             read_default_file="~/.my.cnf"  )
    cur = db.cursor()
    cur.execute("SHOW databases like 'vamps%'")
    dbs = []
    db_str = ''
    for i, row in enumerate(cur.fetchall()):
        dbs.append(row[0])
        db_str += str(i)+'-'+row[0]+';  '
    print(db_str)
    db_no = input("\nchoose database number: ")
    if int(db_no) < len(dbs):
        NODE_DATABASE = dbs[db_no]
        print 'Fine - using '+NODE_DATABASE
    else:
        sys.exit("unrecognized number -- Exiting")

    args.outdir_base = os.path.join('../../user_data',NODE_DATABASE,args.owner)
    
    ans1 = raw_input("\nI found "+str(dscount)+" datasets -- do you want to split up this project? (y/N) ")
    
    
    if ans1 == 'y' or ans1 == 'Y':
        print 'you ansewed Y'
        split_project = True
        while split_project == True:
            (ans2,projects) = split_data_into_projects(args, dscount) 
            if ans2 == 'y' or ans2 == 'Y':
                split_project = False
                print 'Done splitting'
                go(args,projects)
            else:
                split_project = True
                print 'returning to split again'

    else:
        print 'you ansewed N'
        ans3 = raw_input("\nContinue? Ctl-C to exit (y/N) ") 
        if ans3 == 'y' or ans2 == 'Y':
            projects = {}
            projects[args.project] = datasets
            print 'No splitting'            
            go(args,projects)
        else:
            print "Done -- not doin nothin!"
        
    print 'Done'
    #sys.exit("unrecognized number -- Exiting")    
    sys.exit()

    if args.upload_type == 'single' and not args.dataset:
        sys.exit('Requires dataset for single mode')
    
    
   
    
    
    create_dirs(args)    
    stats = write_seqfiles(args)
    print stats
    unique_seqs(args,stats)
    write_metafile(args,stats)
    write_config(args,stats)
        
