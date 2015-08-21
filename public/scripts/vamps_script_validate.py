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
CONFIG_ITEMS["datasets"] = []
DATASET_ID_BY_NAME = {}
REQ_METADATA_ITEMS = {}
CUST_METADATA_ITEMS = {}

required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "public","taxon_id","description","common_name"];

#test = ('434','0','y','1/27/14','0','GAZ:Canada','167.5926056','ENVO:urban biome','ENVO:human-associated habitat','ENVO:feces','43.119339','-79.2458198','y',
#'408170','human gut metagenome','American Gut Project Stool sample')
#test7 = ('434','ENVO:urban biome','ENVO:human-associated habitat','ENVO:feces','43.119339','-79.2458198','y')



def start(args):
    global cur,mysql_conn
    NODE_DATABASE = args.NODE_DATABASE
    mysql_conn = MySQLdb.connect(host="localhost", # your host, usually localhost
                          db = NODE_DATABASE,
                          read_default_file="~/.my.cnf"  )
    cur = mysql_conn.cursor()
    csv_infile =   args.metadata_file
    if os.path.isfile(csv_infile):
        cur.execute("USE "+NODE_DATABASE)    
        #get_config_data(indir) 
        if args.has_tax:
            get_dataset_ids(args)
        else:
            get_config_data(args)
        #sys.exit()
        print 'CONFIG_ITEMS',CONFIG_ITEMS
        TMP_METADATA_ITEMS = get_metadata(csv_infile);
        #sys.exit()
        if args.has_tax:
            put_required_metadata()
            put_custom_metadata()
        write_metafile(args,TMP_METADATA_ITEMS)
    else:
        print "Could not find csv_file:",csv_infile
        #print CONFIG_ITEMS
    print REQ_METADATA_ITEMS
    print
    print CUST_METADATA_ITEMS

def get_config_data(args):
     
    config_infile =   os.path.join(args.process_dir,'user_data',args.NODE_DATABASE,args.owner,'project:'+args.project,'config.ini') 
    print config_infile
    if os.path.isfile(config_infile):
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
    else:
        print "Could not find config file:",config_infile
        sys.exit(-201)

def get_dataset_ids(args):
    global cur,mysql_conn
    q = "SELECT project_id FROM project"
    q += " WHERE project = '"+args.project+"'" 
    logging.info(q)
    print q
    cur.execute(q)
    result_count = cur.rowcount
    if result_count:
        row = cur.fetchone()     
        CONFIG_ITEMS['project_id'] = row[0]
            
        q = "SELECT dataset,dataset_id from dataset"
        q += " WHERE project_id = '"+str(CONFIG_ITEMS['project_id'])+"'"
        logging.info(q)
        print q
        cur.execute(q)     
        for row in cur.fetchall():        
            DATASET_ID_BY_NAME[row[0]] = row[1] 
            CONFIG_ITEMS['datasets'].append(row[0])            
        mysql_conn.commit()  
    else:
        print "No Project Found - Exiting"
        sys.exit(-203)


def put_required_metadata():
    global cur,mysql_conn
    q = "INSERT ignore into required_metadata_info (dataset_id,"+','.join(required_metadata_fields)+")"
    q = q+" VALUES("
    
    for i,ds in enumerate(CONFIG_ITEMS['datasets']):
    #for i,did in enumerate(REQ_METADATA_ITEMS['dataset_id']):
        did = DATASET_ID_BY_NAME[ds]
        vals = "'"+str(did)+"',"
        
        for item in required_metadata_fields:
            if item in REQ_METADATA_ITEMS:
                vals += "'"+str(REQ_METADATA_ITEMS[item][i])+"',"
            else:
                vals += "'Unknown',"
        q2 = q + vals[:-1] + ")"  
        print q2
        logging.info(q2)
        cur.execute(q2)
    mysql_conn.commit()
            
            
def put_custom_metadata():
    """
      create new table
    """
    global cur,mysql_conn
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
    for i,ds in enumerate(CONFIG_ITEMS['datasets']):
        did = DATASET_ID_BY_NAME[ds]
    #for i,did in enumerate(CUST_METADATA_ITEMS['dataset_id']):
    
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
    
    mysql_conn.commit()
    
def get_metadata(csv_infile):
    
    global cur,mysql_conn,dataset_header_name
    print 'csv',csv_infile
    logging.info('csv '+csv_infile)
    lol = list(csv.reader(open(csv_infile, 'rb'), delimiter='\t'))
    found_dsets_dict={}
    TMP_METADATA_ITEMS = {}
    print 'datasets',CONFIG_ITEMS['datasets']
    if args.file_type=='qiime':  
        #print lol
        keys = lol[0]
        for i,key in enumerate(keys):
            if key:
                TMP_METADATA_ITEMS[key] = []
                #for line in lol[1:]:            
                    #TMP_METADATA_ITEMS[key].append(line[i])
          
                    
        
            
        try:
            #saved_indexes.append(TMP_METADATA_ITEMS['#SampleID'].index(ds))
            ds_col = TMP_METADATA_ITEMS['#SampleID']
            ds_index = keys.index('#SampleID')
            dataset_header_name = '#SampleID'
            print 'found "#SampleID" at index',ds_index
        except:
             try:
                 #saved_indexes.append(TMP_METADATA_ITEMS['sample_name'].index(ds))
                 ds_col = TMP_METADATA_ITEMS['sample_name']
                 ds_index = keys.index('sample_name')
                 dataset_header_name = 'sample_name'
                 print 'found "sample_name" at index',ds_index
             except:
                try:
                    #saved_indexes.append(TMP_METADATA_ITEMS['dataset_name'].index(ds))
                    ds_col = TMP_METADATA_ITEMS['dataset_name']
                    ds_index = keys.index('dataset_name')
                    dataset_header_name = 'dataset_name'
                    print 'found "dataset_name" at index',ds_index
                except:
                    print 'ERROR: Could not find "#SampleID", "sample_name" or "dataset_name" in matadata file'
                    sys.exit(-205)
    
        for line in lol[1:]:
            found_dsets_dict[line[ds_index]] = 1
            for ds in CONFIG_ITEMS['datasets']:
                if ds == line[ds_index]:                    
                    for i,key in enumerate(keys):
                        if key:
                            TMP_METADATA_ITEMS[key].append(line[i])
                            #print line

        found = False 
        found_dsets_list = list(found_dsets_dict.keys())       
        for ds in found_dsets_list:
            if ds in CONFIG_ITEMS['datasets']:
                found = True
        if not found:
            print 'No datasets from csv file are found in project!'
            sys.exit(-207)




    else:  # vamps style csv
        #['D1', 'EnvO_feature', 'marine sponge reef', 'Alphanumeric', 'Alphanumeric', 'ICM_SPO_Bv6', '1', 'envo_feature', '', '3', 'IEO2.txt  2010-03-31 PRN -- EnvO DATA FROM Pier Buttigi MPI Bremen miens update prn 2010_05_19 miens update units --prn 2010_05_19', '2013-10-29 13:26:58', '', '0', 'ICM_SPO_Bv6--SPO_0002_2008_01_31']
        #['dataset', 'parameterName', 'parameterValue', 'units', 'miens_units', 'project', 'units_id', 'structured_comment_name', 'method', 'other', 'notes', 'ts', 'entry_date', 'parameter_id', 'project_dataset']
        headers = lol[0]
        print 'Headers',headers
        dataset_header_name = 'Dataset'
        found_dsets_dict={}
        for line in lol[1:]:
            found_dsets_dict[line[0]] = 1
        found_dsets_list = list(found_dsets_dict.keys())
        # check that at least one dataset from csv file is in database
        found = False
        
        for ds in found_dsets_list:
            if ds in CONFIG_ITEMS['datasets']:
                found = True
        if not found:
            sys.exit('No datasets from csv file are found in project!')

        for line in lol[1:]:
            #print line
            ds = line[0]
            key = line[7]   # structured_comment_name
            if key == 'envo_material': key = 'env_matter'
            if key == 'envo_biome': key = 'env_biome'
            if key == 'envo_feature': key = 'env_feature'
            if key == 'lat': key = 'latitude'
            if key == 'lon': key = 'longitude'
            parameter_value = line[2]
            if ds in CONFIG_ITEMS['datasets']:
                
                if key in TMP_METADATA_ITEMS:
                    TMP_METADATA_ITEMS[key].append(parameter_value)
                else:
                    TMP_METADATA_ITEMS[key]=[]
                    TMP_METADATA_ITEMS[key].append(parameter_value)
    


    for key in TMP_METADATA_ITEMS:
    
        if key in required_metadata_fields:
            REQ_METADATA_ITEMS[key] = []
            #REQ_METADATA_ITEMS['dataset_id'] = []
            for j,value in enumerate(TMP_METADATA_ITEMS[key]):
                
                if key in required_metadata_fields:
                    REQ_METADATA_ITEMS[key].append(TMP_METADATA_ITEMS[key][j])
        else:
            CUST_METADATA_ITEMS[key] = []
            #CUST_METADATA_ITEMS['dataset_id'] = []
            
            for j,value in enumerate(TMP_METADATA_ITEMS[key]):
                
                if key not in required_metadata_fields:                        
                    CUST_METADATA_ITEMS[key].append(TMP_METADATA_ITEMS[key][j].replace('"','').replace("'",''))
                ds = CONFIG_ITEMS['datasets'][0]
                if args.has_tax:
                    did = DATASET_ID_BY_NAME[ds]
                #CUST_METADATA_ITEMS['dataset_id'].append(str(did))


    

    print
    #print   'REQ_METADATA_ITEMS',REQ_METADATA_ITEMS
    print
    #print   'CUST_METADATA_ITEMS',CUST_METADATA_ITEMS
    return TMP_METADATA_ITEMS            

def print_temp_metadata(TMP_METADATA_ITEMS):
    for m in TMP_METADATA_ITEMS:
        print m, TMP_METADATA_ITEMS[m]         

def write_metafile(args,TMP_METADATA_ITEMS):
    
    #print 'TMP_METADATA_ITEMS'
    #print TMP_METADATA_ITEMS
    #sys.exit()
    global dataset_header_name
    print dataset_header_name

    # this will overwrite the original metadata_clean.csv file
    mdfile_path = os.path.join(args.process_dir, 'user_data', args.NODE_DATABASE, args.owner, 'project:'+args.project, 'metadata_clean.csv')
    
    
    #req_metadata = ['altitude','assigned_from_geo','collection_date','common_name','country','depth','description','elevation','env_biome','env_feature','env_matter','latitude','longitude','public','taxon_id']
    #req_for_multi = ['sample_name','dataset']
    fd = open(mdfile_path, 'w')
    fd.write("#SampleID\t")
    fd.write("\t".join([str(x) for x in TMP_METADATA_ITEMS.keys()])+"\n")
    #for i,ds in enumerate(CONFIG_ITEMS['datasets']):
    for i in range(len(CONFIG_ITEMS['datasets'])):
        fd.write(TMP_METADATA_ITEMS[dataset_header_name][i])
        for item in TMP_METADATA_ITEMS:        
            fd.write("\t"+TMP_METADATA_ITEMS[item][i])
        fd.write("\n")

        

    fd.close()
     
def start_fasta_single(infile):
    print infile

    return 'ok'
    
def start_fasta_multi(infile):
    print infile

    return 'ok'
def start_metadata_vamps(infile):
    print infile

    return 'ok'
def start_metadata_qiime(infile):
    global cur,mysql_conn
    print 'csv',infile
    logging.info('csv '+infile)
    lol = list(csv.reader(open(infile, 'rb'), delimiter='\t'))
    # errors:
    # count of headers is different in line
    # there is no   
    keys = lol[0]
    print keys
    
    try:
        #saved_indexes.append(TMP_METADATA_ITEMS['#SampleID'].index(ds))
        
        ds_index = keys.index('#SampleID')
        dataset_header_name = '#SampleID'
        print 'found "#SampleID" at index',ds_index
    except:
         try:
             #saved_indexes.append(TMP_METADATA_ITEMS['sample_name'].index(ds))
             
             ds_index = keys.index('sample_name')
             dataset_header_name = 'sample_name'
             print 'found "sample_name" at index',ds_index
         except:
            try:              
                ds_index = keys.index('dataset_name')
                dataset_header_name = 'dataset_name'
                print 'found "dataset_name" at index',ds_index
            except:
                return 'ERROR: Could not find "#SampleID", "sample_name" or "dataset_name" in matadata file'
                sys.exit(-225)

    for line in lol[1:]:
        print line
    return 'ok'

    
if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: vamps_script_validate.py  [options]
         
         
         where
            
            -i/--infile            
                     

            -ft/--file_type  file type: fasta or metadata

            
            -s/--style  fasta: single or multi 
                        metadata: vamps or qiime
     
    
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
                                        
    parser.add_argument("-i", "--infile",          
                required=True,  action='store', dest = "infile",  default='',
                help="") 
                            
    parser.add_argument("-ft", "--file_type",          
                required=True,  action='store', dest = "file_type", 
                help="metadata or fasta")  
    
    parser.add_argument('-s', '--style',         
                required=True,   action="store",  dest = "style",            
                help = 'vamps or qiime OR single or multi') 

    parser.add_argument("-pdir", "--process_dir",    
                required=False,  action="store",   dest = "process_dir", default='/Users/avoorhis/programming/vamps-node.js/',
                help = '')

    args = parser.parse_args()    
   
    if args.file_type != 'fasta' and args.file_type != 'metadata':
        print('file type must be fasta or metadata')
        sys.exit(-201)
    if args.file_type == 'fasta':
        if args.style != 'single' and args.style != 'multi':
            print('style must be single or multi for fasta files')
            sys.exit(-202)
    if args.file_type == 'metadata':
        if args.style != 'vamps' and args.style != 'qiime':
            print('style must be vamps or qiime for metadata files')
            sys.exit(-203)

    
    args.datetime     = str(datetime.date.today())        
    
    
    if args.file_type == 'fasta' and args.style == 'single':
        result = start_fasta_single(args.infile)
    elif args.file_type == 'fasta' and args.style == 'multi':
        result = start_fasta_multi(args.infile)
    elif args.file_type == 'metadata' and args.style == 'vamps':
        result = start_metadata_vamps(args.infile)
    elif args.file_type == 'metadata' and args.style == 'qiime':
        result = start_metadata_qiime(args.infile)
    else:
        print('ERROR - no file type or style info found')
        sys.exit(-217)
    print result

  
            
    
        
