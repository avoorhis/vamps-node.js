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
import configparser as ConfigParser
import datetime
today = str(datetime.date.today())
import subprocess
import pymysql as MySQLdb
import json

"""

"""
# Global:

# req_names = ["altitude", "assigned_from_geo", "collection_date",
#                                 "common_name", "country", "depth", "description",
#                                 "dna_region", "domain", "elevation", "env_biome",
#                                 "env_feature", "env_material", "env_package",
#                                 "fragment_name", "latitude", "longitude",
#                                 "sequencing_platform", "taxon_id"]
# 
# req_names_with_ids = ["altitude", "assigned_from_geo", "collection_date",
#                                 "common_name", "country_id", "depth", "description",
#                                 "dna_region_id", "domain_id", "elevation", "env_biome_id",
#                                 "env_feature_id", "env_material_id", "env_package_id",
#                                 "fragment_name_id", "latitude", "longitude",
#                                 "sequencing_platform_id", "taxon_id"]
req_names = [  "collection_date","env_biome", "env_feature", "env_material", "env_package","geo_loc_name","latitude", "longitude", "dna_region",'adapter_sequence','sequencing_platform','target_gene','domain','illumina_index','primer_suite', 'run'];
req_names_with_ids= [ "collection_date","env_biome_id", "env_feature_id", "env_material_id", "env_package_id","geo_loc_name_id","latitude", "longitude", "dna_region_id",'adapter_sequence_id','sequencing_platform_id','target_gene_id','domain_id','illumina_index_id','primer_suite_id', 'run_id'];
id_queries = [
    {"table":"term","query": "SELECT term_name,term_id FROM term"},
    {"table":"env_package","query": "SELECT env_package,env_package_id FROM env_package"},
    {"table":"dna_region","query": "SELECT dna_region,dna_region_id FROM dna_region"},
    {"table":"run_key","query": "SELECT run_key,run_key_id FROM run_key"},   # adapter_sequence
    {"table":"sequencing_platform","query": "SELECT sequencing_platform,sequencing_platform_id FROM sequencing_platform"},
    {"table":"target_gene","query": "SELECT target_gene,target_gene_id FROM target_gene"},
    {"table":"domain","query": "SELECT domain,domain_id FROM domain"},
    {"table":"illumina_index","query": "SELECT illumina_index,illumina_index_id FROM illumina_index"},
    {"table":"primer_suite","query": "SELECT primer_suite,primer_suite_id FROM primer_suite"},
    {"table":"run","query": "SELECT run,run_id FROM run"}
]
id_null_queries = [
    {"table":"term","query": "SELECT term_id FROM term WHERE term_name = 'unknown'"},
    {"table":"env_package","query": "SELECT env_package_id FROM env_package WHERE env_package = 'unknown'"},
    {"table":"dna_region","query": "SELECT dna_region_id FROM dna_region WHERE dna_region = 'unknown'"},
    {"table":"run_key","query": "SELECT run_key_id FROM run_key WHERE run_key = 'unknown'"},   # adapter_sequence
    {"table":"sequencing_platform","query": "SELECT sequencing_platform_id FROM sequencing_platform WHERE sequencing_platform = 'unknown'"},
    {"table":"target_gene","query": "SELECT target_gene_id FROM target_gene WHERE target_gene = 'unknown'"},
    {"table":"domain","query": "SELECT domain_id FROM domain WHERE domain = 'unknown'"},
    {"table":"illumina_index","query": "SELECT illumina_index_id FROM illumina_index WHERE illumina_index = 'unknown'"},
    {"table":"primer_suite","query": "SELECT primer_suite_id FROM primer_suite WHERE primer_suite = 'unknown'"},
    {"table":"run","query": "SELECT run_id FROM run WHERE run = 'unknown'"}
]

###################################################
def get_null_ids(args):
    global mysql_conn, cur
    unknowns = {}
        
    for q in id_null_queries:
        cur.execute(q['query'])
        db.commit()
        row = cur.fetchone()
        unknowns[q['table']] = row[0]
    
    print ('unknown IDs',unknowns)
    return unknowns
def get_dids_from_db(args):
    q = "SELECT dataset,dataset_id from dataset where project_id='"+args.pid+"'"
    dids_by_dname = {}
    cur.execute(q)
    rows = cur.fetchall()
    for row in rows:
        dids_by_dname[row[0]] = row[1]
    return dids_by_dname
        
    

def get_mdids_from_db(args):
    ids = {}
    for q in id_queries:
        cur.execute(q['query'])
        db.commit()
        rows = cur.fetchall()
        for row in rows:
            if q['table'] not in ids:
                ids[q['table']] = {}          
            ids[q['table']][row[0]] = row[1]
    
    #print ('ids IDs',ids)
    return ids
    
def load_mdata_file(args):
    data = {}
    print
    print('Loading metadata from file')
    
    lol = list(csv.reader(open(args.file_path, 'r'), delimiter=','))
    TMP_METADATA_ITEMS = {}

    #print lol
    keys = lol[0]
    print(keys)
    dname_index  = 0   # update
    #'sequencing_platform': {'454': 1, 'illumina': 2, 'ion_torrent': 3, 'sanger': 4, 'unknown': 5}
    for line in lol[1:]:
        dname = line[dname_index] 
        if dname not in args.dids_by_dname:
            print(dname,'ERROR-Found in file but not in db')
            sys.exit()
        did =  args.dids_by_dname[dname]
        #print(args.mdids['term']['unknown'])          
        if did not in data:
            data[did] = {}                
        for i,mdname in enumerate(keys):
            if mdname == '': # empty column
                continue
            value = line[i]
            #print('val ',value)
            if mdname in ['env_biome', 'env_feature', 'env_material','geo_loc_name']:
                table_name = 'term'
                md_new_name = mdname+'_id'
                #print(table_name)
                #print(args.mdids[table_name])
                #print(value)
                if value in args.mdids[table_name]:
                    val = args.mdids[table_name][value]
                else:
                    val = ''
                
            elif  mdname in [ "env_package", "dna_region", 'adapter_sequence', 'sequencing_platform', 'target_gene', 'domain', 'illumina_index', 'primer_suite', 'run']:
                table_name = mdname
                md_new_name = mdname+'_id'
                #if value.replace('_','-') in args.mdids[table_name]:
                #    val = args.mdids[table_name][value.lower().replace('_','-')]
                print('val',value)
                if value.lower() in args.mdids[table_name]:
                    print('got',value)
                    val = args.mdids[table_name][value.lower()]#.replace('_','').replace(' ','').replace('-','')]
                else:
                    val = ''
                
            elif  mdname == 'run_key':
                table_name = 'run_key'
                md_new_name = 'run_key_id'
                if value in args.mdids[table_name]:
                    val = args.mdids[table_name][value.upper()]
                else:
                    val = ''
                
            else:
                
                table_name = mdname
                md_new_name = mdname
                val = value                    
                #print(mdname,val)
            if mdname in ['latitude','longitude']: 
                try:
                    val = str(float(value))  # must be a float
                    print('val',val)
                except:
                    val = ''
                        
            # here we want to get rid of env_package and replace it with env_package_id (for example)
            data[did][md_new_name] = val   
                
    
    #print(data)
    #sys.exit()
    return data

def split_cust_from_req(args, data):
    print()
    print ('Splitting metadata into req and cust')


    req_metadata = {}
    cust_metadata ={}
    for did in data:
        req_metadata[did] = {}
        cust_metadata[did] = {}
        for name in data[did]:
            if name in req_names_with_ids:
                req_metadata[did][name] = data[did][name]
            else:
                cust_metadata[did][name] = data[did][name]
    print(req_metadata)
    sys.exit()
    #req_names = [  "collection_date","env_biome", "env_feature", "env_material", "env_package","geo_loc_name","latitude", "longitude", "dna_region",'adapter_sequence','sequencing_platform','target_gene','domain','illumina_index','primer_suite', 'run'];
    for did in req_metadata:
        keys = req_metadata[did]
        for name in req_names: 
            
            if name not in keys:
                # we are here to add unknowns to req_metadata
                if name in ['env_biome', 'env_feature', 'env_material', 'geo_loc_name']:
                   req_metadata[did][name+'_id'] = args.unknowns['term']
                
                elif name in ['collection_date', 'latitude', 'longitude']:
                    req_metadata[did][name] = ''
                    pass
                
                elif name in ['adapter_sequence']:
                    req_metadata[did]['adapter_sequence_id'] = args.unknowns['run_key']
                
                else:   #  imprtant for env_package,"dna_region",domain
                   req_metadata[did][name+'_id'] = args.unknowns[name]
                pass

    
    return (req_metadata, cust_metadata)

# def backup_old_cust_table(args):
#     print()
#     print('Backing-up old table')
#     backup_table = 'custom_metadata_'+args.pid+'_'+time.strftime("%Y%m%d_%H%M%S")
#     q1 = 'CREATE TABLE IF NOT EXISTS '+backup_table+' LIKE '+args.cust_table
#     #q2 = 'INSERT '+backup_table+' SELECT * FROM '+args.cust_table
#     run_mysql_query(q1)
#     #run_mysql_query(q2)

def drop_old_cust_table(args):
    print()
    print("Dropping old table")
    q_drop = "DROP TABLE if exists %s"
    q = q_drop % (args.cust_table)
    run_mysql_query(q)

def create_new_cust_table(args, cust_metadata):
    print()
    print('Creating new cust table')
    name_lookup = {}
    for did in cust_metadata:
        for mdname in cust_metadata[did]:
            name_lookup[mdname] = 1
    qCreateCustTable = "CREATE TABLE "+ args.cust_table+" (\n"
    qCreateCustTable += "`custom_metadata_"+args.pid+"_id`  int(10) unsigned NOT NULL AUTO_INCREMENT,\n"
    qCreateCustTable += "`project_id` int(11) unsigned NOT NULL,\n"
    qCreateCustTable += "`dataset_id` int(11) unsigned NOT NULL,\n"
    for mdname in name_lookup:
        qCreateCustTable += "`"+mdname+"` varchar(128) DEFAULT NULL,\n"
    qCreateCustTable += "PRIMARY KEY (`custom_metadata_"+args.pid+"_id`),\n"
    qCreateCustTable += "UNIQUE KEY `unique_key` (`project_id`,`dataset_id`"
    for i,mdname in enumerate(name_lookup):
        if i< 10:
            qCreateCustTable += ",`"+mdname+"`"
    qCreateCustTable += "),\n"
    qCreateCustTable += "KEY `project_id` (`project_id`),\n"
    qCreateCustTable += "KEY `dataset_id` (`dataset_id`),\n"
    qCreateCustTable += "CONSTRAINT `custom_metadata_"+args.pid+"_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON UPDATE CASCADE,\n"
    qCreateCustTable += "CONSTRAINT `custom_metadata_"+args.pid+"_ibfk_2` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`dataset_id`) ON UPDATE CASCADE\n"
    qCreateCustTable += ") ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;"
    print(qCreateCustTable)
    run_mysql_query(qCreateCustTable)

def enter_cust_data(args, cust_metadata):
    print()
    print('Entering custom metadata')
    
    for did in cust_metadata:
        qInsert = "INSERT INTO "+args.cust_table+' (`'
        name_list  = ['project_id','dataset_id']
        value_list = [str(args.pid),str(did)]
        
        #print('value_list',value_list)
        for mdname in cust_metadata[did]:
            name_list.append(mdname)
            value_list.append(str(cust_metadata[did][mdname]))
        
        qInsert += '`,`'.join(name_list)
        qInsert += "`) VALUES ('"
        qInsert += "','".join(value_list)
        qInsert += "')"
        
        run_mysql_query(qInsert)

def delete_cust_fields(args):
    print()
    print("Deleting old custom metadata from table: custom_metadata_fields")
    q1 = "DELETE from custom_metadata_fields WHERE project_id='"+args.pid+"'"
    run_mysql_query(q1)

def enter_cust_new_fields(args, cust_metadata):
    print()
    print("Entering new custom metadata fields in table: custom_metadata_fields")
    name_lookup = {}
    for did in cust_metadata:
        for mdname in cust_metadata[did]:
            name_lookup[mdname] = cust_metadata[did][mdname]
    q = "INSERT INTO custom_metadata_fields (project_id,field_name,field_units,example)"
    q += " VALUES"
    for mdname in name_lookup.keys():
        q += "('"+args.pid+"','"+mdname+"','varchar(128)','"+name_lookup[mdname]+"'),\n"

    run_mysql_query(q.strip().strip(',')) # remove trailing comma

def update_req_data(args, req_metadata):
    print()
    print("Updating Required metadata")

    for did in req_metadata:
        q0 = "SELECT required_metadata_id from required_metadata_info where dataset_id='"+str(did)+"'"
        cur.execute(q0)
        count = cur.rowcount
        print('count',count)
        if count == 0:
            print('no row found')
            q = "INSERT into required_metadata_info (`dataset_id`,`"
            sql_names = []
            sql_values = []
            for mdname in req_metadata[did]:
                if mdname in ['collection_date', 'latitude', 'longitude'] and req_metadata[did][mdname] == '':
                    pass # if the value is empty then don't include them at all so they will be null (not zero)
                else:
                    sql_names.append(mdname)                
                    sql_values.append(str(req_metadata[did][mdname]))

            q += "`,`".join(sql_names)+ "`) VALUES('"+str(did)+"','"
            q += "','".join(sql_values) + "')"
        else:
            q = "UPDATE required_metadata_info set "
            for mdname in req_metadata[did]:
                if mdname in ['collection_date', 'latitude', 'longitude'] and req_metadata[did][mdname] == '':
                    #pass  # if the value is empty then don't include them at all so they will be null (not zero)
                    q += mdname + "=null, "
                else:
                    q += mdname + "='" + str(req_metadata[did][mdname]) + "', "
            q = q.strip().strip(',') # remove trailing comma
            q += " WHERE dataset_id='"+str(did)+"'"
        #print(q)
        run_mysql_query(q)

# def update_json_files(args, json_metadata):
#     print()
#     print("Updating Individual JSON files")
#     for did in json_metadata:
#         json_file_path = os.path.join(args.json_file_path,args.NODE_DATABASE+'--datasets_silva119',str(did)+'.json')
#         with open(json_file_path) as json_file:
#             data = json.load(json_file)
#         data['metadata'] = json_metadata[did]
#         with open(json_file_path, 'w') as outfile:
#             json.dump(data, outfile)
#         print('Done writing file',did+'.json')
# 
# def update_group_metadata_file(args, json_metadata):
#     print()
#     print("Updating group metadata file")
#     json_file_path = os.path.join(args.json_file_path,args.NODE_DATABASE+'--metadata.json')
#     with open(json_file_path) as json_file:
#         data = json.load(json_file)
#     for did in json_metadata:
#         data[did] = json_metadata[did]
#     with open(json_file_path, 'w') as outfile:
#             json.dump(data, outfile)
# 




def run_mysql_query(q):
    if not args.quiet:
        print(q)
    try:
        cur.execute(q)
        db.commit()
        return 0
    except MySQLdb.Error as e:
        try:
            print("MySQL Error [%d]: %s" % (e.args[0], e.args[1]))
        except IndexError:
            print("MySQL Error: %s" % str(e))
        sys.exit('mysql error')
    return 1
    
if __name__ == '__main__':
    import argparse


    myusage = """usage: update_metadata_from_file.py  [options]
         will update both required and custom metadata in the mysql database
         also will update the individual json files and the group metadata
         file.   DELIMITER is a comma! 
         
         EDIT dataset column on line 128:   dname_index  = 0   # update this!!!
         
         example command line:
         ./update_metadata_from_file.py -pid 4700 -f JJV_TIM_trimmed_metadataEDIT.csv  -host vamps

         where

           -pid/--project_id    clean this pid only - REQUIRED

            -host/--host        vampsdb vampsdev dbhost:  Default: localhost
            -db/--db            if host==vamps* this is set to vamps2
            -f/--file_path      full path to json metadata file -- REQUIRED
                                    created by node from an uploaded csv file                       
            -q/--quiet          quiet mode
            -prosess/--process_dir  only needed if on localhost to find the json files dir.


    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)



    parser.add_argument("-pid","--project_id",
                required=True,  action="store",   dest = "pid",
                help="""ProjectID""")

    parser.add_argument("-f", "--file_path",
                required=True,  action='store', dest = "file_path",
                help=" ")
    parser.add_argument("-host", "--host",
                required=False,  action='store', choices=['vamps','vampsdev','localhost'], dest = "dbhost",  default='localhost',
                help="")
    parser.add_argument("-db", "--db",
                required=False,  action='store',  dest = "db",  default='vamps_development',  
                help="")
    parser.add_argument("-q", "--quiet",
                required=False,  action='store_true',  dest = "quiet",  default=False,
                help="")
    # parser.add_argument("-process", "--process_dir",
#                 required=False,  action='store',  dest = "process_dir", default='./',
#                 help="")
    
    parser.add_argument("-g", "--go_change_db",
                required=False,  action='store_true',  dest = "go",  default=False,
                help="")
    if len(sys.argv[1:])==0:
        print(myusage)
        sys.exit()
    args = parser.parse_args()
    if args.quiet:
        print('RUNNING IN QUIET MODE')
    if not args.pid:
        print(myusage)
        sys.exit()
    args.datetime     = str(datetime.date.today())

    print("ARGS: dbhost  =",args.dbhost)
    if args.dbhost == 'vamps' or args.dbhost == 'vampsdb' or args.dbhost == 'bpcweb8':
        #args.json_file_path = '/groups/vampsweb/vamps_node_data/json'
        args.NODE_DATABASE = 'vamps2'
        hostname = 'vampsdb'
    elif args.dbhost == 'vampsdev' or args.dbhost == 'bpcweb7':
        #args.json_file_path = '/groups/vampsweb/vampsdev_node_data/json'
        args.NODE_DATABASE = 'vamps2'
        hostname = 'bpcweb7'
    else:
        #args.json_file_path = os.path.join(args.process_dir,'public','json')
        args.NODE_DATABASE = args.db
        hostname = 'localhost'
        # if os.path.isdir(args.json_file_path):
#             print('json_file_path VALIDATED')
#         else:
#             print('json_file_path DID NOT VALIDATE:',args.json_file_path)
#             sys.exit('Exiting')

    db = MySQLdb.connect(db = args.NODE_DATABASE, host=hostname, read_default_file=os.path.expanduser("~/.my.cnf_node")  )
    cur = db.cursor()
    cur.execute("SHOW databases")
    dbs = []
    db_str = ''
    i = 0
    if args.NODE_DATABASE:
        NODE_DATABASE = args.NODE_DATABASE
    else:
        for row in cur.fetchall():
            if row[0] != 'mysql' and row[0] != 'information_schema':
                dbs.append(row[0])
                db_str += str(i)+'-'+row[0]+';  '
                print(str(i)+' - '+row[0]+';  ')
                i += 1

        db_no = input("\nchoose database number: ")
        if int(db_no) < len(dbs):
            NODE_DATABASE = dbs[db_no]
        else:
            sys.exit("unrecognized number -- Exiting")

    print()
    cur.execute("USE "+NODE_DATABASE)
    args.unknowns = get_null_ids(args)
    args.cust_table = 'custom_metadata_'+args.pid
    args.dids_by_dname = get_dids_from_db(args)
    
    args.mdids = get_mdids_from_db(args)
    json_metadata = load_mdata_file(args)
    
    (req_metadata, cust_metadata) = split_cust_from_req(args, json_metadata)
    
    
    if not args.quiet:
        print()
        print('req_metadata:',req_metadata)
        print()
        print('cust_metadata:',cust_metadata)
    if not args.go:
        print("If all looks good add '-g' to command line to alter the database")
        sys.exit()
        
      
    #backup_old_cust_table(args)
    
    print('uks')
    print(args.unknowns)
    drop_old_cust_table(args)
    create_new_cust_table(args, cust_metadata)
    enter_cust_data(args, cust_metadata)   # into custom table
    delete_cust_fields(args)    #also delete from custom_metadata_fields where dids in....
    enter_cust_new_fields(args, cust_metadata)
    update_req_data(args, req_metadata)
    #update_json_files(args, json_metadata)
    #update_group_metadata_file(args, json_metadata)
    #finished
