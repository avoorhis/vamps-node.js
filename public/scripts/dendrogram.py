#!/usr/bin/python

""" 
	dendrogram.py


"""
#!/usr/bin/python

# ./pcoa.py --mtx node_matrix.mtx --meta node_metadata.txt

import sys,os
#import scipy
import numpy as np
import argparse
import json
import csv
import fileinput   # allows capture of stdin
#import Bio
from cogent.maths import distance_transform as dt




	

	#PCoA_result.writeToFile(os.path.join(args.output_dir, args.file_prefix + '_pcoa_results.txt'),sep='\t')


#
#
#
print 'lll'
print __name__
for line in fileinput.input():
	print line


if __name__ == '__main__':
	
 	usage = """
 		--in   		json_file
 		--metric	distance metric to calculate ['horn', ]
 	"""
 	parser = argparse.ArgumentParser(description="Calculates distance from input JSON file", usage=usage)
 	parser.add_argument('-in','--input',   required=False,  action="store",   dest='in_file', help = 'stdin or file')
 	parser.add_argument('-ff','--file_format',   required=False,  action="store",   dest='file_format', default='json', help = 'json or csv only')
 	parser.add_argument('-metric','--metric', required=False, action="store",   dest='metric', help = '', default='bray_curtis') 
 	 	
# 	#print sys.stdin
#  	args = parser.parse_args()
# 	#distance(args) 
