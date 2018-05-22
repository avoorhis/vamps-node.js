#!/usr/bin/env python

""" 
  create_counts_lookup.py


"""

import sys,os
import argparse
import pymysql as MySQLdb
import json
import logging
import configparser as ConfigParser

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

query_coreA = " FROM sequence_pdr_info"
# query_coreA += " JOIN sequence_uniq_info USING(sequence_id)"

query_core_join_silva119 = " JOIN silva_taxonomy_info_per_seq USING(sequence_id)"
query_core_join_silva119 += " JOIN silva_taxonomy USING(silva_taxonomy_id)"

query_core_join_rdp = " JOIN rdp_taxonomy_info_per_seq USING(sequence_id)"
query_core_join_rdp += " JOIN rdp_taxonomy USING(rdp_taxonomy_id)"

query_coreA_generic = " FROM generic_taxonomy_info_per_seq"
#query_core_join_generic = " JOIN generic_taxonomy_info USING(dataset_id)"
#query_core_join_generic = " JOIN generic_taxonomy USING(generic_taxonomy_id)"
query_core_join_generic = " JOIN generic_taxonomy_info_per_seq USING(sequence_id)"
query_core_join_generic += " JOIN generic_taxonomy USING(generic_taxonomy_id)"

#SELECT sum(seq_count), dataset_id, domain_id 
query_coreA_matrix     = " FROM  matrix_taxonomy_info"
query_core_join_matrix = " JOIN generic_taxonomy USING(generic_taxonomy_id)"
#JOIN generic_taxonomy USING(generic_taxonomy_id) WHERE dataset_id in ('4413','4414','4415','4416','4417') GROUP BY dataset_id, domain_id ORDER BY NULL


where_part = " WHERE dataset_id in ('%s')"

# query_core = " FROM sequence_pdr_info" 
# query_core += " JOIN sequence_uniq_info USING(sequence_id)"
# query_core += " JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id)"
# query_core += " JOIN silva_taxonomy USING(silva_taxonomy_id)" 

domain_queryA = "SELECT sum(seq_count), dataset_id, domain_id"
#domain_query += query_core
domain_queryB = where_part
domain_queryB += " GROUP BY dataset_id, domain_id"

phylum_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id" 
#phylum_query += query_core
phylum_queryB = where_part
phylum_queryB += " GROUP BY dataset_id, domain_id, phylum_id"

class_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id" 
#class_query += query_core
class_queryB = where_part
class_queryB += " GROUP BY dataset_id, domain_id, phylum_id, klass_id"

order_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id"
#order_query += query_core
order_queryB = where_part
order_queryB += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id"

family_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"
#family_query += query_core
family_queryB = where_part
family_queryB += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"

genus_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id" 
#genus_query += query_core
genus_queryB = where_part
genus_queryB += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id"

species_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id" 
#species_query += query_core
species_queryB = where_part
species_queryB += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id"

strain_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id" 
#strain_query += query_core
strain_queryB = where_part
strain_queryB += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id"
end_group_query = " ORDER BY NULL"

required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_material", "latitude", "longitude", "public"];
req_query = "SELECT dataset_id, "+','.join(required_metadata_fields)+" from required_metadata_info WHERE dataset_id in ('%s')"
cust_pquery = "SELECT project_id,field_name from custom_metadata_fields WHERE project_id = '%s'"


#queries = [domain_query,phylum_query,class_query,order_query,family_query,genus_query,species_query,strain_query]
queries = [{"rank": "domain", "queryA": domain_queryA, "queryB": domain_queryB},
           {"rank": "phylum", "queryA": phylum_queryA, "queryB": phylum_queryB},
           {"rank": "klass", "queryA": class_queryA, "queryB": class_queryB},
           {"rank": "order", "queryA": order_queryA, "queryB": order_queryB},
           {"rank": "family", "queryA": family_queryA, "queryB": family_queryB},
           {"rank": "genus", "queryA": genus_queryA, "queryB": genus_queryB},
           {"rank": "species", "queryA": species_queryA, "queryB": species_queryB},
           {"rank": "strain", "queryA": strain_queryA, "queryB": strain_queryB}
           ]


# Globals
CONFIG_ITEMS = {}
DATASET_ID_BY_NAME = {}

#
#
#

def go_add(args):
    
    logging.info('CMD> '+' '.join(sys.argv))
    
    global mysql_conn, cur
    
    if args.site == 'vamps' or args.site == 'vampsdb':
        hostname = 'vampsdb'
    elif args.site == 'vampsdev':
        hostname = 'vampsdev'
    else:
        hostname = 'localhost'
        args.NODE_DATABASE = 'vamps_development' 
    
    mysql_conn = MySQLdb.connect(db = args.NODE_DATABASE, host=hostname, read_default_file=os.path.expanduser("~/.my.cnf_node")  )
    cur = mysql_conn.cursor()

    get_config_data(args)
    
    pid = CONFIG_ITEMS['project_id']
    
    counts_lookup = {}
    if args.units == 'rdp':
        file_prefix = os.path.join(args.jsonfile_dir,args.NODE_DATABASE+'--datasets_rdp2.6')
    elif args.units == 'generic':
        file_prefix = os.path.join(args.jsonfile_dir,args.NODE_DATABASE+'--datasets_generic')
    elif args.units == 'matrix':  # add matrix files to generic
        file_prefix = os.path.join(args.jsonfile_dir,args.NODE_DATABASE+'--datasets_generic')
    else:  # default 'silva119'
        file_prefix = os.path.join(args.jsonfile_dir,args.NODE_DATABASE+'--datasets_silva119')
    
    if not os.path.exists(file_prefix):
        os.makedirs(file_prefix)
    if args.verbose:
        print (file_prefix)
    #DATASET_ID_BY_NAME[ds] = did
    dids = [str(x) for x in DATASET_ID_BY_NAME.values()]
    print ('dids',dids)
    #dids = get_dataset_ids(pid) 
    # delete old did files if any
    for did in dids:        
        pth = os.path.join(file_prefix,str(did)+'.json')
        try:            
            os.remove(pth)
        except:
            pass
    did_sql = "','".join(dids)
    #print counts_lookup
    for q in queries:
        if args.units == 'rdp':
            query = q["queryA"] + query_coreA + query_core_join_rdp + q["queryB"] % did_sql + end_group_query
        elif args.units == 'generic':
            #query = q["queryA"] + query_coreA_generic + query_core_join_generic + q["queryB"] % did_sql + end_group_query
            query = q["queryA"] + query_coreA + query_core_join_generic + q["queryB"] % did_sql + end_group_query
        elif args.units == 'matrix':
            query = q["queryA"] + query_coreA_matrix + query_core_join_matrix + q["queryB"] % did_sql + end_group_query
        else:  # default 'silva119'
            query = q["queryA"] + query_coreA + query_core_join_silva119 + q["queryB"] % did_sql + end_group_query
        if args.verbose:
            print (query)
        dirs = []
        cur.execute(query)
        
        for row in cur.fetchall():
            #print row
            count = int(row[0])
            did = str(row[1])
           
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
    if args.verbose:
        print('counts_lookup')
        print(counts_lookup)
    metadata_lookup = {}
    #logging.info('getting required metadata from db')
    #metadata_lookup = go_required_metadata(did_sql)
    #logging.info('getting custom metadata from db')
    #metadata_lookup = go_custom_metadata(dids, pid, metadata_lookup)
    #logging.info('writing individual json files')
    write_json_files(file_prefix, metadata_lookup, counts_lookup)
    
    print ('writing all metadata file')
    logging.info('writing all metadata file')
    write_all_metadata_file(args,metadata_lookup)
    print ('writing all taxcount file')
    #logging.info('writing all taxcouts file')
    #write_all_taxcounts_file(args,counts_lookup)
    # print 'DONE (must now move file into place)'

def write_all_metadata_file(args,metadata_lookup):
    original_metadata_lookup = read_original_metadata(args)
    md_file = os.path.join(args.jsonfile_dir,args.NODE_DATABASE+"--metadata.json")
    #print md_file
    for did in metadata_lookup:
        original_metadata_lookup[did] = metadata_lookup[did]
    json_str = json.dumps(original_metadata_lookup)		
    #print(json_str)
    f = open(md_file,'w')
    f.write(json_str+"\n")
    f.close() 
    
# def write_all_taxcounts_file(args,counts_lookup):
#     original_counts_lookup = read_original_taxcounts(args)
#     tc_file = os.path.join(args.jsonfile_dir,args.NODE_DATABASE+"--taxcounts.json")
#     for did in counts_lookup:
#         original_counts_lookup[did] = counts_lookup[did]
#     json_str = json.dumps(original_counts_lookup)		
#     #print(json_str)
#     f = open(tc_file,'w')
#     f.write(json_str+"\n")
#     f.close()
      
def write_json_files(file_prefix, metadata_lookup, counts_lookup):
    print ("In write_json_files")
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
         file_path = os.path.join(file_prefix,str(did)+'.json')
         logging.info('file_path: '+file_path)
         if args.verbose:
            print('file_path: '+file_path)
         f = open(file_path,'w') 
        
         my_counts_str = json.dumps(counts_lookup[did]) 
         if did in metadata_lookup:
             my_metadata_str = json.dumps(metadata_lookup[did]) 
         else:
             print ('WARNING -- no metadata for dataset: '+str(did))
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
	global mysql_conn, cur
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
	
    global mysql_conn, cur
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
    	


    
    print ('did_list',did_list)
    print ('field_collection',field_collection)

    cust_dquery = "SELECT `" + '`,`'.join(field_collection) + "` from " + table
    print (cust_dquery)
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
        print ('could not find or read',table,'Skipping')
        logging.info('could not find or read '+table+' --Skipping')
    print()
    #print 'metadata_lookup2',metadata_lookup
    #sys.exit()
    return metadata_lookup
    
def read_original_taxcounts(args):
    

    file_path = os.path.join(args.jsonfile_dir,args.NODE_DATABASE+'--taxcounts.json')
    if os.path.exists(file_path):
        with open(file_path) as data_file:    
            data = json.load(data_file)
    else:
        data = {}
    return data 
     
def read_original_metadata(args):
    
    file_path = os.path.join(args.jsonfile_dir,args.NODE_DATABASE+'--metadata.json')
    if os.path.exists(file_path):
        with open(file_path) as data_file:    
            data = json.load(data_file)
    else:
        data = {}        
    return data 

def get_config_data(args):
    global mysql_conn, cur
    config_path = os.path.join(args.project_dir, args.config_file)
    print (config_path)
    logging.info(config_path)
    config = ConfigParser.ConfigParser()
    config.optionxform=str
    config.read(config_path)    
    for name, value in  config.items('MAIN'):
        #print '  %s = %s' % (name, value)  
        CONFIG_ITEMS[name] = value
    CONFIG_ITEMS['datasets'] = []
    for dsname, count in  config.items('MAIN.dataset'):        
        CONFIG_ITEMS['datasets'].append(dsname)   
    #print ('project',CONFIG_ITEMS['project'])
    q = "SELECT project_id FROM project"
    q += " WHERE project = '"+CONFIG_ITEMS['project_name']+"'" 
    logging.info(q)
    cur.execute(q)
    
    row = cur.fetchone()     
    CONFIG_ITEMS['project_id'] = row[0]
        
    q = "SELECT dataset,dataset_id from dataset"
    q += " WHERE dataset in('"+"','".join(CONFIG_ITEMS['datasets'])+"')"
    logging.info(q)
    cur.execute(q)     
    for row in cur.fetchall():        
        DATASET_ID_BY_NAME[row[0]] = row[1]
        
    mysql_conn.commit()    

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
    
         
    parser.add_argument("-site", "--site",    
                required=False,  action="store",   dest = "site", default='local',
                help = '')
    parser.add_argument("-db","--database",                   
               required=False,  action="store",   dest = "NODE_DATABASE", default='vamps2',
               help="""NODE_DATABASE [default:vamps2]""")  
    parser.add_argument("-project_dir", "--project_dir",    
                required=True,  action="store",   dest = "project_dir", 
                help = 'ProjectDirectory')
    parser.add_argument("-p", "--project",                   
               required=True,  action="store",   dest = "project",
               help="""ProjectName""") 
    parser.add_argument("-o", "--jsonfile_dir",                   
               required=True,  action="store",   dest = "jsonfile_dir",
               help="""JSON Files Directory""")
    parser.add_argument("-units", "--tax_units",
                required = False, action = 'store', choices = ['silva119', 'rdp', 'generic', 'matrix'], dest = "units",
                default = 'silva119',
                help = "Default: 'silva119'; only other choice available is 'rdp', 'generic', 'matrix'")
    parser.add_argument("-config", "--config",
                required = False, action = 'store',  dest = "config_file",
                default = 'INFO.config',
                help = "")                               
    parser.add_argument("-v", "--verbose",    
                required=False,  action="store_true",   dest = "verbose", default=False,
                help = 'chatty')  
    args = parser.parse_args()
   
    
    go_add(args)

    
    print ("DONE")
    fp = open(os.path.join(args.project_dir,'ASSIGNMENT_COMPLETE.txt'),'w')
    try:
        fp.write(str(CONFIG_ITEMS['project_id']))
    except:
        fp.write('ERROR')
    fp.close()
    #
    # THIS MUST BE THE LAST PRINT!!!!
    print ("PID="+str(CONFIG_ITEMS['project_id']))
    ##
    logging.info("ALL DONE: (PID="+str(CONFIG_ITEMS['project_id'])+')')
    #sys.exit('END: vamps_script_create_json_dataset_files.py')

        

