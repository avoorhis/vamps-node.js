#!/usr/bin/env python



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
#from stat import * # ST_SIZE etc
import sys

import ConfigParser
from time import sleep
sys.path.append( '/groups/vampsweb/vampsdev' )
import MySQLdb
import MySQLdb.cursors
from os.path import expanduser
#from apps.ConDictMySQL import Conn
import datetime
import subprocess as subp
import gzip, csv, json

# GLOBALS
allowed_ranks = ('domain','phylum','klass','order','family','genus','species','strain')

class GZipWriter(object):

    def __init__(self, filename):
        self.filename = filename
        self.fp = None

    def __enter__(self):
        self.fp = open(self.filename, 'wb')
        self.proc = subp.Popen(['gzip'], stdin=subp.PIPE, stdout=self.fp)
        return self

    def __exit__(self, type, value, traceback):
        self.close()
        if type:
            os.remove(self.filename)

    def close(self):
        if self.fp:
            self.fp.close()
            self.fp = None

    def write(self, data):
        self.proc.stdin.write(data)

def get_fasta_sql(args, dids):
    sql = "SELECT UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n";
    sql += " JOIN sequence using (sequence_id)\n";
    sql += " JOIN dataset using (dataset_id)\n";
    sql += " JOIN project using (project_id)\n";
    sql += " where dataset_id in ('"+dids+"')";
    return sql
    
def get_matrix_biom_taxbytax_sql(args, dids):
    sql = "SELECT project, dataset, SUM(seq_count) as knt, concat_ws(';',\n"
    tmp = ''
    for rank  in allowed_ranks:
        tmp += " IF(LENGTH(`"+rank+"`),`"+rank+"`,NULL),\n"
        if rank == args.rank:
            break
    sql += tmp[:-2]+"\n"
    sql += " ) as taxonomy\n"
    sql += " from sequence_pdr_info as A\n"
    sql += " JOIN dataset as D on (A.dataset_id=D.dataset_id)\n"
    sql += " JOIN project as P on (D.project_id=P.project_id)\n"
    sql += " JOIN sequence_uniq_info as B on(A.sequence_id=B.sequence_id)\n"
    #sql += " JOIN sequence as S on(S.sequence_id=B.sequence_id)\n"
    sql += " JOIN silva_taxonomy_info_per_seq as C on(B.silva_taxonomy_info_per_seq_id=C.silva_taxonomy_info_per_seq_id)\n"
    sql += " JOIN silva_taxonomy as T on (C.silva_taxonomy_id=T.silva_taxonomy_id)\n"
    for rank  in allowed_ranks:
        sql += " JOIN `"+rank+"` using ("+rank+"_id)\n"
        if rank == args.rank:
            break
    sql += " WHERE D.dataset_id in ('"+dids+"') \n"
    sql += " GROUP BY taxonomy, dataset\n"
    sql += " ORDER BY taxonomy\n"
    return sql
    
def get_taxbyseq_sql(args, dids):
    sql = "SELECT project,dataset,seq_count, gast_distance,UNCOMPRESS(sequence_comp) as sequence,concat_ws(';',\n"
    sql += " IF(LENGTH(`domain`),`domain`,NULL),\n"
    sql += " IF(LENGTH(`phylum`),`phylum`,NULL),\n"
    sql += " IF(LENGTH(`klass`),`klass`,NULL),\n"
    sql += " IF(LENGTH(`order`),`order`,NULL),\n"
    sql += " IF(LENGTH(`family`),`family`,NULL),\n"
    sql += " IF(LENGTH(`genus`),`genus`,NULL),\n"
    sql += " IF(LENGTH(`species`),`species`,NULL),\n"
    sql += " IF(LENGTH(`strain`),`strain`,NULL)\n"
    sql += " ) as taxonomy\n"
    sql += " from sequence_pdr_info as A\n"
    sql += " JOIN dataset as D on (A.dataset_id=D.dataset_id)\n"
    sql += " JOIN project as P on (D.project_id=P.project_id)\n"
    sql += " JOIN sequence_uniq_info as B on(A.sequence_id=B.sequence_id)\n"
    sql += " JOIN sequence as S on(S.sequence_id=B.sequence_id)\n"
    sql += " JOIN silva_taxonomy_info_per_seq as C on(B.silva_taxonomy_info_per_seq_id=C.silva_taxonomy_info_per_seq_id)\n"
    sql += " JOIN silva_taxonomy as T on (C.silva_taxonomy_id=T.silva_taxonomy_id)\n"
    sql += " JOIN `domain` using (domain_id)\n"
    sql += " JOIN `phylum` using (phylum_id)\n"
    sql += " JOIN `klass` using (klass_id)\n"
    sql += " JOIN `order` using (order_id)\n"
    sql += " JOIN `family` using (family_id)\n"
    sql += " JOIN `genus` using (genus_id)\n"
    sql += " JOIN `species` using (species_id)\n"
    sql += " JOIN `strain`  using (strain_id)\n"
    sql += " WHERE D.dataset_id in ('"+dids+"') \n"
    sql += " ORDER BY taxonomy\n"
    return sql
    
def get_metadata_sql(args, dids, req_headers):
    sql  = "SELECT project, dataset, dataset_id, "+','.join(req_headers)
    sql += " from required_metadata_info\n "
    sql += " JOIN dataset using (dataset_id)\n";
    sql += " JOIN project using (project_id)\n";
    sql += " where dataset_id in ('" + dids + "')\n"
    return sql
    
def write_file_txt(args, out_file, file_txt):
    if args.compress:
        with GZipWriter(out_file+'.gz') as gz:
            gz.write(file_txt)          
    else:
        with open(out_file, 'w') as f:
            f.write(file_txt)

def run_fasta(args):
    print """running fasta --->>>"""
    # args.datasets is a list of p--d pairs
    out_file = os.path.join(args.base,'fasta-'+args.runcode+'.fasta')
    cursor = args.obj.cursor()  
    dids = "','".join(args.dids)
    sql = get_fasta_sql(args,dids)

    print sql        
    cursor.execute(sql)

    rows = cursor.fetchall()
    file_txt = ''    
    for row in rows:
        seq = row['seq']
        id = str(row['sequence_id'])+'|'+row['project']+'--'+row['dataset']+'|'+str(row['seq_count'])
        file_txt += '>'+str(id)+'\n'+str(seq)+'\n'
    file_txt += "\n"
    
    write_file_txt(args, out_file, file_txt)
    

def run_matrix(args):
    print '''running matrix --->>>'''
    out_file = os.path.join(args.base,'matrix-'+args.runcode+'.csv')
    cursor = args.obj.cursor()  
    dids = "','".join(args.dids)
    
    if args.rank not in allowed_ranks:
        args.rank = 'genus'
    sql = get_matrix_biom_taxbytax_sql(args, dids)

    print sql
    cursor.execute(sql)
    rows = cursor.fetchall()
    
    collector = {}
    sample_order_dict = {}

    for row in rows:
        samp = row['project']+'--'+row['dataset']
        sample_order_dict[samp] = 1
        knt = row['knt']
        
        
        if args.normalization == 'not_normalized':
            count = knt
        else:
            if args.dataset_counts[samp] <= 0:
                dataset_count = 1;
            else:
                dataset_count = args.dataset_counts[samp]
            if args.normalization == 'normalized_by_percent':
                count = round((knt /  dataset_count )*100,8)
            elif args.normalization == 'normalized_to_maximum':
                count = int(( knt /  dataset_count ) * args.max)
            else:
                count = knt  # should never get here
        
        tax   = row['taxonomy']
        dom = tax.split(';')[0]
        if dom in args.domains:
            if tax not in collector:
                collector[tax] = {}
            collector[tax][samp] = count
        
    sample_order = sorted(sample_order_dict.keys())  
    tax_order    = sorted(collector.keys())
    file_txt = 'VAMPS Taxonomy Matrix\tRank:'+args.rank+'\tNormalization:'+args.normalization+'\n'
    for pjds in sample_order:
        file_txt += "\t"+pjds
    file_txt += "\n"
    for tax in tax_order:
        tmp = tax+"\t"
        for pjds in sample_order:
            if pjds in collector[tax]:
                tmp += str(collector[tax][pjds])+"\t"
            else:
                tmp += "0\t"
        file_txt += tmp[:-1]+"\n"
    file_txt += "\n"
    
    write_file_txt(args, out_file, file_txt)
    
    
def run_biom(args):
    print '''running biom --->>>'''
    cursor = args.obj.cursor() 
    out_file = os.path.join(args.base,'biom-'+args.runcode+'.biom') 
    dids = "','".join(args.dids)
    sql = get_matrix_biom_taxbytax_sql(args, dids)

    print sql
    cursor.execute(sql)
    rows = cursor.fetchall()
    
    tax_array = {}
    boilerplate_text = "{\n"
    boilerplate_text += '"id":null,'+"\n"
    boilerplate_text += '"format": "Biological Observation Matrix 1.0.0",'+"\n"
    boilerplate_text += '"format_url": "http://biom-format.org/documentation/format_versions/biom-1.0.html",'+"\n"
    boilerplate_text += '"type": "OTU table",'+"\n"
    boilerplate_text += '"generated_by": "VAMPS-Node.js",'+"\n"
    boilerplate_text += '"date": "'+args.today+'",'+"\n"
    
    collector = {}
    sample_order_dict = {}
    for row in rows:
        samp = row['project']+'--'+row['dataset']
        sample_order_dict[samp]=1
        knt = row['knt']
        
        if args.normalization == 'not_normalized':
            count = knt
        else:
            if args.dataset_counts[pjds] <= 0:
                dataset_count = 1;
            else:
                dataset_count = args.dataset_counts[pjds]
            if args.normalization == 'normalized_by_percent':
                count = round((knt /  dataset_count )*100,8)
            elif args.normalization == 'normalized_to_maximum':
                count = int(( knt /  dataset_count ) * args.max)
            else:
                count = knt  # should never get here
        
        tax = row['taxonomy']
        if tax.split(';')[0] in args.domains:
            if tax not in collector:
                collector[tax] = {}
            collector[tax][samp] = count
        
    #print collector
    sample_order = sorted(sample_order_dict.keys())  
    tax_order = sorted(collector.keys())
    file_txt = boilerplate_text
    file_txt += '"rows":['+"\n"
    txt = ''
    for tax in tax_order:
        #f.write("\t"+'{"id":"'+tax+'","metadata":null},'+"\n")
        txt += "\t"+'{"id":"'+tax+'","metadata":null},'+"\n"
    file_txt += txt[:-2]+"\n],\n"
    file_txt += '"columns":['+"\n"
    txt = ''
    for pjds in sample_order:                
        #f.write("\t"+'{"id":"'+pjds+'","metadata":null},'+"\n")
        txt += "\t"+'{"id":"'+pjds+'","metadata":null},'+"\n"
    
    file_txt += txt[:-2]+"\n],\n"
    file_txt += '"matrix_type":"dense",'+"\n"
    file_txt += '"matrix_element_type":"int",'+"\n"
    file_txt += '"shape":['+str(len(tax_order))+','+str(len(sample_order))+'],'+"\n"
    file_txt += '"normalization":"'+args.normalization+'",'+"\n"
    file_txt += '"data":['+"\n"
    txt = ''
    for tax in tax_order:
        line_txt = "\t["
        for pjds in sample_order:
            if pjds in collector[tax]:
                line_txt += str(collector[tax][pjds])+','
            else:
                line_txt += '0,'
        line_txt = line_txt[:-1]+"],\n"
        txt += line_txt
    file_txt += txt[:-2]+"\n"
    
    file_txt += "]\n"
    file_txt += "}\n"
    
    write_file_txt(args, out_file, file_txt)
    
        
def run_metadata(args):
    print 'running metadata --->>>'
    # args.datasets is a list of p--d pairs
    out_file = os.path.join(args.base,'metadata-'+args.runcode+'.csv')
    cursor = args.obj.cursor()  
    dids = "','".join(args.dids)
    pids = "','".join(args.pids)
    
    # REQUIRED METADATA
    required_headers = ['taxon_id','description','common_name','altitude','assigned_from_geo','collection_date','depth','country','elevation','env_biome','env_feature','env_matter','latitude','longitude']   
    sql = get_metadata_sql(args, dids, required_headers)      
    
    cursor.execute(sql)
    result_count = cursor.rowcount
    data= {}
    #dataset_name_collector = {}
    headers_collector = {}
    for project_dataset in args.dataset_name_collector.values():
        data[project_dataset] = {}
        
    if result_count:
        rows = cursor.fetchall()
        for row in rows:
            #print 'req',row
            project_dataset = row['project']+'--'+row['dataset']
            
            for key in row:
                data[project_dataset][key]= row[key]
                headers_collector[key] = 1
                       
    #print 'headers_collector',headers_collector
    # CUSTOM METADATA
    for pid in args.pids:
        custom_table = 'custom_metadata_'+pid
        
        sql3  = "SELECT * from "+custom_table+"\n "
        #print 'args.dataset_name_collector'
        #print args.dataset_name_collector
        cursor.execute(sql3)
        rows = cursor.fetchall()
        for row in rows:
            did = row['dataset_id'] 
            if did in args.dataset_name_collector:
                pjds = args.dataset_name_collector[did]
            else:
                pjds = 'unknown'
            #print pjds
            if str(did) in args.dids:
                for key in row:
                    if key != custom_table+'_id':
                        
                        #print 'row[key]',row[key]
                        data[pjds][key]= row[key]
                        headers_collector[key] = 1
    
    
    # convert to a list and sort
    headers_collector_keys = sorted(headers_collector.keys())
    file_txt = ''
    file_txt += "VAMPS Metadata\n"
    file_txt += 'dataset'
    for header in headers_collector_keys:
        file_txt += ','+header
    file_txt += '\n'
    for pjds in data:
        file_txt += pjds
        for header in headers_collector_keys:
            #if header not in ['custom_metadata_273_id','custom_metadata_517_id']:
                
                if header in data[pjds]:
                    file_txt += ','+str(data[pjds][header])
                else:
                    file_txt += ','
        file_txt += '\n'
    file_txt += '\n'       
    write_file_txt(args, out_file, file_txt)

def run_taxbytax(args):
    print 'running taxbytax --->>>'
    
    cursor = args.obj.cursor()  
    dids = "','".join(args.dids)
    if args.rank not in allowed_ranks:
        args.rank = 'genus'
    sql = get_matrix_biom_taxbytax_sql(args, dids)

    print sql
    cursor.execute(sql)
    rows = cursor.fetchall()
    
    tax_array = {}
    sample_order_dict = {}
    for row in rows:
        pjds = row['project']+'--'+row['dataset']
        sample_order_dict[pjds] = 1
        knt = row['knt']
        
        
        if args.normalization == 'not_normalized':
            count = knt
        else:
            if args.dataset_counts[pjds] <= 0:
                dataset_count = 1;
            else:
                dataset_count = args.dataset_counts[pjds]
            if args.normalization == 'normalized_by_percent':
                count = round((knt /  dataset_count )*100,8)
            elif args.normalization == 'normalized_to_maximum':
                count = int(( knt /  dataset_count ) * args.max)
            else:
                count = knt  # should never get here
        #print 'count',count
        #print knt,args.dataset_counts[pjds],args.max,count
        tax = row['taxonomy']
        if tax.split(';')[0] in args.domains:
            if tax in tax_array:
                if pjds in tax_array[tax]:
                    tax_array[tax][pjds] += count
                else:
                    tax_array[tax][pjds] = count
        
            else:
                tax_array[tax] = {}
                tax_array[tax][pjds] = count
    sample_order = sorted(sample_order_dict.keys())  
    tax_order = sorted(tax_array.keys())   
    #write_taxbytax_file(args, tax_array, tax_order, sample_order)
    
    out_file = os.path.join(args.base,'taxbytax-'+args.runcode+'.csv')
    ranks = ('domain','phylum','class','order','family','genus','species','strain')
    file_txt = 'VAMPS TaxByTax\tNormalization: '+args.normalization+'\n'
    for d in sample_order:
        file_txt += d+'\t'
    file_txt += "Rank\tTaxonomy\n";
    

    for tax in tax_order:
        line = ''
        for d in sample_order:
            if d in tax_array[tax]:
                line += str(tax_array[tax][d])+"\t"
            else:
                line += "0\t"
        
        rank = ranks[len(tax.split(';'))-1]
        line += rank+"\t"+tax+"\n"
        file_txt += line
        
    write_file_txt(args, out_file, file_txt)    
    
def run_taxbyseq(args):
    print 'running taxbyseq --->>>'
    cursor = args.obj.cursor()  
    dids = "','".join(args.dids)
    sql = get_taxbyseq_sql(args, dids)

    print sql
    cursor.execute(sql)
    rows = cursor.fetchall()
    
    seqs_array         = {}
    seqs_tax_array     = {}
    seqs_dist_array    = {}
    seqs_refhvrs_array = {}
    sample_order_dict = {}
    for row in rows:
        pjds = row['project']+'--'+row['dataset']
        sample_order_dict[pjds] = 1
        seq_count  = row['seq_count']
        
        distance   = row['gast_distance']
        seq        = row['sequence'].encode('zlib')
        taxonomy   = row['taxonomy']
        
        if args.normalization == 'not_normalized':
            count = seq_count
        else:
            if args.dataset_counts[pjds] <= 0:
                dataset_count = 1;
            else:
                dataset_count = args.dataset_counts[pjds]
            
            if args.normalization == 'normalized_by_percent':
                count = round((seq_count /  dataset_count )*100,8)
            elif args.normalization == 'normalized_to_maximum':
                count = int(( seq_count /  dataset_count ) * args.max)
            else:
                count = seq_count  # should never get here
 

        seqs_dist_array[seq]    = distance
        #seqs_refhvrs_array[seq] = refhvr_ids
        seqs_tax_array[seq]     = taxonomy
        if seq in seqs_array:
            if pjds in seqs_array[seq]:
                seqs_array[seq][pjds] += count
            else:
                seqs_array[seq][pjds] = count
        else:
            seqs_array[seq] = {}
            seqs_array[seq][pjds] = count
    sample_order = sorted(sample_order_dict.keys())  
    #tax_order = sorted(collector.keys())
    #write_taxbyseq_file(args, seqs_array, seqs_tax_array, seqs_refhvrs_array, seqs_dist_array)
    #write_taxbyseq_file(args, seqs_array, seqs_tax_array, seqs_dist_array,sample_order)
    out_file = os.path.join(args.base,'taxbyseq-'+args.runcode+'.csv')
    ranks = ('domain','phylum','class','order','family','genus','species','strain')
    file_txt = 'VAMPS TaxBySeq\tNormalization: '+args.normalization+'\n\t'
    
    for d in sample_order:
        file_txt += d+'\t'
    file_txt += "Distance\tSequence\tRank\tTaxonomy\n"
    

    for seq in seqs_array:
        line = ''
        tax = seqs_tax_array[seq]
        rank = ranks[len(tax.split(';'))-1]
        #refhvr_ids = seqs_refhvrs_array[seq]
        dist = seqs_dist_array[seq]
        show_seq = seq.decode("zlib")
    
        #txt += refhvr_ids+'\t'
        #line += refhvr_ids+'\t'
        for d in sample_order:
            if d in seqs_array[seq]:
                #txt += str(seqs_array[seq][d])+"\t"
                line += str(seqs_array[seq][d])+"\t"
            else:
                #txt += "0\t"
                line += "0\t"
        line += str(dist)+"\t"+show_seq+"\t"+rank+"\t"+tax+"\n"
        file_txt += line
    write_file_txt(args, out_file, file_txt)

#def write_taxbytax_file(args, tax_array, tax_order, sample_order):
#def write_taxbyseq_file(args, seqs_array, seqs_tax_array, seqs_refhvrs_array, seqs_dist_array):
#def write_taxbyseq_file(args, seqs_array, seqs_tax_array,  seqs_dist_array, sample_order):
    
    
def clean_samples(samples):
    pjds = samples.strip().split(';')
    pjds = [p.replace(',','--') for p in pjds]
    return pjds

    
def get_dataset_counts(args):
    print '''getting dataset_counts --->>>'''
    cursor = args.obj.cursor()
    dids = "','".join(args.dids)
    #pd = "') OR\n(project='".join(["' and dataset='".join(p.split('--')) for p in args.datasets])
    #sql = "SELECT distinct project, dataset, dataset_count from "+pd_table+" WHERE\n(project='" + pd + "')\n"
    sql = "SELECT dataset_id, project, dataset, sum(seq_count) as dataset_count" 
    sql += " from sequence_pdr_info as i"
    sql += " join dataset as D using(dataset_id)"
    sql += " join project as P using(project_id)"
    sql += " where dataset_id in ('"+dids+"')"
    sql += " group by dataset"
    print sql
    cursor.execute(sql)    
    rows = cursor.fetchall()
    max=0;
    pd_counter = {}
    dataset_name_collector = {}

    for row in rows:
        pjds = row['project']+'--'+row['dataset']
        ds_count = row['dataset_count']
        pd_counter[pjds] = ds_count
        dataset_name_collector[row['dataset_id']] = pjds
        if ds_count > max:
            max = ds_count
    
    return (max, pd_counter, dataset_name_collector)
    
    
if __name__ == '__main__':
    
    import argparse
    
    
    myusage = """usage: vamps_export_file.py  [options]
         
         
         where
            
            -site       vamps or [default: vampsdev]
              
            -r,   --runcode                                
            
            -u, --user       Needed access code creation
            
            --file_base         Where the files will go and where is the INFO file
            --normalization     user choice: not_normalized, normalized_to_maximum or normalized_by_percent
            --compress          Compress files in gzip format

            --rank              used only for taxbytax, biom and matrix  [ DEFAULT:phylum ]
            --domains           [ DEFAULT:"Archaea,Bacteria,Eukarya,Organelle,Unknown" ]
            
            --taxbytax_file     if present will create TaxByTax file
            --taxbyref_file     if present will create TaxByRef file  NOT YET WORKING
            --taxbyseq_file     if present will create TaxBySeq file
            --fasta_file        if present will create Fasta file
            --matrix_file       if present will create Count Matrix file
            --biom_file         if present will create Biom file

    
    
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
                                                     
    parser.add_argument("-s", "--site",               required=True,  action="store",   dest = "site", 
                                                    help="""database hostname: vamps or vampsdev
                                                        [default: vampsdev]""")  
    parser.add_argument("-r", "--runcode",      required=True,  action="store",   dest = "runcode", 
                                                    help="like 12345678")  
    parser.add_argument("-u", "--user",         required=True,  action="store",   dest = "user", 
                                                    help="VAMPS user name")  
    parser.add_argument("-dids", "--dids",         required=True,  action="store",   dest = "dids", 
                                                    help="dataset_ids")
    parser.add_argument("-pids", "--pids",         required=True,  action="store",   dest = "pids", 
                                                    help="project_ids")
     
    parser.add_argument("-base", "--file_base",      required=True,  action="store",   dest = "base", help="Path without user or file")   
    
    parser.add_argument("-taxbytax_file", "--taxbytax_file",  required=False,  action="store_true",   dest = "taxbytax", default=False,
                                                    help="")                                                 
    parser.add_argument("-taxbyref_file", "--taxbyref_file",  required=False,  action="store_true",   dest = "taxbyref", default=False,
                                                    help="") 
    parser.add_argument("-taxbyseq_file", "--taxbyseq_file",  required=False,  action="store_true",   dest = "taxbyseq", default=False,
                                                    help="") 
    parser.add_argument("-fasta_file", "--fasta_file",        required=False,  action="store_true",   dest = "fasta", default=False,
                                                    help="")  
    parser.add_argument("-metadata_file", "--metadata_file",   required=False,  action="store_true",   dest = "metadata", default=False,
                                                    help="") 
    parser.add_argument("-biom_file", "--biom_file",           required=False,  action="store_true",   dest = "biom", default=False,
                                                    help="") 
    parser.add_argument("-matrix_file", "--matrix_file",           required=False,  action="store_true",   dest = "matrix", default=False,
                                                    help="")
    parser.add_argument("-rank", "--rank",      required=False,  action="store",   dest = "rank", default='genus',
                                                    help="This is for matrix file only")  
    parser.add_argument("-domains", "--domains",      required=False,  action="store",   dest = "domains", default="Archaea,Bacteria,Eukarya,Organelle,Unknown",

                                                    help="This is for matrix file only")                                             
    parser.add_argument("-norm", "--normalization",  required=False,  action="store",   dest = "normalization", default='not_normalized',
                                                    help="not_normalized, normalized_to_maximum or normalized_by_percent")                                                 
    parser.add_argument("-compress", "--compress",        required=False,  action="store_true",   dest = "compress", default=False,
                                                    help="")
    parser.add_argument("-db", "--db",    
                required=False,  action='store', dest = "NODE_DATABASE",  default='vamps2',
                help="NODE_DATABASE")
    args = parser.parse_args()
    
    args.today = str(datetime.date.today())
    
    if args.site == 'vamps':
        db_host = 'vampsdb'
        db_home = '/groups/vampsweb/vamps/'
    elif args.site == 'vampsdev':
        db_host = 'vampsdev'
        db_home = '/groups/vampsweb/vampsdev/'
    else:
        db_host = 'localhost'
        db_home = '~/'
    db_name = args.NODE_DATABASE
    
    print db_host,db_name
    
    home = expanduser("~")
    args.obj = MySQLdb.connect( host=db_host, db=db_name,  read_default_file=home+'/.my.cnf_node', cursorclass=MySQLdb.cursors.DictCursor    )
   
    output_dir = args.base
    
    print args.normalization
    args.dids = args.dids.strip('"').split(',')
    args.pids = args.pids.strip('"').split(',')
    args.domains = args.domains.strip('"').split(',')
    args.domains = [x.strip() for x in args.domains]
    args.dids = [x.strip() for x in args.dids]
    args.pids = [x.strip() for x in args.pids]

    (args.max, args.dataset_counts, args.dataset_name_collector) = get_dataset_counts(args)
    args.datasets = args.dataset_counts.keys()
    #print 'max',args.max
    #print 'max2',args.dataset_counts
    #sys.exit()
    

    #args.compress = True
    
    
#     args.dc_sql_rows   = []
#     args.seqs_sql_rows = []
#     if args.taxbytax:
#         args.dc_sql_rows = get_dc_result_from_db(args)
#     if args.taxbyref or args.taxbyseq:
#         args.seqs_sql_rows = get_seqs_result_from_db(args)
    #sys.exit()
    
    if args.metadata:
        run_metadata(args)  
    if args.fasta:
        run_fasta(args)   
    if args.taxbytax:
        run_taxbytax(args)
    if args.taxbyref:
        #run_taxbyref(args)
        pass   
    if args.taxbyseq:
        run_taxbyseq(args) 
    if args.biom:
        run_biom(args)
    if args.matrix:
        run_matrix(args) 
        
    print 'Finished'
   
