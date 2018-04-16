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
import configparser as ConfigParser
from time import sleep
from os.path import expanduser
import datetime
import subprocess as subp
import gzip, csv, json
import pymysql as MySQLdb

sys.path.append('/groups/vampsweb/vampsdev')

# GLOBALS
allowed_ranks = ('domain', 'phylum', 'klass', 'order', 'family', 'genus', 'species', 'strain')

class GZipWriter(object):

    def __init__(self, filename):
        self.filename = filename
        self.fp = None

    def __enter__(self):
        self.fp = open(self.filename, 'wb')
        self.proc = subp.Popen(['gzip'], stdin=subp.PIPE, stdout=self.fp)
        return self

    def __exit__(self, my_type, value, traceback):
        self.close()
        if my_type:
            os.remove(self.filename)

    def close(self):
        if self.fp:
            self.fp.close()
            self.fp = None

    def write(self, data):
        self.proc.stdin.write(data.encode('utf-8'))

def get_fasta_sql(args,dids):
    sql = "SELECT UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n"
    sql += " JOIN sequence using (sequence_id)\n"
    sql += " JOIN dataset using (dataset_id)\n"
    sql += " JOIN project using (project_id)\n"
    sql += " where dataset_id in ('"+dids+"')"
    if not args.include_metagenomic:
        sql += " AND metagenomic='0'"
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
    if not args.include_metagenomic:
        sql += " AND metagenomic='0'"
    sql += " GROUP BY taxonomy, dataset\n"
    sql += " ORDER BY taxonomy\n"
    return sql

def get_taxbyseq_sql(args,dids):
    sql = "SELECT project, dataset, seq_count, gast_distance, UNCOMPRESS(sequence_comp) as sequence, concat_ws(';', \n"
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
    if not args.include_metagenomic:
        sql += " AND metagenomic='0'"
    sql += " ORDER BY taxonomy\n"
    return sql

def get_req_metadata_sql(dids, req_headersA, req_headersB):

    sql  = "SELECT project, dataset, dataset_id, "+','.join(req_headersA)
    sql += ', t1.term_name as '+ req_headersB[0]
    sql += ', t2.term_name as '+ req_headersB[1]
    sql += ', t3.term_name as '+ req_headersB[2]
    sql += ', t4.term_name as '+ req_headersB[3] +"\n"
    sql += " from required_metadata_info\n "
    sql += " JOIN dataset using (dataset_id)\n"
    sql += " JOIN project using (project_id)\n"
    sql += " JOIN run using(run_id)\n"
    sql += " JOIN dna_region using (dna_region_id)\n"
    sql += " JOIN domain using (domain_id)\n"
    sql += " JOIN env_package using (env_package_id)\n"
    sql += " JOIN target_gene using (target_gene_id)\n"
    sql += " JOIN run_key on (adapter_sequence_id=run_key_id)\n"
    sql += " JOIN illumina_index using(illumina_index_id)\n"
    sql += " JOIN primer_suite using(primer_suite_id)\n"
    #sql += " join ref_primer_suite_primer using(primer_suite_id)\n"
    #sql += " join primer using(primer_id)\n"
    sql += " JOIN sequencing_platform using (sequencing_platform_id)\n"
    sql += " JOIN term as t1 on (env_biome_id=t1.term_id)\n"
    sql += " JOIN term as t2 on (env_feature_id=t2.term_id)\n"
    sql += " JOIN term as t3 on (env_material_id=t3.term_id)\n"
    sql += " JOIN term as t4 on (geo_loc_name_id=t4.term_id)\n"
    #sql += " where dataset_id in ('" + dids + "')\n"
    return sql

def get_primers(args):
    primer_lookup = {}
    cursor = args.obj.cursor()
    sql = "SELECT sequence, primer_suite from primer"
    sql += " JOIN ref_primer_suite_primer using(primer_id)"
    sql += " JOIN primer_suite using(primer_suite_id)"
    cursor.execute(sql)
    primer_rows = cursor.fetchall()
    for primer_row in primer_rows:
        suite = primer_row['primer_suite']
        p = primer_row['sequence']
        if suite in primer_lookup:
            primer_lookup[suite] += ' '+p
        else:
            primer_lookup[suite] = p 
    
    return primer_lookup
    
def write_file_txt(args, out_file, file_txt):

    print(out_file)
    if args.compress:
        with GZipWriter(out_file+'.gz') as gz:
            gz.write(file_txt)
    else:
        with open(out_file, 'w') as f:
            f.write(file_txt)

def run_fasta(args):
    print ("""running fasta --->>>""")
    # args.datasets is a list of p--d pairs
    if args.function == 'otus':
        out_file = os.path.join(args.base,'fasta.fa')
    else:
        out_file = os.path.join(args.base,'fasta-'+args.runcode+'.fasta')
    cursor = args.obj.cursor()
    dids = "','".join(args.dids)
    sql = get_fasta_sql(args,dids)

    print (sql)
    cursor.execute(sql)

    rows = cursor.fetchall()
    file_txt = ''
    for row in rows:
        seq = row['seq']
        seq_count = row['seq_count']
       #  if args.function == 'otus':
#             # for otus id = ICM_LCY_Bv6--LCY_0007_2003_05_04--249319_1171  pjds _ seqid _ num
#             for n in range(1,seq_count+1):
#                 id = row['project']+'--'+row['dataset']+'--'+str(row['sequence_id'])+'_'+str(n)+'_'+str(seq_count)
#                 file_txt += '>'+str(id)+'\n'+str(seq)+'\n'
#         else:
        my_id = str(row['sequence_id'])+'|'+row['project']+'--'+row['dataset']+'|frequency:'+str(seq_count)
        file_txt += '>'+str(my_id)+'\n'+str(seq)+'\n'


    file_txt += "\n"

    write_file_txt(args, out_file, file_txt)


def run_matrix(args):
    print ('''running matrix --->>>''')
    # file name could have date,include_nas,tax-depth,units,domains, normalization
    # or this data could go inside file?
    out_file = os.path.join(args.base,'matrix-'+args.runcode+'.tsv')
    cursor = args.obj.cursor()
    dids = "','".join(args.dids)

    if args.rank not in allowed_ranks:
        args.rank = 'genus'
    sql = get_matrix_biom_taxbytax_sql(args, dids)

    print (sql)
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

        tax = row['taxonomy']
        taxa = tax.split(';')
        dom = taxa[0]
        if dom in args.domains:
            # exclude Chloroplasts if Organelle not in
            if dom == 'Bacteria' and 'Organelle' not in args.domains and 'Chloroplast' in tax:
                print('Chloroplast - Excluding',tax)
            else:
                if  args.exclude_nas and len(taxa) != allowed_ranks.index(args.rank)+1:
                    print('_NA -- Excluding',tax)
                else:
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
    print ('''running biom --->>>''')
    cursor = args.obj.cursor()
    out_file = os.path.join(args.base,'biom-'+args.runcode+'.biom')
    dids = "','".join(args.dids)
    sql = get_matrix_biom_taxbytax_sql(args, dids)

    print (sql)
    cursor.execute(sql)
    rows = cursor.fetchall()

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

        tax  = row['taxonomy']
        taxa = tax.split(';')
        dom = taxa[0]
        if dom in args.domains:
            # exclude Chloroplasts if Organelle not in
            if dom == 'Bacteria' and 'Organelle' not in args.domains and 'Chloroplast' in tax:
                print('Chloroplast - Excluding',tax)
            else:
                if  args.exclude_nas and len(taxa) != allowed_ranks.index(args.rank)+1:
                    print('_NA -- Excluding',tax)
                else:
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

def run_metadata_from_files(args, file_form):
    print ('in file metadata')
    for did in args.dids:
        print ('did',did)
        json_data=open(os.path.join(args.files_home, did+'.json')).read()
        mdata = (json.loads(json_data))['metadata']
        print(mdata)
        

def get_dco_excludes(args):
    import urllib2
    exclude_list = []
    url = 'https://raw.githubusercontent.com/jladau/CoDL/master/metadata/formatted_metadata/metadata-blanks-controls-list.csv'
    try:
        response = urllib2.urlopen(url)
        reader = csv.reader(response)
    #     file = os.path.join(args.base,'dco_excluded_datasets.csv')
    #     ifile = open(file, "rU")
    #     reader = csv.reader(ifile, delimiter=",")  
        index_of_pjds = 1
        for row in reader:
            exclude_list.append(row[index_of_pjds])  
    except:
        pass
    return exclude_list
               
def run_metadata(args, file_form, dco_bulk=False):
    print ('running metadata --->>>')
    # args.datasets is a list of p--d pairs
    
    cursor = args.obj.cursor()
    dids = "','".join(args.dids)        
    pids = "','".join(args.pids)

    # REQUIRED METADATA
    primers_lookup = get_primers(args)  # primers_lookup[primer_suite] = primers-string
    required_headersA = ["collection_date",
                               "run_key", "illumina_index","primer_suite",
                                "dna_region", "domain.domain", "env_package",
                                "target_gene", "latitude", "longitude",
                                "sequencing_platform", "run"]
    required_headersB = [  "env_biome",  "env_feature", "env_material", "geo_loc_name" ]      # these have to be matched with term table
    
    
    sql = get_req_metadata_sql(dids, required_headersA, required_headersB)
    if dco_bulk:
        sql += " where project_id in ('" + pids + "')\n"
        out_file = os.path.join(args.base,'dco_all_metadata_'+args.today+'.csv')
        dco_exclude_data = []
        #dco_exclude_data = get_dco_excludes(args) # Josh requestes ALL datasets 2017-11-28
    else:
        sql += " where dataset_id in ('" + dids + "')\n"
        if file_form == 'datasets_as_rows':
            out_file = os.path.join(args.base,'metadata-'+args.runcode+'-1.tsv') 
        else:
            out_file = os.path.join(args.base,'metadata-'+args.runcode+'-2.tsv')
    if not args.include_metagenomic:
        sql += " AND metagenomic='0'"
    print (sql)
    
    cursor.execute(sql)
    result_count = cursor.rowcount
    data= {}
    #dataset_name_collector = {}
    headers_collector = {}
    #print 'args.dataset_name_collector'
    #print args.dataset_name_collector
    for project_dataset in args.dataset_name_collector.values():
        data[project_dataset] = {}
        #print project_dataset
    if result_count:
        rows = cursor.fetchall()
        for row in rows:
            #print 'req',row
            project = row['project']
            dataset = row['dataset']
            project_dataset = project+'--'+dataset
            headers_collector['primers'] = 1 
            for key in row:
                if project_dataset in data:
                    data[project_dataset]['primers'] = ''
                    if type(row[key]) == str:
                        if key == 'primer_suite':
                            #data[project_dataset][key] = row['primer_suite']+' ('+row['sequencing_platform']+')'  
                            data[project_dataset][key] = row['primer_suite'] 
                            if row['primer_suite'] in primers_lookup:
                                data[project_dataset]['primers'] = primers_lookup[row['primer_suite']] 
                            else:
                                data[project_dataset]['primers'] = ''
                                                     
                        else:
                            data[project_dataset][key] = row[key]
                        
                    else:
                        data[project_dataset][key] = row[key]
                    headers_collector[key] = 1
    args.obj.commit()
    print (data)
    # PRIMERS (from primer_suite_id)
    # for pjds in data:
#         for key in data[pjds]:
#             if key == 'primer_suite':
#                 data[pjds]['primers'] = 'unknown'
#                 headers_collector['primers'] = 1
#                 temp = []
#                 primers_query = "SELECT sequence from primer"
#                 primers_query += " JOIN ref_primer_suite_primer using(primer_id)"
#                 primers_query += " JOIN primer_suite using(primer_suite_id)"
#                 primers_query += " WHERE primer_suite='%s'"
#                 #pquery = primers_query % (row[key])
#                 pquery = primers_query % (data[pjds][key])
#                 print (pquery)
#                 cursor.execute(pquery)
#                 primer_rows = cursor.fetchall()
#                 #print 'p00',primer_rows
#                 for primer_row in primer_rows:
#                     #print 'p0',primer_row['sequence']
#                     temp.append(primer_row['sequence'])
#                 data[pjds]['primers'] = " ".join(temp)
#                 args.obj.commit() 
    #args.obj.commit()                
    #print 'headers_collector',headers_collector
    
    # CUSTOM METADATA
    for pid in args.pids:
        custom_table = 'custom_metadata_'+pid
        #print 'pid',pid
        sql3  = "SELECT * from "+custom_table
        print (sql3)
        #print 'args.dataset_name_collector'
        #print args.dataset_name_collector
        try:
            cursor.execute(sql3)
            rows = cursor.fetchall()
        except:
            print('Could not find/query custom metadata table:',custom_table)
        for row in rows:
            did = row['dataset_id']
            #print did
            if did in args.dataset_name_collector:
                pjds = args.dataset_name_collector[did]
            else:
                pjds = 'unknown'
            #print pjds
            #if str(did) in args.dids:
            try:
                for key in row:
                    #print('key',key)  ## key is mditem
                    if key != custom_table+'_id':

                        #print 'row[key]',row[key]
                        if type(row[key]) == str:
                            data[pjds][key]= row[key].replace(",",";").replace("\r",";").replace("\n",";")
                        else:
                            data[pjds][key]= row[key]
                        headers_collector[key] = 1
            except:
                print('vamps_export data error: Custom Metadata')
        

    headers_collector_keys = sorted(headers_collector.keys())
    ds_sorted = sorted(data.keys())
    file_txt = ''
    file_txt += "VAMPS Metadata\n"
    # convert to a list and sort
    if dco_bulk:
        file_txt = 'PROJECT_ID,SAMPLE_ID,VARIABLE,VALUE\n'
        for pjds in ds_sorted:
            if pjds in dco_exclude_data:
                #print "  excluding "+pjds+ " (It's in exclude file)"
                pass
            else:
                #print "retaining "+pjds
                project_id_items = pjds.split('_')
                project_id = project_id_items[0] + '_' + project_id_items[1]
                for mditem in headers_collector_keys:                 
                    if mditem in data[pjds]:
                        value = (str(data[pjds][mditem])).replace(',',';').replace("\r",";") 
                        if value == '' or value == 'None':
                            value = 'null' 
                    else:
                        value = 'null'                   
                    file_txt += project_id+','+pjds+','+mditem+','+value+'\n'
    elif file_form == 'datasets_as_rows':
        file_txt += 'dataset'
        for header in headers_collector_keys:
            file_txt += '\t'+header
        file_txt += '\n'
        for pjds in ds_sorted:
            file_txt += pjds
            for mditem in headers_collector_keys:
                #if header not in ['custom_metadata_273_id','custom_metadata_517_id']:
                    if mditem in data[pjds]:
                        file_txt += '\t'+str(data[pjds][mditem])
                    else:
                        file_txt += '\t'
            file_txt += '\n'
        file_txt += '\n'
    else:
        file_txt += 'metadata'
        for pjds in ds_sorted:
            file_txt += '\t'+pjds
        file_txt += '\n'   
        for mditem in headers_collector_keys:
            file_txt += mditem
            for pjds in ds_sorted:
                if mditem in data[pjds]:
                    file_txt += '\t'+str(data[pjds][mditem])
                else:
                    file_txt += '\t'
            file_txt += '\n'
        file_txt += '\n'
    #print(out_file, file_txt)
    write_file_txt(args, out_file, file_txt)

def run_taxbytax(args):
    print ('running taxbytax --->>>')

    cursor = args.obj.cursor()
    dids = "','".join(args.dids)
    if args.rank not in allowed_ranks:
        args.rank = 'genus'
    sql = get_matrix_biom_taxbytax_sql(args, dids)

    print (sql)
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
                dataset_count = 1
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
        tax   = row['taxonomy']
        taxa = tax.split(';')
        dom = taxa[0]
        if dom in args.domains:
            # exclude Chloroplasts if Organelle not in
            if dom == 'Bacteria' and 'Organelle' not in args.domains and 'Chloroplast' in tax:
                print('Chloroplast - Excluding',tax)
            else:
                if  args.exclude_nas and len(taxa) != allowed_ranks.index(args.rank)+1:
                    print('_NA -- Excluding',tax)
                else:
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

    out_file = os.path.join(args.base,'taxbytax-'+args.runcode+'.tsv')
    ranks = ('domain','phylum','class','order','family','genus','species','strain')
    file_txt = 'VAMPS TaxByTax\tNormalization: '+args.normalization+'\n'
    for d in sample_order:
        file_txt += d+'\t'
    file_txt += "Rank\tTaxonomy\n"


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
    print ('running taxbyseq --->>>')
    cursor = args.obj.cursor()
    dids = "','".join(args.dids)
    sql = get_taxbyseq_sql(args,dids)

    print (sql)
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
        seq        = row['sequence']  #.encode('zlib')
        #print(str(seq))
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


        seqs_dist_array[seq] = distance
        #seqs_refhvrs_array[seq] = refhvr_ids
        seqs_tax_array[seq] = taxonomy
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
    out_file = os.path.join(args.base,'taxbyseq-'+args.runcode+'.tsv')
    ranks = ('domain','phylum','class','order','family','genus','species','strain')
    file_txt = 'VAMPS TaxBySeq\tNormalization: '+args.normalization+'\n'

    for d in sample_order:
        file_txt += d+'\t'
    file_txt += "Distance\tSequence\tRank\tTaxonomy\n"


    for seq in seqs_array:
        line = ''
        tax = seqs_tax_array[seq]
        rank = ranks[len(tax.split(';'))-1]
        #refhvr_ids = seqs_refhvrs_array[seq]
        dist = seqs_dist_array[seq]
        
        #txt += refhvr_ids+'\t'
        #line += refhvr_ids+'\t'
        for d in sample_order:
            if d in seqs_array[seq]:
                #txt += str(seqs_array[seq][d])+"\t"
                line += str(seqs_array[seq][d])+"\t"
            else:
                #txt += "0\t"
                line += "0\t"
        line += str(dist)+"\t"+seq.decode('UTF-8')+"\t"+rank+"\t"+tax+"\n"
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
    print('''getting dataset_counts --->>>''')
    cursor = args.obj.cursor()
    dids = "','".join(args.dids)
    pids = "','".join(args.pids)
    #pd = "') OR\n(project='".join(["' and dataset='".join(p.split('--')) for p in args.datasets])
    #sql = "SELECT distinct project, dataset, dataset_count from "+pd_table+" WHERE\n(project='" + pd + "')\n"
    sql = "SELECT dataset_id, project, dataset, sum(seq_count) as dataset_count"
    sql += " from sequence_pdr_info as i"
    sql += " join dataset as D using(dataset_id)"
    sql += " join project as P using(project_id)"
    if dids:
        sql += " where dataset_id in ('"+dids+"')"
    elif pids:
        sql += " where project_id in ('"+pids+"')"
    else:
        sys.exit('no pids or dids from command line -- exiting')
    if not args.include_metagenomic:
        sql += " AND metagenomic='0'"
    sql += " group by dataset"
    
    print(sql)
    cursor.execute(sql)
    rows = cursor.fetchall()
    max_val = 0;
    pd_counter = {}

    for row in rows:
        ds_count = row['dataset_count']
        pd_counter[row['project']+'--'+row['dataset']] = ds_count
        if ds_count > max_val:
            max_val = ds_count

    return (max_val, pd_counter)
    
def get_dataset_names(args):
    print('''getting dataset_names --->>>''')
    cursor = args.obj.cursor()
    dids = "','".join(args.dids)
    pids = "','".join(args.pids)
    #pd = "') OR\n(project='".join(["' and dataset='".join(p.split('--')) for p in args.datasets])
    #sql = "SELECT distinct project, dataset, dataset_count from "+pd_table+" WHERE\n(project='" + pd + "')\n"
    sql = "SELECT dataset_id, project, dataset"
    #sql += " from sequence_pdr_info as i"
    sql += " FROM dataset"
    sql += " join project using(project_id)"
    if dids:
        sql += " where dataset_id in ('"+dids+"')"
    elif pids:
        sql += " where project_id in ('"+pids+"')"
    else:
        sys.exit('no pids or dids from command line -- exiting')
    if not args.include_metagenomic:
        sql += " AND metagenomic='0'"
    print(sql)
    cursor.execute(sql)
    rows = cursor.fetchall()
    dataset_name_collector = {}

    for row in rows:
        dataset_name_collector[row['dataset_id']] = row['project']+'--'+row['dataset']

    return dataset_name_collector


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
            --domains           [ DEFAULT:"Archaea, Bacteria, Eukarya, Organelle, Unknown" ]

            --taxbytax_file     if present will create TaxByTax file
            --taxbyref_file     if present will create TaxByRef file  NOT YET WORKING
            --taxbyseq_file     if present will create TaxBySeq file
            --fasta_file        if present will create Fasta file
            --matrix_file       if present will create Count Matrix file
            --biom_file         if present will create Biom file



    """
    parser = argparse.ArgumentParser(description = "", usage = myusage)



    parser.add_argument("-s", "--site",               required=True,  action="store",   dest = "site",
                                                    help="""database hostname: vamps or vampsdev or local(host)
                                                        [default: vampsdev]""")
    parser.add_argument("-r", "--runcode",      required=True,  action="store",   dest = "runcode",
                                                    help="like 12345678")
    parser.add_argument("-u", "--user",         required=True,  action="store",   dest = "user",
                                                    help="VAMPS user name")
    parser.add_argument("-dids", "--dids",         required=False,  action="store",   dest = "dids",default = '',
                                                    help="dataset_ids")
    parser.add_argument("-pids", "--pids",         required=False,  action="store",   dest = "pids", default = '',
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
    parser.add_argument("-metadata_file1", "--metadata_file1",   required=False,  action="store_true",   dest = "metadata1", default=False,
                                                    help="Datasets as rows/Metadata as columns")
    parser.add_argument("-metadata_file2", "--metadata_file2",   required=False,  action="store_true",   dest = "metadata2", default=False,
                                                    help="Metadata as Rows/Datasets as columns")
    parser.add_argument("-dco_metadata_file", "--dco_metadata_file",   required=False,  action="store_true",   dest = "dco_metadata", default=False,
                                                    help="Samples as Rows/Metadata as columns")                                                
    parser.add_argument("-biom_file", "--biom_file",           required=False,  action="store_true",   dest = "biom", default=False,
                                                    help="")
    parser.add_argument("-matrix_file", "--matrix_file",           required=False,  action="store_true",   dest = "matrix", default=False,
                                                    help="")
    parser.add_argument("-rank", "--rank",      required=False,  action="store",   dest = "rank", default='genus',
                                                    help="This is for matrix file only")
    parser.add_argument("-domains", "--domains",      required=False,  action="store",   dest = "domains", default="Archaea,Bacteria,Eukarya,Organelle,Unknown",
                                                        help="This is for matrix file only")
    parser.add_argument("-exclude_nas", "--exclude_nas",    required=False,  action="store_true",   dest = "exclude_nas", default=False,
                                                    help="")
    parser.add_argument("-norm", "--normalization",  required=False,  action="store",   dest = "normalization", default='not_normalized',
                                                    help="not_normalized, normalized_to_maximum or normalized_by_percent")
    parser.add_argument("-compress", "--compress",        required=False,  action="store_true",   dest = "compress", default=False,
                                                    help="")
    parser.add_argument("-fxn", "--function",        required=False,  action="store",   dest = "function", default='download',
                                                    help="download or otus or ")
    parser.add_argument("-db", "--db",
                required=False,  action='store', dest = "NODE_DATABASE",  default='vamps_development',
                help="NODE_DATABASE")
    parser.add_argument("-mg", "--include_metagenomic",
                required=False,  action='store_true', dest = "include_metagenomic",  default=False,
                help="")
    args = parser.parse_args()

    args.today = str(datetime.date.today())

    if args.site == 'vamps':
        db_host = 'vampsdb'
        #db_host = 'bpcweb8'
        args.NODE_DATABASE = 'vamps2'
        db_home = '/groups/vampsweb/vamps/'
        args.files_home ='/groups/vampsweb/vamps_node_data/json/vamps2--datasets_silva119/'
    elif args.site == 'vampsdev':
        db_host = 'bpcweb7'
        #db_host = 'bpcweb7'
        args.NODE_DATABASE = 'vamps2'
        db_home = '/groups/vampsweb/vampsdev/'
        args.files_home ='/groups/vampsweb/vampsdev_node_data/json/vamps2--datasets_silva119/'
    else:
        db_host = 'localhost'
        db_home = '~/'
        args.files_home ='public/json/vamps_development--datasets_silva119/'
    db_name = args.NODE_DATABASE


    print (db_host, db_name)

    home = expanduser("~")
    print(home)
    args.obj = MySQLdb.connect( host=db_host, db=db_name, read_default_file=home+'/.my.cnf_node', cursorclass=MySQLdb.cursors.DictCursor    )

    output_dir = args.base

    
    args.dids = args.dids.strip('"').split(',')
    args.pids = args.pids.strip('"').split(',')
    args.domains = args.domains.strip('"').split(',')
    args.domains = [x.strip() for x in args.domains]
    args.dids = [x.strip() for x in args.dids]
    args.pids = [x.strip() for x in args.pids]
    if args.dco_metadata or args.metadata1 or args.metadata2:
        args.dataset_name_collector = get_dataset_names(args)
        #print 'args.dataset_name_collector'
        #print args.dataset_name_collector
    
    (args.max, args.dataset_counts) = get_dataset_counts(args)
    args.datasets = args.dataset_counts.keys()
    print ('max', args.max)
    print ('max2', args.dataset_counts)
    
    
#     args.dc_sql_rows   = []
#     args.seqs_sql_rows = []
#     if args.taxbytax:
#         args.dc_sql_rows = get_dc_result_from_db(args)
#     if args.taxbyref or args.taxbyseq:
#         args.seqs_sql_rows = get_seqs_result_from_db(args)
    #sys.exit()
    if args.dco_metadata:
        run_metadata(args, 'datasets_as_rows', 'dco_bulk')
        #run_dco_metadata(args)
    else:
        if args.metadata1:
            run_metadata(args, 'datasets_as_rows')
        if args.metadata2:
            run_metadata(args, 'metadata_as_rows')
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

    print('Finished')
