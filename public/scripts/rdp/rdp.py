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


def run_rdp(infile, outfile, process_dir, rdp_script_dir, ref_db_dir='2.10.1'):
	
	
    logging.debug('CMD:> '+process_dir+'/public/scripts/'+os.path.basename(__file__)+' -i '+infile+' -o '+outfile+' --process_dir '+process_dir+' -ref_db '+ref_db_dir+' -script_dir '+rdp_script_dir)
    print('CMD:> '+process_dir+'/public/scripts/'+os.path.basename(__file__)+' -i '+infile+' -o '+outfile+' --process_dir '+process_dir+' -ref_db '+ref_db_dir+' -script_dir '+rdp_script_dir)
    #PATH_2_JAVA="/bioware/jre/bin/java";
    PATH_2_JAVA = "/usr/bin/java"
    #PATH_2_RDP = "/Users/avoorhis/programming/rdp_classifier"  # soft link to rdp_classifier
    #PATH_2_RDP = os.path.join(script_dir,"public","classifiers","rdp")  # soft link to rdp_classifier
          
    
    #PATH_2_DB  = os.path.join(process_dir,"public","databases","RDP",ref_db_dir)  # soft link to rdp_classifier
    try_file = os.path.join(process_dir,"public","databases","RDP",ref_db_dir,"rRNAClassifier.properties")
    if os.path.exists(properties_file):
        # for 'local' installation
        properties_file = os.path.join(process_dir,"public","databases","RDP",ref_db_dir,"rRNAClassifier.properties")
    else:
        # default configuration
        properties_file = os.path.join(rdp_script_dir,"train","rRNAClassifier.properties")

    #java -Xmx2400m -jar /xraid/bioware/linuxOpteron/rdp_classifier/rdp_classifier-1.0.jar $1 $2  /xraid/bioware/linuxOpteron/rdp_classifier/train/rRNAClassifier.properties
    #$PATH_2_JAVA -Xmx2400m -jar /usr/local/www/vampsdev/docs/apps/rdp_classifier-1.0.jar $1 $2  /usr/local/www/vampsdev/docs/apps/train3/rRNAClassifier.properties
    #$PATH_2_JAVA -Xmx2400m -jar $PATH_2_HERE/rdp_classifier-1.0.jar $1 $2 $PATH_2_HERE/train_may08/rRNAClassifier.properties
    #/usr/local/jdk/bin/java -Xmx2400m -jar $PATH_2_HERE/rdp_classifier-2.1.jar -q $1 -o $2 -t $PATH_2_HERE/train/rRNAClassifier.properties -f fixrank
    #$PATH_2_JAVA -Xmx2400m -jar $PATH_2_HERE/rdp_classifier_2.1/rdp_classifier-2.1.jar -q $1 -o $2 -t $PATH_2_HERE/train/rRNAClassifier.properties -f fixrank
    #$PATH_2_JAVA -Xmx2400m -jar $PATH_2_HERE/rdp_classifier_2.6/dist/classifier.jar -q $1 -o $2 -t $PATH_2_HERE/rdp_classifier_2.6/rRNAClassifier.properties -f fixrank

    # the classifier must be kept with its directory structure
    if os.path.exists(os.path.join(rdp_script_dir,'classifier.jar')):
        classifier_cmd = os.path.join(rdp_script_dir,'classifier.jar')
    else:
        classifier_cmd = os.path.join(rdp_script_dir,'rdp_classifier-2.2.jar')
    
    try:
        rdp_cmd = PATH_2_JAVA + " -Xmx2400m -jar "+classifier_cmd+" -q "+infile+" -o "+outfile+" -t "+properties_file+" -f fixrank"
        
        logging.debug('RDPCMD: '+rdp_cmd)
        print rdp_cmd

        subprocess.call(rdp_cmd, shell=True)

    except:
        print "ERROR in RDP:  java - classifier: "+rdp_cmd
        sys.exit(-23)


if __name__ == '__main__':
    import argparse



    myusage = """usage: rdp.py  [options]
     
         This is will start the (customized) python_pipeline
         for the GAST process, creating the vamps_* files
         for input to the new_vamps database.
     
         where
        
            -c/--config    REQUIRED path to config file.
                        


                      


       


    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
   
    parser.add_argument("-i", "--infile",             
    			required=True,  action="store",   dest = "infile",
                help="config file with path") 
    parser.add_argument('-o', '--outfile',         
    			required=True,   action="store",  dest = "outfile",            
                help = 'node database')                                           


    parser.add_argument('-ref_db', '--reference_db',
     			required=False,   action="store",  dest = "ref_db",
                 help = 'gast or rdp')
    parser.add_argument('-script_dir', '--script_dir',
                required=True,   action="store",  dest = "rdp_script_dir",
                 help = 'classifier.jar')
    # parser.add_argument("-ddir", "--data_dir",
    # 			required=True,  action="store",   dest = "baseoutputdir",
    #             help = '')
    parser.add_argument("-pdir", "--process_dir",
                required=False,  action="store",   dest = "process_dir", default='/',
                help = '')
    args = parser.parse_args() 



    #os.chdir(os.path.expanduser('~/programming/vamps-node.js'))
    #os.chdir(args.baseoutputdir)
    run_rdp(args.infile, args.outfile, args.process_dir,  args.rdp_script_dir, args.ref_db)


    
	
	
	
	