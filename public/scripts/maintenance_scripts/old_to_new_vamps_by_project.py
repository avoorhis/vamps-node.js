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
*) split into smaller classes - by table
*) add benchmarks
    t0 = time.time()
    t1 = time.time()
    total = t1-t0
    print "total = %s" % total

  or
  wrapped = self.utils.wrapper(func, arg)
  time_res = timeit.timeit(wrapped, number=1)
  

*) cd vamps-node.js/public/scripts/maintenance_scripts; time python old_to_new_vamps_by_project.py -s sequences.csv -m metadata.csv -owner admin -p "ICM_AGW_Bv6"

*) Utils, connection - classes for all

*)
mysql -B -h vampsdb vamps -e "SELECT * FROM vamps_metadata where project='ICM_SMS_Bv6';" |sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > metadata_ICM_SMS_Bv6.csv

mysql -B -h vampsdb vamps -e "SELECT * FROM vamps_sequences where project='ICM_SMS_Bv6';" |sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > sequences_ICM_SMS_Bv6.csv
mysql -B -h vampsdb vamps -e "SELECT * FROM vamps_sequences_pipe where project='ICM_SMS_Bv6';" |sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > sequences_ICM_SMS_Bv6.csv

mysql -B -h vampsdb vamps -e "SELECT project, title, project_description, funding, env_sample_source_id, contact, email, institution FROM new_project LEFT JOIN new_contact using(contact_id) WHERE project='ICM_SMS_Bv6';" | sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > project_ICM_SMS_Bv6.csv 
mysql -B -h vampsdb vamps -e "SELECT project, title, project_description, funding, env_sample_source_id, contact, email, institution FROM new_project LEFT JOIN new_contact using(contact_id) WHERE project='ICM_SMS_Bv6';" | sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > project_ICM_SMS_Bv6.csv 

mysql -B -h vampsdb vamps -e "SELECT distinct contact, user as username, email, institution, first_name, last_name, active, security_level, passwd as encrypted_password from new_user_contact join new_user using(user_id) join new_contact using(contact_id) where first_name is not NULL and first_name <> '';" | sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" >> user_contact.csv

dataset: 
vamps_publications_datasets ? (ask Andy)
new_dataset
needed: dataset, dataset_description, env_sample_source_id, project_id

mysql -B -h vampsdb vamps -e "SELECT distinct dataset, dataset_description, env_sample_source_id, project from new_dataset join new_project using(project_id) WHERE project = 'ICM_SMS_Bv6';" | sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > dataset.csv

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
    user

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
import MySQLdb
import logging
import sys
import os
import timeit
import time
# from collections import defaultdict


class Mysql_util:
    """
    Connection to vamps or vampsdev

    Takes parameters from ~/.my.cnf_node, default host = "vampsdev", db="vamps2"
    if different use my_conn = Mysql_util(host, db)
    """
    def __init__(self, host="bpcweb7", db="vamps2"):
        self.utils     = Utils()        
        self.conn      = None
        self.cursor    = None
        self.rows      = 0
        self.new_id    = None
        self.lastrowid = None
        self.rowcount  = None
        
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
      # print "+" * 20
      # print sql
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

    def execute_insert(self, table_name, field_name, val_list, ignore = "IGNORE"):
      try:      
        sql = "INSERT %s INTO `%s` (`%s`) VALUES (%s)" % (ignore, table_name, field_name, val_list)
        
        if self.cursor:
          self.cursor.execute(sql)
          self.conn.commit()
          return (self.cursor.rowcount, self.cursor.lastrowid)
      except:
        self.utils.print_both(("ERROR: query = %s") % sql)
        raise
       
    # def get_all_name_id(self, table_name):
    #   id_name = table_name + '_id'
    #   my_sql  = """SELECT %s, %s FROM %s""" % (table_name, id_name, table_name)
    #   res     = self.execute_fetch_select(my_sql)
    #   if res:
    #     return res
        
    def execute_simple_select(self, field_name, table_name, where_part):
      id_query  = "SELECT %s FROM %s %s" % (field_name, table_name, where_part)
      return self.execute_fetch_select(id_query)
      
    def get_id(self, field_name, table_name, where_part, rows_affected = [0,0]):
      self.utils.print_array_w_title(rows_affected, "=====\nrows_affected from def get_id")
    
      if rows_affected[1] > 0:
        id_result = int(rows_affected[1])
      else:
        # id_query  = "SELECT %s FROM %s %s" % (field_name, table_name, where_part)
        # id_result = int(self.mysql_util.execute_fetch_select(id_query)[0][0])
    
        id_result = int(self.execute_simple_select(field_name, table_name, where_part)[0][0])
        
      # self.utils.print_array_w_title(id_result, "=====\nid_result IN")
      return id_result
    

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
      return list(csv.reader(open(file_name, 'rb'), delimiter=','))[1:]

    def flatten_2d_list(self, list):
      return [item for sublist in list for item in sublist]
      
    def wrapper(self, func, *args, **kwargs):
        def wrapped():
            return func(*args, **kwargs)
        return wrapped
    
    def search_in_2d_list(self, search, data):
      for sublist in data:
        if search in sublist:
          return sublist
          break


class Taxonomy:
  def __init__(self, taxa_content, mysql_util):
    self.utils      = Utils() 
    #TODO: make dynamic by checking if it's local
    # self.mysql_util = Mysql_util(host = 'localhost', db="vamps2")
    
    self.ranks = ['domain', 'phylum', 'klass', 'order', 'family', 'genus', 'species', 'strain']
    self.taxa_list_w_empty_ranks = []
    self.taxa_content = taxa_content
    self.mysql_util   = mysql_util
    
  def get_taxa_by_rank(self):
    return zip(*self.taxa_list_w_empty_ranks)
    
  def parse_taxonomy(self):
    taxa_list = [taxon_string.split(";") for taxon_string in self.taxa_content]
    self.taxa_list_w_empty_ranks = [l + [""] * (len(self.ranks) - len(l)) for l in taxa_list]

  def insert_taxa(self):
    taxa_by_rank = self.get_taxa_by_rank()
        
    """
    TODO: make all queries, then insert all? Benchmark!
    """
    for rank in self.ranks:
      self.utils.print_array_w_title(rank, "rank")
      rank_num = self.ranks.index(rank)
      # self.utils.print_array_w_title(rank_num, "self.ranks.index(rank)")
      
      uniqued_taxa_by_rank = set(taxa_by_rank[rank_num])
      
      insert_taxa_vals = '), ('.join(["'%s'" % key for key in uniqued_taxa_by_rank])
      # self.utils.print_array_w_title(insert_taxa_vals, "insert_taxa_vals")

      rows_affected = self.mysql_util.execute_insert(rank, rank, insert_taxa_vals)
      self.utils.print_array_w_title(rows_affected[0], "rows affected by self.mysql_util.execute_insert(%s, %s, insert_taxa_vals)" % (rank, rank))
      
class Refhvr_id:

  def __init__(self, refhvr_id, mysql_util):
    self.utils      = Utils() 
    self.mysql_util = mysql_util
    self.refhvr_id  = refhvr_id
    
    self.all_refhvr_id   = set()
    self.refhvr_id_lists = []
    
  def parse_refhvr_id(self):    
    for r_id in self.refhvr_id:      
      refhvr_id_list = r_id.split()
      self.refhvr_id_lists.append(refhvr_id_list)
  
    # self.refhvr_id_lists = [r_id.split() for r_id in self.refhvr_id]
    #slightly slower
  
    self.all_refhvr_id = set(self.utils.flatten_2d_list(self.refhvr_id_lists))

  def insert_refhvr_id(self):
    insert_refhvr_id_vals = '), ('.join(["'%s'" % key for key in self.all_refhvr_id])
    # self.utils.print_array_w_title(insert_refhvr_id_vals, "===\ninsert_refhvr_id_vals")
    rows_affected = self.mysql_util.execute_insert("refhvr_id", "refhvr_id", insert_refhvr_id_vals)
    self.utils.print_array_w_title(rows_affected[0], "rows affected by self.mysql_util.execute_insert(refhvr_id, refhvr_id, insert_refhvr_id_vals)")
    
class User:
  def __init__(self, contact, user_contact_csv_file_name, mysql_util):
    self.utils      = Utils() 
    self.mysql_util = mysql_util
    self.user_contact_file_content = []
    self.user_id    = ""
    self.contact    = contact
    self.user_contact_csv_file_name = user_contact_csv_file_name
    
    self.parse_user_contact_csv(self.user_contact_csv_file_name)
    self.user_data = self.utils.search_in_2d_list(self.contact, self.user_contact_file_content)    
    self.utils.print_array_w_title(self.user_data, "===\nSSS self.user_data in User")

    # rows_affected = self.insert_user()
    # self.user_id = self.get_id(rows_affected, "user_id", "user", "WHERE username = '%s'" % (self.user_data[1]))
    #
    # self.utils.print_array_w_title(self.user_id, "===\nSSS self.user_id after get_id")
    
    
    # self.utils.print_array_w_title(list(self.seqs_file_content))
    # [['306177', 'CGGAGAGACAGCAGAATGAAGGTCAAGCTGAAGACTTTACCAGACAAGCTGAG', 'ICM_SMS_Bv6', 'SMS_0001_2007_09_19', 'Archaea;Thaumarchaeota', 'v6_AE885 v6_AE944 v6_AE955', 'phylum', '7', '0.000476028561713702', '0.00000', 'FL6XCJ201BJIND', 'ICM_SMS_Bv6--SMS_0001_2007_09_19'],
    
  def get_user_id(self, username):
    #TODO: make general for user, project etc.
    user_id_query = "SELECT user_id FROM user WHERE username = '%s'" % (username)
    return self.mysql_util.execute_fetch_select(user_id_query)
 
  def parse_user_contact_csv(self, user_contact_csv_file_name):
    self.user_contact_file_content = self.utils.read_csv_into_list(user_contact_csv_file_name)
    # self.utils.print_array_w_title(self.user_contact_file_content, "===\nself.user_contact_file_content BBB")
    
  def insert_user(self):
    field_list    = "username`, `email`, `institution`, `first_name`, `last_name`, `active`, `security_level`, `encrypted_password"
    insert_values = ', '.join(["'%s'" % key for key in self.user_data[1:]])
    
    rows_affected = self.mysql_util.execute_insert("user", field_list, insert_values)
    self.user_id  = self.mysql_util.get_id("user_id", "user", "WHERE username = '%s'" % (self.user_data[1]), rows_affected)
  
class Project:
  
  def __init__(self, mysql_util):
    self.utils      = Utils() 
    self.mysql_util = mysql_util
    self.contact    = ""
    self.project_id = ""
    self.user_id    = ""
    
  def parse_project_csv(self, project_csv_file_name):
    # "project","title","project_description","funding","env_sample_source_id","contact","email","institution"
    
    self.project_file_content = self.utils.read_csv_into_list(project_csv_file_name)
    # self.utils.print_array_w_title(self.project_file_content, "===\nself.project_file_content AAA")
    self.contact = self.project_file_content[0][5]
    
  def insert_project(self, user_id):
    project, title, project_description, funding, env_sample_source_id, contact, email, institution = self.project_file_content[0]
    
    field_list       = "project`, `title`, `project_description`, `rev_project_name`, `funding`, `owner_user_id"
    insert_values = ', '.join("'%s'" % key for key in [project, title, project_description])
    insert_values += ", REVERSE('%s'), '%s', %s" % (project, funding, user_id)

    # sql = "INSERT %s INTO `%s` (`%s`) VALUES (%s)" % ("ignore", "project", field_list, insert_values)
    # self.utils.print_array_w_title(sql, "sql")
        
    rows_affected = self.mysql_util.execute_insert("project", field_list, insert_values)
    
    self.project_id = self.mysql_util.get_id("project_id", "project", "WHERE project = '%s'" % (project), rows_affected)
    # self.utils.print_array_w_title(self.project_id, "===\nSSS self.project_id after get_id")
    
    # self.utils.print_array_w_title(rows_affected[0], "rows affected by self.mysql_util.execute_insert('project', field_list, insert_values)")
    # self.utils.print_array_w_title(rows_affected[1], "last_id by self.mysql_util.execute_insert('project', field_list, insert_values)")
    # return rows_affected
    
    # if rows_affected[1] > 0:
    #   self.project_id = rows_affected[1]
    # else:
    #   self.project_id = int(self.get_project_id(self.project_data[1])[0][0])
    # self.utils.print_array_w_title(self.project_id, "self.project_id")
        
    # print set(self.projects)

class Dataset:
  def __init__(self, mysql_util):
   self.utils      = Utils() 
   self.mysql_util = mysql_util

  def parse_dataset_csv(self, dataset_csv_file_name):
   # "dataset","dataset_description","env_sample_source_id","project"
   
   self.dataset_file_content = self.utils.read_csv_into_list(dataset_csv_file_name)
   self.utils.print_array_w_title(self.dataset_file_content, "===\nself.dataset_file_content AAA")
    
  def insert_dataset(self, project_id):
   dataset, dataset_description, env_sample_source_id, project = self.dataset_file_content[0]
   project_id = self.mysql_util.get_id("project_id", "project", "WHERE project = '%s'" % project)
   self.utils.print_array_w_title(project, "project")
   self.utils.print_array_w_title(project_id, "project_id")
 
   field_list       = "dataset`, `dataset_description`, `env_sample_source_id`, `project_id"
   insert_values = ', '.join("'%s'" % key for key in [dataset, dataset_description, env_sample_source_id, project_id])
   
   
   # taxa_by_rank = self.get_taxa_by_rank()
   # 
   # """
   # TODO: make all queries, then insert all? Benchmark!
   # """
   # for rank in self.ranks:
   #   self.utils.print_array_w_title(rank, "rank")
   #   rank_num = self.ranks.index(rank)
   #   # self.utils.print_array_w_title(rank_num, "self.ranks.index(rank)")
   # 
   #   uniqued_taxa_by_rank = set(taxa_by_rank[rank_num])
   # 
   #   insert_taxa_vals = '), ('.join(["'%s'" % key for key in uniqued_taxa_by_rank])
   #   # self.utils.print_array_w_title(insert_taxa_vals, "insert_taxa_vals")
   # 
   #   rows_affected = self.mysql_util.execute_insert(rank, rank, insert_taxa_vals)
   #   self.utils.print_array_w_title(rows_affected[0], "rows affected by self.mysql_util.execute_insert(%s, %s, insert_taxa_vals)" % (rank, rank))

 
   

   sql = "INSERT %s INTO `%s` (`%s`) VALUES (%s)" % ("ignore", "dataset", field_list, insert_values)
   self.utils.print_array_w_title(sql, "sql")

   rows_affected = self.mysql_util.execute_insert("dataset", field_list, insert_values)

   self.dataset_id = self.mysql_util.get_id("dataset_id", "dataset", "WHERE dataset = '%s'" % (dataset), rows_affected)
   self.utils.print_array_w_title(self.dataset_id, "dataset_id")


class Seq_csv:
  # id, sequence, project, dataset, taxonomy, refhvr_id, rank, seq_count, frequency, distance, rep_id, project_dataset
  # parse
  # upload
  """   
  TODO: 
    get host and db dynamically, from args
    make one connection, in main?
  """  
  
  # def __init__(self, host = "localhost", db = "vamps2", seq_csv_file_name):
  def __init__(self, seq_csv_file_name, mysql_util):
    self.utils      = Utils() 
    #TODO: make dynamic by checking if it's local
    # self.mysql_util = Mysql_util(host = 'localhost', db="vamps2")
    self.mysql_util   = mysql_util
    
    self.seqs_file_content    = self.utils.read_csv_into_list(seq_csv_file_name)
    # self.project_dataset_dict = defaultdict(list)
    self.project_dataset_dict = {}
    self.make_project_dataset_dictionary()
    # self.seq_list             = self.make_seq_list()
    content_by_field = self.content_matrix_transposition()
    self.sequences   = content_by_field[1]
    self.projects    = content_by_field[2]
    self.datasets    = content_by_field[3]
    self.taxa        = content_by_field[4]
    self.refhvr_id   = content_by_field[5]
    self.the_rest    = content_by_field[6:]
    
    self.dataset_id_by_name_dict = {}
    self.project_id_by_name_dict = {}
    

    
    # print "MMM"
    # print type(self.seqs_file_content)
    # <type '_csv.reader'>
        
    
  def make_project_dataset_dictionary(self):
    self.project_dataset_dict = {val[3]: val[2] for val in self.seqs_file_content}

  def content_matrix_transposition(self):
    return zip(*self.seqs_file_content)

  # to seq class:
  def make_seq_list(self):
    self.seq_list = [val[1] for val in self.seqs_file_content]
    
  def insert_seq(self):
    comp_seq = "COMPRESS(%s)" % ')), (COMPRESS('.join(["'%s'" % key for key in self.sequences])
    rows_affected = self.mysql_util.execute_insert("sequence", "sequence_comp", comp_seq)
    self.utils.print_array_w_title(rows_affected[0], "rows affected by self.mysql_util.execute_insert(sequence, sequence_comp, comp_seq)")
    
  # to seq class end



    # self.utils.print_array_w_title(self.user_id, "self.user_id")
    # self.utils.print_array_w_title(rows_affected[0], "rows affected by self.mysql_util.execute_insert(user, field_list, insert_values)")
    # self.utils.print_array_w_title(rows_affected[1], "last_id by self.mysql_util.execute_insert(user, field_list, insert_values)")
    
    # return rows_affected
    # if rows_affected[1] > 0:
    #   self.user_id = rows_affected[1]
    # else:
    #   self.user_id = int(self.get_user_id(self.user_data[1])[0][0])
    # self.utils.print_array_w_title(self.user_id, "self.user_id")
  
  

    
        
  def parse_env_sample_source_id(self):
    # mysql -B -h vampsdb vamps -e "select env_sample_source_id, env_source_name from new_env_sample_source" >env_sample_source_id.csv
    pass
  
  def check_env_sample_source_id(self):
    # TODO: check env_source_id/env_sample_source_id in project, if not in env_sample_source_id.csv - change to 0
    pass

  # def make_dataset_by_name_dict(self):
  #   datasets_w_ids = self.mysql_util.get_all_name_id('dataset')
  #   self.dataset_id_by_name_dict = dict(datasets_w_ids)
  #
  # def make_project_by_name_dict(self):
  #   projects_w_ids = self.mysql_util.get_all_name_id('project')
  #   self.project_id_by_name_dict = dict(projects_w_ids)
    
  def insert_dataset(self):
    #TODO: get env_sample_source_id from new_project, env_source_id from vamps_projects_info
    # print set(self.datasets)
    # fields: dataset, dataset_description, env_sample_source_id, project_id
    # self.utils.print_array_w_title(self.dataset_id_by_name_dict, "dataset_id_by_name_dict")
    # self.utils.print_array_w_title(self.project_id_by_name_dict, "project_id_by_name_dict")
    # self.utils.print_array_w_title(self.project_dataset_dict, "project_dataset_dict")
    
    # for p in set(self.projects):
    #   print self.project_id_by_name_dict[p]
    #
    # for d, pr in self.project_dataset_dict.items():
    #   print d
    #   print pr
    #   print int(self.project_id_by_name_dict[pr])
    # insert_dataset_q = "INSERT IGNORE INTO dataset (dataset, dataset_description, env_sample_source_id, project_id) VALUES ()"
    #
    #   # self.project_dataset_dict[d].append(self.project_id_by_name_dict[p])
    #
    # self.utils.print_array_w_title(self.project_dataset_dict, "project_dataset_dict")
    # self.utils.print_array_w_title(self.user_id, "self.user_id dat")
    # self.utils.print_array_w_title(self.project_id, "self.project_id dat")
    

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
          species
          strain
          user

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
  # seq_csv_file_name      = "sequences_ICM_SMS_Bv6.csv"
  # metadata_csv_file_name = "metadata_ICM_SMS_Bv6.csv"
  user_contact_csv_file_name = "user_contact.csv"
  project_csv_file_name = "project_ICM_SMS_Bv6.csv"
  dataset_csv_file_name = "dataset_ICM_SMS_Bv6.csv"

  mysql_util = Mysql_util(host = 'localhost', db="vamps2")

  # seq_csv_parser = Seq_csv(seq_csv_file_name)
  seq_csv_parser = Seq_csv(seq_csv_file_name, mysql_util)
  taxonomy       = Taxonomy(seq_csv_parser.taxa, mysql_util)
  refhvr_id      = Refhvr_id(seq_csv_parser.refhvr_id, mysql_util)

  # uncomment:
  # seq_csv_parser.insert_seq()
  taxonomy.parse_taxonomy()
  # print  "taxa_list_w_empty_ranks RRR"
  # print taxonomy.taxa_list_w_empty_ranks
  # uncomment:
  # taxonomy.insert_taxa()
  
  refhvr_id.parse_refhvr_id()
  # uncomment:
  # refhvr_id.insert_refhvr_id()
  
  project = Project(mysql_util)
  project.parse_project_csv(project_csv_file_name)

  user = User(project.contact, user_contact_csv_file_name, mysql_util)
  # uncomment:
  # user.insert_user()
  # uncomment:
  # seq_csv_parser.utils.print_array_w_title(seq_csv_parser.user_id, "self.user_id main")
  # uncomment:
  # project.insert_project(user.user_id)
  
  seq_csv_parser.utils.print_array_w_title(user.user_id, "self.user_id main")
  
  seq_csv_parser.utils.print_array_w_title(project.project_id, "project.project_id main")

  dataset = Dataset(mysql_util)
  dataset.parse_dataset_csv(dataset_csv_file_name)
  dataset.insert_dataset(project.project_id)
  
  # seq_csv_parser.insert_dataset()

  # seq_csv_parser.make_project_by_name_dict()
  #
  # seq_csv_parser.make_dataset_by_name_dict()
