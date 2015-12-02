#!/usr/bin/env python

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
import random
import re
import logging
import csv
from time import sleep
import ConfigParser
from IlluminaUtils.lib import fastalib
#sys.path.append( '/bioware/python/lib/python2.7/site-packages/' )

import datetime
today = str(datetime.date.today())
import subprocess
import MySQLdb

"""

"""
# Global:
#NODE_DATABASE = "vamps_js_dev_av"
#NODE_DATABASE = "vamps_js_development"
# CONFIG_ITEMS = {}
# CONFIG_ITEMS["datasets"] = []
# DATASET_ID_BY_NAME = {}
# REQ_METADATA_ITEMS = {}
# CUST_METADATA_ITEMS = {}

#required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "public","taxon_id","description","common_name"];

#test = ('434','0','y','1/27/14','0','GAZ:Canada','167.5926056','ENVO:urban biome','ENVO:human-associated habitat','ENVO:feces','43.119339','-79.2458198','y',
#'408170','human gut metagenome','American Gut Project Stool sample')
#test7 = ('434','ENVO:urban biome','ENVO:human-associated habitat','ENVO:feces','43.119339','-79.2458198','y')
##############
# fail with the following:
dataset_pattern = '\s|--|>|<|;|@|!|#|\$|%|\^|&|\*|\(|\)|\|/?|,|~|`|\"|\'|[|]|{|}|\\|\|'
sequence_pattern = re.compile('[^AGTC]', re.IGNORECASE)
#
#  Illumina-seqid sample:  HWI-M00888:59:000000000-A62ET:1:1101:9364:6850 1:N:0:GACCGTAAACTC
#                           @M10_68:1:1:28680:29475#0/1
id_pattern = re.compile(r"[^0-9A-Z_.:\-\#\@]", re.IGNORECASE)  
errors = ['ERROR']
notes = ['OK']


     
def start_fasta_single(infile):
    """
    Check defline format
    >seqid|otherstuff
    Check sequences for ATGC only
    """
    
    f = fastalib.SequenceSource(infile)
    count = 1
    while f.next():
        line_no = count*2
        id = f.id.split()[0].split('|')[0]  # <space> and bar '|' are the ONLY two dividers allowed
        #print id
        seq = f.seq
        #print seq
        if re.search(id_pattern, id):
            errors.append('ERROR: SeqID ('+id+') contains bad character(s) about line '+str(line_no))    
        if re.search(sequence_pattern, seq):
            errors.append('ERROR: Sequence (id='+id+') contains bad character(s) on about line '+str(line_no))    

        count +=1


    if len(errors) > 1:
        return errors
    else:
        return notes+['OK -- File Validates']
    
def start_fasta_multi(infile):
    """
    Check defline format
    >dsname|seqid|otherstuff
    Check sequences for ATGC only
    """
    
    f = fastalib.SequenceSource(infile)
    datasets_hash = {}
    all_seq_count = 0
    id_has_seq_count = False
    count_style_flip = 0
    while f.next():
        defline = f.id.split()
        if len(defline) > 1:
            #dataset_items = defline[0]      
            ds_items =   defline[0].split('_')  
            #print len(ds_items),ds_items[-1]
            if len(ds_items) > 1:
                try:    # ie: 10056.000009544_123294 
                    this_seq_count = int(ds_items[-1])
                    dataset = '_'.join(ds_items[:-1])   # join in case there were multiple '_' instances
                    if id_has_seq_count == False:
                        count_style_flip += 1
                    id_has_seq_count = True
                except:   # ie: 10056.000009544 
                    this_seq_count = 1
                    dataset = defline[0]
                    if id_has_seq_count == True:
                        count_style_flip += 1
                    id_has_seq_count = False
            else:
                this_seq_count = 1
                dataset = defline[0]
                


            #print dataset
            datasets_hash[dataset]=1            
            id      = defline[1]  # <space> and bar '|' are the ONLY two dividers
            seq = f.seq
             
        else:
            errors.append('ERROR: This file has the wrong format') 
            break
        all_seq_count += 1
    #print 'flip',count_style_flip
    if count_style_flip >1:
        errors.append('ERROR: id style varied from "no count" to "count" too many times') 
    #print all_seq_count
    #print len(datasets_hash)
    if all_seq_count == len(datasets_hash):
        errors.append("ERROR: Looks like the number of datasets equals the number of sequences -- that can't be right. Maybe this is a single-dataset style fasta file?")    
    else:
        notes.append('Good: dataset count is: '+str(len(datasets_hash)))
        notes.append('Good: sequence count is: '+str(all_seq_count))


    if len(errors) > 1:
        return errors
    else:
        return notes+['OK -- File Validates']

def start_metadata_vamps(infile):
    """
    VAMPS Style Metadata file
    No provisions for comments
    -- Done: Check if can open/read file
    -- Done: Error if less than 3 headers (indicating non tab-delimited)
    -- Done: Required headers: dataset, parameterValue and structured_comment_name
    -- Done: Check that each row has same number of columns as header row
    -- Done: Error if dataset field is empty
    -- Done: Warn if parameterValue is empty
    -- Done: Error if structured_comment_name value is empty
    -- Done: Check dataset names format check

    """
    
    
    dataset_index                 = -1
    parameterValue_index          = -1
    structured_comment_name_index = -1
    #print 'csv',infile
    logging.info('csv '+infile)
    try:
        lol = list(csv.reader(open(infile, 'rb'), delimiter='\t'))
    except:
        errors.append("ERROR: System: Could not open csv file")
    keys = lol[0]
    keys_length = len(keys)

    if keys_length < 3:
        errors.append("ERROR: Less than three columns found. Please review file formats.")
    try:        
        dataset_index = keys.index('dataset')        
        notes.append('Good: found "dataset" column')
    except:
        errors.append('ERROR: Could not find "dataset" column')
    try:                 
         parameterValue_index = keys.index('parameterValue')         
         notes.append('Good: found "parameterValue" column')
    except:
        errors.append('ERROR: Could not find "parameterValue" column')
    try:              
        structured_comment_name_index = keys.index('structured_comment_name')        
        notes.append('Good: found "structured_comment_name" column')
    except:
        errors.append('ERROR: Could not find "structured_comment_name" column')
    #print parameterValue_index
    for i,line in enumerate(lol[1:]):
        row = str(i+2)

        if len(line) != keys_length:
            errors.append("ERROR: Row '"+row+"' column count doesn\'t match the column count for the header row: "+str(keys_length))
        if dataset_index in line and line[dataset_index] == '':
            errors.append('ERROR: dataset field is empty on line '+row)
        if parameterValue_index in line and line[parameterValue_index] == '':
            notes.append('Warning: parameterValue is empty on line '+row)
        if structured_comment_name_index in line and line[structured_comment_name_index] == '':
            errors.append('ERROR: structured_comment_name is empty on line '+row)
        if dataset_index in line:
            dataset = line[dataset_index]
            if re.search(dataset_pattern, dataset):
                errors.append('ERROR: dataset name ('+dataset+') format fails')

    if len(errors) > 1:
        return errors
    else:
        return notes+['OK -- File Validates']

def start_metadata_qiime(infile):
    """
        -- Done: Check for empty key (header) name
        -- Done: Check if can open/read file
        -- Done: must be tab delimited file: keys.length == 1
        -- Done: must have same number of columns in every row and match keys count
        -- Done: must find either #SampleID, sample_name or dataset_name
        -- Done: no empty dataset_names
        -- Done: dataset_names format check
        -- Done: Should be unique dataset names
        -- Done: warn for empty parameter value
    """
    
    
    ds_index = -1
    #print 'csv',infile
    logging.info('csv '+infile)
    try:
        lol = list(csv.reader(open(infile, 'rb'), delimiter='\t'))
    except:
        errors.append("ERROR: System: Could not open csv file")
    
    # errors:
    # count of headers is different in line
    # there is no   
    keys = lol[0]
    if '' in keys:
        errors.append("ERROR: Empty header name found")
        print keys
    keys_length = len(keys)
    notes.append('Info: Found '+str(keys_length)+' columns')
    if keys_length == 1:
        errors.append("ERROR: Only one column found which may be correct, but could indicate that something other than tabs were used as delimiters")
    
    #print keys,keys_length

    
    try:
        #saved_indexes.append(TMP_METADATA_ITEMS['#SampleID'].index(ds))
        
        ds_index = keys.index('#SampleID')
        dataset_header_name = '#SampleID'
        notes.append('Good: found "#SampleID" at column '+str(ds_index+1))
    except:
         try:
             #saved_indexes.append(TMP_METADATA_ITEMS['sample_name'].index(ds))
             
             ds_index = keys.index('sample_name')
             dataset_header_name = 'sample_name'
             notes.append('Good: found "sample_name" at column '+str(ds_index+1))
         except:
            try:              
                ds_index = keys.index('dataset_name')
                dataset_header_name = 'dataset_name'
                notes.append('Good: found "dataset_name" at column '+str(ds_index+1))
            except:
                errors.append('ERROR: Could not find "#SampleID", "sample_name" or "dataset_name" in the header (first) row')
    #print ds_index,   dataset_header_name         
    ds_lookup = {}
    line_count = len(lol[1:])
    for i,line in enumerate(lol[1:]):
        row = str(i+2)

        if len(line) != keys_length:
            errors.append("ERROR: Row '"+row+"' column count doesn\'t match the column count for the header row: "+str(keys_length))
        if len(line) > ds_index:
            dataset = line[ds_index]
            #print ds_index,dataset
            if dataset == '':
                errors.append('ERROR: dataset field is empty on line '+row)
            if re.search(dataset_pattern, dataset):
                errors.append('ERROR: dataset name ('+dataset+') format fails')
            
            for k in line:
                if k == '':
                    notes.append('Warning: empty value found on line '+row)

            ds_lookup[dataset] = 1
    num_datasets = len(ds_lookup)

    #print num_datasets,len(ds_lookup)
    #print ds_lookup

    if num_datasets > line_count:
        errors.append('ERROR: there are more dataset_names than lines')
    elif num_datasets < line_count:
        errors.append('ERROR: Duplicate dataset names found')
    

    if len(errors) > 1:
        return errors
    else:
        return notes+['OK -- File Validates']


    
if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: vamps_script_validate.py  [options]
         
         
         where
            
            -i/--infile            
                     

            -ft/--file_type  file type: fasta or metadata

            
            -s/--style  fasta: single or multi 
                        metadata: vamps or qiime
     
    
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
                                        
    parser.add_argument("-i", "--infile",          
                required=True,  action='store', dest = "infile", 
                help="") 
                            
    parser.add_argument("-ft", "--file_type",          
                required=True,  action='store', dest = "file_type", 
                help="metadata or fasta")  
    
    parser.add_argument('-s', '--style',         
                required=True,   action="store",  dest = "style",            
                help = 'vamps or qiime OR single or multi') 

    parser.add_argument("-process_dir", "--process_dir",    
                required=False,  action="store",   dest = "process_dir", default='',
                help = '')

    args = parser.parse_args()    
   
    if args.file_type != 'fasta' and args.file_type != 'metadata':
        print('file type must be fasta or metadata')
        sys.exit(-201)
    if args.file_type == 'fasta':
        if args.style != 'single' and args.style != 'multi':
            print('style must be single or multi for fasta files')
            sys.exit(-202)
    if args.file_type == 'metadata':
        if args.style != 'qiime':
            print('style must be vamps or qiime for metadata files')
            sys.exit(-203)

    
    args.datetime     = str(datetime.date.today())        
    
    
    if args.file_type == 'fasta' and args.style == 'single':
        result = start_fasta_single(args.infile)
    elif args.file_type == 'fasta' and args.style == 'multi':
        result = start_fasta_multi(args.infile)
    #elif args.file_type == 'metadata' and args.style == 'vamps':
    #    result = start_metadata_vamps(args.infile)
    elif args.file_type == 'metadata' and args.style == 'qiime':
        result = start_metadata_qiime(args.infile)
    else:
        print('ERROR - no file type or style info found')
        sys.exit(-217)
    print result

  
            
    
        
