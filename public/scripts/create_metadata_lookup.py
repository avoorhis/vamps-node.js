#!/usr/bin/env python

""" 
	create_counts_lookup.py


"""

import sys,os
import argparse
import random
import MySQLdb
import json







def go_required_metadata():
	"""
		metadata_lookup_per_dsid[dsid][metadataName] = value			

	"""
	required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "public"];

	req_query = "SELECT dataset_id, "+','.join(required_metadata_fields)+" from required_metadata_info"
	#print req_query
	out_file = "metadata_required.json"
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

	out_file = "metadata.json"
	

	json_str = json.dumps(metadata_lookup)		
	print(json_str)
	f = open(out_file,'w')
	f.write(json_str+"\n")
	f.close()
	

	




if __name__ == '__main__':

	usage = """
		
	"""
	
    database = input("\nEnter 1 (vamps_js_dev_av) or 2 (vamps_js_development): ")
    if database == '2':
        NODE_DATABASE = "vamps_js_development"
    elif database == '1':
        NODE_DATABASE = "vamps_js_dev_av"
    else:
        sys.exit('Exiting')
    
    
    db = MySQLdb.connect(host="localhost", # your host, usually localhost
                          user="ruby", # your username
                          passwd="ruby", # your password
                          db=NODE_DATABASE) # name of the data base
    cur = db.cursor() 	
	
	data = go_required_metadata() 
	data = go_custom_metadata(data)
	
