#!/usr/bin/env python

import os,sys
from array import array
sys.path.append("/Users/avoorhis/programming/vamps-node.js/public/scripts/visualization_scripts/")
from distance import go_distance

"""
Run this way:  py.test distance_test.py
"""

class TestArgs1(object):
	def __init__(self, in_file, metric, ff, base, pfx, fxn):
		self.in_file = in_file
		self.metric = metric
		self.file_format = ff
		self.outdir = base
		self.prefix = pfx
		self.function = fxn

d = [ 0.25973117,  0.51919205,  0.59291318 ]

# dm1: [[]]
#[
#[  0.00000000e+00   9.86159727e-03   8.90286439e-05   7.11500728e-03
#    2.11434615e-03   6.39773481e-03   4.40706533e-01   4.69163215e-01
#    4.49626425e-01   4.68261345e-01   4.42852516e-01   4.83894461e-01]
# [  9.86159727e-03   0.00000000e+00   1.13731595e-02   2.51487629e-04
#    6.90100361e-03   1.44735894e-03   3.52524523e-01   3.75776748e-01
#    3.60328184e-01   3.75075268e-01   3.54329424e-01   3.88954243e-01]
# ]q

# dm2:  JSON
# { 'SLM_NIH_Bv6--Biofilter_005': 
#    { 'SLM_NIH_Bv6--Biofilter_005': '0',
#      'SLM_NIH_Bv6--Biofilter_Outflow_006': '0.015246870934763',
#      'SLM_NIH_Bv6--Biofilter_Sand_008': '0.0198007846045586' },
#   'SLM_NIH_Bv6--Biofilter_Outflow_006': 
#    { 'SLM_NIH_Bv6--Biofilter_005': '0.015246870934763',
#      'SLM_NIH_Bv6--Biofilter_Outflow_006': '0',
#      'SLM_NIH_Bv6--Biofilter_Sand_008': '0.013683782909973' },
#   'SLM_NIH_Bv6--Biofilter_Sand_008': 
#    { 'SLM_NIH_Bv6--Biofilter_005': '0.0198007846045586',
#      'SLM_NIH_Bv6--Biofilter_Outflow_006': '0.013683782909973',
#      'SLM_NIH_Bv6--Biofilter_Sand_008': '0' } 
#  }

# dm3:   NOT good JSON, but works with pycogent
# {
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_1Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep2_1Step'): 0.32185444543965835, 
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep2_1Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_2Step'): 0.95288201941646389, 
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_1Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_1Step'): 0.0, 
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_2Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_1Step'): 0.97554598143130711, 
# }

def test_distance_datasets():
	
		args = TestArgs1('./test_matrix.biom','bray_curtis','json','./','pfx','dist')
		( dm1, short_dm1, dm2, dm3, datasets ) = go_distance(args)
		assert(datasets == ['ICM_LCY_Bv6--LCY_0001_2003_05_11', 'ICM_LCY_Bv6--LCY_0003_2003_05_04', 'ICM_LCY_Bv6--LCY_0005_2003_05_16'])

def test_distance_dist():
	
		args = TestArgs1('./test_matrix.biom','bray_curtis','json','./','pfx','dist')
		( dm1, dist, dm2, dm3, datasets ) = go_distance(args)
		
		assert(dist[0] == 0.25973116774012883 ) 

def test_distance_dm1_format():
	
		args = TestArgs1('./test_matrix.biom','bray_curtis','json','./','pfx','dist')
		( dm1, dist, dm2, dm3, datasets ) = go_distance(args)
		






		 