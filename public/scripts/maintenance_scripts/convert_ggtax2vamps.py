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
from stat import * # ST_SIZE etc
import sys
import shutil
import types
#import random
#import csv
from time import sleep

import datetime



def convert_tax(args):
    """

    """
    infile  = args.infile
    outfile = "gg-vamps.tax"
    taxout_fh = open(outfile,'w')

    seq_lookup={}
    id_lookup={}
    id=''
    c = 0
    for line in open(infile,'r'):
        
        items=line.strip().split('\t')
        id = items[0]
        temp_tax = items[1]


        #count = i[2]
        temp_tax_list = temp_tax.split(';')
        new_tax_str = ''
        for n in temp_tax_list:
            pre = n.strip()[:3]
            item = n.strip()[3:]
            if pre == 'k__':
                if item:
                    new_tax_str += item+';'
                else:
                    #new_tax_str += 'domain_NA;'
                    pass
            if pre == 'p__':
                if item:
                    new_tax_str += item+';'
                else:
                    #new_tax_str += 'phylum_NA;'
                    pass
            if pre == 'c__':
                if item:
                    new_tax_str += item+';'
                else:
                    #new_tax_str += 'class_NA;'
                    pass
            if pre == 'o__':
                if item:
                    new_tax_str += item+';'
                else:
                    #new_tax_str += 'order_NA;'
                    pass
            if pre == 'f__':
                if item:
                    new_tax_str += item+';'
                else:
                    #new_tax_str += 'family_NA;'
                    pass
            if pre == 'g__':
                if item:
                    new_tax_str += item+';'
                else:
                    #new_tax_str += 'genus_NA;'
                    pass
            if pre == 's__':
                if item:
                    new_tax_str += item+';'
                else:
                    #new_tax_str += 'species_NA;'
                    pass
        #new_tax_str += 'strain_NA'
        new_tax_str = new_tax_str[:-1]
        #print id,temp_tax
        taxout_fh.write(id+"\t"+new_tax_str+"\t1\n")
        #print id,new_tax_str



if __name__ == '__main__':
    import argparse

    # DEFAULTS
   


    myusage = """usage: convert_ggtax2vamps.py [options]

         Load user sequences into the database

         where
            -i, --infile The name of the input file file.  [required]

           

    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)
    parser.add_argument('-i', '--infile',       required=True, action="store",   dest = "infile",
                                                    help = '')
    #parser.add_argument('-s', '--separator',       required=True, action="store",   dest = "sep",
    #                                                help = '')



    data_object = {}

    args = parser.parse_args()



    convert_tax(args)

