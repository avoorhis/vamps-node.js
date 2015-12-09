#!/usr/bin/env python

""" 
  create_counts_lookup.py


"""

import sys,os
import argparse
import MySQLdb
import json
import logging


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


db = MySQLdb.connect( read_default_file=os.path.expanduser("~/.my.cnf_node")  ) 
cur = db.cursor()

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

required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "public"];
req_query = "SELECT dataset_id, "+','.join(required_metadata_fields)+" from required_metadata_info WHERE dataset_id in ('%s')"
cust_pquery = "SELECT project_id,field_name from custom_metadata_fields WHERE project_id = '%s'"


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





#
#
#

def go_add(args):
    
    logging.info('CMD> '+args.process_dir+'/public/scripts/'+os.path.basename(__file__)+' -db '+args.NODE_DATABASE+' -pid '+str(args.pid)+' -process_dir '+args.process_dir)
    print('CMD> '+args.process_dir+'/public/scripts/'+os.path.basename(__file__)+' -db '+args.NODE_DATABASE+' -pid '+str(args.pid)+' -process_dir '+args.process_dir)
    print args


    NODE_DATABASE = args.NODE_DATABASE
    pid = args.pid
    process_dir = args.process_dir
    cur.execute("USE "+NODE_DATABASE)
    counts_lookup = {}
    prefix = os.path.join(args.process_dir,'public','json',NODE_DATABASE+'--datasets')
    if not os.path.exists(prefix):
        os.makedirs(prefix)
    print prefix
    dids = get_dataset_ids(pid) 
    # delete old did files if any
    for did in dids:        
        pth = os.path.join(prefix,did+'.json')
        try:            
            os.remove(pth)
        except:
            pass
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
            did = str(row[1])
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
            if did in counts_lookup:
                #sys.exit('We should not be here - Exiting')
                if tax_id_str in counts_lookup[did]:
                    sys.exit('We should not be here - Exiting')
                else:
                    counts_lookup[did][tax_id_str] = count
                    
            else:
                counts_lookup[did] = {}
                counts_lookup[did][tax_id_str] = count
    
    logging.info('getting required metadata from db')
    metadata_lookup = go_required_metadata(did_sql)
    logging.info('getting custom metadata from db')
    metadata_lookup = go_custom_metadata(dids, pid, metadata_lookup)
    logging.info('writing individual json files')
    write_json_files(prefix, metadata_lookup, counts_lookup)
    
    print 'writing all metadata file'
    logging.info('writing all metadata file')
    write_all_metadata_file(args,metadata_lookup)
    print 'writing all taxcount file'
    logging.info('writing all taxcouts file')
    write_all_taxcounts_file(args,counts_lookup)
    # print 'DONE (must now move file into place)'

def write_all_metadata_file(args,metadata_lookup):
    original_metadata_lookup = read_original_metadata(args)
    md_file = os.path.join(args.process_dir,'public','json',args.NODE_DATABASE+"--metadata.json")
    #print md_file
    for did in metadata_lookup:
        original_metadata_lookup[did] = metadata_lookup[did]
    json_str = json.dumps(original_metadata_lookup)		
    #print(json_str)
    f = open(md_file,'w')
    f.write(json_str+"\n")
    f.close() 
    
def write_all_taxcounts_file(args,counts_lookup):
    original_counts_lookup = read_original_taxcounts(args)
    tc_file = os.path.join(args.process_dir,'public','json',args.NODE_DATABASE+"--taxcounts.json")
    for did in counts_lookup:
        original_counts_lookup[did] = counts_lookup[did]
    json_str = json.dumps(original_counts_lookup)		
    #print(json_str)
    f = open(tc_file,'w')
    f.write(json_str+"\n")
    f.close()
      
def write_json_files(prefix, metadata_lookup, counts_lookup):
    print "In write_json_files"
    #print counts_lookup
    #json_str = json.dumps(counts_lookup)    
    # print('Re-Writing JSON file (REMEMBER to move new file to ../json/)')
    # f = open(outfile,'w')
    # f.write(json_str+"\n")
    # f.close()
    # for did in counts_lookup:
#         file_path = os.path.join(prefix,str(did)+'.json')
#         f = open(file_path,'w')
#         mystr = json.dumps(counts_lookup[did])
#         print mystr
#         f.write('{"'+str(did)+'":'+mystr+"}\n")
#         f.close()
    for did in counts_lookup:
         file_path = os.path.join(prefix,str(did)+'.json')
         logging.info('file_path: '+file_path)
         f = open(file_path,'w') 
        
         my_counts_str = json.dumps(counts_lookup[did]) 
         if did in metadata_lookup:
             my_metadata_str = json.dumps(metadata_lookup[did]) 
         else:
             print 'WARNING -- no metadata for dataset: '+str(did)
             logging.info('WARNING -- no metadata for dataset: '+str(did))
             my_metadata_str = json.dumps({})
         #f.write('{"'+str(did)+'":'+mystr+"}\n") 
         logging.debug('writing to fh: '+my_counts_str)
         f.write('{"taxcounts":'+my_counts_str+',"metadata":'+my_metadata_str+'}'+"\n")
         f.close()  
          
def go_required_metadata(did_sql):
	"""
		metadata_lookup_per_dsid[dsid][metadataName] = value			

	"""
	
	req_metadata_lookup = {}
	query = req_query % (did_sql)
	cur.execute(query)
	for row in cur.fetchall():
		did = str(row[0])
		for i,f in enumerate(required_metadata_fields):
			#print i,did,name,row[i+1]
			value = row[i+1]
			
			if did in req_metadata_lookup:				
					req_metadata_lookup[did][f] = str(value)
			else:
				req_metadata_lookup[did] = {}
				req_metadata_lookup[did][f] = str(value)
				
	
	return req_metadata_lookup

	
	
def go_custom_metadata(did_list,pid,metadata_lookup):
	
    
    field_collection = ['dataset_id']
    query = cust_pquery % (pid)
    cur.execute(query)
    cust_metadata_lookup = {}
    table = 'custom_metadata_'+ str(pid)
    for row in cur.fetchall():
			
    	pid = str(row[0])
    	field = row[1]
    	if field != 'dataset_id':
            field_collection.append(field)
    	


    
    print 'did_list',did_list
    print 'field_collection',field_collection

    cust_dquery = "SELECT `" + '`,`'.join(field_collection) + "` from " + table
    print cust_dquery
    try:
        cur.execute(cust_dquery)

        #print 'metadata_lookup1',metadata_lookup
        for row in cur.fetchall():
            #print row
            did = str(row[0])
            if did in did_list:
            
            
                for i,f in enumerate(field_collection):
                    #cnt = i
                
                    if f != 'dataset_id':
                        value = str(row[i])
                        #print 'XXX',did,i,f,value

                        if did in metadata_lookup:				
                         	metadata_lookup[did][f] = value
                        else:
                        	metadata_lookup[did] = {}
                        	metadata_lookup[did][f] = value
                
    except:
        print 'could not find or read',table,'Skipping'
        logging.info('could not find or read '+table+' --Skipping')
    print
    #print 'metadata_lookup2',metadata_lookup
    #sys.exit()
    return metadata_lookup
    
def read_original_taxcounts(args):
    

    file_path = os.path.join(args.process_dir,'public','json',args.NODE_DATABASE+'--taxcounts.json')
    if os.path.exists(file_path):
        with open(file_path) as data_file:    
            data = json.load(data_file)
    else:
        data = {}
    return data  
def read_original_metadata(args):
    
    file_path = os.path.join(args.process_dir,'public','json',args.NODE_DATABASE+'--metadata.json')
    if os.path.exists(file_path):
        with open(file_path) as data_file:    
            data = json.load(data_file)
    else:
        data = {}        
    return data 
# def read_original_taxcounts(infile):
#     counts_lookup = {}
#     try:
#         with open(infile) as data_file:
#             counts_lookup = json.load(data_file)
#     except:
#         sys.exit("Could not find taxcounts file: "+infile)
#     return counts_lookup
    
def get_dataset_ids(pid):
    print str(db)
    print str(cur)
    cur.execute('SELECT DATABASE()')
    dbase= cur.fetchone()
    print 'dbase',dbase[0]
    
    q = "SELECT dataset_id from dataset where project_id='%s'"  % (pid) 
    print q
    cur.execute(q)
    db.commit()
    dids = []
    numrows = cur.rowcount
    if numrows == 0:
         sys.exit('No data found for pid '+str(pid))
    
    for row in cur.fetchall():
        print 'DS ROW',row
        dids.append(str(row[0]))
    
    return dids
    

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="") 
    usage = """usage: vamps_script_create_json_dataset_files.py  [options]

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
               required=False,  action="store",   dest = "pid", default='0',
               help="""ProjectID""") 
   
    # parser.add_argument("-del","--del",                   
    #            required=False,  action="store_true",   dest = "delete", default='',
    #            help="""ProjectID""") 
               
    parser.add_argument("-add","--add",                   
               required=False,  action="store_true",   dest = "add", default='',
               help="""ProjectID""")
               
    # parser.add_argument("-list","--list",                   
    #            required=False,  action="store_true",   dest = "list", default='',
    #            help="""ProjectID""") 
    parser.add_argument("-db","--database",                   
               required=True,  action="store",   dest = "NODE_DATABASE", default='',
               help="""ProjectID""")  
    parser.add_argument("-process_dir", "--process_dir",                   
               required=False,  action="store",   dest = "process_dir", default='/',
               help="""ProjectID""")          
    args = parser.parse_args()
   
    
    go_add(args)

    logging.info("DONE")
    print "DONE"
    #
    # THIS MUST BE THE LAST PRINT!!!!
    print "PID="+str(args.pid)
    ##
    logging.info("ALL DONE: (PID="+str(args.pid)+')')
    

        

