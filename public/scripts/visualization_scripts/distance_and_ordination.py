#!/usr/bin/env python

"""
    distance_and_ordination.py


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
import pandas as pd
#from pathlib import Path
#from ete2 import Tree
#print >> sys.stderr, sys.argv[1:]
# cogent will be phased out in python3
from skbio import DistanceMatrix
from cogent3.maths import distance_transform as dt
#print sys.path

def go_distance(args):
    #print args

    try:
        json_data = open(args.in_file)
        data = json.load(json_data)
        json_data.close()
    except:
        print("NO FILE FOUND ERROR")
        sys.exit()

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
            edited_dataset_list.append(line['id'])

    #print(edited_dataset_list)
    dist = get_dist(args.metric, dmatrix)
    dm1 = get_dist_matrix1(dist)

    dm2 = {}
    dm3 = {}

    for row,name in enumerate(edited_dataset_list):
            name = str(name)
            dm2[name] = {}
            file_data_line = name+','
            for col,d in enumerate(dm1[row]):
                #print data['columns'][col]['id']
                file_data_line += str(dm1[row][col])+','
                dm2[name][str(data['columns'][col]['id'])]  = dm1[row][col]
                dm3[(name, str(data['columns'][col]['id']))]  = dm1[row][col]
            file_data_line = file_data_line[:-1]+'\n'
            #out_fp.write(file_data_line)

    out_file2 = os.path.join(args.basedir, 'tmp',args.prefix+'_distance.json')
    
    #my_file = Path(out_file2)
    if not os.path.exists(out_file2):
        out_fp2 = open(out_file2,'w')
        out_fp2.write(json.dumps(dm2))
        out_fp2.close()
    
    dm1 = DistanceMatrix(dm1)  # convert to scikit-bio DistanceMatrix (v 0.5.1)
    dm1.ids = edited_dataset_list  # assign row names
    #print(dm1)
    return (dm1, edited_dataset_list)
# dm1: [[]]  skbio.stats.distance.DistanceMatrix
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

def get_dist_matrix1(dist):
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


        linkage_matrix = linkage(dm,  method="average" )
        dendrogram(linkage_matrix,  color_threshold=1,  leaf_font_size=6,  orientation='right', labels=leafLabels)
        image_file = os.path.join(args.basedir, 'tmp',args.prefix+'_dendrogram.pdf')

        plt.savefig(image_file)

def dendrogram_newick(args, dm1):
      # apply the ds names as ids
    mynewick = construct_cluster(args, dm1)
    newick_file = os.path.join(args.basedir,'tmp',args.prefix+'_newick.tre')
    mynewick.write(newick_file)
    
    return mynewick

def cluster_datasets(args, dm1):

    new_ds_order  = []
    new_did_order = []
    
    mynewick = construct_cluster(args, dm1)

    ascii_tree = mynewick.ascii_art()
    ascii_file = args.prefix+'_'+args.metric+'_tree.txt'
    ascii_file_path = os.path.join(args.basedir, 'tmp',ascii_file)
    fp = open(ascii_file_path,'w')
    fp.write(ascii_tree)
    fp.close()
    #nodenames =  mycluster.getNodeNames()
    #print nodenames
    for node in mynewick.preorder():
        if str(node.name) != 'None':
            #did = did_hash[ds]
            new_ds_order.append(str(node.name).replace(' ','_'))
    return new_ds_order



def write_csv_file(args):
        file_name = 'distance.csv'
#
#
#
def construct_cluster(args, dm):
        
        # neighbor joining:
        from skbio.tree import nj
        mycluster = nj(dm)
        return mycluster


#
#
#
def construct_pcoa(dist_matrix):
    pass
#

#
#
#
def create_emperor_visual(args, pcfile):
    """
    Sample .pc file
    #     Eigvals	4
    # 0.2705559825337763	0.07359266496720843	0.02997793703738496	0.0
    # 
    # Proportion explained	4
    # 0.7231669539538659	0.19670525434062255	0.0801277917055116	0.0
    # 
    # Species	0	0
    # 
    # Site	4	4
    # ICM_LCY_Bv6--LCY_0001_2003_05_11	-0.04067063044757823	-0.09380781760926289	0.13680474645584195	0.0
    # ICM_LCY_Bv6--LCY_0003_2003_05_04	-0.11521436634022217	-0.15957409396683217	-0.10315005726535573	0.0
    # ICM_LCY_Bv6--LCY_0005_2003_05_16	0.4268532792747924	0.06657577342833808	-0.02212569426459717	0.0
    # ICM_LCY_Bv6--LCY_0007_2003_05_04	-0.2709682824869916	0.18680613814775715	-0.011528994925888972	0.0
    # 
    # Biplot	0	0
    # 
    # Site constraints	0	0
    """
    #print PCoA_result
    from emperor import Emperor
    from skbio import OrdinationResults
    
    #load metadata
    mf = load_mf(args.map_fp)
    # must read from file (scikit-bio version 0.5.1 http://scikit-bio.org/docs/0.5.1/generated/generated/skbio.stats.ordination.OrdinationResults.html
    res = OrdinationResults.read(pcfile)
    emp = Emperor(res, mf)
    pcoa_outdir = os.path.join(args.basedir,'views', 'tmp',args.prefix+'_pcoa3d')
    print('OUT?',pcoa_outdir,args.basedir)
    os.makedirs(pcoa_outdir, exist_ok=True)
    with open(os.path.join(pcoa_outdir, 'index.html'), 'w') as f:
        f.write(emp.make_emperor(standalone=True))
        emp.copy_support_files(pcoa_outdir)
   
def load_mf(fn):
    from skbio.io.util import open_file
    from emperor.qiime_backports.parse import parse_mapping_file
    with open_file(fn) as f:
        mapping_data, header, _ = parse_mapping_file(f)
        _mapping_file = pd.DataFrame(mapping_data, columns=header)
        _mapping_file.set_index('SampleID', inplace=True)
    return _mapping_file

def write_mf(f, _df):
    from emperor.qiime_backports.format import format_mapping_file
    with open(f, 'w') as fp:
        lines = format_mapping_file(['SampleID'] + _df.columns.tolist(),
                                    list(_df.itertuples()))
        fp.write(lines+'\n')

def create_emperor_pc_file(args, dist, ds_list):
    #from cogent3.cluster.metric_scaling import PCoA
    from skbio.stats.ordination import pcoa
    PCoA_result = pcoa(dist)
    PCoA_result.samples.index = ds_list
    pcfile = os.path.join(args.basedir, 'tmp',args.prefix+'_pc.txt')
    PCoA_result.write(pcfile)
    
    return pcfile
   
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
                    ds = row['#SampleID'].strip("'")
                    row.pop('BarcodeSequence',None)
                    row.pop('LinkerPrimerSequence',None)
                    #print row

                    metadata[ds] = row
        except:
            print("NO FILE FOUND ERROR")
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

            image_file = os.path.join(args.basedir, 'tmp',args.prefix+'_pcoa.pdf')
            pylab.savefig(image_file, bbox_inches='tight')
        else:
            print('no metadata')
#
#
#
if __name__ == '__main__':

    usage = """
    
        distance_and_ordination.py
    -in/--in                REQUIRED json biom file
    -/metric/--metric       distance metric to calculate [default:bray_curtis]
    -fxn/--function         REQUIRED [distance, dendrogram, pcoa, dheatmap, fheatmap]
    -basedir/--basedir      REQUIRED
    -pre/--prefix           REQUIRED
    -m/--map_fp             path to metadata file [format: http://qiime.org/documentation/file_formats.html]

    IMPORTANT -- no print statements allowed in functions
    """
    parser = argparse.ArgumentParser(description="Calculates distance from input JSON file", usage=usage)

    parser.add_argument('-in','--in',          required=True,  action="store",  dest='in_file',   help = 'input json biom file')
    parser.add_argument('-metric','--metric',  required=False, action="store",  dest='metric',    help = 'Distance Metric', default='bray_curtis')
    parser.add_argument('-fxn','--function',   required=True,  action="store",  dest='function',  help = 'distance, dendrogram, pcoa, dheatmap, fheatmap')
    parser.add_argument('-basedir','--basedir',required=True,  action="store",  dest='basedir',   help = 'site base')
    parser.add_argument('-pre','--prefix',     required=True,  action="store",  dest='prefix',    help = 'file prefix')
    parser.add_argument('-m','--map_fp',       required=False, action="store",  dest='map_fp',    help = 'metadata file path',default=None)

    args = parser.parse_args()

    # saves distance file:
    ( dm1, datasets ) = go_distance(args)

    if args.function == 'cluster_datasets':
        #did_list = cluster_datasets(args, dm3, did_hash)
        new_ds_list = cluster_datasets(args, dm1)
        # IMPORTANT print the dataset list
        print('DS_LIST=',json.dumps(new_ds_list))

 #    if args.function == 'fheatmap':
#         # IMPORTANT print for freq heatmap
#         print(dist.tolist())


    # if args.function == 'dheatmap':
#         # IMPORTANT print for dist heatmap
#         #print(json.dumps(dm2))
#         pass

    if args.function == 'dendrogram-d3':
        
        newick = dendrogram_newick(args, dm1)
        # IMPORTANT print for D3
        print('NEWICK=',newick)

    if args.function == 'dendrogram-pdf':
        #print distances
        dendrogram_pdf(args, dm1)

#     if args.function == 'dendrogram':
#         # Notebook only
#         from ete3 import Tree, TreeStyle
#         from cogent3 import LoadTree
#         #from cogent3.draw import dendrogram
#         #from cogent3.draw.dendrogram import UnrootedDendrogram
#         newick = dendrogram_newick(args, dm1)
#         newick_file = os.path.join(args.outdir,args.prefix+'_newick.tre')
#         fp = open(newick_file,'w')
#         fp.write(newick)
#         fp.close()
#         tr = LoadTree(treestring=newick)
#         #dendrogram = UnrootedDendrogram(tr)
#         #print dendrogram
#         #dendrogram.showFigure()
# 
#         print(tr.asciiArt())
#         ts = TreeStyle()
#         ts.show_leaf_name = True
#         ts.show_branch_length = True
#         ts.show_branch_support = True
#         print('NEWICK='+json.dumps(newick))
#         rooted_tree = Tree( newick )
#         #svgfile = os.path.join('/Users/avoorhis/programming/jupyter/VAMPS_API',args.prefix+'_dendrogram.svg')
#         svgfile = os.path.join(args.outdir,args.prefix+'_dendrogram.svg')
#         print(os.getcwd())
#         #print svgfile
#         print('rendering0')
#         rooted_tree.render(svgfile, tree_style=ts)  # writes file to tmp



    if args.function == 'pcoa_3d':
        print('starting pcoa_3d')
        
        #print(dm)
        #print('end')
        pcfile = create_emperor_pc_file(args, dm1, datasets)
        create_emperor_visual(args, pcfile)
        #test_PCoA()

    # pcoa_2d is calculated with an R script:  pcoa2.R
  #   if args.function == 'pcoa_2d':
#         # if not args.metadata:
#         #   print "ERROR: In PCoA and no metadata recieved"
#         #   sys.exit()
# 
#         pcoa_data = pcoa(args, dm3)
#         #print json.dumps(pcoa_data)
# 
#         #metadata = json.loads( args.metadata.strip("'") )
#         pcoa_pdf(args, pcoa_data)
#         #print pcoa_data
# 
#         pass
