#!/usr/bin/env python

""" 
    distance.py


"""


import sys,os
import scipy
#from scipy.cluster import hierarchy
#from scipy.spatial.distance import pdist
from scipy.spatial import distance
import numpy as np
import argparse
import json
import csv
import skbio
import skbio.diversity.alpha as alpha
#from ete2 import Tree
#print >> sys.stderr, sys.argv[1:]

#from cogent.maths import distance_transform as dt


#
#
#
def alpha_diversity(args):
    """
        Our counts data in the biomfile is per OTU NOT per sample as needed.
        So it must be transformed
    """

    try:
        json_data = open('./tmp/'+args.in_file)
    except IOError:
        json_data = open(args.in_file)
    except:
        print "NO FILE FOUND ERROR"
        sys.exit()
    

    data = json.load(json_data)
    json_data.close()     
    #size = len(data['rows'])*len(data['columns'])
    #A = np.arange(size).reshape((len(data['rows']),len(data['columns'])))
    A = np.zeros(shape=(len(data['rows']),len(data['columns'])))
    #A.astype(int)
    #print A
    for i,counts in enumerate(data['data']):
        #print 'OTU:',data['rows'][i]['name'],  counts
        #print alpha.chao1(counts)
        A[i] = counts 
        #pass
    
    X = A.astype(int)   # insure int
    #print X
    Y = np.transpose(X)
    txt = "Dataset\tobserved richness\tACE\tchao1\tShannon\tSimpson\n"
    
    for i,row in enumerate(Y):
        ds = data['columns'][i]['name']
        #print ds+"\t"
        #print ds,row
        try:
            ace       = alpha.ace(row)
        except:
            ace = 'error'
        try:
            chao1     = alpha.chao1(row)
        except:
            chao1 = 'error'
        try:
            osd       = alpha.osd(row)
        except:
            osd = ['error']
        try:
            simpson   = alpha.simpson(row)
        except:
            simpson = 'error'
        try:
            shannon   = alpha.shannon(row)
        except:
            shannon = 'error'
        txt += ds+"\t"+str(osd[0])+"\t"+str(ace)+"\t"+str(chao1)+"\t"+str(shannon)+"\t"+str(simpson)+"\n"
    print txt[:-1]  # remove the trailing LF

        #print 'michaelis_menten_fit',alpha.michaelis_menten_fit(row,2)

if __name__ == '__main__':

    usage = """
    --in        json_file
    --metric    distance metric to calculate ['horn', ]
    """
    parser = argparse.ArgumentParser(description="Calculates distance from input JSON file", usage=usage)

    parser.add_argument('-in','--in',          required=True,  action="store",  dest='in_file',   help = '')
    parser.add_argument('-ff','--file_format', required=False, action="store",  dest='file_format',help = 'json or csv only', default='json')   
    #parser.add_argument('-metric','--metric',  required=False, action="store",  dest='metric',    help = 'Distance Metric', default='bray_curtis') 
    #parser.add_argument('-fxn','--function',   required=True,  action="store",  dest='function',  help = 'distance, dendrogram, pcoa, dheatmap, fheatmap') 
    parser.add_argument('-base','--site_base', required=True,  action="store",  dest='site_base', help = 'site base') 
    parser.add_argument('-pre','--prefix',     required=True,  action="store",  dest='prefix',    help = 'file prefix') 
    #parser.add_argument('-meta','--metadata',  required=False, action="store",  dest='metadata',  help = 'json metadata') 

    args = parser.parse_args()
    

    
    alpha_diversity(args)
    