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
#domain_query += " JOIN domain USING(domain_id)"
domain_query += " GROUP BY dataset_id, domain_id"

phylum_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id" 
phylum_query += query_core
#phylum_query += " JOIN domain USING(domain_id)"
phylum_query += " GROUP BY dataset_id, domain_id, phylum_id"

class_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id" 
class_query += query_core
#class_query += " JOIN domain USING(domain_id)"
class_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id"

order_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id" 
order_query += query_core
#order_query += " JOIN domain USING(domain_id)"
order_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id"

family_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id" 
family_query += query_core
#family_query += " JOIN domain USING(domain_id)"
family_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"

genus_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id" 
genus_query += query_core
#genus_query += " JOIN domain USING(domain_id)"
genus_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id"

species_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id" 
species_query += query_core
#species_query += " JOIN domain USING(domain_id)"
species_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id"

strain_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id" 
strain_query += query_core
#strain_query += " JOIN domain USING(domain_id)"
strain_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id"

#queries = [domain_query,phylum_query,class_query,order_query,family_query,genus_query,species_query,strain_query]
queries = [{"rank":"domain", "query":domain_query },
            {"rank":"phylum", "query":phylum_query },
            {"rank":"klass",  "query":class_query  },
            {"rank":"order",  "query":order_query  },
            {"rank":"family", "query":family_query },
            {"rank":"genus",  "query":genus_query  },
            {"rank":"species","query":species_query},
            {"rank":"strain", "query":strain_query }
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
        print
        print q['rank']
        print q['query']

        cur.execute(q["query"])
        for row in cur.fetchall():
            print row
            count = int(row[0])
            did = row[1]
            domain_id = row[2]
            rank = q["rank"]
            
            if did in counts_lookup:
                if rank in counts_lookup[did]:
                    if domain_id in counts_lookup[did][rank]:
                        pass
                    else:
                        counts_lookup[did][rank][domain_id] = {}
                else:
                    counts_lookup[did][rank] = {}
                    counts_lookup[did][rank][domain_id] = {}
            else:
                counts_lookup[did] = {}
                counts_lookup[did][rank] = {}
                counts_lookup[did][rank][domain_id] = {}
            
            if rank == 'domain':
                counts_lookup[did][rank][domain_id] = count
            elif rank == 'phylum':
                phylum_id = row[3]
                if phylum_id in counts_lookup[did][rank][domain_id]:
                    counts_lookup[did][rank][domain_id][phylum_id] += count
                else:
                    counts_lookup[did][rank][domain_id][phylum_id] = count
            elif rank == 'klass':
                phylum_id = row[3]
                klass_id  = row[4]
                if phylum_id in counts_lookup[did][rank][domain_id]:
                    if klass_id in counts_lookup[did][rank][domain_id][phylum_id]:
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id] += count
                    else:
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id] = count
                else:
                    counts_lookup[did][rank][domain_id][phylum_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id] = count
                
            elif rank == 'order':
                phylum_id = row[3]
                klass_id  = row[4]
                order_id  = row[5]
                if phylum_id in    counts_lookup[did][rank][domain_id]:
                    if klass_id in counts_lookup[did][rank][domain_id][phylum_id]:
                        if order_id in counts_lookup[did][rank][domain_id][phylum_id][klass_id]:
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] += count
                        else:
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = count
                    else:
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = count
                else:
                    counts_lookup[did][rank][domain_id][phylum_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = count
            elif rank == 'family':
                phylum_id = row[3]
                klass_id  = row[4]
                order_id  = row[5]
                family_id = row[6]
                if phylum_id in        counts_lookup[did][rank][domain_id]:
                    if klass_id in     counts_lookup[did][rank][domain_id][phylum_id]:
                        if order_id in counts_lookup[did][rank][domain_id][phylum_id][klass_id]:
                            if family_id in counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id]:    
                                counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] += count
                            else:
                                counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = count
                        else:
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = {}
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = count
                    else:
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = count
                else:
                    counts_lookup[did][rank][domain_id][phylum_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = count
            elif rank == 'genus':
                phylum_id = row[3]
                klass_id  = row[4]
                order_id  = row[5]
                family_id = row[6]
                genus_id  = row[7]
                if phylum_id in             counts_lookup[did][rank][domain_id]:
                    if klass_id in          counts_lookup[did][rank][domain_id][phylum_id]:
                        if order_id in      counts_lookup[did][rank][domain_id][phylum_id][klass_id]:
                            if family_id in counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id]: 
                                if genus_id in counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id]: 
                                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] += count
                                else:
                                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = count
                            else:
                                counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = {}
                                counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = count
                        else:
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = {}
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = {}
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = count
                    else:
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = count
                else:
                    counts_lookup[did][rank][domain_id][phylum_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = count
            elif rank == 'species':
                phylum_id  = row[3]
                klass_id   = row[4]
                order_id   = row[5]
                family_id  = row[6]
                genus_id   = row[7]
                species_id = row[8]
                if phylum_id in                      counts_lookup[did][rank][domain_id]:
                    if klass_id in                   counts_lookup[did][rank][domain_id][phylum_id]:
                        if order_id in               counts_lookup[did][rank][domain_id][phylum_id][klass_id]:
                            if family_id in          counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id]:
                                if genus_id in       counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id]: 
                                    if species_id in counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id]: 
                                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] += count
                                    else:
                                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] = count
                                else:
                                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = {}
                                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] = count
                            else:
                                counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = {}
                                counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = {}
                                counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] = count
                        else:
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = {}
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = {}
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = {}
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] = count
                    else:
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] = count
                else:
                    counts_lookup[did][rank][domain_id][phylum_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] = count
            elif rank == 'strain':
                phylum_id  = row[3]
                klass_id   = row[4]
                order_id   = row[5]
                family_id  = row[6]
                genus_id   = row[7]
                species_id = row[8]
                strain_id  = row[9]
                if phylum_id in                         counts_lookup[did][rank][domain_id]:
                    if klass_id in                      counts_lookup[did][rank][domain_id][phylum_id]:
                        if order_id in                  counts_lookup[did][rank][domain_id][phylum_id][klass_id]:
                            if family_id in             counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id]: 
                                if genus_id in          counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id]: 
                                    if species_id in    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id]:
                                        if strain_id in counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id]:
                                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id][strain_id] += count
                                        else:
                                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id][strain_id] = count
                                    else:
                                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] = {}
                                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id][strain_id] = count
                                else:
                                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = {}
                                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] = {}
                                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id][strain_id] = count
                            else:
                                counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = {}
                                counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = {}
                                counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] = {}
                                counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id][strain_id] = count
                        else:
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = {}
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = {}
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = {}
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] = {}
                            counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id][strain_id] = count
                    else:
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] = {}
                        counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id][strain_id] = count
                else:
                    counts_lookup[did][rank][domain_id][phylum_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id] = {}
                    counts_lookup[did][rank][domain_id][phylum_id][klass_id][order_id][family_id][genus_id][species_id][strain_id] = count
            # if ds_id in counts_lookup:
          #       if rank in counts_lookup[ds_id]:
          #           #if tax_id in counts_lookup[ds_id][rank]:
          #          #     counts_lookup[ds_id][rank][tax_id] += count
          #          # else:
          #           counts_lookup[ds_id][rank][tax_id] = count
          #       else:
          #           counts_lookup[ds_id][rank] = {}
          #           counts_lookup[ds_id][rank][tax_id] = count
          #   else:
          #       counts_lookup[ds_id] = {}
          #       counts_lookup[ds_id][rank] = {}
          #       counts_lookup[ds_id][rank][tax_id] = count


    json_str = json.dumps(counts_lookup)		
    print(json_str)
    print
    #print(counts_lookup[426])
    f = open(out_file,'w')
    f.write(json_str+"\n")
    f.close()
	
	
	
	


#
#
#
if __name__ == '__main__':

    usage = """
		
    """
    database = input("\nEnter 1 (vamps_js_dev_av) or 2 (vamps_js_development): ")
    if database == 2:
        NODE_DATABASE = "vamps_js_development"
    elif database == 1:
        NODE_DATABASE = "vamps_js_dev_av"
    else:
        sys.exit('Exiting')
    
    out_file = "tax_counts--"+NODE_DATABASE+".json"
    db = MySQLdb.connect(host="localhost", # your host, usually localhost
                          user="ruby", # your username
                          passwd="ruby", # your password
                          db=NODE_DATABASE) # name of the data base
    cur = db.cursor()
    print 'DATABASE:',NODE_DATABASE 	
    args = parser.parse_args()
    go(args) 
