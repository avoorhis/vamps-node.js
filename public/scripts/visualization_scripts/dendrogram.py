#!/usr/bin/env python

"""
	distance.py


"""
#!/usr/bin/python

# ./pcoa.py --mtx node_matrix.mtx --meta node_metadata.txt

import sys,os
import scipy
from scipy.cluster import hierarchy
from scipy.cluster.hierarchy import linkage, dendrogram
import matplotlib
matplotlib.use('Agg')   # png
import matplotlib.pyplot as plt
import numpy as np
import argparse
import json
import csv

from cogent.maths import distance_transform as dt


def calculate_distance(args):

	if args.file_format == 'json':
		try:
			json_data = open('./tmp/'+args.in_file)
		except IOError:
			json_data = open(args.in_file)
		except:
			print("NO FILE FOUND ERROR")
			sys.exit()

		data = json.load(json_data)
		json_data.close()
	else: # csv file
		# this doesn't work now
		with open('./tmp/'+args.in_file, 'rb') as csvfile:
			csv_data = csv.reader(csvfile, delimiter=',', quotechar='"')
			for row in csv_data:
				pass

	datasets = []
	for i in data['columns']:

		datasets.append(i['name'])

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

	distance_matrix1 = {}
	distance_matrix2 = {}
	mat = []
	out_fp = open(args.out_file,'w')

	file_header_line = ','.join([x['name'] for x in data['columns']]) + '\n'

	out_fp.write(file_header_line)


	for row,line in enumerate(data['columns']):
		name = line['name']
		distance_matrix1[name] = {}
		file_data_line = name+','
		for col,d in enumerate(dist[row]):
			file_data_line += str(dist[row][col])+','
			distance_matrix1[name][data['columns'][col]['name']]  = dist[row][col]
			distance_matrix2[(name, data['columns'][col]['name'])]  = dist[row][col]
		file_data_line = file_data_line[:-1]+'\n'
		out_fp.write(file_data_line)

	out_fp.close()
	#if args.function == 'distance' or args.function == 'heatmap':
	print(json.dumps(distance_matrix1))

	arr = []
	for ds1 in distance_matrix1:
		print(ds1)
		tmp = []
		for ds2 in distance_matrix1[ds1]:
			val = distance_matrix1[ds1][ds2]
			tmp.append(val)
		arr.append(tmp)
	#np.array(arr)

	linkage_matrix = linkage(arr,  "single")
	dendrogram(linkage_matrix,           color_threshold=1,                show_leaf_counts=True)
	#image_file = '/Users/avoorhis/node_projects/vamps-node.js/public/tmp_images/'+args.prefix+'.png'
	image_file = 'public/tmp_images/'+args.prefix+'.png'
	plt.savefig(image_file)


# distance_matrix1:  JSON
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

# distance_matrix2:   NOT good JSON, but works with pycogent
# {
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_1Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep2_1Step'): 0.32185444543965835,
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep2_1Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_2Step'): 0.95288201941646389,
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_1Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_1Step'): 0.0,
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_2Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_1Step'): 0.97554598143130711,
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep2_1Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep2_1Step'): 0.0,
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_1Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_2Step'): 0.97554598143130711,
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep2_1Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_1Step'): 0.32185444543965835,
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_2Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_2Step'): 0.0,
#  ('BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_2Step', 'BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep2_1Step'): 0.95288201941646389
# }
def write_csv_file(args):
	file_name = 'distance.csv'

#
#
#
def construct_newick(dist):
	from cogent.cluster.UPGMA import upgma

	mycluster = upgma(dist)
	newick = mycluster.getNewick(with_distances=True)
	print(json.dumps(newick))
#
#
#
def construct_pcoa(dist_matrix):
	pass
#
#
#
def plot_tree( P, pos=None ):
		import matplotlib.pylab as plt
		icoord = scipy.array( P['icoord'] )
		dcoord = scipy.array( P['dcoord'] )
		color_list = scipy.array( P['color_list'] )
		xmin, xmax = icoord.min(), icoord.max()
		ymin, ymax = dcoord.min(), dcoord.max()
		if pos:
		    icoord = icoord[pos]
		    dcoord = dcoord[pos]
		    color_list = color_list[pos]
		for xs, ys, color in zip(icoord, dcoord, color_list):
		    plt.plot(xs, ys,  color)
		plt.xlim( xmin-10, xmax + 0.1*abs(xmax) )
		plt.ylim( ymin, ymax + 0.1*abs(ymax) )
		plt.show()
#
#
#
def get_json(node):
	# Read ETE tag for duplication or speciation events
	from ete2 import Tree
	import random
	if not hasattr(node, 'evoltype'):
		dup = random.sample(['N','Y'], 1)[0]
	elif node.evoltype == "S":
		dup = "N"
	elif node.evoltype == "D":
		dup = "Y"

	node.name = node.name.replace("'", '')
	json = { "name": node.name,
			"display_label": node.name,
			"duplication": dup,
			"branch_length": str(node.dist),
			"common_name": node.name,
			"seq_length": 0,
			"type": "node" if node.children else "leaf",
			"uniprot_name": "Unknown",
			}
	if node.children:
		json["children"] = []
		for ch in node.children:
			json["children"].append(get_json(ch))
	return json
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
	parser.add_argument('-out','--out',   required=True,  action="store",   dest='out_file', help = 'output distance fp')
	parser.add_argument('-ff','--file_format',   required=False,  action="store",   dest='file_format', default='json', help = 'json or csv only')
	parser.add_argument('-pre','--prefix', required=True, action="store",   dest='prefix', help = 'file prefix')
	parser.add_argument('-metric','--metric', required=False, action="store",   dest='metric', help = '', default='bray_curtis')
 	parser.add_argument('-fxn','--function', required=True, action="store",   dest='function', help = 'distance, dendrogram, pcoa')

 	args = parser.parse_args()
	dist2 = calculate_distance(args)

	if args.function == 'dendrogram':
		#construct_newick(dist2)
		pass



		# from scipy.cluster import hierarchy
		# from scipy.spatial import distance
		# from hcluster import pdist, linkage, dendrogram, to_tree, squareform
		# from ete2 import Tree, ClusterTree

		# condensed_dm = distance.squareform(dist)
		# print condensed_dm   # [ 0.97554598  0.32185445  0.95288202]
		# T = hierarchy.linkage(condensed_dm, method='single', metric='euclidean')
		# print T
		# # ndarray:
		# # [[ 0.          2.          0.32185445  2.        ]
 	# 	# [ 1.          3.          0.95288202  3.        ]]

		# P = hierarchy.dendrogram(T)
		#plot_tree(P)



	if args.function == 'pcoa':
		#pcoa = construct_pcoa(dist)
		pass
