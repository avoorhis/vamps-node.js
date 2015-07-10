#!/usr/bin/env python

""" 
  create_counts_lookup.py


"""

import sys,os,io
import argparse
import MySQLdb
from IlluminaUtils.lib import fastalib
import json


"""
SELECT sum(seq_count), dataset_id, domain_id,domain
FROM sequence_pdr_info
JOIN sequence_uniq_info USING(sequence_id)
JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id)
JOIN silva_taxonomy USING(silva_taxonomy_id)
JOIN domain USING(domain_id)
JOIN phylum USING(phylum_id)
where dataset_id = '426'
GROUP BY dataset_id, domain_id

SELECT sum(seq_count), dataset_id, domain_id,domain,phylum_id,phylum
FROM sequence_pdr_info
JOIN sequence_uniq_info USING(sequence_id)
JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id)
JOIN silva_taxonomy USING(silva_taxonomy_id)
JOIN domain USING(domain_id)
JOIN phylum USING(phylum_id)
where dataset_id = '426'
GROUP BY dataset_id, domain_id, phylum_id
"""


parser = argparse.ArgumentParser(description="") 
query_all = "SELECT sequence_id as id, UNCOMPRESS(sequence_comp) as seq from sequence" 
query_public = "SELECT sequence_id as id, UNCOMPRESS(sequence_comp) as seq from sequence" 
query_public += " JOIN sequence_pdr_info using (sequence_id)"
query_public += " JOIN dataset using (dataset_id)"
query_public += " JOIN project using (project_id)"
query_public += " WHERE public='1'"

import datetime
now = datetime.datetime.now().strftime("%Y%m%d%H%M")
#print str(now)



def go(args):
    
    num = 0
    if args.outfile_prefix:
        outfile = args.outfile_prefix+'_'+str(now)+'.fa'    
    else:
        if args.public:
            outfile = NODE_DATABASE+'_'+str(now)+'_all_public_seqs.fa'
        else:
            outfile = NODE_DATABASE+'_'+str(now)+'_all_seqs.fa'
    fp = open(outfile,'w')
    if args.sql:
        q = args.sql
    else:
        if args.public:
            q = query_public
        else:
            q = query_all

    print q
    
    try:
        cur.execute(q)
        rows = cur.fetchall()
    except MySQLdb.Error, e:
        try:
            print "MySQL Error [%d]: %s" % (e.args[0], e.args[1])
        except IndexError:
            print "MySQL Error: %s" % str(e)
        sys.exit('ERROR EXIT')
        # Print results in comma delimited format
    
    #print 'List of projects in: '+in_file
    for row in rows:
        
        id = row[0]
        seq = row[1]
        fp.write('>lcl|'+str(id)+"\n")
        fp.write(seq+"\n")
        print 'id:',id,' --seq:',seq
        
    fp.close()
    print 'DONE'


#
#
#
if __name__ == '__main__':

    usage = """
        -sql/--sql  Complete sql query [Optional]
        -p/--public seqs from public projects. [Optional]
        Produce a fasta file 
        uses:
          makeblastdb -in outfile_201507090811.fa -parse_seqids -dbtype nucl -out ALL_SEQS (ALL_PUBLIC_SEQS)
          blast database creation  (outfmt 13 = JSON Blast output):
           >blastn -db <dbname> -query <query_file> -outfmt 13 -out <outfile_name>
    """
    parser.add_argument("-sql","--sql",                   
                required=False,  action="store",   dest = "sql", default='',
                help="""Complete Query SQL""") 
    parser.add_argument("-p","--public",                   
                required=False,  action="store_true",   dest = "public", default=False,
                help="""Complete Query SQL""") 
    parser.add_argument("-r","--region",                   
                required=False,  action="store",   dest = "region", default='v6',
                help="""dna_region of S16 or """) 
    parser.add_argument("-o","--outfile_prefix",                   
                required=False,  action="store",   dest = "outfile_prefix", default='outfile',
                help="""Prefix -to be appended by datestring""")
                
    args = parser.parse_args()
    
    db = MySQLdb.connect(host="localhost", # your host, usually localhost
                             read_default_file="~/.my.cnf"  )
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
    
    #out_file = "tax_counts--"+NODE_DATABASE+".json"
    #in_file  = "../json/tax_counts--"+NODE_DATABASE+".json"
    
    print 'DATABASE:',NODE_DATABASE
    
    go(args)
    
            
    

