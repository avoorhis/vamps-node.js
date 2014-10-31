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
out_file = "metadata.json"
db = MySQLdb.connect(host=hostname, # your host, usually localhost
                     user=username, # your username
                      passwd=password, # your password
                      db=database) # name of the data base
cur = db.cursor() 



md_query = "SELECT distinct dataset_id from dataset"




#queries = [domain_query,phylum_query,class_query,order_query,family_query,genus_query,species_query,strain_query]


test_metadata_names = ['patientID',  'sample_location', 'temperature',
                      'diss_oxygen', 'ammonium',  'chlorophyll',
                      'latitude', 'longitude', 'description', 'body_site', 
                      'collection_date', 'sample_size', 'study_center',
                      'meta_10','meta_11','meta_12','meta_13','meta_14',
                      'meta_15','meta_16','meta_17'  ];
A = [1,2,3,4,5,6,7,8,9,10]
B = ['grpA','grpB','grpC','grpD','grpE','grpF','grpG','grpH']
C = random.randrange(100,300,10)
D = ['2014-10-31','2013-08-17','2012-07-31','2012-06-03','2014-03-03','2014-06-10','2013-01-01','2012-10-31','2013-08-31','2014-09-31']
E = ['N','NE','E','SE','S','SW','W','NW']
F = random.uniform(0.1,90.0)  # lat
G = random.uniform(-180.0,180.0)  # lat
H = ['elbow','knee','right_thumb','left_ear']
def go():
	"""
		metadata_lookup_per_dsid[dsid][metadataName] = value			

	"""
	metadata_lookup = {}
	
		
	cur.execute(md_query)
	for row in cur.fetchall():
		did = row[0]
		for name in test_metadata_names:
			print did,name
			value = ''
			if name == 'patientID':
				value = random.choice(A)
			if name == 'sample_location':
				value = random.choice(E)
			if name == 'temperature':
				value = random.choice(A)
			if name == 'diss_oxygen':
				value = random.uniform(0.0,10.0)
			if name == 'ammonium':
				value = random.uniform(2.0,5.0)
			if name == 'chlorophyll':
				value = random.uniform(30.0,42.0)
			if name == 'latitude':
				value = random.uniform(0.1,90.0) 
			if name == 'longitude':
				value = random.uniform(-180.0,180.0)
			if name == 'description':
				value = random.choice(A)
			if name == 'body_site':
				value = random.choice(H)
			if name == 'collection_date':
				value = random.choice(D)
			if name == 'sample_size':
				value = random.choice(A)
			if name == 'study_center':
				value = random.choice(B)
			if not value:
				value = random.choice(A)

			if did in metadata_lookup:				
					metadata_lookup[did][name] = value
			else:
				metadata_lookup[did] = {}
				metadata_lookup[did][name] = value
				
	

	json_str = json.dumps(metadata_lookup)		
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
	
 	 	
	
	go() 
