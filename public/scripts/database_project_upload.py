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
import ConfigParser
#sys.path.append( '/bioware/python/lib/python2.7/site-packages/' )
from IlluminaUtils.lib import fastalib
import datetime
today = str(datetime.date.today())
import subprocess
import MySQLdb

"""

"""
# Global:
#NODE_DATABASE = "vamps_js_dev_av"
#NODE_DATABASE = "vamps_js_development"
CONFIG_ITEMS = {}
SEQ_COLLECTOR = {}
DATASET_ID_BY_NAME = {}
SILVA_IDS_BY_TAX = {}
ranks =['domain','phylum','klass','order','family','genus','species','strain']
#db = MySQLdb.connect(host="localhost", # your host, usually localhost
#                      user="ruby", # your username
#                      passwd="ruby", # your password
#                      db=NODE_DATABASE) # name of the data base
#cur = db.cursor()

def start(args):
    get_config_data(args)
    check_user(args)  ## script dies if user not in db
    push_taxonomy(args)  #
    push_sequences(args)
    push_project(args)   # 
    push_dataset(args)
    push_pdr_seqs(args)
    
    print SEQ_COLLECTOR
    print CONFIG_ITEMS
    
def push_dataset(args):
    fields = ['dataset','dataset_description','env_sample_source_id','project_id']
    q = "INSERT into dataset ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s','%s')"
    for ds in CONFIG_ITEMS['datasets']:
        desc = ds+'_description'
        print ds,desc,CONFIG_ITEMS['env_source_id'],CONFIG_ITEMS['project_id']
        q4 = q % (ds,desc,CONFIG_ITEMS['env_source_id'],CONFIG_ITEMS['project_id'])
        print q4
        cur.execute(q4)
        did = cur.lastrowid
        DATASET_ID_BY_NAME[ds]=did
        print did
    db.commit()
    
def push_project(args):
    desc = "Project Description"
    title = "Title"
    proj = CONFIG_ITEMS['project']
    rev = CONFIG_ITEMS['project'][::-1]
    fund = "xx"
    id = CONFIG_ITEMS['owner_id']
    pub = 0 if CONFIG_ITEMS['public'] else 1
    fields = ['project','title','project_description','rev_project_name','funding','owner_user_id','public']
    q = "INSERT into project ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s','%s','%s','%s','%s')"
    q = q % (proj,title,desc,rev,fund,id,pub)
    
    print q
    cur.execute(q)
    CONFIG_ITEMS['project_id'] = cur.lastrowid
    db.commit()
    
def check_user(args):
    """
    check_user()
      the owner/user must be present in 'user' table for script to continue
    """
    q = "select * from user where username='"+CONFIG_ITEMS['owner']+"'"
    cur.execute(q)
    numrows = int(cur.rowcount)
    if numrows==0:
        sys.exit('Could not find owner: '+CONFIG_ITEMS['owner']+' --Exiting')
    row = cur.fetchone()
    CONFIG_ITEMS['owner_id'] = row[0]

def push_pdr_seqs(args):
    for ds in SEQ_COLLECTOR:
        for seq in SEQ_COLLECTOR[ds]:
            did = DATASET_ID_BY_NAME[ds]
            seqid = SEQ_COLLECTOR[ds][seq]['sequence_id']
            count = SEQ_COLLECTOR[ds][seq]['seq_count']
            q = "INSERT into sequence_pdr_info (dataset_id, sequence_id, seq_count,classifier_id)"
            q += " VALUES ('"+str(did)+"','"+str(seqid)+"','"+str(count)+"','2')"
            print q
            cur.execute(q)
    db.commit()
    
def push_sequences(args):
    # sequences
    for ds in SEQ_COLLECTOR:
        for seq in SEQ_COLLECTOR[ds]:
            q = "INSERT ignore into sequence (sequence_comp) VALUES (COMPRESS('"+seq+"'))"
            print q
            cur.execute(q)
            db.commit()
            seqid = cur.lastrowid
            if seqid == 0:
                q2 = "select sequence_id from sequence where sequence_comp = COMPRESS('"+seq+"')"
                print 'DUP SEQ FOUND'
                cur.execute(q2)
                db.commit() 
                row = cur.fetchone()
                seqid=row[0]
            SEQ_COLLECTOR[ds][seq]['sequence_id'] = seqid
            silva_tax_id = str(SEQ_COLLECTOR[ds][seq]['silva_tax_id'])
            distance = str(SEQ_COLLECTOR[ds][seq]['distance'])
            rank_id = str(SEQ_COLLECTOR[ds][seq]['rank_id'])
            q = "INSERT ignore into silva_taxonomy_info_per_seq"
            q += " (sequence_id,silva_taxonomy_id,gast_distance,refssu_id,rank_id)"
            q += " VALUES ('"+str(seqid)+"','"+silva_tax_id+"','"+distance+"','0','"+rank_id+"')"
            print q
            cur.execute(q)
            db.commit()
            silva_tax_seq_id = cur.lastrowid
            if seqid == 0:
                q3 = "select silva_taxonomy_info_per_seq_id from silva_taxonomy_info_per_seq"
                q3 += " where sequence_id = '"+seqid+"'"
                q3 += " and silva_taxonomy_id = '"+silva_tax_id+"'"
                q3 += " and gast_distance = '"+distance+"'"
                q3 += " and rank_id = '"+rank_id+"'"
                print 'DUP silva_tax_seq'
                cur.execute(q3)
                db.commit() 
                row = cur.fetchone()
                silva_tax_seq_id=row[0]
        
            q4 = "INSERT ignore into sequence_uniq_info (sequence_id, silva_taxonomy_info_per_seq_id)"
            q4 += " VALUES('"+str(seqid)+"','"+str(silva_tax_seq_id)+"')"
            print q4
            cur.execute(q4)
            db.commit()
        ## don't see that we need to save uniq_ids
    db.commit()
    #print SEQ_COLLECTOR    
        
def push_taxonomy(args):
    
    gast_dir = os.path.join(args.indir,'analysis/gast') 
    
    #print  general_config_items
    silva = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id','strain_id']
    accepted_domains = ['bacteria','archaea','eukarya','fungi','organelle','unknown']
    tax_collector = {}
    
    for dir in os.listdir(gast_dir): 
        ds_dir = dir
        SEQ_COLLECTOR[ds_dir] = {}
        tax_file = os.path.join(gast_dir, dir, 'vamps_sequences_pipe.txt')
        #print tax_file
        with open(tax_file,'r') as fh:
            for line in fh:
                
                items = line.strip().split("\t")
                if items[0] == 'HEADER': continue
                seq = items[0]
                ds_file = items[2]
                if ds_file != ds_dir:
                    sys.exit('Dataset file--name mismatch -- Confused! Exiting!')
                tax_string = items[3]
                refhvr_ids = items[4]
                rank = items[5]
                seq_count = items[6]
                distance = items[8]
                SEQ_COLLECTOR[ds_dir][seq] = {'dataset':ds_dir,
                                      'taxonomy':tax_string,
                                      'refhvr_ids':refhvr_ids,
                                      'rank':rank,
                                      'seq_count':seq_count,
                                      'distance':distance
                                      }
                q1 = "SELECT rank_id from rank where rank = '"+rank+"'"
                cur.execute(q1)
                db.commit()
                for row in cur.fetchall():
                    SEQ_COLLECTOR[ds_dir][seq]['rank_id'] = row[0]
                #print tax_string
                tax_items = tax_string.split(';')
                #for i in range(0,8):
                #insert_nas()    
                print tax_string
                if tax_items[0].lower() in accepted_domains:
                    ids_by_rank = []
                    for i in range(0,8):
                        #print i,len(tax_items),tax_items[i]
                        if len(tax_items) > i:
                            if tax_items[i].lower() == 'species':
                                t = tax_items[i].lower()
                            else:
                                t = tax_items[i].capitalize()
                            
                            if tax_items[i].lower() != (ranks[i]+'_NA').lower():
                                name_found = False
                                if ranks[i] in tax_collector:
                                    tax_collector[ranks[i]].append(t)
                                else:
                                    tax_collector[ranks[i]] = [t]
                        else:
                            t = ranks[i]+'_NA'
                        
   
                        q2 = "INSERT ignore into `"+ranks[i]+"` (`"+ranks[i]+"`) VALUES('"+t+"')"
                        print q2
                        cur.execute(q2)
                        db.commit() 
                        rankid = cur.lastrowid
                        if rankid == 0:
                            q3 = "select "+ranks[i]+"_id from `"+ranks[i]+"` where `"+ranks[i]+"` = '"+t+"'"
                            print q3
                            cur.execute(q3)
                            db.commit() 
                            row = cur.fetchone()
                            rankid=row[0]
                        ids_by_rank.append(str(rankid))
                        #else:
                            
                            #ids_by_rank.append('1')
                    print  ids_by_rank   
                    q4 =  "INSERT ignore into silva_taxonomy ("+','.join(silva)+",created_at)"
                    q4 += " VALUES("+','.join(ids_by_rank)+",CURRENT_TIMESTAMP())"
                    #
                    print q4
                    cur.execute(q4)
                    db.commit() 
                    silva_tax_id = cur.lastrowid
                    if silva_tax_id == 0:
                        q5 = "SELECT silva_taxonomy_id from silva_taxonomy where ("
                        vals = ''
                        for i in range(0,len(silva)):
                            vals += ' '+silva[i]+"="+ids_by_rank[i]+' and'
                        q5 = q5 + vals[0:-3] + ')'
                        print q5
                        cur.execute(q5)
                        db.commit() 
                        row = cur.fetchone()
                        silva_tax_id=row[0]
                    
                    SILVA_IDS_BY_TAX[tax_string] = silva_tax_id
                    SEQ_COLLECTOR[ds_dir][seq]['silva_tax_id'] = silva_tax_id
                    db.commit() 
 #    for rank in tax_collector:
#         for name in tax_collector[rank]:
#             
#             q = "insert ignore into `"+rank+"` (`"+rank+"`) VALUES('"+name+"')"
#             
#             #print q
#             cur.execute(q)
#             id = cur.lastrowid
    #print 'SEQ_COLLECTOR'
    #print SEQ_COLLECTOR
    
    #print SILVA_IDS_BY_TAX
    #db.commit() 
# def insert_nas():
#     for table in ranks:
#         i = table+'_NA'
#         q = "INSERT ignore into `"+table+"` (`"+table+"`) VALUES('"+i+"')"
#         if table != 'domain':
#             cur.execute(q)
#     db.commit()
             
def get_config_data(args):
    # convert a vamps user upload config file: use INFO-TAX.config
    # change vamps_user to owner <and use one that is already in db >
    # owner_id and project_id gathered automatically 
    config = ConfigParser.ConfigParser()
    config.optionxform=str
    
     
    if os.path.isfile(   os.path.join(args.indir,'INFO_CONFIG.ini') ):
        config_infile =  os.path.join(args.indir,'INFO_CONFIG.ini')
    elif os.path.isfile( os.path.join(args.indir,'INFO-TAX.config') ):
        config_infile =  os.path.join(args.indir,'INFO-TAX.config')
    elif os.path.isfile( os.path.join(args.indir,'config.ini') ):
        config_infile =  os.path.join(args.indir,'config.ini')
    else:    
        print "Could not find INFO_CONFIG.ini INFO-TAX.config or config.ini in ",args.indir
        sys.exit()
    config.read(config_infile)
    try:
        for name, value in  config.items('GENERAL'):  
            CONFIG_ITEMS[name] = value
    except:
        for name, value in  config.items('MAIN'): 
            CONFIG_ITEMS[name] = value
    datasets = {}
    for dsname, count in  config.items('DATASETS'):
        #print '  %s = %s' % (name, value) 
        ds = dsname 
        datasets[ds] = count
    CONFIG_ITEMS['datasets'] = datasets    
    #print CONFIG_ITEMS 
       

if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: database_project_upload.py  [options]
         
       uploads to new vamps  
         where
            
            -dir/--indir   This should be all you need.
                     Steps 1 & 2 are in py_pipeline
                     
                     Step 1) ./1-vamps-load.py
                             Create config.ini from input fasta file
                             Will also create directory structure:
                                 analysis/gast/
                             Divide up datasets into separate directories
                     Step 2) ./2-vamps-gast.py
                             Will create INFO-TAX.ini
                             and using (modified) python_pipeline
                             GAST data into analysis/gast/ds directory
                     Step 3) This script:
                             .database_project_upload.py -dir input_directory

"""
#########
#!/bin/bash
##############            
### script to copy vamps* files to a new directory: 
### All is needed is INFO-TAX.config file and analysis/gast/<dataset> directory structure
### with vamps_* files in each dataset dir
### to run this vamps-upload script for new_vamps
##############         


# target='/users/avoorhis/mobedac_36572424/analysis/gast'
# 
# for directory in $( find . -type d ); do
#   new_directory=$( echo ${directory} | sed "s%\./%$target/%" )
#   echo "mkdir -p \"${new_directory}\""
#   mkdir -p "${new_directory}"
#   for i in ${directory}/vamps* ; do
#         cp $i "${new_directory}/"
#         #echo "cp $i \"${new_directory}/\""
#   done
# 
# done
# 
# exit 0
################################################################  
    
    

    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
                                                    
    parser.add_argument("-dir","--indir",                   
                required=False,  action="store",   dest = "indir", 
                help="""Directory to output ini and dir structure""")  
    
   ###################################################################################      

   
    
    args = parser.parse_args()    
   
    args.datetime     = str(datetime.date.today())    
    if not args.indir:
        print myusage
        sys.exit()
    if not os.path.isfile(args.indir+'/INFO_CONFIG.ini'):
        sys.exit('Cannot find INFO_CONFIG.ini')
        
    db = MySQLdb.connect(host="localhost", # your host, usually localhost
                          user="ruby", # your username
                          passwd="ruby") # name of the data base
    cur = db.cursor()
    cur.execute("SHOW databases like 'vamps%'")
    dbs = []
    db_str = ''
    for i, row in enumerate(cur.fetchall()):
        dbs.append(row[0])
        db_str += str(i)+'-'+row[0]+';  '
    print db_str
    db_no = input("\nchoose database number: ")
    if int(db_no) < len(dbs):
        NODE_DATABASE = dbs[db_no]
    else:
        sys.exit("unrecognized number -- Exiting")
        
    print
    cur.execute("USE "+NODE_DATABASE)
    print 'DATABASE:',NODE_DATABASE
    if args.indir:
        start(args)
    else:
        print myusage
        print 'requires directory input'
        
    
        
