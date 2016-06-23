#!/usr/bin/env python

""" 
  create_counts_lookup.py


"""

import sys,os,io
import argparse
import MySQLdb
import json
import shutil
import datetime

today     = str(datetime.date.today())


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
def convert_keys_to_string(dictionary):
    """Recursively converts dictionary keys to strings."""
    if not isinstance(dictionary, dict):
        return dictionary
    return dict((str(k), convert_keys_to_string(v)) 
        for k, v in dictionary.items())
def go_list(args):
    counts_lookup = convert_keys_to_string(read_original_taxcounts())
    metadata_lookup = convert_keys_to_string(read_original_metadata())
    metadata_dids = metadata_lookup.keys()
    file_dids = counts_lookup.keys()
    #print file_dids
    #print len(file_dids)           
    q =  "SELECT dataset_id,dataset.project_id,project from project"
    q += " JOIN dataset using(project_id) order by project"
    #q += " WHERE dataset_id in('%s')"
    
    #did_sql = "','".join(file_dids)
    #q = q % (did_sql)
    #print q
    num = 0
    cur.execute(q)
    #print 'List of projects in: '+in_file
    projects = {}
    missing = {}
    missing_metadata = {}
    for row in cur.fetchall():
        did = str(row[0])
        pid = row[1]
        project = row[2]
        projects[project] = pid
        if did not in metadata_dids:
            missing_metadata[project] = pid
        if did not in file_dids:
            missing[project] = pid
        file_path = os.path.join(args.json_file_path,NODE_DATABASE+'--datasets',did+'.json')
        if not os.path.isfile(file_path):
            missing[project] = pid
        #print 'project:',row[0],' --project_id:',row[1]
    sort_p = sorted(projects.keys())
    for project in sort_p:  
        if project not in missing:
            print 'ID:',projects[project],"-",project
        num += 1
    print
    print 'MISSING from metadata file:'
    sort_md = sorted(missing_metadata.keys())
    for project in sort_md:
        print 'ID:',missing_metadata[project],"project:",project
    print
    print 'MISSING from taxcount or json files:'
    sort_m = sorted(missing.keys())
    for project in sort_m:
        print 'ID:',missing[project],"project:",project
    print
    
    print 'Number of Projects:',num
    

    
def go_add(NODE_DATABASE, pid):
    from random import randrange
    counts_lookup = {}
    prefix = os.path.join(args.json_file_path,NODE_DATABASE+'--datasets')
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
    

    metadata_lookup = go_required_metadata(did_sql)
    metadata_lookup = go_custom_metadata(dids, pid, metadata_lookup)
    
    write_json_files(prefix, metadata_lookup, counts_lookup)
    
    rando = randrange(10000,99999)
    write_all_metadata_file(metadata_lookup,rando)
    write_all_taxcounts_file(counts_lookup,rando)
    # print 'DONE (must now move file into place)'

def write_all_metadata_file(metadata_lookup,rando):
    original_metadata_lookup = read_original_metadata()
    md_file = os.path.join(args.json_file_path,NODE_DATABASE+"--metadata.json")
    
    if not args.no_backup:
        bu_file = os.path.join(args.json_file_path,NODE_DATABASE+"--metadata_"+today+'_'+str(rando)+".json")
        print 'Backing up metadata file to',bu_file
        shutil.copy(md_file, bu_file)
    #print md_file
    for did in metadata_lookup:
        original_metadata_lookup[did] = metadata_lookup[did]
        
    #print(json_str)
    f = open(md_file,'w')
    try:
        json_str = json.dumps(original_metadata_lookup, ensure_ascii=False) 
    except:
        json_str = json.dumps(original_metadata_lookup) 
    print 'writing new metadata file'
    f.write(json_str.encode('utf-8').strip()+"\n")
    f.close() 
    
def write_all_taxcounts_file(counts_lookup,rando):
    original_counts_lookup = read_original_taxcounts()
    tc_file = os.path.join(args.json_file_path,NODE_DATABASE+"--taxcounts.json")
    if not args.no_backup:
        bu_file = os.path.join(args.json_file_path,NODE_DATABASE+"--taxcounts_"+today+'_'+str(rando)+".json")
        print 'Backing up taxcount file to',bu_file
        shutil.copy(tc_file, bu_file)
    for did in counts_lookup:
        original_counts_lookup[did] = counts_lookup[did]
    json_str = json.dumps(original_counts_lookup)       
    #print(json_str)
    f = open(tc_file,'w')  # this will delete taxcounts file!
    print 'writing new taxcount file'
    f.write(json_str+"\n")
    f.close()
      
def write_json_files(prefix, metadata_lookup, counts_lookup):
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
         f = open(file_path,'w') 
         #print
         #print did, counts_lookup[did]
         my_counts_str = json.dumps(counts_lookup[did]) 
         if did in metadata_lookup:
             try:
                my_metadata_str = json.dumps(metadata_lookup[did])
             except:
                my_metadata_str = json.dumps(metadata_lookup[did], ensure_ascii=False)
         else:
             print 'WARNING -- no metadata for dataset:',did
             my_metadata_str = json.dumps({})
         #f.write('{"'+str(did)+'":'+mystr+"}\n") 
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
    
    
    
    custom_table = 'custom_metadata_'+ pid
    q = "show tables like '"+custom_table+"'"
    cur.execute(q)
    table_exists = cur.fetchall()
    if not table_exists:
        return metadata_lookup
    
    field_collection = ['dataset_id']
    cust_metadata_lookup = {}
    query = cust_pquery % (pid)
    cur.execute(query)
    for row in cur.fetchall():
        pid = str(row[0])
        field = row[1]
        if field != 'dataset_id':
            field_collection.append(field)
        
    
    print 'did_list',did_list
    print 'field_collection',field_collection

    cust_dquery = "SELECT `" + '`,`'.join(field_collection) + "` from " + custom_table
    print cust_dquery
    #try:
    cur.execute(cust_dquery)

    #print 'metadata_lookup1',metadata_lookup
    for row in cur.fetchall():
        #print row
        did = str(row[0])
        if did in did_list:
            
            
            for i,f in enumerate(field_collection):
                #cnt = i
                
                if f != 'dataset_id':
                    if row[i]:
                        value = str(row[i].replace('"','').replace("'",''))
                    else:
                        value = None
                    #print 'XXX',did,i,f,value

                    if did in metadata_lookup:              
                        metadata_lookup[did][f] = value
                    else:
                        metadata_lookup[did] = {}
                        metadata_lookup[did][f] = value
                
        #except:
        #    print 'could not find or read',table,'Skipping'
    print
    #print 'metadata_lookup2',metadata_lookup
    #sys.exit()
    return metadata_lookup
    
def read_original_taxcounts():
    file_path = os.path.join(args.json_file_path,NODE_DATABASE+'--taxcounts.json')
    try:
        with open(file_path) as data_file:    
            data = json.load(data_file) 
    except:
        print "could not read json file",file_path,'-Exiting'
        sys.exit(1)
    return data 
     
def read_original_metadata():    
    file_path = os.path.join(args.json_file_path,NODE_DATABASE+'--metadata.json')
    try:
        with open(file_path) as data_file:    
            data = json.load(data_file)
    except:
        print "could not read json file",file_path,'-Exiting'
        sys.exit(1)
    return data 

    
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
        -pid/--project_id  ID  Must be combined with --add 
        
        This script only add to taxcounts files NOT MySQL
        -add/--add          Add project (will delete and overwrite if already present)
        OR
                
        -l/  --list         List: list all projects in the DATABASE [default]
        
        -json_file_path/--json_file_path   json files path Default: ../json
        -host/--host        vamps, vampsdev    dbhost:  Default: localhost

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
    
    
                
    parser.add_argument("-add","--add",                   
                required=False,  action="store_true",   dest = "add", default='',
                help="""ProjectID""")
    parser.add_argument("-no_backup","--no_backup",                   
                required=False,  action="store_true",   dest = "no_backup", default=False,
                help="""no_backup""")            
    parser.add_argument("-list","--list",                   
                required=False,  action="store_true",   dest = "list", default='',
                help="""ProjectID""")

    parser.add_argument("-json_file_path", "--json_file_path",        
                required=False,  action='store', dest = "json_file_path",  default='../../json', 
                help="")
                # for vampsdev"  /groups/vampsweb/vampsdev_node_data/json
    parser.add_argument("-host", "--host",    
                required=False,  action='store', choices=['vampsdb','vampsdev','localhost'], dest = "dbhost",  default='localhost',
                help="")            
    args = parser.parse_args()
    
    print "ARGS: dbhost  =",args.dbhost
    if args.dbhost == 'vamps' or args.dbhost == 'vampsdb':
        args.json_file_path = '/groups/vampsweb/vamps_node_data/json'
        
        args.dbhost = 'vampsdb'
        args.NODE_DATABASE = 'vamps2'
        args.files_prefix   = os.path.join(args.json_file_path, args.NODE_DATABASE+"--datasets") 
    elif args.dbhost == 'vampsdev':
        args.json_file_path = '/groups/vampsweb/vampsdev_node_data/json'
        args.NODE_DATABASE = 'vamps2'
        args.files_prefix   = os.path.join(args.json_file_path, args.NODE_DATABASE+"--datasets") 
    if os.path.exists(args.json_file_path):
        print 'Validated: json file path'
    else:
        print usage
        print "Could not find json directory: '",args.json_file_path,"'-Exiting"
        sys.exit(-1)
    print "ARGS: json_dir=",args.json_file_path 
      
    
    db = MySQLdb.connect(host=args.dbhost, # your host, usually localhost
                             read_default_file="~/.my.cnf_node"  )
    cur = db.cursor()
    if args.NODE_DATABASE:
        NODE_DATABASE = args.NODE_DATABASE
    else:
        cur.execute("SHOW databases like 'vamps%'")
        dbs = []
        print myusage
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
    
    
    if not args.list and not args.pid and  not args.add:
        print usage        
        sys.exit('need command line parameter(s)')
        
    
           
    if args.add and not args.pid:
        print usage        
        sys.exit('need pid to add')
    
    
         
    if args.list:
        go_list(args)
    elif args.add and args.pid:
        go_add(NODE_DATABASE, args.pid)
    else:
        print usage 
        print "Maybe you forgot to add '-add' to the command line?"
        

