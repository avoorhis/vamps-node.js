#!/usr/bin/python

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
from ete2 import Tree
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
	for i,line in enumerate(data['columns']):
		sys.stdout.write(line['id']+'\t')
	#print(distance_matrix[i])
	print
	for i,x in enumerate(distance_matrix):
		sys.stdout.write(data['columns'][i]['id']+'\t')
		for n,d in enumerate(distance_matrix[i]):
			sys.stdout.write(str(distance_matrix[i][n])+'\t')	
		print
	print
	print to_tree(linkage(distance_matrix, "single"))
	print
	print distance_matrix
	print
	print
	print np.triu(distance_matrix)
	print

	d=hierarchy.average(distance_matrix)
	print d
	print
	c = hierarchy.to_tree(hierarchy.average(np.triu(distance_matrix)))
	print c
	#PCoA_result.writeToFile(os.path.join(args.output_dir, args.file_prefix + '_pcoa_results.txt'),sep='\t')


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
