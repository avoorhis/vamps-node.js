#!/usr/bin/env python

""" 
	distance.py


"""
#!/usr/bin/python

# ./pcoa.py --mtx node_matrix.mtx --meta node_metadata.txt

import sys,os
import scipy
#from scipy.cluster import hierarchy
#from scipy.spatial.distance import pdist
from scipy.spatial import distance
import numpy as np
import argparse
import json
import csv
#print >> sys.stderr, sys.argv[1:]

from cogent.maths import distance_transform as dt


def calculate_distance(args):
	
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
		datasets.append(i['name'])
	
	z = np.array(data['data'])
	dmatrix = np.transpose(z)
	#print dmatrix
	# find zero sum rows (datasets) after transpose
	bad_rows = np.nonzero(dmatrix.sum(axis=1) == 0)
	#print bad_rows
	# now remove them
	dmatrix = np.delete(dmatrix, bad_rows, axis=0)
	# delete datasets too:
	edited_dataset_list=[]
	for row,line in enumerate(data['columns']):
		if row not in bad_rows[0]:
			edited_dataset_list.append(line['name'])

	#print edited_dataset_list
	
	if args.metric == 'bray_curtis':
		#dist = dt.dist_bray_curtis(dm)
		dist = distance.pdist(dmatrix, 'braycurtis')
	
	elif args.metric == 'morisita_horn':
		#print dmatrix
		dtvar = dt.dist_morisita_horn(dmatrix, strict=False)
		#print '2'
		dist = distance.squareform( dtvar )

		#sys.exit()
	elif args.metric == 'canberra':
		
		#dist = dt.dist_canberra(dm)
		#print 'canberra'
		dist = distance.pdist(dmatrix, 'canberra')
	
	elif args.metric == 'jaccard':
		#dist = dt.binary_dist_jaccard(dm)	
		dist = distance.pdist(dmatrix, 'jaccard')
	 
	elif args.metric == 'kulczynski':

		#dist = dt.dist_kulczynski(dm)	
		# note different spelling
		dist = distance.pdist(dmatrix, 'kulsinski')
		
	else:  # default
		dist = distance.pdist(dmatrix, 'braycurtis')

	#print data['columns']
	
	dm1 = distance.squareform(dist)
	# dist in in condensed form
	# dm1 is in long form
	#print dm1
	#print dist
	

	dm2 = {}
	dm3 = {}

	out_file = os.path.join(args.site_base,'tmp',args.prefix+'_distance.csv')
	
	out_fp = open(out_file,'w')
	
	file_header_line = ','.join([x['name'] for x in data['columns']]) + '\n'

	out_fp.write(file_header_line)


	#print dm1
	for row,name in enumerate(edited_dataset_list):
			#name = line['name']
			dm2[name] = {}	
			file_data_line = name+','	
			for col,d in enumerate(dm1[row]):
				#print data['columns'][col]['id']
				file_data_line += str(dm1[row][col])+','
				dm2[name][data['columns'][col]['name']]  = dm1[row][col]
				dm3[(name, data['columns'][col]['name'])]  = dm1[row][col]
			file_data_line = file_data_line[:-1]+'\n'
			out_fp.write(file_data_line)

	
	out_fp.close()
	
	#print dm1
 	
	return (dm1, dist, dm2, dm3, edited_dataset_list)
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
def dendrogram_pdf(args, dm, leafLabels):
        from scipy.cluster.hierarchy import linkage, dendrogram
        #from hcluster import squareform, linkage, dendrogram
        #from numpy import array
        #import pylab
        import matplotlib
        matplotlib.use('PDF')   # pdf
        import matplotlib.pyplot as plt
        #condensed_dm = distance.squareform( dm )
        #plt.figure(figsize=(100,10))
        leafNodes = len(leafLabels)
        fig = plt.figure(figsize=(14,(leafNodes*0.25)), dpi=100)
        #fig = plt.figure(figsize=(14,100), dpi=10)
        #fig.set_size_inches(14,(leafNodes*0.2))
        #ax = fig.add_subplot(111)
        #plt.tight_layout()
        #ax.set_title('Dendrogram: '+args.metric.capitalize())
        # padding:
        #plt.subplots_adjust(bottom=0.25)
        #plt.subplots_adjust(top=0.05)
        plt.subplots_adjust(left=0.01)
        plt.subplots_adjust(right=0.65)
        plt.subplots_adjust(top=0.7)
        plt.subplots_adjust(bottom=0.25)
        #leafLabels = [ '\n'.join(l.split('--')) for l in leafLabels ]

        print datasets
        linkage_matrix = linkage(dm,  method="average" )
        dendrogram(linkage_matrix,  color_threshold=1,  leaf_font_size=6,  orientation='right', labels=leafLabels)
        #image_file = '/Users/avoorhis/node_projects/vamps-node.js/public/tmp_images/'+args.prefix+'.png'
        image_file = os.path.join(args.site_base,'public/tmp_images',args.prefix+'_dendrogram.pdf')


        plt.savefig(image_file)

def dendrogram_svg(args, dm):
		#print json.dumps(dm)
		newick = construct_newick(args, dm)
		return newick

def write_csv_file(args):
		file_name = 'distance.csv'

#
#
#
def construct_newick(args, dm):
		from cogent.cluster.UPGMA import upgma

		mycluster = upgma(dm)
		newick = mycluster.getNewick(with_distances=True)	
		#print mycluster.asciiArt()
		return newick
		
		

		# from scipy.cluster.hierarchy import linkage, to_tree
		# condensed_dm = distance.squareform( dm )
		# print condensed_dm
		# linkage_matrix = linkage(condensed_dm,  method="average", metric=args.metric)
		# newick = to_tree(linkage_matrix)		
		
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
def pcoa(args, dist):
    from cogent.cluster.metric_scaling import PCoA
    PCoA_result = PCoA(dist)
    #print PCoA_result
    #dt = np.dtype(float)
    #print type(PCoA_result)
    a = np.array(PCoA_result)[0:,0:5]   # capture only the first three vectors
    
    json_array = {}
    json_array["P1"] = a[:,2].tolist()[:-2]  # remove the last two which are not eigen vectors
    json_array["P2"] = a[:,3].tolist()[:-2]
    json_array["P3"] = a[:,4].tolist()[:-2]
    json_array["names"] = a[:,1].tolist()[:-2]
    
    #json['v2'] = [x[0] for x in np.array(PCoA_result[:,3])[:-2]]
    #json['v3'] = [x[0] for x in np.array(PCoA_result[:,4])[:-2]]
    #json['v3'] = [x[0] for x in np.array(PCoA_result[:,4])[:-2]]
    # sprint json_array
    return json_array
    #return a
#
#
#
#
def pcoa_pdf(args, data):
		import matplotlib
		matplotlib.use('PDF')   # pdf
		import pylab
		from pylab import rcParams		
		import matplotlib.pyplot as plt

		
		metadata = {}
		try:
			with open('./'+args.prefix+'_metadata.txt', 'rb') as csvfile:
				metadata_raw = csv.DictReader(csvfile, delimiter="\t")
				# each row is a dataset
				for row in metadata_raw:
					ds = row['DATASET'].strip("'")
					metadata[ds] = row
		except IOError:
			with open('./tmp/'+args.prefix+'_metadata.txt', 'rb') as csvfile:
				metadata_raw = csv.DictReader(csvfile, delimiter="\t")
				for row in metadata_raw:
					ds = row['DATASET'].strip("'")
					metadata[ds] = row
		except:
			print "NO FILE FOUND ERROR"
			sys.exit()
		
		
		
		ds_order = data['names']
		
		color_choices = ['b','g','r','c','m','y','k','w']  # currently limited to 8 distinct colors
		meta_dict = {}
		#val_lookup = {}
		#colors = {}
		ds_vals = {}
		new_ds_order = []
 		for ds in ds_order:			
 			if ds in metadata:
 				new_ds_order.append(ds)
	 			for md_name in metadata[ds]:
	 			 	md_val = metadata[ds][md_name]
	 			
	 				if md_name in meta_dict:
	 					meta_dict[md_name][md_val]=1
	 				else:
	 					meta_dict[md_name]={}
	 					meta_dict[md_name][md_val]=1
 		#print colors
 		#print ds_vals
 		ds_order = new_ds_order
 		ds_count = len(ds_order)
 		meta_names_list = sorted(meta_dict.keys()) # sort the list by alpha
 		#print meta_names_list
 		meta_names_count = len(meta_dict) 		

 		rcParams['figure.figsize'] = 10, meta_names_count*2

 		#N = 50
		#colors = np.random.rand(N)
		ds_vals2 = {}
		for i,mname in enumerate(meta_names_list):
			ds_vals2[mname] = {}
			num_of_colors_needed = len(meta_dict[mname])
			for i,val in enumerate(meta_dict[mname]):				
				if(num_of_colors_needed <= len(color_choices)):
					ds_vals2[mname][val] = color_choices[i]

		#print ds_vals2
		if metadata:
			f1, ax = plt.subplots(meta_names_count, 3, sharex=True, sharey=True)
			for i,mname in enumerate(meta_names_list):
				# i is 0,1,2,3...
				num_of_colors_needed = len(meta_dict[mname])
				#print num_colors
				col=[]
				for ds in ds_order:
					if(num_of_colors_needed > len(color_choices)):
						col.append('b')  # all blue
					else:
						val = metadata[ds][mname]
						col.append(ds_vals2[mname][val])	
				#print mname,col
				ax[i,1].set_title(mname)			
				ax[i,0].scatter(data['P1'], data['P2'], c=col) # this color array has to be as long as the # of datasets and in the same order
				ax[i,1].scatter(data['P1'], data['P3'], c=col)
				ax[i,2].scatter(data['P2'], data['P3'], c=col)		
			ax[0,0].set_title('P1-P2')
			ax[0,2].set_title('P2-P3')
			
			image_file = os.path.join(args.site_base,'public/tmp_images',args.prefix+'_pcoa.pdf')
			pylab.savefig(image_file, bbox_inches='tight')
		else:
			print 'no metadata'
#
#
#
if __name__ == '__main__':

    usage = """
    --in   		json_file
    --metric	distance metric to calculate ['horn', ]
    """
    parser = argparse.ArgumentParser(description="Calculates distance from input JSON file", usage=usage)

    parser.add_argument('-in','--in',          required=True,  action="store",  dest='in_file',   help = '')
    parser.add_argument('-ff','--file_format', required=False, action="store",  dest='file_format',help = 'json or csv only', default='json')	
    parser.add_argument('-metric','--metric',  required=False, action="store",  dest='metric',    help = 'Distance Metric', default='bray_curtis') 
    parser.add_argument('-fxn','--function',   required=True,  action="store",  dest='function',  help = 'distance, dendrogram, pcoa, dheatmap, fheatmap') 
    parser.add_argument('-base','--site_base', required=True,  action="store",  dest='site_base', help = 'site base') 
    parser.add_argument('-pre','--prefix',     required=True,  action="store",  dest='prefix',    help = 'file prefix') 
    #parser.add_argument('-meta','--metadata',  required=False, action="store",  dest='metadata',  help = 'json metadata') 

    args = parser.parse_args()
	

    ( dm1, short_dm1, dm2, dm3, datasets ) = calculate_distance(args) 

    if args.function == 'fheatmap':
        # IMPORTANT print for freq heatmap
        print short_dm1.tolist()


    if args.function == 'dheatmap':
        # IMPORTANT print for dist heatmap
        print json.dumps(dm2)

    if args.function == 'dendrogram-svg':
        newick = dendrogram_svg(args, dm3)
        # IMPORTANT print for SVG
        print json.dumps(newick)

    if args.function == 'dendrogram-pdf':
        #print distances
        dendrogram_pdf(args, dm1, datasets)

    if args.function == 'pcoa':
        # if not args.metadata:
        # 	print "ERROR: In PCoA and no metadata recieved"
        # 	sys.exit()
				
        pcoa_data = pcoa(args, dm3)
        #print json.dumps(pcoa_data)

        #metadata = json.loads( args.metadata.strip("'") )	 
        pcoa_pdf(args, pcoa_data)
        #print pcoa_data

        pass



