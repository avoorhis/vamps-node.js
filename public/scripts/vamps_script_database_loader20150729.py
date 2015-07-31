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
import logging
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
silva = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id','strain_id']
accepted_domains = ['bacteria','archaea','eukarya','fungi','organelle','unknown']
# ranks =[{'name':'domain', 'id':1,'num':0},
#         {'name':'phylum', 'id':4,'num':1},
#         {'name':'klass',  'id':5,'num':2},
#         {'name':'order',  'id':6,'num':3},
#         {'name':'family', 'id':8,'num':4},
#         {'name':'genus',  'id':9,'num':5},
#         {'name':'species','id':10,'num':6},
#         {'name':'strain', 'id':11,'num':7}]


def start(args):
    
    
    logging.debug('CMD:> '+args.process_dir+'/public/scripts/'+os.path.basename(__file__)+' -class '+args.classifier+' -db '+args.NODE_DATABASE+' -ddir '+args.basedir+' --process_dir '+args.process_dir+' -ref_db '+args.ref_db)
    print('CMD:> '+args.process_dir+'/public/scripts/'+os.path.basename(__file__)+' -class '+args.classifier+' -db '+args.NODE_DATABASE+' -ddir '+args.basedir+' --process_dir '+args.process_dir+' -ref_db '+args.ref_db)

    NODE_DATABASE = args.NODE_DATABASE

    
    process_dir = args.process_dir
    classifier = args.classifier
    
    global mysql_conn
    global cur
    
    
   
    os.chdir(args.basedir)
    
    
    mysql_conn = MySQLdb.connect(host="localhost", # your host, usually localhost
                          db = NODE_DATABASE,
                          read_default_file="~/.my.cnf"  )
    cur = mysql_conn.cursor()
    
    
    logging.info("running get_config_data")
    get_config_data(args.basedir)
    
    logging.info("checking user")
    check_user()  ## script dies if user not in db
    
    logging.info("checking user")
    res = check_project()  ## script dies if project is in db
    
    if res[0]=='ERROR':
        sys.exit(res[1])
    else:
        logging.info("recreating ranks")
        recreate_ranks()
    
        logging.info("env sources")
        create_env_source()
    
        logging.info("classifier")
        create_classifier()
    
        logging.info("starting taxonomy")
        push_taxonomy(args)
    
        logging.info("starting sequences")
        push_sequences()
    
        logging.info("projects")
        push_project()
    
        logging.info("datasets")
        push_dataset()
    
        #push_summed_counts()
        logging.info("starting push_pdr_seqs")
        push_pdr_seqs(args)
    
        #print SEQ_COLLECTOR
        #pp.pprint(CONFIG_ITEMS)
        logging.info("Finished "+os.path.basename(__file__))
    
        return CONFIG_ITEMS['project_id']
    
def check_user():
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

def check_project():
    """
    check_project()
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    proj = CONFIG_ITEMS['project']
    q = "SELECT project from project WHERE project='"+proj+"'"
    cur.execute(q)
    if cur.rowcount > 0:
        return ('ERROR','Duplicate project name1 '+q)
    return ('OK','')
           
def create_env_source():
    q = "INSERT IGNORE INTO env_sample_source VALUES (0,''),(10,'air'),(20,'extreme habitat'),(30,'host associated'),(40,'human associated'),(45,'human-amniotic-fluid'),(47,'human-blood'),(43,'human-gut'),(42,'human-oral'),(41,'human-skin'),(46,'human-urine'),(44,'human-vaginal'),(140,'indoor'),(50,'microbial mat/biofilm'),(60,'miscellaneous_natural_or_artificial_environment'),(70,'plant associated'),(80,'sediment'),(90,'soil/sand'),(100,'unknown'),(110,'wastewater/sludge'),(120,'water-freshwater'),(130,'water-marine')"
    cur.execute(q)
    mysql_conn.commit()

def create_classifier():
    q = "INSERT IGNORE INTO classifier VALUES (1,'RDP'),(2,'GAST')"
    cur.execute(q)
    mysql_conn.commit()
    
def recreate_ranks():
    for i,rank in enumerate(ranks):
        
        q = "INSERT IGNORE into rank (rank,rank_number) VALUES('"+rank+"','"+str(i)+"')"
        logging.info(q)
        cur.execute(q)
        rank_id = cur.lastrowid
        if rank_id==0:
            q = "SELECT rank_id from rank where rank='"+rank+"'"
            logging.info(q)
            cur.execute(q)
            row = cur.fetchone()
            RANK_COLLECTOR[rank] = row[0]
        else:
            RANK_COLLECTOR[rank] = rank_id
    mysql_conn.commit()

def push_project():
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
    logging.info(q)
    print cur.lastrowid
    try:
        cur.execute(q)
        CONFIG_ITEMS['project_id'] = cur.lastrowid
        logging.info("PID="+str(CONFIG_ITEMS['project_id']))
        mysql_conn.commit()
        print cur.lastrowid
    except:
        #print('ERROR: MySQL Integrity ERROR -- duplicate project name: '+proj)
        #sys.exit('ERROR: MySQL Integrity ERROR -- duplicate dataset: '+proj)
        return ('ERROR: Duplicate Project Name2: '+q)
    
    return 0
        
def push_dataset():
    fields = ['dataset','dataset_description','env_sample_source_id','project_id']
    q = "INSERT into dataset ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s','%s')"

    for ds in CONFIG_ITEMS['datasets']:
        desc = ds+'_description'
        #print ds,desc,CONFIG_ITEMS['env_source_id'],CONFIG_ITEMS['project_id']
        q4 = q % (ds,desc,CONFIG_ITEMS['env_source_id'],CONFIG_ITEMS['project_id'])
        logging.info(q4)
        print q4
        try:
            cur.execute(q4)
            did = cur.lastrowid
            DATASET_ID_BY_NAME[ds]=did
        except:
            print('ERROR: MySQL Integrity ERROR -- duplicate dataset')
            sys.exit('ERROR: MySQL Integrity ERROR -- duplicate dataset')
    mysql_conn.commit()
    

    


def push_pdr_seqs(args):
    for ds in SEQ_COLLECTOR:
        for seq in SEQ_COLLECTOR[ds]:
            did = DATASET_ID_BY_NAME[ds]
            seqid = SEQ_COLLECTOR[ds][seq]['sequence_id']
            count = SEQ_COLLECTOR[ds][seq]['seq_count']
            q = "INSERT into sequence_pdr_info (dataset_id, sequence_id, seq_count, classifier_id)"
            if args.classifier == 'gast':
                q += " VALUES ('"+str(did)+"','"+str(seqid)+"','"+str(count)+"','2')"
            elif args.classifier == 'rdp':
                q += " VALUES ('"+str(did)+"','"+str(seqid)+"','"+str(count)+"','1')"
            logging.info(q)
            cur.execute(q)
    mysql_conn.commit()
    
def push_sequences():
    # sequences
    for ds in SEQ_COLLECTOR:
        for seq in SEQ_COLLECTOR[ds]:
            q = "INSERT ignore into sequence (sequence_comp) VALUES (COMPRESS('"+seq+"'))"
            logging.info(q)
            cur.execute(q)
            mysql_conn.commit()
            seqid = cur.lastrowid
            if seqid == 0:
                q2 = "select sequence_id from sequence where sequence_comp = COMPRESS('"+seq+"')"
                logging.info('DUP SEQ FOUND')
                cur.execute(q2)
                mysql_conn.commit() 
                row = cur.fetchone()
                seqid=row[0]
            SEQ_COLLECTOR[ds][seq]['sequence_id'] = seqid
            silva_tax_id = str(SEQ_COLLECTOR[ds][seq]['silva_tax_id'])
            distance = str(SEQ_COLLECTOR[ds][seq]['distance'])
            #logging.info( ds,seq, silva_tax_id)
            rank_id = str(SEQ_COLLECTOR[ds][seq]['rank_id'])
            logging.info( rank_id)
            q = "INSERT ignore into silva_taxonomy_info_per_seq"
            q += " (sequence_id,silva_taxonomy_id,gast_distance,refssu_id,rank_id)"
            q += " VALUES ('"+str(seqid)+"','"+silva_tax_id+"','"+distance+"','0','"+rank_id+"')"
            logging.info(q)
            cur.execute(q)
            mysql_conn.commit()
            silva_tax_seq_id = cur.lastrowid
            if seqid == 0:
                q3 = "select silva_taxonomy_info_per_seq_id from silva_taxonomy_info_per_seq"
                q3 += " where sequence_id = '"+seqid+"'"
                q3 += " and silva_taxonomy_id = '"+silva_tax_id+"'"
                q3 += " and gast_distance = '"+distance+"'"
                q3 += " and rank_id = '"+rank_id+"'"
                #print 'DUP silva_tax_seq'
                cur.execute(q3)
                mysql_conn.commit() 
                row = cur.fetchone()
                silva_tax_seq_id=row[0]
        
            q4 = "INSERT ignore into sequence_uniq_info (sequence_id, silva_taxonomy_info_per_seq_id)"
            q4 += " VALUES('"+str(seqid)+"','"+str(silva_tax_seq_id)+"')"
            logging.info(q4)
            cur.execute(q4)
            mysql_conn.commit()
        ## don't see that we need to save uniq_ids
    mysql_conn.commit()
    #print SEQ_COLLECTOR    

        
#
#
#                               
def run_gast_tax_file(args,ds,tax_file):
    #tax_collector = {}
    tax_items = []
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
            tax_items = tax_string.split(';')
            if tax_items != []:
                finish_tax(ds,refhvr_ids,rank,distance,seq,seq_count,tax_items)

     
#
#
#                
def run_rdp_tax_file(args,ds, tax_file, seq_file): 
    minboot = 80
    
    f = fastalib.SequenceSource(seq_file)
    tmp_seqs = {}
    print tax_file
    print seq_file
    while f.next():
        id = f.id.split('|')[0]
        print 'id1',id
        tmp_seqs[id]= f.seq
    f.close()
        
    tax_items = [] 
    with open(tax_file,'r') as fh:
        for line in fh:
            tax_items = []
            items = line.strip().split("\t")
            
            # ['21|frequency:1', '', 'Bacteria', 'domain', '1.0', '"Firmicutes"', 'phylum', '1.0', '"Clostridia"', 'class', '1.0', 'Clostridiales', 'order', '1.0', '"Ruminococcaceae"', 'family', '1.0', 'Faecalibacterium', 'genus', '1.0']
            # if boot_value > minboot add to tax_string
            tmp = items[0].split('|')
            seq_id = tmp[0]
            seq_count = tmp[1].split(':')[1]
            #seq_count =1
            tax_line = items[2:]
            print tax_line
            for i in range(0,len(tax_line),3):
                  #print i,tax_line[i]
                  tax_name = tax_line[i].strip('"').strip("'")
                  rank = tax_line[i+1]
                  boot = float(tax_line[i+2])*100
                  #print boot,minboot
                  if i==0 and tax_name.lower() in accepted_domains and boot > minboot:
                      tax_items.append(tax_name)
                  elif boot > minboot:
                      tax_items.append(tax_name)
                  else:
                      pass
            rank = ranks[len(tax_items)-1]
            print 'id2',id
            seq= tmp_seqs[seq_id]
            distance = 1
            refhvr_ids = ''
            if tax_items != []:                
                finish_tax(ds,refhvr_ids,rank,distance,seq,seq_count,tax_items)
            
            
def finish_tax(ds, refhvr_ids, rank, distance, seq, seq_count, tax_items):
    #tax_collector = {} 
    tax_string = ';'.join(tax_items)       
    if ds not in SUMMED_TAX_COLLECTOR:
        SUMMED_TAX_COLLECTOR[ds]={}
    print seq, seq_count, tax_string
    SEQ_COLLECTOR[ds][seq] = {'dataset':ds,
                          'taxonomy':tax_string,
                          'refhvr_ids':'',
                          'rank':rank,
                          'seq_count':seq_count,
                          'distance':distance
                          }
    q1 = "SELECT rank_id from rank where rank = '"+rank+"'"
    
    cur.execute(q1)
    mysql_conn.commit()
   
    row = cur.fetchone()
    
    SEQ_COLLECTOR[ds][seq]['rank_id'] = row[0]          
    logging.info(rank+' - '+tax_string)
    
   
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
                    # if rank_name in tax_collector:
                    #     tax_collector[rank_name].append(t)
                    # else:
                    #     tax_collector[rank_name] = [t]
            else:
                t = rank_name+'_NA'
            
            
                
            q2 = "INSERT ignore into `"+rank_name+"` (`"+rank_name+"`) VALUES('"+t+"')"
            logging.info(q2)
            cur.execute(q2)
            mysql_conn.commit() 
            tax_id = cur.lastrowid
            if tax_id == 0:
                q3 = "select "+rank_name+"_id from `"+rank_name+"` where `"+rank_name+"` = '"+t+"'"
                logging.info( q3 )
                cur.execute(q3)
                mysql_conn.commit() 
                row = cur.fetchone()
                tax_id=row[0]
            ids_by_rank.append(str(tax_id))
            #else:
            #logging.info( 'rank_id,t,tax_id',rank_id,t,tax_id  )  
            if rank_id in TAX_ID_BY_RANKID_N_TAX:
                TAX_ID_BY_RANKID_N_TAX[rank_id][t] = tax_id
            else:
                TAX_ID_BY_RANKID_N_TAX[rank_id]={}
                TAX_ID_BY_RANKID_N_TAX[rank_id][t] = tax_id
            #ids_by_rank.append('1')
        logging.info(  ids_by_rank )  
        q4 =  "INSERT ignore into silva_taxonomy ("+','.join(silva)+",created_at)"
        q4 += " VALUES("+','.join(ids_by_rank)+",CURRENT_TIMESTAMP())"
        #
        logging.info(q4)
        cur.execute(q4)
        mysql_conn.commit() 
        silva_tax_id = cur.lastrowid
        if silva_tax_id == 0:
            q5 = "SELECT silva_taxonomy_id from silva_taxonomy where ("
            vals = ''
            for i in range(0,len(silva)):
                vals += ' '+silva[i]+"="+ids_by_rank[i]+' and'
            q5 = q5 + vals[0:-3] + ')'
            logging.info(q5)
            cur.execute(q5)
            mysql_conn.commit() 
            row = cur.fetchone()
            silva_tax_id=row[0]
        
        SILVA_IDS_BY_TAX[tax_string] = silva_tax_id
        SEQ_COLLECTOR[ds][seq]['silva_tax_id'] = silva_tax_id
        mysql_conn.commit()
                
                
                
    #print SEQ_COLLECTOR
                
                
            
            
            
def push_taxonomy(args):
    indir = args.basedir
    classifier = args.classifier
    #gast_dir = os.path.join(indir,'analysis/gast') 
    analysis_dir = os.path.join(indir,'analysis') 
    #print  general_config_items
    
    
    
    for dir in os.listdir(analysis_dir): 
        ds = dir
        SEQ_COLLECTOR[ds] = {}
        if classifier == 'gast':
            tax_file = os.path.join(analysis_dir, dir, 'gast', 'vamps_sequences_pipe.txt')
            if os.path.exists(tax_file):
                run_gast_tax_file(args, ds, tax_file)
        elif classifier == 'rdp':
            tax_file = os.path.join(analysis_dir, dir, 'rdp', 'rdp_out.txt')
            unique_file = os.path.join(analysis_dir, dir, 'unique.fa')
            seqs_file = os.path.join(analysis_dir, dir, 'seqfile.fa')
            if os.path.exists(tax_file):
                run_rdp_tax_file(args, ds, tax_file, unique_file)
        else:
            sys.exit('No classifier found')
 
    logging.info( 'SUMMED_TAX_COLLECTOR')
    logging.info( SUMMED_TAX_COLLECTOR)
             
def get_config_data(indir):
    # convert a vamps user upload config file: use INFO-TAX.config
    # change vamps_user to owner <and use one that is already in db >
    # owner_id and project_id gathered automatically 
    config = ConfigParser.ConfigParser()
    config.optionxform=str
    
    
    config_infile =  os.path.join(indir,'config.ini')
       
        
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

    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
    
    
    parser.add_argument('-db', '--NODE_DATABASE',         
                required=True,   action="store",  dest = "NODE_DATABASE",            
                help = 'node database') 
    
    parser.add_argument('-ref_db', '--reference_db',         
                required=False,   action="store",  dest = "ref_db", default = "default",           
                help = 'node database')                                           
    
    parser.add_argument('-class', '--classifier',         
                required=True,   action="store",  dest = "classifier",              
                help = 'gast or rdp')  
    
    parser.add_argument("-ddir", "--data_dir",    
                required=True,  action="store",   dest = "basedir", 
                help = '')         
    
    parser.add_argument("-pdir", "--process_dir",    
                required=False,  action="store",   dest = "process_dir", default='/Users/avoorhis/programming/vamps-node.js/',
                help = '')
    args = parser.parse_args() 
    start(args)
