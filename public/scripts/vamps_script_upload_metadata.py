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
import csv
from time import sleep
import ConfigParser
#sys.path.append( '/bioware/python/lib/python2.7/site-packages/' )

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
DATASET_ID_BY_NAME = {}
REQ_METADATA_ITEMS = {}
CUST_METADATA_ITEMS = {}

required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "public","taxon_id","description","common_name"];

#test = ('434','0','y','1/27/14','0','GAZ:Canada','167.5926056','ENVO:urban biome','ENVO:human-associated habitat','ENVO:feces','43.119339','-79.2458198','y',
#'408170','human gut metagenome','American Gut Project Stool sample')
#test7 = ('434','ENVO:urban biome','ENVO:human-associated habitat','ENVO:feces','43.119339','-79.2458198','y')

db = MySQLdb.connect(host="localhost", # your host, usually localhost
                         read_default_file="~/.my.cnf"  ) 
cur = db.cursor()

def start(args):
    NODE_DATABASE = args.NODE_DATABASE
    indir = args.basedir
    cur.execute("USE "+NODE_DATABASE)
    get_config_data(indir)
    get_metadata(indir)
    put_required_metadata()
    put_custom_metadata()
    #print CONFIG_ITEMS
    print REQ_METADATA_ITEMS
    print
    print CUST_METADATA_ITEMS
    
def put_required_metadata():
    
    q = "INSERT into required_metadata_info (dataset_id,"+','.join(required_metadata_fields)+")"
    q = q+" VALUES("
    
    for i,did in enumerate(REQ_METADATA_ITEMS['dataset_id']):
        vals = "'"+str(did)+"',"
        
        for item in required_metadata_fields:
            vals += "'"+str(REQ_METADATA_ITEMS[item][i])+"',"
        q2 = q + vals[:-1] + ")"  
        print q2
        logging.info(q2)
        cur.execute(q2)
    db.commit()
            
            
def put_custom_metadata():
    """
      create new table
    """
    print 'starting put_custom_metadata'
    # TABLE-1 === custom_metadata_fields
    print 'CUST_METADATA_ITEMS',CUST_METADATA_ITEMS
    print 'REQ_METADATA_ITEMS',REQ_METADATA_ITEMS
    for key in CUST_METADATA_ITEMS:
        logging.debug(key)
        q2 = "INSERT IGNORE into custom_metadata_fields(project_id,field_name,field_type,example)"
        q2 += " VALUES("
        q2 += "'"+str(CONFIG_ITEMS['project_id'])+"',"
        q2 += "'"+key+"',"
        q2 += "'varchar(128)',"
        q2 += "'"+str(CUST_METADATA_ITEMS[key][0])+"')"
        logging.info(q2)
        cur.execute(q2)
    
    # TABLE-2 === custom_metadata_<pid>
    cust_keys_array = CUST_METADATA_ITEMS.keys()
    custom_table = 'custom_metadata_'+str(CONFIG_ITEMS['project_id'])
    q = "CREATE TABLE IF NOT EXISTS `"+ custom_table + "` (\n"
    q += " `"+custom_table+"_id` int(10) unsigned NOT NULL AUTO_INCREMENT,\n"
    q += " `project_id` int(11) unsigned NOT NULL,\n"
    q += " `dataset_id` int(11) unsigned NOT NULL,\n"
    for key in cust_keys_array:
        if key != 'dataset_id':
            # 2015-07-23 Changed the field type to text to accomidate longer metadata
            # limit to 1000 chars below (line 143)
            #q += " `"+key+"` varchar(128) NOT NULL,\n" 
            q += " `"+key+"` text NOT NULL,\n"
    q += " PRIMARY KEY (`"+custom_table+"_id` ),\n" 
    unique_key = "UNIQUE KEY `unique_key` (`project_id`,`dataset_id`,"
    
    # ONLY 16 key items allowed:    
 #   for i,key in enumerate(cust_keys_array):
 #       if i < 14 and key != 'dataset_id':
  #          unique_key += " `"+key+"`,"
 #   q += unique_key[:-1]+"),\n"
    q += " KEY `project_id` (`project_id`),\n"
    q += " KEY `dataset_id` (`dataset_id`),\n"
    q += " CONSTRAINT `"+custom_table+"_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON UPDATE CASCADE,\n"
    q += " CONSTRAINT `"+custom_table+"_ibfk_2` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`dataset_id`) ON UPDATE CASCADE\n"
    q += " ) ENGINE=InnoDB DEFAULT CHARSET=latin1;"
    logging.info(q)
    cur.execute(q)
    
    for i,did in enumerate(CUST_METADATA_ITEMS['dataset_id']):
    
        q2 = "INSERT IGNORE into "+custom_table+" (project_id,dataset_id,"
        for key in cust_keys_array:
            if key != 'dataset_id':
                q2 += key+","
        q2 = q2[:-1]+ ")"
        q2 += " VALUES('"+str(CONFIG_ITEMS['project_id'])+"','"+str(did)+"',"
        for key in cust_keys_array:
            if key != 'dataset_id':

                val = str(CUST_METADATA_ITEMS[key][i])[:1000]   # limit at 1000 chars
                q2 += "'"+val+"',"
        q2 = q2[:-1] + ")"    # remove trailing comma

        logging.info(q2)
        cur.execute(q2)
    
    db.commit()
    
def get_metadata(indir):
    
    csv_infile =   os.path.join(indir,'meta_clean.csv')
    print 'csv',csv_infile
    logging.info('csv '+csv_infile)
    lol = list(csv.reader(open(csv_infile, 'rb'), delimiter='\t'))
    # try:
#         csv_infile =   os.path.join(indir,'meta_clean.csv')
#         print csv_infile
#         lol = list(csv.reader(open(csv_infile, 'rb'), delimiter='\t'))
#     except:
#
#         csv_infile =   os.path.join(indir,'meta.csv')
#         print csv_infile
#         lol = list(csv.reader(open(csv_infile, 'rb'), delimiter='\t'))
#     else:
#         sys.exit("FAILED TO READ METAFILE")
    TMP_METADATA_ITEMS = {}
    
    #print lol
    keys = lol[0]
    for i,key in enumerate(keys):
        TMP_METADATA_ITEMS[key] = []
        for line in lol[1:]:
            TMP_METADATA_ITEMS[key].append(line[i])
    saved_indexes = []    
    print 'dtasets',CONFIG_ITEMS['datasets']
    
    if CONFIG_ITEMS['fasta_type']=='multi':           
        for ds in CONFIG_ITEMS['datasets']:
            print  TMP_METADATA_ITEMS['sample_name'].index(ds), ds 
            try:
                saved_indexes.append(TMP_METADATA_ITEMS['sample_name'].index(ds))
                dataset_header_name = 'sample_name'
            except:
                 try:
                     saved_indexes.append(TMP_METADATA_ITEMS['dataset'].index(ds))
                     dataset_header_name = 'dataset'
                 except:
                     sys.exit('ERROR: Could not find "dataset" or "sample_name" in matadata file')
    
    # now get the data from just the datasets we have in CONFIG.ini
    print 'TMP_METADATA_ITEMS',TMP_METADATA_ITEMS
    for key in TMP_METADATA_ITEMS:
        
        if key in required_metadata_fields:
            REQ_METADATA_ITEMS[key] = []
            REQ_METADATA_ITEMS['dataset_id'] = []
            for j,value in enumerate(TMP_METADATA_ITEMS[key]):
                
                if CONFIG_ITEMS['fasta_type']=='multi' and j in saved_indexes:
                    if key in required_metadata_fields:
                        REQ_METADATA_ITEMS[key].append(TMP_METADATA_ITEMS[key][j])
                    
                    if CONFIG_ITEMS['fasta_type']=='multi':
                        ds = TMP_METADATA_ITEMS[dataset_header_name][j]
                    else:
                        ds = CONFIG_ITEMS['datasets'][0]
                    did = DATASET_ID_BY_NAME[ds]
                    REQ_METADATA_ITEMS['dataset_id'].append(did)
                else:
                    if key in required_metadata_fields:
                        REQ_METADATA_ITEMS[key].append(TMP_METADATA_ITEMS[key][j])
        else:
            CUST_METADATA_ITEMS[key] = []
            CUST_METADATA_ITEMS['dataset_id'] = []
            
            for j,value in enumerate(TMP_METADATA_ITEMS[key]):
                
                if CONFIG_ITEMS['fasta_type']=='multi' and j in saved_indexes:
                    
                    if key not in required_metadata_fields:                        
                        CUST_METADATA_ITEMS[key].append(TMP_METADATA_ITEMS[key][j].replace('"','').replace("'",''))
                    if CONFIG_ITEMS['fasta_type']=='multi':
                        ds = TMP_METADATA_ITEMS[dataset_header_name][j]
                    else:
                        ds = CONFIG_ITEMS['datasets'][0]
                    did = DATASET_ID_BY_NAME[ds]
                    CUST_METADATA_ITEMS['dataset_id'].append(did)
                else:
                    if key not in required_metadata_fields:                        
                        CUST_METADATA_ITEMS[key].append(TMP_METADATA_ITEMS[key][j].replace('"','').replace("'",''))
                    ds = CONFIG_ITEMS['datasets'][0]
                    did = DATASET_ID_BY_NAME[ds]
                    CUST_METADATA_ITEMS['dataset_id'].append(did)
    print   'REQ_METADATA_ITEMS',REQ_METADATA_ITEMS
    print   'CUST_METADATA_ITEMS',CUST_METADATA_ITEMS
    #sys.exit()             
    if not 'dataset_id' in REQ_METADATA_ITEMS:
        REQ_METADATA_ITEMS['dataset_id'] = []
    if 'dataset_id' not in CUST_METADATA_ITEMS:
        CUST_METADATA_ITEMS['dataset_id'] = []
            
def get_config_data(indir):
    config_infile =   os.path.join(indir,'config.ini') 
    print config_infile
    logging.info(config_infile)
    config = ConfigParser.ConfigParser()
    config.optionxform=str
    config.read(config_infile)    
    for name, value in  config.items('GENERAL'):
        #print '  %s = %s' % (name, value)  
        CONFIG_ITEMS[name] = value
    CONFIG_ITEMS['datasets'] = []
    for dsname, count in  config.items('DATASETS'):        
        CONFIG_ITEMS['datasets'].append(dsname)   
    #print 'project',CONFIG_ITEMS['project']
    q = "SELECT project_id FROM project"
    q += " WHERE project = '"+CONFIG_ITEMS['project']+"'" 
    logging.info(q)
    cur.execute(q)
    
    row = cur.fetchone()     
    CONFIG_ITEMS['project_id'] = row[0]
        
    q = "SELECT dataset,dataset_id from dataset"
    q += " WHERE dataset in('"+"','".join(CONFIG_ITEMS['datasets'])+"')"
    logging.info(q)
    cur.execute(q)     
    for row in cur.fetchall():        
        DATASET_ID_BY_NAME[row[0]] = row[1]
        
    db.commit()
    

    
# def combine(indir):
#     if not args.infile:
#         sys.exit('need first file')
#     if not args.other_file:
#         sys.exit('need second file')
#
#     outfile = os.path.join(args.indir,'combined_metadata.txt')
#     fp = open(outfile,'w')
#     csv_infile1 = args.infile
#     lol = list(csv.reader(open(csv_infile1, 'rb'), delimiter='\t'))
#     #print lol
#     keys = lol[0]
#     TMP_METADATA_ITEMS = {}
#     for i,key in enumerate(keys):
#         TMP_METADATA_ITEMS[key] = []
#         for line in lol[1:]:
#             TMP_METADATA_ITEMS[key].append(line[i])
#
#
#     csv_infile2 = args.other_file
#     lol = list(csv.reader(open(csv_infile2, 'rb'), delimiter='\t'))
#     keys = lol[0]
#     for i,key in enumerate(keys):
#         TMP_METADATA_ITEMS[key] = []
#         for line in lol[1:]:
#             TMP_METADATA_ITEMS[key].append(line[i])
#
#     headers =  TMP_METADATA_ITEMS.keys()
#     txt = ''
#     for key in headers:
#         txt += key + "\t"
#     txt = txt.strip() + "\n"
#     fp.write(txt)
#
#     for i,line in enumerate(lol[1:]):
#         txt = ''
#         for key in headers:
#             txt +=  TMP_METADATA_ITEMS[key][i] + "\t"
#         txt = txt.strip() + "\n"
#         fp.write(txt)
#
#     print outfile,'has been written'
#     fp.close()
    
if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: upload_metadata_to_database.py  [options]
         
         
         where
            
            -dir/--indir   
                
            -i/--infile     
           
            
         These should all be in INFO-CONFIG.ini file which is REQUIRED to be in dir:
            -p/--project            
            
            
     Samples:
    ./upload_metadata_to_database.py -dir new_vamps_data/MBE_10068_Bv4 -i new_vamps_data/MBE_10068_Bv4/preprocessed_fasta.csv
    ./upload_metadata_to_database.py -dir new_vamps_data/test_project/ -i new_vamps_data/test_project/test.txt
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
                                                    
    parser.add_argument("-dir","--indir",                   
                required=False,  action="store",   dest = "indir", default='./',
                help="""Directory to output ini and dir structure""")  
    
         
    parser.add_argument("-i", "--infile",          
                required=False,  action='store', dest = "infile",  default='',
                help="Project name") 
    
                
        
    parser.add_argument("-comb", "--combine",          
                required=False,  action='store_true', dest = "combine",  default=False,
                help="combine 2 MoBE metadata files")             
    parser.add_argument("-other", "--other_file",          
                required=False,  action='store', dest = "other_file",  default=False,
                help="")                           
    args = parser.parse_args()    
   
    args.datetime     = str(datetime.date.today())    
    
    db = MySQLdb.connect(host="localhost", # your host, usually localhost
                             read_default_file="~/.my.cnf"  )
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
    
    if args.combine:
        combine(args)
    else:
        if args.indir and args.infile:
            start(args)
        else:
            print myusage
            print 'requires directory and file input'
            print 'DATABASE:',NODE_DATABASE
            
    
        
