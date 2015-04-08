#!/usr/bin/env python

""" 
	hpf5.py


"""

import sys,os
import argparse
import MySQLdb
import numpy as np
import json
import h5py
from mpi4py import MPI

hostname = 'localhost'
username = 'ruby'
password = 'ruby'
NODE_DATABASE = "vamps_js_development"
#NODE_DATABASE = "vamps_js_dev_av"
out_file = ""
db = MySQLdb.connect(host=hostname, # your host, usually localhost
                     user=username, # your username
                      passwd=password, # your password
                      db=NODE_DATABASE) # name of the data base
cur = db.cursor() 
parser = argparse.ArgumentParser(description="") 



def go(args):
    """
		mpi is for multiple cores
        hdf5 needed to be compiled with Parallel enabled:: http://docs.h5py.org/en/latest/mpi.html
        mpi4py needs mpi.h :: http://www.open-mpi.org/software/ompi/v1.8/
        (set $PATH and $LD_LIBRARY_PATH)
        use pip to install mpi4py

    """

    print 'h5py'
    # for vamps our file should be a project? with separate directories
    # file = h5py.File('dset.h5','w')
    # dataset = file.create_dataset('dset', (4,6), dtype='i8')
    #
    # data = np.zeros((4,6))
    # #
    # # Assign new values
    # #
    # for i in range(4):
    #     for j in range(6):
    #         data[i][j]= i*6+j+1
    # #
    # # Write data
    # #
    # print "Writing data..."
    # dataset[...] = data
    # #
    # # Read data back and print it.
    # #
    # print "Reading data back..."
    # data_read = dataset[...]
    # print "Printing data..."
    # print data_read
    # #
    # # Close the file before exiting
    # #
    # file.close()
    #
    # sys.exit()
    print "Hello World (from process %d)" % MPI.COMM_WORLD.rank
    q = "SELECT project, dataset,project_id,dataset_id from dataset"
    q += " JOIN project using (project_id)"
    
    cur.execute(q)
    db.commit()
    datasets_by_project = {}
    
    prefix = 'h5_database'
    if not os.path.isdir(prefix):
        os.mkdir(prefix)
    for row in cur.fetchall():
        #print row[0],row[1]
        project = row[0]
        dataset = row[1]
        pid = row[2]
        did = row[3]
        
        if project in datasets_by_project:
            datasets_by_project[project].append(dataset)
        else:
            datasets_by_project[project] = [dataset]
    h5_datasets_by_project = {}
    for pj in datasets_by_project:
        datasets = datasets_by_project[pj]
        f = h5py.File(prefix+'/'+pj,'w')
        h5_datasets_by_project[f] = []
        for ds in datasets:
            grp = f.create_group(ds)
            h5_datasets_by_project[f].append(grp)
    for f in h5_datasets_by_project:
        print f.name,f.filename
        #print f.keys()
        for g in h5_datasets_by_project[f]:
            print '  ',g.name
    
    q = "SELECT UNCOMPRESS(sequence_comp) from sequence limit 1000000"
    cur.execute(q)
    db.commit()
    seqs = h5py.File(prefix+'/seqs','w')
    #seqs.create_dataset("zipped", (100000, 100000), compression="gzip")
    rows = cur.fetchall()
    arr = np.arange(100)
    r = np.array(rows)
    dset = seqs.create_dataset("seq1", data=rows)
    #for row in cur.fetchall():
       # print row[0]
        #f.create_dataset("zipped", (100, 100), compression="gzip")
#
#
#
if __name__ == '__main__':

	usage = """
		
	"""
	
 	 	
	args = parser.parse_args()
	go(args) 