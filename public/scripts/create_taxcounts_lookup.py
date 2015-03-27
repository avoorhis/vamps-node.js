#!/usr/bin/env python

""" 
	create_counts_lookup.py


"""

import sys,os
import argparse
import MySQLdb
import json


parser = argparse.ArgumentParser(description="") 
query_core = " FROM sequence_pdr_info" 
query_core += " JOIN sequence_uniq_info USING(sequence_id)"
query_core += " JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id)"
query_core += " JOIN silva_taxonomy USING(silva_taxonomy_id)" 

domain_query = "SELECT sum(seq_count), dataset_id, domain_id"
domain_query += query_core
domain_query += " GROUP BY dataset_id, domain_id"

phylum_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id" 
phylum_query += query_core
phylum_query += " GROUP BY dataset_id, domain_id, phylum_id"

class_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id" 
class_query += query_core
class_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id"

order_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id" 
order_query += query_core
order_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id"

family_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id" 
family_query += query_core
family_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"

genus_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id" 
genus_query += query_core
genus_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id"

species_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id" 
species_query += query_core
species_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id"

strain_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id" 
strain_query += query_core
strain_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id"

ranks = ['domain','phylum','klass','order','family','genus','species','strain']
queries = [{"rank":"domain","query":domain_query},
		   {"rank":"phylum","query":phylum_query},
		   {"rank":"klass","query":class_query},
 		   {"rank":"order","query":order_query},
 		   {"rank":"family","query":family_query},
 		   {"rank":"genus","query":genus_query},
 		   {"rank":"species","query":species_query},
 		   {"rank":"strain","query":strain_query}
		   ]
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
    for q in queries:
        print q
		
        cur.execute(q["query"])
        for row in cur.fetchall():
            print row
            count = int(row[0])
            ds_id = row[1]
            #tax_id = row[2]
            #rank = q["rank"]
            tax_id_str = ''
            for k in range(2,len(row)):
                tax_id_str += '_' + str(row[k])
            #print 'tax_id_str',tax_id_str
            if ds_id in counts_lookup:
                if tax_id_str in counts_lookup[ds_id]:
                    sys.exit('We should not be here - Exiting')
                else:
                    counts_lookup[ds_id][tax_id_str] = count
                    
            else:
                counts_lookup[ds_id] = {}
                counts_lookup[ds_id][tax_id_str] = count
                

    json_str = json.dumps(counts_lookup) 
    print(json_str) 
    f = open(out_file,'w') 
    f.write(json_str+"\n") 
    f.close()
	


#
#
#
if __name__ == '__main__':

    myusage = """
		./create_taxcount_lookup.py  (
        
        Will ask you to input which database
        Output will be like tax_counts--(database name).json
        Output file should be moved as is to ../json/ directory.
        
    """
	
    # db = MySQLdb.connect(host="localhost", # your host, usually localhost
    #                       user="ruby", # your username
    #                       passwd="ruby") # name of the data base
    db = MySQLdb.connect(host="localhost", # your host, usually localhost
                         read_default_file="~/.my.cnf_ruby")
    
    cur = db.cursor()
    cur.execute("SHOW databases like 'vamps%'")
    dbs = []
    db_str = ''
    for i, row in enumerate(cur.fetchall()):
        dbs.append(row[0])
        db_str += str(i)+'-'+row[0]+';  '
    print myusage
    print db_str
    db_no = input("\nchoose database number: ")
    if int(db_no) < len(dbs):
        NODE_DATABASE = dbs[db_no]
    else:
        sys.exit("unrecognized number -- Exiting")
        
    print
    cur.execute("USE "+NODE_DATABASE)
    
    out_file = "tax_counts--"+NODE_DATABASE+".json"
    
    print 'DATABASE:',NODE_DATABASE 	
    args = parser.parse_args()
    go(args)