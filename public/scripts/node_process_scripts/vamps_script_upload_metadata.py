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
import configparser as ConfigParser
sys.path.append( '/Users/avoorhis/programming/vamps-node.js/public/scripts/maintenance_scripts' )

import datetime
today = str(datetime.date.today())
import subprocess
import pymysql as MySQLdb

"""

"""
# Global:
#NODE_DATABASE = "vamps_js_dev_av"
#NODE_DATABASE = "vamps_js_development"
CONFIG_ITEMS = {}
DATASET_ID_BY_NAME = {}
REQ_METADATA_ITEMS = {}
CUST_METADATA_ITEMS = {}

required_metadata_fields = [  "collection_date","env_biome", "env_feature", "env_material", "env_package","geo_loc_name","latitude", "longitude", "dna_region",'adapter_sequence','sequencing_platform','target_gene','domain','illumina_index','primer_suite', 'run'];
required_id_metadata_fields= [  "env_biome", "env_feature", "env_material","env_package","geo_loc_name", "dna_region",'adapter_sequence','sequencing_platform','target_gene','domain','illumina_index','primer_suite', 'run' ];
#required_id_metadata_fields= [  "env_biome_id", "env_feature_id", "env_material_id","env_package_id","geo_loc_name_id", "dna_region_id",'adapter_sequence_id','sequencing_platform_id','target_gene_id','domain_id','illumina_index_id','primer_suite_id', 'run_id' ];

req_first_col = ['#SampleID','sample_name','dataset_name']
#test = ('434','0','y','1/27/14','0','GAZ:Canada','167.5926056','ENVO:urban biome','ENVO:human-associated habitat','ENVO:feces','43.119339','-79.2458198','y',
#'408170','human gut metagenome','American Gut Project Stool sample')
#test7 = ('434','ENVO:urban biome','ENVO:human-associated habitat','ENVO:feces','43.119339','-79.2458198','y')
id_queries = [
    {"table":"term","query": "SELECT term_id FROM term WHERE term_name = 'unknown'"},
    {"table":"env_package","query": "SELECT env_package_id FROM env_package WHERE env_package = 'unknown'"},
    {"table":"dna_region","query": "SELECT dna_region_id FROM dna_region WHERE dna_region = 'unknown'"},
    {"table":"adapter_sequence","query": "SELECT run_key_id FROM run_key WHERE run_key = 'unknown'"},   # adapter_sequence
    {"table":"sequencing_platform","query": "SELECT sequencing_platform_id FROM sequencing_platform WHERE sequencing_platform = 'unknown'"},
    {"table":"target_gene","query": "SELECT target_gene_id FROM target_gene WHERE target_gene = 'unknown'"},
    {"table":"domain","query": "SELECT domain_id FROM domain WHERE domain = 'unknown'"},
    {"table":"illumina_index","query": "SELECT illumina_index_id FROM illumina_index WHERE illumina_index = 'unknown'"},
    {"table":"primer_suite","query": "SELECT primer_suite_id FROM primer_suite WHERE primer_suite = 'unknown'"},
    {"table":"run","query": "SELECT run_id FROM run WHERE run = 'unknown'"}
]


def start_metadata_load_from_file(args):
    global mysql_conn, cur
    logging.info('CMD> '+' '.join(sys.argv))
    
    if args.site == 'vamps' or args.site == 'vampsdb' or args.site == 'bpcweb8':
        hostname = 'vampsdb'
    elif args.site == 'vampsdev' or args.site == 'bpcweb7':
        hostname = 'bpcweb7'
    else:
        hostname = 'localhost'
        args.NODE_DATABASE = 'vamps_development'
    
    mysql_conn = MySQLdb.connect(db = args.NODE_DATABASE, host=hostname, read_default_file=os.path.expanduser("~/.my.cnf_node")  )
    cur = mysql_conn.cursor()
    
    csv_infile =   os.path.join(args.project_dir,'metadata_clean.csv')
    get_config_data(args)  
    if os.path.isfile(csv_infile):
        cur.execute("USE "+args.NODE_DATABASE)    
          
        get_metadata(args.project_dir,csv_infile)
        put_required_metadata()
        put_custom_metadata()
    else:
        print ("Could not find csv_file:",csv_infile)
        # no metadata -- should enter defaults
        print ("Using 'unknown' Defaults")
        defaults = get_null_ids()
        # must get dids
        #print (DATASET_ID_BY_NAME.values())
        #print (defaults)
        #{'term': 6191, 'dna_region': 1, 'adapter_sequence': 1, 'sequencing_platform': 5, 'target_gene': 3, 'domain': 1, 'illumina_index': 83, 'primer_suite': 35, 'run': 5543}
        q = "INSERT IGNORE into required_metadata_info (dataset_id"
        for id_label in required_id_metadata_fields:
            q += ", "+ id_label+'_id'
        q+= ") VALUES"
        for did in DATASET_ID_BY_NAME.values():
            q +=" ("+ str(did)
            for id_label in required_id_metadata_fields:
                #print(id_label)
                if id_label == 'env_material' or id_label == 'env_feature' or id_label == 'env_biome' or id_label == 'geo_loc_name':
                    entry = str(defaults['term'])
                else:
                    entry = str(defaults[id_label])
                q += ","+entry
            
            q += "),"
        q = q[:-1]  # remove trailing comma
        print(q)
        cur.execute(q)
    mysql_conn.commit()

def get_null_ids():
    global mysql_conn, cur
    unknowns = {}
        
    for q in id_queries:
        cur.execute(q['query'])
        mysql_conn.commit()
        row = cur.fetchone()
        unknowns[q['table']] = row[0]
    
    print ('unknown IDs',unknowns)
    return unknowns
    
def put_required_metadata():
    global mysql_conn, cur
    q = "INSERT IGNORE into required_metadata_info (dataset_id,"+','.join(required_metadata_fields)+")"
    q = q+" VALUES("
    
    for i,did in enumerate(REQ_METADATA_ITEMS['dataset_id']):
        vals = "'"+str(did)+"',"
        
        for item in required_metadata_fields:
            if item in REQ_METADATA_ITEMS:
                vals += "'"+str(REQ_METADATA_ITEMS[item][i])+"',"
            else:
                vals += "'',"
        q2 = q + vals[:-1] + ")"  
        print(q2)
        logging.info(q2)
        #cur.execute(q2)
    #mysql_conn.commit()
            
            
def put_custom_metadata():
    """
      create new table
    """
    global mysql_conn, cur
    print ('starting put_custom_metadata')
    # TABLE-1 === custom_metadata_fields
    print ('CUST_METADATA_ITEMS',CUST_METADATA_ITEMS)
    print ('REQ_METADATA_ITEMS',REQ_METADATA_ITEMS)
    for key in CUST_METADATA_ITEMS:
        logging.debug(key)
        q2 = "INSERT IGNORE into custom_metadata_fields(project_id,field_name,example)"
        q2 += " VALUES("
        q2 += "'"+str(CONFIG_ITEMS['project_id'])+"',"
        q2 += "'"+key+"',"
        
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
                q2 += "`"+key+"`,"
        q2 = q2[:-1]+ ")"
        q2 += " VALUES('"+str(CONFIG_ITEMS['project_id'])+"','"+str(did)+"',"
        for key in cust_keys_array:
            if key != 'dataset_id':


                val = str(CUST_METADATA_ITEMS[key][i])[:1000]   # limit at 1000 chars
                q2 += "'"+val+"',"
        q2 = q2[:-1] + ")"    # remove trailing comma

        print(q2)
        logging.info(q2)
        cur.execute(q2)
    
    mysql_conn.commit()
    
def get_metadata(indir, csv_infile):
    
    
    print ('csv',csv_infile)
    logging.info('csv '+csv_infile)
    lol = list(csv.reader(open(csv_infile, 'rb'), delimiter='\t'))
   
    TMP_METADATA_ITEMS = {}
    
    #print lol
    keys = lol[0]
    for i,key in enumerate(keys):
        TMP_METADATA_ITEMS[key] = []
        for line in lol[1:]:
            TMP_METADATA_ITEMS[key].append(line[i])
    saved_indexes = []    
    print ('dtasets',CONFIG_ITEMS['datasets'])
    
    if CONFIG_ITEMS['fasta_type']=='multi':           
        for ds in CONFIG_ITEMS['datasets']:
            #print  TMP_METADATA_ITEMS['sample_name'].index(ds), ds 
            found = False
            for samp_head_name in req_first_col:
                if samp_head_name in TMP_METADATA_ITEMS:
                    found = True
                    saved_indexes.append(TMP_METADATA_ITEMS[samp_head_name].index(ds))
                    dataset_header_name = samp_head_name
            if not found:
                sys.exit('ERROR: Could not find "dataset" or "sample_name" in matadata file')
                                
    
    # now get the data from just the datasets we have in CONFIG.ini
    print ('TMP_METADATA_ITEMS',TMP_METADATA_ITEMS)
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
    print('REQ_METADATA_ITEMS',REQ_METADATA_ITEMS)
    print('CUST_METADATA_ITEMS',CUST_METADATA_ITEMS)
    #sys.exit()             
    if not 'dataset_id' in REQ_METADATA_ITEMS:
        REQ_METADATA_ITEMS['dataset_id'] = []
    if 'dataset_id' not in CUST_METADATA_ITEMS:
        CUST_METADATA_ITEMS['dataset_id'] = []
            
def get_config_data(args):
    global mysql_conn, cur
    config_path = os.path.join(args.project_dir, args.config_file)
    print (config_path)
    logging.info(config_path)
    config = ConfigParser.ConfigParser()
    config.optionxform=str
    config.read(config_path)    
    for name, value in  config.items('MAIN'):
        #print '  %s = %s' % (name, value)  
        CONFIG_ITEMS[name] = value
    CONFIG_ITEMS['datasets'] = []
    for dsname, count in  config.items('MAIN.dataset'):        
        CONFIG_ITEMS['datasets'].append(dsname)   
    #print 'project',CONFIG_ITEMS['project']
    q = "SELECT project_id FROM project"
    q += " WHERE project = '"+CONFIG_ITEMS['project_name']+"'" 
    logging.info(q)
    print(q)
    cur.execute(q)
    
    row = cur.fetchone()     
    CONFIG_ITEMS['project_id'] = row[0]
        
    q = "SELECT dataset,dataset_id from dataset"
    q += " WHERE dataset in('"+"','".join(CONFIG_ITEMS['datasets'])+"')"
    logging.info(q)
    cur.execute(q)     
    for row in cur.fetchall():        
        DATASET_ID_BY_NAME[row[0]] = row[1]
        
    mysql_conn.commit()
    

    

    
if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: vamps_script_upload_metadata.py  [options]
         
         
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
    
       
    parser.add_argument('-db', '--NODE_DATABASE',         
                required=False,   action="store",  dest = "NODE_DATABASE",    default='vamps2',       
                help = 'node database')  
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
   
    args.datetime     = str(datetime.date.today())    
    
    
    start_metadata_load_from_file(args)
    #sys.exit('END: vamps_script_upload_metadata.py')
    
        
    
        
