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
#sys.path.append( '/bioware/python/lib/python2.7/site-packages/' )
from IlluminaUtils.lib import fastalib
import datetime
today = str(datetime.date.today())
import subprocess
import MySQLdb

db = MySQLdb.connect(host="localhost", # your host, usually localhost
                         read_default_file="~/.my.cnf_node"  ) 
cur = db.cursor()

"""

"""
# Global:

    
def get_data(args):
    cur.execute("USE "+args.NODE_DATABASE)
    
    q = "select dataset_id,project_id,project from dataset JOIN project USING(project_id) where project_id='"+args.pid+"'"
    
    print q
    cur.execute(q)
    db.commit()
    dids = []
    proj = ''
    if not cur.rowcount:
        print "No project found -- Continuing on"
    for row in cur.fetchall():
        did = str(row[0])
        proj = row[2]
        dids.append(did)
        pid = row[1]
        
        
    return (proj,dids)
    
        
            
            
def delete_whole_project(args,proj,dids):
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
    if proj != '':
        shutil.rmtree(os.path.join('user_data',args.NODE_DATABASE,args.user,'project:'+proj))
    if args.pid != 0:
        delete_metadata_only(args,proj,dids)
        delete_tax_only(args,proj,dids)
    
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
    
def delete_tax_only(args,proj,dids):    
    
    q = "DELETE from sequence_pdr_info"
    q += " WHERE dataset_id in ('"+ "','".join(dids) +"')"
    cur.execute(q)
    
    q = 'DELETE from dataset'
    q += " WHERE dataset_id in ('"+ "','".join(dids) +"')"
    cur.execute(q)
    
    q = "DELETE from project WHERE project_id = '"+str(args.pid)+"'"
    cur.execute(q)
    
        
    db.commit()
    
    
def delete_metadata_and_tax(args,proj,dids):   
     delete_metadata_only(args,proj,dids)
     delete_tax_only(args,proj,dids)

if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: 5-vamps-clean-db.py  [options]
         
         
         where
            
           -pid/--project_id        clean this pid only
           -p/--project_name        clean this name only
           
           -all/--all               Remove ALL Data for fresh install
                                    Be Careful -- will remove ALL data from db
            

    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
    parser.add_argument("-pid","--project_id",                   
                required=True,  action="store",   dest = "pid",
                help="""ProjectID""")  
    
    parser.add_argument("-db", "--database",          
                required=True,  action='store', dest = "NODE_DATABASE", default='NODATABASE',
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
    args = parser.parse_args()    
    
    (proj,dids) = get_data(args)  
    if args.action == 'delete_whole_project':
        delete_whole_project(args,proj,dids)
        
    elif args.action == 'delete_tax_only' and args.pid != 0:
        delete_tax_only(args,proj,dids)
              
    elif args.action == 'delete_metadata_only' and args.pid != 0:
        delete_metadata_only(args,proj,dids)
        
    elif args.action == 'delete_metadata_and_tax' and args.pid != 0:
        delete_metadata_and_tax(args,proj,dids)
        
    print "DONE"
    print "PID="+str(pid)
