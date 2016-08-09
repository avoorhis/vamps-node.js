#!/usr/bin/env python

import os,sys
from array import array
import numpy as np
import json
from scipy.spatial import distance
sys.path.append("/Users/avoorhis/programming/vamps-node.js/public/scripts/visualization_scripts/")
import distance2 as TEST_SCRIPT


"""
Run this way:  py.test -v distance_test.py
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

# from ./test_matrix.biom
# dm1: [[]]
# [[ 0.          0.25973117  0.51919205]
#  [ 0.25973117  0.          0.59291318]
#  [ 0.51919205  0.59291318  0.        ]]

# dm2:  JSON
    # {
    #     'ICM_LCY_Bv6--test_ds1':
    #         {'ICM_LCY_Bv6--test_ds1': 0.0, 'ICM_LCY_Bv6--test_ds2': 0.25973116774012883, 'ICM_LCY_Bv6--test_ds3': 0.51919205254298817},
    #     'ICM_LCY_Bv6--test_ds2':
    #         {'ICM_LCY_Bv6--test_ds1': 0.25973116774012883, 'ICM_LCY_Bv6--test_ds2': 0.0, 'ICM_LCY_Bv6--test_ds3': 0.59291318280599659},
    #     'ICM_LCY_Bv6--test_ds3':
    #         {'ICM_LCY_Bv6--test_ds1': 0.51919205254298817, 'ICM_LCY_Bv6--test_ds2': 0.59291318280599659, 'ICM_LCY_Bv6--test_ds3': 0.0}
    # }

    # # dm3:   NOT good JSON, but works with pycogent
    # {
    #     ('ICM_LCY_Bv6--test_ds3', 'ICM_LCY_Bv6--test_ds2'): 0.59291318280599659,
    #     ('ICM_LCY_Bv6--test_ds2', 'ICM_LCY_Bv6--test_ds3'): 0.59291318280599659,
    #     ('ICM_LCY_Bv6--test_ds3', 'ICM_LCY_Bv6--test_ds3'): 0.0,
    #     ('ICM_LCY_Bv6--test_ds2', 'ICM_LCY_Bv6--test_ds2'): 0.0,
    #     ('ICM_LCY_Bv6--test_ds3', 'ICM_LCY_Bv6--test_ds1'): 0.51919205254298817,
    #     ('ICM_LCY_Bv6--test_ds1', 'ICM_LCY_Bv6--test_ds1'): 0.0,
    #     ('ICM_LCY_Bv6--test_ds1', 'ICM_LCY_Bv6--test_ds2'): 0.25973116774012883,
    #     ('ICM_LCY_Bv6--test_ds1', 'ICM_LCY_Bv6--test_ds3'): 0.51919205254298817,
    #     ('ICM_LCY_Bv6--test_ds2', 'ICM_LCY_Bv6--test_ds1'): 0.25973116774012883
    # }


def test_distance_datasets():
		args = TestArgs1('./test_matrix.biom','bray_curtis','json','./','pfx','dist')
		( dm1, short_dm1, dm2, dm3, datasets ) = TEST_SCRIPT.go_distance(args)

		assert(datasets == ['ICM_LCY_Bv6--test_ds1', 'ICM_LCY_Bv6--test_ds2', 'ICM_LCY_Bv6--test_ds3'])

def test_distance_dist1():
	
		args = TestArgs1('./test_matrix.biom','bray_curtis','json','./','pfx','dist')
		( dm1, dist, dm2, dm3, datasets ) = TEST_SCRIPT.go_distance(args)
		
		assert( round(dist[0],8) == 0.25973117 )

def test_distance_dist2():
		args = TestArgs1('./test_matrix.biom','bray_curtis','json','./','pfx','dist')
		data = json.load(open(args.in_file))
		mtx = np.transpose(np.array(data['data']))
		dist = TEST_SCRIPT.get_dist(args.metric, mtx)

		assert( round(dist[0],8) == 0.25973117 )

def test_distance_dm1():
	
		args = TestArgs1('./test_matrix.biom','bray_curtis','json','./','pfx','dist')
		data = json.load(open(args.in_file))
		mtx = np.transpose(np.array(data['data']))
		dist = TEST_SCRIPT.get_dist(args.metric, mtx)
		dm1 = TEST_SCRIPT.get_data_matrix1(dist)
		assert(len(dm1)    == 4 ) # we've added a 4th (empty) row for testing
		assert(len(dm1[0]) == 4 )
		assert(dm1[0][0]   == dm1[1][1] == dm1[2][2] == 0.0)
		assert(round(dm1[0][2],8)   == 0.51919205)
		
def test_distance_dm2():
		args = TestArgs1('./test_matrix.biom','bray_curtis','json','./','pfx','dist')
		( dm1, short_dm1, dm2, dm3, datasets ) = TEST_SCRIPT.go_distance(args)
		
		assert( dm2['ICM_LCY_Bv6--test_ds1']['ICM_LCY_Bv6--test_ds1'] == 0.0 )
		assert( round(dm2['ICM_LCY_Bv6--test_ds1']['ICM_LCY_Bv6--test_ds3'],8) == 0.51919205 )
		assert( round(dm2['ICM_LCY_Bv6--test_ds3']['ICM_LCY_Bv6--test_ds1'],8) == 0.51919205 )

def test_distance_dm3():
		args = TestArgs1('./test_matrix.biom','bray_curtis','json','./','pfx','dist')
		( dm1, short_dm1, dm2, dm3, datasets ) = TEST_SCRIPT.go_distance(args)

		assert( dm3[('ICM_LCY_Bv6--test_ds1', 'ICM_LCY_Bv6--test_ds1')] == 0.0 )
		assert( round(dm3[('ICM_LCY_Bv6--test_ds2', 'ICM_LCY_Bv6--test_ds3')],8) == 0.59291318 )
		assert( round(dm3[('ICM_LCY_Bv6--test_ds3', 'ICM_LCY_Bv6--test_ds2')],8) == 0.59291318 )

def test_distance_remove_zero_rows():
		args = TestArgs1('./test_matrix.biom','bray_curtis','json','./','pfx','dist')
		data = json.load(open(args.in_file))
		mtx = np.transpose(np.array(data['data']))
		assert(len(mtx)    == 4 )
		(mtx, bad_rows) = TEST_SCRIPT.remove_zero_sum_datasets(mtx)
		assert(len(mtx)    == 3 )

		