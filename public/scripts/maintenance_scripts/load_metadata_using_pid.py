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
import logging

"""

"""
# Global:
#NODE_DATABASE = "vamps_js_dev_av"
#NODE_DATABASE = "vamps_js_development"
CONFIG_ITEMS = {}
DB_ITEMS = {}
DATASET_ID_BY_NAME = {}
REQ_METADATA_ITEMS = {}
CUST_METADATA_ITEMS = {}

required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_material", "latitude", "longitude", "public","taxon_id","description","common_name"];

test = ('434','0','y','1/27/14','0','GAZ:Canada','167.5926056','ENVO:urban biome','ENVO:human-associated habitat','ENVO:feces','43.119339','-79.2458198','y',
'408170','human gut metagenome','American Gut Project Stool sample')
test7 = ('434','ENVO:urban biome','ENVO:human-associated habitat','ENVO:feces','43.119339','-79.2458198','y')

LOG_FILENAME = os.path.join('.','load_metadata_using_pid.log')
logging.basicConfig(level=logging.DEBUG, filename=LOG_FILENAME, filemode="a+",
                           format="%(asctime)-15s %(levelname)-8s %(message)s")

def start(args):
    get_config_data(args)
    get_metadata(args)
    #put_required_metadata(args)
    #put_custom_metadata(args)
    #print CONFIG_ITEMS
    logging.debug( 'REQ_METADATA_ITEMS')
    logging.debug( REQ_METADATA_ITEMS)

    logging.debug( 'CUST_METADATA_ITEMS')
    logging.debug(CUST_METADATA_ITEMS)
    
def put_required_metadata(args):
    
    q = "INSERT into required_metadata_info (dataset_id,"+','.join(required_metadata_fields)+")"
    q = q+" VALUES("
    
    for i,did in enumerate(REQ_METADATA_ITEMS['dataset_id']):
        vals = "'"+str(did)+"',"
        
        for item in required_metadata_fields:
            vals += "'"+str(REQ_METADATA_ITEMS[item][i])+"',"
        q2 = q + vals[:-1] + ")"  
        logging.debug(q2)
        cur.execute(q2)
    db.commit()
            
            
def put_custom_metadata(args):
    """
      create new table
    """
    logging.debug('starting put_custom_metadata')
    # TABLE-1 === custom_metadata_fields
    for key in CUST_METADATA_ITEMS:
        print key
        q2 = "insert ignore into custom_metadata_fields(project_id,field_name,field_type,example)"
        q2 += " VALUES("
        q2 += "'"+str(CONFIG_ITEMS['project_id'])+"',"
        q2 += "'"+key+"',"
        q2 += "'varchar(128)',"
        q2 += "'"+str(CUST_METADATA_ITEMS[key][0])+"')"
        logging.debug(q2)
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
            q += " `"+key+"` varchar(128) NOT NULL,\n" 
    q += " PRIMARY KEY (`"+custom_table+"_id` ),\n" 
    unique_key = "UNIQUE KEY `unique_key` (`project_id`,`dataset_id`,"
    
    # ONLY 16 key items allowed:    
    for i,key in enumerate(cust_keys_array):
        if i < 14 and key != 'dataset_id':
            unique_key += " `"+key+"`,"
    q += unique_key[:-1]+"),\n"
    q += " KEY `project_id` (`project_id`),\n"
    q += " KEY `dataset_id` (`dataset_id`),\n"
    q += " CONSTRAINT `"+custom_table+"_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON UPDATE CASCADE,\n"
    q += " CONSTRAINT `"+custom_table+"_ibfk_2` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`dataset_id`) ON UPDATE CASCADE\n"
    q += " ) ENGINE=InnoDB DEFAULT CHARSET=latin1;"
    logging.debug(q)
    cur.execute(q)
    
    for i,did in enumerate(CUST_METADATA_ITEMS['dataset_id']):
    
        q2 = "insert ignore into "+custom_table+" (project_id,dataset_id,"
        for key in cust_keys_array:
            if key != 'dataset_id':
                q2 += key+","
        q2 = q2[:-1]+ ")"
        q2 += " VALUES('"+str(CONFIG_ITEMS['project_id'])+"','"+str(did)+"',"
        for key in cust_keys_array:
            if key != 'dataset_id':
                q2 += "'"+str(CUST_METADATA_ITEMS[key][i])+"',"
        q2 = q2[:-1] + ")" 
        logging.debug(q2)
        cur.execute(q2)
    
    db.commit()
    
def get_metadata(args):
    
    csv_infile =   args.infile 
    TMP_METADATA_ITEMS = {}
    if args.delim == 'tab':
        lol = list(csv.reader(open(csv_infile, 'rb'), delimiter='\t'))
    else:
        lol = list(csv.reader(open(csv_infile, 'rb'), delimiter=','))
    #print lol
    keys = lol[0]
    for i,header in enumerate(keys):
        if not header:
            continue
        TMP_METADATA_ITEMS[header] = []
        logging.debug(header)
        
        for line in lol[1:]:
            
            TMP_METADATA_ITEMS[header].append(line[i])
    #print TMP_METADATA_ITEMS['dataset']
    if 'structured_comment_name' not in TMP_METADATA_ITEMS:
        logging.debug('No structured_comment_name field found -- exiting')
        sys.exit('No structured_comment_name field found -- exiting')        
    if 'dataset' not in TMP_METADATA_ITEMS:
        logging.debug('No dataset field found -- exiting')
        sys.exit('No dataset field found -- exiting')        
    if 'parameterValue' not in TMP_METADATA_ITEMS:
        logging.debug('No parameterValue field found -- exiting')
        sys.exit('No parameterValue field found -- exiting')
        
        
        
    meta = {}
    for i,ds in enumerate(TMP_METADATA_ITEMS['dataset']):
        meta[ds] = {}
    for i,name in enumerate(TMP_METADATA_ITEMS['structured_comment_name']):
        #print i,value,TMP_METADATA_ITEMS['dataset'][i]
        meta[TMP_METADATA_ITEMS['dataset'][i]][name] = TMP_METADATA_ITEMS['parameterValue'][i]
    logging.debug()
    #print meta
    REQ_METADATA_ITEMS['dataset_ids'] = []
    for name in required_metadata_fields:
        REQ_METADATA_ITEMS[name] = []
    for ds in DB_ITEMS['datasets']:
        if ds in meta:  #use only the datasets that is already in the db 
             did = DATASET_ID_BY_NAME[ds]
             REQ_METADATA_ITEMS['dataset_ids'].append(did)
             data = meta[ds]
             for item in data:
                 #print item
                 if item in required_metadata_fields:
                     REQ_METADATA_ITEMS[item].append(data[item])
             
                     
    logging.debug(REQ_METADATA_ITEMS)
    #print  CUST_METADATA_ITEMS               
    #saved_indexes = []        
    #print TMP_METADATA_ITEMS
    #for ds in DB_ITEMS['datasets']:
        #print  TMP_METADATA_ITEMS['sample_name'].index(ds) , ds 
    #    saved_indexes.append(TMP_METADATA_ITEMS['dataset'].index(ds))
    
    #print saved_indexes
    #sys.exit()
    for item in TMP_METADATA_ITEMS:
        key = item.replace(' ','_').replace('/','_').replace('+','').replace('(','').replace(')','').replace(',','_').replace('-','_').replace("'",'').replace('"','').replace('<','&lt;').replace('>','&gt;')   # structured comment name
        if key in required_metadata_fields:
            REQ_METADATA_ITEMS[key] = []
            REQ_METADATA_ITEMS['dataset_id'] = []
            for j,value in enumerate(TMP_METADATA_ITEMS[key]):
                if j in saved_indexes:
                    if key in required_metadata_fields:
                        REQ_METADATA_ITEMS[key].append(TMP_METADATA_ITEMS[key][j])
                    ds = TMP_METADATA_ITEMS['dataset'][j]
                    did = DATASET_ID_BY_NAME[ds]
                    REQ_METADATA_ITEMS['dataset_id'].append(did)
        else:
            CUST_METADATA_ITEMS[key] = []
            CUST_METADATA_ITEMS['dataset_id'] = []
            
            for j,value in enumerate(TMP_METADATA_ITEMS[key]):
                
                if j in saved_indexes:
                    
                    if key not in required_metadata_fields:
                        
                        CUST_METADATA_ITEMS[key].append(TMP_METADATA_ITEMS[key][j])
                    ds = TMP_METADATA_ITEMS['dataset'][j]
                    did = DATASET_ID_BY_NAME[ds]
                    CUST_METADATA_ITEMS['dataset_id'].append(did)
                   
    if not 'dataset_id' in REQ_METADATA_ITEMS:
        REQ_METADATA_ITEMS['dataset_id'] = []
    if 'dataset_id' not in CUST_METADATA_ITEMS:
        CUST_METADATA_ITEMS['dataset_id'] = []
            
def get_config_data(args):
    
    q = "SELECT project FROM project"
    q += " WHERE project_id = '"+args.pid+"'" 
    logging.debug(q)
    cur.execute(q)
    row = cur.fetchone()     
    project_name = row[0]
    logging.debug(project_name)
    DB_ITEMS['project'] = project_name
    DB_ITEMS['datasets'] = []
    
        
    q = "SELECT dataset, dataset_id from dataset"
    q += " WHERE project_id = '"+args.pid+"'" 
    logging.debug(q)
    cur.execute(q)     
    for row in cur.fetchall():        
        DB_ITEMS['datasets'].append(row[0])  
        DATASET_ID_BY_NAME[row[0]] = row[1]
        
    mysql_conn.commit()
    

    

if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: upload_metadata_to_database.py  [options]
         
         
         where
            
            -pid/--pid   project_id   
                
            -in/--infile     metadata csv file (from vamps )
               CSV must have  (tab delimited)
               project	
               dataset	
               structured_comment_name	
               parameterValue	
               miens_units	
               
               (see vamps download metadata: https://vamps.mbl.edu/metadata/export_metadata.php)
               
             -d/--delim  tab or comma
           
            
                 
            
            
     Samples:
    
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
                                                    
    parser.add_argument("-pid","--pid",                   
                required=True,  action="store",   dest = "pid", default='',
                help="""""")  
    
         
    parser.add_argument("-in", "--infile",          
                required=True,  action='store', dest = "infile",  default='',
                help="Project name") 
    
    parser.add_argument("-d", "--delim",          
                 required=False,  action='store', dest = "delim",  default='tab',
                 help="Project name")                             
    
    args = parser.parse_args()    
   
    args.datetime     = str(datetime.date.today())    
    
    mysql_conn = MySQLdb.connect(host="localhost", # your host, usually localhost
                          read_default_file="~/.my.cnf"  )
    cur = mysql_conn.cursor()
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
    print('See '+LOG_FILENAME)
    
    if args.pid and args.infile:
        start(args)
    else:
        print myusage
        print 'requires project_id and metadata file input'
        print 'DATABASE:',NODE_DATABASE
            
    
        
