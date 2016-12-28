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
import ConfigParser
#sys.path.append( '/bioware/python/lib/python2.7/site-packages/' )
from IlluminaUtils.lib import fastalib
import datetime
today = str(datetime.date.today())
import subprocess
import MySQLdb

"""

"""
# Global:

    
def get_data(args):
    cur.execute("USE "+args.NODE_DATABASE)
    
    q = "select dataset_id,dataset,project_id,project from dataset JOIN project USING(project_id) where project_id='"+args.pid+"'"
    
    print q
    cur.execute(q)
    args.obj.commit()
    dids = []
    dsets = []
    proj = ''
    if not cur.rowcount:
        print "No project found -- Continuing on"
    for row in cur.fetchall():
        did = str(row[0])
        ds = row[1]
        dsets.append(ds)
        proj = row[3]
        dids.append(did)
        pid = row[2]
        
        
    return (proj, dids, dsets)
    
        
            
            
def delete_whole_project(args,proj,dids,dsets):
    print 'cleaning'
    
    for did in dids:
        did_file = os.path.join('public','json', args.NODE_DATABASE+'--taxcounts', did+'.json')
        print did_file
        try:
            os.remove(did_file)
        except OSError:
            print "File Not Found: "+did_file
    # delete files in public/json/NODE_DATABASE/args.user/pid.json
    # grab taxcounts
    # grab metadata
    # delete dir: /user_data/NODE_DATABASE/args.user/project:''
    if proj == '':
        proj = args.project        
    # if proj != '':
    #     try:
    #         shutil.rmtree(os.path.join('user_data',args.NODE_DATABASE,args.user,'project:'+proj))
    #     except OSError:
    #         print 'Project dir not found: '+os.path.join('user_data',args.NODE_DATABASE,args.user,'project:'+proj)
    if args.pid != 0:
        delete_metadata_only(args,proj,dids)
        delete_tax_only(args,proj,dids,dsets)
    
def delete_metadata_only(args,proj,dids):
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
    
def delete_tax_only(args,proj,dids,dsets):    
    
    for did in dids:
        
        did_file = os.path.join(args.process_dir,'public','json', args.NODE_DATABASE+'--datasets', did+'.json')
        print did_file
        try:
            os.remove(did_file)
        except OSError:
            print "File Not Found: "+did_file
            
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
    
    q = "DELETE from sequence_pdr_info"
    q += " WHERE dataset_id in ('"+ "','".join(dids) +"')"
    cur.execute(q)
    
    q = 'DELETE from dataset'
    q += " WHERE dataset_id in ('"+ "','".join(dids) +"')"
    cur.execute(q)
    
    q = "DELETE from project WHERE project_id = '"+str(args.pid)+"'"
    cur.execute(q)
    
        
    args.obj.commit()
    for ds in dsets:
        gast_dir = os.path.join(args.process_dir,'user_data', args.NODE_DATABASE, args.user,'project:'+proj,'analysis',ds,'gast')
        try:
            shutil.rmtree(gast_dir)
        except:
            print gast_dir, 'not found or removed'
        rdp_dir = os.path.join(args.process_dir,'user_data', args.NODE_DATABASE, args.user,'project:'+proj,'analysis',ds,'rdp')
        try:
            shutil.rmtree(rdp_dir)
        except:
            print rdp_dir, 'not found or removed'
    
    
def delete_metadata_and_tax(args,proj,dids,dsets):   
     delete_metadata_only(args,proj,dids)
     delete_tax_only(args,proj,dids,dsets)

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
    parser.add_argument("-pdir", "--process_dir",          
                required=False,  action='store', dest = "process_dir", default='/',
                help=" ")                    
    args = parser.parse_args()    
    
    LOG_FILENAME = os.path.join(args.process_dir,'logs','script_utils.log')
    print LOG_FILENAME
    
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

    
    
    (proj,dids,dsets) = get_data(args)  
    if args.action == 'delete_whole_project':
        delete_whole_project(args,proj,dids,dsets)
        
    elif args.action == 'delete_tax_only' and args.pid != 0:
        delete_tax_only(args,proj,dids,dsets)
              
    elif args.action == 'delete_metadata_only' and args.pid != 0:
        delete_metadata_only(args,proj,dids)
        
    elif args.action == 'delete_metadata_and_tax' and args.pid != 0:
        delete_metadata_and_tax(args,proj,dids,dsets)
        
    print "DONE"
    print "PID="+str(args.pid)
