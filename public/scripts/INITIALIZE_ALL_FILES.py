#!/usr/bin/env python

""" 
	create_counts_lookup.py


"""

import sys,os,shutil
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

# these SHOULD be the same headers as in the NODE_DATABASE table: required_metadata_info (order doesn't matter)
required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "public","taxon_id","description","common_name"];
req_pquery = "SELECT dataset_id, "+','.join(required_metadata_fields)+" from required_metadata_info"
cust_pquery = "SELECT project_id,field_name from custom_metadata_fields"

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
		count_lookup_per_dsid[dsid][tax_id_str] = count		
		

    """
    counts_lookup = {}
    
    try:
        shutil.rmtree(args.files_prefix)
        shutil.move(args.taxcounts_file,os.path.join(args.json_dir,NODE_DATABASE+'--taxcountsBU.json'))
        shutil.move(args.metadata_file, os.path.join(args.json_dir,NODE_DATABASE+'--metadataBU.json'))
    except:
        pass
    os.mkdir(args.files_prefix)
    
    for q in queries:
        #print q["query"]
        dirs = []
        try:

            print "running mysql query for:",q['rank']

            cur.execute(q["query"])
        except:
            print "Trying to query with:",q["query"]
            sys.exit("This Database Doesn't Look Right -- Exiting")
        for row in cur.fetchall():
            #print row
            count = int(row[0])
            ds_id = row[1]
           
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

    
    print 'gathering metadata from tables'            
    metadata_lookup = go_metadata()    
    
    print 'writing to individual files'
    write_data_to_files(args, metadata_lookup, counts_lookup)
    
    print 'writing metadata file'
    write_all_metadata_file(args, metadata_lookup)
    
    print 'writing taxcount file'
    write_all_taxcounts_file(args, counts_lookup)
    for w in warnings:
        print w
    print "DONE"
        
def write_all_metadata_file(args, metadata_lookup):
   
    #print md_file
    json_str = json.dumps(metadata_lookup)		
    #print(json_str)
    f = open(args.metadata_file,'w')
    f.write(json_str+"\n")
    f.close() 
    
def write_all_taxcounts_file(args, counts_lookup):
    
    #print tc_file
    json_str = json.dumps(counts_lookup)		
    #print(json_str)
    f = open(args.taxcounts_file,'w')
    f.write(json_str+"\n")
    f.close()
            
def write_data_to_files(args, metadata_lookup, counts_lookup):    
    
    #print counts_lookup
    for did in counts_lookup:
        file = os.path.join(args.files_prefix,str(did)+'.json')
        f = open(file,'w') 
        
        my_counts_str = json.dumps(counts_lookup[did]) 
        if did in metadata_lookup:
            my_metadata_str = json.dumps(metadata_lookup[did]) 
        else:
            warnings.append('WARNING -- no metadata for dataset: '+str(did))
            my_metadata_str = json.dumps({})
        #f.write('{"'+str(did)+'":'+mystr+"}\n") 
        f.write('{"taxcounts":'+my_counts_str+',"metadata":'+my_metadata_str+'}'+"\n")
        f.close()
    
def go_metadata():
    """
    	metadata_lookup_per_dsid[dsid][metadataName] = value			

    """
	
    metadata_lookup = {}

    print 'running mysql for required metadata'

    cur.execute(req_pquery)
    for row in cur.fetchall():
    	did = row[0]
    	for i,name in enumerate(required_metadata_fields):
            #print i,did,name,row[i+1]
            value = row[i+1]
            if value == '':
                warnings.append('WARNING -- dataset '+str(did)+' is missing a value for REQUIRED field "'+name+'"')

            if did in metadata_lookup:				
            		metadata_lookup[did][name] = str(value)
            else:
            	metadata_lookup[did] = {}
            	metadata_lookup[did][name] = str(value)
			


    pid_collection = {}

    print 'running mysql for custom metadata',cust_pquery

    cur.execute(cust_pquery)
    cust_metadata_lookup = {}
    for row in cur.fetchall():
		
    	pid = str(row[0])
    	field = row[1]
    	table = 'custom_metadata_'+ pid
    	if pid in pid_collection:
    		pid_collection[pid].append(field)
    	else:
    		pid_collection[pid] = [field]
    print
    for pid in pid_collection:
    	table = 'custom_metadata_'+ pid
    	fields = ['dataset_id']+pid_collection[pid]

        cust_dquery = "SELECT " + ','.join(fields) + " from " + table
    	print 'running other cust',cust_dquery
    	#try:
        cur.execute(cust_dquery)

        print
        for row in cur.fetchall():
            print row
            did = row[0]
            n = 1
            for field in pid_collection[pid]:
                #print did,n,field,row[n]
                name = field
                value = str(row[n])
                if value == '':
                    warnings.append('WARNING -- dataset'+str(did)+'is missing value for metadata CUSTOM field "'+name+'"')

                if did in metadata_lookup:				
                 	metadata_lookup[did][name] = value
                else:
                	metadata_lookup[did] = {}
                	metadata_lookup[did][name] = value
                n += 1
        #except:
        #    warnings.append('could not find/read CUSTOM table: "'+table+'" Skipping')
    db.commit()
    return metadata_lookup
            

#
#
#
if __name__ == '__main__':

    myusage = """
		./taxcount_metadata_files.py  (
        
        Will ask you to input which database
        Output will be files json/NODE_DATABASE/<dataset>.json
        each containing taxcounts and metadata from the database
        
        **THIS SCRIPT WILL DELETE AND RE-CREATE ALL THE FILES** for the chosen database.
        It will create a /public/json/<NODE_DATABASE>--datasets/<datasetid>.json file for each dataset.
          These files have taxonomic counts and metadata for that dataset for
          use when selecting datsets for visualization.
        Also the script will create 2 other files:
          /public/json/<NODE_DATABASE>--taxcounts.json
          /public/json/<NODE_DATABASE>--metadata.json
          These files contain ALL the taxcounts and metadata for use
          in searches
        
    """
    warnings = []
    db = MySQLdb.connect(host="localhost", # your host, usually localhost
                          user="ruby", # your username
                          passwd="ruby") # name of the data base
    cur = db.cursor()
    cur.execute("SHOW databases like 'vamps%'")
    dbs = []
    db_str = ''
    print myusage
    for i, row in enumerate(cur.fetchall()):
        dbs.append(row[0])
        db_str += str(i)+'-'+row[0]+';  '
        print str(i)+' - '+row[0]+';  '
    #print db_str
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
#    args.sql_db_table               = True
    #args.separate_taxcounts_files   = True
    args.json_dir = os.path.join("../","json")
    args.files_prefix   = os.path.join(args.json_dir,NODE_DATABASE+"--datasets")
    args.taxcounts_file = os.path.join(args.json_dir,NODE_DATABASE+"--taxcounts.json")
    args.metadata_file  = os.path.join(args.json_dir,NODE_DATABASE+"--metadata.json")
    go(args)