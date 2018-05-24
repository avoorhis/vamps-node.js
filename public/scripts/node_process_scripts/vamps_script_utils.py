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
import csv, json
import configparser as ConfigParser

import datetime
today = str(datetime.date.today())
import subprocess
import pymysql as MySQLdb

"""

"""
# Global:

    
def get_data(args):
    cur.execute("USE "+args.NODE_DATABASE)
    # pid may be zero 
    if int(args.pid) > 0:
        q = "select dataset_id,dataset,project_id,project from dataset JOIN project USING(project_id) where project_id='"+args.pid+"'"
    elif args.project ! = '':
        q = "select dataset_id,dataset,project_id,project from dataset JOIN project USING(project_id) where project='"+args.project+"'"
    else:
        print("No project Found -- Exiting")
        sys.exit()
    print(q)
    cur.execute(q)
    args.obj.commit()
    dids = []
    dsets = []
    proj = ''
    if not cur.rowcount:
        print("No project Found -- Exiting")
        sys.exit()
    for row in cur.fetchall():
        did = str(row[0])
        ds = row[1]
        dsets.append(ds)
        proj = row[3]
        dids.append(did)
        pid = row[2]
        
        
    return (proj, pid, dids, dsets)
    
        
            
            
def delete_whole_project(args):
    print('cleaning')
    
    # for did in dids:
#         did_file = os.path.join('public','json', args.NODE_DATABASE+'--taxcounts', did+'.json')
#         print(did_file)
#         try:
#             os.remove(did_file)
#         except OSError:
#             print("File Not Found: "+did_file)
    # delete files in public/json/NODE_DATABASE/args.user/pid.json
    # grab taxcounts
    # grab metadata
    # delete dir: /user_data/NODE_DATABASE/args.user/project:''
    
    try:
        shutil.rmtree(os.path.join(args.data_dir,args.NODE_DATABASE,args.user,'project-'+args.proj))
    except OSError:
        print 'Project dir not found: '+os.path.join(args.data_dir,args.NODE_DATABASE,args.user,'project-'+args.proj)
    
    delete_metadata_only(args)
    delete_tax_only(args)
    delete_dids_from_metadata_bulk_file(args)
    
    
def delete_metadata_only(args):
    q = "DELETE from required_metadata_info"
    q += " WHERE dataset_id in ('"+ "','".join(args.dids) + "')"
    print(q)
    cur.execute(q)

    q_drop = "DROP TABLE if exists %s"
    q = q_drop % ('custom_metadata_'+str(args.pid))
    print(q)
    cur.execute(q)

    q = "DELETE from custom_metadata_fields"
    q += " WHERE project_id = '"+str(args.pid)+"'"
    print(q)
    cur.execute(q)
    
    
    delete_dids_from_metadata_bulk_file(args)
    # delete metadata from each did file ??
    
    
def delete_dids_from_metadata_bulk_file(args):
    md_bulk_file = os.path.join(args.jsonfile_dir, args.NODE_DATABASE+'--metadata.json')
    #open and read json
    with open(md_bulk_file) as fp:
        metadata = json.load(fp)
        for did in args.dids:
            del metadata[did]
    md_bulk_file2 = os.path.join(args.jsonfile_dir, args.NODE_DATABASE+'--metadata2.json')
    with open(md_bulk_file2, 'w') as outfile:
        json.dump(metadata, outfile)
    # if file has content the switch them
    
def delete_tax_only(args):    # this should leave ONLY the project directory
    
    for did in args.dids:
        
        did_file1 = os.path.join(args.jsonfile_dir, args.NODE_DATABASE+'--datasets_generic', did+'.json')
        did_file2 = os.path.join(args.jsonfile_dir, args.NODE_DATABASE+'--datasets_rdp2.6', did+'.json')
        did_file3 = os.path.join(args.jsonfile_dir, args.NODE_DATABASE+'--datasets_silva119', did+'.json')
        
        print(did_file1)
        try:
            os.remove(did_file1)
        except OSError:
            #print("File Not Found: "+did_file)
            pass
        try:
            os.remove(did_file2)
        except OSError:
            #print("File Not Found: "+did_file2)
            pass
        try:
            os.remove(did_file3)
        except OSError:
            #print("File Not Found: "+did_file3)
            pass    
    q = "DELETE from required_metadata_info"
    q += " WHERE dataset_id in ('"+ "','".join(args.dids) + "')"
    print(q)
    cur.execute(q)
    args.obj.commit()
    q_drop = "DROP TABLE if exists %s"
    q = q_drop % ('custom_metadata_'+str(args.pid))
    print(q)
    cur.execute(q)
    args.obj.commit()
    q = "DELETE from custom_metadata_fields"
    q += " WHERE project_id = '"+str(args.pid)+"'"
    print(q)
    cur.execute(q)
    args.obj.commit()
    q = "DELETE from matrix_taxonomy_info"
    q += " WHERE dataset_id in ('"+ "','".join(args.dids) +"')"
    print(q)
    cur.execute(q)
    args.obj.commit()
    q = "DELETE from sequence_pdr_info"
    q += " WHERE dataset_id in ('"+ "','".join(args.dids) +"')"
    cur.execute(q)
    args.obj.commit()
    q = 'DELETE from dataset'
    q += " WHERE dataset_id in ('"+ "','".join(args.dids) +"')"
    print(q)
    cur.execute(q)
    args.obj.commit()
    q = "DELETE from project WHERE project_id = '"+str(args.pid)+"'"
    print(q)
    cur.execute(q)        
    args.obj.commit()
    
    delete_dids_from_metadata_bulk_file(args)
    
    
def delete_metadata_and_tax(args):   
     delete_metadata_only(args)
     delete_tax_only(args)
     delete_dids_from_metadata_bulk_file(args)

if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: 5-vamps-clean-db.py  [options]
         
         where
            
           -pid/--project_id        clean this pid only
           -p/--project_name        clean this name only
           -site/--site             vamps, vampsdev or localhost
           -all/--all               Remove ALL Data for fresh install
                                    Be Careful -- will remove ALL data from db
            

    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
    parser.add_argument("-pid","--project_id",                   
                required=True,  action="store",   dest = "pid",
                help="""ProjectID""")  
    
 #    parser.add_argument("-db", "--database",          
#                 required=True,  action='store', dest = "NODE_DATABASE", default='NODATABASE',
#                 help=" ") 
    parser.add_argument("-site", "--site",          
                required=True,  action='store', dest = "site", default='localhost',
                help=" ") 
    parser.add_argument("-action", "--action",          
                required=True,  action='store', dest = "action", default='NOACTION',
                help=" ")           
    
    parser.add_argument("-user", "--user",          
                required=True,  action='store', dest = "user", default='NOUSER',
                help=" ")   
    parser.add_argument("-proj", "--project",          
                required=False,  action='store', dest = "project", default='',
                help=" ")  
    parser.add_argument("-o", "--jsonfile_dir",                   
               required=True,  action="store",   dest = "jsonfile_dir",
               help="""JSON Files Directory""")
    parser.add_argument("-data_dir", "--data_dir",          
                required=True,  action='store', dest = "data_dir", default='user_data',
                help=" config.USER_FILES_BASE ")
                      
    args = parser.parse_args()    
    
    LOG_FILENAME = 'script_utils.log'
    print(LOG_FILENAME)
    
    logging.basicConfig(filename=LOG_FILENAME, level=logging.DEBUG)    
    if args.site == 'vamps':
        #db_host = 'vampsdb'
        db_host = 'bpcweb8'
        args.NODE_DATABASE = 'vamps2'
        db_home = '/groups/vampsweb/vamps/'
    elif args.site == 'vampsdev':
        #db_host = 'vampsdev'
        db_host = 'bpcweb7'
        args.NODE_DATABASE = 'vamps2'
        db_home = '/groups/vampsweb/vampsdev/'
    else:
        db_host = 'localhost'
        db_home = '~/'
        args.NODE_DATABASE = 'vamps_development'
    
    args.obj = MySQLdb.connect( host=db_host, db=args.NODE_DATABASE, read_default_file=os.path.expanduser("~/.my.cnf_node")    )

    #db = MySQLdb.connect(host="localhost", # your host, usually localhost
    #                         read_default_file="~/.my.cnf"  ) 
    cur = args.obj.cursor()

    
    
    (args.proj, args.pid, args.dids, args.dsets) = get_data(args)  
    
    if args.action == 'delete_whole_project':
        delete_whole_project(args)
        
    elif args.action == 'delete_tax_only' and args.pid != 0:
        delete_tax_only(args)
              
    elif args.action == 'delete_metadata_only' and args.pid != 0:
        delete_metadata_only(args)
        
    elif args.action == 'delete_metadata_and_tax' and args.pid != 0:
        delete_metadata_and_tax(args)
        
    print("DONE")
    print("PID="+str(args.pid))
