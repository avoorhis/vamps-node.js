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
! sequence_pdr_info (dataset_id, sequence_id, seq_count, classifier_id)
! silva_taxonomy (domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id)
! silva_taxonomy_info_per_seq (sequence_id, silva_taxonomy_id, gast_distance, refssu_id, refssu_count, rank_id)
! sequence_uniq_info (sequence_id, silva_taxonomy_info_per_seq_id, gg_otu_id, oligotype_id)
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
from collections import defaultdict


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
        sql = "INSERT %s INTO %s (%s) VALUES (%s)" % (ignore, table_name, field_name, val_list)

        if self.cursor:
          self.cursor.execute(sql)
          self.conn.commit()
          return (self.cursor.rowcount, self.cursor.lastrowid)
      except:
        self.utils.print_both(("ERROR: query = %s") % sql)
        raise

    def get_all_name_id(self, table_name, id_name = "", field_name = "", where_part = ""):
      if (field_name == ""):
        field_name = table_name
      if (id_name == ""):
        id_name = table_name + '_id'
      my_sql  = """SELECT %s, %s FROM %s %s""" % (field_name, id_name, table_name, where_part)
      # self.utils.print_both(("my_sql from get_all_name_id = %s") % my_sql)
      res     = self.execute_fetch_select(my_sql)
      if res:
        return res

    def execute_simple_select(self, field_name, table_name, where_part):
      id_query  = "SELECT %s FROM %s %s" % (field_name, table_name, where_part)
      return self.execute_fetch_select(id_query)

    def get_id(self, field_name, table_name, where_part, rows_affected = [0,0]):
      # self.utils.print_array_w_title(rows_affected, "=====\nrows_affected from def get_id")

      if rows_affected[1] > 0:
        id_result = int(rows_affected[1])
      else:
        try:
          # id_query  = "SELECT %s FROM %s %s" % (field_name, table_name, where_part)
          id_result_full = self.execute_simple_select(field_name, table_name, where_part)
          id_result = int(id_result_full[0][0])
        except:
          self.utils.print_both("Unexpected:")
          # self.utils.print_both(sys.exc_info()[0])
          raise

      # self.utils.print_array_w_title(id_result, "=====\nid_result IN get_id")
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
      csv_file_content_all = list(csv.reader(open(file_name, 'rb'), delimiter=','))
      csv_file_fields      = csv_file_content_all[0]
      csv_file_content     = csv_file_content_all[1:]
      return (csv_file_fields, csv_file_content)
      # return list(csv.reader(open(file_name, 'rb'), delimiter=','))[1:]

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

    def make_insert_values(self, matrix):
      all_insert_vals = ""

      for arr in matrix[:-1]:
        insert_dat_vals = ', '.join("'%s'" % key for key in arr)
        all_insert_vals += insert_dat_vals + "), ("

      all_insert_vals += ', '.join("'%s'" % key for key in matrix[-1])

      # self.print_array_w_title(all_insert_vals, "all_insert_vals from make_insert_values")
      return all_insert_vals
      
    def find_in_nested_list(self, hey, needle):
      return [v for k, v in hey if k == needle]
      # return [int(v) for k, v in hey if k == needle]
      # i for i, v in enumerate(L) if v[0] == 53]
    def find_key_by_value_in_dict(self, hey, needle):
      return [k for k, v in hey if v == needle]
    

class Taxonomy:
  def __init__(self, taxa_content, mysql_util):
    self.utils        = Utils()
    self.taxa_content = taxa_content
    self.ranks        = ['domain', 'phylum', 'klass', 'order', 'family', 'genus', 'species', 'strain']
    self.taxa_by_rank = []
    self.all_rank_w_id                       = set()
    self.uniqued_taxa_by_rank_dict           = {}
    self.uniqued_taxa_by_rank_w_id_dict      = {}
    self.taxa_list_w_empty_ranks_dict        = defaultdict(list)
    self.taxa_list_w_empty_ranks_ids_dict    = defaultdict(list)
    self.silva_taxonomy_rank_list_w_ids_dict = defaultdict(list)
    self.silva_taxonomy_ids_dict             = defaultdict(list)
    self.silva_taxonomy_id_per_taxonomy_dict = defaultdict(list)
    
  def parse_taxonomy(self):
    self.taxa_list_dict = {taxon_string: taxon_string.split(";") for taxon_string in self.taxa_content}
    self.taxa_list_w_empty_ranks_dict = {taxonomy: tax_list + [""] * (len(self.ranks) - len(tax_list)) for taxonomy, tax_list in self.taxa_list_dict.items()}

  def get_taxa_by_rank(self):
    self.taxa_by_rank = zip(*self.taxa_list_w_empty_ranks_dict.values())

  def make_uniqued_taxa_by_rank_dict(self):
    for rank in self.ranks:
      rank_num             = self.ranks.index(rank)
      uniqued_taxa_by_rank = set(self.taxa_by_rank[rank_num])
      try:
        self.uniqued_taxa_by_rank_dict[rank] = uniqued_taxa_by_rank
      except:
        raise

    self.utils.print_array_w_title(self.uniqued_taxa_by_rank_dict, "self.uniqued_taxa_by_rank_dict made with for")

  def insert_taxa(self):
    """
    TODO: make all queries, then insert all? Benchmark!
    """
    for rank, uniqued_taxa_by_rank in self.uniqued_taxa_by_rank_dict.items():
      insert_taxa_vals = '), ('.join(["'%s'" % key for key in uniqued_taxa_by_rank])
      
      shielded_rank_name = self.shield_rank_name(rank)
      rows_affected = mysql_util.execute_insert(shielded_rank_name, shielded_rank_name, insert_taxa_vals)
      self.utils.print_array_w_title(rows_affected, "rows affected by mysql_util.execute_insert(%s, %s, insert_taxa_vals)" % (rank, rank))

  def shield_rank_name(self, rank):
    return "`"+rank+"`"  
    
  def get_all_rank_w_id(self):
    self.all_rank_w_id = mysql_util.get_all_name_id("rank")
    # self.utils.print_array_w_title(self.all_rank_w_id, "self.all_rank_w_id from get_all_rank_w_id")
    # (('domain', 78), ('family', 82), ('genus', 83), ('klass', 80), ('NA', 87), ('order', 81), ('phylum', 79), ('species', 84), ('strain', 85), ('superkingdom', 86))
    
  
    
  def make_uniqued_taxa_by_rank_w_id_dict(self):
    self.utils.print_array_w_title(self.uniqued_taxa_by_rank_dict, "===\nself.uniqued_taxa_by_rank_dict from def silva_taxonomy")
    
    for rank, uniqued_taxa_by_rank in self.uniqued_taxa_by_rank_dict.items():
      shielded_rank_name = self.shield_rank_name(rank)
      taxa_names         = ', '.join(["'%s'" % key for key in uniqued_taxa_by_rank])
      taxa_w_id          = mysql_util.get_all_name_id(shielded_rank_name, rank + "_id", shielded_rank_name, 'WHERE %s in (%s)' % (shielded_rank_name, taxa_names))
      self.uniqued_taxa_by_rank_w_id_dict[rank] = taxa_w_id
      
  def insert_silva_taxonomy(self):
    
    # self.utils.print_array_w_title(self.taxa_list_w_empty_ranks_ids_dict.values(), "===\nself.taxa_list_w_empty_ranks_ids_dict from def insert_silva_taxonomy")

    field_list = "domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id"
    all_insert_st_vals = self.utils.make_insert_values(self.taxa_list_w_empty_ranks_ids_dict.values())
    rows_affected = mysql_util.execute_insert("silva_taxonomy", field_list, all_insert_st_vals)
    self.utils.print_array_w_title(rows_affected, "rows_affected by inserting silva_taxonomy")

  def silva_taxonomy(self):
    # silva_taxonomy (domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id)
    self.make_uniqued_taxa_by_rank_w_id_dict()
    silva_taxonomy_list = []
    
    for taxonomy, tax_list in self.taxa_list_w_empty_ranks_dict.items():
      # ['Bacteria', 'Proteobacteria', 'Deltaproteobacteria', 'Desulfobacterales', 'Nitrospinaceae', 'Nitrospina', '', '']
      silva_taxonomy_sublist = []
      for rank_num, taxon in enumerate(tax_list):
        rank     = self.ranks[rank_num]
        taxon_id = int(self.utils.find_in_nested_list(self.uniqued_taxa_by_rank_w_id_dict[rank], taxon)[0])
        silva_taxonomy_sublist.append(taxon_id)
        # self.utils.print_array_w_title(silva_taxonomy_sublist, "===\nsilva_taxonomy_sublist from def silva_taxonomy: ")
      self.taxa_list_w_empty_ranks_ids_dict[taxonomy] = silva_taxonomy_sublist
    self.utils.print_array_w_title(self.taxa_list_w_empty_ranks_ids_dict, "===\ntaxa_list_w_empty_ranks_ids_dict from def silva_taxonomy: ")
    
  def make_silva_taxonomy_rank_list_w_ids_dict(self):
    for taxonomy, silva_taxonomy_id_list in self.taxa_list_w_empty_ranks_ids_dict.items():
      rank_w_id_list = []
      for rank_num, taxon_id in enumerate(silva_taxonomy_id_list):
        rank = self.ranks[rank_num]
        t = (rank, taxon_id)
        rank_w_id_list.append(t)

      self.silva_taxonomy_rank_list_w_ids_dict[taxonomy] = rank_w_id_list
    self.utils.print_array_w_title(self.silva_taxonomy_rank_list_w_ids_dict, "===\nsilva_taxonomy_rank_list_w_ids_dict from def make_silva_taxonomy_rank_list_w_ids_dict: ")
    """
    {'Bacteria;Proteobacteria;Alphaproteobacteria;Rhizobiales;Rhodobiaceae;Rhodobium': [('domain', 2), ('phylum', 2016066), ('klass', 2085666), ('order', 2252460), ('family', 2293035), ('genus', 2303053), ('species', 1), ('strain', 2148217)], ...
    """
  
  def make_rank_name_id_t_id_str(self, rank_w_id_list):
    a = ""
    for t in rank_w_id_list[:-1]:
      a += t[0] + "_id = " + str(t[1]) + " AND\n"
    a += rank_w_id_list[-1][0] + "_id = " + str(rank_w_id_list[-1][1]) + "\n"
    return a
  
  def make_silva_taxonomy_ids_dict(self, silva_taxonomy_ids):
    for ids in silva_taxonomy_ids:
      self.silva_taxonomy_ids_dict[int(ids[0])] = [int(id) for id in ids[1:]]
    self.utils.print_array_w_title(self.silva_taxonomy_ids_dict, "===\nsilva_taxonomy_ids_dict from def get_silva_taxonomy_ids: ")
    # {2436595: [2, 2016066, 2085666, 2252460, 2293035, 2303053, 1, 2148217], 2436596: [...
    
  def get_silva_taxonomy_ids(self):
    self.make_silva_taxonomy_rank_list_w_ids_dict()
    
    sql_part = ""
    for taxonomy, rank_w_id_list in self.silva_taxonomy_rank_list_w_ids_dict.items()[:-1]:
      a = self.make_rank_name_id_t_id_str(rank_w_id_list)
      sql_part += "(%s) OR " % a 

    a_last = self.make_rank_name_id_t_id_str(self.silva_taxonomy_rank_list_w_ids_dict.values()[-1])
    sql_part += "(%s)" % a_last
    
    field_names = "silva_taxonomy_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id"
    table_name  = "silva_taxonomy"
    where_part  = "WHERE " + sql_part
    silva_taxonomy_ids = mysql_util.execute_simple_select(field_names, table_name, where_part)

    """
    ((2436595L, 2L, 2016066L, 2085666L, 2252460L, 2293035L, 2303053L, 1L, 2148217L), ...
    """
    self.make_silva_taxonomy_ids_dict(silva_taxonomy_ids)
    
  def make_silva_taxonomy_id_per_taxonomy_dict(self):
    for silva_taxonomy_id, st_id_list1 in self.silva_taxonomy_ids_dict.items():
      taxon_string = self.utils.find_key_by_value_in_dict(self.taxa_list_w_empty_ranks_ids_dict.items(), st_id_list1)
      self.silva_taxonomy_id_per_taxonomy_dict[taxon_string[0]] = silva_taxonomy_id
    # self.utils.print_array_w_title(self.silva_taxonomy_id_per_taxonomy_dict, "silva_taxonomy_id_per_taxonomy_dict from silva_taxonomy_info_per_seq = ")
      
class Refhvr_id:

  def __init__(self, refhvr_id, mysql_util):
    self.utils      = Utils()
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
    rows_affected = mysql_util.execute_insert("refhvr_id", "refhvr_id", insert_refhvr_id_vals)
    # self.utils.print_array_w_title(rows_affected[0], "rows affected by mysql_util.execute_insert(refhvr_id, refhvr_id, insert_refhvr_id_vals)")

class User:
  def __init__(self, contact, user_contact_csv_file_name, mysql_util):
    self.utils      = Utils()
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
    return mysql_util.execute_fetch_select(user_id_query)

  def parse_user_contact_csv(self, user_contact_csv_file_name):
    self.user_contact_file_content = self.utils.read_csv_into_list(user_contact_csv_file_name)[1]
    # self.utils.print_array_w_title(self.user_contact_file_content, "===\nself.user_contact_file_content BBB")

  def insert_user(self):
    field_list    = "username, email, institution, first_name, last_name, active, security_level, encrypted_password"
    insert_values = ', '.join(["'%s'" % key for key in self.user_data[1:]])

    rows_affected = mysql_util.execute_insert("user", field_list, insert_values)
    self.user_id  = mysql_util.get_id("user_id", "user", "WHERE username = '%s'" % (self.user_data[1]), rows_affected)

class Project:

  def __init__(self, mysql_util):
    self.utils      = Utils()
    self.contact    = ""
    self.project_id = ""
    self.user_id    = ""
    self.project_dict = {}

  def parse_project_csv(self, project_csv_file_name):
    # "project","title","project_description","funding","env_sample_source_id","contact","email","institution"

    self.project_file_content = self.utils.read_csv_into_list(project_csv_file_name)[1]
    # self.utils.print_array_w_title(self.project_file_content, "===\nself.project_file_content AAA")
    self.contact = self.project_file_content[0][5]
    self.project_dict[self.project_file_content[0][0]] = ""

  def insert_project(self, user_id):
    project, title, project_description, funding, env_sample_source_id, contact, email, institution = self.project_file_content[0]

    field_list       = "project, title, project_description, rev_project_name, funding, owner_user_id"
    insert_values = ', '.join("'%s'" % key for key in [project, title, project_description])
    insert_values += ", REVERSE('%s'), '%s', %s" % (project, funding, user_id)

    # sql = "INSERT %s INTO `%s` (`%s`) VALUES (%s)" % ("ignore", "project", field_list, insert_values)
    # self.utils.print_array_w_title(sql, "sql")

    rows_affected = mysql_util.execute_insert("project", field_list, insert_values)

    self.project_id = mysql_util.get_id("project_id", "project", "WHERE project = '%s'" % (project), rows_affected)
    self.project_dict[project] = self.project_id

    # self.utils.print_array_w_title(self.project_dict, "===\nSSS self.project_dict from insert_project ")

class Dataset:
  def __init__(self, mysql_util):
    self.utils      = Utils()
    self.dataset_project_dict = {}
    self.dataset_file_content = []
    self.dataset_dict = {}

  def make_dataset_project_dictionary(self):
    self.dataset_project_dict = {val[0]: val[3] for val in self.dataset_file_content}

  def parse_dataset_csv(self, dataset_csv_file_name):
  # "dataset","dataset_description","env_sample_source_id","project"

    self.dataset_file_content = self.utils.read_csv_into_list(dataset_csv_file_name)[1]
    # self.utils.print_array_w_title(self.dataset_file_content, "===\nself.dataset_file_content AAA")

  def put_project_id_into_dataset_file_content(self, project_id):
    for dl in self.dataset_file_content:
      dl[3] = project_id

  def collect_dataset_ids(self):
    for dataset, project in self.dataset_project_dict.items():
      dataset_id = mysql_util.get_id("dataset_id", "dataset", "WHERE dataset = '%s'" % (dataset))
      self.dataset_dict[dataset] = dataset_id

  def insert_dataset(self, project_dict):
    for project in set(self.dataset_project_dict.values()):
      project_id = project_dict[project]
      self.put_project_id_into_dataset_file_content(project_id)

      field_list = "dataset, dataset_description, env_sample_source_id, project_id"

      all_insert_dat_vals = self.utils.make_insert_values(self.dataset_file_content)
      # sql = "INSERT %s INTO `%s` (`%s`) VALUES (%s)" % ("ignore", "dataset", field_list, all_insert_dat_vals)
      # self.utils.print_array_w_title(sql, "sql")

      rows_affected = mysql_util.execute_insert("dataset", field_list, all_insert_dat_vals)

class Sequence:

  def __init__(self, sequences, mysql_util):
    self.utils      = Utils()
    self.sequences  = sequences

    self.all_sequences   = set()
    self.sequences_lists = []
    self.comp_seq        = "COMPRESS(%s)" % ')), (COMPRESS('.join(["'%s'" % key for key in self.sequences])
    self.sequences_w_ids = set()

  def get_seq_ids(self):
    self.comp_seq = "COMPRESS(%s)" % '), COMPRESS('.join(["'%s'" % key for key in self.sequences])
    self.sequences_w_ids = mysql_util.get_all_name_id('sequence', '', 'UNCOMPRESS(sequence_comp)', 'WHERE sequence_comp in (%s)' % self.comp_seq)
    # self.utils.print_array_w_title(sequences_w_ids, "sequences_w_ids from get_seq_ids")

  def insert_seq(self):
    rows_affected = mysql_util.execute_insert("sequence", "sequence_comp", self.comp_seq)
    # self.utils.print_array_w_title(rows_affected[0], "rows affected by mysql_util.execute_insert(sequence, sequence_comp, comp_seq)")

class Seq_csv:
  # id, sequence, project, dataset, taxonomy, refhvr_id, rank, seq_count, frequency, distance, rep_id, project_dataset
  # parse
  # upload
  """
  TODO:
    get host and db dynamically, from args
    make one connection, in main?
  """

  def __init__(self, seq_csv_file_name, mysql_util):
    self.utils = Utils()
    self.seq_csv_file_fields, self.seqs_file_content = self.utils.read_csv_into_list(seq_csv_file_name)    
    self.content_by_field = self.content_matrix_transposition()
    self.sequences        = self.content_by_field[1]
    self.taxa             = self.content_by_field[4]
    self.refhvr_id        = self.content_by_field[5]
    self.the_rest         = self.content_by_field[6:]
                          
    self.sequence         = Sequence(self.sequences, mysql_util)
    self.sequence_pdr_info_content = []

    # print "MMM"
    # print self.seqs_file_content
    """
    [['278176', 'TGGACTTGACATGCACTTGTAAGCCATAGAGATATGGCCCCTCTTCGGAGC', 'ICM_SMS_Bv6', 'SMS_0001_2007_09_19', 'Bacteria;Proteobacteria;Deltaproteobacteria;Desulfobacterales;Nitrospinaceae;Nitrospina', 'v6_DU318 v6_DU349 v6_DU400 v6_DU416', 'genus', '2', '0.000136008160489629', '0.03900', 'FL6XCJ201ALT42', 'ICM_SMS_Bv6--SMS_0001_2007_09_19']...]
    """

  def content_matrix_transposition(self):
    return zip(*self.seqs_file_content)

  # def make_seq_list(self):
  #   self.seq_list = [val[1] for val in self.seqs_file_content]


  def make_sequence_pdr_info_content(self, dataset_dict):
    for e in self.seqs_file_content:
      temp_tuple = []

      temp_tuple.append(int(dataset_dict[e[3]]))
      temp_tuple.append(int(self.seq_ids_by_name_dict[e[1]]))
      temp_tuple.append(int(e[7]))
      temp_tuple.append(int(2))
      # self.utils.print_array_w_title(temp_tuple, "temp_tuple AFTER = ")
      self.sequence_pdr_info_content.append(temp_tuple)

  def insert_sequence_pdr_info(self):
    fields = "dataset_id, sequence_id, seq_count, classifier_id"
    insert_seq_pdr_vals = self.utils.make_insert_values(self.sequence_pdr_info_content)
    # self.utils.print_array_w_title(insert_seq_pdr_vals, "insert_seq_pdr_vals")
    rows_affected = mysql_util.execute_insert('sequence_pdr_info', fields, insert_seq_pdr_vals)
    self.utils.print_array_w_title(rows_affected, "rows_affected by insert_seq_pdr_vals")

  def sequence_pdr_info(self, dataset_dict):
    # (dataset_id, sequence_id, seq_count, classifier_id)
    # classifier_id = 2 GAST  SILVA108_FULL_LENGTH
    self.sequence.get_seq_ids()
    self.seq_ids_by_name_dict = dict(self.sequence.sequences_w_ids)
    # self.utils.print_array_w_title(self.seq_ids_by_name_dict, "self.seq_ids_by_name_dict = ")
    self.make_sequence_pdr_info_content(dataset_dict)
    self.insert_sequence_pdr_info()
      
# ! silva_taxonomy_info_per_seq (sequence_id, silva_taxonomy_id, gast_distance, refssu_id, refssu_count, rank_id)
  def silva_taxonomy_info_per_seq_from_csv(self, taxonomy):
    sequence_id = 0
    silva_taxonomy_id = 0
    gast_distance = 0.0
    refssu_id = 0
    refssu_count = 0
    rank_id = 0
    
    self.utils.print_array_w_title(taxonomy.silva_taxonomy_id_per_taxonomy_dict, "taxonomy.taxonomy.silva_taxonomy_id_per_taxonomy_dict from silva_taxonomy_info_per_seq = ")
    
    self.utils.print_array_w_title(self.seq_ids_by_name_dict, "\n---\nself.seq_ids_by_name_dict from silva_taxonomy_info_per_seq = ")
    print "SSSSS"
    # seq_csv_file_fields = ["id","sequence","project","dataset","taxonomy","refhvr_ids","rank","seq_count","frequency","distance","rep_id","project_dataset"]
    # seq_csv_file_fields = 
    for e in self.seqs_file_content:
      dictionary = dict(zip(self.seq_csv_file_fields, e))
      
      self.utils.print_array_w_title(dictionary, "dictionary from silva_taxonomy_info_per_seq_from_csv = ")
      
      seq               = dictionary["sequence"]
      sequence_id       = self.seq_ids_by_name_dict[seq]
      silva_taxonomy_id = taxonomy.silva_taxonomy_id_per_taxonomy_dict[dictionary["taxonomy"]]
      gast_distance     = dictionary["distance"]
      # # refssu_id         =
      # # refssu_count      =
      rank_id           = taxonomy.all_rank_w_id[dictionary["rank"]]
      
      self.utils.print_array_w_title(sequence_id, "sequence_id from silva_taxonomy_info_per_seq_from_csv = ")
      self.utils.print_array_w_title(silva_taxonomy_id, "silva_taxonomy_id from silva_taxonomy_info_per_seq_from_csv = ")
      self.utils.print_array_w_title(gast_distance, "gast_distance from silva_taxonomy_info_per_seq_from_csv = ")
      self.utils.print_array_w_title(rank_id, "rank_id from silva_taxonomy_info_per_seq_from_csv = ")
      

    """

 
    
    [['278176', 'TGGACTTGACATGCACTTGTAAGCCATAGAGATATGGCCCCTCTTCGGAGC', 'ICM_SMS_Bv6', 'SMS_0001_2007_09_19', 'Bacteria;Proteobacteria;Deltaproteobacteria;Desulfobacterales;Nitrospinaceae;Nitrospina', 'v6_DU318 v6_DU349 v6_DU400 v6_DU416', 'genus', '2', '0.000136008160489629', '0.03900', 'FL6XCJ201ALT42', 'ICM_SMS_Bv6--SMS_0001_2007_09_19']...]
    """
      


  def parse_env_sample_source_id(self):
    # mysql -B -h vampsdb vamps -e "select env_sample_source_id, env_source_name from new_env_sample_source" >env_sample_source_id.csv
    pass

  def check_env_sample_source_id(self):
    # TODO: check env_source_id/env_sample_source_id in project, if not in env_sample_source_id.csv - change to 0
    pass

  # def make_dataset_by_name_dict(self):
  #   datasets_w_ids = mysql_util.get_all_name_id('dataset')
  #   self.dataset_id_by_name_dict = dict(datasets_w_ids)
  #
  # def make_project_by_name_dict(self):
  #   projects_w_ids = mysql_util.get_all_name_id('project')
  #   self.project_id_by_name_dict = dict(projects_w_ids)

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
  utils      = Utils()

  seq_csv_parser = Seq_csv(seq_csv_file_name, mysql_util)
  taxonomy       = Taxonomy(seq_csv_parser.taxa, mysql_util)
  refhvr_id      = Refhvr_id(seq_csv_parser.refhvr_id, mysql_util)
  sequence       = Sequence(seq_csv_parser.sequences, mysql_util)

  sequence.insert_seq()

  refhvr_id.parse_refhvr_id()
  refhvr_id.insert_refhvr_id()

  project = Project(mysql_util)
  project.parse_project_csv(project_csv_file_name)

  user = User(project.contact, user_contact_csv_file_name, mysql_util)
  user.insert_user()
  project.insert_project(user.user_id)

  seq_csv_parser.utils.print_array_w_title(user.user_id, "self.user_id main")
  seq_csv_parser.utils.print_array_w_title(project.project_id, "project.project_id main")
  seq_csv_parser.utils.print_array_w_title(project.project_dict, "project.project_dict main")

  dataset = Dataset(mysql_util)
  dataset.parse_dataset_csv(dataset_csv_file_name)
  dataset.make_dataset_project_dictionary()
  dataset.insert_dataset(project.project_dict)
  dataset.collect_dataset_ids()

  seq_csv_parser.utils.print_array_w_title(dataset.dataset_dict, "dataset.dataset_dict main")
  # 
  seq_csv_parser.sequence_pdr_info(dataset.dataset_dict)
  # 
  taxonomy.parse_taxonomy()
  # print  "taxa_list_w_empty_ranks RRR"
  # print taxonomy.taxa_list_w_empty_ranks
  taxonomy.get_taxa_by_rank()
  taxonomy.make_uniqued_taxa_by_rank_dict()
  taxonomy.insert_taxa()
  taxonomy.silva_taxonomy()
  taxonomy.insert_silva_taxonomy()
  taxonomy.get_silva_taxonomy_ids()
  taxonomy.make_silva_taxonomy_id_per_taxonomy_dict()
  taxonomy.get_all_rank_w_id()
  # utils.print_array_w_title(taxonomy.all_rank_w_id, "taxonomy.all_rank_w_id from main")

  seq_csv_parser.silva_taxonomy_info_per_seq_from_csv(taxonomy)
  
  # seq_csv_parser.make_project_by_name_dict()
  #
  # seq_csv_parser.make_dataset_by_name_dict()
