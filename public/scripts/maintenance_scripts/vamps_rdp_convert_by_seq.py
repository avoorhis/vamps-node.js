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
from time import sleep
import ConfigParser
from IlluminaUtils.lib import fastalib
import rdp.rdp as rdp
import datetime
today = str(datetime.date.today())
import subprocess
import pymysql as MySQLdb
import pprint
pp = pprint.PrettyPrinter(indent=4)

"""
New Table:
CREATE TABLE `summed_counts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `dataset_id` int(11) unsigned DEFAULT NULL,
  `domain_id` int(11) unsigned DEFAULT NULL,
  `phylum_id` int(11) unsigned DEFAULT NULL,
  `klass_id` int(11) unsigned DEFAULT NULL,
  `order_id` int(11) unsigned DEFAULT NULL,
  `family_id` int(11) unsigned DEFAULT NULL,
  `genus_id` int(11) unsigned DEFAULT NULL,
  `species_id` int(11) unsigned DEFAULT NULL,
  `strain_id` int(11) unsigned DEFAULT NULL,
  `rank_id` tinyint(11) unsigned DEFAULT NULL,
  `count` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `summed_counts_ibfk_11` (`dataset_id`),
  KEY `summed_counts_ibfk_1` (`strain_id`),
  KEY `summed_counts_ibfk_3` (`genus_id`),
  KEY `summed_counts_ibfk_4` (`domain_id`),
  KEY `summed_counts_ibfk_5` (`family_id`),
  KEY `summed_counts_ibfk_6` (`klass_id`),
  KEY `summed_counts_ibfk_7` (`order_id`),
  KEY `summed_counts_ibfk_8` (`phylum_id`),
  KEY `summed_counts_ibfk_9` (`species_id`),
  KEY `summed_counts_ibfk_10` (`rank_id`),
  CONSTRAINT `summed_counts_ibfk_11` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`dataset_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_1` FOREIGN KEY (`strain_id`) REFERENCES `strain` (`strain_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_3` FOREIGN KEY (`genus_id`) REFERENCES `genus` (`genus_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_4` FOREIGN KEY (`domain_id`) REFERENCES `domain` (`domain_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_5` FOREIGN KEY (`family_id`) REFERENCES `family` (`family_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_6` FOREIGN KEY (`klass_id`) REFERENCES `klass` (`klass_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_7` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_8` FOREIGN KEY (`phylum_id`) REFERENCES `phylum` (`phylum_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_9` FOREIGN KEY (`species_id`) REFERENCES `species` (`species_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_10` FOREIGN KEY (`rank_id`) REFERENCES `rank` (`rank_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=464 DEFAULT CHARSET=latin1;


"""
# Global:
 # SUMMED_TAX_COLLECTOR[ds][rank][tax_string] = count
classifiers = {"GAST":{'ITS1':1,'SILVA108_FULL_LENGTH':2,'GG_FEB2011':3,'GG_MAY2013':4},
                "RDP":{'ITS1':6,'2.10.1':5,'GG_FEB2011':7,'GG_MAY2013':8},
                'unknown':{'unknown':9}}
ranks =['domain','phylum','klass','order','family','genus','species','strain']
tax_ids = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id','strain_id']
accepted_domains = ['bacteria','archaea','eukarya','fungi','organelle','unknown']
# ranks =[{'name':'domain', 'id':1,'num':0},
#         {'name':'phylum', 'id':4,'num':1},
#         {'name':'klass',  'id':5,'num':2},
#         {'name':'order',  'id':6,'num':3},
#         {'name':'family', 'id':8,'num':4},
#         {'name':'genus',  'id':9,'num':5},
#         {'name':'species','id':10,'num':6},
#         {'name':'strain', 'id':11,'num':7}]
q = "SELECT %s from sequence"
q += " join sequence_uniq_info using(sequence_id)"
q += " where rdp_taxonomy_info_per_seq_id is null"

def get_seq_count(args):
    global q
    global mysql_conn, cur 
    select = "count(sequence.sequence_id)" 
    q_count = q % (select)
    print('Count Query',q_count)
    cur.execute(q_count)
    rows = cur.fetchone()    
    count = int(rows[0])
    #print('here0',count,args.limit)
    if args.limit and count > int(args.limit):
        count = int(args.limit)
    return count
    
def start(args):
  
    select = "UNCOMPRESS(sequence_comp) as seq, sequence_id"
    global q
    global SEQ_COLLECTOR
    global RANK_COLLECTOR
   
    RANK_COLLECTOR={}
   
    
    print 'CMD> ',sys.argv
    
    global mysql_conn, cur    
   
    os.chdir(args.project_dir)
    
    get_ranks()
    max_per_fasta = args.max_seqs_per_file
    if args.total_seq_count > int(max_per_fasta):
        number_of_files = int(args.total_seq_count / int(max_per_fasta))
        count_per_fasta = max_per_fasta
    else:
        number_of_files = 1
        count_per_fasta = args.total_seq_count
    if number_of_files > args.max_file_count:
        print('Too many files', number_of_files)
         
    pdir = './seqs_rdp' 
    if not os.path.exists(pdir):
        os.makedirs(pdir)
    else:
        shutil.rmtree(pdir)           
        os.makedirs(pdir)
        
    
    file_pointers = [] 
    for n in range(number_of_files):   
        unique_file = os.path.join(pdir,str(n)+'-fasta.fa.unique')
        file_pointers.append(open(unique_file,'w'))
    
    q_seq = q % (select)
    if args.limit:
        q_seq = q_seq + ' limit '+args.limit
    print(q_seq)
    cur.execute(q_seq)
    rows = cur.fetchall()
    print 'num files',number_of_files
    print 'tcount',args.total_seq_count
    print 'count per fa file',count_per_fasta
    
    for i,row in enumerate(rows):
        
        fp_index = i % number_of_files
        #print(fp_index,number_of_files)
        fp = file_pointers[fp_index]
        seqid = str(row[1])
        seq = row[0]
        fp.write('>'+seqid+'\n'+seq+'\n')
    
    mysql_conn.commit()
    for fp in file_pointers:
        fp.close()
        
    SEQ_COLLECTOR = {}     
    for n in range(number_of_files):
        SEQ_COLLECTOR[n] = {}    
        unique_file  = os.path.join(pdir,str(n)+'-fasta.fa.unique')
        rdp_out_file = os.path.join(pdir, str(n)+'-rdp.out') # to be created
        print
        print "starting rdp; file#",n,'of',number_of_files
        rdp.run_rdp( unique_file, rdp_out_file, args.path_to_classifier, args.gene, args.site )
        print
        print "starting taxonomy; file#",n,'of',number_of_files
        push_taxonomy(args, n)
        print
        print "starting sequences; file#",n,'of',number_of_files
        push_sequences(args, n)
   
    print "Finished "+os.path.basename(__file__)
    
   
def get_ranks():
    
    global RANK_COLLECTOR
    global mysql_conn, cur
    
    q = "SELECT rank_id,rank from rank"
   
    cur.execute(q)
    rows = cur.fetchall()
    for row in rows:
        RANK_COLLECTOR[row[1]] = row[0]
        

#
#
#
def push_taxonomy(args, file_index):
    
    #global SUMMED_TAX_COLLECTOR
    global mysql_conn, cur
        
    
    pdir = 'seqs_rdp'  
         
    tax_file = os.path.join(pdir,  str(file_index)+'-rdp.out')
    unique_file=os.path.join(pdir, str(file_index)+'-fasta.fa.unique')
    if os.path.exists(tax_file):
        run_rdp_tax_file(args, file_index, tax_file, unique_file)
        

#
#
#                
def run_rdp_tax_file(args, file_index, tax_file, seq_file): 
    
    print 'reading seqfile',seq_file
    f = fastalib.SequenceSource(seq_file)
    
    #print tax_file
    #print seq_file
    global SEQ_COLLECTOR
    while f.next():
        seqid = f.id.split('|')[0]  # may have |frequency
        SEQ_COLLECTOR[file_index][seqid] = {}
        SEQ_COLLECTOR[file_index]['seq'] = f.seq
    f.close()
        
    tax_items = [] 
    with open(tax_file,'r') as fh:
        for line in fh:
            tax_items = []
            items = line.strip().split("\t")
            print
            print items
            # ['21|frequency:1', '', 'Bacteria', 'domain', '1.0', '"Firmicutes"', 'phylum', '1.0', '"Clostridia"', 'class', '1.0', 'Clostridiales', 'order', '1.0', '"Ruminococcaceae"', 'family', '1.0', 'Faecalibacterium', 'genus', '1.0']
            # if boot_value > args.boot_score add to tax_string
            tmp = items[0].split('|')
            seq_id = tmp[0]
            
            #seq_count =1
            tax_line = items[2:]
            boot_to_report = ''
            for i in range(0,len(tax_line),3):
                  #print i,tax_line[i]
                  tax_name = tax_line[i].strip('"').strip("'")
                  rank = tax_line[i+1]
                  boot = float(tax_line[i+2])*100
                  #print boot,args.boot_score
                  if i==0 and tax_name.lower() in accepted_domains and boot > args.boot_score:
                      tax_items.append(tax_name)
                      boot_to_report = str(tax_line[i+2])
                  elif boot > args.boot_score:
                      tax_items.append(tax_name)
                      boot_to_report = str(tax_line[i+2])
                  else:
                      #print 'FAIL',boot,rank,tax_name
                      if rank == 'domain' and boot <= args.boot_score:
                         tax_items = ['Unknown']                   
                         boot_to_report = boot
            rank = ranks[len(tax_items)-1]
            
            
            distance = None
            
            print tax_items
            if tax_items != []:                
                finish_tax(rank, file_index, distance, seq_id, tax_items, boot_to_report)
                pass
            
            
def finish_tax(rank, file_index, distance, seqid, tax_items, boot):
    #tax_collector = {} 
    #global CONFIG_ITEMS
    global SEQ_COLLECTOR
    #global DATASET_ID_BY_NAME
    #global RDP_IDS_BY_TAX
    global RANK_COLLECTOR
    #global TAX_ID_BY_RANKID_N_TAX
    #global SUMMED_TAX_COLLECTOR
    global mysql_conn, cur
    tax_string = ';'.join(tax_items)       
   
   
    SEQ_COLLECTOR[file_index][seqid]['taxonomy'] = tax_string
    SEQ_COLLECTOR[file_index][seqid]['rank'] = rank
    SEQ_COLLECTOR[file_index][seqid]['boot'] = boot                      
    q1 = "SELECT rank_id from rank where rank = '"+rank+"'"
    
    cur.execute(q1)
    mysql_conn.commit()
   
    row = cur.fetchone()
             
    SEQ_COLLECTOR[file_index][seqid]['rank_id'] = row[0] 
    
   
    sumtax = ''
    for i in range(0,8):
        
        rank_id = RANK_COLLECTOR[ranks[i]]
        if len(tax_items) > i:
            
            taxitem = tax_items[i]
            
        else:
            taxitem = ranks[i]+'_NA'
        sumtax += taxitem+';'
        
      
    
    if tax_items[0].lower() in accepted_domains:
        ids_by_rank = []
        for i in range(0,8):
            #print i,len(tax_items),tax_items[i]
            rank_name = ranks[i]
            rank_id = RANK_COLLECTOR[ranks[i]]
            
            if len(tax_items) > i:
                if ranks[i] == 'species':
                    t = tax_items[i].lower()
                else:
                    t = tax_items[i].capitalize()
                
                if tax_items[i].lower() != (rank_name+'_NA').lower():
                    name_found = False
                    # if rank_name in tax_collector:
                    #     tax_collector[rank_name].append(t)
                    # else:
                    #     tax_collector[rank_name] = [t]
            else:
                t = rank_name+'_NA'
            
            
                
            q2 = "INSERT ignore into `"+rank_name+"` (`"+rank_name+"`) VALUES('"+t+"')"
          
            cur.execute(q2)
            mysql_conn.commit() 
            tax_id = cur.lastrowid
            if tax_id == 0:
                q3 = "select "+rank_name+"_id from `"+rank_name+"` where `"+rank_name+"` = '"+t+"'"
                
                cur.execute(q3)
                mysql_conn.commit() 
                row = cur.fetchone()
                tax_id=row[0]
            ids_by_rank.append(str(tax_id))
           
      
        q4 =  "INSERT ignore into rdp_taxonomy ("+','.join(tax_ids)+",created_at)"
        q4 += " VALUES("+','.join(ids_by_rank)+",CURRENT_TIMESTAMP())"
        #
       
        print q4
        cur.execute(q4)
        mysql_conn.commit() 
        rdp_tax_id = cur.lastrowid
        if rdp_tax_id == 0:
            q5 = "SELECT rdp_taxonomy_id from rdp_taxonomy where ("
            vals = ''
            for i in range(0,len(tax_ids)):
                vals += ' '+tax_ids[i]+"="+ids_by_rank[i]+' and'
            q5 = q5 + vals[0:-3] + ')'
            #print q5
            
            cur.execute(q5)
            mysql_conn.commit() 
            row = cur.fetchone()
            rdp_tax_id=row[0]
            #print 'silva_tax_id',silva_tax_id
        print 'rdp_tax_id',rdp_tax_id
        #RDP_IDS_BY_TAX[tax_string] = rdp_tax_id
        #SEQ_COLLECTOR[seqid]['rdp_tax_id'] = rdp_tax_id
        SEQ_COLLECTOR[file_index][seqid]['rdp_tax_id'] = rdp_tax_id
    else:
        print 'MISSING ',tax_items[0].lower()
        sys.exit()
                
                
             
def push_sequences(args, file_index):
    # sequences
    #print
    
    global SEQ_COLLECTOR
    global mysql_conn, cur
    for seqid in SEQ_COLLECTOR[file_index]:
    
        print 
        print SEQ_COLLECTOR[file_index][seqid]
        if 'taxonomy' in SEQ_COLLECTOR[file_index][seqid]:
            rdp_tax_id = str(SEQ_COLLECTOR[file_index][seqid]['rdp_tax_id'])
            
            boot = SEQ_COLLECTOR[file_index][seqid]['boot']
           
            rank_id = str(SEQ_COLLECTOR[file_index][seqid]['rank_id'])
            
            q = "INSERT ignore into rdp_taxonomy_info_per_seq"
            q += " (sequence_id, rdp_taxonomy_id, rank_id, boot_score)"
            q += " VALUES ('%s','%s','%s','%s')" % (str(seqid), str(rdp_tax_id), str(rank_id), boot)
           
            print q
            cur.execute(q)
            mysql_conn.commit()
            rdp_tax_seq_id = cur.lastrowid
            if rdp_tax_seq_id == 0:
                q3 = "select rdp_taxonomy_info_per_seq_id from rdp_taxonomy_info_per_seq"
                q3 += " where sequence_id = '"+str(seqid)+"'"
                print 'DUP silva_tax_seq',q3
                cur.execute(q3)
                mysql_conn.commit() 
                row = cur.fetchone()
                rdp_tax_seq_id = row[0]
        

            #q4 = "INSERT ignore into sequence_uniq_info (sequence_id, rdp_taxonomy_info_per_seq_id)"
            #q4 += " VALUES('%s','%s')" % (str(seqid), str(rdp_tax_seq_id))
            q4 = "UPDATE ignore sequence_uniq_info set rdp_taxonomy_info_per_seq_id='%s'"
            q4 += " WHERE sequence_id='%s'" 
            q4 = q4 % (str(rdp_tax_seq_id), str(seqid) )
            print q4
            cur.execute(q4)
            mysql_conn.commit()
        ## don't see that we need to save uniq_ids
    mysql_conn.commit()




if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: vamps_rdp_convert_by_seq.py  [options]
         
       converts null sequences to taxonomy
         where
            -path_to_classifier/--path_to_classifier   REQUIRED
                Location of rdp_classifier diectory 
                vamps:    /groups/vampsweb/vamps/seqinfobin/rdp_classifier_2.6
                vampsdev: /groups/vampsweb/vampsdev/seqinfobin/rdp_classifier_2.6
                or try    /groups/vampsweb/seqinfobin/rdp_classifier_2.6

            -db/--NODE_DATABASE   [Default:vamps_development]
                For vamps and vampsdev this will default to be 'vamps2'

            -site/--site   [Default:local]
                vamps vampsdev or localhost

            -boot/--boot   [Default:80]
                RDP minimum boot score

            -gene/--gene   [Default:16srrna]
                See RDP README: 16srrna, fungallsu, fungalits_warcup, fungalits_unite
            
            -limit/--limit  limits the size of the mysql select queriy [Default:no-limit]
           
"""

    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
    parser.add_argument('-db', '--NODE_DATABASE',         
                required=False,   action="store",  dest = "NODE_DATABASE", default='vamps_development',           
                help = 'node database') 
    
    parser.add_argument("-project_dir", "--project_dir",    
                required=False,  action="store",   dest = "project_dir", default='./',
                help = '')         
    parser.add_argument("-path_to_classifier", "--path_to_classifier",    
                required=True,  action="store",   dest = "path_to_classifier", 
                help = '') 
    parser.add_argument("-site", "--site",    
                required=False,  action='store', choices=['vamps','vampsdev','localhost'], dest = "site",  default='localhost',
                help="")            
    parser.add_argument("-boot", "--boot",    
                required=False,  action='store',  dest = "boot_score",  default=80,
                help="")             
    parser.add_argument("-gene", "--gene",    
                 required=False,  action="store",   dest = "gene", default="16srrna",
                 help = 'See RDP README: 16srrna, fungallsu, fungalits_warcup, fungalits_unite') 
    parser.add_argument("-limit", "--limit",    
                 required=False,  action="store",   dest = "limit", default="",
                 help = '') 
    parser.add_argument("-fc", "--file_count",    
                 required=False,  action="store",   dest = "max_file_count", default=300,
                 help = 'max_file_count') 
    parser.add_argument("-spf", "--seqs_per_file",    
                 required=False,  action="store",   dest = "max_seqs_per_file", default=10000,
                 help = '')                           
    if len(sys.argv[1:]) == 0:
        print myusage
        sys.exit() 
    args = parser.parse_args() 

    # get_pids
    if args.site == 'vamps':
        hostname = 'vampsdb'
        NODE_DATABASE = 'vamps2'
    elif args.site == 'vampsdev':
        hostname = 'bpcweb7'
        NODE_DATABASE = 'vamps2'
    else:
        hostname = 'localhost'
        NODE_DATABASE = args.NODE_DATABASE

    mysql_conn = MySQLdb.connect(db = NODE_DATABASE, host=hostname, read_default_file=os.path.expanduser("~/.my.cnf_node")  )
    # socket=/tmp/mysql.sock
    cur = mysql_conn.cursor()
    
    # tcount = 3000
#     count_per_file = 100
#     num_files = tcount / count_per_file
#     
#     
#     for i in range(tcount):
#         
#         print i, i % num_files
#         
#     print 'numfile',num_files
#     
#     sys.exit()
    args.total_seq_count = get_seq_count(args)
    print 'count',args.total_seq_count
    
    start(args)


