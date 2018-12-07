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
import logging
import csv, json
import configparser as ConfigParser
import fastalibAV as fastalib
import datetime
today = str(datetime.date.today())
import subprocess
import pymysql as MySQLdb

"""

"""
# class FastaReader:
#     def __init__(self,file_name=None):
#         self.file_name = file_name
#         self.h = open(self.file_name, 'rb')
#         #self.h = open(self.file_name)
#         self.seq = ''
#         self.id = None
# 
#     def next(self): 
#         def read_id():
#             #return self.h.readline().decode('utf-8').strip()[1:]
#             #print(self.h.readline())
#             return self.h.readline().strip()[1:]
# 
#         def read_seq():
#             #ret = bytearray(b'')
#             ret = ''
#             #ret = ''
#             while True:
#                 line = self.h.readline()
#                 print(str(line))
#                 while len(line) and not len(line.strip()):
#                     # found empty line(s)
#                     
#                     line = self.h.readline()
#                     print(str(line))
#                 if not len(line):
#                     # EOF
#                     break
#                 
#                 if str(line).startswith('>'):
#                     # found new defline: move back to the start
#                     self.h.seek(-len(line), os.SEEK_CUR)
#                     break
#                     
#                 else:
#                     ret += str(line).strip()
#                     
#             return ret
#         
#         self.id = read_id()
#         self.seq = read_seq()
#         
#         if self.id:
#             return True
#     

    
def get_data(args):
    pass
            
            
def parse_matrix(args):
    print('running matrix')
    n = 0
    datasets={}
    project_count = 0
    max_ds_count = 0
    with open(args.file, mode='r') as infile:
        for line in infile:            
            items = line.strip('\n').split('\t')
            #print('items',items)
            if not line or items[0][:5] == 'VAMPS':
                print('found vamps')
                continue
            if n==0:
                ds_items = items[1:]   #line.strip('\n').split('\t')[1:] # stip original line on '\n' only to retain first '\t' ip present
                #print('ds_items',ds_items)
                for ds in ds_items:
                    datasets[ds] = 0                
            else:                
                line_items = items   #line.strip().split('\t')
                #print('line_items',line_items)
                counts = line_items[1:]
                for i,cnt in enumerate(counts):
                    print(i,cnt)
                    if cnt == '' or not cnt:
                        cnt = 0
                    project_count += int(cnt)
                    datasets[ds_items[i]] += int(cnt)                    
                tax = line_items[0]
            n+=1
    for ds in datasets:
        if datasets[ds] > max_ds_count:
            max_ds_count = datasets[ds]
    return(datasets, project_count, max_ds_count)

def find_dataset_name(id):  
    """
    This should be the same fxn as in demultiplex
    """
    # adjust to your specific defline
    sampleName_items = id.split()[0].split('_')
    test = sampleName_items[-1]
    try:
        int(test)
        sampleName = '_'.join(sampleName_items[:-1])
        #print('INT',sampleName_items[-1])
    except:
        sampleName = '_'.join(sampleName_items)
        #print('NO INT',sampleName_items[-1])
    
    return sampleName   
     
def parse_fasta(args):
    print('running fasta')
    f = fastalib.SequenceSource(args.file)
    #f = FastaReader(args.file)
    datasets={}
    project_count = 0
    max_ds_count = 0
    while f.next():
        #print(f.seq)
        #print(f.id)
        project_count += 1
        defline_pts = f.id.split()
        dataset = find_dataset_name(f.id)
        seq_id = defline_pts[1]
        if dataset in datasets:
            datasets[dataset] += 1
        else:
            datasets[dataset] = 1
    # max_ds_count; number_of_ds; total_seqs;
    for ds in datasets:
        if datasets[ds] > max_ds_count:
            max_ds_count = datasets[ds]
        
    #print(datasets)
    return(datasets, project_count, max_ds_count)
        
    
def write_config(args, datasets, project_count, max_ds_count):
    ini_file = os.path.join(args.project_dir,'INFO.config') 
    
    print( 'Writing INFO.config file:',ini_file  )
    f = open(ini_file, 'w')
    f.write('[MAIN]'+"\n")
    f.write('project_name='+args.project+"\n")
    f.write("total_seq_count="+str(project_count)+"\n")
    f.write('owner='+args.owner+"\n")
    f.write("max_dataset_count="+str(max_ds_count)+"\n")
    f.write('public=0'+"\n")
    f.write('project_dir='+args.project_dir+"\n")
    f.write('type='+args.type+"\n")
    f.write('number_of_datasets='+str(len(datasets))+"\n")
    f.write("\n")
    f.write('[MAIN.dataset]'+"\n")
    
    for ds in datasets:
        f.write(ds+'='+str(datasets[ds])+"\n")
        
    f.close()  
    


if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: 5-vamps-clean-db.py  [options]
         
         where
            
           -pid/--project_id        clean this pid only
           -p/--project_name        clean this name only
           -site/--site             vamps, vampsdev or localhost
           -all/--all               Remove ALL Data for fresh install
                                    Be Careful -- will remove ALL data from db
            

    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
    parser.add_argument("-f","--file",                   
                required=True,  action="store",   dest = "file",
                help="""ProjectID""")  
    
    parser.add_argument("-p", "--project",          
                required=True,  action='store', dest = "project", 
                help=" ") 
    parser.add_argument("-d", "--project_dir",          
                required=True,  action='store', dest = "project_dir", 
                help=" ")
    # parser.add_argument("-host", "--host",          
#                 required=True,  action='store', dest = "host", default='localhost',
#                 help=" ") 
    parser.add_argument("-t", "--type",          
                required=True,  action='store', dest = "type", 
                help=" ")           
    
    parser.add_argument("-u", "--user",          
                required=True,  action='store', dest = "owner", 
                help=" ")   
#     parser.add_argument("-proj", "--project",          
#                 required=False,  action='store', dest = "project", default='',
#                 help=" ")  
#     parser.add_argument("-o", "--jsonfile_dir",                   
#                required=True,  action="store",   dest = "jsonfile_dir",
#                help="""JSON Files Directory""")
#     parser.add_argument("-data_dir", "--data_dir",          
#                 required=True,  action='store', dest = "data_dir", default='user_data',
#                 help=" config.USER_FILES_BASE ")
                      
    args = parser.parse_args()    
    
    
   #  if args.host == 'vamps':
#         #db_host = 'vampsdb'
#         db_host = 'bpcweb8'
#         args.NODE_DATABASE = 'vamps2'
#         db_home = '/groups/vampsweb/vamps/'
#     elif args.host == 'vampsdev':
#         #db_host = 'vampsdev'
#         db_host = 'bpcweb7'
#         args.NODE_DATABASE = 'vamps2'
#         db_home = '/groups/vampsweb/vampsdev/'
#     else:
#         db_host = 'localhost'
#         db_home = '~/'
#         args.NODE_DATABASE = 'vamps_development'
#     
#     args.obj = MySQLdb.connect( host=db_host, db=args.NODE_DATABASE, read_default_file=os.path.expanduser("~/.my.cnf_node")    )
# 
#     #db = MySQLdb.connect(host="localhost", # your host, usually localhost
#     #                         read_default_file="~/.my.cnf"  ) 
#     args.cur = args.obj.cursor()

    
    
    #(args.proj, args.pid, args.dids, args.dsets) = get_data(args)  
    
    if args.type == 'fasta':
        (datasets, project_count, max_ds_count) = parse_fasta(args)
    elif args.type == 'matrix':
        (datasets, project_count, max_ds_count) = parse_matrix(args)
    
    write_config(args, datasets, project_count, max_ds_count)    
    print('Finished')
