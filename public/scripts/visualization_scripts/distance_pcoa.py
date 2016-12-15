#!/usr/bin/env python

# ./pcoa.py --mtx node_matrix.mtx --meta node_metadata.txt

import sys,os
#import scipy
import numpy as np
import argparse
import json
import csv

from pprint import pprint


from cogent.maths import distance_transform as dt

#data = json.load(sys.stdin)

def distance(args):


	json_data = open(args.matrix_file)
	data = json.load(json_data)
	json_data.close()

	datasets = []
	for i in data['columns']:
		#print i['id']
		datasets.append(i['id'])

	z = np.array(data['data'])
	dm = np.transpose(z)

	if args.metric == 'bray_curtis':
		distance_matrix = dt.dist_bray_curtis(dm)
	elif args.metric == 'morisita_horn':
		distance_matrix = dt.dist_morisita_horn(dm)
	elif args.metric == 'canberra':
		distance_matrix = dt.dist_canberra(dm)
	elif args.metric == 'chisq':
		distance_matrix = dt.dist_chisq(dm)
	elif args.metric == 'chord':
		distance_matrix = dt.dist_chord(dm)
	elif args.metric == 'euclidean':
		distance_matrix = dt.dist_euclidean(dm)
	elif args.metric == 'gower':
		distance_matrix = dt.dist_gower(dm)
	elif args.metric == 'hellinger':
		distance_matrix = dt.dist_hellinger(dm)
	elif args.metric == 'kulczynski':
		distance_matrix = dt.dist_kulczynski(dm)
	elif args.metric == 'manhattan':
		distance_matrix = dt.dist_manhattan(dm)
	elif args.metric == 'abund_jaccard':
		distance_matrix = dt.dist_abund_jaccard(dm)
	elif args.metric == 'binary_jaccard':
		distance_matrix = dt.binary_dist_jaccard(dm)
	elif args.metric == 'pearson':
		distance_matrix = dt.dist_pearson(dm)
	elif args.metric == 'soergel':
		distance_matrix = dt.dist_soergel(dm)
	elif args.metric == 'spearman':
		distance_matrix = dt.dist_spearman_approx(dm)
	else:  # default
		distance_matrix = dt.dist_bray_curtis(dm)


	dist = {}
	for i,x in enumerate(distance_matrix):
		for n,d in enumerate(distance_matrix[i]):
			if i < n: # only needs one copy
					dist[ (datasets[i],datasets[n]) ] = d

	#np.savetxt(os.path.join(args.output_dir, args.file_prefix+'_distance.mtx'), distance_matrix)
	if args.to_output == 'distance':
		print(distance_matrix)
	return dist

def pcoa(args, dist):
	from cogent.cluster.metric_scaling import PCoA
	PCoA_result = PCoA(dist)
#print PCoA_result
	a = np.array(PCoA_result)[0:,0:5]   # capture only the first three vectors
	print(a)
	json_array = {}
	json_array['P1'] = a[:,2].tolist()[:-2]  # remove the last two which are not eigen vectors
	json_array['P2'] = a[:,3].tolist()[:-2]
	json_array['P3'] = a[:,4].tolist()[:-2]
	json_array['names'] = a[:,1].tolist()[:-2]
	#json['v2'] = [x[0] for x in np.array(PCoA_result[:,3])[:-2]]
	#json['v3'] = [x[0] for x in np.array(PCoA_result[:,4])[:-2]]
	#json['v3'] = [x[0] for x in np.array(PCoA_result[:,4])[:-2]]
	print(json.dumps(json_array))


	#PCoA_result.writeToFile(os.path.join(args.output_dir, args.file_prefix + '_pcoa_results.txt'),sep='\t')

if __name__ == '__main__':

	usage = """

			pcoa.py --mtx matrix_file --meta metadata_file [ --metric distance_metric ]

	"""
	parser = argparse.ArgumentParser(description="Calculates distance from input matrix file", usage=usage)
	parser.add_argument('--mtx',   					required=True,  action="store",   	 dest='matrix_file',   help = 'Matrix File'   )
	#parser.add_argument('-meta','--meta',     required=False,  action="store",   	dest='metadata_file', help = 'Metadata File' )
	parser.add_argument('--metric', 				required=False, action="store",   	 dest='metric',    help = 'Distance Metric', default='bray_curtis' )
	parser.add_argument('--calculate_pcoa', required=False, action="store_true", dest='calculate_pcoa',    help = 'T/F', default=False )
 	parser.add_argument('--file_prefix', 		required=False, action="store", dest='file_prefix',  help = 'File Prefix', default='file_prefix' )
 	parser.add_argument('--output_dir', 		required=False, action="store", dest='output_dir',   help = 'Output Directory', default='./' )
 	parser.add_argument('--to_output', 			required=False, action="store", dest='to_output',    help = 'distance or pcoa', default='none' )

 	args = parser.parse_args()


	dist = distance(args)
	if args.calculate_pcoa:
		pcoa(args, dist)
