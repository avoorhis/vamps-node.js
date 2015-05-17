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
        did_file = os.path.join('public','json', NODE_DATABASE+'--taxcounts', did+'.json')
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
                required=False,  action="store",   dest = "pid", default='',
                help="""ProjectID""")  
    
         
    parser.add_argument("-p", "--project_name",          
                required=False,  action='store', dest = "project",  default='',
                help="Project name") 
    
    
    parser.add_argument("-all", "--all",          
                required=False,  action='store_true', dest = "all",  default=False,
                help=" ") 
                
       
                          
    args = parser.parse_args()    
    if not args.pid and not args.project and not args.all:
        print myusage
        sys.exit()
    args.datetime     = str(datetime.date.today())    
    
    
    db = MySQLdb.connect(host="localhost", # your host, usually localhost
                          user="ruby", # your username
                          passwd="ruby") # name of the data base
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
    if args.all:
        if NODE_DATABASE == 'vamps_js_development':
            sys.exit('You cannot delete all from '+NODE_DATABASE)
        else:
            clean_all(args)
    else:
        print 'Database:',NODE_DATABASE
        if not args.pid and not args.project:
            print myusage
            sys.exit('Needs either project name (-p) or project ID (-pid) -- Exiting (OR -all to empty the database)')
        clean(args)
            
    
        
