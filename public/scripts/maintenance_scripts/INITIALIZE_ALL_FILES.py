#!/usr/bin/env python

"""
    create_counts_lookup.py


"""

import sys, os, shutil
import argparse
try:
  import pymysql as MySQLdb
except ImportError:
  import MySQLdb
except:
  raise
import json
import logging
import datetime
import time
from collections import defaultdict
# import socket

today = str(datetime.date.today())

parser = argparse.ArgumentParser(description="")

query_from = " FROM sequence_pdr_info"
# query_from += " JOIN sequence_uniq_info USING(sequence_id)"

query_core_silva119 = " FROM sequence_pdr_info JOIN silva_taxonomy_info_per_seq USING(sequence_id)"
query_core_silva119 += " JOIN silva_taxonomy USING(silva_taxonomy_id)"

query_core_rdp26 = query_from+" JOIN rdp_taxonomy_info_per_seq USING(sequence_id)"
query_core_rdp26 += " JOIN rdp_taxonomy USING(rdp_taxonomy_id)"


domain_query = "SELECT sum(seq_count), dataset_id, domain_id"
domain_query += "%s GROUP BY dataset_id, domain_id"

phylum_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id"
phylum_query += "%s GROUP BY dataset_id, domain_id, phylum_id"

class_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id"
class_query += "%s GROUP BY dataset_id, domain_id, phylum_id, klass_id"

order_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id"
order_query += "%s GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id"

family_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"
family_query += "%s GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"

genus_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id"
genus_query += "%s GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id"

species_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id"
species_query += "%s GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id"

strain_query = "SELECT sum(seq_count), dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id"
strain_query += "%s GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id"

end_group_query = " ORDER BY NULL"

dataset_query = "SELECT dataset_id from dataset"

req_pquery = "SELECT dataset_id, %s from required_metadata_info"

cust_pquery = "SELECT project_id, field_name from custom_metadata_fields"

ranks = ['domain', 'phylum', 'klass', 'order', 'family', 'genus', 'species', 'strain']
queries = [{"rank": "domain", "query": domain_query}, 
           {"rank": "phylum", "query": phylum_query}, 
           {"rank": "klass", "query": class_query}, 
           {"rank": "order", "query": order_query}, 
           {"rank": "family", "query": family_query}, 
           {"rank": "genus", "query": genus_query}, 
           {"rank": "species", "query": species_query}, 
           {"rank": "strain", "query": strain_query}
           ]

LOG_FILENAME = os.path.join('.', 'initialize_silva_files.log')
logging.basicConfig(level=logging.DEBUG, filename=LOG_FILENAME, filemode="a+", 
                           format="%(asctime)-15s %(levelname)-8s %(message)s")


def get_required_metadata_fields():
    q = "SHOW fields from required_metadata_info"
    cur.execute(q)
    md_fields = []
    fields_not_wanted = ['required_metadata_id', 'dataset_id', 'created_at', 'updated_at']    
    for row in cur.fetchall():
        if row[0] not in fields_not_wanted:
            md_fields.append(row[0])
    return md_fields


def check_files(args):
    cur.execute(dataset_query)
    db_dids = []
    for row in cur.fetchall():
        db_dids.append(str(row[0]))
    #print db_dids
    did_count = len(db_dids)

    ###### INDIVIDUAL JSON FILES ##################
    print("\nChecking for files in:\n", args.files_prefix)
    file_dids = []
    for f in os.listdir(args.files_prefix):
        filename, file_extension = os.path.splitext(f)
        file_dids.append(filename)

    missing, okay_count = ok_cnt(db_dids, file_dids)
    print_results(okay_count, did_count, missing, os.path.basename(args.files_prefix))

    ######### TAXCOUNTS ###########################
    if args.units == 'silva119':
        print("\nChecking Group File:\n", args.taxcounts_file_original)
        with open(args.taxcounts_file_original) as tax_file:
            tdata = json.load(tax_file)

        missing, okay_count = ok_cnt(db_dids, tdata)
        print_results(okay_count, did_count, missing, os.path.basename(args.taxcounts_file_original))

    ########## METADATA ##########################
    print("\nChecking Metadata File:\n", args.metadata_file_original)
    with open(args.metadata_file_original) as md_file:
        mdata = json.load(md_file)

    missing, okay_count = ok_cnt(db_dids, mdata)
    print_results(okay_count, did_count, missing, os.path.basename(args.metadata_file_original))

def print_results(okay_count, did_count, missing, f_name):
    if okay_count == did_count:
        print 'OK -- No missing files for %s' % f_name
    else:
        print 'Missing from %s' % f_name
        print("('" + "', '".join(missing) + "')")
    print('DID presence is REQUIRED')


def ok_cnt(dids, data):
    okay_count = 0
    missing = []
    for did in dids:
        if did in data:
            #print 'found', did
            okay_count += 1
        else:
            missing.append(did)

    return (missing, okay_count)

def get_counts_per_tax():
    counts_per_tax_dict = {}
    for q in queries:
        #print q["query"]
        # dirs = []
        if args.units == 'rdp2.6':
            query = q["query"] % query_core_rdp26 + end_group_query
        else:
            query = q["query"] % query_core_silva119 + end_group_query
        try:
            # print()
            # print ("running mysql query for:", q['rank'])
            logging.debug("running mysql query for: "+q['rank'])

            # print(query)
            # start4 = time.time()
            cur.execute(query)
            # cur._rows <type 'tuple'>: ((Decimal('107'), 20276L, 1L), (Decimal('43'), 20276L, 2L), ...
            # elapsed4 = (time.time() - start4)
            # print "4 cur.execute(query) time: %s" % elapsed4

            # start41 = time.time()
            rank = q['rank']
            counts_per_tax_dict[rank] = cur._rows
            # elapsed41 = (time.time() - start4)
            # print "41 counts_per_tax_dict[rank] = cur._rows time: %s" % elapsed41
        except:
            # print("Trying to query with:", query)
            logging.debug("Failing to query with: "+query)
            sys.exit("This Database Doesn't Look Right -- Exiting")
    return counts_per_tax_dict


def make_counts_lookup(counts_per_tax_dict):
    # TODO: clean up
    counts_lookup = defaultdict(dict)
    for rank, res in counts_per_tax_dict.items():
        for row in res:
            count = int(row[0])
            ds_id = row[1]
            tax_id_str = ''
            # for k in range(2, len(row)): #Andy, why do we need '_1' etc for tax ids?
            #     tax_id_str += '_' + str(row[k])
            #print 'tax_id_str', tax_id_str

            tax_id_str = '_' + "_".join([str(k) for k in row[2:]])

            # if ds_id in counts_lookup:
            if tax_id_str in counts_lookup[ds_id]: #? Andy
                    sys.exit('We should not be here - Exiting')
                # else:
                #     counts_lookup[ds_id][tax_id_str] = count
            # else:
                # counts_lookup[ds_id] = {}
            counts_lookup[ds_id][tax_id_str] = count

    return counts_lookup


def go(args):
    """
        count_lookup_per_dsid[dsid][tax_id_str] = count

    """
    if os.path.exists(args.files_prefix):
        start2 = time.time()
        shutil.rmtree(args.files_prefix)
        elapsed2 = (time.time() - start2)
        print "2 shutil.rmtree(args.files_prefix) time: %s" % elapsed2
    
    start0 = time.time()
    os.makedirs(args.files_prefix)
    elapsed0 = (time.time() - start0)
    print "0 os.makedirs(args.files_prefix) time: %s" % elapsed0
    #os.mkdir(args.files_prefix)
    logging.debug('Created Dir: '+args.files_prefix)

    start31 = time.time()
    counts_per_tax_dict = get_counts_per_tax()
    elapsed31 = (time.time() - start31)
    print "31 get_counts_per_tax() time: %s" % elapsed31

    start5 = time.time()
    counts_lookup = make_counts_lookup(counts_per_tax_dict)
    elapsed5 = (time.time() - start5)
    print "5 make_counts_lookup() time: %s" % elapsed5

    print('gathering metadata from tables')
    logging.debug('gathering metadata from tables')
    start8 = time.time()
    metadata_lookup = go_metadata()
    elapsed8 = (time.time() - start8)
    print "8 metadata_lookup = go_metadata() time: %s" % elapsed8

    print('writing to individual files')
    logging.debug('writing to individual files')
    start9 = time.time()
    write_data_to_files(args, metadata_lookup, counts_lookup)
    elapsed9 = (time.time() - start9)
    print "9 metadata_lookup = go_metadata() time: %s" % elapsed9

    if args.units == 'silva119':
        # print('writing metadata file')
        logging.debug('writing metadata file')
        start10 = time.time()
        write_all_metadata_file(args, metadata_lookup)
        elapsed10 = (time.time() - start10)
        print "10 write_all_metadata_file(args, metadata_lookup) time: %s" % elapsed10

        print('writing taxcount file')
        logging.debug('writing taxcount file')
        start11 = time.time()
        write_all_taxcounts_file(args, counts_lookup)
        elapsed11 = (time.time() - start11)
        print "11 write_all_taxcounts_file(args, counts_lookup) time: %s" % elapsed11


def write_data_to_files(args, metadata_lookup, counts_lookup):

    #print counts_lookup
    for did in counts_lookup:
        cur_file = os.path.join(args.files_prefix, str(did)+'.json')
        f = open(cur_file, 'w')

        my_counts_str = json.dumps(counts_lookup[did])
        if did in metadata_lookup:
            my_metadata_str = json.dumps(metadata_lookup[did], encoding='latin1')
        else:
            warnings.append('WARNING -- no metadata for dataset: '+str(did))
            my_metadata_str = json.dumps({})
        #f.write('{"'+str(did)+'":'+mystr+"}\n")
        f.write('{"taxcounts":'+my_counts_str+', "metadata":'+my_metadata_str+'}'+"\n")
        f.close()


def write_all_metadata_file(args, metadata_lookup):

    #print md_file
    json_str = json.dumps(metadata_lookup, encoding='latin1')
    #print(json_str)
    f = open(args.metadata_file_new, 'w')   # overwrite
    f.write(json_str+"\n")
    f.close()


def write_all_taxcounts_file(args, counts_lookup):

    #print tc_file
    json_str = json.dumps(counts_lookup)
    #print(json_str)
    f = open(args.taxcounts_file_new, 'w')  # overwrite
    f.write(json_str+"\n")
    f.close()


def check_if_tbl_exists(table):
    q = "SELECT * FROM information_schema.tables WHERE table_schema = '%s' AND table_name = '%s' LIMIT 1;" % (
    args.NODE_DATABASE, table)
    # print(q)
    return cur.execute(q)



def go_metadata():
    """
        metadata_lookup_per_dsid[dsid][metadataName] = value

    """

    logging.debug("running mysql for required metadata")
    print("req_pquery")

    logging.debug("running mysql for required metadata")
    req_metadata_fields = args.req_metadata_fields
    req_pquery_full = req_pquery % (', '.join(args.req_metadata_fields))
    # print(req_pquery_full)
    cur.execute(req_pquery_full)
    # query_res = cur.fetchall()
    metadata_lookup = defaultdict(dict)
    # metadata_lookup = make_req_metadata_per_did_dict(query_res, metadata_lookup)

    cur_dict.execute(req_pquery_full)
    data1 = cur_dict.fetchall()
    metadata_lookup = make_metadata_per_did_dict(data1, req_metadata_fields, metadata_lookup)

    print('running mysql for custom metadata', cust_pquery)
    logging.debug('running mysql for custom metadata: '+cust_pquery)
    cur.execute(cust_pquery)
    query_res = cur.fetchall()

    pid_collection = make_fields_per_pid_dict(query_res)

    for pid in pid_collection:
        table = 'custom_metadata_' + pid
        tbl_exists = check_if_tbl_exists(table)
        fields = ['dataset_id'] + pid_collection[pid]

        if tbl_exists:
            cust_dquery = "SELECT `" + '`, `'.join(fields) + "` from " + table
            # print('running other cust', cust_dquery)
            logging.debug('running other cust: ' + cust_dquery)
            cur_dict.execute(cust_dquery)
            data = cur_dict.fetchall()
            metadata_lookup = make_metadata_per_did_dict(data, fields[1:], metadata_lookup, metadata_type = "CUSTOM")
        else:
            print('No "'+table+'" table found')
    db.commit()
    return metadata_lookup

def make_metadata_per_did_dict(query_res, fields, metadata_lookup, metadata_type = "REQUIRED"):
    for row in query_res:
        did = row['dataset_id']

        for field in fields:
            value = row[field]
            metadata_lookup[did][field] = str(value)
            if value == '':
                warnings.append('WARNING -- dataset ' + str(did) + ' is missing value for metadata ' + metadata_type + ' field "' + field + '"')
    return metadata_lookup

def make_fields_per_pid_dict(db_res):
    pid_collection = defaultdict(dict)

    for row in db_res:

        pid = str(row[0])
        field = row[1]
        pid_collection[pid] = [field]

    return pid_collection

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
        The above is true unless you use the -o/--overwrite flag
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
        -o/--overwrite      [default: false]  If set will delete first then overwrite current files (not good on a live server)
        -units/--units      [silva119, rdp2.6]  default: silva119
        -c/--check_files    [default: false] Will look for continuity between database(dataset table) and JSON files (no initialization)

    """
    parser = argparse.ArgumentParser(description="", usage=myusage)
    parser.add_argument("-json_file_path", "--json_file_path", 
        required = False, action = 'store', dest = "json_file_path", default = '', 
        help = "Path where JSON files are located")
    parser.add_argument("-host", "--host", 
        required = False, action = 'store', choices = ['vampsdb', 'vampsdev', 'localhost'], dest = "dbhost", default = 'localhost', 
        help = "ONLY: 'vampsdb', 'vampsdev', 'localhost'")
    parser.add_argument("-db", "--db", 
        required = False, action = 'store', dest = "NODE_DATABASE", default = '', 
        help = "NODE_DATABASE")
    parser.add_argument("-units", "--units", 
        required = False, action = 'store', choices = ['silva119', 'rdp2.6'], dest = "units", default = 'silva119', 
        help = "UNITS")
    parser.add_argument("-o", "--overwrite", 
        required = False, action = 'store_true', dest = "overwrite", default = False, 
        help = "If set will delete and overwrite current files (not good on a live server)")
    parser.add_argument("-c", "--check_files", 
        required = False, action = 'store_true', dest = "check_files", default = False, 
        help = "If set will look for continuity between database(dataset table) and JSON files")

    if len(sys.argv[1:]) == 0:
        print(myusage)
        sys.exit()
    args = parser.parse_args()

    print()
    warnings = []
    if args.dbhost == 'vampsdev':
        args.json_file_path = os.path.join('/', 'groups', 'vampsweb', 'vampsdev_node_data', 'json')
        args.NODE_DATABASE = 'vamps2'
    elif args.dbhost == 'vampsdb' or args.dbhost == 'vamps':
        args.json_file_path = os.path.join('/', 'groups', 'vampsweb', 'vamps_node_data', 'json')
        args.NODE_DATABASE = 'vamps2'
    if not args.json_file_path:
        #args.json_file_path = os.path.join(os.path.realpath(__file__), '../', '../', 'json'
        args.json_file_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../', '../', 'json')

    if not os.path.exists(args.json_file_path):
        print("Could not find json directory: '", args.json_file_path, "'-Exiting")
        sys.exit(-1)
    else:
        print("ARGS: json_dir=", args.json_file_path, '[Validated]')
        print("ARGS: dbhost  =", args.dbhost)

    from os.path import expanduser
    home = expanduser("~")
    if not os.path.exists(os.path.join(home, ".my.cnf_node")):
        print("Install a mysql .my.cnf file in this location: ", "~/.my.cnf_node")
        sys.exit()
    try:
        db = MySQLdb.connect(host=args.dbhost, # your host, usually localhost
            read_default_file="~/.my.cnf_node"  # you can use another ini file, for example .my.cnf_node
        )
    except:
        print("ARGS: json_dir=", args.json_file_path, '[Validated]')
        print(myusage)
        print("ARGS: dbhost  =", args.dbhost)
        print('Could not connect to mysql database')
        sys.exit()
    cur = db.cursor()
    cur_dict = db.cursor(MySQLdb.cursors.DictCursor)

    #print db_str
    if args.NODE_DATABASE:
        NODE_DATABASE = args.NODE_DATABASE
    else:
        cur.execute("SHOW databases")
        dbs = []
        db_str = ''
        print(myusage)
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

    print()
    cur.execute("USE "+args.NODE_DATABASE)

    #out_file = "tax_counts--"+NODE_DATABASE+".json"

    print('DATABASE:', args.NODE_DATABASE)
    print('JSON DIRECTORY:', args.json_file_path)
    print()
#    args.sql_db_table               = True
    #args.separate_taxcounts_files   = True

    if not os.path.exists(args.json_file_path):
        print "Could not find json directory: '", args.json_file_path, "'-Exiting"
        sys.exit(-1)

    #args.json_dir = os.path.join("../", "json")
    #permissible_units = ['silva119', 'rdp']
    args.req_metadata_fields = get_required_metadata_fields()
    if args.overwrite or args.check_files:
        if args.units == 'rdp2.6':
            args.files_prefix   = os.path.join(args.json_file_path, args.NODE_DATABASE+"--datasets_rdp2.6")
            args.taxcounts_file_original = ''
        else:
            args.files_prefix   = os.path.join(args.json_file_path, args.NODE_DATABASE+"--datasets_silva119")
            args.taxcounts_file_original = os.path.join(args.json_file_path, args.NODE_DATABASE+"--taxcounts_silva119.json")
        args.metadata_file_original  = os.path.join(args.json_file_path, args.NODE_DATABASE+"--metadata.json")
    else:
        if args.units == 'rdp2.6':
            args.files_prefix   = os.path.join(args.json_file_path, args.NODE_DATABASE+"--datasets_rdp2.6NEW")
            args.taxcounts_file_new = ''
        else:
            args.files_prefix   = os.path.join(args.json_file_path, args.NODE_DATABASE+"--datasets_silva119NEW")
            args.taxcounts_file_new = os.path.join(args.json_file_path, args.NODE_DATABASE+"--taxcounts_silva119NEW.json")
        args.metadata_file_new  = os.path.join(args.json_file_path, args.NODE_DATABASE+"--metadataNEW.json")
    #print args.files_prefix , args.taxcounts_file, args.metadata_file
    if args.check_files:
        check_files(args)
    else:
        print("This may take awhile.... Best to be running in a 'screen' session.")
        start6 = time.time()
        go(args)
        elapsed6 = (time.time() - start6)
        print "go(args) time: %s" % elapsed6
        for w in warnings:
            print(w)
            logging.debug(w)
        print("DONE ** Remember to copy over the transfer files in "+args.json_file_path+" **")
        print()
        logging.debug("DONE")
