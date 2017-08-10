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

"""


parser = argparse.ArgumentParser(description="") 


def convert_keys_to_string(dictionary):
    """Recursively converts dictionary keys to strings."""
    if not isinstance(dictionary, dict):
        return dictionary
    return dict((str(k), convert_keys_to_string(v)) 
        for k, v in dictionary.items())
        
def go_list(args):
    
    #
    file_dids = []
 
    metadata_lookup = convert_keys_to_string(read_original_metadata())
    (projects_by_did, project_id_lookup, project_lookup) = get_project_lookup(args)
    #print(project_lookup)
    required_metadata_fields = get_required_metadata_fields(args)
    #print('file_dids')
    #print(metadata_lookup['3938'])
    
    #metadata_dids = metadata_lookup.keys()
    #
    #print file_dids
    #print len(file_dids)           
    #q =  "SELECT dataset_id,dataset.project_id,project from project"
    #q += " JOIN dataset using(project_id) order by project"
    failed_projects = []
    no_req_data_found = 0
    no_file_found = {}
    mismatch_data = {}
    other_problem = {}
    no_req_metadata = {}
    for pid in project_id_lookup:
        # go project by project
        sql_dids =  "','".join(project_id_lookup[pid])
        q = "SELECT dataset_id, "+ ', '.join(required_metadata_fields) +" from required_metadata_info WHERE dataset_id in ('%s')" % (sql_dids)
        if args.verbose:
            print q
        clean_project = True
        num = 0
        cur.execute(q)
        numrows = cur.rowcount
        if numrows == 0:
            no_req_data_found += 1
            #print(str(no_req_data_found)+') No Required metadata for project: '+str(project_lookup[pid])+' ('+str(pid)+')')
            if pid not in no_req_metadata:
                    no_req_metadata[pid] = project_lookup[pid]
            continue
        
        for row in cur.fetchall():
            did = str(row[0])
            #print 'did',did
            #if did == '3938':
            if did not in metadata_lookup:                
                if pid not in no_file_found:
                    no_file_found[pid] = project_lookup[pid]
                clean_project = False
            else:
                for i,item in enumerate(required_metadata_fields):
                    #print item, row[i+1]
                    if item in metadata_lookup[did]:
                        db_val = str(row[i+1])
                        if str(metadata_lookup[did][item]) != db_val :
                            if args.verbose:
                                print project_lookup[pid]+' -- ' +did+'  no match for', item+':',metadata_lookup[did][item],' - ',db_val
                            if pid not in mismatch_data:
                                mismatch_data[pid] = project_lookup[pid]
                            clean_project = False
                    else:
                         print( project_lookup[pid]+' -- ' +did+' -- '+item+'item not found in metadata file')                         
                         if pid not in other_problem:
                            other_problem[pid] = project_lookup[pid]
                         clean_project = False
        #if not clean_project:
        #      failed_projects.append('pid:'+str(pid)+' -- '+project_lookup[pid])
    print
    
    print 'failed projects that need to have the metadata files rebuilt:'
    print
    print 'OTHER (rare):'
    for pid in other_problem:
        print  'pid:',pid,' -- ',other_problem[pid]
    print  ('PID List:',','.join([str(n) for n in other_problem.keys()]))
    print
    print 'DATA MIS-MATCHES BETWEEN FILE AND DBASE:'
    for pid in mismatch_data:
        print  'pid:',pid,' -- ',mismatch_data[pid]
    print ('PID List:',','.join([str(n) for n in mismatch_data.keys()]))
    print
    print 'NO FILE FOUND:'
    for pid in no_file_found:
        print  'pid:',pid,' -- ',no_file_found[pid]
    print  ('PID List:',','.join([str(n) for n in no_file_found.keys()]))
    print    
    print 'NO REQUIRED METADATA (re-install project or add by hand?):'
    for pid in no_req_metadata:
        print  'pid:',pid,' -- ',no_req_metadata[pid]
    print  ('PID List:',','.join([str(n) for n in no_req_metadata.keys()]))
    print
    
    
    print "Number of files that need rebuilding",len(other_problem)+len(mismatch_data)+len(no_file_found)

     
def read_original_metadata():    
    file_path = os.path.join(args.json_file_path,NODE_DATABASE+'--metadata.json')
    try:
        with open(file_path) as data_file:    
            data = json.load(data_file)
    except:
        print "could not read json file",file_path,'-Exiting'
        sys.exit(1)
    return data 

    
def get_required_metadata_fields(args):
    q =  "SHOW fields from required_metadata_info"   
    cur.execute(q)
    md_fields = []
    fields_not_wanted = ['required_metadata_id','dataset_id','created_at','updated_at']    
    for row in cur.fetchall():
        if row[0] not in fields_not_wanted:
            md_fields.append(row[0])
    return md_fields
    
def get_project_lookup(args):
    q =  "SELECT dataset_id,dataset.project_id,project from project"
    q += " JOIN dataset using(project_id) order by project"
    
    num = 0
    cur.execute(q)
    #print 'List of projects in: '+in_file
    projects_by_did = {}
    project_id_lookup = {}
    project_lookup = {}
    
    for row in cur.fetchall():
        did = row[0]
        pid = row[1]
        pj  = row[2]
        project_lookup[pid]  =pj
        projects_by_did[did] = pj
        if pid in project_id_lookup:
            project_id_lookup[pid].append(str(did))            
        else:
            project_id_lookup[pid] = [str(did)]
    
    return (projects_by_did, project_id_lookup, project_lookup)
#
#
#
if __name__ == '__main__':

    myusage = """
        
        -host/--host        vampsdb, vampsdev    dbhost:  [Default: localhost]
        

    """
   
    parser.add_argument("-json_file_path", "--json_file_path",        
                required=False,  action='store', dest = "json_file_path",  default='../../json', 
                help="Not usually needed if -host is accurate")
                # for vampsdev"  /groups/vampsweb/vampsdev_node_data/json
    parser.add_argument("-host", "--host",    
                required=False,  action='store', dest = "dbhost",  default='localhost',
                help="choices=['vampsdb','vampsdev','localhost']") 
    parser.add_argument("-v", "--verbose",    
                required=False,  action='store_true',  dest = "verbose",  default=False,
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
    else:
        dbhost = 'localhost'
        args.NODE_DATABASE = 'vamps_development'
    args.units = 'silva119'
    if args.units == 'silva119':
        args.files_prefix   = os.path.join(args.json_file_path, args.NODE_DATABASE+"--datasets_silva119")
    elif args.units == 'rdp2.6':
         args.files_prefix   = os.path.join(args.json_file_path, args.NODE_DATABASE+"--datasets_rdp2.6")
    else:
        sys.exit('UNITS ERROR: '+args.units)
    
    if os.path.exists(args.json_file_path):
        print 'Validated: json file path'
    else:
        print usage
        print "Could not find json directory: '",args.json_file_path,"'-Exiting"
        sys.exit(-1)
    print "\nARGS: dbhost  =",dbhost
    print "ARGS: json_dir=",args.json_file_path 
      
    
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
       
         
    
    go_list(args)
    
