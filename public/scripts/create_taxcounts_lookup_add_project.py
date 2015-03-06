#!/usr/bin/env python

""" 
  create_counts_lookup.py


"""

import sys,os
import argparse
import MySQLdb
import json


"""
SELECT sum(seq_count), dataset_id, domain_id,domain
FROM sequence_pdr_info
JOIN sequence_uniq_info USING(sequence_id)
JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id)
JOIN silva_taxonomy USING(silva_taxonomy_id)
JOIN domain USING(domain_id)
JOIN pyhlum USING(phylum_id)
GROUP BY dataset_id, domain_id

SELECT sum(seq_count), dataset_id, domain_id,domain,phylum_id,phylum
FROM sequence_pdr_info
JOIN sequence_uniq_info USING(sequence_id)
JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id)
JOIN silva_taxonomy USING(silva_taxonomy_id)
JOIN domain USING(domain_id)
JOIN phylum USING(phylum_id)
GROUP BY dataset_id, domain_id,phylum_id
"""


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

def go_list(args):
    counts_lookup = read_original_taxcounts(in_file)
    
    q = "SELECT DISTINCT project,project.project_id from dataset"
    q += " JOIN project on(dataset_id)"
    q += " WHERE dataset_id in('%s')"
    dids = []
    for did in counts_lookup:
        dids.append(did)
    did_sql = "','".join(dids)
    q = q % (did_sql)
    print q
    num = 0
    cur.execute(q)
    print 'List of projects in: '+in_file
    for row in cur.fetchall():
        print 'project:',row[0],'project_id:',row[1]
        num += 1
    print 'Number of Projects:',num
    
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
                    counts_lookup[ds_id][rank][tax_id] = count
                else:
                    counts_lookup[ds_id][rank] = {}
                    counts_lookup[ds_id][rank][tax_id] = count
            else:
                counts_lookup[ds_id] = {}
                counts_lookup[ds_id][rank] = {}
                counts_lookup[ds_id][rank][tax_id] = count

    write_json_file(out_file,counts_lookup)
    print 'DONE (must now move file into place)'
  
def write_json_file(outfile,obj):
    json_str = json.dumps(obj)    
    print('Re-Writing JSON file (REMEMBER to move new file to ../json/)')
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
        -del/--delete         delete all dids (whole project) from obj  (need pid also)
        -l/list             list: list all projects in json object
    
    count_lookup_per_dsid[dsid][rank][taxid] = count

    This script will add a project to ../json/tax_counts--<vamps_js_development>.json JSON object
    But ONLY if it is already in the MySQL database.
    
    To add a new project to the MySQL database use py_mbl_sequencing_pipeline/3-vamps-upload.py

    """
    parser.add_argument("-pid","--pid",                   
                required=False,  action="store",   dest = "pid", default='',
                help="""ProjectID""") 
    
    parser.add_argument("-del","--del",                   
                required=False,  action="store_true",   dest = "delete", default='',
                help="""ProjectID""") 
    
    parser.add_argument("-list","--list",                   
                required=False,  action="store_true",   dest = "list", default='',
                help="""ProjectID""") 
                
    args = parser.parse_args()
    
    database = input("\nEnter 1 (vamps_js_dev_av) or 2 (vamps_js_development): ")
    if database == 2:
        NODE_DATABASE = "vamps_js_development"
    elif database == 1:
        NODE_DATABASE = "vamps_js_dev_av"
    else:
        sys.exit('Exiting')
    
    out_file = "tax_counts--"+NODE_DATABASE+".json"
    in_file  = "../json/tax_counts--"+NODE_DATABASE+".json"
    db = MySQLdb.connect(host="localhost", # your host, usually localhost
                          user="ruby", # your username
                          passwd="ruby", # your password
                          db=NODE_DATABASE) # name of the data base
    cur = db.cursor()
    print 'DATABASE:',NODE_DATABASE
    
    
    if not args.list and not args.pid and not args.delete:
        print usage
        
        sys.exit('need command line parameter(s)')
    if args.delete and not args.pid:
        print usage
        
        sys.exit('need pid to delete')    
    
    if args.list:
        go_list(args)
    elif args.delete:
        go_delete(args)
    else:
        go_add(args) 
        

