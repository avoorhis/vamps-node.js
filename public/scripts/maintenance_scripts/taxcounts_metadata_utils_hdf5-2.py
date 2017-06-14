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
import numpy
import h5py
import numpy as np

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

required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_material", "latitude", "longitude", "public"];
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
    
    #counts_lookup = convert_keys_to_string(read_original_taxcounts())
    #metadata_lookup = convert_keys_to_string(read_original_metadata())
    #h5_file_path = os.path.join(args.json_file_path, NODE_DATABASE+'--hdf5.h5')
    f = h5py.File(h5_file_path, "r")

    h5_file_dids = f.keys()
    #print 'keys',h5_file_dids
    #print file_dids
    #print len(file_dids)           
    q =  "SELECT dataset_id, dataset.project_id, project from project"
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
        if did not in h5_file_dids:
            missing[project] = pid
        
        #print 'project:',row[0],' --project_id:',row[1]
    sort_p = sorted(projects.keys())
    print "FOUND in db:"
    for project in sort_p:  
        if project not in missing:
            print 'PID:',projects[project],' -> ', project
        num += 1
    print
    
    print 'MISSING from hdf5 file:'
    sort_m = sorted(missing.keys())
    for project in sort_m:
        print 'PID:',missing[project],"project:",project
    print
    
    print 'Number of Projects in db:',num
    

    
def go_add(NODE_DATABASE, pid):
    from random import randrange
    
    #dids_by_pid = {}
    dids_by_pid = get_dataset_ids(args, pid) 
    if args.all:
        mode = "w" # create or truncate if exists
    else:
        mode = "a" # read/write if exists, create otherwise
    # delete old did files if any
    #pid_path = os.path.join(args.json_file_path, NODE_DATABASE+'--projects')
    h5_taxfile_path = os.path.join(args.json_file_path, NODE_DATABASE+'--taxcounts.h5')
    h5_mdfile_path  = os.path.join(args.json_file_path, NODE_DATABASE+'--metadata.h5')
    fd_tx = h5py.File(h5_taxfile_path, mode)
    fd_md = h5py.File(h5_mdfile_path, mode)
    
    for pid in dids_by_pid:
        counts_lookup = {}
        dids = dids_by_pid[pid]
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
        
        
        # for each project
        write_taxfile(fd_tx, dids, counts_lookup)
        fd_tx.flush()
        print 'Finished writing tax(pid:',pid,')', h5_taxfile_path
        print
        metadata_lookup = go_required_metadata(did_sql)
        metadata_lookup = go_custom_metadata(dids, dids, metadata_lookup)        
        write_mdfile(fd_md,  dids, metadata_lookup)
        fd_md.flush()
        print 'Finished writing md(pid:',pid,')', h5_mdfile_path
        print
    
    fd_tx.close()
    fd_md.close()
        
def write_taxfile(f, dids, counts_lookup):  
    
    
    
    #f = h5py.File(h5_taxfile_path, "a")
    #dt1 = h5py.special_dtype(vlen=str)  # str bytes unicode
    #dt2 = h5py.special_dtype(vlen=bytes)
    #dt3 = np.dtype(str)

    #taxgrp = f.create_group("taxcounts")
    #mdgrp = f.create_group("metadata")

    for did in dids:
        #tax_ds = taxgrp.create_dataset(did, (100,))
        #md_ds = mdgrp.create_dataset(did, (100,))
        
        try:
            didgrp = f.create_group(did)
        except:
            print 'TX: Could not create group',did
            didgrp = f[did]
        subgrp = didgrp.create_group("taxcounts")
        
        for i in counts_lookup[did]:
            #print i.strip('_'), counts_lookup[did][i]
            #subgrp1.create_dataset(i.strip('_'), counts_lookup[did][i], dtype='i')
            #f[did+"/taxcounts/"+i.strip('_')] = counts_lookup[did][i]
            subgrp.attrs[i.strip('_')] = counts_lookup[did][i]

    
def write_mdfile(f, dids, metadata_lookup):  
    
    #f = h5py.File(h5_mdfile_path, "a")
    
    #dt1 = h5py.special_dtype(vlen=str)  # str bytes unicode
    #dt2 = h5py.special_dtype(vlen=bytes)
    #dt3 = np.dtype(str)

    #taxgrp = f.create_group("taxcounts")
    #mdgrp = f.create_group("metadata")

    for did in dids:
        #tax_ds = taxgrp.create_dataset(did, (100,))
        #md_ds = mdgrp.create_dataset(did, (100,))
        try:
            didgrp = f.create_group(did)
        except:
            print 'MD: Could not create group',did
            didgrp = f[did]
        subgrp = didgrp.create_group("metadata")
        
        if did in metadata_lookup:
            for mdname in metadata_lookup[did]:
                #print mdname,metadata_lookup[did][mdname]
                val = metadata_lookup[did][mdname]
                if val:
                    x = numpy.string_(val)
                    
                    subgrp.attrs.create(mdname, val)
                
           
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

    
    
def go_custom_metadata(did_list,pid_list,metadata_lookup):
    
    
    for pid in pid_list:
        custom_table = 'custom_metadata_'+ str(pid)
        q = "show tables like '"+custom_table+"'"
        cur.execute(q)
        table_exists = cur.fetchall()
        if not table_exists:
            #return metadata_lookup
            continue
    
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

    
def get_dataset_ids(args,pid):
    pjhash = {}
    if args.all:
        q = "SELECT dataset_id,project_id from dataset" 
    elif pid:
        q = "SELECT dataset_id,project_id from dataset where project_id='"+str(pid)+"'"
    else:
        print "NOT args.all and no pid Found -- Exiting"
        sys.exit()  
    #print q
    cur.execute(q)
    #dids = []
    #pids = {}
    numrows = cur.rowcount
    if numrows == 0:
        sys.exit('No data found for pid '+str(pid))
    for row in cur.fetchall():
        did = str(row[0])
        pid = str(row[1])
        if pid in pjhash:
            pjhash[pid].append(did)
        else:
            pjhash[pid] = [did]

        #dids.append(did)
        
        
    
    return pjhash
    

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
    
    parser.add_argument("-all","--all",                   
                required=False,  action="store_true",   dest = "all", default='',
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
    else:
        args.NODE_DATABASE = 'vamps_development'
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
    
    
    if not args.list and not args.pid and not args.add and not args.all:
        print usage        
        sys.exit('need command line parameter(s)')
        
    
           
    if args.add and not args.pid:
        print usage  
        print '-pid 46'      
        sys.exit('need pid to add')
    
    
         
    if args.list:
        go_list(args)
    elif args.all or (args.add and args.pid):
        go_add(NODE_DATABASE, args.pid)
    else:
        print usage 
        print "Maybe you forgot to add '-add ' to the command line?"
        

