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
database = "vamps_js_development"
#database = "vamps_js_dev_av"
out_file = "tax_counts_local.json"
in_file  = "../json/tax_counts_lookup.json"
db = MySQLdb.connect(host=hostname, # your host, usually localhost
                     user=username, # your username
                      passwd=password, # your password
                      db=database) # name of the data base
cur = db.cursor() 
parser = argparse.ArgumentParser(description="") 
query_core = " FROM sequence_pdr_info" 
query_core += " JOIN sequence_uniq_info USING(sequence_id)"
query_core += " JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id)"
query_core += " JOIN silva_taxonomy USING(silva_taxonomy_id)" 

domain_query = "SELECT sum(seq_count), dataset_id, domain_id"
domain_query += query_core
domain_query += " WHERE dataset_id in ('%s')"
domain_query += " GROUP BY dataset_id, domain_id"

phylum_query = "SELECT sum(seq_count), dataset_id, phylum_id" 
phylum_query += query_core
phylum_query += " WHERE dataset_id in ('%s')"
phylum_query += " GROUP BY dataset_id, domain_id, phylum_id"

class_query = "SELECT sum(seq_count), dataset_id, klass_id" 
class_query += query_core
class_query += " WHERE dataset_id in ('%s')"
class_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id"

order_query = "SELECT sum(seq_count), dataset_id, order_id" 
order_query += query_core
order_query += " WHERE dataset_id in ('%s')"
order_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id"

family_query = "SELECT sum(seq_count), dataset_id, family_id" 
family_query += query_core
family_query += " WHERE dataset_id in ('%s')"
family_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"

genus_query = "SELECT sum(seq_count), dataset_id, genus_id" 
genus_query += query_core
genus_query += " WHERE dataset_id in ('%s')"
genus_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id"

species_query = "SELECT sum(seq_count), dataset_id, species_id" 
species_query += query_core
species_query += " WHERE dataset_id in ('%s')"
species_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id"

strain_query = "SELECT sum(seq_count), dataset_id, strain_id" 
strain_query += query_core
strain_query += " WHERE dataset_id in ('%s')"
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

def go_test(args):
    counts_lookup = read_original_taxcounts(in_file)
    print 'List of dataset IDs:'
    for did in counts_lookup:
        print did
    
def go_delete(args):
    
    counts_lookup = read_original_taxcounts(in_file)

    dids = get_dataset_ids(args.pid)    
    for did in dids:
        if did in counts_lookup:
            del counts_lookup[did]
    write_json_file(out_file,counts_lookup)
    
def go_add(args):
    
    counts_lookup = read_original_taxcounts(in_file)

    dids = get_dataset_ids(args.pid)    
    did_sql = "','".join(dids)
    #print counts_lookup
    for q in queries:

        query = q["query"] % (did_sql)
        print query
        cur.execute(query)
        for row in cur.fetchall():
            print row
            count = int(row[0])
            ds_id = row[1]
            tax_id = row[2]
            rank = q["rank"]
            if ds_id in counts_lookup:
                if rank in counts_lookup[ds_id]:                    
                    if tax_id in counts_lookup[ds_id][rank]:
                        counts_lookup[ds_id][rank][tax_id] += count
                    else:
                        counts_lookup[ds_id][rank][tax_id] = count
                else:
                    counts_lookup[ds_id][rank] = {}
                    counts_lookup[ds_id][rank][tax_id] = count
            else:
                counts_lookup[ds_id] = {}
                counts_lookup[ds_id][rank] = {}
                counts_lookup[ds_id][rank][tax_id] = count

    write_json_file(out_file,counts_lookup)
  
def write_json_file(outfile,obj):
    json_str = json.dumps(obj)    
    print(json_str)
    f = open(outfile,'w')
    f.write(json_str+"\n")
    f.close()
    
def read_original_taxcounts(infile):
    counts_lookup = {}
    try:
        with open(infile) as data_file:    
            counts_lookup = json.load(data_file)
    except:
        sys.exit("Could not find taxcounts file: "+infile)
    return counts_lookup
    
def get_dataset_ids(pid):
    q = "SELECT dataset_id from dataset where project_id='"+str(pid)+"'"  
    #print q
    cur.execute(q)
    dids = []
    numrows = cur.rowcount
    if numrows == 0:
        sys.exit('No data found for pid '+str(pid))
    for row in cur.fetchall():
        dids.append(str(row[0]))
    
    return dids
    

#
#
#
if __name__ == '__main__':

    usage = """
        -pid/--project_id   add project to object
        -d/--delete         delete all dids (whole project) from obj 
        -t/test             test: list all dids in json object
    
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
    parser.add_argument("-pid","--project_id",                   
                required=False,  action="store",   dest = "pid", default='',
                help="""ProjectID""") 
    
    parser.add_argument("-d","--delete",                   
                required=False,  action="store_true",   dest = "delete", default='',
                help="""ProjectID""") 
    
    parser.add_argument("-t","--test",                   
                required=False,  action="store_true",   dest = "test", default='',
                help="""ProjectID""") 
                
    args = parser.parse_args()
    if args.test:
        go_test(args)
    elif args.delete:
        go_delete(args)
    else:
        go_add(args) 
