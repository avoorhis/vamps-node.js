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

    

def clean_out_project(args):
    print 'cleaning'
    cur.execute("USE "+args.NODE_DATABASE)
    
    q = "select dataset_id,project_id from dataset where project_id='"+args.pid+"'"
    
    
    print q
    cur.execute(q)
    db.commit()
    dids = []
    if not cur.rowcount:
        print "No project found -- Exiting"
        sys.exit("No project found -- Exiting")
    for row in cur.fetchall():
        did = str(row[0])
        dids.append(did)
        pid = row[1]
        did_file = os.path.join('public','json', args.NODE_DATABASE+'--taxcounts', did+'.json')
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
    q = q_drop % ('custom_metadata_'+str(pid))
    print q
    cur.execute(q)

    q = "DELETE from custom_metadata_fields"
    q += " WHERE project_id = '"+str(pid)+"'"
    print q
    cur.execute(q)
    
    
    
    q = "DELETE from sequence_pdr_info"
    q += " WHERE dataset_id in ('"+ "','".join(dids) +"')"
    cur.execute(q)
    
    q = 'DELETE from dataset'
    q += " WHERE dataset_id in ('"+ "','".join(dids) +"')"
    cur.execute(q)
    
    q = "DELETE from project WHERE project_id = '"+str(pid)+"'"
    cur.execute(q)
    
        
    db.commit()
    return pid
    

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
                required=True,  action='store', dest = "NODE_DATABASE", 
                help=" ") 
    parser.add_argument("-action", "--action",          
                required=True,  action='store', dest = "action", 
                help=" ")           
       
                          
    args = parser.parse_args()    
      
    if args.action == 'delete_project':
        pid = clean_out_project(args)
        print "DONE"
        print "PID="+str(pid)
            
    
        
