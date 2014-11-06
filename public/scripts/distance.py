#!/usr/bin/env python

""" 
	distance.py


"""
#!/usr/bin/python

# ./pcoa.py --mtx node_matrix.mtx --meta node_metadata.txt

import sys,os
import scipy
from scipy.cluster import hierarchy
import numpy as np
import argparse
import json
import csv
from hcluster import linkage, to_tree
#from ete2 import Tree
from pprint import pprint

from cogent.maths import distance_transform as dt


def distance(args):
	
	if args.file_format == 'json': 
		try:
			json_data = open('./tmp/'+args.in_file)
		except IOError:
			json_data = open(args.in_file)
		except:
			print "NO FILE FOUND ERROR"
			sys.exit()
		
		data = json.load(json_data)
		json_data.close()						
	else: # csv file
		with open('./tmp/'+args.in_file, 'rb') as csvfile:
			csv_data = csv.reader(csvfile, delimiter=',', quotechar='"')
			for row in csv_data:
				pass

	datasets = []
	for i in data['columns']:
		#print i['id']
		datasets.append(i['id'])
	
	z = np.array(data['data'])
	dm = np.transpose(z)
	
	if args.metric == 'bray_curtis':
		dist = dt.dist_bray_curtis(dm)
	elif args.metric == 'morisita_horn':
		dist = dt.dist_morisita_horn(dm)
	elif args.metric == 'canberra':
		dist = dt.dist_canberra(dm)	
	elif args.metric == 'chisq':
		dist = dt.dist_chisq(dm)	
	elif args.metric == 'chord':
		dist = dt.dist_chord(dm)	
	elif args.metric == 'euclidean':
		dist = dt.dist_euclidean(dm)	
	elif args.metric == 'gower':
		dist = dt.dist_gower(dm)	
	elif args.metric == 'hellinger':
		dist = dt.dist_hellinger(dm)	
	elif args.metric == 'kulczynski':
		dist = dt.dist_kulczynski(dm)	
	elif args.metric == 'manhattan':
		dist = dt.dist_manhattan(dm)	
	elif args.metric == 'abund_jaccard':
		dist = dt.dist_abund_jaccard(dm)	
	elif args.metric == 'binary_jaccard':
		dist = dt.binary_dist_jaccard(dm)	
	elif args.metric == 'pearson':
		dist = dt.dist_pearson(dm)	
	elif args.metric == 'soergel':
		dist = dt.dist_soergel(dm)	
	elif args.metric == 'spearman':
		dist = dt.dist_spearman_approx(dm)	
	else:  # default
		dist = dt.dist_bray_curtis(dm)


	
	#print data['columns']
	#print dist
	distance_matrix = {}
	for row,line in enumerate(data['columns']):
		name = line['id']
		distance_matrix[name] = {}		
		for col,d in enumerate(dist[row]):
			#print data['columns'][col]['id']
			distance_matrix[name][data['columns'][col]['id']] = dist[row][col]

	print json.dumps(distance_matrix)

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




#
#
#
if __name__ == '__main__':

	usage = """
		--in   		json_file
		--metric	distance metric to calculate ['horn', ]
	"""
	parser = argparse.ArgumentParser(description="Calculates distance from input JSON file", usage=usage)
	parser.add_argument('-in','--in',   required=True,  action="store",   dest='in_file', help = '')
	parser.add_argument('-ff','--file_format',   required=False,  action="store",   dest='file_format', default='json', help = 'json or csv only')
	parser.add_argument('-metric','--metric', required=False, action="store",   dest='metric', help = '', default='bray_curtis') 
 	 	

 	args = parser.parse_args()
	distance(args) 
