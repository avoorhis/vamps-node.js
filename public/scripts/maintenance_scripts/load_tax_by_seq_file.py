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
import pymysql as MySQLdb
from time import sleep
import gzip
#import ConfigParser
#sys.path.append( '/bioware/python/lib/python2.7/site-packages/' )
#py_pipeline_path = os.path.expanduser('~/programming/py_mbl_sequencing_pipeline')
#from IlluminaUtils.lib import fastalib
import datetime
today     = str(datetime.date.today())
#import subprocess



"""

"""
accepted_domains = ['bacteria','archaea','eukarya','fungi','organelle','unknown']          
ranks =['domain','phylum','klass','order','family','genus','species','strain']    
silva = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id','strain_id']
    
def start(args):
    global SEQ_COLLECTOR
    global DATASET_ID_BY_NAME
    global RANK_COLLECTOR
    global mysql_conn
   
    SEQ_COLLECTOR = {}
    DATASET_ID_BY_NAME = {}
    RANK_COLLECTOR={}
    
    logging.info('CMD> '+' '.join(sys.argv))
    print 'CMD> ',sys.argv
    
    (status1, msg1) = check_project(args)
    (status2, msg2, oid) = check_owner(args)
    if status2 == 'ERROR' and status1 == 'ERROR':
        print(msg1)
        print(msg2)
        sys.exit()
    elif status1 == 'ERROR':
        sys.exit(msg1)
    elif status2 == 'ERROR':
        sys.exit(msg2)
    args.oid = oid
    NODE_DATABASE = args.NODE_DATABASE
    
    #res = check_project()  ## script dies if project is in db
    q = "SELECT rank_id,rank from rank"
        
    args.cur.execute(q)
    
    rows = args.cur.fetchall()
    for row in rows:
        RANK_COLLECTOR[row[1]] = row[0]
    print RANK_COLLECTOR
    
    print('parsing file')
    parse_file( args )    
    
    print "starting taxonomy"
    push_taxonomy( args )
    
    print "starting sequences"
    push_sequences( args )
     
    print "projects"
    (args.pid, msg) = push_project( args )
    if args.pid == 0:
        sys.exit(msg)
    print 'PID:',args.pid  
          
    print "datasets"
    push_dataset( args )
        
    print "starting push_pdr_seqs"
    push_pdr_seqs( args )
         
def push_taxonomy(args):
    
    global SEQ_COLLECTOR
    global DATASET_ID_BY_NAME
    global RANK_COLLECTOR
    global mysql_conn
    
    print('in push tax')
    for ds in SEQ_COLLECTOR: 
        for seq in SEQ_COLLECTOR[ds]:  
                       
            tax_string  = SEQ_COLLECTOR[ds][seq]['taxonomy'] 
            tax_items   = tax_string.split(';')
            rank        = SEQ_COLLECTOR[ds][seq]['rank'] 
            seq_count   = SEQ_COLLECTOR[ds][seq]['count'] 
            distance    = SEQ_COLLECTOR[ds][seq]['distance'] 
            refhvr_ids  = SEQ_COLLECTOR[ds][seq]['refhvr_ids']             
        
            #print seq, seq_count, tax_string
    
    
            if rank == 'class':
                SEQ_COLLECTOR[ds][seq]['rank_id'] = RANK_COLLECTOR['klass']  
            else:
                SEQ_COLLECTOR[ds][seq]['rank_id'] = RANK_COLLECTOR[rank]         
      
            sumtax = ''
    
            for i in range(0,8):
        
                rank_id = RANK_COLLECTOR[ranks[i]]
                if len(tax_items) > i:            
                    taxitem = tax_items[i]            
                else:
                    taxitem = ranks[i]+'_NA'
        
                sumtax += taxitem+';'
               
    
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
                    print(q2)
                    args.cur.execute(q2)
                    mysql_conn.commit() 
                    tax_id = args.cur.lastrowid
                    if tax_id == 0:
                        q3 = "select "+rank_name+"_id from `"+rank_name+"` where `"+rank_name+"` = '"+t+"'"
                        print( q3 )
                        args.cur.execute(q3)
                        mysql_conn.commit() 
                        row = args.cur.fetchone()
                        tax_id=row[0]
                    ids_by_rank.append(str(tax_id))
                    #else:
                    #logging.info( 'rank_id,t,tax_id',rank_id,t,tax_id  )  
            
                    #ids_by_rank.append('1')
                print(  ids_by_rank )  
                q4 =  "INSERT ignore into silva_taxonomy ("+','.join(silva)+",created_at)"
                q4 += " VALUES("+','.join(ids_by_rank)+",CURRENT_TIMESTAMP())"
                #
                print(q4)
                #print q4
                args.cur.execute(q4)
                mysql_conn.commit() 
                silva_tax_id = args.cur.lastrowid
                if silva_tax_id == 0:
                    q5 = "SELECT silva_taxonomy_id from silva_taxonomy where ("
                    vals = ''
                    for i in range(0,len(silva)):
                        vals += ' '+silva[i]+"="+ids_by_rank[i]+' and'
                    q5 = q5 + vals[0:-3] + ')'
                    #print q5
                    print(q5)
                    args.cur.execute(q5)
                    mysql_conn.commit() 
                    row = args.cur.fetchone()
                    silva_tax_id=row[0]
                    #print 'silva_tax_id',silva_tax_id
        
                SEQ_COLLECTOR[ds][seq]['silva_tax_id'] = silva_tax_id
        
                 
def push_sequences(args):
    # sequences
    #print
    
    global SEQ_COLLECTOR
    global mysql_conn
    print
    for ds in SEQ_COLLECTOR:
        for seq in SEQ_COLLECTOR[ds]:
            q = "INSERT ignore into sequence (sequence_comp) VALUES (COMPRESS('%s'))" % (seq)
            
            print(q)
            args.cur.execute(q)
            mysql_conn.commit()
            seqid = args.cur.lastrowid
            if seqid == 0:
                q2 = "SELECT sequence_id from sequence where sequence_comp = COMPRESS('%s')" % (seq)
                print('DUP SEQ FOUND')
                args.cur.execute(q2)
                mysql_conn.commit() 
                row = args.cur.fetchone()
                seqid=row[0]
            print 'seqid',seqid
            SEQ_COLLECTOR[ds][seq]['sequence_id'] = seqid
            silva_tax_id = str(SEQ_COLLECTOR[ds][seq]['silva_tax_id'])
            
            #logging.info( ds,seq, silva_tax_id)
            rank_id = str(SEQ_COLLECTOR[ds][seq]['rank_id'])
            print 'rank_id',rank_id
            q = "INSERT ignore into silva_taxonomy_info_per_seq"
            if args.classifier == 'gast':
                distance = str(SEQ_COLLECTOR[ds][seq]['distance'])
                q += " (sequence_id,silva_taxonomy_id,gast_distance,refssu_id,rank_id)"
                q += " VALUES ('%s','%s','%s','0','%s')" % (str(seqid), str(silva_tax_id), distance, str(rank_id))
            else:
                q += " (sequence_id,silva_taxonomy_id,refssu_id,rank_id)"
                q += " VALUES ('%s','%s','0','%s')" % (str(seqid), str(silva_tax_id), str(rank_id))
            print(q)
            #print q
            args.cur.execute(q)
            mysql_conn.commit()
            silva_tax_seq_id = args.cur.lastrowid
            if silva_tax_seq_id == 0:
                q3 = "SELECT silva_taxonomy_info_per_seq_id from silva_taxonomy_info_per_seq"
                q3 += " where sequence_id = '"+str(seqid)+"'"                
                print 'DUP silva_tax_seq:',q3
                args.cur.execute(q3)
                mysql_conn.commit() 
                row = args.cur.fetchone()
                silva_tax_seq_id = row[0]
        
            q4 = "INSERT ignore into sequence_uniq_info (sequence_id, silva_taxonomy_info_per_seq_id)"
            q4 += " VALUES('%s','%s')" % (str(seqid), str(silva_tax_seq_id))
            print(q4)
            args.cur.execute(q4)
            mysql_conn.commit()
        ## don't see that we need to save uniq_ids
    mysql_conn.commit() 
    
def push_project(args):
    
    global mysql_conn
    desc = "Project Description"
    title = "Title"    
    rev = args.project[::-1]
    fund = "Unknown"    
    pub = 1 if args.public else 0
    
    fields = ['project','title','project_description','rev_project_name','funding','owner_user_id','public']
    q = "INSERT into project ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s','%s','%s','%s','%s')"
    q = q % (args.project,title,desc,rev,fund,args.oid,pub)
    print q
    
    #print cur.lastrowid
    pid = 0
    try:
        args.cur.execute(q)
        pid = args.cur.lastrowid
        
        mysql_conn.commit()
        msg = 'Success: project inserted'
    except:
        msg = 'Mysql Error Inserting project: '+q
    
    return (pid,msg)
    
def push_dataset(args):
      
    global DATASET_ID_BY_NAME
    global mysql_conn
    fields = ['dataset','dataset_description','project_id']
    q = "INSERT into dataset ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s')"

    for ds in SEQ_COLLECTOR:
        desc = ds+'_description'
        
        q4 = q % (ds, desc, args.pid)
        print(q4)
        
        #try:
        args.cur.execute(q4)
        did = args.cur.lastrowid
        print 'new did',did
        DATASET_ID_BY_NAME[ds] = did
        mysql_conn.commit()
        #except:
        #    print('ERROR: MySQL Integrity ERROR -- duplicate dataset')
        #    sys.exit('ERROR: MySQL Integrity ERROR -- duplicate dataset')
    
def push_pdr_seqs(args):
    #print
    gast_dbs = ['','','']

    global SEQ_COLLECTOR
    global DATASET_ID_BY_NAME
    global mysql_conn
    for ds in SEQ_COLLECTOR:
        for seq in SEQ_COLLECTOR[ds]:
            did = DATASET_ID_BY_NAME[ds]
            seqid = SEQ_COLLECTOR[ds][seq]['sequence_id']
            count = SEQ_COLLECTOR[ds][seq]['count']
            q = "INSERT into sequence_pdr_info (dataset_id, sequence_id, seq_count, classifier_id)"
            q += " VALUES ('%s','%s','%s','%s')"   

            print(q % (str(did), str(seqid), str(count), str(args.classid)))
            try:
                args.cur.execute(q % (str(did), str(seqid), str(count), str(args.classid)))
            except:
                print(q)
                print "ERROR Exiting: "+ds +"; Query: "+q % (str(did), str(seqid), str(count), str(args.classid))
                #print DATASET_ID_BY_NAME
                sys.exit()
            mysql_conn.commit() 
                        
def parse_file(args):
    global SEQ_COLLECTOR
    std_headers = ['refhvr_ids', 'Distance', 'Sequence', 'Rank', 'Taxonomy']
    # Typical header: refhvr_ids\tAB_SAND_Bv6--HS122\tAB_SAND_Bv6--HS123\tDistance\tSequence\tRank\tTaxonomy
    header_items = []
    
    if args.compressed:
        #with gzip.open(args.tax_by_seq_file, mode='r') as infile:
        print 'trying to open taxbyseq gzip file'
        f=gzip.open(args.tax_by_seq_file,'rb')
    else:
        #with open(args.tax_by_seq_file, mode='r') as infile:
        print 'trying to open taxbyseq text file'
        f=open(args.tax_by_seq_file,'rb')

    infile = f.readlines()
    
    for i,l in enumerate(infile):
        line_items = l.strip().split('\t')
        #print i,line_items
        if i == 0 and line_items[0] != 'TaxBySeq':
            sys.exit('This doesnt look like a TaxBySeq File from VAMPS -- Exiting')
        if line_items[0] == 'TaxBySeq':
            continue
        if line_items[0] == 'refhvr_ids':
            header_items = line_items
            #print header_items
            ds_order = []
            projects = {}
            for header in header_items:
                if header not in std_headers:
                    pjds = header
                    #print(pjds)
                    (pj,ds) = header.split('--')
                    ds_order.append(ds)
            continue
        
        #tax_collector[ds][tax]
        if not header_items:
            sys.exit('No headers: This doesn"t look like a TaxBySeq File' )
        
        #print len(line_items),len(std_headers),len(pjds_ary)
        if len(line_items) != (len(std_headers)+len(ds_order)):
            continue
        
        refhvrids = line_items[0]
        distance  = line_items[len(ds_order)+1]
        seq       = line_items[len(ds_order)+2]
        rank      = line_items[len(ds_order)+3]
        tax       = line_items[len(ds_order)+4]
        
        
        for i,ds in enumerate(ds_order):
            count = int(line_items[1+i])
            if ds not in SEQ_COLLECTOR:
                SEQ_COLLECTOR[ds] = {}
            SEQ_COLLECTOR[ds][seq] = {'dataset':ds,
                          'taxonomy':tax,
                          'refhvr_ids':refhvrids,
                          'rank':rank,
                          'count':count,
                          'distance':distance
                          }
            if rank == 'class':
                SEQ_COLLECTOR[ds][seq]['rank_id'] = RANK_COLLECTOR['klass']  
            else:
                SEQ_COLLECTOR[ds][seq]['rank_id'] = RANK_COLLECTOR[rank]     
               


def check_project(args):
    """
    check_project()
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    
    q = "SELECT project from project WHERE project='%s'" % (args.project)
    args.cur.execute(q)
    if args.cur.rowcount > 0:
        return ('ERROR','Duplicate project name: '+q)
    return ('OK','')
        
def check_owner(args):
    """
    check_owner()
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    
    q = "SELECT username, user_id from user WHERE username='%s'" % (args.owner)
    args.cur.execute(q)
    if args.cur.rowcount == 0:
        return ('ERROR','Owner Not Found: '+args.owner, 0)
    row = args.cur.fetchone()
    return ('OK','',row[1])



if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: load_tax_by_seq_file.py  [options]
         
         
            
            -infile/--infile
            -p/--project
            -o/--owner            
            -db/--NODE_DATABASE
            -site/--site   
            
            Optional:
            -comp/--compressed                  
            -pub/--public         defaults to False
            -cid/--classifier_id   See classifier table in vamps; defaults to '9' unknown
            
    """
    parser = argparse.ArgumentParser(description="", usage=myusage)                 
    
    parser.add_argument('-infile', '--infile',         
                required=True,   action="store",  dest = "tax_by_seq_file",            
                help = '')                              
    parser.add_argument("-p", "--project", 
    			required=True,  action='store', dest = "project", 
    			help="")
    parser.add_argument("-pub", "--public",        
    			required=False,  action='store_true', dest = "public",  default=False, # default: private
    			help="")
    parser.add_argument("-o", "--owner",        
    			required=True,  action='store', dest = "owner",  default=False, 
    			help="")
    parser.add_argument('-db', '--NODE_DATABASE',         
                required=False,   action="store",  dest = "NODE_DATABASE", default='vamps_development',           
                help = 'node database') 
    parser.add_argument('-cid', '--clssifier_id',         
                required=False,   action="store",  dest = "classid",   default=9,  # unknown            
                help = 'classifier_id') 
    parser.add_argument('-comp', '--compressed', required=False,   action="store_true",  dest = "compressed",  
                help = '')
    parser.add_argument('-site', '--site',         
                required=True,   action="store",  choices=['vamps', 'vampsdev', 'localhost'], dest = "site",  default='localhost', 
                help = '')
    args = parser.parse_args() 
    
    if len(sys.argv[1:])==0:
        print(myusage)
        sys.exit()
    args.datetime     = str(datetime.date.today()) 
       
    print "ARGS: dbhost  =",args.site
    if args.site == 'vamps':
        args.json_file_path = '/groups/vampsweb/vamps_node_data/json'
        args.NODE_DATABASE = 'vamps2'
        args.dbhost = 'vampsdb'
    elif args.site == 'vampsdev':
        args.json_file_path = '/groups/vampsweb/vampsdev_node_data/json'
        args.NODE_DATABASE = 'vamps2'
        args.dbhost = 'bpcweb7'
    else:
        args.json_file_path = '../../json'  # run from the maintenance_scripts dir
        args.NODE_DATABASE = args.NODE_DATABASE
        args.dbhost = 'localhost'
    
    if os.path.exists(args.json_file_path):
        print 'Validated: json file path'
    else:
        print "Could not find json directory: '",args.json_file_path,"'-Exiting"
        sys.exit(-1)
    print "ARGS: json_dir=",args.json_file_path 


    args.ref_db_dir = 'none'   
    args.classifier = 'gast' 
    args.input_type = 'tax_by_seq' 
    args.datetime     = str(datetime.date.today())    
    
    mysql_conn = MySQLdb.connect(host=args.dbhost, # your host, usually localhost
                          db = args.NODE_DATABASE,
                          read_default_file=os.path.expanduser("~/.my.cnf_node")  )
    
    args.cur = mysql_conn.cursor()
    start(args)

    print 'Done; PID =',args.pid
    
        
    
