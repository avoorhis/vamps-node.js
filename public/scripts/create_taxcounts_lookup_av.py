#!/usr/bin/env python

""" 
	create_counts_lookup.py


"""

import sys,os
import argparse
import MySQLdb
import json

hostname = 'localhost'
username = 'ruby'
password = 'ruby'
NODE_DATABASE = "vamps_js_development"
#NODE_DATABASE = "vamps_js_dev_av"
out_file = "tax_counts_lookup.json"
db = MySQLdb.connect(host=hostname, # your host, usually localhost
                     user=username, # your username
                      passwd=password, # your password
                      db=NODE_DATABASE) # name of the data base
cur = db.cursor() 
parser = argparse.ArgumentParser(description="") 
query_core =  "FROM sequence_pdr_info" 
query_core += " JOIN sequence_uniq_info USING(sequence_id)"
query_core += " JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id)"
query_core += " JOIN silva_taxonomy USING(silva_taxonomy_id)" 

strain_query = "SELECT seq_count, dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id" 
strain_query += query_core

ranks = ['domain','phylum','klass','order','family','genus','species','strain']
def go(args):
	"""
		count_lookup_per_dsid[dsid][rank][taxid] = count
		
		count_lookup_per_dsid[dsid] = 
		{
		"domain":[
			Archaea_id:23,
			Bacteria_id:234,
		],
		"phylum":[

		],
		"klass":[

		],
		"order":[

		],
		"family":[

		],
		"order":[

		]}
		

	"""
	counts_lookup = {}
	
    print query
    
    cur.execute(query)
    for row in cur.fetchall():
        print row
        count       = int(row[0])
        did         = row[1]
        domain_id   = row[2]
        phylum_id   = row[3]
        klass_id    = row[4]
        order_id    = row[5]
        family_id   = row[6]
        genus_id    = row[7]
        species_id  = row[8]
        strain_id   = row[9]
        
        for rank in ranks:
            if did in counts_lookup:
                
                if rank in counts_lookup[did]:
                    counts_lookup[did][rank]
                    counts_lookup[did][rank][domain_id]  += count
                    counts_lookup[did][rank][phylum_id]  += count
                    counts_lookup[did][rank][klass_id]   += count
                    counts_lookup[did][rank][order_id]   += count
                    counts_lookup[did][rank][family_id]  += count
                    counts_lookup[did][rank][genus_id]   += count
                    counts_lookup[did][rank][species_id] += count
                    counts_lookup[did][rank][strain_id]  += count
                    
                else:
                    counts_lookup[did][rank] = {}
                    counts_lookup[did][rank][domain_id]  = count
                    counts_lookup[did][rank][phylum_id]  = count
                    counts_lookup[did][rank][klass_id]   = count
                    counts_lookup[did][rank][order_id]   = count
                    counts_lookup[did][rank][family_id]  = count
                    counts_lookup[did][rank][genus_id]   = count
                    counts_lookup[did][rank][species_id] = count
                    counts_lookup[did][rank][strain_id]  = count
                    
                    
            else:
                counts_lookup[did] = {}
                counts_lookup[did][rank] = {}
                counts_lookup[did][rank][domain_id]  = count
                counts_lookup[did][rank][phylum_id]  = count
                counts_lookup[did][rank][klass_id]   = count
                counts_lookup[did][rank][order_id]   = count
                counts_lookup[did][rank][family_id]  = count
                counts_lookup[did][rank][genus_id]   = count
                counts_lookup[did][rank][species_id] = count
                counts_lookup[did][rank][strain_id]  = count
        
        
        
	
	json_str = json.dumps(counts_lookup)		
	print(json_str)
	f = open(out_file,'w')
	f.write(json_str+"\n")
	f.close()
	
	
	
	


#
#
#
if __name__ == '__main__':

	usage = """
		
	"""
	
 	 	
	args = parser.parse_args()
	go(args) 
