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
from copy import deepcopy
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
std_tax_ids = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id','strain_id']
    
def start(args):
    global OTU_COLLECTOR
    global OTU_COUNT
    global TAXONOMY
    global DATASET_ID_BY_NAME
    global RANK_COLLECTOR
    global mysql_conn
    RANK_COLLECTOR = {}
    OTU_COLLECTOR = {}
    DATASET_ID_BY_NAME = {}
    OTU_COUNT = {}
    
    
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
    
    q = "SELECT rank_id, rank from rank"
    args.cur.execute(q)
    rows = args.cur.fetchall()
    for row in rows:
        RANK_COLLECTOR[row[1]] = row[0]
    print RANK_COLLECTOR
   
    
    print('parsing file')
    args.taxonomy = parse_file( args )    
    
    if args.taxonomy:
        push_taxonomy( args )
    
    
    
    #print "starting taxonomy"
    #
    
    #print "starting sequences"
    #push_sequences( args )
    
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
    
    global OTU_COLLECTOR
    global DATASET_ID_BY_NAME
    global TAXONOMY
    global RANK_COLLECTOR
    global mysql_conn
    
    print('in push tax')
    for ds in OTU_COLLECTOR: 
        for otu in OTU_COLLECTOR[ds]:  
                       
            tax_string  = TAXONOMY[otu] 
            tax_items   = tax_string.split(';')
            rank_index = len(tax_items)-1
            rank_name = ranks[rank_index]
            print 'rank',rank_index, rank_name
            count   = OTU_COLLECTOR[ds][otu]['count'] 
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
                    print 'rows affected',args.cur.rowcount
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
                q4 =  "INSERT ignore into otu_taxonomy ("+','.join(std_tax_ids)+",created_at)"
                q4 += " VALUES("+','.join(ids_by_rank)+",CURRENT_TIMESTAMP())"
                #
                print(q4)
                #print q4
                args.cur.execute(q4)
                mysql_conn.commit() 
                otu_tax_id = args.cur.lastrowid
                if otu_tax_id == 0:
                    q5 = "SELECT otu_taxonomy_id from otu_taxonomy where ("
                    vals = ''
                    for i in range(0,len(std_tax_ids)):
                        vals += ' '+std_tax_ids[i]+"="+ids_by_rank[i]+' and'
                    q5 = q5 + vals[0:-3] + ')'
                    #print q5
                    print(q5)
                    args.cur.execute(q5)
                    mysql_conn.commit() 
                    row = args.cur.fetchone()
                    otu_tax_id=row[0]
                    
        
                OTU_COLLECTOR[ds][otu]['otu_tax_id'] = otu_tax_id
                
def push_project(args):
    
    global mysql_conn
    desc = "Project Description"
    title = "Title"    
    rev = args.project[::-1]    
    pub = 1 if args.public else 0
    
    fields = ['otu_project','title','project_description','rev_project_name','owner_user_id','public','otu_size','method','ds_count','otu_count']
    q = "INSERT into otu_project ("+(',').join(fields)+")"
    place_holders = "','".join(["%s" for n in fields])
    q += " VALUES('"+place_holders+"')"
    ds_count  = len(OTU_COLLECTOR)
    otu_count = len(OTU_COUNT)
    q = q % (args.project,title,desc,rev,args.oid,pub,args.otu_size,args.otu_method,ds_count,otu_count)
    print q
    
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
    
    fields = ['otu_dataset','dataset_description','otu_project_id']
    q = "INSERT into otu_dataset ("+(',').join(fields)+")"
    place_holders = "','".join(["%s" for n in fields])
    q += " VALUES('"+place_holders+"')"

    for ds in OTU_COLLECTOR:
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

    global OTU_COLLECTOR
    global DATASET_ID_BY_NAME
    global mysql_conn
    print DATASET_ID_BY_NAME
    for ds in OTU_COLLECTOR:
        for otu in OTU_COLLECTOR[ds]:
            did = DATASET_ID_BY_NAME[ds]
            count = OTU_COLLECTOR[ds][otu]['count']
            if args.taxonomy:
                tax_id = str(OTU_COLLECTOR[ds][otu]['otu_tax_id'])
            else:
                tax_id = "Null"  # null
            q = "INSERT into otu_pdr_info (otu_dataset_id, otu_label, count, otu_taxonomy_id)"
            q += " VALUES ('%s', '%s', '%s', %s)"   # IMPORTANT for nulls (no taxomomy) do not put quotes around last %s  

            print(q % ( str(did), otu, str(count), tax_id ))
            try:
                args.cur.execute(q % (str(did), otu, str(count), tax_id ))
            except:
                print(q)
                print "ERROR Exiting: "+ds +"; Query: "+q % (str(did), otu, str(count), tax_id )
                #print DATASET_ID_BY_NAME
                sys.exit()
            mysql_conn.commit() 
                        
def parse_file(args):
    global OTU_COLLECTOR
    global TAXONOMY
    std_headers = ['Cluster ID', 'ClusterID','OTU']
    #ignore_columns = ['Rank','Min_GDist','Avg_GDist','Total','Count']  
    # Typical header: refhvr_ids\tAB_SAND_Bv6--HS122\tAB_SAND_Bv6--HS123\tDistance\tSequence\tRank\tTaxonomy
    header_items = []
    TAXONOMY = {}
    
    if args.compressed:
        #with gzip.open(args.tax_by_seq_file, mode='r') as infile:
        print 'trying to open matrix gzip file'
        f=gzip.open(args.matrix_file,'rb')
    else:
        #with open(args.tax_by_seq_file, mode='r') as infile:
        print 'trying to open matrix text file'
        f=open(args.matrix_file,'rb')

    infile = f.readlines()
    
    for i,l in enumerate(infile):
        line_items = l.strip().split('\t')
        #print i,line_items
        
        if i == 0 and line_items[0] not in std_headers:
            sys.exit('This doesnt look like a Matrix or OTU file -- Exiting')
        
        if i == 0:
            if args.source == 'tax1':
                taxonomy_index = 0
                taxonomy = True
                ds_order = line_items[1:]
            elif args.source == 'tax2':
                taxonomy_index = 1
                taxonomy = True
                ds_order = line_items[2:]
            elif args.source == 'slp':
                taxonomy_index = 1
                taxonomy = True
                ds_order = line_items[7:]
                ds_order = [x.split(';')[1] for x in ds_order]
            elif args.source == 'tax_end':
                taxonomy_index = len(line_items)-1
                taxonomy = True
                ds_order = line_items[1:-1]
            else:
                taxonomy = False
                ds_order = line_items[1:]
            if taxonomy:
                print 'Using Taxonomy Column at Index =',taxonomy_index
            else:
                print 'No Taxonomy'
            continue            
        #print 'dataset order:',ds_order
        #print line_items
        otu_name = line_items[0]
        OTU_COUNT[otu_name] = 1
        #count_list = deepcopy(line_items)
        
        if args.source == 'tax1':
            count_list = line_items[1:]
        elif args.source == 'tax2':            
            count_list = line_items[2:]
        elif args.source == 'slp':            
            count_list = line_items[7:]            
        elif args.source == 'tax_end':            
            count_list = line_items[1:-1]
        else:            
            count_list = line_items[1:]
            
        if taxonomy:
            if otu_name in TAXONOMY:
                sys.exit('OTU names are not unique- Exiting')
            else:
                TAXONOMY[otu_name] = line_items[taxonomy_index]
        #print otu_name,count_list
        
        for i,ds in enumerate(ds_order):
            ds = ds.replace(';','-').replace(',','-')
            count = int(count_list[i])
            if ds not in OTU_COLLECTOR:
                OTU_COLLECTOR[ds] = {}
                if otu_name not in OTU_COLLECTOR[ds]:
                    OTU_COLLECTOR[ds][otu_name] = {}
            else:
                if otu_name not in OTU_COLLECTOR[ds]:
                    OTU_COLLECTOR[ds][otu_name] = {}
            OTU_COLLECTOR[ds][otu_name]['count'] = count
              
    #for ds in OTU_COLLECTOR:
    #    print ds,OTU_COLLECTOR[ds]
    #print 'TAX OBJ',TAXONOMY
    
    return taxonomy
    
def check_project(args):
    """
    check_project()
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    
    q = "SELECT otu_project from otu_project WHERE otu_project='%s'" % (args.project)
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
    
def connect_mysql(args):
    print "ARGS: dbhost  =",args.host
    if args.host == 'vamps' or args.host == 'vampsdb' or args.host == 'bpcweb8':
        args.json_file_path = '/groups/vampsweb/vamps_node_data/json'
        args.NODE_DATABASE = 'vamps2'
        args.dbhost = 'vampsdb'
    elif args.host == 'vampsdev' or args.host == 'bpcweb7':
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

      
    
    mysql_conn = MySQLdb.connect(host=args.dbhost, # your host, usually localhost
                          db = args.NODE_DATABASE,
                          read_default_file=os.path.expanduser("~/.my.cnf_node")  )
    return mysql_conn

def delete(args):

    print 'in delete'
    
    # get dids
    q = "SELECT otu_dataset_id from otu_dataset where otu_project_id='"+args.pid+"'"
    args.cur.execute(q)
    rows = args.cur.fetchall()
    id_list = []
    for row in rows:
        id_list.append(str(row[0]))
    sql_list = "','".join(id_list)
    print sql_list
    
    q= "delete from otu_pdr_info where otu_dataset_id in('"+sql_list+"')"
    print(q)
    
    args.cur.execute(q)
    print 'rows affected',args.cur.rowcount
    mysql_conn.commit() 
    q= "delete from otu_dataset where otu_dataset_id in('"+sql_list+"')"
    print(q)
    args.cur.execute(q)
    print 'rows affected',args.cur.rowcount
    mysql_conn.commit() 
    q= "delete from otu_project where otu_project_id ='"+args.pid+"'"
    print(q)
    args.cur.execute(q)
    print 'rows affected',args.cur.rowcount
    mysql_conn.commit() 

if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: ./load_matrix_csv_file.py  [options]
         
         Loads a matrix or OTU text file
            
            -i/--infile
            -p/--project                       
            -db/--NODE_DATABASE  default='vamps_development' for localhost; vamps2 otherwise
            -host/--host  localhost, vamps or vampsdev
            -s/--source_file_type tax0, tax1, tax_end, slp
                tax1    taxonomy present in first col (taxonomy will be used as OTU name)
                tax2    taxonomy present in second col (OTU name in first col)
                tax_end taxonomy present in last col
                slp     special SLP OTU format
                none    No taxonomy; Just OTU name in first col and datasets (with counts) in subsequent cols
             
            
            Delete OTU:
            -del/--delete 
            -pid/--pid   
            
            Optional:
            -comp/--compressed    defaults to uncompressed              
            -pub/--public         defaults to False
            -o/--owner            defaults to admin
            -size/--size    3     default: none
            -method/--method  slp default: none
            
            
    """
    parser = argparse.ArgumentParser(description="", usage=myusage)                 
    
    parser.add_argument('-i', '--infile',         
                required=False,   action="store",  dest = "matrix_file",            
                help = '')                              
    parser.add_argument("-p", "--project", 
    			required=False,  action='store', dest = "project", 
    			help="")
    parser.add_argument("-pub", "--public",        
    			required=False,  action='store_true', dest = "public",  default=False, # default: private
    			help="")
    parser.add_argument("-size", "--size",        
    			required=False,  action='store', dest = "otu_size",  default='', 
    			help="VAMPS Username")
    parser.add_argument('-method', '--method',         
                required=False,   action="store",  dest = "otu_method", default='',           
                help = 'node database') 			
    parser.add_argument("-o", "--owner",        
    			required=False,  action='store', dest = "owner",  default='admin', 
    			help="VAMPS Username")
    parser.add_argument('-db', '--NODE_DATABASE',         
                required=False,   action="store",  dest = "NODE_DATABASE", default='vamps_development',           
                help = 'node database') 
    parser.add_argument('-cid', '--clssifier_id',         
                required=False,   action="store",  dest = "classid",   default=9,  # unknown            
                help = 'classifier_id') 
    parser.add_argument('-comp', '--compressed', required=False,   action="store_true",  dest = "compressed",  
                help = '')
    parser.add_argument('-host', '--host',         
                required=True,   action="store",   dest = "host", 
                help = '')
    parser.add_argument('-s', '--source_file_type',         
                required=False,   action="store",   dest = "source",   # tax1, tax2, tax_end, slp, none
                help = '')
    parser.add_argument('-del', '--delete',         
                required=False,   action="store_true",   dest = "delete", 
                help = '')
    parser.add_argument('-pid', '--pid',         
                required=False,   action="store",   dest = "pid", 
                help = '')
    args = parser.parse_args() 
    
    if len(sys.argv[1:])==0:
        print(myusage)
        sys.exit()
    args.datetime     = str(datetime.date.today()) 
    
    mysql_conn = connect_mysql(args)
    args.cur = mysql_conn.cursor()
    if args.delete:
        if not args.pid:
            sys.exit('need matrix or OTU pid to delete')
        else:
            
            delete(args)
        sys.exit()
    
    if not args.matrix_file:
        print(myusage)
        sys.exit('need infile (-i)') 
    if not args.project:
        print(myusage)
        sys.exit('need project (-p)') 
    if not args.source:
        print(myusage)
        sys.exit('need source type (-s)')    
    
    if args.source not in ['tax1','tax2','tax_end','slp','none']:
        sys.exit('Error: -source not in "tax1, tax2, tax_end, slp, none"')   
    #mysql_conn = connect_mysql(args)
    #args.cur = mysql_conn.cursor()
    
    args.ref_db_dir = 'none'   
    args.classifier = 'unknown' 
    args.input_type = 'matrix' 
    
    start(args)

    print 'Done; PID =',args.pid
    
 
