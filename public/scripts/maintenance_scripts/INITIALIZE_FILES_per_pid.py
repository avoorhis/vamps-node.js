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

query_from = " FROM sequence_pdr_info"
query_from += " JOIN sequence_uniq_info USING(sequence_id)"

query_core_silva119 = query_from+" JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id)"
query_core_silva119 += " JOIN silva_taxonomy USING(silva_taxonomy_id)"
#query_core_silva119 += " WHERE dataset_id in ('%s')"

query_core_rdp26 = query_from+" JOIN rdp_taxonomy_info_per_seq USING(rdp_taxonomy_info_per_seq_id)"
query_core_rdp26 += " JOIN rdp_taxonomy USING(rdp_taxonomy_id)"
#query_core_rdp26 += " WHERE dataset_id in ('%s')"

domain_query = "SELECT sum(seq_count), dataset_id, domain_id"
#domain_query += query_core
domain_query += " %s WHERE dataset_id in ('%s') GROUP BY dataset_id, domain_id"

phylum_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id"
#phylum_query += query_core
phylum_query += " %s WHERE dataset_id in ('%s') GROUP BY dataset_id, domain_id, phylum_id"

class_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id"
#class_query += query_core
class_query += " %s WHERE dataset_id in ('%s') GROUP BY dataset_id, domain_id, phylum_id, klass_id"

order_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id"
#order_query += query_core
order_query += " %s WHERE dataset_id in ('%s') GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id"

family_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"
#family_query += query_core
family_query += " %s WHERE dataset_id in ('%s') GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"

genus_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id"
#genus_query += query_core
genus_query += " %s WHERE dataset_id in ('%s') GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id"

species_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id"
#species_query += query_core
species_query += " %s WHERE dataset_id in ('%s') GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id"

strain_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id"
#strain_query += query_core
strain_query += " %s WHERE dataset_id in ('%s') GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id"
dataset_query = "SELECT dataset_id from dataset"

# these SHOULD be the same headers as in the NODE_DATABASE table: required_metadata_info (order doesn't matter)
# required_metadata_fields = ["altitude", "assigned_from_geo", "collection_date", "common_name", "country", "depth", "description", "dna_region", "domain", "elevation", "env_package", "fragment_name", "latitude", "longitude", "public", "sequencing_platform", "taxon_id"];
# req_pquery = "SELECT dataset_id, " + ', '.join(required_metadata_fields) + """
# , env_biome.term_name AS env_biome, env_feature.term_name AS env_feature, env_matter.term_name AS env_matter
# from required_metadata_info
#                 JOIN fragment_name USING(fragment_name_id)
#                 JOIN dna_region USING(dna_region_id)
#                 JOIN sequencing_platform USING(sequencing_platform_id)
#                 JOIN domain USING(domain_id)
#                 JOIN term AS env_biome ON(env_biome_id = env_biome.term_id)
#                 JOIN term AS env_feature ON(env_feature_id = env_feature.term_id)
#                 JOIN term AS env_matter ON(env_matter_id = env_matter.term_id)
#                 JOIN country USING(country_id)
#                 JOIN env_package USING(env_package_id)

# """
# required_metadata_fields = ["altitude", "assigned_from_geo", "collection_date", "common_name", "country_id", "depth", "description", "dna_region_id", 
#                         "domain_id", "elevation", "env_sample_source_id", "fragment_name_id", "latitude", "longitude", "sequencing_platform_id", 
#                         "taxon_id", "env_biome_id", "env_feature_id", "env_matter_id"];

req_pquery = "SELECT dataset_id, %s from required_metadata_info JOIN env_package USING(env_package_id)"
req_pquery += " WHERE dataset_id in ('%s')"
#required_metadata_fields.extend(["env_biome", "env_feature", "env_matter"])

cust_pquery = "SELECT project_id,field_name from custom_metadata_fields"
cust_pquery += " WHERE project_id='%s'"

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

LOG_FILENAME = os.path.join('.','initialize_silva_files.log')
logging.basicConfig(level=logging.DEBUG, filename=LOG_FILENAME, filemode="a+",
                           format="%(asctime)-15s %(levelname)-8s %(message)s")

def get_required_metadata_fields(args):
    q = " SELECT `COLUMN_NAME` "
    q += " FROM `INFORMATION_SCHEMA`.`COLUMNS`"
    q += " WHERE `TABLE_SCHEMA`='%s'"
    q += " AND `TABLE_NAME`='required_metadata_info';"
    q = q % (args.NODE_DATABASE)
    cur.execute(q)
    rows = cur.fetchall()
    required_metadata_fields = []
    
    for row in rows:
        if row[0] != 'required_metadata_id' and row[0] != 'dataset_id':
            required_metadata_fields.append(row[0])
    
    return required_metadata_fields



def go(args):
    """
        count_lookup_per_dsid[dsid][tax_id_str] = count

    """
    counts_lookup = {}

    # try:

    #     #shutil.rmtree(args.files_prefix)
    #     shutil.move(args.files_prefix, os.path.join(args.json_file_path, args.NODE_DATABASE+'--datasets_'+args.units+today))
    #     if args.taxcounts_file:
    #         shutil.move(args.taxcounts_file, os.path.join(args.json_file_path, args.NODE_DATABASE+'--taxcounts_silva119'+today+'.json'))
    #     shutil.move(args.metadata_file,  os.path.join(args.json_file_path, args.NODE_DATABASE+'--metadata'+ today+'.json'))
    #     logging.debug('Backed up old taxcounts and metadata files')
    
    # except IOError:
    #     print "Could not back up one of files directory, taxcounts or metadata files: "
    # except:        
    #     raise
    #     # sys.exit()
    if os.path.exists(args.files_prefix):
        shutil.rmtree(args.files_prefix)
    os.makedirs(args.files_prefix)  
    sql_dids =   "','".join(args.did_list)
    #os.mkdir(args.files_prefix)
    logging.debug('Created Dir: '+args.files_prefix)
    for q in queries:
        #print q["query"]
        dirs = []
        
        if args.units == 'rdp2.6':
            query = q["query"] % (query_core_rdp26, sql_dids)
        else:
            query = q["query"] % (query_core_silva119, sql_dids)
        try:
            print
            print "running mysql query for:",q['rank']
            logging.debug("running mysql query for: "+q['rank'])

            print query
            cur.execute(query)
        except:
            print "Trying to query with:",query
            logging.debug("Failing to query with: "+query)
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

    if args.units == 'silva119':
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
    with open(args.metadata_file_original) as mdata_file:    
        mdata = json.load(mdata_file)
    for did in metadata_lookup:
        mdata[did] = metadata_lookup[did]
    with open(args.metadata_file_new, 'w') as outfile:
            json.dump(mdata, outfile)    
        

def write_all_taxcounts_file(args, counts_lookup):
    
    with open(args.taxcounts_file_original) as tdata_file:    
        tdata = json.load(tdata_file)
    for did in counts_lookup:
        tdata[did] = counts_lookup[did]
    with open(args.taxcounts_file_new, 'w') as outfile:
            json.dump(tdata, outfile)   
    #print tc_file
    

def go_metadata():
    """
        metadata_lookup_per_dsid[dsid][metadataName] = value

    """

    metadata_lookup = {}

    logging.debug("running mysql for required metadata")
    print "req_pquery"
    
    logging.debug("running mysql for required metadata")
    req_pquery_full = req_pquery % (','.join(args.req_metadata_fields), "','".join(args.did_list))
    print req_pquery_full
    cur.execute(req_pquery_full)
    for row in cur.fetchall():
        did = row[0]
        for i,name in enumerate(args.req_metadata_fields):
            print "enumerate(required_metadata_fields): SSS"
            print i,did,name,row[i+1]

           

            value = row[i+1]
            if value == '':
                warnings.append('WARNING -- dataset '+str(did)+' is missing a value for REQUIRED field "'+name+'"')

            if did in metadata_lookup:
                    metadata_lookup[did][name] = str(value)
            else:
                metadata_lookup[did] = {}
                metadata_lookup[did][name] = str(value)


    print 'metadata_lookup'
    print metadata_lookup
    pid_collection = {}
    cust_pquery2 = cust_pquery % (args.pid)
    print 'running mysql for custom metadata',cust_pquery2
    logging.debug('running mysql for custom metadata: '+cust_pquery2)
    
    cur.execute(cust_pquery2)
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

def get_did_list(args):
    q = "SELECT dataset_id from dataset where project_id='%s'" % (args.pid)
    print q
    cur.execute(q)
    rows = cur.fetchall()
    dids = []
    for row in rows:
        dids.append(str(row[0]))
    return dids
#
#
#
if __name__ == '__main__':

    myusage = """
        ./INITIALIZE_ALL_FILES.py  (


        Will ask you to input which database.
        Output will be files ../json/NODE_DATABASE/<dataset>.json
        each containing taxcounts and metadata from the database

        **THIS SCRIPT WILL RE-CREATE ALL THE FILES UNDER A NEW FILENAME** for the chosen database.
        **THEN YOU MUST MANUALLY MOVE THEM TO THE CORRECT LOCATION**
        
        It will create a /public/json/<NODE_DATABASE>--datasets/<datasetid>.json file for each dataset.
          These files have taxonomic counts and metadata for that dataset for
          use when selecting datsets for visualization.
        Also the script will create 2 other files:
          /public/json/<NODE_DATABASE>--taxcounts_silva119.json
          or /public/json/<NODE_DATABASE>--taxcounts_rdp26.json
          /public/json/<NODE_DATABASE>--metadata.json
          These files contain ALL the taxcounts and metadata for use
          in searches

        -json_file_path/--json_file_path   json files path Default: ../json [usually calculated from -host]
        -host/--host        vampsdb, vampsdev or localhost     Default: localhost
        -units/--units      [silva119, rdp2.6]  default: silva119
        
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
    parser.add_argument("-units", "--units",
                required=False,  action='store', choices=['silva119', 'rdp2.6'], dest = "units",  default='silva119',
                help="UNITS")
    parser.add_argument("-pid", "--pid",
                required=True,  action='store', dest = "pid",  default=False,
                help="PID of project to update")
    if len(sys.argv[1:])==0:
        print myusage
        sys.exit() 
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
            args.NODE_DATABASE = dbs[db_no]
        else:
            sys.exit("unrecognized number -- Exiting")

    print
    cur.execute("USE "+args.NODE_DATABASE)

    #out_file = "tax_counts--"+NODE_DATABASE+".json"

    print 'DATABASE:',args.NODE_DATABASE
    print 'JSON DIRECTORY:',args.json_file_path
    print
#    args.sql_db_table               = True
    #args.separate_taxcounts_files   = True

    if not os.path.exists(args.json_file_path):
        print "Could not find json directory: '",args.json_file_path,"'-Exiting"
        sys.exit(-1)

    #args.json_dir = os.path.join("../","json")
    #permissible_units = ['silva119','rdp']
    args.did_list = get_did_list(args)
    
    args.req_metadata_fields = get_required_metadata_fields(args)
    
    if args.units == 'rdp2.6':
        args.files_prefix   = os.path.join(args.json_file_path,args.NODE_DATABASE+"--datasets_rdp2.6NEW")
        args.taxcounts_file_original = ''
    else:
        args.files_prefix   = os.path.join(args.json_file_path,args.NODE_DATABASE+"--datasets_silva119NEW")
        args.taxcounts_file_original = os.path.join(args.json_file_path,args.NODE_DATABASE+"--taxcounts_silva119.json")
        args.taxcounts_file_new = os.path.join(args.json_file_path,args.NODE_DATABASE+"--taxcounts_silva119NEW.json")
    args.metadata_file_original  = os.path.join(args.json_file_path,args.NODE_DATABASE+"--metadata.json")
    args.metadata_file_new  = os.path.join(args.json_file_path,args.NODE_DATABASE+"--metadataNEW.json")
    
    
    print "This may take awhile.... Best to be running in a 'screen' session."
    go(args)

