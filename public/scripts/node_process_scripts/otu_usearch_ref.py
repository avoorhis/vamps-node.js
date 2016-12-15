#!/usr/bin/env python

##!/usr/local/www/vamps/software/python/bin/python

##!/usr/bin/env python
# -*- coding: utf-8 -*-

# Copyright (C) 2011, Marine Biological Laboratory
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free
# Software Foundation; either version 2 of the License, or (at your option)
# any later version.
#
# Please read the COPYING file.
#

import os
from stat import * # ST_SIZE etc
import sys
import shutil
import types
import time
#import csv
#import json
from time import sleep
#import MySQLdb
#import ConMySQL
import datetime
import subprocess
import copy
import operator
import fileinput
# from pipeline.utils import *
# from pipeline.sample import Sample
# from pipeline.runconfig import RunConfig
# from pipeline.run import Run
# from pipeline.trim_run import TrimRun
# from pipeline.chimera import Chimera
# from pipeline.gast import Gast
# from pipeline.vamps import Vamps
# from pipeline.fasta_mbl_pipeline import MBLPipelineFastaUtils

today = datetime.date.today()
nonhit = 'No_Hit'
ranks = ('superkingdom','phylum', 'class', 'orderx', 'family', 'genus', 'species', 'strain')

def run(args):
    global nonhit
    uniquefile      = args.uniquefile
    namesfile       = args.namesfile

    main_dir        = os.path.join(args.main_dir,args.prefix)

    clusters_file   = os.path.join(main_dir,"clusters.txt")
    clusters_file2   = os.path.join(main_dir,"clusters2.txt")
    matrix_file     = os.path.join(main_dir,"vsearch_ref.mtx")
    files_dir       = os.path.join(main_dir,"files")
    vsearch_file    = os.path.join(main_dir,"vsearch_result.uc")
    tax_file        = os.path.join(main_dir,'vsearch_ref.tax')
    names_collector={}

    print(main_dir)
    # Read Names file
    if os.path.exists(namesfile):
        names_fh = open(namesfile,'r')
        for line in names_fh:
            line = line.strip().split("\t")
            read_id = line[0].strip()
            read_list = line[1].split(',')
            names_collector[read_id] = read_list
        names_fh.close()

    print 'use cluster:',args.use_cluster

    if os.path.exists(files_dir):
        shutil.rmtree(files_dir)
    os.makedirs(files_dir)

    # Read Fasta file
    if args.use_cluster:
        cluster_nodes = 100
    else:
        # if not using cluster limit vsearch6 to 10 processes
        cluster_nodes = 100
    grep_cmd = ['grep', '-c', '>', uniquefile]
    facount = subprocess.check_output(grep_cmd).strip()
    calcnode_cmd = ["calcnodes", '-t', str(facount), '-n', str(cluster_nodes), '-f', '1']
    calcout = subprocess.check_output(calcnode_cmd).strip()
    lines = calcout.split("\n")
    i=0
    my_running_id_list=[]
    uc_file_list=[]
    for line in lines:
        i += 1
        if i >= cluster_nodes:
            continue
        fastasamp_filename   = os.path.join(files_dir, 'samp_' + str(i))
        vsearch_filename     = os.path.join(files_dir, "uc_" + str(i))
        uc_file_list.append(vsearch_filename)
        cluster_log_file     = os.path.join(files_dir, 'log_' + str(i))
        data = line.split()

        if len(data) < 2:
            continue
        start = data[1].split('=')[1]
        end  = data[2].split('=')[1]

        fastasampler_cmd = "fastasampler"
        fastasampler_cmd += ' -n '
        fastasampler_cmd += str(start)+','+str(end)
        fastasampler_cmd += ' '
        fastasampler_cmd += uniquefile
        fastasampler_cmd += ' '
        fastasampler_cmd += fastasamp_filename
        subprocess.call(fastasampler_cmd, shell=True)

        vsearch_list = ["vsearch"]
        vsearch_list.append("--usearch_global")
        vsearch_list.append(fastasamp_filename)
        vsearch_list.append("--id")
        vsearch_list.append(args.size)
        vsearch_list.append("--uc_allhits")
        vsearch_list.append("--gapopen")
        vsearch_list.append("6I/1E")
        vsearch_list.append("--db")
        vsearch_list.append(args.refdb)
        vsearch_list.append("--uc")
        vsearch_list.append(vsearch_filename)
        vsearch_list.append("--strand plus")
        vsearch_list.append("--maxaccepts")
        vsearch_list.append("20")
        vsearch_list.append("--maxrejects")
        vsearch_list.append("500")

        vsearch_cmd = ' '.join(vsearch_list)

        if args.use_cluster:
            clusterize_cmd = "/groups/vampsweb/"+args.site+"/clusterize_vamps"
            clusterize_cmd += " -site " + args.site
            clusterize_cmd += " -u " + args.user
            clusterize_cmd += " -log " + cluster_log_file
            clusterize_cmd += " "+vsearch_cmd
            #clusterize_cmd = "/bioware/seqinfo/bin/clusterize "+vsearch_cmd
            print 'Using Cluster:',clusterize_cmd

            #subprocess.call(clusterize_cmd,shell=True)
            p = subprocess.Popen(clusterize_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            retcode=p.poll()
            out=p.stdout.readline().split()
            print 'OUT',out
            qsub_id=out[2]

            my_running_id_list.append(qsub_id)
        else:

            p = subprocess.Popen(vsearch_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            print 'Not Using Cluster:',vsearch_cmd

    time.sleep(10)
    if args.use_cluster:

        print "Checking cluster jobs"
        my_working_id_list = my_running_id_list
        result = waiting_on_cluster( args, my_working_id_list )
        time.sleep(10)

        print 'vsearch: cluster jobs are complete'

    #must check here if all uc files present and size>0
    wait=True
    file_count = len(uc_file_list)
    file_adder=1
    new_file_list=[]

    while wait==True:
        time.sleep(1)
        for file in uc_file_list:
            if os.path.isfile(file) and os.stat(file).st_size >0 and file not in new_file_list:
                new_file_list.append(file)
                if args.verbose:
                    print 'found',file, os.stat(file).st_size, file_adder,file_count
                file_adder+=1
            else:
                if file_adder == file_count:
                    print 'found all files'
                    wait=False


    # concatenate all the small uc files
    # into one giant uc file
    with open(vsearch_file,'w') as fout:
        for line in fileinput.input(uc_file_list):
            fout.write(line)

    # Read the giant uc file and parse result
    query_sum={}
    read_id_list={}
    if os.path.exists(vsearch_file):
        uc_fh = open(vsearch_file,'r')
        for line in uc_fh:
            if line.startswith('#'):
                continue
            line_items = line.strip().split("\t")
            #print line_items
            if line_items[0] == 'H':
                if args.verbose:
                    print ' '.join(line_items)
                read_id = line_items[8]
                ref_id = line_items[9]
                #print line,read_id,ref_id
                # 3) Sum the Queries hitting each Ref * the CopyNumber, to get a total number of possible hits to each Ref.
                freq = len(names_collector[read_id])
                if ref_id in query_sum:
                    query_sum[ref_id] += int(freq)
                else:
                    query_sum[ref_id] = int(freq)

                if ref_id in read_id_list:
                    read_id_list[ref_id].append(read_id)
                else:
                    read_id_list[ref_id] = [read_id]

            elif line_items[0] == 'N':
                read_id = line_items[8]
                if nonhit in query_sum:
                    query_sum[nonhit] += 1
                else:
                    query_sum[nonhit] = 1
                if nonhit in read_id_list:
                    read_id_list[nonhit].append(read_id)
                else:
                    read_id_list[nonhit] = [read_id]
        uc_fh.close()

    # an ordered list of tuples: [('refid_1',knt), ('refid_2',knt), ('refid_3',knt)]
    query_list = sorted(query_sum.iteritems(), key=operator.itemgetter(1), reverse=True)
    #print query_sum
    #print query_list
    # read_id_list[ref_id]=names_collector[read_id]
    # 5) Assign each Query and its Copies to the Ref with the most hits.
    # this is what query_list looks like:
    #[('328675', 821), ('820818', 27), ('344596', 4), ('840284', 4), ('817526', 3), ('402252', 3),
    #('313857', 2), ('402791', 2), ('577212', 2), ('792520', 1), ('811000', 1), ('241525', 1),
    #('690451', 1), ('142029', 1), ('154871', 1), ('253376', 1), ('1107819', 1), ('329653', 1),
    #('127471', 1), ('731762', 1), ('46548', 1), ('587965', 1), ('670156', 1), ('366805', 1), ('331093', 1)]

    (ds_counter,ds_list) = do_cluster_file_alt(args, clusters_file2, read_id_list, names_collector, query_list)
    #(ds_counter,otu_counter) = do_cluster_file(args, clusters_file, read_id_list, names_collector, query_list)

    send_otu_count_to_info_file(main_dir,len(ds_counter))

    do_matrix_file(args, matrix_file, ds_counter, ds_list)

    if args.taxdb and os.path.exists(args.taxdb):
        do_taxonomy_file(args, tax_file, ds_counter)

def send_otu_count_to_info_file(dir,otu_count):
    info_file = os.path.join(dir,"info.txt")
    fh = open(info_file,'a')
    fh.write("otu_count = "+str(otu_count)+"\n")
    fh.close()

def do_cluster_file_alt(args, clusters_file, read_id_list, names_collector, query_list):
    global nonhit
    ds_counter  = {}
    assigned_reads = []
    gather_reads={}
    ds_list=[]
    cluster_fh = open(clusters_file,'w')

    for q in query_list:
        ref_id = q[0]
        if ref_id != nonhit:
            gather_reads[ref_id]=[]
            for prime_id in read_id_list[ref_id]:
                if args.verbose:
                    print 'prime id:',prime_id
                for dupe_id in names_collector[prime_id]:
                    if dupe_id not in assigned_reads:
                        gather_reads[ref_id].append(dupe_id)
                        (pj,ds,id) = dupe_id.split('--')
                        dataset = pj+'--'+ds
                        # must get fixed order of datasets
                        # not {}
                        if dataset not in ds_list:
                            ds_list.append(dataset)

                        if ref_id in ds_counter:
                            if dataset in ds_counter[ref_id]:
                                ds_counter[ref_id][dataset] += 1
                            else:
                                ds_counter[ref_id][dataset] = 1
                        else:
                            ds_counter[ref_id] = {}
                            ds_counter[ref_id][dataset] = 1

                        assigned_reads.append(dupe_id)
    print "OTU Count:",len(ds_counter)
    # use query_list here to get correct descending frequency
    #print query_list1
    new_list=[]
    for q in query_list:
        ref_id = q[0]
        if ref_id != nonhit:
            #count = len(gather_reads[ref_id])
            if len(gather_reads[ref_id])>0:
                new_list.append( (ref_id,gather_reads[ref_id]) )

    query_list1 = sorted(new_list, key=lambda otu: len(otu[1]), reverse=True)
    for q in query_list1:
        cluster_fh.write(q[0]+"\t")
        cluster_fh.write(str(len(q[1]))+"\t")
        cluster_fh.write(','.join(q[1])+"\n")

    cluster_fh.close()
    return (ds_counter,ds_list)

def do_cluster_file(args, clusters_file, read_id_list, names_collector, query_list):
    """CLUSTERS.TXT"""
    global nonhit
    cluster_fh = open(clusters_file,'w')
    cluster_counter=1
    assigned_reads = []
    final_reads = {}
    ds_counter  = {}
    otu_counter = {}
    ds_list=[]
    for q in query_list:
        ref_id = q[0]
        #if ref_id=='103868':
        #    print "GOT refid 103868", q

        total_count  = q[1]
        #cluster_id = 'Cluster_'+str(cluster_counter)
        # since these are ordered big->small the first one with that read_id is where it belongs
        if ref_id != nonhit:
            prime_read_ids = read_id_list[ref_id]
            for prime_id in prime_read_ids:

                for dupe_id in names_collector[prime_id]:

                    if dupe_id not in assigned_reads:
                        # it belongs to this OTU
                        if ref_id in final_reads:
                            final_reads[ref_id].append(dupe_id)
                        else:
                            final_reads[ref_id] = [dupe_id]
                        #cluster_fh.write(cluster_id+"\t")
                        cluster_fh.write(ref_id+"\t")
                        cluster_fh.write(dupe_id+"\n")

                        # get counts per dataset for each cluster
                        (pj,ds,id) = dupe_id.split('--')
                        dataset = pj+'--'+ds

                        # must get fixed order of datasets
                        # not {}
                        if dataset not in ds_list:
                            ds_list.append(dataset)

                        if ref_id in ds_counter:
                            if dataset in ds_counter[ref_id]:
                                ds_counter[ref_id][dataset] += 1
                            else:
                                ds_counter[ref_id][dataset] = 1
                        else:
                            ds_counter[ref_id] = {}
                            ds_counter[ref_id][dataset] = 1


                        if ref_id in otu_counter:
                            otu_counter[ref_id] += 1
                        else:
                            otu_counter[ref_id] = 1


                        # now put it in the assigned list
                        # so it won't get reassigned to another OTU
                        assigned_reads.append(dupe_id)
    # Write the unknowns last
    for q in query_list:
        ref_id = q[0]
        count  = q[1]
        cluster_id = nonhit
        if ref_id == nonhit:
            for prime_id in read_id_list[nonhit]:
                cluster_fh.write(nonhit+"\t")
                cluster_fh.write(prime_id+"\n")
                # get counts per dataset for each cluster
                (pj,ds,id) = prime_id.split('--')
                dataset = pj+'--'+ds


                if nonhit in ds_counter:
                    if dataset in ds_counter[nonhit]:
                        ds_counter[nonhit][dataset] += 1
                    else:
                        ds_counter[nonhit][dataset] = 1
                else:
                    ds_counter[nonhit] = {}
                    ds_counter[nonhit][dataset] = 1

    cluster_fh.close()
    return (ds_counter,otu_counter)

def do_matrix_file(args, matrix_file, ds_counter, ds_list):
    """MATRIX"""
    # write Matrix file:
    #ROWS: Cluster IDs and dataset counts

    matrix_fh = open(matrix_file,'w')
    matrix_fh.write("Cluster_ID")
    for ds in ds_list:
        matrix_fh.write("\t"+ds)
    matrix_fh.write("\n")

    for ref_id in ds_counter:
        #if ref_id == '248805':
        #    print 'got 248805',ds_counter[ref_id]
        if ref_id != nonhit:
            matrix_fh.write(ref_id)
            for ds in ds_list:
                if ds in ds_counter[ref_id]:
                    count = ds_counter[ref_id][ds]
                    matrix_fh.write("\t"+str(count))
                else:
                    matrix_fh.write("\t0")
            matrix_fh.write("\n")


    matrix_fh.write(nonhit)
    for ds in ds_list:
        if nonhit in ds_counter:
            if ds in ds_counter[nonhit]:
                count = ds_counter[nonhit][ds]
                matrix_fh.write("\t"+str(count))
            else:
                matrix_fh.write("\t0")
    matrix_fh.write("\n")
    matrix_fh.close()

def do_taxonomy_file(args, tax_file, ds_counter):
    """TAXONOMY"""
    tax_collector = {}
    tax_ref_fh = open(args.taxdb,'r')
    print "Reading Ref_Taxonomy File"
    for line in tax_ref_fh:
        line = line.strip().split("\t")
        read_id = line[0].strip()
        taxonomy = line[1].strip()
        tax_collector[read_id] = taxonomy
    tax_ref_fh.close()

    tax_fh = open(tax_file,'w')
    tax_fh.write("Cluster_ID\tTaxonomy\tRank\n")
    for ref_id in ds_counter:
        if args.verbose:
            print 'ds counter',ds_counter[ref_id]
        if ref_id in tax_collector:
            count = sum(ds_counter[ref_id].values())
            #print 'ds counter',ds_counter[ref_id],count
            rawtax = tax_collector[ref_id]
            tax = format_gg_tax(rawtax)
            rank = ranks[len(tax.split(';'))-1]
            #print ref_id,tax
            tax_fh.write(ref_id+"\t"+tax+"\t"+rank+"\t"+str(count)+"\n")
        #except:
        #    print "couldn't find this ref_id:",ref_id,"with",grep_cmd,"- moving on"
    tax_fh.close()

def format_gg_tax(gg_tax_string):
    """
    change this: k__Bacteria; p__Firmicutes; c__Clostridia; o__Coriobacteriales; f__; g__; s__
    to this: Bacteria;Firmicutes;Clostridia;Coriobacteriales;Family_NA;Genus_NA;Species_NA
    """
    line_tax = gg_tax_string.split(';')
    taxa_list=[]
    for t in line_tax:
        tmp = t.strip().split('__')

        pt1=tmp[0].strip()
        pt2=tmp[1].strip()
        #print pt1,pt2
        if pt2:
            taxa_list.append(pt2.strip(']').strip('[').replace(' ','_'))
        else:
            pass
#             if pt1=='p':
#                 taxa_list.append('Phylum_NA')
#             elif pt1=='c':
#                 taxa_list.append('Class_NA')
#             elif pt1=='o':
#                 taxa_list.append('Order_NA')
#             elif pt1=='f':
#                 taxa_list.append('Family_NA')
#             elif pt1=='g':
#                 taxa_list.append('Genus_NA')
#
#             elif pt1=='s':
#                 taxa_list.append('Species_NA')
#             else:
#                 pass
    taxa = ';'.join(taxa_list)
    #print taxa
    return taxa

def get_qstat_id_list(args):

    # ['139239', '0.55500', 'vsearch', 'avoorhis', 'r', '01/22/2012', '09:00:39', 'all.q@grendel-07.bpcservers.pr', '1']
    # 1) id
    # 2)
    # 3) name
    # 4) username
    # 5) code r=running, Ew=Error
    web_user = args.site+'httpd'
    qstat_cmd = ['qstat', '-u', web_user]
    qstat_codes={}
    output = subprocess.check_output(qstat_cmd)
    #print output
    output_list = output.strip().split("\n")[2:]
    qstat_codes['id'] = [n.split()[0] for n in output_list]
    qstat_codes['name'] = [n.split()[2] for n in output_list]
    qstat_codes['user'] = [n.split()[3] for n in output_list]
    qstat_codes['code'] = [n.split()[4] for n in output_list]
    #print 'Found IDs',qstat_ids

    return qstat_codes

def waiting_on_cluster(args, my_working_id_list):
    c = False
    maxwaittime = 60000  # seconds
    sleeptime   = 0.5    # seconds
    counter = 0
    time.sleep(sleeptime)
    got_one = False
    while my_working_id_list:

        qstat_codes = get_qstat_id_list(args)
        #print 'qstat_codes',qstat_codes['id']
        if not qstat_codes['id']:
            #print 'No qstat ids'
            #print("id list not found: may need to increase initial_interval if you haven't seen running ids.")
            print ('qstat id list not found')
            if not got_one:
                # empty out list we have seen some ids and now empty
                my_working_id_list = []
        if 'Eqw' in qstat_codes['code']:
            print( "Check cluster: may have error code(s), but they may not be mine!")

        got_one = False

        #print 'working ids',my_working_id_list
        #for id in my_working_id_list:
        #    if id not in qstat_codes['id']:

        if my_working_id_list and my_working_id_list[0] in qstat_codes['id']:

            got_one = True
            name = qstat_codes['name'][qstat_codes['id'].index(my_working_id_list[0])]
            user = qstat_codes['user'][qstat_codes['id'].index(my_working_id_list[0])]
            code = qstat_codes['code'][qstat_codes['id'].index(my_working_id_list[0])]


            if code == 'Eqw':
                print ('FAIL','Found Eqw code',my_working_id_list[0])
            elif code == 'qw':
                print("id is still queued: " +  str(my_working_id_list[0]) + " " + str(code))
            elif code == 'r':
                print("working...")
            else:
                print('Unknown qstat code: ' + str(code))
        elif my_working_id_list:
            print 'removing: ', my_working_id_list[0]
            my_working_id_list = my_working_id_list[1:]

        print 'my_working_id_list length:',len(my_working_id_list)

        time.sleep(sleeptime)
        counter += 1
        if counter >= maxwaittime:
            print('FAIL','Max Time exceeded: ',maxwaittime)
            sys.exit('Max Time exceeded')

if __name__ == '__main__':
    print "OTU_vsearch_REF"
    import argparse

    # DEFAULTS


    user = ''



    myusage = """usage: otu_vsearch_ref.py -i uniqueFile -n names file [options]

         Put user created otus into the vamps database. The OTUs must be in the
         form of a matrix file and a taxonomy file.

         where
            -i, --uniquefile The name of the input unique fasta file file.  [required]

            -n, --namesfile     Names File.

            -s, --size       Percent similarity: generally 0.97, 0.94 or 0.91 percent

            -db, --ref_database  reference database file: fasta

            -size, --size       DNA Region: v3, v6, v4v6, etc....
                                [default: unknown]
            -site            vamps or vampsdev.
                                [default: vampsdev]
            -id            upload_id.
                                [default: random number]
            -u, --user       Needed for otu naming and db access.
                             Will be retrieved from .dbconf if not supplied



    """
    parser = argparse.ArgumentParser(description="Upload Biom formatted files to the user_otus table." ,usage=myusage)



    parser.add_argument("-site", "--site",      required=False,  action="store",   dest = "site", default='vampsdev',
                                                    help="""database hostname: vamps or vampsdev
                                                        [default: vampsdev]""")

    parser.add_argument("-u", "--user",     required=False,  action="store",   dest = "user",
                                                    help="user name")

    parser.add_argument("-size", "--size",  required=False,  action="store",   dest = "size", default='',
                                                    help="OTU Size")
    parser.add_argument("-i", "--infile",   required=False,  action="store",   dest = "uniquefile", default='',
                                                    help="Uniqued and Sorted Fasta File ")
    parser.add_argument("-n", "--namesfile",required=False,  action="store",   dest = "namesfile", default='',
                                                    help="Names File ")
    parser.add_argument("-p", "--prefix",   required=False,  action="store",   dest = "prefix", default='',
                                                    help="Names Fasta File ")
    parser.add_argument("-db", "--ref_database",    required=False,  action="store",   dest = "refdb", default='',
                                                    help="Ref Database file ")
    parser.add_argument("-tax", "--tax_database",   required=False,  action="store",   dest = "taxdb", default='',
                                                    help="Taxonomy Ref Database file ")
    parser.add_argument("-uc", "--use_cluster",     required=False,  action="store_true",   dest = "use_cluster",
                                                    help="Use Cluster ")
    parser.add_argument("-v", "--verbose",          required=False,  action="store_true",   dest = "verbose",
                                                    help="Wordy ")
    parser.add_argument("-process_dir", "--process_dir",          required=False,  action="store",   dest = "process_dir", default='/Users/avoorhis/programming/vamps-node.js/',
                                                    help="Wordy ")
    print "Starting otu_vsearch_ref.py"
    args = parser.parse_args()
    if args.site == 'vamps':
        args.main_dir = os.path.join('/groups','vampsweb','vamps_node_data','user_data',args.user)
    elif args.site == 'vampsdev':
        args.main_dir =  os.path.join('/groups','vampsweb','vampsdev_node_data','user_data',args.user)
    else:
        args.main_dir = os.path.join(args.process_dir,'public','user_projects')

    run(args)
