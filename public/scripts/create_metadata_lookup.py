#!/usr/bin/env python

""" 
	create_counts_lookup.py


"""

import sys,os
import argparse
import random
import MySQLdb
import json


db = MySQLdb.connect(host="localhost", # your host, usually localhost
                         read_default_file="~/.my.cnf"  ) 
cur = db.cursor()



def start(NODE_DATABASE, process_dir):
    cur.execute("USE "+NODE_DATABASE)
    data = go_required_metadata() 
    data = go_custom_metadata(data)
    out_file = os.path.join(process_dir,'public','json',"metadata--"+NODE_DATABASE+".json")
    write_file(data, out_file)
    
def go_required_metadata():
	"""
		metadata_lookup_per_dsid[dsid][metadataName] = value			

	"""
    required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "public","taxon_id","description","common_name"];
	
	req_query = "SELECT dataset_id, "+','.join(required_metadata_fields)+" from required_metadata_info"
	#print req_query
	
	req_metadata_lookup = {}
	
		
	cur.execute(req_query)
	for row in cur.fetchall():
		did = row[0]
		for i,name in enumerate(required_metadata_fields):
			#print i,did,name,row[i+1]
			value = row[i+1]
			
			if did in req_metadata_lookup:				
					req_metadata_lookup[did][name] = str(value)
			else:
				req_metadata_lookup[did] = {}
				req_metadata_lookup[did][name] = str(value)
				
	
	return req_metadata_lookup

	
	
def go_custom_metadata(metadata_lookup):
	
    cust_pquery = "SELECT project_id,field_name from custom_metadata_fields"
    pid_collection = {}
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
    	print cust_dquery
    	cur.execute(cust_dquery)
	
    	print
    	for row in cur.fetchall():
    		did = row[0]
    		n = 1
    		for field in pid_collection[pid]:

    			print did,n,field,row[n]
    			name = field
    			value = str(row[n])
			

    			if did in metadata_lookup:				
    			 	metadata_lookup[did][name] = value
    			else:
    				metadata_lookup[did] = {}
    				metadata_lookup[did][name] = value
    			n += 1
    return metadata_lookup
	
	
def write_file(metadata_lookup, out_file):
	json_str = json.dumps(metadata_lookup)		
	print(json_str)
	f = open(out_file,'w')
	f.write(json_str+"\n")
	f.close()
	

	




if __name__ == '__main__':

    usage = """
		This script will re-create the metadata lookup file in /public/json/
        named <NODE_DATABASE>--metadata.json
        The file is required for new vamps to return
    """
	

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
    
    req_out_file = "metadataREQ--"+NODE_DATABASE+".json"
    cust_out_file = "metadataCUST--"+NODE_DATABASE+".json"
    out_file = "metadata--"+NODE_DATABASE+".json"
    
	
    data = go_required_metadata() 
    data = go_custom_metadata(data)
	
