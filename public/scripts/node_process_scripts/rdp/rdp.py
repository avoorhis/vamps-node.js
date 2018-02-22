#!/usr/bin/env python

#########################################
#
# rdp.py
#
########################################

############################################################
import os
import sys
import logging

import subprocess
"""
	This will classify taxonomy of 16s sequences of >200nt.

	USAGE: $0 <infile> <outfile>

	<infile> is a file of fasta sequences
	<outfile> will contain the taxonomic assignments and boot strap values

"""


############################################################


#def run_rdp(infile, outfile, process_dir, rdp_script_dir, ref_db_dir='2.10.1'):
def run_rdp(uniquefile, outfile, classifier, gene, site):	
	
    
    #PATH_2_JAVA = "/usr/bin/java"
    PATH_2_JAVA = "java"
    ## for vamps and vampsweb:: /groups/vampsweb/seqinfobin/rdp_classifier_2.6      
           
    # default configuration
    #properties_file = os.path.join(classifier_dir,"train","rRNAClassifier.properties")

    # the classifier must be kept with its directory structure
    
    
    rdp_cmd = PATH_2_JAVA + " -Xmx4000M -jar "+classifier+" -g "+gene+" -o "+outfile+" -f fixrank "+ uniquefile
    try:
        #rdp_cmd = PATH_2_JAVA + " -Xmx2400m -jar "+classifier_cmd+" -q "+infile+" -o "+outfile+" -t "+properties_file+" -f fixrank"
        # use non-trained as default:
        
        logging.debug('RDPCMD: '+rdp_cmd)
        print(rdp_cmd)

        subprocess.call(rdp_cmd, shell=True)

    except:
        print("ERROR in RDP:  java - classifier: "+rdp_cmd)
        sys.exit(-23)


if __name__ == '__main__':
    import argparse



    myusage = """usage: rdp.py  [options]
     
         This is will start the (customized) python_pipeline
         for the GAST process, creating the vamps_* files
         for input to the new_vamps database.
     
         where
        
            OPTION not used -- called from vamps_script_rdp_run.py

    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
   
    parser.add_argument("-i", "--infile",             
    			required=True,  action="store",   dest = "infile",
                help="config file with path") 
    parser.add_argument('-o', '--outfile',         
    			required=True,   action="store",  dest = "outfile",            
                help = 'node database')                                           

  #   parser.add_argument('-ref_db', '--reference_db',
#      			required=False,   action="store",  dest = "ref_db",
#                  help = 'gast or rdp')
    parser.add_argument('-rdp_dir', '--rdp_dir',
                required=True,   action="store",  dest = "rdp_script_dir",
                 help = 'The base directory where to find classifier.jar')
    parser.add_argument("-site", "--site",
    			required=False,  action="store",   dest = "site",
                help = 'vamps, vampsdev or local')
   #  parser.add_argument("-pdir", "--process_dir",
#                 required=False,  action="store",   dest = "process_dir", default='/',
#                 help = '')
    args = parser.parse_args() 



    #os.chdir(os.path.expanduser('~/programming/vamps-node.js'))
    #os.chdir(args.baseoutputdir)
    run_rdp(args.infile, args.outfile, args.process_dir,  args.rdp_script_dir, args.site)


    
	
	
	
	