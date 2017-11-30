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
import ConfigParser
from IlluminaUtils.lib import fastalib
import datetime
today = str(datetime.date.today())
import subprocess
import pymysql as MySQLdb

"""

"""
# Global:

ranks =['domain','phylum','klass','order','family','genus','species','strain']
    

def clean(args):
    print 'cleaning'
    if args.pid:
        q = "select dataset_id,project_id from dataset where project_id='"+args.pid+"'"
    else:
        q = "SELECT dataset_id,project.project_id from dataset"
        q += " JOIN project using(project_id)"
        q += " WHERE project='"+args.project+"'"
    
    print q
    cur.execute(q)
    db.commit()
    dids = []
    if not cur.rowcount:

        print "No datasets found -- This might not work"
        pid = args.pid

    for row in cur.fetchall():
        did = str(row[0])
        dids.append(did)
        pid = row[1]
        did_file1 = os.path.join(args.json_file_path, NODE_DATABASE+'--datasets_silva119',did+'.json')
        did_file2 = os.path.join(args.json_file_path, NODE_DATABASE+'--datasets_rdp2.6',did+'.json')
        print did_file1
        try:
            os.remove(did_file1)
        except OSError:
            print "File Not Found: "+did_file1
        print did_file2
        try:
            os.remove(did_file2)
        except OSError:
            print "File Not Found: "+did_file2
    
    q = "DELETE from required_metadata_info"
    q += " WHERE dataset_id in ('"+ "','".join(dids) + "')"
    print q
    cur.execute(q)

    q_drop = "DROP TABLE if exists %s"
    q = q_drop % ('custom_metadata_'+str(pid))
    print q
    cur.execute(q)

    q = "DELETE from custom_metadata_fields"
    q += " WHERE project_id = '"+str(pid)+"'"
    print q
    cur.execute(q)
    
    db.commit()    
    
    q = "DELETE from sequence_pdr_info"
    q += " WHERE dataset_id in ('"+ "','".join(dids) +"')"
    print q
    cur.execute(q)
    
    
    #DELETE from common_name_required_metadata_info_temp WHERE dataset_id in ('1120','1121','1122','1123')
    #DELETE from elevation_required_metadata_info_temp WHERE dataset_id in ('1120','1121','1122','1123')
    #DELETE from required_metadata_info_copy_before_big_changes WHERE dataset_id in ('1120','1121','1122','1123')
    #DELETE from metadata_add_temp WHERE project_id = '282'
    dataset_tmp_tables = ['required_metadata_info_old',
    'taxon_id_required_metadata_info_temp',
                            'description_required_metadata_info_temp',
                            'assigned_from_geo_required_metadata_info_temp',
                            'required_metadata_info_new',
                            'dataset_copy',
                            'required_metadata_info_new_copy',
                            'required_metadata_info20170313',
                            'required_metadata_info_copy20170313',
                            'required_metadata_info_copyJun1_17',
                            'required_metadata_info_copy_jun6_17',
                            'required_metadata_info_copy_aug3_17',
                            'required_metadata_info_copy_Nov_7',
                            'required_metadata_info_copy032417',
                            'common_name_required_metadata_info_temp',
                            'elevation_required_metadata_info_temp',
                            'depth_required_metadata_info_temp',
                            'required_metadata_info_copy_before_big_changes',
                            'metadata_add_temp']
    project_tmp_tables = ['custom_metadata_fields_copy','description_required_metadata_info_temp',
                            'common_name_required_metadata_info_temp',
                            'metadata_add_temp',
                            'custom_metadata_fields_copy_aug3_17',
                            'user_project_status']
    for table in dataset_tmp_tables:
        q = "SELECT * FROM information_schema.tables WHERE table_schema = 'vamps2' AND table_name = '"+table+"' LIMIT 1;"
        cur.execute(q)
        if cur.rowcount > 0:
            q = "DELETE from "+ table
            q += " WHERE dataset_id in ('"+ "','".join(dids) +"')"
            print q
            cur.execute(q)
        else:
            print 'DS TMP table not found',table
    
    q = 'DELETE from dataset'
    q += " WHERE dataset_id in ('"+ "','".join(dids) +"')"
    print q
    cur.execute(q)
        
    for table in project_tmp_tables:
        q = "SELECT * FROM information_schema.tables WHERE table_schema = 'vamps2' AND table_name = '"+table+"' LIMIT 1;"
        cur.execute(q)
        if cur.rowcount > 0:
            q = "DELETE from "+ table
            q += " WHERE project_id = '"+str(pid)+"'"
            print q
            cur.execute(q)
        else:
            print 'PJ TMP table not found',table
    
    q = "DELETE from access WHERE project_id = '"+str(pid)+"'"
    print q
    cur.execute(q)
    
    q = "DELETE from project WHERE project_id = '"+str(pid)+"'"
    print q
    cur.execute(q)
    
    # tables sequence and sequence_uniq_info are not touched
        
    db.commit()
    
          
def clean_all(args):
    print 'cleaning'
    print "This will remove everything from",NODE_DATABASE
    if(NODE_DATABASE == 'vamps_js_development'):
        sys.exit('You cannot delete vamps_js_development -- Exiting')
    
    # metadata
    q = "DELETE from required_metadata_info"
    cur.execute(q)
    q = "DELETE from custom_metadata_fields"
    cur.execute(q)
    cur.execute("SHOW tables like 'custom_metadata%'")
    for row in cur.fetchall():
        if row[0] != 'custom_metadata_fields':
            q = "DROP TABLE "+row[0]
            cur.execute(q)
    db.commit()
    
    
    q = "DELETE from sequence_pdr_info"
    cur.execute(q)
    q = "ALTER TABLE sequence_pdr_info AUTO_INCREMENT = 10"
    cur.execute(q)
    
    q = "DELETE from sequence_uniq_info"
    cur.execute(q)
    q = "ALTER TABLE sequence_uniq_info AUTO_INCREMENT = 10"
    cur.execute(q)
    
    q = "DELETE from silva_taxonomy_info_per_seq"
    cur.execute(q)
    q = "ALTER TABLE silva_taxonomy_info_per_seq AUTO_INCREMENT = 10"
    cur.execute(q)
    
    q = "DELETE from silva_taxonomy"
    cur.execute(q)
    q = "ALTER TABLE silva_taxonomy AUTO_INCREMENT = 10"
    cur.execute(q)
    
    # q = "DELETE from summed_counts"
 #    cur.execute(q)
 #    q = "ALTER TABLE summed_counts AUTO_INCREMENT = 10"
 #    cur.execute(q)
    
    # tax domains
    for table in ranks:
        
        q = "DELETE from `"+table+"` where "+table+"_id > 1"
        cur.execute(q)
        q = "ALTER TABLE `"+table+"` AUTO_INCREMENT = 10"
        cur.execute(q)
    
    q = 'DELETE from dataset'
    cur.execute(q)
    q = "ALTER TABLE dataset AUTO_INCREMENT = 10"
    cur.execute(q)
    
    q = 'DELETE from project'
    cur.execute(q)
    q = "ALTER TABLE project AUTO_INCREMENT = 10"
    cur.execute(q)
    
    q = 'DELETE from sequence'
    cur.execute(q)
    q = "ALTER TABLE sequence AUTO_INCREMENT = 10"
    cur.execute(q)
    
    q = "DELETE from rank"
    cur.execute(q)
    q = "ALTER TABLE rank AUTO_INCREMENT = 10"
    cur.execute(q)
    
    db.commit()
    
def delete_metadata(args):
    # metadata
    if args.pid:
        q = "select dataset_id,project_id from dataset where project_id='"+args.pid+"'"
    else:
        sys.exit('No PID found')
    
    print q
    cur.execute(q)
    db.commit()
    dids = []
    if not cur.rowcount:

        print "No datasets found -- This might not work"
        pid = args.pid

    for row in cur.fetchall():
        did = str(row[0])
        dids.append(did)
        
        
    
    q = "DELETE from required_metadata_info"
    q += " WHERE dataset_id in ('"+ "','".join(dids) + "')"
    print q
    cur.execute(q)

    q_drop = "DROP TABLE if exists %s"
    q = q_drop % ('custom_metadata_'+str(args.pid))
    print q
    cur.execute(q)

    q = "DELETE from custom_metadata_fields"
    q += " WHERE project_id = '"+str(args.pid)+"'"
    print q
    cur.execute(q)
if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: 5-vamps-clean-db.py  [options]
         
         
         where
            
           -pid/--project_id        clean this pid only
           -p/--project_name        clean this name only
           
           -all/--all               Remove ALL Data for fresh install
                                    Be Careful -- will remove ALL data from db
            -json_file_path/--json_file_path   json files path Default: ../json
            -host/--host            vampsdb vampsdev dbhost:  Default: localhost
            -mo/--metadata_only

    """
    parser = argparse.ArgumentParser(prog='PROG', usage='%(prog)s [options]')                 
    
    
                                                    
    parser.add_argument("-pid","--project_id",                   
                required=False,  action="store",   dest = "pid", default='',
                help="""ProjectID""")  
    
         
    # parser.add_argument("-p", "--project_name",          
#                 required=False,  action='store', dest = "project",  default='',
#                 help="Project name") 
    
    parser.add_argument("-all", "--all",          
                required=False,  action='store_true', dest = "all",  default=False,
                help=" ") 
    parser.add_argument("-mo", "--metadata_only",          
                required=False,  action='store_true', dest = "metadata_only",  default=False,
                help=" ") 
    parser.add_argument("-host", "--host",    
                required=False,  action='store', dest = "dbhost",  default='localhost',
                help="")
    parser.add_argument("-db", "--db",    
                required=False,  action='store',  dest = "db",  default='vamps_development',
                help="")           
    parser.add_argument("-json_file_path", "--json_file_path",        
                required=False,  action='store', dest = "json_file_path",  default='../../json', 
                help="")   
    if len(sys.argv[1:])==0:
        print myusage
        sys.exit()                      
    args = parser.parse_args()    
    
    
    if not args.pid and not args.project and not args.all:
        print myusage
        sys.exit()
    args.datetime     = str(datetime.date.today()) 
       
    
    if args.dbhost == 'vampsdb' or args.dbhost == 'vamps':
        args.dbhost = 'vampsdb'
        args.json_file_path = '/groups/vampsweb/vamps_node_data/json'
        args.NODE_DATABASE = 'vamps2'
    elif args.dbhost == 'vampsdev':
        args.json_file_path = '/groups/vampsweb/vampsdev_node_data/json'
        args.NODE_DATABASE = 'vamps2'
    else:
        args.json_file_path = '../../json'
        args.NODE_DATABASE = args.db
        args.dbhost = 'localhost'
    print "ARGS: dbhost  =",args.dbhost
    if os.path.exists(args.json_file_path):
        print 'Validated: json file path'
    else:
        print "Could not find json directory: '",args.json_file_path,"'-Exiting"
        sys.exit(-1)
    print "ARGS: json_dir=",args.json_file_path 
    if args.dbhost == 'vampsdev':
        args.dbhost = 'bpcweb7'

    db = MySQLdb.connect(host=args.dbhost, # your host, usually localhost
                             read_default_file="~/.my.cnf_node"  )
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
                print str(i)+' - '+row[0]+';  '
                i += 1
    
        db_no = input("\nchoose database number: ")
        if int(db_no) < len(dbs):
            NODE_DATABASE = dbs[db_no]
        else:
            sys.exit("unrecognized number -- Exiting")
        
    print
    cur.execute("USE "+NODE_DATABASE)
    # if args.host == 'vampsdev':
    #     args.file_base = os.path.join('/','groups','vampsweb','vampsdev_node_data','json', NODE_DATABASE+'--datasets')
    # else:
    #     args.file_base = os.path.join('../json', NODE_DATABASE+'--datasets')
    
    if args.all:
        all_really = input("\nDo you REALLY want to delete all??? from: "+NODE_DATABASE+ ' (y/N)')
        if all_really == 'y' or all_really == 'y':
            clean_all(args)
        else:
            print 'No Delete --Exiting' 
            sys.exit(-1) 
    elif args.metadata_only:
        print 'Deleting Metadata only'
        delete_metadata(args)        
    else:
        print 'Database:',NODE_DATABASE
        if not args.pid and not args.project:
            print myusage
            sys.exit('Needs either project name (-p) or project ID (-pid) -- Exiting (OR -all to empty the database)')
        clean(args)
    print 'Now, restart the server!'        
    
    