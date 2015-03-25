#!/usr/bin/env python

##!/usr/local/www/vamps/software/python/bin/python
##!/usr/bin/env python
##!/usr/local/epd_python/bin/python
##!/bioware/python/bin/python
##!/usr/bin/env python
##!/usr/local/www/vamps/software/python/bin/python
###!/usr/bin/env python

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
import random
import csv
from time import sleep

import MySQLdb
#from apps.ConMySQL import Conn
import time



        
def create_json_obj(args):
    sql = "SELECT project, datasets.id as did, dataset"
    sql += " FROM datasets "
    sql += " JOIN projects ON (projects.id=project_id)"
    sql += " ORDER BY project,dataset"
    # sql = "SELECT project, datasets.id as did, dataset, sum(seq_count) as ds_count"
    # sql += " FROM datasets "
    # sql += " JOIN projects ON (projects.id=project_id)"
    # sql += " JOIN sequence_pdr_info on (datasets.id=dataset_id)"
    # sql += " GROUP BY dataset"
    # sql += " ORDER BY project,dataset"
    
    print
    print sql
    cur = args.db.cursor() 
    cur.execute(sql)
    project_hash = {}
    
    for row in cur.fetchall():
        project = row[0]
        did = row[1]
        dataset = row[2]        
          
        if not project:
            continue
        if project in project_hash:
            #pd_hash[pd].append({'name':row[1],'value':row[2],'units':row[3]})
            project_hash[project].append({ 'did':did,'dname':dataset})
        else:
            project_hash[project] = [{ 'did':did,'dname':dataset }]
        
    #print project_hash
    
    out_file_name = 'all_datasets'+time.strftime("%Y%m%d_%H%M%S")+'.js'
    fp = open(out_file_name,'w')
    
    
    
    # These items should be in all metadata so I remove them explicitly then
    # add them back at the front
    # [collection_date,sample_id,lat,lon depth, envo_biome,envo_feature,env_material] should be at head of list
    
    fp.write('// all_datasets.js\r')
    fp.write('var datasets = {}\r\r' )
    fp.write('// SELECT project, datasets.id as did, dataset\r')
    fp.write('//   FROM datasets \r')
    fp.write('//   JOIN projects ON (projects.id=project_id)\r')
    #fp.write('//   JOIN sequence_pdr_info on (datasets.id=dataset_id)\r')
    #fp.write('//   GROUP BY dataset\r')
    fp.write('//   ORDER BY project,dataset\r')
    fp.write('datasets.ALL = { \r')
    fp.write('  projects: [\r')
    
    
    #fp.write('\r')
    for p in project_hash:
        fp.write("    { name: '"+p+"', datasets:\r")
        fp.write('      [\r')
        for info in project_hash[p]:
            # {'did':'85', 'dname':'16_Bedford_Hills',          'ds_count':'489'},
            fp.write("        {'did':'"+str(info['did'])+"', 'dname':'"+info['dname']+"'},\r")
           
        fp.write('      ]},\r')   
        fp.write('\r')
    fp.write(']}\r')  
    fp.write('module.exports = datasets;\r')  
    fp.close()
    print '\nDone writing to '+out_file_name
        
if __name__ == '__main__':
    import argparse
    
    # DEFAULTS
    site = 'vampsdev'
    
    
    
    myusage = """usage: metadataDB2Table.py [options]
         
         Load user sequences into the database
         
         where
            
                                   
            --site            vamps or vampsdev.
                                [default: localhost]
                                 
            
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)
                                                
    parser.add_argument("-site",                required=False,  action="store",   dest = "site", default='localhost',
                                                    help="")  
                                                                                 
                                         
    
    args = parser.parse_args()
    
    
    db_host = args.site
    db_name = 'vamps_js_development'
    db_user = 'ruby'
    db_pass = 'ruby'
    
    #print db_host, db_name
    # args.db=MySQLdb.connect(host=db_host, db=db_name, read_default_file="~/.my.cnf")
    args.db=MySQLdb.connect(user=db_user, passwd=db_pass,host=db_host, db=db_name)
    #c = obj.get_cursor()
    
    create_json_obj(args)
        