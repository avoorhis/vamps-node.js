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
query_core = " FROM sequence_pdr_info" 
query_core += " JOIN sequence_uniq_info USING(sequence_id)"
query_core += " JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id)"
query_core += " JOIN silva_taxonomy USING(silva_taxonomy_id)" 

domain_query = "SELECT sum(seq_count), dataset_id, domain_id"
domain_query += query_core
domain_query += " WHERE dataset_id in ('%s')"
domain_query += " GROUP BY dataset_id, domain_id"

phylum_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id" 
phylum_query += query_core
phylum_query += " WHERE dataset_id in ('%s')"
phylum_query += " GROUP BY dataset_id, domain_id, phylum_id"

class_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id" 
class_query += query_core
class_query += " WHERE dataset_id in ('%s')"
class_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id"

order_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id"
order_query += query_core
order_query += " WHERE dataset_id in ('%s')"
order_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id"

family_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"
family_query += query_core
family_query += " WHERE dataset_id in ('%s')"
family_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"

genus_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id" 
genus_query += query_core
genus_query += " WHERE dataset_id in ('%s')"
genus_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id"

species_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id" 
species_query += query_core
species_query += " WHERE dataset_id in ('%s')"
species_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id"

strain_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id" 
strain_query += query_core
strain_query += " WHERE dataset_id in ('%s')"
strain_query += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id"

#queries = [domain_query,phylum_query,class_query,order_query,family_query,genus_query,species_query,strain_query]
queries = [{"rank":"domain","query":domain_query},
		   {"rank":"phylum","query":phylum_query},
           {"rank":"klass","query":class_query},
           {"rank":"order","query":order_query},
           {"rank":"family","query":family_query},
           {"rank":"genus","query":genus_query},
           {"rank":"species","query":species_query},
           {"rank":"strain","query":strain_query}
		   ]

def go_list(args):
    counts_lookup = read_original_taxcounts(NODE_DATABASE)
    
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
    #print 'List of projects in: '+in_file
    for row in cur.fetchall():
        print 'project:',row[0],' --project_id:',row[1]
        num += 1
    print 'Number of Projects:',num
    
def go_delete(args):
    
    counts_lookup = read_original_taxcounts(NODE_DATABASE)

    dids = get_dataset_ids(args.pid)  
    print dids  
    # just delete files 
    prefix = os.path.join('../json',NODE_DATABASE+'--taxcounts')
    print prefix
    #files = os.listdir(base)
    #for infile in files:
    #    file_path = os.path.join(base,infile)
    
    for did in dids:
        if did in counts_lookup:
            
            file_path = os.path.join(prefix,did+'.json')
            print 'Deleting '+file_path
            os.remove(file_path)
    #write_json_file(out_file,counts_lookup)
    
def go_add(args):
    
    counts_lookup = read_original_taxcounts(NODE_DATABASE)
    prefix = os.path.join('../json',NODE_DATABASE+'--taxcounts')
    print prefix
    dids = get_dataset_ids(args.pid)    
    did_sql = "','".join(dids)
    #print counts_lookup
    for q in queries:
        query = q["query"] % (did_sql)
        print query
        dirs = []
        cur.execute(query)
        for row in cur.fetchall():
            #print row
            count = int(row[0])
            ds_id = row[1]
            # if args.separate_taxcounts_files:
           #      dir = prefix + str(ds_id)
           #
           #      if not os.path.isdir(dir):
           #          os.mkdir(dir)
                
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
    
    #print counts_lookup
    # for q in queries:
    #
    #     query = q["query"] % (did_sql)
    #     print query
    #     cur.execute(query)
    #     for row in cur.fetchall():
    #         print row
    #         count = int(row[0])
    #         ds_id = row[1]
    #         tax_id = row[2]
    #         rank = q["rank"]
    #         if ds_id in counts_lookup:
    #             if rank in counts_lookup[ds_id]:
    #                 counts_lookup[ds_id][rank][tax_id] = count
    #             else:
    #                 counts_lookup[ds_id][rank] = {}
    #                 counts_lookup[ds_id][rank][tax_id] = count
    #         else:
    #             counts_lookup[ds_id] = {}
    #             counts_lookup[ds_id][rank] = {}
    #             counts_lookup[ds_id][rank][tax_id] = count
    #
    write_json_file(prefix,counts_lookup)
    # print 'DONE (must now move file into place)'
  
def write_json_file(prefix,counts_lookup):
    #json_str = json.dumps(counts_lookup)    
    # print('Re-Writing JSON file (REMEMBER to move new file to ../json/)')
    # f = open(outfile,'w')
    # f.write(json_str+"\n")
    # f.close()
    for did in counts_lookup:
        file_path = os.path.join(prefix,str(did)+'.json')
        f = open(file_path,'w') 
        mystr = json.dumps(counts_lookup[did]) 
        print mystr
        f.write('{"'+str(did)+'":'+mystr+"}\n") 
        f.close()

def read_original_taxcounts(db):
    counts_lookup = {}
    base = os.path.join('../json',db+'--taxcounts')
    files = os.listdir(base)
    for infile in files:
        file_path = os.path.join(base,infile)
        with open(file_path) as data_file:    
            data = json.load(data_file)
            for ds in data:
                counts_lookup[ds] = data[ds]
    
    return counts_lookup    
# def read_original_taxcounts(infile):
#     counts_lookup = {}
#     try:
#         with open(infile) as data_file:
#             counts_lookup = json.load(data_file)
#     except:
#         sys.exit("Could not find taxcounts file: "+infile)
#     return counts_lookup
    
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
        -pid/--project_id  ID  Must be combined with --add or --delete
        
        This script only add/deletes to taxcounts files NOT MySQL
        -add/--add          Add project (will delete and overwrite if already present)
        OR
        -del/--delete       Delete all dids (whole project) from dir  (requires pid) ()
        
        -l/  --list         List: list all projects in taxcounts files [default]
    
    count_lookup_per_dsid[dsid][rank][taxid] = count

    This script will add a project to ../json/<NODE-DATABASE>/<DATASET-NAME>.json JSON object
    But ONLY if it is already in the MySQL database.
    
    To add a new project to the MySQL database:
    If already GASTed:
        use ./upload_project_to_database.py in this directory
    If not GASTed
         use py_mbl_sequencing_pipeline custom scripts

    """
    parser.add_argument("-pid","--pid",                   
                required=False,  action="store",   dest = "pid", default='',
                help="""ProjectID""") 
    
    parser.add_argument("-del","--del",                   
                required=False,  action="store_true",   dest = "delete", default='',
                help="""ProjectID""") 
                
    parser.add_argument("-add","--add",                   
                required=False,  action="store_true",   dest = "add", default='',
                help="""ProjectID""")
                
    parser.add_argument("-list","--list",                   
                required=False,  action="store_true",   dest = "list", default='',
                help="""ProjectID""") 
                
    args = parser.parse_args()
    
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
    
    #out_file = "tax_counts--"+NODE_DATABASE+".json"
    #in_file  = "../json/tax_counts--"+NODE_DATABASE+".json"
    
    print 'DATABASE:',NODE_DATABASE
    
    
    if not args.list and not args.pid and not args.delete and not args.add:
        print usage        
        sys.exit('need command line parameter(s)')
        
    if args.delete and not args.pid:
        print usage        
        sys.exit('need pid to delete') 
           
    if args.add and not args.pid:
        print usage        
        sys.exit('need pid to add')
    
    if args.delete and args.add:
        print usage        
        sys.exit('cannot add AND delete')
            
    if args.list:
        go_list(args)
    elif args.delete and args.pid:
        go_delete(args)
    elif args.add and args.pid:
        go_add(args)
    else:
        print usage 
        

