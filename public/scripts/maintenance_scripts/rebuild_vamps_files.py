#!/usr/bin/env python

""" 
  create_counts_lookup.py


"""

import sys,os,io
import argparse
import pymysql as MySQLdb
import json
import shutil
import datetime
import socket

today     = str(datetime.date.today())


"""
silva119 MISSING from taxcount(silva119 only) or json(silva119 or rdp2.6) files:
ID: 416 project: DCO_ORC_Av6

rdp
ID: 284 project: KCK_NADW_Bv6
ID: 185 project: LAZ_DET_Bv3v4
ID: 385 project: LAZ_PPP_Bv3v5
ID: 278 project: LAZ_SEA_Bv6v4
ID: 213 project: LTR_PAL_Av6

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
query_coreA = " FROM sequence_pdr_info" 
query_coreA += " JOIN sequence_uniq_info USING(sequence_id)"

query_core_join_silva119 = " JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id)"
query_core_join_silva119 += " JOIN silva_taxonomy USING(silva_taxonomy_id)" 
query_core_join_rdp = " JOIN rdp_taxonomy_info_per_seq USING(rdp_taxonomy_info_per_seq_id)"
query_core_join_rdp += " JOIN rdp_taxonomy USING(rdp_taxonomy_id)" 

domain_queryA = "SELECT sum(seq_count), dataset_id, domain_id"
#domain_query += query_core
domain_queryB = " WHERE dataset_id in ('%s')"
domain_queryB += " GROUP BY dataset_id, domain_id"

phylum_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id" 
#phylum_query += query_core
phylum_queryB = " WHERE dataset_id in ('%s')"
phylum_queryB += " GROUP BY dataset_id, domain_id, phylum_id"

class_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id" 
#class_query += query_core
class_queryB = " WHERE dataset_id in ('%s')"
class_queryB += " GROUP BY dataset_id, domain_id, phylum_id, klass_id"

order_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id"
#order_query += query_core
order_queryB = " WHERE dataset_id in ('%s')"
order_queryB += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id"

family_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"
#family_query += query_core
family_queryB = " WHERE dataset_id in ('%s')"
family_queryB += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"

genus_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id" 
#genus_query += query_core
genus_queryB = " WHERE dataset_id in ('%s')"
genus_queryB += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id"

species_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id" 
#species_query += query_core
species_queryB = " WHERE dataset_id in ('%s')"
species_queryB += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id"

strain_queryA = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id" 
#strain_query += query_core
strain_queryB = " WHERE dataset_id in ('%s')"
strain_queryB += " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id"


cust_pquery = "SELECT project_id,field_name from custom_metadata_fields WHERE project_id = '%s'"

queries = [{"rank":"domain",    "queryA":domain_queryA, "queryB":domain_queryB},
           {"rank":"phylum",    "queryA":phylum_queryA, "queryB":phylum_queryB},
           {"rank":"klass",     "queryA":class_queryA,  "queryB":class_queryB},
           {"rank":"order",     "queryA":order_queryA,  "queryB":order_queryB},
           {"rank":"family",    "queryA":family_queryA, "queryB":family_queryB},
           {"rank":"genus",     "queryA":genus_queryA,  "queryB":genus_queryB},
           {"rank":"species",   "queryA":species_queryA,"queryB":species_queryB},
           {"rank":"strain",    "queryA":strain_queryA, "queryB":strain_queryB}
           ]
           
def convert_keys_to_string(dictionary):
    """Recursively converts dictionary keys to strings."""
    if not isinstance(dictionary, dict):
        return dictionary
    return dict((str(k), convert_keys_to_string(v)) 
        for k, v in dictionary.items())
        
def go_list(args):
    
    #
    file_dids = []
    if args.units == 'silva119':
        #dids from big file
        counts_lookup = convert_keys_to_string(read_original_taxcounts())
        file_dids = counts_lookup.keys()
    elif args.units == 'rdp2.6':
        #dids from individual files
        files_prefix = os.path.join(args.json_file_path,NODE_DATABASE+'--datasets_rdp2.6')
        for file in os.listdir(files_prefix):
            if file.endswith(".json"):
                file_dids.append(os.path.splitext(file)[0])
    metadata_lookup = convert_keys_to_string(read_original_metadata())
    metadata_dids = metadata_lookup.keys()
    #
    #print file_dids
    #print len(file_dids)           
    q =  "SELECT dataset_id, dataset.project_id, project from project"
    q += " JOIN dataset using(project_id) order by project"
    
    num = 0
    cur.execute(q)
    #print 'List of projects in: '+in_file
    projects = {}
    missing_bulk_silva119 = {}
    missing_files = {}
    
    missing_metadata = {}
    for row in cur.fetchall():
        did = str(row[0])
        pid = row[1]
        project = row[2]
        projects[project] = pid
        if did not in metadata_dids:
            missing_metadata[project] = pid
        if did not in file_dids:
            missing_files[project] = pid
        if args.units == 'silva119':
            file_path = os.path.join(args.json_file_path,NODE_DATABASE+'--datasets_silva119',did+'.json')
            #file_path = os.path.join(args.json_file_path,NODE_DATABASE+'--datasets',did+'.json')
            if not os.path.isfile(file_path):
                missing_bulk_silva119[project] = pid
        #print 'project:',row[0],' --project_id:',row[1]
    sort_p = sorted(projects.keys())
    print 'UNITS:',args.units
    for project in sort_p:  
        if project not in missing_files and project not in missing_bulk_silva119:
            print 'ID:',projects[project],"-",project
        num += 1
    print
    print args.units,'MISSING from metadata bulk file:'
    sort_md = sorted(missing_metadata.keys())
    for project in sort_md:
        print 'ID:',missing_metadata[project],"project:",project
    print
    
    print args.units,'MISSING from taxcount(silva119 only) bulk file:'
    sort_m = sorted(missing_bulk_silva119.keys())
    for project in sort_m:
        print 'ID:',missing_bulk_silva119[project],"project:",project
    print
    print args.units,'MISSING '+args.units+' files:'
    sort_m = sorted(missing_files.keys())
    for project in sort_m:
        print 'ID:',missing_files[project],"project:",project
    print
    print 'Number of Projects:',num
    

def get_dco_pids(args):

    query = "select project_id from project where project like 'DCO%'"
    cur.execute(query)
    rows = cur.fetchall()
    pid_list = []
    for row in rows:
        pid_list.append(str(row[0])) 
    
    return ','.join(pid_list)
       
def go_add(NODE_DATABASE, pids_str):
    from random import randrange
    counts_lookup = {}
    if args.units == 'silva119':
        prefix = os.path.join(args.json_file_path,NODE_DATABASE+'--datasets_silva119')
    elif args.units == 'rdp2.6':
        prefix = os.path.join(args.json_file_path,NODE_DATABASE+'--datasets_rdp2.6')
    
    if not os.path.exists(prefix):
        os.makedirs(prefix)
    print prefix
    all_dids = []
    metadata_lookup = {}
    
    pid_list = pids_str.split(',')
    # Uniquing list here
    pid_set = set(pid_list)
    pid_list = list(pid_set)
    for i,pid in enumerate(pid_list):
        dids = get_dataset_ids(pid) 
        all_dids += dids
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
            if args.units == 'rdp2.6':
                query = q["queryA"] + query_coreA + query_core_join_rdp + q["queryB"] % (did_sql)
            elif args.units == 'silva119':
                query = q["queryA"] + query_coreA + query_core_join_silva119 + q["queryB"] % (did_sql)
            print 'PID =',pid, '('+str(i+1),'of',str(len(pid_list))+')'
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
                    	# unless pid was duplicated on CL
                        sys.exit('We should not be here - Exiting')
                    else:
                        counts_lookup[did][tax_id_str] = count
                    
                else:
                    counts_lookup[did] = {}
                    counts_lookup[did][tax_id_str] = count
    
        metadata_lookup = go_custom_metadata(dids, pid, metadata_lookup)
    
    print('all_dids',all_dids)
    all_did_sql = "','".join(all_dids)
    metadata_lookup = go_required_metadata(all_did_sql,metadata_lookup)
    
    if args.metadata_warning_only:
        for did in dids:            
             if did in metadata_lookup:
                 print 'metadata found for did',did
             else:
                 print 'WARNING -- no metadata for did:',did
    else:
        
        
        write_json_files(prefix, all_dids, metadata_lookup, counts_lookup)
    
        rando = randrange(10000,99999)
        write_all_metadata_file(metadata_lookup, rando)
    
        # only write here for default taxonomy: silva119
        # discovered this file is not used
        #if args.units == 'silva119':
        #    write_all_taxcounts_file(counts_lookup, rando)
    

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
        
    #print(metadata_lookup)
    # f = open(md_file,'w')
#     try:
#         json_str = json.dumps(original_metadata_lookup, ensure_ascii=False) 
#     except:
#         json_str = json.dumps(original_metadata_lookup) 
        
    
    with io.open(md_file, 'w', encoding='utf-8') as f:
        try:
            f.write(json.dumps(original_metadata_lookup)) 
        except:
           f.write(json.dumps(original_metadata_lookup, ensure_ascii=False)) 
        finally:
            pass
    print 'writing new metadata file'
    #f.write(json_str.encode('utf-8').strip()+"\n")
    f.close() 
    
def write_all_taxcounts_file(counts_lookup,rando):
    original_counts_lookup = read_original_taxcounts()
    
    tc_file = os.path.join(args.json_file_path,NODE_DATABASE+"--taxcounts_silva119.json")
    if not args.no_backup:
        bu_file = os.path.join(args.json_file_path,NODE_DATABASE+"--taxcounts_silva119"+today+'_'+str(rando)+".json")
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
      
def write_json_files(prefix, dids, metadata_lookup, counts_lookup):
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
     for did in dids:
         file_path = os.path.join(prefix,str(did)+'.json')
         print 'writing new file',file_path
         f = open(file_path,'w') 
         #print
         #print did, counts_lookup[did]
         if did in counts_lookup:
            my_counts_str = json.dumps(counts_lookup[did]) 
         else:
            my_counts_str = json.dumps({}) 
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
def go_required_metadata(did_sql, metadata_lookup):
    """
        metadata_lookup_per_dsid[dsid][metadataName] = value            

    """
    
    required_metadata_fields = get_required_metadata_fields(args)
    req_query = "SELECT dataset_id, "+','.join(required_metadata_fields)+" from required_metadata_info WHERE dataset_id in ('%s')"
    query = req_query % (did_sql)
    print(query)
    cur.execute(query)
    for row in cur.fetchall():
        did = str(row[0])
        if did not in metadata_lookup:              
            metadata_lookup[did] = {}
        #metadata_lookup[did]['primer_id'] = []
        for i,f in enumerate(required_metadata_fields):
            #print i,did,name,row[i+1]
            value = row[i+1]
# DO not put primers or primer_ids into files
#             if f == 'primer_suite_id':
#                 primer_query = "SELECT primer_id from primer"
#                 primer_query += " join ref_primer_suite_primer using(primer_id)"
#                 primer_query += " WHERE primer_suite_id='%s'"
#                 pquery = primer_query % (value)
#                 #print(pquery)
#                 cur.execute(pquery)
#                 metadata_lookup[did]['primer_ids'] = []
#                 for primer_row in cur.fetchall():
#                     metadata_lookup[did]['primer_ids'].append(str(primer_row[0]))
                     
            metadata_lookup[did][f] = str(value)
                
    
    return metadata_lookup

    
def get_required_metadata_fields(args):
    q =  "SHOW fields from required_metadata_info"   
    cur.execute(q)
    md_fields = []
    fields_not_wanted = ['required_metadata_id','dataset_id','created_at','updated_at']    
    for row in cur.fetchall():
        if row[0] not in fields_not_wanted:
            md_fields.append(row[0])
    return md_fields
        
def go_custom_metadata(did_list, pid, metadata_lookup):
    
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
            field_collection.append(field.strip())
        
    
    #print 'did_list',did_list
    #print 'field_collection',field_collection

    cust_dquery = "SELECT `" + '`,`'.join(field_collection) + "` from " + custom_table
    #print cust_dquery
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
                    #if row[i]:
                    value = str(row[i])
                    #else:
                    #    value = None
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
    file_path1 = os.path.join(args.json_file_path,NODE_DATABASE+'--taxcounts_silva119.json')
    try:
        with open(file_path1) as data_file:    
            data = json.load(data_file) 
    except:
        
        file_path2 = os.path.join(args.json_file_path,NODE_DATABASE+'--taxcounts.json')
        print "could not read json file",file_path1,'Now Trying',file_path2
        try:    
            with open(file_path2) as data_file:    
                data = json.load(data_file) 
        except:
            print "could not read json file",file_path2,'--Exiting'
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

    myusage = """
        -pids/--pids  [list of comma separated pids]
        
                        
        -l/  --list         List: list all projects in the DATABASE [default]
        
        -json_file_path/--json_file_path   json files path [Default: ../json]
        -host/--host        vampsdb, vampsdev    dbhost:  [Default: localhost]
        -units/--tax-units  silva119, or rdp2.6   [Default:silva119]
        
    count_lookup_per_dsid[dsid][rank][taxid] = count

    This script will add a project to ../json/<NODE-DATABASE>/<DATASET-NAME>.json JSON object
    But ONLY if it is already in the MySQL database.
    
    To add a new project to the MySQL database:
    If already GASTed:
        use ./upload_project_to_database.py in this directory
    If not GASTed
         use py_mbl_sequencing_pipeline custom scripts

    """
    parser.add_argument("-pids","--pids",                   
                required=False,  action="store",   dest = "pids_str", default='',
                help="""ProjectID (used with -add) no response if -list also included""") 
        
    
    parser.add_argument("-no_backup","--no_backup",                   
                required=False,  action="store_true",   dest = "no_backup", default=False,
                help="""no_backup of group files: taxcounts and metadata""")  
    parser.add_argument("-metadata_warning_only","--metadata_warning_only",                   
                required=False,  action="store_true",   dest = "metadata_warning_only", default=False,
                help="""warns of datasets with no metadata""")           
    parser.add_argument("-list","--list",                   
                required=False,  action="store_true",   dest = "list", default='',
                help="""list IDs, projects grouped for missing from taxcounts file, metadata file or individual json files""")
  
    parser.add_argument("-json_file_path", "--json_file_path",        
                required=False,  action='store', dest = "json_file_path",  default='../../json', 
                help="Not usually needed if -host is accurate")
                # for vampsdev"  /groups/vampsweb/vampsdev_node_data/json
    parser.add_argument("-host", "--host",    
                required=False,  action='store', dest = "dbhost",  default='localhost',
                help="choices=['vampsdb','vampsdev','localhost']") 
    parser.add_argument("-units", "--tax_units",    
                required=False,  action='store', choices=['silva119','rdp2.6'], dest = "units",  default='silva119',
                help="Default: 'silva119'; only other choice available is 'rdp2.6'")                       
    parser.add_argument("-dco", "--dco",    
                required=False,  action='store_true',  dest = "dco",  default=False,
                help="")   
    if len(sys.argv[1:]) == 0:
        print myusage
        sys.exit() 
    args = parser.parse_args()
    
    
    if args.dbhost == 'vamps' or args.dbhost == 'vampsdb':
        args.json_file_path = '/groups/vampsweb/vamps_node_data/json'
        dbhost = 'vampsdb'
        args.NODE_DATABASE = 'vamps2'
         
    elif args.dbhost == 'vampsdev':
        args.json_file_path = '/groups/vampsweb/vampsdev_node_data/json'
        args.NODE_DATABASE = 'vamps2'
        dbhost = 'bpcweb7'
    elif args.dbhost == 'localhost' and (socket.gethostname() == 'Annas-MacBook.local' or socket.gethostname() == 'Annas-MacBook-new.local'):
        args.NODE_DATABASE = 'vamps2'
        dbhost = 'localhost'        
    else:
        dbhost = 'localhost'
        args.NODE_DATABASE = 'vamps_development'
    if args.units == 'silva119':
        args.files_prefix   = os.path.join(args.json_file_path, args.NODE_DATABASE+"--datasets_silva119")
    elif args.units == 'rdp2.6':
         args.files_prefix   = os.path.join(args.json_file_path, args.NODE_DATABASE+"--datasets_rdp2.6")
    else:
        sys.exit('UNITS ERROR: '+args.units)
    print "\nARGS: dbhost  =",dbhost
    print "\nARGS: NODE_DATABASE  =",args.NODE_DATABASE
    print "ARGS: json_file_path =",args.json_file_path     
    if os.path.exists(args.json_file_path):
        print '** Validated json_file_path **'
    else:
        print usage
        print "Could not find json directory: '",args.json_file_path,"'-Exiting"
        sys.exit(-1)
    print "ARGS: units =",args.units   
    
    db = MySQLdb.connect(host=dbhost, # your host, usually localhost
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
    
    
    if args.dco:
        args.pids_str = get_dco_pids(args)
             
    if args.list:
        go_list(args)
    elif args.pids_str:
        go_add(NODE_DATABASE, args.pids_str)
    else:
        print myusage 
        sys.exit('need command line parameter(s)')
        

