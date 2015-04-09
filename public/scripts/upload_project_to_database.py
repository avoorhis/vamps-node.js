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
from IlluminaUtils.lib import fastalib
import datetime
today = str(datetime.date.today())
import subprocess
import MySQLdb
import pprint
pp = pprint.PrettyPrinter(indent=4)
"""
New Table:
CREATE TABLE `summed_counts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `dataset_id` int(11) unsigned DEFAULT NULL,
  `domain_id` int(11) unsigned DEFAULT NULL,
  `phylum_id` int(11) unsigned DEFAULT NULL,
  `klass_id` int(11) unsigned DEFAULT NULL,
  `order_id` int(11) unsigned DEFAULT NULL,
  `family_id` int(11) unsigned DEFAULT NULL,
  `genus_id` int(11) unsigned DEFAULT NULL,
  `species_id` int(11) unsigned DEFAULT NULL,
  `strain_id` int(11) unsigned DEFAULT NULL,
  `rank_id` tinyint(11) unsigned DEFAULT NULL,
  `count` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `summed_counts_ibfk_11` (`dataset_id`),
  KEY `summed_counts_ibfk_1` (`strain_id`),
  KEY `summed_counts_ibfk_3` (`genus_id`),
  KEY `summed_counts_ibfk_4` (`domain_id`),
  KEY `summed_counts_ibfk_5` (`family_id`),
  KEY `summed_counts_ibfk_6` (`klass_id`),
  KEY `summed_counts_ibfk_7` (`order_id`),
  KEY `summed_counts_ibfk_8` (`phylum_id`),
  KEY `summed_counts_ibfk_9` (`species_id`),
  KEY `summed_counts_ibfk_10` (`rank_id`),
  CONSTRAINT `summed_counts_ibfk_11` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`dataset_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_1` FOREIGN KEY (`strain_id`) REFERENCES `strain` (`strain_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_3` FOREIGN KEY (`genus_id`) REFERENCES `genus` (`genus_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_4` FOREIGN KEY (`domain_id`) REFERENCES `domain` (`domain_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_5` FOREIGN KEY (`family_id`) REFERENCES `family` (`family_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_6` FOREIGN KEY (`klass_id`) REFERENCES `klass` (`klass_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_7` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_8` FOREIGN KEY (`phylum_id`) REFERENCES `phylum` (`phylum_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_9` FOREIGN KEY (`species_id`) REFERENCES `species` (`species_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_10` FOREIGN KEY (`rank_id`) REFERENCES `rank` (`rank_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=464 DEFAULT CHARSET=latin1;


"""
# Global:
#NODE_DATABASE = "vamps_js_dev_av"
#NODE_DATABASE = "vamps_js_development"
CONFIG_ITEMS = {}
SEQ_COLLECTOR = {}
DATASET_ID_BY_NAME = {}
SILVA_IDS_BY_TAX = {}
RANK_COLLECTOR={}
TAX_ID_BY_RANKID_N_TAX = {}
SUMMED_TAX_COLLECTOR = {}  # SUMMED_TAX_COLLECTOR[ds][rank][tax_string] = count
ranks =['domain','phylum','klass','order','family','genus','species','strain']
# ranks =[{'name':'domain', 'id':1,'num':0},
#         {'name':'phylum', 'id':4,'num':1},
#         {'name':'klass',  'id':5,'num':2},
#         {'name':'order',  'id':6,'num':3},
#         {'name':'family', 'id':8,'num':4},
#         {'name':'genus',  'id':9,'num':5},
#         {'name':'species','id':10,'num':6},
#         {'name':'strain', 'id':11,'num':7}]


def start(args):
    get_config_data(args)
    check_user(args)  ## script dies if user not in db
    recreate_ranks()
    create_env_source()
    create_classifier()
    push_taxonomy(args)  #
    push_sequences(args)
    push_project(args)   # 
    push_dataset(args)
    push_summed_counts(args)
    push_pdr_seqs(args)
    
    #print SEQ_COLLECTOR
    pp.pprint(CONFIG_ITEMS)
def create_env_source():
    q = "INSERT IGNORE INTO env_sample_source VALUES (0,''),(10,'air'),(20,'extreme habitat'),(30,'host associated'),(40,'human associated'),(45,'human-amniotic-fluid'),(47,'human-blood'),(43,'human-gut'),(42,'human-oral'),(41,'human-skin'),(46,'human-urine'),(44,'human-vaginal'),(140,'indoor'),(50,'microbial mat/biofilm'),(60,'miscellaneous_natural_or_artificial_environment'),(70,'plant associated'),(80,'sediment'),(90,'soil/sand'),(100,'unknown'),(110,'wastewater/sludge'),(120,'water-freshwater'),(130,'water-marine')"
    cur.execute(q)
    db.commit()

def create_classifier():
    q = "INSERT IGNORE INTO classifier VALUES (1,'RDP'),(2,'GAST')"
    cur.execute(q)
    db.commit()
    
def recreate_ranks():
    for i,rank in enumerate(ranks):
        
        q = "INSERT IGNORE into rank (rank,rank_number) VALUES('"+rank+"','"+str(i)+"')"
        print q
        cur.execute(q)
        rank_id = cur.lastrowid
        if rank_id==0:
            q = "SELECT rank_id from rank where rank='"+rank+"'"
            print q
            cur.execute(q)
            row = cur.fetchone()
            RANK_COLLECTOR[rank] = row[0]
        else:
            RANK_COLLECTOR[rank] = rank_id
    db.commit()
    
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
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    q = "select user_id from user where username='"+CONFIG_ITEMS['owner']+"'"
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
            print ds,seq,silva_tax_id
            rank_id = str(SEQ_COLLECTOR[ds][seq]['rank_id'])
            print rank_id
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
                #print 'DUP silva_tax_seq'
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

        
def push_summed_counts(args):
    print TAX_ID_BY_RANKID_N_TAX
    print RANK_COLLECTOR
    print
    #print SUMMED_TAX_COLLECTOR
    #print
    #print SILVA_IDS_BY_TAX
    silva = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id','strain_id']
    for ds in SUMMED_TAX_COLLECTOR:
        did = DATASET_ID_BY_NAME[ds]
        for rank_id in SUMMED_TAX_COLLECTOR[ds]:
             
            for tax in SUMMED_TAX_COLLECTOR[ds][rank_id]:
                
                tax_items = tax.split(';')
                count = SUMMED_TAX_COLLECTOR[ds][rank_id][tax]
                print did,tax,rank_id,count
                fields_sql = []
                valueholder_sql =[]
                values_sql = []
                for i in range(0,len(tax_items)):
                    fields_sql.append(silva[i])
                    valueholder_sql.append("%s")
                    #print rank_id,tax_items[i]
                    #q = "SELECT "+ranks[i]+"_id from "+ranks[i]+" where "+ranks[i]+"='"+tax_items[i]+"'"
                    
                    #cur.execute(q)
                    #db.commit()
                    #row = cur.fetchone()
                    id = RANK_COLLECTOR[ranks[i]]
                    print 'RANK_COLLECTOR id',id
                    if tax_items[i][-2:] != 'NA':
                        if ranks[i] == 'species':
                            t = tax_items[i].lower()
                        else:
                            t = tax_items[i].capitalize()
                    else:
                        t = tax_items[i]
                        
                    #if t in TAX_ID_BY_RANKID_N_TAX[id]:
                    values_sql.append(str(TAX_ID_BY_RANKID_N_TAX[id][t]))
                    
                #print  'valueholder_sql',valueholder_sql   
                q = "INSERT into summed_counts (dataset_id,"+", ".join(fields_sql)+",rank_id,count)"
                q += " VALUES('"+str(did)+"',"
                for n in values_sql:
                    q += "'"+str(n)+"',"
                q += "'"+str(rank_id)+"','"+str(count)+"')"
                #"'%s','%s','"+  "','".join(valueholder_sql)  +"','%s')"
                print q
                cur.execute(q)
    db.commit()           
                               
def push_taxonomy(args):
    
    gast_dir = os.path.join(args.indir,'analysis/gast') 
    
    #print  general_config_items
    silva = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id','strain_id']
    accepted_domains = ['bacteria','archaea','eukarya','fungi','organelle','unknown']
    tax_collector = {}
    
    for dir in os.listdir(gast_dir): 
        ds = dir
        SEQ_COLLECTOR[ds] = {}
        tax_file = os.path.join(gast_dir, dir, 'vamps_sequences_pipe.txt')
        #print tax_file
        with open(tax_file,'r') as fh:
            for line in fh:
                
                items = line.strip().split("\t")
                if items[0] == 'HEADER': continue
                seq = items[0]
                ds_file = items[2]
                if ds_file != ds:
                    sys.exit('Dataset file--name mismatch -- Confused! Exiting!')
                tax_string = items[3]
                refhvr_ids = items[4]
                rank = items[5]
                if rank == 'class': rank = 'klass'
                if rank == 'orderx': rank = 'order'
                seq_count = items[6]
                distance = items[8]
                
                
                if ds not in SUMMED_TAX_COLLECTOR:
                    SUMMED_TAX_COLLECTOR[ds]={}
                
                
    
                SEQ_COLLECTOR[ds][seq] = {'dataset':ds,
                                      'taxonomy':tax_string,
                                      'refhvr_ids':refhvr_ids,
                                      'rank':rank,
                                      'seq_count':seq_count,
                                      'distance':distance
                                      }
                q1 = "SELECT rank_id from rank where rank = '"+rank+"'"
                
                cur.execute(q1)
                db.commit()
               
                row = cur.fetchone()
                
                SEQ_COLLECTOR[ds][seq]['rank_id'] = row[0]
                    
                tax_items = tax_string.split(';')
                #print tax_string
                sumtax = ''
                for i in range(0,8):
                    
                    rank_id = RANK_COLLECTOR[ranks[i]]
                    if len(tax_items) > i:
                        
                        taxitem = tax_items[i]
                        
                    else:
                        taxitem = ranks[i]+'_NA'
                    sumtax += taxitem+';'
                    
                    #print ranks[i],rank_id,taxitem,sumtax,seq_count
                    if rank_id in SUMMED_TAX_COLLECTOR[ds]:
                        if sumtax[:-1] in SUMMED_TAX_COLLECTOR[ds][rank_id]:
                            SUMMED_TAX_COLLECTOR[ds][rank_id][sumtax[:-1]] += int(seq_count)
                        else:
                            SUMMED_TAX_COLLECTOR[ds][rank_id][sumtax[:-1]] = int(seq_count)
                            
                    else:
                        SUMMED_TAX_COLLECTOR[ds][rank_id] = {}
                        SUMMED_TAX_COLLECTOR[ds][rank_id][sumtax[:-1]] = int(seq_count)
 
                #for i in range(0,8):
                #insert_nas()    
                
                if tax_items[0].lower() in accepted_domains:
                    ids_by_rank = []
                    for i in range(0,8):
                        #print i,len(tax_items),tax_items[i]
                        rank_name = ranks[i]
                        rank_id = RANK_COLLECTOR[ranks[i]]
                        
                        if len(tax_items) > i:
                            if ranks[i] == 'species':
                                t = tax_items[i].lower()
                            else:
                                t = tax_items[i].capitalize()
                            
                            if tax_items[i].lower() != (rank_name+'_NA').lower():
                                name_found = False
                                if rank_name in tax_collector:
                                    tax_collector[rank_name].append(t)
                                else:
                                    tax_collector[rank_name] = [t]
                        else:
                            t = rank_name+'_NA'
                        
                        
                            
                        q2 = "INSERT ignore into `"+rank_name+"` (`"+rank_name+"`) VALUES('"+t+"')"
                        print q2
                        cur.execute(q2)
                        db.commit() 
                        tax_id = cur.lastrowid
                        if tax_id == 0:
                            q3 = "select "+rank_name+"_id from `"+rank_name+"` where `"+rank_name+"` = '"+t+"'"
                            print q3
                            cur.execute(q3)
                            db.commit() 
                            row = cur.fetchone()
                            tax_id=row[0]
                        ids_by_rank.append(str(tax_id))
                        #else:
                        print 'rank_id,t,tax_id',rank_id,t,tax_id    
                        if rank_id in TAX_ID_BY_RANKID_N_TAX:
                            TAX_ID_BY_RANKID_N_TAX[rank_id][t] = tax_id
                        else:
                            TAX_ID_BY_RANKID_N_TAX[rank_id]={}
                            TAX_ID_BY_RANKID_N_TAX[rank_id][t] = tax_id
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
                    SEQ_COLLECTOR[ds][seq]['silva_tax_id'] = silva_tax_id
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
    print 'SUMMED_TAX_COLLECTOR'
    print SUMMED_TAX_COLLECTOR
             
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
    
    
    myusage = """usage: upload_project_to_database.py  [options]
         
       uploads to new vamps  
         where
            
            -dir/--indir   This is the base directory where analysis/gast/ is located.
                            This should be all you need.
                     Steps 1 & 2 are in py_mbl_sequencing_pipeline (modified)
                     
                     Step 1) ./1-vamps-load.py
                             Create config.ini from input fasta file
                             Will also create directory structure:
                                 analysis/gast/<dataset name>
                             Installs fatsta files into separate dataset directories.
                     Step 2) ./2-vamps-gast.py
                             Will create INFO_CONFIG.ini
                             and, using (modified) python_pipeline,
                             GAST data into analysis/gast/<dataset name> directory
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
        
    
        
