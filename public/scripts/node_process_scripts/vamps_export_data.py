#!/groups/vampsweb/vampsdev/seqinfobin/bin/python

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
#from stat import * # ST_SIZE etc
import sys

import ConfigParser
from time import sleep
sys.path.append( '/groups/vampsweb/vampsdev' )
#import MySQLdb
from apps.ConDictMySQL import Conn
import datetime
import subprocess as subp
import gzip, csv, json

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


def run_fasta(args):
    """running fasta --->>>
    
    var qSelect = "SELECT UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n";
		qSelect += " JOIN sequence using (sequence_id)\n";
		qSelect += " JOIN dataset using (dataset_id)\n";
		qSelect += " JOIN project using (project_id)\n";
		qSelect += " where dataset_id in ("+pids+")";
		
		"""
    # args.datasets is a list of p--d pairs
    out_file = os.path.join(args.base,'fasta-'+args.runcode+'_custom.fa')
    cursor = args.obj.get_cursor()  
    pids = "','".join(args.dids)
    
    sql = "SELECT UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n";
    sql += " JOIN sequence using (sequence_id)\n";
    sql += " JOIN dataset using (dataset_id)\n";
    sql += " JOIN project using (project_id)\n";
    sql += " where dataset_id in ('"+pids+"')";
    
        
    # sql  = "SELECT"
#     sql += " concat_ws('|', s.rep_id, s.project, s.dataset, concat(round(distance*100,1),"
#     sql += " '% from ', s.taxonomy), seq_count) as id, sequence\n"
#     sql += " from "+seqs_table+" as s\n "
#     #sql += " left join vamps_clusters as c on (read_id = rep_id)\n"
#     sql += " where s.project_dataset in ('" + pd + "')\n"        
#     if args.tax_string and args.tax_string != 'All_Domains':
#         sql += "and taxonomy like '"+args.tax_string+"%'\n"
    print sql        
    cursor.execute(sql)

    rows = cursor.fetchall()
    if args.compress:
        with GZipWriter(out_file+'.gz') as gz:
            for row in rows:
                seq = row['seq']
                id = str(row['sequence_id'])+'|'+row['project']+'--'+row['dataset']+'|'+str(row['seq_count'])                
                gz.write('>'+str(id)+'\n'+str(seq)+'\n')
    else:
        with open(out_file, 'w') as f:
            for row in rows:
                seq = row['seq']
                id = str(row['sequence_id'])+'|'+row['project']+'--'+row['dataset']+'|'+str(row['seq_count'])                
                f.write('>'+str(id)+'\n'+str(seq)+'\n')
def run_biom(args):
    print '''running biom'''
       
def run_metadata(args):
    print 'running metadata'
    # args.datasets is a list of p--d pairs
    out_file = os.path.join(args.base,'metadata-'+args.runcode+'.csv')
    cursor = args.obj.get_cursor()  
    dids = "','".join(args.dids)
    pids = "','".join(args.pids)
    
    # REQUIRED METADATA
    required_headers = ['taxon_id','description','common_name','altitude','assigned_from_geo','collection_date','depth','country','elevation','env_biome','env_feature','env_matter','latitude','longitude']   
    sql1  = "SELECT project, dataset, dataset_id, "+','.join(required_headers)
    sql1 += " from required_metadata_info\n "
    sql1 += " JOIN dataset using (dataset_id)\n";
    sql1 += " JOIN project using (project_id)\n";
    sql1 += " where dataset_id in ('" + dids + "')\n"        
    
    cursor.execute(sql1)
    result_count = cursor.rowcount
    data= {}
    dataset_name_collector = {}
    headers_collector = {}
    if result_count:
        rows = cursor.fetchall()
        for row in rows:
            #print 'req',row
            project_dataset = row['project']+'--'+row['dataset']
            data[project_dataset] = {}
            for key in row:
                data[project_dataset][key]= row[key]
                headers_collector[key] = 1
                dataset_name_collector[row['dataset_id']] = project_dataset        
    
    # CUSTOM METADATA
    for pid in args.pids:
        custom_table = 'custom_metadata_'+pid
        # sql2 = "SELECT * from custom_metadata_fields where project_id='"+pid+"'"
#         cursor.execute(sql2)
#         rows = cursor.fetchall()
#         items = ''
#         for row in rows:
#             #items += '`'+custom_table+'.'+row['field_name']+'`,'
#             items += '`'+row['field_name']+'`,'
        
        
        sql3  = "SELECT * from "+custom_table+"\n "
        #print sql3
        cursor.execute(sql3)
        rows = cursor.fetchall()
        for row in rows:
            did = row['dataset_id'] 
            if did in dataset_name_collector:
                pjds = dataset_name_collector[did]
            else:
                pjds = 'unknown'
            if str(did) in args.dids:
                for key in row:
                    if key != custom_table+'_id':
                        data[pjds][key]= row[key]
                        headers_collector[key] = 1
    print headers_collector
    # convert to a list and sort
    headers_collector_keys = sorted(headers_collector.keys())
              
    if args.compress:
        with GZipWriter(out_file+'.gz') as gz:
            gz.write("VAMPS Metadata\n")
            f.write('dataset')
            for header in headers_collector_keys:
                gz.write(','+header)
            gz.write('\n')
            for pjds in data:
                gz.write(pjds)
                for header in headers_collector_keys:
                    #if header not in ['custom_metadata_273_id','custom_metadata_517_id']:
                        gz.write(','+str(data[pjds][header]))
                gz.write('\n')
            gz.write('\n')
                
    else:
        with open(out_file, 'w') as f:
            f.write("VAMPS Metadata\n")
            f.write('dataset')
            for header in headers_collector_keys:
                f.write(','+header)
            f.write('\n')
            for pjds in data:
                f.write(pjds)
                for header in headers_collector_keys:
                    #if header not in ['custom_metadata_273_id','custom_metadata_517_id']:
                        f.write(','+str(data[pjds][header]))
                f.write('\n')
            f.write('\n')
    
    #with GZipWriter(out_file+'.gz') as gz:
#     if args.compress:
#         with gzip.open(out_file+'.gz', "w") as gz:
#         #fp = open(out_file, "w")
#             #csv_w=csv.writer(gz,delimiter='\t')
#             for row in rows:
#                 pass
#     else:
#         pass
#         
#         
#     else:
#         fp = open(out_file, 'w')
#         fp.write('No metadata found.\n')
#         fp.close()
    
# def get_dc_result_from_db(args):
#     cursor = args.obj.get_cursor() 
#     if args.data_source == 'user':
#         dc_table = 'vamps_data_cube_uploads'
#     else:
#         dc_table = 'vamps_data_cube'
#         
#     pd = "') OR\n(project='".join(["' and dataset='".join(p.split('--')) for p in args.datasets])
#     
#     sql = " SELECT project,dataset,knt,taxon_string\n"
#     sql += " FROM "+dc_table+" WHERE (\n(project='" + pd + "'))\n"
#     if args.tax_string and args.tax_string != 'All_Domains':
#         sql += "and taxon_string like '"+args.tax_string+"%'\n"
#     sql += " ORDER BY taxon_string\n"
#     #print sql
#     cursor.execute(sql)
#     rows = cursor.fetchall()
#     return rows
#     
# def get_seqs_result_from_db(args):
# 
#     cursor = args.obj.get_cursor() 
#     if args.data_source == 'user':
#         seqs_table = 'vamps_sequences_pipe'
#     else:
#         seqs_table = 'vamps_sequences'
#         
#     pd = "','".join(args.datasets)
#     
#     sql = " SELECT project_dataset, seq_count, refhvr_ids, distance, sequence, taxonomy\n"
#     sql += " FROM "+seqs_table+" WHERE project_dataset in ('"+pd+"')\n"
#     if args.tax_string and args.tax_string != 'All_Domains':
#         sql += "and taxonomy like '"+args.tax_string+"%'\n"
#     #print sql
#     cursor.execute(sql)
#     rows = cursor.fetchall()
#     return rows
#     
    
def run_taxbytax(args):
    print 'running taxbytax'
    
    cursor = args.obj.get_cursor()  
    dids = "','".join(args.dids)
    
    
    sql = "SELECT project, dataset, sum(seq_count) as knt, concat_ws(';',\n"
    sql += " IF(LENGTH(`domain`),`domain`,NULL),\n"
    sql += " IF(LENGTH(`phylum`),`phylum`,NULL),\n"
    sql += " IF(LENGTH(`klass`),`klass`,NULL),\n"
    sql += " IF(LENGTH(`order`),`order`,NULL),\n"
    sql += " IF(LENGTH(`family`),`family`,NULL),\n"
    sql += " IF(LENGTH(`genus`),`genus`,NULL),\n"
    sql += " IF(LENGTH(`species`),`species`,NULL),\n"
    sql += " IF(LENGTH(`strain`),`strain`,NULL)\n"
    sql += " ) as taxonomy\n"
    sql += " FROM sequence_pdr_info as A\n"
    sql += " JOIN dataset as D on (A.dataset_id=D.dataset_id)\n"
    sql += " JOIN project as P on (D.project_id=P.project_id)\n"
    sql += " JOIN sequence_uniq_info as B on(A.sequence_id=B.sequence_id)\n"
    sql += " JOIN silva_taxonomy_info_per_seq as C on(B.silva_taxonomy_info_per_seq_id=C.silva_taxonomy_info_per_seq_id)\n"
    sql += " JOIN silva_taxonomy as T on (C.silva_taxonomy_id=T.silva_taxonomy_id)\n"
    sql += " JOIN domain using (domain_id)\n"
    sql += " JOIN phylum using (phylum_id)\n"
    sql += " JOIN klass using (klass_id)\n"
    sql += " JOIN `order` using (order_id)\n"
    sql += " JOIN family using (family_id)\n"
    sql += " JOIN genus using (genus_id)\n"
    sql += " JOIN species using (species_id)\n"
    sql += " JOIN strain  using (strain_id)\n"
    sql += " WHERE D.dataset_id in('"+dids+"')\n"
    sql += " GROUP BY taxonomy, dataset\n"
    sql += " ORDER BY taxonomy\n"
    print sql
    cursor.execute(sql)
    rows = cursor.fetchall()
    
    tax_array = {}
    for row in rows:
        pjds = row['project']+'--'+row['dataset']
        knt = row['knt']
        taxonomy = row['taxonomy']
        
        
        if args.normalization == 'Not_Normalized':
            count = knt
        else:
            dataset_count = args.dataset_counts[pjds]
            if args.normalization == 'normailzed_by_percent':
                count = round((knt /  dataset_count ),8)
            elif args.normalization == 'normalized_to_maximum':
                count = int(( knt /  dataset_count ) * args.max)
            else:
                count = knt  # should never get here
        print 'count',count
        #print knt,args.dataset_counts[pjds],args.max,count
        if taxonomy in tax_array:
            if pjds in tax_array[taxonomy]:
                tax_array[taxonomy][pjds] += count
            else:
                tax_array[taxonomy][pjds] = count
        
        else:
            tax_array[taxonomy] = {}
            tax_array[taxonomy][pjds] = count
        
    write_taxbytax_file(args, tax_array)
    
# def run_taxbyref(args):
#     print 'running taxbyref'
#     """
#     
#     SELECT project_dataset, seq_count, refhvr_ids, distance, sequence, taxonomy
#  FROM vamps_sequences 
#  WHERE project_dataset in ('AB_SAND_Bv6--HS122','AB_SAND_Bv6--HS123','AB_SAND_Bv6--HS124')
#     """
#     ref_array     = {}
#     ref_tax_array = {}
#     for row in args.seqs_sql_rows:
#         #sql = " SELECT project_dataset, seq_count, refhvr_ids, distance, sequence, taxonomy\n"
#         pjds = row[0]
#         seq_count = row[1]
#         ref_hvrs = row[2]
#         taxonomy = row[5]
#         if args.normalization == 'Not_Normalized':
#             count = seq_count
#         else:
#             if args.dataset_counts[pjds] <= 0:
#                 dataset_count = 1;
#             else:
#                 dataset_count = args.dataset_counts[pjds]
#             
#             if args.normalization == 'normailzed_by_percent':
#                 count = ( float(seq_count) /  dataset_count )
#             elif args.normalization == 'normalized_to_maximum':
#                 count = ( float(seq_count) /  dataset_count ) * args.max
#             else:
#                 count = seq_count  # should never get here
#             
#             
#         #print count
#         
#         if args.tax_string:            
#             if taxonomy.find(args.tax_string) == 0:  # must be found at start of string
#                 
#                 ref_tax_array[ref_hvrs] = taxonomy
#                 if ref_hvrs in ref_array:
#                     if pjds in ref_array[ref_hvrs]:
#                         ref_array[ref_hvrs][pjds] += count
#                     else:
#                         ref_array[ref_hvrs][pjds] = count
#                 
#                 else:
#                     ref_array[ref_hvrs] = {}
#                     ref_array[ref_hvrs][pjds] = count
#         else:
#             
#             ref_tax_array[ref_hvrs] = taxonomy
#             if ref_hvrs in ref_array:
#                 if pjds in ref_array[ref_hvrs]:
#                     ref_array[ref_hvrs][pjds] += count
#                 else:
#                     ref_array[ref_hvrs][pjds] = count
#             
#             else:
#                 ref_array[ref_hvrs] = {}
#                 ref_array[ref_hvrs][pjds] = count
#             
#             
#     write_taxbyref_file(args, ref_array, ref_tax_array)
    
def run_taxbyseq(args):
    print 'running taxbyseq'
    cursor = args.obj.get_cursor()  
    dids = "','".join(args.dids)
    
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
    sql += " JOIN domain using (domain_id)\n"
    sql += " JOIN phylum using (phylum_id)\n"
    sql += " JOIN klass using (klass_id)\n"
    sql += " JOIN `order` using (order_id)\n"
    sql += " JOIN family using (family_id)\n"
    sql += " JOIN genus using (genus_id)\n"
    sql += " JOIN species using (species_id)\n"
    sql += " JOIN strain  using (strain_id)\n"
    sql += " WHERE D.dataset_id in ('"+dids+"') \n"
    sql += " ORDER BY taxonomy\n"
    print sql
    cursor.execute(sql)
    rows = cursor.fetchall()
    
    seqs_array         = {}
    seqs_tax_array     = {}
    seqs_dist_array    = {}
    seqs_refhvrs_array = {}
    for row in rows:
        pjds = row['project']+'--'+row['dataset']
        seq_count  = row['seq_count']
        
        distance   = row['gast_distance']
        seq        = row['sequence'].encode('zlib')
        taxonomy   = row['taxonomy']
        
        if args.normalization == 'Not_Normalized':
            count = seq_count
        else:
            if args.dataset_counts[pjds] <= 0:
                dataset_count = 1;
            else:
                dataset_count = args.dataset_counts[pjds]
            
            if args.normalization == 'normailzed_by_percent':
                count = round((seq_count /  dataset_count ),5)
            elif args.normalization == 'normalized_to_maximum':
                count = int(( seq_count /  dataset_count ) * args.max)
            else:
                count = seq_count  # should never get here
        print 'count',count
#         if args.tax_string:            
#             if taxonomy.find(args.tax_string) == 0:  # must be found at start of string
#                 
#                 seqs_dist_array[seq]    = distance
#                 seqs_refhvrs_array[seq] = refhvr_ids
#                 seqs_tax_array[seq]     = taxonomy
#                 if seq in seqs_array:
#                     if pjds in seqs_array[seq]:
#                         seqs_array[seq][pjds] += count
#                     else:
#                         seqs_array[seq][pjds] = count
#                 
#                 else:
#                     seqs_array[seq] = {}
#                     seqs_array[seq][pjds] = count
#        else:
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
    #write_taxbyseq_file(args, seqs_array, seqs_tax_array, seqs_refhvrs_array, seqs_dist_array)
    write_taxbyseq_file(args, seqs_array, seqs_tax_array, seqs_dist_array)
    
def write_taxbytax_file(args, tax_array):

    out_file = os.path.join(args.base,'taxbytax-'+args.runcode+'.csv')
    ranks = ('domain','phylum','class','order','family','genus','species','strain')
    if args.compress:
        with GZipWriter(out_file+'.gz') as gz:
    
            txt = 'VAMPS TaxByTax\n'
            for d in args.datasets:
                txt += d+'\t'
            txt += "Rank\tTaxonomy\n";
            gz.write(txt)
        
            for tax in tax_array:
                line = ''
                for d in args.datasets:
                    if d in tax_array[tax]:
                        line += str(tax_array[tax][d])+"\t"
                    else:
                        line += "0\t"
                
                rank = ranks[len(tax.split(';'))-1]
                line += rank+"\t"+tax+"\n"
                gz.write(line)
    else:
        with open(out_file, 'w') as f:
            txt = 'VAMPS TaxByTax\n'
            for d in args.datasets:
                txt += d+'\t'
            txt += "Rank\tTaxonomy\n";
            f.write(txt)
        
            for tax in tax_array:
                line = ''
                for d in args.datasets:
                    if d in tax_array[tax]:
                        line += str(tax_array[tax][d])+"\t"
                    else:
                        line += "0\t"
                
                rank = ranks[len(tax.split(';'))-1]
                line += rank+"\t"+tax+"\n"
                f.write(line)
    
# def write_taxbyref_file(args, ref_array, ref_tax_array):
# 
#     out_file = os.path.join(args.base,args.runcode+'TaxByRef.txt')
#     ranks = ('domain','phylum','class','order','family','genus','species','strain')
#     with GZipWriter(out_file+'.gz') as gz:
#     
#         txt = 'TaxByRef\nrefhvr_ids\t'
#         for d in args.datasets:
#             txt += d+'\t'
#         txt += "Rank\tTaxonomy\n"
#         gz.write(txt)
#         
#         for ref in ref_array:
#             line = ref+'\t'
#             for d in args.datasets:
#                 if d in ref_array[ref]:
#                     line += str(ref_array[ref][d])+"\t"
#                 else:
#                     line += "0\t"
#             tax = ref_tax_array[ref]
#             rank = ranks[len(tax.split(';'))-1]
#             line += rank+"\t"+tax+"\n"
#             gz.write(line)
#     
    
#def write_taxbyseq_file(args, seqs_array, seqs_tax_array, seqs_refhvrs_array, seqs_dist_array):
def write_taxbyseq_file(args, seqs_array, seqs_tax_array,  seqs_dist_array):
    out_file = os.path.join(args.base,'taxbyseq-'+args.runcode+'.csv')
    ranks = ('domain','phylum','class','order','family','genus','species','strain')
   
    if args.compress: 
        with GZipWriter(out_file+'.gz') as gz:
            txt = 'TaxBySeq\nrefhvr_ids\t'
            for d in args.datasets:
                txt += d+'\t'
            txt += "Distance\tSequence\tRank\tTaxonomy\n"
            gz.write(txt)
        
            for seq in seqs_array:
                line = ''
                tax = seqs_tax_array[seq]
                rank = ranks[len(tax.split(';'))-1]
                #refhvr_ids = seqs_refhvrs_array[seq]
                dist = seqs_dist_array[seq]
                show_seq = seq.decode("zlib")
            
                #txt += refhvr_ids+'\t'
                #line += refhvr_ids+'\t'
                for d in args.datasets:
                    if d in seqs_array[seq]:
                        txt += str(seqs_array[seq][d])+"\t"
                        line += str(seqs_array[seq][d])+"\t"
                    else:
                        txt += "0\t"
                        line += "0\t"
                line += str(dist)+"\t"+show_seq+"\t"+rank+"\t"+tax+"\n"
                gz.write(line)
    else:
        with open(out_file, 'w') as f:
            txt = 'TaxBySeq\nrefhvr_ids\t'
            for d in args.datasets:
                txt += d+'\t'
            txt += "Distance\tSequence\tRank\tTaxonomy\n"
            f.write(txt)
        
            for seq in seqs_array:
                line = ''
                tax = seqs_tax_array[seq]
                rank = ranks[len(tax.split(';'))-1]
                #refhvr_ids = seqs_refhvrs_array[seq]
                dist = seqs_dist_array[seq]
                show_seq = seq.decode("zlib")
            
                #txt += refhvr_ids+'\t'
                #line += refhvr_ids+'\t'
                for d in args.datasets:
                    if d in seqs_array[seq]:
                        txt += str(seqs_array[seq][d])+"\t"
                        line += str(seqs_array[seq][d])+"\t"
                    else:
                        txt += "0\t"
                        line += "0\t"
                line += str(dist)+"\t"+show_seq+"\t"+rank+"\t"+tax+"\n"
                f.write(line)
    
def clean_samples(samples):
    pjds = samples.strip().split(';')
    pjds = [p.replace(',','--') for p in pjds]
    return pjds

    
def get_dataset_counts(args):
    print ''' getting dataset_counts '''
    cursor = args.obj.get_cursor()
    dids = "','".join(args.dids)
    #pd = "') OR\n(project='".join(["' and dataset='".join(p.split('--')) for p in args.datasets])
    #sql = "SELECT distinct project, dataset, dataset_count from "+pd_table+" WHERE\n(project='" + pd + "')\n"
    sql = "SELECT project, dataset, sum(seq_count) as dataset_count" 
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
    
    for row in rows:
        pjds = row['project']+'--'+row['dataset']
        ds_count = row['dataset_count']
        pd_counter[pjds] = ds_count
        if ds_count > max:
            max = ds_count
    
    return (max, pd_counter)
    
    
if __name__ == '__main__':
    
    import argparse
    
    
    myusage = """usage: vamps_export_file.py  [options]
         
         
         where
            
            -site       vamps or [default: vampsdev]
              
            -r,   --runcode                                
            
            -u, --user       Needed access code creation
            
            --file_base         Where the files will go and where is the INFO file
            --normalization     user choice: not_normalized, normalized_to_maximum or normailzed_by_percent
            --compress          Compress files in gzip format
            
            --taxbytax_file     if present will create TaxByTax file
            --taxbyref_file     if present will create TaxByRef file
            --taxbyseq_file     if present will create TaxBySeq file
            --fasta_file        if present will create Fasta file
         
    
    
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
                                                     
    parser.add_argument("-site", "--site",               required=True,  action="store",   dest = "site", 
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
    #parser.add_argument("-tax", "--tax_string",      required=False,  action="store",   dest = "tax_string", default='unknown',
    #                                                help="") 
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
                                                    
    parser.add_argument("-norm", "--normalization",  required=False,  action="store",   dest = "normalization", default='Not_Normalized',
                                                    help="not_normalized, normalized_to_maximum or normailzed_by_percent")                                                 
    parser.add_argument("-compress", "--compress",        required=False,  action="store_true",   dest = "compress", default=False,
                                                    help="")
    args = parser.parse_args()
    
    args.today = str(datetime.date.today())
    
    if args.site == 'vamps':
        db_host = 'vampsdb'
        db_name = 'vamps2'
        db_home = '/groups/vampsweb/vamps/'
    else:
        db_host = 'vampsdev'
        db_name = 'vamps2'
        db_home = '/groups/vampsweb/vampsdev/'
    args.obj=Conn(db_host, db_name, db_home)
    output_dir = args.base
    
    
    
#     info_load_file = os.path.join(output_dir,'INFO.config')
#     config = ConfigParser.ConfigParser()
#     config.optionxform=str
#     config.read(info_load_file)
#     for name, value in  config.items('MAIN'):
#         #print '  %s = %s' % (name, value)  
#         if name=='samples':
#             samples = value
#         if name=='tax_string':
#             args.tax_string = value    
#     if not args.tax_string or args.tax_string == 'All_Domains':
#         args.tax_string = ''
#     args.datasets = clean_samples(samples)
#     if args.normalization == 'Normalized_By_Percent':
#         (args.max, args.dataset_counts) = get_dataset_counts(args)
#     elif args.normalization == 'Normalized_To_Maximum':
#         (args.max, args.dataset_counts) = get_dataset_counts(args)
#     else:
#         args.max = 1
    
    args.dids = args.dids.split(',')
    args.pids = args.pids.split(',')
    (args.max, args.dataset_counts) = get_dataset_counts(args)
    args.datasets = args.dataset_counts.keys()
    print 'max',args.max
    print 'max2',args.dataset_counts
    #sys.exit()
    print args.datasets
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
        
    print 'Finished'
   
