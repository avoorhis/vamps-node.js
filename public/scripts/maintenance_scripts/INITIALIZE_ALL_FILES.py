#!/usr/bin/env python

""" 
    create_counts_lookup.py


"""

import sys,os,shutil
import argparse
import MySQLdb
import json
import logging
import datetime
import socket

today     = str(datetime.date.today())


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
dataset_query = "SELECT dataset_id from dataset"
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

LOG_FILENAME = os.path.join('.','initialize_all_files.log')
logging.basicConfig(level=logging.DEBUG, filename=LOG_FILENAME, filemode="a+",
                           format="%(asctime)-15s %(levelname)-8s %(message)s")

def check_files(args):
    cur.execute(dataset_query)
    db_dids = []
    for row in cur.fetchall():
        db_dids.append(str(row[0]))
    #print db_dids
    did_count = len(db_dids)

    ###### INDIVIDUAL JSON FILES ##################
    print "\nChecking for files in:\n", args.files_prefix
    okay_count = 0
    file_dids = []
    missing = []
    for f in os.listdir(args.files_prefix):
        filename, file_extension = os.path.splitext(f)
        file_dids.append(filename)
    for did in db_dids:
        if did in file_dids:
            #print f,'okay'
            okay_count += 1
        else:
            missing.append(did)
    
    if okay_count == did_count:
        print 'OK1'
    else:
        print 'Missing from',os.path.basename(args.files_prefix)
        print "('" + "','".join(missing) + "')"
        pass
    print 'DID presence is REQUIRED'
    
    ######### TAXCOUNTS ###########################
    print "\nChecking:\n",args.taxcounts_file
    with open(args.taxcounts_file) as tax_file:    
        tdata = json.load(tax_file)
    
    okay_count = 0
    missing = []
    for did in db_dids:
        if did in tdata:
            #print 'found',did
            okay_count += 1
        else:
            missing.append(did)
    if okay_count == did_count:
        print 'OK2'
    else:
        print 'Missing from',os.path.basename(args.taxcounts_file)
        print "('" + "','".join(missing) + "')"
        pass
    print 'DID presence is REQUIRED'
    
    ########## METADATA ##########################
    print "\nChecking:\n",args.metadata_file
    with open(args.metadata_file) as md_file:    
        mdata = json.load(md_file)
    
    okay_count = 0
    missing = []
    for did in db_dids:
        if did in mdata:
            #print 'found',did
            okay_count += 1
        else:
            missing.append(did)
    if okay_count == did_count:
        print 'OK3'
    else:
        print 'Missing from',os.path.basename(args.metadata_file)
        print "('" + "','".join(missing) + "')"
        pass
    print 'DID presence is NOT Required'
def go(args):
    """
        count_lookup_per_dsid[dsid][tax_id_str] = count     
        

    """
    counts_lookup = {}
    
    try:
        shutil.rmtree(args.files_prefix)
        shutil.move(args.taxcounts_file, os.path.join(args.json_file_path, NODE_DATABASE+'--taxcounts'+today+'.json'))
        shutil.move(args.metadata_file,  os.path.join(args.json_file_path, NODE_DATABASE+'--metadata'+ today+'.json'))
        logging.debug('Backed up old taxcounts and metadata files')
    except:
        pass
    os.mkdir(args.files_prefix)
    logging.debug('Created Dir: '+args.files_prefix)
    for q in queries:
        print q["query"]
        dirs = []
        try:

            print "running mysql query for:",q['rank']
            logging.debug("running mysql query for: "+q['rank'])
            cur.execute(q["query"])
        except:
            print "Trying to query with:",q["query"]
            logging.debug("Failing to query with: "+q["query"])
            sys.exit("This Database Doesn't Look Right -- Exiting")
        for row in cur.fetchall():
            #print row
            count = int(row[0])
            ds_id = row[1]
            #if ds_id=='6189':
            #    print "FOUND 6189"
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
    logging.debug('gathering metadata from tables')          
    metadata_lookup = go_metadata()    
    
    print 'writing to individual files'
    logging.debug('writing to individual files') 
    write_data_to_files(args, metadata_lookup, counts_lookup)
    
    print 'writing metadata file'
    logging.debug('writing metadata file') 
    write_all_metadata_file(args, metadata_lookup)
    
    print 'writing taxcount file'
    logging.debug('writing taxcount file') 
    write_all_taxcounts_file(args, counts_lookup)
    for w in warnings:
        print w
        logging.debug(w)
    print "DONE"
    logging.debug("DONE") 
        

def write_data_to_files(args, metadata_lookup, counts_lookup):    
    
    #print counts_lookup
    for did in counts_lookup:
        file = os.path.join(args.files_prefix,str(did)+'.json')
        f = open(file,'w') 
        
        my_counts_str = json.dumps(counts_lookup[did]) 
        if did in metadata_lookup:
            my_metadata_str = json.dumps(metadata_lookup[did], encoding='latin1') 
        else:
            warnings.append('WARNING -- no metadata for dataset: '+str(did))
            my_metadata_str = json.dumps({})
        #f.write('{"'+str(did)+'":'+mystr+"}\n") 
        f.write('{"taxcounts":'+my_counts_str+',"metadata":'+my_metadata_str+'}'+"\n")
        f.close()

def write_all_metadata_file(args, metadata_lookup):
   
    #print md_file
    json_str = json.dumps(metadata_lookup, encoding='latin1')       
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
        
def go_metadata():
    """
        metadata_lookup_per_dsid[dsid][metadataName] = value            

    """
    
    metadata_lookup = {}

    logging.debug("running mysql for required metadata")
    #print req_pquery
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
    logging.debug('running mysql for custom metadata: '+cust_pquery)
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

        cust_dquery = "SELECT `" + '`,`'.join(fields) + "` from " + table
        print 'running other cust',cust_dquery
        logging.debug('running other cust: ' +cust_dquery)
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
        ./INITIALIZE_ALL_FILES.py  (
        
        


        Will ask you to input which database.
        Output will be files ../json/NODE_DATABASE/<dataset>.json
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
        
        -json_file_path/--json_file_path   json files path Default: ../json
        -host/--host            dbhost:  Default: localhost

        -c/--check_files  Will look for continuity between database(dataset table) and JSON files (no initialization)

    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)   
    parser.add_argument("-json_file_path", "--json_file_path",        
                required=False,  action='store', dest = "json_file_path",  default='', 
                help="Path where JSON files are located")
    parser.add_argument("-host", "--host",    
                required=False,  action='store', choices=['vampsdb','vampsdev','localhost'], dest = "dbhost",  default='localhost',
                help="ONLY: 'vampsdb','vampsdev','localhost'")
    parser.add_argument("-db", "--db",    
                required=False,  action='store', dest = "NODE_DATABASE",  default='',
                help="NODE_DATABASE")
    parser.add_argument("-c", "--check_files",    
                required=False,  action='store_true', dest = "check_files",  default=False,
                help="If set will look for continuity between database(dataset table) and JSON files")
    
    
    args = parser.parse_args() 

    print
    warnings = []
    if args.dbhost == 'vampsdev':
        args.json_file_path = os.path.join('/','groups','vampsweb','vampsdev_node_data','json')
        args.NODE_DATABASE = 'vamps2'
    elif args.dbhost == 'vampsdb':
        args.json_file_path = os.path.join('/','groups','vampsweb','vamps_node_data','json')
        args.NODE_DATABASE = 'vamps2'
    if not args.json_file_path:
        #args.json_file_path = os.path.join(os.path.realpath(__file__),'../','../','json'
        args.json_file_path = os.path.join(os.path.dirname(os.path.realpath(__file__)),'../','../','json')
    
    if not os.path.exists(args.json_file_path):
        print "Could not find json directory: '",args.json_file_path,"'-Exiting"
        sys.exit(-1)
    else:
        print "ARGS: json_dir=",args.json_file_path,'[Validated]'
        print "ARGS: dbhost  =",args.dbhost
        

    
    try:
        db = MySQLdb.connect( host=args.dbhost, # your host, usually localhost
            read_default_file="~/.my.cnf_node" # you can use another ini file, for example .my.cnf_node
        )
    except:
        print "ARGS: json_dir=",args.json_file_path,'[Validated]'
        print "ARGS: dbhost  =",args.dbhost
        print myusage
        sys.exit()
    cur = db.cursor()
    
    #print db_str
    if args.NODE_DATABASE:
        NODE_DATABASE = args.NODE_DATABASE
    else:
        cur.execute("SHOW databases")
        dbs = []
        db_str = ''
        print myusage
        i = 0
        for row in cur.fetchall():
            if row[0] != 'mysql' and row[0] != 'information_schema':
                dbs.append(row[0])
                db_str += str(i)+'-'+row[0]+';  '
                print str(i)+' - '+row[0]+';  '
                i += 1
        db_no = input("\nchoose database number: ")
        if int(db_no) < len(dbs):
            NODE_DATABASE = dbs[db_no]
        else:
            sys.exit("unrecognized number -- Exiting")
        
    print
    cur.execute("USE "+NODE_DATABASE)
    
    out_file = "tax_counts--"+NODE_DATABASE+".json"
    
    print 'DATABASE:',NODE_DATABASE 
    print 'JSON DIRECTORY:',args.json_file_path 
    print
#    args.sql_db_table               = True
    #args.separate_taxcounts_files   = True
    
    if not os.path.exists(args.json_file_path):
        print "Could not find json directory: '",args.json_file_path,"'-Exiting"
        sys.exit(-1)
    
    #args.json_dir = os.path.join("../","json")
    args.files_prefix   = os.path.join(args.json_file_path,NODE_DATABASE+"--datasets")
    args.taxcounts_file = os.path.join(args.json_file_path,NODE_DATABASE+"--taxcounts.json")
    args.metadata_file  = os.path.join(args.json_file_path,NODE_DATABASE+"--metadata.json")
    #print args.files_prefix , args.taxcounts_file,args.metadata_file
    if args.check_files:
        check_files(args)
    else:
        print "This may take awhile...." 
        go(args)



