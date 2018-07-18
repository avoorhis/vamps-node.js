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

import datetime
import logging
today = str(datetime.date.today())
import subprocess
import pymysql as MySQLdb
import pprint
pp = pprint.PrettyPrinter(indent=4)


# Global:
 # SUMMED_TAX_COLLECTOR[ds][rank][tax_string] = count

ranks =['domain','phylum','klass','order','family','genus','species','strain']
matrix_taxa_ids = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id','strain_id']
#accepted_domains = ['bacteria','archaea','eukarya','fungi','organelle','unknown']
# ranks =[{'name':'domain', 'id':1,'num':0},
#         {'name':'phylum', 'id':4,'num':1},
#         {'name':'klass',  'id':5,'num':2},
#         {'name':'order',  'id':6,'num':3},
#         {'name':'family', 'id':8,'num':4},
#         {'name':'genus',  'id':9,'num':5},
#         {'name':'species','id':10,'num':6},
#         {'name':'strain', 'id':11,'num':7}]


def start(args):
    
    global SEQ_COLLECTOR
    global DATASET_ID_BY_NAME
    global GENERIC_IDS_BY_TAX
    global RANK_COLLECTOR
    global TAX_ID_BY_RANKID_N_TAX
    global SUMMED_TAX_COLLECTOR
    
    SEQ_COLLECTOR = {}
    DATASET_ID_BY_NAME = {}
    GENERIC_IDS_BY_TAX = {}
    RANK_COLLECTOR={}
    TAX_ID_BY_RANKID_N_TAX = {}
    SUMMED_TAX_COLLECTOR = {} 
    logging.info('CMD> '+' '.join(sys.argv))
    #print ('CMD> ',sys.argv)

    NODE_DATABASE = args.NODE_DATABASE

    
    
    
    global mysql_conn, cur    
   
    os.chdir(args.project_dir)
    if args.host == 'vamps' or args.host == 'vampsdb' or args.host == 'bpcweb8':
        hostname = 'vampsdb'
    elif args.host == 'vampsdev' or args.host == 'bpcweb7':
        hostname = 'bpcweb7'
    else:
        hostname = 'localhost'
        args.NODE_DATABASE = 'vamps_development'
        
    mysql_conn = MySQLdb.connect(db = args.NODE_DATABASE, host=hostname, read_default_file=os.path.expanduser("~/.my.cnf_node")  )
    # socket=/tmp/mysql.sock
    cur = mysql_conn.cursor()
    
    
    #logging.info("running get_config_data")
    #print ("running get_config_data")
    #get_config_data(args.project_dir)
    
    logging.info("checking user")
    print ("checking user")
    args.user_id = check_user()  ## script dies if user not in db
    
    logging.info("checking project")
    print ("checking project")
    check_project()  ## script dies if project is in db
        
    logging.info("recreating ranks")
    print ("recreating ranks")
    recreate_ranks()  # this is only needed on 'new' databases.

    logging.info("Parsing Matrix File")
    print("Parsing Matrix File")
    args.tax_data_by_ds = parse_matrix_file()

    logging.info("classifier")
    print ("classifier")
    args.classid = create_classifier()

    
    logging.info("projects")
    print ("projects")
    args.pid = push_project()

    logging.info("datasets")
    print ("datasets")
    push_dataset()

    logging.info("starting taxonomy")
    print ("starting taxonomy")
    push_taxonomy(args)
    
    logging.info("starting taxonomy_info")
    print ("starting taxonomy_info")
    push_taxonomy_info(args)
    


    logging.info("Finished "+os.path.basename(__file__))
    print ("Finished "+os.path.basename(__file__))
    print (args.pid)
    print ('Writing pid to pid.txt')
    fp = open(os.path.join(args.project_dir,'pid.txt'),'w')
    fp.write(str(args.pid))
    fp.close()

    return args.pid
        
    
def check_user():
    """
    check_user()
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    
    global mysql_conn, cur
    q = "select user_id from user where username='%s'" % (args.user) 
    if args.verbose:
        print(q)
    cur.execute(q)
    numrows = int(cur.rowcount)
    if numrows==0:
        sys.exit('Could not find owner: '+args.user+' --Exiting')
    row = cur.fetchone()
    return row[0]

def check_project():
    """
    check_project()
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    
    global mysql_conn, cur
    q = "SELECT project_id from `project` WHERE project='%s'" % (args.project)
    if args.verbose:
        print(q)
    cur.execute(q)
    if cur.rowcount > 0:
        row = cur.fetchone()
        print('ERR***'+str(row[0])+'-'+args.project)
        sys.exit('Duplicate project name:(id='+str(row[0])+') '+q)
           
def parse_matrix_file():
    ifile = open(args.infile, 'r')
    reader = csv.reader(ifile,delimiter='\t')
    n=0
    tax_data_by_ds = {}  # tax_data[ds][tax] = count 
    temp = {}
    for row in reader:
        if not row:
            continue
        if len(row) == 1:
            print('File delimiter expected to be a <tab>')
            sys.exit('File delimiter expected to be a <tab>')
        if n==0:
            # May or may not be text in row1;col1
            datasets = row[1:]
            uniques = list(set(datasets))
            if len(datasets) != len(uniques):
                sys.exit("datasets are not unique")
            for ds in datasets:
                tax_data_by_ds[ds] = {}
            #print(datasets)
            #print(datasets)
            
                     
        else:
            raw_tax_string = row[0]
            # cleanup
            # Bacteria;AD3;JG37-AG-4;;family_NA;genus_NA;species_NA  # order is omited!
            tax_array =raw_tax_string.split(';')
            temp = []
            for i,val in enumerate(tax_array):
                if val == '':
                    temp.append(ranks[i]+'_NA')
                else:
                    temp.append(val.strip(']').strip('[').strip('"'))
                    
            print('temp')
            print(temp)
            tax_array = temp
            #tax_array = [value for value in raw_tax_string.split(';') if value != '']
            counts = row[1:]
            
            if len(datasets) != len(counts):
                sys.exit("Row"+str(n)+": number of counts don't equal number of datasets") 
            for m,cnt in enumerate(counts):
                tax = ';'.join(tax_array)
                if args.verbose:
                    print(tax,cnt)
                if tax in tax_data_by_ds[datasets[m]]:  # in case of duplicate tax names: add counts
                    try:
                        tax_data_by_ds[datasets[m]][tax] += int(cnt)
                    except:
                        pass
                else:
                    try:
                        tax_data_by_ds[datasets[m]][tax] = int(cnt)
                    except:
                        tax_data_by_ds[datasets[m]][tax] = 0
                        
        n += 1
    # for ds in tax_data_by_ds:
#         print(len(tax_data_by_ds[ds]))
#     sys.exit()
    return tax_data_by_ds
    
        

def create_classifier():
    global mysql_conn, cur
    q = "SELECT classifier_id from `classifier` where classifier = 'unknown'"
    cur.execute(q)
    row = cur.fetchone()
    mysql_conn.commit()
    return row[0]
    
    
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
    
    global mysql_conn, cur
    desc = "Project Description"
    title = "Title"
    rev = args.project[::-1]
    fund = "Unknown"
    pub = 0  # private
    fields = ['project','title','project_description','rev_project_name','funding','owner_user_id','public','matrix','active']
    q = "INSERT into project ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s','%s','%s','%s','%s','%s','%s')"
    q = q % (args.project,title,desc,rev,fund,args.user_id,pub,'1','1')
    if args.verbose:
        print(q)
    logging.info(q)
    
    try:
        cur.execute(q)
        args.pid = cur.lastrowid
        logging.info("PID="+str(args.pid))
        print("PID="+str(args.pid))
        mysql_conn.commit()
        #print cur.lastrowid
    except:
        #print('ERROR: MySQL Integrity ERROR -- duplicate project name: '+proj)
        #sys.exit('ERROR: MySQL Integrity ERROR -- duplicate dataset: '+proj)
        return ('ERROR: Duplicate Project Name2: '+q)
    
    return args.pid
        
def push_dataset():
      
    global DATASET_ID_BY_NAME
    global mysql_conn, cur
    fields = ['dataset','dataset_description','project_id']
    q = "INSERT into dataset ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s')"

    for ds in args.tax_data_by_ds.keys():
        desc = ds+'_description'
        
        q4 = q % (ds, desc, args.pid)
        logging.info(q4)
        if args.verbose:
            print (q4)

        cur.execute(q4)
        did = cur.lastrowid
        #print ('new did',did)
        DATASET_ID_BY_NAME[ds] = did
        mysql_conn.commit()    

def push_taxonomy(args):
    
    global SUMMED_TAX_COLLECTOR
    global mysql_conn, cur
    print('Starting finish_tax per dataset per tax')
    for ds in args.tax_data_by_ds.keys():
        #print('ds:'+ds)
        for tax in args.tax_data_by_ds[ds]:
            
            #(rank,rank_id) = get_rank_from_tax_string(tax)
            seq_count = args.tax_data_by_ds[ds][tax]
            finish_tax(ds, seq_count, tax)

def push_taxonomy_info(args):  # was push_sequences
    
    global DATASET_ID_BY_NAME
    if args.verbose:
        print(DATASET_ID_BY_NAME)
        print(GENERIC_IDS_BY_TAX)
    global mysql_conn, cur
    for ds in args.tax_data_by_ds:
        for tax in args.tax_data_by_ds[ds]:
            # did, tax_id, rank_id
            did = DATASET_ID_BY_NAME[ds]
            tax_id = GENERIC_IDS_BY_TAX[tax]
            seq_count = args.tax_data_by_ds[ds][tax]
            (rank, rank_id) = get_rank_from_tax_string(tax)
            q = "INSERT ignore into matrix_taxonomy_info"            
            q += " (dataset_id, generic_taxonomy_id, seq_count, rank_id)"
            q += " VALUES ('%s','%s','%s','%s')" % (str(did), str(tax_id), str(seq_count), str(rank_id))
            if args.verbose:
                print(q)
            if rank:
                cur.execute(q)
                mysql_conn.commit()
            
    mysql_conn.commit()
    
#
#
#
def get_rank_from_tax_string(tax):
    tax_items = tax.split(';')
    if args.verbose:
        print(tax_items)
    if 1 <= len(tax_items) <= 8:
        rank =  ranks[len(tax_items) - 1]  #string
        rank_id = RANK_COLLECTOR[rank]
        return (rank,rank_id)
    else:
        return ('',0)



            
def finish_tax(ds,  seq_count, tax_string):
    #tax_collector = {} 
    
    #print('IN finish_tax')
    #print(ds, rank, seq_count, tax_items)
    
    global DATASET_ID_BY_NAME
    global GENERIC_IDS_BY_TAX
    global RANK_COLLECTOR
    global TAX_ID_BY_RANKID_N_TAX
    global SUMMED_TAX_COLLECTOR
    global mysql_conn, cur
    tax_items = tax_string.split(';')
         
    if ds not in SUMMED_TAX_COLLECTOR:
        SUMMED_TAX_COLLECTOR[ds]={}
    #print seq, seq_count, tax_string
    
    
   
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
    
    #if tax_items[0].lower() in accepted_domains:
    ids_by_rank = []
    for i in range(0,8):
        #print i,len(tax_items),tax_items[i]
        rank_name = ranks[i]
        rank_id = RANK_COLLECTOR[ranks[i]]
        
        if len(tax_items) > i:
            if ranks[i] == 'species':
                t = tax_items[i].lower().replace('"','').replace("'",'')
            else:
                t = tax_items[i].capitalize().replace('"','').replace("'",'')
            
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
        if args.verbose:
            print(q2)
        cur.execute(q2)
        mysql_conn.commit() 
        tax_id = cur.lastrowid
        if tax_id == 0:
            q3 = "SELECT "+rank_name+"_id from `"+rank_name+"` where `"+rank_name+"` = '"+t+"'"
            logging.info(q3)
            if args.verbose:
                print(q3)
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
    q4 =  "INSERT ignore into generic_taxonomy ("+','.join(matrix_taxa_ids)+",created_at)"
    q4 += " VALUES("+','.join(ids_by_rank)+",CURRENT_TIMESTAMP())"
    #
    logging.info(q4)
    if args.verbose:
        print (q4)
    cur.execute(q4)
    mysql_conn.commit() 
    tax_id = cur.lastrowid
    if tax_id == 0:
        q5 = "SELECT generic_taxonomy_id from generic_taxonomy where ("
        vals = ''
        for i in range(0,len(matrix_taxa_ids)):
            vals += ' '+matrix_taxa_ids[i]+"="+ids_by_rank[i]+' and'
        q5 = q5 + vals[0:-3] + ')'
        if args.verbose:
            print (q5)
        cur.execute(q5)
        mysql_conn.commit() 
        row = cur.fetchone()
        tax_id=row[0]
        if args.verbose:
            print ('generic_tax_id',tax_id)
    
    GENERIC_IDS_BY_TAX[tax_string] = tax_id
        
        

if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: vamps_script_database_loader.py  [options]
         
       uploads matrix to new vamps  
         where
            
            -d/--project_dir   This is the base directory where matrix file is located.
            -i/--in             infile - matrix file (no path)
            -host/--host        vampsdb, or vampsdev or localhost
            -p/--project        project
            -u/--user           vamps user
                            

"""

    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
    
    
    parser.add_argument('-db', '--NODE_DATABASE',         
                required=False,   action="store",  dest = "NODE_DATABASE",  default='vamps2',          
                help = 'node database') 
    parser.add_argument("-i", "--in",    
                required=True,  action="store",   dest = "infile", default='unknown',
                help = 'no path: filename')
    parser.add_argument("-p", "--project",    
                required=True,  action="store",   dest = "project", 
                help = 'no path: project name')     
    parser.add_argument("-d", "--project_dir",    
                required=True,  action="store",   dest = "project_dir", 
                help = 'path')         
    parser.add_argument("-host", "--host",    
                required=False,  action="store",   dest = "host", default='bpcweb7',
                help = '')
    parser.add_argument("-u", "--user",    
                required=True,  action="store",   dest = "user", 
                help = 'vamps user name')
    parser.add_argument("-v", "--verbose",    
                required=False,  action="store",   dest = "verbose",  default=False,
                help = 'chatty')            
    args = parser.parse_args() 
    
    pid = start(args)
    # keep this as print('done pid',pid) for routes_user_data
    print('done pid',pid)
    
    
    
