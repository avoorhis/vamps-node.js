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
#script_path = os.path.dirname(os.path.realpath(__file__))
from IlluminaUtils.lib import fastalib
import datetime
today     = str(datetime.date.today())
import subprocess


"""

"""
class FastaReader:
    def __init__(self,file_name=None):
        self.file_name = file_name
        self.h = open(self.file_name)
        self.seq = ''
        self.id = None
        self.revcomp_seq = None
        self.base_counts = None

    def next(self):
        def read_id():
            return self.h.readline().strip()[1:]

        def read_seq():
            ret = ''
            while True:
                line = self.h.readline()

                while len(line) and not len(line.strip()):
                    # found empty line(s)
                    line = self.h.readline()

                if not len(line):
                    # EOF
                    break

                if line.startswith('>'):
                    # found new defline: move back to the start
                    self.h.seek(-len(line), os.SEEK_CUR)
                    break

                else:
                    ret += line.strip()

            return ret

        self.id = read_id()
        self.seq = read_seq()


        if self.id:
            return True
    #def close(self):
    #    self.close()



def create_dirs(args):
    outdir = args.project_dir
    analysis_dir = os.path.join(outdir,'analysis')
    gast_dir = os.path.join(analysis_dir,'gast')
    #gast_dir = os.path.join(outdir,'analysis/gast')
    if not os.path.exists(analysis_dir):
        os.makedirs(analysis_dir, mode=0755)
    if not os.path.exists(gast_dir):
        os.makedirs(gast_dir, mode=0755)
    #if os.path.exists(gast_dir):
    #    shutil.rmtree(gast_dir)
    #os.makedirs(gast_dir)

def move_files(args):
    outdir = args.project_dir
    analysis_dir = os.path.join(outdir,'analysis')
    gast_dir = os.path.join(analysis_dir,'gast')
    shutil.move(args.fafile, os.path.join(outdir,'infile.fna'))
    if args.mdfile:
        shutil.move(args.mdfile, os.path.join(outdir,'meta_original.csv'))
def update_permissions(args):
    os.system('chgrp -R '+ args.site_grp +' '+args.project_dir)

def write_seqfiles(args):
    outdir = args.project_dir

    datasets = {}
    files = {}
    stats = {}
    analysis_dir = os.path.join(outdir,'analysis')
    gast_dir = os.path.join(analysis_dir,'gast')
    #gast_dir = os.path.join(outdir,'analysis/gast')

    if args.upload_type == 'single':
        ds = args.dataset
        datasets[ds] = 0
        ds_dir = os.path.join(gast_dir,ds)
        if not os.path.exists(ds_dir):
            os.makedirs(ds_dir, mode=0777)
        file = os.path.join(ds_dir,'seqfile.fa')
        fp = open(file,'w')
        files[ds] = fp
    seq_count = 0
    ds_count = 0

    f = fastalib.SequenceSource(args.fafile)
    #f = FastaReader(fafile)
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
                    #print 'found mobe defline'
                    tmp = defline.replace(' ','|').split('|')
                    ds = tmp[0].split('_')[0]
                    #id = tmp[1]
                    id = tmp[0].split('_')[1]
                else:
                    tmp = defline.replace(' ','|').split('|')
                    #print defline
                    ds = tmp[0]
                    id = tmp[1]
                ds_dir = os.path.join(gast_dir,ds)

                file = os.path.join(ds_dir,'seqfile.fa')
                if ds in datasets:
                    datasets[ds] +=1
                else:
                    datasets[ds] = 1
                if ds in files:
                    files[ds].write('>'+id+"\n"+f.seq+"\n")
                else:
                    if not os.path.exists(ds_dir):
                        os.makedirs(ds_dir, mode=0777)
                    #os.makedirs(ds_dir)
                    fp = open(file,'w')
                    files[ds] = fp
                    fp.write('>'+id+"\n"+f.seq+"\n")
            except:
                print "Please check the multi-dataset format: ( defline='>" + defline+"' )"
                sys.exit(1)

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

    #f = open(args.mdfile_clean, 'wt')

    req_metadata = ['altitude','assigned_from_geo','collection_date','common_name','country','depth','description','elevation','env_biome','env_feature','env_material','latitude','longitude','public','taxon_id']
    req_first_col = ['#SampleID','sample_name','dataset_name']
    with open(args.mdfile, mode='r') as infile:
        reader = csv.reader(infile, delimiter='\t')  # TAB Only delimiter
        with open(args.mdfile_clean, mode='w') as outfile:
            writer = csv.writer(outfile, delimiter='\t')  # TAB Only delimiter

            md_datasets = []
            dataset_index = -1
            for i,items in enumerate(reader):
                if items == []:
                    continue
                if i==0:
                    if len(items) == 0:
                        print 'No empty lines allowed.'
                        sys.exit(1)
                    headers = items
                    header_count = len(headers)
                    #print headers
                    for n,req in enumerate(req_metadata):
                        if req not in headers:
                            print ','.join(req_metadata)
                            print 'Found Missing Required Metadata: '+req
                            sys.exit(1)
                    if headers[0] in req_first_col:
                        ds_in_headers = True
                        headers[0] = '#SampleID'
                        dataset_index = 0
                    else:
                        ds_in_headers = False
                        print "No dataset column found in first column (allowed column names: "+','.join(req_first_col);
                        sys.exit(1)
                else:
                    if args.upload_type == 'multi':
                        md_datasets.append(items[dataset_index])
                    else:
                        # alter ds name to match that from user input form (over write md spreadsheet)
                        items[0] = args.dataset

                if len(items) > 0:
                    #print items
                    if not args.quiet:
                        print items
                        print headers
                    if len(items) != header_count:
                        print '1-Missing Data: '+','.join(items)
                        sys.exit(1)
                    if not args.quiet:
                        print "writing clean metadata file "+args.mdfile_clean
                    writer.writerow(items)
            if args.upload_type == 'multi':
            # check for datasets column in metadata -- needed to assign metadata to datasets
            # each dataset in the fasta (stats.datasets) MUST be in the metadata file (md_datasets)
                #print md_datasets
                #print stats['datasets']
                for ds in stats['datasets']:
                    if ds not in md_datasets:
                        print 'Found a dataset that is not in the metadata file: '+ds
                        sys.exit(1)

    outfile.close()
    infile.close()

def write_config(args,stats):
    ini_file = os.path.join(args.project_dir,'config.ini')
    if not args.quiet:
        print 'Writing config.ini file:',ini_file
    f = open(ini_file, 'w')
    f.write('[GENERAL]'+"\n")
    f.write('project='+args.project+"\n")
    f.write("project_title=\n")
    f.write("project_description=\n")
    f.write('baseoutputdir='+args.project_dir+"\n")
    f.write('configPath='+ini_file+"\n")
    f.write('fasta_file='+args.fafile+"\n")
    f.write('platform=new_vamps'+"\n")
    f.write('owner='+args.owner+"\n")
    f.write('config_file_type=ini'+"\n")
    f.write('public=False'+"\n")
    f.write('fasta_type='+args.upload_type+"\n")
    f.write('dna_region='+args.dna_region+"\n")
    f.write('project_sequence_count='+str(stats['seq_count'])+"\n")
    f.write('domain='+args.domain+"\n")
    f.write('number_of_datasets='+str(stats['ds_count'])+"\n")
    f.write('sequence_counts=TRIMMED'+"\n")
    f.write('env_source_id='+str(args.envid)+"\n")
    f.write('has_tax=0'+"\n")
    f.write("\n")
    f.write('[DATASETS]'+"\n")
    if not args.quiet:
        print stats
    for ds in stats['datasets']:
        f.write(ds+'='+str(stats['datasets'][ds])+"\n")


    f.close()

def unique_seqs(args,stats):
    #fastaunique_cmd = script_path+'/fastaunique'
    fastaunique_cmd = 'fastaunique'
    if not args.quiet:
        print 'fastaunique:',fastaunique_cmd
    #fastaunique_cmd = 'fastaunique'
    #print args
    try:
        for dataset in stats["datasets"]:
            if not args.quiet:
                print dataset
            ds_dir = os.path.join(args.project_dir, 'analysis','gast', dataset)
            fasta_file  = os.path.join(ds_dir, 'seqfile.fa')
            unique_file = os.path.join(ds_dir, 'unique.fa')
            names_file  = os.path.join(ds_dir, 'names')
            fastaunique_call = fastaunique_cmd + " -o "+unique_file+" -n "+names_file +" "+fasta_file
            ds_unique_seq_count = subprocess.check_output(fastaunique_call, shell=True)
    except:
        print "Could not find fastaunique command"
        sys.exit(1)

def update_dir_permissions(args):
        os.system('chgrp -R '+ args.site_grp +' '+args.project_dir)
        os.system('chmod -R ug+rw '+args.project_dir)
def start(args):
    print(args)
    fasta_file = os.path.join(args.project_dir,'fasta.fa')
    logfile = os.path.join(args.project_dir,'uclust_log.fa')
    uc_file = os.path.join(args.project_dir,'uclust.otus.'+args.size+'.uc')
    # produce uc file from original fasta file
    # vsearch --cluster_fast fasta.fa --sizeout --iddef 3 --id 0.97 --consout fasta.cons.97.fa --uc fasta.otus.97.uc
    # then or each line in uc file:
    best_similarity = {}
    closest_otu = {}
    closest_otu_size = {}
    otu_collector = {}
    with open(uc_file) as f:
        for line in f:
            line = line.strip()
            line_data = line.split()
            if not line:
                continue
            if line_data[0] != 'H' and line_data[0] != 'N' and line_data[0] != 'C':
            #if line_data[0] != 'H' and line_data[0] != 'N':
                continue
            
            otu = line_data[9]   # could be *
            otu_collector[otu] = {}
            similarity = line_data[3]
            read_id = ''
            otu_size = 0
            if line_data[0] == 'N':     # Unclustered
                read_id = line_data[8]
                otu = 'Unclustered'
            elif line_data[0] == 'H':           # hit   
                read_id = line_data[8]
                otu = line_data[9]
                
            elif  line_data[0] == 'C':   # new cluster
                #print(line_data)
                otu_size = line_data[2]
                otu = line_data[8]
                if otu in otu_collector:
                    otu_collector[otu]['size'] = otu_size
                else:
                    otu_collector[otu] = {}
                    otu_collector[otu]['size'] = otu_size
                # otu is position 8 for new otus
                
                pass
            
 #            if otu in otu_collector:
#                 otu_collector[otu]['read_ids'].append(read_id)
#                 otu_collector[otu]['similarity'].append(similarity)
#             else:
#                 otu_collector[otu] = {}
#                 otu_collector[otu]['read_ids'] = []
#                 otu_collector[otu]['similarity'] = []
            
            if read_id in best_similarity:
            
#                 Argument "*" isn't numeric in numeric gt (>) at /xraid2-2/vampsweb/vamps/apps/uclust2mtx_vamps line 275, <IN> line 38303046.
#                 if similarity.isnumeric():  # check for numeric $similarity
                     if similarity > best_similarity[read_id]:
                         closest_otu[read_id] = otu;
                         closest_otu_size[read_id] = otu_size
                         best_similarity[read_id] = similarity
                     elif similarity == best_similarity[read_id]:
                         if otu_size > closest_otu_size[read_id]:
                             closest_otu[read_id] = otu;
                             closest_otu_size[read_id] = otu_size;
            else:
                 closest_otu[read_id] = otu
                 closest_otu_size[read_id] = otu_size
                 best_similarity[read_id] = similarity
            
    #print('closest_otu') 
    #print(closest_otu)
    print('closest_otu_size')
    print(closest_otu_size)
    #print('best_similarity')
    #print(best_similarity)       
            
            
if __name__ == '__main__':
    import argparse


    myusage = """usage: load_trimmed_data.py  [options]

         Start of VAMPS upload process:
         Creates config.ini file
         THIS REPLACES the gast directory!!!!
         Takes fasta file and directory as input
         where



            -project_dir/--project_dir         REQUIRED  path of dir structure




    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)


    parser.add_argument("-pdir","--project_dir",
                required=True,  action="store",   dest = "project_dir",
                help="""Directory to output ini and dir structure""")


    parser.add_argument("-u", "--user",
                required=True,  action='store', dest = "owner",
                help="Owner of Data - VAMPS username")
    parser.add_argument("-site", "--site",
                required=False,  action='store', choices=['vamps','vampsdev','local'], dest = "site",  default='local',
                help="")
    parser.add_argument("-size", "--size",
                required=False,  action='store', dest = "size",  default='0.97',  # 3%
                help="Percent Similarity")

    parser.add_argument("-q", "--quiet",
                required=False,  action='store_true', dest = "quiet",  default=False,
                help="")

    if len(sys.argv[1:])==0:
        print(myusage)
        sys.exit()
    args = parser.parse_args()
    args = parser.parse_args()

    args.datetime     = str(datetime.date.today())


    start(args)
