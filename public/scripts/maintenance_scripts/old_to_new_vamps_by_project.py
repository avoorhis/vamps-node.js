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
*) cd vamps-node.js/public/scripts/maintenance_scripts; time python old_to_new_vamps_by_project.py -s sequences.csv -m metadata.csv -owner admin -p "ICM_AGW_Bv6"

*) Utils, connection - classes for all

*)
mysql -B -h vampsdb vamps -e "SELECT * FROM vamps_metadata where project='DCO_BOM_Bv6';" |sed "s/'/\'/;s/\t/\"\t\"/g;s/^/\"/;s/$/\"/;s/\n//g" > metadata.csv
mysql -B -h vampsdb vamps -e "SELECT * FROM vamps_sequences where project='DCO_BOM_Bv6';" |sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > sequences.csv
mysql -B -h vampsdb vamps -e "SELECT * FROM vamps_sequences_pipe where project='DCO_BOM_Bv6';" |sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > sequences.csv

*) beforehand
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

*) from sequences.csv
ref_silva_taxonomy_info_per_seq_refhvr_id
refhvr_id
sequence
sequence_pdr_info
sequence_uniq_info
silva_taxonomy
silva_taxonomy_info_per_seq

*)
from metadata.csv
required_metadata_info
custom_metadata_fields
custom_metadata_#

"""
