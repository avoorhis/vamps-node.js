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
"""
TODO:
*) add benchmarks

*) cd vamps-node.js/public/scripts/maintenance_scripts; time python old_to_new_vamps_by_project.py -s sequences.csv -m metadata.csv -owner admin -p "ICM_AGW_Bv6"

*) Utils, connection - classes for all

*)
mysql -B -h vampsdb vamps -e "SELECT * FROM vamps_metadata where project='DCO_BOM_Bv6';" |sed "s/'/\'/;s/\t/\"\t\"/g;s/^/\"/;s/$/\"/;s/\n//g" > metadata.csv
mysql -B -h vampsdb vamps -e "SELECT * FROM vamps_sequences where project='DCO_BOM_Bv6';" |sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > sequences.csv
mysql -B -h vampsdb vamps -e "SELECT * FROM vamps_sequences_pipe where project='DCO_BOM_Bv6';" |sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > sequences.csv

vamps_sequences & vamps_sequences_pipe:
sequence, project, dataset, taxonomy, refhvr_ids, rank, seq_count, frequency, distance, rep_id, project_dataset, 

vamps_metadata:
parameterName, parameterValue, units, miens_units, project, units_id, structured_comment_name, method, other, notes, ts, entry_date, parameter_id, project_dataset

*) beforehand
TODO: create from a file, not from db? See the original script
access
classifier
dataset
domain
env_sample_source
family
genus
gg_otu
gg_taxonomy
klass
oligotype
order
phylum
project
rank
# ref_silva_taxonomy_info_per_seq_refhvr_id
# refhvr_id
# sequence
# sequence_pdr_info
# sequence_uniq_info
# silva_taxonomy
# silva_taxonomy_info_per_seq
species
strain
user
user_project
user_project_status

1) on a server:
mysqldump -u ashipunova -h vampsdb vamps2 access classifier dataset domain env_sample_source family genus gg_otu gg_taxonomy klass oligotype order phylum project rank species strain user user_project user_project_status >vampsdb_vamps2_part1.sql
2) on local:
scp -r ashipunova@jake:/users/ashipunova/vampsdb_vamps2_part1.sql .
vampsdb_vamps2_part1.sql                                          100% 1227KB   1.2MB/s   00:00    
mysql -u root -p vamps2 <vampsdb_vamps2_part1.sql

*) from sequences.csv
sequence, project, dataset, taxonomy, refhvr_ids, rank, seq_count, frequency, distance, rep_id, project_dataset 

dataset
domain
family
genus
gg_otu
gg_taxonomy
klass
oligotype
order
phylum
project
! ref_silva_taxonomy_info_per_seq_refhvr_id
! refhvr_id
! sequence
! sequence_pdr_info
! sequence_uniq_info
! silva_taxonomy
! silva_taxonomy_info_per_seq
species
strain

*) read and parse csv
*) make dictionaries
*) insert ignore into 
**) simple tables 
**) tables with foreign keys
**) ref tables
  
  ---
***) simple tables:
    domain
    family
    genus
    klass
    order
    phylum
    refhvr_id
    sequence
    silva_taxonomy
    species
    strain

***) tables with foreign keys (SELECT distinct referenced_table_name FROM information_schema.KEY_COLUMN_USAGE WHERE table_schema = "vamps2" and referenced_table_schema = "vamps2";):
    project
    dataset
    sequence_pdr_info
    silva_taxonomy
    sequence_uniq_info
  
***) ref tables
    ref_silva_taxonomy_info_per_seq_refhvr_id
    silva_taxonomy_info_per_seq

*)
from metadata.csv
  required_metadata_info
  custom_metadata_fields
  custom_metadata_#

"""
import csv


class Mysql_util:
    """
    Connection to vamps or vampsdev

    Takes parameters from ~/.my.cnf_node, default host = "vampsdev", db="vamps2"
    if different use my_conn = Mysql_util(host, db)
    """
    def __init__(self, host="bpcweb7", db="vamps2"):
        self.utils  = Utils()        
        self.conn   = None
        self.cursor = None
        self.rows   = 0
        self.new_id = None
        self.lastrowid = None
        
        try:           
            self.utils.print_both("=" * 40)
            self.utils.print_both("host = " + str(host) + ", db = "  + str(db))
            self.utils.print_both("=" * 40)

            if self.utils.is_local():
              self.conn = MySQLdb.connect(host=host, db=db, read_default_file=os.path.expanduser("~/.my.cnf_local"))
            else:       
              self.conn = MySQLdb.connect(host=host, db=db, read_default_file=os.path.expanduser("~/.my.cnf_node"))
              # self.db = MySQLdb.connect(host="localhost", # your host, usually localhost
              #                          read_default_file="~/.my.cnf_node"  )
              # cur = db.cursor()
            self.cursor = self.conn.cursor()
            # self.escape = self.conn.escape()
                   
        except MySQLdb.Error, e:
            self.utils.print_both("Error %d: %s" % (e.args[0], e.args[1]))
            raise
        except:                       # catch everything
            self.utils.print_both("Unexpected:")
            self.utils.print_both(sys.exc_info()[0])
            raise                       # re-throw caught exception   

    def execute_fetch_select(self, sql):
        if self.cursor:
          try:
            self.cursor.execute(sql)
            res = self.cursor.fetchall ()
          except:
            self.utils.print_both(("ERROR: query = %s") % sql)
            raise
          return res

    def execute_no_fetch(self, sql):
        if self.cursor:
            self.cursor.execute(sql)
            self.conn.commit()
#            if (self.conn.affected_rows()):
#            print dir(self.cursor)
            return self.cursor.lastrowid
#        logging.debug("rows = "  + str(self.rows))
       
    def get_all_name_id(self, table_name):
        id_name = table_name + '_id'
        my_sql  = """SELECT %s, %s FROM %s""" % (table_name, id_name, table_name)
        res     = self.execute_fetch_select(my_sql)
        if res:
          return res

class Utils:
    def __init__(self):
        pass          
    
    def is_local(self):
        print os.uname()[1]
        dev_comps = ['ashipunova.mbl.edu', "as-macbook.home", "as-macbook.local", "Ashipunova.local", "Annas-MacBook-new.local", "Annas-MacBook.local"]
        if os.uname()[1] in dev_comps:
            return True
        else:
            return False
            
    def is_vamps(self):
        print os.uname()[1]
        dev_comps = ['bpcweb8','bpcweb7','bpcweb7.bpcservers.private', 'bpcweb8.bpcservers.private']
        if os.uname()[1] in dev_comps:
            return True
        else:
            return False
            
    def print_both(self, message):
        print message
        logging.debug(message)
    
    def print_array_w_title(self, message, title = 'message'):
      print title
      print message
    
    def read_csv_into_list(self, file_name):
      return list(csv.reader(open(seq_csv_file_name, 'rb'), delimiter=','))[1:]


class Seq_csv:
  # id, sequence, project, dataset, taxonomy, refhvr_ids, rank, seq_count, frequency, distance, rep_id, project_dataset
  # parse
  # upload
  """   
  TODO: 
    get host and db dynamically, from args
    make one connection, in main?
  """  
  # def __init__(self, host = "localhost", db = "vamps2", seq_csv_file_name):
  def __init__(self, seq_csv_file_name):
    self.utils  = Utils()        
    # self.mysql_util = Mysql_util(host = host, db = db)
    
    # self.mysql_util = Mysql_util(mysql_conn)
    # self.cursor = db.cursor()
    self.seqs_file_content    = self.utils.read_csv_into_list(seq_csv_file_name)
    self.project_dataset_dict = self.make_project_dataset_dictionary()
    # self.seq_list             = self.make_seq_list()
    content_by_field = self.content_matrix_transposition()
    self.sequences  = content_by_field[1]
    self.projects   = content_by_field[2]
    self.datasets   = content_by_field[3]
    self.taxa       = content_by_field[4]
    self.refhvr_ids = content_by_field[5]
    self.the_rest   = content_by_field[6:]
    print "RRR"
    
    self.utils.print_array_w_title(self.sequences, "self.sequences")
    self.utils.print_array_w_title(self.projects, "self.projects")
    self.utils.print_array_w_title(self.datasets, "self.datasets")
    self.utils.print_array_w_title(self.taxa, "self.taxa")
    self.utils.print_array_w_title(self.refhvr_ids, "self.refhvr_ids")
    self.utils.print_array_w_title(self.the_rest, "self.the_rest")

    

    # self.utils.print_array_w_title(list(self.seqs_file_content))
    # [['306177', 'CGGAGAGACAGCAGAATGAAGGTCAAGCTGAAGACTTTACCAGACAAGCTGAG', 'ICM_SMS_Bv6', 'SMS_0001_2007_09_19', 'Archaea;Thaumarchaeota', 'v6_AE885 v6_AE944 v6_AE955', 'phylum', '7', '0.000476028561713702', '0.00000', 'FL6XCJ201BJIND', 'ICM_SMS_Bv6--SMS_0001_2007_09_19'],
    
    # print "MMM"
    # print type(self.seqs_file_content)
    # <type '_csv.reader'>
        
    # self.parse_taxonomy()
    # self.parse_refhvr_ids()
    
  def make_project_dataset_dictionary(self):
    return {val[3]: val[2] for val in self.seqs_file_content}

  def make_seq_list(self):
    return [val[1] for val in self.seqs_file_content]

  def content_matrix_transposition(self):
    # self.sequences, self.projects, self.datasets, self.taxa, self.refhvr_ids, self.the_rest =  zip(*self.seqs_file_content)
    return zip(*self.seqs_file_content)
    
  
    """
    ***) simple tables:
        domain
        family
        genus
        klass
        order
        phylum
        refhvr_id
        sequence
        silva_taxonomy
        species
        strain

    ***) tables with foreign keys (SELECT distinct referenced_table_name FROM information_schema.KEY_COLUMN_USAGE WHERE table_schema = "vamps2" and referenced_table_schema = "vamps2";):
        project
        dataset
        sequence_pdr_info
        silva_taxonomy
        sequence_uniq_info
  
    ***) ref tables
        ref_silva_taxonomy_info_per_seq_refhvr_id
        silva_taxonomy_info_per_seq
    
    """
    


class Metadata_csv:
  #parameterName, parameterValue, units, miens_units, project, units_id, structured_comment_name, method, other, notes, ts, entry_date, parameter_id, project_dataset
  # parse
  # upload
  pass

if __name__ == '__main__':
  #TODO: args
  seq_csv_file_name      = "sequences_ICM_SMS_Bv6_short.csv"
  metadata_csv_file_name = "metadata_ICM_SMS_Bv6_short.csv"
  seq_csv_parser = Seq_csv(seq_csv_file_name)
  # seq_csv_parser.make_project_dataset_dictionary()
  

  #
  # mysql_conn = MySQLdb.connect(host="localhost", # your host, usually localhost
  #                       db = NODE_DATABASE,
  #                       read_default_file="~/.my.cnf_node"  )
  # cur = mysql_conn.cursor()
  # my_class           = Old_vamps_data(mysql_conn)