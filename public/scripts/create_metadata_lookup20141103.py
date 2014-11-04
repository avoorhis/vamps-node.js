#!/usr/bin/env python

""" 
	create_counts_lookup.py


"""

import sys,os
import argparse
import random
import MySQLdb
import json

hostname = 'localhost'
username = 'ruby'
password = 'ruby'
database = "vamps_js_development"

db = MySQLdb.connect(host=hostname, # your host, usually localhost
                     user=username, # your username
                      passwd=password, # your password
                      db=database) # name of the data base
cur = db.cursor() 







def go_required_metadata():
	"""
		metadata_lookup_per_dsid[dsid][metadataName] = value			

	"""
	required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "temp", "salinity", "diss_oxygen", "public"];

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
				
	
	json_str = json.dumps(req_metadata_lookup)		
	#print(json_str)
	f = open(out_file,'w')
	f.write(json_str+"\n")
	f.close()

	
	
def go_custom_metadata():
	
	cust_pquery = "SELECT project_id,field_name from custom_metadata_fields order by field_name"
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
		n = 1
		print
		for row in cur.fetchall():
			if len(fields) <= n:
				break
			print n,fields[n],row[n]
			did = row[0]
			
			name = fields[n]
			value = row[n]
			n += 1

			if did in cust_metadata_lookup:				
					cust_metadata_lookup[did][name] = str(value)
			else:
				cust_metadata_lookup[did] = {}
				cust_metadata_lookup[did][name] = str(value)
	

	out_file = "metadata_custom.json"
	

	json_str = json.dumps(cust_metadata_lookup)		
	print(json_str)
	f = open(out_file,'w')
	f.write(json_str+"\n")
	f.close()
	

	




if __name__ == '__main__':

	usage = """
		
	"""
	
 	 	
	
	data = go_required_metadata() 
	data = go_custom_metadata()
	
