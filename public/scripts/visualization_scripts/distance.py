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
#from ete2 import Tree
#print >> sys.stderr, sys.argv[1:]
# cogent will be phased out in python3
from cogent.maths import distance_transform as dt
#print sys.path

def go_distance(args):
    #print args

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
        with open('./tmp/'+args.in_file, 'rb') as csvfile:
            csv_data = csv.reader(csvfile, delimiter=',', quotechar='"')
            for row in csv_data:
                pass

    datasets = []

    for i in data['columns']:
        #print i['id']
        datasets.append(i['id'])


    z = np.array(data['data'])
    #dmatrix = np.transpose(z)


    (dmatrix, bad_rows) = remove_zero_sum_datasets(np.transpose(z))

    # find zero sum rows (datasets) after transpose

    #print(dmatrix)
    # delete datasets too:
    edited_dataset_list=[]
    #edited_did_hash = {}
    for row,line in enumerate(data['columns']):
        if row not in bad_rows[0]:
            edited_dataset_list.append(line['id'].encode("utf-8"))

    #print(edited_dataset_list)
    dist = get_dist(args.metric, dmatrix)
    dm1 = get_data_matrix1(dist)



    dm2 = {}
    dm3 = {}

    out_file = os.path.join(args.outdir, args.prefix+'_distance.csv')
    out_fp = open(out_file,'w')

    file_header_line = ','.join([x['id'] for x in data['columns']]) + '\n'

    out_fp.write(file_header_line)


    for row,name in enumerate(edited_dataset_list):
            #name = line['name']
            dm2[name.encode("utf-8")] = {}
            file_data_line = name+','
            for col,d in enumerate(dm1[row]):
                #print data['columns'][col]['id']
                file_data_line += str(dm1[row][col])+','
                dm2[name][data['columns'][col]['id'].encode("utf-8")]  = dm1[row][col]
                dm3[(name.encode("utf-8"), (data['columns'][col]['id'].encode("utf-8")))]  = dm1[row][col]
            file_data_line = file_data_line[:-1]+'\n'
            out_fp.write(file_data_line)


    out_fp.close()
    #print(edited_dataset_list)
    #print(dm1)
    #print dm3
    #print edited_dataset_list
    #return (dm1, dist, dm2, dm3, edited_dataset_list, edited_did_hash)
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

def get_dist(metric, mtx):
    if metric == 'bray_curtis':
        dtvar = dt.dist_bray_curtis(mtx, strict=False)
    elif metric == 'morisita_horn':
        dtvar = dt.dist_morisita_horn(mtx, strict=False)
    elif metric == 'canberra':
        dtvar = dt.dist_canberra(mtx, strict=False)
    elif metric == 'jaccard':
        dtvar = dt.binary_dist_jaccard(mtx, strict=False)
    elif metric == 'kulczynski':
        dtvar = dt.dist_kulczynski(mtx, strict=False)
    else:  # default
        dtvar = dt.dist_bray_curtis(mtx, strict=False)

    dist = distance.squareform( dtvar )
    return dist

def get_data_matrix1(dist):
    return distance.squareform(dist)

def remove_zero_sum_datasets(mtx):
    bad_rows = np.nonzero(mtx.sum(axis=1) == 0)
    #print(mtx)
    mtx = np.delete(mtx, bad_rows, axis=0)
    #print(mtx)
    return (mtx, bad_rows)

#
#
#



#
#
#
if __name__ == '__main__':

    usage = """
    -in/--in                json_file
    -/metric/--metric       distance metric to calculate ['horn', ]
    -fxn/--function         [distance, dendrogram, pcoa, dheatmap, fheatmap]
    -outdir/--outdir
    -pre/--prefix

    IMPORTANT -- no print statements allowed in functions
    """
    parser = argparse.ArgumentParser(description="Calculates distance from input JSON file", usage=usage)

    parser.add_argument('-in','--in',          required=True,  action="store",  dest='in_file',   help = '')
    parser.add_argument('-ff','--file_format', required=False, action="store",  dest='file_format',help = 'json or csv only', default='json')
    parser.add_argument('-metric','--metric',  required=False, action="store",  dest='metric',    help = 'Distance Metric', default='bray_curtis')
    parser.add_argument('-fxn','--function',   required=True,  action="store",  dest='function',  help = 'distance, dendrogram, pcoa, dheatmap, fheatmap')
    #parser.add_argument('-base','--site_base', required=True,  action="store",  dest='site_base', help = 'site base')
    parser.add_argument('-outdir','--outdir',   required=True,  action="store",  dest='outdir', help = 'site base')
    parser.add_argument('-pre','--prefix',     required=True,  action="store",  dest='prefix',    help = 'file prefix')
    #parser.add_argument('-meta','--metadata',  required=False, action="store",  dest='metadata',  help = 'json metadata')

    args = parser.parse_args()


    ( dm1, dist, dm2, dm3, datasets ) = go_distance(args)

    if args.function == 'cluster_datasets':
        #did_list = cluster_datasets(args, dm3, did_hash)
        new_ds_list = cluster_datasets(args, dm3)
        print(json.dumps(new_ds_list))


    if args.function == 'fheatmap':
        # IMPORTANT print for freq heatmap
        print(dist.tolist())


    if args.function == 'dheatmap':
        # IMPORTANT print for dist heatmap
        print(json.dumps(dm2))

    if args.function == 'dendrogram-svg':
        newick = dendrogram_svg(args, dm3)
        # print newick
        # from ete2 import Tree
        # unrooted_tree = Tree( newick )
        # print unrooted_tree
        # IMPORTANT print for SVG
        print(json.dumps(newick))

    if args.function == 'dendrogram-pdf':
        #print distances
        dendrogram_pdf(args, dm1, datasets)

    if args.function == 'pcoa_3d':
        pcoa_data = pcoa(args, dm3)
        #test_PCoA()

    if args.function == 'pcoa_2d':
        # if not args.metadata:
        #   print "ERROR: In PCoA and no metadata recieved"
        #   sys.exit()

        pcoa_data = pcoa(args, dm3)
        #print json.dumps(pcoa_data)

        #metadata = json.loads( args.metadata.strip("'") )
        pcoa_pdf(args, pcoa_data)
        #print pcoa_data

        pass
