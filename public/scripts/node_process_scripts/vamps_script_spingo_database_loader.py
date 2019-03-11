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
import configparser as ConfigParser
#from IlluminaUtils.lib import fastalib
import fastalibAV as fastalib
import datetime
import logging
today = str(datetime.date.today())
import subprocess
import pymysql as MySQLdb
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
 # SUMMED_TAX_COLLECTOR[ds][rank][tax_string] = count
classifiers = {"GAST":{'ITS1':1,'SILVA108_FULL_LENGTH':2,'GG_FEB2011':3,'GG_MAY2013':4},
                "RDP":{'ITS1':6,'2.10.1':5,'GG_FEB2011':7,'GG_MAY2013':8},
                'unknown':{'unknown':9}}
ranks =['domain','phylum','klass','order','family','genus','species','strain']
eight_cats = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id','strain_id']
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
    global CONFIG_ITEMS
    global SEQ_COLLECTOR
    global DATASET_ID_BY_NAME
    global RDP_IDS_BY_TAX
    global RANK_COLLECTOR
    global TAX_ID_BY_RANKID_N_TAX
    global SUMMED_TAX_COLLECTOR
    CONFIG_ITEMS = {}
    SEQ_COLLECTOR = {}
    DATASET_ID_BY_NAME = {}
    RDP_IDS_BY_TAX = {}
    RANK_COLLECTOR={}
    TAX_ID_BY_RANKID_N_TAX = {}
    SUMMED_TAX_COLLECTOR = {} 
    logging.info('CMD> '+' '.join(sys.argv))
    print('CMD> ',sys.argv)


    
    global mysql_conn, cur    
   
    os.chdir(args.project_dir)
    
    mysql_conn = MySQLdb.connect(db = args.NODE_DATABASE, host=args.hostname, read_default_file=os.path.expanduser("~/.my.cnf_node")  )
    # socket=/tmp/mysql.sock
    cur = mysql_conn.cursor()
    
    
    logging.info("running get_config_data")
    print ("running get_config_data")
    get_config_data(args)
    
    logging.info("checking user")
    print ("checking user")
    check_user()  ## script dies if user not in db
    
    logging.info("checking project")
    print ("checking project")
    res = check_project()  ## script dies if project is in db
    
    if res[0]=='ERROR':
        print ("1ERROR res[0] -- Exiting (project name is already in use)")
        sys.exit(res[1])
    
    logging.info("recreating ranks")
    print ("recreating ranks")
    recreate_ranks()

    # logging.info("env sources")
#     print "env sources"
#     create_env_package()

    logging.info("classifier")
    print("classifier")
    create_classifier()

    logging.info("starting taxonomy")
    print ("starting taxonomy")
    push_taxonomy(args)

    logging.info("starting sequences")
    print ("starting sequences")
    push_sequences(args)
    #sys.exit()
        
    logging.info("projects")
    print ("projects")
    push_project()

    logging.info("datasets")
    print ("datasets")
    push_dataset()

    #push_summed_counts()
    logging.info("starting push_pdr_seqs")
    print ("starting push_pdr_seqs")
    push_pdr_seqs(args)

    #print SEQ_COLLECTOR
    #pp.pprint(CONFIG_ITEMS)
    logging.info("Finished "+os.path.basename(__file__))
    print ("Finished "+os.path.basename(__file__))
    print (CONFIG_ITEMS['project_id'])
    print ('Writing pid to pid.txt')
    fp = open(os.path.join(args.project_dir,'pid.txt'),'w')
    fp.write(str(CONFIG_ITEMS['project_id']))
    fp.close()

    return CONFIG_ITEMS['project_id']
        
    
def check_user():
    """
    check_user()
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    global CONFIG_ITEMS
    global mysql_conn, cur
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
    global CONFIG_ITEMS
    global mysql_conn, cur
    proj = CONFIG_ITEMS['project_name']
    q = "SELECT project, project_id from project WHERE project='%s'" % (proj)
    cur.execute(q)
    if cur.rowcount > 0:
        row = cur.fetchone()
        
        return ('ERROR','Duplicate project name1: '+CONFIG_ITEMS['project_name']+' PID:'+str(row[1]))
    return ('OK','')
           
# def create_env_package():
#     global mysql_conn, cur
#     q = "INSERT IGNORE INTO env_package VALUES (0,''),(10,'air'),(20,'extreme habitat'),(30,'host associated'),(40,'human associated'),(45,'human-amniotic-fluid'),(47,'human-blood'),(43,'human-gut'),(42,'human-oral'),(41,'human-skin'),(46,'human-urine'),(44,'human-vaginal'),(140,'indoor'),(50,'microbial mat/biofilm'),(60,'miscellaneous_natural_or_artificial_environment'),(70,'plant associated'),(80,'sediment'),(90,'soil/sand'),(100,'unknown'),(110,'wastewater/sludge'),(120,'water-freshwater'),(130,'water-marine')"
#     cur.execute(q)
#     mysql_conn.commit()

def create_classifier():
    global mysql_conn, cur
    q = "INSERT IGNORE INTO classifier VALUES" # (1,'GAST','ITS1'),(2,'GAST','SILVA108_FULL_LENGTH'),(3,'GAST','GG_FEB2011'),(4,'GAST','GG_MAY2013'),"
    for classifier in classifiers:
        for db in classifiers[classifier]:
            id = str(classifiers[classifier][db])
            q += "('"+id+"','"+classifier+"','"+db+"'),"
    q = q[:-1]
    #print q
    cur.execute(q)
    mysql_conn.commit()
    
def recreate_ranks():
    
    global RANK_COLLECTOR
    global mysql_conn, cur
    for i,rank in enumerate(ranks):
        
        q = "INSERT IGNORE into rank (rank,rank_number) VALUES('%s','%s')" % (rank,str(i))
        logging.info(q)
        cur.execute(q)
        rank_id = cur.lastrowid
        if rank_id==0:
            q = "SELECT rank_id from rank where rank='%s'" % (rank)
            logging.info(q)
            cur.execute(q)
            row = cur.fetchone()
            RANK_COLLECTOR[rank] = row[0]
        else:
            RANK_COLLECTOR[rank] = rank_id
    mysql_conn.commit()

def push_project():
    global CONFIG_ITEMS
    global mysql_conn, cur
    desc = "Project Description"
    title = "Title"
    proj = CONFIG_ITEMS['project_name']
    rev = CONFIG_ITEMS['project_name'][::-1]
    fund = "Unknown"
    id = CONFIG_ITEMS['owner_id']
    pub = 0 if CONFIG_ITEMS['public'] else 1
    fields = ['project','title','project_description','rev_project_name','funding','owner_user_id','public','matrix','active','permanent','user_project']
    q = "INSERT into project ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')"
    q = q % (proj,title,desc,rev,fund,id,pub,'0','1','0','1')
    print(q)
    logging.info(q)
    #print cur.lastrowid
    ## should have already checked 
    cur.execute(q)
    CONFIG_ITEMS['project_id'] = cur.lastrowid
    logging.info("PID="+str(CONFIG_ITEMS['project_id']))
    print ("PID="+str(CONFIG_ITEMS['project_id']))
    mysql_conn.commit()
    
    
        #print cur.lastrowid
    # except:
#         print('ERROR: MySQL Integrity ERROR -- duplicate project name: '+proj)
#         #sys.exit('ERROR: MySQL Integrity ERROR -- duplicate dataset: '+proj)
#         return ('ERROR: Duplicate Project Name2: '+q)
        
    
    return 0
        
def push_dataset():
    global CONFIG_ITEMS    
    global DATASET_ID_BY_NAME
    global mysql_conn, cur
    fields = ['dataset','dataset_description','project_id']
    q = "INSERT into dataset ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s')"

    for ds in CONFIG_ITEMS['datasets']:
        desc = ds+'_description'
        #print ds,desc,CONFIG_ITEMS['env_source_id'],CONFIG_ITEMS['project_id']
        q4 = q % (ds,desc,CONFIG_ITEMS['project_id'])
        logging.info(q4)
        print(q4)
        #try:
        cur.execute(q4)
        did = cur.lastrowid
        print ('new did',did)
        DATASET_ID_BY_NAME[ds]=did
        mysql_conn.commit()
        #except:
        #    print('ERROR: MySQL Integrity ERROR -- duplicate dataset')
        #    sys.exit('ERROR: MySQL Integrity ERROR -- duplicate dataset')
    
    

def get_default_run_info_ill_id():

    q =  "SELECT run_info_ill_id from run_info_ill"
    q += " JOIN run_key using(run_key_id)"
    q += " JOIN run using(run_id)"
    q += " JOIN dataset using(dataset_id)"
    q += " JOIN dna_region using(dna_region_id)"
    q += " JOIN primer_suite using(primer_suite_id)"
    q += " JOIN illumina_index using(illumina_index_id)"
    q += " WHERE run_key='%s'"
    q += " AND run='%s'"
    q += " AND dataset='%s'"
    q += " AND dna_region='%s'"
    q += " AND primer_suite='%s'"
    q += " AND illumina_index='%s'"
    
    try:
        q = q  % ('unknown','unknown','default_dataset','unknown','unknown','unknown')
        print(q)
        cur.execute(q)
    except:
        print ("ERROR No default run_info_ill_id; Query: "+q)
        sys.exit()
    row = cur.fetchone()
    run_info_ill_id=row[0]
    return run_info_ill_id

def push_pdr_seqs(args):
    #print()
    gast_dbs = ['','','']

    global SEQ_COLLECTOR
    global DATASET_ID_BY_NAME
    global mysql_conn, cur
    run_info_ill_id = get_default_run_info_ill_id()
    for ds in SEQ_COLLECTOR:
        for seq in SEQ_COLLECTOR[ds]:
            print('SEQSEQ')
            did = DATASET_ID_BY_NAME[ds]
            seqid = SEQ_COLLECTOR[ds][seq]['sequence_id']
            count = SEQ_COLLECTOR[ds][seq]['seq_count']
            q = "INSERT into sequence_pdr_info (dataset_id, sequence_id, seq_count, classifier_id,run_info_ill_id)"
            #if args.classifier.upper() == 'GAST':
            
            classid=9  # 'unknown'
            q += " VALUES ('%s','%s','%s','%s','%s')"   


            #     q += " VALUES ('%s','%s','%s','2')"
            # elif args.classifier.upper() == 'RDP':
            #     q += " VALUES ('%s','%s','%s','1')"
            # else:
            #     q += " VALUES ('%s','%s','%s','3')"   # 3 is 'unknown'
            
            #print()
            logging.info(q)
            try:
                q = q  % (str(did),str(seqid),str(count),str(classid),str(run_info_ill_id))
                print(q)
                cur.execute(q)
            except:
                logging.error(q)
                print ("ERROR Exiting: "+ds +"; Query: "+q)
                print (DATASET_ID_BY_NAME)
                sys.exit()
            mysql_conn.commit()
    
def push_sequences(args):
    # sequences
    #print()
    
    global SEQ_COLLECTOR
    global mysql_conn, cur
    for ds in SEQ_COLLECTOR:
        for seq in SEQ_COLLECTOR[ds]:
            q = "INSERT ignore into sequence (sequence_comp) VALUES (COMPRESS('%s'))" % (seq)
            logging.info(q)
            cur.execute(q)
            mysql_conn.commit()
            seqid = cur.lastrowid
            if seqid == 0:
                q2 = "select sequence_id from sequence where sequence_comp = COMPRESS('%s')" % (seq)
                logging.info('DUP SEQ FOUND')
                cur.execute(q2)
                mysql_conn.commit() 
                row = cur.fetchone()
                seqid=row[0]
            #print ('seqid',seqid)
            SEQ_COLLECTOR[ds][seq]['sequence_id'] = seqid
            rdp_tax_id = str(SEQ_COLLECTOR[ds][seq]['rdp_tax_id'])
            
            #logging.info( ds,seq, rdp_tax_id)
            rank_id = str(SEQ_COLLECTOR[ds][seq]['rank_id'])
            logging.info(rank_id)
            q = "INSERT ignore into rdp_taxonomy_info_per_seq"
            
            q += " (sequence_id,rdp_taxonomy_id,refssu_id,rank_id)"
            q += " VALUES ('%s','%s','0','%s')" % (str(seqid), rdp_tax_id, rank_id)
            q += " ON DUPLICATE KEY UPDATE rdp_taxonomy_id='"+rdp_tax_id+"', rank_id='"+rank_id+"'"
            logging.info(q)
            print(q)
            cur.execute(q)
            mysql_conn.commit()
            rdp_tax_seq_id = cur.lastrowid
            print ('seqid',seqid)
            if rdp_tax_seq_id == 0:
                q3 = "select rdp_taxonomy_info_per_seq_id from rdp_taxonomy_info_per_seq"
                q3 += " where sequence_id = '"+str(seqid)+"'"
                q3 += " and rdp_taxonomy_id = '"+rdp_tax_id+"'"
                q3 += " and rank_id = '"+rank_id+"'"
                #print 'DUP rdp_tax_seq'
                print(q3)
                cur.execute(q3)
                mysql_conn.commit() 
                row = cur.fetchone()
                rdp_tax_seq_id=row[0]
        
            q4 = "INSERT ignore into sequence_uniq_info (sequence_id, rdp_taxonomy_info_per_seq_id)"
            q4 += " VALUES('%s','%s')" % (str(seqid), str(rdp_tax_seq_id))
            logging.info(q4)
            cur.execute(q4)
            mysql_conn.commit()
        ## don't see that we need to save uniq_ids
    mysql_conn.commit()
    #print SEQ_COLLECTOR    

#
#
#
def push_taxonomy(args):
    
    global SUMMED_TAX_COLLECTOR
    global mysql_conn, cur    
    
    for ds in CONFIG_ITEMS['datasets']: 
        
        SEQ_COLLECTOR[ds] = {}
        
        data_dir = os.path.join(args.project_dir,'analysis',ds) 
        unique_file = os.path.join(data_dir,'seqfile.unique.fa')
        data_file   = os.path.join(data_dir, 'spingo_out.txt')
        if os.path.exists(data_file):            
            run_spingo_tax_file(args, ds, data_file, unique_file)
        else:
            print ("cound not find file:",data_file)
 
    logging.info( 'SUMMED_TAX_COLLECTOR')
    logging.info( SUMMED_TAX_COLLECTOR )        
#
# 
#                               
def run_tax_by_seq_file(args, ds, tax_file):
    #tax_collector = {}
    

    tax_items = []
    with open(tax_file,'r') as fh:
        for line in fh:
            
            items = line.strip().split("\t")
            #TGGATTTGACATCCCG  Bacteria;Proteobacteria;Deltaproteobacteria    genus   1   0.01500 v6_CH494
            seq = items[0]           
            tax_string = items[1]
            rank = items[2]
            seq_count = items[3]
            distance = items[4]
            refhvr_ids = items[5]           
            
            if rank == 'class': rank = 'klass'
            if rank == 'orderx': rank = 'order'            
            
            tax_items = tax_string.split(';')
            if tax_items != []:
                finish_tax(ds, refhvr_ids, rank, distance, seq, seq_count, tax_items)
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

def run_spingo_tax_file(args,ds,tax_file, seq_file):
    #tax_collector = {}
    tax_items = []
    print(tax_file)
    # make seq lookup for this DATASET
    #with open(seq_file,'r') as fh:
    
    
    with open(tax_file,'r') as fh:
        for line in fh:
            print('line')
            print(line.strip())
            items = line.strip().split()
            #seq = items[0]
            ds_from_file = items[0].split('_')[0]
            print("ds_from_file+' -- '+ds")
            print(ds_from_file+' -- '+ds)
            if ds_from_file != ds:
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
    sys.exit()
#
#
#                
def run_rdp_tax_file(args,ds, tax_file, seq_file): 
    minboot = 80
    print ('reading seqfile',seq_file)
    f = fastalib.SequenceSource(seq_file)
    tmp_seqs = {}
    tmp_freqs = {}
    #print tax_file
    #print seq_file
    while f.next():
        items =  f.id.split('|')  # WILL have |frequency
        id = f.id.split()[0]
        freq = f.id.split('|')[1].split(':')[1]
        print ('id',id)
        print ('freq',freq)
        tmp_freqs[id] = freq
        tmp_seqs[id]= f.seq
    f.close()
        
    tax_items = [] 
    with open(tax_file,'r') as fh:
        for line in fh:
            tax_items = []
            items = line.strip().split("\t")
            
            # ['21|frequency:1', '', 'Bacteria', 'domain', '1.0', '"Firmicutes"', 'phylum', '1.0', '"Clostridia"', 'class', '1.0', 'Clostridiales', 'order', '1.0', '"Ruminococcaceae"', 'family', '1.0', 'Faecalibacterium', 'genus', '1.0']
            # if boot_value > minboot add to tax_string
            seq_id = items[0]
            
            seq_count = tmp_freqs[seq_id]
            #seq_count =1
            tax_line = items[2:]
            
            print (tax_line)
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
            
            seq= tmp_seqs[seq_id]
            #print seq
            #print tax_items
            distance = boot  # furthest along boot value
            
            if tax_items != []:                
                finish_tax(ds,'',rank, distance, seq, seq_count, tax_items)
            
            
def finish_tax(ds,refhvr_ids, rank, distance, seq, seq_count, tax_items):
    #tax_collector = {} 
    global CONFIG_ITEMS
    global SEQ_COLLECTOR
    global DATASET_ID_BY_NAME
    global RDP_IDS_BY_TAX
    global RANK_COLLECTOR
    global TAX_ID_BY_RANKID_N_TAX
    global SUMMED_TAX_COLLECTOR
    global mysql_conn, cur
    tax_string = ';'.join(tax_items)       
    if ds not in SUMMED_TAX_COLLECTOR:
        SUMMED_TAX_COLLECTOR[ds]={}
    #print seq, seq_count, tax_string
    SEQ_COLLECTOR[ds][seq] = {'dataset':ds,
                          'taxonomy':tax_string,
                          'refhvr_ids':refhvr_ids,
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
        q4 =  "INSERT ignore into rdp_taxonomy ("+','.join(eight_cats)+",created_at)"
        q4 += " VALUES("+','.join(ids_by_rank)+",CURRENT_TIMESTAMP())"
        #
        logging.info(q4)
        #print(q4)
        cur.execute(q4)
        mysql_conn.commit() 
        rdp_tax_id = cur.lastrowid
        if rdp_tax_id == 0:
            q5 = "SELECT rdp_taxonomy_id from rdp_taxonomy where ("
            vals = ''
            for i in range(0,len(eight_cats)):
                vals += ' '+eight_cats[i]+"="+ids_by_rank[i]+' and'
            q5 = q5 + vals[0:-3] + ')'
            #print q5
            logging.info(q5)
            cur.execute(q5)
            mysql_conn.commit() 
            row = cur.fetchone()
            rdp_tax_id=row[0]
            #print 'rdp_tax_id',rdp_tax_id
        
        RDP_IDS_BY_TAX[tax_string] = rdp_tax_id
        SEQ_COLLECTOR[ds][seq]['rdp_tax_id'] = rdp_tax_id
        
                
                
                
    #print SEQ_COLLECTOR
                
                
            
            
            

             
def get_config_data(args):
    # convert a vamps user upload config file: use INFO-TAX.config
    # change vamps_user to owner <and use one that is already in db >
    # owner_id and project_id gathered automatically 
    global CONFIG_ITEMS
    
    config = ConfigParser.ConfigParser()
    config.optionxform=str
    
    
    config_path =  os.path.join(args.project_dir,args.config_file)
       
        
    config.read(config_path)
    
    for name, value in  config.items('MAIN'): 
         CONFIG_ITEMS[name] = value
    datasets = {}
    for dsname, count in  config.items('MAIN.dataset'):
        #print '  %s = %s' % (name, value) 
        ds = dsname 
        datasets[ds] = count
    CONFIG_ITEMS['datasets'] = datasets    
    print (CONFIG_ITEMS )
       

if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: vamps_script_database_loader.py  [options]
         
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
                required=False,   action="store",  dest = "NODE_DATABASE",   default='vamps2',         
                help = 'node database') 
    
                                             
    parser.add_argument("-in_type", "--in_type",    
                required=False,  action="store",   dest = "input_type", default='unknown',
                help = '')
    parser.add_argument('-class', '--classifier',         
                required=False,   action="store",  dest = "classifier",  default='unknown',            
                help = 'GAST or RDP')  
    
    parser.add_argument("-project_dir", "--project_dir",    
                required=True,  action="store",   dest = "project_dir", 
                help = '') 
    parser.add_argument("-p", "--project",    
                required=True,  action="store",   dest = "project", 
                help = '')        
    parser.add_argument("-site", "--site",    
                required=False,  action="store",   dest = "site", default='local',
                help = '')
    parser.add_argument("-config", "--config",    
                required=True,  action="store",   dest = "config_file", 
                help = 'config file name') 
    args = parser.parse_args() 
    
    if args.site == 'vamps':
        args.hostname = 'vampsdb'
    elif args.site == 'vampsdev':
        args.hostname = 'vampsdev'
    else:
        args.hostname = 'localhost'
        args.NODE_DATABASE = 'vamps_development'
    print ('db host',args.hostname,'db name',args.NODE_DATABASE)
    start(args)
    #sys.exit('END: vamps_script_rdp_database_loader.py')
    
    